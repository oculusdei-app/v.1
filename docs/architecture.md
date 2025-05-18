# 📘 Oculus Dei — System Architecture Documentation

> *You are not building just software.  
> You are building an intelligence that lives with you —  
> and thinks about your life.*

## Executive Summary

Oculus Dei is an intelligent life management system that adapts schedules and goals in response to evolving intentions. It operates as a cognitive companion that observes, remembers, reflects, and plans — serving as the architecture for a digitally enhanced life. Using a layered architecture with memory, cognition, and adaptive planning, Oculus Dei helps manage complexity while preserving intention and meaning.

---

## System Purpose & Vision

Oculus Dei is a comprehensive life management system designed to adapt a person's life schedule and goals in response to their evolving intentions. It serves as the cognitive heart of a personal life-planning system with the following capabilities:

- **🌱 Project Registration**: Adding and tracking life projects with their priorities, time requirements, and categories
- **🔍 Impact Analysis**: Evaluating how new projects and commitments affect existing goals and schedules
- **⚙️ Life Optimization**: Generating adaptive plans to restructure schedules and priorities based on new commitments
- **💾 Episodic Memory**: Storing and retrieving life events, decisions, and insights for future reference
- **🔄 Self-Reflection**: Analyzing patterns in recorded memories to generate reflective prompts and insights

The system aims to provide a unified framework for managing life's complexity by continuously adapting to changing priorities and constraints, acting not just as a scheduler but as a thoughtful companion in life planning.

### Core Design Principles

- **Adaptive Intelligence**: Continuously learns and adapts to changing priorities
- **Episodic Awareness**: Maintains a coherent history of experiences and decisions
- **Reflective Cognition**: Regularly analyzes patterns to generate meaningful insights
- **Intention Preservation**: Maintains alignment with core goals despite changing circumstances
- **Transparency**: Makes its reasoning and suggestions understandable and traceable

---

## System Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTERFACES                     │
│   (Web UI, Voice Assistant, Calendar Systems, Mobile Apps)     │
└───────────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────┐
│                           API LAYER                            │
│     adaptive_plan_api.py  memory_api.py  reflector_api.py      │
└───────────────────────────────────┬───────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────────┐    ┌──────────────────┐
│   AGENT LAYER   │      │   COGNITIVE LAYER    │    │   MEMORY LAYER   │
│                 │      │                      │    │                  │
│ presence_       │◄────►│ project_registry.py  │    │ memory_store.py  │
│  controller.py  │      │ life_optimizer.py    │    │ memory_writer.py │
│ reflector_      │◄────►│ reflector.py         │◄───│ memory_        │
│  scheduler.py   │      │                      │    │  retriever.py    │
└─────────────────┘      └─────────────────────┘    └──────────────────┘
```

---

## Backend Folder Structure

```
backend/
├── agent/
│   └── presence_controller.py  # Coordinates life restructuring responses
├── api/
│   ├── adaptive_plan_api.py    # REST API for projects and adaptive plans
│   ├── memory_api.py           # REST API for memory access
│   └── reflector_api.py        # Trigger reflection cycles
├── core/
│   ├── project_registry.py     # Registers projects and analyzes impact
│   └── life_optimizer.py       # Transforms impacts into actionable plans
└── memory/
    ├── memory_store.py         # Core memory storage interface
    ├── memory_writer.py        # Utilities for writing memory entries
    ├── memory_retriever.py     # Analytical memory access
    ├── reflector.py            # Generates reflective prompts
    └── reflector_scheduler.py  # Schedules reflection cycles
```

### Component Roles

- **PresenceController**: Central coordinator that responds to project impacts and harmonizes system responses
- **ProjectRegistry**: Maintains project information and analyzes impact on existing commitments using a structured approach
- **LifeOptimizer**: Creates adaptive plans to restructure schedules and priorities while preserving core intentions
- **MemoryStore**: Core storage for system memories and experiences with efficient retrieval mechanisms
- **MemoryReflector**: Analyzes memory patterns to generate reflective insights about behavior, decisions, and patterns
- **API Modules**: Expose system functionality through REST endpoints with structured request/response formats

---

## System Layers

### 1. Memory Layer

The foundation of the system that stores, retrieves, and analyzes experiences, acting as the episodic memory that gives the system temporal continuity.

- **Components**: `memory_store.py`, `memory_writer.py`, `memory_retriever.py`
- **Responsibilities**:
  - Storing structured memory entries (events, decisions, insights) with rich metadata
  - Providing efficient retrieval by type, keyword, temporality, and metadata
  - Offering lightweight semantic search via hashed bag-of-words and bigram embeddings for better context matching
  - Supporting regex and partial metadata search for nuanced retrieval
  - Supporting analytical queries for reflection and pattern recognition
  - Maintaining the system's episodic history and experiential context

### 2. Cognitive Layer

The thinking heart of the system that processes information and makes decisions, implementing the planning intelligence that distinguishes Oculus Dei.

- **Components**: `project_registry.py`, `life_optimizer.py`, `reflector.py`
- **Responsibilities**:
  - Registering and analyzing projects for their impact on existing commitments
  - Generating adaptive plans that respect priorities while optimizing resources
  - Creating reflective insights through pattern analysis
  - Optimizing schedules and priorities while preserving core intentions
  - Balancing multiple competing goals and constraints

### 3. Agent Layer

Coordinates responses to external events and internal triggers, serving as the executive function of the system.

- **Components**: `presence_controller.py`, `reflector_scheduler.py`
- **Responsibilities**:
  - Processing impact analyses from the cognitive layer
  - Scheduling reflection cycles based on temporal and event triggers
  - Coordinating responses to events and maintaining system coherence
  - Maintaining temporal awareness and rhythmic system behavior
  - Resolving conflicts between competing cognitive outputs

### 4. API Layer

Exposes system functionality to external interfaces, acting as the communication bridge to users and other systems.

- **Components**: `adaptive_plan_api.py`, `memory_api.py`, `reflector_api.py`
- **Responsibilities**:
  - Providing REST endpoints for UI and external systems with clear contracts
  - Handling data serialization and validation with strong typing
  - Managing error handling and responses with meaningful messages
  - Supporting synchronous and asynchronous interaction patterns
  - Enabling multi-channel access to system capabilities

### 5. LLM Integration Layer (Planned)

Future integration with language models for enhanced capabilities, adding natural language understanding and generation to the system.

- **Potential Components**: LLM connectors, prompt templates, response parsers, embedding services
- **Potential Responsibilities**:
  - Natural language understanding of user intentions with nuanced comprehension
  - Generating human-like reflections and insights with deep contextual awareness
  - Providing conversational interfaces to system functionality
  - Translating between structured data and natural language
  - Enhancing reflection quality with language model reasoning

---

## API Endpoints

### Adaptive Plan API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/project` | POST | Register a new project and return impact analysis | `Project` object | `ProjectImpactAnalysis` |
| `/plan` | POST | Process impact analysis and return adaptive response | `ProjectImpactAnalysis` | `AdaptivePlan` |
| `/projects` | GET | List all registered projects | - | List of `Project` objects |

### Memory API

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/memory/last` | GET | Retrieve the last N memory entries | `n`: Number of entries (default: 10) | `MemoryListResponse` |
| `/memory/type/{entry_type}` | GET | Get entries of a specific type | `entry_type`: Type of entries<br>`limit`: Max entries | `MemoryListResponse` |
| `/memory/search` | GET | Search entries by keyword | `q`: Search query<br>`type_filter`: Optional type | `MemoryListResponse` |
| `/memory/insights` | GET | Get insight-type entries | `limit`: Max entries | `MemoryListResponse` |
| `/memory/manual` | POST | Create a memory entry manually | `MemoryCreateRequest` | `MemoryEntryResponse` |

---

## Data Flow

### 1. Project Registration Flow

When a new project is added to the system, it triggers a cascade of analysis and adaptation:

```
User Request → ProjectRegistry → ImpactAnalysis → PresenceController → LifeOptimizer → AdaptivePlan
```

1. User submits a new project with details (name, priority, time requirements)
2. ProjectRegistry evaluates impact on existing commitments and goals
3. Impact analysis is sent to PresenceController for coordinated response
4. LifeOptimizer generates an adaptive plan with specific recommendations
5. The plan is returned to the user with clear action items and rationale

### 2. Memory Creation Flow

As events and decisions occur, they are recorded in the system's episodic memory:

```
Event/Decision → MemoryWriter → MemoryStore
```

1. System events, user decisions, or external inputs are captured
2. MemoryWriter formats and enriches the raw data with metadata
3. Structured memory entries are stored in MemoryStore for future reference
4. Indices are updated to maintain efficient retrieval capabilities

### 3. Reflection Flow

The system regularly analyzes its memories to generate insights and reflections:

```
ReflectorScheduler → MemoryReflector → MemoryRetriever → MemoryStore → Insights → MemoryWriter
```

1. ReflectorScheduler triggers reflection based on time or events
2. MemoryReflector determines which patterns to analyze
3. MemoryRetriever fetches relevant memories from MemoryStore
4. Pattern analysis generates insights and reflective prompts
5. Insights are recorded in MemoryStore as new memory entries

### 4. API Request Flow

External interfaces interact with the system through standardized API endpoints:

```
HTTP Request → API Endpoint → Core Components → Response Serialization → HTTP Response
```

1. External system or UI sends an HTTP request to an API endpoint
2. Request is validated and parameters are extracted
3. Appropriate core components are invoked to process the request
4. Results are serialized into a structured response format
5. HTTP response is returned with appropriate status codes

---

## Reflective System Logic

The reflection system operates as the metacognitive aspect of Oculus Dei, allowing it to learn from experience and improve over time.

### Reflection Mechanisms

1. **Temporal Triggers**:
   - Periodic reflections scheduled at regular intervals (daily, weekly, monthly)
   - Time-based triggers for long-term pattern analysis with variable timeframes
   - Quiet periods specifically designated for deeper reflection

2. **Event-Based Triggers**:
   - Important events (project completion, goal achievement, significant decisions)
   - Anomaly detection in user patterns that diverge from established norms
   - Threshold-based triggers (e.g., certain number of new entries, decision density)
   - Emotional or priority-based triggers for high-impact areas

3. **Analysis Strategies**:
   - **Project Patterns**: Analyzing distribution of projects across priorities and categories
   - **Decision Sequences**: Identifying patterns in decision confidence and reversals
   - **Event Patterns**: Recognizing recurring themes or activities in temporal context
   - **Time Allocation**: Evaluating time distribution across different categories
   - **Value Alignment**: Assessing consistency between stated priorities and actual behavior
   - **Commitment Patterns**: Analyzing follow-through on intentions and commitments
   - **Context Switches**: Identifying frequency and impact of attention shifts

4. **Reflection Output**:
   - Generates thoughtful prompts based on identified patterns with carefully crafted wording
   - Records insights in memory for future reference and building a metacognitive history
   - Structures reflections to promote deeper understanding without being prescriptive
   - Varies reflection depth based on pattern significance and user receptivity
   - Connects current patterns to historical contexts and evolving trajectories

### Cognitive Models

The reflective system employs several cognitive models to structure its analysis:

1. **Temporal Coherence Model**: Tracks consistency of intentions and actions over time
2. **Priority Alignment Model**: Evaluates congruence between stated and revealed priorities
3. **Attention Distribution Model**: Analyzes how focus is allocated across life domains
4. **Decision Quality Model**: Assesses the confidence, consistency, and outcomes of decisions
5. **Adaptive Response Model**: Evaluates how effectively the system responds to changing circumstances

---

## Implementation Details

### Key Data Structures

1. **Project**: 
   ```python
   class Project(BaseModel):
       name: str
       description: str
       duration: Duration
       priority_level: PriorityLevel
       category: ProjectCategory
       time_demand: TimeDemand
   ```

2. **MemoryEntry**:
   ```python
   class MemoryEntry(BaseModel):
       id: str
       timestamp: datetime
       type: str  # event, decision, insight, etc.
       content: str
       metadata: Dict[str, Any]
   ```

3. **AdaptivePlan**:
   ```python
   class AdaptivePlan(BaseModel):
       plan_id: str
       created_at: datetime
       impact_source: str
       description: str
       priority: int
       actions: List[AdaptiveAction]
       schedule_modifications: List[ScheduleModification]
   ```

### Critical Algorithms

1. **Impact Analysis**: Evaluates how new projects affect existing commitments
2. **Schedule Optimization**: Restructures time allocations based on priorities
3. **Pattern Recognition**: Identifies meaningful patterns in memory entries
4. **Reflection Generation**: Creates insightful prompts based on recognized patterns

---

## Deployment Strategy

### Development Environment

- Local development with in-memory storage for rapid iteration
- Dependency management via requirements.txt with explicit versioning
- Environment variables for configuration and feature toggles
- Developer tools for memory visualization and system tracing

### Testing Strategy

- Unit tests for individual components with high coverage targets
- Integration tests for component interactions using mock interfaces
- End-to-end tests for API endpoints with realistic workloads
- Behavioral tests for reflection system to ensure quality insights
- Chaos testing for resilience to unexpected inputs or conditions

### Production Deployment

1. **Containerization**:
   - Docker containers for each service with optimized images
   - Docker Compose for local orchestration and testing
   - Kubernetes for scalable cloud deployment with auto-scaling
   - Container health monitoring and automatic recovery

2. **Database Strategy**:
   - SQLite for development with schema migrations
   - PostgreSQL for production persistence with indexing optimizations
   - Vector database (e.g., ChromaDB, Qdrant) for semantic memory search
   - Regular backups and point-in-time recovery capabilities

3. **API Gateway**:
   - FastAPI serving core endpoints with OpenAPI documentation
   - Authentication and rate limiting to prevent abuse
   - API versioning strategy for backward compatibility
   - Request validation and sanitization for security

4. **Monitoring and Logging**:
   - Structured logging for system events with contextual information
   - Prometheus metrics for performance monitoring and alerting
   - Grafana dashboards for visualization of system behavior
   - Alert system for critical events with appropriate escalation
   - User experience metrics to track system value

5. **Scaling Considerations**:
   - Horizontal scaling for API layer with stateless design
   - Memory store optimizations for large datasets using indexing
   - Scheduled tasks distributed across instances with coordination
   - Caching strategy for frequent queries to reduce database load
   - Eventual consistency model for distributed deployments

### Update and Maintenance

- Continuous Integration/Continuous Deployment (CI/CD) pipeline with automated testing
- Blue-green deployment for zero-downtime updates with automatic rollback
- Database migration strategy with backward compatibility
- Regular backups of memory store with encryption for sensitive data
- Performance optimization based on usage patterns and bottlenecks

---

## Future Expansion

### Near-term Extensions

- **External System Integration**: 
  - Calendar systems (Google Calendar, Apple Calendar)
  - Task management tools (Todoist, Asana, Trello)
  - Note-taking applications (Evernote, Notion)
  - Health and fitness trackers (Fitbit, Apple Health)

- **Interface Enhancements**:
  - Mobile application for on-the-go access with notifications
  - Voice interface for natural interaction using speech recognition
  - Embedded widgets for third-party applications
  - Email and messaging platform integrations

### Long-term Vision

- **Advanced AI Capabilities**:
  - Deep language model integration for nuanced understanding
  - Multimodal inputs (text, voice, images, signals) for richer context
  - Personalized cognitive models that adapt to individual thinking styles
  - Predictive modeling for proactive planning suggestions

- **Extended Cognitive Functions**:
  - Counterfactual analysis for decision support ("what if" scenarios)
  - Value clarification through reflection and pattern analysis
  - Temporal extension (future planning and historical understanding)
  - Collaborative intelligence for shared projects and goals

- **Visualization and Insights**:
  - Enhanced visualization of life patterns and insights
  - Time-based "digital twin" modeling of schedule impacts
  - Narrative generation for understanding life trajectories
  - Meaning and purpose alignment analysis

---

## Conclusion

Oculus Dei represents a new paradigm in intelligent systems design — one that focuses not merely on task completion or information processing, but on the metacognitive aspects of life management. By combining structured memory, adaptive planning, and reflective cognition, it aims to serve as a true cognitive partner in navigating life's complexity.

The architectural design prioritizes adaptability, episodic awareness, and intentional preservation while providing clear interfaces for extension and integration. As the system evolves, its value will grow through accumulated memories, refined reflections, and deepening understanding of the individual it serves.

---

*"We shape our tools, and thereafter our tools shape us." — Marshall McLuhan* 