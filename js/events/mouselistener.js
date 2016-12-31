function MouseListener(context) {
  this.context = context;
  this.temp = null;
  jl.bind(this, ["ondown", "onmove", "onup"]);
  context.tscreen.canvas.addEventListener("touchstart", this.ondown);
  context.tscreen.canvas.addEventListener("mousedown", this.ondown);
  context.tscreen.canvas.addEventListener("touchmove", this.onmove);
  context.tscreen.canvas.addEventListener("mousemove", this.onmove);
  context.tscreen.canvas.addEventListener("touchend", this.onup);
  context.tscreen.canvas.addEventListener("mouseup", this.onup);
}

MouseListener.prototype.ondown = function (event) {
  event.preventDefault();
  event.stopPropagation();
  var ctx = this.context;
  ctx.downtool = ctx.tool;
  if (!ctx.tool)
    return;
  var pt = Point.fromEvent(event).add(ctx.transform);
  this.temp = pt;
  if (ctx.tool.ondown)
    ctx.tool.ondown(pt);
};

MouseListener.prototype.onmove = function (event) {
  event.preventDefault();
  event.stopPropagation();
  var ctx = this.context;
  if (!ctx.tool)
    return;
  var pt = Point.fromEvent(event).add(ctx.transform);
  this.temp = pt;
  if (ctx.downtool == ctx.tool && ctx.tool.ondrag) {
    ctx.tool.ondrag(pt, true);
  } else if (ctx.downtool != ctx.tool && ctx.tool.onhover) {
    ctx.tool.onhover(pt, false);
  }
};

MouseListener.prototype.onup = function (event) {
  event.preventDefault();
  event.stopPropagation();
  var ctx = this.context;
  ctx.downtool = null;
  if (!ctx.tool)
    return;

  if (ctx.tool.onup)
    ctx.tool.onup(this.temp);
};