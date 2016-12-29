/////////////////////
//  Moves the whole drawing about
//  special: escape, up, down, left, right, r
/////////////////////

function GrabTool() {
  this.context = null;
  this.moved = false;
  jl.bind(this, ["cancel","pageu","paged","pagel","pager","reset"]);
  this.modifiers = [27, 37, 38, 39, 40, 82]; // must be in sorted order non decreasing
  this.modfns = [this.cancel, this.pagel, this.pageu, this.pager, this.paged, this.reset];
  this.straight = false;
  this.cancelled = false;
}

GrabTool.prototype.cancel = function (code, isDown) {
  if (!isDown) return;
  this.cancelled = true;
};

GrabTool.prototype.reset = function (code, isDown) {
  if (!isDown) return;
  var c = this.context;
  c.origin = new Point();
  c.transform = c.offset.translate(c.origin.negate());
  c.redrawAll();
};

GrabTool.prototype.pageu = function (code, isDown) {
  if (!isDown) return;
  this.transform(new Point(0, this.context.screen.height/2));
};

GrabTool.prototype.paged = function (code, isDown) {
  if (!isDown) return;
  this.transform(new Point(0, -this.context.screen.height/2));
};

GrabTool.prototype.pagel = function (code, isDown) {
  if (!isDown) return;
  this.transform(new Point(this.context.screen.width/2, 0));
};

GrabTool.prototype.pager = function (code, isDown) {
  if (!isDown) return;
  this.transform(new Point(-this.context.screen.width/2, 0));
};

GrabTool.prototype.setContext = function (context) {
  this.context = context;
  this.tctx = context.tscreen.ctx;
  this.tscreen = context.tscreen;
  this.ctx = context.screen.ctx;
  this.grabpoint = null;
};

GrabTool.prototype.onselected = function () {
  this.last = null;
};

GrabTool.prototype.ondown = function (point) {
  this.cancelled = false;
  this.temp = point;
  this.moved = false;
  this.grabpoint = Point.fromPoint(point);
};

GrabTool.prototype.ondrag = function (point) {
  if (this.cancelled) return;
  var delta = point.translate(this.grabpoint.negate());
  this.transform(delta);
};

GrabTool.prototype.transform = function(p){
  var c = this.context;
  c.origin.add(p);
  c.transform = c.offset.translate(c.origin.negate());
  c.redrawAll();
};

GrabTool.prototype.onup = function (point) {
  this.grabpoint = null;
};