document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.from(hero.querySelectorAll(".hero-slide"));
    var dots = Array.from(hero.querySelectorAll("[data-hero-dots] button"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function runFilter(targetSelector) {
    var grid = document.querySelector(targetSelector);

    if (!grid) {
      return;
    }

    var search = document.querySelector('[data-card-search][data-target="' + targetSelector + '"]');
    var year = document.querySelector('[data-year-filter][data-target="' + targetSelector + '"]');
    var query = normalize(search ? search.value : "");
    var selectedYear = year ? year.value : "";
    var cards = Array.from(grid.querySelectorAll(".movie-card"));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year
      ].join(" "));
      var yearMatched = !selectedYear || card.dataset.year === selectedYear;
      var queryMatched = !query || haystack.indexOf(query) !== -1;
      card.style.display = yearMatched && queryMatched ? "" : "none";
    });
  }

  Array.from(document.querySelectorAll("[data-card-search], [data-year-filter]")).forEach(function (control) {
    var target = control.getAttribute("data-target");

    control.addEventListener("input", function () {
      runFilter(target);
    });

    control.addEventListener("change", function () {
      runFilter(target);
    });
  });

  var urlParams = new URLSearchParams(window.location.search);
  var initialQuery = urlParams.get("q");

  if (initialQuery) {
    Array.from(document.querySelectorAll("[data-card-search]")).forEach(function (input) {
      input.value = initialQuery;
      runFilter(input.getAttribute("data-target"));
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var stream = shell.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    shell.classList.add("is-playing");

    if (shell.getAttribute("data-ready") === "1") {
      video.play().catch(function () {});
      return;
    }

    shell.setAttribute("data-ready", "1");

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = stream;
      video.play().catch(function () {});
    }
  }

  Array.from(document.querySelectorAll(".js-player")).forEach(function (shell) {
    var overlay = shell.querySelector(".play-overlay");
    var video = shell.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (shell.getAttribute("data-ready") !== "1") {
          startPlayer(shell);
        }
      });
    }
  });
});
