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
      error: null
    };

    this.handleProblemNameChange = this.handleProblemNameChange.bind(this);
    this.handleProblemDescriptionChange = this.handleProblemDescriptionChange.bind(
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

    try {
      AxiosUtils.addProblem(
        this.state.contestId,
        this.state.problemName,
        this.state.problemDescription
      )
        .then(result => {
          history.goBack();
        })
        .catch(error => {
          this.setState({ error: error });
        });
    } catch (error) {
      this.setState({ error: error });
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    return (
      <form style={{ width: 500 }} onSubmit={this.handleSubmit.bind(this)}>
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
        <Button type="submit">Submit</Button>
      </form>
    );
  }
}

export default NewProblem;
