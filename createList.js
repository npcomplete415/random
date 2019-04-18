var createList = function (names) {
  var list = document.getElementsByTagName("tr");

  var findOR = function (list, index) {
    for (var i = index; i >= 0; i--) {
      if (list[i].getElementsByTagName('td').length === 1) {
        return list[i];
      }
    }
  }

  var filter = function (items, names) {
    var returned = [];
    var lastheader = null;
    for (var i = 0; i < items.length; i++) {
      if (list[i].getElementsByTagName('td').length > 5) {
        var found = false;
        var surgeons = list[i].getElementsByTagName('td')[4].innerText.split('\n');
        for (var j = 0; j < surgeons.length; j++) {
          if (names.indexOf(surgeons[j].trim()) > -1) {
            found = true;
            break;
          }
        }
        if (found) {
          var header = findOR(items, i);
          if (header !== lastheader) {
            returned.push(header);
            lastheader = header;
          }
          returned.push(items[i]);
        }
      }
    }
    return returned;
  }

  var filtered = filter(list, names)

  var new_tbody = document.createElement('tbody');
  for (var i = 0; i < filtered.length; i++) {
    new_tbody.append(filtered[i]);
  }

  document.getElementsByTagName('table')[0].innerHTML = new_tbody.outerHTML
}
