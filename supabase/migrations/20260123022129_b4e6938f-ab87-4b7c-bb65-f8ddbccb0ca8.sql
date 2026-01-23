-- ================================================
-- SNAPLEADS - TABELAS LEADS E PAYOUTS
-- ================================================

-- 1. TABELA DE LEADS
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
  commission DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para leads
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at em leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. TABELA DE PAYOUTS
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  method TEXT NOT NULL DEFAULT 'pix' CHECK (method IN ('pix', 'bank_transfer', 'paypal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para payouts
CREATE INDEX idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payouts_created_at ON public.payouts(created_at DESC);

-- RLS para payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payouts"
  ON public.payouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request their own payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at em payouts
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts;