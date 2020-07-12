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

show_lines_by_points = function (points, color) {
    for (var i = 0; i < points.length - 1; i++) {
        scene.add(get_line(points[i], points[i + 1], color))
    }
}

function Square(left_up, right_bottom) {
    this.left_up = left_up
    this.right_bottom = right_bottom
    this.width = right_bottom.x - left_up.x
    this.height = right_bottom.y - left_up.y
    this.points = [left_up, new THREE.Vector2(right_bottom.x, left_up.y), right_bottom, new THREE.Vector2(left_up.x, right_bottom.y), left_up]

    return this
}

random_two_long_dis_points_in_square = function (square) {

    function random_in_two_range(r) {
        if (r)
            return Math.random() * 0.2
        else
            return Math.random() * 0.2 + 0.8
    }

    var r1 = Math.round(Math.random())
    var r2 = Math.round(Math.random())
    var p1 = new THREE.Vector2(square.left_up.x + random_in_two_range(r1) * square.width, square.left_up.y + random_in_two_range(r2) * square.height)
    var p2 = new THREE.Vector2(square.left_up.x + random_in_two_range(1 - r1) * square.width, square.left_up.y + random_in_two_range(1 - r2) * square.height)

    return [p1, p2]
}

random_point_in_square = function (square) {
    return new THREE.Vector2(square.left_up.x + Math.random() * square.width, square.left_up.y + Math.random() * square.height)
}

extend_points = function (points) {
    var extended_points
    for (var times = 0; times < 2; times++) {
        extended_points = []
        for (var i = 0; i < points.length - 1; i++) {
            extended_points.push(points[i])
            extended_points.push(random_point_in_square(new Square(new THREE.Vector2(Math.min(points[i].x, points[i + 1].x), Math.min(points[i].y, points[i + 1].y)), new THREE.Vector2(Math.max(points[i].x, points[i + 1].x), Math.max(points[i].y, points[i + 1].y)))))
        }
        extended_points.push(points[points.length - 1])
        points = extended_points
    }
    return extended_points
}

transform_points = function (points, transform_matrix) {
    var transformed_points = []
    for (var p of points) {
        var p_copy = p.clone()
        p_copy.applyMatrix3(transform_matrix)
        transformed_points.push(p_copy)
    }
    return transformed_points
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

    show_lines_by_points(extended_points, endpoint_1_color);
    show_lines_by_points(square.points, endpoint_1_color);
    show_lines_by_points(transformed_square_points, endpoint_2_color);
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
        done = false
        paint_points = []
        scene = new THREE.Scene()
        show_lines_by_points(extended_points, endpoint_1_color);
        show_lines_by_points(square.points, endpoint_1_color);
        show_lines_by_points(transformed_square_points, endpoint_2_color);
    }
}
init_canvas();
render();


document.body.appendChild(renderer.domElement);

window.onclick = window_onclick;
window.onkeypress = window_onkeypress;
window.onresize = init_canvas;

give_a_test()
