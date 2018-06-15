import React, { Component } from "react";
import SubmissionRow from "./SubmissionRow.js";

import { Table } from "react-bootstrap";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class SubmissionList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      problemId: null,
      problem: null,
      contest: null,
      submissions: [],
      loaded: false,
      error: null
    };
  }

  componentDidMount() {
    const problemId = parseInt(this.props.match.params.problemId, 10);
    if (problemId) {
      this.setState({
        problemId: problemId
      });

      AxiosUtils.getProblem(problemId)
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
                  contest: contest
                });
                AxiosUtils.getSubmissions(problemId)
                  .then(result => {
                    this.setState({
                      submissions: result.data,
                      loaded: true
                    });
                  })
                  .catch(error => {
                    this.setState({
                      error: error
                    });
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
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Code</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {this.state.submissions
              .sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp))
              .map((submission, i) => {
                console.log(submission.Timestamp);
                return (
                  <SubmissionRow
                    key={i}
                    id={submission.Id}
                    userId={submission.UserId}
                    userName={submission.UserName}
                    fId={submission.FId}
                    status={submission.Status}
                    timestamp={submission.Timestamp}
                  />
                );
              })}
          </tbody>
        </Table>
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

export default SubmissionList;
