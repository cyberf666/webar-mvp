// Supabaseに設定を保存するAPI
import { supabase } from './supabaseClient.js';

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
    const config = req.body;

    // 設定の妥当性チェック
    if (!config || !config.ar || !config.ar.targetUrl) {
      return res.status(400).json({
        error: 'Invalid config format',
        message: 'Config must include ar.targetUrl'
      });
    }

    // lastUpdatedを更新
    config.lastUpdated = new Date().toISOString();

    // Supabaseに保存（upsert: 存在すれば更新、なければ挿入）
    const { data, error } = await supabase
      .from('ar_config')
      .upsert({
        id: 1,
        config: config,
        updated_at: config.lastUpdated
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      throw error;
    }

    console.log('[API] 設定を保存しました:', new Date().toISOString());
    return res.status(200).json({
      success: true,
      message: '設定を保存しました',
      config: config
    });

  } catch (error) {
    console.error('[API] エラー:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
