(() => {
  const controlsEl = document.getElementById("controls");
  const promptLinesEl = document.getElementById("promptLines");
  const copyBtn = document.getElementById("copyBtn");
  const toastEl = document.getElementById("toast");
  const tabButtons = Array.from(document.querySelectorAll(".tab"));

  const CUSTOM_VALUE = "__custom__";
  const customLabel = "✍️ Свой вариант…";

  const TEMPLATES = {
    character: {
      fields: [
        { key: "character", label: "Кто герой?", type: "select", options: ["котик","щенок","зайчик","медвежонок","единорог","робот"] },
        { key: "style", label: "Стиль", type: "select", options: ["мультяшный","акварель","пластилин","детская книга","наклейка (стикер)","3D-игрушка"] },
        { key: "mood", label: "Настроение", type: "select", options: ["весёлое","доброе","смелое","удивлённое","сонное","волшебное"] },
        { key: "colors", label: "Цвета", type: "select", options: ["яркие","пастельные","тёплые","холодные","радужные","чёрно-белые"] },
        { key: "extra", label: "Доп. детали", type: "input", placeholder: "например: в шляпе, с рюкзаком, с шариком..." },
        { key: "bg", label: "Фон вокруг героя", type: "select", options: ["прозрачный фон","без фона","на простом фоне","на фоне неба","на фоне леса","в комнате"] },
      ],
      lines: [
        (v) => `Нарисуй ${blank(v.character)} как главный персонаж.`,
        (v) => `Стиль: ${blank(v.style)}. Настроение: ${blank(v.mood)}.`,
        (v) => `Цвета: ${blank(v.colors)}.`,
        (v) => `Дополнительные детали: ${blank(v.extra)}.`,
        (v) => `Фон: ${blank(v.bg)}.`,
        () => `Картинка для детской книжки, простые формы, чёткие линии, без текста, высокое качество.`
      ]
    },

    background: {
      fields: [
        { key: "place", label: "Где это происходит?", type: "select", options: ["в лесу","в городе","в замке","на пляже","в космосе","в школе"] },
        { key: "time", label: "Время", type: "select", options: ["утро","день","вечер","ночь","закат","рассвет"] },
        { key: "style", label: "Стиль", type: "select", options: ["мультяшный","акварель","детская книга","пастельный","бумажная аппликация","3D-мир"] },
        { key: "mood", label: "Настроение", type: "select", options: ["волшебное","спокойное","праздничное","таинственное","очень радостное","уютное"] },
        { key: "details", label: "Что добавить?", type: "input", placeholder: "например: радуга, звёзды, фонарики..." },
        { key: "camera", label: "Какой вид?", type: "select", options: ["широкий кадр","панорама","вид сверху","вид на уровне глаз","далеко-далеко","середина сцены"] },
      ],
      lines: [
        (v) => `Нарисуй фон для детской книжки: ${blank(v.place)}.`,
        (v) => `Время: ${blank(v.time)}. Настроение: ${blank(v.mood)}.`,
        (v) => `Стиль: ${blank(v.style)}.`,
        (v) => `Добавь детали: ${blank(v.details)}.`,
        (v) => `Камера: ${blank(v.camera)}.`,
        () => `Фон без персонажей, чистая композиция, мягкий свет, без текста, высокое качество.`
      ]
    }
  };

  // state with "select value" + "custom text" for each select field
  const state = {
    template: "character",
    values: {
      character: {
        character: { sel: "котик", custom: "" },
        style: { sel: "мультяшный", custom: "" },
        mood: { sel: "весёлое", custom: "" },
        colors: { sel: "яркие", custom: "" },
        extra: "",
        bg: { sel: "прозрачный фон", custom: "" },
      },
      background: {
        place: { sel: "в лесу", custom: "" },
        time: { sel: "день", custom: "" },
        style: { sel: "детская книга", custom: "" },
        mood: { sel: "уютное", custom: "" },
        details: "",
        camera: { sel: "широкий кадр", custom: "" },
      }
    }
  };

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getValue(key) {
    const vals = state.values[state.template];
    const v = vals[key];
    if (typeof v === "string") return v;
    if (!v) return "";
    if (v.sel === CUSTOM_VALUE) return (v.custom || "").trim();
    return v.sel;
  }

  function safe(value) {
    const v = (value || "").trim();
    return v ? v : "...";
  }

  function blank(value) {
    const v = (value || "").trim();
    return v
      ? `<span class="blank">${escapeHtml(v)}</span>`
      : `<span class="blank">...</span>`;
  }

  function buildControls() {
    const tpl = TEMPLATES[state.template];
    const vals = state.values[state.template];

    controlsEl.innerHTML = "";

    tpl.fields.forEach((f) => {
      const wrap = document.createElement("div");
      wrap.className = "field";

      const label = document.createElement("label");
      label.textContent = f.label;
      wrap.appendChild(label);

      if (f.type === "select") {
        // select
        const select = document.createElement("select");

        // options
        f.options.forEach((opt) => {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          select.appendChild(o);
        });

        // custom option
        const customOpt = document.createElement("option");
        customOpt.value = CUSTOM_VALUE;
        customOpt.textContent = customLabel;
        select.appendChild(customOpt);

        // init state for this key if missing
        if (!vals[f.key]) vals[f.key] = { sel: f.options[0], custom: "" };

        select.value = vals[f.key].sel ?? f.options[0];

        // custom input (hidden unless selected)
        const customInput = document.createElement("input");
        customInput.type = "text";
        customInput.placeholder = "Напиши свой вариант…";
        customInput.value = vals[f.key].custom ?? "";
        customInput.style.marginTop = "8px";
        customInput.style.display = (select.value === CUSTOM_VALUE) ? "block" : "none";

        select.addEventListener("change", () => {
          vals[f.key].sel = select.value;
          // show/hide input
          customInput.style.display = (select.value === CUSTOM_VALUE) ? "block" : "none";
          renderPrompt();
        });

        customInput.addEventListener("input", () => {
          vals[f.key].custom = customInput.value;
          renderPrompt();
        });

        wrap.appendChild(select);
        wrap.appendChild(customInput);
      } else {
        // plain input
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = f.placeholder || "";
        input.value = vals[f.key] ?? "";

        input.addEventListener("input", () => {
          vals[f.key] = input.value;
          renderPrompt();
        });

        wrap.appendChild(input);
      }

      controlsEl.appendChild(wrap);
    });
  }

  function renderPrompt() {
    const tpl = TEMPLATES[state.template];

    const view = new Proxy({}, {
      get: (_, key) => getValue(String(key))
    });

    promptLinesEl.innerHTML = "";
    tpl.lines.forEach((fn) => {
      const li = document.createElement("li");
      li.innerHTML = fn(view);
      promptLinesEl.appendChild(li);
    });
  }

  function buildFinalPromptText() {
    const v = (k) => safe(getValue(k));

    if (state.template === "character") {
      const extra = safe(state.values.character.extra);
      return [
        `Нарисуй ${v("character")} как главный персонаж.`,
        `Стиль: ${v("style")}. Настроение: ${v("mood")}.`,
        `Цвета: ${v("colors")}.`,
        `Дополнительные детали: ${extra}.`,
        `Фон: ${v("bg")}.`,
        `Картинка для детской книжки, простые формы, чёткие линии, без текста, высокое качество.`
      ].join("\n");
    }

    const details = safe(state.values.background.details);
    return [
      `Нарисуй фон для детской книжки: ${v("place")}.`,
      `Время: ${v("time")}. Настроение: ${v("mood")}.`,
      `Стиль: ${v("style")}.`,
      `Добавь детали: ${details}.`,
      `Камера: ${v("camera")}.`,
      `Фон без персонажей, чистая композиция, мягкий свет, без текста, высокое качество.`
    ].join("\n");
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

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  function setTemplate(next) {
    state.template = next;

    tabButtons.forEach((b) => {
      const isActive = b.dataset.template === next;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    buildControls();
    renderPrompt();
  }

  tabButtons.forEach((btn) => btn.addEventListener("click", () => setTemplate(btn.dataset.template)));

  copyBtn.addEventListener("click", async () => {
    const text = buildFinalPromptText();
    try {
      await copyToClipboard(text);
      showToast("✅ Промпт скопирован!");
    } catch {
      showToast("⚠️ Не получилось скопировать");
    }
  });

  setTemplate("character");
})();
