# 管理画面 使い方ガイド

WebARの設定を簡単に変更できる管理画面の使い方を説明します。

---

## 📍 アクセス方法

管理画面URL: `https://あなたのドメイン/admin.html`

**例**: `https://webar-mvp.vercel.app/admin.html`

---

## 🔐 ログイン

### デフォルトパスワード

```
admin123
```

**⚠️ 重要**: 本番環境では必ず`src/admin.js`の1行目のパスワードを変更してください！

```javascript
const PASSWORD = 'admin123'; // ← ここを変更
```

---

## ⚙️ 設定項目

### 1️⃣ タップ時のリンク先

ARオブジェクトをタップした時に開くURLを設定します。

**入力例**:
```
https://example.com
https://yourshop.com/product/123
```

---

### 2️⃣ 3Dモデル設定

#### ✅ 3Dモデルを使用する（トグル）

- **ON**: Blenderで作成したGLBモデルを表示
- **OFF**: 透明なタップ領域のみ（デフォルト）

#### 📦 GLBファイルをアップロード

1. 「ファイルを選択」をクリック
2. Blenderでエクスポートした`.glb`ファイルを選択
3. ファイル名とサイズが表示されます

**推奨設定**:
- ファイルサイズ: 10MB以下
- フォーマット: GLB（バイナリ形式）

#### 🎯 位置調整 (Position)

- **X**: 左右（-が左、+が右）
- **Y**: 上下（-が下、+が上）
- **Z**: 前後（-が奥、+が手前）

**例**:
```
X: 0, Y: 0, Z: 0  → 中央
X: 0, Y: 0.3, Z: 0  → 少し上
X: 0.2, Y: 0, Z: 0  → 右にずらす
```

#### 📏 スケール (Scale)

モデルの大きさを調整します。

**例**:
```
X: 1, Y: 1, Z: 1  → 元のサイズ
X: 2, Y: 2, Z: 2  → 2倍
X: 0.5, Y: 0.5, Z: 0.5  → 半分
```

#### 🔄 回転 (Rotation)

度数法で指定します（0～360度）。

**例**:
```
X: 0, Y: 0, Z: 0  → 回転なし
X: 90, Y: 0, Z: 0  → X軸で90度回転
X: 0, Y: 180, Z: 0  → Y軸で180度回転（反転）
```

#### 🎬 アニメーションを再生する（トグル）

- **ON**: GLBファイル内のアニメーションを自動再生
- **OFF**: 静止モデルとして表示

---

### 3️⃣ BGM設定

#### ✅ BGMを使用する（トグル）

- **ON**: ターゲット検出時にBGMを再生
- **OFF**: BGMなし

#### 🎵 BGM URL

MP3ファイルのURLを入力します。

**対応フォーマット**: MP3, OGG, WAV

**入力例**:
```
https://example.com/audio/bgm.mp3
https://cdn.jsdelivr.net/gh/username/repo/audio.mp3
```

**無料BGMホスティング**:
- [GitHub Pages](https://pages.github.com/)
- [jsDelivr CDN](https://www.jsdelivr.com/)
- [Cloudinary](https://cloudinary.com/)

#### 🔊 音量

0.0（無音）～ 1.0（最大音量）

**推奨**: `0.5` （50%）

#### 🔁 ループ再生（トグル）

- **ON**: BGMを繰り返し再生
- **OFF**: 1回だけ再生

#### ▶️ 自動再生（トグル）

- **ON**: ターゲット検出時に自動で再生開始
- **OFF**: 手動再生のみ

**⚠️ 注意**:
- iOSでは自動再生がブロックされる場合があります
- 画面タップ時にBGMが再生されるフォールバック機能を実装済み

---

## 💾 設定の保存方法

### 手順

1. すべての設定項目を入力
2. 「💾 設定を保存してダウンロード」をクリック
3. 以下のファイルがダウンロードされます:
   - `config.json` - 設定ファイル
   - `model.glb` - 3Dモデル（アップロードした場合のみ）

### ファイル配置

ダウンロードしたファイルをプロジェクトに配置します:

```
webar-mvp/
├── public/
│   ├── config.json        ← ダウンロードしたconfig.jsonで上書き
│   └── models/
│       └── model.glb      ← ダウンロードしたGLBファイルを配置
```

### Gitにコミット＆プッシュ

```bash
cd /c/Users/takum/webar-mvp

# ファイルを追加
git add public/config.json
git add public/models/model.glb  # モデルをアップロードした場合

# コミット
git commit -m "Update AR config: 3D model and BGM settings"

# プッシュ
git push
```

Vercelが自動的にデプロイします（数分）。

---

## 🔄 現在の設定を読み込む

「🔄 現在の設定を読み込む」をクリックすると、サーバー上の`config.json`を読み込んでフォームに反映します。

**用途**:
- 現在の設定を確認
- 既存設定を微調整

---

## 📝 設定例

### パターン1: シンプルなリンクのみ

```
✅ タップ時のリンク先: https://yourshop.com
❌ 3Dモデルを使用する: OFF
❌ BGMを使用する: OFF
```

→ 透明なタップ領域のみ、タップでURL遷移

---

### パターン2: 3Dモデル + リンク

```
✅ タップ時のリンク先: https://yourshop.com/product
✅ 3Dモデルを使用する: ON
  - GLBファイル: character.glb
  - Position: 0, 0, 0
  - Scale: 1, 1, 1
  - Rotation: 0, 0, 0
  - ✅ アニメーション再生: ON
❌ BGMを使用する: OFF
```

→ アニメーション付き3Dモデルを表示、タップでURL遷移

---

### パターン3: フルセット（モデル + BGM + リンク）

```
✅ タップ時のリンク先: https://event.example.com
✅ 3Dモデルを使用する: ON
  - GLBファイル: logo.glb
  - Position: 0, 0.2, 0
  - Scale: 1.5, 1.5, 1.5
  - Rotation: 0, 45, 0
  - ✅ アニメーション再生: ON
✅ BGMを使用する: ON
  - BGM URL: https://cdn.example.com/bgm.mp3
  - 音量: 0.5
  - ✅ ループ再生: ON
  - ✅ 自動再生: ON
```

→ 大きめの3Dモデル + BGM + タップでURL遷移

---

## 🎨 3Dモデル作成のヒント

### Blenderエクスポート設定

[BLENDER_GUIDE.md](./BLENDER_GUIDE.md) を参照してください。

**重要なポイント**:
- フォーマット: **GLB (バイナリ)**
- アニメーション: チェック
- ファイルサイズ: 10MB以下推奨

---

## 🎵 BGM音源の準備

### 推奨フォーマット

- **MP3**: 最も互換性が高い
- **ビットレート**: 128kbps～192kbps
- **ファイルサイズ**: 3MB以下推奨（モバイル最適化）

### ホスティング方法

#### オプション1: GitHubにホスト

1. `public/audio/bgm.mp3` に配置
2. Gitにコミット＆プッシュ
3. URL: `https://あなたのドメイン/audio/bgm.mp3`

#### オプション2: CDNを使用

jsDelivrを使ってGitHubリポジトリから配信:

```
https://cdn.jsdelivr.net/gh/ユーザー名/リポジトリ名/audio/bgm.mp3
```

#### オプション3: 外部サービス

- [SoundCloud](https://soundcloud.com/)
- [Cloudinary](https://cloudinary.com/)
- [Amazon S3](https://aws.amazon.com/s3/)

---

## 🐛 トラブルシューティング

### ❌ 管理画面にアクセスできない

**原因**: URLが間違っている

**解決策**:
```
https://あなたのドメイン/admin.html
```
を正しく入力してください。

---

### ❌ 設定が反映されない

**原因1**: `config.json`をGitにコミット＆プッシュしていない

**解決策**:
```bash
git add public/config.json
git commit -m "Update config"
git push
```

**原因2**: ブラウザのキャッシュ

**解決策**:
- スマホで `Ctrl+Shift+R` (強制リロード)
- ブラウザのキャッシュをクリア

---

### ❌ 3Dモデルが表示されない

**原因1**: GLBファイルを配置していない

**解決策**:
1. ダウンロードした`model.glb`を`public/models/`に配置
2. Gitにコミット＆プッシュ

**原因2**: ファイルパスが間違っている

**解決策**:
- `config.json`の`model.url`を確認
- 例: `/models/model.glb`

---

### ❌ BGMが再生されない

**原因1**: iOSの自動再生ブロック

**解決策**:
- 画面をタップすると再生されます（フォールバック機能実装済み）

**原因2**: URLが間違っている

**解決策**:
- ブラウザのコンソールでエラーを確認
- URLを直接ブラウザで開いて再生できるか確認

**原因3**: ファイルフォーマットが非対応

**解決策**:
- MP3フォーマットに変換してください

---

## 📚 関連ドキュメント

- [Blenderモデル作成ガイド](./BLENDER_GUIDE.md)
- [透過PNG画像ガイド](./IMAGE_GUIDE.md)
- [README.md](./README.md)

---

## 🔒 セキュリティ

### パスワードの変更

`src/admin.js` の1行目を編集:

```javascript
const PASSWORD = 'your-strong-password-here';
```

Gitにコミット＆プッシュして反映してください。

### アクセス制限

管理画面はURLを知っている人だけがアクセスできます。

**より強固なセキュリティが必要な場合**:
- Vercelの環境変数でパスワードを管理
- Firebase Authenticationを導入
- Basic認証を設定

---

これで管理画面から簡単にWebARの設定を変更できます！
