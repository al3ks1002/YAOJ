import auth0 from "auth0-js";
import history from "../utils/history";
import * as Constants from "../utils/auth0-constants.js";
import * as AxiosUtils from "../utils/axios.js";

class Auth {
  userProfile;
  tokenRenewalTimeout;

  auth0 = new auth0.WebAuth({
    domain: Constants.AUTH0_DOMAIN,
    clientID: Constants.AUTH0_CLIENT_ID,
    scope: "openid profile",
    audience: Constants.AUTH0_API_AUDIENCE,
    responseType: "token id_token",
    redirectUri: Constants.AUTH0_CALLBACK_URL
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);

    this.scheduleRenewal();
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        AxiosUtils.handleLogin();
      } else if (err) {
        history.replace("/home");
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
    localStorage.setItem("profile", JSON.stringify(authResult.idTokenPayload));

    // schedule a token renewal
    this.scheduleRenewal();

    // navigate to the home route
    history.replace("/home");
  }

  getAccessToken() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No access token found");
    }
    return accessToken;
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("profile");
    localStorage.removeItem("scopes");
    this.userProfile = null;
    clearTimeout(this.tokenRenewalTimeout);
    // navigate to the home route
    history.replace("/home");
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expiresAt;
  }

  renewToken() {
    this.auth0.checkSession({}, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        this.setSession(result);
      }
    });
  }

  scheduleRenewal() {
    const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    const delay = expiresAt - Date.now();
    if (delay > 0) {
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewToken();
      }, delay);
    }
  }
}

export default Auth;
