(function () {
    const video = document.getElementById("movie-video");
    const cover = document.querySelector("[data-player-cover]");
    const button = document.querySelector("[data-player-button]");

    if (!video || typeof movieStreamUrl === "undefined") {
        return;
    }

    let prepared = false;
    let hlsReady = false;
    let loadingLibrary = false;
    let pendingStart = false;
    let hls = null;

    function hideCover() {
        if (cover) {
            cover.classList.add("is-hidden");
        }

        video.setAttribute("controls", "controls");
    }

    function playVideo() {
        hideCover();
        const request = video.play();

        if (request && typeof request.catch === "function") {
            request.catch(function () {});
        }
    }

    function attachWithHls() {
        if (!window.Hls || !window.Hls.isSupported()) {
            video.src = movieStreamUrl;
            prepared = true;
            playVideo();
            return;
        }

        if (!hls) {
            hls = new Hls({
                maxBufferLength: 45,
                enableWorker: true
            });

            hls.loadSource(movieStreamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                hlsReady = true;

                if (pendingStart) {
                    pendingStart = false;
                    playVideo();
                }
            });
        }

        prepared = true;

        if (hlsReady) {
            playVideo();
        } else {
            pendingStart = true;
            hideCover();
        }
    }

    function loadHlsLibrary() {
        if (loadingLibrary) {
            pendingStart = true;
            return;
        }

        loadingLibrary = true;
        pendingStart = true;

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
            loadingLibrary = false;
            attachWithHls();
        };
        script.onerror = function () {
            loadingLibrary = false;
            video.src = movieStreamUrl;
            prepared = true;
            playVideo();
        };
        document.head.appendChild(script);
    }

    function prepareAndPlay() {
        if (prepared) {
            playVideo();
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = movieStreamUrl;
            prepared = true;
            playVideo();
            return;
        }

        if (window.Hls) {
            attachWithHls();
            return;
        }

        loadHlsLibrary();
    }

    if (cover) {
        cover.addEventListener("click", prepareAndPlay);
    }

    if (button) {
        button.addEventListener("click", prepareAndPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            prepareAndPlay();
        }
    });
})();
