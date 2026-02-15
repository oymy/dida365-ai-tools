import { loadToken } from "./token-store.js";
import type {
  Dida365Task,
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

const API_BASE_URL = "https://api.dida365.com/api/v2";

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

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const tokenData = await loadToken();
  if (!tokenData) {
    throw new Error(
      "Not authenticated. Run 'dida365 auth cookie <token>' first."
    );
  }

  if (!/^[a-fA-F0-9]+$/.test(tokenData.token)) {
    throw new Error("Invalid token format. Token must contain only hex characters.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: `t=${tokenData.token}`,
    ...PRIVATE_HEADERS,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);

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

// ---- User Settings ----

export async function getUserSettings(): Promise<UserSettings> {
  return apiRequest<UserSettings>("GET", "/user/preferences/settings");
}

// ---- Batch Sync ----

export async function batchCheck(): Promise<BatchCheckResponse> {
  return apiRequest<BatchCheckResponse>("GET", "/batch/check/0");
}

// ---- Completed Tasks ----

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
    `/project/all/completed?${queryParams}`
  );
}

// ---- Batch Task Operations ----

export async function batchTaskOperation(
  payload: BatchTaskPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/task", payload);
}

// ---- Task Parent (Subtask) ----

export async function batchSetTaskParent(
  items: TaskParentPayload[]
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/taskParent", items);
}

// ---- Task Move Between Projects ----

export async function batchMoveTask(
  items: TaskMovePayload[]
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/taskProject", items);
}

// ---- Batch Project Operations ----

export async function batchProjectOperation(
  payload: BatchProjectPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/project", payload);
}

// ---- Batch Project Group/Folder Operations ----

export async function batchProjectGroupOperation(
  payload: BatchProjectGroupPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/projectGroup", payload);
}

// ---- Batch Tag Operations ----

export async function batchTagOperation(
  payload: BatchTagPayload
): Promise<unknown> {
  return apiRequest<unknown>("POST", "/batch/tag", payload);
}

// ---- Tag Rename ----

export async function renameTag(
  oldName: string,
  newName: string
): Promise<unknown> {
  return apiRequest<unknown>("PUT", "/tag/rename", {
    name: oldName,
    newName,
  });
}

// ---- Tag Merge ----

export async function mergeTags(
  fromTag: string,
  toTag: string
): Promise<unknown> {
  return apiRequest<unknown>("PUT", "/tag/merge", {
    from: fromTag,
    to: toTag,
  });
}

// ---- Tag Delete ----

export async function deleteTags(tagNames: string[]): Promise<unknown> {
  const params = new URLSearchParams();
  tagNames.forEach((name) => params.append("name", name));

  return apiRequest<unknown>("DELETE", `/tag?${params}`);
}
