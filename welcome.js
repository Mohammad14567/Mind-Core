/* ============================================================
   Mind Core — Entry page interactions
   UI only: auth tabs, validation/loading states, and the
   media carousel. Real auth is wired in later — successful
   actions redirect to index.html as a placeholder.
   ============================================================ */
(function () {
  "use strict";

  var ENTER_URL = "studio.html"; // where a successful auth/guest lands
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. AUTH TABS
     ---------------------------------------------------------- */
  var tabsWrap = document.querySelector(".auth-tabs");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".auth-tab"));
  var forms = {
    signin: document.getElementById("form-signin"),
    register: document.getElementById("form-register")
  };

  function setTab(name) {
    tabsWrap.setAttribute("data-active", name);
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.keys(forms).forEach(function (key) {
      var on = key === name;
      forms[key].classList.toggle("is-active", on);
      if (on) {
        forms[key].classList.remove("tab-switch");
        void forms[key].offsetWidth; // restart the entrance animation each switch
        forms[key].classList.add("tab-switch");
      }
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { setTab(t.dataset.tab); });
  });

  /* ----------------------------------------------------------
     2. PASSWORD VISIBILITY TOGGLES
     ---------------------------------------------------------- */
  document.querySelectorAll("[data-eye]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = btn.parentElement.querySelector("input");
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      btn.querySelector(".eye-show").classList.toggle("hidden", show);
      btn.querySelector(".eye-hide").classList.toggle("hidden", !show);
    });
  });

  /* ----------------------------------------------------------
     3. PASSWORD STRENGTH METER (register)
     ---------------------------------------------------------- */
  var rgPass = document.getElementById("rg-pass");
  var meter = document.querySelector("[data-meter]");
  if (rgPass && meter) {
    rgPass.addEventListener("input", function () {
      var v = rgPass.value, score = 0;
      if (v.length >= 6) score = 1;
      if (v.length >= 8 && /\d/.test(v)) score = 2;
      if (v.length >= 10 && /\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score = 3;
      meter.setAttribute("data-score", v ? String(score) : "0");
    });
  }

  /* ----------------------------------------------------------
     4. VALIDATION + SUBMIT (loading -> redirect)
     ---------------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function field(form, name) { return form.querySelector('[data-field="' + name + '"]'); }
  function setInvalid(f, bad) { if (f) f.classList.toggle("invalid", bad); }

  // clear error styling as the user types
  document.querySelectorAll(".auth-field input").forEach(function (inp) {
    inp.addEventListener("input", function () {
      var f = inp.closest(".auth-field");
      if (f) f.classList.remove("invalid");
    });
  });

  function validate(form) {
    var ok = true, firstBad = null;
    var nameF = field(form, "name");
    if (nameF) {
      var bad = nameF.querySelector("input").value.trim().length < 2;
      setInvalid(nameF, bad);
      if (bad) { ok = false; firstBad = firstBad || nameF; }
    }
    var emailF = field(form, "email");
    if (emailF) {
      var be = !EMAIL_RE.test(emailF.querySelector("input").value.trim());
      setInvalid(emailF, be);
      if (be) { ok = false; firstBad = firstBad || emailF; }
    }
    var passF = field(form, "password");
    if (passF) {
      var bp = passF.querySelector("input").value.length < 6;
      setInvalid(passF, bp);
      if (bp) { ok = false; firstBad = firstBad || passF; }
    }
    if (firstBad) firstBad.querySelector("input").focus();
    return ok;
  }

  function loadThenEnter(btn) {
    btn.setAttribute("data-loading", "true");
    btn.setAttribute("aria-busy", "true");
    window.setTimeout(function () { window.location.href = ENTER_URL; }, 1150);
  }

  Object.keys(forms).forEach(function (key) {
    forms[key].addEventListener("submit", function (e) {
      e.preventDefault();
      if (validate(forms[key])) loadThenEnter(forms[key].querySelector(".btn-primary"));
    });
  });

  // Guest + social — straight through to the studio (auth added later)
  var guest = document.getElementById("btn-guest");
  if (guest) guest.addEventListener("click", function () { loadThenEnter(guest); });
  document.querySelectorAll("[data-social]").forEach(function (b) {
    b.addEventListener("click", function () {
      b.style.opacity = "0.7"; b.style.pointerEvents = "none";
      window.setTimeout(function () { window.location.href = ENTER_URL; }, 650);
    });
  });
  document.querySelectorAll("[data-noop]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* ----------------------------------------------------------
     5. SHOWCASE CAROUSEL
     ---------------------------------------------------------- */
  var wc = document.getElementById("wc");
  if (!wc) return;

  var slides = Array.prototype.slice.call(document.querySelectorAll(".wc-slide"));
  var rail = document.getElementById("wc-rail");
  var elKicker = document.getElementById("wc-kicker");
  var elTitle = document.getElementById("wc-title");
  var elCaption = document.getElementById("wc-caption");
  var elCur = document.getElementById("wc-cur");
  var elTotal = document.getElementById("wc-total");
  var N = slides.length;
  var cur = 0, paused = false, muted = true;

  elTotal.textContent = pad(N);

  // build segmented progress bars
  var segs = slides.map(function (slide, i) {
    var seg = document.createElement("button");
    seg.className = "wc-seg";
    seg.type = "button";
    seg.setAttribute("role", "tab");
    seg.setAttribute("aria-label", "Slide " + (i + 1));
    seg.style.setProperty("--dur", (slide.dataset.dur || 6000) + "ms");
    seg.addEventListener("click", function () { go(i); });
    seg.addEventListener("animationend", function (e) {
      if (e.animationName === "wc-fill" && i === cur && !paused) go(cur + 1);
    });
    rail.appendChild(seg);
    return seg;
  });

  function currentVideo() { return slides[cur].querySelector("video"); }

  function go(i) {
    i = (i % N + N) % N;
    // leave the old slide
    slides[cur].classList.remove("is-active");
    var prevV = currentVideo();
    if (prevV) { prevV.pause(); }

    cur = i;
    var slide = slides[cur];
    slide.classList.add("is-active");

    // caption swap
    elKicker.textContent = slide.dataset.kicker || "";
    elTitle.textContent = slide.dataset.title || "";
    if (!reduced) {
      elCaption.classList.remove("wc-anim");
      void elCaption.offsetWidth;
      elCaption.classList.add("wc-anim");
    }
    elCur.textContent = pad(cur + 1);

    // segment states
    segs.forEach(function (sg, j) {
      sg.classList.remove("is-active", "is-done");
      sg.setAttribute("aria-selected", j === cur ? "true" : "false");
      if (j < cur) sg.classList.add("is-done");
    });
    // restart the active fill animation
    var a = segs[cur];
    void a.offsetWidth;
    a.classList.add("is-active");

    // play active video
    var v = currentVideo();
    if (v) {
      v.muted = muted;
      try { v.currentTime = 0; } catch (err) {}
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  // arrows
  document.getElementById("wc-prev").addEventListener("click", function () { go(cur - 1); });
  document.getElementById("wc-next").addEventListener("click", function () { go(cur + 1); });

  // mute
  var muteBtn = document.getElementById("wc-mute");
  muteBtn.addEventListener("click", function () {
    muted = !muted;
    muteBtn.classList.toggle("is-muted", muted);
    muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    var v = currentVideo();
    if (v) {
      v.muted = muted;
      if (!muted) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
  });

  // pause the slide-advance rail on hover, but never the video itself
  wc.addEventListener("mouseenter", function () {
    paused = true; wc.classList.add("is-paused");
  });
  wc.addEventListener("mouseleave", function () {
    paused = false; wc.classList.remove("is-paused");
  });

  // keyboard nav when the carousel has focus context
  wc.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") go(cur - 1);
    else if (e.key === "ArrowRight") go(cur + 1);
  });

  // kick it off
  go(0);
})();
