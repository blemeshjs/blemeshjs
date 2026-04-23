/**
 * An enum defining options for a location of an `Element`.
 *
 * The values are defined by Bluetooth SIG.
 *
 * Imported from:
 * [Assigned Numbers](https://www.bluetooth.com/specifications/assigned-numbers)
 * -> 2.4.2.1 Bluetooth SIG GATT Characteristic Presentation Format Description
 */
export enum Location {
  auxiliary = 0x0108,
  back = 0x0101,
  backup = 0x0107,
  bottom = 0x0103,
  eighteenth = 0x0012,
  eighth = 0x0008,
  eightieth = 0x0050,
  eightyEighth = 0x0058,
  eightyFifth = 0x0055,
  eightyFirst = 0x0051,
  eightyFourth = 0x0054,
  eightyNineth = 0x0059,
  eightySecond = 0x0052,
  eightySeventh = 0x0057,
  eightySixth = 0x0056,
  eightyThird = 0x0053,
  eleventh = 0x000b,
  external = 0x0110,
  fifteenth = 0x000f,
  fifth = 0x0005,
  fiftieth = 0x0032,
  fiftyEighth = 0x003a,
  fiftyFifth = 0x0037,
  fiftyFirst = 0x0033,
  fiftyFourth = 0x0036,
  fiftyNineth = 0x003b,
  fiftySecond = 0x0034,
  fiftySeventh = 0x0039,
  fiftySixth = 0x0038,
  fiftyThird = 0x0035,
  first = 0x0001,
  flash = 0x010a,
  fortieth = 0x0028,
  fourteenth = 0x000e,
  fourth = 0x0004,
  fourtyEighth = 0x0030,
  fourtyFifth = 0x002d,
  fourtyFirst = 0x0029,
  fourtyFourth = 0x002c,
  fourtyNineth = 0x0031,
  fourtySecond = 0x002a,
  fourtySeventh = 0x002f,
  fourtySixth = 0x002e,
  fourtyThird = 0x002b,
  front = 0x0100,
  inside = 0x010b,
  internal = 0x010f,
  left = 0x010d,
  lower = 0x0105,
  main = 0x0106,
  nineteenth = 0x0013,
  nineth = 0x0009,
  ninetieth = 0x005a,
  ninetyEighth = 0x0062,
  ninetyFifth = 0x005f,
  ninetyFirst = 0x005b,
  ninetyFourth = 0x005e,
  ninetyNineth = 0x0063,
  ninetySecond = 0x005c,
  ninetySeventh = 0x0061,
  ninetySixth = 0x0060,
  ninetyThird = 0x005d,
  oneHundredAndEighteenth = 0x0076,
  oneHundredAndEighth = 0x006c,
  oneHundredAndEightyEighth = 0x00bc,
  oneHundredAndEightyFifth = 0x00b9,
  oneHundredAndEightyFirst = 0x00b5,
  oneHundredAndEightyFourth = 0x00b8,
  oneHundredAndEightyNineth = 0x00bd,
  oneHundredAndEightySecond = 0x00b6,
  oneHundredAndEightySeventh = 0x00bb,
  oneHundredAndEightySixth = 0x00ba,
  oneHundredAndEightyThird = 0x00b7,
  oneHundredAndEleventh = 0x006f,
  oneHundredAndFifteenth = 0x0073,
  oneHundredAndFifth = 0x0069,
  oneHundredAndFiftyEighth = 0x009e,
  oneHundredAndFiftyFifth = 0x009b,
  oneHundredAndFiftyFirst = 0x0097,
  oneHundredAndFiftyFourth = 0x009a,
  oneHundredAndFiftyNineth = 0x009f,
  oneHundredAndFiftySecond = 0x0098,
  oneHundredAndFiftySeventh = 0x009d,
  oneHundredAndFiftySixth = 0x009c,
  oneHundredAndFiftyThird = 0x0099,
  oneHundredAndFirst = 0x0065,
  oneHundredAndFourteenth = 0x0072,
  oneHundredAndFourth = 0x0068,
  oneHundredAndFourtyEighth = 0x0094,
  oneHundredAndFourtyFifth = 0x0091,
  oneHundredAndFourtyFirst = 0x008d,
  oneHundredAndFourtyFourth = 0x0090,
  oneHundredAndFourtyNineth = 0x0095,
  oneHundredAndFourtySecond = 0x008e,
  oneHundredAndFourtySeventh = 0x0093,
  oneHundredAndFourtySixth = 0x0092,
  oneHundredAndFourtyThird = 0x008f,
  oneHundredAndNineteenth = 0x0077,
  oneHundredAndNineth = 0x006d,
  oneHundredAndNinetyEighth = 0x00c6,
  oneHundredAndNinetyFifth = 0x00c3,
  oneHundredAndNinetyFirst = 0x00bf,
  oneHundredAndNinetyFourth = 0x00c2,
  oneHundredAndNinetyNineth = 0x00c7,
  oneHundredAndNinetySecond = 0x00c0,
  oneHundredAndNinetySeventh = 0x00c5,
  oneHundredAndNinetySixth = 0x00c4,
  oneHundredAndNinetyThird = 0x00c1,
  oneHundredAndSecond = 0x0066,
  oneHundredAndSeventeenth = 0x0075,
  oneHundredAndSeventh = 0x006b,
  oneHundredAndSeventyEighth = 0x00b2,
  oneHundredAndSeventyFifth = 0x00af,
  oneHundredAndSeventyFirst = 0x00ab,
  oneHundredAndSeventyFourth = 0x00ae,
  oneHundredAndSeventyNineth = 0x00b3,
  oneHundredAndSeventySecond = 0x00ac,
  oneHundredAndSeventySeventh = 0x00b1,
  oneHundredAndSeventySixth = 0x00b0,
  oneHundredAndSeventyThird = 0x00ad,
  oneHundredAndSixteenth = 0x0074,
  oneHundredAndSixth = 0x006a,
  oneHundredAndSixtyEighth = 0x00a8,
  oneHundredAndSixtyFifth = 0x00a5,
  oneHundredAndSixtyFirst = 0x00a1,
  oneHundredAndSixtyFourth = 0x00a4,
  oneHundredAndSixtyNineth = 0x00a9,
  oneHundredAndSixtySecond = 0x00a2,
  oneHundredAndSixtySeventh = 0x00a7,
  oneHundredAndSixtySixth = 0x00a6,
  oneHundredAndSixtyThird = 0x00a3,
  oneHundredAndTenth = 0x006e,
  oneHundredAndThird = 0x0067,
  oneHundredAndThirteenth = 0x0071,
  oneHundredAndThirtyEighth = 0x008a,
  oneHundredAndThirtyFifth = 0x0087,
  oneHundredAndThirtyFirst = 0x0083,
  oneHundredAndThirtyFourth = 0x0086,
  oneHundredAndThirtyNineth = 0x008b,
  oneHundredAndThirtySecond = 0x0084,
  oneHundredAndThirtySeventh = 0x0089,
  oneHundredAndThirtySixth = 0x0088,
  oneHundredAndThirtyThird = 0x0085,
  oneHundredAndTwelveth = 0x0070,
  oneHundredAndTwentyEighth = 0x0080,
  oneHundredAndTwentyFifth = 0x007d,
  oneHundredAndTwentyFirst = 0x0079,
  oneHundredAndTwentyFourth = 0x007c,
  oneHundredAndTwentyNineth = 0x0081,
  oneHundredAndTwentySecond = 0x007a,
  oneHundredAndTwentySeventh = 0x007f,
  oneHundredAndTwentySixth = 0x007e,
  oneHundredAndTwentyThird = 0x007b,
  oneHundredEightieth = 0x00b4,
  oneHundredFiftieth = 0x0096,
  oneHundredFortieth = 0x008c,
  oneHundredNinetieth = 0x00be,
  oneHundredSeventieth = 0x00aa,
  oneHundredSixtieth = 0x00a0,
  oneHundredThirtieth = 0x0082,
  oneHundredTwentieth = 0x0078,
  oneHundredth = 0x0064,
  outside = 0x010c,
  right = 0x010e,
  second = 0x0002,
  seventeenth = 0x0011,
  seventh = 0x0007,
  seventieth = 0x0046,
  seventyEighth = 0x004e,
  seventyFifth = 0x004b,
  seventyFirst = 0x0047,
  seventyFourth = 0x004a,
  seventyNineth = 0x004f,
  seventySecond = 0x0048,
  seventySeventh = 0x004d,
  seventySixth = 0x004c,
  seventyThird = 0x0049,
  sixteenth = 0x0010,
  sixth = 0x0006,
  sixtieth = 0x003c,
  sixtyEighth = 0x0044,
  sixtyFifth = 0x0041,
  sixtyFirst = 0x003d,
  sixtyFourth = 0x0040,
  sixtyNineth = 0x0045,
  sixtySecond = 0x003e,
  sixtySeventh = 0x0043,
  sixtySixth = 0x0042,
  sixtyThird = 0x003f,
  supplementary = 0x0109,
  tenth = 0x000a,
  third = 0x0003,
  thirteenth = 0x000d,
  thirtieth = 0x001e,
  thirtyEighth = 0x0026,
  thirtyFifth = 0x0023,
  thirtyFirst = 0x001f,
  thirtyFourth = 0x0022,
  thirtyNineth = 0x0027,
  thirtySecond = 0x0020,
  thirtySeventh = 0x0025,
  thirtySixth = 0x0024,
  thirtyThird = 0x0021,
  top = 0x0102,
  twelveth = 0x000c,
  twentieth = 0x0014,
  twentyEighth = 0x001c,
  twentyFifth = 0x0019,
  twentyFirst = 0x0015,
  twentyFourth = 0x0018,
  twentyNineth = 0x001d,
  twentySecond = 0x0016,
  twentySeventh = 0x001b,
  twentySixth = 0x001a,
  twentyThird = 0x0017,
  twoHundredAndEighteenth = 0x00da,
  twoHundredAndEighth = 0x00d0,
  twoHundredAndEleventh = 0x00d3,
  twoHundredAndFifteenth = 0x00d7,
  twoHundredAndFifth = 0x00cd,
  twoHundredAndFiftyFifth = 0x00ff,
  twoHundredAndFiftyFirst = 0x00fb,
  twoHundredAndFiftyFourth = 0x00fe,
  twoHundredAndFiftySecond = 0x00fc,
  twoHundredAndFiftyThird = 0x00fd,
  twoHundredAndFirst = 0x00c9,
  twoHundredAndFourteenth = 0x00d6,
  twoHundredAndFourth = 0x00cc,
  twoHundredAndFourtyEighth = 0x00f8,
  twoHundredAndFourtyFifth = 0x00f5,
  twoHundredAndFourtyFirst = 0x00f1,
  twoHundredAndFourtyFourth = 0x00f4,
  twoHundredAndFourtyNineth = 0x00f9,
  twoHundredAndFourtySecond = 0x00f2,
  twoHundredAndFourtySeventh = 0x00f7,
  twoHundredAndFourtySixth = 0x00f6,
  twoHundredAndFourtyThird = 0x00f3,
  twoHundredAndNineteenth = 0x00db,
  twoHundredAndNineth = 0x00d1,
  twoHundredAndSecond = 0x00ca,
  twoHundredAndSeventeenth = 0x00d9,
  twoHundredAndSeventh = 0x00cf,
  twoHundredAndSixteenth = 0x00d8,
  twoHundredAndSixth = 0x00ce,
  twoHundredAndTenth = 0x00d2,
  twoHundredAndThird = 0x00cb,
  twoHundredAndThirteenth = 0x00d5,
  twoHundredAndThirtyEighth = 0x00ee,
  twoHundredAndThirtyFifth = 0x00eb,
  twoHundredAndThirtyFirst = 0x00e7,
  twoHundredAndThirtyFourth = 0x00ea,
  twoHundredAndThirtyNineth = 0x00ef,
  twoHundredAndThirtySecond = 0x00e8,
  twoHundredAndThirtySeventh = 0x00ed,
  twoHundredAndThirtySixth = 0x00ec,
  twoHundredAndThirtyThird = 0x00e9,
  twoHundredAndTwelveth = 0x00d4,
  twoHundredAndTwentyEighth = 0x00e4,
  twoHundredAndTwentyFifth = 0x00e1,
  twoHundredAndTwentyFirst = 0x00dd,
  twoHundredAndTwentyFourth = 0x00e0,
  twoHundredAndTwentyNineth = 0x00e5,
  twoHundredAndTwentySecond = 0x00de,
  twoHundredAndTwentySeventh = 0x00e3,
  twoHundredAndTwentySixth = 0x00e2,
  twoHundredAndTwentyThird = 0x00df,
  twoHundredFiftieth = 0x00fa,
  twoHundredFortieth = 0x00f0,
  twoHundredThirtieth = 0x00e6,
  twoHundredTwentieth = 0x00dc,
  twoHundredth = 0x00c8,
  unknown = 0x0000,
  upper = 0x0104,
}
export namespace Location {
  export function toString(location: Location): string {
    switch (location) {
      case Location.auxiliary:
        return "Auxiliary";
      case Location.back:
        return "Back";
      case Location.backup:
        return "Backup";
      case Location.bottom:
        return "Bottom";
      case Location.eighteenth:
        return "Eighteenth";
      case Location.eighth:
        return "Eighth";
      case Location.eightieth:
        return "Eightieth";
      case Location.eightyEighth:
        return "Eighty-eighth";
      case Location.eightyFifth:
        return "Eighty-fifth";
      case Location.eightyFirst:
        return "Eighty-first";
      case Location.eightyFourth:
        return "Eighty-fourth";
      case Location.eightyNineth:
        return "Eighty-nineth";
      case Location.eightySecond:
        return "Eighty-second";
      case Location.eightySeventh:
        return "Eighty-seventh";
      case Location.eightySixth:
        return "Eighty-sixth";
      case Location.eightyThird:
        return "Eighty-third";
      case Location.eleventh:
        return "Eleventh";
      case Location.external:
        return "External";
      case Location.fifteenth:
        return "Fifteenth";
      case Location.fifth:
        return "Fifth";
      case Location.fiftieth:
        return "Fiftieth";
      case Location.fiftyEighth:
        return "Fifty-eighth";
      case Location.fiftyFifth:
        return "Fifty-fifth";
      case Location.fiftyFirst:
        return "Fifty-first";
      case Location.fiftyFourth:
        return "Fifty-fourth";
      case Location.fiftyNineth:
        return "Fifty-nineth";
      case Location.fiftySecond:
        return "Fifty-second";
      case Location.fiftySeventh:
        return "Fifty-seventh";
      case Location.fiftySixth:
        return "Fifty-sixth";
      case Location.fiftyThird:
        return "Fifty-third";
      case Location.first:
        return "First";
      case Location.flash:
        return "Flash";
      case Location.fortieth:
        return "Fortieth";
      case Location.fourteenth:
        return "Fourteenth";
      case Location.fourth:
        return "Fourth";
      case Location.fourtyEighth:
        return "Fourty-eighth";
      case Location.fourtyFifth:
        return "Fourty-fifth";
      case Location.fourtyFirst:
        return "Fourty-first";
      case Location.fourtyFourth:
        return "Fourty-fourth";
      case Location.fourtyNineth:
        return "Fourty-nineth";
      case Location.fourtySecond:
        return "Fourty-second";
      case Location.fourtySeventh:
        return "Fourty-seventh";
      case Location.fourtySixth:
        return "Fourty-sixth";
      case Location.fourtyThird:
        return "Fourty-third";
      case Location.front:
        return "Front";
      case Location.inside:
        return "Inside";
      case Location.internal:
        return "Internal";
      case Location.left:
        return "Left";
      case Location.lower:
        return "Lower";
      case Location.main:
        return "Main";
      case Location.nineteenth:
        return "Nineteenth";
      case Location.nineth:
        return "Nineth";
      case Location.ninetieth:
        return "Ninetieth";
      case Location.ninetyEighth:
        return "Ninety-eighth";
      case Location.ninetyFifth:
        return "Ninety-fifth";
      case Location.ninetyFirst:
        return "Ninety-first";
      case Location.ninetyFourth:
        return "Ninety-fourth";
      case Location.ninetyNineth:
        return "Ninety-nineth";
      case Location.ninetySecond:
        return "Ninety-second";
      case Location.ninetySeventh:
        return "Ninety-seventh";
      case Location.ninetySixth:
        return "Ninety-sixth";
      case Location.ninetyThird:
        return "Ninety-third";
      case Location.oneHundredAndEighteenth:
        return "One-hundred-and-eighteenth";
      case Location.oneHundredAndEighth:
        return "One-hundred-and-eighth";
      case Location.oneHundredAndEightyEighth:
        return "One-hundred-and-eighty-eighth";
      case Location.oneHundredAndEightyFifth:
        return "One-hundred-and-eighty-fifth";
      case Location.oneHundredAndEightyFirst:
        return "One-hundred-and-eighty-first";
      case Location.oneHundredAndEightyFourth:
        return "One-hundred-and-eighty-fourth";
      case Location.oneHundredAndEightyNineth:
        return "One-hundred-and-eighty-nineth";
      case Location.oneHundredAndEightySecond:
        return "One-hundred-and-eighty-second";
      case Location.oneHundredAndEightySeventh:
        return "One-hundred-and-eighty-seventh";
      case Location.oneHundredAndEightySixth:
        return "One-hundred-and-eighty-sixth";
      case Location.oneHundredAndEightyThird:
        return "One-hundred-and-eighty-third";
      case Location.oneHundredAndEleventh:
        return "One-hundred-and-eleventh";
      case Location.oneHundredAndFifteenth:
        return "One-hundred-and-fifteenth";
      case Location.oneHundredAndFifth:
        return "One-hundred-and-fifth";
      case Location.oneHundredAndFiftyEighth:
        return "One-hundred-and-fifty-eighth";
      case Location.oneHundredAndFiftyFifth:
        return "One-hundred-and-fifty-fifth";
      case Location.oneHundredAndFiftyFirst:
        return "One-hundred-and-fifty-first";
      case Location.oneHundredAndFiftyFourth:
        return "One-hundred-and-fifty-fourth";
      case Location.oneHundredAndFiftyNineth:
        return "One-hundred-and-fifty-nineth";
      case Location.oneHundredAndFiftySecond:
        return "One-hundred-and-fifty-second";
      case Location.oneHundredAndFiftySeventh:
        return "One-hundred-and-fifty-seventh";
      case Location.oneHundredAndFiftySixth:
        return "One-hundred-and-fifty-sixth";
      case Location.oneHundredAndFiftyThird:
        return "One-hundred-and-fifty-third";
      case Location.oneHundredAndFirst:
        return "One-hundred-and-first";
      case Location.oneHundredAndFourteenth:
        return "One-hundred-and-fourteenth";
      case Location.oneHundredAndFourth:
        return "One-hundred-and-fourth";
      case Location.oneHundredAndFourtyEighth:
        return "One-hundred-and-fourty-eighth";
      case Location.oneHundredAndFourtyFifth:
        return "One-hundred-and-fourty-fifth";
      case Location.oneHundredAndFourtyFirst:
        return "One-hundred-and-fourty-first";
      case Location.oneHundredAndFourtyFourth:
        return "One-hundred-and-fourty-fourth";
      case Location.oneHundredAndFourtyNineth:
        return "One-hundred-and-fourty-nineth";
      case Location.oneHundredAndFourtySecond:
        return "One-hundred-and-fourty-second";
      case Location.oneHundredAndFourtySeventh:
        return "One-hundred-and-fourty-seventh";
      case Location.oneHundredAndFourtySixth:
        return "One-hundred-and-fourty-sixth";
      case Location.oneHundredAndFourtyThird:
        return "One-hundred-and-fourty-third";
      case Location.oneHundredAndNineteenth:
        return "One-hundred-and-nineteenth";
      case Location.oneHundredAndNineth:
        return "One-hundred-and-nineth";
      case Location.oneHundredAndNinetyEighth:
        return "One-hundred-and-ninety-eighth";
      case Location.oneHundredAndNinetyFifth:
        return "One-hundred-and-ninety-fifth";
      case Location.oneHundredAndNinetyFirst:
        return "One-hundred-and-ninety-first";
      case Location.oneHundredAndNinetyFourth:
        return "One-hundred-and-ninety-fourth";
      case Location.oneHundredAndNinetyNineth:
        return "One-hundred-and-ninety-nineth";
      case Location.oneHundredAndNinetySecond:
        return "One-hundred-and-ninety-second";
      case Location.oneHundredAndNinetySeventh:
        return "One-hundred-and-ninety-seventh";
      case Location.oneHundredAndNinetySixth:
        return "One-hundred-and-ninety-sixth";
      case Location.oneHundredAndNinetyThird:
        return "One-hundred-and-ninety-third";
      case Location.oneHundredAndSecond:
        return "One-hundred-and-second";
      case Location.oneHundredAndSeventeenth:
        return "One-hundred-and-seventeenth";
      case Location.oneHundredAndSeventh:
        return "One-hundred-and-seventh";
      case Location.oneHundredAndSeventyEighth:
        return "One-hundred-and-seventy-eighth";
      case Location.oneHundredAndSeventyFifth:
        return "One-hundred-and-seventy-fifth";
      case Location.oneHundredAndSeventyFirst:
        return "One-hundred-and-seventy-first";
      case Location.oneHundredAndSeventyFourth:
        return "One-hundred-and-seventy-fourth";
      case Location.oneHundredAndSeventyNineth:
        return "One-hundred-and-seventy-nineth";
      case Location.oneHundredAndSeventySecond:
        return "One-hundred-and-seventy-second";
      case Location.oneHundredAndSeventySeventh:
        return "One-hundred-and-seventy-seventh";
      case Location.oneHundredAndSeventySixth:
        return "One-hundred-and-seventy-sixth";
      case Location.oneHundredAndSeventyThird:
        return "One-hundred-and-seventy-third";
      case Location.oneHundredAndSixteenth:
        return "One-hundred-and-sixteenth";
      case Location.oneHundredAndSixth:
        return "One-hundred-and-sixth";
      case Location.oneHundredAndSixtyEighth:
        return "One-hundred-and-sixty-eighth";
      case Location.oneHundredAndSixtyFifth:
        return "One-hundred-and-sixty-fifth";
      case Location.oneHundredAndSixtyFirst:
        return "One-hundred-and-sixty-first";
      case Location.oneHundredAndSixtyFourth:
        return "One-hundred-and-sixty-fourth";
      case Location.oneHundredAndSixtyNineth:
        return "One-hundred-and-sixty-nineth";
      case Location.oneHundredAndSixtySecond:
        return "One-hundred-and-sixty-second";
      case Location.oneHundredAndSixtySeventh:
        return "One-hundred-and-sixty-seventh";
      case Location.oneHundredAndSixtySixth:
        return "One-hundred-and-sixty-sixth";
      case Location.oneHundredAndSixtyThird:
        return "One-hundred-and-sixty-third";
      case Location.oneHundredAndTenth:
        return "One-hundred-and-tenth";
      case Location.oneHundredAndThird:
        return "One-hundred-and-third";
      case Location.oneHundredAndThirteenth:
        return "One-hundred-and-thirteenth";
      case Location.oneHundredAndThirtyEighth:
        return "One-hundred-and-thirty-eighth";
      case Location.oneHundredAndThirtyFifth:
        return "One-hundred-and-thirty-fifth";
      case Location.oneHundredAndThirtyFirst:
        return "One-hundred-and-thirty-first";
      case Location.oneHundredAndThirtyFourth:
        return "One-hundred-and-thirty-fourth";
      case Location.oneHundredAndThirtyNineth:
        return "One-hundred-and-thirty-nineth";
      case Location.oneHundredAndThirtySecond:
        return "One-hundred-and-thirty-second";
      case Location.oneHundredAndThirtySeventh:
        return "One-hundred-and-thirty-seventh";
      case Location.oneHundredAndThirtySixth:
        return "One-hundred-and-thirty-sixth";
      case Location.oneHundredAndThirtyThird:
        return "One-hundred-and-thirty-third";
      case Location.oneHundredAndTwelveth:
        return "One-hundred-and-twelveth";
      case Location.oneHundredAndTwentyEighth:
        return "One-hundred-and-twenty-eighth";
      case Location.oneHundredAndTwentyFifth:
        return "One-hundred-and-twenty-fifth";
      case Location.oneHundredAndTwentyFirst:
        return "One-hundred-and-twenty-first";
      case Location.oneHundredAndTwentyFourth:
        return "One-hundred-and-twenty-fourth";
      case Location.oneHundredAndTwentyNineth:
        return "One-hundred-and-twenty-nineth";
      case Location.oneHundredAndTwentySecond:
        return "One-hundred-and-twenty-second";
      case Location.oneHundredAndTwentySeventh:
        return "One-hundred-and-twenty-seventh";
      case Location.oneHundredAndTwentySixth:
        return "One-hundred-and-twenty-sixth";
      case Location.oneHundredAndTwentyThird:
        return "One-hundred-and-twenty-third";
      case Location.oneHundredEightieth:
        return "One-hundred-eightieth";
      case Location.oneHundredFiftieth:
        return "One-hundred-fiftieth";
      case Location.oneHundredFortieth:
        return "One-hundred-fortieth";
      case Location.oneHundredNinetieth:
        return "One-hundred-ninetieth";
      case Location.oneHundredSeventieth:
        return "One-hundred-seventieth";
      case Location.oneHundredSixtieth:
        return "One-hundred-sixtieth";
      case Location.oneHundredThirtieth:
        return "One-hundred-thirtieth";
      case Location.oneHundredTwentieth:
        return "One-hundred-twentieth";
      case Location.oneHundredth:
        return "One-hundredth";
      case Location.outside:
        return "Outside";
      case Location.right:
        return "Right";
      case Location.second:
        return "Second";
      case Location.seventeenth:
        return "Seventeenth";
      case Location.seventh:
        return "Seventh";
      case Location.seventieth:
        return "Seventieth";
      case Location.seventyEighth:
        return "Seventy-eighth";
      case Location.seventyFifth:
        return "Seventy-fifth";
      case Location.seventyFirst:
        return "Seventy-first";
      case Location.seventyFourth:
        return "Seventy-fourth";
      case Location.seventyNineth:
        return "Seventy-nineth";
      case Location.seventySecond:
        return "Seventy-second";
      case Location.seventySeventh:
        return "Seventy-seventh";
      case Location.seventySixth:
        return "Seventy-sixth";
      case Location.seventyThird:
        return "Seventy-third";
      case Location.sixteenth:
        return "Sixteenth";
      case Location.sixth:
        return "Sixth";
      case Location.sixtieth:
        return "Sixtieth";
      case Location.sixtyEighth:
        return "Sixty-eighth";
      case Location.sixtyFifth:
        return "Sixty-fifth";
      case Location.sixtyFirst:
        return "Sixty-first";
      case Location.sixtyFourth:
        return "Sixty-fourth";
      case Location.sixtyNineth:
        return "Sixty-nineth";
      case Location.sixtySecond:
        return "Sixty-second";
      case Location.sixtySeventh:
        return "Sixty-seventh";
      case Location.sixtySixth:
        return "Sixty-sixth";
      case Location.sixtyThird:
        return "Sixty-third";
      case Location.supplementary:
        return "Supplementary";
      case Location.tenth:
        return "Tenth";
      case Location.third:
        return "Third";
      case Location.thirteenth:
        return "Thirteenth";
      case Location.thirtieth:
        return "Thirtieth";
      case Location.thirtyEighth:
        return "Thirty-eighth";
      case Location.thirtyFifth:
        return "Thirty-fifth";
      case Location.thirtyFirst:
        return "Thirty-first";
      case Location.thirtyFourth:
        return "Thirty-fourth";
      case Location.thirtyNineth:
        return "Thirty-nineth";
      case Location.thirtySecond:
        return "Thirty-second";
      case Location.thirtySeventh:
        return "Thirty-seventh";
      case Location.thirtySixth:
        return "Thirty-sixth";
      case Location.thirtyThird:
        return "Thirty-third";
      case Location.top:
        return "Top";
      case Location.twelveth:
        return "Twelveth";
      case Location.twentieth:
        return "Twentieth";
      case Location.twentyEighth:
        return "Twenty-eighth";
      case Location.twentyFifth:
        return "Twenty-fifth";
      case Location.twentyFirst:
        return "Twenty-first";
      case Location.twentyFourth:
        return "Twenty-fourth";
      case Location.twentyNineth:
        return "Twenty-nineth";
      case Location.twentySecond:
        return "Twenty-second";
      case Location.twentySeventh:
        return "Twenty-seventh";
      case Location.twentySixth:
        return "Twenty-sixth";
      case Location.twentyThird:
        return "Twenty-third";
      case Location.twoHundredAndEighteenth:
        return "Two-hundred-and-eighteenth";
      case Location.twoHundredAndEighth:
        return "Two-hundred-and-eighth";
      case Location.twoHundredAndEleventh:
        return "Two-hundred-and-eleventh";
      case Location.twoHundredAndFifteenth:
        return "Two-hundred-and-fifteenth";
      case Location.twoHundredAndFifth:
        return "Two-hundred-and-fifth";
      case Location.twoHundredAndFiftyFifth:
        return "Two-hundred-and-fifty-fifth";
      case Location.twoHundredAndFiftyFirst:
        return "Two-hundred-and-fifty-first";
      case Location.twoHundredAndFiftyFourth:
        return "Two-hundred-and-fifty-fourth";
      case Location.twoHundredAndFiftySecond:
        return "Two-hundred-and-fifty-second";
      case Location.twoHundredAndFiftyThird:
        return "Two-hundred-and-fifty-third";
      case Location.twoHundredAndFirst:
        return "Two-hundred-and-first";
      case Location.twoHundredAndFourteenth:
        return "Two-hundred-and-fourteenth";
      case Location.twoHundredAndFourth:
        return "Two-hundred-and-fourth";
      case Location.twoHundredAndFourtyEighth:
        return "Two-hundred-and-fourty-eighth";
      case Location.twoHundredAndFourtyFifth:
        return "Two-hundred-and-fourty-fifth";
      case Location.twoHundredAndFourtyFirst:
        return "Two-hundred-and-fourty-first";
      case Location.twoHundredAndFourtyFourth:
        return "Two-hundred-and-fourty-fourth";
      case Location.twoHundredAndFourtyNineth:
        return "Two-hundred-and-fourty-nineth";
      case Location.twoHundredAndFourtySecond:
        return "Two-hundred-and-fourty-second";
      case Location.twoHundredAndFourtySeventh:
        return "Two-hundred-and-fourty-seventh";
      case Location.twoHundredAndFourtySixth:
        return "Two-hundred-and-fourty-sixth";
      case Location.twoHundredAndFourtyThird:
        return "Two-hundred-and-fourty-third";
      case Location.twoHundredAndNineteenth:
        return "Two-hundred-and-nineteenth";
      case Location.twoHundredAndNineth:
        return "Two-hundred-and-nineth";
      case Location.twoHundredAndSecond:
        return "Two-hundred-and-second";
      case Location.twoHundredAndSeventeenth:
        return "Two-hundred-and-seventeenth";
      case Location.twoHundredAndSeventh:
        return "Two-hundred-and-seventh";
      case Location.twoHundredAndSixteenth:
        return "Two-hundred-and-sixteenth";
      case Location.twoHundredAndSixth:
        return "Two-hundred-and-sixth";
      case Location.twoHundredAndTenth:
        return "Two-hundred-and-tenth";
      case Location.twoHundredAndThird:
        return "Two-hundred-and-third";
      case Location.twoHundredAndThirteenth:
        return "Two-hundred-and-thirteenth";
      case Location.twoHundredAndThirtyEighth:
        return "Two-hundred-and-thirty-eighth";
      case Location.twoHundredAndThirtyFifth:
        return "Two-hundred-and-thirty-fifth";
      case Location.twoHundredAndThirtyFirst:
        return "Two-hundred-and-thirty-first";
      case Location.twoHundredAndThirtyFourth:
        return "Two-hundred-and-thirty-fourth";
      case Location.twoHundredAndThirtyNineth:
        return "Two-hundred-and-thirty-nineth";
      case Location.twoHundredAndThirtySecond:
        return "Two-hundred-and-thirty-second";
      case Location.twoHundredAndThirtySeventh:
        return "Two-hundred-and-thirty-seventh";
      case Location.twoHundredAndThirtySixth:
        return "Two-hundred-and-thirty-sixth";
      case Location.twoHundredAndThirtyThird:
        return "Two-hundred-and-thirty-third";
      case Location.twoHundredAndTwelveth:
        return "Two-hundred-and-twelveth";
      case Location.twoHundredAndTwentyEighth:
        return "Two-hundred-and-twenty-eighth";
      case Location.twoHundredAndTwentyFifth:
        return "Two-hundred-and-twenty-fifth";
      case Location.twoHundredAndTwentyFirst:
        return "Two-hundred-and-twenty-first";
      case Location.twoHundredAndTwentyFourth:
        return "Two-hundred-and-twenty-fourth";
      case Location.twoHundredAndTwentyNineth:
        return "Two-hundred-and-twenty-nineth";
      case Location.twoHundredAndTwentySecond:
        return "Two-hundred-and-twenty-second";
      case Location.twoHundredAndTwentySeventh:
        return "Two-hundred-and-twenty-seventh";
      case Location.twoHundredAndTwentySixth:
        return "Two-hundred-and-twenty-sixth";
      case Location.twoHundredAndTwentyThird:
        return "Two-hundred-and-twenty-third";
      case Location.twoHundredFiftieth:
        return "Two-hundred-fiftieth";
      case Location.twoHundredFortieth:
        return "Two-hundred-fortieth";
      case Location.twoHundredThirtieth:
        return "Two-hundred-thirtieth";
      case Location.twoHundredTwentieth:
        return "Two-hundred-twentieth";
      case Location.twoHundredth:
        return "Two-hundredth";
      case Location.unknown:
        return "Unknown";
      case Location.upper:
        return "Upper";
      default:
        return "Invalid value";
    }
  }
}
