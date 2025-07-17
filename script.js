const encodedDataURL = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2FobWFkMTIxMmFzL1JlZWgtQmFsYWsvbWFpbi9pbmZvcm1hdGlvbi9Mb2dpbiUyMGluZm9ybWF0aW9uLmpzb24=";
const encodedInstagram = "aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNvbS9haG1hZF9hbGd3YXJ5Lw==";
function decodeBase64(str) {
  try {
    return decodeURIComponent(atob(str).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16))).join(''));
  } catch { return atob(str); }
}
const dataURL = decodeBase64(encodedDataURL);
const instagramLink = decodeBase64(encodedInstagram);
document.getElementById('createAccountLink').href = instagramLink;

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
if (!isMobile()) {
  document.body.innerHTML = '<h2 style="text-align:center;margin-top:50px;color:red;">هذا الموقع مخصص للأجهزة المحمولة فقط.</h2>';
}

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', evt => {
  if (evt.key === 'F12' || (evt.ctrlKey && (evt.key==='u'||evt.key==='U'||evt.shiftKey && (evt.key==='I'||evt.key==='i'||evt.key==='J'||evt.key==='j')))) {
    evt.preventDefault();
  }
});

const notification = document.getElementById('notification');
let notificationTimeout;
function showNotification(key, duration=4000) {
  clearTimeout(notificationTimeout);
  const msgs = {
    fill: "Fill all fields",
    successLogin: "Success",
    failLogin: "Invalid data",
    fillRecover: "Fill the code",
    successRecover: "Recovered",
    failRecover: "Invalid code",
    serverError: "Server error"
  };
  const types = {
    fill: "error",
    successLogin: "success",
    failLogin: "error",
    fillRecover: "error",
    successRecover: "success",
    failRecover: "error",
    serverError: "error"
  };
  notification.textContent = msgs[key] || "";
  notification.className = "";
  notification.classList.add(types[key]||"success", "show");
  notificationTimeout = setTimeout(() => notification.classList.remove("show"), duration);
}

function toggleForgot(show) {
  document.getElementById('loginBox').style.display = show ? 'none' : 'block';
  document.getElementById('forgotBox').style.display = show ? 'block' : 'none';
  if (!show) {
    document.getElementById('code').value = '';
    document.getElementById('recoveredData').innerHTML = '';
    document.getElementById('recoveredSection').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'block';
    document.getElementById('recoveryTitle').style.display = 'block';
  }
}

document.getElementById('loginBtn').addEventListener('click', () => {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  if (!user || !pass) return showNotification('fill');
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'block';
  fetch(dataURL)
    .then(r => r.json())
    .then(data => {
      spinner.style.display = 'none';
      const found = data.find(u => u.username === user && u.password === pass);
      if (found) {
        showNotification('successLogin', 5000);
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('forgotBox').style.display = 'none';
        const app = document.getElementById('appContainer');
        app.style.display = 'block';
        app.innerHTML = `<iframe src="${found.lnk}" allowfullscreen></iframe>`;
      } else {
        showNotification('failLogin', 5000);
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showNotification('serverError', 5000);
    });
});

document.getElementById('recoverBtn').addEventListener('click', () => {
  const code = document.getElementById('code').value.trim();
  if (!code) return showNotification('fillRecover');
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'block';
  fetch(dataURL)
    .then(r => r.json())
    .then(data => {
      spinner.style.display = 'none';
      const matches = data.filter(u => u.securityCode === code);
      if (matches.length) {
        let html = '';
        matches.forEach(acc => {
          html += `
            <div class="recovered-item"><span class="recovered-label">Username:</span> ${acc.username}</div>
            <div class="recovered-item"><span class="recovered-label">Password:</span> ${acc.password}</div>`;
        });
        document.getElementById('recoveredData').innerHTML = html;
        document.getElementById('recoveredSection').style.display = 'block';
        document.getElementById('forgotForm').style.display = 'none';
        document.getElementById('recoveryTitle').style.display = 'none';
        showNotification('successRecover');
      } else {
        showNotification('failRecover');
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showNotification('serverError', 5000);
    });
});
