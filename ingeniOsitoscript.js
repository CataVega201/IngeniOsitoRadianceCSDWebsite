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
const starfieldCanvas = document.querySelector('[data-starfield]');
const particleCount = 18;
const starCount = 220;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSectionId = '';
let starfieldAnimationFrame = 0;
let starfieldState = null;

const createStarSprite = () => {
  const spriteSize = 64;
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = spriteSize;
  spriteCanvas.height = spriteSize;
  const spriteContext = spriteCanvas.getContext('2d');
  if (!spriteContext) {
    return null;
  }
  const center = spriteSize / 2;
  const gradient = spriteContext.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.15, 'rgba(201,192,255,0.92)');
  gradient.addColorStop(0.35, 'rgba(125,243,255,0.42)');
  gradient.addColorStop(1, 'rgba(2,3,10,0)');
  spriteContext.fillStyle = gradient;
  spriteContext.beginPath();
  spriteContext.arc(center, center, center, 0, Math.PI * 2);
  spriteContext.fill();
  return spriteCanvas;
};

const buildStars = (width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxOrbit = Math.hypot(width, height) * 0.5;

  return Array.from({ length: starCount }, () => {
    const orbitRadius = Math.random() * maxOrbit;
    return {
      orbitRadius,
      radius: Math.max(0.8, orbitRadius * 0.01 + Math.random() * 1.6),
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.00022 + 0.00006) * (0.45 + orbitRadius / maxOrbit),
      alpha: Math.random() * 0.45 + 0.35,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.015 + 0.004,
      orbitX: centerX,
      orbitY: centerY,
    };
  });
};

const drawStars = (animate) => {
  if (!starfieldState || !starfieldCanvas) {
    return;
  }
  const { context, stars, sprite, width, height } = starfieldState;
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = 'rgba(2,3,10,0.18)';
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'lighter';

  stars.forEach((star) => {
    if (animate) {
      star.angle += star.speed;
      star.twinklePhase += star.twinkleSpeed;
    }
    const twinkle = Math.sin(star.twinklePhase) * 0.14;
    const alpha = Math.max(0.12, Math.min(1, star.alpha + twinkle));
    const x = Math.sin(star.angle) * star.orbitRadius + star.orbitX;
    const y = Math.cos(star.angle) * star.orbitRadius + star.orbitY;
    context.globalAlpha = alpha;
    context.drawImage(sprite, x - star.radius * 0.5, y - star.radius * 0.5, star.radius, star.radius);
  });
};

const stopStarfieldAnimation = () => {
  if (starfieldAnimationFrame) {
    window.cancelAnimationFrame(starfieldAnimationFrame);
    starfieldAnimationFrame = 0;
  }
};

const animateStarfield = () => {
  if (motionPreference.matches) {
    stopStarfieldAnimation();
    drawStars(false);
    return;
  }
  drawStars(true);
  starfieldAnimationFrame = window.requestAnimationFrame(animateStarfield);
};

const setupStarfield = () => {
  if (!starfieldCanvas) {
    return;
  }
  const context = starfieldCanvas.getContext('2d');
  if (!context) {
    return;
  }
  const sprite = createStarSprite();
  if (!sprite) {
    return;
  }
  const bounds = starfieldCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  starfieldCanvas.width = Math.round(width * dpr);
  starfieldCanvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  starfieldState = {
    context,
    sprite,
    stars: buildStars(width, height),
    width,
    height,
  };
  stopStarfieldAnimation();
  animateStarfield();
};

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

  Array.from({ length: particleCount }).forEach(() => {
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

if (typeof motionPreference.addEventListener === 'function') {
  motionPreference.addEventListener('change', () => {
    createParticles();
    setupStarfield();
  });
} else if (typeof motionPreference.addListener === 'function') {
  motionPreference.addListener(() => {
    createParticles();
    setupStarfield();
  });
}

if (typeof ResizeObserver === 'function' && starfieldCanvas?.parentElement) {
  const starfieldResizeObserver = new ResizeObserver(() => {
    setupStarfield();
  });
  starfieldResizeObserver.observe(starfieldCanvas.parentElement);
} else {
  window.addEventListener('resize', setupStarfield, { passive: true });
}

createParticles();
setupStarfield();
navigateToSection(window.location.hash, { historyMode: 'replace' });
