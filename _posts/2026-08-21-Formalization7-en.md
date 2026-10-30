---
title: "Formalization in Software Engineering (7): A Short History of Formal Methods"
date: "2026-08-21 10:00:00 +0800"
description: "Follow the people and problems behind computation, program semantics, verification, and modern formal methods."
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-en, SE, Formal Methods]
lang: en
translation_key: formalization-7
permalink: /posts/Formalization7-en/
series_navigation:
  previous: /posts/Formalization6-en/
---

<style>
  /* Chirpy 5.6.1 may leave its lazy-load shimmer over cached images. */
  .post-content a.img-link[href*="/formalization-history/"].shimmer::before {
    display: none;
    animation: none;
  }
</style>

Programs handle bank transactions, control cars, allocate cloud resources, and even generate other programs. Before computers existed, a more basic question was still open: what does it mean to carry out a calculation by following steps? Which problems can a machine solve, and which remain beyond it however much time we allow?

That question led in an unexpected direction. Mathematicians imagined machines on paper; programmers then invented languages for real machines. As programs grew, people had to ask what a line of code meant and why a whole program should be trusted. The **formalization of programming languages** developed through these questions.

The history is easiest to follow through the difficulties people encountered. Prose left language behavior ambiguous, prompting work on semantics. Tests could not cover every path, prompting work on proofs. Full proofs were costly to build for large codebases, encouraging automatic analysis. Operational semantics, Hoare logic, fixed points, and abstract interpretation each become easier to understand when we see the problems they helped address.

---

## 1. Before computers: what counts as computable?

In the early twentieth century, mathematicians sought rigorous formal foundations for mathematical reasoning. Could a mechanical procedure decide whether a statement in a precisely defined logical language was valid? Here “mechanical” meant that every step was explicit, requiring neither inspiration nor a guess from the person carrying it out.

But what exactly was a mechanical procedure? Without a definition of computation, there was no clear way to prove that a problem was computable, much less that it was not.

In the 1930s, Alonzo Church studied computable functions through the lambda calculus. Alan Turing imagined a calculating person following a fixed table of instructions: read a symbol on a tape, write a symbol according to the current state, move left or right, and enter a new state. This became the Turing machine. Although the approaches looked very different, they characterized the same class of computable functions, helping establish the basis of the Church–Turing thesis.

![Portrait of Alan Turing in 1951]({{ '/assets/img/2026-08-21/formalization-history/alan-turing-1951.webp' | relative_url }}){: width="200" height="240" }

_Alan Turing, photographed in 1951._
{: .text-center}

Turing's model made the execution of an algorithm explicit through local, unambiguous actions. The machine's situation at a particular step can be represented by a configuration:

$$
C=\langle q,\;t,\;i\rangle,
$$

Here $q$ is the control state, $t$ records the tape contents, and $i$ is the head position. A transition rule tells us how configuration $C$ becomes $C'$:

$$
C\longrightarrow C'.
$$

This already resembles the structure of modern program semantics: define a state, define one step of computation, then study where a sequence of steps can lead. The formal outline of execution was in place before general-purpose electronic computers.

> In Turing's paper, a “computer” was a person doing calculations. Turing restricted what that person could observe and remember, then expressed the permitted actions as rules. A model later read as a blueprint for a machine began with close attention to a person working with pencil and paper. See [*On Computable Numbers*](https://londmathsoc.onlinelibrary.wiley.com/doi/10.1112/plms/s2-42.1.230).
{: .prompt-info}

This early work also established limits: a question may be easy to state without admitting a general algorithm. From the beginning, formal models helped identify both what computation could achieve and what it could not. Later limits on termination checking, automated verification, and analysis precision trace back to these questions.

## 2. Programming languages: precise syntax, meanings still in prose

Early electronic programs were closely tied to particular machines. Programmers worked with instructions, addresses, and jumps; changing machines often meant rewriting the code. In the 1950s and 1960s, languages such as FORTRAN, Lisp, and ALGOL made it possible to discuss programs as texts beyond any one machine.

![Two staff members operating an IBM 704 for aeronautical research in 1957]({{ '/assets/img/2026-08-21/formalization-history/ibm-704-nasa-1957.webp' | relative_url }}){: width="680" height="539" }

_National Advisory Committee for Aeronautics (NACA) staff operating an IBM 704 in 1957. Early FORTRAN was developed for this machine._
{: .text-center}

This raised a new problem: how could different programmers and compilers agree on what a language meant?

The ALGOL 60 report used Backus–Naur Form (BNF) to describe syntax precisely. Productions specified which combinations of symbols formed valid assignments, conditions, loops, and procedures. The shape of a program became part of a public, inspectable language definition, separate from any compiler implementation.

Syntax alone, however, does not fully describe execution. This assignment is syntactically valid:

```text
x := x + 1
```

But when is the right-hand side evaluated? Which storage location does the variable refer to? What happens on integer overflow? If an expression is undefined, does execution stop or produce a value? Prose answers can leave room for implementations to disagree at the boundaries.

> The ALGOL 60 report gave precise syntax while describing much of the dynamic behavior in natural language. This contrast shows why the next step was difficult: specifying valid sentences was one task; assigning behavior to all of them required a stronger mathematical account.
{: .prompt-info}

A language definition needed to say what each construct meant and how the meaning of a larger program followed from its parts. Program semantics became central to that work.

## 3. Giving programs meaning: two kinds of map

There are several ways to answer “what does this program mean?” One approach describes its execution step by step. Another associates it with a mathematical object. These became the operational and denotational approaches to semantics.

Think of them as different maps of the same city. A route map helps you follow a journey from one stop to the next; a map of the terrain shows how places relate in a larger space. The useful view depends on the question.

### 3.1 Operational semantics: following execution

Operational semantics describes behavior through transitions between states. If $\sigma$ maps variables to values, an assignment can be written as:

$$
\langle x:=e,\sigma\rangle
\longrightarrow
\langle \texttt{skip},\sigma[x\mapsto [\![e]\!](\sigma)]\rangle.
$$

To execute `x := e` in state $\sigma$, evaluate $e$, update $x$ with the result, and replace the completed statement with `skip`. Similar rules describe loops, branches, and calls.

This view stays close to execution. An interpreter, a description of concurrent interleavings, or a compiler-correctness argument may need to account for individual steps. Gordon Plotkin's structural operational semantics (SOS) systematized the approach by defining the behavior of compound constructs through rules about their parts. The inference-rule bars and transition arrows in today's papers continue this tradition.

### 3.2 Denotational semantics: assigning a mathematical meaning

Denotational semantics maps each program fragment to a mathematical object. For example, a command can denote a function from an initial state to a final state:

$$
[\![c]\!]:\Sigma\rightharpoonup\Sigma.
$$

The partial arrow allows a command to have no final state when it does not terminate. Programs assigned the same mathematical object have the same denotation in that model. Compound meanings are built from the meanings of the parts: `c1; c2` denotes the composition of two state transformations. This *compositionality* lets us reason from components without unfolding the whole program every time.

Christopher Strachey and Dana Scott developed this approach in the late 1960s and early 1970s. Recursion posed a problem: if a function's definition refers to itself, how can its meaning be defined without circularity? Scott's domain theory provided suitable mathematical domains, using partial orders and fixed points to interpret recursive definitions. The lattices, monotone functions, and least fixed points we encounter in analysis have roots in this effort to explain recursive computation.

> Scott and Strachey described a difficulty in their early work: they had useful semantic intuitions, but some of the function spaces they wanted were not straightforward constructions in ordinary set theory. The programming problem demanded new mathematical foundations. See [*Toward a Mathematical Semantics for Computer Languages*](https://www.cs.ox.ac.uk/files/3228/PRG06.pdf).
{: .prompt-info}

Researchers could now describe how a program ran and what mathematical object it denoted. As software became something to deliver and maintain, another question grew urgent: could we prove that it met its requirements?

## 4. Growing software and the problem of trust

Semantics also answered practical pressures. During the 1960s, software systems grew in size and importance, bringing delays, cost overruns, and reliability problems. The 1968 NATO Software Engineering Conference in Garmisch, Germany, gathered researchers and practitioners from several countries to discuss the design, production, distribution, and maintenance of large systems.

The report records lively disagreements. Participants worried about software in critical systems, projects missing their schedules or failing to meet specifications, and whether software should be priced separately from hardware. “Software crisis” became the familiar description, but a concrete change lay behind it: programs had outgrown what a few experts could hold in their heads.

Tests remained essential, but they showed only what happened in the executions performed. Ten thousand passing tests did not establish that the next input would avoid a missed path. Branches, loops, and combinations of inputs called for arguments covering classes of executions.

### 4.1 Axiomatic semantics: reasoning about preconditions and postconditions

Robert Floyd and Tony Hoare supplied a language for such arguments. Their work was not simply a consequence of one conference, but shared the period's concern with reliability. In 1967, Floyd showed how to attach assertions to key points of a flowchart and establish that they held as control moved along its edges. In 1969, Hoare organized related ideas into axioms and inference rules for program constructs.

Axiomatic semantics focuses on properties of programs. A partial-correctness Hoare triple says that if precondition $P$ holds before command `c` executes, then postcondition $Q$ holds if execution terminates:

$$
\{P\}\ c\ \{Q\}.
$$

For example:

$$
\{x=0\}\ x:=x+1\ \{x=1\}.
$$

For a loop, we seek an invariant that holds before entry, is preserved by each iteration, and establishes the desired property on exit. We do not enumerate the traces for zero, one, or a million iterations. A finite proof can constrain arbitrarily many potential iterations, making a program an object of proof as well as execution.

### 4.2 Dijkstra: letting specifications guide construction

Edsger W. Dijkstra pursued the idea of deriving programs from the properties they should satisfy. Weakest preconditions work backward from a desired postcondition $Q$: what must hold before command $c$ to guarantee $Q$ afterward?

$$
wp(c,Q)=P.
$$

Specifications could now guide construction, rather than serve only as checks on finished code. Structured programming fits this reasoning well: sequences, branches, and loops have compositional control structures that make execution easier to describe and reason about.

![Edsger Dijkstra explaining program derivation at a blackboard at ETH Zurich in 1994]({{ '/assets/img/2026-08-21/formalization-history/edsger-dijkstra-1994.webp' | relative_url }}){: width="680" height="466" }

_Dijkstra teaching program derivation at ETH Zurich in 1994. Guarded commands and their properties appear on the left of the blackboard._
{: .text-center}

> Dijkstra submitted his article as *A Case against the GO TO Statement*. Editor Niklaus Wirth changed the title to *Go To Statement Considered Harmful*. “X considered harmful” became a title pattern that lasted for decades. Dijkstra later remarked that many people seemed to have read only the title; there was even an article called “Dijkstra considered harmful.” He recalls the episode in [EWD1308](https://www.cs.utexas.edu/~EWD/transcriptions/EWD13xx/EWD1308.html).
{: .prompt-info}

## 5. Bringing proofs into the machine

A proof can cover more than a collection of tests, but handwritten proofs can also contain mistakes. A reader may miss a premise, misapply a rule, or overlook a substitution error buried in hundreds of steps. If a proof follows formal rules, could a computer check those rules too?

### 5.1 A small kernel and a limited trusted base

In 1972, Robin Milner developed Stanford LCF, or Logic for Computable Functions. The later Edinburgh LCF system established an influential architecture: sophisticated tactics can search for proofs, but only a small trusted kernel can construct values of the abstract theorem type. A faulty tactic may fail to prove its goal; provided it cannot bypass the kernel, it cannot construct a theorem that the kernel's inference rules do not justify.

Trust is concentrated in a small checker instead of spread across the entire automation system. ML was developed as a metalanguage for writing proof tactics in this setting. Programming languages, type systems, and proof tools met in one project: work on proving programs helped create another language for programming.

> Early LCF faced memory limits from storing full proofs, as well as limited extensibility in its proof commands. Edinburgh LCF addressed these problems through programmable tactics and a small kernel responsible for trusted inferences. Powerful search with a small trusted base remains an important proof-assistant design. See Cambridge's [history of LCF and HOL](https://www.cl.cam.ac.uk/archive/mjcg/papers/HolHistory.html).
{: .prompt-info}

### 5.2 Proofs and programs in a shared language

The Curry–Howard correspondence provides another connection: propositions can be viewed as types, and proofs as programs inhabiting those types. Proving a proposition corresponds to constructing a term of the required type; checking the proof becomes type checking.

This connection influenced proof assistants including Coq, Agda, and Lean. Types can describe more than distinctions such as integers and strings: they can express list lengths, resource states, protocol stages, and relationships between inputs and outputs. Specifications, implementations, and correctness proofs can then share a formal framework.

Machine checking still leaves substantial work for people. Definitions, lemmas, and abstractions have to be chosen. Automation can handle routine deductions and consistency checks, while people guide the argument and decide what it should establish.

## 6. When full proofs cost too much: automatic analysis

Writing a specification and checking a proof offers strong evidence, but large systems include millions of lines of code, external libraries, and changing requirements. Constructing detailed proofs can be expensive. Engineers also need tools that automatically answer selected questions without trying to describe everything about the program.

### 6.1 Abstract interpretation: computable approximation

In 1977, Patrick Cousot and Radhia Cousot introduced a unified framework for abstract interpretation. It maps concrete execution into a smaller abstract world, with relationships that ensure abstract results safely cover concrete behavior.

![Patrick Cousot photographed in 2007]({{ '/assets/img/2026-08-21/formalization-history/patrick-cousot-2007.webp' | relative_url }}){: width="600" height="400" }

_Patrick Cousot in 2007._
{: .text-center}

A variable ranging over arbitrary integers gives us infinitely many concrete possibilities. If we only care about signs, a few abstract values can represent them:

$$
\mathbb{Z}\quad\Rightarrow\quad
\{\textsf{Neg},\textsf{Zero},\textsf{Pos},\top,\bot\}.
$$

Instead of remembering `x = 173`, the analyzer records that `x` is positive. It gives up the exact value while preserving information about the sign. Joins combine information at control-flow merges, and fixed-point computation stabilizes the analysis of loops. Widening can force convergence when the domain admits infinite ascending chains.

This framework connects semantics to algorithms. Concrete semantics describes execution, abstraction determines which details can be discarded, and ordered structures and fixed points explain how to compute the approximation. Nullness, interval, taint, and many compiler data-flow analyses can be understood within this framework. The Cousots' original paper uses sign rules to illustrate abstract execution; see the [1977 paper and abstract](https://www.di.ens.fr/~cousot/COUSOTpapers/POPL77.shtml).

For the technical steps, return to [*Keeping What Matters: From Concrete States to Abstract Interpretation*]({{ site.url }}/posts/Formalization3-en/) and [*Why Does the Analyzer Stop? Transfer Functions and Fixed Points*]({{ site.url }}/posts/Formalization4-en/).

### 6.2 Model checking: systematically searching a state space

Model checking provided another route to automated verification. A finite-state model describes the system, and temporal logic expresses properties such as “an error state is never reached” or “every request eventually receives a response.” An algorithm checks the state space against the property, often producing a counterexample path when it fails.

That feedback is useful to engineers: they can see how the system reaches an error. But composing even a few components can make the combined state space enormous. Symbolic representations, partial-order reduction, and bounded model checking all address aspects of this state-explosion problem.

In 2007, Edmund Clarke, E. Allen Emerson, and Joseph Sifakis received the Turing Award for their role in developing model checking into a widely used verification technology. Formal methods had become part of hardware and software engineering practice.

## 7. Formal semantics in real systems

In the twenty-first century, formalization has become part of engineering infrastructure. Compiler optimizations need arguments that transformations preserve observable behavior. Concurrent systems need accounts of messages, locks, and memory accesses. Security protocols need models of what an attacker can know. Type checkers and static analyzers run inside editors and CI systems.

CompCert is a representative example. It defines formal semantics for a substantial C language and several target assembly languages, then uses Coq proofs to establish preservation of program behavior through compilation. The verification concerns the compiler used to build applications. A correct source program can still be undermined by incorrect compilation; CompCert addresses that part of the trust chain.

Success can also mean choosing a useful boundary for verification: clarifying an ambiguous language rule, modeling a protocol's core state machine, establishing an analyzer's coverage guarantee, or checking a proof certificate from an external tool with a small kernel.

> Formal semantics can expose cases that implementers know well but standards describe ambiguously. When compilers disagree on boundary behavior, the written specification may be part of the problem. Making the semantic rule explicit can itself be an engineering repair.
{: .prompt-info}

Practical tools often combine approaches. A verified compiler may use operational semantics for its source and target languages, connect them through simulation or logical relations, and check the proof in a proof assistant. An analyzer may start from collecting semantics and derive an algorithm through abstract interpretation. The task determines how the ideas fit together.

## 8. What this history helps us ask

Since the 1930s, formalization has repeatedly faced the same difficulty: real programs are too complex to understand by intuition alone, but a model retaining every detail can be just as difficult to handle. Progress depends on choosing what to keep, what to omit, and who or what checks the result.

Turing machines describe computational steps without modeling the physical construction of a machine. Denotational semantics associates programs with mathematical objects. Hoare logic follows properties expressed as preconditions and postconditions. Abstract interpretation compresses states to make selected questions computable at scale. Proof assistants place the checking of formal inferences in a small trusted core.

These are ways of managing complexity. Semantics fixes meanings, logic organizes arguments, abstraction controls the amount of information, and machine checking catches errors in formal reasoning.

When you read a rule today, ask questions that this history has made familiar: what counts as a state? Does the rule describe execution, mathematical meaning, or preconditions and postconditions? Which details were abstracted away? Does the conclusion rest on a handwritten argument, automatic search, or a checkable proof? Those questions still shape languages, analyzers, and verification systems.

Future programs may be described in natural language, generated by models, and submitted to verifiers. Languages may carry richer specifications and proofs. Whatever the interface, we will still need to ask what a program does and why its behavior should be trusted.

> **An intuition to keep**
>
> Formalization gives us a shared, checkable language for describing what programs mean, how they can run, and why they meet their requirements.
{: .prompt-tip}

## 9. Further reading

The original materials below give a closer view of the questions people were asking. Choose a point in the history that interests you:

1. Alan Turing, [*On Computable Numbers, with an Application to the Entscheidungsproblem*](https://londmathsoc.onlinelibrary.wiley.com/doi/10.1112/plms/s2-42.1.230), 1936/1937.
2. NATO Science Committee, [*Report on the 1968 NATO Software Engineering Conference*](https://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF), for the debates surrounding early large-scale software engineering.
3. Robert Floyd, [*Assigning Meanings to Programs*](https://www.lem12.uksw.edu.pl/images/1/15/AssigningMeanings1967.pdf), 1967.
4. Tony Hoare, [*An Axiomatic Basis for Computer Programming*](https://doi.org/10.1145/363235.363259), 1969.
5. Dana Scott and Christopher Strachey, [*Toward a Mathematical Semantics for Computer Languages*](https://www.cs.ox.ac.uk/files/3228/PRG06.pdf), 1971.
6. Gordon Plotkin, [*A Structural Approach to Operational Semantics*](https://homepages.inf.ed.ac.uk/gdp/publications/), 1981.
7. Patrick Cousot and Radhia Cousot, [*Abstract Interpretation: A Unified Lattice Model for Static Analysis of Programs by Construction or Approximation of Fixpoints*](https://www.di.ens.fr/~cousot/COUSOTpapers/POPL77.shtml), 1977.
8. The [CompCert project](https://compcert.org/), for an example of formal semantics and machine-checked proofs in a working compiler.

<details class="mt-4">
  <summary>Image credits and licenses</summary>
  <small>Dijkstra photograph by <a href="https://commons.wikimedia.org/wiki/File:Edsger_Dijkstra_1994.jpg">Andreas F. Borchert</a>, licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Patrick Cousot photograph by <a href="https://commons.wikimedia.org/wiki/File:Patrick_Cousot_0736.jpg">Rama</a>, licensed under <a href="https://creativecommons.org/licenses/by-sa/2.0/fr/deed.en">CC BY-SA 2.0 France</a>.</small>
</details>

[Back to the series guide]({{ '/posts/Formalization-guide-en/' | relative_url }})
