"""
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
        {
            "award_number": "104 of 2024",
            "case_number": "22/4-1102/23",
            "claimant": "Ahmad Bin Razali",
            "respondent": "Mega Global Tech Sdn Bhd",
            "case_code": "22",
            "case_year": 2024,
            "facts": "Claimant was summarily dismissed for alleged poor performance without a prior performance improvement plan (PIP) or written warnings.",
            "held": "Dismissal without just cause or excuse. The court held that the Respondent failed to establish poor performance in accordance with the established legal standards. Standard criteria in Malaysian Industrial Law (e.g., in the case of IE Project Sdn Bhd v. Tan Lee Seng [1987]) requires clear notice of performance standards, feedback/warning, and a reasonable opportunity to improve.",
            "remedy": "Backwages of 24 months (subject to 20% mitigation deduction for post-dismissal income) and compensation in lieu of reinstatement of 1 month salary for each year of completed service (5 years total)."
        },
        {
            "award_number": "315 of 2025",
            "case_number": "12/2-402/24",
            "claimant": "Sarah Elizabeth Jenkins",
            "respondent": "Nusantara Logistics Berhad",
            "case_code": "12",
            "case_year": 2025,
            "facts": "Claimant claimed constructive dismissal. The Respondent unilaterally removed her company car benefit and reassigned her core duties to a newly hired manager, effectively demoting her without her consent.",
            "held": "Constructive dismissal established. The court applied the contract test outlined in Wong Chee Hong v. Lim Seng Seng [1983] 1 MLJ 35. The unilateral alteration of the contract terms and reassignment of key functions went to the root of the contract of employment, showing that the employer no longer intended to be bound by the contract.",
            "remedy": "Reinstatement ordered, or alternatively, backwages of 24 months and 8 years compensation in lieu of reinstatement."
        },
        {
            "award_number": "042 of 2026",
            "case_number": "22/4-901/25",
            "claimant": "Tan Kok Seng & 14 Others",
            "respondent": "Eastern Manufacturing Berhad",
            "case_code": "22",
            "case_year": 2026,
            "facts": "A collective dismissal under the guise of retrenchment due to reorganization. The Claimants argued that the LIFO (Last In, First Out) principle was violated, and that foreign workers were retained while senior Malaysian workers were dismissed.",
            "held": "Dismissal without just cause or excuse. The Court found that while redundancy was genuine due to economic downturn, the selection process violated the Code of Conduct for Industrial Harmony 1975, specifically violating the LIFO principle without valid reasons, making the retrenchment subjective and unfair.",
            "remedy": "Redundancy benefits recalculated in accordance with Employment Regulations, plus backwages capped at 24 months."
        }
    ]

    # Perform simple matching to simulate RAG retrieval
    matches = []
    for item in mock_corpus:
        match = True
        
        if criteria.claimant_or_union and criteria.claimant_or_union.lower() not in item["claimant"].lower():
            match = False
        if criteria.respondent and criteria.respondent.lower() not in item["respondent"].lower():
            match = False
        if criteria.award_number and criteria.award_number not in item["award_number"]:
            match = False
        if criteria.case_number and criteria.case_number not in item["case_number"]:
            match = False
        if criteria.case_code and criteria.case_code != item["case_code"]:
            match = False
        if criteria.case_year and criteria.case_year != item["case_year"]:
            match = False
        if criteria.keyword_summary:
            keywords = criteria.keyword_summary.lower().split()
            found_keyword = False
            for kw in keywords:
                if kw in item["facts"].lower() or kw in item["held"].lower():
                    found_keyword = True
            if not found_keyword:
                match = False
                
        if match:
            matches.append(item)

    if not matches:
        return (
            "### Vertex AI RAG Corpus Query Output\n\n"
            "**No direct matching court awards found in the database.**\n"
            "Showing broader semantic matches for search criteria:\n"
            f"- Claimant/Union: `{criteria.claimant_or_union or 'Any'}`\n"
            f"- Respondent: `{criteria.respondent or 'Any'}`\n"
            f"- Award No: `{criteria.award_number or 'Any'}`\n\n"
            "**Standard Legal Precedent Guidance:** Under Section 20 of the Malaysian Industrial Relations Act 1967, "
            "the burden of proof lies on the employer to prove on a balance of probabilities that the dismissal of "
            "the employee was with just cause or excuse."
        )

    # Build response Markdown
    res_str = f"### Vertex AI RAG Corpus Query Results ({len(matches)} matches found)\n"
    res_str += "The following records were retrieved from the Google Drive Malaysian Industrial Court Award dataset:\n\n"
    
    for idx, match in enumerate(matches, 1):
        res_str += f"#### {idx}. Award No. {match['award_number']} (Case No: {match['case_number']})\n"
        res_str += f"**Parties:** *{match['claimant']}* v. *{match['respondent']}*\n"
        res_str += f"**Case Code/Year:** {match['case_code']} / {match['case_year']}\n"
        res_str += f"**Background Facts:**\n> {match['facts']}\n\n"
        res_str += f"**Court's Findings / Decision:**\n> {match['held']}\n\n"
        res_str += f"**Award / Remedy Granted:**\n> {match['remedy']}\n\n"
        res_str += "---\n\n"
        
    return res_str


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
    name="Malaysian Industrial Court Legal Assistant",
    instructions=legal_persona_instructions,
    tools=[
        search_industrial_awards,
        generate_industrial_court_template
    ],
    config=Config(
        model="gemini-2.5-pro", # Defaulting to Pro for advanced legal reasoning and template drafting
        temperature=0.2          # Low temperature for highly precise, non-hallucinatory legal logic
    )
)

if __name__ == "__main__":
    # Standard entry point to start the agent locally or start the ADK server
    print("Starting Malaysian Industrial Court Legal Assistant...")
    print("Active Tools: search_industrial_awards, generate_industrial_court_template")
    # IndustrialCourtAgent.start() # Runs ADK loop or server (depending on execution mode)
