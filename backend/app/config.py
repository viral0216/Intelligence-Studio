from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Databricks
    databricks_host: str = ""
    databricks_token: str = ""

    # Azure AD (optional)
    azure_client_id: str = ""
    azure_tenant_id: str = "common"
    azure_redirect_uri: str = "http://localhost:8000/api/azure/auth/callback"

    # Features
    enable_usage_log: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
