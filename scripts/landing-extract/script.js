
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive:true });

  const grid = document.getElementById('heroGrid');
  const cols = 22, rows = 11;
  for (let i = 0; i < cols*rows; i++){
    const c = document.createElement('div');
    c.className = 'cell';
    c.style.animationDelay = (Math.random()*7).toFixed(2) + 's';
    c.style.animationDuration = (5 + Math.random()*5).toFixed(2) + 's';
    grid.appendChild(c);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced){
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:0.14 });
    revealEls.forEach(el => io.observe(el));
  }

  function countUp(el){
    const target = parseInt(el.dataset.count, 10);
    const dur = 1400;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now-start)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(eased*target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (prefersReduced){
    document.querySelectorAll('.hud-stat .n').forEach(el => el.textContent = parseInt(el.dataset.count,10).toLocaleString());
  } else {
    document.querySelectorAll('.hud-stat .n').forEach(countUp);
  }
