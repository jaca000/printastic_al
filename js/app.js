(() => {
  "use strict";

  const WA = (window.PRINTASTIC && window.PRINTASTIC.whatsappNumber) || "351000000000";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  function waLink(text) {
    const msg = encodeURIComponent(text);
    return `https://wa.me/${WA}?text=${msg}`;
  }

  // 🔥 FORÇA abertura fora da página (solução definitiva)
  function openWhatsApp(text) {
    const url = waLink(text);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function loadJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Falhou a carregar ${path}`);
    return res.json();
  }

  let sections = [];
  let products = [];

  const campaignGrid = $("#campaignGrid");
  const campaignFilter = $("#campaignFilter");
  const chipsWrap = $("#chips");
  const productGrid = $("#productGrid");
  const emptyState = $("#empty");
  const search = $("#search");
  const onlyActive = $("#onlyActive");

  const statSections = $("#statSections");
  const statProducts = $("#statProducts");

  function normalize(s) {
    return String(s || "").trim().toLowerCase();
  }

  function buildChips(activeId) {
    chipsWrap.innerHTML = "";

    const all = el("button", "chip");
    all.type = "button";
    all.textContent = "Todas";
    all.dataset.id = "";
    if (!activeId) all.classList.add("active");
    chipsWrap.appendChild(all);

    sections.filter(s => s.active).forEach(s => {
      const b = el("button", "chip");
      b.type = "button";
      b.textContent = s.title;
      b.dataset.id = s.id;
      if (activeId === s.id) b.classList.add("active");
      chipsWrap.appendChild(b);
    });
  }

  function fillFilter() {
    campaignFilter.innerHTML = "";

    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "Todas as campanhas";
    campaignFilter.appendChild(optAll);

    sections.filter(s => s.active).forEach(s => {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.title;
      campaignFilter.appendChild(o);
    });
  }

  function renderCampaigns() {
    campaignGrid.innerHTML = "";

    const active = sections
      .filter(s => s.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    active.forEach(s => {
      const card = el("div", "campaign");

      const img = document.createElement("img");
      img.alt = s.title;
      img.src = s.heroImage || "img/produtos/placeholder-produto.jpg";
      card.appendChild(img);

      const body = el("div", "campaign-body");

      const title = el("div", "campaign-title");
      title.textContent = s.title;

      const desc = el("div", "campaign-desc");
      desc.textContent = s.description || "";

      const actions = el("div", "campaign-actions");

      const btnIdeas = el("button", "btn primary");
      btnIdeas.type = "button";
      btnIdeas.textContent = "Ver ideias";
      btnIdeas.addEventListener("click", () => {
        campaignFilter.value = s.id;
        buildChips(s.id);
        renderProducts();
        document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" });
      });

      const btnWA = el("button", "btn");
      btnWA.type = "button";
      btnWA.textContent = "Pedir orçamento";
      btnWA.addEventListener("click", () => {
        openWhatsApp(`Olá! 👋 Vi a campanha "${s.title}" no vosso site e queria saber opções e valores.`);
      });

      actions.append(btnIdeas, btnWA);
      body.append(title, desc, actions);
      card.appendChild(body);

      campaignGrid.appendChild(card);
    });
  }

  function productMatches(p, campaignId, q) {
    const qn = normalize(q);
    const inCampaign =
      !campaignId ||
      (Array.isArray(p.sections) && p.sections.includes(campaignId));

    const matchesText =
      !qn ||
      normalize(p.name).includes(qn) ||
      normalize(p.description).includes(qn);

    return inCampaign && matchesText;
  }

  function renderProducts() {
    const campaignId = campaignFilter.value;
    const q = search.value || "";
    const only = !!onlyActive.checked;

    const activeSections = new Set(
      sections.filter(s => s.active).map(s => s.id)
    );

    const list = products
      .filter(p => {
        if (only && !p.active) return false;
        const secs = Array.isArray(p.sections) ? p.sections : [];
        return secs.some(id => activeSections.has(id));
      })
      .filter(p => productMatches(p, campaignId, q));

    productGrid.innerHTML = "";
    emptyState.hidden = list.length > 0;

    list.forEach(p => {
      const card = el("div", "card");

      const media = el("div", "card-media");
      const img = document.createElement("img");
      img.alt = p.name;
      img.loading = "lazy";
      img.src = p.image || "img/produtos/placeholder-produto.jpg";
      media.appendChild(img);

      const body = el("div", "card-body");

      const title = el("h3", "card-title");
      title.textContent = p.name;

      const desc = el("p", "card-desc");
      desc.textContent = p.description || "";

      const btn = el("button", "btn primary");
      btn.type = "button";
      btn.textContent = "Quero personalizar este";
      btn.addEventListener("click", () => {
        const msg =
          p.whatsappText ||
          `Olá! 👋 Vi no vosso site a ideia "${p.name}" e queria saber opções e valores.`;
        openWhatsApp(msg);
      });

      body.append(title, desc, btn);
      card.append(media, body);
      productGrid.appendChild(card);
    });
  }

  function hookGeneralButtons() {
    const btnGeral = $("#btnWhatsAppGeral");
    const btnCustom = $("#btnWhatsAppCustom");

    if (btnGeral) {
      btnGeral.addEventListener("click", () => {
        openWhatsApp("Olá! 👋 Quero ajuda/orçamento para um personalizado.");
      });
    }

    if (btnCustom) {
      btnCustom.addEventListener("click", () => {
        openWhatsApp("Olá! 👋 Tenho uma ideia à medida e queria falar convosco sobre opções e valores.");
      });
    }
  }

  function hookEvents() {
    chipsWrap.addEventListener("click", e => {
      const b = e.target.closest("button.chip");
      if (!b) return;
      const id = b.dataset.id || "";
      campaignFilter.value = id;
      buildChips(id);
      renderProducts();
    });

    campaignFilter.addEventListener("change", () => {
      buildChips(campaignFilter.value);
      renderProducts();
    });

    search.addEventListener("input", renderProducts);
    onlyActive.addEventListener("change", renderProducts);
  }

  async function init() {
    $("#year").textContent = String(new Date().getFullYear());

    hookGeneralButtons();
    hookEvents();

    sections = await loadJson("data/sections.json");
    products = await loadJson("data/products.json");

    statSections.textContent = String(
      sections.filter(s => s.active).length
    );
    statProducts.textContent = String(
      products.filter(p => p.active).length
    );

    fillFilter();
    buildChips("");
    renderCampaigns();
    renderProducts();
  }

  init().catch(err => {
    console.error(err);
    alert(
      "Erro a carregar dados. Confirma se estás a abrir via GitHub Pages e se as pastas estão corretas."
    );
  });
})();
