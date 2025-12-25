
import React, { useMemo, useEffect, useRef } from 'react';
import ReactFlow, { 
  MarkerType,
  useReactFlow,
} from 'reactflow';
import NodeCard from './NodeCard';
import EdgeRenderer from './EdgeRenderer';
import { useStage3Store } from '../store';

const nodeTypes = {
  nodeCard: NodeCard,
};

const edgeTypes = {
  stage3: EdgeRenderer,
};

const LogicCanvas: React.FC = () => {
  const { logicMap, focusNodeId, setFocusNode } = useStage3Store();
  const { setCenter, getNodes } = useReactFlow();
  const prevFocusRef = useRef<string | undefined>(undefined);

  // Extremely generous spacing for a clean, non-overlapping infinite canvas
  const LANE_Y_BASE = {
    'L1': 150,
    'L2': 1350,
    'L3': 2550
  };

  const RANK_X_STEP = 500; 
  const NODE_HEIGHT = 850; 

  useEffect(() => {
    if (focusNodeId && focusNodeId !== prevFocusRef.current) {
      const nodes = getNodes();
      const node = nodes.find(n => n.id === focusNodeId);
      if (node) {
        setCenter(node.position.x + 160, node.position.y + 150, { zoom: 0.8, duration: 1000 });
      }
      prevFocusRef.current = focusNodeId;
    }
  }, [focusNodeId, getNodes, setCenter]);

  const nodes = useMemo(() => {
    const groups: Record<string, string[]> = {};
    logicMap.nodes.forEach(node => {
      const lane = node.ui?.lane || 'L2';
      const rank = node.ui?.rank || 0;
      const key = `${lane}_${rank}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(node.id);
    });

    return logicMap.nodes.map((node) => {
      const lane = node.ui?.lane || 'L2';
      const rank = node.ui?.rank || 0;
      const key = `${lane}_${rank}`;
      const indexInGroup = groups[key].indexOf(node.id);
      
      const laneY = LANE_Y_BASE[lane as keyof typeof LANE_Y_BASE] || 1350;
      const posX = rank * RANK_X_STEP;
      const posY = laneY + (indexInGroup * NODE_HEIGHT);

      return {
        id: node.id,
        type: 'nodeCard',
        position: { x: posX, y: posY },
        data: { 
          node,
          isFocused: focusNodeId === node.id,
          hasGlobalFocus: !!focusNodeId
        },
        dragHandle: '.drag-handle',
        zIndex: focusNodeId === node.id ? 1000 : (focusNodeId ? 1 : 10),
      };
    });
  }, [logicMap.nodes, focusNodeId]);

  const edges = useMemo(() => {
    return logicMap.edges.map(edge => {
      const isConnectedToFocus = focusNodeId === edge.from || focusNodeId === edge.to;
      const isBroken = edge.ui?.state === 'broken';
      
      // Marker color should match the line logic
      const markerColor = isBroken ? '#ef4444' : (isConnectedToFocus ? '#4f46e5' : '#64748b');

      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: 'stage3',
        data: { 
          state: edge.ui?.state || 'normal',
          strength: edge.strength,
          relation_type: edge.relation_type,
          label: edge.label,
          tooltip: edge.tooltip,
          isFocused: isConnectedToFocus,
          hasGlobalFocus: !!focusNodeId
        },
        zIndex: isConnectedToFocus ? 500 : 1,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: markerColor,
          width: 20, // Larger arrows
          height: 20
        }
      };
    });
  }, [logicMap.edges, focusNodeId]);

  return (
    <div id="logic-canvas-container" className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={() => setFocusNode(undefined)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={1.5}
      >
      </ReactFlow>
    </div>
  );
};

export default LogicCanvas;
