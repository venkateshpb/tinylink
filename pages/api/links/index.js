/**
 * pages/api/links/index.js
 * Robust API handler for GET (list) and POST (create)
 */

const prismaModule = require('../../../lib/prisma');
const prisma = prismaModule && prismaModule.default ? prismaModule.default : prismaModule;

/**
 * Generate a short alphanumeric code (6 chars)
 */
function genCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Validate a URL (must be http or https)
 */
function isValidUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const links = await prisma.link.findMany({ orderBy: { id: 'desc' } });
      return res.status(200).json(links);
    } catch (err) {
      console.error('GET /api/links error:', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { target, code } = body || {};

      if (!target || !isValidUrl(target)) {
        return res.status(400).json({ error: 'invalid_target' });
      }

      // if code provided, validate format; otherwise generate one
      let finalCode = code;
      if (finalCode) {
        if (!/^[A-Za-z0-9]{4,16}$/.test(finalCode)) {
          return res.status(400).json({ error: 'invalid_code_format' });
        }
        // check uniqueness
        const exists = await prisma.link.findUnique({ where: { code: finalCode } });
        if (exists) {
          return res.status(409).json({ error: 'code_exists' });
        }
      } else {
        // generate a unique code (retry loop)
        for (let i = 0; i < 6; i++) {
          const candidate = genCode(6);
          const exists = await prisma.link.findUnique({ where: { code: candidate } });
          if (!exists) {
            finalCode = candidate;
            break;
          }
        }
        if (!finalCode) finalCode = genCode(8); // fallback
      }

      const created = await prisma.link.create({
        data: {
          code: finalCode,
          target,
        },
      });

      return res.status(201).json(created);
    } catch (err) {
      console.error('POST /api/links error:', err);
      // Prisma unique constraint or other DB error
      return res.status(500).json({ error: 'internal_error' });
    }
  }

  // unsupported method
  res.setHeader('Allow', 'GET,POST');
  return res.status(405).end('Method Not Allowed');
};
