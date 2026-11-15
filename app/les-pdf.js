ObjC.import('Foundation');
ObjC.import('PDFKit');
function run(args) {
  const pdf = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(args[0]));
  if (!pdf.pageCount || pdf.pageCount > 50 || pdf.isLocked) throw Error('Velg en ulåst PDF med 1–50 sider.');
  const pages = [];
  for (let i = 0; i < pdf.pageCount; i++) {
    const page = pdf.pageAtIndex(i);
    const text = (ObjC.unwrap(page.string) || '').trim();
    pages.push({ number: i + 1, text, usable: text.replace(/\s/g, '').length >= 20 });
  }
  return JSON.stringify(pages);
}
