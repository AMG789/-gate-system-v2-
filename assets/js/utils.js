// Utility Functions - Gate Management System

// Global State
let currentUser = null;
let isAdmin = false;
let isOnline = navigator.onLine;

// Format Date (YYYY-MM-DD)
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

// Format Date for Display (DD/MM/YYYY)
function formatDateDisplay(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Update DateTime in Header
function updateDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    
    if (dateEl) dateEl.textContent = `${day}/${month}/${year}`;
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US');
    
    // Update readonly time fields
    const timeStr = now.toTimeString().slice(0, 5);
    ['fcpTime', 'fnqTime', 'visitorTime', 'gpTime'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = timeStr;
    });
}

// Set Default Times
function setDefaultTimes() {
    const timeStr = new Date().toTimeString().slice(0, 5);
    ['fcpTime', 'fnqTime', 'visitorTime', 'gpTime'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = timeStr;
    });
}

// Day Change Check (24-hour system: 12:00 AM - 11:59 PM)
function checkDayChange() {
    const now = new Date();
    const today = formatDate(now);
    const lastDate = localStorage.getItem('gms_lastDate');
    
    if (lastDate && lastDate !== today) {
        archiveDayData(lastDate);
    }
    localStorage.setItem('gms_lastDate', today);
}

// Archive Day Data
function archiveDayData(date) {
    const types = ['fcp', 'fnq', 'visitors', 'gatepass'];
    types.forEach(type => {
        const data = localStorage.getItem(`gms_${type}_${date}`);
        if (data) {
            localStorage.setItem(`gms_history_${type}_${date}`, data);
            localStorage.removeItem(`gms_${type}_${date}`);
        }
    });
}

// Get Today's Data
function getTodayData(type) {
    const today = formatDate(new Date());
    const key = `gms_${type}_${today}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Save Today's Data
function saveTodayData(type, data) {
    const today = formatDate(new Date());
    const key = `gms_${type}_${today}`;
    localStorage.setItem(key, JSON.stringify(data));
}

// Get History Data
function getHistoryData(type, date) {
    const key = `gms_history_${type}_${date}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Calculate Duration
function calculateDuration(timeIn, timeOut) {
    if (!timeIn || !timeOut || timeIn === '-' || timeOut === '-') return '-';
    
    const [h1, m1] = timeIn.split(':').map(Number);
    const [h2, m2] = timeOut.split(':').map(Number);
    
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    
    return `${hours}h ${mins}m`;
}

// Setup Network Listeners
function setupNetworkListeners() {
    const statusEl = document.getElementById('connectionStatus');
    
    // Update connection status display
    async function updateConnectionStatus() {
        if (!statusEl) return;
        
        // Check browser online status
        const browserOnline = navigator.onLine;
        
        // Check Firebase connection
        let firebaseOnline = false;
        if (typeof checkFirebaseConnection === 'function') {
            firebaseOnline = await checkFirebaseConnection();
        }
        
        // Determine overall status
        if (browserOnline && firebaseOnline) {
            statusEl.textContent = 'ONLINE';
            statusEl.className = 'connection-status online';
        } else if (browserOnline && !firebaseOnline) {
            statusEl.textContent = 'FIREBASE ERROR';
            statusEl.className = 'connection-status offline';
            statusEl.title = 'Firebase not connected. Check console setup.';
        } else {
            statusEl.textContent = 'OFFLINE';
            statusEl.className = 'connection-status offline';
        }
    }
    
    // Initial check
    updateConnectionStatus();
    
    // Check every 10 seconds
    setInterval(updateConnectionStatus, 10000);
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
}

// Check Auth State
function checkAuth(callback) {
    // Check if Firebase is initialized
    if (!firebaseInitialized || !auth) {
        console.error('Firebase not initialized. Please check your Firebase Console setup.');
        // Still allow access in offline mode for development
        if (callback) callback(false);
        return;
    }
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            isAdmin = user.email.toLowerCase() === MASTER_ADMIN.toLowerCase();
            if (callback) callback(true);
        } else {
            currentUser = null;
            isAdmin = false;
            if (callback) callback(false);
        }
    }, (error) => {
        console.error('Auth state error:', error);
        if (callback) callback(false);
    });
}

// Logout
async function logout() {
    if (auth) {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    currentUser = null;
    isAdmin = false;
    window.location.href = '/index.html';
}

// Print Report
function printReport(type, data) {
    const printWindow = window.open('', '_blank');
    const dateStr = document.getElementById('currentDate').textContent;
    
    let content = '';
    let title = '';
    
    switch(type) {
        case 'fcp':
            title = 'FCP - Daily Report';
            content = `
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
                    <tr style="background:#2c3e50; color:white;">
                        <th>#</th><th>Truck No.</th><th>GP No.</th><th>Time In</th><th>Time Out</th><th>Status</th>
                    </tr>
                    ${data.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.truckNo}</td>
                            <td>${item.gp}</td>
                            <td>${item.timeIn}</td>
                            <td>${item.timeOut}</td>
                            <td>${item.status.toUpperCase()}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
            break;
        case 'fnq':
            title = 'FNQ - Quarry Report';
            const fnqInside = data.filter(r => r.status === 'inside');
            const fnqCompleted = data.filter(r => r.status === 'completed');
            content = `
                <h3>Inside Quarry</h3>
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse; margin-bottom:20px;">
                    <tr style="background:#27ae60; color:white;">
                        <th>#</th><th>Truck No.</th><th>Gate Pass</th><th>Driver</th><th>Entry Time</th>
                    </tr>
                    ${fnqInside.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.truckNo}</td>
                            <td>${item.gp}</td>
                            <td>${item.driver}</td>
                            <td>${item.timeIn}</td>
                        </tr>
                    `).join('')}
                </table>
                <h3>Completed Exits</h3>
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
                    <tr style="background:#34495e; color:white;">
                        <th>#</th><th>Truck No.</th><th>Gate Pass</th><th>Time In</th><th>Time Out</th><th>Duration</th>
                    </tr>
                    ${fnqCompleted.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.truckNo}</td>
                            <td>${item.gp}</td>
                            <td>${item.timeIn}</td>
                            <td>${item.timeOut}</td>
                            <td>${calculateDuration(item.timeIn, item.timeOut)}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
            break;
        case 'visitors':
            title = 'Visitors Report';
            const visInside = data.filter(r => r.status === 'inside');
            const visCompleted = data.filter(r => r.status === 'completed');
            content = `
                <h3>Current Visitors</h3>
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse; margin-bottom:20px;">
                    <tr style="background:#f39c12; color:white;">
                        <th>#</th><th>Name</th><th>Company</th><th>Destination</th><th>Entry Time</th>
                    </tr>
                    ${visInside.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.name}</td>
                            <td>${item.company}</td>
                            <td>${item.destination}</td>
                            <td>${item.timeIn}</td>
                        </tr>
                    `).join('')}
                </table>
                <h3>Completed Visits</h3>
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
                    <tr style="background:#34495e; color:white;">
                        <th>#</th><th>Name</th><th>Company</th><th>Destination</th><th>Time In</th><th>Time Out</th><th>Duration</th>
                    </tr>
                    ${visCompleted.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.name}</td>
                            <td>${item.company}</td>
                            <td>${item.destination}</td>
                            <td>${item.timeIn}</td>
                            <td>${item.timeOut}</td>
                            <td>${calculateDuration(item.timeIn, item.timeOut)}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
            break;
        case 'gatepass':
            title = 'Gate Pass Report';
            const gpActive = data.filter(r => r.status === 'out');
            const gpReturned = data.filter(r => r.status === 'returned');
            content = `
                <h3>Active (OUT)</h3>
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse; margin-bottom:20px;">
                    <tr style="background:#e74c3c; color:white;">
                        <th>#</th><th>GP Number</th><th>Department</th><th>Issue Time</th>
                    </tr>
                    ${gpActive.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.number}</td>
                            <td>${item.department}</td>
                            <td>${item.issueTime}</td>
                        </tr>
                    `).join('')}
                </table>
                <h3>Returned (IN)</h3>
                <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
                    <tr style="background:#27ae60; color:white;">
                        <th>#</th><th>GP Number</th><th>Department</th><th>Issue Time</th><th>Return Time</th>
                    </tr>
                    ${gpReturned.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.number}</td>
                            <td>${item.department}</td>
                            <td>${item.issueTime}</td>
                            <td>${item.returnTime}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
            break;
    }
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #2c3e50; text-align: center; }
                h2 { color: #7f8c8d; text-align: center; font-size: 14px; margin-bottom: 20px; }
                h3 { color: #34495e; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>AMG - ${title}</h1>
            <h2>Date: ${dateStr}</h2>
            ${content}
            <script>window.print();<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Initialize Common Functions
document.addEventListener('DOMContentLoaded', function() {
    setupNetworkListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setDefaultTimes();
    checkDayChange();
    setInterval(checkDayChange, 60000);
});

// Export functions
window.formatDate = formatDate;
window.formatDateDisplay = formatDateDisplay;
window.updateDateTime = updateDateTime;
window.setDefaultTimes = setDefaultTimes;
window.checkDayChange = checkDayChange;
window.getTodayData = getTodayData;
window.saveTodayData = saveTodayData;
window.getHistoryData = getHistoryData;
window.calculateDuration = calculateDuration;
window.setupNetworkListeners = setupNetworkListeners;
window.checkAuth = checkAuth;
window.logout = logout;
window.printReport = printReport;
window.currentUser = currentUser;
window.isAdmin = isAdmin;
window.isOnline = isOnline;
