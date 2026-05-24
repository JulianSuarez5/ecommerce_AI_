export function sanitizeInput(raw) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[<>'"\\/;]/g, '');
}

export function maskError(_error) {
  return 'Ocurrió un error. Intenta de nuevo más tarde.';
}

export function safeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[<>]/g, '');
}
