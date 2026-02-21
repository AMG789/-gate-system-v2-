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
let auth, db;
let firebaseInitialized = false;
let firebaseError = null;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    firebaseError = error.message;
}

// Master Admin Email
const MASTER_ADMIN = "Aswany177@gmail.com";

// Firebase Connection Status
let firebaseConnected = false;

// Check Firebase connection
function checkFirebaseConnection() {
    return new Promise((resolve) => {
        if (!firebaseInitialized) {
            resolve(false);
            return;
        }
        
        // Try to access Firestore to verify connection
        db.collection('_connection_test').doc('test').get()
            .then(() => {
                firebaseConnected = true;
                resolve(true);
            })
            .catch((error) => {
                // If permission denied, it means Firebase is connected but rules block access
                if (error.code === 'permission-denied') {
                    firebaseConnected = true;
                    resolve(true);
                } else {
                    firebaseConnected = false;
                    resolve(false);
                }
            });
    });
}

// Export for use in other files
window.auth = auth;
window.db = db;
window.MASTER_ADMIN = MASTER_ADMIN;
window.firebaseInitialized = firebaseInitialized;
window.firebaseError = firebaseError;
window.firebaseConnected = firebaseConnected;
window.checkFirebaseConnection = checkFirebaseConnection;
