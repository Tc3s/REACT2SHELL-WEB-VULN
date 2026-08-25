# 🎯 The Academic Curator — Nền Tảng E-Learning Chứa Lỗ Hổng Bảo Mật (Lab Môi Trường Thử Nghiệm)

> **⚠️ CẢNH BÁO: Ứng dụng này được xây dựng CỐ Ý CHỨA CÁC LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG. Ứng dụng CHỈ được sử dụng cho mục đích đào tạo an toàn thông tin, diễn tập Cyber Range, kiểm thử xâm nhập (Penetration Testing) và các bài thi CTF được cấp phép. TUYỆT ĐỐI KHÔNG triển khai trên môi trường Production hoặc bất kỳ hệ thống mạng công cộng nào.**

---

## 📌 Tổng Quan Dự Án

**The Academic Curator** là một nền tảng quản lý học tập điện tử (LMS) hoàn chỉnh được xây dựng trên nền tảng công nghệ hiện đại (**Next.js 15.0.3 / React 19.0.0-rc / Node.js**). Hệ thống được cấu hình có chủ đích để mô phỏng một trong những lỗ hổng nghiêm trọng nhất trong hệ sinh thái React: **React2Shell (CVE-2025-55182)**.

Mục tiêu đào tạo của bài lab:
- Phương pháp luận kiểm thử xâm nhập ứng dụng web xây dựng trên kiến trúc React Server Components (RSC) và Server Actions.
- Khai thác lỗ hổng cơ chế phiên xác thực NextAuth v5 và lỗ hổng kiểm soát truy cập (Access Control).
- Khai thác lỗ hổng giải mã dữ liệu không an toàn (**Insecure Deserialization**) trên React Flight Protocol dẫn đến thực thi mã từ xa (**RCE**).
- Kỹ thuật xâu chuỗi đa lỗ hổng (IDOR $\rightarrow$ Mass Assignment $\rightarrow$ Framework-level RCE $\rightarrow$ Pivoting mạng nội bộ).

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

### Giai đoạn 1 — Truy Cập Ban Đầu (Initial Access)
Đăng ký hoặc đăng nhập với tài khoản sinh viên `STUDENT` (`student@elearning.com` / `password123`) qua endpoint `/api/auth/callback/credentials`. Trích xuất CSRF token và nhận cookie phiên JWT mã hóa (`authjs.session-token`).

### Giai đoạn 2 — Leo Thang Đặc Quyền (IDOR + Mass Assignment)
Server Action `updateUserProfile` tại `lib/actions/user.ts` tin cậy trực tiếp `userId` gửi lên từ client (lỗ hổng **IDOR**) và gán trực tiếp dữ liệu cập nhật vào cơ sở dữ liệu mà không lọc danh sách trắng thuộc tính (lỗ hổng **Mass Assignment**). Kẻ tấn công tiêm `"role": "LECTURER"` vào payload cập nhật. Đăng nhập lại để NextAuth cấp phiên mới mang đặc quyền `LECTURER`.

### Giai đoạn 3 — Khai Thác React Flight Deserialization RCE (React2Shell - CVE-2025-55182)
Với phiên `LECTURER`, kẻ tấn công truy cập `/lecturer/assignments`. Bằng cách gửi một HTTP POST multipart request mang định dạng stream React Flight Protocol tới Server Action `createAssignment`, kẻ tấn công khai thác cơ chế phân giải module không an toàn trong `react-server-dom-webpack` (`requireModule`). Chuỗi truy vết thuộc tính prototype `"$2:constructor:constructor"` phân giải trực tiếp đến hàm khởi tạo `Function` của JavaScript runtime, thực thi lệnh hệ điều hành tùy ý (**RCE**) trên tiến trình Node.js của máy chủ.

### Giai đoạn 4 — Khai Thác Hậu Xâm Nhập & Pivoting (Post-Exploitation)
Trích xuất thông tin bí mật từ tệp `.env` (`AUTH_SECRET`, `DATABASE_URL`), xác định kết nối tới container cơ sở dữ liệu PostgreSQL nội bộ (`elearning-db:5432`) trên dải mạng Docker bridge và trích xuất toàn bộ dữ liệu người dùng.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

| Tầng hệ thống | Công nghệ | Phiên bản | Ghi chú an ninh |
|---|---|---|---|
| **Framework** | Next.js (App Router) | **15.0.3** | Chứa lỗ hổng Server Action resolution |
| **Giao diện UI** | React / React DOM | **19.0.0-rc** | Bản thử nghiệm tiền phát hành |
| **Bộ giải mã RSC** | `react-server-dom-webpack` | **19.0.0-rc-66855b96** | **Chứa lỗ hổng CVE-2025-55182** |
| **Ngôn ngữ** | TypeScript (strict) | 5.x / 6.x | Kiểm tra kiểu tĩnh |
| **CSS Framework** | Tailwind CSS | 4.x | Giao diện hiện đại |
| **Cơ sở dữ liệu** | PostgreSQL / Prisma ORM | 16-alpine / Prisma 7.8.0 | Container mạng nội bộ |
| **Xác thực** | NextAuth (Auth.js) | v5 beta | JWT Session Tokens |

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

### 2. Các bước triển khai

```bash
# 1. Clone repository về máy
git clone https://github.com/Tc3s/REACT2SHELL-WEB-VULN.git && cd REACT2SHELL-WEB-VULN

# 2. Cài đặt các gói phụ thuộc (cần flag --legacy-peer-deps do phiên bản React RC)
npm install --legacy-peer-deps

# 3. Khởi chạy container cơ sở dữ liệu PostgreSQL
docker compose up -d

# 4. Cấu hình biến môi trường
cp .env.example .env

# 5. Đồng bộ cấu trúc bảng và nạp dữ liệu mẫu vào Database
npx prisma db push
npx prisma db seed

# 6. Khởi động Web Server phát triển
npm run dev
```

Truy cập ứng dụng tại: `http://localhost:3000`.

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

## 📖 Tài Liệu Hướng Dẫn Chi Tiết

- **[Tài liệu Walkthrough Chi Tiết Từng Bước (Lab_Walkthrough.md)](Lab_Walkthrough.md)**: Hướng dẫn khai thác thủ công bằng lệnh `curl`, phân tích cấu trúc gói tin HTTP và Flight payload.
- **[Kịch Bản Diễn Tập Cyber Range & Hướng Dẫn Blue Team (Cyber_Range_Scenario.md)](Cyber_Range_Scenario.md)**: Ma trận MITRE ATT&CK, quy tắc phát hiện Sigma, luật tường lửa Suricata/Snort và danh sách IoCs.

---

## ⚠️ Tuyên Bố Từ Chối Trách Nhiệm (Disclaimer)

Ứng dụng và mã nguồn này được cung cấp **chỉ phục vụ mục đích học tập, nghiên cứu và diễn tập an toàn thông tin được cấp phép**. Mọi hành vi sử dụng công cụ hoặc kiến thức này để tấn công hệ thống khi chưa có sự đồng ý bằng văn bản của chủ quản hệ thống là hành vi vi phạm pháp luật. Nhóm tác giả không chịu bất kỳ trách nhiệm nào đối với những thiệt hại do việc sử dụng sai mục đích gây ra.

---

## 📄 Bản Quyền & Giấy Phép

MIT License — Dành riêng cho mục đích đào tạo và nghiên cứu an ninh mạng.
