(function () {
    if (window.__catchpointUtagLoaded) return;
    window.__catchpointUtagLoaded = true;

    var CATCHPOINT_SCRIPT_URL = "https://qaportal.catchpoint.com/jp/237218/latest/InitialLoadScript.js";

    function enablePageHide() {
        if (window.RProfiler && typeof window.RProfiler.usePageHide === "function") {
            window.RProfiler.usePageHide();
        }
    }

    window.addEventListener("GlimpseLoaded", enablePageHide, { once: true });

    var catchpointScript = document.createElement("script");
    catchpointScript.src = CATCHPOINT_SCRIPT_URL;
    catchpointScript.defer = true;
    catchpointScript.type = "text/javascript";
    catchpointScript.onload = enablePageHide;

    var firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(catchpointScript, firstScript);
    } else {
        (document.head || document.documentElement).appendChild(catchpointScript);
    }
})();
