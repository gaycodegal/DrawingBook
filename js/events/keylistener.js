function KeyListener(context, target) {
  this.context = context;
  this.target = target;
  this.down = [];
  this.held = new Array(256);

  jl.bind(this, ["onkeydown", "onkeyup"]);
  target.addEventListener("keydown", this.onkeydown);
  target.addEventListener("keyup", this.onkeyup);
}

KeyListener.prototype.onkeydown = function (event) {
  var code = event.keyCode || event.which;
  if(this.held[code])
    return;
  console.log(code);
  this.held[code] = 1;
  this.down.push(code);
  var tool = this.context.tool;
  if (!tool)
    return;
  if (tool.modifiers) {
    var mods = tool.modifiers;
    var fns = tool.modfns;
    var i = mods.binaryIndexOf(code);
    if (mods[i] == code) {
      fns[i](code, true);
    }
  }
};

KeyListener.prototype.onkeyup = function () {
  var code = event.keyCode || event.which;
  this.held[code] = 0;
  this.down.push(code);
  var tool = this.context.tool;
  if (!tool)
    return;
  if (tool.modifiers) {
    var mods = tool.modifiers;
    var fns = tool.modfns;
    var i = mods.binaryIndexOf(code);
    if (mods[i] == code) {
      fns[i](code, false);
    }
  }
};