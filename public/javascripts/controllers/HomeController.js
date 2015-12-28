app.controller('HomeController', ['$scope', '$sce', '$http', function($scope, $sce, $http) {
	var loadData = function() {
		$scope.events = [];

		$http.get('/api/candidates/random').then(function(response) {
			if(response.data[0] != undefined) {
				$scope.randomCandidate.name = response.data[0].first_name + " " + response.data[0].last_name;
				$scope.randomCandidate.position = response.data[0].name + " Candidate";
				$scope.randomCandidate.rcsId = response.data[0].rcs_id;
			}

			$scope.randomCandidate.loaded = true;
		}, function() {
			$scope.randomCandidate.loaded = true;
		});

		$http.get('/api/events/limit/4').then(function(response) {
			response.data.forEach(function(elem) {
				$scope.events.push({
					id: elem.event_id,
					title: elem.title,
					date: elem.date,
					start: elem.start,
					end: elem.end,
					location: elem.location,
					desc: elem.description
				});
			});
			console.log($scope.events);
		});
	};
	loadData();

	$scope.pageHeader = "GM Week Headquarters";
	$scope.slides = [
		{
			header: "Make your voice heard!",
			body: "During GM Week, student government goes up for election. Be sure to vote and help elect the next set of leaders."
		},
		{
			header: "Run for office!",
			body: "Are you interested in joining Student Government? Learn about becoming a candidate."
		},
		{
			header: "Partake in GM Week festivities!",
			body: "Events and activities will be going on throught the week."
		},
		{
			header: "Learn about the candidates!",
			body: "Meet the people, check out their platforms, and find the candidates that best match your views!"
		}
	];

	$scope.infoBlocks = [
		{
			header: "Get out and vote",
			body: "Primary elections will take place on Monday, April 1. Final elections will take place on Thursday, April 1. " + 
				  "Get to Commons, the Union, or the DCC and earn a free GM Week mug by voting!",
			icon: "fa-check-square"
		},
		{
			header: "Take part in the fun",
			body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla pretium elementum. Ut " + 
				  "lobortis, nibh placerat iaculis feugiat, purus orci maximus nulla eget rutrum.",
			icon: "fa-smile-o"
		},
		{
			header: "Meet the candidates",
			body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla pretium elementum. Ut " + 
				  "lobortis, nibh placerat iaculis feugiat, purus orci maximus nulla eget rutrum.",
			icon: "fa-group"
		},
		{
			header: "Become a candidate",
			body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla pretium elementum. Ut " + 
				  "lobortis, nibh placerat iaculis feugiat, purus orci maximus nulla eget rutrum.",
			icon: "fa-plus-square"
		}
	];

	$scope.electionTips = {
		header: "Election Rules and Tips",
		list: [
			"<b>Don't:</b> tear down posters, even if they appear to be in violation of an RnE regulation.<br/>" +
			"<b>Do:</b> report violations to RnE so they can take appropriate action. Email reports to <a href=\"mailto:rne@union.rpi.edu\">rne@union.rpi.edu</a>.",

			"<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
			"<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",

			"<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
			"<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",

			"<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
			"<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",

			"<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
			"<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",
		]
	};

	$scope.candidateHeader = "Meet a Candidate";

	$scope.randomCandidate = {
		name: "",
		position: "",
		bio: "",
		rcsId: "",
		img: "rotating_card_profile2.png",
		loaded: false
	};

	$scope.eventHeader = "Upcoming Events";

	//$scope.events = [
	//	{
	//		name: "Elections Info Session",
	//		date: new Date("Wed Mar 9 2016 19:00:00 GMT-0500 (EST)"),
	//		location: "Student Government Suite",
	//		desc: "Come by the Student Government Suite, and learn how to run for Student Government!"
	//	},
	//	{
	//		name: "Elections Info Session",
	//		date: new Date("Wed Mar 9 2016 19:00:00 GMT-0500 (EST)"),
	//		location: "Student Government Suite",
	//		desc: "Come by the Student Government Suite, and learn how to run for Student Government!"
	//	},
	//	{
	//		name: "Elections Info Session",
	//		date: new Date("Wed Mar 9 2016 19:00:00 GMT-0500 (EST)"),
	//		location: "Student Government Suite",
	//		desc: "Come by the Student Government Suite, and learn how to run for Student Government!"
	//	},
	//	{
	//		name: "Elections Info Session",
	//		date: new Date("Wed Mar 9 2016 19:00:00 GMT-0500 (EST)"),
	//		location: "Student Government Suite",
	//		desc: "Come by the Student Government Suite, and learn how to run for Student Government!"
	//	}
	//];

	$scope.trust = function(str) {
		return $sce.trustAsHtml(str);
	}
}]);