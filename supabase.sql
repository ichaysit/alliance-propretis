-- Alliance Properties — à exécuter dans Supabase > SQL Editor
create table if not exists public.listings(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('vente','location')),
  kind text, city text, address text,
  price numeric, rooms numeric, bedrooms int, area int, floor text,
  description text,
  photos jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.listings enable row level security;
drop policy if exists "public read published" on public.listings;
create policy "public read published" on public.listings for select to anon using (published = true);
drop policy if exists "staff full access" on public.listings;
create policy "staff full access" on public.listings for all to authenticated using (true) with check (true);

insert into storage.buckets(id,name,public) values ('photos','photos',true) on conflict do nothing;
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id='photos');
drop policy if exists "photos staff insert" on storage.objects;
create policy "photos staff insert" on storage.objects for insert to authenticated with check (bucket_id='photos');
drop policy if exists "photos staff delete" on storage.objects;
create policy "photos staff delete" on storage.objects for delete to authenticated using (bucket_id='photos');

-- Les biens de départ
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Cottage moderne avec piscine – Quartier 2005','vente','Maison','Ra''anana','Quartier 2005, près de la rue Ahuza',8390000,null,5,255,null,'Une opportunité rare dans le quartier le plus recherché de Ra''anana ! Ce magnifique cottage familial allie modernité, élégance et confort. Idéalement situé à deux pas de la rue Ahuza, il offre un cadre de vie paisible, verdoyant et intime, parfait pour une famille souhaitant s''installer au cœur de la ville tout en profitant de la tranquillité d''un quartier résidentiel.

Points forts :
• Surface habitable : 255 m² – Terrain : 300 m²
• 5 chambres sur 3 niveaux, 3 salles de bain
• Suite parentale avec salle de bain indépendante et dressing
• Grand salon lumineux ouvert sur la terrasse, le jardin et la piscine
• Cuisine moderne entièrement équipée
• Piscine privée et jardin arboré
• Climatisation centralisée salon/cuisine + clims individuelles dans chaque chambre
• Parking privé

Emplacement : quartier 2005, proche rue Ahuza, écoles, commerces et parcs.','[]'::jsonb,true,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Appartement 4,5 pièces – Centre-ville de Jérusalem, Nahlaot','vente','Appartement','Jérusalem','Centre-ville, quartier Nahlaot',5800000,4.5,3,null,null,'Superbe appartement en plein centre de Jérusalem, dans un immeuble récent. Emplacement exceptionnel, à seulement 5 minutes à pied du marché Mahane Yehuda et à proximité immédiate du tramway.

L''appartement se compose d''un spacieux salon avec accès à un balcon offrant une vue dégagée sur la Knesset, d''une suite parentale avec salle de bain privative, de deux chambres à coucher (dont une avec mamad), ainsi que d''une demi-chambre idéale pour un bureau ou une chambre d''appoint. Une salle de bain complète ce bien. Entièrement climatisé.

L''immeuble offre des prestations de qualité, incluant une salle de sport et plusieurs ascenseurs, dont des ascenseurs de chabbat. Une place de parking est également incluse.

Un bien rare, alliant confort moderne, emplacement stratégique et qualité de vie au cœur de la capitale.','[]'::jsonb,true,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Appartement – Centre-ville de Ra''anana','vente','Appartement','Ra''anana','Centre-ville',3500000,null,null,null,null,'Appartement à vendre en centre-ville de Ra''anana. Contactez-nous pour recevoir la description complète et organiser une visite.','[]'::jsonb,false,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Appartement 4,5 pièces rénové – Rue Bar Ilan','vente','Appartement','Ra''anana','Rue Bar Ilan, centre-ville',2790000,4.5,3,110,null,'Appartement idéal en centre-ville de Ra''anana, 110 m², 4,5 pièces, refait entièrement à neuf.

• Salon, salle à manger, cuisine
• 3 chambres spacieuses dont 1 mamad
• Terrasse
• Parking et cave
• Au calme dans la rue Bar Ilan','[]'::jsonb,false,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Studio à louer – Centre-ville de Netanya','location','Studio','Netanya','Centre-ville, près de la rue Herzl',2400,1,null,12,null,'Studio de 12 m², idéalement situé en plein centre-ville de Netanya, dans un emplacement recherché et pratique. Ce bien ne fait pas partie d''un appartement divisé, ce qui lui assure une totale indépendance.

Parfait pour un soldat, un étudiant ou un jeune couple, il comprend une salle de bain avec douche, une cuisine, ainsi qu''un climatiseur. Une partie du jardin peut également être utilisée.

Emplacement idéal, à deux pas de la rue Herzl, des commerces et de la plage.','[]'::jsonb,false,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Penthouse 6 pièces – Rue Henkin, centre-ville','vente','Penthouse','Ra''anana','Rue Henkin, centre-ville',5700000,6,null,160,'5','Nouveau, en exclusivité sur le marché : appartement de 6 pièces, penthouse au 5ème étage en plein centre-ville, rue Henkin. 160 m² habitables et très grande terrasse.

Avec programme de Pinouï Binouï prévu par le promoteur Kedar. Plus d''informations sur le programme sur demande.','[]'::jsonb,true,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('Magnifique 4,5 pièces neuf – Rue silencieuse','vente','Appartement',null,null,3190000,4.5,3,120,null,'Appartement neuf jamais habité, 120 m², composé d''un grand salon, salle à manger et cuisine, de 3 chambres à coucher spacieuses et d''un très grand dressing. Dans une rue silencieuse, sans vis-à-vis.','[]'::jsonb,false,true);
insert into public.listings(title,type,kind,city,address,price,rooms,bedrooms,area,floor,description,photos,featured,published) values ('3 pièces à louer – Da Vinci Tower Ouest, Tel Aviv','location','Appartement','Tel Aviv','Da Vinci Tower Ouest, près de Sarona',10000,3,1,null,null,'Appartement 3 pièces à louer en plein centre de Tel Aviv, dans la Da Vinci Tower : immeuble luxueux de 42 étages à côté de Sarona, station de train à proximité et accès à l''autoroute.

L''appartement dispose d''un séjour, d''une chambre à coucher et d''une chambre mamad, d''une cuisine, d''une salle de bains, d''un balcon et d''une place de parking dans l''immeuble.

Installations dans le complexe : piscine suspendue, concierge, salle de sport, spa, commerces.','[]'::jsonb,true,true);
