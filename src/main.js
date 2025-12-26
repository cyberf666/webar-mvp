// THREE は window.THREE としてグローバルに読み込まれる
const THREE = window.THREE;
import { createEffect } from './effect.js';

// ========== 設定値（後で差し替え可能） ==========
const CONFIG = {
  targetURL: 'https://example.com', // タップ時の遷移先URL
  effectYOffset: 0.2, // エフェクトのY軸オフセット
  effectScale: 1.0, // エフェクト全体のスケール
  targetImagePath: '/targets/target.mind', // .mindファイルのパス
};

// ========== UI要素 ==========
const loadingOverlay = document.getElementById('loading-overlay');
const statusText = document.getElementById('status-text');
const guideOverlay = document.getElementById('guide-overlay');
const errorMessage = document.getElementById('error-message');

// ========== 状態管理 ==========
let isTracking = false;
let effectGroup = null;
let clickableObject = null;

// ========== エラー表示 ==========
function showError(message) {
  console.error('[ERROR]', message);
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => {
    errorMessage.classList.remove('show');
  }, 5000);
}

// ========== ステータス更新 ==========
function updateStatus(message) {
  console.log('[STATUS]', message);
  statusText.textContent = message;
}

// ========== MindAR初期化 ==========
async function initAR() {
  try {
    updateStatus('カメラを起動中...');

    // MindARライブラリの読み込み確認
    if (!window.MINDAR || !window.MINDAR.IMAGE) {
      throw new Error('MindARライブラリが読み込まれていません');
    }

    const { MindARThree } = window.MINDAR.IMAGE;

    // MindAR初期化
    const mindarThree = new MindARThree({
      container: document.getElementById('container'),
      imageTargetSrc: CONFIG.targetImagePath,
      maxTrack: 1, // 同時追跡数
      uiLoading: 'no', // カスタムUIを使用
      uiScanning: 'no',
      uiError: 'no',
    });

    const { renderer, scene, camera } = mindarThree;

    // ライティング設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // アンカー取得（ターゲット0番）
    const anchor = mindarThree.addAnchor(0);

    // エフェクトグループ作成
    effectGroup = new THREE.Group();
    effectGroup.position.y = CONFIG.effectYOffset;
    effectGroup.scale.set(CONFIG.effectScale, CONFIG.effectScale, CONFIG.effectScale);
    effectGroup.visible = false;
    anchor.group.add(effectGroup);

    // 3Dエフェクト作成
    const { clickable, update } = createEffect();
    effectGroup.add(clickable);
    clickableObject = clickable;

    // ターゲット検出イベント
    anchor.onTargetFound = () => {
      console.log('[AR] ターゲット検出');
      isTracking = true;
      effectGroup.visible = true;
      guideOverlay.classList.add('hidden');
    };

    // ターゲットロストイベント
    anchor.onTargetLost = () => {
      console.log('[AR] ターゲットロスト');
      isTracking = false;
      effectGroup.visible = false;
      guideOverlay.classList.remove('hidden');
    };

    // Raycaster設定（タップ判定用）
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // タップイベント
    const handleTap = (event) => {
      if (!isTracking || !clickableObject) return;

      // タッチ座標を正規化
      const rect = renderer.domElement.getBoundingClientRect();
      const touch = event.touches ? event.touches[0] : event;
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycaster判定
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(clickableObject, true);

      if (intersects.length > 0) {
        console.log('[TAP] オブジェクトタップ検知 -> URL遷移:', CONFIG.targetURL);
        window.location.href = CONFIG.targetURL;
      }
    };

    renderer.domElement.addEventListener('click', handleTap);
    renderer.domElement.addEventListener('touchend', handleTap);

    // MindAR起動
    updateStatus('AR環境を準備中...');
    await mindarThree.start();

    updateStatus('AR起動完了');
    loadingOverlay.classList.add('hidden');
    guideOverlay.classList.remove('hidden');

    console.log('[AR] 起動成功');

    // アニメーションループ
    renderer.setAnimationLoop(() => {
      if (isTracking && update) {
        update();
      }
      renderer.render(scene, camera);
    });

  } catch (error) {
    console.error('[AR] 初期化エラー:', error);
    showError('AR初期化に失敗しました: ' + error.message);
    updateStatus('エラーが発生しました');
  }
}

// ========== アプリ起動 ==========
window.addEventListener('DOMContentLoaded', () => {
  console.log('[APP] 起動開始');

  // MindARライブラリの読み込みを待つ
  const checkMindAR = setInterval(() => {
    if (window.MINDAR && window.MINDAR.IMAGE) {
      clearInterval(checkMindAR);
      console.log('[APP] MindAR読み込み完了');
      initAR();
    }
  }, 100);

  // タイムアウト設定(10秒)
  setTimeout(() => {
    if (!window.MINDAR || !window.MINDAR.IMAGE) {
      clearInterval(checkMindAR);
      showError('MindARライブラリの読み込みに失敗しました。ページを再読み込みしてください。');
      updateStatus('エラーが発生しました');
    }
  }, 10000);
});
