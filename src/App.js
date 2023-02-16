import "./App.css";

import React, { useEffect, useState } from "react";

// @material-ui/core
import Appbar from "./components/Appbar";
import Dashboard from "./components/Dashboard";
import UploadImageForm from "./components/UploadImageForm";
import VizcatSnackBar from "./components/VizcatSnackBar";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [snackBarOpen, setSnackbarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [cats, setCats] = useState([]);
  const [tags, setTags] = useState({});
  const [checkedTags, setcheckedTags] = useState([]);
  const [images, setImages] = useState([]);
  const [tagsListOpen, setTagsListOpen] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [uploadImageOpen, setUploadImageOpen] = useState(false);

  const getData = async (url) => {
    try {
      let response = await fetch(url);
      let json = await response.json();
      return { success: true, data: json };
    } catch (error) {
      return { success: false };
    }
  };

  const postData = async (url = "", data) => {
    try {
      let response = await fetch(url, { method: "POST", body: data });
      console.log("response ", response);
      let json = await response.json();
      return { success: true, data: json };
    } catch {
      return { success: false };
    }
  };

  useEffect(() => {
    (async () => {
      let fetchedCats = await getData("/api/categories");
      let fetchedTags = await getData("/api/tags");
      let fetchedImages = await getData("/api/images");
      if (fetchedCats.success && fetchedTags.success && fetchedImages.success) {
        setCats((cats) => fetchedCats.data);
        setTags((tags) => fetchedTags.data);
        setImages((images) => fetchedImages.data["images"]);
        setLoading((loading) => false);
      }
    })();
  }, []);

  const openUploadImage = () => {
    setDashboardOpen((dashboardOpen) => false);
    setUploadImageOpen((uploadImageOpen) => true);
  };

  const openDashboard = () => {
    setUploadImageOpen((uploadImageOpen) => false);
    setDashboardOpen((dashboardOpen) => true);
  };

  const updateImage = async (data) => {
    console.log("data ", data);
    let json = await postData(`api/images/${data.id}/edit`, data.formData);
    console.log("json: ", json);
    if (!json.success) {
      console.log("json ", json);
      json.data = {
        detail: "Something went wrong. Sorry I dont have any further details",
        title: "error",
      };
    } else {
      setImages(json.data.data);
    }
    return json;
  };

  const deleteTag = async (tag) => {
    let tagDeleted = await postData(`api/tags/delete/${tag.id}`, tag);
    if (!tagDeleted.success) {
      tagDeleted.data = {
        detail: "Something went wrong. Sorry I dont have any further details",
        title: "error",
      };
    }
    if (tagDeleted.data.title === "success") {
      setTags(tagDeleted.data.data);
    }
    setSnackbarOpen(true);
    setSnackBarMessage((snackBarMessage) => tagDeleted.data.detail);
    setSeverity((severity) => tagDeleted.data.title);
  };

  // create a flat list of tags that are in image
  // tags is originally an object of arrays of objects. this returns an array of tagnames
  const listOfTagNames = (tags) =>
    Object.values(tags)
      .flat()
      .map(({ tag }) => tag);

  return (
    <div className="App">
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <Appbar
            openDashboard={openDashboard.bind(this)}
            openUploadImage={openUploadImage.bind(this)}
            cats={cats}
            tags={tags}
            checkedTags={checkedTags}
            setcheckedTags={setcheckedTags.bind(this)}
            listOfTagNames={listOfTagNames.bind(this)}
          />
          {dashboardOpen ? (
            <>
              <Dashboard
                cats={cats}
                tags={tags}
                images={images}
                tagsListOpen={tagsListOpen}
                deleteTag={deleteTag.bind(this)}
                checkedTags={checkedTags}
                setcheckedTags={setcheckedTags.bind(this)}
                listOfTagNames={listOfTagNames.bind(this)}
                setSnackbarOpen={setSnackbarOpen.bind(this)}
                setSnackBarMessage={setSnackBarMessage.bind(this)}
                setSeverity={setSeverity.bind(this)}
                updateImage={updateImage.bind(this)}
              />
            </>
          ) : (
            <></>
          )}
          {uploadImageOpen ? (
            <UploadImageForm
              open={uploadImageOpen}
              setSnackbarOpen={setSnackbarOpen.bind(this)}
              setSnackBarMessage={setSnackBarMessage.bind(this)}
              setSeverity={setSeverity.bind(this)}
              cats={cats}
              tags={tags}
              setTags={setTags.bind(this)}
              setImages={setImages.bind(this)}
              getData={getData.bind(this)}
              postData={postData.bind(this)}
            />
          ) : (
            <></>
          )}
          <VizcatSnackBar
            snackBarOpen={snackBarOpen}
            message={snackBarMessage}
            setSnackbarOpen={setSnackbarOpen}
            severity={severity}
          />
        </div>
      )}
    </div>
  );
}
