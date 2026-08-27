import socket
import threading

def handle_client(client_socket):
    try:
        client_socket.sendall(b"220 (vsFTPd 3.0.5 - Academic Curator Archive Storage)\r\n")
        while True:
            data = client_socket.recv(1024)
            if not data:
                break
            cmd = data.decode('utf-8', errors='ignore').strip()
            if cmd.upper().startswith("USER"):
                client_socket.sendall(b"331 Please specify the password.\r\n")
            elif cmd.upper().startswith("PASS"):
                client_socket.sendall(b"530 Login incorrect. Anonymous access disabled on institutional gateway.\r\n")
            elif cmd.upper().startswith("QUIT"):
                client_socket.sendall(b"221 Goodbye.\r\n")
                break
            elif cmd.upper().startswith("SYST"):
                client_socket.sendall(b"215 UNIX Type: L8\r\n")
            elif cmd.upper().startswith("FEAT"):
                client_socket.sendall(b"211-Features:\r\n EPRT\r\n EPSV\r\n MDTM\r\n PASV\r\n REST STREAM\r\n SIZE\r\n TVFS\r\n UTF8\r\n211 End\r\n")
            else:
                client_socket.sendall(b"530 Please login with USER and PASS.\r\n")
    except Exception:
        pass
    finally:
        client_socket.close()

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", 21))
    server.listen(10)
    while True:
        client, _ = server.accept()
        threading.Thread(target=handle_client, args=(client,), daemon=True).start()

if __name__ == "__main__":
    main()
