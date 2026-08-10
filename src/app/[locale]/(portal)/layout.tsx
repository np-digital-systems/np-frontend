import React from "react";

export default function PortalRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-theme min-h-screen bg-background text-foreground antialiased selection:bg-[rgba(0,113,227,0.15)] selection:text-[#0071E3]">
      {children}
    </div>
  );
}
