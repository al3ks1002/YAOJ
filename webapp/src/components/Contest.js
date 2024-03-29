import React, { Component } from "react";
import { Button, Panel } from "react-bootstrap";

import * as LocalStorageUtils from "../utils/localStorage.js";
import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

import ProblemList from "../components/ProblemList.js";
import history from "../utils/history";

class Contest extends Component {
  constructor(props) {
    super(props);

    this.handleAddProblem = this.handleAddProblem.bind(this);
    this.handleUpdateContest = this.handleUpdateContest.bind(this);
    this.handleDeleteContest = this.handleDeleteContest.bind(this);

    this.state = {
      id: null,
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

  handleAddProblem() {
    history.push("/new-problem/" + this.state.id);
  }

  handleUpdateContest() {
    history.push("/update-contest/" + this.state.id);
  }

  handleDeleteContest() {
    AxiosUtils.deleteContest(this.state.contest.Id)
      .then(result => {
        history.replace("/my-contests");
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  componentDidMount() {
    const id = parseInt(this.props.match.params.id, 10);
    if (id) {
      this.setState({
        id: id
      });
      AxiosUtils.getContest(id)
        .then(result => {
          const contest = result.data;
          if (!contest.IsPublic && !this.isMyContest(contest)) {
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
        <div>
          <div style={{ width: 700, marginLeft: 30 }}>
            <Panel>
              <Panel.Heading>
                <h4>{this.state.contest.Name}</h4>
              </Panel.Heading>
              <Panel.Body>
                {!this.state.contest.IsPublic && "Not "}
                Public
              </Panel.Body>
              <Panel.Body>
                Start time: {new Date(this.state.contest.StartTime).toString()}
              </Panel.Body>
              <Panel.Body>
                End time: {new Date(this.state.contest.EndTime).toString()}
              </Panel.Body>
            </Panel>
            <br />
            <ProblemList contestId={this.state.id} />
          </div>
          <aside>
            <div>
              {this.isMyContest(this.state.contest) && (
                <div>
                  <br />
                  <Button bsStyle="primary" onClick={this.handleAddProblem}>
                    Add problem
                  </Button>

                  <br />
                  <br />
                  <Button onClick={this.handleUpdateContest}>
                    Update contest
                  </Button>

                  <br />
                  <br />
                  <Button bsStyle="danger" onClick={this.handleDeleteContest}>
                    Delete contest
                  </Button>
                </div>
              )}
            </div>
          </aside>
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

export default Contest;
