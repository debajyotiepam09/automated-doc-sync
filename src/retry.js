function isTransientError(error) {
  const status = error?.status;
  if (typeof status === "number" && (status === 429 || status >= 500)) {
    return true;
  }

  if (error?.code === "ETIMEDOUT" || error?.code === "ECONNRESET") {
    return true;
  }

  const text = String(error?.stderr || "");
  return /timed out|connection reset|could not resolve host|temporary failure|remote end hung up/i.test(text);
}

async function withRetry(fn, maxAttempts) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = Math.min(1500, 200 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

module.exports = {
  withRetry,
  isTransientError
};
