# Manual Testing Guide - Email/Password Authentication

## Deployment Information
**URL**: https://aybga5h1t24h.space.minimax.io
**Test Date**: 2025-11-02
**Status**: ✅ All routes accessible, JavaScript bundle verified

## Automated Validation Results

### ✅ Route Accessibility (All Passed)
- `/` - Main auth screen: 200 OK
- `/auth/signup` - Signup page: 200 OK  
- `/auth/login` - Login page: 200 OK
- `/auth/forgot-password` - Password reset: 200 OK
- `/auth/reset-password` - Reset confirmation: 200 OK
- `/auth/callback` - OAuth callback: 200 OK

### ✅ Code Verification (All Passed)
JavaScript bundle (`index-CYDnErnC.js`) contains:
- ✅ `signUp` function
- ✅ `signInWithPassword` function (Supabase method)
- ✅ `resetPassword` function
- ✅ `auth/signup` route
- ✅ `auth/login` route
- ✅ `auth/forgot-password` route

## Manual Browser Testing Checklist

### TEST 1: Main Auth Screen
**URL**: https://aybga5h1t24h.space.minimax.io

**Expected Elements**:
- [ ] Page loads with gradient background (green to darker green)
- [ ] Centered white card with rounded corners
- [ ] Green circular icon with dollar sign
- [ ] Heading: "Expense Tracker"
- [ ] Description text about tracking expenses
- [ ] "Sign in with Google" button (with Google icon)
- [ ] "OR" divider text between sections
- [ ] "Sign in with Email" button (with envelope icon, outlined style)
- [ ] "Create new account" button (outlined style, lighter)

**Visual Check**:
- [ ] All buttons are properly aligned
- [ ] Colors match OPay green theme (#1DCF9F)
- [ ] Text is readable
- [ ] No layout breaks on desktop
- [ ] No layout breaks on mobile (resize browser)

---

### TEST 2: Signup Page Navigation & UI
**Start**: Main auth screen
**Action**: Click "Create new account"

**Expected**:
- [ ] URL changes to `https://aybga5h1t24h.space.minimax.io/auth/signup`
- [ ] Page displays with same gradient background
- [ ] Centered white card appears
- [ ] User icon (person silhouette) in green circle
- [ ] Heading: "Create Account"
- [ ] Description: "Sign up to start tracking your expenses"
- [ ] Email Address label and input field
- [ ] Password label and input field
- [ ] Confirm Password label and input field
- [ ] Password requirements text: "Must be at least 8 characters with uppercase, lowercase, and number"
- [ ] "Create Account" button (green, full width)
- [ ] "Already have an account? Sign in" link
- [ ] "Back to sign in options" link

---

### TEST 3: Signup Form Validation
**Page**: /auth/signup

#### Test 3a: Empty Form Submission
**Action**: Click "Create Account" without filling any fields

**Expected Errors**:
- [ ] "Email is required" appears under email field (red text)
- [ ] "Password is required" appears under password field (red text)
- [ ] "Please confirm your password" appears under confirm password (red text)
- [ ] Input fields have red borders
- [ ] No page navigation occurs
- [ ] No console errors

#### Test 3b: Invalid Email
**Action**: 
1. Enter "notanemail" in email field
2. Tab or click outside the field

**Expected**:
- [ ] Email field shows red border
- [ ] Error message: "Please enter a valid email address" (red text)
- [ ] Error appears immediately after blur

**Action**:
3. Change to "test@example.com"

**Expected**:
- [ ] Red border disappears
- [ ] Error message disappears
- [ ] Field returns to normal state

#### Test 3c: Weak Password
**Action**:
1. Enter "abc" in password field
2. Tab or click outside

**Expected**:
- [ ] Password field shows red border
- [ ] Error: "Password must be at least 8 characters"

**Action**:
3. Change to "abcdefgh" (all lowercase)
4. Tab away

**Expected**:
- [ ] Error: "Password must contain at least one uppercase letter"

**Action**:
5. Change to "Abcdefgh" (no numbers)
6. Tab away

**Expected**:
- [ ] Error: "Password must contain at least one number"

**Action**:
7. Change to "Test1234" (valid password)

**Expected**:
- [ ] Red border disappears
- [ ] Error message disappears

#### Test 3d: Password Mismatch
**Action**:
1. Password field: "Test1234"
2. Confirm password: "Test5678"
3. Tab or click outside confirm password field

**Expected**:
- [ ] Confirm password field shows red border
- [ ] Error: "Passwords do not match"

**Action**:
4. Change confirm password to "Test1234"

**Expected**:
- [ ] Red border disappears
- [ ] Error message disappears

---

### TEST 4: Navigation to Login Page
**Page**: /auth/signup
**Action**: Click "Already have an account? Sign in"

**Expected**:
- [ ] URL changes to `https://aybga5h1t24h.space.minimax.io/auth/login`
- [ ] Page displays with gradient background
- [ ] Key icon (lock and key) in green circle
- [ ] Heading: "Welcome Back"
- [ ] Description: "Sign in to continue tracking your expenses"
- [ ] Email Address field
- [ ] Password field
- [ ] "Forgot password?" link (aligned right)
- [ ] "Sign In" button (green, full width)
- [ ] "Don't have an account? Sign up" link
- [ ] "Back to sign in options" link

---

### TEST 5: Login Form Validation
**Page**: /auth/login

#### Test 5a: Empty Form
**Action**: Click "Sign In" without filling fields

**Expected**:
- [ ] "Email is required" error appears
- [ ] "Password is required" error appears
- [ ] Red borders on both fields
- [ ] No navigation occurs

#### Test 5b: Invalid Email
**Action**: Enter "bademail" in email field, tab away

**Expected**:
- [ ] Red border appears
- [ ] Error: "Please enter a valid email address"

**Action**: Change to "test@example.com"

**Expected**:
- [ ] Border returns to normal
- [ ] Error disappears

---

### TEST 6: Forgot Password Page
**Page**: /auth/login
**Action**: Click "Forgot password?"

**Expected**:
- [ ] URL changes to `https://aybga5h1t24h.space.minimax.io/auth/forgot-password`
- [ ] Envelope/mail icon in green circle
- [ ] Heading: "Reset Password"
- [ ] Description: "Enter your email address and we'll send you instructions to reset your password"
- [ ] Email Address field
- [ ] "Send Reset Link" button
- [ ] "Remember your password? Sign in" link
- [ ] "Back to sign in options" link

#### Test 6a: Email Validation
**Action**: Try to submit empty form

**Expected**:
- [ ] "Email is required" error appears

**Action**: Enter invalid email "notemail"

**Expected**:
- [ ] Error: "Please enter a valid email address"

**Action**: Enter valid email "test@example.com" and submit

**Expected**:
- [ ] Green success box appears
- [ ] Message: "Password reset instructions have been sent to your email. Please check your inbox."
- [ ] Email field is cleared

---

### TEST 7: Back Navigation Flow
**Start**: /auth/forgot-password
**Action**: Click "Back to sign in options"

**Expected**:
- [ ] URL returns to `/` (main auth screen)
- [ ] All original buttons present (Google, Email login, Create account)
- [ ] Page displays correctly

**Repeat**:
**Action**: Click "Sign in with Email" → Click "Back to sign in options"
- [ ] Returns to main auth screen

**Action**: Click "Create new account" → Click "Back to sign in options"
- [ ] Returns to main auth screen

---

### TEST 8: Cross-Page Link Navigation
Test all navigation links work correctly:

| From Page | Link Text | Expected Destination |
|-----------|-----------|---------------------|
| Main (/) | "Sign in with Email" | /auth/login |
| Main (/) | "Create new account" | /auth/signup |
| Signup | "Already have an account? Sign in" | /auth/login |
| Signup | "Back to sign in options" | / |
| Login | "Forgot password?" | /auth/forgot-password |
| Login | "Don't have an account? Sign up" | /auth/signup |
| Login | "Back to sign in options" | / |
| Forgot PW | "Remember your password? Sign in" | /auth/login |
| Forgot PW | "Back to sign in options" | / |

- [ ] All navigation links work correctly
- [ ] No broken links
- [ ] No console errors during navigation

---

### TEST 9: Responsive Design
**Action**: Resize browser window to mobile size (375px width)

**Check on ALL pages** (/, /auth/signup, /auth/login, /auth/forgot-password):
- [ ] Card adjusts to screen width
- [ ] Text remains readable
- [ ] Buttons are fully clickable
- [ ] Form inputs don't overflow
- [ ] Icon circles display correctly
- [ ] No horizontal scrolling
- [ ] Adequate spacing on small screens

---

### TEST 10: Visual Consistency Check
Verify design consistency across all auth pages:

- [ ] All pages use same gradient background
- [ ] All cards have same white background, rounded corners, shadow
- [ ] All icons use same green circle (#1DCF9F) with white icons
- [ ] All headings use same font size and weight
- [ ] All buttons have consistent styling
- [ ] All form inputs have consistent height and styling
- [ ] All error messages use same red color (#DC2626 or similar)
- [ ] All success messages use same green color
- [ ] Spacing is consistent across pages

---

### TEST 11: Loading States (Optional - requires Supabase)
If Supabase is configured:

**Action**: Fill signup form with valid data and submit

**Expected**:
- [ ] "Create Account" button shows loading spinner
- [ ] Button text changes or spinner appears
- [ ] Button is disabled during loading
- [ ] After completion, shows success message or error

**Same test for**:
- [ ] Login form submission
- [ ] Forgot password submission

---

## Known Limitations (To Be Tested After Supabase Configuration)

The following cannot be tested without Supabase credentials:
- Actual account creation
- Email confirmation flow
- Password reset email delivery
- Successful login with credentials
- Session management
- Redirect after successful login

---

## Test Results Summary

**Date**: _____________
**Tester**: _____________

### Pass/Fail Counts
- Tests Passed: _____ / _____
- Tests Failed: _____ / _____
- Tests Skipped: _____ / _____

### Critical Issues Found
(List any blocking issues)

### Minor Issues Found  
(List any cosmetic or non-critical issues)

### Overall Assessment
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes

### Next Steps
(What needs to be done based on test results)

---

## Quick Verification Script

For a quick smoke test, verify these essentials:
1. Visit https://aybga5h1t24h.space.minimax.io
2. See Google + Email + Signup buttons → ✅
3. Click each button to verify navigation → ✅
4. Try submitting empty forms to see validation → ✅
5. Navigate back to main screen from each page → ✅

If all 5 steps pass, the core functionality is working correctly.
