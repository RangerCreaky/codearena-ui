"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, Swords } from "lucide-react";
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
import { useAuthStore } from "@/stores/auth-store";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

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

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Minimum 3 characters")
    .max(20, "Maximum 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscore only"),
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(500, "Maximum 500 characters"),
  country: z.string(),
  preferredLanguage: z.string(),
  githubUrl: z.string(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setAccessToken } = useAuthStore();
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      displayName: session?.user?.name || "",
      bio: "",
      country: "",
      preferredLanguage: "python",
      githubUrl: "",
    },
  });

  // Pre-fill display name from session
  useEffect(() => {
    if (session?.user?.name) {
      setValue("displayName", session.user.name);
    }
  }, [session, setValue]);

  const username = watch("username");
  const bio = watch("bio") || "";

  // Debounced username availability check
  const checkUsername = useCallback(
    async (value: string) => {
      if (!value || value.length < 3 || !/^[a-zA-Z0-9_]+$/.test(value)) {
        setUsernameStatus(value.length > 0 ? "invalid" : "idle");
        return;
      }

      setUsernameStatus("checking");

      try {
        const res = await fetchWithAuth(
          `/api/backend/users/me/username-check?username=${encodeURIComponent(value)}`,
          {},
          session
        );

        if (res.ok) {
          const data = await res.json();
          setUsernameStatus(data.available ? "available" : "taken");
        } else {
          setUsernameStatus("invalid");
        }
      } catch {
        setUsernameStatus("idle");
      }
    },
    [session?.accessToken]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) checkUsername(username);
    }, 300);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  async function onSubmit(data: OnboardingForm) {
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(
        `/api/backend/users/me/username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: data.username }),
        },
        session
      );

      if (res.ok) {
        const result = await res.json();
        if (result.access_token) {
          setAccessToken(result.access_token);
        }
        router.push("/dashboard");
      } else {
        console.error("Username set failed:", res.status);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="flex items-start justify-center py-10 px-4">
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <motion.div variants={itemVariants} className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Swords className="h-7 w-7 text-primary" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-base">
                Set up your arena identity
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar preview */}
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    Using your Google avatar
                  </p>
                </div>
              </motion.div>

              {/* Username */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="your_username"
                    className="pr-10 font-mono"
                    {...register("username")}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {usernameStatus === "available" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers, underscore only
                </p>
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-xs text-destructive">Username already taken</p>
                )}
              </motion.div>

              {/* Display Name */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="displayName">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  placeholder="Your Name"
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName.message}</p>
                )}
              </motion.div>

              {/* Bio */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell the arena about yourself..."
                  className="resize-none"
                  rows={3}
                  {...register("bio")}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/500
                </p>
              </motion.div>

              {/* Country & Language row */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label>
                    Preferred Language <span className="text-destructive">*</span>
                  </Label>
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
              </motion.div>

              {/* GitHub URL */}
              <motion.div variants={itemVariants} className="space-y-2">
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
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={
                    isSubmitting ||
                    usernameStatus === "taken" ||
                    usernameStatus === "invalid" ||
                    usernameStatus === "checking" ||
                    !username ||
                    username.length < 3
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Swords className="h-4 w-4 mr-2" />
                  )}
                  Enter the Arena
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
