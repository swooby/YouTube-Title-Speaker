(() => {
  console.log('YouTube Title Announcer content script loaded');

  let lastTitle = '';

  // Watch for SPA navigations (pushState/replaceState/popstate)
  const emitLocationChange = () => window.dispatchEvent(new Event('locationchange'));
  const wrapHistory = (method) => {
    const orig = history[method];
    history[method] = function (...args) {
      const ret = orig.apply(this, args);
      emitLocationChange();
      return ret;
    };
  };
  wrapHistory('pushState');
  wrapHistory('replaceState');
  window.addEventListener('popstate', emitLocationChange);

  // Observe <title> changes
  const titleEl = document.querySelector('title');
  const titleObserver = new MutationObserver(announceTitle);
  if (titleEl) titleObserver.observe(titleEl, { childList: true });

  // Also announce on each location change
  window.addEventListener('locationchange', announceTitle);

  // Initial announcement
  announceTitle();

  function announceTitle() {
    console.log('announceTitle()');
    const full = document.title;
    console.log(`announceTitle: full="${full}"`);
    const title = full.replace(/ - YouTube$/, '').trim();
    console.log(`announceTitle: title-"${title}"`);
    if (title && title !== lastTitle) {
      lastTitle = title;
      speak(title);
    }
  }

  function speak(text) {
    console.log(`speak("${text}")`);
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    // optional: u.lang = 'en-US';
    window.speechSynthesis.cancel(); // stop any in-progress speech
    window.speechSynthesis.speak(u);
  }
})();
