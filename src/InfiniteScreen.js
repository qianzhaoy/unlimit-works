class InfiniteScreen {
    constructor(options = {}) {
        this.config = Object.assign({
            inService: false,
            onProcess: () => {},
            onReady: () => {}
        }, options);
        this.turnX = 0;
        this.turnY = 0;
        this.config.container = document.getElementById(this.config.container);
        this.init();
    }

    init() {
        this.addEvent();
    }

    start() {
        this.config.inService = true;
        this.config.onStart && this.config.onStart();
    }

    stop() {
        this.config.inService = false;
        this.config.onStop && this.config.onStop();
    }

    get inService() {
        return this.config.inService;
    }

    addEvent() {
        window.addEventListener('devicemotion',  (event) => {
            let turnX = event.accelerationIncludingGravity.x.toFixed(2);
            let turnY = event.accelerationIncludingGravity.y.toFixed(2);
            if (!this.config.inService) { 
                this.turnX = turnX;
                this.turnY = turnY;
                this.config.onReady();
                return false
            };
            // 重力感应X, Y轴参数
            turnX = turnX - this.turnX;
            turnY = turnY - this.turnY;
            const direction = turnX > 0 ? 'left' : 'right';
            const reg = /translate3d\((-?.+)px,.(-?.+)px,.0px\)/;
            const { container } = this.config;
            const result = container.style.transform.match(reg);
            if (result) {
                const [style, currX, currY] = result;
                // 移动距离放大
                let skewingX = turnX * 10;
                let skewingY = turnY * 10;

                // 防抖参数
                const antiShake = 3;
                // 消除一下小抖动
                if (Math.abs(skewingX) > antiShake || Math.abs(skewingY) > antiShake) {
                    skewingX = skewingX > 0 ? skewingX - antiShake : skewingX + antiShake;
                    skewingY = skewingY > 0 ? skewingY - antiShake : skewingY + antiShake;
                    
                    const transformX = Math.abs(skewingX) > antiShake ? +currX + skewingX : +currX;
                    const transformY = Math.abs(skewingY) > antiShake ? +currY + skewingY : +currY;
                    const finalyStyle = `translate3d(${transformX}px, ${transformY}px, 0px)`
                    const transform = container.style.transform.replace(reg, finalyStyle);
                    container.style.transform = transform;
                    this.config.onProcess && this.config.onProcess.call(this, -transformX, -transformY);
                }
            }
        })
    }
}

export default InfiniteScreen;