"""
Memory Writer Module for Oculus Dei Life Management System

This module provides utility functions for writing various types of memory entries
into the system's MemoryStore, making it easier to log decisions, events, and other
important information with consistent formatting and metadata.
"""

from typing import Dict, List, Optional, Any
import datetime
from backend.memory.memory_store import MemoryEntry, MemoryStore

# Singleton instance of MemoryStore for the system
# In a real app, this would be injected or accessed through a service locator
memory_store = MemoryStore()


def log_decision(content: str, metadata: Dict = None) -> str:
    """
    Log a decision made by the system or user into memory.
    
    Decision entries capture choices made, their rationale, and context for 
    future reference and for explaining system behavior.
    
    Args:
        content: The description of the decision made
        metadata: Optional additional context for the decision
    
    Returns:
        ID of the created memory entry
    """
    if metadata is None:
        metadata = {}
    
    # Add standard decision metadata
    metadata.update({
        "decision_time": datetime.datetime.now().isoformat(),
        "decision_type": metadata.get("decision_type", "system")
    })
    
    entry = MemoryEntry(
        type="decision",
        content=content,
        metadata=metadata
    )
    
    return memory_store.store(entry)


def log_event(content: str, metadata: Dict = None) -> str:
    """
    Log an event or occurrence in the system.
    
    Event entries capture important happenings that the system should remember,
    such as completion of tasks, user interactions, or external integrations.
    
    Args:
        content: The description of the event
        metadata: Optional additional context for the event
    
    Returns:
        ID of the created memory entry
    """
    if metadata is None:
        metadata = {}
    
    entry = MemoryEntry(
        type="event",
        content=content,
        metadata=metadata
    )
    
    return memory_store.store(entry)


def log_project(content: str, project_name: str, metadata: Dict = None) -> str:
    """
    Log a project-related memory entry.
    
    Project entries capture information about projects, their status, and progress.
    
    Args:
        content: The description of the project information
        project_name: Name of the project this entry relates to
        metadata: Optional additional context for the project entry
    
    Returns:
        ID of the created memory entry
    """
    if metadata is None:
        metadata = {}
    
    # Ensure project name is included in metadata
    metadata["project_name"] = project_name
    
    entry = MemoryEntry(
        type="project",
        content=content,
        metadata=metadata
    )
    
    return memory_store.store(entry)


def log_insight(content: str, source: str = None, metadata: Dict = None) -> str:
    """
    Log an insight or realization by the system.
    
    Insight entries capture system observations, patterns recognized, or
    correlations discovered that might be valuable for future reasoning.
    
    Args:
        content: The insight or realization
        source: Optional source of the insight
        metadata: Optional additional context for the insight
    
    Returns:
        ID of the created memory entry
    """
    if metadata is None:
        metadata = {}
    
    if source:
        metadata["source"] = source
    
    entry = MemoryEntry(
        type="insight",
        content=content,
        metadata=metadata
    )
    
    return memory_store.store(entry)


def log_error(content: str, severity: str = "info", metadata: Dict = None) -> str:
    """
    Log an error or warning event.
    
    Error entries capture issues, failures, or warnings that might need
    attention or that explain system behavior.
    
    Args:
        content: Description of the error or warning
        severity: Severity level (info, warning, error, critical)
        metadata: Optional additional context for the error
    
    Returns:
        ID of the created memory entry
    """
    if metadata is None:
        metadata = {}
    
    metadata["severity"] = severity
    metadata["error_time"] = datetime.datetime.now().isoformat()
    
    entry = MemoryEntry(
        type="error",
        content=content,
        metadata=metadata
    )
    
    return memory_store.store(entry)


def get_memory_store() -> MemoryStore:
    """
    Get the global memory store instance.
    
    Returns:
        The singleton MemoryStore instance
    """
    return memory_store


# Example usage
if __name__ == "__main__":
    # Log some sample entries
    project_id = log_project(
        "Initiated ML financial forecasting project", 
        "ML-based financial forecasting", 
        {"priority": "high", "estimated_duration": "3 months"}
    )
    
    decision_id = log_decision(
        "Decided to allocate 2 hours per day to the ML project", 
        {"confidence": 0.8, "related_to": project_id}
    )
    
    event_id = log_event(
        "Completed initial research phase for ML project",
        {"completion": 0.2, "related_to": project_id}
    )
    
    # Retrieve and display all entries from the memory store
    store = get_memory_store()
    print(f"Total entries in memory: {store.count_entries()}")
    
    print("\nAll entries:")
    for entry in store.get_last(10):
        print(f"[{entry.timestamp}] {entry.type}: {entry.content}") 