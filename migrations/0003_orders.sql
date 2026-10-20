create table if not exists shop_orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  street text not null,
  zip text not null,
  city text not null,
  country text not null,
  note text not null default '',
  lines text not null,
  goods integer not null,
  shipping integer not null,
  total integer not null
);
