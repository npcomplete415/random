function convertNumber(input) {
  var match = input.match(/(\d*.?\d*)\s(.*)/);
  var val = parseFloat(match[1]);
  if (isNaN(val)) {
    console.log(input, match, 'isNaN');
  }
  if (match[2] === 'gm') {
    val = val * 1000;
  } else if (match[2] === 'mg') {

  } else if (match[2] === 'mcg') {
    val = 1.0 * val / 1000;
  } else if (match[2] === 'units') {

  } else if (match[2] === 'cc') {

  } else if (match[2] === 'ml') {
    console.log(input, match, 'ml');
  } else {
    console.log(input, match, 'unknown');
  }
  return val;
}

function pad(num, size) {
  var s = num;
  while (s.length < size) s = "0" + s;
  return s;
}

function ormap(source) {
  var patientdt = source.find('#patient').find('dt');
  var data = {};
  for (var i = 0; i < patientdt.length; i++) {
    if (patientdt[i].innerText === 'Age and sex') {
      var match = $(patientdt[i]).next().text().match(/(\d+)\s+(.*?)\s+old\s+(.*?)(\s|$)/);
      data.age = match[1];
      data.ageType = match[2];
      data.gender = match[3];
    }
    if (patientdt[i].innerText === 'Procedure') {
      data.procedure = $(patientdt[i]).next().text().trim();
    }
    if (patientdt[i].innerText === 'Diagnosis') {
      data.diagnosis = $(patientdt[i]).next().text().trim();
    }
    if (patientdt[i].innerText === 'MRN') {
      data.mrn = $(patientdt[i]).next().text().split(' ')[0];
    }
    if (patientdt[i].innerText === 'ASA status') {
      data.asa = $(patientdt[i]).next().text().trim()
    }
    if (patientdt[i].innerText === 'Team') {
      data.team = [];
      var person = $(patientdt[i]).next('dd').children('.person');
      for (var j = 0; j < person.length; j++) {
        data.team.push($(person[j]).clone().children().remove().end().text());
      }
    }
    if (patientdt[i].innerText ===  'Patient size') {
      var match = $(patientdt[i]).next().text().match(/(^|\s)(\d*\.?\d*)[^\d]*(\d*\.?\d*)[^\d]*?/);
      data.height = match[2];
      data.weight = match[3];
    }
    if (patientdt[i].innerText ===  'Surgeon') {
      data.surgeon = $(patientdt[i]).next().text().trim();
    }
  }

  var drugsdt = source.find('#drugs').find('dt');
  data.drugs = {}
  for (var i = 0; i < drugsdt.length; i++) {
    if (drugsdt[i].innerText === 'Bolus drug totals') {
      var meds = $(drugsdt[i]).next().find('tr');
      data.drugs.bolus = {};
      for (var j = 0; j < meds.length; j++) {
        var tds = $(meds[j]).find('td');
        data.drugs.bolus[$(tds[0]).text().trim()] = $(tds[1]).text().trim();
      }
    }
    if (drugsdt[i].innerText === 'Infusion drug totals') {
      var meds = $(drugsdt[i]).next().find('tr');
      data.drugs.infusions = {};
      for (var j = 0; j < meds.length; j++) {
        var tds = $(meds[j]).find('td');
        data.drugs.infusions[$(tds[0]).text().trim()] = $(tds[1]).text().trim();
      }
    }
  }

  var inoutdt = source.find('#inout').find('dt');
  data.io = {};
  for (var i = 0; i < drugsdt.length; i++) {
    var dt = $(inoutdt[i]);
    if (dt.text().trim() !== '') {
      data.io[dt.text().trim()] = convertNumber(dt.next().text().trim());
    }
  }

  var scripts = source.find('script');
  data.trends = {}
  var mapper = {
    '49' : 'MAP',
    '17': 'SpO2',
    '8' : 'HR',
    '16' : 'ETCO2',
    '7': 'mPAP',
    '4':'CVP',
    '999' : 'Temp'
  }
  for (var i = 0; i < scripts.length; i++) { 
    if (scripts[i].innerText.indexOf('vital') > -1) { 
      const text = scripts[i].innerText;
      var re = /\{x: '(.*?)', y: (\d*.?\d*), group: (\d+)\}/g
      while (match = re.exec(text)) {
        var time = new Date(match[1]);
        var group = mapper[match[3]];
        var value = parseFloat(match[2]);
        var trend = data.trends[group];
        if (!trend) {
          trend = [];
          data.trends[group] = trend;
        }
        if (value) {
          trend.push({
            time : time,
            value: value
          })  
        }
      }
    } 
  }

  var durations = [{
    name : 'intraoperative time',
    start : /Anesthesia Induction/,
    end : /Extubation/
  }, {
    name : 'time to extubation',
    start : /Proc\.\/Surgery Finish/,
    end : /Extubation/
  }, {
    name : 'pringle',
    start : /^(?=.*\bpringle\b)(?!.*\bend\b).*$/i,
    end : /^(?=.*\bpringle\b)(?=.*\bend\b).*$/i
  }]

  var timePoints = {

  };

  var events = source.find('#case_event_list').find('.case_event');
  var currentTime = null;
  data.events = {};
  data.eventsTotal = {};
  for (var i = 0; i < events.length; i++) {
    var event = $(events[i]).find('td');
    if (event[0].innerText) {
      currentTime = new Date(event[0].innerText.replace('at', '').trim());
    }
    for (var j = 0; j < durations.length; j++) {
      var name = durations[j].name;
      if (event[1].innerText.match(durations[j].start)) {
        var dur = data.events[name];
        if (!dur) {
          dur = [];
          data.events[name] = dur;
        }
        if (dur.length === 0 || dur[dur.length - 1].end) {
          if (dur.length === 0 || dur[dur.length - 1].start) {
            dur.push({
              start : currentTime,
              startText : event[1].innerText
            })  
          } else {
            dur[dur.length - 1].start = currentTime;
            if (!data.eventsTotal[name]) {
              data.eventsTotal[name] = 0;
            }
            data.eventsTotal[name] += (dur[dur.length - 1].end.getTime() - dur[dur.length - 1].start.getTime())/1000;
          }
        }
      }
      if (event[1].innerText.match(durations[j].end)) {
        var dur = data.events[name];
        if (!dur) {
          dur = [{
            end : currentTime,
            endText : event[1].innerText
          }];
          data.events[name] = dur;
        } else {
          var dur = data.events[name];
          if (dur[dur.length - 1].start) {
            dur[dur.length - 1].end = currentTime;
            dur[dur.length - 1].endText = event[1].innerText;  
            if (!data.eventsTotal[name]) {
              data.eventsTotal[name] = 0;
            }
            data.eventsTotal[name] += (dur[dur.length - 1].end.getTime() - dur[dur.length - 1].start.getTime())/1000;
          }            
        }
      }
      if (event[1].innerText.match(/Anesthesia Induction/)) {
        timePoints.induction = currentTime;
      }
      if (event[1].innerText.match(/Extubation/)) {
        timePoints.extubation = currentTime;
      }
    }
  }

  function average(input) {
    var total = 0;
    for (var i = 0; i < input.length; i++) {
      total += input[i].value;
    }
    return total/input.length;
  }

  var preInduction = [];
  var preInductionMean = null;
  data.bp = {
    map65time : 0,
    map80ptime : 0,
    numHypoEvent : 0,
    hypoEventDuration : 0
  };
  var continuousCounter = 0;
  var hypoEvent = {
    state : 0,
    start : null,
  };
  for (var i = 0; i < data.trends['MAP'].length; i++) {
    var entry = data.trends['MAP'][i];
    if (entry.time < timePoints.induction) {
      preInduction.push(entry);
    } else if (entry.time < timePoints.extubation) {
      if (preInductionMean === null) {
        preInductionMean = average(preInduction);
      }
      if (entry.value < 65) {
        data.bp.map65time += 15;
      }
      if (entry.value < preInductionMean * .8) {
        data.bp.map80ptime += 15;
      }

      if (entry.value < 65 || entry.value < preInductionMean * .8) {
        continuousCounter = Math.min(5, continuousCounter + 1);
      } else {
        continuousCounter = Math.max(0, continuousCounter - 1);
      }
      if (continuousCounter > 3 && hypoEvent.state === 0) {
        hypoEvent.state = 1;
        hypoEvent.start = data.trends['MAP'][i - 3].time;
      } else if (continuousCounter === 0 && hypoEvent.state === 1) {
        hypoEvent.state = 0;
        if ((entry.time - hypoEvent.start) / 1000 > 5 * 60) {
          ++data.bp.numHypoEvent;
          data.bp.hypoEventDuration += (entry.time - hypoEvent.start) / 1000;
        }
      }
    } else {
      if (hypoEvent.state === 1) {
        hypoEvent.state = 0;
        ++data.bp.numHypoEvent;
        data.bp.hypoEventDuration += (entry.time - hypoEvent.start) / 1000;
      }
    }
  }

  function getDrugs(drugs) {
    var returned = {};
    if (data.drugs.bolus) {
      var keys = Object.keys(data.drugs.bolus);
      for (var i = 0; i < keys.length; i++) {
        for (var j = 0; j < drugs.length; j++) {
          if (keys[i].match(drugs[j].pattern)) {
            if (!returned[drugs[j].name]) {
              returned[drugs[j].name] = 0;
            }
            returned[drugs[j].name] += convertNumber(data.drugs.bolus[keys[i]]);
          }
        }
      }  
    }
    if (data.drugs.infusions) {
      var keys = Object.keys(data.drugs.infusions);
      for (var i = 0; i < keys.length; i++) {
        for (var j = 0; j < drugs.length; j++) {
          if (keys[i].match(drugs[j].pattern)) {
            if (!returned[drugs[j].name]) {
              returned[drugs[j].name] = 0;
            }
            returned[drugs[j].name] += convertNumber(data.drugs.infusions[keys[i]]);
          }
        }
      }  
    }
    return returned;
  }

  data.parsedDrugs = getDrugs([{
    name : 'morphine',
    pattern : /^(?=.*\bmorphine\b)(?!.*\bspinal\b).*$/i
  }, {
    name : 'fentanyl',
    pattern : /^(?=.*\b.*fentanyl\b)(?!.*\bspinal\b).*$/i
  }, {
    name : 'dilaudid',
    pattern : /^(?=.*\bdilaudid\b)(?!.*\bspinal\b).*$/i
  }, {
    name : 'morphine spinal',
    pattern : /^(?=.*\bmorphine\b)(?=.*\bspinal\b).*$/i
  }, {
    name : 'fentanyl spinal',
    pattern : /^(?=.*\bfentanyl\b)(?=.*\bspinal\b).*$/i
  }, {
    name : 'dilaudid spinal',
    pattern : /^(?=.*\bdilaudid\b)(?=.*\bspinal\b).*$/i
  }, {
    name : 'ketamine',
    pattern : /^(?=.*\bketamine\b)(?!.*\bspinal\b).*$/i
  }, {
    name : 'dexmedetomidine',
    pattern : /^(?=.*\bdexmedetomidine\b).*$/i
  }, {
    name : 'ketorolac',
    pattern : /^(?=.*\bketorolac\b).*$/i
  }, {
    name : 'phenylephrine',
    pattern : /^(?=.*\bphenylephrine\b).*$/i
  }, {
    name : 'ephedrine',
    pattern : /^(?=.*\bephedrine\b).*$/i
  }, {
    name : 'vasopressin',
    pattern : /^(?=.*\bvasopressin\b).*$/i
  }, {
    name : 'norepinephrine',
    pattern : /^(?=.*\bnorepinephrine\b).*$/i
  }])

  return data;
}


function process(entry, reducer) {
  $.post('/historical', {
    mrn: pad(entry.mrn, 7)
  }, function (data, status) {
    var match = data.match(new RegExp(`<a href="(.*?)">${entry.case.toUpperCase()}</a>`))
    console.log(match[1]);
    if(match) {
      $.get(match[1], function(data) {
        var source = $(data);
        reducer(ormap(source));
      });
    }
  })
}

function processBatch(records, reducer) {
  var result = [];
  var running = false;
  var current = 0;
  var runInterval = setInterval(function() {
    if (running) {
      return;
    }
    if (current === records.length) {
      console.log(result.join('\n'));
      clearInterval(runInterval);
      return;
    }
    running = true;
    console.log('processing', records[current].case,  records[current].mrn);
    process(records[current], function (data) {
      current = current + 1;
      running = false;
      reducer(data, result);
    });
  }, 1000);
}
