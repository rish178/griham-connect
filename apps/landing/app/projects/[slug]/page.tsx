import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectEntry } from "@/lib/projectRegistry";
import Container from "@/components/ui/Container";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getProjectEntry(slug);
  if (!entry?.seo) return {};

  const { title, description } = entry.seo;
  const ogImage = entry.project.heroImage;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title,
      description,
      url: `/projects/${slug}`,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getProjectEntry(slug);
  if (!entry) notFound();

  // Projects with a bespoke landing page render it full-bleed, without the
  // shared site chrome — this route sits outside the (site) layout group.
  if (entry.Page) {
    const { Page } = entry;
    return (
      <>
        {entry.seo?.jsonLd && (
          // eslint-disable-next-line react/no-danger
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(entry.seo.jsonLd) }}
          />
        )}
        <Page />
      </>
    );
  }

  const { project } = entry;

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {project.builder} · {project.location}
      </p>
      <p className="mt-6 max-w-2xl">{project.description}</p>
      <p className="mt-8 text-xs uppercase tracking-[0.1em] text-gold">
        RERA: {project.reraId}
      </p>
    </Container>
  );
}
