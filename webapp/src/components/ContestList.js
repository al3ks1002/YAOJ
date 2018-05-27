import React, { Component } from "react";
import Contest from "./Contest.js";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class ContestList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPublic: this.props.isPublic,
      contests: [],
      loaded: false,
      error: null
    };
  }

  // Once this components mounts, we will make a call to the API to get the product data
  componentDidMount() {
    try {
      AxiosUtils.getContests(this.state.isPublic)
        .then(result => {
          this.setState({
            contests: result.data,
            loaded: true
          });
        })
        .catch(error => {
          this.setState({
            loaded: true,
            error: error
          });
          console.log(error);
        });
    } catch (error) {
      this.setState({
        loaded: true,
        error: error
      });
      console.log(error);
    }
  }

  render() {
    if (this.state.error) {
      return <div>{this.state.error.toString()}</div>;
    }
    if (this.state.loaded) {
      if (this.state.contests.length === 0) {
        return <div>There are no contests at the moment.</div>;
      }
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
    return (
      <div className="container">
        <div style={Styles.loadingStyle}>
          <img src={loading} alt="loading" />
        </div>
      </div>
    );
  }
}

export default ContestList;
