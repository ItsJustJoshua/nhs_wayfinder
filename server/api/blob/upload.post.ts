import { put } from '@vercel/blob'
import { getQuery, createError } from 'h3'
import path from 'path'

// Max upload size (in bytes). Configurable via env BLOB_MAX_BYTES or defaults to 50MB
const MAX_BYTES = Number(process.env.BLOB_MAX_BYTES || 50 * 1024 * 1024)

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as Record<string, string>
    const rawFilename = q.filename || q.name || null
    if (!rawFilename) throw createError({ statusCode: 400, statusMessage: 'filename query parameter is required' })

    // Sanitize filename to basename and safe characters only
    let filename = path.basename(String(rawFilename))
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    if (!filename) throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })

    // Validate extension against allowed list
    const ext = (path.extname(filename).slice(1) || '').toLowerCase()
    const allowed = ['jpg','jpeg','png','gif','bmp','webp','svg','mp4','webm','ogg','mov','mkv']
    if (!allowed.includes(ext)) {
      throw createError({ statusCode: 400, statusMessage: `Files with extension .${ext || '(none)'} are not allowed` })
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    // If no blob token is provided (local dev), fallback to saving into public/media
    if (!token) {
      // ensure we have a Buffer to write
      let buf: Buffer
      if (Buffer.isBuffer(bodyToSend)) {
        buf = bodyToSend as Buffer
      } else {
        // bodyToSend might be a stream (req) or other; read into buffer
        const chunks: Buffer[] = []
        for await (const chunk of bodyToSend as any) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        }
        buf = Buffer.concat(chunks)
      }

      // ensure public/media exists
      const fs = await import('fs')
      const fspath = await import('path')
      const mediaDir = fspath.join(process.cwd(), 'public', 'media')
      try { fs.mkdirSync(mediaDir, { recursive: true }) } catch (_) {}

      // generate safe filename and avoid collisions
      let outName = filename
      let outPath = fspath.join(mediaDir, outName)
      if (fs.existsSync(outPath)) {
        const parsed = fspath.parse(outName)
        outName = `${parsed.name}-${Date.now()}${parsed.ext}`
        outPath = fspath.join(mediaDir, outName)
      }

      fs.writeFileSync(outPath, buf)

      const publicUrl = `/media/${outName}`
      return { url: publicUrl, publicURL: publicUrl }
    }

    // Enforce size limits: prefer Content-Length header, otherwise stream and buffer up to MAX_BYTES
    const req: any = event.node.req
    const contentLength = Number(req.headers?.['content-length'] || 0)
    let bodyToSend: any = req
    if (contentLength && contentLength > MAX_BYTES) {
      throw createError({ statusCode: 413, statusMessage: `Upload exceeds maximum allowed size of ${MAX_BYTES} bytes` })
    }

    if (!contentLength || contentLength === 0) {
      const chunks: Buffer[] = []
      let received = 0
      for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        received += buf.length
        if (received > MAX_BYTES) {
          throw createError({ statusCode: 413, statusMessage: `Upload exceeds maximum allowed size of ${MAX_BYTES} bytes` })
        }
        chunks.push(buf)
      }
      bodyToSend = Buffer.concat(chunks)
    }

    // try put with original filename, if conflict then generate unique filename and retry      
    try {
      const blob = await put(filename, bodyToSend as any, { access: 'public', token, addRandomSuffix: true })
      return blob
    } catch (err: any) {
      const msg = String(err?.message || err || '')
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('blob already exists')) {
        // generate a unique filename server-side and retry, this can be edited via the rename option in the client.
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`
        const blob2 = await put(unique, bodyToSend as any, { access: 'public', token })
        return blob2
      }
      throw err
    }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
