# 🕹️ Spaceship IDE

Steer your ideas in realtime, space pilot style!

![Screencast](./extra/screencast.gif)

## Demos

Watch on [Instagram](https://www.instagram.com/reels/DfyQPhFtW-z/) and [YouTube](https://www.youtube.com/watch?v=3WmNLWUmcnY).

## Run locally

Use Node.js and npm, then run:

```sh
npm ci
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/spaceship/`). The interface starts in **sim** mode and needs no API key. Click **mode sim** at the bottom, enter your Gemini API key, and click **launch** to use **flight** mode. The key is stored in that browser's local storage, not in the repository. Switching modes reloads the page and starts a new session.

## Interface guide

The **main knob** marks the end of the visible story. The app keeps generated words ready beyond it.

| Action                                                                   | Result                                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Drag the main knob forward                                               | Reveal generated words. The app requests more when its buffer runs low.                             |
| Press and hold on the empty page ahead of the main knob                  | Pull the knob toward the pointer, revealing words gradually.                                        |
| Drag the main knob backward                                              | Cut off the continuation after that point and generate a new one when the knob rests.               |
| Quick double click the main knob when nothing is attached                | Ask the model to mark important phrases with attention boxes.                                       |
| Quick double click the main knob when boxes or future knobs are attached | Clear **all** of those controls. This can cancel and restart generation of the unseen continuation. |

### Attention boxes

Drag across visible words to make a box around them. Its middle word becomes the highlighted keyword. Drag an existing box to move its keyword to another word; double click the box to delete it. Hover over a box to make it the focus of the connection bars in the left rail. A quick double click on the main knob can suggest boxes automatically, but it clears existing boxes and future knobs if any are present.

Boxes steer the next passage through the prompt sent to Gemini. For example, a box around `the locked door` might become `the locked [door]` under `KEY PHRASES`. The continuation prompt tells Gemini to build on these phrases, especially the bracketed words. Adding or moving a box regenerates text **ahead of the main knob**; it does not edit words already visible.

### Future knobs

1. Click the main knob once. Press it again within about 400 ms, nearly in the same spot, and **keep holding**.
2. Hold still for about half a second until a new knob and a fan of dimensions appear. Keep the pointer down.
3. Drag the new knob through a labelled part of the fan and past its outer arc to choose a dimension.
4. Move across the fan to set its value, and farther from the main knob to increase its influence. Release to keep the setting.

Drag a future knob again to retune it. Double click it, or drop it onto the main knob, to remove it. As the story advances, a knob may pin beside a sentence judged to have fulfilled its instruction. A pinned knob has finished steering. A quick double click on the main knob clears all boxes and future knobs; to open the fan, the **second press must stay down** until the hold completes.

### Readouts

The bottom bar has the **sim / flight** mode control, the sound toggle, and a link to the extra design pages. `¶` is the visible word count; `+` is generated words waiting beyond the main knob. `box`, `steer`, and `pin` count attention boxes, active future knobs, and pinned knobs. `»` shows streaming words per second and `▼` shows time to the first chunk; a dash means no measurement is available yet.

## How the model is used

In flight mode, Gemini 3.1 Flash-Lite streams the story, suggests attention phrases, and chooses which steering dimensions to offer. The selected phrases and future-knob settings are written into the next story prompt. A knob might add a control such as `tension: very strained (strong)`. These are instructions to the model, so they can influence its output but do not guarantee a particular result.

The left rail uses separate Gemini Decision 1 scoring requests. By default, its ten-segment bar on each line estimates how strongly that line's sentences connect to the sentence at the main knob. Hovering over a box changes the focus to its phrase. Sentence scores are weighted by how much of each sentence falls on the display line and adjusted for visual contrast. **The bars are not cumulative attention or internal model attention weights.** The rail also shows each boxed keyword's estimated relevance to the current sentence. A future knob pins when a separate score says a sentence fulfilled its setting.

The app does not inspect or change the model's internal attention, weights, or hidden state. It steers by changing prompts and by canceling and restarting generation from the chosen story position. In sim mode, the text and scores are simulated rather than returned by a model.

To change live mode's possible starting phrases, edit [`src/story/openings.ts`](./src/story/openings.ts). Its continuation instructions are in [`src/story/prompt.ts`](./src/story/prompt.ts) and [`src/text/live-completion.ts`](./src/text/live-completion.ts). Sim mode's filler-word dictionary is in [`src/text/completion.ts`](./src/text/completion.ts).

## Conjecture

> In the near future, LLM and Decision Models will reach 60 FPS interactivity.

When that happens, what new interaction paradigms will unlock? This project demonstrates plausible and desirable interactions for that future.

1. **Focus monitor**: can we visualize what LLM is paying attention to, and use that to guide human's focus towards what's important?

   ![focus monitor](./extra/clips/focus-monitor.gif)

2. **Attention lock**: can we force LLM to pay more attention to specific phrases so as to bias its future behavior?

   ![attention lock](./extra/clips/attention-lock.gif)

3. **Future Vector Steering**: can we decompose the task into eigenvectors, independently tune each, and re-compose them to influence the incoming text?

   ![future steering](./extra/clips/future-steering.gif)

4. **Realtime re-generation**: when text generation is cheap and fast, can we explore alternative futures by scrubbing?

   ![realtime regeneration](./extra/clips/realtime-regeneration.gif)

## Design process

I used Claude Code for most of the implementation but stayed hands-on for the UI/UX. I iterate using interactive style swatch, a technique where I prompt AI to give me diverse options of designs, I provide feedback, and it iterates. You can see the design artifacts in the [extra page](https://chuanqisun.github.io/spaceship/extra/style-1.html).

To achieve the realtime experience, I have to use agreesive speculative generation and manage cache invalidation based on user interactions. For example, when the main knob moves backward, I have to empty future texts and cancel ongoing requests. There are many considerations like this throughout the system and that took a lot of human judgement - claude didn't one shot them.

## Theory

I'm currently focusing on systems that help human shape ideas in realtime. This project is a small step towards my [upcoming thesis](https://code.chuanqisun.com/master-thesis/) at the MIT Media Lab, where I investigate how semantic and symoblic systems can be coupled to enhance human creativity, agency, and joy of craft.

## Citation

If you build on this work, please cite it as:

```bibtex
@misc{sun2026spaceship,
  author       = {Sun, Chuanqi},
  title        = {Spaceship {IDE}: Steer Your Ideas in Realtime, Space Pilot Style},
  year         = {2026},
  publisher    = {GitHub},
  howpublished = {\url{https://github.com/chuanqisun/spaceship}},
  note         = {Demo: \url{https://chuanqisun.github.io/spaceship/}}
}
```
