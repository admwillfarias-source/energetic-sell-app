import { ShieldCheck, CreditCard, Lock } from "lucide-react";

const methods = ["PIX", "Visa", "Master", "Elo", "Amex", "Hiper", "Dinheiro"];

export default function PaymentMethods() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div>
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
          Formas de pagamento
        </h4>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <span
              key={m}
              className="inline-flex items-center justify-center min-w-[56px] h-8 px-3 rounded-md bg-card text-card-foreground text-xs font-bold border border-border"
            >
              {m}
            </span>
          ))}
        </div>
        <p className="text-xs text-secondary-foreground/60 mt-2">
          Até <strong className="text-accent">10x sem juros</strong> · Pagamento na entrega
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Compra segura
        </h4>
        <div className="flex items-center gap-3 bg-card text-card-foreground rounded-md border border-border px-3 py-2 w-fit">
          <Lock className="h-4 w-4 text-awr-green" aria-hidden="true" />
          <div className="text-xs">
            <p className="font-bold">Site seguro</p>
            <p className="text-muted-foreground">Conexão SSL criptografada</p>
          </div>
        </div>
      </div>
    </div>
  );
}
