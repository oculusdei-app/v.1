"""
Presence Controller Module for Oculus Dei Life Management System

This module coordinates life restructuring based on project impact analysis.
It serves as the cognitive decision-making layer responsible for adapting
schedules and priorities in response to new project commitments.
"""

from typing import Dict, List, Optional
import logging
from datetime import datetime

# Import the ProjectImpactAnalysis model from the project registry
from backend.core.project_registry import ProjectImpactAnalysis, ImpactedEntity, PlanAdjustment

# Logger setup
logger = logging.getLogger(__name__)


class LifeOptimizerInterface:
    """
    Interface for the LifeOptimizer module.
    This is a placeholder until the actual LifeOptimizer is implemented.
    """
    
    def optimize_schedule(self, impact_analysis: ProjectImpactAnalysis) -> Dict:
        """
        Placeholder for schedule optimization logic.
        
        Args:
            impact_analysis: Analysis of project impact
            
        Returns:
            Dict containing optimization results
        """
        # In the actual implementation, this would contain complex optimization logic
        return {
            "status": "optimized",
            "message": "Schedule optimized successfully",
            "changes": []
        }
    
    def adjust_priorities(self, affected_entities: List[ImpactedEntity]) -> Dict:
        """
        Placeholder for priority adjustment logic.
        
        Args:
            affected_entities: List of entities affected by the project
            
        Returns:
            Dict containing priority adjustment results
        """
        # In the actual implementation, this would contain priority adjustment logic
        return {
            "status": "adjusted",
            "message": "Priorities adjusted successfully",
            "changes": []
        }


class PresenceController:
    """
    Core controller that processes project impact analysis and coordinates
    life restructuring through optimization and adjustment systems.
    
    This class serves as the cognitive decision-making layer that adapts
    a user's life schedule and priorities in response to new project commitments.
    """
    
    def __init__(self):
        """Initialize the Presence Controller."""
        self.life_optimizer = LifeOptimizerInterface()
        self.last_processed_impact = None
        self.last_processed_time = None
    
    def process_project_impact(self, impact: ProjectImpactAnalysis) -> Dict:
        """
        Process project impact analysis and coordinate life restructuring.
        
        This method receives a ProjectImpactAnalysis object, evaluates the 
        necessary adaptations to the user's life schedule and priorities,
        and delegates optimization tasks to the LifeOptimizer.
        
        Args:
            impact: ProjectImpactAnalysis object containing impact details
            
        Returns:
            Dict containing:
                - status: Success or failure status
                - restructuring_plan: Overview of changes to be made
                - optimization_results: Detailed results from optimization
                - priority_adjustments: Changes to priorities
                - timestamp: When processing occurred
        """
        logger.info("Processing project impact analysis")
        
        # Store this impact analysis for reference
        self.last_processed_impact = impact
        self.last_processed_time = datetime.now()
        
        # Check if reschedule is required
        if impact.reschedule_required:
            logger.info("Rescheduling required - invoking life optimizer")
            optimization_results = self.life_optimizer.optimize_schedule(impact)
        else:
            optimization_results = {
                "status": "unchanged",
                "message": "No schedule changes required"
            }
        
        # Process any impacted entities if they exist
        if impact.impact_analysis:
            logger.info(f"Processing {len(impact.impact_analysis)} impacted entities")
            priority_adjustments = self.life_optimizer.adjust_priorities(impact.impact_analysis)
        else:
            priority_adjustments = {
                "status": "unchanged",
                "message": "No priority adjustments required"
            }
        
        # Create restructuring plan from recommended adjustments
        restructuring_plan = self._create_restructuring_plan(impact.recommended_plan_adjustments)
        
        # Prepare and return response
        response = {
            "status": "success",
            "restructuring_plan": restructuring_plan,
            "optimization_results": optimization_results,
            "priority_adjustments": priority_adjustments,
            "timestamp": self.last_processed_time.isoformat()
        }
        
        return response
    
    def _create_restructuring_plan(self, recommended_adjustments: List[PlanAdjustment]) -> Dict:
        """
        Transform recommended adjustments into an actionable restructuring plan.
        
        Args:
            recommended_adjustments: List of PlanAdjustment objects
            
        Returns:
            Dict containing the restructuring plan
        """
        if not recommended_adjustments:
            return {
                "status": "unchanged",
                "message": "No restructuring required",
                "actions": []
            }
        
        # Sort adjustments by priority (highest first)
        sorted_adjustments = sorted(
            recommended_adjustments, 
            key=lambda adj: adj.priority,
            reverse=True
        )
        
        # Transform adjustments into actionable items
        actions = []
        for adjustment in sorted_adjustments:
            actions.append({
                "type": adjustment.adjustment_type,
                "target": adjustment.target_entity,
                "action": adjustment.adjustment_description,
                "priority": adjustment.priority
            })
        
        return {
            "status": "restructuring_needed",
            "message": f"{len(actions)} restructuring actions required",
            "actions": actions
        }
    
    def get_last_processed_impact(self) -> Optional[Dict]:
        """
        Return information about the last processed impact analysis.
        
        Returns:
            Dict containing last impact analysis details or None if none exists
        """
        if not self.last_processed_impact or not self.last_processed_time:
            return None
        
        return {
            "impact": self.last_processed_impact.dict(),
            "processed_at": self.last_processed_time.isoformat()
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
            )
        ]
    )
    
    # Process the impact
    controller = PresenceController()
    result = controller.process_project_impact(impact)
    
    print("Presence Controller Result:")
    print(result) 