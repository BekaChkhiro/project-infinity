# Quick Testing Guide

## Before Testing - Setup Test Data

### 1. Add Service Role Key
```bash
# Edit .env.local and replace the service role key:
# Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Replace "your_service_role_key_here" with actual key from Supabase
```

### 2. Run Seed Script
```bash
npm run seed
```

Expected output:
```
Clearing existing test data...
✓ Cleared existing data

🌱 Starting seed process...

Using user ID: xxx-xxx-xxx

Creating test clients...
✓ Created 8 clients

Creating test projects across all stages...
✓ Created 40-50 projects

📊 Projects per stage:
  Stage 1: 3 projects - დასაწყები
  Stage 2: 2 projects - მოხდა პირველი კავშირი
  ...
  Stage 18: 4 projects - პროექტი დასრულებულია

✅ Seed completed successfully!
```

---

## Quick Tests (5 minutes)

### ✅ Test 1: Pipeline Counts (30 seconds)
1. Open http://localhost:3000/dashboard
2. Scroll to "პროექტების სტადიები"
3. **Check:** All 18 cards show numbers > 0
4. **Check:** Colors are correct (Gray→Blue→Green→Yellow→Orange→Purple)

### ✅ Test 2: Filters Work (1 minute)
1. Go to http://localhost:3000/dashboard/projects
2. **Search Test:**
   - Type "Tech" in search box
   - Should filter projects instantly
3. **Stage Filter Test:**
   - Select any stage from dropdown
   - Only that stage's projects shown
4. **Combined:**
   - Keep search + select stage
   - Should show intersection of both filters

### ✅ Test 3: Real-time Updates (2 minutes)
1. Open http://localhost:3000/dashboard/projects in **Chrome**
2. Open Supabase Table Editor in **another tab**
3. In Supabase: Edit any project's title to "REAL-TIME TEST"
4. **Check:** Chrome tab updates automatically (no refresh needed)
5. In Supabase: Change project's stage
6. **Check:** Stage badge updates automatically

### ✅ Test 4: Pagination (1 minute)
1. On projects page, scroll to bottom
2. Should show: "გვერდი 1 / 2" (or similar)
3. Click next arrow →
4. **Check:** Shows next page of projects
5. **Check:** Page number updates

### ✅ Test 5: Export CSV (30 seconds)
1. Click "ექსპორტი CSV" button
2. **Check:** File downloads
3. Open CSV file
4. **Check:** Contains project data

---

## Full Test Checklist

For comprehensive testing, see: [TESTING.md](./TESTING.md)

---

## Troubleshooting

### No projects showing
- Run: `npm run seed`
- Check: You're logged in
- Check: Supabase RLS policies allow reading

### Real-time not working
- Check: Supabase Realtime is enabled
- Check: No console errors (F12)
- Refresh page and try again

### Pipeline shows all zeros
- Run seed script again
- Check database has projects: Supabase → Table Editor → projects

### Filters not working
- Check console for errors (F12)
- Try clearing all filters
- Refresh page

---

## Success ✓

All features work if:
- ✅ Pipeline cards show correct counts
- ✅ Search filters projects
- ✅ Stage filter works
- ✅ Real-time updates appear within 1 second
- ✅ Pagination shows multiple pages
- ✅ CSV exports successfully
- ✅ No console errors
