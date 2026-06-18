(function () {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const next = hero.querySelector("[data-hero-next]");
        const prev = hero.querySelector("[data-hero-prev]");
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        const input = scope.querySelector("[data-filter-input]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));
        const empty = scope.querySelector("[data-empty-state]");
        const result = scope.querySelector("[data-result-count]");
        const chips = Array.from(scope.querySelectorAll("[data-genre-filter]"));
        let active = "all";

        function update() {
            const keyword = normalize(input ? input.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const searchable = normalize(card.getAttribute("data-search"));
                const genre = normalize(card.getAttribute("data-genre"));
                const region = normalize(card.getAttribute("data-region"));
                const activeTerm = normalize(active);
                const keywordMatched = !keyword || searchable.indexOf(keyword) !== -1;
                const chipMatched = active === "all" || genre.indexOf(activeTerm) !== -1 || region.indexOf(activeTerm) !== -1 || searchable.indexOf(activeTerm) !== -1;
                const matched = keywordMatched && chipMatched;

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }

            if (result) {
                result.textContent = visible ? "已显示匹配影片" : "未找到匹配影片";
            }
        }

        if (input) {
            input.addEventListener("input", update);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.getAttribute("data-genre-filter") || "all";

                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });

                update();
            });
        });
    });
})();
