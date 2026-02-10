// ========== 設定値（config.jsonから読み込み） ==========
let CONFIG = {
  targetURL: 'https://example.com', // タップ時の遷移先URL（デフォルト）
};
let BGM_AUDIO = null;

// ========== 設定ファイルを読み込み ==========
async function loadConfig() {
  try {
    // まずAPIから設定を取得（優先）
    try {
      const apiResponse = await fetch('/api/get-config');
      if (apiResponse.ok) {
        const config = await apiResponse.json();
        console.log('[CONFIG] API から設定読み込み成功:', config);

        // URLを更新
        CONFIG.targetURL = config.ar.targetUrl;
        console.log('[CONFIG] 遷移先URL設定:', CONFIG.targetURL);

        // タップ領域のURLを更新
        const tapArea = document.getElementById('tap-area');
        if (tapArea) {
          tapArea.setAttribute('tap-to-url', `url: ${CONFIG.targetURL}`);
          console.log('[CONFIG] タップ領域のURL更新完了');
        }

        // 3Dモデルを表示
        if (config.ar.model.enabled) {
          showModel(config.ar.model);
        }

        // BGMを設定
        if (config.ar.bgm.enabled && config.ar.bgm.url) {
          setupBGM(config.ar.bgm);
        }

        return config;
      }
    } catch (apiError) {
      console.warn('[CONFIG] API読み込み失敗、config.jsonから読み込みます:', apiError);
    }

    // フォールバック: config.jsonから読み込み
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      console.log('[CONFIG] config.jsonから設定読み込み成功:', config);

      // URLを更新
      CONFIG.targetURL = config.ar.targetUrl;
      console.log('[CONFIG] 遷移先URL設定:', CONFIG.targetURL);

      // タップ領域のURLを更新
      const tapArea = document.getElementById('tap-area');
      if (tapArea) {
        tapArea.setAttribute('tap-to-url', `url: ${CONFIG.targetURL}`);
        console.log('[CONFIG] タップ領域のURL更新完了');
      }

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
  // index.htmlに既にモデルがある場合はスケール等を更新するだけ
  const existingModel = document.getElementById('ar-model');
  if (existingModel) {
    existingModel.setAttribute('position', `${modelConfig.position.x} ${modelConfig.position.y} ${modelConfig.position.z}`);
    existingModel.setAttribute('scale', `${modelConfig.scale.x} ${modelConfig.scale.y} ${modelConfig.scale.z}`);
    existingModel.setAttribute('rotation', `${modelConfig.rotation.x} ${modelConfig.rotation.y} ${modelConfig.rotation.z}`);
    existingModel.setAttribute('tap-to-url', `url: ${CONFIG.targetURL}`);
    console.log('[MODEL] 既存モデルの設定を更新');
    return;
  }

  const target = document.querySelector('[mindar-image-target]');

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

// ========== デバッグ表示更新 ==========
function updateDebug(message) {
  const debugEl = document.getElementById('debug-status');
  if (debugEl) {
    debugEl.innerHTML = message;
  }
  console.log('[DEBUG]', message);
}

// ========== A-Frameシーン準備完了 ==========
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[APP] 起動開始');
  updateDebug('状態: DOMContentLoaded');

  // 設定ファイルを読み込み
  await loadConfig();
  updateDebug('状態: 設定読み込み完了');

  const sceneEl = document.querySelector('a-scene');

  if (!sceneEl) {
    updateDebug('エラー: a-sceneが見つかりません');
    return;
  }

  updateDebug('状態: シーン初期化中...');

  // シーン読み込み完了
  sceneEl.addEventListener('loaded', () => {
    console.log('[AR] シーン読み込み完了');
    updateDebug('状態: シーン読み込み完了<br>カメラ起動中...');
  });

  // renderstart - カメラが起動した時
  sceneEl.addEventListener('renderstart', () => {
    console.log('[AR] レンダリング開始');
    updateDebug('状態: レンダリング開始<br>ターゲットをかざしてください');
  });

  // MindARエラーハンドリング
  sceneEl.addEventListener('arError', (event) => {
    console.error('[AR] ARエラー:', event);
    updateDebug('エラー: ' + JSON.stringify(event.detail));
  });

  sceneEl.addEventListener('arReady', () => {
    console.log('[AR] AR準備完了');
    updateDebug('状態: AR準備完了<br>ターゲットをかざしてください');
  });

  // GLBモデルの読み込み監視
  const arModel = document.getElementById('ar-model');
  if (arModel) {
    arModel.addEventListener('model-loaded', () => {
      console.log('[MODEL] GLBモデル読み込み完了');
      updateDebug('状態: AR準備完了<br>モデル読み込み完了<br>ターゲットをかざしてください');
    });
    arModel.addEventListener('model-error', (e) => {
      console.error('[MODEL] GLBモデル読み込みエラー:', e);
      updateDebug('エラー: モデル読み込み失敗<br>' + (e.detail ? e.detail.src : ''));
    });
  }

  // ターゲット検出時
  const target = document.querySelector('[mindar-image-target]');

  target.addEventListener('targetFound', () => {
    console.log('[AR] ターゲット検出');
    updateDebug('状態: ✅ ターゲット検出!');
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
    updateDebug('状態: ターゲットロスト<br>もう一度かざしてください');
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

  // 画面全体のタップを検知（最終手段） - 複数の要素にリスナーを追加
  let isTargetFound = false;

  // ターゲット検出状態を追跡
  target.addEventListener('targetFound', () => {
    isTargetFound = true;
  });

  target.addEventListener('targetLost', () => {
    isTargetFound = false;
  });

  // タップイベントハンドラー
  const handleTap = (e) => {
    // ターゲットが検出されている時のみURL遷移
    if (!isTargetFound) {
      console.log('[TAP] ターゲット未検出のためスキップ');
      return;
    }

    console.log('[TAP] 画面タップ検知 -> URL遷移');
    e.preventDefault();
    e.stopPropagation();

    // BGM再生を試みる（ユーザーインタラクション）
    if (BGM_AUDIO && BGM_AUDIO.paused) {
      BGM_AUDIO.play().catch(err => console.warn('[BGM] 再生失敗:', err));
    }

    // URL遷移
    const targetUrl = CONFIG.targetURL;
    console.log('[TAP] URL遷移:', targetUrl);

    // 少し遅延させて確実に遷移
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 100);
  };

  // 複数の要素にタップリスナーを追加
  const sceneCanvas = document.querySelector('a-scene canvas');
  const sceneElement = document.querySelector('a-scene');
  const tapIndicatorEl = document.getElementById('tap-indicator');

  if (sceneCanvas) {
    sceneCanvas.addEventListener('touchend', handleTap);
    sceneCanvas.addEventListener('click', handleTap);
    console.log('[INIT] Canvas タップリスナー登録完了');
  }

  if (sceneElement) {
    sceneElement.addEventListener('touchend', handleTap);
    sceneElement.addEventListener('click', handleTap);
    console.log('[INIT] Scene タップリスナー登録完了');
  }

  if (tapIndicatorEl) {
    tapIndicatorEl.addEventListener('touchend', handleTap);
    tapIndicatorEl.addEventListener('click', handleTap);
    // タップインジケーター自体もクリック可能にする
    tapIndicatorEl.style.pointerEvents = 'auto';
    console.log('[INIT] TapIndicator タップリスナー登録完了');
  }

  // body全体にもリスナーを追加（最終フォールバック）
  document.body.addEventListener('touchend', (e) => {
    if (isTargetFound && e.target.closest('a-scene, #tap-indicator')) {
      handleTap(e);
    }
  });

  console.log('[INIT] 全タップリスナー登録完了');
});
// Force rebuild 2026年 2月  4日 水曜日 00:50:24    
