# Sandhurst British Army Discord Bot

## Overview

This is a Discord moderation and utility bot built for the Sandhurst British Army server. The bot provides comprehensive moderation tools, server information commands, and member management features. It uses Discord.js v14 as the primary framework and operates with a simple prefix-based command system (`,` prefix).

The bot handles welcome messages for new members, provides moderation capabilities (kick, ban, mute, warn, etc.), and includes utility commands for server management. It's designed as a single-file application with all command logic contained in the main entry point.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Structure

**Single-File Architecture**: The entire bot is contained within `index.js`, using an event-driven pattern provided by Discord.js. This monolithic approach keeps the codebase simple but may become difficult to maintain as features grow.

- **Rationale**: For a small to medium-sized bot with limited commands, a single file reduces complexity and makes the code easier to navigate initially.
- **Trade-offs**: Scalability is limited; adding more commands will make the file unwieldy. No separation of concerns between command handling, event management, and business logic.
- **Alternative**: A modular command handler structure with separate folders for commands, events, and utilities would improve maintainability.

### Command System

**Prefix-Based Commands**: Uses a simple string prefix (`,`) to identify bot commands rather than Discord's slash command system.

- **Rationale**: Easier to implement for basic use cases; no need to register commands with Discord's API.
- **Trade-offs**: Prefix commands are being deprecated by Discord in favor of slash commands. Less discoverability for users and no built-in autocomplete or validation.
- **Alternative**: Discord's Application Commands (slash commands) provide better UX, type safety, and future-proofing.

### Event Handling

**Direct Event Listeners**: Events (`clientReady`, `guildMemberAdd`, `messageCreate`) are registered directly on the client object.

- **Rationale**: Straightforward implementation for a small number of events.
- **Trade-offs**: Mixing event logic with the main file reduces modularity.
- **Alternative**: Separate event handler files in an events directory would improve organization.

### Message Parsing

**Manual String Parsing**: Commands are parsed by splitting message content by spaces and extracting arguments manually.

- **Rationale**: Simple implementation without external dependencies.
- **Trade-offs**: No built-in validation, type checking, or argument parsing. Prone to errors with complex command structures.
- **Alternative**: A command framework or argument parser library would provide better validation.

### Bot Presence

**Static Activity Status**: Bot displays a fixed activity message (`,help for commands`).

- **Rationale**: Provides users with basic guidance on how to interact with the bot.
- **Trade-offs**: Static presence doesn't adapt to server activity or provide dynamic information.

## External Dependencies

### Discord.js (v14.22.1)

The primary framework for interacting with the Discord API. Provides:

- Client connection and gateway management
- Event system for Discord events (message creation, member joins, etc.)
- Builders for rich embeds and complex message structures
- Permission and intent management for bot capabilities

**Required Intents**:
- `Guilds`: Access to guild/server information
- `GuildMessages`: Read messages in servers
- `MessageContent`: Access message content (privileged intent)
- `GuildMembers`: Track member joins/leaves (privileged intent)
- `GuildModeration`: Access to moderation events (bans, kicks)

**Note**: This bot requires privileged intents (`MessageContent` and `GuildMembers`) to function, which must be enabled in the Discord Developer Portal.

### Runtime Environment

- **Node.js**: Requires version 16.11.0 or higher (Discord.js v14 requirement)
- **Environment Variables**: Bot token must be provided (implementation for loading token is not visible in provided code)

### No Database

Currently, the bot does not persist any data. All state is ephemeral and lost on restart.

- **Implication**: Warning systems, user history, and configuration cannot be stored permanently.
- **Future Consideration**: Adding a database (SQLite, PostgreSQL, or MongoDB) would enable persistent warnings, server-specific configurations, and audit logs.