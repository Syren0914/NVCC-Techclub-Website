"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Settings,
  Plus,
  Shield,
  Database,
  Activity,
  BarChart3,
  LogOut,
  Briefcase,
  Bell,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import AdminEventManager from "@/components/admin/admin-event-manager";
import AdminProjectManager from "@/components/admin/admin-project-manager";
import AdminResourceManager from "@/components/admin/admin-resource-manager";
import { ProjectMembersManager } from "@/components/admin/project-members-manager";
import ConferenceStats from "@/components/admin/conference-stats";
import { ApplicationsContent } from "@/components/admin/applications-content";
import { AnnouncementsContent } from "@/components/admin/announcements-content";

interface AdminDashboardData {
  totalUsers: number;
  totalEvents: number;
  totalProjects: number;
  totalResources: number;
  totalTeamMembers: number;
  totalConferenceRegistrations: number;
  recentActivity: any[];
  databaseStatus: any;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdminUser, setIsAdminUser] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadAdminData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/applications", {
        headers: {
          Authorization: `Bearer ${
            (await supabase.auth.getSession()).data.session?.access_token
          }`,
        },
      });

      if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to access this page.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      setIsAdminUser(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/login");
    }
  };

  const loadAdminData = async () => {
    try {
      setError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError("Failed to load dashboard data");
        }
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      setError("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10">
      {/* Background Depth */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/10 blur-[150px] rounded-full" />
      </div>

      {/* Admin Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-white rounded-xl flex items-center justify-center group cursor-pointer transition-transform hover:scale-105">
              <Shield className="size-5 text-black transition-transform group-hover:rotate-12" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-outfit tracking-tight text-white leading-tight">Admin Console</h1>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">System Priority: Omega</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-white font-outfit tracking-tight">System Administrator</span>
              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Authorized Access</span>
            </div>
            <Button variant="ghost" className="size-10 p-0 rounded-xl hover:bg-white/5 border border-white/10">
              <LogOut className="size-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
            { label: "Active Events", value: data?.totalEvents ?? 0, icon: Calendar, color: "text-emerald-400" },
            { label: "Open Projects", value: data?.totalProjects ?? 0, icon: Briefcase, color: "text-purple-400" },
            { label: "System Uptime", value: "99.9%", icon: Shield, color: "text-amber-400" }
          ].map((item, i) => (
            <div key={i} className="group relative bg-[#0a0a0a]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] hover:bg-[#0d0d0d]/60 transition-all duration-500 hover:border-white/10 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors`}>
                  <item.icon className={`size-5 ${item.color}`} />
                </div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Tactical Data</div>
              </div>
              <p className="text-4xl font-bold text-white mb-1 font-outfit tracking-tighter">{item.value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>

        {/* System Alerts */}
        {(error || (data?.databaseStatus && data.databaseStatus.status !== "healthy")) && (
          <div className="space-y-4 mb-8">
            {error && (
              <Alert className="bg-red-500/5 border-red-500/10 rounded-[1.5rem] py-4">
                <Activity className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-xs font-bold text-red-500 tracking-wide uppercase">
                  System Alert: {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-[#0a0a0a]/60 border border-white/5 h-12 p-1.5 rounded-[1.25rem] backdrop-blur-xl gap-1 overflow-x-auto max-w-full justify-start md:justify-center">
              {["overview", "applications", "announcements", "events", "projects", "members", "resources", "conference", "settings"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-xl px-6 text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-h-[500px]">
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-bold font-outfit flex items-center gap-3">
                        <Activity className="size-5 text-blue-500" />
                        Activity Stream
                      </h2>
                      <Badge className="bg-white/5 text-slate-400 border-white/5 font-black text-[10px] uppercase tracking-widest">Live</Badge>
                    </div>
                    <div className="space-y-5">
                      {data?.recentActivity?.map((activity, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-5 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <div className="flex-1">
                            <p className="text-sm font-bold tracking-tight text-slate-200">
                              {activity.action}
                            </p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                              {activity.time}
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">
                            {activity.type}
                          </span>
                        </div>
                      ))}
                      {(!data?.recentActivity || data.recentActivity.length === 0) && (
                        <div className="text-center py-20">
                          <Activity className="size-10 text-white/5 mx-auto mb-4" />
                          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Quiet in the console</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                      <BarChart3 className="size-5 text-purple-500" />
                      <h2 className="text-lg font-bold font-outfit">Fast Lane</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { label: "Applications", icon: FileText, tab: "applications" },
                        { label: "Announcements", icon: Bell, tab: "announcements" },
                        { label: "New Event", icon: Plus, tab: "events" },
                        { label: "New Project", icon: Plus, tab: "projects" },
                        { label: "New Resource", icon: Plus, tab: "resources" },
                        { label: "Database Setup", icon: Database, route: "/admin/setup-test-data" },
                      ].map((action, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="w-full h-14 justify-start px-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white hover:text-black hover:border-white text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300"
                          onClick={action.tab ? () => setActiveTab(action.tab) : () => router.push(action.route || "#")}
                        >
                          <action.icon className="size-4 mr-4 opacity-50" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <ApplicationsContent />
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <AnnouncementsContent />
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <AdminEventManager />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <AdminProjectManager />
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <ProjectMembersManager />
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <AdminResourceManager />
              </div>
            </TabsContent>

            <TabsContent value="conference" className="space-y-6">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                <ConferenceStats />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-16 shadow-2xl flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="size-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mb-10">
                  <Settings className="size-10 text-slate-400 animate-[spin_4s_linear_infinite]" />
                </div>
                <h3 className="text-2xl font-bold font-outfit tracking-tight text-white mb-4">System Configuration</h3>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">Advanced nodal parameters and cluster configuration settings are currently locked behind terminal encryption</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Persistence Bar */}
      <footer className="border-t border-white/5 bg-black/60 backdrop-blur-xl py-6">
        <div className="container mx-auto px-6 flex justify-center">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} TechClub System Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
