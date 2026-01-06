// Supabaseクライアント（Vercel Serverless Functions用）
import { createClient } from '@supabase/supabase-js';

// 環境変数から取得
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません');
}

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
