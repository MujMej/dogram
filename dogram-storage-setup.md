# Supabase Storage — Setup za slike

## Korak 1: Napravi bucket

1. Idi u Supabase → Storage → New bucket
2. Naziv: `avatars`
3. Public: ✅ DA (jer slike trebaju biti javno dostupne)

## Korak 2: Storage Policy (dozvole)

U Supabase → Storage → Policies → avatars bucket:

### Dozvoli upload (INSERT):
```sql
CREATE POLICY "Korisnici mogu uploadati slike"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);
```

### Dozvoli čitanje (SELECT):
```sql
CREATE POLICY "Slike su javne"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### Dozvoli brisanje (DELETE):
```sql
CREATE POLICY "Korisnik briše vlastite slike"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Korak 3: Folder struktura

Slike se čuvaju ovako:
```
avatars/
├── dogs/
│   └── {dog_id}/
│       └── avatar.jpg
└── profiles/
    └── {user_id}/
        └── avatar.jpg
```

## Gotovo!

Upload iz React-a radi automatski kroz `uploadDogAvatar()` funkciju u `useDog.js`.
