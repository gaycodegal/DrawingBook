/////////////////////
//  Draws circles
//  special: ctrl / cmd, escape, shift
/////////////////////

function CircleTool() {
  this.last = null;
  this.temp = null;
  this.context = null;
  this.moved = false;
  jl.bind(this, ["modstraight", "modcenter", "cancel"]);
  this.modifiers = [16, 17, 27, 91]; // must be in sorted order non decreasing
  this.modfns = [this.modcenter, this.modstraight, this.cancel, this.modstraight];
  this.straight = false;
  this.modcenter = false;
  this.cancelled = false;
}

CircleTool.prototype.cancel = function (code, isDown) {
  if(!isDown) return;
  this.cancelled = true;
  this.last = null;
  this.temp = null;
  clear(this.tscreen);
};

CircleTool.prototype.modstraight = function (code, isDown) {
  this.straight = isDown;
};

CircleTool.prototype.modcenter = function (code, isDown) {
  this.modcenter = isDown;
};

CircleTool.prototype.setContext = function (context) {
  this.last = null;
  this.context = context;
  this.tctx = context.tscreen.ctx;
  this.tscreen = context.tscreen;
  this.ctx = context.screen.ctx;
};

CircleTool.prototype.onselected = function () {
  this.last = null;
};

CircleTool.prototype.ondown = function (point) {
  this.cancelled = false;
  this.temp = point;
  this.moved = false;
};

CircleTool.prototype.ondrag = function (point, isDown) {
  if (this.cancelled) return;
  var s = this.temp;
  if (!isDown) {
    s = this.last;
    this.moved = true;
  }
  if (!s) return;

  if (isDown && !this.moved) {
    this.moved = point.roughTo(this.temp) > 25;
  }

  if (this.moved) {
    clear(this.tscreen);
    if (this.straight)
      point = s.closestLine(point);
    var rect;
    if (this.modcenter)
      rect = Point.rectCenterPair(this.temp, point);
    else
      rect = Point.rectPair(this.temp, point);
    var c = this.context;
    drawEllipse(this.tctx, rect[0] + c.origin.x, rect[1] + c.origin.y, rect[2], rect[3], c.dostroke, c.dofill);
  }
};

CircleTool.prototype.onhover = CircleTool.prototype.ondrag;

CircleTool.prototype.onup = function (point) {
  if (this.cancelled) return;
  var s = null;
  if (this.last && !this.moved) {
    s = this.last;
  } else if (this.moved) {
    s = this.temp;
  }
  if (s) {
    if (this.straight)
      point = s.closestLine(point);
    clear(this.tscreen);
    var rect;
    if (this.modcenter)
      rect = Point.rectCenterPair(s, point);
    else
      rect = Point.rectPair(s, point);
    var c = this.context;
    drawEllipse(this.ctx, rect[0] + c.origin.x, rect[1] + c.origin.y, rect[2], rect[3], c.dostroke, c.dofill);
    this.last = null;
    this.context.push(new Circle(rect[0], rect[1], rect[2], rect[3], c.dostroke, c.dofill));
  } else {
    this.last = point;
  }
  this.moved = false;
};