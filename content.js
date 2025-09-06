function observeDynamicContent() {
  console.log('YouTube-Title-Speaker content script loaded');

  let lastTitle = undefined;

  // Utility: fire an event on SPA navigations
  const emitLocationChange = () => window.dispatchEvent(new Event('locationchange'));
  ['pushState','replaceState'].forEach(m => {
    const orig = history[m];
    history[m] = function(...args) {
      const ret = orig.apply(this, args);
      emitLocationChange();
      return ret;
    };
  });
  window.addEventListener('popstate', emitLocationChange);

  // Selector for the video title element
  const TITLE_SELECTOR = 'h1.style-scope.ytd-watch-metadata yt-formatted-string[title]';

  // Observe title element changes and initial insert
  const watchForTitle = () => {
    console.log(`watchForTitle()`);
    const el = document.querySelector(TITLE_SELECTOR);
    if (!el) return;

    console.log(`announceTitle: el="${el}"`);

    // Speak whenever its `title` attribute or text changes
    const announce = () => {
    console.log('accounce()');
      const t = el.getAttribute('title')?.trim() || el.textContent.trim();
      console.log(`announce(): t="${t}" lastTitle="${lastTitle}"`);
      if (t && t !== lastTitle) {
        lastTitle = t;
        speak(t);
      }
    };

    // MutationObserver for dynamics
    const mo = new MutationObserver(announce);
    mo.observe(el, { attributes: true, childList: true, subtree: true });

    // Initial announce
    announce();
  };

  // Re-run when SPA nav fires
  window.addEventListener('locationchange', () => {
    lastTitle = '';        // reset so same title will re-announce if revisited
    // slight delay to allow new DOM to load
    setTimeout(watchForTitle, 500);
  });

  // Kick off on first load
  watchForTitle();

function speak(text) {
    console.log(`speak("${text}")`);
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
})();
