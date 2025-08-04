const encodedDataURL = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2FobWFkMTIxMmFzL1JlZWgtQmFsYWsvbWFpbi9pbmZvcm1hdGlvbi9Mb2dpbiUyMGluZm9ybWF0aW9uLmpzb24=";
const encodedInstagram = "aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNvbS9haG1hZF9hbGd3YXJ5Lw==";

function decodeBase64(str) {
  try {
    return decodeURIComponent(atob(str).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch {
    return atob(str);
  }
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// إعادة التوجيه السريع والفوري للمستخدمين غير المحمولين
if (!isMobile()) {
  window.location.replace("https://reeh-balak.github.io/Website/Download-the-app/");
}

const dataURL = decodeBase64(encodedDataURL);
const instagramLink = decodeBase64(encodedInstagram);
document.getElementById('createAccountLink').href = instagramLink;

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function(event) {
  if (
    event.key === 'F12' ||
    (event.ctrlKey && (event.key === 'u' || event.key === 'U')) ||
    (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i')) ||
    (event.ctrlKey && event.shiftKey && (event.key === 'J' || event.key === 'j'))
  ) {
    event.preventDefault();
  }
});

const loginBtn = document.getElementById('loginBtn');
const spinner = document.getElementById('spinner');
const notification = document.getElementById('notification');
let notificationTimeout;

function showNotification(key, duration = 4000) {
  clearTimeout(notificationTimeout);
  const messages = {
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

  notification.textContent = messages[key] || "";
  notification.className = "";
  notification.classList.add(types[key] || "success", "show");

  notificationTimeout = setTimeout(() => {
    notification.classList.remove("show");
  }, duration);
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

loginBtn.addEventListener('click', () => {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (!user || !pass) {
    showNotification('fill');
    return;
  }

  spinner.style.display = "block";
  fetch(dataURL)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = "none";
      const userFound = data.find(item => item.username === user && item.password === pass);
      if (userFound) {
        showNotification("successLogin", 5000);
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('forgotBox').style.display = 'none';
        const appContainer = document.getElementById('appContainer');
        appContainer.style.display = 'block';

        const encodedLink = btoa(userFound.lnk);
        const decodedLink = decodeBase64(encodedLink);
        appContainer.innerHTML = `<iframe src="${userFound.lnk}" allowfullscreen></iframe>`;
      } else {
        showNotification("failLogin", 5000);
      }
    })
    .catch(() => {
      spinner.style.display = "none";
      showNotification("serverError", 5000);
    });
});

function recoverAccount() {
  const code = document.getElementById('code').value.trim();

  if (!code) {
    showNotification('fillRecover');
    return;
  }

  spinner.style.display = 'block';

  fetch(dataURL)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      const filtered = data.filter(item => item.securityCode === code);

      if (filtered.length) {
        let outputHTML = '';
        filtered.forEach(acc => {
          outputHTML += `
            <div class="recovered-item"><span class="recovered-label">Username:</span> ${acc.username}</div>
            <div class="recovered-item"><span class="recovered-label">Password:</span> ${acc.password}</div>
          `;
        });

        document.getElementById('forgotForm').style.display = 'none';
        document.getElementById('recoveryTitle').style.display = 'none';
        document.getElementById('recoveredData').innerHTML = outputHTML;
        document.getElementById('recoveredSection').style.display = 'block';

        showNotification('successRecover');
      } else {
        showNotification('failRecover');
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showNotification('serverError');
    });
}
