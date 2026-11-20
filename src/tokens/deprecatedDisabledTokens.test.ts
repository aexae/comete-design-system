// Garde : les tokens disabled sémantiques sont dépréciés (tokens 0.24.1). Le
// disabled passe par l'opacité (`--<composant>-opacity-disabled`). Ce test fige
// les usages restants : aucun nouvel usage, et chaque composant migré sort de la
// liste. Liste vide = tokens supprimables dans comete-design-tokens.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { listSourceFiles } from "./cssTokens.testUtils";

const DEPRECATED_TOKENS = [
  "--background-disabled-default",
  "--text-disabled",
  "--border-disabled",
  "--icon-disabled",
];

/** Usages restants par fichier (relevé du 2026-11-19, 73 usages). */
const REMAINING_USAGES: Record<string, number> = {
  "src/components/Accordion/Accordion.module.css": 2,
  "src/components/Badge/Badge.module.css": 2,
  "src/components/Calendar/CalendarCell.module.css": 2,
  "src/components/Calendar/TimeCalendar.module.css": 1,
  "src/components/Calendar/TimeDrumPicker.module.css": 2,
  "src/components/Calendar/WeekGrid.module.css": 1,
  "src/components/Card/Card.module.css": 9,
  "src/components/Checkbox/Checkbox.module.css": 4,
  "src/components/DatePicker/DatePicker.module.css": 3,
  "src/components/InputContainer/InputContainer.module.css": 1,
  "src/components/List/List.module.css": 5,
  "src/components/Menu/Menu.module.css": 5,
  "src/components/MonthPicker/MonthPicker.module.css": 5,
  "src/components/Radio/Radio.module.css": 3,
  "src/components/Select/Select.module.css": 3,
  "src/components/SideNav/SideNav.module.css": 2,
  "src/components/Stepper/Stepper.module.css": 3,
  "src/components/Switch/Switch.module.css": 3,
  "src/components/Table/TablePager.module.css": 1,
  "src/components/Tabs/Tabs.module.css": 2,
  "src/components/Text/Text.module.css": 1,
  "src/components/TextField/TextField.module.css": 2,
  "src/components/TimePicker/TimePicker.module.css": 3,
  "src/components/ToggleButtonGroup/ToggleButtonGroup.module.css": 3,
  "src/components/WeekPicker/WeekPicker.module.css": 2,
  "src/components/YearPicker/YearPicker.module.css": 2,
};

const USAGE = new RegExp(`var\\(\\s*(?:${DEPRECATED_TOKENS.join("|")})(?![\\w-])`, "g");

function countUsages(path: string): number {
  const code = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  return code.match(USAGE)?.length ?? 0;
}

describe("tokens disabled dépréciés", () => {
  it("should not gain new usages (migrate to --<component>-opacity-disabled)", () => {
    const files = listSourceFiles(
      (path) => /\.(css|tsx?)$/.test(path) && !/\.(test\.tsx?|d\.ts)$/.test(path)
    );
    const actual: Record<string, number> = {};
    for (const path of files) {
      const count = countUsages(path);
      if (count > 0) actual[path] = count;
    }
    // Un écart dans un sens ou dans l'autre fait échouer : nouvel usage
    // interdit, et une migration doit retirer ou baisser l'entrée ci-dessus.
    expect(actual).toEqual(REMAINING_USAGES);
  });
});
