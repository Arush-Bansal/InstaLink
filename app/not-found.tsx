"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileQuestion, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-emerald-50/30 text-slate-900 p-4">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Icon/Graphic */}
        <div className="w-24 h-24 rounded-3xl bg-white border-2 border-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-500/10 mb-4 animate-float">
          <FileQuestion className="w-12 h-12 text-emerald-500" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-emerald-950">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Page Not Found
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Oops! The link you're looking for seems to be broken or doesn't exist. It might be a great opportunity to claim it for yourself!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <Button asChild variant="outline" size="lg" className="w-full h-12 border-emerald-200 text-emerald-800 hover:bg-emerald-50">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back Home
            </Link>
          </Button>
          
          <Button asChild variant="gradient" size="lg" className="w-full h-12 shadow-lg shadow-emerald-500/20">
            <Link href="/?claim=true">
              Claim Link <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

      </div>

      {/* Footer-like element */}
      <div className="absolute bottom-8 text-sm text-muted-foreground">
        InstaLink &copy; {new Date().getFullYear()}
      </div>

    </main>
  );
}
