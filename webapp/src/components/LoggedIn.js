import React, { Component } from 'react';

import axios from 'axios';
import {Button} from 'react-bootstrap'

import Contest from './Contest.js'

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

export default LoggedIn;
