import React, { Component } from "react";
import { Well, Button, Panel } from "react-bootstrap";
import Dropzone from "react-dropzone";

import * as LocalStorageUtils from "../utils/localStorage.js";
import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

import TestList from "../components/TestList.js";
import SourceList from "../components/SourceList.js";

import history from "../utils/history";

class Problem extends Component {
  constructor(props) {
    super(props);

    this.handleDeleteProblem = this.handleDeleteProblem.bind(this);
    this.handleUpdateProblem = this.handleUpdateProblem.bind(this);
    this.handleUploadTests = this.handleUploadTests.bind(this);
    this.handleUploadSources = this.handleUploadSources.bind(this);
    this.sendFilesRequest = this.sendFilesRequest.bind(this);

    this.state = {
      id: null,
      problem: null,
      contest: null,
      loaded: false,
      tests: [],
      sources: [],
      error: null,
      refresh: false
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

  onTestsDrop(files) {
    const testRegex = new RegExp("^\\w+\\.(in|ok)$", "g");
    const filtered = files.filter(file => {
      return file.name.match(testRegex);
    });

    this.setState({
      tests: filtered
    });
  }

  onSourcesDrop(files) {
    const sourceRegex = new RegExp("^\\w+\\.(cpp)$", "g");
    const filtered = files.filter(file => {
      return file.name.match(sourceRegex);
    });

    this.setState({
      sources: filtered
    });
  }

  sendFilesRequest(formData, fileType) {
    AxiosUtils.uploadFiles(this.state.id, formData)
      .then(result => {
        if (fileType === "test") {
          this.setState({
            tests: []
          });
        } else {
          this.setState({
            sources: []
          });
        }

        this.setState({
          refresh: !this.state.refresh
        });
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  handleUploadFiles(files, callback, fileType) {
    var remainingFiles = files.length;

    const formData = new FormData();
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result;
        formData.append(file.name, fileContent);
        if (!--remainingFiles) {
          callback(formData, fileType);
        }
      };
      reader.onabort = () =>
        this.setState({ error: new Error("File reading was aborted") });
      reader.onerror = () =>
        this.setState({ error: new Error("File reading has failed") });

      reader.readAsText(file);
    });
  }

  handleUploadTests() {
    this.handleUploadFiles(this.state.tests, this.sendFilesRequest, "test");
  }

  handleUploadSources() {
    this.handleUploadFiles(this.state.sources, this.sendFilesRequest, "source");
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
        <div style={Styles.flex}>
          <div style={Styles.default}>
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
                <Button onClick={this.handleUpdateProblem}>
                  Update problem
                </Button>
                <br />
                <br />
                <Button bsStyle="danger" onClick={this.handleDeleteProblem}>
                  Delete Problem
                </Button>
              </div>
            )}
          </div>
          {this.isMyContest(this.state.contest) && (
            <div>
              <div style={Styles.flex}>
                <Dropzone onDrop={this.onTestsDrop.bind(this)}>
                  <p>
                    Upload tests.
                    <br />
                    <br />
                    Only .in and .ok files are accepted.
                  </p>
                </Dropzone>
                <aside>
                  <h2>Dropped tests</h2>
                  <ul>
                    {this.state.tests.map((file, i) => (
                      <li key={i}>
                        {file.name} - {file.size} bytes
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Button onClick={this.handleUploadTests}>
                      Upload tests
                    </Button>
                  </div>
                </aside>
                <TestList
                  refresh={this.state.refresh}
                  problemId={this.state.id}
                />
              </div>
              <br />
              <div style={Styles.flex}>
                <Dropzone onDrop={this.onSourcesDrop.bind(this)}>
                  <p>
                    Upload source code.<br />
                    <br />Only .cpp files are accepted.
                  </p>
                </Dropzone>
                <aside>
                  <h2>Dropped sources</h2>
                  <ul>
                    {this.state.sources.map((file, i) => (
                      <li key={i}>
                        {file.name} - {file.size} bytes
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Button onClick={this.handleUploadSources}>
                      Upload sources
                    </Button>
                  </div>
                </aside>
                <SourceList
                  refresh={this.state.refresh}
                  problemId={this.state.id}
                />
              </div>
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
