// Shared plan coordinates, 64 units/metre. Bed width confirmed; cabinet allocation provisional.
export const masterLayout = {
 mattressNorth: 208, mattressWidth: 1.8 * 64,
 frameNorth: 207, frameSouth: 208 + 1.8 * 64 + 1,
 wardrobeFront: 795, wardrobeBack: 832, bayFront: 429.24,
 bedsideWidth: 57, gap: .02 * 64,
};
masterLayout.bedsideStart = masterLayout.frameSouth + masterLayout.gap;
masterLayout.bedsideEnd = masterLayout.bedsideStart + masterLayout.bedsideWidth;
