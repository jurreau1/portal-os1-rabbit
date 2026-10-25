import { csvParse, csvFormat } from "d3";
import type { Architecture } from "../types";
import { validateGraph } from "./graph";
export function exportJSON(graph: Architecture, name = "Architecture") {
  return JSON.stringify(
    { timestamp: new Date().toISOString(), name, ...graph },
    null,
    2,
  );
}
// Explicit encoding metadata keeps legacy CSV and literal apostrophes lossless.
const CSV_ENCODING = "apostrophe-v1";
const encodeCell = (value: string) =>
  /^[\s]*[=+\-@]/.test(value) || /^[\t\r\n']/.test(value) ? `'${value}` : value;
const decodeCell = (value: string | undefined, encoding: string | undefined) =>
  encoding === CSV_ENCODING && value?.startsWith("'") ? value.slice(1) : value;
export function exportCSV(graph: Architecture) {
  return csvFormat(
    [
      ...graph.nodes.map((n) => ({
        kind: "node",
        textEncoding: CSV_ENCODING,
        id: encodeCell(n.id),
        label: encodeCell(n.label),
        type: n.type,
        x: n.x ?? "",
        y: n.y ?? "",
        source: "",
        target: "",
      })),
      ...graph.edges.map((e) => ({
        kind: "edge",
        textEncoding: CSV_ENCODING,
        id: "",
        label: "",
        type: "",
        x: "",
        y: "",
        source: encodeCell(e.source),
        target: encodeCell(e.target),
      })),
    ],
    [
      "kind",
      "id",
      "label",
      "type",
      "x",
      "y",
      "source",
      "target",
      "textEncoding",
    ],
  );
}
export function parseArchitecture(text: string, format: string): Architecture {
  if (text.length > 2_000_000) throw new Error("Import is limited to 2 MB.");
  if (format === "json") return validateGraph(JSON.parse(text));
  if (format === "csv") {
    const rows = csvParse(text);
    if (rows.columns.includes("kind")) {
      if (rows.some((r) => r.kind !== "node" && r.kind !== "edge"))
        throw new Error("CSV kind must be node or edge.");
      return validateGraph({
        nodes: rows
          .filter((r) => r.kind === "node")
          .map((r) => ({
            id: decodeCell(r.id, r.textEncoding),
            label: decodeCell(r.label, r.textEncoding),
            type: r.type,
            ...(r.x ? { x: Number(r.x) } : {}),
            ...(r.y ? { y: Number(r.y) } : {}),
          })),
        edges: rows
          .filter((r) => r.kind === "edge")
          .map((r) => ({
            source: decodeCell(r.source, r.textEncoding),
            target: decodeCell(r.target, r.textEncoding),
          })),
      });
    }
    if (!rows.columns.includes("source") || !rows.columns.includes("target"))
      throw new Error(
        "CSV needs source,target or the exported kind-based schema.",
      );
    const ids = [...new Set(rows.flatMap((r) => [r.source, r.target]))];
    return validateGraph({
      nodes: ids.map((id) => ({ id, label: id, type: "Infrastructure" })),
      edges: rows.map((r) => ({ source: r.source, target: r.target })),
    });
  }
  if (format === "graphml" || format === "xml") {
    if (/<!DOCTYPE|<!ENTITY/i.test(text))
      throw new Error("GraphML entities and DTDs are not supported.");
    const xml = new DOMParser().parseFromString(text, "application/xml");
    if (xml.getElementsByTagName("parsererror").length)
      throw new Error("Invalid GraphML XML.");
    const tags = (tag: string) =>
      Array.from(xml.getElementsByTagNameNS("*", tag));
    const graphs = tags("graph");
    if (
      graphs.length !== 1 ||
      graphs[0].getAttribute("edgedefault") !== "undirected"
    )
      throw new Error("GraphML must contain one undirected graph.");
    const keys = new Map(
      tags("key").map((k) => [
        k.getAttribute("id"),
        {
          name: k.getAttribute("attr.name"),
          default: k.getElementsByTagNameNS("*", "default")[0]?.textContent,
        },
      ]),
    );
    const values = (el: Element) => {
      const values: Record<string, string> = {};
      keys.forEach((k) => {
        if (k.name && k.default) values[k.name] = k.default;
      });
      Array.from(el.children)
        .filter((c) => c.localName === "data")
        .forEach((c) => {
          const key = keys.get(c.getAttribute("key"))?.name;
          if (key) values[key] = c.textContent ?? "";
        });
      return values;
    };
    if (tags("hyperedge").length || tags("port").length)
      throw new Error("Hyperedges and ports are not supported.");
    return validateGraph({
      nodes: tags("node").map((n) => {
        const data = values(n),
          id = n.getAttribute("id");
        return {
          id,
          label: data.label || data.name || id,
          type: data.type || "Infrastructure",
        };
      }),
      edges: tags("edge").map((e) => {
        if (
          e.getAttribute("directed") === "true" ||
          e.getAttribute("directed") === "1"
        )
          throw new Error("Directed edges are not supported.");
        if (values(e).weight && Number(values(e).weight) !== 1)
          throw new Error("Weighted graphs are not supported.");
        return {
          source: e.getAttribute("source"),
          target: e.getAttribute("target"),
        };
      }),
    });
  }
  throw new Error("Choose a JSON, CSV, or GraphML file.");
}
export function download(
  text: string | Blob,
  name: string,
  mime = "application/json",
) {
  const url = URL.createObjectURL(
    text instanceof Blob ? text : new Blob([text], { type: mime }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportImage(svg: SVGSVGElement, format: "svg" | "png") {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "1200");
  clone.setAttribute("height", "760");
  const serialized = new XMLSerializer().serializeToString(clone);
  if (format === "svg") {
    download(serialized, "max-sim-topology.svg", "image/svg+xml");
    return;
  }
  const url = URL.createObjectURL(
    new Blob([serialized], { type: "image/svg+xml" }),
  );
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not render graph image."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1520;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.drawImage(img, 0, 0, 2400, 1520);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("PNG export failed.");
    download(blob, "max-sim-topology.png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
