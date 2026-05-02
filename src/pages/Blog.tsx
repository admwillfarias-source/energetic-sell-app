import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { SEO } from "@/components/SEO";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { blogPosts } from "@/data/blogPosts";
import { breadcrumbLd, organizationLd, SITE_URL } from "@/lib/seoSchemas";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  manutencao: "Manutenção",
  duvidas: "Dúvidas",
  "guia-compra": "Guia de compra",
  emergencia: "Emergência",
};

const CATEGORIES = ["todos", "manutencao", "duvidas", "guia-compra", "emergencia"] as const;
type Category = typeof CATEGORIES[number];

export default function Blog() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [category, setCategory] = useState<Category>("todos");
  const filtered = useMemo(
    () => category === "todos" ? blogPosts : blogPosts.filter((p) => p.category === category),
    [category],
  );

  const canonical = `${SITE_URL}/blog`;
  const title = "Blog AWR Baterias | Dicas, manutenção e guias sobre baterias automotivas";
  const description =
    "Tudo sobre baterias automotivas: como saber se a bateria está fraca, melhores marcas, troca passo a passo, AGM x EFB e o que fazer em emergências.";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog AWR Baterias",
    url: canonical,
    blogPost: blogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.datePublished,
      dateModified: p.dateModified || p.datePublished,
      description: p.metaDescription,
    })),
  };

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Blog", url: canonical },
    ]),
    itemListLd,
    organizationLd(),
  ];

  return (
    <CartProvider>
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <nav className="container py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium">Blog</li>
            </ol>
          </nav>

          <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
            <div className="container py-10 md:py-14 max-w-3xl">
              <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
                Blog AWR Baterias
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Guias práticos, dicas de manutenção e tudo que você precisa saber sobre baterias automotivas — escrito por quem instala mais de 1.000 baterias por mês na região metropolitana de Porto Alegre.
              </p>
            </div>
          </section>

          <section className="py-10 md:py-14">
            <div className="container">
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                    >
                      <span className="inline-flex w-fit items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                        {CATEGORY_LABEL[p.category]}
                      </span>
                      <h2 className="mt-3 font-display text-lg font-bold leading-snug group-hover:text-primary">
                        {p.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(p.datePublished).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {p.readingMinutes} min de leitura
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingWhatsApp />
      </div>
    </CartProvider>
  );
}
