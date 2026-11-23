"use client";

import { useEffect } from "react";

const DEVICON_STYLESHEET_ID = "devicon-stylesheet";
const DEVICON_STYLESHEET_HREF =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css";

/**
 * Loads the Devicon icon font stylesheet lazily after mount so it never acts
 * as a render-blocking external stylesheet in the initial SSR `<head>`.
 */
export function DeviconStylesheet() {
  useEffect(() => {
    if (document.getElementById(DEVICON_STYLESHEET_ID)) {
      return;
    }

    const existing = document.querySelector<HTMLLinkElement>(
      `link[href="${DEVICON_STYLESHEET_HREF}"]`,
    );
    if (existing) {
      return;
    }

    const link = document.createElement("link");
    link.id = DEVICON_STYLESHEET_ID;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = DEVICON_STYLESHEET_HREF;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }, []);

  return null;
}
