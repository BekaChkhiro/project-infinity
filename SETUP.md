# Project Infinity - დაყენების ინსტრუქცია

ეს არის დეტალური სახელმძღვანელო Project Infinity-ს დასაყენებლად.

## წინაპირობები

დარწმუნდით, რომ თქვენ გაქვთ დაინსტალირებული:
- Node.js 18.x ან უფრო მაღალი
- npm ან yarn
- Supabase ანგარიში

## ნაბიჯ-ნაბიჯ დაყენება

### 1. პროექტის დაკლონება/გადმოწერა

თუ პროექტი უკვე არსებობს, დააკოპირეთ ფოლდერი ან გადმოწერეთ.

### 2. Dependencies-ის დაყენება

```bash
cd project-infinity
npm install
```

### 3. Supabase პროექტის შექმნა

1. გადადით [supabase.com](https://supabase.com)
2. შექმენით ახალი პროექტი
3. დაელოდეთ პროექტის სრულად გაშვებას (რამდენიმე წუთი)
4. გადადით Project Settings > API

### 4. Environment Variables-ის კონფიგურაცია

დააკოპირეთ `.env.example` ფაილი:

```bash
cp .env.example .env.local
```

შეავსეთ `.env.local` ფაილი თქვენი Supabase credentials-ით:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**სად ვიპოვო ეს მონაცემები?**
- Supabase Dashboard > Project Settings > API
- Project URL = `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. მონაცემთა ბაზის მიგრაციები

#### ნაბიჯი 1: ძირითადი სქემა

1. გადადით Supabase Dashboard
2. გადადით SQL Editor (მარცხენა მენიუში)
3. დააჭირეთ "+ New query"
4. დააკოპირეთ და ჩასვით `supabase/migrations/20240101000000_initial_schema.sql` ფაილის შიგთავსი
5. დააჭირეთ "Run" ღილაკს
6. დარწმუნდით რომ წარმატებით შესრულდა

#### ნაბიჯი 2: RLS Policies

1. SQL Editor-ში შექმენით ახალი query
2. დააკოპირეთ და ჩასვით `supabase/migrations/20240101000001_rls_policies.sql` ფაილის შიგთავსი
3. დააჭირეთ "Run"
4. დარწმუნდით რომ წარმატებით შესრულდა

#### ნაბიჯი 3: ვერიფიკაცია

გადადით Table Editor და დარწმუნდით, რომ შემდეგი ცხრილები შეიქმნა:
- users
- clients
- projects
- stage_history

### 6. პირველი მომხმარებლის შექმნა

#### ვარიანტი A: Supabase Dashboard-ით

1. გადადით Authentication > Users
2. დააჭირეთ "Add user" > "Create new user"
3. შეიყვანეთ email და password
4. დააჭირეთ "Create user"

#### ვარიანტი B: აპლიკაციის გამოყენებით

1. გაუშვით დეველოპმენტ სერვერი (ნახეთ ნაბიჯი 7)
2. გადადით signup გვერდზე
3. შეავსეთ რეგისტრაციის ფორმა

### 7. დეველოპმენტ სერვერის გაშვება

```bash
npm run dev
```

აპლიკაცია გაიხსნება: [http://localhost:3000](http://localhost:3000)

### 8. ადმინ როლის მინიჭება (ოფციონალური)

თუ გსურთ მომხმარებელს ადმინი როლი მიანიჭოთ:

1. გადადით Supabase Dashboard > Table Editor > users
2. იპოვეთ თქვენი მომხმარებელი
3. დააკლიკეთ edit
4. შეცვალეთ `role` ველი: `user` -> `admin`
5. შეინახეთ

## ვერიფიკაცია

დარწმუნდით რომ ყველაფერი მუშაობს:

1. გადადით [http://localhost:3000](http://localhost:3000)
2. თუ არ ხართ ავტორიზებული, გადამისამართდებით `/login`-ზე
3. შედით სისტემაში შექმნილი credentials-ით
4. უნდა გადამისამართდეთ dashboard-ზე
5. დარწმუნდით რომ sidebar და header სწორად ჩანს

## ხშირი პრობლემები

### "Invalid supabaseUrl" შეცდომა

**გადაწყვეტა**: დარწმუნდით რომ `.env.local` ფაილში `NEXT_PUBLIC_SUPABASE_URL` იწყება `https://`-ით

### "Invalid API key" შეცდომა

**გადაწყვეტა**: გადაამოწმეთ რომ დააკოპირეთ სწორი anon key (არა service_role key)

### SQL მიგრაციები არ მუშაობს

**გადაწყვეტა**:
1. დარწმუნდით რომ SQL-ში არ არის syntax შეცდომები
2. გაუშვით მიგრაციები თანმიმდევრობით (პირველი, მერე მეორე)
3. თუ უკვე გაგიშვიათ, წაშალეთ ცხრილები და თავიდან ცადეთ

### "User not found" შეცდომა dashboard-ზე

**გადაწყვეტა**: დარწმუნდით რომ trigger მუშაობს რომელიც ქმნის user profile-ს:
1. SQL Editor-ში გაუშვით:
```sql
SELECT * FROM auth.users;
SELECT * FROM public.users;
```
2. თუ public.users ცარიელია, manually შეიქმენით ჩანაწერი:
```sql
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

## შემდეგი ნაბიჯები

ახლა თქვენ გაქვთ მოქმედი პროექტის მართვის სისტემა! შემდეგი რაც შეგიძლიათ გააკეთოთ:

1. დაამატეთ პროექტების შექმნა/რედაქტირება/წაშლა
2. დაამატეთ კლიენტების მართვა
3. დაამატეთ სტატისტიკის გვერდი
4. კასტომიზაცია თქვენი საჭიროებისამებრ

## დახმარება

თუ პრობლემა გაქვთ:
1. გადაამოწმეთ Supabase logs: Dashboard > Logs
2. გადაამოწმეთ browser console-ი შეცდომებზე
3. გადაამოწმეთ terminal-ში Next.js logs
4. დარწმუნდით რომ ყველა migration გაშვებულია
