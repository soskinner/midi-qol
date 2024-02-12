import { configSettings, itemRollButtons } from "./settings.js";
import { i18n, debug, log, warn, debugEnabled } from "../midi-qol.js";
import { showItemInfo } from "./itemhandling.js";
import { itemHasDamage, itemIsVersatile } from "./utils.js";
import { ActorOnUseMacrosConfig } from "./apps/ActorOnUseMacroConfig.js";
import { Workflow } from "./workflow.js";


const knownSheets = {
  BetterNPCActor5eSheet: ".item .rollable",
  ActorSheet5eCharacter: ".item .item-image",
  BetterNPCActor5eSheetDark: ".item .rollable",
  ActorSheet5eCharacterDark: ".item .item-image",
  DarkSheet: ".item .item-image",
  ActorNPC5EDark: ".item .item-image",
  DynamicActorSheet5e: ".item .item-image",
  ActorSheet5eNPC: ".item .item-image",
  DNDBeyondCharacterSheet5e: ".item .item-name .item-image",
  // Tidy5eSheet: ".item .item-image",
  // Tidy5eNPC: ".item .item-image",
  MonsterBlock5e: ".item .item-name",
  "sw5e.ActorSheet5eNPC": ".item .item-name"
  //  Sky5eSheet: ".item .item-image",
};
export function setupSheetQol() {
  for (let sheetName of Object.keys(knownSheets)) {
    Hooks.on("render" + sheetName, enableSheetQOL);
  }
  // Hooks.on("renderedAlt5eSheet", enableSheetQOL);
  // Hooks.on("renderedTidy5eSheet", enableSheetQOL);
}
let enableSheetQOL = (app, html, data) => {
  // find out how to reinstate the original handler later.
  const defaultTag = ".item .item-image";
  let rollTag = knownSheets[app.constructor.name] ? knownSheets[app.constructor.name] : defaultTag;
  if (itemRollButtons) {
    if (["Tidy5eSheet", "Tidy5eNPC"].includes(app.constructor.name)) {
    } else {
      addItemSheetButtons(app, html, data);
    }
  }
  if (configSettings.allowActorUseMacro) {
    // Add actor macros
    html.find('.config-button[data-action="flags').parent().parent().append(`<div class="form-fields">
      <label>${i18n("midi-qol.ActorOnUseMacros")}</label>
      <a class="config-button midiqol-onuse-macros" data-action="midi-onuse-macros" title="midi onuse macros">
        <i class="fas fa-cog"></i>
      </a>
      </div>`);
    html.find(".midiqol-onuse-macros").click(ev => {
      new ActorOnUseMacrosConfig(app.object, {}).render(true);
    });
  }
  return true;
};

function addItemSheetButtons(app, html, data, triggeringElement = "", buttonContainer = "") {
  // Setting default element selectors
  let alreadyExpandedElement = ".item.expanded";
  if (triggeringElement === "")
    triggeringElement = ".item .item-name";
  if (["BetterNPCActor5eSheet", "BetterNPCActor5eSheetDark"].includes(app.constructor.name)) {
    triggeringElement = ".item .npc-item-name";
    buttonContainer = ".item-properties";
    alreadyExpandedElement = ".item.expanded .npc-item-name";//CHANGE
  }
  if (buttonContainer === "")
    buttonContainer = ".item-properties";
  // adding an event for when the description is shown
  html.find(triggeringElement).click(event => {//CHANGE
    addItemRowButtonForTarget(event.currentTarget, app, html, data, buttonContainer);
  });
  if (alreadyExpandedElement) {
    html.find(alreadyExpandedElement).get().forEach(el => {
      let item = app.object.items.get(el.dataset.itemId);
      addItemRowButton(el, item, app, html, data, buttonContainer);
    });
  }
}
function addItemRowButtonForTarget(target, app, html, data, buttonContainer) {
  let li = $(target).parents(".item");
  if (!li.hasClass("expanded")) return;
  let item = app.object.items.get(target.parentNode.dataset.itemId);
  addItemRowButton(li, item, app, html, data, buttonContainer);
}
function addItemRowButton(target, item, app, html, data, buttonContainer) {
  // let li = $(target).parents(".item");
  // let item = app.object.items.get(target.attr("data-item-id"));
  if (!item)
    return;
  let actor = app.object;
  item.getChatData().then(chatData => {
    let targetHTML = $(target);
    let buttonTarget = targetHTML.find(".item-buttons");
    if (buttonTarget.length > 0)
      return; // already added buttons
    let buttonsWereAdded = false;
    // Create the buttons
    let buttons = $(`<div class="item-buttons"></div>`);
    switch (item.type) {
      case "weapon":
      case "spell":
      case "power":
      case "feat":
        buttons.append(`<span class="tag"><button data-action="basicRoll">${i18n("midi-qol.buttons.roll")}</button></span>`);
        if (item.hasAttack)
          buttons.append(`<span class="tag"><button data-action="attack">${i18n("midi-qol.buttons.attack")}</button></span>`);
        if (item.hasDamage)
          buttons.append(`<span class="tag"><button data-action="damage">${i18n("midi-qol.buttons.damage")}</button></span>`);
        if (itemIsVersatile(item))
          buttons.append(`<span class="tag"><button data-action="versatileDamage">${i18n("midi-qol.buttons.versatileDamage")}</button></span>`);
        buttonsWereAdded = true;
        break;
      case "consumable":
        if (chatData.hasCharges)
          buttons.append(`<span class="tag"><button data-action="consume">${i18n("midi-qol.buttons.itemUse")} ${item.name}</button></span>`);
        buttonsWereAdded = true;
        break;
      case "tool":
        buttons.append(`<span class="tag"><button data-action="toolCheck" data-ability="${chatData.ability.value}">${i18n("midi-qol.buttons.itemUse")} ${item.name}</button></span>`);
        buttonsWereAdded = true;
        break;
    }
    buttons.append(`<span class="tag"><button data-action="info">${i18n("midi-qol.buttons.info")}</button></span>`);
    buttonsWereAdded = true;
    buttons.append(`<br><header style="margin-top:6px"></header>`);
    if (buttonsWereAdded) {
      // adding the buttons to the sheet
      targetHTML.find(buttonContainer).prepend(buttons);
      buttons.find("button").click({ app, data, html }, async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (debugEnabled > 1) debug("roll handler ", ev.target.dataset.action);
        // let event = { shiftKey: ev.shiftKey == true, ctrlKey: ev.ctrlKey === true, metaKey: ev.metaKey === true, altKey: ev.altKey === true };
        // If speed rolls are off
        switch (ev.target.dataset.action) {
          case "attack":
            await item.rollAttack({ event: ev, versatile: false, resetAdvantage: true, systemCard: true });
            break;
          case "damage":
            await item.rollDamage({ event: ev, versatile: false, systemCard: true });
            break;
          case "versatileDamage":
            await item.rollDamage({ event: ev, versatile: true, systemCard: true });
            break;
          case "consume":
            await item.use({ event: ev, systemCard: true }, {});
            break;
          case "toolCheck":
            await item.rollToolCheck({ event: ev, systemCard: true });
            break;
          case "basicRoll":
            Workflow.removeWorkflow(item.uuid);
            item.use({}, { event: ev, configureDialog: true, systemCard: true });
            break;
          case "info":
            await showItemInfo.bind(item)();
        }
      })
    }
  });

}

function addTidy5eItemSheetButtons(app, html, data) {
  let actor = app.object;

  $('.tidy5e-sheet .inventory-list:not(favorites) .item').each(function () {

    let buttonContainer;
    //@ts-ignore version v10
    if (isNewerVersion(game.modules.get("tidy5e-sheet")?.version ?? "", "0.4.17"))
      buttonContainer = $(this).find(".mod-roll-buttons");
    else
      buttonContainer = $(this).find(".item-controls");
    // adding an event for when the description is shown
    let item = app.object.items.get($(this).attr("data-item-id"));
    if (!item)
      return;
    item.getChatData().then(chatData => {
      let buttonTarget = buttonContainer.find(".item-buttons");
      if (buttonTarget.length > 0)
        return; // already added buttons
      let buttonsWereAdded = false;
      // Create the buttons
      let buttons = $(`<div class="item-buttons"></div>`);
      switch (item.type) {
        case "weapon":
        case "spell":
        case "power":
        case "feat":
          buttons.append(`<a class="button" data-action="basicRoll" title="${i18n("midi-qol.buttons.roll")}"><i class="fas fa-comment-alt"></i> ${i18n("midi-qol.buttons.roll")}</a>`);
          if (item.hasAttack)
            buttons.append(`<a class="button" data-action="attack" title="Roll standard/advantage/disadvantage ${i18n("midi-qol.buttons.attack")}"><i class="fas fa-dice-d20"></i> ${i18n("midi-qol.buttons.attack")}</a>`);
          if (itemHasDamage(item))
            buttons.append(`<a class="button" data-action="damage" title="Roll ${i18n("midi-qol.buttons.damage")}"><i class="fas fa-dice-six"></i> ${i18n("midi-qol.buttons.damage")}</a>`);
          if (itemIsVersatile(item))
            buttons.append(`<a class="button" data-action="versatileDamage" title="Roll ${i18n("midi-qol.buttons.versatileDamage")}"><i class="fas fa-dice-six"></i> ${i18n("midi-qol.buttons.versatileDamage")}</a>`);
          buttonsWereAdded = true;
          break;
        case "consumable":
          if (chatData.hasCharges)
            buttons.append(`<a class="button" data-action="consume" title="${i18n("midi-qol.buttons.itemUse")} ${item.name}"><i class="fas fa-wine-bottle"></i> ${i18n("midi-qol.buttons.itemUse")} ${item.name}</a>`);
          buttonsWereAdded = true;
          break;
        case "tool":
          buttons.append(`<a class="button" data-action="toolCheck" data-ability="${chatData.ability.value}" title="${i18n("midi-qol.buttons.itemUse")} ${item.name}"><i class="fas fa-hammer"></i>  ${i18n("midi-qol.buttons.itemUse")} ${item.name}</a>`);
          buttonsWereAdded = true;
          break;
      }
      buttons.append(`<a class="button" data-action="info" title="${i18n("midi-qol.buttons.info")}"><i class="fas fa-info-circle"></i> ${i18n("midi-qol.buttons.info")}</a>`);
      buttonsWereAdded = true;
      if (buttonsWereAdded) {
        // adding the buttons to the sheet
        buttonContainer.prepend(buttons);
        buttons.find(".button").click({ app, data, html }, async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (debugEnabled > 1) debug("roll handler ", ev.target.dataset.action);
          let event = { shiftKey: ev.shiftKey, ctrlKey: ev.ctrlKey, metaKey: ev.metaKey, altKey: ev.altKey };
          // If speed rolls are off
          switch (ev.target.dataset.action) {
            case "attack":
              await item.rollAttack({ event, versatile: false, systemCard: true });
              break;
            case "damage":
              await item.rollDamage({ event, versatile: false, systemCard: true });
              break;
            case "versatileDamage":
              await item.rollDamage({ event, versatile: true, systemCard: true });
              break;
            case "consume":
              await item.use({ event, systemCard: true });
              break;
            case "toolCheck":
              await item.rollToolCheck({ event, systemCard: true });
              break;
            case "basicRoll":
              Workflow.removeWorkflow(item.uuid);
              item.use({}, { event, configureDialog: true, systemCard: true });
              break;
            case "info":
              await showItemInfo.bind(item)();
          }
        });
      }
    });
  });
}