---
title: 软件工程形式化入门系列
date: "2026-08-14 10:00:00 +0800"
pin: true
description: 一份写给研究生和软件分析爱好者的形式化阅读地图，帮助你跨过程序分析论文中定义与公式的门槛。
image:
  path: /assets/img/2026-08-21/formalization1-cover.webp
  alt: 从陌生的抽象符号走向清晰的程序对象与状态
categories: [Theory, 软工形式化入门]
tags: [note, lang-zh, SE, Formal Methods]
---

<style>
  .formalization-map {
    display: grid;
    gap: 0.85rem;
    margin: 1.4rem 0 2rem;
  }

  .post-content a.formalization-entry {
    display: grid;
    grid-template-columns: 3.25rem 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 1.05rem 1.15rem;
    border: 1px solid var(--card-border-color);
    border-bottom: 1px solid var(--card-border-color);
    border-radius: 10px;
    background: var(--card-bg);
    color: var(--text-color);
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .post-content a.formalization-entry:hover {
    border-bottom: 1px solid var(--card-border-color);
    color: var(--text-color) !important;
    transform: translateY(-2px);
    box-shadow: 0 7px 16px var(--card-box-shadow);
  }

  .formalization-number {
    color: var(--link-color);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .formalization-entry h3 {
    margin: 0 0 0.25rem !important;
    font-size: 1.03rem;
    font-weight: 600;
  }

  .formalization-entry p {
    margin: 0;
    color: var(--text-muted-color);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .formalization-kind {
    padding: 0.22rem 0.5rem;
    border: 1px solid var(--tag-border);
    border-radius: 999px;
    color: var(--text-muted-color);
    font-size: 0.72rem;
    white-space: nowrap;
  }

  .formalization-entry.history {
    border-left: 3px solid #b85c68;
  }

  .reading-routes {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
    margin: 1.25rem 0 1.75rem;
  }

  .reading-route {
    padding: 1rem;
    border: 1px solid var(--card-border-color);
    border-radius: 9px;
    background: var(--card-bg);
  }

  .reading-route strong {
    display: block;
    margin-bottom: 0.4rem;
    color: var(--heading-color);
  }

  .reading-route p {
    margin: 0;
    color: var(--text-muted-color);
    font-size: 0.9rem;
  }

  @media (max-width: 576px) {
    .post-content a.formalization-entry {
      grid-template-columns: 2.6rem 1fr;
      gap: 0.7rem;
    }

    .formalization-kind {
      display: none;
    }

    .reading-routes {
      grid-template-columns: 1fr;
    }
  }
</style>

形式化并不是一个读完定义就算掌握的知识点，更像一组需要逐渐养成的阅读习惯：认出论文正在讨论的对象，跟上规则推动状态变化的过程，再判断分析结果究竟做出了怎样的保证。面对一整套新概念时，真正困难的往往不是某一页，而是不知道应该先读什么、后读什么。

这张阅读地图因此不急着讲具体公式，而是帮你安排路线。前六篇构成一条从“读懂符号”到“判断分析方法”的主线：前半程建立程序状态、语义与抽象的直觉，后半程把这些概念连成可运行的分析过程，并讨论可靠性、工程取舍以及人工智能生成代码带来的新问题。第七篇则离开技术主线，沿历史回看这些思想为何出现。

你可以从头走完全程，也可以根据手边的论文选择一段先读。下面每张卡片都说明了该篇要解决的问题，三种推荐路线则分别适合系统学习、临时补课和历史阅读。

> **不必把七篇文章当成必须一次完成的课程。** 先解决眼前真正妨碍阅读的问题，再回来补齐前后联系，往往更容易形成自己的理解。
{: .prompt-tip}

## 七篇文章

<div class="formalization-map">
  <a class="formalization-entry" href="{{ '/posts/Formalization1/' | relative_url }}">
    <div class="formalization-number">01</div>
    <div>
      <h3 data-toc-skip>别怕公式：从集合、映射读懂程序状态</h3>
      <p>从最常见的符号开始，学会把形式化定义重新读成程序概念。</p>
    </div>
    <span class="formalization-kind">主线 · 起点</span>
  </a>

  <a class="formalization-entry" href="{{ '/posts/Formalization2/' | relative_url }}">
    <div class="formalization-number">02</div>
    <div>
      <h3 data-toc-skip>程序会走到哪里？从代码、CFG 到程序语义</h3>
      <p>换到分析器的视角，看见程序可能经过的路径以及状态如何变化。</p>
    </div>
    <span class="formalization-kind">主线</span>
  </a>

  <a class="formalization-entry" href="{{ '/posts/Formalization3/' | relative_url }}">
    <div class="formalization-number">03</div>
    <div>
      <h3 data-toc-skip>不用记住每个值：从具体状态走向抽象解释</h3>
      <p>理解分析器为什么必须忘掉一些细节，又如何保留真正重要的性质。</p>
    </div>
    <span class="formalization-kind">主线</span>
  </a>

  <a class="formalization-entry" href="{{ '/posts/Formalization4/' | relative_url }}">
    <div class="formalization-number">04</div>
    <div>
      <h3 data-toc-skip>分析器为什么会停下来？从传递函数到不动点</h3>
      <p>跟着信息在程序中传播，理解循环分析最终怎样得到稳定结果。</p>
    </div>
    <span class="formalization-kind">主线</span>
  </a>

  <a class="formalization-entry" href="{{ '/posts/Formalization5/' | relative_url }}">
    <div class="formalization-number">05</div>
    <div>
      <h3 data-toc-skip>准确、快速，还是可靠？静态分析的工程取舍</h3>
      <p>把公式放回现实工具，判断一项分析究竟承诺了什么、牺牲了什么。</p>
    </div>
    <span class="formalization-kind">主线</span>
  </a>

  <a class="formalization-entry" href="{{ '/posts/Formalization6/' | relative_url }}">
    <div class="formalization-number">06</div>
    <div>
      <h3 data-toc-skip>AI 写完代码，谁来验收？</h3>
      <p>当大模型开始生成程序，重新追问“看起来正确”和“可以相信”之间的距离。</p>
    </div>
    <span class="formalization-kind">主线 · 终章</span>
  </a>

  <a class="formalization-entry history" href="{{ '/posts/Formalization7/' | relative_url }}">
    <div class="formalization-number">07</div>
    <div>
      <h3 data-toc-skip>历史篇：从“什么是计算”到“如何相信程序”</h3>
      <p>沿着历史回望，这些今天熟悉的形式化思想为何会被一步步发明出来。</p>
    </div>
    <span class="formalization-kind">扩展阅读</span>
  </a>
</div>

## 怎样选择阅读路线？

<div class="reading-routes">
  <div class="reading-route">
    <strong>第一次系统学习</strong>
    <p>按照 01 → 06 阅读，最后用历史篇换一个视角回看整条路线。</p>
  </div>
  <div class="reading-route">
    <strong>正在赶论文进度</strong>
    <p>先读 01 和 02 建立读法，再根据论文内容跳到对应篇章。</p>
  </div>
  <div class="reading-route">
    <strong>只是对历史好奇</strong>
    <p>可以直接阅读 07。它不要求提前读完前六篇，也不会重复主线内容。</p>
  </div>
</div>

形式化并不会因为读完一个系列就突然变得简单，但它会开始变得可以拆解。下一次在论文中遇到陌生公式时，你不必再整段跳过，而会知道先去哪里找对象、关系和规则——这正是这七篇文章想交给你的阅读能力。

[从第一篇开始阅读 →]({{ '/posts/Formalization1/' | relative_url }})
{: .text-center}
