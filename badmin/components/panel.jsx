function PanelComponent(props) {

	return (
	    <div className={"panel "+(props.classname || "")}>
	    	{props.header &&
	        <div className="panel-header">{props.header}</div>
	    	}
	        <div className="panel-body">
	            {props.children || props.body}
	        </div>
	        {props.footer &&
	        <div className="panel-footer"> 
	        	{props.footer}
	        </div>
	    	}
	    </div>
	);
}
