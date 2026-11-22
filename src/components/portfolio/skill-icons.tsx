import type { SkillIconKey } from "@/data/skills";
import { cn } from "@/lib/utils";

export type { SkillIconKey };

export interface SkillIconProps {
  iconKey: SkillIconKey;
  className?: string;
}

const DEVICON_CLASS_MAP: Record<SkillIconKey, string> = {
  typescript: "devicon-typescript-plain colored",
  javascript: "devicon-javascript-plain colored",
  react: "devicon-react-original colored",
  nextjs: "devicon-nextjs-plain text-foreground",
  tailwind: "devicon-tailwindcss-original colored",
  nodejs: "devicon-nodejs-plain colored",
  nestjs: "devicon-nestjs-original colored",
  express: "devicon-express-original text-foreground",
  prisma: "devicon-prisma-original text-foreground",
  typeorm: "devicon-typeorm-plain text-[#F26B3A]",
  postgresql: "devicon-postgresql-plain colored",
  docker: "devicon-docker-plain colored",
  playwright: "devicon-playwright-plain colored",
  github: "devicon-github-original text-foreground",
  actions: "devicon-githubactions-plain colored",
};

/**
 * Renders Devicon font brand icons for the 15 core portfolio technologies,
 * tuned for contrast and visual balance on dark `#141318` card surfaces.
 */
export function SkillIcon({ iconKey, className }: SkillIconProps) {
  return (
    <i
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center leading-none select-none",
        DEVICON_CLASS_MAP[iconKey],
        className,
      )}
    />
  );
}
