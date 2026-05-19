/* ===== CUSTOM MOUSE TRAIL & LAG OUTLINE ===== */
const cursorTrail = document.createElement('div');
cursorTrail.className = 'cursor-trail';
const cursorOutline = document.createElement('div');
cursorOutline.className = 'cursor-trail-outline';
document.body.appendChild(cursorTrail);
document.body.appendChild(cursorOutline);

let mouseX = 0, mouseY = 0;
let outlineX = 0, outlineY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorTrail.style.left = `${mouseX}px`;
  cursorTrail.style.top = `${mouseY}px`;
});

// Smooth lerp for outer outline
function updateCursor() {
  const dx = mouseX - outlineX;
  const dy = mouseY - outlineY;
  outlineX += dx * 0.15;
  outlineY += dy * 0.15;
  cursorOutline.style.left = `${outlineX}px`;
  cursorOutline.style.top = `${outlineY}px`;
  requestAnimationFrame(updateCursor);
}
updateCursor();

// Grow cursor on link hover
document.querySelectorAll('a, button, .neural-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorTrail.style.width = '16px';
    cursorTrail.style.height = '16px';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursorTrail.style.width = '8px';
    cursorTrail.style.height = '8px';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
  });
});

/* ===== STICKY NAVBAR & ACTIVE NAV LINKS ===== */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    const bot = top + sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav__link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', window.scrollY >= top && window.scrollY < bot);
    }
  });
});

/* ===== NEURAL CANVAS PARTICLE SYSTEM ===== */
(function() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let w, h, nodes = [];
  const count = 75;
  const connectionDistance = 140;
  
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  
  function init() {
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 2 + 1
      });
    }
  }
  
  function draw() {
    ctx.clearRect(0, 0, w, h);
    
    // Draw connections
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.18 * (1 - dist / connectionDistance)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      
      // Mouse interaction connection
      const mdx = nodes[i].x - mouseX;
      const mdy = nodes[i].y - mouseY;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 180) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(155, 81, 224, ${0.3 * (1 - mdist / 180)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }
    
    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
      ctx.fill();
      
      n.x += n.vx;
      n.y += n.vy;
      
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });
    
    requestAnimationFrame(draw);
  }
  
  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  draw();
})();

/* ===== 3D CARD TILT & MOUSE POSITION TRACKING ===== */
const cards = document.querySelectorAll('.neural-card');
cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 10; // Max 10 deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
});

/* ===== INTERACTIVE TERMINAL SIMULATOR ===== */
(function() {
  const termBody = document.getElementById('terminal-body');
  const termInput = document.getElementById('terminal-input');
  const termSend = document.getElementById('terminal-send');
  
  if (!termBody || !termInput) return;
  
  function addLine(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `terminal__line ${type}`;
    div.innerHTML = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }
  
  // Initial messages
  setTimeout(() => addLine('Initializing Tanudeep_Neural_Interface v3.0...', 'system'), 200);
  setTimeout(() => addLine('Core modules: CV, PyTorch, ROS, DeepLearning loaded.', 'system'), 500);
  setTimeout(() => addLine('Type <span style="color:#00f2fe">/help</span> to view all diagnostic commands.', 'ai'), 900);
  
  function handleCommand(cmd) {
    cmd = cmd.trim().toLowerCase();
    addLine(`> ${cmd}`, 'user');
    
    if (cmd === '/help') {
      addLine('Available diagnostics commands:<br>' +
              ' - <span style="color:#00f2fe">/about</span> : System identity profile<br>' +
              ' - <span style="color:#00f2fe">/skills</span> : Full technical diagnostic analysis<br>' +
              ' - <span style="color:#00f2fe">/projects</span> : Details of major deployed AI modules<br>' +
              ' - <span style="color:#00f2fe">/clear</span> : Reset the terminal dashboard', 'ai');
    } else if (cmd === '/about') {
      addLine('Profile: Tanudeep Ganguly<br>Designation: AI Engineer @ Tata Electronics<br>Mission: Powering high-precision machine vision with neural networks at India\'s premier semiconductor fab.', 'ai');
    } else if (cmd === '/skills') {
      addLine('Core Systems: PyTorch, TensorFlow, OpenCV, C++, Python, ROS.<br>Expertise: Machine Vision, Object Detection, Semantic Image Segmentation, Audio generation using modified LSTMs.', 'ai');
    } else if (cmd === '/projects') {
      addLine('Deployed Models:<br>' +
              '1. SegNav : Semantic CNN for autonomous robot cameras.<br>' +
              '2. YOLO-D : Light-adaptive custom object detector.<br>' +
              '3. LSTM-Music : RNN-based melody synthesis.', 'ai');
    } else if (cmd === '/clear') {
      termBody.innerHTML = '';
      addLine('Diagnostics system terminal screen cleared.', 'system');
    } else {
      addLine(`Command not recognized: "${cmd}". Type <span style="color:#00f2fe">/help</span> for instruction set.`, 'system');
    }
  }
  
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = termInput.value;
      if (val) {
        handleCommand(val);
        termInput.value = '';
      }
    }
  });
  
  termSend.addEventListener('click', () => {
    const val = termInput.value;
    if (val) {
      handleCommand(val);
      termInput.value = '';
    }
  });
})();

/* ===== CONSOLE TYPING EFFECT ON HERO ===== */
if (window.Typed) {
  new Typed('.typed', {
    strings: [
      'Machine Vision Architectures',
      'Autonomous Robot Navigation',
      'Low-Light Object Detection',
      'Melody Synthesis via LSTM',
      'Advanced ROS Integrations'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true,
    cursorChar: '_'
  });
}

/* ===== CYBERPUNK FORM HANDLER ===== */
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'TRANSMITTING DIGITAL PACKET...';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        status.textContent = '✓ Digital message package successfully transmitted.';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      status.textContent = '✗ Transmission error. Please utilize direct mail.';
      status.className = 'form-status error';
    }
    btn.disabled = false;
    btn.innerHTML = oldText;
    setTimeout(() => status.textContent = '', 6000);
  });
}
