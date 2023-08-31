"use strict";
(async() => {
    function Colorpicker(options) {
        this.init(options);
    }
    Colorpicker.prototype = {
        init: function(options) {
            function Color() {
                this.h = 0;
                this.s = 0;
                this.l = 0;
            }
            this.options = options;
            Color.prototype.setHSL = function(h, s, l) {
                this.h = h;
                this.s = s;
                this.l = l;
            }
            let body = document.getElementsByTagName("body")[0];
            let root = document.createElement("div");
            $(body).append(root);
            this.rootjq = $(root);
            this.hide();
            this.rootjq.css({ display: "none", "justify-content": "center", "align-items": "center", marigin: "0 auto", "text-align": "center", position: "absolute", left: "0", top: "0", right: "0", bottom: "0", "pointer-events": "none", });
            // this.show();
            this.rootjq.html(this.render());
            this.ColorData = new Color();
            this.canvasDom = root.getElementsByClassName("color-panel")[0];
            this.canvas = $(this.canvasDom);
            this.ctx = this.canvasDom.getContext("2d");
            this.pointer = $(root.getElementsByClassName("color-pointer")[0]);
            let size = 512; //canvas大小
            this.realSize = 225; //屏幕真实尺寸
            this.border = 13; //白色边框宽
            this.realBorder = this.border / size * this.realSize; //边框宽对应的实际屏幕尺寸
            this.canvasCenter = { x: size / 2, y: size / 2 }; //canvas中心点
            this.realCenter = { x: this.realSize / 2, y: this.realSize / 2 }; //真实尺寸中心点
            this.mouseAngle = 0;
            this.mousePos = { x: 0, y: 0 };
            this.pointerRadius = 9; //聚焦点半径
            this.mouseDist = 50;
            this.clientRect = 0;
            this.angle = 0;
            this.panelMask = $(root.getElementsByClassName("color-mask")[0]);
            this.sliderPointerRadius = 9
            this.sliderDom = root.getElementsByClassName("light-slider-wrapper")[0];
            this.slider = $(this.sliderDom);
            this.sliderPointer = $(root.getElementsByClassName("slider-pointer")[0]);
            this.wrapper = $(root.getElementsByClassName("wrapper")[0]);
            this.showBg = this.options.showBg || false;
            this.mainBgDom = root.getElementsByClassName("color-picker-bg")[0];
            this.mainBg = $(this.mainBgDom);
            if (this.showBg) {
                this.mainBg.css({ display: "block" });
                this.wrapper.css({ "margin-top": "-200px" });
                // this.bindEvent(this.mainBgDom, this.hide);
            } else {
                this.mainBg.css({ display: "none" });
                this.wrapper.css({ "margin-top": "-100px" });
            }
            this.sliderWrapperBorder = 6;
            this.sliderWrapperSize = 235;
            this.sliderRect = 0;
            this.lightPercent = 0;
            this.createPanel();
            this.setPointerByHSL(0, 0, 0);
            this.bindEvent(this.canvasDom, this.setPanel);
            this.bindEvent(this.sliderDom, this.setSlider);
            this.panelMask.css("background-color", this.modifyAlpha(this.panelMask.css("background-color"), 1 - this.lightPercent * 2));
            let initBorderColor = this.lightPercent * 255;
            this.slider.css("border-color", "rgba(" + initBorderColor + "," + initBorderColor + "," + initBorderColor + "," + 1 + ")");
            if (this.options.confirm) {
                this.bindEvent($("#color-picker-ok")[0], this.confirm);
            }
            if (this.options.cancel) {
                this.bindEvent($("#color-picker-cancel")[0], this.cancel);
            }
        },
        confirm: function() {
            this.options.confirm(this.hsl2rgb(this.ColorData.h, this.ColorData.s, this.ColorData.l));
        },
        cancel: function() {
            this.options.cancel();
        },
        bindEvent: function(elem, func) {
            let _this = this;
            if (this.options && this.options.isMobile) {
                $(elem).css("touch-action", "auto");
                elem.addEventListener("touchstart", e => {
                    func.call(_this, elem, e.touches[0].clientX, e.touches[0].clientY);
                    document.addEventListener("touchmove", mousemove, { passive: false });
                    document.addEventListener("touchend", mouseup, { passive: false });

                    function mouseup() {
                        document.removeEventListener("touchmove", mousemove, { passive: false });
                        document.removeEventListener("touchend", mouseup, { passive: false });
                    }

                    function mousemove(e) {
                        func.call(_this, elem, e.touches[0].clientX, e.touches[0].clientY);
                        e.preventDefault();
                    }
                });
            } else {
                elem.addEventListener("mousedown", e => {
                    func.call(_this, elem, e.clientX, e.clientY);
                    document.addEventListener("mousemove", mousemove, false);
                    document.addEventListener("mouseup", mouseup, false);

                    function mouseup() {
                        document.removeEventListener("mousemove", mousemove, false);
                        document.removeEventListener("mouseup", mouseup, false);
                    }

                    function mousemove(e) {
                        func.call(_this, elem, e.clientX, e.clientY);
                        e.preventDefault();
                    }
                });
            }
        },
        setSlider: function(elem, clientX) {
            let sliderRect = elem.getBoundingClientRect();
            this.lightPercent = 0;
            if (clientX - sliderRect.left < this.sliderWrapperBorder + this.sliderPointerRadius) {
                this.sliderPointer.css("left", "0px");
                this.lightPercent = 0;
            } else if (clientX - sliderRect.left >= this.sliderWrapperSize - this.sliderPointerRadius + this.sliderWrapperBorder) {
                this.sliderPointer.css("left", (this.sliderWrapperSize - this.sliderPointerRadius * 2) + "px");
                this.lightPercent = 1;
            } else {
                this.sliderPointer.css("left", (clientX - sliderRect.left - this.sliderWrapperBorder - this.sliderPointerRadius) + "px");
                this.lightPercent = (clientX - sliderRect.left - this.sliderPointerRadius - this.sliderWrapperBorder) / (this.sliderWrapperSize - this.sliderPointerRadius - this.sliderWrapperBorder * 2);
            }
            //调整light值
            this.ColorData.setHSL(this.ColorData.h, this.ColorData.s, parseInt(this.lightPercent * 100));
            let color = "hsl(" + this.ColorData.h + "," + this.ColorData.s + "%, " + this.ColorData.l + "%)";
            this.slider.css("border-color", color);
            this.canvas.css("background-color", color);
            this.panelMask.css("background-color", this.modifyAlpha(this.panelMask.css("background-color"), 1 - this.lightPercent * 2));
            if (this.options && this.options.onchange) {
                this.options.onchange(this.hsl2rgb(this.ColorData.h, this.ColorData.s, this.ColorData.l));
            }
        },
        setPanel: function(elem, clientX, clientY) {
            let clientRect = elem.getBoundingClientRect();
            let width = elem.width;
            let height = elem.height;
            let offsetWidth = elem.offsetWidth;
            let offsetHeight = elem.offsetHeight;
            let mousePosX = (clientX - clientRect.left) * (width / offsetWidth);
            let mousePosY = (clientY - clientRect.top) * (height / offsetHeight);
            this.angle = 180 + (Math.atan2(this.canvasCenter.y - mousePosY, this.canvasCenter.x - mousePosX)) * 180 / Math.PI;
            this.mouseDist = Math.round((Math.min(this.canvasCenter.y, Math.sqrt(Math.pow(this.canvasCenter.x - mousePosX, 2) + Math.pow(this.canvasCenter.y - mousePosY, 2))) / this.canvasCenter.y) * 100);
            this.mouseAngle = Math.round(this.angle % 360);
            let inCircle = Math.pow(clientX - clientRect.left - this.realSize / 2, 2) + Math.pow(clientY - clientRect.top - this.realSize / 2, 2) <= Math.pow(this.realSize / 2 - this.pointerRadius - this.realBorder, 2)
            this.pointer.css({
                top: (inCircle ? (clientY - clientRect.top - this.pointerRadius) : (this.realCenter.y + (this.realCenter.x - this.pointerRadius - this.realBorder) * Math.sin(this.mouseAngle / 180 * Math.PI) - this.pointerRadius)) + "px",
                left: (inCircle ? (clientX - clientRect.left - this.pointerRadius) : (this.realCenter.x + (this.realCenter.x - this.pointerRadius - this.realBorder) * Math.cos(this.mouseAngle / 180 * Math.PI) - this.pointerRadius)) + "px",
            });
            this.ColorData.setHSL(this.mouseAngle, this.mouseDist, (parseInt(this.lightPercent * 100)));
            let color = "hsl(" + this.ColorData.h + "," + this.ColorData.s + "%, " + this.ColorData.l + "%)";
            this.slider.css("border-color", color);
            this.canvas.css("background-color", color);
            if (this.options && this.options.onchange) {
                this.options.onchange(this.hsl2rgb(this.ColorData.h, this.ColorData.s, this.ColorData.l));
            }
        },
        render: function() {
            return `<div class ="color-picker-bg"></div>
                <div class="wrapper">
                    <canvas width="512" height="512" class="color-panel"></canvas>
                    <div class="color-mask">
                        <div class="pointer-wrapper">
                            <div class="color-pointer">
                                <div class="color-pointer-inner"></div>
                            </div>
                        </div>
                    </div>
                    <div class="light-slider-wrapper">
                        <div class="slider-pointer">
                            <div class="slider-pointer-inner"></div>
                        </div>
                    </div>
                </div>
                <div class="color-picker-opbt">
                    <span class="color-picker-bt" id="color-picker-cancel">CANCEL</span>
                    <span class="color-picker-bt" id="color-picker-ok">OK</span>
                </div>`;
        },
        setPointerByRGB(r, g, b) {
            let hsl = this.rgb2hsl(r, g, b);
            this.setPointerByHSL(hsl.h, hsl.s, hsl.l);
        },
        // 外部传入hsl色值进行pointer的位置设置
        setPointerByHSL: function(h, s, l) {
            h = Utils.clamp(h, 360);
            s = Utils.clamp(s, 100);
            l = Utils.clamp(l, 100);
            let x = this.realCenter.x + Math.cos(h / 180 * Math.PI) * (this.realCenter.x - this.pointerRadius - this.realBorder) * (s / 100) - this.pointerRadius;
            let y = this.realCenter.y + Math.sin(h / 180 * Math.PI) * (this.realCenter.y - this.pointerRadius - this.realBorder) * s / 100 - this.pointerRadius;
            this.ColorData.setHSL(h, s, l);
            this.pointer.css({ left: x + "px", top: y + "px", });
            this.sliderPointer.css("left", (l / 100 * (this.sliderWrapperSize - this.sliderPointerRadius * 2)) + "px");
            let color = "hsl(" + this.ColorData.h + "," + this.ColorData.s + "%, " + this.ColorData.l + "%)";
            this.slider.css("border-color", color);
            this.lightPercent = l / 100;
            this.panelMask.css("background-color", this.modifyAlpha(this.panelMask.css("background-color"), 1 - this.lightPercent * 2));
            // console.log(1 - this.lightPercent * 2);
            this.canvas.css("background-color", color);
        },
        modifyAlpha: function(rgba, alpha) {
            return "rgba(" + rgba.match(/rgba?\((\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*)((?:,\s*[0-9.]*\s*)?)\)/)[1] + "," + alpha + ")";
        },
        //创建色板
        createPanel: function() {
            this.ctx.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
            this.ctx.lineWidth = 5;
            let gradient, endX, endY;
            for (let i = 0; i < 360; i++) {
                endX = this.canvasCenter.x + (this.canvasCenter.x - this.border) * Math.cos((i / 180) * Math.PI);
                endY = this.canvasCenter.y + (this.canvasCenter.y - this.border) * Math.sin((i / 180) * Math.PI);
                gradient = this.ctx.createLinearGradient(this.canvasCenter.x, this.canvasCenter.y, endX, endY);
                gradient.addColorStop(0, "white");
                this.ctx.beginPath();
                gradient.addColorStop(1, "hsl(" + i + "," + 100 + "%, " + 50 + "%)");
                this.ctx.strokeStyle = gradient;
                this.ctx.moveTo(this.canvasCenter.x, this.canvasCenter.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        },
        show: function() {
            this.rootjq.css({ display: "flex", opacity: "0" });
            this.rootjq.animate({ opacity: 1 }, 200);
        },
        hide: function() {
            this.rootjq.animate({ opacity: 0 }, 200, () => {
                this.rootjq.css({ display: "none" });
            });
        },
        getRoot: function() {
            return this.rootjq;
        },
        rgb2hsl: function(r, g, b) {
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max == min) {
                h = s = 0; // achromatic
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        },
        hsl2rgb: function(h, s, l) {
            h = h / 360;
            s = s / 100;
            l = l / 100;
            let rgb = [];
            if (s == 0) {
                rgb = [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
            } else {
                let q = l >= 0.5 ? (l + s - l * s) : (l * (1 + s));
                let p = 2 * l - q;
                rgb[0] = h + 1 / 3;
                rgb[1] = h;
                rgb[2] = h - 1 / 3;
                for (let i = 0; i < rgb.length; i++) {
                    let tc = rgb[i];
                    if (tc < 0) {
                        tc = tc + 1;
                    } else if (tc > 1) {
                        tc = tc - 1;
                    }
                    switch (true) {
                        case (tc < (1 / 6)):
                            tc = p + (q - p) * 6 * tc;
                            break;
                        case ((1 / 6) <= tc && tc < 0.5):
                            tc = q;
                            break;
                        case (0.5 <= tc && tc < (2 / 3)):
                            tc = p + (q - p) * (4 - 6 * tc);
                            break;
                        default:
                            tc = p;
                            break;
                    }
                    rgb[i] = Math.round(tc * 255);
                }
            }
            return { r: rgb[0], g: rgb[1], b: rgb[2], };
        },
    }
    Colorpicker.create = function(options) {
        return new Colorpicker(options);
    }
    window.Colorpicker = Colorpicker;
})();