---
title: 随机算法：从概率直觉到经典方法的阅读地图
date: "2024-05-09 10:00:00 +0800"
description: 十二篇随机算法笔记的中文导航，串联概率工具、随机舍入、指纹、哈希与在线预测等主题。
categories: [Theory, Randomized Algorithm]
tags: [note, lang-zh, algorithm, randomized algorithm]
---

{% include series-guide-styles.html %}

在确定性算法里，“随机选择”听上去像是把结果交给运气；在随机算法里，它恰恰是一种经过设计的工具。随机性可以避开难以处理的最坏情况，可以把昂贵的精确计算改造成高概率正确的快速判断，也可以让一个简单策略拥有意想不到的性能保证。

这十二篇笔记从概率直觉出发，逐渐进入集中不等式、随机舍入和多项式恒等测试，再借助匹配、指纹、负载均衡与哈希观察随机化如何落到具体问题中，最后抵达近似计数、可满足性和在线预测。它们更适合作为一条逐步加深的学习路线，而不是十二个孤立的算法。

> 读随机算法时，除了问“算法做了什么”，还要多问一句：**随机性出现在哪里，失败概率又是怎样被控制的？**
{: .prompt-tip}

## 十二篇文章

<div class="series-map">
  <a class="series-entry" href="{{ '/posts/RandAlg1/' | relative_url }}"><div class="series-number">01</div><div><h3 data-toc-skip>为什么算法需要随机性？</h3><p>从矩阵乘法验证入手，建立随机算法、正确率与重复试验的基本直觉。</p></div><span class="series-kind">入门</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg2/' | relative_url }}"><div class="series-number">02</div><div><h3 data-toc-skip>全局最小割与中位数</h3><p>通过 Karger 算法和随机选择，观察简单随机过程怎样解决经典问题。</p></div><span class="series-kind">经典算法</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg3/' | relative_url }}"><div class="series-number">03</div><div><h3 data-toc-skip>怎样控制“偏离期望”的概率？</h3><p>整理 Markov、Chebyshev 与 Chernoff 不等式，并将它们用于均值估计。</p></div><span class="series-kind">概率工具</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg4/' | relative_url }}"><div class="series-number">04</div><div><h3 data-toc-skip>从线性规划到随机舍入</h3><p>以拥塞最小化为例，理解松弛后的分数解如何转化为离散解。</p></div><span class="series-kind">设计方法</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg5/' | relative_url }}"><div class="series-number">05</div><div><h3 data-toc-skip>用随机取值验证多项式恒等式</h3><p>从多项式恒等测试延伸到矩阵乘法检测与二分图完美匹配。</p></div><span class="series-kind">代数随机化</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg6/' | relative_url }}"><div class="series-number">06</div><div><h3 data-toc-skip>完美匹配与并行算法</h3><p>继续追踪代数方法，理解顺序计算、并行计算与匹配问题的联系。</p></div><span class="series-kind">并行计算</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg7/' | relative_url }}"><div class="series-number">07</div><div><h3 data-toc-skip>指纹法：用很小的摘要比较很大的对象</h3><p>借助模式匹配理解随机指纹，以及碰撞概率为何可以被严格控制。</p></div><span class="series-kind">指纹</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg8/' | relative_url }}"><div class="series-number">08</div><div><h3 data-toc-skip>球与箱子：两个选择为何胜过一个？</h3><p>研究随机分配的负载，并理解“二选一”带来的显著改善。</p></div><span class="series-kind">负载均衡</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg9/' | relative_url }}"><div class="series-number">09</div><div><h3 data-toc-skip>Bloom Filter 与 Cuckoo Hashing</h3><p>比较两种经典概率数据结构，理解空间、查询和错误概率之间的取舍。</p></div><span class="series-kind">数据结构</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg10/' | relative_url }}"><div class="series-number">10</div><div><h3 data-toc-skip>DNF 计数与蒙特卡洛方法</h3><p>从近似计数问题出发，观察采样策略怎样改进朴素估计。</p></div><span class="series-kind">近似计数</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg11/' | relative_url }}"><div class="series-number">11</div><div><h3 data-toc-skip>随机游走如何帮助求解 SAT？</h3><p>从 2-SAT 进入 3-SAT，比较朴素随机策略与更有效的求解思路。</p></div><span class="series-kind">可满足性</span></a>
  <a class="series-entry" href="{{ '/posts/RandAlg12/' | relative_url }}"><div class="series-number">12</div><div><h3 data-toc-skip>面对未知未来：专家建议与在线预测</h3><p>理解折半算法与加权多数算法如何在连续决策中控制累计错误。</p></div><span class="series-kind">在线学习</span></a>
</div>

## 怎样选择阅读路线？

<div class="series-routes">
  <div class="series-route"><strong>系统学习</strong><p>按 01 → 12 阅读。第 03 篇的概率不等式会反复成为后续分析工具。</p></div>
  <div class="series-route"><strong>关注算法设计</strong><p>先读 01、03，再选择 04、05、07，比较随机舍入、代数化与指纹法。</p></div>
  <div class="series-route"><strong>关注实际应用</strong><p>从 08、09 开始理解负载与哈希，再读 10—12 拓展到计数、SAT 和预测。</p></div>
</div>

随机算法真正有趣的地方，不是“偶尔会猜对”，而是我们能够精确解释它为什么有效、可能怎样失败，以及怎样让失败变得足够罕见。

[从第一篇开始阅读 →]({{ '/posts/RandAlg1/' | relative_url }})
{: .text-center}
