// js/exam.js - Secure Exam Mode Logic

const Exam = {
    state: {
        session: null,
        examData: null,
        isFullscreen: false,
        violationCount: 0,
        startTime: null
    },

    init() {
        const sessionStr = safeStorage.getItem('active_exam_session');
        if (!sessionStr) {
            App.navigate('home');
            return;
        }

        try {
            this.state.session = JSON.parse(sessionStr);
        } catch (e) {
            App.navigate('home');
            return;
        }

        const exams = DB.get('db_exams');
        this.state.examData = exams.find(e => e.id === this.state.session.examId);

        if (!this.state.examData) {
            App.showToast("Data ujian tidak ditemukan.", "error");
            safeStorage.removeItem('active_exam_session');
            App.navigate('home');
            return;
        }

        this.renderPreExamUI();
    },

    renderPreExamUI() {
        const container = document.getElementById('exam-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex-center" style="min-height: 100vh; padding: 20px; background: var(--bg-color);">
                <div class="glass-panel text-center" style="max-width: 600px; width: 100%;">
                    <i data-lucide="shield-alert" style="width: 64px; height: 64px; color: var(--warning); margin-bottom: 1rem;"></i>
                    <h2>Persiapan Ujian</h2>
                    <h3 class="mt-2 text-primary">${this.state.examData.mataKuliah}</h3>
                    
                    <div class="mt-4 text-left" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">Aturan Secure Exam:</h4>
                        <ul style="font-size: 0.9rem; color: #ddd; padding-left: 20px;">
                            <li>Ujian wajib dikerjakan dalam mode <strong>Layar Penuh (Fullscreen)</strong>.</li>
                            <li>Dilarang berpindah tab, membuka aplikasi lain, atau meminimalisir browser.</li>
                            <li>Dilarang menggunakan klik kanan (Copy/Paste).</li>
                            <li>Setiap pelanggaran akan <strong>tercatat di sistem</strong> dan dilaporkan ke dosen pengawas.</li>
                        </ul>
                    </div>

                    <div class="mt-4" style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; font-family: monospace; font-size: 1.2rem;">
                        TOKEN UJIAN ANDA:<br>
                        <strong style="color: var(--secondary); font-size: 1.5rem; letter-spacing: 2px;">${this.state.session.token}</strong>
                    </div>
                    
                    <button class="btn btn-primary mt-4" style="width: 100%; font-size: 1.1rem; padding: 15px;" onclick="Exam.startExam()">
                        <i data-lucide="maximize" style="width: 20px; height: 20px; margin-right: 8px;"></i> Mulai Ujian & Masuk Layar Penuh
                    </button>
                    
                    <button class="btn btn-outline mt-3" style="width: 100%; border: none;" onclick="Exam.cancelExam()">
                        Batal & Keluar
                    </button>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    startExam() {
        const elem = document.documentElement;
        // Request Fullscreen
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                App.showToast("Gagal masuk mode layar penuh. Pastikan browser mendukung.", "error");
            });
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }

        // We wait for fullscreenchange event to actually render the exam
        // Because if the user denies it, we shouldn't show the exam
        
        // Log exam start
        this.logAction('EXAM_START', 'Mahasiswa memulai ujian');
        this.state.startTime = new Date().getTime();
        this.bindSecurityEvents();

        // Fallback if fullscreen API is not fully supported or delayed
        setTimeout(() => {
            this.renderActiveExamUI();
        }, 500);
    },

    renderActiveExamUI() {
        const container = document.getElementById('exam-container');
        if (!container) return;

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; background: #fff;">
                <!-- Secure Header -->
                <div style="background: var(--surface); color: var(--text-color); padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary); z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i data-lucide="shield" style="color: var(--primary);"></i>
                        <div>
                            <div style="font-weight: bold;">${this.state.examData.mataKuliah}</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">${this.state.session.nama} (${this.state.session.nim})</div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px;">
                        <span style="font-size: 0.8rem; opacity: 0.8;">Token:</span>
                        <strong style="font-family: monospace; letter-spacing: 1px; color: var(--secondary); margin-left: 5px;">${this.state.session.token}</strong>
                    </div>

                    <button class="btn btn-outline" style="padding: 5px 15px; font-size: 0.9rem;" onclick="Exam.finishExam()">
                        Selesai Ujian
                    </button>
                </div>

                <!-- Google Form iFrame -->
                <div style="flex: 1; position: relative;">
                    <iframe src="${this.state.examData.formLink}" style="width: 100%; height: 100%; border: none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                    
                    <!-- Fullscreen Overlay Warning (Hidden by default) -->
                    <div id="violation-overlay" class="flex-center" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; color: white; flex-direction: column; text-align: center; padding: 20px;">
                        <i data-lucide="alert-triangle" style="width: 80px; height: 80px; color: var(--danger); margin-bottom: 20px;"></i>
                        <h1 style="color: var(--danger);">PELANGGARAN TERDETEKSI</h1>
                        <p style="font-size: 1.2rem; max-width: 600px; margin: 20px auto;">Anda telah keluar dari mode layar penuh atau berpindah aplikasi. Aktivitas ini telah <strong>dicatat dalam sistem log keamanan</strong>.</p>
                        <button class="btn btn-primary" style="padding: 15px 30px; font-size: 1.2rem; margin-top: 20px;" onclick="Exam.resumeFullscreen()">
                            Kembali ke Layar Penuh
                        </button>
                    </div>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    bindSecurityEvents() {
        // Prevent Right Click
        document.addEventListener('contextmenu', this.handleContextMenu);
        
        // Fullscreen Change
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);

        // Visibility Change (Tab Switch)
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Window Blur (Lost Focus)
        window.addEventListener('blur', this.handleWindowBlur);
    },

    unbindSecurityEvents() {
        document.removeEventListener('contextmenu', this.handleContextMenu);
        
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);

        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('blur', this.handleWindowBlur);
    },

    // Event Handlers (Need to be arrow functions or bound to keep 'this' context)
    handleContextMenu: (e) => {
        e.preventDefault();
        App.showToast("Klik kanan dinonaktifkan demi keamanan.", "warning");
    },

    handleFullscreenChange: () => {
        const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const overlay = document.getElementById('violation-overlay');
        
        if (!isFull) {
            Exam.state.isFullscreen = false;
            if (overlay) overlay.style.display = 'flex';
            Exam.state.violationCount++;
            Exam.logAction('EXIT_FULLSCREEN', 'Mahasiswa keluar dari mode layar penuh');
        } else {
            Exam.state.isFullscreen = true;
            if (overlay) overlay.style.display = 'none';
        }
    },

    handleVisibilityChange: () => {
        if (document.hidden) {
            Exam.state.violationCount++;
            Exam.logAction('TAB_SWITCH', 'Mahasiswa berpindah tab atau meminimalisir browser');
            
            // If they are not in fullscreen anymore, the fullscreen event will also fire
            // but if they just switched tabs while in fullscreen (e.g. alt-tab), we force show overlay
            const overlay = document.getElementById('violation-overlay');
            if (overlay) overlay.style.display = 'flex';
            
            // Attempt to exit fullscreen so they have to manually re-enter
            if(document.exitFullscreen) document.exitFullscreen().catch(()=>{});
        }
    },

    handleWindowBlur: () => {
        // Less strict than visibilityChange, but still a potential cheat
        Exam.state.violationCount++;
        Exam.logAction('WINDOW_BLUR', 'Jendela browser kehilangan fokus');
    },

    resumeFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                App.showToast("Harap izinkan layar penuh.", "error");
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    },

    logAction(action, description) {
        const logs = DB.get('db_logs');
        logs.push({
            id: Utils.generateId(),
            examId: this.state.session.examId,
            nim: this.state.session.nim,
            action: action,
            description: description,
            timestamp: new Date().toISOString()
        });
        DB.set('db_logs', logs);
        console.warn(`[SECURITY LOG] ${action}: ${description}`);
    },

    finishExam() {
        if(confirm("Apakah Anda yakin telah selesai mengerjakan ujian? Aksi ini akan mengakhiri sesi Anda.")) {
            this.logAction('EXAM_FINISH', `Mahasiswa menyelesaikan ujian dengan ${this.state.violationCount} pelanggaran.`);
            this.unbindSecurityEvents();
            
            if(document.exitFullscreen && (document.fullscreenElement || document.webkitFullscreenElement)) {
                document.exitFullscreen().catch(()=>{});
            }

            // Mark token as used
            const tokens = DB.get('db_tokens');
            const tokenObj = tokens.find(t => t.token === this.state.session.token);
            if(tokenObj) {
                tokenObj.status = 'used';
                tokenObj.usedAt = new Date().toISOString();
                DB.set('db_tokens', tokens);
            }

            safeStorage.removeItem('active_exam_session');
            App.showToast("Ujian selesai. Terima kasih.", "success");
            App.navigate('home');
        }
    },

    cancelExam() {
        safeStorage.removeItem('active_exam_session');
        App.navigate('home');
    }
};

window.Exam = Exam;
