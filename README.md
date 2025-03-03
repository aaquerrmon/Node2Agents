# Node2Agents  

Node2Agents is a web application that allows users to visually design agent-based systems using a node-based interface. The designed agents and behaviors are then converted into executable code using [SPADE](https://github.com/javipalanca/spade), a multi-agent system framework.  

## Features  

- **Drag-and-Drop Interface**: Create and connect agents and behaviors easily.  
- **Automatic Code Generation**: Convert visual models into executable Python SPADE code.  
- **Customizable Behaviors**: Define different types of behaviors, such as one-shot, cyclic, and periodic.  

## Tech Stack  

- **Frontend**: React, React Flow  
- **Backend**: Flask, SPADE  

---

## Installation  

### Prerequisites  

- **Node.js** (for the frontend)  
- **Python 3.x** (for the backend)  
- **Git** (optional, for cloning the repository)  

### Clone the Repository  

```bash
git clone https://github.com/aaquerrmon/Node2Agents.git
cd Node2Agents
```

## Backend Setup

1. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the backend server:

```bash
python3 ./src/backend.py
```

## Frontend Setup

1. Install dependencies:

```bash
npm install
```

2. Start the React development server:
```bash
HOST=localhost
npm start
```

## How to Use

1. Open http://localhost:3000/ in your browser.
2. Drag and drop agents and behaviors onto the canvas.
3. Connect behaviors to agents using edges.
4. Click the Generate Code button to send the data to the backend.
5. The backend processes the request and returns the generated Python SPADE code.
6. Copy the generated code and run it to execute the agent system.

