import React, { Component } from "react";

import { Card, Table } from "antd";
import * as LocalStorageUtils from "../utils/localStorage.js";

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

  isMyContest(contest) {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === contest.OwnerId;
    } catch (error) {
      return false;
    }
  }

  isMySubmission(currentUserId) {
    try {
      const userId = LocalStorageUtils.getUserId();
      return userId === currentUserId;
    } catch (error) {
      return false;
    }
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
                    console.log(result.data);
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
    const columns = [
      {
        title: "#",
        dataIndex: "Id",
        defaultSortOrder: true,
        sorter: (a, b) => parseInt(a.Id, 10) - parseInt(b.Id, 10)
      },
      {
        title: "User",
        dataIndex: "UserName"
      },
      {
        title: "Code",
        render: (text, record) => {
          if (
            this.isMySubmission(record.UserId) ||
            this.isMyContest(this.state.contest)
          ) {
            return <a href={"http://localhost:8081/" + record.FId}>Code</a>;
          } else {
            return "-";
          }
        }
      },
      {
        title: "Status",
        dataIndex: "Status",
        render: (text, record) => {
          if (record.Status === "Done") {
            return record.Score;
          } else {
            return record.Status;
          }
        }
      },
      {
        title: "Time",
        dataIndex: "Timestamp",
        render: timestamp => new Date(timestamp).toString()
      },
      {
        title: "Result",
        dataIndex: "Result",
        render: (text, record) => {
          if (
            this.isMySubmission(record.UserId) ||
            this.isMyContest(this.state.contest)
          ) {
            return <a href={"/results/" + record.Id}>Result</a>;
          } else {
            return "-";
          }
        }
      }
    ];

    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      return (
        <div className="container">
          <Card
            title={
              <a href={"/problem/" + this.state.problemId}>
                {this.state.problem.Name}
              </a>
            }
          >
            <Table
              bordered
              size="small"
              pagination={false}
              columns={columns}
              rowKey={record => record.Id}
              dataSource={this.state.submissions}
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

export default SubmissionList;
