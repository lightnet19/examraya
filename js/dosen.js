// js/dosen.js - Dosen Logic

const Dosen = {
    init() {
        console.log("Dosen module initialized");
        this.render();
    },

    render() {
        const container = document.getElementById('dosen-content');
        if (!container) return;

        container.innerHTML = `
            <div class="tabs flex" style="gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-primary" style="flex:1" onclick="Dosen.showTab('ujian')">Daftar Ujian</button>
                <button class="btn btn-primary" style="flex:1" onclick="Dosen.showTab('tambah')">Buat Ujian Baru</button>
                <button class="btn btn-warning" style="flex:1" onclick="Dosen.showTab('tracker')">Monitoring Tracker</button>
            </div>
            <div id="dosen-tab-content" style="animation: fadeIn 0.3s ease;"></div>
        `;
        
        this.showTab('ujian');
    },

    showTab(tab) {
        const content = document.getElementById('dosen-tab-content');
        if (tab === 'ujian') {
            content.innerHTML = this.views.daftarUjian();
            this.loadUjianList();
        } else if (tab === 'tambah') {
            content.innerHTML = this.views.tambahUjian();
        } else if (tab === 'tracker') {
            content.innerHTML = this.views.tracker();
            this.loadLogs();
        }
    },

    views: {
        daftarUjian() {
            return `
                <h3>Daftar Ujian Aktif</h3>
                <div style="overflow-x:auto;" class="mt-3">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <th class="p-2">Ujian (Matkul)</th>
                                <th class="p-2">Token / Info</th>
                                <th class="p-2">Kode Ruangan</th>
                                <th class="p-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="dosen-ujian-list"></tbody>
                    </table>
                </div>
            `;
        },
        tambahUjian() {
            return `
                <div class="card p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <h3>Buat Ujian Baru</h3>
                    <div class="form-group mt-3">
                        <label class="form-label">Nama Ujian</label>
                        <input type="text" id="dsn-uj-nama" class="form-control" placeholder="Cth: UTS Ganjil 2026">
                    </div>
                    <div class="form-group mt-2">
                        <label class="form-label">Mata Kuliah</label>
                        <input type="text" id="dsn-uj-matkul" class="form-control" placeholder="Cth: Algoritma dan Pemrograman">
                    </div>
                    <div class="form-group mt-2">
                        <label class="form-label">Link Google Form Asli</label>
                        <input type="url" id="dsn-uj-link" class="form-control" placeholder="https://docs.google.com/forms/d/...">
                    </div>
                    <button class="btn btn-success mt-4" style="width:100%" onclick="Dosen.addUjian()">+ Simpan Ujian Baru</button>
                </div>
            `;
        },
        tracker() {
            return `
                <h3>Monitoring Tracker (Log Keamanan)</h3>
                <div class="form-group mt-3 flex" style="max-width: 500px; gap: 10px;">
                    <select id="tracker-filter" class="form-control" style="flex: 1;" onchange="Dosen.loadLogs()">
                        <option value="all">Semua Ujian Anda</option>
                        <!-- Injected dynamically -->
                    </select>
                    <button class="btn btn-success" onclick="Dosen.exportCSV()"><i data-lucide="download" style="width: 16px; height: 16px; margin-right: 5px;"></i> Export CSV</button>
                </div>
                <div style="overflow-x:auto;" class="mt-3">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color);">
                                <th class="p-2">Waktu</th>
                                <th class="p-2">Mahasiswa (NIM)</th>
                                <th class="p-2">Ujian</th>
                                <th class="p-2">Aksi / Pelanggaran</th>
                            </tr>
                        </thead>
                        <tbody id="dosen-tracker-list"></tbody>
                    </table>
                </div>
            `;
        }
    },

    addUjian() {
        const nama = document.getElementById('dsn-uj-nama').value;
        const matkul = document.getElementById('dsn-uj-matkul').value;
        const link = document.getElementById('dsn-uj-link').value;

        if (!nama || !matkul || !link) {
            App.showToast("Semua field ujian wajib diisi", "warning");
            return;
        }

        // Generate 6 karakter random uppercase untuk Kode Ruangan
        const kodeRuangan = Math.random().toString(36).substr(2, 6).toUpperCase();
        
        DB.insert('db_exams', {
            id: Utils.generateId(),
            dosenId: App.state.currentUser.id,
            nama: nama,
            matkul: matkul,
            link: link,
            kodeRuangan: kodeRuangan,
            status: 'aktif',
            createdAt: new Date().toISOString()
        });

        App.showToast(`Ujian dibuat! Kode: ${kodeRuangan}`, "success");
        this.showTab('ujian');
    },

    loadUjianList() {
        const tbody = document.getElementById('dosen-ujian-list');
        if (!tbody) return;
        
        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id);
        tbody.innerHTML = myUjian.map(u => {
            const tokens = DB.findBy('db_tokens', 'examId', u.id);
            const activeTokens = tokens.filter(t => t.status === 'active').length;
            const usedTokens = tokens.filter(t => t.status === 'used').length;
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td class="p-2"><strong>${u.nama}</strong><br><span style="font-size: 0.8rem" class="text-muted">${u.matkul}</span></td>
                    <td class="p-2">
                        <span class="badge" style="background: var(--success);">${activeTokens} Aktif</span> 
                        <span class="badge" style="background: var(--text-muted);">${usedTokens} Selesai</span>
                    </td>
                    <td class="p-2"><span class="badge" style="background: var(--primary); padding: 4px 8px; font-size: 1rem; letter-spacing: 2px;">${u.kodeRuangan}</span></td>
                    <td class="p-2">
                        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="Dosen.resetTokens('${u.id}')">Reset Token</button>
                        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="Dosen.deleteUjian('${u.id}')">Hapus</button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="p-3 text-center text-muted">Belum ada ujian yang dibuat</td></tr>';
    },

    deleteUjian(id) {
        if(confirm('Yakin ingin menghapus ujian ini? Seluruh token dan log terkait mungkin akan menjadi yatim (orphaned).')) {
            DB.delete('db_exams', 'id', id);
            App.showToast("Ujian dihapus", "info");
            this.loadUjianList();
        }
    },

    loadLogs() {
        const tbody = document.getElementById('dosen-tracker-list');
        const filterSelect = document.getElementById('tracker-filter');
        if (!tbody) return;

        // Populate filter if empty
        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id);
        if (filterSelect.options.length === 1) {
            myUjian.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.matkul} (${u.kodeRuangan})`;
                filterSelect.appendChild(opt);
            });
        }

        const selectedExamId = filterSelect.value;
        const allLogs = DB.get('db_logs');
        const students = DB.get('db_mahasiswa');

        // Filter logs: only logs belonging to my exams, and optionally filtered by selected exam
        let filteredLogs = allLogs.filter(log => {
            const examBelongsToMe = myUjian.find(u => u.id === log.examId);
            if (!examBelongsToMe) return false;
            if (selectedExamId !== 'all' && log.examId !== selectedExamId) return false;
            return true;
        });

        // Sort by newest first
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        tbody.innerHTML = filteredLogs.map(log => {
            const student = students.find(s => s.nim === log.nim) || { nama: 'Unknown' };
            const exam = myUjian.find(u => u.id === log.examId);
            
            let actionColor = 'var(--text-color)';
            if(log.action.includes('EXIT_FULLSCREEN') || log.action.includes('TAB_SWITCH') || log.action.includes('WINDOW_BLUR')) {
                actionColor = 'var(--danger)';
            } else if (log.action.includes('EXAM_FINISH')) {
                actionColor = 'var(--success)';
            } else if (log.action.includes('EXAM_START')) {
                actionColor = 'var(--primary)';
            }

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td class="p-2" style="white-space: nowrap;">${Utils.formatDate(log.timestamp)}</td>
                    <td class="p-2"><strong>${student.nama}</strong><br><span class="text-muted">${log.nim}</span></td>
                    <td class="p-2">${exam ? exam.matkul : 'Unknown'}</td>
                    <td class="p-2" style="color: ${actionColor};">
                        <strong>${log.action}</strong><br>
                        <span style="font-size: 0.8rem; opacity: 0.8;">${log.description}</span>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="p-3 text-center text-muted">Belum ada catatan aktivitas.</td></tr>';
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    resetTokens(examId) {
        if(confirm('Yakin ingin mereset/menghapus semua token untuk ujian ini? Mahasiswa yang sedang ujian mungkin akan terputus.')) {
            let tokens = DB.get('db_tokens');
            tokens = tokens.filter(t => t.examId !== examId);
            DB.set('db_tokens', tokens);
            App.showToast("Semua token untuk ujian ini telah direset.", "success");
            this.loadUjianList();
        }
    },

    exportCSV() {
        const filterSelect = document.getElementById('tracker-filter');
        const selectedExamId = filterSelect ? filterSelect.value : 'all';
        const myUjian = DB.findBy('db_exams', 'dosenId', App.state.currentUser.id);
        const allLogs = DB.get('db_logs');
        const students = DB.get('db_mahasiswa');

        let filteredLogs = allLogs.filter(log => {
            const examBelongsToMe = myUjian.find(u => u.id === log.examId);
            if (!examBelongsToMe) return false;
            if (selectedExamId !== 'all' && log.examId !== selectedExamId) return false;
            return true;
        });

        if(filteredLogs.length === 0) {
            App.showToast("Tidak ada data log untuk di-export.", "warning");
            return;
        }

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Waktu,NIM,Nama Mahasiswa,Ujian,Aksi,Deskripsi\\n";

        // CSV Data
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(log => {
            const student = students.find(s => s.nim === log.nim) || { nama: 'Unknown' };
            const exam = myUjian.find(u => u.id === log.examId);
            const time = new Date(log.timestamp).toLocaleString('id-ID');
            
            // Escape quotes and wrap in quotes for safety
            const cleanDesc = log.description.replace(/"/g, '""');
            
            csvContent += `"${time}","${log.nim}","${student.nama}","${exam ? exam.matkul : 'Unknown'}","${log.action}","${cleanDesc}"\n`;
        });

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `laporan_pelanggaran_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        App.showToast("Laporan CSV berhasil diunduh.", "success");
    }
};

window.Dosen = Dosen;
