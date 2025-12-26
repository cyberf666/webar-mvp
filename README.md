# WebAR MVP - 展示用AR体験

MindAR + Three.jsを使った画像認識型WebAR。
QRコードでアクセスし、画像ターゲットにかざすと3Dエフェクトが表示され、タップでURLへ遷移します。

## 📁 プロジェクト構成

```
webar-mvp/
├── public/
│   └── targets/
│       ├── target.mind      # MindAR用の画像ターゲットファイル
│       └── target.png        # ターゲット画像（参照用）
├── src/
│   ├── main.js              # メインロジック（AR初期化・状態管理）
│   └── effect.js            # 3Dエフェクト（パーティクル・リング・発光）
├── index.html               # エントリポイント
├── vite.config.js           # Vite設定
├── package.json
└── README.md
```

## 🚀 ローカル起動手順

### 1. 依存関係をインストール

```bash
cd webar-mvp
npm install
```

### 2. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス。

**注意**: カメラ権限はHTTPSまたはlocalhostでのみ動作します。

## 📦 本番ビルド

```bash
npm run build
```

`dist/` フォルダに最適化されたファイルが出力されます。

## 🌐 デプロイ手順（Vercel推奨）

### Vercelへのデプロイ

1. [Vercel](https://vercel.com/)にログイン
2. 「Add New Project」を選択
3. GitHubリポジトリを接続（または手動でアップロード）
4. ビルド設定:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 「Deploy」をクリック

**自動HTTPS化**: Vercelは自動的にHTTPSを提供します。

### Netlifyへのデプロイ（代替）

1. [Netlify](https://www.netlify.com/)にログイン
2. 「Add new site」→「Import an existing project」
3. ビルド設定:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. デプロイ完了後、自動的にHTTPSが有効化されます。

## 🎯 画像ターゲット（.mind）の作成方法

### 必要なもの

- **MindAR Image Compiler**: https://hiukim.github.io/mind-ar-js-doc/tools/compile

### 手順

1. **ターゲット画像を用意**
   - 形式: PNG / JPG
   - 推奨サイズ: 1024x1024px以下
   - **良い画像の条件**:
     - ✅ コントラストが高い
     - ✅ エッジがはっきりしている（ロゴ、イラスト、模様など）
     - ✅ 特徴点が多い（細かいディテール）
     - ✅ 正方形に近い形状
   - **避けるべき画像**:
     - ❌ 反射する素材（光沢紙、ガラス）
     - ❌ 無地やグラデーションのみ
     - ❌ 低解像度・ぼやけた画像
     - ❌ 極端に細長い形状

2. **MindAR Compilerにアクセス**
   - ブラウザで https://hiukim.github.io/mind-ar-js-doc/tools/compile を開く

3. **画像をアップロード**
   - 「Choose images」で画像を選択（複数選択可、今回は1枚でOK）
   - 「Start Compiling」をクリック

4. **.mindファイルをダウンロード**
   - コンパイル完了後、`targets.mind` がダウンロードされます
   - これを `public/targets/target.mind` にリネームして配置

5. **参照用に元画像も保存**
   - 元の画像を `public/targets/target.png` として保存（展示時の参考用）

### ターゲット差し替え方法

1. 新しい画像で `.mind` ファイルを作成
2. `public/targets/target.mind` を上書き
3. ビルド・デプロイ

**複数ターゲット対応**: `src/main.js` の `CONFIG.targetImagePath` を変更すればOK。

## ⚙️ 設定のカスタマイズ

### 遷移先URLの変更

[src/main.js:7](src/main.js#L7) を編集:

```javascript
const CONFIG = {
  targetURL: 'https://your-website.com', // ← ここを変更
  effectYOffset: 0.2,
  effectScale: 1.0,
  targetImagePath: '/targets/target.mind',
};
```

### エフェクトの調整

- **位置**: `effectYOffset` を変更（上下移動）
- **サイズ**: `effectScale` を変更（0.5で半分、2.0で2倍）
- **エフェクト詳細**: [src/effect.js](src/effect.js) を編集
  - パーティクル数: `particleCount`（デフォルト50）
  - 色: `color` プロパティ（0x00ffff = シアン）
  - リングサイズ: `TorusGeometry` の第1引数

## 🐛 トラブルシューティング

### カメラが起動しない

- HTTPSまたはlocalhostでアクセスしているか確認
- ブラウザのカメラ権限を許可
- iOS Safariの場合、設定→Safari→カメラ が「許可」になっているか確認

### ターゲットが認識されない

- 照明が十分か確認（暗いと認識率が下がる）
- ターゲット画像に反射がないか確認
- カメラとターゲットの距離を調整（20〜50cm程度が最適）
- ターゲット画像の特徴点が少ない可能性 → 別の画像を試す

### iOSで動作が重い

- [src/effect.js:48](src/effect.js#L48) の `particleCount` を減らす（50→30など）
- リングの数を減らす（ring2を削除）

### タップが反応しない

- ターゲットが認識されているか確認（コンソールログで `[AR] ターゲット検出` が出ているか）
- エフェクトの中心付近をタップ
- ブラウザのコンソールで `[TAP] オブジェクトタップ検知` が出るか確認

## 📱 動作確認環境

- **iOS**: Safari 14+
- **Android**: Chrome 90+
- **必須**: HTTPS接続（localhost除く）

## 🔧 開発Tips

### デバッグログの確認

ブラウザの開発者ツール（F12）でコンソールを開くと、以下のログが表示されます:

- `[AR] 起動成功`
- `[AR] ターゲット検出`
- `[AR] ターゲットロスト`
- `[TAP] オブジェクトタップ検知`

### エフェクトのリアルタイムプレビュー

開発サーバー起動中は、コード変更が自動的に反映されます（Hot Reload）。

## 📄 ライセンス

MIT License

## 🙋 サポート

- MindAR公式ドキュメント: https://hiukim.github.io/mind-ar-js-doc/
- Three.js公式ドキュメント: https://threejs.org/docs/
