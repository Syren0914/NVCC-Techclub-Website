"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, MapPin, Calendar, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/footer";
import { Milestone, TeamMember } from "../types/team";
import { fetchTeamMembers, fetchMilestones } from "@/lib/database";

const Team = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamData = await fetchTeamMembers();
        if (teamData && teamData.length > 0) {
          setTeam(teamData);
        }

        const milestoneData = await fetchMilestones();
        if (milestoneData && milestoneData.length > 0) {
          setMilestones(milestoneData);
        }
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      
      <main className="flex-1">
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Team</h1>
              <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Meet the dedicated members who make TechClub possible. Our team brings together diverse skills and experiences to create an amazing community.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="text-center">
                      <Avatar className="size-24 mx-auto mb-4">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <Badge variant="secondary" className="mx-auto">
                        {member.role}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.specialties?.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>Year {member.year}</span>
                      </div>

                      <div className="flex justify-center gap-2">
                        {member.github && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={member.github} target="_blank" rel="noopener noreferrer">
                              <Github className="size-4" />
                            </a>
                          </Button>
                        )}
                        {member.linkedin && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="size-4" />
                            </a>
                          </Button>
                        )}
                        {member.contact && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${member.contact}`}>
                              <Mail className="size-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {team.length === 0 && (
              <div className="text-center py-12">
                <Users className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
                <p className="text-muted-foreground">
                  Team member data is not available. Please check the database connection.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Team;
