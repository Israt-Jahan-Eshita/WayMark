// API utility functions to communicate with the FastAPI backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function runAudit(buildingName: string, location: string, files: File[], reuseLast: boolean = false) {
  const formData = new FormData();
  formData.append("building_name", buildingName);
  if (location) {
    formData.append("location", location);
  }
  formData.append("reuse_last", reuseLast ? "true" : "false");
  
  if (!reuseLast) {
    files.forEach(file => {
      formData.append("files", file);
    });
  }

  const res = await fetch(`${API_BASE_URL}/audit`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to run audit: ${res.statusText}`);
  }

  return res.json();
}

export async function getAudit(id: string) {
  const res = await fetch(`${API_BASE_URL}/audit/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch audit ${id}`);
  }
  return res.json();
}

export async function listBuildings() {
  const res = await fetch(`${API_BASE_URL}/buildings`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error("Failed to fetch buildings");
  }
  return res.json();
}

export async function getBuildingHistory(id: string) {
  const res = await fetch(`${API_BASE_URL}/buildings/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch history for building ${id}`);
  }
  return res.json();
}
