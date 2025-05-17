"""
Reflector Scheduler Module for Oculus Dei Life Management System

This module schedules and runs reflection cycles using the MemoryReflector,
triggered either periodically or by specific events within the system.
"""

import threading
import time
from typing import Optional, Dict, List, Callable
from datetime import datetime, timedelta
import logging
import random

from backend.memory.reflector import MemoryReflector
from backend.memory.memory_writer import log_event, get_memory_store

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Singleton reflector instance
memory_reflector = MemoryReflector()

# Track the last reflection time
last_reflection_time = None

# Default minimum time between reflections (in hours)
DEFAULT_REFLECTION_INTERVAL = 6  # hours

# Store event handlers
event_handlers: Dict[str, List[Callable]] = {}


def run_reflection_cycle(force: bool = False) -> Optional[str]:
    """
    Run a reflection cycle using the MemoryReflector.
    
    This function checks if enough time has passed since the last reflection
    (unless forced), and then uses the MemoryReflector to analyze patterns
    and generate an appropriate reflection prompt.
    
    Args:
        force: If True, runs reflection regardless of timing constraints
        
    Returns:
        Optional[str]: A reflection prompt if one was generated, None otherwise
    """
    global last_reflection_time
    
    # Check if we should run reflection now
    if not force and not _should_run_reflection():
        logger.info("Skipping reflection cycle - too soon since last reflection")
        return None
    
    # Run the reflection analysis
    logger.info("Running reflection cycle...")
    reflection = memory_reflector.analyze_and_respond()
    
    # Update the last reflection time
    last_reflection_time = datetime.now()
    
    # Log the reflection activity
    if reflection:
        logger.info(f"Reflection generated: {reflection[:50]}...")
        
        # Log the reflection as an event
        log_event(
            "Reflection cycle completed",
            {
                "reflection_generated": True,
                "reflection_snippet": reflection[:100],
                "trigger_type": "forced" if force else "scheduled"
            }
        )
    else:
        logger.info("Reflection cycle completed, but no reflection was generated")
        
        # Log the event even when no reflection is generated
        log_event(
            "Reflection cycle completed",
            {
                "reflection_generated": False,
                "trigger_type": "forced" if force else "scheduled"
            }
        )
    
    return reflection


def schedule_periodic_reflections(interval_hours: float = DEFAULT_REFLECTION_INTERVAL,
                                 jitter_percent: float = 10.0):
    """
    Start a background thread that periodically runs reflection cycles.
    
    Args:
        interval_hours: Hours between reflection attempts
        jitter_percent: Random variation in interval (percent) to avoid predictability
    """
    def reflection_thread():
        logger.info(f"Starting periodic reflection scheduler (every ~{interval_hours} hours)")
        
        while True:
            # Run a reflection cycle
            run_reflection_cycle()
            
            # Calculate sleep time with jitter
            jitter_factor = 1.0 + random.uniform(-jitter_percent/100, jitter_percent/100)
            sleep_seconds = interval_hours * 3600 * jitter_factor
            
            logger.info(f"Next reflection in {sleep_seconds/3600:.2f} hours")
            time.sleep(sleep_seconds)
    
    # Start the scheduler in a daemon thread
    thread = threading.Thread(target=reflection_thread, daemon=True)
    thread.start()
    
    return thread


def run_reflection_on_event(event_type: str):
    """
    Decorator for registering event handlers that may trigger reflections.
    
    Use this decorator on functions that generate events which should
    potentially trigger a reflection cycle.
    
    Args:
        event_type: Type of event that might trigger reflection
    
    Returns:
        Decorator function
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Call the original function
            result = func(*args, **kwargs)
            
            # Register that this event occurred
            _handle_event(event_type)
            
            return result
        return wrapper
    
    return decorator


def register_event_handler(event_type: str, handler: Callable):
    """
    Register a handler function for a specific event type.
    
    Args:
        event_type: Type of event to handle
        handler: Function to call when event occurs
    """
    if event_type not in event_handlers:
        event_handlers[event_type] = []
    
    event_handlers[event_type].append(handler)


def _handle_event(event_type: str):
    """
    Handle an event, potentially triggering a reflection.
    
    Args:
        event_type: Type of event that occurred
    """
    logger.info(f"Event occurred: {event_type}")
    
    # Call registered handlers for this event type
    handlers = event_handlers.get(event_type, [])
    for handler in handlers:
        try:
            handler(event_type)
        except Exception as e:
            logger.error(f"Error in event handler: {str(e)}")
    
    # Certain important events may trigger immediate reflection
    important_events = ["project_completed", "goal_achieved", "major_decision", "crisis_point"]
    
    if event_type in important_events:
        logger.info(f"Important event {event_type} triggering reflection cycle")
        return run_reflection_cycle(force=True)
    
    return None


def _should_run_reflection() -> bool:
    """
    Determine if enough time has passed to run another reflection.
    
    Returns:
        bool: True if reflection should run, False otherwise
    """
    # If we've never reflected, we should run
    if last_reflection_time is None:
        return True
    
    # Check time since last reflection
    time_since_last = datetime.now() - last_reflection_time
    hours_since_last = time_since_last.total_seconds() / 3600
    
    # Respect minimum interval
    if hours_since_last < DEFAULT_REFLECTION_INTERVAL:
        return False
    
    # Additional heuristics could be added here, like:
    # - Only reflect if there are new entries since last reflection
    # - Reflect more often during active periods
    # - Reflect less often during quiet periods
    
    # For now, just use a random factor to occasionally skip even when interval has passed
    memory_store = get_memory_store()
    entry_count = len(memory_store.entries)
    
    # More entries = higher chance of reflection
    reflection_chance = min(0.8, 0.2 + (entry_count / 100))
    
    return random.random() < reflection_chance


# Example usage
if __name__ == "__main__":
    import time
    
    # Create a function that will be triggered by events
    @run_reflection_on_event("user_input")
    def process_user_input(input_text):
        print(f"Processing input: {input_text}")
        # [... processing logic ...]
        return f"Processed: {input_text}"
    
    # Register a custom handler for project completion
    def on_project_completed(event_type):
        print(f"Project completed! Running special analysis...")
        # [... special analysis logic ...]
    
    register_event_handler("project_completed", on_project_completed)
    
    # Example of scheduling periodic reflections
    scheduler_thread = schedule_periodic_reflections(interval_hours=0.05)  # 3 minutes for demo
    
    # Example of various ways to trigger reflections
    print("\nExample 1: Forced reflection")
    reflection1 = run_reflection_cycle(force=True)
    print(f"Reflection result: {reflection1}")
    
    time.sleep(2)
    
    print("\nExample 2: Event-triggered reflection")
    process_user_input("I need to reorganize my project priorities")
    
    time.sleep(2)
    
    print("\nExample 3: Important event with automatic reflection")
    _handle_event("project_completed")
    
    # Wait to see the periodic reflection trigger
    print("\nWaiting for scheduled reflection...")
    time.sleep(5)
    
    print("\nExiting demo")
    # In a real application, we would not explicitly exit as the daemon thread
    # would be part of a larger application loop 