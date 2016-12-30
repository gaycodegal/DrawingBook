/////////////////////
//  Draws lines
//  special: ctrl / cmd, escape
/////////////////////

function LineTool() {
  this.last = null;
  this.temp = null;
  this.context = null;
  this.moved = false;
  jl.bind(this, ["modstraight", "cancel"]);
  this.modifiers = [17, 27, 91]; // must be in sorted order non decreasing
  this.modfns = [this.modstraight, this.cancel, this.modstraight];
  this.straight = false;
  this.cancelled = false;
}

LineTool.prototype.cancel = function (code, isDown) {
  if(!isDown) return;
  this.cancelled = true;
  this.last = null;
  this.temp = null;
  clear(this.tscreen);
};

LineTool.prototype.modstraight = function (code, isDown) {
  this.straight = isDown;
};

LineTool.prototype.setContext = function (context) {
  this.last = null;
  this.context = context;
  this.tctx = context.tscreen.ctx;
  this.tscreen = context.tscreen;
  this.ctx = context.screen.ctx;
};

LineTool.prototype.onselected = function () {
  this.last = null;
};

LineTool.prototype.ondown = function (point) {
  this.cancelled = false;
  this.temp = point;
  this.moved = false;
};

LineTool.prototype.ondrag = function (point) {
  if (this.cancelled) return;
  if (!this.moved) {
    this.moved = point.roughTo(this.temp) > 25;
  }
  if (this.moved) {
    clear(this.tscreen);
    if (this.straight)
      point = this.temp.closestLine(point);
    drawLine(this.tctx, this.temp, point, this.context.origin);
  }
};

LineTool.prototype.onup = function (point) {
  if (this.cancelled) return;
  var s = null;
  if (this.moved) {
    s = this.temp;
  } else if (this.last) {
    s = this.last;
  }
  if (s) {
    clear(this.tscreen);
    if (this.straight)
      point = s.closestLine(point);
    var line = new Line(s.x, s.y, point.x, point.y);
    line.draw(this.ctx, this.context);
    this.context.push(line);
  }
  this.last = point;
  this.moved = false;
};