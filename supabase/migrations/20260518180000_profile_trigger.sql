begin;

-- Auto-create a profiles row when a user signs up via Supabase Auth.
-- The role defaults to 'client'; admins can update it via the dashboard.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

commit;
