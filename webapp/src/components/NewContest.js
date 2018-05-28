import React, { Component } from "react";
import {
  FormGroup,
  Button,
  Well,
  Checkbox,
  FormControl,
  HelpBlock
} from "react-bootstrap";

import * as AxiosUtils from "../utils/axios.js";
import history from "../utils/history";

class NewContest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPublic: false,
      contestName: "",
      error: ""
    };

    this.handleContestNameChange = this.handleContestNameChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
  }

  handleContestNameChange(event) {
    this.setState({
      contestName: event.target.value
    });
  }

  handleIsPublicChange(event) {
    this.setState({
      isPublic: event.target.checked
    });
  }

  getValidationState() {
    const length = this.state.contestName.length;
    if (length > 0 && length < 50) {
      return "success";
    }
    return "error";
  }

  handleSubmit(event) {
    event.preventDefault();

    const validationState = this.getValidationState();
    if (validationState === "error") {
      return;
    }

    try {
      AxiosUtils.addContest(this.state.isPublic, this.state.contestName)
        .then(result => {
          history.push("/my-contests");
        })
        .catch(error => {
          this.setState({ error: error.toString() });
        });
    } catch (error) {
      this.setState({ error: error.toString() });
    }
  }

  render() {
    return (
      <form style={{ width: 500 }} onSubmit={this.handleSubmit.bind(this)}>
        <FormGroup controlId="formCheckbox">
          <Checkbox onChange={this.handleIsPublicChange}>Is public:</Checkbox>
        </FormGroup>
        <FormGroup
          controlId="formBasicText"
          validationState={this.getValidationState()}
        >
          <FormControl
            type="text"
            value={this.state.contestName}
            placeholder="Contest name"
            onChange={this.handleContestNameChange}
          />
          <FormControl.Feedback />
          <HelpBlock>
            Contest name must be between 1 and 50 characters.
          </HelpBlock>
        </FormGroup>
        <Button type="submit">Submit</Button>
        <br />
        <br />
        {this.state.error && <Well>{this.state.error}</Well>}
      </form>
    );
  }
}

export default NewContest;
