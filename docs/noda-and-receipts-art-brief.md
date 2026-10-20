# Mrs Noda and Jack’s papers — next art pass

**Planning notes only.** No changes were made to the screenplay, shipped stills, character sheets, or camera settings for Mrs Noda or the papers. This brief is to make the next pass easy to implement.

## Character-depth example

For a real, already-integrated character-layer example, use `nw_s25` / **200-the-number-114** (Jack and Vera). It has a depth map, a painted plate, and two cut-outs, and exercises the same engine path as the people-free maps. Open the live preview at `/?story=nobodys-witness-film&scene=nw_s25` to see it; no new person map was generated in this pass.

## Mrs Noda

### Likely target

Assumption: “her scene” means scene 37, **The keys are always in it** (`src/film/story.json`, scene `37`). It is her dedicated exchange with Jack on the back step. Scenes 44 and 46 are the later raid and pantry beats; keep their events and timing separate unless those are the intended target.

### Existing visual references and continuity to resolve

- `public/film/img/sheets/mrs-noda.jpg` is an older individual sheet: her hair is tied back and she wears a dark green work jacket.
- `public/film/img/roadside/style-sheets/noda-couple.jpg` is the current roadside reference, but it is a full lobby/location frame, not a clean individual model sheet. Mrs Noda has short grey hair, a beige cardigan and a faded apron there.
- `public/film/img/roadside/style-sheets/continuity.md` locks her as a Japanese woman in her 70s, short grey perm, beige knitted cardigan over a faded print apron, slippers; she smokes on the back step.
- Shipped scene still: `public/film/img/s37/209-the-keys-are-always-in-it.jpg` (Mrs Noda and Jack under the eave). Treat it as a composition/wardrobe reference, not a replacement for a face authority.

**Suggested next asset:** a dedicated `public/film/img/roadside/style-sheets/mrs-noda.jpg`, separate from Mr Noda and the location. Make it the roadside authority; decide explicitly whether the old `sheets/mrs-noda.jpg` is a superseded cross-film reference or whether its jacket/hair should be reconciled before any new frames are made.

**Sheet checklist:** neutral uncluttered backdrop; front, three-quarter and profile views; face close-up; consistent short grey hair and age; cardigan/apron/slippers; cigarette and hand reference; a small expression row covering dry humour, guarded worry, and alert fear. Avoid adding jewelry, a new coat, or other wardrobe details not established in the roadside set.

### Scene-37 improvement notes — do not rewrite yet

Current spine: Jack cannot sleep and finds her outside; she opens with “Don’t tell my husband”; Jack says “I quit”; she explains why she does not want him to know; she offers the cigarette; the badly parked pickup and its key become the practical escape clue. Preserve the cigarette, the truck/key information, and the scene’s quiet, rainy pause.

For a future revision, make the exchange’s emotional logic legible: what Mrs Noda is asking Jack to keep secret, what his “I quit” means to her, and why she chooses to help him. Let her make the decision through a small, observable action rather than added exposition. Build the visual beat around the open back door/eave, the two-shot, her cigarette/hand, then Jack noticing the pickup; end on the key clue and his decision, not an extra explanation. Keep the inn geography in `public/film/img/roadside/style-sheets/continuity.md` and do not alter the escape route or the later raid continuity as part of this pass.

Potential staging order for the eventual pass: establish the back door and rain; hold a two-shot with her already settled on the step; give her the first active gesture; let Jack’s answer land; use the pickup as the final visual beat. This is a direction for the writer/artist, not replacement dialogue or a shot list to ship unchanged.

## Jack’s “invoices” / receipts

The film currently calls these **Sakai’s receipts**, not invoices. The references are `public/film/img/s29/273-the-receipts.jpg`, Jack studying them in scene 34 (`public/film/img/s34/172-twenty-years-of-januaries.jpg`), taking them in scene 39 (`public/film/img/s39/461-takes-nothing-else.jpg`), and the soaked papers in scene 50 (`public/film/img/s50/464-soaked-and-creased.jpg`). The story describes carbon copies, handwritten and yellowed; the visible anchor is **KATO RENTAL LOCKERS, UENO**, **No. 114**, with a twenty-January run.

**Prop reference sheet created:** `public/film/img/sheets/sakai-receipts.jpg` (option 2 selected). Use it as the canonical visual reference for the bundle’s narrow format, yellowed carbon-copy paper, thin red-brown elastic band, and sparse ruled layout. The image shows the requested `KATO RENTAL LOCKERS, UENO` / `No. 114` anchor; still check exact lettering when using it as a generation reference, and typeset/paint over any text that must read precisely. Do not invent sums, company marks, or dates the story has not established. Track the same folded bundle from the altar to Jack’s room, into his jacket, and wet in the truck.

No invoice UI or separate invoice artifact was found in the repository. This sheet treats “Jack’s invoices” as the receipt bundle already in the film; confirm if you meant a different prop or a CSS invoice screen.