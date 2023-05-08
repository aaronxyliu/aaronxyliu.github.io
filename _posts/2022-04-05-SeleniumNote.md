---
title: Selenium Source Code Analysis
date: 2022-04-05 12:00:00 -500
categories: [web testing]
tags: [selenium, web, lang-en]
---


## W3C webdriver protocol

The “4.0” version of Selenium has recently been released. However, it is still an Alpha version. This means it is not stable enough in its development phase, hence its release is mainly for testing purposes as developers intend to fix any major defect that may be found. One of the most relevant aspects that come as part of this version is the implementation of the W3C standard. Basically, this is the reason why Selenium was upgraded to Version 4.

### Communication between WebDriver and Browser

When running a Selenium test, WebDriver needs to establish communication with the browser. So, in order to do that the browser and WebDriver have to use a set of rules that they both must share and respect. An analogy would be a conversation between two people. It is necessary that they both know and understand the same language. The same thing happens in Automation, they need a common language that both can understand. In this case, the language is called Protocol. Moreover, each browser has its own driver that knows the protocol and makes the communication between WebDriver and the browser possible.

### JSON Wire Protocol

The Protocol that Web Driver has been running for a long time is called JSON Wire Protocol. However, starting with Selenium 4 this protocol will no longer be supported. Although, there will be some scenarios where Selenium still provides mechanisms for people to use the former protocol. This may be done through the Java Bindings and Selenium Server. This legacy support provides backward compatibility to organizations that can’t run their cases using the new protocol. These issues could mainly happen either in old infrastructure or when using old driver versions.

![]({{site.url}}/assets/img/2022-04-05/WebDriver-W3C-Protocol.png)

### WebDriver W3C Protocol

The new protocol is called: “WebDriver W3C”. It has received the endorsement of the “World Wide Web Consortium” (W3C). This is an international community that works to develop Web standards. The creation of this protocol started 6 years ago and just one year ago it finally became a standard. W3C is fractionally different from the original protocol. The major differences are around how you create a new session and how you can do element interactions using the actions API. The most important difference in the actions API is that you can now do multiple actions simultaneously.

## How the does test code work?

The `capabilities.js` file defines types related to describing the capabilities of a WebDriver session.

First, need to initiate the driver.

``` js
const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();
```

**Builder** class is defined in `index.js` file. 

``` js
class Builder {
  forBrowser(name, opt_version, opt_platform) {
    this.capabilities_.setBrowserName(name)
    ...
    return this
  }
  
  build() {
    // Create a copy for any changes we may need to make based on the current
    // environment.
    const capabilities = new Capabilities(this.capabilities_)
    let browser = capabilities.get(Capability.BROWSER_NAME)
	
    // Check for a native browser.
    switch (browser) {
      ...
      case Browser.FIREFOX: {
        return firefox.Driver.createSession(capabilities)
      }
      ...
    }
  }
}
```

Then we go to the `firefox.js` file.

``` js
class Driver extends webdriver.WebDriver {
  static createSession(opt_config, opt_executor) {
    let caps = opt_config
    let service = new ServiceBuilder().build()
    let executor = createExecutor(service.start())
    let onQuit = () => service.kill()
    }

    return /** @type {!Driver} */ (super.createSession(executor, caps, onQuit))
  } 
}

function createExecutor(serverUrl) {
  let client = serverUrl.then((url) => new http.HttpClient(url))
  let executor = new http.Executor(client)
  configureExecutor(executor)
  return executor
}
```

**createSession** function's job is to create a new Firefox session.  First, it use **firefox.ServiceBuilder** to initialize a  **remote.DriverService** instance, which manages the life and death of a native executable WebDriver server. We can find **remote.DriverService** class definition in `remote/index.js` file. Then, `service.start()` sentence will start the server and return the server's base URL. Based on the server's URL, **createExecutor** function is invoked to create an executor. In this function, it initializes a HttpClient and a http.executor.

Selenium defines a command executor that communicates with a remote end using JSON over HTTP in `lib/http.js` file.

``` js
class Executor {
  async execute(command) {
    let request = buildRequest(this.customCommands_, this.w3c, command)
    let client = CLIENTS.get(this)
    let httpResponse = await client.send(request)
    let { isW3C, value } = parseHttpResponse(command, httpResponse)
    return typeof value === 'undefined' ? null : value
  }
}
```





In `capabilities.js` file, we can find all the browser values we can use.

``` js
const Browser = {
  CHROME: 'chrome',
  EDGE: 'MicrosoftEdge',
  FIREFOX: 'firefox',
  INTERNET_EXPLORER: 'internet explorer',
  SAFARI: 'safari',
  OPERA: 'opera',
}
```



Then, we need to find the web element using driver.

``` js
driver.findElement(By.name('q')).sendKeys('webdriver');
```

``` js
class By {
  constructor(using, value) {
    /** @type {string} */
    this.using = using

    /** @type {string} */
    this.value = value
  }
    
  static css(selector) {
    return new By('css selector', selector)
  }

  static name(name) {
    return By.css('*[name="' + escapeCss(name) + '"]')
  }
}
```



``` js
class WebDriver {
  findElement(locator) {
    let id
    let cmd = null

    if (locator instanceof RelativeBy) {
      cmd = new command.Command(
        command.Name.FIND_ELEMENTS_RELATIVE
      ).setParameter('args', locator.marshall())
    } else {
      locator = by.checkedLocator(locator)
    }

    if (typeof locator === 'function') {
      id = this.findElementInternal_(locator, this)
      return new WebElementPromise(this, id)
    } else if (cmd === null) {
      cmd = new command.Command(command.Name.FIND_ELEMENT)
        .setParameter('using', locator.using)
        .setParameter('value', locator.value)
    }

    id = this.execute(cmd)
    if (locator instanceof RelativeBy) {
      return this.normalize_(id)
    } else {
      return new WebElementPromise(this, id)
    }
  }
    
  async execute(command) {
    command.setParameter('sessionId', this.session_)
    let parameters = await toWireValue(command.getParameters())
    command.setParameters(parameters)
    let value = await this.executor_.execute(command)
    return fromWireValue(this, value)
  }
}
```

