-- 1. View segura para commission_history (usuarios veem apenas totais)
-- Esta view oculta detalhes de calculo como commission_rate, base_revenue, bonus_value
CREATE OR REPLACE VIEW commission_history_user AS
SELECT 
  id,
  user_id,
  reference_month,
  client_count,
  total_value,
  status,
  calculated_at,
  paid_at,
  created_at,
  updated_at
FROM commission_history;

-- 2. Funcao de auditoria para acessos sensiveis (atualizada para aceitar user_id)
CREATE OR REPLACE FUNCTION log_sensitive_data_access(
  _table_name text,
  _record_count integer,
  _query_type text DEFAULT 'select'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Registra acesso para qualquer usuario autenticado
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO admin_data_access_log (
      admin_user_id,
      action,
      table_accessed,
      details
    ) VALUES (
      auth.uid(),
      _query_type,
      _table_name,
      jsonb_build_object(
        'record_count', _record_count,
        'accessed_at', now(),
        'source', 'client_query'
      )
    );
  END IF;
END;
$$;

-- 3. Indice para detectar acessos em massa (se nao existir)
CREATE INDEX IF NOT EXISTS idx_access_log_user_time 
ON admin_data_access_log(admin_user_id, accessed_at DESC);

-- 4. Grant acesso a view para usuarios autenticados
GRANT SELECT ON commission_history_user TO authenticated;