import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Calendar, ArrowRight, Sparkles } from "lucide-react";
import type { Promotion } from "@shared/schema";

export default function Promotions() {
  const { data: promotions, isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  return (
    <div className="flex flex-col">
      <section className="py-20 hero-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Special Offers</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-promotions-title">
              Promotions & Discounts
            </h1>
            <p className="text-lg opacity-90">
              Take advantage of our current promotions and special offers. Limited time deals on printing, photography, videography, and marketing services.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-md" />
              ))}
            </div>
          ) : promotions && promotions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {promotions.map((promo) => (
                <Card key={promo.id} className="overflow-hidden hover-elevate" data-testid={`card-promo-${promo.id}`}>
                  <div className="bg-primary/10 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Special Offer</span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-xl">{promo.title}</CardTitle>
                      {promo.discount && (
                        <Badge>{promo.discount}</Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">
                      {promo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {promo.validUntil && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>Valid until: {new Date(promo.validUntil).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}</span>
                      </div>
                    )}
                    <Link href="/quote">
                      <Button className="w-full" data-testid={`button-claim-${promo.id}`}>
                        Claim This Offer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 max-w-md mx-auto">
              <Tag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Promotions</h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for new promotions and special offers. Subscribe to our newsletter to stay updated.
              </p>
              <Link href="/quote">
                <Button>Request a Quote</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Want to Be the First to Know?</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our updates and be the first to hear about new promotions, services, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/quote" className="flex-1">
                <Button className="w-full" data-testid="button-contact-us">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
