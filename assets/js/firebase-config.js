// Firebase Configuration - Gate Management System
const firebaseConfig = {
    apiKey: "AIzaSyBVho_BuuRkfRbuQzW2PWDYnJxxmC5yyAc",
    authDomain: "gate-management-system-44cf5.firebaseapp.com",
    projectId: "gate-management-system-44cf5",
    storageBucket: "gate-management-system-44cf5.firebasestorage.app",
    messagingSenderId: "859920522798",
    appId: "1:859920522798:web:d3ea86a373ce25ab0dc9bf",
    measurementId: "G-XQ6CT9SK7D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Master Admin Email
const MASTER_ADMIN = "Aswany177@gmail.com";

// Export for use in other files
window.auth = auth;
window.db = db;
window.MASTER_ADMIN = MASTER_ADMIN;
