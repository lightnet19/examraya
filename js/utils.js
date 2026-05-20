// js/utils.js - Shared Utilities & Data Layer (Phase 2)

// --- Safe Storage Wrapper (falls back to memory if localStorage is blocked) ---
window.safeStorage = (() => {
    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return window.localStorage;
    } catch (e) {
        console.warn("localStorage is blocked or unavailable. Using in-memory fallback.");
        const store = {};
        return {
            getItem(key) { return store[key] || null; },
            setItem(key, val) { store[key] = String(val); },
            removeItem(key) { delete store[key]; },
            clear() { for(let k in store) delete store[k]; }
        };
    }
})();

// --- Database Layer (localStorage) ---
const DB = {
    collections: ['db_users', 'db_mahasiswa', 'db_exams', 'db_tokens', 'db_logs'],

    init() {
        console.log("Initializing Database...");
        this.collections.forEach(col => {
            if (!safeStorage.getItem(col)) {
                safeStorage.setItem(col, JSON.stringify([]));
            }
        });

        // Seed default Super Admin if db_users is empty
        const users = this.get('db_users');
        if (users.length === 0) {
            console.log("Seeding default Super Admin account...");
            this.insert('db_users', {
                id: Utils.generateId(),
                role: 'superadmin',
                username: 'admin',
                password: Utils.hash('admin123'),
                nama: 'Administrator Utama'
            });
        }

        // Auto-seed mock database if it's the very first load (prototype flat file seeding)
        const students = this.get('db_mahasiswa');
        const exams = this.get('db_exams');
        if (students.length === 0 && exams.length === 0) {
            console.log("Database is empty. Seeding complete mock prototype data...");
            this.seedMockData();
        }
    },

    get(collection) {
        try {
            return JSON.parse(safeStorage.getItem(collection)) || [];
        } catch (e) {
            console.error(`Error reading ${collection} from safeStorage`, e);
            return [];
        }
    },

    set(collection, data) {
        try {
            safeStorage.setItem(collection, JSON.stringify(data));
        } catch (e) {
            console.error(`Error writing ${collection} to safeStorage`, e);
        }
    },

    insert(collection, item) {
        const data = this.get(collection);
        data.push(item);
        this.set(collection, data);
        return item;
    },

    update(collection, idField, idValue, updates) {
        const data = this.get(collection);
        const index = data.findIndex(item => item[idField] === idValue);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.set(collection, data);
            return data[index];
        }
        return null;
    },

    delete(collection, idField, idValue) {
        let data = this.get(collection);
        data = data.filter(item => item[idField] !== idValue);
        this.set(collection, data);
    },
    
    findBy(collection, field, value) {
        const data = this.get(collection);
        return data.filter(item => item[field] === value);
    },
    
    findOneBy(collection, field, value) {
        const data = this.get(collection);
        return data.find(item => item[field] === value);
    },

    // Flat File Backup: Export all collections into a single JSON file
    exportDatabase() {
        const backup = {};
        this.collections.forEach(col => {
            backup[col] = this.get(col);
        });
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `examraya_flatdb_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.App && typeof window.App.showToast === 'function') {
            window.App.showToast('Database Flat File berhasil diekspor!', 'success');
        }
    },

    // Flat File Restore: Import all collections from a JSON string
    restoreDatabase(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            let restoredCount = 0;
            this.collections.forEach(col => {
                if (data[col] && Array.isArray(data[col])) {
                    this.set(col, data[col]);
                    restoredCount++;
                }
            });
            if (restoredCount > 0) {
                return { success: true, message: `Database flat file berhasil direstore! (${restoredCount} tabel dipulihkan)` };
            }
            return { success: false, message: 'Format data JSON tidak valid untuk database examRAYA.' };
        } catch (e) {
            return { success: false, message: 'Gagal membaca file JSON: ' + e.message };
        }
    },

    // Pre-seed mock data for premium prototype experience
    seedMockData() {
        // Retain or seed admin
        let adminUser = this.findOneBy('db_users', 'role', 'superadmin');
        if (!adminUser) {
            adminUser = {
                id: Utils.generateId(),
                role: 'superadmin',
                username: 'admin',
                password: Utils.hash('admin123'),
                nama: 'Administrator Utama'
            };
        }
        
        this.set('db_users', [
            adminUser,
            {
                id: 'dosen_1',
                role: 'dosen',
                username: 'dosen1',
                password: Utils.hash('dosen123'),
                nama: 'Dr. Ahmad Yani, M.Pd.',
                nidn: '0412038701'
            },
            {
                id: 'dosen_2',
                role: 'dosen',
                username: 'dosen2',
                password: Utils.hash('dosen123'),
                nama: 'Siti Aminah, M.Sc.',
                nidn: '0415089202'
            }
        ]);

        this.set('db_mahasiswa', [
            { id: 'mhs_1', nim: '2026001', nama: 'Budi Santoso', jurusan: 'Teknik Informatika', isEligible: true },
            { id: 'mhs_2', nim: '2026002', nama: 'Dewi Lestari', jurusan: 'Sistem Informasi', isEligible: true },
            { id: 'mhs_3', nim: '2026003', nama: 'Fahri Hamzah', jurusan: 'Pendidikan Agama Islam', isEligible: false },
            { id: 'mhs_4', nim: '2026004', nama: 'Indah Permatasari', jurusan: 'Teknik Informatika', isEligible: true },
            { id: 'mhs_5', nim: '2026005', nama: 'Rian Hidayat', jurusan: 'Sistem Informasi', isEligible: true }
        ]);

        this.set('db_exams', [
            {
                id: 'exam_1',
                code: 'MTK101',
                title: 'Ujian Tengah Semester - Matematika Diskrit',
                dosen: 'dosen1',
                dosenNama: 'Dr. Ahmad Yani, M.Pd.',
                formLink: 'https://docs.google.com/forms/d/e/1FAIpQLSf2u3M0GvyY3Z9vV_g772vI8wG9O4w49/viewform',
                createdAt: new Date().toISOString()
            },
            {
                id: 'exam_2',
                code: 'IND202',
                title: 'Ujian Akhir Semester - Bahasa Indonesia',
                dosen: 'dosen2',
                dosenNama: 'Siti Aminah, M.Sc.',
                formLink: 'https://docs.google.com/forms/d/e/1FAIpQLSdX4uBv0xN1U_PzQ/viewform',
                createdAt: new Date().toISOString()
            }
        ]);

        this.set('db_tokens', []);

        this.set('db_logs', [
            { id: 'log_1', examCode: 'MTK101', examTitle: 'Ujian Tengah Semester - Matematika Diskrit', nim: '2026001', nama: 'Budi Santoso', action: 'START_EXAM', details: 'Mahasiswa memulai ujian', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 'log_2', examCode: 'MTK101', examTitle: 'Ujian Tengah Semester - Matematika Diskrit', nim: '2026001', nama: 'Budi Santoso', action: 'TAB_SWITCH', details: 'Fokus browser berpindah ke tab/jendela lain', timestamp: new Date(Date.now() - 3000000).toISOString() },
            { id: 'log_3', examCode: 'MTK101', examTitle: 'Ujian Tengah Semester - Matematika Diskrit', nim: '2026002', nama: 'Dewi Lestari', action: 'START_EXAM', details: 'Mahasiswa memulai ujian', timestamp: new Date(Date.now() - 2500000).toISOString() },
            { id: 'log_4', examCode: 'MTK101', examTitle: 'Ujian Tengah Semester - Matematika Diskrit', nim: '2026001', nama: 'Budi Santoso', action: 'EXIT_FULLSCREEN', details: 'Layar penuh dinonaktifkan', timestamp: new Date(Date.now() - 2000000).toISOString() },
            { id: 'log_5', examCode: 'MTK101', examTitle: 'Ujian Tengah Semester - Matematika Diskrit', nim: '2026002', nama: 'Dewi Lestari', action: 'FINISH_EXAM', details: 'Mahasiswa menyelesaikan ujian', timestamp: new Date(Date.now() - 1000000).toISOString() }
        ]);
        
        return true;
    }
};

// --- General Utilities ---
const Utils = {
    // Generate simple random ID (e.g. 1629837482_A1B2)
    generateId() {
        return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    },

    // Simple Hash Function using CryptoJS (SHA-256)
    hash(text) {
        if (typeof CryptoJS !== 'undefined') {
            return CryptoJS.SHA256(text).toString();
        }
        // Fallback simple hash if CryptoJS not loaded (not recommended for production)
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },

    // Format Date to Locale (Indonesian)
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    
    // Copy Text to Clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            if(window.App && typeof window.App.showToast === 'function') {
                window.App.showToast('Teks disalin ke clipboard!', 'success');
            }
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
};

// Initialize DB when this script loads
DB.init();
