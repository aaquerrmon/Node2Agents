import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { dracula } from "@uiw/codemirror-theme-dracula";

const BehaviorNode = ({ data }) => {
  const [behaviorType, setBehaviorType] = useState("one_shot");
  const [behaviorLabel, setBehaviorLabel] = useState("Behavior Name");
  const [behaviorArgs, setBehaviorArgs] = useState({});
  const [hovered, setHovered] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [code, setCode] = useState("");

  const handleBehaviorTypeChange = (type) => {
    data.setBehaviorType(type);
    data.setBehaviorArgs({});
    setBehaviorType(type);
    setBehaviorArgs({});
  };

  const handleBehaviorArgsChange = (key, value) => {
    data.setBehaviorArgs({[key]: value })
    setBehaviorArgs((prev) => ({ ...prev, [key]: value }));
  };  

  const handleSaveCode = () => {
    if (data.setCode) {
      data.setCode(code); // Ahora sí se actualizará el código en el nodo
    }
    setIsCodeOpen(false);
  };
  

  return (
    <div
      style={{
        padding: 10,
        border: "1px solid black",
        background: "lightgray",
        borderRadius: 5,
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} id="left" />

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
        placeholder="Behavior Name"
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

        {/* Selector de comportamiento */}
        <select
          value={behaviorType}
          onChange={(evt) => handleBehaviorTypeChange(evt.target.value)}
          style={{
            width: "90%",
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="one_shot">One Shot</option>
          <option value="periodic">Periodic</option>
          <option value="msg_rcv">Message Received (Cyclic)</option>
        </select>

        {/* Configuración específica de cada tipo de comportamiento */}
        {behaviorType === "one_shot" && (
          <input
            type="number"
            placeholder="Delay (seconds)"
            value={behaviorArgs.delay || ""}
            onChange={(evt) =>
              handleBehaviorArgsChange("delay", evt.target.value)
            }
            style={{
              width: "90%",
              padding: "6px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        )}
        {behaviorType === "periodic" && (
          <input
            type="number"
            placeholder="Period (seconds)"
            value={behaviorArgs.period || ""}
            onChange={(evt) =>
              handleBehaviorArgsChange("period", evt.target.value)
            }
            style={{
              width: "90%",
              padding: "6px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        )}
        {behaviorType === "msg_rcv" && (
          <input
            type="number"
            placeholder="Time waiting"
            value={behaviorArgs.time_waiting || ""}
            onChange={(evt) =>
              handleBehaviorArgsChange("time_waiting", evt.target.value)
            }
            style={{
              width: "90%",
              padding: "6px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        )}

        {/* Botón para abrir el editor de código */}
        <button
          onClick={() => setIsCodeOpen(true)}
          style={{
            padding: "5px 10px",
            background: "#28A745",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Edit Code
        </button>
      </div>

      {/* Modal para el editor de código */}
      {isCodeOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            width: "400px",
            zIndex: 1000,
          }}
        >
          <h3>Edit Behavior Code</h3>
          <CodeMirror
            value={code}
            theme={dracula}
            extensions={[python()]}
            onChange={(value) => data.setCode(value)}
            style={{ width: "100%", borderRadius: "5px", overflow: "hidden" }}
          />
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleSaveCode}
              style={{
                padding: "8px 12px",
                background: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setIsCodeOpen(false)}
              style={{
                padding: "8px 12px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorNode;
