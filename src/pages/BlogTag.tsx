import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { SEO } from "@/components/SEO";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import {
  getAllTags, getPostsByTagSlug, getTagBySlug,
} from "@/data/blogPosts";
import {
  breadcrumbLd, localBusinessLd, organizationLd, SITE_URL,
} from "@/lib/seoSchemas";
import { Calendar, ChevronRight, Clock, Tag as TagIcon } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  manutencao: "Manutenção",
  duvidas: "Dúvidas",
  "guia-compra": "Guia de compra",
  emergencia: "Emergência",
};

export default function BlogTag() {
  const { slug } = useParams<{ slug: string }>();
  const tagName = slug ? getTagBySlug(slug) : undefined;
  const posts = slug ? getPostsByTagSlug(slug) : [];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!slug || !tagName) return <Navigate to="/blog" replace />;

  const canonical = `${SITE_URL}/blog/tag/${slug}`;
  const title = `Artigos sobre ${tagName} | Blog AWR Baterias`;
  const description = `Todos os artigos do blog AWR Baterias com a tag "${tagName}". ${posts.length} ${posts.length === 1 ? "artigo" : "artigos"} sobre baterias automotivas.`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: canonical,
    description,
    isPartOf: { "@type": "Blog", name: "Blog AWR Baterias", url: `${SITE_URL}/blog` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Blog", url: `${SITE_URL}/blog` },
      { name: `Tag: ${tagName}`, url: canonical },
    ]),
    itemListLd,
    organizationLd(),
    localBusinessLd({ url: canonical }),
  ];

  const otherTags = getAllTags().filter((t) => t.slug !== slug);

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
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium">Tag: {tagName}</li>
            </ol>
          </nav>

          <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
            <div className="container py-10 md:py-14 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <TagIcon className="h-3.5 w-3.5" /> Tag
              </span>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                {tagName}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {posts.length} {posts.length === 1 ? "artigo" : "artigos"} relacionados a {tagName}.
              </p>
            </div>
          </section>

          <section className="py-10 md:py-14">
            <div className="container">
              {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Nenhum artigo com esta tag ainda.
                </p>
              ) : (
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((p) => (
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
              )}

              {otherTags.length > 0 && (
                <section className="mt-12 rounded-xl border border-border bg-muted/30 p-5">
                  <h2 className="font-display text-lg font-bold">Outras tags</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {otherTags.map((t) => (
                      <li key={t.slug}>
                        <Link
                          to={`/blog/tag/${t.slug}`}
                          className="inline-block rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary hover:text-primary"
                        >
                          {t.tag} <span className="text-xs text-muted-foreground">({t.count})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
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
