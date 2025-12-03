"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Github, Instagram, Linkedin, Twitter, Globe, ShoppingBag, ExternalLink, Mail, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LinkData {
  title: string;
  url: string;
}

interface ProfileData {
  title: string;
  description: string;
  image: string;
  links: LinkData[];
}

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem('instaLinkData');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      // Redirect back if no data
      router.push('/');
    }
  }, [router]);

  if (!data) return null;

  return (
    <main className="min-h-screen pb-20">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background" />

      <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-20 space-y-8">
        
        {/* Header Section - Glass Card Style */}
        <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 animate-float">
          <div className="relative w-32 h-32 shrink-0">
             <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                   {data.image ? (
                     <Image src={data.image} alt={data.title} fill className="object-cover" />
                   ) : (
                     <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl">
                       {data.title.charAt(0)}
                     </div>
                   )}
                </div>
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{data.title}</h1>
              <p className="text-white/60 mt-2">{data.description}</p>
            </div>
            
            <div className="flex gap-3 justify-center md:justify-start">
               <Button size="sm" variant="outline" className="rounded-full">
                 <Mail className="w-4 h-4 mr-2" /> Contact
               </Button>
               <Button size="sm" variant="outline" className="rounded-full">
                 <Globe className="w-4 h-4 mr-2" /> Website
               </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
          <button 
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'links' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
          >
            Links & Content
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'shop' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
          >
            Shop & Store
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'links' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.links.map((link, i) => (
              <Card 
                key={i} 
                className={`group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden relative aspect-[4/3] flex flex-col justify-between p-5 border-white/5 bg-white/5 hover:bg-white/10 ${i === 0 ? 'col-span-2 md:col-span-2 aspect-[2/1] bg-gradient-to-br from-indigo-500/20 to-purple-500/20' : ''}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-white/60" />
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white/60 group-hover:text-white transition-colors ${i === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                   {i % 3 === 0 ? <Globe className="w-5 h-5" /> : i % 3 === 1 ? <Github className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className={`font-semibold leading-tight ${i === 0 ? 'text-xl' : 'text-base'}`}>{link.title}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-1">{link.url.replace(/^https?:\/\//, '')}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Store Items (Generated) */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" /> Featured Products
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <Image 
                      src="/store/tshirt.png" 
                      alt="Minimalist Tee" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                      <h3 className="font-medium text-sm">Minimalist Tee</h3>
                      <p className="text-xs text-white/60 mb-2">$35.00</p>
                      <Button size="sm" className="w-full rounded-lg bg-white text-black hover:bg-white/90">Buy Now</Button>
                    </div>
                </div>

                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <Image 
                      src="/store/art.png" 
                      alt="Abstract Print" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                      <h3 className="font-medium text-sm">Abstract Print</h3>
                      <p className="text-xs text-white/60 mb-2">$120.00</p>
                      <Button size="sm" className="w-full rounded-lg bg-white text-black hover:bg-white/90">Buy Now</Button>
                    </div>
                </div>
                
                 <div className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <Image 
                      src="/store/pack.png" 
                      alt="Digital Asset Pack" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                      <h3 className="font-medium text-sm">Digital Asset Pack</h3>
                      <p className="text-xs text-white/60 mb-2">$49.00</p>
                      <Button size="sm" className="w-full rounded-lg bg-white text-black hover:bg-white/90">Buy Now</Button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-10 pb-6">
           <p className="text-xs text-white/20">Powered by InstaLink</p>
        </div>

      </div>
    </main>
  );
}
