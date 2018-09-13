import regeneratorRuntime from "babel-regenerator-runtime";
import InfiniteScreen from './InfiniteScreen';
import CreateScreen from './CreateScreen';
const screenWidth = document.body.clientWidth;
const screenHeight = document.body.clientHeight;
window.addEventListener('load', () => {
    const defaultScreenShow = 1;
    const canvas = document.getElementById('canvas');
    const screen = new CreateScreen(canvas);
    let distanceY = 1;
    screen.show(defaultScreenShow);

    const infinite = new InfiniteScreen({
        container: 'canvas',
        onProcess(x, y) {
            screen.setCenterPoint(x + (screenWidth / 2) - 20, y + screenHeight / 2 - 20);
        },
        onStart() {
            screen.animate();
        },
        onStop() {
            screen.show(defaultScreenShow);
            screen.stopAnimate();
        },
        onReady() {
            // infinite.start();
        }
    })
    document.getElementById('start').addEventListener('touchstart', btnTouchdown);
    document.getElementById('start').addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
    // document.body.addEventListener('touchmove', btnTouchmove);
    document.body.addEventListener('touchend', btnTouchend);
    document.body.addEventListener('touchstart', (event) => {
        event.preventDefault();
    });

    let touchPageY;
    let timer;
    let i = 0.01;
    const minScale = 0.2;
    const { width: screenWidth, height: screenHeight } = window.screen;
    function btnTouchdown(event) {
        event.stopPropagation();
        clearTimeout(timer);
        canvas.style.transition = '';
        infinite.start();
        // canvas.style.transform += ' scale(.9)'
        const { pageY } = event.touches[0];
        touchPageY = pageY;
    }

    function btnTouchmove(event) {
        if (!infinite.inService) return false;
        const { pageY } = event.touches[0];
        // 缩放比例
        distanceY = (screenHeight - (touchPageY - pageY)) / screenHeight;
        distanceY = Number(distanceY.toFixed(3)) * 0.9;

        if (distanceY > minScale) {
            if (canvas.style.transform.indexOf('scale') > -1) {
                canvas.style.transform = canvas.style.transform.replace(/scale\(.+\)/, `scale(${distanceY})`)
            } else {
                canvas.style.transform += ` scale(${distanceY/screenHeight})`
            }
            // i = i > 0.4 ? i : i + 0.01;
            i += 0.01;
        }
    }

    function btnTouchend(event) {
        infinite.stop();
        i = 0.01;
        canvas.style.transition = 'all .5s';
        canvas.style.transform = canvas.style.transform.replace(/scale\(.+\)/, 'scale(1)');

        timer = setTimeout(() => {
            canvas.style.transition = '';
        }, 500)
    }
})
