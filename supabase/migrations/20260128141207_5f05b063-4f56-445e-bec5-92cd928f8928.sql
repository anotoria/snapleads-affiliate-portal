-- =====================================================
-- FIX: Customer Contact Information Security
-- =====================================================

-- Adicionar política RESTRICTIVE para bloquear acesso anônimo
-- Esta política combina com AND com as outras, garantindo que
-- auth.uid() deve ser NOT NULL para qualquer operação

CREATE POLICY "Deny anonymous access to leads"
ON public.leads
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);