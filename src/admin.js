// ========== 定数 ==========
const PASSWORD = 'admin123'; // 本番環境では環境変数から読み込むことを推奨
let uploadedModelFile = null;
let currentConfig = null;

// ========== 認証 ==========
window.login = function() {
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');

  if (password === PASSWORD) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-screen').classList.remove('hidden');
    loadConfig();
  } else {
    errorDiv.textContent = 'パスワードが間違っています';
    errorDiv.classList.remove('hidden');
  }
}

window.logout = function() {
  document.getElementById('admin-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('password').value = '';
}

// ========== 設定の読み込み ==========
window.loadConfig = async function() {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('設定ファイルの読み込みに失敗しました');
    }

    currentConfig = await response.json();
    applyConfigToForm(currentConfig);

    showSuccess('設定を読み込みました');
  } catch (error) {
    console.error('設定読み込みエラー:', error);
    showError('設定の読み込みに失敗しました: ' + error.message);
  }
}

function applyConfigToForm(config) {
  // リンク先
  document.getElementById('targetUrl').value = config.ar.targetUrl || '';

  // 3Dモデル
  const modelEnabled = config.ar.model.enabled || false;
  document.getElementById('modelEnabled').checked = modelEnabled;

  if (modelEnabled) {
    document.getElementById('modelSettings').classList.remove('hidden');
  }

  document.getElementById('posX').value = config.ar.model.position.x;
  document.getElementById('posY').value = config.ar.model.position.y;
  document.getElementById('posZ').value = config.ar.model.position.z;

  document.getElementById('scaleX').value = config.ar.model.scale.x;
  document.getElementById('scaleY').value = config.ar.model.scale.y;
  document.getElementById('scaleZ').value = config.ar.model.scale.z;

  document.getElementById('rotX').value = config.ar.model.rotation.x;
  document.getElementById('rotY').value = config.ar.model.rotation.y;
  document.getElementById('rotZ').value = config.ar.model.rotation.z;

  document.getElementById('animationEnabled').checked = config.ar.model.animation.enabled;

  // BGM
  const bgmEnabled = config.ar.bgm.enabled || false;
  document.getElementById('bgmEnabled').checked = bgmEnabled;

  if (bgmEnabled) {
    document.getElementById('bgmSettings').classList.remove('hidden');
  }

  document.getElementById('bgmUrl').value = config.ar.bgm.url || '';
  document.getElementById('bgmVolume').value = config.ar.bgm.volume;
  document.getElementById('bgmLoop').checked = config.ar.bgm.loop;
  document.getElementById('bgmAutoplay').checked = config.ar.bgm.autoplay;
}

// ========== 3Dモデル設定のトグル ==========
window.toggleModelSettings = function() {
  const enabled = document.getElementById('modelEnabled').checked;
  const settings = document.getElementById('modelSettings');

  if (enabled) {
    settings.classList.remove('hidden');
  } else {
    settings.classList.add('hidden');
  }
}

// ========== BGM設定のトグル ==========
window.toggleBgmSettings = function() {
  const enabled = document.getElementById('bgmEnabled').checked;
  const settings = document.getElementById('bgmSettings');

  if (enabled) {
    settings.classList.remove('hidden');
  } else {
    settings.classList.add('hidden');
  }
}

// ========== モデルファイルのアップロード ==========
window.handleModelUpload = function(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // ファイルタイプチェック
  if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
    showError('GLBまたはGLTFファイルを選択してください');
    return;
  }

  // ファイルサイズチェック（10MB制限）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showError('ファイルサイズが大きすぎます（最大10MB）');
    return;
  }

  uploadedModelFile = file;

  // プレビュー表示
  const preview = document.getElementById('modelPreview');
  const fileName = document.getElementById('modelFileName');
  const fileSize = document.getElementById('modelFileSize');

  fileName.textContent = `ファイル名: ${file.name}`;
  fileSize.textContent = `サイズ: ${(file.size / 1024).toFixed(2)} KB`;
  preview.classList.remove('hidden');

  showSuccess(`モデルファイル "${file.name}" を選択しました`);
}

// ========== 設定の保存 ==========
window.saveConfig = async function() {
  try {
    // フォームから設定を収集
    const config = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      ar: {
        targetUrl: document.getElementById('targetUrl').value,
        model: {
          enabled: document.getElementById('modelEnabled').checked,
          url: uploadedModelFile ? `/models/${uploadedModelFile.name}` : (currentConfig?.ar.model.url || '/models/model.glb'),
          position: {
            x: parseFloat(document.getElementById('posX').value),
            y: parseFloat(document.getElementById('posY').value),
            z: parseFloat(document.getElementById('posZ').value)
          },
          scale: {
            x: parseFloat(document.getElementById('scaleX').value),
            y: parseFloat(document.getElementById('scaleY').value),
            z: parseFloat(document.getElementById('scaleZ').value)
          },
          rotation: {
            x: parseFloat(document.getElementById('rotX').value),
            y: parseFloat(document.getElementById('rotY').value),
            z: parseFloat(document.getElementById('rotZ').value)
          },
          animation: {
            enabled: document.getElementById('animationEnabled').checked
          }
        },
        bgm: {
          enabled: document.getElementById('bgmEnabled').checked,
          url: document.getElementById('bgmUrl').value,
          volume: parseFloat(document.getElementById('bgmVolume').value),
          loop: document.getElementById('bgmLoop').checked,
          autoplay: document.getElementById('bgmAutoplay').checked
        }
      }
    };

    // JSONファイルとしてダウンロード
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);

    // モデルファイルもダウンロード
    if (uploadedModelFile) {
      const modelBlob = new Blob([uploadedModelFile], { type: 'model/gltf-binary' });
      const modelUrl = URL.createObjectURL(modelBlob);
      const modelLink = document.createElement('a');
      modelLink.href = modelUrl;
      modelLink.download = uploadedModelFile.name;
      modelLink.click();
      URL.revokeObjectURL(modelUrl);

      showSuccess(`設定ファイル（config.json）とモデルファイル（${uploadedModelFile.name}）をダウンロードしました。\n\nconfig.json を public/ に、${uploadedModelFile.name} を public/models/ に配置してGitにコミット＆プッシュしてください。`);
    } else {
      showSuccess('設定ファイル（config.json）をダウンロードしました。\n\npublic/config.json を上書きしてGitにコミット＆プッシュしてください。');
    }

    currentConfig = config;

  } catch (error) {
    console.error('保存エラー:', error);
    showError('設定の保存に失敗しました: ' + error.message);
  }
}

// ========== メッセージ表示 ==========
function showSuccess(message) {
  const div = document.getElementById('save-success');
  div.textContent = message;
  div.classList.remove('hidden');

  setTimeout(() => {
    div.classList.add('hidden');
  }, 8000);
}

function showError(message) {
  const div = document.getElementById('save-error');
  div.textContent = message;
  div.classList.remove('hidden');

  setTimeout(() => {
    div.classList.add('hidden');
  }, 5000);
}

// ========== Enterキーでログイン ==========
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      login();
    }
  });
});
