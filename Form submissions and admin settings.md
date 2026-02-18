# Form Submissions & Admin Settings

## 1. Where form data goes (emails)

Form submissions are sent to the **backend API**. The backend is responsible for:
- Storing submissions in the database
- Sending email notifications to the right recipients

**Recommended setup:**
- **Info / general enquiries:** `info@troosolar.com` – configure in backend (e.g. `.env` or admin “Site settings”).
- **Sales / quotes:** `sales@troosolar.com` – configure in backend for checkout, BNPL, Buy Now, and quote requests.

**To see submissions:** Use the **admin panel** (backend):
- Add an admin section “Form submissions” or “Enquiries” that lists contact form, BNPL applications, audit requests, etc.
- Optionally add “Email recipients” under **Settings** so you can set `info@troosolar.com`, `sales@troosolar.com`, and which forms go to which address.

The **frontend (this app)** only sends data to API endpoints; it does not send email. All routing of emails (info@, sales@) must be configured in the backend.

---

## 2. FAQs – editable from backend

- **API:** `GET /api/site/faqs` should return a list of FAQs (e.g. `{ question, answer }` or `{ title, content }`).
- The frontend can then load FAQs from this endpoint so you can **edit FAQs from the admin** without code changes.
- **Admin:** Add a “FAQs” or “Site content → FAQs” tab where you can add/edit/delete questions and answers.

---

## 3. Insurance fee (3% default, editable)

- **Current behaviour:** Default is **3%** of order value. If the backend sends an add-on with `is_compulsory_bnpl` and `calculation_type: 'percentage'`, the `calculation_value` from the API is used (so you can set 3, 4, 5, etc. from admin).
- **Admin:** Under “Add-ons” or “BNPL settings”, ensure the compulsory BNPL insurance add-on has `calculation_type: percentage` and `calculation_value: 3` (or whatever you want). The frontend uses this when present.

---

## 4. Credit check fee (editable)

- **Current behaviour:** The frontend uses `loanConfig.credit_check_fee` from `GET /api/config/loan-configuration` when present; otherwise it uses a default of ₦1,000.
- **Admin:** In **Loan configuration** (or “BNPL / Credit settings”), add a field **Credit check fee** (amount in Naira). The API should return it as `credit_check_fee` in the loan configuration JSON.

---

## 5. Loan calculator – interest rate editable

- **Current behaviour:** The Loan Calculator already loads **interest_rate_min** and **interest_rate_max** from `GET /api/config/loan-configuration`. The UI lets the customer choose a rate in that range (e.g. 3%, 4%, 5%).
- **Admin:** In **Loan configuration**, set:
  - `interest_rate_min` (e.g. 3)
  - `interest_rate_max` (e.g. 8)
  So you can change “4% to 5%” or any range without code changes.

---

## 6. Admin tabs to add (backend)

| Tab / Section       | Purpose |
|---------------------|--------|
| **Site settings**   | Email recipients (info@, sales@), site name, contact text. |
| **FAQs**            | Add/edit/delete FAQ items (used by `GET /api/site/faqs`). |
| **Loan configuration** | Already used; ensure it includes: `credit_check_fee`, `interest_rate_min`, `interest_rate_max`, and other loan fields. |
| **Add-ons**         | Already used; ensure compulsory BNPL insurance has `calculation_value` (e.g. 3 for 3%). |
| **Form submissions / Enquiries** | List of contact form, BNPL, audit, and other submissions so you can see “where the details of people that fill any form go”. |

---

## 7. Guarantor form note (already in app)

The following note is shown on the guarantor form and loan details:

> Signed guarantor forms and undated cheques are required before installation. Signed guarantor forms should be uploaded on or before the installation date and undated cheques must be made available on or before the day of installation; installation will not proceed without them.

No backend change required for this text; it is implemented in the frontend.
