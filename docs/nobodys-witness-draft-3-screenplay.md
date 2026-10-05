# Nobody's Witness (Draft 3)

*A nonlinear pulp-crime graphic novel / movie script for Scarlet Reel*

## Format and delivery

This is a composed **graphic-novel / movie script**, not a walking-stage adventure. The registered story uses scene plates, chapter cards, inserts, close-ups, dialogue beats, evidence hotspots, and branching end choices. It has no `stage` nodes, no free-roam rooms, and no walk-to-exit gameplay.

The executable source is [`src/data/nobodysWitnessDraft3.ts`](../src/data/nobodysWitnessDraft3.ts). The scene route is:

```text
nw3_coldopen → nw3_titles → nw3_diner → nw3_folder → nw3_solomon
→ nw3_vera → nw3_bluecue → nw3_david → nw3_confession → nw3_kill
→ nw3_empty → nw3_rosa → nw3_solomon_final
→ nw3_end_truth / nw3_end_debt / nw3_end_alibi / nw3_end_empty / nw3_end_refusal
```

Jack Morrow narrates in first person. He never gives Vera a direct declaration of what he feels. The relationship is carried by practical choices: moving a chair so a car cannot see her face, keeping the receipt, going to the killing anyway, taking her coat, putting his name under her debt, giving her his car, and not waving when she leaves.

## Opening cue sheet

The pre-intro is deliberately spare and does not disclose the crime mechanics:

1. **Black pre-intro.** The exact prose line is:

   > straight, you draw a straight line and everyone stands in it

2. **Straight-line music cue.** The closest verified repository asset is `/nobodys-witness.mp3`; no exact `straight.mp3` is present. It starts as the pre-intro's track and continues into the credits.
3. **Gunshot cue.** The verified repository gunshot is `/nwt-gunshot.wav`; no exact `gunsho.mp3` is present. It plays from a textless, silent beat so it is a sound cue rather than spoken narration.
4. **Black hold.** The gunshot beat keeps the replacement background black and uses `afterBeatMode: "auto"` with `afterBeatDelaySeconds: 1` before routing to `nw3_titles`.
5. **Credits.** The credits card follows the black hold, then routes to the diner at 11:47 p.m.

The game reader was adjusted so an `audioUrl` beat plays even when `silent: true`, and a textless recorded beat can fire when it enters the queue. That preserves the sound-design sequence without turning the gunshot into dialogue.

## Story ledger — production spoilers

These facts are intentionally withheld from the opening and the briefing. They are here for the author, QA, and screenplay sync.

1. **Vera's debt is her own.** She borrowed $23,000 to buy the Blue Hour Diner lease and half the kitchen. She has paid interest for five years while the principal barely moved. If she misses Friday, Solomon can take the lease, equipment, and the room above the kitchen where she sleeps. She is genuinely frightened of Solomon.
2. **David is Solomon's collector.** He is meticulous with figures and careless with people. His cruelty is shown in practical acts: reading a warranty while Moe removes a debtor's front door, and checking the time before he hurts someone. He does not describe himself as a monster.
3. **David has skimmed the accounts for six years.** The withdrawals are small adjustments buried in cash routes, not a suitcase of movie money. Vera finds the pattern in the accounts and is the only person, besides David, who has found it and can prove it at the start of the story.
4. **Vera secretly pays Moe.** Her regular debt meetings place her inside Solomon's orbit. She pays Moe $8,000 in cash to kill David. Solomon did not order it.
5. **Vera's plan is practical and ugly.** She intends to let David die, take the hidden money, clear her own Blue Hour debt, and leave Blackwood. She hires Jack as insurance: if the killing attracts attention, his dated missing-husband file makes her look like a wife who was searching before the body appeared.
6. **David notices Vera in the accounts.** Vera does not know he noticed. He moves the money before she can take it. If Jack presses David on the money, David tells him that directly; otherwise Jack only knows that something heavy has been moved until the later evidence makes the absence clear. David dies before giving the hiding place. Nobody alive knows where the money is after the shot.
7. **The ending is heartbreaking, not romantic wish fulfilment.** Jack keeps choosing costly, protective actions. Vera does not turn those actions into a new obligation. She leaves Blackwood; Jack does not ask her to wait.

## Character direction

- **Jack Morrow:** A private detective who survives on small searches and keeps his promises to himself. He notices costs, dates, chairs, receipts, and who is watching the door. His restraint is behavior, not a speech.
- **Vera Voss:** Runs the Blue Hour. She counts the till, leaves one chair upside down, arranges sugar packets, and presses her thumb into paper when afraid. She is frightened, calculating, guilty, and still capable of noticing whether somebody has eaten.
- **David Voss:** A collector who understands systems and excuses cruelty as work. He keeps the door chain on, uses an unwashed chipped diner mug, jokes about coffee, and knows the difference between being clever and being safe.
- **Solomon Reyes:** A lender and landlord who treats overdue money like scheduling. He uses route sheets, filing tabs, payment dates, and property collateral; he rarely needs to raise his voice.
- **Moe:** A paid collector who knows when a job has crossed from work into something else. He cares about invoices because a clear job is safer than a second, unpaid obligation.
- **Desh:** A collector who talks more freely once a bill is paid. He remembers the screwdriver in David's coat and the exact routine of David's cruelty, then watches Jack's pen instead of his face.
- **Rosa Delgado:** A police detective and Jack's oldest friend. She checks dates and evidence handling before she offers sympathy. She understands that Jack's private file can become evidence against him.

---

# SCREENPLAY

## PRE-INTRO — THE STRAIGHT LINE

### BLACK

The `/nobodys-witness.mp3` music cue begins.

**JACK (V.O.)**

straight, you draw a straight line and everyone stands in it

The screen remains black. A textless sound beat fires `/nwt-gunshot.wav`. The replacement image stays black. The scene holds for one second after the sound, then cuts to credits.

---

## CREDITS — NOBODY'S WITNESS

### TITLE CARD

**NOBODY'S WITNESS**
**DRAFT 3 · A BLACKWOOD REEL**

The credit cards identify a Gaslight Reelworks production; Jack Morrow; Vera Voss; David Voss, Solomon Reyes, and Moe; then **Act One — The Line**.

The visual prose reads:

> NOBODY'S WITNESS
>
> DRAFT 3
>
> A graphic novel in three acts
>
> Blackwood. A town that keeps receipts.

The continue card reads: **Blackwood Diner. 11:47 p.m.**

---

# ACT ONE — THE LINE

## CHAPTER ONE — THE WOMAN WITH THE FOLDER

### INT. BLACKWOOD DINER — NIGHT

Eleven forty-seven. The coffee has been on the burner too long. Jack Morrow is in the back booth, reading the same page of a magazine for the fourth time.

**JACK (V.O.)**

The bell gave two sick little rings when Vera came in. One was the bell. The other was the door catching on a warped mat.

**VERA**

They said you were the only detective in Blackwood who doesn't work for Solomon Reyes. That's not a compliment, is it?

**JACK**

It is mostly a labor statistic.

Vera sits and arranges sugar packets into a line.

**VERA**

My husband is missing. The police asked if he had left before. I said no. They wrote down 'no fixed pattern' and told me to wait until morning.

**JACK**

What does he do?

**VERA**

He collects on Solomon's loans. He knows who has cash and who is lying about it. David Voss.

**JACK (V.O.)**

I know David. He collects for Solomon. He is careful about being seen doing it.

**VERA**

I brought a photograph, some account pages, and the address where he rents a room. I do not know which one will help.

**JACK**

You want him found, or you want a record that you asked? I can call Rosa and make it official.

The player may ask who sent Vera, what David collects, why she avoids the police, or why she chose a detective outside Solomon's orbit. Her answers keep the second purpose of the hire off the table.

Vera's face stays on the folder. The folder contains a photograph, account pages, and a carefully stripped-down trail. The phone at Jack's elbow is face-down: four missed calls from people wanting a favor and three from people wanting to sell one.

Jack can take the folder and the case, or slide it back. Refusing the folder routes directly to **NO INSURANCE**.

---

## CHAPTER TWO — THE SMALL NUMBERS

### INT. JACK'S OFFICE — LATER

One lamp. Two chairs. The folder has enough pages to need a third chair, and it sits there like it hired Jack.

**JACK (V.O.)**

Vera put the case in my hands. I called it a job so I would not have to call it a favor.

David's name sits beside small cash-route adjustments. Each is easy to dismiss. Weather damage. Wet count. Correction. The same code repeats in different months. Four digits are underlined in blue; the underline stops before it becomes an accusation.

**JACK (V.O.)**

The first rule of an account is not to decide what a number means before you know who benefits from it.

David collects late payments for Solomon and knows which doorbell to press twice. The pages do not yet say whether he is thief or witness. They say somebody wants Jack to choose quickly.

The account hotspot adds one restrained clue:

> A blue pencil mark circles the same four digits on six different pages. Whoever made it stopped before adding an explanation.

Jack takes David's name to Solomon.

---

## CHAPTER THREE — THE MAN WHO OWNS THE HINGES

### INT. SOLOMON'S OFFICE ABOVE THE FEED STORE — NIGHT

The heater ticks. Solomon has put out two cups. He only expects one of them to be used.

**SOLOMON**

Mr. Morrow. David Voss is missing. His route sheet says he should have knocked on three doors tonight. He knocked on none.

**JACK**

You checked the route sheet before you called the police.

**SOLOMON**

I check what keeps the business moving. The police check what makes paperwork.

**JACK (V.O.)**

You want him found.

**SOLOMON**

I want my collection route back on schedule. If David walked, he can explain where. If he did not, someone can explain why. Bring him back before the forty-eight hours run out.

**SOLOMON**

Vera Voss has a payment due Friday. Her account is separate. Do not confuse a late payment with a missing man.

**JACK (V.O.)**

He says Vera's name without checking the file. He knows the fact. The performance is for me.

Optional questions make Solomon specify that Vera's note is for the Blue Hour lease and kitchen, that Friday is when the building becomes part of the debt, and that David being overdue is a business fact rather than a murder theory. His filing cabinet has tabs for people, not debts. The heater kicks once, then stops; Solomon looks at it as if it has missed a payment.

Jack leaves with forty-eight hours and Vera's name.

---

# ACT TWO — THE MISSING HOURS

## CHAPTER FOUR — THE BLUE HOUR NOTE

### INT. THE BLUE HOUR DINER — AFTER CLOSING

Vera has counted the till twice and left one chair upside down. A black sedan has been parked opposite the window with its lights off.

**JACK (V.O.)**

The car has been there at least twenty minutes. I know because the diner clock is four minutes slow.

**VERA**

Do not look at it.

**JACK**

I am looking at the clock.

**VERA**

He likes to sit where he can see the door. He never comes in. The note arrives, I open the till, and I choose which bill stays unpaid. If I call the cops, he hears it as an invitation. Fuck that.

**JACK**

What is the note?

**VERA**

Mine. I borrowed twenty-three thousand to buy the Blue Hour lease and half the kitchen. The old owner left before he explained the boiler. I paid interest for five years. The principal has moved three inches.

**VERA**

If I miss Friday, Solomon takes the lease, the equipment, and the room I sleep in above the kitchen. The room is written into the same lease. That is my debt. Not David's. Mine.

**JACK (V.O.)**

She does not say she is scared. Her thumb has already said it three times against the edge of the paper.

**VERA**

I am frightened of him. There. You can write it down. He never has to put his hand on me. He owns the door, the lease, and enough people to make a closed diner feel crowded.

**JACK**

You keep the diner open anyway.

**VERA**

People still need coffee. Fear does not excuse a bad breakfast.

**JACK (V.O.)**

I moved the chair so the sedan could not see her face. She noticed. She pretended not to.

The player may ask what David left in the books, offer to leave, or tell Vera to leave town. She says David handles Solomon's paperwork but does not know what he does after he leaves. If Jack offers to stay, she says he should not sit beside her but she is glad he did; that is not permission to promise anything. If he tells her to leave, she recalls a bus driver who knew Solomon's name before she gave hers.

The Blue Hour loan notice is available as evidence. The window hotspot confirms that the sedan is holding its place across from Vera's door.

Jack asks around about David's associates.

---

## CHAPTER FIVE — THE WRONG KIND OF REGULARS

### INT. THE BLUE CUE — NIGHT

The jukebox has chosen a song about consequences and is playing it too fast. Moe and Desh sit beneath a television showing a horse race from last week.

**JACK (V.O.)**

Moe kept his coat over the chair. Desh had a newspaper folded to the race results, and his drink was already paid for. Neither man looked at the door when I came in.

**DESH**

David used to say a locked door was an invitation with better manners. He said it while he was checking whether the lock was expensive.

**MOE**

David used to say many things. Most of them cost somebody a window.

**JACK**

I need the room to stop pretending it did not hear David Voss.

**DESH**

He took a woman's house over two late payments. Sat at her table and read the lease while Moe removed the front door. She kept asking what was happening, like the right answer would put the hinges back.

**MOE**

The door was already bad.

**JACK**

And David?

**DESH**

He kept a screwdriver in his coat. Said a door was cheaper to replace than an argument.

**JACK (V.O.)**

I wrote down the address. Desh watched my pen, not my face. Moe watched the door.

**MOE**

Why are you looking for him?

**JACK**

His wife says he is missing.

**MOE**

His wife says a lot?

**JACK (V.O.)**

Moe did not ask Vera's name. The pause did it for him.

If Jack asks what David did when nobody was watching, Desh says:

> He did not hit people because he lost his temper. He did it after checking the time. That was the part that bothered me.

If Jack asks who saw David last, Moe gives the rental address and says David took the service road. If Jack identifies Moe as Solomon's employee, Moe says he works Fridays and answers questions Mondays; tonight is neither, so the question should be short.

The jukebox keeps failing to leave. One side of Moe's jacket hangs wrong; a gun, a bad shoulder, or a secret could all pull it that way.

Jack takes the rental address.

---

## CHAPTER SIX — THE MAN WHO COUNTED DUST

### INT. A RENTAL HOUSE WITH NO NAME ON THE DOOR — NIGHT

David opens the chain before Jack knocks. He is holding a chipped Blue Hour mug, the sort Vera gives regulars who stop paying attention to the logo.

**JACK**

David Voss. Your wife hired me to find you.

**DAVID**

No. Vera hired you to ask where I went. That is not the same as asking why.

**JACK (V.O.)**

The photograph was taken from below.

**DAVID**

Makes me look taller. Vera marks pages with coffee rings. I used to think it was accidental.

**JACK**

How long have you been working for Solomon?

**DAVID**

Six years. Long enough to know which numbers do not get checked.

**JACK**

You have been taking from Solomon.

**DAVID**

I have been taking care of myself. The accounts are a different argument.

**DAVID**

She saw a shape. She did not see me see her. That is the part you should keep to yourself.

**JACK**

What did you do with what she found?

**DAVID**

I made sure what I took was no longer her problem. That is as generous as I get.

**JACK**

You collect for Solomon. What happens when a debtor cannot pay?

**DAVID**

Last month a man missed two payments. I read him the warranty on his refrigerator while Moe took his front door off. The man remembers the warranty. That is the part people never expect.

**JACK**

You say that like it is an achievement.

**DAVID**

It is an achievement. The refrigerator still works.

**JACK (V.O.)**

He kept the chain on while he made the joke. David was afraid of somebody. It was not me.

The mug hotspot finds old coffee baked into the rim; David uses it as if nobody ever taught him to wash a dish. A rectangular dust-mark says something heavy sat in the room recently, but not where it went.

Depending on Jack's question, David later admits:

> I moved what I took after I saw Vera in the accounts. It is not here. She does not know I saw her, and she has no idea where to look. I will die before I give you the rest of that sentence.

Or:

> Then she learned how much a mistake costs. You are the man she hired to make her search look ordinary.

Or:

> Good. Go tell Vera I was here. She will ask whether I looked tired. Tell her yes.

Jack leaves David with the locked door. The money-moved state is set on exit, not on entry.

---

## CHAPTER SEVEN — THE UNPAID QUESTION

### INT. VERA'S APARTMENT — NIGHT

Vera has taken off her coat but not her shoes. On the table: the Blue Hour note, a glass of water, and a carbon receipt that has not yet decided whether it is evidence.

If Jack pressed David directly about the money, the scene opens with:

**JACK (V.O.)**

David told me about the money. He did not give me the address. He told me something else, and it is the piece you do not know.

Otherwise, Jack lets Vera speak first.

**VERA**

I found the skim because David left the route book open after a Friday payment. I knew the codes; you learn a lender's language when he owns your lease. Six years of it. Not one big theft, not the kind that gives you a villain in a coat. A dollar here, a code there. I was the only person besides David who had found it and could prove it.

**JACK**

Solomon never saw it.

**VERA**

Solomon sees totals. I saw the road to the totals. I thought the money was still where David kept it. That was the point of waiting.

**JACK**

And if it is not there?

**VERA**

Then the plan dies with the money. I do not have another plan.

**JACK (V.O.)**

I did not tell her he moved the money. The sentence stayed behind my teeth. It was not mercy. It was the last fact in the room that belonged to me.

**VERA**

I paid Moe cash. He works Solomon's route. I carried Solomon's Friday payment upstairs, and nobody asked why I stayed after I handed him the envelope.

**JACK**

How much?

**VERA**

Eight thousand. He said he would make David quiet. Moe is a man who can turn quiet into a service.

**VERA**

Moe said David was already a problem for Solomon. I let myself hear that as permission. It was only an excuse.

**VERA**

David dies. I take what he hid. I pay off the Blue Hour note. I leave Blackwood before Solomon has a reason to say my name twice. That was the plan.

**JACK**

And the folder?

**VERA**

Insurance. If the killing got loud, the police would find a detective's file dated before the body. A frightened wife looking for a missing husband. You were supposed to be a clean fact with a receipt.

**JACK (V.O.)**

You hired me to make the search look real.

**VERA**

I hired you because you were outside Solomon's reach. I did not know you would keep coming back after the useful part was over.

**JACK**

You could have told me to stop.

**VERA**

Would you?

**JACK**

No.

She puts the receipt between them. Jack puts his hand over it, not hers. The distinction is getting harder to maintain.

Jack can take the receipt and ask when Moe arrives, put it in his pocket and say nothing useful, or ask for the appointment time. Each route sends him to the killing.

---

## CHAPTER EIGHT — THE APPOINTMENT

### EXT. DAVID'S RENTAL HOUSE — LATER

Jack arrives at the service road. Upstairs, somebody is arguing about coffee. The scene is a cutscene. The verified gunshot cue is used again for the shot.

**JACK (V.O.)**

I went because Vera gave me the time. I went because I had a receipt in my pocket. I went because the door was already in my head before I reached it.

**DAVID**

Coffee is not supposed to taste like a tire fire.

**MOE**

Then stop drinking motel coffee.

**DAVID**

That is not an answer. That is a surrender with a lid on it.

**JACK**

David. Open the door.

**DAVID**

Morrow. Vera send you to check whether I am still breathing?

**JACK**

She sent me to find you. The rest is a matter between you and the room.

**DAVID**

She found the numbers. I saw her find them. I moved the money. You can tell her that part if you want to make her night worse.

**MOE**

Vera paid me for one job. I am not adding a second one for free.

**DAVID**

Vera paid you to shoot a man and you are worried about the invoice?

**JACK**

I put one hand on the door. Moe saw it. David saw the gun. I had time to pull the door open. I spent it waiting for David to move.

**DAVID**

The money is gone. I put it somewhere with no address and no witness. Nobody else alive knows where it is. When I am dead, that sentence gets shorter.

**JACK**

You do not get to make the last line funny.

**DAVID**

Everybody gets to make the last line funny. That is what the last line is for.

One shot. The door opens into black. `/nwt-gunshot.wav` fires.

**MOE**

She paid me for one job. Solomon did not send me. Do not make me remember whether you were here.

**JACK (V.O.)**

Moe leaves. I pick up the casing and put it in the receipt envelope. It is the only thing in the room I can label. Then I wait for Vera, because somebody has to tell her the room has changed.

Jack enters the room after the shot.

---

# ACT THREE — THE EMPTY ROOM

## CHAPTER NINE — THE MONEY IS NOT THERE

### INT. DAVID'S RENTAL HOUSE — AFTER

Vera enters with the key she was sure still worked. Jack is beside the body. The safe is open. The room has been edited.

**VERA**

Where is it?

**JACK**

The safe is empty.

**VERA**

I did not ask about the safe. There was a bag. There was a second drawer. He kept cash where he could hear it being nervous.

**JACK (V.O.)**

The dust had a rectangle in it. I knew what had occupied the rectangle. I did not tell her who moved it or when.

**VERA**

He took it.

**JACK**

I do not know where it went.

**VERA**

You know enough to say that without looking.

**JACK**

I know you are not going to find it in this room.

**VERA**

The money was the exit. The money was the part that made the rest of this arithmetic instead of murder.

If Jack tells Vera the money is gone, he says:

**JACK**

I moved the chair once. I am not moving the whole room for you.

**VERA**

You keep making small decisions like they are not decisions.

If Jack covers the money, he leaves the safe out of the first version of the report. If he tells the truth, he does not let Vera search alone. Either way:

**VERA**

I paid for an ending. I got an empty room.

**JACK (V.O.)**

The body was David. The empty safe was the part Vera had been waiting for. The room had kept the outline and lost the answer.

They leave for Rosa and the file.

---

## CHAPTER TEN — THE FILE IS A LOADED QUESTION

### INT. ROSA'S PARKED CAR — DAWN

Rosa has the folder on her lap and a stack of blank forms clipped to the wheel. Jack has dried rain on his sleeves and David's shell casing in his pocket.

**JACK (V.O.)**

Rosa read the first page twice. She did not look at me until she had checked the date.

**ROSA**

This file starts before the body. I checked the dates, the calls, and the places. Vera wanted a record that she had been looking for him.

**JACK**

She wanted insurance.

**ROSA**

Against the police?

**JACK**

A private detective's file. If the murder drew attention, it made me a possible suspect before it made her one.

**ROSA**

That can be useful. It can also be perjury.

**JACK**

She is afraid of Solomon. She is also the person who paid for David to be killed.

**ROSA**

Then the receipt is evidence. Who else has touched it?

**JACK**

Moe. Me. Vera, before me.

**ROSA**

And David?

**JACK**

David touched the reason for it.

**ROSA**

Those facts do not cancel each other. They make two separate charges.

**JACK**

Moe did it. Private cash. Solomon did not order it.

**ROSA**

Then the receipt is evidence. Who else has touched it?

**JACK**

Gone. David moved it before Vera knew he had seen her in the books. He died with the only address.

**ROSA**

You are not protecting her. You are making yourself part of the evidence. I am trying to keep you from becoming the part I have to file.

**JACK**

I know.

Rosa checks the casing label and the dates before offering Jack the next move. Jack can give Rosa the receipt and the off-book payment, or keep the receipt for one more conversation with Solomon.

The folder hotspot reads:

> Every page says Vera was looking. No page says she had already bought the silence.

The windshield is covered in rain. Rosa looks forward. Jack looks at the folder. Both know which direction Vera went.

---

## CHAPTER ELEVEN — THE PRICE OF A CLEAN NAME

### INT. SOLOMON'S OFFICE — MORNING

Three folders lie on the desk: DAVID, VERA, JACK. Solomon opens Vera's file to the page marked Friday. The heater is silent for once. He does not need to ask which debt he is holding.

**SOLOMON**

David Voss is dead. Moe has become difficult to locate. Two hundred and eleven thousand, four hundred and six dollars and seventeen cents is missing from my accounts.

**JACK**

David collected. The pages show he also kept two sets of numbers. He was careful with figures and careless with people.

**SOLOMON**

You are defending him by making him legible.

**JACK**

I am keeping the facts separate.

**SOLOMON**

Vera's payment is due Friday. The diner and apartment secure it. If she misses, I take both.

**JACK**

Moe takes cash jobs from whoever can find him.

**SOLOMON**

Moe takes private money from everybody. The question is whether he was paid to do a job or paid to become a witness.

**JACK**

He was paid to make David quiet. The money David stole is gone. Nobody alive knows where it is.

**SOLOMON**

Then Vera has a problem, you have a problem, and I have a missing number that refuses to die.

Jack puts his car keys on top of Vera's folder. Solomon sees the move and does not ask what it means.

**SOLOMON**

You are going to offer me something. People only put keys on paper when they are about to offer something.

**JACK**

Leave her name out of the first report. Take mine instead.

**SOLOMON**

That is collateral, Mr. Morrow. It is expensive because it is yours.

**JACK**

You charge for everything eventually.

**SOLOMON**

The money is gone. Vera's note is not. Your file is not. Which one of you should I believe when the police ask what happened in that room?

The three folders are arranged like a sentence with three possible subjects. The player chooses what Jack puts his name on.

---

# ENDINGS

## THE RECEIPT READS — victory silver

Jack gives Rosa the receipt before going upstairs, then gives Solomon the confession. Vera does not look at him while they take her coat and ask her to sit down.

**VERA**

You put the keys on the folders.

**JACK**

They were in the way.

**VERA**

No. You put them where he could see them.

**JACK**

Rosa will get you a lawyer.

**VERA**

That is not what I asked.

**JACK**

I know.

**VERA**

You kept coming back after the useful part was over.

**JACK**

The useful part was never the part I was looking at.

**VERA**

Do not make a monument out of a bad decision.

**JACK (V.O.)**

I moved the chair. I put the coat around her. I handed over the paper. Those were the only monuments I had.

Vera is alive. David is dead. The money remains missing. The goodbye does not happen in a place built for goodbyes.

---

## THE NOTE CHANGES HANDS — victory gold

Jack puts the Blue Hour note, his license, and his clean file on Solomon's desk. Vera's diner and apartment are released. Jack stays in Solomon's orbit. Vera leaves with a bus ticket and no obligation to come back for the man who bought it.

**SOLOMON**

Vera Voss owes me nothing. Jack Morrow owes me his working life. The money remains missing.

**JACK**

Give her the keys.

**SOLOMON**

You put them on the file yourself.

**JACK**

I know where they are.

**VERA**

You did not ask me to leave.

**JACK**

The six o'clock bus is less patient than I am.

**VERA**

You put his hand on my door and called it an exit.

**JACK**

I put your name on a debt he could collect from me instead.

**VERA**

You put yours there instead.

**JACK (V.O.)**

The bus door folded shut. I did not lift a hand. If she looked back, she would have had to decide what to do with me, and I had already made too many decisions for one morning.

---

## THE FILE HOLDS — victory silver

Jack writes that Vera Voss hired him to find her missing husband. That is true. He leaves out the part where she had already chosen the ending. The file holds long enough for her to leave; Solomon keeps the debt open, and Jack keeps the receipt beside his old badge.

**VERA**

You can come with me.

**JACK**

No. The file needs one witness, not two.

**VERA**

You gave me your car.

**JACK**

It was parked.

**VERA**

You put the receipt in the drawer.

**JACK**

It was not doing anything useful on the table.

**VERA**

You keep making jokes when you want to say something else.

**JACK**

The jokes are cheaper.

**VERA**

If the money turns up, do not find me.

**JACK (V.O.)**

She took the car and the clean report. I kept Solomon's deadline, the empty safe, and every sentence I had not said. The city got smaller behind her. I did not make it follow.

---

## THE MONEY STAYS MISSING — game over

Jack refuses every trade and tells Solomon the money is gone. Vera disappears before morning. Solomon keeps the debt open, the police keep the file, and nobody alive knows where David put the money. Jack keeps the sentence that would have changed the ending to himself.

**SOLOMON**

Then Vera's note remains open.

**JACK**

So does David's grave.

**SOLOMON**

A grave does not accrue interest.

**JACK**

Give it time.

**JACK (V.O.)**

Vera was gone when I got back to the Blue Hour. Her keys were on the counter. The diner was unlocked. She had left the lights on for a place she did not intend to see again.

**VERA (V.O. — REMEMBERED)**

Do not make promises you cannot pay.

**JACK (V.O.)**

I had not promised anything. That was the problem. I had only moved a chair, taken a coat, put my name where hers had been, and watched the door close without asking it to wait.

---

## NO INSURANCE — game over

Jack refuses Vera's folder before he knows what is inside its second purpose. David still dies, the money still vanishes, and the police never get a file proving Vera looked for him first.

**VERA**

Thank you for being honest.

**JACK**

It is a low bar.

**JACK (V.O.)**

Three nights later, David Voss was dead and the morning paper used the phrase *domestic uncertainty*. Vera had no detective's file, no witness she had purchased in advance, and Solomon's name still fit the room.

**JACK (V.O. — FINAL)**

I kept the coffee receipt from that night. Not because it meant anything. Because I had been there, and sometimes a man keeps the wrong proof.
