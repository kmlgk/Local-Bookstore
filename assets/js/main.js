/* The Gilded Spine — main.js (vanilla JS, no dependencies) */
(function () {
  'use strict';

  /* ---------------- Theme + RTL (also set early/blocking in <head>) ---------------- */
  var THEME_KEY = 'tgs-theme';
  var DIR_KEY = 'tgs-dir';

  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.innerHTML = dark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function applyDir(rtl) {
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-dir-toggle]').forEach(function (btn) {
      btn.textContent = rtl ? 'LTR' : 'RTL';
      btn.setAttribute('aria-pressed', rtl ? 'true' : 'false');
      btn.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(document.body.classList.contains('dark'));
    applyDir(document.documentElement.getAttribute('dir') === 'rtl');

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dark = !document.body.classList.contains('dark');
        applyTheme(dark);
        try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) {}
      });
    });
    document.querySelectorAll('[data-dir-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rtl = document.documentElement.getAttribute('dir') !== 'rtl';
        applyDir(rtl);
        try { localStorage.setItem(DIR_KEY, rtl ? 'rtl' : 'ltr'); } catch (e) {}
      });
    });

    /* ---------------- Page loader ---------------- */
    var loader = document.querySelector('.loader');
    if (loader) {
      window.addEventListener('load', function () {
        setTimeout(function () { loader.classList.add('hide'); }, 250);
      });
      setTimeout(function () { loader.classList.add('hide'); }, 2200);
    }

    /* ---------------- Mobile nav (full-screen takeover) ---------------- */
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var mobileClose = document.querySelector('.mobile-nav-close');
    function closeMobileNav() {
      if (!mobileNav) return;
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
    function openMobileNav() {
      if (!mobileNav) return;
      mobileNav.classList.add('open');
      document.body.classList.add('nav-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
      var firstLink = mobileNav.querySelector('a');
      if (firstLink) firstLink.focus();
    }
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
      });
    }
    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
    if (mobileNav) {
      mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobileNav); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileNav();
      });
    }

    /* ---------------- Masthead scroll shadow ---------------- */
    var masthead = document.querySelector('.masthead');
    if (masthead) {
      window.addEventListener('scroll', function () {
        masthead.style.boxShadow = window.scrollY > 12 ? '0 8px 20px -14px rgba(0,0,0,.4)' : 'none';
      }, { passive: true });
    }

    /* ---------------- Back to top ---------------- */
    var toTop = document.querySelector('.to-top');
    if (toTop) {
      window.addEventListener('scroll', function () {
        toTop.classList.toggle('show', window.scrollY > 600);
      }, { passive: true });
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---------------- Store open/closed status ---------------- */
    document.querySelectorAll('[data-store-status]').forEach(function (el) {
      var now = new Date();
      var day = now.getDay(); // 0 Sun - 6 Sat
      var hour = now.getHours() + now.getMinutes() / 60;
      var open;
      if (day === 0) { open = hour >= 11 && hour < 17; }
      else if (day === 6) { open = hour >= 10 && hour < 19; }
      else { open = hour >= 9 && hour < 20; }
      var dot = el.querySelector('.status-dot');
      var label = el.querySelector('[data-status-label]');
      if (dot) dot.classList.toggle('closed', !open);
      if (label) label.textContent = open ? 'Open now' : 'Closed now';
    });

    /* ---------------- Page-flip / fade scroll reveal ---------------- */
    var revealEls = document.querySelectorAll('.reveal, .reveal-fade');
    if ('IntersectionObserver' in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
      setTimeout(function () {
        revealEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add('in');
        });
      }, 1200);
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------------- Shelf horizontal scroll buttons + wheel/drag ---------------- */
    document.querySelectorAll('.shelf-row, .related-strip').forEach(function (strip) {
      strip.classList.add('no-scrollbar');
      var isDown = false, startX, scrollLeft;
      strip.addEventListener('mousedown', function (e) { isDown = true; startX = e.pageX; scrollLeft = strip.scrollLeft; });
      window.addEventListener('mouseup', function () { isDown = false; });
      strip.addEventListener('mouseleave', function () { isDown = false; });
      strip.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        strip.scrollLeft = scrollLeft - (e.pageX - startX);
      });
      strip.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          strip.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });
    });
    document.querySelectorAll('[data-shelf-next], [data-shelf-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetSel = btn.getAttribute('data-shelf-next') || btn.getAttribute('data-shelf-prev');
        var strip = document.querySelector(targetSel);
        if (!strip) return;
        var dir = btn.hasAttribute('data-shelf-next') ? 1 : -1;
        if (document.documentElement.getAttribute('dir') === 'rtl') dir *= -1;
        strip.scrollBy({ left: dir * 260, behavior: 'smooth' });
      });
    });

    /* ---------------- Spotlight slider (new arrivals) ---------------- */
    var stage = document.querySelector('[data-spotlight-stage]');
    if (stage) {
      var slides = Array.prototype.slice.call(stage.querySelectorAll('.spotlight-slide'));
      var thumbs = Array.prototype.slice.call(document.querySelectorAll('.spotlight-thumb'));
      var idx = 0, timer;
      function show(i) {
        idx = (i + slides.length) % slides.length;
        slides.forEach(function (s, n) { s.classList.toggle('active', n === idx); });
        thumbs.forEach(function (t, n) { t.classList.toggle('active', n === idx); });
      }
      thumbs.forEach(function (t, n) {
        t.addEventListener('click', function () { show(n); resetTimer(); });
      });
      function resetTimer() {
        clearInterval(timer);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          timer = setInterval(function () { show(idx + 1); }, 5500);
        }
      }
      show(0);
      resetTimer();
      stage.addEventListener('mouseenter', function () { clearInterval(timer); });
      stage.addEventListener('mouseleave', resetTimer);
    }

    /* ---------------- Shop page: filters, sort, view toggle, pagination ---------------- */
    var shopGrid = document.querySelector('[data-shop-grid]');
    if (shopGrid) {
      var allCards = Array.prototype.slice.call(shopGrid.querySelectorAll('.spine-card'));
      var PAGE_SIZE = 6;
      var currentPage = 1;

      function activeGenres() {
        return Array.prototype.slice.call(document.querySelectorAll('[data-filter-genre]:checked')).map(function (c) { return c.value; });
      }
      function activePrice() {
        var checked = document.querySelector('[data-filter-price]:checked');
        return checked ? checked.value : 'any';
      }
      function activeSearch() {
        var input = document.querySelector('[data-book-search]');
        return input ? input.value.trim().toLowerCase() : '';
      }
      function matchesPrice(price, range) {
        if (range === 'any') return true;
        if (range === 'u18') return price < 18;
        if (range === '18-24') return price >= 18 && price <= 24;
        if (range === '24-28') return price > 24 && price <= 28;
        if (range === '28p') return price > 28;
        return true;
      }
      function applyFilters() {
        var genres = activeGenres();
        var price = activePrice();
        var q = activeSearch();
        var matched = allCards.filter(function (card) {
          var g = card.getAttribute('data-genre');
          var p = parseFloat(card.getAttribute('data-price'));
          var text = card.textContent.toLowerCase();
          var genreOk = genres.length === 0 || genres.indexOf(g) !== -1;
          var priceOk = matchesPrice(p, price);
          var searchOk = q === '' || text.indexOf(q) !== -1;
          return genreOk && priceOk && searchOk;
        });
        applySort(matched);
        currentPage = 1;
        render(matched);
        return matched;
      }
      function applySort(list) {
        var sortBy = (document.querySelector('[data-shop-sort]') || {}).value || 'featured';
        if (sortBy === 'price-asc') list.sort(function (a, b) { return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')); });
        else if (sortBy === 'price-desc') list.sort(function (a, b) { return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')); });
        else if (sortBy === 'title') list.sort(function (a, b) { return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title')); });
      }
      function renderPagination(matched) {
        var wrap = document.querySelector('[data-pagination]');
        if (!wrap) return;
        var pageCount = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
        if (currentPage > pageCount) currentPage = pageCount;
        wrap.innerHTML = '';
        if (pageCount <= 1) return;
        var prev = document.createElement('button');
        prev.type = 'button'; prev.className = 'page-btn page-nav'; prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prev.disabled = currentPage === 1;
        prev.setAttribute('aria-label', 'Previous page');
        prev.addEventListener('click', function () { currentPage--; render(window.__shopLastMatched || allCards); scrollToGrid(); });
        wrap.appendChild(prev);
        for (var i = 1; i <= pageCount; i++) {
          (function (n) {
            var btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'page-btn' + (n === currentPage ? ' active' : '');
            btn.textContent = String(n);
            btn.setAttribute('aria-label', 'Page ' + n);
            if (n === currentPage) btn.setAttribute('aria-current', 'page');
            btn.addEventListener('click', function () { currentPage = n; render(window.__shopLastMatched || allCards); scrollToGrid(); });
            wrap.appendChild(btn);
          })(i);
        }
        var next = document.createElement('button');
        next.type = 'button'; next.className = 'page-btn page-nav'; next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        next.disabled = currentPage === pageCount;
        next.setAttribute('aria-label', 'Next page');
        next.addEventListener('click', function () { currentPage++; render(window.__shopLastMatched || allCards); scrollToGrid(); });
        wrap.appendChild(next);
      }
      function scrollToGrid() {
        var toolbar = document.querySelector('.shop-toolbar');
        if (toolbar) toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      function render(matched) {
        allCards.forEach(function (c) { c.style.display = 'none'; });
        var start = (currentPage - 1) * PAGE_SIZE;
        matched.slice(start, start + PAGE_SIZE).forEach(function (c) { c.style.display = ''; shopGrid.appendChild(c); });
        var countEl = document.querySelector('[data-shop-count]');
        if (countEl) countEl.textContent = matched.length;
        var emptyEl = document.querySelector('[data-shop-empty]');
        if (emptyEl) emptyEl.classList.toggle('show', matched.length === 0);
        shopGrid.style.display = matched.length === 0 ? 'none' : '';
        window.__shopLastMatched = matched;
        renderPagination(matched);
      }

      document.querySelectorAll('[data-filter-genre], [data-filter-price]').forEach(function (el) {
        el.addEventListener('change', applyFilters);
      });
      var shopSortEl = document.querySelector('[data-shop-sort]');
      if (shopSortEl) shopSortEl.addEventListener('change', applyFilters);
      var shopSearchEl = document.querySelector('[data-book-search]');
      if (shopSearchEl) shopSearchEl.addEventListener('input', applyFilters);

      document.querySelectorAll('[data-view-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('[data-view-toggle]').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          shopGrid.classList.toggle('list-view', btn.getAttribute('data-view-toggle') === 'list');
        });
      });

      document.querySelectorAll('[data-clear-filters]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('[data-filter-genre]').forEach(function (c) { c.checked = false; });
          var anyPrice = document.querySelector('[data-filter-price][value="any"]');
          if (anyPrice) anyPrice.checked = true;
          if (shopSearchEl) shopSearchEl.value = '';
          applyFilters();
        });
      });

      // deep-link: books.html#mystery-thriller pre-checks that genre filter
      var hash = window.location.hash.replace('#', '');
      if (hash) {
        var target = document.querySelector('[data-filter-genre][value="' + hash + '"]');
        if (target) target.checked = true;
      }

      applyFilters();
    }

    /* ---------------- Sticky quick-nav scroll-spy (Books page) ---------------- */
    var quicknavLinks = document.querySelectorAll('.quicknav a');
    if (quicknavLinks.length) {
      var sections = Array.prototype.map.call(quicknavLinks, function (a) {
        return document.querySelector(a.getAttribute('href'));
      }).filter(Boolean);
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var link = document.querySelector('.quicknav a[href="#' + entry.target.id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            quicknavLinks.forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------------- Genre tile search (Genres page) ---------------- */
    var genreSearch = document.querySelector('[data-genre-search]');
    if (genreSearch) {
      genreSearch.addEventListener('input', function () {
        var q = genreSearch.value.trim().toLowerCase();
        document.querySelectorAll('[data-genre-tile]').forEach(function (tile) {
          tile.style.display = tile.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
    }

    /* ---------------- Accordion (FAQ) ---------------- */
    document.querySelectorAll('.accordion-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (panel) panel.style.maxHeight = expanded ? '0px' : panel.scrollHeight + 'px';
      });
    });

    /* ---------------- Tabs (Book Details) ---------------- */
    document.querySelectorAll('.detail-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.closest('.detail-tabs');
        var panelId = btn.getAttribute('data-tab-target');
        group.querySelectorAll('.detail-tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.detail-tab-pane').forEach(function (p) { p.classList.remove('active'); });
        var pane = document.getElementById(panelId);
        if (pane) pane.classList.add('active');
      });
    });

    /* ---------------- Modal (Event RSVP) ---------------- */
    document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var modal = document.querySelector(btn.getAttribute('data-open-modal'));
        if (!modal) return;
        modal.classList.add('open');
        var evName = btn.getAttribute('data-event-name');
        var target = modal.querySelector('[data-modal-event-name]');
        if (target && evName) target.textContent = evName;
        var closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
      });
    });
    document.querySelectorAll('.modal-backdrop').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('open');
      });
      var closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.addEventListener('click', function () { modal.classList.remove('open'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') modal.classList.remove('open');
      });
    });

    /* ---------------- Reserve-in-store micro-interaction ---------------- */
    var reserveBtn = document.querySelector('[data-reserve-btn]');
    if (reserveBtn) {
      reserveBtn.addEventListener('click', function () {
        reserveBtn.disabled = true;
        reserveBtn.textContent = 'Reserved — pick up within 3 days';
      });
    }

    /* ---------------- Countdown (Coming Soon) ---------------- */
    var countdown = document.querySelector('[data-countdown]');
    if (countdown) {
      var target = new Date();
      target.setDate(target.getDate() + 21);
      var dEl = countdown.querySelector('[data-cd-days]');
      var hEl = countdown.querySelector('[data-cd-hours]');
      var mEl = countdown.querySelector('[data-cd-mins]');
      var sEl = countdown.querySelector('[data-cd-secs]');
      function tick() {
        var diff = Math.max(0, target - new Date());
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        if (dEl) dEl.textContent = String(d).padStart(2, '0');
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');
      }
      tick();
      setInterval(tick, 1000);
    }

    /* ---------------- Count-up stats (vanilla rAF) ---------------- */
    var statEls = document.querySelectorAll('[data-count-to]');
    if (statEls.length && 'IntersectionObserver' in window) {
      var counted = new WeakSet();
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted.has(entry.target)) {
            counted.add(entry.target);
            var el = entry.target;
            var to = parseInt(el.getAttribute('data-count-to'), 10) || 0;
            var start = null;
            var dur = 1400;
            function step(ts) {
              if (!start) start = ts;
              var p = Math.min(1, (ts - start) / dur);
              el.textContent = Math.floor(p * to).toLocaleString();
              if (p < 1) requestAnimationFrame(step);
              else el.textContent = to.toLocaleString();
            }
            requestAnimationFrame(step);
          }
        });
      }, { threshold: 0.5 });
      statEls.forEach(function (el) { statIO.observe(el); });
    }

    /* ---------------- Password visibility toggle ---------------- */
    document.querySelectorAll('.pw-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.closest('.pw-field').querySelector('input');
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'HIDE' : 'SHOW';
      });
    });

    /* ---------------- Generic form validation ---------------- */
    function validateField(field) {
      var input = field.querySelector('input, textarea, select');
      if (!input) return true;
      var value = input.value.trim();
      var valid = true;
      if (input.required && value === '') valid = false;
      if (valid && input.type === 'email' && value !== '') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (valid && input.type === 'tel' && value !== '') {
        valid = /^[\d\s()+-]{7,20}$/.test(value);
      }
      if (valid && input.hasAttribute('minlength') && value.length < parseInt(input.getAttribute('minlength'), 10)) valid = false;
      if (valid && input.type === 'checkbox') valid = input.checked;
      field.classList.toggle('invalid', !valid);
      return valid;
    }
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      form.querySelectorAll('.field').forEach(function (field) {
        var input = field.querySelector('input, textarea, select');
        if (!input) return;
        input.addEventListener('blur', function () { validateField(field); });
        input.addEventListener('input', function () { if (field.classList.contains('invalid')) validateField(field); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fields = form.querySelectorAll('.field');
        var allValid = true;
        fields.forEach(function (field) { if (!validateField(field)) allValid = false; });
        if (!allValid) {
          var firstInvalid = form.querySelector('.field.invalid input, .field.invalid textarea, .field.invalid select');
          if (firstInvalid) firstInvalid.focus();
          return;
        }
        form.style.display = 'none';
        var success = document.querySelector(form.getAttribute('data-success-target') || '.form-success');
        if (success) success.classList.add('show');
      });
    });

    /* ---------------- Home dropdown (Home 1 / Home 2) ---------------- */
    document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
      var trigger = dd.querySelector('.nav-dropdown-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !dd.classList.contains('open');
        document.querySelectorAll('.nav-dropdown.open').forEach(function (o) {
          o.classList.remove('open');
          var t = o.querySelector('.nav-dropdown-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        dd.classList.toggle('open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (dd) {
        dd.classList.remove('open');
        var t = dd.querySelector('.nav-dropdown-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.nav-dropdown.open').forEach(function (dd) {
          dd.classList.remove('open');
          var t = dd.querySelector('.nav-dropdown-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });

    /* ---------------- Active nav link ---------------- */
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .nav-dropdown-menu a, .mobile-nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
    });
    if (path === 'index.html' || path === 'home-2.html') {
      var homeTrigger = document.querySelector('.nav-dropdown-trigger');
      if (homeTrigger) homeTrigger.classList.add('active');
    }
  });
})();
