// script.js
(() => {
  const promptArea = document.getElementById("promptArea");
  const copyBtn = document.getElementById("copyBtn");
  const toastEl = document.getElementById("toast");
  const tabs = Array.from(document.querySelectorAll(".tab"));

  // chooser elements
  const chooser = document.getElementById("chooser");
  const chooserTitle = document.getElementById("chooserTitle");
  const chooserOptions = document.getElementById("chooserOptions");
  const customInput = document.getElementById("customInput");
  const cancelBtn = document.getElementById("cancelBtn");
  const applyBtn = document.getElementById("applyBtn");

  // Templates: prompt lines with embedded chips
  const CONFIG = {
    character: {
      title: "Персонаж",
      chips: {
        hero: ["котик", "щенок", "зайчик", "медвежонок", "единорог", "робот"],
        style: ["мультяшный", "акварель", "пластилин", "детская книга", "стикер", "3D-игрушка"],
        mood: ["весёлое", "доброе", "смелое", "удивлённое", "сонное", "волшебное"],
        colors: ["яркие", "пастельные", "тёплые", "холодные", "радужные", "чёрно-белые"],
        extra: ["в шляпе", "с рюкзаком", "с шариком", "в очках", "с короной", "с крыльями"],
        bg: ["прозрачный", "без фона", "небо", "лес", "комната", "город"]
      },
      lines: [
        `Нарисуй {hero} как главного героя.`,
        `Стиль: {style}. Настроение: {mood}.`,
        `Цвета: {colors}.`,
        `Дополнительно: {extra}.`,
        `Фон вокруг героя: {bg}.`,
        `Картинка для детской книжки: простые формы, чёткие линии, без текста, высокое качество.`
      ]
    },
    background: {
      title: "Фон",
      chips: {
        place: ["лес", "город", "замок", "пляж", "космос", "школа"],
        time: ["утро", "день", "вечер", "ночь", "закат", "рассвет"],
        style: ["мультяшный", "акварель", "детская книга", "пастельный", "аппликация", "3D-мир"],
        mood: ["волшебное", "спокойное", "праздничное", "таинственное", "радостное", "уютное"],
        details: ["радуга", "звёзды", "фонарики", "снежинки", "цветы", "облака"],
        camera: ["широкий кадр", "панорама", "вид сверху", "на уровне глаз", "далеко", "середина сцены"]
      },
      lines: [
        `Нарисуй фон для детской книжки: {place}.`,
        `Время: {time}. Настроение: {mood}.`,
        `Стиль: {style}.`,
        `Добавь детали: {details}.`,
        `Камера: {camera}.`,
        `Фон без персонажей, чисто и красиво, мягкий свет, без текста, высокое качество.`
      ]
    }
  };

  // current state (selected values)
  let currentTemplate = "character";
  const state = {
    character: {
      hero: "котик",
      style: "мультяшный",
      mood: "весёлое",
      colors: "яркие",
      extra: "в шляпе",
      bg: "прозрачный",
    },
    background: {
      place: "лес",
      time: "день",
      style: "детская книга",
      mood: "уютное",
      details: "звёзды",
      camera: "широкий кадр",
    }
  };

  // chooser runtime
  let activeChipEl = null;
  let activeKey = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function chipHTML(key) {
    const value = state[currentTemplate][key] || "";
    const display = value.trim() ? value : "нажми";
    const isEmpty = !value.trim();
    return `<span class="chip ${isEmpty ? "empty" : ""}" data-key="${escapeHtml(key)}">
      <span class="val">${escapeHtml(display)}</span>
      <span class="caret">▾</span>
    </span>`;
  }

  function renderPrompt() {
    const tpl = CONFIG[currentTemplate];
    const htmlLines = tpl.lines.map((line) => {
      // Replace {key} with chip
      const withChips = line.replace(/\{([a-z_]+)\}/g, (_, key) => chipHTML(key));
      return `<p class="line">${withChips}</p>`;
    }).join("");

    promptArea.innerHTML = htmlLines;

    // attach handlers to chips
    promptArea.querySelectorAll(".chip").forEach((el) => {
      el.addEventListener("click", () => openChooser(el));
    });
  }

  function setTemplate(name) {
    currentTemplate = name;

    tabs.forEach((b) => {
      const active = b.dataset.template === name;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    renderPrompt();
  }

  function openChooser(chipEl) {
    activeChipEl = chipEl;
    activeKey = chipEl.dataset.key;

    const tpl = CONFIG[currentTemplate];
    const options = (tpl.chips[activeKey] || []).slice();

    const current = (state[currentTemplate][activeKey] || "").trim();

    chooserTitle.textContent = "Выбери вариант";
    chooserOptions.innerHTML = "";
    customInput.value = "";

    // create option buttons
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "optBtn" + (opt === current ? " selected" : "");
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        chooserOptions.querySelectorAll(".optBtn").forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
        customInput.value = "";
      });
      chooserOptions.appendChild(btn);
    });

    chooser.classList.add("open");
    chooser.setAttribute("aria-hidden", "false");

    // focus for quick typing
    setTimeout(() => customInput.focus(), 0);
  }

  function closeChooser() {
    chooser.classList.remove("open");
    chooser.setAttribute("aria-hidden", "true");
    activeChipEl = null;
    activeKey = null;
  }

  function applyChooser() {
    if (!activeKey) return;

    const typed = (customInput.value || "").trim();
    if (typed) {
      state[currentTemplate][activeKey] = typed;
      renderPrompt();
      closeChooser();
      return;
    }

    const selectedBtn = chooserOptions.querySelector(".optBtn.selected");
    if (selectedBtn) {
      state[currentTemplate][activeKey] = selectedBtn.textContent.trim();
      renderPrompt();
      closeChooser();
      return;
    }

    // nothing selected and nothing typed -> just close
    closeChooser();
  }

  function getPlainPromptText() {
    const tpl = CONFIG[currentTemplate];
    const values = state[currentTemplate];

    return tpl.lines.map((line) =>
      line.replace(/\{([a-z_]+)\}/g, (_, key) => values[key] ? values[key] : "...")
    ).join("\n");
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }

  // events
  tabs.forEach((btn) => btn.addEventListener("click", () => setTemplate(btn.dataset.template)));

  copyBtn.addEventListener("click", async () => {
    try {
      await copyToClipboard(getPlainPromptText());
      showToast("✅ Промпт скопирован!");
    } catch {
      showToast("⚠️ Не получилось скопировать");
    }
  });

  cancelBtn.addEventListener("click", closeChooser);
  applyBtn.addEventListener("click", applyChooser);

  chooser.addEventListener("click", (e) => {
    if (e.target === chooser) closeChooser();
  });

  window.addEventListener("keydown", (e) => {
    if (!chooser.classList.contains("open")) return;
    if (e.key === "Escape") closeChooser();
    if (e.key === "Enter") applyChooser();
  });

  // init
  setTemplate("character");
})();
