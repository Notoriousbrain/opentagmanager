export type InstallSnippetKind = "html" | "next" | "react" | "vanilla";

export interface InstallSnippets {
  html: string;
  next: string;
  react: string;
  vanilla: string;
}

export function getInstallSnippets(projectId: string): InstallSnippets {
  const html = `<script
    src="https://cdn.osstag.com/v1.min.js"
    data-osstag="${projectId}"
    ></script>`;

  const next = `import { NextAnalyticsProvider } from "@otm/sdk/next";

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <NextAnalyticsProvider projectId="${projectId}">
            {children}
          </NextAnalyticsProvider>
        </body>
      </html>
    );
  }`;
 
  const react = `import { OTMProvider } from "@otm/sdk/react";

  export function AppRoot() {
    return (
      <OTMProvider projectId="${projectId}">
        <App />
      </OTMProvider>
    );
  }`;

  const vanilla = `import { createAnalytics } from "@otm/sdk";

  const otm = createAnalytics({
    projectId: "${projectId}",
  });

  otm.track("hello_world", { source: "local-dev" });`;

  return {
    html,
    next,
    react,
    vanilla,
  };
}
