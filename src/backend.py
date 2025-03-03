from flask import Flask, request, jsonify
from flask_cors import CORS
import spade
from spade.behaviour import OneShotBehaviour, CyclicBehaviour, PeriodicBehaviour
from spade.message import Message
from spade.template import Template

app = Flask(__name__)
CORS(app)

indent = "    "

def get_behaviors_nosetup(behaviors):
    """Filtra los comportamientos que no son de tipo 'setup'."""
    return [behavior for behavior in behaviors if behavior.get("typeBehavior", "").lower() != "setup"]

def generate_behavior_code(behavior):
    """Genera el código Python para un comportamiento en SPADE."""
    behavior_type = behavior.get("typeBehavior", "One_shot").lower()
    behavior_args = behavior.get("args", {})
    user_code = behavior.get("code", "").strip()
    code = ""

    # Si el usuario no ha definido código, generamos un código predeterminado
    if not user_code:
        if behavior_type == "one_shot":
            delay = behavior_args.get("delay", 1.0)
            user_code = (
                f'print("Ejecutando comportamiento OneShot con delay {delay}")\n'
                f'msg = Message(to="receiver@your_xmpp_server")\n'
                f'msg.set_metadata("performative", "inform")\n'
                f'msg.body = "Hola desde {behavior["label"]}"\n'
                f'await self.send(msg)\n'
                f'print("Mensaje enviado!")\n'
                f'await self.agent.stop()\n'
            )
        elif behavior_type == "periodic":
            period = behavior_args.get("period", 1.0)
            user_code = (
                f'print("Ejecutando comportamiento periódico cada {period} segundos")\n'
                f'msg = Message(to="receiver@your_xmpp_server")\n'
                f'msg.body = "Mensaje periódico"\n'
                f'await self.send(msg)\n'
            )
        elif behavior_type == "msg_rcv":
            time_waiting = behavior_args.get("time_waiting", 1.0)
            user_code = (
                f'print("Esperando mensaje durante {time_waiting} segundos")\n'
                f'msg = await self.receive(timeout={time_waiting})\n'
                f'if msg:\n'
                f'    print("Mensaje recibido:", msg.body)\n'
                f'else:\n'
                f'    print("No se recibió ningún mensaje")\n'
            )

    # Nombre de clase basado en el ID del comportamiento
    class_name = f"Behavior_{behavior['id'][:8]}"
    code += f"{indent}class {class_name}({behavior_type.capitalize()}Behaviour):\n"
    code += f"{indent*2}async def run(self):\n"
    
    for line in user_code.split("\n"):
        code += f"{indent*3}{line.strip()}\n"

    return code, class_name  # Retorna código y nombre de clase

def generate_agent_code(agent, edges):
    """Genera el código de un agente SPADE con sus comportamientos conectados."""
    agent_name = agent["label"].replace(" ", "_")
    behaviors = get_behaviors_nosetup(agent.get("behaviors", []))
    code = f"class {agent_name}Agent(spade.agent.Agent):\n"
    
    behavior_classes = []
    for behavior in behaviors:
        behavior_code, behavior_class_name = generate_behavior_code(behavior)
        code += behavior_code + "\n"
        behavior_classes.append(behavior_class_name)

    code += f"\n{indent}async def setup(self):\n"
    code += f'{indent*2}print("Configurando el agente {agent_name}")\n'
    
    for i, behavior_class in enumerate(behavior_classes):
        code += f'{indent*2}self.behavior_{i} = {behavior_class}()\n'
        code += f'{indent*2}self.add_behaviour(self.behavior_{i})\n'

    return code

def generate_spade_code(agents, edges):
    """Genera el código Python completo para los agentes SPADE y sus comportamientos."""
    code = (
        "import spade\n"
        "from spade.behaviour import OneShotBehaviour, CyclicBehaviour, PeriodicBehaviour\n"
        "from spade.message import Message\n"
        "from spade.template import Template\n\n"
    )

    # Generar código de cada agente
    for agent in agents:
        code += generate_agent_code(agent, edges) + "\n"

    # Código de ejecución principal
    code += "async def main():\n"
    for agent in agents:
        agent_name = agent["label"].replace(" ", "_")
        code += f"{indent}{agent_name} = {agent_name}Agent('{agent_name.lower()}@your_xmpp_server', 'password')\n"
        code += f"{indent}await {agent_name}.start(auto_register=True)\n\n"
    
    for agent in agents:
        agent_name = agent["label"].replace(" ", "_")
        code += f"{indent}await {agent_name}.stop()\n"
    
    code += f'{indent}print("Agentes finalizados")\n\n'
    code += "if __name__ == '__main__':\n"
    code += f"{indent}spade.run(main())\n"
    
    return code

@app.route("/generate-code", methods=["POST"])
def generate_code():
    """API que recibe nodos y edges y devuelve el código generado."""
    try:
        data = request.json
        agents = data.get("agents", [])
        edges = data.get("connections", [])  # Cambié "edges" por "connections"

        print("Nodes: ", agents)
        print("Edges: ", edges)

        spade_code = generate_spade_code(agents, edges)
        return jsonify({"code": spade_code}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
