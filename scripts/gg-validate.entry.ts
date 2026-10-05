import { GUARDS_GUARDS } from "../src/data/guardsGuards";
import { validateStory } from "../src/logic";

const issues = validateStory(GUARDS_GUARDS);
for (const i of issues) console.log(`${i.severity.toUpperCase()} [${i.sceneId ?? "story"}] ${i.message}`);
console.log(issues.length ? `${issues.length} issue(s)` : "CLEAN");
