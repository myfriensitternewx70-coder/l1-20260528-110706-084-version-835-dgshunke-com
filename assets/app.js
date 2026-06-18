(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(active + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-root]').forEach((panel) => {
    const id = panel.id;
    const list = document.querySelector(`[data-filter-list="${id}"]`);
    const textInput = panel.querySelector('[data-filter-text]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const yearInput = panel.querySelector('[data-filter-year]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('[data-movie-card]'));
    const apply = () => {
      const query = (textInput?.value || '').trim().toLowerCase();
      const type = (typeSelect?.value || '').trim();
      const year = (yearInput?.value || '').trim();

      cards.forEach((card) => {
        const haystack = [card.dataset.title, card.dataset.year, card.dataset.type, card.dataset.tags]
          .join(' ')
          .toLowerCase();
        const matchedText = !query || haystack.includes(query);
        const matchedType = !type || (card.dataset.type || '').includes(type);
        const matchedYear = !year || (card.dataset.year || '') === year;
        card.classList.toggle('is-hidden', !(matchedText && matchedType && matchedYear));
      });
    };

    [textInput, typeSelect, yearInput].filter(Boolean).forEach((input) => {
      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
    });
  });

  document.querySelectorAll('.player-card').forEach((card) => {
    const video = card.querySelector('[data-player]');
    const button = card.querySelector('[data-play-trigger]');

    if (!video) {
      return;
    }

    const source = video.getAttribute('data-src');
    let attached = false;

    const attach = () => {
      if (!source || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.src = source;
      attached = true;
    };

    const play = () => {
      attach();
      card.classList.add('is-playing');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          card.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', () => card.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        card.classList.remove('is-playing');
      }
    });
  });
})();
