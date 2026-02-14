export interface TokenData {
  token: string;
  saved_at: number;
}

// ---- Task ----

export interface Dida365Task {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  desc?: string;
  allDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeat?: string;
  repeatFrom?: string;
  repeatFlag?: string;
  priority?: number;
  status?: number;
  completedTime?: string;
  completedUserId?: number;
  sortOrder?: number;
  items?: SubTask[];
  tags?: string[];
  isFloating?: boolean;
  modifiedTime?: string;
  createdTime?: string;
  creator?: number;
  etag?: string;
  deleted?: number;
  kind?: string;
  parentId?: string;
}

export interface SubTask {
  id?: string;
  title: string;
  status?: number;
  completedTime?: string;
  sortOrder?: number;
}

// ---- Project ----

export interface Dida365Project {
  id: string;
  name: string;
  color?: string;
  sortOrder?: number;
  closed?: boolean;
  groupId?: string;
  viewMode?: string;
  permission?: string;
  kind?: string;
  modifiedTime?: string;
  etag?: string;
  isOwner?: boolean;
  inAll?: boolean;
}

export interface ProjectData {
  project: Dida365Project;
  tasks: Dida365Task[];
}

// ---- Project Group/Folder ----

export interface Dida365ProjectGroup {
  id?: string;
  name: string;
  sortOrder?: number;
  etag?: string;
  showAll?: boolean;
}

// ---- Tag ----

export interface Dida365Tag {
  name: string;
  label?: string;
  sortOrder?: number;
  sortType?: string;
  color?: string;
  etag?: string;
  parent?: string;
  rawName?: string;
}

// ---- User Settings ----

export interface UserSettings {
  timeZone?: string;
  startOfWeek?: number;
  dateFormat?: string;
  timeFormat?: string;
  weekStart?: number;
  theme?: string;
  [key: string]: unknown;
}

// ---- Batch Sync Response ----

export interface BatchCheckResponse {
  syncTaskBean?: {
    update?: Dida365Task[];
  };
  projectProfiles?: Dida365Project[];
  projectGroups?: Dida365ProjectGroup[];
  tags?: Dida365Tag[];
  inboxId?: string;
  [key: string]: unknown;
}

// ---- Batch Operation Payloads ----

export interface BatchTaskPayload {
  add?: Dida365Task[];
  update?: Dida365Task[];
  delete?: Array<{ taskId: string; projectId: string }>;
  addAttachments?: unknown[];
  updateAttachments?: unknown[];
  deleteAttachments?: unknown[];
}

export interface BatchProjectPayload {
  add?: Dida365Project[];
  update?: Dida365Project[];
  delete?: string[];
}

export interface BatchProjectGroupPayload {
  add?: Dida365ProjectGroup[];
  update?: Dida365ProjectGroup[];
  delete?: string[];
}

export interface BatchTagPayload {
  add?: Dida365Tag[];
  update?: Dida365Tag[];
  delete?: string[];
}

// ---- Task Move/Parent Payloads ----

export interface TaskMovePayload {
  taskId: string;
  fromProjectId: string;
  toProjectId: string;
}

export interface TaskParentPayload {
  taskId: string;
  parentId: string;
  projectId: string;
}

// ---- Completed Tasks Query ----

export interface CompletedTasksParams {
  from: string;  // Format: 'YYYY-MM-DD HH:mm:ss'
  to: string;    // Format: 'YYYY-MM-DD HH:mm:ss'
  limit?: number; // Default: 100, Max: 100
}
