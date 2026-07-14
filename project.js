(function () {
  'use strict';

  const projectId = Number(document.body.dataset.projectId) || 1;
  const routes = {
    1: 'work/branding-identity/logo-design/projects/',
    2: 'work/branding-identity/brand-identity/projects/',
    3: 'work/marketing-design/social-media/projects/',
    4: 'work/marketing-design/poster/projects/',
    5: 'work/marketing-design/flyer/projects/',
    6: 'work/marketing-design/banner/projects/',
    7: 'work/branding-identity/business-card/projects/',
    8: 'work/marketing-design/menu/projects/',
    9: 'work/branding-identity/packaging/projects/',
    10: 'work/branding-identity/logo-design/projects/',
    11: 'work/branding-identity/brand-identity/projects/',
    12: 'work/branding-identity/packaging/projects/',
    13: 'work/website-design/business-website/projects/',
    14: 'work/website-design/portfolio-website/projects/',
    15: 'work/website-design/restaurant-website/projects/',
    16: 'work/website-design/landing-page/projects/'
  };

  window.location.replace(`../../${routes[projectId] || routes[1]}`);
})();
