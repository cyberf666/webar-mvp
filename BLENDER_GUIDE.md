# Blenderアニメーション付きモデルのインポート完全ガイド

このガイドでは、Blenderで作成したアニメーション付き3DモデルをWebARに組み込む手順を説明します。

## 📋 目次
1. [Blenderでのモデル作成](#1-blenderでのモデル作成)
2. [アニメーション設定](#2-アニメーション設定)
3. [GLTFエクスポート](#3-gltfエクスポート)
4. [WebARへの組み込み](#4-webarへの組み込み)
5. [トラブルシューティング](#5-トラブルシューティング)

---

## 1. Blenderでのモデル作成

### モデリングの推奨設定

- **ポリゴン数**: 10万ポリゴン以下（モバイル最適化）
- **サイズ**: 実寸で1m程度を基準（後でスケール調整可能）
- **原点**: モデルの中心を原点(0,0,0)に配置
- **マテリアル**: PBR（Principled BSDF）推奨

### テクスチャ最適化

```
推奨テクスチャサイズ:
- メインオブジェクト: 1024x1024px
- 小物: 512x512px
- 背景要素: 256x256px
```

---

## 2. アニメーション設定

### アニメーションの作り方

1. **タイムラインを開く**
   - Workspace → Animation

2. **キーフレーム設定**
   - オブジェクトを選択
   - Transform（位置・回転・スケール）を調整
   - `I` キーでキーフレーム挿入
   - フレームを進めて次のポーズを設定

3. **アニメーション名を設定**（重要！）
   - Dope Sheet → Action Editor
   - アクション名を設定（例: "Idle", "Spin", "Pulse"）
   - 複数のアニメーションを作る場合は、それぞれ別のアクションとして保存

### アニメーションの種類

#### パターン1: 単純なループアニメーション
```
例: 回転し続けるオブジェクト
- Frame 1: Rotation Z = 0°
- Frame 60: Rotation Z = 360°
- ループ設定: エクスポート時に自動ループ
```

#### パターン2: 複数パーツのアニメーション
```
例: 浮遊＋回転
- オブジェクトA（本体）: Y軸移動でゆっくり浮遊
- オブジェクトB（パーツ）: Z軸回転で回転
```

#### パターン3: ボーン（リグ）アニメーション
```
例: キャラクターの動き
- Armature（骨格）を作成
- メッシュにWeight Paint
- ボーンをアニメーション
```

### アニメーションの確認

- スペースバーで再生
- フレーム範囲を確認（例: 1-60フレーム）
- ループを想定した終了フレームを設定

---

## 3. GLTFエクスポート

### エクスポート手順

1. **File → Export → glTF 2.0 (.glb/.gltf)**

2. **エクスポート設定**

#### ✅ Include（含める要素）
- [x] **Selected Objects** または **Visible Objects**
- [x] **Custom Properties** (カスタムプロパティ)
- [x] **Cameras** (必要に応じて)
- [x] **Punctual Lights** (ライトを含める場合)

#### ✅ Transform（座標系）
- **+Y Up** (A-Frame/Three.js用)
- **Forward: -Z Forward** (デフォルト)

#### ✅ Geometry（ジオメトリ）
- [x] **Apply Modifiers** (モディファイアを適用)
- [x] **UVs** (UVマップを含める)
- [x] **Normals** (法線を含める)
- [x] **Tangents** (接線を含める - 法線マップ使用時)
- [x] **Vertex Colors** (頂点カラー使用時)

#### ✅ Materials（マテリアル）
- **Export: glTF Material Output** (Principled BSDF自動変換)

#### ✅ Animation（アニメーション）
- [x] **Animation** (アニメーションをエクスポート)
- **Limit to Playback Range**: アニメーション範囲を限定
- **Sampling Rate**: 30fps (デフォルト)
- **Always Sample Animations**: フレーム補間
- [x] **Export NLA Strips** (複数アニメーションがある場合)
- [x] **Group by NLA Track** (NLAトラックでグループ化)

#### ✅ Format（フォーマット）
- **glTF Binary (.glb)** ← 推奨（1ファイルで完結）
- または **glTF Separate (.gltf + .bin + textures)** (デバッグ用)

3. **ファイル名**: `model.glb` として保存

4. **保存先**: `C:\Users\takum\webar-mvp\public\models\model.glb`

---

## 4. WebARへの組み込み

### ステップ1: ファイル配置確認

```
webar-mvp/
└── public/
    └── models/
        └── model.glb  ← ここに配置
```

### ステップ2: index.htmlを編集

[index.html](index.html) を開いて、以下の部分を編集:

#### 現在のエフェクトをコメントアウト

```html
<!-- ========== オプション2: デフォルトエフェクト（現在有効） ========== -->
<!--
<a-sphere id="core" ...></a-sphere>
<a-entity id="particles" ...></a-entity>
<a-torus id="ring1" ...></a-torus>
<a-torus id="ring2" ...></a-torus>
-->
```

#### Blenderモデルを有効化

```html
<!-- ========== オプション1: Blenderモデルを使う場合（推奨） ========== -->
<a-gltf-model
  src="/models/model.glb"
  position="0 0 0"
  scale="1 1 1"
  rotation="0 0 0"
  animation-mixer="clip: *; loop: repeat; timeScale: 1"
  class="clickable"
  tap-to-url="url: https://example.com">
</a-gltf-model>
```

### パラメータ解説

#### `animation-mixer` の設定

| パラメータ | 説明 | 例 |
|----------|------|---|
| `clip` | 再生するアニメーション名 | `*` (全て), `Idle`, `Spin` |
| `loop` | ループモード | `repeat` (繰り返し), `once` (1回), `pingpong` (往復) |
| `timeScale` | 再生速度 | `1` (通常), `0.5` (半分), `2` (2倍速) |
| `clampWhenFinished` | 終了時にポーズ保持 | `true` / `false` |

#### 例: 複数アニメーションを切り替え

```html
<!-- アニメーション "Idle" のみ再生 -->
<a-gltf-model
  animation-mixer="clip: Idle; loop: repeat">
</a-gltf-model>

<!-- 全アニメーション再生 -->
<a-gltf-model
  animation-mixer="clip: *; loop: repeat">
</a-gltf-model>

<!-- ゆっくり再生 -->
<a-gltf-model
  animation-mixer="clip: Spin; loop: repeat; timeScale: 0.5">
</a-gltf-model>
```

#### `position`, `scale`, `rotation` の調整

```html
<!-- 位置調整 (X, Y, Z) -->
position="0 0.5 0"  → Y軸で0.5m上に移動

<!-- スケール調整 (X, Y, Z) -->
scale="0.5 0.5 0.5"  → 半分のサイズ
scale="2 2 2"        → 2倍のサイズ

<!-- 回転調整 (X, Y, Z - 度数法) -->
rotation="0 90 0"    → Y軸で90度回転
rotation="45 0 0"    → X軸で45度傾ける
```

### ステップ3: ローカルテスト

```bash
npm run dev
```

ブラウザで http://localhost:5173/ を開き、動作確認。

### ステップ4: デプロイ

```bash
git add .
git commit -m "Add Blender animated model"
git push
```

Vercelが自動的に再デプロイします。

---

## 5. トラブルシューティング

### ❌ モデルが表示されない

#### 原因1: ファイルパスが間違っている
```html
<!-- ❌ 間違い -->
<a-gltf-model src="model.glb">
<a-gltf-model src="./models/model.glb">

<!-- ✅ 正しい -->
<a-gltf-model src="/models/model.glb">
```

#### 原因2: ファイルサイズが大きすぎる
- 5MB以下に圧縮（テクスチャ解像度を下げる）
- Blenderで **File → External Data → Pack All Into .blend** してから再エクスポート

#### 原因3: スケールが小さすぎる/大きすぎる
```html
<!-- スケールを調整 -->
<a-gltf-model scale="10 10 10">  <!-- 大きくする -->
<a-gltf-model scale="0.1 0.1 0.1">  <!-- 小さくする -->
```

### ❌ アニメーションが再生されない

#### 原因1: アニメーションがエクスポートされていない
- Blenderのエクスポート設定で **Animation** にチェック
- **Export NLA Strips** にチェック

#### 原因2: animation-mixerが正しく設定されていない
```html
<!-- ✅ 正しい -->
<a-gltf-model animation-mixer="clip: *; loop: repeat">

<!-- ❌ 間違い（引用符なし） -->
<a-gltf-model animation-mixer=clip: *; loop: repeat>
```

#### 原因3: アニメーション名が間違っている
- ブラウザのコンソール(F12)でアニメーション名を確認:
```javascript
document.querySelector('a-gltf-model').components['gltf-model'].model.animations
```

### ❌ タップしてもURL遷移しない

#### 原因1: classが設定されていない
```html
<!-- ✅ class="clickable" を追加 -->
<a-gltf-model class="clickable" tap-to-url="url: https://example.com">
```

#### 原因2: カーソルが設定されていない
index.htmlの `<a-camera>` 内に以下を追加:
```html
<a-camera position="0 0 0" look-controls="enabled: false">
  <a-cursor raycaster="objects: .clickable" fuse="false"></a-cursor>
</a-camera>
```

### ❌ モデルが暗い

#### 解決策1: ライトを追加
```html
<a-entity mindar-image-target="targetIndex: 0">
  <a-light type="ambient" intensity="1"></a-light>
  <a-light type="directional" intensity="0.5" position="1 1 1"></a-light>
  <a-gltf-model src="/models/model.glb"></a-gltf-model>
</a-entity>
```

#### 解決策2: Blenderでマテリアルを調整
- Emission（発光）を追加
- Base Color を明るくする

---

## 📝 チェックリスト

エクスポート前に確認:

- [ ] ポリゴン数は10万以下
- [ ] テクスチャは1024x1024以下
- [ ] モデルの原点は(0,0,0)
- [ ] アニメーション名を設定済み
- [ ] アニメーションのループを確認
- [ ] マテリアルはPrincipled BSDF
- [ ] エクスポート設定を確認（+Y Up, Apply Modifiers, Animation）

デプロイ前に確認:

- [ ] `public/models/model.glb` にファイル配置
- [ ] index.htmlでBlenderモデルを有効化
- [ ] `class="clickable"` を設定
- [ ] `tap-to-url` でURLを設定
- [ ] ローカルで動作確認
- [ ] スマホでAR動作確認

---

## 🎨 サンプルコード集

### パターン1: シンプルな回転モデル

```html
<a-gltf-model
  src="/models/model.glb"
  position="0 0.2 0"
  scale="1 1 1"
  animation-mixer="clip: *; loop: repeat"
  class="clickable"
  tap-to-url="url: https://example.com">
</a-gltf-model>
```

### パターン2: 浮遊＋回転

```html
<a-gltf-model
  src="/models/model.glb"
  position="0 0.2 0"
  scale="1 1 1"
  animation-mixer="clip: *; loop: repeat"
  animation="property: position; from: 0 0.2 0; to: 0 0.4 0; dur: 2000; easing: easeInOutSine; loop: true; dir: alternate"
  class="clickable"
  tap-to-url="url: https://example.com">
</a-gltf-model>
```

### パターン3: クリック時に別のアニメーション再生

```html
<a-gltf-model
  id="my-model"
  src="/models/model.glb"
  animation-mixer="clip: Idle; loop: repeat"
  class="clickable">
</a-gltf-model>

<script>
document.getElementById('my-model').addEventListener('click', function() {
  this.setAttribute('animation-mixer', 'clip: Action; loop: once');
  setTimeout(() => {
    window.location.href = 'https://example.com';
  }, 1000);
});
</script>
```

---

## 📚 参考リンク

- **A-Frame公式**: https://aframe.io/docs/
- **GLTF Viewer**: https://gltf-viewer.donmccurdy.com/ (エクスポート結果確認)
- **Blender Manual**: https://docs.blender.org/manual/en/latest/
- **MindAR**: https://hiukim.github.io/mind-ar-js-doc/

---

以上で、Blenderアニメーション付きモデルのインポートが完了です！
