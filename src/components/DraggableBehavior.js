import React from "react";
import { useDrag } from "react-dnd";

const DraggableBehavior = ({ behavior }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BEHAVIOR",
    item: { behavior },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        padding: "8px",
        margin: "5px",
        backgroundColor: "#fff",
        border: "1px solid black",
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {behavior}
    </div>
  );
};

export default DraggableBehavior;
