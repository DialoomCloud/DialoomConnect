import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Newspaper, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { NewsArticle } from "@shared/schema";
import { Navigation } from "@/components/navigation";

export default function NewsPage() {
  const { t } = useTranslation();

  // Fetch all news articles
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["/api/news/articles", "all"],
    queryFn: async () => {
      const response = await fetch("/api/news/articles?limit=100");
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json() as NewsArticle[];
      return data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
              </Link>
              <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)]">
                {t('news.allNews', 'Todas las Noticias')}
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || articles.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
              </Link>
              <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)]">
                {t('news.allNews', 'Todas las Noticias')}
              </h1>
            </div>
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {error ? t('news.errorLoading', 'Error al cargar las noticias') : t('news.noArticles', 'No hay artículos disponibles')}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            </Link>
            <h1 className="text-3xl font-bold text-[hsl(17,12%,6%)]">
              {t('news.allNews', 'Todas las Noticias')} ({articles.length})
            </h1>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article: NewsArticle) => (
              <Card 
                key={article.id} 
                className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group"
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
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {article.viewCount && article.viewCount > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <Eye className="h-4 w-4" />
                        <span>{article.viewCount}</span>
                      </>
                    )}
                    {article.isFeatured && (
                      <Badge className="ml-auto bg-[hsl(188,100%,38%)] text-white">
                        {t('news.featured', 'Destacado')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-[hsl(188,100%,38%)] transition-colors">
                    <Link href={`/news/${article.slug}`}>
                      {article.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {article.excerpt && (
                    <p className="text-gray-600 line-clamp-3 mb-4 text-sm">
                      {article.excerpt}
                    </p>
                  )}

                  <Link href={`/news/${article.slug}`}>
                    <div className="text-[hsl(188,100%,38%)] hover:text-[hsl(188,100%,32%)] font-medium text-sm transition-colors cursor-pointer">
                      {t('news.readMore', 'Leer más')} →
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}