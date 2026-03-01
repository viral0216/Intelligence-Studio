import type { HttpMethod } from '@/types/api'

export function generateCurl(method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  let cmd = `curl -X ${method} '${host}${path}'`
  cmd += ` \\\n  -H 'Authorization: Bearer ${token}'`
  cmd += ` \\\n  -H 'Content-Type: application/json'`
  if (body) {
    cmd += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`
  }
  return cmd
}

export function generatePython(method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  let code = `import requests\n\n`
  code += `url = "${host}${path}"\n`
  code += `headers = {\n    "Authorization": "Bearer ${token}",\n    "Content-Type": "application/json"\n}\n`
  if (body) {
    code += `\npayload = ${JSON.stringify(body, null, 4)}\n`
    code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`
  } else {
    code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)\n`
  }
  code += `print(response.status_code)\nprint(response.json())`
  return code
}

export function generateJavaScript(method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  let code = `const response = await fetch('${host}${path}', {\n`
  code += `  method: '${method}',\n`
  code += `  headers: {\n    'Authorization': 'Bearer ${token}',\n    'Content-Type': 'application/json'\n  }`
  if (body) {
    code += `,\n  body: JSON.stringify(${JSON.stringify(body, null, 4)})`
  }
  code += `\n});\n\nconst data = await response.json();\nconsole.log(data);`
  return code
}

export function generateTypeScript(method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  let code = `const response: Response = await fetch('${host}${path}', {\n`
  code += `  method: '${method}',\n`
  code += `  headers: {\n    'Authorization': 'Bearer ${token}',\n    'Content-Type': 'application/json'\n  }`
  if (body) {
    code += `,\n  body: JSON.stringify(${JSON.stringify(body, null, 4)})`
  }
  code += `\n});\n\nconst data: unknown = await response.json();\nconsole.log(data);`
  return code
}

export function generateGo(method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n`
  if (body) code += `\t"bytes"\n\t"encoding/json"\n`
  code += `)\n\nfunc main() {\n`
  if (body) {
    code += `\tpayload, _ := json.Marshal(${JSON.stringify(body)})\n`
    code += `\treq, _ := http.NewRequest("${method}", "${host}${path}", bytes.NewBuffer(payload))\n`
  } else {
    code += `\treq, _ := http.NewRequest("${method}", "${host}${path}", nil)\n`
  }
  code += `\treq.Header.Set("Authorization", "Bearer ${token}")\n`
  code += `\treq.Header.Set("Content-Type", "application/json")\n\n`
  code += `\tclient := &http.Client{}\n\tresp, _ := client.Do(req)\n\tdefer resp.Body.Close()\n\n`
  code += `\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`
  return code
}

export function generatePowerShell(method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  let code = `$headers = @{\n    "Authorization" = "Bearer ${token}"\n    "Content-Type" = "application/json"\n}\n\n`
  if (body) {
    code += `$body = @'\n${JSON.stringify(body, null, 4)}\n'@\n\n`
    code += `$response = Invoke-RestMethod -Uri "${host}${path}" -Method ${method} -Headers $headers -Body $body\n`
  } else {
    code += `$response = Invoke-RestMethod -Uri "${host}${path}" -Method ${method} -Headers $headers\n`
  }
  code += `$response | ConvertTo-Json -Depth 10`
  return code
}

export type Language = 'curl' | 'python' | 'javascript' | 'typescript' | 'go' | 'powershell'

export function generateCode(language: Language, method: HttpMethod, path: string, host: string, token: string, body?: unknown): string {
  switch (language) {
    case 'curl': return generateCurl(method, path, host, token, body)
    case 'python': return generatePython(method, path, host, token, body)
    case 'javascript': return generateJavaScript(method, path, host, token, body)
    case 'typescript': return generateTypeScript(method, path, host, token, body)
    case 'go': return generateGo(method, path, host, token, body)
    case 'powershell': return generatePowerShell(method, path, host, token, body)
  }
}
