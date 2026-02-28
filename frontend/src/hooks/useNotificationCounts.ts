import { useGetPendingContactRequests } from './useQueries';
import { useAuth } from './useAuth';

export function useNotificationCounts() {
  const { username } = useAuth();
  const { data: pendingRequests = [] } = useGetPendingContactRequests(username);

  return {
    unreadMessages: 0, // Placeholder — no unread tracking in backend yet
    pendingRequests: pendingRequests.length,
  };
}
