function Stack(size, array_type) {
	array_type || (array_type = Array);
	this.size = size;
	this.fill = 0;
	this.data = new array_type(this.size);
}

Stack.prototype.peek = function (i) {
  i = this.fill - (i || 1);
  if(i < 0)
    return null;
	return this.data[i];
};

Stack.prototype.get = function (i) {
	return this.data[i];
};

Stack.prototype.pop = function () {
	return this.data[--this.fill];
};

Stack.prototype.push = function (d) {
	if (this.fill == this.size)
		this.grow(this.size << 1);
	this.data[this.fill++] = d;
};

Stack.prototype.grow = function (newSize) {
	var oldSize = this.fill,
		oldData = this.data;
	this.size = newSize;
	this.data = new Array(this.size);
	for (var i = 0; i < oldSize; ++i) {
		this.data[i] = oldData[i];
	}
	oldData = null;
};

Stack.prototype.shrink = function () {
	this.grow(this.fill);
};

Stack.prototype.wipe = function () {
	this.fill = 0;
};