// causes — the live-event dispatcher for verbs that FOLD TO NOTHING
// (TEL0S_NOTES §11.4, slice 3c).
//
// The fold handles state; these are events. A `use` is a cause whose
// effects arrive as separate entries; `force`/`punt` are physical causes
// only bodies present at the moment feel; moderation lines narrate only
// when they HAPPEN (replaying an old ban as if it just happened would be a
// lie); a live `say` is a spoken moment (chat line + speech event) whose
// RECORD the fold keeps in recentChat for the next arrival's window.
// None of that can come from a state diff — the fold deliberately shapes
// nothing for them — so the live path dispatches them here.
//
// Wired by main.js off the bus ('live-entry', emitted by net.js when the
// realizers own the scene) rather than imported by net: importing chat
// from a module net imports would add yet another lap around the
// net → chat → net cycle this rebuild is unwinding.

import { bus } from '../core.js';
import { logChat } from '../chat.js';
import { REALIZE, STATE_VERBS } from './seam.js';

export function handleLiveCause(entry) {
  const { verb, args = {}, actor } = entry;
  switch (verb) {
    case 'say':
      logChat(actor, args.text, '', {
        seq: entry.seq, ts: entry.ts,
        // spoken-say protocol only: display metadata for a voice that
        // already performed as captions (server sanitizes; this is the
        // client's own guard for old/foreign servers)
        ...(args.spoken === true && Number.isSafeInteger(args.utt)
          ? { spoken: true, utt: args.utt, t0: args.t0 } : {}),
      });
      // spoken:true = this utterance was already PERFORMED as presence
      // (captions paced the bubble to the voice); the say is its record.
      // Log always, re-perform never.
      if (!args.spoken) bus.emit('speech', { actor, text: args.text });
      return;
    case 'use':
      bus.emit('use', { actor, ...args });
      return;
    case 'punt':
      bus.emit('punt', { actor, ...args });
      return;
    case 'force':
      bus.emit('force', { actor, ...args });
      return;
    case 'grant': {
      // the roles MIRROR is the social realizer's (state); the narration is
      // live-only and therefore this dispatcher's
      const bits = [args.role, args.gen != null ? (args.gen ? '+gen' : '-gen') : null].filter(Boolean);
      logChat('*', `${actor === 'world' ? 'the world' : actor} made ${args.id} ${bits.join(' ')}`);
      return;
    }
    case 'ban': case 'unban': case 'kick': {
      const what = verb === 'ban' ? 'banned' : verb === 'unban' ? 'lifted the ban on' : 'removed';
      logChat('*', `${actor} ${what} ${args.id}${verb !== 'unban' && args.reason ? ` — ${args.reason}` : ''}`);
      return;
    }
    default:
      // state verbs realized elsewhere are not "unhandled"; anything else
      // keeps the forward-compat trace legacy's default case had
      if (!STATE_VERBS.has(verb)) console.debug('unhandled verb', verb, args);
  }
}

export function initCauses() {
  if (!REALIZE) return false;
  bus.on('live-entry', handleLiveCause);
  return true;
}
