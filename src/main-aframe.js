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
});
