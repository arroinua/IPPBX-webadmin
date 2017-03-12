
var TrunksQosTable = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		utils: React.PropTypes.object
	},

	_setDefaultValue: function(item) {
		item.in = Object.keys(item.in).forEach(function(key, index) {
			item.in[key] = item.in[key] || 0;
		});
		item.out = Object.keys(item.out).forEach(function(key, index) {
			item.out[key] = item.out[key] || 0;
		});

		return item;
	},

	_formatTimeString: function(value, format) {
		return this.props.utils.formatTimeString(value, format);
	},

	render: function() {
		var frases = this.props.frases.STATISTICS;
		var data = this.props.data;

		return (
			<div className="table-responsive">
			    <table className="table table-hover" id="trunks-qos-statistics">
			        <thead>
			            <tr>
			                <th rowSpan="2" style={{ verticalAlign: 'middle' }}>{this.props.frases.TRUNK.TRUNK}</th>
			                <th><abbr title={ frases.TRNUK_QOS.TC } className="initialism">TC</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.CC } className="initialism">CC</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.ACD } className="initialism">ACD</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.JFE } className="initialism">JFE</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.JNE } className="initialism">JNE</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.LAT } className="initialism">LAT</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.LFE } className="initialism">LFE,%</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.LNE } className="initialism">LNE,%</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.MFE } className="initialism">MFE</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.MNE } className="initialism">MNE</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.RFE } className="initialism">RFE</abbr></th>
			                <th><abbr title={ frases.TRNUK_QOS.RNE } className="initialism">RNE</abbr></th>
			            </tr>
			            <tr>
			            	<th className="text-center" colSpan="12">{ frases.INCOMING_CALLS}/{ frases.OUTGOING_CALLS }</th>
			            </tr>
			        </thead>
			        <tbody>
			        	{ data.map(function(item, index) {
			        		return (
			        		<tr key={index}>
				        		<td>{ item.trunk }</td>
				        		<td>{ item.in.tc || 0 }/{ item.out.tc || 0 }</td>
				        		<td>{ item.in.cc || 0 }/{ item.out.cc || 0 }</td>
				        		<td>{ this._formatTimeString((item.in.acd || 0), 'hh:mm:ss') }/{ this._formatTimeString((item.out.acd || 0), 'hh:mm:ss') }</td>
				        		<td>{ item.in.lat !== undefined ? item.in.lat : '-' }/{ item.out.lat !== undefined ? item.out.lat : '-' }</td>
				        		<td>{ item.in.jfe !== undefined ? item.in.jfe : '-' }/{ item.out.jfe !== undefined ? item.out.jfe : '-' }</td>
				        		<td>{ item.in.jne !== undefined ? item.in.jne : '-' }/{ item.out.jne !== undefined ? item.out.jne : '-' }</td>
				        		<td>{ item.in.lfe !== undefined ? item.in.lfe : '-' }/{ item.out.lfe !== undefined ? item.out.lfe : '-' }</td>
				        		<td>{ item.in.lne !== undefined ? item.in.lne : '-' }/{ item.out.lne !== undefined ? item.out.lne : '-' }</td>
				        		<td>{ item.in.mfe !== undefined ? item.in.mfe.toFixed(1) : '-' }/{ item.out.mfe !== undefined ? item.out.mfe.toFixed(1) : '-' }</td>
				        		<td>{ item.in.mne !== undefined ? item.in.mne.toFixed(1) : '-' }/{ item.out.mne !== undefined ? item.out.mne.toFixed(1) : '-' }</td>
				        		<td>{ item.in.rfe !== undefined ? item.in.rfe.toFixed(1) : '-' }/{ item.out.rfe !== undefined ? item.out.rfe.toFixed(1) : '-' }</td>
				        		<td>{ item.in.rne !== undefined ? item.in.rne.toFixed(1) : '-' }/{ item.out.rne !== undefined ? item.out.rne.toFixed(1) : '-' }</td>
				        	</tr>
				        	);
			        	}, this) }
			        </tbody>
			    </table>
			</div>
		);
	}
});

TrunksQosTable = React.createFactory(TrunksQosTable);
