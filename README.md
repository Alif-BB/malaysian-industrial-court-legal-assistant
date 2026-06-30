# Malaysian Industrial Court Legal Assistant (Google ADK Boilerplate)

This repository contains a production-grade prototype boilerplate for the **Malaysian Industrial Court Legal Assistant**, built using the open-source **Google Agent Development Kit (ADK)** and powered by **Gemini 2.5 Pro**.

---

## Architecture Overview
The assistant utilizes a modular, tool-centric design:
1. **Multi-Criteria Parser:** Uses Gemini to parse loose, conversational queries into structured `SearchCriteria` Pydantic models.
2. **Vertex AI RAG Engine (Google Drive):** Leverages Google Drive folder syncing with the Vertex AI RAG Engine to perform deep semantic searches on hundreds of scanned/digitalized Industrial Court award PDFs.
3. **Draft Generation Engine:** Implements legal styling standards of Malaysian Industrial Courts to instantly construct formal Award drafts under Section 20(3) of the Industrial Relations Act 1967.

---

## 🚀 Step-by-Step Setup Instructions

### 1. Prerequisite & Local Environment Setup
Ensure you have **Python 3.10+** installed on your workstation.

```bash
# Clone the repository and navigate to the root directory
cd malaysian-industrial-court-assistant

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt
```

### 2. Configure API Keys
The ADK framework automatically locates the active Google Cloud/Gemini credentials. Assign your Gemini key:

```bash
# On macOS/Linux:
export GEMINI_API_KEY="your-gemini-api-key-here"

# On Windows (Command Prompt):
set GEMINI_API_KEY="your-gemini-api-key-here"

# On Windows (PowerShell):
$env:GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Spin Up the Local ADK Developer Web UI
The Google ADK includes a robust "convention-over-configuration" web dashboard that auto-generates input interfaces from your Pydantic schemas and lets you chat with your Agent instantly.

Start the dev server by running:

```bash
adk web start --agent agent:IndustrialCourtAgent --port 8080
```

Open your browser and navigate to `http://localhost:8080` to experience the visual workspace, inspect active tool schemas, monitor tool execution calls, and test queries.

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
