// API: GET /api/hello
// 環境変数 BACKEND_URL に FastAPI の「公開URL（/hello）」を設定してください。
// 例: https://your-fastapi.example.com/hello

export default async function handler(req, res) {
  try {
    const url = process.env.BACKEND_URL;
    if (!url) {
      res.status(500).json({ error: 'BACKEND_URL が未設定です（VercelのProject Settings > Environment Variables で設定してください）' });
      return;
    }

    // タイムアウト（10秒）
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const upstream = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!upstream.ok) {
      // バックエンドのステータスを透過
      res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    // application/json を期待
    const data = await upstream.json();

    // キャッシュ抑止（毎回最新）
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (e) {
    // AbortError 等にも対応
    const message = e?.name === 'AbortError' ? 'Upstream timeout' : (e?.message ?? String(e));
    res.status(500).json({ error: message });
  }
}
