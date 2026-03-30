# DOGRAM — React Setup (Korak po korak)

## 1. Kreiraj projekt

```bash
npm create vite@latest dogram -- --template react
cd dogram
npm install
```

## 2. Instaliraj sve što trebaš

```bash
npm install @supabase/supabase-js
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Tailwind konfiguracija

U `tailwind.config.js` zamijeni sadržaj sa:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#e8a230",
        dark: "#0f0e0c",
        card: "#1a1916",
      }
    },
  },
  plugins: [],
}
```

U `src/index.css` zamijeni sve sa:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 4. Supabase environment varijable

Napravi fajl `.env` u root folderu:

```
VITE_SUPABASE_URL=https://TVOJ_PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=TVOJ_ANON_KEY
```

> Ove vrijednosti nađeš u Supabase → Settings → API

## 5. Struktura foldera

```
src/
├── components/
│   ├── Layout.jsx
│   ├── BottomNav.jsx
│   └── DogCard.jsx
├── pages/
│   ├── Feed.jsx
│   ├── Profile.jsx
│   ├── Map.jsx
│   ├── Shelter.jsx
│   ├── Reminders.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── lib/
│   └── supabase.js       ← konekcija sa bazom
├── hooks/
│   └── useAuth.js        ← auth hook
├── App.jsx
└── main.jsx
```

## 6. Supabase klijent (src/lib/supabase.js)

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 7. Pokreni

```bash
npm run dev
```

App radi na: http://localhost:5173
