# Project Infinity - პროექტების მართვის სისტემა

Next.js 14 აპლიკაცია Supabase ინტეგრაციით პროექტების მართვის პლატფორმისთვის ქართული ინტერფეისით.

## მახასიათებლები

- **18-ეტაპიანი პროექტის ტრეკინგი** ქართულ ენაზე
- **4 ფაზიანი სისტემა** ფერ-კოდირებით:
  - გაყიდვები (ეტაპები 1-5) - ლურჯი
  - დეველოპმენტი (ეტაპები 6-11) - იისფერი
  - გადახდა (ეტაპები 12-17) - ნარინჯისფერი
  - დასრულება (ეტაპი 18) - მწვანე
- **Supabase Authentication** email/password-ით
- **Row Level Security** დაცვისთვის
- **Responsive Layout** sidebar და header-ით
- **TypeScript** სრული type safety-სთვის
- **Shadcn/ui** კომპონენტების ბიბლიოთეკა

## პროექტის ეტაპები

1. დასაწყები
2. მოხდა პირველი კავშირი
3. ჩავნიშნეთ შეხვედრა
4. შევხვდით და ველოდებით ინფორმაციას
5. მივიღეთ ინფორმაცია
6. დავიწყეთ დეველოპემნტი
7. დავიწყეთ ტესტირება
8. გადავაგზავნეთ კლიენტთან
9. ველოდებით კლიენტისგან უკუკავშირს
10. დავიწყეთ კლიენტის ჩასწორებებზე მუშაობა
11. გავუგზავნეთ კლიენტს საბოლოო ვერსია
12. ველოდებით კლიენტის დასტურს
13. კლიენტმა დაგვიდასტურა
14. კლიენტს გავუგზავნეთ პროექტის გადახდის დეტალები
15. კლიენტისგან ველოდებით ჩარიცხვას
16. კლიენტმა ჩარიცხა
17. ვამატებთ პორტფოლიო პროექტებში
18. პროექტი დასრულებულია

## მონაცემთა ბაზის სქემა

### Tables

- **users** - მომხმარებლის პროფილები (auth.users-ის გაფართოება)
- **clients** - კლიენტების ინფორმაცია
- **projects** - პროექტები სრული ეტაპების ტრეკინგით
- **stage_history** - ეტაპების ცვლილებების ისტორია

## დაყენება

### 1. Dependencies დაინსტალირება

```bash
npm install
```

### 2. Supabase კონფიგურაცია

1. შექმენით Supabase პროექტი [supabase.com](https://supabase.com)
2. დააკოპირეთ `.env.example` `.env.local`-ად
3. დაამატეთ თქვენი Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. მონაცემთა ბაზის მიგრაცია

გაუშვით SQL მიგრაციები Supabase SQL Editor-ში შემდეგი თანმიმდევრობით:

1. `supabase/migrations/20240101000000_initial_schema.sql` - ქმნის tables და triggers
2. `supabase/migrations/20240101000001_rls_policies.sql` - აყენებს RLS policies

### 4. დეველოპმენტ სერვერის გაშვება

```bash
npm run dev
```

აპლიკაცია გაიხსნება [http://localhost:3000](http://localhost:3000)

## პროექტის სტრუქტურა

```
project-infinity/
├── src/
│   ├── app/
│   │   ├── dashboard/       # Dashboard page
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page (redirects)
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── dashboard-layout.tsx
│   │   └── ui/            # Shadcn/ui components
│   ├── lib/
│   │   ├── supabase/      # Supabase clients
│   │   │   ├── client.ts  # Browser client
│   │   │   ├── server.ts  # Server client
│   │   │   └── middleware.ts
│   │   ├── stages.ts      # Stage configuration
│   │   └── utils.ts       # Utility functions
│   ├── types/
│   │   └── database.types.ts  # Database TypeScript types
│   └── middleware.ts      # Auth middleware
├── supabase/
│   └── migrations/        # Database migrations
├── .env.local            # Environment variables
└── package.json
```

## ტექნოლოგიები

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Re-usable components
- **Radix UI** - Headless UI components
- **Lucide React** - Icons

## Authentication

ავტორიზაცია მოწყობილია Supabase Auth-ით:

- Email/Password რეგისტრაცია და შესვლა
- Automatic user profile creation
- Session management via middleware
- Protected routes via server-side checks

## Row Level Security (RLS)

RLS policies უზრუნველყოფს:

- მომხმარებლებს შეუძლიათ ნახონ და დაარედაქტირონ საკუთარი პროფილი
- მომხმარებლებს შეუძლიათ ნახონ ყველა პროექტი და კლიენტი
- მომხმარებლებს შეუძლიათ დაარედაქტირონ პროექტები რომლებიც შექმნეს ან რომლებზეც დანიშნული არიან
- ადმინებს აქვთ სრული წვდომა ყველა ჩანაწერზე
- Stage history ავტომატურად იქმნება triggers-ით და არ რედაქტირდება manually

## შემდეგი ნაბიჯები

აპლიკაცია მზადაა გაფართოებისთვის:

1. დაამატეთ პროექტების CRUD ოპერაციები
2. დაამატეთ კლიენტების მართვა
3. დაამატეთ ანალიტიკის გვერდი stage statistics-ით
4. დაამატეთ file uploads პროექტებისთვის
5. დაამატეთ notifications stage changes-ზე
6. დაამატეთ team collaboration features
7. დაამატეთ filtering და search functionality

## License

MIT
