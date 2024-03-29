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

export function addContest(isPublic, contestName, startTime, endTime) {
  setupAuthorizationHeader();
  try {
    const userId = LocalStorageUtils.getUserId();
    return axios.post(ApiUrl + "contests", {
      ownerId: userId,
      name: contestName,
      isPublic: isPublic,
      startTime: startTime,
      endTime: endTime
    });
  } catch (error) {
    throw error;
  }
}

export function updateContest(
  contestId,
  isPublic,
  contestName,
  startTime,
  endTime
) {
  setupAuthorizationHeader();
  try {
    const userId = LocalStorageUtils.getUserId();
    return axios.put(ApiUrl + "contest/" + contestId, {
      ownerId: userId,
      name: contestName,
      isPublic: isPublic,
      startTime: startTime,
      endTime: endTime
    });
  } catch (error) {
    throw error;
  }
}

export function addProblem(
  contestId,
  problemName,
  problemDescription,
  problemTimelimit
) {
  setupAuthorizationHeader();
  try {
    const userId = LocalStorageUtils.getUserId();
    return axios.post(ApiUrl + "problems/" + contestId, {
      userId: userId,
      name: problemName,
      description: problemDescription,
      timelimit: problemTimelimit
    });
  } catch (error) {
    throw error;
  }
}

export function updateProblem(
  problemId,
  problemName,
  problemDescription,
  problemTimelimit
) {
  setupAuthorizationHeader();
  return axios.put(ApiUrl + "problem/" + problemId, {
    name: problemName,
    description: problemDescription,
    timelimit: problemTimelimit
  });
}

export function deleteContest(contestId) {
  setupAuthorizationHeader();
  return axios.delete(ApiUrl + "contest/" + contestId);
}

export function deleteProblem(problemId) {
  setupAuthorizationHeader();
  return axios.delete(ApiUrl + "problem/" + problemId);
}

export function uploadFiles(problemId, formData) {
  setupAuthorizationHeader();
  const config = {
    headers: { "content-type": "multipart/form-data" }
  };
  return axios.post(ApiUrl + "files/" + problemId, formData, config);
}

export function getInTests(problemId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "in-tests/" + problemId);
}

export function getOkTests(problemId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "ok-tests/" + problemId);
}

export function deleteFile(fId) {
  setupAuthorizationHeader();
  return axios.delete(ApiUrl + "file/" + fId);
}

export function getSources(problemId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "sources/" + problemId);
}

export function executeSource(fId) {
  setupAuthorizationHeader();
  return axios.post(ApiUrl + "execute/" + fId);
}

export function getSubmissions(problemId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "submissions/" + problemId);
}

export function submitContestantSource(problemId, formData) {
  setupAuthorizationHeader();
  const config = {
    headers: { "content-type": "multipart/form-data" }
  };
  return axios.post(ApiUrl + "submit/" + problemId, formData, config);
}

export function getSubmission(submissionId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "submission/" + submissionId);
}

export function getResults(submissionId) {
  setupAuthorizationHeader();
  return axios.get(ApiUrl + "results/" + submissionId);
}
