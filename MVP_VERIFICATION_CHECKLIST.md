# MVP Verification Checklist - Make It Actually Work

## 🎯 Goal: Verify MVP works end-to-end, no bullshit

**Priority**: Test → Fix → Verify → Repeat

---

## ✅ PHASE 1: Core Functionality Verification (DO FIRST)

### Test 1: Complete User Journey
**Goal**: User can sign up, create business, see data, ask questions

- [ ] **Sign Up Flow**
  - [ ] Sign up with email/password → redirects to dashboard
  - [ ] Organization auto-creates (no error)
  - [ ] Dashboard loads in < 2 seconds
  - [ ] No "Please wait for organization" error

- [ ] **Create Demo Padel Business**
  - [ ] Click "Create Demo Padel Business"
  - [ ] Business creates successfully
  - [ ] Seed completes in < 10 seconds
  - [ ] Auto-navigates to workspace
  - [ ] No errors in console

- [ ] **Workspace Loads**
  - [ ] Business name displays correctly
  - [ ] Chat panel shows welcome message
  - [ ] Visual panel shows empty state (no widgets yet)
  - [ ] No loading spinners stuck

- [ ] **Ask Agent Question**
  - [ ] Type: "Show me this month's performance"
  - [ ] Agent responds (not error)
  - [ ] KPI cards appear in visual panel
  - [ ] Values are real numbers (not 0, not 100%, not placeholder)
  - [ ] Occupancy heatmap appears (for Padel)
  - [ ] No errors in console

### Test 2: Data Accuracy
**Goal**: All numbers are real, calculations are correct

- [ ] **Padel KPIs**
  - [ ] Total Revenue: Shows sum of all transactions (not 0, not placeholder)
  - [ ] Occupancy Rate: Shows percentage 0-100% (not 100%, not 0%)
  - [ ] Average Booking Value: Shows revenue / transaction count
  - [ ] All values formatted correctly (IDR currency, percentages)

- [ ] **F&B KPIs**
  - [ ] Total Revenue: Shows sum of all transactions
  - [ ] Gross Margin: Shows (revenue - COGS) / revenue × 100 (NOT 100%)
  - [ ] Top Menu Items: Shows count > 0 (not "0 items")
  - [ ] All values formatted correctly

- [ ] **Occupancy Heatmap (Padel)**
  - [ ] Shows 4 courts (Court 1, 2, 3, 4)
  - [ ] Shows hours (8:00 to 22:00)
  - [ ] Matrix has real percentages (0-100%)
  - [ ] Colors match values (darker = higher occupancy)
  - [ ] Tooltip shows correct values

- [ ] **Revenue Chart**
  - [ ] Shows data points (not empty)
  - [ ] Dates are formatted correctly
  - [ ] Y-axis scales properly
  - [ ] Line connects points correctly

### Test 3: Error Handling
**Goal**: App doesn't crash, shows helpful errors

- [ ] **Network Errors**
  - [ ] Disconnect internet → try to ask agent
  - [ ] Shows error message (not blank, not crash)
  - [ ] Can retry after reconnecting

- [ ] **Empty Data**
  - [ ] Create business but don't seed
  - [ ] Ask agent for KPIs
  - [ ] Shows zero values (not error, not crash)
  - [ ] Charts show empty state

- [ ] **Invalid Inputs**
  - [ ] Try to create business with invalid data
  - [ ] Shows validation error
  - [ ] Doesn't crash

- [ ] **Missing Data**
  - [ ] Business has no transactions
  - [ ] KPIs show 0 (not error)
  - [ ] Charts show empty state

---

## ✅ PHASE 2: Fix What's Broken (Based on Test Results)

### If KPIs show wrong values:
- [ ] Check KPI calculation functions
- [ ] Verify transaction data is correct
- [ ] Test with known data set
- [ ] Fix calculation logic

### If visualizations don't render:
- [ ] Check widget props format
- [ ] Verify data structure matches component expectations
- [ ] Test each visualization component individually
- [ ] Fix data transformation

### If agent doesn't respond:
- [ ] Check OpenRouter API key
- [ ] Verify tool calling works
- [ ] Check API route logs
- [ ] Test tools individually

### If seed takes too long:
- [ ] Verify batch writes are working
- [ ] Check Firestore rules allow writes
- [ ] Optimize batch size
- [ ] Add progress indicator

---

## ✅ PHASE 3: End-to-End Testing

### Scenario A: New User, Padel Business
1. [ ] Sign up → Dashboard loads
2. [ ] Create Padel demo → Seeds successfully
3. [ ] Workspace loads → No errors
4. [ ] Ask: "Show me this month's performance"
5. [ ] Verify:
   - [ ] Agent responds with summary
   - [ ] KPI cards show: Revenue (real number), Occupancy (0-100%), Avg Booking (real number)
   - [ ] Occupancy heatmap shows 4 courts × hours with percentages
   - [ ] No console errors
   - [ ] No placeholder values

### Scenario B: New User, F&B Business
1. [ ] Sign up → Dashboard loads
2. [ ] Create F&B demo → Seeds successfully
3. [ ] Workspace loads → No errors
4. [ ] Ask: "What's my revenue and gross margin?"
5. [ ] Verify:
   - [ ] Agent responds with summary
   - [ ] KPI cards show: Revenue (real number), Gross Margin (NOT 100%), Top Menu Items (> 0)
   - [ ] Revenue chart shows data points
   - [ ] No console errors
   - [ ] Gross margin is calculated correctly

### Scenario C: Multiple Questions
1. [ ] Ask: "Show me this month's performance"
2. [ ] Wait for response and widgets
3. [ ] Ask: "What about last month?"
4. [ ] Verify:
   - [ ] Second question works
   - [ ] Widgets update or new ones appear
   - [ ] No duplicate widgets
   - [ ] Agent remembers context

### Scenario D: Edge Cases
1. [ ] Ask: "Show me revenue for the last year" (no data)
   - [ ] Shows zero or empty state (not error)
2. [ ] Ask: "What's my profit?" (no expense data)
   - [ ] Shows zero or explains no data (not error)
3. [ ] Ask: "Compare this month to last month"
   - [ ] Shows comparison or explains if no data
4. [ ] Rapidly click buttons
   - [ ] Doesn't create duplicates
   - [ ] Doesn't crash

---

## ✅ PHASE 4: Performance Verification

### Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Workspace loads in < 1 second
- [ ] Seed completes in < 10 seconds
- [ ] Agent responds in < 5 seconds
- [ ] Charts render in < 1 second

### No Blocking
- [ ] Can interact with UI while loading
- [ ] Can type in chat while agent thinking
- [ ] Can navigate while data loads
- [ ] No frozen UI

---

## ✅ PHASE 5: Data Integrity

### Verify Seed Data
- [ ] **Padel**: Check Firestore
  - [ ] 4 entities (courts) exist
  - [ ] ~180 transactions exist
  - [ ] All transactions have: courtId, hour, hours in metadata
  - [ ] Financial config exists with initialCapex

- [ ] **F&B**: Check Firestore
  - [ ] 6 entities (menu items) exist
  - [ ] ~600 transactions exist
  - [ ] All transactions have: menuItemId, cost in metadata
  - [ ] Financial config exists

### Verify Calculations
- [ ] **Manual Check**: Pick 10 transactions, sum them
  - [ ] Matches Total Revenue KPI
- [ ] **Manual Check**: Count transactions
  - [ ] Matches transaction count
- [ ] **Manual Check**: Calculate gross margin manually
  - [ ] Matches Gross Margin KPI

---

## 🔧 Quick Fixes Needed (If Tests Fail)

### If dashboard loads slowly:
```typescript
// Already fixed: Load orgId from localStorage immediately
// Already fixed: Use React Query caching
```

### If KPIs show wrong values:
- Check: `lib/industry/modules/padel.ts` - computeOccupancyRate
- Check: `lib/industry/modules/fnb.ts` - computeGrossMargin
- Check: `lib/industry/modules/fnb.ts` - computeTopMenuItems

### If visualizations don't render:
- Check: `app/api/agent/chat/route.ts` - auto-widget creation
- Check: `components/workspace/VisualPanel.tsx` - widget rendering
- Check: Widget props match component expectations

### If agent doesn't work:
- Check: OpenRouter API key in `.env.local`
- Check: `lib/openrouter.ts` - API calls
- Check: `app/api/agent/chat/route.ts` - error handling

---

## 📊 Success Criteria

### MVP is "Working" when:
1. ✅ User can complete full journey (sign up → create → ask → see results)
2. ✅ All KPIs show real values (not placeholders)
3. ✅ All visualizations render with data
4. ✅ Agent responds to questions
5. ✅ No critical errors in console
6. ✅ Performance is acceptable (< 5s for any operation)

### MVP is NOT working if:
- ❌ KPIs show placeholder values (100%, 0 items, etc.)
- ❌ Visualizations are empty when data exists
- ❌ Agent doesn't respond or crashes
- ❌ Console shows critical errors
- ❌ User journey breaks at any step

---

## 🚀 Execution Plan

### Step 1: Run All Tests (30 min)
- Go through each test scenario
- Document what fails
- Screenshot errors

### Step 2: Fix Critical Failures (2-3 hours)
- Fix data calculations
- Fix visualization rendering
- Fix agent responses
- Fix error handling

### Step 3: Re-test (30 min)
- Run tests again
- Verify fixes work
- Document remaining issues

### Step 4: Polish (1-2 hours)
- Fix UI issues
- Improve error messages
- Optimize performance
- Remove console.logs

### Step 5: Final Verification (30 min)
- Complete end-to-end test
- Check all success criteria
- Verify no critical errors

---

## 🎯 Current Status Check

Run these RIGHT NOW to see what's broken:

1. **Create a new Padel business**
   - Does it seed? ✅/❌
   - Does workspace load? ✅/❌
   - Do KPIs show real values? ✅/❌

2. **Ask agent: "Show me this month's performance"**
   - Does agent respond? ✅/❌
   - Do widgets appear? ✅/❌
   - Are values correct? ✅/❌

3. **Check console**
   - Any errors? ✅/❌
   - Any warnings? ✅/❌

4. **Check visualizations**
   - KPI cards render? ✅/❌
   - Heatmap shows data? ✅/❌
   - Charts show data? ✅/❌

**If ANY are ❌, fix those first before doing anything else.**

