-- =====================================================
-- CORREÇÃO DE VULNERABILIDADES DE SEGURANÇA
-- =====================================================

-- 1. CRIAR TABELA DE AUDIT LOG PARA ACESSO A DADOS SENSÍVEIS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL,
    action TEXT NOT NULL,
    table_accessed TEXT NOT NULL,
    record_id UUID,
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    details JSONB
);

-- Habilitar RLS na tabela de audit
ALTER TABLE public.admin_data_access_log ENABLE ROW LEVEL SECURITY;

-- Apenas super_admins podem ver os logs de auditoria
CREATE POLICY "Super admins can view audit logs"
    ON public.admin_data_access_log FOR SELECT
    USING (is_super_admin(auth.uid()));

-- Admins podem inserir logs (registro automático via função)
CREATE POLICY "Admins can insert audit logs"
    ON public.admin_data_access_log FOR INSERT
    WITH CHECK (is_admin(auth.uid()) AND admin_user_id = auth.uid());

-- 2. CRIAR FUNÇÃO PARA REGISTRAR ACESSO A DADOS SENSÍVEIS
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_admin_data_access(
    _action TEXT,
    _table_accessed TEXT,
    _record_id UUID DEFAULT NULL,
    _details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Só registra se o usuário for admin
    IF is_admin(auth.uid()) THEN
        INSERT INTO public.admin_data_access_log 
            (admin_user_id, action, table_accessed, record_id, details)
        VALUES 
            (auth.uid(), _action, _table_accessed, _record_id, _details);
    END IF;
END;
$$;

-- 3. ATUALIZAR RLS PARA SUPPORT_TICKETS
-- =====================================================
-- Remover política existente que permite todos admins verem tudo
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;

-- Nova política: Usuários veem seus tickets, admins veem atribuídos/não atribuídos, super_admin vê tudo
CREATE POLICY "Users and assigned admins can view tickets"
    ON public.support_tickets FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Usuário pode ver seus próprios tickets
            user_id = auth.uid()
            -- Super admin pode ver tudo
            OR is_super_admin(auth.uid())
            -- Admin regular pode ver tickets atribuídos a ele ou não atribuídos
            OR (
                is_admin(auth.uid()) 
                AND (assigned_to = auth.uid() OR assigned_to IS NULL)
            )
        )
    );

-- 4. ATUALIZAR RLS PARA SUPPORT_MESSAGES
-- =====================================================
-- Remover política existente
DROP POLICY IF EXISTS "Users can view messages of their tickets" ON public.support_messages;

-- Nova política alinhada com tickets
CREATE POLICY "Users and assigned admins can view ticket messages"
    ON public.support_messages FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = support_messages.ticket_id
            AND (
                t.user_id = auth.uid()
                OR is_super_admin(auth.uid())
                OR (
                    is_admin(auth.uid()) 
                    AND (t.assigned_to = auth.uid() OR t.assigned_to IS NULL)
                )
            )
        )
    );

-- Atualizar política de INSERT para support_messages para manter consistência
DROP POLICY IF EXISTS "Users can add messages to their tickets" ON public.support_messages;

CREATE POLICY "Users and assigned admins can add messages"
    ON public.support_messages FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = support_messages.ticket_id
            AND (
                t.user_id = auth.uid()
                OR is_super_admin(auth.uid())
                OR (
                    is_admin(auth.uid()) 
                    AND (t.assigned_to = auth.uid() OR t.assigned_to IS NULL)
                )
            )
        )
    );