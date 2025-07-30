import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { Search, User, Mail, MapPin, CheckCircle, Eye } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function HostSearch() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: hosts, isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/hosts"],
  });

  const filteredHosts = hosts?.filter((host) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      host.firstName?.toLowerCase().includes(search) ||
      host.lastName?.toLowerCase().includes(search) ||
      host.email?.toLowerCase().includes(search) ||
      host.title?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4">{t('hosts.title')}</h1>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg shadow-lg border-0 focus:ring-2 focus:ring-[hsl(244,91%,68%)] transition-all"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(244,91%,68%)]"></div>
          </div>
        ) : filteredHosts && filteredHosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHosts.map((host, index) => (
              <Card 
                key={host.id} 
                className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-[hsl(244,91%,95%)] animate-glow">
                      {host.profileImageUrl ? (
                        <img 
                          src={host.profileImageUrl.startsWith('http') || host.profileImageUrl.startsWith('/') ? host.profileImageUrl : `/storage/${host.profileImageUrl}`} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-1">
                      {host.firstName && host.lastName 
                        ? `${host.firstName} ${host.lastName}` 
                        : host.email}
                    </h3>
                    {host.title && (
                      <p className="text-gray-600 mb-3">{host.title}</p>
                    )}
                    <Badge className="bg-[hsl(159,61%,95%)] text-[hsl(159,61%,50%)] hover:bg-[hsl(159,61%,90%)]">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('home.verified')}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {host.email && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-[hsl(244,91%,68%)]" />
                        <span className="truncate">{host.email}</span>
                      </div>
                    )}
                    {host.city && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-[hsl(244,91%,68%)]" />
                        <span>{host.city}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/user/${host.id}`}>
                    <Button 
                      className="w-full bg-[hsl(244,91%,68%)] hover:bg-[hsl(244,91%,60%)] glow-button relative overflow-hidden"
                    >
                      <Eye className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10">{t('hosts.viewProfile')}</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('hosts.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}