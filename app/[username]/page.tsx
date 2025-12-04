"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Github, Instagram, Linkedin, Twitter, Globe, ShoppingBag, ExternalLink, Mail, ArrowUpRight, Search } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
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
      gradient: 'from-emerald-100 via-background to-background', 
      accent: 'from-emerald-100 to-green-100',
      ring: 'from-emerald-400 via-green-500 to-teal-600'
    },
    indigo: { 
      gradient: 'from-indigo-100 via-background to-background', 
      accent: 'from-indigo-100 to-purple-100',
      ring: 'from-indigo-400 via-purple-500 to-indigo-600'
    },
    purple: { 
      gradient: 'from-purple-100 via-background to-background', 
      accent: 'from-purple-100 to-pink-100',
      ring: 'from-purple-400 via-pink-500 to-rose-600'
    },
    rose: { 
      gradient: 'from-rose-100 via-background to-background', 
      accent: 'from-rose-100 to-pink-100',
      ring: 'from-rose-400 via-pink-500 to-red-600'
    },
    amber: { 
      gradient: 'from-amber-100 via-background to-background', 
      accent: 'from-amber-100 to-orange-100',
      ring: 'from-amber-400 via-orange-500 to-red-600'
    },
    cyan: { 
      gradient: 'from-cyan-100 via-background to-background', 
      accent: 'from-cyan-100 to-blue-100',
      ring: 'from-cyan-400 via-blue-500 to-indigo-600'
    },
  };
  return themes[theme] || themes.verdant;
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
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user, isLoading, isError } = useQuery<UserData>({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen pb-20 bg-background text-foreground">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-background to-background" />
        <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-20 space-y-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  if (isError || !user) {
    notFound();
  }

  const themeColors = getThemeColors(user.themeColor || 'indigo');

  const filteredStoreItems = useMemo(() => {
    if (!user?.storeItems) return [];
    if (!searchQuery) return user.storeItems;

    const fuse = new Fuse(user.storeItems, {
      keys: ['title', 'price'],
      threshold: 0.4, // Adjusts sensitivity: 0.0 is exact match, 1.0 is match anything
    });

    return fuse.search(searchQuery).map(result => result.item);
  }, [user?.storeItems, searchQuery]);

  return (
    <main className="min-h-screen pb-20 bg-emerald-50/30 text-slate-900">
      {/* Background Elements */}
      <div className={`fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${themeColors.gradient}`} />

      <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-20 space-y-8">
        
        {/* Header Section - Glass Card Style */}
        <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 animate-float">
          <div className="relative w-32 h-32 shrink-0">
             <div className={`w-full h-full rounded-full p-1 bg-gradient-to-tr ${themeColors.ring}`}>
                <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                   {user.image ? (
                     <Image src={user.image} alt={user.title} fill className="object-cover" />
                   ) : (
                     <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-4xl uppercase text-emerald-600">
                       {user.username.charAt(0)}
                     </div>
                   )}
                </div>
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user.title}</h1>
              <p className="text-muted-foreground mt-2">{user.bio}</p>
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
        <div className="flex p-1 bg-white/50 rounded-xl backdrop-blur-sm border border-emerald-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'links' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Quick Links
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'shop' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
                className={`group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden relative aspect-[4/3] flex flex-col justify-between p-5 border-emerald-100 bg-white hover:shadow-md hover:shadow-emerald-500/5 ${i === 0 ? `col-span-2 md:col-span-2 aspect-[2/1] bg-gradient-to-br ${themeColors.accent}` : ''}`}
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors ${i === 0 ? 'bg-white/40' : 'bg-muted'}`}>
                   <Globe className="w-5 h-5" />
                </div>

                <div>
                  <h3 className={`font-semibold leading-tight text-foreground ${i === 0 ? 'text-xl' : 'text-base'}`}>{link.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{link.url.replace(/^https?:\/\//, '')}</p>
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

                {user.storeItems.length > 2 && (
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredStoreItems.map((item, i) => (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-emerald-100 shadow-sm">
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                          <h3 className="font-medium text-sm text-white">{item.title}</h3>
                          <p className="text-xs text-white/80 mb-2">{item.price}</p>
                          <Button size="sm" className="w-full rounded-lg bg-white text-emerald-900 hover:bg-white/90">Buy Now</Button>
                        </div>
                    </div>
                  ))}
                  {filteredStoreItems.length === 0 && (
                     <div className="col-span-full text-center py-8 text-muted-foreground">
                        No products found matching "{searchQuery}"
                     </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No store items available yet</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-10 pb-6">
           <p className="text-xs text-muted-foreground">Powered by InstaLink</p>
        </div>

      </div>
    </main>
  );
}
