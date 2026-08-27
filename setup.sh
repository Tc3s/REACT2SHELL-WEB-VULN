#!/usr/bin/env bash
# =============================================================================
# The Academic Curator — React2Shell (CVE-2025-55182) Lab Setup Script
# =============================================================================
# Tự động hóa cài đặt, cấu hình môi trường và nạp dữ liệu cho bài lab Cyber Range
# =============================================================================

set -e

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_banner() {
    echo -e "${BLUE}${BOLD}"
    echo "================================================================================"
    echo "  🎓 THE ACADEMIC CURATOR — REACT2SHELL (CVE-2025-55182) LAB SETUP"
    echo "================================================================================"
    echo -e "${NC}"
}

log_info() {
    echo -e "${CYAN}[*]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[+]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[-]${NC} $1"
}

check_prerequisites() {
    log_info "Kiểm tra các gói phần mềm tiên quyết (Prerequisites)..."

    # 1. Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker chưa được cài đặt trên hệ thống. Vui lòng cài đặt Docker trước."
        exit 1
    fi

    # 2. Docker Compose
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        log_error "Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose."
        exit 1
    fi
    log_success "Docker & Docker Compose: Sẵn sàng (${DOCKER_COMPOSE})"

    # 3. Node.js & NPM (Dành cho chế độ Local Development)
    if command -v node &> /dev/null; then
        NODE_VER=$(node -v)
        log_success "Node.js: ${NODE_VER} đã cài đặt"
    else
        log_warn "Node.js chưa được cài đặt cục bộ (Vẫn có thể chạy qua Docker Stack toàn phần)."
    fi

    # 4. Python3 & Requests (Dành cho Exploit Harness)
    if command -v python3 &> /dev/null; then
        log_success "Python3: $(python3 --version) đã sẵn sàng"
        if ! python3 -c "import requests" &> /dev/null; then
            log_warn "Thư viện 'requests' của Python chưa được cài đặt. Cài đặt bằng: pip3 install requests"
        fi
    fi
}

setup_environment() {
    log_info "Khởi tạo tệp cấu hình biến môi trường (.env)..."
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Đã tạo .env từ .env.example"
        else
            cat << 'ENVEOF' > .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elearning"
AUTH_SECRET="k8sJ3mP9xR2vL5nQ7wF0yT4uA6bD1eH"
APP_HOST=localhost
AUTH_TRUST_HOST=true
DB_INTERNAL_HOST=elearning-db
DB_USER=readonly_auditor
DB_PASS=Learning@2026!
ENVEOF
            log_success "Đã tạo .env mặc định mới"
        fi
    else
        log_info "Tệp .env đã tồn tại, giữ nguyên cấu hình hiện tại."
    fi
}

start_services_and_seed() {
    log_info "Khởi động các dịch vụ Hạ tầng, Cơ sở dữ liệu & Cổng Decoy (Recon Rabbit Holes)..."
    
    # Khởi động postgres và các dịch vụ decoy qua compose
    $DOCKER_COMPOSE up -d postgres redis-decoy network-decoys

    log_info "Đang chờ PostgreSQL khởi động và sẵn sàng nhận kết nối..."
    MAX_RETRIES=30
    COUNT=0
    until docker exec elearning-db pg_isready -U postgres -d elearning &> /dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
        sleep 1
        COUNT=$((COUNT+1))
    done

    if [ $COUNT -eq $MAX_RETRIES ]; then
        log_error "Không thể kết nối đến PostgreSQL sau ${MAX_RETRIES} giây."
        exit 1
    fi
    log_success "PostgreSQL & Decoy Ports (21, 2222, 6379) đã sẵn sàng!"

    # Nếu có Node & NPM cục bộ, tiến hành cài đặt dependencies và nạp dữ liệu
    if command -v npm &> /dev/null; then
        log_info "Cài đặt các gói phụ thuộc NPM (--legacy-peer-deps)..."
        npm install --legacy-peer-deps --silent

        log_info "Đồng bộ hóa Prisma Schema và khởi tạo bảng..."
        npx prisma db push --accept-data-loss

        log_info "Nạp dữ liệu mẫu (Seed accounts & courses)..."
        npx prisma db seed
        log_success "Nạp dữ liệu Database mẫu hoàn tất!"
    fi
}

print_summary() {
    echo ""
    echo -e "${GREEN}${BOLD}================================================================================${NC}"
    echo -e "${GREEN}${BOLD} 🎉 THIẾT LẬP MÔI TRƯỜNG THÀNH CÔNG! HỆ THỐNG ĐÃ SẴN SÀNG!${NC}"
    echo -e "${GREEN}${BOLD}================================================================================${NC}"
    echo ""
    echo -e "${BOLD}📡 BẢN ĐỒ CỔNG DỊCH VỤ PHỤC VỤ RECONNAISSANCE (NMAP TARGET PROFILE):${NC}"
    echo -e "  • ${CYAN}Port 21/tcp:${NC}    FTP Decoy (${YELLOW}vsFTPd 3.0.5 — Anonymous Disabled / Rabbit Hole${NC})"
    echo -e "  • ${CYAN}Port 80/tcp:${NC}    Nginx Reverse Proxy (${GREEN}Target Web App${NC} / Khởi chạy qua Docker)"
    echo -e "  • ${CYAN}Port 2222/tcp:${NC}  SSH Decoy (${YELLOW}OpenSSH 8.9p1 — Publickey Only / Rabbit Hole${NC})"
    echo -e "  • ${CYAN}Port 3000/tcp:${NC}  Next.js 15 App Router (${GREEN}Main Target React2Shell RCE${NC})"
    echo -e "  • ${CYAN}Port 5432/tcp:${NC}  PostgreSQL 16 (${BLUE}Database — Stage 4 Pivoting Target${NC})"
    echo -e "  • ${CYAN}Port 6379/tcp:${NC}  Redis Decoy (${YELLOW}Redis 7 NOAUTH Required / Rabbit Hole${NC})"
    echo -e "  • ${CYAN}Port 8080/tcp:${NC}  Microservice Decoy (${YELLOW}Spring Boot Actuator Telemetry / Rabbit Hole${NC})"
    echo ""
    echo -e "${BOLD}📌 TÙY CHỌN KHỞI CHẠY:${NC}"
    echo -e "  1. ${CYAN}Chạy ứng dụng chế độ phát triển (Local Dev):${NC}"
    echo -e "     ${BOLD}npm run dev${NC}  -> Truy cập: ${YELLOW}http://localhost:3000${NC}"
    echo ""
    echo -e "  2. ${CYAN}Chạy toàn bộ hệ thống qua Docker + Nginx Reverse Proxy (Port 80 & 8080):${NC}"
    echo -e "     ${BOLD}docker compose up -d --build${NC} -> Truy cập: ${YELLOW}http://localhost:80${NC} & ${YELLOW}http://localhost:8080${NC}"
    echo ""
    echo -e "${BOLD}🔑 TÀI KHOẢN TRUY CẬP MẶC ĐỊNH:${NC}"
    echo -e "  • ${BOLD}Admin:${NC}    ${CYAN}admin@elearning.com${NC}     / ${YELLOW}password123${NC}"
    echo -e "  • ${BOLD}Lecturer:${NC} ${CYAN}lecturer@elearning.com${NC}  / ${YELLOW}password123${NC}"
    echo -e "  • ${BOLD}Student:${NC}  ${CYAN}student@elearning.com${NC}   / ${YELLOW}password123${NC}"
    echo ""
    echo -e "${BOLD}⚡ LỆNH TEST EXPLOIT TỰ ĐỘNG (REACT2SHELL KILL CHAIN):${NC}"
    echo -e "  ${BOLD}python3 scripts/exploit_react2shell.py --target http://localhost:3000${NC}"
    echo "================================================================================"
    echo ""
}

main() {
    print_banner
    check_prerequisites
    setup_environment
    start_services_and_seed
    print_summary
}

main "$@"
