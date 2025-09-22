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

// js thêm width và height vào bất kì thẻ img
function applyLazyAndDimensions(img) {
  if (!img.hasAttribute("loading")) {
    img.setAttribute("loading", "lazy");
  }

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
$(document).ready(function(){
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

// js phần intro
$(document).ready(function(){
  let $introSlide = $('.intro-slide');
  let itemCount = $introSlide.children().length;

  if(itemCount < 6){
    let clonesNeeded = 6 - itemCount;
    for(let i = 0; i < clonesNeeded; i++){
      $introSlide.append($introSlide.children().eq(i).clone());
    }
  }

  if(!$introSlide.hasClass('slick-initialized')) {
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
        // đóng hết submenu khi đóng menu mobile
        menuMobileList.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('active'));
      }
    });

    // Toggle submenu trong menu mobile
    const menuItems = menuMobileList.querySelectorAll('.menu-item > a');
    menuItems.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); // không cho nhảy link
        const parentItem = link.parentElement;
        const submenu = parentItem.querySelector('.submenu');

        if (submenu) {
          // Đóng hết submenu khác
          menuMobileList.querySelectorAll('.submenu.active').forEach(sub => {
            if (sub !== submenu) sub.classList.remove('active');
          });

          // Toggle submenu hiện tại
          submenu.classList.toggle('active');
        }
      });
    });
  }
});