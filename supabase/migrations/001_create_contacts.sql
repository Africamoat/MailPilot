create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  company text not null,
  country text not null,
  status text not null default 'not_contacted'
    check (status in ('not_contacted', 'contacted', 'follow_up', 'replied')),
  last_contacted_at timestamptz,
  has_replied boolean not null default false,
  follow_up_count integer not null default 0,
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Index for cron job queries
create index if not exists idx_contacts_followup
  on contacts (status, has_replied, next_follow_up_at)
  where status = 'contacted' and has_replied = false;

-- Index for filtering
create index if not exists idx_contacts_country on contacts (country);
create index if not exists idx_contacts_status on contacts (status);

-- Enable RLS (open for internal use)
alter table contacts enable row level security;

create policy "Allow all operations" on contacts
  for all using (true) with check (true);
