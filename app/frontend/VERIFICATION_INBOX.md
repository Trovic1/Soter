Verification Inbox
===================

Routes
- `GET /api/v1/verification` — returns an array of verification cases for operators. Optional query param: `status` (pending_review, approved, rejected, needs_resubmission).
- `GET /api/v1/verification/:id` — get claim details.
- `POST /api/v1/verification/:id/approve` — operator approves claim (marks `verified`).
- `POST /api/v1/verification/:id/reject` — operator rejects claim (marks `archived`).
- `POST /api/v1/verification/:id/request-resubmission` — operator requests evidence resubmission (marks `requested`).

Frontend
- Inbox page: `/verification/inbox` — lists cases returned by `GET /api/v1/verification`.
- Detail page: `/verification/:id` — shows claim details and operator actions.

Status mapping
- DB `Claim.status` → UI `uiStatus`:
  - `requested` → `pending_review`
  - `verified`, `approved` → `approved`
  - `archived` → `rejected`
  - `request_resubmission` audit action → `needs_resubmission`

Each inbox item includes `nextStep` (human-readable next action) and `deepLink` (frontend route) to allow recipients or operators to jump into the right screen.
