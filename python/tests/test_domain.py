import copy
import math
import unittest

from go2_alignment.core import analyze, transform_point
from test_contract import nominal


class AlignmentTests(unittest.TestCase):
    def test_known_rigid_motion_recovered(self):
        s = nominal()
        truth = {"angleRad": 0.37, "translation": [2.3, -1.7]}
        for pair in s["pairs"]:
            pair["reference"] = transform_point(pair["observed"], truth)
        result = analyze(s)
        self.assertAlmostEqual(result["transform"]["angleRad"], 0.37, places=12)
        for actual, expected in zip(result["transform"]["translation"], [2.3, -1.7]):
            self.assertAlmostEqual(actual, expected, places=12)
        self.assertEqual(result["rmseM"], 0)

    def test_identical_observations_rejected(self):
        s = nominal()
        for pair in s["pairs"]:
            pair["observed"] = [0, 0]
        with self.assertRaises(ValueError):
            analyze(s)

    def test_two_pairs_leave_out_explicitly_unavailable(self):
        s = nominal()
        s["pairs"] = s["pairs"][:2]
        result = analyze(s)
        self.assertEqual(result["heldOutComputed"], 0)
        self.assertTrue(
            all(row["heldOutStatus"] == "insufficient-pairs" for row in result["records"])
        )

    def test_scale_change_cannot_be_hidden_by_rigid_fit(self):
        s = nominal()
        for pair in s["pairs"]:
            pair["reference"] = [2 * value for value in pair["observed"]]
        self.assertGreater(analyze(s)["rmseM"], 0)

    def test_threshold_uses_full_precision(self):
        s = nominal()
        s["pairs"] = [
            dict(id="a", observed=[0, 0], reference=[0, 0], weight=1),
            dict(id="b", observed=[1, 0], reference=[1.0020002, 0], weight=1),
        ]
        s["maxResidualM"] = 0.001
        result = analyze(s)
        self.assertEqual(result["maxResidualM"], 0.001)
        self.assertTrue(result["fitExceedsThreshold"])

    def test_duplicate_pair_ids_rejected(self):
        s = nominal()
        s["pairs"][1]["id"] = s["pairs"][0]["id"]
        with self.assertRaises(ValueError):
            analyze(s)

    def test_rotation_preserves_pair_distance(self):
        transform = analyze(nominal())["transform"]
        a, b = [2, 3], [-4, 1]
        self.assertAlmostEqual(
            math.dist(a, b), math.dist(transform_point(a, transform), transform_point(b, transform))
        )

    def test_negative_weights_rejected(self):
        s = copy.deepcopy(nominal())
        s["pairs"][0]["weight"] = -1
        with self.assertRaises(ValueError):
            analyze(s)
