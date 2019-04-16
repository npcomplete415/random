console.log('script loaded');
$('#compute').click(function(e) { 
  
  $('#output').empty();
  var lines = $('#source').val().split('\n');

  var exastIgnore = ['or', 'electrolyte-a (plasmalyte) infusion', 'sodium chloride 0.9 % infusion', 'sodium chloride 0.9 % 1,000 ml infusion', 'followed by']
  var categories = {
    ignore : ['naloxone', 'magnesium sulfate 1g', 'potassium phosphate 15 mmol', 'dextrose 50 % injection', 'glucagon injection 1 mg',  'dextrose (glutose) oral gel 15 g', 'iohexol', 'folic acid', 'multivitamin', 'thiamine', 'cyanocobalamin', 'magnesium oxide'],
    anticoagulation : ['heparin (porcine) injection', 'warfarin', 'lovenox', 'aspirin', 'plavix', 'apixaban'],
    antibiotics : ['cefazolin', 'vancomycin', 'flagyl', 'zosyn', 'ceftriaxone', 'unasyn'],
    steroids : ['dexamethasone', 'prednisone'],
    diabetes : ['insulin'],
    gtt: ['clevidipine (cleviprex) 25 mg/50 ml infusion'],
    heart : ['metoprolol', 'lisinopril', 'hydralazine', 'digoxin', 'labetalol'],
    pulm : ['albuterol', 'tiotropium', 'fluticasone furoate'],
    other : ['miralax', 'sennosides', 'percocet', 'acetaminophen', 'oxycodone', 'prazole', '(ocean)', 'ferrous gluconate']
  }

  var bold = ['anticoagulation', 'antibiotics', 'steroids', 'diabetes', 'gtt']

  var renames = {
    'acetaminophen' : 'tyl',
    'ondansetron' : 'zof',
    'gabapentin' : 'gaba',
    'prazole' : 'ppi',
    'sennosides' : 'senn',
    'miralax' : 'mira',
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

  for (var i = 0; i < lines.length; i++) {
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
          if (line.indexOf(categories[currentKey][k]) > -1) {
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
  for (var i = 0; i < catKeys.length; i++) {
    var head = ', ';
    if (data.drugs[catKeys[i]]) {
      if (first) {
        head = '';
        first = false;
      }
      if (bold.indexOf(catKeys[i]) > -1) {
        $('#output').append($('<strong>' + head + data.drugs[catKeys[i]].join(', ').trim()+'</strong>'));
      } else {
        $('#output').append($('<span>' + head + data.drugs[catKeys[i]].join(', ').trim()+'</span>'));
      }
    }
  }

})
