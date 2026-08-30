from datetime import datetime
from typing import Literal


LONG_VALUES = {
    "long",
    "buy",
    "b",
}

SHORT_VALUES = {
    "short",
    "sell",
    "s",
}

CURRENCY_SYMBOLS = {
    "$",
    "€",
    "£",
    "¥",
}


class CsvNormalizationError(Exception):
    pass


def normalize_direction(
    value: str,
) -> Literal["long", "short"]:
    normalized = value.strip().casefold()

    if normalized in LONG_VALUES:
        return "long"

    if normalized in SHORT_VALUES:
        return "short"

    raise CsvNormalizationError(
        f"Unsupported direction value: {value}"
    )


def normalize_number(
    value: str,
    decimal_separator: Literal[".", ","],
) -> float:
    normalized = value.strip()

    if not normalized:
        raise CsvNormalizationError(
            "Numeric value cannot be empty"
        )

    for symbol in CURRENCY_SYMBOLS:
        normalized = normalized.replace(
            symbol,
            "",
        )

    normalized = normalized.replace(
        "\u00a0",
        "",
    )
    normalized = normalized.replace(" ", "")

    thousands_separator = (
        "," if decimal_separator == "." else "."
    )

    normalized = normalized.replace(
        thousands_separator,
        "",
    )
    normalized = normalized.replace(
        decimal_separator,
        ".",
    )

    try:
        return float(normalized)
    except ValueError as exc:
        raise CsvNormalizationError(
            f"Invalid numeric value: {value}"
        ) from exc


def normalize_datetime(
    value: str,
    date_format: str | None = None,
) -> datetime:
    normalized = value.strip()

    if not normalized:
        raise CsvNormalizationError(
            "Datetime value cannot be empty"
        )

    try:
        if date_format is not None:
            return datetime.strptime(
                normalized,
                date_format,
            )

        return datetime.fromisoformat(
            normalized.replace("Z", "+00:00")
        )
    except ValueError as exc:
        raise CsvNormalizationError(
            f"Invalid datetime value: {value}"
        ) from exc
