
ALTER TABLE public.fitments
  ADD COLUMN IF NOT EXISTS sku_heliar text,
  ADD COLUMN IF NOT EXISTS sku_moura text,
  ADD COLUMN IF NOT EXISTS sku_zetta text,
  ADD COLUMN IF NOT EXISTS sku_excell text;

CREATE INDEX IF NOT EXISTS idx_fitments_brand_model ON public.fitments (brand, model);
