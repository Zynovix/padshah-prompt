(() => {
  document.querySelectorAll('[data-content-share]').forEach((box) => {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    const url = canonical || `${location.origin}${location.pathname}`;
    const title = document.querySelector('h1')?.textContent.trim() || document.title;
    const message = `${title} | پادشاه پرامپت`;
    const status = box.querySelector('[data-share-status]');
    const nativeButton = box.querySelector('[data-native-share]');
    const telegram = box.querySelector('[data-share-telegram]');
    const whatsapp = box.querySelector('[data-share-whatsapp]');

    if (telegram) telegram.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
    if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`;

    if (nativeButton && navigator.share) {
      nativeButton.hidden = false;
      nativeButton.addEventListener('click', async () => {
        try {
          await navigator.share({ title, text: message, url });
          status.textContent = 'صفحه برای اشتراک‌گذاری آماده شد.';
        } catch (error) {
          if (error.name !== 'AbortError') status.textContent = 'اشتراک‌گذاری انجام نشد؛ از گزینه‌های دیگر استفاده کنید.';
        }
      });
    }

    box.querySelector('[data-copy-link]')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const input = document.createElement('textarea');
        input.value = url;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      const original = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> لینک کپی شد';
      status.textContent = 'لینک این صفحه در حافظه کپی شد.';
      setTimeout(() => { button.innerHTML = original; }, 2200);
    });
  });
})();
