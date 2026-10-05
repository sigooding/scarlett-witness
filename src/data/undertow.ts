import type { Story } from "../types";

/**
 * UNDERTOW — previously undertow.reel.json at the repo root.
 * Inlined as a typed module (Sep 2026: root .reel.json drafts were removed from
 * git to slim the repo; this was the only one imported by the shipped build).
 */
export const UNDERTOW = {
  "id": "undertow-prototype",
  "title": "UNDERTOW",
  "tagline": "Keep moving. Keep quiet. Find the way below.",
  "coverImage": "/assets/undertow/forest.png",
  "startSceneId": "ut_forest",
  "layout": {
    "ut_forest": {
      "x": 40,
      "y": 180
    },
    "ut_factory": {
      "x": 470,
      "y": 180
    },
    "ut_tunnel": {
      "x": 900,
      "y": 180
    },
    "ut_escape": {
      "x": 1330,
      "y": 80
    },
    "ut_caught": {
      "x": 1330,
      "y": 330
    }
  },
  "briefing": {
    "objective": "Cross the perimeter, restore the floodgate controls, and reach the sealed chamber.",
    "winConditions": [
      "Find a fuse in the forest drain.",
      "Restore power without drawing attention.",
      "Open the submerged pressure door."
    ],
    "loseConditions": [
      "Step into the searchlight before cutting its power."
    ]
  },
  "flagNotes": {
    "ut_fuse_found": "You pulled a ceramic fuse from the drainage cage.",
    "ut_power_on": "The factory's auxiliary circuit is alive.",
    "ut_light_disabled": "The perimeter searchlight is dark.",
    "ut_wheel_found": "You took the iron valve wheel.",
    "ut_door_open": "The pressure door is open."
  },
  "characters": [],
  "items": [
    {
      "id": "ut_fuse",
      "name": "Ceramic Fuse",
      "icon": "▥",
      "description": "Cold porcelain, stamped AUX-4.",
      "flavorText": "It might wake one dead circuit.",
      "isClue": true
    },
    {
      "id": "ut_wheel",
      "name": "Valve Wheel",
      "icon": "⊕",
      "description": "A heavy iron wheel with a square drive.",
      "flavorText": "Made to turn something that resists.",
      "isClue": true
    }
  ],
  "playerSprite": {
    "image": "/assets/undertow/boy.png"
  },
  "verbResponses": {
    "look": "Only concrete, rain, and somewhere distant, machinery.",
    "take": "It will not come loose.",
    "use": "That does nothing here.",
    "go": "Not that way."
  },
  "scenes": [
    {
      "id": "ut_forest",
      "title": "The Perimeter",
      "nodeType": "stage",
      "hideHud": true,
      "background": "/assets/undertow/forest.png",
      "ambientAudio": "rain",
      "prose": "",
      "dialogueBeats": [],
      "choices": [],
      "stage": {
        "playerImage": "/assets/undertow/boy.png",
        "playerScale": 0.48,
        "spawn": {
          "x": 8,
          "y": 90
        },
        "speed": 17,
        "reach": 4,
        "keyboard": true,
        "floor": {
          "top": 69,
          "bottom": 94
        },
        "depthScale": 0.18,
        "hints": "proximity",
        "verbCoin": true,
        "enterCaption": "RAIN HAS ERASED THE ROAD. THE FENCE HAS NOT FORGOTTEN YOU.",
        "obstacles": [
          {
            "x": 39,
            "y": 70,
            "w": 8,
            "h": 15
          },
          {
            "x": 68,
            "y": 76,
            "w": 7,
            "h": 11
          }
        ],
        "exitEdges": {
          "right": {
            "targetSceneId": "ut_factory",
            "label": "the service entrance",
            "gating": {
              "requiresFlags": [
                "ut_light_disabled"
              ]
            },
            "lockedLine": "The searchlight combs the open ground. The breaker must be nearby."
          }
        }
      },
      "hotspots": [
        {
          "id": "ut_h_fuse",
          "label": "a drainage cage",
          "bounds": {
            "x": 18,
            "y": 69,
            "w": 10,
            "h": 17
          },
          "cursor": "take",
          "isRepeatable": false,
          "showItemImage": true,
          "action": {
            "type": "giveItem",
            "itemGranted": "ut_fuse",
            "flagSet": "ut_fuse_found"
          },
          "verbs": {
            "look": {
              "type": "showText",
              "text": "Something pale is wedged behind the rusted bars."
            }
          }
        },
        {
          "id": "ut_h_breaker",
          "label": "the perimeter breaker",
          "bounds": {
            "x": 50,
            "y": 58,
            "w": 10,
            "h": 26
          },
          "cursor": "use",
          "isRepeatable": false,
          "gating": {
            "requiresItems": [
              "ut_fuse"
            ]
          },
          "acceptsItems": [
            "ut_fuse"
          ],
          "itemResponses": {
            "ut_fuse": "The circuit coughs awake. Far above, the searchlight dies."
          },
          "action": {
            "type": "useItem",
            "itemConsumed": "ut_fuse",
            "flagSet": "ut_light_disabled",
            "text": "The circuit coughs awake. Far above, the searchlight dies."
          },
          "verbs": {
            "look": {
              "type": "showText",
              "text": "A fuse socket. Empty. The searchlight cable disappears into it."
            }
          }
        },
        {
          "id": "ut_h_light",
          "label": "the moving searchlight",
          "bounds": {
            "x": 74,
            "y": 10,
            "w": 18,
            "h": 30
          },
          "cursor": "look",
          "remote": true,
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Its beam sweeps the gap with patient, mechanical rhythm."
          }
        },
        {
          "id": "ut_h_risk",
          "label": "cross the lit clearing",
          "bounds": {
            "x": 84,
            "y": 70,
            "w": 12,
            "h": 22
          },
          "cursor": "go",
          "isRepeatable": false,
          "gating": {
            "excludesFlags": [
              "ut_light_disabled"
            ]
          },
          "action": {
            "type": "goToScene",
            "targetSceneId": "ut_caught"
          },
          "wrongVerbText": "The light pauses over the mud. Going now would be the last decision you make."
        }
      ]
    },
    {
      "id": "ut_factory",
      "title": "Auxiliary Hall",
      "nodeType": "stage",
      "hideHud": true,
      "background": "/assets/undertow/factory.png",
      "ambientAudio": "rain",
      "prose": "",
      "dialogueBeats": [],
      "choices": [],
      "stage": {
        "playerImage": "/assets/undertow/boy.png",
        "playerScale": 0.42,
        "spawn": {
          "x": 6,
          "y": 91
        },
        "speed": 16,
        "reach": 4,
        "keyboard": true,
        "floor": {
          "top": 66,
          "bottom": 95
        },
        "depthScale": 0.22,
        "hints": "proximity",
        "verbCoin": true,
        "enterCaption": "THE BUILDING BREATHES THROUGH BROKEN PIPES.",
        "obstacles": [
          {
            "x": 28,
            "y": 70,
            "w": 12,
            "h": 20
          },
          {
            "x": 58,
            "y": 67,
            "w": 11,
            "h": 18
          }
        ],
        "entrySpawns": {
          "ut_forest": {
            "x": 5,
            "y": 91
          },
          "ut_tunnel": {
            "x": 91,
            "y": 91
          }
        },
        "exitEdges": {
          "left": {
            "targetSceneId": "ut_forest",
            "label": "the perimeter"
          },
          "right": {
            "targetSceneId": "ut_tunnel",
            "label": "the flooded descent",
            "gating": {
              "requiresFlags": [
                "ut_power_on"
              ]
            },
            "lockedLine": "The lift controls are dead."
          }
        }
      },
      "hotspots": [
        {
          "id": "ut_h_wheel",
          "label": "an iron valve wheel",
          "bounds": {
            "x": 20,
            "y": 64,
            "w": 10,
            "h": 19
          },
          "cursor": "take",
          "isRepeatable": false,
          "showItemImage": true,
          "action": {
            "type": "giveItem",
            "itemGranted": "ut_wheel",
            "flagSet": "ut_wheel_found"
          },
          "verbs": {
            "look": {
              "type": "showText",
              "text": "Someone left it beside a dismantled pump."
            }
          }
        },
        {
          "id": "ut_h_aux",
          "label": "the auxiliary switchboard",
          "bounds": {
            "x": 75,
            "y": 48,
            "w": 13,
            "h": 35
          },
          "cursor": "use",
          "isRepeatable": false,
          "action": {
            "type": "runScript",
            "flagSet": "ut_power_on",
            "script": [
              {
                "do": "walkTo",
                "x": 76,
                "y": 87
              },
              {
                "do": "wait",
                "seconds": 0.5
              },
              {
                "do": "setFlag",
                "flag": "ut_power_on"
              },
              {
                "do": "say",
                "text": "The relays answer one by one."
              }
            ]
          },
          "verbs": {
            "look": {
              "type": "showText",
              "text": "The main grid is gone. One knife switch still has tension."
            }
          }
        },
        {
          "id": "ut_h_water",
          "label": "the black water",
          "bounds": {
            "x": 42,
            "y": 82,
            "w": 18,
            "h": 10
          },
          "cursor": "look",
          "remote": true,
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Ripples arrive from beneath the floor, though nothing has fallen."
          }
        }
      ]
    },
    {
      "id": "ut_tunnel",
      "title": "Pressure Tunnel",
      "nodeType": "stage",
      "hideHud": true,
      "background": "/assets/undertow/tunnel.png",
      "ambientAudio": "rain",
      "prose": "",
      "dialogueBeats": [],
      "choices": [],
      "stage": {
        "playerImage": "/assets/undertow/boy.png",
        "playerScale": 0.46,
        "spawn": {
          "x": 7,
          "y": 91
        },
        "speed": 14,
        "reach": 4,
        "keyboard": true,
        "floor": {
          "top": 70,
          "bottom": 95
        },
        "depthScale": 0.15,
        "hints": "proximity",
        "verbCoin": true,
        "enterCaption": "THE WATER IS WARM. SOMETHING AHEAD IS STILL RUNNING.",
        "obstacles": [
          {
            "x": 35,
            "y": 76,
            "w": 10,
            "h": 15
          }
        ],
        "exitEdges": {
          "left": {
            "targetSceneId": "ut_factory",
            "label": "the auxiliary hall"
          }
        }
      },
      "hotspots": [
        {
          "id": "ut_h_socket",
          "label": "the pressure-door spindle",
          "bounds": {
            "x": 72,
            "y": 52,
            "w": 12,
            "h": 35
          },
          "cursor": "use",
          "isRepeatable": false,
          "gating": {
            "requiresItems": [
              "ut_wheel"
            ]
          },
          "acceptsItems": [
            "ut_wheel"
          ],
          "itemResponses": {
            "ut_wheel": "The wheel catches. Metal screams under the waterline."
          },
          "action": {
            "type": "useItem",
            "itemConsumed": "ut_wheel",
            "flagSet": "ut_door_open",
            "text": "The wheel catches. Metal screams under the waterline."
          },
          "verbs": {
            "look": {
              "type": "showText",
              "text": "A square spindle, polished by a wheel that is no longer here."
            }
          }
        },
        {
          "id": "ut_h_door",
          "label": "the pressure door",
          "bounds": {
            "x": 84,
            "y": 29,
            "w": 14,
            "h": 59
          },
          "cursor": "go",
          "isRepeatable": false,
          "gating": {
            "requiresFlags": [
              "ut_door_open"
            ]
          },
          "customFailMessage": "The circular lock is holding thousands of tons of water.",
          "action": {
            "type": "goToScene",
            "targetSceneId": "ut_escape"
          },
          "verbs": {
            "look": {
              "type": "showText",
              "text": "The seam is breathing. Beyond it: a low, living pulse."
            }
          }
        },
        {
          "id": "ut_h_window",
          "label": "a reinforced observation window",
          "bounds": {
            "x": 48,
            "y": 34,
            "w": 14,
            "h": 22
          },
          "cursor": "look",
          "remote": true,
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "For half a second, a human shape stands on the other side. Then the red light turns, and it is gone."
          }
        }
      ]
    },
    {
      "id": "ut_escape",
      "title": "Below",
      "isEnding": true,
      "endingId": "ut_end_below",
      "background": "/assets/undertow/tunnel.png",
      "prose": "The door gives way. You slip through before the water can decide which side it belongs on. In the dark below, hundreds of bare feet turn toward the sound.",
      "dialogueBeats": [],
      "hotspots": [],
      "choices": [],
      "endingData": {
        "tier": "victory-gold",
        "headline": "THE DOOR BELOW",
        "recap": "You restored the dead systems, opened the pressure door, and reached the chamber beneath the floodworks."
      }
    },
    {
      "id": "ut_caught",
      "title": "White Light",
      "isEnding": true,
      "endingId": "ut_end_caught",
      "background": "/assets/undertow/forest.png",
      "prose": "The beam stops. So do you. Dogs begin barking beyond the fence.",
      "dialogueBeats": [],
      "hotspots": [],
      "choices": [],
      "endingData": {
        "tier": "gameover",
        "headline": "WHITE LIGHT",
        "recap": "You crossed before disabling the searchlight. The perimeter found you."
      }
    }
  ]
} as unknown as Story;
