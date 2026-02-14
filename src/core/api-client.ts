import { loadToken } from "./token-store.js";
import type {
  Dida365Task,
  Dida365Project,
  Dida365Tag,
  Dida365ProjectGroup,
  ProjectData,
  CompletedTasksParams,
  BatchCheckResponse,
  BatchTaskPayload,
  BatchProjectPayload,
  BatchProjectGroupPayload,
  BatchTagPayload,
  TaskMovePayload,
  TaskParentPayload,
  UserSettings,
} from "./types.js";
import { randomBytes } from "crypto";

// Official Open API
const OPEN_API_BASE_URL = "https://api.dida365.com";

// Private API (v2) - Unofficial, may change without notice
const PRIVATE_API_BASE_URL = "https://api.dida365.com/api/v2";

// Private API Headers (mimicking web client)
const PRIVATE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:95.0) Gecko/20100101 Firefox/95.0",
  "x-device": JSON.stringify({
    platform: "web",
    os: "OS X",
    device: "Firefox 95.0",
    name: "dida365-ai-tools",
    version: 4531,
    id: "6490" + randomBytes(10).toString("hex"),
    channel: "website",
    campaign: "",
    websocket: "",
  }),
};

async function getAuthHeader(): Promise<string> {
  const token = await loadToken();
  if (!token) {
    throw new Error(
      "Not authenticated. Please run the dida365_auth tool first."
    );
  }
  return `Bearer ${token.access_token}`;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  usePrivateAPI: boolean = false
): Promise<T> {
  const authorization = await getAuthHeader();
  const baseUrl = usePrivateAPI ? PRIVATE_API_BASE_URL : OPEN_API_BASE_URL;

  const headers: Record<string, string> = {
    Authorization: authorization,
    "Content-Type": "application/json",
  };

  // Add private API headers if needed
  if (usePrivateAPI) {
    Object.assign(headers, PRIVATE_HEADERS);
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, options);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Dida365 API error ${response.status} ${method} ${path}: ${errorBody}`
    );
  }

  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ============================================================
// Official Open API
// ============================================================

// ---- Project APIs (Open) ----

export async function listProjects(): Promise<Dida365Project[]> {
  return apiRequest<Dida365Project[]>("GET", "/open/v1/project");
}

export async function getProjectData(
  projectId: string
): Promise<ProjectData> {
  return apiRequest<ProjectData>(
    "GET",
    `/open/v1/project/${projectId}/data`
  );
}

// ---- Task APIs (Open) ----

export async function getTask(
  projectId: string,
  taskId: string
): Promise<Dida365Task> {
  return apiRequest<Dida365Task>(
    "GET",
    `/open/v1/project/${projectId}/task/${taskId}`
  );
}

export async function createTask(
  task: Partial<Dida365Task> & { title: string; projectId: string }
): Promise<Dida365Task> {
  return apiRequest<Dida365Task>("POST", "/open/v1/task", task);
}

export async function updateTask(
  taskId: string,
  task: Partial<Dida365Task> & { id: string; projectId: string }
): Promise<Dida365Task> {
  return apiRequest<Dida365Task>("POST", `/open/v1/task/${taskId}`, task);
}

export async function completeTask(
  projectId: string,
  taskId: string
): Promise<void> {
  await apiRequest<void>(
    "POST",
    `/open/v1/project/${projectId}/task/${taskId}/complete`
  );
}

export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  await apiRequest<void>(
    "DELETE",
    `/open/v1/project/${projectId}/task/${taskId}`
  );
}

// ============================================================
// Private API (v2) - Unofficial, may change without notice
// ============================================================

// ---- 1. User Settings ----
// GET /user/preferences/settings

export async function getUserSettings(): Promise<UserSettings> {
  return apiRequest<UserSettings>(
    "GET",
    "/user/preferences/settings",
    undefined,
    true
  );
}

// ---- 2. Batch Sync ----
// GET /batch/check/0 - Full sync of all data

export async function batchCheck(): Promise<BatchCheckResponse> {
  return apiRequest<BatchCheckResponse>(
    "GET",
    "/batch/check/0",
    undefined,
    true
  );
}

// ---- 3. Completed Tasks ----
// GET /project/all/completed

export async function getCompletedTasks(
  params: CompletedTasksParams
): Promise<Dida365Task[]> {
  const queryParams = new URLSearchParams({
    from: params.from,
    to: params.to,
    limit: (params.limit || 100).toString(),
  });

  return apiRequest<Dida365Task[]>(
    "GET",
    `/project/all/completed?${queryParams}`,
    undefined,
    true
  );
}

// ---- 4. Batch Task Operations ----
// POST /batch/task

export async function batchTaskOperation(
  payload: BatchTaskPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/task", payload, true);
}

// ---- 5. Task Parent (Subtask) ----
// POST /batch/taskParent

export async function batchSetTaskParent(
  items: TaskParentPayload[]
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/taskParent", items, true);
}

// ---- 6. Task Move Between Projects ----
// POST /batch/taskProject

export async function batchMoveTask(
  items: TaskMovePayload[]
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/taskProject", items, true);
}

// ---- 7. Batch Project Operations ----
// POST /batch/project

export async function batchProjectOperation(
  payload: BatchProjectPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/project", payload, true);
}

// ---- 8. Batch Project Group/Folder Operations ----
// POST /batch/projectGroup

export async function batchProjectGroupOperation(
  payload: BatchProjectGroupPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/projectGroup", payload, true);
}

// ---- 9. Batch Tag Operations ----
// POST /batch/tag

export async function batchTagOperation(
  payload: BatchTagPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/tag", payload, true);
}

// ---- 10. Tag Rename ----
// PUT /tag/rename

export async function renameTag(
  oldName: string,
  newName: string
): Promise<unknown> {
  return apiRequest<unknown>(
    "PUT",
    "/tag/rename",
    { name: oldName, newName },
    true
  );
}

// ---- 11. Tag Merge ----
// PUT /tag/merge

export async function mergeTags(
  fromTag: string,
  toTag: string
): Promise<unknown> {
  return apiRequest<unknown>(
    "PUT",
    "/tag/merge",
    { from: fromTag, to: toTag },
    true
  );
}

// ---- 12. Tag Delete ----
// DELETE /tag

export async function deleteTags(tagNames: string[]): Promise<unknown> {
  // The API expects tag names as query params: /tag?name=tag1&name=tag2
  const params = new URLSearchParams();
  tagNames.forEach((name) => params.append("name", name));

  return apiRequest<unknown>(
    "DELETE",
    `/tag?${params}`,
    undefined,
    true
  );
}
