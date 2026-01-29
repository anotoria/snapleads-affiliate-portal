-- Adicionar campos de requisitos e vantagens na tabela tiers
ALTER TABLE public.tiers 
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS benefits text;