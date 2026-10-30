---
title: "Formalization in Software Engineering (6): AI Wrote the Code. Who Checks It?"
date: "2026-08-20 15:00:00 +0800"
description: "Connect AI-generated code to specifications, testing, verification, and the limits of formal guarantees."
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-en, SE, LLM]
lang: en
translation_key: formalization-6
permalink: /posts/Formalization6-en/
series_navigation:
  previous: /posts/Formalization5-en/
  next: /posts/Formalization7-en/
---

A developer gives a large language model (LLM) a bug report, and it quickly produces a patch. The code compiles, the existing tests pass, and the reviewer finds the change plausible. Two weeks later, an input missing from the test suite triggers another failure. The patch handled the examples without fixing the underlying bug.

Generating plausible code is often easier than establishing that it meets the requirements for every relevant input. A model can propose implementations, tests, assertions, and even proofs. How much confidence we should place in those outputs depends on how they are executed, analyzed, or checked.

The first five articles introduced the machinery of a static analyzer, from program states to fixed-point computation. We now ask how those ideas fit into AI-assisted development: what open-ended tasks a model can help with, what formal methods can establish, and where trust should be placed when the two are combined.

We begin by separating a plausible candidate from an established property, then examine combinations of LLMs with static analysis, symbolic execution, and program repair. Two questions guide the discussion: who checks the final conclusion, and which specifications, semantic models, and tool limitations constrain it?

---

## 1. Two ways of understanding a program

Code models learn statistical patterns from large collections of text and programs. They are useful for code completion, explaining intent, adapting familiar API usage, and proposing repairs. Given an unfamiliar function, a model can often suggest what it does by drawing on names, comments, and surrounding code.

Traditional program analysis starts with definitions of semantics, states, and the property to check, then propagates information according to explicit rules. A nullness analysis, for example, defines:

- which values belong to `Null`, `NonNull`, or `Unknown`;
- how each statement changes those values;
- how branches and calls propagate states;
- when a null-pointer error can be reported or ruled out.

The strengths are complementary. A model can work with incomplete descriptions and search for candidates; a formal analysis can carry out systematic, inspectable reasoning within a defined model.

A fluent explanation alone does not establish a semantic guarantee. Suppose a model sees:

```c
int *p;
*p = 10;
```

A model might correctly identify the uninitialized pointer. But the explanation does not, by itself, say which paths were checked, what memory model was used, or what evidence an independent checker could verify. Producing the same answer repeatedly would not make it a proof.

A model can also contribute to a proof by proposing loop invariants, SMT constraints, or proof terms. The key question is **whether a checker with defined semantics validates the result**.

> Treat an LLM's output as a candidate. Test results, counterexamples, solver results, and machine-checked proofs provide evidence, each within its own scope.
{: .prompt-tip}

Formal tools also work relative to a specification and model. Proving the wrong specification does not meet the user's real requirements. A semantic model that omits reflection, native libraries, or concurrency cannot establish properties of those omitted behaviors.

A claim of formal verification therefore needs details: which property was checked, under which semantics and environment assumptions, and which modules were excluded? Making the premises explicit is part of what makes the conclusion reviewable.

---

## 2. Supplying knowledge an analyzer lacks

A taint analyzer may know how data flows through assignments and calls without knowing whether a third-party API is a source, sanitizer, or sink. An error-handling analyzer may track return values without knowing which values signal failure. Maintaining these specifications by hand is costly, and they can fall behind code changes.

An LLM can propose specifications from names, documentation, call patterns, and nearby code. An analyzer can use them in the wider data flow and check for inconsistencies. This does not automatically establish that a proposed specification is correct: the analysis is reasoning from that specification as an assumption.

Chapman, Rubio-González, and Thakur give a concrete example. They place intermediate static analysis results in prompts, then feed inferred error specifications back into the analyzer. The task is specific: infer which return values of C functions indicate errors, and use those specifications to find error-handling bugs. The paper reports improvements in recall and F1 on its evaluation subjects and examines model nondeterminism. See [*Interleaving static analysis and LLM prompting with applications to error specification inference*](https://doi.org/10.1007/s10009-025-00780-7).

The model supplies candidate knowledge where the analyzer lacks a specification. Its usefulness is measured through a defined analysis task and benchmarks.

Whether this preserves soundness depends on how the output is used. Ranking alarms changes which reports a developer sees first. Deleting paths the model considers unimportant can break coverage guarantees. Treating a generated transfer rule as trusted can likewise propagate a model error through the whole computation.

Possible safeguards include retaining the original sound analysis as a fallback, allowing the model to add candidates without discarding behavior, and checking generated rules before accepting them into a trusted rule library. Type checks, tests, static constraints, and review provide different levels of evidence. Passing a type check or a test suite alone does not establish that a generated rule is sound. A soundness claim still needs conservative rules, justified specifications, or a fallback that retains the original coverage.

---

## 3. Letting the model search and tools check

### 3.1 The candidate–check loop in program repair

Automated program repair searches a large space of possible patches. An LLM can use code context to propose candidates quickly, giving us a loop like this:

```text
           bug report and context
                     ↓
            LLM proposes a patch
                     ↓
     compile, test, analyze, or verify
                     ↓
 accept, reject, or return a counterexample
```

This is a common neuro-symbolic arrangement: a generative model guides the search, while tools check executable or logical conditions. A 2025 cross-language study examined LLM-generated patches on six benchmarks and found that both model choice and prompting affected repair performance. See [*Empirical Evaluation of Large Language Models in Automated Program Repair*](https://arxiv.org/abs/2506.13186).

Passing tests does not establish that a patch is correct. A patch may hard-code an answer, bypass a branch, or remove behavior to satisfy the test suite. This is test-suite overfitting. “Tests passed” means those tests observed no failure; it does not imply that the program meets its full specification.

When a formal specification is available, symbolic execution, model checking, or deductive verification can provide further checks. Otherwise, additional tests, static checks, code review, and run-time monitoring can strengthen the evidence. The checking effort should fit the consequences of failure.

### 3.2 Generating invariants and proofs for checking

Loop invariants, function contracts, and proof strategies can be hard to discover but easier to check once proposed. A model can suggest an invariant; an SMT solver or proof assistant can check initialization, preservation, and whether the invariant establishes the desired condition on exit.

LaM4Inv, for example, uses bounded model checking to filter predicates from LLM-generated candidates, combines the retained predicates into new candidates, and uses SMT solvers to check the invariant conditions. Feedback guides later rounds of generation. Bounded exploration helps the search; the final checks establish whether a candidate is inductive and sufficient for the target property. See [*LLM Meets Bounded Model Checking: Neuro-symbolic Loop Invariant Inference*](https://weining-cao.github.io/papers/ASE24_LaM4Inv.pdf).

---

## 4. Guiding the exploration of complex paths

Symbolic execution represents inputs with symbolic variables and accumulates path constraints:

$$
x=a,
\qquad
PC=a>0.
$$

At a target location, an SMT solver checks whether the constraints are satisfiable and, when possible, produces a concrete input. But each branch may split a state, and loops can produce unbounded paths. This causes path explosion.

An LLM can help rank paths, propose summaries or invariants, and suggest inputs likely to trigger a bug. Such heuristics may find failures more efficiently within a fixed budget. If they permanently prune unexplored paths, however, the system cannot claim to have covered them all.

An explanation that sounds like careful reasoning still needs to be checked against execution. An ICML 2025 study tested models on compiler IR tasks including CFG reconstruction, decompilation, summarization, and execution reasoning. Models recognized some syntax and high-level structure but struggled more with instruction-level execution, control flow, and loops. Explaining a program plausibly and following its low-level semantics are different abilities. See [*Can Large Language Models Understand Intermediate Representations in Compilers?*](https://icml.cc/virtual/2025/poster/43488).

Check proposed path judgments with an interpreter, compiler IR tool, symbolic executor, or test run where possible. Execution evidence is more useful than another natural-language assessment of the model's own answer.

---

## 5. Designing a hybrid analysis system we can inspect

A hybrid system brings together the program and specification, candidate generation, and checking tools:

```text
            program, specification, and context
                             │
              ┌──────────────┴──────────────┐
              │                             │
       LLM candidates            analysis and execution
              │                             │
              └──────────────┬──────────────┘
                             │
               checkable results and evidence
```

Identify which model outputs can influence the final conclusion. An explanation has a different role from a trusted transfer rule. Suggesting which path to inspect first has a different effect from authorizing the system to ignore all other paths.

A practical design places a checking interface between open-ended generation and accepted results. Let the model propose candidates and a smaller component with explicit semantics assess them:

| LLM proposal | Checking component | Evidence |
| --- | --- | --- |
| Candidate patch | Compiler, tests, static analyzer | Compilation results, test traces, changes in alarms |
| Input for a path | Program runner, fuzzer | Reproducible crashes or coverage |
| Loop invariant | SMT solver, verifier | Successful validation or a counterexample |
| API specification | Type checks, data-flow analysis, review | Consistency checks and analysis metrics |
| Proof term | Proof assistant kernel | A machine-checked proof |

Each row provides a different kind of evidence. Passing tests is weaker than establishing a specification for all modeled inputs, and a consistency check does not prove an API specification correct. State what the checker establishes, what it can miss, and when its result is inconclusive.

Keep evidence of failures as well as successes: paths, constraints, counterexamples, test logs, model assumptions, and unsupported features. These records help distinguish an incorrect candidate from an incomplete specification or a tool limitation.

In high-risk uses, an inconclusive check must remain visible. A verifier timeout is different from successful verification. A missing library model is different from evidence of safety.

---

## 6. Five questions for an LLM-assisted program analysis paper

When reading a hybrid-method paper, ask:

1. **What is the task?** Patch generation, alarm ranking, specification inference, or proving a property?
2. **What does the LLM produce?** A natural-language judgment, candidate code, abstract rules, or a checkable proof?
3. **Who makes the final decision?** The model, tests, a solver, an analyzer, or a person?
4. **What happens on failure?** False alarms, missed bugs, timeouts, or fallback to the original analysis?
5. **What evidence supports the claim?** Which outcomes are measured—test pass rate, actual correctness, recall, false positives, or cost—and is any soundness guarantee justified separately?

“An LLM improves the analysis” can describe very different guarantees. Answering these questions helps identify the actual technical contribution.

**Further reading.** [*A Contemporary Survey of Large Language Model Assisted Program Analysis*](https://doi.org/10.53941/tai.2025.100006) organizes work across static, dynamic, and hybrid analysis. From there, choose a topic such as error specification inference, repair, loop invariants, or compiler IR; there is no need to read every direction at once.

For foundations, this blog's [*Easy Foundations for Programming Languages*]({{ site.url }}/posts/easy_PL1/) series continues with programming language theory. [*Software Foundations*](https://softwarefoundations.cis.upenn.edu/) offers a more systematic route into semantics and machine-assisted proof.

---

## 7. How the six main articles fit together

Each article has addressed a question:

| Article | Main question |
| --- | --- |
| Part 1 | How do sets, mappings, and semantic notation describe program concepts? |
| Part 2 | How does code become a CFG, and how do states change during execution? |
| Part 3 | When there are too many states, how can an abstract domain retain the properties we need? |
| Part 4 | How do transfer functions, joins, and a worklist compute a fixed point? |
| Part 5 | How do analyzers balance soundness, precision, and scale? |
| Part 6 | When an LLM contributes, how do we separate candidates from checked conclusions? |

Together, these questions give us a way to read a paper: identify the objects, follow their transformations, understand merging and convergence, then inspect the scope and assumptions behind the conclusions. The method remains useful whether the system uses classical analysis or an LLM.

---

## 8. From reading formulas to assessing evidence

### 8.1 Returning to the first formula

The series began with a familiar reading problem: a formula appears in a paper, its individual symbols look recognizable, but the whole line is difficult to parse.

Over six articles, we have developed a way to approach it. Sets and mappings tell us which objects the paper defines. A CFG describes where execution may go. States and transfer functions let us follow changes in information. Lattices, joins, and fixed points explain how an analyzer merges paths and stabilizes in the presence of loops.

Together, these ideas let us follow a paper's argument about a program:

$$
\text{program representation}
\longrightarrow
\text{information abstraction}
\longrightarrow
\text{state propagation}
\longrightarrow
\text{justification of the result}.
$$

### 8.2 Learning to ask precise questions

Formalization gives us a way to turn broad questions into specific ones:

- Which objects are we discussing?
- Which behaviors does the model cover?
- Which details does the abstraction discard?
- What guarantee does the result provide?
- Which premises does that guarantee depend on?

These questions matter when a model can quickly produce code, patches, tests, and explanations. Plausibility alone gives us limited confidence. Tests, static analyses, solvers, and machine-checked proofs make particular claims inspectable and open to challenge.

Look again at the formula from Part 1:

$$
\sigma:X\rightarrow V.
$$

You can now read it as “a program state maps each variable to a value.” You can also ask the next questions: are those values concrete or abstract? How is the state updated? How do paths merge? Which program behaviors does the final result cover?

When these questions come naturally, you have begun to develop the reading habit this series is meant to teach.

Models expand our ability to search for and generate software artifacts. Formal methods let us define and independently check some of the resulting claims. When combining them, ask:

> Which steps can rely on trial and conjecture, and which must produce reproducible, checkable evidence?

Drawing that boundary helps you assess the guarantee a software engineering method actually provides.

As programs, analyzers, and AI systems grow more complex, we still need to be able to answer:

> **Why should I trust this conclusion?**
{: .prompt-tip}

---

That completes the six main articles. Having seen how operational semantics, program proofs, abstract interpretation, and machine checking fit together, we can ask another question: what historical problems and practical difficulties led people to develop these ideas?

The history article, [*From “What Is Computation?” to “Can We Trust This Program?”*]({{ site.url }}/posts/Formalization7-en/), starts before the first computers. It follows the mathematicians, language designers, and programmers who gradually developed ways to describe and verify programs.

[Back to the series guide]({{ '/posts/Formalization-guide-en/' | relative_url }})
