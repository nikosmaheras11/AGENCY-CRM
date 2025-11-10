-- Create requests table
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  project_type text not null check (project_type in ('creative', 'performance', 'design', 'ugc')),
  status text not null check (status in ('new-request', 'in-progress', 'needs-review', 'needs-edit', 'done')),
  title text not null,
  format text,
  size text,
  dimensions text,
  duration text,
  
  -- Asset URLs from Supabase Storage
  video_url text,
  thumbnail_url text,
  figma_url text,
  
  -- Metadata
  assignee text,
  due_date date,
  tags text[],
  priority text check (priority in ('Low', 'Medium', 'High', 'Critical')),
  client text,
  campaign text,
  category text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author text not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.requests enable row level security;
alter table public.comments enable row level security;

-- Create policies (allow all for now - adjust based on your auth needs)
create policy "Enable read access for all users" on public.requests
  for select using (true);

create policy "Enable insert for all users" on public.requests
  for insert with check (true);

create policy "Enable update for all users" on public.requests
  for update using (true);

create policy "Enable read access for all users" on public.comments
  for select using (true);

create policy "Enable insert for all users" on public.comments
  for insert with check (true);

-- Create indexes for better performance
create index if not exists requests_project_type_idx on public.requests(project_type);
create index if not exists requests_status_idx on public.requests(status);
create index if not exists requests_created_at_idx on public.requests(created_at desc);
create index if not exists comments_request_id_idx on public.comments(request_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.requests
  for each row
  execute function public.handle_updated_at();

-- Create storage bucket for creative assets (if not exists)
insert into storage.buckets (id, name, public)
values ('creative-assets', 'creative-assets', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Give users access to creative assets"
on storage.objects for select
using ( bucket_id = 'creative-assets' );

create policy "Allow authenticated uploads"
on storage.objects for insert
with check ( bucket_id = 'creative-assets' );
