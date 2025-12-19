onload = () => {
    document.body.classList.remove("container");
    
    // Present box functionality
    const presentButton = document.getElementById('presentButton');
    const notesContainer = document.getElementById('notesContainer');
    const closeNotes = document.getElementById('closeNotes');
    
  let oliviaStarted = false;
  let nikiStarted = false;

  presentButton.addEventListener('click', () => {
    notesContainer.classList.add('show');
    // After unlock, start or resume NIKI without restarting if already playing
    if (tracks.length > 1) {
      if (!nikiStarted) {
        loadTrack(1); // NIKI track is second in the list
        playCurrent(true); // start from beginning the first time
        nikiStarted = true;
      } else if (audio.paused) {
        playCurrent(false); // resume without resetting time
      }
    }
  });
    
    closeNotes.addEventListener('click', () => {
        notesContainer.classList.remove('show');
    });
    
    // Close notes when clicking outside
    notesContainer.addEventListener('click', (e) => {
        if (e.target === notesContainer) {
            notesContainer.classList.remove('show');
        }
    });

  // Simple background music (plays on lock screen)
  const tracks = [
    'Olivia Dean - The Christmas Song (Lyric Video).mp3',
    'NIKI - Hallway Weather (Official Audio).mp3'
  ];
  const audio = document.getElementById('audioPlayer');
  audio.loop = true;

  function loadTrack(index) {
    if (!tracks.length) return;
    const normalized = (index + tracks.length) % tracks.length;
    audio.src = tracks[normalized];
  }

  function playCurrent(resetTime = false) {
    if (!audio.src && tracks.length) loadTrack(0);
    if (resetTime) {
      audio.currentTime = 0;
    }
    audio.play().catch(() => {});
  }

  if (tracks.length) {
    loadTrack(0);
  }

  // Passcode gate
  const passcodeOverlay = document.getElementById('passcodeOverlay');
  const passcodeCard = document.querySelector('.passcode-card');
  const magicButton = document.getElementById('magicButton');
  const passcodeInput = document.getElementById('passcodeInput');
  const passcodeSubmit = document.getElementById('passcodeSubmit');
  const passcodeError = document.getElementById('passcodeError');
  const PASSCODE = '251225';
  const errorMessages = [
    'Coba Lagi woi',
    'Coba Lagii woii',
    'Coba Lagiii woiii',
    'Coba Lagiiii woiiii',
    'Coba Lagiiiii woiiiiiiiiiiii',
    'Nyerah??',
    'Yaudaaa ini code nya...',
    'hmmm??? coba lagi lahh HEHE',
    'Lagiiii'
  ];
  let wrongAttempts = 0;

  function showError(msg) {
    passcodeError.textContent = msg;
    passcodeError.classList.remove('shake');
    // force reflow to restart animation
    void passcodeError.offsetWidth;
    passcodeError.classList.add('shake');
  }

  function unlock() {
    passcodeOverlay.classList.add('hidden');
    document.body.classList.add('unlocked');
    // Stop music after unlocking
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function handleSubmit() {
    const code = (passcodeInput.value || '').trim();
    if (code === PASSCODE) {
      unlock();
      wrongAttempts = 0;
    } else {
      wrongAttempts += 1;
      const idx = Math.floor((wrongAttempts - 1) / 2);
      const msg = errorMessages[Math.min(idx, errorMessages.length - 1)];
      showError(msg);
      passcodeInput.focus();
      passcodeInput.select();
    }
  }

  // Magic button sparkle effect
  if (magicButton && passcodeCard) {
    magicButton.addEventListener('click', () => {
      passcodeCard.classList.add('magic');
      setTimeout(() => passcodeCard.classList.remove('magic'), 800);

      // Start Olivia track when magic is sprinkled (helps if autoplay was blocked)
      if (!oliviaStarted) {
        loadTrack(0);
        playCurrent(true); // first start
        oliviaStarted = true;
      } else if (audio.paused && audio.src.includes('Olivia Dean')) {
        playCurrent(false); // resume without restart
      }

      // Magic snow burst
      const rect = magicButton.getBoundingClientRect();
      triggerMagicBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

      // Falling snow from the top (continuous)
      startFallingSnow();
    });
  }

  passcodeSubmit.addEventListener('click', handleSubmit);
  passcodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  });

  setTimeout(() => passcodeInput.focus(), 250);
};

let magicBurstTimer;
let fallingSnowTimer;

function triggerMagicBurst(centerX, centerY, duration = 1400, interval = 140) {
  if (magicBurstTimer) {
    clearTimeout(magicBurstTimer);
  }
  const end = Date.now() + duration;
  const emit = () => {
    spawnMagicFlakes(centerX, centerY, 12 + Math.floor(Math.random() * 6));
    if (Date.now() < end) {
      magicBurstTimer = setTimeout(emit, interval);
    }
  };
  emit();
}

function spawnMagicFlakes(centerX, centerY, count = 14) {
  const flakeChars = ['❄', '❅', '❆', '✧', '✦'];
  for (let i = 0; i < count; i++) {
    const flake = document.createElement('span');
    flake.className = 'magic-flake burst';
    flake.textContent = flakeChars[i % flakeChars.length];
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
    const distance = 40 + Math.random() * 40;
    flake.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    flake.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    flake.style.left = `${centerX}px`;
    flake.style.top = `${centerY}px`;
    document.body.appendChild(flake);
    setTimeout(() => flake.remove(), 1000);
  }
}

function startFallingSnow(interval = 900, batch = 5) {
  if (fallingSnowTimer) return; // already running

  const flakeChars = ['❄', '❅', '❆'];
  const emit = () => {
    const containerWidth = window.innerWidth;
    for (let i = 0; i < batch; i++) {
      const flake = document.createElement('span');
      flake.className = 'magic-flake fall';
      flake.textContent = flakeChars[Math.floor(Math.random() * flakeChars.length)];
      const left = Math.random() * containerWidth;
      const durationMs = 6800 + Math.random() * 3200; // slower, longer fall
      const delay = Math.random() * 0.8;
      const drift = (Math.random() - 0.5) * 70; // side-to-side drift
      flake.style.left = `${left}px`;
      flake.style.top = `-24px`;
      flake.style.animationDuration = `${durationMs}ms`;
      flake.style.animationDelay = `${delay}s`;
      flake.style.setProperty('--dx', `${drift}px`);
      document.body.appendChild(flake);
      setTimeout(() => flake.remove(), durationMs + 1800);
    }
  };

  emit();
  fallingSnowTimer = setInterval(emit, interval);
}