// Custom event dispatcher for poll updates
const POLL_VOTE_EVENT = 'poll-vote-updated';

export const emitPollVote = (pollId) => {
  const event = new CustomEvent(POLL_VOTE_EVENT, { 
    detail: { pollId } 
  });
  window.dispatchEvent(event);
};

export const onPollVote = (callback) => {
  window.addEventListener(POLL_VOTE_EVENT, callback);
  return () => window.removeEventListener(POLL_VOTE_EVENT, callback);
};