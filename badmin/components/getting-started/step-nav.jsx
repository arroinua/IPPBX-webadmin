function GSStepNavComponent(props) {
	
	return (
		<div className="gs-step-nav clearfix">
			{
				(props.onPrev && props.prevText) && (
					<a href="#" className="pull-left" onClick={props.onPrev}><span className="fa fa-arrow-left"></span> {props.prevText}</a>
				)
			}
			{
				(props.onNext && props.nextText) && (
					<a href="#" className="pull-right" onClick={props.onNext}>{props.nextText} <span className="fa fa-arrow-right"></span></a>
				)
			}
		</div>
	);
}
