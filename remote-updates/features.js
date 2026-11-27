
(() => {
  'use strict';

  if (window.sdFeaturesStarted) return;
  window.sdFeaturesStarted = true;

  // =========================
  // 1. شاشة التحميل الأصلية
  // =========================

  const screen = document.createElement('div');
  screen.id = 'sdRemoteLoading';

  screen.innerHTML = `
    <img id="sdLoadingImage"
      src="https://alex-ali119.github.io/stick-duel/remote-updates/stickman-battle-logo.png"
      alt="Loading">
    <div class="sd-load-area">
      <div class="sd-load-track">
        <div id="sdLoadProgress"></div>
      </div>
      <div id="sdLoadPercent">0%</div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #sdRemoteLoading {
      position:fixed;
      inset:0;
      width:100%;
      height:100%;
      height:100dvh;
      z-index:2147483647;
      background:#160d24;
      overflow:hidden;
    }

    #sdLoadingImage {
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }

    .sd-load-area {
      position:absolute;
      left:15%;
      right:15%;
      bottom:8%;
      z-index:2;
      text-align:center;
    }

    .sd-load-track {
      height:14px;
      background:#ffffff66;
      border:2px solid white;
      border-radius:20px;
      overflow:hidden;
    }

    #sdLoadProgress {
      width:0%;
      height:100%;
      background:#00eaff;
      border-radius:20px;
    }

    #sdLoadPercent {
      color:white;
      font-size:20px;
      font-weight:bold;
      margin-top:8px;
    }

    @media (orientation:portrait) {
      #sdRemoteLoading {
        width:100vh;
        height:100vw;
        width:100dvh;
        height:100vw;
        top:50%;
        left:50%;
        right:auto;
        bottom:auto;
        transform:translate(-50%,-50%) rotate(90deg);
      }
    }

    #sdProfileBtn {
      position:fixed;
      top:12px;
      right:12px;
      z-index:10000;
      background:#7544bd;
      color:white;
      border:2px solid white;
      border-radius:12px;
      padding:9px 13px;
      font-weight:bold;
    }

    #sdProfileBox {
      display:none;
      position:fixed;
      inset:0;
      z-index:100000;
      background:#000c;
      align-items:center;
      justify-content:center;
      padding:15px;
      box-sizing:border-box;
    }

    #sdProfileCard {
      width:100%;
      max-width:380px;
      max-height:90%;
      overflow:auto;
      box-sizing:border-box;
      background:#21172e;
      color:white;
      border:2px solid #9364d0;
      border-radius:18px;
      padding:18px;
      text-align:center;
    }

    #sdProfileCard input,
    #sdProfileCard select {
      width:100%;
      box-sizing:border-box;
      padding:11px;
      margin:7px 0;
      border-radius:9px;
      border:1px solid #888;
      font-size:15px;
    }

    #sdProfileCard button {
      padding:10px 14px;
      margin:6px;
      border:0;
      border-radius:9px;
      font-weight:bold;
    }

    #sdProfileAvatar {
      width:105px;
      height:105px;
      border-radius:50%;
      object-fit:cover;
      border:3px solid #a77bea;
      background:#444;
    }

    #sdProfileMsg {
      min-height:22px;
      font-size:13px;
      color:#80e8a6;
      overflow-wrap:anywhere;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(screen);

  const progress = document.getElementById('sdLoadProgress');
  const percent = document.getElementById('sdLoadPercent');
  const start = performance.now();

  function update(now) {
    const value = Math.min(((now - start) / 5000) * 100, 100);

    progress.style.width = value + '%';
    percent.textContent = Math.floor(value) + '%';

    if (value < 100) {
      requestAnimationFrame(update);
    } else {
      screen.remove();
    }
  }

  requestAnimationFrame(update);

  // =========================
  // 2. أدوات Firebase
  // =========================

  function getAuth() {
    if (!window.firebase || !firebase.apps.length) {
      throw new Error('Firebase غير جاهز');
    }
    return firebase.auth();
  }

  function getDatabase() {
    if (!window.firebase || !firebase.apps.length) {
      throw new Error('Firebase غير جاهز');
    }
    return firebase.database();
  }

  function currentUser() {
    return getAuth().currentUser;
  }

  // =========================
  // 3. واجهة الملف الشخصي
  // =========================

  const box = document.createElement('div');
  box.id = 'sdProfileBox';

  box.innerHTML = `
    <div id="sdProfileCard">
      <h2>👤 الملف الشخصي</h2>

      <img id="sdProfileAvatar"
        src="https://placehold.co/150x150/333333/ffffff?text=Player"
        alt="Avatar">

      <div>
        <button id="sdProfileChoose">📷 اختيار صورة</button>
        <input id="sdProfileFile"
          type="file"
          accept="image/*"
          style="display:none">
      </div>

      <input id="sdProfileName"
        maxlength="30"
        placeholder="الاسم الحقيقي">

      <input id="sdProfileNickname"
        maxlength="20"
        placeholder="اسم اللاعب">

      <select id="sdProfileGender">
        <option value="">اختر الجنس</option>
        <option value="ذكر">ذكر</option>
        <option value="أنثى">أنثى</option>
      </select>

      <p id="sdProfileEmail"
        style="font-size:12px;color:#bbb;overflow-wrap:anywhere"></p>

      <p id="sdProfileMsg"></p>

      <button id="sdProfileSave"
        style="background:#259d58;color:white">
        💾 حفظ الملف
      </button>

      <button id="sdProfileClose"
        style="background:#555;color:white">
        إغلاق
      </button>
    </div>
  `;

  document.body.appendChild(box);

  const $p = id => document.getElementById(id);

  let avatarData = '';

  // =========================
  // 4. ضغط الصورة
  // =========================

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('اختر صورة صحيحة'));
        return;
      }

      const reader = new FileReader();

      reader.onerror = () => reject(new Error('تعذرت قراءة الصورة'));

      reader.onload = () => {
        const img = new Image();

        img.onerror = () => reject(new Error('تعذر فتح الصورة'));

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 256;

          let width = img.width;
          let height = img.height;

          const scale = Math.min(1, maxSize / Math.max(width, height));

          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const result = canvas.toDataURL('image/jpeg', 0.65);

          if (result.length > 180000) {
            reject(new Error('الصورة كبيرة، اختر صورة أصغر'));
            return;
          }

          resolve(result);
        };

        img.src = reader.result;
      };

      reader.readAsDataURL(file);
    });
  }

  $p('sdProfileChoose').onclick = () => {
    $p('sdProfileFile').click();
  };

  $p('sdProfileFile').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;

    $p('sdProfileMsg').textContent = 'جارٍ تجهيز الصورة...';

    try {
      avatarData = await compressImage(file);
      $p('sdProfileAvatar').src = avatarData;
      $p('sdProfileMsg').textContent = '✔ الصورة جاهزة للحفظ';
    } catch (e) {
      $p('sdProfileMsg').textContent = e.message;
    }

    event.target.value = '';
  };

  // =========================
  // 5. فتح الملف وتحميله
  // =========================

  async function openProfile() {
    try {
      const auth = getAuth();
      let u = auth.currentUser;

      if (!u) {
        if (typeof window.login === 'function') {
          window.login();
        } else {
          await auth.signInWithPopup(
            new firebase.auth.GoogleAuthProvider()
          );
        }
        return;
      }

      box.style.display = 'flex';
      $p('sdProfileMsg').textContent = 'جارٍ تحميل الملف...';

      $p('sdProfileEmail').textContent =
        'البريد الخاص بك: ' + (u.email || 'غير متوفر');

      const snap = await getDatabase()
        .ref('publicProfiles/' + u.uid)
        .once('value');

      const data = snap.val() || {};

      $p('sdProfileName').value = data.name || '';
      $p('sdProfileNickname').value = data.nickname || '';
      $p('sdProfileGender').value = data.gender || '';

      avatarData = data.avatar || '';

      if (avatarData) {
        $p('sdProfileAvatar').src = avatarData;
      }

      $p('sdProfileMsg').textContent = '';

    } catch (e) {
      $p('sdProfileMsg').textContent = 'خطأ: ' + e.message;
    }
  }

  // =========================
  // 6. حفظ الملف الشخصي
  // =========================

  $p('sdProfileSave').onclick = async () => {
    const button = $p('sdProfileSave');

    try {
      const u = currentUser();

      if (!u) throw new Error('سجّل الدخول بحساب Google أولاً');

      const name = $p('sdProfileName').value.trim();
      const nickname = $p('sdProfileNickname').value.trim();
      const gender = $p('sdProfileGender').value;

      if (!name || !nickname || !gender) {
        throw new Error('أكمل الاسم واللقب والجنس');
      }

      if (name.length > 30 || nickname.length > 20) {
        throw new Error('الاسم أو اللقب طويل جدًا');
      }

      button.disabled = true;
      $p('sdProfileMsg').textContent = 'جارٍ الحفظ...';

      const database = getDatabase();

      await database.ref('publicProfiles/' + u.uid).update({
        name: name,
        nickname: nickname,
        gender: gender,
        avatar: avatarData || '',
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });

      $p('sdProfileMsg').textContent = '✔ تم حفظ الملف الشخصي';

    } catch (e) {
      $p('sdProfileMsg').textContent = 'فشل الحفظ: ' + e.message;
    } finally {
      button.disabled = false;
    }
  };

  $p('sdProfileClose').onclick = () => {
    box.style.display = 'none';
  };

  // =========================
  // 7. زر القائمة الرئيسية
  // =========================

  window.sdOpenProfile = openProfile;

})();
