-- Trigger-only function: nobody should call it via API
REVOKE EXECUTE ON FUNCTION public.handle_new_user_admin() FROM PUBLIC, anon, authenticated;

-- RLS helper functions: needed by authenticated (RLS policies call them);
-- revoke from anon and PUBLIC to satisfy least-privilege.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;

-- Trigger helper: only triggers call it
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Belt-and-suspenders: explicitly deny client writes to WhatsApp tables.
-- (RLS without INSERT/UPDATE/DELETE policies already blocks this, but the
-- explicit restrictive policies make intent obvious and satisfy scanners.)
CREATE POLICY "Deny client writes" ON public.whatsapp_logs
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client updates" ON public.whatsapp_logs
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny client deletes" ON public.whatsapp_logs
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "Deny client writes" ON public.whatsapp_webhooks
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client updates" ON public.whatsapp_webhooks
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny client deletes" ON public.whatsapp_webhooks
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);