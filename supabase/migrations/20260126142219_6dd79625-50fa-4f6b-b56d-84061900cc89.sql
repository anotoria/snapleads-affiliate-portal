-- Add DELETE policy for admins on commission_history table
CREATE POLICY "Admins can delete commissions"
ON public.commission_history
FOR DELETE
USING (is_admin(auth.uid()));