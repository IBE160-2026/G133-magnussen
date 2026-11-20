export function pageProcessingDecision(pages, confirmedSkippedPages) {
  const skippedPages = pages.filter(page => !page.usable).map(page => page.number);
  if (!pages.some(page => page.usable)) return { status: 'no-usable-pages', skippedPages };

  const confirmationMatches = Array.isArray(confirmedSkippedPages)
    && confirmedSkippedPages.length === skippedPages.length
    && confirmedSkippedPages.every((number, index) => number === skippedPages[index]);
  if (skippedPages.length && !confirmationMatches) {
    return { status: 'confirmation-required', skippedPages };
  }
  return { status: 'ready', skippedPages };
}
