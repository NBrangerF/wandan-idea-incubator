
import { LogicMap, Operation, ProjectNode, ProjectEdge, NodeUI, EdgeUI } from './types';

const defaultNodeUI: NodeUI = {
  fog: 'none',
  risk: 'low',
  flags: [],
  skill_chips: [],
  rank: 0,
  lane: 'L1',
  order: 0
};

const defaultEdgeUI: EdgeUI = {
  state: 'normal'
};

export function applyOperations(currentMap: LogicMap, ops: Operation[]): LogicMap {
  let nodes = [...currentMap.nodes];
  let edges = [...currentMap.edges];

  if (!ops || !Array.isArray(ops)) {
    return currentMap;
  }

  ops.forEach(op => {
    switch (op.op) {
      case 'upsert_node':
        if (op.node) {
          const index = nodes.findIndex(n => n.id === op.node?.id);
          if (index > -1) {
            const existing = nodes[index];
            nodes[index] = { 
              ...existing, 
              ...op.node, 
              ui: { ...defaultNodeUI, ...existing.ui, ...(op.node.ui || {}) } 
            };
          } else {
            nodes.push({
              ...op.node,
              ui: { ...defaultNodeUI, ...(op.node.ui || {}) }
            } as ProjectNode);
          }
        }
        break;

      case 'upsert_edge':
        if (op.edge) {
          const edgeId = op.edge.id || `${op.edge.from}_${op.edge.relation_type}_${op.edge.to}`;
          const index = edges.findIndex(e => e.id === edgeId);
          if (index > -1) {
            const existing = edges[index];
            edges[index] = { 
              ...existing, 
              ...op.edge, 
              id: edgeId,
              ui: { ...defaultEdgeUI, ...existing.ui, ...(op.edge.ui || {}) } 
            };
          } else {
            edges.push({
              ...op.edge,
              id: edgeId,
              ui: { ...defaultEdgeUI, ...(op.edge.ui || {}) }
            } as ProjectEdge);
          }
        }
        break;

      case 'set_node_ui':
        if (op.id && op.ui) {
          nodes = nodes.map(n => n.id === op.id ? { ...n, ui: { ...n.ui, ...op.ui } } : n);
        }
        break;

      case 'set_edge_ui':
        if (op.id && op.ui) {
          edges = edges.map(e => e.id === op.id ? { ...e, ui: { ...e.ui, ...op.ui } } : e);
        }
        break;

      case 'stress_card':
        if (op.payload?.node) {
          nodes = nodes.map(n => n.id === op.payload.node ? { ...n, ui: { ...n.ui, risk: 'high' } } : n);
        }
        if (op.payload?.broken_node) {
          nodes = nodes.map(n => n.id === op.payload.broken_node ? { ...n, ui: { ...n.ui, risk: 'high' } } : n);
        }
        break;

      case 'writeback':
        if (op.payload?.node_id) {
          nodes = nodes.map(n => n.id === op.payload.node_id ? { ...n, ui: { ...n.ui, fog: 'none', risk: 'low', badge: 'verified' } } : n);
        }
        break;
      
      case 'clear_temp_ui':
        nodes = nodes.map(n => ({ ...n, ui: { ...n.ui, flags: [] } }));
        break;
    }
  });

  return { nodes, edges };
}
