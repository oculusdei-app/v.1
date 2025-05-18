from backend.core.project_registry import (
    Project,
    ProjectRegistry,
    Duration,
    TimeDemand,
    PriorityLevel,
    ProjectCategory,
)

def test_register_project():
    proj = Project(
        name="ML Bootcamp",
        description="Learn ML for 3 months",
        duration=Duration(value=3, unit="months"),
        priority_level=PriorityLevel.HIGH,
        category=ProjectCategory.EDUCATION,
        time_demand=TimeDemand(hours=2, frequency="per day"),
    )
    reg = ProjectRegistry()
    impact = reg.register_project(proj)
    assert impact["reschedule_required"] is True 