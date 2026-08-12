create table health_entries (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    category varchar(16) not null check (category in ('BATH', 'DEWORM', 'CYCLE')),
    date date not null,
    note varchar(1000),
    created_at timestamptz not null default now()
);

create index health_entries_owner_date_idx on health_entries (owner_id, date desc, created_at desc);
