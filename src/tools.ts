import { z } from 'zod';
import { GranolaClient } from './api-client.js';

/**
 * Granola MCP Tool Definitions
 *
 * DESCRIPTION GUIDELINES (for LLM token efficiency):
 * - Tool `description`: max 60 chars (sent to LLM)
 * - Parameter `.describe()`: max 15 chars (sent to LLM)
 */

export const tools = [
  // === Notes ===
  {
    name: 'notes_list',
    description: 'List meeting notes with pagination',
    inputSchema: z.object({
      page_size: z.number().optional().describe('results per page'),
      cursor: z.string().optional().describe('pagination cursor'),
      created_after: z.string().optional().describe('after date ISO'),
      created_before: z.string().optional().describe('before date ISO'),
      updated_after: z.string().optional().describe('updated after'),
    }),
    handler: async (client: GranolaClient, args: {
      page_size?: number;
      cursor?: string;
      created_after?: string;
      created_before?: string;
      updated_after?: string;
    }) => {
      return await client.listNotes(args);
    },
  },

  {
    name: 'notes_recent',
    description: 'Get most recent meeting notes',
    inputSchema: z.object({
      count: z.number().optional().describe('number of notes'),
    }),
    handler: async (client: GranolaClient, args: { count?: number }) => {
      return await client.listNotes({ page_size: args.count || 10 });
    },
  },

  {
    name: 'notes_search_by_date',
    description: 'Search notes within a date range',
    inputSchema: z.object({
      start_date: z.string().describe('start date ISO'),
      end_date: z.string().optional().describe('end date ISO'),
      page_size: z.number().optional().describe('results per page'),
    }),
    handler: async (client: GranolaClient, args: {
      start_date: string;
      end_date?: string;
      page_size?: number;
    }) => {
      return await client.listNotes({
        created_after: args.start_date,
        created_before: args.end_date,
        page_size: args.page_size || 30,
      });
    },
  },

  // === Note Details ===
  {
    name: 'note_get',
    description: 'Get full note details by ID',
    inputSchema: z.object({
      note_id: z.string().describe('note ID'),
    }),
    handler: async (client: GranolaClient, args: { note_id: string }) => {
      return await client.getNote(args.note_id);
    },
  },

  {
    name: 'note_get_with_transcript',
    description: 'Get note with full transcript',
    inputSchema: z.object({
      note_id: z.string().describe('note ID'),
    }),
    handler: async (client: GranolaClient, args: { note_id: string }) => {
      return await client.getNote(args.note_id, true);
    },
  },

  {
    name: 'note_summary',
    description: 'Get AI summary of a meeting note',
    inputSchema: z.object({
      note_id: z.string().describe('note ID'),
    }),
    handler: async (client: GranolaClient, args: { note_id: string }) => {
      const note = await client.getNote(args.note_id);
      return {
        id: note.id,
        title: note.title,
        summary_text: note.summary_text,
        summary_markdown: note.summary_markdown,
        created_at: note.created_at,
      };
    },
  },

  {
    name: 'note_attendees',
    description: 'Get attendees for a meeting note',
    inputSchema: z.object({
      note_id: z.string().describe('note ID'),
    }),
    handler: async (client: GranolaClient, args: { note_id: string }) => {
      const note = await client.getNote(args.note_id);
      return {
        id: note.id,
        title: note.title,
        owner: note.owner,
        attendees: note.attendees,
        calendar_event: note.calendar_event,
      };
    },
  },

  {
    name: 'note_transcript',
    description: 'Get transcript for a meeting note',
    inputSchema: z.object({
      note_id: z.string().describe('note ID'),
    }),
    handler: async (client: GranolaClient, args: { note_id: string }) => {
      const note = await client.getNote(args.note_id, true);
      return {
        id: note.id,
        title: note.title,
        transcript: note.transcript,
      };
    },
  },
];

export type Tool = (typeof tools)[number];
