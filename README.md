
<title>Vansh Malik Backend Notebook</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap">
<style>
/* Layout: sticky top bar, split hero (name left, ID card right), two sections with indexed rows, footer link to the repo */
:root{
  --bg:#f5f7f6;
  --surface:#ffffff;
  --fg:#12201b;
  --muted:#53635d;
  --line:#d5ddd9;
  --accent:#0b6b4f;
  --accent-ink:#ffffff;
  --accent-soft:#dff0e9;
  --font-display:"Space Grotesk","Segoe UI",system-ui,sans-serif;
  --font-body:"Inter","Segoe UI",system-ui,sans-serif;
  --font-mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --bg:#0e1714;--surface:#15211d;--fg:#e6efeb;--muted:#9bb0a8;--line:#27372f;
    --accent:#4fd1a1;--accent-ink:#06150f;--accent-soft:#17342a;color-scheme:dark}
}
:root[data-theme="dark"]{
  --bg:#0e1714;--surface:#15211d;--fg:#e6efeb;--muted:#9bb0a8;--line:#27372f;
  --accent:#4fd1a1;--accent-ink:#06150f;--accent-soft:#17342a;color-scheme:dark}

*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:72px}
body{background:var(--bg);color:var(--fg);font-family:var(--font-body);font-size:16px;line-height:1.6;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:0}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:30;background:var(--bg)}
a{color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.wrap{max-width:1040px;margin:0 auto}

header.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--line);
  margin-left:calc(-1*max(16px,env(safe-area-inset-left,0px)));margin-right:calc(-1*max(16px,env(safe-area-inset-right,0px)));
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.bar-in{max-width:1040px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:56px;flex-wrap:wrap}
.brand{font-family:var(--font-display);font-weight:700;letter-spacing:-.01em;text-decoration:none}
nav{display:flex;gap:4px}
nav a{font-size:14px;font-weight:500;color:var(--muted);text-decoration:none;padding:6px 12px;border-radius:6px}
nav a:hover{color:var(--fg);background:var(--accent-soft)}

.hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:40px;align-items:end;padding-block:64px 56px}
.eyebrow{font-family:var(--font-mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 16px}
h1{font-family:var(--font-display);font-weight:700;font-size:clamp(2.4rem,6vw,4.2rem);line-height:1.02;letter-spacing:-.03em;margin:0 0 20px;text-wrap:balance}
.lede{color:var(--muted);max-width:52ch;margin:0}
.idcard{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:20px 22px;min-width:0}
.idcard dl{margin:0;display:grid;gap:14px}
.idcard dt{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.idcard dd{margin:2px 0 0;font-family:var(--font-display);font-size:1.25rem;font-weight:600;overflow-wrap:anywhere}
.idcard dd.mono{font-family:var(--font-mono);font-weight:500;font-variant-numeric:tabular-nums;letter-spacing:.02em}

.counts{display:flex;gap:32px;flex-wrap:wrap;padding-block:20px;border-block:1px solid var(--line);font-variant-numeric:tabular-nums}
.counts div{display:flex;align-items:baseline;gap:10px}
.counts b{font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:var(--accent)}
.counts span{color:var(--muted);font-size:14px}

section{padding-block:56px 8px}
.sec-head{display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap;margin-bottom:20px}
h2{font-family:var(--font-display);font-size:clamp(1.6rem,3.5vw,2.2rem);letter-spacing:-.02em;margin:0;line-height:1.1}
.sec-head p{margin:6px 0 0;color:var(--muted);max-width:56ch}
.search{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:0 12px;min-width:min(100%,260px)}
.search input{flex:1;min-width:0;border:0;background:transparent;color:var(--fg);font:inherit;font-size:14px;padding:10px 0;outline:0}
.search:focus-within{border-color:var(--accent)}
.search label{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}

ul.list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
li.item{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:8px 20px;align-items:center;padding:18px 4px;border-bottom:1px solid var(--line)}
li.item[hidden]{display:none!important}
.idx{font-family:var(--font-mono);font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.name{font-family:var(--font-display);font-weight:600;font-size:1.15rem;letter-spacing:-.01em;margin:0}
.path{font-family:var(--font-mono);font-size:12.5px;color:var(--muted);margin:2px 0 0;overflow-wrap:anywhere}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.tag{font-family:var(--font-mono);font-size:11.5px;background:var(--accent-soft);color:var(--accent);padding:2px 8px;border-radius:999px}
.open{font-size:14px;font-weight:600;text-decoration:none;color:var(--accent-ink);background:var(--accent);padding:8px 14px;border-radius:8px;white-space:nowrap}
.open:hover{filter:brightness(1.08)}
.empty{padding:24px 4px;color:var(--muted)}

footer{margin-top:64px;border-top:1px solid var(--line);padding-block:28px 40px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:var(--muted);font-size:14px}
footer a{color:var(--accent);font-weight:500}

@media (max-width:760px){
  .hero{grid-template-columns:minmax(0,1fr);padding-block:40px 40px;gap:28px}
  li.item{grid-template-columns:44px minmax(0,1fr)}
  li.item .open{grid-column:2;justify-self:start;margin-top:6px}
  nav a{padding:6px 8px}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>

<header class="bar">
  <div class="bar-in">
    <a class="brand" href="#top">Vansh Malik</a>
    <nav aria-label="Sections">
      <a href="#theory">Theory</a>
      <a href="#lab">Lab</a>
    </nav>
  </div>
</header>

<main class="wrap" id="top">
  <div class="hero">
    <div>
      <p class="eyebrow">Backend Development · Course Record</p>
      <h1>Vansh Malik</h1>
      <p class="lede">Theory units and lab experiments from my Backend Development course, collected in one place. Each entry opens the matching folder in my GitHub repository.</p>
    </div>
    <div class="idcard">
      <dl>
        <div><dt>Name</dt><dd>Vansh Malik</dd></div>
        <div><dt>SAP ID</dt><dd class="mono">590014886</dd></div>
        <div><dt>Repository</dt><dd><a href="https://github.com/Vanshmalik004/Backend-Development-" target="_blank" rel="noopener">Vanshmalik004 / Backend-Development-</a></dd></div>
      </dl>
    </div>
  </div>

  <div class="counts" aria-label="Contents">
    <div><b>4</b><span>theory units</span></div>
    <div><b>9</b><span>lab experiments</span></div>
  </div>

  <section id="theory">
    <div class="sec-head">
      <div>
        <h2>Theory</h2>
        <p>Unit-wise material. Unit 4 includes a Dockerised FastAPI student API.</p>
      </div>
      <div class="search"><label for="q-theory">Filter</label><input id="q-theory" type="search" placeholder="Search theory" data-target="list-theory" autocomplete="off"></div>
    </div>
    <ul class="list" id="list-theory">
      <li class="item" data-text="unit 1 theory unit1">
        <span class="idx">U1</span>
        <div><h3 class="name">Unit 1</h3><p class="path">Theory/Unit1</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Theory/Unit1">Open folder</a>
      </li>
      <li class="item" data-text="unit 2 theory unit2">
        <span class="idx">U2</span>
        <div><h3 class="name">Unit 2</h3><p class="path">Theory/Unit2</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Theory/Unit2">Open folder</a>
      </li>
      <li class="item" data-text="unit 3 theory unit3">
        <span class="idx">U3</span>
        <div><h3 class="name">Unit 3</h3><p class="path">Theory/Unit3</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Theory/Unit3">Open folder</a>
      </li>
      <li class="item" data-text="unit 4 docker fastapi student api python">
        <span class="idx">U4</span>
        <div>
          <h3 class="name">Unit 4 · Docker student API</h3>
          <p class="path">Theory/unit4/docker-student-api/fastapi-app</p>
          <div class="tags"><span class="tag">Docker</span><span class="tag">FastAPI</span></div>
        </div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Theory/unit4/docker-student-api/fastapi-app">Open folder</a>
      </li>
    </ul>
    <p class="empty" id="list-theory-empty" hidden>No theory entry matches that search.</p>
  </section>

  <section id="lab">
    <div class="sec-head">
      <div>
        <h2>Lab</h2>
        <p>Experiments from HTML5 and state management through Node.js, MongoDB, Mongoose and Django.</p>
      </div>
      <div class="search"><label for="q-lab">Filter</label><input id="q-lab" type="search" placeholder="Search experiments" data-target="list-lab" autocomplete="off"></div>
    </div>
    <ul class="list" id="list-lab">
      <li class="item" data-text="experiment 1 html5 html">
        <span class="idx">Exp 1</span>
        <div><h3 class="name">Experiment 1 · HTML5</h3><p class="path">Lab/Exp-1-HTML-5</p><div class="tags"><span class="tag">HTML5</span></div></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/Exp-1-HTML-5">Open folder</a>
      </li>
      <li class="item" data-text="experiment 7 8 experiments">
        <span class="idx">Exp 7, 8</span>
        <div><h3 class="name">Experiments 7 and 8</h3><p class="path">Lab/Experiment7,8</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/Experiment7%2C8">Open folder</a>
      </li>
      <li class="item" data-text="state management">
        <span class="idx">Exp</span>
        <div><h3 class="name">State Management</h3><p class="path">Lab/EXP-State Management</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/EXP-State%20Management">Open folder</a>
      </li>
      <li class="item" data-text="experiment 12 node nodejs">
        <span class="idx">Exp 12</span>
        <div><h3 class="name">Experiment 12 · Node.js</h3><p class="path">Lab/Exp-12(node)</p><div class="tags"><span class="tag">Node.js</span></div></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/Exp-12%28node%29">Open folder</a>
      </li>
      <li class="item" data-text="experiment 13 mongoose demo mongodb">
        <span class="idx">Exp 13</span>
        <div><h3 class="name">Experiment 13 · Mongoose demo</h3><p class="path">Lab/Experiment13/mongoose-demo</p><div class="tags"><span class="tag">Mongoose</span></div></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/Experiment13/mongoose-demo">Open folder</a>
      </li>
      <li class="item" data-text="mongo mongodb database">
        <span class="idx">Exp</span>
        <div><h3 class="name">MongoDB</h3><p class="path">Lab/exp-mongo</p><div class="tags"><span class="tag">MongoDB</span></div></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/exp-mongo">Open folder</a>
      </li>
      <li class="item" data-text="experiment 15 django todo app python">
        <span class="idx">Exp 15</span>
        <div><h3 class="name">Experiment 15 · Django to-do app</h3><p class="path">Lab/Experiment15/django_todo_app</p><div class="tags"><span class="tag">Django</span></div></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/Experiment15/django_todo_app">Open folder</a>
      </li>
      <li class="item" data-text="experiment 15b">
        <span class="idx">Exp 15B</span>
        <div><h3 class="name">Experiment 15B</h3><p class="path">Lab/Experiment15B</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/Experiment15B">Open folder</a>
      </li>
      <li class="item" data-text="exam lab exam">
        <span class="idx">Exam</span>
        <div><h3 class="name">Lab Exam</h3><p class="path">Lab/exam</p></div>
        <a class="open" target="_blank" rel="noopener" href="https://github.com/Vanshmalik004/Backend-Development-/tree/main/Lab/exam">Open folder</a>
      </li>
    </ul>
    <p class="empty" id="list-lab-empty" hidden>No experiment matches that search.</p>
  </section>

  <footer>
    <span>Vansh Malik · SAP ID 590014886</span>
    <a href="https://github.com/Vanshmalik004/Backend-Development-" target="_blank" rel="noopener">View the full repository on GitHub</a>
  </footer>
</main>

<script>
document.querySelectorAll('.search input').forEach(function(input){
  var list = document.getElementById(input.dataset.target);
  var empty = document.getElementById(input.dataset.target + '-empty');
  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    list.querySelectorAll('.item').forEach(function(li){
      var hay = (li.dataset.text + ' ' + li.textContent).toLowerCase();
      var ok = !q || hay.indexOf(q) !== -1;
      li.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown !== 0;
  });
});
</script>
