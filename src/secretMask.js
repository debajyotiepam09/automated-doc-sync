function maskSecrets(input) {
  return input.replace(/[A-Za-z0-9_]{20,}/g, "[REDACTED]");
}

module.exports = {
  maskSecrets
};
