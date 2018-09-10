import config from './config';

Array.matrix = function(row, col, callback) {
    const matirx = [];
    let count = 0;
    for (let i = 0; i < row; i++) {
        const rowArr = [];
        for (let j = 0; j < col; j++) {
            rowArr.push(callback(i, j, count));
            count += 1;
        }
        matirx.push(rowArr);
    }
    return matirx;
}

const defaultIconSize = 70;
const icon = require('./images/wx.png');
const bgImage = require('./images/infinite.jpg')

class CreateScreen {
    constructor(canvasDom, options = {}) {
        const screenWidth = document.body.clientWidth;
        const screenHeight = document.body.clientHeight;
        this.bgImage = bgImage;
        this.canvas = canvasDom;
        this.ctx = canvasDom.getContext('2d');
        this.cancelAnimate = null;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        const { HORI_SCREEN_NUMB: col, VERT_SCREEN_NUM: row } = config;
        this.screenMatrix = Array.matrix(row, col, (i, j, count) => ({
            n: count,
            originX: j * screenWidth,
            originY: i * screenHeight,
            app: []
        }));
        this.centerX = -1;
        this.centerY = -1;
        this.config = Object.assign({}, config, options);
        for (let i = 0; i < (col * row); i++) {
            this.setAppInScreen(i);
        }
        this.init();
    }

    init() {
        this.setCanvasSize();
        this.drawScreen();
    }

    show(num) {
        const { originX, originY } = this.findScreen(num);
        const { screenHeight, screenWidth } = this;
        const centerX = originX + screenWidth / 2;
        const centerY = originY + screenHeight / 2;
        this.canvas.style.transform = `translate3d(-${originX}px, -${originY}px, 0) scale(1)`;
        this.canvas.style.transformOrigin = `${centerX}px ${centerY}px`;
    }

    setCanvasSize() {
        const { screenWidth, screenHeight, config } = this;
        const { HORI_SCREEN_NUMB, VERT_SCREEN_NUM } = config;
        this.canvas.width = screenWidth * HORI_SCREEN_NUMB;
        this.canvas.height = screenHeight * VERT_SCREEN_NUM;
    }

    drawScreen() {
        this.drawBg().then(() => {
            const {HORI_SCREEN_NUMB: x, VERT_SCREEN_NUM: y} = this.config;
            const screenCount = x * y;
            Array(screenCount).fill(null).forEach((_, i) => {
                this.drawAppIcon(i);
            })
        });
    }

    drawBg() {
        const { ctx, canvas, screenWidth, screenHeight } = this;
        console.log(this.screenMatrix);
        return Promise.resolve();
        // return this.drawImg(this.bgImage, screenWidth * 2, screenHeight, screenWidth, screenHeight)
        //     .then(img => {
        //         if (img) {
        //             this.bgImage = img;
        //         }
        //     })
    }

    drawImg(img, x, y, w, h) {
        return new Promise((resolve, reject) => {
            if (typeof img == 'object' && img.nodeType == 1) {
                this.ctx.drawImage(img, x, y, w, h);
                resolve();
                return false;
            }
            let image = new Image();
            image.src = img;
            image.onload = () => {
                image.width = w;
                image.height = h;
                this.ctx.drawImage(image, x, y, w, h);
                resolve(image);
            }
        })
    }

    getScreenColRow(num) {
        const obj = {
            col: 0,
            row: 0
        }
        this.screenMatrix.forEach((el, row) => {
            el.forEach((screen, col) => {
                if (screen.n == num) {
                    obj.col = col;
                    obj.row = row;
                }
            })
        });
        return obj;
    }

    getAppData() {
        const { APP_ICON_ROW: row, APP_ICON_COL: col } = this.config;
        const appData = Array.matrix(row, col, (x, y) => ({
            name: '微信',
            icon: icon,
            iconSize: defaultIconSize
        }))
        return appData;
    }

    findScreen(num) {
        let obj = null;
        this.screenMatrix.forEach((el, row) => {
            el.forEach((screen, col) => {
                if (screen.n == num) {
                    obj = screen;
                }
            })
        });
        return obj;
    }

    setAppInScreen(i) {
        const screen = this.findScreen(i);
        screen.app = this.getAppData();
    }

    setCenterPoint(x, y) {
        this.centerX = x;
        this.centerY = y;
    }

    findScreenForPorint(x, y) {
        let num = 0;
        this.screenMatrix.forEach((el, row) => {
            el.forEach(({ originX, originY, n }) => {
                if (x > originX && x < (originX + this.screenWidth)
                    && y > originY && y < (originY + this.screenHeight)
                ) {
                    num = n;
                }
            })
        });
        return num;
    }

    animate() {
        this.cancelAnimate = window.requestAnimationFrame(() => {
            const num = this.findScreenForPorint(this.centerX, this.centerY);
            // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawAppIcon(num, this.centerX, this.centerY);
            this.animate();
        });
    }

    stopAnimate() {
        window.cancelAnimationFrame(this.cancelAnimate);
    }

    drawAppIcon(num = 0, foucuX = -1, foucuY = -1) {
        const { width, height } = this.canvas;
        const { APP_ICON_ROW, APP_ICON_COL } = this.config;
        const { screenWidth, screenHeight } = this;
        const {
            app,
            originX,
            originY
        } = this.findScreen(num);
        const padBottom = 100;
        const paddLR = 20;
        const eachWidth = (screenWidth - paddLR * 2) / APP_ICON_COL;
        const eachHeight = (screenHeight - padBottom) / APP_ICON_ROW;
        const halfWidth = eachWidth / 2 - defaultIconSize / 2;
        const halfHeight = eachHeight / 2 - defaultIconSize / 2;
        app.forEach((rows, i) => {
            rows.forEach((data, k) => {
                const x = originX + paddLR + eachWidth * k + halfWidth;
                const y = originY + eachHeight * i + halfHeight;
                const limitX = originX + eachWidth * (k + 1);
                const limitY = originY + eachHeight * (i + 1);
                const inX = foucuX > x && foucuX < limitX;
                const inY = foucuY > y && foucuY < limitY;
                data.focus = inX && inY;
                if (data.focus && data.iconSize < 100) {
                    // 进入
                    this.ctx.clearRect(x, y, eachWidth, eachWidth);
                    data.iconSize += 1;
                } else if(!data.focus && data.iconSize > 70) {
                    // 移出
                    this.ctx.clearRect(x, y, eachWidth, eachWidth);
                    data.iconSize = 70;
                } else if (data.icon instanceof Image) {
                    return;
                }
                data && this.drawImg(data.icon, x, y, data.iconSize, data.iconSize).then(img => {
                    if (img) {
                        data.icon = img;
                    }
                });
            })
        })
    }
}

export default CreateScreen;
