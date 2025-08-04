const IMG_BB_KEY = '0481d627cb113748d10d6a8d57be7ed0';

function getTodayDate() {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function addSubject(name = '') {
  const sub = document.createElement('div');
  sub.className = 'card';
  sub.innerHTML = `
    <div class="card-header">
      <h2>مادة</h2>
      <button onclick="removeSubject(this)">✖</button>
    </div>
    <input type="text" name="subjName" placeholder="اسم المادة" value="${name}" />
    <div class="images"></div>
    <button class="custom-upload" onclick="addImage(this)">➕ إضافة صورة</button>
  `;
  document.getElementById('subjects').appendChild(sub);
  const input = sub.querySelector('[name="subjName"]');
  input.addEventListener('input', save);
  save();
}

function removeSubject(btn) {
  btn.closest('.card').remove();
  save();
}

function addImage(btn, url = null) {
  const container = btn.previousElementSibling;
  if (container.children.length >= 10) return alert('يمكن رفع 10 صور كحد أقصى');
  const row = document.createElement('div');
  row.className = 'image-row';

  if (url) {
    row.innerHTML = `
      <img src="${url}" />
      <button class="remove-img" onclick="removeImage(this)">✖</button>
      <span class="status">✅</span>
    `;
    container.appendChild(row);
    save();
    return;
  }

  row.innerHTML = `
    <img src="" hidden />
    <label class="custom-upload">
      📁 اختر صورة
      <input type="file" accept="image/*" hidden onchange="handleUpload(this)" />
    </label>
    <button class="remove-img" onclick="removeImage(this)">✖</button>
    <span class="status"></span>
  `;
  container.appendChild(row);
  save();
}

function removeImage(btn) {
  btn.closest('.image-row').remove();
  save();
}

function handleUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const row = input.closest('.image-row');
  const img = row.querySelector('img');
  const st = row.querySelector('.status');

  imgbbUpload(file)
    .then(url => {
      img.src = url;
      img.hidden = false;
      st.textContent = '✅';
      const label = row.querySelector('label.custom-upload');
      if (label) label.remove();
      save();
    })
    .catch(() => alert('فشل رفع الصورة'));
}

function imgbbUpload(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const fd = new FormData();
      fd.append('image', fr.result.split(',')[1]);
      fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_KEY}`, {
        method: 'POST', body: fd
      }).then(r => r.json()).then(d => d.success ? res(d.data.url) : rej()).catch(rej);
    };
    fr.readAsDataURL(file);
  });
}

function generateJSON() {
  const cls = document.getElementById('className').value.trim();
  const cards = document.querySelectorAll('.card');
  const errors = [];

  if (!cls) errors.push('اسم الصف فارغ');

  const subjArr = [];

  cards.forEach((c, i) => {
    const n = c.querySelector('[name="subjName"]').value.trim();
    if (!n) errors.push(`اسم المادة رقم ${i+1} فارغ`);
    const imgs = [...c.querySelectorAll('.image-row img')].map(i => i.src).filter(Boolean);
    if (!imgs.length) errors.push(`المادة "${n}" لا تحتوي على صور`);

    const subjObj = {
      "Name of the subject": n,
      "the date": getTodayDate(),
    };

    imgs.forEach((url, idx) => {
      subjObj[`Image link ${idx + 1}`] = url;
    });

    subjArr.push(subjObj);
  });

  if (errors.length) {
    showMsg('يرجى تصحيح الأخطاء التالية:\n' + errors.join('\n'));
    return null;
  }

  return JSON.stringify([{ "class": cls }, ...subjArr], null, 2);
}

function copyData() {
  const js = generateJSON();
  if (!js) return;
  navigator.clipboard.writeText(js).then(() => {
    showMsg('✅ تم نسخ البيانات بنجاح', '#7ab77a');
  });
}

function showMsg(m, clr = '#b86b6b') {
  const msg = document.getElementById('message');
  msg.style.color = clr;
  msg.textContent = m;
  setTimeout(() => { msg.textContent = ''; }, 4000);
}

function save() {
  const cls = document.getElementById('className').value;
  const subs = [...document.querySelectorAll('.card')].map(c => ({
    name: c.querySelector('[name="subjName"]').value,
    imgs: [...c.querySelectorAll('.image-row img')].map(i => i.src).filter(Boolean)
  }));
  localStorage.setItem('rb', JSON.stringify({ cls, subs }));
}

function load() {
  const d = JSON.parse(localStorage.getItem('rb') || '{}');
  document.getElementById('className').value = d.cls || '';
  document.getElementById('subjects').innerHTML = '';
  if (d.subs && d.subs.length) {
    d.subs.forEach(s => {
      addSubject(s.name);
      const lastCard = document.querySelector('.card:last-child');
      const btn = lastCard.querySelector('button.custom-upload');
      s.imgs.forEach(url => {
        addImage(btn, url);
      });
    });
  } else {
    addSubject();
  }
}

function clearAll() {
  if (!confirm('هل أنت متأكد من حذف جميع البيانات؟')) return;
  localStorage.removeItem('rb');
  location.reload();
}

window.onload = () => {
  load();
  document.getElementById('className').addEventListener('input', save);
  document.getElementById('subjects').addEventListener('input', save);
};
