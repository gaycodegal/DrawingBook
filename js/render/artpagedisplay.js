function PageButton(context, title, onclick) {
  this.container = jl.maker("button", "button-base wide-button noselect");
  this.container.innerHTML = title;
  this.context = context;
  if (onclick) {
    this.onclick = onclick;
    this.container.addEventListener("click", this.onclick);
  }
}

function PageMenu(context) {
  this.container = jl.divC("page-menu");
  this.context = context;
  jl.bind(this, ["deletepage", "gotopage", "newpagebefore", "newpageafter", "previous", "next", "close"]);
  var fileopen = new PageButton(this.context, "Open", null);
  jl.bindFileOpen(fileopen.container, jl.readbin((function (contents) {
    var val = BSON.parse(contents);
    this.fromVal(val);
    this.context.widgits.pageMenu.updatePage();
  }).bind(this.context)));

  this.addButton(fileopen);
  this.addButton(new PageButton(this, "Delete Page", this.deletepage));
  this.addButton(new PageButton(this, "New Page Before", this.newpagebefore));
  this.addButton(new PageButton(this, "New Page After", this.newpageafter));
  this.addButton(new PageButton(this, "Previous Page", this.previous));
  this.pagenum = jl.inputC("number", "page-num-input");
  this.addButton(this.pagenum);
  this.pagenum.value = 0;
  this.pagenum.addEventListener("change", this.gotopage);
  this.addButton(new PageButton(this, "Next Page", this.next));
  this.addButton(new PageButton(this, "Close", this.close));
}

PageMenu.prototype.gotopage = function () {
  console.log("a");
  this.context.loadPage(this.pagenum.value);
};

PageMenu.prototype.updatePage = function () {
  this.pagenum.value = this.context.index;
};

PageMenu.prototype.addButton = function (button) {
  jl.append(this, button);
};

PageMenu.prototype.close = function () {
  jl.show(this.context.context.widgits.menu);
  jl.hide(this.context.context.widgits.pageMenu);
};

PageMenu.prototype.deletepage = function () {
  if (confirm("Are you sure you want to delete this page?"))
    this.context.deletePage();
  this.updatePage();
};

PageMenu.prototype.newpagebefore = function () {
  this.context.newPageBefore();
  this.updatePage();
};

PageMenu.prototype.newpageafter = function () {
  this.context.newPageAfter();
  this.updatePage();
};

PageMenu.prototype.previous = function () {
  this.context.prevPage();
  this.updatePage();
};

PageMenu.prototype.next = function () {
  this.context.nextPage();
  this.updatePage();
};

art.addWidgit(new PageMenu(book), "pageMenu");
jl.hide(art.widgits.pageMenu);