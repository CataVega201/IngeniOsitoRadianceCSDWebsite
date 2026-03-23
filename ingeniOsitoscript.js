const sectionLabels = {
  inicio: 'Inicio',
  'que-es-esto': '¿Qué es esto?',
  'quienes-somos': '¿Quiénes somos?',
  experiencias: 'Experiencias',
  perspectivas: 'Perspectivas',
  experto: 'Experto',
  proceso: 'Proceso',
  aprendizajes: 'Aprendizajes',
};

const sections = [...document.querySelectorAll('[data-section]')];
const navLinks = [...document.querySelectorAll('.topbar__links .nav-link[data-route]')];
const logoLink = document.querySelector('.topbar__logo[data-route]');
const routeLinks = logoLink ? [logoLink, ...navLinks] : navLinks;
const sectionMap = new Map(sections.map((section) => [section.id, section]));
const defaultSectionId = sections[0]?.id || '';
const particleContainer = document.querySelector('[data-particles]');
const particleCount = 18;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSectionId = '';

const syncPageTitle = (targetId) => {
  const label = sectionLabels[targetId] || 'IngeniOsito Radiance';
  document.title = label === 'Inicio' ? 'IngeniOsito Radiance' : `${label} | IngeniOsito Radiance`;
};

const createParticles = () => {
  if (!particleContainer || motionPreference.matches) {
    if (particleContainer) {
      particleContainer.replaceChildren();
    }
    return;
  }

  const fragment = document.createDocumentFragment();

  Array.from({ length: particleCount }).forEach((_, index) => {
    const particle = document.createElement('span');
    particle.className = 'hero-particle';
    particle.style.setProperty('--particle-size', `${(Math.random() * 0.7 + 0.35).toFixed(2)}rem`);
    particle.style.setProperty('--particle-left', `${(Math.random() * 100).toFixed(2)}%`);
    particle.style.setProperty('--particle-top', `${(Math.random() * 100).toFixed(2)}%`);
    particle.style.setProperty('--particle-duration', `${(Math.random() * 5 + 5).toFixed(2)}s`);
    particle.style.setProperty('--particle-delay', `${(-Math.random() * 6).toFixed(2)}s`);
    particle.style.setProperty('--particle-drift', `${(Math.random() * 3 - 1.5).toFixed(2)}rem`);
    particle.style.setProperty('--particle-scale', `${(Math.random() * 0.7 + 0.7).toFixed(2)}`);
    particle.style.setProperty('--particle-opacity', `${(Math.random() * 0.35 + 0.25).toFixed(2)}`);
    particle.dataset.index = String(index);
    fragment.appendChild(particle);
  });

  particleContainer.replaceChildren(fragment);
};

const updateNavigationState = (targetId) => {
  routeLinks.forEach((link) => {
    const isActive = link.dataset.route === targetId;
    link.classList.toggle('is-active', isActive && link !== logoLink);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const updateSectionState = (targetId) => {
  sections.forEach((section) => {
    const isActive = section.id === targetId;
    section.classList.toggle('active', isActive);
    section.toggleAttribute('inert', !isActive);
    section.toggleAttribute('hidden', !isActive);
    section.setAttribute('aria-hidden', String(!isActive));
  });
};

const resolveSectionId = (hash) => {
  const normalizedHash = hash.replace('#', '');
  return sectionMap.has(normalizedHash) ? normalizedHash : defaultSectionId;
};

const navigateToSection = (targetId, options = {}) => {
  const { historyMode = 'push' } = options;
  const resolvedId = resolveSectionId(targetId);

  if (!resolvedId) {
    return;
  }

  const shouldSyncHistory = resolvedId !== activeSectionId || historyMode === 'replace';

  if (resolvedId !== activeSectionId) {
    activeSectionId = resolvedId;
    updateNavigationState(resolvedId);
    updateSectionState(resolvedId);
    syncPageTitle(resolvedId);
  }

  if (shouldSyncHistory) {
    const nextUrl = `#${resolvedId}`;

    if (historyMode === 'replace') {
      window.history.replaceState({ sectionId: resolvedId }, '', nextUrl);
    } else {
      window.history.pushState({ sectionId: resolvedId }, '', nextUrl);
    }
  }
};

routeLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigateToSection(link.dataset.route, { historyMode: 'push' });
  });
});

window.addEventListener('popstate', () => {
  navigateToSection(window.location.hash, { historyMode: 'replace' });
});

motionPreference.addEventListener('change', createParticles);

createParticles();
navigateToSection(window.location.hash, { historyMode: 'replace' });
