let allProducts = [];
let currentCategory = "All";
let pendingAction = null;
let toastTimer = null;

document.addEventListener("DOMContentLoaded", function(){
  applyConfig();
  registerServiceWorker();
  renderShell();
  initPage();
});

function registerServiceWorker(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  }
}

function applyConfig(){
  document.documentElement.style.setProperty("--theme", APP_CONFIG.themeColor);
  document.title = APP_CONFIG.brandName;
}

function apiUrl(type){
  return APP_CONFIG.scriptApi + "?type=" + encodeURIComponent(type) + "&_=" + Date.now();
}

function normalize(value){
  return String(value || "").trim();
}

function cleanPhone(value){
  return normalize(value).replace(/\D/g,"");
}

function currentUser(){
  try{
    return JSON.parse(localStorage.getItem("catalogUser")) || null;
  }
  catch(error){
    return null;
  }
}

function setCurrentUser(user){
  localStorage.setItem("catalogUser", JSON.stringify(user));
}

function getFavorites(){
  try{
    return JSON.parse(localStorage.getItem("catalogFavorites")) || [];
  }
  catch(error){
    return [];
  }
}

function setFavorites(ids){
  localStorage.setItem("catalogFavorites", JSON.stringify(ids));
}

function isShown(product){
  return normalize(product.Show || product.show).toLowerCase() === "yes";
}

function isInStock(product){
  let stock = normalize(product.Stock || product.stock).toLowerCase();
  return stock === "in stock" || stock === "yes";
}

function productId(product){
  return normalize(product["Product ID"] || product.productId || product.ProductID);
}

function productName(product){
  return normalize(product["Product Name"] || product.productName || product.Name);
}

function productCategory(product){
  return normalize(product.Category || product.category);
}

function productPrice(product){
  return normalize(product.Price || product.price || "0");
}

function productImage(product){
  return normalize(product["Image Url"] || product.imageUrl || product.Image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80");
}

function renderShell(){
  let active = document.body.dataset.page || "home";
  let header = document.getElementById("appHeader");
  let nav = document.getElementById("bottomNav");

  if(header){
    let user = currentUser();
    header.innerHTML = `
      <div class="brand-block">
        <div class="logo-dot"><i class="fa-solid fa-shirt"></i></div>
        <div>
          <div class="brand-name">${escapeHTML(APP_CONFIG.logoText || APP_CONFIG.brandName)}</div>
          <div class="subline">${user ? "Hi, " + escapeHTML(user.username) : "Premium clothing catalog"}</div>
        </div>
      </div>
      <button class="profile-btn" onclick="openLogin()"><i class="fa-solid fa-user"></i></button>
    `;
  }

  if(nav){
    nav.innerHTML = `
      <a class="nav-item ${active === "home" ? "active" : ""}" href="products.html"><i class="fa-solid fa-house"></i><span>Home</span></a>
      <a class="nav-item ${active === "favourite" ? "active" : ""}" href="favourite.html"><i class="fa-solid fa-heart"></i><span>Favourite</span></a>
      <a class="nav-item ${active === "contact" ? "active" : ""}" href="contact.html"><i class="fa-brands fa-whatsapp"></i><span>Contact</span></a>
      <a class="nav-item ${active === "grow" ? "active" : ""}" href="grow.html" id="growNav"><i class="fa-solid fa-chart-line"></i><span>Grow</span></a>
    `;
    initGrowHiddenTap();
  }
}

function initPage(){
  let page = document.body.dataset.page || "home";
  ensureLoginModal();

  if(page === "home"){
    loadProducts().then(function(){ renderHome(); logEvent("visit_app"); });
  }
  else if(page === "favourite"){
    requireLogin(function(){ loadProducts().then(renderFavourite); });
  }
  else if(page === "contact"){
    renderContact();
  }
  else if(page === "grow"){
    renderGrow();
  }
  else if(page === "admin"){
    renderAdmin();
  }
}

function loadProducts(){
  return fetch(apiUrl("products"))
    .then(res => res.json())
    .then(data => {
      allProducts = Array.isArray(data) ? data.filter(isShown) : [];
      return allProducts;
    })
    .catch(() => {
      allProducts = [];
      showToast("Products loading failed");
      return [];
    });
}

function renderHome(){
  let root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="search-wrap">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="searchInput" placeholder="Search products" oninput="renderProductList()">
    </div>
    <div class="hero">
      <h1>${escapeHTML(APP_CONFIG.brandName)} Collection</h1>
      <p>Browse styles and enquire instantly on WhatsApp</p>
    </div>
    <h2 class="section-title">Categories</h2>
    <div class="chips" id="categoryChips"></div>
    <h2 class="section-title" id="listTitle">New Collection</h2>
    <div class="product-grid" id="productGrid"></div>
  `;
  renderCategories();
  renderProductList();
}

function renderCategories(){
  let box = document.getElementById("categoryChips");
  let categories = ["All", ...new Set(allProducts.map(productCategory).filter(Boolean))];
  box.innerHTML = categories.map(cat => `<button class="chip ${cat === currentCategory ? "active" : ""}" onclick="selectCategory('${escapeJS(cat)}')">${escapeHTML(cat)}</button>`).join("");
}

function selectCategory(category){
  currentCategory = category;
  renderCategories();
  renderProductList();
}

function filteredProducts(){
  let q = normalize(document.getElementById("searchInput") ? document.getElementById("searchInput").value : "").toLowerCase();
  return allProducts.filter(product => {
    let matchCategory = currentCategory === "All" || productCategory(product) === currentCategory;
    let text = [productId(product), productName(product), productCategory(product), productPrice(product)].join(" ").toLowerCase();
    return matchCategory && (!q || text.includes(q));
  });
}

function renderProductList(){
  let grid = document.getElementById("productGrid");
  let list = filteredProducts();
  document.getElementById("listTitle").innerText = currentCategory === "All" ? "New Collection" : currentCategory;
  if(!list.length){
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">No products found</div>`;
    return;
  }
  grid.innerHTML = list.map(renderProductCard).join("");
}

function renderProductCard(product){
  let id = productId(product);
  let fav = getFavorites().includes(id);
  let stock = isInStock(product);
  return `
    <div class="product-card">
      <button class="heart ${fav ? "saved" : ""}" onclick="toggleFavorite('${escapeJS(id)}')"><i class="fa-${fav ? "solid" : "regular"} fa-heart"></i></button>
      <img src="${escapeHTML(productImage(product))}" alt="${escapeHTML(productName(product))}" onclick="openProduct('${escapeJS(id)}')">
      <div class="product-id">${escapeHTML(id)}</div>
      <div class="product-name">${escapeHTML(productName(product))}</div>
      <div class="price">₹ ${escapeHTML(productPrice(product))}</div>
      <div class="desc">${escapeHTML(product.Description1 || product.description1 || productCategory(product))}</div>
      <button class="primary-btn" onclick="${stock ? `productWhatsApp('${escapeJS(id)}')` : `checkAvailability('${escapeJS(id)}')`}">${stock ? "WhatsApp" : "Check Availability"}</button>
    </div>
  `;
}

function openProduct(id){
  requireLogin(function(){
    let product = allProducts.find(item => productId(item) === id);
    if(!product){ return; }
    logEvent("view_product", product);
    document.getElementById("productModal").innerHTML = `
      <div class="sheet">
        <img src="${escapeHTML(productImage(product))}" style="width:100%;max-height:420px;object-fit:cover;border-radius:24px;background:#f8f5ff;">
        <h2 style="text-align:left;margin-top:16px;">${escapeHTML(productName(product))}</h2>
        <p style="text-align:left;">${escapeHTML(product.Description2 || product.Description1 || "Premium catalog product")}</p>
        <div class="price">₹ ${escapeHTML(productPrice(product))}</div>
        <div class="row" style="margin-top:16px;">
          <button class="ghost-btn" onclick="toggleFavorite('${escapeJS(id)}')"><i class="fa-regular fa-heart"></i> Favourite</button>
          <button class="primary-btn" onclick="${isInStock(product) ? `productWhatsApp('${escapeJS(id)}')` : `checkAvailability('${escapeJS(id)}')`}">${isInStock(product) ? "WhatsApp" : "Check Availability"}</button>
        </div>
      </div>
    `;
    document.getElementById("productModal").classList.add("show");
  });
}

function toggleFavorite(id){
  requireLogin(function(){
    let ids = getFavorites();
    let product = allProducts.find(item => productId(item) === id);
    if(ids.includes(id)){
      ids = ids.filter(item => item !== id);
      logEvent("remove_favourite", product);
      showToast("Removed from favourite");
    }
    else{
      ids.push(id);
      logEvent("add_favourite", product);
      showToast("Added to favourite");
    }
    setFavorites(ids);
    if(document.body.dataset.page === "favourite"){ renderFavourite(); }
    if(document.body.dataset.page === "home"){ renderProductList(); }
  });
}

function productWhatsApp(id){
  requireLogin(function(){
    let product = allProducts.find(item => productId(item) === id);
    if(!product){ return; }
    logEvent("whatsapp_enquiry", product);
    let text = `Hi, I am interested in this product.%0A%0AProduct Name: ${encodeURIComponent(productName(product))}%0AProduct ID: ${encodeURIComponent(id)}%0APrice: ₹${encodeURIComponent(productPrice(product))}%0A%0APlease share details.`;
    window.open(`https://wa.me/${APP_CONFIG.sellerWhatsApp}?text=${text}`,"_blank");
  });
}

function checkAvailability(id){
  requireLogin(function(){
    let product = allProducts.find(item => productId(item) === id);
    if(!product){ return; }
    logEvent("check_availability", product);
    let text = `Hi, I am interested in this out of stock product.%0A%0AProduct Name: ${encodeURIComponent(productName(product))}%0AProduct ID: ${encodeURIComponent(id)}%0A%0APlease inform me when available.`;
    window.open(`https://wa.me/${APP_CONFIG.sellerWhatsApp}?text=${text}`,"_blank");
  });
}

function renderFavourite(){
  let root = document.getElementById("pageRoot");
  let ids = getFavorites();
  let list = allProducts.filter(product => ids.includes(productId(product)));
  root.innerHTML = `
    <h2 class="section-title">Favourite Products</h2>
    <div class="product-grid">${list.length ? list.map(renderProductCard).join("") : `<div class="empty" style="grid-column:1/-1;">No favourite products yet</div>`}</div>
  `;
}

function renderContact(){
  let root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="panel">
      <h2>Contact ${escapeHTML(APP_CONFIG.brandName)}</h2>
      <p>Talk to seller directly for product details and availability.</p>
      <button class="primary-btn" style="margin-top:18px;" onclick="contactSeller()"><i class="fa-brands fa-whatsapp"></i> WhatsApp Seller</button>
    </div>
  `;
}

function contactSeller(){
  requireLogin(function(){
    logEvent("contact_click");
    window.open(`https://wa.me/${APP_CONFIG.sellerWhatsApp}?text=Hi, I want to know more about ${encodeURIComponent(APP_CONFIG.brandName)} products.`,"_blank");
  });
}

function renderGrow(){
  let root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="panel">
      <h2>Grow Your Shop</h2>
      <p>Want this online catalog app for your clothing shop?</p>
      <div class="stat-grid" style="margin-top:16px;">
        <div class="stat"><b><i class="fa-solid fa-shirt"></i></b><span>Product catalog</span></div>
        <div class="stat"><b><i class="fa-brands fa-whatsapp"></i></b><span>WhatsApp enquiry</span></div>
        <div class="stat"><b><i class="fa-solid fa-chart-line"></i></b><span>Customer analytics</span></div>
        <div class="stat"><b><i class="fa-solid fa-mobile-screen"></i></b><span>Installable app</span></div>
      </div>
      <button class="primary-btn" style="margin-top:18px;" onclick="window.open('https://wa.me/${APP_CONFIG.growContactWhatsApp}?text=I want a catalog app for my shop','_blank')">Build My Catalog</button>
    </div>
  `;
}

function renderAdmin(){
  let root = document.getElementById("pageRoot");
  root.innerHTML = `<div class="panel"><h2>Seller Analytics</h2><p>Loading analytics...</p></div>`;
  Promise.all([
    fetch(apiUrl("products")).then(r => r.json()).catch(() => []),
    fetch(apiUrl("events")).then(r => r.json()).catch(() => []),
    fetch(apiUrl("users")).then(r => r.json()).catch(() => [])
  ]).then(([products, events, users]) => {
    let today = new Date().toDateString();
    let todayEvents = events.filter(e => new Date(e.dateTime).toDateString() === today);
    let topViews = topBy(events.filter(e => e.eventType === "view_product"), "productName");
    let topFav = topBy(events.filter(e => e.eventType === "add_favourite"), "productName");
    let topWa = topBy(events.filter(e => e.eventType === "whatsapp_enquiry"), "productName");
    root.innerHTML = `
      <h2 class="section-title">Seller Analytics</h2>
      <div class="stat-grid">
        <div class="stat"><b>${todayEvents.length}</b><span>Events today</span></div>
        <div class="stat"><b>${users.length}</b><span>Total users</span></div>
        <div class="stat"><b>${products.length}</b><span>Products</span></div>
        <div class="stat"><b>${events.length}</b><span>Total events</span></div>
      </div>
      ${analyticsPanel("Most viewed", topViews)}
      ${analyticsPanel("Most favourited", topFav)}
      ${analyticsPanel("Most WhatsApp enquiry", topWa)}
    `;
  });
}

function topBy(list,key){
  let map = {};
  list.forEach(item => {
    let name = normalize(item[key]) || "-";
    map[name] = (map[name] || 0) + 1;
  });
  return Object.keys(map).sort((a,b) => map[b] - map[a]).slice(0,5).map(name => ({name, count:map[name]}));
}

function analyticsPanel(title,items){
  return `<div class="panel"><h2>${escapeHTML(title)}</h2>${items.length ? items.map(item => `<p><b>${escapeHTML(item.name)}</b> - ${item.count}</p>`).join("") : "<p>No data yet</p>"}</div>`;
}

function ensureLoginModal(){
  if(document.getElementById("loginModal")){ return; }
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal" id="loginModal" onclick="closeModalOnBg(event,'loginModal')">
      <div class="sheet">
        <h2>Quick Login</h2>
        <p>Enter your name and phone to continue.</p>
        <div class="field"><label>Name</label><input id="loginName" placeholder="Write your name"></div>
        <div class="field"><label>Phone</label><input id="loginPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="Write your phone number"></div>
        <button class="primary-btn" style="margin-top:16px;" onclick="saveLogin()">Continue</button>
      </div>
    </div>
    <div class="modal" id="productModal" onclick="closeModalOnBg(event,'productModal')"></div>
    <div class="toast" id="toast"></div>
  `);
}

function openLogin(action){
  pendingAction = action || null;
  document.getElementById("loginModal").classList.add("show");
}

function requireLogin(action){
  if(currentUser()){
    action();
    return;
  }
  openLogin(action);
}

function saveLogin(){
  let username = normalize(document.getElementById("loginName").value);
  let phone = cleanPhone(document.getElementById("loginPhone").value);
  if(!username){ showToast("Enter your name"); return; }
  if(phone.length !== 10){ showToast("Wrong phone number"); return; }
  let user = {username, phone};
  setCurrentUser(user);
  postData({type:"user", username, phone});
  document.getElementById("loginModal").classList.remove("show");
  renderShell();
  if(pendingAction){
    let run = pendingAction;
    pendingAction = null;
    run();
  }
}

function logEvent(type, product){
  let user = currentUser() || {};
  postData({
    type:"event",
    username:user.username || "",
    phone:user.phone || "",
    eventType:type,
    productId:product ? productId(product) : "",
    productName:product ? productName(product) : "",
    category:product ? productCategory(product) : ""
  });
}

function postData(payload){
  if(!APP_CONFIG.scriptApi || APP_CONFIG.scriptApi.includes("docs.google.com")){
    return Promise.resolve({success:false});
  }
  return fetch(APP_CONFIG.scriptApi, {method:"POST", body:JSON.stringify(payload)})
    .then(res => res.json())
    .catch(() => ({success:false}));
}

function initGrowHiddenTap(){
  let grow = document.getElementById("growNav");
  if(!grow){ return; }
  let taps = 0;
  let timer = null;
  grow.addEventListener("click", function(event){
    taps++;
    clearTimeout(timer);
    timer = setTimeout(() => taps = 0, 1200);
    if(taps >= 5){
      event.preventDefault();
      taps = 0;
      window.location.href = "upload.html";
    }
  });
}

function closeModalOnBg(event,id){
  if(event.target.id === id){
    event.target.classList.remove("show");
  }
}

function showToast(message){
  let toast = document.getElementById("toast");
  if(!toast){ return; }
  toast.innerText = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function escapeHTML(value){
  return normalize(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function escapeJS(value){
  return normalize(value).replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}
