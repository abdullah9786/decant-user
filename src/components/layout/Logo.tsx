"use client";

import Link from 'next/link';

type LogoProps = {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
};

const Logo = ({
  className = '',
  textClassName = '',
  iconClassName = '',
}: LogoProps) => {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <span
        className={`text-2xl sm:text-3xl font-extrabold italic tracking-tighter text-emerald-950 ${textClassName}`}
        style={{ fontFamily: "var(--font-playfair), 'Times New Roman', serif" }}
      >
        Decume
      </span>
    </Link>
  );
};

export default Logo;
