"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import Link from "next/link";
import { User, Settings, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "IL", name: "Israel" },
  { code: "PL", name: "Poland" },
];

const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Rust", "Go", "C++", "Java", "C#", "Ruby", "Kotlin",
];

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric characters and underscores allowed"),
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(500),
  country: z.string(),
  preferredLanguage: z.string(),
  githubUrl: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const sidebarLinks = [
  { label: "Edit Profile", href: "/profile/edit", icon: User, active: true },
  { label: "Account", href: "#", icon: Settings, active: false },
];

import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { toast } from "sonner";

export default function ProfileEditPage() {
  const { data: session, status, update: updateSession } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: session?.username || "",
      displayName: session?.displayName || session?.user?.name || "",
      bio: "",
      country: "",
      preferredLanguage: "python",
      githubUrl: "",
    },
  });

  const bio = watch("bio") || "";

  useEffect(() => {
    if (status !== "authenticated" || profileLoaded) return;

    async function loadProfile() {
      try {
        const res = await fetchWithAuth("/api/backend/auth/me");
        if (res.ok) {
          const data = await res.json();
          // Assuming backend returns snake_case fields as per the POST contract
          reset({
            username: data.username || session?.username || "",
            displayName: data.display_name || session?.displayName || session?.user?.name || "",
            bio: data.bio || "",
            country: data.country || "",
            preferredLanguage: data.preferred_language || "python",
            githubUrl: data.github_url || "",
          });
        }
      } catch (err) {
        console.error("Failed to load existing profile:", err);
      } finally {
        setProfileLoaded(true);
      }
    }
    loadProfile();
  }, [reset, session, status, profileLoaded]);

  async function onSubmit(data: ProfileForm) {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetchWithAuth(`/api/backend/users/me/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          display_name: data.displayName,
          avatar_url: session?.avatarUrl || session?.user?.image || "",
          bio: data.bio || null,
          country: data.country || null,
          preferred_language: data.preferredLanguage,
          github_url: data.githubUrl || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || errData?.message || "Failed to update profile");
      }

      toast.success("Profile saved successfully!", {
        description: "Your changes are now live across CodeArena.",
      });
      // Force update of frontend session with new data
      await updateSession();
    } catch (err: any) {
      toast.error("Failed to save profile", {
        description: err.message || "An unexpected error occurred",
      });
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          className="w-full lg:w-56 shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                      link.active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    } ${!link.active ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main form */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your arena identity and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-muted-foreground">
                      Upload a new profile photo (coming soon)
                    </p>
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    {...register("displayName")}
                  />
                  {errors.displayName && (
                    <p className="text-xs text-destructive">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell the arena about yourself..."
                    className="resize-none"
                    rows={5}
                    {...register("bio")}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/500
                  </p>
                </div>

                {/* Country & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select onValueChange={(v: string | null) => setValue("country", v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Language</Label>
                    <Select
                      defaultValue="python"
                      onValueChange={(v: string | null) => setValue("preferredLanguage", v ?? "python")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      github.com/
                    </span>
                    <Input
                      id="githubUrl"
                      placeholder="username"
                      className="rounded-l-none"
                      {...register("githubUrl")}
                    />
                  </div>
                </div>

                {/* Save */}
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={isSaving} className="px-6">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
