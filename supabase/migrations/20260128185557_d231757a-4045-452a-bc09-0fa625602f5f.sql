-- Recria a view com security_invoker para herdar RLS do usuario que consulta
DROP VIEW IF EXISTS commission_history_user;

CREATE VIEW commission_history_user
WITH (security_invoker=on) AS
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

-- Grant acesso a view para usuarios autenticados
GRANT SELECT ON commission_history_user TO authenticated;