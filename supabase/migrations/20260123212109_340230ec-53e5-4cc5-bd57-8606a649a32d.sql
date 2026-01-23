
-- =============================================
-- FASE 1: Sistema de Roles e Segurança
-- =============================================

-- 1.1 Criar Enum de Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin', 'user');

-- 1.2 Criar Tabela user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 1.3 Funções Security Definer para verificação de roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin', 'super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = 'super_admin'
  )
$$;

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- =============================================
-- FASE 2: Modificar tabelas existentes
-- =============================================

-- 2.1 Modificar profiles
ALTER TABLE public.profiles
ADD COLUMN company_name text,
ADD COLUMN cnpj text,
ADD COLUMN phone text,
ADD COLUMN tier_level text NOT NULL DEFAULT 'silver',
ADD COLUMN is_active boolean NOT NULL DEFAULT true,
ADD COLUMN deactivated_at timestamp with time zone,
ADD COLUMN deactivated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2.2 Modificar leads
ALTER TABLE public.leads
ADD COLUMN access_count integer NOT NULL DEFAULT 0,
ADD COLUMN monthly_value numeric NOT NULL DEFAULT 0;

-- =============================================
-- FASE 3: Tabelas de Configuração
-- =============================================

-- 3.1 Criar tabela tiers
CREATE TABLE public.tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    display_name text NOT NULL,
    min_revenue numeric NOT NULL DEFAULT 0,
    max_revenue numeric,
    commission_percentage numeric NOT NULL,
    bonus_amount numeric NOT NULL DEFAULT 0,
    color text NOT NULL,
    icon text,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;

-- RLS para tiers (leitura pública, escrita admin)
CREATE POLICY "Anyone can view active tiers"
ON public.tiers
FOR SELECT
USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert tiers"
ON public.tiers
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tiers"
ON public.tiers
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete tiers"
ON public.tiers
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_tiers_updated_at
BEFORE UPDATE ON public.tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3.2 Criar tabela pricing_tiers
CREATE TABLE public.pricing_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    min_access integer NOT NULL DEFAULT 0,
    max_access integer,
    monthly_price numeric NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS para pricing_tiers
CREATE POLICY "Anyone can view active pricing tiers"
ON public.pricing_tiers
FOR SELECT
USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert pricing tiers"
ON public.pricing_tiers
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update pricing tiers"
ON public.pricing_tiers
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete pricing tiers"
ON public.pricing_tiers
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_pricing_tiers_updated_at
BEFORE UPDATE ON public.pricing_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FASE 4: Tabelas Operacionais
-- =============================================

-- 4.1 Criar tabela commission_history
CREATE TABLE public.commission_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    reference_month text NOT NULL,
    client_count integer NOT NULL DEFAULT 0,
    base_revenue numeric NOT NULL DEFAULT 0,
    tier_name text NOT NULL,
    commission_rate numeric NOT NULL,
    commission_value numeric NOT NULL DEFAULT 0,
    bonus_value numeric NOT NULL DEFAULT 0,
    total_value numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending',
    calculated_at timestamp with time zone NOT NULL DEFAULT now(),
    paid_at timestamp with time zone,
    notes text,
    calculated_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT valid_commission_status CHECK (status IN ('pending', 'processing', 'completed', 'rejected'))
);

ALTER TABLE public.commission_history ENABLE ROW LEVEL SECURITY;

-- RLS para commission_history
CREATE POLICY "Users can view their own commissions"
ON public.commission_history
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert commissions"
ON public.commission_history
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update commissions"
ON public.commission_history
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_commission_history_updated_at
BEFORE UPDATE ON public.commission_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index para consultas por user_id e mês
CREATE INDEX idx_commission_history_user_month ON public.commission_history(user_id, reference_month);

-- 4.2 Criar tabela documents
CREATE TABLE public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    category text NOT NULL DEFAULT 'other',
    uploaded_by uuid NOT NULL,
    is_public boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT valid_document_category CHECK (category IN ('contract', 'report', 'invoice', 'other'))
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS para documents
CREATE POLICY "Users can view their public documents"
ON public.documents
FOR SELECT
USING (
    (auth.uid() = user_id AND is_public = true) 
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Admins can insert documents"
ON public.documents
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update documents"
ON public.documents
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Index para consultas por user_id
CREATE INDEX idx_documents_user ON public.documents(user_id);

-- 4.3 Criar tabela support_tickets
CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    priority text NOT NULL DEFAULT 'medium',
    status text NOT NULL DEFAULT 'open',
    category text NOT NULL DEFAULT 'general',
    assigned_to uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    resolved_at timestamp with time zone,
    resolution_notes text,
    CONSTRAINT valid_ticket_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT valid_ticket_status CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
    CONSTRAINT valid_ticket_category CHECK (category IN ('billing', 'technical', 'general', 'other'))
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS para support_tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own open tickets"
ON public.support_tickets
FOR UPDATE
USING (
    (auth.uid() = user_id AND status IN ('open', 'waiting_user'))
    OR public.is_admin(auth.uid())
);

-- Trigger para updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index para consultas
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);

-- 4.4 Criar tabela support_messages
CREATE TABLE public.support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    is_admin_reply boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS para support_messages
CREATE POLICY "Users can view messages of their tickets"
ON public.support_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets t 
        WHERE t.id = ticket_id 
        AND (t.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
);

CREATE POLICY "Users can add messages to their tickets"
ON public.support_messages
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.support_tickets t 
        WHERE t.id = ticket_id 
        AND (t.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
);

-- Index para consultas
CREATE INDEX idx_support_messages_ticket ON public.support_messages(ticket_id);

-- =============================================
-- FASE 5: Dados Iniciais
-- =============================================

-- 5.1 Inserir Tiers
INSERT INTO public.tiers (name, display_name, min_revenue, max_revenue, commission_percentage, bonus_amount, color, icon, sort_order) VALUES
('silver', 'Silver', 0, 36000, 8, 0, '#C0C0C0', 'award', 1),
('gold', 'Gold', 36000.01, 108000, 10, 5000, '#FFD700', 'trophy', 2),
('platinum', 'Platinum', 108000.01, 252000, 12, 10000, '#E5E4E2', 'gem', 3),
('diamond', 'Diamond', 252000.01, 540000, 14, 20000, '#B9F2FF', 'diamond', 4),
('titanium', 'Titanium', 540000.01, 900000, 16, 30000, '#878681', 'shield', 5),
('audaks', 'Audaks', 900000.01, NULL, 18, 50000, '#8B5CF6', 'crown', 6);

-- 5.2 Inserir Pricing Tiers
INSERT INTO public.pricing_tiers (min_access, max_access, monthly_price, description, sort_order) VALUES
(0, 10, 249, '0-10 acessos', 1),
(11, 30, 449, '11-30 acessos', 2),
(31, 50, 549, '31-50 acessos', 3),
(51, 100, 649, '51-100 acessos', 4),
(101, 200, 849, '101-200 acessos', 5),
(201, 500, 1049, '201-500 acessos', 6),
(501, NULL, 1249, '500+ acessos', 7);

-- =============================================
-- FASE 6: Storage Bucket para Documentos
-- =============================================

-- Criar bucket para documentos (privado)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies para documents bucket
CREATE POLICY "Admins can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Users can view their documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'documents' 
    AND (
        public.is_admin(auth.uid())
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

-- =============================================
-- FASE 7: Função para calcular monthly_value
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_monthly_value(access_count integer)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT monthly_price 
  FROM public.pricing_tiers 
  WHERE is_active = true
    AND access_count >= min_access
    AND (max_access IS NULL OR access_count <= max_access)
  ORDER BY sort_order
  LIMIT 1
$$;

-- Trigger para auto-calcular monthly_value quando access_count mudar
CREATE OR REPLACE FUNCTION public.update_lead_monthly_value()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.monthly_value := COALESCE(public.calculate_monthly_value(NEW.access_count), 0);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_lead_monthly_value
BEFORE INSERT OR UPDATE OF access_count ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_lead_monthly_value();

-- =============================================
-- FASE 8: Habilitar Realtime nas novas tabelas
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
