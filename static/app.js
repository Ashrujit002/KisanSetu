const app = document.querySelector("#app");
const state = {
  token: localStorage.getItem("agri_token") || "",
  user: JSON.parse(localStorage.getItem("agri_user") || "null"),
  view: "dashboard",
  selectedCentre: null,
  selectedSlot: null,
  selectedBooking: null,
  loginRole: "FARMER",
  loginScreen: "select",
  cache: {},
  poller: null,
};

const labels = {
  FARMER: "Farmer",
  BUYER: "Procurement Centre",
  ADMIN: "Administrator",
};
const icons = {
  dashboard: "▦",
  centres: "⌖",
  booking: "＋",
  queue: "◉",
  crops: "🌾",
  payments: "₹",
  bookings: "▤",
  verifications: "✓",
  map: "⌖",
};
const esc = (value = "") =>
  String(value).replace(
    /[&<>'"]/g,
    (letter) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        letter
      ],
  );
const money = (value = 0) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const statusClass = (value = "") => value.toLowerCase().replaceAll("_", " ");
const badge = (value) =>
  `<span class="badge ${statusClass(value)}">${esc(value.replaceAll("_", " "))}</span>`;
const verified = (value = "VERIFIED") =>
  `<span class="verification ${value === "VERIFIED" ? "verified" : "pending"}">${value === "VERIFIED" ? "✓ Verified" : "● Pending verification"}</span>`;

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || "We could not complete that request. Please try again.",
    );
  return data;
}
function toast(message) {
  const region = document.querySelector("#toast-region");
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  region.append(element);
  setTimeout(() => element.remove(), 3600);
}
function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("agri_token", token);
  localStorage.setItem("agri_user", JSON.stringify(user));
}
function logout() {
  localStorage.removeItem("agri_token");
  localStorage.removeItem("agri_user");
  state.token = "";
  state.user = null;
  state.cache = {};
  state.view = "dashboard";
  clearInterval(state.poller);
  render();
}
function setView(view, item = null) {
  state.view = view;
  if (item?.id?.startsWith("CTR")) state.selectedCentre = item;
  if (item?.id?.startsWith("BK")) state.selectedBooking = item;
  clearInterval(state.poller);
  render();
}

function loginPage() {
  const registration = state.loginScreen === "register";
  const role = state.loginRole;
  return `<main class="login-shell">
    <section class="login-intro">
      <div class="brand"><span class="brand-mark">🌾</span>AgriProcure</div>
      <div class="hero-copy"><div class="eyebrow">Smart agricultural procurement</div><h1>Farm produce. Less waiting. More certainty.</h1><p>Book your visit, receive a digital token and follow every step from crop verification to a clearly marked demo payment.</p></div>
      <div class="hero-stats"><div><strong>186</strong><span>Demo centres</span></div><div><strong>12,450</strong><span>Registered farmers</span></div><div><strong>7 min</strong><span>Average processing</span></div></div>
    </section>
    <section class="login-panel">
      <span class="demo-pill">● DEMO MODE · NO REAL PAYMENTS</span>
      ${registration ? registerMarkup(role) : loginMarkup(role)}
      <div class="login-footer">Prototype verification, documents and payment references are simulated for demonstration.</div>
    </section>
  </main>`;
}
function loginMarkup(role) {
  return `<h2>${state.loginScreen === "select" ? "Welcome to AgriProcure" : `Sign in as ${labels[role]}`}</h2>
    <p>${state.loginScreen === "select" ? "Choose how you want to use the platform." : "Use a demo account below, or enter your login details."}</p>
    ${
      state.loginScreen === "select"
        ? `<div class="role-grid">
      <button class="role-card" data-role="FARMER"><span class="role-icon">👨‍🌾</span><strong>SELLER / FARMER</strong><span>Sell crops with a digital token.</span><b>Continue →</b></button>
      <button class="role-card" data-role="BUYER"><span class="role-icon">🏢</span><strong>BUYER / CENTRE</strong><span>Manage procurement and queues.</span><b>Continue →</b></button>
    </div><button class="ghost-btn full" style="margin-top:12px" data-role="ADMIN">🔐 Admin Login</button>`
        : `<form id="login-form" class="login-form">
      <label>Email<input name="email" type="email" placeholder="name@example.local" required /></label>
      <label>Password<input name="password" type="password" placeholder="Enter password" required /></label>
      <button class="primary-btn full" type="submit">Sign in as ${labels[role]} →</button>
      <button class="ghost-btn full small" type="button" id="back-role">← Choose another role</button>
    </form>
    <div class="login-divider">QUICK DEMO ACCESS</div>
    <div class="demo-logins">
      <button class="demo-login" data-demo="FARMER"><span>👨‍🌾 Demo Farmer</span><small>farmer@demo.local</small></button>
      <button class="demo-login" data-demo="BUYER"><span>🏢 Demo Buyer</span><small>buyer@demo.local</small></button>
      <button class="demo-login" data-demo="ADMIN"><span>🔐 Demo Admin</span><small>admin@demo.local</small></button>
    </div>
    <p style="text-align:center;font-size:12px;margin-top:20px">New here? <button id="register-link" style="background:none;color:var(--green);font-weight:800;padding:0">Create a demo account</button></p>`
    }`;
}
function registerMarkup(role) {
  const buyer = role === "BUYER";
  return `<h2>${buyer ? "Register your centre" : "Create farmer profile"}</h2><p>${buyer ? "Your centre will remain pending until an admin completes a demo review." : "The prototype only collects the last four Aadhaar digits, never a full number."}</p>
  <div class="filters" style="margin-bottom:16px"><button class="${role === "FARMER" ? "primary-btn" : "ghost-btn"} small" data-register-role="FARMER">👨‍🌾 Farmer</button><button class="${role === "BUYER" ? "primary-btn" : "ghost-btn"} small" data-register-role="BUYER">🏢 Procurement centre</button></div>
  <form id="register-form" class="form-grid">
    <div class="form-group"><label>${buyer ? "Organization name" : "Full name"} *</label><input name="name" required placeholder="${buyer ? "Example Agri Cooperative" : "Your full name"}" /></div>
    <div class="form-group"><label>Email *</label><input type="email" name="email" required placeholder="you@example.local" /></div>
    <div class="form-group"><label>Mobile number</label><input name="phone" inputmode="tel" placeholder="98765 43210" /></div>
    <div class="form-group"><label>State</label><input name="state" value="West Bengal" /></div>
    <div class="form-group"><label>District</label><input name="district" value="North 24 Parganas" /></div>
    ${buyer ? `<div class="form-group"><label>Contact person</label><input name="contact" placeholder="Authorized contact" /></div><div class="form-group full-span"><label>Procurement centre name *</label><input name="centreName" required placeholder="Example Grain Procurement Centre" /></div><div class="form-group"><label>Maximum daily capacity</label><input name="capacity" type="number" value="60" min="1" /></div><div class="form-group"><label>Supported crop</label><select name="crop"><option>Paddy</option><option>Wheat</option><option>Maize</option><option>Potato</option></select></div><div class="form-group full-span"><label>Address</label><input name="address" placeholder="Centre address (demo)" /></div><div class="form-group"><label>Registration certificate no.</label><input name="certificate" placeholder="DEMO-REG-2026-001" /></div><div class="form-group"><label>Working hours</label><input name="hours" value="09:00 AM – 04:00 PM" /></div>` : `<div class="form-group"><label>Block / village</label><input name="village" placeholder="Village name" /></div><div class="form-group"><label>Aadhaar last 4 digits only</label><input name="aadhaarLast4" maxlength="4" inputmode="numeric" placeholder="0000" /></div><div class="form-group"><label>Land ownership</label><select name="ownership"><option>Own land</option><option>Tenant farmer</option><option>Joint ownership</option></select></div><div class="form-group"><label>Cultivated area</label><input name="area" placeholder="e.g. 2.5 acres" /></div>`}
    <div class="form-group full-span"><label>Password *</label><input type="password" name="password" required minlength="6" placeholder="At least 6 characters" /></div>
    <div class="form-group full-span"><button class="primary-btn full" type="submit">${buyer ? "Submit centre application" : "Create farmer account"} →</button><p class="form-help">${buyer ? "DEMO verification only — document uploads and authority checks are simulated." : "Your profile will be created as a prototype record."}</p></div>
  </form>
  <p style="text-align:center;font-size:12px;margin:16px 0 0">Already registered? <button id="login-link" style="background:none;color:var(--green);font-weight:800;padding:0">Sign in</button></p>`;
}

const navigation = {
  FARMER: [
    ["dashboard", "Overview"],
    ["centres", "Find Centre"],
    ["booking", "Book a Slot"],
    ["queue", "Track Queue"],
    ["crops", "My Crops"],
    ["payments", "Payments"],
  ],
  BUYER: [
    ["dashboard", "Overview"],
    ["queue", "Live Queue"],
    ["bookings", "Bookings"],
    ["payments", "Payments"],
  ],
  ADMIN: [
    ["dashboard", "Overview"],
    ["verifications", "Verification requests"],
    ["centres", "Centres"],
    ["map", "Centre map"],
  ],
};
function appShell(content, subtitle = "") {
  const role = state.user.role;
  const nav = navigation[role]
    .map(
      ([key, label]) =>
        `<button class="nav-button ${state.view === key ? "active" : ""}" data-nav="${key}"><span class="nav-icon">${icons[key]}</span>${label}</button>`,
    )
    .join("");
  const title =
    {
      dashboard: "Dashboard",
      centres:
        role === "FARMER" ? "Find Procurement Centre" : "Procurement Centres",
      booking: "Book Procurement Slot",
      queue: role === "BUYER" ? "Live Queue Management" : "Track Your Queue",
      crops: "My Crops",
      payments: "Payments & Procurement",
      bookings: "Farmer Bookings",
      verifications: "Verification Requests",
      map: "Procurement Centre Map",
    }[state.view] || "AgriProcure";
  return `<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark">🌾</span>AgriProcure</div><div class="side-label">${labels[role].toUpperCase()} PORTAL</div><nav class="nav-list">${nav}</nav><div class="sidebar-bottom"><div class="demo-chip">● DEMO MODE ENABLED</div><div class="account-mini"><div class="avatar">${esc(state.user.name).slice(0, 1)}</div><div><strong>${esc(state.user.name)}</strong><span>${labels[role]}</span></div><button class="logout" title="Log out" id="logout-button">↪</button></div></div></aside><main class="main"><header class="topbar"><button class="mobile-menu" id="mobile-menu">☰</button><div class="page-intro"><h1>${title}</h1><p>${subtitle || "Agricultural procurement, made easier."}</p></div><div class="top-actions"><select class="language" aria-label="Language"><option>English</option><option>বাংলা</option><option>हिन्दी</option></select><button class="notification-bell" id="notification-button" title="Notifications">🔔<i class="dot"></i></button></div></header><div class="content">${content}</div></main></div>`;
}

async function farmerDashboard() {
  const data = await api("/api/dashboard");
  state.cache.dashboard = data;
  const booking = data.booking;
  const queue = data.queue;
  const stats = booking
    ? [
        ["🎫", "Active booking", booking.token],
        ["◉", "Queue position", String(queue.peopleAhead + 1)],
        ["◷", "Estimated waiting", `${queue.estimatedMinutes} min`],
        ["◒", "Procurement", booking.procurement?.status || "Booked"],
        ["₹", "Payment", booking.payment?.status || "Pending"],
      ]
    : [
        ["🎫", "Active booking", "None"],
        ["◉", "Queue position", "—"],
        ["◷", "Estimated waiting", "—"],
        ["◒", "Procurement", "—"],
        ["₹", "Payment", "—"],
      ];
  return `<section class="welcome-banner"><div><div class="eyebrow" style="margin-bottom:7px">Good morning, ${esc(data.user.name.split(" ")[0])} 👋</div><h2>Your produce journey, in one place.</h2><p>${verified(data.user.verification || "VERIFIED")} &nbsp; ${esc(data.user.farmerId || "DEMO FARMER")}</p></div><div class="banner-id">Farmer ID<strong>${esc(data.user.farmerId || "FRM-DEMO")}</strong></div></section>
  <section class="stat-grid">${stats.map(([icon, label, value]) => `<article class="stat-card"><div class="stat-icon">${icon}</div><span>${label}</span><strong>${esc(value)}</strong>${label === "Estimated waiting" ? "<small>Updated from live queue</small>" : ""}</article>`).join("")}</section>
  <div class="dashboard-grid"><section class="card queue-hero"><div class="section-heading" style="margin:0"><div><h2>Today’s procurement token</h2><p>${booking ? esc(booking.centre.name) : "Book a centre to receive your digital token."}</p></div>${booking ? badge(booking.status) : ""}</div>${booking ? `<div class="token-row"><div><span style="font-size:11px;color:var(--muted)">YOUR TOKEN</span><div class="token-main">${booking.token}</div></div><span class="arrow">→</span><div><span style="font-size:11px;color:var(--muted)">NOW SERVING</span><div class="token-main">${queue.nowServing}</div></div></div><div class="queue-details"><div class="queue-detail"><span>People ahead</span><strong>${queue.peopleAhead}</strong></div><div class="queue-detail"><span>Est. wait</span><strong>${queue.estimatedMinutes} min</strong></div><div class="queue-detail"><span>Slot</span><strong>${esc(booking.time)}</strong></div><div class="queue-detail"><span>Date</span><strong>05 Sep</strong></div></div>` : `<div class="empty"><p>No active booking yet.</p><button class="primary-btn small" data-action="go-book">Book procurement slot</button></div>`}</section>
  <section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Quick actions</h2><p>Start with what you need today.</p></div></div><div class="quick-grid"><button class="quick-action" data-nav="booking"><span>＋</span>Book slot</button><button class="quick-action" data-nav="centres"><span>⌖</span>Find centre</button><button class="quick-action" data-nav="queue"><span>◉</span>Track queue</button><button class="quick-action" data-nav="crops"><span>🌾</span>My crops</button><button class="quick-action" data-nav="payments"><span>₹</span>Payment status</button><button class="quick-action" data-action="open-notifications"><span>🔔</span>Updates</button></div></section></div>
  <div class="dashboard-grid"><section class="card"><div class="section-heading"><div><h2>Recommended for you</h2><p>Sorted using distance, queue, availability and verification.</p></div><button class="ghost-btn small" data-nav="centres">View all</button></div><div class="centre-grid">${data.recommendations.map(centreCard).join("")}</div></section><section class="card"><div class="section-heading"><div><h2>Recent updates</h2><p>In-app notifications</p></div></div><div class="notification-list">${data.notifications.map(notice).join("")}</div></section></div>`;
}
function centreCard(centre) {
  const util =
    centre.utilization ?? Math.round((centre.booked / centre.capacity) * 100);
  const availability = centre.availability ?? centre.capacity - centre.booked;
  const level = util > 95 ? "danger" : util > 85 ? "warn" : "";
  return `<article class="centre-card"><div style="display:flex;justify-content:space-between;gap:8px">${verified(centre.verified)}<span style="font-size:11px;color:var(--muted)">${centre.distance ? `⌖ ${centre.distance} km` : ""}</span></div><h3>${esc(centre.name)}</h3><p class="meta">📍 ${esc(centre.locality || centre.district)}</p><div class="crop-tags">${centre.crops.map((crop) => `<span class="crop-tag">🌾 ${crop}</span>`).join("")}</div><div class="centre-facts"><div>Current queue<strong>${centre.queue} farmers</strong></div><div>Estimated wait<strong>${centre.estimatedWait ?? centre.queue * centre.processingTime} min</strong></div></div><div class="utilization"><div class="util-row"><span>${availability} slots available</span><strong>${util}% utilized</strong></div><div class="progress ${level}"><span style="width:${util}%"></span></div></div><div class="card-actions" style="margin-top:15px"><button class="ghost-btn small" data-centre="${centre.id}">View centre</button><button class="primary-btn small" data-book-centre="${centre.id}">Book slot</button></div></article>`;
}
function notice(item) {
  const type =
    {
      BOOKING: "✓",
      QUEUE: "◉",
      PROCUREMENT: "📦",
      PAYMENT: "₹",
      CENTRE: "⌖",
      SYSTEM: "⚙",
    }[item.type] || "●";
  return `<article class="notice"><span class="notice-icon">${type}</span><div><strong>${esc(item.title)}</strong><p>${esc(item.message)}</p><time>${esc(item.time)}</time></div></article>`;
}

async function centresPage() {
  const centres = await api("/api/centres");
  state.cache.centres = centres;
  return `<div class="section-heading" style="margin-top:0"><div><h2>Verified procurement centres</h2><p>Only admin-verified demo centres are shown to farmers.</p></div><span class="demo-pill">✓ VERIFIED ONLY</span></div><div class="filters"><input class="search-input" id="centre-search" placeholder="Search by centre or district" /><select id="crop-filter"><option>All crops</option><option>Paddy</option><option>Wheat</option><option>Maize</option><option>Mustard</option><option>Potato</option><option>Pulses</option></select><select id="availability-filter"><option value="all">All availability</option><option value="open">Accepting bookings</option><option value="low">Low queue (under 10)</option></select></div><div class="centre-grid" id="centre-results">${centres.map(centreCard).join("")}</div>`;
}
async function centreDetailPage() {
  let centre = state.selectedCentre;
  if (!centre) {
    const all = state.cache.centres || (await api("/api/centres"));
    centre = all[0];
  }
  const data = await api(`/api/centres/${centre.id}`);
  state.selectedCentre = data;
  const utilStatus =
    data.utilization > 95
      ? "🔴 Near capacity"
      : data.utilization > 85
        ? "🟠 High demand"
        : "🟢 Normal demand";
  return `<button class="ghost-btn small" data-nav="centres">← Back to centres</button><div class="split-grid" style="margin-top:15px"><section class="card"><div style="display:flex;justify-content:space-between;gap:12px">${verified(data.verified)}<span class="demo-pill">DEMO CENTRE</span></div><h2 class="detail-title">${esc(data.name)}</h2><p class="detail-sub">📍 ${esc(data.locality)} · ${esc(data.address)}</p><div class="crop-tags" style="margin-top:16px">${data.crops.map((crop) => `<span class="crop-tag">🌾 ${crop}</span>`).join("")}</div><div class="detail-facts"><div class="detail-fact"><span>Working hours</span><strong>${esc(data.hours)}</strong></div><div class="detail-fact"><span>Daily capacity</span><strong>${data.capacity} farmers</strong></div><div class="detail-fact"><span>Current queue</span><strong>${data.queue} farmers</strong></div><div class="detail-fact"><span>Estimated waiting</span><strong>${data.estimatedWait} minutes</strong></div></div><div class="utilization"><div class="util-row"><span>Centre utilization</span><strong>${data.utilization}% · ${utilStatus}</strong></div><div class="progress ${data.utilization > 95 ? "danger" : data.utilization > 85 ? "warn" : ""}"><span style="width:${data.utilization}%"></span></div></div><p class="form-help">Recommendation score is based on demo distance, crop compatibility, queue and availability.</p></section><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Today’s available slots</h2><p>Select a time to continue booking.</p></div></div><div class="slot-list">${data.slots.map((slot) => `<button class="slot ${slot.booked >= slot.total ? "full" : ""}" ${slot.booked >= slot.total ? "disabled" : ""} data-slot="${slot.id}" data-centre-slot="${data.id}"><span class="slot-time">${slot.time}</span><small>${slot.booked}/${slot.total} booked</small>${slot.booked >= slot.total ? '<span class="badge cancelled">Full</span>' : '<span class="badge verified">Available</span>'}</button>`).join("")}</div><button class="primary-btn full" style="margin-top:16px" data-book-centre="${data.id}">Book at this centre →</button></section></div>`;
}
async function bookingPage() {
  const centres = state.cache.centres || (await api("/api/centres"));
  let centre = state.selectedCentre || centres[0];
  if (!centre.id || !centre.id.startsWith("CTR")) centre = centres[0];
  const detail = await api(`/api/centres/${centre.id}`);
  state.selectedCentre = detail;
  const selected =
    state.selectedSlot || detail.slots.find((slot) => slot.booked < slot.total);
  return `<div class="booking-layout"><aside class="card"><div class="section-heading" style="margin-top:0"><div><h2>Simple booking</h2><p>Six clear steps</p></div></div><div class="steps"><div class="step active"><span class="step-num">1</span>Select crop</div><div class="step active"><span class="step-num">2</span>Enter quantity</div><div class="step active"><span class="step-num">3</span>Choose centre</div><div class="step active"><span class="step-num">4</span>Select date</div><div class="step active"><span class="step-num">5</span>Select time</div><div class="step"><span class="step-num">6</span>Receive your token</div></div><div class="card" style="padding:13px;margin-top:17px;background:#f9fcf6"><strong style="font-size:12px">Why this centre?</strong><p class="form-help">${centre.queue} in queue · ${centre.capacity - centre.booked} available · ${centre.distance || "4.2"} km away · verified.</p></div></aside><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Book a procurement slot</h2><p>All numbers and rates are demo values.</p></div><span class="verification verified">✓ Verified centre</span></div><form id="booking-form" class="form-grid"><div class="form-group"><label>Crop</label><select name="crop"><option>Paddy</option><option>Wheat</option><option>Maize</option><option>Mustard</option><option>Potato</option><option>Pulses</option></select></div><div class="form-group"><label>Crop variety</label><input name="variety" value="Swarna" /></div><div class="form-group"><label>Quantity</label><input name="quantity" type="number" value="800" min="1" /></div><div class="form-group"><label>Unit</label><select name="unit"><option>kg</option><option>quintal</option></select></div><div class="form-group"><label>Procurement centre</label><select name="centreId" id="booking-centre">${centres.map((item) => `<option value="${item.id}" ${item.id === centre.id ? "selected" : ""}>${esc(item.name)}</option>`).join("")}</select></div><div class="form-group"><label>Booking date</label><input name="date" type="date" value="2026-09-05" /></div><div class="form-group full-span"><label>Available time</label><div class="slot-list" id="booking-slots">${detail.slots.map((slot) => `<button type="button" class="slot ${slot.id === selected?.id ? "selected" : ""} ${slot.booked >= slot.total ? "full" : ""}" ${slot.booked >= slot.total ? "disabled" : ""} data-book-slot="${slot.id}"><span class="slot-time">${slot.time}</span><small>${slot.booked}/${slot.total} booked</small>${slot.booked >= slot.total ? '<span class="badge cancelled">Full</span>' : '<span class="badge verified">Available</span>'}</button>`).join("")}</div></div><div class="form-group full-span"><input type="hidden" name="slotId" value="${selected?.id || ""}" /><button class="primary-btn full" type="submit" ${selected ? "" : "disabled"}>Confirm booking & generate token →</button><p class="form-help">You will receive an in-app notification and a QR-style token after confirmation.</p></div></form></section></div>`;
}
function bookingSuccess(booking) {
  const qr = [
    "██  ████  ██",
    "  ██  ██  █ ",
    "████  ██ ███",
    "██  ███  ██ ",
    " ███  ███   ",
  ].join("<br>");
  return `<section class="card booking-confirm"><div class="success-orb">✓</div><h2>Booking confirmed</h2><p>Your digital procurement token is ready. This is a prototype booking.</p><div class="booking-id"><div><span>Booking ID</span><strong>${booking.id}</strong></div><div><span>Token</span><strong>${booking.token}</strong></div><div><span>Date</span><strong>05 September 2026</strong></div><div><span>Time</span><strong>${booking.time}</strong></div><div style="grid-column:1/-1;border-right:0"><span>Centre</span><strong>${esc(booking.centre.name)}</strong></div></div><div class="qr" aria-label="Demo QR code">${qr}</div><p class="form-help">QR-style display only — it is not a scannable real identity credential.</p><div style="display:flex;justify-content:center;gap:9px"><button class="ghost-btn" data-nav="queue">Track live queue</button><button class="primary-btn" data-nav="dashboard">Go to dashboard</button></div></section>`;
}

async function queuePage() {
  const bookings = await api("/api/bookings");
  const booking =
    state.selectedBooking ||
    bookings.find((item) => item.status !== "COMPLETED") ||
    bookings[0];
  if (!booking)
    return `<section class="card empty"><h2>No queue to track yet</h2><p>Book a verified procurement centre to receive a token.</p><button class="primary-btn" data-nav="centres">Find a centre</button></section>`;
  state.selectedBooking = booking;
  const queue = await api(`/api/queue/${booking.id}`);
  if (state.user.role === "BUYER") return buyerQueuePage(bookings, queue);
  const timeline = [
    ["Booking Confirmed", true, "Your digital token has been created."],
    [
      "Farmer Checked In",
      ["CHECKED_IN", "WAITING", "CALLED", "PROCESSING", "COMPLETED"].includes(
        booking.status,
      ),
      "Centre arrival recorded.",
    ],
    [
      "Crop Verification",
      !!booking.procurement,
      booking.procurement?.accepted
        ? "Crop accepted in demo review."
        : "Awaiting centre review.",
    ],
    [
      "Weight Recorded",
      !!booking.procurement?.measuredQuantity,
      booking.procurement?.measuredQuantity
        ? `${booking.procurement.measuredQuantity} kg recorded.`
        : "Pending measurement.",
    ],
    [
      "Procurement Completed",
      booking.procurement?.status === "COMPLETED",
      "Procurement completed.",
    ],
    [
      "Payment Processing",
      booking.payment?.status === "PROCESSING" ||
        booking.payment?.status === "COMPLETED",
      booking.payment?.status === "COMPLETED"
        ? "Demo payment completed."
        : "Payment is awaiting processing.",
    ],
    [
      "Payment Completed",
      booking.payment?.status === "COMPLETED",
      booking.payment?.transactionId || "Not completed yet.",
    ],
  ];
  return `<div class="split-grid"><section class="card queue-board"><h3>Now serving</h3><div class="now-token">${queue.nowServing}</div><span class="now-label">at ${esc(booking.centre.name)}</span><div class="queue-details" style="margin-top:21px"><div class="queue-detail" style="color:var(--ink)"><span>Your token</span><strong>${queue.yourToken}</strong></div><div class="queue-detail" style="color:var(--ink)"><span>People ahead</span><strong>${queue.peopleAhead}</strong></div><div class="queue-detail" style="color:var(--ink)"><span>Estimated wait</span><strong>${queue.estimatedMinutes} min</strong></div><div class="queue-detail" style="color:var(--ink)"><span>Average time</span><strong>${queue.averageProcessingTime} min</strong></div></div><p style="font-size:11px;color:#c6e0cc;margin:17px 0 0">Updates poll automatically in this prototype. Waiting time = people ahead × average processing time.</p></section><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Procurement status</h2><p>Every stage is visible to you.</p></div>${badge(booking.status)}</div><div class="timeline">${timeline.map(([title, done, copy], index) => `<div class="timeline-item ${done ? "done" : index === timeline.findIndex((item) => !item[1]) ? "current" : ""}"><div class="timeline-dot">${done ? "✓" : index === timeline.findIndex((item) => !item[1]) ? "◷" : "○"}</div><div class="timeline-copy"><strong>${title}</strong><span>${copy}</span></div></div>`).join("")}</div></section></div><section class="card" style="margin-top:18px"><div class="section-heading" style="margin-top:0"><div><h2>Live queue</h2><p>Tokens at this procurement centre</p></div></div><div class="queue-list">${queue.queue.map((item) => `<div class="queue-row"><span class="queue-token">${item.token}</span><div class="queue-name"><strong>${item.token === booking.token ? "Your token" : "Farmer token"}</strong><span>${item.token === booking.token ? "Your queue position is live." : "Demo queue entry"}</span></div>${badge(item.status)}</div>`).join("")}</div></section>`;
}
function buyerQueuePage(bookings) {
  const active = bookings.filter((item) =>
    ["WAITING", "CHECKED_IN", "PROCESSING", "BOOKED"].includes(item.status),
  );
  const processing = active.find((item) => item.status === "PROCESSING");
  return `<section class="welcome-banner"><div><div class="eyebrow" style="margin-bottom:6px">Centre operations · demo mode</div><h2>${esc(state.cache.dashboard?.centre?.short || "Procurement Centre")}</h2><p>${verified("VERIFIED")} &nbsp; Live queue updates are visible to farmers.</p></div><div class="banner-id">Currently processing<strong>${processing?.token || "—"}</strong></div></section><div class="dashboard-grid" style="margin-top:19px"><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Live queue</h2><p>Call, check in, or complete a farmer’s procurement.</p></div><button class="primary-btn small" data-action="call-next">Call next waiting</button></div><div class="queue-list">${active.map((item) => `<div class="queue-row"><span class="queue-token">${item.token}</span><div class="queue-name"><strong>${esc(item.farmer?.name || "Farmer")}</strong><span>${item.crop} · ${item.quantity} ${item.unit} · ${item.time}</span></div>${badge(item.status)}<div style="display:flex;gap:5px">${item.status === "BOOKED" ? `<button class="secondary-btn small" data-queue-action="CHECK_IN" data-booking="${item.id}">Check in</button>` : ""}${["WAITING", "CHECKED_IN"].includes(item.status) ? `<button class="primary-btn small" data-queue-action="CALL" data-booking="${item.id}">Call</button>` : ""}${item.status === "PROCESSING" ? `<button class="primary-btn small" data-queue-action="COMPLETE" data-booking="${item.id}">Complete</button>` : ""}</div></div>`).join("")}</div></section><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Queue help</h2><p>Prototype workflow</p></div></div><div class="timeline"><div class="timeline-item done"><div class="timeline-dot">✓</div><div class="timeline-copy"><strong>Check in farmer</strong><span>BOOKED → WAITING</span></div></div><div class="timeline-item current"><div class="timeline-dot">◷</div><div class="timeline-copy"><strong>Call next token</strong><span>WAITING → PROCESSING</span></div></div><div class="timeline-item"><div class="timeline-dot">○</div><div class="timeline-copy"><strong>Record crop & weight</strong><span>Process accepted crop.</span></div></div><div class="timeline-item"><div class="timeline-dot">○</div><div class="timeline-copy"><strong>Mark demo payment</strong><span>Processing → completed</span></div></div></div><div class="card" style="background:#f8fcf6;padding:13px"><strong style="font-size:12px">Average processing time</strong><p class="form-help">7 minutes per farmer, configurable in a production system.</p></div></section></div>`;
}

async function cropsPage() {
  const bookings = await api("/api/bookings");
  return `<div class="section-heading" style="margin-top:0"><div><h2>Registered crops</h2><p>Your crop declarations used for booking slots.</p></div><button class="primary-btn small" data-nav="booking">＋ Add crop & book</button></div><div class="centre-grid">${bookings.map((item) => `<article class="centre-card"><div style="font-size:26px">🌾</div><h3>${esc(item.crop)} <span style="font-size:11px;color:var(--muted);font-weight:600">${esc(item.variety || "Standard")}</span></h3><p class="meta">Harvest: 28 Aug 2026 · Expected sale: 05 Sep 2026</p><div class="centre-facts"><div>Declared quantity<strong>${item.quantity} ${item.unit}</strong></div><div>Estimated value<strong>${money(item.quantity * 23.69)}</strong></div></div><div class="card-actions"><button class="ghost-btn small" data-booking-view="${item.id}">View tracking</button>${badge(item.status)}</div></article>`).join("") || '<div class="empty">No crops have been added yet.</div>'}</div><p class="form-help" style="margin-top:17px">MSP/rate figures shown in this prototype are reference demo values and are not official seasonal notifications.</p>`;
}
async function paymentsPage() {
  const bookings = await api("/api/bookings");
  if (state.user.role === "BUYER")
    return `<div class="section-heading" style="margin-top:0"><div><h2>Payment tracking</h2><p>Complete authorised demo payment records after procurement.</p></div><span class="demo-pill">DEMO TRANSACTION MODE</span></div>${paymentTable(bookings, true)}`;
  return `<div class="section-heading" style="margin-top:0"><div><h2>Payments & procurement</h2><p>Payment records for your accepted produce.</p></div><span class="demo-pill">DEMO TRANSACTIONS</span></div>${paymentTable(bookings, false)}<p class="form-help" style="margin-top:14px">No bank transfer is performed. Transaction references are clearly labelled as DEMO.</p>`;
}
function paymentTable(bookings, buyer) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Booking / farmer</th><th>Crop</th><th>Accepted quantity</th><th>Rate</th><th>Amount</th><th>Status</th><th>${buyer ? "Action" : "Demo reference"}</th></tr></thead><tbody>${bookings
    .map((item) => {
      const p = item.payment;
      return `<tr><td><strong>${buyer ? esc(item.farmer?.name || "Farmer") : item.id}</strong><br><span style="font-size:10px;color:var(--muted)">${buyer ? item.token : esc(item.centre?.short || "")}</span></td><td>${esc(item.crop)}</td><td>${item.procurement?.measuredQuantity || "—"} ${item.unit}</td><td>${p ? money(p.rate) + "/kg" : "—"}</td><td>${p ? money(p.amount) : "—"}</td><td>${p ? badge(p.status) : badge("PENDING")}</td><td>${buyer && p?.status === "PROCESSING" ? `<button class="primary-btn small" data-payment="${item.id}">Complete demo payment</button>` : p?.transactionId ? `<span style="font-size:10px;color:var(--green);font-weight:800">${p.transactionId}</span>` : "—"}</td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}

async function buyerDashboard() {
  const data = await api("/api/dashboard");
  state.cache.dashboard = data;
  const { centre, stats } = data;
  const cards = [
    ["▦", "Total slots", stats.totalSlots],
    ["🎫", "Booked", stats.booked],
    ["✓", "Checked in", stats.checkedIn],
    ["◒", "Completed", stats.completed],
    ["◉", "Waiting", stats.waiting],
  ];
  return `<section class="welcome-banner"><div><div class="eyebrow" style="margin-bottom:6px">Centre operator portal</div><h2>${esc(centre.name)}</h2><p>${verified(centre.verified)} &nbsp; ${esc(centre.district)} · ${centre.hours}</p></div><div class="banner-id">Daily capacity<strong>${centre.capacity} farmers</strong></div></section><section class="stat-grid">${cards.map(([icon, label, value]) => `<article class="stat-card"><div class="stat-icon">${icon}</div><span>${label}</span><strong>${value}</strong><small>${label === "Waiting" ? "Live queue count" : "Today"}</small></article>`).join("")}</section><div class="dashboard-grid"><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Today’s procurement</h2><p>Prototype centre performance</p></div><span class="verification verified">🟢 Normal utilization</span></div><div class="chart">${[55, 72, 43, 82, 65, 90, 75].map((height, index) => `<div class="bar" style="height:${height}%"><small>${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small></div>`).join("")}</div><div class="queue-details"><div class="queue-detail"><span>Quantity procured</span><strong>${stats.quantity} qtl</strong></div><div class="queue-detail"><span>Procurement value</span><strong>${money(stats.procurement)}</strong></div><div class="queue-detail"><span>Pending payments</span><strong>${money(stats.pendingPayments)}</strong></div><div class="queue-detail"><span>Utilization</span><strong>${Math.round((centre.booked / centre.capacity) * 100)}%</strong></div></div></section><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Next action</h2><p>Keep the queue moving.</p></div></div><div class="queue-list">${data.bookings
    .filter((item) => item.status !== "COMPLETED")
    .slice(0, 4)
    .map(
      (item) =>
        `<div class="queue-row"><span class="queue-token">${item.token}</span><div class="queue-name"><strong>${esc(item.farmer?.name || "")}</strong><span>${item.crop} · ${item.quantity} kg</span></div>${badge(item.status)}</div>`,
    )
    .join(
      "",
    )}</div><button class="primary-btn full" style="margin-top:15px" data-nav="queue">Open live queue →</button></section></div>`;
}
async function bookingsPage() {
  const bookings = await api("/api/bookings");
  return `<div class="section-heading" style="margin-top:0"><div><h2>Farmer bookings</h2><p>Bookings are visible only to your procurement centre.</p></div><button class="ghost-btn small" data-nav="queue">Manage queue</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Token</th><th>Farmer</th><th>Crop</th><th>Quantity</th><th>Time</th><th>Queue status</th><th>Process</th></tr></thead><tbody>${bookings.map((item) => `<tr><td><strong>${item.token}</strong><br><span style="font-size:10px;color:var(--muted)">${item.id}</span></td><td>${esc(item.farmer?.name || "Farmer")}<br><span style="font-size:10px;color:var(--muted)">${item.farmer?.farmerId || ""}</span></td><td>${item.crop}</td><td>${item.quantity} ${item.unit}</td><td>${item.time}</td><td>${badge(item.status)}</td><td>${item.status === "PROCESSING" ? `<button class="primary-btn small" data-queue-action="COMPLETE" data-booking="${item.id}">Verify & complete</button>` : `<button class="ghost-btn small" data-booking-view="${item.id}">View</button>`}</td></tr>`).join("")}</tbody></table></div>`;
}

async function adminDashboard() {
  const data = await api("/api/dashboard");
  state.cache.dashboard = data;
  const kpis = [
    ["Total Farmers", data.stats.totalFarmers],
    ["Verified Farmers", data.stats.verifiedFarmers],
    ["Registered Centres", data.stats.centres],
    ["Verified Centres", data.stats.verifiedCentres],
    ["Today’s Bookings", data.stats.bookings],
    ["Pending Payments", money(data.stats.pendingPayments)],
  ];
  return `<section class="welcome-banner"><div><div class="eyebrow" style="margin-bottom:6px">AgriProcure platform control</div><h2>Good morning, Administrator 👋</h2><p>Monitor demo verification, procurement centres and operations in one place.</p></div><div class="banner-id">Pending verifications<strong>${data.verificationRequests.length}</strong></div></section><section class="admin-kpis" style="margin:20px 0">${kpis.map(([label, value]) => `<article class="admin-kpi"><span>${label}</span><strong>${value}</strong></article>`).join("")}</section><div class="dashboard-grid"><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Daily bookings</h2><p>Demo platform activity</p></div><span class="badge verified">↑ 12.4%</span></div><div class="chart">${[45, 65, 55, 80, 72, 92, 85].map((height, index) => `<div class="bar" style="height:${height}%"><small>${["26 Aug", "27 Aug", "28 Aug", "29 Aug", "30 Aug", "31 Aug", "01 Sep"][index]}</small></div>`).join("")}</div></section><section class="card"><div class="section-heading" style="margin-top:0"><div><h2>Verification requests</h2><p>Needs your attention</p></div><button class="ghost-btn small" data-nav="verifications">View all</button></div><div class="notification-list">${data.verificationRequests
    .slice(0, 3)
    .map(
      (request) =>
        `<div class="notice"><span class="notice-icon">🏢</span><div><strong>${esc(request.centre?.name || "Pending procurement centre")}</strong><p>${esc(request.stage)} · Submitted ${request.submitted}</p><button class="secondary-btn small" style="margin-top:7px" data-review="${request.id}">Review request</button></div></div>`,
    )
    .join(
      "",
    )}</div></section></div><section class="card" style="margin-top:18px"><div class="section-heading" style="margin-top:0"><div><h2>Centre utilization</h2><p>High demand centres are highlighted for action.</p></div><button class="ghost-btn small" data-nav="centres">View centres</button></div><div class="centre-grid">${data.centres
    .filter((centre) => centre.verified === "VERIFIED")
    .slice(0, 3)
    .map(centreCard)
    .join("")}</div></section>`;
}
async function verificationsPage() {
  const requests = await api("/api/admin/verifications");
  state.cache.verifications = requests;
  return `<div class="section-heading" style="margin-top:0"><div><h2>Verification requests</h2><p>Review fictional/demo registration information before verification.</p></div><span class="demo-pill">PROTOTYPE VERIFICATION</span></div><section class="card"><div class="filters"><input class="search-input" placeholder="Search request or centre" /><select><option>All pending</option><option>Document Verification</option><option>Location Verification</option><option>Authority Verification</option></select></div>${requests.map((request) => `<article class="verification-card"><div class="vr-icon">🏢</div><div class="verification-main"><h3>${esc(request.centre.name)}</h3><p>Type: Authorized Procurement Centre · ${esc(request.centre.district)} · Submitted: ${request.submitted}</p><p style="margin-top:4px"><strong>${esc(request.stage)}</strong> &nbsp; ${badge(request.status)}</p></div><div style="display:flex;gap:7px"><button class="ghost-btn small" data-review="${request.id}">View details</button><button class="primary-btn small" data-approve="${request.id}">Approve</button><button class="danger-btn small" data-reject="${request.id}">Reject</button></div></article>`).join("")}</section>`;
}
async function adminCentresPage() {
  const centres = await api("/api/centres");
  return `<div class="section-heading" style="margin-top:0"><div><h2>Procurement centre monitoring</h2><p>Centre availability and utilization across the platform.</p></div></div><div class="centre-grid">${centres.map(centreCard).join("")}</div>`;
}
async function mapPage() {
  const centres = await api("/api/centres");
  return `<div class="section-heading" style="margin-top:0"><div><h2>Procurement centre map</h2><p>Illustrative map surface — no external map API is configured.</p></div><div class="crop-tags"><span class="crop-tag">🟢 Low queue</span><span class="crop-tag">🟡 Medium queue</span><span class="crop-tag">🔴 High queue</span></div></div><section class="map-surface">${centres
    .slice(0, 5)
    .map((centre, index) => {
      const coords = [
        [20, 28],
        [45, 55],
        [18, 70],
        [64, 32],
        [70, 72],
      ][index];
      return `<button class="map-marker ${centre.queue > 20 ? "high" : ""}" style="left:${coords[0]}%;top:${coords[1]}%" data-centre="${centre.id}" title="${esc(centre.name)}"></button><span class="map-label" style="left:${coords[0] + 3}%;top:${coords[1] + 8}%">${esc(centre.short)}<br><span style="font-weight:500;color:var(--muted)">${centre.queue} queue · ${centre.queue * centre.processingTime} min</span></span>`;
    })
    .join(
      "",
    )}</section><div class="centre-grid" style="margin-top:18px">${centres.slice(0, 3).map(centreCard).join("")}</div>`;
}

function notificationModal() {
  const notifications = state.cache.dashboard?.notifications || [];
  return `<div class="modal-backdrop" id="modal"><section class="modal"><div class="modal-head"><div><h2>Notifications</h2><p class="form-help">In-app updates for your demo account.</p></div><button class="modal-close" data-close-modal>×</button></div><div class="notification-list">${notifications.length ? notifications.map(notice).join("") : '<div class="empty">No new notifications.</div>'}</div></section></div>`;
}
function reviewModal(request) {
  const centre = request.centre;
  const stages = [
    "Registration Submitted",
    "Document Verification",
    "Location Verification",
    "Authority Verification",
    "Admin Approval",
  ];
  const completed = request.history || [];
  return `<div class="modal-backdrop" id="modal"><section class="modal"><div class="modal-head"><div><span class="verification pending">● ${request.status}</span><h2 style="margin-top:8px">${esc(centre.name)}</h2><p class="form-help">${esc(centre.district)} · ${esc(centre.organization || "Demo organization")}</p></div><button class="modal-close" data-close-modal>×</button></div><div class="detail-facts"><div class="detail-fact"><span>Authorized contact</span><strong>${esc(request.contact)}</strong></div><div class="detail-fact"><span>Certificate</span><strong>${esc(request.certificate)}</strong></div><div class="detail-fact"><span>Supported crops</span><strong>${centre.crops.join(", ")}</strong></div><div class="detail-fact"><span>Daily capacity</span><strong>${centre.capacity} farmers</strong></div><div class="detail-fact"><span>Demo document</span><strong>${esc(request.document)}</strong></div><div class="detail-fact"><span>Verification mode</span><strong>Prototype / mock review</strong></div></div><div class="stage-list">${stages.map((stage) => `<div class="stage ${completed.some((item) => item.includes(stage)) ? "done" : stage === request.stage ? "current" : ""}"><span class="stage-check">${completed.some((item) => item.includes(stage)) ? "✓" : stage === request.stage ? "◷" : "○"}</span>${stage}</div>`).join("")}</div><p class="form-help">No government authority, banking provider, Aadhaar service or land-record system is connected in this demo.</p><div class="card-actions"><button class="danger-btn" data-reject="${request.id}">✕ Reject centre</button><button class="primary-btn" data-approve="${request.id}">✓ Approve centre</button></div></section></div>`;
}

async function renderView() {
  let content = "";
  if (state.user.role === "FARMER") {
    if (state.view === "dashboard") content = await farmerDashboard();
    if (state.view === "centres") content = await centresPage();
    if (state.view === "centre-detail") content = await centreDetailPage();
    if (state.view === "booking") content = await bookingPage();
    if (state.view === "queue") content = await queuePage();
    if (state.view === "crops") content = await cropsPage();
    if (state.view === "payments") content = await paymentsPage();
  } else if (state.user.role === "BUYER") {
    if (state.view === "dashboard") content = await buyerDashboard();
    if (state.view === "queue") content = await queuePage();
    if (state.view === "bookings") content = await bookingsPage();
    if (state.view === "payments") content = await paymentsPage();
  } else {
    if (state.view === "dashboard") content = await adminDashboard();
    if (state.view === "verifications") content = await verificationsPage();
    if (state.view === "centres") content = await adminCentresPage();
    if (state.view === "map") content = await mapPage();
  }
  return appShell(
    content,
    state.view === "queue"
      ? "Status updates use a simple live demo queue."
      : "DEMO MODE · All records are fictional.",
  );
}

async function render() {
  try {
    if (!state.user || !state.token) {
      app.innerHTML = loginPage();
      bindLogin();
      return;
    }
    app.innerHTML =
      '<div class="empty" style="padding:80px">Loading your secure demo workspace…</div>';
    app.innerHTML = await renderView();
    bindApp();
    if (state.view === "queue" && state.user.role === "FARMER")
      state.poller = setInterval(() => {
        if (state.view === "queue") render();
      }, 14000);
  } catch (error) {
    if (/sign in/i.test(error.message)) {
      logout();
      toast("Your demo session expired. Please sign in again.");
    } else {
      app.innerHTML = appShell(
        `<section class="card empty"><h2>We couldn’t load this page</h2><p>${esc(error.message)}</p><button class="primary-btn" id="retry">Try again</button></section>`,
      );
      document.querySelector("#retry")?.addEventListener("click", render);
    }
  }
}
function bindLogin() {
  document.querySelectorAll("[data-role]").forEach((button) =>
    button.addEventListener("click", () => {
      state.loginRole = button.dataset.role;
      state.loginScreen = "login";
      render();
    }),
  );
  document.querySelectorAll("[data-demo]").forEach((button) =>
    button.addEventListener("click", async () => {
      try {
        const role = button.dataset.demo;
        const email = {
          FARMER: "farmer@demo.local",
          BUYER: "buyer@demo.local",
          ADMIN: "admin@demo.local",
        }[role];
        const result = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password: "demo123", role }),
        });
        saveSession(result.token, result.user);
        state.view = "dashboard";
        toast(`Signed in as Demo ${labels[role]}.`);
        render();
      } catch (error) {
        toast(error.message);
      }
    }),
  );
  document.querySelector("#back-role")?.addEventListener("click", () => {
    state.loginScreen = "select";
    render();
  });
  document.querySelector("#register-link")?.addEventListener("click", () => {
    state.loginScreen = "register";
    render();
  });
  document.querySelector("#login-link")?.addEventListener("click", () => {
    state.loginScreen = "login";
    render();
  });
  document.querySelectorAll("[data-register-role]").forEach((button) =>
    button.addEventListener("click", () => {
      state.loginRole = button.dataset.registerRole;
      render();
    }),
  );
  document
    .querySelector("#login-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      try {
        const result = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ ...values, role: state.loginRole }),
        });
        saveSession(result.token, result.user);
        state.view = "dashboard";
        render();
      } catch (error) {
        toast(error.message);
      }
    });
  document
    .querySelector("#register-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      if (state.loginRole === "BUYER") values.crops = [values.crop || "Paddy"];
      values.role = state.loginRole;
      try {
        const result = await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast(result.message);
        state.loginScreen = "login";
        render();
      } catch (error) {
        toast(error.message);
      }
    });
}
function bindApp() {
  document.querySelector("#logout-button")?.addEventListener("click", logout);
  document
    .querySelector("#mobile-menu")
    ?.addEventListener("click", () =>
      document.querySelector("#sidebar")?.classList.toggle("open"),
    );
  document
    .querySelectorAll("[data-nav]")
    .forEach((button) =>
      button.addEventListener("click", () => setView(button.dataset.nav)),
    );
  document.querySelectorAll("[data-centre]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = (state.cache.centres || []).find(
        (centre) => centre.id === button.dataset.centre,
      );
      state.selectedCentre = item || { id: button.dataset.centre };
      setView("centre-detail");
    }),
  );
  document.querySelectorAll("[data-book-centre]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = (state.cache.centres || []).find(
        (centre) => centre.id === button.dataset.bookCentre,
      );
      state.selectedCentre = item || { id: button.dataset.bookCentre };
      state.selectedSlot = null;
      setView("booking");
    }),
  );
  document.querySelectorAll("[data-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      state.selectedCentre = { id: button.dataset.centreSlot };
      state.selectedSlot = { id: button.dataset.slot };
      setView("booking");
    }),
  );
  document.querySelectorAll("[data-book-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      state.selectedSlot = { id: button.dataset.bookSlot };
      document
        .querySelectorAll("[data-book-slot]")
        .forEach((item) => item.classList.toggle("selected", item === button));
      document.querySelector('[name="slotId"]').value = button.dataset.bookSlot;
    }),
  );
  document
    .querySelector("#booking-centre")
    ?.addEventListener("change", (event) => {
      state.selectedCentre = { id: event.target.value };
      state.selectedSlot = null;
      render();
    });
  document
    .querySelector("#booking-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      try {
        const result = await api("/api/bookings", {
          method: "POST",
          body: JSON.stringify(values),
        });
        state.selectedBooking = result.booking;
        app.innerHTML = appShell(
          bookingSuccess(result.booking),
          "Your procurement booking is confirmed.",
        );
        bindApp();
        toast("Booking confirmed. Your token is ready.");
      } catch (error) {
        toast(error.message);
      }
    });
  document.querySelectorAll("[data-booking-view]").forEach((button) =>
    button.addEventListener("click", async () => {
      const items = await api("/api/bookings");
      state.selectedBooking = items.find(
        (item) => item.id === button.dataset.bookingView,
      );
      setView("queue");
    }),
  );
  document.querySelectorAll("[data-queue-action]").forEach((button) =>
    button.addEventListener("click", async () => {
      const action = button.dataset.queueAction;
      if (action === "COMPLETE") {
        openCompleteModal(button.dataset.booking);
        return;
      }
      try {
        await api(`/api/buyer/bookings/${button.dataset.booking}/action`, {
          method: "POST",
          body: JSON.stringify({ action }),
        });
        toast(
          action === "CALL"
            ? "Farmer token called. A notification was sent."
            : "Queue updated.",
        );
        render();
      } catch (error) {
        toast(error.message);
      }
    }),
  );
  document
    .querySelector('[data-action="call-next"]')
    ?.addEventListener("click", async () => {
      try {
        const bookings = await api("/api/bookings");
        const next = bookings.find((item) =>
          ["WAITING", "CHECKED_IN"].includes(item.status),
        );
        if (!next) return toast("No waiting farmers are available to call.");
        await api(`/api/buyer/bookings/${next.id}/action`, {
          method: "POST",
          body: JSON.stringify({ action: "CALL" }),
        });
        toast(`${next.token} is now processing.`);
        render();
      } catch (error) {
        toast(error.message);
      }
    });
  document.querySelectorAll("[data-payment]").forEach((button) =>
    button.addEventListener("click", async () => {
      try {
        await api(`/api/payments/${button.dataset.payment}/complete`, {
          method: "POST",
          body: "{}",
        });
        toast("Demo payment has been marked as completed.");
        render();
      } catch (error) {
        toast(error.message);
      }
    }),
  );
  document
    .querySelectorAll("[data-approve]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        verificationAction(button.dataset.approve, "approve"),
      ),
    );
  document
    .querySelectorAll("[data-reject]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        verificationAction(button.dataset.reject, "reject"),
      ),
    );
  document.querySelectorAll("[data-review]").forEach((button) =>
    button.addEventListener("click", () => {
      const request = (
        state.cache.verifications ||
        state.cache.dashboard?.verificationRequests ||
        []
      ).find((item) => item.id === button.dataset.review);
      if (request) {
        document.body.insertAdjacentHTML("beforeend", reviewModal(request));
        bindModal();
      }
    }),
  );
  document
    .querySelector("#notification-button")
    ?.addEventListener("click", () => {
      document.body.insertAdjacentHTML("beforeend", notificationModal());
      bindModal();
    });
  document
    .querySelector('[data-action="go-book"]')
    ?.addEventListener("click", () => setView("booking"));
  document
    .querySelector('[data-action="open-notifications"]')
    ?.addEventListener("click", () => {
      document.body.insertAdjacentHTML("beforeend", notificationModal());
      bindModal();
    });
  bindFilters();
}
function bindFilters() {
  const search = document.querySelector("#centre-search");
  const crop = document.querySelector("#crop-filter");
  const avail = document.querySelector("#availability-filter");
  const filter = () => {
    const rows = state.cache.centres || [];
    const term = (search?.value || "").toLowerCase();
    const filtered = rows.filter(
      (centre) =>
        `${centre.name} ${centre.district}`.toLowerCase().includes(term) &&
        (!crop ||
          crop.value === "All crops" ||
          centre.crops.includes(crop.value)) &&
        (!avail ||
          avail.value === "all" ||
          (avail.value === "open" && centre.booked < centre.capacity) ||
          (avail.value === "low" && centre.queue < 10)),
    );
    const target = document.querySelector("#centre-results");
    if (target) {
      target.innerHTML = filtered.length
        ? filtered.map(centreCard).join("")
        : '<div class="empty">No centres match those filters.</div>';
      bindApp();
    }
  };
  search?.addEventListener("input", filter);
  crop?.addEventListener("change", filter);
  avail?.addEventListener("change", filter);
}
function bindModal() {
  document
    .querySelector("[data-close-modal]")
    ?.addEventListener("click", () =>
      document.querySelector("#modal")?.remove(),
    );
  document.querySelector("#modal")?.addEventListener("click", (event) => {
    if (event.target.id === "modal") event.currentTarget.remove();
  });
  document
    .querySelectorAll("#modal [data-approve]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        verificationAction(button.dataset.approve, "approve"),
      ),
    );
  document
    .querySelectorAll("#modal [data-reject]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        verificationAction(button.dataset.reject, "reject"),
      ),
    );
  document
    .querySelector("#complete-form")
    ?.addEventListener("submit", completeBooking);
}
async function verificationAction(id, action) {
  try {
    await api(`/api/admin/verifications/${id}/${action}`, {
      method: "POST",
      body: "{}",
    });
    document.querySelector("#modal")?.remove();
    toast(
      action === "approve"
        ? "Centre verified — it is now visible to farmers."
        : "Centre application marked rejected.",
    );
    render();
  } catch (error) {
    toast(error.message);
  }
}
function openCompleteModal(id) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="modal-backdrop" id="modal"><section class="modal"><div class="modal-head"><div><h2>Crop verification</h2><p class="form-help">Record prototype measurements before completing procurement.</p></div><button class="modal-close" data-close-modal>×</button></div><form id="complete-form" class="form-grid"><input type="hidden" name="bookingId" value="${id}"><div class="form-group"><label>Measured quantity (kg)</label><input name="measuredQuantity" type="number" value="792" required min="1"></div><div class="form-group"><label>Quality grade</label><select name="quality"><option>FAQ</option><option>Grade A</option><option>Grade B</option></select></div><div class="form-group"><label>Moisture</label><input name="moisture" value="13.5%"></div><div class="form-group"><label>Result</label><input value="Accepted (demo)" disabled></div><div class="form-group full-span"><button class="primary-btn full" type="submit">✓ Accept crop & start payment processing</button><p class="form-help">If accepted, amount is calculated dynamically using a demo crop rate.</p></div></form></section></div>`,
  );
  bindModal();
}
async function completeBooking(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api(`/api/buyer/bookings/${values.bookingId}/action`, {
      method: "POST",
      body: JSON.stringify({ ...values, action: "COMPLETE" }),
    });
    document.querySelector("#modal")?.remove();
    toast("Crop accepted. Demo payment is processing.");
    render();
  } catch (error) {
    toast(error.message);
  }
}

render();
