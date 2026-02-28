import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
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

  // New types for authentication system
  public type Username = Text;

  public type AuthCredentials = {
    username : Username;
    password : Text;
    displayName : Text;
    bio : Text;
  };

  public type UserProfile = {
    username : Username;
    displayName : Text;
    bio : Text;
    profileNumber : Nat;
  };

  public type Message = {
    senderUsername : Username;
    content : Text;
    timestamp : Int;
  };

  // State variables
  let userProfiles = Map.empty<Username, UserProfile>();
  var nextProfileNumber = 1;
  let contactLists = Map.empty<Username, List.List<Username>>();
  let pendingRequests = Map.empty<Username, List.List<Username>>();
  let messages = Map.empty<Username, List.List<Message>>();
  let sharedPhotos = Map.empty<Username, List.List<Storage.ExternalBlob>>();
  let sharedVideos = Map.empty<Username, List.List<Storage.ExternalBlob>>();
  let photoFeeds = Map.empty<Username, List.List<Storage.ExternalBlob>>();
  let videoFeeds = Map.empty<Username, List.List<Storage.ExternalBlob>>();
  let authCredentials = Map.empty<Username, AuthCredentials>();

  // Maps principal -> username for ownership verification
  let principalToUsername = Map.empty<Principal, Username>();

  // Principal-based profile store (required by instructions for getCallerUserProfile / saveCallerUserProfile)
  let principalProfiles = Map.empty<Principal, UserProfile>();

  // -------------------------
  // Required profile functions
  // -------------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    principalProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    principalProfiles.add(caller, profile);
  };

  // Required by instructions: getUserProfile to fetch other users' profiles by Principal
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    principalProfiles.get(user);
  };

  public query ({ caller }) func getProfileByPrincipal(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    principalProfiles.get(user);
  };

  // -------------------------
  // Authentication functions
  // Open to all (guests can register/login)
  // -------------------------

  public shared ({ caller }) func registerUser(username : Username, password : Text, displayName : Text, bio : Text) : async () {
    if (authCredentials.containsKey(username)) {
      Runtime.trap("Username already taken");
    };
    if (principalToUsername.containsKey(caller)) {
      Runtime.trap("This principal is already registered");
    };

    let credentials : AuthCredentials = {
      username;
      password;
      displayName;
      bio;
    };

    let profile : UserProfile = {
      username;
      displayName;
      bio;
      profileNumber = nextProfileNumber;
    };

    authCredentials.add(username, credentials);
    userProfiles.add(username, profile);
    principalToUsername.add(caller, username);
    nextProfileNumber += 1;
  };

  public shared ({ caller }) func loginUser(username : Username, password : Text) : async Bool {
    switch (authCredentials.get(username)) {
      case (null) {
        false;
      };
      case (?storedCredentials) {
        storedCredentials.password == password;
      };
    };
  };

  // -------------------------
  // Profile management functions
  // -------------------------

  // Public profile lookup by username - open to all (guests can search)
  public query ({ caller }) func getUserProfileByUsername(username : Username) : async UserProfile {
    switch (userProfiles.get(username)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  // Updating a profile requires #user role and ownership
  public shared ({ caller }) func updateUserProfile(username : Username, displayName : Text, bio : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    // Ownership check: caller must own this username, or be admin
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this profile");
        };
      };
      case (?uname) {
        if (uname != username and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own profile");
        };
      };
    };
    switch (userProfiles.get(username)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          username = profile.username;
          displayName;
          bio;
          profileNumber = profile.profileNumber;
        };
        userProfiles.add(username, updatedProfile);
      };
    };
  };

  // Search is open to all (guests can search)
  public query ({ caller }) func findUsersByUsername(searchTerm : Text) : async [UserProfile] {
    let searchLower = searchTerm.toLower();
    let profiles = userProfiles.values().toArray();
    profiles.filter(
      func(profile) {
        profile.username.toLower().contains(#text searchLower);
      }
    );
  };

  // Profile number lookup is open to all
  public query ({ caller }) func findUserByProfileNumber(profileNumber : Nat) : async UserProfile {
    let profiles = userProfiles.values().toArray();
    let found = profiles.find(func(profile) { profile.profileNumber == profileNumber });
    switch (found) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  // -------------------------
  // Contact and messaging functions
  // All require #user role; write operations require ownership
  // -------------------------

  // Viewing contacts: requires #user and ownership (or admin)
  public query ({ caller }) func getContacts(username : Username) : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view contacts");
    };
    // Ownership check: caller must own this username, or be admin
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own contacts");
        };
      };
      case (?uname) {
        if (uname != username and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own contacts");
        };
      };
    };
    switch (contactLists.get(username)) {
      case (null) { [] };
      case (?contacts) {
        contacts.map<Username, ?UserProfile>(func(u) { userProfiles.get(u) }).toArray().filter(func(x) { x != null }).map<?UserProfile, UserProfile>(func(x) { x.unwrap() });
      };
    };
  };

  // Viewing pending requests: requires #user and ownership (or admin)
  public query ({ caller }) func getPendingContactRequests(username : Username) : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view pending contact requests");
    };
    // Ownership check
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own pending requests");
        };
      };
      case (?uname) {
        if (uname != username and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own pending requests");
        };
      };
    };
    switch (pendingRequests.get(username)) {
      case (null) { [] };
      case (?requests) {
        requests.map<Username, ?UserProfile>(func(u) { userProfiles.get(u) }).toArray().filter(func(x) { x != null }).map<?UserProfile, UserProfile>(func(x) { x.unwrap() });
      };
    };
  };

  // Sending a contact request: requires #user and ownership of sender username
  public shared ({ caller }) func sendContactRequest(sender : Username, targetUser : Username) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send contact requests");
    };
    // Ownership check: caller must own the sender username
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != sender) {
          Runtime.trap("Unauthorized: You can only send contact requests as yourself");
        };
      };
    };
    if (not userProfiles.containsKey(targetUser)) {
      Runtime.trap("Target user not found");
    };
    if (sender == targetUser) {
      Runtime.trap("Cannot send a contact request to yourself");
    };

    let requests = switch (pendingRequests.get(targetUser)) {
      case (null) { List.empty<Username>() };
      case (?list) { list };
    };

    if (not requests.any(func(x) { x == sender })) {
      requests.add(sender);
      pendingRequests.add(targetUser, requests);
    };
  };

  func _syncContacts(sender : Username, receiver : Username) {
    let senderContacts = switch (contactLists.get(sender)) {
      case (null) { List.empty<Username>() };
      case (?list) { list };
    };

    let receiverContacts = switch (contactLists.get(receiver)) {
      case (null) { List.empty<Username>() };
      case (?list) { list };
    };

    if (not senderContacts.any(func(x) { x == receiver })) {
      senderContacts.add(receiver);
      contactLists.add(sender, senderContacts);
    };

    if (not receiverContacts.any(func(x) { x == sender })) {
      receiverContacts.add(sender);
      contactLists.add(receiver, receiverContacts);
    };
  };

  // Accepting a contact request: requires #user and ownership of username
  public shared ({ caller }) func acceptContactRequest(username : Username, requester : Username) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can accept contact requests");
    };
    // Ownership check: caller must own the username
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != username) {
          Runtime.trap("Unauthorized: You can only accept requests for your own account");
        };
      };
    };
    switch (pendingRequests.get(username)) {
      case (null) { Runtime.trap("No pending requests for this user") };
      case (?requests) {
        if (not requests.any(func(x) { x == requester })) {
          Runtime.trap("No request from this user");
        };

        let filtered = requests.filter(func(x) { x != requester });
        pendingRequests.add(username, filtered);
        _syncContacts(username, requester);
      };
    };
  };

  // Declining a contact request: requires #user and ownership of username
  public shared ({ caller }) func declineContactRequest(username : Username, requester : Username) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can decline contact requests");
    };
    // Ownership check: caller must own the username
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != username) {
          Runtime.trap("Unauthorized: You can only decline requests for your own account");
        };
      };
    };
    switch (pendingRequests.get(username)) {
      case (null) { Runtime.trap("No pending requests") };
      case (?requests) {
        if (not requests.any(func(x) { x == requester })) {
          Runtime.trap("No request from this user");
        };

        let filtered = requests.filter(func(x) { x != requester });
        pendingRequests.add(username, filtered);
      };
    };
  };

  func _syncMessages(sender : Username, receiver : Username, message : Message) {
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

  // Sending a message: requires #user and ownership of sender username
  public shared ({ caller }) func sendMessage(sender : Username, receiver : Username, text : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    // Ownership check: caller must own the sender username
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != sender) {
          Runtime.trap("Unauthorized: You can only send messages as yourself");
        };
      };
    };
    if (not userProfiles.containsKey(receiver)) {
      Runtime.trap("Receiver not found");
    };
    let message : Message = {
      senderUsername = sender;
      content = text;
      timestamp = Time.now();
    };

    _syncMessages(sender, receiver, message);
  };

  // Viewing a conversation: requires #user and ownership of username (or admin)
  public query ({ caller }) func getConversation(username : Username, partner : Username) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    // Ownership check: caller must own the username, or be admin
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own conversations");
        };
      };
      case (?uname) {
        if (uname != username and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own conversations");
        };
      };
    };
    switch (messages.get(username)) {
      case (null) { [] };
      case (?msgs) {
        msgs.filter(func(msg) { msg.senderUsername == partner }).toArray();
      };
    };
  };

  // -------------------------
  // Media sharing functions
  // All require #user role; write operations require ownership
  // -------------------------

  // Sharing a photo: requires #user and ownership of username
  public shared ({ caller }) func sharePhoto(username : Username, blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can share photos");
    };
    // Ownership check
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != username) {
          Runtime.trap("Unauthorized: You can only share photos for your own account");
        };
      };
    };
    let photoList = switch (sharedPhotos.get(username)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    photoList.add(blob);
    sharedPhotos.add(username, photoList);
  };

  // Sharing a video: requires #user and ownership of username
  public shared ({ caller }) func shareVideo(username : Username, blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can share videos");
    };
    // Ownership check
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != username) {
          Runtime.trap("Unauthorized: You can only share videos for your own account");
        };
      };
    };
    let videoList = switch (sharedVideos.get(username)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    videoList.add(blob);
    sharedVideos.add(username, videoList);
  };

  // Viewing photos: requires #user; any user can view any user's photos
  public query ({ caller }) func getUserPhotos(username : Username) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view photos");
    };
    switch (sharedPhotos.get(username)) {
      case (null) { [] };
      case (?photos) { photos.toArray() };
    };
  };

  // Viewing videos: requires #user; any user can view any user's videos
  public query ({ caller }) func getUserVideos(username : Username) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view videos");
    };
    switch (sharedVideos.get(username)) {
      case (null) { [] };
      case (?videos) { videos.toArray() };
    };
  };

  // Adding photo to feed: requires #user and ownership of username
  public shared ({ caller }) func addPhotoToFeed(username : Username, blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add photos to feed");
    };
    // Ownership check
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != username) {
          Runtime.trap("Unauthorized: You can only add photos to your own feed");
        };
      };
    };
    let photoList = switch (photoFeeds.get(username)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    photoList.add(blob);
    photoFeeds.add(username, photoList);
  };

  // Adding video to feed: requires #user and ownership of username
  public shared ({ caller }) func addVideoToFeed(username : Username, blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add videos to feed");
    };
    // Ownership check
    let callerUsername = principalToUsername.get(caller);
    switch (callerUsername) {
      case (null) {
        Runtime.trap("Unauthorized: You do not own this username");
      };
      case (?uname) {
        if (uname != username) {
          Runtime.trap("Unauthorized: You can only add videos to your own feed");
        };
      };
    };
    let videoList = switch (videoFeeds.get(username)) {
      case (null) { List.empty<Storage.ExternalBlob>() };
      case (?list) { list };
    };

    videoList.add(blob);
    videoFeeds.add(username, videoList);
  };

  // Viewing photo feed: requires #user; any user can view any user's feed
  public query ({ caller }) func getUserPhotoFeed(username : Username) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view photo feeds");
    };
    switch (photoFeeds.get(username)) {
      case (null) { [] };
      case (?photos) { photos.toArray() };
    };
  };

  // Viewing video feed: requires #user; any user can view any user's feed
  public query ({ caller }) func getUserVideoFeed(username : Username) : async [Storage.ExternalBlob] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view video feeds");
    };
    switch (videoFeeds.get(username)) {
      case (null) { [] };
      case (?videos) { videos.toArray() };
    };
  };
};
