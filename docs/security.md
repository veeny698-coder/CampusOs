# Security baseline

No software is hackproof. Target defense in depth: tenant isolation, least privilege, RLS, validated input, rate limiting, audit logs, secure session cookies, MFA for privileged accounts, secret scanning, CI tests, backups and incident response. Never trust client-provided role claims. Super-admin bypass must be implemented only in tightly controlled server endpoints with step-up authentication and full auditing. Do not put Supabase service-role keys or n8n credentials in NEXT_PUBLIC variables.
