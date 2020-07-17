width = window.innerWidth;
height = window.innerHeight;


scene = new THREE.Scene();
scene_2 = new THREE.Scene();

var women;

ll = 500
// camera = new THREE.OrthographicCamera(-ll, -ll, ll, ll, 0.1, 1000)
camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 10000)
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);


ll = 5
camera_2 = new THREE.OrthographicCamera(-ll, ll, ll, -ll, -10, 1000)


renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true
});
renderer_2 = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true
});

renderer_2.domElement.style.position = "absolute"
document.body.appendChild(renderer_2.domElement);
document.body.appendChild(renderer.domElement);

light = new THREE.PointLight(0xcccccc);
light.position.set(-1, -1, -1);
scene.add(light);
light = new THREE.PointLight(0xcccccc);
light.position.set(1, 1, 1);
scene.add(light);
light = new THREE.AmbientLight(0x444444);
scene.add(light);
light = new THREE.AmbientLight(0x444444);
scene_2.add(light);

// clipHelpers = new THREE.Group();
// clipHelpers.add(new THREE.AxesHelper(20));
// globalPlanes = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)];
// clipHelpers.add(new THREE.PlaneHelper(globalPlanes[0], 20, 0xff0000));
// clipHelpers.visible = true;
// scene.add(clipHelpers);

// renderer.clippingPlanes = globalPlanes; // 显示剖面
// renderer.localClippingEnabled = true;


var endpoint_1_color = 0xff5050;
var endpoint_2_color = 0x5050ff;
var background_color = 0x222222;

init_canvas = function () {
    width = window.innerWidth
    height = window.innerHeight

    renderer.setSize(width, height);
    renderer_2.setSize(width / 5, width / 5);
    renderer.setClearColor(background_color, 1);
    renderer_2.setClearColor(0xffffff, 1);

    camera.aspect = width / height


    // camera.rotateZ(Math.PI)
    camera.updateProjectionMatrix();
}

function render() {
    clip()
    renderer.render(scene, camera);
    renderer_2.render(scene_2, camera_2)
    requestAnimationFrame(render);
}

var square = null;
var extended_points = null;
var transformed_square_points = null;
var transformed_extend_points = null;

give_a_test = function () {
    scene = new THREE.Scene()

    square = new Square(new THREE.Vector2(width / 2 - 150, height / 2 - 100), new THREE.Vector2(width / 2 + 150, height / 2 + 100))

    var points = random_two_long_dis_points_in_square(square);
    points.push(points[0])

    extended_points = extend_points(points)
    var transform_matrix = new THREE.Matrix3()
    transform_matrix.setUvTransform(0, 0, Math.random() * 2, Math.random() * 2, (Math.random() - 0.5) * Math.PI, (width / 2) + (Math.random() - 0.5) * square.width, (height / 2) + (Math.random() - 0.5) * square.height)
    transformed_square_points = transform_points(square.points, transform_matrix)
    transformed_extend_points = transform_points(extended_points, transform_matrix)


    square.points = move_points(square.points, -square.left_up.x, -square.left_up.y)
    extended_points = move_points(extended_points, -square.left_up.x, -square.left_up.y)

    show_lines_by_points(extended_points, endpoint_1_color);
    show_lines_by_points(square.points, endpoint_1_color);
    show_lines_by_points(transformed_square_points, endpoint_2_color);
    show_lines_by_points([transformed_square_points[0], transformed_square_points[1]], endpoint_1_color);
}

var paint_points = []

window_onclick = function (e) {
    if (paint_points.length < extended_points.length) {
        paint_points.push(new THREE.Vector2(e.clientX, e.clientY))
    }

    if (paint_points.length > 1) {
        scene.add(get_line(paint_points[paint_points.length - 1], paint_points[paint_points.length - 2], 0x00ff00))
    }
}

window_onkeypress = function (e) {
    if (e.key == " ") {
        show_lines_by_points(transformed_extend_points, endpoint_2_color);
    }
    if (e.key == "g") {
        paint_points = []
        give_a_test()
    }
    if (e.key == "r") {
        scene_2 = new THREE.Scene()
        var geometry = new THREE.BufferGeometry()
        var attr = new THREE.BufferAttribute(new Float32Array([]), 3)
        geometry.attributes.position = attr
        var material = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 0.01
        });
        clip_points = new THREE.Points(geometry, material);
        scene_2.add(clip_points);
    }
    if (e.key == "s") {
        var geometry = new THREE.BufferGeometry()
        var attr = new THREE.BufferAttribute(new Float32Array([]), 3)
        geometry.attributes.position = attr
        var material = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 0.01
        });
        clip_points = new THREE.Points(geometry, material);
        scene_2.add(clip_points);
    }
}
init_canvas();
render();


var loader = new THREE.OBJLoader();
var women
// 没有材质文件，系统自动设置Phong网格材质
loader.load('./obj/women1.obj', function (obj) {
    women = obj
    women.children[0].geometry.scale(10, 10, 10)
    scene.add(women);

    cplane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    // renderer.clippingPlanes = [cplane]
    plane_helper = new THREE.PlaneHelper(cplane, 5, 0xff0000)
    scene.add(plane_helper);

    clip_points = clip_points_object([]);
    clip_points_1 = clip_points_object([])    
    scene.add(clip_points_1)
    scene_2.add(clip_points);
})


// window.onclick = window_onclick;
window.onkeypress = window_onkeypress;
window.onresize = init_canvas;

// give_a_test()


function clip() {
    if (women) {
        camera_2.lookAt(0, 0, 0);
        camera_2.position.set(cplane.normal.x * 10, cplane.normal.y * 10, cplane.normal.z * 10);
        cpoints = []
        var ps = women.children[0].geometry.attributes.position.array.slice()

        for (var i = 0; i < ps.length; i += 9) {
            var cpoint = new THREE.Vector3()
            cplane.intersectLine(new THREE.Line3(new THREE.Vector3(ps[i], ps[i + 1], ps[i + 2]), new THREE.Vector3(ps[i + 3], ps[i + 4], ps[i + 5])), cpoint)
            if (!cpoint.equals(new THREE.Vector3())) {
                cpoints.push(cpoint.x)
                cpoints.push(cpoint.y)
                cpoints.push(cpoint.z)
            }
            cpoint = new THREE.Vector3()
            cplane.intersectLine(new THREE.Line3(new THREE.Vector3(ps[i], ps[i + 1], ps[i + 2]), new THREE.Vector3(ps[i + 6], ps[i + 7], ps[i + 8])), cpoint)
            if (!cpoint.equals(new THREE.Vector3())) {
                cpoints.push(cpoint.x)
                cpoints.push(cpoint.y)
                cpoints.push(cpoint.z)
            }
            cpoint = new THREE.Vector3()
            cplane.intersectLine(new THREE.Line3(new THREE.Vector3(ps[i + 3], ps[i + 4], ps[i + 5]), new THREE.Vector3(ps[i + 6], ps[i + 7], ps[i + 8])), cpoint)
            if (!cpoint.equals(new THREE.Vector3())) {
                cpoints.push(cpoint.x)
                cpoints.push(cpoint.y)
                cpoints.push(cpoint.z)
            }
        }

        clip_points.geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(cpoints), 3)
        clip_points_1.geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(cpoints.slice()), 3)
    }
}

function clip_points_object(arr)
{
    var geometry = new THREE.BufferGeometry()
    var attr = new THREE.BufferAttribute(new Float32Array(arr), 3)
    geometry.attributes.position = attr
    var material = new THREE.PointsMaterial({
        color: 0xff0000,
        size: 0.01
    });
    clip_points = new THREE.Points(geometry, material);
    return clip_points
}