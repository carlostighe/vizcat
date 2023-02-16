import React, { useState } from "react";

import Checkbox from "@material-ui/core/Checkbox";
import Collapse from "@material-ui/core/Collapse";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { blue } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { useConfirm } from "material-ui-confirm";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  title: {
    color: blue,
  },
}));

export default function Tag(props) {
  const classes = useStyles();
  const confirm = useConfirm();

  const [open, setOpen] = useState(() => props.title === "data");

  const handleClick = () => {
    setOpen(!open);
  };

  const handleDelete = (tag) => {
    confirm({ description: `This will permanently delete tag: ${tag.tag}.` })
      .then(() => props.deleteTag(tag))
      .catch((e) => console.log("Deletion cancelled: ", e));
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.title} className={classes.title} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {props.tags ? (
          <List component="div" disablePadding>
            {props.tags.map((val, idx) => {
              const labelId = `checkbox-list-secondary-label-${val.tag}`;
              return (
                <ListItem
                  key={val + idx.toString()}
                  button
                  onClick={() => props.handleCheckToggle(val.tag)}
                  className={classes.nested}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="end"
                      onChange={() => props.handleCheckToggle(val.tag)}
                      checked={props.checkedTags.indexOf(val.tag) !== -1}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={val.tag} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="comments"
                      onClick={() => handleDelete(val)}
                    >
                      <DeleteForeverIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}{" "}
          </List>
        ) : (
          <List component="div" disablePadding>
            <ListItem button diasbled className={classes.nested}>
              No tags in this category
            </ListItem>
          </List>
        )}
      </Collapse>
    </>
  );
}
