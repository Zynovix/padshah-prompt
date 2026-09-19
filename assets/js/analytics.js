/* Padshah Prompt: consent-based GA4 measurement for the homepage and product pages. */
(() => {
  "use strict";
  const measurementId = "G-ECFTMP6ZQD";
  const preferenceKey = "padshah_analytics_choice_v1";
  const products = {
    "instagram-prompt-pack.html": ["instagram", "پک سلطان ریلز و اینستاگرام", 99000],
    "youtube-video-master-pack.html": ["youtube", "پک یوتیوب و ویدیو", 179000],
    "content-writing-pack.html": ["content", "پک تولید محتوای متنی", 129000],
    "ai-image-pack.html": ["image", "پک تولید تصویر AI", 199000],
    "seo-pack.html": ["seo", "پک سئو و بهینه‌سازی", 159000],
    "ai-online-store-pack.html": ["store", "پک فروشگاه آنلاین", 129000],
    "ai-income-pack.html": ["income", "پک کسب درآمد با AI", 119000],
    "freelance-ai-pack.html": ["freelance", "پک فریلنسری با AI", 109000]
  };
  let enabled = false;
  let loaded = false;

  const preference = () => {
    try { return localStorage.getItem(preferenceKey); } catch (_) { return null; }
  };
  function itemFor(path) {
    const name = (path || "").split("/").pop().split("?")[0].split("#")[0];
    const item = products[name];
    return item && { item_id: item[0], item_name: item[1], price: item[2], quantity: 1 };
  }
  function event(name, item, options = {}) {
    if (!enabled || !item || typeof window.gtag !== "function") return false;
    window.gtag("event", name, {
      currency: "IRR", value: item.price * 10, items: [{ ...item, price: item.price * 10 }],
      ...options
    });
    return true;
  }
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    enabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("config", measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(script);
    const current = itemFor(location.pathname);
    if (current) event("view_item", current);
  }
  function setPreference(choice) {
    try { localStorage.setItem(preferenceKey, choice); } catch (_) { /* Ask again next visit. */ }
    document.getElementById("padshah-analytics-banner")?.remove();
    if (choice === "accepted") loadAnalytics();
    if (choice === "declined" && enabled) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      enabled = false;
      for (const entry of document.cookie.split(";")) {
        const name = entry.split("=")[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) continue;
        document.cookie = name + "=; Max-Age=0; Path=/";
        document.cookie = name + "=; Max-Age=0; Path=/; Domain=.padshahprompt.ir";
      }
      location.reload();
    }
  }
  function showBanner() {
    if (document.getElementById("padshah-analytics-banner")) return;
    const style = document.createElement("style");
    style.textContent = "#padshah-analytics-banner{position:fixed;z-index:99999;bottom:16px;right:16px;left:16px;max-width:680px;margin:auto;background:#0c1a2d;color:#f6f9ff;border:1px solid #7de8ff;border-radius:16px;padding:18px;box-shadow:0 18px 55px #0009;font:15px/1.9 Tahoma,sans-serif;direction:rtl}#padshah-analytics-banner p{margin:0 0 12px}#padshah-analytics-banner a{color:#8ceaff}#padshah-analytics-banner .analytics-actions{display:flex;gap:10px;flex-wrap:wrap}#padshah-analytics-banner button{cursor:pointer;padding:8px 16px;border-radius:9px;border:1px solid #7de8ff;background:transparent;color:#f6f9ff;font:inherit}#padshah-analytics-banner button:first-child{background:#7de8ff;color:#071321;font-weight:bold}";
    document.head.appendChild(style);
    const banner = document.createElement("div");
    banner.id = "padshah-analytics-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "انتخاب تحلیل بازدید سایت");
    banner.innerHTML = '<p>برای فهمیدن اینکه کدام صفحه‌ها مفیدترند، از Google Analytics استفاده می‌کنیم. فقط با انتخاب شما فعال می‌شود. <a href="/privacy.html">جزئیات حریم خصوصی</a></p><div class="analytics-actions"><button type="button" data-choice="accepted">موافقم</button><button type="button" data-choice="declined">فعلاً نه</button></div>';
    banner.addEventListener("click", (e) => {
      const choice = e.target.closest("button[data-choice]")?.dataset.choice;
      if (choice) setPreference(choice);
    });
    document.body.appendChild(banner);
  }
  window.padshahAnalytics = {
    openSettings: showBanner,
    redirectToPayment(productId, url) {
      if (!/^https:\/\//i.test(url)) { location.assign(url); return; }
      const item = Object.values(products).find((v) => v[0] === productId);
      if (!enabled || !item) { location.assign(url); return; }
      let redirected = false;
      const go = () => { if (!redirected) { redirected = true; location.assign(url); } };
      const timer = setTimeout(go, 500);
      event("begin_checkout", { item_id: item[0], item_name: item[1], price: item[2], quantity: 1 }, {
        event_callback: () => { clearTimeout(timer); go(); }, event_timeout: 400
      });
    }
  };
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    if (link.matches('a[href^="https://pay.padshahprompt.ir/"]')) {
      event("begin_checkout", itemFor(location.pathname));
    } else if (link.closest(".product-card") || link.classList.contains("product-details-link")) {
      event("select_item", itemFor(new URL(link.href, location.href).pathname));
    }
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => preference() === "accepted" ? loadAnalytics() : preference() === "declined" ? null : showBanner());
  } else {
    if (preference() === "accepted") loadAnalytics();
    else if (preference() !== "declined") showBanner();
  }
})();
