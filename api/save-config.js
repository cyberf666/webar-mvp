// Vercel KVを使った設定保存API
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTリクエストのみ受け付ける
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password, config } = req.body;

    // パスワード認証（簡易版）
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 設定をVercel KVに保存
    await kv.set('ar-config', config);

    console.log('[API] 設定を保存しました:', new Date().toISOString());

    return res.status(200).json({
      success: true,
      message: '設定を保存しました',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] エラー:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
