function CodecsSettingsComponent(props) {

	var match = null;
	var frases = props.frases;
	var availableCodecs = ['Opus','G.711 Alaw','G.711 Ulaw','G.729','G.723'];
	var codecs = props.codecs.map(function(item) {
		item.enabled = true;
		availableCodecs.splice(availableCodecs.indexOf(item.codec), 1);

		return item;
	});

	availableCodecs.forEach(function(item) { codecs = codecs.concat([{ codec: item, frame: 20, enabled: false }]) });

	function onChange(e, index) {
		var target = e.target;
		var list = [].concat(codecs);
		var item = list[index];
		if(target.name === 'frame') item.frame = target.type === 'number' ? parseInt(target.value, 10) : target.value;
		else if(target.name === 'enabled') item.enabled = !item.enabled;
		list[index] = item;
		props.onChange(list.filter(function(item) { return item.enabled }));
	}

	function onSort(e) {
		var target = e.currentTarget;
		var order = [].slice.call(target.children).map(function(el, index) {
			return el.getAttribute("data-id");
		});
		var newList = new Array(codecs.length);

		codecs.forEach(function(item) {
			newList[order.indexOf(item.codec)] = item;
		})

		props.onChange(newList.filter(function(item) { return item.enabled }));
	}

	function tableRef(el) {
		if(el) new Sortable(el);
	}

	return (
		<table className="table">
		    <thead>
		        <tr>
		            <th></th>
		            <th>{frases.AUDIOCODECS}</th>
		            <th>{frases.FRAMES}(ms)</th>
		            <th><i className="fa fa-check"></i></th>
		        </tr>
		    </thead>
		    <tbody ref={tableRef} onTouchEnd={onSort} onDragEnd={onSort}>
		        {
		        	codecs.map(function(item, index) {
		        		return (
		        			<tr key={item.codec} data-id={item.codec}>
		        				<td className="draggable" style={{ textAlign: "center" }}>
		        					<i className="fa fa-ellipsis-v"></i>
		        				</td>
		        				<td>{item.codec}</td>
		        				<td><input type="number" className="form-control" name="frame" value={item.frame} onChange={function(e) { onChange(e, index) }} /></td>
		        				<td><input type="checkbox" checked={ item.enabled } name="enabled" onChange={function(e) { onChange(e, index) }} /></td>
		        			</tr>
		        		)
		        	})
		        }
		    </tbody>
		</table>
	)
}