<script setup>
import { ref, computed } from 'vue'

const node_name = ref('')
const message = ref('')
const loading = ref(false)
const deleting = ref(false)
const updatingAccessibility = ref(false)

const trimmed = computed(() => String(node_name.value || '').trim())
const valid = computed(() => trimmed.value.length > 0 && trimmed.value.length <= 100)

const submit = async () => {
  if (!valid.value) { message.value = 'Please enter a valid name (1-100 characters)'; return }
  loading.value = true
  try {
    const res = await $fetch('/api/node', {
      method: 'POST',
      body: { node_name: trimmed.value }
    })
    message.value = res.node_id ? `Created node ${res.node_id}` : 'Created node'
    node_name.value = ''
    await refreshNodes()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { loading.value = false }
}

const { data: locations, pending: pendingNodes, error: errorNodes, refresh: refreshNodes } = await useFetch('/api/node')
const { data: connections, pending: pendingConnections, error: errorConnections, refresh: refreshConnections } = await useFetch('/api/connection')

const nodeNameMap = computed(() => {
  const map = {}
  const list = locations?.value || []
  for (const node of list) {
    map[node.node_id] = node.node_name
  }
  return map
})

const nodeLabel = (nodeId) => {
  return nodeNameMap.value[nodeId] || 'Unknown node'
}

const deleteNode = async (node_id) => {
  if (!confirm(`Delete node ${node_id}? This cannot be undone.`)) return
  deleting.value = true
  try {
    await $fetch('/api/node', { method: 'DELETE', body: { node_id } })
    message.value = `Deleted node ${node_id}`
    await refreshNodes()
    await refreshConnections()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { deleting.value = false }
}

const deleteConnection = async (n1, n2) => {
  if (!confirm(`Delete connection ${n1} ↔ ${n2}?`)) return
  deleting.value = true
  try {
    await $fetch('/api/connection', { method: 'DELETE', body: { node_1: n1, node_2: n2 } })
    message.value = `Deleted connection ${n1}-${n2}`
    await refreshConnections()
    await refreshNodes()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { deleting.value = false }
}

const updateConnectionAccessibility = async (n1, n2, nextValue) => {
  updatingAccessibility.value = true
  try {
    await $fetch('/api/connection', {
      method: 'PATCH',
      body: { node_1: n1, node_2: n2, wheelchair_accessible: !!nextValue }
    })
    message.value = `Updated accessibility for ${n1}-${n2}`
    await refreshConnections()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { updatingAccessibility.value = false }
}

</script>

<template>


  <div>
    <AdminBackButton />
      <div>
    <h1>node management</h1>
  </div>
    <h1>Add Node</h1>
    <div>
      <label>Node name</label>
      <input v-model="node_name" placeholder="e.g. Entrance A" maxlength="100" />
      <small>{{ node_name.length }}/100</small>
    </div>
    <div>
      <button :disabled="loading || !valid" @click="submit">Create Node</button>
      <NuxtLink to="/admin/media">Assign media</NuxtLink>
    </div>
  </div>

  <div>
    <h2>Existing Nodes</h2>
    <div v-if="errorNodes">Error loading nodes.</div>
    <div v-else-if="pendingNodes">Loading…</div>
    <table v-else class="styled-table">
      <thead>
        <tr>
          <th>Node name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="loc in locations" :key="loc.node_id">
          <td>{{ loc.node_name }}</td>
          <td><button @click="deleteNode(loc.node_id)" :disabled="deleting">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div>
    <h2>Connections</h2>
    <div v-if="errorConnections">Error loading connections.</div>
    <div v-else-if="pendingConnections">Loading…</div>
    <table v-else class="styled-table">
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Wheelchair accessible</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in connections" :key="`${c.node_1}-${c.node_2}`">
          <td>{{ nodeLabel(c.node_1) }}</td>
          <td>{{ nodeLabel(c.node_2) }}</td>
          <td>
            <label>
              <input
                type="checkbox"
                :checked="!!c.wheelchair_accessible"
                :disabled="updatingAccessibility || deleting"
                @change="updateConnectionAccessibility(c.node_1, c.node_2, ($event.target).checked)"
              />
              wheelchair accessible
            </label>
          </td>
          <td><button @click="deleteConnection(c.node_1, c.node_2)" :disabled="deleting">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </div>

</template>