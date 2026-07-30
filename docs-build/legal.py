#!/usr/bin/env python3
"""Render the Arble legal documentation into legal/<slug>/index.html.

Five pages — privacy, terms, security, trust, cookies — built from one shell so
they share a sidebar, a breadcrumb, prev/next, and the documentation's type and
spacing. They are documentation pages that happen to be legally operative, not a
separate boilerplate area, which is why they live in the same application chrome
as everything under docs/.

    python3 docs-build/legal.py

WHAT IS DELIBERATELY MISSING

Nothing here invents a fact about the organisation. Every place that needs a
company detail, a jurisdiction, a retention period, a subprocessor or a
certification carries [Organization-specific information required] instead of a
plausible guess. No certification is claimed. Fill those in with counsel before
publishing: a privacy policy is an operative legal document, and a wrong
sentence in it is worse than a missing one.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "legal")
CSS_V = "86"
UPDATED = "30 July 2026"
TBD = '<span class="lg__tbd">[Organization-specific information required]</span>'


def fig(label):
    """Figure placeholder. Rendered, not described in prose, so an unfilled slot
    is visible on the page rather than buried in the source."""
    return (f'<figure class="docs__shot"><div class="ph16" role="img" '
            f'aria-label="Figure placeholder: {label}"></div>'
            f'<figcaption class="docs__cap">[Figure Placeholder &#8212; {label}]'
            f'</figcaption></figure>')


def note(body, kind=""):
    k = f" docs__note--{kind}" if kind else ""
    return f'<div class="docs__note{k}"><p>{body}</p></div>'


def faq(items):
    rows = "".join(
        f'<details class="docs__item"><summary>{q}</summary><p>{a}</p></details>'
        for q, a in items)
    return f'<div class="docs__acc">{rows}</div>'


def table(headers, rows):
    head = "".join(f'<th scope="col">{h}</th>' for h in headers)
    body = "".join(
        "<tr>" + f'<th scope="row">{r[0]}</th>' +
        "".join(f"<td>{c}</td>" for c in r[1:]) + "</tr>" for r in rows)
    return (f'<div class="docs__tablewrap"><table class="docs__table">'
            f"<thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>")


# ── page content ─────────────────────────────────────────────────────────────

PRIVACY = f"""
<p class="docs__lead">What Arble collects, why it collects it, where it is kept, and
what you can do about it.</p>

<p>Arble runs the agent loop on your device. That is an architectural decision before it
is a privacy one, and it determines most of this page: the data that never leaves the
device cannot be collected, disclosed or breached at our end, because we do not have
it.</p>

{note("This page describes how Arble handles personal data. It is written to be read. "
      "Where a legal term carries a specific meaning, it is defined at first use.")}

<h2 id="philosophy">Privacy philosophy</h2>

<p>Three rules decide the rest.</p>

<ul>
  <li><strong>Local by default.</strong> Sessions, memory, credentials and tool
    results are stored on your device. Cloud synchronisation is opt-in, per domain.</li>
  <li><strong>Collect for a reason.</strong> Data is collected to make a feature work,
    not because it might be useful later.</li>
  <li><strong>No surprise recipients.</strong> When data leaves the device, the
    interface says where it is going before it goes.</li>
</ul>

{fig("Local vs Cloud Processing")}

<h2 id="collect">What we collect</h2>

<p>Categories below are grouped by where the data lives, because that is what determines
who can reach it.</p>

<h3>On your device only</h3>

{table(["Data", "Contains", "Leaves the device"],
       [("Sessions", "Messages, tool calls and results", "Only if cloud sync is enabled"),
        ("Memory", "Notes, facts and conversation history you keep", "Only if cloud sync is enabled"),
        ("Credentials", "API keys and OAuth tokens for services you connect",
         "Never to us. Sent only to the service they authenticate"),
        ("Automation logs", "Heartbeat wake-ups and what each run did", "No"),
        ("Skills", "Installed skill definitions", "No")])}

<h3>Data you provide</h3>

<ul>
  <li><strong>Account data.</strong> Email address and authentication identifiers, if
    you create an account. Self-hosted deployments may have no account at all.</li>
  <li><strong>Billing data.</strong> Handled by our payment processor. We receive
    confirmation and the last four digits of a card, never the full number. See
    <a href="#subprocessors">subprocessors</a>.</li>
  <li><strong>Support correspondence.</strong> What you send us when you ask for help,
    including any logs you choose to attach.</li>
</ul>

<h3>Data collected automatically</h3>

{table(["Type", "Purpose", "Default"],
       [("Device information", "Platform, OS version, app version &#8212; to serve the right update and reproduce bugs", "On"),
        ("Crash reports", "Stack trace and app state at the moment of a crash", "Opt-in"),
        ("Usage analytics", "Which features are used, as counts. Never message content", "Opt-in"),
        ("Telemetry", "Latency and error rates for our own services", "On for hosted; off for self-hosted"),
        ("Desktop agent data", "Pairing identifier, platform and version of a paired machine", "On while paired")])}

{note("Crash reports and usage analytics are off until you turn them on. Neither ever "
      "contains message content, memory contents, file contents or credentials.", "ok")}

<h3>Data from services you connect</h3>

<p>Connecting a service authorises Arble to read and write on your behalf, within the
scopes you grant. That data flows between your device and the service. Where cloud sync
is enabled, results the agent stores in memory sync with the rest of your memory.</p>

<ul>
  <li><strong>Connected services.</strong> Mail, calendars, files, code hosts, task
    trackers and home devices you link. See <a href="../../docs/agent/permissions/">Permissions</a>.</li>
  <li><strong>MCP servers.</strong> Third-party tool servers you add. Metadata &#8212;
    server name, URL and its tool list &#8212; is stored so the registry can be rebuilt.
    Call arguments are sent to that server. See <a href="../../docs/developers/mcp-servers/">MCP Servers</a>.</li>
  <li><strong>AI providers.</strong> The provider you configure receives the
    conversation needed to answer, including tool definitions and results. You choose
    the provider, and you supply the key.</li>
</ul>

{note("An MCP server is operated by whoever published it, not by Arble. When a tool on "
      "that server runs, your message text, attached context and generated arguments go "
      "to their URL under their privacy policy. Arble shows this before the first call "
      "and cannot control what happens afterwards.", "warn")}

{fig("Data Lifecycle")}

<h2 id="use">How information is used</h2>

{table(["Purpose", "Data used", "Legal basis (GDPR)"],
       [("Provide the service", "Account, session and sync data", "Performance of a contract"),
        ("Keep it secure", "Device information, telemetry, audit logs", "Legitimate interests"),
        ("Fix defects", "Crash reports, diagnostics you send", "Legitimate interests, or consent where opted in"),
        ("Improve features", "Usage analytics, where enabled", "Consent"),
        ("Bill you", "Account and payment confirmation", "Performance of a contract"),
        ("Meet legal obligations", "Records we are required to keep", "Legal obligation")])}

<p><strong>We do not sell personal data, and we do not train models on your content.</strong>
Content you send to a third-party AI provider is governed by that provider's terms; check
whether they train on inputs, because that is their decision and not ours.</p>

<h2 id="retention">Retention</h2>

{table(["Data", "Kept for"],
       [("On-device data", "Until you delete it. Uninstalling removes it with the app"),
        ("Synced data", "Until deleted, then purged from backups within " + TBD),
        ("Account records", "Duration of the account, then " + TBD),
        ("Crash reports", TBD),
        ("Audit and security logs", TBD),
        ("Billing records", "As required by tax and accounting law in " + TBD)])}

<h2 id="security">Security</h2>

<p>Credentials are held in the platform keystore &#8212; Keychain on Apple platforms,
Keystore on Android, the OS credential store on desktop. Memory is encrypted at rest with
project-scoped keys. Traffic uses TLS. Paired devices exchange a key at pairing, so a
relay carries ciphertext it cannot read.</p>

<p>The full technical description is in <a href="../security/">Security</a>.</p>

<h2 id="transfers">International transfers</h2>

<p>Where data is processed depends on how you run Arble. Self-hosted deployments transfer
nothing to us. For hosted services, processing locations and the transfer mechanism used
are listed under {TBD}.</p>

<h2 id="rights">Your rights</h2>

<p>Depending on where you live, you have some or all of the following. We apply them to
everyone rather than tracking who is entitled to what.</p>

{table(["Right", "What it means", "How"],
       [("Access", "A copy of what we hold", "Export from the app, or ask us"),
        ("Portability", "That copy in a portable format", "Session and memory export produce JSON"),
        ("Rectification", "Correct what is wrong", "Edit in the app, or ask us"),
        ("Erasure", "Delete it", "Delete in the app; account deletion removes the rest"),
        ("Restriction", "Pause processing while a dispute is resolved", "Ask us"),
        ("Objection", "Object to processing based on legitimate interests", "Ask us"),
        ("Withdraw consent", "Turn off anything you opted into", "Settings, at any time")])}

<p><strong>California residents.</strong> The CCPA rights to know, delete, correct and opt
out of sale apply. We do not sell or share personal information as those terms are defined,
so there is nothing to opt out of. Exercising a right will not degrade your service.</p>

<h3>Deleting your data</h3>

<ul>
  <li><strong>On device.</strong> Delete a session or memory entry in the app, or
    uninstall to remove everything local.</li>
  <li><strong>Synced.</strong> Deleting on one device propagates to the others on next
    sync.</li>
  <li><strong>Account.</strong> Account deletion removes account records and synced data.
    Backups age out on the schedule above.</li>
</ul>

<h2 id="children">Children</h2>

<p>Arble is not directed to children under {TBD}, and we do not knowingly collect their
personal data. If you believe a child has provided data, contact us and we will delete
it.</p>

<h2 id="business">Business customers</h2>

<p>Where you use Arble to process personal data of your own users, you are the controller
and we are the processor. A data processing addendum is available at {TBD}. Subprocessors
are listed in the <a href="../trust/#subprocessors">Trust Center</a>.</p>

<h2 id="cookies-x">Cookies</h2>

<p>The website and hosted console use a small number of cookies. The application itself
does not. See the <a href="../cookies/">Cookie Policy</a>.</p>

<h2 id="changes">Changes</h2>

<p>Material changes are announced before they take effect, with the date on this page
updated and the previous version kept available. Continuing to use Arble after a change
takes effect means you accept it.</p>

<h2 id="contact">Contact</h2>

<p>Privacy enquiries and rights requests: {TBD}. Data controller and, where required, the
representative or Data Protection Officer: {TBD}.</p>
"""

PRIVACY_FAQ = [
    ("Do my conversations leave my device?",
     "Only to the AI provider you configure, which needs the conversation to answer, and "
     "only to us if you enable cloud sync. Neither happens silently."),
    ("Do you train models on my data?",
     "No. Whether your AI provider does is their policy, not ours &#8212; check their "
     "terms before sending them anything sensitive."),
    ("What does a self-hosted deployment send you?",
     "Nothing, other than update checks, which can be disabled. See "
     "<a href='../../docs/developers/self-hosting/'>Self-hosting</a>."),
    ("Can you read my API keys?",
     "No. Keys are stored in the platform keystore on your device and sent only to the "
     "service they authenticate."),
    ("What happens to my data when I stop paying?",
     "Local data stays on your device and keeps working. Synced data is retained for " +
     TBD + " so you can export it, then deleted."),
    ("Is memory encrypted?",
     "At rest, with project-scoped keys. A compromised key exposes one project rather "
     "than the whole store."),
    ("Who sees data sent to an MCP server?",
     "Whoever operates that server. Arble names the server and what will be sent before "
     "the first call, and you can remove it at any time."),
    ("How do I export everything?",
     "Session export produces one file per session; memory exports as JSON. Both are "
     "documented in <a href='../../docs/agent/memory/'>Memory</a>."),
    ("Do you respond to law enforcement requests?",
     "We respond to valid legal process for data we actually hold, which for most users "
     "is account records rather than content. Our policy on notifying you is at " + TBD + "."),
    ("How is this page kept honest?",
     "Every claim here describes a mechanism you can verify in the product or the "
     "documentation. Where we do not yet have an answer, the page says so rather than "
     "filling the gap."),
]

TERMS = f"""
<p class="docs__lead">The agreement between you and Arble: what you may do, what we owe
you, and what neither of us is promising.</p>

<p>These terms are written to be understood. Where a clause exists because the law
requires a particular form of words, the plain-English meaning is given alongside it.</p>

<h2 id="acceptance">Acceptance</h2>

<p>Using Arble means accepting these terms. If you are accepting on behalf of an
organisation, you confirm you are authorised to bind it, and "you" means that
organisation.</p>

<h2 id="eligibility">Eligibility</h2>

<p>You must be old enough to form a binding contract where you live, and not barred from
using the service under applicable law or sanctions. See
<a href="#export">export controls</a>.</p>

<h2 id="accounts">Accounts</h2>

<ul>
  <li>Keep your credentials secure. Activity under your account is your responsibility.</li>
  <li>Tell us promptly if you believe your account has been compromised.</li>
  <li>One person or organisation per account, unless a plan says otherwise.</li>
</ul>

<h2 id="subscriptions">Subscriptions and billing</h2>

{table(["Term", "Meaning"],
       [("Billing period", "The interval you are charged for, shown at purchase"),
        ("Renewal", "Automatic at the end of each period, until cancelled"),
        ("Cancellation", "Effective at the end of the current period; access continues until then"),
        ("Refunds", TBD),
        ("Price changes", "Announced before they apply, effective at your next renewal"),
        ("Taxes", "Exclusive of tax unless stated; you are responsible for applicable taxes")])}

<h2 id="software">Desktop software, CLI, SDK and API</h2>

<p>We grant you a non-exclusive, non-transferable, revocable licence to use the Arble
desktop application, CLI, SDKs and API for their intended purpose, subject to these terms.
You may not sublicense, resell or offer them as a competing service.</p>

{table(["Component", "You may", "You may not"],
       [("Desktop application", "Install on machines you control", "Redistribute a modified build as Arble"),
        ("CLI", "Script and automate, including in CI", "Use it to circumvent limits or permissions"),
        ("SDK", "Build and publish tools", "Publish tools that misrepresent what they do"),
        ("API", "Integrate within your rate limits", "Resell raw API access as your own product"),
        ("Self-hosting", "Run on your own infrastructure under the applicable licence", "Remove attribution or licence notices")])}

<p>Details in <a href="../../docs/developers/cli/">CLI</a>,
<a href="../../docs/developers/tool-sdk/">Tool SDK</a>,
<a href="../../docs/developers/api-reference/">API Reference</a> and
<a href="../../docs/developers/self-hosting/">Self-hosting</a>.</p>

<h3 id="oss">Open source components</h3>

<p>Arble includes third-party open source software, each under its own licence. Those
licences govern those components and, where they conflict with these terms for that
component, they win. The component list and licences are published at {TBD}.</p>

<h2 id="acceptable-use">Acceptable use</h2>

<p>Arble executes actions on your systems and on services you connect. The limits below
exist because that capability can be misused.</p>

<p><strong>You may not use Arble to:</strong></p>

<ul>
  <li>Break the law, or help someone else break it.</li>
  <li>Access systems you are not authorised to access, or test systems without
    permission.</li>
  <li>Build or operate malware, spyware, ransomware, or tooling whose purpose is
    unauthorised access.</li>
  <li>Send bulk unsolicited messages, or scrape a service in breach of its terms.</li>
  <li>Generate material that sexualises children, incites violence, or facilitates
    serious harm.</li>
  <li>Impersonate a person or organisation, or generate content presented as genuine
    when it is not.</li>
  <li>Circumvent rate limits, permission prompts or security controls, in Arble or in a
    connected service.</li>
  <li>Process personal data you have no lawful basis to process.</li>
</ul>

{note("Running an agent does not transfer responsibility to the agent. Actions taken "
      "under your account are attributed to you, including actions an automation took "
      "while you were not watching.", "warn")}

<h2 id="responsibilities">Your responsibilities</h2>

<ul>
  <li><strong>Permissions.</strong> You decide what the agent may reach. Granting broad
    permissions, or running in a mode that stops asking, is a decision you own. See
    <a href="../../docs/agent/permissions/">Permissions</a>.</li>
  <li><strong>Credentials.</strong> Keys you configure are yours, as is the spend against
    them.</li>
  <li><strong>Backups.</strong> For self-hosted deployments, backups and their restoration
    are yours.</li>
  <li><strong>Review.</strong> Check output before acting on it where the consequences
    matter.</li>
</ul>

<h2 id="ai-content">AI-generated content</h2>

<p>Arble routes requests to AI models you select. Between us, you own the output you
generate, subject to your provider's terms and to anyone else's rights in the input.</p>

{note("Models produce confident, incorrect output. Nothing generated through Arble is "
      "legal, medical, financial or safety advice, and it should not be relied on "
      "without review.", "warn")}

<h2 id="third-party">Third-party services and MCP servers</h2>

<p>Connected services and MCP servers are operated by others. We do not control them, do
not guarantee their availability, and are not responsible for what they do with data you
send them. Your use of them is governed by their terms. Removing a connection stops
further data flowing, but does not retrieve what has already been sent.</p>

<h2 id="ip">Intellectual property</h2>

<p>We keep all rights in Arble: the software, the documentation, the trademarks and the
design. You keep all rights in your content, your tools and your data. Feedback you send
us may be used without obligation, which keeps bug reports simple.</p>

<h2 id="availability">Availability and updates</h2>

<p>Hosted services are provided as they are, without a service level commitment unless a
separate agreement states one ({TBD}). We may change or discontinue features; where a
change is breaking, it follows the deprecation policy in the
<a href="../../changelog.html#versioning">changelog</a>.</p>

<p>Updates may install automatically to fix security defects. Self-hosted deployments
control their own upgrade timing.</p>

<h2 id="termination">Termination</h2>

<p>You may stop using Arble at any time. We may suspend or terminate an account that
breaches these terms, or where required by law, with notice unless notice would be
unlawful or would worsen an active security problem. On termination, licences end and you
should export what you want to keep &#8212; on-device data remains on your device.</p>

<h2 id="warranty">Warranty disclaimer</h2>

<p>Arble is provided "as is" and "as available", without warranties of any kind, express
or implied, including merchantability, fitness for a particular purpose and
non-infringement. <em>In plain terms: we do not promise it will be error-free,
uninterrupted, or right for your particular use.</em></p>

<h2 id="liability">Limitation of liability</h2>

<p>To the maximum extent the law allows, neither party is liable for indirect,
incidental, special, consequential or punitive damages, or for lost profits, revenue or
data. Our total liability is limited to {TBD}.</p>

<p>Some jurisdictions do not allow these exclusions, in which case they apply only as far
as the law permits, and nothing here limits liability for death or personal injury caused
by negligence, or for fraud.</p>

<h2 id="indemnity">Indemnification</h2>

<p>You will defend and indemnify us against claims arising from your use of Arble in
breach of these terms, your content, or your infringement of someone else's rights. We
will tell you promptly about any such claim and let you control the defence.</p>

<h2 id="export">Export controls and sanctions</h2>

<p>Arble may be subject to export control and sanctions laws. You confirm you are not
located in, or acting on behalf of, a sanctioned jurisdiction or a restricted party, and
you will not export or re-export Arble in breach of those laws.</p>

<h2 id="law">Governing law and disputes</h2>

<p>These terms are governed by the laws of {TBD}, and disputes are resolved in the courts
of {TBD}. Dispute resolution procedure, including any arbitration or class-action
provisions: {TBD}.</p>

<h2 id="changes-t">Changes</h2>

<p>We may update these terms. Material changes are announced before they take effect and
the date on this page changes. Continuing to use Arble after that means you accept the
updated terms.</p>

<h2 id="contact-t">Contact</h2>

<p>Legal notices and questions about these terms: {TBD}.</p>
"""

TERMS_FAQ = [
    ("Can I use Arble commercially?",
     "Yes, within these terms and your plan. Reselling raw API access as your own "
     "product is the line."),
    ("Who owns tools I write with the SDK?",
     "You do. Publishing one to a directory grants the distribution rights needed to "
     "list and serve it, nothing more."),
    ("What happens if an agent does something I did not intend?",
     "Actions under your account are attributed to you. That is why the permission gate "
     "exists, and why modes that stop asking are opt-in."),
    ("Is self-hosting covered by the same terms?",
     "The service terms cover hosted services. Self-hosted deployments are governed by "
     "the applicable software licence plus the acceptable-use limits here."),
    ("Do you offer an SLA?",
     "Not by default. Availability commitments, if any, live in a separate agreement " +
     "&#8212; " + TBD + "."),
    ("What counts as unauthorised access?",
     "Touching a system you do not own or have written permission to test. An agent "
     "doing it on your instruction is still you doing it."),
    ("Can you terminate my account without warning?",
     "Only where notice would be unlawful or would make an active security problem "
     "worse. Otherwise you get notice and a chance to fix the breach."),
    ("What happens to my data if you shut down?",
     "On-device data is unaffected. For hosted data we would give notice and an export "
     "window &#8212; " + TBD + "."),
    ("Are AI outputs mine?",
     "As between you and us, yes, subject to your model provider's terms and any "
     "third-party rights in what you put in."),
    ("Which terms win if a component has its own licence?",
     "For that component, its own licence. Open source licences are not overridden by "
     "these terms."),
]

SECURITY = f"""
<p class="docs__lead">How Arble is built to contain failure: the threat model, the
boundaries, and what we deliberately cannot do.</p>

<p>This is technical documentation, not a marketing page. Where a control is not
implemented yet, it says so.</p>

<h2 id="philosophy-s">Security philosophy</h2>

<ul>
  <li><strong>Reduce what exists to steal.</strong> Data that stays on the device is not
    in our datastore to be breached.</li>
  <li><strong>Every write stops to ask.</strong> The permission gate is the control, not
    a confirmation dialog bolted on afterwards.</li>
  <li><strong>Assume the network is hostile.</strong> Pairing and sync are designed for
    an untrusted path.</li>
  <li><strong>State the gaps.</strong> An honest limitation is worth more than an
    implied guarantee.</li>
</ul>

<h2 id="threat-model">Threat model</h2>

<p>What we design against, and what we do not.</p>

{table(["Threat", "Position"],
       [("Network attacker on a shared network", "In scope. Transport is encrypted; relays carry ciphertext"),
        ("Malicious or compromised MCP server", "In scope. Per-tool permissions, explicit consent, revocable"),
        ("Stolen unlocked device", "Partially. Credentials sit behind the OS keystore; app-level lock is " + TBD),
        ("Compromised AI provider", "In scope for blast radius: providers see conversation content by design, never your stored credentials"),
        ("Malicious tool the user installed deliberately", "Partially. Tools declare capability and are gated, but a tool you approve runs"),
        ("Physical forensic attack on a seized device", "Out of scope. Full-disk encryption is the platform's job"),
        ("Nation-state targeting of an individual", "Out of scope. We do not claim this")])}

{fig("Zero Trust Security Model")}

<h2 id="architecture">Security architecture</h2>

<p>Four boundaries, each with its own trust assumption.</p>

{table(["Boundary", "Crossing it means", "Control"],
       [("Device &#8594; AI provider", "Conversation content leaves", "Provider chosen by you, key supplied by you"),
        ("Device &#8594; connected service", "Scoped data leaves", "OAuth scopes, revocable per service"),
        ("Device &#8594; MCP server", "Tool arguments leave", "Per-tool grants, consent before first call"),
        ("Device &#8592;&#8594; paired device", "Commands and files move", "Key exchanged at pairing; relay sees ciphertext")])}

{fig("Security Architecture")}

<h2 id="encryption">Encryption</h2>

<ul>
  <li><strong>In transit.</strong> TLS for all network traffic. Certificate validation
    is not disableable in release builds.</li>
  <li><strong>At rest.</strong> Memory is encrypted with project-scoped keys, so one
    compromised key exposes one project.</li>
  <li><strong>Credentials.</strong> Held in the OS keystore, never in configuration
    files or plain-text preferences.</li>
  <li><strong>Pairing.</strong> A key is established at pairing; a relay forwards
    ciphertext it cannot read.</li>
</ul>

<h2 id="authn">Authentication and authorisation</h2>

<p>Authentication proves who you are. Authorisation decides what the agent may do, and it
is enforced per tool call rather than per session.</p>

{table(["Mode", "Behaviour", "Use when"],
       [("Ask permissions", "Prompts before each tool that changes anything", "Default. Anything you have not seen run before"),
        ("Accept edits", "Auto-allows safe writes; still asks for destructive ones", "Routine work in a directory you trust"),
        ("Plan mode", "Read-only. The agent may look, not act", "Investigating without risk"),
        ("Auto mode", "A safety classifier vets each call", "Long unattended runs you have scoped"),
        ("Bypass permissions", "Allows everything except blocked rules", "Never, unless you fully control the blast radius")])}

{fig("Permission Approval Flow")}

{note("Modes are per session with a workspace default. Raising a mode does not "
      "retroactively approve calls already refused.")}

<h2 id="secrets">Secrets and credential storage</h2>

<ul>
  <li>Keys are written to the platform keystore at entry and read at call time.</li>
  <li>They are never logged, never included in crash reports, and never sent to us.</li>
  <li>SSH credentials are stored encrypted on device. <strong>The SSH client cannot
    verify host keys</strong>, so it is not protected against a man-in-the-middle on an
    untrusted network. Connect only to servers you trust.</li>
</ul>

<h2 id="agent-security">Desktop agent security</h2>

<p>The agent executes commands on a real machine, which makes it the highest-value
component in the system.</p>

<ul>
  <li>Pairing is explicit, by QR or pairing code, and produces a scoped token that
    expires on unpair.</li>
  <li>Commands run under the permission gate, exactly as local tools do.</li>
  <li>Live View streams the screen only while a paired session is active.</li>
  <li>The agent reports its platform and version at pairing, so version mismatch is
    visible before it causes a failure.</li>
</ul>

<h2 id="mobile">Mobile security</h2>

<ul>
  <li>Keychain and Keystore for credentials; no custom crypto.</li>
  <li>Background execution is bounded by the platform, so a run cannot silently continue
    indefinitely.</li>
  <li>Approval requests raised while the app is closed are queued, not auto-approved.</li>
</ul>

<h2 id="mcp-security">MCP and third-party tool security</h2>

<p>An MCP server is code you chose to trust, running somewhere you do not control.</p>

<ul>
  <li>Grants are per tool. A server cannot widen its reach by adding a tool later.</li>
  <li>A consent step names what will be sent, before the first call.</li>
  <li>Server credentials live in the keystore.</li>
  <li>Namespaced tools prevent one server shadowing another's name.</li>
</ul>

<h2 id="sandbox">Sandboxing and local execution</h2>

<p>Tools run in the app's process on mobile, and in the agent's process on desktop.
Isolation is provided by the operating system's application sandbox. A stronger
per-tool sandbox is on the roadmap and is not implemented today &#8212; do not treat an
installed tool as contained.</p>

<h2 id="network">Network security</h2>

<ul>
  <li>Local pairing prefers the local network; a relay is used only when configured.</li>
  <li>No inbound ports are opened on the device.</li>
  <li>Self-hosted deployments should terminate TLS at a proxy you control. See
    <a href="../../docs/developers/self-hosting/">Self-hosting</a>.</li>
</ul>

<h2 id="updates">Secure updates and supply chain</h2>

<ul>
  <li>Releases are distributed through platform app stores and signed artefacts.</li>
  <li>Dependencies are pinned and reviewed on update; advisories are tracked and
    disclosed in the <a href="../../changelog.html">changelog</a> when they affect a
    reachable path.</li>
  <li>Build provenance and artefact signing: {TBD}.</li>
</ul>

<h2 id="audit">Audit logs</h2>

<p>Every tool call, permission decision and heartbeat wake-up is recorded locally with
its trigger and result. Logs are yours; we do not receive them. Retention and export for
hosted deployments: {TBD}.</p>

<h2 id="disclosure">Responsible disclosure</h2>

<p>Report a vulnerability to {TBD}. Please include a description, reproduction steps and
the version. We will acknowledge, keep you updated, and credit you unless you prefer
otherwise.</p>

<ul>
  <li>Do not access other people's data while testing.</li>
  <li>Do not run denial-of-service tests.</li>
  <li>Give us reasonable time to fix before publishing.</li>
</ul>

<p>Bounty programme, if any: {TBD}.</p>

<h2 id="incident">Incident response</h2>

{fig("Incident Response Timeline")}

<p>Detect, contain, eradicate, recover, review. Notification timelines to affected users
and regulators: {TBD}. Post-incident reviews are published where the lesson is
transferable.</p>

<h2 id="roadmap">Security roadmap</h2>

<ul>
  <li>Per-tool sandboxing beyond the OS application sandbox.</li>
  <li>Host-key verification for SSH.</li>
  <li>App-level lock independent of device unlock.</li>
  <li>Signed build provenance published with each release.</li>
</ul>

<h2 id="practices">Best practices</h2>

<ul>
  <li>Keep the default permission mode. Raise it per session, not globally.</li>
  <li>Scope OAuth grants to what the task needs.</li>
  <li>Review MCP servers before connecting; prefer ones that need no sign-in.</li>
  <li>Use separate keys per environment so one can be revoked alone.</li>
  <li>For self-hosting, terminate TLS at a proxy you control and test your restore.</li>
  <li>Read the audit log after an unattended run.</li>
</ul>
"""

SECURITY_FAQ = [
    ("Do you have SOC 2 or ISO 27001?",
     "Certification status is " + TBD + ". We do not claim a certification we do not "
     "hold."),
    ("Where do I report a vulnerability?",
     "To " + TBD + ", with reproduction steps and a version. Please do not test against "
     "other people's data."),
    ("Can Arble read my API keys?",
     "No. They are held in the OS keystore on your device and sent only to the service "
     "they authenticate."),
    ("Is the desktop agent sandboxed?",
     "It runs under the operating system's application sandbox. There is no per-tool "
     "sandbox yet; that is on the roadmap and stated as missing rather than implied."),
    ("What does a relay see?",
     "Ciphertext. The key is established between the paired devices at pairing."),
    ("Why can't the SSH client verify host keys?",
     "It is a known limitation of the current client, surfaced in the interface. Until "
     "it is fixed, treat SSH as safe only on networks and servers you trust."),
    ("Is my data encrypted at rest?",
     "Memory is, with project-scoped keys. Full-disk encryption remains the platform's "
     "responsibility."),
    ("What happens if a dependency has a CVE?",
     "We update it. If it was reachable from the request path, it is called out in the "
     "changelog rather than folded silently into a patch."),
    ("Can I run Arble fully offline?",
     "The runtime, registry, permission gate and memory work offline. A remote model "
     "provider obviously does not; a local model can."),
    ("How do I audit what an agent did overnight?",
     "The activity log records each wake-up, its trigger and its result. See "
     "<a href='../../docs/agent/automation/'>Automation</a>."),
]

TRUST = f"""
<p class="docs__lead">One page for the questions a security review asks, with links to
the technical detail behind each answer.</p>

{note("This page states what is true today. Where a programme is not in place, it says "
      "so rather than describing an aspiration in the present tense.", "warn")}

<h2 id="principles">Trust principles</h2>

<ul>
  <li><strong>Local by default.</strong> The agent loop runs on the customer's hardware.
    We hold less because less is sent.</li>
  <li><strong>Explicit authority.</strong> Every action that changes something passes a
    permission gate the user controls.</li>
  <li><strong>Legible behaviour.</strong> Tool calls, approvals and background runs are
    logged where the customer can read them.</li>
  <li><strong>Stated limits.</strong> Gaps are documented, in
    <a href="../security/#threat-model">the threat model</a> and here.</li>
</ul>

<h2 id="infrastructure">Infrastructure</h2>

{table(["Item", "Status"],
       [("Hosting providers and regions", TBD),
        ("Data residency options", TBD),
        ("Network isolation and segmentation", TBD),
        ("Self-hosted option", "Available. Docker and Kubernetes &#8212; see <a href='../../docs/developers/self-hosting/'>Self-hosting</a>")])}

<h2 id="availability">Availability and reliability</h2>

{table(["Item", "Status"],
       [("Uptime commitment", TBD + " &#8212; no SLA is offered by default"),
        ("Historical uptime", TBD),
        ("Status page", TBD),
        ("Maintenance windows", "Announced in advance; rolling upgrades avoid downtime where migrations allow"),
        ("Degradation behaviour", "A node whose database is unreachable reports unready and drains rather than returning errors")])}

<h2 id="privacy-t">Privacy</h2>

<p>What is collected, why, and how long it is kept is set out in
<a href="../privacy/">Privacy</a>. In summary: sessions, memory and credentials are
local by default; analytics and crash reporting are opt-in; we do not sell personal data
and do not train models on customer content.</p>

<h2 id="security-t">Security</h2>

<p>Architecture, encryption, the permission model, disclosure and incident response are
documented in <a href="../security/">Security</a>. That page includes what is
<em>not</em> implemented, which is usually the part a review needs.</p>

<h2 id="data-protection">Data protection</h2>

{table(["Control", "Status"],
       [("Encryption in transit", "TLS on all network traffic"),
        ("Encryption at rest", "Memory encrypted with project-scoped keys"),
        ("Credential storage", "OS keystore; never in configuration files"),
        ("Key management", TBD),
        ("Data deletion", "User-initiated in app; backup purge window " + TBD),
        ("Data processing addendum", TBD)])}

<h2 id="responsible-ai">Responsible AI</h2>

<ul>
  <li>Arble routes to the model the customer chooses. We do not train on customer
    content.</li>
  <li>Actions are gated. An agent cannot act outside the permissions granted to it.</li>
  <li>Output is not treated as authoritative: the product surfaces sources where a tool
    provides them, and the documentation states plainly that models are confidently
    wrong sometimes.</li>
  <li>Model providers are third parties with their own retention and training policies.
    We link to them rather than summarising them, because summaries go stale.</li>
</ul>

<h2 id="transparency">Transparency</h2>

<ul>
  <li>Breaking changes and deprecations are published in the
    <a href="../../changelog.html">changelog</a> with removal versions.</li>
  <li>Security-relevant fixes are described rather than folded silently into a patch.</li>
  <li>Known limitations are documented on the page where someone would look for the
    feature.</li>
</ul>

<h2 id="compliance">Compliance</h2>

{table(["Framework", "Status"],
       [("SOC 2", TBD + " &#8212; not claimed"),
        ("ISO 27001", TBD + " &#8212; not claimed"),
        ("HIPAA", TBD + " &#8212; not claimed"),
        ("GDPR", "Rights and legal bases documented in <a href='../privacy/#rights'>Privacy</a>. Representative and DPO: " + TBD),
        ("CCPA", "Rights honoured; no sale or sharing of personal information"),
        ("Penetration testing", TBD),
        ("Security questionnaires", TBD)])}

{note("We will not list a certification we have not completed. If a framework is "
      "required for your procurement, ask &#8212; an honest answer about where we are is "
      "more useful than a badge.", "warn")}

<h2 id="subprocessors">Subprocessors</h2>

<p>Third parties that process personal data on our behalf, their purpose and their
location: {TBD}. Notification of changes to this list: {TBD}.</p>

<p>Note that AI providers and MCP servers you connect are <em>your</em> processors, not
ours &#8212; you choose them and you supply the credentials.</p>

<h2 id="incident-t">Incident response and continuity</h2>

{table(["Item", "Status"],
       [("Incident response process", "Detect, contain, eradicate, recover, review &#8212; see <a href='../security/#incident'>Security</a>"),
        ("Customer notification timeline", TBD),
        ("Regulator notification timeline", TBD),
        ("Backup frequency and retention", TBD),
        ("Restore testing cadence", TBD),
        ("RTO and RPO", TBD),
        ("Business continuity plan", TBD)])}

<h2 id="access">Access controls</h2>

{table(["Control", "Status"],
       [("Employee access to customer data", "Minimised by architecture: most customer data never reaches us"),
        ("Access review cadence", TBD),
        ("Multi-factor authentication internally", TBD),
        ("Background checks", TBD),
        ("Security training", TBD),
        ("Offboarding process", TBD)])}

<h2 id="monitoring">Monitoring and vendor security</h2>

<ul>
  <li>Service telemetry covers latency and error rates for our own infrastructure.</li>
  <li>Dependency advisories are tracked and patched; see
    <a href="../security/#updates">supply chain</a>.</li>
  <li>Vendor security review process: {TBD}.</li>
</ul>

<h2 id="contact-tc">Security contact</h2>

<p>Security enquiries, questionnaires and disclosure: {TBD}.</p>
"""

TRUST_FAQ = [
    ("Are you SOC 2 certified?",
     "Status is " + TBD + ". We do not claim certifications we do not hold, and we will "
     "not put a badge on this page before an audit exists."),
    ("Can we self-host to keep data in our own environment?",
     "Yes. Docker and Kubernetes are documented in "
     "<a href='../../docs/developers/self-hosting/'>Self-hosting</a>. A self-hosted "
     "deployment sends us nothing beyond update checks, which can be disabled."),
    ("Do you sign a DPA?", TBD + "."),
    ("Where is our data processed?",
     "For self-hosting, wherever you run it. For hosted services, " + TBD + "."),
    ("Do you train on our data?",
     "No. Your chosen AI provider's policy is separate and worth reading."),
    ("Who are your subprocessors?",
     TBD + ". AI providers and MCP servers you connect are your processors, not ours."),
    ("What is your uptime commitment?",
     "None by default. Any commitment lives in a separate agreement &#8212; " + TBD + "."),
    ("How quickly would you notify us of a breach?",
     TBD + ". The response process itself is documented in "
     "<a href='../security/#incident'>Security</a>."),
    ("Can we run a penetration test?",
     "Ask first at " + TBD + ". Testing against shared infrastructure without agreement "
     "affects other customers."),
    ("How much customer data do you actually hold?",
     "For local-only use, effectively none beyond account records. That is the point of "
     "the architecture rather than a policy choice."),
]

COOKIES = f"""
<p class="docs__lead">What the Arble website and hosted console store in your browser, and
how to change it.</p>

<p>The Arble application does not use cookies. This policy covers the website, the
documentation and the hosted console.</p>

<h2 id="philosophy-c">Cookie philosophy</h2>

<p>Essential cookies only, unless you choose otherwise. There is no advertising network
on this site and no cross-site tracking. If a cookie is not needed to make something
work, it is off until you turn it on.</p>

<h2 id="what">What cookies are</h2>

<p>A cookie is a small file a site stores in your browser and reads back on your next
request. Related technologies &#8212; local storage, session storage &#8212; do the same
job with different mechanics, and this policy covers them too.</p>

{fig("Cookie Categories")}

<h2 id="categories">Categories</h2>

{table(["Category", "Purpose", "Default", "Retention"],
       [("Essential", "Sign-in, session integrity, security, load balancing", "Always on &#8212; the site cannot work without them", "Session, or up to " + TBD),
        ("Functional", "Remembering preferences such as sidebar state", "On", "Up to " + TBD),
        ("Performance", "Aggregate timing to find slow pages", "Opt-in", TBD),
        ("Analytics", "Which pages are read, as counts", "Opt-in", TBD),
        ("Marketing", "Not used", "Not set", "&#8212;")])}

{note("Essential cookies cannot be switched off, because switching them off means "
      "signing out and staying out. Everything else can.")}

<h2 id="third-party">Third-party cookies</h2>

<p>Cookies set by parties other than us, if any &#8212; analytics provider, video
embeds, documentation search: {TBD}. Fonts are loaded from a third-party CDN, which sees
the request but sets no cookie.</p>

<h2 id="managing">Managing cookies</h2>

<ul>
  <li><strong>On this site.</strong> Change your choices at any time from the cookie
    preferences control ({TBD}).</li>
  <li><strong>In your browser.</strong> Every major browser can block or delete cookies,
    per site or entirely. Blocking essential cookies will sign you out.</li>
  <li><strong>Application.</strong> Nothing to manage &#8212; the app stores its state on
    the device, not in a browser.</li>
</ul>

<h2 id="dnt">Do Not Track and Global Privacy Control</h2>

<p>Browsers may send a Do Not Track header, which has no agreed meaning and which we
therefore do not rely on. We do honour Global Privacy Control signals where the law
requires it, which for this site means non-essential cookies stay off.</p>

<h2 id="changes-c">Changes</h2>

<p>If we add a cookie category, this page changes before it is set, and the date at the
top updates.</p>

<h2 id="contact-c">Contact</h2>

<p>Questions about cookies: {TBD}. Broader privacy questions are answered in
<a href="../privacy/">Privacy</a>.</p>
"""

COOKIES_FAQ = [
    ("Does the Arble app use cookies?",
     "No. It stores its state on the device. This policy covers the website, "
     "documentation and hosted console."),
    ("Can I refuse everything?",
     "You can refuse everything except essential cookies. Refusing those means you "
     "cannot stay signed in."),
    ("Do you use advertising cookies?", "No, and there is no advertising network on the site."),
    ("Do you track me across other sites?", "No."),
    ("What happens if I clear cookies?",
     "You are signed out and preferences reset. Nothing in your Arble data is affected."),
    ("Are fonts a privacy issue?",
     "Fonts load from a third-party CDN, which sees the request but sets no cookie. "
     "Self-hosting the fonts is " + TBD + "."),
    ("How long do cookies last?", "See the retention column above; specific durations are " + TBD + "."),
    ("Do you honour Global Privacy Control?", "Yes, where the law requires it."),
    ("Is local storage covered?", "Yes. This policy covers cookies and equivalent browser storage."),
    ("Where do I change my choices?", "From the cookie preferences control &#8212; " + TBD + "."),
]


PAGES = [
    ("privacy", "Privacy", "How Arble handles your data.", "12 min", PRIVACY, PRIVACY_FAQ),
    ("terms", "Terms", "The agreement between you and Arble.", "14 min", TERMS, TERMS_FAQ),
    ("security", "Security", "Architecture, controls and known gaps.", "13 min", SECURITY, SECURITY_FAQ),
    ("trust", "Trust Center", "Answers for a security review.", "9 min", TRUST, TRUST_FAQ),
    ("cookies", "Cookie Policy", "What the website stores in your browser.", "5 min", COOKIES, COOKIES_FAQ),
]

RELATED = {
    "privacy": [("Security", "../security/", "How the data described here is protected."),
                ("Cookie Policy", "../cookies/", "What the website stores in your browser."),
                ("Trust Center", "../trust/", "The same answers, arranged for procurement.")],
    "terms": [("Acceptable use", "#acceptable-use", "The limits that matter most in practice."),
              ("Privacy", "../privacy/", "What we do with data you provide."),
              ("Self-hosting", "../../docs/developers/self-hosting/", "Running Arble on your own infrastructure.")],
    "security": [("Permissions", "../../docs/agent/permissions/", "The control this page describes, from the user's side."),
                 ("MCP Servers", "../../docs/developers/mcp-servers/", "The third-party trust boundary in detail."),
                 ("Trust Center", "../trust/", "Compliance posture and subprocessors.")],
    "trust": [("Security", "../security/", "The technical detail behind these answers."),
              ("Privacy", "../privacy/", "Collection, retention and rights."),
              ("Self-hosting", "../../docs/developers/self-hosting/", "Keeping data in your own environment.")],
    "cookies": [("Privacy", "../privacy/", "Everything outside the browser."),
                ("Trust Center", "../trust/", "Procurement-facing summary."),
                ("Documentation", "../../docs/", "The rest of the documentation.")],
}


def side(current):
    rows = []
    for slug, title, _, _, _, _ in PAGES:
        cur = " is-current" if slug == current else ""
        aria = ' aria-current="page"' if slug == current else ""
        rows.append(
            f'            <li class="docs__railrow{cur}"><a href="../{slug}/"{aria}>'
            f'<span class="docs__railnum" aria-hidden="true">&#183;</span>'
            f"<span>{title}</span></a></li>")
    return "\n".join(rows)


def page(i):
    slug, title, subtitle, mins, body, questions = PAGES[i]
    prev = PAGES[i - 1] if i > 0 else None
    nxt = PAGES[i + 1] if i + 1 < len(PAGES) else None

    nav = ['<nav class="pbp__nav" aria-label="Page navigation">']
    if prev:
        nav.append(f'<a class="pbp__navcard pbp__navcard--prev" href="../{prev[0]}/">'
                   f'<span class="pbp__navcard-l">Previous</span>'
                   f'<span class="pbp__navcard-t">{prev[1]}</span></a>')
    if nxt:
        nav.append(f'<a class="pbp__navcard pbp__navcard--next" href="../{nxt[0]}/">'
                   f'<span class="pbp__navcard-l">Next</span>'
                   f'<span class="pbp__navcard-t">{nxt[1]}</span></a>')
    nav.append("</nav>")

    related = "".join(
        f'<a class="docs__card" href="{href}"><span class="docs__card-t">{t}</span>'
        f'<span class="docs__card-d">{d}</span></a>' for t, href, d in RELATED[slug])

    return f"""<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} &#8212; Arble</title>
  <meta name="description" content="{subtitle}" />
  <link rel="icon"
    href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='3.4' fill='%230A0A0B'/%3E%3Ccircle cx='12' cy='12' r='7.2' fill='none' stroke='%230A0A0B' stroke-width='1.3' opacity='.45'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap" />
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=switzer@400,500,600,700&display=swap" />
  <link rel="stylesheet" href="../../assets/css/docs.css?v={CSS_V}" />
</head>

<!-- GENERATED by docs-build/legal.py — edit the content there, not here.

     NOT LEGAL ADVICE AND NOT READY TO PUBLISH. Every [Organization-specific
     information required] marker is a fact only the company can supply:
     jurisdiction, retention periods, subprocessors, contact addresses, refund
     policy, liability cap. No certification is claimed anywhere. Have counsel
     review before this goes live. -->
<body class="dapp">
  <a class="skip" href="#doc">Skip to content</a>

  <div class="dapp__grid">

    <aside class="dside" aria-label="Legal">
      <div class="dside__head">
        <a class="dside__brand" href="../../index.html" aria-label="Arble home">
          <img src="../../assets/img/brand/logo-mark.png" width="288" height="271" alt="" aria-hidden="true" />
        </a>
        <span class="dside__rule" aria-hidden="true"></span>
        <a class="dside__brand" href="../privacy/"><span>Legal</span></a>
      </div>

      <div class="dside__scroll">
        <nav aria-label="Legal pages">
          <details class="docs__grp" open>
            <summary class="docs__grph"><span>Legal</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </summary>
          <ul class="docs__raillist">
{side(slug)}
          </ul>
          </details>
        </nav>
      </div>

      <nav class="dside__foot" aria-label="Arble">
        <a href="../../docs/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path
            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/></svg>
          <span>Docs</span>
        </a>
        <a href="../../docs/developers/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path
            d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg>
          <span>Developers</span>
        </a>
        <a href="../../playbook.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path
            d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>
          <span>Learn</span>
        </a>
        <a href="../../docs/reference/troubleshooting/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path
            d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
          <span>Contact support</span>
        </a>
      </nav>
    </aside>

    <div class="dmain">
      <header class="dtop">
        <button class="dnavbtn" type="button" id="navToggle" aria-label="Open navigation"
          aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <p class="docs__crumb"><a href="../../docs/">Resources</a>
          <span aria-hidden="true">/</span> <a href="../privacy/">Legal</a>
          <span aria-hidden="true">/</span> {title}</p>
        <div class="docs__acts">
          <button class="docs__act" type="button" id="copyPage" aria-label="Copy page as Markdown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9"
              width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy page</span>
          </button>
        </div>
      </header>

      <div class="dbody">
        <article class="docs__body" id="doc">
          <h1 class="docs__title">{title}</h1>
          <p class="docs__meta"><b>{mins} read</b><i>&#183;</i>Last updated {UPDATED}</p>

          <div class="docs__note docs__note--warn">
            <p><strong>Draft &#8212; not legal advice.</strong> Every
              <em>[Organization-specific information required]</em> marker needs a fact only
              your organisation can supply. No certification is claimed. Have counsel review
              before publishing.</p>
          </div>

{body}

          <h2 id="faq">FAQ</h2>
{faq(questions)}

          <h2 id="related">Related</h2>
          <div class="docs__cards">{related}</div>

          <h2 id="feedback">Feedback</h2>
          <p>Something unclear, or wrong? Documentation defects are treated as defects.
            Tell us at {TBD}, or open an issue against the documentation. Include the page
            and the sentence &#8212; a page nobody can follow is a page that has failed,
            whatever it says legally.</p>

{"".join(nav)}
        </article>

        <aside class="docs__toc" aria-label="On this page">
          <p class="docs__tocH">On this page</p>
          <ul class="docs__toclist" id="docsToc"></ul>
        </aside>
      </div>
    </div>
  </div>

  <script src="../../assets/js/docs.js?v=7" defer></script>
  <script src="../../assets/js/docs-ui.js?v=3" defer></script>
  <script>
    /* Build the on-this-page rail from the headings actually present, so the
       TOC cannot drift from the content the way a hand-written list does. */
    (function () {{
      var list = document.getElementById("docsToc");
      var heads = document.querySelectorAll(".docs__body h2[id]");
      var html = "";
      heads.forEach(function (h) {{
        html += '<li class="docs__tocrow"><a href="#' + h.id + '">' + h.textContent + "</a></li>";
      }});
      list.innerHTML = html;
      if (window.ArbleDocs) window.ArbleDocs.initToc();
      else addEventListener("load", function () {{
        if (window.ArbleDocs) window.ArbleDocs.initToc();
      }});
    }})();
  </script>
</body>

</html>
"""


def main():
    for i, (slug, title, *_rest) in enumerate(PAGES):
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write(page(i))
        print(f"legal/{slug}/index.html")
    print(f"\n{len(PAGES)} pages written")


if __name__ == "__main__":
    main()
