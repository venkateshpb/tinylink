import prisma from '../../../lib/prisma';

const CODE_RE = /^[A-Za-z0-9]{6,8}$/;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(links);
  }

  if (req.method === 'POST') {
    const { target, code } = req.body || {};

    if (!target) {
      return res.status(400).json({ error: 'target URL required' });
    }

    // Basic URL validation
    try {
      const url = new URL(target);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'invalid URL protocol' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'invalid URL' });
    }

    let finalCode = code;

    if (finalCode) {
      if (!CODE_RE.test(finalCode)) {
        return res.status(400).json({ error: 'code must match [A-Za-z0-9]{6,8}' });
      }

      const existing = await prisma.link.findUnique({
        where: { code: finalCode }
      });

      if (existing) {
        return res.status(409).json({ error: 'code already exists' });
      }
    } else {
      // Generate a random code of length 6
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let attempts = 0; attempts < 10; attempts++) {
        finalCode = Array.from({ length: 6 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join('');

        const existing = await prisma.link.findUnique({
          where: { code: finalCode }
        });

        if (!existing) break;
      }
    }

    const created = await prisma.link.create({
      data: {
        code: finalCode,
        target
      }
    });

    return res.status(201).json(created);
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).end();
}
