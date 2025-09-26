const baseAPI = "https://api.github.com/repos/reeh-balak/Website/contents/Files";
const basePageURL = "https://reeh-balak.github.io/Website/Files";
let currentPath = [];

// 🔐 token مشفر Base64
const encodedToken = "Z2hwX3pURHo1Tm00akh1NWdjWWxoUlZ6eHh6MU9NQzh2QTI0T2dQMA==";
const token = atob(encodedToken);
const headers = { Authorization: `token ${token}` };

const filesList = document.getElementById("filesList");
const backBtn = document.querySelector(".back-btn");
const overlay = document.getElementById("overlay");
const preview = document.getElementById("preview");
const closeOverlay = document.getElementById("closeOverlay");
const pathBar = document.getElementById("pathBar");

async function loadFiles(pathArray){
  const path = pathArray.join('/');
  const url = path ? `${baseAPI}/${path}` : baseAPI;
  const data = await (await fetch(url, {headers})).json();
  filesList.innerHTML = "";
  backBtn.style.display = pathArray.length>0 ? "inline-block" : "none";

  updatePathBar(pathArray);

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

    div.onclick = (() => {
      let isLoading = false; 
      return () => {
        if(isLoading) return;
        isLoading = true;

        if(item.type === "dir"){
          currentPath.push(item.name);
          loadFiles(currentPath).finally(() => { isLoading = false; });
        } else {
          openPreview(item.name);
          isLoading = false;
        }
      };
    })();
    filesList.appendChild(div);
  });
}

function updatePathBar(pathArray){
  pathBar.innerHTML = "";
  const rootSpan = document.createElement("span");
  rootSpan.textContent = "Files";
  rootSpan.onclick = ()=>{ currentPath=[]; loadFiles(currentPath); };
  pathBar.appendChild(rootSpan);

  pathArray.forEach((folder, index)=>{
    const sep = document.createElement("span");
    sep.className="sep";
    sep.textContent = "/";
    pathBar.appendChild(sep);

    const span = document.createElement("span");
    span.textContent = folder;
    span.onclick = ()=>{ currentPath = pathArray.slice(0,index+1); loadFiles(currentPath); };
    pathBar.appendChild(span);
  });

  const urlPath = pathArray.length > 0 ? "/Files/" + pathArray.join("/") : "/Files";
  history.replaceState(null, "", urlPath);
}

function getPathFromURL() {
  const path = window.location.pathname.split("/Files/")[1];
  return path ? path.split("/").filter(p => p) : [];
}

function openPreview(fileName){
  const ext = fileName.split('.').pop().toLowerCase();
  let url = basePageURL;
  if(currentPath.length>0) url+="/"+currentPath.join('/');
  url+="/"+fileName;

  overlay.classList.add("active");
  preview.innerHTML = "";
  let element;

  if(["mp4","webm","ogg"].includes(ext)){
    element = document.createElement("video");
    element.src = url;
    element.setAttribute("playsinline","");
    element.setAttribute("controls","");
    element.setAttribute("autoplay","");
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
  element.style.borderRadius = "15px";
  preview.appendChild(element);

  if(["VIDEO","AUDIO"].includes(element.tagName)){
    const player = new Plyr(element, { 
      autoplay: true,
      controls: ['play','progress','current-time','mute','volume','fullscreen']
    });
    player.play();
  }
}

closeOverlay.onclick = ()=>{ overlay.classList.remove("active"); preview.innerHTML=""; }
backBtn.onclick = ()=>{ currentPath.pop(); loadFiles(currentPath); }

function formatSize(bytes){
  if(bytes>=1e9) return (bytes/1e9).toFixed(1)+" GB";
  if(bytes>=1e6) return (bytes/1e6).toFixed(1)+" MB";
  if(bytes>=1e3) return (bytes/1e3).toFixed(1)+" kB";
  return bytes+" B";
}

// تحميل الملفات بناءً على الرابط عند فتح الصفحة
currentPath = getPathFromURL();
loadFiles(currentPath);
