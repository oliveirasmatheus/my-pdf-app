// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_Qltp7sKNFEoDcyMtdjUXF0UGMbvO5Y0",
  authDomain: "my-pdf-app-2d361.firebaseapp.com",
  projectId: "my-pdf-app-2d361",
  storageBucket: "my-pdf-app-2d361.firebasestorage.app",
  messagingSenderId: "222337670791",
  appId: "1:222337670791:web:4290edecae5c18733b2222"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
