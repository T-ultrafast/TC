-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LAWYERS TABLE
create table public.lawyers (
  id uuid references public.users(id) not null primary key,
  license_number text not null,
  bar_association text not null,
  specialties text[] not null, -- Array of specialties (e.g., "IP", "Contract", "Privacy")
  hourly_rate numeric(10, 2) not null,
  bio text,
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DOCUMENTS TABLE
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  title text not null,
  file_url text not null, -- Path in Storage Bucket
  file_type text not null, -- 'pdf', 'docx', 'txt', 'url'
  content_text text, -- Extracted text
  risk_score integer check (risk_score >= 0 and risk_score <= 100),
  summary text,
  status text default 'processing' check (status in ('processing', 'analyzed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLAUSES TABLE (Analysis Results)
create table public.clauses (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  clause_type text not null, -- 'indemnification', 'arbitration', etc.
  text_content text not null,
  risk_level text check (risk_level in ('low', 'medium', 'high', 'critical')),
  explanation text,
  page_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONSULTATIONS TABLE
create table public.consultations (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.users(id) not null,
  lawyer_id uuid references public.lawyers(id) not null,
  document_id uuid references public.documents(id),
  status text default 'requested' check (status in ('requested', 'accepted', 'declined', 'completed', 'cancelled')),
  scheduled_at timestamp with time zone,
  fee numeric(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES TABLE
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  consultation_id uuid references public.consultations(id) on delete cascade not null,
  sender_id uuid references public.users(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Security)
alter table public.users enable row level security;
alter table public.lawyers enable row level security;
alter table public.documents enable row level security;
alter table public.clauses enable row level security;
alter table public.consultations enable row level security;
alter table public.messages enable row level security;

-- Example Policy: Users can only see their own documents
create policy "Users can view own documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "Users can insert own documents" on public.documents
  for insert with check (auth.uid() = user_id);
