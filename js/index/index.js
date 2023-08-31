var dotScreenShader, composer, modelLoadFin, mouseY, cameraValue, renderer, camera, scene, gui, stats, directionalLight, control, group, panel, isMobile, isIOS, cameraZ, canvasjq, canvas, context, scaleLimit, stippleTimer;
const CameraConfig = {
    pc: {
        factor: 55,
        scale: 2700,
    },
    mobile: {
        factor: 15,
        scale: 400,
    }
};
// const models = ["miku", "teto", "rin", "momo", "len", "luka"];
$(document).ready(() => enterPage());
async function enterPage() {
    initData();
    initThree();
    initDomComponent();
    window.onresize = onWindowResize;
}

function initData() {
    scaleLimit = 1.2;
    isMobile = Utils.checkDeviceType(navigator.userAgent).isMobile;
    cameraValue = isMobile ? CameraConfig.mobile : CameraConfig.pc;
}

function initDomComponent() {
    panel = $("#main_view");
    modelControler(window.innerWidth / 2, window.innerHeight / 2);
    if (isMobile) {
        panel[0].addEventListener("touchstart", function(e) {
            modelControler(e.touches[0].clientX, e.touches[0].clientY);
            // initModel();
        });
    } else {
        panel.mousemove(function(e) {
            modelControler(e.clientX, e.clientY);
        });
    }
}

// TODO:移动端需要使用陀螺仪
function modelControler(x, y) {
    mouseY = y - window.innerHeight;
    let ca = camera.aspect < 1 ? 1 : camera.aspect;
    if (ca < scaleLimit) {
        cameraZ = (1 - ca + mouseY / cameraValue.scale) * cameraValue.factor;
    } else {
        cameraZ = (1 - scaleLimit + mouseY / cameraValue.scale) * cameraValue.factor;
    }
    // rgbshiftShader.uniforms['amount'].value = 0.03 * mouseY / window.innerHeight;
}

function initThree() {
    initRender();
    initScene();
    initCamera();
    initLight();
    initModel();
    postProcess();
    rendererUpdate(); //加载完成后再开始旋转
}

function postProcess() {
    composer = new THREE.EffectComposer(renderer);
    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    //后处理 点刻灰度图
    dotScreenShader = new THREE.ShaderPass(THREE.DotScreenShader);
    dotScreenShader.uniforms['scale'].value = 0.57;
    dotScreenShader.uniforms['angle'].value = -1.1;
    dotScreenShader.uniforms['tSize'].value = new THREE.Vector2(1024 * camera.aspect, 1024);
    composer.addPass(dotScreenShader);
    // 亮度 对比度
    let brightnessContrastShader = new THREE.ShaderPass(THREE.BrightnessContrastShader);
    brightnessContrastShader.uniforms['brightness'].value = 0.5;
    // console.log(brightnessContrastShader);
    composer.addPass(brightnessContrastShader);
    // rgb分离
    // rgbshiftShader = new THREE.ShaderPass(THREE.RGBShiftShader);
    // composer.addPass(rgbshiftShader);
}

function initRender() {
    canvasjq = $("#m_canvas");
    canvas = canvasjq[0];
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
    });
    renderer.setClearColor(0xffffff); //为渲染器设置颜色
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasjq.css({
        float: "left",
        top: "0",
        left: "0",
        position: "absolute",
        "z-index": "-10",
    });
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.set(0, 0, 0);
    camera.lookAt(scene.position);
    if (camera.aspect < scaleLimit) {
        cameraZ = (1 - camera.aspect) * cameraValue.factor;
    } else {
        cameraZ = (1 - scaleLimit) * cameraValue.factor;
    }
}

function initScene() {
    scene = new THREE.Scene();
}

function initLight() {
    scene.add(new THREE.AmbientLight("#ffffff"));
}

function initModel() {
    modelLoadFin = false;
    group = new THREE.Group();
    var geometry = new THREE.BoxGeometry(18, 18, 18)
    var material = new THREE.MeshLambertMaterial({ color: 0xd0d0d0, wireframe: false, transparent: true, opacity: 0, });
    var box = new THREE.Mesh(geometry, material);
    group.add(box);
    box.position.set(0, -14.7, 0);
    box.visible = false;
    // let idx = localStorage.getItem("modelIndex");
    // if (idx == null) {
    //     idx = 0;
    // } else {
    //     idx++;
    // }
    // idx = idx >= models.length ? 0 : idx;
    // localStorage.setItem("modelIndex", idx);
    // let model = models[idx];
    //创建MTL加载器
    var mtlLoader = new THREE.MTLLoader();
    //设置文件路径
    let path = './data/model/box_miku/';
    mtlLoader.setPath(path);
    //加载mtl文件
    mtlLoader.load('box_miku.mtl', function(material) {
        //创建OBJ加载器
        var objLoader = new THREE.OBJLoader();
        // objLoader.transparent = true;
        //设置当前加载的纹理
        // console.log(material);
        material.transparent = true;
        material.side = THREE.FrontSide;
        // $.each(material.materialsInfo, function(k, v) {
        //     console.log(k, v);
        //     v.map_kd = "tex_gray.png"
        // });
        // material.color = new THREE.Color(0xff0000);
        objLoader.setMaterials(material);
        objLoader.setPath(path);

        function setopacity(o, v, b) {
            for (let i = 0; i < o.children[0].material.length; i++) {
                let m = o.children[0].material[i];
                if (b) {
                    m.transparent = true;
                }
                m.opacity = v;
            }
        }
        objLoader.load('box_miku.obj', function(object) {
            // console.log(object);
            object.visible = false;
            object.scale.set(3, 3, 3);
            object.transparent = true;
            object.name = 'miku';
            group.add(object);
            object.position.set(0, -6, 0);
            var t = new TWEEN.Tween(0).to(1, 1000).onUpdate(function(v) {
                setopacity(object, v);
                box.material.opacity = v;
            }).onComplete(function() {
                setopacity(object, 1);
                box.material.opacity = 1;
                t.stop();
            }).onStart(function() {
                setopacity(object, 0, true);
                object.visible = true;
                box.material.opacity = 0;
                box.visible = true;
            }).start();
            modelLoadFin = true;
        }, function(event) {
            // if (event.lengthComputable) {
            //     console.log("now process : " + event.loaded / event.total * 100 + "%");
            // }
        })
    });
    scene.add(group);
    group.position.set(0, -10, -50);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    dotScreenShader.uniforms['tSize'].value = new THREE.Vector2(1024 * camera.aspect, 1024);
    let ca = camera.aspect < 1 ? 1 : camera.aspect;
    if (ca < scaleLimit) {
        cameraZ = (1 - ca + mouseY / cameraValue.scale) * cameraValue.factor;
    } else {
        cameraZ = (1 - scaleLimit + mouseY / cameraValue.scale) * cameraValue.factor;
    }
}

function rendererUpdate() {
    composer.render();
    requestAnimationFrame(rendererUpdate);
    if (modelLoadFin) {
        group.rotation.y += 0.015;
    }
    if (Math.abs(camera.position.z - cameraZ) > 0.01) {
        camera.position.z = Utils.lerp(camera.position.z, cameraZ, 0.2);
    } else {
        camera.position.z = cameraZ;
    }
    TWEEN.update();
}