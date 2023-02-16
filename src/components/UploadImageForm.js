import {
  Button,
  CssBaseline,
  Grid,
  Paper,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React, { useState } from "react";

import AddTag from "./AddTag";
import GridItem from "./GridItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import PublishIcon from "@material-ui/icons/Publish";
import UploadImageTag from "./UploadImageTag";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
  textarea: {
    resize: "both",
  },
}));

export default function UploadImageForm(props) {
  const classes = useStyles();
  const [files, setFiles] = useState([]);
  const [filename, setFilename] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageComment, setImageComment] = useState("");

  const handleImageurlChange = (e) => {
    setImageUrl((imageUrl) => e.target.value);
  };

  const handleCommentChange = (e) => {
    setImageComment(e.target.value);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  const handleCheckChange = (e) => {
    let id = e.target.id;
    // if the tag is in the array remove it else add it
    if (checkedItems.some((item) => item.id === id)) {
      setCheckedItems(checkedItems.filter((item) => item.id !== id));
    } else {
      setCheckedItems((checkedItems) => [
        ...checkedItems,
        { id: id, tag: e.target.value },
      ]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkedItems.length < 1) {
      props.setSnackbarOpen(true);
      props.setSnackBarMessage(
        "Please add at least one tag so image can be filtered"
      );
      props.setSeverity("error");
    } else {
      const data = new FormData();
      data.append("file", files);
      data.append(
        "attributes",
        JSON.stringify({
          comment: imageComment,
          imageUrl: imageUrl,
          tags: checkedItems,
          filename: filename,
        })
      );

      let json = await props.postData("/api/images", data);
      if (!json.success) {
        json.data = {
          detail: "Something went wrong. Sorry I dont have any further details",
          title: "error",
        };
      } else {
        props.setImages(json.data.data);
        setFiles((files) => []);
        setFilename((filename) => "");
        setCheckedItems((checkedItems) => []);
        setImageComment((imageComment) => "");
      }
      props.setSnackbarOpen(true);
      props.setSnackBarMessage((snackBarMessage) => json.data.detail);
      props.setSeverity((severity) => json.data.title);
    }
  };

  const onImageChange = (e) => {
    if (e.target.files.length) {
      let target = e.target.files[0];
      setFilename((filename) => target.name);
      setFiles((files) => target);
    }
  };

  return (
    <div style={{ padding: 16, margin: "auto", maxWidth: 1000 }}>
      <AddTag
        snackBarOpen={props.snackBarOpen}
        setSnackbarOpen={props.setSnackbarOpen.bind(this)}
        cats={props.cats}
        setTags={props.setTags}
      />
      <CssBaseline />
      <Typography variant="h5" align="center">
        Upload Image
        <br />
        Please enter an image url or upload an image file
      </Typography>
      <form id="imageForm" onSubmit={handleSubmit} noValidate>
        <Paper style={{ padding: 16 }}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="flex-start"
          >
            {/* <GridItem justify="center">
              <TextField
                id="input-with-icon-grid"
                name="imageUrl"
                label="Please enter an image url"
                value={imageUrl}
                onChange={handleImageurlChange}
              />
            </GridItem> */}
            {/* <GridItem justify="center">
              <Typography variant="h5" align="center">
                OR
              </Typography>
            </GridItem> */}
            <GridItem justify="center">
              <Button
                variant="outlined"
                color="secondary"
                component="label"
                style={{ width: "100%" }}
              >
                Upload Image (.jpg, .jpeg, .png, or .gif accepted)
                <input
                  type="file"
                  onChange={onImageChange}
                  accept={[".jpg", ".jpeg", ".gif", ".png"]}
                  id="fileUpload"
                  hidden
                />
              </Button>
              <TextField
                id="filename"
                name="filename"
                value={filename}
                onChange={handleFilenameChange}
                variant="outlined"
                color="secondary"
                style={{ width: "100%" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublishIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </GridItem>
            <GridItem justify="center" xs={8}>
              <TextField
                id="image-comments"
                name="imageComment"
                label="Image Comment"
                placeholder="Add any extra comments about image here..."
                multiline
                variant="outlined"
                style={{ width: "100%" }}
                inputProps={{ className: classes.textarea }}
                value={imageComment}
                onChange={handleCommentChange}
              />
            </GridItem>
            <GridItem justify="center" xs={8}>
              <Typography variant="h5" align="center">
                Add tags to image
              </Typography>
            </GridItem>
            <GridItem justify="space-around" xs={12} sm={6} noItem={true}>
              {props.cats.map((val, idx) => {
                return (
                  <UploadImageTag
                    key={val.id + idx.toString()}
                    title={val.text}
                    tags={props.tags[val.id]}
                    checkedItems={checkedItems}
                    handleCheckChange={handleCheckChange.bind(this)}
                  />
                );
              })}
            </GridItem>
            <GridItem justify="center">
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </GridItem>
          </Grid>
        </Paper>
      </form>
    </div>
  );
}
