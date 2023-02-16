import { Grid } from "@material-ui/core";

export default function GridItem(props) {
  return (
    <Grid
      style={{ marginTop: 26 }}
      container
      direction="row"
      justify={props.justify}
    >
      <Grid item xs={props.xs}>
        {props.children}
      </Grid>
    </Grid>
  );
}
