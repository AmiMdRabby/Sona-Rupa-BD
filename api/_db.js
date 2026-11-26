const U = process.env.SUPABASE_URL, K = process.env.SUPABASE_SERVICE_KEY;
// নতুন sb_secret_ কী শুধু apikey হেডারে যায়; পুরোনো eyJ... কী Authorization-এও যায়
const H = { apikey: K, 'Content-Type': 'application/json' };
if (K && !K.startsWith('sb_')) H.Authorization = `Bearer ${K}`;
exports.select = async (qs) => {
  const r = await fetch(`${U}/rest/v1/prices?${qs}`, { headers: H });
  return { status: r.status, data: await r.json() };
};
// overwrite=false হলে আগে থেকে থাকা (ম্যানুয়াল) দাম বদলাবে না
exports.upsert = async (row, overwrite) => {
  const r = await fetch(`${U}/rest/v1/prices?on_conflict=date`, {
    method: 'POST',
    headers: { ...H, Prefer: `resolution=${overwrite ? 'merge' : 'ignore'}-duplicates,return=minimal` },
    body: JSON.stringify(row),
  });
  return r.ok ? null : await r.text();
};
