import { create } from "zustand";
import { createId } from "../engine/id";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Architecture, ArchitectureNode, Snapshot } from "../types";
import { SAMPLE } from "../data/sample";
import {
  copyGraph,
  edgeKey,
  removeNodes,
  validateGraph,
} from "../engine/graph";
const snapshot = (graph: Architecture, name: string): Snapshot => ({
  ...copyGraph(graph),
  name: name.trim().slice(0, 100),
  timestamp: new Date().toISOString(),
  id: createId(),
});
let storageUnavailable = false;
let writesPaused = false;
let lastRead: string | null = null;
const recoveryNotice =
  "Saved workspace could not be read. Original data is preserved; automatic saving is paused.";
const initial = snapshot(SAMPLE, "MAX-SIM baseline");
interface Workbench {
  graph: Architecture;
  snapshots: Snapshot[];
  history: Snapshot[];
  baselineId: string;
  notice: string;
  recovery: { raw: string | null } | null;
  replaceSavedWorkspace: () => void;
  setNotice: (notice: string) => void;
  replace: (graph: Architecture, name: string) => void;
  addNode: (node: ArchitectureNode) => void;
  deleteNode: (id: string) => void;
  addEdge: (source: string, target: string) => void;
  deleteEdge: (source: string, target: string) => void;
  position: (id: string, x: number, y: number) => void;
  save: (name: string) => void;
  restore: (id: string) => void;
  removeSnapshot: (id: string) => void;
  setBaseline: (id: string) => void;
}
export const useWorkbench = create<Workbench>()(
  persist(
    (set, get) => ({
      graph: copyGraph(SAMPLE),
      snapshots: [initial],
      history: [initial],
      baselineId: initial.id,
      notice: "",
      recovery: null,
      replaceSavedWorkspace: () => {
        writesPaused = false;
        set({
          recovery: null,
          notice: "Current workspace saved in place of the unreadable copy.",
        });
      },
      setNotice: (notice) => set({ notice }),
      replace: (input, name) => {
        const graph = validateGraph(input);
        set((s) => ({
          graph,
          history: [...s.history, snapshot(graph, name)].slice(-80),
          notice: name,
        }));
      },
      addNode: (node) =>
        get().replace(
          { nodes: [...get().graph.nodes, node], edges: get().graph.edges },
          `Added ${node.label}`,
        ),
      deleteNode: (id) =>
        get().replace(
          removeNodes(get().graph, new Set([id])),
          `Removed ${get().graph.nodes.find((n) => n.id === id)?.label ?? id}`,
        ),
      addEdge: (source, target) =>
        get().replace(
          { ...get().graph, edges: [...get().graph.edges, { source, target }] },
          "Connection created",
        ),
      deleteEdge: (source, target) =>
        get().replace(
          {
            ...get().graph,
            edges: get().graph.edges.filter(
              (e) => edgeKey(e.source, e.target) !== edgeKey(source, target),
            ),
          },
          "Connection removed",
        ),
      position: (id, x, y) =>
        set((s) => ({
          graph: {
            ...s.graph,
            nodes: s.graph.nodes.map((n) =>
              n.id === id
                ? {
                    ...n,
                    x: Math.max(-10000, Math.min(10000, x)),
                    y: Math.max(-10000, Math.min(10000, y)),
                  }
                : n,
            ),
          },
        })),
      save: (name) => {
        if (!name.trim()) throw new Error("Give this snapshot a name.");
        if (get().snapshots.length >= 40)
          throw new Error(
            "Snapshot limit reached (40). Export and delete older snapshots first.",
          );
        set((s) => ({
          snapshots: [
            ...s.snapshots,
            snapshot(s.graph, name.trim().slice(0, 100)),
          ],
          notice: "Snapshot saved locally",
        }));
      },
      restore: (id) => {
        const saved = get().snapshots.find((s) => s.id === id);
        if (saved) get().replace(saved, `Restored ${saved.name}`);
      },
      removeSnapshot: (id) => {
        if (get().baselineId === id)
          throw new Error(
            "Select a different baseline before deleting this snapshot.",
          );
        set((s) => ({
          snapshots: s.snapshots.filter((snap) => snap.id !== id),
          notice: "Snapshot deleted",
        }));
      },
      setBaseline: (id) => {
        if (get().snapshots.some((s) => s.id === id)) set({ baselineId: id });
      },
    }),
    {
      name: "max-sim-workbench-v2",
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          try {
            lastRead = localStorage.getItem(key);
            return lastRead;
          } catch (error) {
            lastRead = null;
            throw error;
          }
        },
        setItem: (key, value) => {
          // Never replace an unreadable workspace due to a notice clear or edit.
          if (writesPaused) return;
          try {
            localStorage.setItem(key, value);
            storageUnavailable = false;
          } catch {
            if (!storageUnavailable) {
              storageUnavailable = true;
              queueMicrotask(() =>
                useWorkbench.setState({
                  notice:
                    "Browser storage is full or unavailable. Export your work before closing this page.",
                }),
              );
            }
          }
        },
        removeItem: (key) => localStorage.removeItem(key),
      })),
      partialize: (s) => ({
        graph: s.graph,
        snapshots: s.snapshots,
        history: s.history,
        baselineId: s.baselineId,
      }),
      merge: (stored, current) => {
        if (!stored) {
          if (lastRead === null) return current;
          writesPaused = true;
          return {
            ...current,
            recovery: { raw: lastRead },
            notice: recoveryNotice,
          };
        }
        try {
          const s = stored as Partial<Workbench>;
          const checked = (list: unknown, limit: number): Snapshot[] => {
            if (!Array.isArray(list) || !list.length || list.length > limit)
              throw new Error("Invalid history");
            const seen = new Set<string>();
            return list.map((item) => {
              if (
                typeof item.id !== "string" ||
                seen.has(item.id) ||
                typeof item.name !== "string" ||
                item.name.length > 100 ||
                typeof item.timestamp !== "string" ||
                !Number.isFinite(Date.parse(item.timestamp))
              )
                throw new Error("Invalid snapshot");
              seen.add(item.id);
              return {
                ...validateGraph(item),
                id: item.id,
                name: item.name,
                timestamp: item.timestamp,
              };
            });
          };
          const snapshots = checked(s.snapshots, 40),
            history = checked(s.history, 80);
          const graph = validateGraph(s.graph);
          writesPaused = false;
          return {
            ...current,
            recovery: null,
            graph,
            snapshots,
            history,
            baselineId: snapshots.some((snap) => snap.id === s.baselineId)
              ? s.baselineId!
              : snapshots[0].id,
          };
        } catch {
          writesPaused = true;
          return {
            ...current,
            recovery: { raw: lastRead },
            notice: recoveryNotice,
          };
        }
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          writesPaused = true;
          queueMicrotask(() =>
            useWorkbench.setState({
              recovery: { raw: lastRead },
              notice: recoveryNotice,
            }),
          );
        }
      },
    },
  ),
);
