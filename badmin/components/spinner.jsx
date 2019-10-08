function Spinner(props) {
	return <div className={props.classname || "text-center"} style={{ fontSize: "1.6em" }}><i className="fa fa-fw fa-spinner fa-spin"></i></div>;
}
