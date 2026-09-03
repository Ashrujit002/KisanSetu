/**
 * KisanSetu — Smart Agricultural Procurement Platform
 * Multi-Language, Dynamic Slot Allocation, Unique Tracking IDs & High-Security Auth
 */

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
  language: localStorage.getItem("agri_language") || "en",
  bookingDate: null,
  centreDate: null,
  cache: {},
  poller: null,
  notificationPoller: null,
  seenNotifications: new Set(JSON.parse(localStorage.getItem("agri_seen_notifs") || "[]")),
};

const labels = {
  FARMER: "Seller / Farmer",
  BUYER: "Procurement Centre / Buyer",
  ADMIN: "Platform Administrator",
};

const languageLocales = { en: "en-IN", bn: "bn-IN", hi: "hi-IN" };

const translations = {
  bn: {
    // Roles & Portal
    "Seller / Farmer": "বিক্রেতা / কৃষক",
    "Procurement Centre / Buyer": "ক্রয়কেন্দ্র / ক্রেতা",
    "Platform Administrator": "প্ল্যাটফর্ম প্রশাসক",
    "SELLER / FARMER": "বিক্রেতা / কৃষক",
    "BUYER / CENTRE": "ক্রেতা / ক্রয়কেন্দ্র",
    "FARMER PORTAL": "কৃষক পোর্টাল",
    "BUYER PORTAL": "ক্রেতা পোর্টাল",
    "ADMIN PORTAL": "প্রশাসক পোর্টাল",

    // Navigation
    Overview: "সংক্ষিপ্ত বিবরণ",
    "Find Centre": "কেন্দ্র খুঁজুন",
    "Book a Slot": "স্লট বুক করুন",
    "Track Queue": "সারির অবস্থা",
    "My Crops": "আমার ফসল",
    Payments: "পেমেন্ট",
    "Live Queue": "সরাসরি সারি",
    Bookings: "বুকিং তালিকা",
    "Verification requests": "যাচাই অনুরোধ",
    Centres: "কেন্দ্রসমূহ",
    "Centre map": "কেন্দ্র মানচিত্র",
    Dashboard: "ড্যাশবোর্ড",
    "Find Procurement Centre": "ক্রয়কেন্দ্র খুঁজুন",
    "Book Procurement Slot": "ক্রয় স্লট বুক করুন",
    "Track Your Queue": "আপনার সারি দেখুন",
    "Live Queue Management": "সরাসরি সারি ব্যবস্থাপনা",
    "Payments & Procurement": "পেমেন্ট ও ক্রয় ট্র্যাকিং",
    "Farmer Bookings": "কৃষকের বুকিং",
    "Verification Requests": "যাচাই অনুরোধ",
    "Procurement Centre Map": "ক্রয়কেন্দ্রের মানচিত্র",
    Notifications: "বিজ্ঞপ্তি",
    "Log out": "লগ আউট",

    // Dashboard & Stats
    "Good morning": "শুভ সকাল",
    "Your produce journey, in one place.": "আপনার ফসলের সম্পূর্ণ ক্রয় প্রক্রিয়া এক নজরে।",
    "Active booking": "সক্রিয় বুকিং",
    "Queue position": "সারির অবস্থান",
    "Estimated waiting": "আনুমানিক অপেক্ষা",
    Procurement: "ফসল গ্রহণ",
    Payment: "পেমেন্ট",
    "Today’s procurement token": "আজকের ডিজিটাল টোকেন",
    "YOUR TOKEN": "আপনার টোকেন",
    "NOW SERVING": "বর্তমান টোকেন",
    "People ahead": "সামনে আছেন",
    "Est. wait": "আনুমানিক সময়",
    Slot: "সময় স্লট",
    Date: "তারিখ",
    "Quick actions": "দ্রুত কাজ",
    "Recommended for you": "আপনার জন্য প্রস্তাবিত কেন্দ্র",
    "Recent updates": "সাম্প্রতিক আপডেট",
    "No active booking yet.": "এখনো কোনো বুকিং নেই।",
    "Book procurement slot": "স্লট বুক করুন",
    "View all": "সব দেখুন",
    "View centre": "কেন্দ্র দেখুন",
    "Book slot": "স্লট বুক করুন",

    // Centre Search & Filters
    "Verified procurement centres": "যাচাইকৃত সরকারি ও সমবায় ক্রয়কেন্দ্র",
    "Search by centre, district, or town": "কেন্দ্র, জেলা বা এলাকা দিয়ে খুঁজুন",
    "Search by centre or district": "কেন্দ্র বা জেলা খুঁজুন",
    "All crops": "সব ফসল",
    "All availability": "সব উপলব্ধতা",
    "Accepting bookings": "বুকিং নেওয়া হচ্ছে",
    "Low queue (under 10)": "কম সারি (১০ জনের নিচে)",
    "No centres match those filters.": "এই ফিল্টারে কোনো কেন্দ্র মেলেনি।",
    "Current queue": "বর্তমান সারি",
    farmers: "জন কৃষক",
    "slots available": "টি স্লট খালি আছে",
    utilized: "পূর্ণ",

    // Booking Page
    "Book a procurement slot": "সরকারি ক্রয়ের স্লট বুক করুন",
    "Simple booking": "সহজ ৩-ধাপের বুকিং",
    "Choose an open date and time.": "আপনার সুবিধামতো তারিখ ও সময় বাছুন।",
    "Booking date": "বুকিংয়ের তারিখ",
    "Available time": "উপলব্ধ সময় স্লট",
    "Procurement centre": "ক্রয়কেন্দ্র",
    Crop: "ফসল",
    "Crop variety": "ফসলের জাত",
    Quantity: "পরিমাণ",
    Unit: "একক",
    "Confirm booking & generate token": "বুকিং নিশ্চিত করুন ও টোকেন নিন",
    "Confirm booking & generate token →": "বুকিং নিশ্চিত করুন ও টোকেন নিন →",
    Available: "খালি আছে",
    Full: "পূর্ণ",
    Closed: "বন্ধ",
    "Closed / Past": "সময় পার হয়েছে",
    "Booking confirmed": "বুকিং সফলভাবে নিশ্চিত হয়েছে!",
    "Keep this booking reference to track your procurement visit.": "কেন্দ্র পরিদর্শনের সময় এই বুকিং আইডি ও টোকেন সাথে রাখুন।",
    "Booking ID": "বুকিং আইডি",
    Token: "টোকেন নম্বর",
    Time: "সময়",
    "Track live queue": "সরাসরি সারি দেখুন",
    "Go to dashboard": "ড্যাশবোর্ডে ফিরুন",
    "Previous dates cannot be booked. Please choose today or a future date.": "অতীতের তারিখে বুকিং সম্ভব নয়। দয়া করে আজকের বা পরবর্তী তারিখ নির্বাচন করুন।",

    // Live Queue
    "Now serving": "বর্তমানে সেবা নিচ্ছেন",
    "Your token": "আপনার টোকেন",
    "Estimated wait": "আনুমানিক অপেক্ষা",
    "Average time": "গড় সেবা সময়",
    "Procurement status": "ফসল গ্রহণের বর্তমান অবস্থা",
    "Live queue": "লাইভ সারি",
    "Call next waiting": "পরবর্তী কৃষককে ডাকুন",
    "Check in": "উপস্থিতি গ্রহণ",
    Call: "কল করুন",
    Complete: "সম্পন্ন করুন",

    // Notification
    "📣 Your Token Has Been Called!": "📣 আপনার টোকেন ডাকা হয়েছে!",
    "CALL ALERT": "জরুরি বার্তা",
    "No new notifications.": "কোনো নতুন বিজ্ঞপ্তি নেই।",
    Dismiss: "বন্ধ করুন",

    // Crops & Payments
    "Registered crops": "নিবন্ধিত ফসল",
    "Your crop declarations used for booking slots.": "আপনার ঘোষিত ফসলের পরিমাণ ও বিবরণ।",
    "Add crop & book": "নতুন ফসল ও বুকিং",
    "Payment tracking": "পেমেন্ট ট্র্যাকিং",
    "Complete demo payment": "পেমেন্ট সম্পন্ন করুন",
    "Demo reference": "রেফারেন্স নম্বর",

    // Crops names
    Paddy: "ধান",
    Wheat: "গম",
    Maize: "ভুট্টা",
    Mustard: "সরিষা",
    Potato: "আলু",
    Pulses: "ডাল",

    // Statuses
    BOOKED: "বুক করা হয়েছে",
    WAITING: "অপেক্ষমান",
    CHECKED_IN: "উপস্থিত",
    CALLED: "ডাকা হয়েছে",
    PROCESSING: "যাচাই চলছে",
    COMPLETED: "সম্পন্ন",
    CANCELLED: "বাতিল",
    VERIFIED: "যাচাইকৃত",
    PENDING: "যাচাই অপেক্ষমান",

    // Login page
    "Welcome to KisanSetu": "KisanSetu-তে স্বাগতম",
    "Smart agricultural procurement": "স্মার্ট ডিজিটাল কৃষি ক্রয় সেতু",
    "Farm produce. Less waiting. More certainty.": "সরাসরি সরকারি ক্রয়কেন্দ্রে ফসল বিক্রি। লাইন ছাড়া সঠিক ও স্বচ্ছ মূল্য।",
    "Book your visit, receive a digital token and follow every step from crop verification to a clearly marked demo payment.": "ঘরে বসেই বুকিং করুন, ডিজিটাল টোকেন পান এবং ফসল ওজন থেকে মূল্য প্রাপ্তি পর্যন্ত লাইভ ট্র্যাকিং করুন।",
    "Sign in as Seller / Farmer": "কৃষক হিসেবে সাইন ইন",
    "Sign in as Procurement Centre / Buyer": "ক্রয়কেন্দ্র হিসেবে সাইন ইন",
    "Sign in as Platform Administrator": "প্রশাসক হিসেবে সাইন ইন",
    "Create a demo account": "নতুন অ্যাকাউন্ট তৈরি করুন",
    "Sign in": "লগ ইন করুন",
    Language: "ভাষা",
  },
  hi: {
    // Roles & Portal
    "Seller / Farmer": "विक्रेता / किसान",
    "Procurement Centre / Buyer": "खरीद केंद्र / क्रेता",
    "Platform Administrator": "प्लेटफॉर्म प्रशासक",
    "SELLER / FARMER": "विक्रेता / किसान",
    "BUYER / CENTRE": "क्रेता / खरीद केंद्र",
    "FARMER PORTAL": "किसान पोर्टल",
    "BUYER PORTAL": "क्रेता पोर्टल",
    "ADMIN PORTAL": "प्रशासक पोर्टल",

    // Navigation
    Overview: "सारांश",
    "Find Centre": "केंद्र खोजें",
    "Book a Slot": "स्लॉट बुक करें",
    "Track Queue": "कतार देखें",
    "My Crops": "मेरी फसलें",
    Payments: "भुगतान",
    "Live Queue": "लाइव कतार",
    Bookings: "बुकिंग सूची",
    "Verification requests": "सत्यापन अनुरोध",
    Centres: "केंद्र",
    "Centre map": "केंद्र मानचित्र",
    Dashboard: "डैशबोर्ड",
    "Find Procurement Centre": "खरीद केंद्र खोजें",
    "Book Procurement Slot": "खरीद स्लॉट बुक करें",
    "Track Your Queue": "अपनी कतार देखें",
    "Live Queue Management": "लाइव कतार प्रबंधन",
    "Payments & Procurement": "भुगतान और खरीद",
    "Farmer Bookings": "किसान बुकिंग",
    "Verification Requests": "सत्यापन अनुरोध",
    "Procurement Centre Map": "खरीद केंद्र मानचित्र",
    Notifications: "सूचनाएं",
    "Log out": "लॉग आउट",

    // Dashboard & Stats
    "Hello": "नमस्ते",
    "Your produce journey, in one place.": "आपकी फसल खरीद प्रक्रिया का संपूर्ण विवरण।",
    "Active booking": "सक्रिय बुकिंग",
    "Queue position": "कतार में स्थान",
    "Estimated waiting": "अनुमानित प्रतीक्षा",
    Procurement: "फसल प्राप्ति",
    Payment: "भुगतान स्थिति",
    "Today’s procurement token": "आज का डिजिटल टोकन",
    "YOUR TOKEN": "आपका टोकन",
    "NOW SERVING": "वर्तमान टोकन",
    "People ahead": "आगे किसान",
    "Est. wait": "अनुमानित समय",
    Slot: "समय स्लॉट",
    Date: "तिथि",
    "Quick actions": "त्वरित कार्य",
    "Recommended for you": "आपके लिए अनुशंसित केंद्र",
    "Recent updates": "नवीनतम अपडेट",
    "No active booking yet.": "फिलहाल कोई सक्रिय बुकिंग नहीं है।",
    "Book procurement slot": "स्लॉट बुक करें",
    "View all": "सभी देखें",
    "View centre": "केंद्र देखें",
    "Book slot": "स्लॉट बुक करें",

    // Centre Search & Filters
    "Verified procurement centres": "सत्यापित खरीद केंद्र",
    "Search by centre, district, or town": "केंद्र, जिला या क्षेत्र से खोजें",
    "Search by centre or district": "केंद्र या जिला खोजें",
    "All crops": "सभी फसलें",
    "All availability": "सभी उपलब्धता",
    "Accepting bookings": "बुकिंग उपलब्ध",
    "Low queue (under 10)": "कम कतार (10 से कम)",
    "No centres match those filters.": "इन फ़िल्टर से कोई केंद्र नहीं मिला।",
    "Current queue": "वर्तमान कतार",
    farmers: "किसान",
    "slots available": "स्लॉट उपलब्ध",
    utilized: "पूर्ण",

    // Booking Page
    "Book a procurement slot": "सरकारी खरीद स्लॉट बुक करें",
    "Simple booking": "सरल 3-चरणीय बुकिंग",
    "Choose an open date and time.": "अपनी सुविधानुसार तिथि और समय चुनें।",
    "Booking date": "बुकिंग तिथि",
    "Available time": "उपलब्ध समय स्लॉट",
    "Procurement centre": "खरीद केंद्र",
    Crop: "फसल",
    "Crop variety": "फसल की किस्म",
    Quantity: "मात्रा",
    Unit: "इकाई",
    "Confirm booking & generate token": "बुकिंग पुष्टि करें और टोकन लें",
    "Confirm booking & generate token →": "बुकिंग पुष्टि करें और टोकन लें →",
    Available: "उपलब्ध",
    Full: "पूर्ण",
    Closed: "बंद",
    "Closed / Past": "समय समाप्त",
    "Booking confirmed": "बुकिंग सफलतापूर्वक पुष्टि हो गई!",
    "Keep this booking reference to track your procurement visit.": "केंद्र आगमन पर यह बुकिंग आईडी और टोकन दिखाएं।",
    "Booking ID": "बुकिंग आईडी",
    Token: "टोकन नंबर",
    Time: "समय",
    "Track live queue": "लाइव कतार देखें",
    "Go to dashboard": "डैशबोर्ड पर जाएं",
    "Previous dates cannot be booked. Please choose today or a future date.": "पिछली तिथि पर बुकिंग संभव नहीं है। कृपया आज या आगामी तिथि चुनें।",

    // Live Queue
    "Now serving": "वर्तमान टोकन",
    "Your token": "आपका टोकन",
    "Estimated wait": "अनुमानित प्रतीक्षा",
    "Average time": "औसत समय",
    "Procurement status": "खरीद प्रक्रिया की स्थिति",
    "Live queue": "लाइव कतार",
    "Call next waiting": "अगले किसान को बुलाएं",
    "Check in": "उपस्थिति दर्ज करें",
    Call: "कॉल करें",
    Complete: "पूर्ण करें",

    // Notification
    "📣 Your Token Has Been Called!": "📣 आपका टोकन बुलाया गया है!",
    "CALL ALERT": "तत्काल सूचना",
    "No new notifications.": "कोई नई सूचना नहीं है।",
    Dismiss: "बंद करें",

    // Crops & Payments
    "Registered crops": "पंजीकृत फसलें",
    "Your crop declarations used for booking slots.": "स्लॉट बुकिंग हेतु आपकी घोषित फसलें।",
    "Add crop & book": "नई फसल और बुकिंग",
    "Payment tracking": "भुगतान स्थिति",
    "Complete demo payment": "भुगतान पूरा करें",
    "Demo reference": "संदर्भ संख्या",

    // Crops names
    Paddy: "धान",
    Wheat: "गेहूं",
    Maize: "मक्का",
    Mustard: "सरसों",
    Potato: "आलू",
    Pulses: "दाल",

    // Statuses
    BOOKED: "बुक किया गया",
    WAITING: "प्रतीक्षारत",
    CHECKED_IN: "उपस्थित",
    CALLED: "बुलाया गया",
    PROCESSING: "प्रक्रिया जारी",
    COMPLETED: "पूर्ण",
    CANCELLED: "रद्द",
    VERIFIED: "सत्यापित",
    PENDING: "सत्यापन बाकी",

    // Login page
    "Welcome to KisanSetu": "KisanSetu में आपका स्वागत है",
    "Smart agricultural procurement": "स्मार्ट डिजिटल कृषि खरीद सेतु",
    "Farm produce. Less waiting. More certainty.": "सीधे सरकारी खरीद केंद्र पर फसल बेचें। पारदर्शी तौल और सुरक्षित भुगतान।",
    "Book your visit, receive a digital token and follow every step from crop verification to a clearly marked demo payment.": "आसानी से स्लॉट बुक करें, टोकन प्राप्त करें और कतार में अपनी बारी ट्रैक करें।",
    "Sign in as Seller / Farmer": "किसान के रूप में साइन इन",
    "Sign in as Procurement Centre / Buyer": "खरीद केंद्र के रूप में साइन इन",
    "Sign in as Platform Administrator": "प्रशासक के रूप में साइन इन",
    "Create a demo account": "नया खाता बनाएं",
    "Sign in": "लॉग इन करें",
    Language: "भाषा",
  },
};

function t(key = "") {
  if (state.language === "en" || !translations[state.language]) return key;
  return translations[state.language][key] || key;
}

function localizedRole(role) {
  return t(labels[role] || role);
}

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", {
      ...options,
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${value}T12:00:00Z`));
  } catch (e) {
    return value;
  }
}

/**
 * Beautiful Custom SVG Emblem Logo for KisanSetu
 * Symbolizes the direct Golden Bridge (Setu) connecting farmers with government MSP procurement.
 */
function renderLogo(size = 38) {
  return `
    <svg class="brand-logo-svg" width="${size}" height="${size}" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="KisanSetu Logo">
      <defs>
        <linearGradient id="ksLogoBg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0a3d24"/>
          <stop offset="100%" stop-color="#167347"/>
        </linearGradient>
        <linearGradient id="ksBridgeGold" x1="6" y1="28" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="ksWheatGold" x1="16" y1="8" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
        <radialGradient id="ksSunGlow" cx="22" cy="18" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fde047" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Base Shield -->
      <rect width="44" height="44" rx="12" fill="url(#ksLogoBg)"/>
      <rect x="0.75" y="0.75" width="42.5" height="42.5" rx="11.25" stroke="rgba(255,255,255,0.2)"/>
      <!-- Sunrise Glow -->
      <circle cx="22" cy="18" r="7" fill="url(#ksSunGlow)"/>
      <circle cx="22" cy="18" r="4" fill="#fef08a"/>
      <!-- Golden Sprouting Grain / Crop -->
      <path d="M22 28V11" stroke="url(#ksWheatGold)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M22 22C19.2 20.5 18.2 18 19.6 16.5C21.1 18 21.6 20 22 22Z" fill="url(#ksWheatGold)"/>
      <path d="M22 17C19.6 15.6 18.9 13.2 20.3 12C21.5 13.2 21.8 15.1 22 17Z" fill="url(#ksWheatGold)"/>
      <path d="M22 12C20.3 10.8 19.9 8.9 21.1 7.9C22.1 8.9 22.1 10.3 22 12Z" fill="url(#ksWheatGold)"/>
      <path d="M22 22C24.8 20.5 25.8 18 24.4 16.5C22.9 18 22.4 20 22 22Z" fill="url(#ksWheatGold)"/>
      <path d="M22 17C24.4 15.6 25.1 13.2 23.7 12C22.5 13.2 22.2 15.1 22 17Z" fill="url(#ksWheatGold)"/>
      <path d="M22 12C23.7 10.8 24.1 8.9 22.9 7.9C21.9 8.9 21.9 10.3 22 12Z" fill="url(#ksWheatGold)"/>
      <!-- Arching Golden Setu (Bridge) -->
      <path d="M7 32C13 25.5 31 25.5 37 32" stroke="url(#ksBridgeGold)" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M9 35C15 30.2 29 30.2 35 35" stroke="#bef264" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
      <line x1="16" y1="28.5" x2="16" y2="33" stroke="url(#ksBridgeGold)" stroke-width="1.2"/>
      <line x1="22" y1="27" x2="22" y2="32.5" stroke="url(#ksBridgeGold)" stroke-width="1.2"/>
      <line x1="28" y1="28.5" x2="28" y2="33" stroke="url(#ksBridgeGold)" stroke-width="1.2"/>
    </svg>
  `;
}

function brandMarkup(size = 38) {
  return `
    <div class="brand">
      ${renderLogo(size)}
      <span class="brand-title">Kisan<span class="brand-highlight">Setu</span></span>
    </div>
  `;
}

/**
 * Official Ashoka Lion Capital Emblem (Government of India)
 */
function renderEmblemSvg(height = 42) {
  return `
    <svg class="national-emblem-svg" height="${height}" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Emblem of India">
      <defs>
        <linearGradient id="embGrad" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="45%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <!-- Central Lion Head & Mane -->
      <path d="M20,4 C17.5,4 15.5,5.8 15.5,8 C15.5,9.5 16.3,10.8 17.5,11.5 C16.5,12 15.5,13.2 15.5,15 C15.5,17.2 17.5,19 20,19 C22.5,19 24.5,17.2 24.5,15 C24.5,13.2 23.5,12 22.5,11.5 C23.7,10.8 24.5,9.5 24.5,8 C24.5,5.8 22.5,4 20,4 Z" fill="url(#embGrad)"/>
      <!-- Left Lion Profile -->
      <path d="M12,9 C10,9 8.5,10.5 8.5,12.5 C8.5,14 9.5,15.2 10.5,15.8 C9.5,16.5 8.5,17.8 8.5,19.5 C8.5,21.5 10.2,23 12.5,23 C13.8,23 14.8,22.2 15.5,21.2 L15.5,17.5 C14.5,17 13.8,16 13.8,14.8 C13.8,13.5 14.5,12.5 15.5,12 L15.5,10 C14.5,9.4 13.3,9 12,9 Z" fill="url(#embGrad)"/>
      <!-- Right Lion Profile -->
      <path d="M28,9 C26.7,9 25.5,9.4 24.5,10 L24.5,12 C25.5,12.5 26.2,13.5 26.2,14.8 C26.2,16 25.5,17 24.5,17.5 L24.5,21.2 C25.2,22.2 26.2,23 27.5,23 C29.8,23 31.5,21.5 31.5,19.5 C31.5,17.8 30.5,16.5 29.5,15.8 C30.5,15.2 31.5,14 31.5,12.5 C31.5,10.5 30,9 28,9 Z" fill="url(#embGrad)"/>
      <!-- Base Pedestal / Abacus -->
      <rect x="7" y="27" width="26" height="5" rx="1.5" fill="url(#embGrad)"/>
      <!-- Ashoka Chakra (Dharma Wheel) in Center -->
      <circle cx="20" cy="29.5" r="2.8" stroke="#ffffff" stroke-width="0.8" fill="none"/>
      <circle cx="20" cy="29.5" r="0.8" fill="#ffffff"/>
      <!-- Galloping Horse (Left) & Bull (Right) reliefs -->
      <circle cx="12" cy="29.5" r="1.2" fill="#ffffff" opacity="0.85"/>
      <circle cx="28" cy="29.5" r="1.2" fill="#ffffff" opacity="0.85"/>
      <!-- Bell-shaped Lotus Foundation -->
      <path d="M9,33 C9,33 13,38 20,38 C27,38 31,33 31,33 L32,36 C32,36 27,42 20,42 C13,42 8,36 8,36 L9,33 Z" fill="url(#embGrad)"/>
      <!-- Plinth -->
      <rect x="10" y="44" width="20" height="2" rx="1" fill="url(#embGrad)"/>
    </svg>
  `;
}

/**
 * Interactive Modals for Footer Trust & Support Actions
 */
function openInfoModal(type) {
  const contentMap = {
    help: {
      title: "🌾 KisanSetu Farmer Helpdesk",
      desc: "Step-by-step guide to smart government agricultural procurement.",
      html: `
        <div class="info-modal-grid">
          <div class="info-step-card">
            <span class="step-badge">Step 1</span>
            <strong>Select Centre &amp; Date</strong>
            <p>Search your local district procurement centre and choose an open date and time slot.</p>
          </div>
          <div class="info-step-card">
            <span class="step-badge">Step 2</span>
            <strong>Receive Digital Token</strong>
            <p>Get your digital queue number and monitor your turn live without standing in crowded physical queues.</p>
          </div>
          <div class="info-step-card">
            <span class="step-badge">Step 3</span>
            <strong>Produce Inspection</strong>
            <p>Produce is inspected against Fair Average Quality (FAQ) norms with certified digital moisture testers.</p>
          </div>
          <div class="info-step-card">
            <span class="step-badge">Step 4</span>
            <strong>Direct Bank DBT</strong>
            <p>Funds are transferred directly to your Aadhaar-linked bank account within 24 hours of weighment.</p>
          </div>
        </div>
      `
    },
    contact: {
      title: "📞 Contact Farmer Support & Helplines",
      desc: "Reach our dedicated agricultural procurement assistance teams.",
      html: `
        <div class="contact-card-list">
          <div class="contact-info-card">
            <span class="contact-icon">📞</span>
            <div>
              <strong>Kisan Call Centre (Toll-Free)</strong>
              <div class="contact-highlight">1800-180-1551</div>
              <small>Operating 6:00 AM – 10:00 PM daily in 22 local languages.</small>
            </div>
          </div>
          <div class="contact-info-card">
            <span class="contact-icon">💬</span>
            <div>
              <strong>WhatsApp Kisan Sahayak</strong>
              <div class="contact-highlight">+91 98765 43210</div>
              <small>24/7 automated slot enquiry and Mandi price lookup.</small>
            </div>
          </div>
          <div class="contact-info-card">
            <span class="contact-icon">✉️</span>
            <div>
              <strong>National Helpdesk Email</strong>
              <div class="contact-highlight">support@kisansetu.gov.in</div>
              <small>Official responses within 1 business day.</small>
            </div>
          </div>
          <div class="contact-info-card">
            <span class="contact-icon">🏢</span>
            <div>
              <strong>Headquarters</strong>
              <p style="margin:2px 0 0;font-size:12px;color:var(--muted)">Department of Agriculture &amp; Farmers Welfare, Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</p>
            </div>
          </div>
        </div>
      `
    },
    support: {
      title: "🛡️ Farmer Grievance & Technical Support",
      desc: "Resolution for slot booking, token queueing, and bank transfers.",
      html: `
        <div class="support-info-box">
          <p>If you experience any difficulties with slot booking, token queueing, or DBT reconciliation, our District Agronomist Officers (DAOs) are available to assist:</p>
          <ul class="support-check-list">
            <li>✓ <strong>Weighment Disputes:</strong> Every farmer receives an authenticated digital weighbridge receipt with QR code.</li>
            <li>✓ <strong>Bank Account Update:</strong> Change or verify your Aadhaar-linked DBT account through your local centre operator.</li>
            <li>✓ <strong>Slot Rescheduling:</strong> Easily reschedule future slots up to 12 hours before your scheduled appointment.</li>
          </ul>
        </div>
      `
    },
    services: {
      title: "🚜 KisanSetu Agricultural Services",
      desc: "Official smart procurement services under Central &amp; State initiatives.",
      html: `
        <div class="services-info-grid">
          <div class="service-item">
            <div class="s-icon">🌾</div>
            <strong>MSP Assured Procurement</strong>
            <p>Guaranteed Minimum Support Price without middlemen or commission deductions.</p>
          </div>
          <div class="service-item">
            <div class="s-icon">⏱️</div>
            <strong>Smart Token Management</strong>
            <p>Time-slotted appointments eliminating wait times at government mandis.</p>
          </div>
          <div class="service-item">
            <div class="s-icon">💳</div>
            <strong>Direct Benefit Transfer (DBT)</strong>
            <p>Direct electronic transfer to farmers' accounts with zero leakage.</p>
          </div>
          <div class="service-item">
            <div class="s-icon">🔬</div>
            <strong>Digital Quality Testing</strong>
            <p>Transparent moisture and purity assessment recorded on the blockchain ledger.</p>
          </div>
        </div>
      `
    },
    faq: {
      title: "❓ Frequently Asked Questions (FAQ)",
      desc: "Common questions regarding KisanSetu procurement.",
      html: `
        <div class="faq-list">
          <div class="faq-card">
            <strong>What is KisanSetu?</strong>
            <p>KisanSetu is a government-backed smart agricultural procurement platform connecting farmers directly with certified procurement centres at guaranteed MSP rates.</p>
          </div>
          <div class="faq-card">
            <strong>How do I book a procurement slot?</strong>
            <p>Sign in with your farmer account, choose an open date, select an available time window, and confirm to receive your unique digital token.</p>
          </div>
          <div class="faq-card">
            <strong>Can I book a previous date?</strong>
            <p>No. For integrity and fairness, appointments are only permitted for today or future dates.</p>
          </div>
          <div class="faq-card">
            <strong>When will payment reach my account?</strong>
            <p>Payment is disbursed electronically via DBT within 24 hours of crop inspection and certified weighment.</p>
          </div>
        </div>
      `
    }
  };

  const data = contentMap[type] || contentMap.contact;
  const modalHtml = `
    <div class="modal-backdrop animate-fade" id="info-modal">
      <section class="modal animate-pop" style="max-width:580px">
        <div class="modal-head">
          <div>
            <h2>${data.title}</h2>
            <p class="form-help">${data.desc}</p>
          </div>
          <button class="modal-close" id="close-info-modal">×</button>
        </div>
        <div class="info-modal-content">
          ${data.html}
        </div>
      </section>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  document.querySelector("#close-info-modal")?.addEventListener("click", () => {
    document.querySelector("#info-modal")?.remove();
  });
  document.querySelector("#info-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "info-modal") e.target.remove();
  });
}

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

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char]));
}

function money(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function statusBadge(status = "") {
  const raw = String(status || "").toUpperCase();
  const label = t(raw);
  const cls = raw.toLowerCase().replace("_", "-");
  return `<span class="badge ${cls}">${esc(label)}</span>`;
}

function verifiedBadge(value = "VERIFIED") {
  const isVer = value === "VERIFIED";
  return `<span class="verification ${isVer ? "verified" : "pending"}">${isVer ? "✓ " + t("VERIFIED") : "● " + t("PENDING")}</span>`;
}

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({})); 
  if (!response.ok) {
    throw new Error(data.error || "Request could not be completed. Please try again.");
  }
  return data;
}

function toast(message, type = "info") {
  const region = document.querySelector("#toast-region");
  if (!region) return;
  const element = document.createElement("div");
  element.className = `toast ${type} animate-fade`;
  element.innerHTML = `<span>${esc(message)}</span><button class="toast-close">✕</button>`;
  element.querySelector(".toast-close").addEventListener("click", () => element.remove());
  region.append(element);
  setTimeout(() => element.remove(), 3500);
}

function updateNotificationIndicator() {
  const dot = document.querySelector("#notification-button .dot");
  if (dot) {
    const unreadCount = state.cache.notifications?.filter((item) => !item.read).length || 0;
    dot.classList.toggle("hidden", unreadCount === 0);
  }
}

async function refreshNotifications(announce = false) {
  try {
    const notifications = await api("/api/notifications");
    state.cache.notifications = notifications;
    updateNotificationIndicator();

    // Gentle subtle non-blocking toast ONLY for brand-new unread notifications
    if (announce && state.user) {
      const newItems = notifications.filter(
        (n) => !n.read && !state.seenNotifications.has(n.id)
      );
      for (const item of newItems) {
        state.seenNotifications.add(item.id);
        localStorage.setItem(
          "agri_seen_notifs",
          JSON.stringify([...state.seenNotifications].slice(-100))
        );
        toast(`🔔 ${item.title}: ${item.message}`, "info");
      }
    }
    return notifications;
  } catch (e) {
    return [];
  }
}

function startNotificationPolling() {
  clearInterval(state.notificationPoller);
  state.notificationPoller = setInterval(() => {
    refreshNotifications(true).catch(() => {});
  }, 6000);
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
  clearInterval(state.notificationPoller);
  render();
}

function setView(view, item = null) {
  state.view = view;
  if (item?.id?.startsWith("CTR")) state.selectedCentre = item;
  if (item?.id?.startsWith("AGRI") || item?.id?.startsWith("BK")) state.selectedBooking = item;
  clearInterval(state.poller);
  render();
}

function renderLanguageDropdown(extraClass = "") {
  return `
    <div class="lang-select-wrapper ${extraClass}">
      <span class="lang-icon">🌐</span>
      <select class="language-select" aria-label="${t("Language")}">
        <option value="en" ${state.language === "en" ? "selected" : ""}>English</option>
        <option value="bn" ${state.language === "bn" ? "selected" : ""}>বাংলা (Bengali)</option>
        <option value="hi" ${state.language === "hi" ? "selected" : ""}>हिन्दी (Hindi)</option>
      </select>
    </div>
  `;
}

function loginPage() {
  const registration = state.loginScreen === "register";
  const role = state.loginRole;

  return `
    <div class="login-page-wrapper">
      <main class="login-shell">
        <!-- Animated Agricultural Hero Scene on Left -->
        <section class="login-intro">
        <!-- Subtle Ambient Background Animation (Mesh Orbs, Topo Rings & Drifting Fireflies) -->
        <div class="bg-ambient-layer">
          <div class="ambient-orb orb-1"></div>
          <div class="ambient-orb orb-2"></div>
          <div class="ambient-orb orb-3"></div>
          <div class="topo-ring ring-1"></div>
          <div class="topo-ring ring-2"></div>
          <div class="topo-ring ring-3"></div>
          <div class="bg-firefly bf1"></div>
          <div class="bg-firefly bf2"></div>
          <div class="bg-firefly bf3"></div>
          <div class="bg-firefly bf4"></div>
          <div class="bg-firefly bf5"></div>
          <div class="bg-firefly bf6"></div>
        </div>

        <div class="intro-header">
          ${brandMarkup(42)}
          <span class="gov-tag">Direct MSP Platform</span>
        </div>
        
        <!-- Panoramic Animated Landscape -->
        <div class="scenic-canvas-wrap">
          <div class="sun-radiance">
            <div class="sun-core"></div>
            <div class="sun-rays"></div>
          </div>
          
          <!-- Drifting Clouds -->
          <div class="scenic-cloud c1"></div>
          <div class="scenic-cloud c2"></div>

          <!-- Drifting Golden Pollen Particles -->
          <div class="pollen-spore p1"></div>
          <div class="pollen-spore p2"></div>
          <div class="pollen-spore p3"></div>
          <div class="pollen-spore p4"></div>
          <div class="pollen-spore p5"></div>
          <div class="pollen-spore p6"></div>

          <svg class="landscape-svg" viewBox="0 0 540 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hillDistant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#145a38" stop-opacity="0.7"/>
                <stop offset="100%" stop-color="#093822" stop-opacity="0.95"/>
              </linearGradient>
              <linearGradient id="hillMiddle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1e7b4b"/>
                <stop offset="100%" stop-color="#0e4428"/>
              </linearGradient>
              <linearGradient id="hillFore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2a9b5e"/>
                <stop offset="100%" stop-color="#125433"/>
              </linearGradient>
              <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#4d6655" stop-opacity="0.5"/>
                <stop offset="50%" stop-color="#809c86" stop-opacity="0.7"/>
                <stop offset="100%" stop-color="#4d6655" stop-opacity="0.5"/>
              </linearGradient>
            </defs>

            <!-- Distant Mountains -->
            <path d="M0,110 Q90,60 210,95 T430,75 Q490,95 540,85 L540,240 L0,240 Z" fill="url(#hillDistant)" opacity="0.65"/>
            
            <!-- Clean-Energy Wind Turbine 1 (Distant Ridge) -->
            <g class="windmill-unit">
              <line x1="200" y1="92" x2="200" y2="132" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
              <g class="windmill-propeller">
                <circle cx="200" cy="92" r="3.5" fill="#ffffff"/>
                <line x1="200" y1="92" x2="200" y2="68" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
                <line x1="200" y1="92" x2="220" y2="104" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
                <line x1="200" y1="92" x2="180" y2="104" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
              </g>
            </g>

            <!-- Clean-Energy Wind Turbine 2 (Farther Ridge) -->
            <g class="windmill-unit" opacity="0.75">
              <line x1="248" y1="104" x2="248" y2="136" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
              <g class="windmill-propeller" style="transform-origin: 248px 104px; animation-duration: 8.5s;">
                <circle cx="248" cy="104" r="2.8" fill="#ffffff"/>
                <line x1="248" y1="104" x2="248" y2="85" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
                <line x1="248" y1="104" x2="264" y2="114" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
                <line x1="248" y1="104" x2="232" y2="114" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
              </g>
            </g>

            <!-- Midground Hills -->
            <path d="M0,140 Q140,100 280,135 T540,115 L540,240 L0,240 Z" fill="url(#hillMiddle)" opacity="0.88"/>

            <!-- Suspension Bridge (Setu) Pillars & Cable Structure -->
            <g class="setu-bridge-structure" opacity="0.92">
              <!-- Bridge Pylon Towers -->
              <line x1="130" y1="182" x2="130" y2="136" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
              <line x1="370" y1="182" x2="370" y2="136" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
              <!-- Cross Bracing -->
              <line x1="126" y1="152" x2="134" y2="152" stroke="#fef08a" stroke-width="1.5"/>
              <line x1="366" y1="152" x2="374" y2="152" stroke="#fef08a" stroke-width="1.5"/>
              <!-- Main Suspension Cable Curve -->
              <path d="M40,158 Q130,136 250,165 T460,142" stroke="#fbbf24" stroke-width="2.4" fill="none"/>
              <!-- Suspender Wire Cables -->
              <line x1="170" y1="156" x2="170" y2="168" stroke="#fde047" stroke-width="1" opacity="0.6"/>
              <line x1="210" y1="162" x2="210" y2="171" stroke="#fde047" stroke-width="1" opacity="0.6"/>
              <line x1="290" y1="163" x2="290" y2="172" stroke="#fde047" stroke-width="1" opacity="0.6"/>
              <line x1="330" y1="157" x2="330" y2="169" stroke="#fde047" stroke-width="1" opacity="0.6"/>
            </g>

            <!-- Foreground Fertile Terraces -->
            <path d="M0,170 Q160,135 340,165 T540,150 L540,240 L0,240 Z" fill="url(#hillFore)"/>

            <!-- Curved Farm Highway / Trail across Bridge -->
            <path d="M-20,185 Q160,148 340,178 T560,165" stroke="url(#roadGrad)" stroke-width="7" fill="none" stroke-linecap="round"/>

            <!-- Swaying Crop Clusters (Left Foreground) -->
            <g class="crop-cluster left-crops" stroke="#fde047" stroke-width="2.2" stroke-linecap="round" fill="none">
              <path class="stalk st1" d="M30,175 Q38,142 34,120" />
              <path class="grain gr1" d="M32,126 Q40,120 36,114 Q34,108 38,102" stroke-width="3.5" stroke="#fef08a" />

              <path class="stalk st2" d="M52,180 Q60,146 56,124" />
              <path class="grain gr2" d="M54,130 Q62,124 58,118 Q56,112 60,106" stroke-width="3.5" stroke="#fef08a" />

              <path class="stalk st3" d="M75,185 Q82,152 79,130" />
              <path class="grain gr3" d="M77,136 Q84,130 80,124 Q78,118 82,112" stroke-width="3.5" stroke="#fef08a" />
            </g>

            <!-- Swaying Crop Clusters (Right Foreground) -->
            <g class="crop-cluster right-crops" stroke="#fde047" stroke-width="2.2" stroke-linecap="round" fill="none">
              <path class="stalk st4" d="M460,175 Q468,144 464,122" />
              <path class="grain gr4" d="M462,128 Q470,122 466,116 Q464,110 468,104" stroke-width="3.5" stroke="#fef08a" />

              <path class="stalk st5" d="M485,180 Q493,148 490,126" />
              <path class="grain gr5" d="M488,132 Q496,126 492,120 Q490,114 494,108" stroke-width="3.5" stroke="#fef08a" />
            </g>

            <!-- Animated High-Tech Agritech Transport Truck Riding Across Setu Bridge -->
            <g class="smart-vehicle ride-animation">
              <!-- Vehicle Cab -->
              <rect x="0" y="0" width="38" height="19" rx="4" fill="#ffffff" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.35))" />
              <rect x="23" y="3" width="12" height="10" rx="2" fill="#38bdf8" opacity="0.9" />
              <!-- Top Signal Beacon -->
              <circle cx="10" cy="-2" r="2" fill="#ef4444" />
              <!-- Cargo Pod (Golden Harvest Container) -->
              <rect x="-24" y="2" width="24" height="17" rx="3" fill="#f59e0b" />
              <rect x="-21" y="5" width="18" height="11" rx="1.5" fill="#d97706" opacity="0.6" />
              <!-- Spinning Dual-Tone Wheels -->
              <circle cx="-13" cy="21" r="5.5" fill="#0f172a" />
              <circle cx="-13" cy="21" r="2.5" fill="#94a3b8" />
              <circle cx="8" cy="21" r="5.5" fill="#0f172a" />
              <circle cx="8" cy="21" r="2.5" fill="#94a3b8" />
              <circle cx="28" cy="21" r="5.5" fill="#0f172a" />
              <circle cx="28" cy="21" r="2.5" fill="#94a3b8" />
              <!-- Powerful Headlight Cone cutting morning mist -->
              <polygon points="38,12 86,5 86,23" fill="#fef08a" opacity="0.5" />
            </g>
          </svg>

          <!-- Interactive Floating Agritech Glass Badges -->
          <div class="floating-badge-deck">
            <div class="glass-badge b1 animate-float-1">
              <span class="badge-icon">🌾</span>
              <div>
                <strong>₹2,425 / Qtl</strong>
                <small>Guaranteed MSP Rate</small>
              </div>
            </div>
            <div class="glass-badge b2 animate-float-2">
              <span class="badge-icon">⏱️</span>
              <div>
                <strong>Zero Waiting</strong>
                <small>Live Token System</small>
              </div>
            </div>
            <div class="glass-badge b3 animate-float-3">
              <span class="badge-icon">💳</span>
              <div>
                <strong>Direct DBT</strong>
                <small>24-Hour Settlement</small>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-copy">
          <div class="eyebrow">${t("Smart agricultural procurement")}</div>
          <h1>${t("Farm produce. Less waiting. More certainty.")}</h1>
          <p>${t("Book your visit, receive a digital token and follow every step from crop verification to a clearly marked demo payment.")}</p>
        </div>

        <div class="hero-stats">
          <div><strong>186+</strong><span>${t("Centres")}</span></div>
          <div><strong>12,450+</strong><span>${t("Seller / Farmer")}</span></div>
          <div><strong>7 min</strong><span>${t("Average time")}</span></div>
        </div>
      </section>

      <!-- Clean Login Panel on Right -->
      <section class="login-panel">
        <div class="panel-top-row">
          <span class="demo-pill">● SECURE ACCESS</span>
          ${renderLanguageDropdown("compact")}
        </div>
        ${registration ? registerMarkup(role) : loginMarkup(role)}
        <div class="login-footer">KisanSetu Platform — Transparent, fair, and direct government procurement.</div>

        <div class="scroll-explore-prompt">
          <button type="button" class="scroll-prompt-btn" id="btn-scroll-down">
            <span>Explore Government Affiliations &amp; Farmer Services</span>
            <span class="prompt-arrow">↓</span>
          </button>
        </div>
      </section>
    </main>

    <!-- Official Government Affiliation & Farmer Connect Footer Bar (Requested Section) -->
    <footer class="trust-connect-bar" id="trust-footer">
      <div class="trust-connect-inner">
        <!-- 1. Left: KisanSetu Identity Card -->
        <div class="trust-col trust-brand-card">
          <div class="trust-logo-box">
            ${renderLogo(44)}
          </div>
          <div class="trust-brand-text">
            <strong class="trust-brand-title">Kisan<span class="brand-green">Setu</span></strong>
            <span>National Agri Procurement</span>
          </div>
        </div>

        <!-- 2. Center: Connect With Us & Quick Links -->
        <div class="trust-col trust-connect-center">
          <div class="connect-headline-row">
            <span class="connect-title">Connect with us</span>
            <div class="connect-social-icons">
              <button type="button" class="social-circle sc-wa" title="WhatsApp Kisan Sahayak" data-open-info="contact">
                <span class="social-icon">💬</span>
              </button>
              <button type="button" class="social-circle sc-phone" title="Kisan Call Centre (1800-180-1551)" data-open-info="contact">
                <span class="social-icon">📞</span>
              </button>
              <button type="button" class="social-circle sc-portal" title="e-NAM &amp; Agri Services" data-open-info="services">
                <span class="social-icon">🌾</span>
              </button>
              <button type="button" class="social-circle sc-notif" title="Farmer Support &amp; Advisory" data-open-info="support">
                <span class="social-icon">📢</span>
              </button>
            </div>
          </div>

          <div class="connect-pill-group">
            <button type="button" class="connect-pill pill-outline" data-open-info="help">Help</button>
            <button type="button" class="connect-pill pill-accent" data-open-info="contact">Contact us</button>
            <button type="button" class="connect-pill pill-outline" data-open-info="support">Support</button>
            <button type="button" class="connect-pill pill-accent" data-open-info="services">Services</button>
            <button type="button" class="connect-pill pill-outline" data-open-info="faq">FAQ</button>
          </div>
        </div>

        <!-- 3. Right: Ministry of Agriculture & Farmers Welfare Emblem Card -->
        <div class="trust-col trust-ministry-card">
          <div class="emblem-box">
            ${renderEmblemSvg(44)}
          </div>
          <div class="ministry-text">
            <div class="ministry-hindi">कृषि एवं किसान कल्याण मंत्रालय</div>
            <div class="ministry-eng">MINISTRY OF AGRICULTURE &amp; FARMERS WELFARE</div>
            <div class="ministry-sub">GOVERNMENT OF INDIA</div>
          </div>
        </div>
      </div>

      <!-- Subtle Gradient Divider Line & Bottom Copyright -->
      <div class="trust-gradient-divider"></div>
      <div class="trust-copyright">
        <span>© 2026 KisanSetu — Department of Agriculture, Cooperation &amp; Farmers Welfare, Government of India. All rights reserved.</span>
      </div>
    </footer>
  </div>
  `;
}

function loginMarkup(role) {
  // 1. Role Selection View
  if (state.loginScreen === "select") {
    return `
      <h2>${t("Welcome to KisanSetu")}</h2>
      <p style="color:var(--muted);margin:0 0 20px">${t("Choose how you want to use the platform.")}</p>
      
      <div class="role-grid">
        <button class="role-card" data-role="FARMER">
          <span class="role-icon">👨‍🌾</span>
          <strong>${t("SELLER / FARMER")}</strong>
          <span>Book procurement slots, receive digital queue tokens, and track payments.</span>
          <b>${t("Sign in as Seller / Farmer")} →</b>
        </button>
        <button class="role-card" data-role="BUYER">
          <span class="role-icon">🏢</span>
          <strong>${t("BUYER / CENTRE")}</strong>
          <span>Manage centre queue, call tokens, inspect crop quality, and complete weighment.</span>
          <b>${t("Sign in as Procurement Centre / Buyer")} →</b>
        </button>
      </div>
      
      <div class="admin-access-bar">
        <button class="admin-lock-btn full" data-role="ADMIN">
          <span class="lock-icon">🔐</span>
          <div>
            <strong>${t("Platform Administrator")}</strong>
            <small>Protected administration console (Password Required)</small>
          </div>
          <span class="arrow-key">→</span>
        </button>
      </div>
    `;
  }

  // 2. Protected Administrator Authentication (Requires Password)
  if (role === "ADMIN") {
    return `
      <div class="admin-auth-panel animate-pop">
        <div class="admin-badge-icon">🔐</div>
        <h2>Administrator Security Access</h2>
        <p style="color:var(--muted);font-size:13px;margin:6px 0 20px">
          Master password verification is required to access system verifications and centre configurations.
        </p>

        <form id="login-form" class="login-form">
          <label>Administrator Email
            <input name="email" type="email" placeholder="Enter admin email (e.g. admin@demo.local)" required autocomplete="email" />
          </label>
          <label>Security Password
            <input name="password" type="password" placeholder="Enter administrator password" required autofocus autocomplete="current-password" />
          </label>
          <button class="primary-btn full" type="submit">
            🔐 Verify Password & Enter Console →
          </button>
          <button class="ghost-btn full small" type="button" id="back-role">
            ← Back to role selection
          </button>
        </form>
        
       
      </div>
    `;
  }

  // 3. Farmer & Buyer Login (Clean Form, Blank Input, No Bypass Buttons)
  const isFarmer = role === "FARMER";
  const hintEmail = isFarmer ? "farmer@demo.local" : "buyer@demo.local";

  return `
    <h2>${t(`Sign in as ${labels[role]}`)}</h2>
    <p style="color:var(--muted);margin:0 0 20px">Sign in with your registered account credentials.</p>
    
    <form id="login-form" class="login-form">
      <label>Email Address
        <input name="email" type="email" placeholder="Enter your email address" required autocomplete="email" />
      </label>
      <label>Password
        <input name="password" type="password" placeholder="Enter your password" required autocomplete="current-password" />
      </label>
      <button class="primary-btn full" type="submit">${t(`Sign in as ${labels[role]}`)} →</button>
      <button class="ghost-btn full small" type="button" id="back-role">← Back to role selection</button>
    </form>


    <p style="text-align:center;font-size:13px;margin-top:22px">
      ${t("New here?")} <button id="register-link" style="background:none;color:var(--green);font-weight:800;padding:0">${t("Create a demo account")}</button>
    </p>
  `;
}

function registerMarkup(role) {
  const buyer = role === "BUYER";
  return `
    <h2>${buyer ? "Register Procurement Centre" : "Register Farmer Account"}</h2>
    <div class="filters" style="margin:14px 0 18px">
      <button class="${role === "FARMER" ? "primary-btn" : "ghost-btn"} small" data-register-role="FARMER">👨‍🌾 ${t("Seller / Farmer")}</button>
      <button class="${role === "BUYER" ? "primary-btn" : "ghost-btn"} small" data-register-role="BUYER">🏢 ${t("Procurement Centre / Buyer")}</button>
    </div>
    <form id="register-form" class="form-grid">
      <div class="form-group"><label>${buyer ? "Organization / Agency" : "Full Name"} *</label><input name="name" required placeholder="${buyer ? "Bengal Agri Cooperative" : "Ramesh Das"}" /></div>
      <div class="form-group"><label>Email *</label><input type="email" name="email" required placeholder="user@domain.com" /></div>
      <div class="form-group"><label>Mobile Number</label><input name="phone" inputmode="tel" placeholder="98765 43210" /></div>
      <div class="form-group"><label>State</label><input name="state" value="West Bengal" /></div>
      <div class="form-group"><label>District</label><input name="district" value="North 24 Parganas" /></div>
      ${buyer ? `
        <div class="form-group full-span"><label>Centre Name *</label><input name="centreName" required placeholder="Barasat Modern Procurement Centre" /></div>
        <div class="form-group"><label>Daily Capacity</label><input name="capacity" type="number" value="100" min="10" /></div>
        <div class="form-group"><label>Supported Crop</label><select name="crop"><option value="Paddy">Paddy</option><option value="Wheat">Wheat</option><option value="Maize">Maize</option><option value="Potato">Potato</option></select></div>
      ` : `
        <div class="form-group"><label>Village / Block</label><input name="village" placeholder="Barasat" /></div>
        <div class="form-group"><label>Cultivated Area</label><input name="cultivatedArea" placeholder="2.5 acres" /></div>
      `}
      <div class="form-group full-span"><label>Password *</label><input type="password" name="password" required minlength="6" placeholder="At least 6 characters" /></div>
      <div class="form-group full-span"><button class="primary-btn full" type="submit">Create Account →</button></div>
    </form>
    <p style="text-align:center;font-size:13px;margin:16px 0 0">
      Already have an account? <button id="login-link" style="background:none;color:var(--green);font-weight:800;padding:0">${t("Sign in")}</button>
    </p>
  `;
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
  const navItems = navigation[role] || navigation.FARMER;
  const nav = navItems
    .map(([key, label]) => `
      <button class="nav-button ${state.view === key ? "active" : ""}" data-nav="${key}">
        <span class="nav-icon">${icons[key] || "●"}</span>${t(label)}
      </button>
    `)
    .join("");

  const pageTitleKey = {
    dashboard: "Dashboard",
    centres: role === "FARMER" ? "Find Procurement Centre" : "Centres",
    booking: "Book Procurement Slot",
    queue: role === "BUYER" ? "Live Queue Management" : "Track Your Queue",
    crops: "My Crops",
    payments: "Payments & Procurement",
    bookings: "Farmer Bookings",
    verifications: "Verification Requests",
    map: "Procurement Centre Map",
  }[state.view] || "KisanSetu";

  const hasUnread = state.cache.notifications?.some((item) => !item.read);

  return `
    <div class="app-shell">
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="sidebar" id="sidebar">
        ${brandMarkup(36)}
        <div class="side-label">${t(`${role} PORTAL`)}</div>
        <nav class="nav-list">${nav}</nav>
        <div class="sidebar-bottom">
          <div class="demo-chip">● ACTIVE SECURE SESSION</div>
          <div class="account-mini">
            <div class="avatar">${esc(state.user.name || "U").slice(0, 1).toUpperCase()}</div>
            <div class="account-info">
              <strong>${esc(state.user.name)}</strong>
              <span>${localizedRole(role)}</span>
            </div>
            <button class="logout" title="${t("Log out")}" id="logout-button">↪</button>
          </div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <button class="mobile-menu" id="mobile-menu" aria-label="Open navigation menu">☰</button>
          <div class="page-intro">
            <h1>${t(pageTitleKey)}</h1>
            <p>${subtitle || "Smart agricultural procurement, made easier."}</p>
          </div>
          <div class="top-actions">
            ${renderLanguageDropdown()}
            <button class="notification-bell" id="notification-button" title="${t("Notifications")}">
              🔔<i class="dot ${hasUnread ? "" : "hidden"}"></i>
            </button>
          </div>
        </header>
        <div class="content">${content}</div>
      </main>
    </div>
  `;
}

async function farmerDashboard() {
  const data = await api("/api/dashboard");
  state.cache.dashboard = data;
  const booking = data.booking;
  const queue = data.queue;

  const stats = booking
    ? [
        ["🎫", t("Active booking"), booking.token],
        ["◉", t("Queue position"), queue ? String(queue.peopleAhead + 1) : "1"],
        ["◷", t("Estimated waiting"), queue ? `${queue.estimatedMinutes} min` : "0 min"],
        ["◒", t("Procurement"), booking.procurement?.status || t(booking.status)],
        ["₹", t("Payment"), booking.payment?.status || "Pending"],
      ]
    : [
        ["🎫", t("Active booking"), "None"],
        ["◉", t("Queue position"), "—"],
        ["◷", t("Estimated waiting"), "—"],
        ["◒", t("Procurement"), "—"],
        ["₹", t("Payment"), "—"],
      ];

  const nowServingVal = queue?.nowServing && queue.nowServing !== "—" ? queue.nowServing : (booking?.token || "A-001");

  return `
    <section class="welcome-banner animate-fade">
      <div>
        <div class="eyebrow" style="margin-bottom:7px">${t("Good morning")}, ${esc(data.user.name.split(" ")[0])} 👋</div>
        <h2>${t("Your produce journey, in one place.")}</h2>
        <p>${verifiedBadge(data.user.verification || "VERIFIED")} &nbsp; ${esc(data.user.farmerId || "FRM-DEMO")}</p>
      </div>
      <div class="banner-id">
        Farmer ID<strong>${esc(data.user.farmerId || "FRM-DEMO")}</strong>
      </div>
    </section>

    <section class="stat-grid">
      ${stats.map(([icon, label, value]) => `
        <article class="stat-card">
          <div class="stat-icon">${icon}</div>
          <span>${label}</span>
          <strong>${esc(value)}</strong>
        </article>
      `).join("")}
    </section>

    <div class="dashboard-grid">
      <section class="card queue-hero">
        <div class="section-heading" style="margin:0">
          <div>
            <h2>${t("Today’s procurement token")}</h2>
            <p>${booking ? esc(booking.centre?.name || "Procurement Centre") : t("No active booking yet.")}</p>
          </div>
          ${booking ? statusBadge(booking.status) : ""}
        </div>
        ${booking ? `
          <div class="booking-ref-strip">
            <span>${t("Booking ID")}: <strong>${booking.id}</strong></span>
            <span>📍 ${esc(booking.centre?.short || "")}</span>
          </div>
          <div class="token-row">
            <div>
              <span style="font-size:11px;color:var(--muted)">${t("YOUR TOKEN")}</span>
              <div class="token-main">${booking.token}</div>
            </div>
            <span class="arrow">→</span>
            <div>
              <span style="font-size:11px;color:var(--muted)">${t("NOW SERVING")}</span>
              <div class="token-main serving-badge">${nowServingVal}</div>
            </div>
          </div>
          <div class="queue-details">
            <div class="queue-detail"><span>${t("People ahead")}</span><strong>${queue?.peopleAhead ?? 0}</strong></div>
            <div class="queue-detail"><span>${t("Est. wait")}</span><strong>${queue?.estimatedMinutes ?? 0} min</strong></div>
            <div class="queue-detail"><span>${t("Slot")}</span><strong>${esc(booking.time)}</strong></div>
            <div class="queue-detail"><span>${t("Date")}</span><strong>${displayDate(booking.date)}</strong></div>
          </div>
          <button class="primary-btn full" style="margin-top:14px" data-nav="queue">
            ${t("Track live queue")} →
          </button>
        ` : `
          <div class="empty">
            <p>${t("No active booking yet.")}</p>
            <button class="primary-btn small" data-action="go-book">${t("Book procurement slot")}</button>
          </div>
        `}
      </section>

      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div><h2>${t("Quick actions")}</h2></div>
        </div>
        <div class="quick-grid">
          <button class="quick-action" data-nav="booking"><span>＋</span>${t("Book a Slot")}</button>
          <button class="quick-action" data-nav="centres"><span>⌖</span>${t("Find Centre")}</button>
          <button class="quick-action" data-nav="queue"><span>◉</span>${t("Track Queue")}</button>
          <button class="quick-action" data-nav="crops"><span>🌾</span>${t("My Crops")}</button>
          <button class="quick-action" data-nav="payments"><span>₹</span>${t("Payments")}</button>
          <button class="quick-action" data-action="open-notifications"><span>🔔</span>${t("Notifications")}</button>
        </div>
      </section>
    </div>

    <div class="dashboard-grid" style="margin-top:20px">
      <section class="card">
        <div class="section-heading">
          <div>
            <h2>${t("Recommended for you")}</h2>
            <p>Verified procurement centres near your district.</p>
          </div>
          <button class="ghost-btn small" data-nav="centres">${t("View all")}</button>
        </div>
        <div class="centre-grid">${(data.recommendations || []).map(centreCard).join("")}</div>
      </section>
      <section class="card">
        <div class="section-heading">
          <div><h2>${t("Recent updates")}</h2></div>
        </div>
        <div class="notification-list">${(data.notifications || []).map(noticeItem).join("")}</div>
      </section>
    </div>
  `;
}

function centreCard(centre) {
  const util = centre.utilization ?? Math.round(((centre.booked || 0) / (centre.capacity || 1)) * 100);
  const availability = centre.availability ?? Math.max(0, (centre.capacity || 0) - (centre.booked || 0));
  const level = util > 95 ? "danger" : util > 85 ? "warn" : "";

  return `
    <article class="centre-card animate-card">
      <div style="display:flex;justify-content:space-between;gap:8px">
        ${verifiedBadge(centre.verified)}
        <span style="font-size:11px;color:var(--muted)">${centre.distance ? `⌖ ${centre.distance} km` : ""}</span>
      </div>
      <h3>${esc(centre.name)}</h3>
      <p class="meta">📍 ${esc(centre.locality || centre.district)}</p>
      <div class="crop-tags">
        ${(centre.crops || []).map((crop) => `<span class="crop-tag">🌾 ${t(crop)}</span>`).join("")}
      </div>
      <div class="centre-facts">
        <div>${t("Current queue")}<strong>${centre.queue || 0} ${t("farmers")}</strong></div>
        <div>${t("Estimated wait")}<strong>${centre.estimatedWait || 0} min</strong></div>
      </div>
      <div class="utilization">
        <div class="util-row">
          <span>${availability} ${t("slots available")}</span>
          <strong>${util}% ${t("utilized")}</strong>
        </div>
        <div class="progress ${level}"><span style="width:${Math.min(100, util)}%"></span></div>
      </div>
      <div class="card-actions" style="margin-top:15px">
        <button class="ghost-btn small" data-centre="${centre.id}">${t("View centre")}</button>
        <button class="primary-btn small" data-book-centre="${centre.id}">${t("Book slot")}</button>
      </div>
    </article>
  `;
}

function noticeItem(item) {
  const typeIcon = {
    BOOKING: "✓",
    QUEUE: "◉",
    PROCUREMENT: "📦",
    PAYMENT: "₹",
    CALL: "📣",
    CENTRE: "⌖",
  }[item.type] || "●";

  return `
    <article class="notice">
      <span class="notice-icon">${typeIcon}</span>
      <div>
        <strong>${esc(item.title)}</strong>
        <p>${esc(item.message)}</p>
        <time>${esc(item.time || "Just now")}</time>
      </div>
    </article>
  `;
}

async function centresPage() {
  const centres = await api("/api/centres");
  state.cache.centres = centres;

  return `
    <div class="section-heading" style="margin-top:0">
      <div>
        <h2>${t("Verified procurement centres")}</h2>
        <p>Browse by centre name, district, or supported crop.</p>
      </div>
      <span class="demo-pill">✓ VERIFIED CENTRES</span>
    </div>

    <div class="filters">
      <input class="search-input" id="centre-search" placeholder="${t("Search by centre, district, or town")}..." />
      <select id="crop-filter">
        <option value="all">${t("All crops")}</option>
        <option value="Paddy">${t("Paddy")}</option>
        <option value="Wheat">${t("Wheat")}</option>
        <option value="Maize">${t("Maize")}</option>
        <option value="Mustard">${t("Mustard")}</option>
        <option value="Potato">${t("Potato")}</option>
        <option value="Pulses">${t("Pulses")}</option>
      </select>
      <select id="availability-filter">
        <option value="all">${t("All availability")}</option>
        <option value="open">${t("Accepting bookings")}</option>
        <option value="low">${t("Low queue (under 10)")}</option>
      </select>
    </div>

    <div class="centre-grid" id="centre-results">
      ${centres.length ? centres.map(centreCard).join("") : `<div class="empty">${t("No centres match those filters.")}</div>`}
    </div>
  `;
}

function slotButton(slot, action, selectedId = "") {
  const isPast = slot.isPast;
  const isFull = slot.available === 0 && !isPast;
  const unavailable = isPast || isFull;

  const statusText = isPast
    ? t("Closed / Past")
    : isFull
    ? t("Full")
    : `${slot.available} ${t("Available")}`;

  const badgeClass = isPast ? "cancelled" : isFull ? "danger" : "verified";

  const attributes = action === "detail"
    ? `data-slot="${slot.id}" data-centre-slot="${slot.centreId}" data-slot-date="${slot.date}"`
    : `data-book-slot="${slot.id}"`;

  return `
    <button type="button" 
      class="slot ${slot.id === selectedId ? "selected" : ""} ${unavailable ? "full disabled-slot" : ""}" 
      ${unavailable ? "disabled" : ""} 
      ${attributes}>
      <span class="slot-time">${slot.time}</span>
      <small>${slot.booked}/${slot.total} booked · ${statusText}</small>
      <span class="badge ${badgeClass}">${statusText}</span>
    </button>
  `;
}

async function centreDetailPage() {
  let centre = state.selectedCentre;
  if (!centre) {
    const all = state.cache.centres || (await api("/api/centres"));
    centre = all[0];
  }
  const suffix = state.centreDate ? `?date=${encodeURIComponent(state.centreDate)}` : "";
  const data = await api(`/api/centres/${centre.id}${suffix}`);
  state.selectedCentre = data;
  state.centreDate = data.selectedDate;

  return `
    <button class="ghost-btn small" data-nav="centres">← ${t("Find Centre")}</button>
    <div class="split-grid" style="margin-top:15px">
      <section class="card">
        <div style="display:flex;justify-content:space-between;gap:12px">
          ${verifiedBadge(data.verified)}
          <span class="demo-pill">${data.id}</span>
        </div>
        <h2 class="detail-title">${esc(data.name)}</h2>
        <p class="detail-sub">📍 ${esc(data.locality)} · ${esc(data.address)}</p>
        <div class="crop-tags" style="margin-top:16px">
          ${(data.crops || []).map((crop) => `<span class="crop-tag">🌾 ${t(crop)}</span>`).join("")}
        </div>
        <div class="detail-facts">
          <div class="detail-fact"><span>Working hours</span><strong>${esc(data.hours)}</strong></div>
          <div class="detail-fact"><span>Daily capacity</span><strong>${data.capacity} farmers</strong></div>
          <div class="detail-fact"><span>Current queue</span><strong>${data.queue} farmers</strong></div>
          <div class="detail-fact"><span>Estimated wait</span><strong>${data.estimatedWait} min</strong></div>
        </div>
      </section>

      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div>
            <h2>${t("Available time")}</h2>
            <p>${t("Choose an open date and time.")}</p>
          </div>
        </div>
        <label class="date-control">
          <span>${t("Booking date")}</span>
          <input id="centre-date" type="date" value="${data.selectedDate}" min="${data.minBookingDate}" max="${data.maxBookingDate}" />
        </label>
        <div class="slot-list" style="margin-top:14px">
          ${(data.slots || []).map((slot) => slotButton(slot, "detail")).join("")}
        </div>
        <button class="primary-btn full" style="margin-top:16px" data-book-centre="${data.id}">
          ${t("Book a Slot")} →
        </button>
      </section>
    </div>
  `;
}

async function bookingPage() {
  const centres = state.cache.centres || (await api("/api/centres"));
  let centre = state.selectedCentre || centres[0];
  if (!centre.id || !centre.id.startsWith("CTR")) centre = centres[0];

  const todayStr = getTodayStr();
  if (state.bookingDate && state.bookingDate < todayStr) {
    state.bookingDate = todayStr;
  }

  const suffix = state.bookingDate ? `?date=${encodeURIComponent(state.bookingDate)}` : "";
  const detail = await api(`/api/centres/${centre.id}${suffix}`);
  state.selectedCentre = detail;
  state.bookingDate = detail.selectedDate;

  // Auto-select first available open slot
  const selected = (detail.slots || []).find(
    (slot) => slot.id === state.selectedSlot?.id && !slot.isPast && slot.available > 0
  ) || (detail.slots || []).find((slot) => !slot.isPast && slot.available > 0);

  return `
    <div class="booking-layout">
      <aside class="card">
        <div class="section-heading" style="margin-top:0">
          <div>
            <h2>${t("Simple booking")}</h2>
            <p>${t("Choose an open date and time.")}</p>
          </div>
        </div>
        <div class="steps">
          <div class="step active"><span class="step-num">1</span>${t("Crop")}</div>
          <div class="step active"><span class="step-num">2</span>${t("Quantity")}</div>
          <div class="step active"><span class="step-num">3</span>${t("Procurement centre")}</div>
          <div class="step active"><span class="step-num">4</span>${t("Booking date")}</div>
          <div class="step active"><span class="step-num">5</span>${t("Available time")}</div>
          <div class="step"><span class="step-num">6</span>${t("Token")}</div>
        </div>
        <div class="booking-tip">
          <strong>📅 Date Validation</strong>
          <p>You can book appointments from <strong>${displayDate(detail.minBookingDate)}</strong> to <strong>${displayDate(detail.maxBookingDate)}</strong>. Previous days are disabled.</p>
        </div>
      </aside>

      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div>
            <h2>${t("Book a procurement slot")}</h2>
            <p>Live slot availability updates in real time.</p>
          </div>
          ${verifiedBadge("VERIFIED")}
        </div>

        <form id="booking-form" class="form-grid">
          <div class="form-group">
            <label>${t("Crop")}</label>
            <select name="crop">
              <option value="Paddy">${t("Paddy")}</option>
              <option value="Wheat">${t("Wheat")}</option>
              <option value="Maize">${t("Maize")}</option>
              <option value="Mustard">${t("Mustard")}</option>
              <option value="Potato">${t("Potato")}</option>
              <option value="Pulses">${t("Pulses")}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t("Crop variety")}</label>
            <input name="variety" value="Swarna" required />
          </div>
          <div class="form-group">
            <label>${t("Quantity")}</label>
            <input name="quantity" type="number" value="800" min="1" required />
          </div>
          <div class="form-group">
            <label>${t("Unit")}</label>
            <select name="unit">
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t("Procurement centre")}</label>
            <select name="centreId" id="booking-centre">
              ${centres.map((item) => `<option value="${item.id}" ${item.id === centre.id ? "selected" : ""}>${esc(item.name)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>${t("Booking date")}</label>
            <input name="date" id="booking-date" type="date" value="${detail.selectedDate}" min="${detail.minBookingDate}" max="${detail.maxBookingDate}" required />
          </div>

          <div class="form-group full-span">
            <label>${t("Available time")}</label>
            <div class="slot-list" id="booking-slots">
              ${(detail.slots || []).map((slot) => slotButton(slot, "booking", selected?.id)).join("")}
            </div>
          </div>

          <div class="form-group full-span">
            <input type="hidden" name="slotId" value="${selected?.id || ""}" />
            <button class="primary-btn full" type="submit" ${selected ? "" : "disabled"}>
              ${t("Confirm booking & generate token")} →
            </button>
            <p class="form-help">A unique Booking Tracking ID and token will be assigned to your appointment.</p>
          </div>
        </form>
      </section>
    </div>
  `;
}

function bookingSuccess(booking) {
  return `
    <section class="card booking-confirm animate-pop">
      <div class="success-orb">✓</div>
      <h2>${t("Booking confirmed")}</h2>
      <p>${t("Keep this booking reference to track your procurement visit.")}</p>

      <div class="booking-id-highlight">
        <div class="highlight-item">
          <span>${t("Booking ID")}</span>
          <strong class="highlight-id">${esc(booking.id)}</strong>
        </div>
        <div class="highlight-item">
          <span>${t("Token")}</span>
          <strong class="highlight-token">${esc(booking.token)}</strong>
        </div>
        <div class="highlight-item">
          <span>${t("Date")}</span>
          <strong>${displayDate(booking.date)}</strong>
        </div>
        <div class="highlight-item">
          <span>${t("Time")}</span>
          <strong>${esc(booking.time)}</strong>
        </div>
        <div class="highlight-item full-width">
          <span>${t("Procurement centre")}</span>
          <strong>${esc(booking.centre?.name || "")}</strong>
        </div>
      </div>

      <div class="qr-box">
        <div class="qr" aria-label="QR Code">${[
          "██  ████  ██",
          "  ██  ██  █ ",
          "████  ██ ███",
          "██  ███  ██ ",
          " ███  ███   ",
        ].join("<br>")}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:6px">Scan or show this reference at arrival</div>
      </div>

      <div style="display:flex;justify-content:center;gap:12px;margin-top:20px">
        <button class="ghost-btn" data-nav="queue">${t("Track live queue")}</button>
        <button class="primary-btn" data-nav="dashboard">${t("Go to dashboard")}</button>
      </div>
    </section>
  `;
}

async function queuePage() {
  const bookings = await api("/api/bookings");
  const booking =
    state.selectedBooking ||
    bookings.find((item) => item.status !== "COMPLETED") ||
    bookings[0];

  if (!booking) {
    return `
      <section class="card empty">
        <h2>${t("No active booking yet.")}</h2>
        <p>Book a verified procurement centre to receive your digital token.</p>
        <button class="primary-btn" data-nav="booking">${t("Book a Slot")}</button>
      </section>
    `;
  }

  state.selectedBooking = booking;
  const queue = await api(`/api/queue/${booking.id}`);

  if (state.user.role === "BUYER") {
    return buyerQueuePage(bookings, queue);
  }

  const timeline = [
    [t("Booking confirmed"), true, `Booking ID: ${booking.id} · Token ${booking.token}`],
    [
      t("Check in"),
      ["CHECKED_IN", "WAITING", "CALLED", "PROCESSING", "COMPLETED"].includes(booking.status),
      "Centre arrival recorded.",
    ],
    [
      "Crop Verification",
      !!booking.procurement,
      booking.procurement?.accepted ? "Crop accepted in standard inspection." : "Awaiting inspection.",
    ],
    [
      "Weight Measurement",
      !!booking.procurement?.measuredQuantity,
      booking.procurement?.measuredQuantity ? `${booking.procurement.measuredQuantity} ${booking.unit} recorded.` : "Pending measurement.",
    ],
    [
      t("Procurement"),
      booking.procurement?.status === "COMPLETED",
      booking.procurement?.status === "COMPLETED" ? "Procurement verified." : "In progress.",
    ],
    [
      t("Payment"),
      booking.payment?.status === "COMPLETED",
      booking.payment?.status === "COMPLETED" ? `Completed · ${booking.payment?.transactionId}` : "Processing.",
    ],
  ];

  const servingToken = queue.nowServing && queue.nowServing !== "—" ? queue.nowServing : booking.token;
  const isCompleted = booking.status === "COMPLETED" || queue.nowServingStatus === "Procurement Completed";

  return `
    <div class="split-grid">
      <section class="card queue-board animate-card">
        <div class="now-serving-header">
          <h3>${t("Now serving")}</h3>
          <span class="now-status-pill ${isCompleted ? "pill-completed" : "pill-active"}">
            ● ${queue.nowServingStatus || (isCompleted ? "Completed" : "Serving Counter 1")}
          </span>
        </div>
        <div class="now-token ${isCompleted ? "token-done" : "pulse-token"}">${servingToken}</div>
        <div class="now-centre-location">📍 ${esc(booking.centre?.name || "Procurement Centre")}</div>

        <div class="queue-details" style="margin-top:21px">
          <div class="queue-detail" style="color:var(--ink)"><span>${t("Your token")}</span><strong>${queue.yourToken || booking.token}</strong></div>
          <div class="queue-detail" style="color:var(--ink)"><span>${t("People ahead")}</span><strong>${queue.peopleAhead ?? 0}</strong></div>
          <div class="queue-detail" style="color:var(--ink)"><span>${t("Estimated wait")}</span><strong>${queue.estimatedMinutes ?? 0} min</strong></div>
          <div class="queue-detail" style="color:var(--ink)"><span>Booking ID</span><strong style="font-size:12px">${booking.id}</strong></div>
        </div>
      </section>

      <section class="card animate-card">
        <div class="section-heading" style="margin-top:0">
          <div>
            <h2>${t("Procurement status")}</h2>
            <p>Real-time status updates.</p>
          </div>
          ${statusBadge(booking.status)}
        </div>
        <div class="timeline">
          ${timeline.map(([title, done, copy], index) => `
            <div class="timeline-item ${done ? "done" : index === timeline.findIndex((item) => !item[1]) ? "current" : ""}">
              <div class="timeline-dot">${done ? "✓" : index === timeline.findIndex((item) => !item[1]) ? "◷" : "○"}</div>
              <div class="timeline-copy">
                <strong>${title}</strong>
                <span>${copy}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    </div>

    <section class="card" style="margin-top:20px">
      <div class="section-heading" style="margin-top:0">
        <div>
          <h2>${t("Live queue")}</h2>
          <p>Scheduled tokens for this centre (${(queue.queue || []).length} tokens)</p>
        </div>
      </div>
      <div class="queue-list">
        ${(queue.queue || []).map((item) => `
          <div class="queue-row ${item.token === booking.token ? "active-row" : ""}">
            <span class="queue-token">${item.token}</span>
            <div class="queue-name">
              <strong>${item.token === booking.token ? "★ " + t("Your token") : "Farmer Token"} · <small style="color:var(--green)">${item.bookingId || ""}</small></strong>
              <span>${t(item.crop || booking.crop)} · ${item.time || booking.time}</span>
            </div>
            ${statusBadge(item.status)}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function buyerQueuePage(bookings) {
  const active = bookings.filter((item) =>
    ["WAITING", "CHECKED_IN", "PROCESSING", "BOOKED"].includes(item.status)
  );
  const processing = active.find((item) => item.status === "PROCESSING");

  return `
    <section class="welcome-banner animate-fade">
      <div>
        <div class="eyebrow" style="margin-bottom:6px">Centre Operator Operations</div>
        <h2>${esc(state.cache.dashboard?.centre?.name || "Procurement Centre")}</h2>
        <p>${verifiedBadge("VERIFIED")} &nbsp; Live queue updates are instantly broadcasted to farmers.</p>
      </div>
      <div class="banner-id">
        Currently Serving Token<strong>${processing?.token || "—"}</strong>
      </div>
    </section>

    <div class="dashboard-grid" style="margin-top:20px">
      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div>
            <h2>${t("Live queue")}</h2>
            <p>Call, check in, or complete procurement.</p>
          </div>
          <button class="primary-btn small" data-action="call-next">${t("Call next waiting")}</button>
        </div>

        <div class="queue-list">
          ${active.length ? active.map((item) => `
            <div class="queue-row">
              <span class="queue-token">${item.token}</span>
              <div class="queue-name">
                <strong>${esc(item.farmer?.name || "Farmer")} · <small style="color:var(--green);font-weight:700">${item.id}</small></strong>
                <span>${t(item.crop)} · ${item.quantity} ${item.unit} · ${item.time}</span>
              </div>
              ${statusBadge(item.status)}
              <div style="display:flex;gap:6px">
                ${item.status === "BOOKED" ? `<button class="secondary-btn small" data-queue-action="CHECK_IN" data-booking="${item.id}">${t("Check in")}</button>` : ""}
                ${["WAITING", "CHECKED_IN"].includes(item.status) ? `<button class="primary-btn small pulse-button" data-queue-action="CALL" data-booking="${item.id}">📣 ${t("Call")}</button>` : ""}
                ${item.status === "PROCESSING" ? `<button class="primary-btn small" data-queue-action="COMPLETE" data-booking="${item.id}">✓ ${t("Complete")}</button>` : ""}
              </div>
            </div>
          `).join("") : `<div class="empty">No active farmers in queue right now.</div>`}
        </div>
      </section>

      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div><h2>Operator Quick Guide</h2></div>
        </div>
        <div class="timeline">
          <div class="timeline-item done">
            <div class="timeline-dot">✓</div>
            <div class="timeline-copy"><strong>1. Check in farmer</strong><span>Arrival verified (BOOKED → WAITING)</span></div>
          </div>
          <div class="timeline-item current">
            <div class="timeline-dot">📣</div>
            <div class="timeline-copy"><strong>2. Call farmer</strong><span>Dispatches in-app notification to seller</span></div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot">○</div>
            <div class="timeline-copy"><strong>3. Record quantity & grade</strong><span>FAQ / Grade A measurements</span></div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot">○</div>
            <div class="timeline-copy"><strong>4. Authorize Payment</strong><span>Generates transaction receipt</span></div>
          </div>
        </div>
      </section>
    </div>
  `;
}

async function cropsPage() {
  const bookings = await api("/api/bookings");
  return `
    <div class="section-heading" style="margin-top:0">
      <div>
        <h2>${t("Registered crops")}</h2>
        <p>${t("Your crop declarations used for booking slots.")}</p>
      </div>
      <button class="primary-btn small" data-nav="booking">${t("Add crop & book")}</button>
    </div>

    <div class="centre-grid">
      ${bookings.length ? bookings.map((item) => `
        <article class="centre-card animate-card">
          <div style="font-size:26px">🌾</div>
          <h3>${t(item.crop)} <span style="font-size:12px;color:var(--muted)">(${esc(item.variety || "Standard")})</span></h3>
          <p class="meta">Booking ID: <strong>${item.id}</strong></p>
          <div class="centre-facts">
            <div>Quantity<strong>${item.quantity} ${item.unit}</strong></div>
            <div>Date<strong>${displayDate(item.date)}</strong></div>
          </div>
          <div class="card-actions">
            <button class="ghost-btn small" data-booking-view="${item.id}">View Live Queue</button>
            ${statusBadge(item.status)}
          </div>
        </article>
      `).join("") : `<div class="empty">No crops added yet.</div>`}
    </div>
  `;
}

async function paymentsPage() {
  const bookings = await api("/api/bookings");
  const isBuyer = state.user.role === "BUYER";

  return `
    <div class="section-heading" style="margin-top:0">
      <div>
        <h2>${t("Payments & Procurement")}</h2>
        <p>Record of procurement transactions and payment confirmations.</p>
      </div>
      <span class="demo-pill">PAYMENTS</span>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Booking ID / Token</th>
            <th>Farmer</th>
            <th>Crop</th>
            <th>Accepted Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map((item) => {
            const p = item.payment;
            return `
              <tr>
                <td><strong>${item.id}</strong><br><span style="font-size:11px;color:var(--green);font-weight:750">${item.token}</span></td>
                <td>${esc(item.farmer?.name || "Farmer")}</td>
                <td>${t(item.crop)}</td>
                <td>${item.procurement?.measuredQuantity || item.quantity} ${item.unit}</td>
                <td>${p?.rate ? money(p.rate) + "/kg" : "—"}</td>
                <td>${p?.amount ? money(p.amount) : "—"}</td>
                <td>${statusBadge(p?.status || "PENDING")}</td>
                <td>
                  ${isBuyer && p?.status === "PROCESSING"
                    ? `<button class="primary-btn small" data-payment="${item.id}">Complete Payment</button>`
                    : p?.transactionId
                    ? `<span style="font-size:11px;color:var(--green);font-weight:800">${p.transactionId}</span>`
                    : "—"}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function buyerDashboard() {
  const data = await api("/api/dashboard");
  state.cache.dashboard = data;
  const { centre, stats } = data;

  const cards = [
    ["▦", "Total slots", stats?.totalSlots || 0],
    ["🎫", "Booked", stats?.booked || 0],
    ["✓", "Checked in", stats?.checkedIn || 0],
    ["◒", "Completed", stats?.completed || 0],
    ["◉", "Waiting", stats?.waiting || 0],
  ];

  return `
    <section class="welcome-banner animate-fade">
      <div>
        <div class="eyebrow" style="margin-bottom:6px">Centre Operator Portal</div>
        <h2>${esc(centre.name)}</h2>
        <p>${verifiedBadge(centre.verified)} &nbsp; ${esc(centre.district)} · ${centre.hours}</p>
      </div>
      <div class="banner-id">
        Daily Capacity<strong>${centre.capacity} Farmers</strong>
      </div>
    </section>

    <section class="stat-grid">
      ${cards.map(([icon, label, value]) => `
        <article class="stat-card">
          <div class="stat-icon">${icon}</div>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `).join("")}
    </section>

    <div class="dashboard-grid">
      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div><h2>Today's Live Queue</h2></div>
          <button class="primary-btn small" data-nav="queue">Open Live Queue</button>
        </div>
        <div class="queue-list">
          ${(data.bookings || []).filter((b) => b.status !== "COMPLETED").slice(0, 5).map((item) => `
            <div class="queue-row">
              <span class="queue-token">${item.token}</span>
              <div class="queue-name">
                <strong>${esc(item.farmer?.name || "")} · <small style="color:var(--green)">${item.id}</small></strong>
                <span>${t(item.crop)} · ${item.quantity} kg</span>
              </div>
              ${statusBadge(item.status)}
            </div>
          `).join("") || '<div class="empty">No active queue entries.</div>'}
        </div>
      </section>

      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div><h2>Procurement Performance</h2></div>
        </div>
        <div class="queue-details" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="queue-detail"><span>Procured Quantity</span><strong>${stats?.quantity || 0} kg</strong></div>
          <div class="queue-detail"><span>Procurement Value</span><strong>${money(stats?.procurement || 0)}</strong></div>
          <div class="queue-detail"><span>Pending Payments</span><strong>${money(stats?.pendingPayments || 0)}</strong></div>
          <div class="queue-detail"><span>Utilization</span><strong>${Math.round(((centre.booked || 0) / (centre.capacity || 1)) * 100)}%</strong></div>
        </div>
      </section>
    </div>
  `;
}

async function bookingsPage() {
  const bookings = await api("/api/bookings");
  return `
    <div class="section-heading" style="margin-top:0">
      <div>
        <h2>${t("Farmer Bookings")}</h2>
        <p>Bookings scheduled at this centre</p>
      </div>
      <button class="ghost-btn small" data-nav="queue">${t("Live Queue")}</button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Token / Booking ID</th>
            <th>Farmer</th>
            <th>Crop</th>
            <th>Quantity</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map((item) => `
            <tr>
              <td><strong>${item.token}</strong><br><span style="font-size:11px;color:var(--muted)">${item.id}</span></td>
              <td>${esc(item.farmer?.name || "Farmer")}</td>
              <td>${t(item.crop)}</td>
              <td>${item.quantity} ${item.unit}</td>
              <td>${displayDate(item.date)} · ${item.time}</td>
              <td>${statusBadge(item.status)}</td>
              <td>
                ${item.status === "PROCESSING"
                  ? `<button class="primary-btn small" data-queue-action="COMPLETE" data-booking="${item.id}">Verify & Complete</button>`
                  : `<button class="ghost-btn small" data-booking-view="${item.id}">View</button>`}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function adminDashboard() {
  const data = await api("/api/dashboard");
  state.cache.dashboard = data;
  const kpis = [
    ["Total Farmers", data.stats.totalFarmers],
    ["Verified Farmers", data.stats.verifiedFarmers],
    ["Centres", data.stats.centres],
    ["Verified Centres", data.stats.verifiedCentres],
    ["Bookings", data.stats.bookings],
    ["Pending Payments", money(data.stats.pendingPayments)],
  ];

  return `
    <section class="welcome-banner animate-fade">
      <div>
        <div class="eyebrow" style="margin-bottom:6px">KisanSetu Platform Administrator</div>
        <h2>Good morning, Administrator 👋</h2>
        <p>Monitor procurement centres, verification requests, and transaction logs.</p>
      </div>
      <div class="banner-id">
        Pending Verifications<strong>${(data.verificationRequests || []).length}</strong>
      </div>
    </section>

    <section class="admin-kpis" style="margin:20px 0">
      ${kpis.map(([label, value]) => `
        <article class="admin-kpi">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `).join("")}
    </section>

    <div class="dashboard-grid">
      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div><h2>Procurement Centres</h2></div>
          <button class="ghost-btn small" data-nav="centres">View all</button>
        </div>
        <div class="centre-grid">${(data.centres || []).slice(0, 4).map(centreCard).join("")}</div>
      </section>

      <section class="card">
        <div class="section-heading" style="margin-top:0">
          <div><h2>Verification Requests</h2></div>
        </div>
        <div class="notification-list">
          ${(data.verificationRequests || []).map((req) => `
            <div class="notice">
              <span class="notice-icon">🏢</span>
              <div>
                <strong>${esc(req.centre?.name || "Centre")}</strong>
                <p>${esc(req.stage)} · ${req.submitted}</p>
                <button class="secondary-btn small" style="margin-top:6px" data-review="${req.id}">Review Request</button>
              </div>
            </div>
          `).join("") || '<div class="empty">No pending verifications.</div>'}
        </div>
      </section>
    </div>
  `;
}

async function verificationsPage() {
  const requests = await api("/api/admin/verifications");
  state.cache.verifications = requests;

  return `
    <div class="section-heading" style="margin-top:0">
      <div>
        <h2>${t("Verification Requests")}</h2>
        <p>Review and verify centre registrations.</p>
      </div>
    </div>
    <section class="card">
      ${requests.map((request) => `
        <article class="verification-card">
          <div class="vr-icon">🏢</div>
          <div class="verification-main">
            <h3>${esc(request.centre?.name || "Centre")}</h3>
            <p>${esc(request.centre?.district || "")} · Submitted: ${request.submitted}</p>
            <p style="margin-top:4px"><strong>${esc(request.stage)}</strong> &nbsp; ${statusBadge(request.status)}</p>
          </div>
          <div style="display:flex;gap:7px">
            <button class="primary-btn small" data-approve="${request.id}">Approve</button>
            <button class="danger-btn small" data-reject="${request.id}">Reject</button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

async function adminCentresPage() {
  const centres = await api("/api/centres");
  return `
    <div class="section-heading" style="margin-top:0">
      <div><h2>${t("Centres")}</h2></div>
    </div>
    <div class="centre-grid">${centres.map(centreCard).join("")}</div>
  `;
}

async function mapPage() {
  const centres = await api("/api/centres");
  return `
    <div class="section-heading" style="margin-top:0">
      <div><h2>${t("Procurement Centre Map")}</h2></div>
    </div>
    <section class="map-surface">
      ${centres.slice(0, 5).map((centre, index) => {
        const coords = [[20, 28], [45, 55], [18, 70], [64, 32], [70, 72]][index];
        return `
          <button class="map-marker" style="left:${coords[0]}%;top:${coords[1]}%" data-centre="${centre.id}"></button>
          <span class="map-label" style="left:${coords[0] + 3}%;top:${coords[1] + 8}%">${esc(centre.short)}<br><small>${centre.queue} in queue</small></span>
        `;
      }).join("")}
    </section>
    <div class="centre-grid" style="margin-top:20px">${centres.slice(0, 3).map(centreCard).join("")}</div>
  `;
}

function notificationModal() {
  const notifications = state.cache.notifications || [];
  return `
    <div class="modal-backdrop animate-fade" id="modal">
      <section class="modal animate-pop">
        <div class="modal-head">
          <div>
            <h2>${t("Notifications")}</h2>
            <p class="form-help">In-app notifications and procurement announcements.</p>
          </div>
          <button class="modal-close" data-close-modal>×</button>
        </div>
        <div class="notification-list">
          ${notifications.length ? notifications.map(noticeItem).join("") : `<div class="empty">${t("No new notifications.")}</div>`}
        </div>
      </section>
    </div>
  `;
}

async function renderView() {
  let content = "";
  if (state.user.role === "FARMER") {
    if (state.view === "dashboard") content = await farmerDashboard();
    else if (state.view === "centres") content = await centresPage();
    else if (state.view === "centre-detail") content = await centreDetailPage();
    else if (state.view === "booking") content = await bookingPage();
    else if (state.view === "queue") content = await queuePage();
    else if (state.view === "crops") content = await cropsPage();
    else if (state.view === "payments") content = await paymentsPage();
  } else if (state.user.role === "BUYER") {
    if (state.view === "dashboard") content = await buyerDashboard();
    else if (state.view === "queue") content = await queuePage();
    else if (state.view === "bookings") content = await bookingsPage();
    else if (state.view === "payments") content = await paymentsPage();
  } else {
    if (state.view === "dashboard") content = await adminDashboard();
    else if (state.view === "verifications") content = await verificationsPage();
    else if (state.view === "centres") content = await adminCentresPage();
    else if (state.view === "map") content = await mapPage();
  }
  return appShell(content);
}

async function render() {
  try {
    if (!state.user || !state.token) {
      app.innerHTML = loginPage();
      bindLogin();
      return;
    }
    app.innerHTML = '<div class="empty" style="padding:80px">Loading KisanSetu workspace…</div>';
    await refreshNotifications();
    app.innerHTML = await renderView();
    bindApp();
    startNotificationPolling();

    if (state.view === "queue") {
      state.poller = setInterval(async () => {
        if (state.view === "queue" && state.selectedBooking) {
          try {
            const queue = await api(`/api/queue/${state.selectedBooking.id}`);
            const servingEl = document.querySelector(".now-token");
            if (servingEl && queue.nowServing && queue.nowServing !== "—") {
              servingEl.textContent = queue.nowServing;
            }
          } catch (e) {}
        }
      }, 5000);
    }
  } catch (error) {
    if (/sign in/i.test(error.message)) {
      logout();
      toast("Your session has expired. Please sign in again.");
    } else {
      app.innerHTML = appShell(
        `<section class="card empty">
          <h2>We couldn’t load this page</h2>
          <p>${esc(error.message)}</p>
          <button class="primary-btn" id="retry">Try again</button>
        </section>`
      );
      document.querySelector("#retry")?.addEventListener("click", render);
    }
  }
}

function bindLogin() {
  document.querySelectorAll(".language-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      state.language = e.target.value;
      localStorage.setItem("agri_language", state.language);
      render();
    });
  });

  document.querySelectorAll("[data-role]").forEach((button) =>
    button.addEventListener("click", () => {
      state.loginRole = button.dataset.role;
      state.loginScreen = "login";
      render();
    })
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
    })
  );

  document.querySelectorAll("[data-open-info]").forEach((button) =>
    button.addEventListener("click", () => {
      openInfoModal(button.dataset.openInfo);
    })
  );

  document.querySelector("#btn-scroll-down")?.addEventListener("click", () => {
    document.querySelector("#trust-footer")?.scrollIntoView({ behavior: "smooth" });
  });

  document.querySelector("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...values, role: state.loginRole }),
      });
      saveSession(result.token, result.user);
      state.view = "dashboard";
      toast(`Signed in successfully as ${result.user.name}.`);
      render();
    } catch (error) {
      toast(error.message, "danger");
    }
  });

  document.querySelector("#register-form")?.addEventListener("submit", async (event) => {
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
      toast(error.message, "danger");
    }
  });
}

function bindApp() {
  document.querySelector("#logout-button")?.addEventListener("click", logout);

  document.querySelectorAll(".language-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      state.language = e.target.value;
      localStorage.setItem("agri_language", state.language);
      render();
    });
  });

  const sidebar = document.querySelector("#sidebar");
  const overlay = document.querySelector("#sidebar-overlay");

  const toggleSidebar = () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("open");
  };

  const closeSidebar = () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
  };

  document.querySelector("#mobile-menu")?.addEventListener("click", toggleSidebar);
  overlay?.addEventListener("click", closeSidebar);

  document.querySelectorAll("[data-nav]").forEach((button) =>
    button.addEventListener("click", () => {
      closeSidebar();
      setView(button.dataset.nav);
    })
  );

  document.querySelectorAll("[data-centre]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = (state.cache.centres || []).find((c) => c.id === button.dataset.centre);
      state.selectedCentre = item || { id: button.dataset.centre };
      setView("centre-detail");
    })
  );

  document.querySelectorAll("[data-book-centre]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = (state.cache.centres || []).find((c) => c.id === button.dataset.bookCentre);
      state.selectedCentre = item || { id: button.dataset.bookCentre };
      state.selectedSlot = null;
      if (state.centreDate) state.bookingDate = state.centreDate;
      setView("booking");
    })
  );

  document.querySelectorAll("[data-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      state.selectedCentre = { id: button.dataset.centreSlot };
      state.selectedSlot = { id: button.dataset.slot };
      state.bookingDate = button.dataset.slotDate;
      setView("booking");
    })
  );

  document.querySelectorAll("[data-book-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      state.selectedSlot = { id: button.dataset.bookSlot };
      document.querySelectorAll("[data-book-slot]").forEach((item) => {
        item.classList.toggle("selected", item === button);
      });
      const input = document.querySelector('[name="slotId"]');
      if (input) input.value = button.dataset.bookSlot;
    })
  );

  document.querySelector("#booking-centre")?.addEventListener("change", (event) => {
    state.selectedCentre = { id: event.target.value };
    state.selectedSlot = null;
    render();
  });

  // Strict date validation on Centre detail
  document.querySelector("#centre-date")?.addEventListener("change", (event) => {
    const todayStr = getTodayStr();
    if (event.target.value < todayStr) {
      toast(t("Previous dates cannot be booked. Please choose today or a future date."), "warn");
      event.target.value = todayStr;
      state.centreDate = todayStr;
    } else {
      state.centreDate = event.target.value;
    }
    state.selectedSlot = null;
    render();
  });

  // Strict date validation on Booking page
  document.querySelector("#booking-date")?.addEventListener("change", (event) => {
    const todayStr = getTodayStr();
    if (event.target.value < todayStr) {
      toast(t("Previous dates cannot be booked. Please choose today or a future date."), "warn");
      event.target.value = todayStr;
      state.bookingDate = todayStr;
    } else {
      state.bookingDate = event.target.value;
    }
    state.selectedSlot = null;
    render();
  });

  // Booking form submission
  document.querySelector("#booking-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));

    if (!values.slotId) {
      toast("Please select an available time slot.", "warn");
      return;
    }

    try {
      const result = await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify(values),
      });
      state.selectedBooking = result.booking;
      await refreshNotifications();
      app.innerHTML = appShell(bookingSuccess(result.booking));
      bindApp();
      toast(`Booking confirmed! Your Token is ${result.booking.token}`);
    } catch (error) {
      toast(error.message, "danger");
    }
  });

  document.querySelectorAll("[data-booking-view]").forEach((button) =>
    button.addEventListener("click", async () => {
      const items = await api("/api/bookings");
      state.selectedBooking = items.find((item) => item.id === button.dataset.bookingView);
      setView("queue");
    })
  );

  // Buyer queue actions (CHECK_IN, CALL, COMPLETE)
  document.querySelectorAll("[data-queue-action]").forEach((button) =>
    button.addEventListener("click", async () => {
      const action = button.dataset.queueAction;
      const bookingId = button.dataset.booking;

      if (action === "COMPLETE") {
        openCompleteModal(bookingId);
        return;
      }

      try {
        await api(`/api/buyer/bookings/${bookingId}/action`, {
          method: "POST",
          body: JSON.stringify({ action }),
        });

        if (action === "CALL") {
          toast("Farmer token called. A notification was dispatched to the seller.");
        } else {
          toast("Queue status updated.");
        }
        render();
      } catch (error) {
        toast(error.message, "danger");
      }
    })
  );

  document.querySelector('[data-action="call-next"]')?.addEventListener("click", async () => {
    try {
      const bookings = await api("/api/bookings");
      const next = bookings.find((item) => ["WAITING", "CHECKED_IN"].includes(item.status));
      if (!next) {
        toast("No waiting farmers are available to call.", "warn");
        return;
      }
      await api(`/api/buyer/bookings/${next.id}/action`, {
        method: "POST",
        body: JSON.stringify({ action: "CALL" }),
      });
      toast(`Token ${next.token} called! Farmer has been notified.`);
      render();
    } catch (error) {
      toast(error.message, "danger");
    }
  });

  document.querySelectorAll("[data-payment]").forEach((button) =>
    button.addEventListener("click", async () => {
      try {
        await api(`/api/payments/${button.dataset.payment}/complete`, {
          method: "POST",
          body: "{}",
        });
        toast("Payment successfully completed!");
        render();
      } catch (error) {
        toast(error.message, "danger");
      }
    })
  );

  document.querySelectorAll("[data-approve]").forEach((button) =>
    button.addEventListener("click", () => verificationAction(button.dataset.approve, "approve"))
  );
  document.querySelectorAll("[data-reject]").forEach((button) =>
    button.addEventListener("click", () => verificationAction(button.dataset.reject, "reject"))
  );

  document.querySelectorAll("[data-review]").forEach((button) =>
    button.addEventListener("click", () => {
      const request = (state.cache.verifications || state.cache.dashboard?.verificationRequests || []).find(
        (item) => item.id === button.dataset.review
      );
      if (request) {
        document.body.insertAdjacentHTML("beforeend", reviewModal(request));
        bindModal();
      }
    })
  );

  const openNotifModal = async () => {
    document.body.insertAdjacentHTML("beforeend", notificationModal());
    bindModal();
    // Mark notifications as read
    try {
      await api("/api/notifications/read", { method: "POST" });
      if (state.cache.notifications) {
        state.cache.notifications.forEach((n) => (n.read = true));
      }
      updateNotificationIndicator();
    } catch (e) {}
  };

  document.querySelector("#notification-button")?.addEventListener("click", openNotifModal);
  document.querySelector('[data-action="open-notifications"]')?.addEventListener("click", openNotifModal);
  document.querySelector('[data-action="go-book"]')?.addEventListener("click", () => setView("booking"));

  bindFilters();
}

/**
 * Filter centres by search term (district/name/locality/address), crop, and availability.
 * Debounced and safe against page freeze.
 */
function bindFilters() {
  const searchInput = document.querySelector("#centre-search");
  const cropFilter = document.querySelector("#crop-filter");
  const availFilter = document.querySelector("#availability-filter");

  if (!searchInput && !cropFilter && !availFilter) return;

  let debounceTimer = null;

  const performFilter = () => {
    try {
      const rows = state.cache.centres || [];
      const term = (searchInput?.value || "").trim().toLowerCase();
      const selectedCrop = cropFilter?.value || "all";
      const selectedAvail = availFilter?.value || "all";

      const filtered = rows.filter((centre) => {
        const searchPool = `${centre.name || ""} ${centre.district || ""} ${centre.locality || ""} ${centre.address || ""} ${(centre.crops || []).join(" ")}`.toLowerCase();
        const matchesTerm = !term || searchPool.includes(term);

        const matchesCrop =
          selectedCrop === "all" ||
          selectedCrop === "All crops" ||
          (centre.crops || []).includes(selectedCrop);

        const matchesAvail =
          selectedAvail === "all" ||
          (selectedAvail === "open" && (centre.booked || 0) < (centre.capacity || 100)) ||
          (selectedAvail === "low" && (centre.queue || 0) < 10);

        return matchesTerm && matchesCrop && matchesAvail;
      });

      const target = document.querySelector("#centre-results");
      if (target) {
        target.innerHTML = filtered.length
          ? filtered.map(centreCard).join("")
          : `<div class="empty">${t("No centres match those filters.")}</div>`;

        bindFilteredCentreCards(target);
      }
    } catch (e) {
      console.error("Filter error guarded:", e);
    }
  };

  searchInput?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performFilter, 150);
  });
  cropFilter?.addEventListener("change", performFilter);
  availFilter?.addEventListener("change", performFilter);
}

function bindFilteredCentreCards(container) {
  container.querySelectorAll("[data-centre]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = (state.cache.centres || []).find((c) => c.id === button.dataset.centre);
      state.selectedCentre = item || { id: button.dataset.centre };
      setView("centre-detail");
    })
  );
  container.querySelectorAll("[data-book-centre]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = (state.cache.centres || []).find((c) => c.id === button.dataset.bookCentre);
      state.selectedCentre = item || { id: button.dataset.bookCentre };
      state.selectedSlot = null;
      setView("booking");
    })
  );
}

function bindModal() {
  document.querySelector("[data-close-modal]")?.addEventListener("click", () => {
    document.querySelector("#modal")?.remove();
  });
  document.querySelector("#modal")?.addEventListener("click", (event) => {
    if (event.target.id === "modal") event.currentTarget.remove();
  });
  document.querySelectorAll("#modal [data-approve]").forEach((button) =>
    button.addEventListener("click", () => verificationAction(button.dataset.approve, "approve"))
  );
  document.querySelectorAll("#modal [data-reject]").forEach((button) =>
    button.addEventListener("click", () => verificationAction(button.dataset.reject, "reject"))
  );
  document.querySelector("#complete-form")?.addEventListener("submit", completeBooking);
}

async function verificationAction(id, action) {
  try {
    await api(`/api/admin/verifications/${id}/${action}`, {
      method: "POST",
      body: "{}",
    });
    document.querySelector("#modal")?.remove();
    toast(action === "approve" ? "Centre verified successfully!" : "Centre rejected.");
    render();
  } catch (error) {
    toast(error.message, "danger");
  }
}

function reviewModal(request) {
  const centre = request.centre || {};
  return `
    <div class="modal-backdrop animate-fade" id="modal">
      <section class="modal animate-pop">
        <div class="modal-head">
          <div>
            ${verifiedBadge(request.status)}
            <h2 style="margin-top:8px">${esc(centre.name || "Procurement Centre")}</h2>
            <p class="form-help">${esc(centre.district || "")} · ${esc(request.contact || "")}</p>
          </div>
          <button class="modal-close" data-close-modal>×</button>
        </div>
        <div class="detail-facts">
          <div class="detail-fact"><span>Contact</span><strong>${esc(request.contact)}</strong></div>
          <div class="detail-fact"><span>Certificate</span><strong>${esc(request.certificate)}</strong></div>
          <div class="detail-fact"><span>Capacity</span><strong>${centre.capacity || 80} farmers</strong></div>
          <div class="detail-fact"><span>Stage</span><strong>${esc(request.stage)}</strong></div>
        </div>
        <div class="card-actions" style="margin-top:18px">
          <button class="danger-btn" data-reject="${request.id}">Reject</button>
          <button class="primary-btn" data-approve="${request.id}">Approve Centre</button>
        </div>
      </section>
    </div>
  `;
}

function openCompleteModal(bookingId) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal-backdrop animate-fade" id="modal">
      <section class="modal animate-pop">
        <div class="modal-head">
          <div>
            <h2>Record Crop Measurement</h2>
            <p class="form-help">Enter inspected weight and grade to finalize procurement.</p>
          </div>
          <button class="modal-close" data-close-modal>×</button>
        </div>
        <form id="complete-form" class="form-grid">
          <input type="hidden" name="bookingId" value="${bookingId}">
          <div class="form-group">
            <label>Measured Quantity (kg)</label>
            <input name="measuredQuantity" type="number" value="800" required min="1">
          </div>
          <div class="form-group">
            <label>Quality Grade</label>
            <select name="quality">
              <option value="FAQ">FAQ (Fair Average Quality)</option>
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Moisture Content</label>
            <input name="moisture" value="13.2%">
          </div>
          <div class="form-group">
            <label>Verification Result</label>
            <input value="Accepted" disabled>
          </div>
          <div class="form-group full-span">
            <button class="primary-btn full" type="submit">✓ Accept Crop & Start Payment</button>
          </div>
        </form>
      </section>
    </div>
    `
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
    toast("Procurement completed! Payment record created.");
    render();
  } catch (error) {
    toast(error.message, "danger");
  }
}

// Initial mount
render();
