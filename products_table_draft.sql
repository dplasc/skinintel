create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category text not null,
  ingredients jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  skin_use_case text[] not null default '{}',
  why_relevant text not null default '',
  inci_available boolean not null default false,
  inci_source_url text,
  product_source_url text,
  source_type text not null default 'unknown',
  created_at timestamptz not null default now()
);
