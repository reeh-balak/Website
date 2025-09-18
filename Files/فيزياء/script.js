// === حماية الموقع من أدوات المطور ===
document.addEventListener('keydown', function(e) {
  if(e.keyCode === 123) e.preventDefault(); // F12
  if(e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) e.preventDefault();
  if(e.ctrlKey && e.key.toUpperCase() === "U") e.preventDefault();
});
document.addEventListener('contextmenu', function(e){ e.preventDefault(); });

// === إعدادات ملفات المستعرض ===
const baseAPI = "https://api.github.com/repos/reeh-balak/Website/contents/Files";
const basePageURL = "https://reeh-balak.github.io/Website/Files";
let currentPath = [];
const token = "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";
const headers = { Authorization: `token ${token}` };

const filesList = document.getElementById("filesList");
const backBtn = document.querySelector(".back-btn");
const overlay = document.getElementById("overlay");
const preview = document.getElementById("preview");
const closeOverlay = document.getElementById("closeOverlay");

// === تحميل الملفات ===
async function loadFiles(pathArray){
  const path = pathArray.join('/');
  const url = path ? `${baseAPI}/${path}` : baseAPI;
  const data = await (await fetch(url, {headers})).json();
  
  filesList.innerHTML = "";
  backBtn.style.display = pathArray.length>0 ? "inline-block" : "none";

  if(data.length===0){
    const empty = document.createElement("div");
    empty.textContent="No files found";
    empty.style.textAlign="center";
    empty.style.padding="1rem";
    filesList.appendChild(empty);
    return;
  }

  data.forEach(item=>{
    const div = document.createElement("div");
    div.className="file-item";

    const nameDiv = document.createElement("div");
    nameDiv.className="file-name " + (item.type==="dir"?"dir-icon":"file-icon");
    nameDiv.textContent = item.name;

    const sizeDiv = document.createElement("div");
    sizeDiv.className="file-size";
    sizeDiv.textContent = item.size ? formatSize(item.size) : "";

    div.appendChild(nameDiv);
    div.appendChild(sizeDiv);

    div.onclick = ()=>{
      if(item.type==="dir"){
        currentPath.push(item.name);
        loadFiles(currentPath);
      } else {
        openPreview(item.name);
      }
    };

    filesList.appendChild(div);
  });
}

// === معاينة الملفات ===
function openPreview(fileName){
  overlay.classList.add("active");
  preview.innerHTML = "";

  let url = basePageURL;
  if(currentPath.length>0) url+="/"+currentPath.join('/');
  url+="/"+fileName;

  const ext = fileName.split('.').pop().toLowerCase();
  let element;

  if(["mp4","webm","ogg"].includes(ext)){
    element = document.createElement("video");
    element.src = url;
    element.setAttribute("playsinline","");
    element.setAttribute("controls","");
    element.setAttribute("autoplay","");
    element.setAttribute("data-plyr-config", '{"autoplay":true}');
  } else if(["mp3","wav","ogg"].includes(ext)){
    element = document.createElement("audio");
    element.src = url;
    element.setAttribute("controls","");
  } else if(["jpg","jpeg","png","gif","webp","svg"].includes(ext)){
    element = document.createElement("img");
    element.src = url;
    element.style.objectFit = "contain";
  } else {
    element = document.createElement("iframe");
    element.src = url;
  }

  element.style.width = "100%";
  element.style.height = "100%";
  element.style.borderRadius = "10px";
  preview.appendChild(element);

  if(element.tagName==="VIDEO" || element.tagName==="AUDIO"){
    new Plyr(element, { autoplay: true });
  }
}

// === إغلاق المعاينة ===
closeOverlay.onclick = ()=>{
  overlay.classList.remove("active");
  preview.innerHTML = "";
}

// === العودة للخلف ===
backBtn.onclick = ()=>{
  currentPath.pop();
  loadFiles(currentPath);
}

// === تحويل حجم الملفات إلى صيغة قابلة للقراءة ===
function formatSize(bytes){
  if(bytes>=1e9) return (bytes/1e9).toFixed(1)+" GB";
  if(bytes>=1e6) return (bytes/1e6).toFixed(1)+" MB";
  if(bytes>=1e3) return (bytes/1e3).toFixed(1)+" kB";
  return bytes+" B";
}

// === تحميل الملفات عند البداية ===
loadFiles(currentPath);