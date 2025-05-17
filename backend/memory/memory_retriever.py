"""
Memory Retriever Module for Oculus Dei Life Management System

This module provides analytical access to the MemoryStore, enabling retrieval
and analysis of historical memory entries for self-reflection, pattern recognition,
and context-aware decision making.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from backend.memory.memory_store import MemoryEntry, MemoryStore
from backend.memory.memory_writer import get_memory_store


def get_last_decisions(n: int = 5) -> List[MemoryEntry]:
    """
    Retrieve the n most recent decision entries from memory.
    
    Args:
        n: Number of decision entries to retrieve (default: 5)
        
    Returns:
        List of the n most recent decision MemoryEntry objects
    """
    memory_store = get_memory_store()
    decisions = memory_store.retrieve_by_type("decision")
    
    # Sort by timestamp (newest first) and take the first n
    sorted_decisions = sorted(decisions, key=lambda x: x.timestamp, reverse=True)
    return sorted_decisions[:n]


def find_entries_by_keyword(keyword: str, type_filter: Optional[str] = None) -> List[MemoryEntry]:
    """
    Search for memory entries containing the specified keyword,
    optionally filtered by entry type.
    
    Args:
        keyword: Text to search for in memory entries
        type_filter: Optional type to filter results (e.g., "decision", "event")
        
    Returns:
        List of MemoryEntry objects matching the search criteria
    """
    if not keyword:
        return []
    
    memory_store = get_memory_store()
    
    # First, search by text
    matching_entries = memory_store.search_by_text(keyword)
    
    # Apply type filter if specified
    if type_filter:
        matching_entries = [entry for entry in matching_entries if entry.type == type_filter]
    
    return matching_entries


def get_related_entries(metadata_key: str, metadata_value: Any) -> List[MemoryEntry]:
    """
    Retrieve memory entries that have a specific metadata key-value pair.
    
    This function is useful for finding entries related to each other through
    metadata references, such as entries sharing the same project or context.
    
    Args:
        metadata_key: The metadata key to match
        metadata_value: The metadata value to match
        
    Returns:
        List of MemoryEntry objects with matching metadata
    """
    memory_store = get_memory_store()
    
    # Use the memory store's metadata search capability
    return memory_store.search_by_metadata(metadata_key, metadata_value)


def get_decision_history_for_project(project_name: str) -> List[MemoryEntry]:
    """
    Retrieve the decision history for a specific project.
    
    This function finds all decision entries related to a particular project,
    allowing the system to understand the evolution of a project through
    the decisions made about it.
    
    Args:
        project_name: Name of the project to retrieve decisions for
        
    Returns:
        List of decision MemoryEntry objects related to the project
    """
    memory_store = get_memory_store()
    
    # Get all decisions
    all_decisions = memory_store.retrieve_by_type("decision")
    
    # Find project entries matching the project name
    project_entries = memory_store.search_by_metadata("project_name", project_name)
    
    if not project_entries:
        return []
    
    # Get the IDs of the project entries
    project_ids = [entry.id for entry in project_entries]
    
    # Find decisions related to any of these project entries
    related_decisions = []
    for decision in all_decisions:
        # Check if the decision is related to any of the project entries
        if "related_to" in decision.metadata and decision.metadata["related_to"] in project_ids:
            related_decisions.append(decision)
        # Also check if project_name is directly in the decision metadata
        elif "project_name" in decision.metadata and decision.metadata["project_name"] == project_name:
            related_decisions.append(decision)
    
    # Sort by timestamp (oldest first) to get chronological history
    return sorted(related_decisions, key=lambda x: x.timestamp)


def summarize_recent_events(n: int = 3) -> str:
    """
    Generate a simple bullet-point summary of the n most recent events.
    
    This function provides a quick overview of recent system activity,
    formatted as a human-readable bullet-point list.
    
    Args:
        n: Number of recent events to summarize (default: 3)
        
    Returns:
        Bullet-point formatted string summary of recent events
    """
    memory_store = get_memory_store()
    events = memory_store.retrieve_by_type("event")
    
    if not events:
        return "No recent events recorded."
    
    # Sort by timestamp (newest first) and take the first n
    recent_events = sorted(events, key=lambda x: x.timestamp, reverse=True)[:n]
    
    if not recent_events:
        return "No recent events recorded."
    
    # Format as bullet points
    summary = "Recent events:\n"
    for event in recent_events:
        # Format the timestamp nicely
        time_str = event.timestamp.strftime("%Y-%m-%d %H:%M")
        summary += f"• {time_str}: {event.content}\n"
    
    return summary


def get_entries_in_timeframe(start_time: datetime, end_time: Optional[datetime] = None, 
                            type_filter: Optional[str] = None) -> List[MemoryEntry]:
    """
    Retrieve memory entries within a specified timeframe.
    
    Args:
        start_time: Starting datetime for the timeframe
        end_time: Ending datetime for the timeframe (default: current time)
        type_filter: Optional type to filter results
        
    Returns:
        List of MemoryEntry objects within the timeframe
    """
    if end_time is None:
        end_time = datetime.now()
    
    memory_store = get_memory_store()
    
    # Start with all entries or filtered by type
    if type_filter:
        entries = memory_store.retrieve_by_type(type_filter)
    else:
        entries = memory_store.entries
    
    # Filter by timeframe
    timeframe_entries = [
        entry for entry in entries
        if start_time <= entry.timestamp <= end_time
    ]
    
    return sorted(timeframe_entries, key=lambda x: x.timestamp)


def count_entries_by_type() -> Dict[str, int]:
    """
    Count the number of entries for each type.
    
    Returns:
        Dictionary mapping entry types to counts
    """
    memory_store = get_memory_store()
    
    type_counts = {}
    for entry in memory_store.entries:
        if entry.type not in type_counts:
            type_counts[entry.type] = 0
        type_counts[entry.type] += 1
    
    return type_counts


def find_patterns_in_events(window_days: int = 7) -> List[Dict]:
    """
    Identify patterns in events over the specified time window.
    
    This is a simple pattern finder that groups events by their metadata
    to identify recurring themes or activities.
    
    Args:
        window_days: Number of days to look back for patterns
        
    Returns:
        List of identified patterns with counts and examples
    """
    memory_store = get_memory_store()
    
    # Get events within the time window
    start_time = datetime.now() - timedelta(days=window_days)
    recent_events = get_entries_in_timeframe(start_time, type_filter="event")
    
    if not recent_events:
        return []
    
    # Group by metadata keys that might indicate patterns
    pattern_groups = {}
    
    for event in recent_events:
        # Try to find a pattern key in metadata
        for key in ["category", "activity_type", "project_name"]:
            if key in event.metadata:
                pattern_key = f"{key}:{event.metadata[key]}"
                
                if pattern_key not in pattern_groups:
                    pattern_groups[pattern_key] = {
                        "pattern_type": key,
                        "pattern_value": event.metadata[key],
                        "count": 0,
                        "examples": []
                    }
                
                pattern_groups[pattern_key]["count"] += 1
                if len(pattern_groups[pattern_key]["examples"]) < 3:  # Limit examples
                    pattern_groups[pattern_key]["examples"].append(event.content)
    
    # Convert to list and sort by count
    patterns = list(pattern_groups.values())
    patterns.sort(key=lambda x: x["count"], reverse=True)
    
    return patterns


# Example usage
if __name__ == "__main__":
    # Import memory_writer to create some sample entries
    from backend.memory.memory_writer import log_decision, log_event, log_project
    
    # Create some sample entries if the memory store is empty
    memory_store = get_memory_store()
    
    if memory_store.count_entries() == 0:
        # Create a project
        project_id = log_project(
            "Started ML financial forecasting project",
            "ML Financial Forecasting",
            {"priority": "high", "category": "work"}
        )
        
        # Log some decisions
        log_decision(
            "Allocated 2 hours daily to the ML project",
            {"related_to": project_id, "confidence": 0.8}
        )
        
        log_decision(
            "Decided to use TensorFlow for model implementation",
            {"related_to": project_id, "confidence": 0.9}
        )
        
        # Log some events
        log_event(
            "Completed data collection phase for ML project",
            {"related_to": project_id, "completion": 0.3, "activity_type": "research"}
        )
        
        log_event(
            "Started model training with initial dataset",
            {"related_to": project_id, "activity_type": "development"}
        )
    
    # Demonstrate the retrieval functions
    print("Recent Decisions:")
    for decision in get_last_decisions(2):
        print(f"- {decision.content}")
    
    print("\nEntries containing 'ML':")
    ml_entries = find_entries_by_keyword("ML")
    for entry in ml_entries:
        print(f"- [{entry.type}] {entry.content}")
    
    print("\nDecision History for ML Financial Forecasting:")
    project_decisions = get_decision_history_for_project("ML Financial Forecasting")
    for decision in project_decisions:
        print(f"- {decision.timestamp.strftime('%Y-%m-%d')}: {decision.content}")
    
    print("\nEntry Count by Type:")
    type_counts = count_entries_by_type()
    for entry_type, count in type_counts.items():
        print(f"- {entry_type}: {count}")
    
    print("\nEvent Summary:")
    print(summarize_recent_events()) 