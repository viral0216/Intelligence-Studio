import type { HttpMethod } from "@/types/api";

export type JsonSchema = Record<string, unknown>;

export type QueryParamType = "string" | "number" | "boolean" | "enum";

export interface QueryParamSpec {
  name: string;
  type: QueryParamType;
  enumValues?: string[];
  required?: boolean;
  description?: string;
}

export interface ApiEndpoint {
  label: string;
  method: HttpMethod;
  path: string;
  body?: unknown;
  requestBodySchema?: JsonSchema;
  queryParams?: QueryParamSpec[];
  description?: string;
  docs?: {
    summary: string;
    docUrl?: string;
    parameters?: Array<{ name: string; type: string; required?: boolean; description?: string }>;
    relatedEndpoints?: string[];
  };
}

export interface ApiSubcategory {
  name: string;
  endpoints: ApiEndpoint[];
}

export interface ApiCategory {
  name: string;
  icon: string;
  audience?: "workspace" | "account";
  rateLimitNote?: string;
  subcategories?: ApiSubcategory[];
  endpoints?: ApiEndpoint[];
}

export const API_CATALOG: ApiCategory[] = [
  {
    name: "Databricks Workspace",
    icon: "Building2",
    subcategories: [
      {
        name: "Workspace",
        endpoints: [
          {
            label: "List workspace",
            method: "GET",
            path: "/api/2.0/workspace/list?path=/",
            description: "List workspace objects",
            docs: { summary: "List workspace objects and directories", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/list" }
          },
          {
            label: "List workspace (paginated)",
            method: "GET",
            path: "/api/2.0/workspace/list?path=/&page_token=NEXT_PAGE_TOKEN&limit=100",
            description: "Get next page of workspace objects",
            docs: { summary: "List workspace objects with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/list" }
          },
          {
            label: "Get workspace status",
            method: "GET",
            path: "/api/2.0/workspace/get-status?path=/",
            description: "Get object metadata",
            docs: { summary: "Get metadata for a workspace object", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/getstatus" }
          },
          {
            label: "Create folder",
            method: "POST",
            path: "/api/2.0/workspace/mkdirs",
            description: "Create directory",
            body: { path: "/Shared/my-folder" },
            docs: { summary: "Create workspace directory", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/mkdirs" }
          },
          {
            label: "Delete workspace item",
            method: "POST",
            path: "/api/2.0/workspace/delete",
            description: "Delete item",
            body: { path: "/Shared/my-item", recursive: true },
            docs: { summary: "Delete workspace item", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/delete" }
          },
          {
            label: "Export workspace",
            method: "GET",
            path: "/api/2.0/workspace/export?path=/&format=SOURCE",
            description: "Export a notebook or file",
            docs: { summary: "Export workspace item in SOURCE/DBC/HTML", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/export" }
          },
          {
            label: "Export directory",
            method: "GET",
            path: "/api/2.0/workspace/export?path=/Shared&format=DBC&direct_download=true",
            description: "Export directory as DBC",
            docs: { summary: "Export workspace directory", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/export" }
          },
          {
            label: "Import workspace",
            method: "POST",
            path: "/api/2.0/workspace/import",
            description: "Import notebook/file",
            body: { path: "/path", format: "SOURCE", language: "PYTHON" },
            docs: { summary: "Import workspace item", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/import" }
          },
          {
            label: "Import directory",
            method: "POST",
            path: "/api/2.0/workspace/import",
            description: "Import DBC archive",
            body: { path: "/Shared", format: "DBC", content: "BASE64_CONTENT" },
            docs: { summary: "Import workspace directory", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/import" }
          }
        ]
      },
      {
        name: "Notebooks",
        endpoints: [
          {
            label: "Get notebook",
            method: "GET",
            path: "/api/2.0/workspace/get-status?path=/Shared/notebook",
            description: "Get notebook metadata",
            docs: { summary: "Get notebook details", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/getstatus" }
          },
          {
            label: "List notebooks in path",
            method: "GET",
            path: "/api/2.0/workspace/list?path=/Shared",
            description: "List notebooks",
            docs: { summary: "List notebooks in directory", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/list" }
          },
          {
            label: "List notebooks in path (paginated)",
            method: "GET",
            path: "/api/2.0/workspace/list?path=/Shared&page_token=NEXT_PAGE_TOKEN&limit=100",
            description: "Get next page of notebooks",
            docs: { summary: "List notebooks in directory with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/list" }
          },
          {
            label: "Create notebook",
            method: "POST",
            path: "/api/2.0/workspace/import",
            description: "Create notebook",
            body: { path: "/Shared/new-notebook", format: "SOURCE", language: "PYTHON", content: "# New notebook" },
            docs: { summary: "Create notebook", docUrl: "https://docs.databricks.com/api/azure/workspace/workspace/import" }
          }
        ]
      },
      {
        name: "Git Credentials",
        endpoints: [
          { label: "List credentials", method: "GET", path: "/api/2.0/git-credentials", description: "List Git credentials", docs: { summary: "List Git credentials", docUrl: "https://docs.databricks.com/api/azure/workspace/gitcredentials/list" } },
          { label: "Create credential", method: "POST", path: "/api/2.0/git-credentials", description: "Add Git credential", body: { git_provider: "github", git_username: "username", personal_access_token: "token" }, docs: { summary: "Create Git credential", docUrl: "https://docs.databricks.com/api/azure/workspace/gitcredentials/create" } },
          { label: "Update credential", method: "PATCH", path: "/api/2.0/git-credentials/CREDENTIAL_ID", description: "Update Git credential", body: { personal_access_token: "new_token" }, docs: { summary: "Update Git credential", docUrl: "https://docs.databricks.com/api/azure/workspace/gitcredentials/update" } },
          { label: "Delete credential", method: "DELETE", path: "/api/2.0/git-credentials/CREDENTIAL_ID", description: "Remove Git credential", body: {}, docs: { summary: "Delete Git credential", docUrl: "https://docs.databricks.com/api/azure/workspace/gitcredentials/delete" } }
        ]
      },
      {
        name: "Repos",
        endpoints: [
          { label: "List repos", method: "GET", path: "/api/2.0/repos?limit=25", description: "List repos", docs: { summary: "List repos in workspace", docUrl: "https://docs.databricks.com/api/azure/workspace/repos/list" } },
          { label: "List repos (paginated)", method: "GET", path: "/api/2.0/repos?limit=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of repos", docs: { summary: "List repos with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/repos/list" } },
          { label: "Get repo", method: "GET", path: "/api/2.0/repos/REPO_ID", description: "Repo details", docs: { summary: "Get repo details", docUrl: "https://docs.databricks.com/api/azure/workspace/repos/get" } },
          { label: "Create repo", method: "POST", path: "/api/2.0/repos", description: "Link Git repo", body: { url: "https://github.com/user/repo", provider: "github", path: "/Repos/folder" }, docs: { summary: "Create repo", docUrl: "https://docs.databricks.com/api/azure/workspace/repos/create" } },
          { label: "Update repo", method: "PATCH", path: "/api/2.0/repos/REPO_ID", description: "Update branch/tag", body: { branch: "main" }, docs: { summary: "Update repo", docUrl: "https://docs.databricks.com/api/azure/workspace/repos/update" } },
          { label: "Delete repo", method: "DELETE", path: "/api/2.0/repos/REPO_ID", description: "Delete repo", body: {}, docs: { summary: "Delete repo", docUrl: "https://docs.databricks.com/api/azure/workspace/repos/delete" } }
        ]
      },
      {
        name: "Secrets",
        endpoints: [
          { label: "List scopes", method: "GET", path: "/api/2.0/secrets/scopes/list", description: "All secret scopes", docs: { summary: "List secret scopes", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/listscopes" } },
          { label: "List scopes (paginated)", method: "GET", path: "/api/2.0/secrets/scopes/list?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of scopes", docs: { summary: "List secret scopes with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/listscopes" } },
          { label: "Create scope", method: "POST", path: "/api/2.0/secrets/scopes/create", description: "Create secret scope", body: { scope: "my-scope" }, docs: { summary: "Create scope", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/createscope" } },
          { label: "Delete scope", method: "POST", path: "/api/2.0/secrets/scopes/delete", description: "Delete scope", body: { scope: "my-scope" }, docs: { summary: "Delete scope", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/deletescope" } },
          { label: "List secrets", method: "GET", path: "/api/2.0/secrets/list?scope=SCOPE_NAME", description: "List secrets", docs: { summary: "List secrets in scope", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/list" } },
          { label: "List secrets (paginated)", method: "GET", path: "/api/2.0/secrets/list?scope=SCOPE_NAME&page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of secrets", docs: { summary: "List secrets in scope with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/list" } },
          { label: "Put secret", method: "POST", path: "/api/2.0/secrets/put", description: "Store secret", body: { scope: "my-scope", key: "my-key", string_value: "secret-value" }, docs: { summary: "Store secret", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/putsecret" } },
          { label: "Delete secret", method: "POST", path: "/api/2.0/secrets/delete", description: "Delete secret", body: { scope: "my-scope", key: "my-key" }, docs: { summary: "Delete secret", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/deletesecret" } },
          { label: "Get secret metadata", method: "GET", path: "/api/2.0/secrets/get-secret-metadata?scope=SCOPE_NAME&key=KEY_NAME", description: "Get secret metadata", docs: { summary: "Get metadata for a secret", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/getsecretmetadata" } },
          { label: "Put secret ACL", method: "POST", path: "/api/2.0/secrets/acls/put", description: "Set secret ACL", body: { scope: "my-scope", principal: "user@example.com", permission: "READ" }, docs: { summary: "Set secret ACL for a principal", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/putacl" } },
          { label: "Get secret ACL", method: "GET", path: "/api/2.0/secrets/acls/get?scope=SCOPE_NAME&principal=PRINCIPAL", description: "Get secret ACL for principal", docs: { summary: "Get secret ACL", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/getacl" } },
          { label: "List secret ACLs", method: "GET", path: "/api/2.0/secrets/acls/list?scope=SCOPE_NAME", description: "List secret ACLs", docs: { summary: "List secret ACLs for scope", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/listacls" } },
          { label: "Delete secret ACL", method: "POST", path: "/api/2.0/secrets/acls/delete", description: "Delete secret ACL", body: { scope: "my-scope", principal: "user@example.com" }, docs: { summary: "Delete secret ACL for a principal", docUrl: "https://docs.databricks.com/api/azure/workspace/secrets/deleteacl" } }
        ]
      }
    ]
  },
  {
    name: "Apps",
    icon: "AppWindow",
    endpoints: [
      { 
        label: "List apps", 
        method: "GET", 
        path: "/api/2.0/apps", 
        description: "List all apps in workspace", 
        docs: { summary: "Lists all apps in the workspace", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/list" } 
      },
      { 
        label: "List apps (paginated)", 
        method: "GET", 
        path: "/api/2.0/apps?page_token=NEXT_PAGE_TOKEN&limit=100", 
        description: "Get next page of apps", 
        docs: { summary: "Lists apps with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/list" } 
      },
      { 
        label: "Create app", 
        method: "POST", 
        path: "/api/2.0/apps", 
        description: "Create a new app", 
        body: { 
          name: "my-custom-app",
          description: "My app description"
        }, 
        docs: { summary: "Creates a new app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/create" } 
      },
      { 
        label: "Get app", 
        method: "GET", 
        path: "/api/2.0/apps/APP_NAME", 
        description: "Get app details", 
        docs: { summary: "Get details of a specific app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/get" } 
      },
      { 
        label: "Update app", 
        method: "PATCH", 
        path: "/api/2.0/apps/APP_NAME", 
        description: "Update an existing app", 
        body: { 
          description: "Updated description"
        }, 
        docs: { summary: "Updates an existing app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/update" } 
      },
      { 
        label: "Delete app", 
        method: "DELETE", 
        path: "/api/2.0/apps/APP_NAME", 
        description: "Delete an app", 
        body: {}, 
        docs: { summary: "Deletes an app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/delete" } 
      },
      { 
        label: "Start app", 
        method: "POST", 
        path: "/api/2.0/apps/APP_NAME/start", 
        description: "Start an app", 
        body: {}, 
        docs: { summary: "Starts an app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/start" } 
      },
      { 
        label: "Stop app", 
        method: "POST", 
        path: "/api/2.0/apps/APP_NAME/stop", 
        description: "Stop an app", 
        body: {}, 
        docs: { summary: "Stops an app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/stop" } 
      },
      { 
        label: "Deploy app", 
        method: "POST", 
        path: "/api/2.0/apps/APP_NAME/deployments", 
        description: "Create a new deployment", 
        body: { 
          source_code_path: "/Workspace/user@test.com/my_app",
          mode: "SNAPSHOT"
        }, 
        docs: { summary: "Creates a new deployment for an app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/createdeployment" } 
      },
      { 
        label: "List app deployments", 
        method: "GET", 
        path: "/api/2.0/apps/APP_NAME/deployments", 
        description: "List all deployments for an app", 
        docs: { summary: "Lists all deployments for an app", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/listdeployments" } 
      },
      { 
        label: "List app deployments (paginated)", 
        method: "GET", 
        path: "/api/2.0/apps/APP_NAME/deployments?page_token=NEXT_PAGE_TOKEN&limit=100", 
        description: "Get next page of deployments", 
        docs: { summary: "Lists app deployments with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/listdeployments" } 
      },
      { 
        label: "Get app deployment", 
        method: "GET", 
        path: "/api/2.0/apps/APP_NAME/deployments/DEPLOYMENT_ID", 
        description: "Get deployment details", 
        docs: { summary: "Get details of a specific deployment", docUrl: "https://docs.databricks.com/api/azure/workspace/apps/getdeployment" } 
      }
    ]
  },
  {
    name: "Compute",
    icon: "Zap",
    subcategories: [
      {
        name: "Clusters",
        endpoints: [
          { label: "List clusters", method: "GET", path: "/api/2.0/clusters/list", description: "All clusters", docs: { summary: "List clusters", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/list" } },
          { label: "List clusters (paginated)", method: "GET", path: "/api/2.0/clusters/list?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of clusters", docs: { summary: "List clusters with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/list" } },
          { label: "Get cluster info", method: "GET", path: "/api/2.0/clusters/get?cluster_id=CLUSTER_ID", description: "Cluster details", docs: { summary: "Get cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/get" } },
          { label: "Get cluster permissions", method: "GET", path: "/api/2.0/permissions/clusters/CLUSTER_ID", description: "View ACLs for a cluster", docs: { summary: "Get cluster permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpermissions/get" } },
          { label: "Set cluster permissions", method: "PUT", path: "/api/2.0/permissions/clusters/CLUSTER_ID", description: "Replace cluster ACLs", body: { access_control_list: [] }, docs: { summary: "Set cluster permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpermissions/set" } },
          { label: "Update cluster permissions", method: "PATCH", path: "/api/2.0/permissions/clusters/CLUSTER_ID", description: "Update cluster ACLs", body: { access_control_list: [] }, docs: { summary: "Update cluster permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpermissions/update" } },
          { label: "Get cluster permission levels", method: "GET", path: "/api/2.0/permissions/clusters/levels", description: "Supported permission levels", docs: { summary: "Get cluster permission levels", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpermissions/getpermissionlevels" } },
          { label: "Create new cluster", method: "POST", path: "/api/2.0/clusters/create", description: "Create cluster", body: { cluster_name: "my-cluster", spark_version: "13.3.x-scala2.12", node_type_id: "Standard_DS3_v2", num_workers: 2 }, docs: { summary: "Create cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/create" } },
          { label: "Update cluster configuration", method: "POST", path: "/api/2.0/clusters/edit", description: "Edit cluster config", body: { cluster_id: "CLUSTER_ID", cluster_name: "updated-cluster", spark_version: "13.3.x-scala2.12", node_type_id: "Standard_DS3_v2", num_workers: 4 }, docs: { summary: "Edit cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/edit" } },
          { label: "Update cluster", method: "PATCH", path: "/api/2.0/clusters/update", description: "Partial cluster update", body: { cluster_id: "CLUSTER_ID", num_workers: 3 }, docs: { summary: "Update cluster configuration", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/update" } },
          { label: "Change cluster owner", method: "POST", path: "/api/2.0/clusters/change-owner", description: "Transfer cluster ownership", body: { cluster_id: "CLUSTER_ID", owner_username: "user@example.com" }, docs: { summary: "Change cluster owner", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/changeowner" } },
          { label: "Start terminated cluster", method: "POST", path: "/api/2.0/clusters/start", description: "Start a terminated cluster", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Start terminated cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/start" } },
          { label: "Restart cluster", method: "POST", path: "/api/2.0/clusters/restart", description: "Restart cluster", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Restart cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/restart" } },
          { label: "Repair cluster", method: "POST", path: "/api/2.0/clusters/repair", description: "Repair cluster", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Repair cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/repair" } },
          { label: "Terminate cluster", method: "POST", path: "/api/2.0/clusters/delete", description: "Terminate cluster", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Terminate cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/delete" } },
          { label: "Permanent delete cluster", method: "POST", path: "/api/2.0/clusters/permanent-delete", description: "Permanently delete", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Permanent delete cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/permanentdelete" } },
          { label: "Resize cluster", method: "POST", path: "/api/2.0/clusters/resize", description: "Resize cluster", body: { cluster_id: "CLUSTER_ID", num_workers: 10 }, docs: { summary: "Resize cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/resize" } },
          { label: "Pin cluster", method: "POST", path: "/api/2.0/clusters/pin", description: "Pin cluster", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Pin cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/pin" } },
          { label: "Unpin cluster", method: "POST", path: "/api/2.0/clusters/unpin", description: "Unpin cluster", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Unpin cluster", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/unpin" } },
          { label: "List cluster activity events", method: "POST", path: "/api/2.0/clusters/events", description: "Cluster events", body: { cluster_id: "CLUSTER_ID" }, docs: { summary: "Cluster events", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/events" } },
          { label: "List node types", method: "GET", path: "/api/2.0/clusters/list-node-types", description: "Node types", docs: { summary: "List node types", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/listnodetypes" } },
          { label: "List available Spark versions", method: "GET", path: "/api/2.0/clusters/spark-versions", description: "Spark versions", docs: { summary: "List Spark versions", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/sparkversions" } },
          { label: "List available Spark versions (paginated)", method: "GET", path: "/api/2.0/clusters/spark-versions?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of Spark versions", docs: { summary: "List Spark versions with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/sparkversions" } },
          { label: "List zones", method: "GET", path: "/api/2.0/clusters/list-zones", description: "List availability zones", docs: { summary: "List zones", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/listzones" } },
          { label: "List zones (paginated)", method: "GET", path: "/api/2.0/clusters/list-zones?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of zones", docs: { summary: "List zones with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/clusters/listzones" } }
        ]
      },
      {
        name: "Cluster Policies",
        endpoints: [
          { label: "List cluster policies", method: "GET", path: "/api/2.0/policies/clusters/list", description: "Cluster policies", docs: { summary: "List cluster policies", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpolicies/list" } },
          { label: "List cluster policies (paginated)", method: "GET", path: "/api/2.0/policies/clusters/list?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of policies", docs: { summary: "List cluster policies with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpolicies/list" } },
          { label: "Get cluster policy", method: "GET", path: "/api/2.0/policies/clusters/get?policy_id=POLICY_ID", description: "Get policy details", docs: { summary: "Get cluster policy", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpolicies/get" } },
          { label: "Create cluster policy", method: "POST", path: "/api/2.0/policies/clusters/create", description: "Create policy", body: { name: "my-policy", definition: "{\"spark_conf.spark.databricks.io.cache.enabled\": {\"type\": \"fixed\", \"value\": true}}" }, docs: { summary: "Create cluster policy", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpolicies/create" } },
          { label: "Edit cluster policy", method: "POST", path: "/api/2.0/policies/clusters/edit", description: "Update policy", body: { policy_id: "POLICY_ID", name: "updated-policy", definition: "{}" }, docs: { summary: "Edit cluster policy", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpolicies/edit" } },
          { label: "Delete cluster policy", method: "POST", path: "/api/2.0/policies/clusters/delete", description: "Delete policy", body: { policy_id: "POLICY_ID" }, docs: { summary: "Delete cluster policy", docUrl: "https://docs.databricks.com/api/azure/workspace/clusterpolicies/delete" } }
        ]
      },
      {
        name: "Instance Pools",
        endpoints: [
          { label: "List pools", method: "GET", path: "/api/2.0/instance-pools/list", description: "Instance pools", docs: { summary: "List pools", docUrl: "https://docs.databricks.com/api/azure/workspace/instancepools/list" } },
          { label: "List pools (paginated)", method: "GET", path: "/api/2.0/instance-pools/list?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of pools", docs: { summary: "List instance pools with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/instancepools/list" } },
          { label: "Get pool", method: "GET", path: "/api/2.0/instance-pools/get?instance_pool_id=POOL_ID", description: "Pool details", docs: { summary: "Get pool", docUrl: "https://docs.databricks.com/api/azure/workspace/instancepools/get" } },
          { label: "Create pool", method: "POST", path: "/api/2.0/instance-pools/create", description: "Create pool", body: { instance_pool_name: "my-pool", node_type_id: "Standard_DS3_v2", min_idle_instances: 0, max_capacity: 10 }, docs: { summary: "Create pool", docUrl: "https://docs.databricks.com/api/azure/workspace/instancepools/create" } },
          { label: "Edit pool", method: "POST", path: "/api/2.0/instance-pools/edit", description: "Update pool", body: { instance_pool_id: "POOL_ID", instance_pool_name: "updated-pool" }, docs: { summary: "Edit pool", docUrl: "https://docs.databricks.com/api/azure/workspace/instancepools/edit" } },
          { label: "Delete pool", method: "POST", path: "/api/2.0/instance-pools/delete", description: "Delete pool", body: { instance_pool_id: "POOL_ID" }, docs: { summary: "Delete pool", docUrl: "https://docs.databricks.com/api/azure/workspace/instancepools/delete" } }
        ]
      },
      {
        name: "Libraries",
        endpoints: [
          { label: "Cluster libraries status", method: "GET", path: "/api/2.0/libraries/cluster-status?cluster_id=CLUSTER_ID", description: "Libraries on cluster", docs: { summary: "Cluster library status", docUrl: "https://docs.databricks.com/api/azure/workspace/libraries/clusterstatus" } },
          { label: "All libraries status", method: "GET", path: "/api/2.0/libraries/all-cluster-statuses", description: "Libraries across clusters", docs: { summary: "All cluster library status", docUrl: "https://docs.databricks.com/api/azure/workspace/libraries/allclusterstatuses" } },
          { label: "Install libraries", method: "POST", path: "/api/2.0/libraries/install", description: "Install libraries", body: { cluster_id: "CLUSTER_ID", libraries: [{ pypi: { package: "pandas" } }] }, docs: { summary: "Install libraries", docUrl: "https://docs.databricks.com/api/azure/workspace/libraries/install" } },
          { label: "Uninstall libraries", method: "POST", path: "/api/2.0/libraries/uninstall", description: "Uninstall libraries", body: { cluster_id: "CLUSTER_ID", libraries: [{ pypi: { package: "pandas" } }] }, docs: { summary: "Uninstall libraries", docUrl: "https://docs.databricks.com/api/azure/workspace/libraries/uninstall" } }
        ]
      },
      {
        name: "Global Init Scripts",
        endpoints: [
          { label: "List global init scripts", method: "GET", path: "/api/2.0/global-init-scripts", description: "Global init scripts", docs: { summary: "List global init scripts", docUrl: "https://docs.databricks.com/api/azure/workspace/globalinitscripts/list" } },
          { label: "List global init scripts (paginated)", method: "GET", path: "/api/2.0/global-init-scripts?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of init scripts", docs: { summary: "List global init scripts with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/globalinitscripts/list" } },
          { label: "Get global init script", method: "GET", path: "/api/2.0/global-init-scripts/SCRIPT_ID", description: "Script details", docs: { summary: "Get global init script", docUrl: "https://docs.databricks.com/api/azure/workspace/globalinitscripts/get" } },
          { label: "Create global init script", method: "POST", path: "/api/2.0/global-init-scripts", description: "Create script", body: { name: "my-init-script", script: "#!/bin/bash\necho 'Hello World'", enabled: true }, docs: { summary: "Create global init script", docUrl: "https://docs.databricks.com/api/azure/workspace/globalinitscripts/create" } },
          { label: "Update global init script", method: "PATCH", path: "/api/2.0/global-init-scripts/SCRIPT_ID", description: "Update script", body: { enabled: false }, docs: { summary: "Update global init script", docUrl: "https://docs.databricks.com/api/azure/workspace/globalinitscripts/update" } },
          { label: "Delete global init script", method: "DELETE", path: "/api/2.0/global-init-scripts/SCRIPT_ID", description: "Delete script", body: {}, docs: { summary: "Delete global init script", docUrl: "https://docs.databricks.com/api/azure/workspace/globalinitscripts/delete" } }
        ]
      },
      {
        name: "Command Execution",
        endpoints: [
          { label: "Create context", method: "POST", path: "/api/1.2/contexts/create", description: "Create execution context", body: { clusterId: "CLUSTER_ID", language: "python" }, docs: { summary: "Create command context", docUrl: "https://docs.databricks.com/api/azure/workspace/commandexecution/create" } },
          { label: "Execute command", method: "POST", path: "/api/1.2/commands/execute", description: "Run command", body: { clusterId: "CLUSTER_ID", contextId: "CONTEXT_ID", language: "python", command: "print('Hello')" }, docs: { summary: "Execute command", docUrl: "https://docs.databricks.com/api/azure/workspace/commandexecution/execute" } },
          { label: "Get command status", method: "GET", path: "/api/1.2/commands/status?clusterId=CLUSTER_ID&contextId=CONTEXT_ID&commandId=COMMAND_ID", description: "Command status", docs: { summary: "Command status", docUrl: "https://docs.databricks.com/api/azure/workspace/commandexecution/commandstatus" } },
          { label: "Cancel command", method: "POST", path: "/api/1.2/commands/cancel", description: "Cancel command", body: { clusterId: "CLUSTER_ID", contextId: "CONTEXT_ID", commandId: "COMMAND_ID" }, docs: { summary: "Cancel command", docUrl: "https://docs.databricks.com/api/azure/workspace/commandexecution/cancel" } },
          { label: "Destroy context", method: "POST", path: "/api/1.2/contexts/destroy", description: "Destroy context", body: { clusterId: "CLUSTER_ID", contextId: "CONTEXT_ID" }, docs: { summary: "Destroy command context", docUrl: "https://docs.databricks.com/api/azure/workspace/commandexecution/destroy" } }
        ]
      }
    ]
  },
  {
    name: "Lakeflow",
    icon: "Waves",
    subcategories: [
      {
        name: "Jobs",
        endpoints: [
          { label: "List jobs", method: "GET", path: "/api/2.1/jobs/list?limit=25&expand_tasks=true", description: "List jobs with full task details", docs: { summary: "List jobs with tasks expanded", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/list" } },
          { label: "List jobs (paginated)", method: "GET", path: "/api/2.1/jobs/list?limit=25&expand_tasks=true&page_token=NEXT_PAGE_TOKEN", description: "Get next page of jobs using pagination token", docs: { summary: "Get next page of jobs using pagination token from previous response", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/list" } },
          { label: "Get job", method: "GET", path: "/api/2.1/jobs/get?job_id=JOB_ID", description: "Job details", docs: { summary: "Get job", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/get" } },
          { label: "Create job", method: "POST", path: "/api/2.1/jobs/create", description: "Create job", body: { name: "my-job", tasks: [{ task_key: "main", notebook_task: { notebook_path: "/Shared/notebook" }, existing_cluster_id: "CLUSTER_ID" }] }, docs: { summary: "Create job", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/create" } },
          { label: "Update job", method: "POST", path: "/api/2.1/jobs/update", description: "Update job", body: { job_id: "JOB_ID", new_settings: { name: "updated-name" } }, docs: { summary: "Update job", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/update" } },
          { label: "Reset job", method: "POST", path: "/api/2.1/jobs/reset", description: "Reset job config", body: { job_id: "JOB_ID", new_settings: { name: "reset-job", tasks: [] } }, docs: { summary: "Reset job", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/reset" } },
          { label: "Delete job", method: "POST", path: "/api/2.1/jobs/delete", description: "Delete job", body: { job_id: "JOB_ID" }, docs: { summary: "Delete job", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/delete" } },
          { label: "Run now", method: "POST", path: "/api/2.1/jobs/run-now", description: "Run job now", body: { job_id: "JOB_ID" }, docs: { summary: "Run now", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/runnow" } },
          { label: "Submit run", method: "POST", path: "/api/2.1/jobs/runs/submit", description: "Submit one-time run", body: { run_name: "my-run", tasks: [{ task_key: "main", notebook_task: { notebook_path: "/Shared/notebook" }, new_cluster: { spark_version: "13.3.x-scala2.12", node_type_id: "Standard_DS3_v2", num_workers: 2 } }] }, docs: { summary: "Submit run", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/submit" } },
          { label: "List runs", method: "GET", path: "/api/2.1/jobs/runs/list?limit=25", description: "List job runs", docs: { summary: "List runs", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/listruns" } },
          { label: "List runs (paginated)", method: "GET", path: "/api/2.1/jobs/runs/list?limit=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of job runs", docs: { summary: "List runs with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/listruns" } },
          { label: "Get run", method: "GET", path: "/api/2.1/jobs/runs/get?run_id=RUN_ID", description: "Run details", docs: { summary: "Get run", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/getrun" } },
          { label: "Cancel run", method: "POST", path: "/api/2.1/jobs/runs/cancel", description: "Cancel job run", body: { run_id: "RUN_ID" }, docs: { summary: "Cancel run", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/cancelrun" } },
          { label: "Cancel all runs", method: "POST", path: "/api/2.1/jobs/runs/cancel-all", description: "Cancel all runs", body: { job_id: "JOB_ID" }, docs: { summary: "Cancel all runs", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/cancelallruns" } },
          { label: "Delete run", method: "POST", path: "/api/2.1/jobs/runs/delete", description: "Delete run", body: { run_id: "RUN_ID" }, docs: { summary: "Delete run", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/deleterun" } },
          { label: "Repair run", method: "POST", path: "/api/2.1/jobs/runs/repair", description: "Repair failed run", body: { run_id: "RUN_ID", rerun_tasks: ["task_key"] }, docs: { summary: "Repair run", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/repairrun" } },
          { label: "Get run output", method: "GET", path: "/api/2.1/jobs/runs/get-output?run_id=RUN_ID", description: "Run output", docs: { summary: "Get run output", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/getrunoutput" } },
          { label: "Export run", method: "GET", path: "/api/2.1/jobs/runs/export?run_id=RUN_ID", description: "Export run", docs: { summary: "Export run", docUrl: "https://docs.databricks.com/api/azure/workspace/jobs/exportrun" } }
        ]
      },
      {
        name: "Delta Live Tables",
        endpoints: [
          { label: "List pipelines", method: "GET", path: "/api/2.0/pipelines?max_results=25", description: "List DLT pipelines", docs: { summary: "List pipelines", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/listpipelines" } },
          { label: "List pipelines (paginated)", method: "GET", path: "/api/2.0/pipelines?max_results=25&page_token=NEXT_PAGE_TOKEN", description: "Get next page of DLT pipelines", docs: { summary: "List pipelines with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/listpipelines" } },
          { label: "Get pipeline", method: "GET", path: "/api/2.0/pipelines/PIPELINE_ID", description: "Pipeline details", docs: { summary: "Get pipeline", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/get" } },
          { label: "Create pipeline", method: "POST", path: "/api/2.0/pipelines", description: "Create DLT pipeline", body: { name: "my-pipeline", storage: "/pipelines/storage", configuration: {}, clusters: [{ label: "default", num_workers: 2 }], libraries: [{ notebook: { path: "/notebook" } }] }, docs: { summary: "Create pipeline", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/create" } },
          { label: "Start pipeline", method: "POST", path: "/api/2.0/pipelines/PIPELINE_ID/updates", description: "Start pipeline update", body: {}, docs: { summary: "Start pipeline", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/startupdate" } },
          { label: "Stop pipeline", method: "POST", path: "/api/2.0/pipelines/PIPELINE_ID/stop", description: "Stop pipeline", body: {}, docs: { summary: "Stop pipeline", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/stop" } },
          { label: "Update pipeline", method: "PUT", path: "/api/2.0/pipelines/PIPELINE_ID", description: "Update pipeline configuration", body: { pipeline_id: "PIPELINE_ID" }, docs: { summary: "Update pipeline", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/update" } },
          { label: "Get pipeline update", method: "GET", path: "/api/2.0/pipelines/PIPELINE_ID/updates/UPDATE_ID", description: "Get pipeline update details", docs: { summary: "Get pipeline update", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/getupdates" } },
          { label: "Get pipeline events", method: "GET", path: "/api/2.0/pipelines/PIPELINE_ID/events", description: "Get pipeline events", docs: { summary: "Get pipeline events", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/listevents" } },
          { label: "Delete pipeline", method: "DELETE", path: "/api/2.0/pipelines/PIPELINE_ID", description: "Delete pipeline", body: {}, docs: { summary: "Delete pipeline", docUrl: "https://docs.databricks.com/api/azure/workspace/pipelines/delete" } }
        ]
      }
    ]
  },
  {
    name: "File Management",
    icon: "FolderOpen",
    subcategories: [
      {
        name: "Files API",
        endpoints: [
          { label: "Download file", method: "GET", path: "/api/2.0/fs/files/Volumes/CATALOG/SCHEMA/VOLUME/path/to/file", description: "Download file content", docs: { summary: "Download file from Volumes or workspace", docUrl: "https://docs.databricks.com/api/azure/workspace/files/download" } },
          { label: "Upload file", method: "PUT", path: "/api/2.0/fs/files/Volumes/CATALOG/SCHEMA/VOLUME/path/to/file", description: "Upload file content", body: {}, docs: { summary: "Upload file to Volumes or workspace", docUrl: "https://docs.databricks.com/api/azure/workspace/files/upload" } },
          { label: "Delete file", method: "DELETE", path: "/api/2.0/fs/files/Volumes/CATALOG/SCHEMA/VOLUME/path/to/file", description: "Delete a file", body: {}, docs: { summary: "Delete file from Volumes or workspace", docUrl: "https://docs.databricks.com/api/azure/workspace/files/delete" } },
          { label: "Get file metadata (HEAD)", method: "GET", path: "/api/2.0/fs/files-metadata/Volumes/CATALOG/SCHEMA/VOLUME/path/to/file", description: "Get file metadata (actual API uses HEAD on /api/2.0/fs/files/{path})", docs: { summary: "Get file metadata via HEAD request", docUrl: "https://docs.databricks.com/api/azure/workspace/files/getmetadata" } },
          { label: "List directory", method: "GET", path: "/api/2.0/fs/directories/Volumes/CATALOG/SCHEMA/VOLUME/path/", description: "List directory contents", docs: { summary: "List directory contents", docUrl: "https://docs.databricks.com/api/azure/workspace/files/listdirectorycontents" } },
          { label: "List directory (paginated)", method: "GET", path: "/api/2.0/fs/directories/Volumes/CATALOG/SCHEMA/VOLUME/path/?page_token=NEXT_PAGE_TOKEN", description: "Get next page of directory listing", docs: { summary: "List directory contents with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/files/listdirectorycontents" } },
          { label: "Create directory", method: "PUT", path: "/api/2.0/fs/directories/Volumes/CATALOG/SCHEMA/VOLUME/path/new-dir/", description: "Create a directory", body: {}, docs: { summary: "Create a directory", docUrl: "https://docs.databricks.com/api/azure/workspace/files/createdirectory" } },
          { label: "Delete directory", method: "DELETE", path: "/api/2.0/fs/directories/Volumes/CATALOG/SCHEMA/VOLUME/path/dir/", description: "Delete a directory", body: {}, docs: { summary: "Delete a directory", docUrl: "https://docs.databricks.com/api/azure/workspace/files/deletedirectory" } }
        ]
      },
      {
        name: "DBFS",
        endpoints: [
          { label: "List DBFS", method: "GET", path: "/api/2.0/dbfs/list?path=/", description: "List files", docs: { summary: "List DBFS path", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/list" } },
          { label: "List DBFS (paginated)", method: "GET", path: "/api/2.0/dbfs/list?path=/&page_token=NEXT_PAGE_TOKEN", description: "Get next page of files for path", docs: { summary: "List DBFS path with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/list" } },
          { label: "Get file status", method: "GET", path: "/api/2.0/dbfs/get-status?path=/path/to/file", description: "File metadata", docs: { summary: "Get DBFS file status", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/getstatus" } },
          { label: "Create directory", method: "POST", path: "/api/2.0/dbfs/mkdirs", description: "Create directory", body: { path: "/my-folder" }, docs: { summary: "Create DBFS directory", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/mkdirs" } },
          { label: "Delete file", method: "POST", path: "/api/2.0/dbfs/delete", description: "Delete file/directory", body: { path: "/path/to/delete", recursive: false }, docs: { summary: "Delete DBFS path", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/delete" } },
          { label: "Create file", method: "POST", path: "/api/2.0/dbfs/create", description: "Create file and get handle", body: { path: "/path/to/file", overwrite: false }, docs: { summary: "Create file and get handle", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/create" } },
          { label: "Add file block", method: "POST", path: "/api/2.0/dbfs/add-block", description: "Add data block to file", body: { handle: "FILE_HANDLE", data: "BASE64_ENCODED_DATA" }, docs: { summary: "Add block to file", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/addblock" } },
          { label: "Close file", method: "POST", path: "/api/2.0/dbfs/close", description: "Close file handle after writing", body: { handle: "FILE_HANDLE" }, docs: { summary: "Close DBFS file handle", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/close" } },
          { label: "Get file content", method: "GET", path: "/api/2.0/dbfs/get?path=/path/to/file", description: "Get file content", docs: { summary: "Get DBFS file content", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/get" } },
          { label: "Move file", method: "POST", path: "/api/2.0/dbfs/move", description: "Move/rename file", body: { source_path: "/old", destination_path: "/new" }, docs: { summary: "Move DBFS file", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/move" } },
          { label: "Put file (small)", method: "POST", path: "/api/2.0/dbfs/put", description: "Upload small file directly", body: { path: "/path/to/file", contents: "BASE64_CONTENT", overwrite: true }, docs: { summary: "Upload small file to DBFS", docUrl: "https://docs.databricks.com/api/azure/workspace/dbfs/put" } }
        ]
      }
    ]
  },
  {
    name: "Unity Catalog",
    icon: "Library",
    subcategories: [
      {
        name: "Catalogs",
        endpoints: [
          { label: "List catalogs", method: "GET", path: "/api/2.1/unity-catalog/catalogs?max_results=100", description: "List all catalogs", docs: { summary: "List catalogs", docUrl: "https://docs.databricks.com/api/azure/workspace/catalogs/list" } },
          { label: "List catalogs (paginated)", method: "GET", path: "/api/2.1/unity-catalog/catalogs?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of catalogs", docs: { summary: "List catalogs with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/catalogs/list" } },
          { label: "Get catalog", method: "GET", path: "/api/2.1/unity-catalog/catalogs/CATALOG_NAME", description: "Get catalog details", docs: { summary: "Get catalog", docUrl: "https://docs.databricks.com/api/azure/workspace/catalogs/get" } },
          { label: "Create catalog", method: "POST", path: "/api/2.1/unity-catalog/catalogs", description: "Create new catalog", body: { name: "my_catalog", comment: "My catalog" }, docs: { summary: "Create catalog", docUrl: "https://docs.databricks.com/api/azure/workspace/catalogs/create" } },
          { label: "Update catalog", method: "PATCH", path: "/api/2.1/unity-catalog/catalogs/CATALOG_NAME", description: "Update catalog", body: { comment: "Updated comment" }, docs: { summary: "Update catalog", docUrl: "https://docs.databricks.com/api/azure/workspace/catalogs/update" } },
          { label: "Delete catalog", method: "DELETE", path: "/api/2.1/unity-catalog/catalogs/CATALOG_NAME?force=true", description: "Delete catalog", body: {}, docs: { summary: "Delete catalog", docUrl: "https://docs.databricks.com/api/azure/workspace/catalogs/delete" } }
        ]
      },
      {
        name: "Schemas",
        endpoints: [
          { label: "List schemas", method: "GET", path: "/api/2.1/unity-catalog/schemas?catalog_name=CATALOG&max_results=100", description: "List schemas", docs: { summary: "List schemas", docUrl: "https://docs.databricks.com/api/azure/workspace/schemas/list" } },
          { label: "List schemas (paginated)", method: "GET", path: "/api/2.1/unity-catalog/schemas?catalog_name=CATALOG&max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of schemas", docs: { summary: "List schemas with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/schemas/list" } },
          { label: "Get schema", method: "GET", path: "/api/2.1/unity-catalog/schemas/CATALOG.SCHEMA", description: "Get schema details", docs: { summary: "Get schema", docUrl: "https://docs.databricks.com/api/azure/workspace/schemas/get" } },
          { label: "Create schema", method: "POST", path: "/api/2.1/unity-catalog/schemas", description: "Create schema", body: { name: "my_schema", catalog_name: "my_catalog", comment: "My schema" }, docs: { summary: "Create schema", docUrl: "https://docs.databricks.com/api/azure/workspace/schemas/create" } },
          { label: "Update schema", method: "PATCH", path: "/api/2.1/unity-catalog/schemas/CATALOG.SCHEMA", description: "Update schema", body: { comment: "Updated comment" }, docs: { summary: "Update schema", docUrl: "https://docs.databricks.com/api/azure/workspace/schemas/update" } },
          { label: "Delete schema", method: "DELETE", path: "/api/2.1/unity-catalog/schemas/CATALOG.SCHEMA?force=true", description: "Delete schema", body: {}, docs: { summary: "Delete schema", docUrl: "https://docs.databricks.com/api/azure/workspace/schemas/delete" } }
        ]
      },
      {
        name: "Tables",
        endpoints: [
          { label: "List tables", method: "GET", path: "/api/2.1/unity-catalog/tables?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100", description: "List tables", docs: { summary: "List tables", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/list" } },
          { label: "List tables (paginated)", method: "GET", path: "/api/2.1/unity-catalog/tables?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of tables", docs: { summary: "List tables with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/list" } },
          { label: "Get table", method: "GET", path: "/api/2.1/unity-catalog/tables/CATALOG.SCHEMA.TABLE", description: "Get table details", docs: { summary: "Get table", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/get" } },
          { label: "Create table", method: "POST", path: "/api/2.1/unity-catalog/tables", description: "Create table", body: { name: "my_table", catalog_name: "my_catalog", schema_name: "my_schema", table_type: "EXTERNAL", data_source_format: "DELTA", columns: [{ name: "id", type_text: "INT", comment: "ID column" }] }, docs: { summary: "Create table", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/create" } },
          { label: "Update table", method: "PATCH", path: "/api/2.1/unity-catalog/tables/CATALOG.SCHEMA.TABLE", description: "Update table", body: { comment: "Updated table" }, docs: { summary: "Update table", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/update" } },
          { label: "Delete table", method: "DELETE", path: "/api/2.1/unity-catalog/tables/CATALOG.SCHEMA.TABLE", description: "Delete table", body: {}, docs: { summary: "Delete table", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/delete" } },
          { label: "List table columns", method: "GET", path: "/api/2.1/unity-catalog/tables/CATALOG.SCHEMA.TABLE/columns", description: "List table columns", docs: { summary: "List table columns", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/listcolumns" } },
          { label: "Get table column", method: "GET", path: "/api/2.1/unity-catalog/tables/CATALOG.SCHEMA.TABLE/columns/COLUMN_NAME", description: "Get column details", docs: { summary: "Get table column", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/getcolumn" } },
          { label: "Update table column", method: "PATCH", path: "/api/2.1/unity-catalog/tables/CATALOG.SCHEMA.TABLE/columns/COLUMN_NAME", description: "Update column metadata", body: { comment: "Updated column description", type_text: "STRING" }, docs: { summary: "Update table column", docUrl: "https://docs.databricks.com/api/azure/workspace/tables/updatecolumn" } }
        ]
      },
      {
        name: "Volumes",
        endpoints: [
          { label: "List volumes", method: "GET", path: "/api/2.1/unity-catalog/volumes?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100", description: "List volumes", docs: { summary: "List volumes", docUrl: "https://docs.databricks.com/api/azure/workspace/volumes/list" } },
          { label: "List volumes (paginated)", method: "GET", path: "/api/2.1/unity-catalog/volumes?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of volumes", docs: { summary: "List volumes with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/volumes/list" } },
          { label: "Get volume", method: "GET", path: "/api/2.1/unity-catalog/volumes/CATALOG.SCHEMA.VOLUME", description: "Get volume details", docs: { summary: "Get volume", docUrl: "https://docs.databricks.com/api/azure/workspace/volumes/read" } },
          { label: "Create volume", method: "POST", path: "/api/2.1/unity-catalog/volumes", description: "Create volume", body: { name: "my_volume", catalog_name: "my_catalog", schema_name: "my_schema", volume_type: "EXTERNAL", storage_location: "s3://bucket/path" }, docs: { summary: "Create volume", docUrl: "https://docs.databricks.com/api/azure/workspace/volumes/create" } },
          { label: "Update volume", method: "PATCH", path: "/api/2.1/unity-catalog/volumes/CATALOG.SCHEMA.VOLUME", description: "Update volume", body: { comment: "Updated volume" }, docs: { summary: "Update volume", docUrl: "https://docs.databricks.com/api/azure/workspace/volumes/update" } },
          { label: "Delete volume", method: "DELETE", path: "/api/2.1/unity-catalog/volumes/CATALOG.SCHEMA.VOLUME", description: "Delete volume", body: {}, docs: { summary: "Delete volume", docUrl: "https://docs.databricks.com/api/azure/workspace/volumes/delete" } }
        ]
      },
      {
        name: "Functions",
        endpoints: [
          { label: "List functions", method: "GET", path: "/api/2.1/unity-catalog/functions?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100", description: "List functions", docs: { summary: "List functions", docUrl: "https://docs.databricks.com/api/azure/workspace/functions/list" } },
          { label: "List functions (paginated)", method: "GET", path: "/api/2.1/unity-catalog/functions?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of functions", docs: { summary: "List functions with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/functions/list" } },
          { label: "Get function", method: "GET", path: "/api/2.1/unity-catalog/functions/CATALOG.SCHEMA.FUNCTION", description: "Get function details", docs: { summary: "Get function", docUrl: "https://docs.databricks.com/api/azure/workspace/functions/get" } },
          { label: "Create function", method: "POST", path: "/api/2.1/unity-catalog/functions", description: "Create function", body: { name: "my_function", catalog_name: "my_catalog", schema_name: "my_schema", input_params: { parameters: [] }, data_type: "INT", full_data_type: "INT", routine_body: "SQL", routine_definition: "SELECT 1" }, docs: { summary: "Create function", docUrl: "https://docs.databricks.com/api/azure/workspace/functions/create" } },
          { label: "Update function", method: "PATCH", path: "/api/2.1/unity-catalog/functions/CATALOG.SCHEMA.FUNCTION", description: "Update function", body: { comment: "Updated function" }, docs: { summary: "Update function", docUrl: "https://docs.databricks.com/api/azure/workspace/functions/update" } },
          { label: "Delete function", method: "DELETE", path: "/api/2.1/unity-catalog/functions/CATALOG.SCHEMA.FUNCTION?force=true", description: "Delete function", body: {}, docs: { summary: "Delete function", docUrl: "https://docs.databricks.com/api/azure/workspace/functions/delete" } }
        ]
      },
      {
        name: "Permissions & Grants",
        endpoints: [
          { label: "Get effective permissions", method: "GET", path: "/api/2.1/unity-catalog/effective-permissions/CATALOG.SCHEMA.TABLE", description: "Get effective permissions", docs: { summary: "Get effective permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/grants/geteffective" } },
          { label: "Get grants", method: "GET", path: "/api/2.1/unity-catalog/permissions/CATALOG.SCHEMA.TABLE", description: "Get grants on securable", docs: { summary: "Get grants", docUrl: "https://docs.databricks.com/api/azure/workspace/grants/get" } },
          { label: "Update grants", method: "PATCH", path: "/api/2.1/unity-catalog/permissions/CATALOG.SCHEMA.TABLE", description: "Update grants", body: { changes: [{ principal: "user@example.com", add: ["SELECT", "MODIFY"] }] }, docs: { summary: "Update grants", docUrl: "https://docs.databricks.com/api/azure/workspace/grants/update" } }
        ]
      },
      {
        name: "Metastores",
        endpoints: [
          { label: "List metastores", method: "GET", path: "/api/2.1/unity-catalog/metastores", description: "List metastores", docs: { summary: "List metastores", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/list" } },
          { label: "List metastores (paginated)", method: "GET", path: "/api/2.1/unity-catalog/metastores?page_token=NEXT_PAGE_TOKEN&max_results=100", description: "Get next page of metastores", docs: { summary: "List metastores with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/list" } },
          { label: "Get metastore", method: "GET", path: "/api/2.1/unity-catalog/metastores/METASTORE_ID", description: "Get metastore details", docs: { summary: "Get metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/get" } },
          { label: "Create metastore", method: "POST", path: "/api/2.1/unity-catalog/metastores", description: "Create metastore", body: { name: "my-metastore", storage_root: "s3://bucket/path", region: "us-east-1" }, docs: { summary: "Create metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/create" } },
          { label: "Update metastore", method: "PATCH", path: "/api/2.1/unity-catalog/metastores/METASTORE_ID", description: "Update metastore", body: { name: "updated-metastore" }, docs: { summary: "Update metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/update" } },
          { label: "Delete metastore", method: "DELETE", path: "/api/2.1/unity-catalog/metastores/METASTORE_ID?force=true", description: "Delete metastore", body: {}, docs: { summary: "Delete metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/delete" } },
          { label: "Get metastore summary", method: "GET", path: "/api/2.1/unity-catalog/metastore_summary", description: "Get current metastore summary", docs: { summary: "Get metastore summary", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/summary" } },
          { label: "Assign metastore to workspace", method: "PUT", path: "/api/2.1/unity-catalog/workspaces/WORKSPACE_ID/metastore", description: "Assign metastore to workspace", body: { metastore_id: "METASTORE_ID" }, docs: { summary: "Assign metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/assignmetastore" } },
          { label: "Unassign metastore from workspace", method: "DELETE", path: "/api/2.1/unity-catalog/workspaces/WORKSPACE_ID/metastore", description: "Unassign metastore from workspace", body: {}, docs: { summary: "Unassign metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/metastores/unassignmetastore" } }
        ]
      },
      {
        name: "External Locations",
        endpoints: [
          { label: "List external locations", method: "GET", path: "/api/2.1/unity-catalog/external-locations", description: "List external locations", docs: { summary: "List external locations", docUrl: "https://docs.databricks.com/api/azure/workspace/externallocations/list" } },
          { label: "List external locations (paginated)", method: "GET", path: "/api/2.1/unity-catalog/external-locations?page_token=NEXT_PAGE_TOKEN&max_results=100", description: "Get next page of external locations", docs: { summary: "List external locations with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/externallocations/list" } },
          { label: "Get external location", method: "GET", path: "/api/2.1/unity-catalog/external-locations/LOCATION_NAME", description: "Get external location details", docs: { summary: "Get external location", docUrl: "https://docs.databricks.com/api/azure/workspace/externallocations/get" } },
          { label: "Create external location", method: "POST", path: "/api/2.1/unity-catalog/external-locations", description: "Create external location", body: { name: "my-location", url: "s3://bucket/path", credential_name: "my-credential" }, docs: { summary: "Create external location", docUrl: "https://docs.databricks.com/api/azure/workspace/externallocations/create" } },
          { label: "Update external location", method: "PATCH", path: "/api/2.1/unity-catalog/external-locations/LOCATION_NAME", description: "Update external location", body: { url: "s3://bucket/new-path" }, docs: { summary: "Update external location", docUrl: "https://docs.databricks.com/api/azure/workspace/externallocations/update" } },
          { label: "Delete external location", method: "DELETE", path: "/api/2.1/unity-catalog/external-locations/LOCATION_NAME?force=true", description: "Delete external location", body: {}, docs: { summary: "Delete external location", docUrl: "https://docs.databricks.com/api/azure/workspace/externallocations/delete" } }
        ]
      },
      {
        name: "Storage Credentials",
        endpoints: [
          { label: "List storage credentials", method: "GET", path: "/api/2.1/unity-catalog/storage-credentials", description: "List storage credentials", docs: { summary: "List storage credentials", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/list" } },
          { label: "List storage credentials (paginated)", method: "GET", path: "/api/2.1/unity-catalog/storage-credentials?page_token=NEXT_PAGE_TOKEN&max_results=100", description: "Get next page of storage credentials", docs: { summary: "List storage credentials with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/list" } },
          { label: "Get storage credential", method: "GET", path: "/api/2.1/unity-catalog/storage-credentials/CREDENTIAL_NAME", description: "Get storage credential details", docs: { summary: "Get storage credential", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/get" } },
          { label: "Create storage credential", method: "POST", path: "/api/2.1/unity-catalog/storage-credentials", description: "Create storage credential", body: { name: "my-credential", aws_iam_role: { role_arn: "arn:aws:iam::123456789:role/my-role" } }, docs: { summary: "Create storage credential", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/create" } },
          { label: "Update storage credential", method: "PATCH", path: "/api/2.1/unity-catalog/storage-credentials/CREDENTIAL_NAME", description: "Update storage credential", body: { comment: "Updated credential" }, docs: { summary: "Update storage credential", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/update" } },
          { label: "Delete storage credential", method: "DELETE", path: "/api/2.1/unity-catalog/storage-credentials/CREDENTIAL_NAME?force=true", description: "Delete storage credential", body: {}, docs: { summary: "Delete storage credential", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/delete" } },
          { label: "Validate storage credential", method: "POST", path: "/api/2.1/unity-catalog/storage-credentials/CREDENTIAL_NAME/validate", description: "Validate storage credential", body: { external_location_name: "LOCATION_NAME" }, docs: { summary: "Validate storage credential", docUrl: "https://docs.databricks.com/api/azure/workspace/storagecredentials/validate" } }
        ]
      },
      {
        name: "Connections",
        endpoints: [
          { label: "List connections", method: "GET", path: "/api/2.1/unity-catalog/connections", description: "List connections", docs: { summary: "List connections", docUrl: "https://docs.databricks.com/api/azure/workspace/connections/list" } },
          { label: "List connections (paginated)", method: "GET", path: "/api/2.1/unity-catalog/connections?page_token=NEXT_PAGE_TOKEN&max_results=100", description: "Get next page of connections", docs: { summary: "List connections with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/connections/list" } },
          { label: "Get connection", method: "GET", path: "/api/2.1/unity-catalog/connections/CONNECTION_NAME", description: "Get connection details", docs: { summary: "Get connection", docUrl: "https://docs.databricks.com/api/azure/workspace/connections/get" } },
          { label: "Create connection", method: "POST", path: "/api/2.1/unity-catalog/connections", description: "Create connection", body: { name: "my-connection", connection_type: "MYSQL", options: { host: "localhost", port: "3306", database: "mydb" } }, docs: { summary: "Create connection", docUrl: "https://docs.databricks.com/api/azure/workspace/connections/create" } },
          { label: "Update connection", method: "PATCH", path: "/api/2.1/unity-catalog/connections/CONNECTION_NAME", description: "Update connection", body: { options: { database: "newdb" } }, docs: { summary: "Update connection", docUrl: "https://docs.databricks.com/api/azure/workspace/connections/update" } },
          { label: "Delete connection", method: "DELETE", path: "/api/2.1/unity-catalog/connections/CONNECTION_NAME", description: "Delete connection", body: {}, docs: { summary: "Delete connection", docUrl: "https://docs.databricks.com/api/azure/workspace/connections/delete" } }
        ]
      },
      {
        name: "Models (Unity Catalog)",
        endpoints: [
          { label: "List registered models", method: "GET", path: "/api/2.1/unity-catalog/models?catalog_name=CATALOG&schema_name=SCHEMA", description: "List UC registered models", docs: { summary: "List UC models", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/list" } },
          { label: "List registered models (paginated)", method: "GET", path: "/api/2.1/unity-catalog/models?catalog_name=CATALOG&schema_name=SCHEMA&max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of UC models", docs: { summary: "List UC models with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/list" } },
          { label: "Get registered model", method: "GET", path: "/api/2.1/unity-catalog/models/CATALOG.SCHEMA.MODEL", description: "Get UC model details", docs: { summary: "Get UC model", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/get" } },
          { label: "Create registered model", method: "POST", path: "/api/2.1/unity-catalog/models", description: "Create UC model", body: { name: "my_model", catalog_name: "my_catalog", schema_name: "my_schema" }, docs: { summary: "Create UC model", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/create" } },
          { label: "Update registered model", method: "PATCH", path: "/api/2.1/unity-catalog/models/CATALOG.SCHEMA.MODEL", description: "Update UC model", body: { comment: "Updated model" }, docs: { summary: "Update UC model", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/update" } },
          { label: "Delete registered model", method: "DELETE", path: "/api/2.1/unity-catalog/models/CATALOG.SCHEMA.MODEL", description: "Delete UC model", body: {}, docs: { summary: "Delete UC model", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/delete" } },
          { label: "List registered model versions", method: "GET", path: "/api/2.1/unity-catalog/models/CATALOG.SCHEMA.MODEL/versions", description: "List UC model versions", docs: { summary: "List UC model versions", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/listversions" } },
          { label: "Get registered model version", method: "GET", path: "/api/2.1/unity-catalog/models/CATALOG.SCHEMA.MODEL/versions/VERSION", description: "Get UC model version details", docs: { summary: "Get UC model version", docUrl: "https://docs.databricks.com/api/azure/workspace/registeredmodels/getversion" } }
        ]
      },
      {
        name: "System Schemas",
        endpoints: [
          { label: "List system schemas", method: "GET", path: "/api/2.1/unity-catalog/metastores/METASTORE_ID/systemschemas", description: "List system schemas", docs: { summary: "List system schemas for a metastore", docUrl: "https://docs.databricks.com/api/azure/workspace/systemschemas/list" } },
          { label: "Enable system schema", method: "PUT", path: "/api/2.1/unity-catalog/metastores/METASTORE_ID/systemschemas/SCHEMA_NAME", description: "Enable a system schema", body: {}, docs: { summary: "Enable system schema", docUrl: "https://docs.databricks.com/api/azure/workspace/systemschemas/enable" } },
          { label: "Disable system schema", method: "DELETE", path: "/api/2.1/unity-catalog/metastores/METASTORE_ID/systemschemas/SCHEMA_NAME", description: "Disable a system schema", body: {}, docs: { summary: "Disable system schema", docUrl: "https://docs.databricks.com/api/azure/workspace/systemschemas/disable" } }
        ]
      },
      {
        name: "Table Constraints",
        endpoints: [
          { label: "Create table constraint", method: "POST", path: "/api/2.1/unity-catalog/constraints", description: "Create a table constraint", body: { full_name_arg: "CATALOG.SCHEMA.TABLE", constraint: { primary_key_constraint: { name: "pk_id", child_columns: ["id"] } } }, docs: { summary: "Create table constraint", docUrl: "https://docs.databricks.com/api/azure/workspace/tableconstraints/create" } },
          { label: "Delete table constraint", method: "DELETE", path: "/api/2.1/unity-catalog/constraints/CATALOG.SCHEMA.TABLE?constraint_name=CONSTRAINT_NAME&constraint_type=PRIMARY_KEY", description: "Delete a table constraint", body: {}, docs: { summary: "Delete table constraint", docUrl: "https://docs.databricks.com/api/azure/workspace/tableconstraints/delete" } }
        ]
      },
      {
        name: "Workspace Bindings",
        endpoints: [
          { label: "Get catalog bindings", method: "GET", path: "/api/2.1/unity-catalog/bindings/catalog/CATALOG_NAME", description: "Get workspace bindings for catalog", docs: { summary: "Get catalog workspace bindings", docUrl: "https://docs.databricks.com/api/azure/workspace/workspacebindings/get" } },
          { label: "Update catalog bindings", method: "PATCH", path: "/api/2.1/unity-catalog/bindings/catalog/CATALOG_NAME", description: "Update workspace bindings for catalog", body: { assign_workspaces: [123456], unassign_workspaces: [] }, docs: { summary: "Update catalog workspace bindings", docUrl: "https://docs.databricks.com/api/azure/workspace/workspacebindings/update" } }
        ]
      },
      {
        name: "Service Credentials",
        endpoints: [
          { label: "List service credentials", method: "GET", path: "/api/2.1/unity-catalog/credentials?purpose=SERVICE", description: "List service credentials", docs: { summary: "List service credentials", docUrl: "https://docs.databricks.com/api/azure/workspace/credentials/list" } },
          { label: "Create service credential", method: "POST", path: "/api/2.1/unity-catalog/credentials", description: "Create service credential", body: { name: "my-credential", purpose: "SERVICE", azure_managed_identity: { access_connector_id: "/subscriptions/.../accessConnectors/..." } }, docs: { summary: "Create service credential", docUrl: "https://docs.databricks.com/api/azure/workspace/credentials/create" } },
          { label: "Get service credential", method: "GET", path: "/api/2.1/unity-catalog/credentials/CREDENTIAL_NAME", description: "Get service credential details", docs: { summary: "Get service credential", docUrl: "https://docs.databricks.com/api/azure/workspace/credentials/get" } },
          { label: "Update service credential", method: "PATCH", path: "/api/2.1/unity-catalog/credentials/CREDENTIAL_NAME", description: "Update service credential", body: { comment: "Updated credential" }, docs: { summary: "Update service credential", docUrl: "https://docs.databricks.com/api/azure/workspace/credentials/update" } },
          { label: "Delete service credential", method: "DELETE", path: "/api/2.1/unity-catalog/credentials/CREDENTIAL_NAME", description: "Delete service credential", body: {}, docs: { summary: "Delete service credential", docUrl: "https://docs.databricks.com/api/azure/workspace/credentials/delete" } },
          { label: "Validate service credential", method: "POST", path: "/api/2.1/unity-catalog/credentials/CREDENTIAL_NAME/validate", description: "Validate service credential", body: { url: "abfss://container@storage.dfs.core.windows.net/path" }, docs: { summary: "Validate service credential", docUrl: "https://docs.databricks.com/api/azure/workspace/credentials/validate" } }
        ]
      },
      {
        name: "Artifact Allowlists",
        endpoints: [
          { label: "Get artifact allowlist", method: "GET", path: "/api/2.1/unity-catalog/artifact-allowlists/INIT_SCRIPT", description: "Get artifact allowlist", docs: { summary: "Get artifact allowlist for a type", docUrl: "https://docs.databricks.com/api/azure/workspace/artifactallowlists/get" } },
          { label: "Set artifact allowlist", method: "PUT", path: "/api/2.1/unity-catalog/artifact-allowlists/INIT_SCRIPT", description: "Set artifact allowlist", body: { artifact_matchers: [{ artifact: "/Volumes/catalog/schema/volume/", match_type: "PREFIX_MATCH" }] }, docs: { summary: "Set artifact allowlist", docUrl: "https://docs.databricks.com/api/azure/workspace/artifactallowlists/update" } }
        ]
      },
      {
        name: "Online Tables",
        endpoints: [
          { label: "Create online table", method: "POST", path: "/api/2.0/online-tables", description: "Create an online table", body: { name: "CATALOG.SCHEMA.TABLE_online", spec: { source_table_full_name: "CATALOG.SCHEMA.TABLE", primary_key_columns: ["id"], run_triggered: {} } }, docs: { summary: "Create online table for low-latency reads", docUrl: "https://docs.databricks.com/api/azure/workspace/onlinetables/create" } },
          { label: "Get online table", method: "GET", path: "/api/2.0/online-tables/CATALOG.SCHEMA.TABLE_online", description: "Get online table details", docs: { summary: "Get online table", docUrl: "https://docs.databricks.com/api/azure/workspace/onlinetables/get" } },
          { label: "Delete online table", method: "DELETE", path: "/api/2.0/online-tables/CATALOG.SCHEMA.TABLE_online", description: "Delete an online table", body: {}, docs: { summary: "Delete online table", docUrl: "https://docs.databricks.com/api/azure/workspace/onlinetables/delete" } }
        ]
      },
    ]
  },
  {
    name: "Databricks SQL",
    icon: "BarChart3",
    subcategories: [
      {
        name: "Warehouses",
        endpoints: [
          { label: "List warehouses", method: "GET", path: "/api/2.0/sql/warehouses?max_results=50", description: "List warehouses", docs: { summary: "List warehouses", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/list" } },
          { label: "List warehouses (paginated)", method: "GET", path: "/api/2.0/sql/warehouses?max_results=50&page_token=NEXT_PAGE_TOKEN", description: "Get next page of warehouses", docs: { summary: "List warehouses with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/list" } },
          { label: "Get warehouse", method: "GET", path: "/api/2.0/sql/warehouses/WAREHOUSE_ID", description: "Warehouse details", docs: { summary: "Get warehouse", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/get" } },
          { label: "Create warehouse", method: "POST", path: "/api/2.0/sql/warehouses", description: "Create warehouse", body: { name: "my-warehouse", cluster_size: "Small", max_num_clusters: 1 }, docs: { summary: "Create warehouse", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/create" } },
          { label: "Start warehouse", method: "POST", path: "/api/2.0/sql/warehouses/WAREHOUSE_ID/start", description: "Start warehouse", body: {}, docs: { summary: "Start warehouse", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/start" } },
          { label: "Stop warehouse", method: "POST", path: "/api/2.0/sql/warehouses/WAREHOUSE_ID/stop", description: "Stop warehouse", body: {}, docs: { summary: "Stop warehouse", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/stop" } },
          { label: "Delete warehouse", method: "DELETE", path: "/api/2.0/sql/warehouses/WAREHOUSE_ID", description: "Delete warehouse", body: {}, docs: { summary: "Delete warehouse", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/delete" } },
          { label: "Update warehouse", method: "PATCH", path: "/api/2.0/sql/warehouses/WAREHOUSE_ID", description: "Update warehouse config", body: { name: "updated-warehouse", cluster_size: "Medium", max_num_clusters: 2, min_num_clusters: 1 }, docs: { summary: "Update warehouse", docUrl: "https://docs.databricks.com/api/azure/workspace/warehouses/update" } }
        ]
      },
      {
        name: "Queries",
        endpoints: [
          { label: "List queries", method: "GET", path: "/api/2.0/preview/sql/queries?page_size=100", description: "List queries", docs: { summary: "List SQL queries", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/list" } },
          { label: "List queries (paginated)", method: "GET", path: "/api/2.0/preview/sql/queries?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of queries", docs: { summary: "List queries with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/list" } },
          { label: "Get query", method: "GET", path: "/api/2.0/preview/sql/queries/QUERY_ID", description: "Query details", docs: { summary: "Get query", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/get" } },
          { label: "Create query", method: "POST", path: "/api/2.0/preview/sql/queries", description: "Create query", body: { data_source_id: "WAREHOUSE_ID", name: "My Query", query: "SELECT * FROM table" }, docs: { summary: "Create query", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/create" } },
          { label: "Update query", method: "POST", path: "/api/2.0/preview/sql/queries/QUERY_ID", description: "Update query", body: { name: "Updated Query", query: "SELECT * FROM table WHERE id > 100" }, docs: { summary: "Update query", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/update" } },
          { label: "Delete query", method: "DELETE", path: "/api/2.0/preview/sql/queries/QUERY_ID", description: "Delete query", body: {}, docs: { summary: "Delete query", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/delete" } },
          { label: "Restore query", method: "POST", path: "/api/2.0/preview/sql/queries/trash/QUERY_ID", description: "Restore query from trash", body: {}, docs: { summary: "Restore query", docUrl: "https://docs.databricks.com/api/azure/workspace/queries/restore" } }
        ]
      },
      {
        name: "Dashboards",
        endpoints: [
          { label: "List dashboards", method: "GET", path: "/api/2.0/preview/sql/dashboards?page_size=100", description: "List dashboards", docs: { summary: "List dashboards", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/list" } },
          { label: "List dashboards (paginated)", method: "GET", path: "/api/2.0/preview/sql/dashboards?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of dashboards", docs: { summary: "List dashboards with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/list" } },
          { label: "Get dashboard", method: "GET", path: "/api/2.0/preview/sql/dashboards/DASHBOARD_ID", description: "Dashboard details", docs: { summary: "Get dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/get" } },
          { label: "Create dashboard", method: "POST", path: "/api/2.0/preview/sql/dashboards", description: "Create dashboard", body: { name: "My Dashboard" }, docs: { summary: "Create dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/create" } },
          { label: "Update dashboard", method: "POST", path: "/api/2.0/preview/sql/dashboards/DASHBOARD_ID", description: "Update dashboard", body: { name: "Updated Dashboard" }, docs: { summary: "Update dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/update" } },
          { label: "Delete dashboard", method: "DELETE", path: "/api/2.0/preview/sql/dashboards/DASHBOARD_ID", description: "Delete dashboard", body: {}, docs: { summary: "Delete dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/delete" } },
          { label: "Restore dashboard", method: "POST", path: "/api/2.0/preview/sql/dashboards/trash/DASHBOARD_ID", description: "Restore dashboard", body: {}, docs: { summary: "Restore dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/dashboards/restore" } }
        ]
      },
      { name: "Alerts", endpoints: [ 
        { label: "List alerts", method: "GET", path: "/api/2.0/preview/sql/alerts?page_size=100", description: "List alerts", docs: { summary: "List alerts", docUrl: "https://docs.databricks.com/api/azure/workspace/alerts/list" } },
        { label: "List alerts (paginated)", method: "GET", path: "/api/2.0/preview/sql/alerts?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of alerts", docs: { summary: "List alerts with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/alerts/list" } },
        { label: "Get alert", method: "GET", path: "/api/2.0/preview/sql/alerts/ALERT_ID", description: "Alert details", docs: { summary: "Get alert", docUrl: "https://docs.databricks.com/api/azure/workspace/alerts/get" } },
        { label: "Create alert", method: "POST", path: "/api/2.0/preview/sql/alerts", description: "Create alert", body: { name: "My Alert", options: { column: "value", op: ">", value: 100 }, query_id: "QUERY_ID" }, docs: { summary: "Create alert", docUrl: "https://docs.databricks.com/api/azure/workspace/alerts/create" } },
        { label: "Update alert", method: "PUT", path: "/api/2.0/preview/sql/alerts/ALERT_ID", description: "Update alert", body: { name: "Updated Alert" }, docs: { summary: "Update alert", docUrl: "https://docs.databricks.com/api/azure/workspace/alerts/update" } },
        { label: "Delete alert", method: "DELETE", path: "/api/2.0/preview/sql/alerts/ALERT_ID", description: "Delete alert", body: {}, docs: { summary: "Delete alert", docUrl: "https://docs.databricks.com/api/azure/workspace/alerts/delete" } }
      ] },
      {
        name: "Statement Execution",
        endpoints: [
          { label: "Execute statement", method: "POST", path: "/api/2.0/sql/statements", description: "Execute SQL", body: { warehouse_id: "WAREHOUSE_ID", statement: "SELECT 1", wait_timeout: "50s" }, docs: { summary: "Execute statement", docUrl: "https://docs.databricks.com/api/azure/workspace/statementexecution/executestatement" } },
          { label: "Get statement", method: "GET", path: "/api/2.0/sql/statements/STATEMENT_ID", description: "Statement result", docs: { summary: "Get statement", docUrl: "https://docs.databricks.com/api/azure/workspace/statementexecution/getstatement" } },
          { label: "Get result chunk", method: "GET", path: "/api/2.0/sql/statements/STATEMENT_ID/result/chunks/CHUNK_INDEX", description: "Get result chunk for large results", docs: { summary: "Get statement result chunk", docUrl: "https://docs.databricks.com/api/azure/workspace/statementexecution/getstatementresultchunkn" } },
          { label: "Cancel statement", method: "POST", path: "/api/2.0/sql/statements/STATEMENT_ID/cancel", description: "Cancel SQL statement", body: {}, docs: { summary: "Cancel statement", docUrl: "https://docs.databricks.com/api/azure/workspace/statementexecution/cancelstatement" } }
        ]
      },
      {
        name: "Query History",
        endpoints: [
          { label: "List query history", method: "GET", path: "/api/2.0/sql/history/queries?max_results=50", description: "Query execution history", docs: { summary: "List query history", docUrl: "https://docs.databricks.com/api/azure/workspace/queryhistory/list" } },
          { label: "List query history (paginated)", method: "GET", path: "/api/2.0/sql/history/queries?max_results=50&page_token=NEXT_PAGE_TOKEN", description: "Get next page of query history", docs: { summary: "List query history with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/queryhistory/list" } }
        ]
      }
    ]
  },
  {
    name: "Machine Learning",
    icon: "Brain",
    subcategories: [
      {
        name: "Experiments",
        endpoints: [
          { label: "List experiments", method: "GET", path: "/api/2.0/mlflow/experiments/list", description: "List experiments", docs: { summary: "List MLflow experiments", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/listexperiments" } },
          { label: "List experiments (paginated)", method: "GET", path: "/api/2.0/mlflow/experiments/list?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of experiments", docs: { summary: "List experiments with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/listexperiments" } },
          { label: "Get experiment", method: "GET", path: "/api/2.0/mlflow/experiments/get?experiment_id=EXPERIMENT_ID", description: "Experiment details", docs: { summary: "Get experiment", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/getexperiment" } },
          { label: "Get experiment by name", method: "GET", path: "/api/2.0/mlflow/experiments/get-by-name?experiment_name=/Shared/experiment", description: "Get experiment by name", docs: { summary: "Get experiment by name", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/getbyname" } },
          { label: "Create experiment", method: "POST", path: "/api/2.0/mlflow/experiments/create", description: "Create experiment", body: { name: "/Shared/my-experiment" }, docs: { summary: "Create experiment", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/createexperiment" } },
          { label: "Update experiment", method: "POST", path: "/api/2.0/mlflow/experiments/update", description: "Update experiment", body: { experiment_id: "EXPERIMENT_ID", new_name: "/Shared/updated-experiment" }, docs: { summary: "Update experiment", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/updateexperiment" } },
          { label: "Delete experiment", method: "POST", path: "/api/2.0/mlflow/experiments/delete", description: "Delete experiment", body: { experiment_id: "EXPERIMENT_ID" }, docs: { summary: "Delete experiment", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/deleteexperiment" } },
          { label: "Restore experiment", method: "POST", path: "/api/2.0/mlflow/experiments/restore", description: "Restore deleted experiment", body: { experiment_id: "EXPERIMENT_ID" }, docs: { summary: "Restore experiment", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/restoreexperiment" } },
          { label: "Search experiments", method: "POST", path: "/api/2.0/mlflow/experiments/search", description: "Search experiments", body: { max_results: 100 }, docs: { summary: "Search experiments", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/searchexperiments" } },
          { label: "Search experiments (paginated)", method: "POST", path: "/api/2.0/mlflow/experiments/search", description: "Search experiments with pagination", body: { max_results: 100, page_token: "NEXT_PAGE_TOKEN" }, docs: { summary: "Search experiments with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/searchexperiments" } }
        ]
      },
      {
        name: "Runs",
        endpoints: [
          { label: "Search runs", method: "POST", path: "/api/2.0/mlflow/runs/search", description: "Search runs", body: { experiment_ids: ["EXPERIMENT_ID"] }, docs: { summary: "Search runs", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/searchruns" } },
          { label: "Search runs (paginated)", method: "POST", path: "/api/2.0/mlflow/runs/search", description: "Search runs with pagination", body: { experiment_ids: ["EXPERIMENT_ID"], max_results: 100, page_token: "NEXT_PAGE_TOKEN" }, docs: { summary: "Search runs with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/searchruns" } },
          { label: "Get run", method: "GET", path: "/api/2.0/mlflow/runs/get?run_id=RUN_ID", description: "Get run details", docs: { summary: "Get run", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/getrun" } },
          { label: "Create run", method: "POST", path: "/api/2.0/mlflow/runs/create", description: "Create run", body: { experiment_id: "EXPERIMENT_ID", start_time: 0 }, docs: { summary: "Create run", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/createrun" } },
          { label: "Update run", method: "POST", path: "/api/2.0/mlflow/runs/update", description: "Update run", body: { run_id: "RUN_ID", status: "FINISHED" }, docs: { summary: "Update run", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/updaterun" } },
          { label: "Delete run", method: "POST", path: "/api/2.0/mlflow/runs/delete", description: "Delete run", body: { run_id: "RUN_ID" }, docs: { summary: "Delete run", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/deleterun" } },
          { label: "Restore run", method: "POST", path: "/api/2.0/mlflow/runs/restore", description: "Restore deleted run", body: { run_id: "RUN_ID" }, docs: { summary: "Restore run", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/restorerun" } },
          { label: "Log metric", method: "POST", path: "/api/2.0/mlflow/runs/log-metric", description: "Log metric", body: { run_id: "RUN_ID", key: "accuracy", value: 0.95, timestamp: 0 }, docs: { summary: "Log metric", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/logmetric" } },
          { label: "Log param", method: "POST", path: "/api/2.0/mlflow/runs/log-parameter", description: "Log parameter", body: { run_id: "RUN_ID", key: "learning_rate", value: "0.01" }, docs: { summary: "Log parameter", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/logparam" } },
          { label: "Log batch", method: "POST", path: "/api/2.0/mlflow/runs/log-batch", description: "Log batch of metrics, params, tags", body: { run_id: "RUN_ID", metrics: [{ key: "accuracy", value: 0.95, timestamp: 0 }], params: [{ key: "learning_rate", value: "0.01" }], tags: [{ key: "model_type", value: "neural_network" }] }, docs: { summary: "Log batch", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/logbatch" } },
          { label: "Get metric history", method: "GET", path: "/api/2.0/mlflow/metrics/get-history?run_id=RUN_ID&metric_key=METRIC_NAME", description: "Get metric history", docs: { summary: "Get metric history", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/getmetrichistory" } },
          { label: "Log artifact", method: "POST", path: "/api/2.0/mlflow/runs/log-artifact", description: "Log artifact file", body: { run_id: "RUN_ID", path: "artifacts", artifact_data: "BASE64_DATA" }, docs: { summary: "Log artifact", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/logartifact" } },
          { label: "Set run tag", method: "POST", path: "/api/2.0/mlflow/runs/set-tag", description: "Set run tag", body: { run_id: "RUN_ID", key: "tag-name", value: "tag-value" }, docs: { summary: "Set run tag", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/settag" } },
          { label: "Delete run tag", method: "DELETE", path: "/api/2.0/mlflow/runs/delete-tag?run_id=RUN_ID&key=TAG_NAME", description: "Delete run tag", body: {}, docs: { summary: "Delete run tag", docUrl: "https://docs.databricks.com/api/azure/workspace/experiments/deletetag" } }
        ]
      },
      {
        name: "Model Registry",
        endpoints: [
          { label: "List registered models", method: "GET", path: "/api/2.0/mlflow/registered-models/list", description: "List models", docs: { summary: "List registered models", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/listregisteredmodels" } },
          { label: "List registered models (paginated)", method: "GET", path: "/api/2.0/mlflow/registered-models/list?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of models", docs: { summary: "List registered models with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/listregisteredmodels" } },
          { label: "Search registered models", method: "GET", path: "/api/2.0/mlflow/registered-models/search?max_results=100", description: "Search models", docs: { summary: "Search registered models", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/searchregisteredmodels" } },
          { label: "Search registered models (paginated)", method: "GET", path: "/api/2.0/mlflow/registered-models/search?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of search results", docs: { summary: "Search registered models with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/searchregisteredmodels" } },
          { label: "Get model", method: "GET", path: "/api/2.0/mlflow/registered-models/get?name=MODEL_NAME", description: "Model details", docs: { summary: "Get registered model", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/getregisteredmodel" } },
          { label: "Create model", method: "POST", path: "/api/2.0/mlflow/registered-models/create", description: "Register model", body: { name: "my-model" }, docs: { summary: "Register new model", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/createregisteredmodel" } },
          { label: "Rename model", method: "POST", path: "/api/2.0/mlflow/registered-models/rename", description: "Rename model", body: { name: "MODEL_NAME", new_name: "new-model-name" }, docs: { summary: "Rename model", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/renameregisteredmodel" } },
          { label: "Update model", method: "PATCH", path: "/api/2.0/mlflow/registered-models/update", description: "Update model", body: { name: "MODEL_NAME", description: "Updated description" }, docs: { summary: "Update model", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/updateregisteredmodel" } },
          { label: "Delete model", method: "DELETE", path: "/api/2.0/mlflow/registered-models/delete?name=MODEL_NAME", description: "Delete model", body: {}, docs: { summary: "Delete registered model", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/deleteregisteredmodel" } },
          { label: "Get model version", method: "GET", path: "/api/2.0/mlflow/model-versions/get?name=MODEL_NAME&version=1", description: "Get model version", docs: { summary: "Get model version", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/getmodelversion" } },
          { label: "Create model version", method: "POST", path: "/api/2.0/mlflow/model-versions/create", description: "Create model version", body: { name: "MODEL_NAME", source: "runs:/RUN_ID/model" }, docs: { summary: "Create model version", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/createmodelversion" } },
          { label: "Update model version", method: "PATCH", path: "/api/2.0/mlflow/model-versions/update", description: "Update model version", body: { name: "MODEL_NAME", version: "1", description: "Version description" }, docs: { summary: "Update model version", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/updatemodelversion" } },
          { label: "Transition model stage", method: "POST", path: "/api/2.0/mlflow/model-versions/transition-stage", description: "Update model stage", body: { name: "MODEL_NAME", version: "1", stage: "Production" }, docs: { summary: "Transition model to stage", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/transitionmodelversion" } },
          { label: "Delete model version", method: "DELETE", path: "/api/2.0/mlflow/model-versions/delete?name=MODEL_NAME&version=1", description: "Delete model version", body: {}, docs: { summary: "Delete model version", docUrl: "https://docs.databricks.com/api/azure/workspace/modelregistry/deletemodelversion" } }
        ]
      },
      {
        name: "Feature Store",
        endpoints: [
          { label: "Get feature table", method: "GET", path: "/api/2.0/feature-store/feature-tables/get?name=FEATURE_TABLE", description: "Feature table details", docs: { summary: "Get feature table", docUrl: "https://docs.databricks.com/api/azure/workspace/featuretables/get" } },
          { label: "Search feature tables", method: "GET", path: "/api/2.0/feature-store/feature-tables/search", description: "Search feature tables", docs: { summary: "Search feature tables", docUrl: "https://docs.databricks.com/api/azure/workspace/featuretables/search" } }
        ]
      }
    ]
  },
  {
    name: "Real-time Serving",
    icon: "Radio",
    endpoints: [
      { label: "List serving endpoints", method: "GET", path: "/api/2.0/serving-endpoints", description: "List serving endpoints", docs: { summary: "List serving endpoints", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/list" } },
      { label: "List serving endpoints (paginated)", method: "GET", path: "/api/2.0/serving-endpoints?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of serving endpoints", docs: { summary: "List serving endpoints with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/list" } },
      { label: "Get serving endpoint", method: "GET", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME", description: "Serving endpoint details", docs: { summary: "Get serving endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/get" } },
      { label: "Create serving endpoint", method: "POST", path: "/api/2.0/serving-endpoints", description: "Create serving endpoint", body: { name: "my-endpoint", config: { served_models: [{ model_name: "model", model_version: "1", workload_size: "Small", scale_to_zero_enabled: true }] } }, docs: { summary: "Create serving endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/create" } },
      { label: "Update serving endpoint", method: "PUT", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME/config", description: "Update endpoint config", body: { served_models: [] }, docs: { summary: "Update serving endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/updateconfig" } },
      { label: "Delete serving endpoint", method: "DELETE", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME", description: "Delete endpoint", body: {}, docs: { summary: "Delete serving endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/delete" } },
      { label: "Query endpoint", method: "POST", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME/invocations", description: "Query serving endpoint", body: { inputs: [] }, docs: { summary: "Query endpoint for predictions", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/query" } },
      { label: "Get build logs", method: "GET", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME/served-models/SERVED_MODEL_NAME/build-logs", description: "Get endpoint build logs", docs: { summary: "Get build logs for a served model", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/buildlogs" } },
      { label: "Get serve logs", method: "GET", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME/served-models/SERVED_MODEL_NAME/logs", description: "Get serve logs for model", docs: { summary: "Get serve logs", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/logs" } },
      { label: "Export metrics", method: "GET", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME/metrics", description: "Export Prometheus metrics", docs: { summary: "Export serving endpoint metrics in Prometheus format", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/exportmetrics" } },
      { label: "Get endpoint permissions", method: "GET", path: "/api/2.0/permissions/serving-endpoints/ENDPOINT_ID", description: "Get serving endpoint permissions", docs: { summary: "Get serving endpoint permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/getpermissions" } },
      { label: "Set endpoint permissions", method: "PUT", path: "/api/2.0/permissions/serving-endpoints/ENDPOINT_ID", description: "Set serving endpoint permissions", body: { access_control_list: [{ user_name: "user@example.com", permission_level: "CAN_QUERY" }] }, docs: { summary: "Set serving endpoint permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/setpermissions" } },
      { label: "Put AI gateway", method: "PUT", path: "/api/2.0/serving-endpoints/ENDPOINT_NAME/ai-gateway", description: "Configure AI gateway for endpoint", body: { usage_tracking_config: { enabled: true }, inference_table_config: { catalog_name: "catalog", schema_name: "schema", table_name_prefix: "prefix", enabled: true } }, docs: { summary: "Configure AI gateway settings", docUrl: "https://docs.databricks.com/api/azure/workspace/servingendpoints/putaigateway" } }
    ]
  },
  {
    name: "Identity and Access Management",
    icon: "ShieldCheck",
    subcategories: [
      {
        name: "Tokens",
        endpoints: [
          { label: "List tokens", method: "GET", path: "/api/2.0/token/list", description: "List PATs", docs: { summary: "List tokens", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/list" } },
          { label: "List tokens (paginated)", method: "GET", path: "/api/2.0/token/list?page_token=NEXT_PAGE_TOKEN", description: "Get next page of tokens", docs: { summary: "List tokens with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/list" } },
          { label: "Create token", method: "POST", path: "/api/2.0/token/create", description: "Create PAT", body: { lifetime_seconds: 7776000, comment: "API Token" }, docs: { summary: "Create token", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/createorupdatetoken" } },
          { label: "Revoke token", method: "POST", path: "/api/2.0/token/delete", description: "Revoke token", body: { token_id: "TOKEN_ID" }, docs: { summary: "Revoke token", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/delete" } }
        ]
      },
      {
        name: "Groups",
        endpoints: [
          { label: "List groups", method: "GET", path: "/api/2.0/groups/list", description: "List groups", docs: { summary: "List groups", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/list" } },
          { label: "List groups (paginated)", method: "GET", path: "/api/2.0/groups/list?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of groups", docs: { summary: "List groups with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/list" } },
          { label: "Get group", method: "GET", path: "/api/2.0/groups/get?group_name=GROUP_NAME", description: "Group details", docs: { summary: "Get group", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/get" } },
          { label: "Create group", method: "POST", path: "/api/2.0/groups/create", description: "Create group", body: { group_name: "my-group" }, docs: { summary: "Create group", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/create" } },
          { label: "Delete group", method: "POST", path: "/api/2.0/groups/delete", description: "Delete group", body: { group_name: "my-group" }, docs: { summary: "Delete group", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/delete" } },
          { label: "Add group member", method: "POST", path: "/api/2.0/groups/add-member", description: "Add member", body: { parent_name: "group-name", user_name: "user@example.com" }, docs: { summary: "Add group member", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/addmember" } },
          { label: "Remove group member", method: "POST", path: "/api/2.0/groups/remove-member", description: "Remove member", body: { parent_name: "group-name", user_name: "user@example.com" }, docs: { summary: "Remove group member", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/removemember" } },
          { label: "List group members", method: "GET", path: "/api/2.0/groups/list-members?group_name=GROUP_NAME", description: "List members", docs: { summary: "List group members", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/listmembers" } },
          { label: "List group members (paginated)", method: "GET", path: "/api/2.0/groups/list-members?group_name=GROUP_NAME&page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of group members", docs: { summary: "List group members with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/listmembers" } },
          { label: "Get group members", method: "GET", path: "/api/2.0/groups/get-members?group_name=GROUP_NAME", description: "Get group members", docs: { summary: "Get group members", docUrl: "https://docs.databricks.com/api/azure/workspace/groups/getmembers" } }
        ]
      },
      {
        name: "Users (SCIM)",
        endpoints: [
          { label: "Current user", method: "GET", path: "/api/2.0/preview/scim/v2/Me", description: "Get current user", docs: { summary: "Current user info", docUrl: "https://docs.databricks.com/api/azure/workspace/users/getcurrentuser" } },
          { label: "List users", method: "GET", path: "/api/2.0/preview/scim/v2/Users?startIndex=1&count=100", description: "List workspace users", docs: { summary: "List users", docUrl: "https://docs.databricks.com/api/azure/workspace/users/list" } },
          { label: "List users (paginated)", method: "GET", path: "/api/2.0/preview/scim/v2/Users?startIndex=NEXT_INDEX&count=100", description: "Get next page of users", docs: { summary: "List users with pagination via startIndex", docUrl: "https://docs.databricks.com/api/azure/workspace/users/list" } },
          { label: "Get user", method: "GET", path: "/api/2.0/preview/scim/v2/Users/USER_ID", description: "Get user details", docs: { summary: "Get user", docUrl: "https://docs.databricks.com/api/azure/workspace/users/get" } },
          { label: "Create user", method: "POST", path: "/api/2.0/preview/scim/v2/Users", description: "Create user", body: { schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"], userName: "user@example.com", displayName: "User Name", emails: [{ primary: true, value: "user@example.com" }] }, docs: { summary: "Create user", docUrl: "https://docs.databricks.com/api/azure/workspace/users/create" } },
          { label: "Update user", method: "PUT", path: "/api/2.0/preview/scim/v2/Users/USER_ID", description: "Update user", body: { schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"], displayName: "New Name" }, docs: { summary: "Update user", docUrl: "https://docs.databricks.com/api/azure/workspace/users/update" } },
          { label: "Patch user", method: "PATCH", path: "/api/2.0/preview/scim/v2/Users/USER_ID", description: "Patch user", body: { schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"], Operations: [{ op: "replace", path: "active", value: false }] }, docs: { summary: "Patch user", docUrl: "https://docs.databricks.com/api/azure/workspace/users/patch" } },
          { label: "Delete user", method: "DELETE", path: "/api/2.0/preview/scim/v2/Users/USER_ID", description: "Delete user", body: {}, docs: { summary: "Delete user", docUrl: "https://docs.databricks.com/api/azure/workspace/users/delete" } }
        ]
      },
      {
        name: "Service Principals",
        endpoints: [
          { label: "List service principals", method: "GET", path: "/api/2.0/preview/scim/v2/ServicePrincipals?startIndex=1&count=100", description: "List service principals", docs: { summary: "List service principals", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/list" } },
          { label: "List service principals (paginated)", method: "GET", path: "/api/2.0/preview/scim/v2/ServicePrincipals?startIndex=NEXT_INDEX&count=100", description: "Get next page of service principals", docs: { summary: "List service principals with pagination via startIndex", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/list" } },
          { label: "Get service principal", method: "GET", path: "/api/2.0/preview/scim/v2/ServicePrincipals/SP_ID", description: "Get service principal details", docs: { summary: "Get service principal", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/get" } },
          { label: "Create service principal", method: "POST", path: "/api/2.0/preview/scim/v2/ServicePrincipals", description: "Create service principal", body: { schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServicePrincipal"], displayName: "my-sp", applicationId: "APP_ID" }, docs: { summary: "Create service principal", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/create" } },
          { label: "Update service principal", method: "PUT", path: "/api/2.0/preview/scim/v2/ServicePrincipals/SP_ID", description: "Update service principal", body: { schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServicePrincipal"], displayName: "updated-sp" }, docs: { summary: "Update service principal", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/update" } },
          { label: "Patch service principal", method: "PATCH", path: "/api/2.0/preview/scim/v2/ServicePrincipals/SP_ID", description: "Patch service principal", body: { schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"], Operations: [{ op: "replace", path: "active", value: false }] }, docs: { summary: "Patch service principal", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/patch" } },
          { label: "Delete service principal", method: "DELETE", path: "/api/2.0/preview/scim/v2/ServicePrincipals/SP_ID", description: "Delete service principal", body: {}, docs: { summary: "Delete service principal", docUrl: "https://docs.databricks.com/api/azure/workspace/serviceprincipals/delete" } }
        ]
      },
      {
        name: "Permissions",
        endpoints: [
          { label: "Get permissions", method: "GET", path: "/api/2.0/permissions/clusters/CLUSTER_ID", description: "Get permissions", docs: { summary: "Get resource permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/permissions/get" } },
          { label: "Set permissions", method: "PUT", path: "/api/2.0/permissions/clusters/CLUSTER_ID", description: "Set permissions", body: { access_control_list: [{ user_name: "user@example.com", permission_level: "CAN_USE" }] }, docs: { summary: "Set resource permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/permissions/set" } },
          { label: "Update permissions", method: "PATCH", path: "/api/2.0/permissions/clusters/CLUSTER_ID", description: "Update permissions", body: { access_control_list: [{ user_name: "user@example.com", permission_level: "CAN_MANAGE" }] }, docs: { summary: "Update resource permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/permissions/update" } }
        ]
      }
    ]
  },
  {
    name: "Settings",
    icon: "Settings",
    subcategories: [
      {
        name: "Workspace Configuration",
        endpoints: [
          { label: "Get workspace conf", method: "GET", path: "/api/2.0/workspace-conf?keys=enableIpAccessLists", description: "Get workspace settings", docs: { summary: "Get workspace conf", docUrl: "https://docs.databricks.com/api/azure/workspace/workspaceconf/getstatus" } },
          { label: "Set workspace conf", method: "PATCH", path: "/api/2.0/workspace-conf", description: "Update workspace settings", body: { enableIpAccessLists: "true" }, docs: { summary: "Set workspace conf", docUrl: "https://docs.databricks.com/api/azure/workspace/workspaceconf/setworkspaceconf" } }
        ]
      },
      {
        name: "IP Access Lists",
        endpoints: [
          { label: "List IP access lists", method: "GET", path: "/api/2.0/ip-access-lists", description: "List IP lists", docs: { summary: "List IP access lists", docUrl: "https://docs.databricks.com/api/azure/workspace/ipaccesslists/list" } },
          { label: "List IP access lists (paginated)", method: "GET", path: "/api/2.0/ip-access-lists?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of IP lists", docs: { summary: "List IP access lists with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/ipaccesslists/list" } },
          { label: "Get IP access list", method: "GET", path: "/api/2.0/ip-access-lists/LIST_ID", description: "Get IP list details", docs: { summary: "Get IP access list", docUrl: "https://docs.databricks.com/api/azure/workspace/ipaccesslists/get" } },
          { label: "Create IP access list", method: "POST", path: "/api/2.0/ip-access-lists", description: "Create IP list", body: { label: "office-ips", list_type: "ALLOW", ip_addresses: ["1.2.3.4/32"] }, docs: { summary: "Create IP access list", docUrl: "https://docs.databricks.com/api/azure/workspace/ipaccesslists/create" } },
          { label: "Update IP access list", method: "PUT", path: "/api/2.0/ip-access-lists/LIST_ID", description: "Update IP list", body: { label: "updated-ips", ip_addresses: ["1.2.3.0/24"] }, docs: { summary: "Update IP access list", docUrl: "https://docs.databricks.com/api/azure/workspace/ipaccesslists/update" } },
          { label: "Delete IP access list", method: "DELETE", path: "/api/2.0/ip-access-lists/LIST_ID", description: "Delete IP list", body: {}, docs: { summary: "Delete IP access list", docUrl: "https://docs.databricks.com/api/azure/workspace/ipaccesslists/delete" } }
        ]
      },
      {
        name: "Token Management",
        endpoints: [
          { label: "Get token permissions", method: "GET", path: "/api/2.0/permissions/authorization/tokens", description: "Get token permissions", docs: { summary: "Get token permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenpermissions/get" } },
          { label: "Set token permissions", method: "PUT", path: "/api/2.0/permissions/authorization/tokens", description: "Set token permissions", body: { access_control_list: [{ group_name: "admins", permission_level: "CAN_USE" }] }, docs: { summary: "Set token permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenpermissions/set" } },
          { label: "List all tokens (admin)", method: "GET", path: "/api/2.0/token-management/tokens", description: "List all tokens in workspace (admin)", docs: { summary: "List all workspace tokens", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/list" } },
          { label: "Get token (admin)", method: "GET", path: "/api/2.0/token-management/tokens/TOKEN_ID", description: "Get specific token info (admin)", docs: { summary: "Get token by ID", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/get" } },
          { label: "Delete token (admin)", method: "DELETE", path: "/api/2.0/token-management/tokens/TOKEN_ID", description: "Delete any token (admin)", body: {}, docs: { summary: "Delete token by ID", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/delete" } },
          { label: "Create token on behalf of", method: "POST", path: "/api/2.0/token-management/on-behalf-of/tokens", description: "Create token for another user (admin)", body: { application_id: "APP_ID", lifetime_seconds: 7776000, comment: "Service token" }, docs: { summary: "Create token on behalf of service principal", docUrl: "https://docs.databricks.com/api/azure/workspace/tokenmanagement/createobotoken" } }
        ]
      },
      {
        name: "Notification Destinations",
        endpoints: [
          { label: "List notification destinations", method: "GET", path: "/api/2.0/notification-destinations", description: "List notification destinations", docs: { summary: "List notification destinations", docUrl: "https://docs.databricks.com/api/azure/workspace/notificationdestinations/list" } },
          { label: "List notification destinations (paginated)", method: "GET", path: "/api/2.0/notification-destinations?page_token=NEXT_PAGE_TOKEN", description: "Get next page of notification destinations", docs: { summary: "List notification destinations with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/notificationdestinations/list" } },
          { label: "Create notification destination", method: "POST", path: "/api/2.0/notification-destinations", description: "Create notification destination", body: { display_name: "My Webhook", config: { generic_webhook: { url: "https://hooks.example.com/webhook" } } }, docs: { summary: "Create notification destination", docUrl: "https://docs.databricks.com/api/azure/workspace/notificationdestinations/create" } },
          { label: "Get notification destination", method: "GET", path: "/api/2.0/notification-destinations/DESTINATION_ID", description: "Get notification destination details", docs: { summary: "Get notification destination", docUrl: "https://docs.databricks.com/api/azure/workspace/notificationdestinations/get" } },
          { label: "Update notification destination", method: "PATCH", path: "/api/2.0/notification-destinations/DESTINATION_ID", description: "Update notification destination", body: { display_name: "Updated Webhook" }, docs: { summary: "Update notification destination", docUrl: "https://docs.databricks.com/api/azure/workspace/notificationdestinations/update" } },
          { label: "Delete notification destination", method: "DELETE", path: "/api/2.0/notification-destinations/DESTINATION_ID", description: "Delete notification destination", body: {}, docs: { summary: "Delete notification destination", docUrl: "https://docs.databricks.com/api/azure/workspace/notificationdestinations/delete" } }
        ]
      }
    ]
  },
  {
    name: "Account Identity & Access",
    icon: "Users",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Account Users",
        endpoints: [
          { label: "List account users", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/users", description: "List account users", docs: { summary: "List account users", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/list" } },
          { label: "List account users (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/users?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of account users", docs: { summary: "List account users with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/list" } },
          { label: "Get account user", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/users/USER_ID", description: "Get account user", docs: { summary: "Get account user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/get" } },
          { label: "Add account user", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/users", description: "Add account user", body: { emails: ["user@example.com"] }, docs: { summary: "Add account user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/create" } },
          { label: "Delete account user", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/users/USER_ID", description: "Delete account user", body: {}, docs: { summary: "Delete account user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/delete" } }
        ]
      },
      {
        name: "Account Groups",
        endpoints: [
          { label: "List account groups", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/groups", description: "List account groups", docs: { summary: "List account groups", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/list" } },
          { label: "List account groups (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/groups?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of account groups", docs: { summary: "List account groups with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/list" } },
          { label: "Get account group", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/groups/GROUP_ID", description: "Get account group", docs: { summary: "Get account group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/get" } },
          { label: "Create account group", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/groups", description: "Create account group", body: { display_name: "my-group" }, docs: { summary: "Create account group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/create" } },
          { label: "Delete account group", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/groups/GROUP_ID", description: "Delete account group", body: {}, docs: { summary: "Delete account group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/delete" } }
        ]
      },
      {
        name: "SCIM Users",
        endpoints: [
          { label: "List account SCIM users", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users?startIndex=1&count=100", description: "List account SCIM users", docs: { summary: "List SCIM users", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/list" } },
          { label: "List account SCIM users (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users?startIndex=NEXT_INDEX&count=100", description: "Get next page of account SCIM users", docs: { summary: "List SCIM users with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/list" } },
          { label: "Get account SCIM user", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users/USER_ID", description: "Get SCIM user", docs: { summary: "Get SCIM user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/get" } },
          { label: "Create account SCIM user", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users", description: "Create SCIM user", body: { userName: "user@example.com", displayName: "User Name" }, docs: { summary: "Create SCIM user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/create" } },
          { label: "Update account SCIM user", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users/USER_ID", description: "Update SCIM user", body: { displayName: "Updated" }, docs: { summary: "Update SCIM user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/update" } },
          { label: "Patch account SCIM user", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users/USER_ID", description: "Patch SCIM user", body: { Operations: [{ op: "replace", path: "active", value: false }] }, docs: { summary: "Patch SCIM user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/patch" } },
          { label: "Delete account SCIM user", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Users/USER_ID", description: "Delete SCIM user", body: {}, docs: { summary: "Delete SCIM user", docUrl: "https://docs.databricks.com/api/azure/account/accountusers/delete" } }
        ]
      },
      {
        name: "SCIM Groups",
        endpoints: [
          { label: "List account SCIM groups", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Groups?startIndex=1&count=100", description: "List SCIM groups", docs: { summary: "List SCIM groups", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/list" } },
          { label: "List account SCIM groups (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Groups?startIndex=NEXT_INDEX&count=100", description: "Get next page of account SCIM groups", docs: { summary: "List SCIM groups with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/list" } },
          { label: "Get account SCIM group", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Groups/GROUP_ID", description: "Get SCIM group", docs: { summary: "Get SCIM group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/get" } },
          { label: "Create account SCIM group", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Groups", description: "Create SCIM group", body: { displayName: "account-group" }, docs: { summary: "Create SCIM group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/create" } },
          { label: "Patch account SCIM group", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Groups/GROUP_ID", description: "Patch SCIM group", body: { Operations: [{ op: "add", path: "members", value: [{ value: "USER_ID" }] }] }, docs: { summary: "Patch SCIM group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/patch" } },
          { label: "Delete account SCIM group", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/Groups/GROUP_ID", description: "Delete SCIM group", body: {}, docs: { summary: "Delete SCIM group", docUrl: "https://docs.databricks.com/api/azure/account/accountgroups/delete" } }
        ]
      },
      {
        name: "Service Principals",
        endpoints: [
          { label: "List account SCIM service principals", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/ServicePrincipals?startIndex=1&count=100", description: "List SCIM service principals", docs: { summary: "List SCIM service principals", docUrl: "https://docs.databricks.com/api/azure/account/accountserviceprincipals/list" } },
          { label: "List account SCIM service principals (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/ServicePrincipals?startIndex=NEXT_INDEX&count=100", description: "Get next page of account SCIM service principals", docs: { summary: "List SCIM service principals with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountserviceprincipals/list" } },
          { label: "Get account SCIM service principal", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/ServicePrincipals/SP_ID", description: "Get SCIM service principal", docs: { summary: "Get SCIM service principal", docUrl: "https://docs.databricks.com/api/azure/account/accountserviceprincipals/get" } },
          { label: "Create account SCIM service principal", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/ServicePrincipals", description: "Create SCIM service principal", body: { displayName: "account-sp" }, docs: { summary: "Create SCIM service principal", docUrl: "https://docs.databricks.com/api/azure/account/accountserviceprincipals/create" } },
          { label: "Patch account SCIM service principal", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/ServicePrincipals/SP_ID", description: "Patch SCIM service principal", body: { Operations: [{ op: "replace", path: "active", value: true }] }, docs: { summary: "Patch SCIM service principal", docUrl: "https://docs.databricks.com/api/azure/account/accountserviceprincipals/patch" } },
          { label: "Delete account SCIM service principal", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/scim/v2/ServicePrincipals/SP_ID", description: "Delete SCIM service principal", body: {}, docs: { summary: "Delete SCIM service principal", docUrl: "https://docs.databricks.com/api/azure/account/accountserviceprincipals/delete" } }
        ]
      },
      {
        name: "Service Principal Secrets",
        endpoints: [
          { label: "List SP secrets", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/credentials/secrets", description: "List service principal secrets", docs: { summary: "List service principal OAuth secrets", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalsecrets/list" } },
          { label: "Create SP secret", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/credentials/secrets", description: "Create a new service principal secret", body: {}, docs: { summary: "Create service principal OAuth secret", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalsecrets/create" } },
          { label: "Delete SP secret", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/credentials/secrets/SECRET_ID", description: "Delete a service principal secret", body: {}, docs: { summary: "Delete service principal OAuth secret", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalsecrets/delete" } }
        ]
      },
      {
        name: "Access Control",
        endpoints: [
          { label: "Get assignable roles", method: "GET", path: "/api/2.0/preview/accounts/ACCOUNT_ID/access-control/assignable-roles?resource=accounts/ACCOUNT_ID", description: "Get assignable roles for a resource", docs: { summary: "Get assignable roles for a resource", docUrl: "https://docs.databricks.com/api/azure/account/accountaccesscontrol/getassignableroles" } },
          { label: "Get rule set", method: "GET", path: "/api/2.0/preview/accounts/ACCOUNT_ID/access-control/rule-sets?name=accounts/ACCOUNT_ID/ruleSets/default&etag=ETAG", description: "Get an access control rule set", docs: { summary: "Get a rule set", docUrl: "https://docs.databricks.com/api/azure/account/accountaccesscontrol/getruleset" } },
          { label: "Update rule set", method: "PUT", path: "/api/2.0/preview/accounts/ACCOUNT_ID/access-control/rule-sets", description: "Update access control rule set", body: { name: "accounts/ACCOUNT_ID/ruleSets/default", rule_set: { name: "accounts/ACCOUNT_ID/ruleSets/default", grant_rules: [{ role: "roles/servicePrincipal.user", principals: ["users/user@example.com"] }] } }, docs: { summary: "Update a rule set", docUrl: "https://docs.databricks.com/api/azure/account/accountaccesscontrol/updateruleset" } }
        ]
      },
      {
        name: "Workspace Assignment",
        endpoints: [
          { label: "List workspace assignments", method: "GET", path: "/api/2.0/preview/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/permissionassignments", description: "List permission assignments for a workspace", docs: { summary: "List workspace permission assignments", docUrl: "https://docs.databricks.com/api/azure/account/workspaceassignment/list" } },
          { label: "Assign principal to workspace", method: "PUT", path: "/api/2.0/preview/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/permissionassignments/principals/PRINCIPAL_ID", description: "Create or update workspace permission for a principal", body: { permissions: ["USER"] }, docs: { summary: "Create or update workspace assignment", docUrl: "https://docs.databricks.com/api/azure/account/workspaceassignment/update" } },
          { label: "Remove principal from workspace", method: "DELETE", path: "/api/2.0/preview/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/permissionassignments/principals/PRINCIPAL_ID", description: "Remove a principal's workspace permission", body: {}, docs: { summary: "Delete workspace assignment", docUrl: "https://docs.databricks.com/api/azure/account/workspaceassignment/delete" } }
        ]
      }
    ]
  },
  {
    name: "Account Workspaces",
    icon: "Landmark",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Workspaces",
        endpoints: [
          { label: "List workspaces", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces", description: "List account workspaces", docs: { summary: "List account workspaces", docUrl: "https://docs.databricks.com/api/azure/account/workspaces/list" } },
          { label: "List workspaces (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of account workspaces", docs: { summary: "List account workspaces with pagination", docUrl: "https://docs.databricks.com/api/azure/account/workspaces/list" } },
          { label: "Get workspace", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID", description: "Get workspace", docs: { summary: "Get workspace", docUrl: "https://docs.databricks.com/api/azure/account/workspaces/get" } },
          { label: "Create workspace", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces", description: "Create workspace", body: { workspace_name: "my-workspace" }, docs: { summary: "Create workspace", docUrl: "https://docs.databricks.com/api/azure/account/workspaces/create" } },
          { label: "Update workspace", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID", description: "Update workspace", body: { workspace_name: "updated-name" }, docs: { summary: "Update workspace", docUrl: "https://docs.databricks.com/api/azure/account/workspaces/update" } },
          { label: "Delete workspace", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID", description: "Delete workspace", body: {}, docs: { summary: "Delete workspace", docUrl: "https://docs.databricks.com/api/azure/account/workspaces/delete" } }
        ]
      },
      {
        name: "Usage Dashboards",
        endpoints: [
          { label: "Get usage dashboard", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/dashboard", description: "Get the account usage dashboard", docs: { summary: "Get account usage dashboard", docUrl: "https://docs.databricks.com/api/azure/account/usagedashboards/getdashboard" } },
          { label: "Create usage dashboard", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/dashboard", description: "Create account usage dashboard", body: { dashboard_type: "USAGE_DASHBOARD", warehouse_id: "WAREHOUSE_ID" }, docs: { summary: "Create account usage dashboard", docUrl: "https://docs.databricks.com/api/azure/account/usagedashboards/create" } }
        ]
      }
    ]
  },
  {
    name: "Account Unity Catalog",
    icon: "Database",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Account Metastores",
        endpoints: [
          { label: "List metastores", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/metastores", description: "List Unity Catalog metastores", docs: { summary: "List all metastores for the account", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastores/list" } },
          { label: "Get metastore", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID", description: "Get metastore details", docs: { summary: "Get metastore by ID", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastores/get" } },
          { label: "Create metastore", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/metastores", description: "Create a Unity Catalog metastore", body: { name: "my-metastore", storage_root: "abfss://container@storage.dfs.core.windows.net/metastore", region: "eastus" }, docs: { summary: "Create Unity Catalog metastore", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastores/create" } },
          { label: "Update metastore", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID", description: "Update metastore", body: { name: "updated-metastore" }, docs: { summary: "Update metastore configuration", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastores/update" } },
          { label: "Delete metastore", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID", description: "Delete metastore", body: {}, docs: { summary: "Delete metastore", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastores/delete" } }
        ]
      },
      {
        name: "Metastore Assignments",
        endpoints: [
          { label: "List metastore assignments", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/metastores", description: "List metastore assignments for workspace", docs: { summary: "List metastore assignments for a workspace", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastoreassignments/list" } },
          { label: "Assign metastore to workspace", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/metastores/METASTORE_ID", description: "Assign a metastore to a workspace", body: { default_catalog_name: "main" }, docs: { summary: "Create metastore assignment", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastoreassignments/create" } },
          { label: "Update metastore assignment", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/metastores/METASTORE_ID", description: "Update metastore assignment", body: { default_catalog_name: "hive_metastore" }, docs: { summary: "Update metastore assignment", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastoreassignments/update" } },
          { label: "Remove metastore assignment", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/workspaces/WORKSPACE_ID/metastores/METASTORE_ID", description: "Remove metastore from workspace", body: {}, docs: { summary: "Delete metastore assignment", docUrl: "https://docs.databricks.com/api/azure/account/accountmetastoreassignments/delete" } }
        ]
      },
      {
        name: "Storage Credentials",
        endpoints: [
          { label: "List storage credentials", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID/storage-credentials", description: "List storage credentials for a metastore", docs: { summary: "List account storage credentials", docUrl: "https://docs.databricks.com/api/azure/account/accountstoragecredentials/list" } },
          { label: "Get storage credential", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID/storage-credentials/CREDENTIAL_NAME", description: "Get storage credential by name", docs: { summary: "Get account storage credential", docUrl: "https://docs.databricks.com/api/azure/account/accountstoragecredentials/get" } },
          { label: "Create storage credential", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID/storage-credentials", description: "Create a storage credential", body: { name: "my-credential", comment: "Storage credential for ADLS Gen2" }, docs: { summary: "Create account storage credential", docUrl: "https://docs.databricks.com/api/azure/account/accountstoragecredentials/create" } },
          { label: "Update storage credential", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID/storage-credentials/CREDENTIAL_NAME", description: "Update a storage credential", body: { comment: "Updated credential" }, docs: { summary: "Update account storage credential", docUrl: "https://docs.databricks.com/api/azure/account/accountstoragecredentials/update" } },
          { label: "Delete storage credential", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/metastores/METASTORE_ID/storage-credentials/CREDENTIAL_NAME", description: "Delete a storage credential", body: {}, docs: { summary: "Delete account storage credential", docUrl: "https://docs.databricks.com/api/azure/account/accountstoragecredentials/delete" } }
        ]
      }
    ]
  },
  {
    name: "Account Networking",
    icon: "Network",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Networks",
        endpoints: [
          { label: "List networks", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/networks", description: "List networks", docs: { summary: "List networks", docUrl: "https://docs.databricks.com/api/azure/account/accountnetworks/list" } },
          { label: "List networks (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/networks?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of networks", docs: { summary: "List networks with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountnetworks/list" } },
          { label: "Get network", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/networks/NETWORK_ID", description: "Get network", docs: { summary: "Get network", docUrl: "https://docs.databricks.com/api/azure/account/accountnetworks/get" } },
          { label: "Create network", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/networks", description: "Create network", body: { network_name: "my-network", vpc_id: "vpc-123" }, docs: { summary: "Create network", docUrl: "https://docs.databricks.com/api/azure/account/accountnetworks/create" } },
          { label: "Update network", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/networks/NETWORK_ID", description: "Update network", body: { network_name: "updated-network" }, docs: { summary: "Update network", docUrl: "https://docs.databricks.com/api/azure/account/accountnetworks/update" } },
          { label: "Delete network", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/networks/NETWORK_ID", description: "Delete network", body: {}, docs: { summary: "Delete network", docUrl: "https://docs.databricks.com/api/azure/account/accountnetworks/delete" } }
        ]
      },
      {
        name: "VPC Endpoints",
        endpoints: [
          { label: "List VPC endpoints", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/vpc-endpoints", description: "List VPC endpoints", docs: { summary: "List VPC endpoints", docUrl: "https://docs.databricks.com/api/azure/account/accountvpcendpoints/list" } },
          { label: "List VPC endpoints (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/vpc-endpoints?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of VPC endpoints", docs: { summary: "List VPC endpoints with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountvpcendpoints/list" } },
          { label: "Get VPC endpoint", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/vpc-endpoints/ENDPOINT_ID", description: "Get VPC endpoint", docs: { summary: "Get VPC endpoint", docUrl: "https://docs.databricks.com/api/azure/account/accountvpcendpoints/get" } },
          { label: "Create VPC endpoint", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/vpc-endpoints", description: "Create VPC endpoint", body: { vpc_endpoint_name: "my-endpoint" }, docs: { summary: "Create VPC endpoint", docUrl: "https://docs.databricks.com/api/azure/account/accountvpcendpoints/create" } },
          { label: "Delete VPC endpoint", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/vpc-endpoints/ENDPOINT_ID", description: "Delete VPC endpoint", body: {}, docs: { summary: "Delete VPC endpoint", docUrl: "https://docs.databricks.com/api/azure/account/accountvpcendpoints/delete" } }
        ]
      },
      {
        name: "Private Access",
        endpoints: [
          { label: "List private access settings", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings", description: "List private access settings", docs: { summary: "List private access settings", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/list" } },
          { label: "List private access settings (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of private access settings", docs: { summary: "List private access settings with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/list" } },
          { label: "Get private access setting", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings/PAS_ID", description: "Get private access setting", docs: { summary: "Get private access setting", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/get" } },
          { label: "Create private access setting", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings", description: "Create private access setting", body: { private_access_settings_name: "my-pas" }, docs: { summary: "Create private access setting", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/create" } },
          { label: "Replace private access setting", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings/PAS_ID", description: "Replace private access setting", body: { private_access_settings_name: "updated-pas" }, docs: { summary: "Replace private access setting", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/replace" } },
          { label: "Update private access setting", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings/PAS_ID", description: "Update private access setting", body: { private_access_settings_name: "patched-pas" }, docs: { summary: "Update private access setting", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/update" } },
          { label: "Delete private access setting", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/private-access-settings/PAS_ID", description: "Delete private access setting", body: {}, docs: { summary: "Delete private access setting", docUrl: "https://docs.databricks.com/api/azure/account/accountprivateaccesssettings/delete" } }
        ]
      },
      {
        name: "Network Connectivity",
        endpoints: [
          { label: "List network connectivity configs", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/network-connectivity-configs", description: "List network connectivity configurations", docs: { summary: "List NCC configs for serverless compute", docUrl: "https://docs.databricks.com/api/azure/account/networkconnectivity/listnetworkconnectivityconfigurations" } },
          { label: "List network connectivity configs (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/network-connectivity-configs?page_token=NEXT_PAGE_TOKEN", description: "Get next page of NCC configs", docs: { summary: "List NCC configs with pagination", docUrl: "https://docs.databricks.com/api/azure/account/networkconnectivity/listnetworkconnectivityconfigurations" } },
          { label: "Get network connectivity config", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/network-connectivity-configs/CONFIG_ID", description: "Get NCC config details", docs: { summary: "Get NCC config", docUrl: "https://docs.databricks.com/api/azure/account/networkconnectivity/getnetworkconnectivityconfiguration" } },
          { label: "Create network connectivity config", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/network-connectivity-configs", description: "Create NCC config", body: { name: "my-ncc", region: "eastus" }, docs: { summary: "Create NCC config", docUrl: "https://docs.databricks.com/api/azure/account/networkconnectivity/createnetworkconnectivityconfiguration" } },
          { label: "Delete network connectivity config", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/network-connectivity-configs/CONFIG_ID", description: "Delete NCC config", body: {}, docs: { summary: "Delete NCC config", docUrl: "https://docs.databricks.com/api/azure/account/networkconnectivity/deletenetworkconnectivityconfiguration" } }
        ]
      },
      {
        name: "Network Policies",
        endpoints: [
          { label: "List network policies", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/network-policies", description: "List account network policies", docs: { summary: "List network policies", docUrl: "https://docs.databricks.com/api/azure/account/networkpolicies/list" } },
          { label: "List network policies (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/network-policies?page_token=NEXT_PAGE_TOKEN", description: "Get next page of network policies", docs: { summary: "List network policies with pagination", docUrl: "https://docs.databricks.com/api/azure/account/networkpolicies/list" } },
          { label: "Get network policy", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/network-policies/POLICY_ID", description: "Get network policy details", docs: { summary: "Get network policy", docUrl: "https://docs.databricks.com/api/azure/account/networkpolicies/get" } },
          { label: "Create network policy", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/network-policies", description: "Create a network policy", body: { name: "my-network-policy", egress: { network_access: { restriction_mode: "RESTRICTED", allowed_internet_destinations: [{ destination: "example.com", type: "FQDN" }] } } }, docs: { summary: "Create network policy", docUrl: "https://docs.databricks.com/api/azure/account/networkpolicies/create" } },
          { label: "Update network policy", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/network-policies/POLICY_ID", description: "Update a network policy", body: { name: "updated-policy" }, docs: { summary: "Update network policy", docUrl: "https://docs.databricks.com/api/azure/account/networkpolicies/update" } },
          { label: "Delete network policy", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/network-policies/POLICY_ID", description: "Delete a network policy", body: {}, docs: { summary: "Delete network policy", docUrl: "https://docs.databricks.com/api/azure/account/networkpolicies/delete" } }
        ]
      },
      {
        name: "Workspace Network Config",
        endpoints: [
          { label: "Get workspace network config", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/workspace-network-option/WORKSPACE_ID", description: "Get network policy binding for a workspace", docs: { summary: "Get workspace network configuration", docUrl: "https://docs.databricks.com/api/azure/account/workspacenetworkconfiguration/get" } },
          { label: "Update workspace network config", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/workspace-network-option/WORKSPACE_ID", description: "Set network policy binding for a workspace", body: { workspace_id: 123456789, network_policy_id: "my-network-policy" }, docs: { summary: "Update workspace network configuration", docUrl: "https://docs.databricks.com/api/azure/account/workspacenetworkconfiguration/update" } }
        ]
      }
    ]
  },
  {
    name: "Account Security",
    icon: "Server",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Credentials",
        endpoints: [
          { label: "List credentials", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/credentials", description: "List account credentials", docs: { summary: "List credentials", docUrl: "https://docs.databricks.com/api/azure/account/accountcredentials/list" } },
          { label: "List credentials (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/credentials?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of credentials", docs: { summary: "List credentials with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountcredentials/list" } },
          { label: "Get credential", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/credentials/CREDENTIAL_ID", description: "Get credential", docs: { summary: "Get credential", docUrl: "https://docs.databricks.com/api/azure/account/accountcredentials/get" } },
          { label: "Create credential", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/credentials", description: "Create credential", body: { name: "my-credential", aws_credentials: { sts_role: { role_arn: "arn:aws:iam::123456789:role/example" } } }, docs: { summary: "Create credential", docUrl: "https://docs.databricks.com/api/azure/account/accountcredentials/create" } },
          { label: "Update credential", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/credentials/CREDENTIAL_ID", description: "Update credential", body: { name: "updated-credential" }, docs: { summary: "Update credential", docUrl: "https://docs.databricks.com/api/azure/account/accountcredentials/update" } },
          { label: "Delete credential", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/credentials/CREDENTIAL_ID", description: "Delete credential", body: {}, docs: { summary: "Delete credential", docUrl: "https://docs.databricks.com/api/azure/account/accountcredentials/delete" } }
        ]
      },
      {
        name: "Storage Configurations",
        endpoints: [
          { label: "List storage configs", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/storage-configurations", description: "List storage configs", docs: { summary: "List storage configurations", docUrl: "https://docs.databricks.com/api/azure/account/accountstorageconfigurations/list" } },
          { label: "List storage configs (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/storage-configurations?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of storage configs", docs: { summary: "List storage configurations with pagination", docUrl: "https://docs.databricks.com/api/azure/account/accountstorageconfigurations/list" } },
          { label: "Get storage config", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/storage-configurations/STORAGE_CONFIG_ID", description: "Get storage config", docs: { summary: "Get storage configuration", docUrl: "https://docs.databricks.com/api/azure/account/accountstorageconfigurations/get" } },
          { label: "Create storage config", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/storage-configurations", description: "Create storage config", body: { name: "my-storage", bucket_name: "my-bucket" }, docs: { summary: "Create storage configuration", docUrl: "https://docs.databricks.com/api/azure/account/accountstorageconfigurations/create" } },
          { label: "Update storage config", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/storage-configurations/STORAGE_CONFIG_ID", description: "Update storage config", body: { name: "updated-storage" }, docs: { summary: "Update storage configuration", docUrl: "https://docs.databricks.com/api/azure/account/accountstorageconfigurations/update" } },
          { label: "Delete storage config", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/storage-configurations/STORAGE_CONFIG_ID", description: "Delete storage config", body: {}, docs: { summary: "Delete storage configuration", docUrl: "https://docs.databricks.com/api/azure/account/accountstorageconfigurations/delete" } }
        ]
      },
      {
        name: "Customer Managed Keys",
        endpoints: [
          { label: "List customer-managed keys", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/customer-managed-keys", description: "List CMKs", docs: { summary: "List customer-managed keys", docUrl: "https://docs.databricks.com/api/azure/account/encryptionkeys/list" } },
          { label: "List customer-managed keys (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/customer-managed-keys?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of CMKs", docs: { summary: "List customer-managed keys with pagination", docUrl: "https://docs.databricks.com/api/azure/account/encryptionkeys/list" } },
          { label: "Get customer-managed key", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/customer-managed-keys/KEY_ID", description: "Get CMK", docs: { summary: "Get customer-managed key", docUrl: "https://docs.databricks.com/api/azure/account/encryptionkeys/get" } },
          { label: "Create customer-managed key", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/customer-managed-keys", description: "Create CMK", body: { use_cases: ["MANAGED_SERVICES"], aws_key_info: { key_arn: "arn:aws:kms:region:acct:key/id" } }, docs: { summary: "Create customer-managed key", docUrl: "https://docs.databricks.com/api/azure/account/encryptionkeys/create" } },
          { label: "Delete customer-managed key", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/customer-managed-keys/KEY_ID", description: "Delete CMK", body: {}, docs: { summary: "Delete customer-managed key", docUrl: "https://docs.databricks.com/api/azure/account/encryptionkeys/delete" } }
        ]
      },
      {
        name: "Account IP Access Lists",
        endpoints: [
          { label: "List account IP access lists", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/ip-access-lists", description: "List account-level IP access lists", docs: { summary: "List account IP access lists", docUrl: "https://docs.databricks.com/api/azure/account/accountipaccesslists/list" } },
          { label: "Get account IP access list", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/ip-access-lists/LIST_ID", description: "Get account IP access list details", docs: { summary: "Get account IP access list", docUrl: "https://docs.databricks.com/api/azure/account/accountipaccesslists/get" } },
          { label: "Create account IP access list", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/ip-access-lists", description: "Create account-level IP access list", body: { label: "office-ips", list_type: "ALLOW", ip_addresses: ["1.2.3.4/32"] }, docs: { summary: "Create account IP access list", docUrl: "https://docs.databricks.com/api/azure/account/accountipaccesslists/create" } },
          { label: "Update account IP access list", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/ip-access-lists/LIST_ID", description: "Update account IP access list", body: { label: "updated-ips", ip_addresses: ["1.2.3.0/24"] }, docs: { summary: "Update account IP access list", docUrl: "https://docs.databricks.com/api/azure/account/accountipaccesslists/replace" } },
          { label: "Delete account IP access list", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/ip-access-lists/LIST_ID", description: "Delete account IP access list", body: {}, docs: { summary: "Delete account IP access list", docUrl: "https://docs.databricks.com/api/azure/account/accountipaccesslists/delete" } }
        ]
      },
      {
        name: "Account Settings",
        endpoints: [
          { label: "Get CSP enablement", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/shield_csp_enablement_ac/names/default", description: "Get compliance security profile setting", docs: { summary: "Get CSP enablement setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/getcsp" } },
          { label: "Update CSP enablement", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/shield_csp_enablement_ac/names/default", description: "Update compliance security profile", body: { setting: { namespace: "default", setting_name: "default", csp_enablement_account: { is_enforced: true }, etag: "ETAG" }, allow_missing: true, field_mask: "csp_enablement_account.is_enforced" }, docs: { summary: "Update CSP enablement setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/updatecsp" } },
          { label: "Get ESM enablement", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/shield_esm_enablement_ac/names/default", description: "Get enhanced security monitoring setting", docs: { summary: "Get ESM enablement setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/getesm" } },
          { label: "Update ESM enablement", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/shield_esm_enablement_ac/names/default", description: "Update enhanced security monitoring", body: { setting: { namespace: "default", setting_name: "default", esm_enablement_account: { is_enforced: true }, etag: "ETAG" }, allow_missing: true, field_mask: "esm_enablement_account.is_enforced" }, docs: { summary: "Update ESM enablement setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/updateesm" } },
          { label: "Get disable legacy features", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/disable_legacy_features/names/default", description: "Get disable legacy features setting", docs: { summary: "Get disable legacy features setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/getdisablelegacyfeatures" } },
          { label: "Update disable legacy features", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/disable_legacy_features/names/default", description: "Update disable legacy features", body: { setting: { namespace: "default", setting_name: "default", disable_legacy_features: { is_enabled: true }, etag: "ETAG" }, allow_missing: true, field_mask: "disable_legacy_features.is_enabled" }, docs: { summary: "Update disable legacy features setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/updatedisablelegacyfeatures" } },
          { label: "Delete disable legacy features", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/settings/types/disable_legacy_features/names/default", description: "Reset disable legacy features setting", body: {}, docs: { summary: "Delete disable legacy features setting", docUrl: "https://docs.databricks.com/api/azure/account/settings/deletedisablelegacyfeatures" } }
        ]
      }
    ]
  },
  {
    name: "Account Billing",
    icon: "Receipt",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Billable Usage",
        endpoints: [
          { label: "Download billable usage", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/usage/download?start_time=START&end_time=END", description: "Download billable usage", docs: { summary: "Download billable usage", docUrl: "https://docs.databricks.com/api/azure/account/billableusage/download" } }
        ]
      },
      {
        name: "Log Delivery",
        endpoints: [
          { label: "List log delivery configs", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/log-delivery", description: "List log delivery configs", docs: { summary: "List log delivery", docUrl: "https://docs.databricks.com/api/azure/account/logdelivery/list" } },
          { label: "List log delivery configs (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/log-delivery?page_token=NEXT_PAGE_TOKEN&limit=100", description: "Get next page of log delivery configs", docs: { summary: "List log delivery with pagination", docUrl: "https://docs.databricks.com/api/azure/account/logdelivery/list" } },
          { label: "Get log delivery config", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/log-delivery/LOG_DELIVERY_ID", description: "Get log delivery config", docs: { summary: "Get log delivery", docUrl: "https://docs.databricks.com/api/azure/account/logdelivery/get" } },
          { label: "Create log delivery config", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/log-delivery", description: "Create log delivery config", body: { config_name: "my-logs", output_format: "json", credentials_id: "CREDENTIAL_ID", storage_configuration_id: "STORAGE_CONFIG_ID" }, docs: { summary: "Create log delivery", docUrl: "https://docs.databricks.com/api/azure/account/logdelivery/create" } },
          { label: "Update log delivery config", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/log-delivery/LOG_DELIVERY_ID", description: "Update log delivery config", body: { config_name: "updated-logs" }, docs: { summary: "Update log delivery", docUrl: "https://docs.databricks.com/api/azure/account/logdelivery/update" } },
          { label: "Delete log delivery config", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/log-delivery/LOG_DELIVERY_ID", description: "Delete log delivery config", body: {}, docs: { summary: "Delete log delivery", docUrl: "https://docs.databricks.com/api/azure/account/logdelivery/delete" } }
        ]
      },
      {
        name: "Budget Configurations",
        endpoints: [
          { label: "List budgets", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/budget-configurations", description: "List account budget configurations", docs: { summary: "List budget configurations", docUrl: "https://docs.databricks.com/api/azure/account/budgets/list" } },
          { label: "List budgets (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/budget-configurations?page_token=NEXT_PAGE_TOKEN", description: "Get next page of budget configurations", docs: { summary: "List budget configurations with pagination", docUrl: "https://docs.databricks.com/api/azure/account/budgets/list" } },
          { label: "Get budget", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/budget-configurations/BUDGET_ID", description: "Get budget configuration details", docs: { summary: "Get budget configuration", docUrl: "https://docs.databricks.com/api/azure/account/budgets/get" } },
          { label: "Create budget", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/budget-configurations", description: "Create a budget configuration", body: { budget_configuration: { display_name: "Monthly Budget", period: "MONTHLY", start_date: "2024-01-01", target_amount: "10000", alert_configurations: [{ time_period: "MONTH", trigger_type: "CUMULATIVE_SPENDING_EXCEEDED", quantity_type: "LIST_PRICE_DOLLARS_USD", quantity_threshold: "8000", action_configurations: [{ action_type: "EMAIL_NOTIFICATION", target: "admin@example.com" }] }] } }, docs: { summary: "Create budget configuration", docUrl: "https://docs.databricks.com/api/azure/account/budgets/create" } },
          { label: "Update budget", method: "PUT", path: "/api/2.0/accounts/ACCOUNT_ID/budget-configurations/BUDGET_ID", description: "Update a budget configuration", body: { budget_configuration: { display_name: "Updated Budget", target_amount: "15000" } }, docs: { summary: "Update budget configuration", docUrl: "https://docs.databricks.com/api/azure/account/budgets/update" } },
          { label: "Delete budget", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/budget-configurations/BUDGET_ID", description: "Delete a budget configuration", body: {}, docs: { summary: "Delete budget configuration", docUrl: "https://docs.databricks.com/api/azure/account/budgets/delete" } }
        ]
      },
      {
        name: "Budget Policies",
        endpoints: [
          { label: "List account budget policies", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/budget-policies", description: "List account-level budget policies", docs: { summary: "List account budget policies", docUrl: "https://docs.databricks.com/api/azure/account/budgetpolicy/list" } },
          { label: "List account budget policies (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/budget-policies?page_token=NEXT_PAGE_TOKEN", description: "Get next page of account budget policies", docs: { summary: "List account budget policies with pagination", docUrl: "https://docs.databricks.com/api/azure/account/budgetpolicy/list" } },
          { label: "Get account budget policy", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/budget-policies/POLICY_ID", description: "Get account budget policy details", docs: { summary: "Get account budget policy", docUrl: "https://docs.databricks.com/api/azure/account/budgetpolicy/get" } },
          { label: "Create account budget policy", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/budget-policies", description: "Create an account-level budget policy", body: { policy_name: "Serverless Compute Budget" }, docs: { summary: "Create account budget policy", docUrl: "https://docs.databricks.com/api/azure/account/budgetpolicy/create" } },
          { label: "Update account budget policy", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/budget-policies/POLICY_ID", description: "Update an account budget policy", body: { policy_name: "Updated Policy" }, docs: { summary: "Update account budget policy", docUrl: "https://docs.databricks.com/api/azure/account/budgetpolicy/update" } },
          { label: "Delete account budget policy", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/budget-policies/POLICY_ID", description: "Delete an account budget policy", body: {}, docs: { summary: "Delete account budget policy", docUrl: "https://docs.databricks.com/api/azure/account/budgetpolicy/delete" } }
        ]
      }
    ]
  },
  {
    name: "Vector Search",
    icon: "Search",
    subcategories: [
      {
        name: "Endpoints",
        endpoints: [
          { label: "List vector search endpoints", method: "GET", path: "/api/2.0/vector-search/endpoints", description: "List all vector search endpoints", docs: { summary: "List vector search endpoints", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchendpoints/listendpoints" } },
          { label: "Create vector search endpoint", method: "POST", path: "/api/2.0/vector-search/endpoints", description: "Create a vector search endpoint", body: { name: "my-endpoint", endpoint_type: "STANDARD" }, docs: { summary: "Create vector search endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchendpoints/createendpoint" } },
          { label: "Get vector search endpoint", method: "GET", path: "/api/2.0/vector-search/endpoints/ENDPOINT_NAME", description: "Get endpoint details", docs: { summary: "Get vector search endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchendpoints/getendpoint" } },
          { label: "Delete vector search endpoint", method: "DELETE", path: "/api/2.0/vector-search/endpoints/ENDPOINT_NAME", description: "Delete a vector search endpoint", body: {}, docs: { summary: "Delete vector search endpoint", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchendpoints/deleteendpoint" } }
        ]
      },
      {
        name: "Indexes",
        endpoints: [
          { label: "List indexes", method: "GET", path: "/api/2.0/vector-search/indexes?endpoint_name=ENDPOINT_NAME", description: "List indexes", docs: { summary: "List vector indexes", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/listindexes" } },
          { label: "List indexes (paginated)", method: "GET", path: "/api/2.0/vector-search/indexes?endpoint_name=ENDPOINT_NAME&page_token=NEXT_PAGE_TOKEN", description: "Get next page of indexes", docs: { summary: "List vector indexes with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/listindexes" } },
          { label: "Create index", method: "POST", path: "/api/2.0/vector-search/indexes", description: "Create vector index", body: { name: "my-index", endpoint_name: "ENDPOINT_NAME", primary_key: "id", index_type: "DELTA_SYNC", delta_sync_index_spec: { source_table: "CATALOG.SCHEMA.TABLE", embedding_source_columns: [{ name: "text", model_endpoint_name: "e5-small-v2" }], pipeline_type: "TRIGGERED" } }, docs: { summary: "Create vector search index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/createindex" } },
          { label: "Get vector index", method: "GET", path: "/api/2.0/vector-search/indexes/INDEX_NAME", description: "Get vector index details", docs: { summary: "Get vector index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/getindex" } },
          { label: "Delete vector index", method: "DELETE", path: "/api/2.0/vector-search/indexes/INDEX_NAME", description: "Delete vector index", body: {}, docs: { summary: "Delete vector index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/deleteindex" } },
          { label: "Sync index", method: "POST", path: "/api/2.0/vector-search/indexes/INDEX_NAME/sync", description: "Trigger sync for delta sync index", body: {}, docs: { summary: "Sync vector index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/syncindex" } },
          { label: "Query index", method: "POST", path: "/api/2.0/vector-search/indexes/INDEX_NAME/query", description: "Query vector search index", body: { query_vector: [0.1, 0.2, 0.3], columns: ["id", "text"], num_results: 10 }, docs: { summary: "Query vector index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/queryindex" } },
          { label: "Scan index", method: "POST", path: "/api/2.0/vector-search/indexes/INDEX_NAME/scan", description: "Scan vector search index data", body: { num_results: 10 }, docs: { summary: "Scan vector index data", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/scanindex" } },
          { label: "Upsert data", method: "POST", path: "/api/2.0/vector-search/indexes/INDEX_NAME/upsert-data", description: "Upsert data into direct access index", body: { inputs_json: "[{\"id\": 1, \"text\": \"hello\"}]" }, docs: { summary: "Upsert data into index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/upsertdatapoints" } },
          { label: "Delete data", method: "POST", path: "/api/2.0/vector-search/indexes/INDEX_NAME/delete-data", description: "Delete data from direct access index", body: { primary_keys: ["1", "2"] }, docs: { summary: "Delete data from index", docUrl: "https://docs.databricks.com/api/azure/workspace/vectorsearchindexes/deletedatapoints" } }
        ]
      }
    ]
  },
  {
    name: "Delta Sharing",
    icon: "Share2",
    subcategories: [
      {
        name: "Shares",
        endpoints: [
          { label: "List shares", method: "GET", path: "/api/2.1/unity-catalog/shares", description: "List all shares", docs: { summary: "List shares", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/list" } },
          { label: "Get share", method: "GET", path: "/api/2.1/unity-catalog/shares/SHARE_NAME", description: "Get share details", docs: { summary: "Get share", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/get" } },
          { label: "Create share", method: "POST", path: "/api/2.1/unity-catalog/shares", description: "Create new share", body: { name: "my_share", comment: "My share" }, docs: { summary: "Create share", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/create" } },
          { label: "Update share", method: "PATCH", path: "/api/2.1/unity-catalog/shares/SHARE_NAME", description: "Update share", body: { comment: "Updated share" }, docs: { summary: "Update share", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/update" } },
          { label: "Delete share", method: "DELETE", path: "/api/2.1/unity-catalog/shares/SHARE_NAME", description: "Delete share", body: {}, docs: { summary: "Delete share", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/delete" } },
          { label: "List share permissions", method: "GET", path: "/api/2.1/unity-catalog/shares/SHARE_NAME/permissions", description: "List share permissions", docs: { summary: "List share permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/sharepermissions" } },
          { label: "Update share permissions", method: "PATCH", path: "/api/2.1/unity-catalog/shares/SHARE_NAME/permissions", description: "Update share permissions", body: { changes: [{ principal: "user@example.com", add: ["SELECT"] }] }, docs: { summary: "Update share permissions", docUrl: "https://docs.databricks.com/api/azure/workspace/shares/updatesharepermissions" } }
        ]
      },
      {
        name: "Recipients",
        endpoints: [
          { label: "List recipients", method: "GET", path: "/api/2.1/unity-catalog/recipients", description: "List recipients", docs: { summary: "List recipients", docUrl: "https://docs.databricks.com/api/azure/workspace/recipients/list" } },
          { label: "Get recipient", method: "GET", path: "/api/2.1/unity-catalog/recipients/RECIPIENT_NAME", description: "Get recipient details", docs: { summary: "Get recipient", docUrl: "https://docs.databricks.com/api/azure/workspace/recipients/get" } },
          { label: "Create recipient", method: "POST", path: "/api/2.1/unity-catalog/recipients", description: "Create recipient", body: { name: "my_recipient", comment: "My recipient", authentication_type: "TOKEN" }, docs: { summary: "Create recipient", docUrl: "https://docs.databricks.com/api/azure/workspace/recipients/create" } },
          { label: "Update recipient", method: "PATCH", path: "/api/2.1/unity-catalog/recipients/RECIPIENT_NAME", description: "Update recipient", body: { comment: "Updated recipient" }, docs: { summary: "Update recipient", docUrl: "https://docs.databricks.com/api/azure/workspace/recipients/update" } },
          { label: "Delete recipient", method: "DELETE", path: "/api/2.1/unity-catalog/recipients/RECIPIENT_NAME", description: "Delete recipient", body: {}, docs: { summary: "Delete recipient", docUrl: "https://docs.databricks.com/api/azure/workspace/recipients/delete" } },
          { label: "Rotate recipient token", method: "POST", path: "/api/2.1/unity-catalog/recipients/RECIPIENT_NAME/rotate-token", description: "Rotate recipient token", body: { existing_token_expire_in_seconds: 0 }, docs: { summary: "Rotate recipient token", docUrl: "https://docs.databricks.com/api/azure/workspace/recipients/rotatetoken" } },
        ]
      },
      {
        name: "Providers",
        endpoints: [
          { label: "List providers", method: "GET", path: "/api/2.1/unity-catalog/providers", description: "List providers", docs: { summary: "List providers", docUrl: "https://docs.databricks.com/api/azure/workspace/providers/list" } },
          { label: "Get provider", method: "GET", path: "/api/2.1/unity-catalog/providers/PROVIDER_NAME", description: "Get provider details", docs: { summary: "Get provider", docUrl: "https://docs.databricks.com/api/azure/workspace/providers/get" } },
          { label: "Create provider", method: "POST", path: "/api/2.1/unity-catalog/providers", description: "Create provider", body: { name: "my_provider", comment: "My provider", authentication_type: "TOKEN", recipient_profile_str: "{}" }, docs: { summary: "Create provider", docUrl: "https://docs.databricks.com/api/azure/workspace/providers/create" } },
          { label: "Update provider", method: "PATCH", path: "/api/2.1/unity-catalog/providers/PROVIDER_NAME", description: "Update provider", body: { comment: "Updated provider" }, docs: { summary: "Update provider", docUrl: "https://docs.databricks.com/api/azure/workspace/providers/update" } },
          { label: "Delete provider", method: "DELETE", path: "/api/2.1/unity-catalog/providers/PROVIDER_NAME", description: "Delete provider", body: {}, docs: { summary: "Delete provider", docUrl: "https://docs.databricks.com/api/azure/workspace/providers/delete" } },
          { label: "List provider shares", method: "GET", path: "/api/2.1/unity-catalog/providers/PROVIDER_NAME/shares", description: "List provider shares", docs: { summary: "List provider shares", docUrl: "https://docs.databricks.com/api/azure/workspace/providers/listshares" } }
        ]
      }
    ]
  },
  {
    name: "AI/BI",
    icon: "Sparkles",
    subcategories: [
      {
        name: "Lakeview Dashboards",
        endpoints: [
          { label: "List dashboards", method: "GET", path: "/api/2.0/lakeview/dashboards?page_size=100", description: "List Lakeview dashboards", docs: { summary: "List AI/BI dashboards", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/list" } },
          { label: "List dashboards (paginated)", method: "GET", path: "/api/2.0/lakeview/dashboards?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of dashboards", docs: { summary: "List dashboards with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/list" } },
          { label: "Create dashboard", method: "POST", path: "/api/2.0/lakeview/dashboards", description: "Create Lakeview dashboard", body: { display_name: "My Dashboard", warehouse_id: "WAREHOUSE_ID", serialized_dashboard: "{}" }, docs: { summary: "Create AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/create" } },
          { label: "Get dashboard", method: "GET", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID", description: "Get dashboard details", docs: { summary: "Get AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/get" } },
          { label: "Update dashboard", method: "PATCH", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID", description: "Update dashboard", body: { display_name: "Updated Dashboard" }, docs: { summary: "Update AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/update" } },
          { label: "Trash dashboard", method: "DELETE", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID", description: "Move dashboard to trash", body: {}, docs: { summary: "Trash AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/trash" } },
          { label: "Publish dashboard", method: "POST", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/published", description: "Publish dashboard", body: { warehouse_id: "WAREHOUSE_ID", embed_credentials: true }, docs: { summary: "Publish AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/publish" } },
          { label: "Get published dashboard", method: "GET", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/published", description: "Get published dashboard", docs: { summary: "Get published AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/getpublished" } },
          { label: "Unpublish dashboard", method: "DELETE", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/published", description: "Unpublish dashboard", body: {}, docs: { summary: "Unpublish AI/BI dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/unpublish" } },
          { label: "Migrate dashboard", method: "POST", path: "/api/2.0/lakeview/dashboards/migrate", description: "Migrate legacy dashboard to Lakeview", body: { source_dashboard_id: "LEGACY_DASHBOARD_ID" }, docs: { summary: "Migrate legacy dashboard", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/migrate" } }
        ]
      },
      {
        name: "Lakeview Schedules",
        endpoints: [
          { label: "List schedules", method: "GET", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules", description: "List dashboard schedules", docs: { summary: "List Lakeview dashboard schedules", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/listschedules" } },
          { label: "Create schedule", method: "POST", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules", description: "Create a schedule for dashboard", body: { cron_schedule: { quartz_cron_expression: "0 0 8 * * ?", timezone_id: "America/Los_Angeles" } }, docs: { summary: "Create Lakeview dashboard schedule", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/createschedule" } },
          { label: "Get schedule", method: "GET", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID", description: "Get schedule details", docs: { summary: "Get Lakeview dashboard schedule", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/getschedule" } },
          { label: "Update schedule", method: "PUT", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID", description: "Update a schedule", body: { cron_schedule: { quartz_cron_expression: "0 0 9 * * ?" } }, docs: { summary: "Update Lakeview dashboard schedule", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/updateschedule" } },
          { label: "Delete schedule", method: "DELETE", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID", description: "Delete a schedule", body: {}, docs: { summary: "Delete Lakeview dashboard schedule", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/deleteschedule" } }
        ]
      },
      {
        name: "Lakeview Subscriptions",
        endpoints: [
          { label: "List subscriptions", method: "GET", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID/subscriptions", description: "List schedule subscriptions", docs: { summary: "List Lakeview dashboard subscriptions", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/listsubscriptions" } },
          { label: "Create subscription", method: "POST", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID/subscriptions", description: "Subscribe to schedule", body: { subscriber: { destination_subscriber: { destination_id: "DESTINATION_ID" } } }, docs: { summary: "Create Lakeview subscription", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/createsubscription" } },
          { label: "Get subscription", method: "GET", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID/subscriptions/SUBSCRIPTION_ID", description: "Get subscription details", docs: { summary: "Get Lakeview subscription", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/getsubscription" } },
          { label: "Delete subscription", method: "DELETE", path: "/api/2.0/lakeview/dashboards/DASHBOARD_ID/schedules/SCHEDULE_ID/subscriptions/SUBSCRIPTION_ID", description: "Delete a subscription", body: {}, docs: { summary: "Delete Lakeview subscription", docUrl: "https://docs.databricks.com/api/azure/workspace/lakeview/deletesubscription" } }
        ]
      },
      {
        name: "Genie",
        endpoints: [
          { label: "List Genie spaces", method: "GET", path: "/api/2.0/genie/spaces", description: "List Genie spaces", docs: { summary: "List Genie spaces", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/listspaces" } },
          { label: "Create Genie space", method: "POST", path: "/api/2.0/genie/spaces", description: "Create Genie space", body: { display_name: "My Genie Space" }, docs: { summary: "Create Genie space", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/createspace" } },
          { label: "Get Genie space", method: "GET", path: "/api/2.0/genie/spaces/SPACE_ID", description: "Get Genie space details", docs: { summary: "Get Genie space", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/getspace" } },
          { label: "Update Genie space", method: "PATCH", path: "/api/2.0/genie/spaces/SPACE_ID", description: "Update Genie space", body: { display_name: "Updated Space" }, docs: { summary: "Update Genie space", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/updatespace" } },
          { label: "Delete Genie space", method: "DELETE", path: "/api/2.0/genie/spaces/SPACE_ID", description: "Delete Genie space", body: {}, docs: { summary: "Delete Genie space", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/deletespace" } },
          { label: "Start conversation", method: "POST", path: "/api/2.0/genie/spaces/SPACE_ID/start-conversation", description: "Start a Genie conversation", body: { content: "Show me top 10 customers" }, docs: { summary: "Start Genie conversation", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/startconversation" } },
          { label: "Create message", method: "POST", path: "/api/2.0/genie/spaces/SPACE_ID/conversations/CONVERSATION_ID/messages", description: "Send a message in a conversation", body: { content: "Filter by last 30 days" }, docs: { summary: "Create Genie message", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/createmessage" } },
          { label: "Get message", method: "GET", path: "/api/2.0/genie/spaces/SPACE_ID/conversations/CONVERSATION_ID/messages/MESSAGE_ID", description: "Get Genie message details", docs: { summary: "Get Genie message", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/getmessage" } },
          { label: "Get message query result", method: "GET", path: "/api/2.0/genie/spaces/SPACE_ID/conversations/CONVERSATION_ID/messages/MESSAGE_ID/query-result", description: "Get message SQL query result", docs: { summary: "Get Genie message query result", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/getmessagequeryresult" } },
          { label: "Execute message query", method: "POST", path: "/api/2.0/genie/spaces/SPACE_ID/conversations/CONVERSATION_ID/messages/MESSAGE_ID/execute-query", description: "Execute the generated query", body: {}, docs: { summary: "Execute Genie message query", docUrl: "https://docs.databricks.com/api/azure/workspace/genie/executemessagequery" } }
        ]
      }
    ]
  },
  {
    name: "OAuth & Federation",
    icon: "KeyRound",
    audience: "account",
    rateLimitNote: "Account-level APIs use the account console URL (e.g., https://accounts.azuredatabricks.net).",
    subcategories: [
      {
        name: "Custom App Integrations",
        endpoints: [
          { label: "List custom apps", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/custom-app-integrations", description: "List OAuth apps", docs: { summary: "List custom OAuth apps", docUrl: "https://docs.databricks.com/api/azure/account/customappintegration/list" } },
          { label: "Create custom app", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/custom-app-integrations", description: "Create OAuth app", body: { name: "My App", redirect_urls: ["https://app.example.com/callback"], confidential: true }, docs: { summary: "Create custom OAuth app", docUrl: "https://docs.databricks.com/api/azure/account/customappintegration/create" } },
          { label: "Get custom app", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/custom-app-integrations/INTEGRATION_ID", description: "Get OAuth app details", docs: { summary: "Get custom OAuth app", docUrl: "https://docs.databricks.com/api/azure/account/customappintegration/get" } },
          { label: "Update custom app", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/custom-app-integrations/INTEGRATION_ID", description: "Update OAuth app", body: { name: "Updated App" }, docs: { summary: "Update custom OAuth app", docUrl: "https://docs.databricks.com/api/azure/account/customappintegration/update" } },
          { label: "Delete custom app", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/custom-app-integrations/INTEGRATION_ID", description: "Delete OAuth app", body: {}, docs: { summary: "Delete custom OAuth app", docUrl: "https://docs.databricks.com/api/azure/account/customappintegration/delete" } },
          { label: "Get custom app secret", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/custom-app-integrations/INTEGRATION_ID/secret", description: "Get custom OAuth app secret", body: {}, docs: { summary: "Get custom app secret", docUrl: "https://docs.databricks.com/api/azure/account/customappintegration/getappsecret" } }
        ]
      },
      {
        name: "Published App Integrations",
        endpoints: [
          { label: "List published app integrations", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-app-integrations", description: "List published app integrations", docs: { summary: "List published OAuth app integrations", docUrl: "https://docs.databricks.com/api/azure/account/publishedappintegration/list" } },
          { label: "Get published app integration", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-app-integrations/INTEGRATION_ID", description: "Get published app integration details", docs: { summary: "Get published app integration", docUrl: "https://docs.databricks.com/api/azure/account/publishedappintegration/get" } },
          { label: "Enable published app", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-app-integrations", description: "Enable a published app integration", body: { app_id: "APP_ID", token_access_policy: { access_token_ttl_in_minutes: 60, refresh_token_ttl_in_minutes: 86400 } }, docs: { summary: "Create published app integration", docUrl: "https://docs.databricks.com/api/azure/account/publishedappintegration/create" } },
          { label: "Update published app integration", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-app-integrations/INTEGRATION_ID", description: "Update published app integration", body: { token_access_policy: { access_token_ttl_in_minutes: 120 } }, docs: { summary: "Update published app integration", docUrl: "https://docs.databricks.com/api/azure/account/publishedappintegration/update" } },
          { label: "Disable published app", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-app-integrations/INTEGRATION_ID", description: "Disable a published app integration", body: {}, docs: { summary: "Delete published app integration", docUrl: "https://docs.databricks.com/api/azure/account/publishedappintegration/delete" } }
        ]
      },
      {
        name: "OAuth Published Apps",
        endpoints: [
          { label: "List published OAuth apps", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-apps", description: "List all available published OAuth apps", docs: { summary: "List published OAuth applications (dbt Core, Power BI, Tableau, etc.)", docUrl: "https://docs.databricks.com/api/azure/account/oauthpublishedapps/list" } },
          { label: "List published OAuth apps (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/oauth2/published-apps?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of published OAuth apps", docs: { summary: "List published OAuth apps with pagination", docUrl: "https://docs.databricks.com/api/azure/account/oauthpublishedapps/list" } }
        ]
      },
      {
        name: "Account Federation Policies",
        endpoints: [
          { label: "List federation policies", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/federationPolicies", description: "List account federation policies", docs: { summary: "List account federation policies", docUrl: "https://docs.databricks.com/api/azure/account/federationpolicy/list" } },
          { label: "List federation policies (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/federationPolicies?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of federation policies", docs: { summary: "List federation policies with pagination", docUrl: "https://docs.databricks.com/api/azure/account/federationpolicy/list" } },
          { label: "Get federation policy", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/federationPolicies/POLICY_ID", description: "Get federation policy details", docs: { summary: "Get federation policy", docUrl: "https://docs.databricks.com/api/azure/account/federationpolicy/get" } },
          { label: "Create federation policy", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/federationPolicies", description: "Create account federation policy", body: { oidc_policy: { issuer: "https://idp.example.com/oidc", audiences: ["databricks"], subject_claim: "sub" } }, docs: { summary: "Create federation policy", docUrl: "https://docs.databricks.com/api/azure/account/federationpolicy/create" } },
          { label: "Update federation policy", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/federationPolicies/POLICY_ID", description: "Update federation policy", body: { oidc_policy: { audiences: ["databricks-updated"] } }, docs: { summary: "Update federation policy", docUrl: "https://docs.databricks.com/api/azure/account/federationpolicy/update" } },
          { label: "Delete federation policy", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/federationPolicies/POLICY_ID", description: "Delete federation policy", body: {}, docs: { summary: "Delete federation policy", docUrl: "https://docs.databricks.com/api/azure/account/federationpolicy/delete" } }
        ]
      },
      {
        name: "SP Federation Policies",
        endpoints: [
          { label: "List SP federation policies", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/federationPolicies", description: "List federation policies for a service principal", docs: { summary: "List service principal federation policies", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalfederationpolicy/list" } },
          { label: "List SP federation policies (paginated)", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/federationPolicies?page_size=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of SP federation policies", docs: { summary: "List SP federation policies with pagination", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalfederationpolicy/list" } },
          { label: "Get SP federation policy", method: "GET", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/federationPolicies/POLICY_ID", description: "Get SP federation policy details", docs: { summary: "Get service principal federation policy", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalfederationpolicy/get" } },
          { label: "Create SP federation policy", method: "POST", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/federationPolicies", description: "Create federation policy for service principal", body: { oidc_policy: { issuer: "https://token.actions.githubusercontent.com", audiences: ["https://github.com/my-org"], subject: "repo:my-org/my-repo:environment:prod" } }, docs: { summary: "Create SP federation policy", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalfederationpolicy/create" } },
          { label: "Update SP federation policy", method: "PATCH", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/federationPolicies/POLICY_ID", description: "Update SP federation policy", body: { oidc_policy: { audiences: ["updated-audience"] } }, docs: { summary: "Update SP federation policy", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalfederationpolicy/update" } },
          { label: "Delete SP federation policy", method: "DELETE", path: "/api/2.0/accounts/ACCOUNT_ID/servicePrincipals/SP_ID/federationPolicies/POLICY_ID", description: "Delete SP federation policy", body: {}, docs: { summary: "Delete SP federation policy", docUrl: "https://docs.databricks.com/api/azure/account/serviceprincipalfederationpolicy/delete" } }
        ]
      }
    ]
  },
  {
    name: "Marketplace",
    icon: "Store",
    endpoints: [
      { label: "List listings", method: "GET", path: "/api/2.0/marketplace-consumer/listings", description: "List marketplace listings", docs: { summary: "List marketplace listings", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/listlistings" } },
      { label: "List listings (paginated)", method: "GET", path: "/api/2.0/marketplace-consumer/listings?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of listings", docs: { summary: "List listings with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/listlistings" } },
      { label: "Get listing", method: "GET", path: "/api/2.0/marketplace-consumer/listings/LISTING_ID", description: "Get listing details", docs: { summary: "Get marketplace listing", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/getlisting" } },
      { label: "Install listing", method: "POST", path: "/api/2.0/marketplace-consumer/installations", description: "Install marketplace listing", body: { listing_id: "LISTING_ID", repo_detail: { repo_name: "my-repo" } }, docs: { summary: "Install marketplace listing", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/createinstallation" } },
      { label: "List installations", method: "GET", path: "/api/2.0/marketplace-consumer/installations", description: "List installations", docs: { summary: "List marketplace installations", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/listinstallations" } },
      { label: "List installations (paginated)", method: "GET", path: "/api/2.0/marketplace-consumer/installations?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of installations", docs: { summary: "List installations with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/listinstallations" } },
      { label: "Uninstall listing", method: "DELETE", path: "/api/2.0/marketplace-consumer/installations/INSTALLATION_ID", description: "Uninstall listing", body: {}, docs: { summary: "Uninstall marketplace listing", docUrl: "https://docs.databricks.com/api/azure/workspace/marketplaceconsumer/deleteinstallation" } }
    ]
  },
  {
    name: "Clean Rooms",
    icon: "Lock",
    endpoints: [
      { label: "List clean rooms", method: "GET", path: "/api/2.1/unity-catalog/clean-rooms", description: "List clean rooms", docs: { summary: "List clean rooms", docUrl: "https://docs.databricks.com/api/azure/workspace/cleanrooms/list" } },
      { label: "Get clean room", method: "GET", path: "/api/2.1/unity-catalog/clean-rooms/CLEAN_ROOM_NAME", description: "Get clean room details", docs: { summary: "Get clean room", docUrl: "https://docs.databricks.com/api/azure/workspace/cleanrooms/get" } },
      { label: "Create clean room", method: "POST", path: "/api/2.1/unity-catalog/clean-rooms", description: "Create clean room", body: { name: "my_clean_room", comment: "Secure collaboration space" }, docs: { summary: "Create clean room", docUrl: "https://docs.databricks.com/api/azure/workspace/cleanrooms/create" } },
      { label: "Update clean room", method: "PATCH", path: "/api/2.1/unity-catalog/clean-rooms/CLEAN_ROOM_NAME", description: "Update clean room", body: { comment: "Updated clean room" }, docs: { summary: "Update clean room", docUrl: "https://docs.databricks.com/api/azure/workspace/cleanrooms/update" } },
      { label: "Delete clean room", method: "DELETE", path: "/api/2.1/unity-catalog/clean-rooms/CLEAN_ROOM_NAME", description: "Delete clean room", body: {}, docs: { summary: "Delete clean room", docUrl: "https://docs.databricks.com/api/azure/workspace/cleanrooms/delete" } }
    ]
  },
  {
    name: "Lakehouse Monitors",
    icon: "Activity",
    subcategories: [
      {
        name: "Monitors",
        endpoints: [
          { label: "List monitors", method: "GET", path: "/api/2.1/unity-catalog/quality-monitors", description: "List quality monitors", docs: { summary: "List Lakehouse monitors", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/listmonitors" } },
          { label: "List monitors (paginated)", method: "GET", path: "/api/2.1/unity-catalog/quality-monitors?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of monitors", docs: { summary: "List quality monitors with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/listmonitors" } },
          { label: "Get monitor", method: "GET", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME", description: "Get monitor details", docs: { summary: "Get quality monitor", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/getmonitor" } },
          { label: "Create monitor", method: "POST", path: "/api/2.1/unity-catalog/quality-monitors", description: "Create quality monitor", body: { table_name: "catalog.schema.table", assets_dir: "/monitor/assets", output_schema_name: "catalog.schema" }, docs: { summary: "Create quality monitor", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/createmonitor" } },
          { label: "Update monitor", method: "PUT", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME", description: "Update monitor", body: { assets_dir: "/new/assets" }, docs: { summary: "Update quality monitor", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/updatemonitor" } },
          { label: "Delete monitor", method: "DELETE", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME", description: "Delete monitor", body: {}, docs: { summary: "Delete quality monitor", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/deletemonitor" } }
        ]
      },
      {
        name: "Refreshes",
        endpoints: [
          { label: "Run monitor refresh", method: "POST", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME/refresh", description: "Run monitor refresh", body: {}, docs: { summary: "Refresh quality monitor", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/runrefresh" } },
          { label: "Get refresh", method: "GET", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME/refresh/REFRESH_ID", description: "Get refresh details", docs: { summary: "Get monitor refresh status", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/getrefresh" } },
          { label: "List refreshes", method: "GET", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME/refreshes", description: "List monitor refreshes", docs: { summary: "List monitor refreshes", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/listrefreshes" } },
          { label: "List refreshes (paginated)", method: "GET", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME/refreshes?max_results=100&page_token=NEXT_PAGE_TOKEN", description: "Get next page of refreshes", docs: { summary: "List monitor refreshes with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/listrefreshes" } },
          { label: "Cancel refresh", method: "POST", path: "/api/2.1/unity-catalog/quality-monitors/TABLE_NAME/refresh/REFRESH_ID/cancel", description: "Cancel refresh", body: {}, docs: { summary: "Cancel monitor refresh", docUrl: "https://docs.databricks.com/api/azure/workspace/lakehousemonitors/cancelrefresh" } }
        ]
      }
    ]
  },
  {
    name: "Tags",
    icon: "Tag",
    subcategories: [
      {
        name: "Tag Policies",
        endpoints: [
          { label: "List tag policies", method: "GET", path: "/api/2.1/tag-policies?max_results=50", description: "List tag policies", docs: { summary: "List tag policies", docUrl: "https://docs.databricks.com/api/azure/workspace/tagpolicies" } },
          { label: "Create tag policy", method: "POST", path: "/api/2.1/tag-policies", description: "Create a new tag policy", body: { name: "my_policy", definition: { rules: [] } }, docs: { summary: "Create tag policy", docUrl: "https://docs.databricks.com/api/azure/workspace/tagpolicies" } },
          { label: "Get tag policy", method: "GET", path: "/api/2.1/tag-policies/POLICY_NAME", description: "Get a tag policy", docs: { summary: "Get tag policy", docUrl: "https://docs.databricks.com/api/azure/workspace/tagpolicies" } },
          { label: "Update tag policy", method: "PATCH", path: "/api/2.1/tag-policies/POLICY_NAME", description: "Update an existing tag policy", body: { definition: { rules: [] } }, docs: { summary: "Update tag policy", docUrl: "https://docs.databricks.com/api/azure/workspace/tagpolicies" } },
          { label: "Delete tag policy", method: "DELETE", path: "/api/2.1/tag-policies/POLICY_NAME", description: "Delete a tag policy", body: {}, docs: { summary: "Delete tag policy", docUrl: "https://docs.databricks.com/api/azure/workspace/tagpolicies" } }
        ]
      },
      {
        name: "Tag Assignments",
        endpoints: [
          { label: "Create tag assignment", method: "POST", path: "/api/2.1/tag-assignments", description: "Create a tag assignment for an entity", body: { tag_key: "my_tag", object_id: "OBJECT_ID", object_type: "table" }, docs: { summary: "Create tag assignment", docUrl: "https://docs.databricks.com/api/azure/workspace/tagassignments" } },
          { label: "List tag assignments", method: "GET", path: "/api/2.1/tag-assignments?object_id=OBJECT_ID", description: "List tag assignments for an entity", docs: { summary: "List tag assignments", docUrl: "https://docs.databricks.com/api/azure/workspace/tagassignments" } },
          { label: "Get tag assignment", method: "GET", path: "/api/2.1/tag-assignments/ASSIGNMENT_ID", description: "Get a tag assignment for an entity", docs: { summary: "Get tag assignment", docUrl: "https://docs.databricks.com/api/azure/workspace/tagassignments" } },
          { label: "Update tag assignment", method: "PATCH", path: "/api/2.1/tag-assignments/ASSIGNMENT_ID", description: "Update a tag assignment for an entity", body: { tag_value: "updated_value" }, docs: { summary: "Update tag assignment", docUrl: "https://docs.databricks.com/api/azure/workspace/tagassignments" } },
          { label: "Delete tag assignment", method: "DELETE", path: "/api/2.1/tag-assignments/ASSIGNMENT_ID", description: "Delete a tag assignment for an entity", body: {}, docs: { summary: "Delete tag assignment", docUrl: "https://docs.databricks.com/api/azure/workspace/tagassignments" } }
        ]
      }
    ]
  },
  {
    name: "Budget Policies",
    icon: "Wallet",
    endpoints: [
      { label: "List budget policies", method: "GET", path: "/api/2.0/budget-policies", description: "List budget policies", docs: { summary: "List budget policies", docUrl: "https://docs.databricks.com/api/azure/workspace/budgetpolicies/list" } },
      { label: "List budget policies (paginated)", method: "GET", path: "/api/2.0/budget-policies?page_token=NEXT_PAGE_TOKEN", description: "Get next page of budget policies", docs: { summary: "List budget policies with pagination", docUrl: "https://docs.databricks.com/api/azure/workspace/budgetpolicies/list" } },
      { label: "Create budget policy", method: "POST", path: "/api/2.0/budget-policies", description: "Create budget policy", body: { policy_name: "my-budget-policy", custom: { budget_policy_id: "policy-1" } }, docs: { summary: "Create budget policy", docUrl: "https://docs.databricks.com/api/azure/workspace/budgetpolicies/create" } },
      { label: "Get budget policy", method: "GET", path: "/api/2.0/budget-policies/POLICY_ID", description: "Get budget policy details", docs: { summary: "Get budget policy", docUrl: "https://docs.databricks.com/api/azure/workspace/budgetpolicies/get" } },
      { label: "Update budget policy", method: "PATCH", path: "/api/2.0/budget-policies/POLICY_ID", description: "Update budget policy", body: { policy_name: "updated-policy" }, docs: { summary: "Update budget policy", docUrl: "https://docs.databricks.com/api/azure/workspace/budgetpolicies/update" } },
      { label: "Delete budget policy", method: "DELETE", path: "/api/2.0/budget-policies/POLICY_ID", description: "Delete budget policy", body: {}, docs: { summary: "Delete budget policy", docUrl: "https://docs.databricks.com/api/azure/workspace/budgetpolicies/delete" } }
    ]
  }
];
