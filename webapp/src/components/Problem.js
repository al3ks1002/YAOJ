import React, { Component } from "react";
import { Well, Button, Panel } from "react-bootstrap";

import * as LocalStorageUtils from "../utils/localStorage.js";
import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

import history from "../utils/history";

class Problem extends Component {
  constructor(props) {
    super(props);

    this.handleDeleteProblem = this.handleDeleteProblem.bind(this);
    this.handleUpdateProblem = this.handleUpdateProblem.bind(this);

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

  handleDeleteProblem() {
    AxiosUtils.deleteProblem(this.state.problem.Id)
      .then(result => {
        history.replace("/contest/" + this.state.contest.Id);
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  handleUpdateProblem() {
    history.push("/update-problem/" + this.state.id);
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
            <Panel.Heading>
              <h5>Contest: {this.state.contest.Name}</h5>
            </Panel.Heading>
            <Panel.Body>
              <div>
                <h4>Problem: {this.state.problem.Name}</h4>
              </div>
              <br />
              <Well>{this.state.problem.Description}</Well>
            </Panel.Body>
          </Panel>
          {this.isMyContest(this.state.contest) && (
            <div>
              <br />
              <Button onClick={this.handleUpdateProblem}>Update problem</Button>
              <br />
              <br />
              <Button bsStyle="danger" onClick={this.handleDeleteProblem}>
                Delete Problem
              </Button>
            </div>
          )}
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
