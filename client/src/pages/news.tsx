import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Clock, Eye, Search, Newspaper, ArrowLeft } from "lucide-react";
import type { NewsArticle } from "@shared/schema";

export default function NewsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch published news articles
  const { data: articles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/articles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/news/articles', {});
      return response.json();
    },
  });

  // Filter articles based on search term
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (article.tags && article.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Volver')}
              </Button>
            </Link>
            <div className="w-16 h-16 bg-[hsl(188,100%,38%)] rounded-full flex items-center justify-center mb-4">
              <Newspaper className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('news.title', 'Noticias y Actualizaciones')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('news.subtitle', 'Mantente informado sobre las últimas novedades, características y mejoras de Dialoom')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('news.searchPlaceholder', 'Buscar noticias...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-96 animate-pulse">
                <div className="aspect-video w-full bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="h-full hover:shadow-lg transition-shadow duration-200">
                {article.featuredImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    {article.viewCount > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <Eye className="h-4 w-4" />
                        <span>{article.viewCount}</span>
                      </>
                    )}
                    {article.isFeatured && (
                      <Badge className="ml-auto bg-[hsl(188,100%,38%)]">
                        {t('news.featured', 'Destacado')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-[hsl(188,100%,38%)] transition-colors">
                    <Link href={`/news/${article.slug}`}>
                      {article.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col justify-between h-full">
                  <div>
                    {article.excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link href={`/news/${article.slug}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full hover:bg-[hsl(188,100%,38%)] hover:text-white transition-colors mt-auto"
                    >
                      <Newspaper className="h-4 w-4 mr-2" />
                      {t('news.readMore', 'Leer más')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredArticles.length === 0 && articles.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('news.noResults', 'No se encontraron resultados')}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('news.noResultsDesc', 'Intenta con otros términos de búsqueda')}
            </p>
            <Button 
              onClick={() => setSearchTerm("")}
              variant="outline"
            >
              {t('news.clearSearch', 'Limpiar búsqueda')}
            </Button>
          </div>
        )}

        {/* No Articles */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('news.noArticles', 'No hay noticias disponibles')}
            </h3>
            <p className="text-gray-500">
              {t('news.noArticlesDesc', 'Vuelve pronto para ver las últimas actualizaciones')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}