server_url = "http://192.168.0.101:8000"

width = function () {
  return window.innerWidth - 400
}

height = function () {
  return window.innerHeight - $("#banner").height()
}

canvas_position_to_world_position = function (canvas_position, width, height) {
  return new THREE.Vector3((width / 2) - canvas_position.x, (height / 2) - canvas_position.y, 0)
}

vertices_apply_matrix3 = function (vertices, matrix) {
  for (let i = 0; i < vertices.length; i++) {
    let tmp_vertice = vertices[i].clone()
    tmp_vertice.z = 1
    tmp_vertice.applyMatrix3(matrix)
    tmp_vertice.x = tmp_vertice.x / Math.abs(tmp_vertice.z)
    tmp_vertice.y = tmp_vertice.y / Math.abs(tmp_vertice.z)
    tmp_vertice.z = 0
    vertices[i].copy(tmp_vertice)
  }
}

get_point = function (position, size, color) {
  let geometry = new THREE.Geometry()
  geometry.vertices.push(position.clone())
  let material = new THREE.PointsMaterial({
    color: color,
    size: size
  })
  return new THREE.Points(geometry, material)
}

get_line = function (start, end, color) {
  let geometry = new THREE.Geometry()
  geometry.vertices.push(start.clone(), end.clone())
  let material = new THREE.LineBasicMaterial({
    color: color
  })
  return new THREE.Line(geometry, material)
}

line_to_line3 = function (line) {
  return new THREE.Line3(line.geometry.vertices[0], line.geometry.vertices[1])
}

line_apply_matrix3 = function (line, matrix) {
  vertices_apply_matrix3(line.geometry.vertices, matrix)
  obj.geometry.verticesNeedUpdate = true
}

get_lines_by_vertices = function (vertices, color) {
  let lines = []
  for (let i = 0; i < vertices.length - 1; i++) {
    lines.push(get_line(vertices[i], vertices[i + 1], color))
  }
  return lines
}

set_lines_position_by_vertices = function (lines, vertices) {
  for (let i = 0; i < lines.length; i++) {
    lines[i].geometry.vertices[0].copy(vertices[i])
    lines[i].geometry.vertices[1].copy(vertices[i + 1])
    lines[i].geometry.verticesNeedUpdate = true
  }
}

show_objs = function (scene, objs) {
  for (let i = 0; i < objs.length; i++) {
    scene.add(objs[i])
  }
}

clear_objs = function (scene, objs) {
  for (let i = 0; i < objs.length; i++) {
    objs[i].geometry.dispose()
    scene.remove(objs[i])
  }
}

square_vertices = function (width, height) {
  return [new THREE.Vector3(-width / 2, height / 2, 0), new THREE.Vector3(width / 2, height / 2, 0), new THREE.Vector3(width / 2, -height / 2, 0), new THREE.Vector3(-width / 2, -height / 2, 0), new THREE.Vector3(-width / 2, height / 2, 0)]
}

random_square_vertices = function () {
  let factor = (width() < height() ? width() : height()) / 4
  let w = factor
  let h = factor
  return square_vertices(w, h)
}

random_perspective_matrix3 = function () {
  let factor = function () {
    return Math.random() > 0.5 ? Math.random() : -Math.random()
  }
  let m11 = 1
  let m21 = factor()
  let m22 = 1
  let m12 = factor() - m21

  let m31 = Math.random() > 0.5 ? (Math.random() - 0.5) / 100 : 0
  let m32 = !m31 ? (Math.random() - 0.5) / 100 : Math.random() > 0.5 ? (Math.random() - 0.5) / 100 : 0 //0//1 / 200 - m31
  let tmp_matrix3 = new THREE.Matrix3()
  tmp_matrix3.set(
    m11, m12, 0,
    m21, m22, 0,
    // 1, 0, 0,
    // 0, 1, 0,
    m31, m32, 1
  )
  return tmp_matrix3
}

post_record = function (record_type, record) {
  fetch(server_url + "/postRecord", {
    method: "POST",
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'uid': 1,
      'record_type': record_type,
      'record': record
    })
  }).then(function (data) {
    return data.json()
  }).then(function (data) {})
}


function Square(left_up, right_bottom) {
  this.left_up = left_up
  this.right_bottom = right_bottom
  this.width = right_bottom.x - left_up.x
  this.height = right_bottom.y - left_up.y
  this.vertices = [left_up, new THREE.Vector2(right_bottom.x, left_up.y), right_bottom, new THREE.Vector2(left_up.x, right_bottom.y), left_up]
  return this
}

function Line(start, end, color) {
  this.math_line = new THREE.Line3(start, end)
  this.obj_line = new THREE.get_line(start, end, color)
  this.set_start = function (start) {
    this.math_line.start.copy(start)
    this.obj_line.geometry.vertices[0].copy(start)
    this.obj_line.geometry.verticesNeedUpdate = true
  }
  return this
}

function FindTheMidpointOfTheRectangle(renderer, scene) {
  this.handle = null
  this.vertices = []
  this.answer = []
  this.answer_points = []
  this.perspective_matrix = null
  this.lines = []
  this.mouse_point = null
  this.reply = []
  this.reply_points = []
  this.selected_line = null

  this.init = function () {
    mouse_point = get_point(new THREE.Vector3(0, 0, 0), 0.1, 0xffc87e + 0x002020)
    mouse_point.position.set(width(), height(), 0)
    scene.add(mouse_point)
    this.next_test()
    camera = new THREE.OrthographicCamera(0, 0, 0, 0, -10, 1000)
    camera.position.set(0, 0, -10)
    camera.lookAt(0, 0, 0)
    updateCanvas()
    update()
  }

  this.update = function () {
    if (renderer.domElement.offsetHeight != height() || renderer.domElement.offsetWidth != width()) {
      updateCanvas()
    }
    renderer.render(scene, camera)
    handle = requestAnimationFrame(update)
  }

  this.destroy = function () {
    cancelAnimationFrame(handle)

    renderer.domElement.onmousemove = null
  }

  this.updateCanvas = function () {
    camera.left = -width() / 2;
    camera.right = width() / 2;
    camera.top = height() / 2;
    camera.bottom = -height() / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width(), height())
  }

  this.next_test = function () {
    // 清除上次测试的四个答案物体
    if (answer_points.length > 0) {
      clear_objs(scene, answer_points)
      answer = []
      answer_points = []
    }

    // 清除上次测试的四个回答物体
    if (reply_points.length > 0) {
      clear_objs(scene, reply_points)
      reply = []
      reply_points = []
    }

    // 初始化一个随机的透视变换矩阵
    perspective_matrix = random_perspective_matrix3()

    // 初始化一个随机的长方形的顶点
    vertices = random_square_vertices(width(), height())

    // 初始化该长方形的四个中点，作为答案
    for (let i = 0; i < vertices.length - 1; i++) {
      answer.push(new THREE.Line3(vertices[i], vertices[i + 1]).getCenter())
    }

    // 将长方形的所有顶点和中点进行透视变换
    vertices_apply_matrix3(vertices, perspective_matrix)
    vertices_apply_matrix3(answer, perspective_matrix)

    // 若没有四条边物体，则初始化长方形的四条边物体并显示
    if (lines.length == 0) {
      lines = get_lines_by_vertices(vertices, 0xffc87e - 0x000f0f)
      show_objs(scene, lines)
    }

    // 根据透视变换后的顶点设置四条边的起始点
    set_lines_position_by_vertices(lines, vertices)

    // 根据透视变换后的中点创建答案物体
    for (let i = 0; i < vertices.length - 1; i++) {
      answer_points.push(get_point(answer[i], 0.1, 0xff3322))
    }
  }

  this.replay = function (replay) {
    // 将回放中的顶点对象化
    let vertices = replay["vertices"]
    for (let i = 0; i < vertices.length; i++) {
      vertices[i] = new THREE.Vector3(vertices[i][0], vertices[i][1], vertices[i][2])
    }
    // 若没有四条边物体，则初始化长方形的四条边物体并显示
    if (lines.length == 0) {
      lines = get_lines_by_vertices(vertices, 0xffc87e - 0x000f0f)
      show_objs(scene, lines)
    }
    // 根据回放中的顶点设置四条边的起始点
    set_lines_position_by_vertices(lines, vertices)


    // 将回放中的答案对象化
    let answer = replay["answer"]
    for (let i = 0; i < answer.length; i++) {
      answer[i] = new THREE.Vector3(answer[i][0], answer[i][1], answer[i][2])
    }
    // 清除上次测试的四个答案物体
    if (answer_points.length > 0) {
      clear_objs(scene, answer_points)
      answer_points = []
    }
    // 根据答案创建答案物体并显示
    for (let i = 0; i < answer.length; i++) {
      answer_points.push(get_point(answer[i], 0.1, 0xff3322))
    }
    show_objs(scene, answer_points)


    // 将回放中的回答对象化
    let reply = replay["reply"]
    for (let i = 0; i < reply.length; i++) {
      reply[i] = new THREE.Vector3(reply[i][0], reply[i][1], reply[i][2])
    }
    // 清除上次测试的四个回答物体
    if (reply_points.length > 0) {
      clear_objs(scene, reply_points)
      reply_points = []
    }
    // 根据回答创建回答物体并显示
    for (let i = 0; i < reply.length; i++) {
      reply_points.push(get_point(reply[i], 0.1, 0xffc87e + 0x002020))
    }
    show_objs(scene, reply_points)
  }

  this.record = function (score, reply, answer, vertices) {
    for (let i = 0; i < reply.length; i++) {
      reply[i] = [reply[i][0].x, reply[i][0].y, reply[i][0].z]
    }

    for (let i = 0; i < answer.length; i++) {
      answer[i] = [answer[i].x, answer[i].y, answer[i].z]
    }

    for (let i = 0; i < vertices.length; i++) {
      vertices[i] = [vertices[i].x, vertices[i].y, vertices[i].z]
    }

    let record = {
      "score": score,
      "replay": {
        "vertices": vertices,
        "answer": answer,
        "reply": reply
      },
      "time": new Date().getTime()
    }
    return record
  }

  renderer.domElement.onmousemove = function (e) {
    let mouse_point_tmp = canvas_position_to_world_position(new THREE.Vector2(e.offsetX, e.offsetY), width(), height())
    let closest_point = line_to_line3(lines[0]).closestPointToPoint(mouse_point_tmp, true, new THREE.Vector3())
    selected_line = lines[0]
    for (let i = 1; i < lines.length; i++) {
      let closest_point_tmp = line_to_line3(lines[i]).closestPointToPoint(mouse_point_tmp, true, new THREE.Vector3())
      if (closest_point_tmp.distanceTo(mouse_point_tmp) < closest_point.distanceTo(mouse_point_tmp)) {
        closest_point = closest_point_tmp
        selected_line = lines[i]
      }
    }
    mouse_point.position.copy(closest_point)
  }

  renderer.domElement.onmousedown = function (e) {
    if (reply.length == 4) {
      return
    }

    let mouse_position = mouse_point.position.clone()
    reply.push([mouse_position, selected_line])
    reply_points.push(get_point(mouse_position, 0.1, 0xffc87e + 0x002020))
    show_objs(scene, reply_points)

    // 若回答数等于四,则显示答案,并且计算和提交分数
    if (reply.length == 4) {
      show_objs(scene, answer_points)
      let score = 0
      let factor = (width() < height() ? width() : height()) / 8
      for (let i = 0; i < lines.length; i++) {
        let max_score_tmp = 0
        for (let j = 0; j < reply.length; j++) {
          if (reply[j][1] == lines[i]) {
            let score_tmp = 1 - (reply[j][0].distanceTo(answer[i]) / factor)
            if (score_tmp > max_score_tmp) {
              max_score_tmp = score_tmp
            }
          }
        }
        score += max_score_tmp
      }
      score = Math.round((score / 4) * 100)
      app.score = score
      console.log(score)
      post_record("0", record(score, reply, answer, vertices))
    }
  }
  return this
}

function LineLineParallel () {

  this.init = function () {
    
  }
}