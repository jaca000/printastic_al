import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyC3eYuvhZkhjViDLP2h8_pvhNMN_d4Q2J8",
  authDomain: "printastic-al.firebaseapp.com",
  projectId: "printastic-al",
  storageBucket: "printastic-al.appspot.com",
  messagingSenderId: "894753780425",
  appId: "1:894753780425:web:490b24f721c4d655fed318",
  measurementId: "G-BZBCMKQ8S7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
