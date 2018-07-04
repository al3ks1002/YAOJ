import React, { Component } from "react";
import { FormGroup, Button, FormControl, HelpBlock } from "react-bootstrap";
import { Card } from "antd";

import * as AxiosUtils from "../utils/axios.js";
import * as LocalStorageUtils from "../utils/localStorage.js";
import history from "../utils/history";

class UpdateProblem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      problemId: null,
      contest: null,
      problemName: "",
      problemDescription: "",
      problemTimelimit: "",
      error: null
    };

    this.handleProblemNameChange = this.handleProblemNameChange.bind(this);
    this.handleProblemDescriptionChange = this.handleProblemDescriptionChange.bind(
      this
    );
    this.handleProblemTimelimitChange = this.handleProblemTimelimitChange.bind(
      this
    );
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
    const problemId = parseInt(this.props.match.params.problemId, 10);
    if (problemId) {
      this.setState({
        problemId: problemId
      });
      AxiosUtils.getProblem(problemId)
        .then(result => {
          const problem = result.data;
          this.setState({
            problemName: problem.Name,
            problemDescription: problem.Description,
            problemTimelimit: problem.Timelimit
          });

          AxiosUtils.getContest(problem.ContestId)
            .then(result => {
              const contest = result.data;
              if (!this.isMyContest(contest)) {
                this.setState({
                  error: new Error("Not authorized to modify this problem")
                });
              } else {
                this.setState({
                  contest: contest
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

  handleProblemNameChange(event) {
    this.setState({
      problemName: event.target.value
    });
  }

  handleProblemDescriptionChange(event) {
    this.setState({
      problemDescription: event.target.value
    });
  }

  handleProblemTimelimitChange(event) {
    this.setState({
      problemTimelimit: event.target.value
    });
  }

  getNameValidationState() {
    const length = this.state.problemName.length;
    if (length > 0 && length < 50) {
      return "success";
    }
    return "error";
  }

  getDescriptionValidationState() {
    const length = this.state.problemDescription.length;
    if (length > 0 && length < 1000) {
      return "success";
    }
    return "error";
  }

  getTimelimitValidationState() {
    var timelimitInt = parseInt(this.state.problemTimelimit, 10);
    if (timelimitInt >= 100 && timelimitInt <= 10000) {
      return "success";
    }
    return "error";
  }

  handleSubmit(event) {
    event.preventDefault();

    const nameValidationState = this.getNameValidationState();
    if (nameValidationState === "error") {
      return;
    }

    const descriptionValidationState = this.getDescriptionValidationState();
    if (descriptionValidationState === "error") {
      return;
    }

    const timelimitValidationState = this.getTimelimitValidationState();
    if (timelimitValidationState === "error") {
      return;
    }

    AxiosUtils.updateProblem(
      this.state.problemId,
      this.state.problemName,
      this.state.problemDescription,
      this.state.problemTimelimit
    )
      .then(result => {
        history.goBack();
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    return (
      <div className="container">
        <Card title="Update problem">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <FormGroup
              controlId="formBasicText"
              validationState={this.getNameValidationState()}
            >
              <FormControl
                type="text"
                value={this.state.problemName}
                placeholder="Problem name"
                onChange={this.handleProblemNameChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                Problem name must be between 1 and 50 characters.
              </HelpBlock>
            </FormGroup>
            <FormGroup
              controlId="formBasicText"
              validationState={this.getDescriptionValidationState()}
            >
              <FormControl
                componentClass="textarea"
                style={{ height: 300 }}
                type="text"
                value={this.state.problemDescription}
                placeholder="Problem description"
                onChange={this.handleProblemDescriptionChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                Description name must be between 1 and 1000 characters.
              </HelpBlock>
            </FormGroup>
            <FormGroup
              controlId="formBasicText"
              validationState={this.getTimelimitValidationState()}
            >
              <FormControl
                type="number"
                value={this.state.problemTimelimit}
                placeholder="Problem timelimit"
                onChange={this.handleProblemTimelimitChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                Timelimit must be between 100 and 10000 (in ms).
              </HelpBlock>
            </FormGroup>

            <Button type="submit">Submit</Button>
          </form>
        </Card>
      </div>
    );
  }
}

export default UpdateProblem;
