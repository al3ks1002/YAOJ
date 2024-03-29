import React, { Component } from "react";
import { FormGroup, Button, FormControl, HelpBlock } from "react-bootstrap";

import * as AxiosUtils from "../utils/axios.js";
import history from "../utils/history";

class NewProblem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contestId: null,
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

  componentDidMount() {
    const contestId = parseInt(this.props.match.params.contestId, 10);
    if (contestId) {
      this.setState({ contestId: contestId });
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

    AxiosUtils.addProblem(
      this.state.contestId,
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
      <div style={{ marginLeft: 30 }}>
        <form style={{ width: 700 }} onSubmit={this.handleSubmit.bind(this)}>
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
      </div>
    );
  }
}

export default NewProblem;
