"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Instagram, Twitter, Globe, Map, Mail, ArrowUpRight, Share2, Youtube, Facebook, Pin, Calendar, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { iconMap } from "@/components/icons";
import Image from "next/image";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { toast } from "sonner";

// Shared Interfaces
export interface LinkData {
  title: string;
  url: string;
  icon?: string;
  _id?: string;
  id?: string; // For dashboard compatibility
}

export interface TripItem {
  id: string;
  type: 'link' | 'header';
  title: string;
  url?: string;
}

export interface Trip {
  id: string;
  title: string;
  date?: string;
  items: TripItem[];
}

export interface UserData {
  username: string;
  title: string;
  bio: string;
  image: string;
  links: LinkData[];
  trips: Trip[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    facebook?: string;
    pinterest?: string;
    email?: string;
  };
  themeColor: string;
}

interface ProfilePreviewProps {
  user: UserData;
  isPreview?: boolean;
  onLinkClick?: (itemId: string | undefined, type: 'link' | 'store') => void;
}

// Helper function to get theme colors
const getThemeColors = (theme: string) => {
  const themes: Record<string, { gradient: string; accent: string; ring: string; text: string; bg: string; pageBg: string; hoverShadow: string }> = {
    verdant: { 
      gradient: 'from-emerald-200/80 via-emerald-100/50 to-transparent', 
      accent: 'bg-emerald-500',
      ring: 'ring-emerald-100',
      text: 'text-emerald-900',
      bg: 'bg-emerald-50/50',
      pageBg: 'bg-emerald-50',
      hoverShadow: 'hover:shadow-emerald-500/20'
    },
    indigo: { 
      gradient: 'from-indigo-200/80 via-indigo-100/50 to-transparent', 
      accent: 'bg-indigo-500',
      ring: 'ring-indigo-100',
      text: 'text-indigo-900',
      bg: 'bg-indigo-50/50',
      pageBg: 'bg-indigo-50',
      hoverShadow: 'hover:shadow-indigo-500/20'
    },
    purple: { 
      gradient: 'from-purple-200/80 via-purple-100/50 to-transparent', 
      accent: 'bg-purple-500',
      ring: 'ring-purple-100',
      text: 'text-purple-900',
      bg: 'bg-purple-50/50',
      pageBg: 'bg-purple-50',
      hoverShadow: 'hover:shadow-purple-500/20'
    },
    rose: { 
      gradient: 'from-rose-200/80 via-rose-100/50 to-transparent', 
      accent: 'bg-rose-500',
      ring: 'ring-rose-100',
      text: 'text-rose-900',
      bg: 'bg-rose-50/50',
      pageBg: 'bg-rose-50',
      hoverShadow: 'hover:shadow-rose-500/20'
    },
    amber: { 
      gradient: 'from-amber-200/80 via-amber-100/50 to-transparent', 
      accent: 'bg-amber-500',
      ring: 'ring-amber-100',
      text: 'text-amber-900',
      bg: 'bg-amber-50/50',
      pageBg: 'bg-amber-50',
      hoverShadow: 'hover:shadow-amber-500/20'
    },
    cyan: { 
      gradient: 'from-cyan-200/80 via-cyan-100/50 to-transparent', 
      accent: 'bg-cyan-500',
      ring: 'ring-cyan-100',
      text: 'text-cyan-900',
      bg: 'bg-cyan-50/50',
      pageBg: 'bg-cyan-50',
      hoverShadow: 'hover:shadow-cyan-500/20'
    },
  };
  return themes[theme] || themes.verdant;
};

const formatUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return `https://${url}`;
};

export default function ProfilePreview({ user, isPreview = false, onLinkClick }: ProfilePreviewProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'trips'>('links');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const themeColors = getThemeColors(user.themeColor || 'indigo');

  const handleItemClick = (itemId: string | undefined, type: 'link' | 'store') => {
    if (onLinkClick) {
      onLinkClick(itemId, type);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Copied to clipboard");
  };

  return (
    <div className={`min-h-screen pb-20 ${themeColors.pageBg} text-foreground overflow-x-hidden relative z-0 ${isPreview ? 'rounded-[2.5rem] overflow-hidden' : ''}`}>
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${themeColors.gradient}`} />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-white/40 to-transparent blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-white/40 to-transparent blur-3xl opacity-50" />

      <div className={`relative z-10 max-w-2xl mx-auto px-4 ${isPreview ? 'pt-8' : 'pt-12 md:pt-20'} space-y-10`}>
        
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
          
          <div className="flex gap-3 justify-center pt-2 flex-wrap">
            {user.socialLinks?.instagram && (
              <a href={formatUrl(user.socialLinks.instagram)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-pink-600">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {user.socialLinks?.twitter && (
              <a href={formatUrl(user.socialLinks.twitter)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-blue-400">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {user.socialLinks?.youtube && (
              <a href={formatUrl(user.socialLinks.youtube)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-red-600">
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {user.socialLinks?.facebook && (
              <a href={formatUrl(user.socialLinks.facebook)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-blue-600">
                <Facebook className="w-5 h-5" />
              </a>
            )}

            {user.socialLinks?.pinterest && (
              <a href={formatUrl(user.socialLinks.pinterest)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-red-600">
                <Pin className="w-5 h-5" />
              </a>
            )}
            {user.socialLinks?.email && (
              <a href={`mailto:${user.socialLinks.email}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-slate-900">
                <Mail className="w-5 h-5" />
              </a>
            )}
            <button 
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-slate-900"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
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
              onClick={() => setActiveTab('trips')}
              className={`
                relative flex items-center gap-2 py-2.5 px-6 text-sm font-medium rounded-full transition-all duration-300
                ${activeTab === 'trips' 
                  ? `${themeColors.accent} text-white shadow-sm` 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <Map className="w-4 h-4" />
              <span>Trips</span>
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
                  href={isPreview ? '#' : formatUrl(link.url)}
                  target={isPreview ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="block group"
                  onClick={(e) => {
                    if (isPreview) e.preventDefault();
                    handleItemClick(link._id || link.id, 'link');
                  }}
                >
                  <Card className={`relative overflow-hidden border-0 shadow-sm ${themeColors.hoverShadow} transition-all duration-300 transform hover:-translate-y-1 bg-white hover:bg-slate-50`}>
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm">
                           {(() => {
                             const Icon = iconMap[link.icon || 'Globe'] || Globe;
                             return <Icon className="w-5 h-5" />;
                           })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate text-slate-900">{link.title}</h3>
                          <p className="text-xs truncate opacity-70 text-slate-500">{link.url.replace(/^https?:\/\//, '')}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 text-slate-400">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            /* TRIPS TAB CONTENT */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {user.trips && user.trips.length > 0 ? (
                user.trips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                     <button 
                       onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                       className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                     >
                       <div>
                         <h3 className="font-semibold text-slate-900 text-lg">{trip.title}</h3>
                         {trip.date && <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {trip.date}</p>}
                       </div>
                       {expandedTrip === trip.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                     </button>
                     
                     {expandedTrip === trip.id && (
                       <div className="p-5 pt-0 space-y-3 border-t border-slate-100 bg-slate-50/50">
                          <div className="h-4"></div>
                          {trip.items.map((item) => (
                            item.type === 'header' ? (
                              <div key={item.id} className="pt-4 pb-2 first:pt-0">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {item.title}
                                </h4>
                              </div>
                            ) : (
                              <a 
                                key={item.id}
                                href={isPreview ? '#' : formatUrl(item.url || '')}
                                target={isPreview ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                className="block group"
                                onClick={(e) => {
                                  if (isPreview) e.preventDefault();
                                  handleItemClick(item.id, 'link');
                                }}
                              >
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-emerald-500/10 transition-all flex items-center justify-between group-hover:-translate-y-0.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                      <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{item.title}</span>
                                  </div>
                                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                              </a>
                            )
                          ))}
                          {trip.items.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No items in this trip yet.</p>}
                       </div>
                     )}
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                  <Map className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No trips posted yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center py-8">
           <a href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors">
             <span>Powered by</span>
             <span className="font-bold text-slate-900">GrifiLinks</span>
           </a>
        </div>

      </div>
    </div>
  );
}
