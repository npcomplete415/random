
function processVitals(lines) {
	var data = {};
	for (var i = 0; i < lines.length; i++) {
		console.log(lines[i]);
		if (lines[i].startsWith('BP:')) {
			var temp = lines[i].match(/\((.*?)\)\/\((.*?)\)/)
			data.bp = temp[1]+'/'+temp[2];
		} else if (lines[i].startsWith('Temp:')) {
			var temp = lines[i].match(/\[([^\s]*).*?-([^\s]*)/)
			data.temp = temp[1]+'-'+temp[2];
		} else if (lines[i].startsWith('Pulse:')) {
			var temp = lines[i].match(/\[(.*?)\]/)
			data.pulse = temp[1];
		} else if (lines[i].startsWith('Resp:')) {
			var temp = lines[i].match(/\[(.*?)\]/)
			data.resp = temp[1];
		} else if (lines[i].startsWith('SpO2:')) {
			var temp = lines[i].match(/\[(.*?)%-.*?(.*?)%\]/)
			data.o2 = temp[1].trim()+'-'+temp[2].trim();
		}
	}

	$('#output').append($('<div>'+data.temp+'&nbsp;&nbsp;'+
	data.resp+'&nbsp;&nbsp;'+
	data.pulse+'&nbsp;&nbsp;'+
	data.bp+'&nbsp;&nbsp;'+
	data.o2+'&nbsp;&nbsp;'+'</div>'));
}

function processLabs(lines) {
	var data = {
		bmp : {},
		cbc : {},
		coag : {}
	};

	for (var i = 0; i < lines.length;i++) {
		var splitted = lines[i].split(/\s+/);
		if (splitted.length <= 1) {
			continue;
		}

		switch (splitted[0]) {
			case 'GLUCOSE':
				console.log(splitted[1]);
				data.bmp.glucose = splitted[1].replace(/\*$/, '');
				break;
			case 'NA':
				data.bmp.na = splitted[1].replace(/\*$/, '');
				break;
			case 'K':
				data.bmp.k = splitted[1].replace(/\*$/, '');
				break;
			case 'BUN':
				data.bmp.bun = splitted[1].replace(/\*$/, '');
				break;
			case 'CREAT':
				data.bmp.creat = splitted[1].replace(/\*$/, '');
				break;
			case 'WBC':
				data.cbc.wbc = splitted[1].replace(/\*$/, '');
				break;
			case 'HGB':
				data.cbc.hgb = splitted[1].replace(/\*$/, '');
				break;
			case 'HEMATOCRIT':
				data.cbc.hct = splitted[1].replace(/\*$/, '');
				break;
			case 'PLTS':
				data.cbc.plt = splitted[1].replace(/\*$/, '');
				break;
			case 'INR':
				data.coag.inr = splitted[1].replace(/\*$/, '');
				break;
			case 'PTT':
				data.coag.ptt = splitted[1].replace(/\*$/, '');
				break;

		}
	}

	var date = `${(new Date()).getMonth()+1}/${(new Date()).getDate()}`
	var outputs = [`${date}: `, `${date}: `];
	if (Object.keys(data.bmp).length > 0) {
		outputs[1] += `${data.bmp.na}|${data.bmp.k}|${data.bmp.bun}|${data.bmp.creat}<${data.bmp.glucose}`;
	}
	if (Object.keys(data.cbc).length > 0) {
		outputs[0] += `${data.cbc.wbc}|${data.cbc.hgb}|${data.cbc.hct}|${data.cbc.plt}&nbsp;&nbsp;`;
	}
	if (Object.keys(data.coag).length > 0) {
		outputs[0] += `${data.coag.inr}|${data.coag.ptt}`;
	}

	$('#output').append($('<div>'+outputs.join('<br/>')+'</div>'));
}
