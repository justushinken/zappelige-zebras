/* Zappelige Zebras – kleine Helfer, ohne externe Bibliotheken */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    var setOpen = function (open) {
      root.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    };
    toggle.addEventListener("click", function () {
      setOpen(!root.classList.contains("nav-open"));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Header-Linie beim Scrollen ---------- */
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Aktiven Abschnitt im Menü markieren ----------
     Aktiv ist der letzte Abschnitt, dessen Oberkante die Linie knapp unter dem
     Header passiert hat. Abschnitte ohne eigenen Menüpunkt (z. B. #konzept)
     zählen so automatisch zum vorherigen („Die Kita“). */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var spy = navLinks
    .map(function (a) { return { link: a, section: document.querySelector(a.getAttribute("href")) }; })
    .filter(function (item) { return item.section; })
    // Reihenfolge wie auf der Seite, nicht wie im Menü (Anmeldung steht im Menü am Ende)
    .sort(function (a, b) {
      return a.section.compareDocumentPosition(b.section) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

  if (spy.length) {
    var current = null;
    var setActive = function (item) {
      if (item === current) return;
      if (current) {
        current.link.classList.remove("active");
        current.link.removeAttribute("aria-current");
      }
      current = item;
      if (item) {
        item.link.classList.add("active");
        item.link.setAttribute("aria-current", "location");
      }
    };
    var updateSpy = function () {
      var line = (header ? header.offsetHeight : 0) + window.innerHeight * 0.25;
      var active = null;
      spy.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= line) active = item;
      });
      // Ganz unten angekommen: letzten Abschnitt markieren, auch wenn er kurz ist
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = spy[spy.length - 1];
      }
      setActive(active);
    };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { updateSpy(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", updateSpy);
    updateSpy();
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Jahreszahl ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Galerie-Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".gallery button"));
  if (lb && thumbs.length && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector("p");
    var current = 0;

    var show = function (i) {
      current = (i + thumbs.length) % thumbs.length;
      var img = thumbs[current].querySelector("img");
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt + " (" + (current + 1) + "/" + thumbs.length + ")";
    };

    thumbs.forEach(function (btn, i) {
      btn.setAttribute("aria-label", "Bild vergrößern: " + btn.querySelector("img").alt);
      btn.addEventListener("click", function () { show(i); lb.showModal(); });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------- Anmeldeformular ----------
     Die Website ist rein statisch. Das Formular erzeugt deshalb eine fertige
     E-Mail im Mailprogramm der Eltern. Soll es später direkt versendet werden,
     kann hier z. B. ein PHP-Skript beim Hoster angebunden werden. */
  var form = document.getElementById("signup-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var lines = [];
      form.querySelectorAll("input[name], textarea[name]").forEach(function (el) {
        var value = el.value.trim();
        if (!value) return;
        if (el.type === "date") value = value.split("-").reverse().join(".");
        lines.push(el.name + ": " + value);
      });
      var child = form.querySelector("#f-child").value.trim();
      var body = "Hallo liebe Zappelige Zebras,\n\nhiermit möchten wir unser Kind auf die Warteliste setzen lassen.\n\n" +
        lines.join("\n") +
        "\n\nDer Speicherung und Verarbeitung unserer Angaben zur Bearbeitung der Anmeldung stimmen wir zu.\n\nViele Grüße";
      var href = "mailto:info@zappelige-zebras.de" +
        "?subject=" + encodeURIComponent("Anmeldung Warteliste – " + child) +
        "&body=" + encodeURIComponent(body);
      window.location.href = href;
      status.textContent = "Euer E-Mail-Programm sollte sich jetzt öffnen. Bitte sendet die vorbereitete Nachricht dort ab. Falls nichts passiert, schreibt uns einfach an info@zappelige-zebras.de.";
      status.classList.add("show");
    });
  }
})();
