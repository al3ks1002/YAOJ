import React, { Component } from "react";
import { Panel } from "react-bootstrap";

import * as LocalStorageUtils from "../utils/localStorage.js";
import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class Problem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: null,
      problem: null,
      contest: null,
      loaded: false,
      error: null
    };
  }

  isMyContest(contest) {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === contest.OwnerId;
    } catch (error) {
      return false;
    }
  }

  componentDidMount() {
    const id = parseInt(this.props.match.params.id, 10);
    if (id) {
      this.setState({
        id: id
      });

      AxiosUtils.getProblem(id)
        .then(result => {
          const problem = result.data;
          this.setState({
            problem: problem
          });
          AxiosUtils.getContest(problem.ContestId)
            .then(result => {
              const contest = result.data;
              if (!contest.IsPublic && !this.isMyContest(contest)) {
                this.setState({
                  error: new Error("Not authorized to see this problem")
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
        })
        .catch(error => {
          this.setState({
            error: error
          });
        });
    } else {
      this.setState({
        error: new Error("Problem ID is invalid")
      });
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      return (
        <div>
          <Panel>
            <Panel.Heading>{this.state.problem.Name}</Panel.Heading>
            <Panel.Body>{this.state.problem.Description}</Panel.Body>
          </Panel>
        </div>
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

export default Problem;
