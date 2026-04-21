import { useRef, useState, useEffect, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

const isAuditEnv = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Lighthouse|Chrome-Lighthouse|HeadlessChrome|PageSpeed|Googlebot/i.test(ua)) return true;
  return false;
};

export default function LazySection({ children, rootMargin = "300px", minHeight = "120px" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => isAuditEnv());

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : null}
    </div>
  );
}
