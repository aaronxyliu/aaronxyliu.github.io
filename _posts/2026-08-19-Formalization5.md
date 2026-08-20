---
title: 软件工程形式化入门（五）：准确、快速，还是可靠？静态分析的工程取舍
date: "2026-08-19 14:30:00 +0800"
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-zh, SE]
---

凌晨两点，一个静态分析任务还在 CI 服务器上运行。它确实比旧版本精确：区分了更多调用上下文，也追踪了更多路径；可开发者已经等了四十分钟，最后选择跳过检查。另一套工具只用两分钟，却一次报告了几百条警告，其中大部分并不会发生，同样没人愿意逐条处理。

这两个失败指向同一个事实：理论上正确的分析，还不一定是工程上可用的分析。真实工具必须同时考虑是否漏掉行为、结果是否足够精确、算法能否终止，以及它能否承受代码库的规模。提高其中一项，常常会让另外几项付出代价。

上一篇已经用 transfer function、join 和 worklist 构造出静态分析的基本循环。本文把这套循环放进真实软件工程环境：先处理无限高抽象域带来的终止问题，再讨论 soundness、precision 与 scalability 之间的关系。在此基础上，我们会观察 flow、path 和 context sensitivity 如何改变分析成本，并借 Astrée、Clang Static Analyzer、Infer 和 MOPSA 理解不同工程目标如何塑造工具设计。

---

## 一、不动点存在，不等于很快算得出来

在有限高度的抽象域中，状态不可能永远严格上升，worklist 最终会清空。但区间分析使用的值域包含无限多个区间。沿用上一篇中不断执行 `x = x + 1` 的循环，如果分析器逐轮扩大 `x` 的上界，就可能得到：

$$
[0,0]
\sqsubseteq
[0,1]
\sqsubseteq
[0,2]
\sqsubseteq
\cdots
$$

这些区间一直逼近 $[0,+\infty]$，却不会在有限轮内到达它。最小不动点可以在数学上存在，朴素迭代仍然可能永不结束。

这时，问题不再是“怎样定义正确答案”，而是“怎样在有限时间内得到一个安全近似”。

为了解决这个问题，**widening（加宽）**通常写作 $\nabla$。它观察抽象状态的增长趋势，并主动跳到更宽的结果。例如，标准区间 widening 可以把：

$$
[0,1]\nabla[0,2]
=
[0,+\infty].
$$

新结果放弃了有限上界，但一次覆盖了后续所有 $[0,n]$。这会损失精度，却截断了无限上升链，使分析能够继续并最终停止。

> Widening 的目标不是“猜出最精确的不动点”，而是**在保留 soundness 的前提下保证或加速收敛**。
{: .prompt-tip}

有些分析还会在 widening 达到稳定后执行 **narrowing（收窄）**，利用传递规则重新找回一部分精度。可以把两者理解为：先跨大步抵达安全区域，再小心地往回收紧边界。

Widening 在哪里、何时发生，也会影响结果。如果每个节点一有变化就 widening，分析很快，却可能过早得到大量 $\top$。实际实现往往只在循环头等特定位置使用 widening，也可能先进行若干轮普通 join，再启动 widening。这些策略不会改变抽象解释的基本框架，却会显著影响运行时间和误报数量。

---

## 二、Soundness 与 Precision 不是一回事

### 2.1 Soundness 与 precision 的区别

对于过近似静态分析，soundness 可以写成：

$$
\text{Concrete Behaviors}
\subseteq
\gamma(\text{Abstract Result}),
$$

其中 $\gamma$ 把抽象结果解释回它覆盖的具体行为。这个包含关系意味着：只要程序语义、环境模型和检查目标都在分析范围内，真实执行就不能跑到抽象结果之外。

Soundness 最重要的用途是支撑“没有错误”的结论。如果 sound 分析器证明某类错误不在抽象结果中，那么这类错误在被建模的执行中也不会发生。反过来，当抽象结果包含某个错误时，它只说明错误**可能**发生，并不保证一定有真实路径能够触发。

因此，soundness 不等于“每条警告都是真的”。恰恰相反，sound 的过近似分析允许 false positive（误报），但不能因为近似而漏掉范围内的真实行为。

两个分析都可以 sound，但一个比另一个更精确。假设分析 A 得到：

$$
x\in[0,10],
$$

分析 B 只得到：

$$
x\in[-\infty,+\infty].
$$

只要真实值始终位于 $[0,10]$，两者都覆盖真实行为；A 的范围更窄，因此 precision 更高。更精确的状态通常能排除更多不可能路径，减少误报，但也需要更复杂的抽象域、更多上下文或更大的状态空间。

### 2.2 Scalability：分析能否进入日常工作流

Scalability 不只是“理论复杂度是否好看”，还包括内存占用、增量更新、并行能力、库模型成本和结果返回时间。一个方法即使 sound 且精确，如果每次提交都需要重新分析整个仓库，也很难进入持续集成。

这三个目标不是一条简单的跷跷板：改进算法有时可以同时提升它们。但在固定资源下，更细的路径、上下文和关系通常意味着更多状态，工具仍然需要根据使用场景作出选择。

| 目标 | 主要问题 | 常见代价 |
| --- | --- | --- |
| Soundness | 是否覆盖建模范围内的真实行为？ | 可能保留不可能路径并产生误报 |
| Precision | 抽象结果是否足够接近真实行为？ | 更复杂的域与更多分析状态 |
| Scalability | 能否在目标代码规模和时间预算内运行？ | 可能需要摘要、增量分析或更粗的近似 |

---

## 三、精度具体从哪里来？

Flow-sensitive analysis 为不同程序位置保存不同状态。例如：

```javascript
x = null;
x = new Object();
use(x);
```

第一行之后 `x` 是 `Null`，第二行之后则是 `NonNull`。上一篇中的 $IN[n]$ 与 $OUT[n]$ 本身就是 flow-sensitive 表示。Flow-insensitive 分析可能只为整个函数保存一个合并状态，成本更低，却容易把两个时刻的信息混在一起。

在区分程序位置之外，path-sensitive analysis 还会区分控制流路径。考虑：

```javascript
if (x != null) {
    use(x);
}
```

Path-sensitive analysis 会把条件加入当前路径约束，因此进入 true 分支后可以使用 $x\neq null$。如果过早合并分支，这条信息就可能丢失。

代价也很直接：每个条件都可能复制状态，$n$ 个相互独立的二分支最多产生 $2^n$ 条路径。工具通常通过状态合并、约束简化、搜索预算或启发式剪枝控制路径爆炸。

函数调用又引入了 context sensitivity：同一个函数可能从不同位置、不同接收对象或不同调用链进入：

```javascript
sanitize(adminInput);
sanitize(guestInput);
```

如果两次调用共享一个状态，它们的信息会互相污染。Context-sensitive analysis 会保留部分调用环境，例如调用点、最近 $k$ 层调用链或接收对象。上下文越细，函数摘要越有针对性，但需要维护的状态也越多。

这些 sensitivity 并不是越多越好。Flow、path 和 context sensitivity 可以叠加，关系型抽象域还可以追踪变量之间的约束；但每多区分一个维度，状态空间就可能成倍增长。成熟分析器往往只在需要的程序区域增加精度，并在其他地方合并状态。

> “更精确”必须补上两个问题才有工程意义：**对什么性质更精确，以及为此付出多少时间和内存。**
{: .prompt-tip}

---

## 四、四种工具，四种设计目标

### 4.1 设计目标如何塑造工具？

**Astrée：用 sound 分析证明没有运行时错误。**

[Astrée](https://www.astree.ens.fr/) 面向安全关键的嵌入式 C 软件，使用抽象解释计算程序行为的过近似。它的目标不是只找出一些“最可疑”的 bug，而是在明确模型和检查范围内覆盖所有潜在运行时错误；如果分析结束且没有相关 alarm，就可以据此证明不存在这类错误。

为了降低误报，Astrée 组合了区间、关系型数值域以及针对控制软件的专用抽象。它也使用 widening 处理无限抽象域。这个案例说明，高 soundness 并不必然意味着工具只能停留在小例子上，但通常需要针对目标程序族进行精心设计。

**Clang Static Analyzer：沿可疑路径寻找缺陷。**

[Clang Static Analyzer](https://clang.llvm.org/docs/ClangStaticAnalyzer.html) 面向 C、C++ 和 Objective-C，核心采用 path-sensitive、inter-procedural symbolic execution。它沿路径维护 `ProgramState`，再由不同 checker 识别 use-after-free、空指针解引用等缺陷。

它更接近开发者日常使用的 bug-finding 工具：优先给出可操作的路径报告，而不是为整个语言与环境中的所有行为提供统一的 soundness 保证。这样的目标会影响路径预算、库建模和误报控制策略。

**Infer：用过程摘要扩展到大型代码库。**

[Infer](https://fbinfer.com/) 是 Meta 开源的过程间静态分析器。它的重要工程思想之一是 compositional、summary-based analysis：先为一个过程计算摘要，调用者使用摘要推理，而不必每次重新展开函数体。

摘要把过程的内部细节压缩为调用者需要的前置条件、后置条件或其他抽象效果。这样既能跨函数推理，也适合增量分析，因为一次代码修改不必让整套程序从头开始计算。

**MOPSA：让抽象域成为可组合模块。**

[MOPSA](https://mopsa.lip6.fr/) 是面向研究与教学的开源平台，以抽象解释构造 sound semantic analyzers。它把不同语言构造和数据抽象拆成可组合的模块，便于替换抽象域、观察精度变化并研究新分析。

MOPSA 也提醒我们区分“理论目标”和“当前实现范围”：工具可以在支持的语义与检查项上追求 soundness，同时对语言特性、标准库或外部环境作出明确限制。阅读任何工具论文时，都应先寻找这些 assumptions 和 scope。

### 4.2 不同工具不该只按“谁更准确”排名

四个工具面对的问题不同：Astrée 强调安全证明，Clang Static Analyzer 强调可操作的 bug path，Infer 强调组合式与增量扩展，MOPSA 强调 sound 分析的模块化研究。评价它们时，应先问目标语言、错误类别、soundness 声明、时间预算和使用场景，而不是寻找一个脱离语境的“最高精度”。

---

## 五、形式化定义怎样落到代码里？

论文中的抽象值域最终会变成数据类型，偏序与 join 会变成比较和合并操作：

```python
class AbstractValue:
    def leq(self, other): ...
    def join(self, other): ...
    def widen(self, other): ...
```

节点的 transfer function 则对应状态转换：

```python
def transfer(node, in_state):
    ...
    return out_state
```

求解器把它们连接起来：

```python
while worklist:
    node = worklist.pop()
    new_out = transfer(node, in_state[node])
    propagate_if_changed(node, new_out)
```

真实实现还要处理缓存、摘要、诊断信息和语言语义，但核心接口与数学定义是一一对应的。形式化不仅解释算法“为什么正确”，也划定了模块之间应该交换什么信息。

从公式对应到实现之后，阅读者还需要检查工具对外作出的工程声明。一篇论文写“sound”“scalable”或“precise”时，可以继续追问：

1. 支持哪些语言特性和错误类别？
2. 对库、原生代码、反射和并发作了哪些假设？
3. 精度相对于哪个 baseline、哪组 benchmark 和哪项指标？
4. 运行时间包含全量分析还是增量更新？

这些限定条件不是论文的附属信息，而是理解结论适用范围的一部分。

---

## 六、本篇小结

静态分析进入工程环境后，问题不再只是“能否定义一个不动点”。无限上升链需要 widening，soundness 要求覆盖建模范围内的真实行为，precision 决定近似有多紧，而 scalability 决定这些性质能否在目标代码库上兑现。

Flow、path 和 context sensitivity 提供了更细的信息，也扩大了状态空间；摘要、增量分析和模块化抽象则帮助工具控制成本。真正成熟的设计不会盲目追求单一指标，而会围绕明确的用户、程序和错误类型选择合适的取舍。

最后一篇 [*AI 写完代码，谁来验收？大模型与形式化方法的边界*]({{ site.url }}/posts/Formalization6/) 将把视角转向大语言模型：当模型能够生成和解释代码时，哪些工作可以交给概率模型，哪些结论仍必须由程序分析、测试或证明来约束。
