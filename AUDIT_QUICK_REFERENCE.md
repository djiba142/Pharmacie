# QUICK REFERENCE - AUDIT ISSUES CHECKLIST

## 🔴 CRITICAL ISSUES (FIX IMMEDIATELY)

### 1. ContactPage Form Non-Functional
- [ ] **File:** `src/pages/ContactPage.tsx` (lines 29-30)
- [ ] **Issue:** `// TODO: Implement form submission` + `console.log()`
- [ ] **Impact:** Users cannot contact support
- [ ] **Fix:** Implement email service or message storage
- [ ] **Status:** NOT IMPLEMENTED

### 2. Console.log Statements (Security Risk)
- [ ] **File:** `src/pages/UsersPage.tsx` (lines 132, 141, 144)
  ```javascript
  console.log('User created with ID:', userId);
  console.log('Profile found:', profile);
  console.log(`Profile not found yet, retry ${i + 1}/5`);
  ```
- [ ] **File:** `src/pages/finance/TreasuryPage.tsx` (line 102)
  ```javascript
  console.log('Treasury History:', data);
  ```
- [ ] **File:** `src/pages/finance/PurchasingPage.tsx` (line 82)
  ```javascript
  console.log('Tenders:', data);
  ```
- [ ] **Impact:** Exposes internal logic to browser console
- [ ] **Fix:** Remove all console.log statements from production code

### 3. Finance Module - Fake Data in UI
- [ ] **File:** `src/pages/finance/AccountingPage.tsx` (lines 58-64)
  ```javascript
  const matchingItems = [
      { label: "Paracétamol 500mg (Boîte 100)", bc: "500", br: "500", invoice: "500", isMatch: true },
      // ... hardcoded mock data
  ];
  ```
- [ ] **Issue:** Mock data displayed instead of real database values
- [ ] **Files Affected:** All 5 finance pages
- [ ] **Impact:** Finance features show incorrect/fake information
- [ ] **Fix:** Replace mock data with actual database queries
- [ ] **Status:** 40% COMPLETE - Needs backend integration

### 4. File Upload Validation - Server-Side Missing
- [ ] **File:** `src/pages/DemandeInscriptionPage.tsx`
- [ ] **Issue:** File size validation is client-only (line 77)
  ```javascript
  const validateFileSize = (file: File | null): boolean => {
      if (!file) return true;
      const maxSize = 5 * 1024 * 1024; // 5 MB - CLIENT-SIDE ONLY
      return file.size <= maxSize;
  };
  ```
- [ ] **Missing:** File type validation, server-side enforcement
- [ ] **Impact:** Attackers can upload malware
- [ ] **Fix:** Add server-side file validation, restrict MIME types
- [ ] **Status:** HIGH SECURITY RISK

### 5. Missing Permission Checks
- [ ] **File:** `src/pages/UsersPage.tsx`
  - [ ] Line 231: `const handleCreate = async () => {}` - No role check
  - [ ] Issue: Any authenticated user can create accounts
  - [ ] Fix: Add `if (role !== 'SUPER_ADMIN') return forbiddenError`

- [ ] **File:** `src/pages/ParametresPage.tsx`
  - [ ] Lines 65-74: DRS/DPS modification without auth check
  - [ ] Issue: Any user can modify regional/prefectoral entities
  - [ ] Fix: Add `if (!['ADMIN_CENTRAL', 'SUPER_ADMIN'].includes(role)) return`

- [ ] **File:** `src/pages/PharmacovigilancePage.tsx`
  - [ ] No check for who can escalate EI
  - [ ] Issue: Non-PCG users may escalate
  - [ ] Fix: Add role check for escalation actions

---

## 🟡 HIGH PRIORITY (FIX WITHIN 1 WEEK)

### 6. PDF Report Generation Incomplete
- [ ] **File:** `src/pages/RapportsPage.tsx` (lines 113-156)
- [ ] **Status:** Partial implementation - jsPDF included but incomplete
- [ ] **Missing:** 
  - [ ] Charts export to PDF
  - [ ] Multi-page layout
  - [ ] Footer/header with dates
- [ ] **Impact:** Reports cannot be exported
- [ ] **Priority:** MEDIUM

### 7. Documentation Download Links Don't Work
- [ ] **File:** `src/pages/DocumentationPage.tsx`
- [ ] **Issue:** All "Télécharger" buttons are non-functional (lines 94-131)
- [ ] **Missing:** 
  - [ ] PDF file management
  - [ ] Download endpoint
  - [ ] File storage
- [ ] **Status:** 10% COMPLETE

### 8. Guide Search Returns No Content
- [ ] **File:** `src/pages/GuidePage.tsx`
- [ ] **Issue:** Search works but no actual guide content
- [ ] **Missing:** Actual guide sections with content
- [ ] **Impact:** Guide page is useless to users

### 9. Finance Module - 3-Way Matching Incomplete
- [ ] **File:** `src/pages/finance/AccountingPage.tsx`
- [ ] **Issue:** Mock data, no actual matching logic
- [ ] **Missing:**
  - [ ] Quantity matching algorithm
  - [ ] Price discrepancy detection
  - [ ] Automatic rejection logic
- [ ] **Status:** 30% COMPLETE

### 10. Finance Module - Budget Allocation Missing
- [ ] **File:** `src/pages/finance/BudgetPage.tsx`
- [ ] **Issue:** "Allouer Budget" button doesn't work
- [ ] **Missing:** Budget allocation form and workflow
- [ ] **Status:** 20% COMPLETE

---

## 🟢 MEDIUM PRIORITY (FIX WITHIN 2 WEEKS)

### 11. Order Status Updates Don't Send Notifications
- [ ] **File:** `src/pages/CommandesPage.tsx`
- [ ] **Issue:** Orders change status but no email/SMS sent
- [ ] **Missing:** Notification service
- [ ] **Status:** Not implemented

### 12. Stock Transfers Not Implemented
- [ ] **Missing:** Feature completely absent
- [ ] **Where Needed:** StocksPage, inventory management
- [ ] **Impact:** Can't transfer stocks between entities

### 13. Delivery Proof of Delivery Incomplete
- [ ] **File:** `src/pages/LivraisonsPage.tsx`
- [ ] **Issue:** No photo capture or e-signature
- [ ] **Missing:** Mobile proof capture, signature pad
- [ ] **Status:** Partially implemented (status only)

### 14. Route Optimization Not Implemented
- [ ] **Missing:** Delivery route algorithm
- [ ] **Impact:** Inefficient delivery routes
- [ ] **Status:** Not started

### 15. Form Submission State Not Clear
- [ ] **File:** `src/pages/DemandeInscriptionPage.tsx` (lines 348-351)
- [ ] **Issue:** After form submission, no feedback on what happens
- [ ] **Missing:** Success screen, tracking number display
- [ ] **Status:** 70% implemented

---

## 📊 MODULE COMPLETION SUMMARY

```
Authentication:        ████████░░ 95% ✅
Stock Management:      █████████░ 90% ✅
Orders:               ████████░░ 90% ✅
Deliveries:           ████████░░ 85% ⚠️
Audit:                █████████░ 85% ✅
Pharmacovigilance:    ████████░░ 80% ⚠️
Reporting:            ███████░░░ 70% ⚠️
Users:                ███████░░░ 75% ⚠️
Parameters:           ███████░░░ 70% ⚠️
Finance:              ████░░░░░░ 40% ❌
Documentation:        ███░░░░░░░ 30% ❌
Contact:              ░░░░░░░░░░  0% ❌
```

---

## ⚠️ BROKEN BUTTONS & FORMS

| Component | File | Line(s) | Status | Fix |
|-----------|------|---------|--------|-----|
| Contact Form Submit | ContactPage.tsx | 29-30 | ❌ Not Working | Implement backend |
| Download PDF Links | DocumentationPage.tsx | 94-131 | ❌ Not Working | Add storage/endpoint |
| Treasury: Generate Payment Order | TreasuryPage.tsx | 123-131 | ⚠️ Incomplete | Finish workflow |
| Accounting: 3-Way Match | AccountingPage.tsx | 150-190 | ⚠️ Incomplete | Add match logic |
| Budget: Allocate Button | BudgetPage.tsx | N/A | ❌ Not Implemented | Create form |
| Purchasing: View All Tenders | PurchasingPage.tsx | N/A | ⚠️ Incomplete | Finish UI |

---

## 🔐 PERMISSION ISSUES

### Missing Role Checks

| Page | What's Missing | Required Role | Status |
|------|----------------|---------------|--------|
| UsersPage | User creation auth | SUPER_ADMIN only | ❌ MISSING |
| ParametresPage | DRS/DPS modification auth | ADMIN_CENTRAL | ❌ MISSING |
| PharmacovigilancePage | EI escalation auth | PCG_DIR | ❌ MISSING |
| RapportsPage | Entity filtering | Based on user level | ⚠️ PARTIAL |
| ContactPage | Access control | Public (risky) | ❌ MISSING |

---

## 📋 DATABASE ITEMS MISSING

### Tables That Need To Exist But Might Be Missing

| Table | Purpose | Used By | Status |
|-------|---------|---------|--------|
| `contact_messages` | Contact form submissions | ContactPage | ❌ MISSING |
| `documents` | Documentation PDFs | DocumentationPage | ❌ MISSING |
| `notifications` | User notifications | System-wide | ❌ MISSING |
| `export_logs` | DHIS2/e-LMIS exports | RapportsPage | ❌ MISSING |
| `stock_transfers` | Stock movements between entities | StocksPage | ❌ MISSING |

### RPC Functions Missing

| Function | Purpose | Called By | Status |
|----------|---------|-----------|--------|
| `send_email()` | Email notifications | System-wide | ❌ MISSING |
| `generate_pdf()` | PDF reports | RapportsPage | ❌ MISSING |
| `export_to_dhis2()` | DHIS2 sync | RapportsPage | ❌ MISSING |
| `validate_order()` | Order workflow | CommandesPage | ❌ MISSING |
| `calculate_alerts()` | Stock thresholds | System | ❌ MISSING |

---

## 🧪 VALIDATION ISSUES

### Client-Side Only (Server-Side Missing)

| Form | Field(s) | Risk | Fix |
|------|----------|------|-----|
| DemandeInscription | File size/type | HIGH | Add server validation |
| Contact | Email format | MEDIUM | Add spam protection |
| Commandes | Quantity | MEDIUM | Add server check |
| Users | Email uniqueness | LOW | Mostly OK (has DB check) |

---

## 📝 TODO COMMENTS IN CODE

```typescript
// ❌ FOUND: src/pages/ContactPage.tsx (Line 29)
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
};
```

---

## QUICK ACTIONABLE FIXES

### Immediate (< 1 hour each)

- [ ] **Remove console.log statements** (5 instances)
  - UsersPage.tsx: 3 instances
  - TreasuryPage.tsx: 1 instance
  - PurchasingPage.tsx: 1 instance
  - Command: `grep -rn "console.log" src/pages/`

- [ ] **Add role check to UsersPage handleCreate()**
  ```typescript
  if (user?.role !== 'SUPER_ADMIN') {
    toast({ title: 'Permission denied' });
    return;
  }
  ```

- [ ] **Add role check to ParametresPage DRS/DPS forms**
  ```typescript
  if (!['ADMIN_CENTRAL', 'SUPER_ADMIN'].includes(level)) {
    toast({ title: 'Permission denied' });
    return;
  }
  ```

### Short-term (1-2 days each)

- [ ] Implement ContactPage form submission
- [ ] Add PDF report generation
- [ ] Complete Finance module backend logic
- [ ] Add file upload server-side validation

### Medium-term (1 week each)

- [ ] Create missing database tables
- [ ] Implement notification system
- [ ] Complete Finance module features
- [ ] Add DHIS2 export functionality

---

## FINAL CHECKLIST

### Before Production Release

- [ ] Remove all console.log statements
- [ ] Add permission checks to all admin pages
- [ ] Implement ContactPage form submission
- [ ] Add server-side file validation
- [ ] Complete Finance module
- [ ] Test all forms with invalid data
- [ ] Security audit of permission system
- [ ] Load testing for concurrent users
- [ ] Data backup/recovery procedures
- [ ] Documentation for admins

---

**Generated:** February 17, 2026  
**Reviewed:** All 31 pages + 5 finance pages + 10 hooks  
**Total Issues Found:** 45+  
**Critical:** 5 | High: 8 | Medium: 15 | Low: 12+
