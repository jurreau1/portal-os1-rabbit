"""Numerical contracts and topology integrity for MAX-SIM."""

import sys
import unittest
from pathlib import Path

import networkx as nx
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "max_sim"))
from graph_engine import build_maxsim
from metrics import StructuralInvariant


class StructureTests(unittest.TestCase):
    def test_baseline_contract(self):
        graph = build_maxsim()
        engine = StructuralInvariant(graph)
        self.assertEqual((engine.node_count(), engine.edge_count()), (6, 7))
        self.assertAlmostEqual(engine.identity(), 14)
        self.assertAlmostEqual(engine.connectivity(), (5 - np.sqrt(17)) / 2)
        self.assertTrue(nx.is_connected(graph))
        self.assertEqual(set(graph.neighbors("Core Executive")),
                         {"Virtualization Engine", "State Recovery", "Memory Buffer"})

    def test_spectrum_is_invariant_under_relabeling(self):
        graph = build_maxsim()
        relabeled = nx.convert_node_labels_to_integers(graph, first_label=10)
        np.testing.assert_allclose(StructuralInvariant(graph).spectrum(),
                                   StructuralInvariant(relabeled).spectrum(), atol=1e-12)

    def test_empty_singleton_and_disconnected(self):
        for graph in [nx.Graph(), nx.empty_graph(1), nx.empty_graph(3)]:
            engine = StructuralInvariant(graph)
            self.assertEqual(engine.identity(), 0)
            self.assertEqual(engine.connectivity(), 0)
        disconnected = nx.disjoint_union(nx.path_graph(3), nx.path_graph(2))
        engine = StructuralInvariant(disconnected)
        self.assertEqual(engine.connectivity(), 0)
        self.assertAlmostEqual(engine.identity(), 6)

class ComparisonTests(unittest.TestCase):
    def test_python_calculus_contract(self):
        source = StructuralInvariant(nx.path_graph(3))
        target = StructuralInvariant(nx.path_graph(2))
        expected_entropy = -0.25 * np.log2(0.25) - 0.75 * np.log2(0.75)
        self.assertAlmostEqual(source.spectral_entropy(), expected_entropy)
        self.assertAlmostEqual(source.translation_loss(target), expected_entropy)
        self.assertAlmostEqual(source.structural_fidelity(target), 0.5)
        self.assertAlmostEqual(source.structural_drift(target), -2)
        self.assertIsNone(StructuralInvariant(nx.Graph()).structural_fidelity(source))
        np.testing.assert_allclose(source.laplacian_spectrum(), [0, 1, 3], atol=1e-12)


if __name__ == "__main__":
    unittest.main()
