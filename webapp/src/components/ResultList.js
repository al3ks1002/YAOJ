import React, { Component } from "react";
import ResultRow from "./ResultRow.js";

import { Table } from "react-bootstrap";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

class ResultList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      problemId: null,
      problem: null,
      contest: null,
      submission: null,
      results: [],
      loaded: false,
      error: null
    };
  }

  componentDidMount() {
    const submissionId = parseInt(this.props.match.params.submissionId, 10);
    if (submissionId) {
      this.setState({
        submissionId: submissionId
      });

      AxiosUtils.getSubmission(submissionId)
        .then(result => {
          const submission = result.data;
          this.setState({
            submission: submission
          });

          AxiosUtils.getProblem(submission.ProblemId)
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
                    AxiosUtils.getResults(submissionId)
                      .then(result => {
                        this.setState({
                          results: result.data,
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
        })
        .catch(error => {
          this.setState({
            error: error
          });
        });
    } else {
      this.setState({
        error: new Error("Submission ID is invalid")
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
              <th>Test name</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {this.state.results
              .sort((a, b) => a.TestName > b.TestName)
              .map((result, i) => {
                return (
                  <ResultRow
                    key={i}
                    id={result.Id}
                    testName={result.TestName}
                    verdict={result.Verdict}
                    userId={this.state.submission.UserId}
                    contestOwnerId={this.state.contest.OwnerId}
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

export default ResultList;
