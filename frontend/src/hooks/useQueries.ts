import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Message } from '../backend';

// ---- Auth mutations ----

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      displayName,
      bio,
    }: {
      username: string;
      password: string;
      displayName: string;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerUser(username, password, displayName, bio);
    },
  });
}

export function useLoginUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const success = await actor.loginUser(username, password);
      if (!success) throw new Error('Invalid username or password');
      return username;
    },
  });
}

// ---- Profile queries ----

export function useGetUserProfile(username: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      if (!actor || !username) return null;
      try {
        return await actor.getUserProfile(username);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      displayName,
      bio,
    }: {
      username: string;
      displayName: string;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateUserProfile(username, displayName, bio);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.username] });
    },
  });
}

export function useFindUsersByUsername(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ['findUsers', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.findUsersByUsername(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.trim().length > 0,
  });
}

// ---- Contacts queries ----

export function useGetContacts(username: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ['contacts', username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getContacts(username);
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useGetPendingContactRequests(username: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ['pendingRequests', username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getPendingContactRequests(username);
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useSendContactRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sender, targetUser }: { sender: string; targetUser: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendContactRequest(sender, targetUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useAcceptContactRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, requester }: { username: string; requester: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.acceptContactRequest(username, requester);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.username] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.username] });
    },
  });
}

export function useDeclineContactRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, requester }: { username: string; requester: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.declineContactRequest(username, requester);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.username] });
    },
  });
}

// ---- Messaging queries ----

export function useGetConversation(username: string | null, partner: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ['conversation', username, partner],
    queryFn: async () => {
      if (!actor || !username || !partner) return [];
      return actor.getConversation(username, partner);
    },
    enabled: !!actor && !actorFetching && !!username && !!partner,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sender,
      receiver,
      text,
    }: {
      sender: string;
      receiver: string;
      text: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(sender, receiver, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.sender, variables.receiver] });
    },
  });
}

// ---- Media queries ----

export function useGetUserPhotos(username: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['userPhotos', username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getUserPhotos(username);
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useGetUserVideos(username: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['userVideos', username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getUserVideos(username);
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useSharePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, blob }: { username: string; blob: any }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sharePhoto(username, blob);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos', variables.username] });
    },
  });
}

export function useShareVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, blob }: { username: string; blob: any }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.shareVideo(username, blob);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userVideos', variables.username] });
    },
  });
}
