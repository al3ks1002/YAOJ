import axios from "axios";
import * as LocalStorageUtils from "../utils/localStorage.js";

const ApiUrl = "http://localhost:8080/api/";

function setupAuthorizationHeader() {
  try {
    const token = LocalStorageUtils.getAccessToken();
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (error) {}
}

export function getContests(isPublic) {
  setupAuthorizationHeader();

  var apiGetUrl = ApiUrl + "contests";
  if (!isPublic) {
    try {
      const userId = LocalStorageUtils.getUserId();
      apiGetUrl += "/" + userId;
    } catch (error) {
      throw error;
    }
  }
  return axios.get(apiGetUrl);
}

export function handleLogin() {
  setupAuthorizationHeader();

  try {
    const userId = LocalStorageUtils.getUserId();
    const username = LocalStorageUtils.getUsername();
    return axios.post(ApiUrl + "login", {
      id: userId,
      name: username
    });
  } catch (error) {
    throw error;
  }
}

export function addContest(isPublic, contestName) {
  setupAuthorizationHeader();
  try {
    const userId = LocalStorageUtils.getUserId();
    return axios.post(ApiUrl + "new-contest", {
      ownerid: userId,
      name: contestName,
      isPublic: isPublic
    });
  } catch (error) {
    throw error;
  }
}
