"use client";

import Link from 'next/link';
import Image from 'next/image';

type LogoProps = {
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
};

const Logo = ({
  className = '',
  imgClassName = '',
  width = 140,
  height = 56,
}: LogoProps) => {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Decume"
        width={width}
        height={height}
        priority
        className={imgClassName}
      />
      <span className="sr-only">Decume</span>
    </Link>
  );
};

export default Logo;
