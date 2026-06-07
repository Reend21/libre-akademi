const fs = require('fs').promises;

/**
 * MIME protect
 * @param {string} filePath - Absolute or relative path to the saved file
 * @returns {Promise<boolean>} true if the file matches an allowed type, false otherwise
 */
async function verifyMagicBytes(filePath) {
  const buffer = Buffer.alloc(12);
  const fd = await fs.open(filePath, 'r');
  try {
    await fd.read(buffer, 0, 12, 0);
  } finally {
    await fd.close();
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 &&
    buffer[2] === 0x4E && buffer[3] === 0x47
  ) return true;

  // WebM / MKV: 1A 45 DF A3
  if (
    buffer[0] === 0x1A && buffer[1] === 0x45 &&
    buffer[2] === 0xDF && buffer[3] === 0xA3
  ) return true;

  // MP4: 'ftyp' box at offset 4 (66 74 79 70)
  if (
    buffer[4] === 0x66 && buffer[5] === 0x74 &&
    buffer[6] === 0x79 && buffer[7] === 0x70
  ) return true;

  return false;
}

module.exports = { verifyMagicBytes };
