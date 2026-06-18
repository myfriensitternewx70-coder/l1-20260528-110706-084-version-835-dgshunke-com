(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        document.querySelectorAll(".player-shell").forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var startButton = shell.querySelector(".player-start");
            var streamUrl = video ? video.getAttribute("data-stream") : "";
            var loaded = false;
            var hls = null;

            function prepare() {
                if (!video || !streamUrl || loaded) {
                    return;
                }
                loaded = true;
                video.controls = true;
                video.setAttribute("controls", "controls");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                prepare();
                shell.classList.add("is-playing");
                var started = video.play();
                if (started && typeof started.catch === "function") {
                    started.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            if (cover) {
                cover.addEventListener("click", play);
            }
            if (startButton) {
                startButton.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("ended", function () {
                    shell.classList.remove("is-playing");
                });
            }
        });
    });
})();
