import { waitForElement, type MyKittyActivity } from "@/libmykitty";
import { BC_SDK, MOD_NAME } from "./storage";

const insertActivityButton = (name: string, id: string, src: string, onClick?: (player: Character, group: AssetGroupItemName) => void): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = id;
  button.name = `${MOD_NAME}_${name}`;
  button.dataset.group = "ItemArms";
  button.className = `blank-button button button-styling HideOnPopup dialog-grid-button`;
  button.innerHTML = `<img decoding="async" loading="lazy" src="${src}" class="button-image"><span class="button-label button-label-bottom">${name}</span>`;

  button.addEventListener("click", (e) => {
    const player = CurrentCharacter ?? Player;
    const focusGroup = player?.FocusGroup?.Name;
    if (!onClick || !focusGroup) return;
    onClick(player, focusGroup);
    DialogLeave();
  });

  return button;
};

const activityInGroup = (activity: MyKittyActivity, group: AssetGroupItemName): boolean => {
  return Boolean(activity.Target?.includes(group) || (activity.TargetSelf?.includes(group) && Player.MemberNumber === CurrentCharacter?.MemberNumber));
};
const activityIsInserted = (id: string): boolean => {
  return Boolean(document.getElementById(id));
};
const activityFitsCriteria = (activity: MyKittyActivity, player: Character): boolean => {
  if (!player) {
    return false;
  }
  return Boolean((!activity.Criteria || activity.Criteria(player)) && player.FocusGroup && activityInGroup(activity, player.FocusGroup.Name));
};
const activities: MyKittyActivity[] = [];
export const registerActivity = (activity: MyKittyActivity) => activities.push(activity);

export function EnableActivities() {
  BC_SDK.hookFunction("DialogMenuMapping.activities.GetClickStatus", 1, (args, next) => {
    const [_C, _clickedObj, _equippedItem] = args;
    if (!_clickedObj) return null;
    return next(args);
  });

  BC_SDK.hookFunction("DialogChangeMode", 1, async (args, next) => {
    const [_mode] = args;
    next(args);
    if (_mode !== "activities") return;

    const activityGrid = await waitForElement("#dialog-activity-grid");
    const focusGroup = CurrentCharacter?.FocusGroup?.Name;
    if (!focusGroup) return;

    for (const activity of activities) {
      if (!activity) continue;

      if (activityFitsCriteria(activity, CurrentCharacter ?? Player)) {
        if (!activityIsInserted(activity.ID)) {
          activityGrid.appendChild(insertActivityButton(activity.Name, activity.ID, activity.Image, activity.OnClick));
        }
      }
    }
  });
}
