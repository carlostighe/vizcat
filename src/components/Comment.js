import Typography from "@material-ui/core/Typography";

export default function Comment(props) {
  if (props.comments) {
    return (
      <Typography variant="body2" color="textSecondary" component="p">
        <br />
        {props.comments.text}
      </Typography>
    );
  }
  return null;
}
