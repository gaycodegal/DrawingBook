/////////////////////
//  Draws squiggles
//  special: escape
/////////////////////

function FreeTool() {
  this.stack = new Stack(512);
  this.last = null;
  this.temp = null;
  this.context = null;
  this.moved = false;
  jl.bind(this, ["cancel"]);
  this.modifiers = [27]; // must be in sorted order non decreasing
  this.modfns = [this.cancel];
  this.straight = false;
  this.modcenter = false;
  this.cancelled = false;
  this.delay = 0;
}

FreeTool.prototype.cancel = function (code, isDown) {
  if (!isDown) return;
  this.stack.wipe();
  this.cancelled = true;
  clear(this.tscreen);
};
/*
FreeTool.prototype.modstraight = function (code, isDown) {
  this.straight = isDown;
};

FreeTool.prototype.modcenter = function (code, isDown) {
  this.modcenter = isDown;
};
*/
FreeTool.prototype.setContext = function (context) {
  this.stack.wipe();
  this.context = context;
  this.tctx = context.tscreen.ctx;
  this.tscreen = context.tscreen;
  this.ctx = context.screen.ctx;
};

FreeTool.prototype.onselected = function () {
  this.stack.wipe();
};

FreeTool.prototype.ondown = function (point) {
  this.stack.wipe();
  this.cancelled = false;
  this.stack.push(point);
};

FreeTool.prototype.ondrag = function (sc) {
  if (this.cancelled) return;
  var sb = this.stack.peek(),
    sa = this.stack.peek(2);
  this.stack.push(sc);
  if (!sa) return;
  drawQuad(this.tctx, sa.midPoint(sb), sb, sb.midPoint(sc), this.context.origin);

};

FreeTool.prototype.onup = function (point) {
  if (this.cancelled) return;
  this.stack.push(point);
  clear(this.tscreen);
  drawFree(this.ctx, this.stack.data, this.stack.fill, this.context.origin);
  this.context.push(new FreeLine(this.stack.data.slice(0, this.stack.fill)));
};

function drawQuad(ctx, a, b, c, o) {
  var x = o.x,
    y = o.y;
  ctx.beginPath();
  ctx.moveTo(a.x + x, a.y + y);
  ctx.quadraticCurveTo(b.x + x, b.y + y, c.x + x, c.y + y);
  ctx.stroke();
}

function drawFree(ctx, data, len, o) {
  var x = o.x,
    y = o.y;
  var i = 1;
  var pA = data[i];
  var pB = data[i - 1];
  if (len < 3) {
    if (len == 2)
      drawLine(ctx, pA, pB, o);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pA.x + x, pA.y + y);
  while (i < len) {
    var m = pA.midPoint(pB);
    ctx.quadraticCurveTo(pA.x + x, pA.y + y, m.x + x, m.y + y);
    pA = data[i];
    pB = data[++i];
  }
  ctx.stroke();
}