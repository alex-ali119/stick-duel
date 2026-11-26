
(() => {
  'use strict';

  if (window.__sdRemoteFeaturesLoaded) return;
  window.__sdRemoteFeaturesLoaded = true;

  /* =================================
     1. شاشة التحميل - 5 ثوانٍ
  ================================= */

  if (!document.getElementById('sdRemoteLoading')) {
    const screen = document.createElement('div');
    screen.id = 'sdRemoteLoading';

    screen.innerHTML = `
      <img
        id="sdLoadingImage"
        src="https://alex-ali119.github.io/stick-duel/remote-updates/stickman-battle-logo.png"
        alt="Loading"
      >

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
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        height: 100dvh;
        z-index: 2147483647;
        background: #160d24;
        overflow: hidden;
      }

      #sdLoadingImage {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .sd-load-area {
        position: absolute;
        left: 15%;
        right: 15%;
        bottom: 8%;
        z-index: 2;
        text-align: center;
      }

      .sd-load-track {
        height: 14px;
        background: #ffffff66;
        border: 2px solid white;
        border-radius: 20px;
        overflow: hidden;
      }

      #sdLoadProgress {
        width: 0%;
        height: 100%;
        background: #00eaff;
        border-radius: 20px;
      }

      #sdLoadPercent {
        color: white;
        font-size: 20px;
        font-weight: bold;
        margin-top: 8px;
      }

      @media (orientation: portrait) {
        #sdRemoteLoading {
          width: 100vh;
          height: 100vw;
          width: 100dvh;
          height: 100vw;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          transform: translate(-50%, -50%) rotate(90deg);
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(screen);

    const progress = document.getElementById('sdLoadProgress');
    const percent = document.getElementById('sdLoadPercent');
    const start = performance.now();

    function update(now) {
      const value = Math.min(
        ((now - start) / 5000) * 100,
        100
      );

      progress.style.width = value + '%';
      percent.textContent = Math.floor(value) + '%';

      if (value < 100) {
        requestAnimationFrame(update);
      } else {
        screen.remove();
        style.remove();
      }
    }

    requestAnimationFrame(update);
  }

  /* =================================
     2. إعداد الملف الشخصي
  ================================= */

  const PROFILE_KEY = 'sdProfile';

  function getProfile() {
    try {
      return JSON.parse(
        localStorage.getItem(PROFILE_KEY) || '{}'
      );
    } catch (e) {
      return {};
    }
  }

  function saveProfile(data) {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(data)
      );
      return true;
    } catch (e) {
      alert('مساحة التخزين غير كافية. جرّب صورة أصغر.');
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]);
  }

  function getEmail() {
    try {
      if (window.firebase && firebase.auth) {
        return firebase.auth().currentUser?.email || 'غير متصل';
      }
    } catch (e) {}

    return 'غير متصل';
  }

  /* =================================
     3. تصميم الملف الشخصي
  ================================= */

  const profileStyle = document.createElement('style');

  profileStyle.textContent = `
    #sdProfileButton {
      border: 2px solid #ffd34e;
      border-radius: 12px;
      background: #292044;
      color: white;
      padding: 5px 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      margin-right: 5px;
      max-width: 125px;
      vertical-align: middle;
    }

    #sdProfileButton img {
      width: 27px;
      height: 27px;
      border-radius: 50%;
      object-fit: cover;
    }

    #sdProfileModal {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: #000c;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 15px;
      box-sizing: border-box;
    }

    #sdProfileModal .sd-profile-box {
      width: 100%;
      max-width: 390px;
      max-height: 90vh;
      overflow-y: auto;
      background: #211936;
      color: white;
      border: 2px solid #a77aff;
      border-radius: 18px;
      padding: 18px;
      box-sizing: border-box;
      text-align: center;
      font-family: Arial, sans-serif;
    }

    #sdProfileModal h2 {
      margin: 0 0 15px;
      color: #ffd34e;
    }

    #sdProfileModal .sd-avatar {
      width: 95px;
      height: 95px;
      border-radius: 50%;
      object-fit: cover;
      background: #493b62;
      border: 3px solid #ffd34e;
      display: block;
      margin: 0 auto 10px;
    }

    #sdProfileModal label {
      display: block;
      text-align: right;
      margin: 12px 0 5px;
      font-weight: bold;
      font-size: 13px;
    }

    #sdProfileModal input,
    #sdProfileModal select {
      width: 100%;
      box-sizing: border-box;
      padding: 11px;
      border: 1px solid #8e79b2;
      border-radius: 9px;
      background: #35294c;
      color: white;
      font-size: 15px;
      outline: none;
    }

    #sdProfileModal .sd-email {
      direction: ltr;
      text-align: left;
      color: #c9b9e8;
      overflow-wrap: anywhere;
      font-size: 13px;
      padding: 9px;
      background: #35294c;
      border-radius: 8px;
    }

    #sdProfileModal .sd-pbtn {
      width: 100%;
      padding: 12px;
      border: 0;
      border-radius: 10px;
      margin-top: 10px;
      font-weight: bold;
      font-size: 15px;
      cursor: pointer;
    }

    #sdProfileSave {
      background: #21a66b;
      color: white;
    }

    #sdProfileClose {
      background: #594b70;
      color: white;
    }

    #sdChooseAvatar {
      background: #7147b5;
      color: white;
    }
  `;

  document.head.appendChild(profileStyle);

  /* =================================
     4. نافذة الملف الشخصي
  ================================= */

  const modal = document.createElement('div');
  modal.id = 'sdProfileModal';

  modal.innerHTML = `
    <div class="sd-profile-box">
      <h2>👤 الملف الشخصي</h2>

      <img
        id="sdProfilePreview"
        class="sd-avatar"
        src=""
        alt="الصورة الشخصية"
      >

      <input
        id="sdAvatarInput"
        type="file"
        accept="image/*"
        hidden
      >

      <button
        id="sdChooseAvatar"
        class="sd-pbtn"
        type="button"
      >📷 اختر صورة من المعرض</button>

      <label for="sdRealName">الاسم الحقيقي</label>
      <input
        id="sdRealName"
        type="text"
        maxlength="40"
        placeholder="اكتب اسمك"
      >

      <label for="sdNickname">اسم اللاعب</label>
      <input
        id="sdNickname"
        type="text"
        maxlength="20"
        placeholder="اسمك داخل اللعبة"
      >

      <label for="sdGender">الجنس</label>
      <select id="sdGender">
        <option value="">اختر</option>
        <option value="ذكر">ذكر</option>
        <option value="أنثى">أنثى</option>
      </select>

      <label>بريد Gmail الخاص بك</label>
      <div id="sdProfileEmail" class="sd-email"></div>

      <button
        id="sdProfileSave"
        class="sd-pbtn"
        type="button"
      >💾 حفظ التغييرات</button>

      <button
        id="sdProfileClose"
        class="sd-pbtn"
        type="button"
      >إغلاق</button>
    </div>
  `;

  document.body.appendChild(modal);

  const $ = id => document.getElementById(id);

  let selectedAvatar = '';

  function openProfile() {
    const p = getProfile();

    $('sdRealName').value = p.name || '';
    $('sdNickname').value = p.nick || '';
    $('sdGender').value = p.gender || '';

    selectedAvatar = p.avatar || '';

    $('sdProfilePreview').src =
      selectedAvatar ||
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#493b62"/><text x="50%" y="58%" text-anchor="middle" font-size="48">👤</text></svg>'
      );

    $('sdProfileEmail').textContent = getEmail();

    modal.style.display = 'flex';
  }

  function closeProfile() {
    modal.style.display = 'none';
  }

  $('sdProfileButton');

  $('sdChooseAvatar').addEventListener('click', () => {
    $('sdAvatarInput').click();
  });

  $('sdAvatarInput').addEventListener('change', event => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('اختر ملف صورة صالحًا.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 256;

        let width = image.width;
        let height = image.height;

        if (width > height && width > max) {
          height = Math.round(height * max / width);
          width = max;
        } else if (height > max) {
          width = Math.round(width * max / height);
          height = max;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        selectedAvatar = canvas.toDataURL('image/jpeg', 0.72);
        $('sdProfilePreview').src = selectedAvatar;
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

  $('sdProfileSave').addEventListener('click', () => {
    const p = {
      name: $('sdRealName').value.trim(),
      nick: $('sdNickname').value.trim(),
      gender: $('sdGender').value,
      avatar: selectedAvatar
    };

    if (!p.nick) {
      alert('اكتب اسم اللاعب أولاً.');
      return;
    }

    if (saveProfile(p)) {
      closeProfile();
      updateProfileButton();
      alert('تم حفظ الملف الشخصي بنجاح ✔');
    }
  });

  $('sdProfileClose').addEventListener('click', closeProfile);

  modal.addEventListener('click', event => {
    if (event.target === modal) closeProfile();
  });

  /* =================================
     5. زر الملف الشخصي بالقائمة الرئيسية
  ================================= */

  function updateProfileButton() {
    const button = $('sdProfileButton');
    if (!button) return;

    const p = getProfile();

    button.innerHTML = '';

    if (p.avatar) {
      const img = document.createElement('img');
      img.src = p.avatar;
      img.alt = '';
      button.appendChild(img);
    } else {
      const icon = document.createElement('span');
      icon.textContent = '👤';
      button.appendChild(icon);
    }

    const name = document.createElement('span');
    name.textContent = p.nick || 'ملفي الشخصي';
    button.appendChild(name);
  }

  function addProfileButton() {
    const menu = document.getElementById('m');

    if (!menu) return;

    const home = menu.querySelector('.hs');

    if (
      !home ||
      menu.style.display === 'none'
    ) {
      const old = $('sdProfileButton');
      if (old) old.remove();
      return;
    }

    const top = home.querySelector('.tp');

    if (!top) return;

    const rightSide = top.querySelector('span');

    if (!rightSide) return;

    let button = $('sdProfileButton');

    if (!button) {
      button = document.createElement('button');
      button.id = 'sdProfileButton';
      button.type = 'button';

      button.addEventListener('click', openProfile);

      rightSide.insertBefore(button, rightSide.firstChild);
    }

    updateProfileButton();
  }

  function startProfileObserver() {
    addProfileButton();

    const observer = new MutationObserver(() => {
      addProfileButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  startProfileObserver();

})();
