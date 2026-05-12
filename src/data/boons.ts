import { BoonType, type Boon } from "../types/boons";
import { RoundState } from "../types/game";

export const ALL_BOONS: Boon[] = [
  { name: 'Natural Heal', icon: '💫', description: 'Every round you get +1 hp', type: BoonType.BLESSED, triggerState: RoundState.BEFORE_START },
  { name: 'Lifesteal', icon: '💫', description: 'You get +1 hp from your each attack', type: BoonType.BLESSED, triggerState: RoundState.START_TURN },
  { name: 'Rage', icon: '💫', description: 'You can only attack once per round, but each of your attacks deals double damage', type: BoonType.TWISTED, triggerState: RoundState.START_TURN },
  { name: 'Suicide', icon: '💫', description: '-3 hp every start round', type: BoonType.CORRUPTED, triggerState: RoundState.BEFORE_START },
  { name: 'Chaotic', icon: '💫', description: '50% chance to deal extra one card', type: BoonType.CHAOTIC, triggerState: RoundState.BEFORE_START },
]
