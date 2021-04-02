import React, { Component } from "react";
import fileUpload from "core/directives/fileUpload";
import FileList from "./FileList";

import "./FileUpload.less";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: this.props.uploadedFiles,
      loading: false,
      error: [],
      invalidFiles: []
    };
    this.fileArray = [];
    this.fileUpload = null;
  }

  componentDidMount() {
    this.initializeUploadComponent();
  }

  initializeUploadComponent() {
    let self = this;

    // On file browse complete call back
    let onBrowseComplete = () => {
      self.setState({ invalidFiles: [], error: [] });
      self.fileArray = [];
      let invalidFilesList = [];
      var patt = new RegExp(/<(\"[^\"]*\"|'[^']*'|[^'\">])*>/);
      var doubleDotExtension = new RegExp(/^([^.]+)\.([^.]+)$/);
      let files = self.fileUpload.files;
      for (let i = 0; i < files.length; i++) {
        let fileName = files[i].name;
        let fileSize = self.formatBytes(files[i].size);
        if (self.checkFileNameAlreadyAvailable(fileName)) {
          let errors = [
            ...self.state.error,
            `${fileName} file name already available`
          ];
          self.setState({ error: errors });
        } else if (
          files[i].name.match(new RegExp(self.fileUpload.config.fileType)) ===
          null
        ) {
          const err1 = `${fileName} is not a supported file type.`;
          invalidFilesList.push({ fileName, fileSize, err: err1 });
        } else if (patt.test(fileName) && doubleDotExtension.test(fileName)) {
          const err2 = `${fileName} is invalid file`;
          invalidFilesList.push({ fileName, fileSize, err: err2 });
        } else if (
          self.fileUpload.config.fileSize &&
          self.fileUpload.config.fileSize > files[i].size
        ) {
          const err3 = `${fileName} file exceeds the file size`;
          invalidFilesList.push({ fileName, fileSize, err: err3 });
        } else {
          let filesObj = { fileName, fileSize, loading: true };
          self.fileArray.push(files[i]);
          let newFilesList = [...self.state.selectedFiles, filesObj];
          self.setState({ selectedFiles: newFilesList });
        }
      }
      let newInvalidFilesList = [
        ...self.state.invalidFiles,
        ...invalidFilesList
      ];
      self.setState({ loading: true, invalidFiles: newInvalidFilesList });
      self.fileUpload.files = self.fileArray;
      self.fileUpload.onFileUpload();
    };

    //On file upload complete callback
    let onFileUploadComplete = function(
      result,
      status,
      uploadedPercentage,
      file
    ) {
      if (self.props.uploadCallBack) {
        self.props.uploadCallBack({ result, status, uploadedPercentage, file });
      }
      self.setState({ loading: false });

      let newSelectedFiles = [...self.state.selectedFiles];

      /* newSelectedFiles = newSelectedFiles.map(fileVal => ({
        ...fileVal,
        loading: false,
        status: 200
      }));
      self.setState({ selectedFiles: newSelectedFiles }); */

      let retryFiles = self.state.selectedFiles.filter(item =>
        self.fileArray.map(val => val.name).includes(item.fileName)
      );
      let invalidFiles = [...self.state.invalidFiles];

      let selectedFilesFiltered = newSelectedFiles.filter(function(objFromA) {
        return !retryFiles.find(function(objFromB) {
          return objFromA.fileName === objFromB.fileName;
        });
      });
   
      retryFiles = retryFiles.map(fileVal => ({
        ...fileVal,
        loading: false,
        status: "retry",
        err: "Failed to upload the file"
      }));
      self.setState({ selectedFiles: selectedFilesFiltered , invalidFiles: [...invalidFiles, ...retryFiles] });
    };

    // fileUpload component config
    let config = {
      ...this.props.config,
      onBrowseComplete: onBrowseComplete,
      onFileUploadComplete: onFileUploadComplete
    };

    // Creating fileUpload component
    let FileUploadComp = function(fileConfig) {
      this.config = fileConfig;
      this.applyStyles();
      this.createMarkUp();
    };

    FileUploadComp.inheritsFrom(fileUpload);

    FileUploadComp.prototype.validateFiletype = function() {
      let files = this.files || [];

      if (files.length === 0) {
        console.log("Empty file");
        let errors = [...this.state.error, "Empty file"];
        self.setState({ error: errors });
      }

      fileUpload.prototype.validateFiletype.call(this);
      return true;
    };

    this.fileUpload = new FileUploadComp(config);
  }

  // Format file size
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  // check for same file name already exists
  checkFileNameAlreadyAvailable(fileName) {
    const { selectedFiles } = this.state;
    const isAvailable =
      selectedFiles.filter(file => file.fileName === fileName).length > 0;
    return isAvailable;
  }

  // remove selected files
  handleRemove = (fileName, err) => {
    if (err) {
      let invalidFiles = [...this.state.invalidFiles];
      let filteredInvalidFiles = invalidFiles.filter(
        file => file.fileName !== fileName
      );
      this.setState({ invalidFiles: filteredInvalidFiles });
    } else {
      let files = [...this.state.selectedFiles];
      let newFileArray = [...this.fileArray];
      let filteredFiles = files.filter(file => file.fileName !== fileName);
      this.setState({ selectedFiles: filteredFiles });
      this.fileArray = newFileArray.filter(file => file.name !== fileName);
      this.getFiles();
    }
  };

  // upload callBack
  uploadCallBack(files) {
    if (this.props.uploadFiles) {
      this.props.uploadFiles(files);
    }
    this.getFiles();
  }

  getFiles() {
    if (this.props.getFiles) {
      this.props.getFiles(this.fileArray);
    }
  }

  handleRetry = (fileName) => {
    this.fileUpload.files = self.fileArray.filter(file => file.name === fileName);
    this.fileUpload.onFileUpload();
  }

  render() {
    const { selectedFiles, invalidFiles, error, loading } = this.state;
    return (
      <div className="pb-file-upload-wrapper">
        <div className="pb-file-upload-container">
          <div className="browse-file">
            <div className="browse-file-inner">
              <span className="text">
                Click here to <span className="highlight">Browse</span>
              </span>
            </div>
          </div>
          <div
            id={this.props.config.containerId}
            className="file-upload-comp-container"
          ></div>
        </div>
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="file-details">
            <FileList
              selectedFiles={selectedFiles}
              handleRemove={this.handleRemove}
              loading={loading}
              fileDownload={this.props.fileDownload}
            />
          </div>
        )}
        {invalidFiles && invalidFiles.length > 0 && (
          <div className="file-details error-info">
            <FileList
              selectedFiles={invalidFiles}
              handleRemove={this.handleRemove}
              onRetry={this.handleRetry}
            />
          </div>
        )}
        {error && error.length > 0 && (
          <div className="custom-err">
            {error.map(err => (
              <div key={err}>* {err}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default FileUpload;
