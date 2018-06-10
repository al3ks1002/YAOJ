import React, { Component } from "react";

import { Table } from "react-bootstrap";

import loading from "../assets/loading.svg";
import Styles from "../utils/styles.js";
import * as AxiosUtils from "../utils/axios.js";

import SourceRow from "../components/SourceRow.js";

class SourceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      problemId: this.props.problemId,
      sources: [],
      loaded: false,
      error: null,
      refresh: this.props.refresh,
      shouldUpdate: false
    };

    this.deleteSourceCallback = this.deleteSourceCallback.bind(this);
  }

  fetchSources() {
    AxiosUtils.getSources(this.state.problemId)
      .then(result => {
        this.setState({
          sources: result.data,
          loaded: true
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  static getDerivedStateFromProps(props, state) {
    // Store prevId in state so we can compare when props change.
    // Clear out previously-loaded data (so we don't render stale stuff).
    if (props.refresh !== state.refresh) {
      return {
        shouldUpdate: true,
        refresh: props.refresh,
        loaded: false
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    this.fetchSources();
  }

  componentDidUpdate() {
    if (this.state.shouldUpdate) {
      this.setState({ shouldUpdate: false });
      this.fetchSources();
    }
  }

  deleteSourceCallback(fId) {
    AxiosUtils.deleteFile(fId)
      .then(result => {
        this.setState({
          shouldUpdate: true,
          loaded: 0
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    if (this.state.loaded) {
      return (
        <div style={Styles.flex}>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {this.state.sources
                .sort((a, b) => a.FileName > b.FileName)
                .map((source, i) => {
                  return (
                    <SourceRow
                      key={i}
                      name={source.FileName}
                      fId={source.FId}
                      deleteSourceCallback={this.deleteSourceCallback}
                    />
                  );
                })}
            </tbody>
          </Table>
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

export default SourceList;
