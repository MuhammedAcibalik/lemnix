/**
 * @fileoverview Draggable Product Section Wrapper
 * @module cutting-list-builder/components
 * @version 3.0.0 - Drag & Drop Support
 */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";

interface DraggableWrapperProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Draggable wrapper component for sections and items
 * Uses dnd-kit for smooth drag and drop functionality
 */
export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  id,
  children,
  disabled = false,
}) => {
  const ds = useDesignSystem();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      {/* Drag Handle */}
      {!disabled && (
        <Box
          {...attributes}
          {...listeners}
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "grab",
            padding: ds.spacing["2"],
            opacity: 0.4,
            transition: "opacity 0.2s",
            zIndex: 10,
            "&:hover": {
              opacity: 1,
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          <DragIndicator
            sx={{
              fontSize: 20,
              color: ds.colors.text.secondary,
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          paddingLeft: disabled ? 0 : ds.spacing["6"],
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
