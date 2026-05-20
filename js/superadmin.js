// js/superadmin.js - Super Admin Controller & Management Views

const SuperAdmin = {
    init() {
        console.log("SuperAdmin Premium Module Initialized");
        this.render();
    },

    render() {
        const container = document.getElementById('superadmin-content');
        if (!container) return;

        container.innerHTML = `
            <div class="tab-container">
                <button class="tab-btn active" id="tab-btn-dosen" onclick="SuperAdmin.showTab('dosen')">
                    <i data-lucide="users" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i>
                    Kelola Akun Dosen
                </button>
                <button class="tab-btn" id="tab-btn-mahasiswa" onclick="SuperAdmin.showTab('mahasiswa')">
                    <i data-lucide="graduation-cap" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i>
                    Kelola Mahasiswa
                </button>
                <button class="tab-btn" id="tab-btn-database" onclick="SuperAdmin.showTab('database')">
                    <i data-lucide="database" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i>
                    Flat-File Database
                </button>
            </div>
            
            <div id="sa-tab-content" class="tab-content active"></div>
        `;
        
        // Show default tab
        this.showTab('dosen');
    },

    showTab(tab) {
        const content = document.getElementById('sa-tab-content');
        if (!content) return;
        
        // Update active tab buttons visual
        const btnDosen = document.getElementById('tab-btn-dosen');
        const btnMhs = document.getElementById('tab-btn-mahasiswa');
        const btnDB = document.getElementById('tab-btn-database');
        
        if (btnDosen) btnDosen.classList.remove('active');
        if (btnMhs) btnMhs.classList.remove('active');
        if (btnDB) btnDB.classList.remove('active');
        
        if (tab === 'dosen') {
            if(btnDosen) btnDosen.classList.add('active');
            content.innerHTML = this.views.dosen();
            this.loadDosenList();
        } else if (tab === 'mahasiswa') {
            if(btnMhs) btnMhs.classList.add('active');
            content.innerHTML = this.views.mahasiswa();
            this.loadMahasiswaList();
        } else if (tab === 'database') {
            if(btnDB) btnDB.classList.add('active');
            content.innerHTML = this.views.database();
            this.loadDatabaseStats();
        }

        // Recreate icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    // UI View Generators
    views: {
        dosen() {
            return `
                <div class="grid-2">
                    <!-- Left: Form to Add Dosen -->
                    <div style="background: var(--bg-inner); border: 1px solid var(--border-glass); border-radius: 12px; padding: 24px;">
                        <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="user-plus" style="width: 18px; height: 18px; color: var(--primary);"></i>
                            Tambah Dosen Baru
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">Daftarkan username pendidik baru ke dalam sistem portal.</p>
                        
                        <div class="form-group">
                            <label class="form-label">Nama Lengkap</label>
                            <input type="text" id="sa-dosen-nama" class="form-control" placeholder="Nama Lengkap Dosen">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Username / NIDN</label>
                            <input type="text" id="sa-dosen-username" class="form-control" placeholder="Username / NIDN Dosen">
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label">Password Akses</label>
                            <input type="password" id="sa-dosen-password" class="form-control" placeholder="Min. 6 karakter">
                        </div>
                        
                        <button class="btn btn-primary" style="width: 100%;" onclick="SuperAdmin.addDosen()">
                            <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Daftarkan Dosen
                        </button>
                    </div>
                    
                    <!-- Right: Table List of Dosen -->
                    <div>
                        <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="list" style="width: 18px; height: 18px; color: var(--primary);"></i>
                            Daftar Dosen Terdaftar
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">Total akun pengawas dan dosen mata kuliah yang aktif.</p>
                        
                        <div class="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nama Lengkap</th>
                                        <th>NIDN / Username</th>
                                        <th>Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody id="sa-dosen-list">
                                    <tr><td colspan="3" class="text-center text-muted">Memuat data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        },
        mahasiswa() {
            return `
                <div class="grid-2">
                    <!-- Left: Form to Add Student -->
                    <div style="background: var(--bg-inner); border: 1px solid var(--border-glass); border-radius: 12px; padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <h4 style="font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 0;">
                                <i data-lucide="user-plus" style="width: 18px; height: 18px; color: var(--secondary);"></i>
                                Input Mahasiswa
                            </h4>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.72rem; border-color: rgba(124, 58, 237, 0.3); color: #c084fc;" onclick="App.showToast('Impor CSV dapat disinkronkan dengan CSV Siakad!', 'info')">
                                <i data-lucide="file-spreadsheet" style="width: 12px; height: 12px;"></i> CSV Siakad
                            </button>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">Daftarkan NIM mahasiswa ujian dan pasang status kelayakan.</p>
                        
                        <div class="form-group">
                            <label class="form-label">NIM (Nomor Induk)</label>
                            <input type="text" id="sa-mhs-nim" class="form-control" placeholder="NIM Mahasiswa">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nama Lengkap</label>
                            <input type="text" id="sa-mhs-nama" class="form-control" placeholder="Nama Lengkap Sesuai KTM">
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label">Program Studi / Jurusan</label>
                            <input type="text" id="sa-mhs-jurusan" class="form-control" placeholder="Jurusan Mahasiswa">
                        </div>
                        
                        <button class="btn btn-secondary" style="width: 100%;" onclick="SuperAdmin.addMahasiswa()">
                            <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Daftarkan Mahasiswa
                        </button>
                    </div>
                    
                    <!-- Right: Table List of Student -->
                    <div>
                        <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="list" style="width: 18px; height: 18px; color: var(--secondary);"></i>
                            Daftar Mahasiswa & Administrasi
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">Gunakan tombol status untuk melarang atau mengizinkan ujian.</p>
                        
                        <div class="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>NIM</th>
                                        <th>Nama Lengkap</th>
                                        <th>Status Ujian</th>
                                        <th>Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody id="sa-mhs-list">
                                    <tr><td colspan="4" class="text-center text-muted">Memuat data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        },
        database() {
            return `
                <div class="grid-2">
                    <!-- Left Panel: Flat File Controls -->
                    <div style="background: var(--bg-inner); border: 1px solid var(--border-glass); border-radius: 12px; padding: 24px;">
                        <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="file-json" style="width: 18px; height: 18px; color: var(--primary);"></i>
                            Ekspor & Impor Database (JSON)
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 24px;">
                            Simpan data prototype dalam format flat file (.json) lokal. Data dapat dipulihkan atau dipindahkan ke perangkat lain dengan mudah.
                        </p>
                        
                        <!-- Backup / Export Section -->
                        <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <h5 style="margin-bottom: 8px; font-weight: 600; color: #fff; font-size: 0.9rem;">1. Unduh Flat-File Database</h5>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Unduh semua data (Mahasiswa, Dosen, Ujian, dan Log Pelanggaran) ke file JSON tunggal.</p>
                            <button class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="DB.exportDatabase()">
                                <i data-lucide="download" style="width: 16px; height: 16px;"></i> Ekspor Ke File JSON
                            </button>
                        </div>
                        
                        <!-- Restore / Import Section -->
                        <div style="margin-bottom: 12px;">
                            <h5 style="margin-bottom: 8px; font-weight: 600; color: #fff; font-size: 0.9rem;">2. Pulihkan Dari Flat-File Database</h5>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Unggah file JSON backup examRAYA untuk menimpa data saat ini.</p>
                            
                            <div class="form-group" style="margin-bottom: 16px;">
                                <label class="form-label" style="display: inline-block; cursor: pointer; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 16px; width: 100%; text-align: center; color: var(--text-muted); font-size: 0.8rem;" id="sa-db-upload-label">
                                    <i data-lucide="upload-cloud" style="width: 20px; height: 20px; margin: 0 auto 6px; display: block; color: var(--text-muted);"></i>
                                    <span>Pilih file .json database...</span>
                                    <input type="file" id="sa-db-file" accept=".json" style="display: none;" onchange="SuperAdmin.handleDatabaseFileSelect(this)">
                                </label>
                            </div>
                            
                            <button class="btn btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="SuperAdmin.restoreDatabase()">
                                <i data-lucide="refresh-cw" style="width: 16px; height: 16px;"></i> Pulihkan Data Sekarang
                            </button>
                        </div>
                    </div>
                    
                    <!-- Right Panel: Database Status & Prototype Control -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <!-- Mock Database Info -->
                        <div style="background: var(--bg-inner); border: 1px solid var(--border-glass); border-radius: 12px; padding: 24px;">
                            <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="bar-chart-2" style="width: 18px; height: 18px; color: var(--secondary);"></i>
                                Ringkasan Database Lokal
                            </h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">Data saat ini disimpan dalam sandbox safeStorage browser.</p>
                            
                            <div id="sa-db-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                <!-- Loaded via JS -->
                            </div>
                        </div>

                        <!-- Reset & Prototype Seeding -->
                        <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px; padding: 24px;">
                            <h4 style="margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: #f87171;">
                                <i data-lucide="alert-triangle" style="width: 18px; height: 18px; color: #f87171;"></i>
                                Reset & Seed Data Demo
                            </h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                                Sangat berguna untuk pengujian prototype. Menghapus data saat ini dan mengisi ulang dengan data dosen, mahasiswa, ujian, dan log pelanggaran contoh.
                            </p>
                            <button class="btn btn-outline" style="width: 100%; border-color: rgba(239, 68, 68, 0.3); color: #f87171;" onclick="SuperAdmin.resetAndSeedDemo()">
                                <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i> Muat Ulang Data Demo Prototype
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Save Dosen
    addDosen() {
        const nama = document.getElementById('sa-dosen-nama').value.trim();
        const username = document.getElementById('sa-dosen-username').value.trim();
        const pass = document.getElementById('sa-dosen-password').value.trim();

        if (!nama || !username || !pass) {
            App.showToast("Semua kolom Dosen wajib diisi", "warning");
            return;
        }

        if (DB.findOneBy('db_users', 'username', username)) {
            App.showToast("Username / NIDN Dosen sudah digunakan", "error");
            return;
        }

        DB.insert('db_users', {
            id: Utils.generateId(),
            role: 'dosen',
            username: username,
            password: Utils.hash(pass),
            nama: nama
        });

        App.showToast(`Dosen ${nama} berhasil didaftarkan`, "success");
        this.showTab('dosen');
    },

    loadDosenList() {
        const tbody = document.getElementById('sa-dosen-list');
        if (!tbody) return;
        
        const dosens = DB.findBy('db_users', 'role', 'dosen');
        tbody.innerHTML = dosens.map(d => `
            <tr>
                <td style="font-weight: 600; color: #ffffff;">${d.nama}</td>
                <td><code style="color: var(--primary); font-size: 0.85rem; font-weight: 600;">${d.username}</code></td>
                <td>
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.72rem; border-color: rgba(244, 63, 94, 0.2); color: #fb7185;" onclick="SuperAdmin.deleteUser('${d.id}')">
                        <i data-lucide="trash-2" style="width: 12px; height: 12px; display: inline-block;"></i> Hapus
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="text-center text-muted" style="padding: 24px 0;">Belum ada data dosen terdaftar</td></tr>';
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    // Save Student
    addMahasiswa() {
        const nim = document.getElementById('sa-mhs-nim').value.trim();
        const nama = document.getElementById('sa-mhs-nama').value.trim();
        const jurusan = document.getElementById('sa-mhs-jurusan').value.trim();

        if (!nim || !nama || !jurusan) {
            App.showToast("Semua kolom mahasiswa wajib diisi", "warning");
            return;
        }

        if (DB.findOneBy('db_mahasiswa', 'nim', nim)) {
            App.showToast("NIM Mahasiswa sudah terdaftar di sistem", "error");
            return;
        }

        DB.insert('db_mahasiswa', {
            id: Utils.generateId(),
            nim: nim,
            nama: nama,
            jurusan: jurusan,
            isEligible: true // Default Layak
        });

        App.showToast(`Mahasiswa ${nama} didaftarkan`, "success");
        this.showTab('mahasiswa');
    },

    loadMahasiswaList() {
        const tbody = document.getElementById('sa-mhs-list');
        if (!tbody) return;
        
        const mhsList = DB.get('db_mahasiswa') || [];
        tbody.innerHTML = mhsList.map(m => {
            const isEligible = m.isEligible !== false && m.eligible !== false;
            return `
                <tr>
                    <td><strong style="color: var(--text-main);">${m.nim}</strong></td>
                    <td style="font-weight: 500; color: #ffffff;">
                        ${m.nama}
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 400; margin-top: 2px;">${m.jurusan || '-'}</div>
                    </td>
                    <td>
                        <span class="badge ${isEligible ? 'badge-success' : 'badge-danger'}">
                            ${isEligible ? 'Layak' : 'Diblokir'}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.72rem; border-color: ${isEligible ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${isEligible ? '#fb7185' : '#34d399'}" onclick="SuperAdmin.toggleEligibility('${m.id}', ${!isEligible})">
                                <i data-lucide="${isEligible ? 'slash' : 'check-circle'}" style="width: 12px; height: 12px; display: inline-block;"></i> ${isEligible ? 'Blokir' : 'Izinkan'}
                            </button>
                            <button class="btn btn-outline" style="padding: 6px 8px; font-size: 0.72rem; border-color: rgba(255,255,255,0.06);" onclick="SuperAdmin.deleteMahasiswa('${m.id}')">
                                <i data-lucide="trash-2" style="width: 12px; height: 12px; display: inline-block;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="text-center text-muted" style="padding: 24px 0;">Belum ada data mahasiswa terdaftar</td></tr>';
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    toggleEligibility(id, newStatus) {
        DB.update('db_mahasiswa', 'id', id, { isEligible: newStatus });
        App.showToast(`Status kelayakan ujian diperbarui`, "success");
        this.loadMahasiswaList();
    },

    deleteUser(id) {
        if(confirm('Apakah Anda yakin ingin menghapus data dosen ini?')) {
            DB.delete('db_users', 'id', id);
            App.showToast("Data Dosen telah dihapus", "info");
            this.loadDosenList();
        }
    },

    deleteMahasiswa(id) {
        if(confirm('Apakah Anda yakin ingin menghapus data mahasiswa ini?')) {
            DB.delete('db_mahasiswa', 'id', id);
            App.showToast("Data Mahasiswa telah dihapus", "info");
            this.loadMahasiswaList();
        }
    },

    loadDatabaseStats() {
        const statsContainer = document.getElementById('sa-db-stats');
        if (!statsContainer) return;

        const users = DB.get('db_users');
        const dosenCount = users.filter(u => u.role === 'dosen').length;
        const adminCount = users.filter(u => u.role === 'superadmin').length;
        const mhsCount = DB.get('db_mahasiswa').length;
        const examCount = DB.get('db_exams').length;
        const logCount = DB.get('db_logs').length;

        statsContainer.innerHTML = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <div style="font-size: 0.72rem; color: var(--text-muted);">Akun Dosen / Admin</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-top: 4px;">${dosenCount} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">/ ${adminCount}</span></div>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <div style="font-size: 0.72rem; color: var(--text-muted);">Data Mahasiswa</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary); margin-top: 4px;">${mhsCount}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <div style="font-size: 0.72rem; color: var(--text-muted);">Ruang Ujian</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #34d399; margin-top: 4px;">${examCount}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <div style="font-size: 0.72rem; color: var(--text-muted);">Log Pelanggaran</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #f87171; margin-top: 4px;">${logCount}</div>
            </div>
        `;
    },

    handleDatabaseFileSelect(input) {
        const file = input.files[0];
        const label = document.getElementById('sa-db-upload-label');
        if (file && label) {
            label.querySelector('span').innerText = file.name;
            label.style.borderColor = 'var(--primary)';
            label.style.color = '#ffffff';
        }
    },

    restoreDatabase() {
        const fileInput = document.getElementById('sa-db-file');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            App.showToast("Silakan pilih file JSON database terlebih dahulu", "warning");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const contents = e.target.result;
            const res = DB.restoreDatabase(contents);
            if (res.success) {
                App.showToast(res.message, "success");
                setTimeout(() => {
                    location.reload(); // Refresh app to load restored database state
                }, 1000);
            } else {
                App.showToast(res.message, "error");
            }
        };
        reader.readAsText(file);
    },

    resetAndSeedDemo() {
        if (confirm("Perhatian! Tindakan ini akan menghapus database saat ini dan mengisi ulang dengan data contoh prototype. Apakah Anda yakin?")) {
            DB.seedMockData();
            App.showToast("Database berhasil di-reset ke data demo prototype!", "success");
            setTimeout(() => {
                location.reload(); // Refresh to re-initialize UI with new mock data
            }, 1000);
        }
    }
};

window.SuperAdmin = SuperAdmin;
