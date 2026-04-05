import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: 0,
		margin: 0,
		maxWidth: "100%",
		width: "100%",
		height: `calc(100% - 48px)`,
	},

	contentWrapper: {
		height: "100%",
		minHeight: 0,
		maxWidth: "100%",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
	},
}));

const MainContainer = ({ children, className }) => {
	const classes = useStyles();

	return (
		<Container maxWidth={false} disableGutters className={`${classes.mainContainer} ${className || ""}`}>
			<div className={classes.contentWrapper}>{children}</div>
		</Container>
	);
};

export default MainContainer;
