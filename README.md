# Drawing Book

This should have all the functionality currently to take basic notes and draw. It has as many pages as you want\* per book and each page is infinitely\* large. It can save and load from local files. Has an infinite undo/redo history. Will be adding tool options (color, size, ect) eventually.

Open up index.html to run the program. Not commented yet - but this *might* happen eventually. It should be *reasonably* understandable.

\* not actually infinite, but as big as a `float` can keep track of pixels, so approximately 2^24 pixels wide and tall (as with book length). On a second look, it turns out no operations result in a `float` only `int` so that means that we've got a full 2^31 (signed negative) in the negative direction, and 2^32 (unsigned positive) in the positive direction. That brings us to `0x180000000 +/- 1` pixels wide/tall (almost 2^33) and 2^32 pages. This limit is imposed by the BSON save format. JSON will still get you 2^53 pixels wide pages as it supports `double`, but honestly you don't need that wide pages.
