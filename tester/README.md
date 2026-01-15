# KairoIO Tester Tools

This directory contains testing tools for the KairoIO Server API.

## Tools

### 1. `registrator.py` - Interactive Account Registration ⭐

**Use this to create a new account!**

Guides you through the registration process step-by-step:
1. Prompts for email and password
2. Sends verification code request
3. **Waits for you to enter the verification code from email/logs**
4. Completes registration
5. Saves credentials to `_test_acount` for future testing

```bash
python3 registrator.py
```

**Interactive prompts:**
```
Email address: your-email@example.com
Password: YourPassword123
Verification code (6 digits): 417846
```

> [!TIP]
> If email is not configured, check the server terminal for the verification code in logs.

---

### 2. `test_api.py` - Comprehensive API Test Suite

Tests all API endpoints using credentials from `_test_acount` file.

```bash
python3 test_api.py
```

**Tests:**
- ✅ Health & version endpoints
- ✅ Authentication (login/register)
- ✅ Robot management (CRUD operations)

---

## Quick Start

### First Time Setup

1. **Register an account:**
   ```bash
   python3 registrator.py
   ```

2. **Test the API:**
   ```bash
   python3 test_api.py
   ```

### Existing Account

If you already have an account, manually create `_test_acount`:
```
your-email@example.com
YourPassword123
any-old-code
```

Then run:
```bash
python3 test_api.py
```

---

## File Reference

| File | Purpose |
|------|---------|
| `registrator.py` | Interactive account registration |
| `test_api.py` | Automated API testing |
| `_test_acount` | Stored credentials (3 lines: email, password, code) |
| `README.md` | This file |

---

## Getting Verification Codes

### Method 1: Email (if SMTP is configured)
Check your email inbox for the 6-digit code.

### Method 2: Server Logs (if SMTP not configured)
Watch the server terminal output:
```
INSERT INTO `email_verification_codes` VALUES ("test@example.com","417846",...)
```
The code is `417846` in this example.

---

## Troubleshooting

**Can't connect to server**
```bash
cd ../release
./kairoio-server-linux-amd64
```

**Invalid verification code**
- Codes expire after 10 minutes
- Run `registrator.py` again to get a fresh code
- Make sure you're using the latest code from the logs

**Login fails in test_api.py**
- Verify credentials in `_test_acount` are correct
- Password must match what you used during registration
