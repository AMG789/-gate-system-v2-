// Auth Guard - Protects routes that require authentication
// Redirects to login page if user is not authenticated

(function() {
  'use strict';

  // Check if user is authenticated
  function checkAuth() {
    return new Promise((resolve, reject) => {
      if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        reject('Firebase not available');
        return;
      }

      const auth = firebase.auth();
      
      // Set up auth state listener
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Unsubscribe after first check
        
        if (user) {
          // User is signed in
          console.log('User authenticated:', user.email);
          resolve(user);
        } else {
          // User is not signed in
          console.log('User not authenticated, redirecting to login...');
          reject('Not authenticated');
        }
      }, (error) => {
        console.error('Auth state error:', error);
        reject(error);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        unsubscribe();
        reject('Auth check timeout');
      }, 5000);
    });
  }

  // Initialize auth guard
  function initAuthGuard() {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/' || 
                       currentPath === '/index.html' || 
                       currentPath.endsWith('/index.html') && currentPath.split('/').length <= 2;

    // Don't protect login page
    if (isLoginPage) {
      // If already logged in, redirect to dashboard
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log('Already logged in, redirecting to dashboard...');
          window.location.href = '/dashboard/';
        }
      });
      return;
    }

    // Protect all other pages
    checkAuth()
      .then((user) => {
        // Store user info in session for other scripts to use
        window.currentUser = user;
        
        // Dispatch custom event for other scripts
        document.dispatchEvent(new CustomEvent('auth:verified', { 
          detail: { user: user } 
        }));
      })
      .catch((error) => {
        console.error('Authentication required:', error);
        // Redirect to login page with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/index.html?redirect=${returnUrl}`;
      });
  }

  // Run auth guard when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthGuard);
  } else {
    initAuthGuard();
  }

  // Expose auth functions globally
  window.AuthGuard = {
    checkAuth: checkAuth,
    signOut: function() {
      return firebase.auth().signOut();
    },
    getCurrentUser: function() {
      return firebase.auth().currentUser;
    }
  };
})();
