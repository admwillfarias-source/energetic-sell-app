
CREATE TABLE public.whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  template text NOT NULL,
  to_phone text NOT NULL,
  status_code integer,
  ok boolean NOT NULL DEFAULT false,
  message_id text,
  request_payload jsonb,
  response_payload jsonb,
  error_message text
);
CREATE INDEX idx_whatsapp_logs_created_at ON public.whatsapp_logs(created_at DESC);

CREATE TABLE public.whatsapp_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text,
  message_id text,
  from_phone text,
  status text,
  payload jsonb NOT NULL
);
CREATE INDEX idx_whatsapp_webhooks_created_at ON public.whatsapp_webhooks(created_at DESC);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view whatsapp_logs"
  ON public.whatsapp_logs FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view whatsapp_webhooks"
  ON public.whatsapp_webhooks FOR SELECT TO authenticated
  USING (public.is_admin());
