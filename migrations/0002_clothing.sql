create table if not exists shop_admins (
  user_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists clothing (
  id serial primary key,
  user_id text not null,
  title text not null,
  price_cents integer not null,
  image text not null,
  created_at timestamptz not null default now()
);

create index if not exists clothing_user_id_idx on clothing (user_id);
