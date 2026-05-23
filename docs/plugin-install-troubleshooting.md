# VS Code Agent 插件安装失败排查

当安装 GitHub 上的 agent 插件时看到类似错误：

```text
Cloning into 'c:\Users\12157\.vscode\agent-plugins\github.com\figma\mcp-server-guide'...
fatal: unable to access 'https://github.com/figma/mcp-server-guide.git/':
Failed to connect to github.com port 443 after 21041 ms: Could not connect to server
```

这表示插件安装器在执行 `git clone` 时无法连接到 `github.com:443`。问题通常是本机网络、代理或防火墙导致的，而不是插件仓库路径本身错误。

## 快速检查

1. 在浏览器中打开 `https://github.com/figma/mcp-server-guide`，确认当前网络能访问 GitHub。
2. 在 PowerShell 中运行：

   ```powershell
   git ls-remote https://github.com/figma/mcp-server-guide.git
   ```

   如果同样超时，说明 Git 与 VS Code 都无法直连 GitHub，需要先处理网络或代理。
3. 如果使用代理或 VPN，确保 VS Code 和 Git 使用相同代理配置：

   ```powershell
   git config --global http.proxy  http://127.0.0.1:7890
   git config --global https.proxy http://127.0.0.1:7890
   ```

   将端口替换为你本机代理软件实际监听的端口。
4. 如果曾经配置过错误代理，可以清理后重试：

   ```powershell
   git config --global --unset http.proxy
   git config --global --unset https.proxy
   ```

5. 检查公司/校园网络、防火墙、杀毒软件或 DNS 是否拦截了 `github.com` 的 443 端口。

## 结论

只有当 `git ls-remote https://github.com/figma/mcp-server-guide.git` 可以成功返回仓库引用后，VS Code 的插件安装步骤才会正常完成。
