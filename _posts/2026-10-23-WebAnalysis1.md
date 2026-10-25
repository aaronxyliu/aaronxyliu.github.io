---
title: "Web Program Analysis I: From a URL to an Interaction"
date: "2026-10-23 09:00:00 +0800"
description: "Follow a small search page from loading to interaction, and learn where web code runs, how events trigger execution, and how data crosses the browser/server boundary."
categories: [Theory, Web Program Analysis]
tags: [note, lang-en, SE, javascript, Security]
---

A student opens a search page, types `books`, and clicks Search. A moment later, a result appears. The page has only a few elements, and its JavaScript fits on one screen. Yet when asked where the search happens, the student hesitates. Does the browser run the server's code? Does clicking the button reload the document? And while the request is waiting for a response, has the whole program stopped?

These questions come before vulnerability detection. To decide whether untrusted data can reach a dangerous operation, we first need to know which program receives the data, what starts its execution, and how its results reach the page.

This series is written for students who know basic programming but are new to web program analysis. We will gradually connect web security to abstract syntax trees, control-flow graphs, call graphs, and dataflow analysis. Large language models (LLMs) will help us read unfamiliar code and build small analyzers. The concepts will help us ask precise questions and check the answers.

The first article starts with a smaller task: explain one interaction completely. By the end, you should be able to follow a value from an input element, through an HTTP request and response, and back into the page. You should also be able to distinguish what the code tells us from what a particular execution demonstrates.

---

## 1. Start with a page we can explain

Our running example is a small search page. Opening it displays an input field, a button, and an empty results area. Clicking Search sends the input to a server, which returns a message for the browser to display.

Save the following document as `index.html` if you want to run the example. A minimal local server appears near the end of this article.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>A small search page</title>
    <script src="/app.js" defer></script>
  </head>
  <body>
    <label for="query">Search terms</label>
    <input id="query" placeholder="Search">
    <button id="search" type="button">Search</button>
    <div id="results" aria-live="polite"></div>
  </body>
</html>
```

The JavaScript, saved as `app.js`, connects these elements to the search behavior:

```javascript
const input = document.querySelector("#query");
const button = document.querySelector("#search");
const results = document.querySelector("#results");

async function handleSearch() {
  const query = input.value;
  const url = `/api/search?q=${encodeURIComponent(query)}`;

  results.textContent = "Loading...";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    results.textContent = data.message;
  } catch {
    results.textContent = "Search failed.";
  }
}

button.addEventListener("click", handleSearch);
```

You do not need to understand every expression immediately. First, identify three activities: the script finds page elements, registers a function for a future click, and defines what that function will do.

For the initial discussion, assume one click, a successful request, and a JSON response containing a string field named `message`. We will return to failures and repeated interactions later.

## 2. Where does the program run?

A web application usually contains code executing in at least two environments: the browser and the server. They cooperate, but they do not form one shared execution.

| Environment | Responsibilities in our example | State it can directly access |
| --- | --- | --- |
| Browser | Display the document, handle clicks, send requests, update results | DOM objects and variables in the page's JavaScript environment |
| Server | Receive the search request and construct a response | Its own variables and any resources available to its implementation |

The browser downloads `app.js` and executes it locally. The server executes separate code to handle `/api/search`. The browser does not automatically receive that server implementation.

Even if both programs use JavaScript, their variables are separate. A browser variable named `query` and a server variable named `query` do not become the same storage location. A value crosses the boundary when one side encodes it into a message and the other side interprets that message.

```text
Browser                                      Server
-------                                      ------
read input.value
construct request  ------ HTTP request ----> read request parameter
                                             construct response
receive response   <----- HTTP response ---- return JSON
update the DOM
```

Here, “server” describes a role. In the local exercise, both roles run on your computer, but they still have separate execution state.

> When reading web code, first ask: which environment executes this statement, and what can that environment directly observe or change?
{: .prompt-tip}

This question also keeps us from inventing missing behavior. A request to `/api/search` tells us the destination and the data being sent. It does not establish that the server uses a database, checks permissions, or searches any particular collection.

## 3. What happens when the page loads?

Opening the page starts a sequence of requests and computations. A simplified account is:

1. The browser requests the document.
2. The server returns HTML.
3. The browser parses the HTML and builds a document representation.
4. It discovers the script reference and fetches `app.js`.
5. The script executes and registers the click handler.

Fetching the script can overlap HTML parsing; the steps describe dependencies rather than an instruction to finish every activity before starting the next.

### 3.1 Read an HTTP exchange

HTTP is the message protocol used for these requests and responses. In a simplified HTTP/1.1 notation, the document request looks like this:

```http
GET / HTTP/1.1
Host: localhost:3000
```

The server returns a response with a status, headers, and a body:

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!doctype html>
...
```

`GET` is the request method. `/` is the requested path. `200` indicates success, and `Content-Type` identifies the body's media type. The blank line separates the headers from the body.

Later, clicking Search with `books` in the input produces a different request:

```http
GET /api/search?q=books HTTP/1.1
Host: localhost:3000
```

Here, `/api/search` is the path and `q=books` is the query string. A successful response might contain:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"message":"Results for books"}
```

The HTML document, JavaScript file, and search response are separate resources. Receiving the JSON response does not itself replace the page. Our JavaScript reads that response and decides what to update.

### 3.2 Why does the script use `defer`?

The script is referenced in the document's `head`, before the input and button appear in the HTML. Yet its first statements immediately search for those elements.

For this external classic script, `defer` allows fetching alongside parsing and schedules execution after the document has been parsed. By that point, the elements used by our script exist. Without `defer`, a classic script in this position can execute before those later elements have been created. The distinction is documented in MDN's [script element reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script).

Script configuration therefore affects the execution story. It is not enough to read JavaScript statements while ignoring how the document loads them.

## 4. The DOM: a document becomes program state

HTML describes the initial document. The browser exposes that document through the **Document Object Model (DOM)**: objects representing elements, text, and their relationships. JavaScript can inspect and modify these objects through browser APIs. MDN's [DOM introduction](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) describes this interface in more detail.

A simplified tree for our page is:

```text
document
└── html
    ├── head
    │   ├── meta
    │   ├── title
    │   └── script
    └── body
        ├── label
        ├── input#query
        ├── button#search
        └── div#results
```

The following statement finds the input element and stores a reference to its DOM object:

```javascript
const input = document.querySelector("#query");
```

The selector `#query` means “the element whose ID is `query`.” Reading `input.value` obtains its current input value. The object remains the same while the user edits the field, but its `value` property changes.

Similarly:

```javascript
results.textContent = "Loading...";
```

changes the contents of the results element. The browser can update the displayed page from this changed state without requesting a new document.

Three objects should remain distinct:

| Object | What it represents |
| --- | --- |
| HTML source | Markup received for the document |
| Current DOM | The document objects after parsing and subsequent changes |
| JavaScript source | Instructions that can read or change those objects |

The DOM tree is also different from a JavaScript **abstract syntax tree (AST)**. The former represents the document; the latter represents the structure of code. Both are trees, but their nodes describe different things. We will introduce ASTs in Post 4.

## 5. Who calls the event handler?

At the bottom of `app.js`, we write:

```javascript
button.addEventListener("click", handleSearch);
```

This statement registers `handleSearch` as a callback for click events on the button. It passes the function as a value. It does not execute the function body immediately.

Compare:

```javascript
handleSearch(); // Call the function now.
```

with:

```javascript
button.addEventListener("click", handleSearch); // Register it for later.
```

When a click event is dispatched to the button, the browser's event machinery invokes the registered callback. Our application has not written a direct `handleSearch()` call for that interaction, but the function still executes.

This matters when we later construct call graphs. Searching only for direct calls in application text would miss relationships introduced through callback registration.

It also explains an important detail of our example: the query is read inside the handler. If you type `books`, change it to `papers`, and then click Search, the handler reads `papers`. Registering the callback did not capture a snapshot of the input text.

## 6. Does waiting for the server stop the page?

Once the callback starts, it reads the input, constructs a URL, and changes the results text. It then reaches:

```javascript
const response = await fetch(url);
```

`fetch` initiates an asynchronous request and returns a **promise**, an object representing its eventual outcome. `await` suspends the current async function until that outcome is available; it does not block the entire browser while the network is pending. Once the current execution yields, other work can be processed before this function resumes. See MDN's [explanation of `await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await).

For a successful search, the sequence is:

```text
Click event
  → handleSearch starts
  → read the input and construct the URL
  → change results.textContent to "Loading..."
  → initiate fetch and suspend the handler
      ... the network request proceeds ...
  → resume with a Response object
  → check the HTTP status
  → await parsing of the response body
  → resume with the parsed data
  → update results.textContent
```

### 6.1 Receiving a response and reading its body are separate

The first `await` provides a `Response` object. The body may still be arriving. This second statement reads and parses the body as JSON:

```javascript
const data = await response.json();
```

For our assumed response, `data` becomes an object whose `message` property is `"Results for books"`. JSON parsing does not verify that every server response follows that structure; a real application may also need to check the returned fields.

### 6.2 Failure is part of the execution story

An HTTP error status such as `404` does not, by itself, make `fetch` reject its promise. Our code explicitly checks `response.ok`, which is true for statuses in the 200–299 range. A failed status causes us to throw an error. A network failure or invalid JSON can also lead to the `catch` block. These behaviors are explained in MDN's [Fetch API guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

In those cases, the page displays `Search failed.` instead of the result message. A trace that records only successful statements leaves out part of the program's behavior.

### 6.3 Two clicks can produce two overlapping requests

Our handler does not disable the button. A second click can start another search while the first invocation is suspended. If their responses arrive in a different order, an older result can overwrite a newer one.

We do not need to solve that issue yet. It gives us a useful boundary for the first trace: we are explaining one interaction, not claiming that every interaction finishes in the order it started. Asynchronous execution is about when work can proceed and resume; it is not a guarantee of response order.

## 7. Follow the value as well as the execution

We now know which actions happen and what triggers them. Turn to a different question: where does the search text go?

| Stage | Representation of the value | Environment |
| --- | --- | --- |
| Input | `input.value` contains `books` | Browser DOM |
| Local computation | `query` contains a string read from the input | Browser JavaScript |
| Request construction | `url` contains `/api/search?q=books` | Browser JavaScript |
| Communication | The query string carries the encoded parameter | HTTP request |
| Request handling | Server code reads and processes the parameter | Server |
| Communication | A JSON body carries the response message | HTTP response |
| Response processing | `data.message` contains the parsed field | Browser JavaScript |
| Output | `results.textContent` receives that field | Browser DOM |

For text such as `books & papers`, `encodeURIComponent` encodes characters that would otherwise change the structure of the query string. That operation prepares a value for a URL component. It does not establish that the value is suitable for every later use on the server or in the page.

Notice the difference between the two views we have built:

- **Execution order:** what can run next, and what must happen before it runs?
- **Data movement:** which values influence a request, response, or output?

A click triggers execution, but it does not supply the search string in our code. The handler obtains that string by reading the input. Likewise, a response makes more work possible, but the value displayed comes specifically from `data.message`.

These distinctions will become control-flow and dataflow questions later. For now, a diagram and a table are sufficient.

> Trace the steps and trace the values separately. Then connect them: which step reads, transforms, sends, receives, or displays each value?
{: .prompt-tip}

The example writes the response through `textContent`, so the message is inserted as text. Later articles will investigate how changing the output operation changes the security question. We first need an accurate account of the ordinary behavior.

## 8. Ask an LLM for an explanation, then inspect the evidence

An LLM can help organize this investigation. Give it the HTML and JavaScript, then ask a question with a defined scope:

```text
Explain one search interaction using only the supplied HTML and JavaScript.

1. Identify which statements execute in the browser.
2. Trace a click from callback invocation to the final DOM update.
3. Trace the input value through the request and response processing.
4. Cite the statement supporting each step.
5. Separate facts visible in the code from assumptions about the server.
6. Include the error path and explain where execution suspends.
```

An explanation that says “the server searches a database” goes beyond the supplied evidence. The request path suggests a purpose, but only the server implementation can establish how it handles the request. Ask the model to identify that gap rather than fill it with a plausible story.

Next, compare the explanation with an actual execution. Browser developer tools offer three complementary views:

| Tool | What to inspect | What it supports |
| --- | --- | --- |
| Network panel | Request URL, status, response body, initiating script | Evidence about requests made during the observed interaction |
| Sources / Debugger panel | A breakpoint inside `handleSearch`, local values, call stack | Evidence about the paused execution |
| Elements panel | The results element before and after the response | Evidence about the current DOM |

Open developer tools before the experiment. In Network, reload the page and identify the document and script requests. Then clear the log, type `books`, and click Search. Inspect the API request and its response. In the debugger, pause on the statement that reads `input.value` and inspect the value before stepping onward. Finally, inspect the updated results element.

If you want to observe the loading state, use network throttling. If you want to inspect a failure, use the Network panel's request-blocking feature for the API URL and repeat the click. Remove the block afterward.

The tools and the model answer different parts of the question. Code inspection describes behavior under stated assumptions. A browser observation records what happened during one execution. Neither a convincing explanation nor one successful run establishes all possible behavior.

## 9. Run the example locally

To make the observations reproducible, place `index.html` and `app.js` in one folder. Add the following `server.mjs` in the same folder. It uses Node.js built-in modules and requires no additional packages.

```javascript
import http from "node:http";
import { readFile } from "node:fs/promises";

const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
]);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost:3000");

    if (url.pathname === "/api/search") {
      const query = url.searchParams.get("q") ?? "";
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify({ message: `Results for ${query}` }));
      return;
    }

    const file = files.get(url.pathname);
    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const [name, contentType] = file;
    const body = await readFile(new URL(name, import.meta.url));
    res.writeHead(200, { "Content-Type": contentType });
    res.end(body);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Open http://127.0.0.1:3000");
});
```

From that folder, run:

```shell
node server.mjs
```

Open `http://127.0.0.1:3000` in a browser. Type `books` and click Search. You should see `Results for books`. Stop the server with `Ctrl+C` when finished.

This implementation reveals something the browser code alone could not tell us: our example server simply constructs a message from the decoded parameter. It performs no database search. The name of an endpoint and the text of a button are clues about intent; the implementation provides evidence about behavior.

The page and API also use the same origin here: the same scheme, host, and port. The relative request URL therefore reaches this server without introducing a separate cross-origin configuration problem.

## 10. Check your execution model

Before continuing, try answering these questions without running the code:

1. Why does opening the page fetch `app.js` but not immediately request `/api/search`?
2. If the input changes after the handler is registered, which value does a later click read?
3. Where is the search text represented while it travels from the browser to the server and back?
4. What happens if the server returns an HTTP error? What happens if it returns invalid JSON?
5. Can two clicks start overlapping requests? Does their start order determine their completion order?
6. Before seeing `server.mjs`, which claims about server behavior were justified?

A useful exercise is to draw two columns, one for the browser and one for the server. Connect them with request and response arrows. Inside the browser column, mark the callback registration, the click, each suspension, and the final DOM change. Label the arrows with the data they carry.

You can compare your drawing with this abbreviated trace:

```text
Page load → parse HTML → execute deferred script → register callback

Click → read current input → construct request → suspend
                              |
                              v
                    server handles request
                              |
                              v
Resume → check status → await JSON body → update DOM
             \                 \
              +----- errors ----+----→ display failure
```

What matters is the explanation behind the arrows: which environment owns the state, what starts each computation, and which value moves at each step.

## 11. From execution to security questions

We have followed a small application through document loading, callback registration, an asynchronous request, and a DOM update. The same three questions will guide the rest of the series:

1. **Where does the code execute?**
2. **What causes it to execute?**
3. **Which data does it read, transform, or write?**

These questions give us a foundation for reviewing both handwritten code and explanations generated by an LLM. An answer becomes useful when its statements can be connected to code, runtime evidence, or an explicitly stated assumption.

There is one assumption we have not examined: the server received a request created by our page's handler. A client can also construct a different request, change its parameters, or bypass the page entirely.

**What can the server safely assume about incoming data, and whose behavior must the application be prepared to handle?**

That is the starting point of the next article, *What Makes a Program Vulnerable?* We will move from explaining an ordinary interaction to identifying assets, attacker capabilities, entry points, and trust boundaries.
