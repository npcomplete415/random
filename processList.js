console.log('script loaded');
$('#compute').click(function(e) { 
  var lines = $('#source').val().split('\n');

  var categories = {
    ignore : ['naloxone', 'sodium chloride 0.9 % infusion'],
    anticoagulation : ['heparin', 'warfarin', 'lovenox', 'aspirin', 'plavix'],
    antibiotics : ['cefazolin', 'vancomycin', 'flagyl', 'zosyn', 'ceftriaxone'],
    steroids : ['dexamethasone', 'prednisone'],
    diabetes : ['insulin'],
    gtt: ['infusion'],
    heart : ['metoprolol', 'lisinopril'],
    pulm : ['albuterol'],
    other : ['miralax', 'sennosides', 'percocet', 'acetaminophen', 'oxycodone', 'prazole']
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
    'chlorhexidine' : 'peri',
    'dexamethasone' : 'dexa'
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
      data.drugs[catkey].push(drug);
    }
  }

  for (var i = 0; i < catKeys.length; i++) {
    var head = ',';
    if (i === 0) {
      head = '';
    }
    if (data.drugs[catKeys[i]]) {
      if (bold.indexOf(catKeys[i]) > -1) {
        $('#output').append($('<strong>' + head + data.drugs[catKeys[i]].join(', ')+' </strong>'));
      } else {
        $('#output').append($('<span>' + head + data.drugs[catKeys[i]].join(', ')+' </span>'));
      }
    }
  }

})
