PRICING_DATA = {
    "models": {
        "databricks-meta-llama-3-1-405b-instruct": {"inputPer1M": 5.00, "outputPer1M": 15.00, "dbuPerToken": 0.0001},
        "databricks-meta-llama-3-1-70b-instruct": {"inputPer1M": 1.00, "outputPer1M": 3.00, "dbuPerToken": 0.00005},
        "databricks-meta-llama-3-3-70b-instruct": {"inputPer1M": 1.00, "outputPer1M": 3.00, "dbuPerToken": 0.00005},
        "databricks-claude-3-5-sonnet": {"inputPer1M": 3.00, "outputPer1M": 15.00, "dbuPerToken": 0.00008},
        "databricks-gemma-2-27b-it": {"inputPer1M": 0.50, "outputPer1M": 1.50, "dbuPerToken": 0.00003},
        "databricks-dbrx-instruct": {"inputPer1M": 0.75, "outputPer1M": 2.25, "dbuPerToken": 0.00004},
        "databricks-mixtral-8x7b-instruct": {"inputPer1M": 0.50, "outputPer1M": 1.00, "dbuPerToken": 0.00002},
    },
    "lastUpdated": "2025-01-01",
}


def get_pricing_data() -> dict:
    return PRICING_DATA


def refresh_pricing_data() -> dict:
    # In production, this would fetch from Databricks pricing page
    return PRICING_DATA
