 const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    // Notes mapped to keyboard keys
    const noteMap = {
      'a': 261.63, // C4
      's': 293.66, // D4
      'd': 329.63, // E4
      'f': 349.23, // F4
      'g': 392.00, // G4
      'h': 440.00, // A4
      'j': 493.88, // B4
      'k': 523.25  // C5
    };

    const keyboard = document.getElementById('keyboard');

    // Create visual keys
    for (const key in noteMap) {
      const div = document.createElement('div');
      div.classList.add('key');
      div.dataset.key = key;
      div.innerHTML = `<span class="label">${key.toUpperCase()}</span>`;
      keyboard.appendChild(div);

      // Click plays the note
      div.addEventListener('mousedown', () => playNote(key));
      div.addEventListener('mouseup', () => releaseKey(key));
      div.addEventListener('mouseleave', () => releaseKey(key));
    }

    function playNote(key) {
      const freq = noteMap[key];
      if (!freq) return;

      const keyEl = document.querySelector(`.key[data-key="${key}"]`);
      keyEl.classList.add('active');

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();

      // Stop after 0.5s (simple "note length")
      osc.stop(audioCtx.currentTime + 0.5);
      setTimeout(() => keyEl.classList.remove('active'), 200);
    }

    function releaseKey(key) {
      const keyEl = document.querySelector(`.key[data-key="${key}"]`);
      keyEl?.classList.remove('active');
    }

    // Play via keyboard
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (noteMap[key]) playNote(key);
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      releaseKey(key);
    });