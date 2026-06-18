(function () {
  var qs = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var qsa = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  qsa('[data-menu-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var nav = qs('[data-mobile-nav]');
      if (nav) {
        nav.classList.toggle('is-open');
      }
    });
  });

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    var start = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var search = qs('[data-search]', panel);
    var year = qs('[data-year-filter]', panel);
    var genre = qs('[data-genre-filter]', panel);
    var scope = panel.getAttribute('data-filter-panel');
    var root = scope ? qs(scope) : document;
    var cards = qsa('[data-card]', root || document);
    var empty = qs('[data-empty]', root || document);

    var apply = function () {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var genreValue = genre ? genre.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !yearValue || (card.getAttribute('data-year') || '') === yearValue;
        var okGenre = !genreValue || text.indexOf(genreValue.toLowerCase()) !== -1;
        var show = okKeyword && okYear && okGenre;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    if (search) {
      search.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (genre) {
      genre.addEventListener('change', apply);
    }
    apply();
  });

  var instances = new WeakMap();
  var prepareVideo = function (box) {
    var video = qs('video', box);
    var cover = qs('[data-start]', box);
    var message = qs('.player-message', box);
    var streamUrl = box.getAttribute('data-play');
    if (!video || !streamUrl) {
      return;
    }

    var revealMessage = function () {
      if (message) {
        message.textContent = '播放暂时不可用';
        message.classList.add('is-visible');
      }
    };

    var attach = function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!instances.has(video)) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          if (window.Hls.Events && window.Hls.Events.ERROR) {
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                revealMessage();
              }
            });
          }
          instances.set(video, hls);
        }
        return Promise.resolve();
      }
      if (!video.getAttribute('src')) {
        video.setAttribute('src', streamUrl);
      }
      return Promise.resolve();
    };

    var play = function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      attach().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            revealMessage();
          });
        }
      });
    };

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };

  qsa('[data-play]').forEach(prepareVideo);
})();
