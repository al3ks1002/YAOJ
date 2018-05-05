import React, { Component } from 'react';

import axios from 'axios';
import auth0 from 'auth0-js';

import * as Constants from '../utils/auth0-constants.js'
import Home from './Home.js'
import LoggedIn from './LoggedIn.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.setupAxios();
    this.parseHash();
    this.setState();
  }

  // Add access_token if available with each XHR request to API
  setupAxios() {
    axios.interceptors.request.use(function(config) {
      const token = localStorage.getItem('access_token');

      if (token != null) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    }, function(err) {
      return Promise.reject(err);
    });
  }

  // Extract the access_token and id_token from Auth0 Callback after login
  parseHash() {
    this.auth0 = new auth0.WebAuth({
      domain:       Constants.AUTH0_DOMAIN,
      clientID:     Constants.AUTH0_CLIENT_ID
    });
    this.auth0.parseHash(window.location.hash, function(err, authResult) {
      if (err) {
        return console.log(err);
      }
      if(authResult !== null && authResult.accessToken !== null && authResult.idToken !== null){
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('profile', JSON.stringify(authResult.idTokenPayload));
        window.location = window.location.href.substr(0, window.location.href.indexOf('#'))
      }
    });
  }

  // Set user login state
  setState() {
    var idToken = localStorage.getItem('id_token');
    if(idToken){
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

  render() {
    console.log(localStorage.getItem('profile'));
    if (this.loggedIn) {
      return (<LoggedIn />);
    } else {
      return (<Home />);
    }
  }
}

export default App;
