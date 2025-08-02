import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { Link } from 'wouter';
import { Newspaper, Calendar, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { NewsArticle } from '@shared/schema';

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const articlesPerPage = 12;

  // Get locale for date formatting
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'es': return es;
      case 'ca': return ca;
      default: return enUS;
    }
  };

  // Fetch articles with pagination
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['/api/news/articles', page, articlesPerPage],
    queryFn: async () => {
      const response = await apiRequest(`/api/news/articles?page=${page}&limit=${articlesPerPage}&status=published`);
      return response.json();
    },
  });

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.totalPages || 1;

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="h-12 w-12 text-[hsl(188,100%,38%)]" />
          </div>
          <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4">
            {t('news.pageTitle', 'Noticias')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('news.pageSubtitle', 'Mantente informado con las últimas noticias, actualizaciones y anuncios de Dialoom')}
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('news.noArticles', 'No hay artículos disponibles')}
              </h3>
              <p className="text-gray-600">
                {t('news.checkBackLater', 'Vuelve pronto para ver las últimas noticias')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article: NewsArticle) => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    {/* Featured Image */}
                    {article.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-2 group-hover:text-[hsl(188,100%,38%)] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(article.publishedAt || article.createdAt), 'PP', { locale: getDateLocale() })}
                          </span>
                        </div>
                        {article.viewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.viewCount} {t('news.views', 'vistas')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('common.previous', 'Anterior')}
                </Button>
                
                <div className="flex items-center gap-2 mx-4">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === page - 2 ||
                      pageNum === page + 2
                    ) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  {t('common.next', 'Siguiente')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}