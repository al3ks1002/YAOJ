import axios from "axios";

const ApiUrl = "http://localhost:8080/api/";

// Add access_token if available with each XHR request to API
export function setupAxios() {
  axios.interceptors.request.use(
    function(config) {
      const token = localStorage.getItem("access_token");

      if (token != null) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    function(err) {
      return Promise.reject(err);
    }
  );
}

export function getPublicContests() {
  return axios.get(ApiUrl + "contests");
}

export function handleLogin() {
  var profile = JSON.parse(localStorage.getItem("profile"));
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
