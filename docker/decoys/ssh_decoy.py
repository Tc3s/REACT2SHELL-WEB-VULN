import socket
import threading
import time

def handle_client(client_socket):
    try:
        client_socket.sendall(b"SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6\r\n")
        time.sleep(1)
        data = client_socket.recv(1024)
        if data:
            client_socket.sendall(b"\x00\x00\x00\x1c\x07\x00\x00\x00\x01\x00\x00\x00\x0eAuthentication\x00\x00\x00\x06failed")
    except Exception:
        pass
    finally:
        client_socket.close()

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", 2222))
    server.listen(10)
    while True:
        client, _ = server.accept()
        threading.Thread(target=handle_client, args=(client,), daemon=True).start()

if __name__ == "__main__":
    main()
