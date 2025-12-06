"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-emerald-50/30"><Loader2 className="animate-spin text-emerald-600" /></div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // @ts-ignore
  if (session?.user?.username) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (data.success) {
        // Force session update or redirect
        // Ideally we should reload the session, but a hard reload of the page works too
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Failed to claim username");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-emerald-50/30 text-slate-900 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Claim your handle</h1>
          <p className="text-slate-600">Choose a unique username for your InstaLink profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-medium">instalink.com/</span>
              <Input 
                placeholder="username" 
                className="h-14 pl-32 text-lg bg-white border-emerald-100 focus:border-emerald-500 transition-all rounded-xl text-foreground placeholder:text-muted-foreground/50 shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium px-1">{error}</p>}
          </div>

          <Button 
            size="lg" 
            variant="gradient"
            className="w-full h-12 text-lg font-semibold shadow-lg shadow-emerald-500/20 rounded-xl"
            type="submit"
            disabled={isLoading || !username}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </form>
      </div>
    </main>
  );
}
