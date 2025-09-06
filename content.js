const TAG = 'YouTube-Title-Speaker';

function observeDynamicContent() {
  console.log(`${TAG}: observeDynamicContent()`);

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
    console.log(`${TAG}: initYouTubeWatcher()`);
    const selector = '#below > ytd-watch-metadata';
    const container = document.querySelector(selector);
    //console.log(`${TAG}: initYouTubeWatcher: container="${container}"`);
    if (container) {
      watchYoutube(container);
    }
  }

  function watchYoutube(container) {
    console.log(`${TAG}: watchYoutube(container=${container})`);
    // Speak whenever its `title` attribute or text changes
    const announce = () => {
      console.log(`${TAG}: announce()`);
      const artistFull = container.querySelector('#owner > ytd-video-owner-renderer > #upload-info > ytd-channel-name > #container > #text-container > #text > a')?.textContent.trim();
      const titleFull = container.querySelector('#title > h1 > yt-formatted-string').textContent.trim();
      //console.log(`${TAG}: announce: artistFull="${artistFull}", titleFull="${titleFull}"`);
      if (!(artistFull && titleFull)) return;
      const artist = artistFull.match(/^(.*?) - (.+)$/)?.[1] || artistFull;
      const titleMatches = titleFull.match(/^(.*?) - (.+)$/);
      //console.log(`${TAG}: announce: matches=${titleMatches}`);
      const title = titleMatches?.[1] || titleFull;
      //console.log(`${TAG}: announce: title="${title}"`);
      const extras = '';//titleMatches?.[2] || '';
      const thisTitle = `${title}, by ${artist}` + (extras ? `; ${extras}` : '');
      console.log(`${TAG}: announce: thisTitle="${thisTitle}" lastTitle="${lastTitle}"`);
      if (thisTitle !== lastTitle) {
        let text = '';
        if (lastTitle) {
          lastTitle = lastTitle.match(/^(.*?)(; .+)?$/)?.[1] || lastTitle;
          text = `That was ${lastTitle}; `;
        }
        text += `Now playing: ${thisTitle}`;
        lastTitle = thisTitle;
        speak(text, null, true);
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

    announce();  // initial announce
  }

  function onNav() {
    console.log(`${TAG}: onNav()`);
    lastTitle = undefined; // reset so same title will re-announce if revisited
    // slight delay to allow new DOM to load
    setTimeout(initYouTubeWatcher, 500);
    //initYouTubeWatcher();
  }

  // Re-run when SPA nav fires
  window.addEventListener('locationchange', onNav);

  // Kick off on first load
  setTimeout(initYouTubeWatcher, 500);
  //initYouTubeWatcher();

  //setTimeout(speakVoices, 100); // announce available voices on first load

  function speak(text, voice, clear) {
    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) {
      console.warn(`${TAG}: Speech synthesis not supported in this browser`);
      return;
    }
    const voices = speechSynthesis.getVoices();
    //console.log(`voices: ${voices.map(v => v.name).join(', ')}`);
    if (voices.length === 0) {
      // voices aren’t ready yet; delay until they fire
      speechSynthesis.onvoiceschanged = () => speak(text, voice, clear);
      return;
    }

    console.log(`${TAG}: speak("${text}", voice="${voice}", clear=${clear})`);

    if (!voice) {
      const desiredVoiceName = 'Daniel (English (United Kingdom))'; // or any other voice you prefer
      voice = voices.find(v => {
        //console.log(`Checking voice: "${v.name}"`);
        return v.name === desiredVoiceName;
      });
    }
    console.log(`${TAG}: Using voice: ${voice.name}`);

    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = voice;  // use specific voice
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
    console.log(`${TAG}: Page fully loaded...`);
    observeDynamicContent();
});

function speakVoices() {
  const speechSynthesis = window.speechSynthesis;
  if (!speechSynthesis) {
    console.warn(`${TAG}: Speech synthesis not supported in this browser`);
    return;
  }

  const voices = speechSynthesis.getVoices();
  //console.log(`Available voices: ${voices.map(v => v.name).join(', ')}`);
  /*
  Samantha, Aaron, Albert, Alice, Alva, Amélie, Amira, Anna, Arthur,
  Bad News, Bahh, Bells, Boing, Bubbles, Carmit, Catherine, Cellos,
  Damayanti, Daniel (English (United Kingdom)), Daniel (French (France)), Daria,
  Eddy (German (Germany)), Eddy (English (United Kingdom)), Eddy (English (United States)), Eddy (Spanish (Spain)), Eddy (Spanish (Mexico)), Eddy (Finnish (Finland)), Eddy (French (Canada)), Eddy (French (France)), Eddy (Italian (Italy)), Eddy (Japanese (Japan)), Eddy (Korean (South Korea)), Eddy (Portuguese (Brazil)), Eddy (Chinese (China mainland)), Eddy (Chinese (Taiwan)),
  Ellen,
  Flo (German (Germany)), Flo (English (United Kingdom)), Flo (English (United States)), Flo (Spanish (Spain)), Flo (Spanish (Mexico)), Flo (Finnish (Finland)), Flo (French (Canada)), Flo (French (France)), Flo (Italian (Italy)), Flo (Japanese (Japan)), Flo (Korean (South Korea)), Flo (Portuguese (Brazil)), Flo (Chinese (China mainland)), Flo (Chinese (Taiwan)),
  Fred, Good News, Gordon,
  Grandma (German (Germany)), Grandma (English (United Kingdom)), Grandma (English (United States)), Grandma (Spanish (Spain)), Grandma (Spanish (Mexico)), Grandma (Finnish (Finland)), Grandma (French (Canada)), Grandma (French (France)), Grandma (Italian (Italy)), Grandma (Japanese (Japan)), Grandma (Korean (South Korea)), Grandma (Portuguese (Brazil)), Grandma (Chinese (China mainland)), Grandma (Chinese (Taiwan)),
  Grandpa (German (Germany)), Grandpa (English (United Kingdom)), Grandpa (English (United States)), Grandpa (Spanish (Spain)), Grandpa (Spanish (Mexico)), Grandpa (Finnish (Finland)), Grandpa (French (Canada)), Grandpa (French (France)), Grandpa (Italian (Italy)), Grandpa (Japanese (Japan)), Grandpa (Korean (South Korea)), Grandpa (Portuguese (Brazil)), Grandpa (Chinese (China mainland)), Grandpa (Chinese (Taiwan)),
  Hattori, Helena, Ioana, Jacques, Jester, Joana, Junior, Kanya, Karen, Kathy, Kyoko, Lana, Laura, Lekha, Lesya, Li-Mu, Linh, Luciana,
  Majed, Marie, Martha, Martin, Meijia, Melina, Milena, Moira, Montse, Mónica,
  Nicky, Nora, O-Ren, Organ, Paulina, Ralph,
  Reed (German (Germany)), Reed (English (United Kingdom)), Reed (English (United States)), Reed (Spanish (Spain)), Reed (Spanish (Mexico)), Reed (Finnish (Finland)), Reed (French (Canada)), Reed (Italian (Italy)), Reed (Japanese (Japan)), Reed (Korean (South Korea)), Reed (Portuguese (Brazil)), Reed (Chinese (China mainland)), Reed (Chinese (Taiwan)),
  Rishi,
  Rocko (German (Germany)), Rocko (English (United Kingdom)), Rocko (English (United States)), Rocko (Spanish (Spain)), Rocko (Spanish (Mexico)), Rocko (Finnish (Finland)), Rocko (French (Canada)), Rocko (French (France)), Rocko (Italian (Italy)), Rocko (Japanese (Japan)), Rocko (Korean (South Korea)), Rocko (Portuguese (Brazil)), Rocko (Chinese (China mainland)), Rocko (Chinese (Taiwan)),
  Sandy (German (Germany)), Sandy (English (United Kingdom)), Sandy (English (United States)), Sandy (Spanish (Spain)), Sandy (Spanish (Mexico)), Sandy (Finnish (Finland)), Sandy (French (Canada)), Sandy (French (France)), Sandy (Italian (Italy)), Sandy (Japanese (Japan)), Sandy (Korean (South Korea)), Sandy (Portuguese (Brazil)), Sandy (Chinese (China mainland)), Sandy (Chinese (Taiwan)),
  Sara, Satu,
  Shelley (German (Germany)), Shelley (English (United Kingdom)), Shelley (English (United States)), Shelley (Spanish (Spain)), Shelley (Spanish (Mexico)), Shelley (Finnish (Finland)), Shelley (French (Canada)), Shelley (French (France)), Shelley (Italian (Italy)), Shelley (Japanese (Japan)), Shelley (Korean (South Korea)), Shelley (Portuguese (Brazil)), Shelley (Chinese (China mainland)), Shelley (Chinese (Taiwan)),
  Sinji, Superstar, Tessa, Thomas, Tina, Tingting, Trinoids, Tünde, Vani,
  Whisper, Wobble, Xander, Yelda, Yu-shu, Yuna, Zarvox, Zosia, Zuzana
  */
  voices.forEach(voice => {
    if (!voice.localService) return; // skip non-local-only voices
    console.warn(`Voice: ${voice.name} (${voice.lang}) - ${voice.default ? 'default' : ''}`);
    speak(`hi there from the voice named ${voice.name}`, voice);
  });
}
