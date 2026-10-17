import { useMemo } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { KINDS, KIND_COLOR_VAR, KIND_LABEL, type Kind } from "@/lib/knowledge";
import type { KnowledgeItem } from "@/lib/queries";

export default function MapGraph({
  roleTitle,
  items,
  links,
  display,
  onSelect,
}: {
  roleTitle: string;
  items: KnowledgeItem[];
  links: { from_item: string; to_item: string }[];
  display: (i: KnowledgeItem) => { title: string };
  onSelect: (id: string) => void;
}) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const kinds = KINDS.filter((k) => items.some((i) => i.kind === k));
    nodes.push({
      id: "role",
      position: { x: -90, y: -28 },
      data: { label: roleTitle },
      style: { background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: 999, width: 180, fontFamily: "var(--font-display)", fontSize: 20, padding: 12 },
      draggable: true,
    });
    kinds.forEach((k, ki) => {
      const angle = (ki / kinds.length) * Math.PI * 2 - Math.PI / 2;
      const hx = Math.cos(angle) * 330;
      const hy = Math.sin(angle) * 260;
      const color = KIND_COLOR_VAR[k as Kind];
      nodes.push({
        id: `kind-${k}`,
        position: { x: hx - 80, y: hy - 18 },
        data: { label: KIND_LABEL[k as Kind] },
        style: { background: "var(--paper)", border: `2px solid ${color}`, color, borderRadius: 12, width: 160, fontWeight: 600, fontSize: 12 },
      });
      edges.push({ id: `e-role-${k}`, source: "role", target: `kind-${k}`, style: { stroke: color, strokeWidth: 2 } });
      const group = items.filter((i) => i.kind === k);
      group.forEach((it, ii) => {
        const spread = Math.min(1.1, 0.28 * group.length);
        const a = angle + (group.length > 1 ? (ii / (group.length - 1) - 0.5) * spread : 0);
        const dist = 560 + (ii % 2) * 90;
        nodes.push({
          id: it.id,
          position: { x: Math.cos(a) * dist - 85, y: Math.sin(a) * dist * 0.8 - 20 },
          data: { label: display(it).title },
          style: { background: "var(--card)", borderLeft: `4px solid ${color}`, borderRadius: 8, width: 170, fontSize: 12, textAlign: "left", cursor: "pointer" },
        });
        edges.push({ id: `e-${k}-${it.id}`, source: `kind-${k}`, target: it.id, style: { stroke: color, opacity: 0.5 } });
      });
    });
    const ids = new Set(items.map((i) => i.id));
    links.forEach((l, i) => {
      if (ids.has(l.from_item) && ids.has(l.to_item))
        edges.push({ id: `l-${i}`, source: l.from_item, target: l.to_item, style: { stroke: "var(--terracotta)", strokeDasharray: "4 4" }, animated: false });
    });
    return { nodes, edges };
  }, [items, links, roleTitle, display]);

  return (
    <div className="paper-card h-[70vh] min-h-[480px] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.2}
        onNodeClick={(_e: unknown, n: { id: string }) => {
          if (n.id !== "role" && !n.id.startsWith("kind-")) onSelect(n.id);
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
