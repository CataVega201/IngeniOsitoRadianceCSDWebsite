const sections = [...document.querySelectorAll('[data-section]')];
const navLinks = [...document.querySelectorAll('.topbar__links .nav-link[data-route]')];
const logoLink = document.querySelector('.topbar__logo[data-route]');
const routeLinks = logoLink ? [logoLink, ...navLinks] : navLinks;
const sectionMap = new Map(sections.map((section) => [section.id, section]));
const defaultSectionId = sections[0]?.id || '';
let activeSectionId = '';

const updateNavigationState = (targetId) => {
  navLinks.forEach((link) => {
    const isActive = link.dataset.route === targetId;
    link.classList.toggle('is-active', isActive);

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
    section.setAttribute('aria-hidden', String(!isActive));
  });
};

const resolveSectionId = (hash) => {
  const normalizedHash = hash.replace('#', '');
  return sectionMap.has(normalizedHash) ? normalizedHash : defaultSectionId;
};

const navigateToSection = (targetId, options = {}) => {
  const { historyMode = 'push', focusSection = false } = options;
  const resolvedId = resolveSectionId(targetId);

  if (!resolvedId) {
    return;
  }

  const shouldSyncHistory = resolvedId !== activeSectionId || historyMode === 'replace';

  if (resolvedId !== activeSectionId) {
    activeSectionId = resolvedId;
    updateNavigationState(resolvedId);
    updateSectionState(resolvedId);
  }

  if (shouldSyncHistory) {
    const nextUrl = `#${resolvedId}`;

    if (historyMode === 'replace') {
      window.history.replaceState({ sectionId: resolvedId }, '', nextUrl);
    } else {
      window.history.pushState({ sectionId: resolvedId }, '', nextUrl);
    }
  }

  if (focusSection) {
    sectionMap.get(resolvedId)?.focus({ preventScroll: true });
  }
};

routeLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigateToSection(link.dataset.route, { historyMode: 'push', focusSection: true });
  });
});

window.addEventListener('popstate', () => {
  navigateToSection(window.location.hash, { historyMode: 'replace' });
});

sections.forEach((section) => {
  section.setAttribute('tabindex', '-1');
});

navigateToSection(window.location.hash, { historyMode: 'replace' });
