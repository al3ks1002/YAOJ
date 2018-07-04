import React, { Component } from "react";

import { Card, Table } from "antd";
import * as LocalStorageUtils from "../utils/localStorage.js";

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

  isMyContest(contest) {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === contest.OwnerId;
    } catch (error) {
      return false;
    }
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
    const columns = [
      {
        title: "Test Name",
        dataIndex: "TestName",
        sorter: (a, b) => a.TestName > b.TestName,
        defaultSortOrder: true,
        render: name => name + ".in"
      },
      {
        title: "Verdict",
        dataIndex: "Verdict",
        render: verdict => {
          if (verdict === "Accepted") {
            return <div style={{ color: "green" }}><b>Accepted</b></div>;
          } else {
            return <div style={{ color: "red" }}><b>{verdict}</b></div>;
          }
        }
      },
      {
        title: "Time",
        dataIndex: "Time",
        render: time => time + " ms"
      }
    ];

    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      return (
        <div className="container">
          <Card
            title="Results"
            extra={
              <font size="3">
                Go back to:{" "}
                <a href={"/submissions/" + this.state.problem.Id}>
                  {this.state.problem.Name}
                </a>
              </font>
            }
          >
            <Table
              bordered
              pagination={false}
              size="small"
              columns={columns}
              rowKey={record => record.Id}
              dataSource={this.state.results}
              loading={this.state.loading}
            />
          </Card>
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

export default ResultList;
