/**
 * Granola API Client
 * Base URL: https://public-api.granola.ai/v1
 * Auth: Bearer token (API key)
 */

const BASE_URL = 'https://public-api.granola.ai/v1';

export interface GranolaUser {
  name: string | null;
  email: string;
}

export interface CalendarInvitee {
  email: string;
  name: string | null;
}

export interface CalendarEvent {
  event_title: string;
  invitees: CalendarInvitee[];
  organiser: string;
  calendar_event_id: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
}

export interface Speaker {
  source: 'microphone' | 'speaker';
}

export interface TranscriptEntry {
  speaker: Speaker;
  text: string;
  start_time: string;
  end_time: string;
}

export interface Folder {
  id: string;
  object: string;
  name: string;
}

export interface NoteSummary {
  id: string;
  object: string;
  title: string | null;
  owner: GranolaUser;
  created_at: string;
  updated_at: string;
}

export interface Note extends NoteSummary {
  calendar_event: CalendarEvent | null;
  attendees: GranolaUser[];
  folder_membership: Folder[];
  summary_text: string;
  summary_markdown: string | null;
  transcript: TranscriptEntry[] | null;
}

export interface ListNotesResponse {
  notes: NoteSummary[];
  hasMore: boolean;
  cursor: string | null;
}

export interface ListNotesParams {
  created_before?: string;
  created_after?: string;
  updated_after?: string;
  cursor?: string;
  page_size?: number;
}

export class GranolaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return response.json();
  }

  // === Notes ===

  async listNotes(params?: ListNotesParams): Promise<ListNotesResponse> {
    return this.request<ListNotesResponse>('/notes', params as any);
  }

  async getNote(noteId: string, includeTranscript?: boolean): Promise<Note> {
    const params: Record<string, string | undefined> = {};
    if (includeTranscript) {
      params.include = 'transcript';
    }
    return this.request<Note>(`/notes/${encodeURIComponent(noteId)}`, params);
  }
}
