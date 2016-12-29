function ResizeListener(context, target) {
  this.context = context;
  this.target = target;
  jl.bind(this, ["onresize"]);
  target.addEventListener("resize", this.onresize);
}

ResizeListener.prototype.onresize = function () {
  this.context.screen.assumeFull();
  this.context.tscreen.assumeFull();
  this.context.transform = this.context.offset.translate(this.context.origin.negate());
  this.context.redrawAll();
};