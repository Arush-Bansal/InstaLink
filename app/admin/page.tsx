"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Mail
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


// --- Interfaces ---

interface Link {
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
  links: Link[];
  storeItems: StoreItem[];
  themeColor: string;
}

// --- Helpers ---

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


// --- Main Component ---

export default function Admin() {
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'shop' | 'appearance'>('profile');
  const [importUrl, setImportUrl] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Effects & Queries ---

  useEffect(() => {
    const storedUser = localStorage.getItem('instaLinkUser');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUsername(userData.username);
  }, [router]);

  const { data: fetchedUser, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username!),
    enabled: !!username,
  });

  // Sync fetched data to local state for editing
  useEffect(() => {
    if (fetchedUser) {
      setUser({ ...fetchedUser, storeItems: fetchedUser.storeItems || [] });
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
          links: [...user.links, ...data.links]
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
    localStorage.removeItem('instaLinkUser');
    router.push('/');
  };

  // --- Render Helpers ---

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  const themeColors = getThemeColors(user.themeColor || 'indigo');

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-xl z-20">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-black">
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
                  ? 'bg-white/10 text-white shadow-lg shadow-black/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-white/60 hover:text-white border-white/10 hover:bg-white/5"
            onClick={() => window.open(`/${user.username}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> View Live
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* 2. Main Content Editor */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto p-8 pb-32">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
              <p className="text-white/40 text-sm mt-1">Manage your {activeTab} settings</p>
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="shadow-lg shadow-emerald-500/20">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>

          </div>

          {/* Tab Content */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="p-6 space-y-6 bg-white/5 border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 group cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                      {user.image ? (
                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium">Change</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium">Profile Image</h3>
                      <p className="text-xs text-white/40">Recommended: 400x400px. Max 2MB.</p>
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
                          className="h-9 text-xs font-mono bg-black/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Display Name</label>
                    <Input value={user.title} onChange={e => setUser({...user, title: e.target.value})} className="bg-black/20 border-white/10" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Bio</label>
                    <Input value={user.bio} onChange={e => setUser({...user, bio: e.target.value})} className="bg-black/20 border-white/10" />
                  </div>
                </div>
              </Card>
            )}

            {/* LINKS TAB */}
            {activeTab === 'links' && (
              <div className="space-y-8">
                {/* Import Tool */}
                <Card className="p-4 bg-indigo-900/10 border-indigo-500/20 flex items-center gap-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-indigo-200">Import from Linktree</h3>
                    <p className="text-xs text-indigo-300/60">Paste your Linktree URL to auto-import links.</p>
                  </div>
                  <div className="flex gap-2 w-1/3">
                    <Input 
                      placeholder="https://linktr.ee/..." 
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      className="h-9 bg-black/20 border-indigo-500/20 text-xs"
                    />
                    <Button size="sm" variant="secondary" onClick={handleImport} disabled={importMutation.isPending}>
                      {importMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Import'}
                    </Button>

                  </div>
                </Card>

                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => setUser({ ...user, links: [...user.links, { title: '', url: '' }] })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Link
                    </Button>
                  </div>
                  {user.links.map((link, i) => (
                    <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/10 group hover:border-white/20 transition-colors">
                      <div className="mt-3 text-white/20 cursor-grab active:cursor-grabbing">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Input 
                          placeholder="Link Title" 
                          value={link.title} 
                          onChange={e => {
                            const newLinks = [...user.links];
                            newLinks[i].title = e.target.value;
                            setUser({ ...user, links: newLinks });
                          }}
                          className="bg-black/20 border-white/10"
                        />
                        <Input 
                          placeholder="URL (https://...)" 
                          value={link.url} 
                          onChange={e => {
                            const newLinks = [...user.links];
                            newLinks[i].url = e.target.value;
                            setUser({ ...user, links: newLinks });
                          }}
                          className="bg-black/20 border-white/10 text-xs font-mono text-white/60"
                        />
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-white/20 hover:text-red-400 hover:bg-red-900/20"
                        onClick={() => {
                          const newLinks = [...user.links];
                          newLinks.splice(i, 1);
                          setUser({ ...user, links: newLinks });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {user.links.length === 0 && (
                    <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/10 rounded-xl">
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
                  <Button onClick={() => setUser({ ...user, storeItems: [...user.storeItems, { title: '', price: '', image: '', url: '' }] })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                  </Button>
                </div>
                {user.storeItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/10">
                    <div 
                      className="w-24 h-24 rounded-lg bg-black/40 border border-white/10 overflow-hidden relative shrink-0 group cursor-pointer"
                      onClick={() => document.getElementById(`store-image-${i}`)?.click()}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white">Upload</span>
                      </div>
                    </div>
                    <input 
                      id={`store-image-${i}`}
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
                          newItems[i].image = reader.result as string;
                          setUser({ ...user, storeItems: newItems });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Product Title" 
                          value={item.title} 
                          onChange={e => {
                            const newItems = [...user.storeItems];
                            newItems[i].title = e.target.value;
                            setUser({ ...user, storeItems: newItems });
                          }}
                          className="bg-black/20 border-white/10"
                        />
                        <Input 
                          placeholder="Price" 
                          value={item.price} 
                          onChange={e => {
                            const newItems = [...user.storeItems];
                            newItems[i].price = e.target.value;
                            setUser({ ...user, storeItems: newItems });
                          }}
                          className="bg-black/20 border-white/10"
                        />
                      </div>
                      <Input 
                        placeholder="Or paste Image URL..." 
                        value={item.image} 
                        onChange={e => {
                          const newItems = [...user.storeItems];
                          newItems[i].image = e.target.value;
                          setUser({ ...user, storeItems: newItems });
                        }}
                        className="bg-black/20 border-white/10 text-xs font-mono"
                      />
                      <Input 
                        placeholder="Product Link" 
                        value={item.url || ''} 
                        onChange={e => {
                          const newItems = [...user.storeItems];
                          newItems[i].url = e.target.value;
                          setUser({ ...user, storeItems: newItems });
                        }}
                        className="bg-black/20 border-white/10 text-xs font-mono"
                      />
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-white/20 hover:text-red-400 hover:bg-red-900/20"
                      onClick={() => {
                        const newItems = [...user.storeItems];
                        newItems.splice(i, 1);
                        setUser({ ...user, storeItems: newItems });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <Card className="p-6 space-y-6 bg-white/5 border-white/10">
                <div className="space-y-4">
                  <h3 className="font-medium">Theme Color</h3>
                  <div className="grid grid-cols-3 gap-4">
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
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
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
      <aside className="hidden xl:flex w-[450px] border-l border-white/10 bg-[#050505] items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
        
        {/* Mobile Mockup */}
        <div className="relative w-[320px] h-[650px] bg-black rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Dynamic Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
          
          {/* Preview Content (Scaled Down Version of Public Profile) */}
          <div className="w-full h-full overflow-y-auto scrollbar-hide bg-black text-white">
            <div className={`min-h-full pb-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${themeColors.gradient}`}>
              <div className="p-6 pt-12 space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className={`w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr ${themeColors.ring}`}>
                    <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl uppercase">
                          {user.username.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.title || 'Your Name'}</h2>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">{user.bio || 'Your bio goes here...'}</p>
                  </div>
                  <div className="flex justify-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Mail className="w-3 h-3" /></div>
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Globe className="w-3 h-3" /></div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {user.links.map((link, i) => (
                    <div 
                      key={i} 
                      className={`group relative p-3 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3 ${i === 0 ? `bg-gradient-to-br ${themeColors.accent}` : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                        <Globe className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{link.title || 'Link Title'}</div>
                        <div className="text-[10px] text-white/40 truncate">{link.url || 'https://...'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Store Preview */}
                {user.storeItems.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Shop</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {user.storeItems.map((item, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                            <div className="text-[10px] font-medium truncate">{item.title}</div>
                            <div className="text-[9px] text-white/60">{item.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-white/20 uppercase tracking-widest font-medium">Live Preview</p>
        </div>
      </aside>

    </div>
  );
}
