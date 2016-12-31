function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Point.rectPair = function (a, b) {
  var minx = Math.min(a.x, b.x),
    maxx = Math.max(a.x, b.x),
    miny = Math.min(a.y, b.y),
    maxy = Math.max(a.y, b.y);
  return [minx, miny, maxx - minx, maxy - miny];
};

Point.rectCenterPair = function (a, b) {
  var d = a.deltaTo(b).abs();

  return [a.x - d.x, a.y - d.y, d.x * 2, d.y * 2];
};

Point.fromPoint = function (pt) {
  return new Point(pt.x, pt.y);
};

Point.fromEvent = function (e) {
  e.touches && (e = e.touches[0]);
  var x = e.clientX || e.pageX;
  var y = e.clientY || e.pageY;
  return new Point(x, y);
};

Point.prototype.midPoint = function (pt) {
  return new Point(this.x + (pt.x - this.x) / 2, this.y + (pt.y - this.y) / 2);
};

Point.prototype.translate = function (delta) {
  return new Point(this.x + delta.x, this.y + delta.y);
};

Point.prototype.add = function (delta) {
  this.x += delta.x;
  this.y += delta.y;
  return this;
};

Point.prototype.subtract = function (delta) {
  this.x -= delta.x;
  this.y -= delta.y;
  return this;
};

Point.prototype.negate = function () {
  return new Point(-this.x, -this.y);
};

Point.prototype.abs = function () {
  return new Point(Math.abs(this.x), Math.abs(this.y));
};

Point.prototype.distTo = function (other) {
  return dist(this.x - other.x, this.y - other.y);
};

Point.prototype.deltaTo = function (other) {
  return new Point(other.x - this.x, other.y - this.y);
};

Point.prototype.roughTo = function (other) {
  return rdist(this.x - other.x, this.y - other.y);
};

Point.prototype.closestLine = function (other) {
  var deg = Math.round(Math.atan2(this.y - other.y, this.x - other.x) / Math.PI * 180) + 180;
  var a;
  var a15 = Math.round(deg / 15) * 15;
  a = a15;
  /*if (a15 % 45 != 0) {
    var a30 = Math.round(deg / 30) * 30;
    a = a30;
  }*/
  a = a / 180 * Math.PI;
  var d = this.distTo(other);

  return new Point(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d);
};

function dist(x, y) {
  return Math.sqrt(x * x + y * y);
}

function rdist(x, y) {
  return x * x + y * y;
}

function drawLine(ctx, a, b, o) {
  var x = o.x,
    y = o.y;
  ctx.beginPath();
  ctx.moveTo(a.x + x, a.y + y);
  ctx.lineTo(b.x + x, b.y + y);
  ctx.stroke();
}

function clear(screen) {
  screen.ctx.clearRect(0, 0, screen.width, screen.height);
}

function drawEllipse(ctx, x, y, w, h, dostroke, dofill) {
  var kappa = .5522848,
    ox = (w / 2) * kappa, // control point offset horizontal
    oy = (h / 2) * kappa, // control point offset vertical
    xe = x + w, // x-end
    ye = y + h, // y-end
    xm = x + w / 2, // x-middle
    ym = y + h / 2; // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
  if (dofill)
    ctx.fill();
  if (dostroke)
    ctx.stroke();
}

function drawRect(ctx, x, y, w, h, dostroke, dofill) {
  var xe = x + w,
    ye = y + h;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(xe, y);
  ctx.lineTo(xe, ye);
  ctx.lineTo(x, ye);
  ctx.closePath();
  if (dofill)
    ctx.fill();
  if (dostroke)
    ctx.stroke();
}