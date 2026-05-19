-- Drop the existing loose update/delete/select policies for the products bucket
drop policy if exists "Allow authenticated updates to products" on storage.objects;
drop policy if exists "Allow authenticated deletes from products" on storage.objects;
drop policy if exists "Allow public access to product images" on storage.objects;
drop policy if exists "Allow authenticated select to products" on storage.objects;

-- Create hardened update policy: only the uploader (owner) or an administrator can update the object
create policy "Allow authenticated updates to products"
on storage.objects for update
to authenticated
using (
  bucket_id = 'products' 
  and (
    auth.uid() = owner 
    or public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Create hardened delete policy: only the uploader (owner) or an administrator can delete the object
create policy "Allow authenticated deletes from products"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'products' 
  and (
    auth.uid() = owner 
    or public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Create hardened select policy: only authenticated users can select/list files in the bucket.
-- Note: Since the bucket is public (public = true), public URL downloads will still work directly
-- without requiring a public SELECT policy, but anonymous clients won't be able to list the files.
create policy "Allow authenticated select to products"
on storage.objects for select
to authenticated
using (bucket_id = 'products');
