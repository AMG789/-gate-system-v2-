// Main JavaScript - Shared functionality across all pages

(function() {
  'use strict';

  // App configuration
  const APP_CONFIG = {
    name: 'Facility Management System',
    version: '1.0.0',
    defaultRedirect: '/dashboard/'
  };

  // Initialize main functionality
  function init() {
    console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} initialized`);
    
    // Initialize sidebar toggle
    initSidebar();
    
    // Initialize user menu
    initUserMenu();
    
    // Initialize logout functionality
    initLogout();
    
    // Initialize notifications
    initNotifications();
    
    // Update current date/time
    updateDateTime();
    setInterval(updateDateTime, 60000);
  }

  // Sidebar toggle functionality
  function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        if (mainContent) {
          mainContent.classList.toggle('expanded');
        }
        
        // Save preference
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
      });

      // Restore sidebar state
      const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      if (wasCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
          mainContent.classList.add('expanded');
        }
      }
    }
  }

  // User menu dropdown
  function initUserMenu() {
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userMenu = document.getElementById('user-menu');

    if (userMenuToggle && userMenu) {
      userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('show');
      });

      // Close when clicking outside
      document.addEventListener('click', () => {
        userMenu.classList.remove('show');
      });
    }
  }

  // Logout functionality
  function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const sidebarLogout = document.getElementById('sidebar-logout');

    const handleLogout = async () => {
      try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          await firebase.auth().signOut();
          
          // Clear role cache
          if (window.RoleGuard) {
            window.RoleGuard.clearRoleCache();
          }
          
          // Clear local storage
          localStorage.clear();
          
          // Redirect to login
          window.location.href = '/index.html';
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      }
    };

    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    if (sidebarLogout) {
      sidebarLogout.addEventListener('click', handleLogout);
    }
  }

  // Notifications system
  function initNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');

    if (notificationBtn && notificationPanel) {
      notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        notificationPanel.classList.remove('show');
      });
    }
  }

  // Update date and time display
  function updateDateTime() {
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');

    const now = new Date();

    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Utility functions
  window.AppUtils = {
    // Format date
    formatDate: function(date, format = 'short') {
      const d = new Date(date);
      const options = format === 'long' 
        ? { year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    },

    // Format time
    formatTime: function(date) {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Format datetime
    formatDateTime: function(date) {
      return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    // Show loading spinner
    showLoading: function(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
      }
    },

    // Hide loading spinner
    hideLoading: function(elementId, content) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = content;
      }
    },

    // Show toast notification
    showToast: function(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    },

    // Confirm dialog
    confirm: function(message, onConfirm, onCancel) {
      if (confirm(message)) {
        if (onConfirm) onConfirm();
      } else {
        if (onCancel) onCancel();
      }
    },

    // Debounce function
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Get URL parameters
    getUrlParam: function(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    },

    // Set active navigation item
    setActiveNav: function() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('.nav-link');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose app config
  window.APP_CONFIG = APP_CONFIG;
})();

