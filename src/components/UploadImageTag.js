import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from "@material-ui/core";

import React from "react";

export default function UploadImageTag(props) {
  const handleCheck = (val) => {
    if (props.checkedItems) {
      return props.checkedItems.some((item) => val === item.tag);
    }
  };
  return (
    <FormControl component="fieldset">
      <FormLabel component="label" color="primary">
        {props.title}
        {props.tags ? (
          <FormGroup row={false}>
            {props.tags.map((val, idx) => {
              return (
                <FormControlLabel
                  key={val.tag + idx.toString()}
                  label={val.tag}
                  control={
                    <Checkbox
                      id={`${val.id}`}
                      name={props.title}
                      value={val.tag}
                      checked={handleCheck(val.tag)}
                      onChange={props.handleCheckChange}
                    />
                  }
                />
              );
            })}
          </FormGroup>
        ) : (
          <p>no tags in this category</p>
        )}
      </FormLabel>
    </FormControl>
  );
}
