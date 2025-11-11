/**
 * @fileoverview Drag and Drop Context for Cutting List Builder
 * @module cutting-list-builder/components
 * @version 3.0.0 - UI/UX v3.0
 */

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, alpha } from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";

interface DraggableListContextProps {
  items: Array<{ id: string; [key: string]: unknown }>;
  onReorder: (items: Array<{ id: string; [key: string]: unknown }>) => void;
  children: (
    items: Array<{ id: string; [key: string]: unknown }>,
  ) => React.ReactNode;
  renderDragOverlay?: (activeId: string | null) => React.ReactNode;
}

/**
 * Drag and Drop Context Component
 * Provides drag and drop functionality for lists
 */
export const DraggableListContext: React.FC<DraggableListContextProps> = ({
  items,
  onReorder,
  children,
  renderDragOverlay,
}) => {
  const ds = useDesignSystem();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag interaction
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      onReorder(reorderedItems);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {children(items)}
      </SortableContext>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {activeId ? (
          <Box
            sx={{
              opacity: 0.9,
              boxShadow: `${ds.shadows.soft.xl}, 0 0 0 1px ${alpha(ds.colors.primary.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
              transform: "scale(1.02)",
            }}
          >
            {renderDragOverlay ? renderDragOverlay(activeId) : null}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
