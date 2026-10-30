---
title: "Formalization in Software Engineering (5): Precision, Speed, and Soundness"
date: "2026-08-19 14:30:00 +0800"
description: "Understand what an analysis guarantees, why false positives arise, and how precision and cost shape real tools."
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-en, SE]
lang: en
translation_key: formalization-5
permalink: /posts/Formalization5-en/
series_navigation:
  previous: /posts/Formalization4-en/
  next: /posts/Formalization6-en/
---

It is two in the morning, and a static analysis job is still running on the continuous integration (CI) server. The new version is more precise: it distinguishes more calling contexts and tracks more paths. But the developer has waited forty minutes and decides to skip the check. Another tool finishes in two minutes, then reports hundreds of warnings, most of them false alarms. Nobody wants to work through those either.

A theoretically correct analysis still has to earn a place in a development workflow. A tool must cover the relevant behavior, produce useful results, terminate, and cope with the size of the codebase. Improving one of these properties often costs something elsewhere.

Part 4 built an analysis loop from transfer functions, joins, and a worklist. We now consider the engineering decisions around that loop. We begin with termination on infinite-height domains, distinguish soundness from precision and scalability, then examine flow, path, and context sensitivity. Astrée, Clang Static Analyzer, Infer, and MOPSA illustrate how different goals shape a tool.

---

## 1. A fixed point may exist without being easy to compute

With the monotone transfer functions and finite-height domain used in Part 4, states cannot keep ascending strictly forever, so the worklist eventually empties. The usual interval domain, however, has infinite ascending chains. Return to the loop that repeatedly executes `x = x + 1`. An analyzer that raises the upper bound by one on each iteration may produce:

$$
[0,0]
\sqsubseteq
[0,1]
\sqsubseteq
[0,2]
\sqsubseteq
\cdots
$$

The sequence approaches $[0,+\infty]$ without reaching it in any finite number of iterations. A least fixed point may exist mathematically while naive iteration runs forever.

We therefore need a way to compute a safe approximation in finite time.

**Widening**, commonly written $\nabla$, accelerates an ascending sequence by moving to a broader result. For example, standard interval widening gives:

$$
[0,1]\nabla[0,2]
=
[0,+\infty].
$$

The result gives up a finite upper bound but covers all subsequent intervals $[0,n]$. We lose precision, yet cut off the infinite ascending chain so that the analysis can terminate.

> Widening aims to **ensure or accelerate convergence while preserving soundness**. It need not produce the most precise fixed point.
{: .prompt-tip}

Some analyses follow widening with **narrowing**, using the transfer rules to recover some precision. First they make a large jump to a safe bound, then try to tighten that bound.

The result need not be the least fixed point of the original equations. Widening typically computes a sound *post-fixpoint*: the states produced by the original semantic transformer are already covered by the result, written $F(S)\sqsubseteq S$. This distinction between an exact solution and a safe approximation is central to the [Cousots' abstract interpretation framework](https://www.di.ens.fr/~cousot/COUSOTpapers/POPL77.shtml).

Where and when widening is applied also matters. Applying it immediately at every changing node may converge quickly but produce $\top$ too soon. Implementations often widen at selected locations, such as loop heads, or allow several ordinary joins first. These choices can substantially affect both analysis time and false positives.

---

## 2. Soundness and precision

### 2.1 What does each property mean?

For an overapproximating static analysis, soundness can be expressed as:

$$
\text{Concrete Behaviors}
\subseteq
\gamma(\text{Abstract Result}),
$$

$\gamma$ interprets the abstract result as the concrete behaviors it covers. The inclusion says that real executions stay within this result, subject to the program semantics, environment model, and properties covered by the analysis.

Soundness supports conclusions about the absence of errors. If a sound analysis excludes a class of errors from its result, those errors cannot occur in the modeled executions. If an error remains in the abstract result, however, it is only **possible**: there may be no real execution that triggers it.

A sound overapproximation can therefore produce false positives. Soundness requires that approximation does not discard real behavior within the analysis scope; it does not require every warning to be a real bug.

Two analyses can both be sound while differing in precision. Suppose analysis A finds:

$$
x\in[0,10],
$$

while analysis B finds only:

$$
x\in[-\infty,+\infty].
$$

If the real values at this program point always lie in $[0,10]$, both results safely cover them. A gives the more precise result because its interval is narrower. This example compares the two results; proving an analyzer sound requires an argument covering all programs and inputs within its stated scope. More precise states can rule out infeasible paths and reduce false positives, but may require richer domains, more contexts, or more analysis states.

### 2.2 Scalability: fitting the workflow

Scalability includes memory use, incremental updates, parallelism, the cost of library models, and how long a developer waits for results. Even a sound, precise analysis may be hard to use in CI if every commit requires analyzing the whole repository again.

These goals are not governed by a single fixed trade-off: a better algorithm can sometimes improve several at once. Still, with a fixed resource budget, tracking more paths, contexts, and relationships usually means storing and processing more states.

| Goal | Main question | Typical cost |
| --- | --- | --- |
| Soundness | Does the result cover real behavior within the model? | May retain infeasible paths and produce false positives |
| Precision | How closely does the approximation describe real behavior? | Richer domains and more analysis states |
| Scalability | Can the analysis handle the target codebase within its budget? | May require summaries, incremental computation, or coarser approximations |

---

## 3. Where does precision come from?

A flow-sensitive analysis keeps different states at different program locations. For example:

```javascript
x = null;
x = new Object();
use(x);
```

After the first line, `x` is `Null`; after the second, it is `NonNull`. The $IN[n]$ and $OUT[n]$ representation from Part 4 is flow-sensitive. A flow-insensitive analysis may keep one merged state for the whole function, saving work but mixing information from different points in execution.

A path-sensitive analysis also distinguishes control-flow paths. Consider:

```javascript
if (x != null) {
    use(x);
}
```

It incorporates the condition into the current path constraints, so the true branch can use $x\neq null$. Merging branches too early can lose that information.

The cost is straightforward: each branch can split a state. With $n$ independent binary choices, there may be as many as $2^n$ paths. Tools control this growth through state merging, constraint simplification, search budgets, and heuristic pruning. These choices have different effects: a conservative merge can preserve coverage, while a search cutoff can leave paths unexplored.

Calls introduce context sensitivity. The same function can be reached from different call sites, receivers, or call chains:

```javascript
sanitize(adminInput);
sanitize(guestInput);
```

If the analysis merges both calls into one context, facts about the two inputs and their effects can become mixed. A context-sensitive analysis retains part of the calling environment, such as the call site, the most recent $k$ calls, or the receiver object. Finer contexts help keep the calls separate but require more analysis states.

These forms of sensitivity can be combined, and relational domains can add constraints between variables. Each extra distinction can multiply the state space. Practical analyzers often spend precision where it matters and merge states elsewhere.

> A claim of “greater precision” needs two details: **precision for which property, and at what cost in time and memory?**
{: .prompt-tip}

---

## 4. Four tools with different goals

### 4.1 How goals shape an analyzer

**Astrée: proving the absence of run-time errors.**

[Astrée](https://www.astree.ens.fr/) targets safety-critical embedded C software. It uses abstract interpretation to overapproximate program behavior and cover potential run-time errors within its model and checking scope. If the analysis finishes without a relevant alarm, the result establishes the absence of that class of errors within that scope.

To reduce false positives, Astrée combines intervals, relational numerical domains, and abstractions tailored to control software. It uses widening for infinite domains. Astrée shows how sound analysis can scale to industrial programs when the domains are carefully designed for the application.

**Clang Static Analyzer: finding bugs along paths.**

[Clang Static Analyzer](https://clang.llvm.org/docs/ClangStaticAnalyzer.html) targets C, C++, and Objective-C. Its core uses path-sensitive, interprocedural symbolic execution. It maintains a `ProgramState` along each explored path, while checkers look for defects such as use-after-free and null-pointer dereferences.

It is designed to give developers actionable bug reports with paths they can inspect. It does not offer a single soundness guarantee covering every behavior of the language and environment. That goal shapes its path budgets, library modeling, and false-positive controls.

**Infer: scaling through procedure summaries.**

[Infer](https://fbinfer.com/) is Meta's open-source interprocedural static analyzer. One of its important engineering ideas is compositional, summary-based analysis: analyze a procedure, compute a summary, and let callers use that summary instead of repeatedly expanding the body.

A summary compresses internal details into preconditions, postconditions, or other abstract effects that callers need. This supports reasoning across procedure boundaries and incremental analysis, since a code change need not force every part of the program to be recomputed.

**MOPSA: composing abstract domains as modules.**

[MOPSA](https://mopsa.lip6.fr/) is an open-source research and teaching platform for building sound semantic analyzers through abstract interpretation. It organizes language constructs and data abstractions into composable modules, making it easier to replace domains, inspect changes in precision, and develop new analyses.

MOPSA also illustrates why we should distinguish a theoretical goal from an implementation's supported scope. A tool may aim for soundness for supported semantics and checks while explicitly limiting language features, libraries, or environment behavior. Find those assumptions before interpreting its results.

### 4.2 Comparing tools requires a task

Astrée emphasizes proofs of safety properties; Clang Static Analyzer provides bug reports with paths developers can inspect; Infer emphasizes compositional and incremental analysis; MOPSA supports modular research into sound analysis. A useful comparison starts with the language, error classes, soundness claims, time budget, and intended workflow.

---

## 5. From formal definitions to implementation

An abstract value domain becomes a data type. Its order, join, and widening become operations:

```python
class AbstractValue:
    def leq(self, other): ...
    def join(self, other): ...
    def widen(self, other): ...
```

A transfer function becomes a state transformation:

```python
def transfer(node, in_state):
    ...
    return out_state
```

The solver connects them:

```python
while worklist:
    node = worklist.pop()
    new_out = transfer(node, in_state[node])
    propagate_if_changed(node, new_out)
```

A real implementation also needs caches, summaries, diagnostics, and language semantics. But the core interfaces correspond closely to the mathematical definitions. Those definitions explain both the reasoning and the information exchanged between modules.

Once you can connect the formulas to the implementation, examine the tool's claims. When a paper calls an analysis “sound,” “scalable,” or “precise,” ask:

1. Which language features and error classes does it support?
2. What does it assume about libraries, native code, reflection, and concurrency?
3. Which baseline, benchmarks, and metrics support the precision claim?
4. Does the reported time cover a full analysis or an incremental update?

These details determine where the conclusions apply.

---

## 6. What to take away

Building a useful analyzer takes more than defining a fixed point. Widening addresses infinite ascending chains. Soundness requires coverage of real behavior within the model. Precision describes how tight the approximation is. Scalability determines whether the analysis can deliver useful results on the target codebase.

Flow, path, and context sensitivity provide finer information while enlarging the state space. Summaries, incremental analysis, and modular abstractions help control the cost. A tool's choices should fit its users, programs, and target errors.

The final main article, [*AI Wrote the Code. Who Checks It?*]({{ site.url }}/posts/Formalization6-en/), turns to large language models. When a model can generate and explain code, which tasks can it take on, and which conclusions still need testing, analysis, or proof?

[Back to the series guide]({{ '/posts/Formalization-guide-en/' | relative_url }})
