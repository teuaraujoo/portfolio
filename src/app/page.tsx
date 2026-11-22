import { cacheLife } from "next/cache";
import { HomeShell } from "@/components/portfolio/home-shell";
import { homeData } from "@/data/home";
import { sobreData } from "@/data/sobre";
import { getGithubContributions } from "@/lib/github";

export default async function Home() {
  "use cache";
  cacheLife("hours");

  const contributions = await getGithubContributions(
    homeData.hero.gitMap.username,
  );

  return (
    <HomeShell
      data={homeData}
      sobre={sobreData}
      contributions={contributions}
    />
  );
}
