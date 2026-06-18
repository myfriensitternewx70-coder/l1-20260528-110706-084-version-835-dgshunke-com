(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
            document.body.classList.toggle('no-scroll', !expanded);
        });
    }

    function setupHero() {
        var slides = selectAll('.hero-slide');
        var dots = selectAll('.hero-dot');
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var filterBars = selectAll('[data-filter-bar]');
        filterBars.forEach(function (bar) {
            var scopeSelector = bar.getAttribute('data-filter-bar');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = selectAll('[data-card]', scope);
            var empty = document.querySelector('[data-empty-state]');
            bar.addEventListener('click', function (event) {
                var button = event.target.closest('[data-filter-value]');
                if (!button) {
                    return;
                }
                var value = button.getAttribute('data-filter-value');
                selectAll('[data-filter-value]', bar).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ');
                    var matched = value === 'all' || haystack.indexOf(value) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            });
        });
    }

    function setupQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim().toLowerCase();
        if (!q) {
            return;
        }
        selectAll('input[name="q"]').forEach(function (input) {
            input.value = q;
        });
        var cards = selectAll('[data-card]');
        if (!cards.length) {
            return;
        }
        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matched = text.indexOf(q) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        var empty = document.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    function setupImages() {
        selectAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                var frame = image.closest('.poster-frame, .hero-poster-card, .detail-poster, .side-related a, .rank-row');
                if (frame) {
                    frame.classList.add('image-missing');
                }
            }, { once: true });
        });
    }

    function attachVideo(video, source, status) {
        if (!video || !source) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && status) {
                    status.textContent = '视频暂时无法加载，请稍后再试';
                }
            });
            video._hls = hls;
            return;
        }
        video.src = source;
    }

    function setupPlayer() {
        var box = document.querySelector('[data-player]');
        if (!box) {
            return;
        }
        var video = box.querySelector('video');
        var source = box.getAttribute('data-video-src');
        var button = box.querySelector('.play-button');
        var status = document.querySelector('[data-player-status]');
        attachVideo(video, source, status);
        function begin() {
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    box.classList.add('is-playing');
                    if (status) {
                        status.textContent = '正在播放';
                    }
                }).catch(function () {
                    if (status) {
                        status.textContent = '点击视频控件开始播放';
                    }
                });
            } else {
                box.classList.add('is-playing');
            }
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                begin();
            });
        }
        if (video) {
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
                if (status) {
                    status.textContent = '正在播放';
                }
            });
            video.addEventListener('pause', function () {
                box.classList.remove('is-playing');
                if (status) {
                    status.textContent = '已暂停';
                }
            });
            video.addEventListener('loadedmetadata', function () {
                if (status && status.textContent !== '正在播放') {
                    status.textContent = '准备就绪';
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupQuerySearch();
        setupImages();
        setupPlayer();
    });
}());
