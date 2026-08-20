---
title: 软件工程形式化入门（二）：从代码到控制流图与程序语义
date: 2026-08-20 13:13:00 +0800
math: true
categories: [Theory, 软工形式化入门]
tags: [note, lang-zh, SE]
---

人读程序时，很容易顺着代码从上往下看；分析器却不能只走眼前这一条路。一次条件判断会产生分支，一个循环会把执行带回原处，异常和返回语句还可能让程序提前离开。

要分析程序，首先得把所有可能的去向画出来，再说明每走一步，程序状态会发生什么变化。这篇文章就从这两个问题出发：程序能走到哪里，以及到达那里时状态变成了什么。

上一篇文章已经把程序状态理解为“变量到值”的映射：

$$
\sigma:X\rightarrow V
$$

但在程序分析论文里，仅仅定义“状态里有什么”还不够。我们还需要回答：

> **程序按照什么顺序执行，这些状态又如何随着执行不断变化？**
{: .prompt-tip}

静态分析、程序测试和漏洞分析通常先把源代码转换成**控制流图（Control-Flow Graph, CFG）**，再在图上定义状态与执行规则。控制流图回答“下一步可能去哪”，语义规则回答“走完这一步后发生了什么”。

本文沿着下面的顺序展开：

$$
\text{源代码}
\longrightarrow
\text{CFG}
\longrightarrow
\text{程序配置}
\longrightarrow
\text{语义规则}
\longrightarrow
\text{状态迁移}.
$$

读完后，你应该能够：

- 理解为什么程序分析经常以 CFG 为基础；
- 读懂 $G=(N,E,n_{entry},n_{exit})$ 一类定义；
- 理解程序位置、程序状态与 configuration 的关系；
- 看懂常见的 inference rule；
- 区分 small-step、big-step 和 denotational-style semantics；
- 知道这些表示方式在 SE 论文中分别适合描述什么问题。

这一篇仍然讨论**具体程序语义**。抽象域、格和 fixed point 会放到下一篇，因为那些概念只有在“状态如何沿 CFG 传播”已经清楚以后，才比较容易理解。


---

## 一、先把程序变成一张图

### 1. 为什么程序分析经常使用 CFG？

先看一个简单程序：

```javascript
x = 1;
if (flag) {
    y = x + 1;
} else {
    y = x - 1;
}
z = y * 2;
```

它的控制流可以画成：

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

这张图没有保留源代码的排版，却保留了程序分析真正需要的信息：

1. 一条语句执行完后可能到哪里；
2. 哪些语句可能出现在同一条执行路径上；
3. 哪里产生分支；
4. 哪里重新汇合；
5. 是否存在从后面的节点回到前面的边，也就是循环。

这些问题会反复出现在很多 SE 研究中，例如：

- 数据流分析（data-flow analysis）；
- 污点分析（taint analysis）；
- 程序切片（program slicing）；
- 符号执行（symbolic execution）；
- 测试覆盖率分析；
- 缺陷与漏洞检测；
- 程序变换与优化分析。

因此，CFG 可以先简单理解成：

> **程序所有可能执行顺序的骨架。**
{: .prompt-tip}

它不一定描述所有运行时细节，但非常适合回答“控制可能从哪里流向哪里”。

---

### 2. 用图论形式定义 CFG

#### 2.1 一个常见定义

CFG 最常见的数学形式之一是：

$$
G=(N,E,n_{entry},n_{exit}).
$$

其中：

- $N$：CFG 节点集合；
- $E\subseteq N\times N$：控制流边集合；
- $n_{entry}\in N$：入口节点；
- $n_{exit}\in N$：正常出口节点。

假设：

$$
N=\{n_1,n_2,n_3,n_4\},
$$

控制流为：

```text
n1 → n2 → n3
      |
      └──→ n4
```

那么：

$$
E=\{(n_1,n_2),(n_2,n_3),(n_2,n_4)\}.
$$

其中

$$
(n_i,n_j)\in E
$$

表示：执行完节点 $n_i$ 后，控制流可能转移到 $n_j$。

#### 2.2 为什么写成 $E\subseteq N\times N$？

上一篇介绍过笛卡尔积。$N\times N$ 表示所有可能的节点对：

$$
N\times N
=
\{(n_i,n_j)\mid n_i\in N,n_j\in N\}.
$$

真实 CFG 通常只包含其中一部分连接，因此写成：

$$
E\subseteq N\times N.
$$

把它翻译成自然语言就是：

> 控制流边由“节点对”组成，但不是任意两个节点之间都有边。
{: .prompt-tip}

#### 2.3 节点也常写成 program location

程序分析论文里经常不用 $n$，而使用：

$$
\ell\in L,
$$

其中 $L$ 表示程序位置（program location）或标签（label）的集合。

例如：

```text
ℓ1: x = 1
ℓ2: if(flag)
ℓ3: y = x + 1
ℓ4: y = x - 1
ℓ5: z = y * 2
```

CFG 就可以写成：

$$
G=(L,E,\ell_{entry},\ell_{exit}).
$$

$N$ 和 $L$ 在很多论文里承担相近角色。前者强调“图节点”，后者强调“程序位置”。两者没有必须遵守的统一命名，具体含义仍以论文中的定义为准。

---

### 3. CFG 节点里放什么？

只定义节点和边，还没有说明每个节点对应哪条程序指令。

一种常见做法是增加：

$$
inst:L\rightarrow I,
$$

其中：

- $L$：程序位置集合；
- $I$：指令集合；
- $inst(\ell)$：位置 $\ell$ 上的指令。

例如：

$$
inst(\ell_1)=x:=1,
$$

$$
inst(\ell_2)=if(flag).
$$

于是 CFG 可以写成：

$$
G=(L,E,inst,\ell_{entry},\ell_{exit}).
$$

这类定义在程序分析论文里很常见，因为后面可以直接说：

> 在位置 $\ell$ 上，对指令 $inst(\ell)$ 应用某个 transfer function。

这样图结构和语义规则就连接起来了。

#### 3.1 Basic block：一个节点也可以放多条指令

实际编译器和静态分析工具经常把连续执行、内部没有跳转的一组指令放在同一个**基本块（basic block）**中。

例如：

```javascript
x = 1;
y = x + 2;
z = y * 3;
```

可能属于同一个基本块：

```text
B1:
    x = 1
    y = x + 2
    z = y * 3
```

如果 $I$ 是指令集合，那么一个 basic block 可以看作：

$$
I^*,
$$

即一段指令序列。因此有些论文会定义：

$$
block:L\rightarrow I^*.
$$

这表示每个 label 对应的是一组顺序执行的指令，而不一定只有一条。

#### 3.2 为什么不同论文的 CFG 定义不一样？

你可能会看到：

$$
G=(V,E),
$$

也可能看到：

$$
G=(N,E,n_{entry},n_{exit}),
$$

还可能看到：

$$
G=(L,E,inst,\ell_{entry},\ell_{exit}).
$$

这些写法并不冲突。作者只是在保留自己后续分析所需要的信息。

阅读时先回答三个问题：

1. **节点代表什么？**
2. **边代表什么？**
3. **节点上还附带了哪些程序信息？**

比记住某一种“标准格式”更有用。

---

### 4. 控制流顺序不等于文本顺序

#### 4.1 条件分支

考虑：

```javascript
if (x > 0) {
    y = 1;
} else {
    y = -1;
}
z = y + 1;
```

控制流是：

```text
        if(x > 0)
        /        \
       /          \
    y = 1        y = -1
       \          /
        \        /
        z = y + 1
```

源代码里 `y = 1` 写在 `y = -1` 前面，但一次具体执行只会选择其中一条分支。

这也是为什么程序分析不能简单地把所有语句按行号串起来。

#### 4.2 循环与 back edge

再看：

```javascript
while (x > 0) {
    x = x - 1;
}
y = x;
```

CFG 大致是：

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

从循环体重新回到条件节点的边通常称为 **back edge**。

后面讲 data-flow analysis 和 fixed point 时，这种回边会非常重要，因为某个节点可能不只接收一次信息：后面的状态还可能绕一圈重新传回来。

#### 4.3 Return、异常与多个出口

真实程序还可能出现：

```javascript
if (error) {
    throw err;
}
if (done) {
    return result;
}
work();
```

因此一些论文会进一步定义：

$$
\ell_{entry},
\qquad
\ell_{exit},
\qquad
\ell_{exc},
$$

分别表示入口、正常出口和异常出口。

是否需要这些特殊节点取决于研究目标。分析异常传播、资源释放或错误路径时，异常出口很有用；如果只研究简单的局部控制流，也可能不单独建模。

---

## 二、程序不仅“在哪里”，还有“是什么状态”

### 5. 从程序状态到 configuration

上一篇已经定义了程序状态：

$$
\sigma:X\rightarrow V.
$$

例如：

$$
\sigma=\{x\mapsto1,y\mapsto2\}.
$$

它告诉我们变量当前是什么值，却没有告诉我们程序执行到了哪里。

同一个状态可能出现在不同程序位置，而后续行为完全不同。因此，形式语义通常会把**当前程序位置**和**当前程序状态**组合起来。

#### 5.1 Configuration

一种常见写法是：

$$
\langle \ell,\sigma\rangle.
$$

它称为一个 **configuration（配置）**，可以读成：

> 程序当前位于 $\ell$，程序状态为 $\sigma$。
{: .prompt-tip}

如果不直接使用 CFG label，而是研究语句本身，也可以写：

$$
\langle s,\sigma\rangle.
$$

例如：

$$
\langle x:=x+1,\sigma\rangle
$$

表示“下一步准备执行 `x = x + 1`，当前状态为 $\sigma$”。

#### 5.2 尖括号没有特殊魔法

这里的：

$$
\langle a,b\rangle
$$

本质上还是一个有序组合，和 $(a,b)$ 类似。

在 PL 和程序分析文献中，尖括号经常用来表示 configuration，只是一种记号习惯。真正需要关注的是括号里保存了哪些信息。

---

## 三、用 Operational Semantics 描述“下一步发生什么”

### 6. Small-step Operational Semantics

Operational semantics 关心的是：

> **程序怎样执行。**

Small-step semantics 进一步把执行拆成一系列局部步骤。常见形式是：

$$
\langle s,\sigma\rangle
\rightarrow
\langle s',\sigma'\rangle.
$$

读作：

> 语句 $s$ 在状态 $\sigma$ 下执行一步后，变成 $s'$，状态变成 $\sigma'$。

这里的 $\rightarrow$ 表示的是**一步迁移关系（transition relation）**。

注意，它和上一篇中的：

$$
f:A\rightarrow B
$$

不是同一个意思。前者表示“执行一步”，后者表示“函数从 $A$ 映射到 $B$”。同一个符号在不同上下文中经常会被复用。

---

### 7. 从赋值开始读 inference rule

考虑：

```javascript
x = e;
```

一条典型的 small-step rule 可以写成：

$$
\frac{[\![e]\!](\sigma)=v}
{\langle x:=e,\sigma\rangle
\rightarrow
\langle skip,\sigma[x\mapsto v]\rangle}.
$$

这种“横线上下各一部分”的写法叫 **inference rule（推理规则）**。

横线上方是 premise，横线下方是 conclusion。

这条规则可以直接读成：

1. 在当前状态 $\sigma$ 下计算表达式 $e$；
2. 如果结果是 $v$；
3. 就把 $x$ 更新为 $v$；
4. 当前赋值语句执行完成。

对应的伪代码只有几行：

```python
v = eval(e, state)
state[x] = v
```

#### 7.1 `skip` 是什么？

`skip` 通常表示“什么也不做”或“当前语句已经执行完成”。

它不是 JavaScript、Python 或 C 的真实关键字，而是形式语义里为了方便描述程序状态而加入的语法元素。

例如：

$$
\langle skip;s_2,\sigma\rangle
\rightarrow
\langle s_2,\sigma\rangle
$$

表示：前一条语句已经结束，现在继续执行 $s_2$。

---

### 8. 顺序执行怎样写成规则？

假设程序为：

$$
s_1;s_2.
$$

如果 $s_1$ 可以执行一步：

$$
\langle s_1,\sigma\rangle
\rightarrow
\langle s_1',\sigma'\rangle,
$$

那么整个序列可以写成：

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

这条规则只表达一件事：

> **先让 $s_1$ 走一步，$s_2$ 暂时保持不动。**
{: .prompt-tip}

形式化表达的价值就在这里：一句自然语言里的“先……再……”被明确写成了状态迁移关系。

---

### 9. 条件语句怎样产生两条控制流？

对于：

```javascript
if (e) {
    s1;
} else {
    s2;
}
```

通常分别定义 true 和 false 两种情况。

如果条件为真：

$$
\frac{[\![e]\!](\sigma)=true}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\rightarrow
\langle s_1,\sigma\rangle
}.
$$

如果条件为假：

$$
\frac{[\![e]\!](\sigma)=false}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\rightarrow
\langle s_2,\sigma\rangle
}.
$$

这两条规则对应 CFG 中 `if` 节点的两条 outgoing edges。

从这里开始，可以看到 CFG 和 operational semantics 的联系：

```text
当前位置 + 当前状态
        |
        v
     执行规则
        |
        v
后继位置 + 新状态
```

CFG 负责描述“可能去哪里”，语义规则负责描述“过去以后状态怎样变化”。

---

### 10. Inference rule 的通用读法

推理规则的一般形式是：

$$
\frac{P_1\qquad P_2\qquad\cdots\qquad P_n}{C}.
$$

含义是：

> 如果 $P_1,\ldots,P_n$ 都成立，那么可以推出 $C$。

例如：

$$
\frac{x>0\qquad y>0}{x+y>0}.
$$

在程序语义中，premise 往往描述：

- 某个表达式的求值结果；
- 某个子程序已经完成；
- 某个条件成立；
- 某个状态满足特定约束。

conclusion 则说明程序可以发生哪一步迁移。

论文还常在规则旁边写：

```text
[Assign]
[If-True]
[If-False]
[Call]
[Return]
```

这些只是规则名称，方便正文引用，并不额外引入新的语义。

#### 10.1 阅读推理规则时的顺序

遇到一条比较长的 rule，可以按下面的顺序看：

1. 先看 conclusion：这条规则最终想定义什么；
2. 再看 premise：这个结论成立需要哪些条件；
3. 对照语法：这条规则对应哪一种 statement 或 expression；
4. 最后才看状态里哪些部分发生了变化。

比从左到右硬读公式通常更有效。

---

### 11. 为什么 small-step 在 SE 程序分析里很常见？

Small-step 把程序执行写成：

$$
C_0\rightarrow C_1\rightarrow C_2\rightarrow\cdots,
$$

其中每个 $C_i$ 都是一个 configuration。

这种表示和 CFG 很容易对应：

```text
当前节点 + 当前状态
        ↓
执行一个局部操作
        ↓
后继节点 + 新状态
```

因此，当研究问题关心下面这些内容时，small-step 很自然：

- 某条语句执行前后的状态变化；
- 哪条 CFG edge 被走过；
- 异常在哪一步产生；
- 多线程执行如何交错；
- 某个程序变换是否保持局部行为；
- 符号执行如何一步一步扩展路径条件。

但它也有代价：如果为一门完整语言定义 small-step semantics，规则数量会很多。

所以在 SE 论文里，更常见的做法不是重新定义整门语言，而是：

> **只形式化与研究问题直接相关的那部分语法和行为。**
{: .prompt-tip}

这也是为什么一篇静态分析论文里可能只定义 assignment、branch、call、return，而没有给出完整的 JavaScript 或 C 语义。

---

## 四、如果不关心每一步，还有更紧凑的写法

### 12. Big-step Semantics：直接描述最终结果

如果研究问题不关心中间每一个执行步骤，而只关心“一段程序跑完以后得到什么”，可以使用 **big-step semantics**，也称 natural semantics。

常见写法是：

$$
\langle s,\sigma\rangle
\Downarrow
\sigma'.
$$

读作：

> 语句 $s$ 从状态 $\sigma$ 开始执行，最终得到状态 $\sigma'$。

#### 12.1 赋值

赋值可以写成：

$$
\frac{[\![e]\!](\sigma)=v}
{
\langle x:=e,\sigma\rangle
\Downarrow
\sigma[x\mapsto v]
}.
$$

与 small-step 相比，它不再先变成 `skip`，而是直接给出最终状态。

#### 12.2 顺序执行

对于：

$$
s_1;s_2,
$$

可以写：

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

读法是：

1. 从 $\sigma$ 执行 $s_1$，得到 $\sigma_1$；
2. 再从 $\sigma_1$ 执行 $s_2$，得到 $\sigma_2$；
3. 因而整个 $s_1;s_2$ 最终得到 $\sigma_2$。

#### 12.3 条件语句

若条件为真：

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

中间的“先选择 true branch，再开始执行 $s_1$”没有单独写成一步，而是直接折叠在整个推理中。

---

### 13. Small-step 和 Big-step 的区别

两者不是“谁更正式”，而是观察程序的粒度不同。

| 形式 | 关注的问题 | 特点 |
| --- | --- | --- |
| Small-step | 下一步发生什么？ | 细粒度，保留中间执行过程 |
| Big-step | 最终得到什么？ | 更紧凑，直接描述完整求值 |

例如：

```text
1 + 2 * 3
```

small-step 可以写成：

```text
1 + 2 * 3
→ 1 + 6
→ 7
```

big-step 则直接表示：

$$
1+2*3\Downarrow7.
$$

在 SE 论文里，可以先用下面的经验判断：

- 如果方法关心**路径、中间状态、异常、并发交错**，small-step 往往更合适；
- 如果方法只关心**输入和最终输出**，big-step 往往更简洁。

这只是阅读和建模时的经验，不是硬性规则。对于非终止、并发等问题，两者在表达便利性上会有明显差异；需要深入时再学习完整的 operational semantics 理论即可。

---

### 14. Denotational-style Semantics：把语句看成状态变换函数

还有一种在 SE 论文里非常常见的写法：

$$
[\![s]\!]:\Sigma\rightarrow\Sigma.
$$

它直接把语句 $s$ 的语义看成一个数学函数：

> 输入一个状态，返回执行后的状态。

#### 14.1 赋值

例如：

$$
[\![x:=e]\!](\sigma)
=
\sigma[x\mapsto[\![e]\!](\sigma)].
$$

可以拆成两步：

1. 用 $\sigma$ 计算表达式 $e$；
2. 把结果写回 $x$。

#### 14.2 `skip`

如果 `skip` 什么也不做：

$$
[\![skip]\!](\sigma)=\sigma.
$$

也就是一个恒等状态变换。

#### 14.3 顺序执行

对于：

$$
s_1;s_2,
$$

可以写：

$$
[\![s_1;s_2]\!](\sigma)
=
[\![s_2]\!]([\![s_1]\!](\sigma)).
$$

含义仍然是“先 $s_1$，再 $s_2$”。

也可以写成函数复合：

$$
[\![s_1;s_2]\!]
=
[\![s_2]\!]\circ[\![s_1]\!].
$$

这种表示的优点是紧凑，尤其适合把一条 instruction 直接写成一个 transfer function。

---

### 15. 为什么很多 SE 论文只是“denotational-style”？

看到：

$$
[\![e]\!](\sigma)=\cdots
$$

不必立即判断作者是在建立一套完整的经典 denotational semantics。

在很多静态分析、测试和软件安全论文里，双括号只是被借来定义一个局部函数，例如：

- expression evaluator；
- transfer function；
- abstract transformer；
- program transformation。

例如：

$$
Transfer(i,\sigma)=\sigma'
$$

完全可以换一种记号写成：

$$
[\![i]\!](\sigma)=\sigma'.
$$

它们都只是在表达：

> 指令 $i$ 如何把输入状态变成输出状态。

因此，阅读时先确认：

1. 双括号里是什么对象；
2. 输入是什么；
3. 输出是什么；
4. 它描述的是具体执行还是某种静态分析。

至于作者把它称为 operational、denotational 还是 abstract semantics，可以在理解公式之后再看。

---

## 五、把几种语义放到同一张地图里

### 16. Operational、Big-step、Denotational-style 和 Abstract Semantics 的关系

这几个词经常一起出现，但它们并不是四个互斥选项。

#### 16.1 Operational semantics 是一类“执行关系”

Operational semantics 关注程序如何执行。

其中最常见的两种粒度是：

$$
\text{small-step}
$$

和：

$$
\text{big-step}.
$$

因此，big-step 本身通常被视为 operational semantics 的一种形式。

#### 16.2 Denotational-style 强调“程序对应一个数学对象”

例如：

$$
[\![s]\!]:\Sigma\rightarrow\Sigma.
$$

这里语句被解释成一个状态变换函数。

#### 16.3 Abstract semantics 是另一个维度

静态分析中，我们往往不再追踪完整的 concrete state，而是使用：

$$
\hat{\sigma}.
$$

于是可能定义：

$$
[\![i]\!]^\#:
\hat{\Sigma}\rightarrow\hat{\Sigma}.
$$

这里：

- 帽子通常表示 abstract object；
- #也常被用来标记 abstract transformer。

因此，一篇论文完全可能使用：

> denotational-style notation 定义 abstract semantics

也可能使用：

> small-step abstract operational semantics

“abstract”说的是**分析的信息是否被抽象**；“operational / denotational”说的是**用什么形式定义语义**。这两个维度不要混在一起。

---

### 17. SE 程序分析中最常见的组合

对于 ICSE、FSE、ASE、ISSTA 等会议中偏程序分析的工作，最值得优先熟悉的是：

$$
\boxed{
\text{CFG}
+
\text{State}
+
\text{Transfer Rule}
}
$$

典型形式是：

$$
G=(L,E,\ldots),
$$

$$
\sigma\in\Sigma,
$$

$$
F_\ell:\Sigma\rightarrow\Sigma.
$$

其中 $F_\ell$ 表示位置 $\ell$ 上的 transfer function。

可以把它理解成：

```text
        输入状态 σ
            |
            v
      CFG 节点 ℓ
            |
        Fℓ(σ)
            |
            v
       输出状态 σ'
            |
            v
       后继 CFG 节点
```

这种写法在 SE 程序分析中常见，原因很实际：

- **局部规则容易定义**：不同 instruction 可以分别处理；
- **和 CFG 容易组合**：节点上的结果可以沿控制流边继续传播；
- **和实现接近**：transfer function 常常能直接对应分析器代码；
- **适合自动求解**：后续可以使用 worklist、data-flow framework 等算法；
- **边界条件清楚**：比纯自然语言更容易暴露遗漏和歧义。

后续进入 abstract interpretation 后，这个框架基本不变，只是 concrete state 会换成 abstract state。

---

## 六、把整套表示走一遍

### 18. 一个完整例子：从代码到状态迁移

考虑：

```javascript
x = 1;
if (flag) {
    x = x + 1;
} else {
    x = x - 1;
}
y = x * 2;
```

为了保持例子简单，设：

$$
X=\{x,y,flag\},
$$

值域为：

$$
V=\mathbb{Z}\cup\{true,false\}.
$$

程序状态：

$$
\sigma:X\rightarrow V.
$$

#### 18.1 构造 CFG

给程序位置加标签：

```text
ℓ1: x = 1
ℓ2: if(flag)
ℓ3: x = x + 1
ℓ4: x = x - 1
ℓ5: y = x * 2
```

边集合为：

$$
E=
\{
(\ell_1,\ell_2),
(\ell_2,\ell_3),
(\ell_2,\ell_4),
(\ell_3,\ell_5),
(\ell_4,\ell_5)
\}.
$$

#### 18.2 给定一个具体初始状态

假设：

$$
\sigma_0(flag)=true.
$$

执行：

```javascript
x = 1;
```

得到：

$$
\sigma_1=\sigma_0[x\mapsto1].
$$

#### 18.3 根据条件选择控制流

因为：

$$
\sigma_1(flag)=true,
$$

所以控制流从 $\ell_2$ 进入 $\ell_3$。

执行：

```javascript
x = x + 1;
```

先计算：

$$
[\![x+1]\!](\sigma_1)=2,
$$

再更新：

$$
\sigma_2=\sigma_1[x\mapsto2].
$$

#### 18.4 汇合后继续执行

从 $\ell_3$ 到 $\ell_5$，执行：

```javascript
y = x * 2;
```

得到：

$$
[\![x*2]\!](\sigma_2)=4,
$$

于是：

$$
\sigma_3=\sigma_2[y\mapsto4].
$$

整个执行可以写成：

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

这个例子把前三个核心对象放在了一起：

$$
\boxed{
\text{CFG 控制位置}
+
\text{State 数据状态}
+
\text{Semantic Rule 状态变化}
}
$$

---

### 19. 为什么下一步一定会走向“抽象”？

上面的例子能顺利执行，是因为我们事先假设：

$$
flag=true.
$$

但静态分析往往遇到：

```javascript
flag = input();
```

分析器并不知道运行时用户会输入什么。

这时不能直接写：

$$
\sigma(flag)=true
$$

或：

$$
\sigma(flag)=false.
$$

更普遍的问题是：程序中的整数、字符串、对象、堆状态和调用结果可能有极大的取值空间，静态分析不可能逐个枚举。

因此下一篇要解决的问题就是：

> **如果 concrete state 太多，怎样只保留与分析目标有关的信息？**
{: .prompt-tip}

这会引出：

$$
\text{Concrete State}
\longrightarrow
\text{Abstract State}
$$

以及 abstract domain、join、lattice 和 fixed point。

---

## 七、读论文时怎么快速定位自己看到的形式化？

### 20. 先看符号，再判断它在描述什么

#### 20.1 看到一步迁移

如果看到：

$$
\langle s,\sigma\rangle
\rightarrow
\langle s',\sigma'\rangle,
$$

通常是在描述 small-step operational semantics。

#### 20.2 看到最终求值

如果看到：

$$
\langle s,\sigma\rangle
\Downarrow
\sigma',
$$

通常是在描述 big-step semantics。

#### 20.3 看到双括号函数

如果看到：

$$
[\![s]\!]:\Sigma\rightarrow\Sigma,
$$

通常是在把语句解释成一个数学函数，或者借用 denotational-style notation 定义 transfer function。

#### 20.4 看到帽子或井号

例如：

$$
\hat{\Sigma},
\qquad
\hat{\sigma},
\qquad
[\![s]\!]^\#,
$$

通常表示作者正在区分 concrete semantics 和 abstract semantics。

这些只是常见约定，不是跨论文统一的强制规则。最终仍然要看作者自己的 definition。

---

### 21. 一张速查表

| 符号 | 常见含义 |
| --- | --- |
| $G=(N,E)$ | 图由节点集合和边集合组成 |
| $E\subseteq N\times N$ | 每条边连接两个节点 |
| $\ell\in L$ | $\ell$ 是程序位置或 label |
| $inst:L\rightarrow I$ | 每个程序位置映射到一条指令 |
| $I^*$ | 指令序列 |
| $\ell_{entry}$ | CFG 入口 |
| $\ell_{exit}$ | CFG 正常出口 |
| $\langle s,\sigma\rangle$ | 当前语句与当前状态组成的 configuration |
| $\rightarrow$ | 在语义规则中常表示一步迁移 |
| $\Downarrow$ | 常表示执行到最终结果 |
| $[\![s]\!]$ | 程序结构 $s$ 的语义 |
| $\frac{P}{C}$ | premise $P$ 成立时可推出 conclusion $C$ |
| $skip$ | 不执行操作 / 当前语句已完成 |
| $F_\ell$ | 位置 $\ell$ 上的 transfer function |

特别注意，$\rightarrow$ 很容易在论文中同时承担不同角色：

$$
f:A\rightarrow B
$$

表示函数类型；

而：

$$
\langle s,\sigma\rangle\rightarrow\langle s',\sigma'\rangle
$$

表示一步执行。

判断方法很简单：看箭头左右两侧放的是“集合/类型”，还是“程序 configuration”。

---

## 八、练习与后续阅读

### 22. 练习：把代码、图和规则互相翻译

下面的练习不要求证明，只练习三件事：

> 代码能不能写成图；图能不能写成集合；公式能不能翻译回自然语言。

#### 22.1 构造 CFG

给定：

```javascript
x = 0;
if (a) {
    x = 1;
}
y = x + 1;
```

尝试：

1. 给每条语句分配 label；
2. 写出节点集合 $L$；
3. 写出边集合 $E$；
4. 标出 entry 和 exit。

#### 22.2 读取 configuration

解释：

$$
\langle \ell_3,\sigma\rangle.
$$

它分别记录了哪两类信息？

#### 22.3 阅读 inference rule

解释：

$$
\frac{[\![e]\!](\sigma)=true}
{
\langle if(e)\ s_1\ else\ s_2,\sigma\rangle
\rightarrow
\langle s_1,\sigma\rangle
}.
$$

先指出 premise 和 conclusion，再用一句自然语言说明整条规则。

#### 22.4 比较 small-step 与 big-step

对于：

```javascript
x = 1;
y = x + 1;
```

分别说明：

- small-step 会保留哪些中间过程；
- big-step 最终只关心什么。

#### 22.5 阅读 denotational-style rule

将下面公式翻译成自然语言：

$$
[\![s_1;s_2]\!](\sigma)
=
[\![s_2]\!]([\![s_1]\!](\sigma)).
$$

重点不是背公式，而是说清楚执行顺序和状态传递关系。

---

### 23. 延伸阅读

如果本文内容已经足够支撑当前的 SE 论文阅读，可以先停在这里。需要继续深入时，再按问题补充材料。

- **Operational semantics**：可阅读 *Software Foundations, Programming Language Foundations* 中的 Smallstep 章节。它系统介绍一步迁移、多步迁移以及推理规则。
- **CFG 与真实中间表示**：可参考 LLVM Language Reference Manual 中关于 basic block、branch instruction 和 control flow 的部分，观察论文里的 CFG 概念怎样落到真实 IR。
- **程序语义教材**：如果以后需要系统学习 small-step、big-step、denotational semantics，可以选择一本 Programming Languages 或 Semantics 教材按章节阅读，不必在刚接触 SE 研究时一次学完。
- **静态分析**：下一篇涉及 abstract interpretation 后，再补充 abstract domain、lattice、join 和 fixed point 会更合适。

这里刻意不堆太多链接。对刚入门的读者来说，先把论文中的 notation 看懂，比同时打开很多参考资料更重要。

---

## 九、本篇小结

这一篇只需要记住一条主线：

$$
\boxed{
\text{代码}
\longrightarrow
\text{控制流}
\longrightarrow
\text{状态迁移}
}
$$

CFG 回答：

> **程序可能按什么顺序执行？**

程序状态 $\sigma$ 回答：

> **当前的数据状态是什么？**

configuration：

$$
\langle \ell,\sigma\rangle
$$

把两者组合起来：

> **程序现在在哪里，并且此时状态是什么？**

语义规则继续描述：

> **执行一步或执行一段程序后，位置和状态怎样变化？**

常见的三种写法分别是：

Small-step：

$$
\langle s,\sigma\rangle
\rightarrow
\langle s',\sigma'\rangle.
$$

Big-step：

$$
\langle s,\sigma\rangle
\Downarrow
\sigma'.
$$

Denotational-style：

$$
[\![s]\!](\sigma)=\sigma'.
$$

对于刚开始阅读 SE 程序分析论文的学生，更实用的顺序不是先判断“这属于哪一派 semantics”，而是：

1. 先找出程序被表示成什么结构；
2. 再找出 state 保存什么；
3. 看一条 rule 怎样改变 state；
4. 最后再给这种写法归类。

大量 SE 程序分析论文最终都可以还原为：

$$
\boxed{
\text{CFG}
+
\text{State}
+
\text{Transfer Rule}
}
$$

下一篇会在这个框架上，把 concrete state 换成 abstract state，继续讨论 abstract domain、join、lattice 和 fixed point。
