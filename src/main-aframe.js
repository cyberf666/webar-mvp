// ========== 設定値（後で差し替え可能） ==========
const CONFIG = {
  targetURL: 'https://example.com', // タップ時の遷移先URL
};

// ========== A-Frameカスタムコンポーネント：クリックでURL遷移 ==========
AFRAME.registerComponent('tap-to-url', {
  schema: {
    url: { type: 'string', default: 'https://example.com' }
  },
  init: function () {
    this.onClick = this.onClick.bind(this);
    this.el.addEventListener('click', this.onClick);
  },
  onClick: function () {
    console.log('[TAP] オブジェクトタップ検知 -> URL遷移:', this.data.url);
    window.location.href = this.data.url;
  }
});

// ========== UI要素 ==========
const guideOverlay = document.getElementById('guide-overlay');

// ========== A-Frameシーン準備完了 ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('[APP] 起動開始');

  const sceneEl = document.querySelector('a-scene');

  // シーン読み込み完了
  sceneEl.addEventListener('loaded', () => {
    console.log('[AR] シーン読み込み完了');
  });

  // ターゲット検出時
  const target = document.querySelector('[mindar-image-target]');

  target.addEventListener('targetFound', () => {
    console.log('[AR] ターゲット検出');
    if (guideOverlay) {
      guideOverlay.classList.add('hidden');
    }
  });

  // ターゲットロスト時
  target.addEventListener('targetLost', () => {
    console.log('[AR] ターゲットロスト');
    if (guideOverlay) {
      guideOverlay.classList.remove('hidden');
    }
  });
});
