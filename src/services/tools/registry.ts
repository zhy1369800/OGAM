import { ToolDefinition } from './types';

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    id: 'web_search',
    name: 'web_search',
    displayName: 'Web Search',
    description: 'Search the live web and return real-time result titles, snippets, and URLs. Use this for any question about current events, prices, weather, news, or anything that requires up-to-date information. When the snippet is insufficient, call read_url on the most relevant result URL to get the full page content.',
    icon: 'globe',
    requiresNetwork: true,
    parameters: {
      query: {
        type: 'string',
        description: 'Search query',
        required: true,
      },
    },
  },
  {
    id: 'calculator',
    name: 'calculator',
    displayName: 'Calculator',
    description: 'Evaluate math expressions',
    icon: 'hash',
    parameters: {
      expression: {
        type: 'string',
        description: 'Math expression',
        required: true,
      },
    },
  },
  {
    id: 'get_current_datetime',
    name: 'get_current_datetime',
    displayName: 'Date & Time',
    description: 'Get current date and time',
    icon: 'clock',
    parameters: {
      timezone: {
        type: 'string',
        description: 'IANA timezone, e.g. America/New_York',
      },
    },
  },
  {
    id: 'get_device_info',
    name: 'get_device_info',
    displayName: 'Device Info',
    description: 'Get device hardware info',
    icon: 'smartphone',
    parameters: {
      info_type: {
        type: 'string',
        description: 'Info type',
        enum: ['battery', 'storage', 'memory', 'all'],
      },
    },
  },
  {
    id: 'search_knowledge_base',
    name: 'search_knowledge_base',
    displayName: 'Knowledge Base',
    description: 'Search uploaded project documents',
    icon: 'book-open',
    parameters: {
      query: {
        type: 'string',
        description: 'Search query',
        required: true,
      },
    },
  },
  {
    id: 'read_url',
    name: 'read_url',
    displayName: 'URL Reader',
    description: 'Fetch the full live content of any URL. Use this after web_search to read the complete text of a result page, or directly when the user shares a link.',
    icon: 'link',
    requiresNetwork: true,
    parameters: {
      url: {
        type: 'string',
        description: 'Full URL to fetch',
        required: true,
      },
    },
  },
  {
    id: 'calendar',
    name: 'calendar',
    displayName: 'Calendar & Schedule',
    description: 'Manage system calendar events and check schedule availability. Use this tool whenever the user wants to view upcoming events, check free/busy time slots, search events, create/add a calendar event, update an event, or delete an event. Times should be ISO 8601 strings (e.g. 2026-10-11T14:00:00).',
    icon: 'calendar',
    parameters: {
      action: {
        type: 'string',
        description: 'Action to perform: list (view upcoming events), search (find events matching keyword), freebusy (analyze free/busy time slots), create (schedule a new event), update (modify existing event), delete (remove event), list_calendars (show calendar accounts).',
        required: true,
        enum: ['list', 'search', 'freebusy', 'create', 'update', 'delete', 'list_calendars'],
      },
      title: {
        type: 'string',
        description: 'Event title / summary (required for create)',
      },
      start: {
        type: 'string',
        description: 'Start date/time in ISO 8601 format (e.g. 2026-10-11T10:00:00)',
      },
      end: {
        type: 'string',
        description: 'End date/time in ISO 8601 format (e.g. 2026-10-11T11:00:00)',
      },
      days: {
        type: 'number',
        description: 'Number of days ahead to look for list, search, or freebusy analysis (default: 7 for list, 30 for search, 1 for freebusy)',
      },
      query: {
        type: 'string',
        description: 'Search query for event title, location, or notes (required for search action)',
      },
      id: {
        type: 'string',
        description: 'Event ID to update or delete',
      },
      location: {
        type: 'string',
        description: 'Event location or meeting room/link',
      },
      notes: {
        type: 'string',
        description: 'Detailed description, agenda, or notes for the event',
      },
      alarm_minutes: {
        type: 'number',
        description: 'Reminder alarm relative offset in minutes before event start (e.g. 15 for 15 minutes before)',
      },
      calendar_name: {
        type: 'string',
        description: 'Specific calendar name to target (optional, defaults to primary/default calendar)',
      },
    },
  },
];

export function getToolsAsOpenAISchema(enabledToolIds: readonly string[]) {
  return AVAILABLE_TOOLS
    .filter(tool => enabledToolIds.includes(tool.id))
    .map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            Object.entries(tool.parameters).map(([key, param]) => [
              key,
              {
                type: param.type,
                description: param.description,
                ...(param.enum ? { enum: param.enum } : {}),
              },
            ]),
          ),
          required: Object.entries(tool.parameters)
            .filter(([_, param]) => param.required)
            .map(([key]) => key),
        },
      },
    }));
}

export function buildToolSystemPromptHint(enabledToolIds: string[]): string {
  const enabledTools = AVAILABLE_TOOLS.filter(t => enabledToolIds.includes(t.id));
  if (enabledTools.length === 0) return '';

  const toolList = enabledTools.map(t => `- ${t.name}: ${t.description}`).join('\n');
  return `\n\nTools available:\n${toolList}\nUse these tools proactively and precisely — call the right tool at the right moment rather than guessing or saying you cannot help.`;
}
