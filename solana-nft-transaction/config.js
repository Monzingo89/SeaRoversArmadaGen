const layerConfigurations = [
    {
      growEditionSizeTo: 1,
      layersOrder: [
        { name: "Background" },
        { name: "Ship" },
        { name: "Sail" },
        { name: "Captain" },
        { name: "Crew" },
        { name: "Bow_Accessory" },
        { name: "Starboard" },
        { name: "Sea_Creature" },
        { name: "Seabed" },
      ],
    },
  ];

  const format = {
    width: 640,
    height: 640,
    smoothing: false,
  };

  module.exports = {
    format,
    layerConfigurations
  };