import WebSocket from 'ws';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

// Supabase initializes a transport even though this app does not subscribe to Realtime.
// ws supplies the browser-compatible runtime on Node 20; its event typings differ.
type Transport = NonNullable<SupabaseClientOptions<'public'>['realtime']>['transport'];
export const websocketTransport = WebSocket as unknown as Transport;
