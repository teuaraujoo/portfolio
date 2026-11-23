import { cacheLife } from "next/cache";
import { HomeShell } from "@/components/portfolio/home-shell";
import { contatoContent } from "@/data/contato";
import { footerContent } from "@/data/footer";
import { homeData } from "@/data/home";
import { jornadaContent } from "@/data/jornada";
import { projetosContent } from "@/data/projetos";
import { skillsContent } from "@/data/skills";
import { sobreData } from "@/data/sobre";
import { getGithubContributions } from "@/lib/github";
import { getPersonJsonLd } from "@/lib/seo";

export default async function Home() {
  "use cache";
  cacheLife("hours");

  const contributions = await getGithubContributions(
    homeData.hero.gitMap.username,
  );
  const personJsonLd = getPersonJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeShell
        data={homeData}
        sobre={sobreData}
        projetos={projetosContent}
        jornada={jornadaContent}
        skills={skillsContent}
        contato={contatoContent}
        footer={footerContent}
        contributions={contributions}
      />
    </>
  );
}
