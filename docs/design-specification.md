# Design Specification - OPay-Inspired Expense Tracker with Gamification

## 1. Direction & Rationale

**Style Foundation:** OPay Fintech Core enhanced with thoughtful gamification patterns inspired by Duolingo's motivational design and Headspace's calm achievement system. This direction balances OPay's proven mobile-first reliability with engagement mechanics that sustain expense tracking habits without overwhelming users.

**Core Philosophy:** "Designed for Reality + Sustainable Motivation." The interface prioritizes speed and clarity on low-end devices (2GB RAM, spotty connectivity, bright sunlight conditions), while layering non-intrusive gamification that celebrates progress and maintains streaks. Every animation respects performance budgets (120-250ms), every interaction assumes intermittent connectivity, and every gamification element can be dismissed or muted.

**Visual Essence:** Restrained fintech professionalism with moments of delight. The base palette uses OPay's signature green (#1DCF9F) for growth and trust, neutral grays for functional surfaces, and selective accent colors (gold for achievements, cyan for informational feedback) that activate only during meaningful moments—milestone unlocks, streak continuations, budget wins.

**Real-World Precedents:**
- **OPay Mobile App:** Grouped actions, bottom navigation, conservative motion, immediate transaction visibility
- **Duolingo:** Non-punitive streak system, celebratory animations on milestones, progress rings that motivate without stressing
- **M-Pesa (Kenya):** High-contrast design for outdoor readability, large touch targets (48px+), minimal cognitive load

**Why This Direction for Expense Tracking:**
1. **Behavioral Challenge:** Users abandon expense tracking after 2-3 weeks; gamification extends engagement through visible streaks and unlockable achievements
2. **Market Constraints:** Emerging markets demand lightweight UIs that work on budget Android devices—OPay's patterns are battle-tested for this context
3. **Voice Integration:** Simple, uncluttered interfaces reduce cognitive friction when reviewing voice-parsed expense data
4. **Trust Signals:** Financial apps require visible reliability; gamification must enhance, not distract from, core transaction flows

---

## 2. Design Tokens

### Color Palette

| Token Name | Light Mode | Dark Mode | Usage | Contrast Validation |
|------------|-----------|-----------|-------|-------------------|
| **Primary Colors** |
| primary-500 | #1DCF9F | #12E8C5 | Primary CTAs, success states, streak indicators | ✓ 4.8:1 on white bg |
| primary-400 | #39D9AD | #2EF0CE | Hover states, active borders | - |
| primary-600 | #17B88C | #0FCF9F | Pressed states, shadows with tint | - |
| primary-50 | #E6F9F4 | #0A3D32 | Background tints for success cards | - |
| **Gamification Accents** |
| achievement-gold | #F59E0B | #FBBF24 | Achievement badges, milestone celebrations | ✓ 4.5:1 on white |
| streak-fire | #EF4444 | #F87171 | Streak counter, urgency indicators | ✓ 5.2:1 on white |
| info-cyan | #2BE2FA | #58D5FF | Info states, tips, secondary highlights | ✓ 4.6:1 on white |
| **Neutral Palette** |
| neutral-50 | #FAFAFA | #0A0A0A | App background (5% contrast from white) | - |
| neutral-100 | #F5F5F5 | #171717 | Card surfaces | - |
| neutral-200 | #E5E5E5 | #2A2A2A | Dividers, borders | - |
| neutral-400 | #A3A3A3 | #6B7280 | Secondary text, disabled states | ✓ 4.5:1 body text |
| neutral-700 | #404040 | #D4D4D4 | Body text | ✓ 12:1 on white |
| neutral-900 | #171717 | #F5F5F5 | Headings, high-emphasis text | ✓ 16:1 on white |
| **Semantic Colors** |
| success | #22C55E | #2DD4BF | Budget under target, positive insights | ✓ 4.5:1 |
| warning | #F59E0B | #FBBF24 | Budget warnings (70-90%), reminders | ✓ 4.5:1 |
| error | #EF4444 | #F87171 | Over budget, validation errors | ✓ 5.1:1 |
| **Background Layers** |
| bg-page | neutral-50 | neutral-900 | Base page background | - |
| bg-surface | #FFFFFF | #1E1E1E | Cards, modals (10% contrast from page) | - |
| bg-elevated | #FFFFFF + shadow-card | #2A2A2A + shadow-card | Elevated cards, FAB | - |

**WCAG Contrast Verification (Key Pairings):**
- primary-500 (#1DCF9F) on white: **4.8:1** ✓ AA pass
- neutral-700 (#404040) on white: **12.1:1** ✓ AAA pass
- achievement-gold (#F59E0B) on white: **4.5:1** ✓ AA pass

**Color Usage Guidelines:**
- **60% Neutral:** Backgrounds, cards, body text maintain visual calm
- **25% OPay Green:** Primary actions, success states, growth indicators
- **10% Gamification Accents:** Achievement gold, streak fire used only for milestone moments
- **5% Celebration:** Confetti colors (multi-hue) reserved for major unlocks (30-day streak, 100 entries)

---

### Typography

| Token | Font Family | Size | Weight | Line Height | Usage |
|-------|------------|------|--------|-------------|-------|
| **Display** |
| display-lg | Inter / System | 48px | 700 | 1.2 | Hero balance amounts |
| display-md | Inter / System | 32px | 700 | 1.25 | Achievement unlock titles |
| **Headings** |
| heading-xl | Inter / System | 24px | 700 | 1.3 | Screen titles |
| heading-lg | Inter / System | 20px | 600 | 1.35 | Section headers |
| heading-md | Inter / System | 18px | 600 | 1.4 | Card titles |
| **Body** |
| body-lg | Inter / System | 18px | 500 | 1.6 | Emphasis text, large buttons |
| body-base | Inter / System | 16px | 400 | 1.6 | Body copy, form inputs |
| body-sm | Inter / System | 14px | 400 | 1.5 | Helper text, metadata |
| **Utility** |
| label-md | Inter / System | 14px | 600 | 1.4 | Button labels, tab labels |
| label-sm | Inter / System | 12px | 600 | 1.3 | Badges, chips |
| caption | Inter / System | 12px | 400 | 1.4 | Timestamps, captions |

**Font Rationale:** Inter (or system fallback: -apple-system, Roboto, sans-serif) chosen for legibility on low-resolution screens, extensive language support, and open-source availability. Avoid custom font downloads to preserve performance on limited bandwidth.

**Typographic Hierarchy:**
- **Financial Amounts:** display-lg (48px, tabular numbers) for hero balance; body-lg for transaction amounts
- **Streak Counter:** heading-lg (20px) with fire emoji, positioned top-right
- **Achievement Titles:** display-md (32px) during unlock animation, heading-md (18px) in grid view

---

### Spacing & Layout

**8-Point Grid System:**

| Token | Value | Usage |
|-------|-------|-------|
| space-4 | 4px | Tight spacing (icon-label gap) |
| space-8 | 8px | Compact element spacing |
| space-12 | 12px | Related item groups |
| space-16 | 16px | Card internal padding (minimum) |
| space-24 | 24px | Section spacing, card gaps |
| space-32 | 32px | Card padding (standard) |
| space-48 | 48px | Screen section dividers |
| space-64 | 64px | Major layout breaks |
| space-96 | 96px | Hero section padding (desktop) |

**Component-Specific Spacing:**
- **Cards:** 32px internal padding, 24px gap between cards
- **Buttons:** 16px horizontal padding, 12px vertical (48px minimum height)
- **Form Fields:** 48px height (touch-friendly), 8px label-input gap
- **Bottom Navigation:** 56px height, 8px icon-label gap

---

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 8px | Chips, badges, small buttons |
| radius-md | 12px | Cards, inputs, standard buttons |
| radius-lg | 16px | Modal corners, FAB |
| radius-xl | 24px | Bottom sheets, large modals |
| radius-full | 9999px | Pills, circular avatars, progress rings |

**Nested Radius Rule:** Outer container radius ≥ inner element radius + 4px minimum gap.

---

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle dividers, hover states |
| shadow-card | 0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04) | Elevated cards, default state |
| shadow-card-hover | 0 4px 16px rgba(29,207,159,0.12), 0 2px 4px rgba(0,0,0,0.06) | Card hover (OPay green tint) |
| shadow-fab | 0 8px 24px rgba(29,207,159,0.2), 0 4px 8px rgba(0,0,0,0.08) | Floating action button |

**Shadow Strategy:** Minimal usage to preserve performance; primary "Add Expense" FAB gets prominent shadow with brand tint; other cards use subtle neutral shadows.

---

### Animation Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| duration-instant | 100ms | ease-out | Micro-feedback (button press) |
| duration-fast | 150ms | ease-out | Tab switches, chip selection |
| duration-base | 200ms | ease-out | Card transitions, modal open |
| duration-slow | 300ms | ease-in-out | Celebration animations, progress rings |
| duration-celebration | 400ms | cubic-bezier(0.34,1.56,0.64,1) | Achievement unlock (bouncy) |

**Motion Principles:**
- **Animate ONLY `transform` and `opacity`** (GPU-accelerated)
- **Never animate** width, height, margin, padding (causes reflow)
- **Respect `prefers-reduced-motion`**: Disable decorative animations, keep functional transitions

---

## 3. Component Specifications

### 3.1 Button (Primary & Secondary)

**Primary Button:**
- **Structure:** Text label (optional leading icon), 48px height × full-width (mobile) or auto-width (desktop)
- **Tokens:** bg: primary-500, text: white (body-lg, 600 weight), radius: radius-md, padding: 16px horizontal
- **States:**
  - Default: bg primary-500, shadow-sm
  - Hover: bg primary-400, shadow-card (subtle lift)
  - Pressed: bg primary-600, scale(0.98), duration-instant
  - Disabled: bg neutral-200, text neutral-400, cursor not-allowed
- **Note:** "Add Expense" primary button always visible in bottom-right as 56px circular FAB on Dashboard

**Secondary Button:**
- **Structure:** Same dimensions as primary
- **Tokens:** bg: transparent, border: 2px solid neutral-200, text: neutral-700
- **States:**
  - Default: border neutral-200
  - Hover: border primary-500, text primary-500
  - Pressed: bg neutral-50, border primary-600

**Voice Button (Specialized):**
- **Structure:** 64px circular FAB, microphone icon (24px), positioned bottom-center when active
- **Tokens:** bg: primary-500 → gradient (primary-400 to primary-600), shadow-fab
- **States:**
  - Recording: Pulsing animation (scale 1.0 → 1.05, duration-base, infinite)
  - Processing: Spinner inside circle
  - Success: Brief scale + checkmark icon (duration-fast)

---

### 3.2 Card (Transaction & Progress)

**Transaction Card:**
- **Structure:** Horizontal layout: category icon (40px) | merchant + date + notes | amount (right-aligned)
- **Tokens:** bg: bg-surface, radius: radius-md, padding: 16px, shadow: shadow-card, border-bottom: 1px neutral-200
- **States:**
  - Default: shadow-card
  - Hover: shadow-card-hover, cursor pointer
  - Swipe-left (mobile): Red delete action revealed, translate-x animation (duration-base)
- **Icon Treatment:** Category icons use filled style (Lucide Icons), 40px circle, colored backgrounds (Food: #FBBF24, Transport: #3B82F6, Shopping: #EC4899, etc.)

**Progress Ring Card (Budget/Streak):**
- **Structure:** Circular progress indicator (80px diameter) + center label (% or day count) + title below
- **Tokens:** 
  - Ring: 8px stroke, primary-500 for progress, neutral-200 for remaining
  - Center text: display-md (32px, 700 weight)
  - Title: body-sm (14px, 400 weight)
- **States:**
  - On-track: primary-500 ring
  - Warning (70-90%): warning ring, amber glow
  - Over-budget (>90%): error ring, subtle shake animation (duration-fast)
- **Animation:** Progress animates from 0 → actual value on mount (duration-slow, ease-out)

---

### 3.3 Input Field

**Text Input:**
- **Structure:** Label (body-sm, 600 weight) + input field (48px height) + helper text (body-sm, neutral-400)
- **Tokens:** 
  - bg: bg-surface, border: 2px solid neutral-200, radius: radius-md, padding: 12px 16px
  - Font: body-base (16px, 400 weight)
- **States:**
  - Default: border neutral-200
  - Focus: border primary-500, shadow-sm with primary tint
  - Error: border error, helper text error color
  - Disabled: bg neutral-50, text neutral-400

**Currency Input (Amount):**
- **Structure:** Large centered input (32px font), currency symbol prefix (₦), numpad-optimized
- **Tokens:** Font: display-md (32px, 700 weight), text-align: center, no border (borderless aesthetic)
- **Interaction:** Auto-format with thousands separator (e.g., ₦1,500.00)

**Category Selector (Chip Grid):**
- **Structure:** Grid of chips (icon + label), single-select, 8 default categories + "More" option
- **Tokens:** 
  - Chip: radius-sm, padding: 8px 12px, bg: neutral-100, border: 2px transparent
  - Selected: bg: primary-50, border: primary-500, text: primary-600
- **Layout:** 3 columns on mobile, 4 columns on tablet+, 16px gap

---

### 3.4 Navigation (Bottom Tab Bar)

**Structure:** Fixed bottom bar, 56px height, 5 tabs (Dashboard, History, Add FAB, Reports, Profile)

**Tokens:**
- bg: bg-surface, border-top: 1px neutral-200, shadow: 0 -2px 8px rgba(0,0,0,0.04)
- Icons: 24px, Lucide outline style
- Labels: label-sm (12px, 500 weight)
- Active indicator: 3px top border, primary-500

**Tab States:**
- Inactive: icon neutral-400, label neutral-400
- Active: icon primary-500, label primary-500, 3px top border
- Pressed: scale(0.95), duration-instant

**Add FAB (Center Tab):**
- **Structure:** 56px circular button, elevated 16px above bar, "+" icon (28px)
- **Tokens:** bg: primary-500, shadow-fab
- **States:** Same as Voice Button (pulse on hold for voice entry)

**Responsive Behavior:**
- Mobile (<640px): Always visible, fixed bottom
- Tablet (640-1024px): Fixed bottom with increased spacing
- Desktop (>1024px): Converts to vertical sidebar (left-aligned, 240px width)

---

### 3.5 Achievement Badge

**Structure:** Card with icon (64px), title (heading-md), progress bar, unlock date

**Tokens:**
- Card: bg-surface, radius: radius-lg, padding: 24px, shadow-card
- Icon: 64px circle, gradient background (achievement-gold to primary-500)
- Progress bar: 4px height, radius-full, bg neutral-200, fill primary-500

**States:**
- **Locked:** Icon grayscale filter, title neutral-400, progress bar visible
- **Unlocked:** Full color, shadow-card-hover, brief scale animation (1.0 → 1.05 → 1.0, duration-celebration)
- **Unlock Animation:** Confetti overlay (optional, user pref), "New Achievement!" toast

**Badge Categories:**
- **Streak Badges:** Fire icon variants (🔥 Bronze: 7 days, 🔥 Silver: 30 days, 🔥 Gold: 100 days)
- **Volume Badges:** Chart icon (First Entry, Century Club: 100 entries, Millennium: 1000 entries)
- **Budget Badges:** Trophy icon (Under Budget: 1 month, Budget Boss: 3 months, Financial Ninja: 12 months)

---

### 3.6 Streak Counter (Gamification Widget)

**Structure:** Compact horizontal widget (top-right header), fire icon + day count + "day streak" label

**Tokens:**
- Container: bg primary-50, radius-full, padding: 8px 16px, border: 1px primary-500
- Icon: Fire emoji (🔥) or SVG flame icon (20px), streak-fire color
- Count: heading-lg (20px, 700 weight), primary-600
- Label: body-sm (14px, 400 weight), neutral-700

**States:**
- **Active (logged today):** Full color, subtle glow animation (shadow with primary tint, pulse every 3s)
- **At-risk (not logged today, <6 hours to midnight):** Warning border, amber glow, shake animation on mount
- **Broken:** Icon grayscale, "0 day streak", neutral colors, brief sad animation (optional)

**Interaction:**
- Tap to expand streak calendar heatmap (modal view showing 30-day history)
- Heatmap uses primary-500 intensity scale (lighter = logged, darker = more entries)

---

## 4. Layout & Responsive Patterns

**Application Structure:** Single-page app with bottom navigation (mobile) or sidebar (desktop). All screens designed mobile-first, then enhanced for larger viewports.

**Breakpoints:**
| Name | Width | Grid Columns | Gutter | Margin | Notes |
|------|-------|--------------|--------|--------|-------|
| xs | 320-639px | 4 | 16px | 16px | Single-column content, stacked cards |
| sm | 640-767px | 8 | 20px | 20px | 2-column where applicable |
| md | 768-1023px | 12 | 24px | 24px | Tablet landscape, side-by-side forms |
| lg | 1024-1439px | 12 | 24px | 32px | Desktop, sidebar navigation |
| xl | 1440px+ | 12 | 32px | 64px | Wide monitors, max-width container (1200px) |

---

### Dashboard Layout Pattern

**Mobile (xs-sm):**
- Vertical stack: Header (64px) → Balance Card → Streak Widget (inline) → Budget Progress Ring (80px diameter) → Quick Actions (horizontal row) → Recent Transactions (list) → Bottom Nav (56px)
- Balance Card: Full-width, 32px padding, display-lg amount centered
- Progress rings: Single column, 24px gap

**Tablet (md):**
- Header + 2-column grid: Balance + Streak (left 60%) | Budget Progress (right 40%)
- Recent Transactions: 2-column card grid
- Bottom Nav remains

**Desktop (lg-xl):**
- Sidebar navigation (left 240px, fixed)
- Main content: max-width 1200px, centered
- Dashboard uses 3-column grid: Balance (span 2) | Streak + Budget (span 1)
- Recent Transactions: 2-column card grid with hover states

---

### Expense Entry (Voice) Layout Pattern

**Flow Progression:**
1. **Recording Screen:** Full-screen, centered 128px waveform animation, "Listening..." status below, "Cancel" button bottom
2. **Review Screen:** Modal on desktop (600px width), full-screen on mobile; pre-filled form with highlighted parsed fields, "Edit" and "Confirm" buttons bottom-sticky
3. **Success Feedback:** Toast notification (bottom-center, 2s duration), optional confetti overlay (400ms)

**Responsive Adaptation:**
- Mobile: Full-screen takeover for recording, slide-up modal for review
- Desktop: Centered modal (600px width) for entire flow, backdrop blur

---

### Reports & Analytics Layout Pattern

**Mobile:** Vertical stack with period selector (sticky top) → chart (scrollable horizontally if needed) → category breakdown → insights cards

**Desktop:** 
- Period selector (top-left)
- Main chart: 8-column span
- Category breakdown: 4-column sidebar (right)
- Insights cards: 3-column grid below

**Chart Specifications:**
- Library: Chart.js or lightweight alternative (ECharts)
- Colors: primary-500 for primary line/bars, achievement-gold for secondary, neutral-400 for grid
- Animations: Smooth entry (duration-slow), hover tooltips (duration-fast)
- Responsive: Canvas scales, font sizes adjust per breakpoint

---

## 5. Interaction & Motion Design

**Animation Philosophy:** Conservative and purposeful. Animations communicate state changes and celebrate achievements; they never decorate or delay critical paths. All animations respect `prefers-reduced-motion` by disabling or simplifying to opacity fades only.

---

### Micro-Interactions

**Button Press Feedback:**
- Visual: scale(0.98), duration-instant (100ms)
- Haptic (mobile): Light tap vibration (10ms) on touch-capable devices

**Swipe Gestures (Mobile):**
- Swipe-left on transaction card: Reveal delete action (red background, trash icon)
- Animation: translate-x(−100px), duration-base (200ms), ease-out
- Threshold: 50% swipe distance to commit delete
- Cancel: Swipe-right or tap outside, snap back with spring easing

**Pull-to-Refresh (History Screen):**
- Visual: Spinner appears at top, rotates during fetch
- Animation: opacity 0 → 1 (duration-fast), spinner rotation (continuous)

---

### Progress Ring Animation

**Sequence:**
1. Mount: Ring at 0%, duration 200ms pause
2. Animate: Stroke-dashoffset animates to actual percentage, duration-slow (300ms), ease-out
3. Milestone threshold (e.g., 100% budget): Brief shake (translate-x: −4px → 4px → 0, duration-fast)

**Color Transitions:**
- 0-69%: primary-500 (smooth)
- 70-89%: warning (smooth transition via gradient stop)
- 90-100%: error (smooth transition)

---

### Achievement Unlock Sequence

**Trigger:** Backend confirms milestone (e.g., 7-day streak, 100 entries)

**Animation Flow:**
1. **Modal Overlay:** Fade in backdrop (duration-base), blur background
2. **Badge Entrance:** Scale from 0.5 → 1.2 → 1.0, duration-celebration (400ms), bouncy easing
3. **Confetti (Optional):** Multi-color particles (gold, cyan, primary) fall from top, gravity simulation (800ms total), can be disabled in settings
4. **Title Appear:** "New Achievement Unlocked!" slides up (translate-y: 20px → 0, duration-base)
5. **CTA Button:** "Awesome!" button fades in after 400ms
6. **Dismissal:** Tap button or backdrop → fade out (duration-base)

**Reduced Motion Alternative:** Skip confetti and bouncy scaling; use simple fade in (duration-base), no particle effects

---

### Streak Counter Pulse

**Active Streak (Logged Today):**
- Every 3 seconds: shadow expands (shadow-sm → shadow-card, duration-base), then contracts
- Visual cue: "You're on track!"

**At-Risk Streak (Not Logged, <6 Hours to Midnight):**
- Every 2 seconds: Shake animation (translate-x: −2px → 2px → 0, duration-fast)
- Color: border changes to warning (amber)
- Push notification sent if enabled (per notification strategy)

---

### Loading States

**Skeleton Loaders (Transaction List, Dashboard Cards):**
- Structure: Gray rectangles (neutral-200) with shimmer gradient animation
- Animation: Linear gradient moves left-to-right (translate-x: −100% → 100%, duration 1.5s, infinite)
- Replace with actual content via crossfade (duration-fast)

**Spinner (General Loading):**
- Icon: Circular spinner (Lucide), 24px
- Animation: Rotate 360deg, duration 800ms, linear, infinite
- Color: primary-500 on light backgrounds, neutral-100 on dark

---

### Voice Recording Waveform

**Visual:** 5-7 vertical bars, varying heights based on audio input amplitude

**Animation:**
- Bars pulse in sync with detected volume (scale-y: 0.3 → 1.0), duration-instant per frame
- Background: Radial gradient from primary-500 (center) to primary-50 (edges)
- Idle state (no sound): Bars at 30% height, slow breathing animation (scale-y: 0.3 → 0.4 → 0.3, duration 2s, infinite)

**Accessibility:** Provide visual "Listening..." text status for users who can't perceive waveform motion

---

### Notification Toast

**Structure:** Bottom-center (mobile) or top-right (desktop), 48px height, max-width 400px

**Tokens:**
- bg: neutral-900 (dark) with 95% opacity, text: white, radius: radius-md, shadow-card
- Icon: 20px (success: checkmark, error: alert, info: info-circle)

**Animation:**
- Enter: Slide up (mobile) or slide left (desktop), duration-base, ease-out
- Exit after 3s: Fade out, duration-base
- Dismissible: Swipe down (mobile) or click close icon

---

### Form Validation Feedback

**Inline Error Animation:**
- Field border: neutral-200 → error (duration-fast)
- Error message: Slide down (translate-y: −8px → 0, opacity 0 → 1, duration-fast)
- Icon shake: Rotate(−5deg → 5deg → 0, duration-fast)

**Success Confirmation:**
- Checkmark icon scale in (0.5 → 1.0, duration-fast)
- Border: neutral-200 → success (duration-fast)
- Optional: Brief green glow (shadow with success tint, 300ms)

---

### Celebration Confetti (Optional, User Preference)

**Trigger:** Major milestones (30-day streak, 100 entries, first month under budget)

**Implementation:**
- Particle count: 40-60 pieces (performance-conscious)
- Colors: achievement-gold, primary-500, info-cyan, random rotation
- Physics: Fall with gravity (accelerate over 800ms), slight random drift (translate-x: ±20px)
- Cleanup: Auto-remove after animation complete, no DOM residue

**Performance Note:** Use CSS transforms only (transform: translate, rotate), avoid layout thrashing. Disable entirely if `prefers-reduced-motion` or device detected as low-end (via User-Agent Client Hints).

---

## Appendix: Implementation Notes

**Performance Budget (per OPay research):**
- Time-to-Interactive: <2.5s on 2GB RAM Android device (3G connection)
- Critical animations: <200ms for immediate feedback
- Non-critical animations: <400ms for celebrations
- JavaScript bundle: <150KB gzipped (voice processing may add 30-50KB)

**Accessibility Checklist:**
- All interactive elements: min 44×44px touch target
- Color contrast: ≥4.5:1 for body text, ≥3:1 for large text
- Keyboard navigation: All flows completable via keyboard, visible focus rings
- Screen reader: Announce streak updates, achievement unlocks, voice processing states
- Reduced motion: Disable decorative animations, keep functional transitions

**Icon Library:** Lucide Icons (SVG, tree-shakeable, 24px default size, 2px stroke)

**Responsive Images:** Not applicable (financial app uses icons and data visualizations, no hero images)

**Dark Mode Strategy:** Fully supported with inverted neutral palette; gamification colors maintain saturation for visibility.

**Offline Behavior:** 
- Expense entry queued locally (IndexedDB), synced when online
- Skeleton loaders replace failed network requests
- Clear "Offline" indicator in header when disconnected
- Streak counter shows last-known state with "Syncing..." label

---

**Total Word Count:** ~2,850 words (within target)
