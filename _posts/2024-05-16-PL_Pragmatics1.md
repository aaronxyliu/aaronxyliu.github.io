---
title: Programming Language Pragmatics
date: 2024-05-16 22:10:00 +500
math: true
categories: [Theory]
description: Why there are so many programming languages in the world? What's the art behind their miscellaneous designs?
tags: [note, lang-en, PL]
---

## The Programming Language Spectrum

The many existing languages can be classified into families based on their model of computation. Following table shows a common set of families. The top-level division distinguishes between **declarative** languages, in which the focus is on **what** the computer is to do, and the **imperative** languages, in which the focus is on **how** the computer should do it.

> - **declarative**
>   - **functional** (Lisp/Scheme, ML/OCaml, Haskell)
>   - **dataflow** (Id, Val)
>   - **logic, constraint-based** (Prolog, spreadsheets, SQL)
> - **imperative**
>   - **von Neumann** (C, Ada, Fortran)
>   - **object-oriented** (C++, Java, Rust)
>   - **scripting** (Perl, Python, JavaScript)

> Note that the programming languages categories are fuzzy, and open to debate. In particular, it is possible for a functional language to be object-oriented, and many authors do not consider functional programming to be declarative.
{: .prompt-tip }

Declarative languages are in some sense "higher level"; they are more in tune with the programmer's point of view, and less with the implementor's point of view. Imperative languages predominate mainly for performance reasons.

There is a tension in the design of declarative languages between the desire to get away from "irrelevant" implementation details and the need to remain close enough to the details at least control the outline of the algorithm. **The design of efficient algorithms, after all, is what much of computer science is about.**

It is not yet clear to what extent, and in what problem domains, we can expect compilers to discover good algorithms for problems stated at a very high level of abstraction. In any domain in which the compiler cannot find a good algorithm, the programmer needs to be able to specify one explicitly.

Within the declarative and imperative families, there are several important subfamilies:

- **Funcional Languages** employ a computational model based on the recursive definition of functions. They take their inspiration from the **lambda calculus**, a formal computational model developed by Alonzo Church in the 1930s. In essence, a program is considered a function from inputs to outputs, defined in terms of simpler functions through a process of refinement. Languages in this category include Lisp, ML/OCaml, and Haskell.

> If you want to have a comprehensive understanding of **lambda calculus**, the book [*Foundations for Programming Languages* by John C. Mitchell](https://softwarefoundations.cis.upenn.edu/plf-current/index.html) is one you must read.
{: .prompt-tip }

- **Dataflow Languages** model computations as the flow of information (*tokens*) among primitive functional *nodes*. They provide an inherently parallel model: nodes are triggered by the arrival of input tokens, and can operate concurrently. Id and Val are examples of dataflow languages. Sisal, a descendant of Val, is more often described as a functional language.

- **Logic or constrained-based languages** take their inspiration from prediate logic. They model computation as an attempt to find values that satisfy certain specified relationships, using goal-directed search through a list of logic rules. Prolog is the best-known logic language. The term is also sometimes applied to the SQL database language, the XSLT scripting language, and programmable aspects of spreadsheets such as Excel.

- The **von Neumann languages** are probably the most familiar and widely used. They include Fortran, Ada, C and all of others in which the basic means of computation is the **modification of variables**. Whereas functional languages are based on expressions that have values, von Neumann languages are based on statements (assignments in particular) that influence subsequent computation via the *side effect* of changing the value of memory.



