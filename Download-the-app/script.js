function downloadFile() {
  const url = "https://dso8.raed.net:455/files/Reeh-Balak-Setup.exe";
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// منع النقر بالزر الأيمن
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// منع اختصارات أدوات المطور
document.addEventListener('keydown', function(e) {
  if (e.key === "F12") {
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
  if (e.ctrlKey && ['u', 's'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
