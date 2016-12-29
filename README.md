# Drawing Book

This should have all the functionality currently to take basic notes and draw. It can save and load from local files, and notes are infinitely\* large. Will be adding page support and tool options (color, size, ect) eventually.

Open up index.html to run the program. Not commented yet - but this *might* happen eventually. It should be *reasonably* understandable.

\* not actually infinite, but as big as a `float` can keep track of pixels, so approximately 2^24 pixels wide. This limit is imposed by the BSON save format. JSON will get you 2^53 wide pages as it supports `double`, but honestly you don't need that wide pages.
