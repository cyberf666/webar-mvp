// ========== 設定値（config.jsonから読み込み） ==========
let CONFIG = {
  targetURL: 'https://example.com', // タップ時の遷移先URL（デフォルト）
};
let BGM_AUDIO = null;

// ========== 設定ファイルを読み込み ==========
async function loadConfig() {
  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      console.log('[CONFIG] 設定ファイル読み込み成功:', config);

      // URLを更新
      CONFIG.targetURL = config.ar.targetUrl;

      // 3Dモデルを表示
      if (config.ar.model.enabled) {
        showModel(config.ar.model);
      }

      // BGMを設定
      if (config.ar.bgm.enabled && config.ar.bgm.url) {
        setupBGM(config.ar.bgm);
      }

      return config;
    } else {
      console.warn('[CONFIG] 設定ファイルが見つかりません。デフォルト設定を使用します。');
    }
  } catch (error) {
    console.error('[CONFIG] 設定ファイルの読み込みに失敗:', error);
  }
  return null;
}

// ========== 3Dモデルを表示 ==========
function showModel(modelConfig) {
  const target = document.querySelector('[mindar-image-target]');

  // 既存の透明ボックスを削除
  const tapArea = document.getElementById('tap-area');
  if (tapArea) {
    tapArea.remove();
  }

  // GLTFモデルを追加
  const model = document.createElement('a-gltf-model');
  model.setAttribute('src', modelConfig.url);
  model.setAttribute('position', `${modelConfig.position.x} ${modelConfig.position.y} ${modelConfig.position.z}`);
  model.setAttribute('scale', `${modelConfig.scale.x} ${modelConfig.scale.y} ${modelConfig.scale.z}`);
  model.setAttribute('rotation', `${modelConfig.rotation.x} ${modelConfig.rotation.y} ${modelConfig.rotation.z}`);
  model.setAttribute('class', 'clickable');
  model.setAttribute('tap-to-url', `url: ${CONFIG.targetURL}`);

  if (modelConfig.animation.enabled) {
    model.setAttribute('animation-mixer', '');
  }

  target.appendChild(model);
  console.log('[MODEL] 3Dモデルを表示:', modelConfig.url);
}

// ========== BGMを設定 ==========
function setupBGM(bgmConfig) {
  BGM_AUDIO = new Audio(bgmConfig.url);
  BGM_AUDIO.volume = bgmConfig.volume;
  BGM_AUDIO.loop = bgmConfig.loop;

  if (bgmConfig.autoplay) {
    // ターゲット検出時にBGM再生
    const target = document.querySelector('[mindar-image-target]');
    target.addEventListener('targetFound', () => {
      if (BGM_AUDIO && BGM_AUDIO.paused) {
        BGM_AUDIO.play().catch(err => {
          console.warn('[BGM] 自動再生に失敗（ユーザーインタラクション必要）:', err);
        });
      }
    });

    target.addEventListener('targetLost', () => {
      if (BGM_AUDIO && !BGM_AUDIO.paused) {
        BGM_AUDIO.pause();
      }
    });
  }

  console.log('[BGM] BGMを設定:', bgmConfig.url);
}

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
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[APP] 起動開始');

  // 設定ファイルを読み込み
  await loadConfig();

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

      // BGM再生を試みる（ユーザーインタラクション）
      if (BGM_AUDIO && BGM_AUDIO.paused) {
        BGM_AUDIO.play().catch(err => console.warn('[BGM] 再生失敗:', err));
      }

      // URL遷移
      const clickables = document.querySelectorAll('.clickable');
      if (clickables.length > 0) {
        const url = clickables[0].getAttribute('tap-to-url');
        if (url) {
          console.log('[FALLBACK] URL遷移:', url);
          window.location.href = url;
        }
      } else {
        // clickableがない場合はCONFIGのURLを使用
        console.log('[FALLBACK] CONFIG URL遷移:', CONFIG.targetURL);
        window.location.href = CONFIG.targetURL;
      }
    });
  }
});
