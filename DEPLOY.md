# デプロイガイド

このドキュメントでは、WebAR MVPを本番環境にデプロイする手順を説明します。

## 前提条件

- ✅ HTTPS必須（カメラアクセスのため）
- ✅ `.mind` ファイルが `public/targets/` に配置済み
- ✅ `src/main.js` の `CONFIG.targetURL` を本番URLに変更済み

---

## 方法1: Vercel（推奨）

### 特徴
- 自動HTTPS化
- 高速グローバルCDN
- GitHubと連携で自動デプロイ
- 無料プラン利用可

### 手順

#### A. GitHub連携デプロイ（推奨）

1. **GitHubリポジトリにプッシュ**

```bash
cd webar-mvp
git init
git add .
git commit -m "Initial commit"
gh repo create webar-mvp --public --source=. --remote=origin --push
```

2. **Vercelでインポート**

- https://vercel.com/ にログイン
- 「Add New Project」をクリック
- GitHubリポジトリを選択
- ビルド設定（自動検出されるはず）:
  - **Framework Preset**: Vite
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
- 「Deploy」をクリック

3. **デプロイ完了**

数分でデプロイ完了。`https://your-project.vercel.app` のようなURLが発行されます。

#### B. CLI経由デプロイ

```bash
npm install -g vercel
cd webar-mvp
vercel
```

指示に従って操作すれば完了。

---

## 方法2: Netlify

### 特徴
- Vercelと同様に自動HTTPS
- ドラッグ&ドロップでデプロイ可能
- フォームやサーバーレス関数も使える

### 手順

#### A. ドラッグ&ドロップデプロイ

1. **ビルド**

```bash
npm run build
```

2. **Netlifyにアップロード**

- https://app.netlify.com/ にログイン
- 「Add new site」→「Deploy manually」
- `dist/` フォルダをドラッグ&ドロップ

3. **デプロイ完了**

`https://random-name.netlify.app` のようなURLが発行されます。

#### B. GitHub連携デプロイ

1. GitHubにプッシュ（方法1と同じ）
2. Netlifyで「Import from Git」
3. ビルド設定:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. 「Deploy site」

---

## 方法3: GitHub Pages

### 注意
- カスタムドメインを使う場合のみHTTPSが有効
- `github.io` ドメインは自動的にHTTPS

### 手順

1. **ビルド設定を調整**

`vite.config.js` に base パスを追加:

```javascript
export default defineConfig({
  base: '/webar-mvp/', // ← リポジトリ名
  // ...
});
```

2. **GitHub Actionsでデプロイ**

`.github/workflows/deploy.yml` を作成:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. **リポジトリ設定**

- GitHubリポジトリの Settings → Pages
- Source: `gh-pages` ブランチ
- Save

4. **プッシュでデプロイ**

```bash
git add .
git commit -m "Add GitHub Pages deploy"
git push
```

アクセスURL: `https://<username>.github.io/webar-mvp/`

---

## デプロイ後の確認事項

### ✅ チェックリスト

- [ ] HTTPSでアクセスできる
- [ ] カメラ権限が要求される
- [ ] 画像ターゲットが認識される
- [ ] タップでURLに遷移する
- [ ] iOS Safariで動作する
- [ ] Android Chromeで動作する

### スマホでの確認方法

1. **QRコード生成**

デプロイされたURLをQRコード化:
- https://www.qr-code-generator.com/

2. **スマホでスキャン**

カメラアプリでQRコードを読み取り、ブラウザで開く。

3. **動作確認**

- カメラ権限を許可
- 画像ターゲットにかざす
- エフェクト表示を確認
- タップして遷移を確認

---

## カスタムドメインの設定（オプション）

### Vercelの場合

1. Vercelプロジェクトの Settings → Domains
2. カスタムドメインを追加（例: `ar.yoursite.com`）
3. DNS設定でCNAMEレコードを追加:
   - Name: `ar`
   - Value: `cname.vercel-dns.com`

### Netlifyの場合

1. Site settings → Domain management
2. 「Add custom domain」
3. DNS設定でCNAMEレコードを追加:
   - Name: `ar`
   - Value: `<site-name>.netlify.app`

---

## トラブルシューティング

### エラー: "Camera access denied"

- HTTPSでアクセスしているか確認
- ブラウザのサイト設定でカメラ権限を確認

### 404エラー（ページが見つからない）

- ビルドが成功しているか確認: `npm run build`
- `dist/` フォルダに `index.html` が存在するか確認

### .mindファイルが読み込めない

- `public/targets/target.mind` が存在するか確認
- ファイルサイズが大きすぎないか確認（推奨: 1MB以下）
- Vite設定で `.mind` が assetsInclude に含まれているか確認

---

## パフォーマンス最適化

### 画像最適化

- ターゲット画像を圧縮（TinyPNG等）
- 解像度は1024x1024以下を推奨

### 軽量化

- [src/effect.js](src/effect.js) のパーティクル数を減らす
- 不要なThree.jsオブジェクトを削除

---

## 更新手順

### GitHubから自動デプロイする場合

```bash
# コード修正後
git add .
git commit -m "Update effect"
git push
```

Vercel/Netlifyが自動的に再デプロイします。

### 手動デプロイの場合

```bash
npm run build
# dist/ フォルダを再アップロード
```

---

## セキュリティ

- `.env` ファイルに機密情報を保存しない
- APIキーが必要な場合は環境変数を使用
- 本番環境でデバッグログを無効化（必要に応じて）

---

## サポート

問題が発生した場合:
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com/
- MindAR: https://hiukim.github.io/mind-ar-js-doc/
