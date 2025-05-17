"""
Project Registry Module for Oculus Dei Life Management System

This module manages the registration and analysis of new projects
within the Oculus Dei system, evaluating their impact on existing
goals, tasks, and time allocations.
"""

from enum import Enum
from typing import Dict, List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field


class PriorityLevel(str, Enum):
    """Priority levels for projects"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ProjectCategory(str, Enum):
    """Categories of projects"""
    WORK = "work"
    PERSONAL = "personal"
    CREATIVE = "creative"
    HEALTH = "health"
    EDUCATION = "education"
    SOCIAL = "social"
    FINANCIAL = "financial"
    OTHER = "other"


class TimeDemand(BaseModel):
    """Time demand specification for a project"""
    hours: float
    frequency: str = Field(..., description="e.g., 'per day', 'per week', 'per month'")
    
    def __str__(self) -> str:
        return f"{self.hours} hours {self.frequency}"


class Duration(BaseModel):
    """Duration specification for a project"""
    value: int
    unit: str = Field(..., description="e.g., 'weeks', 'months'")
    
    def __str__(self) -> str:
        return f"{self.value} {self.unit}"


class Project(BaseModel):
    """
    Project model representing a structured intention with time commitments
    and categorization.
    """
    name: str
    description: str
    duration: Duration
    priority_level: PriorityLevel
    category: ProjectCategory
    time_demand: TimeDemand
    created_at: datetime = Field(default_factory=datetime.now)
    
    def estimated_total_hours(self) -> float:
        """Calculate estimated total hours for the entire project duration."""
        # Convert duration to days
        days = 0
        if self.duration.unit == "weeks":
            days = self.duration.value * 7
        elif self.duration.unit == "months":
            days = self.duration.value * 30  # Approximation
        else:
            days = self.duration.value  # Assuming days
            
        # Calculate based on frequency
        if self.time_demand.frequency == "per day":
            return days * self.time_demand.hours
        elif self.time_demand.frequency == "per week":
            return (days / 7) * self.time_demand.hours
        elif self.time_demand.frequency == "per month":
            return (days / 30) * self.time_demand.hours
        
        return 0  # Default fallback


class ImpactedEntity(BaseModel):
    """Represents an entity affected by a new project"""
    entity_type: str = Field(..., description="Type of entity: 'goal', 'task', or 'stream'")
    entity_id: str
    entity_name: str
    impact_level: float = Field(..., description="Impact score from 0.0 to 1.0")
    impact_description: str


class PlanAdjustment(BaseModel):
    """Recommended adjustment to existing plans"""
    adjustment_type: str = Field(..., description="e.g., 'reschedule', 'reduce_scope', 'delegate'")
    target_entity: str = Field(..., description="Entity to adjust")
    adjustment_description: str
    priority: int = Field(..., description="1-10 where 10 is highest priority")


class ProjectImpactAnalysis(BaseModel):
    """Analysis of a project's impact on the existing system"""
    impact_analysis: List[ImpactedEntity]
    reschedule_required: bool
    recommended_plan_adjustments: List[PlanAdjustment]


class ProjectRegistry:
    """
    Core registry for managing projects within the Oculus Dei system.
    
    This class handles the registration of new projects and analyzes their
    impact on existing commitments, goals, and time allocations.
    """
    
    def __init__(self):
        """Initialize an empty project registry."""
        self.projects: Dict[str, Project] = {}
        # In a real implementation, we'd load existing goals, tasks and schedule
        # from a persistence layer. For now, we'll simulate with empty collections
        self.goals = []
        self.tasks = []
        self.time_streams = []
    
    def register_project(self, project: Project) -> Dict:
        """
        Register a new project and analyze its impact on the existing system.
        
        Args:
            project: The Project object to register
            
        Returns:
            Dict containing impact analysis, reschedule requirements, and recommendations
        """
        # Store the project
        self.projects[project.name] = project
        
        # Perform impact analysis
        impact_analysis = self._analyze_impact(project)
        
        # Return change request
        return impact_analysis.dict()
    
    def _analyze_impact(self, project: Project) -> ProjectImpactAnalysis:
        """
        Analyze the impact of a new project on existing goals, tasks, and time allocations.
        
        Args:
            project: The Project object to analyze
            
        Returns:
            ProjectImpactAnalysis object with impact details
        """
        # This would contain complex logic in a complete implementation
        # For now, we'll return a simplified simulated analysis
        
        # Simulate some impacted entities
        impacted_entities = []
        
        # For demonstration, we'll create a simple analysis based on time demand
        # In a real system, this would analyze conflicts with existing commitments
        
        # Determine if reschedule is required based on priority and time demand
        reschedule_required = project.priority_level in [PriorityLevel.HIGH, PriorityLevel.CRITICAL]
        
        # Generate sample recommendations
        adjustments = []
        if reschedule_required:
            adjustments.append(
                PlanAdjustment(
                    adjustment_type="reschedule",
                    target_entity="daily_schedule",
                    adjustment_description=f"Allocate {project.time_demand} for '{project.name}'",
                    priority=8 if project.priority_level == PriorityLevel.CRITICAL else 6
                )
            )
        
        return ProjectImpactAnalysis(
            impact_analysis=impacted_entities,
            reschedule_required=reschedule_required,
            recommended_plan_adjustments=adjustments
        )
    
    def get_project(self, project_name: str) -> Optional[Project]:
        """
        Retrieve a project by name.
        
        Args:
            project_name: Name of the project to retrieve
            
        Returns:
            Project object if found, None otherwise
        """
        return self.projects.get(project_name)
    
    def list_projects(self) -> List[Project]:
        """
        List all registered projects.
        
        Returns:
            List of all Project objects
        """
        return list(self.projects.values())


# Example usage
if __name__ == "__main__":
    # Create a sample project
    sample_project = Project(
        name="Learn Machine Learning",
        description="Study machine learning fundamentals and complete a project",
        duration=Duration(value=3, unit="months"),
        priority_level=PriorityLevel.HIGH,
        category=ProjectCategory.EDUCATION,
        time_demand=TimeDemand(hours=2, frequency="per day")
    )
    
    # Initialize registry and register project
    registry = ProjectRegistry()
    impact = registry.register_project(sample_project)
    
    print(f"Project registered: {sample_project.name}")
    print(f"Total estimated hours: {sample_project.estimated_total_hours()}")
    print(f"Impact analysis: {impact}") 