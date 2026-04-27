import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CartProvider, useCart } from "@/context/CartContext";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import type { Battery } from "@/data/batteries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VIEWPORTS = [
  { w: 320, label: "iPhone SE 1ª (320)" },
  { w: 360, label: "Android pequeno (360)" },
  { w: 375, label: "iPhone Mini (375)" },
  { w: 390, label: "iPhone 14 (390)" },
  { w: 414, label: "iPhone Plus (414)" },
  { w: 1280, label: "Desktop (1280)" },
] as const;

const FRAME_HEIGHT = 720;

const MOCK_BATTERY: Battery = {
  id: "test-1",
  name: "Bateria Heliar 60Ah Free",
  brand: "Heliar",
  amperage: 60,
  price: 459.9,
  image: "/placeholder.svg",
  warranty: "18 meses",
  category: "passeio",
  description: "Bateria de teste",
  fitments: [],
} as unknown as Battery;

/**
 * Frame interno: carrega o CheckoutDialog num passo forçado.
 * Renderizado quando ?frame=1
 */
function CheckoutFrame() {
  const [params] = useSearchParams();
  const stepParam = Number(params.get("step") ?? "1");
  const targetStep = (stepParam >= 1 && stepParam <= 3 ? stepParam : 1) as 1 | 2 | 3;

  return (
    <CartProvider>
      <FrameInner targetStep={targetStep} />
    </CartProvider>
  );
}

function FrameInner({ targetStep }: { targetStep: 1 | 2 | 3 }) {
  const { add, items } = useCart();
  const [open, setOpen] = useState(false);
  const seededRef = useRef(false);

  // Adiciona item mockado uma única vez
  useEffect(() => {
    if (!seededRef.current && items.length === 0) {
      seededRef.current = true;
      add(MOCK_BATTERY);
    }
  }, [add, items.length]);

  // Abre o diálogo após carrinho estar populado
  useEffect(() => {
    if (items.length > 0 && !open) setOpen(true);
  }, [items.length, open]);

  // Avança até o passo desejado clicando no botão Continuar
  useEffect(() => {
    if (!open) return;
    if (targetStep === 1) return;

    let cancelled = false;
    const advance = async () => {
      for (let i = 1; i < targetStep && !cancelled; i++) {
        // Aguarda render
        await new Promise((r) => setTimeout(r, 80));
        const btn = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Avançar para o próximo passo"]',
        );
        if (!btn) break;
        // Antes de avançar, garante que validações dos passos anteriores passem.
        // Passo 1 → preenche endereço/número
        if (i === 1) {
          fillInput("endereco", "Rua de Teste, Bairro Centro, Cidade/UF");
          fillInput("numero", "123");
        }
        // Passo 2 → preenche carro/ano
        if (i === 2) {
          fillInput("carroAno", "Fiat Uno 2015");
        }
        await new Promise((r) => setTimeout(r, 40));
        btn.click();
      }
    };
    advance();
    return () => {
      cancelled = true;
    };
  }, [open, targetStep]);

  return (
    <div className="min-h-screen bg-background p-2 text-xs">
      <div className="mb-2 rounded bg-muted px-2 py-1 font-mono">
        Frame · passo alvo: {targetStep}
      </div>
      <CheckoutDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function fillInput(id: string, value: string) {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el) return;
  // dispatcha um input event compatível com React
  const setter = Object.getOwnPropertyDescriptor(
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Página de testes principal: grade de iframes lado a lado.
 */
export default function CheckoutTest() {
  const [params, setParams] = useSearchParams();
  const isFrame = params.get("frame") === "1";
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (isFrame) return <CheckoutFrame />;

  const frameSrc = useMemo(
    () => (w: number) => `/checkout-test?frame=1&step=${step}&_w=${w}`,
    [step],
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Checkout · QA responsivo</h1>
            <p className="text-sm text-muted-foreground">
              Valide a visibilidade dos botões <strong>Voltar / Continuar / Enviar</strong> em
              cada largura. Cada iframe abre o checkout e avança até o passo selecionado.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
            <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Passo
            </span>
            {([1, 2, 3] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={step === s ? "default" : "outline"}
                onClick={() => setStep(s)}
              >
                {s} ·{" "}
                {s === 1 ? "Entrega" : s === 2 ? "Veículo" : "Pagamento"}
              </Button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
          {VIEWPORTS.map((vp) => (
            <ViewportCard
              key={vp.w}
              label={vp.label}
              width={vp.w}
              src={frameSrc(vp.w)}
              step={step}
            />
          ))}
        </div>

        <footer className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Critérios de aceite</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Passo 1: botão <strong>Continuar</strong> visível.</li>
            <li>Passo 2: botões <strong>Voltar</strong> e <strong>Continuar</strong> visíveis.</li>
            <li>Passo 3: botões <strong>Voltar</strong> e <strong>Enviar pelo WhatsApp</strong> visíveis e dentro da margem do card.</li>
            <li>Nenhum botão deve estourar a largura do card em nenhum viewport.</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}

function ViewportCard({
  label,
  width,
  src,
  step,
}: {
  label: string;
  width: number;
  src: string;
  step: 1 | 2 | 3;
}) {
  // Reload iframe quando step muda para começar do zero
  const iframeKey = `${width}-${step}`;
  const isDesktop = width >= 1024;

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card shadow-sm",
        isDesktop && "lg:col-span-2",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {width}px
        </span>
      </div>
      <div className="overflow-auto bg-muted/20 p-2">
        <iframe
          key={iframeKey}
          src={src}
          title={`Checkout @ ${width}px`}
          width={width}
          height={FRAME_HEIGHT}
          className="block rounded border border-border bg-background"
          style={{ width: `${width}px`, height: `${FRAME_HEIGHT}px` }}
        />
      </div>
    </div>
  );
}
