/** Rise-in on first view for [data-reveal] and [data-lines] (see styles/marketing.css). */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-reveal], [data-lines]').forEach((el) => io.observe(el));
