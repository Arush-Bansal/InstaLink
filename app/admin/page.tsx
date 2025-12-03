"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Plus, Trash2, Save, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Link {
  title: string;
  url: string;
}

interface UserData {
  username: string;
  title: string;
  bio: string;
  image: string;
  links: Link[];
  storeItems: any[];
}

export default function Admin() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('instaLinkUser');
    if (!storedUser) {
      router.push('/');
      return;
    }
    
    // Fetch fresh data
    const userData = JSON.parse(storedUser);
    fetch(`/api/user/${userData.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/user/${user.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Saved successfully!');
      }
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = async () => {
    if (!importUrl || !user) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({
          ...user,
          title: data.data.title,
          bio: data.data.description,
          image: data.data.image || user.image,
          links: [...user.links, ...data.data.links]
        });
        toast.success('Imported successfully! Click Save to persist changes.');
      }
    } catch (e) {
      toast.error('Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const addLink = () => {
    if (!user) return;
    setUser({ ...user, links: [...user.links, { title: 'New Link', url: 'https://' }] });
  };

  const removeLink = (index: number) => {
    if (!user) return;
    const newLinks = [...user.links];
    newLinks.splice(index, 1);
    setUser({ ...user, links: newLinks });
  };

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    if (!user) return;
    const newLinks = [...user.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setUser({ ...user, links: newLinks });
  };

  const handleLogout = () => {
    localStorage.removeItem('instaLinkUser');
    router.push('/');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={handleLogout} className="text-white/60 hover:text-white border border-white/10">
            Logout
          </Button>
          <Button variant="outline" onClick={() => window.open(`/${user.username}`, '_blank')}>
            View Live <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Profile Info */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Profile Details</h2>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Display Name</label>
              <Input value={user.title} onChange={e => setUser({...user, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Bio</label>
              <Input value={user.bio} onChange={e => setUser({...user, bio: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Profile Image</label>
              <div className="flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">No Img</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Upload Photo
                    </Button>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("File size must be less than 2MB");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUser({ ...user, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                  <Input 
                    placeholder="Or paste image URL..." 
                    value={user.image} 
                    onChange={e => setUser({...user, image: e.target.value})} 
                    className="text-xs font-mono text-white/60"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Links Editor */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Links</h2>
              <Button size="sm" variant="secondary" onClick={addLink}><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
            </div>
            
            <div className="space-y-4">
              {user.links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="Title" 
                      value={link.title} 
                      onChange={e => updateLink(i, 'title', e.target.value)}
                      className="h-9"
                    />
                    <Input 
                      placeholder="URL" 
                      value={link.url} 
                      onChange={e => updateLink(i, 'url', e.target.value)} 
                      className="h-9 text-xs font-mono text-white/60"
                    />
                  </div>
                  <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => removeLink(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar / Tools */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-indigo-900/10 border-indigo-500/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Import from Linktree
            </h2>
            <p className="text-xs text-white/60">
              Paste a Linktree URL to import profile info and links. This will append to your existing links.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="https://linktr.ee/..." 
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
              />
              <Button className="w-full" variant="outline" onClick={handleImport} disabled={isImporting}>
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import Data'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
