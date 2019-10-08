function TrunkSettingsComponent(props) {

	var frases = props.frases;
	var params = props.params;

	function onChange(e) {
		var params = {};
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : valuel;
		props.onChange(params);
	}

	function onTransformChange(type, transforms) {
		var params = {};
		params[type] = transforms;
		props.onChange(params);
	}

	return (
		<div>
			<ul className="nav nav-tabs" role="tablist">
				<li role="presentation" className="active"><a href="#tab-trunk-general" aria-controls="general" role="tab" data-toggle="tab">{frases.SETTINGS.GENERAL_SETTS}</a></li>
				<li role="presentation"><a href="#tab-trunk-incoming" aria-controls="tab-trunk-incoming" role="tab" data-toggle="tab">{frases.SETTINGS.INCALLS}</a></li>
				<li role="presentation"><a href="#tab-trunk-outgoing" aria-controls="tab-trunk-outgoing" role="tab" data-toggle="tab">{frases.SETTINGS.OUTCALLS}</a></li>
			</ul>

			<div className="tab-content" style={{ padding: "20px 0" }}>
				<div role="tabpanel" className="tab-pane fade in active" id="tab-trunk-general">
					<TrunkConnectionComponent frases={frases} params={onChange} />
				</div>
				<div role="tabpanel" className="tab-pane fade in active" id="tab-trunk-incoming">
					<form className="form-horizontal" autoComplete="off" style={{ padding: "20px 0" }}>
						<div className="form-group">
						    <label className="col-sm-4 control-label">{frases.SETTINGS.MAXCONN}</label>
						    <div className="col-sm-4">
						        <input type="text" className="form-control" name="maxinbounds" value={params.maxinbounds} onChange={onChange} placeholder={frases.SETTINGS.MAXCONN} />
						    </div>
						</div>
					</form>
					<NumberTransformsComponent frases={frases} type="inbounda" transforms={params.inboundanumbertransforms} onChange={function(params) { onTransformChange('inboundanumbertransforms', params) }} />
					<hr/>
					<NumberTransformsComponent frases={frases} type="inboundb" transforms={params.inboundbnumbertransforms} onChange={function(params) { onTransformChange('inboundbnumbertransforms', params) }} />
				</div>

				<div role="tabpanel" className="tab-pane fade" id="tab-trunk-outgoing">
					<form className="form-horizontal" autoComplete="off" style={{ padding: "20px 0" }}>
					    <div className="form-group">    
					        <label className="col-sm-4 control-label">{frases.SETTINGS.MAXCONN}</label>
					        <div className="col-sm-4">
					            <input type="text" className="form-control" name="maxoutbounds" value={params.maxoutbounds} onChange={onChange} placeholder={frases.SETTINGS.MAXCONN} />
					        </div>
					    </div>
					</form>
					<NumberTransformsComponent frases={frases} type="outbounda" transforms={params.outboundanumbertransforms} onChange={function(params) { onTransformChange('outboundanumbertransforms', params) }} />
					<hr/>
					<NumberTransformsComponent frases={frases} type="outboundb" transforms={params.outboundbnumbertransforms} onChange={function(params) { onTransformChange('outboundbnumbertransforms', params) }} />

				</div>
			</div>
    	</div>
	)
}