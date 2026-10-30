---
title: "Formalization in Software Engineering (4): Why Does the Analyzer Stop? Transfer Functions and Fixed Points"
date: "2026-08-18 14:00:00 +0800"
description: "Follow abstract information through assignments, branches, and loops to understand fixed points and worklist algorithms."
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-en, SE]
lang: en
translation_key: formalization-4
permalink: /posts/Formalization4-en/
series_navigation:
  previous: /posts/Formalization3-en/
  next: /posts/Formalization5-en/
---

Imagine an analyzer following a program's control-flow graph. At an assignment, it updates variable information. At a branch, it sends states down the alternatives. At a join point, it combines what the paths have found. Loops are harder: a back edge brings new information to an old node, so the analyzer has to revisit code it has already processed.

Three ideas organize this process: a **transfer function** describes the effect of an instruction, a **join** combines information from incoming paths, and a **fixed point** describes a stable solution to the propagation equations.

Part 3 introduced abstract states and lattices. We now turn those local definitions into an algorithm that runs over a CFG. We will start with one node's input and output, connect nodes through equations, use a loop to explain fixed points, and finish with a worklist algorithm.

---

## 1. Transfer functions: what does an instruction change?

In concrete execution, an instruction changes state $\sigma$ into $\sigma'$. An abstract analysis performs a similar transformation over the abstract state space $\hat{\Sigma}$. For CFG node $\ell$, we commonly write:

$$
F_\ell:\hat{\Sigma}\rightarrow\hat{\Sigma}.
$$

$F_\ell$ is the node's **transfer function**. It takes the abstract state before the node and returns the state afterward:

$$
\hat{\sigma}_{out}
=
F_\ell(\hat{\sigma}_{in}).
$$

For example, constant propagation tracks whether a variable has a known constant value. A simple abstract value domain is:

$$
\hat{V}=\{\bot\}\cup\mathbb{Z}\cup\{\top\}.
$$

At the value level, $\bot$ represents no possible integer values, an integer $c$ means “definitely equal to $c$,” and $\top$ means that any integer is possible. We also use $\bot$ for an unreachable whole-program state. This is different from a reachable state in which a variable is unknown.

For a reachable input state, `x = 1` sets the abstract value of `x` to 1 regardless of its previous value:

$$
F_{x=1}(\hat{\sigma})
=
\hat{\sigma}[x\mapsto1].
$$

This is the state-update notation from Part 1, now used with abstract values. An unreachable input remains unreachable: executing an assignment cannot create a real execution on a path that cannot be taken.

Assignments, conditions, and calls affect states differently. Some typical constant-propagation rules can be described informally as:

```text
x = 1       update x to 1
x = y       copy y's abstract value to x
x = y + z   compute from y and z; use ⊤ when no constant is known
assume(c)   retain states satisfying c; discard impossible states
```

A paper's contribution often lies in these rules. Start by identifying a transfer function's input and output, then ask what information it preserves, discards, or introduces.

> A transfer function answers a local question: **how does executing this node change the abstract state?**
{: .prompt-tip}

---

## 2. From local rules to CFG equations

Let the CFG be $G=(N,E)$. For each node $n\in N$, an analyzer commonly maintains:

- $IN[n]$: the abstract state before the node;
- $OUT[n]$: the abstract state after the node.

The transfer function connects them:

$$
OUT[n]=F_n(IN[n]).
$$

With one predecessor, a node can take its input directly from that predecessor's output. With several predecessors, it first joins all incoming states. Writing $pred(n)$ for the predecessor set:

$$
IN[n]
=
\bigsqcup_{p\in pred(n)}OUT[p].
$$

Together, these equations describe the structure of many forward data-flow analyses:

$$

IN[n]=\bigsqcup_{p\in pred(n)}OUT[p],
\qquad
OUT[n]=F_n(IN[n])

$$

The entry node needs an initial state supplied separately. Other nodes usually start at $\bot$ until they become reachable.

The join combines possibilities arriving from different predecessors. Consider:

```javascript
if (flag) {
    x = 1;
} else {
    x = 2;
}

use(x);
```

The two branches produce $x\mapsto1$ and $x\mapsto2$. Before `use(x)`, the analyzer computes:

$$
1\sqcup2=\top.
$$

The merged state therefore contains $x\mapsto\top$. It cannot give the exact value, but it covers both real paths. If both branches instead produce 1:

$$
1\sqcup1=1.
$$

A join computes the least upper bound: a result that represents all incoming possibilities with as much precision as the domain permits.

> In this series, higher states cover more concrete behavior and are less precise. A join adds possibilities without dropping any incoming path.
{: .prompt-tip}

---

## 3. Why do loops lead to fixed points?

Straight-line code allows information to move forward in one pass. A loop feeds later outputs back into earlier inputs:

```javascript
x = 0;

while (unknown()) {
    x = x + 1;
}
```

On the first visit to the loop head, constant propagation finds $x=0$. One iteration brings $x=1$ back along the back edge. Their join is $\top$. Further iterations leave the abstract values unchanged. For `x`, the abstract values at the loop head progress as follows:

$$
\bot
\sqsubseteq
0
\sqsubseteq
\top.
$$

This is an ascending sequence of abstract values. Although the domain contains infinitely many constants, a strictly ascending chain has at most three elements: $\bot$, a constant, and $\top$. That is what *finite height* means here. The ordering extends to whole states by comparing corresponding variables. Once recomputing the nodes leaves every state unchanged, further propagation adds no information.

Collect all node states into a vector, and let a global function $F$ encode the propagation equations, including the initial state at the entry. If:

$$
F(S)=S,
$$

then $S$ is a **fixed point** of $F$. For the finite-height analysis described here, we seek the **least fixed point**, the least solution of these abstract equations. Its precision depends on both the abstract domain and the transfer functions we chose.

Starting at $\bot$ and repeatedly applying a monotone function gives:

$$
S_0=\bot,
\qquad
S_{i+1}=F(S_i).
$$

The analysis stabilizes when $S_{i+1}=S_i$. A domain of finite height has no infinite strictly ascending chain, so this iteration terminates after finitely many steps. An interval domain has infinite height: it may keep producing $[0,0], [0,1], [0,2]\ldots$. Such analyses may need widening, introduced in Part 5, to force convergence.

---

## 4. Worklists: recomputing only affected nodes

A simple implementation could scan every CFG node repeatedly until no state changes. But a local update usually leaves much of a large program unaffected. Recomputing all of it wastes work.

A **worklist algorithm** keeps track of the nodes that need processing. The version below assumes a finite CFG with a separate entry node that has no incoming edges. Transfer functions are monotone and preserve unreachable states, and `initial_state` describes a reachable entry. Here `⊥` denotes an unreachable whole-program state.

Under these assumptions, a basic forward version is:

```text
for each node n:
    IN[n]  = ⊥
    OUT[n] = ⊥

IN[entry] = initial_state
worklist = [entry]

while worklist is not empty:
    n = remove(worklist)
    new_out = F_n(IN[n])

    if new_out != OUT[n]:
        OUT[n] = new_out

        for each successor s of n:
            new_in = IN[s] ⊔ OUT[n]

            if new_in != IN[s]:
                IN[s] = new_in
                add s to worklist
```

There are two checks for change. If a node's output stays the same, there is no need to propagate it again. If a successor's input stays the same, there is no need to put that successor back on the worklist. Implementations differ in scheduling and in how they combine updates, but the principle is the same: **propagate when new information appears.**

When the worklist is empty, no pending update can change a node's input or output. The local equations hold together, and the analysis has reached a global fixed point.

Termination depends on the transfer functions and domain. Transfer functions normally need to be monotone, joins must keep the iteration moving upward, and infinite ascending chains must be ruled out or accelerated. Finite-height domains give the last condition directly; infinite-height domains need an additional mechanism such as widening.

---

## 5. Putting the analysis together

We can now connect the first four articles into a complete analysis:

```text
           source code
                ↓
     control-flow graph (CFG)
                ↓
abstract domain and initial state
                ↓
     node transfer functions
                ↓
         Join + Worklist
                ↓
        Least Fixed Point
                ↓
         analysis results
```

The CFG determines where information flows. The domain determines what the analyzer remembers. Transfer functions update node states, joins combine paths, and the worklist solves the resulting equations efficiently.

When reading a new static analysis definition, look for:

1. **The state:** what abstract information does $\hat{\sigma}$ contain?
2. **Local rules:** how does $F_n$ handle each kind of statement?
3. **Merging:** which join combines information from multiple predecessors?
4. **Convergence:** how does the analysis of loops reach a fixed point, and does it use widening?

These questions cover the data representation, local semantics, control-flow joins, and global computation. They remain useful when a paper changes the notation.

Use this table to look up the main objects:

| Symbol | Common meaning |
| --- | --- |
| $F_n$ | The transfer function at node $n$ |
| $IN[n]$ | The abstract state before node $n$ |
| $OUT[n]$ | The abstract state after node $n$ |
| $pred(n)$ | The predecessors of node $n$ |
| $\sqcup$, $\bigsqcup$ | Join two or more abstract states |
| $lfp(F)$ | The least fixed point of the global analysis function $F$ |
| worklist | A set or queue of nodes awaiting processing |

---

## 6. What to take away

We now have the structure of an analysis algorithm. Transfer functions process nodes, joins combine incoming information, and back edges cause nodes to be revisited. With the finite-height domain and monotone rules used here, the worklist computes the least fixed point. Part 5 explains what changes when widening is needed.

The two central equations are:

$$
IN[n]=\bigsqcup_{p\in pred(n)}OUT[p],
\qquad
OUT[n]=F_n(IN[n]).
$$

The next article, [*Precision, Speed, and Soundness: Engineering Trade-offs in Static Analysis*]({{ site.url }}/posts/Formalization5-en/), considers what happens in real tools: how to stop infinite ascending chains, how soundness differs from precision, and how an analyzer balances precision, speed, and scale.

[Back to the series guide]({{ '/posts/Formalization-guide-en/' | relative_url }})
