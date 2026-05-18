// js/superadmin.js - Super Admin Logic

const SuperAdmin = {
    init() {
        console.log("SuperAdmin module initialized");
        this.render();
    },

    render() {
        const container = document.getElementById('superadmin-content');
        if (!container) return;

        container.innerHTML = `
            <div class="tabs flex" style="gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-primary" style="flex:1" onclick="SuperAdmin.showTab('dosen')">Kelola Dosen</button>
                <button class="btn btn-primary" style="flex:1" onclick="SuperAdmin.showTab('mahasiswa')">Kelola Mahasiswa</button>
            </div>
            <div id="sa-tab-content"></div>
        `;
        
        // Show default tab
        this.showTab('dosen');
    },

    showTab(tab) {
        const content = document.getElementById('sa-tab-content');
        if (tab === 'dosen') {
            content.innerHTML = this.views.dosen();
            this.loadDosenList();
        } else if (tab === 'mahasiswa') {
            content.innerHTML = this.views.mahasiswa();
            this.loadMahasiswaList();
        }
    },

    // --- Dosen Management ---
    views: {
        dosen() {
            return `
                <div class="card p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <h3>Tambah Dosen Baru</h3>
                    <div class="form-group mt-2">
                        <input type="text" id="sa-dosen-nama" class="form-control" placeholder="Nama Lengkap">
                    </div>
                    <div class="form-group mt-2">
                        <input type="text" id="sa-dosen-username" class="form-control" placeholder="Username / NIDN / NUPTK">
                    </div>
                    <div class="form-group mt-2">
                        <input type="password" id="sa-dosen-password" class="form-control" placeholder="Password">
                    </div>
                    <button class="btn btn-success mt-3" onclick="SuperAdmin.addDosen()">+ Tambah Dosen</button>
                </div>

                <div class="mt-4">
                    <h3>Daftar Dosen</h3>
                    <div style="overflow-x:auto;" class="mt-2">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th class="p-2">Nama</th>
                                    <th class="p-2">Username</th>
                                    <th class="p-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="sa-dosen-list"></tbody>
                        </table>
                    </div>
                </div>
            `;
        },
        mahasiswa() {
            return `
                <div class="card p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div class="flex" style="justify-content: space-between; align-items: center;">
                        <h3>Tambah Mahasiswa Baru</h3>
                        <button class="btn btn-outline" style="font-size: 0.8rem;" onclick="App.showToast('Fitur Import CSV segera hadir', 'info')">Import CSV</button>
                    </div>
                    <div class="form-group mt-2">
                        <input type="text" id="sa-mhs-nim" class="form-control" placeholder="NIM">
                    </div>
                    <div class="form-group mt-2">
                        <input type="text" id="sa-mhs-nama" class="form-control" placeholder="Nama Lengkap">
                    </div>
                    <div class="form-group mt-2">
                        <input type="text" id="sa-mhs-jurusan" class="form-control" placeholder="Jurusan">
                    </div>
                    <button class="btn btn-success mt-3" onclick="SuperAdmin.addMahasiswa()">+ Tambah Mahasiswa</button>
                </div>

                <div class="mt-4">
                    <h3>Daftar Mahasiswa & Kelayakan</h3>
                    <div style="overflow-x:auto;" class="mt-2">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th class="p-2">NIM</th>
                                    <th class="p-2">Nama</th>
                                    <th class="p-2">Status Ujian</th>
                                    <th class="p-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="sa-mhs-list"></tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    },

    addDosen() {
        const nama = document.getElementById('sa-dosen-nama').value;
        const username = document.getElementById('sa-dosen-username').value;
        const pass = document.getElementById('sa-dosen-password').value;

        if (!nama || !username || !pass) {
            App.showToast("Semua field Dosen wajib diisi", "warning");
            return;
        }

        if (DB.findOneBy('db_users', 'username', username)) {
            App.showToast("Username sudah digunakan", "error");
            return;
        }

        DB.insert('db_users', {
            id: Utils.generateId(),
            role: 'dosen',
            username: username,
            password: Utils.hash(pass),
            nama: nama
        });

        App.showToast("Dosen berhasil ditambahkan", "success");
        this.showTab('dosen'); // Refresh
    },

    loadDosenList() {
        const tbody = document.getElementById('sa-dosen-list');
        if (!tbody) return;
        
        const dosens = DB.findBy('db_users', 'role', 'dosen');
        tbody.innerHTML = dosens.map(d => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td class="p-2">${d.nama}</td>
                <td class="p-2">${d.username}</td>
                <td class="p-2">
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="SuperAdmin.deleteUser('${d.id}')">Hapus</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="p-3 text-center text-muted">Belum ada data dosen</td></tr>';
    },

    addMahasiswa() {
        const nim = document.getElementById('sa-mhs-nim').value;
        const nama = document.getElementById('sa-mhs-nama').value;
        const jurusan = document.getElementById('sa-mhs-jurusan').value;

        if (!nim || !nama || !jurusan) {
            App.showToast("Semua field Mahasiswa wajib diisi", "warning");
            return;
        }

        if (DB.findOneBy('db_mahasiswa', 'nim', nim)) {
            App.showToast("NIM sudah terdaftar", "error");
            return;
        }

        DB.insert('db_mahasiswa', {
            id: Utils.generateId(),
            nim: nim,
            nama: nama,
            jurusan: jurusan,
            isEligible: true // Default Layak
        });

        App.showToast("Mahasiswa berhasil ditambahkan", "success");
        this.showTab('mahasiswa'); // Refresh
    },

    loadMahasiswaList() {
        const tbody = document.getElementById('sa-mhs-list');
        if (!tbody) return;
        
        const mhsList = DB.get('db_mahasiswa');
        tbody.innerHTML = mhsList.map(m => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td class="p-2">${m.nim}</td>
                <td class="p-2">${m.nama}</td>
                <td class="p-2">
                    <span class="badge" style="background: ${m.isEligible ? 'var(--success)' : 'var(--danger)'}; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">
                        ${m.isEligible ? 'Layak' : 'Diblokir'}
                    </span>
                </td>
                <td class="p-2">
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 5px;" onclick="SuperAdmin.toggleEligibility('${m.id}', ${!m.isEligible})">
                        ${m.isEligible ? 'Blokir' : 'Izinkan'}
                    </button>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="SuperAdmin.deleteMahasiswa('${m.id}')">Hapus</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4" class="p-3 text-center text-muted">Belum ada data mahasiswa</td></tr>';
    },

    toggleEligibility(id, newStatus) {
        DB.update('db_mahasiswa', 'id', id, { isEligible: newStatus });
        App.showToast(`Status kelayakan diperbarui`, "success");
        this.loadMahasiswaList();
    },

    deleteUser(id) {
        if(confirm('Yakin ingin menghapus dosen ini?')) {
            DB.delete('db_users', 'id', id);
            App.showToast("Data dihapus", "info");
            this.loadDosenList();
        }
    },

    deleteMahasiswa(id) {
        if(confirm('Yakin ingin menghapus mahasiswa ini?')) {
            DB.delete('db_mahasiswa', 'id', id);
            App.showToast("Data dihapus", "info");
            this.loadMahasiswaList();
        }
    }
};

// Auto-init for global object if already defined
window.SuperAdmin = SuperAdmin;
