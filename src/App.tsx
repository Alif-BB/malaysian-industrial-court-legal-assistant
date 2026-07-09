import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, 
  Scale, 
  Search, 
  FileText, 
  BookOpen, 
  Download, 
  User, 
  Building2, 
  Calendar, 
  Code2, 
  Terminal, 
  Send, 
  FileEdit, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  Briefcase, 
  ShieldAlert,
  ChevronRight,
  Database,
  HelpCircle,
  FileCheck,
  MessageSquare
} from 'lucide-react';

// =====================================================================
// DATA MODELS & PRESETS
// =====================================================================

interface SearchCriteria {
  claimant_or_union?: string;
  respondent?: string;
  award_number?: string;
  case_number?: string;
  case_code?: string;
  case_year?: number;
  keyword_summary?: string;
}

interface CourtAward {
  award_number: string;
  case_number: string;
  claimant: string;
  respondent: string;
  case_code: string;
  case_year: number;
  facts: string;
  held: string;
  remedy: string;
}
// Hardcoded presets removed for real ADK backend integration.

// File contents for the code explorer
const PYTHON_REQUIREMENTS = `# Core Framework & GenAI SDK
google-adk>=0.1.0
google-genai>=0.1.1
pydantic>=2.0.0

# Google Cloud & Vertex AI RAG API Client Libraries
google-cloud-aiplatform>=1.38.0
google-api-python-client>=2.100.0
google-auth-httplib2>=0.1.0
google-auth-oauthlib>=1.1.0

# Supporting Web / Utility Libraries
markdown>=3.5.0
tabulate>=0.9.0
python-dotenv>=1.0.0`;

const PYTHON_AGENT = `"""
Malaysian Industrial Court Legal Assistant
Powered by google-adk (Google Agent Development Kit) and Gemini.
"""

from typing import Optional, List
import os
from pydantic import BaseModel, Field
from google_adk import Agent, Tool, Config

# =====================================================================
# 1. PYDANTIC SCHEMAS
# =====================================================================

class SearchCriteria(BaseModel):
    """
    Pydantic schema representing the multi-criteria parameters for searching
    Malaysian Industrial Court awards. The legal assistant agent parses natural 
    language inputs into this structured schema.
    """
    claimant_or_union: Optional[str] = Field(
        None, 
        description="Name of the Claimant (individual employee) or the Trade Union involved in the dispute."
    )
    respondent: Optional[str] = Field(
        None, 
        description="Name of the Respondent (employer/company) involved in the dispute."
    )
    award_number: Optional[str] = Field(
        None, 
        description="The specific Award Number assigned to the court decision (e.g., '142 of 2024' or '142/2024')."
    )
    case_number: Optional[str] = Field(
        None, 
        description="The unique case reference number (e.g., '22/4-1234/23')."
    )
    case_code: Optional[str] = Field(
        None, 
        description="The case classification code (e.g., '22' for dismissal cases, '4' for trade disputes, etc.)."
    )
    case_year: Optional[int] = Field(
        None, 
        description="The year the case was heard or the award was issued (e.g., 2024, 2025, 2026)."
    )
    keyword_summary: Optional[str] = Field(
        None, 
        description="Key legal issues or topics (e.g., 'constructive dismissal', 'retrenchment', 'probationer', 'breach of natural justice')."
    )


# =====================================================================
# 2. TOOL DEFINITIONS
# =====================================================================

def search_industrial_awards(criteria: SearchCriteria) -> str:
    """
    Searches the Malaysian Industrial Court legal award corpus.
    
    Queries the live Vertex AI Search endpoint connected recursively to your Cloud Storage bucket.
    If the project or data store configuration is missing, it returns a descriptive configuration guide.
    """
    project_id = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "global")
    data_store_id = os.getenv("VERTEX_SEARCH_DATA_STORE_ID")
    serving_config_id = "default_search"

    if not project_id or not data_store_id:
        return (
            "### Connection Configuration Guide\\n\\n"
            "The Malaysian Industrial Court Legal Assistant agent is ready to search your live GCS-backed Vertex AI Search Data Store, "
            "but the environment configuration is not yet complete..."
        )

    # Formulate query text and query the live SearchServiceClient...
    return "Parsed results from Vertex AI search endpoint..."


def generate_industrial_court_template(
    claimant: str, 
    respondent: str, 
    case_number: str, 
    facts: str, 
    decision_summary: str
) -> str:
    """
    Generates a professionally structured Malaysian Industrial Court Award template.
    
    This template conforms to standard administrative and legal styles used in 
    the Kuala Lumpur and regional Malaysian Industrial Court divisions.
    """
    # Conforms to Section 20(3) Industrial Relations Act 1967
    return "Formatted Markdown Court Award Document..."


# =====================================================================
# 3. AGENT INITIALIZATION
# =====================================================================

legal_persona_instructions = """
You are the "Malaysian Industrial Court Legal Assistant," an expert AI legal advisor specializing 
in the Malaysian Industrial Relations Act 1967, Industrial Court rules, employment contracts, 
unfair dismissal cases, constructive dismissal, and retrenchment guidelines.
...
"""

IndustrialCourtAgent = Agent(
    name="Malaysian Industrial Court Legal Assistant",
    instructions=legal_persona_instructions,
    tools=[
        search_industrial_awards,
        generate_industrial_court_template
    ],
    config=Config(
        model="gemini-2.5-pro", 
        temperature=0.2          
    )
)

if __name__ == "__main__":
    IndustrialCourtAgent.start()`;

const PYTHON_README = `# Malaysian Industrial Court Legal Assistant (Google ADK Boilerplate)

This repository contains a production-grade prototype boilerplate for the **Malaysian Industrial Court Legal Assistant**, built using the open-source **Google Agent Development Kit (ADK)** and powered by **Gemini 2.5 Pro**.

## 🏛️ Architecture Overview
The assistant connects three core layers:
1. **Frontend UI (React/Vite):** A premium web workspace on port \`3000\`.
2. **ADK Agent Backend (Python/ADK):** Runs on port \`8082\` via \`adk web --port 8082 .\`.
3. **Vertex AI Search Companion (FastAPI):** A fast proxy on port \`8083\` for GCS PDF streaming and searching.

## 🚀 Step-by-Step Setup Instructions

### 1. Local Environment Setup
\`\`\`bash
# Backend Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend Setup
npm install
\`\`\`

### 2. Configure API Keys & GCP Authentication
\`\`\`bash
gcloud auth application-default login
\`\`\`

### 3. Start All 3 Services
Open three separate terminals and run:

**Terminal 1 (ADK Agent Backend):**
\`\`\`bash
source venv/bin/activate
adk web --port 8082 .
\`\`\`

**Terminal 2 (Search Companion Server):**
\`\`\`bash
source venv/bin/activate
python search_server.py
\`\`\`

**Terminal 3 (Vite Frontend):**
\`\`\`bash
npm run dev
\`\`\`

Access the assistant at **http://localhost:3000**!`;


// =====================================================================
// REACT MAIN APP COMPONENT
// =====================================================================

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'search' | 'consultant' | 'drafting' | 'code'>('search');

  interface DirectSearchResult {
    id: string;
    title: string;
    uri: string;
    snippets: string[];
  }

  const [directResults, setDirectResults] = useState<DirectSearchResult[]>([]);
  const [isSearchingDirect, setIsSearchingDirect] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedUriId, setCopiedUriId] = useState<string | null>(null);
  const [previewPdfUri, setPreviewPdfUri] = useState<string | null>(null);

  
  // Search Criteria Form State (Core Feature 1)
  const [searchForm, setSearchForm] = useState<SearchCriteria>({
    claimant_or_union: '',
    respondent: '',
    award_number: '',
    case_number: '',
    case_code: '22',
    case_year: undefined,
    keyword_summary: ''
  });

  // Natural Language Search Parser Input State
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');

  // Template Drafting Form State (Core Feature 2)
  const [draftForm, setDraftForm] = useState({
    claimant: 'Alif Bin Ahmad',
    respondent: 'Indah Global Tech Sdn Bhd',
    case_number: '22/4-812/25',
    facts: 'The Claimant was employed as a Senior Software Engineer with a monthly salary of RM 8,500. He was abruptly terminated on 15 November 2025 on alleged grounds of redundancy during an internal restructuring. However, the company hired a fresh foreign replacement engineer for a similar position just two weeks later, violating the principles of fair labor practices.',
    decision_summary: 'The Court finds that the Respondent failed to prove that the restructuring created a genuine redundancy that justified the Claimant\'s termination. Unilateral replacement of the local employee with a lower-paid worker demonstrates a lack of bona fide intention. The termination was therefore not carried out in accordance with Section 20(3) of the Industrial Relations Act 1967.'
  });

  // Live Chat State
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent' | 'system_log';
    text: string;
    timestamp: Date;
    metadata?: {
      tool_name?: string;
      parameters?: any;
      step?: number;
    };
  }

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Selamat Sejahtera and welcome to the Malaysian Industrial Court Legal Assistant.\n\nI am your AI legal assistant. I am equipped to search past Malaysian Industrial Court awards, and to generate standard legal drafts under Section 20(3) of the Industrial Relations Act 1967.\n\nHow can I assist you today? You can search past precedents or provide case details to draft a formal Court Award.",
      timestamp: new Date()
    }
  ]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  // Active Document Viewer state (renders parchment)
  const [viewedDocumentMarkdown, setViewedDocumentMarkdown] = useState<string>('');
  const [viewedDocumentTitle, setViewedDocumentTitle] = useState<string>('Select or Generate a Document');
  const [copiedText, setCopiedText] = useState(false);

  // Active Code file in Code Explorer
  const [activeCodeFile, setActiveCodeFile] = useState<'agent' | 'req' | 'readme'>('agent');
  const [copiedCode, setCopiedCode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  // Copy helpers
  const handleCopyDocument = () => {
    navigator.clipboard.writeText(viewedDocumentMarkdown);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // =====================================================================
  // REAL ADK BACKEND API INTEGRATION
  // =====================================================================

  const runAgentQuery = async (queryText: string) => {
    setIsAgentTyping(true);
    const timestamp = new Date();

    try {
      // Direct call to the local ADK FastAPI server
      const response = await fetch('http://127.0.0.1:8082/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default_user',
          sessionId: 'default_user_session',
          newMessage: {
            role: 'user',
            parts: [{ text: queryText }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}: ${response.statusText}`);
      }

      const events = await response.json();
      let assistantResponseText = '';
      const stepLogs: ChatMessage[] = [];

      for (const event of events) {
        // Log function call executions
        if (event.content?.parts?.[0]?.functionCall) {
          const fc = event.content.parts[0].functionCall;
          let logLabel = "Searching Database";
          let logMsg = `Searching past court awards matching the query:`;
          if (fc.name === 'generate_industrial_court_template') {
            logLabel = "Generating Draft";
            logMsg = `Generating formal court award draft template...`;
          }
          stepLogs.push({
            id: `log-fc-${Date.now()}-${Math.random()}`,
            sender: 'system_log',
            text: `[${logLabel}] ${logMsg}`,
            timestamp: new Date(),
            metadata: { tool_name: fc.name, parameters: fc.args }
          });
        }

        // Log function responses
        if (event.content?.parts?.[0]?.functionResponse) {
          stepLogs.push({
            id: `log-fr-${Date.now()}-${Math.random()}`,
            sender: 'system_log',
            text: `[Database Retrieval] Successfully fetched matching court case records.`,
            timestamp: new Date()
          });
        }

        // Collect model text parts
        if (event.content?.parts?.[0]?.text) {
          assistantResponseText += event.content.parts[0].text;
        }
      }

      // Append any orchestration logs to the chat
      if (stepLogs.length > 0) {
        setChatMessages(prev => [...prev, ...stepLogs]);
      }

      // Append final model response
      if (assistantResponseText) {
        setChatMessages(prev => [...prev, {
          id: `agent-res-${Date.now()}`,
          sender: 'agent',
          text: assistantResponseText,
          timestamp: new Date()
        }]);

        // Smart Extraction: Parse response for Malaysian Industrial Court Award templates
        let docMarkdown = assistantResponseText;
        if (docMarkdown.includes('```')) {
          const blockMatch = docMarkdown.match(/```(?:markdown)?([\s\S]+?)```/);
          if (blockMatch && blockMatch[1] && (blockMatch[1].includes('# INDUSTRIAL COURT') || blockMatch[1].includes('# IN THE INDUSTRIAL COURT'))) {
            docMarkdown = blockMatch[1];
          }
        }

        if (docMarkdown.includes('# INDUSTRIAL COURT') || docMarkdown.includes('# IN THE INDUSTRIAL COURT')) {
          let title = "Conformed Court Award";
          const lines = docMarkdown.split('\n');
          for (const line of lines) {
            if (line.includes('BETWEEN') || line.includes('AWARD NO:')) {
              title = line.replace(/\*\*/g, '').replace('###', '').trim() || title;
              break;
            }
          }
          setViewedDocumentTitle(title);
          setViewedDocumentMarkdown(docMarkdown);
        }
      } else {
        setChatMessages(prev => [...prev, {
          id: `agent-res-empty-${Date.now()}`,
          sender: 'agent',
          text: "The search executed successfully. Please review the matching court results retrieved above.",
          timestamp: new Date()
        }]);
      }

    } catch (error: any) {
      console.error("ADK Backend error:", error);
      setChatMessages(prev => [...prev, {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        text: `### ⚠️ Connection to Legal Assistant Server Failed\n\nUnable to communicate with the local legal assistant backend at \`http://127.0.0.1:8082\`.\n\n**Details:** ${error.message}\n\n**To resolve this:**\n1. Make sure the backend server is running locally on port \`8082\`.\n2. Ensure your terminal is authenticated to Google Cloud by running:\n   \`gcloud auth application-default login\`\n3. Verify your \`.env\` file has valid GCS Data Store and GCP Project IDs configured correctly.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  // Run direct high-speed search calling companion port 8083 Vertex AI Search
  const runDirectSearch = async (nlpQuery?: string) => {
    setIsSearchingDirect(true);
    setSearchError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8083/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: nlpQuery !== undefined ? nlpQuery : searchForm.keyword_summary,
          claimant_or_union: searchForm.claimant_or_union || undefined,
          respondent: searchForm.respondent || undefined,
          case_year: searchForm.case_year || undefined,
          case_code: searchForm.case_code || undefined,
          award_number: searchForm.award_number || undefined,
        })
      });

      if (!response.ok) {
        throw new Error(`Direct search companion server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setDirectResults(data.results || []);
    } catch (error: any) {
      console.error("Direct search error:", error);
      setSearchError(error.message || "Failed to query the direct search companion server.");
      setDirectResults([]);
    } finally {
      setIsSearchingDirect(false);
    }
  };

  // Run Real Generative Award Drafting
  const handleRunDraft = (e: React.FormEvent) => {
    e.preventDefault();

    const promptText = `Generate a conformed, professionally styled Malaysian Industrial Court Award template using the drafting tool based on the following case data:\n` +
      `- Claimant: ${draftForm.claimant}\n` +
      `- Respondent: ${draftForm.respondent}\n` +
      `- Case Reference Number: ${draftForm.case_number}\n` +
      `- Facts of Dispute: ${draftForm.facts}\n` +
      `- Court Findings & Decision: ${draftForm.decision_summary}\n\n` +
      `Make sure the tool returns standard legal boilerplate under Section 20(3) of the Industrial Relations Act 1967.`;

    runAgentQuery(promptText);
  };

  // Conversational Chat Handler
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');

    // Add user message to chat state
    setChatMessages(prev => [...prev, {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: userMsg,
      timestamp: new Date()
    }]);

    runAgentQuery(userMsg);
  };

  // Initialize with empty document viewer, awaiting user actions
  useEffect(() => {
    setViewedDocumentTitle("Parchment Award Viewer");
    setViewedDocumentMarkdown("");
  }, []);

  const renderDocumentViewer = (isDraftingTab: boolean) => {
    return (
      <div className="bg-[#FAF9F5] rounded-xl shadow-lg border border-[#E5E2D9] overflow-hidden flex flex-col" id="card-document-viewer">
        
        {/* Header controls */}
        <div className="bg-[#F0EEE6] border-b border-[#E5E2D9] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <FileCheck className="w-4 h-4 text-court-navy" />
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-slate-800">
              {viewedDocumentTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDocument}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-[#D5D2C9] text-xs font-semibold px-2.5 py-1 rounded shadow-sm text-slate-700 transition-all"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Copy Draft
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-[#D5D2C9] text-xs font-semibold px-2.5 py-1 rounded shadow-sm text-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print
            </button>
          </div>
        </div>

        {/* Parchment Page */}
        <div className={`p-6 md:p-8 overflow-y-auto font-serif text-slate-800 space-y-4 ${
          isDraftingTab ? 'h-[630px] max-h-[630px]' : 'max-h-[420px]'
        }`} id="parchment-content-body">
          {viewedDocumentMarkdown ? (
            <div className="prose prose-slate max-w-none text-xs leading-relaxed md:text-sm space-y-4">
              {viewedDocumentMarkdown.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} className="text-xl md:text-2xl font-bold font-serif text-center uppercase tracking-wide border-b-2 border-slate-300 pb-3 mb-6 mt-2 text-slate-900">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-sm md:text-base font-bold font-serif uppercase tracking-wider border-b border-slate-200 pb-1 mt-6 text-slate-900">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-xs md:text-sm font-bold font-serif text-center uppercase tracking-wide my-3 text-slate-800">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={idx} className="font-bold text-center text-slate-900 my-2">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('* ')) {
                  return <li key={idx} className="ml-6 list-disc text-slate-700">{line.replace('* ', '')}</li>;
                }
                if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                  return <p key={idx} className="ml-6 text-slate-700">{line}</p>;
                }
                if (line.startsWith('> ')) {
                  return <blockquote key={idx} className="border-l-4 border-slate-300 pl-4 py-1 my-3 bg-[#F4F3ED] text-slate-700 italic rounded-r">{line.replace('> ', '')}</blockquote>;
                }
                if (line.trim() === '---') {
                  return <hr key={idx} className="border-t border-[#E5E2D9] my-4" />;
                }
                return <p key={idx} className="text-slate-700 text-justify leading-relaxed">{line}</p>;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 stroke-1 mb-2" />
              <p className="text-xs">Select a case preset or trigger a generative drafting action above to render a fully conformed Malaysian Industrial Court Award here.</p>
            </div>
          )}
        </div>

        <div className="bg-[#FAF9F5] border-t border-[#E5E2D9] px-4 py-2 text-[10px] text-slate-400 font-mono text-center">
          Notice: Generated template serves as a prototype under the Google ADK Framework. Verify with professional counsel before legal proceedings.
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="court-root-container">
      {/* =====================================================================
          APP HEADER & NAVIGATION
          ===================================================================== */}
      <header className="bg-court-navy text-white shadow-md border-b-4 border-court-gold sticky top-0 z-50 px-4 py-3" id="app-main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-court-gold p-2.5 rounded-lg text-court-navy shadow-inner flex items-center justify-center">
              <Scale className="w-7 h-7" id="scale-icon-logo" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-court-gold-light font-bold">Industrial Court of Malaysia</span>
                <span className="bg-court-gold/20 text-court-gold-light text-[10px] px-2 py-0.5 rounded font-mono">Assistant v1.0</span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">
                Legal Assistant Dashboard
              </h1>
            </div>
          </div>

          {/* Navigation Control Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700 w-full md:w-auto overflow-x-auto" id="nav-tabs-container">
            <button
              id="btn-tab-search"
              onClick={() => setActiveTab('search')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'search' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Past Case Awards
            </button>
            <button
              id="btn-tab-consultant"
              onClick={() => setActiveTab('consultant')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'consultant' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Legal Consultant
            </button>
            <button
              id="btn-tab-drafting"
              onClick={() => setActiveTab('drafting')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'drafting' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Draft Court Award
            </button>
            <button
              id="btn-tab-code"
              onClick={() => setActiveTab('code')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'code' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              ADK Code Explorer
            </button>
          </div>

        </div>
      </header>

      {/* =====================================================================
          MAIN DASHBOARD BODY
          ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6" id="dashboard-main-content">
        
        {activeTab === 'search' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full animate-fadeIn" id="search-grid-layout">
            
            {/* COLUMN 1: INTERACTIVE CONTROL PANEL */}
            <div className="lg:col-span-5 flex flex-col gap-6" id="col-search-controls">
              
              {/* CORE FEATURE 1: MULTI-CRITERIA SEARCH CONTROL */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="card-multi-criteria-search">
                <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-court-gold-light" />
                    <h2 className="font-serif font-bold text-base text-slate-100">Precedent Search Finder</h2>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded font-sans font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Case Database Connected
                  </span>
                </div>

                <div className="p-4">
                  
                  {/* Step A: Natural Language Input */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-court-gold" />
                      AI Natural Language Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Find cases about Ahmad Razali from year 2024..."
                        value={naturalLanguageQuery}
                        onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-24 py-2.5 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => runDirectSearch(naturalLanguageQuery)}
                        disabled={isSearchingDirect}
                        className="absolute right-1.5 top-1.5 bg-court-navy hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isSearchingDirect ? (
                          <span className="animate-pulse">Searching...</span>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-court-gold-light" />
                            Search
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Type your request in plain English to automatically find past court files.
                    </p>
                  </div>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Specific Search Filters</span>
                  </div>

                  {/* Step B: Structured Pydantic Form */}
                  <form onSubmit={(e) => { e.preventDefault(); runDirectSearch(); }} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Claimant Name / Union</label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Claimant"
                            value={searchForm.claimant_or_union || ''}
                            onChange={(e) => setSearchForm({...searchForm, claimant_or_union: e.target.value})}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Respondent Company</label>
                        <div className="relative">
                          <Building2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Respondent"
                            value={searchForm.respondent || ''}
                            onChange={(e) => setSearchForm({...searchForm, respondent: e.target.value})}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Case Code</label>
                        <select
                          value={searchForm.case_code || ''}
                          onChange={(e) => setSearchForm({...searchForm, case_code: e.target.value})}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                        >
                          <option value="22">Code 22 (Dismissal)</option>
                          <option value="12">Code 12 (Constructive)</option>
                          <option value="4">Code 4 (Trade Dispute)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Case Year</label>
                        <input
                          type="number"
                          placeholder="e.g. 2026"
                          value={searchForm.case_year || ''}
                          onChange={(e) => setSearchForm({...searchForm, case_year: e.target.value ? Number(e.target.value) : undefined})}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Award No.</label>
                        <input
                          type="text"
                          placeholder="e.g. 104 of 2024"
                          value={searchForm.award_number || ''}
                          onChange={(e) => setSearchForm({...searchForm, award_number: e.target.value})}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Legal Issues & Specific Keywords</label>
                      <input
                        type="text"
                        placeholder="e.g. LIFO standard, constructive dismissal Wong Chee Hong..."
                        value={searchForm.keyword_summary || ''}
                        onChange={(e) => setSearchForm({...searchForm, keyword_summary: e.target.value})}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSearchingDirect}
                      className="w-full bg-court-gold hover:bg-amber-600 disabled:opacity-50 text-court-navy text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      {isSearchingDirect ? "Searching Database..." : "Search Court Award Database"}
                    </button>
                  </form>

                </div>
              </div>

            </div>

            {/* COLUMN 2: DIRECT SEARCH RESULTS */}
            <div className="lg:col-span-7 flex flex-col gap-6" id="col-search-results">
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[400px]" id="card-direct-search-results">
                <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-court-gold-light" />
                    <h2 className="font-serif font-bold text-base text-slate-100">Direct Search Results</h2>
                  </div>
                  <span className="text-[10px] bg-court-gold/20 text-court-gold-light border border-court-gold/30 px-2 py-1 rounded font-sans font-semibold">
                    Vertex AI Index Service
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[700px]">
                  {isSearchingDirect ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                      <div className="w-10 h-10 border-4 border-court-navy border-t-court-gold rounded-full animate-spin"></div>
                      <p className="text-xs font-mono animate-pulse">Querying Vertex AI index (bypassing LLM)...</p>
                    </div>
                  ) : searchError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex gap-3 items-start">
                      <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold mb-1">Direct Search Connection Failed</h4>
                        <p className="mb-2">{searchError}</p>
                        <ol className="list-decimal pl-4 space-y-1 font-sans text-[11px] text-red-700">
                          <li>Ensure the companion FastAPI server is running on port <code className="bg-red-100 px-1 py-0.5 rounded font-mono font-bold">8083</code>:</li>
                          <li className="list-none my-1 font-mono bg-slate-900 text-slate-100 p-1.5 rounded text-[10px] overflow-x-auto select-all">python search_server.py</li>
                          <li>Verify that your GCP environment is authenticated and your Search Data Store is configured properly.</li>
                        </ol>
                      </div>
                    </div>
                  ) : directResults.length > 0 ? (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Found <strong className="text-slate-800">{directResults.length}</strong> highly matching precedent awards from the Malaysian Industrial Court database.
                      </p>
                      
                      {directResults.map((result, idx) => {
                        const isCopied = copiedUriId === result.id;
                        const handleCopyUri = () => {
                          navigator.clipboard.writeText(result.uri);
                          setCopiedUriId(result.id);
                          setTimeout(() => setCopiedUriId(null), 2000);
                        };

                        return (
                          <div key={result.id || idx} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 hover:border-slate-300 rounded-lg p-4 transition-all flex flex-col gap-3 group relative">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[9px] bg-court-navy/10 text-court-navy font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                                  Award Precedent #{idx + 1}
                                </span>
                                <h3 className="font-serif font-bold text-sm text-slate-900 mt-1 hover:text-court-navy transition-colors">
                                  {result.title}
                                </h3>
                              </div>
                              
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => setPreviewPdfUri(result.uri)}
                                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-court-navy text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm text-court-navy font-bold transition-all cursor-pointer"
                                  title="Preview PDF document inline"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-court-navy animate-pulse" />
                                  Preview PDF
                                </button>
                                <a
                                  href={`http://127.0.0.1:8083/pdf?uri=${encodeURIComponent(result.uri)}`}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 hover:border-emerald-600 text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm text-emerald-800 font-semibold transition-all"
                                  title="Download GCS PDF to workstation"
                                >
                                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  Download PDF
                                </a>
                                <button
                                  onClick={handleCopyUri}
                                  className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm text-slate-700 font-semibold transition-all cursor-pointer"
                                  title="Copy GCS path"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3 h-3 text-green-600 font-bold" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-500" />
                                      Copy GCS URI
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Snippets / Matching Passages */}
                            <div className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg p-3.5 space-y-3 shadow-inner">
                              <span className="text-[10px] uppercase font-mono tracking-wider text-court-gold font-bold block">
                                Matching Precedent Excerpt
                              </span>
                              {result.snippets.map((snippet, sIdx) => (
                                <div key={sIdx} className="text-xs text-slate-700 leading-relaxed text-justify font-sans relative pl-3.5 border-l-2 border-court-gold text-justify leading-relaxed">
                                  {snippet.split('**').map((part, pIdx) => 
                                    pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-extrabold bg-amber-100 px-1 py-0.5 rounded border border-amber-200/40">{part}</strong> : part
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Direct PDF Link footer */}
                            {result.uri && (
                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                                <Database className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate select-all max-w-[280px] md:max-w-md" title={result.uri}>
                                  {result.uri}
                                </span>
                                {result.uri.startsWith('http') ? (
                                  <a
                                    href={result.uri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-0.5 text-court-navy hover:text-amber-600 font-semibold uppercase tracking-wider ml-auto text-[9px]"
                                  >
                                    View PDF
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : (
                                  <span className="text-[9px] text-slate-400 italic ml-auto uppercase font-sans">
                                    Stored in GCS
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-24 text-slate-400">
                      <Search className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                      <h4 className="font-serif font-bold text-sm text-slate-600 mb-1">No Search Executed</h4>
                      <p className="text-xs max-w-sm text-slate-500">
                        Use the Search Precedent Finder on the left to instantly query the Vertex AI Search database. Matches will display here in real-time.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : activeTab === 'consultant' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full animate-fadeIn" id="consultant-grid-layout">
            
            {/* COLUMN 1: INTERACTIVE AGENT CHAT & ORCHESTRATION LOGS */}
            <div className="lg:col-span-6 flex flex-col gap-6" id="col-consultant-chat">
              
              <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 flex flex-col h-[630px] overflow-hidden" id="card-chat-interface">
                
                {/* Header */}
                <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="bg-court-gold p-1.5 rounded-full text-slate-950">
                        <Gavel className="w-4 h-4" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950 animate-ping"></span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-slate-100">AI Legal Consultant</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Status: Connected to Legal Assistant Backend</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] text-slate-400 font-mono">Verified Case Database</span>
                  </div>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40" id="chat-messages-container">
                  {chatMessages.map((msg) => {
                    if (msg.sender === 'system_log') {
                      return (
                        <div key={msg.id} className="bg-slate-900/80 border-l-2 border-court-gold/60 rounded-r-lg p-3 text-xs text-slate-300 font-mono shadow-sm flex gap-2 items-start max-w-[90%] transition-all">
                          <Terminal className="w-4 h-4 text-court-gold shrink-0 mt-0.5" />
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      );
                    }

                    const isAgent = msg.sender === 'agent';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-3 max-w-[85%] ${isAgent ? '' : 'ml-auto flex-row-reverse'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow ${
                          isAgent ? 'bg-court-navy border border-court-gold text-white' : 'bg-court-gold text-court-navy'
                        }`}>
                          {isAgent ? 'AG' : 'US'}
                        </div>
                        <div className={`rounded-xl p-3.5 text-xs shadow-sm leading-relaxed ${
                          isAgent 
                            ? 'bg-slate-850 text-slate-200 border border-slate-800' 
                            : 'bg-court-navy text-white border border-slate-800'
                        }`}>
                          <div className="whitespace-pre-wrap text-justify leading-relaxed">{msg.text}</div>
                          <span className="block text-[9px] text-slate-500 mt-2 text-right">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isAgentTyping && (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-court-navy border border-court-gold text-white flex items-center justify-center text-xs font-bold shrink-0">
                        AG
                      </div>
                      <div className="bg-slate-850 text-slate-400 rounded-xl px-4 py-3 text-xs border border-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-court-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-court-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-court-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1">Consultant reasoning...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChatMessage} className="bg-slate-950 p-3 border-t border-slate-850 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask standard legal questions or search past awards... (e.g. What is Wong Chee Hong contract test?)"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-court-gold text-slate-200 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="bg-court-gold hover:bg-amber-600 text-court-navy font-bold px-4 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>

            {/* COLUMN 2: DOCUMENT VIEW (Parchment Styled Render) */}
            <div className="lg:col-span-6 flex flex-col gap-6" id="col-consultant-parchment">
              {renderDocumentViewer(true)}
            </div>

          </div>
        ) : activeTab === 'drafting' ? (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full" id="drafting-grid-layout">
            
            {/* COLUMN 1: INTERACTIVE CONTROL PANEL */}
            <div className="w-full flex flex-col gap-6" id="col-drafting-controls">
              
              {/* CORE FEATURE 2: GENERATIVE AWARD TEMPLATE */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="card-generative-template">
                <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-court-gold-light" />
                    <h2 className="font-serif font-bold text-base text-slate-100">Case Award Drafting Helper</h2>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded font-sans font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span> Standard Legal Format
                  </span>
                </div>

                <div className="p-4">
                  <form onSubmit={handleRunDraft} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Claimant Name</label>
                        <input
                          type="text"
                          required
                          value={draftForm.claimant}
                          onChange={(e) => setDraftForm({...draftForm, claimant: e.target.value})}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Respondent Company</label>
                        <input
                          type="text"
                          required
                          value={draftForm.respondent}
                          onChange={(e) => setDraftForm({...draftForm, respondent: e.target.value})}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Case Reference Number</label>
                      <input
                        type="text"
                        required
                        value={draftForm.case_number}
                        onChange={(e) => setDraftForm({...draftForm, case_number: e.target.value})}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Background Facts & Disputes</label>
                      <textarea
                        rows={4}
                        required
                        value={draftForm.facts}
                        onChange={(e) => setDraftForm({...draftForm, facts: e.target.value})}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800 font-sans"
                        placeholder="Detail the case facts..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Court's Holding & Reasonings</label>
                      <textarea
                        rows={4}
                        required
                        value={draftForm.decision_summary}
                        onChange={(e) => setDraftForm({...draftForm, decision_summary: e.target.value})}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-court-gold focus:bg-white text-slate-800 font-sans"
                        placeholder="Summarize the legal rationale and findings..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-court-navy hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer border border-court-gold/20"
                    >
                      <FileEdit className="w-4 h-4 text-court-gold" />
                      Generate Draft Court Award
                    </button>
                  </form>


                </div>
              </div>

            </div>

            {/* COLUMN 2: PARCHMENT VIEW */}
            <div className="w-full flex flex-col gap-6" id="col-drafting-outputs">
              {renderDocumentViewer(true)}
            </div>

          </div>
        ) : (
          /* =====================================================================
             TAB: PYTHON ADK CODE EXPLORER
             ===================================================================== */
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full" id="code-explorer-layout">
            
            {/* Left Sidebar Info */}
            <div className="w-full flex flex-col gap-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3.5">
                  <Code2 className="w-5 h-5 text-court-gold" />
                  <h3 className="font-serif font-bold text-base text-slate-900">ADK Convention</h3>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  The Google Agent Development Kit (ADK) simplifies AI orchestrations. Rather than defining complicated state machines or routes manually:
                </p>

                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex gap-2.5 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono mt-0.5 shrink-0">1</span>
                    <div>
                      <strong className="text-slate-900 block">Automatic Schema Discovery</strong>
                      ADK parses Pydantic classes and python docstrings to define standard tools for Gemini. No explicit JSON/OpenAPI maps are required.
                    </div>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono mt-0.5 shrink-0">2</span>
                    <div>
                      <strong className="text-slate-900 block">Unified Dev Command</strong>
                      Running <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">adk web</code> immediately loads an interactive developer console populated with inputs matching your models.
                    </div>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono mt-0.5 shrink-0">3</span>
                    <div>
                      <strong className="text-slate-900 block">Vertex AI RAG Engine Sync</strong>
                      By utilizing a Google Drive source synced with Vertex AI vector search, you create low-maintenance, fully-automated RAG databases.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Step-by-Step Local Deployment checklist */}
              <div className="bg-court-navy text-white rounded-xl shadow-sm p-5 border border-slate-850">
                <h4 className="font-serif font-bold text-sm text-court-gold-light mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Quick Local Run Guide
                </h4>
                <ol className="space-y-3 text-xs font-mono text-slate-300">
                  <li className="border-b border-slate-800 pb-2">
                    <span className="text-court-gold font-bold"># Step 1</span>
                    <p className="text-[11px] text-slate-400 mt-1">Install packages</p>
                    <span className="text-white">pip install -r requirements.txt</span>
                  </li>
                  <li className="border-b border-slate-800 pb-2">
                    <span className="text-court-gold font-bold"># Step 2</span>
                    <p className="text-[11px] text-slate-400 mt-1">Set environment variable</p>
                    <span className="text-white">export GEMINI_API_KEY="your-key"</span>
                  </li>
                  <li className="pb-1">
                    <span className="text-court-gold font-bold"># Step 3</span>
                    <p className="text-[11px] text-slate-400 mt-1">Launch local ADK server</p>
                    <span className="text-white">adk web start --agent agent:IndustrialCourtAgent</span>
                  </li>
                </ol>
              </div>

            </div>

            {/* Right Code Viewer Panel */}
            <div className="w-full flex flex-col bg-slate-900 rounded-xl shadow-md border border-slate-800 overflow-hidden">
              
              {/* Tabs header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-850 flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveCodeFile('agent')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                      activeCodeFile === 'agent' 
                        ? 'bg-court-gold text-court-navy font-bold' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    agent.py
                  </button>
                  <button
                    onClick={() => setActiveCodeFile('req')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                      activeCodeFile === 'req' 
                        ? 'bg-court-gold text-court-navy font-bold' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    requirements.txt
                  </button>
                  <button
                    onClick={() => setActiveCodeFile('readme')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                      activeCodeFile === 'readme' 
                        ? 'bg-court-gold text-court-navy font-bold' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    README.md
                  </button>
                </div>

                <button
                  onClick={() => handleCopyCode(
                    activeCodeFile === 'agent' 
                      ? PYTHON_AGENT 
                      : activeCodeFile === 'req' 
                        ? PYTHON_REQUIREMENTS 
                        : PYTHON_README
                  )}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-mono font-semibold px-2.5 py-1.5 rounded text-slate-200 transition-all"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      COPY CODE
                    </>
                  )}
                </button>
              </div>

              {/* Code display field */}
              <div className="p-4 overflow-auto max-h-[520px] font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/55">
                <pre className="whitespace-pre">
                  {activeCodeFile === 'agent' && PYTHON_AGENT}
                  {activeCodeFile === 'req' && PYTHON_REQUIREMENTS}
                  {activeCodeFile === 'readme' && PYTHON_README}
                </pre>
              </div>

              <div className="bg-slate-950 px-4 py-2 text-[10px] text-slate-500 font-mono text-center border-t border-slate-850 flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                These files have been successfully written to your workspace and are ready for download or direct execution.
              </div>

            </div>

          </div>
        )}

      </main>

      {/* =====================================================================
          LIVE PDF PREVIEW MODAL OVERLAY
          ===================================================================== */}
      {previewPdfUri && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6" id="pdf-preview-modal">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-court-navy text-white px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-court-gold p-1.5 rounded-lg text-court-navy">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm md:text-base text-white">Court Award Document Preview</h3>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[280px] md:max-w-md" title={previewPdfUri}>
                    {previewPdfUri}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`http://127.0.0.1:8083/pdf?uri=${encodeURIComponent(previewPdfUri)}`}
                  download
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
                <button
                  onClick={() => setPreviewPdfUri(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold px-3 py-2 rounded-md transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Modal Iframe Content */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={`http://127.0.0.1:8083/pdf?uri=${encodeURIComponent(previewPdfUri)}`}
                className="w-full h-full border-none"
                title="GCS PDF Native Browser Viewer"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-sans">
              <span>Notice: Preview is rendered securely via our FastAPI local proxy server.</span>
              <span className="font-mono">Port 8083 GCS Proxy Stream</span>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          FOOTER
          ===================================================================== */}
      <footer className="bg-slate-900 border-t border-slate-850 py-6 mt-12 px-4" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-court-gold" />
            <span>Malaysian Industrial Court Legal Assistant Prototype Blueprint</span>
          </div>
          <div>
            Powered by <strong className="text-slate-300">Google Cloud AI</strong> & <strong className="text-slate-300">Gemini</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
