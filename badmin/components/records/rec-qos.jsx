
var RecQosTable = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object,
		utils: React.PropTypes.object
	},

	// _setDefaultValue: function(item) {
	// 	item.in = Object.keys(item.in).forEach(function(key, index) {
	// 		item.in[key] = item.in[key] || 0;
	// 	});
	// 	item.out = Object.keys(item.out).forEach(function(key, index) {
	// 		item.out[key] = item.out[key] || 0;
	// 	});

	// 	return item;
	// },

	// _formatTimeString: function(value, format) {
	// 	return this.props.utils.formatTimeString(value, format);
	// },

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;
		console.log('render: ', data);

		return (
			
			<div className="rec-qos-cont">
			    <div className="rec-qos-head">
			    	<div className="pull-left">
			    		<span className="fa fa-user"></span>
			    		<br/>
			    		<span>{ data.na }</span>
			    	</div>
			    	<div className="pull-right">
			    		<span className="fa fa-user"></span>
			    		<br/>
			    		<span>{ data.nb }</span>
			    	</div>
			    	<div>
			    		<span className="fa fa-server"></span>
			    	</div>
			    	<div className="direction-arrows"></div>
			    </div>
				<div className="rec-qos-body">
					<div className="col-xs-6">
						<div className="table-responsive">
						    <table className="table">
						        <thead>
						            <tr>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.JFE } className="initialism">JFE</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.JNE } className="initialism">JNE</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.LAT } className="initialism">LAT</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.LFE } className="initialism">LFE,%</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.LNE } className="initialism">LNE,%</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.MFE } className="initialism">MFE</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.MNE } className="initialism">MNE</abbr></th>
						                <th><abbr title={ frases.STATISTICS.TRNUK_QOS.RFE } className="initialism">RFE</abbr></th>
						                <th><abbr title={ frases.STATISTICS.TRNUK_QOS.RNE } className="initialism">RNE</abbr></th>
						            </tr>
						        </thead>
						        <tbody>
					        		<tr>
					        			<td>{ data.jfe1 }</td>
					        			<td>{ data.jne1 }</td>
					        			<td>{ data.lat1 }</td>
					        			<td>{ data.lfe1 }</td>
					        			<td>{ data.lne1 }</td>
					        			<td>{ data.mfe1 }</td>
					        			<td>{ data.mne1 }</td>
						        		<td>{ data.rfe1 }</td>
						        		<td>{ data.rne1 }</td>
						        	</tr>
						        </tbody>
						    </table>
						</div>
					</div>
					<div className="col-xs-6">
						<div className="table-responsive">
						    <table className="table">
						        <thead>
						            <tr>
						                <th><abbr title={ frases.STATISTICS.TRNUK_QOS.JFE } className="initialism">JFE</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.JNE } className="initialism">JNE</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.LAT } className="initialism">LAT</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.LFE } className="initialism">LFE,%</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.LNE } className="initialism">LNE,%</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.MFE } className="initialism">MFE</abbr></th>
						            	<th><abbr title={ frases.STATISTICS.TRNUK_QOS.MNE } className="initialism">MNE</abbr></th>
						                <th><abbr title={ frases.STATISTICS.TRNUK_QOS.RFE } className="initialism">RFE</abbr></th>
						                <th><abbr title={ frases.STATISTICS.TRNUK_QOS.RNE } className="initialism">RNE</abbr></th>
						            </tr>
						        </thead>
						        <tbody>
					        		<tr>
					        			<td>{ data.jfe2 }</td>
					        			<td>{ data.jne2 }</td>
					        			<td>{ data.lat2 }</td>
					        			<td>{ data.lfe2 }</td>
					        			<td>{ data.lne2 }</td>
					        			<td>{ data.mfe2 }</td>
					        			<td>{ data.mne2 }</td>
						        		<td>{ data.rfe2 }</td>
						        		<td>{ data.rne2 }</td>
						        	</tr>
						        </tbody>
						    </table>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

RecQosTable = React.createFactory(RecQosTable);
