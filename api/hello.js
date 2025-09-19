// Vercel サーバーレス関数
// BACKEND_URL という環境変数に FastAPI の公開URL（例: https://your-fastapi.example.com/hello）を設定してください

export default async function handler(req, res) {
  try {
    const url = process.env.BACKEND_URL;
    if (!url) {
      res.status(500).json({ error: 'BACKEND_URL が未設定です' });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const upstream = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (e) {
    const msg = e?.name === 'AbortError' ? 'Upstream timeout' : (e?.message ?? String(e));
    res.status(500).json({ error: msg });
  }
}
