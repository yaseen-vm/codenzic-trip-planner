const RANDOM_RADIX = 36;

/** Groups autocomplete keystrokes and the final details lookup into one billed Places session. */
export const createSessionToken = (): string =>
  `${Date.now()}-${Math.random().toString(RANDOM_RADIX).slice(2)}`;
