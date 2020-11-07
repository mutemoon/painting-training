width = window.innerWidth;
height = window.innerHeight;


var selected_faces = []

select_color = document.createElement("div");
select_color.style.position = "absolute"
select_color.style.width = (width / 10).toString() + "px"
select_color.style.top = "30px"
select_color.style.left = "50px"
select_color.hidden = true

for (var i = 10; i >= 0; i--)
{
    color = document.createElement("img");
    color.style.enabled = "false"
    color.style.width = (width / 10).toString() + "px"
    color.style.height = (height / 20).toString() + "px"
    color.style.background = "#" + new THREE.Color(i / 10, i / 10, i / 10).getHexString()
    color.addEventListener("mousedown", function(e){
        for (var face of selected_faces)
        {
            face.color.setStyle(e.target.style.background)
            console.log(e.target.style.background)
            sphere.geometry.colorsNeedUpdate = true
            select_color.hidden = true
        }
        selected_faces = []
    }, false)
    select_color.appendChild(color)
}

document.body.appendChild(select_color);
scene = new THREE.Scene();
scene2 = new THREE.Scene();

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

renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;


renderer_2.domElement.style.position = "absolute"
document.body.appendChild(renderer_2.domElement);
document.body.appendChild(renderer.domElement);


light_position = new THREE.Vector3(0, 10, 10)

var light = new THREE.DirectionalLight(0xffffff);
light.position.copy(light_position);
scene2.add(light);

var light = new THREE.DirectionalLight(0xffffff);
light.position.copy(light_position);
scene.add(light);



var endpoint_1_color = 0xff5050;
var endpoint_2_color = 0x5050ff;
var background_1_color = 0x222222;
var background_2_color = 0x555555;

init_canvas = function () {
    width = window.innerWidth
    height = window.innerHeight

    renderer.setSize(width, height);
    renderer_2.setSize(width / 7, width / 7);
    renderer.setClearColor(background_1_color, 1);
    renderer_2.setClearColor(background_2_color, 1);

    camera.aspect = width / height
    camera.updateProjectionMatrix();
}

function render() {
    clip()
    renderer.render(scene, camera);
    renderer_2.render(scene2, camera_2)
    requestAnimationFrame(render);
}

init_canvas();


render();

var sphere

function find_faces_in_one_edge(faces, target_face) {
    var target_faces = [target_face]
    var result_faces = [target_face]


    function find_surround_faces_in_one_edge(faces, target_face) {
        var result_surround_faces = []

        function is_face_to_face(face1, face2) {
            result = 0
            if (face1.a == face2.a || face1.a == face2.b || face1.a == face2.c) {
                result++
            }
            if (face1.b == face2.a || face1.b == face2.b || face1.b == face2.c) {
                result++
            }
            if (face1.c == face2.a || face1.c == face2.b || face1.c == face2.c) {
                result++
            }
            if (result == 2) {
                return true
            }
            else {
                return false
            }
        }

        for (var face of faces) {
            if (result_faces.indexOf(face) < 0) {
                if (is_face_to_face(face, target_face)) {
                    if (face.normal.angleTo(target_face.normal) < 0.00001) {
                        result_surround_faces.push(face)
                    }
                }
            }
        }
        return result_surround_faces
    }

    while (target_faces.length > 0) {

        result_faces = result_faces.concat(find_surround_faces_in_one_edge(faces, target_faces.pop()))

    }
    return result_faces
}

function clip() {
    if (!sphere) {
        var geometry = new THREE.SphereGeometry(1, 100, 100)
        var material = new THREE.MeshPhongMaterial({ shininess: 100 })
        sphere = new THREE.Mesh(geometry, material);
        scene2.add(sphere);

        var geometry = new THREE.SphereGeometry(2, 10, 20);
        var edge = new THREE.EdgesGeometry(geometry);
        var edge_material = new THREE.LineBasicMaterial({ color: 0x000000 });
        edge_lines = new THREE.LineSegments(edge, edge_material);
        sphere = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, shading: THREE.FlatShading, }));
        scene.add(edge_lines)
        scene.add(sphere);


        mouse = new THREE.Vector2()
        raycaster = new THREE.Raycaster();
        onMouseDown = function (e) {
            mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
            mouse.y = - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            intersects = raycaster.intersectObject(sphere);
            if (intersects.length > 0) {
                console.log(intersects[0])
                selected_faces = find_faces_in_one_edge(sphere.geometry.faces, intersects[0].face)
                select_color.hidden = false
                select_color.style.top = (e.clientY - select_color.children[5].offsetTop - select_color.children[5].offsetHeight / 2).toString() + "px"
                select_color.style.left = (e.clientX + 10).toString() + "px"
            }
        }
        renderer.domElement.addEventListener("mousedown", onMouseDown, false)

        
    }
}


function showAnswer() {
    for (var face of sphere.geometry.faces) {
        var angle_factor = face.normal.dot(light.position) > 0 ? Math.tan(face.normal.angleTo(light.position)) * 10 : 10
        face.color.setHSL(0, 0, 1 - (Math.round(angle_factor) / 10))
        sphere.geometry.colorsNeedUpdate = true
    };
}

showAnswer()