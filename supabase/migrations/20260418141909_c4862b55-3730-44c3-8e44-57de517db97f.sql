-- =========================================================
-- Helpers
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================================================
-- Roles (padrão seguro: tabela separada)
-- =========================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer evita recursão de RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =========================================================
-- Fitments
-- =========================================================

CREATE TABLE public.fitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fitments_brand_model ON public.fitments (brand, model);
CREATE INDEX idx_fitments_code ON public.fitments (code);

ALTER TABLE public.fitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fitments"
  ON public.fitments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert fitments"
  ON public.fitments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update fitments"
  ON public.fitments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete fitments"
  ON public.fitments FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER update_fitments_updated_at
  BEFORE UPDATE ON public.fitments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Equivalents
-- =========================================================

CREATE TABLE public.equivalents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moura TEXT[] NOT NULL DEFAULT '{}',
  heliar TEXT[] NOT NULL DEFAULT '{}',
  zetta TEXT[] NOT NULL DEFAULT '{}',
  excell TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equivalents_moura ON public.equivalents USING GIN (moura);

ALTER TABLE public.equivalents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view equivalents"
  ON public.equivalents FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert equivalents"
  ON public.equivalents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update equivalents"
  ON public.equivalents FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete equivalents"
  ON public.equivalents FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER update_equivalents_updated_at
  BEFORE UPDATE ON public.equivalents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();