# Storage — Posts bucket setup

## Novi bucket za slike postova

1. Supabase → Storage → New bucket
2. Naziv: `posts`
3. Public: ✅ DA

## Policies za posts bucket

```sql
-- Upload: samo ulogovani korisnici
CREATE POLICY "Korisnici uploadaju postove"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND
  auth.uid() IS NOT NULL
);

-- Čitanje: svi mogu vidjeti
CREATE POLICY "Postovi su javni"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Brisanje: samo vlasnik
CREATE POLICY "Vlasnik briše vlastite postove"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Dodati liked_by_me u feed view

Ažuriraj `feed_posts` view u SQL Editoru da podržava liked_by_me:

```sql
DROP VIEW IF EXISTS feed_posts;

CREATE VIEW feed_posts AS
SELECT
  p.*,
  d.name        AS dog_name,
  d.breed       AS dog_breed,
  d.avatar_url  AS dog_avatar,
  pr.username   AS owner_username,
  COUNT(DISTINCT pl.id)  AS likes_count,
  COUNT(DISTINCT pc.id)  AS comments_count
FROM posts p
JOIN dogs     d  ON p.dog_id    = d.id
JOIN profiles pr ON p.owner_id  = pr.id
LEFT JOIN post_likes    pl ON p.id = pl.post_id
LEFT JOIN post_comments pc ON p.id = pc.post_id
GROUP BY p.id, d.name, d.breed, d.avatar_url, pr.username
ORDER BY p.created_at DESC;
```

## Gotovo!
Feed je spreman. Svaki post koji se uploaduje
odmah se pojavljuje u feedu svih korisnika.
