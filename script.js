//Variables for Web Audio API, SVG, songs and tracks from soundcloud
var source;
var context;
var Buffaudio;
var gainNode;
var analyserNode;
var frequencyData;
var pauseNow, startNow;
var playbutn;
var stopbutn;
var searchB;
var SVG, w, h;
var SVG2; 
var songNumber, trackNumber;
//create booleans so that it is easier to make the opposite command later
var soundReady = false;
var paused = false;
var firstClick = true;

function createSVG() {
	frequencyData = new Uint8Array(200);
	$('#waves').html('');
	var w = $('#waves').width();
	h = $('#waves').height()/2;
	var barPadding = 2;

	SVG = d3.select('#waves')
		.append("svg")
		.attr("id", "svg")
		.attr("width", w)
		.attr("height", h);

	//Creating the D3 bar charts (the ones that will be on the top)
	SVG.selectAll("rect")
	   .data(frequencyData)
	   .enter()
	   .append('rect')
	   .attr('x', function (d, i) {
	      return i * (w / frequencyData.length);
	   })
	   .attr('width', w / frequencyData.length - barPadding);

	//Creating reflections of the "bar charts" (think if you want to do them same colors)
	SVG2 = d3.select("#waves")
		.append("svg")
		.attr("id", "svg2")
		.attr("width", w)
		.attr("height", h);

	SVG2.selectAll("rect")
	   .data(frequencyData)
	   .enter()
	   .append('rect')
	   .attr('x', function (d, i) {
	      return i * (w / frequencyData.length);
	   })
	   .attr('width', w / frequencyData.length - barPadding);

	updateChart();
}
// creating random color mixes for the song bars/waves
function getRandomInt(min, max){
	return Math.floor(Math.random()*(max - min +1))+ min;
}

function assignColor(d) {
// taking randomized colors of green, red, blue //not randomizing completely as it will be too colorful
if (songNumber === 0){
	var r = getRandomInt (200,255);
	var g = getRandomInt(0,0);
	var b = getRandomInt (200,250);

	return 'rgb(' + r + ","+ g + ","+ b +')';
} else if (songNumber === 1){
	var r = getRandomInt (0,50);
	var g = getRandomInt(100,150);
	var b = getRandomInt (0, 80);

	return 'rgb(' + r + ","+ g + ","+ b +')';
} else if (songNumber === 2){
    var r = getRandomInt (0,0);
	var g = getRandomInt(100,150);
	var b = getRandomInt (200, 250);

// rest of the songs will have same color
	return 'rgb(' + r + ","+ g + ","+ b +')';
} else {

    var r = getRandomInt (200,255);
	var g = getRandomInt(0,0);
	var b = getRandomInt (0,0);

	return 'rgb(' + r + ","+ g + ","+ b +')';
}
}
//Same for the reflection, different colors for now
function assignReflection(d) {

      	if (songNumber === 0){
	var r = getRandomInt (200,255);
	var g = getRandomInt(0,0);
	var b = getRandomInt (200, 250);

	return 'rgb(' + r + ","+ g + ","+ b +')';
} else if (songNumber === 1){
	var r = getRandomInt (50, 100);
	var g = getRandomInt(150,255);
	var b = getRandomInt (0, 50);

	return 'rgb(' + r + ","+ g + ","+ b +')';
} else if (songNumber ===2){
    var r = getRandomInt (0,0);
	var g = getRandomInt(200,250);
	var b = getRandomInt (200, 250);

	return 'rgb(' + r + ","+ g + ","+ b +')';
} else {

    var r = getRandomInt (50,150);
	var g = getRandomInt(0,0);
	var b = getRandomInt (0,0);

	return 'rgb(' + r + ","+ g + ","+ b +')';
}
}
//updating charts with the new sound data
function updateChart() {
	
requestAnimationFrame(updateChart);
analyserNode.getByteFrequencyData(frequencyData);
 if (firstClick || !paused) {
   //Updating D3 
	var rects = SVG.selectAll('rect')
	.data(frequencyData);

	rects.attr("id", "rects")
	.attr("margin", "0")
	.attr('y', function(d) {
		return h - d;
	})
    .attr('height', function(d) {
    	return d;
})
    .attr('fill', function(d) {
    	return assignColor(d);
});
    var reflections = SVG2.selectAll('rect')
	  .data(frequencyData);

//Updating D3 for reflection as well 
	reflections.attr("id", "reflections")
	.attr("margin", "0")
	.attr('y', function(d) {
		return 0;
})
    .attr('height', function(d) {
    	return d;
})
    .attr('fill', function(d) {
    	return assignReflection(d);
});
 }
}

function initContext() {
  try {
  	context = new window.AudioContext() || new window.webkitAudioContext();
  }
  catch(e) {
    alert("Web Audio API not working" + e);
  }
}

//Making Sound work with the click of the button
function playSound() {
	source = context.createBufferSource(); 
  	source.connect(gainNode);
	gainNode.connect(analyserNode);
	analyserNode.connect(context.destination);
	source.buffer = Buffaudio;
	startNow = Date.now();
	source.start(0);
	firstClick = false;

	createSVG();
}
//making the play/stop button work
function resumeSound() {
	source = context.createBufferSource(); 
  	source.connect(gainNode);
	gainNode.connect(analyserNode);
	analyserNode.connect(context.destination);
	source.buffer = Buffaudio;

	if (paused) {
		startNow = Date.now() - pauseNow; 
		source.start(0, pauseNow/800);
	}
	paused = false;
}

function stopSound() {
	source.stop(0);
	pauseNow = Date.now() - startNow; 
	paused = true;		
}

function makeAudioRequest(trackUrl) {
	var url = trackUrl;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	
request.onload = function() {
	context.decodeAudioData(request.response, function(theBuffer) {
	Buffaudio = theBuffer;
	  if (Buffaudio) {
	  	soundReady = true;
	  	gainNode = context.createGain();
		analyserNode = context.createAnalyser();

//making the text change fron enjoy to next song on the button
	  	playSound();
	  	$("#SButton").html("Next Song");  
	  	$("#SButton").css("background-color", function() {
	  	var color = assignColor();
	  	return color;
});
		searchB.disabled = false;
    	$("#PlayButton").attr("disabled",false);
	}
  });
};
	request.send();
}

// Get soundtrack data from soundCloud API 
function getSoundData(searchWord) {
	console.log("Getting sound data");

	clientID = "98f18f7088398973c9090d2309d08568";
	var clientUrl = "?client_id=" + clientID;

	SC.initialize({
    	client_id: clientID,
  });

	SC.get('/tracks', {
      q: searchWord, 

    }).then(function(tracks) {
  		if (tracks && tracks.length !== 0) {
			if (trackNumber > tracks.length-1) {
				trackNumber = 0;
			}
			var requestUrl = tracks[trackNumber].stream_url + clientUrl;
			makeAudioRequest(requestUrl);
			trackNumber ++;

  		}else {
  			alert("No search results. Please try another song.");
  		}
	});
}

$(document).ready(function() {
    $("#PlayButton").attr("disabled","disabled");
	initContext();
	//Changing songs 
    $("#InfoInput").keydown(function(event){ 
        trackNumber = 0;
    });  

	$("#SButton").click(function() {
		var input = $("#InfoInput").val();

		if (input) {
			searchB = this;
	        searchB.disabled = true;
			songNumber ++;

			if (songNumber > 4) {
				songNumber = 0;
			}
			if (!firstClick) {
			source.stop(); 
			$("#PlayButton").html("<img src='11.jpg' width=50 height=50>");
			frequencyData = new Uint8Array(0);

			} else {
				songNumber = 0;
			}
			paused = false;
			getSoundData(input); 

		}else {
			alert("Please enter a Song or an Artist name.");
		}
	});
	$("#PlayButton").click(function() {
		if (soundReady) {

		if (paused || firstClick) {
			$("#PlayButton").html("<img src='11.jpg' width=50 height=50>");
				resumeSound();
		}else {
			$("#PlayButton").html("<img src='18.jpg' width=50 height=50>");
				stopSound();
		}
		}
	});
});