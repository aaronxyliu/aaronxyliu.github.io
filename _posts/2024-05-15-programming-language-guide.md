---
title: 程序语言基础：从语法、语义到命令式程序的阅读地图
date: "2024-05-15 10:00:00 +0800"
description: 十一篇程序语言基础笔记的中文导航，从语言范式、数学记号和 PCF 逐步走向类型、证明系统与命令式语义。
image:
  path: /assets/img/series-covers/programming-languages-series.webp
  alt: 用语法树、类型拼图与存储结构搭建一门小语言
categories: [Theory, Programming Language]
tags: [note, lang-zh, PL, semantics]
---

每天写代码时，我们很少追问一门语言为什么拥有这样的语法、一个表达式怎样获得意义，或者两段程序在什么条件下可以被认为等价。程序语言理论把这些习以为常的问题重新摆到桌面上，并尝试用一套可推理的结构回答它们。

这个系列先从不同语言范式的全景开始，随后借助一个足够小、却能表达关键概念的模型语言 PCF，逐步介绍语法、语义、递归、类型与证明系统。最后两篇把视野扩展到代数数据类型和命令式程序。阅读它并不要求你已经会设计语言；熟悉基本编程概念，就可以从第一站出发。

> 模型语言看起来远没有现实语言丰富，这恰恰是它的价值：去掉工程细节以后，语法、类型与计算之间的关系会变得更容易观察。
{: .prompt-tip}

## 十一篇文章

<div class="series-map">
  <a class="series-entry" href="{{ '/posts/PL_Pragmatics1/' | relative_url }}"><div class="series-number">00</div><div><h3 data-toc-skip>先看全景：程序语言有哪些不同家族？</h3><p>从命令式、函数式与逻辑式风格出发，观察语言设计的不同选择。</p></div><span class="series-kind">全景导读</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL1/' | relative_url }}"><div class="series-number">01</div><div><h3 data-toc-skip>从模型语言和 Lambda 记号开始</h3><p>认识抽象、应用、作用域，以及公理语义、操作语义和指称语义的基本视角。</p></div><span class="series-kind">起点</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL2/' | relative_url }}"><div class="series-number">02</div><div><h3 data-toc-skip>读懂文法、逻辑与归纳证明</h3><p>补齐后续定义需要的数学语言，包括文法、不同层次的逻辑和证明系统。</p></div><span class="series-kind">预备知识</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL3/' | relative_url }}"><div class="series-number">03</div><div><h3 data-toc-skip>PCF 的语法：类型、项与函数</h3><p>区分对象语言与元语言，并建立 PCF 类型和表达式的基本结构。</p></div><span class="series-kind">语法</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL4/' | relative_url }}"><div class="series-number">04</div><div><h3 data-toc-skip>同一段程序，可以怎样解释？</h3><p>并排理解公理语义、操作语义与指称语义，以及它们刻画的程序等价关系。</p></div><span class="series-kind">语义</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL5/' | relative_url }}"><div class="series-number">05</div><div><h3 data-toc-skip>从记录与元组走向迭代和递归</h3><p>理解语言结构之间的翻译，并讨论迭代、尾递归与全递归函数。</p></div><span class="series-kind">递归</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL6/' | relative_url }}"><div class="series-number">06</div><div><h3 data-toc-skip>扩展 PCF：Unit、Sum 与递归类型</h3><p>为模型语言加入新的类型构造，理解它们的引入、消去与表达能力。</p></div><span class="series-kind">类型构造</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL7/' | relative_url }}"><div class="series-number">07</div><div><h3 data-toc-skip>简单类型 Lambda 演算</h3><p>系统整理类型、项、上下文相关语法，以及乘积类型与和类型。</p></div><span class="series-kind">类型系统</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL8/' | relative_url }}"><div class="series-number">08</div><div><h3 data-toc-skip>等式、理论与证明系统</h3><p>理解可推导关系的准确含义，以及语法证明如何组织成一套理论。</p></div><span class="series-kind">证明</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL9/' | relative_url }}"><div class="series-number">09</div><div><h3 data-toc-skip>从通用代数理解代数数据类型</h3><p>借助代数、签名、项和方程，把数据构造与代数规范联系起来。</p></div><span class="series-kind">代数结构</span></a>
  <a class="series-entry" href="{{ '/posts/easy_PL10/' | relative_url }}"><div class="series-number">10</div><div><h3 data-toc-skip>命令式程序及其操作语义</h3><p>进入位置、存储与 While 程序，形式化描述表达式求值和命令执行。</p></div><span class="series-kind">命令式语言</span></a>
</div>

## 怎样选择阅读路线？

<div class="series-routes">
  <div class="series-route"><strong>第一次学习 PL</strong><p>先读 00 建立全景，再按 01 → 10 前进，不必急着一次记住全部符号。</p></div>
  <div class="series-route"><strong>为了读程序分析论文</strong><p>优先阅读 01—04 和 10，先掌握语法、语义、状态与程序执行。</p></div>
  <div class="series-route"><strong>关注类型与证明</strong><p>完成 01—03 后跳到 06—09，集中理解类型构造、推导与代数结构。</p></div>
</div>

学习程序语言理论的收获，并不只是在纸上描述一门小语言。它会逐渐改变你阅读真实程序的方式：哪些是语法限制，哪些是类型保证，哪些行为来自运行规则，也会因此分得更清楚。

[从全景导读开始 →]({{ '/posts/PL_Pragmatics1/' | relative_url }})
{: .text-center}
