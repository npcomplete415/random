console.log('script loaded');

function processMedications(lines, start) {
  var exastIgnore = ['or', 'electrolyte-a (plasmalyte) infusion', 'electrolyte-a (plasmalyte) bolus',
		     'sodium chloride 0.9 % infusion', 'sodium chloride 0.9 % 1,000 ml infusion', 'followed by', 'and', 'tpn adult']
  var categories = {
    ignore : ['naloxone', 'magnesium sulfate 1g', 'potassium phosphate 15 mmol', 'dextrose 50 % injection', 'sodium phosphate 15 mmol',
	      'glucagon injection 1 mg',  'dextrose (glutose) oral gel 15 g', 'iohexol', 'folic acid', 'multivitamin', 
	      'thiamine', 'cyanocobalamin', 'magnesium oxide', 'no current facility-administered',
	     'no current outpatient prescriptions', 'flush', 'aluminum acetate', 'calcium gluconate 1g'],
    anticoagulation : ['heparin (porcine) injection', 'warfarin', 'lovenox', 'aspirin', 'plavix', 'apixaban'],
    antibiotics : ['cefazolin', 'vancomycin', 'flagyl', 'zosyn', 'ceftriaxone', 'unasyn'],
    steroids : ['dexamethasone', 'prednisone'],
    diabetes : ['insulin'],
    gtt: [/(levophed).*?infusion/i, /(bivalirudin).*?infusion/i, /(dilaudid).*?infusion/i, /(clevidipine).*?infusion/i],
    heart : ['metoprolol', 'lisinopril', 'hydralazine', 'digoxin', 'labetalol'],
    pulm : ['albuterol', 'tiotropium', 'fluticasone furoate', 'sodium chloride 0.9 % nebulizer', 'ipratropium'],
    other : ['miralax', 'sennosides', 'percocet', 'acetaminophen', 'oxycodone', 'prazole', '(ocean)', 'ferrous gluconate']
  }

  var bold = ['anticoagulation', 'antibiotics', 'steroids', 'diabetes', 'gtt']

  var renames = {
    'acetaminophen' : 'tyl',
    'ondansetron' : 'zof',
    'gabapentin' : 'gaba',
    'prazole' : 'ppi',
	  'quetiapine' : 'seroquel',
    'sennosides' : 'senn',
	  'ipratropium' : 'atrovent',
    'miralax' : 'mira',
	  'sodium chloride 0.9 % nebulizer' : 'ns neb',
    'oxycodone' : 'oxy',
    'prazole' : 'ppi',
    'lovenox' : 'lov',
    'chlorhexidine' : 'peridex',
    'dexamethasone' : 'dexa',
    'insulin':'iss',
    'atorvastatin':'statin',
    'percocet' : 'oxy',
    'hydromorphone' : 'dil',
    'ramelteon' : 'ramel',
    'metoprolol' : 'meto',
    'lisinopril' : 'ace',
    'hydralazine' : 'hydral',
    'digoxin' : 'dig',
    'tamsulosin' : 'flo',
    'lidocaine' : 'lido',
    'heparin (porcine) injection' : 'sqh',
    'aspirin' : 'asa',
    'amlodipine' : 'amlo',
    'hydrochlorothiazide' : 'hctz',
    '(ocean)' : 'nss',
    'metoclopramide' : 'reglan',
    'prochlorperazine' : 'compazine',
    'vancomycin' : 'vanco',
    'prednisone' : 'pred',
    'bisacodyl' : 'dulco',
    'ferrous gluconate' : 'iron',
    'benzocaine-menthol' : 'cepacol',
    'fluticasone furoate' : 'ellipta'
  };

  var data = {
    drugs : {}
  }

  var catKeys = Object.keys(categories);

  var attemptRename = function (name) {
    if (renames[name]) {
      return renames[name];
    } else if (renames[name.split(' ')[0]]) {
      return renames[name.split(' ')[0]];
    } else {
      return name.split(' ')[0];
    }
  };
  var end = start;
  for (var i = start; i < lines.length; i++) {
    if (lines[i] === '[/Medications]') {
      end = i;
      break;
    }
    var line = lines[i].toLowerCase();
    if (line.indexOf(']') > -1) {
      line = line.substring(line.indexOf(']') + 1).trim()
    }
    if (exastIgnore.indexOf(line) > -1) {
      continue;
    }
    if (line) {
      var drug = null;
      var catkey = null;
      var found = false;
      for (var j = 0; j < catKeys.length; j++) {
        var currentKey = catKeys[j];
        for(var k = 0; k < categories[currentKey].length; k++) {
	  if (categories[currentKey][k].compile) {
            var match = line.match(categories[currentKey][k]);
            if (match) {
		    drug = match[1];
		    catkey = currentKey;
		    found = true;
		    break;
	    }
	  } else if (line.indexOf(categories[currentKey][k]) > -1) {
            drug = categories[currentKey][k];
            catkey = currentKey;
            found = true;
            break;
          }
        }
        if (found) {
          break;
        }
      }
      if (catkey === 'ignore') {
        continue;
      } else if (!catkey) {
        catkey = 'other';
        drug = attemptRename(line);
        console.log('not recognized', drug, line);
      } else {
        drug = attemptRename(drug);
      }
      if (!data.drugs[catkey]) {
        data.drugs[catkey] = [];
      }
      if (data.drugs[catkey].indexOf(drug) === -1) {
        data.drugs[catkey].push(drug);
      }
    }
  }

  var first = true;
  var output = $('<div></div>');
  for (var i = 0; i < catKeys.length; i++) {
    var head = ', ';
    if (data.drugs[catKeys[i]]) {
      if (first) {
        head = '';
        first = false;
      }
      var tail = '';
	    if (catKeys[i] === 'gtt') {
		    tail = ' gtt';
	    }
      if (bold.indexOf(catKeys[i]) > -1) {
        output.append($('<strong>' + head + data.drugs[catKeys[i]].join('/').trim()+tail+'</strong>'));
      } else {
        output.append($('<span>' + head + data.drugs[catKeys[i]].join('/').trim()+tail+'</span>'));
      }
    }
  }
  $('#output').append(output);
  return end;
}

function processVitals(lines, start) {
  var data = {};
  var end = start;
  for (var i = start; i < lines.length; i++) {
    if (lines[i] === '[/Vitals]') {
      end = i;
      break;
    }
		if (lines[i].startsWith('BP:')) {
			var temp = lines[i].match(/\((.*?)\)\/\((.*?)\)/)
			data.bp = temp[1]+'/'+temp[2];
		} else if (lines[i].startsWith('Temp:')) {
			var temp = lines[i].match(/\[([^\s]*).*?-([^\s]*)/)
			if (temp) {
				data.temp = temp[1]+'-'+temp[2];
			} else {
				temp = lines[i].match(/\[([^\s]*)/);
				if (temp) {
					data.temp = temp[1]
				}
			}
			
		} else if (lines[i].startsWith('Pulse:')) {
			var temp = lines[i].match(/\[(.*?)\]/)
			data.pulse = temp[1];
		} else if (lines[i].startsWith('Resp:')) {
			var temp = lines[i].match(/\[(.*?)\]/)
			data.resp = temp[1];
		} else if (lines[i].startsWith('SpO2:')) {
			var temp = lines[i].match(/\[(.*?)%-.*?(.*?)%\]/)
			if (temp) {
				data.o2 = temp[1].trim()+'-'+temp[2].trim();
			} else {
				temp = lines[i].match(/\[([^\s]*)/);
				if (temp) {
					data.o2 = temp[1]
				}
			}
		}
	}

	$('#output').append($('<div>'+data.temp+'&nbsp;&nbsp;'+
	data.resp+'&nbsp;&nbsp;'+
	data.pulse+'&nbsp;&nbsp;'+
	data.bp+'&nbsp;&nbsp;'+
	data.o2+'&nbsp;&nbsp;'+'</div>'));
  return end;
}

function processLabs(lines, start) {
	var data = {
		bmp : {},
		cbc : {},
		coag : {}
	};
  var end = start;
	for (var i = start; i < lines.length;i++) {
    if (lines[i] === '[/Labs]') {
      end = i;
      break;
    }
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
  
  var print = function(input) {
    return input ? input : '-';
  }

	var date = `${(new Date()).getMonth()+1}/${(new Date()).getDate()}`
	var outputs = [`${date}: `, `${date}: `];
	if (Object.keys(data.bmp).length > 0) {
		outputs[1] += `${print(data.bmp.na)}|${print(data.bmp.k)}|${print(data.bmp.bun)}|${print(data.bmp.creat)}<${print(data.bmp.glucose)}`;
	}
	if (Object.keys(data.cbc).length > 0) {
		outputs[0] += `${print(data.cbc.wbc)}|${print(data.cbc.hgb)}|${print(data.cbc.hct)}|${print(data.cbc.plt)}&nbsp;&nbsp;`;
	}
	if (Object.keys(data.coag).length > 0) {
		outputs[0] += `${print(data.coag.inr)}|${print(data.coag.ptt)}`;
	}

	$('#output').append($('<div>'+outputs.join('<br/>')+'</div>'));
  return end;
}


$('#compute').click(function(e) { 
  
  $('#output').empty();
  var lines = $('#source').val().split('\n');
  var state = 0;
  // 1 - vitals
  // 2 - medications
  // 3 - labs
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] === '[Vitals]') {
      i = processVitals(lines, i);
    }
    if (lines[i] === '[Medications]') {
      i = processMedications(lines, i);
    }
    if (lines[i] === '[Labs]') {
      i = processLabs(lines, i);
    }
  }
})
