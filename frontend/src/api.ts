import axios from 'axios';

/** Base Axios instance for the memory service */
const memoryApi = axios.create({ baseURL: 'http://localhost:8001' });

/** Base Axios instance for the planning/project service */
const projectApi = axios.create({ baseURL: 'http://localhost:8000' });

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
  try {
    const res = await memoryApi.get(`/memory/type/goal?limit=${limit}`);
    return res.data?.entries || [];
  } catch (err) {
    console.error('fetchGoals error', err);
    throw new Error('Failed to fetch goals');
  }
}

/** Retrieve the latest memory entries */
export async function fetchMemoryFeed(n = 20): Promise<MemoryEntry[]> {
  try {
    const res = await memoryApi.get(`/memory/last?n=${n}`);
    return res.data?.entries || [];
  } catch (err) {
    console.error('fetchMemoryFeed error', err);
    throw new Error('Failed to fetch memory feed');
  }
}

/** Retrieve recent insights/reflections */
export async function fetchInsights(): Promise<InsightEntry[]> {
  try {
    const res = await memoryApi.get('/memory/insights');
    return res.data?.entries || [];
  } catch (err) {
    console.error('fetchInsights error', err);
    throw new Error('Failed to fetch insights');
  }
}

/** Fetch active projects */
export async function fetchProjects(): Promise<ProjectEntry[]> {
  try {
    const res = await projectApi.get('/projects');
    return res.data || [];
  } catch (err) {
    console.error('fetchProjects error', err);
    throw new Error('Failed to fetch projects');
  }
}

interface AssistantPayload {
  message: string;
  mode: string;
}

/** Send a message to the assistant */
export async function sendAssistantMessage(
  payload: AssistantPayload
): Promise<{ response: string }> {
  try {
    const res = await axios.post('/proxy/ai', payload);
    return res.data;
  } catch (err) {
    console.error('sendAssistantMessage error', err);
    throw new Error('Failed to send message');
  }
}
