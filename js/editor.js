import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authBox = document.getElementById("authBox");
const editorApp = document.getElementById("editorApp");
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");

let sections = [];
let products = [];

/* LOGIN */

loginBtn.onclick = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Erro login: " + err.message);
  }

};

/* AUTH STATE */

onAuthStateChanged(auth, async (user) => {

  if (user) {

    authBox.style.display = "none";
    editorApp.style.display = "block";

    await loadData();
    renderEditor();

  } else {

    authBox.style.display = "block";
    editorApp.style.display = "none";

  }

});

/* LOAD FIRESTORE */

async function loadData(){

  const secSnap = await getDocs(collection(db,"sections"));
  const prodSnap = await getDocs(collection(db,"products"));

  sections = secSnap.docs.map(d => d.data());
  products = prodSnap.docs.map(d => d.data());

}

/* SAVE */

saveBtn.onclick = async () => {

  for(const s of sections){
    await setDoc(doc(db,"sections",s.id), s);
  }

  for(const p of products){
    await setDoc(doc(db,"products",p.id), p);
  }

  alert("Guardado 🔥");

};

/* RENDER SIMPLES (só teste inicial) */

function renderEditor(){

  console.log("Dados carregados:", sections, products);

}
