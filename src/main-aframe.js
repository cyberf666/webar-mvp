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
    this.handleClick = this.handleClick.bind(this);
    this.handleTouch = this.handleTouch.bind(this);

    // マウスクリックイベント（PC用）
    this.el.addEventListener('click', this.handleClick);

    // タッチイベント（スマホ用）
    this.el.addEventListener('touchend', this.handleTouch);

    // カーソルイベント（A-Frame cursor用）
    this.el.addEventListener('mouseenter', () => {
      console.log('[HOVER] オブジェクトにカーソル');
    });
  },
  handleClick: function (evt) {
    console.log('[CLICK] オブジェクトクリック検知 -> URL遷移:', this.data.url);
    evt.stopPropagation();
    window.location.href = this.data.url;
  },
  handleTouch: function (evt) {
    console.log('[TOUCH] オブジェクトタッチ検知 -> URL遷移:', this.data.url);
    evt.preventDefault();
    evt.stopPropagation();
    window.location.href = this.data.url;
  },
  remove: function () {
    this.el.removeEventListener('click', this.handleClick);
    this.el.removeEventListener('touchend', this.handleTouch);
  }
});

// ========== UI要素 ==========
const guideOverlay = document.getElementById('guide-overlay');
const tapIndicator = document.getElementById('tap-indicator');

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
    // Show tap indicator when target is found
    if (tapIndicator) {
      tapIndicator.style.display = 'block';
    }
  });

  // ターゲットロスト時
  target.addEventListener('targetLost', () => {
    console.log('[AR] ターゲットロスト');
    if (guideOverlay) {
      guideOverlay.classList.remove('hidden');
    }
    // Hide tap indicator when target is lost
    if (tapIndicator) {
      tapIndicator.style.display = 'none';
    }
  });

  // デバッグ: タップ可能オブジェクトの確認
  setTimeout(() => {
    const clickables = document.querySelectorAll('.clickable');
    console.log('[DEBUG] クリック可能なオブジェクト数:', clickables.length);
    clickables.forEach((el, index) => {
      console.log(`[DEBUG] オブジェクト ${index}:`, el.tagName, el.id);

      // 追加のタッチイベントリスナー（バックアップ）
      el.addEventListener('touchstart', (e) => {
        console.log('[DEBUG] touchstart検知');
      });

      el.addEventListener('mousedown', (e) => {
        console.log('[DEBUG] mousedown検知');
      });
    });
  }, 2000);

  // 画面全体のタップを検知（最終手段）
  const sceneCanvas = document.querySelector('a-scene canvas');
  if (sceneCanvas) {
    sceneCanvas.addEventListener('touchend', (e) => {
      console.log('[FALLBACK] 画面タップ検知 -> URL遷移');
      const clickables = document.querySelectorAll('.clickable');
      if (clickables.length > 0) {
        const url = clickables[0].getAttribute('tap-to-url');
        if (url) {
          console.log('[FALLBACK] URL遷移:', url);
          window.location.href = url;
        }
      }
    });
  }
});
