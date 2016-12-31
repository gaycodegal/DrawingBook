function Book(context) {
  this.context = context;
  this.index = 0;
  this.current = new Page(context);
  this.pages = [this.current];
  this.named = {};
  this.current.load();
  this.context.redrawAll();
}

Book.version = "0.1";

Book.prototype.newPageBefore = function () {
  var page = new Page(this.context);
  this.pages.splice(this.index, 0, page);
  ++this.index;
  this.prevPage();
};

Book.prototype.newPageAfter = function () {
  var page = new Page(this.context);
  this.pages.splice(this.index + 1, 0, page);
  this.nextPage();
};

Book.prototype.valueOf = function () {
  this.current.save();
  var pages = new Array(this.pages);
  for (var i = 0; i < this.pages.length; ++i) {
    pages[i] = this.pages[i].valueOf();
  }
  this.current.load();
  //in case someone wants to open a file and only has the saved file
  return ["(https://github.com/stephoro/DrawingBook)", Book.version, this.index, pages];
};

Book.prototype.fromVal = function (val) {
  if (val[1] != Book.version) {
    console.error("Tried to load a book of the wrong version - please convert!");
    alert("Tried to load a book of the wrong version - please convert!");
    return;
  }
  this.index = val[2];
  var pages = val[3];
  this.pages = new Array(pages.length);
  for (var i = 0; i < this.pages.length; ++i) {
    this.pages[i] = new Page(this.context);
    (this.pages[i]).fromVal(pages[i]);
    if (this.pages[i].name)
      this.named[this.pages[i].name] = this.pages[i];
    this.pages[i].name = i;
  }
  this.current = this.pages[this.index];
  this.current.load();
  this.context.redrawAll();
};

Book.prototype.loadPage = function (index) {
  if (index < 0 || index > this.pages.length) {
    console.error("Invalid page number:", index);
    return;
  }
  this.current.save();
  this.index = index;

  this.current = this.pages[this.index];
  this.current.load();
  this.context.redrawAll();
};

Book.prototype.deletePage = function () {
  this.pages.splice(this.index, 1);
  if (this.pages.length == 0) {
    this.pages = [this.current];
    this.named = {};
    this.current.load();
    this.context.redrawAll();
  } else {
    if (this.index < this.pages.length)
      ++this.index;
    this.prevPage();
  }
};

Book.prototype.nextPage = function () {
  this.current.save();
  ++this.index;
  if (this.index >= this.pages.length) {
    //warn that this is the end of the book, ask if you want a new page?
    console.warn("This is the end of the book.\nDo you want a new page?");
    --this.index;
  } else {
    this.current = this.pages[this.index];
    this.current.load();
    this.context.redrawAll();
  }
};

Book.prototype.prevPage = function () {
  this.current.save();
  --this.index;
  if (this.index < 0) {
    //warn that this is the end of the book, ask if you want a new page?
    console.warn("This is the start of the book.\nDo you want a new page?");
    this.index = 0;
  } else {
    this.current = this.pages[this.index];
    this.current.load();
    this.context.redrawAll();
  }
};

function Page(context, index) {
  this.name = null;
  this.context = context;
  this.present = this.future = History.beginning;
  this.data = [new ContextState(ContextState.defaults)];
}
Page.prototype.valueOf = function () {
  this.load();
  return [this.name, this.context.valueOf()];
};

Page.prototype.fromVal = function (val) {
  this.name = val[0];
  this.context.fromVal(val[1])
  this.save();
};

Page.prototype.load = function () {
  var c = this.context,
    s = c.shapes;
  s.data = this.data;
  s.fill = c.history.present = this.present;
  c.history.future = this.future;
};

Page.prototype.save = function () {
  var c = this.context,
    s = c.shapes;
  this.data = s.data.slice(0);
  this.present = c.history.present;
  this.future = c.history.future;
};