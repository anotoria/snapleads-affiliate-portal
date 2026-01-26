-- Create SA Commission Settings table
CREATE TABLE public.sa_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_ceiling NUMERIC NOT NULL DEFAULT 45,
  base_plan_value NUMERIC NOT NULL DEFAULT 2500,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sa_commission_settings ENABLE ROW LEVEL SECURITY;

-- Insert default settings
INSERT INTO public.sa_commission_settings (commission_ceiling, base_plan_value)
VALUES (45, 2500);

-- RLS Policies for sa_commission_settings
CREATE POLICY "Super admins can view SA settings"
  ON public.sa_commission_settings FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update SA settings"
  ON public.sa_commission_settings FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Create SA Commission History table
CREATE TABLE public.sa_commission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sa_user_id UUID NOT NULL,
  affiliate_user_id UUID NOT NULL,
  reference_month TEXT NOT NULL,
  affiliate_name TEXT,
  affiliate_tier TEXT NOT NULL,
  affiliate_commission_rate NUMERIC NOT NULL,
  sa_commission_rate NUMERIC NOT NULL,
  client_count INTEGER NOT NULL DEFAULT 0,
  base_value_per_client NUMERIC NOT NULL DEFAULT 2500,
  affiliate_commission_value NUMERIC NOT NULL DEFAULT 0,
  sa_commission_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sa_commission_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sa_commission_history
CREATE POLICY "Super admins can view all SA commissions"
  ON public.sa_commission_history FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert SA commissions"
  ON public.sa_commission_history FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update SA commissions"
  ON public.sa_commission_history FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete SA commissions"
  ON public.sa_commission_history FOR DELETE
  USING (is_super_admin(auth.uid()));

-- Enable realtime for sa_commission_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.sa_commission_history;

-- Create updated_at trigger for sa_commission_settings
CREATE TRIGGER update_sa_commission_settings_updated_at
  BEFORE UPDATE ON public.sa_commission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for sa_commission_history
CREATE TRIGGER update_sa_commission_history_updated_at
  BEFORE UPDATE ON public.sa_commission_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();