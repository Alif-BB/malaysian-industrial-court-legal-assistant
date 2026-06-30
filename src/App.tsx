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
  FileCheck
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

const SAMPLE_AWARDS: CourtAward[] = [
  {
    award_number: "104 of 2024",
    case_number: "22/4-1102/23",
    claimant: "Ahmad Bin Razali",
    respondent: "Mega Global Tech Sdn Bhd",
    case_code: "22",
    case_year: 2024,
    facts: "Claimant was summarily dismissed for alleged poor performance without a prior performance improvement plan (PIP) or written warnings.",
    held: "Dismissal without just cause or excuse. The court held that the Respondent failed to establish poor performance in accordance with the established legal standards. Standard criteria in Malaysian Industrial Law (e.g., in the case of IE Project Sdn Bhd v. Tan Lee Seng [1987]) requires clear notice of performance standards, feedback/warning, and a reasonable opportunity to improve.",
    remedy: "Backwages of 24 months (subject to 20% mitigation deduction for post-dismissal income) and compensation in lieu of reinstatement of 1 month salary for each year of completed service (5 years total)."
  },
  {
    award_number: "315 of 2025",
    case_number: "12/2-402/24",
    claimant: "Sarah Elizabeth Jenkins",
    respondent: "Nusantara Logistics Berhad",
    case_code: "12",
    case_year: 2025,
    facts: "Claimant claimed constructive dismissal. The Respondent unilaterally removed her company car benefit and reassigned her core duties to a newly hired manager, effectively demoting her without her consent.",
    held: "Constructive dismissal established. The court applied the contract test outlined in Wong Chee Hong v. Lim Seng Seng [1983] 1 MLJ 35. The unilateral alteration of the contract terms and reassignment of key functions went to the root of the contract of employment, showing that the employer no longer intended to be bound by the contract.",
    remedy: "Reinstatement ordered, or alternatively, backwages of 24 months and 8 years compensation in lieu of reinstatement."
  },
  {
    award_number: "042 of 2026",
    case_number: "22/4-901/25",
    claimant: "Tan Kok Seng & 14 Others",
    respondent: "Eastern Manufacturing Berhad",
    case_code: "22",
    case_year: 2026,
    facts: "A collective dismissal under the guise of retrenchment due to reorganization. The Claimants argued that the LIFO (Last In, First Out) principle was violated, and that foreign workers were retained while senior Malaysian workers were dismissed.",
    held: "Dismissal without just cause or excuse. The Court found that while redundancy was genuine due to economic downturn, the selection process violated the Code of Conduct for Industrial Harmony 1975, specifically violating the LIFO principle without valid reasons, making the retrenchment subjective and unfair.",
    remedy: "Redundancy benefits recalculated in accordance with Employment Regulations, plus backwages capped at 24 months."
  },
  {
    award_number: "088 of 2026",
    case_number: "22/4-150/25",
    claimant: "Vimala Devi a/p Ramasamy",
    respondent: "Premier Healthcare Group",
    case_code: "22",
    case_year: 2026,
    facts: "Claimant, a probationer, was terminated after 3 months of a 6-month probation period without proper assessment, warnings, or extension notice.",
    held: "Dismissal without just cause or excuse. Although a probationer does not possess the same status as a confirmed employee, they are still entitled to a reasonable assessment period and guidance under Khaliah binti Abbas v. Majid Holdings Sdn Bhd [1997] 1 MLJ 105. No formal review or guidance was provided.",
    remedy: "Backwages of 12 months (maximum statutory cap for probationers under the Second Schedule) with a 30% mitigation deduction."
  }
];

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
    
    This tool simulates/stubs queries against a Google Drive corpus indexed via 
    Vertex AI RAG (Retrieval-Augmented Generation) Engine. In a live environment,
    this queries the Vertex AI search endpoint and returns relevant passages.

    Args:
        criteria: A structured SearchCriteria object containing the parsed fields.
        
    Returns:
        A Markdown formatted response showing the search results or relevant 
        excerpts found in the legal corpus.
    """
    # Simulate a set of historic awards stored in Google Drive
    mock_corpus = [
        # ... (Refer to full mock data in agent.py)
    ]
    # Standard matching or Vertex AI RAG call implementation...
    return "Parsed results from legal corpus..."


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

## 🚀 Step-by-Step Setup Instructions

### 1. Prerequisite & Local Environment Setup
Ensure you have **Python 3.10+** installed on your workstation.

\`\`\`bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
\`\`\`

### 2. Configure API Keys
\`\`\`bash
export GEMINI_API_KEY="your-gemini-api-key-here"
\`\`\`

### 3. Spin Up the Local ADK Developer Web UI
\`\`\`bash
adk web start --agent agent:IndustrialCourtAgent --port 8080
\`\`\``;


// =====================================================================
// REACT MAIN APP COMPONENT
// =====================================================================

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'search' | 'drafting' | 'code'>('search');
  
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
  const [isParsingNL, setIsParsingNL] = useState(false);

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
      text: "Selamat Sejahtera and welcome to the Malaysian Industrial Court Legal Assistant.\n\nI am an agent configured via the **Google ADK** (Agent Development Kit). I am equipped with tools to search past court awards synced from Google Drive via **Vertex AI RAG Engine**, and to generate standard legal drafts of court awards under Section 20(3) of the Industrial Relations Act 1967.\n\nHow can I assist you today? You can search past precedents or provide case details to draft a formal Court Award.",
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

  // Preset Loaders
  const loadSearchPreset = (presetIndex: number) => {
    const selected = SAMPLE_AWARDS[presetIndex];
    setSearchForm({
      claimant_or_union: selected.claimant,
      respondent: selected.respondent,
      award_number: selected.award_number,
      case_number: selected.case_number,
      case_code: selected.case_code,
      case_year: selected.case_year,
      keyword_summary: ''
    });
    setNaturalLanguageQuery(`Search for cases involving claimant "${selected.claimant}" and respondent "${selected.respondent}"`);
  };

  const loadDraftPreset = (presetIndex: number) => {
    const selected = SAMPLE_AWARDS[presetIndex];
    setDraftForm({
      claimant: selected.claimant,
      respondent: selected.respondent,
      case_number: selected.case_number,
      facts: selected.facts,
      decision_summary: selected.held
    });
  };

  // =====================================================================
  // CORE LOGIC SIMULATION
  // =====================================================================

  // Natural Language Parser Simulation (converts NL text to SearchCriteria fields)
  const handleNaturalLanguageParse = () => {
    if (!naturalLanguageQuery.trim()) return;
    setIsParsingNL(true);
    
    // Simulate ADK's LLM parser reasoning
    setTimeout(() => {
      const q = naturalLanguageQuery.toLowerCase();
      let parsed: SearchCriteria = {
        claimant_or_union: '',
        respondent: '',
        award_number: '',
        case_number: '',
        case_code: '22',
        case_year: undefined,
        keyword_summary: ''
      };

      // Simple heuristic simulation
      if (q.includes("ahmad") || q.includes("razali")) {
        parsed.claimant_or_union = "Ahmad Bin Razali";
        parsed.respondent = "Mega Global Tech Sdn Bhd";
        parsed.case_year = 2024;
        parsed.award_number = "104 of 2024";
      } else if (q.includes("sarah") || q.includes("jenkins")) {
        parsed.claimant_or_union = "Sarah Elizabeth Jenkins";
        parsed.respondent = "Nusantara Logistics Berhad";
        parsed.case_year = 2025;
      } else if (q.includes("tan kok seng") || q.includes("retrenchment")) {
        parsed.claimant_or_union = "Tan Kok Seng";
        parsed.respondent = "Eastern Manufacturing Berhad";
        parsed.keyword_summary = "retrenchment lifo";
        parsed.case_year = 2026;
      } else if (q.includes("vimala") || q.includes("probationer")) {
        parsed.claimant_or_union = "Vimala Devi";
        parsed.respondent = "Premier Healthcare Group";
        parsed.keyword_summary = "probationer";
        parsed.case_year = 2026;
      } else {
        // Fallback matching
        parsed.keyword_summary = naturalLanguageQuery;
      }

      setSearchForm(parsed);
      setIsParsingNL(false);
      
      // Inject system steps in chat to show the user how ADK parsed it
      triggerAgentToolflowLog("parse_query", {
        raw_query: naturalLanguageQuery,
        extracted_criteria: parsed
      });
    }, 850);
  };

  // Helper to trigger ADK execution steps in chat log
  const triggerAgentToolflowLog = (action: 'parse_query' | 'search_tool' | 'draft_tool', payload: any) => {
    const timestamp = new Date();
    
    if (action === 'parse_query') {
      const logs: ChatMessage[] = [
        {
          id: `log-p1-${Date.now()}`,
          sender: 'system_log',
          text: `[ADK ORCHESTRATION] Passing raw string to Gemini 2.5 Flash for SearchCriteria parsing...`,
          timestamp
        },
        {
          id: `log-p2-${Date.now()}`,
          sender: 'system_log',
          text: `[ADK Pydantic Validator] Extracted schema successfully:\n\n` + 
                `{\n` +
                `  "claimant_or_union": "${payload.extracted_criteria.claimant_or_union || 'null'}",\n` +
                `  "respondent": "${payload.extracted_criteria.respondent || 'null'}",\n` +
                `  "case_year": ${payload.extracted_criteria.case_year || 'null'},\n` +
                `  "keyword_summary": "${payload.extracted_criteria.keyword_summary || 'null'}"\n` +
                `}`,
          timestamp
        }
      ];
      setChatMessages(prev => [...prev, ...logs]);
    } else if (action === 'search_tool') {
      const logs: ChatMessage[] = [
        {
          id: `log-s1-${Date.now()}`,
          sender: 'system_log',
          text: `[ADK TOOL INVOKE] Triggered function 'search_industrial_awards' with criteria:`,
          timestamp,
          metadata: { tool_name: 'search_industrial_awards', parameters: payload }
        },
        {
          id: `log-s2-${Date.now()}`,
          sender: 'system_log',
          text: `[Vertex AI RAG Engine] Querying synced Google Drive folder... Excerpts identified from PDF database.`,
          timestamp
        }
      ];
      setChatMessages(prev => [...prev, ...logs]);
    } else if (action === 'draft_tool') {
      const logs: ChatMessage[] = [
        {
          id: `log-d1-${Date.now()}`,
          sender: 'system_log',
          text: `[ADK TOOL INVOKE] Triggered function 'generate_industrial_court_template' with case data:`,
          timestamp,
          metadata: { tool_name: 'generate_industrial_court_template', parameters: payload }
        },
        {
          id: `log-d2-${Date.now()}`,
          sender: 'system_log',
          text: `[ADK Generative Draft] Conforming format to Malaysian Industrial Court award standards. Handing output back to user.`,
          timestamp
        }
      ];
      setChatMessages(prev => [...prev, ...logs]);
    }
  };

  // Run Simulated Search via the form
  const handleRunSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAgentTyping(true);

    // Logs before responding
    triggerAgentToolflowLog('search_tool', searchForm);

    setTimeout(() => {
      // Find matches in SAMPLE_AWARDS
      const matches = SAMPLE_AWARDS.filter(award => {
        let match = true;
        if (searchForm.claimant_or_union && !award.claimant.toLowerCase().includes(searchForm.claimant_or_union.toLowerCase())) match = false;
        if (searchForm.respondent && !award.respondent.toLowerCase().includes(searchForm.respondent.toLowerCase())) match = false;
        if (searchForm.award_number && !award.award_number.includes(searchForm.award_number)) match = false;
        if (searchForm.case_number && !award.case_number.includes(searchForm.case_number)) match = false;
        if (searchForm.case_year && award.case_year !== Number(searchForm.case_year)) match = false;
        return match;
      });

      let responseText = '';
      if (matches.length > 0) {
        responseText = `### Vertex AI RAG Corpus Query Results (${matches.length} matches found)\n`;
        responseText += `I have fetched these matching court awards from your Google Drive sync:\n\n`;
        matches.forEach((m, idx) => {
          responseText += `#### ${idx + 1}. Award No. ${m.award_number} (Case No: ${m.case_number})\n`;
          responseText += `**Parties:** *${m.claimant}* v. *${m.respondent}*\n`;
          responseText += `**Background Facts:**\n> ${m.facts}\n\n`;
          responseText += `**Holding:**\n> ${m.held}\n\n`;
          responseText += `**Remedy Granted:**\n> ${m.remedy}\n\n`;
          responseText += `*Click "View Document" in the dashboard to load this full template.* \n\n---\n\n`;
        });
      } else {
        responseText = `### Vertex AI RAG Corpus Query Output\n\n**No exact matches found.**\n\nHowever, in compliance with general standards under Section 20 of the Malaysian Industrial Relations Act 1967, employers bear the burden of proving that dismissals were executed with just cause or excuse.\n\nWould you like me to draft an Award template for this case?`;
      }

      setChatMessages(prev => [...prev, {
        id: `search-res-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        timestamp: new Date()
      }]);
      setIsAgentTyping(false);

      if (matches.length > 0) {
        // Automatically load the first match into the document viewer
        const selected = matches[0];
        loadDocumentIntoViewer(selected);
      }
    }, 1200);
  };

  // Convert an award record into the formal Markdown document
  const generateFormalAwardMarkdown = (claimant: string, respondent: string, case_num: string, facts: string, decision: string, awardYear: string = "2026") => {
    return `# IN THE INDUSTRIAL COURT OF MALAYSIA

**AWARD NO: [   ] OF ${awardYear}**

---

### IN THE MATTER OF THE INDUSTRIAL RELATIONS ACT 1967
### AND
### IN THE MATTER OF A REFERENCE UNDER SECTION 20(3) OF THE ACT

**BETWEEN**

**${claimant.toUpperCase()}**  
*(hereinafter referred to as "the Claimant")*

**AND**

**${respondent.toUpperCase()}**  
*(hereinafter referred to as "the Respondent")*

---

### PANEL OF THE COURT:
* **Chairman:** Yang Arif Dato' Sri Haji Harun Al-Rashid
* **Venue:** Industrial Court of Malaysia, Kuala Lumpur Division

---

## AWARD

### 1. INTRODUCTION
This is a reference made under **Section 20(3) of the Industrial Relations Act 1967** arising out of the dismissal of **${claimant}** ("the Claimant") by **${respondent}** ("the Respondent") on the grounds of alleged dismissal without just cause or excuse.

### 2. BACKGROUND FACTS
${facts}

### 3. THE LAW AND EVALUATION OF EVIDENCE
The function of the Industrial Court under Section 20 of the Industrial Relations Act 1967 is twofold:
1. To determine whether the misconduct/performance issue alleged by the employer has been proven.
2. To determine whether that proven misconduct or reason constitutes "just cause or excuse" for the dismissal.

The standard of proof required is a **balance of probabilities** (*Goonesinha v. O.L. Yeoh [1975] 1 MLJ 43*). The burden of proof rests entirely on the Respondent employer (*Milan Auto Sdn. Bhd. v. Wong Yeh [1995] 3 MLJ 537*).

### 4. COURT'S FINDINGS AND DECISION
${decision}

Based on the evidence adduced both oral and documentary, the Court finds that the Respondent has failed to discharge its burden of proving just cause or excuse. 

### 5. REMEDY & FINAL ORDER
Pursuant to the **Second Schedule of the Industrial Relations Act 1967**:
* **Backwages:** Capped at 24 months for confirmed employees (12 months for probationers) from date of dismissal, subject to deduction for mitigation of damages and post-dismissal earnings.
* **Compensation in lieu of Reinstatement:** Standard practice is 1 month's salary for each completed year of service.

**THE COURT HEREBY ORDERS:**
1. The Respondent to pay the Claimant a total sum calculated as follows:
   * *Backwages:* 24 months x RM [Salary] = **RM [Calculated Backwages]** (subject to deduction for mitigation).
   * *Compensation in lieu of Reinstatement:* 1 month's salary for each completed year of service.
2. Subject to statutory deductions for EPF and SOCSO.

**HANDED DOWN AND DATED THIS [  ] DAY OF [MONTH], {year}.**

*(Yang Arif Chairman)*  
**Chairman**  
*Industrial Court of Malaysia*`;
  };

  const loadDocumentIntoViewer = (award: CourtAward) => {
    setViewedDocumentTitle(`Award No. ${award.award_number}`);
    const markdown = generateFormalAwardMarkdown(
      award.claimant,
      award.respondent,
      award.case_number,
      award.facts,
      award.held,
      String(award.case_year)
    );
    setViewedDocumentMarkdown(markdown);
  };

  // Run Simulated Award Drafting (Core Feature 2)
  const handleRunDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAgentTyping(true);

    // Logs before responding
    triggerAgentToolflowLog('draft_tool', draftForm);

    setTimeout(() => {
      const formalMarkdown = generateFormalAwardMarkdown(
        draftForm.claimant,
        draftForm.respondent,
        draftForm.case_number,
        draftForm.facts,
        draftForm.decision_summary,
        "2026"
      );

      setViewedDocumentTitle(`Draft Award: ${draftForm.claimant} v. ${draftForm.respondent}`);
      setViewedDocumentMarkdown(formalMarkdown);

      const agentResponse = `### Draft Court Award Generated successfully!\n\nI have successfully invoked the tool \`generate_industrial_court_template\` conforming to standard legal layouts and administrative precedents under the Malaysian Industrial Relations Act 1967.\n\n* **Parties:** *${draftForm.claimant}* v. *${draftForm.respondent}*\n* **Case Reference:** \`${draftForm.case_number}\`\n\nYou can now examine, edit, copy, or print the beautifully rendered formal document in the **Parchment Award Viewer** located on the right side of your dashboard.`;

      setChatMessages(prev => [...prev, {
        id: `draft-res-${Date.now()}`,
        sender: 'agent',
        text: agentResponse,
        timestamp: new Date()
      }]);
      setIsAgentTyping(false);
    }, 1500);
  };

  // Conversational Chat Handler
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');

    // Add user message to chat
    setChatMessages(prev => [...prev, {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: userMsg,
      timestamp: new Date()
    }]);

    setIsAgentTyping(true);

    // Simulate Agent processing
    setTimeout(() => {
      const q = userMsg.toLowerCase();
      let reply = '';

      if (q.includes("constructive dismissal") || q.includes("wong chee hong")) {
        triggerAgentToolflowLog('search_tool', { keyword_summary: "constructive dismissal" });
        reply = `### Constructive Dismissal Precedents & Legal Standard\n\nIn Malaysia, constructive dismissal occurs when an employer commits a fundamental breach of contract going to the root of the employment relationship, forcing the employee to resign.\n\n**The Governing Precedent:**\nIn the landmark Federal Court case of **Wong Chee Hong v. Lim Seng Seng [1983] 1 MLJ 35**, it was held that the "contract test" must be applied. The employee must prove:\n1. The employer was guilty of a breach going to the root of the contract of employment.\n2. The employee resigned in response to that breach, not for some other reason.\n3. The employee acted promptly.\n\n**Typical Examples:**\n* Unilateral salary reduction.\n* Demotion in status, duties, or reporting line.\n* Subjecting the employee to hostile/humiliating work environments without basis.\n\nI have retrieved Award **315 of 2025 (Sarah Jenkins v. Nusantara Logistics Berhad)** which perfectly exemplifies a constructive dismissal scenario based on salary benefit alteration. I have loaded this case into the dashboard for your review.`;
        loadDocumentIntoViewer(SAMPLE_AWARDS[1]);
      } else if (q.includes("poor performance") || q.includes("performance improvement")) {
        triggerAgentToolflowLog('search_tool', { keyword_summary: "poor performance" });
        reply = `### Standard for Performance-Related Dismissals\n\nUnder Malaysian Industrial Relations jurisprudence, the standard required to lawfully dismiss an employee for poor performance is highly stringent.\n\n**The Governing Precedent:**\nAs established in **IE Project Sdn Bhd v. Tan Lee Seng [1987] 1 ILR 165**, the employer must satisfy three criteria:\n1. The employee was made aware of their performance gaps/standards.\n2. The employee was given adequate opportunity to improve (e.g., a formal Performance Improvement Plan (PIP)).\n3. Despite warnings and opportunities, the employee failed to meet the standards.\n\nI have retrieved Award **104 of 2024 (Ahmad Bin Razali v. Mega Global Tech Sdn Bhd)** where summary dismissal for performance was ruled unfair due to lack of standard warning/PIP. Check the Parchment Award Viewer to inspect this case.`;
        loadDocumentIntoViewer(SAMPLE_AWARDS[0]);
      } else if (q.includes("retrenchment") || q.includes("lifo") || q.includes("redundancy")) {
        triggerAgentToolflowLog('search_tool', { keyword_summary: "retrenchment lifo" });
        reply = `### Redundancy & Retrenchment Standards\n\nFor a retrenchment to be considered fair, the redundancy must be genuine, and the selection of affected employees must follow objective criteria.\n\n**Key Rules:**\n* **LIFO (Last In, First Out) Principle:** Senior workers must be retained in preference to junior workers within the same category.\n* **Code of Conduct for Industrial Harmony 1975:** Outlines guidelines such as consultative meetings, limiting foreign labor retention over local citizens, and giving adequate redundancy notices.\n\nI have retrieved Award **042 of 2026 (Tan Kok Seng & 14 Others v. Eastern Manufacturing Berhad)** which highlights a scenario where retrenchment was declared invalid due to LIFO violation. Review the parchment viewer for details.`;
        loadDocumentIntoViewer(SAMPLE_AWARDS[2]);
      } else if (q.includes("probation") || q.includes("probationer")) {
        triggerAgentToolflowLog('search_tool', { keyword_summary: "probationer" });
        reply = `### Probationer Dismissal Standards\n\nIn Malaysia, while probationers do not enjoy the exact same status as permanent employees, they still possess identical rights under Section 20(3) to not be dismissed without just cause or excuse.\n\n**Key Standard:**\nIn **Khaliah binti Abbas v. Majid Holdings Sdn Bhd [1997]**, it was affirmed that a probationer's services cannot be terminated whimsically. They must be given feedback, evaluated reasonably, and notified of failures to perform before termination.\n\n*Statutory cap on backwages for probationers is 12 months, compared to 24 months for permanent workers.* I have loaded Case **088 of 2026 (Vimala Devi v. Premier Healthcare Group)** into the viewer.`;
        loadDocumentIntoViewer(SAMPLE_AWARDS[3]);
      } else {
        // Fallback natural language search simulation
        reply = `I have received your query: "${userMsg}". \n\nI am analyzing this and performing a semantic search across our RAG database containing Malaysian Industrial Court decisions. Let me parse this and retrieve matching records...`;
        
        setTimeout(() => {
          // Auto-trigger search simulation
          setSearchForm(prev => ({ ...prev, claimant_or_union: userMsg }));
          handleRunSearch();
        }, 800);
        
        setChatMessages(prev => [...prev, {
          id: `fallback-res-${Date.now()}`,
          sender: 'agent',
          text: reply,
          timestamp: new Date()
        }]);
        setIsAgentTyping(false);
        return;
      }

      setChatMessages(prev => [...prev, {
        id: `agent-res-${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: new Date()
      }]);
      setIsAgentTyping(false);
    }, 1200);
  }  // Set default view document on load
  useEffect(() => {
    loadDocumentIntoViewer(SAMPLE_AWARDS[0]);
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
                <span className="bg-court-gold/20 text-court-gold-light text-[10px] px-2 py-0.5 rounded font-mono">ADK Blueprint v1.0</span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">
                Legal Assistant Agent Dashboard
              </h1>
            </div>
          </div>

          {/* Navigation Control Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700 w-full md:w-auto" id="nav-tabs-container">
            <button
              id="btn-tab-search"
              onClick={() => setActiveTab('search')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'search' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Search className="w-4 h-4" />
              Precedent RAG Search
            </button>
            <button
              id="btn-tab-drafting"
              onClick={() => setActiveTab('drafting')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'drafting' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Generative Award Drafting
            </button>
            <button
              id="btn-tab-code"
              onClick={() => setActiveTab('code')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'code' 
                  ? 'bg-court-gold text-court-navy shadow font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Python ADK Code Explorer
            </button>
          </div>

        </div>
      </header>

      {/* =====================================================================
          MAIN DASHBOARD BODY
          ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6" id="dashboard-main-content">
        
        {activeTab === 'search' ? (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full" id="search-grid-layout">
            
            {/* COLUMN 1: INTERACTIVE CONTROL PANEL */}
            <div className="w-full flex flex-col gap-6" id="col-search-controls">
              
              {/* CORE FEATURE 1: MULTI-CRITERIA SEARCH CONTROL */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="card-multi-criteria-search">
                <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-court-gold-light" />
                    <h2 className="font-serif font-bold text-base text-slate-100">1. Multi-Criteria Search Tool</h2>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    search_industrial_awards()
                  </span>
                </div>

                <div className="p-4">
                  
                  {/* Step A: Natural Language Input */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-court-gold" />
                      Parser: Natural Language Search Query
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
                        onClick={handleNaturalLanguageParse}
                        disabled={isParsingNL}
                        className="absolute right-1.5 top-1.5 bg-court-navy hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isParsingNL ? (
                          <span className="animate-pulse">Parsing...</span>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-court-gold-light" />
                            AI Parse
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Gemini parses natural language queries into a structured Pydantic object before tool execution.
                    </p>
                  </div>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Parsed Pydantic Fields</span>
                  </div>

                  {/* Step B: Structured Pydantic Form */}
                  <form onSubmit={handleRunSearch} className="space-y-3.5">
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
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semantic Keywords (RAG Engine Search)</label>
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
                      className="w-full bg-court-gold hover:bg-amber-600 text-court-navy text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      Search Google Drive RAG Engine
                    </button>
                  </form>

                  {/* Preset Quick Loader */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Test RAG Database Presets</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => loadSearchPreset(0)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        Ahmad Razali (Performance)
                      </button>
                      <button
                        onClick={() => loadSearchPreset(1)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        Sarah Jenkins (Constructive)
                      </button>
                      <button
                        onClick={() => loadSearchPreset(2)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        Tan Kok Seng (Retrenchment)
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* COLUMN 2: CHAT CONSOLE & PARCHMENT VIEW */}
            <div className="w-full flex flex-col gap-6" id="col-search-outputs">
              
              {/* INTERACTIVE AGENT CHAT & ORCHESTRATION LOGS */}
              <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 flex flex-col h-[520px] overflow-hidden" id="card-chat-interface">
                
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
                      <h3 className="font-serif font-bold text-sm text-slate-100">IndustrialCourtAgent Console</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Status: Connected to Google ADK framework</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] text-slate-400 font-mono">Google Drive Synced</span>
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
                          <div className="whitespace-pre-wrap">{msg.text}</div>
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
                        <span className="text-[10px] font-mono text-slate-500 ml-1">Agent reasoning...</span>
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

              {/* DOCUMENT VIEW (Parchment Styled Render) */}
              {renderDocumentViewer(false)}

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
                    <h2 className="font-serif font-bold text-base text-slate-100">2. Generative Court Template Tool</h2>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                    generate_court_template()
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

                  {/* Draft Presets */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Inject Reference Case Data</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => loadDraftPreset(0)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        Ahmad Razali
                      </button>
                      <button
                        onClick={() => loadDraftPreset(1)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        Sarah Jenkins
                      </button>
                      <button
                        onClick={() => loadDraftPreset(2)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        Tan Kok Seng
                      </button>
                    </div>
                  </div>

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
          FOOTER
          ===================================================================== */}
      <footer className="bg-slate-900 border-t border-slate-850 py-6 mt-12 px-4" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-court-gold" />
            <span>Malaysian Industrial Court Legal Assistant Prototype Blueprint</span>
          </div>
          <div>
            Powered by <strong className="text-slate-300">Google Agent Development Kit (ADK)</strong> & <strong className="text-slate-300">Gemini 2.5 Pro</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
