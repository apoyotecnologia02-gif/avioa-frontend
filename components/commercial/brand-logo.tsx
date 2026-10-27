"use client";

import Image from "next/image";

export default function BrandLogo({
  width = 120,
  height = 44,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/avioa-logo.png"
      alt="aVioa · Agencia de Viajes"
      width={width}
      height={height}
      className="object-contain"
      priority
    />
  );
}