# 🛡️ Kịch Bản Diễn Tập Cyber Range: React2Shell (The Academic Curator)

## 1. TỔNG QUAN KỊCH BẢN

Kịch bản diễn tập mô phỏng cuộc tấn công Red Team có chủ đích vào nền tảng giáo dục điện tử **The Academic Curator** được xây dựng trên kiến trúc Next.js 15.0.3 App Router và React Server Components (RSC):
1. **Initial Access**: Đăng ký hoặc thu thập phiên sinh viên (`STUDENT`) thông qua NextAuth v5.
2. **Privilege Escalation**: Khai thác kết hợp **IDOR** và **Mass Assignment** trên Server Action cập nhật hồ sơ `updateUserProfile` để leo thang đặc quyền lên `LECTURER`.
3. **Framework-level RCE (React2Shell / CVE-2025-55182)**: Khai thác cơ chế Insecure Deserialization của React Server Components Flight Protocol (`requireModule` / prototype traversal) tại Server Action `createAssignment` để thực thi mã tùy ý (RCE) trên tiến trình Node.js.
4. **Internal Pivoting & Lateral Movement**: Trích xuất biến môi trường (`.env`), thu thập credentials và khai thác cơ sở dữ liệu PostgreSQL nội bộ (`elearning-db:5432`).
5. **Data Exfiltration & Impact**: Chiếm đoạt toàn bộ cơ sở dữ liệu người dùng và thiết lập kiểm soát.

---

## 2. BẢNG ÁNH XẠ MITRE ATT&CK & DẤU HIỆU NHẬN BIẾT

| Giai đoạn | Kỹ thuật MITRE ATT&CK | Hành động của Red Team | Dấu hiệu Nhận biết (Blue Team / SIEM) |
|---|---|---|---|
| **1. Recon & Initial Access** | Active Scanning (`T1595`), Valid Accounts (`T1078`) | Quét cổng, nhận diện Next.js 15 / React 19 RC; Đăng nhập sinh viên qua `/api/auth/callback/credentials`. | HTTP POST `/api/auth/callback/credentials`; Cookie `authjs.session-token` được cấp cho tài khoản sinh viên. |
| **2. Privilege Escalation** | Exploitation for Privilege Escalation (`T1068`) | Gửi payload cập nhật hồ sơ chứa `"role": "LECTURER"` qua Server Action `updateUserProfile` (Action ID: `0003834f...`). Đăng nhập lại lấy JWT mới. | Cột `role` trong bảng `User` bị thay đổi trực tiếp từ `STUDENT` sang `LECTURER`. Lưu lượng POST mang header `Next-Action: 0003834fbecc7cc1359c9730a8fda880e2b5306d07`. |
| **3. Framework RCE (React2Shell)** | Exploit Public-Facing Application (`T1190`), Command & Scripting Interpreter (`T1059.004`) | Gửi Flight Protocol payload qua Server Action `createAssignment` (Action ID: `408c92d5...`), kích hoạt prototype traversal `$2:constructor:constructor` để thực thi lệnh OS. | HTTP POST multipart/form-data chứa header `Next-Action: 408c92d53a78edb220ec3787802802d39f9d02e4cf` và body chứa chuỗi `constructor:constructor`, `$F1`. Tiến trình `node` sinh ra tiến trình con (`sh`, `bash`, `uname`, `cat`). |
| **4. Internal Recon & Pivoting** | Credentials from Password Stores (`T1555`), Internal Proxy (`T1090.001`) | Đọc file `.env` thu thập `AUTH_SECRET`, `DATABASE_URL`, `DB_USER`, `DB_PASS`; Kết nối vào container database nội bộ `elearning-db:5432`. | Tiến trình `node` đọc tệp `.env`. Kết nối TCP nội bộ từ Web Server (`172.18.0.x`) đến Database (`elearning-db:5432`) với lưu lượng bất thường. |
| **5. Exfiltration & Persistence** | Data from Local System (`T1005`), Data Encrypted for Impact (`T1486`) | Dump toàn bộ bảng `User` và `Assignment` từ PostgreSQL; Trích xuất password hash của quản trị viên. | Truy vấn `SELECT * FROM "User"` hàng loạt qua kết nối trực tiếp; Lưu lượng dữ liệu lớn được truyền tải ra ngoài. |

---

## 3. QUY TẮC PHÁT HIỆN DÀNH CHO BLUE TEAM (DETECTION ENGINEERING)

### 3.1 Sigma Rule: Phát hiện Khai thác React2Shell qua Flight Stream
```yaml
title: React Server Components Flight Deserialization Exploit (CVE-2025-55182)
id: 8421e71f-029c-4a75-8480-react2shell
status: experimental
description: Phát hiện các yêu cầu HTTP multipart chứa chuỗi prototype traversal nhằm vào Server Actions trong React/Next.js
logsource:
    category: webserver
    product: nextjs
detection:
    selection_headers:
        c-uri|contains:
            - '/lecturer/'
            - '/student/'
            - '/admin/'
        http_method: 'POST'
        http_next_action|exists: true
    selection_payload:
        http_request_body|contains:
            - 'constructor:constructor'
            - '$F'
            - 'child_process'
            - 'execSync'
    condition: selection_headers and selection_payload
level: critical
tags:
    - attack.initial_access
    - attack.t1190
    - attack.execution
    - attack.t1059.004
```

### 3.2 Suricata / Snort WAF Rule
```suricata
alert http any any -> any $HTTP_PORTS (
    msg:"EXPLOIT React Server Components Insecure Deserialization (CVE-2025-55182)";
    flow:established,to_server;
    content:"POST"; http_method;
    content:"Next-Action"; http_header;
    content:"constructor:constructor"; http_client_body;
    classtype:web-application-attack;
    sid:202655182; rev:1;
)
```

---

## 4. CHỈ SỐ NHẬN DIỆN TẤN CÔNG (INDICATORS OF COMPROMISE - IOCS)

- **Network IoCs**:
  - Yêu cầu POST bất thường đến endpoint `/lecturer/assignments` hoặc `/student/settings`.
  - Header HTTP `Next-Action`:
    - `0003834fbecc7cc1359c9730a8fda880e2b5306d07` (`updateUserProfile`)
    - `408c92d53a78edb220ec3787802802d39f9d02e4cf` (`createAssignment`)
- **Host / Process IoCs**:
  - Tiến trình cha `node / next-server` sinh ra các tiến trình con `sh`, `bash`, `id`, `whoami`, `cat .env`.
  - Thao tác mở file descriptor đọc `.env` từ các worker thread bất thường.
- **Database IoCs**:
  - Bản ghi tài khoản sinh viên có `role` chuyển thành `LECTURER` trong bảng `User` mà không có nhật ký quản trị từ `admin@elearning.com`.

---

## 5. CÔNG CỤ TỰ ĐỘNG HÓA RED TEAM
Kịch bản diễn tập cung cấp script kiểm thử tự động toàn diện:
```bash
python3 scripts/exploit_react2shell.py --target http://localhost:3000 --cmd "id && uname -a"
```
