CREATE OR REPLACE FUNCTION public.truncate_fitments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.fitments;
END;
$$;

REVOKE ALL ON FUNCTION public.truncate_fitments() FROM PUBLIC, anon, authenticated;