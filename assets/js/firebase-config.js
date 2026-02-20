// Firebase Configuration
// Gate Management System - Firebase Project

const firebaseConfig = {
  apiKey: "AIzaSyBVho_BuuRkfRbuQzW2PWDYnJxxmC5yyAc",
  authDomain: "gate-management-system-44cf5.firebaseapp.com",
  projectId: "gate-management-system-44cf5",
  storageBucket: "gate-management-system-44cf5.firebasestorage.app",
  messagingSenderId: "859920522798",
  appId: "1:859920522798:web:d3ea86a373ce25ab0dc9bf",
  measurementId: "G-XQ6CT9SK7D"
};

// Initialize Firebase when the script loads
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully - Gate Management System');
} else {
  console.error('Firebase SDK not loaded. Make sure to include Firebase scripts in your HTML.');
}

// Export configuration for use in other modules
window.firebaseConfig = firebaseConfig;
