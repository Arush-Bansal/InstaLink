"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Sparkles, Zap, Loader2, TrendingUp, Palette, ShoppingBag, Instagram, Globe, Layout } from "lucide-react";

import { toast } from "sonner";

import { Suspense } from "react";

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<'login' | 'claim'>('claim');
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [claimError, setClaimError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isEmailSignup, setIsEmailSignup] = useState(false);

  useEffect(() => {
    // Check for error and claim params
    const error = searchParams.get('error');
    const claim = searchParams.get('claim');

    if (error === 'already_connected' && claim) {
      setView('claim');
      setUsername(claim);
      const msg = 'That account is already connected to another link. Please sign in with a different account.';
      setClaimError(msg);
      // Small delay to ensure toast shows up after navigation/render
      setTimeout(() => toast.error(msg), 100);
      
      // Trigger availability check for the claimed name so they can try again
      checkAvailability(claim);
    } else if (error === 'AccountExistsWithPassword') {
       setView('login');
       setAuthError('Account exists with password. Please sign in with your email and password.');
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const isSignup = view === 'claim';
    
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      username: isSignup ? username : undefined,
      callbackUrl: '/dashboard'
    });

    if (res?.error) {
       if (res.error.includes("Account exists with Google")) {
           setAuthError("This email is linked to a Google account. Please sign in with Google.");
       } else if (res.error.includes("Invalid password")) {
           setAuthError("Invalid password.");
       } else if (res.error.includes("Account does not exist")) {
           setAuthError("Account does not exist. Please sign up.");
       } else {
           if (res.error.includes("E11000") || res.error.includes("duplicate key")) {
             setAuthError("An account with this email or username already exists.");
           } else {
             setAuthError("Authentication failed. Please try again.");
           }
       }
    } else {
      router.push('/dashboard');
    }
  };

  const checkAvailability = async (name: string) => {
    if (!name || name.length < 3) {
      setIsAvailable(null);
      return;
    }
    
    setIsChecking(true);
    try {
      const res = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
      const data = await res.json();
      if (data.error) {
         setIsAvailable(false);
      } else {
         setIsAvailable(data.available);
      }
    } catch (err) {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'claim' && username.length >= 3) {
        checkAvailability(username);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, view]);


  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-emerald-50/30 text-slate-900">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 relative z-10">
        <div className="w-full max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-emerald-100 bg-white/60 backdrop-blur-md mb-4 shadow-sm shadow-emerald-900/5">
            <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-sm font-medium text-emerald-900/80 tracking-wide">The Bio Link for Fashion Creators</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
            Your Digital <br />
            <span className="text-gradient">Runway Awaits</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Turn your followers into customers with a bio page designed for the visual web. Higher clicks, better conversion, and editorial-grade aesthetics.
          </p>

          {status === "loading" ? (
             <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : session ? (
             <div className="flex flex-col items-center gap-4 mt-10">
               <div className="text-xl font-medium text-foreground/80">
                 Welcome back, <span className="text-emerald-600">{session.user?.name}</span>
               </div>
               <Button 
                 size="lg" 
                 variant="gradient"
                 className="h-14 px-8 text-lg font-semibold shadow-lg shadow-emerald-500/20 rounded-full"
                 onClick={() => router.push('/dashboard')}
               >
                 Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
               <button 
                 onClick={() => signOut()}
                 className="text-sm text-muted-foreground hover:text-foreground transition-colors"
               >
                 LogOut
               </button>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-6 max-w-lg mx-auto mt-12 w-full min-h-[200px] justify-center transition-all duration-500">
              
              {/* LOGIN VIEW */}
              {view === 'login' && (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <Button 
                    size="lg" 
                    variant="gradient"
                    className="h-14 px-8 text-lg font-semibold shadow-lg shadow-emerald-500/20 rounded-xl w-full"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  >
                    <span className="mr-2">Sign in with Google</span> <ArrowRight className="w-5 h-5" />
                  </Button>
                  
                  <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-emerald-100"></div>
                      <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">Or with Email</span>
                      <div className="flex-grow border-t border-emerald-100"></div>
                  </div>

                  <form onSubmit={handleCredentialsLogin} className="space-y-3">
                      <Input 
                          type="email" 
                          placeholder="Email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          required 
                          className="h-12 bg-white/80"
                      />
                      <Input 
                          type="password" 
                          placeholder="Password" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          required 
                          className="h-12 bg-white/80"
                      />
                      {authError && <p className="text-red-500 text-sm font-medium">{authError}</p>}
                      <Button type="submit" className="w-full h-12 font-semibold" variant="outline">Sign In</Button>
                  </form>

                  <button onClick={() => setView('claim')} className="text-sm text-muted-foreground hover:text-emerald-600 underline">
                    Back to Claim
                  </button>
                </div>
              )}

              {/* CLAIM VIEW (Default) */}
              {view === 'claim' && (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-medium">
                      instalink.com/
                    </div>
                    <Input 
                      autoFocus
                      placeholder="yourname" 
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setClaimError('');
                      }}
                      className={`h-14 pl-32 text-lg font-medium bg-white border-2 ${
                        claimError ? 'border-red-300 focus:border-red-500' :
                        isAvailable === true ? 'border-emerald-400 focus:border-emerald-500' : 
                        isAvailable === false ? 'border-red-300 focus:border-red-500' :
                        'border-emerald-100 focus:border-emerald-500'
                      } rounded-xl shadow-sm transition-all`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      {isChecking ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> :
                       isAvailable === true ? <div className="flex items-center text-emerald-600 text-sm font-bold"><Sparkles className="w-4 h-4 mr-1" /> Available</div> :
                       isAvailable === false ? <span className="text-red-500 text-sm font-bold">Taken</span> : null}
                    </div>
                  </div>

                  {claimError && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                      {claimError}
                    </div>
                  )}
                  
                  {isAvailable === true && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <Button 
                          size="lg" 
                          variant="gradient"
                          className="h-14 px-8 text-lg font-semibold shadow-lg shadow-emerald-500/20 rounded-xl w-full"
                          onClick={() => signIn("google", { callbackUrl: `/dashboard?claim=${username}` })}
                        >
                          Claim with Google <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        
                        {!isEmailSignup ? (
                            <Button 
                                variant="outline" 
                                onClick={() => setIsEmailSignup(true)} 
                                className="w-full h-12 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                            >
                                Claim with Email
                            </Button>
                        ) : (
                            <form onSubmit={handleCredentialsLogin} className="space-y-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-sm">
                                <h3 className="text-sm font-semibold text-emerald-900 mb-1">Create Account for @{username}</h3>
                                <Input 
                                    type="email" 
                                    placeholder="Email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="bg-white"
                                />
                                <Input 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    className="bg-white"
                                />
                                {authError && <p className="text-red-500 text-sm font-medium">{authError}</p>}
                                <Button type="submit" className="w-full" variant="gradient">Create Account</Button>
                            </form>
                        )}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-emerald-100"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">Or</span>
                        <div className="flex-grow border-t border-emerald-100"></div>
                    </div>
                    <Button 
                        variant="outline"
                        size="lg"
                        onClick={() => setView('login')}
                        className="h-12 w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                    >
                        Login to Existing Account
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">No credit card required.</p>
            </div>
          )}
          
          <div className="pt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-muted-foreground/80 text-sm font-medium uppercase tracking-wider">
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
      <section className="py-32 px-4 md:px-24 bg-emerald-50/30 backdrop-blur-sm border-y border-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-b from-emerald-100/20 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">Designed for <span className="text-gradient">Visual Storytellers</span></h2>
            <p className="text-slate-600 text-xl max-w-3xl mx-auto">
              Fashion isn't just about links; it's about the look. Standard bio tools are text-heavy and boring. InstaLink is built to showcase your aesthetic and drive sales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Shop Your Look",
                description: "Seamlessly integrate affiliate links and product pages. Make it easy for followers to buy what you're wearing.",
                icon: <ShoppingBag className="w-8 h-8 text-teal-500" />
              },
              {
                title: "Visual-First Layouts",
                description: "Break free from the list. Use grids, carousels, and hero images to create a mini-website that feels like a magazine.",
                icon: <Layout className="w-8 h-8 text-emerald-500" />
              },
              {
                title: "Brand Partnerships",
                description: "Showcase your collaborations with dedicated sections that highlight your partners and drive ROI.",
                icon: <Sparkles className="w-8 h-8 text-green-500" />
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-10 rounded-3xl hover:bg-white/80 transition-all duration-500 group border border-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="mb-6 p-4 bg-emerald-50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-emerald-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
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
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">From Post to <span className="text-gradient">Purchase</span></h2>
              <p className="text-slate-600 text-lg max-w-md">Your audience wants to know where you got that. Tell them in seconds.</p>
            </div>
            <Button variant="outline" className="rounded-full px-8 border-emerald-100 hover:bg-emerald-50 text-foreground">
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
                <div className="w-20 h-20 rounded-full bg-white border-2 border-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600 mb-8 shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-600 transition-colors text-slate-900">{step.title}</h3>
                <p className="text-slate-600 max-w-xs text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-32 px-4 md:px-24 bg-emerald-50/30 backdrop-blur-sm border-y border-emerald-100">
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
                  <p className="text-xl text-slate-700 mb-8 font-light italic">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500" />
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
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
              <div key={i} className="glass-card p-8 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-slate-900">{faq.q}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-emerald-100 text-center text-muted-foreground bg-white">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-2xl text-foreground tracking-tight">InstaLink</span>
        </div>
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
        </div>
        <p>&copy; 2024 InstaLink. Designed for Creators.</p>
      </footer>

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
