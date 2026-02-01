(() => {
  "use strict";

  const $ = (sel, root=document) => root.querySelector(sel);
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  let sections = [];
  let products = [];

  const sectionsList = $("#sectionsList");
  const productsList = $("#productsList");

  function uid(prefix){
    return `${prefix}-${Math.random().toString(16).slice(2,10)}`;
  }

  async function loadJson(path){
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Falhou a carregar: " + path);
    return res.json();
  }

  function slugify(s){
    return String(s||"")
      .trim().toLowerCase()
      .replace(/[^\w\s-]/g,"")
      .replace(/\s+/g,"-")
      .replace(/-+/g,"-")
      .slice(0,60) || uid("item");
  }

  function sectionOptions(selectedIds){
    const ids = new Set(selectedIds || []);
    const wrap = el("div");
    sections.forEach(s => {
      const lab = el("label");
      lab.style.flexDirection = "row";
      lab.style.alignItems = "center";
      lab.style.gap = "8px";
      lab.style.color = "var(--text)";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = ids.has(s.id);
      cb.dataset.id = s.id;
      lab.append(cb, document.createTextNode(s.title || s.id));
      wrap.appendChild(lab);
    });
    return wrap;
  }

  function renderSections(){
    sectionsList.innerHTML = "";
    sections.forEach((s, idx) => {
      const item = el("div", "item");

      const h = el("h3");
      h.textContent = `${s.title || "Campanha"} (${s.id})`;
      item.appendChild(h);

      const fields = el("div", "fields");

      const fTitle = makeField("Título", "text", s.title || "", v => {
        s.title = v;
        // se id ainda estiver genérico, sugere a partir do título
        if (!s.id || s.id.startsWith("nova-")) s.id = slugify(v);
        renderSections();
        renderProducts(); // labels de campanhas mudam
      });

      const fId = makeField("ID (não repetir)", "text", s.id || "", v => {
        s.id = slugify(v);
        renderSections();
        renderProducts();
      });

      const fDesc = makeField("Descrição", "text", s.description || "", v => s.description = v);

      const fImg = makeField("Imagem (caminho)", "text", s.heroImage || "", v => s.heroImage = v);
      fImg.querySelector("input").placeholder = "img/produtos/placeholder-pai.jpg";

      const fOrder = makeField("Ordem", "number", String(s.order ?? (idx+1)), v => s.order = Number(v||0));

      const fActive = makeCheckboxField("Ativa", !!s.active, v => s.active = v);

      fields.append(fTitle, fId, fDesc, fImg, fOrder, fActive);
      item.appendChild(fields);

      const actions = el("div", "actions");
      const del = el("button", "btn danger");
      del.type = "button";
      del.textContent = "Apagar campanha";
      del.addEventListener("click", () => {
        // remove da lista
        sections.splice(idx,1);
        // remove a ligação nos produtos
        products.forEach(p => {
          p.sections = (p.sections || []).filter(id => id !== s.id);
        });
        renderSections();
        renderProducts();
      });

      actions.appendChild(del);
      item.appendChild(actions);

      sectionsList.appendChild(item);
    });
  }

  function renderProducts(){
    productsList.innerHTML = "";
    products.forEach((p, idx) => {
      const item = el("div", "item");
      const h = el("h3");
      h.textContent = `${p.name || "Ideia"} (${p.id})`;
      item.appendChild(h);

      const fields = el("div", "fields");

      const fName = makeField("Nome", "text", p.name || "", v => {
        p.name = v;
        if (!p.id || p.id.startsWith("nova-")) p.id = slugify(v);
        renderProducts();
      });

      const fId = makeField("ID", "text", p.id || "", v => {
        p.id = slugify(v);
        renderProducts();
      });

      const fDesc = makeField("Descrição", "text", p.description || "", v => p.description = v);

      const fImg = makeField("Imagem (caminho)", "text", p.image || "", v => p.image = v);
      fImg.querySelector("input").placeholder = "img/produtos/meu-produto.jpg";

      const fActive = makeCheckboxField("Ativo", !!p.active, v => p.active = v);

      fields.append(fName, fId, fDesc, fImg, fActive);
      item.appendChild(fields);

      // Campanhas multi-select (checkboxes)
      const lab = el("label");
      lab.textContent = "Campanhas onde aparece";
      lab.style.marginTop = "10px";
      lab.style.color = "var(--muted)";
      const opts = sectionOptions(p.sections || []);
      opts.addEventListener("change", () => {
        const ids = [];
        opts.querySelectorAll("input[type=checkbox]").forEach(cb => {
          if (cb.checked) ids.push(cb.dataset.id);
        });
        p.sections = ids;
      });

      item.appendChild(lab);
      item.appendChild(opts);

      const wlab = el("label");
      wlab.textContent = "Mensagem WhatsApp (pré-preenchida)";
      wlab.style.marginTop = "10px";
      const ta = document.createElement("textarea");
      ta.value = p.whatsappText || "";
      ta.placeholder = `Olá! 👋 Vi no vosso site a ideia "${p.name || ""}" e queria saber opções e valores.`;
      ta.addEventListener("input", () => p.whatsappText = ta.value);
      wlab.appendChild(ta);
      item.appendChild(wlab);

      const actions = el("div", "actions");
      const del = el("button", "btn danger");
      del.type = "button";
      del.textContent = "Apagar ideia";
      del.addEventListener("click", () => {
        products.splice(idx,1);
        renderProducts();
      });

      actions.appendChild(del);
      item.appendChild(actions);

      productsList.appendChild(item);
    });
  }

  function makeField(label, type, value, onChange){
    const wrap = el("label");
    wrap.textContent = label;
    const input = document.createElement("input");
    input.type = type;
    input.value = value ?? "";
    input.addEventListener("input", () => onChange(input.value));
    wrap.appendChild(input);
    return wrap;
  }

  function makeCheckboxField(label, checked, onChange){
    const wrap = el("label");
    wrap.style.flexDirection = "row";
    wrap.style.alignItems = "center";
    wrap.style.gap = "10px";
    wrap.style.color = "var(--text)";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!checked;
    input.addEventListener("change", () => onChange(input.checked));
    const span = document.createElement("span");
    span.textContent = label;
    wrap.append(input, span);
    return wrap;
  }

  function downloadJson(filename, data){
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportAll(){
    // limpeza leve: garantir ids e arrays
    sections = sections.map(s => ({
      id: slugify(s.id || s.title || uid("sec")),
      title: String(s.title || "").trim(),
      description: String(s.description || "").trim(),
      heroImage: String(s.heroImage || "").trim(),
      active: !!s.active,
      order: Number(s.order || 0)
    }));

    products = products.map(p => ({
      id: slugify(p.id || p.name || uid("prod")),
      name: String(p.name || "").trim(),
      sections: Array.isArray(p.sections) ? p.sections.map(slugify) : [],
      image: String(p.image || "").trim(),
      description: String(p.description || "").trim(),
      active: !!p.active,
      whatsappText: String(p.whatsappText || "").trim()
    }));

    downloadJson("sections.json", sections);
    downloadJson("products.json", products);
    alert("Export feito ✅\nAgora faz upload destes 2 ficheiros para /data no teu GitHub (substituir os existentes).");
  }

  async function loadFromSite(){
    try{
      sections = await loadJson("../data/sections.json");
      products = await loadJson("../data/products.json");
      renderSections();
      renderProducts();
      alert("Carregado ✅");
    }catch(e){
      console.error(e);
      alert("Não consegui carregar os JSON do site. Confirma que existe /data/sections.json e /data/products.json e que estás a abrir isto em GitHub Pages.");
    }
  }

  function addSection(){
    sections.push({
      id: "nova-campanha",
      title: "Nova Campanha",
      description: "",
      heroImage: "img/produtos/placeholder-produto.jpg",
      active: true,
      order: sections.length + 1
    });
    renderSections();
    renderProducts();
  }

  function addProduct(){
    products.push({
      id: "nova-ideia",
      name: "Nova Ideia",
      sections: sections.slice(0,1).map(s => s.id), // mete na 1ª por conveniência
      image: "img/produtos/placeholder-produto.jpg",
      description: "",
      active: true,
      whatsappText: ""
    });
    renderProducts();
  }

  $("#btnExport").addEventListener("click", exportAll);
  $("#btnLoad").addEventListener("click", loadFromSite);
  $("#btnAddSection").addEventListener("click", addSection);
  $("#btnAddProduct").addEventListener("click", addProduct);

  // Inicial: tenta carregar do site; se falhar, começa vazio com templates
  loadFromSite().catch(() => {
    sections = [
      { id:"dia-dos-namorados", title:"Dia dos Namorados", description:"", heroImage:"img/produtos/placeholder-namorados.jpg", active:true, order:1 },
      { id:"dia-do-pai", title:"Dia do Pai", description:"", heroImage:"img/produtos/placeholder-pai.jpg", active:true, order:2 }
    ];
    products = [];
    renderSections();
    renderProducts();
  });
})();
