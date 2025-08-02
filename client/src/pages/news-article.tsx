import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useRoute } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Clock, Eye, ArrowLeft, Newspaper, Share, User, Edit, Copy, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { NewsArticle, User as UserType } from "@shared/schema";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";

export default function NewsArticlePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [match, params] = useRoute('/news/:slug');
  const slug = params?.slug;
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  
  // Check if user is admin
  const isAdmin = user && (user as any).isAdmin;

  // Fetch article by slug
  const { data: article, isLoading, error } = useQuery<NewsArticle>({
    queryKey: ['/api/news/articles', slug],
    queryFn: async () => {
      const response = await apiRequest(`/api/news/articles/${slug}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      return response.json();
    },
    enabled: !!slug,
  });

  // Fetch author information if available
  const { data: author } = useQuery<UserType>({
    queryKey: ['/api/users', article?.authorId],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${article?.authorId}`);
      return response.json();
    },
    enabled: !!article?.authorId,
  });

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/articles', 'related', article?.id],
    queryFn: async () => {
      const response = await apiRequest('/api/news/articles?limit=3');
      const articles = await response.json();
      // Filter out current article
      return articles.filter((a: NewsArticle) => a.id !== article?.id).slice(0, 3);
    },
    enabled: !!article,
  });

  // Share functionality
  const handleShare = async () => {
    setShareMenuOpen(!shareMenuOpen);
  };
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('news.linkCopied', 'Enlace copiado'),
      description: t('news.linkCopiedDesc', 'El enlace se ha copiado al portapapeles'),
    });
    setShareMenuOpen(false);
  };
  
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');
    const text = encodeURIComponent(article?.excerpt || article?.title || '');
    
    let shareUrl = '';
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the link
        handleCopyLink();
        toast({
          title: t('news.instagramShare', 'Compartir en Instagram'),
          description: t('news.instagramShareDesc', 'Enlace copiado. Pégalo en tu historia o publicación de Instagram'),
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareMenuOpen(false);
  };

  // Set page title
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Dialoom News`;
    }
  }, [article]);
  
  // Close share menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (shareMenuOpen && !target.closest('.relative')) {
        setShareMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [shareMenuOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[hsl(220,9%,98%)]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('news.articleNotFound', 'Artículo no encontrado')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('news.articleNotFoundDesc', 'El artículo que buscas no existe o ha sido eliminado')}
            </p>
            <Link href="/news">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('news.backToNews', 'Volver a noticias')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/news">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('news.backToNews', 'Volver a noticias')}
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            {/* Article Meta */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {(() => {
                    const dateValue = article.publishedAt || article.createdAt;
                    return dateValue ? 
                      new Date(dateValue).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      '';
                  })()}
                </span>
              </div>
              {article.viewCount && article.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.viewCount} {t('news.views', 'visualizaciones')}</span>
                </div>
              )}
              {author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{author.firstName} {author.lastName}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </CardTitle>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
                {article.excerpt}
              </p>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-2">
              {/* Admin Edit Button */}
              {isAdmin && article && (
                <Link href={`/admin/dashboard/news/${article.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-[hsl(188,100%,38%)] hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('news.edit', 'Editar')}
                  </Button>
                </Link>
              )}
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-[hsl(188,100%,38%)] hover:text-white transition-colors"
                >
                  <Share className="h-4 w-4 mr-2" />
                  {t('news.share', 'Compartir')}
                </Button>
                
                {/* Share Menu Dropdown */}
                {shareMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                      <span className="text-sm">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <FaXTwitter className="h-4 w-4 text-black" />
                      <span className="text-sm">X (Twitter)</span>
                    </button>
                    <button
                      onClick={() => handleSocialShare('instagram')}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <FaInstagram className="h-4 w-4 text-[#E4405F]" />
                      <span className="text-sm">Instagram</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{t('news.copyLink', 'Copiar enlace')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="px-6 pb-6">
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="prose prose-lg max-w-none pt-6">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t('news.relatedArticles', 'Artículos relacionados')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="group">
                    <Link href={`/news/${relatedArticle.slug}`}>
                      <Card className="h-full hover:shadow-md transition-shadow duration-200">
                        {relatedArticle.featuredImage && (
                          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                            <img
                              src={relatedArticle.featuredImage}
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-[hsl(188,100%,38%)] transition-colors">
                            {relatedArticle.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              {(() => {
                                const dateValue = relatedArticle.publishedAt || relatedArticle.createdAt;
                                return dateValue ?
                                  new Date(dateValue).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) :
                                  '';
                              })()}
                            </span>
                          </div>
                        </CardHeader>
                        {relatedArticle.excerpt && (
                          <CardContent className="pt-0">
                            <p className="text-gray-600 line-clamp-2 text-sm">
                              {relatedArticle.excerpt}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </article>
    </div>
  );
}