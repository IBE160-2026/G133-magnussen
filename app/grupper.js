// Kjør på macOS: osascript -l JavaScript trekk-ut-muskelgrupper.js /sti/Muskler.pdf
ObjC.import('Foundation');
ObjC.import('PDFKit');

function run(args) {
  if (args.length !== 1) throw Error('Oppgi filstien til Muskler.pdf.');
  const pdf = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(args[0]));
  if (!pdf || pdf.pageCount < 14) throw Error('PDF-en må inneholde side 13 og 14.');
  const page = pdf.pageAtIndex(12);
  const text = ObjC.unwrap(page.string);
  const headings = ['Mobiliserende', 'Stabiliserende'];
  const indices = headings.map(heading => text.indexOf(heading));
  if (indices.some(index => index < 0)) throw Error('Fant ikke begge gruppeoverskriftene på side 13.');
  const left = page.characterBoundsAtIndex(indices[0]).origin.x;
  const right = page.characterBoundsAtIndex(indices[1]).origin.x;
  if (right <= left) throw Error('Kunne ikke skille kolonnene på side 13.');
  const divider = (left + right) / 2;
  const bounds = page.boundsForBox(0);
  const top = Math.max(...indices.map(index => page.characterBoundsAtIndex(index).origin.y)) - 4;
  const edges = [bounds.origin.x, divider, bounds.origin.x + bounds.size.width];
  const groups = headings.map((heading, index) => {
    const rect = {origin: {x: edges[index], y: bounds.origin.y},
      size: {width: edges[index + 1] - edges[index], height: top - bounds.origin.y}};
    const selection = page.selectionForRect(rect);
    const selections = selection.selectionsByLine;
    const lines = [];
    for (let i = 0; i < selections.count; i++) {
      const line = ObjC.unwrap(selections.objectAtIndex(i).string).trim();
      if (line && line !== 'Muskelgrupper') lines.push(line);
    }
    return { heading, lines };
  });
  const secondPage = ObjC.unwrap(pdf.pageAtIndex(13).string);
  if (!secondPage.includes('Muskelkarakteristika II')) throw Error('Fant ikke Muskelkarakteristika II på side 14.');
  return JSON.stringify([
    { page: 13, heading: 'Muskelkarakteristika I', groups },
    { page: 14, heading: 'Muskelkarakteristika II', sourceText: secondPage.trim() }
  ], null, 2);
}
