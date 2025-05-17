"""
Life Optimizer Module for Oculus Dei Life Management System

This module transforms ProjectImpactAnalysis into actionable adaptive plans
for restructuring schedules, priorities, and commitments in response to 
new projects and changing demands.
"""

from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
from pydantic import BaseModel, Field

# Import the ProjectImpactAnalysis model from the project registry
from backend.core.project_registry import (
    ProjectImpactAnalysis, 
    ImpactedEntity, 
    PlanAdjustment
)


class ActionType(str, Enum):
    """Types of actions in an adaptive plan"""
    RESCHEDULE = "reschedule"
    REDUCE_SCOPE = "reduce_scope"
    DELEGATE = "delegate"
    CANCEL = "cancel"
    REFRAME = "reframe"
    MERGE = "merge"
    SPLIT = "split"
    RESEQUENCE = "resequence"


class TimeAllocation(BaseModel):
    """Represents a time block allocation in a schedule"""
    start_time: datetime
    duration_minutes: int
    activity: str
    priority: int
    is_flexible: bool = False
    
    @property
    def end_time(self) -> datetime:
        """Calculate the end time based on start time and duration"""
        return self.start_time + timedelta(minutes=self.duration_minutes)


class AdaptiveAction(BaseModel):
    """A specific action to adapt the current life plan"""
    action_type: ActionType
    target_entity: str
    description: str
    priority: int
    original_state: Optional[Dict] = None
    new_state: Optional[Dict] = None
    estimated_efficiency_gain: float = 0.0  # 0.0 to 1.0
    context: Optional[str] = None


class ScheduleModification(BaseModel):
    """A specific modification to a schedule"""
    day: str  # e.g., "monday", "tuesday", etc.
    removed_allocations: List[TimeAllocation] = []
    added_allocations: List[TimeAllocation] = []
    modified_allocations: List[Dict] = []  # {original: TimeAllocation, new: TimeAllocation}


class AdaptivePlan(BaseModel):
    """
    Comprehensive adaptive plan for restructuring life schedule and priorities
    in response to a new project or changing demands.
    """
    plan_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    impact_source: str  # Project or change that triggered this plan
    description: str
    priority: int
    actions: List[AdaptiveAction] = []
    schedule_modifications: List[ScheduleModification] = []
    estimated_adaptation_effort: float  # Hours required to implement changes
    confidence_score: float = Field(..., ge=0.0, le=1.0)  # 0.0 to 1.0
    
    def total_actions(self) -> int:
        """Return the total number of actions in the plan"""
        return len(self.actions)
    
    def high_priority_actions(self) -> List[AdaptiveAction]:
        """Return only high priority actions (priority >= 7)"""
        return [action for action in self.actions if action.priority >= 7]
    
    def to_dict(self) -> Dict:
        """Convert the adaptive plan to a dictionary representation"""
        return {
            "plan_id": self.plan_id,
            "created_at": self.created_at.isoformat(),
            "impact_source": self.impact_source,
            "description": self.description,
            "priority": self.priority,
            "actions": [action.dict() for action in self.actions],
            "schedule_modifications": [mod.dict() for mod in self.schedule_modifications],
            "estimated_adaptation_effort": self.estimated_adaptation_effort,
            "confidence_score": self.confidence_score,
            "total_actions": self.total_actions(),
            "high_priority_actions_count": len(self.high_priority_actions())
        }


class LifeOptimizer:
    """
    Core optimizer that transforms impact analyses into actionable adaptive plans.
    
    This class analyzes the impact of new projects and generates optimized,
    actionable plans for restructuring schedules, priorities, and commitments.
    """
    
    def __init__(self):
        """Initialize the Life Optimizer."""
        self.current_schedule = {}  # Placeholder for user's current schedule
        self.current_priorities = {}  # Placeholder for user's current priorities
        self.optimization_history = []
        self.plan_counter = 0
    
    def generate_adaptive_plan(self, impact: ProjectImpactAnalysis) -> AdaptivePlan:
        """
        Transform a ProjectImpactAnalysis into an actionable AdaptivePlan.
        
        This method analyzes the impact of a new project on the current life structure
        and generates an optimized plan for restructuring schedules, priorities, and
        commitments to accommodate the new project efficiently.
        
        Args:
            impact: ProjectImpactAnalysis object containing impact details
            
        Returns:
            AdaptivePlan with specific actions and schedule modifications
        """
        self.plan_counter += 1
        plan_id = f"plan-{self.plan_counter}-{datetime.now().strftime('%Y%m%d%H%M')}"
        
        # Initialize adaptive actions from recommended adjustments
        adaptive_actions = self._generate_adaptive_actions(impact.recommended_plan_adjustments)
        
        # Generate schedule modifications based on impact analysis
        schedule_modifications = self._generate_schedule_modifications(impact)
        
        # Calculate estimated effort and confidence score
        estimated_effort = self._calculate_adaptation_effort(adaptive_actions, schedule_modifications)
        confidence_score = self._calculate_confidence_score(impact, adaptive_actions)
        
        # Create and return the adaptive plan
        plan = AdaptivePlan(
            plan_id=plan_id,
            impact_source=self._determine_impact_source(impact),
            description=self._generate_plan_description(impact),
            priority=self._determine_plan_priority(impact),
            actions=adaptive_actions,
            schedule_modifications=schedule_modifications,
            estimated_adaptation_effort=estimated_effort,
            confidence_score=confidence_score
        )
        
        # Store in optimization history
        self.optimization_history.append({
            "plan_id": plan.plan_id,
            "created_at": plan.created_at,
            "impact_source": plan.impact_source
        })
        
        return plan
    
    def _generate_adaptive_actions(self, recommended_adjustments: List[PlanAdjustment]) -> List[AdaptiveAction]:
        """
        Transform recommended adjustments into concrete adaptive actions.
        
        Args:
            recommended_adjustments: List of PlanAdjustment objects
            
        Returns:
            List of AdaptiveAction objects
        """
        adaptive_actions = []
        
        for adjustment in recommended_adjustments:
            # Map adjustment type to action type
            try:
                action_type = ActionType(adjustment.adjustment_type)
            except ValueError:
                # Default to reschedule if not a recognized action type
                action_type = ActionType.RESCHEDULE
            
            # Create adaptive action
            action = AdaptiveAction(
                action_type=action_type,
                target_entity=adjustment.target_entity,
                description=adjustment.adjustment_description,
                priority=adjustment.priority,
                estimated_efficiency_gain=0.7,  # Placeholder value
                context="Generated from impact analysis"
            )
            
            adaptive_actions.append(action)
        
        return adaptive_actions
    
    def _generate_schedule_modifications(self, impact: ProjectImpactAnalysis) -> List[ScheduleModification]:
        """
        Generate specific schedule modifications based on impact analysis.
        
        Args:
            impact: ProjectImpactAnalysis object
            
        Returns:
            List of ScheduleModification objects
        """
        # This would contain complex logic to modify schedules based on impact
        # For demonstration, we'll create simplified example modifications
        
        # Placeholder: In a real implementation, this would analyze user's actual schedule
        # and generate appropriate modifications
        
        modifications = []
        
        # Create a sample modification (as a placeholder)
        if impact.reschedule_required:
            # Example: add a simple modification to move things in a weekly schedule
            mod = ScheduleModification(
                day="monday",
                removed_allocations=[],
                added_allocations=[
                    TimeAllocation(
                        start_time=datetime.now().replace(hour=14, minute=0),
                        duration_minutes=120,
                        activity="New project work",
                        priority=8,
                        is_flexible=False
                    )
                ]
            )
            modifications.append(mod)
        
        return modifications
    
    def _calculate_adaptation_effort(self, 
                                    actions: List[AdaptiveAction], 
                                    modifications: List[ScheduleModification]) -> float:
        """
        Calculate the estimated effort required to implement the adaptive plan.
        
        Args:
            actions: List of AdaptiveAction objects
            modifications: List of ScheduleModification objects
            
        Returns:
            Estimated effort in hours
        """
        # This would contain logic to calculate effort based on:
        # - Number and complexity of actions
        # - Extent of schedule modifications
        # - User's adaptability profile
        
        # For demonstration, using a simple heuristic
        action_effort = len(actions) * 0.5  # 30 minutes per action
        
        modification_effort = 0
        for mod in modifications:
            modification_effort += len(mod.added_allocations) * 0.25
            modification_effort += len(mod.removed_allocations) * 0.1
            modification_effort += len(mod.modified_allocations) * 0.3
        
        return action_effort + modification_effort
    
    def _calculate_confidence_score(self, 
                                   impact: ProjectImpactAnalysis, 
                                   actions: List[AdaptiveAction]) -> float:
        """
        Calculate confidence score for the adaptive plan.
        
        Args:
            impact: ProjectImpactAnalysis object
            actions: List of AdaptiveAction objects
            
        Returns:
            Confidence score from 0.0 to 1.0
        """
        # For demonstration, using a simple heuristic
        # In a real implementation, this would use more sophisticated analysis
        
        # Base confidence
        confidence = 0.7
        
        # Adjust based on actions
        if len(actions) > 5:
            confidence -= 0.1  # More actions mean more complexity and less confidence
            
        # Adjust based on impact
        if len(impact.impact_analysis) > 3:
            confidence -= 0.1  # More impacted entities mean more complexity
            
        return max(0.1, min(confidence, 1.0))  # Ensure between 0.1 and 1.0
    
    def _determine_impact_source(self, impact: ProjectImpactAnalysis) -> str:
        """
        Determine the source of impact from the impact analysis.
        
        Args:
            impact: ProjectImpactAnalysis object
            
        Returns:
            String describing the impact source
        """
        # This would extract the relevant information from the impact analysis
        # For demonstration, we'll use a placeholder
        return "New project integration"
    
    def _generate_plan_description(self, impact: ProjectImpactAnalysis) -> str:
        """
        Generate a descriptive summary of the adaptive plan.
        
        Args:
            impact: ProjectImpactAnalysis object
            
        Returns:
            Description string
        """
        # For demonstration, using a simple template
        if impact.reschedule_required:
            return "Restructuring plan to accommodate schedule changes for new commitments"
        else:
            return "Adjustment plan for optimizing priorities with minimal schedule impact"
    
    def _determine_plan_priority(self, impact: ProjectImpactAnalysis) -> int:
        """
        Determine the overall priority of the adaptive plan.
        
        Args:
            impact: ProjectImpactAnalysis object
            
        Returns:
            Priority value from 1-10
        """
        # For demonstration, using a simple heuristic
        if impact.reschedule_required:
            return 8  # High priority if reschedule required
        elif impact.impact_analysis:
            return 6  # Medium priority if there are impacted entities
        else:
            return 4  # Lower priority for minor adjustments
    
    def optimize_schedule(self, impact_analysis: ProjectImpactAnalysis) -> Dict:
        """
        Optimize schedule based on impact analysis.
        
        This method is compatible with the interface used in PresenceController.
        
        Args:
            impact_analysis: Analysis of project impact
            
        Returns:
            Dict containing optimization results
        """
        # Generate adaptive plan
        plan = self.generate_adaptive_plan(impact_analysis)
        
        # Return results in the format expected by PresenceController
        return {
            "status": "optimized",
            "message": f"Schedule optimized with {plan.total_actions()} actions",
            "plan_id": plan.plan_id,
            "changes": [mod.dict() for mod in plan.schedule_modifications],
            "confidence_score": plan.confidence_score
        }
    
    def adjust_priorities(self, affected_entities: List[ImpactedEntity]) -> Dict:
        """
        Adjust priorities based on impacted entities.
        
        This method is compatible with the interface used in PresenceController.
        
        Args:
            affected_entities: List of entities affected by the project
            
        Returns:
            Dict containing priority adjustment results
        """
        # This would contain logic to adjust priorities based on impacted entities
        adjusted_entities = []
        
        for entity in affected_entities:
            # In a real implementation, this would make intelligent adjustments
            adjusted_entities.append({
                "entity_id": entity.entity_id,
                "entity_name": entity.entity_name,
                "original_priority": "unknown",  # Would come from current state
                "new_priority": "adjusted based on impact",
                "adjustment_reason": f"Impact level: {entity.impact_level}"
            })
        
        return {
            "status": "adjusted",
            "message": f"Adjusted priorities for {len(adjusted_entities)} entities",
            "changes": adjusted_entities
        }


# Example usage
if __name__ == "__main__":
    # This would typically come from the project_registry module
    # Creating a minimal example for demonstration
    from backend.core.project_registry import (
        ProjectImpactAnalysis,
        ImpactedEntity,
        PlanAdjustment
    )
    
    # Sample impact analysis
    impact = ProjectImpactAnalysis(
        impact_analysis=[
            ImpactedEntity(
                entity_type="task",
                entity_id="task-123",
                entity_name="Weekly reporting",
                impact_level=0.7,
                impact_description="Will need to be rescheduled"
            )
        ],
        reschedule_required=True,
        recommended_plan_adjustments=[
            PlanAdjustment(
                adjustment_type="reschedule",
                target_entity="daily_schedule",
                adjustment_description="Move weekly reporting to Thursday",
                priority=7
            ),
            PlanAdjustment(
                adjustment_type="reduce_scope",
                target_entity="personal_project",
                adjustment_description="Reduce time allocated to personal project",
                priority=5
            )
        ]
    )
    
    # Generate adaptive plan
    optimizer = LifeOptimizer()
    adaptive_plan = optimizer.generate_adaptive_plan(impact)
    
    print("Adaptive Plan Generated:")
    print(f"Plan ID: {adaptive_plan.plan_id}")
    print(f"Description: {adaptive_plan.description}")
    print(f"Total Actions: {adaptive_plan.total_actions()}")
    print(f"Confidence Score: {adaptive_plan.confidence_score}")
    print("\nOptimization Results:")
    print(optimizer.optimize_schedule(impact)) 