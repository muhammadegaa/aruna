# MVP Launch - Comprehensive Todo List

## 🎯 Goal: Production-Ready MVP for Launch

**Status**: Core functionality works, needs polish and stability

---

## 🔴 CRITICAL - Must Fix Before Launch

### 1. Data & Analytics Engine
- [ ] **Verify all KPI calculations return correct values**
  - [ ] Test Padel: revenue_total, occupancy_rate, avg_booking_value
  - [ ] Test F&B: revenue_total, gross_margin, top_menu_items
  - [ ] Ensure no placeholder values (100%, 0 items, etc.)
  - [ ] Verify trend calculations (up/down/flat)

- [ ] **Fix occupancy heatmap data**
  - [ ] Verify matrix is 2D array (courts × hours)
  - [ ] Ensure percentages are 0-100 range
  - [ ] Test with empty data (should show empty state)
  - [ ] Test with real data (should show actual occupancy)

- [ ] **Fix F&B gross margin calculation**
  - [ ] Verify COGS is calculated from transaction metadata
  - [ ] Formula: (revenue - COGS) / revenue × 100
  - [ ] Test edge cases (zero revenue, negative margin)
  - [ ] Ensure it's not hardcoded to 100%

- [ ] **Fix menu items aggregation**
  - [ ] Verify top_menu_items returns actual count
  - [ ] Ensure menuItemId is used for aggregation
  - [ ] Test with empty transactions
  - [ ] Test with multiple menu items

### 2. Visualization Rendering
- [ ] **KPI Cards**
  - [x] Fix TypeError (unit.includes on undefined)
  - [ ] Test with all unit types (IDR, USD, %, items)
  - [ ] Ensure cards have equal heights
  - [ ] Fix text overflow (long labels/values)
  - [ ] Test responsive layout (mobile, tablet, desktop)
  - [ ] Verify trend indicators render correctly

- [ ] **Revenue Timeseries Chart**
  - [ ] Verify points array format: [{date: string, value: number}]
  - [ ] Test with empty data (should show placeholder)
  - [ ] Test with single data point
  - [ ] Test with 90 days of data
  - [ ] Ensure dates are formatted correctly
  - [ ] Verify Y-axis scales properly

- [ ] **Occupancy Heatmap**
  - [ ] Verify courts array matches matrix rows
  - [ ] Verify hours array matches matrix columns
  - [ ] Test with empty data
  - [ ] Test with partial data
  - [ ] Ensure color scale is correct (0-100%)
  - [ ] Verify tooltip shows correct values

- [ ] **Menu Margin Chart** (F&B)
  - [ ] Verify items array format
  - [ ] Test with empty data
  - [ ] Ensure margin percentages are correct
  - [ ] Verify color coding (green/yellow/red)

- [ ] **Generic Table**
  - [ ] Test with various column types
  - [ ] Verify number formatting
  - [ ] Test with empty rows
  - [ ] Ensure responsive scrolling

### 3. Agent & Tool Integration
- [ ] **Auto-widget creation**
  - [x] Implemented auto-widget creation in API route
  - [ ] Test: get_kpi_summary → creates kpi_cards widget
  - [ ] Test: get_occupancy_summary → creates occupancy_heatmap widget
  - [ ] Verify widgets are passed to frontend correctly
  - [ ] Test with multiple tool calls in sequence

- [ ] **Tool error handling**
  - [ ] Test with invalid businessId
  - [ ] Test with empty transactions
  - [ ] Test with missing entities
  - [ ] Verify error messages are user-friendly
  - [ ] Ensure errors don't crash the agent

- [ ] **Agent response quality**
  - [ ] Test common queries: "Show me this month's performance"
  - [ ] Verify agent calls correct tools
  - [ ] Verify agent creates widgets
  - [ ] Test edge cases (no data, invalid period, etc.)

### 4. Seed Data Quality
- [ ] **Padel seed data**
  - [ ] Verify 180 bookings are created
  - [ ] Check date distribution (90 days, realistic times)
  - [ ] Verify courtId and hour are in metadata
  - [ ] Check financial config (initialCapex, targetPaybackMonths)
  - [ ] Test seed completes without errors

- [ ] **F&B seed data**
  - [ ] Verify 600 transactions are created
  - [ ] Check menuItemId is in metadata
  - [ ] Verify cost is calculated correctly
  - [ ] Check date distribution (meal times)
  - [ ] Test seed completes without errors

- [ ] **Seed performance**
  - [ ] Measure seed time (should be < 10 seconds)
  - [ ] Optimize batch operations if needed
  - [ ] Add progress indicator during seed
  - [ ] Handle seed failures gracefully

---

## 🟡 HIGH PRIORITY - Launch Blockers

### 5. User Experience Flow
- [ ] **Landing page → Sign in → Dashboard → Workspace**
  - [ ] Test complete flow end-to-end
  - [ ] Verify no broken redirects
  - [ ] Check loading states at each step
  - [ ] Ensure error states are handled

- [ ] **Demo business creation**
  - [ ] Test Padel demo creation
  - [ ] Test F&B demo creation
  - [ ] Verify organization is auto-created
  - [ ] Check seed data is created
  - [ ] Ensure navigation to workspace works
  - [ ] Add loading indicator during creation

- [ ] **Dashboard page**
  - [ ] Fix slow loading (optimize queries)
  - [ ] Add skeleton loaders instead of spinners
  - [ ] Show businesses list immediately
  - [ ] Handle empty state (no businesses)
  - [ ] Fix organization creation error handling

- [ ] **Workspace page**
  - [ ] Verify business loads correctly
  - [ ] Check chat panel initializes
  - [ ] Test dashboard update flow
  - [ ] Verify clear dashboard works
  - [ ] Test back navigation

### 6. UI/UX Polish
- [ ] **Consistent styling**
  - [ ] Standardize card heights (use CSS Grid)
  - [ ] Fix spacing and padding (use design tokens)
  - [ ] Ensure consistent border radius
  - [ ] Verify shadow styles match design system
  - [ ] Check color palette consistency

- [ ] **Responsive design**
  - [ ] Test mobile layout (< 640px)
  - [ ] Test tablet layout (640px - 1024px)
  - [ ] Test desktop layout (> 1024px)
  - [ ] Fix any overflow issues
  - [ ] Ensure touch targets are adequate

- [ ] **Loading states**
  - [ ] Replace spinners with skeleton screens
  - [ ] Add loading states for:
    - [ ] Business list loading
    - [ ] Seed data creation
    - [ ] Agent response
    - [ ] Chart rendering
  - [ ] Ensure loading doesn't block UI

- [ ] **Error states**
  - [ ] Add error boundaries (already done for VisualPanel)
  - [ ] Improve error messages (user-friendly)
  - [ ] Add retry buttons where appropriate
  - [ ] Log errors for debugging
  - [ ] Show helpful error messages in chat

### 7. Performance Optimization
- [ ] **Dashboard page**
  - [ ] Optimize organization query (cache result)
  - [ ] Optimize businesses query (use React Query)
  - [ ] Reduce initial bundle size
  - [ ] Lazy load heavy components
  - [ ] Add service worker for caching (optional)

- [ ] **Workspace page**
  - [ ] Optimize business data fetch
  - [ ] Cache business data
  - [ ] Lazy load chart libraries
  - [ ] Optimize re-renders (use React.memo where needed)

- [ ] **Agent API**
  - [ ] Optimize Firestore queries
  - [ ] Add query result caching
  - [ ] Batch Firestore reads where possible
  - [ ] Monitor API response times

- [ ] **Seed data creation**
  - [ ] Batch Firestore writes
  - [ ] Add progress tracking
  - [ ] Optimize transaction creation
  - [ ] Consider using Firestore batch writes

---

## 🟢 MEDIUM PRIORITY - Nice to Have

### 8. Data Validation & Edge Cases
- [ ] **Input validation**
  - [ ] Validate businessId format
  - [ ] Validate date ranges
  - [ ] Validate period values
  - [ ] Sanitize user inputs

- [ ] **Edge case handling**
  - [ ] Empty transactions → show zero values
  - [ ] No entities → show empty state
  - [ ] Invalid dates → handle gracefully
  - [ ] Missing metadata → use defaults
  - [ ] Network failures → show retry option

- [ ] **Data consistency**
  - [ ] Verify orgId is always set on businesses
  - [ ] Check all transactions have required fields
  - [ ] Ensure entities have correct types
  - [ ] Validate financial config completeness

### 9. Developer Experience
- [ ] **Error logging**
  - [ ] Add structured logging
  - [ ] Log tool execution times
  - [ ] Log agent interactions
  - [ ] Add error tracking (Sentry or similar)

- [ ] **Code quality**
  - [ ] Remove console.logs (use proper logging)
  - [ ] Fix TypeScript any types
  - [ ] Add JSDoc comments
  - [ ] Ensure consistent code style

- [ ] **Documentation**
  - [ ] Update README with setup instructions
  - [ ] Document environment variables
  - [ ] Add API documentation
  - [ ] Document deployment process

### 10. Security & Compliance
- [ ] **Firestore rules**
  - [ ] Review all security rules
  - [ ] Test rules with different user roles
  - [ ] Ensure no data leaks
  - [ ] Deploy rules to production

- [ ] **Authentication**
  - [ ] Verify auth flow works correctly
  - [ ] Test sign out functionality
  - [ ] Check session persistence
  - [ ] Verify protected routes

- [ ] **Data privacy**
  - [ ] Ensure user data is isolated
  - [ ] Verify org-level data isolation
  - [ ] Check for any data leaks in logs

---

## 🔵 LOW PRIORITY - Post-Launch

### 11. Testing
- [ ] **Unit tests**
  - [ ] KPI calculation functions
  - [ ] Formatter functions
  - [ ] Tool functions
  - [ ] Utility functions

- [ ] **Integration tests**
  - [ ] Agent tool calling flow
  - [ ] Widget creation flow
  - [ ] Data seeding flow

- [ ] **E2E tests**
  - [ ] Complete user flow
  - [ ] Demo business creation
  - [ ] Agent interaction

### 12. Monitoring & Analytics
- [ ] **Error tracking**
  - [ ] Set up Sentry or similar
  - [ ] Track agent errors
  - [ ] Monitor API errors
  - [ ] Track visualization errors

- [ ] **Performance monitoring**
  - [ ] Track API response times
  - [ ] Monitor Firestore query times
  - [ ] Track page load times
  - [ ] Monitor agent response times

- [ ] **User analytics**
  - [ ] Track user actions
  - [ ] Monitor feature usage
  - [ ] Track conversion funnel

---

## 📋 Testing Checklist

### Manual Testing Scenarios

#### Scenario 1: New User Flow
1. [ ] Land on homepage
2. [ ] Click "Get Started" → redirects to sign in
3. [ ] Sign up with email/password
4. [ ] Auto-create organization
5. [ ] Land on dashboard
6. [ ] Create demo Padel business
7. [ ] Wait for seed to complete
8. [ ] Navigate to workspace
9. [ ] Ask agent: "Show me this month's performance"
10. [ ] Verify KPIs show real values
11. [ ] Verify heatmap renders
12. [ ] Verify no errors in console

#### Scenario 2: F&B Business
1. [ ] Create demo F&B business
2. [ ] Wait for seed
3. [ ] Navigate to workspace
4. [ ] Ask: "What's my revenue?"
5. [ ] Verify revenue KPI shows real value
6. [ ] Verify gross margin is not 100%
7. [ ] Verify top menu items shows count > 0
8. [ ] Verify revenue chart renders

#### Scenario 3: Error Handling
1. [ ] Test with invalid businessId
2. [ ] Test with empty transactions
3. [ ] Test network failure
4. [ ] Test agent timeout
5. [ ] Verify all errors show user-friendly messages

#### Scenario 4: Performance
1. [ ] Measure dashboard load time (< 2s)
2. [ ] Measure workspace load time (< 1s)
3. [ ] Measure seed time (< 10s)
4. [ ] Measure agent response time (< 5s)
5. [ ] Check bundle size (< 500KB initial)

---

## 🚀 Launch Readiness Criteria

### Must Have (Blockers)
- [ ] All critical bugs fixed
- [ ] All visualizations render correctly
- [ ] All KPIs show real values (no placeholders)
- [ ] Complete user flow works end-to-end
- [ ] No console errors
- [ ] Firestore rules deployed
- [ ] Environment variables documented

### Should Have (Important)
- [ ] Loading states implemented
- [ ] Error handling comprehensive
- [ ] Responsive design works
- [ ] Performance optimized
- [ ] Seed data quality verified

### Nice to Have (Optional)
- [ ] Unit tests written
- [ ] Error tracking set up
- [ ] Performance monitoring
- [ ] Documentation complete

---

## 📝 Notes

- **Current Status**: Core functionality works, needs polish
- **Estimated Time**: 2-3 days for critical + high priority items
- **Focus Areas**: Data accuracy, visualization rendering, UX polish
- **Testing**: Manual testing required before launch

---

## 🎯 Next Steps

1. **Today**: Fix all critical bugs (Section 1-3)
2. **Tomorrow**: Complete high priority items (Section 5-7)
3. **Day 3**: Polish and testing (Section 6, Testing Checklist)
4. **Launch**: Deploy and monitor

