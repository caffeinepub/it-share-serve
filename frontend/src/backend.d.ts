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
    senderUsername: Username;
    timestamp: bigint;
}
export type Username = string;
export interface UserProfile {
    bio: string;
    username: Username;
    profileNumber: bigint;
    displayName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptContactRequest(username: Username, requester: Username): Promise<void>;
    addPhotoToFeed(username: Username, blob: ExternalBlob): Promise<void>;
    addVideoToFeed(username: Username, blob: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    declineContactRequest(username: Username, requester: Username): Promise<void>;
    findUserByProfileNumber(profileNumber: bigint): Promise<UserProfile>;
    findUsersByUsername(searchTerm: string): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContacts(username: Username): Promise<Array<UserProfile>>;
    getConversation(username: Username, partner: Username): Promise<Array<Message>>;
    getPendingContactRequests(username: Username): Promise<Array<UserProfile>>;
    getProfileByPrincipal(user: Principal): Promise<UserProfile | null>;
    getUserPhotoFeed(username: Username): Promise<Array<ExternalBlob>>;
    getUserPhotos(username: Username): Promise<Array<ExternalBlob>>;
    getUserProfile(username: Username): Promise<UserProfile>;
    getUserVideoFeed(username: Username): Promise<Array<ExternalBlob>>;
    getUserVideos(username: Username): Promise<Array<ExternalBlob>>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(username: Username, password: string): Promise<boolean>;
    registerUser(username: Username, password: string, displayName: string, bio: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendContactRequest(sender: Username, targetUser: Username): Promise<void>;
    sendMessage(sender: Username, receiver: Username, text: string): Promise<void>;
    sharePhoto(username: Username, blob: ExternalBlob): Promise<void>;
    shareVideo(username: Username, blob: ExternalBlob): Promise<void>;
    updateUserProfile(username: Username, displayName: string, bio: string): Promise<void>;
}
