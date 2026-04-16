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
const navLinks = [...document.querySelectorAll('.nav-link[data-route]')];
const logoLink = document.querySelector('.topbar__logo[data-route]');
const routeLinks = logoLink ? [logoLink, ...navLinks] : navLinks;
const sectionMap = new Map(sections.map((section) => [section.id, section]));
const defaultSectionId = sections[0]?.id || '';
let activeSectionId = '';

const syncPageTitle = (targetId) => {
  const label = sectionLabels[targetId] || 'IngeniOsito Radiance';
  document.title = label === 'Inicio' ? 'IngeniOsito Radiance' : `${label} | IngeniOsito Radiance`;
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

navigateToSection(window.location.hash, { historyMode: 'replace' });

const carousels = [...document.querySelectorAll('[data-carousel]')];

carousels.forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = track ? [...track.querySelectorAll('[data-carousel-slide]')] : [];
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');

  if (!track || !prevButton || !nextButton || slides.length === 0) {
    return;
  }

  let activeIndex = 0;

  const syncCarousel = () => {
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
    track.setAttribute('aria-live', 'polite');
  };

  const moveCarousel = (nextIndex) => {
    activeIndex = Math.max(0, Math.min(slides.length - 1, nextIndex));
    syncCarousel();
  };

  prevButton.addEventListener('click', () => {
    moveCarousel(activeIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    moveCarousel(activeIndex + 1);
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveCarousel(activeIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveCarousel(activeIndex + 1);
    }
  });

  syncCarousel();
});
