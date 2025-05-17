"""
Memory API Module for Oculus Dei Life Management System

This module provides REST endpoints to interact with memory data in the Oculus Dei system,
allowing retrieval, searching, and creation of memory entries.
"""

from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Query, Path, Body, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime

# Import memory components
from backend.memory.memory_store import MemoryEntry
from backend.memory.memory_writer import get_memory_store, log_event, log_decision, log_insight, log_project
from backend.memory.memory_retriever import find_entries_by_keyword

# Create FastAPI app for memory routes
app = FastAPI(
    title="Oculus Dei Memory API",
    description="API for accessing and interacting with memory data in the Oculus Dei system",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Access the memory store singleton
memory_store = get_memory_store()


# API Models
class MemoryEntryResponse(BaseModel):
    """API representation of a memory entry"""
    id: str
    timestamp: str
    type: str
    content: str
    metadata: Dict[str, Any]


class MemoryCreateRequest(BaseModel):
    """Request model for creating a memory entry"""
    type: str = Field(..., description="Type of memory entry (e.g., 'event', 'decision', 'insight')")
    content: str = Field(..., description="Content of the memory entry")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional contextual information")


class MemoryListResponse(BaseModel):
    """Response model for a list of memory entries"""
    total: int
    entries: List[MemoryEntryResponse]


# Helper function to convert MemoryEntry to MemoryEntryResponse
def memory_entry_to_response(entry: MemoryEntry) -> MemoryEntryResponse:
    """Convert a MemoryEntry to a MemoryEntryResponse"""
    entry_dict = entry.to_dict()
    return MemoryEntryResponse(
        id=entry_dict["id"],
        timestamp=entry_dict["timestamp"],
        type=entry_dict["type"],
        content=entry_dict["content"],
        metadata=entry_dict["metadata"]
    )


@app.get("/", tags=["General"])
async def root():
    """Root endpoint providing basic API information"""
    return {
        "name": "Oculus Dei Memory API",
        "version": "0.1.0",
        "description": "Access and interact with memory data",
        "endpoints": [
            "/memory/last",
            "/memory/type/{entry_type}",
            "/memory/search",
            "/memory/insights",
            "/memory/manual"
        ]
    }


@app.get(
    "/memory/last",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Get the last N memory entries",
    description="Retrieve the most recent memory entries stored in the system"
)
async def get_last_entries(n: int = Query(10, ge=1, le=100, description="Number of entries to retrieve")):
    """
    Get the last N memory entries.
    
    This endpoint retrieves the most recent entries from the memory store,
    sorted by timestamp (newest first).
    
    Args:
        n: Number of entries to retrieve (default: 10, max: 100)
        
    Returns:
        MemoryListResponse with the retrieved entries
    """
    entries = memory_store.get_last(n)
    return MemoryListResponse(
        total=len(entries),
        entries=[memory_entry_to_response(entry) for entry in entries]
    )


@app.get(
    "/memory/type/{entry_type}",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Get memory entries by type",
    description="Retrieve memory entries of a specific type (e.g., 'decision', 'event', 'insight')"
)
async def get_entries_by_type(
    entry_type: str = Path(..., description="Type of memory entries to retrieve"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of entries to return")
):
    """
    Get memory entries of a specific type.
    
    This endpoint retrieves entries matching the specified type,
    sorted by timestamp (newest first).
    
    Args:
        entry_type: Type of entries to retrieve (e.g., 'decision', 'event')
        limit: Maximum number of entries to return
        
    Returns:
        MemoryListResponse with the retrieved entries
    """
    entries = memory_store.retrieve_by_type(entry_type)
    
    # Sort by timestamp (newest first) and apply limit
    sorted_entries = sorted(entries, key=lambda x: x.timestamp, reverse=True)[:limit]
    
    return MemoryListResponse(
        total=len(sorted_entries),
        entries=[memory_entry_to_response(entry) for entry in sorted_entries]
    )


@app.get(
    "/memory/search",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Search memory entries by keyword",
    description="Search for memory entries containing the specified keyword in their content"
)
async def search_entries(
    q: str = Query(..., min_length=2, description="Keyword to search for"),
    type_filter: Optional[str] = Query(None, description="Optional type filter")
):
    """
    Search memory entries by keyword.
    
    This endpoint searches for entries containing the specified keyword
    in their content, with an optional type filter.
    
    Args:
        q: Keyword to search for (minimum 2 characters)
        type_filter: Optional type to filter results
        
    Returns:
        MemoryListResponse with the matching entries
    """
    entries = find_entries_by_keyword(q, type_filter)
    
    return MemoryListResponse(
        total=len(entries),
        entries=[memory_entry_to_response(entry) for entry in entries]
    )


@app.get(
    "/memory/insights",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Get insight entries",
    description="Retrieve memory entries of type 'insight'"
)
async def get_insights(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of insights to return")
):
    """
    Get insight entries.
    
    This endpoint retrieves memory entries of type 'insight',
    which typically represent system observations, patterns,
    or reflections.
    
    Args:
        limit: Maximum number of insights to return
        
    Returns:
        MemoryListResponse with the retrieved insights
    """
    insights = memory_store.retrieve_by_type("insight")
    
    # Sort by timestamp (newest first) and apply limit
    sorted_insights = sorted(insights, key=lambda x: x.timestamp, reverse=True)[:limit]
    
    return MemoryListResponse(
        total=len(sorted_insights),
        entries=[memory_entry_to_response(entry) for entry in sorted_insights]
    )


@app.post(
    "/memory/manual",
    response_model=MemoryEntryResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Memory Creation"],
    summary="Create a memory entry manually",
    description="Manually create a new memory entry in the system"
)
async def create_manual_entry(entry_request: MemoryCreateRequest):
    """
    Create a memory entry manually.
    
    This endpoint allows the creation of a new memory entry
    with the specified type, content, and metadata.
    
    Args:
        entry_request: Details of the memory entry to create
        
    Returns:
        MemoryEntryResponse with the created entry
    """
    try:
        # Choose the appropriate logging function based on type
        entry_id = None
        
        if entry_request.type == "event":
            entry_id = log_event(entry_request.content, entry_request.metadata)
        elif entry_request.type == "decision":
            entry_id = log_decision(entry_request.content, entry_request.metadata)
        elif entry_request.type == "insight":
            source = entry_request.metadata.get("source", "manual_api")
            entry_id = log_insight(entry_request.content, source, entry_request.metadata)
        elif entry_request.type == "project":
            project_name = entry_request.metadata.get("project_name", "Unnamed Project")
            entry_id = log_project(entry_request.content, project_name, entry_request.metadata)
        else:
            # For other types, create a generic entry
            entry = MemoryEntry(
                type=entry_request.type,
                content=entry_request.content,
                metadata=entry_request.metadata
            )
            entry_id = memory_store.store(entry)
        
        # Retrieve the created entry
        created_entry = memory_store.get_by_id(entry_id)
        if not created_entry:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Memory entry was created but could not be retrieved"
            )
        
        return memory_entry_to_response(created_entry)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create memory entry: {str(e)}"
        )


# Example usage
if __name__ == "__main__":
    import uvicorn
    
    # Create some example entries if the memory store is empty
    if not memory_store.entries:
        # Create sample entries
        log_event("User login detected", {"user_id": "user123", "login_time": datetime.now().isoformat()})
        log_decision("Scheduled daily reflection at 9 PM", {"confidence": 0.9, "schedule_time": "21:00"})
        log_insight("User tends to be most productive in the morning", "activity_analysis", {"confidence": 0.8})
    
    # Run the API server
    uvicorn.run(app, host="0.0.0.0", port=8001) 