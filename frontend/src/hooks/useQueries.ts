import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type Message, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userPrincipal?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      try {
        return await actor.getUserProfile(Principal.fromText(userPrincipal));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      displayName,
      avatarUrl,
      bio,
    }: {
      username: string;
      displayName: string;
      avatarUrl: string;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.register(username, displayName, avatarUrl, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      avatarUrl,
      bio,
    }: {
      displayName: string;
      avatarUrl: string;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateCallerUserProfile(displayName, avatarUrl, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUploadProfilePic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadProfilePic(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Search ──────────────────────────────────────────────────────────────────

export function useFindUsersByUsername(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.findUsersByUsername(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.trim().length > 0,
  });
}

export function useFindUserByProfileNumber(profileNumber?: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['searchByNumber', profileNumber?.toString()],
    queryFn: async () => {
      if (!actor || profileNumber === undefined) return null;
      try {
        return await actor.findUserByProfileNumber(profileNumber);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && profileNumber !== undefined,
  });
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export function useGetCallerContacts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerContacts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPendingContactRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingContactRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSendContactRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendContactRequest(Principal.fromText(targetPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

export function useAcceptContactRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.acceptContactRequest(Principal.fromText(requesterPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

export function useDeclineContactRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.declineContactRequest(Principal.fromText(requesterPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useGetConversation(partnerPrincipal?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['conversation', partnerPrincipal],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getConversation(Principal.fromText(partnerPrincipal));
    },
    enabled: !!actor && !actorFetching && !!partnerPrincipal,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiverPrincipal,
      text,
    }: {
      receiverPrincipal: string;
      text: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(Principal.fromText(receiverPrincipal), text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.receiverPrincipal] });
    },
  });
}

// ─── Photos ──────────────────────────────────────────────────────────────────

export function useGetUserPhotos(userPrincipal?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalBlob[]>({
    queryKey: ['userPhotos', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getUserPhotos(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useSharePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sharePhoto(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['userPhotoFeed'] });
    },
  });
}

export function useGetUserPhotoFeed(userPrincipal?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalBlob[]>({
    queryKey: ['userPhotoFeed', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getUserPhotoFeed(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export function useGetUserVideos(userPrincipal?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalBlob[]>({
    queryKey: ['userVideos', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getUserVideos(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useShareVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.shareVideo(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
      queryClient.invalidateQueries({ queryKey: ['userVideoFeed'] });
    },
  });
}

export function useGetUserVideoFeed(userPrincipal?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalBlob[]>({
    queryKey: ['userVideoFeed', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getUserVideoFeed(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}
