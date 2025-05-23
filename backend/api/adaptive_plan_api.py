"""
Adaptive Plan API for Oculus Dei Life Management System

This module provides a REST API interface for registering new projects
and generating adaptive plans within the Oculus Dei system.
"""

from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime

# Import required components from the Oculus Dei system
from backend.core.project_registry import Project, ProjectRegistry, ProjectImpactAnalysis
from backend.agent.presence_controller import PresenceController
from backend.core.life_optimizer import AdaptivePlan, LifeOptimizer

# Create the FastAPI application
app = FastAPI(
    title="Oculus Dei API",
    description="Life restructuring engine API for the Oculus Dei system",
    version="0.1.0",
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize in-memory components
registry = ProjectRegistry()
presence_controller = PresenceController()
life_optimizer = LifeOptimizer()

# Replace PresenceController's LifeOptimizerInterface with actual LifeOptimizer
presence_controller.life_optimizer = life_optimizer

# 📌 new endpoint: register project and return impact
@app.post("/project", response_model=dict, tags=["Projects"])
def create_project(project: Project):
    """
    Register a new project and get its impact analysis.
    """
    return registry.register_project(project)

# API Models
class ProjectResponse(BaseModel):
    """API response for project registration"""
    project_name: str
    registered_at: str
    impact_analysis: Dict


class AdaptivePlanResponse(BaseModel):
    """API response for adaptive plan generation"""
    plan_id: str
    created_at: str
    impact_source: str
    description: str
    priority: int
    actions: List[Dict]
    schedule_modifications: List[Dict]
    confidence_score: float


@app.get("/")
async def root():
    """Root endpoint providing basic API information"""
    return {
        "name": "Oculus Dei Adaptive Plan API",
        "version": "0.1.0",
        "description": "Life restructuring engine API",
        "endpoints": ["/project", "/plan"]
    }


@app.post("/plan", response_model=AdaptivePlanResponse)
async def generate_adaptive_plan(impact: ProjectImpactAnalysis):
    """
    Generate an adaptive plan from a project impact analysis
    
    This endpoint accepts a ProjectImpactAnalysis object, processes it through
    the PresenceController, and returns the adaptive plan with specific actions
    and schedule modifications.
    
    Args:
        impact: ProjectImpactAnalysis object containing impact details
        
    Returns:
        AdaptivePlanResponse with the generated adaptive plan
    """
    try:
        # Process the impact analysis through the presence controller
        controller_response = presence_controller.process_project_impact(impact)
        
        # Extract the plan_id from the controller response
        plan_id = controller_response.get("optimization_results", {}).get("plan_id", f"plan-{uuid.uuid4()}")
        
        # Get the last generated plan from the life optimizer
        # In a real implementation, we would access the plan directly
        if life_optimizer.optimization_history:
            last_plan_id = life_optimizer.optimization_history[-1]["plan_id"]
            
            # For demonstration purposes, recreate the plan
            # In a real implementation, we would store and retrieve the actual plan
            adaptive_plan = life_optimizer.generate_adaptive_plan(impact)
            
            return AdaptivePlanResponse(
                plan_id=adaptive_plan.plan_id,
                created_at=adaptive_plan.created_at.isoformat(),
                impact_source=adaptive_plan.impact_source,
                description=adaptive_plan.description,
                priority=adaptive_plan.priority,
                actions=[action.dict() for action in adaptive_plan.actions],
                schedule_modifications=[mod.dict() for mod in adaptive_plan.schedule_modifications],
                confidence_score=adaptive_plan.confidence_score
            )
        else:
            # If no plan was generated, return an error
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No adaptive plan was generated"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate adaptive plan: {str(e)}"
        )


@app.get("/projects", response_model=List[Dict])
async def list_projects():
    """
    List all registered projects
    
    Returns:
        List of all registered projects
    """
    projects = registry.list_projects()
    return [
        {
            "name": project.name,
            "description": project.description,
            "priority_level": project.priority_level,
            "category": project.category,
            "duration": str(project.duration),
            "time_demand": str(project.time_demand),
            "estimated_hours": project.estimated_total_hours()
        }
        for project in projects
    ]


# Entry point for running the API server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 