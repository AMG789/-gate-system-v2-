// Excel Export Functionality - Gate Management System
// Using SheetJS (xlsx) library

// Load SheetJS from CDN
const xlsxScript = document.createElement('script');
xlsxScript.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
document.head.appendChild(xlsxScript);

// Export data to Excel
function exportToExcel(data, filename, sheetName) {
    if (typeof XLSX === 'undefined') {
        alert('Excel library is loading. Please try again in a moment.');
        return;
    }
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = {};
    const columns = Object.keys(data[0] || {});
    columns.forEach((col, index) => {
        const maxLength = Math.max(
            col.length,
            ...data.map(row => String(row[col] || '').length)
        );
        colWidths[XLSX.utils.encode_col(index)] = { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = Object.values(colWidths);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${date}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fullFilename);
}

// Format data for Excel export based on type
function formatDataForExcel(rawData, type) {
    const formattedData = [];
    
    rawData.forEach((item, index) => {
        let row = {
            'No.': index + 1,
            'Date': item.date || formatDate(new Date()),
            'Time': item.timeIn || item.timeOut || item.issueTime || '-'
        };
        
        switch(type) {
            case 'fcp':
                row = {
                    ...row,
                    'Truck Number': item.truckNo || '-',
                    'Gate Pass': item.gp || '-',
                    'Time In': item.timeIn || '-',
                    'Time Out': item.timeOut || '-',
                    'Status': item.status === 'inside' ? 'INSIDE' : 'OUT',
                    'Created By': item.createdBy || '-'
                };
                break;
                
            case 'fnq':
                row = {
                    ...row,
                    'Truck Number': item.truckNo || '-',
                    'Gate Pass': item.gp || '-',
                    'Driver': item.driver || '-',
                    'Time In': item.timeIn || '-',
                    'Time Out': item.timeOut || '-',
                    'Duration': calculateDuration(item.timeIn, item.timeOut),
                    'Status': item.status === 'inside' ? 'INSIDE' : 'COMPLETED'
                };
                break;
                
            case 'visitors':
                row = {
                    ...row,
                    'Visitor Name': item.name || '-',
                    'Company': item.company || '-',
                    'Vehicle': item.vehicle || '-',
                    'Destination': item.destination || '-',
                    'Purpose': item.purpose || '-',
                    'Time In': item.timeIn || '-',
                    'Time Out': item.timeOut || '-',
                    'Duration': calculateDuration(item.timeIn, item.timeOut),
                    'Status': item.status === 'inside' ? 'INSIDE' : 'COMPLETED'
                };
                break;
                
            case 'gatepass':
                row = {
                    ...row,
                    'Gate Pass Number': item.number || '-',
                    'Department': item.department || '-',
                    'Issue Time': item.issueTime || '-',
                    'Return Time': item.returnTime || '-',
                    'Status': item.status === 'out' ? 'OUT' : 'RETURNED'
                };
                break;
        }
        
        formattedData.push(row);
    });
    
    return formattedData;
}

// Export history data to Excel with multiple sheets
function exportHistoryToExcel(allData, fromDate, toDate) {
    if (typeof XLSX === 'undefined') {
        alert('Excel library is loading. Please try again in a moment.');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Create summary sheet
    const summaryData = [
        { 'Report': 'Gate Management System - History Report' },
        { 'From Date': fromDate, 'To Date': toDate },
        { 'Generated': new Date().toLocaleString() },
        {},
        { 'Department': 'FCP', 'Records': allData.filter(d => d.type === 'fcp').length },
        { 'Department': 'FNQ', 'Records': allData.filter(d => d.type === 'fnq').length },
        { 'Department': 'Visitors', 'Records': allData.filter(d => d.type === 'visitors').length },
        { 'Department': 'Gate Pass', 'Records': allData.filter(d => d.type === 'gatepass').length },
        {},
        { 'Total Records': allData.length }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Create individual sheets for each department
    const types = ['fcp', 'fnq', 'visitors', 'gatepass'];
    const typeNames = { fcp: 'FCP', fnq: 'FNQ', visitors: 'Visitors', gatepass: 'Gate Pass' };
    
    types.forEach(type => {
        const typeData = allData.filter(d => d.type === type);
        if (typeData.length > 0) {
            const formattedData = formatDataForExcel(typeData, type);
            const ws = XLSX.utils.json_to_sheet(formattedData);
            
            // Set column widths
            if (formattedData.length > 0) {
                const colWidths = {};
                const columns = Object.keys(formattedData[0]);
                columns.forEach((col, index) => {
                    const maxLength = Math.max(
                        col.length,
                        ...formattedData.map(row => String(row[col] || '').length)
                    );
                    colWidths[XLSX.utils.encode_col(index)] = { wch: Math.min(maxLength + 2, 40) };
                });
                ws['!cols'] = Object.values(colWidths);
            }
            
            XLSX.utils.book_append_sheet(wb, ws, typeNames[type]);
        }
    });
    
    // Generate filename
    const filename = `History_Report_${fromDate}_to_${toDate}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Export daily report to Excel
function exportDailyReportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel library is loading. Please try again in a moment.');
        return;
    }
    
    const date = formatDate(new Date());
    const wb = XLSX.utils.book_new();
    
    // FCP Data
    const fcpData = getTodayData('fcp');
    if (fcpData.length > 0) {
        const fcpFormatted = formatDataForExcel(fcpData, 'fcp');
        const fcpWs = XLSX.utils.json_to_sheet(fcpFormatted);
        XLSX.utils.book_append_sheet(wb, fcpWs, 'FCP');
    }
    
    // FNQ Data
    const fnqData = getTodayData('fnq');
    if (fnqData.length > 0) {
        const fnqFormatted = formatDataForExcel(fnqData, 'fnq');
        const fnqWs = XLSX.utils.json_to_sheet(fnqFormatted);
        XLSX.utils.book_append_sheet(wb, fnqWs, 'FNQ');
    }
    
    // Visitors Data
    const visitorsData = getTodayData('visitors');
    if (visitorsData.length > 0) {
        const visitorsFormatted = formatDataForExcel(visitorsData, 'visitors');
        const visitorsWs = XLSX.utils.json_to_sheet(visitorsFormatted);
        XLSX.utils.book_append_sheet(wb, visitorsWs, 'Visitors');
    }
    
    // Gate Pass Data
    const gpData = getTodayData('gatepass');
    if (gpData.length > 0) {
        const gpFormatted = formatDataForExcel(gpData, 'gatepass');
        const gpWs = XLSX.utils.json_to_sheet(gpFormatted);
        XLSX.utils.book_append_sheet(wb, gpWs, 'Gate Pass');
    }
    
    // Summary sheet
    const summaryData = [
        { 'Report': 'Gate Management System - Daily Report' },
        { 'Date': date },
        { 'Generated': new Date().toLocaleString() },
        {},
        { 'Department': 'FCP', 'Records': fcpData.length },
        { 'Department': 'FNQ', 'Records': fnqData.length },
        { 'Department': 'Visitors', 'Records': visitorsData.length },
        { 'Department': 'Gate Pass', 'Records': gpData.length },
        {},
        { 'Total Records': fcpData.length + fnqData.length + visitorsData.length + gpData.length }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    const filename = `Daily_Report_${date}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// Export functions globally
window.exportToExcel = exportToExcel;
window.formatDataForExcel = formatDataForExcel;
window.exportHistoryToExcel = exportHistoryToExcel;
window.exportDailyReportToExcel = exportDailyReportToExcel;
