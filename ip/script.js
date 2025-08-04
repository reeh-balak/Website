async function fetchIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error('خطأ في جلب عنوان IP');
    const data = await response.json();
    document.getElementById('ipAddress').textContent = data.ip;
  } catch (error) {
    document.getElementById('ipAddress').textContent = 'لا يمكن الحصول على عنوان IP';
  }
}

fetchIP();

document.getElementById('copyBtn').addEventListener('click', () => {
  const ipText = document.getElementById('ipAddress').textContent;
  if (ipText && ipText !== 'جاري التحميل...' && ipText !== 'لا يمكن الحصول على عنوان IP') {
    navigator.clipboard.writeText(ipText).then(() => {
      const notification = document.getElementById('notification');
      notification.classList.add('show');
      setTimeout(() => notification.classList.remove('show'), 1500);
    });
  }
});
