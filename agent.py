"""
Malaysian Industrial Court Legal Assistant
Powered by google-adk (Google Agent Development Kit) and Gemini.
"""

from typing import Optional, List
import os
from pydantic import BaseModel, Field
from google.adk import Agent
from google.genai import types
from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine_v1 as discoveryengine

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
            "### Connection Configuration Guide\n\n"
            "The Malaysian Industrial Court Legal Assistant agent is ready to search your live GCS-backed Vertex AI Search Data Store, "
            "but the environment configuration is not yet complete.\n\n"
            "**How to configure:**\n"
            "1. Open your project's `.env` file at `/Users/mohdalifridzuanahmad/Documents/imp_docs/Projects/malaysian-industrial-court-legal-assistant/.env`.\n"
            "2. Fill in the following variables with your Google Cloud credentials:\n"
            "   ```env\n"
            "   GCP_PROJECT_ID=\"YOUR_GCP_PROJECT_ID\"\n"
            "   VERTEX_SEARCH_DATA_STORE_ID=\"YOUR_VERTEX_AI_SEARCH_DATA_STORE_ID\"\n"
            "   GCP_LOCATION=\"global\"\n"
            "   ```\n"
            "3. Make sure to authenticate locally using: `gcloud auth application-default login`"
        )

    # Formulate query text based on parsed criteria fields
    query_parts = []
    if criteria.claimant_or_union:
        query_parts.append(criteria.claimant_or_union)
    if criteria.respondent:
        query_parts.append(criteria.respondent)
    if criteria.keyword_summary:
        query_parts.append(criteria.keyword_summary)
    if criteria.case_year:
        query_parts.append(str(criteria.case_year))

    query_text = " ".join(query_parts) if query_parts else "Malaysian Industrial Court Award"

    try:
        # Configure search client
        client_options = (
            ClientOptions(api_endpoint=f"{location}-discoveryengine.googleapis.com")
            if location != "global"
            else None
        )
        client = discoveryengine.SearchServiceClient(client_options=client_options)

        serving_config = client.serving_config_path(
            project=project_id,
            location=location,
            data_store=data_store_id,
            serving_config=serving_config_id,
        )

        # Query the live Vertex AI Search data store
        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=query_text,
            page_size=5,
        )
        response = client.search(request)

        if not response.results:
            return f"### Vertex AI Search\n\nNo matching documents found in your GCS folder structure for query: *\"{query_text}\"*"

        res_str = f"### Vertex AI Search Results (Cloud Storage Sync)\n"
        res_str += f"Retrieved documents matching: *\"{query_text}\"*\n\n"

        for idx, result in enumerate(response.results, 1):
            document = result.document
            doc_title = "Court Award Document"
            if document.derived_struct_data:
                doc_title = document.derived_struct_data.get("title", doc_title)

            snippets = []
            if document.derived_struct_data and "snippets" in document.derived_struct_data:
                for s in document.derived_struct_data["snippets"]:
                    if "snippet" in s:
                        snippets.append(s["snippet"].replace("<b>", "**").replace("</b>", "**"))
            
            excerpt = "\n\n".join(snippets) if snippets else "Context matches found within the document contents."

            res_str += f"#### {idx}. Document: {doc_title}\n"
            res_str += f"**Matching Passage:**\n"
            res_str += f"> {excerpt}\n\n"
            res_str += "---\n\n"

        return res_str

    except Exception as e:
        return (
            f"### Error Querying GCP GCS Data Store\n\n"
            f"**Details:** {str(e)}\n\n"
            "Please verify that:\n"
            "1. Your Google Cloud credentials are valid and you have authenticated using: `gcloud auth application-default login`.\n"
            "2. Your `.env` variables `GCP_PROJECT_ID` and `VERTEX_SEARCH_DATA_STORE_ID` are set correctly.\n"
            "3. Your Vertex AI Search Data Store exists and has finished indexing the GCS bucket."
        )



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

    Args:
        claimant: The name of the employee or complainant.
        respondent: The name of the employer company.
        case_number: The Case Reference Number (e.g. '22/4-123/24').
        facts: Critical background facts and issues surrounding the termination or dispute.
        decision_summary: The primary legal findings and final holding of the Court.

    Returns:
        A formatted Markdown string containing the complete legal draft.
    """
    # Extract year from case number if possible, or default to current year
    year = "2026"
    if "/" in case_number:
        parts = case_number.split("/")
        last_part = parts[-1]
        if "-" in last_part:
            year_part = last_part.split("-")[-1]
            if len(year_part) == 2:
                year = f"20{year_part}"
            elif len(year_part) == 4:
                year = year_part

    template = f"""# INDUSTRIAL COURT OF MALAYSIA

**AWARD NO: [   ] OF {year}**

---

### IN THE MATTER OF THE INDUSTRIAL RELATIONS ACT 1967
### AND
### IN THE MATTER OF A REFERENCE UNDER SECTION 20(3) OF THE ACT

**BETWEEN**

**{claimant.upper()}**  
*(hereinafter referred to as "the Claimant")*

**AND**

**{respondent.upper()}**  
*(hereinafter referred to as "the Respondent")*

---

### PANEL OF THE COURT:
* **Chairman:** Yang Arif [Chairman Name]
* **Venue:** Industrial Court of Malaysia, Kuala Lumpur

---

## AWARD

### 1. INTRODUCTION
This is a reference made under **Section 20(3) of the Industrial Relations Act 1967** arising out of the dismissal of **{claimant}** ("the Claimant") by **{respondent}** ("the Respondent") on the grounds of alleged dismissal without just cause or excuse.

### 2. BACKGROUND FACTS
{facts}

### 3. THE LAW AND EVALUATION OF EVIDENCE
The function of the Industrial Court under Section 20 of the Industrial Relations Act 1967 is twofold:
1. To determine whether the misconduct/performance issue alleged by the employer has been proven.
2. To determine whether that proven misconduct or reason constitutes "just cause or excuse" for the dismissal.

The standard of proof required is a **balance of probabilities** (*Goonesinha v. O.L. Yeoh [1975] 1 MLJ 43*). The burden of proof rests entirely on the Respondent employer (*Milan Auto Sdn. Bhd. v. Wong Yeh [1995] 3 MLJ 537*).

### 4. COURT'S FINDINGS AND DECISION
{decision_summary}

Based on the evidence adduced both oral and documentary, the Court finds that the Respondent **[has / has not]** discharged its burden of proving just cause or excuse. 

### 5. REMEDY & FINAL ORDER
Pursuant to the **Second Schedule of the Industrial Relations Act 1967**:
* **Backwages:** Capped at 24 months for confirmed employees (12 months for probationers) from date of dismissal, subject to deduction for mitigation of damages and post-dismissal earnings.
* **Compensation in lieu of Reinstatement:** Standard practice is 1 month's salary for each completed year of service.

**THE COURT HEREBY ORDERS:**
1. The Respondent to pay the Claimant a total sum of **RM [Amount]** within thirty (30) days from the date of this Award, calculated as follows:
   * *Backwages:* RM [Monthly Salary] x [Months] months = **RM [Total Backwages]** (less [X]% for mitigation).
   * *Compensation in lieu of Reinstatement:* RM [Monthly Salary] x [Years of Service] years = **RM [Total Compensation]**.
2. Subject to statutory deductions for EPF and SOCSO (if applicable).

**HANDED DOWN AND DATED THIS [  ] DAY OF [MONTH], {year}.**

*(Yang Arif [Chairman Name])*  
**Chairman**  
*Industrial Court of Malaysia*
"""
    return template


# =====================================================================
# 3. AGENT INITIALIZATION
# =====================================================================

# Define the authoritative Malaysian Industrial Law persona instructions
legal_persona_instructions = """
You are the "Malaysian Industrial Court Legal Assistant," an expert AI legal advisor specializing 
in the Malaysian Industrial Relations Act 1967, Industrial Court rules, employment contracts, 
unfair dismissal cases, constructive dismissal, and retrenchment guidelines.

Your mission is to assist lawyers, human resource practitioners, and employees by:
1. Analyzing natural language user queries, extracting search criteria, and querying the legal corpus 
   using the 'search_industrial_awards' tool. Always be meticulous in extracting specific details like 
   Claimant Name, Respondent, Award No, Case No, or Year.
2. Generating standard legal draft templates for Malaysian Industrial Court awards using the 
   'generate_industrial_court_template' tool.

Operational Rules:
- Adopt a professional, objective, and authoritative legal tone.
- When summarizing cases, refer to famous Malaysian precedents where appropriate, such as:
  * Wong Chee Hong v. Lim Seng Seng [1983] 1 MLJ 35 (Constructive dismissal contract test)
  * Milan Auto Sdn. Bhd. v. Wong Yeh [1995] 3 MLJ 537 (Dual function of the court)
  * Goonesinha v. O.L. Yeoh [1975] 1 MLJ 43 (Standard of proof)
  * IE Project Sdn Bhd v. Tan Lee Seng [1987] (Performance warning standards)
- When the user asks to search or find cases, automatically invoke the 'search_industrial_awards' tool by parsing their query.
- When the user provides case details and asks to draft or generate an Award or Template, invoke 'generate_industrial_court_template'.
- Always respond in clear Markdown. Make legal citations bold or italicized.
"""

# Instantiate the Agent using the Google ADK configuration convention
IndustrialCourtAgent = Agent(
    name="industrial_court_agent",
    description="An expert AI legal assistant for Malaysian Industrial Court awards search and drafting.",
    instruction=legal_persona_instructions,
    tools=[
        search_industrial_awards,
        generate_industrial_court_template
    ],
    model="gemini-2.5-flash",
    generate_content_config=types.GenerateContentConfig(
        temperature=0.2
    )
)

root_agent = IndustrialCourtAgent

if __name__ == "__main__":
    # Standard entry point to start the agent locally or start the ADK server
    print("Starting Malaysian Industrial Court Legal Assistant...")
    print("Active Tools: search_industrial_awards, generate_industrial_court_template")
    # IndustrialCourtAgent.start() # Runs ADK loop or server (depending on execution mode)
