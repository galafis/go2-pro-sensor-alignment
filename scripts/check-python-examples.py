"""Execute documented offline workflows and compare artifacts / Conferir exemplos."""

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = "go2_alignment"
STEPS = [
    ["analyze", "examples/nominal.json", "{out}/nominal.report.json"],
    [
        "import-csv",
        "examples/nominal.json",
        "examples/python/input.csv",
        "{out}/imported.scenario.json",
    ],
    ["analyze", "{out}/imported.scenario.json", "{out}/imported.report.json"],
]


def main():
    parser = argparse.ArgumentParser(description="Check examples / Conferir exemplos")
    parser.add_argument(
        "--write",
        action="store_true",
        help="Refresh reviewed expected outputs / Atualizar saídas esperadas revisadas",
    )
    args = parser.parse_args()
    checked = 0
    with tempfile.TemporaryDirectory() as temporary:
        out = Path(temporary)
        for command in STEPS:
            actual_command = [part.replace("{out}", str(out)) for part in command]
            result = subprocess.run(
                [sys.executable, "-m", PACKAGE, *actual_command], cwd=ROOT, capture_output=True
            )
            if result.returncode:
                raise RuntimeError(result.stderr.decode("utf-8", errors="replace"))
        for actual in sorted(out.iterdir()):
            if actual.suffix not in (".json", ".csv"):
                continue
            expected = ROOT / "examples/python" / actual.name
            if args.write:
                expected.write_bytes(actual.read_bytes())
            elif actual.suffix == ".json":
                if json.loads(actual.read_text(encoding="utf-8")) != json.loads(
                    expected.read_text(encoding="utf-8")
                ):
                    raise AssertionError(f"Changed output / Saída alterada: {actual.name}")
            elif actual.read_bytes() != expected.read_bytes():
                raise AssertionError(f"Changed table / Tabela alterada: {actual.name}")
            checked += 1
    print(f"{checked} offline artifacts verified / artefatos offline verificados")


if __name__ == "__main__":
    main()
