// js/app.js - Main Application Logic & Routing

const App = {
    state: {
        currentRoute: 'home', // 'home', 'login', 'superadmin', 'dosen'
        userRole: null, // 'superadmin' or 'dosen'
        currentUser: null
    },

    init() {
        console.log("examRAYA Initialized");
        const session = safeStorage.getItem('active_session');
        if(session) {
            try {
                const s = JSON.parse(session);
                this.state.currentUser = s;
                this.state.userRole = s.role;
            } catch(e){}
        }

        this.setupRouter();
        this.renderView();
        
        // Initialize Icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    setupRouter() {
        // Listen to hash changes for simple routing
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'home';
            this.navigate(hash);
        });

        // Initialize route based on current hash
        const initialHash = window.location.hash.replace('#', '') || 'home';
        this.navigate(initialHash, false);
    },

    navigate(route, updateHash = true) {
        this.state.currentRoute = route;
        if (updateHash) {
            window.location.hash = route;
        }
        this.renderView();
    },

    renderView() {
        const container = document.getElementById('view-container');
        
        // Protect routes
        if (['superadmin', 'dosen'].includes(this.state.currentRoute)) {
            if (!this.state.userRole || this.state.userRole !== this.state.currentRoute) {
                this.navigate('login', true);
                return;
            }
        }
        
        // Protect exam route
        if (this.state.currentRoute === 'exam') {
            if (!safeStorage.getItem('active_exam_session')) {
                this.navigate('home', true);
                return;
            }
        }

        // Simple View Rendering
        switch(this.state.currentRoute) {
            case 'home':
                container.innerHTML = this.views.home();
                setTimeout(() => { if(window.Student) Student.initHome(); }, 0);
                break;
            case 'login':
                container.innerHTML = this.views.login();
                break;
            case 'superadmin':
                container.innerHTML = this.views.superadmin();
                setTimeout(() => { if(window.SuperAdmin) SuperAdmin.init(); }, 0);
                break;
            case 'dosen':
                container.innerHTML = this.views.dosen();
                setTimeout(() => { if(window.Dosen) Dosen.init(); }, 0);
                break;
            case 'exam':
                container.innerHTML = this.views.exam();
                setTimeout(() => { if(window.Exam) Exam.init(); }, 0);
                break;
            default:
                container.innerHTML = this.views.home();
        }

        // Re-init icons after render
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    // View Templates
    views: {
        home() {
            return `
                <div class="flex-center" style="min-height: 100vh; padding: 20px;">
                    <div class="glass-panel" style="max-width: 400px; width: 100%; text-align: center;" id="student-home-container">
                        <!-- Injected by student.js -->
                        Loading...
                    </div>
                </div>
            `;
        },
        login() {
            return `
                <div class="flex-center" style="min-height: 100vh; padding: 20px;">
                    <div class="glass-panel" style="max-width: 400px; width: 100%;">
                        <div class="text-center">
                            <i data-lucide="lock" style="width: 48px; height: 48px; color: var(--secondary); margin-bottom: 1rem;"></i>
                            <h2 style="margin-bottom: 5px;">examRAYA Dasbor</h2>
                            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 15px; color: var(--primary);">STAI Raden Abdullah Yaqin</p>
                            <p>Masuk sebagai Super Admin atau Dosen.</p>
                        </div>
                        
                        <div class="form-group mt-4">
                            <label class="form-label">Username</label>
                            <input type="text" id="login-username" class="form-control" placeholder="admin / NIDN / NUPTK dosen">
                        </div>
                        <div class="form-group mt-3">
                            <label class="form-label">Password</label>
                            <input type="password" id="login-password" class="form-control" placeholder="••••••••">
                        </div>
                        
                        <button class="btn btn-primary mt-3" style="width: 100%;" onclick="App.handleLogin()">
                            Masuk
                        </button>
                        
                        <div class="mt-4 text-center" style="font-size: 0.85rem;">
                            <button onclick="App.navigate('home')" class="btn btn-outline" style="width: 100%; border: none;">Kembali ke Awal</button>
                        </div>
                    </div>
                </div>
            `;
        },
        superadmin() {
            return `
                <div class="flex-center" style="min-height: 100vh; padding: 20px;">
                    <div class="glass-panel text-center" style="max-width: 600px; width: 100%;">
                        <i data-lucide="users" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
                        <h2>Dasbor Super Admin</h2>
                        <p class="mt-2 text-muted">Selamat datang, ${App.state.currentUser ? App.state.currentUser.name : 'Admin'}</p>
                        
                        <div class="mt-4 text-left" id="superadmin-content">
                            <!-- Injected by superadmin.js -->
                            Loading...
                        </div>
                        
                        <button onclick="App.logout()" class="btn btn-outline mt-4">Logout</button>
                    </div>
                </div>
            `;
        },
        dosen() {
            return `
                <div class="flex-center" style="min-height: 100vh; padding: 20px;">
                    <div class="glass-panel text-center" style="max-width: 600px; width: 100%;">
                        <i data-lucide="book-open" style="width: 48px; height: 48px; color: var(--secondary); margin-bottom: 1rem;"></i>
                        <h2>Dasbor Dosen</h2>
                        <p class="mt-2 text-muted">Selamat datang, ${App.state.currentUser ? App.state.currentUser.name : 'Dosen'}</p>
                        
                        <div class="mt-4 text-left" id="dosen-content">
                            <!-- Injected by dosen.js -->
                            Loading...
                        </div>

                        <button onclick="App.logout()" class="btn btn-outline mt-4">Logout</button>
                    </div>
                </div>
            `;
        },
        exam() {
            return `
                <div id="exam-container" style="width: 100vw; height: 100vh; background: #f8f9fa;">
                    <!-- Injected by exam.js -->
                    <div class="flex-center" style="height: 100%;">
                        Loading Exam...
                    </div>
                </div>
            `;
        }
    },

    // Auth Utilities
    handleLogin() {
        const userField = document.getElementById('login-username').value;
        const passField = document.getElementById('login-password').value;
        
        if(!userField || !passField) {
            this.showToast("Isi username dan password", "warning");
            return;
        }

        const hashedPass = Utils.hash(passField);
        const users = DB.get('db_users');
        const user = users.find(u => u.username === userField && u.password === hashedPass);

        if(user) {
            this.state.userRole = user.role;
            this.state.currentUser = {id: user.id, role: user.role, name: user.nama};
            
            // Store session
            safeStorage.setItem('active_session', JSON.stringify(this.state.currentUser));
            
            this.showToast(`Selamat datang, ${user.nama}`, "success");
            if(user.role === 'superadmin') {
                this.navigate('superadmin');
            } else if(user.role === 'dosen') {
                this.navigate('dosen');
            }
        } else {
            this.showToast("Username atau Password salah", "error");
        }
    },
    
    logout() {
        this.state.userRole = null;
        this.state.currentUser = null;
        safeStorage.removeItem('active_session');
        this.navigate('login');
    },

    // UI Utilities
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let icon = 'info';
        if (type === 'success') toast.style.borderLeftColor = 'var(--success)';
        if (type === 'error') toast.style.borderLeftColor = 'var(--danger)';
        if (type === 'warning') toast.style.borderLeftColor = 'var(--warning)';

        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        
        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Start App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
