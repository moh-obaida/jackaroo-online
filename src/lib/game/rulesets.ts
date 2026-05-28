// ============================================================================
// RULESETS MODULE — Obaida Classic and Custom Rules definitions
// ============================================================================

import { CustomRulesConfig, DEFAULT_CUSTOM_RULES } from '../../types/game';

export interface Ruleset {
  id: string;
  name: string;
  nameAr: string;
  editable: boolean;
  jokers: boolean;
  config: CustomRulesConfig;
}

/**
 * Obaida Classic — Locked ruleset. Not editable.
 */
export const OBAIDA_CLASSIC: Ruleset = {
  id: 'obaida_classic_v1',
  name: 'Obaida Classic',
  nameAr: 'أوبيدا كلاسيك',
  editable: false,
  jokers: false,
  config: {
    name: 'Obaida Classic',
    jokerEnabled: false,
    jokerCopiesCard: false,
    queenBurnEnabled: true,
    tenBurnEnabled: true,
    kingPathEatingEnabled: true,
    fiveCanMoveAnyone: true,
    longerTwoPlayerVariant: false,
    botDifficulty: 'very_easy',
    timerEnabled: false,
    timerSeconds: 60,
  },
};

/**
 * Get the active ruleset config for a game.
 */
export function getRulesetConfig(
  rulesetType: 'obaida_classic' | 'custom',
  customConfig?: CustomRulesConfig | null
): CustomRulesConfig {
  if (rulesetType === 'obaida_classic') {
    return OBAIDA_CLASSIC.config;
  }
  return customConfig || DEFAULT_CUSTOM_RULES;
}

/**
 * Check if a specific rule is enabled.
 */
export function isRuleEnabled(
  config: CustomRulesConfig,
  rule: keyof CustomRulesConfig
): boolean {
  const value = config[rule];
  return typeof value === 'boolean' ? value : false;
}

/**
 * Create a new custom rules template with defaults.
 */
export function createCustomTemplate(name: string): CustomRulesConfig {
  return {
    ...DEFAULT_CUSTOM_RULES,
    name,
  };
}

/**
 * Get a human-readable summary of custom rules differences from Obaida Classic.
 */
export function getCustomRulesSummary(config: CustomRulesConfig): string[] {
  const diffs: string[] = [];
  const classic = OBAIDA_CLASSIC.config;

  if (config.jokerEnabled !== classic.jokerEnabled) {
    diffs.push(config.jokerEnabled ? 'Joker enabled' : 'Joker disabled');
  }
  if (config.queenBurnEnabled !== classic.queenBurnEnabled) {
    diffs.push(config.queenBurnEnabled ? 'Queen burn enabled' : 'Queen burn disabled');
  }
  if (config.tenBurnEnabled !== classic.tenBurnEnabled) {
    diffs.push(config.tenBurnEnabled ? '10 burn enabled' : '10 burn disabled');
  }
  if (config.kingPathEatingEnabled !== classic.kingPathEatingEnabled) {
    diffs.push(config.kingPathEatingEnabled ? 'King path eating enabled' : 'King path eating disabled');
  }
  if (config.fiveCanMoveAnyone !== classic.fiveCanMoveAnyone) {
    diffs.push(config.fiveCanMoveAnyone ? '5 can move anyone' : '5 moves own only');
  }
  if (config.longerTwoPlayerVariant) {
    diffs.push('Longer 2-player variant');
  }
  if (config.timerEnabled) {
    diffs.push(`Timer: ${config.timerSeconds}s`);
  }

  return diffs.length > 0 ? diffs : ['Same as Obaida Classic'];
}
