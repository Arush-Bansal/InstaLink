"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";
import ProfilePreview, { UserData } from "@/components/ProfilePreview";

const fetchUser = async (username: string) => {
  const res = await fetch(`/api/user/${username}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  return data.user;
};

export default function PublicProfile() {
  const params = useParams();
  const username = params?.username as string;

  const { data: user, isLoading, isError } = useQuery<UserData>({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
    enabled: !!username,
  });

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

  return (
    <ProfilePreview 
      user={user} 
      onLinkClick={handleLinkClick}
    />
  );
}
