import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import VizcatSnackBar from "./VizcatSnackBar";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),

    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "300px",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(2),
    },
  },
}));
export default function AddTag(props) {
  const classes = useStyles();
  const [tag, setTag] = useState("");
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let data = JSON.stringify({
      name: tag,
      category: category,
    });

    fetch("/api/tags", {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((res) => {
        if (res.status !== 200) {
          return {
            detail: res.status.toString() + ": " + res.statusText,
            title: "error",
          };
        } else {
          return res.json();
        }
      })
      .then((json) => {
        if (json.title === "success") {
          props.setTags(json.data);
        }
        props.setSnackbarOpen(true);
        setSnackBarMessage((snackBarMessage) => json.detail);
        setSeverity((severity) => json.title);
        setTag("");
        setCategory("");
      });
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <Paper style={{ padding: 16 }}>
        <Grid container spacing={2}>
          <Grid
            style={{ marginTop: 10 }}
            container
            direction="row"
            justify="space-evenly"
          >
            <Grid item>
              <RadioGroup
                row
                aria-label="category"
                name="category"
                onChange={(e) => setCategory(e.target.value.toString())}
                value={category}
              >
                {props.cats.map((val, idx) => {
                  return (
                    <FormControlLabel
                      key={val.text + idx.toString()}
                      value={val.id.toString()}
                      control={<Radio />}
                      label={val.text}
                      labelPlacement="top"
                    />
                  );
                })}
              </RadioGroup>
            </Grid>
            <Grid item>
              <TextField
                id="tag"
                name="tag"
                value={tag}
                type="text"
                label="Please enter a new tag"
                onChange={(e) => setTag(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" type="submit">
                Add
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <VizcatSnackBar
        snackBarOpen={props.snackBarOpen}
        message={snackBarMessage}
        setSnackbarOpen={props.setSnackbarOpen.bind(this)}
        severity={severity}
      />
    </form>
  );
}
