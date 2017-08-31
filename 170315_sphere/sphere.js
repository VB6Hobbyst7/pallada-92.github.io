function Sphere(params, data) {

  var stack_size = 0;
  this.stack_size = function() {return stack_size};
  var canvas = params.canvas || document.getElementById(params.id);
  canvas.style.width = params.width + 'px';
  canvas.style.height = params.height + 'px';
  var pxratio = window.devicePixelRatio || 1;
  params.width *= pxratio;
  params.height *= pxratio;
  canvas.width = params.width;
  canvas.height = params.height;
  params.cx *= pxratio;
  params.cy *= pxratio;
  params.rad *= pxratio;
  params.popup_x *= pxratio;
  params.popup_y *= pxratio;
  params.popup_w *= pxratio;
  params.menu_rad *= pxratio;
  params.menu_click_rad *= pxratio;
  params.menu_font_size *= pxratio;
  params.popup_font_size *= pxratio;

  var ctx = canvas.getContext('2d');

  // 0 - north pole, 1..5 - top, 6..10 - bottom, 11 - south pole
  var vertices = [];
  vertices.push([0, 0, 1]);
  var icoedge = 4 / Math.sqrt(2 * (5 + Math.sqrt(5)));
  var poly5edge = Math.sqrt((5 - Math.sqrt(5)) / 2);
  for (var i=0; i<5; i++) {
    var angle = 2 * Math.PI * i / 5;
    var r = icoedge / poly5edge;
    var z = 1 - icoedge * icoedge / 2;
    vertices.push([r * Math.cos(angle), r * Math.sin(angle), z]);
  }
  for (var i=0; i<5; i++) {
    var angle = 2 * Math.PI * (i + 0.5) / 5;
    var r = icoedge / poly5edge;
    var z = - 1 + icoedge * icoedge / 2;
    vertices.push([r * Math.cos(angle), r * Math.sin(angle), z]);
  }
  vertices.push([0, 0, -1]);

  var triangles = [
    // north
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 5],
    [0, 5, 1],
    // middle - up
    [1, 2, 6],
    [2, 3, 7],
    [3, 4, 8],
    [4, 5, 9],
    [5, 1, 10],
    // middle - bottom
    [1, 6, 10],
    [2, 7, 6],
    [3, 8, 7],
    [4, 9, 8],
    [5, 9, 10],
    // south
    [6, 7, 11],
    [7, 8, 11],
    [8, 9, 11],
    [9, 10, 11],
    [10, 6, 11],
  ];

  function middle(v1, v2) {
    return add(mul(v1, 1/2), mul(v2, 1/2));
  }
  
  if (!params.less_vertices) {
    var pair_map = {};
    var base_triangles = triangles;
    var triangles = [];
    for (var i=0; i<base_triangles.length; i++) {
      var tri = base_triangles[i];
      var pairs = []
      for (var j=0; j<3; j++) {
        var t;
        if (tri[j] > tri[(j + 1) % 3]) {
          t = tri[j] + '-' + tri[(j + 1) % 3];
        } else {
          t = tri[(j + 1) % 3] + '-' + tri[j];
        }
        if (!pair_map[t]) {
          var v1 = vertices[tri[j]];
          var v2 = vertices[tri[(j + 1) % 3]];
          pair_map[t] = vertices.push(
            normalize(middle(v1, v2))
          ) - 1;
        }
        pairs[j] = pair_map[t];
      }
      triangles.push([tri[0], pairs[0], pairs[2]]);
      triangles.push([tri[1], pairs[1], pairs[0]]);
      triangles.push([tri[2], pairs[2], pairs[1]]);
      triangles.push([pairs[0], pairs[1], pairs[2]]);
    }
  }

  function rotate(vect, axis, angle) {
    var c1 = (axis + 1) % 3;
    var c2 = (axis + 2) % 3;
    var res = [0, 0, 0];
    res[axis] = vect[axis];
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    res[c1] = cos * vect[c1] + sin * vect[c2];
    res[c2] = -sin * vect[c1] + cos * vect[c2];
    return res;
  }

  var orbits = [];
  if (params.orbits) {
    var orbit_pts = 100;
    var orbit_count = 10;
    for (var i=0; i<orbit_count; i++) {
      var radius = 1.2 + Math.random() * 1.5;
      var phi1 = Math.random() * 2 * Math.PI;
      var phi2 = Math.random() * 2 * Math.PI;
      var phi3 = Math.random() * 2 * Math.PI;
      var pts = [];
      for (var j=0; j<=orbit_pts; j++) {
        var a = 2 * Math.PI / orbit_pts * j;
        var pt = [radius * Math.cos(a), radius * Math.sin(a), 0];
        pt = rotate(pt, 0, phi1);
        pt = rotate(pt, 1, phi2);
        pt = rotate(pt, 2, phi3);
        pts.push(pt);
      }
      orbits.push({
        pts: pts,
        radius: radius,
        blur: Math.random(),
        width: Math.random(),
        alpha: Math.random(),
        opacity: Math.random(),
      })
    }
  }
  
  function inside(point, vs) {
    // http://stackoverflow.com/questions/22521982/js-check-if-point-inside-a-polygon
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];
      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  function sortIndices(toSort) {
    var temp = []
    for (var i = 0; i < toSort.length; i++) {
      temp[i] = [toSort[i], i];
    }
    temp.sort(function(left, right) {
      return left[0] < right[0] ? -1 : 1;
    });
    res = [];
    for (var j = 0; j < temp.length; j++) {
      res.push(temp[j][1]);
    }
    return res;
  }

  function proj(vector) {
    return [
      vector[1] * params.rad + params.cx,
      vector[2] * params.rad + params.cy,
    ];
  }
  
  function dot(vec1, vec2) {
    return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
  }

  function add(vec1, vec2) {
    return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
  }

  function mul(vec, a) {
    return [vec[0] * a, vec[1] * a, vec[2] * a];
  }

  function sub(vec1, vec2) {
    return add(vec1, mul(vec2, -1));
  }

  function len(vec) {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + (vec[2] * vec[2] || 0));
  }

  function sign(x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;
  }
  
  function outer(u, v) {
    return [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
  }

  function normalize(vec) {
    return mul(vec, 1 / len(vec));
  }

  function ort(vec, dir) {
    if (len(outer(vec, dir[0])) < 0.001) {
      dir = dir[1];
    } else {
      dir = dir[0];
    }
    var t = dot(vec, dir);
    var res1 = dir;
    var v1 = mul(vec, -sign(t));
    var t1 = dot(vec, dir);
    if (Math.abs(t) > 0.001) {
      var beta = - dot(v1, v1) / dot(v1, dir);
      res1 = add(v1, mul(dir, beta));
    }
    var res2 = outer(vec, res1);
    return [
      normalize(vec),
      normalize(res1),
      normalize(res2),
    ];
  }

  this.onload = function() {
    if (params.onload) {
      params.onload();
    }
  };
  var icons_loaded = [];
  function icon_onload(img) {
    if (icons_loaded.indexOf(img.path) != -1) return;
    icons_loaded.push(img.path);
    var icon_pos = icons.indexOf(img.path);
    var ctx = icons_canvas.getContext('2d');
    ctx.drawImage(
      img,
      Math.round((icon_pos + 0.5) * params.icon_size - img.width / 2),
      Math.round(0.5 * params.icon_size - img.height / 2)
    );
    if (icons_loaded.length == icons.length) {
      generate_icons_versions();
      this.onload();
    }
  }

  function resize_canvas(canvas, factor) {
    var res = document.createElement('canvas');
    res.width = canvas.width;
    res.height = canvas.height;
    var old_data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var new_data = res.getContext('2d').getImageData(0, 0, res.width, res.height);
    var min_i = - Math.floor(factor / 2);
    var max_i = Math.ceil(factor / 2);
    var idx;
    var gray;
    var min_gray;
    var min_gray_idx;
    var val;
    for (var x1=-min_i; x1 < canvas.width; x1 += factor) {
      for (var y1=-min_i; y1 < canvas.height; y1 += factor) {
        min_gray = 256 * 4;
        min_gray_idx = 0;
        for (var x2=min_i; x2 < max_i; x2++) {
          for (var y2=min_i; y2 < max_i; y2++) {
            gray = 0;
            idx = (x1 + x2 + (y1 + y2) * canvas.width) * 4;
            for (var ch=0; ch<3; ch++) {
              gray += old_data.data[idx + ch];
            }
            if (gray < min_gray && old_data.data[idx + 3] == 255) {
              min_gray = gray;
              min_gray_idx = idx;
            }
          }
        }
        for (var ch=0; ch<4; ch++) {
          val = old_data.data[min_gray_idx + ch];
          for (var x2=min_i; x2 < max_i; x2++) {
            for (var y2=min_i; y2 < max_i; y2++) {
              new_data.data[(x1 + x2 + (y1 + y2) * canvas.width) * 4 + ch] = val;
            }
          }
        }
      }
    }
    res.getContext('2d').putImageData(new_data, 0, 0);
    return res;
  }

  var icons_versions = {};
  function generate_icons_versions() {
    icons_versions[1] = icons_canvas;
    icons_versions[2] = resize_canvas(icons_canvas, 2);
    icons_versions[3] = resize_canvas(icons_canvas, 3);
    icons_versions[4] = resize_canvas(icons_canvas, 4);
    icons_versions[6] = resize_canvas(icons_canvas, 6);
    icons_versions[8] = resize_canvas(icons_canvas, 8);
    // document.getElementsByTagName('body')[0].appendChild(icons_versions[8]);
  }

  var icons = [];
  for (var i=0; i<vertices.length; i++) {
    var item = data.items[i];
    item.img = new Image();
    item.img.path = item.icon;
    item.img.onload = icon_onload.bind(this, item.img);
    if (icons.indexOf(item.icon) == -1) {
      icons.push(item.icon);
    }
    item.img.src = item.icon;
    item.t = 0;
  }

  var icons_canvas = document.createElement('canvas');
  icons_canvas.width = params.icon_size * icons.length;
  icons_canvas.height = params.icon_size;

  function draw_poly(segments, x, y, w, h, t) {
    var line_len_starts = [0];
    var line_len = 0;
    var line_pts = [[x, y]];
    var line_seg = [];
    for (var i=0; i<segments.length; i++) {
      var cur_seg = [
        segments[i][0] * w,
        segments[i][1] * h,
      ];
      line_seg.push(cur_seg);
      x += cur_seg[0];
      y += cur_seg[1];
      line_pts.push([x, y]);
      line_len += len(cur_seg);
      line_len_starts.push(line_len);
    }
    ctx.beginPath();
    ctx.moveTo(line_pts[0][0], line_pts[0][1]);
    for (var i=0; i<segments.length; i++) {
      var cur_t = Math.min(
        (t * line_len - line_len_starts[i]) / len(line_seg[i]),
        1
      );
      if (cur_t < 0) continue;
      ctx.lineTo(
        line_pts[i][0] + line_seg[i][0] * cur_t,
        line_pts[i][1] + line_seg[i][1] * cur_t
      );
    }
  }

  function splittext(text, width) {
    var words = text.split(' ');
    var lines = [];
    var cur_x = 0;
    var cur_line = ''
    for (var i=0; i<words.length; i++) {
      var word_w = ctx.measureText(' ' + words[i]).width;
      if (cur_line == '') {
        cur_line = words[i];
        cur_x = word_w;
      } else if (cur_x + word_w > width) {
        lines.push(cur_line);
        cur_x = word_w;
        cur_line = words[i];
      } else {
        cur_line += ' ' + words[i];
        cur_x += word_w;
      }
    }
    lines.push(cur_line);
    return lines;
  }

  var font_family = 'Helvetica';
  function draw_popup(vec, border, title, text, t) {
    var vp = vec;
    ctx.save(); stack_size += 1;
    ctx.lineWidth = 2 * params.line_coeff;
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = border;
    draw_poly(
      [[0.25, 0.5], [0.25, 0], [0.25, 0.5], [0.25, 0]],
      params.popup_x,
      params.popup_y,
      vp[0] - params.popup_x,
      vp[1] - params.popup_y,
      t
    );
    ctx.stroke();
    ctx.restore(); stack_size -= 1;
    var pp = 0.07;
    var text_w = params.popup_w * (1 - pp * 2 * 1.5);
    ctx.font = params.popup_font_size + 'px ' + font_family;
    var text_lines = splittext(text, text_w);
    ctx.font = 'bold ' + params.popup_font_size + 'px ' + font_family;
    var title_lines = splittext(title, text_w);
    var lineheight = params.popup_font_size * 20 / 15;
    var block_height = lineheight * (1 + text_lines.length + title_lines.length);
    ctx.save(); stack_size += 1;
    ctx.lineWidth = 2 * params.line_coeff;
    ctx.strokeStyle = border;
    ctx.fillStyle = 'rgba(0, 70, 129, 0.9)';
    draw_poly(
      [[pp, -0.5], [1 - pp * 2, 0], [pp, 0.5], [-pp, 0.5], [-0.1, 0],
       [-0.05, 15 / block_height], [-0.05, -15 / block_height],
       [-(0.8 - pp * 2), 0], [-pp, -0.5]],
      params.popup_x,
      params.popup_y,
      params.popup_w,
      block_height,
      t
    );
    ctx.closePath();
    ctx.save(); stack_size += 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = -5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.restore(); stack_size -= 1;
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = 'white';
    var shift1 = 4 / 15 * params.popup_font_size;
    var shift2 = 2 / 15 * params.popup_font_size;
    ctx.font = 'bold ' + params.popup_font_size + 'px ' + font_family;
    ctx.textAlign = 'left';
    for (var i=0; i<title_lines.length; i++) {
      ctx.fillText(
        title_lines[i].slice(0, Math.round(title_lines[i].length * t)),
        params.popup_x + (params.popup_w - text_w) / 2,
        params.popup_y - block_height / 2 + lineheight * (i + 1) + shift1
      );
    }
    ctx.font = params.popup_font_size + 'px ' + font_family;
    for (var i=0; i<text_lines.length; i++) {
      ctx.fillText(
        text_lines[i].slice(0, Math.round(text_lines[i].length * t)),
        params.popup_x + (params.popup_w - text_w) / 2,
        params.popup_y - block_height / 2 + lineheight * (i + 1 + title_lines.length) + shift1 + shift2
      );
    }
    ctx.restore(); stack_size -= 1;
  }

  function draw_vertex(vect, dir, img_path, t, selected, title, text, border) {
    var circ_pts = 33;
    var circ_max_norm_size = params.circ_rel_size;
    var vect0 = (vect[0] + params.vect0_shift) / (1 + params.vect0_shift);
    var circ_norm_size = circ_max_norm_size * Math.pow(vect0, params.circ_exp);
    var circ_selected_size = circ_max_norm_size * 1.2;
    var circ_size = circ_norm_size;
    if (t > 0) {
      circ_size = circ_size * (1 - t) + circ_selected_size * t;
    }
    var tt = ort(vect, dir);
    var v1 = [tt[1][1], tt[1][2]];
    var v2 = [tt[2][1], tt[2][2]];
    var cs_norm = 1 - Math.pow(vect0, params.circ_exp);
    var cs = cs_norm;
    if (t > 0) {
      cs = cs * (1 - t) + 1 * t;
    }
    if (cs > 0) {
      v1 = [tt[1][1] * (1 - cs), tt[1][2] * (1 - cs) + cs];
      v2 = [tt[2][1] * (1 - cs) - cs, tt[2][2] * (1 - cs)];
    }
    v1 = mul(v1, params.rad);
    v2 = mul(v2, params.rad);
    var cur_poly = [];
    for (var j=0; j<circ_pts; j++) {
      var a = 2 * Math.PI * j / circ_pts;
      var pt = add(proj(vect), add(
        mul(v1, circ_size * Math.cos(a)),
        mul(v2, circ_size * Math.sin(a))
      ));
      cur_poly.push(pt);
    }
    var vp = proj(vect);
    if (t > 0 && selected && params.popup)  {
      draw_popup(vp, border, title, text, t);
    }
    ctx.save(); stack_size += 1;
    if (t == 0) {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    } else {
      if (rotating) {
        ctx.fillStyle = 'rgb(162, 185, 215)';
      } else {
        ctx.fillStyle = 'white';
      }
      ctx.strokeStyle = border;
    }
    ctx.beginPath();
    ctx.moveTo(cur_poly[0][0], cur_poly[0][1]);
    for (var j=1; j<cur_poly.length; j++) {
      ctx.lineTo(cur_poly[j][0], cur_poly[j][1]);
    }
    ctx.closePath();
    ctx.save(); stack_size += 1;
    if (t > 0) {
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.shadowBlur = t * 30;
      ctx.shadowOffsetX = - t * 10 * 0;
      ctx.shadowOffsetY = t * 10 * 0;
    }
    ctx.fill();
    ctx.restore(); stack_size -= 1;
    ctx.beginPath();
    ctx.moveTo(cur_poly[0][0], cur_poly[0][1]);
    ctx.lineWidth = 2 * params.line_coeff;
    var max_j = Math.ceil(cur_poly.length * t);
    for (var j=1; j<=max_j; j++) {
      var jj = j % cur_poly.length;
      ctx.lineTo(cur_poly[jj][0], cur_poly[jj][1]);
    }
    ctx.stroke();
    var circ_c = 0.36;
    if (t > 0) {
      ctx.save(); stack_size += 1;
      ctx.translate(vp[0], vp[1]);
      for (var j=0; j<4; j++) {
        // var s1 = 0.36 * params.rad / 2 + (1 - Math.sin(t * Math.PI / 2)) * params.rad / 2;
        var s1 = circ_c * 1.3 * params.rad / 2 * Math.sin(t * Math.PI / 2);
        var s2 = params.rad / 30;
        ctx.rotate(Math.PI / 2);
        ctx.save(); stack_size += 1;
        ctx.lineWidth = 1 * params.line_coeff;
        ctx.translate(s1, s1);
        // ctx.strokeStyle = 'rgb(255, 104, 28)';
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(-s2, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, -s2);
        ctx.stroke();
        ctx.restore(); stack_size -= 1;
      }
      ctx.restore(); stack_size -= 1;
    }
    if (img_path && icons_versions[1]) {
      ctx.save(); stack_size += 1;
      var is = params.icon_size;
      var is2 = Math.round(is/2);
      var ipos = icons.indexOf(img_path);
      var c = circ_size * 2 / is * 1.0;
      ctx.setTransform(-c * v2[0], -c * v2[1], c * v1[0], c * v1[1], vp[0], vp[1]);
      var version = Math.floor(1.5 / (c * (len(v1) + len(v2))));
      if (version < 1) {
        version = 1;
      }
      while (!icons_versions[version] && version > 1) {
        version--;
      }
      if (icons_versions[version]) {
        ctx.drawImage(
          icons_versions[version],
          ipos * is, 0,
          is, is,
          -is2, -is2,
          is, is
        );
      }
      ctx.restore(); stack_size -= 1;
    }
    ctx.restore(); stack_size -= 1;
    if (vect[0] < 0) {
      return [];
    } else {
      return cur_poly;
    }
  }

  function rotate_vertices(rot_x, rot_y) {
    var trans_vert = [];
    for (var i=0; i<vertices.length; i++) {
      var vert = vertices[i];
      vert = rotate(vert, 2, rot_x * Math.PI);
      vert = rotate(vert, 1, rot_y * Math.PI);
      trans_vert.push(vert);
    }
    vertices = trans_vert;
    for (var i=0; i<orbits.length; i++) {
      var orbit = orbits[i];
      var trans_pts = [];
      for (var j=0; j<orbit.pts.length; j++) {
        var pt = orbit.pts[j];
        pt = rotate(pt, 2, rot_x * Math.PI);
        pt = rotate(pt, 1, rot_y * Math.PI);
        trans_pts.push(pt);
      }
      orbit.pts = trans_pts;
    }
  }
  rotate_vertices(0.7 / Math.PI, 0.45 / Math.PI);

  function rgba(r, g, b, a) {
    return 'rgba(' + [Math.round(r), Math.round(g), Math.round(b), a.toFixed(3)].join(', ') + ')';
  }

  function make_gauss_grad1(rad, r, g, b, a) {
    var canvas = document.createElement('canvas');
    canvas.width = rad * 2;
    canvas.height = rad * 2;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, rad * 2, rad * 2);
    var gradient = ctx.createRadialGradient(0, 0, rad * 2, 0, 0, 0);
    var stops = 500;
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, 'transparent');
    for (var i=0; i<stops; i++) {
      var c = 1 - i / stops;
      c = Math.exp(- c * c * 20);
      if (i < 400) {
        c *= i/400;
      }
      gradient.addColorStop(0.5 + i / stops / 2, rgba(c * r, c * g, c * b, c * a));
    }
    ctx.fillStyle = gradient;
    ctx.translate(rad, rad);
    ctx.fillRect(-rad, -rad, rad * 2, rad * 2);
    return canvas;
  }

  function make_gauss_grad2(r, g, b, a) {
    var canvas = document.createElement('canvas');
    canvas.width = params.width;
    canvas.height = params.height;
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createRadialGradient(0, 0, params.rad * 3, 0, 0, 0);
    var stops = 500;
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.05, 'transparent');
    for (var i=0; i<stops; i++) {
      var c = 1 - i / stops;
      c = Math.exp(- c * c / 2);
      if (i < 400) {
        //c *= i/400;
      }
      gradient.addColorStop(0.63 + i / stops * 0.1, rgba(c * r, c * g, c * b, c * a));
    }
    ctx.fillStyle = gradient;
    ctx.translate(params.cx, params.cy);
    ctx.fillRect(-params.cx, -params.cy, params.width, params.height);
    return canvas;
  }
  var gauss_grad1 = make_gauss_grad1(params.rad / 0.5, 255, 255, 255, 1);
  var gauss_grad2 = make_gauss_grad2(255, 255, 255, 0.5);

  for (var i=0; i<data.menu.length; i++) {
    data.menu[i].hover_t = 0;
    data.menu[i].click_t = 0;
  }
  function draw_menu() {
    ctx.font = 'bold ' + params.menu_font_size + 'px ' + font_family;
    for (var i=0; i<data.menu.length; i++) {
      var x = params.cx + params.menu_rad * Math.cos(-data.menu[i].angle);
      var y = params.cy + params.menu_rad * Math.sin(-data.menu[i].angle);
      var lines = data.menu[i].title.split('\n');
      var line_height = params.menu_font_size * 20 / 15;
      var text_w = 0;
      var text_h = (lines.length + 1) * line_height;
      for (var j=0; j<lines.length; j++) {
        var line = lines[j];
        var text_w = Math.max(text_w, ctx.measureText(line).width);
      }
      ctx.save(); stack_size += 1;
      var grad_x = data.menu[i].align == 'left' ? 1 : -1;
      // ctx.fillStyle = gauss_grad;
      ctx.translate(x + grad_x * text_w / 2, y);
      data.menu[i].cx = x + grad_x * text_w / 2;
      data.menu[i].cy = y;
      ctx.globalAlpha = 0.25 + data.menu[i].click_t * 0.25;
      ctx.drawImage(gauss_grad1, -gauss_grad1.width/2, -gauss_grad1.height/2);
      ctx.restore(); stack_size -= 1;
      ctx.save(); stack_size += 1;
      ctx.translate(x + grad_x * text_w / 2, y);
      var s = 1 + Math.sin(data.menu[i].hover_t * Math.PI / 2) * 0.25;
      ctx.scale(s, s);
      ctx.translate(0, - text_h / 2);
      ctx.fillStyle = 'white';
      ctx.textAlign = data.menu[i].align;
      for (var j=0; j<lines.length; j++) {
        var line = lines[j];
        ctx.fillText(line, - grad_x * text_w / 2, line_height * (j + 1));
      }
      ctx.restore(); stack_size -= 1;
    }
  }

  function draw_orbits(foreground) {
    for (var i=0; i<orbits.length; i++) {
      var orbit = orbits[i];
      var prev_p = null;
      for (var j=0; j<orbit.pts.length; j++) {
        var p = orbit.pts[j];
        var len_p = len([p[1], p[2]]);
        var back_coeff = 1;
        if (p[0] < 0) {
          back_coeff = (len_p - 1) / (orbit.radius - 1);
        }
        if (back_coeff < 0 || !prev_p) {
          prev_p = p;
          continue
        }
        var front_coeff = 1;
        if (p[0] > 0) {
          front_coeff = 1 + p[0] * 5;
        }
        ctx.lineWidth = orbit.blur * params.line_coeff * back_coeff * front_coeff;
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + orbit.alpha * back_coeff / front_coeff + ')';
        ctx.beginPath();
        var prev_proj = proj(prev_p);
        var cur_proj = proj(p)
        ctx.moveTo(prev_proj[0], prev_proj[1]);
        ctx.lineTo(cur_proj[0], cur_proj[1]);
        ctx.stroke();
        prev_p = p;
      }
    }
  }

  var polygons = [];
  var selected_poly = -1;
  this.draw = function() {
    dir = [[0, 0, 1], [0, 1, 0]];
    var trans_tri_mid = [];
    for (var i=0; i<triangles.length; i++) {
      var tri = triangles[i];
      var v0 = vertices[tri[0]];
      var v1 = vertices[tri[1]];
      var v2 = vertices[tri[2]];
      trans_tri_mid.push(v0[0] + v1[0] + v2[0]);
    }
    var tri_order = sortIndices(trans_tri_mid);
    var vert_order = sortIndices(vertices);
    ctx.clearRect(0, 0, params.width, params.height);
    //draw_orbits(false);
    ctx.lineWidth = 2 * params.line_coeff;
    ctx.save(); stack_size += 1;
    var u = (+new Date()) / 500;
    u = Math.abs(Math.sin(u) + Math.sin(2 * u)) / 2;
    ctx.globalAlpha = 0.8 + 0.2 * u;
    ctx.translate(params.cx, params.cy);
    u = (+new Date()) / 700;
    u = Math.sin(u);
    var s = 1.05 + 0.05 * u;
    ctx.scale(s, s);
    ctx.translate(-params.cx, -params.cy);
    if (!params.no_glow) {
      ctx.drawImage(gauss_grad2, 0, 0);
    }
    ctx.restore(); stack_size -= 1;
    for (var i=0; i<triangles.length; i++) {
      var tri = triangles[tri_order[i]];
      var v0 = proj(vertices[tri[0]]);
      var v1 = proj(vertices[tri[1]]);
      var v2 = proj(vertices[tri[2]]);
      if (trans_tri_mid[tri_order[i]] > 0) {
        var op_c = Math.sin(tri_order[i] + (+new Date()) / 500);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.4 * 0 + op_c * 0.3) + ')';
        ctx.strokeStyle = 'white';
      } else {
        continue;
      }
      for (var stroke=0; stroke<=1; stroke++) {
        if (!stroke) {
          ctx.beginPath();
        }
        for (var j=0; j<3; j++) {
          var v1 = proj(vertices[tri[j]]);
          var v2 = proj(vertices[tri[(j + 1) % 3]]);
          if (stroke) {
            ctx.beginPath();
            ctx.moveTo(v1[0], v1[1]);
            ctx.lineTo(v2[0], v2[1]);
            ctx.stroke();
          } else {
            ctx.lineTo(v1[0], v1[1]);
            ctx.lineTo(v2[0], v2[1]);
          }
        }
        if (!stroke) {
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    if (!params.hide_menu) {
      draw_menu();
    }
    polygons = [];
    for (var ii=0; ii<vertices.length; ii++) {
      var i = vert_order[ii];
      var tv = vertices[i];
      if (tv[0] + params.vect0_shift > 0) {
        if (selected_poly == i || menu_navigate_to == i) continue;
        polygons[i] = draw_vertex(
          tv, dir, data.items[i].img.path, data.items[i].t, false,
          data.items[i].title, data.items[i].text, data.items[i].border
        )
      }
    }
    draw_orbits(true);
    var i = menu_navigate_to == -1 ? selected_poly : menu_navigate_to;
    if (i != -1 && vertices[i][0] > 0) {
      polygons[i] = draw_vertex(
        vertices[i], dir, data.items[i].img.path, data.items[i].t, true,
        data.items[i].title, data.items[i].text, data.items[i].border
      );
    }
  }

  var requestAnimationFrame = window.requestAnimationFrame;
  if (!requestAnimationFrame) {
    requestAnimationFrame = (function() {
      return window.webkitRequestAnimationFrame ||
        // comment out if FF4 is slow (it caps framerate at ~30fps:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(
          /* function FrameRequestCallback */ callback,
          /* DOMElement Element */ element
        ) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();
  }

  function clamp(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }
  
  var in_sphere = false;
  var mousedist = 0;
  var rotating = false;
  var selected_menu = -1;
  var mousedown_pos = [0, 0];
  var last_mouse_pos = [0, 0];
  var rel_pos = [0, 0]
  var mouseclick_radius = 50;
  var mousedelta = [0, 0];
  var menu_navigate_to = -1;

  function update_pos(x, y) {
    mousedist = len([
      mousedown_pos[0] - x,
      mousedown_pos[1] - y,
    ]);
    mousedelta = [
      x - last_mouse_pos[0],
      y - last_mouse_pos[1],
    ];
    last_mouse_pos = [x, y];
    var rect = canvas.getBoundingClientRect();
    rel_pos = [x - rect.left * pxratio, y - rect.top * pxratio];
    in_sphere = len(
      [rel_pos[0] - params.cx, rel_pos[1] - params.cy]
    ) <= params.rad;
    selected_poly = -1;
    for (var i=0; i<polygons.length; i++) {
      var cur_poly = polygons[i];
      if (!cur_poly) continue;
      if (inside(rel_pos, cur_poly)) {
        // console.log('selected item = ' + i);
        var selected = false;
        if (rotating) {
          if (mousedist < mouseclick_radius) {
            selected = true;
          }
        } else {
          selected = true;
        }
        if (selected) {
          selected_poly = i;
        }
      }
    }
    selected_menu = -1;
    var min_menu_dist = params.menu_click_rad;
    if (!in_sphere && selected_poly == -1) {
      for (var i=0; i<data.menu.length; i++) {
        var l = len([data.menu[i].cx - rel_pos[0], data.menu[i].cy - rel_pos[1]]);
        if (l < min_menu_dist) {
          selected_menu = i;
          min_menu_dist = l;
        }
      }
    }
    if (selected_poly != -1) {
      menu_navigate_to = -1;
    }
  }

  function onmouseup() {
    if (rotating && selected_poly != -1) {
      data.onclick(data.items[selected_poly], selected_poly);
    } else if (selected_menu != -1 && menu_navigate_to != -1) {
      data.onclick(data.items[menu_navigate_to], menu_navigate_to);
    }
    rotating = false;
  }
  window.addEventListener('mouseup', onmouseup);
  window.addEventListener('touchend', onmouseup);

  function onmousedown(x, y) {
    update_pos(x, y);
    if (selected_menu != -1) {
      data.menu[selected_menu].click_t = 1;
    }
    set_navigate_to();
    if (in_sphere || selected_poly != -1) {
      mousedown_pos = [x, y];
      last_mouse_pos = [x, y];
      rotating = true;
      return true;
    }
    return false;
  }
  canvas.onmousedown = function(e) {
    onmousedown(e.clientX * pxratio, e.clientY * pxratio);
  }
  canvas.ontouchstart = function(e) {
    if (onmousedown(e.touches[0].clientX * pxratio, e.touches[0].clientY * pxratio)) {
      e.preventDefault();
      return false;
    }
  }

  function set_navigate_to() {
    if (selected_menu != -1) {
      if (
        menu_navigate_to != -1 &&
        data.items[menu_navigate_to].cls == data.menu[selected_menu].cls
      ) {
        
      } else {
        var min_min_dist = 0.6;
        var min_dist = 10;
        var min_vertex = -1;
        for (var i=0; i<vertices.length; i++) {
          if (data.items[i].cls != data.menu[selected_menu].cls) {
            continue;
          }
          var l = len(sub(vertices[i], [1, 0, 0]));
          if (l > min_min_dist && l < min_dist) {
            min_dist = l;
            min_vertex = i;
          } else if (min_vertex == -1) {
            min_vertex = i;
          }
        }
        menu_navigate_to = min_vertex;
      }
    } else {
      menu_navigate_to = -1;
    }
  }

  var delta_opt_len = 0.010;
  var default_last_delta = [
    delta_opt_len / Math.sqrt(2),
    delta_opt_len / Math.sqrt(2)
  ]
  function set_opt_len(l) {
    delta_opt_len = l;
    default_last_delta = [
      delta_opt_len / Math.sqrt(2),
      delta_opt_len / Math.sqrt(2)
    ];
  }
  var last_delta = default_last_delta;
  function onmousemove(x, y) {
    update_pos(x, y);
    if (rotating) {
      var c = 1/params.rad/4;
      last_delta = [-c * mousedelta[0], c * mousedelta[1], 0];
      rotate_vertices(last_delta[0], last_delta[1]);
      return true;
    }
    set_navigate_to();
    if (selected_poly != -1 || selected_menu != -1) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
    return false;
  }
  window.addEventListener('mousemove', function(e) {
    onmousemove(e.clientX * pxratio, e.clientY * pxratio);
  });
  window.addEventListener('touchmove', function(e) {
    if(onmousemove(e.touches[0].clientX * pxratio, e.touches[0].clientY * pxratio)) {
      e.preventDefault();
      return false;
    }
  });


  this.play = true;
  this.ondraw = function() {};
  var this1 = this;
  var prev_frame = +new Date();

  this.animate = function() {
    var tdelta = Math.min((+new Date()) - prev_frame, 500) / 50;
    prev_frame = +new Date();
    set_opt_len(0.003 + (1 + Math.sin((+new Date()) / 1000)) / 2 * 0.015);
    if (this1.play) {
      if (menu_navigate_to != -1) {
        var d = sub([1, 0, 0], vertices[menu_navigate_to]);
        last_delta[0] = -d[1] / 20;
        last_delta[1] = d[2] / 20;
      } else if (!in_sphere && !rotating && selected_poly == -1) {
        // autorotate
        //var a = 0.1 * Math.sin((+new Date()) / 1000 / 5) * tdelta;
        var a = [1, 0, 0, 0.5, 0, 0, 0.8, 0, 0, 0.7, 0, 0][Math.floor(+new Date() / 1000 / 25 % 1 * 11)] * 0.03 * tdelta;
        last_delta[0] = last_delta[0] * Math.cos(a) - last_delta[1] * Math.sin(a);
        last_delta[1] = last_delta[0] * Math.sin(a) + last_delta[1] * Math.cos(a);
        if (len(last_delta) < delta_opt_len / 100) {
          last_delta = mul(default_last_delta, 1 / 6);
        } else if (len(last_delta) < delta_opt_len / 6) {
          last_delta = mul(last_delta, delta_opt_len / 6 / len(last_delta));
        }
        last_delta = mul(last_delta, Math.pow(delta_opt_len / len(last_delta), 0.05 * tdelta));
      } else if (in_sphere && !rotating) {
        last_delta = mul(last_delta, Math.pow(0.2, 0.05 * tdelta));
      }
      rotate_vertices(last_delta[0] * tdelta / 2, last_delta[1] * tdelta / 2);
      var d = tdelta / 10;
      for (var i=0; i<vertices.length; i++) {
        if (vertices[i][0] < 0) {
          data.items[i].t = 0;
        } else {
          if (i == selected_poly || i == menu_navigate_to) {
            data.items[i].t = Math.min(
              data.items[i].t + d, 1
            );
          } else {
            data.items[i].t = Math.max(
              data.items[i].t - d, 0
            );
          }
        }
      }
      var d = tdelta / 10;
      for (var i=0; i<data.menu.length; i++) {
        data.menu[i].click_t = Math.max(0, data.menu[i].click_t - d);
        if (selected_menu == i) {
          data.menu[i].hover_t = Math.min(1, data.menu[i].hover_t + d);
        } else {
          data.menu[i].hover_t = Math.max(0, data.menu[i].hover_t - d);
        }
      }
      this.draw();
      this.ondraw();
    }
    requestAnimationFrame(this.animate.bind(this));
  }

  this.deselect = function() {
    menu_navigate_to = -1;
  }

  if (!params.no_autoplay) {
    this.animate();
  }
  
}


