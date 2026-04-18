import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";

// Número da loja (formato internacional, só dígitos). Edite aqui.
const WHATSAPP_NUMBER = "5551993199486";
const WOOCOMMERCE_URL = "https://awrbaterias.com.br";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  documento: z.string().trim().min(11, "CPF/CNPJ inválido").max(20),
  endereco: z.string().trim().min(5, "Informe o endereço").max(200),
  numero: z.string().trim().min(1, "Informe o número").max(20),
  cep: z.string().trim().min(8, "CEP inválido").max(10),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  pagamento: z.string().trim().min(2, "Informe a forma de pagamento").max(60),
  carroAno: z.string().trim().min(2, "Informe carro e ano").max(100),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function CheckoutDialog({ open, onOpenChange }: Props) {
  const { items, subtotal, clear, setOpen: setCartOpen } = useCart();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    nome: "",
    documento: "",
    endereco: "",
    numero: "",
    cep: "",
    telefone: "",
    pagamento: "",
    carroAno: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleWooCommerce = () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione uma bateria antes de continuar." });
      return;
    }
    const query = items.map((i) => i.battery.name).join(" ");
    const url = `${WOOCOMMERCE_URL}/?s=${encodeURIComponent(query)}&post_type=product`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast({ title: "Redirecionando para a loja", description: "Finalize seu pedido no site." });
    onOpenChange(false);
    setCartOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione uma bateria antes de finalizar." });
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Dados incompletos", description: first ?? "Verifique o formulário." });
      return;
    }

    const bateriaLinhas = items
      .map((i) => `• ${i.quantity}x ${i.battery.name} (${i.battery.brand} ${i.battery.amperage}Ah) — ${formatBRL(i.battery.price * i.quantity)}`)
      .join("\n");

    const msg =
      `*Novo pedido — BateriaJá*\n\n` +
      `*Cliente*\n` +
      `Nome: ${form.nome}\n` +
      `CPF/CNPJ: ${form.documento}\n` +
      `Telefone: ${form.telefone}\n\n` +
      `*Entrega*\n` +
      `Endereço: ${form.endereco}\n` +
      `Número: ${form.numero}\n` +
      `CEP: ${form.cep}\n\n` +
      `*Veículo*\n${form.carroAno}\n\n` +
      `*Bateria(s) solicitada(s)*\n${bateriaLinhas}\n\n` +
      `*Pagamento*\n${form.pagamento}\n\n` +
      `*Total: ${formatBRL(subtotal)}*`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    toast({ title: "Pedido enviado!", description: "Continue a conversa pelo WhatsApp." });
    clear();
    onOpenChange(false);
    setCartOpen(false);
  };

  const bateriaResumo = items.map((i) => `${i.quantity}x ${i.battery.name}`).join(", ") || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Finalizar pedido</DialogTitle>
          <DialogDescription>
            Preencha os dados e enviamos seu pedido direto para o WhatsApp da loja.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={form.nome} onChange={update("nome")} placeholder="João da Silva" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="documento">CPF / CNPJ</Label>
              <Input id="documento" value={form.documento} onChange={update("documento")} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone para contato</Label>
              <Input id="telefone" value={form.telefone} onChange={update("telefone")} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço de entrega</Label>
            <Input id="endereco" value={form.endereco} onChange={update("endereco")} placeholder="Rua, bairro, cidade" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número (Casa/Apto)</Label>
              <Input id="numero" value={form.numero} onChange={update("numero")} placeholder="123 / Apto 45" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={form.cep} onChange={update("cep")} placeholder="00000-000" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pagamento">Forma de pagamento / bandeira</Label>
            <Input
              id="pagamento"
              value={form.pagamento}
              onChange={update("pagamento")}
              placeholder="Pix, dinheiro, cartão (Visa, Master...)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="carroAno">Carro e ano</Label>
            <Input id="carroAno" value={form.carroAno} onChange={update("carroAno")} placeholder="Fiat Uno 2015" />
          </div>

          <div className="space-y-1.5">
            <Label>Bateria solicitada</Label>
            <Textarea readOnly value={bateriaResumo} className="resize-none bg-secondary/40" rows={2} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
            <span className="font-display font-bold">Total</span>
            <span className="font-display text-xl font-bold">{formatBRL(subtotal)}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#25D366] text-white hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar pedido pelo WhatsApp
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
