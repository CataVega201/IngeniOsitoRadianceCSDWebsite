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

const particlesRoot = document.getElementById('hero-particles');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const PARTICLE_COUNT = 18;

const createParticles = () => {
  if (!particlesRoot || reducedMotionQuery.matches) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'hero-lockup__particle';

    const radius = 32 + Math.random() * 34;
    const angle = Math.random() * Math.PI * 2;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    const size = 0.14 + Math.random() * 0.32;
    const duration = 4.7 + Math.random() * 3.3;
    const delay = -Math.random() * duration;
    const shiftX = (Math.random() * 0.65 - 0.325).toFixed(3);
    const shiftY = -(0.55 + Math.random() * 0.85).toFixed(3);

    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    particle.style.width = `${size}rem`;
    particle.style.height = `${size}rem`;
    particle.style.setProperty('--particle-duration', `${duration.toFixed(2)}s`);
    particle.style.setProperty('--particle-delay', `${delay.toFixed(2)}s`);
    particle.style.setProperty('--particle-shift-x', `${shiftX}rem`);
    particle.style.setProperty('--particle-shift-y', `${shiftY}rem`);

    fragment.append(particle);
  }

  particlesRoot.append(fragment);
};

createParticles();
