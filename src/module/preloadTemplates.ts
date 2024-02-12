export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "modules/midi-qol/templates"
    "modules/midi-qol/templates/actorOnUseMacrosConfig.html",
    "modules/midi-qol/templates/config.html",
    "modules/midi-qol/templates/damage-results.html",
    "modules/midi-qol/templates/damage-results-player.html",
    "modules/midi-qol/templates/dialog.html",
    "modules/midi-qol/templates/hits.html",
    "modules/midi-qol/templates/item-card-buttons.html",
    "modules/midi-qol/templates/item-card copy.html",
    "modules/midi-qol/templates/item-card.html",
    "modules/midi-qol/templates/itemTypeSelector.html",
    "modules/midi-qol/templates/midiPropertiesForm.hbs",
    "modules/midi-qol/templates/rollAlternate.html",
    "modules/midi-qol/templates/roll.html",
    "modules/midi-qol/templates/rolloptions.html",
    "modules/midi-qol/templates/roll-stats.html",
    "modules/midi-qol/templates/saves.html",
    "modules/midi-qol/templates/sound-config.html",
    "modules/midi-qol/templates/targetConfirmationConfig.html",
    "modules/midi-qol/templates/targetConfirmation.html",
    "modules/midi-qol/templates/tool-card.html",
    "modules/midi-qol/templates/troubleShooter.html",
    "modules/midi-qol/templates/undo-workflow.html",
  ];
	return loadTemplates(templatePaths);
}

/*    "modules/midi-qol/templates/saves.html",
    "modules/midi-qol/templates/hits.html",
    "modules/midi-qol/templates/item-card.html",
    "modules/midi-qol/templates/tool-card.html",
    "modules/midi-qol/templates/config.html",
    "modules/midi-qol/templates/damage-results.html",
    "modules/midi-qol/templates/roll-stats.html",
    "modules/midi-qol/templates/damage-results-player.html",
    "modules/midi-qol/templates/targetConfirmation.html",
    // "modules/midi-qol/templates/midiProperties.html"
    "modules/midi-qol/templates/sound-config.html",
    "modules/midi-qol/templates/rollAlternate.html",
    "modules/midi-qol/templates/actorOnUseMacrosConfig.html",
    "modules/midi-qol/templates/dialog.html",
    "modules/midi-qol/templates/rollStatsConfig.html",
    "modules/midi-qol/templates/TargetConfirmationConfig.html",
    "modules/midi-qol/templates/rollStats.html",    
    */