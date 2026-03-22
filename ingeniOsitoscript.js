const sections = [...document.querySelectorAll('[data-section]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const linkMap = new Map(navLinks.map((link) => [link.getAttribute('href').slice(1), link]));

const setActiveSection = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link === linkMap.get(id));
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        setActiveSection(entry.target.id);
      }
    });
  },
  {
    threshold: 0.45,
    rootMargin: '-10% 0px -20% 0px'
  }
);

sections.forEach((section) => observer.observe(section));

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const targetId = link.getAttribute('href').slice(1);
    setActiveSection(targetId);
  });
});

if (sections.length > 0) {
  setActiveSection(sections[0].id);
  sections[0].classList.add('is-visible');
}
