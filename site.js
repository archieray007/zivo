(function () {
  "use strict";
  var SUPABASE_URL = "https://hufwxisjdaelrmdnzika.supabase.co";
  var SUPABASE_KEY = "sb_publishable_fxtj-wbvkmVlDNM3isRwHA_AMGWVdhC";
  var THEME_KEY = "zivo-theme";
  function $(s) { return document.querySelector(s); }
  function h(tag, props) {
    var el = document.createElement(tag), i, k;
    props = props || {};
    for (k in props) { if (k === "text") el.textContent = props[k]; else if (k === "class") el.className = props[k]; else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), props[k]); else if (props[k] !== null && props[k] !== undefined) el.setAttribute(k, props[k]); }
    for (i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c === null || c === undefined) continue; el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return el;
  }
  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200); }

  /* theme */
  function isDark() { var a = document.documentElement.getAttribute("data-theme"); if (a) return a === "dark"; return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); }
  function drawTheme() {
    var b = $("#themeBtn"), d = isDark();
    b.textContent = ""; b.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode");
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "18"); svg.setAttribute("height", "18"); svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2"); svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    var p = document.createElementNS(ns, "path");
    if (d) { var c = document.createElementNS(ns, "circle"); c.setAttribute("cx", "12"); c.setAttribute("cy", "12"); c.setAttribute("r", "4"); svg.appendChild(c); p.setAttribute("d", "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"); }
    else p.setAttribute("d", "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z");
    svg.appendChild(p); b.appendChild(svg);
  }
  $("#themeBtn").addEventListener("click", function () { var n = isDark() ? "light" : "dark"; document.documentElement.setAttribute("data-theme", n); try { localStorage.setItem(THEME_KEY, n); } catch (e) { /* ignore */ } drawTheme(); });
  drawTheme();

  /* session */
  var sb = null, user = null, page = document.body.getAttribute("data-page");
  function isPro() { return !!(user && user.app_metadata && user.app_metadata.plan === "pro"); }
  function navAct() {
    var box = $("#navAct"); if (!box) return; box.textContent = "";
    if (user) box.appendChild(h("a", { class: "btn small primary", href: "app.html", text: "Open dashboard" }));
    else { box.appendChild(h("a", { class: "btn small", href: "app.html#login", text: "Log in" })); box.appendChild(h("a", { class: "btn small primary", href: "app.html#signup", text: "Create account" })); }
  }

  /* pricing page */
  function initPricing() {
    var yr = false;
    function draw() {
      $("#bm").setAttribute("aria-pressed", yr ? "false" : "true"); $("#by").setAttribute("aria-pressed", yr ? "true" : "false");
      $("#proPrice").textContent = yr ? "₹499" : "₹59";
      $("#proNote").textContent = yr ? "per year. That is about ₹42 a month, and saves about 30%." : "per month";
      var fb = $("#freeBtn"), pb = $("#proBtn"); fb.textContent = ""; pb.textContent = "";
      if (user) { fb.appendChild(h("p", { text: isPro() ? "" : "Your current plan" })); pb.appendChild(isPro() ? h("p", { text: "Your current plan" }) : h("button", { class: "btn", type: "button", disabled: "" }, "Coming soon")); }
      else { fb.appendChild(h("a", { class: "btn primary", href: "app.html#signup", text: "Start free" })); pb.appendChild(h("button", { class: "btn", type: "button", disabled: "" }, "Coming soon")); }
    }
    $("#bm").addEventListener("click", function () { yr = false; draw(); });
    $("#by").addEventListener("click", function () { yr = true; draw(); });
    draw();
    return draw;
  }

  /* reviews page */
  function stars(n) { var w = h("span", { class: "stars", "aria-label": n + " out of 5 stars" }); for (var i = 1; i <= 5; i++) w.appendChild(h("span", { class: i <= n ? "" : "off", text: "★" })); return w; }
  function initReviews() {
    var rl = $("#rvList");
    function note(t, d) { rl.textContent = ""; rl.appendChild(h("div", { class: "card" }, h("h3", { text: t }), h("p", { text: d }))); }
    function noRv() { note("No reviews yet", "Zivo is new, and we only show reviews written by people who have used it. Be the first."); }
    if (!sb) { noRv(); } else {
      try {
        Promise.resolve(sb.from("reviews").select("name,rating,body").eq("approved", true).order("created_at", { ascending: false }).limit(30)).then(function (r) {
          var rows = (r && r.data) || []; if (!rows.length) { noRv(); return; }
          rl.textContent = "";
          rows.forEach(function (x) { var n = Math.max(1, Math.min(5, parseInt(x.rating, 10) || 5)); rl.appendChild(h("div", { class: "card" }, stars(n), h("p", { style: "margin-top:8px", text: x.body }), h("p", { style: "margin-top:6px;color:var(--muted)", text: x.name || "Zivo user" }))); });
        }, noRv);
      } catch (e) { noRv(); }
    }
  }
  function drawReviewForm() {
    var box = $("#rvForm"); box.textContent = "";
    if (!user) { box.appendChild(h("p", { text: "Used Zivo? Log in to write a review." })); box.appendChild(h("a", { class: "btn primary", href: "app.html#login", text: "Log in" })); return; }
    var rating = 0, btns = [];
    var pick = h("div", { class: "starpick", role: "radiogroup", "aria-label": "Your rating" });
    function paint() { btns.forEach(function (b, i) { b.className = i < rating ? "on" : ""; b.setAttribute("aria-checked", i + 1 === rating ? "true" : "false"); }); }
    for (var i = 1; i <= 5; i++) (function (n) {
      var b = h("button", { type: "button", role: "radio", "aria-label": n + (n === 1 ? " star" : " stars"), "aria-checked": "false", text: "★", onclick: function () { rating = n; paint(); } });
      btns.push(b); pick.appendChild(b);
    })(i);
    var rn = h("input", { type: "text", maxlength: "60", placeholder: "Your name (or business)" });
    var rt = h("textarea", { rows: "4", maxlength: "600", placeholder: "What did you use Zivo for? What worked, and what did not?" });
    var rb = h("button", { class: "btn primary", type: "button", text: "Send review" });
    function field(l, el) { return h("div", { class: "field" }, h("label", { text: l }), el); }
    rb.addEventListener("click", function () {
      if (!rating) { toast("Please tap a star to rate."); return; }
      if (rt.value.trim().length < 15) { toast("Please write at least a sentence."); return; }
      rb.disabled = true;
      Promise.resolve(sb.from("reviews").insert({ user_id: user.id, name: rn.value.trim().slice(0, 60), rating: rating, body: rt.value.trim() })).then(function (r) {
        if (r && r.error) { console.error("Review error", r.error); toast(r.error.code === "23505" ? "You have already sent a review. Thank you!" : "Reviews are not available right now. Please try again a little later."); rb.disabled = false; return; }
        toast("Thank you! Your review will show once we have checked it."); rt.value = ""; rating = 0; paint();
      }, function () { toast("Could not send your review."); rb.disabled = false; });
    });
    box.appendChild(h("h3", { style: "margin:0 0 12px", text: "Write a review" }));
    box.appendChild(field("Your rating", pick)); box.appendChild(field("Name", rn)); box.appendChild(field("Your review", rt)); box.appendChild(rb);
  }

  var redrawPricing = page === "pricing" ? initPricing() : null;
  function ready() { navAct(); if (redrawPricing) redrawPricing(); if (page === "reviews") drawReviewForm(); }
  if (window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    sb.auth.getSession().then(function (r) { var s = r && r.data ? r.data.session : null; user = s ? s.user : null; ready(); }, function () { ready(); });
  } else ready();
  if (page === "reviews") initReviews();
})();
