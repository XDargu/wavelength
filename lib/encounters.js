/*jshint esversion: 6 */

// First ones have higher priority
// The system will go one by one, and will roll against the probability of the available encounters, one by one. First one that success gets executed
// Set repeat to false to prevent an encounter from repeating
// Delay sets how long before the event is fired. Default is 1 seconds.
var rawEncounters = [
{
	type: "travel",
	probability: 100,
	repeat: false,
	requires: {
		fuel: -1
	},
	text: "The ship run out of fuel. Everything seems lost. However, a strike of luck! The sensors detect an empty cannister of fuel floating in space.",
	rewards: {
		fuel: 50
	}
},

// Gameplay rewards
{
	type: "explore",
	probability: 1,
	repeat: true,
	requires: {
		fuel: -50,
		system: "echoes",
	},
	text: "A faint radio signal comes from the surface of the planet. Further examination reveals the origin. Looks like the ruin of some sort of mining station. There is some fuel in there.",
	rewards: {
		fuel: 10,
	}
},

// Jungle rewards
{
	type: "explore",
	probability: 2,
	repeat: true,
	requires: {
		system: "echoes",
		planet: "jungle"
	},
	text: "The planet seems to be completely covered in vegetation. Some of the weird plants seems to emit some sort of harmless radiation. And they turned out to be edible!",
	rewards: {
		food: 30,
	}
},
{
	type: "explore",
	probability: 2,
	repeat: true,
	requires: {
		system: "quiet",
		planet: "jungle"
	},
	text: "The radio just seems to be getting background radiation, it's no help exploring. However, the planet seems to contain some fruit apt for consumption.",
	rewards: {
		food: 10,
	}
},
{
	type: "explore",
	probability: 2,
	repeat: true,
	requires: {
		food: -10,
		planet: "jungle",
	},
	text: "Jackpot! When everything seemed to be lost you found, by sheer luck, a huge amount of food.",
	rewards: {
		food: 100,
	}
},
// Generic rewards
{
	type: "explore",
	probability: 10,
	repeat: true,
	requires: {
		system: "echoes"
	},
	text: "Following a faint signal you disvoered an abandoned depot with some basic supplies.",
	rewards: {
		fuel: 10,
		food: 10
	}
},
{
	type: "explore",
	probability: 10,
	repeat: true,
	requires: {
		system: "echoes"
	},
	text: "Some sort of signal is comming from the planet. After following it, you discovered the remains of a ship. It crashed a long time ago. At least it still had some fuel you can savage.",
	rewards: {
		fuel: 15,
	}
},
{
	type: "explore",
	probability: 10,
	repeat: true,
	requires: {
		system: "echoes"
	},
	text: "There is a small pulse comming from an abadoned structure in the planet. It seemed to contains packaged food for extreme situations.",
	rewards: {
		food: 15,
	}
},
{
	type: "explore",
	probability: 5,
	repeat: true,
	requires: {
		system: "echoes"
	},
	text: "A pulsating signal comes from the planet. Apparently it was a distress signal, comming from below some debris. You use the ship to remove it, but there's nothing valuable there. You just spent some fuel for nothing.",
	rewards: {
		fuel: -5,
	}
},
{
	type: "explore",
	probability: 50,
	repeat: true,
	requires: {
		system: "active"
	},
	text: "The intense signal seemed to be comming from the remains of some sort of fatory. There are still basic supplies there.",
	rewards: {
		fuel: 15,
		food: 15
	}
},

// Just text
{
	type: "explore",
	probability: 5,
	repeat: true,
	requires: {
		system: "dead",
		planet: "desert",
	},
	text: "This planet was a paradise eons ago. Now nothing grows there anymore. Only sand.",
},
{
	type: "travel",
	probability: 1,
	repeat: true,
	requires: {
		system: "dead",
	},
	text: "The moment you arrive you feel something is wrong. The planet reeks death. Something horrible happened here.",
},
{
	type: "travel",
	probability: 1,
	repeat: true,
	requires: {
		system: "dead",
		planet: "strange"
	},
	text: "Something is off. You can't find a confortable position. It's like there's a weird pressure from the planet.",
},
{
	type: "travel",
	probability: 1,
	repeat: true,
	requires: {
		system: "quiet",
	},
	text: "Another planet with no signs of life. Just the usual background radiation.",
},




{
	type: "explore",
	probability: 100,
	repeat: true,
	text: "You find nothing.",
},
]