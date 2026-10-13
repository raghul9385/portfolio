/**
 * Every page-leaving action goes through here, so it lives in one place and
 * the tests can spy on it (jsdom can't really navigate).
 */
export const Navigation = {
  /** Leaves the page, e.g. to hand a mailto: link to the visitor's email app. */
  goTo(url) {
    window.location.assign(url);
  },

  /** Opens a link in a new tab without giving it access to this page. */
  openInNewTab(url) {
    window.open(url, '_blank', 'noopener');
  },
};
