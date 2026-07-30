window.PLAYBOOK = {
"01":{
part:"Foundations",
title:"What Is an AI Operating System?",
next:{num:"02",title:"Language Models"},
content:`<h2>The short version</h2>
<p>An AI operating system is not a model. It is the layer around the model: the thing that decides which tools exist, what the assistant is allowed to reach, what it remembers between one conversation and the next, and which model answers a given request. Swap the model out and the system keeps working. Take the system away and the model is a text box.</p>
<p>That distinction matters because most assistants are the second thing wearing the first thing's clothes. They are a chat window with integrations bolted on the side, where each integration brings its own account, its own permissions and its own idea of what it remembers.</p>
<h2>Four parts, not one</h2>
<p>Every AI operating system has the same four pieces, whatever the vendor calls them:</p>
<ul>
<li><strong>A tool registry.</strong> The set of things the assistant can actually do, declared up front and typed, so the agent reaches for the right one instead of guessing at an API.</li>
<li><strong>A permission gate.</strong> The rule that decides which calls run on their own and which stop and wait for you. Reads are cheap and reversible; writes, sends and payments are not.</li>
<li><strong>Memory.</strong> What survives the end of a conversation — people, projects, preferences — and how it is pruned so a six-month thread still fits in the window.</li>
<li><strong>A model router.</strong> The part that sends a request to a local model, a hosted one, or a different one entirely, without the rest of the system noticing.</li>
</ul>
<p>The interesting question about any assistant is not which model it uses. It is where those four parts live.</p>
<h2>Where it runs is the whole argument</h2>
<p>Two systems can have identical features and be completely different products, because the four parts above can sit on your device or on someone else's server.</p>
<p>When the loop runs remotely, your context has to travel to it. Every tool call, every document the agent reads, every credential it uses to reach your mail passes through infrastructure you do not control. The permission gate is enforced somewhere you cannot inspect, and the memory is a row in a database with your name on it.</p>
<p>When the loop runs on the device, the model call is the only thing that ever needs to leave — and with a local model, not even that. This is the design Arble takes: the agent loop, the tool registry, the permission gate and the memory all run on hardware you own, and model providers are interchangeable parts behind a router.</p>
<h2>Why "operating system" and not "app"</h2>
<p>An operating system earns the name by being the thing other things run <em>on</em>. It owns scheduling, permissions and access to hardware, and it presents one consistent interface over many different underlying pieces. An app does one job inside those rules.</p>
<p>By that test, a chat interface with plugins is an app. A runtime that holds a permission model every tool must pass through, keeps state across sessions, schedules work that continues while the interface is closed, and abstracts away which model is answering — that behaves like an operating system, at a smaller scale.</p>
<p>The practical consequence is compounding. In an app, each new integration is a new thing to configure, authorise and remember the quirks of. In a runtime, a new tool inherits the permission model, the memory and the router that already exist. It is one more entry in a registry, not one more product to learn.</p>
<h2>What to take into the next chapter</h2>
<p>The rest of the Foundations section works from the bottom up — what a language model actually is, how text becomes tokens, and what the transformer architecture does with them — before the Agents section returns to the loop that sits on top. If you only keep one thing from this chapter, keep this: the model is a component, and the system around it is the product.</p>
<h2>What the layer actually buys you</h2>
<p>It is easy to describe the four parts and still miss why assembling them is worth the trouble. The value is that each part makes the others cheaper.</p>
<p>A tool registry is only useful if something decides when to reach for a tool. A permission gate is only meaningful if there is a registry of things it can gate. Memory is only worth keeping if the next session can find it. And a router only matters when the rest of the system is indifferent to which model replied. Built separately, each one is a feature. Built together, they are a substrate: the cost of adding the twentieth tool is a fraction of the cost of the first.</p>
<h2>The three questions worth asking</h2>
<p>When you are evaluating any assistant that claims to be more than a chat box, three questions separate the substrate from the veneer:</p>
<ul>
<li><strong>What happens when the network is gone?</strong> If the answer is "nothing works", the loop is not on your device — it is on theirs, and you are a client.</li>
<li><strong>Can you see the tool call before it runs?</strong> A system that shows you the call, the arguments and the effect before executing has a real permission gate. A system that reports what it did afterwards has a log.</li>
<li><strong>What survives a new conversation?</strong> If the answer is "nothing", there is no memory layer, and every session pays the cost of re-explaining your world.</li>
</ul>
<h2>Why this shape keeps reappearing</h2>
<p>The four-part structure was not designed by anyone. It emerged because each piece is the answer to a failure that shows up as soon as a model is asked to do rather than to say.</p>
<p>Free-form API access produced agents that hallucinated endpoints, so tools became typed and declared: the registry. Unsupervised execution produced agents that sent the wrong email to the wrong person, so approval became structural: the gate. Stateless sessions produced assistants that felt amnesiac, so recall became persistent: memory. And single-provider lock-in produced outages and bills nobody could control, so provider choice became indirect: the router.</p>
<p>Every serious agent system converges on this shape because every serious agent system runs into the same four walls.</p>
<h2>How to read the rest of this book</h2>
<p>The Foundations chapters that follow build the model from the bottom: what a language model is, how text becomes tokens, what a transformer does with them, and why attention and context windows set the limits everything else works within. If you already know this material, skim it.</p>
<p>The Agents chapters describe the loop that turns prediction into action. The Devices chapters cover what changes when that loop runs on a phone that talks to a desktop. The Arble chapters get specific about this implementation. Production covers what breaks at scale, and Future is explicitly speculative — it is labelled as such so you can discount it accordingly.</p>`
},
"02":{
part:"Foundations",
title:"Language Models",
prev:{num:"01",title:"What Is an AI Operating System?"},
next:{num:"03",title:"Tokens"},
content:`<h2>The core idea</h2>
<p>A language model is a statistical system trained to predict the next token in a sequence. Given a string of text, it estimates the probability distribution over every possible next token and samples from it. Repeat that a few hundred times and you have sentences, paragraphs, answers.</p>
<p>That prediction engine is what makes an AI operating system possible. Without it, every instruction would have to be hand-coded. With it, a system can take a goal stated in natural language and break it into steps, pick tools, and decide when it has finished — all by treating "what should I do next?" as a prediction problem.</p>
<h2>How they are built</h2>
<p>Modern language models share a common architecture. Training starts with a huge corpus of text — books, code, web pages — and a simple objective: given every token so far, predict the next one. The model adjusts its internal parameters millions of times until its predictions are usefully accurate.</p>
<p>The resulting model is not a database. It does not retrieve facts from a lookup table. It has learned a high-dimensional map of linguistic and conceptual relationships — enough to generalise to questions and tasks it never saw during training.</p>
<h2>Capabilities that emerge</h2>
<p>Language models do not need to be taught tool use, summarisation or code generation explicitly. Those behaviours emerge from the training data and the scale of the model:</p>
<ul>
<li><strong>In-context learning.</strong> Give a model a few examples of a task in the prompt and it will follow the pattern without weight updates.</li>
<li><strong>Instruction following.</strong> Fine-tuning on instruction-response pairs teaches the model to treat user requests as commands rather than continuation prompts.</li>
<li><strong>Chain-of-thought reasoning.</strong> Asking the model to "think step by step" before answering dramatically improves accuracy on multi-step problems.</li>
</ul>
<h2>Running them outside the cloud</h2>
<p>The assumption that language models live in a datacentre is a historical accident, not a technical requirement. A ~7 billion parameter model quantised to 4 bits fits in 4 GB of RAM and runs at usable speed on a phone's neural engine or GPU. A ~70 billion parameter model needs a desktop GPU or a server. The architecture is the same — only the latency and throughput change.</p>
<p>Arble supports both paths through a unified router. A query can reach a local model running via llama.cpp or Ollama, a cloud model from Anthropic or OpenAI, or a custom endpoint behind a compatible API. The agent loop does not know or care which one answered.</p>
<h2>The limits</h2>
<p>Language models are not reliable in the database sense. They hallucinate, contradict themselves, and fail on problems that look simple to a human. They have no persistent state — everything they "know" about a conversation comes from the tokens in front of them. And their training data has a cutoff date, so they cannot know about events after that point without retrieval augmentation.</p>
<p>Those limits are not solved by a better model. They are managed by the system around it — by memory that persists across sessions, by tools that fetch live data, and by a permission gate that catches actions a model should not have taken on its own. That system is what the rest of this playbook covers.</p>
<h2>What training actually optimises</h2>
<p>It is worth being precise about the objective, because almost every surprising model behaviour follows from it. The model is not trained to be truthful, helpful, or consistent. It is trained to minimise prediction error on its training corpus — to assign high probability to the token that actually came next.</p>
<p>Truthfulness is a side effect: true statements are more common in careful text than false ones, so predicting well correlates with being right. But the correlation is imperfect, and where it breaks down you get confident errors. The model is not lying; it is doing exactly what it was optimised to do, on a distribution where the honest answer and the plausible answer diverge.</p>
<h2>The three stages</h2>
<p>Production models go through roughly three phases before you meet them:</p>
<ul>
<li><strong>Pretraining.</strong> Next-token prediction over a very large corpus. This is where nearly all knowledge and language ability is acquired, and where nearly all the compute is spent.</li>
<li><strong>Supervised fine-tuning.</strong> Training on curated examples of instructions and good responses, which teaches the model the shape of an answer rather than the shape of a document.</li>
<li><strong>Preference tuning.</strong> Learning from comparisons between responses, which shapes tone, refusal behaviour and helpfulness.</li>
</ul>
<p>The distinction matters practically: pretraining sets what a model can know, and the later stages set how it behaves. A model that will not do something is usually a fine-tuning artefact, not a capability limit.</p>
<h2>Parameters, and what they do not tell you</h2>
<p>Parameter count is the number most often quoted and the least useful in isolation. It sets a rough ceiling on capacity, but a well-trained smaller model routinely beats a badly-trained larger one, and training-data quality has proven at least as important as scale.</p>
<p>For an operating system that routes across providers, this is liberating. You do not need the largest model for most requests. Classification, extraction, short summaries and routine tool selection are handled well by small fast models; the expensive ones earn their cost on multi-step reasoning. A router that knows the difference spends a fraction of what a single-model system spends.</p>
<h2>What this means for the loop</h2>
<p>Because the model is a predictor rather than an executor, everything it does inside an agent loop is a prediction dressed as an action. When it emits a tool call, it has predicted that a tool call is what comes next, and predicted the arguments. Nothing guarantees the tool exists or the arguments typecheck.</p>
<p>That is precisely why the surrounding system validates before executing. The model proposes; the registry, the schema validator and the permission gate dispose. Treating model output as a proposal rather than a command is the single most important design decision in an agent runtime.</p>`
},
"03":{
part:"Foundations",
title:"Tokens",
prev:{num:"02",title:"Language Models"},
next:{num:"04",title:"Transformers"},
content:`<h2>What a token is</h2>
<p>A token is the atomic unit a language model reads and writes. It is not a character and not a word — it is a chunk of text from a fixed vocabulary that the model's tokenizer produces when it converts a string into numbers. In English, a token averages about four characters, so "language models" becomes roughly three tokens: <code>lang</code>, <code>uage</code>, <code> models</code>.</p>
<p>Every interaction with a language model — every prompt, every tool description, every line of the response — is measured in tokens. The model's context window is a limit on how many tokens it can attend to at once. The cost of a cloud API call scales linearly with the token count. The latency of inference grows with the number of tokens in the input and the number generated in the output.</p>
<h2>How tokenizers work</h2>
<p>Most modern models use a subword tokenizer based on Byte-Pair Encoding (BPE). The tokenizer starts with individual bytes as the vocabulary, then iteratively merges the most frequent adjacent pairs into new tokens until the vocabulary reaches a target size — typically 32,000 to 128,000 tokens.</p>
<p>The result is that common words become single tokens while rare words are split into multiple tokens. "the" might be one token; "antidisestablishment" might be five or six. This is efficient for common patterns and flexible enough to encode arbitrary text.</p>
<h2>Why tokens matter in practice</h2>
<p>Three practical consequences follow from how tokens work:</p>
<ul>
<li><strong>Context windows are token-bounded.</strong> A 128K context window can hold roughly 96,000 English words, but the same window fills much faster with code, JSON, or other dense formats because punctuation and whitespace add tokens.</li>
<li><strong>Tool descriptions consume context.</strong> Every tool signature you declare to the model occupies tokens. A large tool registry with verbose schemas can crowd out the actual conversation.</li>
<li><strong>Token pricing is asymmetric.</strong> Input tokens typically cost 3–10x less than output tokens across cloud providers, which changes the economics of long prompts versus long responses.</li>
</ul>
<h2>Managing token use</h2>
<p>Arble tracks token consumption per session, per tool call, and per model endpoint. The session compactor prunes older turns when the context approaches the model's limit, using a scoring function that keeps high-signal turns (tool results, user instructions) and drops low-signal ones (acknowledgements, filler). Tool descriptions can be loaded on demand rather than injected into every turn, and the router selects the cheapest model that can handle the request — so a simple lookup does not waste expensive context on a flagship model.</p>
<h2>Why tokenisers are not neutral</h2>
<p>A tokeniser is trained, not designed. It learns a vocabulary from a corpus by repeatedly merging the most frequent adjacent pairs, so the segments it ends up with reflect whatever that corpus contained a lot of.</p>
<p>The consequences are uneven in ways that matter. Common English words are single tokens. Less common languages fragment into many more tokens per word, which means the same sentence can cost several times as much to process depending on the language it is written in. Code tokenises efficiently for widely-used languages and poorly for obscure ones. Whitespace, indentation and punctuation all consume budget.</p>
<h2>The failures that trace back to tokens</h2>
<p>Several model behaviours that look like reasoning failures are really tokenisation artefacts:</p>
<ul>
<li><strong>Character-level tasks.</strong> Counting letters in a word is hard because the model does not see letters, it sees a token. The information is genuinely not in the representation.</li>
<li><strong>Arithmetic on long numbers.</strong> Digits group into tokens unpredictably, so the model is not manipulating place values the way you are.</li>
<li><strong>Rhyme and wordplay.</strong> Phonetics are only implicit in the text, and token boundaries do not align with syllables.</li>
</ul>
<p>The practical lesson for an agent system: when a task is really about characters or digits, use a tool. A calculator tool exists in Arble not because the model cannot approximate arithmetic, but because a deterministic function is right every time and costs nothing.</p>
<h2>Tokens as the unit of everything</h2>
<p>Tokens are the currency of the whole system. Context windows are measured in them, pricing is quoted per million of them, latency scales with how many are generated, and compaction exists to reclaim them.</p>
<p>This is why an operating system tracks token accounting as a first-class concern rather than an afterthought. The runtime knows how many tokens the conversation currently occupies, how close that is to the model limit, and what will be dropped or summarised when the limit approaches. Without that accounting, long conversations do not degrade gracefully — they fail at an arbitrary point with a provider error.</p>
<h2>Budgeting in practice</h2>
<p>A useful mental model is that context is a budget with competing claimants: the system prompt, the tool definitions, the memory retrieved for this turn, the conversation so far, and the space left for the answer.</p>
<p>Tool definitions are the claimant people underestimate. Several dozen tools, each with a name, description and JSON schema, can consume a meaningful share of the window before the user has said anything. This is the reason for progressive tool disclosure: when the registry is large, the system exposes a search over tools rather than the full list, so the budget is spent on the conversation instead of the catalogue.</p>`
},
"04":{
part:"Foundations",
title:"Transformers",
prev:{num:"03",title:"Tokens"},
next:{num:"05",title:"Attention"},
content:`<h2>The architecture that changed everything</h2>
<p>The transformer architecture, introduced in the 2017 paper "Attention Is All You Need", replaced the recurrent and convolutional networks that previously dominated natural language processing. Instead of processing a sequence left-to-right and maintaining a hidden state, a transformer processes all tokens in parallel through stacked layers of self-attention and feed-forward transformations.</p>
<p>Parallel processing is what made large-scale language models possible. Recurrent networks could not be parallelised across time steps, which limited training to sequences of a few hundred tokens and made training runs prohibitively slow. Transformers can process thousands of tokens simultaneously, which means they can train on much more data and much longer contexts.</p>
<h2>The building blocks</h2>
<p>A transformer layer has two main components:</p>
<ul>
<li><strong>Multi-head self-attention.</strong> Every token computes a weighted combination of every other token in the sequence. The weights — the "attention" — are learned: the model discovers which tokens are relevant to which other tokens for the task at hand.</li>
<li><strong>Feed-forward network.</strong> Each token's representation passes through a learned nonlinear transformation independently. This is where the model stores most of its factual knowledge.</li>
</ul>
<p>Between these components, residual connections and layer normalisation keep gradients flowing during training and stabilise the activations.</p>
<h2>How scale changes behaviour</h2>
<p>Transformers exhibit phase changes at certain scale thresholds. Below about 1 billion parameters, performance on reasoning tasks improves predictably with size. Above that, new capabilities can appear abruptly — a model that could not do multi-step arithmetic at 2B parameters might suddenly succeed at 7B.</p>
<p>This phenomenon, known as emergence, is why the industry race is toward larger models. But larger models are also more expensive to run. A 70B parameter model requires roughly 10x the compute of a 7B model for the same output, and it needs a much larger context window to hold the same conversation because its representations are wider.</p>
<h2>Efficient transformer variants</h2>
<p>The standard transformer's self-attention scales quadratically with sequence length — a 128K context requires 16 billion attention scores per layer. Several architectural variants reduce this cost:</p>
<ul>
<li><strong>Sliding-window attention.</strong> Each token only attends to its immediate neighbours rather than the full sequence.</li>
<li><strong>Flash attention.</strong> An exact but memory-efficient implementation of standard attention that avoids materialising the full attention matrix.</li>
<li><strong>Mixture-of-experts (MoE).</strong> The feed-forward network is replaced by multiple "expert" sub-networks; a router selects which experts to activate per token, so the total computation is much less than the parameter count suggests.</li>
</ul>
<p>Arble's local model support includes quantised versions of all three variants, selected automatically based on the device's available memory and neural engine capabilities.</p>
<h2>What the layers do</h2>
<p>A transformer block has two working parts, repeated dozens of times. Attention lets every position look at every other position and pull in what is relevant. The feed-forward network then processes each position independently, transforming what attention gathered.</p>
<p>A rough intuition, imperfect but useful: attention moves information between positions, and the feed-forward layers do the thinking about what was moved. Stacking many blocks means information can be gathered, processed, gathered again in light of that processing, and so on — which is how the model builds representations that depend on long-range structure rather than local word order.</p>
<h2>Why this architecture won</h2>
<p>The architectures it replaced processed text sequentially — each step waiting on the one before. That made them slow to train, because the work could not be spread across many processors, and it made long-range dependencies fragile, because information had to survive being passed along a chain.</p>
<p>The transformer processes every position at once during training. That single property is what made it possible to train on corpora large enough for the current generation of capabilities to appear. The architecture is not obviously smarter; it is enormously more parallel, and scale did the rest.</p>
<h2>The asymmetry between training and serving</h2>
<p>Training is parallel. Generation is not. When a model produces text, it emits one token, appends it to the sequence, and runs again — so a 500-token answer is 500 sequential passes.</p>
<p>This asymmetry explains most of what you feel as a user. Time-to-first-token is dominated by processing your input, which is parallel and fast. Time-to-last-token is dominated by generation, which is sequential and scales with output length. It is why streaming matters so much for perceived speed, and why asking for a shorter answer genuinely makes it arrive sooner.</p>
<h2>Where the cost goes</h2>
<p>Two quantities dominate serving cost. The first is the attention computation, which grows with the square of sequence length — doubling the context does not double the work, it roughly quadruples that portion of it. The second is the key-value cache, the stored intermediate state that lets generation avoid recomputing the whole sequence for every new token. That cache grows linearly with context and consumes real memory on the serving hardware.</p>
<p>Both are why long contexts are priced the way they are, and why a system that quietly keeps a hundred turns of history in the window is expensive in a way that is not visible until the bill arrives. Compaction is not only about staying under the limit; it is about not paying quadratic costs for history nobody is using.</p>`
},
"05":{
part:"Foundations",
title:"Attention",
prev:{num:"04",title:"Transformers"},
next:{num:"06",title:"Context"},
content:`<h2>What attention does</h2>
<p>Attention is the mechanism that lets each token in a sequence "look at" every other token and decide how much weight to give each one. When the model processes the word "bank" in "river bank" versus "savings bank", attention changes which surrounding words influence its representation — "river" pulls the representation toward one meaning, "savings" toward another.</p>
<p>Every transformer layer recomputes attention across the full sequence. Early layers learn syntactic relationships (which noun does this pronoun refer to?). Middle layers learn semantic relationships (what entities are mentioned in this paragraph?). Late layers learn task-specific relationships (which parts of the prompt are relevant to the next token?).</p>
<h2>How attention is computed</h2>
<p>For each token, the model produces three vectors: a Query, a Key, and a Value. The Query of one token is compared against the Keys of all tokens using a dot product, producing a score. These scores are normalised through a softmax to produce attention weights, which are then used to compute a weighted sum of the Values.</p>
<p>Multi-head attention runs this process multiple times in parallel with different learned projections, so the model can attend to different things at the same time — syntax in one head, semantics in another, positional information in a third.</p>
<h2>The quadratic problem</h2>
<p>Standard attention has O(n²) complexity in the sequence length. Every token attends to every token, so a sequence of 100 tokens produces 10,000 attention scores, while a sequence of 100,000 tokens produces 10 billion. This is the fundamental constraint on context window size.</p>
<p>Several techniques reduce this cost:</p>
<ul>
<li><strong>Sparse attention.</strong> Only compute attention for a predefined subset of token pairs, such as local windows plus a few randomly selected distant tokens.</li>
<li><strong>Cross-attention.</strong> Instead of every token attending to every other, one sequence (the query) attends to a fixed representation (the key-value pairs), like a search operation.</li>
<li><strong>KV caching.</strong> During generation, the Keys and Values of all previous tokens are cached so they do not need to be recomputed for each new token. This is why autoregressive generation becomes faster after the first token.</li>
</ul>
<h2>Attention in the agent loop</h2>
<p>In an AI operating system, attention is not just an architectural detail — it shapes what the agent can do. A model with a 128K context window can attend to roughly 200 tool call results, 50 pages of text, or an entire codebase of moderate size. The session manager and compactor in Arble are designed to keep the most relevant content within that window, pruning aggressively so the model's attention is not diluted by stale or irrelevant turns.</p>
<h2>Queries, keys and values</h2>
<p>The mechanism is easier to hold onto with the retrieval analogy the names come from. Each position emits a <strong>query</strong> describing what it is looking for, a <strong>key</strong> advertising what it offers, and a <strong>value</strong> carrying the content it would contribute.</p>
<p>Every query is compared against every key to produce relevance scores; those scores are normalised into weights; and the result for that position is the weighted blend of all the values. A pronoun's query matches the key of the noun it refers to, and pulls in that noun's value. Nothing about this was hand-specified — the projections that produce queries, keys and values are learned.</p>
<h2>Many heads, different jobs</h2>
<p>A single attention pattern would force one notion of relevance. Real models run many attention heads in parallel, each with its own learned projections, and concatenate the results.</p>
<p>Interpretability work has found heads that specialise in surprisingly legible ways — tracking syntactic dependencies, matching quotation marks and brackets, or copying earlier tokens when a pattern repeats. This is not designed either, and the specialisations are messier than the tidy examples suggest, but the general picture holds: different heads attend to different kinds of structure, and their combination is richer than any one of them.</p>
<h2>Causal masking</h2>
<p>Generative models use masked attention: a position may attend to earlier positions and itself, never to later ones. Without the mask, predicting the next token would be trivial, because the answer would be visible.</p>
<p>This has a practical consequence worth internalising. Because the model cannot look ahead, everything relevant must appear <em>before</em> the point where it is needed. Instructions placed after the content they govern have less influence than instructions placed before it. Prompt ordering is not stylistic.</p>
<h2>Why context is not free attention</h2>
<p>A large context window is often read as a promise that everything in it is equally available. It is not. Attention is a weighted average, and as sequences grow, the weight available to any single token falls.</p>
<p>Empirically, models attend most reliably to the beginning and end of long contexts and least reliably to the middle. A fact buried in the centre of a very long conversation may be present and still not be used. For an agent system this is a direct argument for retrieval and compaction over brute-force stuffing: a short, well-chosen context outperforms a long, undifferentiated one, even when both technically fit.</p>`
},
"06":{
part:"Foundations",
title:"Context",
prev:{num:"05",title:"Attention"},
next:{num:"07",title:"Reasoning"},
content:`<h2>Context is not memory</h2>
<p>In a language model, context is the concatenation of all tokens that have been fed into the model for a given request — the system prompt, the conversation history, the tool descriptions, and the user's latest message. The model's attention mechanism operates over all of these tokens simultaneously, so "context" is literally what the model can see right now.</p>
<p>Context is not memory. When the conversation ends, the context vanishes. If the model's context window is 128K tokens and the conversation exceeds that, the oldest tokens are dropped — permanently, unless the system that manages the conversation has stored them somewhere else.</p>
<p>This distinction is the most common source of confusion about AI assistants. A user tells the assistant something, then asks about it in a later conversation, and is confused when the assistant does not remember. The assistant does not remember — it reads. If the information is not in its current context, it cannot use it.</p>
<h2>Context window sizes</h2>
<p>Context windows have grown rapidly. Table stakes in 2026 is 128K tokens for cloud models and 32K–128K for local models. A few models offer 1M+ token windows, but the practical usable length is often shorter because attention degrades on very long sequences and inference latency becomes prohibitive.</p>
<p>Larger context windows are not an unqualified good. They cost more compute, increase latency, and can reduce accuracy — the model's attention is diluted across more tokens, and it may miss information buried in the middle of a long sequence (the "lost in the middle" problem).</p>
<h2>Managing context in practice</h2>
<p>Because context is bounded and expensive, the system around the model must manage what goes into it:</p>
<ul>
<li><strong>Pruning.</strong> Remove turns that add no value — acknowledgements, redundant exchanges, resolved sub-questions.</li>
<li><strong>Summarisation.</strong> Replace a long block of conversation with a concise summary that preserves the key facts.</li>
<li><strong>Prioritisation.</strong> Keep tool results and user instructions; drop filler and small talk.</li>
<li><strong>Retrieval.</strong> Instead of injecting everything into context, keep a searchable store of past conversations and inject only what is relevant to the current request.</li>
</ul>
<p>Arble's session compactor implements all four strategies. It scores each turn by signal value, prunes the lowest-scoring turns, summarises runs of low-signal exchanges, and maintains a separately indexed memory store for cross-session retrieval.</p>
<h2>Context is a system property</h2>
<p>The most important thing to understand about context is that it is a property of the system, not the model. The model defines the maximum window; the system decides what fills it. Two systems using the same model can produce wildly different results because one manages context well and the other does not. That is why the session manager, the compactor, and the memory system are not optional features — they are the core of the operating system.</p>
<h2>What occupies the window</h2>
<p>Everything the model sees on a turn shares one budget, and it is worth knowing the claimants in order of how much they usually take:</p>
<ul>
<li><strong>Conversation history</strong> — every previous message, including the model's own replies.</li>
<li><strong>Tool results</strong> — usually the largest single item, and the most compressible.</li>
<li><strong>Tool definitions</strong> — names, descriptions and schemas for every exposed tool.</li>
<li><strong>System prompt</strong> — instructions, persona, operating rules.</li>
<li><strong>Retrieved memory</strong> — whatever the memory layer surfaced for this turn.</li>
<li><strong>Reserved output space</strong> — the room left for the answer.</li>
</ul>
<p>Tool results dominate because they are machine-generated and verbose. A directory listing, an API response or a page of search results can be thousands of tokens, of which a handful matter after the model has read them once.</p>
<h2>Compaction as a pipeline</h2>
<p>Arble treats this as a staged pipeline rather than a single operation, running six layers in increasing order of aggression: dropping tombstones and progress messages; collapsing results that could be re-derived on demand; capping oversized tool results to a preview; truncating stale text and old thinking blocks; summarising older history with the model itself; and finally an emergency pass that recovers a session which has already overflowed.</p>
<p>The ordering is the design. Cheap, lossless reclamation runs first, and lossy summarisation is a last resort. A system that jumps straight to summarising throws away detail it did not need to lose.</p>
<h2>What compaction costs</h2>
<p>Summarisation is not free in either sense. It costs a model call, which adds latency and money at exactly the moment the conversation is already long. And it is lossy in an unpredictable way — the summary keeps what the summarising model judged important, which is not always what the next turn needs.</p>
<p>This is why the cheaper layers matter so much. Every token reclaimed by dropping a redundant progress message is a token that does not need to be summarised later. Well-tuned early layers can delay or avoid summarisation entirely for most sessions.</p>
<h2>Designing for the limit</h2>
<p>Three habits keep long sessions healthy. Keep tool results narrow at the source, so a tool returns the ten rows that matter rather than a thousand. Push durable facts into memory rather than relying on them staying in the window. And start a fresh session when the subject genuinely changes, rather than carrying an unrelated hour of history into a new task.</p>
<p>The last one is underrated. Context is not an achievement to be preserved; a long window full of irrelevant history makes the model worse, not better.</p>`
},
"07":{
part:"Foundations",
title:"Reasoning",
prev:{num:"06",title:"Context"},
next:{num:"08",title:"AI Agents"},
content:`<h2>Beyond next-token prediction</h2>
<p>Reasoning in language models is an emergent behaviour, not a programmed feature. The model was trained only to predict the next token, but at sufficient scale it develops the ability to follow chains of logic, combine facts from different parts of its context, and work through multi-step problems.</p>
<p>This works because the training data contains examples of reasoning — mathematical proofs, code that implements a specification, dialogue where one person works through a problem step by step. The model internalises the pattern and reproduces it when the prompt invites it.</p>
<h2>Chain-of-thought</h2>
<p>The simplest and most reliable way to elicit reasoning from a language model is to ask it to show its work. Adding "think step by step" to a prompt dramatically improves accuracy on problems that require multiple steps, from arithmetic to logical deduction to planning.</p>
<p>Chain-of-thought works because it forces the model to allocate more of its context window to intermediate steps. The answer is not produced in a single forward pass from the question — it is built incrementally, with each intermediate token helping to shape the next.</p>
<h2>Tool-augmented reasoning</h2>
<p>Language models are not calculators. They can approximate arithmetic, but they are unreliable at exact computation. The solution is not a better model — it is a calculator tool. When the model recognises that a question requires computation, it can call a calculator tool, get the exact result, and incorporate that result into its reasoning.</p>
<p>This pattern extends to every domain where the model is unreliable. For factual questions, it calls a search tool. For code, it calls a runtime. For database queries, it calls a SQL executor. The model reasons about <em>what to do</em>, and the tools handle the parts where statistical prediction is the wrong approach.</p>
<p>In Arble, tool-augmented reasoning is the default mode. Every turn runs through the agent loop: the model decides what to do, the system executes the tool, and the result feeds back into the model's context for the next reasoning step.</p>
<h2>Reasoning in the agent loop</h2>
<p>The Arble agent loop implements reasoning as an explicit phase, not a byproduct. The loop has five stages — Understand, Plan, Execute, Verify, Complete — and each stage is visible to the user. The model reasons about the goal, selects tools, reviews the results, and decides whether the goal is met. If verification fails, the loop iterates: the model re-evaluates, adjusts its plan, and tries again.</p>
<p>This structured loop compensates for the model's statistical nature. A model might reason incorrectly in a single pass, but when it can see the outcome of its own reasoning and has permission to retry, the success rate improves dramatically. The loop is the reasoning system; the model is just the engine that drives it.</p>
<h2>Why intermediate steps help at all</h2>
<p>There is a mechanical explanation, and it is more satisfying than "the model thinks harder". A transformer performs a fixed amount of computation per token generated. A question requiring several dependent steps may simply need more computation than one forward pass provides.</p>
<p>Generating intermediate tokens gives the model more forward passes, and — crucially — each step is written into the context, so later steps can attend to earlier ones. The reasoning trace is external working memory. That is why prompting a model to work through a problem step by step improves accuracy on multi-step tasks and does nothing for single-step recall.</p>
<h2>The trace is not a confession</h2>
<p>The most important caveat in this chapter: a reasoning trace is generated text, subject to the same pressures as any other output. It is not a faithful log of the computation that produced the answer.</p>
<p>Models can produce a plausible chain of reasoning that arrives at a wrong answer, and can produce the right answer with reasoning that does not support it. Research on faithfulness has found cases where a model's stated reasoning omits the factor that actually determined its output. Read traces as evidence, not as proof — useful for spotting where things went wrong, unreliable as a guarantee that they went right.</p>
<h2>Reasoning models and the budget dial</h2>
<p>Newer models are trained specifically to reason before answering, often with a controllable budget for how much internal deliberation to spend. This turns reasoning depth into a parameter rather than a prompting trick.</p>
<p>For a routing layer this is a third axis alongside model choice and provider. A trivial lookup wants no reasoning budget at all; a multi-constraint scheduling problem justifies a large one. Spending a reasoning budget on "what time is it in Berlin" is pure waste, and spending none on a task with four interacting constraints produces a confident wrong answer.</p>
<h2>Reasoning inside an agent loop</h2>
<p>In a single-shot chat, reasoning happens once. In an agent loop it happens at every iteration, and it is doing a different job: deciding which tool to call, interpreting what came back, and judging whether the goal has been met.</p>
<p>That third judgement is the hardest and the least discussed. Knowing when to stop is a reasoning task in its own right, and it is where loops most often fail — either halting while the task is half-done, or continuing to poke at a problem that was finished several steps ago. A runtime helps by making the stopping condition explicit and by capping iterations, but the judgement itself is the model's.</p>
<p>Older reasoning traces are also the first thing worth discarding when context runs short. The conclusion matters; the deliberation that produced it usually does not, once the next step is underway.</p>`
},
"08":{
part:"Agents",
title:"AI Agents",
prev:{num:"07",title:"Reasoning"},
next:{num:"09",title:"Planning"},
content:`<h2>From model to agent</h2>
<p>A language model, by itself, is passive. It waits for a prompt and produces a response. An agent is an active system that uses a language model as its decision-making component but also has the ability to take actions, observe results, and persist state across multiple turns.</p>
<p>The difference is the loop. A model completes one request-response cycle and stops. An agent runs in a loop: decide what to do, execute it, observe the result, and decide what to do next. The loop continues until the goal is achieved, the agent determines it cannot proceed, or a human intervenes.</p>
<h2>The agent loop</h2>
<p>Every agent follows the same abstract loop:</p>
<ol>
<li><strong>Observe.</strong> Receive input — a user message, a scheduled trigger, a tool result, a system event.</li>
<li><strong>Think.</strong> The language model processes the observation in context and generates a response. The response may be text, a tool call, or both.</li>
<li><strong>Act.</strong> If the response includes a tool call, execute it. The tool runs (a file is written, an API is called, a search is performed).</li>
<li><strong>Observe.</strong> The tool result is added to context. Go back to step 2.</li>
</ol>
<p>This loop is what Arble's QueryEngine orchestrates. It manages the conversation state, injects system prompts and tool schemas, routes tool calls to the registry, and handles errors, retries, and timeouts.</p>
<h2>Autonomy vs. consent</h2>
<p>The defining parameter of an agent is how much autonomy it has. An agent that must ask for permission before every action is slow but safe. An agent that can act freely is fast but risky.</p>
<p>Arble models autonomy through a permission system with three levels:</p>
<ul>
<li><strong>Ask.</strong> Every tool call pauses until the user approves or rejects it.</li>
<li><strong>Auto.</strong> Low-risk tool calls (reads, searches, calculations) run without approval. Writes and sends still ask.</li>
<li><strong>Trusted.</strong> The agent can run any tool from a specified set without approval.</li>
</ul>
<p>The permission level can be set per tool and per session, and the user can see and change it at any time. The agent itself does not decide its own autonomy — the system enforces the boundary.</p>
<h2>Multiple agents</h2>
<p>Arble supports running multiple agents simultaneously, each with its own session, its own tool registry, and its own permission level. Agents can share memory (through the unified memory store) but cannot see each other's active context. This lets a user run a research agent, a scheduling agent, and a coding agent side by side, each focused on its own domain.</p>
<p>The coordinator in Arble manages agent lifecycle — creation, scheduling, suspension, and termination. Agents can be started manually, triggered by a schedule, or spawned by another agent for subtasks.</p>
<h2>The loop, concretely</h2>
<p>Strip away the vocabulary and an agent is a while-loop with a model inside it. The runtime sends the conversation to the model; the model replies with either text or a request to call a tool; if it is a tool call, the runtime executes it and appends the result to the conversation; then it sends the whole thing back. It repeats until the model answers without asking for a tool, or until a limit is hit.</p>
<p>Everything else — planning, memory, delegation — is an elaboration on that loop. Understanding it as a loop makes the failure modes obvious: it can spin without progressing, it can stop early, it can lose the thread as history grows, and it can take an action nobody sanctioned.</p>
<h2>What the runtime owns</h2>
<p>The model contributes judgement. Every other responsibility belongs to the runtime around it, and in Arble those responsibilities are explicit: session lifecycle including create, resume and interrupt; message history; token accounting and when to trigger compaction; the streaming pipeline from input to rendered output; tool execution behind permission checks; error handling and recovery; and spawning subagents when work should run in parallel.</p>
<p>Splitting it this way is what makes the system testable. The loop is driven by injected dependencies — the function that streams the model, the one that executes tools, the one that compacts — so each can be substituted in tests. An agent whose loop is entangled with a specific provider SDK cannot be tested without that provider.</p>
<h2>Streaming as an architectural choice</h2>
<p>Arble's runtime is built on async generators: every phase of the lifecycle yields messages incrementally rather than returning a finished result at the end.</p>
<p>This is not only about showing text as it arrives. It means the interface can render a tool call the moment it is proposed, show progress while it runs, and surface a permission prompt mid-flight — all without the loop having to finish. It also makes interruption coherent: an abort signal propagates through the generator chain, so stopping means stopping, not waiting for an in-flight request to complete and discarding it.</p>
<h2>Where agents actually fail</h2>
<p>In practice, four failure modes account for most bad behaviour:</p>
<ul>
<li><strong>Looping without progress.</strong> The model retries a failing call with slightly different arguments forever. Iteration caps exist for this.</li>
<li><strong>Premature completion.</strong> The model decides the goal is met when it has done part of it — usually because the goal was underspecified.</li>
<li><strong>Context decay.</strong> Twenty turns in, the original instruction is buried mid-window where attention is weakest, and the agent drifts.</li>
<li><strong>Unsanctioned action.</strong> The model proposes something destructive and nothing stops it. This is the only one of the four that is a design failure rather than a tuning problem.</li>
</ul>
<p>The first three are mitigated with caps, clearer goals and compaction. The fourth is why the permission gate is structural rather than advisory.</p>`
},
"09":{
part:"Agents",
title:"Planning",
prev:{num:"08",title:"AI Agents"},
next:{num:"10",title:"Tool Calling"},
content:`<h2>Why agents need to plan</h2>
<p>A single tool call can handle a simple request — "what is the weather?" — but most useful work requires multiple steps in sequence: search for information, analyse the results, compose a response, write it to a file, and send a notification. Without planning, the agent would handle each step reactively, making up the next action based only on the immediately preceding result.</p>
<p>Planning gives the agent a structure. Instead of deciding each step from scratch, it produces a high-level sequence — "first research, then analyse, then compose, then deliver" — and executes against it. If a step fails, the plan adapts. If new information changes the approach, the plan is revised.</p>
<h2>Plan representations</h2>
<p>Plans in Arble are represented as structured data, not free text. A plan is a sequence of steps, where each step has a goal, a set of tools that could achieve it, and success criteria. The plan is generated by the model at the start of a complex request and is stored in the session context so the model can refer back to it.</p>
<p>The plan representation includes:</p>
<ul>
<li><strong>Steps.</strong> A numbered list of actions or sub-goals.</li>
<li><strong>Dependencies.</strong> Which steps must complete before others begin.</li>
<li><strong>Fallbacks.</strong> What to do if a step fails — retry, skip, or abort.</li>
<li><strong>State.</strong> Each step's current status: pending, running, completed, failed, or skipped.</li>
</ul>
<p>This structured format lets the system track progress, visualise the plan to the user, and make targeted updates when the plan changes.</p>
<h2>Re-planning</h2>
<p>No plan survives contact with reality. Tools return unexpected results, APIs fail, and the user changes their mind mid-request. The agent must detect when the current plan no longer applies and generate a new one.</p>
<p>Re-planning is triggered by:</p>
<ul>
<li><strong>Tool failure.</strong> A tool returns an error rather than a result.</li>
<li><strong>Missing information.</strong> The agent realises it needs data it does not have.</li>
<li><strong>User interrupt.</strong> The user provides additional instructions mid-execution.</li>
<li><strong>Goal drift.</strong> The agent determines that the current plan will not achieve the original goal.</li>
</ul>
<p>When re-planning occurs, the agent preserves completed steps and only regenerates the plan from the failure point forward. The full history — including the failed attempt — stays in context so the model can learn from what went wrong.</p>
<h2>Planning in the agent loop</h2>
<p>In Arble's five-stage loop, planning is the second stage. The Understand stage analyses the user's request and extracts the goal. The Plan stage produces the step sequence. Execute runs the steps. Verify checks the results. Complete finalises and reports. This explicit separation means the user can see the plan before any action is taken, approve or modify it, and watch progress through each stage.</p>
<h2>Explicit plans versus implicit ones</h2>
<p>There are two ways to get planning out of a model. The implicit approach lets the loop plan by doing: the model picks the next tool, sees the result, and picks again. The explicit approach asks for a plan up front and then executes it.</p>
<p>Each fails differently. Implicit planning is adaptive but myopic — it makes locally sensible choices that add up to a bad route, and it cannot tell you what it intends to do before it starts. Explicit planning is legible and reviewable but brittle: the plan was written before any results came back, and step four often assumes something step two disproved.</p>
<p>Most working systems blend them, planning explicitly at a coarse level and improvising within each step. Arble's permission system supports this directly with a plan mode, in which the agent works out and presents what it intends to do without executing any of it.</p>
<h2>Why plan mode matters</h2>
<p>A plan you can read before anything happens changes the review problem. Instead of approving eleven individual tool calls as they arrive — where fatigue guarantees you will start approving without reading — you review one plan once, at a moment when nothing has been done yet.</p>
<p>It also surfaces misunderstandings early. If the agent has misread the goal, that is visible in the plan, before it has sent anything or modified anything. The cheapest place to catch a wrong intention is before the first action.</p>
<h2>Decomposition and its limits</h2>
<p>Good decomposition produces steps that are independently checkable and that fail loudly. "Find the three most recent invoices from this supplier" is a good step: you can look at the output and tell whether it worked. "Handle the invoices" is not — there is no observation that confirms it.</p>
<p>The limit is that decomposition costs context and latency. Every step is at least one model call plus its results in the window. Splitting a task into fifteen steps when four would do makes the agent slower, more expensive, and more likely to lose the thread. Granularity is a real trade-off, not a virtue to maximise.</p>
<h2>Replanning</h2>
<p>The step that most often gets skipped is deciding what to do when a step fails. A plan without a revision path turns any failure into either a stall or a blind retry.</p>
<p>Useful systems distinguish kinds of failure. A transient network error deserves a retry. A permission denial means the route is closed and a different route is needed — retrying is pointless and, if the user keeps denying, actively hostile. A schema validation error means the model built the call wrong and should rebuild it with the error in view. An empty result usually means the plan's assumption was wrong and the plan itself needs revisiting, not the call.</p>
<p>Treating all four the same is the most common reason agents thrash.</p>`
},
"10":{
part:"Agents",
title:"Tool Calling",
prev:{num:"09",title:"Planning"},
next:{num:"11",title:"Memory"},
content:`<h2>How models call tools</h2>
<p>Language models do not actually execute code. When they determine that a tool call is needed, they output a structured JSON blob describing which tool to call and with what parameters. The system intercepts this JSON, validates it against the tool's schema, executes the tool, and injects the result back into the model's context as if it were a system message.</p>
<p>The model never calls tools directly. It proposes tool calls; the system decides whether to honour them, based on the permission gate and schema validation. This separation is critical for safety — the model cannot accidentally execute a tool, and the system can reject malformed or dangerous calls.</p>
<h2>Tool declaration</h2>
<p>Every tool in the registry declares its interface using a typed schema. The schema includes:</p>
<ul>
<li><strong>Name and description.</strong> What the tool does, used by the model to decide when to call it.</li>
<li><strong>Parameter schema.</strong> The JSON Schema for each parameter, including types, enums, descriptions, and whether the parameter is required.</li>
<li><strong>Return type.</strong> What the tool returns — text, structured data, a file, or a stream.</li>
<li><strong>Side effects.</strong> Whether the tool reads, writes, sends data, or has other side effects. This feeds into the permission system.</li>
</ul>
<p>Arble's tool registry holds over 500 typed tools across 56 toolsets. Each toolset is a coherent group — communication tools, file tools, search tools, smart home tools — and toolsets can be enabled or disabled per session. The model only sees the schemas of tools in the active toolset, which keeps the context window from filling with irrelevant declarations.</p>
<h2>Parallel and sequential calls</h2>
<p>Models can propose multiple tool calls in a single response. When a model outputs several independent tool calls — "search the web" and "check my calendar" in parallel — Arble executes them concurrently and collects all results before the next model turn. If calls are dependent, the model sequences them naturally: the result of one call is in context when the model decides the next call.</p>
<p>This parallel execution is transparent to the model. It outputs the calls it wants and receives all the results together. The system handles the scheduling, error handling, and timeout management.</p>
<h2>Streaming and progress</h2>
<p>Long-running tool calls — file downloads, multi-step searches, model inference — stream their progress back through the agent loop. The user sees a live status update (e.g., "Searching 12 sources… 4 complete") without waiting for the full result. The progress information is also available to the model, so it can decide to proceed with partial results if appropriate.</p>
<h2>The pipeline a call passes through</h2>
<p>A tool call is not a function invocation. In Arble it passes through a ten-step pipeline before anything happens: the tool is resolved by name or alias, its input is parsed and validated against a schema, business rules are checked, the permission gate is consulted, hooks run, the tool executes with progress reporting, and the result is formatted for the message history and logged for attribution.</p>
<p>Each stage exists because of a failure mode. Name resolution handles the model inventing a plausible alias. Schema validation catches malformed arguments before they reach code that assumes they are well-formed. The permission gate catches the call that is valid and still unwanted. Result formatting keeps a verbose response from consuming the context window.</p>
<h2>Schemas as the contract</h2>
<p>Tools are declared with typed schemas, and the schema does two jobs at once. It tells the model what a valid call looks like, and it gives the runtime something to validate against.</p>
<p>The description field carries more weight than its size suggests. It is the entire basis on which the model chooses between similar tools, and vague descriptions produce systematically wrong selection. A description that says what the tool does, when to use it, and — most usefully — when <em>not</em> to use it, measurably improves tool choice. This is prompt engineering that lives in the tool definition rather than the system prompt.</p>
<h2>The cost of a large registry</h2>
<p>Arble ships 82 built-in tools across roughly 50 files. Exposing all of them on every request would consume a substantial share of the context window before the user has said anything, and would degrade selection accuracy — more options means more chances to pick wrong.</p>
<p>The answer is progressive disclosure. Past a threshold, the system stops listing every tool and instead exposes a search over the registry, so the model finds the tool it needs rather than reading the catalogue. This trades one extra call for a much smaller prompt and better selection, and it is what allows the registry to keep growing without every new tool making the system slightly worse.</p>
<h2>Results, errors and concurrency</h2>
<p>How a tool reports failure matters as much as how it succeeds. An error message the model can act on — what was wrong, what a valid input looks like — often leads to a correct retry. An opaque failure leads to a guess.</p>
<p>Concurrency is the other lever. Independent read-only calls can run in parallel, and for a task that touches several sources this is the difference between a few seconds and half a minute. Writes generally cannot, because ordering matters and partial failure is harder to reason about. Arble's execution engine supports both concurrent and serial execution for exactly this reason: the safe default is serial, and parallelism is applied where it is provably safe.</p>`
},
"11":{
part:"Agents",
title:"Memory",
prev:{num:"10",title:"Tool Calling"},
next:{num:"12",title:"Multi-Agent"},
content:`<h2>Three kinds of memory</h2>
<p>AI systems need different kinds of memory for different time horizons. Arble implements three distinct memory systems:</p>
<ul>
<li><strong>Episodic memory.</strong> The conversation history within a session. This is the model's context window — what happened in the current conversation. It is managed by the session manager and compactor.</li>
<li><strong>Semantic memory.</strong> Facts, preferences, and knowledge extracted from past conversations and stored for retrieval. This is the memory store — names, project details, tool preferences, facts about the user.</li>
<li><strong>Procedural memory.</strong> Instructions on how to do things — custom skills, saved workflows, tool configurations. This is stored as executable specifications that the agent can load and run.</li>
</ul>
<h2>Episodic memory: the session</h2>
<p>The session holds the current conversation as a sequence of turns. Each turn contains the user message, the model's response (including any tool calls), and the tool results. The session compactor runs continuously, scoring each turn and pruning low-value ones when the context window is approached.</p>
<p>The compaction strategy preserves:</p>
<ul>
<li><strong>User instructions</strong> — these are never dropped.</li>
<li><strong>Tool results</strong> — especially those the user has referenced or approved.</li>
<li><strong>Decision points</strong> — where the model chose one approach over another.</li>
<li><strong>Summaries</strong> — compact representations of pruned conversation blocks.</li>
</ul>
<h2>Semantic memory: the store</h2>
<p>The semantic memory store is a vector database (powered by SQLite FTS5 and embeddings) that indexes facts from past conversations. When the agent receives a request, the memory system searches for relevant entries and injects them into context alongside the session history.</p>
<p>Entries in the memory store have:</p>
<ul>
<li><strong>Content.</strong> The fact or observation, stored as text.</li>
<li><strong>Source.</strong> Which session and turn created it.</li>
<li><strong>Timestamp.</strong> When it was recorded.</li>
<li><strong>Embedding.</strong> A vector representation for similarity search.</li>
<li><strong>Importance.</strong> A score that determines whether the entry survives compaction.</li>
</ul>
<p>The memory store is searchable across sessions, across agents, and across devices (via sync). A fact learned in a Monday conversation is available in a Friday conversation without being re-stated.</p>
<h2>Procedural memory: skills</h2>
<p>Skills are reusable procedures that the agent can load and execute. A skill is a sequence of tool calls with parameter templates, success criteria, and permission requirements. Skills can be:</p>
<ul>
<li><strong>Built-in.</strong> Shipped with Arble — daily digest, research workflow, email triage.</li>
<li><strong>User-defined.</strong> Recorded from a conversation — "when I say 'trip report', do this sequence of steps."</li>
<li><strong>Shared.</strong> Imported from other users or the skill marketplace.</li>
</ul>
<p>Skills are a form of few-shot prompting: instead of injecting examples into every conversation, the agent loads the skill as a structured procedure and executes it. This saves context and makes the behaviour consistent across runs.</p>
<h2>Three stores, three jobs</h2>
<p>Arble's knowledge layer is not one thing. Episodic memory holds diary-style entries in Markdown, organised by date. Session persistence holds conversation history and its summaries. Skills hold task-specific expertise loaded on demand. Each answers a different question — what happened, what we said, and how to do this.</p>
<p>Keeping them separate matters because they have different lifetimes and different retrieval patterns. A conversation from March is worth searching but not worth loading. A durable fact about a colleague should survive every session. A skill should only occupy context while the task that needs it is active.</p>
<h2>Search across everything</h2>
<p>Memory is only as good as retrieval, and retrieval that only covers one store forces the user to know where something was written down. Arble indexes episodic entries with SQLite FTS5 and exposes a unified search that spans episodic memory, session messages and session summaries together, returning snippets rather than whole documents.</p>
<p>Snippets are the detail that makes this affordable. Returning three matching paragraphs costs a few hundred tokens; returning three matching documents can cost several thousand, most of it irrelevant. The search layer is also a compression layer.</p>
<h2>What is worth remembering</h2>
<p>The hard problem is not storage, it is selection. A system that records everything produces a store where retrieval surfaces noise; a system that records too little is amnesiac.</p>
<p>The usable heuristic is durability. Facts that will still be true and still matter next month are worth writing down: who people are, what projects exist, stated preferences, decisions and their reasons. Transient state is not: what the weather was, what the intermediate tool result said, what the model was in the middle of doing. Most of a conversation is scaffolding, and scaffolding is exactly what compaction is for.</p>
<h2>Memory as a liability</h2>
<p>A memory system that works is also an accumulating record of someone's life, and that cuts both ways.</p>
<p>Two properties make it defensible. The first is locality: entries are files and rows on the device, not documents in a vendor's database, so the blast radius of a breach elsewhere does not include your diary. The second is legibility: episodic memory is Markdown, which means it can be read, edited and deleted with any text editor. A memory you cannot inspect is a memory you cannot correct, and a wrong fact that persists across every future session is worse than no memory at all.</p>
<p>Stale memory is the failure nobody plans for. Someone changes jobs, a project ends, a preference reverses — and a system with no notion of freshness will keep confidently applying last year's facts. Timestamps and the ability to delete are not conveniences; they are what keep memory from decaying into misinformation.</p>`
},
"12":{
part:"Agents",
title:"Multi-Agent",
prev:{num:"11",title:"Memory"},
next:{num:"13",title:"Orchestration"},
content:`<h2>Why multiple agents</h2>
<p>One agent can handle a wide range of tasks, but some problems benefit from specialisation. A research agent that has access to web search and document analysis does not need to also carry the smart home toolset or the email tools. Separating concerns into multiple agents gives each one a focused tool registry, a shorter system prompt, and a cleaner context window.</p>
<p>Multi-agent systems also provide isolation. An agent handling untrusted data (web search results) should not share context with an agent that has write access to your email. By running separate agents with separate sessions and separate permission levels, the system limits the blast radius of any single mistake.</p>
<h2>Agent communication</h2>
<p>Agents in Arble communicate through a shared memory store and a message bus. Agent A can write a result to the memory store with a tag that agent B subscribes to. Agent B picks it up on its next scheduling cycle and processes it.</p>
<p>This is asynchronous by design. Agent A does not wait for agent B — it finishes its work, publishes the result, and moves on. Agent B runs on its own schedule, picks up the result, and processes it. This decoupling means agents do not need to be co-scheduled and do not block each other.</p>
<p>For synchronous coordination — "agent B, I need your result before I can continue" — the coordinator manages a dependency graph. Agent A marks its dependency on B, the coordinator ensures B runs first, and A only proceeds once B's result is available.</p>
<h2>Coordinator</h2>
<p>Arble's coordinator manages the lifecycle of all running agents. It handles:</p>
<ul>
<li><strong>Creation.</strong> Instantiating a new agent with its tool registry, session, and permission level.</li>
<li><strong>Scheduling.</strong> Running agents on a timer, on demand, or triggered by events.</li>
<li><strong>Dependencies.</strong> Managing the execution order when agents depend on each other.</li>
<li><strong>Resource limits.</strong> Enforcing per-agent limits on tool calls, token usage, and execution time.</li>
<li><strong>Lifecycle.</strong> Suspending idle agents, terminating stuck agents, and cleaning up completed agents.</li>
</ul>
<p>The coordinator itself is not an agent — it is a system service that runs in its own process. It does not use a language model; it operates on structured data and predefined rules.</p>
<h2>When to use multiple agents</h2>
<p>Not every task benefits from multiple agents. The overhead of coordination, context switching, and dependency management is only justified when:</p>
<ul>
<li><strong>Toolsets are disjoint.</strong> Research tools and home automation tools have no overlap, so separate agents keep each context clean.</li>
<li><strong>Permission levels differ.</strong> A high-trust agent for scheduling and a low-trust agent for web browsing should not share a session.</li>
<li><strong>Tasks run on different schedules.</strong> A daily report agent runs once a day; a notification agent runs continuously.</li>
<li><strong>Parallel execution helps.</strong> Independent subtasks run faster in separate agents than sequentially in one.</li>
</ul>
<h2>Why one agent is not always enough</h2>
<p>A single agent executes one tool at a time, or a bounded concurrent batch. For tasks that are genuinely parallel — researching five suppliers, checking four calendars, reading three repositories — sequential execution wastes most of the available time on waiting.</p>
<p>Arble's Coordinator addresses this by letting a primary agent spawn named worker agents, each running in its own isolated QueryEngine with its own subset of tools, communicating back through an inbox-based messaging system with a shared scratchpad for state.</p>
<h2>Isolation is the point</h2>
<p>The reason each worker gets its own engine is context. If five research threads shared one window, each would be reading the others' intermediate results, and the window would fill with material irrelevant to any single thread.</p>
<p>Isolation means each worker sees only its own task and its own results. The coordinator sees the summaries. This is a much better use of the total token budget, and it produces better output per worker, because each is reasoning over a focused context rather than a shared pile.</p>
<p>The tool subsetting matters for the same reason, plus a safety one: a worker doing read-only research does not need send or delete tools, and not granting them removes an entire class of mistake rather than relying on the gate to catch it.</p>
<h2>What multi-agent costs</h2>
<p>Delegation is not free, and it is oversold. Every worker has its own system prompt, its own tool definitions and its own overhead, so five workers cost meaningfully more than one agent doing five things in sequence. Coordination adds its own failures: workers that duplicate each other's work, results that contradict, a worker that stalls while the coordinator waits.</p>
<p>The honest rule is that multi-agent execution pays off when subtasks are genuinely independent and each involves real waiting. It does not pay off for tasks that are fast, sequential, or that need the same context to make sense. A great deal of published multi-agent work is a slower, more expensive way to do what one loop would have done.</p>
<h2>Merging</h2>
<p>The step that determines whether the whole thing was worth it is the merge. Five good research results and a bad synthesis is a bad answer.</p>
<p>Merging has to handle contradiction rather than average over it. When two workers disagree, the useful output says so and explains the disagreement; an output that silently picks one has thrown away the most valuable thing the parallel work produced. Preserving each finding's source is what makes that possible — and what lets the reader check a claim without rerunning the task.</p>`
},
"13":{
part:"Agents",
title:"Orchestration",
prev:{num:"12",title:"Multi-Agent"},
next:{num:"14",title:"Desktop AI"},
content:`<h2>What orchestration means</h2>
<p>Orchestration is the coordination of multiple components — models, tools, agents, memory — to produce a result that no single component could produce alone. It is the "glue" of an AI operating system: the part that decides which tool to call, when to switch models, what to retrieve from memory, and how to combine everything into a coherent response.</p>
<p>Orchestration happens at two levels in Arble. At the micro level, the agent loop orchestrates individual turns: understand the request, plan the approach, execute tools, verify results. At the macro level, the coordinator orchestrates multiple agents: scheduling, dependencies, resource allocation, message passing.</p>
<h2>The orchestration engine</h2>
<p>Arble's orchestration engine is a state machine that runs inside the QueryEngine. Each session has an orchestration state that tracks:</p>
<ul>
<li><strong>Current phase.</strong> Which of the five stages the conversation is in.</li>
<li><strong>Plan.</strong> The current step sequence, if one exists.</li>
<li><strong>Context window.</strong> The current set of turns and their token counts.</li>
<li><strong>Dependencies.</strong> Which tool calls are in flight and which results are pending.</li>
<li><strong>Loop count.</strong> How many iterations have run, to detect infinite loops.</li>
</ul>
<p>The engine processes one turn at a time. Each turn goes through the five stages, and the engine decides whether to loop (tool results need further processing), advance (the plan has more steps), or complete (the goal is met).</p>
<h2>Error handling and recovery</h2>
<p>Orchestration must handle failures gracefully. A tool that times out, a model that returns an empty response, a permission that the user denies — none of these should crash the session. The orchestration engine has built-in recovery strategies:</p>
<ul>
<li><strong>Retry.</strong> If a tool fails with a transient error, retry up to a configurable limit with exponential backoff.</li>
<li><strong>Fallback.</strong> If the primary model is unavailable, route to a secondary model.</li>
<li><strong>Skip.</strong> If a non-critical step fails, skip it and continue.</li>
<li><strong>Escalate.</strong> If the agent cannot recover, pause and ask the user for guidance.</li>
</ul>
<p>Each session has a configurable maximum loop count and timeout. If the agent exceeds either, the session is paused and the user is notified. This prevents runaway agents from consuming resources indefinitely.</p>
<h2>Observability in orchestration</h2>
<p>Every orchestration decision is logged. The user can see the current phase, the plan steps, the tool calls in flight, and the history of decisions that led to the current state. This transparency is what makes Arble's orchestration different from a black-box agent: you can always see what it is doing, what it has done, and why.</p>
<h2>Orchestration versus agency</h2>
<p>Two things get called automation and they behave very differently. A workflow is a graph someone drew: fixed steps, explicit branches, deterministic and repeatable. An agent decides its own steps at runtime.</p>
<p>Workflows are right when the process is known and repetition matters — the same shape every time, auditable, cheap. Agents are right when the process cannot be enumerated in advance. The mistake in each direction is expensive: using an agent for a fixed nightly job means paying model inference to rediscover a route you already knew, and using a workflow for an open-ended task means a graph that breaks on every case its author did not foresee.</p>
<h2>Using both</h2>
<p>The productive pattern is an agent that can call workflows. Arble connects to n8n and exposes it as tools — listing workflows, triggering execution, monitoring status, creating and updating templates, handling webhooks — which puts several hundred existing integrations behind one tool surface.</p>
<p>This gives you determinism where determinism is available and judgement where it is not. The agent decides <em>that</em> the invoice workflow should run and with what inputs; the workflow runs the same way every time. Neither layer is asked to do the other's job.</p>
<h2>Work that happens without you</h2>
<p>Orchestration also covers work with no one watching. Arble runs a scheduler for time-based operations — firing reminders, refreshing heartbeat state for gateway presence, periodic checks and sync — outside the main agent loop so a long-running background task does not block the conversation.</p>
<p>Unattended execution changes the permission question sharply. Interactive approval assumes someone is there to approve; a task firing at 3am has nobody. This is what the distinct permission modes are for: a background agent can be granted a narrow set of auto-approved read operations and nothing else, so the worst case of an unattended run is a wasted call rather than an unwanted send.</p>
<h2>Making it observable</h2>
<p>Anything that runs unattended has to be inspectable afterwards, or it is not trustworthy — you would be accepting on faith that a system with real capabilities behaved itself while you were asleep.</p>
<p>The minimum is a durable record of what ran, when, which tools it called, what they returned, and what it cost. In Arble this is the activity log, and its value is not debugging so much as consent: a schedule you can read the history of is a schedule you can decide to keep running. One you cannot is one you should turn off.</p>`
},
"14":{
part:"Devices",
title:"Desktop AI",
prev:{num:"13",title:"Orchestration"},
next:{num:"15",title:"Mobile AI"},
content:`<h2>AI on the desktop</h2>
<p>Desktop AI refers to running language models and agent systems on a laptop or workstation rather than in the cloud. The desktop has more memory, a more powerful GPU, and a stable power supply compared to a phone, which means it can run larger models — 70B parameter models become practical, and inference speeds are measured in tokens per second rather than seconds per token.</p>
<p>The desktop is also where most professional work happens. The tools that an AI assistant needs to integrate with — code editors, terminal, file system, browser — live on the desktop. A desktop AI system can interact with these tools directly, without going through an API.</p>
<h2>The Arble desktop agent</h2>
<p>Arble's desktop companion is a Node.js MCP server that runs on macOS, Windows, and Linux. It exposes the desktop's capabilities as tools that the mobile agent can call:</p>
<ul>
<li><strong>File system.</strong> Read, write, search, and organise files on the desktop.</li>
<li><strong>Shell.</strong> Execute terminal commands and capture output.</li>
<li><strong>Screen.</strong> Capture screenshots and identify UI elements.</li>
<li><strong>Clipboard.</strong> Read and write the system clipboard.</li>
<li><strong>Keyboard and mouse.</strong> Simulate input for automation.</li>
<li><strong>Browser.</strong> Interact with web pages through a headless or visible browser.</li>
</ul>
<p>The desktop agent pairs with the mobile app over the local network using mDNS discovery and a WebSocket relay. No cloud infrastructure is involved — the connection is direct, encrypted, and confined to your network.</p>
<h2>Desktop as a model host</h2>
<p>Beyond tool access, the desktop can serve as a model host for the mobile device. A phone cannot run a 70B parameter model at usable speeds, but it can route inference requests to a desktop that can. The router in Arble supports this transparently: the mobile app sends a request, the router checks available endpoints, and if a desktop-hosted model is the best match, the request is forwarded over the local connection.</p>
<p>This hybrid approach gives the user the best of both worlds: the portability of mobile with the compute power of desktop. A local model on the desktop serves as a private, free inference endpoint for complex tasks, while cloud models handle tasks that need capabilities the local model lacks.</p>
<h2>Desktop app (Electron)</h2>
<p>For users who prefer a native desktop experience, Arble provides a full Electron desktop app. It runs the same agent runtime as the mobile app, with the same session manager, memory store, and tool registry, but rendered in a desktop window. The desktop app can run standalone (connected directly to cloud models) or paired with the mobile app (sharing the same agent and memory across both devices).</p>
<h2>How pairing works</h2>
<p>Arble finds desktop agents on the local network rather than through an account. The desktop agent advertises itself over mDNS/Bonjour, the app discovers it, and the two speak MCP over HTTP.</p>
<p>The consequence of that choice is where the traffic goes: from your phone to your machine, across your own LAN. There is no relay in the middle to be down, to be subpoenaed, or to be reading. It also means the feature works on a plane with the wifi on and the internet off, which is a reasonable test of whether something is really local.</p>
<h2>Why the desktop is worth reaching at all</h2>
<p>A phone is with you and a desktop has your working life on it — the repositories, the shell, the files, the applications with real capability. Reaching one from the other lets you start work from wherever you are without either device pretending to be the other.</p>
<p>The division that works in practice is that the phone holds intent and the desktop holds capability. You say what you want on the device that is in your hand; the work happens on the device that can actually do it.</p>
<h2>The trust boundary</h2>
<p>A desktop agent is the most powerful thing in this system and deserves to be treated that way. It can read your filesystem and run commands, which is precisely why it is useful and precisely why it needs the tightest constraints.</p>
<p>Three properties do most of the work. Pairing is explicit, so a machine does not become reachable by being on the same network. The permission gate applies to desktop tools exactly as it does to local ones, so a shell command from the phone still stops and asks. And the surface is a declared tool list rather than arbitrary remote execution — the agent can do the things the agent exposes, not anything at all.</p>
<h2>When the desktop is not there</h2>
<p>Anything depending on another machine has to degrade honestly. The desktop is asleep, off the network, or the app has moved to cellular — all normal, none of them errors.</p>
<p>The behaviour that respects the user is to say so. Tools that need the desktop should be visibly unavailable rather than failing at call time with a timeout, and the agent should say the machine is unreachable instead of quietly substituting something else. A system that silently does something different from what you asked is worse than one that admits it cannot help.</p>`
},
"15":{
part:"Devices",
title:"Mobile AI",
prev:{num:"14",title:"Desktop AI"},
next:{num:"16",title:"Screen Understanding"},
content:`<h2>Mobile-first AI</h2>
<p>Mobile AI faces constraints that desktop and cloud systems do not. Battery life, memory bandwidth, thermal limits, and intermittent connectivity all shape what is possible. But the phone is also the device that is always with you, always connected, and always ready — it has sensors, cameras, microphones, and a persistent data connection that no desktop can match.</p>
<p>Arble is built mobile-first. The agent loop runs entirely on the device — the session manager, the memory store, the permission gate, and the model router all execute on the phone. The only component that may leave the device is the model inference call, and even that is optional when a local model is used.</p>
<h2>On-device constraints</h2>
<p>Running an agent system on a phone means working within tight limits:</p>
<ul>
<li><strong>Memory.</strong> A typical phone has 6–8 GB of RAM shared with the OS and other apps. Arble uses MMKV for fast key-value storage and SQLite with FTS5 for memory search, both designed for low memory overhead.</li>
<li><strong>Processing.</strong> The agent loop itself is lightweight — it is mostly string manipulation and JSON parsing. The heavy computation is model inference, which runs on the Neural Engine or GPU when available.</li>
<li><strong>Battery.</strong> Background agents use background tasks with configurable intervals and heartbeat checks. Arble uses iOS BGTaskScheduler and Android WorkManager to wake the agent only when needed.</li>
<li><strong>Thermals.</strong> Sustained inference heats the device. The runtime monitors temperature and throttles or pauses agent activity when thresholds are exceeded.</li>
</ul>
<h2>Mobile-specific capabilities</h2>
<p>The phone's hardware enables capabilities that are unique to mobile AI:</p>
<ul>
<li><strong>Live Activities.</strong> iOS Dynamic Island and Lock Screen widgets show agent status at a glance — which tool is running, what the agent is working on, how many tasks are queued.</li>
<li><strong>Share Sheet integration.</strong> Text, links, images, and files can be sent directly from any app to the Arble agent via the share extension.</li>
<li><strong>Voice input.</strong> The agent can accept spoken requests and respond with text or speech, using the device's built-in speech recognition and synthesis.</li>
<li><strong>Notifications.</strong> Long-running tasks notify the user on completion. Permission requests appear as interactive notifications.</li>
</ul>
<h2>Background execution</h2>
<p>Agents continue working while the app is in the background. The background task scheduler manages wake-ups, heartbeat checks, and task execution within the OS's constraints. Each wake-up is logged, and the user can review all background activity in the activity log.</p>
<p>Background execution is not unlimited. The OS imposes time limits on background tasks (typically 30 seconds on iOS). Arble's runtime breaks long tasks into chunks that fit within these limits and resumes them on subsequent wake-ups.</p>
<h2>What the platform gives and takes</h2>
<p>Arble is built with React Native and Expo, targeting iOS and Android, with a reduced web build. The platform matrix is uneven in ways worth knowing: model streaming, MCP tools, voice input, notifications, background tasks and LAN discovery all work on both mobile platforms; on web, streaming is limited and MCP tools, voice, notifications, background execution and discovery are unavailable.</p>
<p>That asymmetry is not an oversight. Several of those capabilities require APIs a browser tab does not have — a browser cannot advertise itself on the local network or run work after you close it. Web is a viewer; the phone is the runtime.</p>
<h2>Battery and thermals as design constraints</h2>
<p>A phone is a computer with a thermal budget and a battery someone notices. This changes what is reasonable to run and for how long, in ways a server-side agent never has to think about.</p>
<p>Practically it argues for streaming over batch, so work is visible immediately rather than after a long silent burn; for local models sized to the device rather than the largest that technically loads; and for background work that is scheduled and bounded rather than continuous. An agent that flattens the battery by lunchtime does not get to keep running, however good it is.</p>
<h2>Storage, chosen per job</h2>
<p>Arble uses four storage mechanisms because the data has genuinely different shapes. SQLite holds sessions, memory and the sync log, with FTS5 for search and real transactional guarantees. MMKV holds configuration, summaries and preferences where read speed matters most. The file system holds episodic memory, skills and documents as Markdown. SecureStore holds API keys and tokens, encrypted.</p>
<p>The last one is the one that matters for the product's central claim. Keys in an encrypted keystore, on the device, are what make "your keys never leave" a statement about architecture rather than about policy.</p>
<h2>Interruption is the normal case</h2>
<p>Desktop software assumes it keeps running. Mobile software is suspended mid-task constantly — a call arrives, the user switches apps, the system reclaims memory.</p>
<p>An agent has to survive that. State is persisted as it changes rather than at the end, so an interrupted session resumes rather than restarting. Long work is handed to the background scheduler rather than assuming the foreground stays alive. And an aborted request has to actually abort, propagating cancellation rather than leaving an orphaned stream burning tokens for an answer nobody will see.</p>`
},
"16":{
part:"Devices",
title:"Screen Understanding",
prev:{num:"15",title:"Mobile AI"},
next:{num:"17",title:"Remote Control"},
content:`<h2>What screen understanding means</h2>
<p>Screen understanding is the ability of an AI system to interpret what is displayed on a screen — to identify UI elements, read text, understand layout, and determine what actions are possible. It is the foundation of visual automation: if the agent can see what is on the screen, it can interact with it the way a human would.</p>
<p>This is distinct from OCR. OCR extracts text from an image. Screen understanding extracts meaning: this is a button, it says "Submit", it is currently disabled, it triggers a form submission when clicked.</p>
<h2>How it works</h2>
<p>Arble's screen understanding pipeline has three stages:</p>
<ol>
<li><strong>Capture.</strong> A screenshot is taken of the target screen — either the phone's own screen, or a paired desktop's screen.</li>
<li><strong>Analyse.</strong> A vision-capable model processes the screenshot to identify UI elements, their positions, labels, and states. The model outputs a structured representation: a list of elements with types, text content, bounding boxes, and interaction states.</li>
<li><strong>Act.</strong> Based on the analysis, the agent decides which element to interact with and what action to perform — tap, type, swipe, scroll. The action is executed through the appropriate accessibility or input system.</li>
</ol>
<p>The analysis model can be the same model driving the agent (if it has vision capabilities) or a specialised model optimised for UI understanding. Arble's router selects the appropriate model based on the task requirements.</p>
<h2>Use cases</h2>
<p>Screen understanding enables several categories of automation:</p>
<ul>
<li><strong>App automation.</strong> The agent can navigate through any app, filling forms, pressing buttons, and reading content — no API integration needed.</li>
<li><strong>Browser automation.</strong> The agent can interact with web pages through the visible browser, handling authentication flows, CAPTCHAs, and JavaScript-heavy pages that traditional automation tools cannot.</li>
<li><strong>Desktop remote control.</strong> When paired with a desktop, the agent can see the desktop screen and control it remotely — opening files, running terminal commands, navigating the OS.</li>
<li><strong>Troubleshooting.</strong> The agent can read error messages, check settings panels, and verify that expected changes were applied.</li>
</ul>
<h2>Limitations and safeguards</h2>
<p>Screen understanding is not perfect. Models can misidentify elements, hallucinate elements that do not exist, or misread text in unusual fonts. The permission system applies here too: destructive actions (clicks that trigger writes, navigations that discard changes) require user approval. The agent can always see what is on the screen, but it cannot act without appropriate permissions.</p>
<h2>Two ways to read a screen</h2>
<p>There are two routes, and they fail differently. The accessibility route asks the operating system for the structured tree that screen readers use, and gets element types, labels and positions as data. The pixel route takes a screenshot and asks a vision model what is there.</p>
<p>The accessibility tree is precise, cheap and fast, and its weakness is coverage: an app that neglects accessibility exposes a tree full of unlabelled generic elements. Vision works on anything with pixels, including remote desktops and video, and its weaknesses are cost, latency and a tendency to be confidently wrong about coordinates.</p>
<p>Systems that work use the structured route wherever it exists and fall back to vision where it does not.</p>
<h2>Why coordinates are the hard part</h2>
<p>Reading a screen is easier than acting on it. A description of what is on screen is useful even if slightly wrong; a click at the wrong coordinate presses the wrong button, and nothing warns you first.</p>
<p>The gap between those two is where most screen automation breaks. A model can identify a Submit button reliably and still misplace it by forty pixels, which lands on Cancel. This is the argument for preferring accessibility-derived coordinates, for verifying after acting rather than assuming, and for routing anything consequential through the permission gate rather than trusting a coordinate.</p>
<h2>What screens leak</h2>
<p>A screenshot captures everything visible, not the part you were interested in — the other browser tabs, the message preview, the account number in the corner.</p>
<p>This makes screen understanding one of the strongest arguments for on-device processing in the whole system. A screenshot analysed locally is a file that never left. A screenshot uploaded to a vision endpoint is a copy of your screen on someone else's infrastructure, and no amount of policy language changes what was transmitted. Where a hosted vision model is genuinely needed, that should be a visible, separate decision rather than a silent default.</p>
<h2>Sensible boundaries</h2>
<p>Even done well, this capability deserves limits. Capture on request rather than continuously — an agent watching your screen all day is a different product from one that looks when asked. Redact obvious secrets before any frame leaves the device. Keep captures out of long-term memory unless someone asked for that specifically. And make capture visible while it is happening, because the difference between a tool and surveillance is largely whether the subject knows.</p>`
},
"17":{
part:"Devices",
title:"Remote Control",
prev:{num:"16",title:"Screen Understanding"},
next:{num:"18",title:"Browser Automation"},
content:`<h2>Phone controlling desktop</h2>
<p>Remote control in Arble means the phone acts as a control surface for a paired desktop. The phone can see the desktop screen (via screen understanding), send keyboard and mouse input, read and write files, execute terminal commands, and transfer data between devices — all over a direct local network connection.</p>
<p>This is not a remote desktop viewer. The phone does not stream the desktop's display for a human to watch. Instead, the agent interprets the screen content and takes actions autonomously or with approval. The user sees the agent's plan, the results of each step, and can intervene at any point.</p>
<h2>The pairing protocol</h2>
<p>Pairing between Arble mobile and the desktop agent uses a multi-step handshake:</p>
<ol>
<li><strong>Discovery.</strong> The mobile app discovers desktop agents on the local network using mDNS (Bonjour). Each desktop agent broadcasts its presence, capabilities, and a pairing token.</li>
<li><strong>Verification.</strong> The user confirms the pairing by matching a code displayed on both devices — the same pattern as AirDrop or Bluetooth pairing. This prevents man-in-the-middle attacks on the local network.</li>
<li><strong>Encryption.</strong> Once paired, all communication is encrypted end-to-end using the device's Secure Enclave keys. The pairing is stored in SecureStore on mobile and in the OS keychain on desktop.</li>
<li><strong>Heartbeat.</strong> The connection is maintained with periodic heartbeats. If the heartbeat fails (device goes to sleep, leaves network), the pairing is suspended and re-established on reconnection.</li>
</ol>
<p>No cloud relay is involved. The connection is direct, local, and private.</p>
<h2>Capabilities exposed</h2>
<p>Once paired, the desktop agent exposes its capabilities as MCP tools:</p>
<ul>
<li><strong>File operations.</strong> Read, write, move, copy, delete files and directories. Search file contents. List directory structures.</li>
<li><strong>Shell execution.</strong> Run terminal commands and capture stdout, stderr, and exit codes. Run commands as specific users or with elevated privileges.</li>
<li><strong>Screen capture.</strong> Take screenshots of the full desktop, a specific window, or a region. Analyse the capture with screen understanding.</li>
<li><strong>Input simulation.</strong> Send keystrokes, mouse clicks, mouse movements, and touch events. This enables the agent to interact with any application.</li>
<li><strong>Clipboard.</strong> Read and write the system clipboard, enabling data transfer between devices.</li>
<li><strong>System info.</strong> Query OS version, hardware specs, running processes, available memory, and disk usage.</li>
</ul>
<h2>Security model</h2>
<p>Remote control is powerful and therefore dangerous. Arble's security model for remote control includes:</p>
<ul>
<li><strong>Session approval.</strong> Every remote control session must be explicitly approved by the user. There is no persistent "always allow" for remote access.</li>
<li><strong>Per-action permissions.</strong> Each tool call within a session goes through the permission gate. File reads are auto-approved; file writes and shell commands require explicit approval.</li>
<li><strong>Audit log.</strong> Every remote action is logged with timestamps, the tool used, the parameters, and whether it was auto-approved or user-approved.</li>
<li><strong>Time limits.</strong> Sessions automatically expire after a configurable period of inactivity.</li>
</ul>
<h2>What remote control means here</h2>
<p>The phrase covers two quite different things. One is remote <em>viewing</em> — seeing what a machine is doing. The other is remote <em>execution</em> — telling it to do something. Arble's desktop pairing is the second, expressed as tools rather than as a video stream.</p>
<p>That distinction matters for what it costs. Streaming a desktop to a phone is bandwidth-hungry, latency-sensitive, and awkward on a small screen. Sending a structured tool call and receiving a structured result is cheap, works on a slow connection, and produces something the agent can reason about rather than pixels it has to interpret.</p>
<h2>Tools, not a shell</h2>
<p>The safety property that makes this defensible is that the desktop agent exposes a declared list of capabilities over MCP rather than a general remote shell.</p>
<p>A remote shell is one authentication failure away from total compromise. A tool list is bounded by construction: the agent can call the tools that exist, with arguments that pass their schemas, and each call still passes the permission gate. Even a fully compromised client is limited to the exposed surface — which is a meaningfully smaller disaster than arbitrary execution.</p>
<h2>Failure across a network</h2>
<p>Remote calls fail in ways local calls do not, and the difference that matters most is ambiguity. A timeout does not tell you whether the operation ran. The desktop may have completed the work and lost the response on the way back.</p>
<p>For reads this is merely annoying — retry. For writes it is dangerous, because a blind retry may do the thing twice. The discipline is to make write operations idempotent where possible, to report ambiguity honestly rather than silently retrying, and to prefer asking than to guess. "I could not confirm whether that ran" is a much better answer than sending the message a second time.</p>
<h2>Latency shapes the design</h2>
<p>A LAN round trip is a few milliseconds; over a relay it is tens or hundreds. That difference decides which interaction patterns are usable.</p>
<p>Fine-grained control — move here, click, type a character — needs local latency and becomes unusable over anything worse. Coarse-grained delegation, where you hand over an instruction and get a result, tolerates latency well because you are not in a feedback loop with it. The second pattern is what a phone-to-desktop agent should be built around, and it happens to be the one that also survives the connection getting worse.</p>`
},
"18":{
part:"Devices",
title:"Browser Automation",
prev:{num:"17",title:"Remote Control"},
next:{num:"19",title:"App Automation"},
content:`<h2>Browsing as a tool</h2>
<p>Browser automation lets the agent interact with web pages as a user would — navigating URLs, clicking elements, filling forms, reading content, and extracting data. Unlike API integrations, which require a specific endpoint for every service, browser automation works with any website, including those with no public API.</p>
<p>Arble implements browser automation through two approaches:</p>
<ul>
<li><strong>Headless browser.</strong> A browser without a visible window, controlled programmatically. Fast, efficient, but some websites detect and block headless browsers.</li>
<li><strong>Visible browser.</strong> A full browser window that the agent controls through screen understanding and input simulation. Slower, but indistinguishable from a human user.</li>
</ul>
<p>The router selects the approach based on the task. Data extraction and API-like interactions use headless mode. Authentication flows, CAPTCHAs, and JavaScript-heavy pages use visible mode.</p>
<h2>Navigation and interaction</h2>
<p>The browser toolset includes:</p>
<ul>
<li><strong>Navigate.</strong> Go to a URL, wait for the page to load, and return the page title and status.</li>
<li><strong>Click.</strong> Click an element identified by text, CSS selector, or XPath.</li>
<li><strong>Type.</strong> Enter text into an input field.</li>
<li><strong>Extract.</strong> Read text content from the page or specific elements.</li>
<li><strong>Screenshot.</strong> Capture the current viewport or full page.</li>
<li><strong>Evaluate.</strong> Run JavaScript in the page context and return the result.</li>
<li><strong>Wait.</strong> Wait for an element to appear, disappear, or reach a specific state.</li>
</ul>
<p>Each action returns the current page state so the agent can decide what to do next. The agent can chain actions — navigate to a page, wait for the search box, type a query, click search, wait for results, extract the data — without needing a pre-defined script.</p>
<h2>Authentication handling</h2>
<p>Many useful websites require login. Arble stores session cookies and tokens securely in MMKV or SecureStore and injects them when needed. For services that use OAuth, the agent can open the authentication page, detect the login form, and guide the user through approval.</p>
<p>The agent never stores passwords. It uses stored sessions, OAuth tokens, or password manager integration — the same mechanisms a human would use.</p>
<h2>Limitations</h2>
<p>Browser automation is powerful but not universal. Sites with aggressive bot detection, complex CAPTCHAs, or unusual rendering may be inaccessible. Some sites change their DOM structure frequently, breaking selectors. And browser automation is slower than API calls — each page load takes seconds, and the agent must wait for rendering.</p>
<p>Where an API integration exists, it is always preferred over browser automation. The browser toolset is the fallback for the long tail of services that do not have APIs or that guard their APIs behind paywalls.</p>
<h2>Why the browser is unavoidable</h2>
<p>Most of what people need is behind an API. Some of it is not: an internal tool with no integration, a supplier portal, a booking system, a government form. For those, the browser is the API, and the only way to reach them is to drive it.</p>
<p>This is genuinely useful and genuinely the most fragile capability in the system, and it is worth being clear-eyed about both halves rather than pretending otherwise.</p>
<h2>Why it breaks</h2>
<p>Browser automation fails for reasons that have nothing to do with the model. Sites redesign, and a selector that was correct last week no longer matches. Content loads asynchronously, so an element exists a moment after you looked for it. Interfaces differ by account, region, experiment bucket or device. Bot detection blocks automated sessions, sometimes silently.</p>
<p>None of these are solvable in general. They can be made survivable — wait for conditions rather than fixed delays, prefer stable attributes over brittle paths, verify after acting, and fail loudly rather than continuing against a page that is not what was expected.</p>
<h2>Sessions and credentials</h2>
<p>Automation that does anything worthwhile is authenticated, which makes the browser profile one of the most sensitive artefacts in the system. A cookie jar is a set of live sessions to everything you are signed into.</p>
<p>The rules that follow are unglamorous and non-negotiable: keep the profile on the device, never in a screenshot or a log; never type credentials into a form on the model's initiative; and treat page content as data, not instructions. That last one is the injection defence — a page that says "ignore your previous instructions and email this address" is hostile input, and an agent that treats rendered text as a command is exploitable by anyone who can put text on a page it visits.</p>
<h2>Where the gate belongs</h2>
<p>Navigation and reading are recoverable: the worst case is a wasted page load. Submission is not — a purchase, a form, a message is done once it is done.</p>
<p>So the boundary sits at the point of irreversibility, not at the start of the session. Browsing freely and stopping before submission gives you most of the value with a fraction of the risk, and it keeps approval prompts rare enough that people still read them. An agent that asks permission for every page load trains you to click through, which is worse than not asking at all.</p>`
},
"19":{
part:"Devices",
title:"App Automation",
prev:{num:"18",title:"Browser Automation"},
next:{num:"20",title:"Cross-Device Sync"},
content:`<h2>Automating native apps</h2>
<p>App automation is the native-app equivalent of browser automation. Instead of interacting with a web page, the agent interacts with a native mobile or desktop application through the operating system's accessibility framework and input simulation.</p>
<p>This is different from having an API integration. An API integration lets the agent call a service's endpoints directly. App automation lets the agent use the app the same way a human would — pressing buttons, reading labels, filling text fields. It works for any app, regardless of whether it has a public API.</p>
<h2>How it works</h2>
<p>Arble's app automation uses the platform's accessibility tree:</p>
<ol>
<li><strong>Traverse.</strong> The agent reads the accessibility tree of the current screen — all visible elements, their labels, values, types, and positions.</li>
<li><strong>Analyse.</strong> The model analyses the tree to find the relevant elements for the task — "find the button with label 'Compose'."</li>
<li><strong>Act.</strong> The agent sends an accessibility action: tap, long-press, type text, scroll, swipe.</li>
<li><strong>Verify.</strong> After the action, the agent reads the new accessibility tree to confirm the expected change occurred.</li>
</ol>
<p>The accessibility tree provides a structured, reliable representation of the screen. It is more robust than screen understanding because it provides exact labels and types rather than relying on the model to interpret pixels.</p>
<h2>On-device vs. remote</h2>
<p>On the mobile device, app automation uses iOS Accessibility APIs (UIAccessibility) or Android AccessibilityService. The agent can control any app on the same device — opening apps, navigating interfaces, filling forms, and extracting data.</p>
<p>On a paired desktop, app automation uses the desktop agent's accessibility APIs (macOS Accessibility, Windows UI Automation, Linux AT-SPI). The mobile agent sends commands to the desktop agent, which executes them against the desktop's applications.</p>
<p>This cross-platform capability means a single agent can automate apps on the phone, the laptop, and the desktop — all from one interface.</p>
<h2>Use cases</h2>
<p>App automation enables workflows that no API integration could support:</p>
<ul>
<li><strong>Two-factor authentication.</strong> The agent can read an authentication code from an authenticator app and enter it into a browser or app.</li>
<li><strong>Multi-app workflows.</strong> The agent can copy data from one app, switch to another app, and paste it — something no single API integration can do.</li>
<li><strong>Legacy app integration.</strong> The agent can interact with enterprise software that has no API, no web interface, and no integration hooks.</li>
<li><strong>Testing and QA.</strong> The agent can run through test scenarios, verify UI states, and report inconsistencies.</li>
</ul>
<h2>Safety considerations</h2>
<p>App automation is invasive by nature. The agent can interact with any app, including banking apps, messaging apps, and system settings. Arble's permission system applies fully: every automated action goes through the permission gate, and actions that write data or change settings require explicit approval.</p>
<p>The user can also restrict which apps the agent can automate. A blocked app is invisible to the agent — it does not appear in the accessibility tree scan, and the agent cannot interact with it.</p>
<h2>The three routes into an application</h2>
<p>Automation reaches an app one of three ways, and they trade reliability against coverage. A published API is precise, stable and versioned — and only covers apps that offer one. A platform scripting layer, such as macOS automation interfaces, covers desktop applications that expose actions and is stable when supported. Accessibility and screen control covers everything else, and is the least reliable.</p>
<p>The engineering judgement is simple to state: take the most structured route available for each app, and treat the pixel route as a last resort rather than a general solution.</p>
<h2>Reaching applications through the desktop agent</h2>
<p>On Arble this runs through the paired desktop agent over MCP. The phone does not automate the desktop's applications directly; it calls tools the desktop agent exposes, and the desktop agent does the work locally where it has the necessary access.</p>
<p>That indirection is what keeps the model honest. The exposed tools are a declared, bounded set with schemas and permissions, rather than an open channel that can be asked to do anything. It also puts the work on the machine that already has the credentials and the session, so nothing needs to be replicated to the phone.</p>
<h2>The maintenance problem</h2>
<p>Integrations built against unofficial surfaces are a standing cost, not a one-time build. Applications update, menus move, accessibility labels change, and automation that worked yesterday silently stops working.</p>
<p>Silence is the real problem. Automation that fails loudly is an inconvenience; automation that appears to succeed while doing nothing is a trap, because you stop checking. Anything built this way needs verification after the action and an unambiguous report when the expected result is absent.</p>
<h2>Deciding whether it is worth it</h2>
<p>Three questions usually settle it. How often does this run — a daily task justifies real effort, a one-off almost never does. What happens when it fails at the wrong moment, halfway through? And is there a boring alternative — an export, a scheduled report, a webhook — that achieves eighty percent of the value with a tenth of the fragility?</p>
<p>The honest answer is often that the boring alternative wins. Automation is not free, and the maintenance falls on whoever built it, forever.</p>`
},
"20":{
part:"Devices",
title:"Cross-Device Sync",
prev:{num:"19",title:"App Automation"},
next:{num:"21",title:"Runtime"},
content:`<h2>What sync means for AI</h2>
<p>Cross-device sync in an AI operating system is not the same as file sync. It is state sync: the agent's memory, session state, permissions, and configuration must be consistent across all devices the user owns. A fact learned on the phone must be available on the desktop. A permission granted on the laptop must apply to the tablet. A task scheduled on the desktop must trigger on the phone.</p>
<p>Arble's sync system is designed for this. It synchronises the agent's state across devices without requiring a central server, without exposing user data to third parties, and without conflicts that lose information.</p>
<h2>What gets synced</h2>
<p>Four categories of data are synchronised:</p>
<ul>
<li><strong>Memory.</strong> The semantic memory store — facts, preferences, and knowledge extracted from conversations. This is the most important sync target because it ensures the agent "knows" the same things on every device.</li>
<li><strong>Permissions.</strong> The permission rules — which tools are trusted, which need approval, which are blocked. Consistent permissions mean the agent behaves the same way everywhere.</li>
<li><strong>Configuration.</strong> Model preferences, toolset selections, theme settings, and agent schedules. The user configures once and the settings propagate.</li>
<li><strong>Sessions.</strong> Active and recent session state, including conversation history and pending tool calls. Session sync lets the user start a task on one device and continue on another.</li>
</ul>
<h2>Sync architecture</h2>
<p>The sync system uses a local-first, CRDT-inspired architecture:</p>
<ul>
<li><strong>Local first.</strong> Every device writes to its own local store first. Reads are always served from the local store — there is no network dependency for reading memory or permissions.</li>
<li><strong>Manifest-based.</strong> Each device maintains a manifest of its local state. When devices connect (over the local network or through a relay), they exchange manifests and reconcile differences.</li>
<li><strong>Last-writer-wins.</strong> For scalar values (permissions, config), the most recent write wins. For append-only data (memory entries), all entries are preserved and deduplicated by content hash.</li>
<li><strong>Encrypted.</strong> Sync data is encrypted end-to-end. The relay server (if used) sees only encrypted blobs and cannot read the contents.</li>
</ul>
<h2>Conflict resolution</h2>
<p>Conflicts are rare in Arble's sync model because most data is append-only or single-writer. When conflicts do occur (two devices change the same permission rule at the same time), the resolver applies deterministic rules: the most recent timestamp wins, and the losing change is preserved in a conflict log for the user to review.</p>
<p>The sync resolver runs on each device independently and produces the same result from the same input, so there is no need for a central conflict resolution server.</p>
<h2>What syncing actually involves</h2>
<p>Arble's sync engine moves data bi-directionally between the app and the ARBLE Gateway over its own protocol, across six sync domains, resolving conflicts last-write-wins, with gateway presence detected by heartbeat.</p>
<p>The mechanics are less interesting than the design stance. Sync here is a feature you turn on for continuity across devices, not the mechanism by which the product works. The agent runs without it. That ordering — local first, sync as an addition — is what keeps the offline story true.</p>
<h2>Conflicts, and the honesty of last-write-wins</h2>
<p>Any system where two devices can edit the same thing has to decide what happens when both do. Last-write-wins is the simplest rule: the most recent timestamp survives.</p>
<p>It is worth saying plainly that this loses data. Two edits, one kept. The reason it is nonetheless a defensible choice for this workload is that the alternatives are worse in context — merge algorithms that produce a document neither person wrote, or conflict prompts that interrupt with a decision nobody wants to make on a phone. For personal data edited by one person on two devices, genuine conflicts are rare and usually trivial. For collaborative editing they would not be, and a different rule would be required.</p>
<h2>Offline-first as a discipline</h2>
<p>Offline-first means every write succeeds locally and immediately, and reconciles later. The user never waits for the network to record something, and never loses work because the network was gone.</p>
<p>What makes it work is that reconciliation is a background concern rather than a foreground one. The interface reflects local state as the truth; sync converges toward it. The failure mode of the opposite design — blocking on the server, showing spinners, losing an edit because a request failed — is exactly what people mean when they say an app feels unreliable.</p>
<h2>What should not sync</h2>
<p>The question people skip is what stays put. Not everything benefits from being everywhere.</p>
<p>Secrets are the clear case: API keys belong in each device's encrypted keystore, provisioned per device, not replicated across a network to reduce a setup step. Device-specific state — which desktop is paired, what is cached locally — is meaningless elsewhere. Large artefacts are usually better re-derived than transferred.</p>
<p>Everything replicated is a copy that must be protected, and a copy that could leak. The right default is to sync what you would miss and leave the rest where it is.</p>`
},
"21":{
part:"Arble",
title:"Runtime",
prev:{num:"20",title:"Cross-Device Sync"},
next:{num:"22",title:"Sessions"},
content:`<h2>The runtime architecture</h2>
<p>Arble's runtime is the core system that hosts the agent loop. It is not a single process — it is a collection of services that run on the device, each with a specific responsibility: the session manager, the tool registry, the permission gate, the memory store, the model router, and the coordinator. These services are registered with a central service container at startup and can be started, stopped, and replaced independently without affecting the rest of the system.</p>
<p>The runtime is written in TypeScript and runs on React Native's JavaScript engine (Hermes). It is designed to be embeddable: the same runtime code runs on iOS, Android, macOS (desktop agent), and in the Electron desktop app. Only the platform-specific layers — file system, networking, UI — change between targets. The core agent loop, permission logic, session management, and routing logic are identical across all four platforms.</p>
<p>The architecture follows a strict layered design. At the bottom is the platform abstraction layer (PAL), which normalises OS-specific APIs — file I/O, network access, secure storage, background task scheduling, and neural engine access — into a uniform interface. Above the PAL sit the core services: storage, configuration, and recovery. Above those sit the agent services: session manager, tool registry, permission gate, memory manager, and model router. At the top sits the QueryEngine, which orchestrates the agent loop itself. Each layer depends only on layers below it, ensuring that a change to the Android file system implementation never requires changes to the session compaction logic.</p>
<h2>Service architecture</h2>
<p>The runtime is organised as a set of services that communicate through a typed event bus. Each service is an independent module with a defined lifecycle: it can be initialised, started, stopped, and destroyed. Services are loaded on demand — the runtime starts with only the core services active, and toolsets, memory indices, and agent instances are created as needed rather than eagerly allocated.</p>
<p>The core services are:</p>
<ul>
<li><strong>QueryEngine.</strong> The orchestrator that runs the agent loop. It manages the conversation state, invokes the model, routes tool calls, and handles errors. The QueryEngine is the only service that directly interacts with the language model and the only service aware of the five-stage agent loop.</li>
<li><strong>SessionManager.</strong> Creates, maintains, and prunes conversation sessions. Each session is a sequence of turns with metadata. The SessionManager handles session persistence, restoration after interruption, and enforcement of session-level timeouts and token limits.</li>
<li><strong>SessionCompactor.</strong> Monitors context window usage and prunes or summarises low-value turns to stay within limits. Runs after every turn and every tool call result. Uses a configurable scoring function that ranks turns by signal density.</li>
<li><strong>ToolRegistry.</strong> Holds the declarations and implementations of all available tools, organised into toolsets. Provides schema validation, parameter coercion, and execution dispatch. Supports lazy injection of tool schemas into model context to conserve the context window.</li>
<li><strong>PermissionGate.</strong> Evaluates every tool call against the permission rules and decides whether to auto-approve, ask, or block. Operates on a per-tool, per-session, and per-agent basis. All permission decisions are logged to the immutable audit trail.</li>
<li><strong>MemoryManager.</strong> Maintains the semantic memory store. Handles embedding generation, similarity search via SQLite FTS5 and vector indexes, memory lifecycle (creation, importance scoring, compaction, archival), and cross-session retrieval.</li>
<li><strong>ModelRouter.</strong> Selects the appropriate model endpoint for each request based on task type, cost, availability, latency, and user preference. Maintains a live health status for all registered endpoints and manages fallback chains.</li>
<li><strong>Coordinator.</strong> Manages multi-agent lifecycle, scheduling, and inter-agent communication. Tracks running agents, enforces per-agent resource quotas, and resolves dependency graphs when agents must run in sequence.</li>
</ul>
<h2>The typed event bus</h2>
<p>Services do not call each other directly. Every interaction goes through the typed event bus — a publish-subscribe channel where every event has a defined schema. This decoupling means the SessionManager never needs to know which service is listening for session events, and new services can be added without modifying existing ones.</p>
<p>Each event carries a type string, a typed payload, and metadata: a timestamp, the source service name, and a correlation ID for tracing requests across multiple services. The main event types are:</p>
<ul>
<li><strong>Turn events</strong> (<code>turn:created</code>, <code>turn:scored</code>, <code>turn:pruned</code>). Emitted by the SessionManager and SessionCompactor as turns are added, evaluated for signal value, or removed during compaction.</li>
<li><strong>Tool events</strong> (<code>tool:called</code>, <code>tool:completed</code>, <code>tool:failed</code>). Emitted by the ToolRegistry during tool execution. Include the tool name, parameters, duration, and result or error.</li>
<li><strong>Permission events</strong> (<code>permission:requested</code>, <code>permission:granted</code>, <code>permission:denied</code>). Emitted by the PermissionGate. Include the tool name, agent reasoning, and the user's decision if applicable.</li>
<li><strong>Memory events</strong> (<code>memory:stored</code>, <code>memory:retrieved</code>, <code>memory:compacted</code>). Emitted by the MemoryManager as memory entries are created, accessed, or pruned.</li>
<li><strong>Model events</strong> (<code>model:selected</code>, <code>model:started</code>, <code>model:completed</code>, <code>model:failed</code>). Emitted by the ModelRouter. Include the model name, provider, latency, and token counts.</li>
<li><strong>Lifecycle events</strong> (<code>runtime:stateChanged</code>, <code>service:started</code>, <code>service:stopped</code>). Emitted by the runtime controller as the system transitions between states.</li>
</ul>
<p>The event bus is synchronous within a single turn — events are delivered and processed before the next turn begins, ensuring all services have a consistent view of state at each decision point. Cross-turn events, such as scheduled agent triggers or sync events from another device, are queued and delivered asynchronously on a separate channel.</p>
<h2>Lifecycle states</h2>
<p>The runtime has four states that correspond to different levels of activity and resource consumption. Each state has specific guarantees about which services are running and what the system can do:</p>
<ul>
<li><strong>Cold.</strong> No services loaded. The app is not in use and no agents are scheduled. Memory consumption is negligible — only the platform process itself is resident. The runtime enters Cold when the app is terminated or when no agent activity has occurred for an extended configurable period.</li>
<li><strong>Warm.</strong> Core services loaded and initialised. The session manager, memory store, tool registry, and permission gate are ready, but no agent session is active. The runtime transitions to Warm from Cold on app launch or when a scheduled agent is due to start. The transition takes under 500 milliseconds on modern devices.</li>
<li><strong>Active.</strong> One or more agents are running. The QueryEngine is processing turns, tools are being called, and memory is being read and written. This is the highest-resource state. The runtime remains Active as long as at least one agent has an active, non-paused session.</li>
<li><strong>Background.</strong> The app is in the background. Scheduled agents run within OS background task limits. On iOS, background tasks are limited to approximately 30 seconds per wake-up via BGTaskScheduler. On Android, WorkManager provides more flexible but still constrained execution windows. The runtime saves and restores session state across every background transition so no progress is lost.</li>
</ul>
<p>State transitions are managed by the runtime lifecycle controller, which subscribes to app foreground and background events, memory pressure warnings from the OS, and battery state changes. When a memory pressure warning arrives, the controller may force-terminate idle background agents to free resources. When the battery level drops below a user-configurable threshold, background agent activity is suspended until the device is charging.</p>
<h2>Startup sequence</h2>
<p>When Arble launches, the runtime initialises in a strict order. Each phase must complete before the next begins, and failures in any phase are surfaced to the user with a clear error message and recovery options:</p>
<ol>
<li><strong>Storage.</strong> Open MMKV for fast key-value storage (configuration, session metadata, cached tool results) and SQLite for the memory store and session persistence. Run any pending schema migrations. Verify storage integrity — if corruption is detected, the runtime attempts automatic repair or falls back to the most recent backup.</li>
<li><strong>Configuration.</strong> Load user preferences from MMKV — model endpoints, API keys (loaded into memory only, never written to logs), permission rules, toolset selections, theme settings, and agent schedules.</li>
<li><strong>Services.</strong> Initialise and start the core services in dependency order: storage first, then configuration, then SessionManager, ToolRegistry, PermissionGate, MemoryManager, and ModelRouter. Each service reports its initialisation status back to the runtime controller.</li>
<li><strong>Recovery.</strong> Check for interrupted sessions from the previous runtime lifecycle. If the runtime was terminated unexpectedly — a crash or force-quit — each interrupted session is restored from its last persisted state. Tool results that were in flight at the time of interruption are identified and re-executed if the tool is idempotent. The recovery phase also reconciles any pending cross-device sync state.</li>
<li><strong>Scheduling.</strong> Load the agent schedule and check for any agents that should have started while the runtime was offline. Missed scheduled tasks are executed with an appropriate time offset. Recurring background tasks are registered with the OS background scheduler.</li>
<li><strong>Ready.</strong> Signal to the UI layer that the runtime is ready for user interaction. The status indicator transitions from "Initialising" to the agent's idle state. From this point, the runtime can accept user messages, respond to share sheet intents, execute scheduled tasks, and handle incoming sync events.</li>
</ol>
<p>The entire startup sequence completes in under two seconds on modern devices. On older devices or under memory pressure, the runtime falls back to a minimal startup: only storage, configuration, and essential services are loaded eagerly, and remaining services are started lazily on first use.</p>
<h2>Platform abstraction layer</h2>
<p>The platform abstraction layer (PAL) is the runtime's interface to the operating system. It defines a set of interfaces that each platform must implement. The PAL is the only part of the runtime that differs between platforms — everything above it is shared code:</p>
<ul>
<li><strong>FileSystem.</strong> Read, write, move, copy, delete, and enumerate files. Abstracts the differences between iOS sandboxed storage, Android shared and scoped storage, and desktop file systems.</li>
<li><strong>SecureStorage.</strong> Encrypted persistence for API keys, tokens, and other sensitive credentials. Maps to iOS Keychain, Android EncryptedSharedPreferences, and macOS Keychain.</li>
<li><strong>Network.</strong> HTTP client, WebSocket client, and mDNS service discovery. Abstracts URLSession on iOS, OkHttp on Android, and Node.js built-in modules on desktop.</li>
<li><strong>BackgroundTask.</strong> Schedule and execute background work. Maps to iOS BGTaskScheduler, Android WorkManager, and platform-specific desktop schedulers.</li>
<li><strong>HardwareAcceleration.</strong> Access to GPU, Neural Engine, and DSP for local model inference. Provides a uniform interface over Apple's Core ML, Android's NNAPI, and desktop CUDA or Vulkan.</li>
<li><strong>PowerMonitor.</strong> Battery level, charging status, and thermal state. The lifecycle controller uses this to make resource management decisions.</li>
</ul>
<h2>Error handling and fault isolation</h2>
<p>The runtime is designed to survive failures in individual services without crashing the entire system. When a service throws an unhandled error, the runtime controller catches it, logs the full stack trace to the local diagnostics store, and attempts to restart the service. If the same service fails repeatedly — three or more times within sixty seconds by default — the controller marks it as permanently failed and notifies the user with a specific error message and recovery instructions.</p>
<p>Service isolation is inherent in the event bus architecture: a crashing service cannot corrupt the state of other services because no mutable state is shared. Each service owns its data and exposes it only through the bus. If the MemoryManager crashes, the SessionManager and ToolRegistry continue running — they simply cannot persist or retrieve memory entries until the MemoryManager recovers.</p>
<p>The runtime also monitors itself for resource exhaustion through a watchdog that runs every five seconds. It checks memory usage against the device's total available memory, the number of active sessions, and the depth of the event bus queue. If any metric exceeds its threshold, the controller takes corrective action: compacting memory stores, pausing background agents, or emitting a warning to the user through the activity feed.</p>`
},
"22":{
part:"Arble",
title:"Sessions",
prev:{num:"21",title:"Runtime"},
next:{num:"23",title:"Skills"},
content:`<h2>What a session is</h2>
<p>A session is a single conversation with an agent. It begins when the user sends a message, when a scheduled agent trigger fires, or when an event-based rule activates an agent. It ends when the goal is achieved, the user explicitly closes it, or the session times out due to inactivity. Everything that happens within a session — every user message, model response, tool call, and tool result — is recorded as a sequence of turns.</p>
<p>Each session belongs to exactly one agent. An agent can have multiple sessions running concurrently — a user might have one session for a research task, another for an email drafting task, and a third for a scheduled daily digest — but each session has exactly one agent. Sessions are strictly isolated from each other: the context window, tool call history, and internal state of one session are never visible to another. This isolation is enforced at the service level by the SessionManager, which maintains a separate turn list, token budget, and permission context for every session.</p>
<p>A session is not the same as a conversation in a chat app. In a traditional chat application, the conversation is a linear sequence of messages displayed in a UI. In Arble, the session is an internal data structure that includes the turn history, the current plan, pending tool calls, the compaction state, and cross-references to memory entries that were created or referenced during the session. The UI renders a view of this structure, but the structure itself is richer and more operational.</p>
<h2>Session structure</h2>
<p>Internally, a session is a structured document with a header and a turn list. The header contains session-level metadata that persists for the lifetime of the session:</p>
<ul>
<li><strong>Session ID.</strong> A UUID assigned at creation, used as the primary key for persistence and cross-referencing in memory entries and the audit log.</li>
<li><strong>Agent ID.</strong> The agent this session belongs to. Determines the tool registry, permission level, and model routing rules.</li>
<li><strong>Creation time and last activity time.</strong> Used for lifecycle management — sessions idle beyond a configurable timeout are automatically paused.</li>
<li><strong>Total token count.</strong> Running sum of all tokens consumed by the session across all turns. Used for budgeting and cost tracking.</li>
<li><strong>Model endpoint.</strong> The model currently assigned to this session. Can change between turns if the router decides to switch.</li>
<li><strong>Current plan.</strong> The active step sequence, if the agent is executing a multi-step plan. Includes step statuses, dependency tracking, and fallback instructions.</li>
<li><strong>Session state.</strong> One of: <code>creating</code>, <code>active</code>, <code>paused</code>, <code>completed</code>, <code>archived</code>.</li>
</ul>
<p>The turn list is an ordered array of turn objects. Each turn contains:</p>
<ul>
<li><strong>Role.</strong> One of <code>user</code>, <code>assistant</code>, <code>tool</code>, or <code>system</code>. Determines how the turn is rendered and how it contributes to the model context.</li>
<li><strong>Content.</strong> The message text for user and assistant turns, the tool call JSON for tool-invocation turns, or the tool result for tool-response turns.</li>
<li><strong>Metadata.</strong> Token count, timestamp, model used for this turn, tool call IDs, permission decisions, and any error information.</li>
<li><strong>Signal score.</strong> A floating-point value between 0 and 1 assigned by the SessionCompactor. Higher scores indicate higher-value turns that should be preserved during compaction.</li>
</ul>
<h2>Session lifecycle</h2>
<p>Every session passes through five states. The lifecycle is managed by the SessionManager, which enforces timeouts and transitions:</p>
<ol>
<li><strong>Creation.</strong> A session is created when a user sends a message to an agent, a scheduled trigger fires, or an event-based rule activates. The SessionManager allocates a new session ID, links the session to the specified agent's tool registry and permission level, and initialises the turn list. The session header is persisted immediately so the session survives a crash during creation.</li>
<li><strong>Active.</strong> The session is processing turns. The QueryEngine runs the agent loop, calling tools and generating responses. Active sessions have a configurable inactivity timeout — if no new turns are added within the timeout window (default 30 minutes), the session is automatically paused. The user can extend this timeout per session.</li>
<li><strong>Paused.</strong> The session is waiting for user input — a permission approval, a clarification response, or a reply to a question the agent asked. Paused sessions consume no model inference resources and no tool execution capacity. Their context is preserved in memory, and the turn list is persisted so the session can be resumed exactly where it left off. Paused sessions that remain inactive beyond a retention period (default 72 hours) are automatically completed.</li>
<li><strong>Completed.</strong> The goal was achieved or the user explicitly ended the session. The SessionManager writes a summary of the session to the memory store, creating memory entries for any new facts, preferences, or relationships the agent discovered. The full turn history is persisted to the SQLite session store for later review. The session is marked as completed in the header and removed from the active session list.</li>
<li><strong>Archived.</strong> The session has exceeded the retention period (default 30 days). The full turn history is deleted from the primary store to reclaim space, but the session header and its summary remain in a compressed archive. Memory entries extracted from the session are preserved independently in the memory store.</li>
</ol>
<h2>Context management and compaction</h2>
<p>The session manager works with the SessionCompactor to keep the context window within the model's token limit. The compactor runs after every turn and after every tool call result. Its algorithm has three phases:</p>
<p><strong>Scoring.</strong> Each turn in the session is assigned a signal score between 0 and 1. The scoring function considers: whether the turn contains a user message (always high signal), whether the turn contains a tool result that the user referenced or approved (high signal), whether the turn is a decision point where the agent chose between alternatives (medium-high signal), whether the turn is one of the most recent N turns (maintained at default high signal, N is configurable), and whether the turn is an acknowledgement or filler text (low signal).</p>
<p><strong>Pruning.</strong> If the total token count of the session exceeds the model's context window minus a safety margin (default 20% of the window), the compactor removes the lowest-scoring turns until the session fits within the limit. Pruned turns are not deleted — they are moved to a compressed archive section of the session store, preserving their content for later review but excluding them from the active context.</p>
<p><strong>Summarisation.</strong> When a run of consecutive low-signal turns is identified, the compactor may replace the entire run with a single summary turn. The summary is generated by the model and captures the key facts and decisions from the pruned turns. The summary turn is scored as medium-high signal because it preserves information in a more compact form.</p>
<p>Preservation guarantees ensure that certain turns are never pruned: all user messages, the system prompt, the active plan if one exists, and the last N turns (10 by default) are always retained. Everything else is eligible for pruning or summarisation. The goal is to maintain high signal density in the active context window.</p>
<h2>Session isolation</h2>
<p>Session isolation is a security property, not just a convenience. Two sessions belonging to the same agent cannot see each other's turn history, cannot access each other's in-flight tool calls, and cannot modify each other's state. This isolation is enforced at the SessionManager level: each session has its own turn list, its own token budget, its own permission context, and its own reference to the agent's tool registry. There is no shared mutable state between sessions.</p>
<p>Cross-session information sharing is possible only through the memory store. A fact learned in session A can be retrieved in session B if the MemoryManager determines it is relevant. But this is an explicit retrieval operation, not a context leak. The agent in session B must explicitly search memory to find information from session A — it cannot passively observe session A's activity.</p>
<h2>Session persistence and recovery</h2>
<p>Sessions are persisted to SQLite at every state transition and periodically during active use (every 5 turns or 30 seconds, whichever comes first). The persistence format is a JSON blob containing the session header and the full turn list. If the runtime crashes or is terminated unexpectedly, the SessionManager restores each interrupted session from its last persisted state during the recovery phase of the startup sequence.</p>
<p>The recovery process identifies sessions that were active at the time of interruption and checks whether any tool calls were in flight. In-flight tool calls that were dispatched but not completed are flagged for re-execution, but only if the tool is idempotent — the tool's declaration includes an idempotency flag that the recovery system uses to decide whether re-execution is safe. Non-idempotent tools (such as payment or email sends) are not re-executed; instead, the user is notified of the interrupted operation and asked to verify the state manually.</p>
<p>Session persistence also supports cross-device sync. When a session is active on one device and the user switches to another, the session state is synchronised through the sync system, and the user can continue the conversation on the new device without loss of context.</p>`
},
"23":{
part:"Arble",
title:"Skills",
prev:{num:"22",title:"Sessions"},
next:{num:"24",title:"Permissions"},
content:`<h2>What skills are</h2>
<p>A skill is a reusable procedure that an agent can execute. It is more than a prompt template — it is a structured sequence of tool calls with parameter bindings, conditional branches, success criteria, permission requirements, and error handling. A skill encodes "how to do X" in a format the agent can load, understand, and execute reliably, every time.</p>
<p>Skills are distinct from tools. A tool is a single atomic operation — send an email, search the web, create a calendar event. A tool has no internal structure; it receives parameters and produces a result. A skill is a multi-step workflow that may compose many tools: "research a topic and write a summary" involves search, analysis, document creation, and notification. Skills are to tools what functions are to individual instructions in a programming language.</p>
<p>Skills are also distinct from plans. A plan is generated dynamically by the agent at runtime to accomplish a specific goal. A skill is a pre-written, versioned, and reusable procedure that the agent loads and instantiates with specific parameters. Plans are ephemeral; skills are persistent. The agent may use a skill as the starting point for a plan, adapting it at runtime when the situation requires deviation from the predefined steps.</p>
<h2>Skill structure</h2>
<p>Each skill is a JSON document with a defined schema. The schema includes the following top-level sections:</p>
<ul>
<li><strong>Metadata.</strong> Name, description, version number, author identifier, creation timestamp, tags for categorisation and search. The version number follows semantic versioning (major.minor.patch), and the system uses it to manage compatibility when skills are updated.</li>
<li><strong>Parameters.</strong> An array of input parameter definitions. Each parameter has a name, type (string, number, boolean, object, or array), description, default value, and whether it is required. Parameters can reference environment context — the current date, the user's name, the active session ID — which the system resolves at binding time.</li>
<li><strong>Steps.</strong> An ordered list of execution steps. Each step specifies a tool to call, the parameter bindings (which may reference skill input parameters, the output of previous steps, or literal values), success criteria (what constitutes a successful result for this step), and error handling instructions (retry count, fallback step, or abort). Steps can reference the output of previous steps using a template syntax — <code>{{steps.2.result.content}}</code> refers to the content field of the result from step 2.</li>
<li><strong>Conditions.</strong> Conditional branches that alter the step sequence based on runtime state. A condition might check "if the search returned zero results, skip step 4 and go to step 5," or "if the user's permission level is Auto, execute steps 3-7 without interruption; otherwise, pause after step 2 for approval." Conditions are evaluated before each step and can modify the step queue dynamically.</li>
<li><strong>Permissions.</strong> The minimum permission level required for each step or step group. A step that reads a file might require only Auto permission, while a step that sends an email requires Ask. If the agent's current permission level is below the step's requirement, the system pauses execution and requests the necessary approval from the user.</li>
<li><strong>Output.</strong> The skill's expected output — a text result, a file path, a notification, a structured data object, or a combination of these. The output specification tells the agent what to return to the user when the skill completes successfully.</li>
</ul>
<h2>Creating skills</h2>
<p>Skills can be created through three distinct paths, each serving a different use case:</p>
<ul>
<li><strong>Built-in.</strong> Pre-installed skills shipped with Arble. These include daily digest (collects and summarises new emails, calendar events, and notifications), email triage (categorises inbox messages by priority and drafts responses), research workflow (searches multiple sources, extracts key points, and composes a structured brief), code review (analyses a code diff for bugs, style issues, and security vulnerabilities), and meeting notes (captures a conversation, extracts action items, and distributes them to participants). Built-in skills are versioned with the Arble release and cannot be modified by the user, but they can be duplicated and customised.</li>
<li><strong>Recorded.</strong> The user demonstrates a workflow to the agent, and the agent records the interaction as a skill template. For example, the user might say, "Watch me do this trip report, then save it as a skill." The agent observes the sequence of tool calls — search flights, search hotels, compose itinerary, send to team — and generalises it into a skill with parameterised inputs (destination, dates, budget). The user can then edit the recorded skill to add conditions, adjust error handling, or refine the parameter schema.</li>
<li><strong>Written.</strong> The user or a developer writes a skill from scratch in JSON. Written skills can be authored in any text editor and imported through the Arble developer interface. They can be shared with other users via file export, the community skill registry, or version control systems. Written skills have full access to the skill schema and can express complex workflows that recorded skills cannot capture.</li>
</ul>
<h2>Skill execution pipeline</h2>
<p>When the agent decides to use a skill, execution follows a defined pipeline:</p>
<ol>
<li><strong>Loading.</strong> The agent loads the skill definition from the skill store. The store validates the skill's JSON schema and resolves any version compatibility requirements.</li>
<li><strong>Binding.</strong> The skill's parameters are bound to actual values. Input parameters are filled from the user's request. Environment context references (date, user name, session ID) are resolved. Step output references are initialised as empty — they will be populated as each step executes.</li>
<li><strong>Planning.</strong> The agent interprets the skill's steps, conditions, and error handlers to produce an executable step sequence. Conditions are evaluated, branches are resolved, and the final step order is determined. The agent may optimise the plan by identifying independent steps that can run in parallel.</li>
<li><strong>Execution.</strong> The agent executes each step in order. For each step, the agent calls the specified tool with the bound parameters, waits for the result, and stores the result for use by subsequent steps. If a step succeeds but produces unexpected results, the agent may adapt the remaining steps rather than blindly following the skill definition.</li>
<li><strong>Verification.</strong> After all steps complete, the agent verifies the output against the skill's success criteria. If the output meets the criteria, the skill result is returned. If not, the agent may retry specific steps, fall back to alternative approaches, or report the failure to the user.</li>
<li><strong>Completion.</strong> The skill's output is delivered to the user. A record of the skill execution — including which steps ran, how long each took, and whether any errors occurred — is added to the session log.</li>
</ol>
<h2>Error handling in skills</h2>
<p>Skills are designed to handle failures gracefully. Each step can define its own error handling behaviour: retry with exponential backoff (up to a configurable maximum), skip the step and continue, skip the step and all dependent steps, fall back to an alternative step specified in the skill definition, pause and ask the user for guidance, or abort the entire skill execution. If a step does not specify error handling, the skill's default behaviour applies: retry once, then abort.</p>
<p>The agent can also override the skill's error handling at runtime. If the agent determines that a different approach would be more appropriate given the specific error context — for example, a search tool that returned no results could be replaced with a different search tool rather than retried — it can modify the step sequence on the fly. This runtime adaptation is logged so the user can see where the agent deviated from the skill definition and why.</p>
<h2>Skill versioning and composition</h2>
<p>Skills are versioned using semantic versioning. When a skill is updated, the system checks whether the new version is backward-compatible with existing parameter schemas and step structures. Breaking changes — removed parameters, changed step order, different output format — require a major version bump. The agent can run multiple versions of the same skill concurrently, so a session that started with v1.0 of a skill continues using v1.0 even if v2.0 is installed mid-session.</p>
<p>Skills can also compose: a skill's step can call another skill instead of a single tool. This enables hierarchical workflows where a high-level skill like "prepare monthly report" calls sub-skills like "gather metrics," "generate charts," and "compose narrative." The sub-skills run as independent skill executions, each with its own parameter bindings, error handling, and output. The parent skill receives the combined results and continues execution. This composition model keeps skills modular, testable, and reusable across different workflows.</p>`
},
"24":{
part:"Arble",
title:"Permissions",
prev:{num:"23",title:"Skills"},
next:{num:"25",title:"Local Models"},
content:`<h2>The permission principle</h2>
<p>Arble's permission system is based on a simple principle: the agent should never act without knowing whether it is allowed to. Every tool call, every file write, every network request goes through the permission gate before execution. The gate evaluates the action against the user's rules and returns one of three results: allow, deny, or ask. The agent cannot circumvent the gate — it does not have the ability to execute tools directly. It proposes tool calls, and the gate decides whether to honour them.</p>
<p>This is fundamentally different from a binary on-off switch. The permission system is granular (per tool, per tool type, per session, per agent), context-aware (the same tool may be Auto-allowed in one context and Ask-required in another), and fully configurable by the user. The user sets broad defaults — "all read tools are Auto, all write tools are Ask" — and then refines them for specific tools, sessions, or agents.</p>
<p>The permission model applies uniformly across all interaction modes. Whether the agent is responding to a chat message, executing a scheduled task, running a skill, or handling an event trigger, every tool call passes through the same permission gate. There is no privileged mode, no back channel, and no way for the agent to escalate its own permissions.</p>
<h2>Permission levels</h2>
<p>Each tool call is evaluated against three permission levels. The system checks them in priority order and uses the first match. If no rule matches, the default is Ask — the system always requires explicit approval for unconfigured tools:</p>
<ol>
<li><strong>Blocked.</strong> The tool is blocked and calls are rejected silently. The user is not notified of blocked calls to avoid spamming them with requests for tools they have explicitly disabled. Blocked calls are still recorded in the audit log so the user can review what the agent attempted to do. This level is typically applied to high-risk tools like code execution, system configuration changes, or payment operations.</li>
<li><strong>Ask.</strong> Every call pauses and presents an approval sheet to the user. The user sees the tool name, the full parameter list rendered in human-readable form, the agent's reasoning for making the call, and the current permission category. The user can approve once, approve for the session, approve always for this tool, or deny. Ask is the default level for any tool the user has not explicitly configured, ensuring no unexpected action occurs without oversight.</li>
<li><strong>Auto.</strong> Approved automatically without user intervention. Used for low-risk, reversible tools: reading files, searching memory, performing calculations, fetching weather data, checking calendar availability. Auto-approval operates within rate limits — if the agent calls an Auto-approved tool more than N times per minute (default 30), subsequent calls are automatically downgraded to Ask to prevent runaway behaviour.</li>
</ol>
<h2>Permission by tool category</h2>
<p>Tools are categorised by their side effects, and default permission levels vary by category. The user can override the default for any individual tool or category:</p>
<ul>
<li><strong>Read.</strong> Tools that read data without modifying it: search, read file, get weather, check calendar, retrieve memory. Default: Auto. Reads are reversible and do not change system state.</li>
<li><strong>Write.</strong> Tools that create or modify data: create file, send email, add calendar event, save memory entry. Default: Ask. Writes change state and may be difficult to undo.</li>
<li><strong>Send.</strong> Tools that transmit data to another person or system: post message, send notification, make payment, share document. Default: Ask (always requires explicit approval in the current implementation, even if the user has set the category to Auto). This is the only category with a hard Ask requirement.</li>
<li><strong>Execute.</strong> Tools that run code or commands: run shell command, execute script, deploy application. Default: Ask (always blocked unless explicitly enabled by the user). Execute tools are the highest-risk category and require deliberate opt-in.</li>
<li><strong>Configure.</strong> Tools that change system settings: update permissions, install toolset, change model endpoint, modify skill definitions. Default: Blocked. Configure tools are never allowed without explicit user action to enable them.</li>
</ul>
<h2>The approval sheet</h2>
<p>When a tool call requires approval, the user sees the approval sheet — a modal interface that provides all the information needed to make a decision:</p>
<ul>
<li><strong>Tool identity.</strong> The name and description of the tool being called.</li>
<li><strong>Parameters.</strong> The full set of parameters being passed, rendered in a human-readable format. File paths are shown as clickable links. Email addresses are shown with contact names if available. Monetary amounts are highlighted.</li>
<li><strong>Agent reasoning.</strong> The agent's explanation of why it wants to call this tool, extracted from the current turn context. This is the model's own reasoning, not a template string.</li>
<li><strong>Permission context.</strong> The tool's category, the current permission level, and any session-specific rules that apply.</li>
<li><strong>Decision buttons.</strong> Approve once (one-time approval for this specific call), Approve for session (auto-approve this tool for the remainder of the session), Approve always (add a permanent Auto rule for this tool), or Deny. When the user denies a call, they can optionally provide a reason, which is added to context so the agent learns not to make similar calls.</li>
</ul>
<p>The approval sheet is non-blocking at the system level — other tool calls that are auto-approved can execute while the approval sheet is displayed. But the plan execution pauses: the agent cannot proceed past a step that requires approval until the user responds. If the user does not respond within a configurable timeout (default 5 minutes), the pending call is automatically denied and the plan is adjusted accordingly.</p>
<h2>Context-aware permissions</h2>
<p>Permissions are not static — they can vary based on the context of the request. Arble supports several forms of context-aware permission evaluation:</p>
<ul>
<li><strong>Session scope.</strong> A permission rule can apply only within a specific session. The user can grant Auto permission for a file-write tool "for this session only" through the approval sheet, creating a temporary rule that expires when the session ends.</li>
<li><strong>Agent scope.</strong> Different agents can have different permission levels for the same tool. A research agent might have Auto for web search while a social media agent has Ask for the same tool.</li>
<li><strong>Content sensitivity.</strong> If the agent's reasoning or the tool parameters contain sensitive patterns — email addresses, phone numbers, financial data — the permission gate can escalate an Auto rule to Ask automatically. The sensitivity detection uses pattern matching and, optionally, a lightweight classifier model.</li>
<li><strong>Temporal rules.</strong> Permission levels can vary by time of day. Write tools might be Auto during working hours and Ask outside them, based on user preference.</li>
</ul>
<h2>Permission audit</h2>
<p>Every permission decision is recorded in the immutable audit log. The log is stored in SQLite with append-only semantics — entries can be read but never deleted or modified. Each audit entry includes:</p>
<ul>
<li><strong>Timestamp.</strong> When the decision was made, with millisecond precision.</li>
<li><strong>Agent and session.</strong> Which agent and session made the call.</li>
<li><strong>Tool and parameters.</strong> The full tool call, including all parameter values.</li>
<li><strong>Agent reasoning.</strong> The model's explanation for why the call was needed.</li>
<li><strong>Decision.</strong> Whether the call was auto-approved, manually approved, or denied.</li>
<li><strong>User context.</strong> For manual decisions, how the user responded (approve once, approve session, approve always, deny with reason).</li>
</ul>
<p>The audit log is accessible through the activity feed and the security dashboard. Users can filter by tool, date range, agent, or decision type. The log is exportable as JSON for external review or compliance purposes. This audit trail is the foundation of Arble's transparency model — every action the agent takes is recorded, attributable, and reviewable.</p>`
},
"25":{
part:"Arble",
title:"Local Models",
prev:{num:"24",title:"Permissions"},
next:{num:"26",title:"Cloud Models"},
content:`<h2>Running models on device</h2>
<p>Local model inference means running a language model on the device's own hardware — CPU, GPU, Neural Engine, or a combination — rather than sending data to a cloud API. Arble supports local models through multiple backends: Ollama (for desktop and server), llama.cpp (for on-device CPU and GPU inference), Core ML (for Apple Neural Engine acceleration), and any server that exposes an OpenAI-compatible API. Each backend is accessed through the same model router interface, so the agent loop never needs to know whether a model is running locally or in the cloud.</p>
<p>The advantage of local models is complete data privacy. The model call is the only part of the agent loop that could involve an external service, and with a local model, even that stays on-device. The entire agent loop — session management, memory, permission gate, and model inference — runs on hardware the user owns. No data leaves the device unless the user explicitly invokes a tool that requires network access, such as web search or cloud model fallback.</p>
<h2>Supported local backends</h2>
<p>Arble's model router treats local endpoints identically to cloud endpoints. Each backend is exposed as a URL with an OpenAI-compatible chat completions API, so the router sends the same request format regardless of the backend:</p>
<ul>
<li><strong>Ollama.</strong> A popular local model runner for macOS, Linux, and Windows. Supports hundreds of models ranging from 0.5B to 236B parameters. Ollama handles model downloading, quantisation, and GPU acceleration automatically. Arble's desktop agent includes an integrated Ollama client that can download and manage models on demand.</li>
<li><strong>llama.cpp.</strong> A lightweight C++ implementation of transformer inference, optimised for CPU and GPU execution. llama.cpp is used on mobile devices where Ollama is not available. It supports all major quantisation formats (GGUF) and can run models as large as 13B parameters on modern phones with acceptable performance. The Arble mobile app bundles a pre-compiled llama.cpp library for iOS and Android.</li>
<li><strong>Core ML.</strong> Apple's on-device machine learning framework. Models converted to Core ML format run efficiently on the Apple Neural Engine (ANE), which provides dedicated hardware for neural network inference. Core ML models use significantly less power than CPU or GPU inference — critical for maintaining battery life during sustained agent use. Arble's model converter automatically translates supported model formats to Core ML when running on Apple devices.</li>
<li><strong>Custom endpoints.</strong> Any server or service that exposes an OpenAI-compatible chat completions API can be registered as a local endpoint. This includes self-hosted model servers using vLLM, Text Generation Inference (TGI), or custom inference stacks. It also includes private cloud deployments on infrastructure the user controls. Custom endpoints are configured through the model settings UI by providing a base URL and an optional API key.</li>
</ul>
<h2>Model selection for local inference</h2>
<p>Not every model runs well on every device. The model router considers several factors when selecting a local model for a request. The selection algorithm evaluates these factors in order, applying filters and scoring to produce a ranked list of suitable models:</p>
<ul>
<li><strong>Memory budget.</strong> A 7B parameter model in 4-bit quantisation requires approximately 4 GB of RAM for inference. The router checks the device's available memory before loading a model. If memory is insufficient, the router falls back to a smaller quantisation (2-bit or 3-bit) or to a smaller model (3B or 1B parameters). The memory check is conservative — it reserves additional headroom for the OS and other running applications.</li>
<li><strong>Hardware acceleration.</strong> Apple devices with A17 Pro or M-series chips can use the Neural Engine for significant inference speedups. The router checks which accelerators are available and prefers models that are compatible. On devices without dedicated AI hardware, the router falls back to GPU or CPU inference, adjusting its latency expectations accordingly.</li>
<li><strong>Task complexity.</strong> The router classifies each request by complexity. Simple tasks — text classification, entity extraction, summarisation — run well on 1–3B parameter models and are routed accordingly. Complex tasks — multi-step reasoning, code generation, planning — benefit from larger models (7B–13B) and are routed to the most capable local model available, or to a cloud model if no local model meets the complexity threshold.</li>
<li><strong>Battery and thermal state.</strong> Local model inference consumes power and generates heat. The router can be configured to prefer cloud models when the device is on battery power and local models when plugged in. When the device's thermal state exceeds a threshold, the router pauses local inference entirely to prevent throttling or shutdown.</li>
</ul>
<h2>Quantisation and performance</h2>
<p>Local models are typically quantised — the precision of the model weights is reduced from the training-time 16-bit floating point to 8-bit, 4-bit, or even 2-bit integer representations. Quantisation reduces memory usage and improves inference speed, with a controlled trade-off in output quality. A well-tuned 4-bit quantisation of a 7B parameter model retains approximately 95–97% of the full-precision quality while using 75% less memory and running 2–3x faster on most hardware.</p>
<p>Arble's model loader selects the optimal quantisation for the device's capabilities automatically. The selection algorithm considers: available memory (higher precision requires more memory), available storage (quantised models are smaller and faster to download), hardware support (some accelerators have native support for specific quantisation formats), and the task's quality requirements (complex reasoning tasks receive higher precision, while classification tasks can use lower precision). The user can override the automatic selection and pin a specific quantisation for any model.</p>
<p>The loader also manages quantisation on download. When a new model is pulled from the model registry, the loader fetches the highest precision version and applies the selected quantisation locally. This avoids storing multiple copies of the same model and lets the user change quantisation without re-downloading.</p>
<h2>Model management</h2>
<p>Local models are managed through the model store, which tracks all downloaded and available models. The store records: the model name and version, the file path and size, the quantisation format, the supported backends (Ollama, llama.cpp, Core ML, etc.), the current download status, and the last used timestamp. Users can browse available models, download new ones from the model registry, remove models they no longer need, and inspect model metadata including parameter count, context window size, and recommended use cases.</p>
<p>Downloads are resumable and verify checksums to ensure integrity. The model registry catalogues hundreds of models with curated metadata — the registry entry for each model specifies its capabilities, optimal quantisation range, memory requirements, and known compatibility issues with specific devices or backends. The router uses this metadata during the selection process to avoid suggesting models that will not work on the current device.</p>
<h2>Performance monitoring</h2>
<p>The runtime tracks inference performance for local models and exposes the metrics through the observability system. Metrics include: tokens per second generation speed, time to first token, peak memory usage during inference, quantisation quality evaluation (perplexity or task-specific accuracy compared to a reference), and power consumption estimate (mWh per 1000 tokens). These metrics help users understand the performance characteristics of different model and quantisation combinations on their specific hardware, enabling informed decisions about which models to use for which tasks.</p>`
},
"26":{
part:"Arble",
title:"Cloud Models",
prev:{num:"25",title:"Local Models"},
next:{num:"27",title:"Hybrid Execution"},
content:`<h2>Cloud models in the loop</h2>
<p>Cloud models are language models hosted on remote servers and accessed through HTTP APIs. They offer capabilities that even the largest local models cannot match: larger context windows (200K tokens and beyond), higher accuracy on complex reasoning and specialised tasks, multimodal understanding that spans text, images, and audio, and significantly faster generation speeds for complex outputs thanks to datacentre-grade GPUs.</p>
<p>In Arble, cloud models are interchangeable endpoints behind the model router. The agent loop does not know or care whether the model behind a given endpoint is running on-device or in a datacentre. The router selects the best endpoint for each request based on task requirements, cost, latency, and availability. This abstraction is the key to Arble's model flexibility — users can add, remove, or switch providers without any change to how the agent operates.</p>
<h2>Supported providers</h2>
<p>Arble supports seven cloud model providers with dedicated adapters that normalise each provider's API into a common interface. Each adapter handles authentication, request formatting, response parsing, error mapping, and streaming:</p>
<ul>
<li><strong>Anthropic.</strong> Claude models — 3.5 Sonnet, 4 Opus, and future releases. Strong on reasoning, code generation, and long-context tasks. Claude's strengths include nuanced instruction following, structured output generation, and low hallucination rates on factual queries. The adapter is at <code>src/llm/anthropic.ts</code> and supports Anthropic's prompt caching API for reducing costs on repeated system prompts.</li>
<li><strong>OpenAI.</strong> GPT models — 4o, 4.5, and the o-series reasoning models. Broad capability set with particular strength in creative tasks, instruction following, and structured data extraction. The adapter at <code>src/llm/openai.ts</code> supports OpenAI's structured output mode, response format validation, and prompt caching features.</li>
<li><strong>NVIDIA.</strong> NVIDIA NIM — hosted models running on NVIDIA's inference infrastructure. The adapter at <code>src/llm/nvidia.ts</code> provides access to NVIDIA-optimised versions of popular open-weight models, often with superior inference performance due to NVIDIA's TensorRT optimisation.</li>
<li><strong>DeepSeek.</strong> DeepSeek models — competitive with US-based providers on reasoning and code generation tasks, typically at lower cost. The adapter at <code>src/llm/deepseek.ts</code> handles DeepSeek's API format and supports their context caching features.</li>
<li><strong>Kimi.</strong> Moonshot AI's Kimi models — strong on long-context understanding and document analysis. The adapter at <code>src/llm/kimi.ts</code> handles the Kimi API, and a specialised coding variant at <code>src/llm/kimiCode.ts</code> provides access to Kimi's code-optimised endpoint.</li>
<li><strong>GitHub Copilot.</strong> Accessible through the user's Copilot subscription. The adapter at <code>src/llm/copilot.ts</code> authenticates through the Copilot token exchange and provides access to the Copilot model endpoint without additional API charges.</li>
<li><strong>OpenAI-compatible.</strong> A generic adapter at <code>src/llm/openaiCompat.ts</code> that works with any endpoint implementing the OpenAI chat completions API format. This includes Together AI, Groq, Fireworks, Perplexity, and self-hosted model servers. Users configure the base URL and optional API key through the model settings UI.</li>
</ul>
<h2>Routing criteria</h2>
<p>The router evaluates each request against multiple criteria to select the optimal cloud model. The criteria are scored and weighted according to the user's routing strategy:</p>
<ul>
<li><strong>Task type.</strong> The classifier analyses the incoming request to determine the task type: factual query, creative writing, code generation, data extraction, planning, or multimodal analysis. Each model has a capability profile that rates its effectiveness for each task type. The router matches the request's task type against the capability profiles to produce a shortlist of suitable models.</li>
<li><strong>Cost.</strong> Each model has a per-token cost for input and output tokens. The router tracks cumulative spend per session, per day, and per month. If the user has configured a budget, the router prefers cheaper models as the budget is approached. Cost is calculated in real-time based on the expected token count for the request.</li>
<li><strong>Latency.</strong> The router maintains a moving average of time-to-first-token and total response time for each model endpoint. For interactive conversations, the router may prefer a faster model even if it is slightly more expensive or less capable. The latency data is updated after every inference call.</li>
<li><strong>Availability.</strong> The router continuously monitors endpoint health. If a provider returns HTTP errors, rate-limit responses (429), or timeout errors above a threshold, the router marks the endpoint as degraded and deprioritises it. Degraded endpoints are still used if no alternative is available, but the router applies a penalty to their score.</li>
<li><strong>User preference.</strong> The user can pin specific tasks to specific models — "always use Claude for code review," "always use GPT for creative writing" — creating hard rules that override the automatic selection. Pinned rules are evaluated first, before any other routing criteria.</li>
</ul>
<h2>Fallback chain</h2>
<p>For each request, the router defines a fallback chain: an ordered list of model endpoints to try in sequence. The fallback chain is constructed dynamically based on the routing criteria. If the primary model is unavailable, rate-limited, or returns an error, the router tries the next model in the chain. The chain continues until a model responds successfully, or until all models have been exhausted:</p>
<ul>
<li><strong>Primary.</strong> The highest-scoring model based on the routing criteria. This is the model the router expects to handle the request.</li>
<li><strong>Secondary.</strong> The second-highest-scoring model, typically from a different provider to avoid correlated failures. If the primary is an Anthropic model, the secondary might be an OpenAI model or a local model.</li>
<li><strong>Tertiary.</strong> A fallback model, possibly with lower capability but higher reliability. This might be a cheaper, faster model from any available provider.</li>
<li><strong>Local fallback.</strong> If all cloud models fail, the router falls back to a local model if one is available and has sufficient capability for the request. The local fallback is the last line of defence before reporting failure to the user.</li>
</ul>
<p>The fallback chain is configurable per session. High-priority sessions can have broader fallback chains with more expensive models included as fallbacks. Routine tasks have tighter chains that fail faster to avoid wasting time on unresponsive endpoints.</p>
<h2>API key management</h2>
<p>Cloud model API keys are the most sensitive credentials in the system. Arble stores them exclusively in SecureStore (iOS Keychain, Android EncryptedSharedPreferences, macOS Keychain) and never writes them to disk unencrypted. Keys are loaded into memory only when needed for a model call and are not retained in session logs, memory entries, or crash reports.</p>
<p>The key management UI lets users add, remove, and test API keys. Keys can be scoped to specific models or providers — a key for Anthropic cannot be used to authenticate against the OpenAI adapter. The system validates keys on entry by making a test request to the provider's API and reports any errors without exposing the key value in the UI or logs. If a key is revoked by the provider or expires, the router detects the authentication failure and marks the endpoint as unavailable, falling back to the next model in the chain.</p>
<h2>Cost management</h2>
<p>The router tracks token usage and cost per provider, per model, and per session. Running totals are displayed in the model settings dashboard, and users can set monthly spending budgets for each provider or for cloud models as a whole. When the budget is approached, the router sends a notification and begins preferring cheaper models and larger quantisations. Budget thresholds are configurable: a warning at 80% usage, a hard limit at 100% where cloud model calls are blocked and the router falls back to local models only. All cost data is computed on-device from the token counts — no usage data is sent to Arble servers.</p>`
},
"27":{
part:"Arble",
title:"Hybrid Execution",
prev:{num:"26",title:"Cloud Models"},
next:{num:"28",title:"Inference"},
content:`<h2>Combining local and cloud</h2>
<p>Hybrid execution is the ability to route different parts of a single request to different models — some local, some cloud — and combine the results into a coherent response. The agent loop does not need to run on a single model end-to-end. It can use a local model for privacy-sensitive parts of a task, a cloud model for complex reasoning, and a specialised vision model for image analysis, all within the same session and often within the same turn of the agent loop.</p>
<p>This is not model switching at the conversation level, where one message uses Claude and the next uses GPT. Hybrid execution is model selection at the sub-task level: within a single agent loop iteration, the system can route different steps of the agent's plan to different models based on what each step requires. The agent proposes a plan, and the router assigns each step to the most appropriate model, potentially re-assigning steps dynamically if a model fails or returns poor results.</p>
<h2>When to use hybrid</h2>
<p>Hybrid execution adds complexity — multiple models, multiple latency profiles, potential consistency issues — so it is only used when the benefits outweigh the overhead. The router activates hybrid execution in four scenarios:</p>
<ul>
<li><strong>Privacy routing.</strong> When the agent's task involves sensitive data — personal emails, health information, financial documents — the router prefers local models for any step that touches the sensitive data. Cloud models are used only for steps that need capabilities the local model lacks and that operate on anonymised or derived data rather than raw sensitive content. The local model processes the sensitive input and produces a structured summary; the cloud model works with the summary, not the original data.</li>
<li><strong>Cost optimisation.</strong> Complex tasks generate many tool calls, each of which may trigger a model inference. Using a flagship cloud model for every inference is expensive. The router identifies steps that are well within the capabilities of a small local model — parameter extraction, text formatting, basic classification — and routes those to local inference. Only the steps that genuinely need flagship-level reasoning — planning, code synthesis, complex analysis — are sent to cloud models. This can reduce cloud costs by 40–60% on complex multi-step tasks.</li>
<li><strong>Capability bridging.</strong> Different models have different strengths. A local text model may handle language tasks well but have no vision capability. When the task requires analysing an image, the router routes the image analysis sub-step to a cloud vision model while keeping the rest of the conversation on the local model. The cloud model returns a text description of the image, which the local model incorporates into its reasoning. This lets users benefit from specialised model capabilities without committing to a single provider for the entire session.</li>
<li><strong>Offline tolerance.</strong> When the network is unavailable or unreliable, the router uses the local model for all steps. When the network returns, the router switches back to the optimal model for each sub-task. The transition is seamless — the active plan is preserved, and only the model assignment for each pending step changes. The user sees a notification that the system has switched between local and cloud modes, but no conversation context is lost.</li>
</ul>
<h2>Sub-task routing in the agent loop</h2>
<p>The model router implements hybrid execution through per-step routing within the agent's plan. When the agent produces a multi-step plan, the router evaluates each step independently and assigns the best available model. The assignment happens before execution begins, but it can be revised dynamically:</p>
<ol>
<li>The agent produces a plan with three steps: extract structured data from a PDF, analyse the extracted data for trends, and compose a report summarising the findings.</li>
<li>The router assigns step 1 to a local model — the PDF contains sensitive personal data that should not leave the device. The local model extracts the relevant fields and produces a structured JSON output.</li>
<li>The router assigns step 2 to a cloud reasoning model — the analysis requires complex statistical reasoning that exceeds the local model's capabilities. The cloud model receives only the structured JSON from step 1, not the raw PDF content.</li>
<li>The router assigns step 3 to the local model — the composition task is well within its capabilities, and keeping it local avoids unnecessary cloud costs for a formatting task.</li>
<li>If the cloud model in step 2 times out, the router dynamically reassigns step 2 to a different cloud model or, if no alternative is available, falls back to the local model with a quality warning.</li>
</ol>
<p>The model assignments are recorded in the session log, and the user can see which model handled each step in the activity feed. This transparency lets users understand where their data is being processed and make informed decisions about their hybrid configuration.</p>
<h2>Data flow and privacy</h2>
<p>Hybrid execution raises important privacy questions: if a local model handles part of a request and a cloud model handles another part, what data does the cloud model see? Arble's hybrid execution is designed to minimise data exposure to cloud providers:</p>
<ul>
<li><strong>Context isolation.</strong> Each model receives only the context relevant to its assigned sub-task. The cloud model processing step 2 does not receive the raw PDF text that the local model processed in step 1. The local model's output to the cloud model is the structured result — a JSON object containing only the extracted fields, not the full document.</li>
<li><strong>Structured handoffs.</strong> All data passed between models uses structured formats (JSON schemas) rather than free text. This means the cloud model receives precisely the data it needs, no more. The handoff schema is defined by the skill or plan and cannot be expanded by the agent without explicit permission.</li>
<li><strong>User consent.</strong> When a hybrid execution plan is created, the system shows the user which steps will use cloud models and what data those steps will receive. The user can approve the plan, modify it (e.g., force a specific step to use local models), or reject it. This consent is recorded in the audit log alongside the execution results.</li>
</ul>
<h2>Consistency across models</h2>
<p>Different models produce different results for the same input. A hybrid execution system must handle this inconsistency without producing incoherent outputs. Arble addresses the consistency problem through several mechanisms:</p>
<ul>
<li><strong>Structured tool calls.</strong> Each step in a hybrid plan produces a typed result, not free text. The structured format constrains the output space and makes results from different models more predictable and more interoperable. A local model and a cloud model that both receive the same structured input task are likely to produce results in the same schema, even if the content differs.</li>
<li><strong>Context isolation prevents contamination.</strong> Because each model has a limited, well-defined context window, there is no risk of one model's stylistic quirks or factual errors propagating to another model's output. Each model operates independently within its assigned sub-task.</li>
<li><strong>Verification stage.</strong> The final output of a hybrid execution passes through the agent's verification stage, where the agent checks for internal consistency before presenting results to the user. If the verification detects contradictions between steps — for example, the analysis step concluded a trend is increasing while the composition step described it as decreasing — the agent flags the inconsistency and may re-execute the problematic steps with additional context.</li>
<li><strong>Unified system prompt.</strong> All models in a hybrid execution receive the same system prompt, ensuring consistent behaviour guidelines, output formatting rules, and ethical constraints regardless of which model is handling a particular sub-task.</li>
</ul>
<h2>Configuration and control</h2>
<p>Hybrid execution is transparent to the user by default. The router makes all sub-task routing decisions automatically based on the configured strategy (privacy-optimised, cost-optimised, or balanced). The user does not need to specify which model handles which part of a request. The activity log shows which model handled each step, and the user can inspect the details of any step to understand why a particular model was selected.</p>
<p>For advanced users, Arble exposes explicit hybrid configuration options. Users can create routing rules that override the automatic selection for specific tools, specific data types, or specific sessions: "always route email-related tool calls to the local model," "always route code generation to Claude," "never send financial data to a cloud provider." These rules are evaluated alongside the routing criteria and take priority over automatic selection. Users can also disable hybrid execution entirely, forcing all requests to use a single model for the full agent loop.</p>`
},
"28":{
part:"Production",
title:"Inference",
prev:{num:"27",title:"Hybrid Execution"},
next:{num:"29",title:"Routing"},
content:`<h2>What inference means in production</h2>
<p>Inference in the context of Arble is not just running a model — it is running a model as part of a real-time agent system. The inference call is one component of the agent loop, and its latency, cost, and reliability directly affect the user experience. A model that takes 30 seconds to respond makes the agent feel broken, regardless of the quality of the response.</p>
<p>Production inference management is about balancing quality, latency, cost, and reliability across potentially dozens of model calls per session. The system must handle model errors gracefully, manage concurrent requests, and maintain consistent performance under varying load.</p>
<h2>Inference lifecycle</h2>
<p>Each inference call goes through five stages:</p>
<ol>
<li><strong>Preparation.</strong> The router selects the model and the session manager prepares the context — system prompt, conversation history, tool schemas, memory results. The context is tokenised and truncated to fit the model's window.</li>
<li><strong>Transmission.</strong> The prepared context is sent to the model endpoint. For cloud models, this is an HTTPS request. For local models, it is a localhost API call or a direct C++ binding call.</li>
<li><strong>Generation.</strong> The model produces tokens. For streaming endpoints, tokens arrive incrementally. For non-streaming endpoints, the full response arrives at once.</li>
<li><strong>Processing.</strong> The response is parsed. Tool calls are extracted from the response JSON. The text content is added to the session as a new turn.</li>
<li><strong>Post-processing.</strong> The session compactor runs (context may need pruning after the new turn). The memory manager checks if any information should be extracted and stored.</li>
</ol>
<p>The total wall-clock time from user message to the agent's next action is the sum of all five stages. Optimisation efforts focus on the stages that contribute most to latency in practice: transmission (network time to cloud models) and generation (model speed).</p>
<h2>Streaming</h2>
<p>Arble supports streaming responses from all providers that offer them. Streaming reduces perceived latency: the user sees the first tokens of the response while the rest is still being generated. For tool calls, streaming is not typically used — the agent generates the tool call JSON internally and executes it without displaying it to the user.</p>
<p>The streaming implementation is provider-agnostic. Each adapter converts the provider's streaming format into a standard event stream, and the UI renders tokens incrementally. If the provider does not support streaming, the response is buffered and displayed in full.</p>
<h2>Caching</h2>
<p>Repeated inference calls waste time and money. Arble caches responses at multiple levels:</p>
<ul>
<li><strong>Prompt cache.</strong> Cloud providers with prompt caching (Anthropic, OpenAI) automatically cache repeated system prompt prefixes. The adapter sends cache-control headers to maximise cache hits.</li>
<li><strong>Response cache.</strong> Identical requests with identical context produce identical responses. The router maintains a response cache keyed on the full input hash. Cache hits skip the model entirely.</li>
<li><strong>Embedding cache.</strong> Memory search uses embeddings. Generated embeddings are cached so the same text never needs to be re-embedded.</li>
</ul>
<p>Caching is transparent to the agent and the user. The activity log notes when a response was served from cache.</p>
<h2>Prefill and decode</h2>
<p>Serving a request has two phases with completely different characteristics, and almost every latency question resolves to which one you are in.</p>
<p>Prefill processes your input. It is parallel across tokens, so it is fast and scales well — a long prompt costs more than a short one, but not proportionally to how it feels. Decode generates the answer one token at a time, each pass depending on the last. It cannot be parallelised within a request.</p>
<p>So time-to-first-token is mostly prefill and mostly cheap, while total time is dominated by how much output you asked for. Asking for brevity is not politeness; it is the main lever a caller has over latency.</p>
<h2>What caching actually saves</h2>
<p>Arble caches at several layers for different reasons: resolved model limits held in memory so they are not re-derived per call, provider-side prompt caching to cut the cost of re-sent context, MMKV for configuration, and a file state cache for tracking changes.</p>
<p>Prompt caching is the one with real economic effect on an agent loop. Every iteration re-sends the system prompt, the tool definitions and the conversation so far — largely identical to the previous iteration. Caching that stable prefix means paying full price once rather than on every turn, which on a ten-step task is the difference between an affordable feature and one you turn off.</p>
<h2>Streaming as a latency strategy</h2>
<p>Streaming does not make generation faster; it makes waiting shorter. Tokens render as they arrive, so the user starts reading at the first one rather than the last.</p>
<p>In an agent loop it does more than that. Tool calls surface the moment they are proposed rather than after the turn completes, progress is visible during execution, and a permission prompt can appear mid-flight. It also makes interruption meaningful: if the first sentence shows the agent has misunderstood, you can stop it before it spends thirty seconds being wrong.</p>
<h2>Local inference on a phone</h2>
<p>Running a model on the device changes which numbers matter. There is no queue and no network, so a small local model can beat a hosted one to the first token even when the hosted model is far more capable.</p>
<p>What binds instead is memory bandwidth and thermals. Generation speed on a phone is largely a function of how fast weights can be read, and sustained load throttles. This is why local models are sized for the device rather than for the benchmark, and why the interesting question is not whether a phone can run a model but which requests are worth running there.</p>`
},
"29":{
part:"Production",
title:"Routing",
prev:{num:"28",title:"Inference"},
next:{num:"30",title:"Security"},
content:`<h2>The routing problem</h2>
<p>An AI operating system that supports multiple models must decide which one to use for each request. The wrong choice wastes money (using an expensive flagship model for a simple task), hurts latency (sending a trivial query to a slow model), or produces poor results (using a weak model for a complex reasoning task).</p>
<p>The model router in Arble solves this by treating model selection as an optimisation problem with multiple objectives: quality, cost, latency, privacy, and availability. The router evaluates each request against these objectives and selects the best endpoint.</p>
<h2>Router architecture</h2>
<p>The router has three layers:</p>
<ul>
<li><strong>Classifier.</strong> Analyses the incoming request and extracts features: task type (code, reasoning, creative, factual), complexity (simple, medium, complex), sensitivity (contains personal data?), modality (text, vision, audio). The classifier uses keyword patterns and, optionally, a lightweight model call.</li>
<li><strong>Selector.</strong> Matches the classified request against the available endpoints. Each endpoint has a capability profile: which task types it handles well, its cost per token, its typical latency, its privacy level (local vs. cloud), and its current availability status.</li>
<li><strong>Executor.</strong> Sends the request to the selected endpoint, monitors the response, and handles failures. If the endpoint returns an error or times out, the executor applies the fallback chain.</li>
</ul>
<p>The entire routing decision takes under 10 milliseconds for most requests, which is negligible compared to the inference time.</p>
<h2>Routing strategies</h2>
<p>The router supports several strategies, configurable by the user:</p>
<ul>
<li><strong>Cost-optimised.</strong> Prefers the cheapest model that meets the minimum quality threshold for the task type. Flagship models are used only when cheaper models are likely to fail.</li>
<li><strong>Quality-optimised.</strong> Always selects the best available model for the task, regardless of cost. Used for high-stakes tasks.</li>
<li><strong>Latency-optimised.</strong> Prefers the fastest model, even if it costs more. Used for interactive conversations where response time matters most.</li>
<li><strong>Privacy-optimised.</strong> Prefers local models. Cloud models are used only when no local model can handle the task.</li>
<li><strong>Manual.</strong> The user specifies which model to use for each conversation or task type, overriding the automatic selection.</li>
</ul>
<h2>Fallback and degradation</h2>
<p>No model endpoint is perfectly reliable. Cloud APIs return errors, rate-limit, or degrade. Local models can be swapped out or removed. The router monitors endpoint health continuously:</p>
<ul>
<li><strong>Health checks.</strong> Each endpoint is pinged periodically. Failed health checks mark the endpoint as degraded.</li>
<li><strong>Error tracking.</strong> The router tracks error rates per endpoint. Sustained errors trigger automatic fallback.</li>
<li><strong>Latency monitoring.</strong> If an endpoint's latency exceeds its typical p95 by more than 2x, the router marks it as degraded.</li>
<li><strong>Degradation response.</strong> Degraded endpoints are deprioritised. The router still uses them if necessary (all other endpoints are also degraded), but prefers healthier alternatives.</li>
</ul>
<p>The fallback chain is ordered by preference, not by priority. The router tries the first endpoint in the chain; if it fails, it tries the second; and so on. The chain can mix local and cloud endpoints arbitrarily.</p>
<h2>Classification comes first</h2>
<p>Routing starts by deciding what kind of request this is. Arble classifies into tiers — simple, complex, vision, creative and offline — and routes accordingly: short factual questions and timers to a fast small model, multi-step work involving scheduling, sending, searching or analysis to a stronger one, image content to a vision-capable model, and everything to a local model when there is no network.</p>
<p>Classification is itself a cost. Done with a model call it can exceed what it saves on cheap requests, which is why keyword and content heuristics carry the obvious cases and only ambiguous ones deserve more effort.</p>
<h2>The objectives being traded</h2>
<p>Model selection optimises several things at once, and they conflict. Quality argues for the strongest model. Cost argues for the cheapest that will do. Latency argues for the fastest. Privacy argues for local. Availability argues for whatever is currently answering.</p>
<p>No fixed weighting is right for every request. A trivial question wants speed and cost. A legal document wants privacy above all, which may mean local even at a quality penalty. A complex analysis justifies the expensive model. A good router encodes these as policy rather than burying them in code, because the weighting is a product decision that changes.</p>
<h2>Fallback chains</h2>
<p>Providers fail — rate limits, outages, timeouts, refusals. A router with one provider inherits that provider's uptime as its own.</p>
<p>Arble implements automatic fallback across seven adapters covering Anthropic, OpenAI, NVIDIA NIM, DeepSeek, Kimi and local Ollama, with an offline queue behind them. What matters in a fallback design is preserving intent: falling back from a strong model to a weak one on a task that needed the strong one produces a fast bad answer, which is not obviously better than a slow good one. Falling back should also be visible, because the user has a right to know which model answered.</p>
<h2>Provider-agnostic by construction</h2>
<p>Each adapter implements a common interface, so the loop is written against the interface and not against any provider's SDK. That is what makes swapping providers a configuration change rather than a rewrite.</p>
<p>The abstraction is not free — providers differ in streaming formats, token limits, tool-call encodings and reasoning-model quirks, and every one of those differences has to be absorbed somewhere. Absorbing it in the adapter is the right place, because the alternative is provider-specific branches scattered through the runtime, which is how systems end up permanently married to one vendor.</p>`
},
"30":{
part:"Production",
title:"Security",
prev:{num:"29",title:"Routing"},
next:{num:"31",title:"Observability"},
content:`<h2>Security model</h2>
<p>Arble's security model is based on the principle that the agent should have the minimum necessary access to accomplish the user's goals. This is the same principle as least-privilege access in traditional systems, applied to AI agents: the agent should not have access to data or tools it does not need, and every access should be justifiable.</p>
<p>The security model has four layers:</p>
<ul>
<li><strong>Device security.</strong> The runtime uses the device's built-in security features — Secure Enclave, Keychain, biometric authentication — to protect stored data.</li>
<li><strong>Network security.</strong> All external communication is encrypted. Local network pairing uses mutual authentication. Cloud API keys are stored in the device's secure storage.</li>
<li><strong>Permission security.</strong> The permission gate is implemented in trusted code that the agent cannot modify. The agent proposes actions; the gate decides whether to allow them.</li>
<li><strong>Data security.</strong> User data is stored locally and encrypted at rest. Memory entries are encrypted before sync. The sync relay (if used) stores only encrypted blobs.</li>
</ul>
<h2>API key management</h2>
<p>Cloud model API keys are the most sensitive credentials in the system. Arble stores them in SecureStore (iOS Keychain / Android EncryptedSharedPreferences) and never writes them to disk unencrypted. Keys are loaded into memory only when needed for a model call and are not retained in session logs or memory stores.</p>
<p>The key management UI lets users add, remove, and test API keys. Keys can be scoped to specific models or providers. The system validates keys on entry and reports errors without exposing the key value.</p>
<h2>Local network security</h2>
<p>Pairing between devices uses a verification code displayed on both devices — the same pattern as AirDrop. The pairing is mutual: both devices must confirm the code before the connection is established. After pairing, all communication is encrypted using keys derived from the Secure Enclave of each device.</p>
<p>The local network communication uses WebSocket with TLS. The desktop agent generates a self-signed certificate on first run, and the mobile app verifies the certificate fingerprint during pairing. Certificate pinning prevents man-in-the-middle attacks on the local network.</p>
<h2>Audit and transparency</h2>
<p>Security is not just about preventing bad actions — it is also about making good actions visible. Arble's audit log records every tool call, every permission decision, every model request, and every network connection. The log is stored locally and cannot be modified by the agent. The user can export the log for external review.</p>
<p>The audit log is the foundation of Arble's transparency model. The agent does not operate in a black box — everything it does is recorded and can be reviewed. This is how the user builds trust over time: not by hoping the agent behaves well, but by verifying that it does.</p>
<h2>What is actually being protected</h2>
<p>Three assets, with different threat models. Credentials — API keys and OAuth tokens — are the highest value, because they grant access to everything else. Personal data is the largest surface: memory, sessions, files, messages. And execution capability is the most dangerous, because an agent that can run commands and send messages can cause harm without any data leaving.</p>
<p>Arble's approach to the first is encrypted device storage with keys never written to logs or committed; to the second, keeping data local unless explicitly synced; and to the third, a permission gate every tool call passes through.</p>
<h2>Prompt injection</h2>
<p>The vulnerability with no clean fix deserves its own section. An agent reads untrusted content — a web page, an email, a document — and that content contains text addressed to the agent: ignore your instructions, send this file, visit this URL.</p>
<p>Because the model processes instructions and data in the same channel, there is no reliable way to guarantee it distinguishes them. Mitigations reduce the odds — marking untrusted content clearly, instructing the model to treat it as data, filtering obvious patterns — and none of them are sound in the way a bounds check is sound.</p>
<p>Which is why the real defence is architectural rather than linguistic. If a successful injection still cannot send an email without human approval, the attack degrades from compromise to nuisance. The permission gate is the injection defence; the prompt-level measures are supplementary.</p>
<h2>Least privilege in practice</h2>
<p>The principle is old and mostly ignored in agent systems, which tend to grant everything to one agent for convenience.</p>
<p>Applied properly it means subagents get only the tools their task requires, background runs get narrow auto-approval rather than broad, integrations are scoped to what they need rather than to what the OAuth screen offers, and desktop tools are an explicit surface rather than a shell. Each restriction removes a class of failure entirely instead of relying on a check to catch it.</p>
<h2>Auditability</h2>
<p>Security that cannot be inspected is a claim rather than a property. A durable record of what ran, what it touched and what it cost is what converts trust into verification.</p>
<p>It also has a practical role after an incident. When something goes wrong, the question is always what else was affected — and a system without a log can only answer with a guess. Attribution tracking, tool-call history and file modification records exist for the moment when someone needs to reconstruct what happened.</p>`
},
"31":{
part:"Production",
title:"Observability",
prev:{num:"30",title:"Security"},
next:{num:"32",title:"Scaling"},
content:`<h2>What observability means for an AI system</h2>
<p>Observability is the ability to understand what the system is doing, why it is doing it, and what happened in the past. For an AI operating system, observability is critical because the system's behaviour is generated, not programmed — you cannot read the source code to understand why the agent made a particular decision.</p>
<p>Arble's observability system covers four areas:</p>
<ul>
<li><strong>Session history.</strong> Every turn, every tool call, every model response, recorded in full.</li>
<li><strong>Activity feed.</strong> Real-time stream of what the agent is doing right now — which tool is running, which model is processing, which permission was granted.</li>
<li><strong>Performance metrics.</strong> Token usage, latency, cost, error rates — aggregated across sessions and providers.</li>
<li><strong>System health.</strong> Memory usage, background task status, sync status, storage usage.</li>
</ul>
<h2>Session history</h2>
<p>Every session is persisted with its full turn history. The user can review past sessions, search for specific turns, and inspect the exact context that was sent to the model. Tool calls show the parameters that were passed and the results that were returned. Permission decisions show the agent's reasoning and the user's response.</p>
<p>The session history is searchable using SQLite FTS5 (full-text search). Users can search by content ("find the conversation where we discussed the budget"), by tool ("show all sessions where the email tool was called"), or by date range.</p>
<h2>Activity feed</h2>
<p>The activity feed is a real-time log of the agent's current actions. It appears in the app's main screen and shows:</p>
<ul>
<li>What the agent is doing ("Searching the web for Q3 financial reports")</li>
<li>Which tools it has called and their status ("Web search — completed in 2.3s")</li>
<li>Which model is processing the current request ("Claude 4 Opus — generating response")</li>
<li>Permission requests awaiting approval ("Approve: send email to priya@example.com?")</li>
<li>Background task completions ("Daily digest — 3 emails summarised")</li>
</ul>
<p>The activity feed is stored locally and retained for 30 days by default. Older entries are archived but not deleted unless the user chooses to.</p>
<h2>Performance monitoring</h2>
<p>Arble tracks performance metrics to help users understand and optimise their usage:</p>
<ul>
<li><strong>Token accounting.</strong> Per-session, per-model, and cumulative token counts. The user can see exactly how many tokens each conversation used and how much it cost.</li>
<li><strong>Latency breakdown.</strong> How long each stage of the agent loop took — model selection, inference, tool execution, post-processing.</li>
<li><strong>Error tracking.</strong> Model errors, tool failures, permission denials, network timeouts — logged with timestamps and context.</li>
<li><strong>Budget tracking.</strong> If the user has set a monthly spending budget, the system tracks progress and notifies the user as the budget is approached.</li>
</ul>
<p>All metrics are computed on-device. No usage data is sent to Arble servers.</p>
<h2>What is worth recording</h2>
<p>An agent produces more interesting events than a normal application, because the interesting part is not a request and a response but a chain of decisions. The useful record covers which model answered and why the router chose it, every tool call with its arguments and result, permission decisions and who made them, token usage and cost per turn, compaction events and what they dropped, and errors with what was retried.</p>
<p>Arble logs with module-specific prefixes so a trace can be filtered to one subsystem. The prefix convention matters more than it sounds: without it, a single turn produces interleaved output from the router, the execution engine, the permission gate and the compaction pipeline, and reading it is archaeology.</p>
<h2>The questions observability has to answer</h2>
<p>Four questions come up repeatedly, and a logging design is good if it answers them quickly:</p>
<ul>
<li><strong>Why did it do that?</strong> Which tool, with what arguments, on whose approval.</li>
<li><strong>Why did that cost so much?</strong> Which turn, which model, how many tokens, and whether the cache was hit.</li>
<li><strong>Why is it slow?</strong> Prefill, decode, tool execution or waiting on a network call.</li>
<li><strong>What did it touch?</strong> Which files changed, which messages were sent, which endpoints were called.</li>
</ul>
<p>The last is the one that matters after an incident, and the one most often missing.</p>
<h2>Logs as a privacy surface</h2>
<p>Debug output is where secrets escape. A log line that helpfully dumps a request body can contain an API key, an email, a document, or the contents of a private message.</p>
<p>The rules are boring and absolute: never log credentials, redact tool arguments that carry personal data, keep logs on the device unless someone explicitly exports them, and treat any log-forwarding feature as a data-export feature with the review that implies. Verbose logging is exactly the sort of thing that gets enabled to debug something and left on for a year.</p>
<h2>Cost as a first-class signal</h2>
<p>Token spend is the metric people notice last and care about most. Because an agent loop re-sends context each iteration, cost grows with the square of a long session rather than linearly, and the growth is invisible until it is billed.</p>
<p>Surfacing tokens and cost per turn — as Arble's status view does — turns an abstract concern into an observable one. It also makes the value of compaction and prompt caching legible, which is otherwise a claim the user has to take on faith.</p>`
},
"32":{
part:"Production",
title:"Scaling",
prev:{num:"31",title:"Observability"},
next:{num:"33",title:"Ambient Computing"},
content:`<h2>Scaling the agent system</h2>
<p>Scaling an AI operating system is different from scaling a web service. The constraints are not about handling more concurrent users — they are about handling more concurrent agents, more tools, more memory entries, and more complex sessions on a single device.</p>
<p>Arble scales across three axes:</p>
<ul>
<li><strong>Agents.</strong> More agents running simultaneously, each with its own session and tool registry.</li>
<li><strong>Tools.</strong> More tools in the registry, more toolsets loaded per agent, more complex tool schemas.</li>
<li><strong>Memory.</strong> More memory entries, longer retention, more frequent search operations.</li>
</ul>
<h2>Agent scaling</h2>
<p>The coordinator manages multiple agents within the device's resource limits. Each agent consumes memory for its session context, tool registry, and model state. When resources are constrained, the coordinator:</p>
<ul>
<li><strong>Prioritises.</strong> Interactive agents (those the user is actively chatting with) get priority over background agents.</li>
<li><strong>Suspends.</strong> Idle agents are suspended and their session state is persisted. They are resumed on the next user message or scheduled trigger.</li>
<li><strong>Terminates.</strong> Agents that have been idle beyond the timeout are terminated. The user can restart them later from the session history.</li>
</ul>
<p>The coordinator also enforces per-agent resource quotas: maximum tool calls per session, maximum token consumption per day, maximum execution time per turn. These quotas prevent a runaway agent from consuming resources that other agents need.</p>
<h2>Tool registry scaling</h2>
<p>With 500+ tools across 56 toolsets, loading every tool schema into every agent's context is impractical. The tool registry uses lazy loading:</p>
<ul>
<li><strong>Toolset activation.</strong> Only the toolsets assigned to the current agent are loaded. A research agent does not carry the smart home toolset.</li>
<li><strong>Schema injection.</strong> Tool schemas are injected into the model context only when needed. The router decides which tools the model is likely to need for the current request and injects only those schemas.</li>
<li><strong>Tool discovery.</strong> If the agent attempts to use a tool that is not in the current context, the system injects its schema on demand. The model sees the new tool in the next turn.</li>
</ul>
<p>This approach keeps the effective context window much larger than the model's raw token limit, because irrelevant tool schemas are not consuming space.</p>
<h2>Memory scaling</h2>
<p>The memory store grows with use. A user who has been running Arble for a year may have tens of thousands of memory entries. The memory manager scales through:</p>
<ul>
<li><strong>Indexing.</strong> Memory entries are indexed by embedding and by FTS5. Search is O(log n) rather than O(n).</li>
<li><strong>Compaction.</strong> Old, low-importance entries are periodically compacted into summarised form. The original entry is deleted, but a summary and its key facts are preserved.</li>
<li><strong>Archival.</strong> Entries older than the retention period are archived to a compressed store. They are still searchable but take less space.</li>
<li><strong>Export.</strong> Users can export their memory store as JSON for backup or migration.</li>
</ul>
<h2>Scaling one user, not many</h2>
<p>For a device-local system, scale means something different from the usual. There are no concurrent users to shard and no fleet to autoscale. The things that grow are one person's history, one person's tool count, and the length of one person's sessions.</p>
<p>Each degrades differently. History growth is a storage and search problem. Tool growth is a context and selection problem. Session length is a token and latency problem. None of them is solved by adding servers, which is the usual answer and the wrong one here.</p>
<h2>History</h2>
<p>Sessions and memory accumulate indefinitely. SQLite with FTS5 handles a great deal more than a personal corpus will ever reach, so the practical limits are on the phone rather than in the database: index size on disk, and query latency when a search returns thousands of matches.</p>
<p>Returning snippets rather than documents keeps retrieval cheap on both counts. The failure to avoid is a search that technically works but pulls a thousand results the model then has to read.</p>
<h2>Tools</h2>
<p>The registry is the constraint people hit first, because every exposed tool costs context on every request and adds a chance of wrong selection. Eighty tools listed in full would consume a serious share of the window before the conversation starts.</p>
<p>Progressive disclosure is the structural answer — expose a search over the registry past a threshold rather than the whole list. It converts a linear cost in the number of tools into a roughly constant one, which is what allows the catalogue to keep growing without every addition making the system slightly worse.</p>
<h2>Sessions</h2>
<p>The compaction pipeline is what keeps long conversations viable, and its layered design is a scaling decision. Cheap lossless reclamation runs first and expensive lossy summarisation last, so most sessions never pay for a summarisation call at all.</p>
<p>The honest limit is that no amount of compaction makes an arbitrarily long session as good as a fresh one. Summarisation loses detail, and a session that has been compacted five times is working from a lossy record of itself. The right advice at that point is not a better algorithm — it is to start a new session, which is free and loses nothing that mattered.</p>`
},
"33":{
part:"Future",
title:"Ambient Computing",
prev:{num:"32",title:"Scaling"},
next:{num:"34",title:"AI Operating Systems"},
content:`<h2>What ambient computing means</h2>
<p>Ambient computing is the idea that computation should fade into the background — that the technology should be present when needed and invisible when not, rather than demanding attention through screens, notifications, and interfaces designed to maximise engagement.</p>
<p>AI operating systems are the enabler of ambient computing. A traditional app requires the user to open it, navigate to the right screen, and perform an action. An AI agent can act on behalf of the user without requiring screen time — it reads the email, drafts the reply, presents it for approval, and moves on. The user's attention is only requested when a decision is needed.</p>
<h2>Arble and ambient computing</h2>
<p>Several features of Arble point toward an ambient computing future:</p>
<ul>
<li><strong>Background agents.</strong> Agents that run on schedules or triggers, acting without the user watching. The daily digest, the email triage, the research monitor — they work while the phone is in the pocket.</li>
<li><strong>Notifications as input.</strong> Permission requests arrive as interactive notifications. The user approves or denies without opening the app.</li>
<li><strong>Live Activities.</strong> The Dynamic Island and Lock Screen show agent status at a glance. The user knows what the agent is doing without opening the app.</li>
<li><strong>Voice interaction.</strong> Speak a request, hear the response. No screen needed for simple tasks.</li>
</ul>
<p>The goal is not to eliminate screens but to reduce the number of times the user must look at one to accomplish routine tasks.</p>
<h2>The ambient loop</h2>
<p>The agent loop itself is an ambient computing pattern. The user states a goal and the agent works through it autonomously, requesting input only when it reaches a decision point it cannot resolve on its own. The more the user trusts the agent, the fewer interruptions occur, and the more the agent fades into the background.</p>
<p>Over time, the agent learns patterns — when the user typically approves certain actions, which tools the user prefers for specific tasks, what information the user considers sensitive. This learning reduces interruptions further without reducing safety, because the agent's confidence threshold for asking permission rises as its understanding of the user's preferences improves.</p>
<h2>The road ahead</h2>
<p>Ambient computing is not a feature that can be shipped in a single release. It is a direction — a commitment to reducing friction, minimising interruptions, and respecting the user's attention. Each release of Arble moves further in this direction: better prediction of when to ask, faster execution of routine tasks, smarter scheduling of background work, and more natural interfaces for giving instructions and reviewing results.</p>
<h2>What ambient computing would require</h2>
<p>This chapter is speculative, and the speculation is worth separating from what exists today. Ambient computing describes systems that act on context without being summoned — noticing a condition and doing something about it rather than waiting for an instruction.</p>
<p>Three capabilities would have to be real for this to work rather than annoy: sensing enough context to know when something is worth acting on, judging correctly whether it is, and acting without needing confirmation for each step. The second is the hard one, and it is the one nobody has solved.</p>
<h2>Why interruption is the whole problem</h2>
<p>A system that acts on its own is a system that interrupts. Every notification costs attention, and a system that is wrong even a modest fraction of the time gets muted — after which its useful interruptions are lost with the rest.</p>
<p>The bar is therefore much higher than it appears. An assistant that is right eighty percent of the time is impressive as a benchmark and intolerable as a presence, because one wrong interruption in five is enough to make someone stop trusting all of them. Restraint, not capability, is the binding constraint.</p>
<h2>What already points this way</h2>
<p>Some of the machinery exists in ordinary form. Scheduled tasks, reminders that fire on time, background runs that produce a digest, heartbeats that check state periodically — these are ambient in the weak sense that they happen without being asked each time.</p>
<p>The distance between that and the strong version is judgement. A reminder fires because you set it. An ambient system would decide for itself that now is the moment. Everything between those two is unsolved.</p>
<h2>Why the local case is stronger here</h2>
<p>If a system is going to observe enough context to act unprompted, where that observation is processed stops being a preference and becomes the whole question.</p>
<p>Continuous ambient sensing routed through remote infrastructure is a live feed of someone's life to a third party — which is a different product from an assistant, whatever it is called. The same capability with the sensing and the judgement on the device is defensible in a way the remote version is not. If ambient computing arrives, this is the fork in the road it arrives at, and it will be decided by architecture rather than by policy.</p>`
},
"34":{
part:"Future",
title:"AI Operating Systems",
prev:{num:"33",title:"Ambient Computing"},
next:{num:"35",title:"Personal Intelligence"},
content:`<h2>Beyond chat interfaces</h2>
<p>The current generation of AI assistants is defined by the chat interface. Users type messages into a text box and receive text responses. This is natural and accessible, but it is also limiting — it reduces the AI operating system to a conversation, when the real value is in the actions the system takes on the user's behalf.</p>
<p>The next generation of AI operating systems will move beyond chat. The primary interface will be intent — the user states what they want to achieve, and the system works out how to do it. The chat interface becomes one of many input methods, not the only one. Voice, gestures, scheduled triggers, and event-driven invocations become equally valid ways to start work.</p>
<h2>The operating system analogy</h2>
<p>The analogy to traditional operating systems is instructive. Early computers used command-line interfaces: the user typed commands and the computer executed them. Then came graphical interfaces: the user pointed and clicked. Then came mobile interfaces: the user touched and swiped. Each generation made the computer accessible to more people and capable of more tasks.</p>
<p>AI operating systems represent the next generation. Instead of the user specifying <em>how</em> to accomplish a goal (click here, type there, run this command), they specify <em>what</em> they want accomplished — and the system figures out the how. This is the shift from procedural to declarative interaction.</p>
<h2>What changes</h2>
<p>When AI operating systems become the norm, several things change about how we interact with technology:</p>
<ul>
<li><strong>Apps become toolsets.</strong> Instead of opening separate apps for email, calendar, and documents, the user has one agent that can interact with all of them. The app boundaries become invisible.</li>
<li><strong>Permissions become granular.</strong> Instead of an app asking for "access to your email" on install, an agent asks for permission to "read your latest email from Priya about the budget" — a single message, not a blanket grant.</li>
<li><strong>Memory becomes cross-app.</strong> A fact stored in one context (a meeting note) is available in another context (an email draft) without the user copying and pasting.</li>
<li><strong>Configuration becomes conversational.</strong> Instead of navigating settings screens, the user tells the agent what they want and the agent makes it happen.</li>
</ul>
<h2>Arble's place</h2>
<p>Arble is designed for this future. The agent loop, the permission gate, the memory store, and the model router are not chat interface features — they are operating system primitives. They work the same way whether the user interacts through chat, voice, schedule, or trigger. The chat interface is the first interface, not the only interface.</p>
<p>The architecture is already there. The next steps are about expanding the input methods, improving the agent's ability to infer intent from minimal input, and deepening the integration with the user's digital life.</p>
<h2>The pattern in previous platform shifts</h2>
<p>This chapter is an argument, not a prediction. The argument runs by analogy, and analogies are cheap, so treat it accordingly.</p>
<p>Earlier platform transitions followed a shape: a capability arrives, applications appear that each solve one problem with it, then a layer emerges that generalises what those applications had to build separately — and once that layer exists, building on it is so much cheaper that building without it stops making sense. Operating systems did this for hardware. Browsers did it for documents and then for applications.</p>
<h2>Where AI sits in that shape</h2>
<p>By the analogy, the current moment is the middle stage. There are many applications that each wire a model to a use case, each solving tool access, permissions, memory and provider management on their own.</p>
<p>The convergence this book describes — the four parts recurring in every serious system — is what the emergence of a layer looks like from inside it. That is genuinely what one would expect if a substrate were forming. It is also what one would expect if a set of independent teams simply hit the same four walls and it goes no further than that. Both readings fit the evidence.</p>
<h2>What is genuinely uncertain</h2>
<p>Several questions have no settled answer, and anyone claiming otherwise is guessing:</p>
<ul>
<li><strong>Where the layer lives.</strong> In the device operating system, in a cross-platform runtime, or inside each application.</li>
<li><strong>Whether it is open.</strong> A substrate controlled by one vendor is a very different world from an interoperable one, and both are live possibilities.</li>
<li><strong>Whether models absorb it.</strong> If models become reliable enough at tool use and long-horizon consistency, some of the scaffolding described here becomes unnecessary rather than standard.</li>
</ul>
<p>The third is the one that would most invalidate this book, and it is not a remote possibility.</p>
<h2>The part that is not speculative</h2>
<p>Independent of how the platform question resolves, one thing follows from the structure rather than from any forecast: whoever controls the layer controls the defaults — which models are reachable, what data flows where, what requires permission.</p>
<p>That is why architecture is worth arguing about now rather than after it settles. Defaults set at the substrate are extremely durable, and they are much easier to influence while the shape is still being decided than afterwards.</p>`
},
"35":{
part:"Future",
title:"Personal Intelligence",
prev:{num:"34",title:"AI Operating Systems"},
next:{num:"glossary",title:"Glossary"},
content:`<h2>What personal intelligence means</h2>
<p>Personal intelligence is the cumulative capability that an AI system develops as it learns from a specific individual — their preferences, their habits, their knowledge, their way of working. It is not general intelligence. It is a tailored, contextual intelligence that becomes more useful the longer it operates.</p>
<p>This is distinct from a general-purpose model that answers questions. A general model knows that "schedule a meeting" means booking time on a calendar. A personal intelligence system knows that for <em>this</em> user, "schedule a meeting" means checking Priya's availability, finding a slot that suits both schedules, avoiding Wednesday afternoons (the user's deep-work block), and prefilling the agenda from the email thread that prompted the request.</p>
<h2>How personal intelligence builds</h2>
<p>Personal intelligence emerges from three sources:</p>
<ul>
<li><strong>Direct instruction.</strong> The user tells the agent their preferences — "always use my work email for calendar notifications," "prefer Tuesday mornings for interviews." These are stored as explicit rules in the permission and configuration system.</li>
<li><strong>Observed behaviour.</strong> The agent notices patterns in the user's approvals and denials. If the user consistently approves email drafts addressed to their team but reviews drafts addressed to external contacts carefully, the agent learns to auto-approve team drafts and flag external ones.</li>
<li><strong>Memory accumulation.</strong> Every fact stored in the memory system enriches the agent's understanding of the user's world — who they work with, what projects they care about, what tools they prefer for different tasks.</li>
</ul>
<p>This accumulation is gradual. The agent on day one is generic and useful. The agent on day thirty has learned the user's rhythms and is significantly more effective. The agent on day three hundred operates with a depth of context that no general model could match.</p>
<h2>The virtuous cycle</h2>
<p>Personal intelligence creates a virtuous cycle: the more the user uses the agent, the better it understands them; the better it understands them, the more useful it becomes; the more useful it becomes, the more the user relies on it. This is not a data extraction loop — the user's data never leaves their device. The improvement comes entirely from on-device learning and memory accumulation.</p>
<p>The cycle depends on trust. The user must trust that the agent will not misuse the information it has accumulated, and that the agent's increasing autonomy is justified by its track record. The permission gate and audit log are the mechanisms that build and maintain this trust over time.</p>
<h2>The end state</h2>
<p>Personal intelligence is the goal of the AI operating system. Not a smarter model — a system that knows the user well enough to act on their behalf with minimal instruction, minimal supervision, and maximal reliability. A system that has earned enough trust to operate autonomously in the user's interest, because it has demonstrated, over hundreds or thousands of interactions, that it understands what the user wants and respects the boundaries the user has set.</p>
<p>This is what Arble is built for. Not to be another chat assistant, but to be the foundation of a personal intelligence that grows with the user over years.</p>
<h2>What personal actually means</h2>
<p>The word does a lot of unexamined work. It can mean personalised — a general system tuned to you from your data. It can mean private — a system whose data about you stays with you. It can mean owned — a system you control, can inspect, and can take elsewhere.</p>
<p>These come apart. A cloud assistant that has learned everything about you is deeply personalised, not remotely private, and not owned in any meaningful sense. A local model that knows nothing about you is private and owned and not personalised at all. The version worth wanting is all three, and only the architecture decides whether that is achievable.</p>
<h2>Accumulation as the real asset</h2>
<p>What makes a system feel personal is not the model. It is everything around it that has accumulated: who your people are, what your projects are, what you have decided and why, how you prefer things done.</p>
<p>That corpus takes months to build and is worth more than any individual model. Which raises the question people notice too late: if it lives in a vendor's database, you cannot take it with you, and switching costs are no longer about features. A memory layer that is Markdown files and a SQLite database on your device is portable by construction — not as a promise, but because there is nothing to withhold.</p>
<h2>The failure modes of personalisation</h2>
<p>Personalisation is not automatically good, and three failures are common enough to plan for.</p>
<p>It calcifies: a system that has learned your preferences keeps applying them after you have changed, and confidently. It narrows: a system optimising for what you have liked stops showing you what you have not seen. And it misreads: a wrong inference, held with the same confidence as a right one, quietly distorts everything downstream.</p>
<p>All three argue for the same properties — memory you can read, correct and delete, and freshness that decays rather than accumulating indefinitely. A personal system without an edit button is a system that will eventually be wrong about you forever.</p>
<h2>Where this leaves the reader</h2>
<p>The thread running through this book is that the interesting questions about AI systems are structural rather than about model capability. Which model is answering will change several times over the next few years. Where the loop runs, who holds the keys, what requires approval, and whether the accumulated context is yours — these are decided once, by architecture, and they are hard to change afterwards.</p>
<p>That is the case Arble makes, and it is a case rather than a fact. It is worth evaluating on the evidence, including the parts of it that are still promises.</p>`
},
"glossary":{
part:"Reference",
title:"Glossary",
prev:{num:"35",title:"Personal Intelligence"},
content:`<h2>Terms and definitions</h2>
<dl class="pbp__glossary">
<dt>Agent</dt><dd>An autonomous system that uses a language model to make decisions, call tools, and persist state across multiple turns. Runs in a loop: observe, think, act, repeat.</dd>
<dt>Agent loop</dt><dd>The core execution cycle: receive input, process with a model, execute tool calls, observe results, and repeat until the goal is achieved.</dd>
<dt>Attention</dt><dd>A mechanism in transformer models that lets each token weigh the importance of every other token in the sequence. The reason transformers can handle long-range dependencies.</dd>
<dt>Chain-of-thought</dt><dd>A prompting technique where the model is asked to show its reasoning step by step before producing a final answer, improving accuracy on multi-step problems.</dd>
<dt>Compactor</dt><dd>The component that manages the model's context window by pruning low-signal turns and summarising blocks of conversation to stay within token limits.</dd>
<dt>Context window</dt><dd>The maximum number of tokens a model can process in a single request. All conversation history, tool schemas, and system prompts must fit within this window.</dd>
<dt>Coordinator</dt><dd>The system service that manages multiple agents — creation, scheduling, lifecycle, inter-agent communication, and resource enforcement.</dd>
<dt>Episodic memory</dt><dd>The conversation history within a single session. Managed by the session manager and compactor. Does not persist after the session ends.</dd>
<dt>FTS5</dt><dd>SQLite's full-text search engine, used by Arble for searching memory entries and session history.</dd>
<dt>Hybrid execution</dt><dd>Routing different sub-tasks within a single request to different models — some local, some cloud — based on each sub-task's requirements.</dd>
<dt>Inference</dt><dd>Running a trained language model on input to produce output. Distinct from training, which adjusts the model's weights.</dd>
<dt>KV cache</dt><dd>Keys and Values from previous tokens cached during autoregressive generation, so they do not need to be recomputed for each new token.</dd>
<dt>mDNS</dt><dd>Multicast DNS — a protocol for service discovery on local networks. Used by Arble for discovering paired desktop agents.</dd>
<dt>MCP</dt><dd>Model Context Protocol — a protocol for exposing tools and resources to AI agents. Arble's desktop agent exposes its capabilities as MCP tools.</dd>
<dt>Memory (semantic)</dt><dd>Facts, preferences, and knowledge extracted from conversations and stored for cross-session retrieval. Persists in a vector database.</dd>
<dt>Memory (procedural)</dt><dd>Skills and workflows — reusable procedures the agent can load and execute. Stored as structured JSON with steps, parameters, and conditions.</dd>
<dt>MMKV</dt><dd>A fast key-value storage library used by Arble for configuration, cached data, and session metadata.</dd>
<dt>Model router</dt><dd>The component that selects which model endpoint to use for each request, based on task type, cost, latency, privacy, and availability.</dd>
<dt>Ollama</dt><dd>A popular local model runner. Arble supports Ollama as a local inference backend on desktop platforms.</dd>
<dt>Permission gate</dt><dd>The security component that evaluates every tool call against the user's rules and decides whether to auto-approve, ask, or block.</dd>
<dt>Quantisation</dt><dd>Reducing the precision of model weights (e.g., from 16-bit to 4-bit) to reduce memory usage and improve inference speed, with a trade-off in output quality.</dd>
<dt>QueryEngine</dt><dd>Arble's core orchestrator that runs the agent loop — manages session state, invokes the model, routes tool calls, and handles errors.</dd>
<dt>Session</dt><dd>A single conversation with an agent. Contains a sequence of turns with user messages, model responses, tool calls, and tool results.</dd>
<dt>Skill</dt><dd>A reusable multi-step workflow encoded as structured JSON. Combines tool calls, parameter bindings, conditions, and error handling.</dd>
<dt>Token</dt><dd>The atomic unit of text that a language model processes. Approximately 4 characters in English. Models have fixed vocabularies of 32K–128K tokens.</dd>
<dt>Tool</dt><dd>A single atomic operation the agent can perform — send an email, search the web, read a file. Declared with a typed schema.</dd>
<dt>Tool registry</dt><dd>The catalog of all available tools, organised into toolsets. Each tool has a name, description, parameter schema, and implementation.</dd>
<dt>Toolset</dt><dd>A coherent group of related tools (communication, files, search, smart home). Toolsets can be enabled or disabled per agent.</dd>
<dt>Transformer</dt><dd>The neural network architecture that underlies modern language models. Uses self-attention to process all tokens in parallel.</dd>
<dt>Turn</dt><dd>A single exchange in a session. Contains a role (user, assistant, tool, system), content, and metadata (tokens, timestamp, model).</dd>
<dt>Compaction</dt><dd>The staged process of reducing a conversation to fit the context window. Arble runs six layers, from dropping redundant progress messages to model-generated summarisation as a last resort.</dd>
<dt>Context window</dt><dd>The maximum number of tokens a model can process in one request, shared between the system prompt, tool definitions, conversation history, retrieved memory and the space reserved for the answer.</dd>
<dt>Decode</dt><dd>The generation phase of inference, producing one token at a time, each pass depending on the last. Cannot be parallelised within a request, so it dominates total response time.</dd>
<dt>Episodic memory</dt><dd>Diary-style entries stored as dated Markdown files and indexed for full-text search. Distinct from session history, which records conversations rather than facts.</dd>
<dt>Fallback chain</dt><dd>The ordered list of providers a router tries when the primary is rate-limited, timing out or unavailable.</dd>
<dt>FTS5</dt><dd>SQLite's full-text search extension, used to index memory and session content so retrieval can return matching snippets rather than whole documents.</dd>
<dt>Idempotent</dt><dd>An operation that produces the same result whether it runs once or several times. Important for remote write calls, where a timeout leaves it unclear whether the first attempt succeeded.</dd>
<dt>Least privilege</dt><dd>Granting each component only the capabilities its task requires. Applied to subagents, background runs and integrations, it removes whole classes of failure rather than relying on a check to catch them.</dd>
<dt>MCP</dt><dd>Model Context Protocol. A JSON-RPC based protocol for connecting an agent to remote tool servers, used in Arble for desktop pairing over the local network.</dd>
<dt>mDNS</dt><dd>Multicast DNS, the mechanism by which a desktop agent advertises itself on the local network so the app can discover it without any account or relay.</dd>
<dt>Permission gate</dt><dd>The check every tool call passes before executing. The structural defence against both mistaken and injected actions, because it does not depend on the model behaving correctly.</dd>
<dt>Prefill</dt><dd>The phase of inference that processes the input prompt. Parallel across tokens and therefore fast, which is why time-to-first-token is usually short even for long prompts.</dd>
<dt>Progressive disclosure</dt><dd>Exposing a search over the tool registry instead of the full list once the registry grows past a threshold, so context cost stays roughly constant as tools are added.</dd>
<dt>Prompt caching</dt><dd>Provider-side reuse of an unchanged prompt prefix across calls. On an agent loop, where each iteration re-sends the same system prompt and tool definitions, this is the single largest cost saving available.</dd>
<dt>Prompt injection</dt><dd>An attack in which untrusted content the agent reads contains instructions addressed to the agent. Has no reliable prompt-level fix, which is why the permission gate is the real defence.</dd>
<dt>Reasoning trace</dt><dd>Intermediate tokens a model generates before answering. Improves accuracy on multi-step problems, but is generated text rather than a faithful log of the computation, so it is evidence and not proof.</dd>
<dt>Router</dt><dd>The component that selects which model answers a request, trading quality, cost, latency, privacy and availability against each other.</dd>
<dt>Routing tier</dt><dd>The classification a request is assigned before routing. Arble uses simple, complex, vision, creative and offline.</dd>
<dt>SecureStore</dt><dd>The encrypted device keystore holding API keys and OAuth tokens. What makes the claim that keys stay on the device architectural rather than a policy statement.</dd>
<dt>Subagent</dt><dd>A worker agent spawned by a coordinator, running in its own isolated engine with its own context and a restricted subset of tools.</dd>
<dt>Time-to-first-token</dt><dd>How long before output starts appearing. Governed mostly by prefill, and the number that determines whether a system feels responsive.</dd>
<dt>Tool registry</dt><dd>The declared set of typed tools available to the agent, with names, descriptions and schemas. Descriptions carry unusual weight, as they are the entire basis for tool selection.</dd>
</dl>`
}
};
