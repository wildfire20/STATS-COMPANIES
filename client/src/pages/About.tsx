import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Eye, Heart, Award } from "lucide-react";
import type { TeamMember } from "@shared/schema";
import logoImage from "@assets/states company logo_1764435536382.jpg";

export default function About() {
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-secondary text-white mb-4">About Us</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4" data-testid="text-about-title">
                Our Story
              </h1>
              <p className="text-muted-foreground text-lg">
                STATS Companies started in 2020 in the middle of a pandemic, from the skills and knowledge we acquired. We began with design and large format printing, later introducing videography and photography services.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src={logoImage} 
                alt="STATS Companies" 
                className="h-48 md:h-64 w-auto"
                data-testid="img-about-logo"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Building Dreams, One Project at a Time</h2>
              <p className="text-muted-foreground">
                At STATS Companies, we believe in the power of visual communication. Our journey began with a simple idea: to help businesses and individuals bring their visions to life through quality printing and creative media services.
              </p>
              <p className="text-muted-foreground">
                What started as a small printing operation has grown into a comprehensive creative agency offering digital printing, professional photography, videography, and digital marketing services.
              </p>
              <p className="text-muted-foreground">
                Based in Pretoria's CBD, we serve clients across South Africa, delivering exceptional quality and personalized service on every project.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">2020</div>
                <p className="text-sm text-muted-foreground">Year Founded</p>
              </Card>
              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Projects Completed</p>
              </Card>
              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">200+</div>
                <p className="text-sm text-muted-foreground">Happy Clients</p>
              </Card>
              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">4</div>
                <p className="text-sm text-muted-foreground">Core Services</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Vision & Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card data-testid="card-vision">
              <CardHeader>
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Businesses in one business - one entity producing others. We aim to be a comprehensive creative hub that nurtures and grows alongside our clients.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-mission">
              <CardHeader>
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To deliver exceptional creative services that help businesses and individuals communicate their stories effectively through print and visual media.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-values">
              <CardHeader>
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quality, creativity, integrity, and customer satisfaction drive everything we do. We treat every project with care and dedication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-team-title">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our talented team brings together decades of combined experience in design, printing, photography, videography, and marketing.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-md" />
              ))
            ) : teamMembers?.map((member) => (
              <Card key={member.id} className="text-center" data-testid={`card-team-${member.id}`}>
                <CardHeader>
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                        data-testid={`img-team-${member.id}`}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  )}
                  {member.experience && (
                    <Badge variant="secondary">{member.experience}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Award, title: "Quality Guarantee", desc: "Premium materials and professional execution on every project" },
              { icon: Target, title: "Fast Turnaround", desc: "Efficient delivery without compromising on quality" },
              { icon: Heart, title: "Personal Touch", desc: "Dedicated service and attention to your unique needs" },
              { icon: Eye, title: "Creative Excellence", desc: "Innovative solutions that make your brand stand out" }
            ].map((item, index) => (
              <Card key={index} className="text-center" data-testid={`card-why-${index}`}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
