function gotoPage(url) {
    window.location.href = url;
}

function scrollToElement(targetId) {
    var targetElement = document.getElementById(targetId);
    targetElement.scrollIntoView({ behavior: 'smooth' });
}

function scrollToElement(targetId, duration) {
    var targetElement = document.getElementById(targetId);
    var startPosition = window.pageYOffset;
    var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    var distance = targetPosition - startPosition;
    var startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        var timeElapsed = currentTime - startTime;
        var run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}