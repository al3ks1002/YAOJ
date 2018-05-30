import React, { Component } from "react";
import { Panel } from "react-bootstrap";

import * as LocalStorageUtils from "../utils/localStorage.js";
import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class Contest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contest: null,
      loaded: false,
      error: null
    };
  }

  componentDidMount() {
    const id = parseInt(this.props.match.params.id, 10);
    if (id) {
      AxiosUtils.getContest(id)
        .then(result => {
          const contest = result.data;
          if (
            !contest.IsPublic &&
            LocalStorageUtils.getUserId() !== contest.OwnerId
          ) {
            this.setState({
              error: new Error("Not authorized to see this contest")
            });
          } else {
            this.setState({
              contest: contest,
              loaded: true
            });
          }
        })
        .catch(error => {
          this.setState({
            error: error
          });
        });
    } else {
      this.setState({
        error: new Error("Contest ID is invalid")
      });
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      return (
        <Panel>
          <Panel.Heading>{this.state.contest.Name}</Panel.Heading>
          <Panel.Body>Info about the contest here..</Panel.Body>
        </Panel>
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

export default Contest;
