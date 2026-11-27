# Security Policy

## Supported Versions

Only the version currently deployed at [ngjabach.blog](https://ngjabach.blog), built from the `main` branch, is supported.

## Reporting a Vulnerability

Please **do not** open a public issue for security problems. Instead, use GitHub's private
[**Report a vulnerability**](../../security/advisories/new) form in this repository's *Security* tab.

Please include what you found, how to reproduce it, and what an attacker could do with it.
You can expect an acknowledgement within a week. Fixes are deployed as soon as they are verified.

## How the Site Is Protected

- The admin session is a signed token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie that scripts cannot read. Logging out revokes it on the server.
- State-changing API requests from other websites are rejected (same-origin check).
- Login attempts are rate limited per IP address and per username.
- All API input is type and length checked before it reaches the database.
- Raw HTML in posts is sanitized: scripts, event handlers, `javascript:` links and iframes are removed.
- Production responses carry a Content-Security-Policy and other security headers.
- Dependencies are kept at `npm audit` = 0 known vulnerabilities.
