"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
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
  Mail,
  BarChart2,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  Github,
  Search
} from "lucide-react";
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
    linkedin?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
    github?: string;
  };
  themeColor: string;
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
      className="flex gap-4 items-start bg-white/80 p-4 rounded-xl border border-emerald-100 group hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
    >
      <div 
        className="mt-3 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        {...attributes} 
        {...listeners}
      >
        <Settings className="w-4 h-4" />
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
           <div className="ml-2 flex items-center gap-1 text-xs text-muted-foreground bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <BarChart2 className="w-3 h-3" />
              <span>{link.clicks || 0}</span>
           </div>
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
      className="flex flex-col sm:flex-row gap-4 items-start bg-white/80 p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
    >
      <div 
        className="w-full sm:w-24 h-48 sm:h-24 rounded-lg bg-muted border border-border overflow-hidden relative shrink-0 group cursor-pointer touch-none"
        {...attributes}
        {...listeners}
      >
         {/* Separate click handler for image upload vs drag */}
         <div 
            className="absolute inset-0 z-10" 
            onClick={(e) => {
               // If it was a drag, don't trigger click. 
               // But dnd-kit handles this mostly. 
               // We need a way to trigger file upload.
               // Let's use a small button for upload or double click?
               // Or just rely on the fact that long press is drag, short click is click.
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
        <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-xs font-medium text-white">Upload (Click) <br/> Move (Hold)</span>
        </div>
        <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
          <BarChart2 className="w-3 h-3" />
          {item.clicks || 0}
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
      <div className="flex-1 space-y-3">
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
          placeholder="Or paste Image URL..." 
          value={item.image} 
          onChange={e => {
            const newItems = [...user.storeItems];
            newItems[index].image = e.target.value;
            setUser({ ...user, storeItems: newItems });
          }}
          className="bg-white/50 border-emerald-100 text-xs font-mono focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
        />
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

export default function Admin() {
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'shop' | 'appearance'>('profile');
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
                 window.location.href = '/admin'; 
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
      
      setUser({ 
        ...fetchedUser, 
        links: linksWithIds,
        storeItems: storeItemsWithIds 
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
        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </div>
          InstaLink
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
          { id: 'shop', label: 'Store', icon: ShoppingBag },
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
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </div>
            InstaLink
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: LayoutDashboard },
            { id: 'links', label: 'Links', icon: LinkIcon },
            { id: 'shop', label: 'Store', icon: ShoppingBag },
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
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
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
            <Button onClick={handleSave} disabled={saveMutation.isPending} variant="gradient" className="shadow-lg shadow-emerald-500/20">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>

          </div>

          {/* Tab Content */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
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
                        <Button size="sm" variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>Upload</Button>
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
                        <Input 
                          placeholder="Or paste URL..." 
                          value={user.image} 
                          onChange={e => setUser({...user, image: e.target.value})}
                          className="h-9 text-xs font-mono bg-muted/50"
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
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Linkedin className="w-3 h-3" /> LinkedIn
                        </label>
                        <Input 
                          placeholder="https://linkedin.com/in/..." 
                          value={user.socialLinks?.linkedin || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, linkedin: e.target.value }})}
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
                          className="bg-white/50 border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Github className="w-3 h-3" /> GitHub
                        </label>
                        <Input 
                          placeholder="https://github.com/..." 
                          value={user.socialLinks?.github || ''} 
                          onChange={e => setUser({...user, socialLinks: { ...user.socialLinks, github: e.target.value }})}
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
                    <Button onClick={() => setUser({ ...user, links: [{ id: generateId(), title: '', url: '' }, ...user.links] })}>
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
