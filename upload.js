let liveProducts = [];
let editFilter = "All";
let editMode = false;
let editingProductId = "";

const nameWords = {
  Saree: ["Royal Silk Saree", "Elegant Cotton Saree", "Premium Zari Saree", "Classic Festive Saree"],
  Kurti: ["Stylish Ethnic Kurti", "Premium Cotton Kurti", "Modern Daily Kurti", "Elegant Printed Kurti"],
  Tops: ["Trendy Casual Top", "Modern Fashion Top", "Soft Daily Top", "Smart Comfort Top"],
  Palazzo: ["Modern Relaxed Palazzo", "Soft Comfort Palazzo", "Classic Daily Palazzo", "Premium Cotton Palazzo"],
  Salwar: ["Classic Salwar Set", "Elegant Ethnic Salwar", "Premium Comfort Salwar", "Royal Daily Salwar"],
  Gown: ["Party Wear Gown", "Elegant Evening Gown", "Royal Fashion Gown", "Premium Celebration Gown"],
  Nighty: ["Soft Cotton Nighty", "Comfort Daily Nighty", "Premium Sleep Nighty", "Relaxed Night Wear"],
  Western: ["Modern Western Outfit", "Smart Western Wear", "Trendy Fashion Outfit", "Premium Casual Outfit"],
  Kids: ["Cute Kids Dress", "Smart Kids Outfit", "Premium Kids Wear", "Soft Kids Fashion"],
  Bedsheet: ["Premium Cotton Bedsheet", "Soft Comfort Bedsheet", "Elegant Printed Bedsheet", "Fresh Bedroom Bedsheet"],
  Trendz: ["Latest Trendy Collection", "Modern Fashion Choice", "Fresh Style Collection", "Premium Trendy Pick"]
};

const shortDesc = {
  Saree: "Elegant saree for festive style",
  Kurti: "Stylish kurti for daily comfort",
  Tops: "Trendy top for casual style",
  Palazzo: "Soft palazzo for modern styling",
  Salwar: "Classic salwar for ethnic comfort",
  Gown: "Beautiful gown for party wear",
  Nighty: "Soft nighty for relaxed comfort",
  Western: "Modern outfit for daily fashion",
  Kids: "Cute kids wear for comfort",
  Bedsheet: "Soft bedsheet for bedroom comfort",
  Trendz: "Fresh trend for modern style"
};

const longDesc = {
  Saree: "Elegant saree crafted for festive moments family functions and graceful traditional styling",
  Kurti: "Stylish kurti designed for daily comfort easy movement and simple ethnic fashion",
  Tops: "Trendy top made for casual outings daily style and comfortable modern dressing",
  Palazzo: "Soft palazzo with relaxed fit made for daily wear and easy styling",
  Salwar: "Classic salwar set made for ethnic comfort family occasions and graceful daily wear",
  Gown: "Beautiful gown designed for celebrations evening style and confident party looks",
  Nighty: "Soft nighty made for relaxed sleepwear daily comfort and easy night use",
  Western: "Modern western outfit selected for confident styling daily comfort and fresh fashion",
  Kids: "Cute kids fashion made for playful comfort outings and everyday happy styling",
  Bedsheet: "Soft bedsheet with fresh design made for daily comfort and bedroom style",
  Trendz: "Fresh trendy collection selected for modern looks daily fashion and easy styling"
};

document.addEventListener("DOMContentLoaded", function(){
  initUpload();
});

function initUpload(){
  document.getElementById("uploadTitle").innerText = APP_CONFIG.brandName + " Upload";
  fillCategorySelects();
  loadLiveProducts();
}

function fillCategorySelects(){
  let category = document.getElementById("category");
  category.innerHTML = `<option value="">Select category</option>`;
  ["New Arrivals", ...APP_CONFIG.categories].forEach(cat=>{
    category.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
  syncProductTypeOptions();
}

function syncProductTypeOptions(){
  let category = document.getElementById("category").value;
  let type = document.getElementById("productType");
  type.innerHTML = "";

  APP_CONFIG.categories.forEach(cat=>{
    type.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  if(category && category !== "New Arrivals"){
    type.value = category;
  }
}

async function loadLiveProducts(){
  try{
    liveProducts = await loadProducts();
  }
  catch(error){
    liveProducts = [];
  }
  renderEditCategories();
  renderEditList();
}

function renderEditCategories(){
  let wrap = document.getElementById("editCategories");
  if(!wrap){
    return;
  }
  let cats = ["All", "No Image", ...APP_CONFIG.categories];
  wrap.innerHTML = cats.map(cat=>`
    <button class="chip ${editFilter === cat ? "active" : ""}" onclick="setEditFilter('${cat}')">${cat}</button>
  `).join("");
}

function setEditFilter(cat){
  editFilter = cat;
  renderEditCategories();
  renderEditList();
}

function renderEditList(){
  let list = document.getElementById("editList");
  if(!list){
    return;
  }
  let search = (document.getElementById("editSearch").value || "").toLowerCase().trim();
  let products = liveProducts.filter(product=>{
    let name = String(product["Product Name"] || "").toLowerCase();
    let id = String(product["Product ID"] || "").toLowerCase();
    let category = String(product["Category"] || "").toLowerCase();
    let price = String(product["Price"] || "").toLowerCase();
    let hasNoImage = !String(product["Image Url"] || "").trim();
    let filterOk = editFilter === "All" ||
      (editFilter === "No Image" && hasNoImage) ||
      String(product["Category"] || "") === editFilter ||
      String(product["Product Type"] || "") === editFilter;
    let searchOk = !search || name.includes(search) || id.includes(search) || category.includes(search) || price.includes(search);
    return filterOk && searchOk;
  });

  if(!products.length){
    list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><h3>No product found</h3></div>`;
    return;
  }

  list.innerHTML = products.map(product=>{
    let image = normalizeImageUrl(product["Image Url"] || "");
    let visible = String(product["Show"] || "").toLowerCase() === "yes";
    return `
      <div class="edit-row">
        <img src="${image || "icon-192.png"}" alt="${product["Product Name"] || "Product"}">
        <div>
          <h3>${product["Product Name"] || "Unnamed Product"}</h3>
          <p>${product["Product ID"] || ""} - ${product["Category"] || ""} - Rs ${product["Price"] || ""}</p>
          <span class="badge ${visible ? "success" : "muted"}">${visible ? "Visible" : "Hidden"}</span>
        </div>
        <button class="primary-mini" onclick="editProduct('${escapeJS(product["Product ID"] || "")}')">Edit</button>
      </div>
    `;
  }).join("");
}

function showEditDesk(){
  document.getElementById("startPanel").classList.add("hidden");
  document.getElementById("formPanel").classList.add("hidden");
  document.getElementById("editDesk").classList.remove("hidden");
  document.getElementById("uploadSubtitle").innerText = "Choose product to edit";
}

function startNewProduct(){
  editMode = false;
  editingProductId = "";
  document.getElementById("startPanel").classList.add("hidden");
  document.getElementById("editDesk").classList.add("hidden");
  document.getElementById("formPanel").classList.remove("hidden");
  document.getElementById("formTitle").innerText = "New Product";
  document.getElementById("saveBtn").innerText = "Upload Product";
  document.getElementById("deleteBtn").classList.add("hidden");
  document.getElementById("regenIdBtn").classList.remove("hidden");
  document.getElementById("uploadSubtitle").innerText = "New product";
  clearForm(false);
  regenerateProductId();
  updatePreview();
}

function editProduct(productId){
  let product = liveProducts.find(item=>String(item["Product ID"]) === String(productId));
  if(!product){
    showToast("Product not found");
    return;
  }
  editMode = true;
  editingProductId = productId;
  document.getElementById("startPanel").classList.add("hidden");
  document.getElementById("editDesk").classList.add("hidden");
  document.getElementById("formPanel").classList.remove("hidden");
  document.getElementById("formTitle").innerText = "Edit Product";
  document.getElementById("saveBtn").innerText = "Update Product";
  document.getElementById("deleteBtn").classList.remove("hidden");
  document.getElementById("regenIdBtn").classList.add("hidden");
  document.getElementById("uploadSubtitle").innerText = "Editing product";

  setValue("productId", product["Product ID"]);
  setValue("category", product["Category"]);
  syncProductTypeOptions();
  setValue("productType", product["Product Type"] || product["Category"]);
  setValue("productName", product["Product Name"]);
  setValue("price", product["Price"]);
  setValue("stock", product["Stock"] || "In Stock");
  setValue("show", product["Show"] || "Yes");
  setValue("description1", product["Description1"]);
  setValue("description2", product["Description2"]);
  setValue("imageUrl", product["Image Url"]);
  setValue("imageUrl2", product["Image Url2"]);
  setValue("imageUrl3", product["Image Url3"]);
  setValue("imageUrl4", product["Image Url4"]);
  updatePreview();
}

function setValue(id,value){
  document.getElementById(id).value = value || "";
}

function cleanTextInput(input){
  let clean = input.value.replace(/[^a-zA-Z0-9 ]/g,"").replace(/\s+/g," ");
  if(clean !== input.value){
    showToast("Letters numbers and spaces only");
  }
  input.value = clean;
  updatePreview();
}

function autoFillText(){
  let type = document.getElementById("productType").value || document.getElementById("category").value;
  if(type === "New Arrivals"){
    type = "Trendz";
  }
  let names = nameWords[type] || nameWords.Trendz;
  document.getElementById("productName").value = names[Math.floor(Math.random() * names.length)];
  document.getElementById("description1").value = shortDesc[type] || shortDesc.Trendz;
  document.getElementById("description2").value = longDesc[type] || longDesc.Trendz;
  updatePreview();
}

function generateProductId(){
  let prefix = APP_CONFIG.productIdPrefix || "CT";
  let used = new Set(liveProducts.map(item=>String(item["Product ID"] || "").trim()));
  let max = 0;
  used.forEach(id=>{
    if(id.startsWith(prefix)){
      let num = Number(id.replace(prefix,""));
      if(num > max){
        max = num;
      }
    }
  });
  let next = max + 1;
  let id = prefix + String(next).padStart(5,"0");
  while(used.has(id)){
    next++;
    id = prefix + String(next).padStart(5,"0");
  }
  return id;
}

function regenerateProductId(){
  if(editMode){
    return;
  }
  document.getElementById("productId").value = generateProductId();
}

function collectPayload(){
  let data = {
    "Product ID": document.getElementById("productId").value.trim(),
    "Product Name": document.getElementById("productName").value.trim(),
    "Category": document.getElementById("category").value.trim(),
    "Product Type": document.getElementById("productType").value.trim(),
    "Show": document.getElementById("show").value.trim(),
    "Price": document.getElementById("price").value.trim(),
    "Stock": document.getElementById("stock").value.trim(),
    "Description1": document.getElementById("description1").value.trim(),
    "Description2": document.getElementById("description2").value.trim(),
    "Image Url": document.getElementById("imageUrl").value.trim(),
    "Image Url2": document.getElementById("imageUrl2").value.trim(),
    "Image Url3": document.getElementById("imageUrl3").value.trim(),
    "Image Url4": document.getElementById("imageUrl4").value.trim()
  };
  return data;
}

function validatePayload(data){
  if(!data["Product ID"]){
    return "Product ID missing";
  }
  if(!data["Category"]){
    return "Select category";
  }
  if(!data["Product Name"]){
    return "Enter product name";
  }
  if(!data["Price"]){
    return "Enter price";
  }
  return "";
}

async function saveProduct(){
  let data = collectPayload();
  let error = validatePayload(data);
  if(error){
    showToast(error);
    return;
  }

  let type = editMode ? "updateProduct" : "saveProduct";
  document.getElementById("saveBtn").disabled = true;
  document.getElementById("saveBtn").innerText = editMode ? "Updating..." : "Uploading...";

  try{
    let result = await postData({type:type, product:data});
    if(result && result.success){
      showSuccess(editMode ? "Product Updated Successfully" : "New Product Uploaded Successfully");
      await loadLiveProducts();
      setTimeout(backToStart, 1600);
    }
    else{
      showToast((result && result.message) || "Product not saved");
    }
  }
  catch(error){
    showToast("Add Apps Script URL in config");
  }
  document.getElementById("saveBtn").disabled = false;
  document.getElementById("saveBtn").innerText = editMode ? "Update Product" : "Upload Product";
}

function confirmDeleteProduct(){
  openConfirm("Delete product permanently?","This removes the product row from Sheet.", async function(){
    closeConfirm();
    try{
      let result = await postData({type:"deleteProduct", productId:editingProductId});
      if(result && result.success){
        showSuccess("Product Deleted Successfully");
        await loadLiveProducts();
        setTimeout(backToStart, 1600);
      }
      else{
        showToast((result && result.message) || "Product not deleted");
      }
    }
    catch(error){
      showToast("Delete failed");
    }
  });
}

function confirmClearForm(){
  openConfirm("Clear current product?","This will reset the form.", function(){
    closeConfirm();
    clearForm(true);
    showToast("Form cleared");
  });
}

function openConfirm(title,message,action){
  document.getElementById("confirmTitle").innerText = title;
  document.getElementById("confirmMessage").innerText = message;
  document.getElementById("confirmActionBtn").onclick = action;
  document.getElementById("confirmModal").classList.remove("hidden");
}

function closeConfirm(){
  document.getElementById("confirmModal").classList.add("hidden");
}

function clearForm(keepId){
  let currentId = document.getElementById("productId").value;
  ["category","productType","productName","price","description1","description2","imageUrl","imageUrl2","imageUrl3","imageUrl4"].forEach(id=>{
    document.getElementById(id).value = "";
  });
  document.getElementById("stock").value = "In Stock";
  document.getElementById("show").value = "Yes";
  fillCategorySelects();
  if(keepId){
    document.getElementById("productId").value = currentId;
  }
  updatePreview();
}

function updatePreview(){
  let box = document.getElementById("uploadPreview");
  if(!box){
    return;
  }
  let data = collectPayload();
  box.innerHTML = `
    <img src="${normalizeImageUrl(data["Image Url"]) || "icon-192.png"}" alt="Preview">
    <div>
      <h3>${data["Product Name"] || "Product Preview"}</h3>
      <p>${data["Product ID"] || ""} - ${data["Category"] || "No category"} - Rs ${data["Price"] || "0"}</p>
      <span class="badge ${data["Show"] === "Yes" ? "success" : "muted"}">${data["Show"] === "Yes" ? "Visible in app" : "Hidden in app"}</span>
    </div>
  `;
}

function backToStart(){
  editMode = false;
  editingProductId = "";
  document.getElementById("startPanel").classList.remove("hidden");
  document.getElementById("editDesk").classList.add("hidden");
  document.getElementById("formPanel").classList.add("hidden");
  document.getElementById("uploadSubtitle").innerText = "Choose upload action";
}

function showSuccess(message){
  openConfirm(message,"Saved in catalog system.", function(){
    closeConfirm();
  });
  setTimeout(closeConfirm, 1400);
}

function escapeJS(value){
  return String(value || "").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}
