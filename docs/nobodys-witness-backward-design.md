# Nobody's Witness — backward design ledger

Act Three is written in full (Parts 1 → 6). This document records what the
ending consumes and where each piece is now produced.

---

## 1. The spine flag

**`nw2_never_took`** is set once, at the cold open, and can only ever be
cleared. It is the only thing Jack owns that Solomon wants, so losing it
removes the gold trade in Part 5 — silently, with no warning.

```
nw2_never_took ─── intact ──▶ "Put it on me."     → gold path
                └─ cleared ──▶ Solomon: "You can't sell me
                               a thing I already own."  → nw2_end_bought
```

There is exactly **one** place it can be lost: Moe puts four hundred dollars
on the bar in Part 4b. It is deliberately the most sympathetic offer in the
film — owed wages, rent due, rain under the office door, and nobody says the
word "bribe". *You arrive at the number by yourself.*

The player is never told the flag exists. They find out at the top of the feed
store stairs, which is when Jack finds out too.

---

## 2. The second axis: `nw2_desh_told_me`

Desh's parting line — *"Six hundred bucks got us the house. Nothing got us
her."* — is the entire back half of Part 6. It is only spoken to a man who
**did not swing**.

| Part 4b action | Outcome |
|---|---|
| Ask "Would you fight back?" | Earns the disclosure |
| Let the 4-second window expire | Earns the disclosure (restraint by hesitation) |
| **Swing at Moe** | Desh opens his mouth, looks at the floor, shuts it. Lost forever. |
| Take the four hundred | Earns the disclosure, but the trade is already dead |

Violence costs information. That is the whole mechanic.

---

## 3. The four-second rhyme

Part 6 says it twice: *"Four seconds for her. Four seconds for me, the same
night."* Both now exist in play:

- **Vera's four seconds** — the 3 a.m. confession the phone interrupted, told
  in Part 6 (`nw2_four_seconds`, set at the yard in Part 1).
- **Jack's four seconds** — the literal QTE at the pool hall. `timeLimitSeconds:
  4`, heartbeat, shaky cam. Letting it lapse *is* the canonical path.
- **Jack's four rings** — Part 1's cold open, the same beat in a third key.

---

## 4. Verified paths

All six simulated end-to-end from `nw2_coldopen`:

| Path | Ending | Tier |
|---|---|---|
| Asks Moe → tells Vera | `nw2_final_street` | **victory-gold** |
| QTE expires → tells Vera | `nw2_final_street` | victory-gold |
| Asks Moe → withholds | `nw2_end_kept` | victory-silver |
| **Swings at Moe** | `nw2_end_nothing` | victory-silver |
| **Takes the four hundred** | `nw2_end_bought` | gameover |
| Refuses the case in the diner | `nw2_end_refusal` | victory-silver |
| **Pays with the licence (V2)** | `nw2_end_stayed` | victory-silver |

`nw2_end_nothing` exists because routing the swung-at-Moe path into
`nw2_end_kept` accused Jack of withholding something he was never given —
a different sin, and not his.

---

## 5. Where each consumed fact is produced

| Flag | Produced in |
|---|---|
| `nw2_never_took` | cold open (seed) · cleared only in Part 4b |
| `nw2_david_dead`, `nw2_four_seconds` | Part 1, the yard |
| `nw2_rosa_transfer` | Part 2, Rosa's car |
| `nw2_knows_voss_debt` ($211k) | Part 3, the mill lot |
| `nw2_knows_kessler_debt` ($11k, 2011 furnace) | Part 3 |
| `nw2_vera_maiden_kessler` | Part 3 |
| `nw2_vera_tipped` (the eleven hours) | Part 3 |
| `nw2_knows_motel_tip` | Part 3 |
| `nw2_friday_clock`, `nw2_vera_confessing` | Part 4, Rosa driving |
| `nw2_desh_told_me` | Part 4b, on the way out |
| `nw2_signed`, `nw2_debt_closed` | Part 5, Solomon's office |

---

## 6. Scene map

```
nw2_coldopen → nw2_signature → nw2_diner ─┬─ nw2_refuse → nw2_end_refusal
                                          └─ nw2_take → nw2_deal → nw2_bookend
                                                                       │ ACT THREE
  nw2_p1_call → nw2_p1_after → nw2_p2_rosa → nw2_p3_mill → nw2_p3_after
    → nw2_p4_cost → nw2_p4b_poolhall → nw2_p4b_door → nw2_p5_office
      ├─ (bought) ────────────────────────────→ nw2_end_bought
      └─ nw2_p6_booth ─┬─ nw2_p6_told → nw2_final_street
                       ├─ nw2_end_kept
                       └─ nw2_end_nothing
```

`nw2_bookend` is the Act Two/Three break, not an ending: the signature shot
with the car **still in it**. `nw2_final_street` is the identical frame with
the car **gone** — Jack works for Solomon now, and men who work for Solomon
don't park on Main.

---

## 7. Version 2 — the licence price

Version 2 turned out not to be an alternate *ending* but an alternate
**price**, so the fork sits in Part 5 where the price is named. Solomon asks
what Jack imagines he has that's worth $222,000:

| Reply | What Jack sells | Result |
|---|---|---|
| "Put it on me." | The refusal itself | Becomes Solomon's man, stays an investigator → **V1** |
| "Nothing. That's not what I'm paying with." | Licence + sixteen years of files | Stops being an investigator, owes Solomon nothing → **V2** |

Same debt, same room, same morning, opposite purchases.

**The endings invert.** V1 closes on refusal — the car gone from the frame.
V2 closes on the town's own logic applied to a marriage: you don't pay a debt
off in Blackwood, you pay *on* it, forever, and hand it to whoever's left.
Vera has the money, the bus and the rest of her life, and nowhere to go —
because nobody here ever does the arithmetic on what happens after. The bag
goes back down. They stay, and become the thing they're both paying on.

Solomon seeds it on the stairs: *"You've bought her the ability to leave. I'd
want to be sure that's the same thing as her leaving."*

Scenes: `nw2_p6_bag` → `nw2_p6_stay` → `nw2_end_stayed`.

**Beat isolation verified:** the seven loyalty beats were regated from
`nw2_never_took` to `nw2_offered_loyalty`. Loyalty plays 19/37 beats, licence
plays 28/37, zero overlap.

**Withholding on the licence path** routes to the bag, not `nw2_end_kept` —
that ending has Vera leaving town, which is impossible in V2. The secret
still costs her the truth; it no longer costs her the booth.

---

## 8. Versions 3–4

Not yet supplied. Both will likely hang off:

- answering Vera at 3 a.m. instead of the phone
- `nw2_never_took` cleared
- never earning Desh's account
