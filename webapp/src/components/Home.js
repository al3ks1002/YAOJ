import React, { Component } from 'react';

import auth0 from 'auth0-js';

import * as Constants from '../utils/auth0-constants.js'
import {Jumbotron, Button} from 'react-bootstrap'

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

export default Home;
