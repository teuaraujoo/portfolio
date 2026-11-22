export type SkillIconKey =
  | "typescript"
  | "javascript"
  | "react"
  | "nextjs"
  | "tailwind"
  | "nodejs"
  | "nestjs"
  | "express"
  | "prisma"
  | "typeorm"
  | "postgresql"
  | "docker"
  | "playwright"
  | "github"
  | "actions";

export type SkillCategory =
  | "Linguagem"
  | "Frontend"
  | "FullStack"
  | "Backend"
  | "Dados"
  | "DevOps"
  | "Testes"
  | "CI/CD";

export interface SkillOrbitPlacement {
  linearOffset: { xVw: number; yVh: number };
  linearRotate: number;
  orbitTarget: {
    xVw: number;
    yVh: number;
    rotate: number;
    scale: number;
  };
  zIndex: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  iconKey: SkillIconKey;
  accentColor: string;
  placement: SkillOrbitPlacement;
}

export interface SkillsContent {
  eyebrow: string;
  countSuffix: string;
  centerEyebrowDefault: string;
  titleLine1: string;
  titleConnector?: string;
  titleLine2: string;
  defaultDescription: string;
  scrollHint: string;
  secondaryTitle: string;
  items: SkillItem[];
  secondaryTools: string[];
}

/** Dados da Seção 5 (Skills), isolados da camada de apresentação. */
export const skillsContent: SkillsContent = {
  eyebrow: "05 — Skills",
  countSuffix: "tecnologias",
  centerEyebrowDefault: "Stack principal",
  titleLine1: "Stack",
  titleConnector: "para",
  titleLine2: "grandes projetos.",
  defaultDescription: "Do problema à arquitetura fullstack escalável.",
  scrollHint: "Role para expandir",
  secondaryTitle: "Outras ferramentas & práticas",
  items: [
    {
      id: "typescript",
      name: "TypeScript",
      category: "Linguagem",
      iconKey: "typescript",
      accentColor: "#3178C6",
      placement: {
        linearOffset: { xVw: -31.5, yVh: 0 },
        linearRotate: -7,
        orbitTarget: { xVw: -38, yVh: -17, rotate: -6, scale: 0.94 },
        zIndex: 2,
      },
    },
    {
      id: "javascript",
      name: "JavaScript",
      category: "Linguagem",
      iconKey: "javascript",
      accentColor: "#F7DF1E",
      placement: {
        linearOffset: { xVw: -27, yVh: 0 },
        linearRotate: -6,
        orbitTarget: { xVw: -23, yVh: -21, rotate: 4, scale: 0.9 },
        zIndex: 3,
      },
    },
    {
      id: "react",
      name: "React",
      category: "Frontend",
      iconKey: "react",
      accentColor: "#61DAFB",
      placement: {
        linearOffset: { xVw: -22.5, yVh: 0 },
        linearRotate: -5,
        orbitTarget: { xVw: -8, yVh: -22, rotate: -3, scale: 0.92 },
        zIndex: 4,
      },
    },
    {
      id: "nextjs",
      name: "Next.js",
      category: "FullStack",
      iconKey: "nextjs",
      accentColor: "#F5F5F5",
      placement: {
        linearOffset: { xVw: -18, yVh: 0 },
        linearRotate: -4,
        orbitTarget: { xVw: 8, yVh: -22, rotate: 3, scale: 0.9 },
        zIndex: 5,
      },
    },
    {
      id: "tailwind",
      name: "Tailwind CSS",
      category: "Frontend",
      iconKey: "tailwind",
      accentColor: "#38BDF8",
      placement: {
        linearOffset: { xVw: -13.5, yVh: 0 },
        linearRotate: -3,
        orbitTarget: { xVw: 23, yVh: -21, rotate: -4, scale: 0.92 },
        zIndex: 6,
      },
    },
    {
      id: "nodejs",
      name: "Node.js",
      category: "Backend",
      iconKey: "nodejs",
      accentColor: "#5FA04E",
      placement: {
        linearOffset: { xVw: -9, yVh: 0 },
        linearRotate: -2,
        orbitTarget: { xVw: 38, yVh: -17, rotate: 6, scale: 0.94 },
        zIndex: 7,
      },
    },
    {
      id: "nestjs",
      name: "NestJS",
      category: "Backend",
      iconKey: "nestjs",
      accentColor: "#E0234E",
      placement: {
        linearOffset: { xVw: -4.5, yVh: 0 },
        linearRotate: -1,
        orbitTarget: { xVw: -40, yVh: 2, rotate: -5, scale: 0.9 },
        zIndex: 8,
      },
    },
    {
      id: "express",
      name: "Express",
      category: "Backend",
      iconKey: "express",
      accentColor: "#E5E5E5",
      placement: {
        linearOffset: { xVw: 0, yVh: 0 },
        linearRotate: 0,
        orbitTarget: { xVw: -28, yVh: 5, rotate: 4, scale: 0.88 },
        zIndex: 9,
      },
    },
    {
      id: "prisma",
      name: "Prisma ORM",
      category: "Dados",
      iconKey: "prisma",
      accentColor: "#7986CB",
      placement: {
        linearOffset: { xVw: 4.5, yVh: 0 },
        linearRotate: 1,
        orbitTarget: { xVw: 28, yVh: 5, rotate: -4, scale: 0.88 },
        zIndex: 10,
      },
    },
    {
      id: "typeorm",
      name: "TypeORM",
      category: "Dados",
      iconKey: "typeorm",
      accentColor: "#F26B3A",
      placement: {
        linearOffset: { xVw: 9, yVh: 0 },
        linearRotate: 2,
        orbitTarget: { xVw: 40, yVh: 2, rotate: 5, scale: 0.9 },
        zIndex: 11,
      },
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      category: "Dados",
      iconKey: "postgresql",
      accentColor: "#4169E1",
      placement: {
        linearOffset: { xVw: 13.5, yVh: 0 },
        linearRotate: 3,
        orbitTarget: { xVw: -36, yVh: 22, rotate: 6, scale: 0.92 },
        zIndex: 12,
      },
    },
    {
      id: "docker",
      name: "Docker",
      category: "DevOps",
      iconKey: "docker",
      accentColor: "#2496ED",
      placement: {
        linearOffset: { xVw: 18, yVh: 0 },
        linearRotate: 4,
        orbitTarget: { xVw: -18, yVh: 25, rotate: -5, scale: 0.94 },
        zIndex: 13,
      },
    },
    {
      id: "playwright",
      name: "Playwright",
      category: "Testes",
      iconKey: "playwright",
      accentColor: "#2EAD33",
      placement: {
        linearOffset: { xVw: 22.5, yVh: 0 },
        linearRotate: 5,
        orbitTarget: { xVw: 0, yVh: 24, rotate: 2, scale: 0.9 },
        zIndex: 14,
      },
    },
    {
      id: "github",
      name: "GitHub",
      category: "DevOps",
      iconKey: "github",
      accentColor: "#F5F5F5",
      placement: {
        linearOffset: { xVw: 27, yVh: 0 },
        linearRotate: 6,
        orbitTarget: { xVw: 18, yVh: 25, rotate: 5, scale: 0.94 },
        zIndex: 15,
      },
    },
    {
      id: "actions",
      name: "GitHub Actions",
      category: "CI/CD",
      iconKey: "actions",
      accentColor: "#2088FF",
      placement: {
        linearOffset: { xVw: 31.5, yVh: 0 },
        linearRotate: 7,
        orbitTarget: { xVw: 36, yVh: 22, rotate: -6, scale: 0.92 },
        zIndex: 16,
      },
    },
  ],
  secondaryTools: [
    "Git",
    "GSAP",
    "Lenis",
    "REST APIs",
    "WebSockets",
    "Linux",
    "Clean Architecture",
    "Figma",
  ],
};
