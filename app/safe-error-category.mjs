const safeCategories = new Set([
  'AbortError',
  'TimeoutError',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
]);

export function safeErrorCategory(error) {
  if (safeCategories.has(error?.name)) return error.name;
  if (safeCategories.has(error?.cause?.code)) return error.cause.code;
  return 'Error';
}
