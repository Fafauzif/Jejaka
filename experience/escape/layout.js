/** Map-guided compressed district. Sources are preserved, never rewritten here.
 * Source-image west is presentation forward (game -Z), south is game -X (north is +X).
 * Every horizontal length is 50% of the kit's approximate local cartographic scale.
 * Road widths, heights, minor access lanes, people, props and damage are authored.
 */
export function sourcePixelToWorld(u,v) {
  if (!Number.isFinite(u)||!Number.isFinite(v)) throw new TypeError('Finite source pixels required');
  return {x:-(v-4330)*.595-20,z:(u-3050)*.595-196};
}
export function worldToSourcePixel(x,z) {
  if (!Number.isFinite(x)||!Number.isFinite(z)) throw new TypeError('Finite world coordinates required');
  return {u:(z+196)/.595+3050,v:4330-(x+20)/.595};
}
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export const DATA=freeze({
  "source": {
    "id": "M001",
    "image": "references/maps/Soerabaja_1943_original.jpg",
    "sha256": "3cc62f945bac6e82772fdd3b0bd52df256d1fdc61d4004e27f9a2cab9ae1e36a",
    "imageSize": [
      7452,
      10970
    ],
    "basis": "March1943 aerial revision; comparable BL firstedition catalogue[1944]",
    "sourceMetresPerPixel": 1.19,
    "distanceScale": 0.5,
    "worldMetresPerPixel": 0.595,
    "rotation": "map west is game−Z; map south is game−X; map north is game+X",
    "limitations": "coarse local cartographic interpretation; no EPSG/survey accuracy; not a map of exact1945 damage"
  },
  "roads": [
    {
      "id": "R_HEEREN",
      "label": "Heerenstraat",
      "sourcePixels": [
        [
          2460,
          4125
        ],
        [
          2700,
          4210
        ],
        [
          2915,
          4270
        ],
        [
          3020,
          4305
        ],
        [
          3050,
          4330
        ]
      ],
      "points": [
        {
          "x": 101.975,
          "z": -547.05
        },
        {
          "x": 51.4,
          "z": -404.25
        },
        {
          "x": 15.7,
          "z": -276.325
        },
        {
          "x": -5.125,
          "z": -213.85
        },
        {
          "x": -20.0,
          "z": -196.0
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 8,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_KEMBANG",
      "label": "Kembang Djepoen",
      "sourcePixels": [
        [
          3095,
          4330
        ],
        [
          3240,
          4370
        ],
        [
          3400,
          4400
        ],
        [
          3540,
          4440
        ]
      ],
      "points": [
        {
          "x": -20.0,
          "z": -169.225
        },
        {
          "x": -43.8,
          "z": -82.95
        },
        {
          "x": -61.65,
          "z": 12.25
        },
        {
          "x": -85.45,
          "z": 95.55
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 8,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_WILLEMS",
      "label": "Willemskade",
      "sourcePixels": [
        [
          3050,
          4330
        ],
        [
          3010,
          4510
        ],
        [
          3030,
          4555
        ],
        [
          3050,
          4700
        ],
        [
          3090,
          4880
        ]
      ],
      "points": [
        {
          "x": -20.0,
          "z": -196.0
        },
        {
          "x": -127.1,
          "z": -219.8
        },
        {
          "x": -153.875,
          "z": -207.9
        },
        {
          "x": -240.15,
          "z": -196.0
        },
        {
          "x": -347.25,
          "z": -172.2
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_OOSTER",
      "label": "Ooster Kade Kalimas",
      "sourcePixels": [
        [
          3142,
          3700
        ],
        [
          3145,
          3900
        ],
        [
          3150,
          4100
        ],
        [
          3138,
          4260
        ]
      ],
      "points": [
        {
          "x": 354.85,
          "z": -141.26
        },
        {
          "x": 235.85,
          "z": -139.475
        },
        {
          "x": 116.85,
          "z": -136.5
        },
        {
          "x": 21.65,
          "z": -143.64
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_CHINEESCHE",
      "label": "Chineesche Voorstraat",
      "sourcePixels": [
        [
          3138,
          4360
        ],
        [
          3144,
          4500
        ],
        [
          3160,
          4650
        ],
        [
          3190,
          4780
        ]
      ],
      "points": [
        {
          "x": -37.85,
          "z": -143.64
        },
        {
          "x": -121.15,
          "z": -140.07
        },
        {
          "x": -210.4,
          "z": -130.55
        },
        {
          "x": -287.75,
          "z": -112.7
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_PARADE",
      "label": "Paradestraat",
      "sourcePixels": [
        [
          2820,
          4500
        ],
        [
          2910,
          4535
        ],
        [
          3010,
          4545
        ]
      ],
      "points": [
        {
          "x": -121.15,
          "z": -332.85
        },
        {
          "x": -141.975,
          "z": -279.3
        },
        {
          "x": -147.925,
          "z": -219.8
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_BOOM",
      "label": "Boomstraat",
      "sourcePixels": [
        [
          2945,
          4280
        ],
        [
          2910,
          4400
        ],
        [
          2895,
          4525
        ]
      ],
      "points": [
        {
          "x": 9.75,
          "z": -258.475
        },
        {
          "x": -61.65,
          "z": -279.3
        },
        {
          "x": -136.025,
          "z": -288.225
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_KALISOSOK",
      "label": "Kalisosok / Werfstraat segment",
      "sourcePixels": [
        [
          2760,
          3960
        ],
        [
          2890,
          3990
        ],
        [
          3000,
          3995
        ],
        [
          3050,
          3980
        ]
      ],
      "points": [
        {
          "x": 200.15,
          "z": -368.55
        },
        {
          "x": 182.3,
          "z": -291.2
        },
        {
          "x": 179.325,
          "z": -225.75
        },
        {
          "x": 188.25,
          "z": -196.0
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_TJANTIAN",
      "label": "Tjantian approach",
      "sourcePixels": [
        [
          3400,
          4400
        ],
        [
          3510,
          4420
        ],
        [
          3540,
          4440
        ],
        [
          3600,
          4455
        ]
      ],
      "points": [
        {
          "x": -61.65,
          "z": 12.25
        },
        {
          "x": -73.55,
          "z": 77.7
        },
        {
          "x": -85.45,
          "z": 95.55
        },
        {
          "x": -94.375,
          "z": 131.25
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    },
    {
      "id": "R_SASAK",
      "label": "Sassak approach",
      "sourcePixels": [
        [
          3340,
          4010
        ],
        [
          3440,
          3970
        ],
        [
          3525,
          3940
        ]
      ],
      "points": [
        {
          "x": 170.4,
          "z": -23.45
        },
        {
          "x": 194.2,
          "z": 36.05
        },
        {
          "x": 212.05,
          "z": 86.625
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Street corridor interpretation. Width must be measured/estimated separately; black lines with cross ticks are tram/rail symbols, not pavement edges.",
      "width": 6,
      "widthEvidence": "authored playable width, not surveyed"
    }
  ],
  "waters": [
    {
      "id": "W_KALIMAS",
      "label": "Kali Mas",
      "sourcePixels": [
        [
          3074,
          3700
        ],
        [
          3076,
          3850
        ],
        [
          3080,
          4000
        ],
        [
          3085,
          4130
        ],
        [
          3074,
          4225
        ],
        [
          3050,
          4330
        ],
        [
          3038,
          4430
        ],
        [
          3030,
          4510
        ],
        [
          3042,
          4570
        ],
        [
          3052,
          4670
        ],
        [
          3070,
          4790
        ],
        [
          3100,
          4865
        ],
        [
          3210,
          4920
        ],
        [
          3350,
          4950
        ],
        [
          3400,
          4960
        ],
        [
          3450,
          4960
        ],
        [
          3410,
          4900
        ],
        [
          3310,
          4880
        ],
        [
          3190,
          4840
        ],
        [
          3160,
          4770
        ],
        [
          3130,
          4650
        ],
        [
          3090,
          4540
        ],
        [
          3085,
          4430
        ],
        [
          3095,
          4330
        ],
        [
          3125,
          4240
        ],
        [
          3140,
          4140
        ],
        [
          3133,
          4010
        ],
        [
          3130,
          3860
        ],
        [
          3125,
          3700
        ]
      ],
      "points": [
        {
          "x": 354.85,
          "z": -181.72
        },
        {
          "x": 265.6,
          "z": -180.53
        },
        {
          "x": 176.35,
          "z": -178.15
        },
        {
          "x": 99.0,
          "z": -175.175
        },
        {
          "x": 42.475,
          "z": -181.72
        },
        {
          "x": -20.0,
          "z": -196.0
        },
        {
          "x": -79.5,
          "z": -203.14
        },
        {
          "x": -127.1,
          "z": -207.9
        },
        {
          "x": -162.8,
          "z": -200.76
        },
        {
          "x": -222.3,
          "z": -194.81
        },
        {
          "x": -293.7,
          "z": -184.1
        },
        {
          "x": -338.325,
          "z": -166.25
        },
        {
          "x": -371.05,
          "z": -100.8
        },
        {
          "x": -388.9,
          "z": -17.5
        },
        {
          "x": -394.85,
          "z": 12.25
        },
        {
          "x": -394.85,
          "z": 42.0
        },
        {
          "x": -359.15,
          "z": 18.2
        },
        {
          "x": -347.25,
          "z": -41.3
        },
        {
          "x": -323.45,
          "z": -112.7
        },
        {
          "x": -281.8,
          "z": -130.55
        },
        {
          "x": -210.4,
          "z": -148.4
        },
        {
          "x": -144.95,
          "z": -172.2
        },
        {
          "x": -79.5,
          "z": -175.175
        },
        {
          "x": -20.0,
          "z": -169.225
        },
        {
          "x": 33.55,
          "z": -151.375
        },
        {
          "x": 93.05,
          "z": -142.45
        },
        {
          "x": 170.4,
          "z": -146.615
        },
        {
          "x": 259.65,
          "z": -148.4
        },
        {
          "x": 354.85,
          "z": -151.375
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Water continuity under bridge is inferred. Banks simplified around text occlusion. Level is an authored scene datum, not known historical stage."
    },
    {
      "id": "W_PEGIRIAN",
      "label": "Kali Pegirian / Semampir canal, mapped segment",
      "sourcePixels": [
        [
          3675,
          3700
        ],
        [
          3650,
          3775
        ],
        [
          3600,
          3860
        ],
        [
          3550,
          3960
        ],
        [
          3520,
          4050
        ],
        [
          3510,
          4130
        ],
        [
          3520,
          4230
        ],
        [
          3560,
          4340
        ],
        [
          3620,
          4460
        ],
        [
          3635,
          4450
        ],
        [
          3580,
          4330
        ],
        [
          3540,
          4225
        ],
        [
          3532,
          4130
        ],
        [
          3540,
          4050
        ],
        [
          3570,
          3960
        ],
        [
          3620,
          3860
        ],
        [
          3670,
          3780
        ],
        [
          3700,
          3700
        ]
      ],
      "points": [
        {
          "x": 354.85,
          "z": 175.875
        },
        {
          "x": 310.225,
          "z": 161.0
        },
        {
          "x": 259.65,
          "z": 131.25
        },
        {
          "x": 200.15,
          "z": 101.5
        },
        {
          "x": 146.6,
          "z": 83.65
        },
        {
          "x": 99.0,
          "z": 77.7
        },
        {
          "x": 39.5,
          "z": 83.65
        },
        {
          "x": -25.95,
          "z": 107.45
        },
        {
          "x": -97.35,
          "z": 143.15
        },
        {
          "x": -91.4,
          "z": 152.075
        },
        {
          "x": -20.0,
          "z": 119.35
        },
        {
          "x": 42.475,
          "z": 95.55
        },
        {
          "x": 99.0,
          "z": 90.79
        },
        {
          "x": 146.6,
          "z": 95.55
        },
        {
          "x": 200.15,
          "z": 113.4
        },
        {
          "x": 259.65,
          "z": 143.15
        },
        {
          "x": 307.25,
          "z": 172.9
        },
        {
          "x": 354.85,
          "z": 190.75
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Only mapped segment included. Do not connect to Kali Mas with invented water geometry."
    }
  ],
  "footprints": [
    {
      "id": "F_PWD_1",
      "label": "Map index 1: P.W.D. Offices / Burg Genesk Dienst",
      "sourcePixels": [
        [
          3008,
          4276
        ],
        [
          3033,
          4282
        ],
        [
          3027,
          4305
        ],
        [
          3002,
          4300
        ]
      ],
      "points": [
        {
          "x": 12.13,
          "z": -220.99
        },
        {
          "x": 8.56,
          "z": -206.115
        },
        {
          "x": -5.125,
          "z": -209.685
        },
        {
          "x": -2.15,
          "z": -224.56
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Identity comes from map index. MUST NOT rename this polygon Internatio solely because nearby.",
      "height": null
    },
    {
      "id": "F_PHONE",
      "label": "Telephone Office (map label)",
      "sourcePixels": [
        [
          2972,
          4162
        ],
        [
          3003,
          4170
        ],
        [
          2995,
          4200
        ],
        [
          2965,
          4191
        ]
      ],
      "points": [
        {
          "x": 79.96,
          "z": -242.41
        },
        {
          "x": 75.2,
          "z": -223.965
        },
        {
          "x": 57.35,
          "z": -228.725
        },
        {
          "x": 62.705,
          "z": -246.575
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Simplified black silhouette; no height or exact facade established.",
      "height": null
    },
    {
      "id": "F_POST_7",
      "label": "Map index 7: Post Office",
      "sourcePixels": [
        [
          2980,
          4820
        ],
        [
          3064,
          4810
        ],
        [
          3073,
          4880
        ],
        [
          3057,
          4881
        ],
        [
          3055,
          4860
        ],
        [
          3004,
          4868
        ],
        [
          3005,
          4887
        ],
        [
          2980,
          4885
        ]
      ],
      "points": [
        {
          "x": -311.55,
          "z": -237.65
        },
        {
          "x": -305.6,
          "z": -187.67
        },
        {
          "x": -347.25,
          "z": -182.315
        },
        {
          "x": -347.845,
          "z": -191.835
        },
        {
          "x": -335.35,
          "z": -193.025
        },
        {
          "x": -340.11,
          "z": -223.37
        },
        {
          "x": -351.415,
          "z": -222.775
        },
        {
          "x": -350.225,
          "z": -237.65
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "Selected cartographic outline, not full measured construction plan.",
      "height": null
    },
    {
      "id": "F_TRADING_62",
      "label": "Map index 62: Trading Company / Handels Vereeniging",
      "sourcePixels": [
        [
          2938,
          4684
        ],
        [
          2994,
          4687
        ],
        [
          3000,
          4706
        ],
        [
          2988,
          4728
        ],
        [
          2948,
          4723
        ]
      ],
      "points": [
        {
          "x": -230.63,
          "z": -262.64
        },
        {
          "x": -232.415,
          "z": -229.32
        },
        {
          "x": -243.72,
          "z": -225.75
        },
        {
          "x": -256.81,
          "z": -232.89
        },
        {
          "x": -253.835,
          "z": -256.69
        }
      ],
      "evidence": "reconstructed_from_period_cartography",
      "notes": "No assumption that this is Internatio; retain map identity.",
      "height": null
    },
    {
      "id": "F_SCHOOL_63",
      "label": "Map index63: Juliana School",
      "sourcePixels": [
        [
          2883,
          4806
        ],
        [
          2921,
          4801
        ],
        [
          2927,
          4828
        ],
        [
          2888,
          4834
        ]
      ],
      "points": [
        {
          "x": -303.22,
          "z": -295.365
        },
        {
          "x": -300.245,
          "z": -272.755
        },
        {
          "x": -316.31,
          "z": -269.185
        },
        {
          "x": -319.88,
          "z": -292.39
        }
      ],
      "height": null,
      "evidence": "new coarse reading of M001 black footprint/index63",
      "notes": "Index81 is R.C.Church. Footprint approximate; door/interior, refuge use and exact November1945 condition fictional/unresolved. Leave authored entrance and bench path open."
    },
    {
      "id": "F_CHURCH_81",
      "label": "Map index81: R.C.Church",
      "sourcePixels": [
        [
          2948,
          4756
        ],
        [
          2969,
          4753
        ],
        [
          2975,
          4780
        ],
        [
          2954,
          4782
        ]
      ],
      "points": [
        {
          "x": -273.47,
          "z": -256.69
        },
        {
          "x": -271.685,
          "z": -244.195
        },
        {
          "x": -287.75,
          "z": -240.625
        },
        {
          "x": -288.94,
          "z": -253.12
        }
      ],
      "height": null,
      "evidence": "new coarse reading of M001 black footprint",
      "notes": "New coarse M001 black-footprint reading and index81; no exact November1945 condition or measured dimensions claimed."
    },
    {
      "id": "F_SOUTH81_UNRESOLVED",
      "label": "Mapped black mass south of81; identity grouping unresolved",
      "sourcePixels": [
        [
          2954,
          4785
        ],
        [
          2973,
          4786
        ],
        [
          2973,
          4781
        ],
        [
          2992,
          4781
        ],
        [
          2995,
          4787
        ],
        [
          3004,
          4789
        ],
        [
          3004,
          4801
        ],
        [
          2997,
          4810
        ],
        [
          2976,
          4812
        ],
        [
          2975,
          4804
        ],
        [
          2964,
          4805
        ],
        [
          2963,
          4810
        ],
        [
          2955,
          4809
        ]
      ],
      "points": [
        {
          "x": -290.725,
          "z": -253.12
        },
        {
          "x": -291.32,
          "z": -241.815
        },
        {
          "x": -288.345,
          "z": -241.815
        },
        {
          "x": -288.345,
          "z": -230.51
        },
        {
          "x": -291.915,
          "z": -228.725
        },
        {
          "x": -293.105,
          "z": -223.37
        },
        {
          "x": -300.245,
          "z": -223.37
        },
        {
          "x": -305.6,
          "z": -227.535
        },
        {
          "x": -306.79,
          "z": -240.03
        },
        {
          "x": -302.03,
          "z": -240.625
        },
        {
          "x": -302.625,
          "z": -247.17
        },
        {
          "x": -305.6,
          "z": -247.765
        },
        {
          "x": -305.005,
          "z": -252.525
        }
      ],
      "height": null,
      "evidence": "new coarse reading of M001 black footprint",
      "notes": "Visible black mass retained. Do not silently assign it to Church81, PostOffice7 or School63. Source ownership/grouping unresolved."
    }
  ],
  "route": [
    {
      "id": "workshop",
      "x": -70.575,
      "z": 47.95,
      "sourcePixels": [
        3460,
        4415
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "depart",
      "x": -67.6,
      "z": 33.075,
      "sourcePixels": [
        3435,
        4410
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "warning",
      "x": -61.65,
      "z": 12.25,
      "sourcePixels": [
        3400,
        4400
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "coverApproach",
      "x": -54.51,
      "z": -23.45,
      "sourcePixels": [
        3340,
        4388
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "cover",
      "x": -52.725,
      "z": -35.35,
      "sourcePixels": [
        3320,
        4385
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "rescueApproach",
      "x": -42.61,
      "z": -65.1,
      "sourcePixels": [
        3270,
        4368
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "rescue",
      "x": -40.825,
      "z": -77.0,
      "sourcePixels": [
        3250,
        4365
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "plaza",
      "x": -31.9,
      "z": -118.65,
      "sourcePixels": [
        3180,
        4350
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "bridgeGather",
      "x": -24.165,
      "z": -151.375,
      "sourcePixels": [
        3125,
        4337
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "bridgeApproach",
      "x": -16.7,
      "z": -160,
      "sourcePixels": [
        3110.504202,
        4324.453782
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "bridgeEntry",
      "x": -16.7,
      "z": -170.025,
      "sourcePixels": [
        3093.655462,
        4324.453782
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "bridgeExit",
      "x": -16.7,
      "z": -198,
      "sourcePixels": [
        3046.638655,
        4324.453782
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "quayFirst",
      "x": -127.1,
      "z": -219.8,
      "sourcePixels": [
        3010,
        4510
      ],
      "evidence": "M001 coarse route corridor; fictional events and prop placement"
    },
    {
      "id": "quayBend",
      "x": -153.875,
      "z": -219.8,
      "sourcePixels": [
        3010,
        4555
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "quayBreather",
      "x": -222.3,
      "z": -209.09,
      "sourcePixels": [
        3028,
        4670
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "connectorEast",
      "x": -225.87,
      "z": -222.18,
      "sourcePixels": [
        3006,
        4676
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "connectorWest",
      "x": -225.87,
      "z": -278.705,
      "sourcePixels": [
        2911,
        4676
      ],
      "evidence": "corrected M001 map-visible street lane WEST of TradingCompany62 and Church81; exact lane width/entrance authored"
    },
    {
      "id": "schoolApproach",
      "x": -294.89,
      "z": -265.02,
      "sourcePixels": [
        2934,
        4792
      ],
      "evidence": "corrected M001 map-visible street lane WEST of TradingCompany62 and Church81; exact lane width/entrance authored"
    },
    {
      "id": "refugeApproach",
      "x": -310.36,
      "z": -268.61,
      "sourcePixels": [
        2927.966387,
        4818.0
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    },
    {
      "id": "refuge",
      "x": -310.36,
      "z": -272.16,
      "sourcePixels": [
        2922,
        4818
      ],
      "evidence": "map-guided playable lane/entrance offset; authored scene width"
    }
  ]
});
export const MAP_ROADS=DATA.roads;
export const MAP_WATERS=DATA.waters;
export const MAP_FOOTPRINTS=DATA.footprints;
const actorRoute=DATA.route;
const routeIndices=Object.fromEntries(actorRoute.map((p,i)=>[p.id,i]));
const at=id=>{const p=actorRoute[routeIndices[id]];return {x:p.x,z:p.z};};
const crossing={east:sourcePixelToWorld(3095,4330),west:sourcePixelToWorld(3050,4330),center:{x:-20,z:-182.6125},width:8,length:26.775,
  railX:[-24.1,-15.9],innerRailX:[-23.975,-16.025],minZ:-196,maxZ:-169.225,
  laneX:-16.7,approach:at('bridgeApproach'),entry:at('bridgeEntry'),exit:at('bridgeExit'),
  waterBounds:{minZ:-196,maxZ:-169.225},
  evidence:'M001 crossing endpoints; L006 circa1929 open-railing form; width/colour/structure and precise1945 condition are authored/unresolved'};
const events={
 firstWarning:{x:-82,z:29},blast:{x:-74,z:17},marketClosure:{x:-68,z:6},
 coverImpact:{x:-61,z:-42},rescueImpact:{x:-31,z:-80},squareImpact:{x:-44,z:-126},
 bridgeImpact:{x:-3,z:-152},quayDistant:{x:-178,z:-245}
};
const fireSites=[
 {id:'marketStall',...events.blast,phase:1,radius:3.4,strength:1},
 {id:'coverShop',...events.coverImpact,phase:2,radius:3.2,strength:1},
 {id:'rescueStore',...events.rescueImpact,phase:3,radius:3.1,strength:.9},
 {id:'squareShop',...events.squareImpact,phase:4,radius:3.4,strength:1},
 {id:'bridgeYard',...events.bridgeImpact,phase:5,radius:3.1,strength:.8},
 {id:'quayDistant',...events.quayDistant,phase:6,radius:3.8,strength:.65}
];
export const LAYOUT=freeze({
 id:'kalimas-kembang-willems-school63-r2',sourceId:'M001',distanceScale:.5,
 spawn:{x:-73,z:52.5,yaw:0},workshop:at('workshop'),cover:at('cover'),rescue:at('rescue'),plaza:at('plaza'),
 cart:{x:-20,z:-165.8},cartShift:-3.2,cartPlacement:{sourcePixels:[3100.756302521,4330],evidence:'fictional loaded cart on eastbank approach, not a mapped or documented1945 obstruction'},crossing,bridge:crossing,
 quayBreather:at('quayBreather'),refuge:at('refuge'),refugeApproach:at('refugeApproach'),
 helpPoints:{workshop:{x:at('workshop').x+1.9,z:at('workshop').z+2.3},rescue:{x:at('rescue').x-.65,z:at('rescue').z+1.55}},
 bounds:{minX:-350,maxX:25,minZ:-320,maxZ:100},
 mappedBounds:{minX:-394.85,maxX:354.85,minZ:-547.05,maxZ:202.65},
 backgroundBounds:{minX:-490,maxX:430,minZ:-620,maxZ:280},
 actorRoute,routeIndices,events,fireSites,
 distantSites:[{x:-82,z:-55},{x:40,z:-217},{x:-178,z:-245},{x:-275,z:-295}],
 data:DATA,
 school:{id:'F_SCHOOL_63',mapIndex:63,label:'Juliana School',refugeUse:'fiction',footprint:MAP_FOOTPRINTS.find(p=>p.id==='F_SCHOOL_63')},
 disclosure:'Hubungan jalan dan sungai mengikuti pembacaan peta masa perang. Jarak dipadatkan50%. Tokoh, percakapan, penggunaan sekolah sebagai tempat berlindung dan kejadian setempat adalah rekaan.'
});
