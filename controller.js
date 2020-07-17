function init_controller() {

    params = {
        color: 0xffffff,
        x轴旋转: 0,
        y轴旋转: 0,
        z轴旋转: 0,
        法向移动: 0,
        看向x轴: function () {
            var t = new THREE.Vector3(0, camera.position.y, camera.position.z)
            camera.lookAt(t)
            controls.target = t
        },
        看向y轴: function () {
            var t = new THREE.Vector3(camera.position.x, 0, camera.position.z)
            camera.lookAt(t)
            controls.target = t
        },
        看向z轴: function () {
            var t = new THREE.Vector3(camera.position.x, camera.position.y, 0)
            camera.lookAt(t)
            controls.target = t
        },
    };
    gui = new GUI();
    folder = gui.addFolder("复位摄像机")
    folder.addColor(params, 'color')
        .onChange(function () {
            material.color.set(params.color);
        });


    folder.add(params, "看向x轴");
    folder.add(params, "看向y轴");
    folder.add(params, "看向z轴");

    folder = gui.addFolder("控制截面")

    folder.add(params, 'x轴旋转', -90, 90)
        .onChange(function () {
            cplane.normal = new THREE.Vector3(0,1,0).applyEuler(new THREE.Euler(params.x轴旋转 / 180 * Math.PI,params.y轴旋转 / 180 * Math.PI,params.z轴旋转 / 180 * Math.PI))
        });

    folder.add(params, 'y轴旋转', -90, 90)
        .onChange(function () {
            cplane.normal = new THREE.Vector3(0,1,0).applyEuler(new THREE.Euler(params.x轴旋转 / 180 * Math.PI,params.y轴旋转 / 180 * Math.PI,params.z轴旋转 / 180 * Math.PI))

        });

    folder.add(params, 'z轴旋转', -90, 90)
        .onChange(function () {
            cplane.normal = new THREE.Vector3(0,1,0).applyEuler(new THREE.Euler(params.x轴旋转 / 180 * Math.PI,params.y轴旋转 / 180 * Math.PI,params.z轴旋转 / 180 * Math.PI))
        });

    folder.add(params, '法向移动', -8, 8)
        .onChange(function () {
            cplane.constant = params.法向移动;
        });


    gui.open();
    folder.open()
}


init_controller()
controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.addEventListener( 'change', render );

