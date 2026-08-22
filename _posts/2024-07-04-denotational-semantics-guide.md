---
title: 类型化 Lambda 演算的指称语义：五篇文章的进阶路线
date: "2024-07-04 10:00:00 +0800"
description: 五篇类型化 Lambda 演算指称语义笔记的中文导航，从 Henkin 模型、CPO 与连续函数走向 PCF 和命令式程序模型。
image:
  path: /assets/img/series-covers/denotational-semantics-series.webp
  alt: 程序结构被映射到逐层收敛的不动点数学空间
categories: [Theory, Denotational Semantics]
tags: [note, lang-zh, PL, denotational semantics]
---

如果操作语义讲的是程序一步一步怎样运行，那么指称语义更关心另一个问题：能否给每个程序找到一个数学对象，使程序的意义不再依赖某一次具体执行？这个想法听起来抽象，却让程序等价、递归和状态都进入了可以计算与证明的模型。

这五篇文章是一条进阶路线。它从类型化 Lambda 演算的模型条件出发，补充偏序、完备偏序与连续函数，再利用不动点解释递归。理解这些基础以后，后两篇分别建立 PCF 与命令式程序的模型，把前面的数学结构重新带回程序。

> 这组文章默认读者已经接触过 Lambda 演算、类型和基本程序语义。如果这些概念还不熟悉，可以先阅读“程序语言基础”导航中的前四篇。
{: .prompt-info}

## 五篇文章

<div class="series-map">
  <a class="series-entry" href="{{ '/posts/model1/' | relative_url }}"><div class="series-number">01</div><div><h3 data-toc-skip>Henkin 模型：程序项怎样获得数学意义？</h3><p>从应用结构、外延性与框架出发，理解环境模型条件和可靠性。</p></div><span class="series-kind">模型起点</span></a>
  <a class="series-entry" href="{{ '/posts/model2/' | relative_url }}"><div class="series-number">02</div><div><h3 data-toc-skip>偏序、完备偏序与连续函数</h3><p>为递归定义准备数学结构，并理解函数空间本身如何构成 CPO。</p></div><span class="series-kind">数学基础</span></a>
  <a class="series-entry" href="{{ '/posts/model3/' | relative_url }}"><div class="series-number">03</div><div><h3 data-toc-skip>不动点与全连续层级</h3><p>把连续函数组织成类型层级，并说明不动点如何为递归提供指称。</p></div><span class="series-kind">核心结构</span></a>
  <a class="series-entry" href="{{ '/posts/model4/' | relative_url }}"><div class="series-number">04</div><div><h3 data-toc-skip>为 PCF 建立 CPO 模型</h3><p>借助阶乘等例子理解 PCF 的模型、多个不动点以及不动点归纳。</p></div><span class="series-kind">PCF</span></a>
  <a class="series-entry" href="{{ '/posts/model5/' | relative_url }}"><div class="series-number">05</div><div><h3 data-toc-skip>把存储带入模型：命令式程序的指称语义</h3><p>从带存储的类型化 Lambda 演算出发，定义状态与命令的语义函数。</p></div><span class="series-kind">命令式程序</span></a>
</div>

## 怎样选择阅读路线？

<div class="series-routes">
  <div class="series-route"><strong>完整学习模型</strong><p>按 01 → 05 阅读；第 02、03 篇是理解后续两个模型的关键桥梁。</p></div>
  <div class="series-route"><strong>重点理解递归</strong><p>先补充第 02 篇的 CPO 与连续函数，再读第 03、04 篇的不动点内容。</p></div>
  <div class="series-route"><strong>关注命令式语义</strong><p>在掌握第 02、03 篇后进入第 05 篇，观察存储如何改变语义函数的形态。</p></div>
</div>

指称语义的抽象并不是为了离程序更远，而是为了找到一种足够稳定的语言，让不同实现、不同执行步骤背后的共同意义能够被讨论和证明。

[从第一篇开始阅读 →]({{ '/posts/model1/' | relative_url }})
{: .text-center}
