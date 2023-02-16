import React, { useCallback } from "react";

import AccessibilityIcon from "@material-ui/icons/Accessibility";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import { ConfirmProvider } from "material-ui-confirm";
import DataUsageIcon from "@material-ui/icons/DataUsage";
import Drawer from "@material-ui/core/Drawer";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import ImageCard from "./ImageCard";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import MapIcon from "@material-ui/icons/Map";
import { MuuriComponent } from "muuri-react";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import Tag from "./Tag";
import { Typography } from "@material-ui/core";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 4px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(0),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(0),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  list: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function Dashboard({
  cats,
  tags,
  images,
  tagsListOpen,
  deleteTag,
  checkedTags,
  setcheckedTags,
  listOfTagNames,
  setSnackbarOpen,
  setSnackBarMessage,
  setSeverity,
  updateImage,
}) {
  const classes = useStyles();
  const icons = {
    data: <DataUsageIcon />,
    visualization: <EqualizerIcon />,
    interaction: <PhotoLibraryIcon />,
    geographic: <MapIcon />,
    other: <InboxIcon />,
    "user story": <AccessibilityIcon />,
    virus: <LocalHospitalIcon />,
  };

  const imageCards = images.map((img) => (
    <ImageCard
      key={`image${img.id}`}
      cats={cats}
      tags={tags}
      img={img}
      imageTags={img.tags}
      listOfTagNames={listOfTagNames}
      setSnackbarOpen={setSnackbarOpen}
      setSnackBarMessage={setSnackBarMessage}
      setSeverity={setSeverity}
      updateImage={updateImage}
    />
  ));

  const handleCheckToggle = (tag) => {
    const currentIndex = checkedTags.indexOf(tag);
    const newChecked = [...checkedTags];

    if (currentIndex === -1) {
      newChecked.push(tag);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setcheckedTags([...newChecked]);
  };

  const clearCheckedTags = () => setcheckedTags([]);

  const filter = useCallback(
    ({ imageTags }) => {
      // pass in all tags and flatten into an array of tagnames.
      // compare this with the similarly flattened list of checkedTags
      // if only one checkedTag show images otherwise show union
      const imageTagsList = listOfTagNames(imageTags);
      if (checkedTags.length === 0) {
        return true;
      }

      return checkedTags.length > 1
        ? checkedTags.every((tag) => imageTagsList.indexOf(tag) > -1)
        : checkedTags.some((tag) => imageTagsList.indexOf(tag) > -1);
    },
    [checkedTags, listOfTagNames]
  );

  return (
    <div className={classes.root}>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !tagsListOpen && classes.drawerPaperClose
          ),
        }}
        open={tagsListOpen}
      >
        <ConfirmProvider>
          <List
            dense
            component="nav"
            aria-labelledby="nested-list-subheader"
            className={classes.list}
          >
            <ListItem button onClick={clearCheckedTags}>
              <ListItemIcon>
                <ClearAllIcon />
              </ListItemIcon>
              <ListItemText primary="Show All Images" />
            </ListItem>
            {cats.map((val, idx) => {
              return (
                <Tag
                  handleCheckToggle={handleCheckToggle.bind(this)}
                  checkedTags={checkedTags}
                  setcheckedTags={setcheckedTags}
                  key={val.id + idx.toString()}
                  title={val.text}
                  icon={icons[val.text]}
                  tags={tags[val.id]}
                  deleteTag={deleteTag}
                />
              );
            })}
          </List>
        </ConfirmProvider>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {imageCards.length ? (
          <MuuriComponent
            propsToData={({ imageTags }) => ({ imageTags })}
            filter={filter}
            forceSync
          >
            {imageCards}
          </MuuriComponent>
        ) : (
          <Typography variant="h5" align="center">
            No Images in Catalogue
          </Typography>
        )}
      </main>
    </div>
  );
}
