/**
 * 重建 palette 切換功能
 * - 建立單一可訪問的切換按鈕（若頁面已有多個 palette 按鈕，隱藏/移除多餘）
 * - 支援 localStorage 儲存使用者偏好、回應系統色彩偏好
 * - 監聽 body[data-md-color-scheme] 變化，更新按鈕狀態
 *
 * 支援的 scheme 名稱：'light' (或 'default') 跟 'slate' (dark)
 */

document.addEventListener('DOMContentLoaded', function () {
  // 初始化：建立或重新綁定按鈕
  initPaletteToggle();
});

/**
 * 初始化並建立單一 palette toggle
 */
function initPaletteToggle() {
  // Ensure body has the same data-md-color-scheme as documentElement (inline script sets html early)
  try {
    var htmlScheme = document.documentElement.getAttribute('data-md-color-scheme');
    if (htmlScheme && !document.body.getAttribute('data-md-color-scheme')) {
      // map 'default' to stored 'light' semantic via normalize if needed
      document.body.setAttribute('data-md-color-scheme', htmlScheme);
    }
  } catch (e) {
    // ignore
  }
  // 隱藏或移除現有的 Material 預設 palette 元件，避免重複
  const existing = Array.from(document.querySelectorAll('[data-md-component="palette"]'));
  existing.forEach((el, idx) => {
    // 隱藏多數項目，保留第一個作為 fallback
    if (idx === 0) {
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    } else {
      el.remove();
    }
  });

  // 若頁面已經有我們的 custom 按鈕，先移除以避免重複綁定
  const existingCustom = document.getElementById('custom-palette-toggle');
  if (existingCustom) existingCustom.remove();

  // 建立按鈕並插入到頁面（放在 body 最上方，靠右）
  const btn = createPaletteButton();
  // 優先將按鈕插入到語言切換器旁邊（若存在），以整合到 header
  const preferredSelectors = [
    '.md-header .md-select',
    '.md-header .md-select__link',
    '.md-header__inner .md-select',
    '.md-header__inner',
    '#custom-palette-container',
  ];

  let inserted = false;
  for (const sel of preferredSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      // 若選到的是整個 .md-select（語言選單），把按鈕放在它之後
      if (el.classList && el.classList.contains('md-select')) {
        el.parentNode.insertBefore(btn, el.nextSibling);
      } else {
        // 否則作為最後一個 child 插入
        el.appendChild(btn);
      }
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    // 回退到 body（固定定位）
    document.body.appendChild(btn);
  }

  // 將初始狀態同步到 DOM
  syncButtonWithScheme(btn);

  // 監聽 body 屬性變化以同步按鈕狀態（例如來自其他腳本或主題自身變化）
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'data-md-color-scheme' || m.attributeName === 'data-md_color_scheme') {
        syncButtonWithScheme(btn);
      }
    });
  });

  observer.observe(document.body, { attributes: true });
}

function createPaletteButton() {
  const button = document.createElement('button');
  button.id = 'custom-palette-toggle';
  button.type = 'button';
  button.className = 'custom-palette-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', '切換淺色/深色模式');

  const icon = document.createElement('span');
  icon.className = 'custom-palette-toggle__icon';
  icon.setAttribute('aria-hidden', 'true');
  button.appendChild(icon);

  // click / keyboard
  button.addEventListener('click', () => toggleScheme());
  button.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleScheme();
    }
  });

  return button;
}

function getStoredPreference() {
  try {
    return localStorage.getItem('site-color-scheme');
  } catch (e) {
    return null;
  }
}

function storePreference(scheme) {
  try {
    localStorage.setItem('site-color-scheme', scheme);
  } catch (e) {
    // ignore
  }
}

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getCurrentScheme() {
  // 優先：body[data-md-color-scheme] -> stored preference -> system -> default 'light'
  const bodyScheme = document.body.getAttribute('data-md-color-scheme') || document.body.getAttribute('data-md_color_scheme');
  if (bodyScheme) return normalizeScheme(bodyScheme);

  const stored = getStoredPreference();
  if (stored) return normalizeScheme(stored);

  return systemPrefersDark() ? 'slate' : 'light';
}

function normalizeScheme(v) {
  if (!v) return 'light';
  v = String(v).toLowerCase();
  if (v === 'dark' || v === 'slate') return 'slate';
  return 'light';
}

function applyScheme(scheme) {
  const normalized = normalizeScheme(scheme);
  // 使用 data-md-color-scheme（Material for MkDocs 的慣例）
  // 實際上主題在淺色模式會使用 'default'，保持與現有 CSS 一致性
  const attrVal = normalized === 'light' ? 'default' : 'slate';
  try {
    document.documentElement.setAttribute('data-md-color-scheme', attrVal);
  } catch (e) {}
  try {
    document.body.setAttribute('data-md-color-scheme', attrVal);
  } catch (e) {}
  storePreference(normalized);
}

function toggleScheme() {
  const current = getCurrentScheme();
  const next = current === 'slate' ? 'light' : 'slate';
  applyScheme(next);
  // 立刻同步按鈕（MutationObserver 也會處理）
  const btn = document.getElementById('custom-palette-toggle');
  if (btn) syncButtonWithScheme(btn);
}

function syncButtonWithScheme(btn) {
  const current = getCurrentScheme();
  const pressed = current === 'slate';
  btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  // 更新 icon 顯示（用 class 來切換圖示樣式）
  const icon = btn.querySelector('.custom-palette-toggle__icon');
  if (icon) {
    icon.className = 'custom-palette-toggle__icon ' + (pressed ? 'is-dark' : 'is-light');
  }
}

