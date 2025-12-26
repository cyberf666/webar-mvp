# 透過PNG画像の差し替えガイド

AR空間に表示される透過PNG画像を簡単に差し替える方法を説明します。

## 📁 ファイル配置場所

```
webar-mvp/
└── public/
    └── images/
        └── overlay.png  ← ここに配置（PNG形式）
```

---

## 🎨 画像の準備

### 推奨スペック

| 項目 | 推奨値 |
|------|--------|
| **形式** | PNG（透過部分あり） |
| **サイズ** | 512x512px または 1024x1024px |
| **ファイルサイズ** | 1MB以下（モバイル最適化） |
| **背景** | 透明（アルファチャンネル使用） |
| **カラーモード** | RGBA |

### 画像作成ツール

- **Photoshop**: File → Export → PNG (Transparency: Yes)
- **GIMP**: Export As → PNG (Save background color: No)
- **Figma**: Export → PNG (Include background: Off)
- **Canva**: Download → PNG (Transparent background)
- **オンラインツール**: https://www.remove.bg/ (背景削除)

---

## 📝 手順

### 1. 画像を準備

透過PNG画像を作成または用意します。

**例: ロゴマーク、アイコン、キャラクター、ボタンなど**

### 2. ファイル名を変更

画像ファイル名を `overlay.png` に変更します。

### 3. ファイルを配置

`C:\Users\takum\webar-mvp\public\images\overlay.png` に配置
（既存のファイルを上書き）

### 4. HTMLを修正（ファイル名が異なる場合）

もし `overlay.png` 以外の名前を使いたい場合は、[index.html:142](index.html#L142) を編集:

```html
<!-- 変更前 -->
<a-image src="/images/overlay-placeholder.svg">

<!-- 変更後（例: my-logo.png） -->
<a-image src="/images/my-logo.png">
```

### 5. 確認

ブラウザをリロード（キャッシュクリア推奨: `Ctrl+Shift+R`）

---

## ⚙️ サイズ・位置の調整

[index.html:140-152](index.html#L140-L152) で以下のパラメータを調整できます:

### 画像サイズ

```html
<a-image
  width="0.5"   ← 幅を変更（単位: メートル）
  height="0.5"  ← 高さを変更（単位: メートル）
```

**例**:
```html
width="1.0" height="1.0"  → 大きめ（1m x 1m）
width="0.3" height="0.3"  → 小さめ（30cm x 30cm）
width="0.8" height="0.4"  → 横長（80cm x 40cm）
```

### 位置調整

```html
<a-image
  position="0 0.3 0"
```

**座標の意味**:
- **X**: 左右（-が左、+が右）
- **Y**: 上下（-が下、+が上）
- **Z**: 前後（-が奥、+が手前）

**例**:
```html
position="0 0.5 0"     → 高い位置
position="0 0.1 0"     → 低い位置
position="0.2 0.3 0"   → 右に少しずらす
position="0 0.3 -0.1"  → 少し奥に配置
```

### 回転アニメーション

```html
<a-image
  animation="property: rotation; to: 0 360 0; dur: 10000; easing: linear; loop: true"
```

**パラメータ**:
- `to: 0 360 0` → Y軸で360度回転
- `dur: 10000` → 10秒で1回転（ミリ秒）
- `loop: true` → 繰り返す

**例**:
```html
<!-- 速く回転 -->
animation="property: rotation; to: 0 360 0; dur: 5000; easing: linear; loop: true"

<!-- ゆっくり回転 -->
animation="property: rotation; to: 0 360 0; dur: 20000; easing: linear; loop: true"

<!-- 回転なし -->
（animation属性を削除）
```

### 浮遊アニメーション（オプション）

回転と同時に上下に浮遊させる:

```html
<a-image
  animation__rotation="property: rotation; to: 0 360 0; dur: 10000; easing: linear; loop: true"
  animation__float="property: position; from: 0 0.3 0; to: 0 0.5 0; dur: 2000; easing: easeInOutSine; loop: true; dir: alternate">
```

---

## 🎯 複数の画像を表示

複数の画像を同時に表示したい場合:

```html
<!-- 画像1 -->
<a-image
  src="/images/logo.png"
  position="0 0.5 0"
  width="0.4"
  height="0.4"
  class="clickable"
  tap-to-url="url: https://example.com">
</a-image>

<!-- 画像2 -->
<a-image
  src="/images/button.png"
  position="0 0.2 0"
  width="0.3"
  height="0.1"
  class="clickable"
  tap-to-url="url: https://another-url.com">
</a-image>
```

---

## 🔧 トラブルシューティング

### ❌ 画像が表示されない

#### 原因1: ファイルパスが間違っている
```html
<!-- ❌ 間違い -->
<a-image src="overlay.png">
<a-image src="./images/overlay.png">

<!-- ✅ 正しい -->
<a-image src="/images/overlay.png">
```

#### 原因2: ファイル形式が間違っている
- PNGファイルを使用してください
- JPGは透過に対応していません

#### 原因3: ファイルサイズが大きすぎる
- 画像を圧縮してください（TinyPNG: https://tinypng.com/）

### ❌ 透過部分が表示される

```html
<!-- alpha-test を調整 -->
<a-image
  transparent="true"
  alpha-test="0.5"  ← 0.1～0.9で調整（高いほど透過しにくい）
```

### ❌ 画像が白く表示される

```html
<!-- shader を flat に変更 -->
<a-image
  shader="flat"
```

### ❌ 画像がぼやける

解像度を上げた画像を使用:
- 512x512 → 1024x1024
- 1024x1024 → 2048x2048

---

## 📚 サンプルコード集

### パターン1: シンプルなロゴ表示

```html
<a-image
  src="/images/logo.png"
  position="0 0.3 0"
  width="0.6"
  height="0.6"
  transparent="true"
  alpha-test="0.1"
  shader="flat"
  class="clickable"
  tap-to-url="url: https://your-website.com">
</a-image>
```

### パターン2: ボタン風（タップで別URL）

```html
<a-image
  src="/images/button.png"
  position="0 0.2 0"
  width="0.4"
  height="0.15"
  transparent="true"
  shader="flat"
  class="clickable"
  tap-to-url="url: https://shop.example.com"
  animation="property: scale; from: 1 1 1; to: 1.1 1.1 1.1; dur: 1000; easing: easeInOutSine; loop: true; dir: alternate">
</a-image>
```

### パターン3: キャラクター（回転＋浮遊）

```html
<a-image
  src="/images/character.png"
  position="0 0.4 0"
  width="0.5"
  height="0.7"
  transparent="true"
  alpha-test="0.2"
  shader="flat"
  class="clickable"
  tap-to-url="url: https://game.example.com"
  animation__rotation="property: rotation; to: 0 360 0; dur: 15000; easing: linear; loop: true"
  animation__float="property: position; from: 0 0.4 0; to: 0 0.6 0; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate">
</a-image>
```

### パターン4: 複数画像（メニュー風）

```html
<!-- タイトル -->
<a-image
  src="/images/title.png"
  position="0 0.6 0"
  width="0.8"
  height="0.2">
</a-image>

<!-- ボタン1 -->
<a-image
  src="/images/button1.png"
  position="-0.25 0.3 0"
  width="0.3"
  height="0.1"
  class="clickable"
  tap-to-url="url: https://example.com/page1">
</a-image>

<!-- ボタン2 -->
<a-image
  src="/images/button2.png"
  position="0.25 0.3 0"
  width="0.3"
  height="0.1"
  class="clickable"
  tap-to-url="url: https://example.com/page2">
</a-image>
```

---

## 🎨 デザインのコツ

### 視認性を高める

1. **縁取りを追加**: Photoshopで Stroke (白または黒)
2. **影を追加**: Drop Shadow で立体感
3. **コントラストを高める**: 明るい色を使用

### モバイル最適化

1. **シンプルなデザイン**: 細かいディテールは避ける
2. **大きめのタップエリア**: 幅0.3m以上推奨
3. **明確な視覚的フィードバック**: アニメーションでタップ可能を示す

---

## 🔄 更新フロー

1. 画像を編集
2. `public/images/overlay.png` を上書き
3. Git コミット＆プッシュ
   ```bash
   git add public/images/overlay.png
   git commit -m "Update AR overlay image"
   git push
   ```
4. Vercelが自動デプロイ（数分）
5. スマホで確認

---

これで透過PNG画像を簡単に差し替えられます！
