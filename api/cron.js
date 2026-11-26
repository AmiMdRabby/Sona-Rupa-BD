const { upsert } = require('./_db');
const SRC = process.env.BAJUS_URL || 'https://www.bajus.org/gold-price';
const bn2en = (s) => s.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));
const num = (t, re) => { const m = t.match(re); return m ? Number(m[1].replace(/,/g, '')) : null; };
module.exports = async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'unauthorized' });
  try {
    const html = await (await fetch(SRC, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const t = bn2en(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' '));
    const L = '(?:K|karat|ক্যারেট|ক্যারেটের)?';
    const row = {
      date: new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10), // বাংলাদেশ সময়
      gold22: num(t, new RegExp(`22\\s*${L}[^\\d]{0,60}([\\d,]{5,7})`, 'i')),
      gold21: num(t, new RegExp(`21\\s*${L}[^\\d]{0,60}([\\d,]{5,7})`, 'i')),
      gold18: num(t, new RegExp(`18\\s*${L}[^\\d]{0,60}([\\d,]{5,7})`, 'i')),
      sonatan: num(t, /(?:সনাতন|sonatan|traditional)[^\d]{0,60}([\d,]{5,7})/i),
      silver: num(t, /(?:silver|রূপা|রুপা)[^\d]{0,60}([\d,]{3,6})/i),
      source: 'auto',
    };
    if (!row.gold22) return res.status(502).json({ error: 'দাম পার্স করা যায়নি; অ্যাডমিন থেকে দিন', sample: t.slice(0, 200) });
    const err = await upsert(row, false);
    res.status(err ? 500 : 200).json(err ? { error: err } : { ok: true, row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
};
