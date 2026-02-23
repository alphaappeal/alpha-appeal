-- Add INSERT policy for admins on alpha_partners
CREATE POLICY "Admins can insert alpha partners"
ON public.alpha_partners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also add DELETE policy for admins (likely needed too)
CREATE POLICY "Admins can delete alpha partners"
ON public.alpha_partners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
