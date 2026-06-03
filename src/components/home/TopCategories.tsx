import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FolderOpen } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import HomeSectionShell from '@/components/home/HomeSectionShell';

export interface TopCategory {
  _id?: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

interface TopCategoriesProps {
  categories: TopCategory[];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <HomeSectionShell>
      <SectionHeader
        eyebrow="Browse by Mood"
        title="Top Categories"
        href="/categories"
        linkLabel="View all"
        compact
      />

      <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 sm:gap-4 sm:overflow-visible scrollbar-hide">
        {categories.map((cat) => (
          <Link
            key={cat._id || cat.slug}
            href={`/categories/${cat.slug}`}
            className="group relative flex-shrink-0 w-[42vw] max-w-[160px] sm:w-auto sm:max-w-none overflow-hidden rounded-2xl border border-emerald-100/80 bg-white shadow-sm aspect-[4/5] sm:aspect-[3/4]"
          >
            {cat.image_url ? (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 42vw, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center">
                <FolderOpen size={28} className="text-emerald-200" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-3">
              <h3 className="text-white text-sm md:text-base font-serif leading-tight line-clamp-2">
                {cat.name}
              </h3>
              <span className="mt-1.5 inline-flex items-center text-[9px] uppercase tracking-widest text-white/75 group-hover:text-white transition-colors">
                Explore <ArrowRight size={10} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/categories"
        className="sm:hidden mt-4 block w-full text-center py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-950 border border-emerald-200/80 bg-white/80 hover:bg-white transition-colors rounded-lg"
      >
        View all categories
      </Link>
    </HomeSectionShell>
  );
}
