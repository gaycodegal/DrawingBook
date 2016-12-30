Shape = {
  fromVal: function (val, context) {
    var r = window[val[0]].fromVal(val.slice(1), context);
    return r;
  },
  pointListValueOf: function (points) {
    var len = points.length;
    var data = new Array(len * 2);
    for (var i = 0, j = 0; i < len; ++i) {
      data[j++] = points[i].x;
      data[j++] = points[i].y;
    }
    return data;
  },
  pointListfromVal: function (data) {
    var len = data.length;
    var points = new Array(len / 2);
    for (var i = 0, j = 0; j < len; j += 2) {
      points[i++] = new Point(data[j], data[j + 1]);
    }
    return points;
  }
};

function FreeLine(points) {
  this.points = points;
}

FreeLine.fromVal = function (val) {
  return new FreeLine(Shape.pointListfromVal(val[0]));
};

FreeLine.prototype.valueOf = function () {
  return ["FreeLine", Shape.pointListValueOf(this.points)];
};

FreeLine.prototype.draw = function (ctx, c) {
  drawFree(ctx, this.points, this.points.length, c.origin);
};


function ClearLayer(context) {
  if (context.shapes.peek().constructor == ClearLayer) {
    console.warn("Two clears in a row. Resolved to one.");
    return;
  }

  this.future = null;
  this.past = null;
  if (context)
    this.restore(context);
}

ClearLayer.prototype.revert = function (context) {
  if (this.future) return;
  this.future = context.history.getFuture();
  if (this.past) {
    context.history.overwritePresent(this.past);
  }
  this.past = null;
};

ClearLayer.prototype.restore = function (context) {
  if (this.past) return;
  if (context.shapes.peek() == this)
    context.shapes.fill = --context.history.present;
  this.past = context.history.getPast();
  context.history.setPresentFuture(History.beginning);

  if (this.future) {
    context.history.overwriteFuture(this.future);
    this.future = context.history.future;
  }
  context.push(this);
  if (this.future) {
    context.history.future = this.future;
  }
  this.future = null;


};

ClearLayer.fromVal = function (val) {
  return new ClearLayer();
};

ClearLayer.prototype.valueOf = function () {
  return ["ClearLayer"];
};

ClearLayer.prototype.draw = function (ctx, c) {
  clear(c.screen);
  clear(c.tscreen);
};

function Circle(x, y, w, h, s, f) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.s = s;
  this.f = f;
}

Circle.fromVal = function (val) {
  return new Circle(val[0], val[1], val[2], val[3], val[4], val[5]);
};

Circle.prototype.valueOf = function () {
  return ["Circle", this.x, this.y, this.w, this.h, this.s, this.f];
};

Circle.prototype.draw = function (ctx, c) {
  drawEllipse(ctx, this.x + c.origin.x, this.y + c.origin.y, this.w, this.h, this.s, this.f);
};

function Line(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}

Line.fromVal = function (val) {
  return new Line(val[0], val[1], val[2], val[3]);
};

Line.prototype.valueOf = function () {
  return ["Line", this.x1, this.y1, this.x2, this.y2];
};

Line.prototype.draw = function (ctx, c) {
  ctx.beginPath();
  ctx.moveTo(this.x1 + c.origin.x, this.y1 + c.origin.y);
  ctx.lineTo(this.x2 + c.origin.x, this.y2 + c.origin.y);
  ctx.stroke();
};

function Rect(x, y, w, h, s, f) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.s = s;
  this.f = f;
}

Rect.fromVal = function (val) {
  return new Rect(val[0], val[1], val[2], val[3], val[4], val[5]);
};

Rect.prototype.valueOf = function () {
  return ["Rect", this.x, this.y, this.w, this.h, this.s, this.f];
};

Rect.prototype.draw = function (ctx, c) {
  drawRect(ctx, this.x + c.origin.x, this.y + c.origin.y, this.w, this.h, this.s, this.f);

};

function ContextState(ctx) {
  var obs = ContextState.observed,
    size = obs.length;
  this.state = new Array(size);
  for (var i = 0; i < size; ++i) {
    this.state[i] = ctx[obs[i]];
  }
}


ContextState.fromVal = function (val) {
  var c = new ContextState({});
  c.state = val[0];
  return c;
};

ContextState.prototype.valueOf = function () {
  return ["ContextState", this.state];
};

ContextState.prototype.draw = function (ctx, c) {
  var obs = ContextState.observed,
    size = obs.length;
  for (var i = 0; i < size; ++i) {
    c.screen.ctx[obs[i]] = this.state[i];
    c.tscreen.ctx[obs[i]] = this.state[i];
  }
};

ContextState.observed = ["strokeStyle", "fillStyle", "lineWidth"];
ContextState.defaults = {strokeStyle:"#000000", fillStyle:"#000000", lineWidth:3};