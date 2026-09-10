"""Strict public input contract and portable file IO / Contrato público e arquivos."""

from __future__ import annotations

import csv
import json
import math
import os
import tempfile
from importlib.resources import files
from pathlib import Path

from jsonschema import Draft202012Validator

SCHEMA = json.loads(files(__package__).joinpath("scenario.schema.json").read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA)


def finite_tree(value):
    """JSON numbers must be finite; booleans are never accepted as numeric values."""
    if isinstance(value, float) and not math.isfinite(value):
        raise ValueError("Non-finite number / Número não finito")
    if isinstance(value, dict):
        for child in value.values():
            finite_tree(child)
    elif isinstance(value, list):
        for child in value:
            finite_tree(child)


def validate(scenario):
    finite_tree(scenario)
    error = next(VALIDATOR.iter_errors(scenario), None)
    if error:
        location = ".".join(map(str, error.absolute_path)) or "scenario"
        # Do not echo supplied values: input can be unsuitable for a public log.
        raise ValueError(f"Invalid field / Campo inválido: {location} ({error.validator})")
    return scenario


def unique_ids(rows):
    ids = [row["id"] for row in rows]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate identifiers / Identificadores duplicados")


def _pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise ValueError("Duplicate JSON key / Chave JSON duplicada")
        result[key] = value
    return result


def read_json(path):
    path = Path(path)
    if path.stat().st_size > 8 * 1024 * 1024:
        raise ValueError("File exceeds 8 MiB / Arquivo excede 8 MiB")
    value = json.loads(path.read_text(encoding="utf-8-sig"), object_pairs_hook=_pairs)
    finite_tree(value)
    return value


def write_json(path, value):
    """Replace output atomically after serialization; never leave a partial report."""
    text = json.dumps(value, ensure_ascii=False, allow_nan=False, indent=2) + "\n"
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".report-", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(text)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def read_csv(path, columns):
    path = Path(path)
    if path.stat().st_size > 8 * 1024 * 1024:
        raise ValueError("File exceeds 8 MiB / Arquivo excede 8 MiB")
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != list(columns):
            raise ValueError("Unexpected CSV header / Cabeçalho CSV inesperado")
        rows = list(reader)
    if any(None in row or any(value is None for value in row.values()) for row in rows):
        raise ValueError("Malformed CSV row / Linha CSV malformada")
    return rows


def decimal_integer(value):
    """CSV integers reject exponent notation, fractions and silent truncation."""
    import re

    if not re.fullmatch(r"-?[0-9]+", value):
        raise ValueError("Expected decimal integer / Esperado inteiro decimal")
    return int(value)


def write_csv(path, rows, columns):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".table-", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
