"""
Memory API Module for Oculus Dei Life Management System

This module provides REST endpoints to interact with memory data in the Oculus Dei system,
allowing retrieval, searching, and creation of memory entries.
"""

from typing import Dict, List, Optional, Any
from enum import Enum
from fastapi import FastAPI, HTTPException, Query, Path, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime

# Import memory components
from backend.memory.memory_store import MemoryEntry
from backend.memory.memory_writer import (
    get_memory_store,
    log_event,
    log_decision,
    log_insight,
    log_project,
    delete_entry as remove_entry,
)
from backend.memory.memory_retriever import (
    find_entries_by_keyword,
    semantic_search,
    summarize_recent_events,
    count_entries_by_type,
)

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
    class EntryType(str, Enum):
        event = "event"
        decision = "decision"
        insight = "insight"
        project = "project"
        error = "error"

    type: EntryType = Field(..., description="Type of memory entry")
    content: str = Field(..., description="Content of the memory entry")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional contextual information")


class MemoryListResponse(BaseModel):
    """Response model for a list of memory entries"""
    total: int
    entries: List[MemoryEntryResponse]


class EventSummaryResponse(BaseModel):
    """Response model for recent event summary"""
    summary: str


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
            "/memory/id/{entry_id}",
            "DELETE /memory/id/{entry_id}",
            "/memory/type/{entry_type}",
            "/memory/search",
            "/memory/insights",
            "/memory/manual",
            "/memory/stats",
            "/memory/events/summary"
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
    "/memory/id/{entry_id}",
    response_model=MemoryEntryResponse,
    tags=["Memory Retrieval"],
    summary="Get memory entry by ID",
    description="Retrieve a specific memory entry by its unique ID",
)
async def get_entry_by_id(entry_id: str = Path(..., description="Memory entry ID")):
    """Get a specific memory entry by ID."""
    entry = memory_store.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return memory_entry_to_response(entry)


@app.delete(
    "/memory/id/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Memory Management"],
    summary="Delete memory entry by ID",
    description="Remove a memory entry from the store using its ID",
)
async def delete_entry(entry_id: str = Path(..., description="Memory entry ID")):
    """Delete a memory entry by its unique ID."""
    deleted = remove_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get(
    "/memory/type/{entry_type}",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Get memory entries by type",
    description="Retrieve memory entries of a specific type (e.g., 'decision', 'event', 'insight')"
)
async def get_entries_by_type(
    entry_type: MemoryCreateRequest.EntryType = Path(..., description="Type of memory entries to retrieve"),
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
    entries = memory_store.retrieve_by_type(entry_type.value)
    
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
    "/memory/search_regex",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Regex search of memory entries",
    description="Search entries using a regular expression pattern",
)
async def regex_search_entries(
    pattern: str = Query(..., min_length=1, description="Regex pattern"),
    type_filter: Optional[str] = Query(None, description="Optional type filter"),
):
    """Return entries matching the regex pattern."""
    try:
        entries = memory_store.search_by_regex(pattern)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if type_filter:
        entries = [e for e in entries if e.type == type_filter]

    return MemoryListResponse(
        total=len(entries),
        entries=[memory_entry_to_response(e) for e in entries],
    )


@app.get(
    "/memory/search_metadata",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Search by metadata substring",
    description="Search entries where a metadata value contains the given substring",
)
async def metadata_search_entries(
    key: str = Query(..., description="Metadata key"),
    value: str = Query(..., description="Substring to match"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of entries"),
):
    """Return entries matching the metadata substring."""
    entries = memory_store.search_by_metadata_value(key, value)[:limit]
    return MemoryListResponse(
        total=len(entries),
        entries=[memory_entry_to_response(e) for e in entries],
    )


@app.get(
    "/memory/semantic",
    response_model=MemoryListResponse,
    tags=["Memory Retrieval"],
    summary="Semantic search of memory entries",
    description="Retrieve entries most similar to the provided text using hashed embeddings",
)
async def semantic_search_entries(
    q: str = Query(..., min_length=2, description="Query text for semantic search"),
    n: int = Query(5, ge=1, le=50, description="Number of entries to return"),
    type_filter: Optional[str] = Query(None, description="Optional type filter"),
):
    """Return entries semantically similar to the query text."""
    entries = semantic_search(q, top_n=n, type_filter=type_filter)
    return MemoryListResponse(
        total=len(entries),
        entries=[memory_entry_to_response(entry) for entry in entries],
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


@app.get(
    "/memory/stats",
    response_model=Dict[str, int],
    tags=["Memory Retrieval"],
    summary="Get entry counts by type",
    description="Retrieve a summary of memory entry counts grouped by type",
)
async def get_memory_stats():
    """Return counts of memory entries by type."""
    try:
        return count_entries_by_type()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to retrieve memory statistics: {str(e)}",
        )


@app.get(
    "/memory/events/summary",
    response_model=EventSummaryResponse,
    tags=["Memory Retrieval"],
    summary="Summarize recent events",
    description="Generate a short bullet-point summary of recent events",
)
async def get_event_summary(
    n: int = Query(3, ge=1, le=20, description="Number of events to include"),
):
    """Return a summary of the most recent events."""
    try:
        summary = summarize_recent_events(n)
        return EventSummaryResponse(summary=summary)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate event summary: {str(e)}",
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
        
        if entry_request.type == MemoryCreateRequest.EntryType.event:
            entry_id = log_event(entry_request.content, entry_request.metadata)
        elif entry_request.type == MemoryCreateRequest.EntryType.decision:
            entry_id = log_decision(entry_request.content, entry_request.metadata)
        elif entry_request.type == MemoryCreateRequest.EntryType.insight:
            source = entry_request.metadata.get("source", "manual_api")
            entry_id = log_insight(entry_request.content, source, entry_request.metadata)
        elif entry_request.type == MemoryCreateRequest.EntryType.project:
            project_name = entry_request.metadata.get("project_name", "Unnamed Project")
            entry_id = log_project(entry_request.content, project_name, entry_request.metadata)
        else:
            # For other types, create a generic entry
            entry = MemoryEntry(
                type=entry_request.type.value,
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