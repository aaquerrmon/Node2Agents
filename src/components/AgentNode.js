import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { dracula } from '@uiw/codemirror-theme-dracula';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

const AgentNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupText, setSetupText] = useState("");
  const [behaviors, setBehaviors] = useState([]);

  const addBehavior = () => {
    if (!data || typeof data.onAddBehavior !== "function") {
      console.warn("⚠️ Advertencia: onAddBehavior no está definido en data.");
      return;
    }

    const behaviorID = uuidv4();
  
    const newBehavior = {
      id: behaviorID,
      data: {
        typeBehavior: "One_shot",
        label: "New Behavior",
        args: {},
        //parentAgent: data.id || "unknown",
        code: "",
      }
    };
  
    setBehaviors((prev) => [...prev, newBehavior]);
    data.onAddBehavior(newBehavior);
  };
  
  // Función para actualizar un behavior existente
  const handleBehaviorChange = (behaviorId, newValue) => {
    setBehaviors((prevBehaviors) =>
      prevBehaviors.map((b) =>
        b.id === behaviorId
          ? { ...b, data: { ...b.data, label: newValue } } // Acceder correctamente a la label dentro de data
          : b
      )
    );
  };
  
  

  return (
    <div
      style={{
        padding: 10,
        background: "#ffffff",
        borderRadius: 8,
        border: "2px solid #007BFF",
        width: 220,
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <Trash2
          size={18}
          color="red"
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            cursor: "pointer",
          }}
          onClick={data.removeAgent}
        />
      )}

      <input
        type="text"
        placeholder="Agent Name"
        value={data.label}
        onChange={(evt) => {
          if (typeof data.onChange === "function") {
            data.onChange(evt.target.value);
          } else {
            console.error("Error: onChange no está definido en data");
          }
        }}
        style={{
          width: "90%",
          padding: "6px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          textAlign: "center",
        }}
      />

      <button
        style={{
          padding: "5px 10px",
          background: "#28A745",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
        onClick={() => setIsSetupOpen(true)}
      >
        Setup
      </button>

      {/* Botón para agregar un comportamiento */}
      <button
        onClick={addBehavior}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
        }}
      >
        Add Behavior
      </button>

      {/* Handles de conexión */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />

      {/* Modal para Setup con CodeMirror */}
      {isSetupOpen && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: 20,
            borderRadius: 8,
            border: "1px solid #ccc",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 10,
            width: "300px",
          }}
        >
          <h4>Setup Configuration (Python)</h4>
          <CodeMirror
            value={setupText}
            height="200px"
            theme={dracula}
            extensions={[python()]}
            onChange={(value) => setSetupText(value)}
          />
          <div style={{ marginTop: 10, textAlign: "right" }}>
            <button
              style={{
                padding: "5px 10px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                marginRight: 5,
              }}
              onClick={() => setIsSetupOpen(false)}
            >
              Cancel
            </button>
            <button
              style={{
                padding: "5px 10px",
                background: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
              onClick={() => {
                console.log("Setup saved:", setupText);
                setIsSetupOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentNode;
