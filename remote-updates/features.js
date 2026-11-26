(() => {
'use strict';

if (document.getElementById('sdRemoteLoading')) return;

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
})();

(() => {
  'use strict';

  if (window.sdProfileRemoteLoaded) return;
  window.sdProfileRemoteLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #sdProfileBtn {
      position:fixed; top:12px; right:12px; z-index:99999;
      background:#7546b8; color:white; border:0;
      border-radius:12px; padding:11px 16px; font-weight:bold;
    }
    #sdProfileBox {
      position:fixed; inset:0; z-index:100000;
      background:#000b; display:none; align-items:center;
      justify-content:center; padding:15px;
    }
    #sdProfileCard {
      background:#21152f; color:white; width:100%;
      max-width:380px; max-height:90vh; overflow:auto;
      border-radius:18px; padding:20px; text-align:center;
    }
    #sdProfileCard input,#sdProfileCard select {
      width:100%; box-sizing:border-box; padding:12px;
      margin:7px 0; border-radius:9px; border:0;
    }
    #sdProfileCard button {
      padding:11px; margin:5px; border:0;
      border-radius:9px; font-weight:bold;
    }
    #sdProfileAvatar {
      width:95px; height:95px; border-radius:50%;
      object-fit:cover; background:#555;
      border:3px solid #b58aff;
    }
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.id = 'sdProfileBox';
  box.innerHTML = `
    <div id="sdProfileCard">
      <h2>👤 الملف الشخصي</h2>
      <img id="sdProfileAvatar" alt="الصورة الشخصية">
      <input id="sdProfilePhoto" type="file" accept="image/*">
      <input id="sdProfileName" maxlength="30" placeholder="الاسم الحقيقي">
      <input id="sdProfileNick" maxlength="20" placeholder="اسم اللاعب">
      <select id="sdProfileGender">
        <option value="">اختر الجنس</option>
        <option value="ذكر">ذكر</option>
        <option value="أنثى">أنثى</option>
      </select>
      <p id="sdProfileEmail"></p>
      <button id="sdProfileSave" style="background:#27a66b;color:white">💾 حفظ</button>
      <button id="sdProfileClose" style="background:#777;color:white">إغلاق</button>
      <p id="sdProfileMsg"></p>
    </div>
  `;
  document.body.appendChild(box);

  const $p = id => document.getElementById(id);
  let avatarData = '';

  function currentUser() {
    return window.firebase?.auth?.().currentUser || null;
  }

  function openProfile() {
    const u = currentUser();

    if (!u) {
      alert('سجّل الدخول بحساب Google أولاً.');
      if (typeof window.login === 'function') window.login();
      return;
    }

    box.style.display = 'flex';
    $p('sdProfileEmail').textContent = 'Gmail: ' + (u.email || 'غير متوفر');
    $p('sdProfileMsg').textContent = 'جاري تحميل البيانات...';

    window.firebase.database()
      .ref('users/' + u.uid + '/profile')
      .once('value')
      .then(snap => {
        const d = snap.val() || {};
        $p('sdProfileName').value = d.name || '';
        $p('sdProfileNick').value = d.nickname || '';
        $p('sdProfileGender').value = d.gender || '';
        avatarData = d.avatar || '';
        $p('sdProfileAvatar').src = avatarData || '';
        $p('sdProfileMsg').textContent = '';
      })
      .catch(e => {
        $p('sdProfileMsg').textContent = 'تعذر تحميل البيانات: ' + e.message;
      });
  }

  $p('sdProfilePhoto').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 250;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        avatarData = canvas.toDataURL('image/jpeg', 0.75);
        $p('sdProfileAvatar').src = avatarData;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  $p('sdProfileSave').onclick = async () => {
    const u = currentUser();
    if (!u) return;

    const name = $p('sdProfileName').value.trim();
    const nickname = $p('sdProfileNick').value.trim();
    const gender = $p('sdProfileGender').value;

    if (!name || !nickname || !gender) {
      $p('sdProfileMsg').textContent = 'أكمل جميع المعلومات أولاً.';
      return;
    }

    $p('sdProfileMsg').textContent = 'جاري الحفظ...';
    $p('sdProfileSave').disabled = true;

    try {
      await window.firebase.database()
        .ref('users/' + u.uid + '/profile')
        .set({
          name,
          nickname,
          gender,
          avatar: avatarData,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

      $p('sdProfileMsg').textContent = '✔ تم حفظ الملف الشخصي';
    } catch (e) {
      $p('sdProfileMsg').textContent = 'فشل الحفظ: ' + e.message;
    } finally {
      $p('sdProfileSave').disabled = false;
    }
  };

  $p('sdProfileClose').onclick = () => {
    box.style.display = 'none';
  };

  const originalShow = window.show;

  if (typeof originalShow === 'function') {
    window.show = function(sc) {
      originalShow.apply(this, arguments);

      const oldBtn = document.getElementById('sdProfileBtn');

      if (sc === 'home') {
        if (!oldBtn) {
          const btn = document.createElement('button');
          btn.id = 'sdProfileBtn';
          btn.textContent = '👤 الملف الشخصي';
          btn.onclick = openProfile;
          document.body.appendChild(btn);
        }
      } else if (oldBtn) {
        oldBtn.remove();
      }
    };
  }
})();
