---
title: 软件工程形式化入门（三）：不用记住每个值——从具体状态走向抽象解释
date: "2026-08-17 13:30:00 +0800"
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-zh, SE]
---

假设我们想检查一个来自用户输入的整数是否可能越界。最直接的办法，是记录它在每条执行路径上的确切取值；可惜输入可能有无穷多种，循环还会不断产生新状态。分析器如果坚持“一个值也不丢”，很快就会被这些细节淹没。

```javascript
x = input();

if (x > 100) {
    ...
}
```

真正有用的问题往往不是“`x` 到底等于多少”，而是“它是否为正”“是否可能为空”或“是否来自不可信输入”。静态分析因此有意忘掉无关细节，只保留足以回答当前问题的信息。这种用有限表示覆盖大量具体状态的方法，就是**抽象解释（Abstract Interpretation）**。

前两篇已经把代码表示成 CFG，并把程序状态写成变量到值的映射；本文在此基础上回答“状态太多时怎么办”。我们会从 concrete domain 一步步走向 abstract domain，通过具体分析任务解释偏序、join、$\top$ 与 $\bot$ 为什么出现，以及这些概念怎样支撑不同的静态分析。

---

## 一、抽象就是有目的地忘记细节

程序真正运行时，一次执行只会遇到一个具体输入。执行 `x = 10` 后，我们可以直接记录 $x=10$。静态分析发生在运行之前，需要同时覆盖许多可能输入；若 `x` 来自用户，它的取值集合可能是整个整数集：

$$
\{\ldots,-2,-1,0,1,2,\ldots\}.
$$

逐个保存这些值既没有必要，也通常不可行。假如分析目标只是判断正负，$-100$ 与 $-1$ 对后续规则没有区别，可以统一记为 `Negative`。这种压缩会丢失具体数值，却保留当前问题需要的性质。

但抽象不是随意模糊，丢失细节必须有明确目标。空指针分析会区分 `Null` 与 `NonNull`，污点分析会区分 `Tainted` 与 `Untainted`，区间分析则保留数值上下界。对一个任务有用的抽象，对另一个任务可能毫无帮助。

更重要的是，抽象结果必须覆盖它代表的具体情况。如果 `Positive` 代表所有正整数，就不能漏掉其中某些值；如果 $\top$ 代表任意整数，就不能在后续步骤中把它当成一个确定常量。

> 抽象解释不是“少算一点”的模糊技巧，而是围绕分析目标设计一种**可计算的、安全的近似表示**。
{: .prompt-tip}

---

## 二、Concrete Domain 与 Abstract Domain

### 2.1 两个域分别保存什么？

Concrete domain（具体域）描述程序实际可能出现的值或状态。若只讨论整数值，可以写成：

$$
V=\mathbb{Z}.
$$

程序状态仍然是第一篇介绍的映射：

$$
\sigma:X\rightarrow V.
$$

例如，$\sigma=\{x\mapsto10\}$ 表示当前状态把变量 `x` 映射到具体整数 10。整个具体状态空间通常记为 $\Sigma$。

与保存真实取值的 concrete domain 不同，abstract domain 只保留分析关心的性质。如果只关心整数的正负，可以使用一个简单的抽象值域：

$$
\hat{V}
=
\{\bot,Negative,Zero,Positive,\top\}.
$$

它把许多具体值压缩成少量类别：

$$
-10\mapsto Negative,
\qquad
0\mapsto Zero,
\qquad
20\mapsto Positive.
$$

$\top$ 表示信息不足，正、零、负都有可能；$\bot$ 表示没有对应的具体取值，常用来描述不可达路径。符号上方的帽子是一种常见约定，提醒读者 $\hat{V}$ 属于抽象世界，而 $V$ 属于具体世界。

### 2.2 抽象函数与具体化函数

有些论文会把两个世界之间的联系显式写出来。抽象函数 $\alpha$ 把一组具体值压缩为抽象值：

$$
\alpha:\mathcal{P}(V)\rightarrow\hat{V}.
$$

例如：

$$
\alpha(\{-10,-2,-1\})=Negative.
$$

具体化函数 $\gamma$ 则说明一个抽象值覆盖哪些具体值：

$$
\gamma:\hat{V}\rightarrow\mathcal{P}(V),
$$

$$
\gamma(Positive)=\{n\in\mathbb{Z}\mid n>0\}.
$$

其中 $\mathcal{P}(V)$ 表示 $V$ 的幂集，也就是所有具体值集合组成的集合。初读论文时不必立即掌握 Galois connection；先记住 $\alpha$ 负责压缩、$\gamma$ 负责解释抽象值代表什么，就足以理解大部分定义。

---

## 三、从 Concrete State 到 Abstract State

具体状态把变量映射到具体值：

$$
\sigma:X\rightarrow V.
$$

抽象状态则把同一组变量映射到抽象值：

$$
\hat{\sigma}:X\rightarrow\hat{V}.
$$

例如，具体状态 $\sigma=\{x\mapsto42\}$ 可以对应抽象状态：

$$
\hat{\sigma}=\{x\mapsto Positive\}.
$$

后者无法恢复 42，却足以回答“`x` 是否可能为负”。因此，抽象状态不是一个不完整的具体状态，而是为特定分析重新设计的状态表示。

最简单的状态抽象会把每个变量的具体值分别转换成抽象值：

$$
\alpha_\Sigma(\sigma)(x)=\alpha_V(\{\sigma(x)\}).
$$

但并非所有抽象都逐变量独立工作。区间域只记录每个变量的范围，而关系型数值域还可能保留 $x-y\leq3$ 这类变量关系。抽象状态能表达什么，取决于所选 abstract domain 的结构与成本。

---

## 四、路径合并为什么需要 Lattice？

### 4.1 从路径汇合到有序结构

考虑一个布尔变量：

```javascript
if (condition) {
    x = true;
} else {
    x = false;
}

use(x);
```

到达 `use(x)` 时，一条路径得到 `true`，另一条得到 `false`。分析器既不能任选一条，也不能继续假装值已经确定；它需要一个能够同时代表两种可能的结果 $\top$。

这说明 abstract domain 不能只列出“有哪些抽象值”，还必须回答两个问题：抽象值之间怎样比较，多条路径的信息怎样合并。Lattice（格）正是组织这套关系的结构。布尔值的一个简单 lattice 可以画成：

```text
          ⊤          true 或 false
         / \
      true  false
         \ /
          ⊥          没有可达状态
```

这里，$\bot$ 不表示“完全不知道”，而表示当前没有任何可能的具体状态；$\top$ 才表示信息最不精确，既可能为 `true`，也可能为 `false`。混淆这两个符号会直接读反分析结果。

Lattice 上的偏序通常写作 $\sqsubseteq$。本文采用抽象解释中常见的方向：越靠上覆盖的具体情况越多，结果也越不精确。例如：

$$
\bot\sqsubseteq true\sqsubseteq\top,
\qquad
\bot\sqsubseteq false\sqsubseteq\top.
$$

`true` 与 `false` 彼此不可比较，因为任何一个都不能代表另一个。不同论文可能把顺序方向定义得相反，所以阅读时应优先查看作者的定义，而不是只凭箭头或“大小”猜测。

### 4.2 Join、最小上界与 complete lattice

Join 写作 $\sqcup$，是路径汇合时最常见的操作：

$$
true\sqcup false=\top,
$$

$$
true\sqcup true=true,
$$

$$
\bot\sqcup true=true.
$$

从数学上看，$a\sqcup b$ 是 $a$ 与 $b$ 的 least upper bound（最小上界）：它能够同时覆盖两者，又不会比必要程度更粗。于是，join 同时体现了静态分析的两个目标——不遗漏任何输入路径，并尽量少丢失精度。

> 在汇合点看到 $\hat{\sigma}_1\sqcup\hat{\sigma}_2$ 时，可以直接读成：“把两条路径的可能状态安全地合在一起。”
{: .prompt-tip}

Join 定义了路径如何汇合，complete lattice 则把这一要求推广到任意抽象值集合：它要求每个这样的集合都有最小上界和最大下界。这类结构为定义不动点提供了良好基础，但它本身不保证迭代一定在有限步内结束。若抽象域存在无限上升链，分析器仍可能需要 widening；这个问题将在第五篇详细讨论。

如果想继续学习偏序、最小上界、CPO 和 $\bot$，可以阅读站内的 [*Denotational Semantics of Typed Lambda Calculus II — Partial Orders and Continuous Functions*]({{ site.url }}/posts/model2/#partial-orders)。那篇文章面向指称语义，背景与本文不同，但使用的有序结构与不动点直觉是相通的。

---

## 五、Abstract Domain 决定分析器能回答什么

### 5.1 同一框架可以承载不同任务

许多看似不同的静态分析，都可以理解为“为每个程序位置计算抽象状态”。真正变化的是 abstract domain 保存的性质：

| 分析任务 | 典型抽象信息 | 想回答的问题 |
| --- | --- | --- |
| Nullness analysis | `Null`、`NonNull`、$\top$ | 变量是否可能为空？ |
| Taint analysis | `Tainted`、`Untainted`、$\top$ | 数据是否可能来自不可信输入？ |
| Constant propagation | 常量、$\top$ | 变量是否拥有确定常量？ |
| Interval analysis | $[a,b]$ | 数值可能落在哪个范围？ |
| Type analysis | 可能的运行时类型集合 | 调用可能分派到哪些实现？ |

选择更丰富的抽象域通常能回答更细的问题，也会增加 join、transfer function 和状态存储的成本。设计 abstract domain，本质上是在决定分析器值得记住什么。

### 5.2 阅读论文时先寻找四项定义

看到一套新的 abstract semantics，可以依次寻找：

1. **Concrete domain**：论文想覆盖哪些真实值或程序状态？
2. **Abstract domain**：分析器实际保存哪些性质？
3. **Order 与 join**：抽象值怎样比较，多条路径怎样汇合？
4. **Concretization**：一个抽象值究竟代表哪些具体情况？

回答完这些问题，论文中的帽子、$\top$ 与 $\sqcup$ 就不再是孤立符号，而会组成一套清晰的数据表示。

为了在阅读时快速定位这些定义，可以把本篇的常见符号整理如下：

| 符号 | 常见含义 |
| --- | --- |
| $V$、$\Sigma$ | concrete value domain 与 concrete state space |
| $\hat{V}$、$\hat{\Sigma}$ | abstract value domain 与 abstract state space |
| $\sigma$、$\hat{\sigma}$ | concrete state 与 abstract state |
| $\alpha$ | 把具体信息压缩成抽象信息 |
| $\gamma$ | 解释抽象值覆盖哪些具体情况 |
| $\bot$ | 没有可能的具体状态，常表示不可达 |
| $\top$ | 最不精确，覆盖当前域中的所有可能值 |
| $\sqsubseteq$ | 抽象值之间的近似或精确度关系 |
| $\sqcup$ | join，合并不同路径的信息 |

---

## 六、本篇小结

抽象解释最重要的直觉，不是记住 lattice 的所有公理，而是理解分析器为什么需要有目的地忘记细节。Concrete state 描述一次执行中的真实取值，abstract state 只保留当前任务关心的性质；偏序说明哪个抽象结果覆盖更多可能，join 则让不同路径能够安全汇合。

阅读程序分析论文时，可以沿着下面的路线定位核心设计：

$$
\text{分析目标}
\longrightarrow
\text{Abstract Domain}
\longrightarrow
\text{Order 与 Join}
\longrightarrow
\text{Abstract State}.
$$

到这里，我们已经知道分析器“保存什么”，却还没有让这些信息沿 CFG 真正流动起来。下一篇 [*分析器为什么会停下来？从 Transfer Function 到不动点*]({{ site.url }}/posts/Formalization4/) 将用 transfer function、worklist 和 fixed point 补上这一步。
