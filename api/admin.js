const { upsert } = require('./_db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  if (!process.env.ADMIN_PASSWORD || b.password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: 'পাসওয়ার্ড ভুল' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return res.status(400).json({ error: 'তারিখ ভুল' });
  const row = { date: b.date, source: 'manual', updated_at: new Date().toISOString() };
  for (const k of ['gold22', 'gold21', 'gold18', 'sonatan', 'silver']) {
    const n = Number(b[k]);
    row[k] = b[k] !== '' && b[k] != null && n > 0 ? n : null;
  }
  const err = await upsert(row, true);
  res.status(err ? 500 : 200).json(err ? { error: err } : { ok: true });
};
