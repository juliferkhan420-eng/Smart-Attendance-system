// Smart Attendance System - Main JavaScript
// ============================================

// Local Storage Keys
const STORAGE_KEYS = {
    students: 'smartAttend_students',
    attendance: 'smartAttend_attendance',
    reports: 'smartAttend_reports'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadStudents();
    updateStatistics();
});

// Initialize App
function initializeApp() {
    console.log('Smart Attendance System initialized');
    
    // Add event listeners if elements exist
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', registerStudent);
    }

    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', markAttendance);
    }

    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
}

// ============================================
// Student Management Functions
// ============================================

function registerStudent() {
    const form = document.getElementById('studentForm');
    if (!form) return;

    const studentData = {
        id: document.getElementById('studentId')?.value || '',
        name: document.getElementById('studentName')?.value || '',
        department: document.getElementById('department')?.value || '',
        semester: document.getElementById('semester')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        photo: document.getElementById('profilePhoto')?.value || 'assets/images/default-avatar.png',
        registeredDate: new Date().toISOString()
    };

    // Validation
    if (!studentData.id || !studentData.name || !studentData.email) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    // Get existing students
    let students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    
    // Check for duplicate ID
    if (students.some(s => s.id === studentData.id)) {
        showAlert('Student ID already exists!', 'warning');
        return;
    }

    students.push(studentData);
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
    
    showAlert('Student registered successfully!', 'success');
    form.reset();
    loadStudents();
    updateStatistics();
}

function loadStudents() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    const studentList = document.getElementById('studentList');
    
    if (!studentList) return;

    if (students.length === 0) {
        studentList.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No students registered yet</td></tr>';
        return;
    }

    studentList.innerHTML = students.map((student, index) => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.semester}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function editStudent(studentId) {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        showAlert('Student not found', 'danger');
        return;
    }

    // Populate form with student data
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('department').value = student.department;
    document.getElementById('semester').value = student.semester;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    
    // Scroll to form
    document.getElementById('studentForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    let students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    students = students.filter(s => s.id !== studentId);
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
    
    showAlert('Student deleted successfully', 'success');
    loadStudents();
    updateStatistics();
}

function searchStudents() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    const studentList = document.getElementById('studentList');
    
    if (!studentList) return;

    const filtered = students.filter(s => 
        s.id.toLowerCase().includes(searchTerm) ||
        s.name.toLowerCase().includes(searchTerm) ||
        s.email.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        studentList.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No students found</td></tr>';
        return;
    }

    studentList.innerHTML = filtered.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.semester}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// Attendance Management Functions
// ============================================

function markAttendance() {
    const attendanceDate = document.getElementById('attendanceDate')?.value;
    const checkedStudents = document.querySelectorAll('input[name="attendance"]:checked');
    
    if (!attendanceDate) {
        showAlert('Please select a date', 'danger');
        return;
    }

    if (checkedStudents.length === 0) {
        showAlert('Please mark attendance for at least one student', 'warning');
        return;
    }

    let attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || [];
    
    checkedStudents.forEach(checkbox => {
        const studentId = checkbox.value;
        const status = checkbox.dataset.status;
        
        attendance.push({
            studentId: studentId,
            date: attendanceDate,
            status: status,
            time: new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString()
        });
    });

    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(attendance));
    showAlert('Attendance marked successfully!', 'success');
    loadAttendanceList();
    updateStatistics();
}

function loadAttendanceList() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    const attendanceContainer = document.getElementById('attendanceContainer');
    
    if (!attendanceContainer) return;

    if (students.length === 0) {
        attendanceContainer.innerHTML = '<p class="text-center text-muted">No students registered yet</p>';
        return;
    }

    const attendanceDate = document.getElementById('attendanceDate')?.value || new Date().toISOString().split('T')[0];
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || [];
    
    attendanceContainer.innerHTML = students.map(student => {
        const todayAttendance = attendance.find(a => a.studentId === student.id && a.date === attendanceDate);
        const status = todayAttendance?.status || 'not-marked';
        
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h6 class="mb-0">${student.name}</h6>
                            <small class="text-muted">${student.id} | ${student.department}</small>
                        </div>
                        <div class="col-md-6">
                            <div class="btn-group w-100" role="group">
                                <input type="radio" class="btn-check" name="status_${student.id}" id="present_${student.id}" value="present" ${status === 'present' ? 'checked' : ''}>
                                <label class="btn btn-outline-success" for="present_${student.id}">
                                    <i class="fas fa-check"></i> Present
                                </label>

                                <input type="radio" class="btn-check" name="status_${student.id}" id="absent_${student.id}" value="absent" ${status === 'absent' ? 'checked' : ''}>
                                <label class="btn btn-outline-danger" for="absent_${student.id}">
                                    <i class="fas fa-times"></i> Absent
                                </label>

                                <input type="radio" class="btn-check" name="status_${student.id}" id="late_${student.id}" value="late" ${status === 'late' ? 'checked' : ''}>
                                <label class="btn btn-outline-warning" for="late_${student.id}">
                                    <i class="fas fa-clock"></i> Late
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Reports Functions
// ============================================

function generateReport() {
    const reportType = document.getElementById('reportType')?.value || 'daily';
    const fromDate = document.getElementById('fromDate')?.value;
    const toDate = document.getElementById('toDate')?.value;

    if (!fromDate || !toDate) {
        showAlert('Please select date range', 'danger');
        return;
    }

    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || [];
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];

    let filtered = attendance.filter(a => a.date >= fromDate && a.date <= toDate);

    if (filtered.length === 0) {
        showAlert('No attendance records found for selected period', 'warning');
        return;
    }

    const reportData = generateReportData(filtered, students, reportType);
    displayReport(reportData, reportType, fromDate, toDate);
}

function generateReportData(attendance, students, reportType) {
    const reportData = [];

    students.forEach(student => {
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'present').length;
        const absent = studentAttendance.filter(a => a.status === 'absent').length;
        const late = studentAttendance.filter(a => a.status === 'late').length;
        const total = studentAttendance.length;
        const percentage = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(2) : 0;

        reportData.push({
            studentId: student.id,
            name: student.name,
            department: student.department,
            present: present,
            absent: absent,
            late: late,
            total: total,
            percentage: percentage
        });
    });

    return reportData;
}

function displayReport(reportData, reportType, fromDate, toDate) {
    const reportContainer = document.getElementById('reportContainer');
    if (!reportContainer) return;

    const reportHTML = `
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report (${fromDate} to ${toDate})</h5>
            </div>
            <div class="card-body">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Late</th>
                            <th>Total Days</th>
                            <th>Attendance %</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.map(r => `
                            <tr>
                                <td>${r.studentId}</td>
                                <td>${r.name}</td>
                                <td>${r.department}</td>
                                <td>${r.present}</td>
                                <td>${r.absent}</td>
                                <td>${r.late}</td>
                                <td>${r.total}</td>
                                <td>
                                    <span class="badge ${r.percentage >= 75 ? 'bg-success' : (r.percentage >= 50 ? 'bg-warning' : 'bg-danger')}">
                                        ${r.percentage}%
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    reportContainer.innerHTML = reportHTML;
}

function downloadReportPDF() {
    const reportTable = document.querySelector('.table');
    if (!reportTable) {
        showAlert('No report to download', 'warning');
        return;
    }

    const table = reportTable.outerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Attendance Report</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2>Attendance Report</h2>');
    printWindow.document.write(table);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// Statistics Functions
// ============================================

function updateStatistics() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || [];
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    
    const totalStudents = students.length;
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
    const attendancePercent = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;

    // Update DOM elements if they exist
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;

    const presentStudentsEl = document.getElementById('presentStudents');
    if (presentStudentsEl) presentStudentsEl.textContent = presentToday;

    const absentStudentsEl = document.getElementById('absentStudents');
    if (absentStudentsEl) absentStudentsEl.textContent = absentToday;

    const attendancePercentEl = document.getElementById('attendancePercent');
    if (attendancePercentEl) attendancePercentEl.textContent = attendancePercent + '%';
}

function loadAdminDashboard() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || [];

    // Calculate statistics
    const totalStudents = students.length;
    const totalRecords = attendance.length;
    const avgAttendance = calculateAverageAttendance(attendance, students);

    // Update dashboard
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        dashboardContent.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="stat-card">
                        <div class="stat-icon bg-primary"><i class="fas fa-users"></i></div>
                        <h3 class="stat-value">${totalStudents}</h3>
                        <p class="stat-label">Total Students</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <div class="stat-icon bg-info"><i class="fas fa-file-alt"></i></div>
                        <h3 class="stat-value">${totalRecords}</h3>
                        <p class="stat-label">Attendance Records</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <div class="stat-icon bg-success"><i class="fas fa-chart-pie"></i></div>
                        <h3 class="stat-value">${avgAttendance}%</h3>
                        <p class="stat-label">Avg Attendance</p>
                    </div>
                </div>
            </div>
        `;
    }
}

function calculateAverageAttendance(attendance, students) {
    if (students.length === 0) return 0;
    
    let totalPercentage = 0;
    students.forEach(student => {
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'present').length;
        const late = studentAttendance.filter(a => a.status === 'late').length;
        const total = studentAttendance.length;
        
        if (total > 0) {
            totalPercentage += ((present + late * 0.5) / total * 100);
        }
    });
    
    return (totalPercentage / students.length).toFixed(1);
}

// ============================================
// Utility Functions
// ============================================

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container-lg') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Export functions for global use
window.registerStudent = registerStudent;
window.loadStudents = loadStudents;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.searchStudents = searchStudents;
window.markAttendance = markAttendance;
window.generateReport = generateReport;
window.downloadReportPDF = downloadReportPDF;
window.loadAdminDashboard = loadAdminDashboard;
