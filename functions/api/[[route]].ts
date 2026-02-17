import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type Bindings = {
    DB: D1Database;
    BUCKET: R2Bucket;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// Helper to get S3 Client
const getS3Client = (env: Bindings) => {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
    });
};

// Middleware for error handling
app.onError((err, c) => {
    console.error(`${err}`);
    return c.text('Internal Server Error', 500);
});

// Hello World
app.get('/', (c) => {
    return c.json({ message: 'Folder Management API Ready' });
});

// Create Folder
app.post('/folders', async (c) => {
    try {
        const { name, user_id, cohort_id } = await c.req.json();
        const id = crypto.randomUUID();

        await c.env.DB.prepare(
            'INSERT INTO folders (id, user_id, cohort_id, name) VALUES (?, ?, ?, ?)'
        ).bind(id, user_id, cohort_id, name).run();

        return c.json({ id, name, user_id, cohort_id });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Get Upload URL for a file
app.post('/folders/:id/files', async (c) => {
    const folderId = c.req.param('id');
    try {
        const { name, size, type } = await c.req.json();
        const fileId = crypto.randomUUID();
        const key = `${folderId}/${fileId}/${name}`;

        // 1. Insert file record into D1
        await c.env.DB.prepare(
            'INSERT INTO files (id, folder_id, r2_key, name, size, type) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(fileId, folderId, key, name, size, type).run();

        // 2. Generate Upload URL
        let uploadUrl = '';

        if (c.env.R2_ACCESS_KEY_ID && c.env.R2_SECRET_ACCESS_KEY) {
            const s3 = getS3Client(c.env);
            const command = new PutObjectCommand({
                Bucket: c.env.R2_BUCKET_NAME || 'lecture-app-files',
                Key: key,
                ContentType: type,
            });
            uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        } else if (c.env.BUCKET) {
            // Use Proxy
            uploadUrl = `/api/proxy/upload?key=${encodeURIComponent(key)}`;
        } else {
            // Fallback
            uploadUrl = `/api/mock-upload?key=${encodeURIComponent(key)}`;
        }

        return c.json({ uploadUrl, key, fileId });
    } catch (e) {
        // console.log(e);
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Mock Upload (for local dev)
app.put('/mock-upload', async (c) => {
    const key = c.req.query('key');
    if (!key) return c.text('Missing key', 400);

    // Consume body to avoid errors
    await c.req.arrayBuffer();

    return c.json({ message: 'Uploaded to mock (simulated)' });
});

// Create or Get User (Registration)
app.post('/users', async (c) => {
    try {
        const { name, email } = await c.req.json();

        // Check if user exists
        const { results } = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();

        if (results && results.length > 0) {
            return c.json(results[0]);
        }

        // Create new user
        const id = crypto.randomUUID();
        const role = 'participant'; // Default role

        await c.env.DB.prepare(
            'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)'
        ).bind(id, name, email, role).run();

        return c.json({ id, name, email, role });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Users List (Admin/Debug)
app.get('/users', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM users').all();
        return c.json(results);
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// List Folders (e.g. for user_id=u1)
app.get('/folders', async (c) => {
    const userId = c.req.query('user_id');
    try {
        let query = 'SELECT * FROM folders';
        const params: string[] = [];

        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY created_at DESC';

        const { results } = await c.env.DB.prepare(query).bind(...params).all();
        return c.json(results);
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// List Files in Folder
app.get('/folders/:id/files', async (c) => {
    const folderId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC'
        ).bind(folderId).all();
        return c.json(results);
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Create Evaluation
app.post('/evaluations', async (c) => {
    try {
        const { folder_id, instructor_id, comments, score, attachment_key, attachment_name } = await c.req.json();
        const id = crypto.randomUUID();

        await c.env.DB.prepare(
            'INSERT INTO evaluations (id, folder_id, instructor_id, comments, score, attachment_key, attachment_name) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, folder_id, instructor_id, comments, score, attachment_key, attachment_name).run();

        return c.json({ id, folder_id, instructor_id, comments, score, attachment_key, attachment_name });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Get Upload URL for Feedback Attachment
app.post('/evaluations/upload-url', async (c) => {
    try {
        const { name, type } = await c.req.json();
        const fileId = crypto.randomUUID();
        const key = `feedback/${fileId}/${name}`;

        let uploadUrl = '';
        if (c.env.R2_ACCESS_KEY_ID && c.env.R2_SECRET_ACCESS_KEY) {
            const s3 = getS3Client(c.env);
            const command = new PutObjectCommand({
                Bucket: c.env.R2_BUCKET_NAME || 'lecture-app-files',
                Key: key,
                ContentType: type,
            });
            uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        } else if (c.env.BUCKET) {
            uploadUrl = `/api/proxy/upload?key=${encodeURIComponent(key)}`;
        } else {
            uploadUrl = `/api/mock-upload?key=${encodeURIComponent(key)}`;
        }

        return c.json({ uploadUrl, key });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Download File (Get Presigned URL)
app.get('/files/:id/download', async (c) => {
    const fileId = c.req.param('id');
    try {
        // 1. Get file metadata from DB
        const { results } = await c.env.DB.prepare('SELECT * FROM files WHERE id = ?').bind(fileId).all();

        if (!results || results.length === 0) {
            return c.json({ error: 'File not found' }, 404);
        }

        const file = results[0] as any;
        const key = file.r2_key;

        // 2. Generate URL
        let downloadUrl = '';
        if (c.env.R2_ACCESS_KEY_ID && c.env.R2_SECRET_ACCESS_KEY) {
            const { GetObjectCommand } = await import('@aws-sdk/client-s3');
            const s3 = getS3Client(c.env);
            const command = new GetObjectCommand({
                Bucket: c.env.R2_BUCKET_NAME || 'lecture-app-files',
                Key: key,
                ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`
            });
            downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        } else if (c.env.BUCKET) {
            downloadUrl = `/api/proxy/download?key=${encodeURIComponent(key)}&name=${encodeURIComponent(file.name)}`;
        } else {
            downloadUrl = `/api/mock-download?key=${encodeURIComponent(key)}`;
        }

        return c.json({ downloadUrl });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Download Feedback Attachment (Get Presigned URL)
// Since attachments aren't in the 'files' table, we need a separate way or just a generic 'download by key' endpoint.
// Let's make a generic 'download-by-key' endpoint strictly for authenticated users, but simpler for MVP:
// We can just expose a generic `GET /files/download?key=...` if we verify access.
// For now, let's add a specific one for evaluations or just use the key directly if we implemented a generic download.

// Better approach for MVP: Generic download endpoint that takes a 'key' and 'name'
app.get('/download', async (c) => {
    const key = c.req.query('key');
    const name = c.req.query('name');
    if (!key) return c.json({ error: 'Missing key' }, 400);

    try {
        let downloadUrl = '';
        if (c.env.R2_ACCESS_KEY_ID && c.env.R2_SECRET_ACCESS_KEY) {
            const { GetObjectCommand } = await import('@aws-sdk/client-s3');
            const s3 = getS3Client(c.env);
            const command = new GetObjectCommand({
                Bucket: c.env.R2_BUCKET_NAME || 'lecture-app-files',
                Key: key,
                ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name || 'download')}`
            });
            downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        } else if (c.env.BUCKET) {
            downloadUrl = `/api/proxy/download?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name || 'download')}`;
        } else {
            downloadUrl = `/api/mock-download?key=${encodeURIComponent(key)}`;
        }
        return c.json({ downloadUrl });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});


// Proxy Upload (using R2 binding)
app.put('/proxy/upload', async (c) => {
    const key = c.req.query('key');
    const type = c.req.header('content-type');
    if (!key) return c.text('Missing key', 400);
    if (!c.env.BUCKET) return c.text('R2 Bucket binding not found', 500);

    try {
        const body = c.req.raw.body;
        if (!body) return c.text('No body', 400);

        await c.env.BUCKET.put(key, body, {
            httpMetadata: {
                contentType: type,
            }
        });
        return c.json({ message: 'Uploaded via proxy' });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Proxy Download (using R2 binding)
app.get('/proxy/download', async (c) => {
    const key = c.req.query('key');
    const name = c.req.query('name'); // Optional, for content-disposition
    if (!key) return c.text('Missing key', 400);
    if (!c.env.BUCKET) return c.text('R2 Bucket binding not found', 500);

    try {
        const object = await c.env.BUCKET.get(key);
        if (!object) return c.text('File not found', 404);

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);

        if (name) {
            // Encode filename for compatibility
            const encodedName = encodeURIComponent(name);
            headers.set('Content-Disposition', `inline; filename*=UTF-8''${encodedName}`);
        }

        return new Response(object.body, {
            headers,
        });
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Mock Download (fallback)
app.get('/mock-download', (c) => {
    return c.text('This is a simulated file content for local development.');
});


// Get Evaluations for a folder
app.get('/folders/:id/evaluations', async (c) => {
    const folderId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM evaluations WHERE folder_id = ? ORDER BY created_at DESC'
        ).bind(folderId).all();
        return c.json(results);
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

// Instructor Auth
app.post('/auth/instructor', async (c) => {
    try {
        const { password } = await c.req.json();
        const INSTRUCTOR_PASSWORD = 'instructor123'; // Hardcoded for MVP

        if (password === INSTRUCTOR_PASSWORD) {
            return c.json({ success: true });
        } else {
            return c.json({ success: false, error: 'Invalid password' }, 401);
        }
    } catch (e) {
        return c.json({ error: (e as Error).message }, 500);
    }
});

export const onRequest = handle(app);
