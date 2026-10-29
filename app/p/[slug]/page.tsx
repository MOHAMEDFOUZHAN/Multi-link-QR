import type { Metadata } from "next";
import { getProfileFromSupabase } from "@/lib/supabase";
import ProfileClient from "./ProfileClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await getProfileFromSupabase(slug);
    if (!profile) {
      return {
        title: `${slug} | Business Profile`,
        description: "Official links and interactive QR destination.",
      };
    }
    return {
      title: `${profile.name} — Maple Connect QR`,
      description: profile.bio || `Official links and contact card for ${profile.name}`,
      openGraph: {
        title: profile.name,
        description: profile.bio || `Connect with ${profile.name}`,
        images: profile.avatarUrl ? [profile.avatarUrl] : [],
      },
    };
  } catch {
    return {
      title: `${slug} | Business Profile`,
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  let initialProfile = null;

  try {
    initialProfile = await getProfileFromSupabase(slug);
  } catch (err) {
    console.warn("Could not pre-fetch profile from Supabase on SSR:", err);
  }

  return <ProfileClient slug={slug} initialProfile={initialProfile} />;
}

