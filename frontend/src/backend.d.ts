import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Message {
    content: string;
    sender: Principal;
    timestamp: bigint;
}
export interface UserProfile {
    bio: string;
    username: string;
    profileNumber: bigint;
    displayName: string;
    avatarUrl: string;
    profilePic?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptContactRequest(requester: Principal): Promise<void>;
    addPhotoToFeed(blob: ExternalBlob): Promise<void>;
    addVideoToFeed(blob: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    declineContactRequest(requester: Principal): Promise<void>;
    findUserByProfileNumber(profileNumber: bigint): Promise<UserProfile>;
    findUsersByUsername(searchTerm: string): Promise<Array<UserProfile>>;
    getCallerContacts(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(partner: Principal): Promise<Array<Message>>;
    getPendingContactRequests(): Promise<Array<UserProfile>>;
    getUserPhotoFeed(user: Principal): Promise<Array<ExternalBlob>>;
    getUserPhotos(user: Principal): Promise<Array<ExternalBlob>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    getUserVideoFeed(user: Principal): Promise<Array<ExternalBlob>>;
    getUserVideos(user: Principal): Promise<Array<ExternalBlob>>;
    isCallerAdmin(): Promise<boolean>;
    register(username: string, displayName: string, avatarUrl: string, bio: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendContactRequest(targetUser: Principal): Promise<void>;
    sendMessage(receiver: Principal, text: string): Promise<void>;
    sharePhoto(blob: ExternalBlob): Promise<void>;
    shareVideo(blob: ExternalBlob): Promise<void>;
    updateCallerUserProfile(displayName: string, avatarUrl: string, bio: string): Promise<void>;
    uploadProfilePic(blob: ExternalBlob): Promise<void>;
}
