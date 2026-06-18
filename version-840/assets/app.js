(function () {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-mobile-panel] a').forEach(function (link) {
        link.addEventListener('click', function () {
            body.classList.remove('menu-open');
        });
    });

    document.querySelectorAll('[data-cover-image]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('cover-image-empty');
        }, { once: true });
    });

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            startTimer();
        }
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var scope = root.parentElement || document;
        var searchInput = root.querySelector('[data-filter-search]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var categorySelect = root.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var emptyState = scope.querySelector('[data-empty-state]');

        function matchesText(card, query) {
            if (!query) {
                return true;
            }
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-keywords') || ''
            ].join(' ').toLowerCase();
            return haystack.indexOf(query) !== -1;
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var ok = matchesText(card, query);
                ok = ok && (!year || card.getAttribute('data-year') === year);
                ok = ok && (!type || card.getAttribute('data-type') === type);
                ok = ok && (!category || card.getAttribute('data-category') === category);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('[data-player-start]');

        if (!video || !trigger) {
            return;
        }

        var hlsUrl = video.getAttribute('data-hls') || '';
        var prepared = false;

        function prepareVideo() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(hlsUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = hlsUrl;
        }

        function startPlayback() {
            prepareVideo();
            player.classList.add('is-playing');
            video.controls = true;
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        trigger.addEventListener('click', startPlayback);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove('is-playing');
            }
        });
    });
})();
