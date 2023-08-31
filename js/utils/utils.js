"use strict";
(async function() {
    function Utils() {

    }
    Utils.prototype = {
        lastThemeIndex: [-1, -1, -1, -1],
        hsvDisSquare: function(h1, h2) {
            let x1 = r * h1.v * h1.s * Math.cos(h1.h / 180 * Math.PI);
            let y1 = r * h1.v * h1.s * Math.sin(h1.h / 180 * Math.PI);
            let z1 = h * (1 - h1.v);
            let x2 = r * h2.v * h2.s * Math.cos(h2.h / 180 * Math.PI);
            let y2 = r * h2.v * h2.s * Math.sin(h2.h / 180 * Math.PI);
            let z2 = h * (1 - h2.v);
            return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2);
        },
        labDisSquare: function(r1, g1, b1, r2, g2, b2) {
            let l = 2126007 * (r1 - r2) + 7151947 * (g1 - g2) + 722046 * (b1 - b2);
            let a = 3258962 * (r1 - r2) - 4992596 * (g1 - g2) + 1733409 * (b1 - b2);
            let b = 1218128 * (r1 - r2) + 3785610 * (g1 - g2) - 5003738 * (b1 - b2);
            return (l * l + a * a + b * b) / (255 * 255) / Math.pow(10, 14);
        },
        rgbDisSquare: function(c1, c2) {
            return (c1.r - c2.r) * (c1.r - c2.r) + (c1.g - c2.g) * (c1.g - c2.g) + (c1.b - c2.b) * (c1.b - c2.b);
        },
        randomHexColor: function() {
            let index, strHex = "#";
            for (let i = 0; i < 6; i++) {
                index = Math.round(Math.random() * 15);
                strHex += arrHex[index];
            }
            return strHex;
        },
        //色库
        colorlibrary: [
            // Flash
            [
                [0xFF0075, 0x172774, 0x77D970],
                [0xC7FFD8, 0x98DED9, 0x161D6F],
                [0x6930C3, 0x64DFDF, 0x80FFDB],
                [0x393E46, 0xFFD369, 0xEEEEEE],
                [0x393E46, 0x76EAD7, 0xC4FB6D],
                [0xF7F7EE, 0xFB7813, 0x17706E],
                [0xC7FFD8, 0x98DED9, 0x161D6F],
                [0x444444, 0xDA0037, 0xEDEDED],
                [0x333F44, 0x37AA9C, 0x94F3E4],
                [0xDBF6E9, 0x9DDFD3, 0x31326F],
                [0xCCFFBD, 0x7ECA9C, 0x40394A],
                [0xD3E0EA, 0x1687A7, 0x276678],
                [0xEEEEEE, 0xA6F6F1, 0xFA26A0],
                [0x5EDFFF, 0x3E64FF, 0x272121],
                [0x4EEAF6, 0xC82586, 0x291F71],
                [0xFFEDDA, 0xFFB830, 0xFF2442],
                [0xFFF5B7, 0xFF449F, 0x005F99],
            ],
            // Char
            [
                [0xFF0075, 0x172774, 0x77D970],
                [0xC7FFD8, 0x98DED9, 0x161D6F],
                [0x6930C3, 0x64DFDF, 0x80FFDB],
                [0x393E46, 0xFFD369, 0xEEEEEE],
                [0x393E46, 0x76EAD7, 0xC4FB6D],
                [0xF7F7EE, 0xFB7813, 0x17706E],
                [0xC7FFD8, 0x98DED9, 0x161D6F],
                [0x444444, 0xDA0037, 0xEDEDED],
                [0x222831, 0x30475E, 0xF05454],
                [0x333F44, 0x37AA9C, 0x94F3E4],
                [0x435055, 0x29A19C, 0xA3F7BF],
                [0x00ADB5, 0xB8E1DD, 0x044A42],
                [0xDBF6E9, 0x9DDFD3, 0x31326F],
                [0xCCFFBD, 0x7ECA9C, 0x40394A],
                [0xD3E0EA, 0x1687A7, 0x276678],
                [0x00ADB5, 0xAAD8D3, 0xEEEEEE],
                [0xEEEEEE, 0xA6F6F1, 0xFA26A0],
                [0xFFD5E5, 0xFF5D6C, 0xF35588],
                [0x5EDFFF, 0x3E64FF, 0x272121],
                [0x4EEAF6, 0xC82586, 0x291F71],
                [0xFFEAC9, 0x66DE93, 0xFFD369],
                [0xFFEDDA, 0xFFB830, 0xFF2442],
                [0xFFF5B7, 0xFF449F, 0x005F99],
                [0xE9896A, 0x387C6D, 0x343F56],
                [0xE6E6FA, 0x00BFFF, 0xffffff],
            ],
            // Shape
            [
                [0xFF0075, 0x172774, 0x77D970],
                [0x6930C3, 0x64DFDF, 0x80FFDB],
                [0x393E46, 0xFFD369, 0xEEEEEE],
                [0x444444, 0xDA0037, 0xEDEDED],
                [0x333F44, 0x37AA9C, 0x94F3E4],
                [0x435055, 0x29A19C, 0xA3F7BF],
                [0x044343, 0x46466E, 0xBDBDD7],
                [0xDBF6E9, 0x9DDFD3, 0x31326F],
                [0xCCFFBD, 0x7ECA9C, 0x40394A],
                [0xD3E0EA, 0x1687A7, 0x276678],
                [0xE8E8E8, 0xBBBFCA, 0x495464],
                [0x00ADB5, 0xAAD8D3, 0xEEEEEE],
                [0xEEEEEE, 0xA6F6F1, 0xFA26A0],
                [0xFFD5E5, 0xFF5D6C, 0xF35588],
                [0x5EDFFF, 0x3E64FF, 0x272121],
                [0x4EEAF6, 0xC82586, 0x291F71],
                [0xFFEAC9, 0x66DE93, 0xFFD369],
                [0xFFEDDA, 0xFFB830, 0xFF2442],
                [0xE6E6FA, 0x00BFFF, 0xffffff],
            ],
            // Cube
            [
                [0xFF0075, 0x172774, 0x77D970],
                [0xC7FFD8, 0x98DED9, 0x161D6F],
                [0x6930C3, 0x64DFDF, 0x80FFDB],
                [0x393E46, 0xFFD369, 0xEEEEEE],
                [0x444444, 0xDA0037, 0xEDEDED],
                [0x222831, 0x30475E, 0xF05454],
                [0x333F44, 0x37AA9C, 0x94F3E4],
                [0x435055, 0x29A19C, 0xA3F7BF],
                [0x00ADB5, 0xB8E1DD, 0x044A42],
                [0xDBF6E9, 0x9DDFD3, 0x31326F],
                [0xCCFFBD, 0x7ECA9C, 0x40394A],
                [0x00ADB5, 0xAAD8D3, 0xEEEEEE],
                [0xEEEEEE, 0xA6F6F1, 0xFA26A0],
                [0xFFD5E5, 0xFF5D6C, 0xF35588],
                [0x5EDFFF, 0x3E64FF, 0x272121],
                [0xFFEAC9, 0x66DE93, 0xFFD369],
                [0xFFEDDA, 0xFFB830, 0xFF2442],
                [0xFFF5B7, 0xFF449F, 0x005F99],
                [0xE6E6FA, 0x00BFFF, 0xffffff],
            ],
        ],
        colorMatchGroup: function(theme) {
            // let c = this.colorlibrary[theme][parseInt(this.randomRange(0, this.colorlibrary[theme].length))];
            // console.log(this.to16(c[0]), this.to16(c[1]), this.to16(c[2]));
            // return c;
            let index = parseInt(this.randomRange(0, this.colorlibrary[theme].length));
            if (index == this.lastThemeIndex[theme]) {
                index = parseInt(this.randomRange(0, this.colorlibrary[theme].length));
            }
            this.lastThemeIndex[theme] = index;
            return this.colorlibrary[theme][index];
        },
        colorMatch: function(cmg, index) {
            return cmg[index % cmg.length];
        },
        randomRange: function(t, i) {
            return i == undefined ? (Math.random() * t) : (Math.random() * (i - t) + t);
        },
        randompm: function() {
            return this.randomRange(-1, 1) > 0 ? 1 : -1;
        },
        //10进制转16
        to16: function(num) {
            return num.toString(16);
        },
        to10: function(hex) {
            return Number('0x' + hex);
        },
        clamp: function(value, x, y) {
            return (x != null & y != null) ? ((value >= x && value <= y) ? value : (value < x ? x : y)) : ((value >= 0 && value <= x) ? value : (value < 0 ? 0 : x))
        },
        clamp01: function(value) {
            return (value >= 0 && value <= 1) ? value : (value < 0 ? 0 : 1);
        },
        //设备环境
        checkDeviceType: function(userAgent) {
            return { isMobile: userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null, isIOS: !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) };
        },
        isMobile: function(userAgent) {
            return userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null
        },
        isIOS: function(userAgent) {
            return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        },
        lerp(v, t, p) { //插值为了平滑些
            return (v != t) ? (v + (t - v) * p) : t;
        }
    };
    window.Utils = new Utils();
    // [0x0087ff, 0xff5559, 0xffdf30, 0x35dc61]
})();