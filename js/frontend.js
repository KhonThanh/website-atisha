// js phần component
const includeElements = document.querySelectorAll("[data-include]");
let loadedCount = 0;

Promise.all(
  [...includeElements].map(async (el) => {
    const file = el.getAttribute("data-include");
    if (!file) return;

    const cacheKey = `comp-${file}`;
    let html = sessionStorage.getItem(cacheKey);

    if (!html) {
      const response = await fetch(`${file}?v=${Date.now()}`, { cache: "no-store" });
      html = await response.text();
      sessionStorage.setItem(cacheKey, html);
    }

    el.innerHTML = html;
    if (typeof initResponsive === "function") initResponsive(el);

    loadedCount++;
    if (loadedCount === includeElements.length) {
      document.dispatchEvent(new Event("includesLoaded"));
    }
  })
);

// js thêm width và height vào bất kì thẻ img và thêm alt
function applyLazyAndDimensions(img) {
  // Lazy load
  if (!img.hasAttribute("loading")) {
    img.setAttribute("loading", "lazy");
  }

  // Gán alt nếu chưa có
  if (!img.hasAttribute("alt") || img.alt.trim() === "") {
    let fileName = img.src.split("/").pop().split(".")[0];
    img.setAttribute("alt", fileName.replace(/[-_]/g, " "));
  }

  // Cập nhật kích thước
  const updateSize = () => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setDimensions(img);
      return true;
    }
    return false;
  };

  if (updateSize()) return; // có kích thước rồi thì thôi

  img.addEventListener("load", () => updateSize());

  // Nếu trong tab ẩn, đợi nó hiển thị rồi mới set
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateSize();
        observer.disconnect();
      }
    });
  });
  observer.observe(img);
}

function setDimensions(img) {
  if (!img.hasAttribute("width")) {
    img.setAttribute("width", img.naturalWidth);
  }
  if (!img.hasAttribute("height")) {
    img.setAttribute("height", img.naturalHeight);
  }
}

// Chạy khi includesLoaded
document.addEventListener("includesLoaded", () => {
  document.querySelectorAll("img").forEach(applyLazyAndDimensions);
});

// Chạy lại mỗi khi Slick init hoặc reInit
$(document).on('init reInit afterChange', '.slick-slider', function () {
  $(this).find('img').each(function () {
    applyLazyAndDimensions(this);
  });
});

// js slide
$(document).ready(function () {
  let $slider = $('.slide-container');

  if ($slider.length) {
    let $slides = $slider.children('div');
    let slideCount = $slides.length;

    if (slideCount < 3) {
      for (let i = slideCount; i < 3; i++) {
        $slider.append($slides.eq(i % slideCount).clone());
      }
    }

    $slider.slick({
      infinite: true,
      autoplay: true,
      dots: true,
      arrows: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: false,
      appendDots: $('.custom-dots')
    });
  }
});

// js feedback
$(document).ready(function () {
  let $slider = $('.feedback-item__container');

  $slider.slick({
    infinite: true,
    autoplay: false,
    dots: false,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: false,
  });
});

// js phần intro
$(document).ready(function () {
  let $introSlide = $('.intro-slide');
  let itemCount = $introSlide.children().length;

  if (itemCount < 6) {
    let clonesNeeded = 6 - itemCount;
    for (let i = 0; i < clonesNeeded; i++) {
      $introSlide.append($introSlide.children().eq(i).clone());
    }
  }

  if (!$introSlide.hasClass('slick-initialized')) {
    $introSlide.slick({
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
    });
  }
});

// js hiệu ứng 
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section, footer");
  if (!sections.length) return;

  sections.forEach(sec => {
    sec.classList.add("hidden-section");
  });

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
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -10% 0px"
  });

  sections.forEach(sec => observer.observe(sec));
});

// js tab product
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".product-tab__button");

  if (!tabs || tabs.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(btn => btn.classList.remove("active"));
      tab.classList.add("active");
    });
  });
});

//ja menu
document.addEventListener("DOMContentLoaded", function () {
  const menuRoot = document.querySelector(".menu-root");

  if (menuRoot) {
    menuRoot.addEventListener("click", function (e) {
      const link = e.target.closest("a");
      if (!link) return;

      const menuItem = link.closest(".menu-item");
      if (!menuItem) return;

      const submenu = menuItem.querySelector(".submenu");

      if (submenu) {
        if (!submenu.classList.contains("active")) {
          e.preventDefault();
          menuRoot.querySelectorAll(".submenu.active").forEach(sm => {
            if (sm !== submenu) sm.classList.remove("active");
          });

          submenu.classList.add("active");
        } else {
          submenu.classList.remove("active");
        }
      }
    });
  }
});

//js menu table
const menuButtonTable = document.querySelector('.menu-container__bar');
const menuTable = document.querySelector('.menu-list__table');

if (menuButtonTable && menuTable) {
  menuButtonTable.addEventListener('click', (e) => {
    e.stopPropagation();
    menuTable.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!menuTable.contains(e.target) && !menuButtonTable.contains(e.target)) {
      menuTable.classList.remove('active');
    }
  });
}

// Menu mobile
document.addEventListener("DOMContentLoaded", () => {
  const menuButtonMobile = document.getElementById('menuMobileButton');
  const menuMobileList = document.querySelector('.menu-list__mobile');
  const closeMenuButton = document.querySelector('.clone-menu__container'); // nút ⨉

  if (menuButtonMobile && menuMobileList) {
    // Toggle toàn bộ menu mobile
    menuButtonMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      menuMobileList.classList.toggle('active');
    });

    // Click ra ngoài thì đóng
    document.addEventListener('click', (e) => {
      if (!menuMobileList.contains(e.target) && !menuButtonMobile.contains(e.target)) {
        menuMobileList.classList.remove('active');
        menuMobileList.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('active'));
      }
    });

    // Toggle submenu
    const menuItems = menuMobileList.querySelectorAll('.menu-item > a');
    menuItems.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const parentItem = link.parentElement;
        const submenu = parentItem.querySelector('.submenu');
        if (submenu) {
          menuMobileList.querySelectorAll('.submenu.active').forEach(sub => {
            if (sub !== submenu) sub.classList.remove('active');
          });
          submenu.classList.toggle('active');
        }
      });
    });

    // 🆕 Khi bấm nút ⨉ (clone-menu__container) thì đóng menu mobile
    if (closeMenuButton) {
      closeMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        menuMobileList.classList.remove('active');
        menuMobileList.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('active'));
      });
    }
  }
});

// js tạo mục lục
document.addEventListener("DOMContentLoaded", () => {
  const tocBody = document.querySelector(".table-heading__body");
  if (!tocBody) return;

  // Xóa nội dung cũ trong .table-heading__body
  tocBody.innerHTML = "<ul></ul>";
  const tocList = tocBody.querySelector("ul");

  // Chỉ lấy headings bên trong .product-page__intro
  const contentArea = document.querySelector(".product-page__intro");
  if (!contentArea) return;

  const headings = contentArea.querySelectorAll("h1, h2, h3");

  headings.forEach((heading, index) => {
    // Nếu chưa có id thì gán
    if (!heading.id) {
      let slug = heading.textContent
        .toLowerCase()
        .normalize("NFD")            // tách dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
        .replace(/[^a-z0-9]+/g, "-") // thay space/ký tự đặc biệt bằng -
        .replace(/^-+|-+$/g, "");    // xóa - thừa đầu/cuối
      heading.id = slug || `heading-${index + 1}`;
    }

    // Tạo list item
    const li = document.createElement("li");
    li.classList.add(`toc-${heading.tagName.toLowerCase()}`);
    li.innerHTML = `<a href="#${heading.id}">${heading.textContent}</a>`;
    tocList.appendChild(li);
  });

  // Toggle mở/đóng body khi click vào top
  const tocTop = document.querySelector(".table-heading__top");
  if (tocTop) {
    tocTop.addEventListener("click", () => {
      tocTop.classList.toggle("active");
      tocBody.classList.toggle("open");
    });
  }
});

//js review 
function openReviewPopup() {
  const popup = document.getElementById("popupReview");
  if (popup) {
    popup.classList.add("active");
  }
}

function closePopup() {
  const popup = document.getElementById("popupReview");
  if (popup) {
    popup.classList.remove("active");
  }
}

document.addEventListener("click", (e) => {
  const popup = document.getElementById("popupReview");
  if (popup && popup.classList.contains("active")) {
    const box = popup.querySelector(".popup-box");
    if (!box.contains(e.target) && !e.target.closest(".btn-submit-review")) {
      popup.classList.remove("active");
    }
  }
});

//js mục lục bài viết
document.addEventListener("DOMContentLoaded", function () {
  const blogContent = document.querySelector(".blog-content");
  if (!blogContent) return;

  function toSlug(str) {
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .replace(/\s+/g, "-")
      .toLowerCase();
  }

  const headings = blogContent.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const tocBody = document.querySelector(".table-heading__body ul");

  if (headings.length && tocBody) {
    tocBody.innerHTML = "";
    headings.forEach((h, index) => {
      const text = h.textContent.trim();
      const id = toSlug(text) || `heading-${index}`;
      h.id = id;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = text;
      li.appendChild(a);
      tocBody.appendChild(li);
    });
  }

  const tocTop = document.querySelector(".table-heading__top");
  const tocBottom = document.querySelector(".table-heading__body");

  if (tocTop && tocBottom) {
    // Toggle khi bấm top
    tocTop.addEventListener("click", function (e) {
      e.stopPropagation(); // chặn nổi bọt
      tocBottom.classList.toggle("open");
    });

    // Bấm vào link thì đóng TOC
    tocBottom.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        tocBottom.classList.remove("open");
      });
    });

    // Bấm ra ngoài thì đóng TOC
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".table-heading")) {
        tocBottom.classList.remove("open");
      }
    });
  }
});


// js phần tắt mở popup đăng ký
document.addEventListener("DOMContentLoaded", () => {
  const btnRec = document.getElementById("recruitmentReg");
  const popupRecContainer = document.querySelector(".recruitment-popup");
  const btnClose = document.getElementById("close-btn");
  const popupContainer = document.querySelector(".recruitment-form__container");

  if (!btnRec || !popupRecContainer || !btnClose || !popupContainer) return;

  btnRec.addEventListener("click", () => {
    popupRecContainer.classList.add("active");
  });

  btnClose.addEventListener("click", () => {
    popupRecContainer.classList.remove("active");
  });

  popupRecContainer.addEventListener("click", (e) => {
    if (!popupContainer.contains(e.target)) {
      popupRecContainer.classList.remove("active");
    }
  });


});

// js chức năng share và like
document.addEventListener("DOMContentLoaded", function () {
  const likeBtn = document.querySelector(".btn-like");
  const shareBtn = document.querySelector(".btn-share");

  if (!likeBtn && !shareBtn) return; // không có nút nào thì thoát luôn

  if (likeBtn) {
    likeBtn.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  }
});

// js hình ảnh sản phẩm
document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".product-container__image");
  if (!container) return;

  const mainImage = container.querySelector(".product-image > img");
  const thumbItems = container.querySelectorAll(".product-image__item img");
  const prevBtn = container.querySelector(".product-image button:first-child");
  const nextBtn = container.querySelector(".product-image button:last-child");

  if (!mainImage || !thumbItems.length) return;

  let currentIndex = 0;

  // Hàm đổi ảnh
  function showImage(index) {
    currentIndex = index;
    mainImage.src = thumbItems[currentIndex].src;
  }

  // Click thumbnail
  thumbItems.forEach((img, index) => {
    img.addEventListener("click", () => {
      showImage(index);
    });
  });

  // Click prev
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + thumbItems.length) % thumbItems.length;
      showImage(currentIndex);
    });
  }

  // Click next
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % thumbItems.length;
      showImage(currentIndex);
    });
  }
});

// js popup
document.addEventListener("DOMContentLoaded", function () {
  const sliderFor = document.querySelector(".gallery-slider-for");
  const sliderNav = document.querySelector(".gallery-slider-nav");

  if (!sliderFor || !sliderNav || !$(sliderFor).slick || !$(sliderNav).slick) return;

  const items = sliderNav.querySelectorAll("div");
  const minSlides = 10;

  if (items.length && items.length < minSlides) {
    let currentCount = items.length;
    let i = 0;

    while (currentCount < minSlides) {
      const clone = items[i % items.length].cloneNode(true);
      sliderNav.appendChild(clone);
      currentCount++;
      i++;
    }
  }

  // Slider chính
  $(sliderFor).slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    infinite: true,
    asNavFor: ".gallery-slider-nav"
  });

  // Slider nav
  $(sliderNav).slick({
    arrows: true,
    slidesToShow: 9,
    slidesToScroll: 1,
    asNavFor: ".gallery-slider-for",
    dots: false,
    focusOnSelect: true,
    infinite: true,
    centerMode: true,
    centerPadding: "0px",
    prevArrow: $(".btn-prev"),
    nextArrow: $(".btn-next"),
  });
});

// js popup hình sản phẩm
document.addEventListener("DOMContentLoaded", function () {
  const introSlide = document.querySelector(".intro-slide");
  const gallerySection = document.querySelector(".gallery-section");
  const btnClose = document.querySelector(".gallery-section .btn-close");

  if (!introSlide || !gallerySection) return;

  // Bấm ảnh trong intro-slide
  const imgs = introSlide.querySelectorAll("img");
  imgs.forEach(img => {
    img.addEventListener("click", () => {
      gallerySection.classList.add("active");
    });
  });

  // Bấm nút close
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      gallerySection.classList.remove("active");
    });
  }

  // Bấm ra ngoài overlay cũng tắt
  gallerySection.addEventListener("click", (e) => {
    if (e.target === gallerySection) {
      gallerySection.classList.remove("active");
    }
  });

  // Bấm ESC để tắt
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && gallerySection.classList.contains("active")) {
      gallerySection.classList.remove("active");
    }
  });
});

// js bản tin
document.addEventListener("DOMContentLoaded", () => {
  const blogButton = document.querySelector(".header-function__blog");
  const blogContent = document.querySelector(".header-newsandknowledge__content");

  if (!blogButton || !blogContent) return;

  blogButton.addEventListener("click", (e) => {
    e.stopPropagation();
    blogContent.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!blogButton.contains(e.target) && !blogContent.contains(e.target)) {
      blogContent.classList.remove("active");
    }
  });
});

// js tính năng vuốt của phần type sản phẩm và sản phẩm

document.addEventListener("DOMContentLoaded", () => {
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

  // Gọi hàm cho 2 container
  enableHorizontalSwipe(".product-container", 1);
  enableHorizontalSwipe(".product-container__mb", 1.2);
});