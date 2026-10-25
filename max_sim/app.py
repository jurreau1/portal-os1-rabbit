"""MAX-SIM structural workbench. Run with `streamlit run max_sim/app.py`."""

from pathlib import Path

import plotly.graph_objects as go
import streamlit as st
from streamlit_agraph import Config, Edge, Node, agraph

from graph_engine import build_maxsim
from metrics import StructuralInvariant

ASSETS = Path(__file__).resolve().parent / "assets"

st.set_page_config(page_title="MAX-SIM | Structural Workbench", page_icon="◈", layout="wide")
st.markdown(f"<style>{(ASSETS / 'maxsim.css').read_text(encoding='utf-8')}</style>", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("## ◈ MAX-SIM")
    st.caption("COGNITIVE ARCHITECTURE LAB")
    st.divider()
    st.markdown("### Simulation controls")
    physics = st.toggle("Physics simulation", value=True)
    labels = st.toggle("Subsystem labels", value=True)
    st.caption("Drag nodes to arrange the topology. Scroll to zoom; drag empty space to pan.")
    st.divider()
    st.markdown("### Subsystems")
    st.markdown("🩵 Executive\n\n🟢 State & memory\n\n🟠 Agents")
    st.divider()
    st.caption("BASELINE TOPOLOGY · v1.0")
    st.caption("Metrics describe graph structure. Moving a node only changes its visual position.")

st.markdown('<div class="eyebrow">MAX-SIM / SYSTEM OBSERVATORY</div>', unsafe_allow_html=True)
st.title("Structural Workbench")
st.write("Explore the architecture. Inspect its connections. Measure structural integrity.")
st.markdown('<div class="status-line">● &nbsp; BASELINE LOADED &nbsp; / &nbsp; UNDIRECTED NETWORK</div>', unsafe_allow_html=True)

graph = build_maxsim()
engine = StructuralInvariant(graph)
spectrum = engine.spectrum()

for column, label, value, help_text in zip(
    st.columns(4),
    ["Identity", "Connectivity", "Nodes", "Edges"],
    [f"{engine.identity():.2f}", f"{engine.connectivity():.2f}", engine.node_count(), engine.edge_count()],
    ["Sum of positive Laplacian eigenvalues. For this unweighted graph, this equals twice the edge count; it is not a unique graph identifier.",
     "Algebraic connectivity: the second-smallest Laplacian eigenvalue. Zero means disconnected.",
     "Number of subsystems in the topology.", "Number of undirected subsystem connections."],
):
    column.metric(label, value, help=help_text)

left, right = st.columns([1.8, 1], gap="large")
with left:
    st.subheader("Network topology")
    st.caption("01 / FORCE-DIRECTED MAP")
    nodes = [
        Node(id=name, label=name if labels else "", title=f"{name} · {data['group']}",
             size=26 if name == "Core Executive" else 21, color=data["color"],
             font={"color": "#dce8f7", "size": 14, "face": "monospace"}, borderWidth=2)
        for name, data in graph.nodes(data=True)
    ]
    edges = [Edge(source=source, target=target, color="#36536e", width=2)
             for source, target in graph.edges()]
    config = Config(
        width="100%", height=540, directed=False, physics=physics, hierarchical=False,
        interaction={"dragNodes": True, "dragView": True, "zoomView": True},
    )
    # Config appends px even to percentage widths; override for a responsive canvas.
    config.edges = {"arrows": {"to": {"enabled": False}}}
    config.groups = {}
    config.width = "100%"
    config.layout["randomSeed"] = 42
    selected = agraph(nodes=nodes, edges=edges, config=config)
    st.caption("● Executive  /  ● State & memory  /  ● Agents")

with right:
    st.subheader("Laplacian spectrum")
    st.caption("02 / STRUCTURAL SIGNATURE")
    figure = go.Figure(go.Scatter(
        x=list(range(len(spectrum))), y=spectrum, mode="lines+markers",
        line={"color": "#00d4ff", "width": 2},
        marker={"size": 8, "color": "#00d4ff", "line": {"color": "#07101d", "width": 2}},
        fill="tozeroy", fillcolor="rgba(0, 212, 255, 0.07)",
        hovertemplate="Eigenvalue %{x}<br>λ = %{y:.4f}<extra></extra>",
    ))
    figure.update_layout(
        template="plotly_dark", height=290, margin={"l": 10, "r": 10, "t": 20, "b": 20},
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font={"color": "#99acc2", "family": "monospace"},
        xaxis={"title": "Eigenvalue index", "dtick": 1, "gridcolor": "#172536"},
        yaxis={"title": "λ", "gridcolor": "#172536", "zerolinecolor": "#263a50"},
        showlegend=False,
    )
    st.plotly_chart(figure, width="stretch", config={"displayModeBar": False})
    st.markdown("#### Subsystem inspector")
    if selected in graph:
        st.markdown(f"**{selected}**")
        st.caption(f"{graph.nodes[selected]['group']} · {graph.degree[selected]} connections")
        st.write("Connected to: " + ", ".join(sorted(graph.neighbors(selected))))
    else:
        st.info("Select a node in the topology to inspect its connections.")

with st.expander("Inspect spectrum & metric definitions"):
    st.dataframe({"Index": list(range(len(spectrum))), "Eigenvalue": spectrum}, hide_index=True, width="stretch")
    st.caption("Identity is the sum of eigenvalues greater than 1e−8. It is a structural measure, not a unique identity or a measure of consciousness. Connectivity is λ₂. Layout physics does not change these values.")

st.divider()
st.caption("MAX-SIM v1.0  /  STRUCTURAL ANALYSIS  /  NetworkX + Plotly + streamlit-agraph")
