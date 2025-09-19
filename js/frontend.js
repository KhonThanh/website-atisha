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

// js enviroment

$(document).ready(function () {
  if ($('.environment').length) {
    $('.environment').slick({
      slidesToShow: 4,
      slidesToScroll: 2,
      dots: false,
      arrows: false,
      infinite: true,
      autoplay: true,
      centerMode: true,
      centerPadding: '0',
      autoplaySpeed: 3000,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2
          }
        }
      ]
    });
  }
});

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
if (!$('.homepageslide').length) {
  console.warn('⚠️ .homepageslide not found');
} else if (!$('.dot-slide').length) {
  console.warn('⚠️ .dot-slide not found');
} else {
  $('.homepageslide').slick({
    infinite: true, // lưu ý "Infinite" => "infinite"
    dots: true,
    appendDots: $('.dot-slide'),
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  });
  console.log('✅ Slick initialized successfully!');
}

// js type rice

$(document).ready(function () {
  if ($('.rice-slider').length) {
    $('.rice-slider').slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      autoplay: false,
      prevArrow: $('.rice-prev'),
      nextArrow: $('.rice-next'),
      responsive: [
        {
          breakpoint: 551,
          settings: {
            slidesToShow: 4
          }
        }
      ]
    });

    $('.rice-slider').on('click', 'a.rice-item', function (e) {
      e.preventDefault();
      $('.rice-item').removeClass('active');
      $(this).addClass('active');
    });

  } else {
    console.warn("Không tìm thấy .rice-slider");
  }
});


// js connect
// $(document).ready(function () {
//   $('.connection-content__item').on('click', function (e) {
//     e.preventDefault();
//     $('.connection-content__item').removeClass('active');
//     $(this).addClass('active');
//   });
// });

//js story
document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = Array.from(document.querySelectorAll('.story-tab'));
  const tabContents = Array.from(document.querySelectorAll('.tab-content'));
  const sliderSelector = '.story-tab_container';
  const $slider = $(sliderSelector);

  if (!tabButtons.length || !tabContents.length) return;

  function setActiveByIndex(idx) {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('show'));
    if (tabButtons[idx]) tabButtons[idx].classList.add('active');
    if (tabContents[idx]) tabContents[idx].classList.add('show');
  }

  setActiveByIndex(0);

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', function () {
      if (this.classList.contains('active')) return;

      // nếu slider mobile đang active -> điều hướng slick (afterChange sẽ sync active)
      if (window.innerWidth <= 551 && $slider.hasClass('slick-initialized')) {
        $slider.slick('slickGoTo', index);
      } else {
        // desktop: set trực tiếp
        setActiveByIndex(index);
      }
    });
  });

  // Khởi tạo / destroy slick tuỳ kích thước
  function initStoryTabsSlider() {
    if (window.innerWidth <= 551) {
      if (!$slider.hasClass('slick-initialized')) {
        $slider.on('init.storyTabs', function (event, slick) {
          const $center = $slider.find('.slick-slide.slick-center').first();
          const dataIdx = $center.attr('data-slick-index');
          const idx = dataIdx !== undefined ? parseInt(dataIdx, 10) : 0;
          const total = tabButtons.length;
          const normalized = ((idx % total) + total) % total;
          setActiveByIndex(normalized);
        });

        $slider.on('afterChange.storyTabs', function (event, slick, currentSlide) {
          const $center = $slider.find('.slick-slide.slick-center').first();
          const dataIdx = $center.attr('data-slick-index');
          const idx = dataIdx !== undefined ? parseInt(dataIdx, 10) : currentSlide;
          const total = tabButtons.length;
          const normalized = ((idx % total) + total) % total;
          setActiveByIndex(normalized);
        });

        $slider.slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          infinite: true,
          centerMode: true,
          centerPadding: '0px',
          prevArrow: '<button class="slick-prev custom-arrow" aria-label="Previous"><</button>',
          nextArrow: '<button class="slick-next custom-arrow" aria-label="Next">></button>',
        });
      }
    } else {
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
        $slider.off('.storyTabs');
        setActiveByIndex(0);
      }
    }
  }

  // chạy lần đầu và khi resize (debounce)
  initStoryTabsSlider();
  let _t;
  window.addEventListener('resize', function () {
    clearTimeout(_t);
    _t = setTimeout(initStoryTabsSlider, 120);
  });
});

// js slide product
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const items = document.querySelectorAll(".all-product__item");
    if (items.length > 0) {
      initProductSlider();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Hàm scale
function initProductSlider() {
  const items = document.querySelectorAll(".all-product__item");
  if (items.length === 0) return;

  const total = items.length;
  const isEven = total % 2 === 0;
  const centerIndex = isEven ? total / 2 - 0.5 : Math.floor(total / 2);

  items.forEach((item, index) => {
    let distance = Math.abs(index - centerIndex);
    let scale;

    if (isEven) {
      if (index === centerIndex || index === centerIndex + 1) {
        scale = 1;
        item.classList.add("center");
      } else {
        scale = 1 - 0.1 * distance;
      }
    } else {
      if (index === centerIndex) {
        scale = 1;
        item.classList.add("center");
      } else {
        scale = 1 - 0.1 * distance;
      }
    }

    if (scale < 0.5) scale = 0.5;
    item.style.transform = `scale(${scale})`;
    item.style.zIndex = Math.floor(100 - distance);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section, footer");
  if (!sections.length) return;

  sections.forEach(sec => {
    // Đảm bảo ẩn tất cả section và footer, dù nằm trong div nào
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
    threshold: 0.08,              // chỉ cần xuất hiện 10% là hiện
    rootMargin: "0px 0px -10% 0px"
  });

  sections.forEach(sec => observer.observe(sec));
});

// js trang liên hệ
document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.contact-item');

  if (items[0]) items[0].classList.add('border-bottom');
  if (items[1]) items[1].classList.add('border-bottom', 'bottom-icon-SP');

  for (let i = 2; i < items.length; i += 3) {
    if (i + 3 < items.length) {
      for (let j = i; j < i + 3 && j < items.length; j++) {
        items[j].classList.add('border-bottom');
      }
    }
  }
  for (let i = 3; i < items.length; i += 3) {
    items[i].classList.add('border-icon', 'border-left-right');
  }
});

//js product
document.addEventListener("DOMContentLoaded", function () {
  let $slider = $('.all-type__content');

  function initSlick() {
    if (window.innerWidth <= 1024) {
      if (!$slider.hasClass('slick-initialized')) {
        $slider.slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          centerMode: true,
          arrows: true,
          dots: false,
          prevArrow: '<button class="slick-prev custom-arrow" aria-label="Previous"><</button>',
          nextArrow: '<button class="slick-next custom-arrow" aria-label="Next">></button>',
          responsive: [
            {
              breakpoint: 586,
              settings: {
                slidesToShow: 1
              }
            }
          ]
        });
      }
    } else {
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }
    }
  }

  initSlick();
  window.addEventListener('resize', initSlick);
});


document.addEventListener("click", function (e) {
  // Xử lý cho .community-list ul li
  if (e.target.closest(".community-list ul li")) {
    const clickedItem = e.target.closest("li");
    const parent = clickedItem.closest("ul");
    parent.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    clickedItem.classList.add("active");
  }
});


$("[data-include]").load("file.html", function () {
  const $slider = $(".all-product__image--mobile");

  if ($slider.length && !$slider.hasClass("slick-initialized")) {
    $slider.slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      responsive: [
        {
          breakpoint: 551,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });
  }
});


// list sản phẩm mobile
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".all-product__image-mobile");

  if (slider && typeof jQuery !== "undefined" && typeof jQuery(slider).slick === "function") {
    jQuery(slider).slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      arrows: false,
      Infinity: true,
      autoplay: 400,
      centerMode: true,
      dots: false,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3
          }
        }
      ]
    });
  }
});

// js menu mobile
document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById("btn-menu");
  const menuContent = document.querySelector(".menu-mobile__content");
  const menuBackground = document.querySelector(".background-mobile");
  const btnClose = document.querySelector(".btn-close button");

  if (btnMenu && menuContent && menuBackground && btnClose) {
    // Mở menu
    btnMenu.addEventListener("click", () => {
      menuContent.classList.add("active");
      menuBackground.classList.add("active");
    });

    // Đóng menu khi click nền đen
    menuBackground.addEventListener("click", () => {
      menuContent.classList.remove("active");
      menuBackground.classList.remove("active");
    });

    // Đóng menu khi click nút close
    btnClose.addEventListener("click", () => {
      menuContent.classList.remove("active");
      menuBackground.classList.remove("active");
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

// js nội dung bài viết
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.querySelector('.btn-readmore');
  const excerpt = document.querySelector('.post-excerpt');
  const btnIcon = btn ? btn.querySelector('img') : null;

  if (!btn || !excerpt || !btnIcon) return;

  btn.addEventListener('click', function () {
    const isExpanded = excerpt.classList.toggle('expanded');

    btn.textContent = isExpanded ? 'THU GỌN' : 'XEM THÊM';

    // 🛠 Giữ lại icon khi đổi text
    btn.appendChild(btnIcon);

    // 🔄 Đổi icon
    btnIcon.src = isExpanded
      ? './img/icon/down-rev.png'
      : './img/icon/down.png';
  });
});

// js nôi dung bài viét
document.addEventListener('DOMContentLoaded', function () {
  const postContent = document.querySelector('.post-content');
  const tocList = document.querySelector('.toc-list');

  if (!postContent || !tocList) return;

  const headings = postContent.querySelectorAll('h2, h3, h4, h5, h6');
  if (headings.length === 0) return;

  tocList.innerHTML = '';

  headings.forEach((heading) => {
    const text = heading.textContent.trim();
    const id = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^[0-9]+\.\s*/, "")
      .toLowerCase();

    heading.id = id;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = text;

    li.appendChild(a);
    tocList.appendChild(li);
  });

  tocList.addEventListener('click', function (e) {
    const clickedLi = e.target.closest('li');
    if (!clickedLi) return;

    const lis = tocList.querySelectorAll('li');
    lis.forEach(li => li.classList.remove('active'));
    clickedLi.classList.add('active');
  });
});

// js nạp alt cho hình trong bài viết
const postContent = document.querySelector('.post-content');

if (postContent) {
  postContent.querySelectorAll('img').forEach(img => {
    if (img.alt.trim() !== '') {   // chỉ tạo caption nếu có alt
      const caption = document.createElement('span');
      caption.textContent = img.alt;
      caption.className = 'img-caption';
      img.insertAdjacentElement('afterend', caption);
    }
  });
}

// js đổi hình icon social 
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('.footer-ecom a img, .footer-social a img')) {
    const img = e.target;
    if (!img.dataset.original) {
      img.dataset.original = img.src; // Lưu src gốc
    }
    img.src = img.src.replace('.png', '-hover.png');
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.matches('.footer-ecom a img, .footer-social a img')) {
    const img = e.target;
    if (img.dataset.original) {
      img.src = img.dataset.original;
    }
  }
});

// js trong tab nội dung
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".product-menu p");

  if (menuItems.length) {
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        menuItems.forEach(el => el.classList.remove("active"));
        item.classList.add("active");
      });
    });
  }
});

//js sản phẩm 
document.addEventListener("DOMContentLoaded", function () {
  if (window.innerWidth < 1300) {
    const menuLinks = document.querySelectorAll(".product-menu p");
    const productMenu = document.querySelector(".product-menu__content");

    if (menuLinks.length && productMenu) {
      menuLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();

          const isActive = link.classList.contains("active");

          // Xóa active cũ
          menuLinks.forEach(p => p.classList.remove("active"));
          productMenu.classList.remove("active");

          // Nếu chưa active thì thêm
          if (!isActive) {
            link.classList.add("active");
            productMenu.classList.add("active");
          }
        });
      });

      // Click ra ngoài -> remove active
      document.addEventListener("click", function (e) {
        const clickedInsideMenu = e.target.closest(".product-menu") || e.target.closest(".product-menu__content");

        if (!clickedInsideMenu) {
          menuLinks.forEach(p => p.classList.remove("active"));
          productMenu.classList.remove("active");
        }
      });
    }
  }
});

//js scroll to top

document.addEventListener("DOMContentLoaded", function () {
  const scrollBtn = document.getElementById("scrollToTop");

  if (scrollBtn) { // ✅ Chỉ chạy khi tồn tại nút
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        scrollBtn.classList.add("show");
      } else {
        scrollBtn.classList.remove("show");
      }
    });

    scrollBtn.addEventListener("click", function () {
      const currentScroll = window.scrollY;

      if (currentScroll > 50) {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        // Force về 0 sau animation (an toàn)
        setTimeout(() => {
          if (window.scrollY !== 0) window.scrollTo(0, 0);
        }, 600);
      }
    });
  }
});

// js menu
document.addEventListener('DOMContentLoaded', function () {
  const headerBottom = document.querySelector('.header-bottom');

  if (headerBottom) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop >= 100) {
        headerBottom.classList.add('header-bottom__stick');
      } else {
        headerBottom.classList.remove('header-bottom__stick');
      }
    });
  }
});


// js khi bám ảnh sản phẩm
document.addEventListener('DOMContentLoaded', function () {
  const mainImage = document.querySelector('.detail-product__image img');
  const thumbnails = document.querySelectorAll('.thumbnail-images img');

  function checkElement(element, name) {
    if (!element || (element.length !== undefined && element.length === 0)) {
      console.error(`❌ Không tìm thấy phần tử: ${name}`);
      return false;
    }
    return true;
  }

  if (!checkElement(mainImage, 'Ảnh chính (.detail-product__image img)')) return;
  if (!checkElement(thumbnails, 'Ảnh thumbnail (.thumbnail-images img)')) return;

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function () {
      mainImage.src = this.src;
    });
  });
});

$(document).ready(function () {
  if ($('.all-certification').length) {
    $('.all-certification').on('init', function (event, slick) {
      $(slick.$slideTrack).addClass('all-certification-margin');
    });

    $('.all-certification').slick({
      centerMode: true,
      centerPadding: '6px',
      slidesToShow: 5,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 1000,
      speed: 1500,
      focusOnSelect: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            centerPadding: '40px'
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            centerPadding: '200px'
          }
        },
        {
          breakpoint: 593,
          settings: {
            slidesToShow: 1,
            centerPadding: '180px'
          }
        },
        {
          breakpoint: 510,
          settings: {
            slidesToShow: 1,
            centerPadding: '100px'
          }
        }
      ]
    });

    // Popup logic
    const certificationPopup = document.querySelector('.certification-popup');
    const popupImage = certificationPopup.querySelector('img');

    // Event delegation for click on slick-center
    $('.all-certification').on('click', '.slick-center', function () {
      const imgSrc = $(this).find('img').attr('src'); // lấy src từ ảnh trong slide
      if (imgSrc) {
        popupImage.setAttribute('src', imgSrc);
      }
      certificationPopup.classList.add('active');
    });

    // Close popup when click outside image
    certificationPopup.addEventListener('click', function (e) {
      if (!popupImage.contains(e.target)) {
        certificationPopup.classList.remove('active');
      }
    });
  }
});

//js cho phần brand

$(document).ready(function () {
  var $wrap = $('.brand-content');
  if (!$wrap.length) return;
  var $items = $wrap.children('.brand-content__item');
  if (!$items.length) return;
  if (!$wrap.children('.brand-content__item').length) return;
  if ($wrap.hasClass('slick-initialized')) {
    $wrap.slick('unslick');
  }

  $('.brand-content').on('init', function (event, slick) {
    $(slick.$slideTrack).addClass('brand-content__margin');
  });

  $wrap.slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: true,
    // autoplay: true,
    // autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: '0px',
    dots: true,
    appendDots: $('.brand-slide__dot'),
    prevArrow: $('.brand-prev'),
    nextArrow: $('.brand-next'),
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 1165,
        settings: {
          slidesToShow: 1,
          centerPadding: '300px'
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerPadding: '200px'
        }
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 1,
          centerPadding: '100px'
        }
      },

      {
        breakpoint: 551,
        settings: {
          slidesToShow: 1,
          centerPadding: '20px'
        }
      },
    ]
  });
});

// js marketing
const btns = document.querySelectorAll('#asia, #africa, #northAmerica, #oceania');

btns.forEach(btn => {
  btn.addEventListener('click', function () {
    const list = this.querySelector('.nation-list');
    if (!list) return;

    const isOpen = list.classList.contains('open');

    // Đóng tất cả
    document.querySelectorAll('.nation-list').forEach(l => {
      l.style.height = '0px';
      l.classList.remove('open');
    });

    // Nếu đang mở thì đóng luôn
    if (isOpen) return;

    // Mở cái mới
    list.classList.add('open');
    list.style.height = list.scrollHeight + 'px';
  });
});

// js pagination
const paginationLinks = document.querySelectorAll('.pagination-content a');
if (paginationLinks.length) {
  paginationLinks[0].classList.add('active');
}

paginationLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    paginationLinks.forEach(l => l.classList.remove('active'));

    this.classList.add('active');
  });
});

// js filter
window.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".selected").forEach(selectedEl => {
    selectedEl.addEventListener("click", function () {
      const thisOptions = this.parentElement.querySelector(".options");

      // đóng tất cả .options khác
      document.querySelectorAll(".custom-select .options").forEach(opt => {
        if (opt !== thisOptions) {
          opt.classList.remove("active");
        }
      });

      // toggle cho chính nó
      thisOptions.classList.toggle("active");
    });
  });

  document.querySelectorAll(".custom-select .option-container div").forEach(optionEl => {
    optionEl.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      const customSelect = this.closest(".custom-select");
      const selectedText = customSelect.querySelector(".selected p");

      selectedText.textContent = value;
      customSelect.querySelector(".options").classList.remove("active");
    });
  });
});

// js land
window.addEventListener("DOMContentLoaded", function () {
  // Bấm vào .selected_land để mở/đóng .options_land
  document.querySelectorAll(".selected_land").forEach(selectedEl => {
    selectedEl.addEventListener("click", function () {
      const optionsEl = this.querySelector(".options_land");
      optionsEl.classList.toggle("active");
    });
  });
});

// js thông tin quan hệ cổ đông
document.addEventListener("click", function (e) {
  const activeTab = document.querySelector(".tab-content.show");
  if (!activeTab) return;
  const listTime = activeTab.querySelector(".list-time");
  if (!listTime) return;

  const items = Array.from(listTime.querySelectorAll("a"));
  const activeIndex = items.findIndex(a => a.classList.contains("active"));

  // Nút trái
  if (e.target.closest("#btnListTimeLeft")) {
    if (activeIndex > 0) {
      items.forEach(a => a.classList.remove("active"));
      items[activeIndex - 1].classList.add("active");
    }
  }

  // Nút phải
  if (e.target.closest("#btnListTimeRight")) {
    if (activeIndex < items.length - 1) {
      items.forEach(a => a.classList.remove("active"));
      items[activeIndex + 1].classList.add("active");
    }
  }
});

// js ngôn ngữ mobile
const selectedLand = document.querySelector('.selected_land-mb');

if (selectedLand) {
  selectedLand.addEventListener('click', function () {
    this.classList.toggle('active');
  });

  document.addEventListener('click', function (e) {
    if (!selectedLand.contains(e.target)) {
      selectedLand.classList.remove('active');
    }
  });
}

// js đoạn giới thiệu ở câu chuỵen
document.querySelectorAll(".intro-custom__content").forEach(section => {
  const btn = section.querySelector(".all-btn");
  const para = section.querySelector("p");

  btn.addEventListener("click", e => {
    e.preventDefault(); // tránh reload khi là <a href="#">
    para.classList.toggle("expanded");
    btn.querySelector("img").classList.toggle("rotated");

    btn.firstChild.textContent = para.classList.contains("expanded")
      ? "Thu gọn "
      : "Xem thêm ";
  });
});

// js option của cái phần quản trị công ty
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const container = e.target.closest(".select-community__container");
    const option = e.target.closest(".select-community__option div[data-value]");

    // Nếu click vào container
    if (container) {
      e.stopPropagation();
      const optionBox = container.parentElement.querySelector(".select-community__option");
      optionBox.classList.toggle("active"); // mở/đóng option
      return;
    }

    // Nếu click vào option
    if (option) {
      e.stopPropagation();
      const value = option.getAttribute("data-value");
      const parentContainer = option.closest(".community-list__new")?.querySelector(".select-community__container p");
      if (value && parentContainer) {
        parentContainer.textContent = value; // đổi text trong <p>
      }
      option.closest(".select-community__option").classList.remove("active"); // đóng dropdown
      return;
    }

    // Nếu click ra ngoài → đóng hết
    document.querySelectorAll(".select-community__option.active").forEach((box) => {
      box.classList.remove("active");
    });
  });
});