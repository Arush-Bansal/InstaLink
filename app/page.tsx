"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Sparkles, Zap, Loader2 } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('instaLinkUser');
    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (data.success) {
        // Store user in localStorage for MVP session
        localStorage.setItem('instaLinkUser', JSON.stringify(data.user));
        router.push("/admin");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      
      {/* Hero Content */}
      <div className="z-10 w-full max-w-3xl text-center space-y-8 animate-float">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
          <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
          <span className="text-sm font-medium text-white/80">The Premium Link-in-Bio Experience</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Claim your <br />
          <span className="text-gradient">InstaLink</span> today
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
          Enter your username to login or create a new profile instantly. No passwords, just creativity.
        </p>

        {loggedInUser ? (
           <div className="flex flex-col items-center gap-4 mt-10">
             <div className="text-xl font-medium text-white/80">
               Welcome back, <span className="text-purple-400">@{loggedInUser.username}</span>
             </div>
             <Button 
               size="lg" 
               variant="gradient"
               className="h-14 px-8 text-lg font-semibold shadow-lg shadow-purple-500/20"
               onClick={() => router.push('/admin')}
             >
               Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
             <button 
               onClick={() => {
                 localStorage.removeItem('instaLinkUser');
                 setLoggedInUser(null);
               }}
               className="text-sm text-white/40 hover:text-white/60 transition-colors"
             >
               Switch Account
             </button>
           </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto mt-10">
            <Input 
              placeholder="username" 
              className="h-14 text-lg bg-white/5 border-white/10 focus:border-purple-500/50 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              size="lg" 
              variant="gradient"
              className="h-14 px-8 text-lg font-semibold shadow-lg shadow-purple-500/20"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Started <ArrowRight className="w-5 h-5 ml-2" /></>}
            </Button>
          </form>
        )}
        
        <div className="pt-8 flex items-center justify-center gap-8 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Instant Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>MongoDB Powered</span>
          </div>
        </div>
      </div>
    </main>
  );
}
