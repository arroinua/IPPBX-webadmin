function PanelComponent(props) {

	return (
	    <div className="panel">
	    	{props.header &&
	        <div className="panel-header"> {props.header}
	            <i className="fa fa-chevron-down"></i>
	        </div>
	    	}
	        <div className="panel-body">
	            {props.children}
	        </div>
	    </div>
	);
}
