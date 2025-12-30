(function () {
  const dialog = document.getElementById("lightbox");
  if (!dialog) return;

  const img = dialog.querySelector(".lb-image");
  const caption = dialog.querySelector("[data-lb-caption]");

  const thumbs = Array.from(document.querySelectorAll(".lb-thumb"));
  if (!thumbs.length) return;

  let current = 0;

  function show(i) {
    current = (i + thumbs.length) % thumbs.length;
    const t = thumbs[current];
    const src = t.getAttribute("data-lightbox-src");
    const alt = t.getAttribute("data-lightbox-alt") || "";

    img.src = src;
    img.alt = alt;
    caption.textContent = alt;
  }

  function openAt(i) {
    show(i);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "open");
  }

  function close() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  thumbs.forEach((t, i) => {
    t.addEventListener("click", () => openAt(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAt(i);
      }
    });
  });

  dialog.querySelector("[data-lb-close]")?.addEventListener("click", close);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close(); // backdrop click
  });

  dialog.querySelector("[data-lb-prev]")?.addEventListener("click", () => show(current - 1));
  dialog.querySelector("[data-lb-next]")?.addEventListener("click", () => show(current + 1));

  window.addEventListener("keydown", (e) => {
    if (!dialog.hasAttribute("open")) return;

    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();