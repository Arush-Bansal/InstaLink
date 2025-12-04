"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Github, Instagram, Linkedin, Twitter, Globe, ShoppingBag, ExternalLink, Mail, ArrowUpRight, Search, Share2 } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { notFound, useParams } from "next/navigation";

interface LinkData {
  title: string;
  url: string;
  _id?: string;
}

interface StoreItem {
  title: string;
  image: string;
  price: string;
  url?: string;
  _id?: string;
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
  const themes: Record<string, { gradient: string; accent: string; ring: string; text: string; bg: string }> = {
    verdant: { 
      gradient: 'from-emerald-50 via-background to-background', 
      accent: 'bg-emerald-500',
      ring: 'ring-emerald-100',
      text: 'text-emerald-900',
      bg: 'bg-emerald-50/50'
    },
    indigo: { 
      gradient: 'from-indigo-50 via-background to-background', 
      accent: 'bg-indigo-500',
      ring: 'ring-indigo-100',
      text: 'text-indigo-900',
      bg: 'bg-indigo-50/50'
    },
    purple: { 
      gradient: 'from-purple-50 via-background to-background', 
      accent: 'bg-purple-500',
      ring: 'ring-purple-100',
      text: 'text-purple-900',
      bg: 'bg-purple-50/50'
    },
    rose: { 
      gradient: 'from-rose-50 via-background to-background', 
      accent: 'bg-rose-500',
      ring: 'ring-rose-100',
      text: 'text-rose-900',
      bg: 'bg-rose-50/50'
    },
    amber: { 
      gradient: 'from-amber-50 via-background to-background', 
      accent: 'bg-amber-500',
      ring: 'ring-amber-100',
      text: 'text-amber-900',
      bg: 'bg-amber-50/50'
    },
    cyan: { 
      gradient: 'from-cyan-50 via-background to-background', 
      accent: 'bg-cyan-500',
      ring: 'ring-cyan-100',
      text: 'text-cyan-900',
      bg: 'bg-cyan-50/50'
    },
  };
  return themes[theme] || themes.verdant;
};

const formatUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return `https://${url}`;
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

  // Move useMemo before early returns to maintain hook order
  const filteredStoreItems = useMemo(() => {
    if (!user?.storeItems) return [];
    if (!searchQuery) return user.storeItems;

    const fuse = new Fuse(user.storeItems, {
      keys: ['title', 'price'],
      threshold: 0.4,
    });

    return fuse.search(searchQuery).map(result => result.item);
  }, [user?.storeItems, searchQuery]);

  const handleLinkClick = async (itemId: string | undefined, type: 'link' | 'store') => {
    console.log('handleLinkClick called', { itemId, type, username });
    if (!itemId) {
      console.warn('No itemId provided for click tracking');
      return;
    }
    try {
      await fetch('/api/analytics/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, itemId, type }),
        keepalive: true,
      });
      console.log('Click tracking request sent');
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </main>
    );
  }

  if (isError || !user) {
    notFound();
  }

  const themeColors = getThemeColors(user.themeColor || 'indigo');

  return (
    <main className="min-h-screen pb-20 bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Background */}
      <div className={`fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${themeColors.gradient} opacity-60`} />
      
      {/* Decorative Blur Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-white/40 to-transparent blur-3xl opacity-50 -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-white/40 to-transparent blur-3xl opacity-50 -z-10" />

      <div className="max-w-2xl mx-auto px-4 pt-12 md:pt-20 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative group">
             <div className={`absolute -inset-0.5 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 ${themeColors.accent}`} />
             <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white shadow-xl ring-1 ring-black/5">
                <div className="w-full h-full rounded-full bg-muted overflow-hidden relative">
                   {user.image ? (
                     <Image src={user.image} alt={user.title} fill className="object-cover" priority />
                   ) : (
                     <div className={`w-full h-full flex items-center justify-center text-5xl font-light uppercase ${themeColors.bg} ${themeColors.text}`}>
                       {user.username.charAt(0)}
                     </div>
                   )}
                </div>
             </div>
          </div>
          
          <div className="space-y-2 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{user.title}</h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">{user.bio}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
             <Button size="sm" variant="outline" className="rounded-full px-6 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
               <Mail className="w-4 h-4 mr-2" /> Contact
             </Button>
             <Button size="sm" variant="outline" className="rounded-full px-6 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
               <Share2 className="w-4 h-4 mr-2" /> Share
             </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-6 z-30 flex justify-center">
          <div className="p-1.5 bg-white/90 backdrop-blur-xl rounded-full border border-slate-200/80 shadow-sm flex items-center gap-1.5">
            <button 
              onClick={() => setActiveTab('links')}
              className={`
                relative flex items-center gap-2 py-2.5 px-6 text-sm font-medium rounded-full transition-all duration-300
                ${activeTab === 'links' 
                  ? `${themeColors.accent} text-white shadow-sm` 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <Globe className="w-4 h-4" />
              <span>Links</span>
            </button>
            <button 
              onClick={() => setActiveTab('shop')}
              className={`
                relative flex items-center gap-2 py-2.5 px-6 text-sm font-medium rounded-full transition-all duration-300
                ${activeTab === 'shop' 
                  ? `${themeColors.accent} text-white shadow-sm` 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'links' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {user.links.map((link, i) => (
                <a 
                  key={i}
                  href={formatUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                  onClick={() => handleLinkClick(link._id, 'link')}
                >
                  <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}>
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                           <Globe className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-base truncate ${i === 0 ? 'text-white' : 'text-slate-900'}`}>{link.title}</h3>
                          <p className={`text-xs truncate opacity-70 ${i === 0 ? 'text-white/80' : 'text-slate-500'}`}>{link.url.replace(/^https?:\/\//, '')}</p>
                        </div>
                      </div>
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 ${i === 0 ? 'text-white' : 'text-slate-400'}`}>
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Shop Header & Search */}
              {user.storeItems && user.storeItems.length > 0 ? (
                <>
                  {user.storeItems.length > 2 && (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 rounded-2xl shadow-sm"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {filteredStoreItems.map((item, i) => (
                      <div key={i} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                          {item.url ? (
                            <a 
                              href={formatUrl(item.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative aspect-square overflow-hidden bg-slate-50 block"
                              onClick={() => handleLinkClick(item._id, 'store')}
                            >
                              <Image 
                                src={item.image} 
                                alt={item.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </a>
                          ) : (
                            <div className="relative aspect-square overflow-hidden bg-slate-50">
                              <Image 
                                src={item.image} 
                                alt={item.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-medium text-sm text-slate-900 line-clamp-2 mb-1">{item.title}</h3>
                            <p className="text-sm font-semibold text-emerald-600 mb-3">{item.price}</p>
                            {item.url ? (
                              <a 
                                href={formatUrl(item.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full mt-auto"
                                onClick={() => handleLinkClick(item._id, 'store')}
                              >
                                <Button size="sm" className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-none">
                                  View
                                </Button>
                              </a>
                            ) : (
                              <Button size="sm" className="w-full mt-auto rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-none">
                                View
                              </Button>
                            )}
                          </div>
                      </div>
                    ))}
                  </div>

                  {filteredStoreItems.length === 0 && (
                     <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p>No products found matching "{searchQuery}"</p>
                     </div>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-400 py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No store items available yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center py-8">
           <a href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors">
             <span>Powered by</span>
             <span className="font-bold text-slate-900">InstaLink</span>
           </a>
        </div>

      </div>
    </main>
  );
}
