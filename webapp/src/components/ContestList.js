import React, { Component } from "react";
import axios from "axios";
import Contest from "./Contest.js";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";

class ContestList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contests: [],
      loaded: false
    };
  }

  // Once this components mounts, we will make a call to the API to get the product data
  componentDidMount() {
    this.serverRequest = axios
      .get("http://localhost:8080/api/contests")
      .then(result => {
        console.log(localStorage.getItem("profile"));
        this.setState({
          contests: result.data,
          loaded: true
        });
      });
  }

  render() {
    if (this.state.loaded) {
      console.log(this.state.contests);
      if (this.state.contests.length === 0) {
        return <div>There are no contests at the moment.</div>;
      } else {
        return (
          <table>
            <tbody>
              {this.state.contests.map(function(contest, i) {
                return <Contest key={i} id={contest.Id} name={contest.Name} />;
              })}
            </tbody>
          </table>
        );
      }
    } else {
      return (
        <div className="container">
          <div style={Styles.loadingStyle}>
            <img src={loading} alt="loading" />
          </div>
        </div>
      );
    }
  }
}

export default ContestList;
