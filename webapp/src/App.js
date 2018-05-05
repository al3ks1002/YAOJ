import React, { Component } from 'react';

import axios from 'axios';
import auth0 from 'auth0-js';
import {Jumbotron, Button} from 'react-bootstrap'

import './App.css';

import * as Constants from './auth0-variables.js'

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

class Home extends Component {
  constructor(props) {
    super(props);
    this.authenticate = this.authenticate.bind(this);
  }

  authenticate() {
    this.webAuth = new auth0.WebAuth({
      domain:       Constants.AUTH0_DOMAIN,
      clientID:     Constants.AUTH0_CLIENT_ID,
      scope:        'openid profile',
      audience:     Constants.AUTH0_API_AUDIENCE,
      responseType: 'token id_token',
      redirectUri : Constants.AUTH0_CALLBACK_URL
    });
    this.webAuth.authorize();
  }

  render() {
    return (
      <Jumbotron className="col-xs-12 text-center">
        <h1>Mlc</h1>
        <Button bsStyle="primary" block onClick={this.authenticate}>Sign In</Button>
      </Jumbotron>
    );
  }
}

class LoggedIn extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);

    this.state = {
      contests: [],
    };
  }

  // If a user logs out we will remove their tokens and profile info
  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('profile');
    window.location.reload();
  }

  // Once this components mounts, we will make a call to the API to get the product data
  componentDidMount() {
    this.serverRequest =
      axios
      .get("http://localhost:8080/contests")
      .then((result) => {
        this.setState({
          contests: result.data
        });
      });
  }

  render() {
    return (
      <div className="col-lg-12">
        <Button className="pull-right" onClick={this.logout}>Log out</Button>
        <h2>Welcome to Mlc</h2>
        <table>
          <tbody>

            {this.state.contests.map(function(contest, i){
              return <Contest key={i} id={contest.Id} name={contest.Name} />
            })}

          </tbody>
        </table>
      </div>
    );
  }
}

class Contest extends Component {
  render() {
    return (
      <tr>
        <td> {this.props.id}   </td>
        <td> {this.props.name} </td>
      </tr>
    )
  }
}

export default App;
