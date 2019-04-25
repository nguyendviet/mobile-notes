import React, { Component } from "react";
import { API, Storage } from "aws-amplify";

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      note: null,
      content: "",
      attachmentURL: null
    };
  }

  getNote() {
    return API.get("notes", `/notes/${this.props.match.params.id}`);
  }

  render() {
    return <div>This is profile page</div>;
  }
}
