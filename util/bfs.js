export const graph = {

  A: {
    neighbors: [
      { to: "B", via: "corridor" },
      { to: "C", via: "lift" },
    ],
    accessible: true,
  },


  B: {
    neighbors: [
      { to: "D", via: "stairs" },
      { to: "E", via: "corridor" },
    ],
    accessible: true,
  },


  C: { neighbors: [{ to: "F", via: "corridor" }], accessible: false },


  D: { neighbors: [{ to: "G", via: "corridor" }], accessible: true },


  E: {
    neighbors: [
      { to: "F", via: "lift" },
      { to: "H", via: "corridor" },
    ],
    accessible: true,
  },


  F: { neighbors: [], accessible: true },


  G: { neighbors: [{ to: "H", via: "stairs" }], accessible: true },


  H: { neighbors: [{ to: "I", via: "corridor" }], accessible: true },


  I: { neighbors: [{ to: "J", via: "corridor" }], accessible: true },


  J: { neighbors: [{ to: "F", via: "corridor" }], accessible: true },


  K: { neighbors: [{ to: "H", via: "lift" }], accessible: true },
};

/**
 * @param {Object} graph
 * @param {String} start
 * @param {String} target
 * @param {Boolean} wheelchairMode,
 * @param {Boolean} usesLift,
 * @param {Boolean} usesStairs,
 */


// Main function.
export function bfsShortestPath(
  graph,
  start,
  target,
  wheelchairMode = false,
  usesLift = true,
  usesStairs = true,
) {
  if (!graph[start] || !graph[target]) return null;

  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];

    if (currentNode === target) return path;

    for (let neighborEdge of graph[currentNode].neighbors) {
      let neighborId;
      let via = "corridor";

      if (typeof neighborEdge === "string") {
        neighborId = neighborEdge;
      } else if (neighborEdge && typeof neighborEdge === "object") {
        neighborId =
          neighborEdge.to ?? neighborEdge.id ?? neighborEdge.name ?? neighborEdge.node;
        via = neighborEdge.via ?? neighborEdge.type ?? neighborEdge.mode ?? "corridor";
      } else {
        continue;
      }

      const nodeData = graph[neighborId];
      if (!nodeData) continue;

      if (wheelchairMode && !nodeData.accessible) {
        continue;
      }


      if (via === "stairs" && !usesStairs) {
        continue;
      }

      if (via === "lift" && !usesLift) {
        continue;
      }


      if (wheelchairMode && via === "stairs") {
        continue;
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([...path, neighborId]);
      }
    }
  }

  return null;
}