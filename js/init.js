new MouseListener(art);
new KeyListener(art, window);
new ResizeListener(art, window);
var menu = new Menu(art);
art.addWidgit(menu);

console.info("BSON is provided for my own ease of use. \
If JSON is preferred, simply look to this line of code - \
under which you'll find where you can change saving to JSON");

menu.addButton(new SimpleButton(art, "Save", function () {
  BSON.stringify_array(this.context.valueOf()).download("save.bson");
}));

var fileopen = new SimpleButton(art, "Open", null);
jl.bindFileOpen(fileopen.container, jl.readbin(function (contents) {
  art.fromVal(BSON.parse(contents));
}));

menu.addButton(fileopen);

menu.addButton(new SimpleButton(art, "None", function () {
  this.context.tool = null;
  if (menu.selected)
    menu.selected.container.classList.remove("selected");
  menu.selected = null;
}));

menu.addButton(new SimpleButton(art, "Undo", function () {
  this.context.basicUndo();
}));

menu.addButton(new SimpleButton(art, "Redo", function () {
  this.context.basicRedo();
}));

art.addTool(new GrabTool(), "Grab");

menu.addButton(new SimpleButton(art, "Clear", function () {
  var c = new ClearLayer(this.context);
  // not needed: this.context.push(c);
  // clear layer adds itself
  c.draw(this.context.screen.ctx, this.context);
}));


//art.setStroke("rgba(0,0,0,0.5)");
//art.setLineWidth(10);
art.addTool(new LineTool(), "Line");
art.addTool(new CircleTool(), "Circle");
art.addTool(new RectTool(), "Rect");
art.addTool(new FreeTool(), "Free");
menu.buttons[menu.buttons.length - 1].onclick();