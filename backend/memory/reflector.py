"""
Memory Reflector Module for Oculus Dei Life Management System

This module analyzes stored memory entries and initiates reflective prompts
based on observed patterns or events, enabling the system to learn from
experience and improve its decision making over time.
"""

from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import random

from backend.memory.memory_store import MemoryEntry
from backend.memory.memory_writer import get_memory_store, log_insight
from backend.memory.memory_retriever import (
    get_entries_in_timeframe,
    find_patterns_in_events,
    get_last_decisions,
    count_entries_by_type,
    get_recent_errors,
)


class MemoryReflector:
    """
    Analyzes memory entries to identify patterns and generate reflective prompts.
    
    The MemoryReflector class serves as the system's self-reflection mechanism,
    continuously analyzing stored memories to identify patterns, anomalies,
    or significant events that warrant deeper reflection.
    """
    
    def __init__(self):
        """Initialize the Memory Reflector."""
        self.memory_store = get_memory_store()
        self.reflection_thresholds = {
            "project_count": 3,  # Minimum projects to compare
            "decision_sequence": 5,  # Decisions to analyze for patterns
            "event_pattern_threshold": 3,  # Minimum events to identify a pattern
            "reflection_interval_hours": 24  # Don't reflect on the same thing too often
        }
        self.last_reflection_time = None
        self.last_reflection_topic = None
    
    def analyze_and_respond(self) -> Optional[str]:
        """
        Analyze memory patterns and generate a reflective prompt if warranted.
        
        This method examines the stored memories for patterns or events that
        would benefit from reflection, and returns an appropriate prompt
        to stimulate deeper analysis by the system or user.
        
        Returns:
            Optional[str]: A reflective prompt if patterns warrant reflection,
                           None otherwise
        """
        # Don't reflect too frequently on the same topics
        if self._should_skip_reflection():
            return None
        
        # Try different reflection strategies in priority order
        reflection = (
            self._reflect_on_project_patterns() or
            self._reflect_on_decision_sequences() or
            self._reflect_on_event_patterns() or
            self._reflect_on_recent_errors() or
            self._reflect_on_time_allocation() or
            self._generate_random_reflection()  # Fallback
        )
        
        if reflection:
            # Record this reflection
            self.last_reflection_time = datetime.now()
            self.last_reflection_topic = reflection[:50]  # Store first 50 chars as topic
            
            # Log the reflection as an insight
            log_insight(
                f"Reflection initiated: {reflection}",
                "memory_reflector",
                {"reflection_type": "automatic", "full_prompt": reflection}
            )
        
        return reflection
    
    def _should_skip_reflection(self) -> bool:
        """
        Determine if reflection should be skipped based on recent activity.
        
        Returns:
            bool: True if reflection should be skipped, False otherwise
        """
        # Skip if we reflected recently
        if self.last_reflection_time:
            hours_since_last = (datetime.now() - self.last_reflection_time).total_seconds() / 3600
            if hours_since_last < self.reflection_thresholds["reflection_interval_hours"]:
                return True
        
        # Skip if there are very few entries to reflect on
        entry_counts = count_entries_by_type()
        total_entries = sum(entry_counts.values())
        if total_entries < 5:  # Need a minimum number of entries for meaningful reflection
            return True
        
        return False
    
    def _reflect_on_project_patterns(self) -> Optional[str]:
        """
        Generate reflections based on patterns across projects.
        
        Returns:
            Optional[str]: A reflection prompt about project patterns, or None
        """
        # Get project entries
        project_entries = self.memory_store.retrieve_by_type("project")
        
        if len(project_entries) < self.reflection_thresholds["project_count"]:
            return None
            
        # Look for patterns in project priorities or categories
        projects_by_priority = {}
        projects_by_category = {}
        
        for entry in project_entries:
            # Extract project metadata
            priority = entry.metadata.get("priority")
            category = entry.metadata.get("category")
            
            if priority:
                if priority not in projects_by_priority:
                    projects_by_priority[priority] = []
                projects_by_priority[priority].append(entry)
                
            if category:
                if category not in projects_by_category:
                    projects_by_category[category] = []
                projects_by_category[category].append(entry)
        
        # Check for dominant priorities
        dominant_priority = None
        max_count = 0
        for priority, projects in projects_by_priority.items():
            if len(projects) > max_count:
                max_count = len(projects)
                dominant_priority = priority
                
        if dominant_priority and max_count >= self.reflection_thresholds["project_count"]:
            percentage = (max_count / len(project_entries)) * 100
            if percentage > 70:  # More than 70% of projects have the same priority
                return (
                    f"I notice that {percentage:.0f}% of your projects are marked as '{dominant_priority}' priority. "
                    f"Is this an accurate reflection of your true priorities, or should some projects be reconsidered? "
                    f"How might this affect your ability to distinguish between what's truly important?"
                )
        
        # Check for category imbalance
        if len(projects_by_category) >= 2:
            # Sort categories by number of projects
            sorted_categories = sorted(
                projects_by_category.items(),
                key=lambda x: len(x[1]),
                reverse=True
            )
            
            top_category, top_projects = sorted_categories[0]
            bottom_category, bottom_projects = sorted_categories[-1]
            
            if len(top_projects) >= 3 and len(top_projects) >= len(bottom_projects) * 3:
                return (
                    f"I've observed that you have {len(top_projects)} projects in the '{top_category}' category, "
                    f"but only {len(bottom_projects)} in '{bottom_category}'. "
                    f"Does this distribution align with your life goals and values? "
                    f"Would more balance between categories benefit your overall wellbeing?"
                )
        
        return None
    
    def _reflect_on_decision_sequences(self) -> Optional[str]:
        """
        Analyze sequences of decisions for patterns or potential improvements.
        
        Returns:
            Optional[str]: A reflection about decision patterns, or None
        """
        recent_decisions = get_last_decisions(self.reflection_thresholds["decision_sequence"])
        
        if len(recent_decisions) < self.reflection_thresholds["decision_sequence"]:
            return None
            
        # Look for confidence patterns
        confidence_values = []
        for decision in recent_decisions:
            confidence = decision.metadata.get("confidence")
            if confidence is not None:
                confidence_values.append(float(confidence))
        
        if confidence_values:
            avg_confidence = sum(confidence_values) / len(confidence_values)
            
            if avg_confidence > 0.9:
                return (
                    f"I notice your recent decisions have had very high confidence levels (averaging {avg_confidence:.2f}). "
                    "While confidence is good, are you perhaps not challenging yourself with more difficult decisions? "
                    "Are there areas where calculated risk-taking might yield better long-term outcomes?"
                )
            elif avg_confidence < 0.6:
                return (
                    f"Your recent decisions appear to have lower confidence levels (averaging {avg_confidence:.2f}). "
                    "What additional information or expertise might help increase your confidence? "
                    "Are there patterns in the types of decisions where you feel less certain?"
                )
        
        # Check for decision reversals
        decision_topics = {}
        for decision in recent_decisions:
            # Try to extract topic from content
            content = decision.content.lower()
            for keyword in ["about", "on", "regarding", "for", "to"]:
                if f" {keyword} " in content:
                    parts = content.split(f" {keyword} ")
                    if len(parts) > 1:
                        topic = parts[1].split(".")[0].strip()
                        if topic not in decision_topics:
                            decision_topics[topic] = []
                        decision_topics[topic].append(decision)
        
        # Look for topics with multiple decisions (potential reversals or refinements)
        for topic, decisions in decision_topics.items():
            if len(decisions) >= 2:
                time_span = (decisions[0].timestamp - decisions[-1].timestamp).days
                if time_span <= 7:  # Multiple decisions on same topic within a week
                    return (
                        f"I notice you've made {len(decisions)} decisions about '{topic}' within {time_span} days. "
                        "Are you refining your approach as you learn, or perhaps reconsidering earlier decisions? "
                        "What additional context or information has influenced these adjustments?"
                    )
        
        return None
    
    def _reflect_on_event_patterns(self) -> Optional[str]:
        """
        Identify patterns in events and suggest reflective insights.
        
        Returns:
            Optional[str]: A reflection about event patterns, or None
        """
        # Use the pattern finder from the retriever
        patterns = find_patterns_in_events(14)  # Look at last 2 weeks
        
        if not patterns:
            return None
            
        # Find the most dominant pattern
        for pattern in patterns:
            if pattern["count"] >= self.reflection_thresholds["event_pattern_threshold"]:
                return (
                    f"I've noticed a pattern of {pattern['count']} events related to '{pattern['pattern_value']}' "
                    f"in your recent activities. For example: '{pattern['examples'][0]}'. "
                    f"How does this pattern align with your current goals and priorities? "
                    f"Is this distribution of attention intentional or emergent?"
                )
        
        return None

    def _reflect_on_recent_errors(self) -> Optional[str]:
        """Reflect on recent error events."""
        errors = get_recent_errors(7)
        if len(errors) < 3:
            return None

        severity_order = {"critical": 4, "error": 3, "warning": 2, "info": 1}
        most_severe = max(
            errors,
            key=lambda e: severity_order.get(e.metadata.get("severity", "info"), 1),
        )
        sev = most_severe.metadata.get("severity", "info")
        return (
            f"I noticed {len(errors)} error events logged in the last week. "
            f"The most severe was '{sev}': '{most_severe.content}'. "
            "What actions could help avoid similar issues?"
        )
    
    def _reflect_on_time_allocation(self) -> Optional[str]:
        """
        Analyze time allocation patterns across different activities.
        
        Returns:
            Optional[str]: A reflection about time allocation, or None
        """
        # Get events from the last 30 days
        start_time = datetime.now() - timedelta(days=30)
        recent_entries = get_entries_in_timeframe(start_time)
        
        # Extract time allocation information if available
        time_by_category = {}
        total_recorded_time = 0
        
        for entry in recent_entries:
            duration = entry.metadata.get("duration_minutes") or entry.metadata.get("time_spent")
            category = entry.metadata.get("category")
            
            if duration and category:
                try:
                    duration = float(duration)
                    if category not in time_by_category:
                        time_by_category[category] = 0
                    time_by_category[category] += duration
                    total_recorded_time += duration
                except (ValueError, TypeError):
                    continue
        
        if not time_by_category or total_recorded_time < 60:  # Need at least an hour of recorded time
            return None
            
        # Find highest and lowest time categories
        if len(time_by_category) >= 2:
            # Convert to hours for readability
            time_by_category_hours = {k: v/60 for k, v in time_by_category.items()}
            total_hours = total_recorded_time / 60
            
            # Sort by time spent
            sorted_categories = sorted(
                time_by_category_hours.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            top_category, top_hours = sorted_categories[0]
            bottom_category, bottom_hours = sorted_categories[-1]
            
            top_percentage = (top_hours / total_hours) * 100
            bottom_percentage = (bottom_hours / total_hours) * 100
            
            if top_percentage > 50:
                return (
                    f"I notice that {top_percentage:.1f}% of your recorded time is spent on '{top_category}' "
                    f"activities, while only {bottom_percentage:.1f}% goes to '{bottom_category}'. "
                    "Does this allocation reflect your ideal balance? "
                    "Are there areas that might benefit from more attention or less focus?"
                )
        
        return None
    
    def _generate_random_reflection(self) -> str:
        """
        Generate a random reflection prompt as a fallback.
        
        Returns:
            str: A generic reflection prompt
        """
        reflections = [
            "Looking at your recent activities, are there any patterns that surprise you? " 
            "What might these patterns reveal about your current priorities?",
            
            "If you were to categorize your recent decisions, what themes would emerge? " 
            "Do these themes align with your long-term goals?",
            
            "How would you describe the balance between reactive and proactive decisions " 
            "in your recent activities? Is this balance serving you well?",
            
            "When you consider your current projects and commitments, which ones energize you? " 
            "Which ones deplete your energy? What might this tell you?",
            
            "What areas of your life or work have received less attention recently? " 
            "Is this a conscious choice or an unintended consequence of other priorities?"
        ]
        
        return random.choice(reflections)
    
    def trigger_reflection_on_topic(self, topic: str) -> str:
        """
        Manually trigger a reflection on a specific topic.
        
        Args:
            topic: The topic to reflect on
            
        Returns:
            str: A reflection prompt related to the requested topic
        """
        topic_reflections = {
            "time": [
                "How effectively do you feel you're allocating your time across different areas of your life?",
                "Are there activities that consume your time but don't provide proportional value?",
                "In what ways could you restructure your time to better align with your priorities?"
            ],
            "projects": [
                "Which of your current projects is most aligned with your long-term vision?",
                "Are there projects you should consider delegating or eliminating?",
                "What criteria should you use to evaluate new project opportunities going forward?"
            ],
            "balance": [
                "How would you describe the current balance between work, personal time, and rest?",
                "What areas of your life feel undernourished or over-extended?",
                "What small adjustments might create a more sustainable balance for you?"
            ],
            "priorities": [
                "If you could only focus on three priorities for the next month, what would they be?",
                "Are your stated priorities aligned with how you actually spend your time and energy?",
                "What current commitments might you need to respectfully disengage from to honor your true priorities?"
            ],
            "decisions": [
                "What decision-making patterns have served you well recently?",
                "Are there decisions you've been postponing that are creating friction in your progress?",
                "How might you improve your decision-making process for important choices?"
            ]
        }
        
        # Find the closest matching topic
        for key in topic_reflections:
            if key in topic.lower():
                reflection = random.choice(topic_reflections[key])
                
                # Log the manually triggered reflection
                log_insight(
                    f"Manual reflection on {key}: {reflection}",
                    "memory_reflector",
                    {"reflection_type": "manual", "topic": key, "full_prompt": reflection}
                )
                
                return reflection
        
        # If no specific topic matches, give a general reflection
        general_reflection = "What patterns or insights can you identify when you reflect on this area of your life and work?"
        
        log_insight(
            f"Manual reflection on unspecified topic: {general_reflection}",
            "memory_reflector",
            {"reflection_type": "manual", "topic": topic, "full_prompt": general_reflection}
        )
        
        return general_reflection


# Example usage
if __name__ == "__main__":
    from backend.memory.memory_writer import log_decision, log_event, log_project
    
    # Create some sample entries if the memory store is empty
    memory_store = get_memory_store()
    
    if memory_store.count_entries() == 0:
        # Create projects with different priorities and categories
        project1 = log_project(
            "ML financial forecasting project",
            "ML Financial Forecasting",
            {"priority": "high", "category": "work"}
        )
        
        project2 = log_project(
            "Personal fitness improvement",
            "Fitness Program",
            {"priority": "medium", "category": "health"}
        )
        
        project3 = log_project(
            "Team management strategy",
            "Management Strategy",
            {"priority": "high", "category": "work"}
        )
        
        # Log some decisions with varying confidence
        log_decision(
            "Allocated 2 hours daily to the ML project",
            {"related_to": project1, "confidence": 0.9}
        )
        
        log_decision(
            "Decided to use TensorFlow for model implementation",
            {"related_to": project1, "confidence": 0.8}
        )
        
        log_decision(
            "Scheduled 3 workouts per week for fitness",
            {"related_to": project2, "confidence": 0.7}
        )
        
        # Log events with time allocation
        log_event(
            "Worked on ML data preprocessing",
            {"related_to": project1, "duration_minutes": 120, "category": "work"}
        )
        
        log_event(
            "Completed strength training session",
            {"related_to": project2, "duration_minutes": 60, "category": "health"}
        )
        
        log_event(
            "Team meeting on strategy implementation",
            {"related_to": project3, "duration_minutes": 90, "category": "work"}
        )
    
    # Create and use the reflector
    reflector = MemoryReflector()
    reflection = reflector.analyze_and_respond()
    
    print("Memory Reflection:")
    if reflection:
        print(reflection)
    else:
        print("No reflection generated at this time.")
    
    print("\nTriggered Reflection on 'Time Management':")
    print(reflector.trigger_reflection_on_topic("Time Management")) 