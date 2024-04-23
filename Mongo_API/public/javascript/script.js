let valueDisplays = document.querySelectorAll(".num");
let interval = 500;

valueDisplays.forEach((valueDisplay) => {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    let currencySymbol = valueDisplay.getAttribute("data-currency");
    let counter = setInterval(function () {
        startValue += 2;
        valueDisplay.textContent = currencySymbol + startValue;
        if (startValue == endValue) {
            clearInterval(counter);
        }
    }, duration);
});

