import axios from "axios";

const ApiUrl = "http://localhost:8080/api/";

function setupAuthorizationHeader() {
  const token = localStorage.getItem("access_token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export function getContests(isPublic) {
  setupAuthorizationHeader();

  var apiGetUrl = ApiUrl + "contests";
  if (!isPublic) {
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (!profile) {
      throw new Error("No user found!");
    }
    const userId = profile["sub"];
    apiGetUrl += "/" + userId;
  }
  return axios.get(apiGetUrl);
}

export function handleLogin() {
  setupAuthorizationHeader();

  const profile = JSON.parse(localStorage.getItem("profile"));
  axios
    .post(ApiUrl + "login", {
      id: profile["sub"],
      name: profile["name"]
    })
    .then(response => {})
    .catch(error => {
      console.log(error.response);
    });
}
