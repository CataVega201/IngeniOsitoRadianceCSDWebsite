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
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSectionId = '';
let starfieldController = null;

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

const createStarfield = () => {
  if (!starfieldCanvas) {
    return null;
  }

  const context = starfieldCanvas.getContext('2d', { alpha: true });

  if (!context) {
    return null;
  }

  const hue = 217;
  const maxStars = 900;
  const dprLimit = 2;
  let stars = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let isRunning = false;
  let staticRendered = false;
  let stampSize = 64;
  let starStamp = document.createElement('canvas');
  let stampContext = starStamp.getContext('2d');

  const random = (min, max) => {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
  };

  const maxOrbit = (x, y) => {
    const maxDimension = Math.max(x, y);
    return Math.round(Math.hypot(maxDimension, maxDimension) * 0.5);
  };

  const updateStamp = () => {
    stampSize = width > 1200 ? 78 : 64;
    starStamp.width = stampSize;
    starStamp.height = stampSize;
    stampContext = starStamp.getContext('2d');

    if (!stampContext) {
      return;
    }

    const half = stampSize * 0.5;
    const gradient = stampContext.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0.025, '#ffffff');
    gradient.addColorStop(0.12, `hsl(${hue} 61% 40%)`);
    gradient.addColorStop(0.26, `hsl(${hue} 64% 9%)`);
    gradient.addColorStop(1, 'transparent');
    stampContext.clearRect(0, 0, stampSize, stampSize);
    stampContext.fillStyle = gradient;
    stampContext.beginPath();
    stampContext.arc(half, half, half, 0, Math.PI * 2);
    stampContext.fill();
  };

  const buildStars = () => {
    const orbitLimit = maxOrbit(width, height);
    stars = Array.from({ length: maxStars }, () => {
      const orbitRadius = random(0, orbitLimit);
      return {
        orbitRadius,
        radius: random(40, Math.max(40, orbitRadius)) / 12,
        orbitX: width * 0.5,
        orbitY: height * 0.5,
        timePassed: random(0, maxStars),
        speed: random(0, orbitRadius) / 90000,
        alpha: random(2, 10) / 10,
      };
    });
  };

  const resize = () => {
    const { width: nextWidth, height: nextHeight } = starfieldCanvas.getBoundingClientRect();
    width = Math.max(1, Math.round(nextWidth));
    height = Math.max(1, Math.round(nextHeight));
    const scale = Math.min(window.devicePixelRatio || 1, dprLimit);
    starfieldCanvas.width = Math.round(width * scale);
    starfieldCanvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.imageSmoothingEnabled = true;
    updateStamp();
    buildStars();
    staticRendered = false;
  };

  const drawFrame = (shouldAnimate) => {
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    stars.forEach((star) => {
      const x = Math.sin(star.timePassed) * star.orbitRadius + star.orbitX;
      const y = Math.cos(star.timePassed) * star.orbitRadius + star.orbitY;
      const twinkle = random(0, 10);
      if (twinkle === 1 && star.alpha > 0) {
        star.alpha -= 0.05;
      } else if (twinkle === 2 && star.alpha < 1) {
        star.alpha += 0.05;
      }
      context.globalAlpha = star.alpha;
      context.drawImage(starStamp, x - star.radius * 0.5, y - star.radius * 0.5, star.radius, star.radius);
      if (shouldAnimate) {
        star.timePassed += star.speed;
      }
    });
  };

  const step = () => {
    if (!isRunning) {
      return;
    }
    drawFrame(true);
    rafId = window.requestAnimationFrame(step);
  };

  const start = () => {
    if (motionPreference.matches) {
      if (!staticRendered) {
        drawFrame(false);
        staticRendered = true;
      }
      return;
    }

    if (isRunning) {
      return;
    }

    isRunning = true;
    step();
  };

  const stop = () => {
    isRunning = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const syncMotion = () => {
    if (motionPreference.matches) {
      stop();
      drawFrame(false);
      staticRendered = true;
      return;
    }
    staticRendered = false;
    if (activeSectionId === 'inicio') {
      start();
    }
  };

  const handleResize = () => {
    resize();
    syncMotion();
  };

  window.addEventListener('resize', handleResize, { passive: true });
  resize();

  return {
    start,
    stop,
    syncMotion,
  };
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
    if (starfieldController) {
      if (resolvedId === 'inicio') {
        starfieldController.start();
      } else {
        starfieldController.stop();
      }
    }
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
    starfieldController?.syncMotion();
  });
} else if (typeof motionPreference.addListener === 'function') {
  motionPreference.addListener(() => {
    createParticles();
    starfieldController?.syncMotion();
  });
}

createParticles();
starfieldController = createStarfield();
navigateToSection(window.location.hash, { historyMode: 'replace' });
