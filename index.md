---
layout: profile-home
title: Profile
description: Xinyue Liu is an Assistant Professor at Chongqing University researching AI-assisted software engineering, program analysis, and web security.
image:
  path: /assets/img/xinyue-liu-homepage.jpg
  alt: Xinyue Liu, Assistant Professor at Chongqing University (CQU)
permalink: /
redirect_from:
  - /about-me/
toc: true
---

<style>
  .about-hero,
  .featured-reading,
  .reading-card,
  .grant-item,
  .publication-item {
    border: 1px solid var(--btn-border-color);
    background: var(--card-bg);
  }

  .about-hero {
    padding: 2rem;
    margin: 0.5rem 0 2.5rem;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(42, 64, 142, 0.14), var(--card-bg) 62%);
  }

  .about-kicker {
    margin-bottom: 0.55rem;
    color: var(--link-color);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
  }

  .about-hero h1 {
    margin: 0 0 0.35rem !important;
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
  }

  .about-role {
    margin-bottom: 1rem;
    color: var(--text-muted-color);
    font-size: 1.06rem;
    text-align: center;
  }

  .about-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 1.35rem;
  }

  .about-actions a {
    padding: 0.45rem 0.85rem;
    border: 1px solid var(--btn-border-color) !important;
    border-radius: 999px;
    background: var(--button-bg);
    color: var(--text-color);
    text-decoration: none;
  }

  .about-actions a:hover {
    border-color: var(--link-color) !important;
    color: var(--link-color) !important;
  }

  .about-email {
    margin-top: 1.2rem;
    color: var(--text-muted-color);
  }

  .research-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    margin: 1.15rem 0 1.5rem;
  }

  .research-tags span {
    padding: 0.35rem 0.7rem;
    border: 1px solid var(--tag-border);
    border-radius: 999px;
    color: var(--text-muted-color);
    font-size: 0.86rem;
  }

  .featured-reading {
    padding: 1.6rem;
    margin: 1.3rem 0 1rem;
    border-left: 4px solid var(--link-color);
    border-radius: 10px;
  }

  .reading-label {
    color: var(--link-color);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .featured-reading h3,
  .reading-card h3 {
    margin: 0.45rem 0 0.65rem !important;
    font-weight: 600;
  }

  .featured-reading h3 {
    font-size: 1.3rem;
  }

  .featured-reading p,
  .reading-card p {
    margin-bottom: 0;
    color: var(--text-muted-color);
  }

  .reading-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 0.92rem;
  }

  .reading-links .reading-language-link {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.9rem;
    border: 1px solid var(--btn-border-color);
    border-radius: 999px;
    background: var(--btn-paginator-hover-color);
    color: var(--link-color);
    font-weight: 500;
    text-decoration: none;
  }

  .reading-links .reading-language-link:hover {
    border-color: var(--link-color);
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
  }

  .reading-links .reading-language-link:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 3px;
  }

  .reading-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: 1rem 0 1.5rem;
  }

  a.reading-card {
    display: block;
    min-height: 155px;
    padding: 1.2rem;
    border-bottom: 1px solid var(--btn-border-color);
    border-radius: 10px;
    color: var(--text-color);
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  a.reading-card:hover {
    border-bottom: 1px solid var(--btn-border-color);
    color: var(--text-color) !important;
    transform: translateY(-3px);
    box-shadow: var(--card-shadow);
  }

  .reading-card h3 {
    font-size: 1.03rem;
  }

  .reading-count {
    color: var(--link-color);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .about-timeline {
    margin: 1rem 0 2rem 0.25rem;
    padding-left: 1.35rem;
    border-left: 2px solid var(--main-border-color);
  }

  .timeline-item {
    position: relative;
    padding: 0 0 1.45rem 0.35rem;
  }

  .timeline-item:last-child {
    padding-bottom: 0;
  }

  .timeline-item::before {
    position: absolute;
    top: 0.35rem;
    left: -1.76rem;
    width: 10px;
    height: 10px;
    border: 2px solid var(--main-bg);
    border-radius: 50%;
    background: var(--link-color);
    content: '';
  }

  .timeline-date {
    display: block;
    margin-bottom: 0.15rem;
    color: var(--text-muted-color);
    font-size: 0.82rem;
  }

  .timeline-item p {
    margin: 0.2rem 0 0;
    color: var(--text-muted-color);
  }

  .student-intro {
    margin-bottom: 0.45rem;
  }

  .student-group {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
  }

  .student-group:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 3px;
  }

  .student-group + h2 {
    margin-top: 1.5rem !important;
  }

  .content .student-group-title {
    margin: 0.65rem 0 0.35rem !important;
    color: var(--link-color);
    font-size: 0.95rem;
    font-weight: 600;
  }

  .content .student-list {
    display: grid;
    width: 100%;
    gap: 0.4rem;
    margin: 0 0 0.65rem;
    padding: 0;
    list-style: none;
  }

  .student-row {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    align-items: center;
    gap: 0.2rem 0.75rem;
    margin: 0;
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--btn-border-color);
    border-left: 2px solid var(--link-color);
    border-radius: 7px;
    background: var(--card-bg);
    font-size: 0.98rem;
    line-height: 1.4;
    white-space: nowrap;
  }

  .student-row:hover {
    background: linear-gradient(rgba(42, 64, 142, 0.07), rgba(42, 64, 142, 0.07)), var(--card-bg);
  }

  .student-name {
    color: var(--heading-color);
    font-weight: 600;
    white-space: nowrap;
  }

  .student-name-local {
    margin-left: 0.3rem;
    color: var(--text-muted-color);
    font-size: 0.92rem;
    font-weight: 400;
  }

  .student-institution,
  .student-period {
    color: var(--text-muted-color);
    white-space: nowrap;
  }

  .student-institution {
    display: inline-flex;
    grid-column: 2;
    grid-row: 1 / span 2;
    /* A shared width aligns the labels while anchoring each block to the right. */
    width: 22rem;
    max-width: 100%;
    justify-self: end;
    align-items: center;
    gap: 0.35rem;
    text-align: left;
  }

  .student-institution-name {
    min-width: 0;
    margin-left: auto;
    color: #000;
    text-align: right;
    white-space: normal;
  }

  .student-country {
    display: block;
    color: var(--text-muted-color);
  }

  html[data-bs-theme='dark'] .student-institution-name {
    color: var(--heading-color);
  }

  .student-period {
    grid-column: 1;
    grid-row: 2;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .student-period time {
    font: inherit;
    vertical-align: baseline;
  }

  .grant-meta,
  .grant-title-en {
    color: var(--text-muted-color);
  }

  .grant-list {
    display: grid;
    gap: 0.85rem;
    margin: 1rem 0 2rem;
  }

  .grant-item {
    display: grid;
    grid-template-columns: 8.5rem 1fr;
    gap: 1rem;
    padding: 1.1rem 1.2rem;
    border-radius: 9px;
  }

  .grant-meta {
    font-size: 0.86rem;
    line-height: 1.55;
  }

  .grant-title {
    display: block;
    color: var(--heading-color);
    line-height: 1.5;
  }

  .grant-title-en {
    margin: 0.3rem 0 0;
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .publication-list {
    display: grid;
    gap: 0.85rem;
    margin-top: 1rem;
  }

  .publication-item {
    display: grid;
    grid-template-columns: 3.5rem 1fr;
    gap: 1rem;
    padding: 1.05rem 1.15rem;
    border-radius: 9px;
  }

  .publication-year {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    color: var(--link-color);
    font-weight: 700;
  }

  .publication-title {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--heading-color);
    line-height: 1.45;
  }

  .publication-meta {
    margin: 0;
    color: var(--text-muted-color);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .ccf-badge {
    display: inline-block;
    padding: 0.08rem 0.42rem;
    border-radius: 4px;
    background: #b85c68;
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .publication-links {
    margin-top: 0.35rem;
    font-size: 0.88rem;
  }

  @media (max-width: 576px) {
    .student-row {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
      gap: 0.25rem 0.75rem;
    }

    .student-name {
      white-space: normal;
    }

    .about-hero {
      padding: 1.35rem;
    }

    .about-hero h1 {
      font-size: 1.65rem;
    }

    .reading-grid {
      grid-template-columns: 1fr;
    }

    .grant-item {
      grid-template-columns: 1fr;
    }

    a.reading-card {
      min-height: auto;
    }

    .publication-item {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
  }
</style>

<div class="about-hero">
  <div class="about-kicker">SOFTWARE ENGINEERING · PROGRAMMING LANGUAGES</div>
  <h1 data-toc-skip>Xinyue Liu <small>刘心悦</small></h1>
  <div class="about-role">Assistant Professor · Chongqing University</div>
  <p>I am an assistant professor (弘深青年教师) in the School of Big Data &amp; Software Engineering at <strong>Chongqing University (CQU, 重庆大学)</strong>. I am currently a member of the Intelligent Software Engineering research team led by <a href="https://sites.google.com/site/hongyujohn">Hongyu Zhang (张洪宇)</a>, Dean of the School.</p>
  <p>For visitors, my office is on the CQU Huxi Campus: <strong>重庆大学虎溪校区信息技术科研楼 B707</strong>.</p>
  <p>Before joining CQU, I completed my Ph.D. at the University at Buffalo under the supervision of <a href="https://cse.buffalo.edu/~lziarek/">Lukasz Ziarek</a>.</p>
  <div class="about-actions">
    <a href="{{ '/download/Xinyue_CV_en.pdf' | relative_url }}"><i class="fas fa-file-alt fa-fw"></i> Curriculum Vitae</a>
    <a href="https://github.com/aaronxyliu"><i class="fab fa-github fa-fw"></i> GitHub</a>
    <a href="https://dblp.org/pid/45/2337-5.html"><i class="fas fa-book-open fa-fw"></i> DBLP</a>
    <a href="https://www.cse.cqu.edu.cn/info/2167/8532.htm"><i class="fas fa-university fa-fw"></i> CQU Homepage</a>
  </div>
  <div class="about-email"><strong>Email:</strong> aaronxyliu@cqu.edu.cn</div>
</div>

## Research

My research lies at the intersection of **Software Engineering** and **Programming Language Theory**. I am currently interested in AI-assisted analysis and verification of Web applications, especially dependency security in the Web ecosystem. More broadly, I study how AI and program analysis can make software development and maintenance more reliable.

<div class="research-tags">
  <span>Program Analysis</span>
  <span>Web Security</span>
  <span>Software Testing</span>
  <span>Formal Methods</span>
  <span>AI for Software Engineering</span>
</div>

I welcome students driven by curiosity, particularly those eager to make meaningful contributions at the frontiers of human knowledge. This is the place where you can take on challenging problems and gain top-tier publications. If you have a solid programming background with research interests aligned with mine, feel free to contact me at aaronxyliu@cqu.edu.cn.

> For **Pakistani** students, welcome to reach out if your undergraduate university is one of the following: NUST, COMSATS, UET Lahore, PU, LUMS, QAU, FAST_NUCES or a university with equivalent prestige.
{: .prompt-tip}

## From the Blog

Alongside research and technical notes, this blog offers guided series on program analysis, programming language theory, and academic writing. The series use examples to help students and other newcomers build the intuition needed to read papers and textbooks.

<div class="featured-reading">
  <div class="reading-label">RECOMMENDED · 7 ARTICLES</div>
  <h3 data-toc-skip>Formalization in Software Engineering</h3>
  <p>New to program analysis papers? Start with sets and program states, then work through semantic rules, abstraction, and the guarantees an analysis can provide. A final article traces the <a href="{{ '/posts/Formalization7-en/' | relative_url }}">history of formal methods</a>.</p>
  <div class="reading-links">
    <a href="{{ '/posts/Formalization1-en/' | relative_url }}">Start with Part 1 →</a>
    <a href="{{ '/posts/Formalization-guide-en/' | relative_url }}">Explore the series</a>
    <a class="reading-language-link" href="{{ '/posts/Formalization-guide/' | relative_url }}" lang="zh-CN" hreflang="zh-CN">点此阅读中文版</a>
  </div>
</div>

<div class="reading-grid">
  <a class="reading-card" href="{{ '/posts/programming-language-guide/' | relative_url }}">
    <span class="reading-count">11 articles · Foundations</span>
    <h3 data-toc-skip>Easy Foundations for Programming Languages</h3>
    <p>Build a foundation in programming language theory, starting with the basic concepts.</p>
  </a>
  <a class="reading-card" href="{{ '/posts/denotational-semantics-guide/' | relative_url }}">
    <span class="reading-count">5 articles · Advanced topics</span>
    <h3 data-toc-skip>Denotational Semantics of Typed Lambda Calculus</h3>
    <p>Study mathematical models of typed lambda calculus and how they give meaning to programs.</p>
  </a>
  <a class="reading-card" href="{{ '/posts/randomized-algorithms-guide/' | relative_url }}">
    <span class="reading-count">12 articles · Algorithms</span>
    <h3 data-toc-skip>Randomized Algorithms</h3>
    <p>Learn probabilistic tools, classic randomized algorithms, and the reasoning used to analyze them.</p>
  </a>
  <a class="reading-card" href="{{ '/posts/academic-writing-guide/' | relative_url }}">
    <span class="reading-count">3 articles · Research skills</span>
    <h3 data-toc-skip>Academic Writing</h3>
    <p>Develop research questions, organize a paper, and make technical writing clearer.</p>
  </a>
</div>

> If you are new to software analysis, begin with *Formalization in Software Engineering*, then turn to *Easy Foundations for Programming Languages*. If you already know basic semantics and type systems, you can start with the denotational semantics series.
{: .prompt-tip}

## Experience

<div class="about-timeline">
  <div class="timeline-item">
    <span class="timeline-date">2025.11 — Present</span>
    <strong>Assistant Professor</strong>
    <p>CQU, Big Data & SE School</p>
  </div>
  <div class="timeline-item">
    <span class="timeline-date">2021.02 — 2025.08</span>
    <strong>Ph.D. advised by Lukasz Ziarek</strong>
    <p>UB, Computer Science and Engineering Department, USA</p>
  </div>
  <div class="timeline-item">
    <span class="timeline-date">2016.09 — 2020.06</span>
    <strong>Undergraduate Study</strong>
    <p>NJU (南京大学), Computer Science and Technology Department</p>
  </div>
</div>



## Publications

<div class="publication-list">
  <div class="publication-item">
    <div class="publication-year">2026 <span class="ccf-badge">CCF-A</span></div>
    <div>
      <strong class="publication-title">PTV: Scalable Version Detection of Web Libraries and its Security Application</strong>
      <p class="publication-meta"><strong>X. Liu</strong>, H. Cai, L. Ziarek · ICSE 2026 · Acceptance: 24.2% (160/660)</p>
      <div class="publication-links"><a href="{{ '/download/publications/ptv-ready.pdf' | relative_url }}">PDF</a> · <a href="{{ '/download/publications/ptv-proof.pdf' | relative_url }}">Supplementary material</a></div>
    </div>
  </div>

  <div class="publication-item">
    <div class="publication-year">2024 <span class="ccf-badge">CCF-A</span></div>
    <div>
      <strong class="publication-title">WEFix: Intelligent Automatic Generation of Explicit Waits for Efficient Web End-to-End Flaky Tests</strong>
      <p class="publication-meta"><strong>X. Liu</strong>, Z. Song, W. Fang, W. Yang, W. Wang · WWW 2024 · Acceptance: 20.2% (405/2008)</p>
      <div class="publication-links"><a href="{{ '/download/publications/wefix.pdf' | relative_url }}">PDF</a></div>
    </div>
  </div>

  <div class="publication-item">
    <div class="publication-year">2023 <span class="ccf-badge">CCF-A</span></div>
    <div>
      <strong class="publication-title">PTdetector: An Automated JavaScript Front-end Library Detector</strong>
      <p class="publication-meta"><strong>X. Liu</strong>, L. Ziarek · ASE 2023 · Acceptance: 21% (103/629)</p>
      <div class="publication-links"><a href="{{ '/download/publications/PTdetector.pdf' | relative_url }}">PDF</a></div>
    </div>
  </div>

  <div class="publication-item">
    <div class="publication-year">2023 <span class="ccf-badge">CCF-A</span></div>
    <div>
      <strong class="publication-title">AdHere: Automated Detection and Repair of Intrusive Ads</strong>
      <p class="publication-meta">Y. Yan, Y. Zheng, <strong>X. Liu</strong>, N. Medvidovic, W. Wang · ICSE 2023 · Acceptance: 26% (209/796)</p>
      <div class="publication-links"><a href="{{ '/download/publications/Adhere.pdf' | relative_url }}">PDF</a></div>
    </div>
  </div>

  <div class="publication-item">
    <div class="publication-year">2021 <span class="ccf-badge">CCF-A</span></div>
    <div>
      <strong class="publication-title">An Empirical Study of Bugs in WebAssembly Compilers</strong>
      <p class="publication-meta">A. Romano, <strong>X. Liu</strong>, Y. Kwon, W. Wang · ASE 2021 · Acceptance: 19.2% (82/427)</p>
      <div class="publication-links"><a href="{{ '/download/publications/Empirical_Study_of_Bugs_in_WebAssembly_Compilers.pdf' | relative_url }}">PDF</a></div>
    </div>
  </div>

  <div class="publication-item">
    <div class="publication-year">2019</div>
    <div>
      <strong class="publication-title">Is Bigger Data Better for Defect Prediction: Examining the Impact of Data Size on Supervised and Unsupervised Defect Prediction</strong>
      <p class="publication-meta"><strong>X. Liu</strong>, Yanhui Li · WISA 2019</p>
      <div class="publication-links"><a href="{{ '/download/publications/Is_big_data.pdf' | relative_url }}">PDF</a></div>
    </div>
  </div>
</div>

## Students

<p class="student-intro">I'm glad to guide the following talented students:</p>

<section class="student-group" aria-labelledby="students-masters" tabindex="0">
  <h3 class="student-group-title" id="students-masters">M.S. Students</h3>
  <ul class="student-list">
    <li class="student-row">
      <strong class="student-name">Kesen Wang <span class="student-name-local" lang="zh-CN">王柯森</span></strong>
      <span class="student-institution">from <span class="student-institution-name">Chongqing Technology and Business University<span class="student-country">China</span></span></span>
      <span class="student-period"><time datetime="2025-11">2025.11</time> &ndash; current</span>
    </li>
    <li class="student-row">
      <strong class="student-name">Hufang Wang <span class="student-name-local" lang="zh-CN">王琥方</span></strong>
      <span class="student-institution">from <span class="student-institution-name">Henan University<span class="student-country">China</span></span></span>
      <span class="student-period"><time datetime="2026-09">2026.9</time> &ndash; current</span>
    </li>
    <li class="student-row">
      <strong class="student-name">Ahmad Hurayarah</strong>
      <span class="student-institution">from <span class="student-institution-name">COMSATS University Islamabad<span class="student-country">Pakistan</span></span></span>
      <span class="student-period">Starts <time datetime="2027-09">2027.9</time></span>
    </li>
    <li class="student-row">
      <strong class="student-name">Abu Bakar</strong>
      <span class="student-institution">from <span class="student-institution-name">University of the Punjab<span class="student-country">Pakistan</span></span></span>
      <span class="student-period">Starts <time datetime="2027-09">2027.9</time></span>
    </li>
    <li class="student-row">
      <strong class="student-name">Zeeshan Hyder</strong>
      <span class="student-institution">from <span class="student-institution-name">Sukkur IBA University<span class="student-country">Pakistan</span></span></span>
      <span class="student-period">Starts <time datetime="2027-09">2027.9</time></span>
    </li>
  </ul>
</section>

<section class="student-group" aria-labelledby="students-undergraduates" tabindex="0">
  <h3 class="student-group-title" id="students-undergraduates">Undergraduate Students</h3>
  <ul class="student-list">
    <li class="student-row">
      <strong class="student-name">Zhaofeng Li <span class="student-name-local" lang="zh-CN">李兆丰</span></strong>
      <span class="student-institution">from <span class="student-institution-name">Chongqing University<span class="student-country">China</span></span></span>
      <span class="student-period"><time datetime="2026-03">2026.3</time> &ndash; current</span>
    </li>
    <li class="student-row">
      <strong class="student-name">Junjie Tan <span class="student-name-local" lang="zh-CN">谭俊杰</span></strong>
      <span class="student-institution">from <span class="student-institution-name">Chongqing University<span class="student-country">China</span></span></span>
      <span class="student-period"><time datetime="2026-10">2026.10</time> &ndash; current</span>
    </li>
  </ul>
</section>

## Grants

<div class="grant-list">
  <div class="grant-item">
    <div class="grant-meta">
      <strong>2027.01 — 2029.12</strong><br>
      主持 / Principal Investigator<br>
      30 万元 / RMB 300,000
    </div>
    <div>
      <strong class="grant-title" lang="zh-CN">重庆市优青专项《运行时语义驱动的 Web 前端分析新方法研究》</strong>
      <p class="grant-title-en" lang="en">Chongqing  Young Elite Program: “New Methods for Web Front-End Analysis Driven by Runtime Semantics”</p>
    </div>
  </div>
</div>
