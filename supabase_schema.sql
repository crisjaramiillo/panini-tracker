-- Ejecuta esto UNA VEZ en el SQL Editor de tu proyecto Supabase

create table if not exists albums (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  name       text not null default 'Mi Álbum',
  created_at timestamptz default now()
);

create table if not exists stickers (
  id         uuid primary key default gen_random_uuid(),
  album_id   uuid references albums(id) on delete cascade,
  sticker_id text not null,
  state      int  not null default 0,
  unique(album_id, sticker_id)
);

-- Sin RLS (autenticación por email directo, sin Supabase Auth)
alter table albums   disable row level security;
alter table stickers disable row level security;

-- Índices para velocidad
create index if not exists idx_albums_user   on albums(user_id);
create index if not exists idx_stickers_album on stickers(album_id);
