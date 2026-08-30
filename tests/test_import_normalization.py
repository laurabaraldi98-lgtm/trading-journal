from datetime import datetime, timezone

import pytest

from imports.normalization import (
    CsvNormalizationError,
    normalize_datetime,
    normalize_direction,
    normalize_number,
)


@pytest.mark.parametrize(
    "value",
    [
        "long",
        "LONG",
        "buy",
        "BUY",
        " b ",
    ],
)
def test_normalizes_long_direction(value):
    assert normalize_direction(value) == "long"


@pytest.mark.parametrize(
    "value",
    [
        "short",
        "SHORT",
        "sell",
        "SELL",
        " s ",
    ],
)
def test_normalizes_short_direction(value):
    assert normalize_direction(value) == "short"


def test_rejects_unknown_direction():
    with pytest.raises(
        CsvNormalizationError,
        match="Unsupported direction value: closed",
    ):
        normalize_direction("closed")


def test_normalizes_number_with_dot_decimal_separator():
    result = normalize_number(
        "$1,234.56",
        decimal_separator=".",
    )

    assert result == 1234.56


def test_normalizes_number_with_comma_decimal_separator():
    result = normalize_number(
        "€1.234,56",
        decimal_separator=",",
    )

    assert result == 1234.56


def test_normalizes_negative_number():
    result = normalize_number(
        "-250,50",
        decimal_separator=",",
    )

    assert result == -250.5


def test_normalizes_number_with_regular_spaces():
    result = normalize_number(
        "1 234,56",
        decimal_separator=",",
    )

    assert result == 1234.56


def test_normalizes_number_with_non_breaking_space():
    result = normalize_number(
        "1\u00a0234,56",
        decimal_separator=",",
    )

    assert result == 1234.56


def test_rejects_empty_number():
    with pytest.raises(
        CsvNormalizationError,
        match="Numeric value cannot be empty",
    ):
        normalize_number(
            "   ",
            decimal_separator=".",
        )


def test_rejects_invalid_number():
    with pytest.raises(
        CsvNormalizationError,
        match="Invalid numeric value: profit",
    ):
        normalize_number(
            "profit",
            decimal_separator=".",
        )


def test_normalizes_iso_datetime():
    result = normalize_datetime(
        "2026-08-30T10:30:00"
    )

    assert result == datetime(
        2026,
        8,
        30,
        10,
        30,
    )


def test_normalizes_iso_datetime_with_utc():
    result = normalize_datetime(
        "2026-08-30T10:30:00Z"
    )

    assert result == datetime(
        2026,
        8,
        30,
        10,
        30,
        tzinfo=timezone.utc,
    )


def test_normalizes_datetime_with_explicit_format():
    result = normalize_datetime(
        "30/08/2026 10:30",
        date_format="%d/%m/%Y %H:%M",
    )

    assert result == datetime(
        2026,
        8,
        30,
        10,
        30,
    )


def test_rejects_empty_datetime():
    with pytest.raises(
        CsvNormalizationError,
        match="Datetime value cannot be empty",
    ):
        normalize_datetime("   ")


def test_rejects_invalid_iso_datetime():
    with pytest.raises(
        CsvNormalizationError,
        match="Invalid datetime value: not-a-date",
    ):
        normalize_datetime("not-a-date")


def test_rejects_datetime_with_wrong_explicit_format():
    with pytest.raises(
        CsvNormalizationError,
        match="Invalid datetime value: 08/30/2026",
    ):
        normalize_datetime(
            "08/30/2026",
            date_format="%d/%m/%Y",
        )
