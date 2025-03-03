# Node2Agents

Node2Agents is a web-based tool that allows users to visually design multi-agent systems using a node-based editor. The system generates Python code using the SPADE framework to define and execute agents with specified behaviors.

## Features

Visual design of agent-based systems

Automatic code generation for SPADE agents

Supports different agent behaviors (One-shot, Periodic, Message Reception)

Easy integration with XMPP-based multi-agent systems

## Installation

### Prerequisites

Ensure you have the following installed:

Python 3.8+

Node.js 16+

Git

### Clone the repository

git clone https://github.com/aaquerrmon/Node2Agents.git
cd Node2Agents

### Install backend dependencies

cd backend
pip install -r requirements.txt

### Install frontend dependencies

cd ../frontend
npm install

## Running the Application

### Start the Backend

cd backend
python backend.py

The backend will start at http://127.0.0.1:5000/.

### Start the Frontend

cd ../frontend
npm start

The frontend will be available at http://localhost:3000/.

## Main Scripts Overview

### Backend (backend.py)

Implements a Flask API that receives agent and behavior configurations from the frontend.

Generates Python code for SPADE-based agents.

Defines different behavior types (OneShot, Periodic, Message Reception).

### Frontend (App.js & related components)

Uses React Flow to allow users to design agents visually.

Sends structured agent and behavior data to the backend.

Receives and displays the generated code.

## API Endpoints

Generate Agent Code

Endpoint: POST /generate-code

Request Body:

{
  "agents": [
    {
      "id": "agent-1",
      "label": "Agent 1",
      "behaviors": [
        {
          "id": "4de7b811-00ce-406c-9119-49373d4580a2",
          "label": "New Behavior",
          "type": "One_shot",
          "args": {"delay": "1"}
        }
      ]
    }
  ],
  "connections": []
}

Response:

{
  "code": "Generated SPADE agent Python code here"
}

## Contributing

Feel free to fork this repository and submit pull requests with improvements or bug fixes!

## License

This project is open-source and available under the MIT License.

