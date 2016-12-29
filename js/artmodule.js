//this does a find and replace for
//#define x y;
//rules in css. I used it as it's useful, not for speed
jl.stylefix();

/////////////////////
//  menu buttons
/////////////////////

function ToolButton(tool, context, title) {
  this.container = jl.maker("button", "tool-button noselect");
  this.container.innerHTML = title;
  this.tool = tool;
  this.context = context;
  jl.bind(this, ["onclick"]);
  this.container.addEventListener("click", this.onclick);
}

ToolButton.prototype.onclick = function () {
  this.context.onclick(this);
  this.container.classList.add("selected");
};

function SimpleButton(context, title, onclick) {
  this.container = jl.maker("button", "tool-button noselect");
  this.container.innerHTML = title;
  this.context = context;
  if (onclick) {
    this.onclick = onclick;
    jl.bind(this, ["onclick"]);
    this.container.addEventListener("click", this.onclick);
  }
}

/////////////////////
//  A simple menu
/////////////////////

function Menu(context) {
  this.container = jl.divC("art-menu");
  this.context = context;
  this.selected = null;
  this.buttons = [];
  jl.bind(this, ["ontoolregistered"]);
  context.container.addEventListener("toolregistered", this.ontoolregistered)
}

Menu.prototype.onclick = function (button) {
  if (this.selected)
    this.selected.container.classList.remove("selected");
  this.selected = button;
  this.context.selectTool(button.tool);
};

Menu.prototype.addButton = function (button) {
  jl.append(this, button);
};

Menu.prototype.ontoolregistered = function (event) {
  var r = new ToolButton(event.detail.tool, this, event.detail.title);
  this.buttons.push(r);
  jl.append(this, r);
};

/////////////////////
//  Main program
/////////////////////

function ArtModule() {
  //events are posted to this container
  //also holds the art program
  this.container = jl.divC("art-module");
  this.screen = new jl.Canvas();
  //by default we want the full screen
  this.screen.assumeFull();
  this.tscreen = new jl.Canvas();
  this.tscreen.assumeFull();
  this.screen.ctx.lineCap = this.tscreen.ctx.lineCap = "round";
  this.screen.ctx.lineJoin = this.tscreen.ctx.lineJoin = "round";
  jl.append(this, this.screen);
  jl.append(this, this.tscreen);
  jl.append(document.body, this);
  this.tool = null;
  this.downtool = null;
  //little things that clutter the screen, like the menu.
  this.widgits = [];
  this.tools = [];
  //list of all the things on the screen
  //starts with something that will remember the stroke / fill
  //color we're drawing with, line width.
  this.shapes = new Stack(32);
  this.shapes.push(new ContextState(this.screen.ctx));
  this.setLineWidth(3);
  var rect = this.screen.canvas.getBoundingClientRect();
  //we'll use this to make sure we're always drawing on the screen.
  this.offset = (new Point(rect.left, rect.top)).negate();
  this.dostroke = true;
  this.dofill = false;
  this.origin = new Point();
  this.transform = this.offset.translate(this.origin.negate());
}

ArtModule.prototype.basicUndo = function () {
  --this.shapes.fill;
  if(this.shapes.fill < 2)
    return ++this.shapes.fill;
  this.redrawAll();
};

ArtModule.prototype.basicRedo = function () {
  ++this.shapes.fill;
  if (this.fill > this.size || !this.shapes.peek())
    return --this.shapes.fill;
  this.redrawAll();
};

ArtModule.prototype.valueOf = function () {
  var vals = new Array(this.shapes.length);
  for (var i = 0, data = this.shapes.data, len = this.shapes.fill; i < len; ++i) {
    vals[i] = data[i].valueOf();
  }
  return [this.screen.width, this.screen.height, vals];
};

ArtModule.prototype.toString = function () {
  return JSON.stringify(this.valueOf());
};

ArtModule.prototype.fromVal = function (rep) {
  this.screen.setBounds(rep[0], rep[1]);
  this.tscreen.setBounds(rep[0], rep[1]);
  this.origin = new Point();
  this.transform = this.offset.translate(this.origin.negate());
  var vals = rep[2];
  this.shapes.wipe();
  for (var i = 0; i < vals.length; ++i) {
    this.shapes.push(Shape.fromVal(vals[i]));
  }
  this.redrawAll();
};

ArtModule.prototype.fromString = function (str) {
  var rep = JSON.parse(str);
  this.fromVal(rep);
};

ArtModule.prototype.setFill = function (color) {
  this.screen.ctx.fillStyle = color;
  var state = new ContextState(this.screen.ctx);
  state.draw(this.tscreen.ctx, this);
  this.shapes.push(state);
};

ArtModule.prototype.setStroke = function (color) {
  this.screen.ctx.strokeStyle = color;
  var state = new ContextState(this.screen.ctx);
  state.draw(this.tscreen.ctx, this);
  this.shapes.push(state);
};

ArtModule.prototype.setLineWidth = function (width) {
  this.screen.ctx.lineWidth = width;
  var state = new ContextState(this.screen.ctx);
  state.draw(this.tscreen.ctx, this);
  this.shapes.push(state);
};

//redraws the image given the shapes that were drawn to it.
ArtModule.prototype.redrawAll = function () {
  clear(this.screen);
  clear(this.tscreen);
  var ctx = this.screen.ctx;
  for (var i = 0, data = this.shapes.data, len = this.shapes.fill; i < len; ++i) {
    data[i].draw(ctx, this);
  }
};

ArtModule.prototype.selectTool = function (tool) {
  if (this.tool && this.tool.ontoolchange)
    this.tool.ontoolchange(tool);
  this.tool = tool;
  if (tool && tool.onselected)
    tool.onselected();
};

ArtModule.prototype.addTool = function (tool, title) {
  tool.setContext(this);
  this.tools.push(tool);
  var event = new CustomEvent("toolregistered", {
    detail: {
      tool: tool,
      title: title,
      index: this.tools.length - 1
    }
  });
  this.container.dispatchEvent(event);
};

ArtModule.prototype.addWidgit = function (widgit) {
  this.widgits.push(widgit);
  jl.append(this.container, widgit);
};

var art = new ArtModule();