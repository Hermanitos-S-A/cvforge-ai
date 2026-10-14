import Image from "next/image";

export function BrandLogo({ size = 34, withText = true }: { size?: number; withText?: boolean }) {
  return <span className="inline-flex items-center gap-2 font-bold tracking-tight text-current">
    <Image src="/epersona-logo.png" alt="Logo ePersona" width={size} height={size}
      className="shrink-0 rounded-lg object-contain" priority />
    {withText && <span className="text-inherit">ePersona</span>}
  </span>;
}
