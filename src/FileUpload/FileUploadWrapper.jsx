import React, { Component } from "react";
import FileUpload from "./FileUpload";

/* 
let config = {
  containerId: "fileUploadPages",
  uploadType: "blob",
  placeholder: "Click here to browse the file(s)",
  multiple: true,
  required: true,
  abortCall: false,
  fileType: ".*",
  fileKeyUpload: "",
  url: "",
  popover: null,
  progressBar: null,
  showProgressBar: null,
  hideProgressBar: null,
  onFileUploadComplete: () => {},
  onBrowseComplete: () => {}
}; */
const  uploadedFiles = [
  /* {
      "fileName": "abc.zip",
      "fileSize": "16.58 KB",
      "id": "id1"
  },
  {
      "fileName": "react-treelist-withsearch.zip",
      "fileSize": "18.22 KB",
      "id": "id2"
  } */
];
class FileUploadWrapper extends Component {


  getFiles = files => {
    console.log("Final file list : ", files);
  };

  fileUploadComplete = ({result, status}) => {
    console.log(result, " : ", status);
  }

  handleFileDownload = (file) => {
    console.log("File download logic : ", file);
  }

  render() {
    return (
      <div>
        {this.props.field.uid && (
          <FileUpload
            uploadedFiles={uploadedFiles}
            uploadCallBack={this.fileUploadComplete}
            fileDownload={this.handleFileDownload}
            config={{
              containerId: this.props.field.uid + "_upload_file",
              placeholder: "Click here to browse the file(s)",
              multiple: true,
              required: true,
              fileType: ".zip",
              fileSize: "",
              url: ""
            }}
          />
        )}
      </div>
    );
  }
}

export default FileUploadWrapper;
