import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SessionRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  hostName: string;
}

export function SessionRatingModal({ isOpen, onClose, bookingId, hostName }: SessionRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/reviews`, {
        bookingId,
        rating,
        comment: comment.trim(),
      });

      toast({
        title: "¡Gracias por tu valoración!",
        description: "Tu opinión nos ayuda a mejorar",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar tu valoración. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cómo fue tu sesión con {hostName}?</DialogTitle>
          <DialogDescription>
            Tu valoración ayudará a otros usuarios a tomar mejores decisiones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-600">Califica tu experiencia</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium text-gray-700">
                {rating === 1 && "Muy insatisfecho"}
                {rating === 2 && "Insatisfecho"}
                {rating === 3 && "Neutral"}
                {rating === 4 && "Satisfecho"}
                {rating === 5 && "Muy satisfecho"}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comparte tu experiencia (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder="¿Qué te gustó? ¿Qué podría mejorar?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Enviando..." : "Enviar valoración"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}