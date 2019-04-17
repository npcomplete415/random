var lines = $('#source').val().split('\n')

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

$('#output').empty();
$('#output').append($('<span>'+data.temp+'&nbsp;&nbsp;'+
data.resp+'&nbsp;&nbsp;'+
data.pulse+'&nbsp;&nbsp;'+
data.bp+'&nbsp;&nbsp;'+
data.o2+'&nbsp;&nbsp;'+'</span>'));


