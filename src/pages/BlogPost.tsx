import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { SEO } from "@/components/SEO";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { getPostBySlug, getRelatedPosts } from "@/data/blogPosts";
import { cityPages } from "@/data/cityContent";
import { brandPages } from "@/data/brandContent";
import { amperagePages } from "@/data/amperageContent";
import {
  articleLd, breadcrumbLd, faqLd, organizationLd, PHONE_E164, SITE_URL,
} from "@/lib/seoSchemas";
import { Calendar, ChevronRight, Clock, MessageCircle } from "lucide-react";

const PHONE_DISPLAY = "(51) 99319-9486";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.title} | AWR Baterias`;
  const description = post.metaDescription;

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Blog", url: `${SITE_URL}/blog` },
      { name: post.title, url: canonical },
    ]),
    articleLd({
      url: canonical,
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
    }),
    faqLd(post.faq),
    organizationLd(),
  ];

  const related = getRelatedPosts(post.slug, 3);
  const linkedCities = (post.related?.cities ?? [])
    .map((s) => cityPages.find((c) => c.slug === s))
    .filter((c): c is typeof cityPages[number] => !!c);
  const linkedBrands = (post.related?.brands ?? [])
    .map((s) => brandPages.find((b) => b.slug === s))
    .filter((b): b is typeof brandPages[number] => !!b);
  const linkedAmps = (post.related?.amperages ?? [])
    .map((s) => amperagePages.find((a) => a.slug === s))
    .filter((a): a is typeof amperagePages[number] => !!a);

  return (
    <CartProvider>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        jsonLd={jsonLd}
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <nav className="container py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium line-clamp-1">{post.title}</li>
            </ol>
          </nav>

          <article className="container max-w-3xl py-6 md:py-10">
            <header>
              <h1 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
                {post.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.datePublished).toLocaleDateString("pt-BR")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingMinutes} min de leitura
                </span>
              </div>
              <p className="mt-5 text-lg text-muted-foreground">{post.intro}</p>
            </header>

            <div className="mt-8 space-y-8">
              {post.sections.map((s, i) => (
                <section key={i}>
                  <h2 className="font-display text-xl font-bold md:text-2xl">{s.heading}</h2>
                  <div className="mt-3 space-y-3 text-foreground/90">
                    {s.paragraphs.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <aside className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5">
              <h3 className="font-display text-lg font-bold">
                Precisa trocar a bateria agora?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrega e instalação grátis em Gravataí, Porto Alegre e região metropolitana.
              </p>
              <Button asChild size="lg" className="mt-4 gap-2">
                <a
                  href={`https://wa.me/${PHONE_E164.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp {PHONE_DISPLAY}
                </a>
              </Button>
            </aside>

            {/* FAQ */}
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold">Perguntas frequentes</h2>
              <Accordion type="single" collapsible className="mt-4">
                {post.faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Links internos */}
            {(linkedCities.length || linkedBrands.length || linkedAmps.length) ? (
              <section className="mt-12 rounded-xl border border-border bg-muted/30 p-5">
                <h2 className="font-display text-lg font-bold">Veja também</h2>
                {linkedCities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold">Cidades atendidas</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {linkedCities.map((c) => (
                        <li key={c.slug}>
                          <Link
                            to={`/baterias/${c.slug}`}
                            className="inline-block rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary hover:text-primary"
                          >
                            Bateria em {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {linkedBrands.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold">Marcas relacionadas</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {linkedBrands.map((b) => (
                        <li key={b.slug}>
                          <Link
                            to={`/baterias/marca/${b.slug}`}
                            className="inline-block rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary hover:text-primary"
                          >
                            Bateria {b.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {linkedAmps.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold">Amperagens</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {linkedAmps.map((a) => (
                        <li key={a.slug}>
                          <Link
                            to={`/baterias/amperagem/${a.slug}`}
                            className="inline-block rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary hover:text-primary"
                          >
                            Bateria {a.ah}Ah
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : null}
          </article>

          {/* Related posts */}
          <section className="border-t border-border bg-muted/30 py-10">
            <div className="container">
              <h2 className="font-display text-xl font-bold md:text-2xl">Continue lendo</h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-3">
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary"
                    >
                      <h3 className="font-display text-base font-bold leading-snug group-hover:text-primary">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
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
