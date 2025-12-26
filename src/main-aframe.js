// ========== 設定値（後で差し替え可能） ==========
const CONFIG = {
  targetURL: 'https://example.com', // タップ時の遷移先URL
};

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

  // クリック可能オブジェクトのタップイベント
  const clickable = document.getElementById('clickable');

  if (clickable) {
    clickable.addEventListener('click', () => {
      console.log('[TAP] オブジェクトタップ検知 -> URL遷移:', CONFIG.targetURL);
      window.location.href = CONFIG.targetURL;
    });

    // タッチデバイス用
    clickable.addEventListener('touchend', (e) => {
      e.preventDefault();
      console.log('[TAP] オブジェクトタップ検知(touch) -> URL遷移:', CONFIG.targetURL);
      window.location.href = CONFIG.targetURL;
    });
  }
});
