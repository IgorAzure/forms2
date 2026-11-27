export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await fetch(process.env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });

  return res.status(200).json({ status: 'ok' });
}