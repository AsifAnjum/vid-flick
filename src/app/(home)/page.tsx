import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export default async function Home() {
  void trpc.hello.prefetch({ text: "Asif" });
  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading....</p>}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <h1>Hola</h1>
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
