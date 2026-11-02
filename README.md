# Recruitment system

Company hiring desk: candidates apply from the public careers site, a LinkedIn link, or a QR code. HR reviews every application in one place.

## What it does

- Public careers page with open roles
- Apply form (phone-friendly after a QR scan)
- Source tracking: website, LinkedIn, QR, referral
- HR login, application inbox, pipeline stages, notes
- Per-role share links and printable QR code
- Admin user management with per-person menu permissions
- Applicant portal for status, written exam marks, and next steps
- Emails after apply and when HR selects or advances a candidate (configure SMTP in `.env`)

## Run it

```bash
cd recruitment-system
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for candidates. Applicant portal: [http://localhost:3000/portal/login](http://localhost:3000/portal/login).

HR desk: [http://localhost:3000/hr/login](http://localhost:3000/hr/login)

- Admin: `hr@boarwanda.com` / `ChangeMe123!`
- Sample staff: `recruiter@boarwanda.com` / `ChangeMe123!` (Applications and Roles only)

Change `COMPANY_NAME` and `APP_URL` in `.env` so QR codes point at the real host (phone scans need a URL the phone can reach, not `localhost`).
