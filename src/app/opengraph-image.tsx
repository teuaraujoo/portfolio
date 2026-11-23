import { ImageResponse } from "next/og";
import { homeData } from "@/data/home";
import { skillsContent } from "@/data/skills";
import { getSiteUrl } from "@/lib/seo";

export const alt = `${homeData.hero.firstName} ${homeData.hero.lastName} — ${homeData.hero.role} em ${homeData.hero.location}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FEATURED_STACK_IDS = new Set([
  "typescript",
  "nextjs",
  "react",
  "nodejs",
  "postgresql",
]);

export default function OpenGraphImage() {
  const fullName = `${homeData.hero.firstName} ${homeData.hero.lastName}`;
  const tagline = homeData.hero.leadSegments.map((s) => s.text).join("");
  const hostname = new URL(getSiteUrl()).hostname;
  const stackPills = skillsContent.items
    .filter((item) => FEATURED_STACK_IDS.has(item.id))
    .map((item) => item.name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#0D0D0D",
          backgroundImage:
            "radial-gradient(circle at 82% 20%, rgba(121, 60, 255, 0.28), transparent 48%), radial-gradient(circle at 18% 85%, rgba(72, 17, 237, 0.22), transparent 50%)",
          color: "#F5F5F5",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top role / location pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              borderRadius: "9999px",
              border: "1px solid rgba(121, 60, 255, 0.45)",
              backgroundColor: "rgba(121, 60, 255, 0.12)",
              fontSize: "20px",
              fontWeight: 500,
              color: "#E4D4FB",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#793CFF",
              }}
            />
            <span>{`${homeData.hero.role} · ${homeData.hero.location}`}</span>
          </div>

          <span
            style={{
              fontSize: "18px",
              color: "#AAA4B8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {homeData.preloader.yearLabel}
          </span>
        </div>

        {/* Center Editorial-Tech Display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              color: "#F5F5F5",
            }}
          >
            {fullName}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "28px",
              lineHeight: 1.4,
              color: "#AAA4B8",
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Bottom hostname + stack tags */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "28px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#F5F5F5",
              letterSpacing: "-0.01em",
            }}
          >
            {hostname}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {stackPills.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontSize: "18px",
                  color: "#E5E5E5",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
