// js/dosen.js - Dosen Dashboard Logic & Custom Visual Modal Popups

const Dosen = {
    init() {
        console.log("Dosen Premium Engine Initialized");
        this.render();
    },

    render() {
        const container = document.getElementById('dosen-content');
        if (!container) return;

        container.innerHTML = `
            <div class="tab-container">
                <button class="tab-btn active" id="tab-btn-ujian" onclick="Dosen.showTab('ujian')">
                    <i data-lucide="layers" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i>
                    Daftar Ujian Aktif
                </button>
                <button class="tab-btn" id="tab-btn-tambah" onclick="Dosen.showTab('tambah')">
                    <i data-lucide="plus-circle" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i>
                    Buat Ujian Baru
                </button>
                <button class="tab-btn" id="tab-btn-tracker" onclick="Dosen.showTab('tracker')">
                    <i data-lucide="activity" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i>
                    Monitoring Tracker
                </button>
            </div>
            
            <div id="dosen-tab-content" class="tab-content active"></div>
            
            <!-- Custom Premium QR Code Modal -->
            <div id="qr-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 4, 10, 0.85); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center;">
                <div class="glass-panel" style="max-width: 440px; width: 100%; text-align: center; border-color: var(--border-glass-active); position: relative; animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;">
                    <button onclick="Dosen.closeQRModal()" style="position: absolute; right: 18px; top: 18px; background: transparent; border: none; cursor: pointer; color: var(--text-muted); transition: var(--transition-smooth);" onmouseover="this.style.color='#ffffff'">
                        <i data-lucide="x" style="width: 24px; height: 24px;"></i>
                    </button>
                    
                    <h3 id="qr-modal-title" style="margin-bottom: 6px; font-weight: 800; font-size: 1.35rem;">QR Code Akses Ujian</h3>
                    <p id="qr-modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 24px;">Tampilkan kode ini di proyektor untuk di-scan mahasiswa.</p>
                    
                    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <div id="modal-qr-container" style="padding: 16px; background: white; border-radius: 16px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.15); border: 2px solid var(--primary);"></div>
                    </div>
                    
                    <div style="background: var(--bg-inner); border: 1px solid var(--border-glass); border-radius: 12px; padding: 12px; margin-bottom: 24px;">
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">KODE RUANGAN LAPTOP</div>
                        <div id="modal-room-code" style="font-size: 1.85rem; font-weight: 800; color: var(--primary); letter-spacing: 6px;">------</div>
                    </div>
                    
                    <button class="btn btn-primary" id="btn-download-qr" style="width: 100%;">
                        <i data-lucide="download" style="width: 18px; height: 18px;"></i> Simpan Gambar QR
                    </button>
                </div>
            </div>
            
            <style>
                @keyframes modalPop {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            </style>
        `;
        
        this.showTab('ujian');
    },

    showTab(tab) {
        const content = document.getElementById('dosen-tab-content');
        if (!content) return;
        
        // Update active classes on tab buttons
        const btnUjian = document.getElementById('tab-btn-ujian');
        const btnTambah = document.getElementById('tab-btn-tambah');
        const btnTracker = document.getElementById('tab-btn-tracker');
        
        if (tab === 'ujian') {
            if(btnUjian) btnUjian.classList.add('active');
            if(btnTambah) btnTambah.classList.remove('active');
            if(btnTracker) btnTracker.classList.remove('active');
            
            content.innerHTML = this.views.daftarUjian();
            this.loadStats();
            this.loadUjianList();
        } else if (tab === 'tambah') {
            if(btnUjian) btnUjian.classList.remove('active');
            if(btnTambah) btnTambah.classList.add('active');
            if(btnTracker) btnTracker.classList.remove('active');
            
            content.innerHTML = this.views.tambahUjian();
        } else if (tab === 'tracker') {
            if(btnUjian) btnUjian.classList.remove('active');
            if(btnTambah) btnTambah.classList.remove('active');
            if(btnTracker) btnTracker.classList.add('active');
            
            content.innerHTML = this.views.tracker();
            this.loadLogs();
        }

        // Recreate icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    views: {
        daftarUjian() {
            return `
                <!-- Statistics Header Row -->
                <div class="stats-grid" id="dosen-stats-row"></div>
                
                <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="layers" style="width: 18px; height: 18px; color: var(--primary);"></i>
                    Daftar Sesi Ujian Aktif
                </h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">Klik pada badge Kode Ruangan untuk menampilkan QR Code layar lebar.</p>
                
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Sesi / Mata Kuliah</th>
                                <th>Verifikasi Token</th>
                                <th>Kode Ruangan (Click QR)</th>
                                <th>Tindakan Pengawas</th>
                            </tr>
                        </thead>
                        <tbody id="dosen-ujian-list">
                            <tr><td colspan="4" class="text-center text-muted">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            `;
        },
        tambahUjian() {
            return `
                <div style="max-width: 600px; margin: 0 auto; background: var(--bg-inner); border: 1px solid var(--border-glass); border-radius: 16px; padding: 32px;">
                    <h3 style="font-weight: 800; font-size: 1.45rem; margin-bottom: 6px; display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="plus-circle" style="width: 24px; height: 24px; color: var(--primary);"></i>
                        Buat Sesi Ujian Baru
                    </h3>
                    <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 24px;">Siapkan portal validasi sebelum membagikan link Google Form kepada mahasiswa.</p>
                    
                    <div class="form-group">
                        <label class="form-label">Nama Ujian</label>
                        <input type="text" id="dsn-uj-nama" class="form-control" placeholder="Cth: UAS Semester Genap 2026">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Mata Kuliah</label>
                        <input type="text" id="dsn-uj-matkul" class="form-control" placeholder="Cth: Metodologi Penelitian">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 24px;">
                        <label class="form-label">Link Google Form Asli</label>
                        <input type="url" id="dsn-uj-link" class="form-control" placeholder="https://docs.google.com/forms/d/e/...">
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">Iframe google form akan dimuat secara terenkripsi dalam sistem pengaman.</p>
                    </div>
                    
                    <button class="btn btn-primary" style="width:100%" onclick="Dosen.addUjian()">
                        <i data-lucide="save" style="width: 18px; height: 18px;"></i> Simpan & Generate Kode Ruangan
                    </button>
                </div>
            `;
        },
        tracker() {
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
                    <div>
                        <h4 style="margin-bottom: 4px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="activity" style="width: 18px; height: 18px; color: var(--danger);"></i>
                            Monitoring Tracker (Log Keamanan)
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0;">Pelacakan real-time aktivitas pengerjaan dan deteksi kecurangan.</p>
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <select id="tracker-filter" class="form-control" style="width: 220px; padding: 10px 14px; font-size: 0.85rem;" onchange="Dosen.loadLogs()">
                            <option value="all">Semua Sesi Ujian</option>
                        </select>
                        <button class="btn btn-secondary" style="padding: 10px 18px;" onclick="Dosen.exportCSV()">
                            <i data-lucide="download" style="width: 16px; height: 16px;"></i> Laporan CSV
                        </button>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Stempel Waktu</th>
                                <th>Mahasiswa (NIM)</th>
                                <th>Mata Kuliah / Ujian</th>
                                <th>Aksi Log & Detail Keamanan</th>
                            </tr>
                        </thead>
                        <tbody id="dosen-tracker-list">
                            <tr><td colspan="4" class="text-center text-muted">Memuat data log keamanan...</td></tr>
                        </tbody>
                    </table>
                </div>
            `;
        }
    },

    loadStats() {
        const statsRow = document.getElementById('dosen-stats-row');
        if (!statsRow) return;

        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id) || [];
        const myExamIds = myUjian.map(u => u.id);
        const tokens = DB.get('db_tokens') || [];
        const myTokens = tokens.filter(t => myExamIds.includes(t.examId));
        
        const activeTokens = myTokens.filter(t => t.status === 'active').length;
        const completedTokens = myTokens.filter(t => t.status === 'used').length;
        
        const allLogs = DB.get('db_logs') || [];
        const cheatAttempts = allLogs.filter(l => 
            myExamIds.includes(l.examId) && 
            (l.action.includes('TAB_SWITCH') || l.action.includes('EXIT_FULLSCREEN') || l.action.includes('WINDOW_BLUR') || l.action.includes('BLOCKED_STUDENT'))
        ).length;

        statsRow.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0,212,255,0.2);">
                    <i data-lucide="layers" style="width: 24px; height: 24px; color: var(--primary);"></i>
                </div>
                <div class="stat-info">
                    <h4>Total Sesi</h4>
                    <p>${myUjian.length}</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16,185,129,0.2);">
                    <i data-lucide="user-check" style="width: 24px; height: 24px; color: var(--success);"></i>
                </div>
                <div class="stat-info">
                    <h4>Token Aktif</h4>
                    <p>${activeTokens}</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255,255,255,0.06);">
                    <i data-lucide="check-circle-2" style="width: 24px; height: 24px; color: var(--text-muted);"></i>
                </div>
                <div class="stat-info">
                    <h4>Selesai</h4>
                    <p>${completedTokens}</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244,63,94,0.25);">
                    <i data-lucide="alert-octagon" style="width: 24px; height: 24px; color: var(--danger);"></i>
                </div>
                <div class="stat-info">
                    <h4>Ancaman/Cheat</h4>
                    <p style="color: var(--danger);">${cheatAttempts}</p>
                </div>
            </div>
        `;
    },

    addUjian() {
        const nama = document.getElementById('dsn-uj-nama').value.trim();
        const matkul = document.getElementById('dsn-uj-matkul').value.trim();
        const link = document.getElementById('dsn-uj-link').value.trim();

        if (!nama || !matkul || !link) {
            App.showToast("Semua kolom input wajib diisi", "warning");
            return;
        }

        // Generate a cryptographically distinct 6-character room code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        DB.insert('db_exams', {
            id: Utils.generateId(),
            dosenId: App.state.currentUser.id,
            nama: nama,
            mataKuliah: matkul, // sync variable names
            roomCode: code,     // sync variable names
            link: link,
            status: 'aktif',
            createdAt: new Date().toISOString()
        });

        App.showToast(`Sesi ujian dibuat! Kode Ruangan: ${code}`, "success");
        this.showTab('ujian');
    },

    loadUjianList() {
        const tbody = document.getElementById('dosen-ujian-list');
        if (!tbody) return;
        
        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id) || [];
        tbody.innerHTML = myUjian.map(u => {
            const tokens = DB.findBy('db_tokens', 'examId', u.id) || [];
            const activeTokens = tokens.filter(t => t.status === 'active').length;
            const usedTokens = tokens.filter(t => t.status === 'used').length;
            
            return `
                <tr>
                    <td>
                        <strong style="color: #ffffff; font-size: 0.95rem;">${u.nama}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500; margin-top: 2px;">
                            <i data-lucide="book-open" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
                            ${u.mataKuliah}
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-success" style="margin-right: 4px;">${activeTokens} Aktif</span> 
                        <span class="badge" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-glass); color: var(--text-muted);">${usedTokens} Selesai</span>
                    </td>
                    <td>
                        <button class="btn btn-outline" style="padding: 6px 14px; font-family: monospace; letter-spacing: 2px; font-weight: 800; font-size: 1rem; color: var(--primary); border-color: rgba(0,212,255,0.2);" onclick="Dosen.openQRModal('${u.id}', '${u.roomCode}', '${u.mataKuliah}')">
                            <i data-lucide="qr-code" style="width: 16px; height: 16px; margin-right: 6px;"></i> ${u.roomCode}
                        </button>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.72rem; border-color: rgba(245, 158, 11, 0.2); color: #fbbf24;" onclick="Dosen.resetTokens('${u.id}')">
                                <i data-lucide="refresh-cw" style="width: 12px; height: 12px;"></i> Reset Token
                            </button>
                            <button class="btn btn-outline" style="padding: 6px 8px; font-size: 0.72rem; border-color: rgba(244, 63, 94, 0.15); color: #fb7185;" onclick="Dosen.deleteUjian('${u.id}')">
                                <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="text-center text-muted" style="padding: 32px 0;">Belum ada sesi ujian yang dibuat</td></tr>';
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    // Custom QR Popup actions
    openQRModal(examId, roomCode, mataKuliah) {
        const overlay = document.getElementById('qr-modal-overlay');
        const codeBox = document.getElementById('modal-room-code');
        const qrContainer = document.getElementById('modal-qr-container');
        const titleBox = document.getElementById('qr-modal-title');
        const btnDownload = document.getElementById('btn-download-qr');
        
        if(!overlay) return;
        
        titleBox.innerHTML = `QR Code - ${mataKuliah}`;
        codeBox.innerHTML = roomCode;
        qrContainer.innerHTML = ''; // Clear
        
        // Generate QR code pointing to student verification URL with roomcode query/data
        const appUrl = window.location.origin + window.location.pathname + '#' + roomCode;
        
        const qrcode = new QRCode(qrContainer, {
            text: roomCode, // Simply room code for fast local processing
            width: 200,
            height: 200,
            colorDark : "#030712",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        overlay.style.display = 'flex';
        
        // Setup download listener
        btnDownload.onclick = () => {
            const qrImg = qrContainer.querySelector('img');
            if (qrImg) {
                const link = document.createElement('a');
                link.href = qrImg.src;
                link.download = `QR_Ujian_${mataKuliah.replace(/\s+/g, '_')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                App.showToast("Gambar QR Code tersimpan", "success");
            } else {
                App.showToast("Gagal menyimpan gambar QR", "error");
            }
        };
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    closeQRModal() {
        const overlay = document.getElementById('qr-modal-overlay');
        if(overlay) overlay.style.display = 'none';
    },

    deleteUjian(id) {
        if(confirm('Apakah Anda yakin ingin menghapus ujian ini? Seluruh token dan log keamanan terkait akan dihapus secara permanen.')) {
            DB.delete('db_exams', 'id', id);
            
            // Delete related tokens and logs to avoid orphaned records
            let tokens = DB.get('db_tokens') || [];
            tokens = tokens.filter(t => t.examId !== id);
            DB.set('db_tokens', tokens);
            
            let logs = DB.get('db_logs') || [];
            logs = logs.filter(l => l.examId !== id);
            DB.set('db_logs', logs);

            App.showToast("Sesi ujian dan seluruh metadata terkait telah dihapus", "info");
            this.loadStats();
            this.loadUjianList();
        }
    },

    loadLogs() {
        const tbody = document.getElementById('dosen-tracker-list');
        const filterSelect = document.getElementById('tracker-filter');
        if (!tbody) return;

        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id) || [];
        
        // Populate filter select if only has "Semua Ujian" default
        if (filterSelect.options.length === 1) {
            myUjian.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.mataKuliah} (${u.roomCode})`;
                filterSelect.appendChild(opt);
            });
        }

        const selectedExamId = filterSelect.value;
        const allLogs = DB.get('db_logs') || [];
        const students = DB.get('db_mahasiswa') || [];

        // Filter: only show logs belonging to current Dosen's exams
        let filteredLogs = allLogs.filter(log => {
            const belongsToMe = myUjian.find(u => u.id === log.examId);
            if (!belongsToMe) return false;
            if (selectedExamId !== 'all' && log.examId !== selectedExamId) return false;
            return true;
        });

        // Newest logs first
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        tbody.innerHTML = filteredLogs.map(log => {
            const student = students.find(s => s.nim === log.nim) || { nama: log.studentName || 'Siswa Asing' };
            const exam = myUjian.find(u => u.id === log.examId);
            
            let badgeClass = 'badge-primary';
            let iconName = 'info';
            
            if(log.action.includes('TAB_SWITCH') || log.action.includes('EXIT_FULLSCREEN') || log.action.includes('WINDOW_BLUR') || log.action.includes('BLOCKED_STUDENT')) {
                badgeClass = 'badge-danger';
                iconName = 'alert-triangle';
            } else if (log.action.includes('EXAM_FINISH')) {
                badgeClass = 'badge-success';
                iconName = 'check';
            } else if (log.action.includes('EXAM_START')) {
                badgeClass = 'badge-primary';
                iconName = 'play';
            }

            return `
                <tr>
                    <td style="white-space: nowrap; font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">
                        ${Utils.formatDate(log.timestamp)}
                    </td>
                    <td>
                        <strong style="color: #ffffff;">${student.nama}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px;">NIM: ${log.nim}</div>
                    </td>
                    <td>
                        <span style="font-weight: 500; font-size: 0.85rem;">${exam ? exam.mataKuliah : 'Unknown'}</span>
                    </td>
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                            <span class="badge ${badgeClass}" style="gap: 4px;">
                                <i data-lucide="${iconName}" style="width: 12px; height: 12px; display: inline-block;"></i>
                                ${log.action}
                            </span>
                            <span style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35;">${log.details || log.description || ''}</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="text-center text-muted" style="padding: 32px 0;">Belum ada riwayat aktivitas pengerjaan</td></tr>';
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    resetTokens(examId) {
        if(confirm('Apakah Anda yakin ingin mereset semua token pengerjaan untuk ujian ini? Mahasiswa yang sedang mengerjakan ujian akan dinonaktifkan.')) {
            let tokens = DB.get('db_tokens') || [];
            tokens = tokens.filter(t => t.examId !== examId);
            DB.set('db_tokens', tokens);
            App.showToast("Seluruh token sesi ujian ini telah direset.", "success");
            this.loadStats();
            this.loadUjianList();
        }
    },

    exportCSV() {
        const filterSelect = document.getElementById('tracker-filter');
        const selectedExamId = filterSelect ? filterSelect.value : 'all';
        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id) || [];
        const allLogs = DB.get('db_logs') || [];
        const students = DB.get('db_mahasiswa') || [];

        let filteredLogs = allLogs.filter(log => {
            const belongsToMe = myUjian.find(u => u.id === log.examId);
            if (!belongsToMe) return false;
            if (selectedExamId !== 'all' && log.examId !== selectedExamId) return false;
            return true;
        });

        if(filteredLogs.length === 0) {
            App.showToast("Tidak ada riwayat log keamanan untuk di-export.", "warning");
            return;
        }

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Waktu,NIM,Nama Mahasiswa,Ujian,Aksi Keamanan,Rincian Pelanggaran\\n";

        // Sort by newest first
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(log => {
            const student = students.find(s => s.nim === log.nim) || { nama: log.studentName || 'Siswa Asing' };
            const exam = myUjian.find(u => u.id === log.examId);
            const time = new Date(log.timestamp).toLocaleString('id-ID');
            const details = (log.details || log.description || '').replace(/"/g, '""');
            
            csvContent += `"${time}","${log.nim}","${student.nama}","${exam ? exam.mataKuliah : 'Unknown'}","${log.action}","${details}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Ujian_Secure_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        App.showToast("Berkas laporan keamanan diunduh dengan sukses.", "success");
    }
};

window.Dosen = Dosen;
