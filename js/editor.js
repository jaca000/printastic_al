(() => {

const $ = (sel) => document.querySelector(sel);

let sections = [];
let products = [];

const sectionsList = $("#sectionsList");
const productsList = $("#productsList");

const btnAddSection = $("#btnAddSection");
const btnAddProduct = $("#btnAddProduct");
const btnSave = $("#saveBtn");

/* LOAD DATA */

async function loadData(){

  const s = await fetch("../data/sections.json");
  const p = await fetch("../data/products.json");

  sections = await s.json();
  products = await p.json();

  render();

}

/* SAVE JSON */

function download(filename, data){

  const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

}

btnSave.onclick = () => {

  download("sections.json", sections);
  download("products.json", products);

  alert("Ficheiros exportados. Faz upload para /data no GitHub.");

};

/* ADD */

btnAddSection.onclick = () => {

  sections.push({
    id:"nova-campanha",
    title:"Nova campanha",
    description:"",
    heroImage:"",
    active:true,
    order:sections.length+1
  });

  render();

};

btnAddProduct.onclick = () => {

  products.push({
    id:"novo-produto",
    name:"Nova ideia",
    sections:[],
    image:"",
    description:"",
    active:true,
    whatsappText:""
  });

  render();

};

/* RENDER */

function render(){

  sectionsList.innerHTML = "";
  productsList.innerHTML = "";

  sections.forEach((s,i)=>{

    const div = document.createElement("div");
    div.className="item";

    div.innerHTML=`
  <h3>${s.title}</h3>

  <label>
    Título
    <input value="${s.title}">
  </label>

  <label>
    Descrição
    <input value="${s.description}">
  </label>

  <label>
    Imagem
    <input value="${s.heroImage || ""}" placeholder="img/produtos/imagem.jpg">
  </label>

  <img class="preview" src="${s.heroImage || ""}" style="max-width:100%;border-radius:8px;margin-top:8px">

  <button class="btn" style="margin-top:10px;background:#b33">
    Apagar campanha
  </button>
`;

    const inputs = div.querySelectorAll("input");

    inputs[0].oninput = e => s.title = e.target.value;
    inputs[1].oninput = e => s.description = e.target.value;
    inputs[2].oninput = e => s.heroImage = e.target.value;

    div.querySelector("button").onclick = () => {

      if(!confirm("Apagar campanha?")) return;

      sections.splice(i,1);
      render();

    };

    sectionsList.appendChild(div);

  });

  products.forEach((p,i)=>{

    const div = document.createElement("div");
    div.className="item";

    div.innerHTML=`
      <h3>${p.name}</h3>

      <label>
        Nome
        <input value="${p.name}">
      </label>

      <label>
        Descrição
        <input value="${p.description}">
      </label>

      <label>
        Imagem
        <input value="${p.image || ""}" placeholder="img/produtos/produto.jpg">
      </label>

      <button class="btn" style="margin-top:10px;background:#b33">
        Apagar ideia
      </button>
    `;

    const inputs = div.querySelectorAll("input");

    inputs[0].oninput = e => p.name = e.target.value;
    inputs[1].oninput = e => p.description = e.target.value;
    inputs[2].oninput = e => p.image = e.target.value;

    div.querySelector("button").onclick = () => {

      if(!confirm("Apagar ideia?")) return;

      products.splice(i,1);
      render();

    };

    productsList.appendChild(div);

  });

}

/* INIT */

loadData();

})();
