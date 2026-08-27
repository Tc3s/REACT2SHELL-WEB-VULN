#!/usr/bin/env bash
# =============================================================================
# The Academic Curator — React2Shell (CVE-2025-55182) Lab Setup Script
# =============================================================================
# Tự động hóa cài đặt toàn diện (Zero-Touch Installer), cấu hình môi trường,
# nhận diện IP mạng LAN đa người dùng và nạp dữ liệu cho bài lab Cyber Range.
# =============================================================================

set -e

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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

# Helper to run commands with sudo if needed
run_sudo() {
    if [ "$(id -u)" -eq 0 ]; then
        "$@"
    elif command -v sudo &> /dev/null; then
        sudo "$@"
    else
        log_error "Lệnh này yêu cầu quyền root hoặc sudo nhưng không tìm thấy sudo."
        exit 1
    fi
}

# Auto-installer for missing host dependencies on Linux
install_missing_dependencies() {
    log_info "Phát hiện hệ điều hành và tự động cài đặt các gói phụ thuộc còn thiếu..."

    if command -v apt-get &> /dev/null; then
        log_info "Đang sử dụng APT Package Manager (Ubuntu/Debian)..."
        run_sudo apt-get update -qq

        # 1. Cơ bản: curl, git, ca-certificates, gnupg
        run_sudo apt-get install -y -qq curl git ca-certificates gnupg lsb-release

        # 2. Docker & Docker Compose
        if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
            log_info "Đang cài đặt Docker Engine và Docker Compose Plugin..."
            curl -fsSL https://get.docker.com | run_sudo sh || {
                run_sudo apt-get install -y docker.io docker-compose-v2
            }
            run_sudo systemctl enable --now docker || true
            if [ -n "$SUDO_USER" ]; then
                run_sudo usermod -aG docker "$SUDO_USER" || true
            elif [ -n "$USER" ] && [ "$USER" != "root" ]; then
                run_sudo usermod -aG docker "$USER" || true
            fi
            log_success "Đã cài đặt Docker thành công!"
        fi

        # 3. Node.js 20.x LTS & NPM
        if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
            log_info "Đang cài đặt Node.js 20.x LTS từ NodeSource..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | run_sudo -E bash -
            run_sudo apt-get install -y -qq nodejs
            log_success "Đã cài đặt Node.js $(node -v) & NPM $(npm -v)!"
        fi

        # 4. Python3, PIP, Requests
        if ! command -v python3 &> /dev/null || ! python3 -c "import requests" &> /dev/null; then
            log_info "Đang cài đặt Python3 và thư viện requests..."
            run_sudo apt-get install -y -qq python3 python3-pip python3-requests python3-websocket || {
                pip3 install requests websocket-client --break-system-packages --quiet || true
            }
            log_success "Đã chuẩn bị xong Python3 & Requests!"
        fi

    elif command -v dnf &> /dev/null; then
        log_info "Đang sử dụng DNF Package Manager (Fedora/RHEL/CentOS)..."
        run_sudo dnf install -y curl git python3 python3-pip nodejs docker-compose
        run_sudo systemctl enable --now docker || true
    else
        log_warn "Không thể nhận diện package manager tự động. Vui lòng cài đặt Docker, Node.js 20 và Python3 thủ công."
    fi
}

check_and_install_prerequisites() {
    log_info "Kiểm tra các gói phần mềm tiên quyết (Prerequisites)..."

    NEED_INSTALL=false

    if ! command -v docker &> /dev/null; then
        log_warn "Docker chưa được cài đặt."
        NEED_INSTALL=true
    fi

    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_warn "Docker Compose chưa được cài đặt."
        NEED_INSTALL=true
    fi

    if ! command -v node &> /dev/null; then
        log_warn "Node.js chưa được cài đặt."
        NEED_INSTALL=true
    fi

    if ! command -v python3 &> /dev/null || ! python3 -c "import requests" &> /dev/null; then
        log_warn "Python3 hoặc thư viện 'requests' chưa sẵn sàng."
        NEED_INSTALL=true
    fi

    if [ "$NEED_INSTALL" = true ] || [ "$1" = "--install-deps" ]; then
        log_info "Tiến hành tự động cài đặt toàn bộ các gói phần mềm cần thiết..."
        install_missing_dependencies
    fi

    # Xác định cú pháp Docker Compose
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        log_error "Không tìm thấy Docker Compose. Vui lòng kiểm tra lại dịch vụ Docker."
        exit 1
    fi
    log_success "Docker & Docker Compose: Sẵn sàng (${DOCKER_COMPOSE})"

    if command -v node &> /dev/null; then
        log_success "Node.js: $(node -v) & NPM $(npm -v) sẵn sàng"
    fi

    if command -v python3 &> /dev/null; then
        log_success "Python3: $(python3 --version) sẵn sàng"
    fi
}

detect_lan_ip() {
    # Tự động dò tìm IP LAN thực tế của máy chủ
    DETECTED_IP=""
    if command -v ip &> /dev/null; then
        DETECTED_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -n 1)
    fi

    if [ -z "$DETECTED_IP" ] && command -v hostname &> /dev/null; then
        DETECTED_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    if [ -z "$DETECTED_IP" ] || [ "$DETECTED_IP" = "127.0.0.1" ]; then
        DETECTED_IP="localhost"
    fi

    LAN_IP="$DETECTED_IP"
    log_success "Đã nhận diện địa chỉ IP máy chủ: ${LAN_IP}"
}

setup_environment() {
    log_info "Khởi tạo tệp cấu hình biến môi trường (.env)..."
    
    cat << ENVEOF > .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elearning"
AUTH_SECRET="k8sJ3mP9xR2vL5nQ7wF0yT4uA6bD1eH"

# Host binding configuration for Multi-User LAN Deployment
APP_HOST=${LAN_IP}
AUTH_TRUST_HOST=true

# Internal Infrastructure (Post-Exploitation Target)
DB_INTERNAL_HOST=elearning-db
DB_USER=readonly_auditor
DB_PASS=Learning@2026!
ENVEOF

    log_success "Đã tạo cấu hình .env tối ưu cho IP: ${LAN_IP}"
}

reset_database_state() {
    log_info "Khôi phục dữ liệu Database về trạng thái xuất phát điểm (Pristine Reset)..."
    
    if command -v npm &> /dev/null; then
        npx prisma db push --accept-data-loss --force-reset
        npx prisma db seed
        log_success "Khôi phục trạng thái Database thành công trong 2 giây!"
    else
        log_error "Yêu cầu Node.js / NPM để thực thi lệnh reset database."
        exit 1
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
    log_success "PostgreSQL & Decoy Ports (21, 2222, 6379) đã sẵn sàng hoạt động!"

    # Cài đặt dependencies và nạp dữ liệu
    if command -v npm &> /dev/null; then
        log_info "Cài đặt các gói phụ thuộc NPM (--legacy-peer-deps)..."
        npm install --legacy-peer-deps --silent

        log_info "Đồng bộ hóa Prisma Schema và khởi tạo bảng..."
        npx prisma db push --accept-data-loss

        log_info "Nạp dữ liệu mẫu (Seed accounts, courses, syllabus)..."
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
    echo -e "${BOLD}🌐 ĐỊA CHỈ TRUY CẬP HỆ THỐNG (MULTI-USER ACCESS):${NC}"
    echo -e "  • ${MAGENTA}Truy cập cục bộ (Local):${NC}  ${BOLD}http://localhost:3000${NC} (hoặc http://localhost:80)"
    if [ "$LAN_IP" != "localhost" ]; then
        echo -e "  • ${MAGENTA}Truy cập mạng LAN (Lab):${NC}  ${BOLD}http://${LAN_IP}:3000${NC} (hoặc http://${LAN_IP}:80)"
    fi
    echo ""
    echo -e "${BOLD}📌 TÙY CHỌN KHỞI CHẠY TIẾP THEO:${NC}"
    echo -e "  1. ${CYAN}Chạy ứng dụng chế độ phát triển (Local Dev):${NC}"
    echo -e "     ${BOLD}npm run dev${NC}"
    echo ""
    echo -e "  2. ${CYAN}Chạy toàn bộ hệ thống qua Docker Stack (Nginx + App + DB + Decoys):${NC}"
    echo -e "     ${BOLD}docker compose up -d --build${NC}"
    echo ""
    echo -e "  3. ${CYAN}Khôi phục bài lab về trạng thái ban đầu sau khi diễn tập:${NC}"
    echo -e "     ${BOLD}./setup.sh --reset${NC}"
    echo ""
    echo -e "${BOLD}🔑 TÀI KHOẢN TRUY CẬP MẶC ĐỊNH:${NC}"
    echo -e "  • ${BOLD}Admin:${NC}    ${CYAN}admin@elearning.com${NC}     / ${YELLOW}password123${NC}"
    echo -e "  • ${BOLD}Lecturer:${NC} ${CYAN}lecturer@elearning.com${NC}  / ${YELLOW}password123${NC}"
    echo -e "  • ${BOLD}Student:${NC}  ${CYAN}student@elearning.com${NC}   / ${YELLOW}password123${NC}"
    echo ""
    echo -e "${BOLD}⚡ LỆNH TEST EXPLOIT TỰ ĐỘNG (REACT2SHELL KILL CHAIN):${NC}"
    if [ "$LAN_IP" != "localhost" ]; then
        echo -e "  ${BOLD}python3 scripts/exploit_react2shell.py --target http://${LAN_IP}:3000${NC}"
    else
        echo -e "  ${BOLD}python3 scripts/exploit_react2shell.py --target http://localhost:3000${NC}"
    fi
    echo "================================================================================"
    echo ""
}

main() {
    print_banner

    if [ "$1" = "--reset" ]; then
        detect_lan_ip
        reset_database_state
        print_summary
        exit 0
    fi

    check_and_install_prerequisites "$1"
    detect_lan_ip
    setup_environment
    start_services_and_seed
    print_summary
}

main "$@"
