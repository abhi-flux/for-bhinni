const PIN_KEY = 'for-bhinni-pin-hash';

async function hash(pin) {
  const enc = new TextEncoder().encode('bhinni-salt-' + pin);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY);
}

export async function setPin(pin) {
  const h = await hash(pin);
  localStorage.setItem(PIN_KEY, h);
}

export async function verifyPin(pin) {
  const h = await hash(pin);
  return h === localStorage.getItem(PIN_KEY);
}

export function clearPin() {
  localStorage.removeItem(PIN_KEY);
}
