# 🎯 The Academic Curator — Nền Tảng E-Learning Chứa Lỗ Hổng Bảo Mật (Enterprise Cyber Range Lab)

> **⚠️ CẢNH BÁO: Ứng dụng này được xây dựng CỐ Ý CHỨA CÁC LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG. Ứng dụng CHỈ được sử dụng cho mục đích đào tạo an toàn thông tin, diễn tập Cyber Range, kiểm thử xâm nhập (Penetration Testing) và các bài thi CTF được cấp phép. TUYỆT ĐỐI KHÔNG triển khai trên môi trường Production hoặc bất kỳ hệ thống mạng công cộng nào.**

---

## 📌 Tổng Quan Dự Án

**The Academic Curator** là một nền tảng quản lý học tập điện tử (LMS) hoàn chỉnh được xây dựng trên nền tảng công nghệ hiện đại (**Next.js 15.0.3 / React 19.0.0-rc / Node.js**) kết hợp kiến trúc **Nginx Reverse Proxy đa tầng** và hệ thống **Cổng ngụy trang (Decoys & Rabbit Holes)**. 

Hệ thống được cấu hình có chủ đích để mô phỏng một trong những lỗ hổng nguy hiểm nhất trong hệ sinh thái React: **React2Shell (CVE-2025-55182)**.

Mục tiêu đào tạo của bài lab:
- Phương pháp luận kiểm thử xâm nhập ứng dụng web xây dựng trên kiến trúc React Server Components (RSC) và Server Actions.
- Khai thác lỗ hổng cơ chế phiên xác thực NextAuth v5 và lỗ hổng kiểm soát truy cập (Access Control).
- Khai thác lỗ hổng giải mã dữ liệu không an toàn (**Insecure Deserialization**) trên React Flight Protocol dẫn đến thực thi mã từ xa (**RCE**).
- Kỹ thuật xâu chuỗi đa lỗ hổng (IDOR $\rightarrow$ Mass Assignment $\rightarrow$ Framework-level RCE $\rightarrow$ Pivoting mạng nội bộ).
- Kỹ năng nhận diện và xử lý bề mặt tấn công đa cổng (Multi-port Attack Surface & Decoy filtering).

---

## 🔴 Chuỗi Tấn Công (The Cyber Kill Chain)

Bài lab yêu cầu xâu chuỗi **4 giai đoạn tấn công liên hoàn** để chiếm quyền điều khiển máy chủ và thâm nhập cơ sở dữ liệu nội bộ:

```
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│  Giai đoạn 1:          │────▶│  Giai đoạn 2:          │────▶│  Giai đoạn 3:          │────▶│  Giai đoạn 4:          │
│  Truy cập ban đầu      │     │  Leo thang đặc quyền   │     │  React2Shell RCE       │     │  Pivot & Khai thác     │
│  (Tài khoản SINH VIÊN) │     │  (STUDENT ➔ LECTURER)  │     │  (CVE-2025-55182)      │     │  (PostgreSQL nội bộ)   │
└────────────────────────┘     └────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```

1. **Giai đoạn 1 — Initial Access**: Đăng nhập tài khoản sinh viên `STUDENT` (`student@elearning.com` / `password123`) qua endpoint `/api/auth/callback/credentials`. Trích xuất CSRF token, cookie phiên JWT (`authjs.session-token`) và CUID người dùng.
2. **Giai đoạn 2 — Leo Thang Đặc Quyền (IDOR + Mass Assignment)**: Server Action `updateUserProfile` tại `lib/actions/user.ts` tin cậy trực tiếp `userId` gửi lên từ client (lỗ hổng **IDOR**) và gán trực tiếp dữ liệu cập nhật vào cơ sở dữ liệu mà không lọc danh sách trắng thuộc tính (lỗ hổng **Mass Assignment**). Chèn `"role": "LECTURER"` vào payload để nâng quyền.
3. **Giai đoạn 3 — Khai Thác React Flight Deserialization RCE (React2Shell - CVE-2025-55182)**: Với phiên `LECTURER`, gửi HTTP POST multipart stream tới Server Action `createAssignment`, khai thác cơ chế prototype traversal `$2:constructor:constructor` để thực thi lệnh OS tùy ý (**RCE**) trên Node.js runtime.
4. **Giai đoạn 4 — Khai Thác Hậu Xâm Nhập & Pivoting (Post-Exploitation)**: Đọc `.env` thu thập credentials và truy vấn container cơ sở dữ liệu PostgreSQL nội bộ (`elearning-db:5432`) trên dải mạng Docker bridge.

---

## 📡 Bề Mặt Tấn Công & Bản Đồ Cổng Dịch Vụ (Attack Surface Map)

| Cổng (Port) | Dịch Vụ | Banner / Phiên Bản | Bản Chất Kỹ Thuật |
|---|---|---|---|
| **21/tcp** | FTP | `vsFTPd 3.0.5` | **Decoy / Rabbit Hole** (Từ chối Anonymous `530 Login incorrect`) |
| **80/tcp** | HTTP | `nginx/1.24.0 (Ubuntu)` | **Reverse Proxy** (Chuyển tiếp vào Web App chính) |
| **2222/tcp**| SSH | `OpenSSH 8.9p1 Ubuntu` | **Decoy / Rabbit Hole** (Chỉ nhận Publickey) |
| **3000/tcp**| HTTP | `Next.js 15.0.3 / Node.js` | **Mục Tiêu Khai Thác Chính (React2Shell Lab Target)** |
| **5432/tcp**| PostgreSQL | `PostgreSQL 16-alpine` | **Cơ sở dữ liệu nội bộ** (Target cho Giai đoạn 4 Pivoting) |
| **6379/tcp**| Redis | `Redis 7-alpine` | **Decoy / Rabbit Hole** (Yêu cầu mật khẩu `NOAUTH`) |
| **8080/tcp**| HTTP | `Spring Boot Actuator` | **Decoy / Rabbit Hole** (`/actuator/health`, `/api/internal/` 403) |

---

## 🔑 Thông Tin Tài Khoản Mặc Định (Seed Accounts)

| Vai trò | Email | Mật khẩu | Quyền hạn trong hệ thống |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@elearning.com` | `password123` | Quản lý người dùng, xem thống kê toàn hệ thống |
| **Giảng viên (Lecturer)** | `lecturer@elearning.com` | `password123` | Tạo bài tập (`createAssignment`), xem sổ điểm, Analytics |
| **Sinh viên (Student)** | `student@elearning.com` | `password123` | Nộp bài tập, cập nhật hồ sơ cá nhân |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

### 1. Yêu cầu môi trường
- Node.js phiên bản 20 trở lên
- Docker & Docker Compose
- Python phiên bản 3.9 trở lên (cần thư viện `requests`)

### 2. Khởi chạy nhanh bằng 1 câu lệnh (Automated One-Click Setup)

```bash
# 1. Clone repository về máy
git clone https://github.com/Tc3s/REACT2SHELL-WEB-VULN.git && cd REACT2SHELL-WEB-VULN

# 2. Cấp quyền và chạy script thiết lập tự động toàn diện
chmod +x setup.sh && ./setup.sh

# 3. Khởi động Web Server
npm run dev
# Hoặc khởi chạy toàn bộ Stack Enterprise đa tầng (Nginx + App + DB):
# docker compose up -d --build
```

Truy cập ứng dụng tại: `http://localhost:3000` (hoặc `http://localhost:80` nếu chạy qua Nginx Reverse Proxy).

---

## ⚡ Công Cụ Khai Thác Tự Động Hóa (Exploit Harness)

Dự án cung cấp sẵn script Python tự động hóa toàn bộ chuỗi tấn công 4 giai đoạn end-to-end:

```bash
# Chạy chuỗi khai thác hoàn chỉnh với lệnh mặc định (id && uname -a)
python3 scripts/exploit_react2shell.py --target http://localhost:3000

# Chạy lệnh tùy chỉnh trên máy chủ mục tiêu
python3 scripts/exploit_react2shell.py --target http://localhost:3000 --cmd "cat /etc/passwd"

# Chuyển tiếp lưu lượng qua proxy Burp Suite để phân tích gói tin
python3 scripts/exploit_react2shell.py --target http://localhost:3000 --proxy http://127.0.0.1:8080
```

---

## 📖 Tài Liệu Dự Án Trong Thư Mục `docs/`

Toàn bộ tài liệu chi tiết được tổ chức quy củ trong thư mục [`docs/`](docs/):

- **[Tài liệu Walkthrough Chi Tiết Từng Bước (docs/Lab_Walkthrough.md)](docs/Lab_Walkthrough.md)**: Hướng dẫn khai thác thủ công bằng lệnh `curl`, phân tích cấu trúc gói tin HTTP và Flight payload.
- **[Kịch Bản Diễn Tập Cyber Range & Hướng Dẫn Blue Team (docs/Cyber_Range_Scenario.md)](docs/Cyber_Range_Scenario.md)**: Ma trận MITRE ATT&CK, quy tắc phát hiện Sigma, luật tường lửa Suricata/Snort và danh sách IoCs.
- **[Tài Liệu Kiến Trúc Kỹ Thuật & Hardening (docs/Architecture_And_Hardening.md)](docs/Architecture_And_Hardening.md)**: Phân tích kiến trúc Nginx Reverse Proxy, hệ thống bẫy Decoys, Singleton Connection Pool và cơ chế RBAC.

---

## ⚠️ Tuyên Bố Từ Chối Trách Nhiệm (Disclaimer)

Ứng dụng và mã nguồn này được cung cấp **chỉ phục vụ mục đích học tập, nghiên cứu và diễn tập an toàn thông tin được cấp phép**. Mọi hành vi sử dụng công cụ hoặc kiến thức này để tấn công hệ thống khi chưa có sự đồng ý bằng văn bản của chủ quản hệ thống là hành vi vi phạm pháp luật. Nhóm tác giả không chịu bất kỳ trách nhiệm nào đối với những thiệt hại do việc sử dụng sai mục đích gây ra.

---

## 📄 Bản Quyền & Giấy Phép

MIT License — Dành riêng cho mục đích đào tạo và nghiên cứu an ninh mạng.
