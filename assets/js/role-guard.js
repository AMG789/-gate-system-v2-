// Role Guard - Manages role-based access control
// Defines which roles can access which pages

(function() {
  'use strict';

  // Role definitions
  const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    SECURITY: 'security',
    RECEPTIONIST: 'receptionist',
    USER: 'user'
  };

  // Page access permissions
  // Each page can have multiple allowed roles
  const PAGE_PERMISSIONS = {
    '/dashboard/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY, ROLES.RECEPTIONIST, ROLES.USER],
    '/fcp/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY],
    '/fnq/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY],
    '/visitors/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY, ROLES.RECEPTIONIST],
    '/gatepass/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY, ROLES.RECEPTIONIST],
    '/history/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY],
    '/users/': [ROLES.ADMIN, ROLES.MANAGER]
  };

  // Get user role from Firestore or local storage
  async function getUserRole(userId) {
    try {
      // First check local storage for cached role
      const cachedRole = localStorage.getItem('userRole');
      const cachedTimestamp = localStorage.getItem('userRoleTimestamp');
      
      // Use cached role if less than 1 hour old
      if (cachedRole && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < 3600000) { // 1 hour
          return cachedRole;
        }
      }

      // Fetch role from Firestore
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const role = userData.role || ROLES.USER;
          
          // Cache the role
          localStorage.setItem('userRole', role);
          localStorage.setItem('userRoleTimestamp', Date.now().toString());
          
          return role;
        }
      }
      
      // Default role if Firestore not available
      return ROLES.USER;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return ROLES.USER;
    }
  }

  // Check if user has permission for current page
  async function checkPageAccess(userId) {
    const currentPath = window.location.pathname;
    const allowedRoles = PAGE_PERMISSIONS[currentPath];

    // If page not in permissions list, allow access (public page)
    if (!allowedRoles) {
      return true;
    }

    // Get user role
    const userRole = await getUserRole(userId);
    window.currentUserRole = userRole;

    // Check if user's role is in allowed roles
    if (allowedRoles.includes(userRole)) {
      console.log(`Access granted: ${userRole} can access ${currentPath}`);
      return true;
    } else {
      console.warn(`Access denied: ${userRole} cannot access ${currentPath}`);
      return false;
    }
  }

  // Initialize role guard
  async function initRoleGuard() {
    // Wait for auth to be verified
    document.addEventListener('auth:verified', async (event) => {
      const user = event.detail.user;
      
      try {
        const hasAccess = await checkPageAccess(user.uid);
        
        if (!hasAccess) {
          // Redirect to dashboard with access denied message
          alert('Access Denied: You do not have permission to view this page.');
          window.location.href = '/dashboard/';
        } else {
          // Dispatch role verified event
          document.dispatchEvent(new CustomEvent('role:verified', { 
            detail: { role: window.currentUserRole } 
          }));
          
          // Update UI based on role
          updateUIBasedOnRole(window.currentUserRole);
        }
      } catch (error) {
        console.error('Role check error:', error);
      }
    });
  }

  // Update UI elements based on user role
  function updateUIBasedOnRole(role) {
    // Hide/show elements based on role
    const roleElements = document.querySelectorAll('[data-role]');
    
    roleElements.forEach(element => {
      const requiredRole = element.getAttribute('data-role');
      const requiredRoles = requiredRole.split(',').map(r => r.trim());
      
      if (requiredRoles.includes(role)) {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });

    // Add role badge to header if exists
    const roleBadge = document.getElementById('user-role-badge');
    if (roleBadge) {
      roleBadge.textContent = role.toUpperCase();
      roleBadge.className = `role-badge role-${role}`;
    }
  }

  // Clear cached role on logout
  function clearRoleCache() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleTimestamp');
  }

  // Run role guard when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoleGuard);
  } else {
    initRoleGuard();
  }

  // Expose role functions globally
  window.RoleGuard = {
    ROLES: ROLES,
    getUserRole: getUserRole,
    checkPageAccess: checkPageAccess,
    updateUIBasedOnRole: updateUIBasedOnRole,
    clearRoleCache: clearRoleCache,
    hasRole: function(requiredRole) {
      return window.currentUserRole === requiredRole;
    },
    hasAnyRole: function(roles) {
      return roles.includes(window.currentUserRole);
    }
  };
})();
