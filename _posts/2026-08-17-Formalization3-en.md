---
title: "Formalization in Software Engineering (3): From Concrete States to Abstract Interpretation"
date: "2026-08-17 13:30:00 +0800"
description: "Use a sign analysis to understand abstract values, domains, partial orders, lattices, and joins."
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-en, SE]
lang: en
translation_key: formalization-3
permalink: /posts/Formalization3-en/
series_navigation:
  previous: /posts/Formalization2-en/
  next: /posts/Formalization4-en/
---

Suppose we want to check whether an integer from user input can fall outside an allowed range. We could try to record its exact value on every execution path. But there may be infinitely many inputs, and loops keep producing new states. An analyzer that tries to retain every value soon has too much information to handle.

```javascript
x = input();

if (x > 100) {
    ...
}
```

An analysis often needs a property of the value rather than the exact value itself: is this integer positive? Could this reference be null? Did this data come from untrusted input? Static analysis deliberately forgets details that do not help answer its question. **Abstract interpretation** gives us a framework for doing this systematically while covering the possible concrete executions.

The first two articles represented code as a CFG and program states as mappings from variables to values. Now we ask what happens when there are too many states to track. We will move from concrete to abstract domains and use analysis tasks to explain partial orders, joins, $\top$, and $\bot$.

---

## 1. Forgetting details for a reason

A particular execution encounters a particular input. After `x = 10`, we can record $x=10$. A static analysis runs before execution and has to cover many possible inputs at once. If `x` comes from the user, its possible values may span all integers:

$$
\{\ldots,-2,-1,0,1,2,\ldots\}.
$$

Storing those values individually is usually impractical, and often unnecessary. If we only need the sign, $-100$ and $-1$ behave alike for that purpose. We can represent both as `Negative`. We lose their exact values but retain the property the analysis needs.

The choice of what to forget depends on the task. A nullness analysis distinguishes `Null` from `NonNull`; a taint analysis distinguishes `Tainted` from `Untainted`; an interval analysis keeps lower and upper bounds. An abstraction useful for one question may tell us little about another.

A sound abstraction must cover every concrete value being approximated. If several positive inputs are represented by `Positive`, later rules must account for all those inputs. If $\top$ represents an arbitrary integer, a rule cannot treat it as a known constant.

> Abstract interpretation designs a **computable, safe approximation** around the question we want the analysis to answer.
{: .prompt-tip}

---

## 2. Concrete and abstract domains

### 2.1 What does each domain contain?

Begin with the values that can occur during execution. For integers, the concrete value domain is:

$$
V=\mathbb{Z}.
$$

A program state is still the mapping introduced in Part 1:

$$
\sigma:X\rightarrow V.
$$

For example, $\sigma=\{x\mapsto10\}$ maps `x` to the concrete integer 10. The space of concrete states is commonly written as $\Sigma$.

An abstract domain keeps the properties we want to analyze. If we only care about signs, we can use this small abstract value domain:

$$
\hat{V}
=
\{\bot,Negative,Zero,Positive,\top\}.
$$

Many concrete values fall into the same category:

$$
-10\mapsto Negative,
\qquad
0\mapsto Zero,
\qquad
20\mapsto Positive.
$$

$\top$ means that a value may be positive, zero, or negative. $\bot$ represents no concrete values and is often used for unreachable paths. The hat is a reminder that $\hat{V}$ is abstract, while $V$ is concrete.

### 2.2 Abstraction and concretization functions

Some papers define the connection between the domains explicitly. An abstraction function $\alpha$ maps a set of concrete values to an abstract value:

$$
\alpha:\mathcal{P}(V)\rightarrow\hat{V}.
$$

For example:

$$
\alpha(\{-10,-2,-1\})=Negative.
$$

A concretization function $\gamma$ tells us which concrete values an abstract value covers:

$$
\gamma:\hat{V}\rightarrow\mathcal{P}(V),
$$

$$
\gamma(Positive)=\{n\in\mathbb{Z}\mid n>0\}.
$$

$\mathcal{P}(V)$ is the powerset of $V$: the set of all subsets of $V$. A set of concrete values describes the possibilities an analysis must cover; $\alpha$ approximates that set with one abstract value. You do not need to master Galois connections on your first reading. For now, follow what $\alpha$ discards and what $\gamma$ says the result still covers.

---

## 3. From concrete states to abstract states

A concrete state maps variables to concrete values:

$$
\sigma:X\rightarrow V.
$$

An abstract state maps the same variables to abstract values:

$$
\hat{\sigma}:X\rightarrow\hat{V}.
$$

For example, the concrete state $\sigma=\{x\mapsto42\}$ can be represented by:

$$
\hat{\sigma}=\{x\mapsto Positive\}.
$$

We cannot recover 42 from this state, but we can answer whether `x` may be negative. An abstract state is a representation designed for a particular analysis.

For a single concrete state, a simple abstraction converts each variable's value independently. The singleton set $\{\sigma(x)\}$ lets us apply the value abstraction defined above:

$$
\alpha_\Sigma(\sigma)(x)=\alpha_V(\{\sigma(x)\}).
$$

Other abstractions can retain relationships between variables. An interval domain records each variable's range; a relational numerical domain may also express constraints such as $x-y\leq3$. The structure and cost of the domain determine what an abstract state can express.

---

## 4. Why does merging paths need an ordered structure?

### 4.1 From a join point to a lattice

Consider a Boolean variable:

```javascript
if (condition) {
    x = true;
} else {
    x = false;
}

use(x);
```

At `use(x)`, one path has produced `true` and the other `false`. The analyzer cannot choose one arbitrarily or continue as if the value were known. It needs a result, $\top$, that represents both possibilities.

Listing abstract values is therefore not enough. We also need to compare them and merge information from different paths. A *lattice* organizes those relationships. A simple Boolean lattice looks like this:

```text
          ⊤          true or false
         / \
      true  false
         \ /
          ⊥          no reachable states
```

Here $\bot$ means that there are no possible concrete states. $\top$ carries the least precise information: the value may be either `true` or `false`. Reversing their meanings would reverse how we interpret the analysis.

The partial order is commonly written as $\sqsubseteq$. We use a standard convention: moving upward covers more concrete possibilities and gives a less precise result. For example:

$$
\bot\sqsubseteq true\sqsubseteq\top,
\qquad
\bot\sqsubseteq false\sqsubseteq\top.
$$

`true` and `false` are incomparable: neither represents the other. Some papers reverse the direction of the order. Always read the definition before interpreting “larger” or “smaller.”

### 4.2 Joins, least upper bounds, and complete lattices

The join operation, written $\sqcup$, merges information at a control-flow join point:

$$
true\sqcup false=\top,
$$

$$
true\sqcup true=true,
$$

$$
\bot\sqcup true=true.
$$

Mathematically, $a\sqcup b$ is the *least upper bound* of $a$ and $b$. It covers both while losing no more precision than the domain requires. This captures two aims of the analysis: retain every incoming possibility and discard as little information as possible.

> Read $\hat{\sigma}_1\sqcup\hat{\sigma}_2$ as “safely combine the possible states from these two paths.”
{: .prompt-tip}

A complete lattice extends this requirement to arbitrary sets of abstract values: every such set has a least upper bound and a greatest lower bound. This provides a foundation for defining fixed points, but does not by itself guarantee that iteration finishes in finitely many steps. An infinite ascending chain may still require widening, which Part 5 discusses.

For more on partial orders, least upper bounds, CPOs, and $\bot$, see [*Denotational Semantics of Typed Lambda Calculus II — Partial Orders and Continuous Functions*]({{ site.url }}/posts/model2/#partial-orders). That article approaches these structures through denotational semantics, but the ordering and fixed-point ideas are closely related.

---

## 5. The domain determines what an analyzer can answer

### 5.1 Different tasks, a shared framework

Many static analyses can be viewed as computing an abstract state at each program location. The property stored in that state changes with the task:

| Analysis | Typical abstract information | Question |
| --- | --- | --- |
| Nullness analysis | `Null`, `NonNull`, $\top$ | Can the variable be null? |
| Taint analysis | `Tainted`, `Untainted`, $\top$ | Can the data come from untrusted input? |
| Constant propagation | Constants and $\top$ | Does the variable have a known constant value? |
| Interval analysis | $[a,b]$ | What range can the value fall in? |
| Type analysis | Sets of possible run-time types | Which implementations can a call dispatch to? |

A richer domain can answer more detailed questions, but joins, transfer functions, and state storage may cost more. Choosing a domain means deciding what information is worth keeping.

### 5.2 Four definitions to find in a paper

When you meet a new abstract semantics, look for:

1. **The concrete domain:** which real values or program states should the analysis cover?
2. **The abstract domain:** which properties does the analyzer actually store?
3. **The order and join:** how are abstract values compared, and how do paths merge?
4. **Concretization:** which concrete cases does each abstract value represent?

Once you can answer these questions, hats, $\top$, and $\sqcup$ become parts of a data representation you can follow.

The following table collects the notation used in this article:

| Symbol | Common meaning |
| --- | --- |
| $V$, $\Sigma$ | The concrete value domain and state space |
| $\hat{V}$, $\hat{\Sigma}$ | The abstract value domain and state space |
| $\sigma$, $\hat{\sigma}$ | A concrete state and an abstract state |
| $\alpha$ | Compress concrete information into an abstraction |
| $\gamma$ | Describe the concrete cases an abstract value covers |
| $\bot$ | No possible concrete states; often marks unreachability |
| $\top$ | The least precise value, covering all possibilities in the domain |
| $\sqsubseteq$ | An approximation or precision order |
| $\sqcup$ | Join information from different paths |

---

## 6. What to take away

The key idea is to forget details for a reason. Concrete states record actual values in an execution; abstract states retain properties relevant to the task. The order tells us which results cover more possibilities, and joins let us merge paths safely.

When reading a program analysis paper, trace the design in this order:

$$
\text{analysis goal}
\longrightarrow
\text{Abstract Domain}
\longrightarrow
\text{order and join}
\longrightarrow
\text{Abstract State}.
$$

We now know what the analyzer stores. The next article, [*Why Does the Analyzer Stop? Transfer Functions and Fixed Points*]({{ site.url }}/posts/Formalization4-en/), puts that information to work on a CFG using transfer functions, worklists, and fixed points.

[Back to the series guide]({{ '/posts/Formalization-guide-en/' | relative_url }})
