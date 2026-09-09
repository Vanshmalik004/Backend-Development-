# Lab Experiment 1: Comprehensive HTML5 Web Engineering Showcase

**Course:** Web Technologies / Advanced Web Development  
**Course Outcome Mapped:** **CO2** (Create and build web pages and applications)  
**Experiment Title:** Create a web page with all possible elements of HTML5  
**Deliverable File:** [`Experiment_1.html`](file:///Users/vanshmalik/.gemini/antigravity-ide/scratch/symptom-checker/Experiment_1.html) (Self-contained standalone single file)

---

## 1. Objectives

After completing this experiment, students will be able to:
1. **Create a well-structured HTML5 web page** using appropriate semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<figure>`, `<details>`, `<dialog>`).
2. **Differentiate between HTML4 and HTML5 structural elements**, understanding the transition from unsemantic `<div>` container soup to landmark-based architectures.
3. **Apply various HTML5 form input types and attributes**, including native client-side validation (`pattern`, `required`), modern selectors (`<datalist>`, `<optgroup>`), and reactive output indicators (`<output>`, `<meter>`, `<progress>`).
4. **Implement multimedia and dynamic graphics elements** (`<video>`, `<audio>`, `<track>`, `<picture>`, `<canvas>`, `<svg>`) without third-party plugins.
5. **Understand the Document Object Model (DOM) structure**, visualizing node parent-child relationships and programmatic DOM inspection.
6. **Create accessible (WCAG 2.1 / ARIA) and SEO-friendly web pages** utilizing modern semantic tags, meta descriptors, Open Graph, and JSON-LD structured data.

---

## 2. Theoretical Background

### 2.1 HTML4 vs HTML5 Structural Comparison

In legacy **HTML4.01**, web page architecture lacked standardized semantic meaning. Developers relied exclusively on `<div>` elements tagged with arbitrary IDs or classes (e.g., `<div id="header">`, `<div class="sidebar">`, `<div id="nav">`). Search engine crawlers and screen readers had no consistent way of deciphering primary content from auxiliary sidebars or menus.

| Feature Area | HTML4.01 (Legacy) | HTML5 (Modern Standard) | Browser & User Benefit |
| :--- | :--- | :--- | :--- |
| **Top Banner** | `<div id="header">` | `<header>` | Native landmark `banner` role |
| **Navigation** | `<div id="nav"><ul>` | `<nav>` | Screen readers jump directly to navigation |
| **Core Article** | `<div class="content">` | `<main>` & `<article>` | Establishes singular primary document context |
| **Sidebar** | `<div id="sidebar">` | `<aside>` | Denotes secondary/tangential relationships |
| **Page Footer** | `<div id="footer">` | `<footer>` | Scopes copyright, legal disclosures, and sitemaps |
| **Video & Audio** | `<object>` / Flash Plugins | `<video>` & `<audio>` | Hardware accelerated, mobile-native, zero plugins |
| **Interactive Modal** | JavaScript popup overlays | `<dialog>` | Native top-layer rendering, Esc key trap, `::backdrop` |
| **Vector / 2D Graphics**| External Java/Flash applets | `<svg>` & `<canvas>` | Native DOM nodes, hardware rasterization |

---

### 2.2 Semantic Elements & Text-Level Semantics

Semantic markup describes the *meaning* of the content to the browser and developer, rather than its visual presentation.

* **Structural Landmarks:**
  * `<header>`: Introductory content or navigational aids.
  * `<nav>`: Major navigational blocks containing links.
  * `<main>`: The dominant, unique content of the `<body>`.
  * `<section>`: Thematic grouping of content, typically with a heading.
  * `<article>`: Self-contained, independently distributable composition.
  * `<aside>`: Tangentially related sidebar or supplementary callout.
  * `<footer>`: Information regarding author, copyright, or references.
* **Text-Level Semantics:**
  * `<strong>`: Serious importance or urgency (vs `<b>` stylistic offset).
  * `<em>`: Stress emphasis affecting sentence meaning (vs `<i>` voice offset).
  * `<mark>`: Highlighted relevance in a given context.
  * `<time datetime="...">`: Machine-readable dates/timestamps.
  * `<ruby>` & `<rt>`: East Asian typographic phonetic annotations.
  * `<bdi>` & `<bdo>`: Bidirectional text isolation and overrides.
  * `<abbr title="...">`: Abbreviations and acronym expansions.
  * `<kbd>`, `<code>`, `<samp>`, `<var>`: Computer hardware and software notations.

---

### 2.3 HTML5 Form Innovations

HTML5 introduced declarative validation and specialized input controls:
1. **New Input Types:**
   * `email`: Enforces RFC-standard email syntax.
   * `tel`: Optimized for telephone dialpads on mobile devices.
   * `url`: Validates absolute URI protocol format.
   * `number`: Numeric constraints with `min`, `max`, and `step`.
   * `range`: Visual slider control for bounded numeric selection.
   * `date`, `time`, `datetime-local`, `month`, `week`: Native OS calendar/clock widgets.
   * `color`: Native color picker returning hexadecimal values.
   * `search`: Search input with native clear ("x") button.
2. **Form Enhancements:**
   * `<datalist>`: Provides native autocomplete recommendations.
   * `<output>`: Reflects real-time calculated calculation outputs.
   * `<progress>`: Represents task completion percentage.
   * `<meter>`: Scalar measurement within a known range with fractional gauge color states.

---

### 2.4 Multimedia & Dynamic Graphics

* **`<video>` and `<audio>`:** Native media playback with `controls`, `autoplay`, `loop`, `preload`, and `<source>` fallbacks.
* **`<track>`:** WebVTT format subtitles, captions, and descriptions for accessibility.
* **`<picture>`:** Art direction and responsive image switching based on CSS media queries.
* **`<canvas>`:** Low-level pixel rasterization via JavaScript 2D contexts at 60 FPS.
* **`<svg>`:** Scalable, resolution-independent vector graphics integrated directly into the DOM tree.

---

### 2.5 Document Object Model (DOM) Architecture

```
                  Window (Global Scope)
                         │
                      Document
                         │
                 <html> (Root Node)
                 ┌───────┴───────┐
                 │               │
              <head>          <body>
           ┌─────┴─────┐     ┌───┴───────────────────┐
         <meta>     <title> <header> <main>       <footer>
                              │        │              │
                            <nav>  <section> <aside> <p>
```

* **Node Types:**
  * `Node.ELEMENT_NODE` (1): HTML tags (`<div>`, `<article>`, etc.).
  * `Node.TEXT_NODE` (3): The actual text content between tags.
  * `Node.DOCUMENT_NODE` (9): The root document object.
* **Tree Traversal:** `parentNode`, `children`, `firstElementChild`, `nextElementSibling`.

---

## 3. How to Run and Verify

Open the standalone file [`Experiment_1.html`](file:///Users/vanshmalik/.gemini/antigravity-ide/scratch/symptom-checker/Experiment_1.html) directly in any browser:
```bash
# macOS:
open Experiment_1.html

# Windows:
start Experiment_1.html

# Linux:
xdg-open Experiment_1.html
```

Or run via Python's built-in web server:
```bash
python3 -m http.server 3000
```
Then open `http://localhost:3000/Experiment_1.html`.

---

## 4. Viva-Voce Questions & Answers

**Q1: What is the difference between `<article>` and `<section>`?**  
*Answer:* An `<article>` represents an independent, self-contained unit of composition that can be syndicated or reused standalone (e.g., a blog post, news story, or forum thread). A `<section>` represents a thematic grouping of content, typically with a heading, intended to organize related paragraphs and media within an article or page.

**Q2: What is the significance of the `<!DOCTYPE html>` declaration in HTML5?**  
*Answer:* It triggers "Standards Mode" in web browsers, ensuring the page adheres to modern HTML5 rendering specifications rather than falling back to legacy "Quirks Mode".

**Q3: How does HTML5 `<dialog>` differ from a regular `<div>` styled as a modal?**  
*Answer:* `<dialog>` renders on the browser's native *top layer* above all z-index stacks, automatically traps keyboard focus, handles `Escape` key dismissal natively, and provides the `::backdrop` pseudo-element for background dimming.

**Q4: Explain the purpose of `<picture>` and `<source>`.**  
*Answer:* The `<picture>` element allows "art direction" and responsive image delivery. The browser reads the media query in `<source media="...">` and only downloads the specific image dimension best suited for the user's viewport, conserving mobile bandwidth and preventing layout shifts.

**Q5: What are HTML5 void elements?**  
*Answer:* Elements that cannot have any child nodes (content) and do not have a closing tag. Examples include `<img>`, `<input>`, `<meta>`, `<link>`, `<br>`, and `<hr>`.

---

## 5. Conclusion

In this experiment, a complete, accessible, and SEO-optimized web application was successfully constructed in [`Experiment_1.html`](file:///Users/vanshmalik/.gemini/antigravity-ide/scratch/symptom-checker/Experiment_1.html) utilizing all core structural, semantic, form, multimedia, and graphical elements of the HTML5 specification, fulfilling Course Outcome **CO2**.
