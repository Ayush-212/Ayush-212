// Dot + lagging ring cursor
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = -200, my = -200, rx = -200, ry = -200;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function loop() {
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a, button, .rd').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('on-link'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('on-link'));
});

const spb = document.getElementById('spb');
window.addEventListener('scroll', () => {
  spb.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
  updateDots();
}, { passive: true });

const sections = ['hero', 'about', 'toolkit', 'projects', 'next', 'connect'];
const dots = document.querySelectorAll('.rd');
function updateDots() {
  let cur = 0;
  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= innerHeight * 0.5) cur = i;
  });
  dots.forEach((d, i) => d.classList.toggle('on', i === cur));
}
dots.forEach((d, i) => d.addEventListener('click', () =>
  document.getElementById(sections[i])?.scrollIntoView({ behavior: 'smooth' })
));

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.r').forEach(el => obs.observe(el));
