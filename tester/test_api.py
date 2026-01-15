#!/usr/bin/env python3
"""
KairoIO Server API Tester

This script tests all the API endpoints of the KairoIO Server.
It reads test account credentials from _test_acount file.
"""

import requests
import json
import sys
import os
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
    RESET = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.RESET}")

def load_test_account():
    """Load test account credentials from file"""
    try:
        with open(TEST_ACCOUNT_FILE, 'r') as f:
            lines = [line.strip() for line in f.readlines()]
            return {
                'email': lines[0] if len(lines) > 0 else None,
                'password': lines[1] if len(lines) > 1 else None,
                'code': lines[2] if len(lines) > 2 else None
            }
    except FileNotFoundError:
        print_error(f"Test account file not found: {TEST_ACCOUNT_FILE}")
        return None

def test_health():
    """Test /health endpoint"""
    print_info("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check passed: {data}")
            return True
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False

def test_version():
    """Test /version endpoint"""
    print_info("Testing /version endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/version")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Version check passed: {data}")
            return True
        else:
            print_error(f"Version check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Version check error: {e}")
        return False

def test_send_verification_code(email):
    """Test POST /api/v1/auth/register/send-code"""
    print_info(f"Testing send verification code for {email}...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register/send-code",
            headers={"Content-Type": "application/json"},
            json={"email": email}
        )
        data = response.json()
        if response.status_code == 200 and data.get('success'):
            print_success(f"Verification code sent successfully")
            print_warning("Check server logs for the verification code")
            return True
        else:
            print_warning(f"Send verification code: {data}")
            return False
    except Exception as e:
        print_error(f"Send verification code error: {e}")
        return False

def test_register(email, password, code):
    """Test POST /api/v1/auth/register"""
    print_info(f"Testing registration for {email}...")
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
            print_success(f"Registration successful!")
            print_info(f"Certification Key: {cert_key}")
            return cert_key
        else:
            print_error(f"Registration failed: {data}")
            return None
    except Exception as e:
        print_error(f"Registration error: {e}")
        return None

def test_login(email, password):
    """Test POST /api/v1/auth/login"""
    print_info(f"Testing login for {email}...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            headers={"Content-Type": "application/json"},
            json={
                "username": email,  # API expects 'username' field (can be email)
                "password": password
            }
        )
        data = response.json()
        if response.status_code == 200 and data.get('success'):
            cert_key = data.get('data', {}).get('certification_key')
            print_success(f"Login successful!")
            print_info(f"Certification Key: {cert_key}")
            return cert_key
        else:
            print_error(f"Login failed: {data}")
            return None
    except Exception as e:
        print_error(f"Login error: {e}")
        return None

def get_schema_example(schema_id):
    """Fetch schema example from API"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/schemas/{schema_id}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('data', {}).get('example')
    except Exception as e:
        print_warning(f"Failed to fetch schema {schema_id}: {e}")
    return None

def test_register_robot(cert_key, robot_id="test-robot-001", name="Test Robot", robot_type="ESP32"):
    """Test POST /api/v1/robots"""
    print_info(f"Testing robot registration: {robot_id}...")
    
    # Fetch example from schema
    payload = get_schema_example("register_robot_request")
    if not payload:
        print_warning("Could not fetch schema example, using fallback payload")
        # Fallback to hardcoded payload
        payload = {
            "robot_id": robot_id,
            "robot_name": name,
            "robot_type": robot_type
        }
    else:
        print_info("Using payload from schema example")
        # Override ID in example to match test arg
        # Note: keys depend on schema (likely camelCase vs snake_case issue)
        if "robotId" in payload: payload["robotId"] = robot_id
        if "robot_id" in payload: payload["robot_id"] = robot_id
        
        # Override name if present
        if "robotName" in payload: payload["robotName"] = name
        if "robot_name" in payload: payload["robot_name"] = name

    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/robots",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {cert_key}"
            },
            json=payload
        )
        data = response.json()
        if response.status_code == 200 and data.get('success'):
            print_success(f"Robot registered successfully: {data}")
            return True
        else:
            print_error(f"Robot registration failed: {data}")
            return False
    except Exception as e:
        print_error(f"Robot registration error: {e}")
        return False

def test_list_robots(cert_key):
    """Test GET /api/v1/robots"""
    print_info("Testing list robots...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/robots",
            headers={"Authorization": f"Bearer {cert_key}"}
        )
        data = response.json()
        if response.status_code == 200 and data.get('success'):
            robots_data = data.get('data', {})
            robots = robots_data.get('robots', [])
            print_success(f"Retrieved {len(robots)} robot(s)")
            for robot in robots:
                print_info(f"  - {robot.get('id')}: {robot.get('robot_name')}")
            return True
        else:
            print_error(f"List robots failed: {data}")
            return False
    except Exception as e:
        print_error(f"List robots error: {e}")
        return False

def test_update_robot_status(cert_key, robot_id="test-robot-001"):
    """Test POST /api/v1/robots/{robotId}/status"""
    print_info(f"Testing update robot status for {robot_id}...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/robots/{robot_id}/status",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {cert_key}"
            },
            json={
                "status": {
                    "status": "online",
                    "temperature": 25.5,
                    "battery": 87,
                    "location": "Building A"
                }
            }
        )
        data = response.json()
        if response.status_code == 200 and data.get('success'):
            print_success(f"Robot status updated successfully")
            return True
        else:
            print_error(f"Update robot status failed: {data}")
            return False
    except Exception as e:
        print_error(f"Update robot status error: {e}")
        return False

def test_get_robot_status(cert_key, robot_id="test-robot-001"):
    """Test GET /api/v1/robots/{robotId}/status"""
    print_info(f"Testing get robot status for {robot_id}...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/robots/{robot_id}/status",
            headers={"Authorization": f"Bearer {cert_key}"}
        )
        data = response.json()
        if response.status_code == 200 and data.get('success'):
            status = data.get('data')
            print_success(f"Robot status retrieved: {status}")
            return True
        else:
            print_error(f"Get robot status failed: {data}")
            return False
    except Exception as e:
        print_error(f"Get robot status error: {e}")
        return False

def run_dynamic_tests(cert_key):
    """Run tests dynamically based on discovered schemas"""
    print("\n--- Dynamic Schema Tests ---")
    
    try:
        # Get schema index
        response = requests.get(f"{BASE_URL}/api/v1/schemas")
        if response.status_code != 200:
            print_error("Failed to fetch schema index")
            return

        index = response.json().get('data', {})
        schemas = index.get('schemas', [])
        # Sort by ID to ensure register (re...) comes before robot_status (ro...)
        schemas.sort(key=lambda x: x.get('id', ''))
        print_info(f"Discovered {len(schemas)} schemas")

        import random
        random_suffix = random.randint(1000, 9999)
        test_robot_id = f"test-robot-dynamic-{random_suffix}"
        print_info(f"Using test robot ID: {test_robot_id}")

        for schema_entry in schemas:
            schema_id = schema_entry.get('id')
            endpoint = schema_entry.get('endpoint')
            method = schema_entry.get('method', 'POST') # Default to POST if not specified
            
            if not endpoint:
                continue

            print_info(f"  Testing schema: {schema_id} ({method} {endpoint})")
            
            # Prepare payload
            payload = get_schema_example(schema_id)
            if not payload:
                print_warning(f"    Skipping {schema_id}: No example found")
                continue

            # Resolve path parameters (basic support for robot_id)
            url = f"{BASE_URL}{endpoint}".replace("{robot_id}", test_robot_id).replace("{robotId}", test_robot_id)
            
            # Special case: Register robot needs a unique ID if we run multiple times
            if schema_id == "register_robot_request":
                 # Use the variable from path replacement logic for consistency
                 if "robot_id" in payload: payload["robot_id"] = test_robot_id
                 if "robotId" in payload: payload["robotId"] = test_robot_id

            try:
                if method.upper() == "POST":
                    resp = requests.post(url, json=payload, headers={"Authorization": f"Bearer {cert_key}"})
                elif method.upper() == "GET":
                    resp = requests.get(url, headers={"Authorization": f"Bearer {cert_key}"})
                else:
                    print_warning(f"    Skipping {schema_id}: Unsupported method {method}")
                    continue
                
                resp_data = resp.json()
                if resp.status_code in [200, 201] and resp_data.get('success') != False: # some endpoints might just return data
                     print_success(f"    Success: {schema_id}")
                else:
                     print_error(f"    Failed {schema_id}: {resp_data}")

            except Exception as e:
                print_error(f"    Error executing {schema_id}: {e}")

    except Exception as e:
        print_error(f"Dynamic test error: {e}")

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("KairoIO Server API Test Suite")
    print("="*60 + "\n")

    # Load test account
    account = load_test_account()
    if not account or not account['email']:
        print_error("Failed to load test account credentials")
        sys.exit(1)
    
    print_info(f"Test Email: {account['email']}")
    print_info(f"Test Password: {'*' * len(account.get('password', ''))}")
    print()

    # Test public endpoints
    print("\n--- Public Endpoints ---")
    test_health()
    test_version()
    
    # Test authentication flow
    print("\n--- Authentication Flow ---")
    
    # Try to login with existing account
    cert_key = test_login(account['email'], account['password'])
    
    if not cert_key:
        print_error("\n❌ Login failed. Cannot proceed with protected endpoint tests.")
        print_warning("Please check:")
        print_warning("1. Server is running")
        print_warning("2. Account exists (use registrator.py to create one)")
        print_warning("3. Credentials in _test_acount are correct")
        sys.exit(1)
    
    # Run Dynamic Tests (Driven by JSON Schemas)
    run_dynamic_tests(cert_key)
    
    # Manual Tests (Legacy/Specific flows)
    # print("\n--- Protected Endpoints (Manual Checks) ---")
    # test_register_robot(cert_key)
    # test_list_robots(cert_key)
    # test_update_robot_status(cert_key)
    # test_get_robot_status(cert_key)
    
    print("\n" + "="*60)
    print_success("Test suite completed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
