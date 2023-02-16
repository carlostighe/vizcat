import React, { useState } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";

import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CloseIcon from "@material-ui/icons/Close";
import Comment from "./Comment";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Divider } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import InputAdornment from "@material-ui/core/InputAdornment";
import SaveIcon from "@material-ui/icons/Save";
import SearchIcon from "@material-ui/icons/Search";
import { TextField } from "@material-ui/core";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 500,
    width: 330,
    margin: 5,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  marg2: {
    margin: theme.spacing(2),
  },
  media: {
    height: 240,
  },
  dialogMedia: {
    height: 620,
    "background-size": "contain",
    "background-repeat": "no-repeat",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function ImageCard({
  cats,
  tags,
  img,
  imageTags,
  listOfTagNames,
  setSnackbarOpen,
  setSnackBarMessage,
  setSeverity,
  updateImage,
}) {
  const classes = useStyles();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [editImage, seteditImage] = useState(false);
  const [filename, setFilename] = useState(() =>
    JSON.parse(JSON.stringify(img.image_url))
  );
  const [checkedItems, setCheckedItems] = useState(() =>
    listOfTagNames(JSON.parse(JSON.stringify(img.tags)))
  );
  const [imageComment, setImageComment] = useState(() => {
    const imgCom = img.comments ? img.comments.text : "";
    return JSON.parse(JSON.stringify(imgCom));
  });

  const handleClickOpen = () => {
    setImageDialogOpen(true);
  };

  const handleEdit = () => {
    seteditImage(!editImage);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  const handleAddTag = (event, value) => {
    setCheckedItems(value);
  };

  const handleCommentChange = (e) => {
    setImageComment(e.target.value);
  };

  const handleCancel = () => {
    seteditImage(false);
    setFilename(img.image_url);
    setImageComment(img.comments);
    setCheckedItems(listOfTagNames(imageTags));
  };

  const handleClose = () => {
    setImageDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkedItems.length < 1) {
      setSnackbarOpen(true);
      setSnackBarMessage(
        "Please add at least one tag so image can be filtered"
      );
      setSeverity("error");
    } else {
      // check if comment is a new comment or an edited comment
      let commentId = !img.comments ? null : img.comments.id;
      const formData = new FormData();
      formData.append(
        "attributes",
        JSON.stringify({
          id: img.id,
          commentId: commentId,
          newComment: !img.comments,
          commentText: imageComment,
          filename: filename,
          tags: checkedItems,
        })
      );
      const data = {
        id: img.id,
        formData: formData,
      };
      const json = await updateImage(data);
      setSnackbarOpen(true);
      setSnackBarMessage((snackBarMessage) => json.data.detail);
      setSeverity((severity) => json.data.title);
      seteditImage(false);
    }
  };

  return (
    <React.Fragment>
      <Card className={classes.root}>
        <CardMedia
          className={classes.media}
          image={process.env.PUBLIC_URL + "public/images/" + img.image_url}
          title={img.image_url}
          onClick={handleClickOpen}
        />
        <CardActions disableSpacing title={img.image_url}>
          <Typography variant="h6" gutterBottom>
            {img.image_url}
          </Typography>
        </CardActions>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            Tags
            <br />
            {Object.keys(imageTags).map((key) => {
              let cat = cats.filter((cat) => cat.id === parseInt(key))[0];
              return (
                <span key={`${cat.text}_${key}`}>
                  {cat.text}: {imageTags[key].map((tag) => tag.tag + ", ")}
                  <br />
                </span>
              );
            })}
          </Typography>
          <Comment comments={img.comments} />
        </CardContent>
      </Card>

      <Dialog
        fullWidth={true}
        maxWidth={"md"}
        open={imageDialogOpen}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        {editImage ? (
          <form id="imageForm" onSubmit={handleSubmit} noValidate>
            <DialogTitle id="max-width-dialog-title">
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
                      <EditIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </DialogTitle>
            <DialogContent>
              <CardMedia
                className={classes.dialogMedia}
                image={process.env.PUBLIC_URL + "public/images/" + filename}
                title={filename}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Tags:
                  <br />
                  <div className={classes.search}>
                    <div className={classes.searchIcon}>
                      <SearchIcon />
                    </div>
                    <div className={classes.inputInput}>
                      <Autocomplete
                        multiple
                        id="tags-outlined"
                        options={listOfTagNames(tags)}
                        getOptionLabel={(option) => option}
                        value={checkedItems}
                        filterSelectedOptions
                        onChange={handleAddTag}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Search…" />
                        )}
                      />
                    </div>
                  </div>
                </Typography>
                <Typography
                  className={classes.marg2}
                  variant="body2"
                  color="textSecondary"
                >
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
                </Typography>
              </CardContent>
            </DialogContent>
          </form>
        ) : (
          <>
            <DialogTitle id="max-width-dialog-title">
              {img.image_url}
            </DialogTitle>
            <DialogContent>
              <CardMedia
                className={classes.dialogMedia}
                image={
                  process.env.PUBLIC_URL + "public/images/" + img.image_url
                }
                title={img.image_url}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  Tags:
                  <br />
                  {Object.keys(imageTags).map((key) => {
                    let cat = cats.filter((cat) => cat.id === parseInt(key))[0];
                    return (
                      <span key={`${cat.text}_${key}`}>
                        {cat.text}:{" "}
                        {imageTags[key].map((tag) => tag.tag + ", ")}
                        <br />
                      </span>
                    );
                  })}
                </Typography>
                <Comment comments={img.comments} />
              </CardContent>
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button
            onClick={editImage ? handleSubmit : handleEdit}
            color="primary"
            variant="contained"
            startIcon={editImage ? <SaveIcon /> : <EditIcon />}
          >
            {editImage ? "Save" : "Edit"}
          </Button>
          <Button
            onClick={editImage ? handleCancel : handleClose}
            color="secondary"
            variant="contained"
            startIcon={<CloseIcon />}
          >
            {editImage ? "Cancel" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
