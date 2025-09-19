// Vercel Serverless Function (Node.js) で FastAPI を叩いて返すプロキシ
// FastAPI の公開URLを環境変数 BACKEND_URL に設定してください（例: https://your-fastapi.example.com/hello）

export default async function handler(req, res) {
  try {
    const backendUrl = process.env.BACKEND_URL; // 例: https://your-fastapi.example.com/hello
    if (!backendUrl) {
      res.status(500).json({ error: 'BACKEND_URL が未設定です' });
      return;
    }

    const r = await fetch(backendUrl, {
      method: 'GET',
      headers: { accept: 'application/json' },
      // タイムアウトを簡易実装（Node18+のfetchはAbortController対応）
      signal: AbortSignal.timeout?.(8000)
    });

    if (!r.ok) {
      res.status(r.status).json({ error: `Upstream error: ${r.status}` });
      return;
    }

    const data = await r.json();
    // そのままフロントへ返す（CORSは同一オリジンになる）
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message ?? 'unknown error' });
  }
}
