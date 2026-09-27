import Container from "@/components/ui/Container";

// Wildcard-subdomain resolution (signature-sarvam.grihamconnect.com -> this
// project's page) now happens server-side in proxy.ts, not here — the old
// SPA did it in a client useEffect, which meant a blank flash before the
// redirect fired. This page only renders for the bare marketing domain.
export default function HomePage() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-4xl font-bold">Griham Connect</h1>
      <p className="mt-4 text-lg text-gray-600">
        Real estate landing pages, built and deployed per project.
      </p>
    </Container>
  );
}
