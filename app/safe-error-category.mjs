const safeCategories = new Set([
  'AbortError',
  'TimeoutError',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
]);

const geminiOperations = new Set(['countTokens', 'generateContent']);
const groqOperations = new Set(['chatCompletion']);
const groqValidationFailures = new Set([
  'invalid-json',
  'resource-format',
  'source-format',
  'source-unverified',
]);
const isHttpCode = value => Number.isInteger(value) && value >= 100 && value <= 599;

export function safeErrorCategory(error) {
  if (safeCategories.has(error?.name)) return error.name;
  if (safeCategories.has(error?.cause?.name)) return error.cause.name;
  if (safeCategories.has(error?.cause?.code)) return error.cause.code;
  return 'Error';
}

export function logGeminiFailure(error) {
  const model = typeof error?.model === 'string' && /^gemini-[a-zA-Z0-9.-]{1,90}$/u.test(error.model)
    ? error.model : 'unknown';
  const operation = geminiOperations.has(error?.operation) ? error.operation : 'unknown';
  const httpStatus = isHttpCode(error?.status) ? error.status : 'none';
  const googleErrorCode = isHttpCode(error?.googleErrorCode) ? error.googleErrorCode : 'none';
  console.error(
    `Gemini request failed: model=${model} operation=${operation} httpStatus=${httpStatus} ` +
    `googleErrorCode=${googleErrorCode} category=${safeErrorCategory(error)}`,
  );
}

export function logGroqFailure(error) {
  const model = error?.model === 'openai/gpt-oss-120b' ? error.model : 'unknown';
  const operation = groqOperations.has(error?.operation) ? error.operation : 'unknown';
  const httpStatus = isHttpCode(error?.status) ? error.status : 'none';
  const validationFailure = groqValidationFailures.has(error?.validationFailure)
    ? error.validationFailure
    : 'none';
  console.error(
    `Groq request failed: provider=groq model=${model} operation=${operation} ` +
    `httpStatus=${httpStatus} category=${safeErrorCategory(error)} validation=${validationFailure}`,
  );
}
