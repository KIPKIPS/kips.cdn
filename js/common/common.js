"use strict";
const R = 100;
const angle = 30;
const h = R * Math.cos(angle / 180 * Math.PI);
const r = R * Math.sin(angle / 180 * Math.PI);
const arrHex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
const EffectTheme = {
    Flash: 0,
    Char: 1,
    Shape: 2,
    Cube: 3,
};
const japanesePhoneticAlphabet = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわを";
const canvasWidth = 480;
const canvasHeight = 640;
const mobileCanvasWidth = 540;
const mobileCanvasHeight = 720;
const frontCamera = "user";
const rearCamera = "environment";
const letter = "ABCDEFGHIJKLMNOPQRSTUVQXYZ";
const symbol = letter + "*+■■■■□□＿/＄％＃＆￥";
const DIMENSIONAL = "DIMENSIONAL";
const RIFT = "RIFT";
const TAPTOSTART = "TAP TO START";
const TO_RADIANS = Math.PI / 180;
const Effects = {
    FlashDark: 0,
    FlashLight: 1,
    CharsColorful: 2,
    CharsNormal: 3,
    SingleShape: 4,
    MutipleShape: 5,
    CubeColorful: 6,
    CubeNormal: 7,
};
const MaxEffects = 8;
const github = 'https://github.com/KIPKIPS';
const youtube = 'https://www.youtube.com/channel/UCLRIiA3trYeIwuf6smFgweA';
const twitter = 'https://twitter.com/RECNEPS_KIPS';
const facebook = 'https://www.facebook.com/profile.php?id=100021707954561';
$(document).ready(() => {
    $("#menu p a").click(() => {
        $("#menu").css({ height: "0%", display: "none" });
    });
    $("#bt_menu").click(() => {
        let isShow = $("#menu").css("display") == "block";
        $("#menu").stop();
        $("#menu").css("height", isShow ? "100%" : "0%");
        if (!isShow) {
            $("#menu").css("display", "block");
            $("#menu").animate({ height: "100%" }, 100);
        } else {
            $("#menu").animate({ height: "0%" }, 100, "swing", () => $("#menu").css("display", "none"));
        }
    });
    let tw = $("#twitter");
    let fb = $("#facebook");
    tw.click(() => gotwitter());
    fb.click(() => gofacebook());
    let o = (obj, value) => obj.animate({ opacity: value }, 100, "easeOut", () => obj.css("opacity", value));
    tw.on("mouseenter", () => o(tw, "0.4"));
    fb.on("mouseenter", () => o(fb, "0.4"));
    tw.on("mouseleave", () => o(tw, "1"));
    fb.on("mouseleave", () => o(fb, "1"));
});

function gotwitter() {
    window.open(twitter);
}

function gofacebook() {
    window.open(facebook);
}

function goyoutube() {
    window.open(youtube);
}

function gogithub() {
    window.open(github);
}