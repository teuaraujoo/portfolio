export type ProjectVisibility = "public" | "private";
export type ProjectStatus = "completed" | "in_progress";

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; dotClass: string }
> = {
  completed: { label: "Concluído", dotClass: "bg-emerald-400" },
  in_progress: { label: "Em desenvolvimento", dotClass: "bg-amber-400" },
};

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
      fit?: "cover" | "contain";
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
  challenge?: string;
  /** A solução implementada para resolver o desafio */
  solution?: string;
  /** Principais entregas ou resultados do case */
  highlights?: string[];
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
  visibility: ProjectVisibility;
  status: ProjectStatus;
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
  titleLine1: "Projetos feitos",
  titleLine2: "por mim.",
  lead: "Uma seleção de projetos em que transformei ideias e desafios em soluções digitais.",
  moreTitle: "Mais projetos",
  moreSubtitle: "Outros experimentos, estudos e entregas.",
  ctaCaseLabel: "Ver case completo",
  ctaLiveLabel: "Acessar",
  ctaRepoLabel: "GitHub",
  closeDialogAriaLabel: "Fechar case do projeto",
  items: [
    {
      slug: "anatolab",
      title: "Anatolab - Anatomia Humana em 3D",
      subtitle: "Plataforma interativa para exploração visual de anatomia em 3D",
      category: "Educação · 3D",
      year: "2026",
      summary:
        "Plataforma interativa para exploração visual de estruturas do corpo humano em 3D, construída com TypeScript, Next.js e Three.js.",
      accentColor: "#793CFF",
      featured: true,
      visibility: "public",
      status: "completed",
      techs: ["TypeScript", "Next.js", "Tailwind CSS", "Three.js", "Codex"],
      liveUrl: "https://anatolab-ten.vercel.app/",
      repoUrl: "https://github.com/teuaraujoo/anato-lab",
      cover: {
        type: "image",
        src: "/projects/anatolab/capa.webp",
        alt: "Anatolab - Anatomia Humana em 3D — capa do projeto",
      },
      details: {
        overview:
          "Anatolab é uma plataforma interativa para exploração visual de estruturas do corpo humano em 3D. O projeto começou como um experimento com o GPT-6 Astra e evoluiu para um acervo educacional desenvolvido com TypeScript, Next.js e Three.js.",
        challenge:
          "Representar anatomia de forma clara, visual e interativa sem depender de modelos externos complexos. Cada estrutura precisa ser compreensível, permitir exploração por partes e manter uma experiência fluida para estudantes e curiosos.",
        solution:
          "A aplicação utiliza modelos 3D construídos por código, com estruturas selecionáveis, foco visual, isolamento de elementos e visualizações internas quando necessário. O conteúdo anatômico é organizado em módulos independentes para facilitar a expansão do acervo.",
        highlights: [
          "Top 1 no ranking de pesquisas do Google de forma 100% orgânica",
          "Célula animal, olho humano, rim, cérebro e coração em exploração 3D",
          "Seleção, destaque e separação visual de estruturas anatômicas",
        ],
        gallery: [
          {
            type: "image",
            src: "/projects/anatolab/capa.webp",
            alt: "Anatolab - Anatomia Humana em 3D — capa do projeto",
          },
          {
            type: "image",
            src: "/projects/anatolab/imagem2.webp",
            alt: "Anatolab - Anatomia Humana em 3D — tela 2",
          },
          {
            type: "image",
            src: "/projects/anatolab/imagem3.webp",
            alt: "Anatolab - Anatomia Humana em 3D — tela 3",
          },
          {
            type: "image",
            src: "/projects/anatolab/imagem4.webp",
            alt: "Anatolab - Anatomia Humana em 3D — tela 4",
          },
        ],
      },
    },
    {
      slug: "cmf",
      title: "CMF - Sistema de Gerenciamento",
      subtitle: "Plataforma de gestão educacional para o Curso Matemática Fácil",
      category: "SaaS · Gestão Educacional",
      year: "2025",
      summary:
        "Plataforma para gestão administrativa e pedagógica do Curso Matemática Fácil, reunindo alunos, professores, turmas, calendário, frequência e histórico.",
      accentColor: "#5B3DF5",
      featured: true,
      visibility: "private",
      status: "completed",
      techs: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Figma"],
      cover: {
        type: "image",
        src: "/projects/cmf/capa.webp",
        alt: "CMF - Sistema de Gerenciamento — capa do projeto",
      },
      details: {
        overview:
          "O CMF App é uma plataforma de gestão educacional para o Curso Matemática Fácil. Centraliza a operação administrativa e pedagógica em um único ambiente, reunindo alunos, professores, turmas, modalidades, aulas individuais, calendário, frequência, pendências e histórico acadêmico.\n\nDesenvolvido com Next.js, React, TypeScript, Prisma, PostgreSQL/Supabase e autenticação segura, o sistema transforma rotinas antes dispersas em fluxos digitais rastreáveis e organizados.",
        challenge:
          "A operação de um curso de reforço envolve diversos dados conectados: alunos matriculados, professores, turmas recorrentes, aulas individuais, disponibilidade de horários e acompanhamento de frequência. Quando esses processos dependem de controles manuais ou planilhas isoladas, aumentam os riscos de conflito de agenda, perda de informação, retrabalho e dificuldade para acompanhar o histórico acadêmico.\n\nO desafio foi criar uma solução que desse visibilidade à operação sem abrir mão de regras importantes, como evitar sobreposição de horários, limitar o acesso de professores às próprias aulas e manter registros consistentes.",
        solution:
          "O CMF App estrutura a gestão do curso por perfis e fluxos claros. Administradores gerenciam cadastros, turmas, modalidades e aulas; professores acessam o próprio portal para acompanhar, iniciar e finalizar aulas sob sua responsabilidade; alunos podem consultar as informações vinculadas ao seu perfil.",
        highlights: [
          "Gestão centralizada de alunos, professores, turmas, modalidades e usuários",
          "Calendário integrado para visualizar turmas recorrentes e aulas individuais",
          "Validação automática de conflitos de horário entre alunos, professores, turmas e aulas",
          "Portal por perfil",
          "Fluxo completo de aulas: agendamento, início, finalização, anotações e histórico paginado",
          "Controle de frequência e acompanhamento de pendências",
        ],
        gallery: [
          {
            type: "image",
            src: "/projects/cmf/capa.webp",
            alt: "CMF - Sistema de Gerenciamento — capa do projeto",
          },
          {
            type: "image",
            src: "/projects/cmf/imagem2.webp",
            alt: "CMF - Sistema de Gerenciamento — tela 2",
          },
          {
            type: "image",
            src: "/projects/cmf/imagem3.webp",
            alt: "CMF - Sistema de Gerenciamento — tela 3",
          },
          {
            type: "image",
            src: "/projects/cmf/imagem4.webp",
            alt: "CMF - Sistema de Gerenciamento — tela 4",
          },
          {
            type: "image",
            src: "/projects/cmf/imagem5-celular.webp",
            alt: "CMF - Sistema de Gerenciamento — versão mobile",
            fit: "contain",
          },
        ],
      },
    },
    {
      slug: "civix",
      title: "Civix - Chatbot para Construção Civil",
      subtitle: "Plataforma SaaS de atendimento inteligente com IA para construção civil",
      category: "SaaS · IA Comercial",
      year: "2025",
      summary:
        "Plataforma SaaS que automatiza o primeiro contato comercial com IA, qualifica leads e entrega contexto completo ao vendedor na construção civil.",
      accentColor: "#8E5CFF",
      featured: true,
      visibility: "private",
      status: "completed",
      techs: ["React", "TypeScript", "n8n", "Express", "Tailwind CSS", "Figma", "PostgreSQL", "Lenis", "GSAP"],
      cover: {
        type: "image",
        src: "/projects/civix/capa.webp",
        alt: "Civix - Chatbot para Construção Civil — capa do projeto",
      },
      details: {
        overview:
          "A Civix é uma plataforma SaaS de atendimento inteligente voltada para negócios e empresas, com foco inicial no setor da construção civil.\n\nA plataforma utiliza Inteligência Artificial para automatizar o primeiro contato entre empresas e clientes, responder dúvidas frequentes, identificar a intenção de compra e qualificar oportunidades comerciais. Após essa etapa, os vendedores recebem o histórico da conversa, as principais necessidades do cliente e o contexto necessário para conduzir o atendimento até a compra ou fechamento do negócio.",
        challenge:
          "Empresas enfrentam dificuldades para manter um atendimento rápido, consistente e disponível durante todo o dia. O volume de mensagens repetitivas consome o tempo dos vendedores, enquanto a demora no primeiro contato pode fazer com que oportunidades sejam perdidas.\n\nTambém existe a necessidade de oferecer atendimento humano em diferentes momentos do funil de vendas, sem exigir que a equipe responda manualmente todas as dúvidas desde o início. Conforme a demanda cresce, aumentar o atendimento apenas com novas contratações eleva os custos e dificulta a escala da operação.",
        solution:
          "A Civix automatiza a etapa inicial do atendimento comercial com Inteligência Artificial, oferecendo respostas rápidas e disponibilidade contínua. A IA pode identificar dúvidas, necessidades, perfil e intenção de compra, qualificando o lead antes de encaminhá-lo para um vendedor.\n\nQuando o atendimento humano se torna necessário, o vendedor recebe o histórico completo da conversa e as informações já coletadas pela plataforma. Dessa forma, ele não precisa repetir perguntas básicas e pode concentrar seu tempo em oportunidades mais preparadas para avançar no funil.\n\nA solução também centraliza a gestão de empresas, equipes, conversas, leads e vendas, fornecendo dashboards e métricas para acompanhar o desempenho da operação.",
        highlights: [
          "Atendimento inteligente 24/7: disponibilidade contínua para responder clientes e iniciar oportunidades.",
          "Qualificação automática de leads: identificação de necessidades, perfil e intenção de compra.",
          "Transição contextual para vendedores: histórico completo e informações relevantes antes do atendimento humano.",
          "Redução de tarefas repetitivas: vendedores focados em negociação e fechamento.",
          "Foco na construção civil: atendimento adaptado às necessidades de empresas do setor.",
        ],
        gallery: [
          {
            type: "image",
            src: "/projects/civix/capa.webp",
            alt: "Civix - Chatbot para Construção Civil — capa do projeto",
          },
          {
            type: "image",
            src: "/projects/civix/imagem2.webp",
            alt: "Civix - Chatbot para Construção Civil — tela 2",
          },
          {
            type: "image",
            src: "/projects/civix/imagem3.webp",
            alt: "Civix - Chatbot para Construção Civil — tela 3",
          },
          {
            type: "image",
            src: "/projects/civix/imagem4.webp",
            alt: "Civix - Chatbot para Construção Civil — tela 4",
          },
        ],
      },
    },
    {
      slug: "jose-william",
      title: "José William - Portfolio Pessoal",
      subtitle: "Portfólio profissional para atleta de basquete",
      category: "Landing Page · Portfólio",
      year: "2024",
      summary:
        "Portfólio desenvolvido para o atleta de basquete José William apresentar suas habilidades, conquistas e melhores momentos em quadra.",
      accentColor: "#4811ED",
      featured: true,
      visibility: "public",
      status: "completed",
      techs: ["HTML", "CSS", "JavaScript", "Figma", "GSAP"],
      liveUrl: "https://josewilliam.vercel.app/",
      repoUrl: "https://github.com/teuaraujoo/atletaBahia",
      cover: {
        type: "image",
        src: "/projects/bahia/capa.webp",
        alt: "José William - Portfolio Pessoal — capa do projeto",
      },
      details: {
        overview:
          "Landing page desenvolvida para o atleta de basquete José William. O objetivo do site é servir como portfólio pessoal e ferramenta de divulgação profissional, apresentando suas habilidades, conquistas e melhores momentos em quadra.",
        challenge:
          "Estruturar uma apresentação digital com presença marcante para destacar a trajetória esportiva do atleta de forma clara e profissional, facilitando a avaliação rápida por clubes, olheiros e parceiros.",
        solution:
          "Interface prototipada no Figma e construída com HTML, CSS, JavaScript e animações fluidas em GSAP, organizando perfil esportivo, conquistas e melhores momentos em uma navegação direta e responsiva.",
        highlights: [
          "Apresentação dedicada de habilidades, conquistas e melhores momentos em quadra",
          "Layout prototipado no Figma com animações e ritmo visual em GSAP",
          "Estrutura responsiva voltada à divulgação profissional do atleta",
        ],
        gallery: [
          {
            type: "image",
            src: "/projects/bahia/capa.webp",
            alt: "José William - Portfolio Pessoal — capa do projeto",
          },
          {
            type: "image",
            src: "/projects/bahia/imagem2.webp",
            alt: "José William - Portfolio Pessoal — tela 2",
          },
          {
            type: "image",
            src: "/projects/bahia/imagem3.webp",
            alt: "José William - Portfolio Pessoal — tela 3",
          },
          {
            type: "image",
            src: "/projects/bahia/imagem4.webp",
            alt: "José William - Portfolio Pessoal — tela 4",
          },
        ],
      },
    },
    {
      slug: "calculadora",
      title: "Calculadora",
      subtitle: "Calculadora web minimalista com operações aritméticas básicas",
      category: "Frontend · JavaScript",
      year: "2024",
      summary:
        "Aplicação web de calculadora em HTML, CSS e JavaScript para operações aritméticas do dia a dia em uma interface limpa.",
      accentColor: "#793CFF",
      featured: false,
      visibility: "private",
      status: "completed",
      techs: ["HTML", "CSS", "JavaScript"],
      cover: {
        type: "image",
        src: "/projects/calculadora/capa.png",
        alt: "Calculadora — capa do projeto",
      },
      details: {
        overview:
          "Calculadora web desenvolvida com HTML, CSS e JavaScript para realizar operações matemáticas básicas: adição, subtração, multiplicação e divisão, além de limpeza e correção de dígitos. Construída com interface centralizada em tema escuro para proporcionar leitura clara dos botões e uso direto no navegador.",
        gallery: [
          {
            type: "image",
            src: "/projects/calculadora/capa.png",
            alt: "Calculadora — tela principal",
          },
        ],
      },
    },
    {
      slug: "lista-de-tarefas",
      title: "Lista de Tarefas",
      subtitle: "Aplicação simples para criação e gerenciamento de tarefas",
      category: "Frontend · JavaScript",
      year: "2024",
      summary:
        "Lista de tarefas interativa desenvolvida com HTML, CSS e JavaScript para adicionar e remover atividades do dia a dia.",
      accentColor: "#5B3DF5",
      featured: false,
      visibility: "private",
      status: "completed",
      techs: ["HTML", "CSS", "JavaScript"],
      cover: {
        type: "image",
        src: "/projects/lista-tarefas/capa.png",
        alt: "Lista de Tarefas — capa do projeto",
      },
      details: {
        overview:
          "Aplicação de lista de tarefas criada com HTML, CSS e JavaScript para organizar atividades cotidianas de forma prática. Permite digitar e adicionar novas tarefas pelo campo de entrada e remover itens individualmente, mantendo o foco em manipulação dinâmica do DOM e interface direta.",
        gallery: [
          {
            type: "image",
            src: "/projects/lista-tarefas/capa.png",
            alt: "Lista de Tarefas — tela principal",
          },
        ],
      },
    },
    {
      slug: "lampada-interativa",
      title: "Lâmpada Interativa",
      subtitle: "Experimento interativo de manipulação visual de estados com DOM",
      category: "Frontend · JavaScript",
      year: "2023",
      summary:
        "Projeto interativo em HTML, CSS e JavaScript que altera o estado visual de uma lâmpada em resposta às interações do usuário.",
      accentColor: "#8E5CFF",
      featured: false,
      visibility: "private",
      status: "completed",
      techs: ["HTML", "CSS", "JavaScript"],
      cover: {
        type: "image",
        src: "/projects/lampada/capa.png",
        alt: "Lâmpada Interativa — capa do projeto",
      },
      details: {
        overview:
          "Experimento web desenvolvido com HTML, CSS e JavaScript em torno de uma lâmpada interativa centralizada em cena. O projeto explora manipulação de eventos e atualização dinâmica de elementos do DOM para alternar estados visuais da lâmpada diretamente pela interface.",
        gallery: [
          {
            type: "image",
            src: "/projects/lampada/capa.png",
            alt: "Lâmpada Interativa — tela principal",
          },
        ],
      },
    },
  ],
};
