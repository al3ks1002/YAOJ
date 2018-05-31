import axios from "axios";
import * as LocalStorageUtils from "../utils/localStorage.js";

const ApiUrl = "http://localhost:8080/api/";

function setupAuthorizationHeader() {
  try {
    const token = LocalStorageUtils.getAccessToken();
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (error) {
    // There is no need to throw/log anything.
  }
}

export function getContests(isPublic) {
  var apiGetUrl = ApiUrl + "contests";
  if (!isPublic) {
    try {
      setupAuthorizationHeader();
      const userId = LocalStorageUtils.getUserId();
      apiGetUrl += "/" + userId;
    } catch (error) {
      throw error;
    }
  }
  return axios.get(apiGetUrl);
}

export function getContest(id) {
  setupAuthorizationHeader();
  var apiGetUrl = ApiUrl + "contest/" + id;
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

export function getProblems(contestId) {
  setupAuthorizationHeader();
  try {
    var userId = "";
    try {
      userId = LocalStorageUtils.getUserId();
    } catch (error) {}
    var apiGetUrl = ApiUrl + "problems/" + contestId;
    return axios.get(apiGetUrl, {
      params: {
        userId: userId
      }
    });
  } catch (error) {
    throw error;
  }
}

export function addProblem(contestId, problemName, problemDescription) {
  setupAuthorizationHeader();
  try {
    const userId = LocalStorageUtils.getUserId();
    return axios.post(ApiUrl + "new-problem/" + contestId, {
      userId: userId,
      name: problemName,
      description: problemDescription
    });
  } catch (error) {
    throw error;
  }
}

export function getProblem(id) {
  setupAuthorizationHeader();
  var apiGetUrl = ApiUrl + "problem/" + id;
  return axios.get(apiGetUrl);
}
