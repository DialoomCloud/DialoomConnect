import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MediaEmbed } from "./media-embed";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Trash2, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import type { MediaContent } from "@shared/schema";

interface SortableMediaItemProps {
  content: MediaContent;
  showEdit: boolean;
  onEdit?: (content: MediaContent) => void;
  onView?: (content: MediaContent) => void;
  onDelete?: (id: string) => void;
  deleteDisabled?: boolean;
}

function SortableMediaItem({ content, showEdit, onEdit, onView, onDelete, deleteDisabled }: SortableMediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move relative group"
    >
      <MediaEmbed
        content={content}
        showEdit={showEdit}
        onEdit={onEdit}
        onView={onView}
      />
      {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(content.id);
          }}
          disabled={deleteDisabled}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

interface SortableMediaGridProps {
  media: MediaContent[];
  showEdit: boolean;
  onEdit?: (content: MediaContent) => void;
  onView?: (content: MediaContent) => void;
  onAddNew?: () => void;
}

export function SortableMediaGrid({ media, showEdit, onEdit, onView, onAddNew }: SortableMediaGridProps) {
  const [items, setItems] = useState(media);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/media/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Contenido eliminado",
        description: "El contenido multimedia se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido.",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update the order in the backend
      try {
        const mediaIds = newItems.map((item) => item.id);
        await apiRequest("/api/media/order", {
          method: "PUT",
          body: JSON.stringify({ mediaIds }),
        });
        
        // Invalidate the media query to refresh the order
        queryClient.invalidateQueries({ queryKey: ["/api/media"] });
        
        toast({
          title: "Orden actualizado",
          description: "El orden del contenido multimedia se ha actualizado correctamente.",
        });
      } catch (error) {
        console.error("Error updating media order:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el orden del contenido.",
          variant: "destructive",
        });
        // Revert the order on error
        setItems(media);
      }
    }
  };

  // Update items when media prop changes
  if (media.length !== items.length || media.some((m, i) => m.id !== items[i]?.id)) {
    setItems(media);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((content) => (
            <SortableMediaItem
              key={content.id}
              content={content}
              showEdit={showEdit}
              onEdit={onEdit}
              onView={onView}
              onDelete={(id) => deleteMediaMutation.mutate(id)}
              deleteDisabled={deleteMediaMutation.isPending}
            />
          ))}
          {/* Add Content Placeholder */}
          {onAddNew && (
            <div 
              onClick={onAddNew}
              className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center aspect-video hover:border-[hsl(244,91%,68%)] transition-colors cursor-pointer"
            >
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">Agregar nuevo contenido</p>
              <p className="text-sm text-gray-400 mt-1">YouTube, Videos MP4 o Imágenes</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}