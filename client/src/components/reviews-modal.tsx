import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Review {
  id: string;
  userId: string;
  hostId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userFirstName?: string;
  userLastName?: string;
  sessionType?: string;
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string;
  hostName: string;
  totalReviews: number;
  averageRating: number;
}

export function ReviewsModal({ 
  isOpen, 
  onClose, 
  hostId, 
  hostName,
  totalReviews,
  averageRating 
}: ReviewsModalProps) {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Mock reviews data - esto será reemplazado por datos reales de la API
  const mockReviews: Review[] = [
    {
      id: "1",
      userId: "user1",
      hostId: hostId,
      rating: 5,
      comment: "Excelente sesión, muy profesional y útil. Me ayudó mucho con mis objetivos.",
      createdAt: "2025-01-15T10:30:00Z",
      userFirstName: "María",
      userLastName: "González",
      sessionType: "Consultoría"
    },
    {
      id: "2", 
      userId: "user2",
      hostId: hostId,
      rating: 4,
      comment: "Muy buena experiencia, conocimiento amplio del tema. Recomendable.",
      createdAt: "2025-01-10T14:20:00Z",
      userFirstName: "Carlos",
      userLastName: "Martín",
      sessionType: "Mentoring"
    },
    {
      id: "3",
      userId: "user3", 
      hostId: hostId,
      rating: 5,
      comment: "Increíble atención al detalle y gran capacidad de explicación. Definitivamente volvería a reservar.",
      createdAt: "2025-01-05T16:45:00Z",
      userFirstName: "Ana",
      userLastName: "López",
      sessionType: "Formación"
    },
    {
      id: "4",
      userId: "user4",
      hostId: hostId,
      rating: 4,
      comment: "Sesión muy productiva, buenos consejos prácticos.",
      createdAt: "2024-12-28T09:15:00Z",
      userFirstName: "David",
      userLastName: "Rodríguez",
      sessionType: "Consultoría"
    },
    {
      id: "5",
      userId: "user5",
      hostId: hostId,
      rating: 5,
      comment: "Excelente profesional, muy claro en las explicaciones y gran experiencia en el sector.",
      createdAt: "2024-12-20T11:30:00Z",
      userFirstName: "Laura",
      userLastName: "Fernández",
      sessionType: "Mentoring"
    }
  ];

  const sortedReviews = [...mockReviews].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    } else {
      return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("reviews.title", "Reseñas de")} {hostName}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">
              ({totalReviews} {totalReviews === 1 ? t("reviews.review", "reseña") : t("reviews.reviews", "reseñas")})
            </span>
          </div>
        </DialogHeader>

        {/* Controles de ordenamiento */}
        <div className="flex items-center gap-4 py-4 border-b">
          <span className="text-sm font-medium">{t("reviews.sortBy", "Ordenar por")}:</span>
          <Select value={sortBy} onValueChange={(value: "date" | "rating") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t("reviews.date", "Fecha")}</SelectItem>
              <SelectItem value="rating">{t("reviews.rating", "Valoración")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">
                {sortBy === "date" ? t("reviews.newest", "Más reciente") : t("reviews.highest", "Más alta")}
              </SelectItem>
              <SelectItem value="asc">
                {sortBy === "date" ? t("reviews.oldest", "Más antigua") : t("reviews.lowest", "Más baja")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de reseñas */}
        <div className="overflow-y-auto flex-1 space-y-4 py-4">
          {sortedReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(188,100%,38%)] flex items-center justify-center text-white font-medium">
                    {review.userFirstName?.[0]}{review.userLastName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {review.userFirstName} {review.userLastName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(review.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                  {review.sessionType && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {review.sessionType}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            {t("common.close", "Cerrar")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}