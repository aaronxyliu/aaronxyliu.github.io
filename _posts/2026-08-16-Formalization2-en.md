---
title: "Formalization in Software Engineering (2): Where Can a Program Go? From Code and CFGs to Program Semantics"
date: "2026-08-16 13:13:00 +0800"
description: "Learn to read configurations and inference rules by following a program's control flow and changing state."
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-en, SE]
lang: en
translation_key: formalization-2
permalink: /posts/Formalization2-en/
series_navigation:
  previous: /posts/Formalization1-en/
  next: /posts/Formalization3-en/
---

When we read a program, it is natural to follow the code from top to bottom. An analyzer has to consider more than that one route. A condition introduces branches, a loop brings execution back to an earlier point, and an exception or return statement may end execution early.

To analyze a program, we first need to describe where execution can go, then explain how each step changes the program state. Those are the two questions this article follows: where can the program go, and what state will it be in when it gets there?

In Part 1, we represented a program state as a mapping from variables to values:

$$
\sigma:X\rightarrow V
$$

But defining what a state contains is only part of the story. We also need to ask:

> **In what order does the program execute, and how do its states change along the way?**

Static analysis, program testing, and vulnerability analysis often begin by converting source code into a **control-flow graph (CFG)**, then defining states and execution rules over that graph. The CFG describes possible next locations; the semantic rules describe what happens to the state at each step.

We will work through the following sequence:

$$
\text{source code}
\longrightarrow
\text{CFG}
\longrightarrow
\text{configuration}
\longrightarrow
\text{semantic rules}
\longrightarrow
\text{state transitions}.
$$

We begin with why analyzers use CFGs. We then combine a program location with a state to form a configuration, and use inference rules to describe execution. Finally, we compare small-step, big-step, and denotational-style semantics to see what each helps us describe.

For now, we are still describing **concrete program semantics**. Abstract domains, lattices, and fixed points come later in the series. They are easier to approach once we understand how states move through a CFG.


---

## 1. Turning a program into a graph

### 1.1 Why use a CFG?

Start with a small program:

```javascript
x = 1;
if (flag) {
    y = x + 1;
} else {
    y = x - 1;
}
z = y * 2;
```

We can draw its control flow like this:

```text
        x = 1
          |
       if(flag)
       /      \
      /        \
 y = x + 1   y = x - 1
      \        /
       \      /
       z = y * 2
```

The graph leaves out the source code's formatting but keeps information that matters to an analyzer:

1. Where execution may go after a statement finishes.
2. Which statements may occur on the same execution path.
3. Where execution branches.
4. Where the branches meet again.
5. Whether an edge leads back to an earlier node, forming a loop.

These questions arise in many areas of software engineering research, including:

- data-flow analysis;
- taint analysis;
- program slicing;
- symbolic execution;
- test coverage analysis;
- defect and vulnerability detection;
- program transformation and optimization.

As a first approximation, think of a CFG as:

> **A skeleton of the possible orders in which a program can execute.**
{: .prompt-tip}

It need not capture every run-time detail. Its job is to describe where control may flow.

---

### 1.2 Defining a CFG as a graph

**A common definition.**

One common mathematical definition is:

$$
G=(N,E,n_{entry},n_{exit}).
$$

Here:

- $N$ is the set of CFG nodes;
- $E\subseteq N\times N$ is the set of control-flow edges;
- $n_{entry}\in N$ is the entry node;
- $n_{exit}\in N$ is the normal exit node.

Suppose:

$$
N=\{n_1,n_2,n_3,n_4\},
$$

with the following control flow:

```text
n1 → n2 → n3
      |
      └──→ n4
```

Then:

$$
E=\{(n_1,n_2),(n_2,n_3),(n_2,n_4)\}.
$$

An edge

$$
(n_i,n_j)\in E
$$

means that control may move to $n_j$ after executing node $n_i$.

**Why write $E\subseteq N\times N$?**

Part 1 introduced the Cartesian product. $N\times N$ contains every possible pair of nodes:

$$
N\times N
=
\{(n_i,n_j)\mid n_i\in N,n_j\in N\}.
$$

A CFG usually contains only some of those connections, so we write:

$$
E\subseteq N\times N.
$$

In words:

> Each control-flow edge is a pair of nodes, but not every pair of nodes has an edge between them.

**Nodes are often described as program locations.**

Instead of $n$, a program analysis paper may use:

$$
\ell\in L,
$$

where $L$ is the set of program locations, or labels.

For example:

```text
ℓ1: x = 1
ℓ2: if(flag)
ℓ3: y = x + 1
ℓ4: y = x - 1
ℓ5: z = y * 2
```

The CFG can then be written as:

$$
G=(L,E,\ell_{entry},\ell_{exit}).
$$

$N$ and $L$ often play similar roles. One emphasizes graph nodes; the other emphasizes program locations. Neither name is compulsory. Check how the paper defines it.

---

After identifying the nodes and edges, check what program information each node carries. A node may represent one instruction or a basic block containing several instructions.

A common approach is to add:

$$
inst:L\rightarrow I,
$$

Here:

- $L$ is the set of program locations;
- $I$ is the set of instructions;
- $inst(\ell)$ is the instruction at location $\ell$.

For example:

$$
inst(\ell_1)=x:=1,
$$

$$
inst(\ell_2)=if(flag).
$$

The CFG now becomes:

$$
G=(L,E,inst,\ell_{entry},\ell_{exit}).
$$

This form lets the author refer directly to an instruction when defining an analysis:

> At location $\ell$, apply a transfer function to instruction $inst(\ell)$.

That connects the graph structure to the semantic rules.

**Basic blocks: one node can hold several instructions.**

Compilers and static analysis tools often group instructions into a **basic block**: a sequence entered at its beginning, with no branching except at the end.

For example:

```javascript
x = 1;
y = x + 2;
z = y * 3;
```

These instructions could all belong to one basic block:

```text
B1:
    x = 1
    y = x + 2
    z = y * 3
```

If $I$ is the instruction set, then a basic block is an instruction sequence, an element of:

$$
I^*,
$$

Some papers therefore define:

$$
block:L\rightarrow I^*.
$$

Each label then identifies a sequence of instructions, rather than necessarily a single instruction.

**Why do CFG definitions differ between papers?**

You might see:

$$
G=(V,E),
$$

or:

$$
G=(N,E,n_{entry},n_{exit}),
$$

or a more detailed definition:

$$
G=(L,E,inst,\ell_{entry},\ell_{exit}).
$$

These definitions are compatible. Each author includes the information needed for the analysis that follows.

Some work uses an even more compact representation:

$$
G:L\rightarrow I.
$$

The control-flow edges are no longer stored separately as:

$$
E\subseteq L\times L,
$$

Instead, successor locations are part of each instruction. For example:

```text
ℓ1: x = 1; goto ℓ2

ℓ2: if(flag)
        goto ℓ3
        goto ℓ4

ℓ3: y = x + 1; goto ℓ5

ℓ4: y = x - 1; goto ℓ5
```
Each label identifies an instruction, and the instruction records where execution goes next.

This is closer to a compiler's intermediate representation (IR). It also makes it convenient to define:

- how executing an instruction changes the state;
- how states propagate through control flow;
- the rules of an analysis.


---

### 1.3 Control flow is more than line order

**Conditional branches.**

Consider:

```javascript
if (x > 0) {
    y = 1;
} else {
    y = -1;
}
z = y + 1;
```

Its control flow is:

```text
        if(x > 0)
        /        \
       /          \
    y = 1        y = -1
       \          /
        \        /
        z = y + 1
```

Although `y = 1` appears before `y = -1` in the source file, a particular execution takes only one of the two branches.

An analyzer cannot simply connect every statement in line-number order.

**Loops and back edges.**

Now consider:

```javascript
while (x > 0) {
    x = x - 1;
}
y = x;
```

Its CFG looks roughly like this:

```text
          ┌──────────────┐
          ↓              |
      if(x > 0)          |
       /      \           |
    true      false       |
     |          |         |
 x = x - 1   y = x       |
     |                    |
     └────────────────────┘
```

The edge that returns from the loop body to the condition is commonly called a **back edge**.

Back edges will matter when we study data-flow analysis and fixed points. A node may receive information more than once: a state can travel around the loop and reach the node again.

**Returns, exceptions, and multiple exits.**

A real program may also contain:

```javascript
if (error) {
    throw err;
}
if (done) {
    return result;
}
work();
```

Some papers therefore distinguish:

$$
\ell_{entry},
\qquad
\ell_{exit},
\qquad
\ell_{exc},
$$

for the entry, normal exit, and exceptional exit, respectively.

Whether these special nodes are useful depends on the research question. An exceptional exit matters when studying exception propagation, resource cleanup, or error paths. A simpler local analysis may leave it out.

---

## 2. A program has both a location and a state

Part 1 defined a program state as:

$$
\sigma:X\rightarrow V.
$$

For example:

$$
\sigma=\{x\mapsto1,y\mapsto2\}.
$$

This tells us the current values of the variables, but not where execution has reached.

The same state can occur at different program locations, with very different behavior to follow. Formal semantics therefore often combines the **current location** with the **current state**.

**Configurations.**

A common notation is:

$$
\langle \ell,\sigma\rangle.
$$

This is a **configuration**. Read it as:

> The program is at location $\ell$, with state $\sigma$.

If the definition works directly with statements rather than CFG labels, it may instead use:

$$
\langle s,\sigma\rangle.
$$

For example:

$$
\langle x:=x+1,\sigma\rangle
$$

means that `x = x + 1` is about to execute in state $\sigma$.

**Angle brackets are a notation convention.**

The expression

$$
\langle a,b\rangle
$$

is an ordered combination, much like $(a,b)$.

Programming language and program analysis papers often use angle brackets for configurations. What matters is the information inside them.

---

## 3. Describing execution with operational semantics

### 3.1 Small steps and assignment

Operational semantics describes:

> **How a program executes.**

Small-step semantics divides execution into local steps. A typical form is:

$$
\langle s,\sigma\rangle
\rightarrow
\langle s',\sigma'\rangle.
$$

Read this as:

> After one step, statement $s$ in state $\sigma$ becomes statement $s'$ in state $\sigma'$.

Here $\rightarrow$ denotes a **one-step transition relation**.

Compare it with the function declaration from Part 1:

$$
f:A\rightarrow B
$$

The arrows have different meanings. One describes a step of execution; the other gives a function's input and output domains. Papers frequently reuse a symbol in different contexts.

---

Assignment is a useful first example of a transition rule because its effect on the state is easy to see.

Consider:

```javascript
x = e;
```

A typical small-step rule is:

$$
\frac{[\![e]\!](\sigma)=v}
{\langle x:=e,\sigma\rangle
\rightarrow
\langle skip,\sigma[x\mapsto v]\rangle}.
$$

This notation, with expressions above and below a horizontal line, is an **inference rule**.

The premise is above the line; the conclusion is below it.

We can read this rule as follows:

1. Evaluate expression $e$ in the current state $\sigma$ to obtain $v$.
2. Update $x$ to $v$, leaving the other variables unchanged.
3. Replace the completed assignment with `skip`.

This rule treats expression evaluation as a helper operation. A more detailed small-step semantics could also break the evaluation of $e$ into individual steps.

The corresponding pseudocode is short:

```python
v = eval(e, state)
state[x] = v
```

**What is `skip`?**

`skip` usually means “do nothing” or marks a statement that has finished executing.

It is part of the small language used in the semantic definition, rather than a keyword in JavaScript, Python, or C.

For example:

$$
\langle skip;s_2,\sigma\rangle
\rightarrow
\langle s_2,\sigma\rangle
$$

means that the first statement has finished and execution continues with $s_2$.

---

### 3.2 Rules for sequences and conditions

Suppose the program is:

$$
s_1;s_2.
$$

If $s_1$ can take a step:

$$
\langle s_1,\sigma\rangle
\rightarrow
\langle s_1',\sigma'\rangle,
$$

then the whole sequence can take the following step:

$$
\frac{
\langle s_1,\sigma\rangle
\rightarrow
\langle s_1',\sigma'\rangle
}
{
\langle s_1;s_2,\sigma\rangle
\rightarrow
\langle s_1';s_2,\sigma'\rangle
}.
$$

The rule says:

> **Let $s_1$ take a step; leave $s_2$ alone for now.**

The transition relation makes the order explicit: we continue working on the first statement before moving on to the second.

---

The sequence rule tells us how two pieces of code fit together. A conditional selects a branch according to its guard, the expression being tested.

Consider the conditional:

```javascript
if (e) {
    s1;
} else {
    s2;
}
```

We define separate rules for a true and a false condition.

If the condition is true:

$$
\frac{[\![e]\!](\sigma)=true}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\rightarrow
\langle s_1,\sigma\rangle
}.
$$

If the condition is false:

$$
\frac{[\![e]\!](\sigma)=false}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\rightarrow
\langle s_2,\sigma\rangle
}.
$$

These rules correspond to the two outgoing edges of the CFG's `if` node.

We can now see how the CFG and operational semantics fit together:

```text
 current location + current state
                ↓
          execution rule
                ↓
  successor location + new state
```

The CFG describes possible destinations; the semantic rules describe the state changes along the way.

---

### 3.3 Reading an inference rule

An inference rule has the general form:

$$
\frac{P_1\qquad P_2\qquad\cdots\qquad P_n}{C}.
$$

It means:

> If $P_1,\ldots,P_n$ all hold, we may conclude $C$.

For example:

$$
\frac{x>0\qquad y>0}{x+y>0}.
$$

In program semantics, a premise may say that:

- an expression evaluates to a certain value;
- a subprogram has finished executing;
- a condition holds;
- a state satisfies a constraint.

The conclusion specifies the transition the program can take.

You may also see labels beside the rules:

```text
[Assign]
[If-True]
[If-False]
[Call]
[Return]
```

These are names used to refer to the rules in the text. They do not add any semantics of their own.

**A reading order for inference rules.**

For a long rule, try this order:

1. Read the conclusion: what is this rule defining?
2. Read the premises: what must hold for that conclusion?
3. Check the syntax: which statement or expression does the rule apply to?
4. Identify the parts of the state that change.

This is often easier than reading every symbol from left to right.

---

Small-step semantics fits naturally with CFGs because it keeps track of program locations and individual state changes.

It describes execution as:

$$
C_0\rightarrow C_1\rightarrow C_2\rightarrow\cdots,
$$

where each $C_i$ is a configuration.

The correspondence with a CFG is direct:

```text
 current node + current state
              ↓
 perform one local operation
              ↓
  successor node + new state
```

Small-step semantics is a useful choice when the research question concerns:

- the state before and after a statement;
- which CFG edge an execution takes;
- the step at which an exception occurs;
- how thread executions interleave;
- whether a transformation preserves local behavior;
- how symbolic execution extends a path condition step by step.

The cost is the number of rules: defining small-step semantics for a full language can take a great deal of work.

Software engineering papers therefore often choose a smaller scope:

> **Formalize the syntax and behavior relevant to the research question.**
{: .prompt-tip}

That is why a static analysis paper may define assignments, branches, calls, and returns without giving a complete semantics for JavaScript or C.

---

## 4. More compact descriptions of execution

### 4.1 Big-step semantics: describing the result

If we care about the result of executing a piece of code, rather than every intermediate step, we can use **big-step semantics**, also called natural semantics.

A common notation is:

$$
\langle s,\sigma\rangle
\Downarrow
\sigma'.
$$

Read this as:

> Starting in state $\sigma$, statement $s$ executes to completion and produces state $\sigma'$.

**Assignment.**

The assignment rule can be written as:

$$
\frac{[\![e]\!](\sigma)=v}
{
\langle x:=e,\sigma\rangle
\Downarrow
\sigma[x\mapsto v]
}.
$$

Instead of first reducing the assignment to `skip`, this rule gives the final state directly.

**Sequential execution.**

Consider a sequence of two statements:

$$
s_1;s_2,
$$

Its semantics is:

$$
\frac{
\langle s_1,\sigma\rangle\Downarrow\sigma_1
\qquad
\langle s_2,\sigma_1\rangle\Downarrow\sigma_2
}
{
\langle s_1;s_2,\sigma\rangle\Downarrow\sigma_2
}.
$$

Read the rule as follows:

1. Execute $s_1$ from $\sigma$ to obtain $\sigma_1$.
2. Execute $s_2$ from $\sigma_1$ to obtain $\sigma_2$.
3. The whole sequence $s_1;s_2$ therefore produces $\sigma_2$.

**Conditionals.**

For a true condition:

$$
\frac{
[\![e]\!](\sigma)=true
\qquad
\langle s_1,\sigma\rangle\Downarrow\sigma'
}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\Downarrow\sigma'
}.
$$

Selecting the true branch is folded into the derivation, rather than represented as a separate step before executing $s_1$.

---

Small-step semantics records the intermediate steps. Big-step semantics relates a piece of code directly to its final state.

The difference is the level of detail at which they describe execution.

| Form | Question | What it records |
| --- | --- | --- |
| Small-step | What happens next? | Individual steps and intermediate states |
| Big-step | What is the result? | A complete evaluation in a compact form |

For example:

```text
1 + 2 * 3
```

A small-step description is:

```text
1 + 2 * 3
→ 1 + 6
→ 7
```

A big-step description gives the result directly:

$$
1+2*3\Downarrow7.
$$

When reading a software engineering paper, the following rule of thumb helps:

- For **paths, intermediate states, exceptions, and thread interleavings**, small-step semantics is often convenient.
- For **inputs and final outputs**, big-step semantics is often more concise.

This is a modeling guideline, not a requirement. Nontermination and concurrency can make the practical differences more significant. You can study those details when your research calls for them.

---

### 4.2 Denotational-style notation: statements as state transformers

Another common form in software engineering papers is:

$$
[\![s]\!]:\Sigma\rightarrow\Sigma.
$$

Here, statement $s$ denotes a state-transforming function:

> Give it a state, and it returns the state after execution.

This simple type assumes normal termination. To model a command that may run forever, we need a partial function or a separate result for nontermination. We will keep the simpler notation for the terminating examples below; the [Cornell lecture on denotational semantics](https://www.cs.cornell.edu/courses/cs4110/2021fa/lectures/slides07.pdf) develops the partial-function version.

**Assignment.**

For example:

$$
[\![x:=e]\!](\sigma)
=
\sigma[x\mapsto[\![e]\!](\sigma)].
$$

Read this in two steps:

1. Evaluate $e$ using $\sigma$.
2. Store the result in $x$.

**`skip`.**

Since `skip` does nothing:

$$
[\![skip]\!](\sigma)=\sigma.
$$

Its state transformation is the identity function.

**Sequential execution.**

Consider a sequence of two statements:

$$
s_1;s_2,
$$

Its semantics is:

$$
[\![s_1;s_2]\!](\sigma)
=
[\![s_2]\!]([\![s_1]\!](\sigma)).
$$

The order is still “first $s_1$, then $s_2$.”

Using function composition, we can also write:

$$
[\![s_1;s_2]\!]
=
[\![s_2]\!]\circ[\![s_1]\!].
$$

This compact notation is particularly convenient for describing an instruction as a transfer function.

---

A software engineering paper may use this state-transformer notation without constructing a full denotational model. In that case, “denotational-style” is the more careful description.

When you see:

$$
[\![e]\!](\sigma)=\cdots
$$

you need not assume that the author is building a complete classical denotational semantics.

In many papers on static analysis, testing, or software security, the brackets simply define a local function, such as:

- an expression evaluator;
- a transfer function;
- an abstract transformer;
- a program transformation.

For example:

$$
Transfer(i,\sigma)=\sigma'
$$

could equally be written as:

$$
[\![i]\!](\sigma)=\sigma'.
$$

Both expressions describe:

> How instruction $i$ transforms an input state into an output state.

Before classifying the notation, check:

1. What object is inside the brackets?
2. What is the input?
3. What is the output?
4. Does the function describe concrete execution or a static analysis?

Once you understand the formula, you can consider why the author calls it operational, denotational, or abstract semantics.

---

## 5. How these descriptions fit together

### 5.1 Different dimensions of semantics

These terms often appear together, but they are not four mutually exclusive choices.

**Operational semantics describes execution through relations.**

It explains how a program executes.

Two common levels of detail are:

$$
\text{small-step}
$$

and:

$$
\text{big-step}.
$$

Big-step semantics is therefore usually considered a form of operational semantics.

**Denotational-style definitions associate programs with mathematical objects.**

For example:

$$
[\![s]\!]:\Sigma\rightarrow\Sigma.
$$

Here, a statement denotes a state-transforming function.

**Abstract semantics describes a different dimension.**

In static analysis, we often replace a full concrete state with:

$$
\hat{\sigma}.
$$

We may then define:

$$
[\![i]\!]^\#:
\hat{\Sigma}\rightarrow\hat{\Sigma}.
$$

In this notation:

- a hat commonly marks an abstract object;
- a hash mark, `#`, commonly marks an abstract transformer.

A paper can therefore use:

> denotational-style notation to define abstract semantics

or:

> small-step abstract operational semantics

“Abstract” concerns **the information retained by the analysis**. “Operational” and “denotational” concern **how the semantics is defined**. Keep these two dimensions separate.

---

### 5.2 A familiar combination in program analysis

For program analysis work at ICSE, FSE, ASE, and ISSTA, a useful combination to recognize early is:

$$

\text{CFG}
+
\text{State}
+
\text{Transfer Rule}

$$

A typical definition includes:

$$
G=(L,E,\ldots),
$$

$$
\sigma\in\Sigma,
$$

$$
F_\ell:\Sigma\rightarrow\Sigma.
$$

where $F_\ell$ is the transfer function at location $\ell$.

You can picture the process as:

```text
    input state σ
          ↓
      CFG node ℓ
          ↓
        Fℓ(σ)
          ↓
   output state σ'
          ↓
  successor CFG node
```

This form is common for practical reasons:

- **Rules are local:** each kind of instruction can be handled separately.
- **Rules fit the CFG:** a node's result propagates along control-flow edges.
- **Definitions connect to implementation:** transfer functions often correspond closely to analyzer code.
- **The analysis can be solved automatically:** worklists and data-flow frameworks provide ways to compute the results.
- **Boundary cases are easier to inspect:** explicit definitions help expose omissions and ambiguity.

When we move to abstract interpretation, this structure largely stays in place. We replace concrete states with abstract states.

---

## 6. Putting the pieces together

Consider:

```javascript
x = 1;
if (flag) {
    x = x + 1;
} else {
    x = x - 1;
}
y = x * 2;
```

The variables are:

$$
X=\{x,y,flag\},
$$

Use integers and Booleans as the value domain:

$$
V=\mathbb{Z}\cup\{true,false\}.
$$

A program state then has the form:

$$
\sigma:X\rightarrow V.
$$

**Build the CFG.**

Label the program locations:

```text
ℓ1: x = 1
ℓ2: if(flag)
ℓ3: x = x + 1
ℓ4: x = x - 1
ℓ5: y = x * 2
ℓexit: exit
```

Include an edge to the terminal exit node after the last assignment. The edge set is:

$$
E=
\{
(\ell_1,\ell_2),
(\ell_2,\ell_3),
(\ell_2,\ell_4),
(\ell_3,\ell_5),
(\ell_4,\ell_5),
(\ell_5,\ell_{exit})
\}.
$$

**Choose a concrete initial state.**

Suppose:

$$
\sigma_0(flag)=true.
$$

Executing:

```javascript
x = 1;
```

gives:

$$
\sigma_1=\sigma_0[x\mapsto1].
$$

**Choose a branch using the condition.**

Since:

$$
\sigma_1(flag)=true,
$$

control moves from $\ell_2$ to $\ell_3$.

At $\ell_3$, execute:

```javascript
x = x + 1;
```

First evaluate the right-hand side:

$$
[\![x+1]\!](\sigma_1)=2,
$$

Then update the state:

$$
\sigma_2=\sigma_1[x\mapsto2].
$$

**Continue at the join point.**

Control then moves from $\ell_3$ to $\ell_5$, where we execute:

```javascript
y = x * 2;
```

Evaluating its right-hand side gives:

$$
[\![x*2]\!](\sigma_2)=4,
$$

so:

$$
\sigma_3=\sigma_2[y\mapsto4].
$$

The complete execution is:

$$
\langle \ell_1,\sigma_0\rangle
\rightarrow
\langle \ell_2,\sigma_1\rangle
\rightarrow
\langle \ell_3,\sigma_1\rangle
\rightarrow
\langle \ell_5,\sigma_2\rangle
\rightarrow
\langle \ell_{exit},\sigma_3\rangle.
$$

This example brings three objects together:

$$

\text{CFG: control locations}
+
\text{State: data values}
+
\text{Semantic rule: state changes}

$$

---

We could follow that execution precisely because we assumed:

$$
flag=true.
$$

A static analysis of unknown inputs cannot make that choice in advance. It may instead encounter:

```javascript
flag = input();
```

The analyzer does not know what the user will enter at run time.

It cannot simply assume:

$$
\sigma(flag)=true
$$

or:

$$
\sigma(flag)=false.
$$

More generally, integers, strings, objects, heap states, and call results may range over spaces too large to enumerate.

That leads to the next article's question:

> **When there are too many concrete states, how can we retain just the information needed for the analysis?**
{: .prompt-tip}

We will move from concrete to abstract states:

$$
\text{Concrete State}
\longrightarrow
\text{Abstract State}
$$

We will use it to introduce abstract domains, joins, lattices, and fixed points.

---

## 7. Recognizing the notation in a paper

**A one-step transition.**

If you see:

$$
\langle s,\sigma\rangle
\rightarrow
\langle s',\sigma'\rangle,
$$

you are usually looking at small-step operational semantics.

**Evaluation to a final result.**

If you see:

$$
\langle s,\sigma\rangle
\Downarrow
\sigma',
$$

this usually denotes big-step semantics.

**A function in semantic brackets.**

If you see:

$$
[\![s]\!]:\Sigma\rightarrow\Sigma,
$$

the statement is being interpreted as a mathematical function, or denotational-style notation is being used for a transfer function.

**A hat or hash mark.**

The following marks often distinguish concrete from abstract semantics:

$$
\hat{\Sigma},
\qquad
\hat{\sigma},
\qquad
[\![s]\!]^\#,
$$

These are common conventions, not universal rules. The paper's own definitions take precedence.

---

The table below collects these clues. Use it to find your way around a definition, then check the author's notation.

| Symbol | Common meaning |
| --- | --- |
| $G=(N,E)$ | A graph with a node set and an edge set |
| $E\subseteq N\times N$ | Each edge connects two nodes |
| $\ell\in L$ | $\ell$ is a program location or label |
| $inst:L\rightarrow I$ | Each location maps to an instruction |
| $I^*$ | The set of instruction sequences |
| $\ell_{entry}$ | The CFG entry |
| $\ell_{exit}$ | The normal CFG exit |
| $\langle s,\sigma\rangle$ | A configuration containing the current statement and state |
| $\rightarrow$ | Often a one-step transition in a semantic rule |
| $\Downarrow$ | Often evaluation to a final result |
| $$[\![s]\!]$$ | The semantics of program construct $s$ |
| $\frac{P}{C}$ | Premise $P$ allows us to conclude $C$ |
| $skip$ | Do nothing, or mark a completed statement |
| $F_\ell$ | The transfer function at location $\ell$ |

Pay particular attention to $\rightarrow$, which may play several roles in one paper:

$$
f:A\rightarrow B
$$

declares a function from $A$ to $B$.

By contrast:

$$
\langle s,\sigma\rangle\rightarrow\langle s',\sigma'\rangle
$$

is a step of execution.

Look at the objects on either side: are they sets or types, or program configurations?

---

## 8. Exercises

These exercises focus on reading and representation, rather than proofs. Practice three translations:

> From code to a graph, from a graph to sets, and from a formula back to words.

**Build the CFG.**

Given:

```javascript
x = 0;
if (a) {
    x = 1;
}
y = x + 1;
```

Try the following:

1. Assign a label to each statement.
2. Write down the node set $L$.
3. Write down the edge set $E$.
4. Mark the entry and exit.

**Read a configuration.**

Explain:

$$
\langle \ell_3,\sigma\rangle.
$$

Which two kinds of information does it contain?

**Read an inference rule.**

Explain:

$$
\frac{[\![e]\!](\sigma)=true}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\rightarrow
\langle s_1,\sigma\rangle
}.
$$

Identify the premise and conclusion, then explain the whole rule in one sentence.

**Compare small-step and big-step semantics.**

Use this program to compare the two descriptions:

```javascript
x = 1;
y = x + 1;
```

Explain:

- which intermediate steps small-step semantics records;
- what final result big-step semantics relates to the input.

**Read a denotational-style rule.**

Translate this formula into words:

$$
[\![s_1;s_2]\!](\sigma)
=
[\![s_2]\!]([\![s_1]\!](\sigma)).
$$

Focus on the execution order and how the state is passed along, rather than memorizing the formula.


---

## 9. What to take away

The main progression in this article is:

$$

\text{code}
\longrightarrow
\text{control flow}
\longrightarrow
\text{state transitions}

$$

A CFG answers:

> **In what orders can the program execute?**

A program state $\sigma$ answers:

> **What are the current data values?**

A configuration,

$$
\langle \ell,\sigma\rangle
$$

combines the two:

> **Where is the program now, and what is its state?**

A semantic rule then describes:

> **How do the location and state change after one step or a whole piece of code?**

Three common forms are:

Small-step:

$$
\langle s,\sigma\rangle
\rightarrow
\langle s',\sigma'\rangle.
$$

Big-step:

$$
\langle s,\sigma\rangle
\Downarrow
\sigma'.
$$

Denotational-style:

$$
[\![s]\!](\sigma)=\sigma'.
$$

When you are new to program analysis papers, a useful reading order is:

1. Identify the structure used to represent the program.
2. Find out what the state contains.
3. Follow how one rule changes the state.
4. Then classify the style of semantics.

Much of the notation in software engineering program analysis papers comes back to:

$$

\text{CFG}
+
\text{State}
+
\text{Transfer Rule}

$$

The next article, [*Keeping What Matters: From Concrete States to Abstract Interpretation*]({{ site.url }}/posts/Formalization3-en/), keeps this framework and replaces concrete states with abstract states. We will use it to study abstract domains, joins, and lattices.

[Back to the series guide]({{ '/posts/Formalization-guide-en/' | relative_url }})
