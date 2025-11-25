# MCP Puppeteer Server Installation

**Date**: 2024-11-24
**Purpose**: Installed Puppeteer MCP server for browser automation capabilities

## What Happened

User reported that the Open Chords application was "completely widescreen" and couldn't see anything properly. They suggested that I should be able to view the website myself using browser capabilities.

## Solution: Install Puppeteer MCP Server

### Research Phase
1. Searched for "Puppeteer MCP server Claude Code install"
2. Found multiple Puppeteer MCP server options
3. Identified `puppeteer-mcp-claude` as the best maintained option

### Installation
```bash
npx puppeteer-mcp-claude install
```

**Result**: ✅ Successfully installed

The installer automatically:
- Detected Claude Desktop (macOS) ✅
- Configured Claude Desktop ✅
- Detected Claude Code ✅
- Configured Claude Code ✅
- Verified configuration ✅

### Configuration Updated
Files modified:
- `/Users/peterdonaghey/Library/Application Support/Claude/claude_desktop_config.json`
- `/Users/peterdonaghey/.claude.json` (project-specific)

### Capabilities Added
The Puppeteer MCP provides **11 browser automation tools**:
- Navigate to URLs
- Take screenshots
- Click elements
- Fill forms
- Execute JavaScript
- Extract page data
- Manage cookies
- Access console logs
- And more

## Documentation Created

Created comprehensive guide: `/docs/MCP_SERVER_GUIDE.md`

This guide documents:
- What MCP servers are
- How to find MCP servers (search strategy)
- Installation methods (npx, CLI, manual)
- Managing servers (list, add, remove)
- Common MCP servers by category
- Troubleshooting tips
- Best practices

## Next Steps

### After Session Restart
1. Verify installation: "List all available tools"
2. Should see 11 puppeteer tools available
3. Test with: "Navigate to http://localhost:5173 and take a screenshot"
4. Use browser automation to inspect the Open Chords app
5. Identify and fix the widescreen layout issue

### Application Issues to Check
- Responsive design on different screen sizes
- CSS layout issues
- Viewport settings
- Mobile vs desktop views

## Key Learning

**Claude Code CAN install MCP servers autonomously!**

Process:
1. **Search**: Use web search to find relevant MCP servers
2. **Install**: Use npx or claude mcp CLI to install
3. **Verify**: Check with "List all available tools"
4. **Use**: Access new capabilities in subsequent sessions

This capability should be:
- ✅ Documented for future reference
- ✅ Used proactively when new capabilities are needed
- ✅ Remembered as a core skill

## Important Notes

- The MCP server is installed but requires a session restart to be accessible
- The current session cannot use the new tools yet
- After restart, Claude Code will have full browser automation capabilities
- This process is repeatable for any other MCP servers needed

## Commands for Future Reference

```bash
# Install Puppeteer MCP
npx puppeteer-mcp-claude install

# Check status
npx puppeteer-mcp-claude status

# List all MCP servers
claude mcp list

# Uninstall if needed
npx puppeteer-mcp-claude uninstall
```

## Application Status

- **Development Server**: Running at http://localhost:5173/
- **Issue Reported**: Widescreen layout problem
- **Next Action**: Use Puppeteer to inspect and diagnose
- **Documentation**: Complete and ready

---

**Status**: ✅ MCP Server Installed, Awaiting Session Restart
**Next Session**: Use Puppeteer to debug the widescreen issue
