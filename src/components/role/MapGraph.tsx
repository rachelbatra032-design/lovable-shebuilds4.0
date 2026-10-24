import { useMemo, useState } from "react";
import { ReactFlow, Controls, Position, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { KINDS, KIND_LABEL, type Kind } from "@/lib/knowledge";
import type { KnowledgeItem } from "@/lib/queries";

export default function MapGraph({ roleTitle, items, links, display, onSelect }: {
  roleTitle: string;
  items: KnowledgeItem[];
  links: { from_item: string; to_item: string }[];
  display: (i: KnowledgeItem) => { title: string };
  onSelect: (id: string) => void;
}) {
  const kinds = KINDS.filter((k) => items.some((i) => i.kind === k));
  const [expanded, setExpanded] = useState<Kind>(kinds[0] ?? "responsibility");
  const active = kinds.includes(expanded) ? expanded : kinds[0];
  const { nodes, edges } = useMemo(() => {
    const group = items.filter((i) => i.kind === active);
    const height = Math.max(kinds.length * 100, group.length * 100);
    const nodes: Node[] = [{ id: "role", position: { x: 0, y: height / 2 - 35 }, data: { label: roleTitle }, className: "handover-node handover-node-role", draggable: false }];
    const edges: Edge[] = [];
    kinds.forEach((k, index) => {
      nodes.push({ id: `kind-${k}`, position: { x: 320, y: height / 2 - kinds.length * 50 + index * 100 }, data: { label: `${KIND_LABEL[k]} · ${items.filter((i) => i.kind === k).length}` }, className: `handover-node handover-node-category ${active === k ? "handover-node-active" : ""}`, draggable: false });
      edges.push({ id: `role-${k}`, source: "role", target: `kind-${k}`, type: "smoothstep", className: active === k ? "handover-edge-active" : "handover-edge" });
    });
    group.forEach((item, index) => {
      nodes.push({ id: item.id, position: { x: 680, y: height / 2 - group.length * 50 + index * 100 }, data: { label: display(item).title }, className: "handover-node handover-node-item", draggable: false });
      edges.push({ id: `item-${item.id}`, source: `kind-${active}`, target: item.id, type: "smoothstep", className: "handover-edge-active" });
    });
    const ids = new Set(group.map((i) => i.id));
    links.forEach((link, index) => {
      if (ids.has(link.from_item) && ids.has(link.to_item)) edges.push({ id: `link-${index}`, source: link.from_item, target: link.to_item, className: "handover-edge-related", type: "smoothstep" });
    });
    return { nodes: nodes.map((node) => ({ ...node, sourcePosition: Position.Right, targetPosition: Position.Left })), edges };
  }, [items, links, roleTitle, display, active, kinds.join("|")]);

  return (
    <div data-tour="visual-map" className="role-graph relative h-[60dvh] min-h-[400px] overflow-hidden rounded-lg border border-border bg-muted sm:h-[70dvh] sm:min-h-[520px]">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <span className="text-sm font-medium">{active ? KIND_LABEL[active] : roleTitle}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{items.filter((i) => i.kind === active).length} records</span>
      </div>
      <ReactFlow
        key={nodes.map((n) => `${n.id}:${String(n.data["label"])}`).join("|") + edges.length}
        defaultNodes={nodes} defaultEdges={edges} fitView fitViewOptions={{ padding: 0.22 }} minZoom={0.2}
        nodesConnectable={false}
        onNodeClick={(_event, node) => {
          if (node.id.startsWith("kind-")) {
            const kind = kinds.find((k) => `kind-${k}` === node.id);
            if (kind) setExpanded(kind);
          } else if (node.id !== "role") onSelect(node.id);
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
