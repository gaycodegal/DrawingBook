var BSON = {
  /**
  WARNING: NOT THE THING YOU PROBABLY WANT
  Parses a BSON.CharArray into a javascript object.
  @return {any} some javascript object, number, string, array, ect.
  */
  parse_array: function (array) {
    var obj = BSON.readArray(array);
    return obj;
  },
  /**
  WARNING: NOT THE THING YOU PROBABLY WANT
  Turns a javascript object into a BSON.CharArray.
  @return {BSON.CharArray} the binary data in a CharArray
  */
  stringify_array: function (object) {
    var array = new BSON.CharArray(this.getBytes(object));
    this.fillArray(object, array);
    array.rollBack();
    return array;
  },
  /**
  Turns a string into a javascript object.
  @return {any} some javascript object, number, string, array, ect.
  */
  parse: function (string) {
    var chr = new BSON.CharArray();
    chr.initWithString(string);
    return BSON.readArray(chr);
  },
  /**
  Turns a javascript object into a string.
  @return {String} the binary data in a String
  */
  stringify: function (object) {
    return BSON.stringify_array(object).toString();
  },
  /**
  the maximum a float should be able to represent with 32 bits.
  */
  floatMAX: (2 - Math.pow(2, -23)) * Math.pow(2, 127),
  /**
  get the number of bytes necessary to store the object.
  */
  getBytes: function (object) {
    if (object === null)
      return 1;
    if (object === undefined)
      return 1;
    if (object.valueOf)
      object = object.valueOf();
    var type = typeof object;
    if (type == "number") { //int
      if (!isFinite(object)) //isNaN + Infinities
        return 1 + 4; // float NaN
      if (object <= 4294967295 && object >= -2147483648 && object == (object | 0)) {
        if (0 < object) {
          if (object <= 255)
            return 1 /*type*/ + 1 /*data*/
          if (object <= 65535)
            return 1 /*type*/ + 2 /*data*/
          if (object <= 4294967295)
            return 1 /*type*/ + 4 /*data*/
          return 1 /*type*/ + 8 /*data*/
        } else {
          if (-128 <= object && object <= 127)
            return 1 /*type*/ + 1 /*data*/
          if (-32768 <= object && object <= 32767)
            return 1 /*type*/ + 2 /*data*/
          if (-2147483648 <= object && object <= 2147483647)
            return 1 /*type*/ + 4 /*data*/
          return 1 /*type*/ + 8 /*data*/
        }
      }
      if (-BSON.floatMAX <= object && object <= BSON.floatMAX) {
        return 1 + 4;
      }
      //double
      return 1 + 8;
    }
    if (type == "boolean")
      return 1;
    if (type == "string") {
      return 1 + BSON.getBytes(object.length) + object.length;
    }
    if (type == "function")
      return 0;
    if (object instanceof Array) {
      var sum = 1 + BSON.getBytes(object.length);
      for (var i = 0; i < object.length; ++i) {
        sum += BSON.getBytes(object[i]);
      }
      return sum;
    }
    var keys = Object.keys(object),
      bad = 0;
    for (var i = 0; i < keys.length; ++i) {
      if (object[keys[i]] instanceof Function) {
        ++bad;
        keys[i] = null;
      }
    }
    var sum = 1 + BSON.getBytes(keys.length - bad);
    for (var i = 0; i < keys.length; ++i) {
      if (keys[i] !== null)
        sum += BSON.getBytes(keys[i]) + BSON.getBytes(object[keys[i]]);
    }
    return sum;
  },
  /**
  fill a given CharArray with the binary representation of an object.
  */
  fillArray: function (object, array) {
    if (object === null)
      return array.writeUint8(1);
    if (object === undefined)
      return array.writeUint8(2);
    if (object.valueOf)
      object = object.valueOf();
    var type = typeof object;
    if (type == "number") { //int

      if (!isFinite(object)) { //isNaN + Infinities
        array.writeUint8(11);
        array.writeFloat(object);
        return;
      }
      if (object <= 4294967295 && object >= -2147483648 && object == Math.floor(object)) {
        if (0 < object) {
          if (object <= 255) {
            array.writeUint8(5);
            array.writeUint8(object);
            return;
          }
          if (object <= 65535) {
            array.writeUint8(6);
            array.writeUint16(object);
            return;
          }
          if (object <= 4294967295) {
            array.writeUint8(7);
            array.writeUint32(object);
            return;
          }
          throw new Error("Number too large!");
        } else {
          if (-128 <= object && object <= 127) {
            array.writeUint8(8);
            array.writeInt8(object);
            return;
          }
          if (-32768 <= object && object <= 32767) {
            array.writeUint8(9);
            array.writeInt16(object);
            return;
          }
          if (-2147483648 <= object && object <= 2147483647) {
            array.writeUint8(10);
            array.writeInt32(object);
            return;
          }
          throw new Error("Number too large!");
        }
      }
      if (-BSON.floatMAX < object && object < BSON.floatMAX) {
        array.writeUint8(11);
        array.writeFloat(object);
        return;
      }
      //double
      array.writeUint8(12);
      throw new Error("Number too large!");
    }
    if (type == "boolean")
      return array.writeUint8(object ? 3 : 4);
    if (type == "string") {
      array.writeUint8(16);
      BSON.fillArray(object.length, array);
      array.writeString(object);
      return;
    }
    if (type == "function")
      return 0;
    if (object instanceof Array) {
      array.writeUint8(18);
      BSON.fillArray(object.length, array);
      for (var i = 0; i < object.length; ++i) {
        BSON.fillArray(object[i], array);
      }
      return;
    }
    var keys = Object.keys(object),
      bad = 0;
    for (var i = 0; i < keys.length; ++i) {
      if (object[keys[i]] instanceof Function) {
        ++bad;
        keys[i] = null;
      }
    }
    array.writeUint8(32);
    BSON.fillArray(keys.length - bad, array);
    for (var i = 0; i < keys.length; ++i) {
      if (keys[i] !== null) {
        BSON.fillArray(keys[i], array);
        BSON.fillArray(object[keys[i]], array);
      }
    }
    return;
  },
  /**
  reads a binary CharArray and returns the generated object
  */
  readArray: function (array) {
    var type = array.getUint8();
    switch (type) {
    case 1:
      return null;
    case 2:
      return undefined;
    case 3:
        return true;
    case 4:
        return false;
    case 5:
      return array.getUint8();
    case 6:
      return array.getUint16();
    case 7:
      return array.getUint32();
    case 8:
      return array.getInt8();
    case 9:
      return array.getInt16();
    case 10:
      return array.getInt32();
    case 11:
      return array.getFloat();
    case 12:
      break;
    case 16:
      var len = BSON.readArray(array);
      return array.getString(len);
    case 18:
      var len = BSON.readArray(array);
      var ary = new Array(len);
      for (var i = 0; i < len; ++i) {
        ary[i] = BSON.readArray(array);
      }
      return ary;
    case 32:
      var len = BSON.readArray(array);
      var obj = {};
      while (len--) {
        var key = BSON.readArray(array);
        obj[key] = BSON.readArray(array);
      }
      return obj;

    };
  }
};

(function () {
  /**
creates a buffer to write data into or read out of.
does the main work behind converting things into binary or back
@constructor
@this {CharArray}
@param {int?} size The number of bytes this can hold. 
If not provided, you have to use the init methods.
*/
  function CharArray(size) {
    this.length = size || 0;
    this.readHead = 0;
    this.buffer = (size && new CharArray.Array(size)) || null;
  }

  /**
  The type of array used to store bits. 
  */
  CharArray.Array = Uint8Array || Array;

  /**
  Init the array with a binary string.
  */
  CharArray.prototype.initWithString = function (string) {
    this.readHead = 0;
    this.length = string.length;
    this.buffer = string.split("");
    for (var i = 0; i < this.length; i++) {
      this.buffer[i] = this.buffer[i].charCodeAt(0);
    }
    return this;
  };

  /**
  Init the readHead, length, and buffer
  */
  CharArray.prototype.initWithRLB = function (readHead, length, buffer) {
    this.readHead = readHead;
    this.length = length;
    this.buffer = buffer;
    return this;
  };

  /**
  Access the Uint8Array
  */
  CharArray.prototype.getBuffer = function () {
    return this.buffer;
  };

  /**
  Get a string from the Array.
  if you provide a length, that will
  be the length of the string.
  otherwise, it will assume null termination.
  */
  CharArray.prototype.getString = function (len) {
    var start = this.readHead;
    if (len === undefined) {
      while (this.buffer[this.readHead++] != '\0'.charCodeAt(0));
      len = this.readHead - start;
    } else {
      this.readHead += len;
      ++len;
    }
    var array = new Array(--len);
    while (len--) {
      array[len] = String.fromCharCode(this.buffer[len + start]);
    }
    return array.join("");
  };

  /**
  Converts into a string, where the characters 
  of the string are the direct bits of the buffer.
  */
  CharArray.prototype.toString = function () {
    var index = this.length;
    var array = new Array(index);
    while (index--) {
      array[index] = String.fromCharCode(this.buffer[index]);
    }
    return array.join("");
  };

  /**
  resets the readHead to zero, so that the array
  can be read again.
  */
  CharArray.prototype.rollBack = function () {
    this.readHead = 0;
    return this;
  };

  /**
  brings the readhead back by the specified amount.
  Generally used for reading things twice.
  */
  CharArray.prototype.rollBackBy = function (amount) {
    this.readHead -= amount;
    return this;
  };

  /**
  Get a float from the buffer.
  */
  CharArray.prototype.getFloat = function () {
    return binToFloat(this.getInt32());
  };

  /**
  Get a signed int32 from the array
  */
  CharArray.prototype.getInt32 = function () {
    var ret = ((this.buffer[this.readHead] << 24) |
      (this.buffer[this.readHead + 1] << 16) |
      (this.buffer[this.readHead + 2] << 8) |
      (this.buffer[this.readHead + 3])) | 0;
    this.readHead += 4;
    return ret;
  };

  /**
  Get an unsigned int32 from the array
  */
  CharArray.prototype.getUint32 = function () {
    var ret = ((this.buffer[this.readHead] << 24) |
      (this.buffer[this.readHead + 1] << 16) |
      (this.buffer[this.readHead + 2] << 8) |
      (this.buffer[this.readHead + 3])) | 0;
    this.readHead += 4;
    if (ret < 0)
      return -ret + 0x80000000;
    return ret;
  };

  /**
  Get an unsigned int16 from the array
  */
  CharArray.prototype.getUint16 = function () {
    var ret = (this.buffer[this.readHead] << 8) |
      (this.buffer[this.readHead + 1]);
    this.readHead += 2;
    return ret;
  };

  /**
  Get a signed int16 from the array
  */
  CharArray.prototype.getInt16 = function () {
    var ret = (this.buffer[this.readHead] << 8) |
      (this.buffer[this.readHead + 1]);
    this.readHead += 2;
    if (ret & 0x8000)
      return 0xFFFF0000 | ret;
    return ret;
  };

  /**
  Get an unsigned int16 from the array
  */
  CharArray.prototype.getUint8 = function () {
    return this.buffer[this.readHead++];
  };

  /**
  Get a signed int16 from the array
  */
  CharArray.prototype.getInt8 = function () {
    var ret = this.buffer[this.readHead++];
    if (ret & 0x80)
      return 0xFFFFFF00 | (ret);
    return ret;
  };

  /**
  Downloads the contents of the char array as binary
  to a file of the specified name.
  */
  CharArray.prototype.download = function (filename) {


    var element = document.createElement('a');



    element.style.display = 'none';
    document.body.appendChild(element);

    var blob = new Blob([this.buffer], {
        type: "octet/stream"
      }),
      url = window.URL.createObjectURL(blob);
    element.href = url;
    element.download = filename;
    element.click();
    window.URL.revokeObjectURL(url);



    document.body.removeChild(element);
  };

  /**
  Get a subsequence from the start to length. 
  Works, but deprecated. Don't use yet.
  @private
  */
  CharArray.prototype.getChars = function (length) {
    var newBuffer = new CharArray.Array(length);
    var i = 0;
    while (i < length) {
      newBuffer[i++] = this.buffer[this.readHead++];
    }
    var array = new CharArray();
    array.initWithRLB(0, length, newBuffer);
    return array;
  };

  /**
  Get an int of size x.
  */
  CharArray.prototype.getInt = function (x) {
    switch (x) {
    case 8:
      return this.getInt8();
      break;
    case 16:
      return this.getInt16();
      break;
    default:
      return this.getInt32();
      break;
    }
  };

  /**
  Returns a css color stored in ARGB format
  @private
  */
  CharArray.prototype.getColor = function () {
    var a = (this.get8bits() / 255);
    return "rgba(" + this.get8bits() + "," + this.get8bits() + "," + this.get8bits() + "," + a + ")";
  };

  /**
  Get the length of the buffer
  */
  CharArray.prototype.getLength = function () {
    return this.length;
  };

  /**
  overwrite a subarray of the buffer with the contents of another
  CharArray.
  */
  CharArray.prototype.changeTo = function (array, start) {
    var other = array.buffer;
    var size = array.length;
    for (var i = 0; i < size; i++) {
      this.buffer[i + start] = this.other[i];
    }
  };

  /**
  basically the same thing as changeTo. Will be deprecated soon.
  @private
  */
  CharArray.prototype.writeArray = function (array) {
    var other = array;
    var size = array.length;
    var start = this.readHead;
    for (var i = 0; i < size; i++) {
      this.buffer[i + start] = this.other[i];
    }
    this.readHead += size;
  };

  /**
  Write a Uint8 to the array
  */
  CharArray.prototype.writeUint8 = function (uint) {
    this.buffer[this.readHead++] = uint & 0xFF;
  };

  /**
  Write a Uint16 to the array
  */
  CharArray.prototype.writeUint16 = function (uint) {
    this.buffer[this.readHead++] = (uint >> 8) & 0xFF;
    this.buffer[this.readHead++] = uint & 0xFF;
  };

  /**
  Write a Uint32 to the array
  */
  CharArray.prototype.writeUint32 = function (uint) {
    this.buffer[this.readHead++] = (uint >> 24) & 0xFF;
    this.buffer[this.readHead++] = (uint >> 16) & 0xFF;
    this.buffer[this.readHead++] = (uint >> 8) & 0xFF;
    this.buffer[this.readHead++] = uint & 0xFF;
  };

  /**
  Write a Float to the array
  */
  CharArray.prototype.writeFloat = function (n) {
    this.writeUint32(floatToBin(n));
  };

  /**
  write a signed int8 to the array
  */
  CharArray.prototype.writeInt8 = function (uint) {
    this.buffer[this.readHead++] = uint & 0x7F | (uint < 0 ? 0x80 : 0);
  };

  /**
  write a signed int16 to the array
  */
  CharArray.prototype.writeInt16 = function (uint) {
    this.buffer[this.readHead++] = (uint >> 8) & 0x7F | (uint < 0 ? 0x80 : 0);
    this.buffer[this.readHead++] = uint & 0xFF;
  };

  /**
  write a signed int32 to the array
  */
  CharArray.prototype.writeInt32 = function (uint) {
    this.buffer[this.readHead++] = (uint >> 24) & 0x7F | (uint < 0 ? 0x80 : 0);
    this.buffer[this.readHead++] = (uint >> 16) & 0xFF;
    this.buffer[this.readHead++] = (uint >> 8) & 0xFF;
    this.buffer[this.readHead++] = uint & 0xFF;
  };

  /**
  write a string to the array, not null terminated.
  */
  CharArray.prototype.writeString = function (string) {
    var other = string;
    var size = string.length;
    var start = this.readHead;
    for (var i = 0; i < size; i++) {
      this.buffer[i + start] = string.charCodeAt(i);
    }
    this.readHead += size;
  };

  /**
  convert hex into ascii. Not sure if needed
  @private
  */
  function hex2a(hexx, length) {
    if (hexx < 0) {
      hexx = 0xFFFFFFFF + hexx + 1;
    }
    var hex = hexx.toString(16); //force conversion
    length = length || (hex.length << 2);
    length >>= 2;
    var str = '';
    for (var i = 0; i < hex.length && i < length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    while (i < length) {
      str = String.fromCharCode(0) + str;
      i += 2;
    }
    return str;
  }

  /**
  put the top u bits of an int n into a number i
  @private
  */
  function shoveInt(i, u, n) {
    u = 1 << (u - 1);
    var p = 0;
    while (n) {
      ++p;
      i >>>= 1;
      if (n & 1) {
        i |= u;
      }
      n = Math.floor(n / 2);
    }
    return [i, p];
  }

  /**
  put the top u bits of a float n into a number i
  @private
  */
  function shoveFrac(i, u, n) {
    if (n == 0)
      return [0, 0];
    var t = u;
    u = 0xFFFFFFFF >>> (32 - u);
    var p = 0;
    if (n < 1)
      ++p;
    while (n < 1) {
      --p;
      n *= 2;
    }
    while (t--) {
      i = (i << 1) & u;
      --p;
      if (n >= 1) {
        i |= 1;
        --n;
      }
      n *= 2;

    }
    return [i, p];
  }

  /**
  Converts a floating point number to its binary representation
  @return {int} bits of the number.
  @private
  */
  function floatToBin(n) {
    var mantissa_size = 23;
    //the sign bit of the float
    var sign_bit = n < 0 ? 0x80000000 : 0;
    if (n == 0) {
      if (1 / n == Infinity)
        return 0;
      //negative 0 - you wanted zero as a float? then you want this too.
      return 0x80000000;
    }
    //we only want positives
    n = Math.abs(n);
    //NaN
    if (n != n) {
      return 0x7fc00000; //QNaN quiet
    }
    if (n == Infinity) {
      if (sign_bit)
        return 0xff800000; //negative inf
      return 0x7f800000; //inf
    }
    var mantissa = 0;
    var power;
    var int_part = Math.floor(n);
    var frac_part = n - int_part;
    //get the frac as a bit sequence, highest mantissa_size + 2 with power
    //the +2 is for A) the rounding bit and B) the leading 1
    frac_part = shoveFrac(mantissa, mantissa_size + 2, frac_part);
    //get the int part as a bit sequence + 2 with power (flawed power)
    //the +2 is for A) the rounding bit and B) the leading 1
    int_part = shoveInt(mantissa, mantissa_size + 2, int_part);
    //how much we're going to have to shift the frac by when or-ing into the int
    var shift_frac_by = (int_part[1] + (-frac_part[1] - (mantissa_size + 2)));
    //power of the int (unflawed)
    power = -((mantissa_size + 1) - int_part[1]);
    //start the mantissa with the int, which is already left shifted properly
    mantissa = int_part[0];
    if (!mantissa) {
      //special case. No int, we only have a frac
      power = frac_part[1] + 1;
      mantissa = (frac_part[0] >>> 1) + (frac_part[0] & 1);
    } else {
      //regular case. int and possibly a frac
      mantissa = (int_part[0] | (frac_part[0] >>> shift_frac_by));
      mantissa = (mantissa >>> 1) + (mantissa & 1);
    }
    //oddball case think 0xFF + 1 => 0x100, but with floats after the rounding bit
    //has been added, and this makes it one power too large. It ends in a zero though
    //guarenteed!
    if (mantissa & (1 << (mantissa_size + 1))) { //0x1FFFFFFE/0xFFFFFFF to trigger
      mantissa >>>= 1;
      ++power;
    }
    //bound the mantissa into its propper size. 32 is num bits in a float
    mantissa &= (0xFFFFFFFF >>> (32 - mantissa_size));
    //because apparently floating point is stored 1.xxxxx not just 1xxxxx
    power += 23;
    //if we're out of bounds
    if (power < -126 || power > 127) {
      console.error("Power out of bounds. SNaN returned. Probably trouble for you!");
      return 0x7f800001; //SNaN signal
    }
    //bias
    power = power + 127;
    return sign_bit | (power << mantissa_size) | mantissa;
  }

  /*
  Converts a binary number to floating point.
  @private
  */
  function binToFloat(n) {
    var s = n & 0x80000000;
    n ^= s;
    if (n == 0)
      return (s ? -0 : 0);
    var e = (n >> 23);
    n ^= (e << 23);
    if (e == 0xff) {
      if (n == 0) {
        return (s ? -Infinity : Infinity);
      }
      if (!(n & (1 << 22)))
        console.error("SNaN read. Probably trouble for you!");
      return NaN;
    }

    n |= (1 << 23);
    return (s ? -1 : 1) * n * Math.pow(2, e - 127 - 23);
  }
  BSON.CharArray = CharArray;
})();