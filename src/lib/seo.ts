import type { Metadata } from "next";
import { contatoContent } from "@/data/contato";
import { homeData } from "@/data/home";
import { jornadaContent } from "@/data/jornada";
import { PROJECT_STATUS_META, projetosContent } from "@/data/projetos";
import { skillsContent } from "@/data/skills";
import { sobreData } from "@/data/sobre";

/**
 * Deterministic release timestamp used by prerendered metadata routes (`sitemap.ts`)
 * so `cacheComponents: true` does not encounter uncached runtime `new Date()` calls.
 */
export const SEO_LAST_MODIFIED = new Date("2026-11-22T00:00:00.000Z");

const FALLBACK_SITE_URL = "https://mateusaraujo.dev";

function normalizeOrigin(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Resolves the canonical site origin from environment variables without a trailing slash.
 */
export function getSiteUrl(): string {
  const raw =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeOrigin(process.env.VERCEL_URL) ||
    FALLBACK_SITE_URL;

  return raw.replace(/\/+$/, "");
}

function joinSegments(segments: ReadonlyArray<{ text: string }>): string {
  return segments.map((segment) => segment.text).join("");
}

const FULL_NAME = `${homeData.hero.firstName} ${homeData.hero.lastName}`;
const PORTFOLIO_TITLE = `${FULL_NAME} — ${homeData.hero.role}`;
const DEFAULT_TITLE = `${PORTFOLIO_TITLE} em ${homeData.hero.location}`;

// Kept within the recommended 140–155 character SERP snippet budget (145 chars).
export const SITE_DESCRIPTION = `Portfólio de ${FULL_NAME}, ${homeData.hero.role} em ${homeData.hero.location}. Projetos com Next.js, TypeScript, React, Node.js e arquitetura web escalável.`;

const HERO_LEAD_TEXT = joinSegments(homeData.hero.leadSegments);
const HERO_BIO_TEXT = joinSegments(homeData.hero.bioSegments);

function getPublicSocialUrls(): string[] {
  return contatoContent.socials
    .filter((social) => social.platform !== "whatsapp" && social.platform !== "email")
    .map((social) => social.href);
}

/**
 * Builds the global Next.js `Metadata` object consumed by `src/app/layout.tsx`.
 */
export function getSiteMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const keywords = Array.from(
    new Set([
      FULL_NAME,
      homeData.hero.role,
      homeData.hero.location,
      "Aracaju",
      "Sergipe",
      "Portfólio",
      "Desenvolvedor Web",
      ...skillsContent.items.map((item) => item.name),
    ]),
  );

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${FULL_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords,
    authors: [{ name: FULL_NAME, url: siteUrl }],
    creator: FULL_NAME,
    publisher: FULL_NAME,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      siteName: `${FULL_NAME} — Portfólio`,
      title: PORTFOLIO_TITLE,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: DEFAULT_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: PORTFOLIO_TITLE,
      description: SITE_DESCRIPTION,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon.png", type: "image/png" },
      ],
      shortcut: "/icon.png",
      apple: "/icon.png",
    },
  };
}

/**
 * Builds the Schema.org JSON-LD `@graph` (`Person`, `WebSite`, `ProfilePage`, `ItemList`)
 * injected on the home page.
 */
export function getPersonJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const profilePageId = `${siteUrl}/#profilepage`;
  const projectsId = `${siteUrl}/#projects`;

  const knowsAbout = Array.from(
    new Set([
      ...skillsContent.items.map((item) => item.name),
      ...skillsContent.secondaryTools,
    ]),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: FULL_NAME,
        alternateName: `@${homeData.hero.gitMap.username}`,
        url: siteUrl,
        image: `${siteUrl}${sobreData.photo.src}`,
        jobTitle: homeData.hero.role,
        description: HERO_BIO_TEXT,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Aracaju",
          addressRegion: "SE",
          addressCountry: "BR",
        },
        sameAs: getPublicSocialUrls(),
        knowsAbout,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: `${FULL_NAME} — Portfólio`,
        inLanguage: homeData.locale,
        publisher: {
          "@id": personId,
        },
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url: siteUrl,
        name: PORTFOLIO_TITLE,
        inLanguage: homeData.locale,
        isPartOf: {
          "@id": websiteId,
        },
        mainEntity: {
          "@id": personId,
        },
        hasPart: {
          "@id": projectsId,
        },
      },
      {
        "@type": "ItemList",
        "@id": projectsId,
        name: `Projetos de ${FULL_NAME}`,
        numberOfItems: projetosContent.items.length,
        itemListElement: projetosContent.items.map((project, index) => {
          const isPublicRepo =
            project.visibility === "public" && Boolean(project.repoUrl);

          const projectNode: Record<string, unknown> = {
            "@type": isPublicRepo ? "SoftwareSourceCode" : "SoftwareApplication",
            name: project.title,
            description: project.summary,
            dateCreated: project.year,
            applicationCategory: project.category,
            keywords: project.techs,
            url: project.liveUrl ?? `${siteUrl}/#projetos`,
            author: {
              "@id": personId,
            },
          };

          if (isPublicRepo && project.repoUrl) {
            projectNode.programmingLanguage = project.techs;
            projectNode.codeRepository = project.repoUrl;
          }

          return {
            "@type": "ListItem",
            position: index + 1,
            item: projectNode,
          };
        }),
      },
    ],
  };
}

/**
 * Generates the concise `llmstxt.org` index served at `/llms.txt`.
 */
export function buildLlmsTxt(): string {
  const siteUrl = getSiteUrl();
  const featuredProjects = projetosContent.items.filter((item) => item.featured);
  const coreStack = skillsContent.items.map((item) => item.name).join(", ");

  const lines: string[] = [
    `# ${FULL_NAME}`,
    "",
    `> ${homeData.hero.role} em ${homeData.hero.location}. ${HERO_LEAD_TEXT} ${HERO_BIO_TEXT}`,
    "",
    "## Documentação & Dossiê",
    "",
    `- [Portfólio Principal](${siteUrl}/): Visão geral interativa de perfil, projetos, jornada, stack técnica e contato.`,
    `- [Dossiê Completo para LLMs](${siteUrl}/llms-full.txt): Versão integral em Markdown com biografia, cases de projetos, timeline e stack detalhada.`,
    "",
    "## Seções da Página",
    "",
    `- [Sobre](${siteUrl}/#sobre): ${sobreData.quoteAriaLabel}`,
    `- [Projetos](${siteUrl}/#projetos): ${projetosContent.lead}`,
    `- [Jornada](${siteUrl}/#jornada): ${jornadaContent.intro}`,
    `- [Skills](${siteUrl}/#skills): ${skillsContent.defaultDescription}`,
    `- [Contato](${siteUrl}/#contato): ${contatoContent.lead}`,
    "",
    "## Projetos em Destaque",
    "",
    ...featuredProjects.map((project) => {
      const targetUrl = project.liveUrl ?? `${siteUrl}/#projetos`;
      const repoSuffix =
        project.visibility === "public" && project.repoUrl
          ? ` ([Código no GitHub](${project.repoUrl}))`
          : "";
      return `- [${project.title}](${targetUrl}) (${project.year} · ${project.category}): ${project.summary}${repoSuffix}`;
    }),
    "",
    "## Stack Principal",
    "",
    `- Tecnologias: ${coreStack}`,
    `- Ferramentas & Práticas: ${skillsContent.secondaryTools.join(", ")}`,
    "",
    "## Perfis & Contato",
    "",
    ...contatoContent.socials.map(
      (social) => `- [${social.label} (${social.handle})](${social.href})`,
    ),
    "",
  ];

  return lines.join("\n");
}

/**
 * Generates the full structured Markdown dossier served at `/llms-full.txt`.
 * Never exposes `repoUrl` for projects whose `visibility` is not `"public"`.
 */
export function buildLlmsFullTxt(): string {
  const siteUrl = getSiteUrl();

  const statsLine = sobreData.stats
    .map((stat) => `${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""} ${stat.label}`)
    .join(" · ");

  const lines: string[] = [
    `# ${FULL_NAME} — Dossiê Profissional Completo`,
    "",
    `> ${homeData.hero.role} em ${homeData.hero.location} · GitHub: @${homeData.hero.gitMap.username} · Site: ${siteUrl}/`,
    "",
    "## 1. Identidade & Resumo Profissional",
    "",
    `- **Nome:** ${FULL_NAME}`,
    `- **Cargo:** ${homeData.hero.role}`,
    `- **Localização:** ${homeData.hero.location}`,
    `- **Idioma principal:** ${homeData.locale}`,
    `- **Proposta de valor:** ${HERO_LEAD_TEXT}`,
    `- **Posicionamento:** ${HERO_BIO_TEXT}`,
    `- **Síntese pessoal:** ${sobreData.quoteAriaLabel}`,
    `- **Indicadores:** ${statsLine}`,
    "",
    "### História & Trajetória",
    "",
    ...sobreData.modal.paragraphs.flatMap((paragraph) => [paragraph, ""]),
    "## 2. Projetos",
    "",
    projetosContent.lead,
    "",
  ];

  for (const project of projetosContent.items) {
    const statusLabel = PROJECT_STATUS_META[project.status].label;
    const isPublic = project.visibility === "public";

    lines.push(`### ${project.title} (${project.year})`);
    lines.push("");
    lines.push(`- **Subtítulo:** ${project.subtitle}`);
    lines.push(`- **Categoria:** ${project.category}`);
    lines.push(`- **Status:** ${statusLabel}`);
    lines.push(`- **Visibilidade do código:** ${isPublic ? "Repositório público" : "Repositório privado"}`);
    lines.push(`- **Tecnologias:** ${project.techs.join(", ")}`);
    if (project.liveUrl) {
      lines.push(`- **Aplicação online:** ${project.liveUrl}`);
    }
    if (isPublic && project.repoUrl) {
      lines.push(`- **Repositório:** ${project.repoUrl}`);
    }
    lines.push("");
    lines.push(`**Resumo:** ${project.summary}`);
    lines.push("");
    lines.push(`**Visão geral:** ${project.details.overview}`);
    lines.push("");
    if (project.details.challenge) {
      lines.push(`**Desafio:** ${project.details.challenge}`);
      lines.push("");
    }
    if (project.details.solution) {
      lines.push(`**Solução:** ${project.details.solution}`);
      lines.push("");
    }
    if (project.details.highlights && project.details.highlights.length > 0) {
      lines.push("**Destaques:**");
      for (const highlight of project.details.highlights) {
        lines.push(`- ${highlight}`);
      }
      lines.push("");
    }
  }

  lines.push(`## 3. Jornada (${jornadaContent.periodLabel})`);
  lines.push("");
  lines.push(jornadaContent.intro);
  lines.push("");

  for (const stop of jornadaContent.stops) {
    const categoryLabel = jornadaContent.categories[stop.category].label;
    lines.push(
      `### ${stop.year} (${stop.monthLabel}) — ${stop.title} [${categoryLabel}]`,
    );
    lines.push("");
    lines.push(`- **Organização / Contexto:** ${stop.organization}`);
    lines.push(`- **Descrição:** ${stop.description}`);
    lines.push("");
  }

  lines.push("## 4. Skills & Ferramentas");
  lines.push("");
  lines.push(skillsContent.defaultDescription);
  lines.push("");
  lines.push("### Stack Principal");
  lines.push("");
  for (const skill of skillsContent.items) {
    lines.push(`- **${skill.name}** (${skill.category})`);
  }
  lines.push("");
  lines.push(`### ${skillsContent.secondaryTitle}`);
  lines.push("");
  lines.push(skillsContent.secondaryTools.map((tool) => `- ${tool}`).join("\n"));
  lines.push("");

  lines.push("## 5. Contato & Redes");
  lines.push("");
  lines.push(contatoContent.lead);
  lines.push("");
  for (const social of contatoContent.socials) {
    lines.push(`- **${social.label}:** ${social.handle} — ${social.href}`);
  }
  lines.push("");

  return lines.join("\n");
}
