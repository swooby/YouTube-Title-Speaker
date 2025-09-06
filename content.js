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

  function initYouTubeWatcher() {
    console.log(`initYouTubeWatcher()`);
    const selector = '#below > ytd-watch-metadata';
    const container = document.querySelector(selector);
    //console.log(`initYouTubeWatcher: container="${container}"`);
    if (container) {
      watchYoutube(container);
    }
  }

  function watchYoutube(container) {
    console.log(`watchYoutube(container=${container})`);
    // Speak whenever its `title` attribute or text changes
    const announce = () => {
      console.log('announce()');
      const artistFull = container.querySelector('#owner > ytd-video-owner-renderer > #upload-info > ytd-channel-name > #container > #text-container > #text > a')?.textContent.trim();
      const titleFull = container.querySelector('#title > h1 > yt-formatted-string').textContent.trim();
      //console.log(`announce: artistFull="${artistFull}", titleFull="${titleFull}"`);
      if (!(artistFull && titleFull)) return;
      const artist = artistFull.match(/^(.*?) - (.+)$/)?.[1] || artistFull;
      const titleMatches = titleFull.match(/^(.*?) - (.+)$/);
      //console.log(`announce: matches=${titleMatches}`);
      const title = titleMatches?.[1] || titleFull;
      //console.log(`announce: title="${title}"`);
      const extras = titleMatches?.[2] || '';
      const thisTitle = `${title}, by ${artist}` + (extras ? `; ${extras}` : '');
      console.log(`announce: thisTitle="${thisTitle}" lastTitle="${lastTitle}"`);
      if (thisTitle !== lastTitle) {
        let text = '';
        if (lastTitle) {
          text = `That was ${lastTitle}; `;
        }
        text += `Now playing: ${thisTitle}`;
        lastTitle = thisTitle;
        speak(text, true);
      }
    };

    // MutationObserver for dynamics
    const mo = new MutationObserver(announce);
    mo.observe(container, {
      attributes: true,
      //characterData: true
      //childList: true,
      //subtree: true
    });

    announce();  // initial announce once playback starts
  }

  function onNav() {
    console.log('onNav()');
    //lastTitle = undefined; // reset so same title will re-announce if revisited
    // slight delay to allow new DOM to load
    //setTimeout(initYouTubeWatcher, 500);
    initYouTubeWatcher();
  }

  // Re-run when SPA nav fires
  window.addEventListener('locationchange', onNav);

  initYouTubeWatcher(); // Kick off on first load

  function speak(text, clear) {
    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    console.log(`speak("${text}", clear=${clear})`);

    const desiredVoiceName = 'Daniel (English (United Kingdom))'; // or any other voice you prefer

    const voices = speechSynthesis.getVoices();
    //console.log(`voices: ${voices.map(v => v.name).join(', ')}`);
    if (voices.length === 0) {
      // voices aren’t ready yet; delay until they fire
      speechSynthesis.onvoiceschanged = () => speak(text);
      return;
    }
    const voice = voices.find(v => {
      //console.log(`Checking voice: "${v.name}"`);
      return v.name === desiredVoiceName;
    });
    console.log(`Using voice: ${voice.name}`);

    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = voice;
    utter.lang = 'en-US'; // set language if needed
    utter.volume = 1;     // set volume if needed
    utter.rate = 1;       // set rate if needed
    utter.pitch = 1;      // set pitch if needed
    if (clear) {
      speechSynthesis.cancel();
    }
    speechSynthesis.speak(utter);
  }
}

window.addEventListener('load', () => {
    console.log('YouTube-Title-Speaker: Page fully loaded...');
    observeDynamicContent();
});
