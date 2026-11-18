export const SUPPORTED_FLASH_MODELS = Object.freeze([
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
]);

export const MAX_OUTPUT_TOKENS = 8192;

const INPUT_MICRO_USD_PER_MILLION_TOKENS = 1_500_000n;
const OUTPUT_MICRO_USD_PER_MILLION_TOKENS = 7_500_000n;
const MILLION = 1_000_000n;

export function isSupportedFlashModel(model) {
  return typeof model === 'string' && SUPPORTED_FLASH_MODELS.includes(model);
}

function ceilRoundedMicroUsd(tokens, ratePerMillion) {
  if (!Number.isSafeInteger(tokens) || tokens < 0) {
    throw new Error('Invalid token count');
  }
  const numerator = BigInt(tokens) * ratePerMillion;
  const quotient = numerator / MILLION;
  const remainder = numerator % MILLION;
  const microUsd = quotient + (remainder === 0n ? 0n : 1n);
  if (microUsd > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Cost exceeds safe integer range');
  }
  return Number(microUsd);
}

export function calculateMaximumCostMicroUsd(model, inputTokens) {
  if (!isSupportedFlashModel(model)) {
    throw new Error('Unsupported Gemini model');
  }
  const inputCost = ceilRoundedMicroUsd(inputTokens, INPUT_MICRO_USD_PER_MILLION_TOKENS);
  const outputCost = ceilRoundedMicroUsd(MAX_OUTPUT_TOKENS, OUTPUT_MICRO_USD_PER_MILLION_TOKENS);
  const total = inputCost + outputCost;
  if (!Number.isSafeInteger(total)) {
    throw new Error('Cost exceeds safe integer range');
  }
  return total;
}
