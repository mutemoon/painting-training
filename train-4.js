function TestObject(geometry) {
    this.mesh = new THREE.Mesh(geometry, test_object_material);
    var edge_lines = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edge_material);
    this.mesh.add(edge_lines)
    scene.add(this.mesh)
    test_objects.push(this.mesh)
}

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

function dispose(parent, child) {
    if (child.children.length) {
        let arr = child.children.filter(x => x);
        arr.forEach(a => {
            dispose(child, a)
        })
    }
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
        child.geometry.dispose();
    } else if (child.material) {
        child.material.dispose();
    }
    child.remove();
    parent.remove(child);
}

function init_canvas() {
    width = document.getElementsByClassName("main-content")[0].offsetWidth
    height = window.innerHeight - document.getElementsByClassName("main-content")[0].offsetHeight

    parent_element = document.getElementsByClassName("main-content")[0]
    mouse = new THREE.Vector2()
    raycaster = new THREE.Raycaster();
    showAnswer = false
    selected_faces = []
    selected_object = null
    light_position = null

    background_1_color = 0xcccccc;
    background_2_color = 0xcccccc;

    test_objects = []

    test_type_info = [[[function () { return new THREE.PlaneGeometry(Math.random() * 3, Math.random() * 3) }, 1]],
    [[function () { return new THREE.PlaneGeometry(Math.random() * 3, Math.random() * 3) }, 3]],
    [[function () { return new THREE.SphereGeometry(Math.random() * 3, Math.random() * 3, Math.random() * 3) }, 1]],
    [[function () { return new THREE.SphereGeometry(Math.random() * 3, Math.random() * 3, Math.random() * 3) }, 3]],
    [[function () { return new THREE.BoxGeometry(Math.random() * 3, Math.random() * 3, Math.random() * 3) }, 1]],
    [[function () { return new THREE.BoxGeometry(Math.random() * 3, Math.random() * 3, Math.random() * 3) }, 3]],
    [[function () { return new THREE.BoxGeometry(Math.random() * 3, Math.random() * 3, Math.random() * 3) }, 3], [function () { return new THREE.SphereGeometry(Math.random() * 3, Math.random() * 5, Math.random() * 10) }, 3]],
    ]

    test_object_material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors })
    edge_material = new THREE.LineBasicMaterial({ color: 0xff3355 });

    scene = new THREE.Scene();
    scene2 = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 10000)
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    camera_2 = new THREE.PerspectiveCamera(90, 1, 0.001, 10000)
    camera_2.position.set(0, 0, 5);
    camera_2.lookAt(0, 0, 0);

    select_color = document.createElement("div");
    select_color.style.position = "absolute"
    select_color.style.width = (width / 10).toString() + "px"
    select_color.style.top = "30px"
    select_color.style.left = "50px"
    select_color.hidden = true
    for (var i = 10; i >= 0; i--) {
        color = document.createElement("img");
        color.style.enabled = "false"
        color.style.width = (width / 10).toString() + "px"
        color.style.height = (height / 20).toString() + "px"
        color.style.background = "#" + new THREE.Color(i / 10, i / 10, i / 10).getHexString()
        color.addEventListener("mousedown", function (e) {
            for (var face of selected_faces) {
                face.color.setStyle(e.target.style.background)
                face["answer"] = new THREE.Color(0, 0, 0).copy(face.color)
                selected_object.geometry.colorsNeedUpdate = true
                select_color.hidden = true
            }
            selected_faces = []
        }, false)
        select_color.appendChild(color)
    }
    parent_element.appendChild(select_color);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer2 = new THREE.WebGLRenderer({ antialias: true });
    renderer2.domElement.style.border = "3px solid #ff3355"
    renderer2.domElement.style.position = "absolute"
    renderer2.domElement.style.right = "0"

    renderer.setSize(width, height);
    renderer2.setSize(width / 7, width / 7);
    renderer.setClearColor(background_1_color, 1);
    renderer2.setClearColor(background_2_color, 1);

    render = function () {
        renderer.render(scene, camera);
        renderer2.render(scene2, camera_2)
        requestAnimationFrame(render);
    }
    render();

    parent_element.appendChild(renderer2.domElement);
    parent_element.appendChild(renderer.domElement);

    renderer.domElement.addEventListener("mousedown", function (e) {
        mouse.x = (e.offsetX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (e.offsetY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(test_objects)
        if (intersects.length > 0) {
            selected_object = intersects[0].object
            selected_faces = find_faces_in_one_edge(selected_object.geometry.faces, intersects[0].face)
            select_color.hidden = false
            select_color.style.top = (e.offsetY < (height - select_color.offsetHeight) ? e.offsetY + 95 : e.offsetY - (select_color.offsetHeight - 95)).toString() + "px"
            select_color.style.left = (e.offsetX + 10).toString() + "px"
        }
    })

    document.getElementById("showHideAnswer").onclick = showHideAnswer

    var as = document.getElementsByClassName("S");
    for (var i = 0; i < as.length; i++) {
        as[i].addEventListener("mousedown", function (e) {
            for (var i = 0; i < as.length; i++) {
                as[i].parentElement.removeAttribute("class")
            }
            as[e.target.classList[1]].parentElement.className = "current"

            give_test(e.target.classList[1])
        })
    }

    sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 100, 100), new THREE.MeshPhongMaterial({ shininess: 0 }));
    scene2.add(sphere);
}

function give_test(test_type) {
    clear_canvas()
    light_position = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5)
    light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.copy(light_position);
    scene.add(light1);
    light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.copy(light_position);
    scene2.add(light2);

    light_help = new THREE.ArrowHelper(light_position.normalize(), new THREE.Vector3(0,0,0),3)
    scene2.add(light_help)

    for (var i = 0; i < test_type_info[test_type].length; i++) {
        for (var j = 0; j < test_type_info[test_type][i][1]; j++) {
            var geometry = test_type_info[test_type][i][0]();
            geometry.translate(Math.random() * 3 - 1.5, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5)
            new TestObject(geometry)
        }
    }
}

function showHideAnswer() {
    showAnswer = !showAnswer
    if (showAnswer) {
        for (var test_object of test_objects) {
            for (var face of test_object.geometry.faces) {
                var angle_factor = face.normal.dot(light_position) > 0 ? face.normal.normalize().dot(light_position.normalize()) * 10 : 0
                face.color.setHSL(0, 0, Math.round(angle_factor) / 10)
                test_object.geometry.colorsNeedUpdate = true
            }
        }
    } else {
        for (var test_object of test_objects) {
            for (var face of test_object.geometry.faces) {
                if (face.hasOwnProperty("answer")) {
                    face.color.copy(face.answer)
                    test_object.geometry.colorsNeedUpdate = true
                }
                else {
                    face.color.setHSL(0, 0, 1)
                    test_object.geometry.colorsNeedUpdate = true
                }
            }
        }
    }
}

function clear_canvas() {

    for (var i = 0; i < test_objects.length; i++) {
        dispose(scene, test_objects[i])
    }
    test_objects = []


    if (light_position) {
        dispose(scene, light1)
        dispose(scene2, light2)
        dispose(scene2, light_help)
    }
}

init_canvas()
give_test(6)