"""
Memory Store Module for Oculus Dei Life Management System

This module provides core memory storage and retrieval functionality
for the Oculus Dei system, serving as the system's episodic memory.
Currently implemented as in-memory storage with plans to extend to
vector databases (ChromaDB or Qdrant) in the future.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
import re
import threading
from pydantic import BaseModel, Field


class MemoryEntry(BaseModel):
    """
    Represents a single memory entry in the Oculus Dei system.
    
    Memory entries store various types of information that the system
    needs to remember, such as user interactions, decisions made,
    events that occurred, or knowledge acquired.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.now)
    type: str  # e.g., "project", "decision", "event", "interaction", etc.
    content: str  # The actual memory content
    metadata: Dict[str, Any] = Field(default_factory=dict)  # Additional contextual information
    
    def age_in_seconds(self) -> float:
        """Calculate how old this memory entry is in seconds."""
        return (datetime.now() - self.timestamp).total_seconds()
    
    def to_dict(self) -> Dict:
        """Convert the memory entry to a dictionary representation."""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "type": self.type,
            "content": self.content,
            "metadata": self.metadata
        }


class MemoryStore:
    """
    Core memory store for the Oculus Dei system.
    
    Provides methods to store and retrieve memory entries. Currently
    implements a simple in-memory storage mechanism, but designed to be 
    extended to support vector databases in the future.
    """
    
    def __init__(self):
        """Initialize an empty memory store."""
        self.entries: List[MemoryEntry] = []
        self.type_index: Dict[str, List[MemoryEntry]] = {}  # Index for faster type-based retrieval
        self._lock = threading.RLock()
    
    def store(self, entry: MemoryEntry) -> str:
        """
        Store a new memory entry in the memory store.
        
        Args:
            entry: MemoryEntry object to store
            
        Returns:
            ID of the stored entry
        """
        with self._lock:
            # Add to main entries list
            self.entries.append(entry)

            # Update type index
            if entry.type not in self.type_index:
                self.type_index[entry.type] = []
            self.type_index[entry.type].append(entry)

            return entry.id
    
    def retrieve_by_type(self, entry_type: str) -> List[MemoryEntry]:
        """
        Retrieve all memory entries of a specific type.
        
        Args:
            entry_type: Type of entries to retrieve
            
        Returns:
            List of MemoryEntry objects matching the specified type
        """
        with self._lock:
            return list(self.type_index.get(entry_type, []))
    
    def search_by_text(self, keyword: str) -> List[MemoryEntry]:
        """
        Search for memory entries containing the specified keyword in their content.
        
        This is a simple text-based search. In future vector database implementations,
        this would be replaced with semantic search capabilities.
        
        Args:
            keyword: Text to search for in memory entry content
            
        Returns:
            List of MemoryEntry objects matching the search criteria
        """
        if not keyword:
            return []

        pattern = re.compile(keyword, re.IGNORECASE)
        with self._lock:
            return [entry for entry in self.entries if pattern.search(entry.content)]
    
    def get_last(self, n: int = 10) -> List[MemoryEntry]:
        """
        Retrieve the n most recent memory entries.
        
        Args:
            n: Number of entries to retrieve (default: 10)
            
        Returns:
            List of the n most recent MemoryEntry objects, sorted by timestamp (newest first)
        """
        # Sort entries by timestamp (newest first) and return the top n
        with self._lock:
            sorted_entries = sorted(self.entries, key=lambda x: x.timestamp, reverse=True)
            return sorted_entries[:n]
    
    def get_by_id(self, entry_id: str) -> Optional[MemoryEntry]:
        """
        Retrieve a specific memory entry by its ID.
        
        Args:
            entry_id: ID of the entry to retrieve
            
        Returns:
            MemoryEntry object if found, None otherwise
        """
        with self._lock:
            for entry in self.entries:
                if entry.id == entry_id:
                    return entry
            return None
    
    def count_entries(self, entry_type: Optional[str] = None) -> int:
        """
        Count the number of entries in the memory store, optionally filtered by type.
        
        Args:
            entry_type: Optional type to filter by
            
        Returns:
            Number of entries matching the criteria
        """
        with self._lock:
            if entry_type:
                return len(self.retrieve_by_type(entry_type))
            return len(self.entries)
    
    def clear(self, entry_type: Optional[str] = None) -> int:
        """
        Clear entries from the memory store, optionally filtered by type.
        
        Args:
            entry_type: Optional type to filter by
            
        Returns:
            Number of entries removed
        """
        with self._lock:
            if not entry_type:
                count = len(self.entries)
                self.entries = []
                self.type_index = {}
                return count

            entries_to_remove = self.retrieve_by_type(entry_type)
            count = len(entries_to_remove)
            self.entries = [entry for entry in self.entries if entry.type != entry_type]
            if entry_type in self.type_index:
                del self.type_index[entry_type]

            return count
    
    def search_by_metadata(self, key: str, value: Any) -> List[MemoryEntry]:
        """
        Search for memory entries with matching metadata.
        
        Args:
            key: Metadata key to match
            value: Metadata value to match
            
        Returns:
            List of MemoryEntry objects with matching metadata
        """
        with self._lock:
            return [
                entry for entry in self.entries
                if key in entry.metadata and entry.metadata[key] == value
            ]


# Example usage
if __name__ == "__main__":
    # Create a memory store
    memory = MemoryStore()
    
    # Store some sample entries
    project_memory = MemoryEntry(
        type="project",
        content="Started work on the ML financial forecasting project",
        metadata={
            "project_name": "ML-based financial forecasting",
            "priority": "high"
        }
    )
    memory.store(project_memory)
    
    decision_memory = MemoryEntry(
        type="decision",
        content="Decided to allocate 2 hours per day to the ML project",
        metadata={
            "related_to": project_memory.id,
            "confidence": 0.8
        }
    )
    memory.store(decision_memory)
    
    event_memory = MemoryEntry(
        type="event",
        content="Completed initial research for ML project",
        metadata={
            "related_to": project_memory.id,
            "completion": 0.2
        }
    )
    memory.store(event_memory)
    
    # Retrieve and display entries
    print(f"Total entries: {memory.count_entries()}")
    print(f"Project entries: {memory.count_entries('project')}")
    
    print("\nLast 2 entries:")
    for entry in memory.get_last(2):
        print(f"[{entry.timestamp}] {entry.type}: {entry.content}")
    
    print("\nEntries containing 'ML':")
    for entry in memory.search_by_text("ML"):
        print(f"[{entry.type}] {entry.content}") 