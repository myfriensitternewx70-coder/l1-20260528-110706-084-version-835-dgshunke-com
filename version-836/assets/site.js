(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const backTop = document.querySelector('.back-top');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  let activeSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeSlide - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeSlide + 1);
        restartHero();
      });
    }

    restartHero();
  }

  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const searchInput = document.getElementById('movieSearch');
  const typeFilter = document.getElementById('typeFilter');
  const regionFilter = document.getElementById('regionFilter');
  const yearFilter = document.getElementById('yearFilter');
  const emptyState = document.getElementById('emptyState');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const query = normalize(searchInput ? searchInput.value : '');
    const typeValue = normalize(typeFilter ? typeFilter.value : '');
    const regionValue = normalize(regionFilter ? regionFilter.value : '');
    const yearValue = normalize(yearFilter ? yearFilter.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      const matchQuery = !query || haystack.indexOf(query) !== -1;
      const matchType = !typeValue || normalize(card.dataset.type) === typeValue;
      const matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
      const matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
      const matched = matchQuery && matchType && matchRegion && matchYear;

      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener('input', applyFilters);
  }

  [typeFilter, regionFilter, yearFilter].forEach(function (select) {
    if (select) {
      select.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
