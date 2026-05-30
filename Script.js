/* ================= KONFIGURASI ================= */
const GOOGLE_SHEETS_ID = "ID_SHEETS_KAMU"; // <-- GANTI INI!

// ========== BOT 1: Kirim bukti ke ADMIN ==========
const TELEGRAM_BOT_TOKEN = "8716871634:AAH4-LCQiBOgfIM7VJ1UXkm-EGyFLRpaqwc"; 
const TELEGRAM_CHAT_ID = "7897654586";

// ========== BOT 2: Kirim link ke PELANGGAN ==========
const TELEGRAM_BOT_TOKEN2 = "8700990114:AAE7ur_RvqZbYsvqejm-uD7PF2GcySMZxj8";
const BOT2_USERNAME = "Delltoko_bot";

/* ================= MUSIC CONTROL ================= */
let audioElement = null;
let isMusicPlaying = false;

function initMusic() {
  audioElement = new Audio("https://files.catbox.moe/cyoa8d.mp3");
  audioElement.loop = true;
  audioElement.preload = "auto";
}

function toggleMusic() {
  if (!audioElement) initMusic();
  if (isMusicPlaying) {
    audioElement.pause();
    isMusicPlaying = false;
    const musicBtn = document.getElementById("inlineMusicBtn");
    if (musicBtn) musicBtn.innerHTML = "🎵 Play Music";
  } else {
    audioElement.play().catch(err => {
      console.log("Gagal play audio:", err);
      alert("Klik tombol music lagi untuk memutar musik");
    });
    isMusicPlaying = true;
    const musicBtn = document.getElementById("inlineMusicBtn");
    if (musicBtn) musicBtn.innerHTML = "🎵 Playing...";
  }
}

/* ================= DATA THANKS TO ================= */
const contributors = [
  { name: "Dell", role: "Developer", avatar: "https://files.catbox.moe/bq15bd.jpg", wa: null, tele: "Youwpiw" },
  { name: "Masvill", role: "El Read", avatar: "https://files.catbox.moe/9m2zn9.jpg", wa: null, tele: "MasvilTmvn89" },
  { name: "Zenn", role: "Support", avatar: "https://files.catbox.moe/17u604.jpg", wa: null, tele: "silverking15" },
  { name: "Adly", role: "Suka minum", avatar: "https://files.catbox.moe/mae3ya.jpg", wa: null, tele: "WanzzxCrahs" },
  { name: "Yozz", role: "Suka oyo", avatar: "https://files.catbox.moe/6zn2m4.jpg", wa: "6282218274303", tele: null },
  { name: "Zinx", role: "Bandar", avatar: "https://files.catbox.moe/7xvvj2.jpg", wa: null, tele: "zinx_12" }
];

/* ================= PRODUK & TOOLS ================= */
let products = [];
let extraProducts = [];
let DEFAULT_QRIS_URL = "";

const tools = [
 {name:"IQC iPhone",action:"iqc"},
 {name:"Auto Menu",action:"menu"},
 {name:"Downloader",action:"dl"},
 {name:"🤖 Tanya AI",action:"ai"}
];

/* ================= GLOBAL VARIABLES ================= */
let selectedProductIndex = 0;
let selectedProductObj = null;
let paymentActive = false;
let pendingTransaction = null;

// Fungsi ambil data dari Google Sheets
async function loadProductsFromSheet() {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=csv&gid=0`;
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    const rows = csvText.split('\n');
    const tempProducts = [];
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      const cols = rows[i].split(',');
      if (cols.length >= 5 && cols[0] !== 'qris_url' && cols[0] !== 'key') {
        tempProducts.push({
          name: cols[0].replace(/"/g, '').trim(),
          price: parseInt(cols[1]) || 0,
          stock: parseInt(cols[2]) || 0,
          desc: cols[3].replace(/"/g, '').trim(),
          link: cols[4].replace(/"/g, '').trim()
        });
      }
    }
    
    if (tempProducts.length > 0) {
      products = tempProducts.slice(0, 3);
      extraProducts = tempProducts.slice(3);
    } else {
      setDefaultProducts();
    }
    
    await loadQRISFromSheet();
    renderProducts();
    renderThanks();
    
  } catch (error) {
    console.error("Gagal load dari Google Sheets:", error);
    setDefaultProducts();
    DEFAULT_QRIS_URL = "https://img2.pixhost.to/images/7285/716368233_infinity.jpg";
    renderProducts();
    renderThanks();
  }
}

async function loadQRISFromSheet() {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=csv&gid=1`;
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const rows = csvText.split('\n');
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      const cols = rows[i].split(',');
      if (cols[0] === 'qris_url') {
        DEFAULT_QRIS_URL = cols[1].replace(/"/g, '').trim();
        break;
      }
    }
  } catch (error) {
    console.error("Gagal load QRIS:", error);
  }
}

function setDefaultProducts() {
  products = [
    { name:"SCRIPT BOT PREMIUM", price: 25000, stock: 5, desc:"Bot WhatsApp siap pakai, ringan & stabil.", link:"https://mediafire.com/file/premium.zip" },
    { name:"SCRIPT BOT VIP", price: 50000, stock: 3, desc:"Versi full fitur: payment gateway, menu interaktif.", link:"https://mediafire.com/file/vip.zip" },
    { name:"SCRIPT BOT ULTIMATE", price: 100000, stock: 2, desc:"Full akses + bantuan case + update seumur hidup.", link:"https://mediafire.com/file/ultimate.zip" }
  ];
  extraProducts = [
    { name:"Script Music Bot", price: 30000, stock: 3, desc:"Bot auto musik & audio streaming", link:"https://mediafire.com/file/musicbot.zip"},
    { name:"Script Downloader Pro", price: 40000, stock: 2, desc:"Bot downloader multi media", link:"https://mediafire.com/file/dlpro.zip"},
    { name:"Script AI Premium", price: 75000, stock: 4, desc:"Bot AI dengan Gemini API", link:"https://mediafire.com/file/aibot.zip"}
  ];
}

function getMergedProducts() {
  return [...products, ...extraProducts];
}

function getProductByIndex(idx) {
  const all = getMergedProducts();
  return all[idx];
}

function sendToGoogleSheets(transactionData) {
  console.log("Transaksi:", transactionData);
}

async function getUsernameFromChatId(chatId) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN2}/getChat?chat_id=${chatId}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.ok && result.result) {
      const username = result.result.username;
      if (username) {
        return `@${username}`;
      } else {
        return "Tidak punya username";
      }
    }
    return "Tidak ditemukan";
  } catch (error) {
    console.error("Gagal ambil username:", error);
    return "Gagal ambil data";
  }
}

async function sendProofToTelegram(imageFile, caption) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Bot Telegram belum dikonfigurasi.");
  }
  
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('caption', caption);
  formData.append('photo', imageFile, imageFile.name);
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });
  const result = await response.json();
  if (!result.ok) {
    throw new Error(`Telegram API error: ${result.description}`);
  }
  return result;
}

async function sendMessageToCustomer(chatId, message) {
  if (!TELEGRAM_BOT_TOKEN2) {
    throw new Error("❌ Bot token untuk pelanggan belum diisi!");
  }
  
  if (!chatId || isNaN(chatId)) {
    throw new Error("❌ Chat ID tidak valid! Harus berupa angka.");
  }
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN2}/sendMessage`;
  
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('text', message);
  formData.append('parse_mode', 'Markdown');
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (!result.ok) {
    if (result.description.includes("chat not found")) {
      throw new Error(`❌ Chat ID ${chatId} tidak ditemukan!\n\n📌 SOLUSI:\n1. Pastikan kamu sudah START bot ${BOT2_USERNAME}\n2. Kirim /id ke bot untuk cek Chat ID kamu\n3. Gunakan Chat ID yang dikirim bot`);
    }
    throw new Error(`Gagal kirim: ${result.description}`);
  }
  return result;
}

function validateChatId(chatId) {
  const errorDiv = document.getElementById("chatIdError");
  const cleanChatId = chatId.toString().trim();
  
  if (!cleanChatId) {
    errorDiv.style.display = "block";
    errorDiv.innerHTML = "⚠️ Chat ID tidak boleh kosong!";
    return false;
  }
  
  if (!/^\d+$/.test(cleanChatId)) {
    errorDiv.style.display = "block";
    errorDiv.innerHTML = "❌ Chat ID harus berupa angka! (contoh: 7973367718)";
    return false;
  }
  
  if (cleanChatId.length < 5) {
    errorDiv.style.display = "block";
    errorDiv.innerHTML = "❌ Chat ID terlalu pendek!";
    return false;
  }
  
  errorDiv.style.display = "none";
  return true;
}

function renderProducts() {
  const slider = document.getElementById("slider");
  const extraSlider = document.getElementById("extraProducts");
  
  if (!slider || !extraSlider) return;
  
  slider.innerHTML = "";
  products.forEach((p, i) => {
    slider.innerHTML += `
      <div class="product">
        <h3>${p.name}</h3>
        <div class="price">Rp ${p.price.toLocaleString("id-ID")}</div>
        <p>${p.desc}</p>
        <div class="stock">📦 Stock: ${p.stock}</div>
        <button class="btn" ${p.stock <= 0 ? "disabled" : ""} onclick="selectProduct(${i})">🛒 BELI</button>
      </div>`;
  });
  
  extraSlider.innerHTML = "";
  extraProducts.forEach((p, i) => {
    const realIdx = products.length + i;
    extraSlider.innerHTML += `
      <div class="product">
        <h3>${p.name}</h3>
        <div class="price">Rp ${p.price.toLocaleString("id-ID")}</div>
        <p>${p.desc}</p>
        <div class="stock">📦 Stock: ${p.stock}</div>
        <button class="btn" ${p.stock <= 0 ? "disabled" : ""} onclick="selectProduct(${realIdx})">🛒 BELI</button>
      </div>`;
  });
}

function selectProduct(idx) {
  selectedProductIndex = idx;
  selectedProductObj = getProductByIndex(idx);
  document.getElementById("buyBox").style.display = "block";
  document.getElementById("buyerChatId").value = "";
  document.getElementById("chatIdError").style.display = "none";
  document.getElementById("payBox").style.display = "none";
  document.getElementById("imagePreview").innerHTML = "";
  document.getElementById("proofImage").value = "";
  document.getElementById("paidAmount").value = "";
}

function closeBuyBox() {
  document.getElementById("buyBox").style.display = "none";
}

function startPayment() {
  const buyerChatId = document.getElementById("buyerChatId").value.trim();
  
  if (!validateChatId(buyerChatId)) {
    return;
  }
  
  if (!selectedProductObj) {
    alert("Pilih produk terlebih dahulu.");
    return;
  }

  document.getElementById("buyBox").style.display = "none";
  const payBox = document.getElementById("payBox");
  payBox.style.display = "block";
  
  const qrisArea = document.getElementById("qrisArea");
  qrisArea.innerHTML = `<img src="${DEFAULT_QRIS_URL}" alt="QRIS Pribadi" style="max-width:100%; max-height:300px; border-radius:20px; border:2px solid #b14cff; background:#fff; padding:8px;">`;
  
  document.getElementById("status").innerHTML = `💜 Scan QRIS di atas<br>Total: <strong>Rp ${selectedProductObj.price.toLocaleString("id-ID")}</strong><br>Chat ID: ${buyerChatId}<br><span style="color:#ffcc44;">Setelah transfer, upload bukti dan isi nominal dibawah.</span>`;
  
  const paidAmountInput = document.getElementById("paidAmount");
  paidAmountInput.value = selectedProductObj.price;
  
  pendingTransaction = {
    buyerChatId: buyerChatId,
    product: selectedProductObj,
    timestamp: Date.now()
  };
  paymentActive = true;
  
  document.getElementById("proofImage").value = "";
  document.getElementById("imagePreview").innerHTML = "";
  const submitBtn = document.getElementById("submitProofBtn");
  submitBtn.disabled = false;
  submitBtn.innerText = "📤 KIRIM BUKTI & KONFIRMASI";
  document.getElementById("proofFormArea").style.display = "block";
}

async function sendPaymentProof() {
  if (!paymentActive || !pendingTransaction) {
    alert("Tidak ada transaksi aktif. Silakan pilih produk lagi.");
    return;
  }
  
  const fileInput = document.getElementById("proofImage");
  const file = fileInput.files[0];
  if (!file) {
    alert("Harap upload bukti transfer terlebih dahulu (foto/ screenshot).");
    return;
  }
  
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar (jpg, png, jpeg).");
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran gambar terlalu besar (maksimal 5MB).");
    return;
  }
  
  const paidAmountRaw = document.getElementById("paidAmount").value;
  const paidAmount = parseInt(paidAmountRaw);
  if (isNaN(paidAmount) || paidAmount <= 0) {
    alert("Masukkan nominal yang dibayar (angka positif).");
    return;
  }
  
  const expectedPrice = pendingTransaction.product.price;
  if (paidAmount < expectedPrice) {
    alert(`Nominal yang dibayar kurang dari harga produk (Rp ${expectedPrice.toLocaleString("id-ID")}). Harap transfer sesuai nominal.`);
    return;
  }
  
  const submitBtn = document.getElementById("submitProofBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "⏳ Mengirim bukti...";
  
  try {
    const timeStr = new Date(pendingTransaction.timestamp).toLocaleString("id-ID");
    
    const username = await getUsernameFromChatId(pendingTransaction.buyerChatId);
    
    const captionAdmin = `✅ BUKTI PEMBAYARAN MASUK ✅\n\n` +
                    `🛍️ Produk: ${pendingTransaction.product.name}\n` +
                    `👤 Username Pelanggan: ${username}\n` +
                    `🆔 Chat ID Pelanggan: \`${pendingTransaction.buyerChatId}\`\n` +
                    `💰 Harga: Rp ${expectedPrice.toLocaleString("id-ID")}\n` +
                    `💵 Dibayar: Rp ${paidAmount.toLocaleString("id-ID")}\n` +
                    `🕒 Waktu Order: ${timeStr}\n` +
                    `🔗 Link Produk: ${pendingTransaction.product.link}\n\n` +
                    `✅ Link sudah otomatis dikirim ke pembeli via Bot 2.`;
    
    await sendProofToTelegram(file, captionAdmin);
    
    const captionCustomer = `🎉 *PESANAN ANDA TELAH DITERIMA!* 🎉\n\n` +
                    `Halo, terima kasih sudah order di *Dell Official*.\n\n` +
                    `📦 *Detail Pesanan:*\n` +
                    `🛍️ Produk: ${pendingTransaction.product.name}\n` +
                    `💰 Harga: Rp ${expectedPrice.toLocaleString("id-ID")}\n` +
                    `💵 Dibayar: Rp ${paidAmount.toLocaleString("id-ID")}\n` +
                    `🕒 Waktu: ${timeStr}\n\n` +
                    `📥 *Link Download:*\n${pendingTransaction.product.link}\n\n` +
                    `💡 Simpan link di atas untuk mengakses file Anda.\n` +
                    `📞 Kendala? Hubungi @Youwpiw\n\n` +
                    `Terima kasih telah berbelanja! 🙏💜`;
    
    await sendMessageToCustomer(pendingTransaction.buyerChatId, captionCustomer);
    
    const sheetData = {
      buyer_chat_id: pendingTransaction.buyerChatId,
      buyer_username: username,
      product_name: pendingTransaction.product.name,
      price: pendingTransaction.product.price,
      paid_amount: paidAmount,
      timestamp: timeStr,
      status: "sukses",
      link: pendingTransaction.product.link
    };
    sendToGoogleSheets(sheetData);
    
    document.getElementById("status").innerHTML = `✅ *TRANSAKSI BERHASIL* ✅<br><br>Bukti pembayaran sudah diterima dan *link download sudah dikirim ke Telegram Anda*.<br><br>Cek pesan dari Bot @${BOT2_USERNAME}. Terima kasih! 💜`;
    
    document.getElementById("proofFormArea").style.display = "none";
    submitBtn.disabled = true;
    submitBtn.innerText = "✓ TRANSAKSI SUKSES";
    
    const all = getMergedProducts();
    if (all[selectedProductIndex] && all[selectedProductIndex].stock > 0) {
      all[selectedProductIndex].stock--;
      renderProducts();
    }
    
    paymentActive = false;
    pendingTransaction = null;
    
  } catch (error) {
    console.error("Error:", error);
    alert(error.message);
    submitBtn.disabled = false;
    submitBtn.innerText = "📤 KIRIM BUKTI & KONFIRMASI";
  }
}

function cancelPayment() {
  paymentActive = false;
  pendingTransaction = null;
  document.getElementById("payBox").style.display = "none";
  document.getElementById("buyBox").style.display = "none";
  document.getElementById("status").innerHTML = "";
  document.getElementById("qrisArea").innerHTML = "";
  document.getElementById("proofFormArea").style.display = "block";
  document.getElementById("submitProofBtn").disabled = false;
  document.getElementById("submitProofBtn").innerText = "📤 KIRIM BUKTI & KONFIRMASI";
  document.getElementById("proofImage").value = "";
  document.getElementById("imagePreview").innerHTML = "";
}

document.getElementById("proofImage").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const previewDiv = document.getElementById("imagePreview");
  previewDiv.innerHTML = "";
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = document.createElement("img");
      img.src = ev.target.result;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "150px";
      img.style.borderRadius = "12px";
      img.style.marginTop = "8px";
      img.style.border = "1px solid #b14cff";
      previewDiv.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("buyerChatId").addEventListener("input", function(e) {
  validateChatId(e.target.value);
});

/* ================= FUNGSI THANKS TO ================= */
function renderThanks() {
  const slider = document.getElementById("thanksSlider");
  if (!slider) return;
  slider.innerHTML = "";
  contributors.forEach((c, idx) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "thanks-card";
    cardDiv.onclick = () => showThanksPopup(idx);
    cardDiv.innerHTML = `
      <img src="${c.avatar}" class="thanks-avatar">
      <h4 style="margin:5px 0">${c.name}</h4>
      <div style="font-size:11px; color:#c77dff;">${c.role}</div>
    `;
    slider.appendChild(cardDiv);
  });
}

function showThanksPopup(index) {
  const c = contributors[index];
  document.getElementById("popupAvatar").src = c.avatar;
  document.getElementById("popupName").innerText = c.name;
  document.getElementById("popupRole").innerText = c.role;
  
  const btnContainer = document.getElementById("popupButtons");
  btnContainer.innerHTML = "";
  
  if (c.tele) {
    const teleBtn = document.createElement("a");
    teleBtn.href = `https://t.me/${c.tele}`;
    teleBtn.target = "_blank";
    teleBtn.className = "tele-btn";
    teleBtn.innerText = "💬 Telegram";
    btnContainer.appendChild(teleBtn);
  }
  if (c.wa) {
    const waBtn = document.createElement("a");
    waBtn.href = `https://wa.me/${c.wa}`;
    waBtn.target = "_blank";
    waBtn.className = "wa-btn";
    waBtn.innerText = "📱 WhatsApp";
    btnContainer.appendChild(waBtn);
  }
  
  if (!c.tele && !c.wa) {
    btnContainer.innerHTML = "<span style='color:gray'>Tidak ada kontak</span>";
  }
  
  document.getElementById("thanksPopup").style.visibility = "visible";
}

function closeThanksPopup() {
  document.getElementById("thanksPopup").style.visibility = "hidden";
}

/* ================= FUNGSI TOOLS + AI ================= */
let aiChatOpen = false;

function closeAIChat() {
  const modal = document.getElementById("aiChatModal");
  if (modal) modal.remove();
  aiChatOpen = false;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function askAI() {
  const input = document.getElementById("aiQuestion");
  const question = input.value.trim().toLowerCase();
  
  if (!question) return;
  
  const messagesDiv = document.getElementById("aiMessages");
  
  messagesDiv.innerHTML += `
    <div class="ai-message-user">
      <strong>👤 Anda:</strong> ${escapeHtml(question)}
    </div>
  `;
  
  const loadingId = "ai-loading-" + Date.now();
  messagesDiv.innerHTML += `
    <div id="${loadingId}" class="ai-loading">
      <div class="loader-small"></div>
      <strong>🤖 AI:</strong> Sedang mengetik...
    </div>
  `;
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  input.value = "";
  
  setTimeout(() => {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    
    let answer = "";
    
    if (question.includes("halo") || question.includes("hai") || question.includes("hey") || question === "p") {
      answer = "Halo juga! Ada yang bisa saya bantu hari ini? 😊 Silakan tanya tentang produk, harga, cara order, atau apapun tentang Dell Official!";
    } 
    else if (question.includes("apa kabar") || question.includes("kabar")) {
      answer = "Saya baik-baik saja! Terima kasih sudah bertanya. Kamu sendiri gimana kabarnya? Semoga selalu sehat ya! 💜";
    }
    else if (question.includes("terima kasih") || question.includes("makasih") || question.includes("thanks")) {
      answer = "Sama-sama! Senang bisa membantu Anda 🤗 Jangan ragu untuk bertanya lagi ya!";
    }
    else if (question.includes("nama") || question.includes("siapa")) {
      answer = "Saya adalah asisten virtual dari Dell Official. Saya dibuat untuk membantu Anda bertransaksi dan menjawab pertanyaan seputar produk kami! 🤖";
    }
    else if (question.includes("beli") || question.includes("order") || question.includes("pesan")) {
      answer = "Untuk membeli produk, caranya mudah! 🛒\n\n1️⃣ Pilih menu Produk di bawah\n2️⃣ Pilih script yang diinginkan\n3️⃣ Masukkan Chat ID Telegram Anda\n4️⃣ Scan QRIS dan transfer sesuai nominal\n5️⃣ Upload bukti transfer\n6️⃣ Link download otomatis dikirim ke Telegram Anda!\n\nMudah kan? 😊";
    }
    else if (question.includes("harga") || question.includes("berapa")) {
      let hargaList = "Harga script bot kami:\n\n";
      const allProducts = getMergedProducts();
      allProducts.forEach(p => {
        hargaList += `💰 ${p.name}: Rp ${p.price.toLocaleString("id-ID")}\n`;
      });
      answer = hargaList + "\nCek detail lengkapnya di menu Produk ya!";
    }
    else if (question.includes("cara") || question.includes("tutorial")) {
      answer = "📝 Cara Order di Dell Official:\n\n1. Pilih produk yang ingin dibeli\n2. Masukkan Chat ID Telegram (dapatkan dari @Delltoko_bot dengan kirim /id)\n3. Scan QRIS dan transfer sesuai nominal\n4. Upload bukti transfer\n5. Link download akan otomatis dikirim ke Telegram Anda\n\nMudah dan cepat! 🚀";
    }
    else if (question.includes("bot") || question.includes("script")) {
      answer = "Kami menjual script bot WhatsApp premium dengan berbagai fitur:\n✅ Auto reply cerdas\n✅ Payment gateway\n✅ AI integration\n✅ Music bot\n✅ Downloader video/mp3\n✅ Anti spam & anti call\n✅ Dan masih banyak lagi!\n\nCek produk kami di menu Produk! 🚀";
    }
    else if (question.includes("admin") || question.includes("owner") || question.includes("dell")) {
      answer = "Admin Dell Official:\n💬 Telegram: @Youwpiw\n📢 Channel: @delltesting\n\nJangan ragu untuk menghubungi admin jika ada kendala atau pertanyaan! 💜";
    }
    else if (question.includes("qris") || question.includes("bayar") || question.includes("pembayaran")) {
      answer = "💜 Metode Pembayaran:\n\nKami menggunakan QRIS pribadi yang sudah disediakan.\n\nLangkah:\n1. Scan QRIS yang muncul\n2. Transfer sesuai nominal produk\n3. Upload bukti transfer\n4. Konfirmasi\n5. Link otomatis dikirim ke Telegram Anda\n\nMudah, cepat, dan aman! ✅";
    }
    else if (question.includes("help") || question.includes("tolong") || question.includes("bantuan")) {
      answer = "Saya siap membantu! 😊\n\nYang bisa saya bantu:\n❓ Info produk dan harga\n❓ Cara order\n❓ Cara dapatkan Chat ID\n❓ Info pembayaran\n❓ Kontak admin\n\nKetik pertanyaanmu dengan jelas ya!";
    }
    else if (question.includes("chat id") || question.includes("id telegram")) {
      answer = "📌 Cara Mendapatkan Chat ID:\n\n1. Buka Telegram\n2. Cari @Delltoko_bot\n3. START bot tersebut\n4. Kirim pesan: /id\n5. Bot akan membalas dengan Chat ID kamu (contoh: 7973367718)\n6. Copy angka tersebut dan tempelkan saat order\n\nMudah kan? 😊";
    }
    else if (question.includes("stock") || question.includes("stok") || question.includes("tersedia")) {
      let stokList = "📦 Stok produk kami:\n\n";
      const allProducts = getMergedProducts();
      allProducts.forEach(p => {
        stokList += `✅ ${p.name}: ${p.stock} tersedia\n`;
      });
      answer = stokList + "\nStok bisa berubah sewaktu-waktu ya!";
    }
    else {
      const randomAnswers = [
        "Maaf, saya masih AI sederhana nih 😅 Untuk pertanyaan yang lebih detail, silakan hubungi admin di @Youwpiw ya! Beliau siap membantu Anda 🙏",
        "Pertanyaan bagus! Sayangnya saya masih dalam tahap pembelajaran. Coba tanya admin langsung di Telegram @Youwpiw ya, nanti dibales kok! 😊",
        "Wah, kurang paham saya dengan pertanyaan itu 🤔 Tapi admin kami @Youwpiw siap membantu Anda! Chat aja langsung ke beliau ya 💜",
        "Saya asisten toko yang masih sederhana. Untuk informasi lebih lanjut, lebih baik kontak admin di @Youwpiw ya! 🙏",
        "Mohon maaf, saya belum bisa menjawab itu dengan baik 😇 Silakan chat admin di @Youwpiw untuk bantuan yang lebih cepat dan tepat! 🤗",
        "Maaf baru belajar nih 😁 Coba tanya ke @Youwpiw langsung ya, admin kami ramah-ramah kok! 💜"
      ];
      answer = randomAnswers[Math.floor(Math.random() * randomAnswers.length)];
    }
    
    messagesDiv.innerHTML += `
      <div class="ai-message-bot">
        <strong>🤖 AI:</strong> ${escapeHtml(answer)}
      </div>
    `;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 800);
}

function showAIChat() {
  if (aiChatOpen) {
    closeAIChat();
    return;
  }
  
  const modal = document.createElement("div");
  modal.id = "aiChatModal";
  modal.className = "ai-modal";
  
  modal.innerHTML = `
    <div class="ai-header">
      <h3>🤖 Tanya AI (Offline - Cerdas)</h3>
      <button class="ai-close" onclick="closeAIChat()">✖</button>
    </div>
    <div id="aiMessages" class="ai-messages">
      <div style="text-align: center; color: #9c6dff; padding: 20px;">
        👋 Halo! Selamat datang di AI Assistant Dell Official<br><br>
        Saya bisa membantu Anda tentang:<br>
        📦 Produk & Harga<br>
        🛒 Cara Order<br>
        💳 Pembayaran<br>
        📌 Cara dapat Chat ID<br>
        Dan masih banyak lagi!<br><br>
        Ketik pertanyaan Anda di bawah ya 😊
      </div>
    </div>
    <div class="ai-input-area">
      <input type="text" id="aiQuestion" class="ai-input" placeholder="Ketik pertanyaanmu... (contoh: harga, cara order, chat id)" onkeypress="if(event.key==='Enter') askAI()">
      <button class="ai-send" onclick="askAI()">Kirim</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  aiChatOpen = true;
  
  setTimeout(() => {
    const input = document.getElementById("aiQuestion");
    if (input) input.focus();
  }, 100);
}

async function useTool(action) {
  if (action === "iqc") {
    const teks = prompt("Masukkan teks untuk IQC iPhone:");
    if (!teks) return;
    const url = `https://brat.siputzx.my.id/iphone-quoted?batteryPercentage=${Math.floor(Math.random() * 80) + 20}&carrierName=INDOSAT&messageText=${encodeURIComponent(teks)}&emojiStyle=apple`;
    window.open(url, "_blank");
  } 
  else if (action === "menu") {
    alert("✨ AUTO MENU BOT\nFitur akan segera hadir.");
  }
  else if (action === "dl") {
    alert("📥 DOWNLOADER\nFitur dalam pengembangan.");
  }
  else if (action === "ai") {
    showAIChat();
  }
}

const toolsGrid = document.getElementById("toolsGrid");
tools.forEach(t => {
  const div = document.createElement("div");
  div.className = "tool-box";
  div.innerText = t.name;
  div.onclick = () => useTool(t.action);
  toolsGrid.appendChild(div);
});

// ============ FUNGSI MENU ============
function showHome() {
  document.getElementById("productBox").style.display = "none";
  document.getElementById("toolsBox").style.display = "none";
  document.querySelector(".owner-info").style.display = "block";
  document.querySelector(".owner").style.display = "flex";
  document.getElementById("thanksBox").style.display = "block";
  document.getElementById("buyBox").style.display = "none";
  document.getElementById("payBox").style.display = "none";
}
function showProducts() {
  document.getElementById("productBox").style.display = "block";
  document.getElementById("toolsBox").style.display = "none";
  document.querySelector(".owner-info").style.display = "none";
  document.querySelector(".owner").style.display = "flex";
  document.getElementById("thanksBox").style.display = "block";
  document.getElementById("buyBox").style.display = "none";
  document.getElementById("payBox").style.display = "none";
}
function showTools() {
  document.getElementById("productBox").style.display = "none";
  document.getElementById("toolsBox").style.display = "block";
  document.querySelector(".owner-info").style.display = "none";
  document.querySelector(".owner").style.display = "flex";
  document.getElementById("thanksBox").style.display = "block";
  document.getElementById("buyBox").style.display = "none";
  document.getElementById("payBox").style.display = "none";
}

const navs = document.querySelectorAll(".nav div");
function setActive(index) {
  navs.forEach((nav, i) => {
    if(i === index) nav.classList.add("active");
    else nav.classList.remove("active");
  });
}
window.showHome = () => { showHome(); setActive(0); };
window.showProducts = () => { showProducts(); setActive(1); };
window.showTools = () => { showTools(); setActive(2); };
window.closeAIChat = closeAIChat;
window.askAI = askAI;
window.closeThanksPopup = closeThanksPopup;
window.toggleMusic = toggleMusic;
window.selectProduct = selectProduct;
window.startPayment = startPayment;
window.sendPaymentProof = sendPaymentProof;
window.cancelPayment = cancelPayment;
window.closeBuyBox = closeBuyBox;

// Hubungkan tombol inline AI & Music
document.getElementById("inlineAiBtn")?.addEventListener("click", () => {
  showAIChat();
});
document.getElementById("inlineMusicBtn")?.addEventListener("click", () => {
  toggleMusic();
});

// WELCOME SCREEN LOGIC dengan video Catbox terbaru
document.getElementById("welcomeBtn").addEventListener("click", () => {
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("loaderScreen").style.display = "flex";
  setTimeout(() => {
    document.getElementById("loaderScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
    showHome();
    setActive(0);
  }, 1800);
});

// Load data dari Google Sheets
loadProductsFromSheet();
initMusic();
