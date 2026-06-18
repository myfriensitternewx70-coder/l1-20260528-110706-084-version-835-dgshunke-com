(function () {
  const video = document.querySelector('[data-player]');
  const overlay = document.querySelector('.play-overlay');
  const holder = document.querySelector('.player-card');
  let hlsInstance = null;
  let started = false;

  if (!video || typeof videoUrl !== 'string') {
    return;
  }

  function playVideo() {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function attachSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }

        hlsInstance.destroy();
        hlsInstance = null;
        video.src = videoUrl;
        playVideo();
      });
      return;
    }

    video.src = videoUrl;
    playVideo();
  }

  function start() {
    if (started) {
      playVideo();
      return;
    }

    started = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    attachSource();
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (holder) {
    holder.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
})();
