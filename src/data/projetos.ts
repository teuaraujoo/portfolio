export type ProjectMedia =
  | {
      type: "placeholder";
      variant: "dashboard" | "ecommerce" | "saas" | "devtools" | "editorial";
      label: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      poster: string;
      alt: string;
    };

export interface ProjectCaseDetails {
  /** Descrição geral do projeto (visão macro e contexto) */
  overview: string;
  /** O desafio enfrentado (problema técnico ou de negócio) */
  challenge: string;
  /** A solução implementada para resolver o desafio */
  solution: string;
  /** Principais entregas ou resultados do case */
  highlights: string[];
  /** Mídias exibidas na galeria do modal */
  gallery: ProjectMedia[];
}

export interface ProjectItem {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  summary: string;
  accentColor?: string;
  featured: boolean;
  techs: string[];
  liveUrl?: string;
  repoUrl?: string;
  cover: ProjectMedia;
  details: ProjectCaseDetails;
}

export interface ProjetosContent {
  eyebrow: string;
  countSuffix: string;
  titleLine1: string;
  titleLine2: string;
  lead: string;
  moreTitle: string;
  moreSubtitle: string;
  ctaCaseLabel: string;
  ctaLiveLabel: string;
  ctaRepoLabel: string;
  closeDialogAriaLabel: string;
  items: ProjectItem[];
}

/** Dados da Seção 3 (Projetos), isolados da camada de apresentação. */
export const projetosContent: ProjetosContent = {
  eyebrow: "03 — Projetos",
  countSuffix: "projetos",
  titleLine1: "Projetos em",
  titleLine2: "destaque.",
  lead: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.",
  moreTitle: "Mais projetos",
  moreSubtitle: "Outros experimentos, estudos e entregas.",
  ctaCaseLabel: "Ver case completo",
  ctaLiveLabel: "Acessar",
  ctaRepoLabel: "GitHub",
  closeDialogAriaLabel: "Fechar case do projeto",
  items: [
    {
      slug: "lorem-dashboard-ia",
      title: "Lorem Dashboard IA",
      subtitle: "Lorem ipsum dolor sit amet telemetry & copilot",
      category: "Dashboard · IA",
      year: "2026",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      accentColor: "#793CFF",
      featured: true,
      techs: ["Next.js", "TypeScript", "Tailwind CSS", "AI SDK", "PostgreSQL"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/teuaraujoo/lorem-dashboard-ia",
      cover: {
        type: "placeholder",
        variant: "dashboard",
        label: "Lorem Dashboard IA — Painel Analítico & Copilot",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        challenge:
          "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio nullam varius turpis et commodo pharetra.",
        solution:
          "Integer nec odio praesent libero sed cursus ante dapibus diam. Sed nisi nulla quis sem at nibh elementum imperdiet, duis sagittis ipsum praesent mauris fusce nec tellus sed augue semper porta.",
        highlights: [
          "Lorem ipsum dolor sit amet — 42% faster query triage",
          "Consectetur adipiscing elit — streaming telemetry em tempo real",
          "Sed do eiusmod tempor — arquitetura modular com Server Actions",
          "Ut labore et dolore magna — cobertura completa de acessibilidade",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "dashboard",
            label: "Visão principal de métricas e insights automatizados",
          },
          {
            type: "placeholder",
            variant: "saas",
            label: "Fluxo de configuração de alertas e modelos",
          },
          {
            type: "placeholder",
            variant: "devtools",
            label: "Console de logs semânticos e auditoria",
          },
        ],
      },
    },
    {
      slug: "dolor-commerce",
      title: "Dolor Commerce",
      subtitle: "Consectetur adipiscing headless storefront & checkout",
      category: "E-commerce · FullStack",
      year: "2025",
      summary:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure.",
      accentColor: "#5B3DF5",
      featured: true,
      techs: ["Next.js", "TypeScript", "Stripe", "Redis", "Prisma"],
      liveUrl: "https://example.com",
      cover: {
        type: "placeholder",
        variant: "ecommerce",
        label: "Dolor Commerce — Vitrine Editorial & Checkout",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
        challenge:
          "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est.",
        solution:
          "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate.",
        highlights: [
          "Lorem ipsum storefront — Core Web Vitals 99/100",
          "Dolor sit amet checkout — redução de etapas em dispositivo móvel",
          "Consectetur cache — revalidação granular por catálogo",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "ecommerce",
            label: "Página de produto com galeria interativa",
          },
          {
            type: "placeholder",
            variant: "editorial",
            label: "Coleção sazonal em layout editorial",
          },
        ],
      },
    },
    {
      slug: "consectetur-cloud-saas",
      title: "Consectetur Cloud SaaS",
      subtitle: "Sed do eiusmod multi-tenant orchestration platform",
      category: "SaaS · Arquitetura",
      year: "2025",
      summary:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.",
      accentColor: "#8E5CFF",
      featured: true,
      techs: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
      repoUrl: "https://github.com/teuaraujoo/consectetur-cloud-saas",
      cover: {
        type: "placeholder",
        variant: "saas",
        label: "Consectetur Cloud SaaS — Orquestração Multi-Tenant",
      },
      details: {
        overview:
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        challenge:
          "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur quis autem vel eum iure reprehenderit.",
        solution:
          "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est omnis dolor repellendus.",
        highlights: [
          "Multi-tenant isolation — isolamento lógico por organização",
          "Lorem billing engine — controle de uso e cotas em tempo real",
          "Consectetur RBAC — matriz granular de permissões e auditoria",
          "Eiusmod workers — filas resilientes com retentativa exponencial",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "saas",
            label: "Topologia de workspaces e permissões",
          },
          {
            type: "placeholder",
            variant: "dashboard",
            label: "Monitoramento de consumo e faturamento",
          },
          {
            type: "placeholder",
            variant: "devtools",
            label: "Painel de webhooks e chaves de API",
          },
        ],
      },
    },
    {
      slug: "adipiscing-cli-docs",
      title: "Adipiscing CLI & Docs",
      subtitle: "Tempor incididunt developer tooling & interactive docs",
      category: "DevTools · Open Source",
      year: "2024",
      summary:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum curabitur.",
      accentColor: "#4811ED",
      featured: true,
      techs: ["TypeScript", "Node.js", "MDX", "Playwright", "Turborepo"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/teuaraujoo/adipiscing-cli-docs",
      cover: {
        type: "placeholder",
        variant: "devtools",
        label: "Adipiscing CLI & Docs — Terminal & Documentação",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
        challenge:
          "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
        solution:
          "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
        highlights: [
          "Lorem CLI — scaffolding determinístico em menos de 2 segundos",
          "Dolor MDX docs — busca instantânea com exemplos executáveis",
          "Amet test suite — validação automatizada em pipelines de CI",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "devtools",
            label: "Saída estruturada do CLI e diagnósticos",
          },
          {
            type: "placeholder",
            variant: "editorial",
            label: "Portal de documentação e guias interativos",
          },
        ],
      },
    },
    {
      slug: "eiusmod-design-system",
      title: "Eiusmod Design System",
      subtitle: "Lorem ipsum tokens, primitives & accessible components",
      category: "Design System · UI",
      year: "2024",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
      accentColor: "#793CFF",
      featured: false,
      techs: ["React", "TypeScript", "Tailwind CSS", "Radix UI", "Storybook"],
      repoUrl: "https://github.com/teuaraujoo/eiusmod-design-system",
      cover: {
        type: "placeholder",
        variant: "editorial",
        label: "Eiusmod Design System — Tokens & Componentes",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero sed cursus ante dapibus diam, sed nisi nulla quis sem at nibh elementum imperdiet.",
        challenge:
          "Duis sagittis ipsum praesent mauris fusce nec tellus sed augue semper porta. Mauris massa vestibulum lacinia arcu eget nulla class aptent taciti sociosqu ad litora torquent.",
        solution:
          "Curabitur sodales ligula in libero sed dignissim lacinia nunc. Curabitur tortor pellentesque nibh aenean quam in scelerisque sem at dolor maecenas mattis.",
        highlights: [
          "Lorem tokens — sincronização automática de variáveis CSS",
          "Dolor primitives — 32 componentes acessíveis via teclado",
          "Amet documentation — catálogo visual com testes de contraste",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "editorial",
            label: "Escala tipográfica e tokens de cor",
          },
          {
            type: "placeholder",
            variant: "devtools",
            label: "Playground interativo de variantes e estados",
          },
        ],
      },
    },
    {
      slug: "tempor-auth-gateway",
      title: "Tempor Auth Gateway",
      subtitle: "Consectetur edge session & OAuth token broker",
      category: "Segurança · Backend",
      year: "2024",
      summary:
        "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure.",
      accentColor: "#5B3DF5",
      featured: false,
      techs: ["TypeScript", "Cloudflare Workers", "JWT", "OAuth 2.0", "Redis"],
      liveUrl: "https://example.com",
      cover: {
        type: "placeholder",
        variant: "saas",
        label: "Tempor Auth Gateway — Autenticação na Edge",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus suspendisse lectus tortor dignissim sit amet adipiscing nec ultricies sed dolor.",
        challenge:
          "Cras elementum ultrices diam maecenas ligula massa varius a semper congue euismod non mi. Proin porttitor orci nec nonummy molestie enim est eleifend mi.",
        solution:
          "Non fermentum diam nisl sit amet erat duis semper. Duis arcu massa scelerisque vitae consequat in pretium a enim pellentesque congue.",
        highlights: [
          "Edge validation — latência média abaixo de 12 ms",
          "Token rotation — revogação imediata de sessões comprometidas",
          "Audit trail — registro estruturado de eventos críticos",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "saas",
            label: "Diagrama de fluxo OAuth e rotação de chaves",
          },
          {
            type: "placeholder",
            variant: "dashboard",
            label: "Métricas de latência e tentativas bloqueadas",
          },
        ],
      },
    },
    {
      slug: "labore-analytics-sdk",
      title: "Labore Analytics SDK",
      subtitle: "Dolor sit amet lightweight privacy-first event pipeline",
      category: "SDK · Telemetria",
      year: "2023",
      summary:
        "Ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco.",
      accentColor: "#8E5CFF",
      featured: false,
      techs: ["TypeScript", "Vite", "ClickHouse", "Zod", "Vitest"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/teuaraujoo/labore-analytics-sdk",
      cover: {
        type: "placeholder",
        variant: "devtools",
        label: "Labore Analytics SDK — Coleta Leve & Tipada",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut purus elit vestibulum ut placerat ac adipiscing vitae felis curabitur dictum gravida mauris.",
        challenge:
          "Nam arcu libero nonummy eget consectetuer id vulputate a magna. Donec vehicula augue eu neque pellentesque habitant morbi tristique senectus et netus.",
        solution:
          "Mauris ut leo cras viverra metus rhoncus sem nulla et lectus vestibulum urna fringilla ultrices phasellus eu tellus sit amet tortor gravida placerat.",
        highlights: [
          "Zero-dependency bundle — menos de 3.2 kB gzipped",
          "Batching inteligente — envio resiliente via sendBeacon",
          "Esquemas tipados — validação estrita em tempo de compilação",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "devtools",
            label: "Contrato de eventos tipados e inspetor local",
          },
          {
            type: "placeholder",
            variant: "dashboard",
            label: "Funis de conversão e retenção sem cookies",
          },
        ],
      },
    },
    {
      slug: "magna-portfolio-engine",
      title: "Magna Portfolio Engine",
      subtitle: "Editorial motion architecture & scroll choreography",
      category: "Editorial · Motion",
      year: "2023",
      summary:
        "Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim.",
      accentColor: "#4811ED",
      featured: false,
      techs: ["Next.js", "GSAP", "Lenis", "Tailwind CSS", "TypeScript"],
      cover: {
        type: "placeholder",
        variant: "editorial",
        label: "Magna Portfolio Engine — Coreografia Editorial",
      },
      details: {
        overview:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
        challenge:
          "Praesent blandit laoreet nibh fusce convallis metus id felis luctus adipiscing. Pellentesque egestas neque sit amet convallis pulvinar justo nulla eleifend augue.",
        solution:
          "Pellentesque auctor neque nec urna proin sapien ipsum porta a auctor quis euismod ut mi. Aenean viverra rhoncus pede pellentesque habitant morbi tristique.",
        highlights: [
          "Scroll sincronizado — GSAP ScrollTrigger integrado ao Lenis",
          "Reduced motion — degradação elegante para acessibilidade",
          "Layout editorial — tipografia fluida com clamp e grid responsivo",
        ],
        gallery: [
          {
            type: "placeholder",
            variant: "editorial",
            label: "Composição tipográfica e ritmo vertical",
          },
          {
            type: "placeholder",
            variant: "dashboard",
            label: "Perfil de frames a 60 fps durante transições",
          },
          {
            type: "placeholder",
            variant: "ecommerce",
            label: "Grade de vitrine com cartões concêntricos",
          },
        ],
      },
    },
  ],
};
