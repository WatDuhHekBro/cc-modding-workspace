// This will contain convenience functions from the console.

const PRESETS = {
	"Vermillion: Start": ['arid.interior.the-room', 10000],
	"Vermillion: Shizuka": ['arid.interior.the-room', 12600],
	"Shizuka Duel": ['hideout.path-3', 19500],
	"Satoshi": ['hideout.inner-office', 20000],
	"Vermillion: Raid": ['arid.cliff-1', 28000],
	"End: Hideout": ['hideout.path-3', 31400]
};

function setPreset(choice)
{
	LOAD_LEVEL_ON_GAME_START = PRESETS[choice][0];
	new ig.EVENT_STEP.CHANGE_VAR_NUMBER({'changeType':'set', 'varName':'plot.line', 'value': PRESETS[choice][1]}).start();
	new ig.EVENT_STEP.CHANGE_VAR_NUMBER({'changeType':'set', 'varName':'plot.intro', 'value':400}).start();
	new ig.EVENT_STEP.CHANGE_VAR_NUMBER({'changeType':'set', 'varName':'plot.version', 'value':5}).start();
	new ig.EVENT_STEP.CHANGE_VAR_NUMBER({'changeType':'set', 'varName':'g.skillUpdate', 'value':1}).start();
	new ig.EVENT_STEP.CHANGE_VAR_BOOL({'changeType':'set', 'varName':'g.assistNotified', 'value':true}).start();
	return PRESETS[choice] ? true : false;
}
