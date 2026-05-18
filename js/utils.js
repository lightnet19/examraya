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
