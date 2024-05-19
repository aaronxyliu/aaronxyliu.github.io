---
title: Programming Language Pragmatics
date: 2024-05-16 22:10:00 +500
math: true
categories: [Theory, Programming Language]
tags: [note, lang-en, PL]
---

Why are there so many programming languages in the world? What's the art behind their miscellaneous designs? 

Nowadays, there are thousands of high-level programming languages, and new ones continue to emerge. These languages belong to different categories and no single factor determines which category is better than others. In this article, we will go through the design ideas behind different languages and try to reach a landscape of programming languages.


## The Programming Language Spectrum

The many existing languages can be classified into families based on their model of computation. Following list shows a common set of families. The top-level division distinguishes between **declarative** languages, in which the focus is on **what** the computer is to do, and the **imperative** languages, in which the focus is on **how** the computer should do it.

 - **declarative**
   - **functional** (Lisp/Scheme, ML/OCaml, Haskell)
   - **dataflow** (Id, Val)
   - **logic, constraint-based** (Prolog, spreadsheets, SQL)
 - **imperative**
   - **von Neumann** (C, Ada, Fortran)
   - **object-oriented** (C++, Java, Rust)
   - **scripting** (Perl, Python, JavaScript)

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

- **Object-oriencted languages** trace their roots to Simula 67. Most are closely related to the von Neumann languages, but have a much more structured and distributed model of both memory and computation. Rather than picture computation as the operation of a monolithic processor on a monolithic memory, object-oriented languages picture it as interactions among semi-independent *objects*, each of which has both its own internal states and subroutines (methods) to manage that state. C++ and Java are probably the most widely used object-oriented languages. 

> It is also possible to devise object-oriented functional languages, but they tend to have a strong imperative flavor. The best known of these is [OCaml](https://ocaml.org/), a dialect of [ML](https://cs.lmu.edu/~ray/notes/introml/).
{: .prompt-tip }

- **Scripting languages** are distinguished by their emphasis on coordinating or "gluing together" components drawn from some surrounding context. Several scripting languages were originally developed for specific purpose: bash is the input languages of job control (shell) programs; PHP and JavaScript are primarily intended for the generation of dynamic web content; Lua is widely used to control logic of computer games. Other languages, including Perl, Python, and Ruby, are more deliberately general purpose. Most place an emphasis on rapid prototyping, with a bias toward ease of expression over speed of execution.

One might suspect that concurrent (parallel) languages would form a seperate family, but the distinction between concurrent and sequential execution is mostly independent of the classification above.

Most concurrent programs are currently written using special library packages or compilers in conjunction with a sequential language such as C. A few widely used languages, including Java and C#, have explicitly concurrent features.


## Example to Illustrate Language Families

As a simple example of the contrast among language families, consider calculating the greatest common divisor (GCD) of two integers using [Euclid's algorithm](https://en.wikipedia.org/wiki/Euclidean_algorithm).

The choice among, say, von Neumann, functional, or logic programming for this problem influences not only the appearance of the code, but **how the programmer thinks**. 

### The von Neumann Style

The von Neumann algorithm version of the algorithm is very imperative:

> To compute the `gcd` of `a` and `b`, check to see if `a` and `b` are equal. If so, print one of them and stop. Otherwise, replace the larger one by their difference and repeat.

C code for this algorithm is shown below.

```c
int gcd(int a, int b) {
    while (a != b) {
        if (a > b) a = a - b;
        else b = b - a;
    }
    return a;
}
```


### Functional Style

In a functional language, the emphasis is on the mathmatical relationship of outputs to the inputs:

> The `gcd` of `a` and `b` is defined to be (1) `a` when `a` and `b` are equal, (2) the `gcd` of `b` and `a - b` when `a > b`, and (3) the `gcd` of `a` and `b - a` when `a < b`. To compute the `gcd` of a given pair of numbers, expand and simplify this definition until it terminates.

An OCaml verison of this algorithm is shown below. The keyword `let` introduces a definition; `rec` indicates that it is permitted to be recursive (self-referential); arguments for a function come between the name (in this case, `gcd`) and the equals sign.

```ocaml
let rec gcd a b =
    if a = b then a
    else if a > b then gcd b (a - b)
         else gcd a (b - a)
```


### Logic Style

In a logic language, the programmer specifies a set of axioms and proof rules that allows the system to find desired values:

> The proposition `gcd(a, b, g)` is true if (1) `a`, `b`, and `g` are all equal; (2) `a` is greater than `b` and there exists a number `c` such that `c` is `a - b` and `gcd(c, b, g)` is true; or (3) `a` is less than `b` and there exists a number `c` such that `c` is `b - a` and `gcd(c, a, g)` is true. To compute the `gcd` of a given pair of numbers, search for a number `g` (and various numbers of `c`) for which these rules allow one to prove that `gcd(a, b, g)` is true.

A Prolog version of this algorithm is shown below. It may be easier to understand if one reads "if" for `:-` and "and" for commmas.

```prolog
gcd(A,B,G) :- A = B, G = A
gcd(A,B,G) :- A > B, C is A-B, gcd (C,B,G)
gcd(A,B,G) :- A < B, C is B-A, gcd (C,A,G)
```

It should be emphasized that the distinctions among language families are **not** clear-cut. The division between the von Neumann and object-oriented languages, for example, is often very fuzzy, and many scripting languages are also object-oriented.


