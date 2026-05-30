"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Swords,
  Trophy,
  Target,
  Calendar,
  Pencil,
  Lock,
  BarChart3,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const tabs = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "stats", label: "Stats", icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]["id"];

const stats = [
  { label: "Challenges Won", value: "0", icon: Trophy },
  { label: "Total Matches", value: "0", icon: Swords },
  { label: "Win Rate", value: "0%", icon: Target },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("activity");

  const userName = session?.displayName || session?.user?.name || "Warrior";
  const userImage = session?.avatarUrl || session?.user?.image || "";
  const userHandle = session?.username 
    ? `@${session.username}` 
    : `@${userName.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar - Profile card */}
        <motion.div
          className="w-full lg:w-72 shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/50">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold">{userName}</h2>
              <p className="text-sm text-muted-foreground">{userHandle}</p>

              <Separator className="my-5 w-full" />

              <div className="grid grid-cols-3 gap-3 w-full">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-5 w-full" />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined May 2026</span>
              </div>

              <Link href="/profile/edit" className="w-full mt-4">
                <Button variant="outline" className="w-full">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main content */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-muted/50 rounded-lg w-fit mx-auto mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-base font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "activity" && (
            <Card className="border-border/50">
              <CardContent className="py-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Swords className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No battles yet</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your first arena and your activity will appear here!
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "achievements" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="py-8 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Locked</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "stats" && (
            <Card className="border-border/50">
              <CardContent className="py-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Battle statistics
                </h3>
                <p className="text-sm text-muted-foreground">
                  Charts and analytics will appear here after your first
                  matches.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right sidebar */}
        <motion.div
          className="w-full lg:w-64 shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Upcoming Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground text-center py-6">
                No upcoming challenges
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
