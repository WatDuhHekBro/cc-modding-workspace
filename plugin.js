export default class Mod extends Plugin
{
	constructor(mod)
	{
		super(mod);
	}

	async prestart()
	{
		//ig.Bgm.preloadStartTrack('casual');
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
	}
}
