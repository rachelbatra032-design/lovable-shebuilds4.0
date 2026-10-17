import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle, RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { logClientError } from "@/lib/client-error-log";
import { isModuleLoadError, recoverModuleLoad } from "@/lib/module-recovery";

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const moduleError = isModuleLoadError(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "route_error_screen" });
    logClientError(error, "error-boundary");
    recoverModuleLoad(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-5"><Brand /></header>
      <section className="m-auto w-full max-w-lg px-6 py-16 text-center" aria-labelledby="load-error-title" role="alert">
        <AlertTriangle className="mx-auto mb-5 h-10 w-10 text-terracotta" aria-hidden />
        <h1 id="load-error-title" className="text-4xl">This page couldn’t load</h1>
        <p className="mt-4 text-muted-foreground">{moduleError
          ? "Automatic recovery couldn’t finish loading this page. Check your connection, then retry. Your saved work is still there."
          : "Something interrupted this page. Your saved work is still there. Please retry or return to the start."}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={() => {
            if (moduleError) { window.location.reload(); return; }
            void router.invalidate().then(() => reset());
          }}><RotateCw /> Retry page</Button>
          <Button asChild variant="outline"><a href="/"><ArrowLeft /> Back to start</a></Button>
        </div>
      </section>
    </main>
  );
}