const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

export const api = {
  async login(username, password) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },
  async list(path, token) {
    const res = await fetch(`${BASE}/${path}`, { headers: headers(token) });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  },
  async create(path, payload, token) {
    const res = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  },
  async update(path, id, payload, token) {
    const res = await fetch(`${BASE}/${path}/${id}`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  },
  async remove(path, id, token) {
    const res = await fetch(`${BASE}/${path}/${id}`, {
      method: 'DELETE',
      headers: headers(token)
    });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  }
};
