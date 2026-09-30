# FOXEL

**Verify security emails before trusting them.**

FOXEL is a concept prototype for an email verification system designed to help
users detect and avoid phishing attacks.

Instead of clicking links inside a received email, the user opens the sender's
official website manually and enters a verification token. The token is
designed to be checked against a server-side record; in this prototype, that
record is simulated locally in the browser.

> ⚠️ **Prototype notice**
>
> FOXEL is a concept demo. It is not connected to any real service.
> NOVA ID and ORBIT ACCOUNT are fictional services created solely for
> demonstration purposes.

---

## Problem

Phishing attacks often impersonate trusted services and include convincing
"verify your account" links. Users can be misled by:

- Look-alike domains
- Professional email templates
- Urgent language
- Spoofed sender names
- Fake security alerts

The weakest point in many attacks is the link inside the email.

FOXEL explores a different flow:

> Do not trust the link. Verify the token on the official site.

## Proposed Solution

FOXEL proposes a token-based verification flow:

1. A legitimate service sends a security email containing a verification code.
2. The user does not click links in the email.
3. The user opens the service's official website manually.
4. The user enters the verification code into a trusted verification portal.
5. The portal checks the code against a server-side security record.
6. The user receives a clear result: valid, expired, already used, invalid, or
   no matching email.

Because the token is tied to a server-side security event, an attacker cannot
make up a valid token simply by forging the contents of an email.

## How It Works

### Conceptual flow

```text
Security event happens
        ↓
Server generates high-entropy token
        ↓
Server stores token record or token hash
        ↓
Email delivers token to user
        ↓
User visits official verification page manually
        ↓
User enters token
        ↓
Server validates token against stored record
        ↓
User sees verification result
```

### In this prototype

This prototype runs fully in the browser.

- `tokens.js` simulates the token record store.
- `api.js` simulates the verification endpoint.
- `ui.js` renders results.
- `app.js` connects events and state.

The token is designed to be checked against a server-side record; in this
prototype, that record is simulated locally in the browser so the demo is
self-contained.

## Verification States

FOXEL distinguishes several failure states:

| State               | Meaning                                                         |
| ------------------- | --------------------------------------------------------------- |
| Valid               | Token exists, is unused, and is still inside its validity time. |
| Expired token       | Token existed, but its validity window has passed.              |
| Already used        | Token was already verified once.                                |
| Invalid token       | Token format is not recognized.                                 |
| No matching email   | Token format is valid, but no server record exists.             |

For unknown or malformed tokens, the prototype intentionally does not expose
detailed security metadata.

## Security Considerations

### High-entropy tokens

In a real system, tokens should be generated using a cryptographically secure
random number generator, for example `crypto.randomBytes` on Node.js or an
equivalent CSPRNG on the server platform.

Short numeric codes may be user-friendly, but they require careful rate
limiting and monitoring.

### Hashed storage

Tokens should not be stored in plaintext in production.

A safer production pattern is:

```text
Email token
    ↓
SHA-256(token)
    ↓
Database stores hash only
```

During verification:

```text
User submits token
    ↓
Server hashes submitted token
    ↓
Server compares hash against stored hash
```

For sufficiently high-entropy tokens, storing only a cryptographic hash
significantly reduces the impact of a database breach.

### Single-use tokens

Once a token is successfully verified, it should be marked as used and rejected
on future attempts.

### Short validity window

Tokens should expire after a limited time, for example 15–30 minutes, depending
on the security event type.

### No details for invalid tokens

When a token is unknown or malformed, the system should not return detailed
information about accounts, devices, locations, or security events.

This reduces the value of token-probing attacks.

### Rate limiting

A production verification endpoint should include:

- per-IP rate limiting
- per-account rate limiting where applicable
- exponential backoff after failed attempts
- CAPTCHA or proof-of-work after suspicious activity
- audit logging
- anomaly detection

### No sensitive credentials

FOXEL should never ask for:

- passwords
- session cookies
- full credit card numbers
- government IDs
- private keys
- authentication codes unrelated to the verification token

The verification page should only accept the token itself.

## Demo Limitations

This prototype is intentionally limited:

- All data is mocked in the browser.
- No real email is sent or received.
- No real service is integrated.
- NOVA ID and ORBIT ACCOUNT are fictional demo services.
- Tokens are stored in plaintext in the mock store.
- There is no real database.
- There is no real authentication.
- There is no real rate limiting.
- There is no persistent storage across page reloads.
- Token generation is not implemented; only verification is demonstrated.

The plaintext mock storage is acceptable for a browser demo, but it is **not
acceptable for production**.

## Project Structure

```text
foxel/
├── index.html      ← Application shell
├── styles.css      ← UI styling
├── app.js          ← Application logic
├── api.js          ← Mock verification API
├── tokens.js       ← Mock token database
├── ui.js           ← UI rendering and state updates
├── README.md       ← Documentation
└── LICENSE         ← MIT License
```

## Running the Prototype

Open `index.html` in a modern browser.

Alternatively, serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Demo Tokens

| Token                | Scenario           |
| -------------------- | ------------------ |
| `FX8K-2M4P-Q9R7`     | Valid              |
| `FX3N-7B2V-L5T1`     | Expired            |
| `FX6W-9C8H-J4Y3`     | Already used       |
| `INVALID`            | Invalid format     |
| `FX00-0000-0000`     | No matching email  |

After a successful verification, the valid demo token becomes "already used"
until the page is reloaded.

## Future Improvements

### Production architecture

A real FOXEL-style system could be integrated into an existing service like
this:

```text
[User]
   ↓
[Official website of Service X]
   ↓
[Verification API]
   ↓
[Token database]
   ↑
[Service X security event system]
   ↓
[Email delivery system]
   ↓
[User inbox]
```

### Token service

A dedicated token service could be responsible for:

- generating high-entropy tokens
- hashing tokens before storage
- associating tokens with security events
- enforcing expiration windows
- marking tokens as used
- returning safe verification results

Example conceptual record:

```json
{
  "token_id": "tok_example",
  "token_hash": "sha256_hash_here",
  "service_id": "nova_id",
  "event_type": "password_reset",
  "event_id": "evt_example",
  "created_at": "2026-09-27T10:40:00Z",
  "expires_at": "2026-09-27T11:10:00Z",
  "used_at": null
}
```

### Verification endpoint

A production endpoint could look like:

```http
POST /api/verify
Content-Type: application/json

{
  "token": "FX8K-2M4P-Q9R7"
}
```

Possible response:

```json
{
  "ok": true,
  "status": "valid",
  "sender": "NOVA ID",
  "emailType": "Password reset",
  "sentAt": "2026-09-27T10:40:00Z"
}
```

For invalid or unknown tokens:

```json
{
  "ok": false,
  "status": "no_matching_email"
}
```

No detailed metadata should be returned for unknown tokens.

### Product-level additions

Possible future features:

- Real service branding.
- Signed verification responses.
- DMARC / BIMI integration for sender confidence.
- Device-bound verification.
- Push-based verification.
- Browser extension integration.
- Mail client plugin integration.
- Enterprise audit dashboard.
- Multi-language support.
- Accessibility audit.
- Formal threat model.

### Important design caution

FOXEL should not become a centralized "is this email safe?" oracle for all
services unless carefully designed. A safer model is:

- Each service operates its own official verification portal.
- FOXEL can be the protocol, UI pattern, or reusable verification component.
- Users are trained to visit the service domain themselves.

This avoids creating a single high-value target for attackers.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE)
file for details.
