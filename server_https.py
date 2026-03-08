import http.server
import ssl
import os
import subprocess

PORT = 8443
server_address = ('localhost', PORT)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

cert_file = 'server.pem'

if not os.path.exists(cert_file):
    print("Generating self-signed certificate...")
    # Generate a self-signed cert without requiring user input
    subprocess.call(
        'openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"', 
        shell=True
    )

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(cert_file)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving on https://localhost:{PORT}")
print("Note: Your browser will warn about the self-signed certificate. You can safely proceed for local development.")
httpd.serve_forever()
