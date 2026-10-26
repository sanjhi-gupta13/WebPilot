import { WebPilotTask, TaskSettings, PlanStep, ReviewResolutionType } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  async getSettings(): Promise<{ settings: TaskSettings; services: any }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<TaskSettings>): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async createTask(prompt: string): Promise<{ success: boolean; task: WebPilotTask; targetCompanies: any[] }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async getTasks(): Promise<WebPilotTask[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    return data.tasks || [];
  },

  async getTask(id: string): Promise<WebPilotTask> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) throw new Error('Failed to fetch task');
    const data = await res.json();
    return data.task;
  },

  async updatePlan(taskId: string, plan: PlanStep[]): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) throw new Error('Failed to update plan');
    return res.json();
  },

  async approvePlan(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/approve-plan`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to approve plan');
    return res.json();
  },

  async startTask(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/start`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to start task');
    return res.json();
  },

  async pauseTask(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/pause`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to pause task');
    return res.json();
  },

  async takeOverTask(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/takeover`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to take over task');
    return res.json();
  },

  async resumeTask(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/resume`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to resume task');
    return res.json();
  },

  async cancelTask(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to cancel task');
    return res.json();
  },

  async resolveReviewItem(
    taskId: string,
    itemId: string,
    resolutionType: ReviewResolutionType,
    resolutionValue?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/review/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionType, resolutionValue }),
    });
    if (!res.ok) throw new Error('Failed to resolve review item');
    return res.json();
  },

  async reVerifyTask(taskId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/verify`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to re-verify task');
    return res.json();
  },

  async sendVoiceCommand(transcript: string, taskId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, taskId }),
    });
    if (!res.ok) throw new Error('Failed to process voice command');
    return res.json();
  },

  getStreamUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/stream`;
  },

  getDownloadExcelUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/download/excel`;
  },

  getDownloadLaunchKitUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/download/launchkit`;
  },

  getDownloadEvidenceUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/download/evidence`;
  },
};
