// Will be built dynamically asp.
export function createGraph(nodes, connections) {
    if (!Array.isArray(nodes) || !Array.isArray(connections)) {
        return {};
    }

    // init graph.
    const graph = {};

    // Puts nodes into graph by their ID and gives them a neighbor list.
    nodes.forEach(node => {
        const nodeId = String(node.node_id).trim();
        graph[nodeId] = {
            id: nodeId,
            name: node.node_name,
            neighbors: []
        };
    });

    connections.forEach(connection => {
        const node1 = String(connection.node_1).trim();
        const node2 = String(connection.node_2).trim();
        const inaccessible = Boolean(connection.is_wheelchair_inaccessible);

        if (!graph[node1] || !graph[node2]) return;

        graph[node1].neighbors.push({
            id: node2,
            inaccessible
        });

        graph[node2].neighbors.push({
            id: node1,
            inaccessible
        });
    });

    return graph;
}