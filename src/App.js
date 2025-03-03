import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import AgentNode from "./components/AgentNode";
import BehaviorNode from "./components/BehaviorNode";
import "reactflow/dist/style.css";
import DraggableBehavior from "./components/DraggableBehavior";
import { useDrop } from "react-dnd";

let nodeId = 1;

const nodeTypes = {
  agent: AgentNode,
  behavior: BehaviorNode
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [lineType, setLineType] = useState("continuous");

  useEffect(() => {
    console.log("Nodes updated:", nodes);
    console.log("Edges updated:", edges);
  }, [nodes, edges]);

  // Zona de dropeo para soltar comportamientos y convertirlos en nodos
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "BEHAVIOR",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const newNode = {
        id: `behavior-${nodeId}`,
        position: { x: offset.x - 250, y: offset.y - 50 }, // Ajuste para que aparezca donde se suelta
        data: { label: item.behavior },
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);
      nodeId += 1;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const addAgent = useCallback(() => {
    const agentId = `agent-${nodeId}`;
    const newNode = {
      id: agentId,
      type: "agent",
      data: {
        label: `Agent ${nodeId}`,
        behaviors: [{ type: "setup", args: {} }],
        onChange: (newValue) =>
          setNodes((nds) =>
            nds.map((node) =>
              node.id === agentId
                ? { ...node, data: { ...node.data, label: newValue || `Agent ${nodeId}` } }
                : node
            )
          ),
        onAddBehavior: (behavior) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === agentId
                ? { ...node, data: { ...node.data, behaviors: [...node.data.behaviors, behavior] } }
                : node
            )
          );
          addBehaviorNode(behavior, agentId); 
        },
        onAddBehaviorNode: (behavior) => addBehaviorNode(behavior, agentId), 
        onRemoveBehavior: (index) =>
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === agentId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      behaviors: node.data.behaviors.filter((_, i) => i !== index),
                    },
                  }
                : node
            )
          ),
      },
      position: { x: Math.random() * 300, y: Math.random() * 300 },
    };
  
    setNodes((nds) => [...nds, newNode]);
    nodeId += 1;
  }, [setNodes]);
  
  

  const addBehaviorNode = (behavior, agentId) => {

    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: behavior.id, // Usamos el ID existente del behavior
        type: "behavior",
        position: { x: 300, y: Math.random() * 400 },
        data: {
          ...behavior.data, 
          parentAgent: agentId || "unknown",
          onChange: (newValue) =>
            setNodes((nds) =>
              nds.map((node) =>
                node.id === behavior.id
                  ? { ...node, data: { ...node.data, label: newValue || `Agent ${nodeId}` } }
                  : node
              )
            ),
          setCode: (newCode) =>
            setNodes((nds) =>
              nds.map((node) => 
                node.id === behavior.id
                  ? { ...node, data: { ...node.data, code: newCode || "" } }
                  : node
                )
              ),
          setBehaviorType: (newType) =>
            setNodes((nds) =>
              nds.map((node) => 
                node.id === behavior.id
                  ? { ...node, data: { ...node.data, typeBehavior: newType || "One_shot" } }
                  : node
                )
              ),
          setBehaviorArgs: (newArgs) =>
            setNodes((nds) =>
              nds.map((node) => 
                node.id === behavior.id
                  ? { ...node, data: { ...node.data, args: newArgs || {} } }
                  : node
                )
              ),
          onRemove: () => removeNode(behavior.id), // Eliminamos con el ID correcto
        },
      },
    ]);

    setEdges((prevEdges) => [
      ...prevEdges,
      {
        id: `edge-${behavior.id}`, // Usamos el ID del behavior en el edge
        source: agentId,
        target: behavior.id,
        sourceHandle: "right",
        targetHandle: "left",
        type: "smoothstep",
      },
    ]);
    console.log(nodes)
};

  
  const onConnect = useCallback(
    (params) => {
      const newEdge = { 
        ...params,
        sourceHandle: params.sourceHandle || "right",  // Asegura que haya un handle definido
        targetHandle: params.targetHandle || "top",
        style: {
          stroke: "black",
          strokeWidth: 2,
          strokeDasharray: lineType === "dashed" ? "5 5" : "0",
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [lineType]
  );

  const handleGenerateCode = async () => {
    try {
      console.log("Nodos antes de procesar:", nodes);
      console.log("Edges antes de procesar:", edges);
  
      // Construir estructura de agentes con sus comportamientos conectados
      const agentData = nodes
        .filter((node) => node.type === "agent")
        .map((agent) => {
          const connectedBehaviors = edges
            .filter((edge) => edge.source === agent.id) // Filtrar conexiones desde el agente
            .map((edge) => {
              const behaviorNode = nodes.find((n) => n.id === edge.target);
              return behaviorNode
                ? {
                    id: behaviorNode.id,
                    label: behaviorNode.data.label || "Unnamed Behavior",
                    type: behaviorNode.data.typeBehavior || "One_shot",
                    args: behaviorNode.data.args || {},
                  }
                : null;
            })
            .filter(Boolean); // Eliminar valores nulos
  
          return {
            id: agent.id,
            label: agent.data.label || "Unnamed Agent",
            behaviors: connectedBehaviors,
          };
        });
  
      // Lista de todos los behaviors con su información completa
      const behaviorData = nodes
        .filter((node) => node.type === "behavior")
        .map((behavior) => ({
          id: behavior.id,
          label: behavior.data.label || "Unnamed Behavior",
          type: behavior.data.typeBehavior || "One_shot",
          args: behavior.data.args || {},
        }));
  
      // Verificar que los edges tienen datos correctos
      const connections = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      }));
  
      console.log("Payload a enviar:");
      console.log({
        agents: agentData,
        behaviors: behaviorData,
        connections: connections,
      });
  
      // Construcción del payload a enviar
      const payload = {
        agents: agentData,
        behaviors: behaviorData,
        connections: connections,
      };
  
      const response = await fetch("http://127.0.0.1:5000/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Error al generar código: ${response.status}`);
      }
  
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error("Error en handleGenerateCode:", error);
    }
  };
  
  
  

  const removeAgent = (id) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const removeNode = (nodeId) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };
  

  const removeEdge = (id) => {
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== id));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* Barra lateral con comportamientos */}
      <div style={styles.sidebar}>
        <h4>Comportamientos</h4>
        <DraggableBehavior behavior="Atacar" />
        <DraggableBehavior behavior="Defender" />
        <DraggableBehavior behavior="Patrullar" />
      </div>

      {/* Área principal de React Flow con drop */}
      <div ref={drop} style={styles.flowArea}>
        <div style={styles.controls}>
          <label>Conexion type: </label>
          <select onChange={(e) => setLineType(e.target.value)} value={lineType}>
            <option value="continuous">Friendship</option>
            <option value="dashed">Inheritance</option>
          </select>
        </div>

        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              removeAgent: () => removeAgent(node.id),
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={(event, edge) => removeEdge(edge.id)}
          fitView
          nodeTypes={nodeTypes}
        />
      </div>

      <button onClick={addAgent} style={styles.buttonGreen}>Add Agent</button>
      <button onClick={handleGenerateCode} style={styles.buttonBlue}>Generate SPADE Code</button>
      <textarea value={generatedCode} readOnly style={styles.textArea} />
    </div>
  );
};

const styles = {
  sidebar: {
    width: "200px", padding: "10px", borderRight: "1px solid black",
    backgroundColor: "#f4f4f4"
  },
  flowArea: {
    flex: 1, position: "relative"
  },
  controls: {
    position: "absolute", top: 10, right: 10, zIndex: 10,
    background: "white", padding: "5px", borderRadius: "5px", boxShadow: "0 0 5px rgba(0,0,0,0.1)"
  },
  buttonGreen: {
    position: "absolute", top: 10, left: 10, zIndex: 10,
    padding: "10px", backgroundColor: "#4CAF50", color: "white",
    border: "none", borderRadius: "5px"
  },
  buttonBlue: {
    position: "absolute", top: 60, left: 10, zIndex: 10,
    padding: "10px", backgroundColor: "#007BFF", color: "white",
    border: "none", borderRadius: "5px"
  },
  textArea: {
    position: "absolute", top: 120, left: 10, zIndex: 10,
    width: "400px", height: "300px", padding: "10px",
    backgroundColor: "#f8f8f8", border: "1px solid #ddd",
    borderRadius: "5px", fontFamily: "monospace"
  }
};

export default App;
