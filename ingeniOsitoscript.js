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
const highPriorityImageLimit = 2;
let activeSectionId = '';
const experienciaCarousels = [...document.querySelectorAll('[data-experiencias-carousel]')];

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

const optimizeImages = (targetId) => {
  const pinnedImages = new Set([...document.querySelectorAll('.topbar__logo-image')]);
  const currentSection = sectionMap.get(targetId);
  const currentSectionImages = currentSection ? [...currentSection.querySelectorAll('img')] : [];
  const highPriorityImages = new Set(currentSectionImages.slice(0, highPriorityImageLimit));

  document.querySelectorAll('img').forEach((image) => {
    image.decoding = 'async';
    const isPinnedImage = pinnedImages.has(image);
    const isCurrentSectionImage = currentSectionImages.includes(image);

    image.loading = isPinnedImage || isCurrentSectionImage ? 'eager' : 'lazy';
    image.fetchPriority = isPinnedImage || highPriorityImages.has(image) ? 'high' : 'low';
  });
};

const resolveSectionId = (hash) => {
  const normalizedHash = hash.replace('#', '');
  return sectionMap.has(normalizedHash) ? normalizedHash : defaultSectionId;
};

const buildExperienciasCarousel = (carousel) => {
  const track = carousel.querySelector('.experiencias-carousel__track');
  const cards = track ? [...track.querySelectorAll('.experiencias-carousel__card')] : [];
  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const pagination = carousel.parentElement?.querySelector('[data-carousel-pagination]');
  let currentIndex = 0;

  if (!track || cards.length < 2 || !previousButton || !nextButton || !pagination) {
    return;
  }

  const dots = cards.map((card, index) => {
    const dotButton = document.createElement('button');
    dotButton.type = 'button';
    dotButton.className = 'experiencias-carousel__dot';
    dotButton.setAttribute('aria-label', `Ir a la tarjeta ${index + 1}`);
    dotButton.setAttribute('aria-current', String(index === currentIndex));
    dotButton.dataset.carouselDot = String(index);
    dotButton.addEventListener('click', () => {
      currentIndex = index;
      render();
    });
    pagination.append(dotButton);
    return dotButton;
  });

  const render = () => {
    track.style.setProperty('--experiencias-card-index', String(currentIndex));
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === cards.length - 1;
    previousButton.setAttribute('aria-disabled', String(previousButton.disabled));
    nextButton.setAttribute('aria-disabled', String(nextButton.disabled));
    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === currentIndex));
    });
  };

  previousButton.addEventListener('click', () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    render();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : cards.length - 1;
    render();
  });

  render();
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
    optimizeImages(resolvedId);
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

experienciaCarousels.forEach(buildExperienciasCarousel);

navigateToSection(window.location.hash, { historyMode: 'replace' });
