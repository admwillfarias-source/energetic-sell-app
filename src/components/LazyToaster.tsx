import { lazy, Suspense, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));

/**
 * Mounts the Toaster only after the first toast is queued.
 * Saves ~15KB from initial bundle while remaining fully transparent
 * to call sites that use `toast(...)`.
 */
export default function LazyToaster() {
  const { toasts } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (toasts.length > 0) setMounted(true);
  }, [toasts.length]);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
  );
}
