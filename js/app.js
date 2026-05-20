// js/app.js - Main Application Logic, Navigation & Toast System

const App = {
    state: {
        currentRoute: 'home', // 'home', 'login', 'superadmin', 'dosen'
        userRole: null, // 'superadmin' or 'dosen'
        currentUser: null
    },

    init() {
        console.log("examRAYA Premium Engine Initialized");
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
 
        // Render view templates with polished premium designs
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

    // Premium HTML View Templates
    views: {
        home() {
            return `
                <div class="flex-center" style="min-height: 100vh; padding: 24px; position: relative;">
                    <!-- Ambient Light Blobs -->
                    <div style="position: absolute; width: 300px; height: 300px; background: rgba(0, 212, 255, 0.08); filter: blur(80px); top: 15%; left: 10%; pointer-events: none;"></div>
                    <div style="position: absolute; width: 300px; height: 300px; background: rgba(124, 58, 237, 0.08); filter: blur(80px); bottom: 15%; right: 10%; pointer-events: none;"></div>
                    
                    <div class="glass-panel" style="max-width: 440px; width: 100%; text-align: center;" id="student-home-container">
                        <!-- Injected by student.js -->
                        <div class="flex-center" style="flex-direction: column; padding: 40px 0;">
                            <div style="width: 50px; height: 50px; border: 3px solid rgba(0,212,255,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <p style="margin-top: 16px; color: var(--text-muted);">Memuat portal examRAYA...</p>
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes spin { to { transform: rotate(360deg); } }
                </style>
            `;
        },
        login() {
            return `
                <div class="flex-center" style="min-height: 100vh; padding: 24px; position: relative;">
                    <!-- Ambient Light Blobs -->
                    <div style="position: absolute; width: 250px; height: 250px; background: rgba(124, 58, 237, 0.08); filter: blur(70px); top: 20%; left: 20%; pointer-events: none;"></div>
                    <div style="position: absolute; width: 250px; height: 250px; background: rgba(0, 212, 255, 0.08); filter: blur(70px); bottom: 20%; right: 20%; pointer-events: none;"></div>

                    <div class="glass-panel" style="max-width: 420px; width: 100%;">
                        <div class="text-center" style="margin-bottom: 28px;">
                            <div style="display: inline-flex; width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(124, 58, 237, 0.15)); align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid var(--border-glass-active);">
                                <i data-lucide="lock" style="width: 28px; height: 28px; color: var(--primary);"></i>
                            </div>
                            <h2 style="margin-bottom: 4px; font-weight: 800;">examRAYA Dasbor</h2>
                            <p style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">STAI Raden Abdullah Yaqin</p>
                            <p style="font-size: 0.875rem;">Silakan masuk untuk mengelola portal ujian secure.</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <div style="position: relative;">
                                <i data-lucide="user" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #4b5563;"></i>
                                <input type="text" id="login-username" class="form-control" style="padding-left: 48px;" placeholder="admin / NIDN Dosen">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 24px;">
                            <label class="form-label">Password</label>
                            <div style="position: relative;">
                                <i data-lucide="key-round" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #4b5563;"></i>
                                <input type="password" id="login-password" class="form-control" style="padding-left: 48px;" placeholder="••••••••">
                            </div>
                        </div>
                        
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 16px;" onclick="App.handleLogin()">
                            <i data-lucide="log-in" style="width: 18px; height: 18px;"></i> Masuk Dasbor
                        </button>
                        
                        <div style="text-center">
                            <button onclick="App.navigate('home')" class="btn btn-outline" style="width: 100%; border: 1px solid transparent; background: transparent;">
                                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Halaman Ujian Mahasiswa
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        superadmin() {
            return `
                <div style="min-height: 100vh; padding: 24px 16px; max-width: 1100px; width: 100%; margin: 0 auto;">
                    <!-- Admin Header Nav -->
                    <div class="glass-panel" style="padding: 16px 24px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="display: flex; width: 42px; height: 42px; border-radius: 10px; background: rgba(0, 212, 255, 0.1); border: 1px solid var(--border-glass-active); align-items: center; justify-content: center;">
                                <i data-lucide="shield" style="width: 22px; height: 22px; color: var(--primary);"></i>
                            </div>
                            <div>
                                <h3 style="font-weight: 800; font-size: 1.15rem; margin-bottom: 0;">examRAYA</h3>
                                <p style="font-size: 0.72rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0;">Super Admin Access</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <p style="font-size: 0.85rem; margin-bottom: 0; display: inline-flex; align-items: center; gap: 8px;">
                                <i data-lucide="user-check" style="width: 16px; height: 16px; color: var(--success);"></i>
                                Hi, <strong style="color: #ffffff;">${App.state.currentUser ? App.state.currentUser.name : 'SuperAdmin'}</strong>
                            </p>
                            <button onclick="App.logout()" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.8rem; border-color: rgba(244, 63, 94, 0.2); color: #fb7185;">
                                <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Logout
                            </button>
                        </div>
                    </div>
                    
                    <!-- Main Dashboard Content Injection Area -->
                    <div class="glass-panel" id="superadmin-content" style="padding: 28px;">
                        <div class="flex-center" style="flex-direction: column; padding: 60px 0;">
                            <div style="width: 40px; height: 40px; border: 3px solid rgba(0,212,255,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <p style="margin-top: 16px; color: var(--text-muted);">Memuat panel data...</p>
                        </div>
                    </div>
                </div>
            `;
        },
        dosen() {
            return `
                <div style="min-height: 100vh; padding: 24px 16px; max-width: 1100px; width: 100%; margin: 0 auto;">
                    <!-- Dosen Header Nav -->
                    <div class="glass-panel" style="padding: 16px 24px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="display: flex; width: 42px; height: 42px; border-radius: 10px; background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.3); align-items: center; justify-content: center;">
                                <i data-lucide="award" style="width: 22px; height: 22px; color: var(--secondary);"></i>
                            </div>
                            <div>
                                <h3 style="font-weight: 800; font-size: 1.15rem; margin-bottom: 0;">examRAYA</h3>
                                <p style="font-size: 0.72rem; font-weight: 600; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0;">Dosen Dashboard</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <p style="font-size: 0.85rem; margin-bottom: 0; display: inline-flex; align-items: center; gap: 8px;">
                                <i data-lucide="graduation-cap" style="width: 18px; height: 18px; color: var(--primary);"></i>
                                Hi, <strong style="color: #ffffff;">${App.state.currentUser ? App.state.currentUser.name : 'Dosen'}</strong>
                            </p>
                            <button onclick="App.logout()" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.8rem; border-color: rgba(244, 63, 94, 0.2); color: #fb7185;">
                                <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Logout
                            </button>
                        </div>
                    </div>
                    
                    <!-- Main Dashboard Content Injection Area -->
                    <div class="glass-panel" id="dosen-content" style="padding: 28px;">
                        <div class="flex-center" style="flex-direction: column; padding: 60px 0;">
                            <div style="width: 40px; height: 40px; border: 3px solid rgba(0,212,255,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <p style="margin-top: 16px; color: var(--text-muted);">Memuat panel ujian...</p>
                        </div>
                    </div>
                </div>
            `;
        },
        exam() {
            return `
                <div id="exam-container">
                    <!-- Injected by exam.js -->
                    <div class="flex-center" style="height: 100vh; flex-direction: column; gap: 16px; background: #020409;">
                        <div style="width: 50px; height: 50px; border: 3px solid rgba(0,212,255,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="color: var(--text-muted);">Mempersiapkan Lembar Ujian Secure...</p>
                    </div>
                </div>
            `;
        }
    },

    // Authenticate Action
    handleLogin() {
        const userField = document.getElementById('login-username').value.trim();
        const passField = document.getElementById('login-password').value.trim();
        
        if(!userField || !passField) {
            this.showToast("Masukkan username dan password Anda", "warning");
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
            
            this.showToast(`Selamat datang kembali, ${user.nama}!`, "success");
            if(user.role === 'superadmin') {
                this.navigate('superadmin');
            } else if(user.role === 'dosen') {
                this.navigate('dosen');
            }
        } else {
            this.showToast("Username atau Password tidak valid", "error");
        }
    },
    
    logout() {
        this.state.userRole = null;
        this.state.currentUser = null;
        safeStorage.removeItem('active_session');
        this.navigate('login');
        this.showToast("Sesi Anda telah diakhiri", "info");
    },

    // High Fidelity Toast Notification System
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let iconMarkup = '<i data-lucide="info" style="width: 18px; height: 18px; color: var(--primary);"></i>';
        
        if (type === 'success') {
            toast.style.borderLeftColor = 'var(--success)';
            iconMarkup = '<i data-lucide="check-circle" style="width: 18px; height: 18px; color: var(--success);"></i>';
        } else if (type === 'error') {
            toast.style.borderLeftColor = 'var(--danger)';
            iconMarkup = '<i data-lucide="alert-octagon" style="width: 18px; height: 18px; color: var(--danger);"></i>';
        } else if (type === 'warning') {
            toast.style.borderLeftColor = 'var(--warning)';
            iconMarkup = '<i data-lucide="alert-triangle" style="width: 18px; height: 18px; color: var(--warning);"></i>';
        }

        toast.innerHTML = `
            ${iconMarkup}
            <span style="font-size: 0.875rem; letter-spacing: -0.01em;">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Init Lucide icon for toast
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({
                attrs: { 'stroke-width': 2.5 }
            });
        }
        
        // Auto-remove animation
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(120%)';
            toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 1, 1)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};

// Auto Start engine on load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
