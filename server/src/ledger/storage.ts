import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { TASKS_DIR } from '../config';
import { WebPilotTask, TimelineEvent, EvidenceLedgerEntry, ReviewItem, TaskState } from '../types';

class StorageManager {
  private tasks: Map<string, WebPilotTask> = new Map();
  private sseClients: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    this.loadAllTasks();
  }

  private loadAllTasks() {
    try {
      if (!fs.existsSync(TASKS_DIR)) {
        fs.mkdirSync(TASKS_DIR, { recursive: true });
        return;
      }
      const files = fs.readdirSync(TASKS_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const raw = fs.readFileSync(path.join(TASKS_DIR, file), 'utf8');
            const task: WebPilotTask = JSON.parse(raw);
            this.tasks.set(task.id, task);
          } catch (e) {
            console.error(`Failed to parse task file ${file}:`, e);
          }
        }
      }
    } catch (err) {
      console.error('Error loading tasks from disk:', err);
    }
  }

  public saveTask(task: WebPilotTask): void {
    task.updatedAt = new Date().toISOString();
    this.tasks.set(task.id, task);
    try {
      const filePath = path.join(TASKS_DIR, `${task.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(task, null, 2), 'utf8');
    } catch (e) {
      console.error(`Error saving task ${task.id} to disk:`, e);
    }
    this.broadcast(task.id, { type: 'TASK_UPDATED', task });
  }

  public getTask(id: string): WebPilotTask | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(): WebPilotTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateTaskState(taskId: string, newState: TaskState, reason?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    const oldState = task.state;
    task.state = newState;
    if (reason) task.pauseReason = reason;

    this.addTimelineEvent(taskId, {
      type: newState === 'RECOVERING' ? 'RECOVERY' : newState === 'NEEDS_REVIEW' ? 'REVIEW' : 'INFO',
      status: newState === 'COMPLETED' ? 'verified' : newState === 'RECOVERING' ? 'recovered' : newState === 'FAILED' ? 'failed' : newState === 'NEEDS_REVIEW' ? 'needs_review' : 'info',
      message: `State changed: ${oldState} → ${newState}${reason ? ` (${reason})` : ''}`,
    });

    this.saveTask(task);
  }

  public addTimelineEvent(taskId: string, event: Omit<TimelineEvent, 'id' | 'taskId' | 'timestamp'>): TimelineEvent {
    const task = this.tasks.get(taskId);
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      taskId,
      timestamp: new Date().toISOString(),
      ...event,
    };
    if (task) {
      task.timeline.push(newEvent);
      this.saveTask(task);
    }
    this.broadcast(taskId, { type: 'TIMELINE_EVENT', event: newEvent });
    return newEvent;
  }

  public addEvidenceLedgerEntry(
    taskId: string,
    entry: Omit<EvidenceLedgerEntry, 'id' | 'taskId' | 'timestamp' | 'hash'>
  ): EvidenceLedgerEntry {
    const task = this.tasks.get(taskId);
    const timestamp = new Date().toISOString();
    const hashData = `${taskId}-${entry.action}-${entry.sourceUrl}-${entry.capturedText}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 16);

    const newEntry: EvidenceLedgerEntry = {
      id: crypto.randomUUID(),
      taskId,
      timestamp,
      hash,
      ...entry,
    };

    if (task) {
      task.ledger.push(newEntry);
      this.saveTask(task);
    }
    this.broadcast(taskId, { type: 'LEDGER_ENTRY', entry: newEntry });
    return newEntry;
  }

  public addReviewItem(taskId: string, item: Omit<ReviewItem, 'id' | 'taskId' | 'resolved'>): ReviewItem {
    const task = this.tasks.get(taskId);
    const newItem: ReviewItem = {
      id: crypto.randomUUID(),
      taskId,
      resolved: false,
      ...item,
    };

    if (task) {
      task.reviewQueue.push(newItem);
      this.saveTask(task);
    }
    this.broadcast(taskId, { type: 'REVIEW_ITEM_ADDED', reviewItem: newItem });
    return newItem;
  }

  public resolveReviewItem(
    taskId: string,
    itemId: string,
    resolutionType: ReviewItem['resolutionType'],
    resolutionValue?: string
  ): ReviewItem | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const item = task.reviewQueue.find((i) => i.id === itemId);
    if (!item) return null;

    item.resolved = true;
    item.resolutionType = resolutionType;
    item.resolutionValue = resolutionValue;
    item.resolvedAt = new Date().toISOString();

    // Update company research data if field was corrected or approved
    const company = task.companies.find((c) => c.companyName.toLowerCase() === item.companyName.toLowerCase());
    if (company && resolutionValue) {
      if (item.field === 'Pricing' || item.field === 'pricing') {
        company.pricing = resolutionValue;
      } else if (item.field === 'Product Description' || item.field === 'productDescription') {
        company.productDescription = resolutionValue;
      } else if (item.field === 'Target Users' || item.field === 'targetUsers') {
        company.targetUsers = resolutionValue;
      }
      company.notes += ` [Human resolved: ${resolutionType} -> ${resolutionValue}]`;
      if (company.verificationStatus === 'NEEDS_REVIEW') {
        company.verificationStatus = 'RECOVERED';
      }
      // remove from missingFields if present
      company.missingFields = company.missingFields.filter(f => f.toLowerCase() !== item.field.toLowerCase());
    }

    // Add to ledger
    this.addEvidenceLedgerEntry(taskId, {
      action: `Human Review Resolution: ${item.companyName} [${item.field}]`,
      companyName: item.companyName,
      sourceUrl: item.sourceUrl,
      capturedText: `Original: ${item.currentValue} -> Resolved: ${resolutionType} (${resolutionValue || 'N/A'})`,
      status: 'HUMAN_RESOLVED',
      recoveryAttempts: 0,
      humanDecisions: `Resolution: ${resolutionType}. Value: ${resolutionValue || 'N/A'}`,
    });

    this.addTimelineEvent(taskId, {
      type: 'APPROVAL',
      status: 'verified',
      companyName: item.companyName,
      message: `Human decision applied: ${item.companyName} - ${item.field} marked as ${resolutionType}`,
    });

    // Check if any other unresolved review items remain
    const unresolvedCount = task.reviewQueue.filter((i) => !i.resolved).length;
    if (unresolvedCount === 0 && task.state === 'NEEDS_REVIEW') {
      task.state = 'RUNNING';
      this.addTimelineEvent(taskId, {
        type: 'INFO',
        status: 'info',
        message: 'All review queue items resolved. Resuming task execution...',
      });
    }

    this.saveTask(task);
    return item;
  }

  // SSE Subscription Management
  public subscribe(taskId: string, clientCallback: (data: any) => void): () => void {
    const list = this.sseClients.get(taskId) || [];
    list.push(clientCallback);
    this.sseClients.set(taskId, list);

    return () => {
      const current = this.sseClients.get(taskId) || [];
      this.sseClients.set(
        taskId,
        current.filter((cb) => cb !== clientCallback)
      );
    };
  }

  public broadcast(taskId: string, data: any): void {
    const list = this.sseClients.get(taskId) || [];
    for (const cb of list) {
      try {
        cb(data);
      } catch (err) {
        console.error('SSE broadcast error:', err);
      }
    }
  }
}

export const storage = new StorageManager();
