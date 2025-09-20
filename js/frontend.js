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
