import { css } from "./utils";

function noop() { }

export function sliderChart(root, DPI_WIDTH) {
    const WIDTH = DPI_WIDTH / 2;
    const MIN_WIDTH = WIDTH * 0.05;

    let nextFn = noop;

    const $left = root.querySelector("[data-el='left']");
    const $window = root.querySelector("[data-el='window']");
    const $right = root.querySelector("[data-el='right']");

    function next() {
        nextFn(getPosition());
    }

    function mousedown(event) {
        const type = event.target.dataset.type;
        const dimensions = {
            left: parseInt($window.style.left),
            right: parseInt($window.style.right),
            width: parseInt($window.style.width),
        };

        if (type === "window") {
            const startX = event.pageX;
            document.onmousemove = e => {
                const delta = startX - e.pageX;
                if (delta === 0) {
                    return;
                }

                const left = dimensions.left - delta;
                const right = WIDTH - left - dimensions.width;

                setPosition(left, right);
                next();
            };
        } else if (type === "left" || type === "right") {
            const startX = event.pageX;
            document.onmousemove = e => {
                const delta = startX - e.pageX;
                if (delta === 0) {
                    return;
                }

                if (type === "left") {
                    const left =
                        WIDTH - dimensions.width - delta - dimensions.right;
                    const right = WIDTH - dimensions.width - delta - left;

                    setPosition(left, right);
                } else if (type === "right") {
                    const left = WIDTH - dimensions.width - dimensions.right;
                    const right =
                        WIDTH - dimensions.width + delta - dimensions.left;

                    setPosition(left, right);
                }

                next();
            };
        }
    }

    document.onmouseup = function () {
        document.onmousemove = null;
    };

    root.addEventListener("mousedown", mousedown);

    const defaultWidth = WIDTH * 0.3;
    setPosition(0, WIDTH - defaultWidth);

    function setPosition(left, right) {
        const w = WIDTH - right - left;

        if (w < MIN_WIDTH) {
            css($window, { width: MIN_WIDTH + "px" });
            return;
        }

        if (left < 0) {
            css($window, { left: "0px" });
            css($left, { width: "0px" });
            return;
        }

        if (right < 0) {
            css($window, { right: "0px" });
            css($right, { width: "0px" });
            return;
        }

        css($window, {
            width: w + "px",
            left: left + "px",
            right: right + "px",
        });

        css($right, { width: right + "px" });
        css($left, { width: left + "px" });
    }

    function getPosition() {
        const left = parseInt($left.style.width);
        const right = WIDTH - parseInt($right.style.width);

        return [(left / WIDTH) * 100, (right / WIDTH) * 100];
    }

    return {
        subscribe(fn) {
            nextFn = fn;
            fn(getPosition());
        },
    };
}
