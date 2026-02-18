# Supabase Integration Guide

## 1. Setup Environment
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... (your service_role secret)
```

> **WARNING**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client-side code. It grants full admin access.

## 2. Database Setup
Run the SQL from `supabase/schema.sql` in your Supabase project's SQL Editor to create tables.

## 3. Frontend Usage Examples
Since we're using Next.js API routes as a proxy, you can fetch data just like any standard REST API.

### Fetch Tasks
```tsx
const [tasks, setTasks] = useState([]);

useEffect(() => {
  fetch('/api/tasks')
    .then(res => res.json())
    .then(data => setTasks(data));
}, []);
```

### Create Task
```tsx
async function createTask(newTask) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  });
  const created = await res.json();
  console.log('Created:', created);
}
```

### Update Task Status
```tsx
async function updateStatus(id, status) {
  await fetch('/api/tasks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
}
```

### Delete Task
```tsx
async function deleteTask(id) {
  await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
}
```

## 4. Deployment (Vercel)
1. Push code to GitHub.
2. Import project in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel Project Settings > Environment Variables.
4. Deploy!
