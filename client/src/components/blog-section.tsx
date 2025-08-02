import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Newspaper, ArrowRight, Calendar, User } from "lucide-react";
import { Link } from "wouter";
import type { NewsArticle } from "@shared/schema";

export function BlogSection() {
  const { t } = useTranslation();

  // Fetch all published articles
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/news/articles", "published"],
    queryFn: async () => {
      const response = await fetch("/api/news/articles");
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json() as Promise<NewsArticle[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(188,100%,38%)]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  // Separate featured and regular articles
  const featuredArticles = articles.filter(article => article.isFeatured).slice(0, 3);
  const recentArticles = articles.filter(article => !article.isFeatured).slice(0, 6);

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-[hsl(188,100%,38%)] mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(17,12%,6%)]">
              {t('blog.title', 'Blog de Dialoom')}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('blog.subtitle', 'Descubre las últimas noticias, consejos y actualizaciones de nuestra plataforma')}
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <Badge className="bg-[hsl(188,100%,38%)] text-white px-4 py-2 text-sm font-medium">
                {t('blog.featured', 'Artículos Destacados')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article: NewsArticle, index: number) => (
                <Card 
                  key={article.id} 
                  className={`bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 hover-lift animate-fade-in-up group ${
                    index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {article.featuredImage && (
                    <div className={`w-full overflow-hidden rounded-t-lg ${
                      index === 0 ? 'aspect-[16/9]' : 'aspect-video'
                    }`}>
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className={index === 0 ? "p-8" : "p-6"}>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(article.publishedAt || article.createdAt!).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {article.viewCount && article.viewCount > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <Eye className="h-4 w-4" />
                          <span>{article.viewCount} {t('blog.views', 'visualizaciones')}</span>
                        </>
                      )}
                    </div>
                    <CardTitle className={`line-clamp-2 group-hover:text-[hsl(188,100%,38%)] transition-colors ${
                      index === 0 ? 'text-2xl mb-4' : 'text-xl mb-3'
                    }`}>
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                    {article.excerpt && (
                      <p className={`text-gray-600 leading-relaxed ${
                        index === 0 ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'
                      }`}>
                        {article.excerpt}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className={index === 0 ? "px-8 pb-8" : "px-6 pb-6"}>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Link href={`/news/${article.slug}`}>
                      <Button 
                        variant="outline" 
                        className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white group-hover:shadow-md transition-all"
                      >
                        {t('blog.readMore', 'Leer artículo')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
                {t('blog.recent', 'Artículos Recientes')}
              </h3>
              <Link href="/news">
                <Button variant="outline" className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white">
                  {t('blog.viewAll', 'Ver todos')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article: NewsArticle, index: number) => (
                <Card 
                  key={article.id} 
                  className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 hover-lift animate-fade-in-up group"
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  {article.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(article.publishedAt || article.createdAt!).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {article.viewCount && article.viewCount > 0 && (
                        <>
                          <span className="mx-1">•</span>
                          <Eye className="h-3 w-3" />
                          <span>{article.viewCount}</span>
                        </>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-[hsl(188,100%,38%)] transition-colors text-lg">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {article.excerpt && (
                      <p className="text-gray-600 line-clamp-2 text-sm mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <Link href={`/news/${article.slug}`}>
                      <span className="text-[hsl(188,100%,38%)] hover:text-[hsl(188,100%,32%)] font-medium text-sm transition-colors cursor-pointer">
                        {t('blog.readMore', 'Leer más')} →
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[hsl(188,100%,38%)] to-[hsl(188,80%,42%)] text-white p-8">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-4">
                {t('blog.cta.title', '¿Quieres estar al día?')}
              </h3>
              <p className="text-lg mb-6 opacity-90">
                {t('blog.cta.subtitle', 'Sigue nuestro blog para recibir las últimas noticias y consejos de Dialoom')}
              </p>
              <Link href="/news">
                <Button 
                  size="lg"
                  className="bg-white text-[hsl(188,100%,38%)] hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  <Newspaper className="mr-2 h-5 w-5" />
                  {t('blog.cta.button', 'Explorar Blog')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}