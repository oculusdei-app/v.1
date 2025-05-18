import axios from 'axios';

/** Base Axios instance for the memory service */
const memoryApi = axios.create({
  baseURL: import.meta.env.VITE_MEMORY_API_URL || 'http://localhost:8001'
});

/** Base Axios instance for the planning/project service */
const projectApi = axios.create({
  baseURL: import.meta.env.VITE_PLAN_API_URL || 'http://localhost:8000'
});

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: string;
  type?: string;
}

export interface GoalEntry {
  id: string;
  content: string;
  timestamp: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
}

export interface InsightEntry {
  id: string;
  content: string;
  timestamp: string;
}

/** Retrieve the most recent goals */
export async function fetchGoals(limit = 5): Promise<GoalEntry[]> {
  const res = await memoryApi.get(`/memory/type/goal?limit=${limit}`);
  return res.data?.entries || [];
}

/** Retrieve the latest memory entries */
export async function fetchMemoryFeed(n = 20): Promise<MemoryEntry[]> {
  const res = await memoryApi.get(`/memory/last?n=${n}`);
  return res.data?.entries || [];
}

/** Retrieve recent insights/reflections */
export async function fetchInsights(): Promise<InsightEntry[]> {
  const res = await memoryApi.get('/memory/insights');
  return res.data?.entries || [];
}

/** Fetch active projects */
export async function fetchProjects(): Promise<ProjectEntry[]> {
  const res = await projectApi.get('/projects');
  return res.data || [];
}

interface AssistantPayload {
  message: string;
  mode: string;
}

/** Send a message to the assistant */
export async function sendAssistantMessage(
  payload: AssistantPayload
): Promise<{ response: string }> {
  const res = await axios.post('/proxy/ai', payload);
  return res.data;
}
