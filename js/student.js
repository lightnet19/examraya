// js/student.js - Student Verification Flow

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
            <i data-lucide="shield-check" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
            <h2 style="margin-bottom: 5px;">examRAYA Secure</h2>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 15px; color: var(--primary);">STAI Raden Abdullah Yaqin</p>
            <p class="text-muted mt-2" style="font-size: 0.9rem;">Masukkan Kode Ruangan atau Scan QR untuk memulai.</p>
            
            <div id="qr-reader" class="mt-3" style="display: none; border-radius: 8px; overflow: hidden; width: 100%;"></div>

            <div class="form-group mt-4">
                <input type="text" id="room-code-input" class="form-control text-center" placeholder="KODE RUANGAN (6 Karakter)" maxlength="6" style="font-size: 1.2rem; letter-spacing: 2px; text-transform: uppercase;">
            </div>
            
            <button class="btn btn-primary mt-3" style="width: 100%;" onclick="Student.checkRoom()">
                <i data-lucide="log-in" style="width: 18px; height: 18px;"></i> Masuk Ruangan
            </button>

            <button class="btn btn-outline mt-2" style="width: 100%;" onclick="Student.toggleScanner()" id="btn-scan">
                <i data-lucide="qr-code" style="width: 18px; height: 18px;"></i> Scan QR
            </button>
            
            <div class="mt-4" style="font-size: 0.85rem; color: var(--text-muted);">
                <a href="#login" style="color: var(--primary); text-decoration: none;">Login Dasbor Manajemen</a>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    toggleScanner() {
        const qrContainer = document.getElementById('qr-reader');
        const btnScan = document.getElementById('btn-scan');
        
        if (qrContainer.style.display === 'none') {
            qrContainer.style.display = 'block';
            btnScan.innerHTML = `<i data-lucide="x" style="width: 18px; height: 18px;"></i> Tutup Scanner`;
            if (typeof lucide !== 'undefined') lucide.createIcons();

            this.state.scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
            this.state.scanner.render((decodedText, decodedResult) => {
                // Success callback
                document.getElementById('room-code-input').value = decodedText;
                this.state.scanner.clear();
                qrContainer.style.display = 'none';
                btnScan.innerHTML = `<i data-lucide="qr-code" style="width: 18px; height: 18px;"></i> Scan QR`;
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
            btnScan.innerHTML = `<i data-lucide="qr-code" style="width: 18px; height: 18px;"></i> Scan QR`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    checkRoom() {
        const codeInput = document.getElementById('room-code-input');
        if(!codeInput) return;
        const code = codeInput.value.trim().toUpperCase();

        if (code.length === 0) {
            App.showToast("Masukkan Kode Ruangan terlebih dahulu.", "warning");
            return;
        }

        const exams = DB.get('db_exams');
        const exam = exams.find(e => e.roomCode === code);

        if (exam) {
            this.state.activeRoomCode = code;
            this.state.activeExam = exam;
            App.showToast(`Ruangan ${exam.mataKuliah} ditemukan!`, "success");
            this.renderVerificationUI();
        } else {
            App.showToast("Kode Ruangan tidak valid atau tidak ditemukan.", "error");
        }
    },

    renderVerificationUI() {
        const container = document.getElementById('student-home-container');
        if(!container) return;

        const exam = this.state.activeExam;

        container.innerHTML = `
            <i data-lucide="user-check" style="width: 48px; height: 48px; color: var(--secondary); margin-bottom: 1rem;"></i>
            <h2>Verifikasi Mahasiswa</h2>
            <div class="mt-2" style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; font-size: 0.9rem;">
                <strong>Ujian:</strong> ${exam.mataKuliah}<br>
                <span class="text-muted">Dosen ID: ${exam.dosenId}</span>
            </div>
            
            <p class="text-muted mt-3" style="font-size: 0.9rem;">Masukkan NIM Anda untuk memverifikasi kelayakan mengikuti ujian ini.</p>
            
            <div class="form-group mt-3">
                <input type="text" id="nim-input" class="form-control text-center" placeholder="Masukkan NIM (Misal: 123456)">
            </div>
            
            <button class="btn btn-secondary mt-3" style="width: 100%;" onclick="Student.verifyStudent()">
                <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i> Verifikasi & Lanjutkan
            </button>

            <button class="btn btn-outline mt-2" style="width: 100%; border: none;" onclick="Student.initHome()">
                Kembali
            </button>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    verifyStudent() {
        const nimInput = document.getElementById('nim-input');
        if(!nimInput) return;
        const nim = nimInput.value.trim();

        if (nim.length === 0) {
            App.showToast("NIM tidak boleh kosong.", "warning");
            return;
        }

        const students = DB.get('db_mahasiswa');
        const student = students.find(s => s.nim === nim);

        if (!student) {
            App.showToast("NIM tidak terdaftar di sistem. Hubungi Super Admin.", "error");
            return;
        }

        const isEligible = student.isEligible !== false && student.eligible !== false;
        if (!isEligible) {
            App.showToast("Anda TIDAK LAYAK (diblokir) untuk mengikuti ujian ini. Silakan hubungi Super Admin/Dosen.", "error");
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

        const tokens = DB.get('db_tokens');
        // Optional: Check if student already has an active token for this exam to prevent multi-device
        const existingTokenIndex = tokens.findIndex(t => t.examId === exam.id && t.nim === student.nim && t.status === 'active');
        if(existingTokenIndex > -1) {
            // Invalidate old token or just reuse it. We'll invalidate the old one for security.
            tokens[existingTokenIndex].status = 'expired';
        }

        tokens.push(newToken);
        DB.set('db_tokens', tokens);

        // Store active exam session in localStorage for Phase 5 (Secure Exam Mode)
        safeStorage.setItem('active_exam_session', JSON.stringify({
            token: tokenString,
            examId: exam.id,
            studentId: student.id,
            nim: student.nim,
            nama: student.nama
        }));

        App.showToast("Verifikasi Berhasil! Mengalihkan ke Mode Ujian...", "success");

        // Redirect to Exam page (To be implemented in Phase 5)
        // For now we navigate to #exam to trigger routing
        setTimeout(() => {
            App.navigate('exam');
        }, 1500);
    }
};

window.Student = Student;
