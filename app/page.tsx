"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Sparkles, Zap, Loader2, TrendingUp, Palette, ShoppingBag, Instagram, Globe, Layout } from "lucide-react";

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
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-[#0a0a0a]">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 relative z-10">
        <div className="w-full max-w-4xl text-center space-y-8 animate-float">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-xl shadow-emerald-900/10">
            <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
            <span className="text-sm font-medium text-white/90 tracking-wide">The Bio Link for Fashion Creators</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
            Your Digital <br />
            <span className="text-gradient">Runway Awaits</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Turn your followers into customers with a bio page designed for the visual web. Higher clicks, better conversion, and editorial-grade aesthetics.
          </p>

          {loggedInUser ? (
             <div className="flex flex-col items-center gap-4 mt-10">
               <div className="text-xl font-medium text-white/80">
                 Welcome back, <span className="text-emerald-400">@{loggedInUser.username}</span>
               </div>
               <Button 
                 size="lg" 
                 variant="gradient"
                 className="h-14 px-8 text-lg font-semibold shadow-lg shadow-emerald-500/20 rounded-full"
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
                 LogOut
               </button>
             </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto mt-12 w-full">
              <div className="relative flex-grow">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">instalink.com/</span>
                <Input 
                  placeholder="yourname" 
                  className="h-14 pl-32 text-lg bg-white/5 border-white/10 focus:border-emerald-500/50 transition-all rounded-xl"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                size="lg" 
                variant="gradient"
                className="h-14 px-8 text-lg font-semibold shadow-lg shadow-emerald-500/20 rounded-xl whitespace-nowrap"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Claim Link <ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </form>
          )}
          
          <div className="pt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/40 text-sm font-medium uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>3x Higher Conversion</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              <span>Editorial Themes</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant Load</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-32 px-4 md:px-24 bg-white/5 backdrop-blur-sm border-y border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for <span className="text-gradient">Visual Storytellers</span></h2>
            <p className="text-white/60 text-xl max-w-3xl mx-auto">
              Fashion isn't just about links; it's about the look. Standard bio tools are text-heavy and boring. InstaLink is built to showcase your aesthetic and drive sales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Shop Your Look",
                description: "Seamlessly integrate affiliate links and product pages. Make it easy for followers to buy what you're wearing.",
                icon: <ShoppingBag className="w-8 h-8 text-pink-400" />
              },
              {
                title: "Visual-First Layouts",
                description: "Break free from the list. Use grids, carousels, and hero images to create a mini-website that feels like a magazine.",
                icon: <Layout className="w-8 h-8 text-blue-400" />
              },
              {
                title: "Brand Partnerships",
                description: "Showcase your collaborations with dedicated sections that highlight your partners and drive ROI.",
                icon: <Sparkles className="w-8 h-8 text-yellow-400" />
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 group border border-white/5 hover:border-emerald-500/20">
                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-4 md:px-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-20 gap-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">From Post to <span className="text-gradient">Purchase</span></h2>
              <p className="text-white/60 text-lg max-w-md">Your audience wants to know where you got that. Tell them in seconds.</p>
            </div>
            <Button variant="outline" className="rounded-full px-8 border-white/20 hover:bg-white/10">
              Start Building Now
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 z-0" />

            {[
              {
                step: "01",
                title: "Claim Your Handle",
                description: "Secure your unique URL. It's your new digital business card."
              },
              {
                step: "02",
                title: "Curate Your Space",
                description: "Upload your best shots, link your outfits, and apply a theme that matches your feed."
              },
              {
                step: "03",
                title: "Launch & Convert",
                description: "Drop the link in your bio and watch your engagement and affiliate revenue soar."
              }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="w-20 h-20 rounded-full bg-[#0a0a0a] border-2 border-emerald-500/30 flex items-center justify-center text-2xl font-bold text-emerald-400 mb-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">{step.title}</h3>
                <p className="text-white/60 max-w-xs text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-32 px-4 md:px-24 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-20">Trusted by <span className="text-gradient">Style Icons</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "My conversion rate doubled when I switched. The visual layout just makes sense for fashion content.",
                author: "Elena R.",
                role: "Fashion Blogger, NYC",
                handle: "@elena.styles"
              },
              {
                quote: "Finally, a bio link that doesn't look like a spreadsheet. It actually complements my Instagram feed.",
                author: "Marcus K.",
                role: "Streetwear Stylist",
                handle: "@marcus.fits"
              },
              {
                quote: "The ability to customize the theme to match my brand colors exactly is a game changer.",
                author: "Sophia L.",
                role: "Beauty Influencer",
                handle: "@sophia.glam"
              }
            ].map((testimonial, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl flex flex-col justify-between h-full">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => (
                      <Sparkles key={star} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    ))}
                  </div>
                  <p className="text-xl text-white/90 mb-8 font-light italic">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500" />
                  <div>
                    <div className="font-bold text-white">{testimonial.author}</div>
                    <div className="text-sm text-white/40">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4 md:px-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is InstaLink optimized for mobile?",
                a: "100%. We prioritize mobile-first design because that's where your audience lives. Your page will look flawless on any device."
              },
              {
                q: "Can I track my link clicks?",
                a: "Yes. Our dashboard provides detailed analytics so you can see exactly which links are performing best and where your traffic is coming from."
              },
              {
                q: "How is this different from other link tools?",
                a: "We focus specifically on visual creators. Our layouts, themes, and features are built to showcase imagery and drive conversion, not just list text links."
              }
            ].map((faq, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl hover:border-emerald-500/30 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-white">{faq.q}</h3>
                <p className="text-white/60 text-lg leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 text-center text-white/40 bg-black">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-2xl text-white tracking-tight">InstaLink</span>
        </div>
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
        </div>
        <p>&copy; 2024 InstaLink. Designed for Creators.</p>
      </footer>

    </main>
  );
}
