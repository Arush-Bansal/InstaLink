"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  ShoppingBag, 
  Palette, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  Loader2, 
  ImageIcon, 
  Share2,
  Smartphone,
  ArrowUpRight,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Mail,
  Pin, // For Pinterest
  BarChart2,
  Search,
  Shirt,
  GripVertical
} from "lucide-react";
import { iconMap, iconNames } from "@/components/icons";
import { toast } from "sonner";
import Image from "next/image";
import ProfilePreview from "@/components/ProfilePreview";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// --- Interfaces ---

interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks?: number;
}

interface StoreItem {
  id: string;
  title: string;
  image: string;
  price: string;
  url?: string;
  clicks?: number;
}

interface UserData {
  username: string;
  title: string;
  bio: string;
  image: string;
  links: Link[];
  storeItems: StoreItem[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    pinterest?: string;
    email?: string;
  };
  themeColor: string;
  outfits: Outfit[];
}

interface OutfitItem {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
}

interface Outfit {
  id: string;
  image: string;
  items: OutfitItem[];
}

// --- Helpers ---

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



// --- API Functions ---

const fetchUser = async (username: string) => {
  const res = await fetch(`/api/user/${username}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch user');
  return data.user;
};

const saveUser = async (user: UserData) => {
  const res = await fetch(`/api/user/${user.username}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to save');
  return data;
};

const importLinktree = async (url: string) => {
  const res = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Import failed');
  return data.data;
};


// --- Sortable Components ---

function SortableLink({ link, index, user, setUser }: { link: Link, index: number, user: UserData, setUser: (u: UserData) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : (showIconPicker ? 50 : 1),
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = iconMap[link.icon || 'Globe'] || iconMap.Globe;

  const filteredIcons = iconNames.filter(name => 
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex gap-4 items-center bg-white/80 p-4 rounded-xl border border-emerald-100 group hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
    >
      <div 
        className="text-muted-foreground cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-emerald-50 rounded-md transition-colors"
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      {/* Icon Picker */}
      <div className="relative">
        <button 
          onClick={() => setShowIconPicker(!showIconPicker)}
          className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
        >
          <IconComponent className="w-5 h-5" />
        </button>

        {showIconPicker && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowIconPicker(false)}
            />
            <div className="absolute top-12 left-0 z-50 w-72 bg-white rounded-xl shadow-xl border border-emerald-100 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input 
                  placeholder="Search icons..." 
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="h-8 pl-8 text-xs bg-slate-50"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-100">
                {filteredIcons.map(name => {
                  const Icon = iconMap[name];
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        const newLinks = [...user.links];
                        newLinks[index].icon = name;
                        setUser({ ...user, links: newLinks });
                        setShowIconPicker(false);
                      }}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        link.icon === name 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                      }`}
                      title={name}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
           <Input 
             placeholder="Link Title" 
             value={link.title} 
             onChange={e => {
               const newLinks = [...user.links];
               newLinks[index].title = e.target.value;
               setUser({ ...user, links: newLinks });
             }}
             className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
           />
        </div>
        <Input 
          placeholder="URL (https://...)" 
          value={link.url} 
          onChange={e => {
            const newLinks = [...user.links];
            newLinks[index].url = e.target.value;
            setUser({ ...user, links: newLinks });
          }}
          className="bg-white/50 border-emerald-100 text-xs font-mono text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
        />
        <div className="flex items-center gap-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
            <BarChart2 className="w-3 h-3" />
            <span>{link.clicks || 0} clicks</span>
          </div>
        </div>
      </div>
      <Button 
        size="icon" 
        variant="ghost" 
        className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
        onClick={() => {
          const newLinks = [...user.links];
          newLinks.splice(index, 1);
          setUser({ ...user, links: newLinks });
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function SortableStoreItem({ item, index, user, setUser }: { item: StoreItem, index: number, user: UserData, setUser: (u: UserData) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex flex-col sm:flex-row gap-4 sm:items-center items-start bg-white/80 p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
    >
      <div 
        className="text-muted-foreground cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-emerald-50 rounded-md transition-colors"
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div 
        className="w-full sm:w-24 h-48 sm:h-24 rounded-lg bg-muted border border-border overflow-hidden relative shrink-0 group cursor-pointer"
      >
         {/* Separate click handler for image upload vs drag */}
         <div 
            className="absolute inset-0 z-10" 
            onClick={(e) => {
               document.getElementById(`store-image-${item.id}`)?.click();
            }}
         />
        {item.image ? (
          <img src={item.image} alt="" className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        <div className={`absolute inset-0 bg-emerald-900/20 flex items-center justify-center transition-opacity pointer-events-none ${item.image ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <span className="text-xs font-medium text-white">Upload Image</span>
        </div>

      </div>
      <input 
        id={`store-image-${item.id}`}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) { toast.error("File too large"); return; }
          const reader = new FileReader();
          reader.onloadend = () => {
            const newItems = [...user.storeItems];
            newItems[index].image = reader.result as string;
            setUser({ ...user, storeItems: newItems });
          };
          reader.readAsDataURL(file);
        }}
      />
      <div className="flex-1 space-y-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input 
            placeholder="Product Title" 
            value={item.title} 
            onChange={e => {
              const newItems = [...user.storeItems];
              newItems[index].title = e.target.value;
              setUser({ ...user, storeItems: newItems });
            }}
            className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
          />
          <Input 
            placeholder="Price" 
            value={item.price} 
            onChange={e => {
              const newItems = [...user.storeItems];
              newItems[index].price = e.target.value;
              setUser({ ...user, storeItems: newItems });
            }}
            className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <Input 
          placeholder="Product Link" 
          value={item.url || ''} 
          onChange={e => {
            const newItems = [...user.storeItems];
            newItems[index].url = e.target.value;
            setUser({ ...user, storeItems: newItems });
          }}
          className="bg-white/50 border-emerald-100 text-xs font-mono focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
        />
        <div className="flex items-center gap-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
            <BarChart2 className="w-3 h-3" />
            <span>{item.clicks || 0} clicks</span>
          </div>
        </div>
      </div>
      <Button 
        size="icon" 
        variant="ghost" 
        className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
        onClick={() => {
          const newItems = [...user.storeItems];
          newItems.splice(index, 1);
          setUser({ ...user, storeItems: newItems });
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// --- Main Component ---

const normalizeSocialUrl = (platform: string, value: string) => {
  if (!value) return value;
  
  // If it's already a URL, leave it alone
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const baseUrls: Record<string, string> = {
    instagram: 'https://instagram.com/',
    twitter: 'https://twitter.com/',
    youtube: 'https://youtube.com/',
    facebook: 'https://facebook.com/',
    pinterest: 'https://pinterest.com/',
  };

  const baseUrl = baseUrls[platform];
  if (!baseUrl) return value;

  // If it looks like a domain, just prepend https://
  if (value.startsWith('www.') || value.includes('.com') || value.includes('.net') || value.includes('.org') || value.includes('.co')) {
     return `https://${value}`;
  }

  // Otherwise treat as username
  const cleanValue = value.startsWith('@') ? value.slice(1) : value;
  return `${baseUrl}${cleanValue}`;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'shop' | 'outfits' | 'appearance'>('profile');
  const [importUrl, setImportUrl] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Effects & Queries ---

  useEffect(() => {
    const handleClaim = async () => {
      const params = new URLSearchParams(window.location.search);
      const claim = params.get('claim');

      if (status === "unauthenticated") {
        router.push("/");
      } else if (status === "authenticated") {
        // @ts-ignore
        const isNewUser = session?.user?.isNewUser || !session?.user?.username;
        
        if (claim) {
          if (isNewUser) {
             // Auto-onboard with claimed username
             try {
               const res = await fetch('/api/onboarding', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ username: claim })
               });
               if (res.ok) {
                 // Force session update or reload to get new user data
                 window.location.href = '/dashboard'; 
               } else {
                 toast.error("Failed to claim username");
               }
             } catch (e) {
               toast.error("Error claiming username");
             }
          } else {
            // Existing user trying to claim new link -> Error & Logout
            await signOut({ redirect: false });
            router.push(`/?error=already_connected&claim=${claim}`);
          }
        } else {
          if (isNewUser) {
            router.push("/onboarding");
          } else {
            // @ts-ignore
            setUsername(session.user.username);
          }
        }
      }
    };

    handleClaim();
  }, [status, session, router]);

  const { data: fetchedUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username!),
    enabled: !!username,
  });

  const isLoading = status === "loading" || isUserLoading;

  // Helper for ID generation
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250, // Long press delay (250ms)
        tolerance: 5, // Tolerance for movement during long press
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !user) return;

    if (active.id !== over.id) {
      // Check if it's a link or store item based on active tab or ID existence
      if (activeTab === 'links') {
        const oldIndex = user.links.findIndex((item) => item.id === active.id);
        const newIndex = user.links.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          setUser({
            ...user,
            links: arrayMove(user.links, oldIndex, newIndex),
          });
        }
      } else if (activeTab === 'shop') {
        const oldIndex = user.storeItems.findIndex((item) => item.id === active.id);
        const newIndex = user.storeItems.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          setUser({
            ...user,
            storeItems: arrayMove(user.storeItems, oldIndex, newIndex),
          });
        }
      }
    }
  };

  // Sync fetched data to local state for editing
  useEffect(() => {
    if (fetchedUser) {
      // Ensure all items have IDs
      const linksWithIds = (fetchedUser.links || []).map((l: any) => ({ ...l, id: l._id || l.id || generateId() }));
      const storeItemsWithIds = (fetchedUser.storeItems || []).map((s: any) => ({ ...s, id: s._id || s.id || generateId() }));
      const outfitsWithIds = (fetchedUser.outfits || []).map((o: any) => ({
        ...o,
        id: o._id || o.id || generateId(),
        items: (o.items || []).map((i: any) => ({ ...i, id: i._id || i.id || generateId() }))
      }));
      
      setUser({ 
        ...fetchedUser, 
        links: linksWithIds,
        storeItems: storeItemsWithIds,
        outfits: outfitsWithIds
      });
    }
  }, [fetchedUser]);

  // --- Mutations ---

  const saveMutation = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      toast.success('Saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['user', username] });
    },
    onError: () => {
      toast.error('Failed to save');
    },
  });

  const importMutation = useMutation({
    mutationFn: importLinktree,
    onSuccess: (data) => {
      if (user) {
        setUser({
          ...user,
          title: data.title,
          bio: data.description,
          image: data.image || user.image,

          links: [...user.links, ...data.links.map((l: any) => ({ ...l, id: generateId() }))]
        });
        toast.success('Imported successfully! Click Save to persist changes.');
        setImportUrl("");
      }
    },
    onError: () => {
      toast.error('Import failed');
    },
  });

  const handleSave = () => {
    if (user) saveMutation.mutate(user);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleImport = () => {
    if (importUrl) importMutation.mutate(importUrl);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // --- Render Helpers ---

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  const themeColors = getThemeColors(user.themeColor || 'verdant');


  return (
    <div className="flex h-screen bg-emerald-50/30 text-slate-900 overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-emerald-100 z-30 flex items-center justify-between px-4">
        <div 
          className="flex items-center gap-2 font-bold text-lg text-foreground cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </div>
          GrifiLinks
        </div>
        <div className="flex gap-2">
           <Button size="icon" variant="ghost" onClick={() => window.open(`/${user.username}`, '_blank')}>
             <ExternalLink className="w-5 h-5" />
           </Button>
           <Button size="icon" variant="ghost" className="text-red-500" onClick={handleLogout}>
             <LogOut className="w-5 h-5" />
           </Button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-emerald-100 z-30 flex justify-around items-center pb-4 px-2">
        {[
          { id: 'profile', label: 'Profile', icon: LayoutDashboard },
          { id: 'links', label: 'Links', icon: LinkIcon },
          { id: 'shop', label: 'Shop', icon: ShoppingBag },
          { id: 'outfits', label: 'Outfits', icon: Shirt },
          { id: 'appearance', label: 'Theme', icon: Palette },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'text-emerald-600' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Sidebar Navigation */}
      <aside className="hidden md:flex w-64 border-r border-emerald-100 flex-col bg-white/80 backdrop-blur-xl z-20">
        <div className="p-6 border-b border-emerald-100">
          <div 
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </div>
            GrifiLinks
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: LayoutDashboard },
            { id: 'links', label: 'Links', icon: LinkIcon },
            { id: 'shop', label: 'Shop', icon: ShoppingBag },
            { id: 'outfits', label: 'Outfits', icon: Shirt },
            { id: 'appearance', label: 'Appearance', icon: Palette },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-100/50 text-emerald-900 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-emerald-50/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-100 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-foreground border-emerald-100 hover:bg-emerald-50/50"
            onClick={() => window.open(`/${user.username}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> View Live
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 border border-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* 2. Main Content Editor */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        <div className="max-w-3xl mx-auto p-4 md:p-8 pb-32">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize text-foreground">{activeTab}</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your {activeTab} settings</p>
            </div>
            <Tooltip content={<span>Save Changes <span className="text-emerald-300 ml-1 font-mono text-[10px]">Ctrl+S</span></span>} position="bottom">
              <Button onClick={handleSave} disabled={saveMutation.isPending} variant="gradient" className="shadow-lg shadow-emerald-500/20">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
            </Tooltip>

          </div>

          {/* Tab Content */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* OUTFITS TAB */}
            {activeTab === 'outfits' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-lg font-medium">My Outfits</h2>
                   <Button 
                     onClick={() => {
                       const newOutfits = [...(user.outfits || [])];
                       newOutfits.unshift({ id: generateId(), image: '', items: [] });
                       setUser({ ...user, outfits: newOutfits });
                     }}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white"
                   >
                     <Plus className="w-4 h-4 mr-2" /> Add Outfit
                   </Button>
                </div>

                <div className="space-y-6">
                  {user.outfits?.map((outfit, index) => (
                    <Card key={outfit.id} className="p-6 space-y-6 bg-white/60 backdrop-blur-sm border-emerald-100">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-emerald-900">Outfit #{user.outfits!.length - index}</h3>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => {
                            const newOutfits = [...user.outfits!];
                            newOutfits.splice(index, 1);
                            setUser({ ...user, outfits: newOutfits });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Area */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Outfit Photo</label>
                          <div 
                            className="relative aspect-[3/4] bg-muted rounded-xl overflow-hidden border-2 border-dashed border-emerald-200 group"
                          >
                             {outfit.image ? (
                               <>
                                 <img 
                                   src={outfit.image} 
                                   alt="Outfit" 
                                   className="w-full h-full object-cover cursor-crosshair"
                                   onClick={(e) => {
                                      if (outfit.items.length >= 3) {
                                        toast.error("Max 3 items per outfit");
                                        return;
                                      }
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                                      
                                      const newOutfits = [...user.outfits!];
                                      newOutfits[index].items.push({
                                        id: generateId(),
                                        title: '',
                                        url: '',
                                        x,
                                        y
                                      });
                                      setUser({ ...user, outfits: newOutfits });
                                   }}
                                 />
                                 {/* Dots */}
                                 {outfit.items.map((item, itemIndex) => (
                                   <div
                                     key={item.id}
                                     style={{ left: `${item.x}%`, top: `${item.y}%` }}
                                     className="absolute w-6 h-6 -ml-3 -mt-3 bg-white rounded-full shadow-lg border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-700 cursor-pointer hover:scale-110 transition-transform"
                                     title={item.title || 'New Item'}
                                   >
                                     {itemIndex + 1}
                                   </div>
                                 ))}
                                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-white text-sm font-medium">Click image to add tag</span>
                                 </div>
                               </>
                             ) : (
                               <div 
                                 className="w-full h-full flex flex-col items-center justify-center text-emerald-500 cursor-pointer hover:bg-emerald-50 transition-colors"
                                 onClick={() => document.getElementById(`outfit-upload-${outfit.id}`)?.click()}
                               >
                                 <ImageIcon className="w-8 h-8 mb-2" />
                                 <span className="text-sm">Upload Photo</span>
                               </div>
                             )}
                             <input 
                                id={`outfit-upload-${outfit.id}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newOutfits = [...user.outfits!];
                                    newOutfits[index].image = reader.result as string;
                                    setUser({ ...user, outfits: newOutfits });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                             />
                          </div>
                          {outfit.image && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => document.getElementById(`outfit-upload-${outfit.id}`)?.click()}
                            >
                              Change Photo
                            </Button>
                          )}
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <label className="text-sm font-medium text-muted-foreground">Tagged Items ({outfit.items.length}/3)</label>
                             <span className="text-xs text-emerald-600">Click photo to add</span>
                           </div>
                           
                           {outfit.items.length === 0 ? (
                             <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-emerald-100 text-muted-foreground text-sm">
                               Tap anywhere on the photo to tag an item
                             </div>
                           ) : (
                             <div className="space-y-3">
                               {outfit.items.map((item, itemIndex) => (
                                 <div key={item.id} className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm space-y-2">
                                    <div className="flex items-center gap-2">
                                       <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                         {itemIndex + 1}
                                       </div>
                                       <Input 
                                         placeholder="Item Name (e.g. White Tee)"
                                         value={item.title}
                                         onChange={(e) => {
                                            const newOutfits = [...user.outfits!];
                                            newOutfits[index].items[itemIndex].title = e.target.value;
                                            setUser({ ...user, outfits: newOutfits });
                                         }}
                                         className="h-8 text-sm"
                                       />
                                       <Button
                                         size="icon"
                                         variant="ghost"
                                         className="h-8 w-8 text-red-500 hover:bg-red-50"
                                         onClick={() => {
                                            const newOutfits = [...user.outfits!];
                                            newOutfits[index].items.splice(itemIndex, 1);
                                            setUser({ ...user, outfits: newOutfits });
                                         }}
                                       >
                                         <Trash2 className="w-3 h-3" />
                                       </Button>
                                    </div>
                                    <Input 
                                       placeholder="Link URL"
                                       value={item.url}
                                       onChange={(e) => {
                                          const newOutfits = [...user.outfits!];
                                          newOutfits[index].items[itemIndex].url = e.target.value;
                                          setUser({ ...user, outfits: newOutfits });
                                       }}
                                       className="h-8 text-xs font-mono"
                                    />
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {(!user.outfits || user.outfits.length === 0) && (
                    <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-emerald-200">
                       <Shirt className="w-12 h-12 mx-auto text-emerald-200 mb-4" />
                       <h3 className="text-lg font-medium text-emerald-900">No outfits yet</h3>
                       <p className="text-muted-foreground mb-4">Share your look with your followers</p>
                       <Button 
                         onClick={() => {
                           const newOutfits = [...(user.outfits || [])];
                           newOutfits.unshift({ id: generateId(), image: '', items: [] });
                           setUser({ ...user, outfits: newOutfits });
                         }}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white"
                       >
                         <Plus className="w-4 h-4 mr-2" /> Create First Outfit
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="p-6 space-y-6 bg-white/60 backdrop-blur-sm border-emerald-100 shadow-sm hover:shadow-emerald-500/5 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border group cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                      {user.image ? (
                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-600 bg-emerald-50">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white">Change</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-foreground">Profile Image</h3>
                      <p className="text-xs text-muted-foreground">Recommended: 400x400px. Max 2MB.</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all" onClick={() => document.getElementById('file-upload')?.click()}>Upload</Button>
                        <input 
                          id="file-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { toast.error("File too large"); return; }
                            const reader = new FileReader();
                            reader.onloadend = () => setUser({ ...user, image: reader.result as string });
                            reader.readAsDataURL(file);
                          }}
                        />

                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                    <Input value={user.title} onChange={e => setUser({...user, title: e.target.value})} className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <Input value={user.bio} onChange={e => setUser({...user, bio: e.target.value})} className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all" />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-emerald-100">
                    <h3 className="font-medium text-foreground">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Instagram className="w-3 h-3" /> Instagram
                        </label>
                        <Input 
                          placeholder="https://instagram.com/..." 
                          value={user.socialLinks?.instagram || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, instagram: e.target.value }})}
                          onBlur={e => setUser({...user, socialLinks: { ...user.socialLinks, instagram: normalizeSocialUrl('instagram', e.target.value) }})}
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Twitter className="w-3 h-3" /> Twitter / X
                        </label>
                        <Input 
                          placeholder="https://twitter.com/..." 
                          value={user.socialLinks?.twitter || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, twitter: e.target.value }})}
                          onBlur={e => setUser({...user, socialLinks: { ...user.socialLinks, twitter: normalizeSocialUrl('twitter', e.target.value) }})}
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Youtube className="w-3 h-3" /> YouTube
                        </label>
                        <Input 
                          placeholder="https://youtube.com/..." 
                          value={user.socialLinks?.youtube || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, youtube: e.target.value }})}
                          onBlur={e => setUser({...user, socialLinks: { ...user.socialLinks, youtube: normalizeSocialUrl('youtube', e.target.value) }})}
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Facebook className="w-3 h-3" /> Facebook
                        </label>
                        <Input 
                          placeholder="https://facebook.com/..." 
                          value={user.socialLinks?.facebook || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, facebook: e.target.value }})}
                          onBlur={e => setUser({...user, socialLinks: { ...user.socialLinks, facebook: normalizeSocialUrl('facebook', e.target.value) }})}
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Pin className="w-3 h-3" /> Pinterest
                        </label>
                        <Input 
                          placeholder="https://pinterest.com/..." 
                          value={user.socialLinks?.pinterest || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, pinterest: e.target.value }})}
                          onBlur={e => setUser({...user, socialLinks: { ...user.socialLinks, pinterest: normalizeSocialUrl('pinterest', e.target.value) }})}
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="w-3 h-3" /> Email
                        </label>
                        <Input 
                          placeholder="your@email.com" 
                          value={user.socialLinks?.email || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, email: e.target.value }})}
                          onBlur={e => {
                            const val = e.target.value;
                            if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                              toast.error("Please enter a valid email address");
                            }
                          }}
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* LINKS TAB */}
            {activeTab === 'links' && (
              <div className="space-y-8">
                {/* Import Tool */}
                <Card className="p-4 bg-emerald-50/50 border-emerald-100 flex items-center gap-4">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-emerald-900">Import from Linktree</h3>
                    <p className="text-xs text-emerald-600/80">Paste your Linktree URL to auto-import links.</p>
                  </div>
                  <div className="flex gap-2 w-1/3">
                    <Input 
                      placeholder="https://linktr.ee/..." 
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      className="h-9 bg-white border-emerald-200 text-xs focus:border-emerald-500"
                    />
                    <Button size="sm" variant="secondary" onClick={handleImport} disabled={importMutation.isPending}>
                      {importMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Import'}
                    </Button>

                  </div>
                </Card>

                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => setUser({ ...user, links: [{ id: generateId(), title: '', url: '', icon: 'Globe' }, ...user.links] })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Link
                    </Button>
                  </div>
                  
                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={user.links.map(l => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {user.links.map((link, i) => (
                          <SortableLink 
                            key={link.id} 
                            link={link} 
                            index={i} 
                            user={user} 
                            setUser={setUser} 
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {user.links.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                      No links added yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SHOP TAB */}
            {activeTab === 'shop' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setUser({ ...user, storeItems: [{ id: generateId(), title: '', price: '', image: '', url: '' }, ...user.storeItems] })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                  </Button>
                </div>
                
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={user.storeItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {user.storeItems.map((item, i) => (
                        <SortableStoreItem 
                          key={item.id} 
                          item={item} 
                          index={i} 
                          user={user} 
                          setUser={setUser} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <Card className="p-6 space-y-6 bg-white/60 backdrop-blur-sm border-emerald-100 shadow-sm hover:shadow-emerald-500/5 transition-all">
                <div className="space-y-4">
                  <h3 className="font-medium">Theme Color</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: 'verdant', color: 'from-emerald-500 to-green-600', border: 'border-emerald-500' },
                      { name: 'indigo', color: 'from-indigo-500 to-purple-600', border: 'border-indigo-500' },
                      { name: 'purple', color: 'from-purple-500 to-pink-600', border: 'border-purple-500' },
                      { name: 'rose', color: 'from-rose-500 to-pink-600', border: 'border-rose-500' },
                      { name: 'amber', color: 'from-amber-500 to-orange-600', border: 'border-amber-500' },
                      { name: 'cyan', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-500' },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setUser({ ...user, themeColor: theme.name })}
                        className={`group relative h-24 rounded-xl bg-gradient-to-br ${theme.color} transition-all overflow-hidden ${
                          user.themeColor === theme.name 
                            ? `ring-2 ring-offset-2 ring-offset-black ${theme.border} scale-[1.02]` 
                            : 'opacity-60 hover:opacity-100 hover:scale-[1.02]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors" />
                        {user.themeColor === theme.name && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
                            <div className="w-2.5 h-2.5 bg-black rounded-full" />
                          </div>
                        )}
                        <span className="absolute bottom-3 left-3 font-medium text-white shadow-black/50 drop-shadow-md capitalize">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

          </div>
        </div>
      </main>




      {/* 3. Live Preview Sidebar */}
      <aside className="hidden xl:flex w-[450px] border-l border-emerald-100 bg-emerald-50/30 items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
        
        {/* Mobile Mockup */}
        <div className="relative w-[320px] h-[650px] bg-background rounded-[3rem] border-8 border-slate-300 shadow-2xl overflow-hidden ring-1 ring-black/5">
          {/* Dynamic Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
          
          {/* Preview Content */}
          <div className="w-full h-full overflow-y-auto scrollbar-hide bg-background text-foreground relative">
             <ProfilePreview user={user} isPreview={true} />
          </div>
        </div>
        
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Live Preview</p>
        </div>
      </aside>

    </div>
  );
}
