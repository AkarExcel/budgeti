# Content Structure Plan - OPay-Inspired Expense Tracker

## 1. Material Inventory

**Technical Architecture:**
- `docs/architecture/technical-architecture.md` (Complete technical blueprint: React frontend, REST backend, Google Sheets integration, voice pipeline, authentication flows)

**Design Research:**
- `docs/design-research/opay-design-analysis.md` (OPay design patterns, color palette, typography, mobile-first constraints, performance considerations)

**Notification Strategy:**
- `docs/notification-research/push-notification-strategy.md` (Gamification notification patterns, frequency capping, timing strategies, permission UX)

**API Requirements:**
- `docs/technical-research/google-apis-technical-requirements.md` (OAuth 2.0 flows, Google Sheets API, Web Speech API capabilities, security considerations)

**Visual Assets:**
- No existing images; icons will use SVG libraries (Lucide/Heroicons)
- Decorative elements generated via design patterns (gradients, progress rings, badge graphics)

## 2. Application Structure

**Type:** Single Page Application (SPA)

**Reasoning:** 
- All screens are part of a cohesive financial tracking workflow
- Mobile-first design with bottom navigation for frequent actions
- Expense tracking requires quick transitions between entry, review, and dashboard
- React architecture with client-side routing (per technical architecture)
- Performance-optimized for low-end devices (avoiding full page reloads)

## 3. Screen/Flow Breakdown

### Screen 1: Authentication Flow (`/auth`)

**Purpose**: Secure Google OAuth sign-in and permission request

**User Flow Mapping:**

| Screen State | Component Pattern | Technical Reference | User Actions | Visual Treatment |
|--------------|------------------|-------------------|--------------|-----------------|
| Landing | Hero Pattern + CTA | technical-architecture.md OAuth section | View value prop, "Sign in with Google" button | OPay green CTA (56px), trust signals |
| OAuth Consent | External (Google) | google-apis-technical-requirements.md | Grant permissions | Google-controlled |
| Permission Request | Modal Pattern | notification-research L156-179 | Enable notifications (optional) | Custom pre-prompt before browser dialog |
| Onboarding | Wizard Pattern (3 steps) | - | Set currency, budget goals, categories | Progress dots, skip option |

**Key Interaction:**
- Google OAuth button: 56px height, OPay green gradient
- Permission pre-prompt: Explain value before requesting notification access
- Onboarding cards: Swipeable (mobile), click-through (desktop)

---

### Screen 2: Dashboard/Home (`/`)

**Purpose**: Primary hub showing balance, recent activity, streak, and quick actions

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Display | Visual Treatment |
|---------|------------------|-------------|-------------------|-----------------|
| Header | App Bar | - | App name, streak counter (🔥 icon), profile avatar | Fixed top, 64px height |
| Balance Card | Hero Card | Backend API `/expenses` aggregation | Current balance, month-to-date spending | Elevated card, 32px padding, gradient accent |
| Streak Indicator | Gamification Widget | Backend `/gamification/streak` | Days logged consecutively, visual ring progress | Circular progress (64px), gold accent if active |
| Budget Progress | Progress Ring Card | Backend `/budgets/current` | % of monthly budget used, category breakdown preview | Multi-segment ring, color-coded |
| Quick Actions | Button Group | - | "Add Expense" (primary), "Voice Entry" (secondary) | Grouped horizontally, 48px buttons |
| Recent Transactions | List Pattern (5 items) | Backend `/expenses?limit=5` | Date, category icon, merchant, amount | Swipeable cards, compact |
| Bottom Navigation | Tab Bar | - | Dashboard, History, Add (FAB), Reports, Profile | 56px height, icons + labels |

**Gamification Elements:**
- Streak counter badge (top-right header)
- Achievement preview (collapsed, expandable)
- Progress rings use OPay green for on-track, amber for warnings

---

### Screen 3: Expense Entry (Typed) (`/add`)

**Purpose**: Manual expense form with category selection and validation

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Display | Visual Treatment |
|---------|------------------|-------------|-------------------|-----------------|
| Form Container | Modal/Sheet Pattern | - | Title "Add Expense", close button | Full-screen on mobile, modal on desktop |
| Amount Input | Currency Input | - | Large numpad-friendly input | 32px font, auto-focus |
| Category Selector | Chip Grid | Backend `/categories` | Icons + labels (Food, Transport, Shopping, etc.) | Colorful icons, single-select chips |
| Merchant Input | Text Field | - | Optional autocomplete from history | 16px input, helper text |
| Date Picker | Native Picker | - | Defaults to today | Compact, accessible |
| Notes Field | Text Area | - | Optional free-text | Collapsible, 2-line min |
| Action Buttons | Button Group | - | "Cancel", "Save Expense" | Bottom-sticky on mobile |

**Validation:**
- Inline error messages for required fields (amount, category)
- Success feedback: Brief toast + confetti animation (200ms) if milestone hit
- Optimistic update pattern (per technical architecture)

---

### Screen 4: Voice Entry Flow (`/add/voice`)

**Purpose**: Natural language expense logging with review step

**Content Mapping:**

| Screen State | Component Pattern | Technical Reference | Content to Display | Visual Treatment |
|--------------|------------------|-------------------|-------------------|-----------------|
| Recording | Voice Capture UI | technical-architecture.md Voice section, google-apis L206-250 | Waveform animation, "Listening..." status | Animated waveform (120-150ms pulse), large mic icon |
| Processing | Loading State | - | "Processing..." with spinner | Skeleton loader pattern |
| Review Screen | Confirmation Form | architecture.md NLU parsing section | Parsed fields (amount, category, merchant) editable | Pre-filled form, highlight parsed values |
| Voice Encouragement | Toast/Feedback | notification-research gamification | "Great! Logged ₦500 for groceries" | Brief (2s), positive micro-animation |
| Error Fallback | Error State | google-apis Speech API limitations | "Couldn't understand, try again?" + manual entry option | Friendly tone, clear fallback CTA |

**Interaction Flow:**
1. Tap large microphone button (64px FAB)
2. Speak naturally: "I spent 500 naira on groceries at ShopRite"
3. Review parsed data in editable form
4. Confirm or edit → Save
5. See encouraging feedback message

---

### Screen 5: Transaction History (`/history`)

**Purpose**: Searchable, filterable list of all expenses

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Display | Visual Treatment |
|---------|------------------|-------------|-------------------|-----------------|
| Search Bar | Input with Icon | - | Search by merchant, category, amount | 48px height, sticky top |
| Filter Tabs | Horizontal Tabs | - | All, This Month, Last Month, Categories | Scrollable, URL-synced state |
| Transaction List | Virtualized List | Backend `/expenses` with pagination | Date headers, grouped by day/week | Infinite scroll, swipe actions (delete) |
| Empty State | Illustration Pattern | - | "No expenses yet" + CTA to add first | Friendly illustration, encouraging copy |
| Transaction Card | List Item Card | Per transaction | Category icon, merchant, date, amount, notes preview | 16px padding, dividers |

**Interactions:**
- Pull-to-refresh (mobile)
- Swipe left to delete (confirmation required)
- Tap card to expand details/edit

---

### Screen 6: Reports & Analytics (`/reports`)

**Purpose**: Data visualization and spending insights

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Display | Visual Treatment |
|---------|------------------|-------------|-------------------|-----------------|
| Period Selector | Segmented Control | - | Week, Month, Year | 3-option toggle |
| Spending Chart | Data Visualization | Backend aggregation endpoints | Line/bar chart, spending over time | Smooth animations (300ms), OPay green primary |
| Category Breakdown | Donut/Pie Chart | Backend category totals | % by category, top 5 categories | Color-coded segments |
| Insights Cards | Info Cards | Backend analysis | "You spent 20% less than last month" | Icon + text, celebratory for improvements |
| Export Options | Action Menu | Google Sheets integration | "Export to Sheets", "Download CSV" | Secondary actions in overflow menu |

**Gamification Integration:**
- Celebrate improvements with badge unlock ("Saver of the Month")
- Show progress toward spending goals

---

### Screen 7: Achievements & Gamification (`/achievements`)

**Purpose**: Display earned badges, streaks, and motivational milestones

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Display | Visual Treatment |
|---------|------------------|-------------|-------------------|-----------------|
| Streak Display | Hero Stats | Backend `/gamification/streak` | Current streak, longest streak, calendar heatmap | Large numbers (48px), fire icon, green highlights |
| Achievements Grid | Badge Grid | Backend `/gamification/achievements` | Locked/unlocked badges with titles | Grayscale locked, colorful unlocked, progress bars |
| Leaderboard (Optional) | Ranked List | Backend `/gamification/leaderboard` | Anonymous ranking or friends | Opt-in only, privacy-first |
| Upcoming Milestones | Progress Cards | Calculated from current stats | "3 more days to earn 'Week Warrior'" | Motivational copy, progress indicators |

**Badge Examples (from notification research):**
- First Week: 7 consecutive days
- Month Master: 30 consecutive days
- Century Club: 100 total expenses logged
- Budget Boss: Under budget for 3 months

**Micro-Celebrations:**
- Unlock animation: Scale + fade (250ms), confetti effect (optional, user pref)
- Sound option (can be disabled in settings)

---

### Screen 8: Profile & Settings (`/profile`)

**Purpose**: User preferences, notification controls, account management

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Display | Visual Treatment |
|---------|------------------|-------------|-------------------|-----------------|
| User Info | Profile Header | Google OAuth user data | Avatar, name, email | 24px padding, avatar 80px |
| Currency Settings | Dropdown Selector | User preferences | Primary currency (₦, $, €, etc.) | Standard select input |
| Budget Goals | Editable Fields | User preferences | Monthly budget limits per category | Inline edit pattern |
| Notification Preferences | Toggle List | notification-research preference center | Categories, frequency, downtime | Grouped toggles with descriptions |
| App Settings | Settings List | - | Theme (light/dark), language, data sync | Standard list items |
| Account Actions | Danger Zone | - | Sign out, delete account | Red text, confirmation dialogs |

**Notification Preference Categories (from research):**
- Streak Reminders: Daily/Off
- Achievement Notifications: Immediate/Daily Digest/Off
- Budget Alerts: On/Off
- Weekly Recap: Email/Push/Off
- Quiet Hours: Time range selector

---

### Screen 9: Push Notification Templates (Background/System)

**Purpose**: Define visual structure for push notifications

**Template Types (from notification-research.md):**

| Trigger | Template Pattern | Content to Display | Interaction |
|---------|-----------------|-------------------|-------------|
| Streak at Risk | Critical Alert | "🔥 Your 47-day streak continues if you log an expense today!" | Deep link to /add |
| Milestone Achievement | Celebration | "🎉 You completed 50 expenses—amazing progress!" | Deep link to /achievements |
| Budget Warning | Warning Alert | "⚠️ You've used 80% of your monthly budget" | Deep link to /reports |
| Weekly Recap | Digest | "📊 This week: 5 expenses, ₦12,450 spent" | Deep link to /history |
| Daily Reminder | Gentle Nudge | "💰 Quick reminder to log today's expenses" | Deep link to /add |

**Notification Design Specs:**
- Icon: App logo (72x72px)
- Title: Max 50 characters, bold
- Body: Max 120 characters, sentence case
- Actions: Max 2 buttons ("Log Now", "Dismiss")
- Badge: Unread count

---

## 4. Application Flow Analysis

**Information Density:** Medium-High
- Dashboard balances glanceable overview with actionable data
- Voice flow reduces density through progressive disclosure (speak → review → save)
- Reports provide depth for users who want detailed insights

**Content Balance:**
- Functional data: 70% (transactions, balances, budgets)
- Gamification: 20% (streaks, achievements, progress rings)
- Informational: 10% (tips, insights, empty states)

**Primary User Journeys:**
1. **Quick Log:** Home → Voice FAB → Speak → Review → Save (15 seconds)
2. **Manual Entry:** Home → Add → Form → Save (30 seconds)
3. **Check Progress:** Home → View streak + budget rings (5 seconds)
4. **Review Spending:** Home → History → Filter → Insights (1-2 minutes)
5. **Celebrate Achievement:** Notification → Achievements screen → View badge

**Interaction Complexity:**
- Low: Dashboard, Voice entry (designed for speed)
- Medium: Manual entry, History (standard forms/lists)
- High: Reports (data visualization), Settings (configuration)

**Performance Considerations (per OPay research):**
- All screens designed for 2GB RAM devices
- Virtualized lists for transaction history (avoid rendering all items)
- Lazy-load reports/achievements screens
- Offline queue for expense creation (technical architecture requirement)
- Conservative animations (<200ms for critical paths)
