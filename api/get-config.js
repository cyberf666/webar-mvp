// Vercel KVから設定を読み込むAPI
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GETリクエストのみ受け付ける
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel KVから設定を取得
    const config = await kv.get('ar-config');

    // 設定が存在しない場合はデフォルト設定を返す
    if (!config) {
      const defaultConfig = {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        ar: {
          targetUrl: "https://example.com",
          target: {
            imageUrl: "/targets/target.png",
            mindUrl: "/targets/target.mind"
          },
          model: {
            enabled: false,
            url: "/models/model.glb",
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            rotation: { x: 0, y: 0, z: 0 },
            animation: { enabled: true }
          },
          bgm: {
            enabled: false,
            url: "",
            volume: 0.5,
            loop: true,
            autoplay: true
          }
        }
      };

      console.log('[API] デフォルト設定を返します');
      return res.status(200).json(defaultConfig);
    }

    console.log('[API] 設定を読み込みました:', new Date().toISOString());
    return res.status(200).json(config);

  } catch (error) {
    console.error('[API] エラー:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
