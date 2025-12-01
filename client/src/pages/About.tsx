import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Eye, Heart, Award, Sparkles, Users, Briefcase, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { TeamMember } from "@shared/schema";
import logoImage from "@assets/states company logo_1764435536382.jpg";

const stats = [
  { icon: Calendar, value: "2020", label: "Year Founded" },
  { icon: Briefcase, value: "500+", label: "Projects Completed" },
  { icon: Users, value: "200+", label: "Happy Clients" },
  { icon: Award, value: "4", label: "Core Services" },
];

const values = [
  { 
    icon: Eye, 
    title: "Our Vision", 
    description: "Businesses in one business - one entity producing others. We aim to be a comprehensive creative hub that nurtures and grows alongside our clients." 
  },
  { 
    icon: Target, 
    title: "Our Mission", 
    description: "To deliver exceptional creative services that help businesses and individuals communicate their stories effectively through print and visual media." 
  },
  { 
    icon: Heart, 
    title: "Our Values", 
    description: "Quality, creativity, integrity, and customer satisfaction drive everything we do. We treat every project with care and dedication." 
  },
];

const whyChooseUs = [
  { icon: Award, title: "Quality Guarantee", desc: "Premium materials and professional execution on every project" },
  { icon: Target, title: "Fast Turnaround", desc: "Efficient delivery without compromising on quality" },
  { icon: Heart, title: "Personal Touch", desc: "Dedicated service and attention to your unique needs" },
  { icon: Eye, title: "Creative Excellence", desc: "Innovative solutions that make your brand stand out" }
];

export default function About() {
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <motion.section 
        className="py-20 md:py-28 hero-gradient relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 decorative-dots opacity-5" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                About Us
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight" data-testid="text-about-title">
                Our
                <span className="block text-gradient-light">Story</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed">
                STATS Companies started in 2020 in the middle of a pandemic, from the skills and knowledge we acquired. We began with design and large format printing, later introducing videography and photography services.
              </p>
            </motion.div>
            <motion.div 
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/30 rounded-full blur-3xl" />
                <motion.img 
                  src={logoImage} 
                  alt="STATS Companies" 
                  className="relative h-48 md:h-64 lg:h-72 w-auto float-animation drop-shadow-2xl"
                  data-testid="img-about-logo"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        className="py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Building Dreams,
                <span className="text-gradient block">One Project at a Time</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                At STATS Companies, we believe in the power of visual communication. Our journey began with a simple idea: to help businesses and individuals bring their visions to life through quality printing and creative media services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What started as a small printing operation has grown into a comprehensive creative agency offering digital printing, professional photography, videography, and digital marketing services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Based in Pretoria's CBD, we serve clients across South Africa, delivering exceptional quality and personalized service on every project.
              </p>
            </motion.div>
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-500 h-full">
                    <div className="icon-container mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-4xl font-display font-bold text-primary mb-2">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Vision & Values Section */}
      <motion.section 
        className="py-24 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">What We Stand For</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Vision & <span className="text-gradient">Values</span>
            </h2>
            <div className="section-divider mt-6" />
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500" data-testid={`card-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                  <CardHeader>
                    <div className="icon-container-lg mb-4">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-display text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">Our People</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-team-title">
              Meet Our <span className="text-gradient">Team</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our talented team brings together decades of combined experience in design, printing, photography, videography, and marketing.
            </p>
            <div className="section-divider mt-6" />
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))
            ) : teamMembers?.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col" data-testid={`card-team-${member.id}`}>
                  <CardHeader className="pb-4">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center mx-auto mb-6 overflow-hidden ring-4 ring-white shadow-xl">
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-team-${member.id}`}
                        />
                      ) : (
                        <span className="text-4xl font-display font-bold text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-display text-xl">{member.name}</CardTitle>
                    <CardDescription className="font-medium text-secondary text-base">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                    <div>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>
                      )}
                    </div>
                    <div className="mt-auto">
                      {member.experience && (
                        <Badge variant="secondary" className="text-xs">{member.experience}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="py-24 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose <span className="text-gradient">Us?</span>
            </h2>
            <div className="section-divider mt-6" />
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full border-0 shadow-md hover:shadow-lg transition-all duration-500" data-testid={`card-why-${index}`}>
                  <CardContent className="pt-8 pb-6">
                    <motion.div 
                      className="icon-container mx-auto mb-5"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <item.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-display font-semibold text-lg mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
