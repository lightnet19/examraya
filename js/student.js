// js/student.js - Student Entrance & Verification Flow (High Fidelity Redesign)

const Student = {
    state: {
        activeRoomCode: null,
        activeExam: null,
        scanner: null
    },

    initHome() {
        this.state.activeRoomCode = null;
        this.state.activeExam = null;
        if(this.state.scanner) {
            try { this.state.scanner.clear(); } catch(e){}
            this.state.scanner = null;
        }
        this.renderHomeUI();
    },

    renderHomeUI() {
        const container = document.getElementById('student-home-container');
        if(!container) return;

        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="display: inline-flex; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(124, 58, 237, 0.15)); align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid var(--border-glass-active); box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);">
                    <i data-lucide="shield-check" style="width: 32px; height: 32px; color: var(--primary);"></i>
                </div>
                <h2 style="font-weight: 800; font-size: 1.85rem; margin-bottom: 2px;">examRAYA Secure</h2>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0;">Portal Validasi Mahasiswa</p>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">STAI Raden Abdullah Yaqin</p>
            </div>
            
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 20px;">Pindai QR Code di layar proyektor kelas atau masukkan Kode Ruangan di bawah ini untuk masuk.</p>
            
            <!-- Styled HTML5 QR Scanner Container -->
            <div id="qr-reader" class="mt-3" style="display: none; border: 1px solid var(--border-glass-active); border-radius: 14px; overflow: hidden; width: 100%; margin-bottom: 20px; background: var(--bg-inner); padding: 12px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);"></div>

            <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label" style="text-align: center;">Kode Ruangan</label>
                <div style="position: relative;">
                    <i data-lucide="door-open" style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #4b5563;"></i>
                    <input type="text" id="room-code-input" class="form-control text-center" placeholder="X X X X X X" maxlength="6" style="padding-left: 44px; padding-right: 44px; font-size: 1.3rem; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; border-color: rgba(255, 255, 255, 0.12);">
                </div>
            </div>
            
            <button class="btn btn-primary" style="width: 100%; margin-bottom: 12px;" onclick="Student.checkRoom()">
                <i data-lucide="log-in" style="width: 18px; height: 18px;"></i> Masuk Ruangan Ujian
            </button>

            <button class="btn btn-outline" style="width: 100%;" onclick="Student.toggleScanner()" id="btn-scan">
                <i data-lucide="qr-code" style="width: 18px; height: 18px;"></i> Scan QR Code
            </button>
            
            <div style="margin-top: 28px; border-top: 1px solid var(--border-glass); padding-top: 18px;">
                <a href="#login" style="color: var(--primary); text-decoration: none; font-size: 0.82rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; transition: var(--transition-smooth);" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='var(--primary)'">
                    <i data-lucide="user-cog" style="width: 15px; height: 15px;"></i> Login Dasbor Manajemen
                </a>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    toggleScanner() {
        const qrContainer = document.getElementById('qr-reader');
        const btnScan = document.getElementById('btn-scan');
        
        if (qrContainer.style.display === 'none') {
            qrContainer.style.display = 'block';
            btnScan.innerHTML = `<i data-lucide="x" style="width: 18px; height: 18px;"></i> Hentikan Kamera`;
            btnScan.style.borderColor = 'var(--danger)';
            btnScan.style.color = '#fb7185';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            this.state.scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
            this.state.scanner.render((decodedText, decodedResult) => {
                // Success callback
                document.getElementById('room-code-input').value = decodedText;
                this.state.scanner.clear();
                qrContainer.style.display = 'none';
                btnScan.innerHTML = `<i data-lucide="qr-code" style="width: 18px; height: 18px;"></i> Scan QR Code`;
                btnScan.style.borderColor = 'var(--border-glass)';
                btnScan.style.color = 'var(--text-main)';
                if (typeof lucide !== 'undefined') lucide.createIcons();
                this.checkRoom();
            }, (error) => {
                // Failure callback (ignore continuously)
            });
        } else {
            if(this.state.scanner) {
                this.state.scanner.clear();
            }
            qrContainer.style.display = 'none';
            btnScan.innerHTML = `<i data-lucide="qr-code" style="width: 18px; height: 18px;"></i> Scan QR Code`;
            btnScan.style.borderColor = 'var(--border-glass)';
            btnScan.style.color = 'var(--text-main)';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    checkRoom() {
        const codeInput = document.getElementById('room-code-input');
        if(!codeInput) return;
        const code = codeInput.value.trim().toUpperCase();

        if (code.length === 0) {
            App.showToast("Masukkan Kode Ruangan atau scan QR dahulu.", "warning");
            return;
        }

        const exams = DB.get('db_exams');
        const exam = exams.find(e => e.roomCode === code);

        if (exam) {
            this.state.activeRoomCode = code;
            this.state.activeExam = exam;
            App.showToast(`Ruangan ditemukan! Membuka verifikasi NIM.`, "success");
            this.renderVerificationUI();
        } else {
            App.showToast("Kode Ruangan tidak ditemukan atau tidak aktif", "error");
        }
    },

    renderVerificationUI() {
        const container = document.getElementById('student-home-container');
        if(!container) return;

        const exam = this.state.activeExam;

        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="display: inline-flex; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(0, 212, 255, 0.15)); align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid rgba(124, 58, 237, 0.3); box-shadow: 0 0 20px rgba(124, 58, 237, 0.15);">
                    <i data-lucide="user-check" style="width: 32px; height: 32px; color: var(--secondary);"></i>
                </div>
                <h2 style="font-weight: 800; font-size: 1.65rem; margin-bottom: 2px;">Validasi NIM</h2>
                <p style="font-size: 0.75rem; font-weight: 700; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0;">Pemeriksaan Hak Ujian</p>
            </div>
            
            <!-- Exam info card -->
            <div style="background: var(--bg-inner); border: 1px solid var(--border-glass); padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                    <i data-lucide="book-open" style="width: 16px; height: 16px; color: var(--primary);"></i>
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Mata Kuliah:</span>
                </div>
                <h4 style="font-size: 1.05rem; margin-bottom: 4px; font-weight: 700; color: #ffffff;">${exam.mataKuliah}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px;">
                    <span>Dosen NIDN: <strong>${exam.dosenId}</strong></span>
                    <span class="badge badge-primary" style="font-size: 0.65rem; border-radius: 6px;">${exam.roomCode}</span>
                </div>
            </div>
            
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Masukkan NIM Anda untuk memeriksa status kelayakan administrasi dan akademik Anda.</p>
            
            <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label" style="text-align: center;">NIM Mahasiswa</label>
                <div style="position: relative;">
                    <i data-lucide="hash" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #4b5563;"></i>
                    <input type="text" id="nim-input" class="form-control text-center" placeholder="Masukkan Nomor Induk Mahasiswa" style="padding-left: 44px; padding-right: 44px; font-weight: 600;">
                </div>
            </div>
            
            <button class="btn btn-secondary" style="width: 100%; margin-bottom: 12px;" onclick="Student.verifyStudent()">
                <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i> Verifikasi & Lanjutkan
            </button>

            <button class="btn btn-outline" style="width: 100%; border: 1px solid transparent; background: transparent;" onclick="Student.initHome()">
                <i data-lucide="chevron-left" style="width: 18px; height: 18px;"></i> Batal / Keluar Ruangan
            </button>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    verifyStudent() {
        const nimInput = document.getElementById('nim-input');
        if(!nimInput) return;
        const nim = nimInput.value.trim();

        if (nim.length === 0) {
            App.showToast("NIM Anda tidak boleh kosong.", "warning");
            return;
        }

        const students = DB.get('db_mahasiswa');
        const student = students.find(s => s.nim === nim);

        if (!student) {
            App.showToast("NIM Anda tidak terdaftar di sistem. Hubungi Super Admin.", "error");
            return;
        }

        const isEligible = student.isEligible !== false && student.eligible !== false;
        if (!isEligible) {
            App.showToast("Akses Ditolak: Status akademik/SPP Anda DIBLOKIR. Hubungi Administrasi.", "error");
            
            // Log an access attempt violation (Unauthorized Access Attempt)
            const logs = DB.get('db_logs') || [];
            const newViolationLog = {
                id: Utils.generateId(),
                timestamp: new Date().toISOString(),
                examId: this.state.activeExam.id,
                nim: student.nim,
                studentName: student.nama,
                action: 'BLOCKED_STUDENT_ATTEMPT',
                details: 'Mahasiswa tidak layak mencoba login ke ruangan ' + this.state.activeExam.mataKuliah
            };
            logs.push(newViolationLog);
            DB.set('db_logs', logs);
            return;
        }

        // Student is verified and eligible. Generate Token.
        this.generateExamToken(student, this.state.activeExam);
    },

    generateExamToken(student, exam) {
        // Create a unique token
        const tokenString = Utils.generateId(16);
        const newToken = {
            id: Utils.generateId(),
            token: tokenString,
            examId: exam.id,
            nim: student.nim,
            createdAt: new Date().toISOString(),
            usedAt: null,
            status: 'active' // 'active', 'used', 'expired'
        };

        const tokens = DB.get('db_tokens') || [];
        // Invalidate older active tokens for this student in this exam
        const existingTokenIndex = tokens.findIndex(t => t.examId === exam.id && t.nim === student.nim && t.status === 'active');
        if(existingTokenIndex > -1) {
            tokens[existingTokenIndex].status = 'expired';
        }

        tokens.push(newToken);
        DB.set('db_tokens', tokens);

        // Store active exam session in safeStorage
        safeStorage.setItem('active_exam_session', JSON.stringify({
            token: tokenString,
            examId: exam.id,
            studentId: student.id,
            nim: student.nim,
            nama: student.nama
        }));

        App.showToast("Verifikasi Berhasil! Mengalihkan ke Ujian Secure...", "success");

        // Redirect to Exam page (SPA transition)
        setTimeout(() => {
            App.navigate('exam');
        }, 1500);
    }
};

window.Student = Student;
