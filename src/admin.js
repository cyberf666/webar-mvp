// ========== 定数 ==========
const PASSWORD = 'admin123'; // 本番環境では環境変数から読み込むことを推奨
let uploadedModelFile = null;
let uploadedTargetImageFile = null;
let uploadedTargetMindFile = null;
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
    let config;

    // まずAPIから設定を取得
    try {
      const apiResponse = await fetch('/api/get-config');
      if (apiResponse.ok) {
        config = await apiResponse.json();
        console.log('[ADMIN] APIから設定読み込み成功:', config);
      }
    } catch (apiError) {
      console.warn('[ADMIN] API読み込み失敗、config.jsonから読み込みます:', apiError);
    }

    // フォールバック: config.jsonを読み込み
    if (!config) {
      const response = await fetch('/config.json');
      if (!response.ok) {
        throw new Error('設定ファイルの読み込みに失敗しました');
      }
      config = await response.json();
      console.log('[ADMIN] config.jsonから設定読み込み成功:', config);
    }

    currentConfig = config;
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

  // ターゲット画像
  if (config.ar.target) {
    document.getElementById('targetImageUrl').value = config.ar.target.imageUrl || '/targets/target.png';
    document.getElementById('targetMindUrl').value = config.ar.target.mindUrl || '/targets/target.mind';
  }

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

// ========== ターゲット画像のアップロード ==========
window.handleTargetImageUpload = function(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // ファイルタイプチェック
  if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
    showError('PNG、JPG、またはJPEG画像を選択してください');
    return;
  }

  // ファイルサイズチェック（5MB制限）
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    showError('画像サイズが大きすぎます（最大5MB）');
    return;
  }

  uploadedTargetImageFile = file;

  // プレビュー表示
  const preview = document.getElementById('targetImagePreview');
  const fileName = document.getElementById('targetImageFileName');
  const fileSize = document.getElementById('targetImageFileSize');
  const previewImg = document.getElementById('targetImagePreviewImg');

  fileName.textContent = `ファイル名: ${file.name}`;
  fileSize.textContent = `サイズ: ${(file.size / 1024).toFixed(2)} KB`;

  // 画像プレビュー
  const reader = new FileReader();
  reader.onload = function(e) {
    previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);

  preview.classList.remove('hidden');

  showSuccess(`ターゲット画像 "${file.name}" を選択しました`);
}

// ========== .mindファイルのアップロード ==========
window.handleTargetMindUpload = function(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // ファイル拡張子チェック
  if (!file.name.endsWith('.mind')) {
    showError('.mindファイルを選択してください');
    return;
  }

  // ファイルサイズチェック（10MB制限）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showError('ファイルサイズが大きすぎます（最大10MB）');
    return;
  }

  uploadedTargetMindFile = file;

  // プレビュー表示
  const preview = document.getElementById('targetMindPreview');
  const fileName = document.getElementById('targetMindFileName');
  const fileSize = document.getElementById('targetMindFileSize');

  fileName.textContent = `ファイル名: ${file.name}`;
  fileSize.textContent = `サイズ: ${(file.size / 1024).toFixed(2)} KB`;
  preview.classList.remove('hidden');

  showSuccess(`.mindファイル "${file.name}" を選択しました`);
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
        target: {
          imageUrl: uploadedTargetImageFile ? `/targets/${uploadedTargetImageFile.name}` : (currentConfig?.ar.target?.imageUrl || '/targets/target.png'),
          mindUrl: uploadedTargetMindFile ? `/targets/${uploadedTargetMindFile.name}` : (currentConfig?.ar.target?.mindUrl || '/targets/target.mind')
        },
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

    // APIに送信して保存
    const response = await fetch('/api/save-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '設定の保存に失敗しました');
    }

    const result = await response.json();
    console.log('[SAVE] 設定をサーバーに保存しました:', result);

    // ファイルのアップロードが必要な場合は警告
    let successMsg = '✅ 設定を保存しました！即座に反映されます。\n\n';

    if (uploadedTargetImageFile || uploadedTargetMindFile || uploadedModelFile) {
      successMsg += '⚠️ アップロードしたファイルの配置が必要です:\n\n';

      if (uploadedTargetImageFile) {
        successMsg += `📁 ${uploadedTargetImageFile.name} → public/targets/\n`;
      }
      if (uploadedTargetMindFile) {
        successMsg += `📁 ${uploadedTargetMindFile.name} → public/targets/\n`;
      }
      if (uploadedModelFile) {
        successMsg += `📁 ${uploadedModelFile.name} → public/models/\n`;
      }

      successMsg += '\nGitでコミット＆プッシュしてください:\n';
      successMsg += '  git add .\n';
      successMsg += '  git commit -m "Add AR assets"\n';
      successMsg += '  git push\n';
    } else {
      successMsg += '🎉 すぐにQRコードを生成できます！';
    }

    showSuccess(successMsg);
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

  // 手順説明が長いので15秒表示
  setTimeout(() => {
    div.classList.add('hidden');
  }, 15000);
}

function showError(message) {
  const div = document.getElementById('save-error');
  div.textContent = message;
  div.classList.remove('hidden');

  setTimeout(() => {
    div.classList.add('hidden');
  }, 5000);
}

// ========== QRコード生成（設定を保存してから開く） ==========
window.generateQRCode = async function() {
  try {
    // まず設定を保存
    await saveConfig();

    // 保存成功後、すぐにQRコードページを開く
    setTimeout(() => {
      window.open('/qr-code.html', '_blank');
      showSuccess('QRコードページを開きました！\n設定は即座に反映されています。');
    }, 500);

  } catch (error) {
    console.error('QRコード生成エラー:', error);
    showError('設定の保存に失敗しました。QRコードを生成できません。');
  }
}

// ========== Enterキーでログイン ==========
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      login();
    }
  });
});
