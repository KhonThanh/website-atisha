// ----------- Vùng chức năng -------------
// 🧩 1️⃣ Include HTML Components
function includeHTML(callback) {
  const elements = document.querySelectorAll("[data-include]");
  if (!elements.length) {
    if (callback) callback();
    return;
  }

  let loaded = 0;

  Promise.all([...elements].map(async (el) => {
    const file = el.getAttribute("data-include");
    if (!file) return;

    const cacheKey = `comp-${file}`;
    let html = sessionStorage.getItem(cacheKey);

    if (!html) {
      const res = await fetch(`${file}?v=${Date.now()}`, { cache: "no-store" });
      html = await res.text();
      sessionStorage.setItem(cacheKey, html);
    }

    el.innerHTML = html;
    if (typeof initResponsive === "function") initResponsive(el);

    if (++loaded === elements.length) {
      document.dispatchEvent(new Event("includesLoaded"));
      if (callback) callback();
    }
  }));
}

// js thêm active
function initToggleSystem(configs = []) {
  if (!window._toggleSystemState) {
    window._toggleSystemState = { docKeys: new Set(), keyKeys: new Set() };
  }
  const state = window._toggleSystemState;

  configs.forEach((cfg, cfgIndex) => {
    if (!cfg || !cfg.trigger) return;

    const activeClass = cfg.activeClass || "active";
    const behavior = cfg.behavior || "toggle";
    const closeOnOutside = !!cfg.closeOnOutside;
    const closeOnEsc = !!cfg.closeOnEsc;
    const overlayCloses = !!cfg.overlayCloses;
    const innerSelector = cfg.innerSelector || null;
    const closeBtnSelector = cfg.closeBtn || null;
    const groupSelector = cfg.groupSelector || null;

    const triggers = Array.from(document.querySelectorAll(cfg.trigger));
    if (!triggers.length) return;

    const targets = cfg.target ? Array.from(document.querySelectorAll(cfg.target)) : [];

    const closeAll = () => {
      targets.forEach(t => t.classList.remove(activeClass));
      triggers.forEach(t => t.classList.remove(activeClass));
    };

    // bind sự kiện click cho từng trigger (chỉ bind 1 lần)
    triggers.forEach((trigger, idx) => {
      if (trigger.dataset._toggleBound === "true") return;
      trigger.dataset._toggleBound = "true";

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();

        // Tìm target element ứng với trigger (nếu có)
        let targetEl = null;
        if (cfg.target) {
          if (trigger.dataset && trigger.dataset.target) {
            targetEl = document.querySelector(trigger.dataset.target);
          } else {
            targetEl = targets[idx] || targets[0] || null;
          }
        }

        // ---- behavior activate (tab-like) ----
        if (behavior === "activate") {
          if (groupSelector) {
            document.querySelectorAll(groupSelector).forEach(el => el.classList.remove(activeClass));
          } else {
            triggers.forEach(t => t.classList.remove(activeClass));
          }
          trigger.classList.add(activeClass);

          if (targets.length > 0 && targetEl) {
            targets.forEach(t => t.classList.remove(activeClass));
            targetEl.classList.add(activeClass);
          }
        }

        // ---- toggle mode ----
        else {
          if (targetEl) targetEl.classList.toggle(activeClass);
          else trigger.classList.toggle(activeClass);
        }

        // callback onToggle (nếu có)
        if (typeof cfg.onToggle === "function") {
          try { cfg.onToggle(trigger, idx); } catch (err) { /* ignore */ }
        }

        // -> GỌI onActiveChange bất kể có target hay không
        if (typeof cfg.onActiveChange === "function") {
          const isActive = targetEl ? targetEl.classList.contains(activeClass) : trigger.classList.contains(activeClass);
          try { cfg.onActiveChange(isActive, trigger, targetEl, idx); } catch (err) { /* ignore */ }
        }
      });
    });

    // bind nút đóng (nhiều selector)
    if (closeBtnSelector) {
      Array.from(document.querySelectorAll(closeBtnSelector)).forEach(btn => {
        if (btn.dataset._toggleCloseBound === "true") return;
        btn.dataset._toggleCloseBound = "true";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeAll();
        });
      });
    }

    // click outside để đóng
    if (closeOnOutside) {
      const docKey = `doc_${cfg.trigger}|${cfg.target || ""}|${cfgIndex}`;
      if (!state.docKeys.has(docKey)) {
        state.docKeys.add(docKey);
        document.addEventListener("click", (e) => {
          const currTriggers = Array.from(document.querySelectorAll(cfg.trigger));
          const currTargets = cfg.target ? Array.from(document.querySelectorAll(cfg.target)) : [];

          const clickedOnTrigger = currTriggers.some(t => t.contains(e.target));
          const clickedOnOverlay = overlayCloses && currTargets.some(t => e.target === t);

          const clickedInsideTarget = currTargets.some(t => {
            const inner = innerSelector ? t.querySelector(innerSelector) : t;
            return inner && inner.contains(e.target);
          });

          if (clickedOnOverlay) {
            currTargets.forEach(t => t.classList.remove(activeClass));
            currTriggers.forEach(t => t.classList.remove(activeClass));
            return;
          }

          if (!clickedInsideTarget && !clickedOnTrigger) {
            currTargets.forEach(t => t.classList.remove(activeClass));
            currTriggers.forEach(t => t.classList.remove(activeClass));
          }
        });
      }
    }

    // ESC để đóng
    if (closeOnEsc) {
      const escKey = `esc_${cfg.trigger}|${cfg.target || ""}|${cfgIndex}`;
      if (!state.keyKeys.has(escKey)) {
        state.keyKeys.add(escKey);
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            const currTargets = cfg.target ? Array.from(document.querySelectorAll(cfg.target)) : [];
            const currTriggers = Array.from(document.querySelectorAll(cfg.trigger));
            currTargets.forEach(t => t.classList.remove(activeClass));
            currTriggers.forEach(t => t.classList.remove(activeClass));
          }
        });
      }
    }

    // === gọi onActiveChange cho trạng thái ban đầu (nếu có active sẵn trong DOM) ===
    if (typeof cfg.onActiveChange === "function") {
      // delay một tick để đảm bảo các class có sẵn đã gán xong (nếu include động)
      setTimeout(() => {
        Array.from(document.querySelectorAll(cfg.trigger)).forEach((tr, i) => {
          const targetEl = cfg.target ? (document.querySelectorAll(cfg.target)[i] || document.querySelectorAll(cfg.target)[0]) : null;
          const isActive = targetEl ? targetEl.classList.contains(activeClass) : tr.classList.contains(activeClass);
          if (isActive) {
            try { cfg.onActiveChange(true, tr, targetEl, i); } catch (err) { }
          }
        });
      }, 0);
    }
  });
}

// 🖼️ 2️⃣ Lazy Load + Set Dimensions
function applyImageEnhancements(root = document) {
  root.querySelectorAll("img").forEach(img => {
    // Lazy load
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");

    // Alt text
    if (!img.hasAttribute("alt") || img.alt.trim() === "") {
      const fileName = img.src.split("/").pop().split(".")[0] || "image";
      img.setAttribute("alt", fileName.replace(/[-_]/g, " "));
    }

    // Hàm set kích thước an toàn
    const setDim = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        if (!img.hasAttribute("width")) img.setAttribute("width", img.naturalWidth);
        if (!img.hasAttribute("height")) img.setAttribute("height", img.naturalHeight);
      }
    };

    // Nếu ảnh đã load sẵn (cache hoặc render sớm)
    if (img.complete) setTimeout(setDim, 50);
    else img.addEventListener("load", setDim);

    // Chỉ xử lý khi xuất hiện trong viewport
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setDim();
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "200px 0px" });
    io.observe(img);
  });
}

// ✨ 3️⃣ Scroll Reveal Effect
function initRevealEffect() {
  const sections = document.querySelectorAll("section, footer");
  if (!sections.length) return;

  sections.forEach(sec => sec.classList.add("hidden-section"));

  let revealIndex = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.transitionDelay = `${revealIndex * 20}ms`;
        revealIndex++;
        el.classList.add("show-up");
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -10% 0px" });

  sections.forEach(sec => observer.observe(sec));
}

// 🧩 1️⃣ Hàm dùng chung cho tất cả slick
function initSlickSlider({
  mainSelector,
  navSelector = null,
  minSlides = 0,
  mainOptions = {},
  navOptions = {},
  prevBtnSelector = null,
  nextBtnSelector = null
}) {
  const $main = $(mainSelector);
  if (!$main.length) return;

  // --- Helper: clone thêm slide nếu ít hơn minSlides ---
  const ensureMinSlides = ($el, minCount) => {
    const $items = $el.children();
    let count = $items.length;
    let i = 0;
    while (count < minCount) {
      $el.append($items.eq(i % $items.length).clone());
      count++;
      i++;
    }
  };

  // --- Có nav → slider kép ---
  if (navSelector) {
    const $nav = $(navSelector);
    if (!$nav.length) return;

    if (minSlides > 0) ensureMinSlides($nav, minSlides);

    if (!$main.hasClass("slick-initialized")) {
      $main.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        infinite: true,
        arrows: false,
        asNavFor: navSelector,
        ...mainOptions
      });
    }

    if (!$nav.hasClass("slick-initialized")) {
      $nav.slick({
        slidesToShow: 8,
        slidesToScroll: 1,
        focusOnSelect: true,
        infinite: true,
        arrows: false,
        centerMode: true,
        centerPadding: "0px",
        asNavFor: mainSelector,
        ...navOptions
      });
    }

    // --- Nút prev/next riêng (nếu có) ---
    if (prevBtnSelector) {
      const prevBtn = document.querySelector(prevBtnSelector);
      if (prevBtn) prevBtn.addEventListener("click", () => $main.slick("slickPrev"));
    }

    if (nextBtnSelector) {
      const nextBtn = document.querySelector(nextBtnSelector);
      if (nextBtn) nextBtn.addEventListener("click", () => $main.slick("slickNext"));
    }
  }

  // --- Không có nav → slider đơn ---
  else {
    if (minSlides > 0) ensureMinSlides($main, minSlides);

    if (!$main.hasClass("slick-initialized")) {
      $main.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        infinite: true,
        ...mainOptions
      });
    }

    if (prevBtnSelector) {
      const prevBtn = document.querySelector(prevBtnSelector);
      if (prevBtn) prevBtn.addEventListener("click", () => $main.slick("slickPrev"));
    }

    if (nextBtnSelector) {
      const nextBtn = document.querySelector(nextBtnSelector);
      if (nextBtn) nextBtn.addEventListener("click", () => $main.slick("slickNext"));
    }
  }
}

// js chức năng bấm hình sản phẩm
function initProductGallery({
  containerSelector,
  mainSelector,
  thumbSelector
}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const mainImage = container.querySelector(mainSelector);
  const thumbItems = container.querySelectorAll(thumbSelector);
  const prevBtn = container.querySelector("button:first-child");
  const nextBtn = container.querySelector("button:last-child");

  if (!mainImage || !thumbItems.length) return;

  let currentIndex = 0;

  // Đổi ảnh chính
  const showImage = (index) => {
    currentIndex = index;
    mainImage.src = thumbItems[currentIndex].src;
  };

  // Click thumbnail
  thumbItems.forEach((img, index) => {
    img.addEventListener("click", () => showImage(index));
  });

  // Nút prev / next
  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + thumbItems.length) % thumbItems.length;
    showImage(currentIndex);
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % thumbItems.length;
    showImage(currentIndex);
  });
}

// chức năng swiper ở mục tab và sản phẩm trang chủ
function enableHorizontalSwipe(selector, speed = 1) {
  const container = document.querySelector(selector);
  if (!container) return;

  let isDown = false;
  let startX, scrollLeft;

  const startDrag = e => {
    isDown = true;
    container.classList.add("grabbing");
    startX = e.pageX || e.touches[0].pageX;
    scrollLeft = container.scrollLeft;
  };

  const moveDrag = e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX;
    const walk = (x - startX) * speed;
    container.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    isDown = false;
    container.classList.remove("grabbing");
  };

  // Gán event cho cả chuột & cảm ứng
  container.addEventListener("mousedown", startDrag);
  container.addEventListener("touchstart", startDrag);
  container.addEventListener("mousemove", moveDrag);
  container.addEventListener("touchmove", moveDrag);
  container.addEventListener("mouseup", endDrag);
  container.addEventListener("mouseleave", endDrag);
  container.addEventListener("touchend", endDrag);
}

// chức năng đổi tên và gán link vào a và đạc biệt thêm thẻ li a vào mục lục bài viét
function generateHeadingLinks({
  contentSelector,
  outputSelector = null,
  linkSelector = null,
  toggleSelector = null
}) {
  const content = document.querySelector(contentSelector);
  if (!content) return;

  const headings = content.querySelectorAll("h1, h2, h3, h4, h5, h6");
  if (!headings.length) return;

  const toSlug = str => str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .toLowerCase();

  headings.forEach((h, i) => {
    const text = h.textContent.trim();
    const id = toSlug(text) || `heading-${i}`;
    h.id = id;
  });

  if (outputSelector) {
    const tocBody = document.querySelector(outputSelector);
    if (tocBody) {
      tocBody.innerHTML = "";
      headings.forEach(h => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${h.id}`;
        a.textContent = h.textContent.trim();
        li.appendChild(a);
        tocBody.appendChild(li);
      });
    }


    if (toggleSelector && tocBody) {
      const toggle = document.querySelector(toggleSelector);
      toggle.addEventListener("click", e => {
        e.stopPropagation();
        tocBody.classList.toggle("open");
      });
      document.addEventListener("click", e => {
        if (!e.target.closest(toggleSelector)) tocBody.classList.remove("open");
      });
    }
  }


  if (linkSelector) {
    const links = document.querySelectorAll(linkSelector);
    const count = Math.min(headings.length, links.length);
    for (let i = 0; i < count; i++) {
      const heading = headings[i];
      const link = links[i];
      link.setAttribute("href", `#${heading.id}`);
      link.addEventListener("click", e => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }
}

// document.addEventListener("DOMContentLoaded", () => {
//   const btnShare = document.querySelector(".btn-share");
//   if (!btnShare) return;

//   btnShare.addEventListener("click", () => {
//     // Kiểm tra text trong nút
//     const text = btnShare.textContent.trim().toLowerCase();

//     if (text.includes("chia sẻ")) {
//       const shareDrop = document.querySelector(".news__share__drop");
//       if (shareDrop) {
//         shareDrop.classList.toggle("active");
//       }
//     }
//   });
// });

// ----------- Vùng gọi biến --------------
document.addEventListener("DOMContentLoaded", () => {
  includeHTML(() => {

    // 📚 1️⃣ MỤC LỤC & MENU LIÊN KẾT
    generateHeadingLinks({
      contentSelector: ".blog-content",
      outputSelector: ".table-heading__body ul",
      toggleSelector: ".table-heading__top"
    });

    generateHeadingLinks({
      contentSelector: "#intro-content",
      linkSelector: ".menu-shortcut__container .intro-banner__shortcut"
    });

    // 🧭 2️⃣ SWIPE NGANG / DRAG TAB
    enableHorizontalSwipe(".product-container", 1);
    enableHorizontalSwipe(".product-container__mb", 1.2);

    // 🎞️ 3️⃣ SLICK SLIDER CÁC PHẦN

    // 🟢 Slide banner chính
    initSlickSlider({
      mainSelector: '.slide-container',
      minSlides: 3,
      mainOptions: {
        infinite: true,
        autoplay: true,
        dots: true,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: false,
        appendDots: $('.custom-dots')
      }
    });

    // 🟣 Feedback slide
    initSlickSlider({
      mainSelector: '.feedback-item__container',
      mainOptions: {
        infinite: true,
        autoplay: true,
        dots: false,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: false
      }
    });

    // 🟡 Intro slide chạy ngang
    initSlickSlider({
      mainSelector: '.intro-slide',
      minSlides: 6,
      mainOptions: {
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 4000,
        cssEase: 'linear',
        arrows: false,
        dots: false,
        infinite: true,
        pauseOnHover: false,
        pauseOnFocus: false,
        variableWidth: true
      }
    });

    // 🔵 Popup gallery (for–nav)
    initSlickSlider({
      mainSelector: ".gallery-slider-for",
      navSelector: ".gallery-slider-nav",
      popupSelector: ".gallery-section",
      triggerSelector: ".intro-slide__img img, .intro-slide__folderImage img",
      closeBtnSelector: ".gallery-section .btn-close",
      prevBtnSelector: ".gallery-section .btn-prev",
      nextBtnSelector: ".gallery-section .btn-next",
      minSlides: 9,
      mainOptions: {
        speed: 500
      },
      navOptions: {
        variableWidth: true
      }
    });

    // gallery hình ảnh sản phẩm
    initProductGallery({
      containerSelector: ".product-container__image",
      mainSelector: ".product-image > img",
      thumbSelector: ".product-image__item img"
    });
    // ✨ 4️⃣ HIỆU ỨNG ẢNH & REVEAL
    applyImageEnhancements();
    initRevealEffect();

    // THỰC THI ADD ACTIVE VÀO VÙNG CẦN
    initToggleSystem([
      {
        trigger: ".btn-submit-review",
        target: "#popupReview",
        closeBtn: "#popupReview .btn-close, #popupReview .popup-close",
        closeOnOutside: true,
        closeOnEsc: true,
        behavior: "toggle"
      },

      {
        trigger: ".product-tab__button",
        behavior: "activate",
        groupSelector: ".product-tab__button"
      },

      {
        trigger: ".table-heading__top",
        target: ".table-heading__body",
        closeOnOutside: true,
        behavior: "toggle"
      },

      {
        trigger: "#menuMobileButton",
        target: ".menu-list__mobile",
        closeBtn: ".clone-menu__container",
        closeOnOutside: true,
        behavior: "toggle"
      },
      {
        trigger: ".review-filter button",
        behavior: "activate",
        groupSelector: ".review-filter button",
        activeClass: "active"
      },
      {
        trigger: ".header-function__blog",
        target: ".header-newsandknowledge__content",
        activeClass: "active",
        closeOnOutside: true
      },
      {
        trigger: ".branch",
        behavior: "activate",
        groupSelector: ".branch",
        activeClass: "active",
        onActiveChange(isActive, trigger) {
          if (!isActive) return;
          const lat = trigger.dataset.lat;
          const lng = trigger.dataset.lng;
          const mapFrame = document.getElementById("mapFrame");
          if (mapFrame && lat && lng) {
            mapFrame.style.transition = "opacity 0.25s ease";
            mapFrame.style.opacity = 0;
            setTimeout(() => {
              mapFrame.src = `https://www.google.com/maps?q=${lat},${lng}&hl=vi&z=14&output=embed`;
              mapFrame.onload = () => { mapFrame.style.opacity = 1; };
            }, 180);
          }
        }
      },
      {
        trigger: ".btn-like",
        behavior: "toggle", 
        activeClass: "active",
      },

      {
        trigger: ".btn-share",
        target: ".news__share__drop",
        activeClass: "active", 
        closeBtn: ".news__share__close",
        closeOnOutside: true,
        closeOnEsc: true,
      },
      {
        trigger: ".intro-slide__img img, .intro-slide__folderImage img",
        target: ".gallery-section",
        activeClass: "active",
        closeBtn: ".gallery-section .btn-close",
        closeOnOutside: true,
        overlayCloses: true,
        closeOnEsc: true,
      }
      // ... thêm config khác theo cùng mẫu ...
    ]);
  });
});

// 🔁 Cập nhật khi include hoặc slick load lại
document.addEventListener("includesLoaded", () => applyImageEnhancements());
$(document).on("init reInit afterChange", ".slick-slider", function () {
  applyImageEnhancements(this);
});
