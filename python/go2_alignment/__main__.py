"""Bilingual offline command line / Linha de comando offline bilíngue."""

import argparse
import sqlite3
import sys
from pathlib import Path

from .contract import read_csv, read_json, write_json
from .core import analyze


def parser():
    root = argparse.ArgumentParser(description="Offline analysis / Análise offline")
    commands = root.add_subparsers(dest="command", required=True)
    command = commands.add_parser("analyze", help="Analyze JSON / Analisar JSON")
    command.add_argument("input", help="Scenario JSON / JSON do cenário")
    command.add_argument("output", help="Report JSON / JSON do relatório")
    command = commands.add_parser(
        "import-csv", help="Convert CSV using JSON metadata / Converter CSV com metadados JSON"
    )
    command.add_argument("input", help="Scenario template / Modelo de cenário")
    command.add_argument("csv")
    command.add_argument("output")
    return root


def execute(args):
    if args.command == "analyze":
        write_json(args.output, analyze(read_json(args.input)))
    elif args.command == "import-csv":
        scenario = read_json(args.input)
        columns = ("id", "observed_x_m", "observed_y_m", "reference_x_m", "reference_y_m", "weight")
        rows = read_csv(args.csv, columns)
        scenario["pairs"] = [
            {
                "id": row["id"],
                "observed": [float(row["observed_x_m"]), float(row["observed_y_m"])],
                "reference": [float(row["reference_x_m"]), float(row["reference_y_m"])],
                "weight": float(row["weight"]),
            }
            for row in rows
        ]
        analyze(scenario)
        write_json(args.output, scenario)


def main(argv=None):
    args = parser().parse_args(argv)
    try:
        if hasattr(args, "output"):
            for name in ("input", "csv", "database"):
                if (
                    hasattr(args, name)
                    and Path(getattr(args, name)).resolve() == Path(args.output).resolve()
                ):
                    raise ValueError(
                        "Input and output must differ / Entrada e saída devem ser diferentes"
                    )
        execute(args)
        return 0
    except (ValueError, OSError, sqlite3.Error) as error:
        print(f"Analysis failed / Falha na análise: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
