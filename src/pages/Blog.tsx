import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { SEO } from "@/components/SEO";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import {
  breadcrumbLd, localBusinessLd, organizationLd, SITE_URL,
} from "@/lib/seoSchemas";
import { Calendar, Clock, ChevronRight, Search, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  manutencao: "Manutenção",
  duvidas: "Dúvidas",
  "guia-compra": "Guia de compra",
  emergencia: "Emergência",
};

const CATEGORIES = ["todos", "manutencao", "duvidas", "guia-compra", "emergencia"] as const;
type Category = typeof CATEGORIES[number];

const PAGE_SIZE = 12;

function isCategory(v: string | null): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v);
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categoria");
  const queryParam = searchParams.get("q") ?? "";
  const pageParam = Math.max(1, Number(searchParams.get("pagina") ?? "1") || 1);
  const category: Category = isCategory(categoryParam) ? categoryParam : "todos";

  useEffect(() => { window.scrollTo(0, 0); }, [category, queryParam, pageParam]);

  const filtered = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    return blogPosts.filter((p) => {
      if (category !== "todos" && p.category !== category) return false;
      if (!q) return true;
      const haystack = [
        p.title, p.excerpt, p.metaDescription, p.intro,
        ...p.tags, ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [category, queryParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(pageParam, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const updateParams = (next: Partial<Record<"categoria" | "q" | "pagina", string | null>>) => {
    const sp = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "" || v === "todos" || v === "1") sp.delete(k);
      else sp.set(k, v);
    }
    setSearchParams(sp, { replace: false });
  };

  // Canonical sem parâmetros (filtros são facetas, não devem duplicar conteúdo).
  const canonical = `${SITE_URL}/blog`;
  const hasFacet = category !== "todos" || !!queryParam || currentPage > 1;
  const title = category !== "todos"
    ? `Blog AWR Baterias — ${CATEGORY_LABEL[category]}`
    : "Blog AWR Baterias | Dicas, manutenção e guias sobre baterias automotivas";
  const description = category !== "todos"
    ? `Artigos da AWR Baterias na categoria ${CATEGORY_LABEL[category]}: dicas, guias e orientações sobre baterias automotivas.`
    : "Tudo sobre baterias automotivas: como saber se a bateria está fraca, melhores marcas, troca passo a passo, AGM x EFB e o que fazer em emergências.";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog AWR Baterias",
    url: canonical,
    publisher: {
      "@type": "Organization",
      name: "AWR Baterias",
      url: SITE_URL,
    },
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
    localBusinessLd({ url: canonical }),
  ];

  return (
    <CartProvider>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        jsonLd={jsonLd}
        noindex={hasFacet}
      />
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
              {/* Busca */}
              <form
                onSubmit={(e) => { e.preventDefault(); }}
                className="mb-6 flex w-full max-w-xl items-center gap-2"
                role="search"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar no blog (ex: AGM, Moura, partida lenta)…"
                    value={queryParam}
                    onChange={(e) => updateParams({ q: e.target.value, pagina: null })}
                    className="pl-9"
                    aria-label="Buscar artigos"
                  />
                </div>
              </form>

              {/* Filtro de categoria */}
              <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoria">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={category === c}
                    onClick={() => updateParams({ categoria: c, pagina: null })}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      category === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                    )}
                  >
                    {c === "todos" ? "Todos" : CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>

              <p className="mb-5 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "artigo encontrado" : "artigos encontrados"}
                {queryParam && <> para <strong>“{queryParam}”</strong></>}
              </p>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum artigo encontrado. Tente outra palavra-chave ou categoria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => updateParams({ q: null, categoria: null, pagina: null })}
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pageItems.map((p) => (
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
                              {p.readingMinutes} min
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => updateParams({ pagina: String(currentPage - 1) })}
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4" /> Anterior
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <Button
                          key={n}
                          variant={n === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateParams({ pagina: String(n) })}
                          aria-current={n === currentPage ? "page" : undefined}
                        >
                          {n}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => updateParams({ pagina: String(currentPage + 1) })}
                        aria-label="Próxima página"
                      >
                        Próxima <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  )}
                </>
              )}
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
