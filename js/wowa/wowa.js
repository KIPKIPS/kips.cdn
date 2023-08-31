"use strict"
var skeleton,modelLoader,targetX,mikuMesh,light,clip1,action1,clip2,action2,clock, mixer,helper, inRange, damp, prePointer, pointDown, cameraGroup, deltaMoveX, deltaMoveY, lastDeltaMoveX, lastDeltaMoveY, deltaMoveValueX, deltaMoveValueY, curPointer, pointerPos, tempImage, imageContext, innerGroup, delayTapToStart, audioFinished, isPointerdown, lastPointers, pointers, minScale, layerName, maxScale, guideX, guideY, mouseX, mouseY, canvasList, curScale, tempCanvas, tempContext, dataUrl, pointerMaxSize, lastDrawData, canvasCtx, guide, penSize, penPercent, eraserPercent, picker, penColor, eraserSize, pointerRadius, percent, sliderWidth, curLayer, sliderBorder, undoList, redoList, curTool, Tools, audioFadeOutTimer, isDrawActive, audioStatus, gainNode, sourceNode, audioCtx, audioBuffer, gameStart, canvasjq, initTween, isAboutActive, isMobile, scene, camera, renderer, canvasRoot, group, box;
var gui;
$(document).ready(() => {
    initData();
    initComponent();
    loadAudio();
    initCamera();
    initRenderer();
    initScene();
    initLight();
    rendererUpdate();
    window.onresize = () => {
        canvasRoot.css({ width: document.body.clientWidth, height: document.body.clientHeight });
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        if (guide) {
            curScale = 1;
            let minView = window.innerWidth <= window.innerHeight ? window.innerWidth : window.innerHeight
            guide.css({ width: minView + "px", height: minView + "px", transform: "scale(1) translate(-50%,-50%)", left: (window.innerWidth * .5) + "px", top: (window.innerHeight * .5) + "px", });
        }
    }
});

function initGUI(){
    // gui = new dat.GUI();
    // for (let i = 0; i < skeleton.bones.length; i++) {
    //     console.log(skeleton.bones[i]);
    //     var bone = skeleton.bones[i];
    //     gui.add(bone.rotation, "x").min(-10).max(10).step(0.001).name(bone.name + "rotation x");
    //     gui.add(bone.rotation, "y").min(-10).max(10).step(0.001).name(bone.name + "rotation y");
    //     gui.add(bone.rotation, "z").min(-10).max(10).step(0.001).name(bone.name + "rotation z");
    // }

}

function stopEvent(e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
    } else {
        e.returnValue = false;
        e.cancelBubble = true;
    }
}

function stopPropagation(e) {
    e = e || window.event;
    if (!+"\v1") {
        e.cancelBubble = true;
    } else {
        e.stopPropagation();
    }
}

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
}

async function initScene() {
    scene = new THREE.Scene();
    group = new THREE.Group();
    cameraGroup = new THREE.Group();
    scene.add(group);
    scene.add(cameraGroup);
    group.position.set(0, 0, 0);
    cameraGroup.position.set(0, 0, 0);
    cameraGroup.add(camera);
    innerGroup = new THREE.Group();
    group.add(innerGroup);
    innerGroup.position.set(0, 0, 0);
    innerGroup.rotation.set(0, 0, 0);

    modelLoader = new THREE.MMDLoader();
    let load = () => new Promise((resolve, reject) => modelLoader.load("model/paper_miku.pmd", object => resolve(object), null, error => reject(object)));
    mikuMesh = await load();
    skeleton = mikuMesh.skeleton;
    initGUI();
    let loadMotion = (motionPath,mesh) => new Promise((resolve, reject) => modelLoader.loadAnimation(motionPath, mesh, animClip => resolve(animClip), null, error => reject(animClip)));
    
    clip1 = await loadMotion("model/motion.vmd",mikuMesh);
    clip2 = await loadMotion("model/motion2.vmd",mikuMesh);
    let mat = mikuMesh.material[0];
    mat.side = THREE.DoubleSide;
    mat.transparent = true;
    innerGroup.add(mikuMesh);
    
    mikuMesh.position.set(0, -7, 0);
    mikuMesh.scale.set(1.7, 1.7, 1);
    mikuMesh.rotation.y = Math.PI;
    helper = new THREE.MMDAnimationHelper();
    helper.add(mikuMesh, {
        animation:clip1,
        physics: true,
    });
    mixer = helper.objects.get(mikuMesh).mixer;
    action1 = mixer.clipAction(clip1);
    action2 = mixer.clipAction(clip2);
    action1.play();

    var geometry = new THREE.BoxGeometry(5, 500, 5);
    let mats = [];
    for (let i = 0; i < geometry.groups.length; i++) {
        let m = new THREE.MeshLambertMaterial({ color: i == 2 ? 0x7d7d7d : 0x3f3f3f });
        m.side = THREE.DoubleSide;
        mats.push(m);
    }
    box = new THREE.Mesh(geometry, mats);
    innerGroup.add(box);
    box.position.set(0, -257, 0);
    var offsetY = 8
    var offsetZ = -16
    initTween = new TWEEN.Tween(0).to(1, 900).onUpdate(v => group.position.set(0, offsetY - offsetY * v, offsetZ - offsetZ * v)).onComplete(() => {
        initTween.stop();
        initTween = null;
        group.position.set(0, 0, 0);
    }).onStart(() => {
        //单摆
        gsap.fromTo(group.rotation, {
            x: -.3,
        }, {
            duration: 3,
            x: .2,
            repeat: -1,
            ease: 'power1.inOut',
            yoyo: true,
        });
        //自转
        gsap.fromTo(group.rotation, {
            y: -.15,
        }, {
            duration: 4,
            y: .15,
            repeat: -1,
            ease: 'power1.inOut',
            yoyo: true,
        });
    }).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, -12.5);
    camera.lookAt(new THREE.Vector3(0, 0, -1));
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: document.querySelector('#canvas'),
        precision: "highp",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
}

function initLight() {
    light = new THREE.AmbientLight(0xdddddd, 1);
    scene.add(light);
}

function initData() {
    undoList = [];
    redoList = [];
    pointers = [];
    lastPointers = [];
    Tools = {
        Pen: 0,
        Eraser: 1,
    };
    curLayer = curScale = 1;
    pointerMaxSize = 40;
    sliderBorder = 5;
    penPercent = eraserPercent = .25;
    penSize = eraserSize = .25 * pointerMaxSize;
    penColor = { r: 0, g: 0, b: 0 };
    inRange = isDrawActive = isAboutActive = gameStart = isPointerdown = delayTapToStart = audioFinished = false;
    $("#about").css({ display: "none", opacity: "0" });
    $("#about_bg").css({ display: "none", opacity: "0" });
    isMobile = Utils.isMobile(navigator.userAgent);
    $("#tips").html((isMobile ? "TAP" : "CLICK") + " TO START");
    canvasRoot = $("#canvas_root");
    canvasRoot.css("opacity", ".35");
    canvasjq = $("#canvas");
    pointerRadius = $("#pointer").width() * .5;
    sliderWidth = $("#slider").width();
    guide = $("#guide");
    canvasCtx = [];
    canvasCtx[1] = $("#above")[0].getContext("2d");
    canvasCtx[2] = $("#under")[0].getContext("2d");
    $("#guide canvas").attr({ width: 1024, height: 1024 });
    tempCanvas = $('<canvas/>');
    tempCanvas.attr({ width: 1024, height: 1024 });
    tempCanvas.css({ width: "1024px", height: "1024px" })
    tempContext = tempCanvas[0].getContext("2d");
    canvasList = [];
    canvasList[1] = $("#above");
    canvasList[2] = $("#under");
    minScale = .4;
    maxScale = 4;
    prePointer = new THREE.Vector2(0, 0);
    curPointer = new THREE.Vector2(0, 0);
    imageContext = new Image();
    tempImage = new Image();
    pointerPos = new THREE.Vector2(0, 0);
    deltaMoveValueX = 0;
    pointDown = false;
    clock = new THREE.Clock();
}

function rendererUpdate() {
    updateController();
    TWEEN.update();
    if (helper) helper.update(clock.getDelta());
    
    requestAnimationFrame(rendererUpdate);
    renderer.render(scene, camera);
    // if (skeleton == null) {
    //     if (mikuMesh) {
    //         console.log(mikuMesh);
    //         skeleton = mikuMesh.skeleton;
    //         console.log(skeleton.bones);
    //     }
    // }else{
    //     console.log(skeleton.bones[3].rotation.y)
    //     skeleton.bones[3].rotation.y += 0.01;
    //     console.log(skeleton.bones[3].rotation.y)
    // }

}

function updateController() {
    if (group == null) return;
    deltaMoveX = (curPointer.x - prePointer.x) * .004;
    deltaMoveY = (curPointer.y - prePointer.y) * .006;

    //镜头
    if (deltaMoveY && lastDeltaMoveY - deltaMoveY != 0) {
        deltaMoveValueY = deltaMoveY;
    } else {
        if (deltaMoveValueY > -.001 && deltaMoveValueY < .001) {
            deltaMoveValueY = 0;
        } else {
            damp = Math.abs(deltaMoveValueY * .08);
            if (Math.abs(deltaMoveValueY) < damp) {
                deltaMoveValueY = 0;
            } else {
                if (deltaMoveValueY > 0) {
                    deltaMoveValueY -= damp;
                } else if (deltaMoveValueY < 0) {
                    deltaMoveValueY += damp;
                }
            }
        }
    }
    if (deltaMoveValueY) {
        inRange = false;
        if (cameraGroup.rotation.x >= .5) {
            if (deltaMoveValueY < 0) {
                inRange = true;
            }
        } else if (cameraGroup.rotation.x <= -.4) {
            if (deltaMoveValueY > 0) {
                inRange = true;
            }
        } else {
            inRange = true;
        }
        if (inRange) {
            targetX = cameraGroup.rotation.x + deltaMoveValueY;
            targetX = Utils.clamp(targetX,-.4,.5);
            cameraGroup.rotation.x = targetX;
        }
    }

    //旋转
    if (deltaMoveX && lastDeltaMoveX - deltaMoveX != 0) { //按住加速
        deltaMoveValueX = deltaMoveX;
    } else {
        if (deltaMoveValueX > -.001 && deltaMoveValueX < .001) {
            deltaMoveValueX = 0;
        } else {
            damp = Math.abs(deltaMoveValueX * .08);
            if (Math.abs(deltaMoveValueX) < damp) {
                deltaMoveValueX = 0;
            } else {
                if (deltaMoveValueX > 0) {
                    deltaMoveValueX -= damp;
                } else if (deltaMoveValueX < 0) {
                    deltaMoveValueX += damp;
                }
            }
        }
    }
    if (deltaMoveValueX) {
        innerGroup.rotateY(deltaMoveValueX);
    }
    lastDeltaMoveX = deltaMoveX;
    lastDeltaMoveY = deltaMoveY;
}

function usePen() {
    if (curTool == Tools.Pen) return;
    curTool = Tools.Pen;
    $("#pen").css({ "background-color": "#c0c0c0", "border-radius": "7px" });
    $("#eraser").css({ "background-color": "transparent" });
    $("#slider").animate({ "left": "0" }, 200, () => $("#picker").css("display", "block").animate({ "opacity": "1" }, 100));
    setSliderPointer(penPercent);
}

function useEraser() {
    if (curTool == Tools.Eraser) return;
    curTool = Tools.Eraser;
    $("#eraser").css({ "background-color": "#c0c0c0", "border-radius": "7px" });
    $("#pen").css({ "background-color": "transparent" });
    $("#slider").animate({ "left": ($("#pen").width() * 1.5) + "px" }, 200);
    $("#picker").css("display", "none")
    setSliderPointer(eraserPercent);
}

function updatePaintData() {
    if (canvasCtx) {
        canvasCtx[curLayer].lineCap = "round";
        canvasCtx[curLayer].lineJoin = "round";
        canvasCtx[curLayer].lineWidth = curTool == Tools.Pen ? penSize : eraserSize;
        canvasCtx[curLayer].globalCompositeOperation = curTool == Tools.Pen ? "source-over" : "destination-out";
    }
}

function switchLayer() {
    curLayer = curLayer == 1 ? 2 : 1;
    setImage($("#layer img"), "../svg/layer_" + curLayer + ".svg");
}

function setImage(o, url) {
    tempImage.src = url;
    o.attr("src", tempImage.src);
}

function initComponent() {
    $("#bt_about").click(displayAbout);
    $("#bt_close").click(hideAbout);
    $("#main").click(tapToStart);
    $("#info #share #wc").click(() => shareWebsiteTo("wechat"));
    $("#info #share #qq").click(() => shareWebsiteTo("qq"));
    $("#bt_draw").click(openkipspaint);
    $("#bt_draw_close").click(closekipspaint);
    $("#bt_share").click(() => shareVideo());
    $("#draw").css("display", "none");
    $("#btns").css("display", "none");
    $("#pen").click(usePen);
    $("#eraser").click(useEraser);
    $("#layer").click(switchLayer);
    $("#clear").click(clearCanvas);
    $("#undo").click(undo);
    $("#redo").click(redo);
    bindEvent($("#slider"), setSlider);
    picker = new Colorpicker({
        isMobile: isMobile,
        showBg: true,
        confirm: color => {
            $("#picker").css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
            penColor = color;
            picker.hide();
        },
        cancel: () => picker.hide(),
    });
    picker.getRoot().css({ "z-index": "10" });
    $("#picker").click(e => {
        if (curTool != Tools.Pen) return;
        stopPropagation(e);
        picker.setPointerByRGB(penColor.r, penColor.g, penColor.b);
        picker.show();
    });
    registeModelHandle();
    usePen();
    $("#use").click(displayCompanion);
    $("#companion").click(hideCompanion);
    if (isMobile) {
        setImage($("#use_move"), "../svg/m_mouse_move.svg");
        setImage($("#use_zoom"), "../svg/m_mouse_zoom.svg");
    }
    saveToUndolist();
    let minView = window.innerWidth <= window.innerHeight ? window.innerWidth : window.innerHeight
    guide.css({ width: minView + "px", height: minView + "px" });
    $("#ok").click(completeDraw);
    registeDrawHandle();
}

function getTouchPos(e) {
    var x = 0;
    var y = 0;
    var length = e.touches.length;
    for (let i = 0; i < length; i++) {
        x += e.touches[i].pageX;
        y += e.touches[i].pageY;
    }
    pointerPos.set(x / length, y / length);
    return pointerPos;
}

function updateTouchPos(e) {
    if (!pointDown || !gameStart) return;
    prePointer.copy(curPointer);
    var p = getTouchPos(e);
    curPointer.set(p.x, p.y);
}

function stopTouch(e, isDown) {
    pointDown = isDown;
    var p = getTouchPos(e);
    prePointer.set(p.x, p.y);
    curPointer.copy(prePointer);
}

function stopMouse(e, isDown) {
    prePointer.set(e.pageX, e.pageY);
    curPointer.copy(prePointer);
    pointDown = isDown;
}


function updateMousePos(e) {
    if (!pointDown || !gameStart) return;
    prePointer.copy(curPointer);
    curPointer.set(e.pageX, e.pageY);
}

function registeModelHandle() {
    $(document).oncontextmenu = () => false;
    if (isMobile) {
        $(document).css("touch-action", "auto");
        addEvent(document, "touchstart", e => stopTouch(e, true), true);
        addEvent(document, "touchend", e => stopTouch(e, false), true);
        addEvent(document, "touchmove", updateTouchPos, true)
    } else {
        addEvent(document, "mousedown", e => stopMouse(e, true));
        addEvent(document, "mouseup", e => stopMouse(e, false));
        addEvent(document, "mousemove", updateMousePos);
    }
}

function clearCanvas() {
    canvasCtx[curLayer].clearRect(0, 0, 1024, 1024);
    saveToUndolist();
}

function completeDraw() {
    tempContext.clearRect(0, 0, 1024, 1024);
    imageContext.src = canvasList[2][0].toDataURL('image/png');
    tempContext.drawImage(imageContext, 0, 0);
    imageContext.src = canvasList[1][0].toDataURL('image/png');
    tempContext.drawImage(imageContext, 0, 0);
    var dataURL = tempCanvas[0].toDataURL('image/png');
    imageContext.src = dataURL;
    var texture = new THREE.TextureLoader().load(dataURL);
    texture.flipY = false;
    var mat = mikuMesh.material[0];
    mat.map = texture;
    mat.needsUpdate = true;
    closekipspaint();
}

function displayCompanion() {
    $("#companion").css({ "display": "block", "opacity": 0 }).animate({ "opacity": "1" }, 200);
}

function hideCompanion() {
    $("#companion").animate({ "opacity": 0 }, 200, () => $("#companion").css({ "display": "none", "opacity": 0 }));
}

function handlePointers(e, type) {
    for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId === e.pointerId) {
            if (type === 'update') {
                pointers[i] = e;
            } else if (type === 'delete') {
                pointers.splice(i, 1);
            }
        }
    }
}

function checkTransparency() {
    //检测是否空白图
    var data1 = canvasCtx[1].getImageData(0,0,1024,1024).data;
    var data2 = canvasCtx[2].getImageData(0,0,1024,1024).data;
    var isTransparency = true;
    for (let i = 3; i < data1.length; i+=4) {
        if (data1[i] == 0 && data2[i] == 0) {
            continue;
        }else{
            isTransparency = false;
            break;
        }
    }
    $("#ok p").css("opacity", isTransparency ? ".3" : "1");
}

function registeDrawHandle() {
    $("#draw")[0].oncontextmenu = () => false;
    guide.css("touch-action", "none");
    $("#draw").css("touch-action", "none");
    let handleMouseEvent = () => {
        addEvent(guide[0], "mousedown", e => {
            let save = false;
            let mouseup = () => {
                if (save) saveToUndolist();
                removeEvent(guide[0], "mousemove", mousemove, false);
                removeEvent(document, "mouseup", mouseup, false);
                checkTransparency();
            }
            let mousemove = e => {
                if (e.which == 1) { //left -> draw
                    save = true;
                    drawCanvas(e.offsetX, e.offsetY);
                } else if (e.which == 2 || e.which == 3) { //middle right -> move
                    moveCanvas(e.clientX, e.clientY);
                }
            }
            preventDefault(e);
            guideX = locationLeft(guide[0]);
            guideY = locationTop(guide[0]);
            mouseX = e.clientX;
            mouseY = e.clientY;
            lastDrawData = { x: e.offsetX, y: e.offsetY };
            addEvent(guide[0], "mousemove", mousemove, false);
            addEvent(document, "mouseup", mouseup, false);
            canvasCtx[curLayer].strokeStyle = "rgb(" + penColor.r + "," + penColor.g + "," + penColor.b + ")";
            updatePaintData();
        });
        addEvent(guide[0], 'mousewheel', scaleCanvas);
        addEvent(guide[0], 'DOMMouseScroll', scaleCanvas);
    };
    let handleTouchEvent = () => {
        let save = false;
        let isDrag = false;
        let l = parseInt(guide.css("left").replace("px", ""));
        let t = parseInt(guide.css("top").replace("px", ""));
        let hg = guide.width() * .5;
        let center;
        let waitTimer;
        let startPos = [];
        addEvent(guide[0], "pointerdown", e => {
            save = false;
            l = parseInt(guide.css("left").replace("px", ""));
            t = parseInt(guide.css("top").replace("px", ""));
            hg = guide.width() * .5;
            updatePaintData();
            canvasCtx[curLayer].strokeStyle = "rgb(" + penColor.r + "," + penColor.g + "," + penColor.b + ")";
            pointers.push(e);
            lastDrawData = { x: pointers[0].clientX - l + hg, y: pointers[0].clientY - t + hg };
            if (pointers.length == 1) {
                isPointerdown = true;
                waitTimer = setTimeout(() => {
                    clearTimeout(waitTimer);
                    waitTimer = null;
                }, 100);
            } else if (pointers.length == 2) {
                guideX = locationLeft(guide[0]);
                guideY = locationTop(guide[0]);
                center = getCenter({ x: pointers[0].clientX, y: pointers[0].clientY }, { x: pointers[1].clientX, y: pointers[1].clientY });
                mouseX = center.x;
                mouseY = center.y;
                isDrag = true;
                lastPointers[0] = pointers[0];
                lastPointers[1] = pointers[1];
                startPos[0] = pointers[0];
                startPos[1] = pointers[1];
            }
        });
        addEvent(guide[0], "pointermove", e => {
            if (e.target.id != "above") return;
            if (isPointerdown) {
                handlePointers(e, 'update');
                if (pointers.length == 1) {
                    if (!isDrag && waitTimer == null) {
                        save = true;
                        drawCanvas(pointers[0].clientX - l + hg, pointers[0].clientY - t + hg);
                    }
                } else if (pointers.length == 2) {
                    var curDis = getDistance(pointers[0].clientX, pointers[0].clientY, pointers[1].clientX, pointers[1].clientY);
                    var lastDis = getDistance(lastPointers[0].clientX, lastPointers[0].clientY, lastPointers[1].clientX, lastPointers[1].clientY);
                    var delta = curDis / lastDis - 1;
                    var ratio = delta < 0 ? .99 : 1.01;
                    const tempScale = ratio * curScale;
                    center = getCenter({ x: pointers[0].clientX, y: pointers[0].clientY }, { x: pointers[1].clientX, y: pointers[1].clientY });
                    if (Math.abs(delta) > .005 && tempScale > minScale && tempScale < maxScale) {
                        curScale = tempScale;
                        guide.css({ left: (center.x - ratio * (center.x - parseFloat(guide.css("left").replace("px", "")))) + "px", top: (center.y - ratio * (center.y - parseFloat(guide.css("top").replace("px", "")))) + "px", width: (guide.width() * ratio) + "px", height: (guide.width() * ratio) + "px" });
                    }
                    moveCanvas(center.x, center.y);
                    lastPointers[0] = pointers[0];
                    lastPointers[1] = pointers[1];
                }
            }
            e.preventDefault(false);
        });
        addEvent(document, "pointerup", e => {
            if (isPointerdown) {
                handlePointers(e, 'delete');
                if (save) saveToUndolist();
                if (pointers.length == 0) {
                    isPointerdown = false;
                    if (isDrag) {
                        isDrag = false;
                    }
                    if (waitTimer) {
                        clearTimeout(waitTimer);
                        waitTimer = null;
                    }
                }
                checkTransparency();
            }
        });
        addEvent(guide[0], 'pointercancel', e => {
            if (isPointerdown) {
                isPointerdown = false;
                pointers.length = 0;
            }
        });
    };
    if ("onmouseup" in document) {
        handleMouseEvent();
    }
    if ("ontouchend" in document) { //支持触摸
        handleTouchEvent();
    }
}

function getDistance(x1, y1, x2, y2) {
    let x = x1 - x2;
    let y = y1 - y2;
    return Math.sqrt(x * x + y * y); // Math.sqrt(x * x + y * y);
}

function getCenter(a, b) {
    return { x: (a.x + b.x) * .5, y: (a.y + b.y) * .5 };
}

function scaleCanvas(e) {
    if (e.target.id != "above") return;
    if (!e.wheelDelta) { //兼容firefox
        if (e.detail) {
            e.wheelDelta = e.detail * -40;
        }
    }
    if (e.wheelDelta == 0) {
        return;
    }
    let ratio = e.wheelDelta < 0 ? .9 : 1.1;
    var tempScale = ratio * curScale;
    if (tempScale > minScale && tempScale < maxScale) {
        curScale = tempScale;
    } else {
        return;
    }
    guide.css({ left: (e.clientX - ratio * (e.clientX - parseFloat(guide.css("left").replace("px", "")))) + "px", top: (e.clientY - ratio * (e.clientY - parseFloat(guide.css("top").replace("px", "")))) + "px", width: (guide.width() * ratio) + "px", height: (guide.width() * ratio) + "px" });
}

function saveToUndolist() {
    if (redoList.length > 0) {
        redoList = [];
        setImage($("#redo img"), "../svg/arrow_gray.svg");
    }
    layerName = curLayer == 1 ? "#above" : "#under";
    dataUrl = $(layerName)[0].toDataURL();
    var img = new Image();
    img.src = dataUrl;
    undoList.push({ layer: curLayer, img: img });
    if (undoList.length > 1) {
        setImage($("#undo img"), "../svg/arrow.svg");
        $("#ok p").css("opacity", "1");
    }
}

function undo() {
    let d;
    if (undoList.length > 0) {
        d = undoList[undoList.length - 1];
        canvasCtx[d.layer].lineWidth = penSize;
        canvasCtx[d.layer].globalCompositeOperation = "source-over";
        if (undoList.length > 1) {
            redoList.push(d);
            undoList.splice(undoList.length - 1, 1);
        }
        if (undoList.length > 0) {
            let find = false;
            for (let i = undoList.length - 1; i > 0; i--) {
                if (undoList[i].layer == d.layer) {
                    canvasCtx[d.layer].clearRect(0, 0, 1024, 1024);
                    canvasCtx[d.layer].drawImage(undoList[i].img, 0, 0);
                    find = true;
                    break;
                }
            }
            if (!find) {
                canvasCtx[d.layer].clearRect(0, 0, 1024, 1024);
            }
        }
        if (undoList.length <= 1) {
            setImage($("#undo img"), "../svg/arrow_gray.svg");
            $("#ok p").css("opacity", ".3");
        }
        if (redoList.length > 0) {
            setImage($("#redo img"), "../svg/arrow.svg");
        }
    }
    if (curTool == Tools.Eraser && d != null) {
        canvasCtx[d.layer].lineWidth = eraserSize;
        canvasCtx[d.layer].globalCompositeOperation = "destination-out";
    }
    checkTransparency();
}

function redo() {
    let d;
    if (redoList.length > 0) {
        undoList.push(redoList[redoList.length - 1]);
        d = undoList[undoList.length - 1];
        canvasCtx[d.layer].lineWidth = penSize;
        canvasCtx[d.layer].globalCompositeOperation = "source-over";
        canvasCtx[d.layer].clearRect(0, 0, 1024, 1024);
        canvasCtx[d.layer].drawImage(d.img, 0, 0);
        redoList.splice(redoList.length - 1, 1);
    }
    if (redoList.length <= 0) {
        setImage($("#redo img"), "../svg/arrow_gray.svg");
    }
    if (undoList.length > 1) {
        setImage($("#undo img"), "../svg/arrow.svg");
        $("#ok p").css("opacity", "1");
    }
    if (curTool == Tools.Eraser && d != null) {
        canvasCtx[d.layer].lineWidth = eraserSize;
        canvasCtx[d.layer].globalCompositeOperation = "destination-out";
    }
    checkTransparency();
}

function addEvent(o, e, f, m) {
    if (o.attachEvent) {
        o.attachEvent('on' + e, f);
    } else {
        if (m) {
            o.addEventListener(e, f, { passive: false });
        } else {
            o.addEventListener(e, f, false);
        }
    }
}

function removeEvent(o, e, f, m) {
    if (o.detachEvent) {
        o.detachEvent('on' + e, f);
    } else {
        o.removeEventListener(e, f, m ? { passive: false } : false);
    }
}

function drawCanvas(x, y) {
    if (lastDrawData == null) {
        updatePaintData();
        lastDrawData = { x: x, y: y };
    }
    drawLine(getCanvasValue(lastDrawData.x), getCanvasValue(lastDrawData.y), getCanvasValue(x), getCanvasValue(y));
    lastDrawData = { x: x, y: y };
}


function getCanvasValue(v) {
    return v / guide.width() * 1024;
}

function drawLine(x1, y1, x2, y2) {
    if (curTool == Tools.Pen) {
        canvasCtx[curLayer].save();
        canvasCtx[curLayer].beginPath();
        canvasCtx[curLayer].moveTo(x1, y1);
        canvasCtx[curLayer].lineTo(x2, y2);
        canvasCtx[curLayer].stroke();
        canvasCtx[curLayer].closePath();
    } else {
        var asin = eraserSize * .5 * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
        var acos = eraserSize * .5 * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
        var x3 = x1 + asin;
        var y3 = y1 - acos;
        var x4 = x1 - asin;
        var y4 = y1 + acos;
        var x5 = x2 + asin;
        var y5 = y2 - acos;
        var x6 = x2 - asin;
        var y6 = y2 + acos;
        canvasCtx[curLayer].save();
        canvasCtx[curLayer].beginPath();
        canvasCtx[curLayer].arc(x2, y2, eraserSize * .5, 0, 2 * Math.PI);
        canvasCtx[curLayer].clip();
        canvasCtx[curLayer].clearRect(0, 0, 1024, 1024);
        canvasCtx[curLayer].restore();
        //清除矩形剪辑区域里的像素
        canvasCtx[curLayer].save();
        canvasCtx[curLayer].beginPath();
        canvasCtx[curLayer].moveTo(x3, y3);
        canvasCtx[curLayer].lineTo(x5, y5);
        canvasCtx[curLayer].lineTo(x6, y6);
        canvasCtx[curLayer].lineTo(x4, y4);
        canvasCtx[curLayer].closePath();
        canvasCtx[curLayer].clip();
        canvasCtx[curLayer].clearRect(0, 0, 1024, 1024);
        canvasCtx[curLayer].restore();
    }
}

function moveCanvas(x, y) {
    guide.css({ "left": (guideX + (x - mouseX)) + "px", top: (guideY + (y - mouseY)) + "px" });
}

// local Left
function locationLeft(element) {
    return (element.tagName != "BODY" && element.offsetParent != null) ? (element.offsetLeft + locationLeft(element.offsetParent)) : element.offsetLeft;
}

// local Top
function locationTop(element) {
    return (element.tagName != "BODY" && element.offsetParent != null) ? (element.offsetTop + locationTop(element.offsetParent)) : element.offsetTop;
}

function openkipspaint() {
    if (isDrawActive) return;
    isDrawActive = true;
    $("#draw").css({ display: "block", top: "0", left: "0" }).animate({ opacity: "1" }, 300, "easeOut");
    guide.css({ left: (window.innerWidth * .5) + "px", top: (window.innerHeight * .5) + "px" });
    audiofadeOut();
}

function closekipspaint() {
    if (!isDrawActive) return;
    isDrawActive = false;
    $("#draw").animate({ opacity: "0" }, 300, "easeOut", () => $("#draw").css("display", "none"));
    audioResumefadeIn();
}

function shareVideo() {
    // @TODO: save data
}

// @TODO:app website content share
function shareWebsiteTo(app) {
    switch (app) {
        case "wechat":
            console.log("share wechat");
            break;
        case "qq":
            console.log("share qq")
            break;
        default:
            break;
    }
}

function displayAbout() {
    if (isAboutActive) return;
    isAboutActive = true;
    $("#about_bg").css({ display: "block", top: "0", left: "0" }).animate({ opacity: "1" }, 300, "easeOut");
    $("#about").css({ display: "block", top: "0", left: "0" }).animate({ opacity: "1" }, 300, "easeOut");
    if (gameStart) {
        audiofadeOut();
    }
}

function hideAbout() {
    if (!isAboutActive) return;
    isAboutActive = false;
    $("#about_bg").animate({ opacity: "0" }, 300, "easeOut", () => $("#about_bg").css("display", "none"));
    $("#about").animate({ opacity: "0" }, 300, "easeOut", () => $("#about").css("display", "none"));
    if (gameStart) {
        audioResumefadeIn();
    }
}

function tapToStart() {
    if (initTween) return; 
    if (!audioFinished) {
        delayTapToStart = true;
        return;
    }
    hideAbout();
    $("#auth").animate({ opacity: "0" }, 200, "easeOut", () => $("#auth").css("display", "none"));
    $("#main").animate({ opacity: "0" }, 200, "easeOut", () => $("#main").css("display", "none"));
    var cameraPos = new THREE.Vector3().copy(camera.position);
    action2.crossFadeFrom(action1,.3);
    action2.play();
    helper.enable("animation",false);
    var t = new TWEEN.Tween(0).to(1, 300).onUpdate(v => camera.position.set(cameraPos.x, cameraPos.y + 2 * v, cameraPos.z - 9 * v)).onComplete(() => {
        t.stop();
        t = null;
        gameStart = true;
        enterGame();
    }).onStart(() => canvasRoot.animate({ "opacity": 1 }, 300, "easeOut")).easing(TWEEN.Easing.Quadratic.Out).start();
}

function audiofadeIn() {
    gainNode.gain.value = 0;
    sourceNode.loop = true;
    sourceNode.start(0);
    audioStatus = "play";
    gainNode.gain.linearRampToValueAtTime(.8, audioCtx.currentTime + 1);
}

function enterGame() {
    canvasRoot.css("opacity", 1);
    $("#btns").css({ display: "block", opacity: "0" }).animate({ opacity: 1 }, 300);
    audiofadeIn();
    $("#audio_load").css({ display: "none" });
}

function audiofadeOut() {
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + .5);
    if (audioFadeOutTimer) {
        clearTimeout(audioFadeOutTimer);
    }
    audioFadeOutTimer = setTimeout(() => {
        audioCtx.suspend();
        clearTimeout(audioFadeOutTimer);
        audioFadeOutTimer = null;
    }, 500); //500ms pause
}

// fade in
function audioResumefadeIn() {
    if (audioFadeOutTimer) {
        clearTimeout(audioFadeOutTimer);
    }
    gainNode.gain.value = 0; // start volume
    audioCtx.resume();
    gainNode.gain.linearRampToValueAtTime(.8, audioCtx.currentTime + 1); // 衰减总时间1s
}

async function loadAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext)(); //audio
    let response = await fetch('audio/wow.mp3');
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    let chunks = []; // byte array
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            $("#audio_load").css({ display: "none" });
            let chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for (let chunk of chunks) {
                chunksAll.set(chunk, position); //
                position += chunk.length;
            }
            audioBuffer = await audioCtx.decodeAudioData(chunksAll.buffer);
            initAudio();
            addEvent(document, 'visibilitychange', () => {
                if (document.visibilityState == 'hidden') { //leave page
                    if (audioStatus == "play") {
                        sourceNode.stop();
                        audioStatus = "stop";
                        gainNode.disconnect(0);
                        sourceNode.disconnect(0);
                    }
                } else if (document.visibilityState == 'visible') { //back page
                    if (gameStart && gainNode && audioCtx) {
                        initAudio();
                        audiofadeIn();
                    }
                }
            });
            audioFinished = true;
            if (delayTapToStart) {
                tapToStart();
            }
            break;
        }
        chunks.push(value);
        receivedLength += value.length;
        if (delayTapToStart) {
            $("#audio_load").animate({ width: (receivedLength / contentLength * 100) + "%" }, 100, () => $("#audio_load").css({ display: "block", width: (receivedLength / contentLength * 100) + "%" }));
        }
    }
}

function initAudio() {
    sourceNode = audioCtx.createBufferSource();
    gainNode = audioCtx.createGain();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

function bindEvent(elem, func) {
    if (isMobile) {
        elem.css("touch-action", "auto");
        addEvent(elem[0], "touchstart", e => {
            func(elem, e.touches[0].clientX, e.touches[0].clientY);
            addEvent(document, "touchmove", mousemove, true);
            addEvent(document, "touchend", mouseup, true);
            function mouseup() {
                removeEvent(document, "touchmove", mousemove, true);
                removeEvent(document, "touchend", mouseup, true);
            }
            function mousemove(e) {
                func(elem, e.touches[0].clientX, e.touches[0].clientY);
                preventDefault(e);
            }
        });
    } else {
        addEvent(elem[0], "mousedown", e => {
            func(elem, e.clientX, e.clientY);
            addEvent(document, "mousemove", mousemove);
            addEvent(document, "mouseup", mouseup);
            function mouseup() {
                removeEvent(document, "mousemove", mousemove);
                removeEvent(document, "mouseup", mouseup);
            }
            function mousemove(e) {
                func(elem, e.clientX, e.clientY);
                preventDefault(e);
            }
        });
    }
}

function setSlider(elem, x) {
    let sliderRect = elem[0].getBoundingClientRect();
    percent = 0;
    if (x - sliderRect.left <= sliderBorder + pointerRadius) {
        $("#pointer").css("left", "5px");
        percent = 0;
    } else if (x - sliderRect.left >= sliderWidth - pointerRadius - sliderBorder) {
        $("#pointer").css("left", (sliderWidth - pointerRadius * 2 - 5) + "px");
        percent = 1;
    } else {
        $("#pointer").css("left", (x - sliderRect.left - pointerRadius) + "px");
        percent = (x - sliderRect.left - pointerRadius - sliderBorder) / (sliderWidth - pointerRadius - sliderBorder * 2);
    }
    if (curTool == Tools.Pen) {
        penPercent = percent;
        penSize = (penPercent * pointerMaxSize) > 1 ? (penPercent * pointerMaxSize) : 1;
    } else if (curTool == Tools.Eraser) {
        eraserPercent = percent;
        eraserSize = (eraserPercent * pointerMaxSize) > 1 ? (eraserPercent * pointerMaxSize) : 1;
    }
}

function setSliderPointer(value) {
    let x = 0;
    if (value <= 0) {
        x = 5;
    } else if (value >= 1) {
        x = sliderWidth - pointerRadius * 2 - 5;
    } else {
        x = value * (sliderWidth - pointerRadius - sliderBorder * 2) + sliderBorder;
    }
    $("#pointer").animate({ "left": (x + "px") }, 200);
}