from app.services.metric_service import MetricService


def test_metric_service_returns_required_fields():

    service = MetricService()

    result = service.calculate()

    required_fields = [

        "unique_visitors",
        "purchases",
        "revenue",
        "avg_order_value",
        "conversion_rate"

    ]

    for field in required_fields:

        assert field in result


def test_conversion_rate_is_valid():

    service = MetricService()

    result = service.calculate()

    assert result["conversion_rate"] >= 0


def test_revenue_is_numeric():

    service = MetricService()

    result = service.calculate()

    assert isinstance(
        result["revenue"],
        (int, float)
    )


def test_unique_visitors_non_negative():

    service = MetricService()

    result = service.calculate()

    assert result["unique_visitors"] >= 0