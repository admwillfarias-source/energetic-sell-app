import { useState, useEffect, useRef } from "react";
import batteryImg from "@/assets/battery-product.webp";
import { buildWordpressSrcset, supportsWordpressSrcset } from "@/lib/imageSrcset";

const isRemote = (s: string) => /^https?:\/\//.test(s);

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Primeira dobra: carrega ansioso e prioriza fetch */
  priority?: boolean;
  sizes?: string;
  /** Larguras candidatas pro srcset; só usadas quando o provedor é reconhecido */
  srcsetWidths?: number[];
};

/**
 * Imagem de bateria com:
 * - blur-up placeholder (PNG local) que some quando a remota carrega
 * - srcset/sizes apenas em URLs WordPress/Woo conhecidas
 * - fallback automático para a imagem local em caso de erro/offline
 * - eager + fetchpriority quando priority=true
 */
export function BatteryImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  srcsetWidths,
}: Props) {
  const initialRemote = isRemote(src);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(!initialRemote);
  const imgRef = useRef<HTMLImageElement>(null);

  // Se a img remota já está em cache e dispara load antes do bind,
  // garante que o estado fica correto.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const useRemote = initialRemote && !errored;
  const finalSrc = useRemote ? src : batteryImg;
  const srcset = useRemote ? buildWordpressSrcset(src, srcsetWidths) : null;
  const showsBlur = useRemote && !loaded;

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {/* Blur placeholder (PNG local) — sempre presente como fallback visual,
          some quando a remota termina de carregar. Evita "piscar" no erro
          porque se a remota falhar trocamos o src para batteryImg sem
          alterar o layout. */}
      {showsBlur && (
        <img
          src={batteryImg}
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          className="absolute inset-0 h-full w-full scale-105 object-contain blur-md transition-opacity duration-300"
          decoding="async"
          loading="eager"
        />
      )}
      <img
        ref={imgRef}
        src={finalSrc}
        srcSet={srcset ?? undefined}
        sizes={srcset && sizes ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        // @ts-expect-error: fetchpriority é atributo HTML válido (lowercase)
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        className={`relative h-full w-full object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export { isRemote, supportsWordpressSrcset };
