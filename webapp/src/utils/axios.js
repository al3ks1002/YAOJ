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

export function getContest(contestId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "contest/" + contestId);
}

export function getProblems(contestId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "problems/" + contestId);
}

export function getProblem(problemId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "problem/" + problemId);
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

export function addContest(isPublic, contestName) {
  setupAuthorizationHeader();
  try {
    const userId = LocalStorageUtils.getUserId();
    return axios.post(ApiUrl + "new-contest", {
      ownerId: userId,
      name: contestName,
      isPublic: isPublic
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

export function deleteContest(contestId) {
  setupAuthorizationHeader();
  return axios.delete(ApiUrl + "delete-contest/" + contestId);
}

export function deleteProblem(problemId) {
  setupAuthorizationHeader();
  return axios.delete(ApiUrl + "delete-problem/" + problemId);
}
