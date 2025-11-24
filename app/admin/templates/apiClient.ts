export async function fetchTemplates() {
  const res = await fetch("/api/admin/request-templates");

  return res.json();
}

export async function createTemplateApi(payload: any) {
  const res = await fetch("/api/admin/request-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function updateTemplateApi(id: string, payload: any) {
  const res = await fetch(`/api/admin/request-templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function deleteTemplateApi(id: string) {
  const res = await fetch(`/api/admin/request-templates/${id}`, {
    method: "DELETE",
  });

  return res.json();
}
