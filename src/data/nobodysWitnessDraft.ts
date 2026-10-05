import type { Story } from "../types";

/**
 * Nobody's Witness Draft (v2 — branching) — generated from a Studio .reel.json
 * export (the original draft file is no longer kept in the repo).
 *
 * DO NOT EDIT BY HAND: regenerate with
 *   node scripts/import-draft-to-src.mjs <export.reel.json>
 * Bundled media lives under public/uploads/nobodys-witness-draft; every reference in this
 * module is a portable path so the story ships as part of the newsstand and
 * never depends on a browser's IndexedDB.
 */
export const NOBODYS_WITNESS_DRAFT: Story = {
  "id": "nobodys-witness-draft",
  "title": "Nobody's Witness Draft (v2 — branching)",
  "tagline": "Straight. You leave a straight line, and everybody stands in it.",
  "coverImage": "/img/cover-nobodys-witness.jpg",
  "startSceneId": "nwd_coldopen",
  "briefing": {
    "objective": "Blackwood, eleven forty-seven at night. Vera Voss is hiring. Take the folder and walk the trail — all the way to what it costs.",
    "winConditions": [
      "Take the folder. Take the case.",
      "Find David Voss — the real one, not her version.",
      "Hear her say all of it, out loud, where you can see her face.",
      "Make the trade, and drink the coffee cold."
    ],
    "loseConditions": [
      "Lose your temper at the Blue Cue — Moe won't, but he'd feel bad about it.",
      "Let Solomon's patience run out before Friday."
    ]
  },
  "acts": [
    {
      "id": "nwd_act1",
      "label": "Act One",
      "title": "The Woman Who Sold Herself Twice",
      "tagline": "Nobody took what I lost. I handed it over.",
      "startSceneId": "nwd_coldopen",
      "titleCardImage": "/img/style/nw2-signature-a-neon80s.jpg"
    },
    {
      "id": "nwd_act2",
      "label": "Act Two",
      "title": "Nobody Just Leaves",
      "tagline": "Solomon's forty-eight hours.",
      "startSceneId": "nwd_laundromat",
      "titleCardImage": "/img/nwd/ep2/laundromat.jpg"
    },
    {
      "id": "nwd_act3",
      "label": "Act Three",
      "title": "Nobody's Witness",
      "tagline": "It's Wednesday. Friday's coming.",
      "startSceneId": "nwd_call",
      "titleCardImage": "/img/nw2/bg-final-street.jpg"
    },
    {
      "id": "nwd_act2pt",
      "label": "Act Two (alt)",
      "title": "Past Tense",
      "tagline": "Better information, no allies.",
      "startSceneId": "nwd_a2_pasttense",
      "titleCardImage": "/img/nw2/mo-rain-glass.jpg"
    },
    {
      "id": "nwd_act2te",
      "label": "Act Two (alt)",
      "title": "Two Envelopes",
      "tagline": "Two clients, and neither of them told the other.",
      "startSceneId": "nwd_a2_envelopes",
      "titleCardImage": "/img/nw2/bg-office-night.jpg"
    },
    {
      "id": "nwd_act2tw",
      "label": "Act Two (alt)",
      "title": "Three Weeks",
      "tagline": "Best decision I ever made. Three weeks to enjoy it.",
      "startSceneId": "nwd_a2_threeweeks",
      "titleCardImage": "/img/nw2/bg-diner-int.jpg"
    },
    {
      "id": "nwd_act2sn",
      "label": "Act Two (alt)",
      "title": "She's Not Answering",
      "tagline": "This is no longer an investigation. It's a negotiation.",
      "startSceneId": "nwd_a2_sheisnt",
      "titleCardImage": "/img/nw2/bg-office-night.jpg"
    },
    {
      "id": "nwd_act2b",
      "label": "Act Two (shared)",
      "title": "Forty-Eight Hours",
      "tagline": "Every route plays this: the drive, the pumps, the plan, the kill.",
      "startSceneId": "nwd_48",
      "titleCardImage": "/img/nwd/ep2/car-48.jpg"
    }
  ],
  "episodes": [
    {
      "id": "nwd_ep1",
      "number": 1,
      "title": "The Shape of it",
      "kicker": "Nobody's Witness",
      "tagline": " a folder, a name I didn't like, and a warehouse.",
      "sceneIds": [
        "nwd_coldopen",
        "nwd_titles",
        "nwd_diner",
        "nwd_diner_file",
        "nwd_diner_take",
        "nwd_diner_desc",
        "nwd_diner_refuse",
        "nwd_follow_home",
        "nwd_lit_window",
        "nwd_office_rent",
        "nwd_office_vera",
        "nwd_office_take",
        "nwd_poolhall",
        "nwd_poolhall_out",
        "nwd_poolhall_name",
        "nwd_office",
        "nwd_warehouse",
        "nwd_warehouse_gold",
        "nwd_warehouse_escalate",
        "nwd_warehouse_offer",
        "nwd_warehouse_take",
        "nwd_curtain1",
        "nwd_curtain_pasttense",
        "nwd_curtain_threeweeks",
        "nwd_curtain_sheisnt",
        "nwd_curtain_twoenvelopes"
      ],
      "startSceneId": "nwd_coldopen",
      "titleCardImage": "/img/style/nw2-signature-a-neon80s.jpg",
      "posterImage": "/img/nwd/ep1/poster-diner.jpg",
      "titleCardSeconds": 3.2,
      "nextTimeLines": [
        "Solomon gave him forty-eight hours.",
        "A motel four hours north — and a clerk who remembers a man who tipped."
      ],
      "nextEpisodeByEnding": {
        "nwd_curtain1": "nwd_ep2a",
        "nwd_curtain_pasttense": "nwd_ep2pt",
        "nwd_curtain_twoenvelopes": "nwd_ep2te",
        "nwd_curtain_threeweeks": "nwd_ep2tw",
        "nwd_curtain_sheisnt": "nwd_ep2sn"
      },
      "nextTimeByEnding": {
        "nwd_curtain1": [
          "Solomon gave him forty-eight hours.",
          "A motel four hours north — and a clerk who remembers a man who tipped."
        ],
        "nwd_curtain_pasttense": [
          "Nobody talks about a missing husband in the past tense. They talk about him like he's late.",
          "Two bags of shopping. One woman. Eleven at night."
        ],
        "nwd_curtain_twoenvelopes": [
          "Two clients, and neither of them told the other.",
          "Sixteen years of not working for that man, and it went in one morning, for money, before anybody had even died."
        ],
        "nwd_curtain_threeweeks": [
          "They found a man in a rental four hours north. Nine days dead.",
          "You've got no client, no notes, and no reason to have been anywhere. That's not innocent. That's just unhelpful."
        ],
        "nwd_curtain_sheisnt": [
          "She's fine. I want to say that first because I know what you're about to think.",
          "I'd like you to come here and let me thank you properly."
        ]
      }
    },
    {
      "id": "nwd_ep2a",
      "number": 2,
      "numberSuffix": "a",
      "title": "Nobody Just Leaves",
      "kicker": "Nobody's Witness",
      "tagline": "Act Two — Solomon's clock, a gas station bench, and a kitchen with the kettle still ticking.",
      "sceneIds": [
        "nwd_laundromat",
        "nwd_threeam"
      ],
      "startSceneId": "nwd_laundromat",
      "titleCardImage": "/img/nwd/ep2/laundromat.jpg",
      "posterImage": "/img/nwd/ep2/car-48.jpg",
      "titleCardSeconds": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep1",
          "endingSceneIds": [
            "nwd_curtain1"
          ]
        }
      ],
      "recapLines": [
        {
          "id": "nwd_r2_1",
          "characterId": "narrator",
          "text": "Vera Voss hired the one man in Blackwood who doesn't work for Solomon Reyes."
        },
        {
          "id": "nwd_r2_2",
          "characterId": "narrator",
          "text": "Solomon zip-tied him to a chair and gave him forty-eight hours to produce David Voss — or the money."
        },
        {
          "id": "nwd_r2_3",
          "characterId": "narrator",
          "text": "Rosa ran the name: a bus ticket, cash, nine days ago. He wasn't taken. He walked."
        },
        {
          "id": "nwd_r2_4",
          "characterId": "narrator",
          "image": "/img/nwd/ep2/apartment-shoebox.jpg",
          "text": "And Vera has a shoebox, a stopped watch, and a debt older than her married name."
        }
      ],
      "nextEpisodeByEnding": {
        "nwd_threeam": "nwd_ep2b"
      },
      "nextTimeByEnding": {
        "nwd_threeam": [
          "Forty-eight hours. The road north is two lanes wide and it's still raining.",
          "The pumps at Route 6 — a radio playing something country and badly tuned."
        ]
      }
    },
    {
      "id": "nwd_ep2b",
      "number": 2,
      "numberSuffix": "b",
      "title": "Forty-Eight Hours",
      "kicker": "Nobody's Witness",
      "tagline": "The shared road north — the drive, the pumps, the plan, the kill. Every route plays it.",
      "sceneIds": [
        "nwd_48",
        "nwd_pumps",
        "nwd_interlude",
        "nwd_rental",
        "nwd_yard",
        "nwd_curtain2"
      ],
      "startSceneId": "nwd_48",
      "titleCardImage": "/img/nwd/ep2/car-48.jpg",
      "posterImage": "/img/nwd/ep2/pumps-route6.jpg",
      "titleCardSeconds": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep2a"
        },
        {
          "episodeId": "nwd_ep2pt"
        },
        {
          "episodeId": "nwd_ep2te"
        },
        {
          "episodeId": "nwd_ep2tw"
        },
        {
          "episodeId": "nwd_ep2sn"
        }
      ],
      "recapLines": [
        {
          "id": "nwd_r2b_gold",
          "characterId": "narrator",
          "gating": {
            "excludesFlags": [
              "rosa_absent",
              "on_payroll",
              "refused_case",
              "vera_held"
            ]
          },
          "text": "Rosa ran the name — bus ticket, cash, nine days ago. He wasn't taken, he walked. Three in the morning, nothing happened. That's the point."
        },
        {
          "id": "nwd_r2b_b1",
          "characterId": "narrator",
          "gating": {
            "requiresFlags": [
              "knew_past_tense"
            ]
          },
          "text": "She gave you the description in the past tense. You read the folder late, and found the utility bill — a rental, four hours north."
        },
        {
          "id": "nwd_r2b_b2",
          "characterId": "narrator",
          "gating": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "Two clients, one man. Doc Sato heard it on you down a phone line, and gave you the address anyway."
        },
        {
          "id": "nwd_r2b_b3",
          "characterId": "narrator",
          "gating": {
            "requiresFlags": [
              "refused_case"
            ]
          },
          "text": "You said no, and you were right. Three weeks later, Rosa handed you the address — permanently off the record."
        },
        {
          "id": "nwd_r2b_b4",
          "characterId": "narrator",
          "gating": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "You said her name in a pool hall. Solomon had the address since Tuesday — and she's upstairs."
        },
        {
          "id": "nwd_r2b_all",
          "characterId": "narrator",
          "text": "Forty-eight hours. The road north is two lanes wide and it's still raining."
        }
      ],
      "nextEpisodeByEnding": {
        "nwd_curtain2": "nwd_ep3"
      },
      "nextTimeLines": [
        "David is sitting on two hundred and eleven thousand dollars.",
        "Somebody else has the address."
      ]
    },
    {
      "id": "nwd_ep2pt",
      "number": 2,
      "numberSuffix": "c",
      "title": "Past Tense",
      "kicker": "Nobody's Witness — the alternate",
      "tagline": "Act Two (alt) — better information, no allies.",
      "sceneIds": [
        "nwd_a2_pasttense",
        "nwd_br1"
      ],
      "startSceneId": "nwd_a2_pasttense",
      "titleCardImage": "/img/nw2/mo-rain-glass.jpg",
      "posterImage": "/img/nw2/mo-rain-glass.jpg",
      "titleCardSeconds": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep1",
          "endingSceneIds": [
            "nwd_curtain_pasttense"
          ]
        }
      ],
      "recapLines": [
        {
          "id": "nwd_rpt_1",
          "characterId": "narrator",
          "text": "You asked for the description, and she gave it in the past tense — corrected it once, and you let the four seconds go past."
        },
        {
          "id": "nwd_rpt_2",
          "characterId": "narrator",
          "text": "You didn't open the folder that night. You followed her home."
        }
      ],
      "nextEpisodeByEnding": {
        "nwd_br1": "nwd_ep2b"
      },
      "nextTimeByEnding": {
        "nwd_br1": [
          "That's not a case. That's a route somebody's drawn.",
          "Rental four hours north. Weekly, cash. Power on in his own name."
        ]
      }
    },
    {
      "id": "nwd_ep2te",
      "number": 2,
      "numberSuffix": "d",
      "title": "Two Envelopes",
      "kicker": "Nobody's Witness — the alternate",
      "tagline": "Act Two (alt) — two clients, and neither of them told the other.",
      "sceneIds": [
        "nwd_a2_envelopes",
        "nwd_br2"
      ],
      "startSceneId": "nwd_a2_envelopes",
      "titleCardImage": "/img/nw2/bg-office-night.jpg",
      "posterImage": "/img/nw2/bg-office-night.jpg",
      "titleCardSeconds": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep1",
          "endingSceneIds": [
            "nwd_curtain_twoenvelopes"
          ]
        }
      ],
      "recapLines": [
        {
          "id": "nwd_rte_1",
          "characterId": "narrator",
          "text": "Solomon cut you loose and placed an envelope on the arm of his chair. You took it."
        },
        {
          "id": "nwd_rte_2",
          "characterId": "narrator",
          "text": "You kept her folder and took his paper. Two envelopes, and neither of them told the other."
        }
      ],
      "nextEpisodeByEnding": {
        "nwd_br2": "nwd_ep2b"
      },
      "nextTimeByEnding": {
        "nwd_br2": [
          "Two clients want the same man found. That's not a conflict, that's efficiency.",
          "I drove it at the speed limit the whole way. Felt like the last decent thing available."
        ]
      }
    },
    {
      "id": "nwd_ep2tw",
      "number": 2,
      "numberSuffix": "e",
      "title": "Three Weeks",
      "kicker": "Nobody's Witness — the alternate",
      "tagline": "Act Two (alt) — best decision I ever made. Three weeks to enjoy it.",
      "sceneIds": [
        "nwd_a2_threeweeks",
        "nwd_br3"
      ],
      "startSceneId": "nwd_a2_threeweeks",
      "titleCardImage": "/img/nw2/bg-diner-int.jpg",
      "posterImage": "/img/nw2/bg-diner-int.jpg",
      "titleCardSeconds": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep1",
          "endingSceneIds": [
            "nwd_curtain_threeweeks"
          ]
        }
      ],
      "recapLines": [
        {
          "id": "nwd_rtw_1",
          "characterId": "narrator",
          "text": "She made her case, and you said no — and you were right."
        },
        {
          "id": "nwd_rtw_2",
          "characterId": "narrator",
          "text": "Three weeks later: a man in a rental four hours north. Nine days dead."
        }
      ],
      "nextEpisodeByEnding": {
        "nwd_br3": "nwd_ep2b"
      },
      "nextTimeByEnding": {
        "nwd_br3": [
          "They've got him as a robbery. Cash on the premises, gone.",
          "The last place a man was alive — permanently off the record."
        ]
      }
    },
    {
      "id": "nwd_ep2sn",
      "number": 2,
      "numberSuffix": "f",
      "title": "She's Not Answering",
      "kicker": "Nobody's Witness — the alternate",
      "tagline": "Act Two (alt) — this is no longer an investigation. It's a negotiation.",
      "sceneIds": [
        "nwd_a2_sheisnt",
        "nwd_br4"
      ],
      "startSceneId": "nwd_a2_sheisnt",
      "titleCardImage": "/img/nw2/bg-office-night.jpg",
      "posterImage": "/img/nw2/bg-office-night.jpg",
      "titleCardSeconds": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep1",
          "endingSceneIds": [
            "nwd_curtain_sheisnt"
          ]
        }
      ],
      "recapLines": [
        {
          "id": "nwd_rsn_1",
          "characterId": "narrator",
          "text": "You said her name in a pool hall to watch a man blink. Nothing happened in his face."
        },
        {
          "id": "nwd_rsn_2",
          "characterId": "narrator",
          "text": "Nineteen hours is all she had. Now Solomon is on the phone, and he says she's fine."
        }
      ],
      "nextEpisodeByEnding": {
        "nwd_br4": "nwd_ep2b"
      },
      "nextTimeByEnding": {
        "nwd_br4": [
          "Rental four hours north. Weekly, cash. The power's on in his own name.",
          "She's upstairs. She's had a cup of tea and she's extremely angry with you."
        ]
      }
    },
    {
      "id": "nwd_ep3",
      "number": 3,
      "unlockAfter": [
        {
          "episodeId": "nwd_ep2b"
        }
      ],
      "title": "Nobody's Witness",
      "kicker": "Nobody's Witness",
      "tagline": "Act Three — it's Wednesday. Friday's coming.",
      "sceneIds": [
        "nwd_call",
        "nwd_rosa",
        "nwd_mill",
        "nwd_mill_ask",
        "nwd_cost",
        "nwd_cost_ask",
        "nwd_bluecue",
        "nwd_bluecue_walk",
        "nwd_trade",
        "nwd_trade_violence",
        "nwd_trade_5b",
        "nwd_trade_ask",
        "nwd_trade_5c",
        "nwd_finale",
        "nwd_finale_a",
        "nwd_finale_a_told",
        "nwd_finale_a_quiet",
        "nwd_finale_b",
        "nwd_finale_b_told",
        "nwd_finale_b_quiet",
        "nwd_finale_c",
        "nwd_finale_d",
        "nwd_sn_p1",
        "nwd_sn_p2",
        "nwd_sn_p3",
        "nwd_sn_p4",
        "nwd_sn_p5",
        "nwd_sn_p5_told",
        "nwd_sn_p5_quiet",
        "nwd_sn_b_outro",
        "nwd_sn_d_outro"
      ],
      "startSceneId": "nwd_call",
      "titleCardImage": "/img/nw2/bg-final-street.jpg",
      "posterImage": "/img/nwd/ep3/poster-street.jpg",
      "titleCardSeconds": 3,
      "recapLines": [
        {
          "id": "nwd_r3_1",
          "characterId": "narrator",
          "gating": {
            "excludesFlags": [
              "david_already_dead"
            ]
          },
          "text": "One gunshot. Flat. Close. It sounded like a door slamming."
        },
        {
          "id": "nwd_r3_1tw",
          "characterId": "narrator",
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Nine days dead in a house on a dead-end street. The county called it a robbery before the coffee went cold."
        },
        {
          "id": "nwd_r3_2",
          "characterId": "narrator",
          "gating": {
            "excludesFlags": [
              "david_already_dead"
            ]
          },
          "text": "A phone buzzed in the grass for a long time. Nobody answered it."
        },
        {
          "id": "nwd_r3_2tw",
          "characterId": "narrator",
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "A phone rang and rang for nine days. Nobody answered it."
        },
        {
          "id": "nwd_r3_3",
          "characterId": "narrator",
          "image": "/img/nw2/bg-solomon-office.jpg",
          "gating": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "text": "Solomon put the whole debt on her — two-eleven and the father's eleven — and gave her until Friday."
        },
        {
          "id": "nwd_r3_3sn",
          "characterId": "narrator",
          "image": "/img/nw2/bg-solomon-office.jpg",
          "gating": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Solomon's had her since Tuesday, upstairs above a feed store. The whole debt on her — two-eleven and the father's eleven — and a man driving four hours north to be the worst news she'd ever had."
        },
        {
          "id": "nwd_r3_4",
          "characterId": "narrator",
          "text": "It's Wednesday."
        }
      ]
    }
  ],
  "layout": {
    "nwd_coldopen": {
      "x": -1320,
      "y": -300
    },
    "nwd_titles": {
      "x": -840,
      "y": -300
    },
    "nwd_diner": {
      "x": -440,
      "y": -260
    },
    "nwd_poolhall": {
      "x": 660,
      "y": 0
    },
    "nwd_poolhall_out": {
      "x": 880,
      "y": 0
    },
    "nwd_office": {
      "x": 1100,
      "y": 0
    },
    "nwd_warehouse": {
      "x": 1320,
      "y": 0
    },
    "nwd_curtain1": {
      "x": 1540,
      "y": 0
    },
    "nwd_diner_file": {
      "x": 260,
      "y": -180
    },
    "nwd_diner_take": {
      "x": 660,
      "y": -220
    },
    "nwd_warehouse_gold": {
      "x": 1320,
      "y": -220
    },
    "nwd_warehouse_escalate": {
      "x": 1540,
      "y": -220
    },
    "nwd_diner_desc": {
      "x": -60,
      "y": 360
    },
    "nwd_diner_refuse": {
      "x": 660,
      "y": 220
    },
    "nwd_poolhall_name": {
      "x": 880,
      "y": 220
    },
    "nwd_warehouse_offer": {
      "x": 1320,
      "y": 220
    },
    "nwd_warehouse_take": {
      "x": 1540,
      "y": 220
    },
    "nwd_curtain_pasttense": {
      "x": 220,
      "y": 380
    },
    "nwd_curtain_threeweeks": {
      "x": 660,
      "y": 440
    },
    "nwd_curtain_sheisnt": {
      "x": 880,
      "y": 440
    },
    "nwd_curtain_twoenvelopes": {
      "x": 1540,
      "y": 440
    },
    "nwd_laundromat": {
      "x": 0,
      "y": 660
    },
    "nwd_threeam": {
      "x": 220,
      "y": 660
    },
    "nwd_a2_pasttense": {
      "x": 440,
      "y": 660
    },
    "nwd_br1": {
      "x": 660,
      "y": 660
    },
    "nwd_a2_envelopes": {
      "x": 880,
      "y": 660
    },
    "nwd_br2": {
      "x": 1100,
      "y": 660
    },
    "nwd_a2_threeweeks": {
      "x": 1320,
      "y": 660
    },
    "nwd_br3": {
      "x": 1540,
      "y": 660
    },
    "nwd_a2_sheisnt": {
      "x": 1760,
      "y": 660
    },
    "nwd_br4": {
      "x": 1980,
      "y": 660
    },
    "nwd_48": {
      "x": 0,
      "y": 880
    },
    "nwd_pumps": {
      "x": 220,
      "y": 880
    },
    "nwd_interlude": {
      "x": 440,
      "y": 880
    },
    "nwd_rental": {
      "x": 660,
      "y": 880
    },
    "nwd_yard": {
      "x": 880,
      "y": 880
    },
    "nwd_curtain2": {
      "x": 1100,
      "y": 880
    },
    "nwd_call": {
      "x": -1500,
      "y": 1420
    },
    "nwd_rosa": {
      "x": -860,
      "y": 1140
    },
    "nwd_mill": {
      "x": -500,
      "y": 1100
    },
    "nwd_cost": {
      "x": 180,
      "y": 1160
    },
    "nwd_bluecue": {
      "x": 880,
      "y": 1100
    },
    "nwd_trade": {
      "x": 1100,
      "y": 1100
    },
    "nwd_trade_5b": {
      "x": 1320,
      "y": 1100
    },
    "nwd_trade_5c": {
      "x": 1540,
      "y": 1100
    },
    "nwd_finale": {
      "x": 1760,
      "y": 1100
    },
    "nwd_mill_ask": {
      "x": -160,
      "y": 1400
    },
    "nwd_cost_ask": {
      "x": 660,
      "y": 1320
    },
    "nwd_bluecue_walk": {
      "x": 880,
      "y": 1320
    },
    "nwd_trade_violence": {
      "x": 1100,
      "y": 1320
    },
    "nwd_trade_ask": {
      "x": 1320,
      "y": 1320
    },
    "nwd_finale_a": {
      "x": 440,
      "y": 1540
    },
    "nwd_finale_a_told": {
      "x": 660,
      "y": 1540
    },
    "nwd_finale_a_quiet": {
      "x": 880,
      "y": 1540
    },
    "nwd_finale_b": {
      "x": 1100,
      "y": 1540
    },
    "nwd_finale_b_told": {
      "x": 1320,
      "y": 1540
    },
    "nwd_finale_b_quiet": {
      "x": 1540,
      "y": 1540
    },
    "nwd_finale_c": {
      "x": 1760,
      "y": 1540
    },
    "nwd_finale_d": {
      "x": 1980,
      "y": 1540
    },
    "nwd_sn_p1": {
      "x": -800,
      "y": 1780
    },
    "nwd_sn_p2": {
      "x": -420,
      "y": 1780
    },
    "nwd_sn_p3": {
      "x": -20,
      "y": 1780
    },
    "nwd_sn_p4": {
      "x": 600,
      "y": 1820
    },
    "nwd_sn_p5": {
      "x": 880,
      "y": 1760
    },
    "nwd_sn_p5_told": {
      "x": 1100,
      "y": 1760
    },
    "nwd_sn_b_outro": {
      "x": 1320,
      "y": 1760
    },
    "nwd_sn_p5_quiet": {
      "x": 1100,
      "y": 1980
    },
    "nwd_sn_d_outro": {
      "x": 1320,
      "y": 1980
    },
    "nwd_follow_home": {
      "x": 1100,
      "y": 440
    },
    "nwd_lit_window": {
      "x": 1320,
      "y": 440
    },
    "nwd_office_rent": {
      "x": 1760,
      "y": 440
    },
    "nwd_office_vera": {
      "x": 1980,
      "y": 440
    },
    "nwd_office_take": {
      "x": 2200,
      "y": 440
    }
  },
  "flagNotes": {
    "nwd_d1a": "D1-A — asked what David looks like. Vera slipped into the past tense ('used to say that' → 'say that') and Jack let the four seconds go past.",
    "nwd_followed_home": "D1-A — Jack didn't open the folder that night; he followed Vera home. (Feeds the Act Two alt opening 'Past Tense.')",
    "nwd_d1b": "D1-B — refused the case at the offer. He was right. It didn't matter. He watched her sit in an unstarted car for eleven minutes, found Sal's second notice on the door the next morning, and called her back. The refusal is a delay, not a fork — it always caves, and merges at the Blue Cue.",
    "nwd_d2": "D2 — said Vera's name in the pool hall to watch Moe blink. Nothing happened in his face. Solomon has a name now; Vera had nineteen hours. (The ambush and the warehouse never happen; feeds 'She's Not Answering.')",
    "nwd_d4": "D4 — let Solomon cut the zip tie and make the offer. (Feeds 'Two Envelopes.')",
    "nwd_d4_taken": "D4 — took the envelope. Same job, two hundred a day, and a number he won't name yet.",
    "rosa_absent": "Rosa is off the case from here on. Her Act Three scenes are skipped; one line of Jack narration covers the gap. (Past Tense / She's Not Answering)",
    "knew_past_tense": "Jack clocked the past-tense description. He can call Vera on it at the mill lot — unlocks an extra exchange.",
    "folder_read_late": "Jack read the folder at home, late, alone — no Rosa, no calls. The utility bill is his own find.",
    "on_payroll": "Jack is working both sides — Vera's folder and Solomon's envelope. (Two Envelopes)",
    "doc_suspicious": "Doc Sato heard it on Jack down a phone line. He knows something is off.",
    "trade_worthless": "The Act Three trade is worthless — Solomon already owns him. Three lines change; forces Ending D.",
    "refused_case": "Jack refused the case. He's the only person smart enough to say no to her — and now a suspect. (Three Weeks)",
    "rosa_adversarial": "Rosa's Act Three dialogue plays cold; she's building a file, not helping. (Three Weeks)",
    "david_already_dead": "David is already dead, nine days. The rental plays as a crime scene and the kill plays as aftermath — gated variants of the shared scenes, so the route stays line-level. (Three Weeks)",
    "arrives_after": "Jack arrives at the rental after the death. (Three Weeks)",
    "vera_held": "Solomon has Vera, upstairs above the feed store. Act Three inverts — negotiating, not investigating; the trade happens earlier. (She's Not Answering)",
    "errand_for_solomon": "Jack's errand is Solomon's: deliver the news that leads to David. The death plays with that weight on him.",
    "bag_examined": "The player looked in her car at the mill lot: no bag. She hasn't packed. Required for Endings A and B — she only stays if the player noticed.",
    "saw_rosas_cost": "The player examined Rosa's transfer form in Part 4. The Careful route: pays attention to people. Unlocks her Exit line in C and the 'ability to leave' seed in the Trade.",
    "knows_theyre_armed": "The player examined Moe's jacket at the Blue Cue. The Trade's tension beat becomes dread instead of surprise.",
    "knows_david_protected_her": "Desh's line landed: 'Six hundred bucks got us the house. Nothing got us her.' Without it, Endings A and B are unreachable — Jack has nothing to tell Vera.",
    "skipped_bluecue": "The player went straight to the feed store and never heard Desh's line. The most common way to lose the good endings without knowing.",
    "violence": "A hard flag toward Ending D: swung at Moe, or moved during the hold-still beat in the Trade. Locks out Ending C permanently.",
    "saw_watch": "Seen-route object 1: the player noticed the stopped watch in the Interlude.",
    "saw_ash_street": "Seen-route object 2: the player looked at Ash Street from Rosa's car.",
    "saw_own_file": "Seen-route object 3: the player examined the 2015 file with Jack's own name on it. Also unlocks the curiosity-ask.",
    "seen_route": "All three Seen objects examined — the player who looked at the most is denied the final conversation. Ending C.",
    "solomon_respects_jack": "The player asked why Solomon kept the file; he gave the 'curiosity' speech.",
    "she_confessed_early": "Vera admitted (past-tense ask) that she knew before the yard.",
    "rosa_acknowledged": "The player asked Rosa what she's giving up. Required for her Ending C exit line to land.",
    "debt_cleared": "The Trade happened: 'Vera Voss owes me nothing.' Set whenever the deal completes.",
    "jack_ruined": "Jack handed over sixteen years: license, files, the one thing he wouldn't sell.",
    "friday_deadline": "The deadline is formal: Friday. Set in Part 4.",
    "vera_went_to_rosa": "Vera was at the station two hours before Part 4 — asking how to make it land on her.",
    "caused_davids_death": "D2 — Jack's errand delivered the sentence that got David shot. 'Right, I'll bring it back.' Jack carries it into the finale.",
    "lied_about_it": "D2 — to Vera's 'Did he know?', Jack said no. He knew. The film lets him.",
    "rosa_uncalled_twice": "D2 — Jack dialed Rosa twice at three in the morning and hung up before it connected: a badge into that room would have ended with Vera in a cell.",
    "trade_refused": "D2 — the trade is unique here: Solomon declines the offer. The name in the pool hall already set the price. The debt stays on Vera.",
    "timer_expired": "The Friday clock ran out before Part 5: an extra stop in Act Three (the past-tense exchange at the mill lot, or asking Rosa what she's giving up) spends the last of the two days. With the Seen route open, forces Ending C.",
    "act3v_call": "Visit budget (engine bookkeeping): the diner call is the first Act Three location.",
    "act3v_rosa": "Visit budget (engine bookkeeping): Rosa's car.",
    "act3v_mill": "Visit budget (engine bookkeeping): the mill lot.",
    "act3v_millask": "Visit budget (engine bookkeeping): the past-tense exchange at the mill lot — an extra stop.",
    "act3v_cost": "Visit budget (engine bookkeeping): Rosa's car, second pass.",
    "act3v_costask": "Visit budget (engine bookkeeping): asking Rosa what she's giving up — an extra stop.",
    "act3v_bluecue": "Visit budget (engine bookkeeping): the Blue Cue. The budget is six locations; a detour before the Trade spends Friday.",
    "act3v_trade": "Visit budget (engine bookkeeping): the feed store. Reaching Part 5 inside the budget keeps the deadline.",
    "vera_confessed": "Vera's confession played — the mill lot, or upstairs above the feed store on the D2 route.",
    "eleven_hours_known": "Jack knows the eleven hours: the number, the not-calling, the arithmetic. Set at the mill lot — or upstairs, on the D2 route.",
    "friday_deadline_known": "Jack knows about Friday.",
    "nwd_followed_no": "Legacy flag from the cut follow-home beat. The rewrite does not set this: Jack never leaves the booth.",
    "nwd_window_watched": "Legacy flag from the cut lit-window beat.",
    "nwd_rent_call": "Legacy flag from the cut 2am landlord call. Replaced by the notice on the door.",
    "nwd_rent_read": "The second notice. Two hundred a day. Fourteen days. It isn't even close.",
    "nwd_folder_taken": "The folder is back in his hands. She left it behind the diner counter with the morning shift — the one building in town where she knew he'd be sitting anyway.",
    "nwd_rehired": "He called Vera back in daylight and took the case on the phone — same price, no napkin, folder from behind the counter. He's on his way to The Blue Cue.",
    "nwd_said_no": "D1-B — he said the word “No” to her face. It cost him a point of her trust. She did not spend it on the phone.",
    "nwd_watched_lot": "D1-B — he did not follow her. He watched from the booth: she sat in an unstarted car for eleven minutes. Nowhere to be.",
    "nwd_door_notice": "D1-B — second notice, taped at eye level, found in daylight. Fourteen days. Sal Hirsch doesn't send a third."
  },
  "items": [
    {
      "id": "nwd_folder",
      "name": "The Folder",
      "icon": "🗂",
      "iconUrl": "/img/nw2/bg-folder.jpg",
      "description": "Vera's folder on David Voss. Worn soft at the corners — handled and reread.",
      "flavorText": "No napkin, no line. A folder, a name I didn't like.",
      "isClue": true
    },
    {
      "id": "nwd_printout",
      "name": "Rosa's Printout",
      "icon": "📄",
      "description": "Bus ticket, cash, nine days ago — and a motel clerk who remembers him because he tipped.",
      "flavorText": "Nobody kidnaps a man and lets him tip a motel clerk.",
      "isClue": true
    },
    {
      "id": "nwd_envelope",
      "name": "Solomon's Envelope",
      "icon": "✉️",
      "description": "Set on the arm of the folding chair. Not slid. Placed. Sealed.",
      "flavorText": "A number at the end of it that he won't insult you by naming yet.",
      "isClue": true
    }
  ],
  "characters": [
    {
      "id": "jack",
      "name": "Jack Morrow",
      "role": "Private investigator — the only one who doesn't work for Solomon",
      "avatarUrl": "/img/ch-jack-morrow.jpg",
      "trustMeter": 0,
      "elevenVoiceId": "MZhx7pKflsc0sAwciDEy"
    },
    {
      "id": "vera",
      "name": "Vera Voss",
      "role": "The client — Kessler, before David",
      "avatarUrl": "/img/ch-vera-voss.jpg",
      "trustMeter": 0,
      "elevenVoiceId": "4Rn2L1CRjYh93G56jNXI"
    },
    {
      "id": "rosa",
      "name": "Rosa",
      "role": "Detective — the only one who isn't lying to him",
      "avatarUrl": "/img/ch-rosa.jpg",
      "trustMeter": 2
    },
    {
      "id": "solomon",
      "name": "Solomon Reyes",
      "role": "Curates debts",
      "avatarUrl": "/img/ch-solomon-reyes.jpg",
      "trustMeter": -1
    },
    {
      "id": "david",
      "name": "David Voss",
      "role": "Missing. Or not missing the way you were told",
      "avatarUrl": "/img/ch-david-voss.jpg",
      "trustMeter": 0
    },
    {
      "id": "moe",
      "name": "Moe",
      "role": "The far end of things",
      "avatarUrl": "/img/ch-moe.jpg",
      "trustMeter": 0
    },
    {
      "id": "desh",
      "name": "Desh",
      "role": "The other far end of things",
      "avatarUrl": "/img/ch-desh.jpg",
      "trustMeter": 0
    },
    {
      "id": "ted",
      "name": "Ted",
      "role": "A man with a daughter",
      "avatarUrl": "emoji:😰",
      "trustMeter": 0
    },
    {
      "id": "gary",
      "name": "Gary",
      "role": "Coveralls. Hot tubs is decent money.",
      "avatarUrl": "emoji:🧰",
      "trustMeter": 0
    },
    {
      "id": "denny",
      "name": "Denny",
      "role": "That's knowing with a hat on",
      "avatarUrl": "emoji:🍟",
      "trustMeter": 0
    },
    {
      "id": "sato",
      "name": "Doc Sato",
      "role": "Can pull a name and an address",
      "avatarUrl": "emoji:🩺",
      "trustMeter": 0
    },
    {
      "id": "bartender",
      "name": "Bartender (V.O.)",
      "role": "Real calm. Like a guy who already made up his mind.",
      "avatarUrl": "emoji:☎",
      "trustMeter": 0
    },
    {
      "id": "hirsch",
      "name": "Sal Hirsch",
      "role": "Landlord — the only bill in town that doesn't lie",
      "avatarUrl": "emoji:☎",
      "trustMeter": 0
    }
  ],
  "scenes": [
    {
      "id": "nwd_coldopen",
      "title": "Cold Open",
      "nodeType": "cutscene",
      "background": "/uploads/nobodys-witness-draft/1787844217219-53cgjbr.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "musicMode": "none",
      "transition": "fade-black",
      "transitionSpeed": 1.6,
      "letterbox": true,
      "choiceDelaySeconds": 7,
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.42,
        "lights": [
          {
            "x": 50,
            "y": 48,
            "color": "#ffb761",
            "intensity": 0.34,
            "size": 10,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.35
          }
        ],
        "foregroundImage": "/uploads/nobodys-witness-draft/1787844241863-k4rsmzs.png",
        "foregroundZoom": 1.1,
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.45
      },
      "prose": "Silence. Then, low and close: the sodium light from the mill lot, buzzing. Rain. Nothing else.\n\nA wet chain-link fence, out of focus. A single working light behind it. We don't know where we are yet.",
      "dialogueBeats": [
        {
          "id": "nwd_co_1",
          "characterId": "jack",
          "expression": "V.O. — flat, no context given, could be any point in the story",
          "text": "Straight.... You leave a straight line, and everybody stands in it...... No of us get out the way.",
          "audioUrl": "/uploads/nobodys-witness-draft/1787845601723-0ssvo8k.wav"
        },
        {
          "id": "nwd_co_3",
          "characterId": "narrator",
          "expression": "V.O. — the cut",
          "backgroundTransition": "cut",
          "text": "(Gunshot in the distance)",
          "backgroundTransitionSpeed": 1.9,
          "afterBeatMode": "auto",
          "afterBeatDelaySeconds": 1,
          "audioUrl": "/uploads/nobodys-witness-draft/1787844883836-w8js3o3.wav"
        },
        {
          "id": "b_pwahg2a",
          "characterId": "jack",
          "text": "",
          "audioUrl": "gradient:linear-gradient(#000,#000)",
          "afterBeatTargetSceneId": "nwd_titles",
          "afterBeatMode": "auto",
          "afterBeatDelaySeconds": 1.5,
          "backgroundTransitionSpeed": 0,
          "backgroundTransition": "cut",
          "background": "/uploads/nobodys-witness-draft/1787913053514-7w3ux4z.jpg"
        }
      ],
      "choices": [
        {
          "id": "nwd_co_go",
          "text": "…",
          "targetSceneId": "nwd_titles",
          "attitudeTag": "Neutral",
          "isRepeatable": false
        }
      ],
      "hotspots": [],
      "noTypewriter": true,
      "autoNarrate": false
    },
    {
      "id": "nwd_titles",
      "title": "Nobody's Witness",
      "nodeType": "credits",
      "background": "/img/style/nw2-signature-a-neon80s.jpg",
      "ambientAudio": "rain",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "noTypewriter": true,
      "transition": "cut",
      "letterbox": true,
      "choiceDelaySeconds": 26,
      "credits": {
        "title": "NOBODY'S WITNESS",
        "subtitle": "Population four thousand, and falling",
        "titleEntrance": "slam",
        "titleColor": "#f5c518",
        "accentColor": "#f5c518",
        "style": "cards",
        "cardMotion": "slam",
        "cardSeconds": 3.2,
        "font": "poster",
        "gateWeave": "worn",
        "montageTransition": "cut",
        "montageSeconds": 3.5,
        "montageLoop": true,
        "montage": [
          "/img/style/nw2-signature-a-neon80s.jpg",
          "gradient:linear-gradient(#000,#000)",
          "/img/nw2/mo-mainstreet.jpg",
          "/img/nw2/mo-mill.jpg",
          "gradient:linear-gradient(#000,#000)",
          "/img/nw2/mo-neon-tube.jpg",
          "/img/nw2/mo-diner-ext.jpg",
          "/img/nw2/mo-rain-glass.jpg",
          "/img/style/nw2-signature-a-neon80s.jpg"
        ],
        "lines": [
          {
            "role": "A Neo-Noir in Three Acts",
            "name": "Gaslight Reelworks"
          },
          {
            "role": "Starring",
            "name": "Jack Morrow"
          },
          {
            "role": "And",
            "name": "Vera Voss"
          },
          {
            "role": "Act One",
            "name": "The Woman Who Sold Herself Twice"
          }
        ]
      },
      "prose": "NOBODY'S WITNESS\n\nBlackwood — population four thousand, and falling\n\nAct One — The Woman Who Sold Herself Twice",
      "choices": [
        {
          "id": "nwd_ti_go",
          "text": "Blackwood Diner. Eleven forty-seven.",
          "targetSceneId": "nwd_diner",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "dialogueBeats": [],
      "musicFadeSeconds": 0.5
    },
    {
      "id": "nwd_diner",
      "title": "Part 1 — The Woman Who Sold Herself Twice",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "drone",
      "particles": "none",
      "musicMode": "track",
      "musicFadeSeconds": 1.1,
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.2
      },
      "prose": "Rain on glass, a ceiling fan ticking in slow lazy circles, a diner hum underneath. Eleven forty-seven. Same booth most nights, phone turned face-down.",
      "noTypewriter": true,
      "dialogueBeats": [
        {
          "id": "nwd_d_vo0",
          "characterId": "jack",
          "expression": "V.O. — flat, from somewhere further on",
          "text": "Nobody took what I lost. I handed it over. In order. So when I tell you I didn't see it coming — I saw it. That's the only thing I need you to believe.",
          "audioUrl": "/uploads/nobodys-witness-draft/1787845826388-24aekf7.mp3"
        },
        {
          "id": "nwd_d_vo0b",
          "characterId": "jack",
          "expression": "V.O. — settling into the scene, still spare",
          "text": "Eleven forty-seven. Blackwood Diner. Same booth most nights, phone turned face-down because I already know who's not calling.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238562-574jhtr.mp3"
        },
        {
          "id": "nwd_d_vo0c",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Blackwood. Mill closed in '09, then everything that fed it. Four thousand people left, a clinic with a waiting list, and Solomon Reyes, who employs more of this town than the county does. Nobody here's bad. They're hungry. Different thing.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238564-hqsdwn4.mp3"
        },
        {
          "id": "nwd_d_vo0d",
          "characterId": "jack",
          "expression": "V.O. — quiet",
          "text": "She didn't scan the room. Walked straight to my booth. Like she'd already had this conversation in her head a few times before her body caught up.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238566-iaddvpd.mp3",
          "background": "/uploads/nobodys-witness-draft/1787849549159-ineildq.jpg"
        },
        {
          "id": "nwd_d_v1",
          "characterId": "vera",
          "expression": "direct, flat",
          "text": "They told me you're the only one in this town who doesn't work for Solomon Reyes.",
          "background": "/uploads/nobodys-witness-draft/1787849549159-ineildq.jpg",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238567-4jkwsaz.mp3"
        },
        {
          "id": "nwd_d_j1",
          "characterId": "jack",
          "expression": "not looking up yet",
          "text": "Who's they.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238569-9nkiw9n.mp3"
        },
        {
          "id": "nwd_d_v2",
          "characterId": "vera",
          "expression": "sitting",
          "text": "Just people, you know how they talk. and they all said it the same way, like it was the only thing about you worth Knowing........ Vera Voss",
          "background": "/uploads/nobodys-witness-draft/1787849580118-3s21mo4.jpg",
          "backgroundTransitionSpeed": 1.2,
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238570-9g0xoix.mp3"
        },
        {
          "id": "nwd_d_j2",
          "characterId": "jack",
          "expression": "dry, still not looking up",
          "text": "Mrs. Voss. That make this personal or professional?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238572-c23fn2k.mp3"
        },
        {
          "id": "nwd_d_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I looked up. Not beautiful, exactly — held together with both hands, hoping nobody noticed the effort.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238573-cukiv8h.mp3"
        },
        {
          "id": "nwd_d_j3",
          "characterId": "jack",
          "expression": "direct, but kinder than usual",
          "text": "What can I do for you.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238574-l5j7r41.mp3"
        },
        {
          "id": "nwd_d_v3",
          "characterId": "vera",
          "expression": "straightforward, no games, a small crack in the composure",
          "text": "My husband's missing. Three weeks now. Cops filed it, did nothing, told me he probably just left. I don't believe that. And I need somebody better than the cops to find out if I'm wrong.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238576-t3zz5dr.mp3"
        },
        {
          "id": "nwd_d_j4",
          "characterId": "jack",
          "expression": "professional, careful",
          "text": "Missing people usually want to stay missing. You sure you want him found?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238578-y9fsjcx.mp3",
          "background": "/uploads/nobodys-witness-draft/1787913615592-d20pv44.jpg"
        },
        {
          "id": "nwd_d_v4",
          "characterId": "vera",
          "expression": "a beat — quieter, honest",
          "text": "I want to know where he is. What I feel about that once I know is my own business.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238579-vo85ml9.mp3"
        },
        {
          "id": "nwd_d_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "First real answer all night. And I remember deciding, right there, that I was going to believe her. Not that I did. That I was going to.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238581-sso9eng.mp3"
        },
        {
          "id": "nwd_d_j5",
          "characterId": "jack",
          "expression": "opening the folder, scanning",
          "text": "Name?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238582-12emzit.mp3"
        },
        {
          "id": "nwd_d_v5",
          "characterId": "vera",
          "expression": "plain",
          "text": "David Voss.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238583-md7img3.mp3",
          "afterBeatTargetSceneId": "nwd_diner_file",
          "afterBeatMode": "auto",
          "afterBeatDelaySeconds": 1.5
        }
      ],
      "choices": [
        {
          "id": "nwd_d_gold",
          "text": "Say nothing. Keep working the file.",
          "targetSceneId": "nwd_diner_file",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_d_d1a",
          "text": "Describe him for me.",
          "targetSceneId": "nwd_diner_desc",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_d1a"
            ]
          }
        }
      ],
      "hotspots": [],
      "onEnterActions": [],
      "musicUrl": "/uploads/nobodys-witness-draft/1787847428747-cokhzj2.mp3",
      "autoNarrate": false
    },
    {
      "id": "nwd_diner_file",
      "title": "Part 1 — The Woman Who Sold Herself Twice",
      "background": "/uploads/nobodys-witness-draft/1787868446197-pc9x8yr.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "cut",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "",
      "dialogueBeats": [
        {
          "id": "nwd_d_vo3",
          "characterId": "jack",
          "expression": "V.O. — low, going still",
          "text": "I knew the name. Blackwood's four thousand people and half of them owe Solomon Reyes something — David Voss ran his money, everybody knew that the way you know which houses have somebody in them. So a man who works for Solomon disappears, and his wife comes to the one person in town who isn't owned by Solomon. That's not a coincidence. That's a shape.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787930331445-d48nv56.mp3"
        },
        {
          "id": "nwd_d_vo3b",
          "characterId": "jack",
          "expression": "V.O. — quieter",
          "text": "I looked at the shape for about as long as it takes to read this sentence, and then I put it somewhere I wouldn't have to look at it again, and I asked her what he was wearing when she saw him last.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238589-3gq6qia.mp3"
        },
        {
          "id": "nwd_d_j6",
          "characterId": "jack",
          "expression": "careful, direct",
          "text": "Your husband do business with Solomon Reyes?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238590-8m1qrax.mp3"
        },
        {
          "id": "nwd_d_v6",
          "characterId": "vera",
          "expression": "even, unbothered on the surface",
          "text": "Yes.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238591-jrrm8ye.mp3"
        },
        {
          "id": "nwd_d_j7",
          "characterId": "jack",
          "expression": "a little surprised she just said it",
          "text": "Most people dance around that question.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238593-jxhnxiy.mp3"
        },
        {
          "id": "nwd_d_v7",
          "characterId": "vera",
          "expression": "flat, tired underneath",
          "text": "I'm not most people. I don't have time to dance, Mr. Morrow. I have three weeks of nothing and a folder full of everything I could find. You want to help me or not?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238595-ois9bgc.mp3"
        },
        {
          "id": "nwd_d_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I liked her for that.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238596-vbt7eb5.mp3"
        },
        {
          "id": "nwd_d_j8",
          "characterId": "jack",
          "expression": "direct",
          "text": "One thing first. Your three people. Did any of them tell you why I don't work for him, or did they just leave it at the fact?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238597-tk65q3j.mp3"
        },
        {
          "id": "nwd_d_v8",
          "characterId": "vera",
          "expression": "evenly",
          "text": "They said you were a detective for sixteen years and then you weren't, and that Solomon had something to do with which one it was. Nobody said more than that.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238599-8d79evm.mp3"
        },
        {
          "id": "nwd_d_j9",
          "characterId": "jack",
          "expression": "flat",
          "text": "There was a file. Solomon's name in it. I was asked to lose it. Didn't. Asked again by somebody higher up. Didn't again.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238601-d0psv83.mp3"
        },
        {
          "id": "nwd_d_v9",
          "characterId": "vera",
          "expression": "quiet",
          "text": "And?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238602-yvgs8aj.mp3"
        },
        {
          "id": "nwd_d_j10",
          "characterId": "jack",
          "expression": "dry",
          "text": "Nobody charged me with anything. Isn't how it works here. They just made me somebody nothing gets assigned to. Eleven months at that desk. Then I quit and called it a decision.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238604-0jvl8hu.mp3"
        },
        {
          "id": "nwd_d_v10",
          "characterId": "vera",
          "expression": "quiet",
          "text": "And the file?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238605-m7w09sr.mp3"
        },
        {
          "id": "nwd_d_j11",
          "characterId": "jack",
          "expression": "dry",
          "text": "Lost. Just not by me. That's the part I got to keep.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238607-g6dqso1.mp3"
        },
        {
          "id": "nwd_d_vo5",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "That's the whole story. People in Blackwood think it's tragic. It isn't. Tragic would've been fast. What actually happened is I said no to a thing one time, correctly, and then nothing else happened to me for ten years.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238609-l8sgsud.mp3"
        },
        {
          "id": "nwd_d_j12",
          "characterId": "jack",
          "expression": "leaning back, gentler this time, not testing her so much as actually asking",
          "text": "You're awfully calm for a woman whose husband might be hiding from a guy like Reyes.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238610-tkham1d.mp3"
        },
        {
          "id": "nwd_d_v11",
          "characterId": "vera",
          "expression": "quiet, and for a second, something real underneath the control",
          "text": "I've had three weeks to get calm about it. Don't mistake it for not caring. I care. I just don't have anybody left to fall apart in front of.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238612-nmxz1le.mp3"
        },
        {
          "id": "nwd_d_vo6",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Truth and performance, same room, taking turns. I picked. I want that on the record.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238613-m7sjhkp.mp3"
        }
      ],
      "choices": [
        {
          "id": "nwd_df_gold",
          "text": "Name your price.",
          "targetSceneId": "nwd_diner_take",
          "attitudeTag": "Neutral",
          "consequences": {
            "addItems": [
              "nwd_folder"
            ]
          }
        },
        {
          "id": "nwd_df_d1b",
          "text": "No.",
          "targetSceneId": "nwd_diner_refuse",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_d1b",
              "nwd_said_no"
            ],
            "removeItems": [
              "nwd_folder"
            ],
            "trustChanges": [
              {
                "characterId": "vera",
                "delta": -1
              }
            ]
          },
          "memoryLog": "nwd_said_no",
          "rememberLine": "Vera will remember that."
        }
      ],
      "hotspots": [],
      "onEnterActions": [],
      "transitionSpeed": 0.1
    },
    {
      "id": "nwd_diner_take",
      "title": "Part 1 — The Woman Who Sold Herself Twice",
      "partBreak": "Act One, Part 1 — The Woman Who Sold Herself Twice",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "Rain against the window. The folder, a hand's width from his.",
      "dialogueBeats": [
        {
          "id": "nwd_d_j13",
          "characterId": "jack",
          "expression": "businesslike, but softer",
          "text": "Alright. Two hundred a day plus expenses. I find him, I tell you where he is. What you do after that's yours to carry."
        },
        {
          "id": "nwd_d_v12",
          "characterId": "vera",
          "expression": "standing, sliding the folder the rest of the way to him",
          "text": "Thank you. I mean that."
        },
        {
          "id": "nwd_d_j14",
          "characterId": "jack",
          "expression": "half-smiling",
          "text": "You always this easy to negotiate with?"
        },
        {
          "id": "nwd_d_v13",
          "characterId": "vera",
          "expression": "putting her coat back into place, something unreadable and a little sad in her face",
          "text": "No. You just haven't asked for anything worth fighting over yet."
        },
        {
          "id": "nwd_d_vo7",
          "characterId": "jack",
          "expression": "V.O. — flat, her footsteps retreating, the bell chiming",
          "text": "No napkin, no line. A folder, a name I didn't like, and a woman too honest to be lying about all of it."
        },
        {
          "id": "nwd_d_vo8",
          "characterId": "jack",
          "expression": "V.O. — flat, papers shifting, a long exhale",
          "text": "Smart move was letting it go. I'm not smart about that."
        },
        {
          "id": "nwd_d_vo9",
          "characterId": "jack",
          "expression": "V.O. — flat, a match striking",
          "text": "Lonely, dressed up as a work ethic. I turned the page."
        }
      ],
      "choices": [
        {
          "id": "nwd_dt_go",
          "text": "The Blue Cue. First name on the list.",
          "targetSceneId": "nwd_poolhall",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_diner_desc",
      "title": "Part 1 (alt) — The Description",
      "partBreak": "Act One, Part 1 (alt) — The Description",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "Rain. The fan. Jack going still for half a second.",
      "dialogueBeats": [
        {
          "id": "nwd_da_vo1",
          "characterId": "jack",
          "expression": "V.O. — low",
          "text": "I knew the name. Blackwood's four thousand people and half of them owe Solomon Reyes something — David Voss ran his money, everybody knew that the way you know which houses have somebody in them.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238615-zwy5l7j.mp3"
        },
        {
          "id": "nwd_da_v1",
          "characterId": "vera",
          "expression": "easily",
          "text": "You'll have a photo in there.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238616-cdvazre.mp3"
        },
        {
          "id": "nwd_da_j2",
          "characterId": "jack",
          "expression": "flat, notebook out",
          "text": "I'll have a photo. I want it from you.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238618-3m5ljbm.mp3"
        },
        {
          "id": "nwd_da_v2",
          "characterId": "vera",
          "expression": "plain",
          "text": "Why.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238623-1x03rj5.mp3"
        },
        {
          "id": "nwd_da_j3",
          "characterId": "jack",
          "expression": "flat — a beat before the last sentence",
          "text": "Because a photo tells me what a man looked like on the day somebody took it. You've been married eleven years.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238625-i24ui0j.mp3"
        },
        {
          "id": "nwd_da_s1",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "She picks up the coffee she hasn't touched all night, and doesn't drink it."
        },
        {
          "id": "nwd_da_v3",
          "characterId": "vera",
          "expression": "measured",
          "text": "He was about six foot. Six one.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238627-xx1r1xh.mp3"
        },
        {
          "id": "nwd_da_s2",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "Jack's pen stopping."
        },
        {
          "id": "nwd_da_v4",
          "characterId": "vera",
          "expression": "continuing, not noticing — or noticing perfectly",
          "text": "He had a scar through the left eyebrow — bike, when he was nine. His hands were bigger than they should have been for his size. People used to say that.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238629-lbsnmqo.mp3"
        },
        {
          "id": "nwd_da_j4",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Used to.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238631-j3vvcwz.mp3"
        },
        {
          "id": "nwd_da_v5",
          "characterId": "vera",
          "expression": "a beat",
          "text": "People say that.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238633-ik2omvg.mp3"
        },
        {
          "id": "nwd_da_s3",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "Rain. The fan. Neither of them moving."
        },
        {
          "id": "nwd_da_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "There it is. Three days into this job I'd have caught that in my sleep. It took me four seconds and I let it go past.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238635-sit4cix.mp3"
        },
        {
          "id": "nwd_da_v6",
          "characterId": "vera",
          "expression": "levelly, and she knows",
          "text": "Is that useful?",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238636-qhf7ori.mp3"
        },
        {
          "id": "nwd_da_j5",
          "characterId": "jack",
          "expression": "flat",
          "text": "It's a start.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238638-928mn2j.mp3"
        },
        {
          "id": "nwd_da_s4",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "Her standing. The booth releasing. The folder sliding across."
        },
        {
          "id": "nwd_da_v7",
          "characterId": "vera",
          "expression": "even",
          "text": "Two hundred a day, you said.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238640-suqsjog.mp3"
        },
        {
          "id": "nwd_da_j6",
          "characterId": "jack",
          "expression": "flat",
          "text": "Plus expenses.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238642-da6n8m6.mp3"
        },
        {
          "id": "nwd_da_v8",
          "characterId": "vera",
          "expression": "at the edge of the booth, and this is the only time in the film she sounds uncertain — a beat after 'don't like'",
          "text": "Mr. Morrow. If you find something you don't like — I'd rather hear it from you than from anybody else. That's all I'm asking for on top.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238644-e6t2vwb.mp3"
        },
        {
          "id": "nwd_da_j7",
          "characterId": "jack",
          "expression": "quiet",
          "text": "That's not an unusual thing to ask.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238646-7szvatc.mp3"
        },
        {
          "id": "nwd_da_v9",
          "characterId": "vera",
          "expression": "flat — a beat before the last sentence",
          "text": "No. It's what everybody asks. Hardly anybody means it.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238648-7gz9a6a.mp3"
        },
        {
          "id": "nwd_da_s5",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "The bell. The door. Rain swelling, then muffled."
        },
        {
          "id": "nwd_da_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "She'd talked about him in the past tense and then corrected it, and asked me to bring bad news to her personally, and I let her walk out into the rain.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238650-0wvw312.mp3"
        },
        {
          "id": "nwd_da_s6",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain. The fan. Jack not opening the folder."
        },
        {
          "id": "nwd_da_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'why'",
          "text": "I didn't open the folder that night. I've thought about why. Best I can manage is: the folder was hers, and I'd just watched her be careless in front of me for four seconds, and I wanted to see the careless one again before I read the careful one.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238653-we478ka.mp3"
        },
        {
          "id": "nwd_da_s7",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Coins on the table. A chair. Footsteps."
        },
        {
          "id": "nwd_da_vo5",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "So I followed her home.",
          "audioUrl": "/uploads/nobodys-witness-draft/voice-1787878238655-q5kor5h.mp3"
        }
      ],
      "choices": [
        {
          "id": "nwd_da_go",
          "text": "Follow her home.",
          "targetSceneId": "nwd_curtain_pasttense",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "nwd_followed_home"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_diner_refuse",
      "title": "Part 1 (alt) — The One Who Said No",
      "partBreak": "Act One, Part 1 (alt) — The One Who Said No",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.2
      },
      "prose": "The folder on the table between them. Neither hand on it.",
      "dialogueBeats": [
        {
          "id": "nwd_db_v1",
          "characterId": "vera",
          "text": "No?",
          "expression": "flat"
        },
        {
          "id": "nwd_db_j1",
          "characterId": "jack",
          "text": "Can I ask you something first. Have you been to the depot?",
          "expression": "flat"
        },
        {
          "id": "nwd_db_v2",
          "characterId": "vera",
          "text": "Day two. And the clinic, and both bars he used, and his sister in Fairview who hasn't spoken to him since March. I've done all of it, Mr. Morrow. I'm not an idiot.",
          "expression": "flat — a beat after March"
        },
        {
          "id": "nwd_db_j2",
          "characterId": "jack",
          "text": "No. You're not. That's the problem.",
          "expression": "flat — a beat after not"
        },
        {
          "id": "nwd_db_s1",
          "characterId": "narrator",
          "text": "The fan. Rain on the window.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_db_j3",
          "characterId": "jack",
          "text": "Three weeks of looking, and this is what it produced. Bank statements in order. Four names, addresses attached. A timeline. Mrs. Voss, I've seen a hundred of these and they're all a mess, because that's what three weeks of a frightened person looks like. It's receipts and a shoebox and things written on the back of other things.",
          "expression": "flat, tapping the folder without opening it — a beat after timeline"
        },
        {
          "id": "nwd_db_v3",
          "characterId": "vera",
          "text": "And?",
          "expression": "evenly"
        },
        {
          "id": "nwd_db_j4",
          "characterId": "jack",
          "text": "This isn't a search. It's a finished argument. Somebody made this to be read by somebody, and I'd want to know who it's addressed to before I'm the one reading it.",
          "expression": "flat — a beat after argument"
        },
        {
          "id": "nwd_db_s2",
          "characterId": "narrator",
          "text": "A long pause. The fan.",
          "expression": "pause",
          "silent": true
        },
        {
          "id": "nwd_db_v4",
          "characterId": "vera",
          "text": "And that's a reason to say no.",
          "expression": "flat"
        },
        {
          "id": "nwd_db_j5",
          "characterId": "jack",
          "text": "That, and I know who your husband collects for. I've been on the wrong side of Solomon Reyes once already. It cost me eleven months and it very nearly cost me the office. I'm not a brave man, Mrs. Voss. I'm just an expensive one.",
          "expression": "flat — a beat after collects for, a beat after office"
        },
        {
          "id": "nwd_db_s3",
          "characterId": "narrator",
          "text": "The fan. Rain on the window.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_db_v5",
          "characterId": "vera",
          "text": "I could tell you what's in it. Right now. All of it.",
          "expression": "evenly"
        },
        {
          "id": "nwd_db_j6",
          "characterId": "jack",
          "text": "I know. That's the other reason. You'd tell me, and it'd be good, and I'd take the job. Sixteen years, Mrs. Voss — the trick isn't spotting it. The trick's not listening to the next part.",
          "expression": "flat — a beat after reason"
        },
        {
          "id": "nwd_db_s4",
          "characterId": "narrator",
          "text": "A long silence.",
          "expression": "pause",
          "silent": true
        },
        {
          "id": "nwd_db_v6",
          "characterId": "vera",
          "text": "That's fair.",
          "expression": "flat, no argument in it"
        },
        {
          "id": "nwd_db_j7",
          "characterId": "jack",
          "text": "I'm sorry.",
          "expression": "quiet"
        },
        {
          "id": "nwd_db_v7",
          "characterId": "vera",
          "text": "Don't be. You're the first person in this town who's been straight with me in about nine years. It's just poor timing.",
          "expression": "standing, taking the folder back — a beat after Don't be"
        },
        {
          "id": "nwd_db_s5",
          "characterId": "narrator",
          "text": "Her footsteps. The bell. The door. Rain swelling — then muffled.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_db_vo1",
          "characterId": "jack",
          "text": "And that was it. The first no I'd said to a paying client in two years, and I'd meant every word of it.",
          "expression": "V.O. — flat"
        }
      ],
      "choices": [
        {
          "id": "nwd_dr_lot",
          "text": "She Didn't Start the Car",
          "targetSceneId": "nwd_follow_home",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_watched_lot"
            ]
          }
        }
      ],
      "hotspots": [],
      "onEnterActions": [],
      "note": "Refusal route. Delay, not a fork. Jack never follows her. Merges at the Blue Cue."
    },
    {
      "id": "nwd_follow_home",
      "title": "Part 1 (alt) — She Didn't Start the Car",
      "background": "/img/nw2/bg-diner-lot.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "62% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.2
      },
      "prose": "The fan. Rain. Jack still in the booth.",
      "dialogueBeats": [
        {
          "id": "nwd_fh_vo1",
          "characterId": "jack",
          "text": "I didn't follow her. I stayed where I was. But I watched her the whole way across that lot, and I'd like to tell you that was instinct. It wasn't. I'd just turned her down and I wasn't ready for the last of her to be a door closing.",
          "expression": "V.O. — flat — a beat after I stayed where I was"
        },
        {
          "id": "nwd_fh_vo2",
          "characterId": "jack",
          "text": "She got in her car and she didn't start it.",
          "expression": "V.O. — flat"
        },
        {
          "id": "nwd_fh_s1",
          "characterId": "narrator",
          "text": "Rain on the glass. The fan.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_fh_vo3",
          "characterId": "jack",
          "text": "A woman who's been turned down drives off annoyed. Two minutes, maybe. She sat there eleven.",
          "expression": "V.O. — flat — a beat after maybe"
        },
        {
          "id": "nwd_fh_s2",
          "characterId": "narrator",
          "text": "A long hold. Nothing happens.",
          "expression": "pause",
          "silent": true
        },
        {
          "id": "nwd_fh_vo4",
          "characterId": "jack",
          "text": "Eleven minutes is not being upset. Eleven minutes is a person who hasn't got a next place to go and is working out how to pretend she has.",
          "expression": "V.O. — quiet"
        },
        {
          "id": "nwd_fh_s3",
          "characterId": "narrator",
          "text": "Finally — an engine starting. Headlights sweeping the diner window. Gone.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_fh_vo5",
          "characterId": "jack",
          "text": "I sat there another twenty minutes after she'd gone. Turned the coffee round on the table a few times. Told myself I'd done the right thing, which is a sentence you only need to say if you're not sure.",
          "expression": "V.O. — flat — a beat after gone",
          "background": "/img/nw2/bg-diner-int.jpg",
          "backgroundTransition": "crossfade",
          "backgroundTransitionSpeed": 1.4,
          "backgroundHold": true,
          "cinematic": {
            "mode": "zoom-hold",
            "focalPoint": "44% 52%",
            "zoomDuration": 40,
            "dimAmount": 0.24,
            "lights": [
              {
                "x": 26,
                "y": 26,
                "color": "#ff2e88",
                "intensity": 0.18,
                "size": 32,
                "pulseSeconds": 5,
                "pulseAmount": 0.6
              },
              {
                "x": 72,
                "y": 36,
                "color": "#2ad9d9",
                "intensity": 0.14,
                "size": 36,
                "pulseSeconds": 6,
                "pulseAmount": 0.5
              }
            ],
            "colorGrade": "tarantino-35mm",
            "filmGrade": true,
            "filmGradeStrength": 0.2
          }
        }
      ],
      "choices": [
        {
          "id": "nwd_fh_go",
          "text": "The Door",
          "targetSceneId": "nwd_office_rent",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_fh_car",
          "label": "Her car",
          "bounds": {
            "x": 48,
            "y": 38,
            "w": 38,
            "h": 36
          },
          "cursor": "use",
          "examine": true,
          "examineSeconds": 2.8,
          "action": {
            "type": "showText",
            "text": "Interior light off. Engine off. She's in it. A woman with somewhere to be would already be gone.",
            "flagSet": "nwd_watched_lot"
          }
        }
      ],
      "onEnterActions": [],
      "partBreak": "Act One, Part 1 (alt) — She Didn't Start the Car",
      "note": "He does not follow her. He watches from the booth he is already in."
    },
    {
      "id": "nwd_lit_window",
      "title": "Part 1 (alt) — Morning",
      "background": "/img/nw2/bg-office-door.jpg",
      "ambientAudio": "drone",
      "particles": "none",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "78% 42%",
        "zoomDuration": 32,
        "dimAmount": 0.16,
        "lights": [
          {
            "x": 78,
            "y": 40,
            "color": "#ffd98a",
            "intensity": 0.12,
            "size": 28,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.18
      },
      "prose": "Morning. Rain finished. Wet street.",
      "dialogueBeats": [
        {
          "id": "nwd_lw_vo1",
          "characterId": "jack",
          "text": "I didn't go to the house. I went home and I sat with the no until morning made it look cheaper than it was.",
          "expression": "V.O. — flat"
        }
      ],
      "choices": [
        {
          "id": "nwd_lw_go",
          "text": "The Door",
          "targetSceneId": "nwd_office_rent",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [],
      "note": "Orphaned follow-home beat. Kept so old saves still reach The Door."
    },
    {
      "id": "nwd_office_rent",
      "title": "Part 1 (alt) — The Door",
      "background": "/img/nw2/bg-office-door.jpg",
      "ambientAudio": "drone",
      "particles": "none",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "78% 42%",
        "zoomDuration": 32,
        "dimAmount": 0.16,
        "lights": [
          {
            "x": 78,
            "y": 40,
            "color": "#ffd98a",
            "intensity": 0.12,
            "size": 28,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.18
      },
      "prose": "Morning. Rain finished. Wet street, traffic somewhere distant. Footsteps on stairs.",
      "dialogueBeats": [
        {
          "id": "nwd_or_vo1",
          "characterId": "jack",
          "text": "It was on the door when I got in the next morning. Taped at eye level, which is a decision somebody makes.",
          "expression": "V.O. — flat"
        },
        {
          "id": "nwd_or_vo2",
          "characterId": "jack",
          "text": "Second notice. Fourteen days. Sal Hirsch doesn't send a third one — he sends two men and a van, and he's never once been unreasonable about it, which is the part that stings.",
          "expression": "V.O. — flat"
        },
        {
          "id": "nwd_or_s1",
          "characterId": "narrator",
          "text": "Tape peeling. Paper folding. A door unlocking.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_or_vo3",
          "characterId": "jack",
          "text": "I sat down at a desk I'd got fourteen days left on and I did the only sum available. Two hundred a day. Fourteen days. It isn't even close. It's not a decision, it's a receipt.",
          "expression": "V.O. — flat — a beat after available",
          "background": "/img/nw2/bg-office-day.jpg",
          "backgroundTransition": "fade",
          "backgroundTransitionSpeed": 0.9,
          "backgroundHold": true,
          "cinematic": {
            "mode": "zoom-hold",
            "focalPoint": "56% 48%",
            "zoomDuration": 38,
            "dimAmount": 0.14,
            "lights": [
              {
                "x": 78,
                "y": 28,
                "color": "#c9d6e2",
                "intensity": 0.16,
                "size": 36,
                "pulseSeconds": 8,
                "pulseAmount": 0.2
              },
              {
                "x": 36,
                "y": 70,
                "color": "#ffd98a",
                "intensity": 0.08,
                "size": 24,
                "pulseSeconds": 6,
                "pulseAmount": 0.2
              }
            ],
            "colorGrade": "tarantino-35mm",
            "filmGrade": true,
            "filmGradeStrength": 0.16
          }
        },
        {
          "id": "nwd_or_s2",
          "characterId": "narrator",
          "text": "A chair. A drawer. Rain starting again on the blind.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_or_vo4",
          "characterId": "jack",
          "text": "Here's what I'd like to be able to tell you: that I turned her down for good reasons and picked her up again for bad ones, and that the notice on the door was what changed it. The notice made it easy. That's different from making it happen.",
          "expression": "V.O. — quiet — a beat after changed it"
        }
      ],
      "choices": [
        {
          "id": "nwd_or_go",
          "text": "The Phone Call",
          "targetSceneId": "nwd_office_vera",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_rent_read",
              "nwd_door_notice"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_or_notice",
          "label": "The second notice",
          "bounds": {
            "x": 62,
            "y": 28,
            "w": 28,
            "h": 42
          },
          "cursor": "use",
          "examine": true,
          "examineSeconds": 2.6,
          "action": {
            "type": "showText",
            "text": "SECOND NOTICE. Fourteen days. Sal doesn't send a third. He sends two men and a van.",
            "flagSet": "nwd_rent_read"
          }
        }
      ],
      "onEnterActions": [],
      "partBreak": "Act One, Part 1 (alt) — The Door",
      "note": "Landlord is a notice in daylight, not a 2am phone call. Calling her back is considered, not panicked."
    },
    {
      "id": "nwd_office_vera",
      "title": "Part 1 (alt) — The Phone Call",
      "background": "/img/nw2/bg-office-day.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "56% 48%",
        "zoomDuration": 38,
        "dimAmount": 0.14,
        "lights": [
          {
            "x": 78,
            "y": 28,
            "color": "#c9d6e2",
            "intensity": 0.16,
            "size": 36,
            "pulseSeconds": 8,
            "pulseAmount": 0.2
          },
          {
            "x": 36,
            "y": 70,
            "color": "#ffd98a",
            "intensity": 0.08,
            "size": 24,
            "pulseSeconds": 6,
            "pulseAmount": 0.2
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.16
      },
      "prose": "The office. Day. A phone book. Rain starting again on the blind.",
      "dialogueBeats": [
        {
          "id": "nwd_ov_vo1",
          "characterId": "jack",
          "text": "One Voss in the book and it's in her name, not his. I noticed that and I didn't do anything with it, which is going to be a pattern.",
          "expression": "V.O. — flat — a beat after not his"
        },
        {
          "id": "nwd_ov_s1",
          "characterId": "narrator",
          "text": "A phone book. Pages. A receiver lifted. Numbers dialled.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ov_s2",
          "characterId": "narrator",
          "text": "Ringing. Four times.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ov_v1",
          "characterId": "vera",
          "text": "Yes.",
          "expression": "filtered, phone — flat"
        },
        {
          "id": "nwd_ov_j1",
          "characterId": "jack",
          "text": "It's Morrow.",
          "expression": "flat"
        },
        {
          "id": "nwd_ov_s3",
          "characterId": "narrator",
          "text": "A pause on the line.",
          "expression": "pause",
          "silent": true
        },
        {
          "id": "nwd_ov_v2",
          "characterId": "vera",
          "text": "Alright.",
          "expression": "filtered, phone — flat"
        },
        {
          "id": "nwd_ov_j2",
          "characterId": "jack",
          "text": "I was wrong last night.",
          "expression": "flat"
        },
        {
          "id": "nwd_ov_s4",
          "characterId": "narrator",
          "text": "A pause on the line. She doesn't ask about what.",
          "expression": "pause",
          "silent": true
        },
        {
          "id": "nwd_ov_v3",
          "characterId": "vera",
          "text": "Alright.",
          "expression": "filtered, phone — flat"
        },
        {
          "id": "nwd_ov_j3",
          "characterId": "jack",
          "text": "You're not going to ask me why.",
          "expression": "waiting a beat for a question that doesn't come"
        },
        {
          "id": "nwd_ov_v4",
          "characterId": "vera",
          "text": "No. You had a reason last night and now you've got a different one. They're both yours.",
          "expression": "filtered, phone — flat — a beat after No"
        },
        {
          "id": "nwd_ov_s5",
          "characterId": "narrator",
          "text": "The fan on her end. Or a radio. Something domestic.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ov_j4",
          "characterId": "jack",
          "text": "Two hundred a day plus expenses. I find him, I tell you where he is. What you do after that's yours to carry.",
          "expression": "businesslike, but softer"
        },
        {
          "id": "nwd_ov_v5",
          "characterId": "vera",
          "text": "Yes.",
          "expression": "filtered, phone — flat"
        },
        {
          "id": "nwd_ov_j5",
          "characterId": "jack",
          "text": "The folder.",
          "expression": "flat"
        },
        {
          "id": "nwd_ov_v6",
          "characterId": "vera",
          "text": "It's at the diner. Behind the counter. I left it with the girl on the morning shift.",
          "expression": "filtered, phone — flat"
        },
        {
          "id": "nwd_ov_s6",
          "characterId": "narrator",
          "text": "A beat.",
          "expression": "pause",
          "silent": true
        },
        {
          "id": "nwd_ov_j6",
          "characterId": "jack",
          "text": "The diner.",
          "expression": "flat"
        },
        {
          "id": "nwd_ov_v7",
          "characterId": "vera",
          "text": "You're there at a quarter to twelve most nights, Mr. Morrow. It's a small town. You said so yourself.",
          "expression": "filtered, phone — flat — a beat after Morrow"
        },
        {
          "id": "nwd_ov_s7",
          "characterId": "narrator",
          "text": "The line going dead. Rain on the blind.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ov_vo2",
          "characterId": "jack",
          "text": "She hadn't posted it, hadn't dropped it at the office, hadn't kept hold of it. She'd left it in the one building in this town where she knew I'd be sitting anyway, whether I rang her or not.",
          "expression": "V.O. — flat — a beat after hold of it"
        },
        {
          "id": "nwd_ov_s8",
          "characterId": "narrator",
          "text": "Rain.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ov_vo3",
          "characterId": "jack",
          "text": "I've had people find out where I drink. Nobody's ever used it to be polite before.",
          "expression": "V.O. — quiet"
        }
      ],
      "choices": [
        {
          "id": "nwd_ov_go",
          "text": "First Name on the List",
          "targetSceneId": "nwd_office_take",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_rehired"
            ]
          }
        }
      ],
      "hotspots": [],
      "onEnterActions": [],
      "partBreak": "Act One, Part 1 (alt) — The Phone Call",
      "note": "He calls her back in daylight. She does not ask why. Folder is at the diner."
    },
    {
      "id": "nwd_office_take",
      "title": "Part 1 (alt) — First Name on the List",
      "background": "/img/nw2/bg-diner-day.jpg",
      "ambientAudio": "drone",
      "particles": "none",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 5,
        "dollyDuration": 28,
        "dimAmount": 0.08,
        "lights": [
          {
            "x": 30,
            "y": 18,
            "color": "#ffe7b0",
            "intensity": 0.18,
            "size": 40,
            "pulseSeconds": 8,
            "pulseAmount": 0.15
          }
        ],
        "colorGrade": "tarantino-35mm",
        "filmGrade": true,
        "filmGradeStrength": 0.14
      },
      "prose": "The diner in daylight — a different sound entirely. No rain, no fan. Cutlery, a radio, people.",
      "dialogueBeats": [
        {
          "id": "nwd_ot_vo1",
          "characterId": "jack",
          "text": "The diner at two in the afternoon is a different building. Sun through the window, kids in a booth, somebody's radio on behind the counter. The waitress handed it over without looking up and said a lady left it, and went back to what she was doing.",
          "expression": "V.O. — flat — a beat after counter"
        },
        {
          "id": "nwd_ot_s1",
          "characterId": "narrator",
          "text": "Pages. A door. The street.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ot_vo2",
          "characterId": "jack",
          "text": "No napkin, no big line. A folder from behind a counter, a name I didn't like, and a woman who heard the word no and left it out for me anyway.",
          "expression": "V.O. — flat"
        },
        {
          "id": "nwd_ot_s2",
          "characterId": "narrator",
          "text": "A car door. An engine.",
          "expression": "sound",
          "silent": true
        },
        {
          "id": "nwd_ot_vo3",
          "characterId": "jack",
          "text": "Smart move was letting it go. I'd already made the smart move once and it bought me a notice on the door and the longest night of a quiet year. Lonely, dressed up as a work ethic.",
          "expression": "V.O. — quiet — a beat after year"
        }
      ],
      "choices": [
        {
          "id": "nwd_ot_go",
          "text": "The Blue Cue",
          "targetSceneId": "nwd_poolhall",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_rehired",
              "nwd_folder_taken"
            ],
            "addItems": [
              "nwd_folder"
            ],
            "trustChanges": [
              {
                "characterId": "vera",
                "delta": 1
              }
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_ot_folder",
          "label": "The folder",
          "bounds": {
            "x": 8,
            "y": 42,
            "w": 22,
            "h": 28
          },
          "cursor": "use",
          "examine": true,
          "examineSeconds": 2.4,
          "action": {
            "type": "showText",
            "text": "Behind the counter, with the morning girl. Squared to the edge like she'd practiced leaving it somewhere she'd walk past anyway.",
            "flagSet": "nwd_folder_taken"
          }
        }
      ],
      "onEnterActions": [],
      "partBreak": "Act One, Part 1 (alt) — First Name on the List",
      "note": "Folder from behind the counter. Merges to the gold path at the Blue Cue."
    },
    {
      "id": "nwd_poolhall",
      "title": "Part 2 — The Wrong Kind of Regulars",
      "background": "/img/nw2/bg-poolhall.jpg",
      "ambientAudio": "jazz",
      "particles": "smoke",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 6,
        "dollyDuration": 26,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 50,
            "y": 18,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 30,
            "pulseSeconds": 6.5,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "A pool hall. Balls clacking, a jukebox playing something old and warped, ice clinking in a glass somewhere. A single hanging lamp over the table, everything else in shadow. Wasn't blue. Cue wasn't even straight.",
      "dialogueBeats": [
        {
          "id": "nwd_p_vo1",
          "characterId": "jack",
          "expression": "V.O. — settling into narration, dry but easy",
          "text": "Folder had a list of David Voss's known associates. Polite way of saying \"people who'll lie to a detective if the price is right.\" First name led me to a place called The Blue Cue. Wasn't blue. Cue wasn't even straight."
        },
        {
          "id": "nwd_p_vo2",
          "characterId": "jack",
          "expression": "V.O. — lower, more alert",
          "text": "Two guys at the bar. Didn't need a badge or a gun to know what they did for a living. One built like a filing cabinet. Other one built like the guy who tells the filing cabinet where to stand."
        },
        {
          "id": "nwd_p_desh1",
          "characterId": "desh",
          "expression": "mid-conversation, completely serious",
          "text": "I'm telling you, man, self-checkout is a scam. They didn't build those machines to save you time. They built 'em so you do the cashier's job for free and thank 'em on the way out."
        },
        {
          "id": "nwd_p_moe1",
          "characterId": "moe",
          "expression": "flat, exhausted",
          "text": "Nobody's thanking a machine, Desh."
        },
        {
          "id": "nwd_p_desh2",
          "characterId": "desh",
          "expression": "genuinely offended",
          "text": "You ever say sorry to one? \"Unexpected item in the bagging area,\" and you go, \"oh — my bad.\" That's not shopping, man, that's conditioning."
        },
        {
          "id": "nwd_p_moe2",
          "characterId": "moe",
          "expression": "done",
          "text": "It's a scale. It weighs your bag."
        },
        {
          "id": "nwd_p_desh3",
          "characterId": "desh",
          "expression": "like he's caught him",
          "text": "And who told you that's all it does — the machine? You trust the machine's word for it now?"
        },
        {
          "id": "nwd_p_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Two men who hurt people for a living, arguing about grocery stores."
        },
        {
          "id": "nwd_p_moe3",
          "characterId": "moe",
          "expression": "noticing Jack, flat",
          "text": "Help you with something."
        },
        {
          "id": "nwd_p_j1",
          "characterId": "jack",
          "expression": "easy",
          "text": "Looking for a guy. David Voss. You know him?"
        },
        {
          "id": "nwd_p_desh4",
          "characterId": "desh",
          "expression": "casual",
          "text": "Never heard of him."
        },
        {
          "id": "nwd_p_moe4",
          "characterId": "moe",
          "expression": "at the same time",
          "text": "Heard the name once."
        },
        {
          "id": "nwd_p_desh5",
          "characterId": "desh",
          "expression": "low, irritated, to Moe",
          "text": "We said never heard of him, man. That's the line today."
        },
        {
          "id": "nwd_p_moe5",
          "characterId": "moe",
          "expression": "shrugging",
          "text": "Forgot which line we were on."
        },
        {
          "id": "nwd_p_desh6",
          "characterId": "desh",
          "expression": "to Jack, recovering",
          "text": "Never heard of him."
        },
        {
          "id": "nwd_p_vo4",
          "characterId": "jack",
          "expression": "V.O. — dry",
          "text": "Nobody lies that bad on accident. That's a skill."
        },
        {
          "id": "nwd_p_j2",
          "characterId": "jack",
          "expression": "leaning in",
          "text": "Here's my problem. Somebody's paying me good money to find a guy nobody's ever heard of. Feels like a waste of everybody's time."
        },
        {
          "id": "nwd_p_moe6",
          "characterId": "moe",
          "expression": "calm, but with an edge now — the glass coming down deliberate and heavy",
          "text": "You know what I think, Mr. —"
        },
        {
          "id": "nwd_p_j3",
          "characterId": "jack",
          "expression": "plain",
          "text": "Morrow."
        },
        {
          "id": "nwd_p_moe7",
          "characterId": "moe",
          "expression": "continuing",
          "text": "— Mr. Morrow. I think you finish whatever the hell you're not drinking, and you walk out that door. That's the version of tonight where you're still breathing tomorrow."
        }
      ],
      "choices": [
        {
          "id": "nwd_p_gold",
          "text": "Appreciate the hospitality. Walk out.",
          "targetSceneId": "nwd_poolhall_out",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_p_d2",
          "text": "I'm working for Vera Voss.",
          "targetSceneId": "nwd_poolhall_name",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_d2"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_p_hs_jukebox",
          "label": "The jukebox",
          "cursor": "use",
          "bounds": {
            "x": 4,
            "y": 30,
            "w": 18,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Something old and warped. It plays a recording, Desh. That's all it is."
          }
        },
        {
          "id": "nwd_p_hs_sign",
          "label": "The dead neon beer sign",
          "cursor": "look",
          "bounds": {
            "x": 62,
            "y": 10,
            "w": 30,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Moe and Desh at the bar, backs to the door, silhouetted against a dead neon beer sign. Smoke hanging still in the light."
          }
        }
      ],
      "onEnterActions": [],
      "musicMode": "track",
      "musicUrl": "/nwt-bluecue-jukebox.mp3",
      "musicFadeSeconds": 0,
      "musicLevel": 1.05
    },
    {
      "id": "nwd_poolhall_out",
      "title": "Part 2 — The Wrong Kind of Regulars",
      "partBreak": "Act One, Part 2 — The Wrong Kind of Regulars",
      "background": "/img/nw2/bg-poolhall.jpg",
      "ambientAudio": "jazz",
      "particles": "smoke",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 6,
        "dollyDuration": 26,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 50,
            "y": 18,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 30,
            "pulseSeconds": 6.5,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "The lamp over the table. The jukebox. Rain outside.",
      "dialogueBeats": [
        {
          "id": "nwd_p_desh7",
          "characterId": "desh",
          "expression": "helpfully",
          "text": "And I really do have more to say about the self-checkout thing, if you wanna stick around for that instead."
        },
        {
          "id": "nwd_p_vo5",
          "characterId": "jack",
          "expression": "V.O. — wry",
          "text": "I believed him. That was somehow the scarier offer."
        },
        {
          "id": "nwd_p_j4",
          "characterId": "jack",
          "expression": "light, on the surface",
          "text": "Appreciate the hospitality. Tell your boss I said hi. Guessing he already knows I stopped by."
        },
        {
          "id": "nwd_p_moe8",
          "characterId": "moe",
          "expression": "not looking up",
          "text": "He knew before you sat down."
        },
        {
          "id": "nwd_p_vo6",
          "characterId": "jack",
          "expression": "V.O. — quieter, more serious, out in the rain",
          "text": "What actually stuck with me wasn't the threat. It was that nobody in that bar flinched when I said David Voss's name was tied to my client. Nobody asked who my client was. Which meant somebody already told them. And the only person who knew I was working this case was the woman who hired me."
        },
        {
          "id": "nwd_p_vo7",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "So here it is, and then I won't do this again."
        },
        {
          "id": "nwd_p_vo8",
          "characterId": "jack",
          "expression": "V.O. — spare, unsparing",
          "text": "I knew who she was before she sat down. Knew whose wife she was. Knew a man doesn't run from Solomon Reyes and leave a folder that tidy behind him, and I knew a woman who wanted her husband found in a town this size asks at the depot and the clinic and she's got him by Tuesday. I knew all of that in the first four minutes. I have known things for a living for sixteen years and I have never once been wrong this fast."
        },
        {
          "id": "nwd_p_vo9",
          "characterId": "jack",
          "expression": "V.O. — quiet",
          "text": "And I took the folder anyway. Because the alternative was saying it out loud, and if I said it out loud she'd stand up, and then I'd be a man sitting alone in a diner at eleven forty-seven the same as I was the night before. Ten years of that. You'd have taken the folder too."
        },
        {
          "id": "nwd_p_vo10",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "That's the last honest thing I'm going to say for a while. Everything after this, I was lying to myself on purpose, and I'd rather you watched me do it than had me explain it."
        }
      ],
      "choices": [
        {
          "id": "nwd_po_go",
          "text": "Two nights on the paper.",
          "targetSceneId": "nwd_office",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_poolhall_name",
      "title": "Part 2 (alt) — The Name",
      "partBreak": "Act One, Part 2 (alt) — The Name",
      "background": "/img/nw2/bg-poolhall.jpg",
      "ambientAudio": "jazz",
      "particles": "smoke",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 6,
        "dollyDuration": 26,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 50,
            "y": 18,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 30,
            "pulseSeconds": 6.5,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "The jukebox. Balls clacking somewhere. Nothing else changes at all.",
      "dialogueBeats": [
        {
          "id": "nwd_pa_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I said it to watch his face. That's the whole reason. Sixteen years and I have never once given a client up, and I did it in a pool hall to see whether a man would blink."
        },
        {
          "id": "nwd_pa_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Moe setting his glass down. Unhurried."
        },
        {
          "id": "nwd_pa_moe1",
          "characterId": "moe",
          "expression": "flat, entirely unbothered",
          "text": "Alright."
        },
        {
          "id": "nwd_pa_j2",
          "characterId": "jack",
          "expression": "pressing",
          "text": "That mean anything to you?"
        },
        {
          "id": "nwd_pa_moe2",
          "characterId": "moe",
          "expression": "same tone",
          "text": "Means you've got a client."
        },
        {
          "id": "nwd_pa_desh1",
          "characterId": "desh",
          "expression": "not turning round",
          "text": "Means you've got a client and now we've got a Tuesday."
        },
        {
          "id": "nwd_pa_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Jack shifting. The jukebox track ending, clicking over."
        },
        {
          "id": "nwd_pa_j3",
          "characterId": "jack",
          "expression": "quieter",
          "text": "What's that supposed to mean."
        },
        {
          "id": "nwd_pa_moe3",
          "characterId": "moe",
          "expression": "picking his glass back up",
          "text": "Nothing. Desh talks."
        },
        {
          "id": "nwd_pa_s3",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A long silence. Rain outside."
        },
        {
          "id": "nwd_pa_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'flicker'",
          "text": "Nothing happened in his face. I want to be exact about this, because I spent a long time afterward trying to remember a flicker. There wasn't one. He heard the name and it went somewhere and his face stayed where it was, and I stood there thinking I'd got nothing."
        },
        {
          "id": "nwd_pa_s4",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "Jack standing. A stool scraping back."
        },
        {
          "id": "nwd_pa_moe4",
          "characterId": "moe",
          "expression": "not looking up",
          "text": "Mr. Morrow."
        },
        {
          "id": "nwd_pa_j4",
          "characterId": "jack",
          "expression": "flat",
          "text": "Yeah."
        },
        {
          "id": "nwd_pa_moe5",
          "characterId": "moe",
          "expression": "flat, almost kind",
          "text": "You shouldn't have done that."
        },
        {
          "id": "nwd_pa_s5",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain. The door. The bell."
        },
        {
          "id": "nwd_pa_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'Nineteen hours'",
          "text": "Nineteen hours. That's how long she had, and I gave it away in a pool hall, for free, to see a man blink."
        }
      ],
      "choices": [
        {
          "id": "nwd_pa_go",
          "text": "Nineteen hours.",
          "targetSceneId": "nwd_curtain_sheisnt",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_office",
      "title": "Part 3 — A Trail Too Clean to Trust",
      "partBreak": "Act One, Part 3 — A Trail Too Clean to Trust",
      "background": "/img/nw2/bg-office-night.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 48%",
        "zoomDuration": 34,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 50,
            "y": 46,
            "color": "#ffd9a0",
            "intensity": 0.32,
            "size": 34,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "A cramped office at night. One lamp, a wide pool of yellow light, everything past its edge black. Bank statements fanned out like a hand of cards. His face lit from below, tired.",
      "dialogueBeats": [
        {
          "id": "nwd_o_vo1",
          "characterId": "jack",
          "expression": "V.O. — quieter, focused",
          "text": "Spent the next two nights doing the part of this job nobody puts in the movies. Just me, a desk lamp, and a folder full of somebody else's life, reading it line by line like I was checking it for typos, or maybe just looking for a reason not to believe what I was starting to believe."
        },
        {
          "id": "nwd_o_vo2",
          "characterId": "jack",
          "expression": "V.O. — thoughtful",
          "text": "Bank statements first. David Voss pulled six grand out four days before he vanished. Fine — people do that when they're running. Except he pulled it in three separate withdrawals, from three different branches, on three straight days, each one just under the amount that gets a teller's attention."
        },
        {
          "id": "nwd_o_j1",
          "characterId": "jack",
          "expression": "to himself, quiet",
          "text": "That's not panic. That's somebody who read the rules first."
        },
        {
          "id": "nwd_o_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Four names on the contacts page. All four checked out in one afternoon. Real cases have dead ends. This folder didn't have one. Grief's messy. This wasn't grief."
        },
        {
          "id": "nwd_o_bar1",
          "characterId": "bartender",
          "expression": "V.O., filtered, phone — bored, distracted",
          "text": "Yeah, Voss used to come in Thursdays. Stopped about a month back. Didn't say why. Quiet guy."
        },
        {
          "id": "nwd_o_j2",
          "characterId": "jack",
          "expression": "on the phone, testing",
          "text": "He seem worried last time you saw him? Scared, anything like that?"
        },
        {
          "id": "nwd_o_bar2",
          "characterId": "bartender",
          "expression": "V.O., filtered, phone — a little too rehearsed",
          "text": "No, actually. Real calm. Like a guy who already made up his mind about something."
        },
        {
          "id": "nwd_o_vo4",
          "characterId": "jack",
          "expression": "V.O. — slower, putting it together",
          "text": "\"Already made up his mind.\" That's a strange thing for a bartender to remember word for word about a guy who stopped showing up a month ago. That's not a memory. That's a line somebody handed him and told him to have ready."
        },
        {
          "id": "nwd_o_vo5",
          "characterId": "jack",
          "expression": "V.O. — flat, pacing",
          "text": "Third night on it and I'm still building a case out of paper. The answer was across a diner table Tuesday. Paper doesn't stand up and leave."
        },
        {
          "id": "nwd_o_vo6",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "One in the morning. Either David Voss vanished clean, or somebody built me a map. Every road led where she wanted me standing. Some part of me still wanted it to be the first one."
        },
        {
          "id": "nwd_o_vo7",
          "characterId": "jack",
          "expression": "V.O. — alert, present tense now. A car outside, slowing",
          "text": "Noticed the car because it did something none of Solomon's guys had bothered doing yet. It parked."
        },
        {
          "id": "nwd_o_vo8",
          "characterId": "jack",
          "expression": "V.O. — lower, wary. A car door closing soft, not slammed",
          "text": "Slammed doors, I can work with. Amateurs slam doors. It's the quiet ones you gotta watch."
        },
        {
          "id": "nwd_o_j3",
          "characterId": "jack",
          "expression": "calling out, keeping his voice steady",
          "text": "Bit late for company."
        },
        {
          "id": "nwd_o_vo9",
          "characterId": "jack",
          "expression": "V.O. — the last clear thought before it all goes sideways",
          "text": "And that's about when I remembered I'd left my gun in the car. Which, for the record, is not a mistake I usually make twice in one lifetime."
        },
        {
          "id": "nwd_o_vo10",
          "characterId": "jack",
          "expression": "V.O. — fading, disoriented, cutting off mid-thought",
          "silent": true,
          "background": "gradient:linear-gradient(#000,#000)",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 1.4,
          "text": "Somebody hit me with something a lot heavier than a hand. Floor came up faster than it should've. Last clear thought I had before the lights went out — I never asked what David Voss looked like. Three days on the case. That's not an oversight."
        }
      ],
      "choices": [
        {
          "id": "nwd_o_go",
          "text": "Wake up zip-tied.",
          "targetSceneId": "nwd_warehouse",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_o_hs_statements",
          "label": "The bank statements",
          "cursor": "look",
          "bounds": {
            "x": 30,
            "y": 50,
            "w": 34,
            "h": 30
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Six grand, three withdrawals, three branches, three days — each just under the amount that gets a teller's attention."
          }
        },
        {
          "id": "nwd_o_hs_contacts",
          "label": "The contacts page",
          "cursor": "look",
          "bounds": {
            "x": 64,
            "y": 44,
            "w": 22,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Four names. All four checked out in one afternoon. Real cases have dead ends. This folder didn't have one."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_warehouse",
      "title": "Part 4 — The Man Who Curates Debts",
      "background": "/img/nwd/ep1/warehouse.jpg",
      "ambientAudio": "drone",
      "transition": "fade-black",
      "transitionSpeed": 1.2,
      "cinematic": {
        "mode": "shake",
        "shakeAmount": 0.18,
        "shakeDuration": 2.6,
        "shakeRotation": 0.2,
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 12,
            "color": "#cfe8ff",
            "intensity": 0.28,
            "size": 24,
            "pulseSeconds": 4,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "Zip-tied to a metal chair. Cold concrete. Motor oil, old rain.",
      "dialogueBeats": [
        {
          "id": "nwd_w_vo0",
          "characterId": "jack",
          "expression": "V.O. — more alert now",
          "text": "Warehouse. Shipping crates stacked to the ceiling, one bare bulb doing all the work. And sitting across from me in a folding chair — like he'd brought it from home — was a man I'd only ever heard about secondhand."
        },
        {
          "id": "nwd_w_sol1",
          "characterId": "solomon",
          "expression": "warm, unhurried",
          "text": "One moment, Mr. Morrow. I'm finishing something."
        },
        {
          "id": "nwd_w_ted1",
          "characterId": "ted",
          "expression": "quick, panicked, mid-forties, trying to sound reasonable",
          "text": "I've got it Friday. I swear to God I've got it Friday, I've got hours coming —"
        },
        {
          "id": "nwd_w_sol2",
          "characterId": "solomon",
          "expression": "gently, genuinely kind",
          "text": "Ted. I know. I'm not here about Friday."
        },
        {
          "id": "nwd_w_ted2",
          "characterId": "ted",
          "expression": "confused",
          "text": "Then—"
        },
        {
          "id": "nwd_w_sol3",
          "characterId": "solomon",
          "expression": "the sound of paper being slid across",
          "text": "Your daughter turned eighteen in March. She's on the account now. That's just how the paper works when a co-signer ages in — I didn't do it, the form did it. I wanted you to hear it from me and not find out at a bank."
        },
        {
          "id": "nwd_w_ted3",
          "characterId": "ted",
          "expression": "barely — a small, wrecked sound. Not a sob. Worse. Comprehension.",
          "text": "She's got a job in Fairview. She was gonna —"
        },
        {
          "id": "nwd_w_sol4",
          "characterId": "solomon",
          "expression": "warm, final",
          "text": "I know. And Friday's still Friday. Nothing's changed today, Ted. I just don't like people being surprised."
        },
        {
          "id": "nwd_w_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat, cold. Ted walked out. A door. Silence.",
          "text": "He didn't threaten him. He didn't raise his voice. He showed a man a piece of paper that moved his debt onto his kid, and then he told him it wasn't personal because a form did it. That's what he is. Not a man with a gun. A man with a filing system that eats people slowly and lets him feel administrative about it."
        },
        {
          "id": "nwd_w_sol5",
          "characterId": "solomon",
          "expression": "warm, unhurried, sitting",
          "text": "Mr. Morrow. Sorry about the chair. My guys have a flair for the dramatic I've never managed to train out of them."
        },
        {
          "id": "nwd_w_j1",
          "characterId": "jack",
          "expression": "dry, testing the room",
          "text": "You're Solomon Reyes."
        },
        {
          "id": "nwd_w_sol6",
          "characterId": "solomon",
          "expression": "pleasant",
          "text": "I am. And you've been asking my people about a man who owes me money. I'd like to know why."
        },
        {
          "id": "nwd_w_j2",
          "characterId": "jack",
          "expression": "straightforward",
          "text": "Client hired me to find her husband. That's the whole job. I didn't know he owed you anything till two nights ago."
        },
        {
          "id": "nwd_w_sol7",
          "characterId": "solomon",
          "expression": "studying him",
          "text": "I believe you. That's actually the problem."
        }
      ],
      "choices": [
        {
          "id": "nwd_w_gold",
          "text": "Tell him where you landed.",
          "targetSceneId": "nwd_warehouse_gold",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_w_d4",
          "text": "Say nothing. Let him cut you loose.",
          "targetSceneId": "nwd_warehouse_offer",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_d4"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_w_hs_cabinet",
          "label": "The filing cabinet",
          "cursor": "look",
          "bounds": {
            "x": 70,
            "y": 40,
            "w": 24,
            "h": 44
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "A coffee ring on it. A filing system that eats people slowly and lets him feel administrative about it."
          }
        },
        {
          "id": "nwd_w_hs_chair",
          "label": "The folding chair",
          "cursor": "look",
          "bounds": {
            "x": 38,
            "y": 56,
            "w": 22,
            "h": 28
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Like he'd brought it from home. Surprise buys you about four good seconds — the chair was all you needed."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_warehouse_gold",
      "title": "Part 4 — The Man Who Curates Debts",
      "background": "/img/nwd/ep1/warehouse.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "shake",
        "shakeAmount": 0.18,
        "shakeDuration": 2.6,
        "shakeRotation": 0.2,
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 12,
            "color": "#cfe8ff",
            "intensity": 0.28,
            "size": 24,
            "pulseSeconds": 4,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The bare bulb doing all the work. The hum. Dripping water somewhere.",
      "dialogueBeats": [
        {
          "id": "nwd_w_vo2",
          "characterId": "jack",
          "expression": "V.O. — dry, narrating over a lighter flicking open",
          "text": "Most guys who kidnap you lead with a threat. This one led with \"I believe you,\" which somehow scared me more, because it meant he was actually thinking, not just posturing."
        },
        {
          "id": "nwd_w_sol8",
          "characterId": "solomon",
          "expression": "direct",
          "text": "David Voss owed me money. Then he disappeared. Then a detective shows up asking my people questions about him like he thinks he's looking for a missing husband. I don't think that's what you're looking for anymore. I think somebody's using you to find my money."
        },
        {
          "id": "nwd_w_j3",
          "characterId": "jack",
          "expression": "measured, and honestly tired of pretending otherwise",
          "text": "Yeah. That's about where I landed too."
        },
        {
          "id": "nwd_w_sol9",
          "characterId": "solomon",
          "expression": "quieter, almost curious — standing, circling the chair slowly",
          "text": "Then we understand each other. I don't actually care about David Voss. Guys who run from me save me the trouble of deciding what to do with them. What I care about is the money. And right now you're the only piece of this I didn't put there myself."
        },
        {
          "id": "nwd_w_j4",
          "characterId": "jack",
          "expression": "wry, pushing his luck because it's the only thing he's got left",
          "text": "You always talk this much before you let a guy go, or is tonight special?"
        }
      ],
      "choices": [
        {
          "id": "nwd_wg_go",
          "text": "Let the silence answer.",
          "targetSceneId": "nwd_warehouse_escalate",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_warehouse_escalate",
      "title": "Part 4 — The Man Who Curates Debts",
      "partBreak": "Act One, Part 4 — The Man Who Curates Debts",
      "background": "/img/nwd/ep1/warehouse.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "shake",
        "shakeAmount": 0.18,
        "shakeDuration": 2.6,
        "shakeRotation": 0.2,
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 12,
            "color": "#cfe8ff",
            "intensity": 0.28,
            "size": 24,
            "pulseSeconds": 4,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "Footsteps stopping directly behind the chair. Silence.",
      "dialogueBeats": [
        {
          "id": "nwd_w_sol10",
          "characterId": "solomon",
          "expression": "flat, no warmth left at all. Footsteps stopping directly behind the chair.",
          "text": "Who said I was letting you go."
        },
        {
          "id": "nwd_w_vo3",
          "characterId": "jack",
          "expression": "V.O. — low, urgent, all business now",
          "text": "He left two guys on me. Not Moe and Desh — a different pair, less interested in grocery store conspiracy theories, more interested in standing near the exit. Which worked out fine for me. Standing still near an exit tells you exactly where the exit is."
        },
        {
          "id": "nwd_w_vo4",
          "characterId": "jack",
          "expression": "V.O. — focused, straining against the zip tie",
          "text": "Felt around behind me. Metal chair, cheap bolts, one of 'em loose enough to work at if I had a week to spare, which I didn't. Then my knuckle caught something sharp on the floor — a piece of that lamp, still in my coat pocket from two nights back, when somebody'd introduced my head to it. Small mercy. Sharp edges make good friends when your hands are tied."
        },
        {
          "id": "nwd_w_vo5",
          "characterId": "jack",
          "expression": "V.O. — quiet, breathless. A soft snap.",
          "text": "Zip tie gave before my patience did. Close race, though."
        },
        {
          "id": "nwd_w_g1",
          "characterId": "narrator",
          "expression": "sharp, alarmed",
          "silent": true,
          "text": "He's loose! Get the fuck up—"
        },
        {
          "id": "nwd_w_vo6",
          "characterId": "jack",
          "expression": "V.O. — fast, present-tense energy",
          "text": "I'm not a young man, and I've never once won a fight I planned ahead of time. But surprise buys you about four good seconds. Four seconds was all I needed to get a hand on the folding chair Solomon left behind."
        },
        {
          "id": "nwd_w_vo7",
          "characterId": "jack",
          "expression": "V.O. — wincing. A metal chair connecting with something solid.",
          "text": "One down. One left, and this one skipped the fists and went straight for a gun."
        },
        {
          "id": "nwd_w_j5",
          "characterId": "jack",
          "expression": "shouting, adrenaline in the voice. A gunshot ricocheting off metal.",
          "text": "I would've settled for the four fucking seconds!"
        },
        {
          "id": "nwd_w_vo8",
          "characterId": "jack",
          "expression": "V.O. — breathless, quick. A heavy door bursting open; rain and empty-street silence flooding in.",
          "text": "Knocked a crate into his path. Didn't hit him, but it bought me the door, which was really all I was asking for."
        },
        {
          "id": "nwd_w_vo9",
          "characterId": "jack",
          "expression": "V.O. — out of breath, running. Made it two blocks. Made it four. A payphone.",
          "text": "Made it two blocks before my legs reminded me I'm forty-four and this is not a young man's line of work. Made it four before I stopped hearing footsteps behind me. Made it all the way to a payphone — real one, still worked, God bless whoever forgot to rip it out — before I actually let myself think about what Solomon Reyes had told me."
        },
        {
          "id": "nwd_w_vo10",
          "characterId": "jack",
          "expression": "V.O. — flat, standing in the rain before dialing",
          "text": "He didn't care about David Voss. Meant it. Which meant somebody else did — enough to build me a folder and let me walk in blind. I stood in the rain a long time before I dialed."
        },
        {
          "id": "nwd_w_rosa1",
          "characterId": "rosa",
          "expression": "V.O., filtered, phone — groggy, half-asleep, immediately sharpening",
          "text": "Morrow? It's two in the morning. This better be good."
        },
        {
          "id": "nwd_w_j6",
          "characterId": "jack",
          "expression": "cutting her off, low and urgent",
          "text": "Rosa. I need you to run David Voss for me. Cards, bus depots, motel registries — anything that moved. And I need you to not ask how I got tangled up in this yet."
        },
        {
          "id": "nwd_w_vo11",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I didn't have an answer for her either. I knew whoever sent me into that warehouse wasn't finished. First time I wondered if I wanted her to be who I hoped she was."
        }
      ],
      "choices": [
        {
          "id": "nwd_we_go",
          "text": "Hang up. Stand in the rain a minute.",
          "targetSceneId": "nwd_curtain1",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_warehouse_offer",
      "title": "Part 4 (alt) — The Offer",
      "background": "/img/nwd/ep1/warehouse.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "shake",
        "shakeAmount": 0.18,
        "shakeDuration": 2.6,
        "shakeRotation": 0.2,
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 12,
            "color": "#cfe8ff",
            "intensity": 0.28,
            "size": 24,
            "pulseSeconds": 4,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The bare bulb. The hum. Dripping water somewhere.",
      "dialogueBeats": [
        {
          "id": "nwd_wo_sol1",
          "characterId": "solomon",
          "expression": "direct — a beat before the last two sentences",
          "text": "David Voss owed me money. Then he disappeared. Then a detective shows up asking my people questions about him. I don't think you're looking for a missing husband. I think somebody's using you to find my money."
        },
        {
          "id": "nwd_wo_j1",
          "characterId": "jack",
          "expression": "measured",
          "text": "That's about where I landed too."
        },
        {
          "id": "nwd_wo_s1",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "Solomon standing. Footsteps circling the chair."
        },
        {
          "id": "nwd_wo_sol2",
          "characterId": "solomon",
          "expression": "unhurried",
          "text": "Then let me save us both a fortnight."
        },
        {
          "id": "nwd_wo_s2",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "The zip tie being cut. Jack's arms coming free. He doesn't move."
        },
        {
          "id": "nwd_wo_sol3",
          "characterId": "solomon",
          "expression": "pleasant, businesslike",
          "text": "Find him. Same job. Same man. Two hundred a day, which I understand is your rate, and a number at the end of it that I won't insult you by naming yet."
        },
        {
          "id": "nwd_wo_j2",
          "characterId": "jack",
          "expression": "flat, rubbing his wrists",
          "text": "I've got a client."
        },
        {
          "id": "nwd_wo_sol4",
          "characterId": "solomon",
          "expression": "mild — a beat after 'to find'",
          "text": "You've got a client who hasn't told you what she's paying you to find. I've told you inside four minutes. Consider which of us is being straight with you."
        },
        {
          "id": "nwd_wo_s3",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "An envelope set on the arm of the folding chair. Not slid. Placed."
        },
        {
          "id": "nwd_wo_sol5",
          "characterId": "solomon",
          "expression": "mild — a beat after 'her money'",
          "text": "I'm not asking you to drop her. Keep her. Take her money. All I want is to be told at the same time she is. Not before. At the same time."
        },
        {
          "id": "nwd_wo_s4",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A long silence. The bare bulb. Water dripping somewhere."
        }
      ],
      "choices": [
        {
          "id": "nwd_wo_take",
          "text": "Take the envelope.",
          "targetSceneId": "nwd_warehouse_take",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "nwd_d4_taken"
            ],
            "addItems": [
              "nwd_envelope"
            ]
          }
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_warehouse_take",
      "title": "Part 4 (alt) — The Offer",
      "partBreak": "Act One, Part 4 (alt) — The Offer",
      "background": "/img/nwd/ep1/warehouse.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "shake",
        "shakeAmount": 0.18,
        "shakeDuration": 2.6,
        "shakeRotation": 0.2,
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 12,
            "color": "#cfe8ff",
            "intensity": 0.28,
            "size": 24,
            "pulseSeconds": 4,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The envelope picked up. A long silence. The bare bulb.",
      "dialogueBeats": [
        {
          "id": "nwd_wt_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'carrying around'",
          "text": "Sixteen years. That's the number I'd been carrying around like it meant something. It took four minutes and a folding chair."
        },
        {
          "id": "nwd_wt_sol1",
          "characterId": "solomon",
          "expression": "not gloating, genuinely pleased",
          "text": "Good. That's sensible."
        },
        {
          "id": "nwd_wt_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "It's not sensible. It's just easier."
        },
        {
          "id": "nwd_wt_sol2",
          "characterId": "solomon",
          "expression": "a small nod — a beat after 'Yes'",
          "text": "Yes. Most sensible things are. People get very confused about that."
        },
        {
          "id": "nwd_wt_s1",
          "characterId": "narrator",
          "expression": "action",
          "silent": true,
          "text": "Jack standing. Unsteady. The chair scraping."
        },
        {
          "id": "nwd_wt_sol3",
          "characterId": "solomon",
          "expression": "as Jack reaches the door, conversational",
          "text": "Mr. Morrow. One thing."
        },
        {
          "id": "nwd_wt_j2",
          "characterId": "jack",
          "expression": "not turning",
          "text": "What."
        },
        {
          "id": "nwd_wt_sol4",
          "characterId": "solomon",
          "expression": "mild — a beat after 'ten years'",
          "text": "In 2015 there was a file with my name in it and a young detective who was asked twice to lose it, and wouldn't."
        },
        {
          "id": "nwd_wt_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain outside. The bulb humming."
        },
        {
          "id": "nwd_wt_sol5",
          "characterId": "solomon",
          "expression": "quiet, and it isn't cruelty — it's disappointment",
          "text": "I'd like you to know I'm sorry to have finally met him."
        },
        {
          "id": "nwd_wt_s3",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "A heavy door. Rain. Footsteps on wet ground, not running."
        },
        {
          "id": "nwd_wt_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'once'",
          "text": "I walked four blocks with an envelope in my coat and I did not once think about giving it back. I thought about what I'd spend it on. That's the true version."
        }
      ],
      "choices": [
        {
          "id": "nwd_wt_go",
          "text": "Two envelopes.",
          "targetSceneId": "nwd_curtain_twoenvelopes",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_curtain1",
      "title": "Two in the Morning",
      "background": "/img/nwd/ep1/payphone-rain.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.8,
      "letterbox": true,
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "END OF ACT ONE",
        "recap": "He didn't care about David Voss — he cared about the money, and somebody used you to go looking for it. Rosa's running the name. The rain hasn't stopped once."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.5,
        "lights": [
          {
            "x": 62,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "I stood in the rain a long time before I dialed, and a long time after. END OF ACT ONE.",
      "dialogueBeats": [],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_curtain_pasttense",
      "title": "Past Tense",
      "background": "/img/nw2/bg-ash-street.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.8,
      "letterbox": true,
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "PAST TENSE",
        "recap": "You asked for the description and she gave it to you in the past tense — corrected it once, and you let the four seconds go past. She's asking you to bring her the bad news personally. You followed her home."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.5,
        "lights": [
          {
            "x": 62,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "So I followed her home. END OF ACT ONE.",
      "dialogueBeats": [],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_curtain_threeweeks",
      "title": "Three Weeks",
      "background": "/img/nw2/bg-booth-cold.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.8,
      "letterbox": true,
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "THREE WEEKS",
        "recap": "You said no, and you were right, and being right didn't stop a single thing. Three weeks later: the same booth, the same time, and a town that kept happening without you."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.5,
        "lights": [
          {
            "x": 62,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "I did the sensible thing and I felt sensible about it for about four days. END OF ACT ONE.",
      "dialogueBeats": [],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_curtain_sheisnt",
      "title": "She's Not Answering",
      "background": "/img/nw2/mo-rain-glass.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.8,
      "letterbox": true,
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "SHE'S NOT ANSWERING",
        "recap": "You said her name in a pool hall to watch a man blink, and his face stayed exactly where it was. Solomon knows where she is now. Nineteen hours is all she had."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.5,
        "lights": [
          {
            "x": 62,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "Nineteen hours. That's how long she had, and I gave it away in a pool hall, for free. END OF ACT ONE.",
      "dialogueBeats": [],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_curtain_twoenvelopes",
      "title": "Two Envelopes",
      "background": "/img/nw2/bg-folder.jpg",
      "ambientAudio": "drone",
      "transition": "fade-black",
      "transitionSpeed": 1.8,
      "letterbox": true,
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "TWO ENVELOPES",
        "recap": "Solomon cut you loose and placed an envelope on the arm of his own chair. You kept her folder and took his paper — and walked four blocks thinking about what you'd spend it on."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.5,
        "lights": [
          {
            "x": 62,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "I walked four blocks with an envelope in my coat and I did not once think about giving it back. END OF ACT ONE.",
      "dialogueBeats": [],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_a2_pasttense",
      "title": "Act Two (alt), Part 1 — Past Tense",
      "partBreak": "Act Two (alt), Part 1 — Past Tense",
      "background": "/img/nw2/mo-rain-glass.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.45,
        "lights": [
          {
            "x": 72,
            "y": 24,
            "color": "#ffb761",
            "intensity": 0.42,
            "size": 20,
            "pulseSeconds": 6.4,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "A residential street in Blackwood. Rain. An engine off. A car interior — Jack parked, waiting. Vera's house across the road, one light on upstairs.",
      "dialogueBeats": [
        {
          "id": "nwd_ap_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I asked her what he looked like. Three days on a missing persons case, it's the first question you ask. I'd gone a whole conversation without it."
        },
        {
          "id": "nwd_ap_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain on the roof."
        },
        {
          "id": "nwd_ap_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat, stressing 'was' and 'had' — a beat before the last two sentences",
          "text": "She said: he was about six foot. He had a scar through one eyebrow. Nobody talks about a missing husband in the past tense. They talk about him like he's late."
        },
        {
          "id": "nwd_ap_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "A door opening across the street. Footsteps."
        },
        {
          "id": "nwd_ap_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat, watching",
          "text": "So I didn't open the folder. I sat outside her house instead, which is the sort of thing that costs you your licence, and I watched her carry two bags of shopping in at eleven at night."
        },
        {
          "id": "nwd_ap_s3",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "A car door. Bags. A door closing."
        },
        {
          "id": "nwd_ap_vo4",
          "characterId": "jack",
          "expression": "V.O. — quiet — a beat after 'One woman'",
          "text": "Two bags. One woman. Everybody buys too much sometimes. I wrote it down anyway, and I hated myself a bit for writing it down, and I've since been very glad I did."
        },
        {
          "id": "nwd_ap_s4",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "Rain. A long hold."
        },
        {
          "id": "nwd_ap_vo5",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'go home'",
          "text": "I should have called Rosa that night. She'd have told me to go home. That's why I didn't."
        }
      ],
      "choices": [
        {
          "id": "nwd_ap_go",
          "text": "Stand in the rain a moment.",
          "targetSceneId": "nwd_br1",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_br1",
      "title": "Act Two (alt), Part 2 — The Route Somebody's Drawn",
      "partBreak": "Act Two (alt), Part 2 — The Route Somebody's Drawn",
      "background": "/img/nwd/ep2/office-3am.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.4,
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 48%",
        "zoomDuration": 34,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 50,
            "y": 46,
            "color": "#ffd9a0",
            "intensity": 0.32,
            "size": 34,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "Jack's office. Morning. Rain easing. The folder, unopened, exactly where he left it.",
      "dialogueBeats": [
        {
          "id": "nwd_br1_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'doesn't sleep either'",
          "text": "I sat outside her house till about four and learned nothing except that she doesn't sleep either. Then I went home, and I woke up at eleven, and the folder was still on the desk being patient."
        },
        {
          "id": "nwd_br1_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "An envelope opening. Paper."
        },
        {
          "id": "nwd_br1_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'four answers'",
          "text": "Everything in it checked out inside an afternoon. Four names, four calls, four answers. That's not a case. That's a route somebody's drawn."
        },
        {
          "id": "nwd_br1_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Papers. A pen tapping once."
        },
        {
          "id": "nwd_br1_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "The bit she didn't draw was a utility bill. Rental four hours north, weekly rate, paid cash — and the power switched on in his own name because a man who's cold stops being clever."
        },
        {
          "id": "nwd_br1_s3",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "A chair. Keys."
        },
        {
          "id": "nwd_br1_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'stay put'",
          "text": "I could have rung Rosa. She'd have run it properly and told me to stay put. I'd spent the night outside my own client's house. I wasn't ringing anybody."
        }
      ],
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "FOUR HOURS NORTH",
        "recap": "Everything in it checked out inside an afternoon — four names, four calls, four answers. That's not a case. That's a route somebody's drawn. The utility bill pointed at a rental: weekly, cash, power on in his own name."
      },
      "choices": [],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "rosa_absent",
              "knew_past_tense",
              "folder_read_late"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_a2_envelopes",
      "title": "Act Two (alt), Part 1 — Two Envelopes",
      "partBreak": "Act Two (alt), Part 1 — Two Envelopes",
      "background": "/img/nw2/bg-office-night.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 48%",
        "zoomDuration": 34,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 50,
            "y": 46,
            "color": "#ffd9a0",
            "intensity": 0.32,
            "size": 34,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "Jack's office, morning. Rain. Papers. A kettle somewhere. Two envelopes on the desk — one manila, worn soft at the corners, Vera's folder. One plain white, thicker, unopened.",
      "dialogueBeats": [
        {
          "id": "nwd_ae_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "He didn't threaten me. That's worth saying. He offered me a job, at a rate, in writing, like a man who's never had to do it the other way because the other way is slower."
        },
        {
          "id": "nwd_ae_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "An envelope being picked up. Set down again."
        },
        {
          "id": "nwd_ae_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'the other'",
          "text": "Find David Voss. Same job. Same man. Two clients, and neither of them told the other. I've taken worse and slept fine."
        },
        {
          "id": "nwd_ae_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain on the window."
        },
        {
          "id": "nwd_ae_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'explain and can't'",
          "text": "Here's the part I'd like to explain and can't. I took it because it was easier to hold both than to pick. Sixteen years of not working for that man, and it went in one morning, for money, before anybody had even died."
        },
        {
          "id": "nwd_ae_s3",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A chair. A long silence."
        },
        {
          "id": "nwd_ae_vo4",
          "characterId": "jack",
          "expression": "V.O. — quiet — a beat after 'give the money back after'",
          "text": "I told myself I'd give the money back after. I want to be clear that I did tell myself that."
        }
      ],
      "choices": [
        {
          "id": "nwd_ae_go",
          "text": "Hold both.",
          "targetSceneId": "nwd_br2",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_br2",
      "title": "Act Two (alt), Part 2 — On Two Salaries",
      "partBreak": "Act Two (alt), Part 2 — On Two Salaries",
      "background": "/img/nw2/bg-office-night.jpg",
      "ambientAudio": "drone",
      "transition": "fade-black",
      "transitionSpeed": 1.4,
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 48%",
        "zoomDuration": 34,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 50,
            "y": 46,
            "color": "#ffd9a0",
            "intensity": 0.32,
            "size": 34,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "Jack's office. The two envelopes. Rain.",
      "dialogueBeats": [
        {
          "id": "nwd_br2_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'efficiency'",
          "text": "Two clients want the same man found. That's not a conflict, that's efficiency. I told myself that at about nine in the morning and it held up till roughly lunchtime."
        },
        {
          "id": "nwd_br2_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Papers. A phone picked up, dialled, ringing."
        },
        {
          "id": "nwd_br2_sato1",
          "characterId": "sato",
          "expression": "V.O., filtered, phone — wary",
          "text": "It's been a while."
        },
        {
          "id": "nwd_br2_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "I need an address off a utility account. Four hours north."
        },
        {
          "id": "nwd_br2_sato2",
          "characterId": "sato",
          "expression": "V.O., filtered, phone — a pause, he's heard something in it",
          "text": "Who's asking, Jack."
        },
        {
          "id": "nwd_br2_s2",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A beat. Rain."
        },
        {
          "id": "nwd_br2_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "Me."
        },
        {
          "id": "nwd_br2_sato3",
          "characterId": "sato",
          "expression": "V.O., filtered, phone — after a moment",
          "text": "Right."
        },
        {
          "id": "nwd_br2_s3",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "The call ending."
        },
        {
          "id": "nwd_br2_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'down a phone line'",
          "text": "He knew. Doc's sold to Solomon's people twice this year and he could hear it on me down a phone line. That's what it sounds like from the outside, apparently. I'd always wondered."
        },
        {
          "id": "nwd_br2_s4",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Keys. A door."
        },
        {
          "id": "nwd_br2_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'the person he's hiding from'",
          "text": "Four hours north, on two salaries, to find a man for the person he's hiding from. I drove it at the speed limit the whole way. Felt like the last decent thing available."
        }
      ],
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "ON TWO SALARIES",
        "recap": "Two clients, one man, and Doc Sato heard it on you down a phone line. You drove four hours north on two salaries — at the speed limit the whole way, felt like the last decent thing available."
      },
      "choices": [],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "on_payroll",
              "doc_suspicious",
              "trade_worthless"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_a2_threeweeks",
      "title": "Act Two (alt), Part 1 — Three Weeks",
      "partBreak": "Act Two (alt), Part 1 — Three Weeks",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The Blackwood Diner. Rain. The ceiling fan. Same as always. The same booth, the same time. Jack alone, coffee cold. Nothing has changed, and that's the horror of it.",
      "dialogueBeats": [
        {
          "id": "nwd_at_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I said no. I want you to know it's possible. She sat down, she made her case, and I looked at the shape of it and I said no thank you, Mrs. Voss, and she picked up her folder and left."
        },
        {
          "id": "nwd_at_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "The fan. Rain."
        },
        {
          "id": "nwd_at_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat, almost bitter",
          "text": "Best decision I ever made. I've had three weeks to enjoy it."
        },
        {
          "id": "nwd_at_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "A bell — the door. Footsteps, heavier than Vera's. A booth creaking."
        },
        {
          "id": "nwd_at_rosa1",
          "characterId": "rosa",
          "expression": "sitting down opposite, no greeting",
          "text": "They found a man in a rental four hours north. Nine days dead."
        },
        {
          "id": "nwd_at_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "Okay."
        },
        {
          "id": "nwd_at_rosa2",
          "characterId": "rosa",
          "expression": "quiet",
          "text": "His wife came to see you three weeks ago."
        },
        {
          "id": "nwd_at_s3",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain. The fan."
        },
        {
          "id": "nwd_at_j2",
          "characterId": "jack",
          "expression": "quiet",
          "text": "She did."
        },
        {
          "id": "nwd_at_rosa3",
          "characterId": "rosa",
          "expression": "not accusing, which is worse",
          "text": "And you said no."
        },
        {
          "id": "nwd_at_j3",
          "characterId": "jack",
          "expression": "flat",
          "text": "I said no."
        },
        {
          "id": "nwd_at_s4",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A long silence."
        },
        {
          "id": "nwd_at_rosa4",
          "characterId": "rosa",
          "expression": "flat — a beat after 'your friend' and after 'anywhere'",
          "text": "I need you to understand something, Jack. I'm not here as your friend. You're the last person she spoke to about him before he went, and you've got no client, no notes, and no reason to have been anywhere. That's not innocent. That's just unhelpful."
        },
        {
          "id": "nwd_at_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'it's worse'",
          "text": "Turns out there's a version where you do the smart thing and it's worse. I hadn't accounted for that one."
        }
      ],
      "choices": [
        {
          "id": "nwd_at_go",
          "text": "Say nothing.",
          "targetSceneId": "nwd_br3",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_br3",
      "title": "Act Two (alt), Part 2 — Off the Record",
      "partBreak": "Act Two (alt), Part 2 — Off the Record",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 40,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The Blackwood Diner. The fan. Rosa still opposite him.",
      "dialogueBeats": [
        {
          "id": "nwd_br3_rosa1",
          "characterId": "rosa",
          "expression": "flat",
          "text": "They've got him as a robbery. Rental four hours north, cash on the premises, gone."
        },
        {
          "id": "nwd_br3_j1",
          "characterId": "jack",
          "expression": "quiet",
          "text": "You don't think it's a robbery."
        },
        {
          "id": "nwd_br3_rosa2",
          "characterId": "rosa",
          "expression": "not answering that",
          "text": "I think there's a version where I hand this to the state boys and go home at six."
        },
        {
          "id": "nwd_br3_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "The fan. Rain."
        },
        {
          "id": "nwd_br3_rosa3",
          "characterId": "rosa",
          "expression": "sliding something across",
          "text": "That's the address. It's not sealed yet. Nobody's been through the place properly."
        },
        {
          "id": "nwd_br3_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "You're giving me a crime scene."
        },
        {
          "id": "nwd_br3_rosa4",
          "characterId": "rosa",
          "expression": "flat — a beat after 'say no to her'",
          "text": "I'm giving you the last place a man was alive, and I'm doing it because you're the only person in this county who was smart enough to say no to her, and I want to know what you see. Off the record. Permanently off the record."
        },
        {
          "id": "nwd_br3_s2",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A long pause."
        },
        {
          "id": "nwd_br3_j3",
          "characterId": "jack",
          "expression": "quiet",
          "text": "And if I find something."
        },
        {
          "id": "nwd_br3_rosa5",
          "characterId": "rosa",
          "expression": "standing",
          "text": "Then we'll both have a problem we didn't have this morning."
        },
        {
          "id": "nwd_br3_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Three weeks of being right, and it took her four minutes to get me in the car anyway."
        }
      ],
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "PERMANENTLY OFF THE RECORD",
        "recap": "Three weeks of being right, and it took Rosa four minutes to get you in the car. The rental is a crime scene now — cash on the premises, gone. Off the record. Permanently."
      },
      "choices": [],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "refused_case",
              "rosa_adversarial",
              "david_already_dead",
              "arrives_after"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_a2_sheisnt",
      "title": "Act Two (alt), Part 1 — She's Not Answering",
      "partBreak": "Act Two (alt), Part 1 — She's Not Answering",
      "background": "/img/nw2/bg-office-night.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 48%",
        "zoomDuration": 34,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 50,
            "y": 46,
            "color": "#ffd9a0",
            "intensity": 0.32,
            "size": 34,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "A phone ringing out. Ring. Ring. Ring. No answer. It goes on too long. Jack's office, the folder open, his phone on the desk on speaker, ringing into nothing.",
      "dialogueBeats": [
        {
          "id": "nwd_as_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I said her name in a bar. That's all I did. Two men who'd told me they'd never heard of David Voss, and I handed them the wife."
        },
        {
          "id": "nwd_as_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "The ringing stops. Voicemail tone."
        },
        {
          "id": "nwd_as_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'Nineteen hours'",
          "text": "Nineteen hours. That's how long it took. I've done this job sixteen years and I have never once given a client's name to the other side, and I did it in a pool hall because I wanted to see a man's face change."
        },
        {
          "id": "nwd_as_s2",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "The phone being redialled. Ringing again."
        },
        {
          "id": "nwd_as_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "It didn't change. That's the part that stays with me. Moe heard the name and nothing happened in his face at all, and I remember thinking I'd got away with it."
        },
        {
          "id": "nwd_as_s3",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Ringing. Ringing. Then — picked up. Silence on the line. Not Vera's breathing."
        },
        {
          "id": "nwd_as_sol1",
          "characterId": "solomon",
          "expression": "V.O., filtered, phone — pleasant",
          "text": "Mr. Morrow. She's fine. I want to say that first because I know what you're about to think."
        },
        {
          "id": "nwd_as_s4",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Rain. Jack not speaking."
        },
        {
          "id": "nwd_as_sol2",
          "characterId": "solomon",
          "expression": "V.O., filtered, phone — mild",
          "text": "You've saved us all a great deal of time. I'd like to thank you properly, and I'd like you to come here and let me do it."
        }
      ],
      "choices": [
        {
          "id": "nwd_as_go",
          "text": "Let the line go quiet.",
          "targetSceneId": "nwd_br4",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_br4",
      "title": "Act Two (alt), Part 2 — She's Upstairs",
      "partBreak": "Act Two (alt), Part 2 — She's Upstairs",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "fade-black",
      "transitionSpeed": 1.4,
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 48%",
        "zoomDuration": 34,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 50,
            "y": 46,
            "color": "#ffd9a0",
            "intensity": 0.32,
            "size": 34,
            "pulseSeconds": 7,
            "pulseAmount": 0.25
          }
        ]
      },
      "prose": "The feed store office. The space heater. Rain on one window.",
      "dialogueBeats": [
        {
          "id": "nwd_br4_sol1",
          "characterId": "solomon",
          "expression": "pleasant",
          "text": "She's upstairs. She's had a cup of tea and she's extremely angry with you, which I'd say is proportionate."
        },
        {
          "id": "nwd_br4_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "Let me see her."
        },
        {
          "id": "nwd_br4_sol2",
          "characterId": "solomon",
          "expression": "mild — a beat after 'In a while'",
          "text": "In a while. You've given me a name I didn't have, Mr. Morrow, and I'd like to be fair about that, so I'm going to give you one back."
        },
        {
          "id": "nwd_br4_s1",
          "characterId": "narrator",
          "expression": "sound",
          "silent": true,
          "text": "Paper. A single sheet slid across a desk."
        },
        {
          "id": "nwd_br4_sol3",
          "characterId": "solomon",
          "expression": "mild — a beat after 'his own name'",
          "text": "Rental four hours north. Weekly, cash. The power's on in his own name. I've had it since Tuesday."
        },
        {
          "id": "nwd_br4_j2",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Then why haven't you—"
        },
        {
          "id": "nwd_br4_sol4",
          "characterId": "solomon",
          "expression": "cutting in, unbothered — a beat after 'He's just found'",
          "text": "Because a man who's found isn't finished. He's just found. I'd like him to be told, by somebody he'll believe, that his wife is sat in a room above a feed store. And then I'd like to see what he does."
        },
        {
          "id": "nwd_br4_s2",
          "characterId": "narrator",
          "expression": "pause",
          "silent": true,
          "text": "A long silence. The heater."
        },
        {
          "id": "nwd_br4_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "So that's the job now. Drive four hours and be the worst news a man's ever had, and do it well, because she's upstairs."
        }
      ],
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "SHE'S UPSTAIRS",
        "recap": "Solomon had the address since Tuesday — and she's upstairs, a cup of tea, extremely angry with you. Drive four hours and be the worst news a man's ever had. And do it well."
      },
      "choices": [],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "vera_held",
              "rosa_absent",
              "errand_for_solomon"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_laundromat",
      "title": "Act Two, Part 1 — Nobody Just Leaves",
      "partBreak": "Act Two, Part 1 — Nobody Just Leaves",
      "background": "/img/nwd/ep2/laundromat.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 5,
        "dollyDuration": 30,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 30,
            "y": 24,
            "color": "#9fe8ff",
            "intensity": 0.22,
            "size": 38,
            "pulseSeconds": 5.4,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "Rain easing to a drizzle. An all-night laundromat hum, a dryer tumbling somewhere in the background. Rosa doesn't like meeting this late. Says it makes her feel like a source instead of a cop. Tonight she was.",
      "dialogueBeats": [
        {
          "id": "nwd_l_r1",
          "characterId": "rosa",
          "expression": "sitting down across from him, arms crossed, worry underneath the annoyance",
          "text": "You look like hell, Morrow."
        },
        {
          "id": "nwd_l_j1",
          "characterId": "jack",
          "expression": "half-smiling",
          "text": "You should see the other guy. Actually you should see the other two guys. I left them in a warehouse."
        },
        {
          "id": "nwd_l_r2",
          "characterId": "rosa",
          "expression": "flat, but scared for him",
          "text": "That's not funny."
        },
        {
          "id": "nwd_l_j2",
          "characterId": "jack",
          "expression": "dropping the smile",
          "text": "Wasn't trying to be."
        },
        {
          "id": "nwd_l_r3",
          "characterId": "rosa",
          "expression": "serious now, direct — setting a folded printout on the table",
          "text": "I ran the name you gave me. David Voss. You want the short version or the long version?"
        },
        {
          "id": "nwd_l_j3",
          "characterId": "jack",
          "expression": "leaning in",
          "text": "Short version. I've had a long night."
        },
        {
          "id": "nwd_l_r4",
          "characterId": "rosa",
          "expression": "flat, matter-of-fact",
          "text": "Short version — he's not missing. Not the way your client's telling it, anyway."
        },
        {
          "id": "nwd_l_j4",
          "characterId": "jack",
          "expression": "sharpening",
          "text": "What do you mean?"
        },
        {
          "id": "nwd_l_r5",
          "characterId": "rosa",
          "expression": "sliding the printout across",
          "text": "Nine days ago he bought a bus ticket out of the Blackwood depot. Cash. But he used his own card at a motel four hours north the same night, and the clerk remembers him because he tipped. Nobody kidnaps a man and lets him tip a motel clerk, Jack. He walked onto that bus on his own two feet."
        },
        {
          "id": "nwd_l_j5",
          "characterId": "jack",
          "expression": "doing the math out loud",
          "text": "She told me three weeks missing. That leaves almost two weeks he was sitting somewhere in this country before he ever left it."
        },
        {
          "id": "nwd_l_r6",
          "characterId": "rosa",
          "expression": "nodding",
          "text": "Which means either he was hiding domestic first and got spooked into leaving the country — or somebody's timeline is off on purpose."
        },
        {
          "id": "nwd_l_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat. A dryer buzzer going off somewhere in the background.",
          "text": "There it was. What I'd been circling for two days. Landing on it meant admitting something about myself too."
        },
        {
          "id": "nwd_l_j6",
          "characterId": "jack",
          "expression": "flat, and it costs him something to say it",
          "text": "You think my client already knew he left on his own."
        },
        {
          "id": "nwd_l_r7",
          "characterId": "rosa",
          "expression": "direct",
          "text": "Town this size, a woman wants her husband found, she asks around. Two days, she knows. She doesn't hire a detective."
        },
        {
          "id": "nwd_l_j7",
          "characterId": "jack",
          "expression": "flat",
          "text": "Meaning."
        },
        {
          "id": "nwd_l_r8",
          "characterId": "rosa",
          "expression": "plain, then softer",
          "text": "Meaning hiring you isn't looking for him. It's a record of having looked. I'm not saying she's lying about everything. I'm saying you built her a story where she's the victim, and some part of you needed her to be."
        },
        {
          "id": "nwd_l_j8",
          "characterId": "jack",
          "expression": "quiet, honest",
          "text": "Yeah. Probably."
        },
        {
          "id": "nwd_l_r9",
          "characterId": "rosa",
          "expression": "softening, genuine, worried",
          "text": "I'm not trying to hurt you with this."
        },
        {
          "id": "nwd_l_j9",
          "characterId": "jack",
          "expression": "small, real smile",
          "text": "I know. That's kind of the problem. You're the only one who isn't."
        },
        {
          "id": "nwd_l_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat, folding the printout, tucking it into his coat",
          "text": "I'd built that story out of one good line in a diner. Now I believed it. Just not the way she meant it."
        },
        {
          "id": "nwd_l_j10",
          "characterId": "jack",
          "expression": "standing",
          "text": "I need to find him. Not her version of him. The real one."
        },
        {
          "id": "nwd_l_r10",
          "characterId": "rosa",
          "expression": "standing too, matching him, serious",
          "text": "Then you do it careful. If Solomon's people already grabbed you once, they're not gonna be polite about a second time."
        },
        {
          "id": "nwd_l_j11",
          "characterId": "jack",
          "expression": "half a smile, already heading for the door",
          "text": "When have I ever been polite about a first time."
        },
        {
          "id": "nwd_l_r11",
          "characterId": "rosa",
          "expression": "calling after him, exasperated but caring",
          "text": "Jack—"
        },
        {
          "id": "nwd_l_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat. The door chime, rain picking back up.",
          "text": "She didn't finish the sentence. Didn't need to. Six years she's been saying some version of it. Never once wrong."
        },
        {
          "id": "nwd_l_vo4",
          "characterId": "jack",
          "expression": "V.O. — quiet, determined. Wipers starting; the engine pulling away.",
          "text": "But now I had a motel four hours north and a clerk who remembered a man who tipped. First real lead in this whole case that hadn't been handed to me on somebody else's paper. Time to find out where a man goes when nobody's chasing him."
        }
      ],
      "choices": [
        {
          "id": "nwd_l_go",
          "text": "Drive. Four hours north.",
          "targetSceneId": "nwd_threeam",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_l_hs_printout",
          "label": "Rosa's printout",
          "cursor": "take",
          "bounds": {
            "x": 36,
            "y": 58,
            "w": 26,
            "h": 24
          },
          "isRepeatable": false,
          "action": {
            "type": "giveItem",
            "itemGranted": "nwd_printout"
          },
          "showItemImage": true
        },
        {
          "id": "nwd_l_hs_dryer",
          "label": "The tumbling dryer",
          "cursor": "look",
          "bounds": {
            "x": 6,
            "y": 26,
            "w": 20,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Nobody at this hour but the two of you and somebody's laundry going around. A buzzer goes off. Nobody comes for it."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_threeam",
      "title": "Part 1b — Three in the Morning",
      "partBreak": "Act Two, Part 1b — Three in the Morning",
      "background": "/img/nwd/ep2/office-3am.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "46% 46%",
        "zoomDuration": 44,
        "dimAmount": 0.18,
        "lights": [
          {
            "x": 50,
            "y": 44,
            "color": "#ffd9a0",
            "intensity": 0.36,
            "size": 30,
            "pulseSeconds": 8,
            "pulseAmount": 0.2
          }
        ]
      },
      "prose": "Jack's office. Late. A desk lamp. Rain on the window. Papers. No music. The only scene in the film where they are not adversaries. Nothing happens. That's the point — it's the scene the ending spends.",
      "dialogueBeats": [
        {
          "id": "nwd_t_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Three in the morning. Didn't call first. Nobody does here. Phones work, people stopped expecting them to."
        },
        {
          "id": "nwd_t_v1",
          "characterId": "vera",
          "expression": "from the doorway",
          "text": "Your light was on."
        },
        {
          "id": "nwd_t_j1",
          "characterId": "jack",
          "expression": "not surprised",
          "text": "My light's always on."
        },
        {
          "id": "nwd_t_v2",
          "characterId": "vera",
          "expression": "plain",
          "text": "I know. I've driven past it."
        },
        {
          "id": "nwd_t_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat. She comes in. A chair.",
          "text": "I want to be accurate here. She didn't work me. She sat in a bad chair and asked what I was doing."
        },
        {
          "id": "nwd_t_v3",
          "characterId": "vera",
          "expression": "plain",
          "text": "What are you doing."
        },
        {
          "id": "nwd_t_j2",
          "characterId": "jack",
          "expression": "gesturing at the desk",
          "text": "Your husband's bank statements. Third time through."
        },
        {
          "id": "nwd_t_v4",
          "characterId": "vera",
          "expression": "plain",
          "text": "Why three times?"
        },
        {
          "id": "nwd_t_j3",
          "characterId": "jack",
          "expression": "honest, a little embarrassed",
          "text": "Because I'm good at this and it's the only thing I've been good at for a decade and I don't have anywhere to be."
        },
        {
          "id": "nwd_t_v5",
          "characterId": "vera",
          "expression": "after a moment",
          "text": "Show me."
        },
        {
          "id": "nwd_t_j4",
          "characterId": "jack",
          "expression": "surprised",
          "text": "Show you what?"
        },
        {
          "id": "nwd_t_v6",
          "characterId": "vera",
          "expression": "genuine",
          "text": "What you see when you look at it. Nobody's ever shown me what they're good at. Everyone here does one thing badly for money."
        },
        {
          "id": "nwd_t_j5",
          "characterId": "jack",
          "expression": "warming, absorbed — the most alive he sounds in the film",
          "text": "Three withdrawals. Three branches. Three days."
        },
        {
          "id": "nwd_t_v7",
          "characterId": "vera",
          "expression": "watching him",
          "text": "What's that mean."
        },
        {
          "id": "nwd_t_j6",
          "characterId": "jack",
          "expression": "still warming",
          "text": "Everybody sees that and thinks nervous. It's not nervous. Nervous is one big one and a plane ticket. This is somebody who did the homework. Careful people leave a different shape than scared people."
        },
        {
          "id": "nwd_t_v8",
          "characterId": "vera",
          "expression": "quiet, watching him rather than the page",
          "text": "What shape do I leave?"
        },
        {
          "id": "nwd_t_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat. The lamp buzzing. He doesn't answer.",
          "text": "That was the whole thing. Four seconds to answer it correctly. I let it sit until it stopped being a question."
        },
        {
          "id": "nwd_t_v9",
          "characterId": "vera",
          "expression": "lighter, letting him off",
          "text": "Sorry. That was — ignore that."
        },
        {
          "id": "nwd_t_j7",
          "characterId": "jack",
          "expression": "quiet",
          "text": "No, it wasn't."
        },
        {
          "id": "nwd_t_v10",
          "characterId": "vera",
          "expression": "after a while, genuinely curious",
          "text": "Do you like it here?"
        },
        {
          "id": "nwd_t_j8",
          "characterId": "jack",
          "expression": "a short laugh",
          "text": "Nobody likes it here."
        },
        {
          "id": "nwd_t_v11",
          "characterId": "vera",
          "expression": "plain",
          "text": "That's not what I asked."
        },
        {
          "id": "nwd_t_j9",
          "characterId": "jack",
          "expression": "thinking about it properly",
          "text": "I know every road in this town. Which houses have somebody in them. What the mill sounded like when it ran — there's maybe eleven hundred of us left who do. Not liking it. Not nothing either. Only thing Blackwood gives you, and it gives it free."
        },
        {
          "id": "nwd_t_v12",
          "characterId": "vera",
          "expression": "quiet",
          "text": "And you'd stay."
        },
        {
          "id": "nwd_t_j10",
          "characterId": "jack",
          "expression": "plain",
          "text": "Nobody's ever asked me to be anywhere else."
        },
        {
          "id": "nwd_t_v13",
          "characterId": "vera",
          "expression": "carefully, and she starts something she doesn't finish",
          "text": "Jack. If I told you—"
        },
        {
          "id": "nwd_t_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat. The desk phone ringing. Loud. Wrong. Shattering it.",
          "text": "Wrong number, maybe. Rang four times. By the time it stopped she'd put it away. I watched her put it away. Didn't ask."
        },
        {
          "id": "nwd_t_v14",
          "characterId": "vera",
          "expression": "standing, mask back on, brisk",
          "text": "It's late. You've got a drive tomorrow."
        },
        {
          "id": "nwd_t_j11",
          "characterId": "jack",
          "expression": "not standing",
          "text": "Vera."
        },
        {
          "id": "nwd_t_v15",
          "characterId": "vera",
          "expression": "at the door, not turning",
          "text": "Find him. That's what I'm paying for."
        },
        {
          "id": "nwd_t_vo5",
          "characterId": "jack",
          "expression": "V.O. — flat. The door. Her car starting outside, pulling away. The office. The lamp. Rain. Jack not moving.",
          "text": "Sat there another hour. Didn't work. Tried to guess what she'd been about to say, then decided — the way a man decides on a second drink — that I didn't want to know badly enough to ask."
        },
        {
          "id": "nwd_t_vo6",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Last hour of my life nobody was dead yet. I spent it not asking a question."
        }
      ],
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "THREE IN THE MORNING",
        "recap": "Rosa ran the name — bus ticket, cash, nine days ago. He wasn't taken, he walked. And at three in the morning, nothing happened. That's the point."
      },
      "choices": [],
      "hotspots": [
        {
          "id": "nwd_t_hs_lamp",
          "label": "The desk lamp",
          "cursor": "look",
          "bounds": {
            "x": 44,
            "y": 40,
            "w": 22,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "One lamp, buzzing. Two heads bent over the same page in one pool of lamplight — the closest they get to each other in the whole film."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_48",
      "title": "Part 2 — Forty-Eight Hours",
      "partBreak": "Act Two, Part 2 — Forty-Eight Hours",
      "background": "/img/nwd/ep2/car-48.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 8,
        "dollyVertical": 1.5,
        "dollyDuration": 28,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 24,
            "y": 34,
            "color": "#2ad9d9",
            "intensity": 0.22,
            "size": 30,
            "pulseSeconds": 5,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "Jack's car engine idling, rain on the windshield, a phone buzzing on the dashboard. Hadn't made the parking lot before my phone went off. Number I didn't know. Never a coupon.",
      "dialogueBeats": [
        {
          "id": "nwd_f_tw1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Four hours north. The address is on a slip of paper Rosa slid across a diner table, and the whole trip runs on that: no client, no clock, no reason except that a man's been dead nine days and the county's already made up the story."
        },
        {
          "id": "nwd_f_tw2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Rosa mentioned the motel on the way. One night, cash rate, nine days back. She didn't say how she'd got it. She never says how she gets things."
        },
        {
          "id": "nwd_f_tw3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "I wasn't racing a clock. I keep coming back to that, later. I was driving four hours toward a house with the power on in his own name, and I couldn't have told you what I was hoping to find in it."
        },
        {
          "id": "nwd_f_sn1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Four hours north. No client, no clock, no case. Just an address on a single sheet of paper in a feed-store typeface, and a sentence a man said over a phone: I'd like him to be told, by somebody he'll believe, that his wife is sat in a room above a feed store."
        },
        {
          "id": "nwd_f_sn2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "I've done this job sixteen years, and delivering the worst news is not in it, and I made sure of that. Turns out it gets in anyway, when you give a name to a room full of a man's people to watch whether a face changes."
        },
        {
          "id": "nwd_f_sn3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "The road north is two lanes wide and it's still raining. I wasn't racing a clock. I was driving toward a kitchen where a man was making tea."
        },
        {
          "id": "nwd_f_j1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "wary, picking up",
          "text": "Yeah."
        },
        {
          "id": "nwd_f_sol1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "solomon",
          "expression": "V.O., filtered, phone — calm, almost friendly",
          "text": "Mr. Morrow. Glad you made it out of the warehouse. Genuinely. I'd have hated to lose you before we finished our conversation."
        },
        {
          "id": "nwd_f_j2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "Didn't realize we were still having one."
        },
        {
          "id": "nwd_f_sol2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "solomon",
          "expression": "V.O., filtered, phone — pleasant, precise",
          "text": "We are now. You've got forty-eight hours to bring me David Voss or my money. I don't especially care which. After that, I stop being patient, and I start being thorough. You understand the difference?"
        },
        {
          "id": "nwd_f_j3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "dry, masking how rattled he is",
          "text": "Thorough sounds worse."
        },
        {
          "id": "nwd_f_sol3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "solomon",
          "expression": "V.O., filtered, phone — almost warm",
          "text": "It is. Forty-eight hours, Mr. Morrow."
        },
        {
          "id": "nwd_f_vo1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat. The call disconnecting. Tires on wet pavement, the car accelerating.",
          "text": "A clock. Loud enough to hear over the rain."
        },
        {
          "id": "nwd_f_vo2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — fast, focused",
          "text": "First stop was the motel paperwork Rosa couldn't legally hand me but somehow ended up in my glove compartment anyway. One night, cash rate, nine days back. Four hours north — far enough that nobody from Blackwood would wander through, close enough he could still get home if he lost his nerve. That's not a man escaping. That's a man waiting for somebody."
        },
        {
          "id": "nwd_f_j4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "quick, businesslike, dialing",
          "text": "It's me. I need a favor and I need it in the next hour, not the next day."
        },
        {
          "id": "nwd_f_sato1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "sato",
          "expression": "V.O., filtered, phone — unbothered, wry",
          "text": "Everybody needs everything in the next hour. What makes you special?"
        },
        {
          "id": "nwd_f_j5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "tense",
          "text": "Because if I don't have a name and an address by sundown, a very patient man's gonna stop being patient, and I've already met his idea of not patient once this week."
        },
        {
          "id": "nwd_f_sato2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "sato",
          "expression": "V.O., filtered, phone — a beat, then more serious",
          "text": "Send me what you've got. I'll see what I can pull."
        },
        {
          "id": "nwd_f_vo3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat. Engine noise swelling, rain intensifying.",
          "text": "Forty-eight hours sounds like a lot until you do the math. Four just to drive up. Solomon's people had the same motel clerk I did. They could pay him better."
        },
        {
          "id": "nwd_f_vo4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I wasn't the only one racing that clock. Just the only one hoping it meant something good for somebody. Four hours north. A man who wasn't missing, about to find out how little disappearing well was going to save him."
        }
      ],
      "choices": [
        {
          "id": "nwd_f_go",
          "text": "Two hours north. Stop for gas.",
          "targetSceneId": "nwd_pumps",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_f_hs_glovebox",
          "gating": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "label": "The glove compartment",
          "cursor": "look",
          "bounds": {
            "x": 58,
            "y": 54,
            "w": 26,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Motel paperwork Rosa couldn't legally hand me. Somehow it ended up in here anyway. One night, cash rate, nine days back."
          }
        },
        {
          "id": "nwd_f_hs_paper",
          "label": "The slip of paper",
          "cursor": "look",
          "bounds": {
            "x": 58,
            "y": 54,
            "w": 26,
            "h": 26
          },
          "isRepeatable": true,
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "action": {
            "type": "showText",
            "text": "A slip of paper in the glove compartment. An address in Rosa's handwriting, nothing else. Off the record. Permanently."
          }
        },
        {
          "id": "nwd_f_hs_sn",
          "label": "The single sheet of paper",
          "cursor": "look",
          "bounds": {
            "x": 58,
            "y": 54,
            "w": 26,
            "h": 26
          },
          "isRepeatable": true,
          "gating": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "action": {
            "type": "showText",
            "text": "A single sheet in the glove compartment. An address in typeface, nothing else. Four hours north, and the power on in his own name, and the man who wrote it pleased about it."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_pumps",
      "title": "Part 2b — The Pumps at Route 6",
      "partBreak": "Act Two, Part 2b — The Pumps at Route 6",
      "background": "/img/nwd/ep2/pumps-route6.jpg",
      "ambientAudio": "drone",
      "transition": "cut",
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.2,
        "lights": [
          {
            "x": 40,
            "y": 14,
            "color": "#dff3ff",
            "intensity": 0.34,
            "size": 40,
            "pulseSeconds": 4.4,
            "pulseAmount": 0.3
          },
          {
            "x": 78,
            "y": 40,
            "color": "#ffb761",
            "intensity": 0.16,
            "size": 24,
            "pulseSeconds": 6,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "A gas station off a two-lane road. Wind. A pump ticking. A radio inside playing something country and badly tuned. Fluorescent buzz. Two men on a bench by the ice machine. Nothing here advances the plot. That's the point.",
      "dialogueBeats": [
        {
          "id": "nwd_g_g1",
          "characterId": "gary",
          "expression": "mid-rant, not the start of it",
          "text": "—eleven years, Denny. Eleven fucking years, and she's out the door with a bloke who sells hot tubs."
        },
        {
          "id": "nwd_g_d1",
          "characterId": "denny",
          "expression": "chewing",
          "text": "Hot tubs is decent money."
        },
        {
          "id": "nwd_g_g2",
          "characterId": "gary",
          "expression": "flaring",
          "text": "That is not the fucking point."
        },
        {
          "id": "nwd_g_d2",
          "characterId": "denny",
          "expression": "unbothered",
          "text": "It's a bit of the point."
        },
        {
          "id": "nwd_g_g3",
          "characterId": "gary",
          "expression": "flaring",
          "text": "It is not a bit of the point, you daft bastard. The point is she's a lying, cheating bitch who had a whole other phone."
        },
        {
          "id": "nwd_g_d3",
          "characterId": "denny",
          "expression": "nodding slowly",
          "text": "Ah. There it is."
        },
        {
          "id": "nwd_g_g4",
          "characterId": "gary",
          "expression": "the whole grievance",
          "text": "A whole other phone. In the glovebox. Under the manual. Who the fuck reads the manual, Denny? Nobody. That's not a hiding place, that's a decision."
        },
        {
          "id": "nwd_g_d4",
          "characterId": "denny",
          "expression": "flat",
          "text": "That's the bit that gets you."
        },
        {
          "id": "nwd_g_g5",
          "characterId": "gary",
          "expression": "agreeing",
          "text": "That's exactly the bit that gets me."
        },
        {
          "id": "nwd_g_d5",
          "characterId": "denny",
          "expression": "plain",
          "text": "Not the bloke."
        },
        {
          "id": "nwd_g_g6",
          "characterId": "gary",
          "expression": "flat",
          "text": "Fuck the bloke. The bloke's an idiot with a van. It's the filing. She had a system, Denny. She had a system and I was inside it."
        },
        {
          "id": "nwd_g_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat, quiet. His pump clicking off. He doesn't move to hang it up.",
          "text": "Two hours north. Stopped at a place with three pumps and one that worked. I'd been in my own head a hundred miles and I was glad of the noise. That lasted about forty seconds."
        },
        {
          "id": "nwd_g_d6",
          "characterId": "denny",
          "expression": "after a beat",
          "text": "Can I say something."
        },
        {
          "id": "nwd_g_g7",
          "characterId": "gary",
          "expression": "plain",
          "text": "Say it."
        },
        {
          "id": "nwd_g_d7",
          "characterId": "denny",
          "expression": "flat",
          "text": "You knew."
        },
        {
          "id": "nwd_g_g8",
          "characterId": "gary",
          "expression": "immediately",
          "text": "I did not fucking know."
        },
        {
          "id": "nwd_g_d8",
          "characterId": "denny",
          "expression": "flat",
          "text": "Gary. Four months back you asked me if it was normal for a woman to start doing her hair on a Tuesday."
        },
        {
          "id": "nwd_g_g9",
          "characterId": "gary",
          "expression": "defensive",
          "text": "That's not knowing."
        },
        {
          "id": "nwd_g_d9",
          "characterId": "denny",
          "expression": "the kill shot",
          "text": "That's the exact shape of knowing. That's knowing with a fucking hat on."
        },
        {
          "id": "nwd_g_g10",
          "characterId": "gary",
          "expression": "quieter. Wind. The radio inside, badly tuned.",
          "text": "I asked you because I wanted you to tell me it was normal."
        },
        {
          "id": "nwd_g_d10",
          "characterId": "denny",
          "expression": "no defence at all",
          "text": "I know. That's why I said it was normal."
        },
        {
          "id": "nwd_g_g11",
          "characterId": "gary",
          "expression": "flat",
          "text": "That was a shit thing to do, Denny."
        },
        {
          "id": "nwd_g_d11",
          "characterId": "denny",
          "expression": "no defence at all",
          "text": "It was, yeah."
        },
        {
          "id": "nwd_g_d12",
          "characterId": "denny",
          "expression": "eventually. The ice machine cycling. Wind.",
          "text": "What'd you want me to say?"
        },
        {
          "id": "nwd_g_g12",
          "characterId": "gary",
          "expression": "honest, and this is the only quiet thing he says",
          "text": "Nothing. That's the hell of it, isn't it. There's no version where you say it and I hear it. You'd have said it and I'd have had a different bloke to be angry at for four months, and she'd still have been in the glovebox."
        },
        {
          "id": "nwd_g_vo2",
          "characterId": "jack",
          "expression": "V.O. — quiet. Hanging up the nozzle. The clunk of it.",
          "text": ""
        },
        {
          "id": "nwd_g_d13",
          "characterId": "denny",
          "expression": "noticing him",
          "text": "Alright."
        },
        {
          "id": "nwd_g_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "Alright."
        },
        {
          "id": "nwd_g_d14",
          "characterId": "denny",
          "expression": "gesturing at Gary with the paper bag",
          "text": "Don't mind him. He's having a year."
        },
        {
          "id": "nwd_g_j2",
          "characterId": "jack",
          "expression": "after a beat",
          "text": "Yeah. Me too."
        },
        {
          "id": "nwd_g_g13",
          "characterId": "gary",
          "expression": "to Jack, not really asking",
          "text": "You married?"
        },
        {
          "id": "nwd_g_j3",
          "characterId": "jack",
          "expression": "plain",
          "text": "No."
        },
        {
          "id": "nwd_g_g14",
          "characterId": "gary",
          "expression": "nodding, satisfied",
          "text": "Smart man."
        },
        {
          "id": "nwd_g_j4",
          "characterId": "jack",
          "expression": "quiet",
          "text": "It's not that."
        },
        {
          "id": "nwd_g_g15",
          "characterId": "gary",
          "expression": "not listening, already going",
          "text": "Because here's the thing nobody fucking tells you. You think it's going to be a moment. Door slamming, suitcase, all that. It's not. It's a Tuesday, and she does her hair, and you decide not to ask."
        },
        {
          "id": "nwd_g_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat, quiet. The pump ticking. Wind. Jack not moving.",
          "text": "Bloke at a petrol station in the middle of nowhere, eating out of a paper bag, and he'd got the whole thing in one sentence. It's a Tuesday and you decide not to ask."
        },
        {
          "id": "nwd_g_d15",
          "characterId": "denny",
          "expression": "calling after him, friendly",
          "text": "Drive safe."
        },
        {
          "id": "nwd_g_j5",
          "characterId": "jack",
          "expression": "not turning",
          "text": "Yeah."
        },
        {
          "id": "nwd_g_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat. The door shutting. The engine. Gravel. The forecourt light receding.",
          "text": "I got about six miles before I had to pull over. Not for anything. I just couldn't be doing seventy toward her with that sentence in the car."
        },
        {
          "id": "nwd_g_vo5",
          "characterId": "jack",
          "expression": "V.O. — very quiet. An engine idling on a hard shoulder. Wind. Nothing else.",
          "text": "Four months, that bloke said. I've had nine days and I've been better at it than he ever was."
        }
      ],
      "choices": [
        {
          "id": "nwd_g_go",
          "text": "Drive on. Four hours done.",
          "targetSceneId": "nwd_interlude",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_g_hs_pump",
          "label": "The one working pump",
          "cursor": "look",
          "bounds": {
            "x": 30,
            "y": 30,
            "w": 22,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Three pumps and one that worked. Moths going at the light. The nozzle clicks off and he doesn't hang it up."
          }
        },
        {
          "id": "nwd_g_hs_bench",
          "label": "The bench by the ice machine",
          "cursor": "look",
          "bounds": {
            "x": 62,
            "y": 44,
            "w": 30,
            "h": 34
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Two men. One having a year. The other telling him the exact shape of knowing with a hat on."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_interlude",
      "title": "Interlude — What She Carries",
      "nodeType": "cutscene",
      "background": "/img/nwd/ep2/apartment-shoebox.jpg",
      "ambientAudio": "drone",
      "musicMode": "none",
      "transition": "fade-black",
      "transitionSpeed": 1.8,
      "letterbox": true,
      "choiceDelaySeconds": 9,
      "cinematic": {
        "mode": "pan",
        "panDistance": 6,
        "panDirection": "right",
        "zoomDuration": 30,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 62,
            "y": 44,
            "color": "#ffc890",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 6.4,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "A smaller place. Warmer light than anywhere else in this story has had. She's not performing for anyone. No one's watching. That's the point.\n\nA shoebox: photographs, handwritten in the margins. A man's watch, stopped, the leather band cracked with age. She holds it a long moment — the way you hold something you're afraid of dropping and afraid of letting go of at the same time.",
      "dialogueBeats": [
        {
          "id": "nwd_i_v1",
          "characterId": "vera",
          "expression": "V.O. — quiet, almost spoken rather than sung, barely audible",
          "text": "He used to say the debt wasn't the money. Said the money's just what they hand you a bill for. The debt's what you owe the people who trusted you before any of this started."
        }
      ],
      "choices": [
        {
          "id": "nwd_i_watch",
          "text": "The stopped watch.",
          "attitudeTag": "Neutral",
          "reply": true,
          "consequences": {
            "setFlags": [
              "saw_watch"
            ]
          }
        },
        {
          "id": "nwd_i_go",
          "text": "She closes the box.",
          "targetSceneId": "nwd_rental",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": []
    },
    {
      "id": "nwd_rental",
      "title": "Part 3 — The Plan Nobody Told Me About",
      "partBreak": "Act Two, Part 3 — The Plan Nobody Told Me About",
      "background": "/img/nwd/ep2/rental-kitchen.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "48% 50%",
        "zoomDuration": 38,
        "dimAmount": 0.22,
        "lights": [
          {
            "x": 30,
            "y": 30,
            "color": "#ffd9a0",
            "intensity": 0.28,
            "size": 32,
            "pulseSeconds": 6,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "A quiet residential street. Crickets. Much less rain here than Blackwood. Rental, dead-end street, weekly, cash, under a name that isn't David Voss.",
      "dialogueBeats": [
        {
          "id": "nwd_r_s0",
          "characterId": "narrator",
          "expression": "the duffel bags by the door",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_cs1",
          "characterId": "narrator",
          "expression": "state tape across the door, sagging in the rain. Two men inside. They let him through.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_cs2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Nine days. The clock on the wall is still running. That's the thing nobody puts in a file — a house keeps its time anyway."
        },
        {
          "id": "nwd_r_cs3",
          "characterId": "narrator",
          "expression": "the kitchen. Crickets outside. Quiet — deliberately, unbearably ordinary.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_cs4",
          "characterId": "jack",
          "expression": "V.O. — flat. Moving through, not searching. Reading it.",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Two duffel bags, gone. One of them never opened. A cup by the sink, full, never drunk — the kind of ordinary that takes a while to look at."
        },
        {
          "id": "nwd_r_cs5",
          "characterId": "jack",
          "expression": "V.O. — flat, under the radio",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Cash on the premises, gone. That's the robbery. A man who moved two-eleven across a state line in a bag doesn't get robbed for the change. Somebody dressed this house in a story, and the story's already on the radio."
        },
        {
          "id": "nwd_r_cs6",
          "characterId": "narrator",
          "expression": "inside the cupboard, under a shelf that was supposed to hold flour — a list",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_cs7",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Six tables. Bread in the morning. Two words under both, in pencil: patient. I stood there a long time with a dead man's list, and I didn't know which of us it was for."
        },
        {
          "id": "nwd_r_cs8",
          "characterId": "jack",
          "expression": "V.O. — flat. The door. The yard.",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "On the way out the state radio was doing it again. Robbery, cash on the premises, gone. I let it play. Some stories get to be true the first time they're told."
        },
        {
          "id": "nwd_r_sn1",
          "characterId": "narrator",
          "expression": "the chain rattling loose. A kitchen with the kettle ticking as it cools. Two mugs on the counter.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_sn_d1",
          "characterId": "david",
          "expression": "wary, not looking at the door",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Morrow. She sent you. It's late."
        },
        {
          "id": "nwd_r_sn_j1",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Sorry about the hour."
        },
        {
          "id": "nwd_r_sn_d2",
          "characterId": "david",
          "expression": "moving to the counter",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Make it quick. The neighbours notice cars."
        },
        {
          "id": "nwd_r_sn_s1",
          "characterId": "narrator",
          "expression": "a second mug put out, then put back in the cupboard. Rain starting out here.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_sn_j2",
          "characterId": "jack",
          "expression": "flat, no preamble left",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Solomon's got your wife in a room above the feed store."
        },
        {
          "id": "nwd_r_sn_s2",
          "characterId": "narrator",
          "expression": "a long hold. The kettle. Rain.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_sn_d3",
          "characterId": "david",
          "expression": "quiet",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Right. I'll bring it back."
        },
        {
          "id": "nwd_r_sn_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "Not a beat. Not a thought. Two hundred and eleven thousand dollars, fourteen months, everything he'd built — right, I'll bring it back. Like he'd been waiting nine days for a reason to."
        },
        {
          "id": "nwd_r_sn_d4",
          "characterId": "david",
          "expression": "quick, before the headlights",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "One thing, since you're telling her anything. The money. The bag. The plan — it was the two of us, all of it."
        },
        {
          "id": "nwd_r_sn_s3",
          "characterId": "narrator",
          "expression": "headlights sweeping the window. Tires on gravel. Unhurried.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_sn_d5",
          "characterId": "david",
          "expression": "stopping",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "That's not your car."
        },
        {
          "id": "nwd_r_sn_j3",
          "characterId": "jack",
          "expression": "already toward the door",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "No."
        },
        {
          "id": "nwd_r_sn_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat. The door. The yard.",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "A motel receipt under the sugar bowl. One night, cash, nine days back. The clerk had written 'tipped' in the margin, which is the kind of thing you only write down if it's the kind of thing you remember. A list taped inside the cupboard. Six tables. Bread in the morning. Two words under both, in pencil: patient."
        },
        {
          "id": "nwd_r_sn_s4",
          "characterId": "narrator",
          "expression": "the front door coming in — wood splintering — boots on linoleum",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_r_vo1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Doc came through. Power switched on under an account that used to be his. People think changing your name fixes everything. It doesn't fix the part that still pays its bills."
        },
        {
          "id": "nwd_r_vo2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat. Knocking. Didn't expect an answer. Got one.",
          "text": ""
        },
        {
          "id": "nwd_r_dav1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "wary, exhausted, a little manic — through the chain",
          "text": "Whoever you are, I don't have anything worth stealing."
        },
        {
          "id": "nwd_r_j1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "calm, hands visible",
          "text": "Not here to steal anything. Name's Jack Morrow. Your wife hired me to find you."
        },
        {
          "id": "nwd_r_dav2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "bitter laugh, but underneath it, real fear — the chain rattling loose",
          "text": "She hired you? Of course she did. Christ. Come in before somebody sees you standing there."
        },
        {
          "id": "nwd_r_vo3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Two duffel bags, unpacked. Part of him still thought he'd have to run. I know that feeling."
        },
        {
          "id": "nwd_r_j2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "direct",
          "text": "Solomon Reyes grabbed me two nights ago. Zip-tied me to a chair and asked real polite where his money was. Gave me forty-eight hours to bring him you or the cash. That clock's down to about thirty now."
        },
        {
          "id": "nwd_r_dav3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "going pale",
          "text": "Jesus. He got to you already?"
        },
        {
          "id": "nwd_r_j3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "He got to me before I knew what “it” was."
        },
        {
          "id": "nwd_r_j4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "conversational, which is worse — moving through the room, not searching. Reading it.",
          "text": "Weekly rate. Cash. Four hours north — not eight, not a state line, four. And you put the power on under your own account."
        },
        {
          "id": "nwd_r_dav4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "defensive",
          "text": "I needed heat, it was—"
        },
        {
          "id": "nwd_r_j5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "cutting through, still not raising his voice",
          "text": "You've got two hundred and eleven thousand dollars in a bag and you're nine days out. You could be anywhere. You could be somewhere with a different alphabet. Instead you're close enough to drive back in an afternoon, under a name that leaves a trail a bored cop could follow, in a house you're paying for one week at a time."
        },
        {
          "id": "nwd_r_j6",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "quiet. David not answering. The kettle ticking.",
          "text": "That's not a man hiding, David. Weekly means you don't know how long you'll need it. Close means you want to be findable by exactly one person. You're not running. You're waiting."
        },
        {
          "id": "nwd_r_dav5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "very quiet",
          "text": "Yeah."
        },
        {
          "id": "nwd_r_j7",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "and it costs him",
          "text": "Nine days."
        },
        {
          "id": "nwd_r_dav6",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "barely",
          "text": "Yeah."
        },
        {
          "id": "nwd_r_j8",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat, gentle, awful",
          "text": "David. She's not late."
        },
        {
          "id": "nwd_r_dav7",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "after a long moment, not looking at him",
          "text": "Say the rest of it."
        },
        {
          "id": "nwd_r_j9",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "quiet",
          "text": "I don't have to. You switched the power on under your own name so she could find you if she'd lost the address. You've been making yourself easy to reach for nine days. You just didn't think about who else that works for."
        },
        {
          "id": "nwd_r_dav8",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "muffled, wrecked — hands over his face. A long exhale.",
          "text": "Okay. Okay. Then you already know most of it. Ask me anything you want."
        },
        {
          "id": "nwd_r_dav9",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "quiet, defeated",
          "text": "You're gonna think I'm the worst person you ever met."
        },
        {
          "id": "nwd_r_j10",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "dry, but gentle",
          "text": "Client list's pretty competitive this week. Try me."
        },
        {
          "id": "nwd_r_dav10",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "quiet, relief of finally saying it",
          "text": "Vera and I planned this together. All of it."
        },
        {
          "id": "nwd_r_j11",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "The disappearance."
        },
        {
          "id": "nwd_r_dav11",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "the whole shape of it",
          "text": "The money. The bus. Fourteen months skimming off Solomon, small enough he never felt it. I pulled the last of it in one go and got out like we agreed."
        },
        {
          "id": "nwd_r_j12",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "plain",
          "text": "How much."
        },
        {
          "id": "nwd_r_dav12",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "bitter",
          "text": "Two-eleven. That's what it cost to leave. People have died in that town over a tenth of it."
        },
        {
          "id": "nwd_r_vo4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I'd said most of it on the walk in. Saying it and hearing it are different jobs."
        },
        {
          "id": "nwd_r_j13",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "careful, quiet",
          "text": "So she didn't hire me to find you. She hired me to prove she never knew where you went."
        },
        {
          "id": "nwd_r_dav13",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "nodding, grim",
          "text": "That was always the plan. You'd dig, you'd come up empty, you'd tell her — and everybody, cops included — that she genuinely had no idea. Clean alibi. Except you didn't come up empty. You came up here."
        },
        {
          "id": "nwd_r_j14",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "sharp, but not cruel",
          "text": "Then explain something to me. If this was the plan, why do you look like you're about to fall apart every time somebody knocks on your door?"
        },
        {
          "id": "nwd_r_dav14",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "quieter, scared now — standing, pacing",
          "text": "Because two days ago Vera stopped answering the number only I have. And a plan where you split the money fifty-fifty doesn't usually involve one person going quiet right when the other one's ready to collect his half."
        },
        {
          "id": "nwd_r_vo5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat. Crickets outside, a car engine faint in the distance.",
          "text": "Lined up with something I hadn't wanted to say out loud. A woman with an airtight alibi doesn't need her husband walking around to confirm it. I believed it anyway."
        },
        {
          "id": "nwd_r_j15",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "low",
          "text": "You think she's planning on cutting you out."
        },
        {
          "id": "nwd_r_dav15",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "quiet, honest, scared",
          "text": "I think I've been so busy hiding from Solomon I forgot I should've been hiding from her too."
        },
        {
          "id": "nwd_r_j16",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "quiet. A long silence. Crickets. The kettle.",
          "text": "Sit down. Tell me all of it, from the start, and don't leave things out to make yourself look better. I've had a week of people editing."
        },
        {
          "id": "nwd_r_vo6",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat, under the fade. David starting to talk, low.",
          "text": "He talked forty minutes. Most of it I already had. By the end he'd stopped being frightened. Lighter. Like a man told he could put a bag down."
        },
        {
          "id": "nwd_r_vo7",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — flat. The kitchen, quieter now. Two men talking low. Crickets outside.",
          "text": "That's the one thing I'd take back. Not the six seconds. That. I let him put the bag down."
        }
      ],
      "choices": [
        {
          "id": "nwd_r_go",
          "text": "Stay for the kettle.",
          "targetSceneId": "nwd_yard",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          }
        },
        {
          "id": "nwd_r_go_tw",
          "text": "The state radio. The story. Drive back.",
          "targetSceneId": "nwd_yard",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          }
        },
        {
          "id": "nwd_r_go_sn",
          "text": "The boots on the linoleum.",
          "targetSceneId": "nwd_yard",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "vera_held"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_r_hs_bags",
          "gating": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "label": "The two duffel bags",
          "cursor": "look",
          "bounds": {
            "x": 6,
            "y": 56,
            "w": 24,
            "h": 32
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Unpacked. Part of him still thought he'd have to run. Two hundred and eleven thousand dollars, and one bag he never opened."
          }
        },
        {
          "id": "nwd_r_hs_mugs",
          "gating": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "label": "The mismatched mugs",
          "cursor": "look",
          "bounds": {
            "x": 44,
            "y": 54,
            "w": 22,
            "h": 24
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "An ordinary rental kitchen. Two mismatched mugs. A kettle ticking as it cools. Deliberately, unbearably ordinary."
          }
        },
        {
          "id": "nwd_r_hs_kettle",
          "gating": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "label": "The kettle",
          "cursor": "look",
          "bounds": {
            "x": 68,
            "y": 46,
            "w": 20,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Ticking as it cools. Nobody drinks what's in the cups."
          }
        },
        {
          "id": "nwd_r_hs_tape",
          "label": "The tape across the door",
          "cursor": "look",
          "bounds": {
            "x": 2,
            "y": 8,
            "w": 18,
            "h": 30
          },
          "isRepeatable": true,
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "action": {
            "type": "showText",
            "text": "Yellow tape, sagging in the rain. One corner peeling like it's given up earlier than the rest of it."
          }
        },
        {
          "id": "nwd_r_hs_cupboard",
          "label": "The cupboard by the sink",
          "cursor": "look",
          "bounds": {
            "x": 44,
            "y": 54,
            "w": 22,
            "h": 24
          },
          "isRepeatable": true,
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "action": {
            "type": "showText",
            "text": "The list, under a shelf that was supposed to hold flour. Six tables. Bread in the morning. Two words under both, in pencil: patient."
          }
        },
        {
          "id": "nwd_r_hs_cups",
          "label": "The cup by the sink",
          "cursor": "look",
          "bounds": {
            "x": 68,
            "y": 46,
            "w": 20,
            "h": 26
          },
          "isRepeatable": true,
          "gating": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "action": {
            "type": "showText",
            "text": "Full. Never drunk. Nobody drinks what's in the cups, and nobody's coming to wash it."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_yard",
      "title": "Part 4 — Everything I Already Knew",
      "partBreak": "Act Two, Part 4 — Everything I Already Knew",
      "background": "/img/nwd/ep2/yard-screen-door.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.4,
        "lights": [
          {
            "x": 50,
            "y": 10,
            "color": "#cfe8ff",
            "intensity": 0.22,
            "size": 28,
            "pulseSeconds": 5,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "The kitchen. Crickets outside. Quiet — deliberately, unbearably ordinary.",
      "dialogueBeats": [
        {
          "id": "nwd_y_s0",
          "characterId": "narrator",
          "expression": "David's hands wrapped around his cup like it's the only warm thing in the room",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_tw1",
          "characterId": "narrator",
          "expression": "the state radio, low through the wall. Boots on gravel going away. Tape at the door, sagging.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_tw2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "They'd been through the house once. They'd be through it again. The file already had a shape — robbery, cash on the premises, gone — and the shape was going to harden into something with a name in it. I knew the name wasn't the truth."
        },
        {
          "id": "nwd_y_tw3",
          "characterId": "narrator",
          "expression": "the yard. The kitchen window, dark. Crickets. Rain starting, the way it does out here, like the sky's changed its mind.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_tw4",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "I sat in the grass and did the arithmetic. Nine days, and the house didn't know it was a crime scene. The clock on the wall, the cup by the sink, the list in the cupboard. It was still being a kitchen. That's the part I can't put down."
        },
        {
          "id": "nwd_y_tw5",
          "characterId": "narrator",
          "expression": "a phone. In his hand. Lit up. Ringing.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_tw6",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "It started to ring. I didn't pick it up. I let it go on."
        },
        {
          "id": "nwd_y_sn1",
          "characterId": "narrator",
          "expression": "one gunshot. Flat. Close. Not dramatic. It sounds like a door slamming.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "background": "gradient:linear-gradient(#020202,#050505)",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 1.6,
          "text": ""
        },
        {
          "id": "nwd_y_sn2",
          "characterId": "narrator",
          "expression": "nothing. Crickets. Rain starting. No dialogue. No narration.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_sn3",
          "characterId": "narrator",
          "expression": "boots walking away, unhurried, across gravel. Two car doors. An engine. Not fast. Then gone. Crickets.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_sn_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat, and the flatness is the injury",
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": "I stood in the yard with the rain starting and I did the arithmetic. One sentence. Right, I'll bring it back. I'd given him the reason to say it four hours ago in a pool hall, and he'd used it the second it was useful."
        },
        {
          "id": "nwd_y_sn4",
          "characterId": "narrator",
          "expression": "a phone buzzing. On and on. Nobody answers it.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "vera_held"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_y_dav1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "easier now, the relief of having told someone",
          "text": "Can I tell you something stupid?"
        },
        {
          "id": "nwd_y_j1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "tired, almost warm",
          "text": "My week's been full of stupid."
        },
        {
          "id": "nwd_y_dav2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "the dream",
          "text": "There's a place on Ash Street. Used to be a bakery, before. Ovens are still in it. That's what the money was for. Not a boat. Not — I wanted six tables and bread in the morning."
        },
        {
          "id": "nwd_y_j2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "a beat",
          "text": "You know how to bake?"
        },
        {
          "id": "nwd_y_dav3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "a small, real laugh",
          "text": "Not even a little. That's the point. Everything I ever got good at, I got good at by lying. I wanted one thing I'd have to be bad at first. One thing I earned by being patient."
        },
        {
          "id": "nwd_y_dav4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "lighter — then headlights sweeping the window. Tires on gravel.",
          "text": "Nobody's bought it because nobody in Blackwood's got —"
        },
        {
          "id": "nwd_y_dav5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "stopping",
          "text": "That's not your car."
        },
        {
          "id": "nwd_y_j3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "already up",
          "text": "No."
        },
        {
          "id": "nwd_y_vo1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — nothing. Car doors. Boots on gravel, unhurried. Not running. That's worse.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_y_dav6",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "fast, hands shaking",
          "text": "Back door. There's a back door—"
        },
        {
          "id": "nwd_y_j4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "low",
          "text": "Go. I'll slow them down."
        },
        {
          "id": "nwd_y_dav7",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "disbelieving",
          "text": "You don't even know these people—"
        },
        {
          "id": "nwd_y_j5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "plain",
          "text": "Go."
        },
        {
          "id": "nwd_y_dav8",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "david",
          "expression": "quiet, almost embarrassed — stopping half a second in the doorway",
          "text": "Hey. Thanks for not just handing me over the second you knew. Most guys would've."
        },
        {
          "id": "nwd_y_j6",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "not looking at him",
          "text": "Don't thank me yet."
        },
        {
          "id": "nwd_y_s1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "the front door coming in — wood splintering — boots on linoleum",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_y_j7",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "shouting, pounding toward the back — a screen door banging open — night air",
          "text": "DAVID— No, no, no—"
        },
        {
          "id": "nwd_y_s2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "one gunshot. Flat. Close. Not dramatic. It sounds like a door slamming.",
          "silent": true,
          "background": "gradient:linear-gradient(#020202,#050505)",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 1.6,
          "text": ""
        },
        {
          "id": "nwd_y_s3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "nothing. Crickets. The screen door swinging on its spring, slower and slower, until it stops.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_y_s4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "boots walking away, unhurried, across gravel. Two car doors. An engine. Not fast. Then gone. Crickets.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_y_s5",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "Jack's footsteps on grass. Slow. Stopping. HOLD — ten full seconds. Rain starting. No dialogue. No narration.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_y_s6",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "a phone buzzing. On and on. Nobody answers it.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_y_vo2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — none. Let it be long enough to be uncomfortable.",
          "silent": true,
          "text": ""
        }
      ],
      "choices": [
        {
          "id": "nwd_y_go",
          "text": "The phone, buzzing on and on. Nobody answers it.",
          "targetSceneId": "nwd_curtain2",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_y_hs_ash",
          "label": "Ash Street, on the drive back",
          "cursor": "look",
          "bounds": {
            "x": 10,
            "y": 40,
            "w": 26,
            "h": 32
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "There's a building on Ash Street with the ovens still in it. Nobody's bought it. Six tables and bread in the morning."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_curtain2",
      "title": "Nobody Answers It",
      "background": "/img/nwd/ep2/yard-screen-door.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 2.2,
      "letterbox": true,
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "END OF ACT TWO",
        "recap": "Six tables and bread in the morning. A phone, on and on. Nobody answers it."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.58,
        "lights": [
          {
            "x": 50,
            "y": 10,
            "color": "#cfe8ff",
            "intensity": 0.2,
            "size": 28,
            "pulseSeconds": 5,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "Rain starting. A phone, on and on. Nobody answers it. END OF ACT TWO.",
      "dialogueBeats": [],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_call",
      "title": "Act Three, Part 1 — The Call",
      "partBreak": "Act Three, Part 1 — The Call",
      "background": "/img/nwd/ep3/yard-call.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "cut",
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.46,
        "lights": [
          {
            "x": 50,
            "y": 50,
            "color": "#9fe8ff",
            "intensity": 0.16,
            "size": 30,
            "pulseSeconds": 3.4,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "Rain, steady. Jack still in the yard. State-police radios somewhere behind him, distant, indistinct. He sits on wet grass, knees up, phone lit in his hand — the only light source in frame besides distant emergency strobes, red and blue, unfocused in the rain behind him.",
      "dialogueBeats": [
        {
          "id": "nwd_c_vo1",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — quiet, raw",
          "text": "I let it ring four times. Not because I didn't know I was gonna answer. Because I needed those four rings to remember something before I did."
        },
        {
          "id": "nwd_c_vo2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Six tables. Bread in the morning. One thing he'd have to be bad at first."
        },
        {
          "id": "nwd_c_vo2tw",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Six tables. Bread in the morning. Two words under it, in pencil: patient. I read it in a cupboard four hours north, under a shelf that was supposed to hold flour."
        },
        {
          "id": "nwd_c_vo3",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — the phone, still ringing. Then — answered.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_c_j1",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat, guarded, exhausted",
          "text": "Yeah."
        },
        {
          "id": "nwd_c_v1",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — controlled, but something underneath fraying at the edges",
          "text": "Jack. Thank God. I've been calling since this morning."
        },
        {
          "id": "nwd_c_j2",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "careful, testing",
          "text": "Been a long night."
        },
        {
          "id": "nwd_c_v2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — quick, urgent",
          "text": "Have you found him? Please tell me you found him."
        },
        {
          "id": "nwd_c_v2tw",
          "characterId": "vera",
          "expression": "V.O., filtered, phone — quick, urgent",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "They've ruled it a robbery. Nine days of not knowing, and a robbery — I need to hear it from somebody who was in the house."
        },
        {
          "id": "nwd_c_vo4",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — low, deciding in real time",
          "text": "There it was. The exact fork in the road. Tell her everything and watch what her face does. Or hold it back and see what she says next without me steering her there."
        },
        {
          "id": "nwd_c_j3",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat, nothing in it",
          "text": "I found him."
        },
        {
          "id": "nwd_c_v3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — a sharp breath",
          "text": "Where. Is he safe?"
        },
        {
          "id": "nwd_c_v3tw",
          "characterId": "vera",
          "expression": "V.O., filtered, phone — quiet",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "How did it happen. Tell me how it happened."
        },
        {
          "id": "nwd_c_s1",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "rain. Jack not answering. It goes on too long.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_c_v4",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — quieter",
          "text": "Jack."
        },
        {
          "id": "nwd_c_j4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "I was standing about twenty feet away."
        },
        {
          "id": "nwd_c_j4tw",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Nine days. I'll say the rest to your face. That's where it has to be said."
        },
        {
          "id": "nwd_c_s2",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "narrator",
          "expression": "silence on the line. Not a gasp. Nothing at all.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_c_v5",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — after a long moment, very small",
          "text": "Okay."
        },
        {
          "id": "nwd_c_j5",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "That's it? Okay?"
        },
        {
          "id": "nwd_c_v6",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — barely",
          "text": "I don't know what the other thing is. Nobody's ever told me one before."
        },
        {
          "id": "nwd_c_v7",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — a long, ragged exhale. Breaking, and it doesn't sound performed anymore.",
          "text": "Jack, I swear to you—"
        },
        {
          "id": "nwd_c_j6",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "cutting her off, exhausted",
          "text": "Don't. Not on the phone. Whatever you're gonna swear to me, you're gonna say it to my face, where I can watch you say it."
        },
        {
          "id": "nwd_c_v8",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "V.O., filtered, phone — a shaky breath",
          "text": "Okay. Where."
        },
        {
          "id": "nwd_c_j7",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "I'll text you an address. One hour."
        },
        {
          "id": "nwd_c_vo5",
          "conditionRule": {
            "excludesFlags": [
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — final beat, quiet, devastated and clear-eyed at the same time",
          "text": "I still love her. I want that on the record, whatever happens after this. Knowing what I know now didn't put it out. It just means I'm walking toward her with my eyes open instead of closed. I'm not sure that's braver. I think it might just be sadder."
        }
      ],
      "choices": [
        {
          "id": "nwd_c_go",
          "text": "One hour. Rosa first.",
          "targetSceneId": "nwd_rosa",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "excludesFlags": [
              "vera_held"
            ]
          }
        },
        {
          "id": "nwd_c_go_sn",
          "text": "Back south. What he did with it.",
          "targetSceneId": "nwd_sn_p1",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "vera_held"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_c_hs_phone",
          "label": "The phone in his hand",
          "cursor": "look",
          "bounds": {
            "x": 40,
            "y": 56,
            "w": 22,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Lit in his hand — the only light in frame besides the strobes. Four rings. He needed all four."
          }
        }
      ],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_call"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_rosa",
      "title": "Part 2 — What Rosa Knows",
      "partBreak": "Act Three, Part 2 — What Rosa Knows",
      "background": "/img/nw2/bg-rosa-car.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "pan",
        "panDistance": 5,
        "panDirection": "left",
        "zoomDuration": 32,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 20,
            "y": 40,
            "color": "#9fe8ff",
            "intensity": 0.18,
            "size": 30,
            "pulseSeconds": 4.6,
            "pulseAmount": 0.5
          },
          {
            "x": 76,
            "y": 34,
            "color": "#ff2e88",
            "intensity": 0.14,
            "size": 26,
            "pulseSeconds": 5.8,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "City light reflecting off wet asphalt. A car idling at the curb, engine barely audible. Rosa didn't ask where he'd been. She never does when it's bad. She just opens the door.",
      "dialogueBeats": [
        {
          "id": "nwd_rc_r1",
          "characterId": "rosa",
          "expression": "not looking at him, eyes on the street ahead, calm and cold",
          "text": "David Voss is dead, Jack. Or he will be by morning. You know that."
        },
        {
          "id": "nwd_rc_j1",
          "characterId": "jack",
          "expression": "flat, no argument in him left",
          "text": "I know that."
        },
        {
          "id": "nwd_rc_s1",
          "characterId": "narrator",
          "expression": "silence. Just rain on the windshield, wipers moving slow.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_rc_r2",
          "characterId": "rosa",
          "expression": "still looking forward",
          "text": "I can bring people in. Real ones. Badges that mean something."
        },
        {
          "id": "nwd_rc_j2",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Not yet."
        },
        {
          "id": "nwd_rc_r3",
          "characterId": "rosa",
          "expression": "turning to him now, sharp",
          "text": "Not yet. Christ, Jack. You keep saying that like there's a version of “yet” where it gets easier."
        },
        {
          "id": "nwd_rc_j3",
          "characterId": "jack",
          "expression": "low, looking out his own window, avoiding her eyes",
          "text": "Maybe there isn't. Doesn't mean I stop trying to find it."
        },
        {
          "id": "nwd_rc_r4",
          "characterId": "rosa",
          "expression": "quiet, controlled anger",
          "text": "You're protecting her. Still. After all this."
        },
        {
          "id": "nwd_rc_j4",
          "characterId": "jack",
          "expression": "after a long pause",
          "text": "Yeah."
        },
        {
          "id": "nwd_rc_r5",
          "characterId": "rosa",
          "expression": "not cruel, just done pretending",
          "text": "I used to think you were the most honest man I knew, Jack. Turns out you just hadn't met anybody worth lying to yourself about yet."
        },
        {
          "id": "nwd_rc_r6",
          "characterId": "rosa",
          "expression": "quieter",
          "text": "You wouldn't lose a file for them. Eleven months at an empty desk and you wouldn't do it. I watched you do that. Twenty-six years old. Thought it was the most impressive thing a person could be."
        },
        {
          "id": "nwd_rc_j5",
          "characterId": "jack",
          "expression": "low",
          "text": "Rosa."
        },
        {
          "id": "nwd_rc_r7",
          "characterId": "rosa",
          "expression": "flat",
          "text": "I stayed. You didn't. I've made my peace with which of us was right about that. What I can't work out is how a man who wouldn't bend for the whole department bends this fast for one woman in a diner."
        },
        {
          "id": "nwd_rc_r8",
          "characterId": "rosa",
          "expression": "quieter, and this is not something she planned to say",
          "text": "There's a transfer sitting on my captain's desk. County sheriff's, forty minutes from here. Actual budget. Actual backup that shows up. I've been sitting on the paperwork eight months because signing it means admitting I've given up on this place ever being anything else."
        },
        {
          "id": "nwd_rc_j6",
          "characterId": "jack",
          "expression": "low",
          "text": "Rosa. I didn't know that."
        },
        {
          "id": "nwd_rc_r9",
          "characterId": "rosa",
          "expression": "flat",
          "text": "Nobody knows. That's rather the point of not signing it. I sign it, I file it Monday, I'm gone by spring. Simple. Except every time I go to sign it I think about who's left holding the department if I do, and I put the pen down."
        },
        {
          "id": "nwd_rc_r10",
          "characterId": "rosa",
          "expression": "quiet",
          "text": "If I help you and it goes bad, that transfer doesn't happen. Not because they'd fire me. Because nobody signs off on moving a detective who let a murder walk uninvestigated to protect a friend. I want you to know I've done the arithmetic on that too. I'm not walking into this blind either."
        },
        {
          "id": "nwd_rc_vo1",
          "characterId": "jack",
          "expression": "V.O. — quiet, present",
          "text": "She wasn't wrong. I didn't have anything to say back that wouldn't have made it worse."
        },
        {
          "id": "nwd_rc_r11",
          "characterId": "rosa",
          "expression": "softer now, almost gentle, which somehow lands harder",
          "text": "I'm not gonna stop you. I want you to know that. I'm just not gonna help you walk into it blind, either."
        },
        {
          "id": "nwd_rc_j7",
          "characterId": "jack",
          "expression": "low, sincere — stepping back out into the rain",
          "text": "I know what I'm walking into."
        },
        {
          "id": "nwd_rc_r12",
          "characterId": "rosa",
          "expression": "through the open door, steady",
          "text": "No. You know what you're hoping for. That's not the same thing, and you know it."
        },
        {
          "id": "nwd_rc_vo2",
          "characterId": "jack",
          "expression": "V.O. — alone now, quiet",
          "text": "She was right about that too. I've been doing that a lot lately — hoping instead of knowing, and calling it a plan."
        },
        {
          "id": "nwd_rc_vo3",
          "characterId": "jack",
          "expression": "V.O. — final beat, spare",
          "text": "One hour till the address I gave her. I had exactly that long to decide which one I was gonna be when I got there. The man who already knows how this ends. Or the one who still needs to hear her say it."
        }
      ],
      "choices": [
        {
          "id": "nwd_rc_go",
          "text": "The mill lot. Hear her say it.",
          "targetSceneId": "nwd_mill",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_rc_hs_wipers",
          "label": "The windshield",
          "cursor": "look",
          "bounds": {
            "x": 30,
            "y": 10,
            "w": 40,
            "h": 30
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Rain on the glass, wipers moving slow. Two people not looking at each other in a parked car."
          }
        }
      ],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_rosa"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_mill",
      "title": "Part 3 — Two Hundred and Eleven Thousand",
      "partBreak": "Act Three, Part 3 — Two Hundred and Eleven Thousand",
      "background": "/img/nw2/bg-mill-lot.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 5,
        "dollyDuration": 34,
        "dimAmount": 0.32,
        "lights": [
          {
            "x": 64,
            "y": 22,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 4.8,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "An empty lot behind the shuttered mill — chain-link, wet gravel, one working sodium light buzzing. Rain fine and constant. No traffic. Nothing.",
      "dialogueBeats": [
        {
          "id": "nwd_m_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare, quiet",
          "text": "I picked the mill lot because nobody comes here. That's not true. Nobody comes here anymore. There's a difference, and in Blackwood it's most of the town."
        },
        {
          "id": "nwd_m_s1",
          "characterId": "narrator",
          "expression": "a car pulling in slowly, gravel under tires, engine cutting. A door. Heels on wet stone — not the confident sound from the diner. Slower.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_m_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "She didn't bring the coat."
        },
        {
          "id": "nwd_m_v1",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "vera",
          "expression": "quiet, no performance in it",
          "text": "Is he alive?"
        },
        {
          "id": "nwd_m_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "I don't know."
        },
        {
          "id": "nwd_m_v1tw",
          "characterId": "vera",
          "expression": "quiet, no performance in it",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Is it a robbery."
        },
        {
          "id": "nwd_m_v2",
          "characterId": "vera",
          "expression": "a breath",
          "text": "Okay."
        },
        {
          "id": "nwd_m_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "That's it? Okay?"
        },
        {
          "id": "nwd_m_v3",
          "characterId": "vera",
          "expression": "steady",
          "text": "What else is there."
        },
        {
          "id": "nwd_m_j3",
          "characterId": "jack",
          "expression": "not raising his voice",
          "text": "I want to hear you say it. All of it. Out loud, standing there, where I can see your face."
        },
        {
          "id": "nwd_m_v4",
          "characterId": "vera",
          "expression": "after a beat",
          "text": "You already know all of it."
        },
        {
          "id": "nwd_m_j4",
          "characterId": "jack",
          "expression": "plain",
          "text": "Say it anyway."
        },
        {
          "id": "nwd_m_v5",
          "characterId": "vera",
          "expression": "measured, factual — the way people talk about things they've rehearsed alone",
          "text": "Two hundred and eleven thousand dollars. Fourteen months. David moved it, I tracked it. I picked the date, I built the folder, I picked you."
        },
        {
          "id": "nwd_m_j5",
          "characterId": "jack",
          "expression": "plain",
          "text": "Why me."
        },
        {
          "id": "nwd_m_v6",
          "characterId": "vera",
          "expression": "simply",
          "text": "Because you're the only man in Blackwood who doesn't work for Solomon and doesn't want to."
        },
        {
          "id": "nwd_m_j6",
          "characterId": "jack",
          "expression": "quiet",
          "text": "That's not a compliment. That's a spec sheet."
        },
        {
          "id": "nwd_m_v7",
          "characterId": "vera",
          "expression": "not denying it",
          "text": "No. It's not a compliment."
        },
        {
          "id": "nwd_m_j7",
          "characterId": "jack",
          "expression": "lower",
          "text": "Why'd you do it."
        },
        {
          "id": "nwd_m_v8",
          "characterId": "vera",
          "expression": "first crack",
          "text": "Does it matter now?"
        },
        {
          "id": "nwd_m_j8",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "hard",
          "text": "A man got put in a car in front of me nine hours ago. Yeah. It matters now."
        },
        {
          "id": "nwd_m_j8tw",
          "characterId": "jack",
          "expression": "hard",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "A man's been dead nine days and the county's already got a name for it. Yeah. It matters now."
        },
        {
          "id": "nwd_m_v9",
          "characterId": "vera",
          "expression": "flat, and she volunteers it — he hasn't asked",
          "text": "I knew Solomon had the address before you did."
        },
        {
          "id": "nwd_m_s2",
          "characterId": "narrator",
          "expression": "Jack going very still",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_m_j9",
          "characterId": "jack",
          "expression": "dangerous, quiet",
          "text": "Say that again."
        },
        {
          "id": "nwd_m_v10",
          "characterId": "vera",
          "expression": "even — a beat after 'got there'",
          "text": "Doc Sato sold it to them Tuesday. Six hundred dollars. I found out about eleven hours before you got there. I could have called David. I have the number. I didn't."
        },
        {
          "id": "nwd_m_j10",
          "characterId": "jack",
          "expression": "barely controlled",
          "text": "Why."
        },
        {
          "id": "nwd_m_v11",
          "characterId": "vera",
          "expression": "not defending it, just answering — a beat after 'willing to lose'",
          "text": "Because if I called him he'd have run, and if he ran with the money I'd have had nothing, and I hadn't finished deciding what I was willing to lose. I spent eleven hours deciding. That's how long he had, and I spent all of it thinking about myself."
        },
        {
          "id": "nwd_m_v12",
          "characterId": "vera",
          "expression": "quiet",
          "text": "You wanted it out loud. That's the part I'd have left out."
        },
        {
          "id": "nwd_m_v13",
          "characterId": "vera",
          "expression": "smaller, and she doesn't perform any of it",
          "text": "My father borrowed four thousand dollars from Solomon Reyes. 2011. A furnace."
        },
        {
          "id": "nwd_m_j11",
          "characterId": "jack",
          "expression": "quiet",
          "text": "How much did he end up owing."
        },
        {
          "id": "nwd_m_v14",
          "characterId": "vera",
          "expression": "flat — a beat after 'it grew'",
          "text": "Eleven. Nine years and it grew. You don't pay it off here. You pay on it. Forever. Then you hand it to whoever's left."
        },
        {
          "id": "nwd_m_j12",
          "characterId": "jack",
          "expression": "low",
          "text": "And that was you."
        },
        {
          "id": "nwd_m_v15",
          "characterId": "vera",
          "expression": "flat",
          "text": "Kessler. That was my name before David. In case you wondered why Solomon's never once called me Mrs. Voss."
        },
        {
          "id": "nwd_m_j13",
          "characterId": "jack",
          "expression": "quiet",
          "text": "And it came to you."
        },
        {
          "id": "nwd_m_v16",
          "characterId": "vera",
          "expression": "flat — a beat after 'ready'",
          "text": "It came to me at the funeral. Solomon shook my hand at my father's funeral and told me he was sorry for my loss and that we'd talk when I was ready. That's the whole town, Jack. That's Blackwood in one handshake."
        },
        {
          "id": "nwd_m_v16b",
          "characterId": "vera",
          "expression": "flat — a beat after 'a fortnight'",
          "text": "He bought that watch for twenty-odd quid, forty years ago. It stopped the winter before he died, and he never did get it fixed — the repair was forty pound, and forty pound was a fortnight."
        },
        {
          "id": "nwd_m_v16c",
          "characterId": "vera",
          "expression": "quieter — a beat after 'worthless'",
          "text": "It's the only thing in that house Solomon never came for. Not because he's decent. Because it's worthless."
        },
        {
          "id": "nwd_m_v17",
          "characterId": "vera",
          "expression": "quieter — a beat after 'I'd ever have'",
          "text": "So no, I didn't do it for a bag of money. I did it because there's no version of staying here where I ever stop owing him. Not for me. Not for anybody I'd ever have. I wanted out. That's all it ever was. I wanted out and I didn't care what it cost, and then it cost something, and now I care. That's not redemption. That's just arithmetic catching up."
        },
        {
          "id": "nwd_m_j14",
          "characterId": "jack",
          "expression": "very quiet",
          "text": "Were you gonna cut him out?"
        },
        {
          "id": "nwd_m_s3",
          "characterId": "narrator",
          "expression": "the longest silence in the scene",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_m_v18",
          "characterId": "vera",
          "expression": "honest, and it's worse than a lie",
          "text": "I hadn't decided."
        },
        {
          "id": "nwd_m_j15",
          "characterId": "jack",
          "expression": "barely audible",
          "text": "Jesus, Vera."
        },
        {
          "id": "nwd_m_v19",
          "characterId": "vera",
          "expression": "not defending it",
          "text": "You asked. I'm not going to start lying to you now. That's the one thing I've got left to give you, and it's not worth much."
        },
        {
          "id": "nwd_m_v20",
          "characterId": "vera",
          "expression": "quiet",
          "text": "Tell me how it happened."
        },
        {
          "id": "nwd_m_j16",
          "characterId": "jack",
          "expression": "flat",
          "text": "No."
        },
        {
          "id": "nwd_m_v21",
          "characterId": "vera",
          "expression": "not pleading, just needing it",
          "text": "Jack—"
        },
        {
          "id": "nwd_m_j17",
          "characterId": "jack",
          "expression": "quiet, and this is mercy, not cruelty",
          "text": "No. You get to not have that one. It's the only thing left I can give you and I'm giving it."
        },
        {
          "id": "nwd_m_v22",
          "characterId": "vera",
          "expression": "after a while, barely",
          "text": "He couldn't sleep in a room with the door shut. Since he was a kid. He used to say—"
        },
        {
          "id": "nwd_m_s4",
          "characterId": "narrator",
          "expression": "she stops. Doesn't finish. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_m_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare, devastated — a beat after 'out of her mouth'",
          "text": "She didn't finish it. Whatever David used to say about doors, she's the only person alive who knew it, and she couldn't get it out of her mouth. That's what it actually is. Not the body. The sentence nobody finishes."
        },
        {
          "id": "nwd_m_v23",
          "characterId": "vera",
          "expression": "quiet, wrecked",
          "text": "You should go home, Jack."
        },
        {
          "id": "nwd_m_j18",
          "characterId": "jack",
          "expression": "flat",
          "text": "Not a chance."
        },
        {
          "id": "nwd_m_v24",
          "characterId": "vera",
          "expression": "not looking at him",
          "text": "I've already cost one man everything he had. I'm standing here doing the math on the second one."
        },
        {
          "id": "nwd_m_j19",
          "characterId": "jack",
          "expression": "quiet, and completely sincere",
          "text": "Then stop doing math."
        },
        {
          "id": "nwd_m_vo4",
          "characterId": "jack",
          "expression": "V.O. — final beat, spare, no self-pity",
          "text": "She looked at me for a long time. And I understood, standing in a wet lot behind a mill that closed when I was thirty-two, that she was going to try to save me. That she'd decided it somewhere in the last four seconds, and she was going to be quiet about it, and she was going to be better at it than I was going to be at stopping her."
        },
        {
          "id": "nwd_m_vo5",
          "characterId": "jack",
          "expression": "V.O. — very quiet — the sodium light buzzing; a beat after 'tipped a motel clerk'",
          "text": "He tipped a motel clerk. Nine days ago. Man on the run with two hundred grand in a bag, and he tipped a motel clerk. I keep coming back to that. I don't know why that's the part I can't put down."
        }
      ],
      "choices": [
        {
          "id": "nwd_m_go",
          "text": "Call the one person left who'd come.",
          "targetSceneId": "nwd_cost",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_m_ask",
          "text": "Why did you talk about him in past tense.",
          "targetSceneId": "nwd_mill_ask",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "nwd_d1a"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_m_hs_fence",
          "label": "The chain-link",
          "cursor": "look",
          "bounds": {
            "x": 4,
            "y": 30,
            "w": 24,
            "h": 44
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "The same fence from the cold open, wet and out of focus. A single working light behind it."
          }
        },
        {
          "id": "nwd_m_hs_light",
          "label": "The sodium light",
          "cursor": "look",
          "bounds": {
            "x": 58,
            "y": 8,
            "w": 22,
            "h": 28
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "One working sodium light, buzzing. It's doing all the work. It's the only witness either of them has."
          }
        },
        {
          "id": "nwd_m_hs_machinery",
          "label": "The dead machinery",
          "cursor": "look",
          "bounds": {
            "x": 30,
            "y": 12,
            "w": 26,
            "h": 34
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "The mill's guts, rusted shut. Four thousand people fed by this, and the place keeps its own silence now."
          }
        },
        {
          "id": "nwd_m_hs_car",
          "label": "Her car",
          "cursor": "look",
          "bounds": {
            "x": 66,
            "y": 52,
            "w": 28,
            "h": 30
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Parked at the edge of the lot. The boot's shut. In the slant of the sodium light the back seat is empty — no bag, no case. Whatever she's carrying, she's carrying it in herself."
          }
        },
        {
          "id": "nwd_m_hs_backseat",
          "label": "The back seat",
          "cursor": "use",
          "bounds": {
            "x": 72,
            "y": 56,
            "w": 14,
            "h": 16
          },
          "isRepeatable": false,
          "examine": true,
          "examineSeconds": 2.5,
          "action": {
            "type": "setFlag",
            "flagSet": "bag_examined"
          }
        }
      ],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_mill",
              "vera_confessed",
              "eleven_hours_known",
              "friday_deadline_known"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_cost",
      "title": "Part 4 — The Cost",
      "partBreak": "Act Three, Part 4 — The Cost",
      "background": "/img/nw2/bg-rosa-car.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "pan",
        "panDistance": 4,
        "zoomDuration": 36,
        "dimAmount": 0.32,
        "lights": [
          {
            "x": 50,
            "y": 40,
            "color": "#9fe8ff",
            "intensity": 0.2,
            "size": 34,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The mill lot. Rain. Jack alone, standing where he was, for a long moment — then a phone. Two rings. Then, some time later, headlights sweeping the gravel.",
      "dialogueBeats": [
        {
          "id": "nwd_ct_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare, flat",
          "text": "I didn't have a car. Walked here, same as I told you — an hour to think, no vehicle to think in. So I stood in an empty lot behind a dead mill and called the one person left who'd still come get me."
        },
        {
          "id": "nwd_ct_absent",
          "characterId": "jack",
          "expression": "V.O. — flat, covering the silence where a car should be",
          "conditionRule": {
            "requiresFlags": [
              "rosa_absent"
            ]
          },
          "text": "Rosa didn't come. The deadline reached me the way everything in this town reaches: secondhand, and late. Friday. Solomon's name on the debt. Two days."
        },
        {
          "id": "nwd_ct_vo2",
          "characterId": "narrator",
          "expression": "a car door opening, closing softly. Rain muffled once inside.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_ct_r1",
          "characterId": "rosa",
          "expression": "getting in beside him rather than the other way round — she's come to sit with him, not drive off yet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "You told her."
        },
        {
          "id": "nwd_ct_j1",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Yeah."
        },
        {
          "id": "nwd_ct_r2",
          "characterId": "rosa",
          "expression": "quiet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Good. She deserved to hear it from someone who was actually there."
        },
        {
          "id": "nwd_ct_vo3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — very quiet. Rain on the windshield. A long silence. The engine still off.",
          "text": "Twenty minutes before, he was telling me about a building on Ash Street with the ovens still in it."
        },
        {
          "id": "nwd_ct_vo3tw",
          "characterId": "jack",
          "expression": "V.O. — very quiet. Rain on the windshield. A long silence. The engine still off.",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "The list was inside a cupboard. Six tables. Bread in the morning. The building on Ash Street with the ovens still in it, in a dead man's pencil. He never did get to be bad at anything once."
        },
        {
          "id": "nwd_ct_vo4",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — barely audible — a beat after 'my words'",
          "text": "I said \"don't thank me yet.\" Those were my words. I've got the rest of my life to find better ones and it won't matter, because he's not in the room for them."
        },
        {
          "id": "nwd_ct_vo4tw",
          "characterId": "jack",
          "expression": "V.O. — barely audible",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "I never got a word in. Not one. And it turned out the silence was the sentence I spent the rest of the day saying."
        },
        {
          "id": "nwd_ct_s1",
          "characterId": "narrator",
          "expression": "transition — a car door, engine starting, wipers. Rosa driving. Neither speaks for a while.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_ct_r3",
          "characterId": "rosa",
          "expression": "eyes forward, flat",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Solomon's put the debt on her. It's formal now. He told two people, which in Blackwood is the same as publishing it."
        },
        {
          "id": "nwd_ct_j2",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "How much."
        },
        {
          "id": "nwd_ct_r4",
          "characterId": "rosa",
          "expression": "still not looking at him",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "All of it. Two-eleven, plus what her father still owed. He's calling it one number now."
        },
        {
          "id": "nwd_ct_j3",
          "characterId": "jack",
          "expression": "quiet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "That's not a debt. That's a sentence."
        },
        {
          "id": "nwd_ct_r5",
          "characterId": "rosa",
          "expression": "flat — a beat after 'knows that'",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Yeah. He knows that. He gave her till Friday."
        },
        {
          "id": "nwd_ct_r7tw",
          "characterId": "rosa",
          "expression": "and she says it plainly, because dressing it up would be worse",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ],
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "The same thing that happened in that house. He's not going to make a speech about it, Jack. It'll just be Friday, and then it'll be Saturday, and she won't be anywhere."
        },
        {
          "id": "nwd_ct_j4",
          "characterId": "jack",
          "expression": "very quiet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "It's Wednesday."
        },
        {
          "id": "nwd_ct_r6",
          "characterId": "rosa",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "It's Wednesday."
        },
        {
          "id": "nwd_ct_j5",
          "characterId": "jack",
          "expression": "plain",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "What happens Friday."
        },
        {
          "id": "nwd_ct_r7",
          "characterId": "rosa",
          "expression": "and she says it plainly, because dressing it up would be worse",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent",
              "david_already_dead"
            ]
          },
          "text": "The same thing that happened in that yard. He's not going to make a speech about it, Jack. It'll just be Friday, and then it'll be Saturday, and she won't be anywhere."
        },
        {
          "id": "nwd_ct_r8",
          "characterId": "rosa",
          "expression": "carefully",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "She came to see me. Two hours ago."
        },
        {
          "id": "nwd_ct_j6",
          "characterId": "jack",
          "expression": "sharp — first real reaction in the scene",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "She what?"
        },
        {
          "id": "nwd_ct_r9",
          "characterId": "rosa",
          "expression": "even — a beat after 'the police'",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Walked into the station and asked me what happens to a person who confesses to a theft the victim can't report to the police. She wasn't asking about jail, Jack. She was asking how to make it land on her and nobody else."
        },
        {
          "id": "nwd_ct_j7",
          "characterId": "jack",
          "expression": "low",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "She's putting her name on all of it."
        },
        {
          "id": "nwd_ct_r10",
          "characterId": "rosa",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "She's doing it quiet. She didn't ask me to tell you."
        },
        {
          "id": "nwd_ct_j8",
          "characterId": "jack",
          "expression": "plain",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Then why are you."
        },
        {
          "id": "nwd_ct_r11",
          "characterId": "rosa",
          "expression": "quiet, and it costs her — Rosa's hands on the wheel, a long pause; a beat after 'found out after'",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent",
              "david_already_dead"
            ]
          },
          "text": "Because I've spent three days trying to keep you out of this, and I've lost. So now I'd rather you go in knowing what she's doing than find out after. That's not me helping. That's me giving up. I want you to understand the difference."
        },
        {
          "id": "nwd_ct_r11tw",
          "characterId": "rosa",
          "expression": "quiet, and it costs her — Rosa's hands on the wheel, a long pause; a beat after 'find out after'",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ],
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Because I've spent three days trying to keep this off the record, and it's already inside you. So now I'd rather you go in knowing what she's doing than find out after. That's not me helping. That's me giving up. I want you to understand the difference."
        },
        {
          "id": "nwd_ct_r12",
          "characterId": "rosa",
          "expression": "flat — a beat after 'Before you called'",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "I pulled the transfer paperwork off my captain's desk this morning. Before you called. Not because of you. Because I already knew what I was going to do this week, and there's no version of it that looks good on a form asking whether I've got any active conflicts of interest."
        },
        {
          "id": "nwd_ct_j9",
          "characterId": "jack",
          "expression": "low",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Rosa, don't do that because of me."
        },
        {
          "id": "nwd_ct_r13",
          "characterId": "rosa",
          "expression": "flat, not unkind",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "I'm not. I'm doing it because of David Voss, same as you. You just get to feel like you're doing it for love. I don't get that part. I just get the paperwork."
        },
        {
          "id": "nwd_ct_j10",
          "characterId": "jack",
          "expression": "quiet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "I know what that transfer was."
        },
        {
          "id": "nwd_ct_r14",
          "characterId": "rosa",
          "expression": "flat — a beat after 'I'm telling you'",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Then you know what I'm telling you. Eight months I couldn't sign it because I didn't want to admit I'd given up on this place. Turns out I didn't give up on the place. I gave up on the form. Same drawer, either way."
        },
        {
          "id": "nwd_ct_j11",
          "characterId": "jack",
          "expression": "quiet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Rosa—"
        },
        {
          "id": "nwd_ct_r15",
          "characterId": "rosa",
          "expression": "cutting him off, not unkind",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Don't. If you say something decent right now I'm going to have to arrest one of you, and I've already decided I'm not going to, and I'd like to keep not deciding that for a few more hours."
        },
        {
          "id": "nwd_ct_s2",
          "characterId": "narrator",
          "expression": "the car pulling to a stop. Rain.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_ct_vo5",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "That's what it cost her. Not her badge. Her opinion of herself. She handed it over in a parked car in the rain and didn't make me watch her do it."
        },
        {
          "id": "nwd_ct_s3",
          "characterId": "narrator",
          "expression": "a door opening. Jack getting out. The car idling behind him.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_ct_r16",
          "characterId": "rosa",
          "expression": "through the open door, last thing",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Jack. Whatever you're about to go do."
        },
        {
          "id": "nwd_ct_j12",
          "characterId": "jack",
          "expression": "quiet",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Yeah."
        },
        {
          "id": "nwd_ct_r17",
          "characterId": "rosa",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": "Don't tell me about it."
        },
        {
          "id": "nwd_ct_s4",
          "characterId": "narrator",
          "expression": "the door closing. The car pulling away. Rain on an empty street.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "text": ""
        }
      ],
      "choices": [
        {
          "id": "nwd_ct_go",
          "text": "The Blue Cue. Wednesday night.",
          "targetSceneId": "nwd_bluecue",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_ct_skip",
          "text": "Straight to the feed store.",
          "targetSceneId": "nwd_trade",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "skipped_bluecue"
            ]
          }
        },
        {
          "id": "nwd_ct_ask",
          "text": "What are you giving up.",
          "targetSceneId": "nwd_cost_ask",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "saw_rosas_cost"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_ct_hs_windscreen",
          "label": "The windscreen",
          "cursor": "look",
          "bounds": {
            "x": 6,
            "y": 14,
            "w": 40,
            "h": 30
          },
          "isRepeatable": true,
          "gating": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "action": {
            "type": "showText",
            "text": "Rain on the windscreen, the wipers off. Two days of weather between this car and Friday."
          }
        },
        {
          "id": "nwd_ct_hs_radio",
          "label": "The radio",
          "cursor": "look",
          "bounds": {
            "x": 34,
            "y": 30,
            "w": 22,
            "h": 16
          },
          "isRepeatable": true,
          "gating": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "action": {
            "type": "showText",
            "text": "Off. She hasn't turned it on. Some silences are a choice."
          }
        },
        {
          "id": "nwd_ct_hs_coffee",
          "label": "Her coffee",
          "cursor": "look",
          "bounds": {
            "x": 60,
            "y": 44,
            "w": 14,
            "h": 18
          },
          "isRepeatable": true,
          "gating": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "action": {
            "type": "showText",
            "text": "A paper cup, untouched. She drinks it black. She hasn't touched it since the mill."
          }
        },
        {
          "id": "nwd_ct_hs_seat",
          "label": "The passenger seat",
          "cursor": "look",
          "bounds": {
            "x": 62,
            "y": 34,
            "w": 30,
            "h": 34
          },
          "isRepeatable": true,
          "gating": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "action": {
            "type": "showText",
            "text": "A form on the seat, half a page of type, the signature block empty. A transfer request. County sheriff's, forty minutes from here. She's been carrying it in a car she hasn't driven yet."
          }
        },
        {
          "id": "nwd_ct_hs_form",
          "label": "The transfer form",
          "cursor": "use",
          "bounds": {
            "x": 66,
            "y": 38,
            "w": 16,
            "h": 16
          },
          "isRepeatable": false,
          "examine": true,
          "examineSeconds": 2.5,
          "gating": {
            "excludesFlags": [
              "rosa_absent"
            ]
          },
          "action": {
            "type": "setFlag",
            "flagSet": "saw_rosas_cost"
          }
        },
        {
          "id": "nwd_ct_hs_road",
          "label": "The road outside",
          "cursor": "look",
          "bounds": {
            "x": 2,
            "y": 10,
            "w": 20,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "A red-brick shell going down the road past the mill. Ovens still in it, rusted in their bays. Nobody's bought it. Ash Street."
          }
        },
        {
          "id": "nwd_ct_hs_ash",
          "label": "Ash Street",
          "cursor": "use",
          "bounds": {
            "x": 4,
            "y": 14,
            "w": 12,
            "h": 20
          },
          "isRepeatable": false,
          "examine": true,
          "examineSeconds": 2.5,
          "action": {
            "type": "setFlag",
            "flagSet": "saw_ash_street"
          }
        }
      ],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_cost",
              "friday_deadline",
              "vera_went_to_rosa"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_bluecue",
      "title": "Part 4b — The Blue Cue, Again",
      "partBreak": "Act Three, Part 4b — The Blue Cue, Again",
      "background": "/img/nw2/bg-poolhall.jpg",
      "ambientAudio": "jazz",
      "particles": "smoke",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 6,
        "dollyDuration": 26,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 50,
            "y": 18,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 30,
            "pulseSeconds": 6.5,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "The same pool hall. Same warped jukebox. Same balls clacking. Almost identical to Act One — deliberately. Wednesday night. Two days left on her.",
      "dialogueBeats": [
        {
          "id": "nwd_b_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare, flat — a beat after 'Two days left on her'",
          "text": "I knew before I opened the door — Blackwood's four thousand people and Solomon keeps two men for the far end of things. There was never going to be anybody else."
        },
        {
          "id": "nwd_b_desh1",
          "characterId": "desh",
          "expression": "mid-conversation, exactly as before",
          "text": "— all I'm saying is if the machine can tell it's the wrong item, the machine already knows what the right item is. So why's it asking me?"
        },
        {
          "id": "nwd_b_moe1",
          "characterId": "moe",
          "expression": "flat",
          "text": "It's not asking you."
        },
        {
          "id": "nwd_b_desh2",
          "characterId": "desh",
          "expression": "genuinely puzzled",
          "text": "It says \"please.\""
        },
        {
          "id": "nwd_b_moe2",
          "characterId": "moe",
          "expression": "flat",
          "text": "That's not asking. That's a recording of somebody who asked once, in nineteen ninety-whatever, and now it just plays."
        },
        {
          "id": "nwd_b_vo2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Nine days ago I stood in this room and thought that was funny. I want you to understand I laughed. I remember laughing."
        },
        {
          "id": "nwd_b_vo2tw",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Nine days ago I said no in a diner, and I did it clean, and I've had three weeks to enjoy it. I want you to understand how clean it sounded. I remember exactly how clean it sounded."
        },
        {
          "id": "nwd_b_moe3",
          "characterId": "moe",
          "expression": "still not turning",
          "text": "Mr. Morrow."
        },
        {
          "id": "nwd_b_j1",
          "characterId": "jack",
          "expression": "low, and it costs him not to shout it",
          "text": "Was it you. Just — tell me straight, don't make me stand here and guess like a fucking idiot."
        },
        {
          "id": "nwd_b_j2tw",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "The house. Four hours north."
        },
        {
          "id": "nwd_b_moe4",
          "characterId": "moe",
          "expression": "calm, no evasion at all",
          "text": "Yeah."
        },
        {
          "id": "nwd_b_j2",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "jack",
          "expression": "flat",
          "text": "The yard."
        },
        {
          "id": "nwd_b_moe5",
          "characterId": "moe",
          "expression": "a beat — the first thing that lands on him",
          "text": "I know. I was closer than I wanted to be."
        },
        {
          "id": "nwd_b_desh3",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "characterId": "desh",
          "expression": "quiet, not defensive, genuinely explaining",
          "text": "He didn't know it was coming. If that's — I know that's not nothing to some people. He was still running. He never turned round."
        },
        {
          "id": "nwd_b_desh3tw",
          "characterId": "desh",
          "expression": "quiet, not defensive, genuinely explaining",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "He didn't know it was coming. If that's — I know that's not nothing to some people. He was home. The door was shut. He never did hear it."
        }
      ],
      "choices": [
        {
          "id": "nwd_b_go",
          "text": "Turn. Walk out.",
          "targetSceneId": "nwd_bluecue_walk",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_b_fight",
          "text": "Do something about it.",
          "targetSceneId": "nwd_trade",
          "attitudeTag": "Neutral",
          "consequences": {
            "setFlags": [
              "violence"
            ],
            "meterChanges": [
              {
                "meter": "Suspicion",
                "delta": 4
              }
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_b_hs_jukebox",
          "label": "The jukebox",
          "cursor": "use",
          "bounds": {
            "x": 4,
            "y": 30,
            "w": 18,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Something old and warped. It plays a recording, Desh. That's all it is."
          }
        },
        {
          "id": "nwd_b_hs_sign",
          "label": "The dead neon beer sign",
          "cursor": "look",
          "bounds": {
            "x": 62,
            "y": 10,
            "w": 30,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Moe and Desh at the bar, backs to the door, silhouetted against a dead neon beer sign. Smoke hanging still in the light."
          }
        },
        {
          "id": "nwd_b_hs_jacket",
          "label": "Moe's jacket",
          "cursor": "use",
          "bounds": {
            "x": 40,
            "y": 40,
            "w": 16,
            "h": 30
          },
          "isRepeatable": false,
          "examine": true,
          "examineSeconds": 2.5,
          "action": {
            "type": "setFlag",
            "flagSet": "knows_theyre_armed"
          }
        }
      ],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_bluecue",
              "knows_david_protected_her"
            ]
          }
        },
        {
          "conditionRule": {
            "requiresFlags": [
              "act3v_millask"
            ]
          },
          "consequences": {
            "setFlags": [
              "timer_expired"
            ]
          }
        },
        {
          "conditionRule": {
            "requiresFlags": [
              "act3v_costask"
            ]
          },
          "consequences": {
            "setFlags": [
              "timer_expired"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_bluecue_walk",
      "title": "Part 4b — The Blue Cue, Again",
      "background": "/img/nw2/bg-poolhall.jpg",
      "ambientAudio": "jazz",
      "particles": "smoke",
      "transition": "cut",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 6,
        "dollyDuration": 26,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 50,
            "y": 18,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 6.5,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "Jack hasn't reached the door. The room talks him through it one last time — then lets him go.",
      "dialogueBeats": [
        {
          "id": "nwd_b_j3",
          "characterId": "jack",
          "expression": "very quiet",
          "text": "Why are you telling me that."
        },
        {
          "id": "nwd_b_desh4",
          "characterId": "desh",
          "expression": "simply",
          "text": "'Cause you're gonna build a worse one in your head every night for the rest of your life, and I'd rather you had the true one to put against it."
        },
        {
          "id": "nwd_b_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare, devastated",
          "text": "That's the part nobody warns you about. I came in here ready for them to be monsters. They weren't. They were two men at a bar who did a job, remembered a detail, and thought I might want it."
        },
        {
          "id": "nwd_b_moe6",
          "characterId": "moe",
          "expression": "flat, not unkind",
          "text": "You want to do something about it, now's the time. Nobody in here'd stop you and I wouldn't blame you."
        },
        {
          "id": "nwd_b_j4",
          "characterId": "jack",
          "expression": "after a beat",
          "text": "Would you fight back?"
        },
        {
          "id": "nwd_b_moe7",
          "characterId": "moe",
          "expression": "honest",
          "text": "Yeah. But I'd feel bad about it."
        },
        {
          "id": "nwd_b_vo4",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "And there it was. The whole town in one sentence. Everybody's willing, nobody's cruel, and the arithmetic gets done anyway."
        },
        {
          "id": "nwd_b_desh5",
          "characterId": "desh",
          "expression": "calling after him, and he means it — a beat after 'wouldn't say'",
          "text": "Hey — Morrow. For what it's worth. He didn't give her up. They asked him where she was and he wouldn't say. Six hundred bucks got us the house. Nothing got us her."
        },
        {
          "id": "nwd_b_vo5",
          "characterId": "jack",
          "expression": "V.O. — spare, breaking — a beat after 'wouldn't say her name'",
          "text": "Two hundred and eleven thousand dollars in a bag and eleven hours where she could have called him, and at the end of it he still wouldn't say her name. I've thought about which one of us that makes the fool. I keep getting the same answer and I keep not liking it."
        },
        {
          "id": "nwd_b_moe8",
          "characterId": "moe",
          "expression": "last line, to Desh, casual, back to it",
          "text": "It plays a recording, Desh. That's all it is. It's a recording."
        }
      ],
      "choices": [
        {
          "id": "nwd_b_walk_go",
          "text": "Out into the rain. The feed store.",
          "targetSceneId": "nwd_trade",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_trade",
      "title": "Part 5 — The Trade",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 4,
        "dollyDuration": 30,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 68,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.26,
            "size": 32,
            "pulseSeconds": 7,
            "pulseAmount": 0.3
          },
          {
            "x": 18,
            "y": 44,
            "color": "#2ad9d9",
            "intensity": 0.12,
            "size": 38,
            "pulseSeconds": 8,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "An office above the shuttered feed store — the least impressive room in Blackwood, which is the point. A space heater ticking. Rain on a single window. Friday. Ten past nine in the morning.",
      "dialogueBeats": [
        {
          "id": "nwd_tr_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'in the morning'",
          "text": "Solomon Reyes doesn't have a compound. He's got a room over the feed store with a space heater and a filing cabinet. I used to think that was humility. It isn't. It's confidence. You don't need a fortress in a town that can't leave."
        },
        {
          "id": "nwd_tr_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat. A chair. Two men sitting. And — audible for the first time — the shift of two more bodies against a wall behind Jack.",
          "text": "Moe and Desh were by the door. Not sitting. That's the difference between a conversation and a room somebody's controlling the exits on."
        },
        {
          "id": "nwd_tr_sol1",
          "characterId": "solomon",
          "expression": "unhurried, genuinely pleasant",
          "text": "Mr. Morrow. I heard you were standing there. I'm sorry about that — the standing there part. I want you to know it wasn't an instruction."
        },
        {
          "id": "nwd_tr_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "Wasn't it."
        },
        {
          "id": "nwd_tr_sol2",
          "characterId": "solomon",
          "expression": "mild",
          "text": "It was a permission. There's a difference. It matters to me even if it doesn't matter to you."
        },
        {
          "id": "nwd_tr_s1",
          "characterId": "narrator",
          "expression": "the space heater ticking",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_tr_j2",
          "characterId": "jack",
          "expression": "plain",
          "text": "I'm here about the Voss debt."
        },
        {
          "id": "nwd_tr_sol3",
          "characterId": "solomon",
          "expression": "settling in",
          "text": "Of course you are. It's Friday."
        },
        {
          "id": "nwd_tr_j3",
          "characterId": "jack",
          "expression": "flat",
          "text": "It's Friday. Say what you're going to say, Solomon, I don't have the patience today."
        },
        {
          "id": "nwd_tr_sol4",
          "characterId": "solomon",
          "expression": "mild, not gloating — a beat after 'a decision'",
          "text": "I did wonder whether you'd come today or Thursday. Thursday would have been panic. Today's a decision. I prefer decisions."
        },
        {
          "id": "nwd_tr_j5a",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "text": "The forty-eight hours. You never said they stopped."
        },
        {
          "id": "nwd_tr_sol5a",
          "characterId": "solomon",
          "expression": "mild, not looking up — housekeeping",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "text": "I stopped counting it the moment there was a body — a clock's a way of making somebody hurry, and you'd stopped needing one. I didn't mention it because you'd have taken it as mercy, and it wasn't. It was housekeeping."
        },
        {
          "id": "nwd_tr_j4",
          "characterId": "jack",
          "expression": "direct",
          "text": "Put it on me."
        },
        {
          "id": "nwd_tr_s2",
          "characterId": "narrator",
          "expression": "a long pause. The heater. Rain. Behind Jack — Moe shifting his weight. A jacket settling over something with weight in the pocket.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "knows_theyre_armed"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_tr_s2d",
          "characterId": "narrator",
          "expression": "a long pause. The heater. Rain. Behind Jack — Moe shifting his weight. The jacket settling over the weight in the pocket. I know what that is now. I've known it since the blue light on the back seat of his car.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "knows_theyre_armed"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_tr_sol5",
          "characterId": "solomon",
          "expression": "genuinely interested for the first time",
          "text": "Say more."
        },
        {
          "id": "nwd_tr_j5",
          "characterId": "jack",
          "expression": "the terms",
          "text": "Two-eleven, plus the father's eleven. All of it, my name. She's clear — not quiet, not pending, clear — and you say it in front of the two people you already told."
        },
        {
          "id": "nwd_tr_sol6",
          "characterId": "solomon",
          "expression": "almost amused",
          "text": "And what do you imagine you have that's worth two hundred and twenty-two thousand dollars?"
        },
        {
          "id": "nwd_tr_j6",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "text": "Nothing. That's not what I'm paying with."
        },
        {
          "id": "nwd_tr_j7",
          "characterId": "jack",
          "expression": "the asset",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "text": "Only investigator in this county who doesn't work for you."
        },
        {
          "id": "nwd_tr_op1",
          "characterId": "jack",
          "expression": "flat — a beat after the question",
          "conditionRule": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "Nothing. I'm on your paper, Solomon. You wrote it yourself."
        },
        {
          "id": "nwd_tr_op2",
          "characterId": "solomon",
          "expression": "mild, not correcting him",
          "conditionRule": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "Of course you're on my paper. That's not a trade. That's a receipt."
        },
        {
          "id": "nwd_tr_s3",
          "characterId": "narrator",
          "expression": "Solomon says nothing. The heater ticking. Behind Jack, Desh takes one step off the wall — reflex, not instruction, the way a dog stands when a voice changes register.",
          "silent": true,
          "text": ""
        }
      ],
      "choices": [
        {
          "id": "nwd_tr_qte",
          "text": "Move.",
          "targetSceneId": "nwd_trade_violence",
          "attitudeTag": "Aggressive",
          "quickTime": true,
          "timeLimitSeconds": 8,
          "qtePrompt": "HOLD STILL.",
          "qteHeartbeat": true,
          "qteShakyCam": true,
          "timedOutTargetSceneId": "nwd_trade_5b"
        }
      ],
      "hotspots": [
        {
          "id": "nwd_tr_hs_heater",
          "label": "The space heater",
          "cursor": "look",
          "bounds": {
            "x": 8,
            "y": 52,
            "w": 22,
            "h": 30
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Ticking. It's the loudest thing in the room whenever anybody stops talking, and it does a lot of talking."
          }
        },
        {
          "id": "nwd_tr_hs_desk",
          "label": "The desk",
          "cursor": "look",
          "bounds": {
            "x": 40,
            "y": 44,
            "w": 30,
            "h": 30
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Sixteen years of files set down on it — a soft, final weight. A coffee ring older than the trade."
          }
        },
        {
          "id": "nwd_tr_hs_cabinet",
          "label": "The filing cabinet",
          "cursor": "look",
          "bounds": {
            "x": 74,
            "y": 34,
            "w": 22,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "A filing system that eats people slowly and lets him feel administrative about it."
          }
        },
        {
          "id": "nwd_tr_hs_window",
          "label": "The single window",
          "cursor": "look",
          "bounds": {
            "x": 30,
            "y": 8,
            "w": 22,
            "h": 26
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "One window. You can see the street below, and nothing on the street that wants to be seen."
          }
        },
        {
          "id": "nwd_tr_hs_file",
          "label": "A file in the top drawer",
          "cursor": "use",
          "bounds": {
            "x": 78,
            "y": 36,
            "w": 14,
            "h": 14
          },
          "isRepeatable": false,
          "examine": true,
          "examineSeconds": 2.5,
          "action": {
            "type": "setFlag",
            "flagSet": "saw_own_file"
          }
        }
      ],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_trade"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_sn_p1",
      "title": "Act Three, Part 1 — What He Did With It",
      "background": "/img/nwd/ep2/car-48.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 8,
        "dollyVertical": 1.5,
        "dollyDuration": 28,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 24,
            "y": 34,
            "color": "#2ad9d9",
            "intensity": 0.22,
            "size": 30,
            "pulseSeconds": 5,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "A car, night, motorway. Rain. The engine steady, no radio. Jack driving back south — the same shot as the drive north, reversed. Dashboard light on his face. Empty road.",
      "dialogueBeats": [
        {
          "id": "nwd_sn1_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I told him. That was the job. Drive four hours and be the worst news a man's ever had."
        },
        {
          "id": "nwd_sn1_s1",
          "characterId": "narrator",
          "expression": "rain on the windscreen. Wipers.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "He was making tea when I said it. He'd got two mugs out because I was there. I said Solomon's got your wife in a room above the feed store, and he put the second mug back in the cupboard."
        },
        {
          "id": "nwd_sn1_s2",
          "characterId": "narrator",
          "expression": "a long hold. Engine.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Then he said: right. I'll bring it back."
        },
        {
          "id": "nwd_sn1_s3",
          "characterId": "narrator",
          "expression": "rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'a reason to'",
          "text": "Not a beat. Not a thought. Two hundred and eleven thousand pounds, fourteen months, everything he'd built — right, I'll bring it back. Like he'd been waiting nine days for a reason to."
        },
        {
          "id": "nwd_sn1_s4",
          "characterId": "narrator",
          "expression": "the wipers. A long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo5",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "And that's when they killed him."
        },
        {
          "id": "nwd_sn1_s5",
          "characterId": "narrator",
          "expression": "nothing. The engine. Rain. Held far too long.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo6",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Because a man who's agreed to give it back isn't a debtor any more. He's just somebody who knows things. Solomon didn't want him found. He wanted him decided. Once he'd decided, he was finished."
        },
        {
          "id": "nwd_sn1_s6",
          "characterId": "narrator",
          "expression": "a car indicating. Slowing.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo7",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I did that. Not Moe, not Desh, not the man over the feed store. I drove four hours and gave a decent man a reason to say the one sentence that got him shot, and then I got back in the car."
        },
        {
          "id": "nwd_sn1_s7",
          "characterId": "narrator",
          "expression": "the engine cutting. Rain on a stationary roof.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_s8",
          "characterId": "narrator",
          "expression": "the car parked on the hard shoulder. Hazards ticking. Facing the other way.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo8",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Nobody's answering her phone because she hasn't got it. Nobody's answering mine because there's nobody left to ring. Rosa'd have taken the call. I gave a client's name to a room full of Solomon's men, and Rosa's the one person who'd have understood exactly what that meant, so no. Not her. Not now."
        },
        {
          "id": "nwd_sn1_s9",
          "characterId": "narrator",
          "expression": "rain. The indicator ticking.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn1_vo9",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Four hours back to a town where the only person who'll talk to me is the man holding her."
        }
      ],
      "choices": [
        {
          "id": "nwd_sn1_go",
          "text": "The feed store. Upstairs.",
          "targetSceneId": "nwd_sn_p2",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "caused_davids_death",
              "lied_about_it"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_sn_p2",
      "title": "Act Three, Part 2 — A Cup of Tea and Extremely Angry",
      "partBreak": "Act Three, Part 2 — A Cup of Tea and Extremely Angry",
      "background": "/img/nwd/ep2/apartment-shoebox.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "48% 44%",
        "zoomDuration": 36,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 62,
            "y": 30,
            "color": "#ffc890",
            "intensity": 0.26,
            "size": 34,
            "pulseSeconds": 6.4,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "The room above the feed store. Not a cell — an armchair, a lamp, a window with the curtain open. A cup and saucer on a side table, gone cold. A radiator ticking. Smaller and warmer than downstairs. Vera in the chair, coat off, entirely composed.",
      "dialogueBeats": [
        {
          "id": "nwd_sn2_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "He let me up. Course he did. He'd been waiting for me to arrive so the room could do the rest."
        },
        {
          "id": "nwd_sn2_s1",
          "characterId": "narrator",
          "expression": "a door closing. Not locked. That's worse.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_v1",
          "characterId": "vera",
          "expression": "not looking up",
          "text": "Nineteen hours."
        },
        {
          "id": "nwd_sn2_j1",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I know."
        },
        {
          "id": "nwd_sn2_v2",
          "characterId": "vera",
          "expression": "flat — a beat after 'the chair'",
          "text": "I've had a cup of tea and a magazine from 2019 and a man apologise to me twice for the state of the chair. Nobody's touched me. Nobody's raised their voice."
        },
        {
          "id": "nwd_sn2_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "That's how he does it."
        },
        {
          "id": "nwd_sn2_v3",
          "characterId": "vera",
          "expression": "finally looking at him — a beat after 'room like this'",
          "text": "I know how he does it, Jack. My father sat in a room like this. What I don't know is how you managed it in one evening."
        },
        {
          "id": "nwd_sn2_s2",
          "characterId": "narrator",
          "expression": "the radiator. Rain on the window.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_j3",
          "characterId": "jack",
          "expression": "flat, no defence at all",
          "text": "I said your name in a bar. To watch a man's face."
        },
        {
          "id": "nwd_sn2_v4",
          "characterId": "vera",
          "expression": "after a long moment",
          "text": "And did it?"
        },
        {
          "id": "nwd_sn2_j4",
          "characterId": "jack",
          "expression": "flat",
          "text": "No."
        },
        {
          "id": "nwd_sn2_v5",
          "characterId": "vera",
          "expression": "quiet",
          "text": "No. It wouldn't."
        },
        {
          "id": "nwd_sn2_s3",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_vo2",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'a bill'",
          "text": "Here's what I'd expected. Shouting. Something thrown. The thing you'd want, because it'd be over quicker. What I got was a woman working out what to do with the information, the same as she'd have done with a bill."
        },
        {
          "id": "nwd_sn2_v6",
          "characterId": "vera",
          "expression": "eventually, businesslike",
          "text": "Right. What do you actually know."
        },
        {
          "id": "nwd_sn2_j5",
          "characterId": "jack",
          "expression": "flat",
          "text": "All of it. He told me everything before —"
        },
        {
          "id": "nwd_sn2_s4",
          "characterId": "narrator",
          "expression": "he stops. Rain. The radiator.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_v7",
          "characterId": "vera",
          "expression": "very still",
          "text": "Before."
        },
        {
          "id": "nwd_sn2_s5",
          "characterId": "narrator",
          "expression": "rain. The radiator. A long hold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_j6",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Yeah."
        },
        {
          "id": "nwd_sn2_s6",
          "characterId": "narrator",
          "expression": "nothing from her. No sound at all. That's the reaction.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_v8",
          "characterId": "vera",
          "expression": "after a while, and her voice hasn't changed, which is the worst part",
          "text": "Was it quick."
        },
        {
          "id": "nwd_sn2_j7",
          "characterId": "jack",
          "expression": "flat",
          "text": "Yes."
        },
        {
          "id": "nwd_sn2_v9",
          "characterId": "vera",
          "expression": "flat",
          "text": "Did he know?"
        },
        {
          "id": "nwd_sn2_j8",
          "characterId": "jack",
          "expression": "and this is the lie he tells, and the film should let him",
          "text": "No."
        },
        {
          "id": "nwd_sn2_s7",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'a mug in his hand'",
          "text": "He knew. He'd just said the sentence that did it and he was stood there with a mug in his hand. I've told two lies in this business in sixteen years and that's one of them, and I'd tell it again tomorrow."
        },
        {
          "id": "nwd_sn2_s8",
          "characterId": "narrator",
          "expression": "rain. The radiator.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_v10",
          "characterId": "vera",
          "expression": "flat, and now the confession comes — not extracted, offered",
          "text": "Fourteen months. Two hundred and eleven thousand. I picked the date, I built the folder, I picked you. My father borrowed four thousand pounds for a furnace in 2011 and it was eleven when he died and Solomon shook my hand at the funeral."
        },
        {
          "id": "nwd_sn2_j9",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Vera—"
        },
        {
          "id": "nwd_sn2_v11",
          "characterId": "vera",
          "expression": "cutting through, needing to finish it — a beat after 'arithmetic'",
          "text": "And there were eleven hours where I knew they had the address and I didn't ring him. I sat in my kitchen doing arithmetic."
        },
        {
          "id": "nwd_sn2_s9",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_v12",
          "characterId": "vera",
          "expression": "very quiet",
          "text": "So don't stand there looking like the guilty one. There's a queue."
        },
        {
          "id": "nwd_sn2_vo4",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "That's the confession. Not in a wet lot behind a mill with the rain coming down — in an armchair, in a warm room, with a cold cup of tea, because she'd had nineteen hours to get it into order and nothing else to do."
        },
        {
          "id": "nwd_sn2_s10",
          "characterId": "narrator",
          "expression": "the radiator. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn2_v13",
          "characterId": "vera",
          "expression": "after a while",
          "text": "What does he want."
        },
        {
          "id": "nwd_sn2_j10",
          "characterId": "jack",
          "expression": "flat",
          "text": "He hasn't said. He's waiting for me to offer."
        },
        {
          "id": "nwd_sn2_v14",
          "characterId": "vera",
          "expression": "a small, exhausted noise",
          "text": "Course he is."
        }
      ],
      "choices": [
        {
          "id": "nwd_sn2_go",
          "text": "Downstairs. The office. The man who owns both of them.",
          "targetSceneId": "nwd_sn_p3",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "vera_confessed",
              "eleven_hours_known"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_sn_p3",
      "title": "Act Three, Part 3 — Nothing In My Pockets",
      "partBreak": "Act Three, Part 3 — Nothing In My Pockets",
      "background": "/img/nw2/bg-office-night.jpg",
      "ambientAudio": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.42,
        "lights": [
          {
            "x": 50,
            "y": 20,
            "color": "#5a6b8a",
            "intensity": 0.16,
            "size": 36,
            "pulseSeconds": 7,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "Jack's office. No lamp on. Rain on the window. The folder from Act One still on the desk.",
      "dialogueBeats": [
        {
          "id": "nwd_sn3_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I sat in my own office in the dark for two hours working out what I had. Sixteen years of files. Every cop I still know. Every person in this town who talks to me because I don't talk to him."
        },
        {
          "id": "nwd_sn3_s1",
          "characterId": "narrator",
          "expression": "a drawer. Papers.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn3_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Worth something to a man buying a reputation. Worth nothing at all to a man who's already holding the thing you want, because he doesn't have to buy it — he can just wait."
        },
        {
          "id": "nwd_sn3_s2",
          "characterId": "narrator",
          "expression": "rain. A chair.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn3_vo3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "That's the difference nobody tells you about. A debt you can pay. A hostage you can only beg for."
        },
        {
          "id": "nwd_sn3_s3",
          "characterId": "narrator",
          "expression": "a phone picked up. Dialled. Ringing.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn3_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I rang Rosa at three in the morning and hung up before it connected. Twice."
        },
        {
          "id": "nwd_sn3_s4",
          "characterId": "narrator",
          "expression": "the receiver going down. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn3_vo5",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'out of the room'",
          "text": "Not because she'd have refused. Because she'd have come. She'd have come and she'd have brought a badge into a building where a woman's sitting in an armchair being politely not-detained, and there is no version of that where Vera gets out of the room."
        },
        {
          "id": "nwd_sn3_s5",
          "characterId": "narrator",
          "expression": "a long hold. Rain on the window.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn3_vo6",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Sixteen years I kept one thing back and the first time it'd actually be useful, using it would kill her. That's not a moral position. That's just how the arithmetic came out."
        },
        {
          "id": "nwd_sn3_s6",
          "characterId": "narrator",
          "expression": "a chair scraping. Keys.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn3_vo7",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "So I went up there with nothing in my pockets and offered him everything anyway."
        }
      ],
      "choices": [
        {
          "id": "nwd_sn3_go",
          "text": "Up the stairs. Nothing in his pockets.",
          "targetSceneId": "nwd_sn_p4",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "rosa_uncalled_twice"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_sn_p4",
      "title": "Act Three, Part 4 — The Trade",
      "partBreak": "Act Three, Part 4 — The Trade",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 4,
        "dollyDuration": 30,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 68,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.26,
            "size": 32,
            "pulseSeconds": 7,
            "pulseAmount": 0.4
          },
          {
            "x": 18,
            "y": 44,
            "color": "#2ad9d9",
            "intensity": 0.12,
            "size": 38,
            "pulseSeconds": 8,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The feed store office. Ten past nine. Same room, same heater. Rain on one window. Moe and Desh against the wall, unannounced.",
      "dialogueBeats": [
        {
          "id": "nwd_sn4_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Same room. Same heater. Two men by the door who I'd handed her to in a pool hall on a Tuesday."
        },
        {
          "id": "nwd_sn4_sol1",
          "characterId": "solomon",
          "expression": "unhurried, pleasant",
          "text": "Mr. Morrow. She's had breakfast. I'd like that noted."
        },
        {
          "id": "nwd_sn4_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "Noted."
        },
        {
          "id": "nwd_sn4_sol2",
          "characterId": "solomon",
          "expression": "mild",
          "text": "And David?"
        },
        {
          "id": "nwd_sn4_s1",
          "characterId": "narrator",
          "expression": "the heater. Jack not answering.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_sol3",
          "characterId": "solomon",
          "expression": "mild — a beat after 'generally do'",
          "text": "I know. I'm asking whether you'd like to say it, because I find people generally do."
        },
        {
          "id": "nwd_sn4_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "He said he'd bring it back. Straight away. No arguing."
        },
        {
          "id": "nwd_sn4_sol4",
          "characterId": "solomon",
          "expression": "a small nod, genuinely interested",
          "text": "Did he. That's a better man than I had him down for."
        },
        {
          "id": "nwd_sn4_j3",
          "characterId": "jack",
          "expression": "quiet, dangerous",
          "text": "Then why."
        },
        {
          "id": "nwd_sn4_sol5",
          "characterId": "solomon",
          "expression": "without cruelty, which is the horror — a beat after 'an asset'",
          "text": "Because I'd have had the money and a man walking round who'd agreed to give it back. One of those is an asset."
        },
        {
          "id": "nwd_sn4_s2",
          "characterId": "narrator",
          "expression": "a long silence. The heater.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_j4",
          "characterId": "jack",
          "expression": "flat",
          "text": "Let her go."
        },
        {
          "id": "nwd_sn4_sol6",
          "characterId": "solomon",
          "expression": "mild",
          "text": "She's not being kept."
        },
        {
          "id": "nwd_sn4_j5",
          "characterId": "jack",
          "expression": "flat",
          "text": "She's in a room above a feed store with two of your men on the stairs."
        },
        {
          "id": "nwd_sn4_sol7",
          "characterId": "solomon",
          "expression": "mild — a beat after 'being prevented'",
          "text": "She's welcome to leave whenever she likes. She simply understands what leaving means, which is not the same as being prevented."
        },
        {
          "id": "nwd_sn4_s3",
          "characterId": "narrator",
          "expression": "Moe shifting his weight. A jacket settling over something with weight in the pocket.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_j6",
          "characterId": "jack",
          "expression": "flat",
          "text": "Then take the debt off her and put it on me."
        },
        {
          "id": "nwd_sn4_sol8",
          "characterId": "solomon",
          "expression": "almost amused",
          "text": "With what."
        },
        {
          "id": "nwd_sn4_j7",
          "characterId": "jack",
          "expression": "the terms — a beat after 'Take that'",
          "text": "Sixteen years of files. Every contact I've got. The licence in a drawer. I'm the only investigator in this county who doesn't work for you. Take that."
        },
        {
          "id": "nwd_sn4_s4",
          "characterId": "narrator",
          "expression": "a long pause. Rain. The heater.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_sol9",
          "characterId": "solomon",
          "expression": "quietly, and this is the route's central line",
          "text": "Mr. Morrow. Two days ago that would have been the most interesting offer anyone's made me in a decade."
        },
        {
          "id": "nwd_sn4_s5",
          "characterId": "narrator",
          "expression": "nothing.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_sol10",
          "characterId": "solomon",
          "expression": "unhurried — a beat after 'how little it takes'",
          "text": "But you gave me her name in a pool hall, for nothing, to see whether a man would blink. I already know what you'll hand over and how little it takes. There's nothing left to buy."
        },
        {
          "id": "nwd_sn4_s6",
          "characterId": "narrator",
          "expression": "the heater ticking. A very long hold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_vo2",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'the price'",
          "text": "Sixteen years. He didn't want it. Not because it wasn't worth anything — because I'd already shown him the price."
        },
        {
          "id": "nwd_sn4_sol11",
          "characterId": "solomon",
          "expression": "after a moment, standing, going to the window",
          "text": "Here's what will happen, and you may as well hear it sitting down."
        },
        {
          "id": "nwd_sn4_s7",
          "characterId": "narrator",
          "expression": "Jack not sitting.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_sol12",
          "characterId": "solomon",
          "expression": "mild",
          "text": "The debt stays where it is. She'll pay on it, the way her father did, the way people here do. Nobody will hurt her. Nobody will need to."
        },
        {
          "id": "nwd_sn4_j8",
          "characterId": "jack",
          "expression": "barely",
          "text": "That's not —"
        },
        {
          "id": "nwd_sn4_sol13",
          "characterId": "solomon",
          "expression": "not raising his voice at all — a beat after 'in a bar'",
          "text": "And you'll stay too. Not because I'm keeping you — because you won't leave her, and she can't leave. I've not had to arrange a single part of this, Mr. Morrow. You did it yourself in a bar."
        },
        {
          "id": "nwd_sn4_s8",
          "characterId": "narrator",
          "expression": "rain. Nobody moving.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_sol14",
          "characterId": "solomon",
          "expression": "at the window, not turning",
          "text": "You may collect her. She's not been charged with anything and neither have you. That's the whole of it. There's no more to the arrangement than that."
        },
        {
          "id": "nwd_sn4_s9",
          "characterId": "narrator",
          "expression": "Jack to the door.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn4_desh1",
          "characterId": "desh",
          "expression": "quiet, not defensive, genuinely explaining",
          "text": "He didn't know it was coming. If that's — I know that's not nothing to some people. He was home. The door was shut. He never did hear it."
        },
        {
          "id": "nwd_sn4_desh2",
          "characterId": "desh",
          "expression": "calling after him, and he means it — a beat after 'got us the house'",
          "text": "Hey — Morrow. For what it's worth. Six hundred bucks got us the house. Nothing got us her."
        }
      ],
      "choices": [
        {
          "id": "nwd_sn4_go",
          "text": "Collect her. Eleven forty-seven.",
          "targetSceneId": "nwd_sn_p5",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "trade_refused"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_sn_p5",
      "title": "Act Three, Part 5 — Nobody's Witness",
      "partBreak": "Act Three, Part 5 — Nobody's Witness",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.6,
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.16,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The Blackwood Diner. Friday. Eleven forty-seven. The same booth. Vera opposite him, coat on, no bag — she was never packing, she was upstairs.",
      "dialogueBeats": [
        {
          "id": "nwd_sn5_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "I collected her from a room above a feed store and we walked to a diner because neither of us could think where else people go."
        },
        {
          "id": "nwd_sn5_s1",
          "characterId": "narrator",
          "expression": "the fan. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn5_v1",
          "characterId": "vera",
          "expression": "eventually",
          "text": "He let us both out."
        },
        {
          "id": "nwd_sn5_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "He didn't have to let us out. That's the point he was making."
        },
        {
          "id": "nwd_sn5_v2",
          "characterId": "vera",
          "expression": "quiet",
          "text": "I know. I got it."
        },
        {
          "id": "nwd_sn5_s2",
          "characterId": "narrator",
          "expression": "rain. Two coffees. Neither touched.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_sn5_v3",
          "characterId": "vera",
          "expression": "flat — a beat after 'understood that correctly'",
          "text": "So I owe two hundred and twenty-two thousand pounds to a man who employs half this town, and I'll be paying on it when I'm sixty, and you've got nothing left to sell because he wouldn't take it. Have I understood that correctly."
        },
        {
          "id": "nwd_sn5_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "Yeah."
        },
        {
          "id": "nwd_sn5_v4",
          "characterId": "vera",
          "expression": "a small, terrible laugh",
          "text": "Right."
        }
      ],
      "choices": [
        {
          "id": "nwd_sn5_tell",
          "text": "Tell her.",
          "targetSceneId": "nwd_sn_p5_told",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_sn5_silent",
          "text": "Say nothing.",
          "targetSceneId": "nwd_sn_p5_quiet",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_sn_p5_told",
      "title": "Part 5 — What He Told Her",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.16,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The song enters — stripped, a fragment, low. Same melody as the Interlude. It does not swell.",
      "dialogueBeats": [
        {
          "id": "nwd_snt_j1",
          "characterId": "jack",
          "expression": "quiet",
          "text": "There's a thing you should have."
        },
        {
          "id": "nwd_snt_v1",
          "characterId": "vera",
          "expression": "wary",
          "text": "Go on."
        },
        {
          "id": "nwd_snt_j2",
          "characterId": "jack",
          "expression": "flat, careful — a beat after 'Not for a second'",
          "text": "When I told him they had you, he had a mug in his hand and he put it back in the cupboard and said \"right, I'll bring it back.\" Didn't think about it. Not for a second."
        },
        {
          "id": "nwd_snt_s1",
          "characterId": "narrator",
          "expression": "nothing. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snt_v2",
          "characterId": "vera",
          "expression": "barely",
          "text": "Don't."
        },
        {
          "id": "nwd_snt_j3",
          "characterId": "jack",
          "expression": "gently — a beat after 'wouldn't say'",
          "text": "Six hundred quid got them the house. Nothing got them you. They asked him and he wouldn't say."
        },
        {
          "id": "nwd_snt_s2",
          "characterId": "narrator",
          "expression": "her breaking — short, ugly, stopped fast.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snt_v3",
          "characterId": "vera",
          "expression": "wrecked",
          "text": "Eleven hours. I had eleven hours and I sat there doing sums—"
        },
        {
          "id": "nwd_snt_j4",
          "characterId": "jack",
          "expression": "plain",
          "text": "I know."
        },
        {
          "id": "nwd_snt_v4",
          "characterId": "vera",
          "expression": "wrecked",
          "text": "—and he put a mug in a cupboard."
        },
        {
          "id": "nwd_snt_s3",
          "characterId": "narrator",
          "expression": "rain. The song. A long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snt_v5",
          "characterId": "vera",
          "expression": "after a long time, steadier, and this is why she stays",
          "text": "There's no bus."
        },
        {
          "id": "nwd_snt_j5",
          "characterId": "jack",
          "expression": "quiet",
          "text": "There's a bus at six."
        },
        {
          "id": "nwd_snt_v6",
          "characterId": "vera",
          "expression": "flat — a beat after 'don't know anybody'",
          "text": "There's no bus, Jack. I owe him two hundred and twenty-two thousand pounds. The bus goes to a place where I owe him two hundred and twenty-two thousand pounds and don't know anybody."
        },
        {
          "id": "nwd_snt_s4",
          "characterId": "narrator",
          "expression": "the fan. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snt_v7",
          "characterId": "vera",
          "expression": "very quiet — a beat after 'twice in one week'",
          "text": "I'd worked out I was going to leave you. On the walk down here. It was quite a good plan. And then you told me that, and now I know exactly what it costs when somebody puts a mug in a cupboard for me, and I can't do it twice in one week."
        },
        {
          "id": "nwd_snt_j6",
          "characterId": "jack",
          "expression": "low",
          "text": "Stay."
        },
        {
          "id": "nwd_snt_v8",
          "characterId": "vera",
          "expression": "and she means all of it",
          "text": "I want to. That's how I know it's a bad idea."
        },
        {
          "id": "nwd_snt_s5",
          "characterId": "narrator",
          "expression": "a long hold. Rain. The fan. Neither of them moving.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snt_v9",
          "characterId": "vera",
          "expression": "flat",
          "text": "I'm not going to, though."
        },
        {
          "id": "nwd_snt_j7",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I know."
        },
        {
          "id": "nwd_snt_s6",
          "characterId": "narrator",
          "expression": "the fan. Rain. The song underneath, not resolving.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snt_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "Nobody drove off. Nobody said anything that'd look good written down. Two people sat in a booth owing the same man the same money, and started the long part."
        }
      ],
      "choices": [
        {
          "id": "nwd_snt_go",
          "text": "The long part.",
          "targetSceneId": "nwd_sn_b_outro",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_sn_p5_quiet",
      "title": "Part 5 — The Thing He Kept",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The fan. The rain. Jack not speaking. The song, thin, underneath.",
      "dialogueBeats": [
        {
          "id": "nwd_snq_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'I kept it'",
          "text": "I had one thing left that was mine to give. A mug going back in a cupboard. And I looked at what it'd do to her and I decided she'd had enough for one week, and I kept it."
        },
        {
          "id": "nwd_snq_s1",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snq_v1",
          "characterId": "vera",
          "expression": "eventually, flat",
          "text": "You've gone quiet."
        },
        {
          "id": "nwd_snq_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "Long day."
        },
        {
          "id": "nwd_snq_s2",
          "characterId": "narrator",
          "expression": "rain. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snq_v2",
          "characterId": "vera",
          "expression": "standing, coat still on — a beat after 'then I don't know'",
          "text": "Right. Well. I'm two doors down till the end of the month and then I don't know."
        },
        {
          "id": "nwd_snq_j2",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Okay."
        },
        {
          "id": "nwd_snq_v3",
          "characterId": "vera",
          "expression": "at the edge of the booth, and there's nothing in it",
          "text": "Thanks for collecting me."
        },
        {
          "id": "nwd_snq_s3",
          "characterId": "narrator",
          "expression": "the bell. The door. Rain swelling — then muffled.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snq_s4",
          "characterId": "narrator",
          "expression": "the fan. The rain. Jack alone. The song, thin.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snq_vo2",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'an hour of grief'",
          "text": "She'd have stayed. I've thought about that most nights since. I had the one piece of information in the world that would have kept her in that booth and I sat on it to spare her an hour of grief, and she was gone by the end of the month."
        },
        {
          "id": "nwd_snq_s5",
          "characterId": "narrator",
          "expression": "rain. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snq_vo3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "Sixteen years of not handing things over. Turns out I only ever got it wrong in the two directions available."
        }
      ],
      "choices": [
        {
          "id": "nwd_snq_go",
          "text": "What's left that anybody did for no reason.",
          "targetSceneId": "nwd_sn_d_outro",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_sn_b_outro",
      "title": "Part 6 — She Stays",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "victory-gold",
        "headline": "SHE STAYS",
        "recap": "A woman said 'I'm not going to, though,' and a sentence took three days to finish. In this town, that's about as close to a happy ending as anybody's ever come."
      },
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.16,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The booth. Two people owing the same man the same money, and the long part.",
      "dialogueBeats": [
        {
          "id": "nwd_snb_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'any less dead'",
          "text": "People think the hard part is losing them. The hard part is the part after. Where you got what you wanted, and it's sitting across the table looking at you, and neither of you can think of the thing to say that makes a man in a yard four hours north any less dead."
        },
        {
          "id": "nwd_snb_vo2",
          "characterId": "jack",
          "expression": "V.O. — almost nothing — rain, the fan, the song thinning; a beat after 'tipped a motel clerk'",
          "text": "He tipped a motel clerk. Nine days out, two hundred grand in a bag, sleeping in his shoes — and he tipped a motel clerk. I still can't put it down. Neither can she. That's most of what we've got in common now, and it's more than some people have."
        },
        {
          "id": "nwd_snb_s1",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snb_v1",
          "characterId": "vera",
          "expression": "quiet, out of nowhere, the first thing either of them has said in a long time",
          "text": "Doors."
        },
        {
          "id": "nwd_snb_j1",
          "characterId": "jack",
          "expression": "low",
          "text": "What?"
        },
        {
          "id": "nwd_snb_v2",
          "characterId": "vera",
          "expression": "not looking up — rain, the fan",
          "text": "He used to say a shut door is just a wall that's lying about it."
        },
        {
          "id": "nwd_snb_v3",
          "characterId": "vera",
          "expression": "barely — a beat after 'Three days.'",
          "text": "I remembered it. Three days. I've been trying to remember it for three days."
        },
        {
          "id": "nwd_snb_s2",
          "characterId": "narrator",
          "expression": "silence. Neither of them says anything else.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snb_vo3",
          "characterId": "jack",
          "expression": "V.O. — very quiet, and this really is the last line — a beat after 'came back'",
          "text": "She got it back. That's the one thing that came back. Eleven fifty-one on a Friday, a woman sat back down in a booth, and a sentence took three days to finish, and in this town that's about as close to a happy ending as anybody's ever come."
        },
        {
          "id": "nwd_snb_s3",
          "characterId": "narrator",
          "expression": "the song — holding — then not resolving. It stops, the way the vocal does. Rain. The fan. Silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snb_s4",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty — same as the first frame of the film. The diner's neon smearing teal and magenta across wet asphalt. Two figures visible through the diner window this time, small, still, sitting opposite each other. Not moving.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_sn_d_outro",
      "title": "Part 6 — Ten Past Nine",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "gameover",
        "headline": "TEN PAST NINE",
        "recap": "Ten past nine there was nothing left to sell. By eleven forty-seven there was nothing left to keep. She was gone by the end of the month, and the one piece of information that would have kept her sat in a booth with a man who'd had enough for one week."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 20,
            "color": "#5a6b8a",
            "intensity": 0.3,
            "size": 40,
            "pulseSeconds": 6,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The booth. Rain. Jack alone.",
      "dialogueBeats": [
        {
          "id": "nwd_snd_vo1",
          "characterId": "jack",
          "expression": "V.O. — very quiet — a beat after 'tipped a motel clerk'",
          "text": "He tipped a motel clerk. Nine days out, two hundred grand in a bag, sleeping in his shoes — and he tipped a motel clerk. I think about that instead of thinking about the rest of it. It's the only thing left that anybody did for no reason."
        },
        {
          "id": "nwd_snd_s1",
          "characterId": "narrator",
          "expression": "the song — holding — then stopping mid-phrase. Rain. The fan. Silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_snd_s2",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty. Neon on wet asphalt. One figure through the diner window, alone.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_finale",
      "title": "Part 6 — Nobody's Witness",
      "partBreak": "Act Three, Part 6 — Nobody's Witness",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade-black",
      "transitionSpeed": 1.6,
      "musicMode": "none",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The Blackwood Diner. Rain on the window. The ceiling fan. Identical to the opening — deliberately. Friday night. Eleven forty-seven.",
      "dialogueBeats": [
        {
          "id": "nwd_fh_s1",
          "characterId": "narrator",
          "expression": "the booth. The cold coffee. The fan. Everything here was decided earlier.",
          "silent": true,
          "text": ""
        }
      ],
      "choices": [
        {
          "id": "nwd_fh_reflect",
          "text": "Sit with what you've seen this week.",
          "attitudeTag": "Neutral",
          "reply": true,
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "saw_watch",
              "saw_ash_street",
              "saw_own_file"
            ]
          },
          "consequences": {
            "setFlags": [
              "seen_route"
            ]
          }
        },
        {
          "id": "nwd_fh_a",
          "text": "The booth. Eleven forty-seven.",
          "targetSceneId": "nwd_finale_a",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "knows_david_protected_her",
              "debt_cleared",
              "bag_examined",
              "saw_rosas_cost"
            ],
            "excludesFlags": [
              "on_payroll",
              "violence",
              "timer_expired",
              "seen_route"
            ]
          }
        },
        {
          "id": "nwd_fh_b",
          "text": "The booth. Eleven forty-seven.",
          "targetSceneId": "nwd_finale_b",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "knows_david_protected_her",
              "debt_cleared",
              "bag_examined"
            ],
            "excludesFlags": [
              "saw_rosas_cost",
              "on_payroll",
              "violence",
              "timer_expired",
              "seen_route"
            ]
          }
        },
        {
          "id": "nwd_fh_c",
          "text": "The booth. Eleven forty-seven.",
          "targetSceneId": "nwd_finale_c",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresAll": false,
            "requiresFlags": [
              "seen_route",
              "timer_expired"
            ],
            "excludesFlags": [
              "on_payroll",
              "violence"
            ]
          }
        },
        {
          "id": "nwd_fh_d",
          "text": "The booth. Eleven forty-seven.",
          "targetSceneId": "nwd_finale_d",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresAll": false,
            "requiresFlags": [
              "on_payroll",
              "violence",
              "skipped_bluecue"
            ]
          }
        },
        {
          "id": "nwd_fh_df",
          "text": "The booth. Eleven forty-seven.",
          "targetSceneId": "nwd_finale_d",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "knows_david_protected_her",
              "debt_cleared"
            ],
            "excludesFlags": [
              "bag_examined",
              "on_payroll",
              "violence",
              "timer_expired",
              "seen_route"
            ]
          }
        }
      ],
      "hotspots": [
        {
          "id": "nwd_fh_hs_coffee",
          "label": "The cold coffee",
          "cursor": "look",
          "bounds": {
            "x": 40,
            "y": 56,
            "w": 16,
            "h": 16
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Same cup, same distance. Ten years it has gone cold in the same place."
          }
        },
        {
          "id": "nwd_fh_hs_window",
          "label": "The window",
          "cursor": "look",
          "bounds": {
            "x": 2,
            "y": 6,
            "w": 26,
            "h": 40
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Rain on glass. The street outside is doing all the work of a much bigger city."
          }
        },
        {
          "id": "nwd_fh_hs_fan",
          "label": "The ceiling fan",
          "cursor": "look",
          "bounds": {
            "x": 44,
            "y": 2,
            "w": 20,
            "h": 14
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "Ticking in slow lazy circles. It has kept the time of this room for ten years."
          }
        },
        {
          "id": "nwd_fh_hs_booth",
          "label": "The booth opposite",
          "cursor": "look",
          "bounds": {
            "x": 30,
            "y": 30,
            "w": 26,
            "h": 22
          },
          "isRepeatable": true,
          "action": {
            "type": "showText",
            "text": "The vinyl seat across from him, still holding the shape of where she sat. Rain-light moving across it the same way it did the first night. Just the shape."
          }
        }
      ],
      "onEnterActions": []
    },
    {
      "id": "nwd_mill_ask",
      "title": "Part 3 — The Past Tense",
      "background": "/img/nw2/bg-mill-lot.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "50% 40%",
        "zoomDuration": 30,
        "dimAmount": 0.36,
        "lights": [
          {
            "x": 64,
            "y": 22,
            "color": "#ffb761",
            "intensity": 0.3,
            "size": 26,
            "pulseSeconds": 4.8,
            "pulseAmount": 0.35
          }
        ]
      },
      "prose": "Rain. The sodium light. Ten feet of gravel between them, neither of them crossing it.",
      "dialogueBeats": [
        {
          "id": "nwd_ma_j1",
          "characterId": "jack",
          "expression": "flat",
          "text": "You talked about him in past tense. In the diner. 'People used to say that.' Why."
        },
        {
          "id": "nwd_ma_v1",
          "characterId": "vera",
          "expression": "steady, and it costs her",
          "text": "Because past tense is the only tense where he's still the man I married. Present tense is the yard. Future tense is me, alone, doing the arithmetic."
        },
        {
          "id": "nwd_ma_v2",
          "characterId": "vera",
          "expression": "quieter",
          "text": "And no, I didn't find out about the yard from you. I knew before. I've known since the address was sold."
        },
        {
          "id": "nwd_ma_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "She knew before the yard. I want that on the record. I don't know what it makes her. I know what it makes the eleven hours."
        }
      ],
      "choices": [
        {
          "id": "nwd_ma_go",
          "text": "Back to the lot.",
          "targetSceneId": "nwd_mill",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_millask",
              "she_confessed_early"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_cost_ask",
      "title": "Part 4 — What It Cost Her",
      "background": "/img/nw2/bg-rosa-car.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "50% 42%",
        "zoomDuration": 30,
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 40,
            "color": "#9fe8ff",
            "intensity": 0.2,
            "size": 34,
            "pulseSeconds": 5.2,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The engine off. Rain on the roof. Neither of them touching the form.",
      "dialogueBeats": [
        {
          "id": "nwd_ca_j1",
          "characterId": "jack",
          "expression": "quiet",
          "text": "The form. What are you giving up."
        },
        {
          "id": "nwd_ca_r1",
          "characterId": "rosa",
          "expression": "plain, not performing it",
          "text": "The last thing in this town I still thought was worth staying for. Sign it and Monday I'm somebody else's problem — actual budget, backup that shows up, a case that isn't this one."
        },
        {
          "id": "nwd_ca_r2",
          "characterId": "rosa",
          "expression": "quieter",
          "text": "And I want you to understand the part you can't see: I've done the arithmetic too. If I help you and it goes bad, that form never gets signed. Nobody moves a detective who let a killing walk to protect a friend."
        },
        {
          "id": "nwd_ca_j2",
          "characterId": "jack",
          "expression": "low",
          "text": "I know."
        },
        {
          "id": "nwd_ca_r3",
          "characterId": "rosa",
          "expression": "eyes on the road",
          "text": "No. You know what you're hoping for. Not the same thing."
        }
      ],
      "choices": [
        {
          "id": "nwd_ca_go",
          "text": "Back to the car.",
          "targetSceneId": "nwd_cost",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "act3v_costask",
              "rosa_acknowledged"
            ]
          }
        },
        {
          "conditionRule": {
            "requiresFlags": [
              "act3v_millask"
            ]
          },
          "consequences": {
            "setFlags": [
              "timer_expired"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_trade_ask",
      "title": "Part 5 — The File With Your Name On It",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "60% 36%",
        "zoomDuration": 30,
        "dimAmount": 0.28,
        "lights": [
          {
            "x": 68,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.26,
            "size": 32,
            "pulseSeconds": 7,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "The rain on the single window. The heater ticking. A conversation neither of them has had in ten years.",
      "dialogueBeats": [
        {
          "id": "nwd_ta_j1",
          "characterId": "jack",
          "expression": "quiet",
          "text": "The file. 2015. Why did you keep it."
        },
        {
          "id": "nwd_ta_sol1",
          "characterId": "solomon",
          "expression": "turning, genuinely curious — a beat after 'he wouldn't'",
          "text": "2015. There was a file with my name in it and a young detective who was asked twice to lose it. Do you know what I thought, when I heard he wouldn't?"
        },
        {
          "id": "nwd_ta_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "No."
        },
        {
          "id": "nwd_ta_sol2",
          "characterId": "solomon",
          "expression": "the closest he comes to warmth — a beat after 'won't sell'",
          "text": "I thought: there's a man who's found the one thing he won't sell. Everybody's got a number, Mr. Morrow, and most men never find out what theirs is because nobody ever offers it. You found out at thirty-four. I've thought about you, on and off, for ten years. Not as a problem. As a curiosity."
        },
        {
          "id": "nwd_ta_sol3",
          "characterId": "solomon",
          "expression": "quiet",
          "text": "And now you've walked up my stairs to sell it to me for a woman whose father I said no to."
        },
        {
          "id": "nwd_ta_j3",
          "characterId": "jack",
          "expression": "nothing in his voice",
          "text": "Yes."
        }
      ],
      "choices": [
        {
          "id": "nwd_ta_go",
          "text": "Back to the desk.",
          "targetSceneId": "nwd_trade_5b",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "solomon_respects_jack"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_trade_violence",
      "title": "Part 5 — The Room Ends",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "cut",
      "cinematic": {
        "mode": "shake",
        "shakeAmount": 0.5,
        "shakeDuration": 0.4,
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 50,
            "y": 20,
            "color": "#ff4444",
            "intensity": 0.3,
            "size": 40,
            "pulseSeconds": 1.2,
            "pulseAmount": 0.6
          }
        ]
      },
      "prose": "The chair scrapes. A hand comes up fast. The room is already over.",
      "dialogueBeats": [
        {
          "id": "nwd_tv_vo1",
          "characterId": "jack",
          "expression": "V.O. — flat, and the flatness is the injury",
          "text": "Whatever was about to happen, it happened in the half second before I decided. I'll never know which of us decided first."
        }
      ],
      "choices": [
        {
          "id": "nwd_tv_go",
          "text": "The trade. Shorter now.",
          "targetSceneId": "nwd_trade_5b",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "violence"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_trade_5b",
      "title": "Part 5 — The Trade",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 4,
        "dollyDuration": 30,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 68,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.26,
            "size": 32,
            "pulseSeconds": 7,
            "pulseAmount": 0.3
          },
          {
            "x": 18,
            "y": 44,
            "color": "#2ad9d9",
            "intensity": 0.12,
            "size": 38,
            "pulseSeconds": 8,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "The heater ticking. Rain on the single window. Nobody touching anything for a while.",
      "dialogueBeats": [
        {
          "id": "nwd_t5_sol7",
          "characterId": "solomon",
          "expression": "a single raised finger, not looking round, and Desh stops dead",
          "conditionRule": {
            "excludesFlags": [
              "violence"
            ]
          },
          "text": "Not yet."
        },
        {
          "id": "nwd_t5_s1",
          "characterId": "narrator",
          "expression": "silence. Rain. Jack hasn't turned round. He doesn't get to know how close that was, and neither does the audience, until it's already over.",
          "silent": true,
          "conditionRule": {
            "excludesFlags": [
              "violence"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_t5_s2",
          "characterId": "narrator",
          "expression": "no raised finger. No 'not yet.' The room just — ended, and Solomon is sitting back down like nothing happened.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "violence"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_t5_j8",
          "characterId": "jack",
          "expression": "the whole ledger — a beat after 'talking to you'",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "text": "Sixteen years of files. Every cop I still know in three counties. Every person in Blackwood who talks to me because I don't talk to you. Take all of it. License in a drawer, files to you. Next time somebody here needs somebody who isn't yours — there isn't one."
        },
        {
          "id": "nwd_t5_op3",
          "characterId": "solomon",
          "expression": "flat, and this costs him something that isn't money",
          "conditionRule": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "So you walked up my stairs to hand me a receipt."
        },
        {
          "id": "nwd_t5_j11",
          "characterId": "jack",
          "expression": "flat",
          "conditionRule": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "I walked up your stairs to buy a name. You wrote the paper, but the debt's hers, and the clearing's mine."
        },
        {
          "id": "nwd_t5_op4",
          "characterId": "solomon",
          "expression": "a long pause. The heater.",
          "conditionRule": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "That's not how this works. You don't buy clearings."
        },
        {
          "id": "nwd_t5_j12",
          "characterId": "jack",
          "expression": "quiet",
          "conditionRule": {
            "requiresFlags": [
              "on_payroll"
            ]
          },
          "text": "Then tell me how it works, and I'll do it."
        },
        {
          "id": "nwd_t5_sol8",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "characterId": "solomon",
          "expression": "quiet, not gloating — assessing, standing, slow footsteps to the window",
          "text": "You understand what you're describing. There's no version of Blackwood after this where you're a man anybody comes to."
        },
        {
          "id": "nwd_t5_j9",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "characterId": "jack",
          "expression": "plain",
          "text": "Yes."
        },
        {
          "id": "nwd_t5_sol9",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "characterId": "solomon",
          "expression": "flat",
          "text": "You'd be here. Just — not that."
        },
        {
          "id": "nwd_t5_j10",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "characterId": "jack",
          "expression": "plain",
          "text": "Yes."
        }
      ],
      "choices": [
        {
          "id": "nwd_t5_go",
          "text": "The desk. The rest of it.",
          "targetSceneId": "nwd_trade_5c",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_t5_ask",
          "text": "Why did you keep the file.",
          "targetSceneId": "nwd_trade_ask",
          "attitudeTag": "Neutral",
          "hidden": true,
          "gating": {
            "requiresFlags": [
              "saw_own_file"
            ]
          }
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_trade_5c",
      "title": "Part 5 — The Trade",
      "partBreak": "Act Three, Part 5 — The Trade",
      "background": "/img/nw2/bg-solomon-office.jpg",
      "ambientAudio": "drone",
      "transition": "fade",
      "cinematic": {
        "mode": "dolly",
        "dollyDistance": 4,
        "dollyDuration": 30,
        "dimAmount": 0.24,
        "lights": [
          {
            "x": 68,
            "y": 30,
            "color": "#ffb761",
            "intensity": 0.26,
            "size": 32,
            "pulseSeconds": 7,
            "pulseAmount": 0.3
          },
          {
            "x": 18,
            "y": 44,
            "color": "#2ad9d9",
            "intensity": 0.12,
            "size": 38,
            "pulseSeconds": 8,
            "pulseAmount": 0.4
          }
        ]
      },
      "prose": "Rain on the window. A long silence. The heater doing all the talking either of them will do.",
      "dialogueBeats": [
        {
          "id": "nwd_t5c_j13",
          "characterId": "jack",
          "expression": "flat, complete",
          "conditionRule": {
            "excludesFlags": [
              "on_payroll"
            ]
          },
          "text": "I spent sixteen years and everything after them proving I wouldn't hand you anything. I'm handing you all of it. Take it and say her name."
        },
        {
          "id": "nwd_t5c_sol14",
          "characterId": "solomon",
          "expression": "turning back, closest he comes to feeling — a long silence first, the heater, rain",
          "text": "Her father sat in that chair. 2011. Four thousand, for a furnace, in November."
        },
        {
          "id": "nwd_t5c_sol15",
          "characterId": "solomon",
          "expression": "the business, plainly — the heater ticking, Jack not moving",
          "text": "I gave it to him at a rate I knew he couldn't clear. That's the business. He knew it too. Took it anyway. It was November."
        },
        {
          "id": "nwd_t5c_j14",
          "characterId": "jack",
          "expression": "flat",
          "text": "I know the story."
        },
        {
          "id": "nwd_t5c_sol16",
          "characterId": "solomon",
          "expression": "his version — a beat after 'what you're offering'",
          "text": "You know her version. Here's mine. He came back six years later and offered me exactly what you're offering. Everything he had, to clear it off his daughter before he died. I said no. Debt's worth more than a man's life in a town this size — a life ends, a debt keeps working."
        },
        {
          "id": "nwd_t5c_j15",
          "characterId": "jack",
          "expression": "very quiet",
          "text": "And now?"
        },
        {
          "id": "nwd_t5c_sol17",
          "characterId": "solomon",
          "expression": "unreadable, sitting back down — a beat after 'as I used to'",
          "conditionRule": {
            "excludesFlags": [
              "david_already_dead",
              "vera_held"
            ]
          },
          "text": "Now I'm older, and there's a man dead in a yard because I gave permission for it, and I find I don't like the arithmetic as much as I used to. Take the deal off the table before I remember I'm a businessman."
        },
        {
          "id": "nwd_t5c_sol17tw",
          "characterId": "solomon",
          "expression": "unreadable, sitting back down — a beat after 'as I used to'",
          "conditionRule": {
            "requiresFlags": [
              "david_already_dead"
            ]
          },
          "text": "Now I'm older, and there's a man dead in a house four hours north because I gave permission for it, and I find I don't like the arithmetic as much as I used to. Take the deal off the table before I remember I'm a businessman."
        },
        {
          "id": "nwd_t5c_j16",
          "characterId": "jack",
          "expression": "not moving",
          "text": "Say it. Her name, clear. Out loud."
        },
        {
          "id": "nwd_t5c_sol18",
          "characterId": "solomon",
          "expression": "flat, formal",
          "text": "Vera Voss owes me nothing. The Kessler debt is closed. I'll say it to the two men I told, and it'll be around town by noon, which is what you actually came for."
        },
        {
          "id": "nwd_t5c_j16b",
          "characterId": "jack",
          "expression": "not moving, flat",
          "text": "The two men."
        },
        {
          "id": "nwd_t5c_sol18b",
          "characterId": "solomon",
          "expression": "businesslike — a beat after 'Sato'",
          "text": "A man at the depot. And your Mr. Sato."
        },
        {
          "id": "nwd_t5c_s1b",
          "characterId": "narrator",
          "expression": "nothing. The heater.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_t5c_sol18c",
          "characterId": "solomon",
          "expression": "entirely without malice",
          "text": "He's very good, incidentally. Six hundred pounds and he doesn't haggle."
        },
        {
          "id": "nwd_t5c_s1",
          "characterId": "narrator",
          "expression": "Jack standing. A case set on the desk — a soft, final weight. Footsteps toward the door. Then stopping.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_t5c_sol19",
          "characterId": "solomon",
          "expression": "not unkind, and this is the line that seeds the ending",
          "conditionRule": {
            "requiresFlags": [
              "saw_rosas_cost"
            ]
          },
          "text": "Mr. Morrow. One thing, since we're unlikely to do this again."
        },
        {
          "id": "nwd_t5c_j17",
          "characterId": "jack",
          "expression": "at the door",
          "conditionRule": {
            "requiresFlags": [
              "saw_rosas_cost"
            ]
          },
          "text": "What."
        },
        {
          "id": "nwd_t5c_sol20",
          "characterId": "solomon",
          "expression": "mild — a beat after 'her leaving'",
          "conditionRule": {
            "requiresFlags": [
              "saw_rosas_cost"
            ]
          },
          "text": "You've bought her the ability to leave. I'd want to be sure that's the same thing as her leaving. In my experience it very rarely is."
        },
        {
          "id": "nwd_t5c_s2",
          "characterId": "narrator",
          "expression": "rain. Jack not answering.",
          "silent": true,
          "conditionRule": {
            "requiresFlags": [
              "saw_rosas_cost"
            ]
          },
          "text": ""
        },
        {
          "id": "nwd_t5c_sol21",
          "characterId": "solomon",
          "expression": "quietly — a beat after 'they know'",
          "conditionRule": {
            "requiresFlags": [
              "saw_rosas_cost"
            ]
          },
          "text": "People here don't leave when you hand them the door. They stay and they find something new to owe. It's the only shape they know. I'd think about that before tonight."
        },
        {
          "id": "nwd_t5c_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare. Footsteps down a wooden staircase. A door. Rain. — a beat after 'walked down the stairs'",
          "text": "I put sixteen years on a desk in a room over a feed store and I walked down the stairs. Eleven months at an empty desk, because I wouldn't lose one file. Ten years of nothing after, because I wouldn't. That was the whole thing I was. That was the only asset I ever actually had, and I'd been carrying it around so long I'd started mistaking it for a personality."
        },
        {
          "id": "nwd_t5c_vo4",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "The thing I keep having to explain to people since is that it didn't feel like losing. It felt like paying. Those are different and only one of them is a tragedy."
        },
        {
          "id": "nwd_t5c_vo5",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "I did the only thing I've ever been good at. I made a trade with a man who curates debts. What I didn't do — and I want to be honest, because I've been honest about the rest of it — is ask her first."
        }
      ],
      "choices": [
        {
          "id": "nwd_t5c_go",
          "text": "The diner. Eleven forty-seven.",
          "targetSceneId": "nwd_finale",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": [
        {
          "consequences": {
            "setFlags": [
              "debt_cleared",
              "jack_ruined"
            ]
          }
        }
      ]
    },
    {
      "id": "nwd_finale_a",
      "title": "Part 6 — She Walks",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The door bell. Rain swelling, then muffled. Footsteps — the same unhurried walk from the first scene.",
      "dialogueBeats": [
        {
          "id": "nwd_fa_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "Friday night. Eleven forty-seven. Same booth. I didn't plan that. I've sat in that booth at that time for ten years and one woman walking into it doesn't change a habit."
        },
        {
          "id": "nwd_fa_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat. The vinyl booth creaking. A long silence. Rain.",
          "text": "She had a bag with her. Not a big one. That's how I knew before she sat down."
        },
        {
          "id": "nwd_fa_v1",
          "characterId": "vera",
          "expression": "quiet",
          "text": "It's around town. By noon, like he said."
        },
        {
          "id": "nwd_fa_j1",
          "characterId": "jack",
          "expression": "plain",
          "text": "Good."
        },
        {
          "id": "nwd_fa_v2",
          "characterId": "vera",
          "expression": "not raising her voice",
          "text": "Doc Sato asked me this morning if it was true you'd stopped working. He wasn't being cruel. He wanted to know who he calls now."
        },
        {
          "id": "nwd_fa_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "Nobody. That's the trade."
        },
        {
          "id": "nwd_fa_s1",
          "characterId": "narrator",
          "expression": "rain. The fan. Neither of them touching the coffee.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fa_v3",
          "characterId": "vera",
          "expression": "not raising her voice",
          "text": "You didn't ask me."
        },
        {
          "id": "nwd_fa_j3",
          "characterId": "jack",
          "expression": "plain",
          "text": "No."
        },
        {
          "id": "nwd_fa_v4",
          "characterId": "vera",
          "expression": "plain",
          "text": "Why."
        },
        {
          "id": "nwd_fa_j4",
          "characterId": "jack",
          "expression": "honest",
          "text": "Because you'd have said no, and I'd have listened, and then you'd be carrying it."
        },
        {
          "id": "nwd_fa_s2",
          "characterId": "narrator",
          "expression": "a long pause",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fa_v5",
          "characterId": "vera",
          "expression": "the smallest break",
          "text": "That's the most anyone's ever done for me and I never got a vote in it."
        },
        {
          "id": "nwd_fa_j5",
          "characterId": "jack",
          "expression": "plain",
          "text": "I know."
        },
        {
          "id": "nwd_fa_v6",
          "characterId": "vera",
          "expression": "quiet",
          "text": "I'm not sure that's love, Jack. I think it might be the same thing everybody in this town does. Deciding for somebody else because you've decided you know better."
        },
        {
          "id": "nwd_fa_j6",
          "characterId": "jack",
          "expression": "after a beat, not defending it",
          "text": "Probably."
        },
        {
          "id": "nwd_fa_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare. Rain. The fan.",
          "text": "One piece of information left that was mine to give or keep. Two days I'd had it."
        }
      ],
      "choices": [
        {
          "id": "nwd_fa_tell",
          "text": "Tell her.",
          "targetSceneId": "nwd_finale_a_told",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_fa_silent",
          "text": "Say nothing.",
          "targetSceneId": "nwd_finale_a_quiet",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_finale_a_told",
      "title": "Part 6 — She Walks",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "victory-gold",
        "headline": "NOBODY'S WITNESS",
        "recap": "He tipped a motel clerk. Nine days out, two hundred grand in a bag — and he tipped a motel clerk. Tonight Jack drank the coffee anyway. Cold. Didn't matter."
      },
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "Two days I'd had it. The booth between them, ten feet of the same rain.",
      "dialogueBeats": [
        {
          "id": "nwd_fat_j7",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I need to tell you something and I've gone back and forth on whether it's a kindness."
        },
        {
          "id": "nwd_fat_v7",
          "characterId": "vera",
          "expression": "wary",
          "text": "Okay."
        },
        {
          "id": "nwd_fat_j8",
          "characterId": "jack",
          "expression": "flat, careful",
          "text": "They asked him where you were."
        },
        {
          "id": "nwd_fat_s1",
          "characterId": "narrator",
          "expression": "silence. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_v8",
          "characterId": "vera",
          "expression": "very quiet",
          "text": "What?"
        },
        {
          "id": "nwd_fat_j9",
          "characterId": "jack",
          "expression": "gently — a beat after 'wouldn't say'",
          "text": "Before. In the house. They asked him where you were and he wouldn't say. Desh told me. Six hundred dollars got them the address. Nothing got them you."
        },
        {
          "id": "nwd_fat_s2",
          "characterId": "narrator",
          "expression": "nothing. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_v9",
          "characterId": "vera",
          "expression": "barely",
          "text": "No."
        },
        {
          "id": "nwd_fat_j10",
          "characterId": "jack",
          "expression": "gently",
          "text": "Vera—"
        },
        {
          "id": "nwd_fat_v10",
          "characterId": "vera",
          "expression": "breaking, loud for the first time — THE VERTIGO BEAT. Background pulls away; she pushes forward through the five standing-shock keyframes.",
          "text": "Eleven hours. I had eleven fucking hours and his number and I sat there doing arithmetic, Jack—",
          "background": "/img/nw2/bg-diner-int.jpg",
          "backgroundTransition": "crossfade",
          "backgroundTransitionSpeed": 1.1,
          "cinematic": {
            "mode": "dolly-zoom",
            "dollyZoomDirection": "pull",
            "dollyZoomAmount": 1.5,
            "dollyZoomDuration": 8,
            "dollyZoomBlur": 4,
            "dimAmount": 0.3,
            "lights": [
              {
                "x": 26,
                "y": 26,
                "color": "#ff2e88",
                "intensity": 0.18,
                "size": 32,
                "pulseSeconds": 5,
                "pulseAmount": 0.6
              }
            ],
            "foregroundAnimation": {
              "mode": "frames",
              "frames": [
                "/assets/animations/vera/standing_shock/vera_keyframe1.png",
                "/assets/animations/vera/standing_shock/vera_keyframe2.png",
                "/assets/animations/vera/standing_shock/vera_keyframe3.png",
                "/assets/animations/vera/standing_shock/vera_keyframe4.png",
                "/assets/animations/vera/standing_shock/vera_keyframe5.png"
              ],
              "frameDuration": 0.5,
              "loops": 1
            },
            "foregroundFit": "contain",
            "foregroundX": 64,
            "foregroundY": 55,
            "foregroundAnchor": "50% 30%",
            "foregroundZoom": 1.45,
            "foregroundZoomDuration": 8
          }
        },
        {
          "id": "nwd_fat_j11",
          "characterId": "jack",
          "expression": "plain",
          "text": "I know."
        },
        {
          "id": "nwd_fat_v11",
          "characterId": "vera",
          "expression": "wrecked",
          "text": "—and he was in a kitchen not saying my name."
        },
        {
          "id": "nwd_fat_s3",
          "characterId": "narrator",
          "expression": "her crying. Short. Stopped fast, the way people cry who've taught themselves not to.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_v12",
          "characterId": "vera",
          "expression": "steadier now",
          "text": "I was going to stay."
        },
        {
          "id": "nwd_fat_j12",
          "characterId": "jack",
          "expression": "very quiet",
          "text": "I know."
        },
        {
          "id": "nwd_fat_v13",
          "characterId": "vera",
          "expression": "flat — a beat after 'told me that'",
          "text": "Had it worked out on the drive over. And now you've told me that. And I can't."
        },
        {
          "id": "nwd_fat_j13",
          "characterId": "jack",
          "expression": "low",
          "text": "That's not what I told you it for."
        },
        {
          "id": "nwd_fat_v14",
          "characterId": "vera",
          "expression": "not unkind — a beat after 'rest of my life'",
          "text": "I know. He bought me nine hours with everything he had. You bought me the rest of my life. I'm not letting a third person do it."
        },
        {
          "id": "nwd_fat_j14",
          "characterId": "jack",
          "expression": "and he doesn't argue, he just asks",
          "text": "Stay."
        },
        {
          "id": "nwd_fat_v15",
          "characterId": "vera",
          "expression": "quiet — a beat after 'since I was nineteen'",
          "text": "I want to. More than I've wanted anything since I was nineteen. That's how I know."
        },
        {
          "id": "nwd_fat_s4",
          "characterId": "narrator",
          "expression": "her standing. The booth releasing. The bag lifted.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_j15",
          "characterId": "jack",
          "expression": "quiet, and it costs him",
          "text": "In my office. Three in the morning. You started to tell me something and the phone went."
        },
        {
          "id": "nwd_fat_s5",
          "characterId": "narrator",
          "expression": "she stops.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_v16",
          "characterId": "vera",
          "expression": "after a long moment",
          "text": "Yeah."
        },
        {
          "id": "nwd_fat_j16",
          "characterId": "jack",
          "expression": "plain",
          "text": "What was it."
        },
        {
          "id": "nwd_fat_v17",
          "characterId": "vera",
          "expression": "very quiet",
          "text": "I was going to tell you everything."
        },
        {
          "id": "nwd_fat_v18",
          "characterId": "vera",
          "expression": "the confession under the confession",
          "text": "Not to confess. I'd watched you twenty minutes being good at something and I thought — he'd forgive me. Tonight. Before it's real."
        },
        {
          "id": "nwd_fat_j17",
          "characterId": "jack",
          "expression": "flat",
          "text": "Then the phone rang."
        },
        {
          "id": "nwd_fat_v19",
          "characterId": "vera",
          "expression": "plain — a beat after 'Four seconds to think'",
          "text": "Then the phone rang. Four seconds to think. I decided you'd forgive me later just as easily."
        },
        {
          "id": "nwd_fat_s6",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_v20",
          "characterId": "vera",
          "expression": "barely",
          "text": "Wrong by four seconds. And a man's dead."
        },
        {
          "id": "nwd_fat_vo4",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'I didn't answer'",
          "text": "Four seconds for her. Four seconds for me, the same night, over a question I didn't answer. I've stopped believing there's a version of that room where either of us gets it right."
        },
        {
          "id": "nwd_fat_s7",
          "characterId": "narrator",
          "expression": "her footsteps toward the door. Then stopping.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_v21",
          "characterId": "vera",
          "expression": "not turning, last thing she says",
          "text": "You're the last thing that came out of Blackwood still worth something. I'm not spending you too."
        },
        {
          "id": "nwd_fat_s8",
          "characterId": "narrator",
          "expression": "the door bell. The door opening — rain loud — then shut. Then just the diner. The fan. The rain. The song, thin.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fat_vo5",
          "characterId": "jack",
          "expression": "V.O. — spare, flat",
          "text": "She didn't look back through the window. I watched to see. She didn't, and I've decided that was a kindness, because if she had I'd have gone out after her and she knew it."
        },
        {
          "id": "nwd_fat_vo6",
          "characterId": "jack",
          "expression": "V.O. — very quiet — a beat after 'before any of it'",
          "text": "People ask what I do now. I tell them I don't. That's not true. I sit in a diner at eleven forty-seven with a coffee I don't drink, same as I did before any of it. The difference is what I'm not doing anymore. I'm not waiting. Ten years I was waiting and I didn't know it until somebody walked in and I found out what it felt like to stop."
        },
        {
          "id": "nwd_fat_vo7",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'That's all'",
          "text": "There's a building on Ash Street with the ovens still in it. Nobody's bought it. I go past it. That's all. I'm not going to make it into something — I couldn't run it and he couldn't either, that was the whole point of it. But somebody should know it's there. Somebody should be the one who knows what it was for."
        },
        {
          "id": "nwd_fat_vo8",
          "characterId": "jack",
          "expression": "V.O. — almost nothing — a beat after 'tipped a motel clerk'",
          "text": "He tipped a motel clerk. Nine days out, two hundred grand in a bag, sleeping in his shoes — and he tipped a motel clerk. I still can't put it down. I don't think I'm meant to."
        },
        {
          "id": "nwd_fat_s9",
          "characterId": "narrator",
          "expression": "the booth opposite him. Empty. He looks at it — still holding the shape of where she sat, rain-light moving across it the same way it did the first night.",
          "silent": true,
          "background": "/img/nw2/bg-empty-booth.jpg",
          "backgroundTransition": "crossfade",
          "backgroundTransitionSpeed": 1.6,
          "text": ""
        },
        {
          "id": "nwd_fat_j18",
          "characterId": "jack",
          "expression": "out loud, to nobody — a beat after 'Straight.'",
          "text": "Straight. You leave a straight line, and everybody stands in it, and none of us get out of the way."
        },
        {
          "id": "nwd_fat_vo9",
          "characterId": "jack",
          "expression": "V.O. — very quiet, and this really is the last line. A mug lifted off the table. A pause.",
          "text": "Ten years I let that coffee go cold before I ever touched it. Every night. Same cup, same distance, never once picked it up."
        },
        {
          "id": "nwd_fat_vo10",
          "characterId": "jack",
          "expression": "V.O. — almost nothing. Him drinking. Setting the mug back down — a small, ordinary sound, the only thing in the whole film that resolves.",
          "text": "Tonight I drank it anyway. Cold. Didn't matter."
        },
        {
          "id": "nwd_fat_s10",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty. Neon smearing teal and magenta across wet asphalt, same as the first frame. No car in it this time. Just the street, the rain, the sign, holding.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_finale_a_quiet",
      "title": "Part 6 — The Thing I Didn't Say",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "THE THING I DIDN'T SAY",
        "recap": "She left the way she came, and the sentence stayed in my chest where a sentence should be. I've decided that's a kindness."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.16,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The fan. The rain. The two days between what I could say and the woman in front of me.",
      "dialogueBeats": [
        {
          "id": "nwd_faq_s1",
          "characterId": "narrator",
          "expression": "silence. Neither of them touching the coffee. The song, thin, underneath.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_faq_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "She didn't ask. I didn't tell. The thing I'd carried for two days stayed in my chest where a sentence should be — and I'm keeping it there. I've decided that's a kindness."
        },
        {
          "id": "nwd_faq_s2",
          "characterId": "narrator",
          "expression": "her standing. The bag lifted. The booth releasing.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_faq_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "She left the way she came. Unhurried. The bag went with her — I only know that because I watched for it, the way I watch for everything now."
        },
        {
          "id": "nwd_faq_s3",
          "characterId": "narrator",
          "expression": "the door. Rain. The diner alone.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_faq_vo3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "I sat with it another hour. Some part of me will keep it until I die — the sentence I didn't say. It's the only thing in this whole case that was ever mine to give."
        },
        {
          "id": "nwd_faq_s4",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty. Neon smearing teal and magenta across wet asphalt, same as the first frame. One figure through the diner window, alone. The empty seat across from him holding the shape of where she sat.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_finale_b",
      "title": "Part 6 — She Stays",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The door bell. Rain swelling, then muffled. Footsteps — the same unhurried walk from the first scene.",
      "dialogueBeats": [
        {
          "id": "nwd_fb_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "Friday night. Eleven forty-seven. Same booth. I didn't plan that. I've sat in that booth at that time for ten years and one woman walking into it doesn't change a habit."
        },
        {
          "id": "nwd_fb_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "She had a bag with her. Not a big one."
        },
        {
          "id": "nwd_fb_s1",
          "characterId": "narrator",
          "expression": "the bag going onto the vinyl seat beside her, not the floor. Close enough to pick up fast. Both of them notice. Neither mentions it.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fb_v1",
          "characterId": "vera",
          "expression": "quiet",
          "text": "It's around town. By noon, like he said."
        },
        {
          "id": "nwd_fb_j1",
          "characterId": "jack",
          "expression": "plain",
          "text": "Good."
        },
        {
          "id": "nwd_fb_v2",
          "characterId": "vera",
          "expression": "not raising her voice",
          "text": "Doc Sato asked me this morning if it was true you'd stopped working. He wasn't being cruel. He wanted to know who he calls now."
        },
        {
          "id": "nwd_fb_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "Nobody. That's the trade."
        },
        {
          "id": "nwd_fb_s2",
          "characterId": "narrator",
          "expression": "rain. The fan. Neither of them touching the coffee.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fb_v3",
          "characterId": "vera",
          "expression": "not raising her voice",
          "text": "You didn't ask me."
        },
        {
          "id": "nwd_fb_j3",
          "characterId": "jack",
          "expression": "plain",
          "text": "No."
        },
        {
          "id": "nwd_fb_v4",
          "characterId": "vera",
          "expression": "plain",
          "text": "Why."
        },
        {
          "id": "nwd_fb_j4",
          "characterId": "jack",
          "expression": "honest",
          "text": "Because you'd have said no, and I'd have listened, and then you'd be carrying it."
        },
        {
          "id": "nwd_fb_s3",
          "characterId": "narrator",
          "expression": "a long pause",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fb_v5",
          "characterId": "vera",
          "expression": "the smallest break",
          "text": "That's the most anyone's ever done for me and I never got a vote in it."
        },
        {
          "id": "nwd_fb_j5",
          "characterId": "jack",
          "expression": "plain",
          "text": "I know."
        },
        {
          "id": "nwd_fb_v6",
          "characterId": "vera",
          "expression": "quiet",
          "text": "I'm not sure that's love, Jack. Might be the same thing everybody in this town does. Deciding for somebody else because you've decided you know better."
        },
        {
          "id": "nwd_fb_j6",
          "characterId": "jack",
          "expression": "after a beat, not defending it",
          "text": "Probably."
        },
        {
          "id": "nwd_fb_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare. Rain. The fan.",
          "text": "One piece of information left that was mine to give or keep. Two days I'd had it."
        }
      ],
      "choices": [
        {
          "id": "nwd_fb_tell",
          "text": "Tell her.",
          "targetSceneId": "nwd_finale_b_told",
          "attitudeTag": "Neutral"
        },
        {
          "id": "nwd_fb_silent",
          "text": "Say nothing.",
          "targetSceneId": "nwd_finale_b_quiet",
          "attitudeTag": "Neutral"
        }
      ],
      "hotspots": [],
      "onEnterActions": []
    },
    {
      "id": "nwd_finale_b_told",
      "title": "Part 6 — She Stays",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "victory-gold",
        "headline": "SHE STAYS",
        "recap": "A woman put a bag down and sat back down in a booth at eleven fifty-one on a Friday, and a sentence took three weeks to finish. In this town, that's about as close to a happy ending as anybody's ever come."
      },
      "cinematic": {
        "mode": "zoom-hold",
        "focalPoint": "44% 52%",
        "zoomDuration": 44,
        "dimAmount": 0.26,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.18,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.6
          },
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "Two days I'd had it. The booth between them, the bag on the vinyl, ten feet of the same rain.",
      "dialogueBeats": [
        {
          "id": "nwd_fbt_j7",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I need to tell you something. I've gone back and forth on whether it's a kindness."
        },
        {
          "id": "nwd_fbt_v7",
          "characterId": "vera",
          "expression": "wary",
          "text": "Okay."
        },
        {
          "id": "nwd_fbt_j8",
          "characterId": "jack",
          "expression": "flat, careful",
          "text": "They asked him where you were."
        },
        {
          "id": "nwd_fbt_s1",
          "characterId": "narrator",
          "expression": "silence. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_v8",
          "characterId": "vera",
          "expression": "very quiet",
          "text": "What?"
        },
        {
          "id": "nwd_fbt_j9",
          "characterId": "jack",
          "expression": "gently — a beat after 'wouldn't say'",
          "text": "In the house. Before. They asked him where you were and he wouldn't say. Desh told me. Six hundred dollars got them the address. Nothing got them you."
        },
        {
          "id": "nwd_fbt_s2",
          "characterId": "narrator",
          "expression": "nothing. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_v9",
          "characterId": "vera",
          "expression": "barely",
          "text": "No."
        },
        {
          "id": "nwd_fbt_j10",
          "characterId": "jack",
          "expression": "gently",
          "text": "Vera—"
        },
        {
          "id": "nwd_fbt_v10",
          "characterId": "vera",
          "expression": "breaking, loud for the first time — THE VERTIGO BEAT. Background pulls away; she pushes forward through the five standing-shock keyframes.",
          "text": "Eleven hours. I had eleven fucking hours and his number and I sat there doing arithmetic, Jack—",
          "background": "/img/nw2/bg-diner-int.jpg",
          "backgroundTransition": "crossfade",
          "backgroundTransitionSpeed": 1.1,
          "cinematic": {
            "mode": "dolly-zoom",
            "dollyZoomDirection": "pull",
            "dollyZoomAmount": 1.5,
            "dollyZoomDuration": 8,
            "dollyZoomBlur": 4,
            "dimAmount": 0.3,
            "lights": [
              {
                "x": 26,
                "y": 26,
                "color": "#ff2e88",
                "intensity": 0.18,
                "size": 32,
                "pulseSeconds": 5,
                "pulseAmount": 0.6
              }
            ],
            "foregroundAnimation": {
              "mode": "frames",
              "frames": [
                "/assets/animations/vera/standing_shock/vera_keyframe1.png",
                "/assets/animations/vera/standing_shock/vera_keyframe2.png",
                "/assets/animations/vera/standing_shock/vera_keyframe3.png",
                "/assets/animations/vera/standing_shock/vera_keyframe4.png",
                "/assets/animations/vera/standing_shock/vera_keyframe5.png"
              ],
              "frameDuration": 0.5,
              "loops": 1
            },
            "foregroundFit": "contain",
            "foregroundX": 64,
            "foregroundY": 55,
            "foregroundAnchor": "50% 30%",
            "foregroundZoom": 1.45,
            "foregroundZoomDuration": 8
          }
        },
        {
          "id": "nwd_fbt_j11",
          "characterId": "jack",
          "expression": "plain",
          "text": "I know."
        },
        {
          "id": "nwd_fbt_v11",
          "characterId": "vera",
          "expression": "wrecked",
          "text": "—and he was in a kitchen not saying my name."
        },
        {
          "id": "nwd_fbt_s3",
          "characterId": "narrator",
          "expression": "her crying. Short. Stopped fast, the way people cry who've taught themselves not to.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_s4",
          "characterId": "narrator",
          "expression": "MUSIC — the song enters, stripped, a fragment, low. Same melody as the Interlude. It does not swell. Rain, under the music. A long hold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_s5",
          "characterId": "narrator",
          "expression": "the bag being lifted off the seat. Her standing.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_vo4",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "And she did it. I want that written down somewhere. She actually did it."
        },
        {
          "id": "nwd_fbt_v12",
          "characterId": "vera",
          "expression": "standing, steady, and she means every word",
          "text": "I'm going to go."
        },
        {
          "id": "nwd_fbt_j12",
          "characterId": "jack",
          "expression": "not moving",
          "text": "Okay."
        },
        {
          "id": "nwd_fbt_v13",
          "characterId": "vera",
          "expression": "flat, the speech she's been building since the lot — a beat after 'rest of my life'",
          "text": "He bought me nine hours with everything he had. You bought me the rest of my life. I'm not letting a third person do it. I'm not going to stand next to you until the arithmetic gets to you too."
        },
        {
          "id": "nwd_fbt_j13",
          "characterId": "jack",
          "expression": "quiet",
          "text": "Okay."
        },
        {
          "id": "nwd_fbt_v14",
          "characterId": "vera",
          "expression": "sharper, because he isn't fighting her",
          "text": "Don't do that. Say something."
        },
        {
          "id": "nwd_fbt_j14",
          "characterId": "jack",
          "expression": "flat, and this is the cruelest thing he does in the whole film, and he does it by being honest — a beat after 'till Tuesday'",
          "text": "There's a bus at six. There won't be another one till Tuesday. I'm not going to stop you and I'm not going to ask you to stay. I asked you for something once already and I didn't have the right."
        },
        {
          "id": "nwd_fbt_s6",
          "characterId": "narrator",
          "expression": "visual — rain, the fan. Vera at the end of the booth, bag in hand, coat on. Everything about the frame says a woman leaving. She does not move.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_vo5",
          "characterId": "jack",
          "expression": "V.O. — very quiet — a beat after 'I looked'",
          "text": "Eleven forty-nine. I know because I looked. She stood there for two minutes with a bag in her hand and I watched a person try to be better than this town and find out she's from here."
        },
        {
          "id": "nwd_fbt_s7",
          "characterId": "narrator",
          "expression": "rain. The song underneath. A very long hold — longer than is comfortable.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_v15",
          "characterId": "vera",
          "expression": "not moving, and her voice has changed — smaller, and no longer performing conviction",
          "text": "I don't have anywhere to go."
        },
        {
          "id": "nwd_fbt_j15",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I know."
        },
        {
          "id": "nwd_fbt_v16",
          "characterId": "vera",
          "expression": "breaking, quietly — a beat after 'to go, Jack'",
          "text": "That's not — I mean I have money. I have two hundred and eleven thousand dollars and a bus at six and I don't have anywhere to go, Jack. There isn't a place. I've been doing arithmetic since I was nineteen and I never once did it on what happens after."
        },
        {
          "id": "nwd_fbt_s8",
          "characterId": "narrator",
          "expression": "rain. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_v17",
          "characterId": "vera",
          "expression": "very quiet",
          "text": "I thought there'd be a place."
        },
        {
          "id": "nwd_fbt_s9",
          "characterId": "narrator",
          "expression": "a long silence. Then — the bag being set back down on the vinyl seat. Not dropped. Placed. Her hand staying on it a second too long.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_vo6",
          "characterId": "jack",
          "expression": "V.O. — spare, flat, no relief in it at all",
          "text": "That's the sound. If you want to know the exact moment — that's it. A bag going back down on a vinyl seat at eleven fifty-one at night."
        },
        {
          "id": "nwd_fbt_s10",
          "characterId": "narrator",
          "expression": "her sitting back down. The booth creaking. Rain. A very long silence — the song, thin, underneath. Neither of them speaks.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_v18",
          "characterId": "vera",
          "expression": "eventually, not looking up",
          "text": "I should go."
        },
        {
          "id": "nwd_fbt_j16",
          "characterId": "jack",
          "expression": "flat",
          "text": "Yeah."
        },
        {
          "id": "nwd_fbt_v19",
          "characterId": "vera",
          "expression": "quiet — rain, the fan, neither of them moves",
          "text": "I'm not going to."
        },
        {
          "id": "nwd_fbt_j17",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I know."
        },
        {
          "id": "nwd_fbt_vo7",
          "characterId": "jack",
          "expression": "V.O. — spare — the song underneath, not resolving; a beat after 'a letter'",
          "text": "And that's it. That's the whole ending. Nobody drove off. Nobody said anything that would look good in a letter. A woman put a bag down and sat back down in a booth, and the two of us started the long part."
        },
        {
          "id": "nwd_fbt_vo8",
          "characterId": "jack",
          "expression": "V.O. — flat — a long hold, rain; the fan; a beat after 'a door'",
          "text": "I've thought a lot about what I bought off Solomon that morning. I thought I was buying her a door. He knew better. He told me on the stairs and I didn't listen, because listening would have meant knowing what I actually wanted, which was for her to have the door and not use it."
        },
        {
          "id": "nwd_fbt_vo9",
          "characterId": "jack",
          "expression": "V.O. — very quiet — rain, the song",
          "text": "I got exactly that. Every part of it. Whatever else I've lost, I want to be clear that I got what I wanted."
        },
        {
          "id": "nwd_fbt_s11",
          "characterId": "narrator",
          "expression": "visual — the two of them in the booth, some hours later, the diner emptier, the light greyer. Not touching. Not talking. Two coffees between them, both untouched, both cold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_vo10",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'losing them'",
          "text": "People think the hard part is losing them. The hard part is the part after. Where you got what you wanted, and it's sitting across the table looking at you, and neither of you can think of the thing to say that makes a man in a yard four hours north any less dead."
        },
        {
          "id": "nwd_fbt_vo11",
          "characterId": "jack",
          "expression": "V.O. — almost nothing — rain, the fan, the song thinning; a beat after 'tipped a motel clerk'",
          "text": "He tipped a motel clerk. Nine days out, two hundred grand in a bag, sleeping in his shoes — and he tipped a motel clerk. I still can't put it down. Neither can she. That's most of what we've got in common now, and it's more than some people have."
        },
        {
          "id": "nwd_fbt_s12",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_v20",
          "characterId": "vera",
          "expression": "quiet, out of nowhere, the first thing either of them has said in a long time",
          "text": "Doors."
        },
        {
          "id": "nwd_fbt_j18",
          "characterId": "jack",
          "expression": "low",
          "text": "What?"
        },
        {
          "id": "nwd_fbt_v21",
          "characterId": "vera",
          "expression": "not looking up — rain, the fan",
          "text": "He used to say a shut door is just a wall that's lying about it."
        },
        {
          "id": "nwd_fbt_v22",
          "characterId": "vera",
          "expression": "barely — a beat after 'Three weeks.'",
          "text": "I remembered it. Three weeks. I've been trying to remember it for three weeks."
        },
        {
          "id": "nwd_fbt_s13",
          "characterId": "narrator",
          "expression": "silence. Neither of them says anything else.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_vo12",
          "characterId": "jack",
          "expression": "V.O. — very quiet, and this really is the last line — a beat after 'came back'",
          "text": "She got it back. That's the one thing that came back. Eleven fifty-one on a Friday, a woman put a bag down and a sentence took three weeks to finish, and in this town that's about as close to a happy ending as anybody's ever come."
        },
        {
          "id": "nwd_fbt_s14",
          "characterId": "narrator",
          "expression": "the song — holding — then not resolving. It stops, the way the vocal does. Rain. The fan. Silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbt_s15",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty — same as the first frame of the film. The diner's neon smearing teal and magenta across wet asphalt. Two figures visible through the diner window this time, small, still, sitting opposite each other. Not moving.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_finale_b_quiet",
      "title": "Part 6 — The Thing I Didn't Say",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "THE THING I DIDN'T SAY",
        "recap": "She left. The bag went with her, and so did the eleven hours. I kept the booth. I don't know what I'm keeping it for."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.3,
        "lights": [
          {
            "x": 72,
            "y": 36,
            "color": "#2ad9d9",
            "intensity": 0.14,
            "size": 36,
            "pulseSeconds": 6,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The fan. The rain. The bag on the vinyl seat, close enough to pick up fast. Neither of them touching it.",
      "dialogueBeats": [
        {
          "id": "nwd_fbq_s1",
          "characterId": "narrator",
          "expression": "silence. Neither of them touching the coffee. The song, thin, underneath.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbq_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "She didn't ask. I didn't tell. I let the two days stay between us where I'd put them — and I'm keeping them there now. Some things you only get once, and I've decided the sentence was one of them."
        },
        {
          "id": "nwd_fbq_s2",
          "characterId": "narrator",
          "expression": "her standing. The bag lifted. The booth releasing. No look back she could owe me, and no one to owe it to.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbq_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "She left the way she came. Unhurried. I watched the window the way you watch a road — not to stop her, just to know exactly when she wasn't there anymore."
        },
        {
          "id": "nwd_fbq_s3",
          "characterId": "narrator",
          "expression": "the door. Rain. The diner alone. The song, thin, underneath.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fbq_vo3",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "I sat with it another hour. The bag went with her, and so did the eleven hours, and so did the sentence. I kept the booth. I don't know what I'm keeping it for."
        },
        {
          "id": "nwd_fbq_s4",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty. Neon smearing teal and magenta across wet asphalt, same as the first frame. One figure through the diner window, alone. The empty seat across from him holding the shape of where she sat.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_finale_c",
      "title": "Part 6 — A Stopped Watch",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "victory-silver",
        "headline": "A STOPPED WATCH",
        "recap": "Six o'clock. Depot. Cash ticket, no destination. She'd have been three counties out before Solomon said her name. Nobody gets out of here. She did."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.32,
        "lights": [
          {
            "x": 26,
            "y": 26,
            "color": "#ff2e88",
            "intensity": 0.14,
            "size": 32,
            "pulseSeconds": 5,
            "pulseAmount": 0.5
          }
        ]
      },
      "prose": "The Blackwood Diner. Rain on the window. The ceiling fan.",
      "dialogueBeats": [
        {
          "id": "nwd_fc_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "Friday night. Eleven forty-seven. Same booth."
        },
        {
          "id": "nwd_fc_s1",
          "characterId": "narrator",
          "expression": "the fan. Rain. Nothing else.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Eleven fifty-two."
        },
        {
          "id": "nwd_fc_s2",
          "characterId": "narrator",
          "expression": "the fan. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo3",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "Twelve ten."
        },
        {
          "id": "nwd_fc_s3",
          "characterId": "narrator",
          "expression": "a long hold. The fan. The rain. No door bell.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo4",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "I'd like to say I knew at midnight. I didn't. I sat there till gone one like a man waiting for a bus that runs on Sundays."
        },
        {
          "id": "nwd_fc_s4",
          "characterId": "narrator",
          "expression": "the door bell — finally. Footsteps. Heavier than hers.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_s5",
          "characterId": "narrator",
          "expression": "Rosa in the doorway, coat wet, not sitting down yet. She's holding something small.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_r1",
          "characterId": "rosa",
          "expression": "quiet",
          "text": "Jack."
        },
        {
          "id": "nwd_fc_j1",
          "characterId": "jack",
          "expression": "not looking up",
          "text": "Don't."
        },
        {
          "id": "nwd_fc_r2",
          "characterId": "rosa",
          "expression": "sitting anyway — a beat after 'the stub'",
          "text": "Six o'clock this morning. Depot. Cash ticket, no destination on the stub — you buy those in stages so nobody can follow the paper. She'd have been three counties out before Solomon said her name."
        },
        {
          "id": "nwd_fc_s6",
          "characterId": "narrator",
          "expression": "rain. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "She knew what it cost."
        },
        {
          "id": "nwd_fc_r3",
          "characterId": "rosa",
          "expression": "gently — a beat after 'the other way'",
          "text": "Doc Sato told her Thursday night. He's one of the two men Solomon tells things to. Has been for years. Only this once he ran it the other way."
        },
        {
          "id": "nwd_fc_r3b",
          "characterId": "rosa",
          "expression": "gently — a beat after 'the sun came up'",
          "text": "She was at the depot before the sun came up. She didn't wait to find out if you'd go through with it. She left so that you couldn't be talked out of it."
        },
        {
          "id": "nwd_fc_s7",
          "characterId": "narrator",
          "expression": "something small set on the table. A soft weight.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_s8",
          "characterId": "narrator",
          "expression": "a man's watch, stopped, leather band cracked with age. The same watch from the Interlude.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_j3",
          "characterId": "jack",
          "expression": "after a long moment",
          "text": "There's no note."
        },
        {
          "id": "nwd_fc_r4",
          "characterId": "rosa",
          "expression": "quiet",
          "text": "No."
        },
        {
          "id": "nwd_fc_s9",
          "characterId": "narrator",
          "expression": "rain. The fan. Jack not picking it up.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo5",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "No note. She'd have known I'd read a note about four thousand times and get a different answer out of it every time."
        },
        {
          "id": "nwd_fc_s10",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo6",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "So she left the one thing she'd never once let out of that box, and let me work out what it meant on my own."
        },
        {
          "id": "nwd_fc_s11",
          "characterId": "narrator",
          "expression": "MUSIC — the song enters, stripped, a fragment, low. Same melody as the Interlude.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo7",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'nine seconds'",
          "text": "Took me about nine seconds. Took a lot longer to stop being angry about how well she knew me."
        },
        {
          "id": "nwd_fc_s12",
          "characterId": "narrator",
          "expression": "rain, under the music. Rosa not speaking.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_r5",
          "characterId": "rosa",
          "expression": "eventually",
          "text": "I'm not going to ask what you did yesterday morning."
        },
        {
          "id": "nwd_fc_j4",
          "characterId": "jack",
          "expression": "flat",
          "text": "Good."
        },
        {
          "id": "nwd_fc_r6a",
          "characterId": "rosa",
          "expression": "standing — a beat after 'somebody else's problem'",
          "conditionRule": {
            "requiresFlags": [
              "rosa_acknowledged"
            ]
          },
          "text": "I filed the transfer, Jack. Monday I'm somebody else's problem. I'd have stayed if there'd been anything here to stay for. That's not about you."
        },
        {
          "id": "nwd_fc_r6b",
          "characterId": "rosa",
          "expression": "standing",
          "conditionRule": {
            "excludesFlags": [
              "rosa_acknowledged"
            ]
          },
          "text": "I filed the transfer, Jack. Monday I'm somebody else's problem."
        },
        {
          "id": "nwd_fc_j5",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I know."
        },
        {
          "id": "nwd_fc_r7",
          "characterId": "rosa",
          "expression": "at the door, not turning — a beat after 'she got out'",
          "text": "For what it's worth — she got out. Nobody gets out of here. She did."
        },
        {
          "id": "nwd_fc_s13",
          "characterId": "narrator",
          "expression": "the bell. The door. Rain swelling, then muffled.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_s14",
          "characterId": "narrator",
          "expression": "the diner. The fan. The rain. The song, thin, underneath.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo8",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'Didn't pick it up'",
          "text": "I sat with it another hour. Didn't pick it up. Some part of me had decided that as long as it stayed on the table it was still a thing being handed to me, and once it was in my pocket it was just a watch that doesn't work."
        },
        {
          "id": "nwd_fc_s15",
          "characterId": "narrator",
          "expression": "a long hold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo9",
          "characterId": "jack",
          "expression": "V.O. — very quiet — a beat after 'never wore it once'",
          "text": "Her father wore that for nine years while he paid on four thousand pounds. She kept it in a shoebox and never wore it once. And she gave it to me — nine days, that's all I'd known her — and got on a bus."
        },
        {
          "id": "nwd_fc_s16",
          "characterId": "narrator",
          "expression": "rain. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo10",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'I tell them I don't'",
          "text": "People ask what I do now. I tell them I don't. That's not true. I sit in a diner at eleven forty-seven and I have a coffee I don't drink, same as I did before any of it."
        },
        {
          "id": "nwd_fc_s17",
          "characterId": "narrator",
          "expression": "a mug being lifted. A pause.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_vo11",
          "characterId": "jack",
          "expression": "V.O. — almost nothing — a beat after 'all those years'",
          "text": "Difference is I know what I was doing all those years. And I know it worked, once, for nine days."
        },
        {
          "id": "nwd_fc_s18",
          "characterId": "narrator",
          "expression": "him drinking. Setting the mug down — small, ordinary.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_s19",
          "characterId": "narrator",
          "expression": "the song — holding — then stopping, unresolved. Rain. The fan. Silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fc_s20",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty. Neon on wet asphalt. One figure through the diner window, alone, a small object on the table in front of him.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
    {
      "id": "nwd_finale_d",
      "title": "Part 6 — Ten Past Nine",
      "background": "/img/nw2/bg-diner-int.jpg",
      "ambientAudio": "rain",
      "particles": "rain",
      "transition": "fade",
      "musicMode": "track",
      "musicUrl": "/nobodys-witness.mp3",
      "isEnding": true,
      "endingData": {
        "tier": "gameover",
        "headline": "TEN PAST NINE",
        "recap": "He got both of us for one debt. Ten past nine. We queued up, and neither of us has anything."
      },
      "cinematic": {
        "mode": "static",
        "dimAmount": 0.34,
        "lights": [
          {
            "x": 50,
            "y": 20,
            "color": "#5a6b8a",
            "intensity": 0.2,
            "size": 40,
            "pulseSeconds": 6,
            "pulseAmount": 0.3
          }
        ]
      },
      "prose": "The Blackwood Diner. Rain on the window. The ceiling fan. Identical to the opening.",
      "dialogueBeats": [
        {
          "id": "nwd_fd_vo1",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "Friday night. Eleven forty-seven. Same booth. I'd spent the morning buying something and I hadn't checked the receipt."
        },
        {
          "id": "nwd_fd_s1",
          "characterId": "narrator",
          "expression": "the door bell. Rain swelling, then muffled. Footsteps.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_s2",
          "characterId": "narrator",
          "expression": "Vera in the doorway. No bag. That's the first thing wrong — every version of this ends with a bag, and there isn't one.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo2",
          "characterId": "jack",
          "expression": "V.O. — flat",
          "text": "No bag."
        },
        {
          "id": "nwd_fd_s3",
          "characterId": "narrator",
          "expression": "the booth creaking. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_v1",
          "characterId": "vera",
          "expression": "quiet",
          "text": "It's around town. By noon, like he said."
        },
        {
          "id": "nwd_fd_j1",
          "characterId": "jack",
          "expression": "plain",
          "text": "Good."
        },
        {
          "id": "nwd_fd_v2",
          "characterId": "vera",
          "expression": "not looking at him",
          "text": "What time did you go up there."
        },
        {
          "id": "nwd_fd_s4",
          "characterId": "narrator",
          "expression": "the fan. A beat.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_j2",
          "characterId": "jack",
          "expression": "flat",
          "text": "Ten past nine."
        },
        {
          "id": "nwd_fd_s5",
          "characterId": "narrator",
          "expression": "nothing. Rain. She doesn't react at all, which is the reaction.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_v3",
          "characterId": "vera",
          "expression": "after a long moment",
          "text": "I was there at eight."
        },
        {
          "id": "nwd_fd_s6",
          "characterId": "narrator",
          "expression": "the fan. The rain. Jack not moving.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_j3",
          "characterId": "jack",
          "expression": "very quiet",
          "text": "Say that again."
        },
        {
          "id": "nwd_fd_v4",
          "characterId": "vera",
          "expression": "flat, no performance in it — a beat after 'the whole number'",
          "text": "Eight o'clock. I offered him everything I had. Same as you did, near enough — my name on all of it, the whole number, nobody else on the paper. He took it. He said thank you. He shook my hand."
        },
        {
          "id": "nwd_fd_j4",
          "characterId": "jack",
          "expression": "barely",
          "text": "He didn't tell me."
        },
        {
          "id": "nwd_fd_v5",
          "characterId": "vera",
          "expression": "flat",
          "text": "No. He wouldn't."
        },
        {
          "id": "nwd_fd_s7",
          "characterId": "narrator",
          "expression": "a long silence. The fan turning.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo3",
          "characterId": "jack",
          "expression": "V.O. — spare — a beat after 'four seconds'",
          "text": "I want to describe what that felt like and the honest answer is that it didn't feel like anything for about four seconds. It was too big to get into a body that fast."
        },
        {
          "id": "nwd_fd_v6",
          "characterId": "vera",
          "expression": "quiet — a beat after 'one debt, Jack'",
          "text": "He got both of us for one debt, Jack. That's not cruelty. That's just him being good at it."
        },
        {
          "id": "nwd_fd_s8",
          "characterId": "narrator",
          "expression": "rain. Neither of them touching the coffee.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_j5",
          "characterId": "jack",
          "expression": "flat",
          "text": "Then what did he take off me."
        },
        {
          "id": "nwd_fd_v7",
          "characterId": "vera",
          "expression": "and this is the worst answer available",
          "text": "Everything you offered him."
        },
        {
          "id": "nwd_fd_s9",
          "characterId": "narrator",
          "expression": "the fan. A long hold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_v8",
          "characterId": "vera",
          "expression": "not unkind — a beat after 'put it on the desk'",
          "text": "He didn't have to do anything, love. You walked up his stairs and put it on the desk. He'd have been rude to refuse."
        },
        {
          "id": "nwd_fd_s10",
          "characterId": "narrator",
          "expression": "MUSIC — the song enters, stripped, low, a fragment. It does not swell. It sounds smaller than it did in the Interlude.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo4",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "Sixteen years. Eleven months at an empty desk. Ten years of nothing after, all of it built on one file I wouldn't hand over."
        },
        {
          "id": "nwd_fd_s11",
          "characterId": "narrator",
          "expression": "rain, under the music.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo5",
          "characterId": "jack",
          "expression": "V.O. — very quiet",
          "text": "I gave it away on a Friday morning to buy something that had already been bought at eight."
        },
        {
          "id": "nwd_fd_s12",
          "characterId": "narrator",
          "expression": "a long silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_v9",
          "characterId": "vera",
          "expression": "eventually",
          "text": "I'd have told you. If you'd asked me anything at all this week, I'd have told you."
        },
        {
          "id": "nwd_fd_j6",
          "characterId": "jack",
          "expression": "flat",
          "text": "I know."
        },
        {
          "id": "nwd_fd_v10",
          "characterId": "vera",
          "expression": "quiet",
          "text": "You didn't ask."
        },
        {
          "id": "nwd_fd_j7",
          "characterId": "jack",
          "expression": "quiet",
          "text": "I know."
        },
        {
          "id": "nwd_fd_s13",
          "characterId": "narrator",
          "expression": "rain. The fan. The song underneath.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo6",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "That's the whole of it. Not a twist. Not a trap. Two people paid the same debt twice because neither of us could stand to ask the other one a question."
        },
        {
          "id": "nwd_fd_s14",
          "characterId": "narrator",
          "expression": "a long hold.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_v11",
          "characterId": "vera",
          "expression": "after a while, flat",
          "text": "So we're both clear."
        },
        {
          "id": "nwd_fd_j8",
          "characterId": "jack",
          "expression": "flat",
          "text": "We're both clear."
        },
        {
          "id": "nwd_fd_v12",
          "characterId": "vera",
          "expression": "a small, terrible laugh — the only laugh in the film",
          "text": "And neither of us has anything."
        },
        {
          "id": "nwd_fd_s15",
          "characterId": "narrator",
          "expression": "rain. The fan.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo7",
          "characterId": "jack",
          "expression": "V.O. — spare",
          "text": "She stayed about twenty minutes. We didn't say much. There wasn't a decision to make — nobody was leaving, nobody was staying, we just both happened to be in Blackwood on a Friday with nothing left to spend."
        },
        {
          "id": "nwd_fd_s16",
          "characterId": "narrator",
          "expression": "the booth. Rain.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo8",
          "characterId": "jack",
          "expression": "V.O. — flat — a beat after 'never raised his voice once'",
          "text": "He owns the only two people in this town who ever told him no. He never raised his voice once. He didn't have to. We queued up."
        },
        {
          "id": "nwd_fd_s17",
          "characterId": "narrator",
          "expression": "the song thinning.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_vo9",
          "characterId": "jack",
          "expression": "V.O. — very quiet — a beat after 'tipped a motel clerk'",
          "text": "He tipped a motel clerk. Nine days out, two hundred grand in a bag, sleeping in his shoes — and he tipped a motel clerk. I think about that instead of thinking about the rest of it. It's the only thing left that anybody did for no reason."
        },
        {
          "id": "nwd_fd_s18",
          "characterId": "narrator",
          "expression": "the song — holding — then stopping mid-phrase. Rain. The fan. Silence.",
          "silent": true,
          "text": ""
        },
        {
          "id": "nwd_fd_s19",
          "characterId": "narrator",
          "expression": "the bookend: Blackwood's main street at night, empty. Neon on wet asphalt. Two figures visible through the diner window, sitting opposite each other, not talking.",
          "silent": true,
          "background": "/img/nw2/bg-final-street.jpg",
          "backgroundTransition": "fade-black",
          "backgroundTransitionSpeed": 2.2,
          "text": ""
        }
      ],
      "choices": [],
      "hotspots": []
    },
  ]
};
