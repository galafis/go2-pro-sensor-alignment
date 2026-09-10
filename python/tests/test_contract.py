"""Contract, command-line and independent implementation checks / Verificações."""

import copy
import json
import math
import shutil
import subprocess
import sys
import tempfile
import unittest
from importlib.resources import files
from pathlib import Path

from go2_alignment import analyze
from go2_alignment.contract import read_csv, read_json, write_json

ROOT = Path(__file__).resolve().parents[2]
EXAMPLE = ROOT / "examples/nominal.json"


def nominal():
    return json.loads(EXAMPLE.read_text(encoding="utf-8"))


def close(test, actual, expected):
    if isinstance(expected, dict):
        test.assertEqual(set(actual), set(expected))
        for key in expected:
            close(test, actual[key], expected[key])
    elif isinstance(expected, list):
        test.assertEqual(len(actual), len(expected))
        for left, right in zip(actual, expected):
            close(test, left, right)
    elif isinstance(expected, (int, float)) and not isinstance(expected, bool):
        test.assertTrue(
            math.isclose(actual, expected, abs_tol=1.1e-6, rel_tol=1e-10), (actual, expected)
        )
    else:
        test.assertEqual(actual, expected)


class ContractTests(unittest.TestCase):
    def test_schema_is_identical_to_public_browser_contract(self):
        installed = json.loads(
            files("go2_alignment").joinpath("scenario.schema.json").read_text(encoding="utf-8")
        )
        self.assertEqual(
            installed,
            json.loads((ROOT / "schemas/scenario.schema.json").read_text(encoding="utf-8")),
        )

    def test_analysis_does_not_mutate_input(self):
        value = nominal()
        original = copy.deepcopy(value)
        analyze(value)
        self.assertEqual(value, original)

    def test_unknown_public_fields_rejected(self):
        value = nominal()
        value["unexpected"] = "do not retain"
        with self.assertRaises(ValueError):
            analyze(value)

    def test_required_field_rejected(self):
        value = nominal()
        del value["source"]
        with self.assertRaises(ValueError):
            analyze(value)

    def test_non_finite_values_rejected(self):
        for value in (float("nan"), float("inf"), -float("inf")):
            with self.subTest(value=value), self.assertRaises(ValueError):
                scenario = nominal()
                scenario["schemaVersion"] = value
                analyze(scenario)

    def test_boolean_schema_version_rejected(self):
        value = nominal()
        value["schemaVersion"] = True
        with self.assertRaises(ValueError):
            analyze(value)

    def test_duplicate_json_keys_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "input.json"
            path.write_text('{"source":"synthetic","source":"manual"}', encoding="utf-8")
            with self.assertRaises(ValueError):
                read_json(path)

    def test_bad_csv_header_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "input.csv"
            path.write_text("id,id\na,b\n", encoding="utf-8")
            with self.assertRaises(ValueError):
                read_csv(path, ("id", "value"))

    def test_invalid_serialization_preserves_existing_output(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "output.json"
            path.write_text("previous", encoding="utf-8")
            with self.assertRaises(ValueError):
                write_json(path, {"value": float("nan")})
            self.assertEqual(path.read_text(), "previous")

    def test_cli_matches_library(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "output.json"
            result = subprocess.run(
                [sys.executable, "-m", "go2_alignment", "analyze", str(EXAMPLE), str(output)],
                capture_output=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(read_json(output), analyze(nominal()))

    def test_invalid_cli_preserves_last_report(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / "input.json", Path(directory) / "output.json"
            source.write_text("{}", encoding="utf-8")
            output.write_text("previous", encoding="utf-8")
            result = subprocess.run(
                [sys.executable, "-m", "go2_alignment", "analyze", str(source), str(output)],
                capture_output=True,
            )
            self.assertEqual(result.returncode, 1)
            self.assertEqual(output.read_text(), "previous")

    def test_cli_refuses_input_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "input.json"
            source.write_bytes(EXAMPLE.read_bytes())
            result = subprocess.run(
                [sys.executable, "-m", "go2_alignment", "analyze", str(source), str(source)],
                capture_output=True,
            )
            self.assertEqual(result.returncode, 1)
            self.assertEqual(source.read_bytes(), EXAMPLE.read_bytes())


class CrossLanguageTests(unittest.TestCase):
    pass


def parity_case(filename):
    def check(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "Node 22+ is required for independent parity checks")
        source = ROOT / "examples" / filename
        result = subprocess.run(
            [node, str(ROOT / "python/tests/js_bridge.mjs"), str(source)],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        expected = json.loads(result.stdout)
        actual = analyze(read_json(source))
        for key in ("records", "transform", "evaluationPoints", "heldOutComputed"):
            close(self, actual[key], expected[key])
        metrics = {row["key"]: row["value"] for row in expected["metrics"]}
        for key in ("rmseM", "maxResidualM", "maxHeldOutM"):
            close(self, actual[key], metrics[key])

    return check


for example in json.loads((ROOT / "examples/index.json").read_text(encoding="utf-8")):
    setattr(CrossLanguageTests, "test_" + Path(example["file"]).stem, parity_case(example["file"]))
