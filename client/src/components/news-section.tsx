import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link } from "wouter";
import type { NewsArticle } from "@shared/schema";

export function NewsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Fetch news articles
  const { data: articles = [], isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/articles'],
    enabled: true,
  });

  console.log('NewsSection: Component is rendering...');
  console.log('NewsSection: Current state', { 
    isLoading, 
    articlesLength: articles.length, 
    articles: articles.slice(0, 2) // Log first 2 articles for debugging
  });

  if (error) {
    console.error('NewsSection: Error fetching articles:', error);
    return null;
  }

  if (isLoading) {
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
          Últimas Noticias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border-[hsl(220,13%,90%)] shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  const slidesToShow = 3;
  const maxSlides = Math.max(0, articles.length - slidesToShow + 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const visibleArticles = articles.slice(currentSlide, currentSlide + slidesToShow);

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-center text-[hsl(17,12%,6%)] mb-8">
        Últimas Noticias
      </h2>
      
      {/* Articles Slider */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {visibleArticles.map((article: NewsArticle) => (
            <Link key={article.id} href={`/news/${article.slug}`}>
              <Card className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Featured Image */}
                  <div className="aspect-video bg-gray-200 rounded mb-4 overflow-hidden">
                    {article.featuredImage ? (
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[hsl(188,100%,95%)] to-[hsl(188,100%,85%)] flex items-center justify-center">
                        <span className="text-[hsl(188,100%,38%)] text-sm">Dialoom News</span>
                      </div>
                    )}
                  </div>

                  {/* Article Title */}
                  <h3 className="font-bold text-[hsl(17,12%,6%)] mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Article Excerpt */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {article.excerpt || article.content?.substring(0, 120) + '...'}
                  </p>

                  {/* Article Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('es-ES')}
                    </span>
                    {article.viewCount !== undefined && (
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{article.viewCount}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Navigation Arrows - Only show if more than 3 articles */}
        {articles.length > slidesToShow && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border-[hsl(188,100%,38%)]"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg border-[hsl(188,100%,38%)]"
              onClick={nextSlide}
              disabled={currentSlide >= maxSlides - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* View More Button */}
      <div className="text-center">
        <Link href="/news">
          <Button variant="outline" className="border-[hsl(188,100%,38%)] text-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,38%)] hover:text-white">
            Ver más noticias
          </Button>
        </Link>
      </div>
    </div>
  );
}