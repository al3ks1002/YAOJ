export function getAccessToken() {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    throw new Error("No access token found");
  }
  return accessToken;
}

export function getProfile() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  if (!profile) {
    throw new Error("No user found!");
  }
  return profile;
}

export function getUserId() {
  try {
    const profile = getProfile();
    const userId = profile["sub"];
    return userId;
  } catch (error) {
    throw error;
  }
}

export function getUsername() {
  try {
    const profile = getProfile();
    const username = profile["name"];
    return username;
  } catch (error) {
    throw error;
  }
}
