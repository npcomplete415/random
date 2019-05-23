// .serializeArray()

// jQuery.fn.deserialize = function (data) {
//   var f = this,
//       map = {},
//       find = function (selector) { return f.is("form") ? f.find(selector) : f.filter(selector); };
//   //Get map of values
//   jQuery.each(data.split("&"), function () {
//       var nv = this.split("="),
//           n = decodeURIComponent(nv[0]),
//           v = nv.length > 1 ? decodeURIComponent(nv[1]) : null;
//       if (!(n in map)) {
//           map[n] = [];
//       }
//       map[n].push(v);
//   })
//   //Set values for all form elements in the data
//   jQuery.each(map, function (n, v) {
//       find("[name='" + n + "']").val(v);
//   })
//   //Clear all form elements not in form data
//   find("input:text,select,textarea").each(function () {
//       if (!(jQuery(this).attr("name") in map)) {
//           jQuery(this).val("");
//       }
//   })
//   find("input:checkbox:checked,input:radio:checked").each(function () {
//       if (!(jQuery(this).attr("name") in map)) {
//           this.checked = false;
//       }
//   })
//   return this;
// };

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

var objNormal = {
  oGen : 'No acute distress',
  oHeart : 'Appreciable Pulses',
  oResp : 'Normal Effort',
  oAbd : 'Soft, Non-tender',
  oExt : 'Warm'
}

$('.oNormal').click(function (event) {
  event.preventDefault();
  switch($(this).text()) {
    case 'Gen Normal':
    $('#oGen').val(objNormal['oGen']);
    break;
    case 'Heart Normal':
    $('#oHeart').val(objNormal['oHeart']);
    break;
    case 'Resp Normal':
    $('#oResp').val(objNormal['oResp']);
    break;
    case 'Abd Normal':
    $('#oAbd').val(objNormal['oAbd']);
    break;
    case 'Ext Normal':
    $('#oExt').val(objNormal['oExt']);
    break;
  }
});

$( "#progress" ).submit(function( event ) {
  event.preventDefault();
  var formData = $( this ).serializeArray();
  var sub = [];

  var subjective = {
    Nausea : false,
    Vomit : false,
    Flatus : false,
    BM : false,
    PO : false,
    Pain : false,
  };

  var sOther = '';

  var objective = [];

  var data = "";
  var assessment = "";
  var plan = "";
  var patient = "";
  for (var i = 0; i < formData.length; i++) {
    var entry = formData[i];
    if (entry.name === 'sOther') {
      sOther = entry.value;
    } else if (entry.name === 'sNAEO') {
      sub.push ('NAEO');
    } else if (entry.name[0] === 's') {
      subjective[entry.name.substring(1)] = entry.value === "true";
    }

    if (entry.name[0] === 'o') {
      if (entry.value) {
        objective.push(entry.name.substring(1) + ': ' + entry.value);
      } else {
        objective.push(entry.name.substring(1) + ': ' + objNormal[entry.name]);
      }
    }

    switch (entry.name) {
      case 'pID':
        patient = entry.value;
        break;
      case 'data':
        data = entry.value;
        break;
      case 'assessment':
        assessment = entry.value;
        break;
      case 'plan':
        plan = entry.value;
        break;
    }
  }

  var subKeys = Object.keys(subjective);
  shuffle(subKeys);
  for (var i = 0; i < subKeys.length; i++) {
    sub.push((subjective[subKeys[i]] ? '+' : '-') + subKeys[i]);
  }
  sub.push(sOther);

  var out = [];
  out.push('S: '+sub.join(', '));
  out.push('\n');
  out.push('O: ');
  out.push('Vitals: ***');
  out.push(shuffle(objective).join('\n'));
  out.push('\n');
  out.push('A/P: ' + assessment);
  out.push(plan);  
  $('#output').html(out.join('\n').replace(new RegExp('\n', 'g'), '<br/>'));
});


$( "#consult" ).submit(function( event ) {
  event.preventDefault();
  var formData = $( this ).serializeArray();

  var sub = [];

  var sOther = '';

  var objective = [];

  var data = "";
  var hpi = "";
  var assessment = "";
  var plan = "";
  var patient = "";
  for (var i = 0; i < formData.length; i++) {
    var entry = formData[i];
    if (entry.name[0] === 'o') {
      if (entry.value) {
        objective.push(entry.name.substring(1) + ': ' + entry.value);
      } else {
        objective.push(entry.name.substring(1) + ': ' + objNormal[entry.name]);
      }
    }

    switch (entry.name) {
      case 'pID':
        patient = entry.value;
        break;
      case 'data':
        data = entry.value;
        break;
      case 'hpi':
        hpi = entry.value;
        break;
      case 'assessment':
        assessment = entry.value;
        break;
      case 'plan':
        plan = entry.value;
        break;
    }
  }

  var out = [];
  out.push('HPI: '+sub.join(', '));
  out.push('\n');
  out.push('Physical: ');
  out.push('Vitals: ***');
  out.push(shuffle(objective).join('\n'));
  out.push('\n');
  out.push('A/P: ' + assessment);
  out.push(plan);  
  $('#output').html(out.join('\n').replace(new RegExp('\n', 'g'), '<br/>'));
});