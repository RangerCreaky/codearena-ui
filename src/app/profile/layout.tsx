"use client";

import { Navbar } from "@/components/layout/navbar";
import { MatrixRain } from "@/components/landing/matrix-rain";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <MatrixRain />
      </div>
      <main className="pt-16 min-h-screen relative">{children}</main>
    </>
  );
}
