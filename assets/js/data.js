/* UrbanBike Hub: the demo catalog.
 *
 * Everything here is illustrative. The bikes are named and described only from what their photos show,
 * and the prices are demo values, not real prices. No specifications are listed because none are verified.
 */
(function () {
  "use strict";

  var styles = [
    {
      id: "cafe-racer",
      name: "Café racer",
      single: "café racer",
      plural: "café racers",
      blurb: "Stripped-back bikes with a round headlight and a short seat, a look that goes back to 1960s Britain."
    },
    {
      id: "sport",
      name: "Sport",
      single: "sport bike",
      plural: "sport bikes",
      blurb: "Fully faired bikes with a forward, tucked-in riding position."
    },
    {
      id: "power-cruiser",
      name: "Power cruiser",
      single: "power cruiser",
      plural: "power cruisers",
      blurb: "Long, low cruisers with a muscular stance and a wide rear tyre."
    },
    {
      id: "roadster",
      name: "Roadster",
      single: "roadster",
      plural: "roadsters",
      blurb: "Naked bikes with no fairing and wide, upright handlebars."
    }
  ];

  // image.fit: "contain" for studio cut-outs, "cover" for photos taken on the road.
  var bikes = [
    {
      id: "teal-cafe-racer",
      name: "Teal Café Racer",
      style: "cafe-racer",
      colour: "Teal",
      price: 1240000,
      hero: true,
      image: { src: "assets/img/bikes/teal-cafe-racer.webp", width: 399, height: 343, fit: "contain" },
      alt: "Teal café racer with a small fairing around its round headlight, four chrome exhaust pipes and a black seat, seen from the front left",
      summary: "Teal café racer with a headlight cowl and four chrome pipes.",
      description: "A café racer finished in teal, with a small fairing wrapped around its round headlight. Four chrome exhaust pipes curve down from the engine, and the black seat ends in a short tail.",
      features: ["Small fairing around a round headlight", "Four chrome exhaust pipes", "Black seat with a short tail"]
    },
    {
      id: "red-cafe-racer",
      name: "Red Café Racer",
      style: "cafe-racer",
      colour: "Red",
      price: 1180000,
      hero: true,
      image: { src: "assets/img/bikes/red-cafe-racer.webp", width: 322, height: 336, fit: "contain" },
      alt: "Café racer with an exposed red tubular frame, a round headlight in a red shell and a quilted dark seat, seen from the front left",
      summary: "Café racer with an exposed red frame and a quilted seat.",
      description: "This café racer puts its red tubular frame on show. A round headlight sits in a matching red shell, the seat is quilted and dark, and the front tyre is noticeably wide.",
      features: ["Exposed red tubular frame", "Round headlight in a red shell", "Quilted dark seat"]
    },
    {
      id: "orange-sport",
      name: "Orange Sport",
      style: "sport",
      colour: "Orange",
      price: 1560000,
      hero: true,
      image: { src: "assets/img/bikes/orange-sport.webp", width: 417, height: 330, fit: "contain" },
      alt: "Orange sport bike with a full fairing, twin headlights, a tinted windscreen and a black split seat, seen from the front left",
      summary: "Fully faired sport bike in orange with twin headlights.",
      description: "A sport bike with full orange bodywork and black lower panels. Twin headlights sit under a tinted windscreen, and the seat steps up to a raised passenger section.",
      features: ["Full orange fairing with black lower panels", "Twin headlights and a tinted windscreen", "Split seat with a raised passenger section"]
    },
    {
      id: "slate-roadster",
      name: "Slate Roadster",
      style: "roadster",
      colour: "Slate blue",
      price: 1890000,
      hero: true,
      image: { src: "assets/img/bikes/slate-roadster.webp", width: 369, height: 344, fit: "contain" },
      alt: "Slate-blue roadster with a round headlight, finned silver side panels, wide handlebars and a brown seat, seen from the front left",
      summary: "Slate-blue roadster with finned side panels and a brown seat.",
      description: "A roadster with no fairing, finished in slate blue. It has a round headlight in a small cowl, finned silver panels along the side, wide handlebars and a brown seat.",
      features: ["Round headlight in a small cowl", "Finned silver panels along the side", "Wide handlebars and a brown seat"]
    },
    {
      id: "white-blue-sport",
      name: "White & Blue Sport",
      style: "sport",
      colour: "White and blue",
      price: 495000,
      hero: false,
      image: { src: "assets/img/bikes/white-blue-sport.webp", width: 288, height: 243, fit: "contain" },
      alt: "White sport bike with blue graphics and Yamaha lettering on its full fairing, twin headlights, a clear windscreen and a black split seat, seen from the front left",
      summary: "White and blue sport bike with a full fairing.",
      description: "A sport bike in white with blue graphics. It has a full fairing, twin headlights under a clear windscreen, and a split black seat.",
      features: ["White fairing with blue graphics", "Twin headlights and a clear windscreen", "Split black seat"]
    },
    {
      id: "graphite-power-cruiser",
      name: "Graphite Power Cruiser",
      style: "power-cruiser",
      colour: "Dark grey",
      price: 2950000,
      hero: false,
      image: { src: "assets/img/bikes/graphite-power-cruiser.webp", width: 327, height: 246, fit: "cover" },
      alt: "Dark grey power cruiser with gold-coloured fork tubes and a wide rear tyre, standing on a mountain road",
      summary: "Dark grey power cruiser with gold-coloured forks.",
      description: "A long, low power cruiser in dark grey and black, with gold-coloured fork tubes and a wide rear tyre. The photo shows it on a mountain road.",
      features: ["Gold-coloured fork tubes", "Wide rear tyre", "Low seat"]
    },
    {
      id: "black-power-cruiser",
      name: "Black Power Cruiser",
      style: "power-cruiser",
      colour: "Black",
      price: 3120000,
      hero: false,
      image: { src: "assets/img/bikes/black-power-cruiser.webp", width: 327, height: 246, fit: "cover" },
      alt: "Rider in black gear leaning a black power cruiser into a bend on a country road",
      summary: "Black power cruiser with a feet-forward riding position.",
      description: "A black power cruiser with a grey tubular frame and a feet-forward riding position. The photo shows a rider leaning it into a bend.",
      features: ["Grey tubular frame", "Feet-forward footpegs", "Wide rear tyre"]
    }
  ];

  window.UBH = window.UBH || {};
  window.UBH.data = {
    styles: styles,
    bikes: bikes,
    currency: "৳", // ৳, Bangladeshi taka. All prices are demo values.
    maxQuantity: 5
  };
})();
