var map = L.map('map').setView([-3.0308, 24.060096], 5);
	var minn = onGetingMinValToProperty();
	var grades = onGetGrades(onGetingMinValToProperty(),onGetingMaxValToProperty(), 8);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/light-v9',
		tileSize: 512,
		zoomOffset: -1
	}).addTo(map);


	// control that shows state info on hover
	var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<h4>DRC GeoJson Data | <strong> Données 2015 </strong></h4>' +  (props 
			? '<br> Province : <b>' + props.NOM + '</b><br/><br>Chef-lieu : <b>'+ props.PRINCIPALTOWN +'</b><br><br>Habitants : <b>'+ props.POPULATION + '</b> <br /><br> Surface : <b>' + props.AREA +' / km<sup>2</sup> '
			: ' Parcourer une province pour les informations ');
	};

	info.addTo(map);
	function onGetingMaxValToProperty(){
		var arr = [];
		statesData.features.forEach(item => {
			let prt = item.properties;
			(prt.hasOwnProperty('POPULATION') ? arr.push(prt.POPULATION) : 1945);
		});

		var max = arr.reduce(function(a,b) {
			return Math.max(a, b);
		})
		return max;
	}
	function onGetingMinValToProperty(){
		var arr = [];
		statesData.features.forEach(item => {
			let prt = item.properties;
			(prt.hasOwnProperty('POPULATION') ? arr.push(prt.POPULATION) : 1945);
		});

		var min = arr.reduce(function(a,b) {
			return Math.min(a, b);
		})
		return min;
	}
	function getColor(d) {
		d = d && !isNaN(d) ? d : 0;
		// console.log(d)
		grades.sort(function(a, b){return b-a});
		const tabColor = ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FEB24C' , '#FED976', '#FFEDA0'];
		// console.log(d)
		for(let i = 0; i < grades.length; i++){
			if(d >= grades[i]) {
				if(tabColor[i]) {
				  return tabColor[i];
				} else { 
				//   console.log(minn);
				//   console.log(d);
				  return tabColor[tabColor.length - 1];
				}
			}
		}
	}
	function onGetGrades(min,val, lth){
		
		let L = (lth && !isNaN(lth)) ? lth : 5; 
		// L = L - 1;
		let tabGrads = []; 
		let M = val / L ?? 0.0001; 
		tabGrads.push(min);
		// console.log(L)
		for(let k = 0; k < L; k++){

		let earlierval = (tabGrads.length > 0 ) ? tabGrads[tabGrads.length - 1] : 0;
		let nextval = (earlierval + M);
		if(nextval < val) tabGrads.push(Math.ceil(nextval));
		else{ tabGrads.push(Math.ceil(val)); break; }

		}

		return tabGrads;
	}
	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '1',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.POPULATION)
		};
	}
	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	var geojson;

	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}
	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}

	geojson = L.geoJson(statesData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);

	map.attributionControl.addAttribution('by @davmaene');

	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {
		
		var div = L.DomUtil.create('div', 'info legend'),
			labels = [],
			from, to;
		labels.push('<b> Population : RDC par province</b>');
		labels.push('<b> Données publiées en 2015</b><br>');
		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
					'<i style="background:' + getColor(from + 1) + '"></i> ' +
					from + (to ? '&nbsp; &ndash; &nbsp;' + to : '+')
				);
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map);