# 画像ターゲットフォルダ

このフォルダに `.mind` ファイルと参照用の画像を配置します。

## 必要なファイル

- `target.mind` - MindARコンパイル済みターゲットファイル（必須）
- `target.png` - 元の画像（参照用、展示時に印刷）

## .mindファイルの作成方法

1. https://hiukim.github.io/mind-ar-js-doc/tools/compile にアクセス
2. ターゲット画像をアップロード
3. コンパイル後、`targets.mind` をダウンロード
4. `target.mind` にリネームしてこのフォルダに配置

## サンプルターゲットについて

最初の動作確認には、MindAR公式のサンプル画像を使用できます:

https://github.com/hiukim/mind-ar-js/tree/master/examples/image-tracking/assets/targets

ダウンロードして使用してください。

## 良いターゲット画像の条件

✅ **推奨**:
- コントラストが高い
- エッジがはっきりしている
- 特徴点が多い（細かいディテール）
- 正方形に近い
- サイズ: 512x512 〜 1024x1024px

❌ **避けるべき**:
- 反射する素材（光沢紙、ガラス、金属）
- 無地・グラデーションのみ
- ぼやけた画像
- 極端に細長い形状
- 暗すぎる・明るすぎる
