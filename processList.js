console.log('script loaded');

function processMedications(lines, start) {
  var exastIgnore = ['or', 'electrolyte-a (plasmalyte) infusion', 'electrolyte-a (plasmalyte) bolus',
    'sodium chloride 0.9 % infusion', 'sodium chloride 0.9 % 1,000 ml infusion', 'followed by', 'and', 'tpn adult'
  ]
  var categories = {
    ignore: ['naloxone', 'magnesium sulfate 1g', 'potassium phosphate 15 mmol', 'dextrose 50 % injection', 'sodium phosphate 15 mmol',
      'glucagon injection 1 mg', 'dextrose (glutose) oral gel 15 g', 'iohexol', 'folic acid', 'multivitamin',
      'thiamine', 'cyanocobalamin', 'magnesium oxide', 'no current facility-administered',
      'no current outpatient prescriptions', 'flush', 'aluminum acetate', 'calcium gluconate 1g', 'influenza', 'cholecalciferol'
    ],
    anticoagulation: ['heparin (porcine) injection', 'warfarin', 'lovenox', 'aspirin', 'plavix', 'apixaban'],
    antibiotics: ['cefazolin', 'vancomycin', 'flagyl', 'zosyn', 'ceftriaxone', 'unasyn', 'bactrim', 'voriconazole'],
    steroids: ['dexamethasone', 'prednisone'],
    diabetes: ['insulin'],
    gtt: [/(levophed).*?infusion/i, /(bivalirudin).*?infusion/i, /(dilaudid).*?infusion/i, /(clevidipine).*?infusion/i],
    heart: ['metoprolol', 'lisinopril', 'hydralazine', 'digoxin', 'labetalol', 'imdur', 'amlodipine', 'atenolol',
      'nifedipine', 'losartan', 'statin'
    ],
    pulm: ['albuterol', 'tiotropium', 'fluticasone furoate', 'sodium chloride 0.9 % nebulizer', 'ipratropium', 'ellipta'],
    other: ['miralax', 'sennosides', 'percocet', 'acetaminophen', 'oxycodone', 'prazole', '(ocean)', 'ferrous', 'artificial tears']
  }

  var bold = ['anticoagulation', 'antibiotics', 'steroids', 'diabetes', 'gtt']

  var renames = {
    'acetaminophen': 'tyl',
    'ondansetron': 'zof',
    'gabapentin': 'gaba',
    'prazole': 'ppi',
    'quetiapine': 'seroquel',
    'sennosides': 'senn',
    'ipratropium': 'atrovent',
    'miralax': 'mira',
    'sodium chloride 0.9 % nebulizer': 'ns neb',
    'oxycodone': 'oxy',
    'artificial tears': 'at',
    'prazole': 'ppi',
    'lovenox': 'lov',
    'chlorhexidine': 'peridex',
    'dexamethasone': 'dexa',
    'insulin': 'iss',
    'atorvastatin': 'statin',
    'percocet': 'oxy',
    'hydromorphone': 'dil',
    'ramelteon': 'ramel',
    'metoprolol': 'meto',
    'lisinopril': 'ace',
    'hydralazine': 'hydral',
    'digoxin': 'dig',
    'tamsulosin': 'flo',
    'lidocaine': 'lido',
    'heparin (porcine) injection': 'sqh',
    'aspirin': 'asa',
    'amlodipine': 'amlo',
    'hydrochlorothiazide': 'hctz',
    '(ocean)': 'nss',
    'metoclopramide': 'reglan',
    'prochlorperazine': 'compazine',
    'vancomycin': 'vanco',
    'prednisone': 'pred',
    'bisacodyl': 'dulco',
    'ferrous gluconate': 'iron',
    'benzocaine-menthol': 'cepacol',
    'fluticasone furoate': 'ellipta'
  };

  var data = {
    drugs: {}
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
        for (var k = 0; k < categories[currentKey].length; k++) {
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
        output.append($('<strong>' + head + data.drugs[catKeys[i]].join('/').trim() + tail + '</strong>'));
      } else {
        output.append($('<span>' + head + data.drugs[catKeys[i]].join('/').trim() + tail + '</span>'));
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
    if (lines[i].endsWith('--')) {
      continue;
    }
    if (lines[i].startsWith('BP:')) {
      var temp = lines[i].match(/\((.*?)\)\/\((.*?)\)/)
      data.bp = temp[1] + '/' + temp[2];
    } else if (lines[i].startsWith('Temp:')) {
      var temp = lines[i].match(/\[([^\s]*).*?-([^\s]*)/)
      if (temp) {
        data.temp = temp[1] + '-' + temp[2];
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
        data.o2 = temp[1].trim() + '-' + temp[2].trim();
      } else {
        temp = lines[i].match(/\[([^\s]*)/);
        if (temp) {
          data.o2 = temp[1]
        }
      }
    }
  }

  $('#output').append($('<div>' + data.temp + '&nbsp;&nbsp;' +
    data.resp + '&nbsp;&nbsp;' +
    data.pulse + '&nbsp;&nbsp;' +
    data.bp + '&nbsp;&nbsp;' +
    data.o2 + '&nbsp;&nbsp;' + '</div>'));
  return end;
}

function processLabs(lines, start) {
  var data = {
    bmp: {},
    cbc: {},
    coag: {}
  };
  var end = start;
  var date = false;
  var currentDate = null;
  var dates = [];
  for (var i = start; i < lines.length; i++) {
    if (lines[i] === '[/Labs]') {
      end = i;
      break;
    }
    var splitted = lines[i].split(/\s\s+/);
    if (splitted[0] === 'Labs (Last 24 hrs)') {
      date = true;
      dates = ['', splitted[1]];
    } else if (date === true && splitted[0][0] === ' ') {
      dates[dates.length - 1] += splitted[0];
      if (splitted.length > 1) {
        dates.push(splitted[1]);
      }
    } else {
      date = false;
    }
    if (splitted.length <= 1) {
      continue;
    }
    var lastIndex = splitted.length - 1;
    switch (splitted[0]) {
      case 'GLUCOSE':
        data.bmp.date = dates[lastIndex];
        data.bmp.glucose = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'NA':
        data.bmp.date = dates[lastIndex];
        data.bmp.na = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'K':
        data.bmp.date = dates[lastIndex];
        data.bmp.k = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'BUN':
        data.bmp.date = dates[lastIndex];
        data.bmp.bun = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'CREAT':
        data.bmp.date = dates[lastIndex];
        data.bmp.creat = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'WBC':
        data.cbc.date = dates[lastIndex];
        data.cbc.wbc = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'HGB':
        data.cbc.date = dates[lastIndex];
        data.cbc.hgb = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'HEMATOCRIT':
        data.cbc.date = dates[lastIndex];
        data.cbc.hct = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'PLTS':
        data.cbc.date = dates[lastIndex];
        data.cbc.plt = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'INR':
        data.coag.date = dates[lastIndex];
        data.coag.inr = splitted[lastIndex].replace(/\*$/, '');
        break;
      case 'PTT':
        data.coag.date = dates[lastIndex];
        data.coag.ptt = splitted[lastIndex].replace(/\*$/, '');
        break;
    }
  }

  var print = function (input) {
    return input ? input : '-';
  }

  var outputs = [``, ``];
  if (Object.keys(data.bmp).length > 0) {
    outputs[1] += `${print(data.bmp.date)}:  ${print(data.bmp.na)}/${print(data.bmp.k)}/${print(data.bmp.bun)}/${print(data.bmp.creat)}<${print(data.bmp.glucose)}`;
  }
  if (Object.keys(data.cbc).length > 0) {
    outputs[0] += `${print(data.cbc.date)}:  ${print(data.cbc.wbc)}/${print(data.cbc.hgb)}/${print(data.cbc.hct)}/${print(data.cbc.plt)}&nbsp;&nbsp;`;
  }
  if (Object.keys(data.coag).length > 0) {
    outputs[0] += `${print(data.coag.date)}:  ${print(data.coag.inr)}/${print(data.coag.ptt)}`;
  }

  $('#output').append($('<div>' + outputs.join('<br/>') + '</div>'));
  return end;
}

function processGlucose(lines, start) {
  var end = start;
  var glucose = [];
  for (var i = start; i < lines.length; i++) {
    if (lines[i] === '[/Glucose]') {
      end = i;
      break;
    }
    var splitted = lines[i].split(/\s+/)
    if (parseInt(splitted[3])) {
      glucose.push(splitted[3]);
    }
  }
  $('#output').append($('<div><strong>FSG: ' + glucose.join('-') + '</strong></div>'));
  return end;
}

function processDiet(lines, start) {
  var data = {};
  var formula = false;
  for (var i = start; i < lines.length; i++) {
    if (lines[i] === '[/Diet]') {
      end = i;
      break;
    }
    var splitted = lines[i].split(':');
    // console.log(splitted);
    if (formula) {
      if (lines[i].startsWith('HRS/DAY')) {
        feedcomment += lines[i] + ' ';
        continue;
      } else if (lines[i].startsWith('ML/HR')) {
        feedcomment += lines[i] + ' ';
        continue;
      } else {
        formula = false;
      }
    }

    if (splitted.length > 1) {
      if (splitted[0] === 'Water Flushes') {
        var temp = splitted[1].split(/\s+/)
        if (temp.length > 4) {
          data.flush = temp[1] + temp[3];
        }
      }
      if (splitted[0] === 'Formula Type') {
        data.feedtype = splitted[1].trim();
        feedcomment = '';
        formula = true;
      }
      if (splitted[0] === 'Select Supplement(s), if any') {
        data.supplement = splitted[1].trim();
      }
    } else {
      var match = lines[i].match(/^DIET([A-Z\s]+)[^a-z]/);
      if (match) {
        data.diet = match[1].trim();
        continue;
      }
      match = lines[i].match(/Supplement Frequency\s(.*?)Daily/);
      if (match) {
        data.freq = match[1].trim();
      }
    }
  }

  var keys = Object.keys(data);
  var returned = [];
  for (var i = 0; i < keys.length; i++) {
    returned.push(data[keys[i]])
  }
  $('#output').append($('<div>' + returned.join(' ') + '</div>'));
  if (feedcomment) {
    $('#output').append($('<div>' + feedcomment + '</div>'));
  }
}

function processIO(lines, start) {
  var dates = null;
  var shifts = null;
  var totals = [];
  var renamps = {
    'Urine': 'UOP',
    'Urine Occurrence': 'Ux',
    'Emesis Occurrence': 'Ex',
    'Stool Occurrence': 'Sx',
    'P.O.': 'PO'
  }
  for (var i = start; i < lines.length; i++) {
    if (lines[i] === '[/IO]') {
      end = i;
      break;
    }
    var splitted = lines[i].split('\t');
    if (splitted[0] === 'Date') {
      dates = splitted.slice(1, splitted.length);
    }
    if (splitted[0] === 'Shift') {
      shifts = splitted.slice(1, splitted.length);
    }
    if (splitted.length > 2 && splitted[1].startsWith('  ')) {
      var name = splitted[1].trim();
      name = renamps[name] ? renamps[name] : name;
      var temp = [name];
      console.log(dates.length)
      for (var j = 0; j < dates.length; j++) {
        temp.push(splitted[j * 3 + 4]);
      }
      totals.push(temp.join('  '));
    }
  }
  $('#output').append($('<div>' + totals.join(' | ') + '</div>'));
}

$('#compute').click(function (e) {

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
    if (lines[i] === '[Glucose]') {
      i = processGlucose(lines, i);
    }
    if (lines[i] === '[Diet]') {
      i = processDiet(lines, i);
    }
    if (lines[i] === '[IO]') {
      i = processIO(lines, i);
    }
  }
})


