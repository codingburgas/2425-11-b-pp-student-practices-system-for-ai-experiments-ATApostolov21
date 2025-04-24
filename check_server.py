import socket
import subprocess
import time
import sys

def check_port(port):
    """Check if a port is in use."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()
    return result == 0

print("Checking ports for Flask server...")

# Check if port 5000 is in use
if check_port(5000):
    print("Port 5000 is in use")
else:
    print("Port 5000 is not in use")

# Check if port 5001 is in use
if check_port(5001):
    print("Port 5001 is in use")
else:
    print("Port 5001 is not in use")

# List processes using ports 5000 and 5001
print("\nProcesses using port 5000:")
subprocess.run("lsof -i :5000", shell=True)

print("\nProcesses using port 5001:")
subprocess.run("lsof -i :5001", shell=True)

print("\nActive Python processes:")
subprocess.run("ps aux | grep python", shell=True) 