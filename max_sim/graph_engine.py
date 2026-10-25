"""Load the MAX-SIM undirected subsystem topology."""

import json
from pathlib import Path

import networkx as nx

TOPOLOGY_PATH = Path(__file__).resolve().parent / "data" / "topology.json"


def build_maxsim(path: Path = TOPOLOGY_PATH) -> nx.Graph:
    """Build a fresh graph from the topology file, including subsystem metadata."""
    topology = json.loads(Path(path).read_text(encoding="utf-8"))
    graph = nx.Graph()
    for node in topology["nodes"]:
        graph.add_node(node["id"], group=node["group"], color=node["color"])
    for source, target in topology["edges"]:
        if source not in graph or target not in graph:
            raise ValueError(f"Edge references an unknown subsystem: {source}, {target}")
        graph.add_edge(source, target)
    return graph
