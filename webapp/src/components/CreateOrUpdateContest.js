import React, { Component } from "react";
import {
  FormGroup,
  Button,
  Checkbox,
  FormControl,
  HelpBlock
} from "react-bootstrap";

import * as AxiosUtils from "../utils/axios.js";
import * as LocalStorageUtils from "../utils/localStorage.js";
import history from "../utils/history";

class CreateOrUpdateContest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isNew: this.props.isNew,
      id: null,
      isPublic: false,
      contestName: "",
      error: null
    };

    this.handleContestNameChange = this.handleContestNameChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
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
    if (!this.state.isNew) {
      const id = parseInt(this.props.match.params.id, 10);
      if (id) {
        this.setState({
          id: id
        });
        AxiosUtils.getContest(id)
          .then(result => {
            const contest = result.data;
            if (!this.isMyContest(contest)) {
              this.setState({
                error: new Error("Not authorized to modify this contest")
              });
            } else {
              this.setState({
                isPublic: contest.IsPublic,
                contestName: contest.Name
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

    if (this.state.isNew) {
      AxiosUtils.addContest(this.state.isPublic, this.state.contestName)
        .then(result => {
          history.push("/my-contests");
        })
        .catch(error => {
          this.setState({ error: error });
        });
    } else {
      AxiosUtils.updateContest(this.state.id, this.state.isPublic, this.state.contestName)
        .then(result => {
          history.push("/my-contests");
        })
        .catch(error => {
          this.setState({ error: error });
        });
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    return (
      <form style={{ width: 500 }} onSubmit={this.handleSubmit.bind(this)}>
        <FormGroup controlId="formCheckbox">
          <Checkbox
            checked={this.state.isPublic}
            onChange={this.handleIsPublicChange}
          >
            Is public:
          </Checkbox>
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
      </form>
    );
  }
}

export default CreateOrUpdateContest;
