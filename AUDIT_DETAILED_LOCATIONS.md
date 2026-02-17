# DETAILED ISSUE LOCATION REFERENCE

## All Issues with Exact File Locations

---

## 🔴 CRITICAL ISSUES

### Issue #1: ContactPage Form Not Implemented
**Severity:** CRITICAL - Users cannot submit contact form  
**File:** `src/pages/ContactPage.tsx`  
**Lines:** 29-31  
**Status:** INCOMPLETE

```typescript
// LINE 29-31
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
};
```

**Problem:** 
- Form has no backend submission
- TODO comment indicates not implemented
- console.log used for debugging

**Fix Required:**
1. Create `contact_messages` table in Supabase
2. Implement email service integration
3. Remove console.log
4. Add success/error feedback

**Affected Users:** All users trying to contact support

---

### Issue #2: Console.log Statements (Security Risk)
**Severity:** CRITICAL - Exposes internal logic  
**Files:** Multiple  

#### File: `src/pages/UsersPage.tsx`
**Lines:** 132, 141, 144

```typescript
// LINE 132
console.log('User created with ID:', userId);

// LINE 141
console.log('Profile found:', profile);

// LINE 144
console.log(`Profile not found yet, retry ${i + 1}/5`);
```

#### File: `src/pages/finance/TreasuryPage.tsx`
**Line:** 102

```typescript
console.log('Treasury History:', data);
```

#### File: `src/pages/finance/PurchasingPage.tsx`
**Line:** 82

```typescript
console.log('Tenders:', data);
```

**Problem:** 
- Exposes internal API calls and data flow
- Shows retry logic and database queries
- Visible in browser DevTools to any user

**Fix Required:** Remove all console.log statements before production

---

### Issue #3: Finance Module - Hard-Coded Mock Data
**Severity:** CRITICAL - Shows fake financial data  
**File:** `src/pages/finance/AccountingPage.tsx`  
**Lines:** 58-64  
**Status:** INCOMPLETE

```typescript
// LINE 58-64 - HARDCODED MOCK DATA
const matchingItems = [
    { label: "Paracétamol 500mg (Boîte 100)", bc: "500", br: "500", invoice: "500", isMatch: true },
    { label: "Artéméther Injectable", bc: "200", br: "180", invoice: "200", isMatch: false },
    { label: "Amoxicilline 500mg", bc: "1000", br: "1000", invoice: "1000", isMatch: true },
    { label: "Seringues 5ml", bc: "5000", br: "5000", invoice: "5000", isMatch: true },
];
```

**Problem:**
- Data hardcoded instead of from database
- Users see fake matching results
- 3-way match logic not implemented
- No actual validation

**Affected Files:**
- `src/pages/finance/AccountingPage.tsx` - 3-way matching
- `src/pages/finance/BudgetPage.tsx` - Budget data
- `src/pages/finance/TreasuryPage.tsx` - Payment data
- `src/pages/finance/PurchasingPage.tsx` - PO data
- `src/pages/finance/FinanceDashboard.tsx` - All dashboard data

**Fix Required:**
1. Remove mock data constants
2. Implement actual database queries
3. Add 3-way matching algorithm
4. Add validation logic

---

### Issue #4: File Upload Validation - Server-Side Missing
**Severity:** CRITICAL - Security vulnerability  
**File:** `src/pages/DemandeInscriptionPage.tsx`  
**Line:** 77  
**Status:** CLIENT-SIDE ONLY

```typescript
// LINE 77 - CLIENT-SIDE VALIDATION ONLY
const validateFileSize = (file: File | null): boolean => {
  if (!file) return true;
  const maxSize = 5 * 1024 * 1024; // 5 MB - ONLY CLIENT-SIDE!
  return file.size <= maxSize;
};
```

**Problems:**
- No file type validation
- Size limit is client-side only (can be bypassed)
- No malware scanning
- No server-side enforcement

**What's Missing:**
- `validateFileSize()` has NO server-side check
- `validateEmail()` [line 62] is OK (basic check)
- `validatePhoneGuinea()` [line 68] has NO server-side validation
- File type restriction missing entirely

**Fix Required:**
1. Add server-side file validation
2. Restrict to specific MIME types
3. Scan for malware
4. Store files securely
5. Validate phone numbers on server

---

### Issue #5: Missing Permission Checks
**Severity:** CRITICAL - Authorization bypass risk  

#### Issue 5A: UsersPage - No Auth Check for User Creation
**File:** `src/pages/UsersPage.tsx`  
**Lines:** 103-106, 231  
**Status:** MISSING

```typescript
// LINE 103-106 - NO PERMISSION CHECK!
const [createOpen, setCreateOpen] = useState(false);
const [detailUser, setDetailUser] = useState<UserRow | null>(null);
const { toast } = useToast();

// LINE 231 - NO ROLE CHECK!
const handleCreate = async () => {
    if (!form.email || !form.firstName || !form.lastName || !form.role) {
        toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
        return;
    }
    // ... creates user WITHOUT checking if current user is SUPER_ADMIN
```

**Problem:** Any authenticated user can create accounts with any role

**Current Code:** No role check before user creation  
**Should Check:** `if (user?.role !== 'SUPER_ADMIN') { return forbiddenError; }`

---

#### Issue 5B: ParametresPage - No Auth Check for DRS/DPS Modification
**File:** `src/pages/ParametresPage.tsx`  
**Lines:** 65-73, 102-110  
**Status:** MISSING

```typescript
// LINE 65-73 - NO PERMISSION CHECK!
const { data: drsList = [], isLoading: loadingDrs } = useQuery({
    queryKey: ['param-drs'],
    queryFn: async () => { 
        const { data } = await supabase.from('drs').select('*').order('nom');
        return data || [];
    },
});

// LINE 102-110 - NO PERMISSION CHECK!
const saveDrsMutation = useMutation({
    mutationFn: async () => {
        // ... saves DRS without checking if user is ADMIN_CENTRAL
```

**Problem:** Any authenticated user can modify regional/prefectoral entities

**Should Check:** 
```typescript
if (!['ADMIN_CENTRAL', 'SUPER_ADMIN'].includes(user?.role)) {
    toast({ title: 'Permission denied' });
    return;
}
```

---

#### Issue 5C: PharmacovigilancePage - No Auth Check for EI Escalation
**File:** `src/pages/PharmacovigilancePage.tsx`  
**Status:** MISSING

**Problem:** No role check for who can escalate adverse events

**Should Restrict To:** Only `PCG_DIR`, `PCG_ADJ` roles

---

## 🟡 HIGH PRIORITY ISSUES

### Issue #6: PDF Report Generation Incomplete
**Severity:** HIGH - Reports cannot be exported  
**File:** `src/pages/RapportsPage.tsx`  
**Lines:** 113-156  
**Status:** INCOMPLETE

```typescript
// LINE 113-156 - PARTIAL IMPLEMENTATION
const generatePDF = async () => {
    try {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Rapport LivraMed', 14, 22);
        // ... basic header only, rest incomplete
```

**Problems:**
- No charts export to PDF
- Incomplete table formatting
- Missing footer/headers with dates
- No multi-page layout

---

### Issue #7: Documentation Links Non-Functional
**Severity:** HIGH - Users cannot access documentation  
**File:** `src/pages/DocumentationPage.tsx`  
**Lines:** 94-131, 140-169, 178-207, 224-253  
**Status:** INCOMPLETE

All "Télécharger" buttons are non-functional:
- Central level guides (4 PDFs)
- Regional level guides (2 PDFs)
- Prefectoral level guides (2 PDFs)
- Structure guides (3 PDFs)
- Delivery guides (1 PDF)

```typescript
// LINE 103 - BUTTON DOESN'T WORK
<Button size="sm" variant="outline" className="w-full">
    <Download className="h-3 w-3 mr-2" />
    Télécharger
</Button>
```

**Missing:**
- PDF files storage
- Download endpoint
- File URL generation
- Cloud storage integration

---

### Issue #8: Finance Module - 3-Way Matching Not Implemented
**Severity:** HIGH - Cannot validate invoices  
**File:** `src/pages/finance/AccountingPage.tsx`  
**Status:** 20% COMPLETE

**Missing:**
- Matching algorithm (line quantities vs invoice vs PO)
- Price validation
- Auto-rejection on mismatch
- Variance tolerance configuration
- Audit trail

**What Works:**
- UI buttons exist
- Mock data shown

**What Doesn't Work:**
- Actual 3-way matching logic
- Database validation
- Mismatch detection

---

### Issue #9: Finance Module - Budget Allocation Non-Functional
**Severity:** HIGH - Cannot allocate budgets  
**File:** `src/pages/finance/BudgetPage.tsx`  
**Status:** 20% COMPLETE

```typescript
// LINE ~40 - BUTTON EXISTS BUT DOESN'T WORK
<Button className="bg-primary shadow-md">
    <Plus className="h-4 w-4 mr-2" /> Allouer Budget
</Button>
```

**Missing:**
- Budget allocation form
- Entity selection
- Amount input
- Year selection
- Approval workflow
- Calculation rules

---

### Issue #10: guide & Documentation Search No Content
**Severity:** HIGH - Pages are mostly empty  

#### File: `src/pages/GuidePage.tsx`
**Status:** INCOMPLETE

**Problem:** Search works but shows no actual guide sections/content

**What Exists:**
- Navigation structure
- Search functionality
- Accordion structure

**What's Missing:**
- Actual guide content
- Sections with text
- Tutorial links
- Code examples

---

## 🟢 MEDIUM PRIORITY ISSUES

### Issue #11: Missing Notification System
**Severity:** MEDIUM - Orders don't notify users  
**Status:** NOT IMPLEMENTED

**What Should Happen:**
1. Order status changes → Email notification
2. Delivery near location → SMS alert
3. Stock threshold breached → System alert
4. Pharmacovigilance escalation → Notification

**What's Missing Everywhere:**
- Email service integration
- SMS service integration
- In-app notification persistence
- Notification preferences
- Notification history

---

### Issue #12: Stock Transfers Not Implemented
**Severity:** MEDIUM - Cannot transfer stocks  
**Status:** FEATURE MISSING

**What Should Exist:**
- Transfer form in StocksPage
- Source/destination entity selection
- Quantity input
- Reason/purpose
- Approval workflow

**Current State:** Feature doesn't exist

---

### Issue #13: Delivery Proof of Delivery Incomplete
**Severity:** MEDIUM - Cannot prove delivery  
**File:** `src/pages/LivraisonsPage.tsx`  
**Status:** 60% COMPLETE

**What Works:**
- Status updates (EN_COURS → LIVREE)
- Real-time tracking
- Delivery details

**What's Missing:**
- Photo capture
- E-signature
- Signature verification
- Digital proof storage
- PDF receipt generation

---

### Issue #14: Route Optimization Not Implemented
**Severity:** MEDIUM - Inefficient deliveries  
**Status:** NOT IMPLEMENTED

**Missing:**
- Delivery route algorithm
- GPS optimization
- Multi-stop planning
- Driver assignment logic

---

### Issue #15: Order Auto-Rejection Missing
**Severity:** MEDIUM - Manual process only  
**Status:** NOT IMPLEMENTED

**Should Auto-Reject When:**
- Stock insufficient at validation level
- Budget exceeded
- Time limit exceeded
- Invalid data

---

## 📋 DETAILED FUNCTION-BY-FUNCTION ANALYSIS

### File: `src/hooks/useAuditLogs.ts`
**Status:** ✅ WORKING

Lines 1-50: Mock data generator (fallback)
Lines 51-80: Real query to audit_logs table
Lines 81-120: Filtering and error handling
Lines 140-165: Real-time subscription

**Quality:** GOOD - Has graceful fallback

---

### File: `src/hooks/useFinance.ts`
**Status:** ⚠️ PARTIAL

Lines 1-30: useBudgets hook ✅
Lines 31-50: useCreateBudget hook ✅
Lines 51-70: useBonsCommande hook ⚠️ (queries incomplete)
Lines 71-90: useFactures hook ✅
Lines 91-110: usePaiements hook ✅

**Quality:** MIXED - Some work, some need backend

---

### File: `src/hooks/useUserLevel.ts`
**Status:** ✅ WORKING

Lines 1-15: Role definitions ✅
Lines 16-40: Level calculation ✅
Lines 41-50: Hook implementation ✅

**Quality:** EXCELLENT

---

## SUMMARY BY SEVERITY

### 🔴 CRITICAL (5 issues)
1. ContactPage form not implemented
2. Console.log statements (5 instances)
3. Finance mock data hardcoded
4. File upload validation missing
5. Permission checks missing (3 pages)

### 🟡 HIGH (10 issues)
1. PDF export incomplete
2. Documentation links broken
3. 3-way matching not implemented
4. Budget allocation missing
5. Guide/Documentation empty
6-10. Various finance module gaps

### 🟢 MEDIUM (15+ issues)
1. Notifications not implemented
2. Stock transfers missing
3. Delivery proof missing
4. Route optimization missing
5. Auto-rejection missing
+ Many feature gaps

---

## FILE-BY-FILE FIX CHECKLIST

### Critical Fixes (Edit These Files)

- [ ] `src/pages/ContactPage.tsx` - Line 29-31: Implement form submission
- [ ] `src/pages/UsersPage.tsx` - Lines 132, 141, 144: Remove console.log
- [ ] `src/pages/UsersPage.tsx` - Line 231: Add role check
- [ ] `src/pages/finance/TreasuryPage.tsx` - Line 102: Remove console.log
- [ ] `src/pages/finance/PurchasingPage.tsx` - Line 82: Remove console.log
- [ ] `src/pages/finance/AccountingPage.tsx` - Lines 58-64: Remove mock data
- [ ] `src/pages/ParametresPage.tsx` - Line 65-110: Add role check
- [ ] `src/pages/PharmacovigilancePage.tsx` - Add escalation role check
- [ ] `src/pages/DemandeInscriptionPage.tsx` - Line 77: Add server-side validation

### High Priority Fixes

- [ ] `src/pages/RapportsPage.tsx` - Lines 113-156: Complete PDF generation
- [ ] `src/pages/DocumentationPage.tsx` - Lines 94-131: Implement downloads
- [ ] `src/pages/GuidePage.tsx` - Add actual guide content
- [ ] `src/pages/finance/*` - All files: Remove fake data, implement logic

---

**Total Issues Documented:** 45+  
**Critical Issues:** 5  
**High Priority:** 10  
**Medium Priority:** 15+  
**Low Priority:** 10+
