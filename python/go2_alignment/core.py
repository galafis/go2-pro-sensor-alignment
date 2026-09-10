"""Weighted proper rigid 2D alignment / Alinhamento rígido 2D ponderado."""

import math

from .contract import unique_ids, validate


def transform_point(point, transform):
    c, s = math.cos(transform["angleRad"]), math.sin(transform["angleRad"])
    tx, ty = transform["translation"]
    return [c * point[0] - s * point[1] + tx, s * point[0] + c * point[1] + ty]


def fit(pairs):
    total = sum(pair["weight"] for pair in pairs)
    a = [sum(pair["weight"] * pair["observed"][d] / total for pair in pairs) for d in (0, 1)]
    b = [sum(pair["weight"] * pair["reference"][d] / total for pair in pairs) for d in (0, 1)]
    dot = cross = spread = reference_spread = 0.0
    for pair in pairs:
        x, y = (pair["observed"][d] - a[d] for d in (0, 1))
        u, v = (pair["reference"][d] - b[d] for d in (0, 1))
        w = pair["weight"]
        dot += w * (x * u + y * v)
        cross += w * (x * v - y * u)
        spread += w * (x * x + y * y)
        reference_spread += w * (u * u + v * v)
    if (
        spread <= 1e-12
        or reference_spread <= 1e-12
        or math.hypot(dot, cross) <= 1e-12 * math.sqrt(spread * reference_spread)
    ):
        raise ValueError("Degenerate correspondences / Correspondências degeneradas")
    angle = math.atan2(cross, dot)
    rotated = transform_point(a, {"angleRad": angle, "translation": [0, 0]})
    return {"angleRad": angle, "translation": [b[d] - rotated[d] for d in (0, 1)]}


def analyze(scenario):
    s = validate(scenario)
    pairs = s["pairs"]
    unique_ids(pairs)
    transform = fit(pairs)
    records, residuals, held_out = [], [], []
    for i, pair in enumerate(pairs):
        aligned = transform_point(pair["observed"], transform)
        residual = math.dist(aligned, pair["reference"])
        residuals.append(residual)
        held, status = None, "insufficient-pairs"
        if len(pairs) > 2:
            try:
                partial = fit(pairs[:i] + pairs[i + 1 :])
                held = math.dist(transform_point(pair["observed"], partial), pair["reference"])
                held_out.append(held)
                status = "computed"
            except ValueError:
                status = "degenerate-subset"
        records.append(
            {
                **pair,
                "aligned": [round(value, 6) for value in aligned],
                "residualM": round(residual, 6),
                "heldOutM": None if held is None else round(held, 6),
                "heldOutStatus": status,
            }
        )
    rmse = math.sqrt(
        sum(pair["weight"] * residual**2 for pair, residual in zip(pairs, residuals))
        / sum(pair["weight"] for pair in pairs)
    )
    return {
        "scenarioId": s["scenarioId"],
        "source": s["source"],
        "transform": transform,
        "records": records,
        "rmseM": round(rmse, 6),
        "maxResidualM": round(max(residuals), 6),
        "maxHeldOutM": round(max(held_out), 6) if held_out else None,
        "heldOutComputed": len(held_out),
        "fitExceedsThreshold": max(residuals) > s["maxResidualM"],
        "heldOutExceedsThreshold": bool(held_out and max(held_out) > s["maxResidualM"]),
        "evaluationPoints": [
            {
                "observed": point[:],
                "aligned": [round(value, 6) for value in transform_point(point, transform)],
            }
            for point in s["evaluationPoints"]
        ],
    }
