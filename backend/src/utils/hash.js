import crypto from 'crypto';
import { toCleanString } from './string.js';

export function sha256Hex(input) {
  const s = toCleanString(input);
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}
