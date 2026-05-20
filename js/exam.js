// js/exam.js - Secure Exam Mode Logic
const Exam = {
    state: {
        session: null,
        examData: null,
        isFullscreen: false,
        violationCount: 0,
        startTime: null
    },

    timerInterval: null,

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

        // Reset state
        this.state.violationCount = 0;
        this.state.isFullscreen = false;
        this.state.startTime = null;

        this.renderPreExamUI();
    },

    renderPreExamUI() {
        const container = document.getElementById('exam-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex-center" style="min-height: 100vh; padding: 24px; position: relative; background: var(--bg-main);">
                <!-- Ambient Light Blobs -->
                <div style="position: absolute; width: 300px; height: 300px; background: rgba(0, 212, 255, 0.08); filter: blur(80px); top: 15%; left: 10%; pointer-events: none;"></div>
                <div style="position: absolute; width: 300px; height: 300px; background: rgba(124, 58, 237, 0.08); filter: blur(80px); bottom: 15%; right: 10%; pointer-events: none;"></div>

                <div class="glass-panel text-center" style="max-width: 580px; width: 100%; position: relative; border-color: rgba(0, 212, 255, 0.2); box-shadow: 0 0 30px rgba(0, 212, 255, 0.1);">
                    <div style="display: inline-flex; width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(124, 58, 237, 0.15)); align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid var(--border-glass-active);">
                        <i data-lucide="shield-alert" style="width: 32px; height: 32px; color: var(--primary);"></i>
                    </div>
                    
                    <h2 style="font-weight: 800; margin-bottom: 4px;">Persiapan Ujian Secure</h2>
                    <p style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">STAI Raden Abdullah Yaqin</p>
                    
                    <div style="background: rgba(13, 17, 33, 0.6); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: left; margin-bottom: 24px;">
                        <div style="font-weight: bold; color: #ffffff; font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="book-open" style="width: 18px; height: 18px; color: var(--primary);"></i>
                            Informasi Ujian:
                        </div>
                        <div style="display: grid; grid-template-columns: 110px 1fr; gap: 8px; font-size: 0.9rem; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
                            <span style="color: var(--text-muted);">Mata Kuliah:</span>
                            <strong style="color: #ffffff;">${this.state.examData.mataKuliah}</strong>
                            <span style="color: var(--text-muted);">Mahasiswa:</span>
                            <span style="color: #ffffff;">${this.state.session.nama} (${this.state.session.nim})</span>
                        </div>
                        
                        <div style="font-weight: bold; color: #ffffff; font-size: 0.9rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="shield-check" style="width: 18px; height: 18px; color: var(--success);"></i>
                            Aturan Secure Exam:
                        </div>
                        <ul style="font-size: 0.85rem; color: var(--text-muted); padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                            <li>Ujian wajib dikerjakan dalam mode <strong>Layar Penuh (Fullscreen)</strong>.</li>
                            <li>Dilarang berpindah tab, membuka aplikasi lain, atau meminimalisir browser.</li>
                            <li>Dilarang menggunakan klik kanan (Copy/Paste/Inspect).</li>
                            <li>Setiap tindakan mencurigakan akan <strong>tercatat di log keamanan</strong> pengawas secara real-time.</li>
                        </ul>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(124, 58, 237, 0.05)); border: 1px dashed var(--border-glass-active); padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Secure Token Validated</span>
                        <strong style="font-family: monospace; color: var(--primary); font-size: 1.6rem; letter-spacing: 4px; text-shadow: 0 0 10px rgba(0,212,255,0.3);">${this.state.session.token}</strong>
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%; padding: 14px 20px; font-size: 1rem; border-radius: 12px;" onclick="Exam.startExam()">
                        <i data-lucide="maximize" style="width: 18px; height: 18px;"></i> Mulai Ujian & Masuk Layar Penuh
                    </button>
                    
                    <button class="btn btn-outline" style="width: 100%; border: 1px solid transparent; background: transparent; margin-top: 12px; color: var(--text-muted);" onclick="Exam.cancelExam()">
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

        // Log exam start
        this.logAction('EXAM_START', 'Mahasiswa memulai ujian');
        this.state.startTime = new Date().getTime();
        this.bindSecurityEvents();

        // Fallback if fullscreen API is delayed
        setTimeout(() => {
            this.renderActiveExamUI();
        }, 500);
    },

    renderActiveExamUI() {
        const container = document.getElementById('exam-container');
        if (!container) return;

        const watermarkItems = Array(16).fill(`<div class="watermark-item">${this.state.session.nim} - ${this.state.session.nama}</div>`).join('');

        container.innerHTML = `
            <style>
                @keyframes pulse-glow {
                    0% { transform: scale(0.95); opacity: 0.4; }
                    50% { transform: scale(1.3); opacity: 0.8; }
                    100% { transform: scale(0.95); opacity: 0.4; }
                }
                .border-danger {
                    border-color: rgba(244, 63, 94, 0.3) !important;
                    box-shadow: 0 0 30px rgba(244, 63, 94, 0.15) !important;
                }
            </style>

            <div style="display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-main);">
                <!-- Secure Header -->
                <header class="exam-header">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="display: flex; width: 38px; height: 38px; border-radius: 8px; background: rgba(0, 212, 255, 0.1); border: 1px solid var(--border-glass-active); align-items: center; justify-content: center;">
                            <i data-lucide="shield" style="width: 20px; height: 20px; color: var(--primary);"></i>
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 0.95rem; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                                ${this.state.examData.mataKuliah}
                                <span class="badge badge-primary" style="font-size: 0.65rem; padding: 2px 6px; text-transform: uppercase;">Secure Mode</span>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
                                ${this.state.session.nama} &bull; NIM: ${this.state.session.nim}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <!-- Token Badge -->
                        <div style="text-align: center; background: rgba(5, 7, 16, 0.6); border: 1px solid var(--border-glass); padding: 6px 14px; border-radius: 20px; display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Token:</span>
                            <strong style="font-family: monospace; letter-spacing: 1px; color: var(--secondary); font-size: 0.9rem;">${this.state.session.token}</strong>
                        </div>

                        <!-- Timer Tracker -->
                        <div style="background: rgba(5, 7, 16, 0.6); border: 1px solid var(--border-glass); padding: 6px 14px; border-radius: 20px; display: flex; align-items: center; gap: 6px;">
                            <i data-lucide="clock" style="width: 14px; height: 14px; color: var(--primary);"></i>
                            <span id="exam-timer" style="font-family: monospace; font-size: 0.9rem; font-weight: bold; color: #ffffff; min-width: 60px; text-align: center;">00:00:00</span>
                        </div>

                        <button class="btn btn-outline" style="padding: 6px 14px; font-size: 0.8rem; border-color: rgba(244, 63, 94, 0.2); color: #fb7185;" onclick="Exam.finishExam()">
                            <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Selesai Ujian
                        </button>
                    </div>
                </header>

                <!-- Google Form iFrame and Secure Overlay / Watermarks -->
                <div id="exam-frame-wrapper" class="exam-frame-wrapper">
                    <iframe src="${this.state.examData.formLink}" style="width: 100%; height: 100%; border: none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                    
                    <!-- Secure Watermarks -->
                    <div class="secure-watermark">
                        ${watermarkItems}
                    </div>

                    <!-- Fullscreen Overlay Warning (Hidden by default) -->
                    <div id="violation-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 7, 18, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 9999; color: white; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; transition: all 0.3s ease;">
                        <div style="max-width: 550px; width: 100%;" class="glass-panel border-danger">
                            <div class="flex-center" style="position: relative; margin-bottom: 24px;">
                                <div class="pulsing-glow" style="position: absolute; width: 80px; height: 80px; background: rgba(244, 63, 94, 0.3); border-radius: 50%; filter: blur(15px); animation: pulse-glow 2s infinite;"></div>
                                <i data-lucide="shield-alert" style="width: 72px; height: 72px; color: var(--danger); z-index: 1;"></i>
                            </div>
                            <h1 style="color: var(--danger); font-weight: 800; font-size: 1.8rem; margin-bottom: 8px; text-shadow: 0 0 15px rgba(244,63,94,0.3);">PELANGGARAN TERDETEKSI</h1>
                            <p style="font-size: 0.8rem; font-weight: 700; color: var(--danger); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">Sistem Keamanan Aktif</p>
                            <p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 24px; line-height: 1.5;">
                                Anda telah keluar dari mode layar penuh (Fullscreen) atau berpindah aplikasi/tab. Aktivitas mencurigakan ini telah <strong>dicatat di log keamanan server</strong> secara real-time.
                            </p>
                            <button class="btn btn-primary" style="width: 100%; padding: 14px 20px; font-size: 1rem;" onclick="Exam.resumeFullscreen()">
                                <i data-lucide="maximize" style="width: 18px; height: 18px;"></i> Kembali ke Layar Penuh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Start Live Timer Interval
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const diff = now - Exam.state.startTime;
            const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            const timerElem = document.getElementById('exam-timer');
            if (timerElem) {
                timerElem.innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
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

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    handleContextMenu: (e) => {
        e.preventDefault();
        App.showToast("Klik kanan dinonaktifkan demi keamanan.", "warning");
    },

    handleFullscreenChange: () => {
        const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const overlay = document.getElementById('violation-overlay');
        const wrapper = document.getElementById('exam-frame-wrapper');
        
        if (!isFull) {
            Exam.state.isFullscreen = false;
            if (overlay) overlay.style.display = 'flex';
            if (wrapper) wrapper.classList.add('security-alert');
            Exam.state.violationCount++;
            Exam.logAction('EXIT_FULLSCREEN', 'Mahasiswa keluar dari mode layar penuh');
        } else {
            Exam.state.isFullscreen = true;
            if (overlay) overlay.style.display = 'none';
            if (wrapper) wrapper.classList.remove('security-alert');
        }
    },

    handleVisibilityChange: () => {
        if (document.hidden) {
            Exam.state.violationCount++;
            Exam.logAction('TAB_SWITCH', 'Mahasiswa berpindah tab atau meminimalisir browser');
            
            const overlay = document.getElementById('violation-overlay');
            const wrapper = document.getElementById('exam-frame-wrapper');
            if (overlay) overlay.style.display = 'flex';
            if (wrapper) wrapper.classList.add('security-alert');
            
            // Attempt to exit fullscreen so they have to manually re-enter and trigger overlay
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    },

    handleWindowBlur: () => {
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
        const logs = DB.get('db_logs') || [];
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
        if (confirm("Apakah Anda yakin telah selesai mengerjakan ujian? Aksi ini akan mengakhiri sesi Anda.")) {
            this.logAction('EXAM_FINISH', `Mahasiswa menyelesaikan ujian dengan ${this.state.violationCount} pelanggaran.`);
            this.unbindSecurityEvents();
            
            if (document.exitFullscreen && (document.fullscreenElement || document.webkitFullscreenElement)) {
                document.exitFullscreen().catch(() => {});
            }

            // Mark token as used
            const tokens = DB.get('db_tokens') || [];
            const tokenObj = tokens.find(t => t.token === this.state.session.token);
            if (tokenObj) {
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
        this.unbindSecurityEvents();
        safeStorage.removeItem('active_exam_session');
        App.navigate('home');
    }
};

window.Exam = Exam;
