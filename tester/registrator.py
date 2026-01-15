#!/usr/bin/env python3
"""
KairoIO Server - Interactive Account Registration

This script helps you register a new account on the KairoIO Server
by guiding you through the verification process.
"""

import requests
import json
import sys
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8080"
TEST_ACCOUNT_FILE = Path(__file__).parent / "_test_acount"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.RESET}")

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{msg}{Colors.RESET}")

def send_verification_code(email):
    """Send verification code to email"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register/send-code",
            headers={"Content-Type": "application/json"},
            json={"email": email}
        )
        data = response.json()
        
        # Even if sending email fails, the code is still generated and logged
        if response.status_code == 500 or not data.get('success'):
            print_warning("Email sending failed (SMTP not configured)")
            print_info("The verification code has been saved to the server")
            print_warning("Check the server logs for the verification code!")
            print_info("Look for a line like: INSERT INTO `email_verification_codes` VALUES (...)")
            return True
        
        if data.get('success'):
            print_success("Verification code sent successfully!")
            return True
        else:
            print_error(f"Failed to generate verification code: {data.get('error')}")
            return False
    except Exception as e:
        print_error(f"Error sending verification code: {e}")
        return False

def register_account(email, password, code):
    """Register account with verification code"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            headers={"Content-Type": "application/json"},
            json={
                "email": email,
                "password": password,
                "code": code
            }
        )
        data = response.json()
        
        if response.status_code == 200 and data.get('success'):
            cert_key = data.get('data', {}).get('certification_key')
            account_id = data.get('data', {}).get('id')
            print_success("Registration successful! 🎉")
            print_info(f"Account ID: {account_id}")
            print_info(f"Certification Key: {cert_key}")
            return True
        else:
            error_msg = data.get('error', 'Unknown error')
            print_error(f"Registration failed: {error_msg}")
            
            if 'verification code' in error_msg.lower():
                print_warning("The verification code is incorrect or expired")
                print_warning("Codes expire after 10 minutes")
                print_info("You can restart this script to get a new code")
            
            return False
    except Exception as e:
        print_error(f"Error during registration: {e}")
        return False

def save_credentials(email, password, code):
    """Save credentials to _test_acount file"""
    try:
        with open(TEST_ACCOUNT_FILE, 'w') as f:
            f.write(f"{email}\n")
            f.write(f"{password}\n")
            f.write(f"{code}\n")
        print_success(f"Credentials saved to {TEST_ACCOUNT_FILE}")
    except Exception as e:
        print_error(f"Failed to save credentials: {e}")

def main():
    """Main registration flow"""
    print("\n" + "="*60)
    print(f"{Colors.BOLD}{Colors.CYAN}KairoIO Server - Account Registration{Colors.RESET}")
    print("="*60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            print_success("Server is running")
        else:
            print_error("Server returned unexpected status")
    except:
        print_error("Cannot connect to server!")
        print_info(f"Make sure the server is running on {BASE_URL}")
        print_info("Run: cd release && ./kairoio-server-linux-amd64")
        sys.exit(1)
    
    # Get user input
    print_header("Step 1: Enter your email and password")
    
    # Email input
    while True:
        email = input(f"\n{Colors.CYAN}Email address: {Colors.RESET}").strip()
        if '@' in email and '.' in email:
            break
        print_error("Please enter a valid email address")
    
    # Password input
    while True:
        password = input(f"{Colors.CYAN}Password: {Colors.RESET}").strip()
        if len(password) >= 4:
            break
        print_error("Password must be at least 4 characters")
    
    # Send verification code
    print_header("Step 2: Requesting verification code")
    print_info(f"Sending verification code to {email}...")
    
    if not send_verification_code(email):
        print_error("\nFailed to send verification code")
        sys.exit(1)
    
    # Wait for user to get verification code
    print_header("Step 3: Enter verification code")
    print_info("Check your email for the 6-digit verification code")
    print_warning("If email is not configured, check the server terminal logs")
    print_info("The code will expire in 10 minutes\n")
    
    # Code input with retry
    max_attempts = 3
    for attempt in range(max_attempts):
        code = input(f"{Colors.CYAN}Verification code (6 digits): {Colors.RESET}").strip()
        
        if len(code) != 6 or not code.isdigit():
            print_error("Code must be exactly 6 digits")
            continue
        
        print_header("Step 4: Registering account")
        print_info("Submitting registration...")
        
        if register_account(email, password, code):
            # Success! Save credentials
            save_credentials(email, password, code)
            
            print_header("✓ Registration Complete!")
            print_info("You can now use test_api.py to test all endpoints")
            print_info(f"Run: python3 test_api.py")
            sys.exit(0)
        
        attempts_left = max_attempts - attempt - 1
        if attempts_left > 0:
            print_warning(f"\nYou have {attempts_left} attempt(s) remaining")
            print_info("Would you like to try again? (y/n)")
            retry = input(f"{Colors.CYAN}> {Colors.RESET}").strip().lower()
            if retry != 'y':
                break
    
    print_error("\nRegistration failed after maximum attempts")
    print_info("You can run this script again to start over")
    sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Registration cancelled by user{Colors.RESET}")
        sys.exit(0)
