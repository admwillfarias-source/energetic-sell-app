import { useEffect, useState } from "react";
import splashImg from "@/assets/splash-3-passos.jpeg";
import { markEvent } from "@/lib/perfMetrics";
import { isEmbedded } from "@/lib/isEmbedded";

export default function SplashScreen() {
  // Quando embedado em iframe (tema WP), o parent já mostrou seu chrome —
  // mostrar o splash branco causa flash duplo e atrasa o LCP do iframe.
  const [visible, setVisible] = useState(() => !isEmbedded());
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 180);
    const t2 = setTimeout(() => {
      setVisible(false);
      markEvent("splash_hidden");
    }, 380);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] bg-white transition-opacity duration-300 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundImage: `url(${splashImg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#fff",
      }}
    />
  );
}
