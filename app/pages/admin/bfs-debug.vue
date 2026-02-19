<template>
  <div style="padding: 20px">
    <h2>Graph</h2>
    <p>
      {{ formattedGraph }}
    </p>

    <div>
      <label>Start Node:</label>
      <input v-model="startNode" />
    </div>

    <div>
      <label>Target Node:</label>
      <input v-model="targetNode" />
    </div>

    <div style="margin-top: 10px">
      <input type="checkbox" v-model="inaccessible" />
      <label>Wheelchair User</label>
    </div>

    <button style="margin-top: 10px" @click="runBFS">Find Shortest Path</button>

    <div v-if="shortestPath" style="margin-top: 20px">
      <strong>Shortest Path:</strong>
      {{ shortestPath.join(" -> ") }}
    </div>

    <div v-else-if="searched" style="color: red">No valid path found.</div>
  </div>

  <div>
    <hr />
    <p>
      Here is where you will be able to create some nodes for debugging
      purposes.
    </p>
  </div>
</template>

<script>
import { bfsShortestPath } from "@/../util/bfs";
import { createGraph } from "@/../util/graph";

export default {
  data() {
    return {
      graph: {},
      nodes: [],
      connections: [],
      startNode: "",
      targetNode: "",
      inaccessible: false,
      shortestPath: null,
      searched: false,
    };
  },

  async mounted() {
    try {
      this.nodes = await $fetch("/api/node");
      this.connections = await $fetch("/api/connection");
      this.graph = createGraph(this.nodes, this.connections);
    } catch (e) {
      this.nodes = [];
      this.connections = [];
      this.graph = {};
    }
  },

  computed: {
    formattedGraph() {
      return JSON.stringify(this.graph, null, 2);
    },
  },

  methods: {
    runBFS() {
      this.graph = createGraph(this.nodes, this.connections);
      this.shortestPath = bfsShortestPath(
        this.graph,
        this.startNode.trim(),
        this.targetNode.trim(),
        this.inaccessible,
      );

      this.searched = true;
    },
  },
};
</script>
