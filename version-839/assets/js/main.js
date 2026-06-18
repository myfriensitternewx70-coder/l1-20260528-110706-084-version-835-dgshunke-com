(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (input && input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
                }
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-control.prev");
        var next = document.querySelector(".hero-control.next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function startHero() {
            if (!slides.length) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (slides.length) {
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-slide") || 0));
                    startHero();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    startHero();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    startHero();
                });
            }
            startHero();
        }

        var filterPage = document.querySelector("[data-filter-page]");
        if (filterPage) {
            var input = document.getElementById("search-input");
            var category = document.getElementById("category-filter");
            var year = document.getElementById("year-filter");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
            var resultTitle = document.getElementById("result-title");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";

            if (input && initial) {
                input.value = initial;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilters() {
                var q = normalize(input ? input.value : "");
                var cat = category ? category.value : "";
                var y = year ? year.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var fields = normalize(card.getAttribute("data-fields"));
                    var okText = !q || fields.indexOf(q) !== -1;
                    var okCategory = !cat || card.getAttribute("data-category") === cat;
                    var okYear = !y || card.getAttribute("data-year") === y;
                    var visible = okText && okCategory && okYear;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });

                if (resultTitle) {
                    resultTitle.textContent = q || cat || y ? "匹配结果" : "精选片单";
                }
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }
    });
})();
