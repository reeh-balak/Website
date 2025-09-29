(function(){
  // استبدل هذه القيمة المشفّرة محلياً فقط (لا ترفعها للمستودع العام)
  const _e = "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";

  const _api = "https://api.github.com/repos/reeh-balak/Website/contents/Files";
  const _page = "https://reeh-balak.github.io/Website/Files";
  let _cp = [];
  let _token = (typeof atob === "function" ? atob(_e) : "");
  const _hdr = { Authorization: `token ${_token}` };

  const _$ = id => document.getElementById(id);
  const _q = s => document.querySelector(s);
  const filesList = _$("filesList");
  const backBtn = _q(".back-btn");
  const overlay = _$("overlay");
  const preview = _$("preview");
  const closeOverlay = _$("closeOverlay");
  const pathBar = _$("pathBar");

  function fmtSize(b){
    if(!b && b!==0) return "";
    if(b>=1e9) return (b/1e9).toFixed(1)+" GB";
    if(b>=1e6) return (b/1e6).toFixed(1)+" MB";
    if(b>=1e3) return (b/1e3).toFixed(1)+" kB";
    return b+" B";
  }

  function updPathBar(arr){
    pathBar.innerHTML = "";
    const root = document.createElement("span");
    root.textContent = "Files";
    root.onclick = ()=>{ _cp = []; loadFiles(_cp); };
    pathBar.appendChild(root);

    arr.forEach((f,i)=>{
      const s = document.createElement("span");
      s.className = "sep";
      s.textContent = "/";
      pathBar.appendChild(s);
      const p = document.createElement("span");
      p.textContent = f;
      p.onclick = ()=>{ _cp = arr.slice(0,i+1); loadFiles(_cp); };
      pathBar.appendChild(p);
    });

    const urlPath = arr.length>0 ? "/Files/"+arr.join("/") : "/Files";
    try { history.replaceState(null,"",urlPath); } catch(e){}
  }

  async function loadFiles(pathArr){
    const path = pathArr.join("/");
    const url = path ? `${_api}/${path}` : _api;
    filesList.innerHTML = "";
    backBtn.style.display = pathArr.length>0 ? "inline-block" : "none";
    updPathBar(pathArr);

    let data;
    try{
      const res = await fetch(url, { headers: _hdr });
      if(!res.ok){
        const errtxt = document.createElement("div");
        errtxt.textContent = `Error: ${res.status} ${res.statusText}`;
        errtxt.style.textAlign="center";
        errtxt.style.padding="1rem";
        filesList.appendChild(errtxt);
        return;
      }
      data = await res.json();
    }catch(err){
      const errtxt = document.createElement("div");
      errtxt.textContent = "Network error";
      errtxt.style.textAlign="center";
      errtxt.style.padding="1rem";
      filesList.appendChild(errtxt);
      return;
    }

    if(!Array.isArray(data) || data.length===0){
      const empty = document.createElement("div");
      empty.textContent="No files found";
      empty.style.textAlign="center";
      empty.style.padding="1rem";
      filesList.appendChild(empty);
      return;
    }

    data.forEach(item=>{
      const row = document.createElement("div");
      row.className = "file-item";
      const nm = document.createElement("div");
      nm.className = "file-name " + (item.type==="dir" ? "dir-icon" : "file-icon");
      nm.textContent = item.name;
      const sz = document.createElement("div");
      sz.className = "file-size";
      sz.textContent = item.size ? fmtSize(item.size) : "";
      row.appendChild(nm);
      row.appendChild(sz);

      let busy=false;
      row.onclick = (()=> {
        return ()=> {
          if(busy) return;
          busy=true;
          if(item.type==="dir"){
            _cp.push(item.name);
            loadFiles(_cp).finally(()=>{ busy=false; });
          } else {
            openPreview(item.name);
            busy=false;
          }
        };
      })();

      filesList.appendChild(row);
    });
  }

  function getPathFromURL(){
    const p = window.location.pathname.split("/Files/")[1];
    return p ? p.split("/").filter(Boolean) : [];
  }

  function openPreview(fileName){
    const ext = (fileName.split(".").pop()||"").toLowerCase();
    let url = _page;
    if(_cp.length>0) url += "/"+_cp.join("/");
    url += "/"+fileName;

    overlay.classList.add("active");
    preview.innerHTML = "";
    let el;
    if(["mp4","webm","ogg"].includes(ext)){
      el = document.createElement("video");
      el.src = url;
      el.setAttribute("playsinline","");
      el.setAttribute("controls","");
      el.setAttribute("autoplay","");
    } else if(["mp3","wav","ogg"].includes(ext)){
      el = document.createElement("audio");
      el.src = url;
      el.setAttribute("controls","");
    } else if(["jpg","jpeg","png","gif","webp","svg"].includes(ext)){
      el = document.createElement("img");
      el.src = url;
      el.style.objectFit = "contain";
    } else {
      el = document.createElement("iframe");
      el.src = url;
    }
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.borderRadius = "15px";
    preview.appendChild(el);

    try{
      if((el.tagName==="VIDEO" || el.tagName==="AUDIO") && typeof Plyr !== "undefined"){
        const player = new Plyr(el, {
          autoplay: true,
          controls: ['play','progress','current-time','mute','volume','fullscreen']
        });
        if(typeof player.play === "function") player.play();
      }
    }catch(e){}
  }

  closeOverlay.onclick = ()=>{ overlay.classList.remove("active"); preview.innerHTML=""; };
  backBtn.onclick = ()=>{ _cp.pop(); loadFiles(_cp); };

  _cp = getPathFromURL();
  loadFiles(_cp);

})();
