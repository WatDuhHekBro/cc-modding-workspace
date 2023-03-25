export default class Mod extends Plugin
{
	constructor(mod)
	{
		super(mod);
	}

	async prestart()
	{
		//ig.Bgm.preloadStartTrack('casual');

		function mapPos3ToScreenPos2(outVec2, x, y, z) {
			ig.system.getScreenFromMapPos(outVec2, x, y - z);
			outVec2.x = ig.system.getDrawPos(outVec2.x);
			outVec2.y = ig.system.getDrawPos(outVec2.y);
		}

		const circles = [];

		ig.perf.showHitBoxes = true;
		ig.debugView = {
			addMapCircle(x, y, z, currentRadius, direction, startAngle, endAngle, zHeight, color, width, yScale) {
				// Convert data
				const result = {}; // vec2
				mapPos3ToScreenPos2(result, x, y, z);

				circles.push({
					x: result.x,
					y: result.y,
					z,
					currentRadius,
					direction,
					startAngle,
					endAngle,
					zHeight,
					color,
					width,
					yScale
				});
			}
		};

		// To debug hitboxes in slow motion, set "ig.system.totalTimeFactor" in the console.
		sc.CircleAttackRender = ig.GameAddon.extend({
			init() {
				this.parent('CircleAttackRenderMod');
			},

			postDrawOrder: 100,

			onPostDraw() {
				if(ig.input.state('debug')) {
					debugger;
				}

				let circle;
				while(circle = circles.shift()) {
					// The base is to the right by default, 0, then each direction just adds pi/2
					// Right, Up, Left, Down
					// However, the direction x and y can contain any range of numbers.
					// (-pi/4, pi/4) for example is an arc to the right. The offset is +0, and to get it to face up, it's +pi/2.
					let angleOffset = 0;
					let isLeftFacing = false;

					if(circle.direction) {
						// There's another problem though, (1, 1) is a valid point for example.
						// To fix this, calculate the angle from the line that starts from (0, 0).
						const x = circle.direction.x;
						const y = circle.direction.y; // y needs to be kept as inverse because the context draws assuming y+ is down.

						// Q2 & Q3
						if(x < 0) {
							angleOffset = Math.atan(y / x) + Math.PI;
							isLeftFacing = true;
						}
						// Q1 & pi/2
						else if(x >= 0 && y >= 0) {
							angleOffset = Math.atan(y / x);
						}
						// Q4 & 3pi/2
						else if(x >= 0 && y < 0) {
							angleOffset = Math.atan(y / x) + (2 * Math.PI);
						}

						// Note: Math.atan() takes care of pi/2 and 3pi/2, but the results have been very janky.
						// Then just make sure that the negative cases don't involve zero.
						/*if(x )
						// Q1
						else if(x > 0 && y >= 0) {
							angleOffset = Math.atan(y / x);
							console.log("Q1", x, y, angleOffset);
						}
						// Q2
						else if(x < 0 && y > 0) {
							angleOffset = -Math.atan(y / x) + (Math.PI / 2);
							console.log("Q2", x, y, angleOffset);
						}
						// Q3
						else if(x < 0 && y <= 0) {
							angleOffset = Math.atan(y / x) + Math.PI;
							console.log("Q3", x, y, angleOffset);
						}
						// Q4
						else if(x > 0 && y < 0) {
							angleOffset = -Math.atan(y / x) + (3/2 * Math.PI);
							console.log("Q4", x, y, angleOffset);
						}*/

						// [Error] The given works out as long as all measurements are within the unit circle, which seems to be the case.
						/*if(y >= 0) {
							// [Q1 and Q2, 0 <= A <= pi]
							angleOffset = Math.acos(x);
						} else {
							// [Q3 and Q4, pi < A < 2pi]
							angleOffset = Math.acos(-x) + Math.PI;
						}*/
					}

					// Setup and store original context
					const ctx = ig.system.context;
					ctx.save();

					// Context Settings
					ctx.lineWidth = 1;
					ctx.strokeStyle = "red";
					ctx.fillStyle = "red";
					ctx.globalAlpha = 1;

					let start = circle.startAngle;
					let end = circle.endAngle;

					// Reverse direction if left-facing [todo]
					//if(isLeftFacing) {
					//}

					// Draw the circle
					ctx.beginPath();
					// ctx.arc(circle.x, circle.y, circle.currentRadius, 0, Math.PI * 2);
					ctx.arc(
						//circle.x + (circle.direction ? (circle.currentRadius * circle.direction.x / 2) : 0),
						//circle.y + (circle.direction ? (circle.currentRadius * circle.direction.y / 2) : 0),
						circle.x,
						circle.y,
						circle.currentRadius,
						start + angleOffset,
						end + angleOffset
					);
					ctx.fill();
					ctx.stroke();

					// Restore the original context
					ctx.restore();
				}
			}
		});

		ig.addGameAddon(() => {
			const addon = new sc.CircleAttackRender();
			sc.circleAttackRenderMod = addon;
			return addon;
		});
	}

	poststart()
	{
		sc.GameModel.inject({
			startSkip: function()
			{
				this.parent();
				new ig.EVENT_STEP.CHANGE_VAR_BOOL({'varName':'tmp.skip', 'changeType':'set', 'value':true}).start();
			},
			stopSkip: function()
			{
				this.parent();
				new ig.EVENT_STEP.CHANGE_VAR_BOOL({'varName':'tmp.skip', 'changeType':'set', 'value':false}).start();
			}
		});

		ig.BGM_DEFAULT_TRACKS.arid.sRankBattle = {
			track: "oldHideoutBattle",
			volume: 1
		};

		ig.BGM_DEFAULT_TRACKS.aridDng.sRankBattle = {
			track: "oldHideoutBattle",
			volume: 1
		};

		ig.BGM_DEFAULT_TRACKS.lastDng.sRankBattle = {
			track: "oldHideoutBattle",
			volume: 1
		};

		// Hitbox Testing

		for(let i = 0; i < simplify.updateHandlers.length; i++)
			if(simplify.updateHandlers[i].name === 'hitbox')
				simplify.updateHandlers.splice(i, 1);

		simplify.registerUpdate(function hitbox() {
			if(ig.input.state('hitbox')) {
				new ig.ACTION_STEP.CIRCLE_ATTACK({
					"align":"FACE",
					"radius":50,
					"yScale":0,
					"zHeight":16,
					"centralAngle":0,
					"duration":0,
					"expandRadius":0,
					"alwaysFull":true,
					"clockwise":false,
					"flipLeftFace":0,
					"rectangular":false,
					"repeat":false,
					"uniformHitDir":true,
					"fixPos":false,
					"checkCollision":true,
					"attack":
					{
						"type":"MASSIVE",
						"visualType":"MEDIUM",
						"element":"NEUTRAL",
						"damageFactor":0.1,
						"reverse":false,
						"spFactor":0,
						"stunSteps":
						[
							{
								"type":"START_LOCK"
							},
							{
								"type":"BLOCK_XY"
							}
						],
						"hints":
						[
							"NO_PUZZLE"
						],
						"guardable":"",
						"skillBonus":"MELEE_DMG",
						"limiter":""
					},
					"offset":
					{
						"x":0,
						"y":0,
						"z":0
					}
				}).run(ig.game.playerEntity);
			}
		});

		ig.input.bind(ig.KEY.ALT, 'hitbox');
		ig.input.bind(ig.KEY.ENTER, 'debug');
	}
}
