# HTB API connection status investigation

## Question
Confirm the correct Hack The Box API endpoint for connection status / machine progress, and whether the current endpoint `https://www.hackthebox.com/api/v4/user/connection/status` is valid.

## Findings

1. `https://www.hackthebox.com/api/v4/user/connection/status` returns HTTP 404 when fetched directly without auth.
2. The legacy `https://www.hackthebox.eu/api/v4/user/connection/status` now redirects to `https://www.hackthebox.com/api/v4/user/connection/status`.
3. The current HTB host for the API is now `https://labs.hackthebox.com/api` in public SDKs, and unauthenticated requests to `https://labs.hackthebox.com/api/v4/user/connection/status` redirect to `https://app.hackthebox.com/login`, which strongly suggests the endpoint exists there but requires authentication.
4. Public community docs for the v4 API document `/api/v4/user/connection/status` as the VPN connection status endpoint for the requesting account.
5. Public community docs and SDKs also show the authenticated-user pattern for other user progress endpoints as `/api/v4/user/profile/.../{userId}`.
6. I could not find a documented endpoint matching `user/profile/progress/machines/skills/{userId}` in the public docs I checked. The closest documented machine-progress endpoint is `/api/v4/user/profile/progress/machines/os/{userId}`; for machine-category progress, `/api/v4/user/profile/chart/machines/attack/{userId}` is documented.

## Practical answer

- Current authenticated connection status endpoint: `/api/v4/user/connection/status`
- Current user-id-based progress endpoints: `/api/v4/user/profile/progress/machines/os/{userId}`, `/api/v4/user/profile/chart/machines/attack/{userId}`, and the other `profile/progress/*/{userId}` routes documented in the v4 endpoint map.
- Required auth: `Authorization: Bearer <JWT>`
- Likely 404 explanation: the hardcoded `www.hackthebox.com` host is wrong/outdated for this API surface; public SDKs use `https://labs.hackthebox.com/api` as the base URL, and the old `hackthebox.eu` host now redirects.

## Sources

- https://github.com/Propolisa/htb-api-docs/tree/master/api/self/self.md
- https://github.com/Propolisa/htb-api-docs/tree/master/api/user/user.md
- https://github.com/Propolisa/htb-api-docs/tree/master/_posts/HTB%20Endpoint%20Map.md
- https://github.com/Gubarz/gohtb/tree/main/client.go
- https://github.com/Gubarz/gohtb/tree/main/services/users/service.go
- https://github.com/Gubarz/gohtb/tree/main/services/seasons/service.go
- https://github.com/calebstewart/python-htb/tree/master/htb/connection.py
- https://github.com/calebstewart/python-htb/tree/master/htb/vpn.py
- https://www.hackthebox.com/api/v4/user/connection/status
- https://labs.hackthebox.com/api/v4/user/connection/status
