import { $ } from "bun";

type Space = {
	id: number;
	uuid: string;
	index: number;
	label: string;
	type: string;
	display: number;
	windows: number[];
	"first-window": number;
	"last-window": number;
	"has-focus": boolean;
	"is-visible": boolean;
	"is-native-fullscreen": boolean;
};

function getSpaces(): Promise<Space[]> {
	return $`yabai -m query --spaces`.json();
}
let spaces = await getSpaces();

console.log("Checking for empty spaces to destroy...");
for (const space of spaces.reverse()) {
	// Every empty space that is not in fullscreen mode and does not have focus, destroy it
	if (space.windows.length === 0 && !space["is-native-fullscreen"]) {
		console.log(`Destroying empty space ${space.index}`);
		await $`yabai -m space ${space.index} --destroy`;
	}
}

// Update spaces
spaces = await getSpaces();

for (const space of spaces) {
	if (space.windows.length === 1) {
		// Balance the space if it has only one window
		console.log(`Balancing space ${space.index} with one window`);
		await $`yabai -m space ${space.index} --balance x-axis`;
	}
}

console.log("Done.");

await $`sketchybar --update`;
