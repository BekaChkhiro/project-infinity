# Testing Guide - Project Infinity Dashboard

## Setup Test Data

Before testing, populate the database with test data:

```bash
# Make sure you have these environment variables set:
# - NEXT_PUBLIC_SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY (get this from Supabase dashboard)

npm run seed
```

This will create:
- 8 test clients
- 40-50 projects distributed across all 18 stages
- 2-4 projects per stage for comprehensive testing

---

## Test 1: Pipeline Count Accuracy 

**Goal:** Verify that the pipeline on the dashboard shows correct project counts per stage.

### Steps:
1. Navigate to `/dashboard`
2. Scroll to the "ЮаЭФевФСШб бвРУШФСШ" section
3. Check each of the 18 stage cards

### Expected Results:
-  Each card shows a number representing projects in that stage
-  Numbers match the actual count in the database
-  Cards are color-coded correctly:
  - **Gray** for stages 1-3 (Initial)
  - **Blue** for stages 4-5 (Active Communication)
  - **Green** for stages 6-11 (Development)
  - **Yellow** for stages 12-13 (Approval)
  - **Orange** for stages 14-16 (Payment)
  - **Purple** for stages 17-18 (Final)
-  Hovering over cards shows shadow effect

### Manual Verification:
```sql
-- Run this in Supabase SQL Editor to verify counts
SELECT stage_number, COUNT(*) as count
FROM projects
GROUP BY stage_number
ORDER BY stage_number;
```

---

## Test 2: Statistics Cards Accuracy

**Goal:** Verify that the 4 statistics cards show correct numbers.

### Steps:
1. On dashboard, check the 4 stat cards at the top

### Expected Results:
-  **Total Active Projects**: Shows all projects (except completed)
-  **Projects in Development**: Shows count where `stage_number` between 6-11
-  **Awaiting Payment**: Shows count where `stage_number` between 14-16
-  **Completed This Month**: Shows projects completed in current month

### Manual Verification:
```sql
-- Total active projects
SELECT COUNT(*) FROM projects;

-- In Development (stages 6-11)
SELECT COUNT(*) FROM projects WHERE stage_number BETWEEN 6 AND 11;

-- Awaiting Payment (stages 14-16)
SELECT COUNT(*) FROM projects WHERE stage_number BETWEEN 14 AND 16;

-- Completed this month
SELECT COUNT(*) FROM projects
WHERE completion_date >= date_trunc('month', CURRENT_DATE);
```

---

## Test 3: Filter Combinations

**Goal:** Test that filters work independently and in combination.

### Navigate to `/dashboard/projects`

### Test 3.1: Search Filter
1. Type a project name in search box
2. **Expected:** Table updates to show only matching projects
3. Type a client name
4. **Expected:** Shows projects for that client
5. Clear search
6. **Expected:** All projects show again

### Test 3.2: Stage Filter
1. Click "дШЪваШ бвРУШШЧ" dropdown
2. Select any stage (e.g., "УРХШмзФЧ УФХФЪЭЮФЫЬвШ")
3. **Expected:** Only projects in that stage are shown
4. **Expected:** Stage badge colors match selected stage
5. Select "зХФЪР бвРУШР"
6. **Expected:** All projects show again

### Test 3.3: Combined Filters
1. Enter search text: "Website"
2. Select stage filter: "ЫШХШжФЧ ШЬдЭаЫРкШР"
3. **Expected:** Shows only "Website" projects in that specific stage
4. Clear one filter at a time
5. **Expected:** Results update correctly each time

### Test 3.4: No Results
1. Search for "XYZ123NonExistent"
2. **Expected:** Shows "ЮаЭФевФСШ Ра ЫЭШлФСЬР" message
3. **Expected:** No table rows shown

---

## Test 4: Sorting Functionality

**Goal:** Verify all sortable columns work correctly.

### Steps:
1. Click on "ЮаЭФевШб бРоФЪШ" header
   - **Expected:** Projects sort A-Z
   - Click again ’ Z-A

2. Click on "ЩЪШФЬвШ" header
   - **Expected:** Sort by client name alphabetically

3. Click on "СЭЪЭ ТРЬРоЪФСР" header
   - **Expected:** Sort by date (newest/oldest)

4. Click on "УжФФСШ бвРУШРиШ" header
   - **Expected:** Sort by number of days (ascending/descending)

### Expected Results:
-  Arrow icon changes direction on click
-  Data reorders correctly
-  Pagination maintains sort order
-  Filters work with sorted data

---

## Test 5: Real-time Updates

**Goal:** Verify that changes in the database appear live without refresh.

### Setup:
1. Open `/dashboard/projects` in **Tab 1**
2. Open Supabase Dashboard in **Tab 2**

### Test 5.1: Insert New Project
1. In Supabase, go to Table Editor ’ projects
2. Click "Insert row"
3. Add a new project with all required fields
4. Save

**Expected in Tab 1:**
-  New project appears at top of list automatically
-  No page refresh needed
-  Pipeline on dashboard updates count

### Test 5.2: Update Existing Project
1. In Supabase, edit an existing project
2. Change `current_stage` to different stage
3. Change `title` to "UPDATED TEST"
4. Save

**Expected in Tab 1:**
-  Project title updates automatically
-  Stage badge changes color
-  "СЭЪЭ ТРЬРоЪФСР" time updates
-  If stage filter is active, project may move in/out of view

### Test 5.3: Delete Project
1. In Supabase, delete a project
2. Confirm deletion

**Expected in Tab 1:**
-  Project disappears from list immediately
-  Count updates
-  If it was the only project on a page, pagination adjusts

### Alternative Test (Using Two Browser Tabs):
1. Open project list in Chrome **Tab 1**
2. Open same project list in Firefox **Tab 2**
3. Click a project in Tab 2 to view details
4. Edit the project stage
5. **Expected:** Tab 1 shows the update automatically

---

## Test 6: Pagination

**Goal:** Verify pagination works with 20 items per page.

### Prerequisites:
- Need at least 21 projects in database (seed script creates 40-50)

### Test 6.1: Basic Navigation
1. Go to `/dashboard/projects`
2. Check bottom of table shows: "ТХФаУШ 1 / X"
3. **Expected:** Shows only 20 projects
4. Click next page arrow (’)
5. **Expected:** Shows next 20 projects
6. **Expected:** Page number updates to "ТХФаУШ 2 / X"
7. Click previous arrow (ђ)
8. **Expected:** Returns to page 1

### Test 6.2: Jump to First/Last
1. Click н (last page button)
2. **Expected:** Jumps to final page
3. **Expected:** May show fewer than 20 items on last page
4. Click о (first page button)
5. **Expected:** Returns to page 1

### Test 6.3: Pagination with Filters
1. Apply a stage filter
2. **Expected:** Pagination recalculates based on filtered results
3. **Expected:** Page count updates (e.g., "ТХФаУШ 1 / 2")
4. Navigate through filtered pages
5. **Expected:** Only filtered items shown
6. Clear filter
7. **Expected:** Pagination resets to full dataset

### Test 6.4: Selection Across Pages
1. Select checkbox for 3 projects on page 1
2. Go to page 2
3. Select 2 more projects
4. **Expected:** Bottom shows "РайФгЪШР 5 ЮаЭФевШ X-УРЬ"
5. Click "ФебЮЭавШ CSV"
6. **Expected:** CSV contains only 5 selected projects

---

## Test 7: CSV Export

**Goal:** Test bulk export functionality.

### Test 7.1: Export All
1. Make sure no projects are selected
2. Click "ФебЮЭавШ CSV"
3. **Expected:** CSV file downloads
4. Open file
5. **Expected:** Contains all projects currently visible (respects filters)

### Test 7.2: Export Selected
1. Select 5 projects using checkboxes
2. Click "ФебЮЭавШ CSV"
3. **Expected:** CSV contains only 5 selected projects

### Test 7.3: CSV Content Verification
Expected columns:
```
ЮаЭФевШ,ЩЪШФЬвШ,бвРУШР,ТРЬРоЪФСР,УжФФСШ бвРУШРиШ
Website Redesign - Tech Solutions,Tech Solutions Ltd,УРХШмзФЧ УФХФЪЭЮФЫЬвШ,2024-01-15,5
...
```

---

## Test 8: Activity Feed

**Goal:** Verify recent activity shows correctly on dashboard.

### Steps:
1. Go to `/dashboard`
2. Scroll to "гРоЪФбШ РевШХЭСФСШ" section

### Expected Results:
-  Shows last 10 stage changes
-  Each activity shows:
  - Project name
  - From stage ’ To stage (with arrow)
  - Time ago in Georgian
-  Most recent at top
-  If no activity: "пФа Ра РаШб РевШХЭСФСШ"

### Manual Test:
1. Update a project stage in Supabase
2. Refresh dashboard
3. **Expected:** New activity appears at top

---

## Test 9: Row Click Navigation

**Goal:** Clicking a table row should navigate to project details.

### Steps:
1. Go to `/dashboard/projects`
2. Click anywhere on a project row (except checkbox)
3. **Expected:** Browser navigates to `/dashboard/projects/[id]`
4. **Note:** This page may not exist yet (404 is expected)
5. Go back to projects list
6. Click the checkbox column
7. **Expected:** Checkbox toggles, but no navigation occurs

---

## Test 10: Responsive Design

**Goal:** Verify UI works on different screen sizes.

### Desktop (1920x1080):
-  Pipeline shows 6 columns
-  All table columns visible
-  Filters side by side

### Tablet (768px):
-  Pipeline shows 2-3 columns
-  Table scrolls horizontally if needed
-  Filters may wrap

### Mobile (375px):
-  Pipeline shows 1 column
-  Table scrollable
-  Filters stack vertically

---

## Test 11: Loading States

**Goal:** Verify proper loading indicators.

### How to Test:
1. Throttle network in DevTools (Slow 3G)
2. Navigate to `/dashboard/projects`
3. **Expected:** Spinner shows while loading
4. **Expected:** Skeleton or loading state visible
5. Refresh page
6. **Expected:** Brief loading state before data appears

---

## Test 12: Performance

**Goal:** Ensure application performs well with data.

### Metrics to Check:
1. **Initial Load:** < 2 seconds for dashboard
2. **Filter Response:** Instant (client-side)
3. **Sort Response:** < 200ms
4. **Real-time Update:** < 1 second delay
5. **Pagination:** Instant page changes

### Check in DevTools:
- Network tab: No unnecessary requests
- Performance tab: No memory leaks
- Console: No errors or warnings

---

## Common Issues & Troubleshooting

### Issue: Pipeline shows 0 for all stages
**Solution:** Run `npm run seed` to populate test data

### Issue: Real-time updates not working
**Solution:**
1. Check Supabase Realtime is enabled
2. Verify RLS policies allow subscriptions
3. Check browser console for errors

### Issue: Filters not working
**Solution:**
1. Check that column IDs match in table definition
2. Verify filter function logic

### Issue: Pagination shows wrong count
**Solution:**
1. Clear filters and try again
2. Check that pageSize is set to 20
3. Verify data is loading correctly

---

## Success Criteria

All tests pass when:
-  Pipeline counts match database
-  All 4 statistics are accurate
-  Search filters projects correctly
-  Stage filter works alone and with search
-  Sorting works on all columns
-  Real-time updates appear < 1 second
-  Pagination shows 20 items per page
-  Can navigate all pages
-  CSV export includes correct data
-  Activity feed shows recent changes
-  Row clicks navigate (even if 404)
-  No console errors
-  Responsive on all screen sizes

---

## Next Steps After Testing

If all tests pass:
1.  Mark features as production-ready
2. Consider adding:
   - Project details page
   - Edit project functionality
   - Archive feature implementation
   - Date range filter
   - Advanced search
   - Bulk edit operations

If tests fail:
1. Document the specific issue
2. Check browser console for errors
3. Verify database schema
4. Check Supabase RLS policies
5. Report issues with screenshots
