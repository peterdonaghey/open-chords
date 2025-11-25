# MCP Server Installation Guide for Claude Code

**Created**: 2024-11-24
**Purpose**: Document how to install and use MCP (Model Context Protocol) servers in Claude Code

## What are MCP Servers?

MCP (Model Context Protocol) servers extend Claude Code's capabilities by providing access to:
- Browser automation (Puppeteer)
- Database connections
- API integrations
- File system operations
- And much more

## How to Find MCP Servers

### Official Sources
1. **MCP Official Repository**: https://github.com/modelcontextprotocol/servers
2. **MCP Examples**: https://modelcontextprotocol.io/examples
3. **Awesome MCP Servers**: https://github.com/punkpeye/awesome-mcp-servers
4. **MCP Catalog**: https://mcpservers.org/

### Search Strategy
When looking for MCP servers:
1. Search: "[capability] MCP server" (e.g., "Puppeteer MCP server")
2. Check GitHub for `*-mcp-server` repositories
3. Search npm for `@modelcontextprotocol/*` packages
4. Check community lists and directories

## Installation Methods

### Method 1: Using NPX (Recommended)
For packages that provide an installer:
```bash
npx [package-name] install
```

Example:
```bash
npx puppeteer-mcp-claude install
```

This automatically:
- Detects Claude Desktop and Claude Code
- Configures both applications
- Verifies installation

### Method 2: Using Claude MCP CLI
```bash
claude mcp add [server-name] --scope user
```

### Method 3: Manual Configuration
Edit the config file directly:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Claude Code**: `~/.claude.json` or project-specific `.claude.json`

## Managing MCP Servers

### List Installed Servers
```bash
claude mcp list
```

### Remove a Server
```bash
claude mcp remove [server-name]
```

### Check Status
```bash
npx [package-name] status
```

### Verify Installation
In Claude Code session:
```
List all available tools
```

## Puppeteer MCP Server

### What It Does
Provides browser automation capabilities:
- Navigate to URLs
- Take screenshots
- Click elements
- Fill forms
- Execute JavaScript
- Extract data from web pages

### Installation
```bash
npx puppeteer-mcp-claude install
```

### Available Tools (11 total)
The Puppeteer MCP provides tools for:
- Page navigation
- Element interaction
- Screenshot capture
- JavaScript execution
- Console log access
- Cookie management
- And more

### Usage Examples
After installation, Claude Code can:
- "Take a screenshot of example.com"
- "Navigate to my local app at localhost:5173 and check if it works"
- "Fill out the form on this page"
- "Extract all links from this webpage"

## Configuration Scopes

### Local Scope (Default)
- Stored in project `.claude.json`
- Only available in current project
- Ideal for project-specific servers

### User Scope
- Stored in `~/.claude.json`
- Available in all projects
- Good for commonly used servers

### Example Config Structure
```json
{
  "mcpServers": {
    "puppeteer-mcp-claude": {
      "command": "node",
      "args": ["/path/to/puppeteer-mcp-claude/dist/index.js"]
    }
  }
}
```

## Common MCP Servers

### Browser Automation
- **puppeteer-mcp-claude**: Full Puppeteer automation
- **browser-mcp**: Fast, lightweight automation
- **playwright-mcp**: Alternative to Puppeteer

### Development Tools
- **filesystem-mcp**: Enhanced file operations
- **github-mcp**: GitHub API integration
- **git-mcp**: Git operations

### Databases
- **postgres-mcp**: PostgreSQL integration
- **sqlite-mcp**: SQLite database access
- **mongodb-mcp**: MongoDB operations

### APIs & Services
- **slack-mcp**: Slack integration
- **notion-mcp**: Notion API access
- **google-drive-mcp**: Google Drive operations

## Troubleshooting

### Server Not Showing Up
1. Restart Claude Code
2. Check installation: `claude mcp list`
3. Verify config file syntax
4. Check server logs

### Installation Failed
1. Check Node.js version (18+ recommended)
2. Clear npm cache: `npm cache clean --force`
3. Try manual configuration
4. Check error logs

### Tools Not Available
1. Ask: "List all available tools"
2. Restart Claude Code
3. Check server is running: `npx [package] status`
4. Verify configuration file

## Best Practices

### Security
- Only install MCP servers from trusted sources
- Review permissions and capabilities
- Use local scope for sensitive operations
- Keep servers updated

### Performance
- Only install servers you need
- Remove unused servers
- Monitor resource usage
- Restart Claude Code after bulk changes

### Development Workflow
1. Search for needed capability
2. Review server documentation
3. Install with npx or CLI
4. Test with simple command
5. Document usage in project

## Example: Installing Puppeteer MCP

```bash
# 1. Search for the server
# Web search: "Puppeteer MCP server"

# 2. Install using npx
npx puppeteer-mcp-claude install

# 3. Restart Claude Code (if running)
# Close and reopen or restart the session

# 4. Verify installation
# In Claude Code: "List all available tools"
# Should see 11 puppeteer tools

# 5. Test it
# "Take a screenshot of https://example.com"
```

## Useful Commands Reference

```bash
# List all MCP servers
claude mcp list

# Add server (interactive)
claude mcp add [name] --scope user

# Remove server
claude mcp remove [name]

# Check specific server
claude mcp get [name]

# NPX-based installation
npx [package-name] install

# Check status
npx [package-name] status

# Uninstall
npx [package-name] uninstall
```

## Resources

- Official Docs: https://modelcontextprotocol.io/
- Server List: https://github.com/modelcontextprotocol/servers
- Claude Code MCP Guide: https://code.claude.com/docs/en/mcp
- Community Servers: https://mcpservers.org/
- NPM Packages: https://www.npmjs.com/search?q=%40modelcontextprotocol

## Remember

✅ **Claude Code CAN install MCP servers autonomously**
✅ **Search the web for MCP servers when new capabilities are needed**
✅ **Use npx for packages with installers**
✅ **Always verify after installation**
✅ **Document any new servers installed**

---

**Note**: This guide should be referenced whenever Claude Code needs to extend its capabilities with new MCP servers. The process is repeatable and can be done autonomously by searching, installing, and verifying.
