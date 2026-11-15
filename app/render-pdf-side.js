ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('PDFKit');

function run([input, number, output]) {
  const pdf = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(input));
  const pageNumber = Number(number);
  if (pdf.isLocked || pdf.pageCount > 50 || pageNumber < 1 || pageNumber > pdf.pageCount) {
    throw Error('Siden er ikke tilgjengelig.');
  }
  const page = pdf.pageAtIndex(pageNumber - 1);
  const bounds = page.boundsForBox(1).size;
  const scale = 1600 / Math.max(bounds.width, bounds.height);
  const image = page.thumbnailOfSizeForBox({width: bounds.width * scale, height: bounds.height * scale}, 1);
  const bitmap = $.NSBitmapImageRep.imageRepWithData(image.TIFFRepresentation);
  const png = bitmap.representationUsingTypeProperties(4, $.NSDictionary.dictionary);
  if (!png.writeToFileAtomically(output, true)) throw Error('Kunne ikke vise siden.');
}
