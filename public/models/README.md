# 3Dモデルフォルダ

Blenderで作成した3Dモデル（GLTF/GLB形式）をここに配置します。

## Blenderからのエクスポート手順

1. **Blenderでモデルを作成**
2. **File → Export → glTF 2.0 (.glb/.gltf)** を選択
3. **エクスポート設定**:
   - Format: **glTF Binary (.glb)** 推奨（ファイルサイズ小）
   - Include: Selected Objects（選択オブジェクトのみ）または Visible Objects
   - Transform: +Y Up（A-Frame用）
   - Geometry: Apply Modifiers をチェック
   - Animation: アニメーションがある場合はチェック
4. **ファイル名**: `model.glb` として保存
5. このフォルダに配置: `public/models/model.glb`

## 使い方

### HTML側（index.html）

現在のエフェクトを削除して、GLTFモデルに置き換える:

```html
<a-entity mindar-image-target="targetIndex: 0">
  <!-- Blenderモデルを読み込み -->
  <a-gltf-model
    src="/models/model.glb"
    position="0 0 0"
    scale="1 1 1"
    rotation="0 0 0"
    animation-mixer
    tap-to-url="url: https://example.com">
  </a-gltf-model>
</a-entity>
```

## スケール・位置調整

- **position**: X Y Z（例: "0 0.2 0" で上に移動）
- **scale**: X Y Z（例: "0.5 0.5 0.5" で半分のサイズ）
- **rotation**: X Y Z（度数法、例: "0 90 0" でY軸90度回転）

## アニメーション付きモデル

Blenderでアニメーションを作成した場合、`animation-mixer` を追加すれば自動再生されます。

## ファイルサイズ最適化

- テクスチャを圧縮（1024x1024以下推奨）
- ポリゴン数を削減（モバイルでは10万ポリゴン以下推奨）
- 不要なマテリアルを削除

## 注意事項

- モバイルでの動作を考慮し、軽量なモデルを使用してください
- GLBファイルは5MB以下を推奨
- テクスチャは埋め込み（Embedded）にすると管理が簡単です
