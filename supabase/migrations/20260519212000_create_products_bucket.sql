-- Create 'products' storage bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Drop policies if they exist first to make the migration idempotent
drop policy if exists "Allow public access to product images" on storage.objects;
drop policy if exists "Allow authenticated uploads to products" on storage.objects;
drop policy if exists "Allow authenticated updates to products" on storage.objects;
drop policy if exists "Allow authenticated deletes from products" on storage.objects;

-- Enable public select access to the products bucket
create policy "Allow public access to product images"
on storage.objects for select
to public
using (bucket_id = 'products');

-- Enable authenticated users (admins/vendors) to insert/upload images
create policy "Allow authenticated uploads to products"
on storage.objects for insert
to authenticated
with check (bucket_id = 'products');

-- Enable authenticated users to update images
create policy "Allow authenticated updates to products"
on storage.objects for update
to authenticated
using (bucket_id = 'products');

-- Enable authenticated users to delete images
create policy "Allow authenticated deletes from products"
on storage.objects for delete
to authenticated
using (bucket_id = 'products');
