"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Github, Instagram, Linkedin, Twitter, Globe, ShoppingBag, ExternalLink, Mail, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";

interface LinkData {
  title: string;
  url: string;
}

interface StoreItem {
  title: string;
  image: string;
  price: string;
  url?: string;
}

interface UserData {
  username: string;
  title: string;
  bio: string;
  image: string;
  links: LinkData[];
  storeItems?: StoreItem[];
  themeColor: string;
}

// Helper function to get theme colors
const getThemeColors = (theme: string) => {
  const themes: Record<string, { gradient: string; accent: string; ring: string }> = {
    verdant: { 
      gradient: 'from-emerald-900/20 via-background to-background', 
      accent: 'from-emerald-500/20 to-green-500/20',
      ring: 'from-emerald-400 via-green-500 to-teal-600'
    },
    indigo: { 
      gradient: 'from-indigo-900/20 via-background to-background', 
      accent: 'from-indigo-500/20 to-purple-500/20',
      ring: 'from-yellow-400 via-red-500 to-purple-600'
    },
    purple: { 
      gradient: 'from-purple-900/20 via-background to-background', 
      accent: 'from-purple-500/20 to-pink-500/20',
      ring: 'from-purple-400 via-pink-500 to-rose-600'
    },
    rose: { 
      gradient: 'from-rose-900/20 via-background to-background', 
      accent: 'from-rose-500/20 to-pink-500/20',
      ring: 'from-rose-400 via-pink-500 to-red-600'
    },
    amber: { 
      gradient: 'from-amber-900/20 via-background to-background', 
      accent: 'from-amber-500/20 to-orange-500/20',
      ring: 'from-amber-400 via-orange-500 to-red-600'
    },
    cyan: { 
      gradient: 'from-cyan-900/20 via-background to-background', 
      accent: 'from-cyan-500/20 to-blue-500/20',
      ring: 'from-cyan-400 via-blue-500 to-indigo-600'
    },
  };
  return themes[theme] || themes.indigo;
};

const fetchUser = async (username: string) => {
  const res = await fetch(`/api/user/${username}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  return data.user;
};

export default function PublicProfile() {
  const params = useParams();
  const username = params?.username as string;
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');

  const { data: user, isLoading, isError } = useQuery<UserData>({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen pb-20">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background" />
        <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-20 space-y-8">
          <div className="text-center text-white/60">Loading...</div>
        </div>
      </main>
    );
  }

  if (isError || !user) {
    notFound();
  }

  const themeColors = getThemeColors(user.themeColor || 'indigo');

  return (
    <main className="min-h-screen pb-20">
      {/* Background Elements */}
      <div className={`fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${themeColors.gradient}`} />

      <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-20 space-y-8">
        
        {/* Header Section - Glass Card Style */}
        <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 animate-float">
          <div className="relative w-32 h-32 shrink-0">
             <div className={`w-full h-full rounded-full p-1 bg-gradient-to-tr ${themeColors.ring}`}>
                <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                   {user.image ? (
                     <Image src={user.image} alt={user.title} fill className="object-cover" />
                   ) : (
                     <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl uppercase">
                       {user.username.charAt(0)}
                     </div>
                   )}
                </div>
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{user.title}</h1>
              <p className="text-white/60 mt-2">{user.bio}</p>
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
            Quick Links
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'shop' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
          >
            Shop
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'links' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.links.map((link, i) => (
              <Card 
                key={i} 
                className={`group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden relative aspect-[4/3] flex flex-col justify-between p-5 border-white/5 bg-white/5 hover:bg-white/10 ${i === 0 ? `col-span-2 md:col-span-2 aspect-[2/1] bg-gradient-to-br ${themeColors.accent}` : ''}`}
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-white/60" />
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white/60 group-hover:text-white transition-colors ${i === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                   <Globe className="w-5 h-5" />
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
            {/* Featured Store Items */}
            {user.storeItems && user.storeItems.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-400" /> Featured Products
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user.storeItems.map((item, i) => (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <p className="text-xs text-white/60 mb-2">{item.price}</p>
                          <Button size="sm" className="w-full rounded-lg bg-white text-black hover:bg-white/90">Buy Now</Button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/40 py-12">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No store items available yet</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-10 pb-6">
           <p className="text-xs text-white/20">Powered by InstaLink</p>
        </div>

      </div>
    </main>
  );
}
