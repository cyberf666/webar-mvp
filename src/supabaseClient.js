// Supabaseクライアントの初期化
import { createClient } from '@supabase/supabase-js';

// 環境変数から取得（Vercelの環境変数として設定）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 設定を保存
export async function saveConfig(config) {
  const { data, error } = await supabase
    .from('ar_config')
    .upsert({
      id: 1,
      config: config,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select();

  if (error) {
    console.error('[Supabase] 保存エラー:', error);
    throw error;
  }

  console.log('[Supabase] 設定を保存しました:', data);
  return data;
}

// 設定を取得
export async function getConfig() {
  const { data, error } = await supabase
    .from('ar_config')
    .select('config')
    .eq('id', 1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // データが存在しない場合はデフォルト設定を返す
      console.log('[Supabase] 設定が存在しません。デフォルト設定を返します。');
      return null;
    }
    console.error('[Supabase] 読み込みエラー:', error);
    throw error;
  }

  console.log('[Supabase] 設定を読み込みました');
  return data.config;
}
