/**
 * HTML5 Experiment 1 Interactive Functionality
 * Demonstrates DOM Manipulation, Form Reactions, Canvas 2D, and Dialog API.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initDialog();
  initFormControls();
  initCanvasAnimation();
  initDomInspector();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   1. Theme Switcher (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('html5_lab_theme');
  if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('html5_lab_theme', isLight ? 'light' : 'dark');
  });
}

/* --------------------------------------------------------------------------
   2. Native HTML5 Dialog API (<dialog>)
   -------------------------------------------------------------------------- */
function initDialog() {
  const dialog = document.getElementById('html5Dialog');
  const openBtn = document.getElementById('openDialogBtn');
  const closeCross = document.getElementById('closeDialogCross');

  if (!dialog || !openBtn) return;

  openBtn.addEventListener('click', () => {
    // showModal() opens the dialog in the browser's top layer with backdrop
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      alert('Native <dialog> API is supported in all modern browsers.');
    }
  });

  if (closeCross) {
    closeCross.addEventListener('click', () => {
      dialog.close();
    });
  }

  // Close when clicking directly on backdrop
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      dialog.close();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Form Controls & Reactive Calculations (<output>, <meter>, validation)
   -------------------------------------------------------------------------- */
function initFormControls() {
  const form = document.getElementById('html5SuperForm');
  const rangeInput = document.getElementById('rangeScore');
  const rangeOutput = document.getElementById('rangeOutput');
  const colorInput = document.getElementById('themeColor');
  const colorDisplay = document.getElementById('colorHexDisplay');
  const statusBox = document.getElementById('formValidationStatus');

  // Real-time Range calculation
  if (rangeInput && rangeOutput) {
    rangeInput.addEventListener('input', () => {
      rangeOutput.value = `${rangeInput.value}%`;
    });
  }

  // Color picker value listener
  if (colorInput && colorDisplay) {
    colorInput.addEventListener('input', () => {
      colorDisplay.textContent = colorInput.value;
      colorDisplay.style.color = colorInput.value;
    });
  }

  // Native Form Validation Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        statusBox.className = 'form-status error';
        statusBox.textContent = '❌ Validation Failed: Please review highlighted mandatory fields.';
      } else {
        statusBox.className = 'form-status success';
        statusBox.textContent = '✅ Success! All HTML5 validation constraints satisfied.';
        setTimeout(() => {
          statusBox.textContent = '';
        }, 5000);
      }
    });

    form.addEventListener('reset', () => {
      setTimeout(() => {
        if (rangeOutput && rangeInput) rangeOutput.value = `${rangeInput.value}%`;
        if (colorDisplay && colorInput) {
          colorDisplay.textContent = colorInput.value;
          colorDisplay.style.color = '';
        }
        statusBox.textContent = '';
      }, 50);
    });
  }
}

// Global calculateOutput hook called inline by form oninput
window.calculateOutput = function() {
  const range = document.getElementById('rangeScore');
  const out = document.getElementById('rangeOutput');
  if (range && out) {
    out.value = `${range.value}%`;
  }
};

/* --------------------------------------------------------------------------
   4. Programmable 2D HTML5 Canvas (<canvas>)
   -------------------------------------------------------------------------- */
function initCanvasAnimation() {
  const canvas = document.getElementById('interactiveCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let speedMultiplier = 1;

  // Particle System
  const particles = [];
  const paletteGroups = [
    ['#38bdf8', '#818cf8', '#c084fc'],
    ['#34d399', '#10b981', '#06b6d4'],
    ['#f43f5e', '#fb923c', '#facc15']
  ];
  let currentPaletteIndex = 0;

  for (let i = 0; i < 35; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      colorIndex: Math.floor(Math.random() * 3)
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connecting lines between close particles
    const currentColors = paletteGroups[currentPaletteIndex];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 * (1 - dist / 60)})`;
          ctx.lineWidth = 0.75;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach((p) => {
      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;

      // Bounce on boundaries
      if (p.x - p.radius < 0 || p.x + p.radius > canvas.width) p.vx *= -1;
      if (p.y - p.radius < 0 || p.y + p.radius > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = currentColors[p.colorIndex % currentColors.length];
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    animationFrameId = requestAnimationFrame(render);
  }

  render();

  // Canvas Control Buttons
  const colorBtn = document.getElementById('canvasColorBtn');
  const speedBtn = document.getElementById('canvasSpeedBtn');

  if (colorBtn) {
    colorBtn.addEventListener('click', () => {
      currentPaletteIndex = (currentPaletteIndex + 1) % paletteGroups.length;
    });
  }

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      speedMultiplier = speedMultiplier === 1 ? 2.5 : (speedMultiplier === 2.5 ? 0.5 : 1);
      speedBtn.textContent = speedMultiplier === 1 ? 'Speed: 1x' : (speedMultiplier === 2.5 ? 'Speed: 2.5x' : 'Speed: 0.5x');
    });
  }
}

/* --------------------------------------------------------------------------
   5. Interactive DOM Tree Inspector (Objective 5)
   -------------------------------------------------------------------------- */
const DOM_SPEC_DATA = {
  html: {
    tag: '<html>',
    type: '1 (ELEMENT_NODE)',
    children: '2 (<head>, <body>)',
    role: 'Document Root Element',
    desc: 'The top-level root element that encloses all head metadata and body visual nodes in an HTML document.'
  },
  head: {
    tag: '<head>',
    type: '1 (ELEMENT_NODE)',
    children: 'Contains <meta>, <title>, <link>, <script>, <style>',
    role: 'Document Metadata Container',
    desc: 'Houses machine-readable information such as character encoding, viewport configuration, page title, SEO schema, and asset links.'
  },
  meta: {
    tag: '<meta>',
    type: '1 (ELEMENT_NODE)',
    children: '0 (Void Element)',
    role: 'Metadata Descriptor',
    desc: 'Defines character sets, viewport scaling, Open Graph protocols, and search crawler index instructions.'
  },
  title: {
    tag: '<title>',
    type: '1 (ELEMENT_NODE)',
    children: '1 (Text Node)',
    role: 'Document Title',
    desc: 'Defines the document title shown in the browser tab, bookmarks, and search engine result pages (SERPs).'
  },
  link: {
    tag: '<link>',
    type: '1 (ELEMENT_NODE)',
    children: '0 (Void Element)',
    role: 'External Resource Link',
    desc: 'Establishes relationships to external stylesheets, icons, canonical URLs, and pre-connect origins.'
  },
  body: {
    tag: '<body>',
    type: '1 (ELEMENT_NODE)',
    children: 'All renderable UI nodes (<header>, <main>, <footer>)',
    role: 'Document Body Container',
    desc: 'Contains all visible content of the webpage rendered by the layout and painting engine.'
  },
  header: {
    tag: '<header>',
    type: '1 (ELEMENT_NODE)',
    children: 'Banner branding, headings, and navigation menu',
    role: 'Landmark: banner',
    desc: 'Represents introductory content or navigational aids, typically containing logos, headings, and search bars.'
  },
  main: {
    tag: '<main>',
    type: '1 (ELEMENT_NODE)',
    children: 'Top-level unique sections and articles',
    role: 'Landmark: main',
    desc: 'Encloses the dominant content unique to the document. Only one visible <main> element is permitted per page.'
  },
  section: {
    tag: '<section>',
    type: '1 (ELEMENT_NODE)',
    children: 'Headings, paragraphs, media components',
    role: 'Generic Document Section',
    desc: 'Represents a standalone thematic grouping of content, typically with a distinct heading (h1-h6).'
  },
  article: {
    tag: '<article>',
    type: '1 (ELEMENT_NODE)',
    children: 'Self-contained editorial content',
    role: 'Landmark: article',
    desc: 'A complete, self-contained composition (such as a blog post, forum reply, or news story) that is independently distributable.'
  },
  aside: {
    tag: '<aside>',
    type: '1 (ELEMENT_NODE)',
    children: 'Sidebars, callouts, related links',
    role: 'Landmark: complementary',
    desc: 'Represents content tangentially related to the content around it, such as sidebars or advertising modules.'
  },
  footer: {
    tag: '<footer>',
    type: '1 (ELEMENT_NODE)',
    children: 'Copyright, author info, back-to-top links',
    role: 'Landmark: contentinfo',
    desc: 'Represents a footer for its nearest ancestor section or root body, conveying authorship, legal disclosures, and sitemaps.'
  }
};

function initDomInspector() {
  const treeNodes = document.querySelectorAll('.tree-node');
  const inspectTagName = document.getElementById('inspectTagName');
  const inspectNodeType = document.getElementById('inspectNodeType');
  const inspectChildCount = document.getElementById('inspectChildCount');
  const inspectRole = document.getElementById('inspectRole');
  const inspectDesc = document.getElementById('inspectDesc');

  if (!treeNodes.length || !inspectTagName) return;

  treeNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();

      treeNodes.forEach(n => n.classList.remove('active-node'));
      node.classList.add('active-node');

      const tagKey = node.getAttribute('data-tag');
      const data = DOM_SPEC_DATA[tagKey] || {
        tag: `<${tagKey}>`,
        type: '1 (ELEMENT_NODE)',
        children: 'Dynamic Child Nodes',
        role: 'Standard HTML5 Node',
        desc: 'Semantic element in the modern Document Object Model.'
      };

      inspectTagName.textContent = data.tag;
      inspectNodeType.textContent = data.type;
      inspectChildCount.textContent = data.children;
      inspectRole.textContent = data.role;
      inspectDesc.textContent = data.desc;
    });
  });
}

/* --------------------------------------------------------------------------
   6. Scroll Spy Navigation Highlight
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.lab-section');

  window.addEventListener('scroll', () => {
    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}
