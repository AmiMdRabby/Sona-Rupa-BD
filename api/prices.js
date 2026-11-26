const { select } = require('./_db');
const ok = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
module.exports = async (req, res) => {
  const { from, to } = req.query;
  let qs = 'select=*&order=date.asc&limit=20000';
  if (from && ok(from)) qs += `&date=gte.${from}`;
  if (to && ok(to)) qs += `&date=lte.${to}`;
  const { status, data } = await select(qs);
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(status).json(data);
};
