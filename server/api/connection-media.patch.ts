import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event)
    const { connection_node_1, connection_node_2, media_id, order_num } = body || {}
    const hasContentDesc = Object.prototype.hasOwnProperty.call(body, 'content_desc')
    const content_desc = body?.content_desc

    if (typeof connection_node_1 !== 'number' || typeof connection_node_2 !== 'number' || typeof media_id !== 'number') {
      throw createError({ statusCode: 400, statusMessage: 'connection_node_1, connection_node_2 and media_id must be numeric IDs' })
    }

    if (hasContentDesc && content_desc !== null && typeof content_desc !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'content_desc must be a string or null' })
    }

    if (order_num !== undefined && order_num !== null && typeof order_num !== 'number') {
      throw createError({ statusCode: 400, statusMessage: 'order_num must be a number or null' })
    }

    // verify the connection_media entry exists
    const [rows]: any = await pool.query(
      'SELECT 1 FROM navigation_system.connection_media WHERE connection_node_1 = ? AND connection_node_2 = ? AND media_id = ? LIMIT 1',
      [connection_node_1, connection_node_2, media_id]
    )
    if (!rows || rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Connection media not found' })
    }

    const fields: string[] = []
    const params: any[] = []
    if (hasContentDesc) {
      fields.push('content_desc = ?')
      params.push(content_desc)
    }
    if (order_num !== undefined) {
      fields.push('order_num = ?')
      params.push(order_num)
    }

    if (fields.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No updatable fields provided' })
    }

    params.push(connection_node_1, connection_node_2, media_id)

    const sql = `UPDATE navigation_system.connection_media SET ${fields.join(', ')} WHERE connection_node_1 = ? AND connection_node_2 = ? AND media_id = ? LIMIT 1`
    const [result]: any = await pool.query(sql, params)
    const affected = result?.affectedRows || 0
    if (affected === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to update connection media' })
    }

    return { success: true }
  } catch (err: any) {
    const msg = String(err?.message || err)
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
})
