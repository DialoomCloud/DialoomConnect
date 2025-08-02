import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { NewsArticle } from "@shared/schema";

export function NewsSection() {
  const { t } = useTranslation();

  // Fetch featured news articles - public API, no authentication required
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["/api/news/articles", "featured"],
    queryFn: async () => {
      console.log("NewsSection: Fetching articles...");
      const response = await fetch("/api/news/articles?featured=true&limit=3");
      console.log("NewsSection: Response status:", response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json() as NewsArticle[];
      console.log("NewsSection: Fetched articles:", data);
      return data;
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <Newspaper className="w-6 h-6 text-[hsl(188,100%,38%)] mr-3" />
          <h2 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
            {t('news.latestNews', 'Últimas Noticias')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Log current state
  console.log("NewsSection: Current state", { 
    isLoading, 
    error: error?.message, 
    articlesLength: articles.length,
    articles 
  });

  // Don't render if there's an error or no articles
  if (error || articles.length === 0) {
    console.log("NewsSection: Not rendering - Error or no articles", { error, articlesLength: articles.length });
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <Newspaper className="w-6 h-6 text-[hsl(188,100%,38%)] mr-3" />
        <h2 className="text-2xl font-bold text-[hsl(17,12%,6%)]">
          {t('news.latestNews', 'Últimas Noticias')}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article: NewsArticle, index: number) => (
          <Card 
            key={article.id} 
            className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 hover-lift animate-fade-in-up group"
            style={{ animationDelay: `${index * 0.1}s` }}
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
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', {
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
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
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
  );
}