import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your profile and public-style links for The Job Pit."
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      headline: true,
      bio: true,
      location: true,
      phone: true,
      linkedinUrl: true,
      githubUrl: true,
      twitterUrl: true,
      websiteUrl: true,
      gameProfile: {
        select: {
          gamificationEnabled: true
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Profile</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Add how you want to show up in the app and link your LinkedIn, GitHub, and other profiles.
        </p>
      </header>

      <ProfileForm
        email={user.email}
        initial={{
          name: user.name,
          headline: user.headline,
          bio: user.bio,
          location: user.location,
          phone: user.phone,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          twitterUrl: user.twitterUrl,
          websiteUrl: user.websiteUrl,
          gamificationEnabled: user.gameProfile?.gamificationEnabled ?? true
        }}
      />
    </main>
  );
}
