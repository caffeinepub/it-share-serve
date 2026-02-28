import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Message = {
    sender : Principal;
    content : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    username : Text;
    displayName : Text;
    avatarUrl : Text;
    bio : Text;
    profileNumber : Nat;
    profilePic : ?Storage.ExternalBlob;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProfileNumber = 1;
  let contactLists = Map.empty<Principal, List.List<Principal>>();
  let pendingRequests = Map.empty<Principal, List.List<Principal>>();
  let messages = Map.empty<Principal, List.List<Message>>();
  let sharedPhotos = Map.empty<Principal, List.List<Storage.ExternalBlob>>();
  let sharedVideos = Map.empty<Principal, List.List<Storage.ExternalBlob>>();
  let photoFeeds = Map.empty<Principal, List.List<Storage.ExternalBlob>>();
  let videoFeeds = Map.empty<Principal, List.List<Storage.ExternalBlob>>();

  // Register a new user account. Caller must not be anonymous (guest).
  // After registration the caller is assigned the #user role.
  public shared ({ caller }) func register(username : Text, displayName : Text, avatarUrl : Text, bio : Text) : async () {
    // Guests (anonymous principals) may not register
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Unauthorized: Anonymous principals cannot register");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already registered") };

    let profile : UserProfile = {
      username;
      displayName;
      avatarUrl;
      bio;
      profileNumber = nextProfileNumber;
      profilePic = null;
    };

    userProfiles.add(caller, profile);
    nextProfileNumber += 1;
    // Assign the #user role so the caller gains user-level permissions
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  // Required by frontend: get the caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can get their profile");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) { profile };
    };
  };

  // Required by frontend: save (update) the caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can save their profile");
    };
    // Preserve the original username and profileNumber to prevent tampering
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?existing) {
        let updatedProfile : UserProfile = {
          username = existing.username;
          displayName = profile.displayName;
          avatarUrl = profile.avatarUrl;
          bio = profile.bio;
          profileNumber = existing.profileNumber;
          profilePic = profile.profilePic;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Required by frontend: fetch another user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view profiles");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updateCallerUserProfile(displayName : Text, avatarUrl : Text, bio : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update their profile");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          username = profile.username;
          displayName;
          avatarUrl;
          bio;
          profileNumber = profile.profileNumber;
          profilePic = profile.profilePic;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func uploadProfilePic(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can upload a profile picture");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          username = profile.username;
          displayName = profile.displayName;
          avatarUrl = profile.avatarUrl;
          bio = profile.bio;
          profileNumber = profile.profileNumber;
          profilePic = ?blob;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func findUsersByUsername(searchTerm : Text) : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can search for other users");
    };
    let searchLower = searchTerm.toLower();
    let profiles = userProfiles.values().toArray();
    profiles.filter(
      func(profile) {
        profile.username.toLower().contains(#text searchLower);
      }
    );
  };

  public query ({ caller }) func findUserByProfileNumber(profileNumber : Nat) : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can search by profile number");
    };
    let profiles = userProfiles.values().toArray();
    let found = profiles.find(func(profile) { profile.profileNumber == profileNumber });
    switch (found) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func sendContactRequest(targetUser : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can send contact requests");
    };
    if (not userProfiles.containsKey(targetUser)) {
      Runtime.trap("Target user not found");
    };
    if (caller == targetUser) {
      Runtime.trap("Cannot send a contact request to yourself");
    };

    let requests = switch (pendingRequests.get(targetUser)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    if (not requests.any(func(x) { x == caller })) {
      requests.add(caller);
      pendingRequests.add(targetUser, requests);
    };
  };

  func _syncContacts(sender : Principal, receiver : Principal) {
    let senderContacts = switch (contactLists.get(sender)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let receiverContacts = switch (contactLists.get(receiver)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    if ((not senderContacts.any(func(x) { x == receiver })) and sender != receiver) {
      senderContacts.add(receiver);
      contactLists.add(sender, senderContacts);
    };

    if ((not receiverContacts.any(func(x) { x == sender })) and sender != receiver) {
      receiverContacts.add(sender);
      contactLists.add(receiver, receiverContacts);
    };
  };

  public shared ({ caller }) func acceptContactRequest(requester : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can accept contact requests");
    };
    switch (pendingRequests.get(caller)) {
      case (null) { Runtime.trap("No pending requests for this user") };
      case (?requests) {
        if (not requests.any(func(x) { x == requester })) {
          Runtime.trap("No request from this user");
        };

        let filtered = requests.filter(func(x) { x != requester });
        pendingRequests.add(caller, filtered);
        _syncContacts(caller, requester);
      };
    };
  };

  public shared ({ caller }) func declineContactRequest(requester : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can decline contact requests");
    };
    switch (pendingRequests.get(caller)) {
      case (null) { Runtime.trap("No pending requests") };
      case (?requests) {
        if (not requests.any(func(x) { x == requester })) {
          Runtime.trap("No request from this user");
        };

        let filtered = requests.filter(func(x) { x != requester });
        pendingRequests.add(caller, filtered);
      };
    };
  };

  public query ({ caller }) func getCallerContacts() : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view their contacts");
    };
    switch (contactLists.get(caller)) {
      case (null) { [] };
      case (?contacts) {
        contacts.map<Principal, ?UserProfile>(func(p) { userProfiles.get(p) }).toArray().filter(func(x) { x != null }).map<?UserProfile, UserProfile>(func(x) { x.unwrap() });
      };
    };
  };

  public query ({ caller }) func getPendingContactRequests() : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view pending contact requests");
    };
    switch (pendingRequests.get(caller)) {
      case (null) { [] };
      case (?requests) {
        requests.map<Principal, ?UserProfile>(func(p) { userProfiles.get(p) }).toArray().filter(func(x) { x != null }).map<?UserProfile, UserProfile>(func(x) { x.unwrap() });
      };
    };
  };

  func _syncMessages(sender : Principal, receiver : Principal, message : Message) {
    let senderMsgList = switch (messages.get(sender)) {
      case (null) { List.empty<Message>() };
      case (?list) { list };
    };

    let receiverMsgList = switch (messages.get(receiver)) {
      case (null) { List.empty<Message>() };
      case (?list) { list };
    };

    senderMsgList.add(message);
    receiverMsgList.add(message);
    messages.add(sender, senderMsgList);
    messages.add(receiver, receiverMsgList);
  };

  public shared ({ caller }) func sendMessage(receiver : Principal, text : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can send messages");
    };
    if (not userProfiles.containsKey(receiver)) {
      Runtime.trap("Receiver not found");
    };
    let message : Message = {
      sender = caller;
      content = text;
      timestamp = Time.now();
    };

    _syncMessages(caller, receiver, message);
  };

  public query ({ caller }) func getConversation(partner : Principal) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can read messages");
    };
    switch (messages.get(caller)) {
      case (null) { [] };
      case (?msgs) {
        // Only return messages that are part of the conversation between caller and partner
        msgs.filter(func(msg) { msg.sender == partner or msg.sender == caller }).toArray();
      };
    };
  };

  public shared ({ caller }) func sharePhoto(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can share photos");
    };
    let photoList = switch (sharedPhotos.get(caller)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    photoList.add(blob);
    sharedPhotos.add(caller, photoList);
  };

  public shared ({ caller }) func shareVideo(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can share videos");
    };
    let videoList = switch (sharedVideos.get(caller)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    videoList.add(blob);
    sharedVideos.add(caller, videoList);
  };

  public query ({ caller }) func getUserPhotos(user : Principal) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view photos");
    };
    switch (sharedPhotos.get(user)) {
      case (null) { [] };
      case (?photos) { photos.toArray() };
    };
  };

  public query ({ caller }) func getUserVideos(user : Principal) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view videos");
    };
    switch (sharedVideos.get(user)) {
      case (null) { [] };
      case (?videos) { videos.toArray() };
    };
  };

  public shared ({ caller }) func addPhotoToFeed(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can add photos to their feed");
    };
    let photoList = switch (photoFeeds.get(caller)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    photoList.add(blob);
    photoFeeds.add(caller, photoList);
  };

  public shared ({ caller }) func addVideoToFeed(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can add videos to their feed");
    };
    let videoList = switch (videoFeeds.get(caller)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    videoList.add(blob);
    videoFeeds.add(caller, videoList);
  };

  public query ({ caller }) func getUserPhotoFeed(user : Principal) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view photo feeds");
    };
    switch (photoFeeds.get(user)) {
      case (null) { [] };
      case (?photos) { photos.toArray() };
    };
  };

  public query ({ caller }) func getUserVideoFeed(user : Principal) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view video feeds");
    };
    switch (videoFeeds.get(user)) {
      case (null) { [] };
      case (?videos) { videos.toArray() };
    };
  };
};
