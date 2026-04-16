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
const experienceCarousels = [...document.querySelectorAll('[data-carousel]')];
const sectionMap = new Map(sections.map((section) => [section.id, section]));
const defaultSectionId = sections[0]?.id || '';
let activeSectionId = '';
let lastActiveCarousel = experienceCarousels[0] || null;

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

const initializeCarousel = (carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');

  if (!track || !previousButton || !nextButton) {
    return null;
  }

  const slides = [...track.children];
  let currentIndex = 0;

  const update = () => {
    track.style.setProperty('--carousel-index', String(currentIndex));
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
  };

  const moveBy = (step) => {
    const nextIndex = Math.min(Math.max(currentIndex + step, 0), slides.length - 1);
    if (nextIndex !== currentIndex) {
      currentIndex = nextIndex;
      update();
    }
  };

  previousButton.addEventListener('click', () => {
    moveBy(-1);
    carousel.focus();
    lastActiveCarousel = carousel;
  });

  nextButton.addEventListener('click', () => {
    moveBy(1);
    carousel.focus();
    lastActiveCarousel = carousel;
  });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBy(-1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(1);
    }
  });

  carousel.addEventListener('focusin', () => {
    lastActiveCarousel = carousel;
  });

  carousel.addEventListener('pointerenter', () => {
    lastActiveCarousel = carousel;
  });

  update();

  return { moveBy };
};

const carouselControllers = new Map(
  experienceCarousels
    .map((carousel) => [carousel, initializeCarousel(carousel)])
    .filter(([, controller]) => controller !== null),
);

window.addEventListener('keydown', (event) => {
  if (activeSectionId !== 'experiencias') {
    return;
  }
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  const targetElement = document.activeElement;
  if (targetElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetElement.tagName)) {
    return;
  }
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return;
  }

  const controller = (lastActiveCarousel && carouselControllers.get(lastActiveCarousel)) || null;
  if (!controller) {
    return;
  }

  event.preventDefault();
  controller.moveBy(event.key === 'ArrowLeft' ? -1 : 1);
});

navigateToSection(window.location.hash, { historyMode: 'replace' });
