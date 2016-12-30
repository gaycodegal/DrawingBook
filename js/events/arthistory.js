function History(context) {
  this.future = History.beginning;
  this.context = context;
  this.present = this.future;
  this.needsupdate = false;
}

History.beginning = 1;

History.prototype.didWrite = function () {
  var s = this.context.shapes;
  this.present = this.future = s.fill;
};

History.prototype.getPast = function () {
  return this.context.shapes.data.slice(0, this.present);
};

History.prototype.getFuture = function () {
  return this.context.shapes.data.slice(this.present, this.future);
};

History.prototype.setPresent = function (present) {
  var s = this.context.shapes;
  s.fill = this.present = present;
};

History.prototype.setPresentFuture = function (present) {
  var s = this.context.shapes;
  s.fill = this.present = this.future = present;
};

History.prototype.overwriteFuture = function (future) {
  var s = this.context.shapes;
  s.data = this.getPast().concat(future);
  this.future = this.present + future.length;
};

History.prototype.overwritePresent = function (history) {
  var nextfuture = this.future - this.present + history.length;
  var s = this.context.shapes;
  s.data = history.concat(s.data.slice(this.present, this.future));
  this.present = history.length;
  this.future = nextfuture;
  s.fill = this.present;
  s.size = this.future;
};

History.prototype.overwritePast = function (history) {
  var nextfuture = this.future - this.present + history.length + 1;
  var s = this.context.shapes;
  s.data = history.concat(s.data.slice(this.present - 1, this.future));
  this.present = history.length;
  this.future = nextfuture;
  s.fill = this.present;
  s.size = this.future;
};

History.prototype.redo = function () {
  var s = this.context.shapes;
  ++this.present;
  this.needsupdate = true;
  if (this.present > this.future)
    this.present = this.future;
  s.fill = this.present;
  if (s.peek().restore)
    s.peek().restore(this.context);
  if (this.needsupdate)
    this.context.redrawAll();
  this.needsupdate = false;
};

History.prototype.undo = function () {
  var s = this.context.shapes;
  --this.present;
  if (s.peek().revert)
    s.peek().revert(this.context);
  this.needsupdate = true;
  if (this.present < History.beginning)
    this.present = History.beginning;
  s.fill = this.present;
  if (this.needsupdate)
    this.context.redrawAll();
  this.needsupdate = false;
};