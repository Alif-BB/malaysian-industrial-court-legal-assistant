# Malaysian Industrial Court Legal Assistant (Google ADK Boilerplate)

This repository contains a production-grade prototype boilerplate for the **Malaysian Industrial Court Legal Assistant**, built using the open-source **Google Agent Development Kit (ADK)** and powered by **Gemini 2.5 Pro**.

---

## 🏛️ Architecture Overview

The assistant utilizes a modular, tool-centric design connecting three core layers:

1. **Frontend UI (React/Vite):** A premium, responsive interface running on port `3000` with four workspace tabs:
   * 🔍 **Direct GCS PDF Search:** Direct document lookup, filtering, and live PDF preview streaming.
   * 💬 **AI Consultant Chatbot:** Deep natural language reasoning with Malaysian legal-centric persona.
   * 📜 **Drafting Panel:** Auto-generates formal Award templates for Section 20(3) Industrial Relations Act cases.
   * 💻 **Code Explorer:** Quick local walkthrough and code reviewer console.
2. **ADK Agent Backend (Python/ADK):** Starts on port `8082` using the Google ADK CLI. It exposes two tools to Gemini:
   * `search_industrial_awards`: Handles conversational, multi-criteria parsing and querying of Vertex AI search indexes.
   * `generate_industrial_court_template`: Formulates professional legal drafts incorporating key case facts.
3. **Vertex AI Search Companion (FastAPI):** A fast backend proxy on port `8083` managing direct searches, snippet extraction, and secure GCS PDF download/streaming.

---

## 🚀 Step-by-Step Setup Instructions

### 1. Local Environment Setup

Ensure you have **Python 3.10+** and **Node.js 18+** installed.

#### Python Backend Setup

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required Python packages
pip install -r requirements.txt
```

#### Node.js Frontend Setup

```bash
# Install frontend dependencies
npm install
```

### 2. Configure API Keys & GCP Authentication

The project utilizes Vertex AI Enterprise and Discovery Engine. Make sure you are authenticated to Google Cloud and that your project is set:

```bash
# Authenticate your terminal
gcloud auth application-default login

# Optional: verify your .env file
# Ensure GCP_PROJECT_ID and VERTEX_SEARCH_DATA_STORE_ID match your Google Cloud variables.
```

### 3. Running the Project (Start All 3 Services)

To run the complete workspace, open **three terminal windows/tabs** and execute:

#### 🖥️ Terminal 1: Start ADK Agent Backend (Port 8082)

The Google ADK server handles agent orchestration and tool routing.

```bash
source venv/bin/activate
adk web --port 8082 --allow_origins "*" .
```

#### 🔍 Terminal 2: Start Search Companion API Server (Port 8083)

FastAPI handles direct document lookups and streams court PDFs.

```bash
source venv/bin/activate
python search_server.py
```

#### 🎨 Terminal 3: Start React/Vite Frontend (Port 3000)

Vite serves the high-fidelity UI.

```bash
npm run dev
```

Now open **`http://localhost:3000`** in your browser to interact with the Legal Assistant.

---

## 📂 Production Deployment: Linking Google Drive to Vertex AI RAG Engine

To query high-volumes of real Malaysian Industrial Court Award documents (PDFs/DOCX) stored in a shared corporate Google Drive folder, follow these Google Cloud production steps:

### Step A: Set Up the Google Drive Folder

1. Create a secure folder in Google Drive (e.g., `Malaysian_Industrial_Court_Awards`).
2. Upload the target digitalized court awards (PDF, Word, or text files up to the year 2026).
3. Note the unique **Folder ID** from the Google Drive folder URL (the string after `folders/`).

### Step B: Provision a RAG Corpus in Vertex AI

Using the Google Cloud CLI or Python SDK, provision your Vertex AI RAG Corpus:

```python
from google.cloud import aiplatform_v1beta1 as aiplatform

# Initialize client
client = aiplatform.PredictionServiceClient()

# 1. Create a RAG Corpus (vector storage)
rag_corpus = aiplatform.RagCorpus(
    display_name="Industrial_Court_Awards_Corpus",
    description="Corpus containing Malaysian Industrial Court awards up to 2026 synced from Google Drive."
)

# 2. Configure Google Drive Sync Connection
# Vertex AI will automatically sync, parse, chunk, and embed files in the background
rag_file_source = aiplatform.RagFileSource(
    google_drive_source=aiplatform.GoogleDriveSource(
        folder_ids=["YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE"]
    )
)
```

### Step C: Update `agent.py` for Live Production Queries

Replace the simulated/mocked RAG return inside `search_industrial_awards` with an active search query to Vertex AI:

```python
def search_industrial_awards(criteria: SearchCriteria) -> str:
    """
    Production-grade query execution against the synced Vertex AI RAG Corpus.
    """
    from google.cloud import aiplatform_v1beta1 as aiplatform
  
    # 1. Construct the semantic query string from parsed search criteria
    query_parts = []
    if criteria.claimant_or_union:
        query_parts.append(f"Claimant: {criteria.claimant_or_union}")
    if criteria.respondent:
        query_parts.append(f"Respondent: {criteria.respondent}")
    if criteria.keyword_summary:
        query_parts.append(f"Keywords: {criteria.keyword_summary}")
    
    query_str = " AND ".join(query_parts) if query_parts else "Malaysian Industrial Court Awards"
  
    # 2. Call the Vertex AI RAG Retrieval Service
    retrieval_client = aiplatform.VertexRagServiceClient()
    response = retrieval_client.retrieve_contexts(
        parent="projects/YOUR_PROJECT_ID/locations/us-central1",
        rag_corpus="projects/YOUR_PROJECT_ID/locations/us-central1/ragCorpora/YOUR_CORPUS_ID",
        query=aiplatform.RagQuery(text=query_str),
        retrieval_config=aiplatform.RagRetrievalConfig(top_k=5)
    )
  
    # 3. Format and join the retrieved chunks into a comprehensive Markdown response
    results = []
    for context in response.contexts:
        results.append(f"**Source Document:** {context.source_uri}\n\n**Excerpt:**\n> {context.text}\n")
    
    return "\n\n---\n\n".join(results)
```

---

## ⚖️ Legal References & Standard Precedents

This agent was designed in consultation with Malaysian Industrial Court chairmen standards, and utilizes precedents including:

* **Section 20(3) Industrial Relations Act 1967:** The core legislative framework for unfair dismissals.
* **Wong Chee Hong v. Lim Seng Seng [1983]:** Outlines the strict "contract test" for constructive dismissal actions.
* **Milan Auto Sdn. Bhd. v. Wong Yeh [1995]:** Outlines the dual function of the court during proceedings.

