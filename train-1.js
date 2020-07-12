var width = window.innerWidth; //窗口宽度
var height = window.innerHeight; //窗口高度

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera();;
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true
});

var endpoint_1_color = 0xff5050;
var endpoint_2_color = 0x5050ff;

// 已知消失点1，待找消失点2
var endpoint_1 = null;
var endpoint_2 = null;

var point_1 = null
var point_2 = null

init_canvas = function () {
    width = window.innerWidth
    height = window.innerHeight

    renderer.setSize(width, height); // 重置渲染器输出画布canvas尺寸
    renderer.setClearColor(0xffffff, 1); //设置背景颜色
    // 重置相机投影的相关参数
    var k = width / height;
    var s = height / 2;
    camera.left = -s * k;
    camera.right = s * k;
    camera.top = s;
    camera.bottom = -s;
    camera.position.set(width / 2, height / 2, -100);
    camera.lookAt(width / 2, height / 2, 0);
    camera.rotateZ(Math.PI)
    camera.updateProjectionMatrix();
}

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

show_two_line = function (point) {
    var len = (Math.random() + 1) / 2;
    for (let i = 0; i < 2; i++) {
        let x = Math.random();
        let y = Math.random();
        let len_ = Math.sqrt(Math.pow((point[0] - x), 2) + Math.pow((point[1] - y), 2))
        let x_end = x + (len / len_ * (point[0] - x))
        let y_end = y + (len / len_ * (point[1] - y))
        show_line([x, y], [x_end, y_end], 0x000000, 1)
    }
}

get_line = function (start, end, color) {
    let ma = new THREE.LineBasicMaterial({
        color: color,
    })
    let line = new THREE.BufferGeometry();
    line.attributes.position = new THREE.BufferAttribute(new Float32Array([
        start.x, start.y, 0,
        end.x, end.y, 0,
    ]), 3);
    return new THREE.Line(line, ma);
}

random_logit_point = function () {
    var angle_x = (Math.random() - 0.5) * Math.PI;
    var angle_y = (Math.random() - 0.5) * Math.PI;
    return new THREE.Vector2(Math.tan(angle_x), Math.tan(angle_y));
}

random_constraint_logit_point = function (constraint) {
    var angle_x = (Math.random() - 0.5) * (constraint / 90) * Math.PI;
    var angle_y = (Math.random() - 0.5) * (constraint / 90) * Math.PI;
    return new THREE.Vector2(Math.tan(angle_x), Math.tan(angle_y));
}

transform_to_point = function (v) {
    var a = new THREE.Vector2(v.x, v.y)
    return a.multiplyScalar(height / 2).add(new THREE.Vector2(width / 2, height / 2));
}

transform_to_logit_point = function (v) {
    var a = new THREE.Vector2(v.x, v.y)
    return a.sub(new THREE.Vector2(width / 2, height / 2)).divideScalar(height / 2);
}

show_lines = function (ls) {
    for (l of ls) {
        var start = transform_to_point(l[0])
        var end = transform_to_point(l[1])
        console.log(l, l[0], start)
        scene.add(get_line(start, end, l[2]))
    }
}

give_a_test = function () {
    scene = new THREE.Scene()

    var lines = [];

    // 已知消失点1，待找消失点2
    endpoint_1 = random_logit_point();
    endpoint_2 = new THREE.Vector2(random_logit_point().x, endpoint_1.y)

    // 随机两条线段指向消失点1
    lines.push([endpoint_1, random_constraint_logit_point(40), endpoint_1_color]);
    lines.push([endpoint_1, random_constraint_logit_point(40), endpoint_1_color]);

    // 随机另一条线段
    lines.push([endpoint_2, random_constraint_logit_point(40), endpoint_2_color]);

    show_lines(lines);
}

window_onclick = function (e) {
    if (point_1 && point_2) {
        point_1 = null
        point_2 = null
        give_a_test()
    }
    else if (point_1) {
        var lines = []
        point_2 = transform_to_logit_point(new THREE.Vector2(e.clientX, e.clientY))
        lines.push([point_1, point_2, endpoint_2_color])
        var remote_point = point_1.distanceTo(endpoint_2) > point_2.distanceTo(endpoint_2) ? point_1 : point_2
        lines.push([remote_point, endpoint_2, 0x00ff00])
        show_lines(lines)
    }
    else {
        point_1 = transform_to_logit_point(new THREE.Vector2(e.clientX, e.clientY))
    }
}

init_canvas();
render();


document.body.appendChild(renderer.domElement);

window.onclick = window_onclick;
window.onresize = init_canvas;

give_a_test()
