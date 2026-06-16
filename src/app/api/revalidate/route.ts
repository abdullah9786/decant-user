import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { paths?: string[]; tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paths = body.paths ?? [];
  const tags = body.tags ?? [];

  for (const tag of tags) {
    if (typeof tag === "string" && tag.trim()) {
      // Immediate invalidation for webhook-triggered on-demand revalidation.
      revalidateTag(tag.trim(), { expire: 0 });
    }
  }

  for (const path of paths) {
    if (typeof path === "string" && path.trim()) {
      revalidatePath(path.trim());
    }
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    tags,
  });
}
