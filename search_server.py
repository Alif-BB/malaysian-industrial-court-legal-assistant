import os
import re
import logging
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine_v1 as discoveryengine
from google.cloud import storage
from dotenv import load_dotenv


# Load environment configuration
load_dotenv()

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SearchServer")

app = FastAPI(title="Direct Vertex AI Search Service", version="1.0")

# Enable CORS for local client connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: Optional[str] = None
    claimant_or_union: Optional[str] = None
    respondent: Optional[str] = None
    case_year: Optional[int] = None
    case_code: Optional[str] = None
    award_number: Optional[str] = None

class SearchResultItem(BaseModel):
    id: str
    title: str
    uri: str
    snippets: List[str]

class SearchResponse(BaseModel):
    results: List[SearchResultItem]

@app.post("/search", response_model=SearchResponse)
async def search_direct(req: SearchRequest):
    project_id = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("VERTEX_SEARCH_LOCATION", os.getenv("GCP_LOCATION", "global"))
    data_store_id = os.getenv("VERTEX_SEARCH_DATA_STORE_ID")
    serving_config_id = "default_search"

    logger.info(f"Received direct search request: {req}")

    if not project_id or not data_store_id:
        raise HTTPException(
            status_code=400, 
            detail="GCP environment configurations (GCP_PROJECT_ID, VERTEX_SEARCH_DATA_STORE_ID) are missing."
        )

    # Formulate precise query text by merging specific fields
    query_parts = []
    if req.query:
        query_parts.append(req.query)
    if req.claimant_or_union:
        query_parts.append(req.claimant_or_union)
    if req.respondent:
        query_parts.append(req.respondent)
    if req.case_year:
        query_parts.append(str(req.case_year))
    if req.award_number:
        query_parts.append(req.award_number)

    query_text = " ".join(query_parts) if query_parts else "Malaysian Industrial Relations"

    try:
        # Build Discovery Engine client options
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

        # Configure snippet returns for unstructured document query
        content_search_spec = discoveryengine.SearchRequest.ContentSearchSpec(
            snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                return_snippet=True
            )
        )

        # Query direct Vertex AI search index
        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=query_text,
            content_search_spec=content_search_spec,
            page_size=10,  # Return up to 10 matching awards for rich results
        )
        response = client.search(request)


        results = []
        for result in response.results:
            doc = result.document
            doc_title = "Court Award Document"
            doc_uri = ""

            if doc.derived_struct_data:
                # Link contains the Google Cloud Storage path (gs://...) or web path
                doc_uri = doc.derived_struct_data.get("link", "")

            # Fallback to general URI if link structure is missing
            if not doc_uri:
                doc_uri = f"gs://{data_store_id}/{doc.id}"

            # Extract and URL-decode the original GCS filename as the card's display title
            import urllib.parse
            raw_filename = os.path.basename(doc_uri)
            doc_title = urllib.parse.unquote(raw_filename)


            snippets = []
            if doc.derived_struct_data and "snippets" in doc.derived_struct_data:
                for s in doc.derived_struct_data["snippets"]:
                    if "snippet" in s:
                        # Clean html highlight tags and map to standard markdown
                        cleaned_snippet = s["snippet"].replace("<b>", "**").replace("</b>", "**")
                        snippets.append(cleaned_snippet)

            results.append(SearchResultItem(
                id=doc.id,
                title=doc_title,
                uri=doc_uri,
                snippets=snippets if snippets else ["Matching elements found inside the document text."]
            ))

        logger.info(f"Direct search completed. Found {len(results)} results.")
        return SearchResponse(results=results)

    except Exception as e:
        logger.error(f"Error querying GCP Discovery Engine: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def parse_gs_uri(uri: str):
    """
    Parses a Google Cloud Storage URI in the format gs://bucket_name/blob_path
    """
    match = re.match(r"gs://([^/]+)/(.+)", uri)
    if match:
        return match.group(1), match.group(2)
    return None, None

@app.get("/pdf")
async def get_pdf(uri: str):
    """
    Fetches a PDF file from Google Cloud Storage and returns it as a live stream
    allowing standard browsers to preview or download the file directly.
    """
    logger.info(f"Received request to proxy/stream GCS PDF: {uri}")
    
    bucket_name, blob_name = parse_gs_uri(uri)
    if not bucket_name or not blob_name:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid GCS URI format: {uri}. Expected format: gs://bucket-name/path/to/file.pdf"
        )
        
    project_id = os.getenv("GCP_PROJECT_ID")
    try:
        storage_client = storage.Client(project=project_id)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        
        if not blob.exists():
            raise HTTPException(
                status_code=404, 
                detail=f"The requested file was not found in GCS bucket: {bucket_name}/{blob_name}"
            )
            
        content = blob.download_as_bytes()
        filename = os.path.basename(blob_name) or "court_award.pdf"
        
        # Stream PDF with standard inline header for native browser previewing
        return Response(
            content=content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=\"{filename}\"",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Error downloading from GCS: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch GCS PDF: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Search companion service on port 8083...")
    uvicorn.run(app, host="127.0.0.1", port=8083)

