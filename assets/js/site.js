/* Arble landing — interactions. Vanilla, no dependencies. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ── one rAF-throttled scroll pass shared by every scrubbed effect ── */
  var scrubbers = [], scrubTicking = false;
  function onScrub(fn) { scrubbers.push(fn); fn(); }
  function runScrubbers() { for (var i = 0; i < scrubbers.length; i++) scrubbers[i](); }
  window.addEventListener("scroll", function () {
    if (scrubTicking) return;
    scrubTicking = true;
    requestAnimationFrame(function () { scrubTicking = false; runScrubbers(); });
  }, { passive: true });
  window.addEventListener("resize", runScrubbers, { passive: true });
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ── hero background concentric contour rings ── */
  var bgSvg = document.querySelector(".hero-bg svg g");
  if (bgSvg && bgSvg.children.length === 0) {
    var cx = 850, cy = 300;
    for (var r = 40; r < 1400; r += 70) {
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", r);
      bgSvg.appendChild(circle);
    }
  }

  /* ── hero feature cards ── */
  var MCARDS = [
    { t: "On-device runtime", i: '<path d="M12 3l7.5 3.8v5c0 4.4-3.1 8.2-7.5 9.4-4.4-1.2-7.5-5-7.5-9.4v-5z" stroke-linejoin="round"/><path d="M9.2 12.2l2 2 3.6-4" stroke-linecap="round" stroke-linejoin="round"/>' },
    { t: "Permission gate", i: '<path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round"/>' },
    { t: "Persistent memory", i: '<path d="M12 3v18M3 8h4M3 16h4M17 8h4M17 16h4" stroke-linecap="round"/><circle cx="12" cy="12" r="3"/>' },
    { t: "Model routing", i: '<path d="M4 12h7M11 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="12" r="1.6"/>' },
    { t: "61 toolsets", i: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>' },
    { t: "Runs offline", i: '<path d="M13 3l-8 10h6l-1 8 8-10h-6z" stroke-linejoin="round"/>' }
  ];

  /* ── ecosystem marquee: one row of brand marks ──
     Logos only. Capability pills were dropped: in a logo wall an item with no
     mark reads as a gap, not as a claim.

     Emitted twice from ONE array, so the halves are identical by construction
     and the -50% keyframe cannot seam. Order is interleaved rather than grouped
     by category — models beside runtimes beside dev tools is the claim.

     Each `d` is a simple-icons path (CC0-1.0) on a 24x24 box, inlined so it
     inherits currentColor and a single normalised height. To add a brand, add
     one entry with its path; no CSS or markup change needed. */
  var ECOSYSTEM = [
    { t: "OpenAI", d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" },
    { t: "Anthropic", d: "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" },
    { t: "Ollama", d: "M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z" },
    { t: "NVIDIA", d: "M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.158-.185v-4.346c1.528.185 1.837.857 2.747 2.385l2.04-1.714s-1.492-1.952-4-1.952a6.016 6.016 0 0 0-.796.035m0-4.735v2.138l.424-.027c5.45-.185 9.01 4.47 9.01 4.47s-4.08 4.964-8.33 4.964c-.37 0-.733-.035-1.095-.097v1.325c.3.035.61.062.91.062 3.957 0 6.82-2.023 9.593-4.408.459.371 2.34 1.263 2.73 1.652-2.633 2.208-8.772 3.984-12.253 3.984-.335 0-.653-.018-.971-.053v1.864H24V4.063zm0 10.326v1.131c-3.657-.654-4.673-4.46-4.673-4.46s1.758-1.944 4.673-2.262v1.237H8.94c-1.528-.186-2.73 1.245-2.73 1.245s.68 2.412 2.739 3.11M2.456 10.9s2.164-3.197 6.5-3.533V6.201C4.153 6.59 0 10.653 0 10.653s2.35 6.802 8.948 7.42v-1.237c-4.84-.6-6.492-5.936-6.492-5.936z" },
    { t: "Perplexity", d: "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z" },
    { t: "GitHub", d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
    { t: "Hugging Face", d: "M1.4446 11.5059c0 1.1021.1673 2.1585.4847 3.1563-.0378-.0028-.0691-.0058-.1058-.0058-.4209 0-.8015.16-1.0704.4512-.3454.3737-.4984.8335-.4316 1.293a1.576 1.576 0 0 0 .2148.5978c-.2319.1864-.4018.4456-.4844.7578-.0646.2448-.131.7543.2149 1.2794a1.4552 1.4552 0 0 0-.0625.1055c-.208.3923-.2207.8372-.0371 1.25.2783.6258.9696 1.1175 2.3126 1.6467.8356.3292 1.5988.5411 1.6056.543 1.1046.2847 2.104.4277 2.969.4277 1.4173 0 2.4754-.3849 3.1525-1.1446 1.538.2651 2.791.1403 3.592.006.6773.7555 1.7332 1.1387 3.1467 1.1387.8649 0 1.8643-.143 2.969-.4278.0068-.0019.77-.2138 1.6056-.543 1.343-.5292 2.0343-1.0208 2.3126-1.6466.1836-.4129.171-.8577-.037-1.25a1.4685 1.4685 0 0 0-.0626-.1056c.346-.525.2795-1.0346.2149-1.2793-.0826-.3122-.2525-.5714-.4844-.7579.11-.1816.1831-.3788.2148-.5977.0669-.4595-.0862-.9193-.4316-1.293-.2688-.2913-.6495-.4513-1.0704-.4513-.0209 0-.0376.0008-.0588.0018.3162-.9966.4846-2.0518.4846-3.1523 0-5.807-4.7362-10.5144-10.5789-10.5144-5.8426 0-10.5788 4.7073-10.5788 10.5144Zm10.5788-9.4831c5.2727 0 9.5476 4.246 9.5476 9.483a9.4201 9.4201 0 0 1-.2696 2.2365c-.0039-.0047-.0079-.011-.0117-.0156-.274-.3255-.6679-.5059-1.1075-.5059-.352 0-.714.1155-1.0763.3438-.2403.1517-.5058.422-.7793.7598-.2534-.3492-.608-.5832-1.0137-.6465a1.5174 1.5174 0 0 0-.2344-.0176c-.9263 0-1.4828.7993-1.6935 1.5177-.1046.2426-.6065 1.3482-1.3614 2.0978-1.1681 1.1601-1.4458 2.3534-.8396 3.6382-.843.1029-1.5836.0927-2.365-.006.5906-1.212.3626-2.4388-.8426-3.6322-.755-.7496-1.2568-1.8552-1.3614-2.0978-.2107-.7184-.7673-1.5177-1.6935-1.5177-.078 0-.1568.0054-.2344.0176-.4057.0633-.7604.2973-1.0137.6465-.2735-.3379-.539-.6081-.7794-.7598-.3622-.2283-.7243-.3438-1.0762-.3438-.4266 0-.8094.171-1.0821.4786a9.4208 9.4208 0 0 1-.2598-2.1936c0-5.237 4.2749-9.483 9.5475-9.483zM8.6443 7.0036c-.4838.0043-.9503.2667-1.1934.7227-.3536.6633-.1006 1.4873.5645 1.84.351.1862.4883-.5261.836-.6485.3107-.1095.841.399 1.0078.086.3536-.6634.1025-1.4874-.5625-1.84a1.3659 1.3659 0 0 0-.6524-.1602Zm6.8403 0c-.2199-.002-.4426.05-.6504.1602-.665.3526-.9181 1.1766-.5645 1.84.1669.313.6971-.1955 1.0079-.086.3476.1224.4867.8347.838.6485.6649-.3527.916-1.1767.5624-1.84-.243-.456-.7096-.7184-1.1934-.7227Zm-9.7565 1.418a.8768.8768 0 0 0-.877.877c0 .4846.3925.877.877.877a.8768.8768 0 0 0 .877-.877.8768.8768 0 0 0-.877-.877zm12.6434 0c-.4845 0-.879.3925-.879.877 0 .4846.3945.877.879.877a.8768.8768 0 0 0 .877-.877.8768.8768 0 0 0-.877-.877zM8.7927 11.459c-.179-.003-.2793.1107-.2793.416 0 .8097.3874 2.125 1.4279 2.924.207-.7123 1.3453-1.2832 1.5079-1.2012.2315.1167.2191.4417.6074.7266.3884-.285.374-.6098.6056-.7266.1627-.082 1.3009.4889 1.5079 1.2012 1.0404-.799 1.4278-2.1144 1.4278-2.924 0-1.2212-1.583.6402-3.5413.6485-1.4686-.0061-2.7266-1.0558-3.2639-1.0645zM4.312 14.4768c.5792.365 1.6964 2.2751 2.1056 3.0177.1371.2488.371.3536.582.3536.4188 0 .7465-.4138.0391-.9395-1.0636-.791-.6914-2.0846-.1836-2.1642a.4302.4302 0 0 1 .0664-.004c.4616 0 .666.7892.666.7892s.5959 1.4898 1.6213 2.508c.942.9356 1.062 1.703.4961 2.6661-.0164-.004-.0159.0236-.1484.2149-.1853.2673-.4322.4688-.7188.6152-.5062.2269-1.1397.2696-1.7833.2696-1.037 0-2.1017-.1824-2.6975-.336-.0293-.0075-3.6505-.9567-3.1916-1.8224.0771-.1454.2033-.2031.3633-.2031.6463 0 1.823.9551 2.3283.9551.113 0 .196-.0865.2285-.2031.2249-.8045-3.2787-1.0522-2.9846-2.1642.0519-.1967.193-.2757.3907-.2754.854 0 2.7704 1.4923 3.172 1.4923.0307 0 .0525-.0085.0645-.0274.2012-.3227.1096-.5865-1.3087-1.4395-1.4182-.8533-2.4315-1.329-1.8653-1.9416.0651-.0707.1574-.1015.2695-.1015.8611.0002 2.8948 1.84 2.8948 1.84s.5487.5683.8809.5683c.0762 0 .1416-.0315.1855-.1054.2355-.3946-2.1858-2.2183-2.3224-2.971-.0926-.51.0641-.7676.3555-.7676-.0006.008.1701-.0285.4942.1759zm16.2257.5918c-.1366.7526-2.5579 2.5764-2.3224 2.9709.044.074.1092.1055.1855.1055.3321 0 .881-.5684.881-.5684s2.0336-1.8397 2.8947-1.84c.1121 0 .2044.0308.2695.1016.5662.6125-.447 1.0882-1.8653 1.9415-1.4183.853-1.51 1.1168-1.3087 1.4396.012.0188.0337.0273.0644.0273.4016 0 2.3181-1.4923 3.1721-1.4923.1977-.0002.3388.0787.3907.2754.294 1.112-3.2095 1.3597-2.9846 2.1642.0325.1166.1156.2032.2285.2032.5054 0 1.682-.9552 2.3283-.9552.16 0 .2862.0577.3633.2032.459.8656-3.1623 1.8149-3.1916 1.8224-.5958.1535-1.6605.336-2.6975.336-.6351 0-1.261-.0409-1.7638-.2599-.2949-.1472-.5488-.3516-.7383-.625-.0411-.0682-.1026-.1476-.1426-.205-.5726-.9679-.455-1.7371.4903-2.676 1.0254-1.0182 1.6212-2.508 1.6212-2.508s.2044-.7891.666-.7891a.4318.4318 0 0 1 .0665.0039c.5078.0796.88 1.3732-.1836 2.1642-.7074.5257-.3797.9395.039.9395.211 0 .445-.1047.5821-.3535.4092-.7426 1.5264-2.6527 2.1056-3.0178.5588-.3524.99-.1816.8497.5918z" },
    { t: "Notion", d: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" },
  ];

  var ecoTrack = document.getElementById('ecoTrack');
  if (ecoTrack) {
    var ecoHtml = ECOSYSTEM.map(function (e) {
      // Brand marks are simple-icons paths (CC0-1.0): one 24x24 path each, so
      // they inherit currentColor and a single optical height.
      return '<span class="eco__logo">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + e.d + '"/></svg>' +
        '<span class="eco__name">' + e.t + '</span></span>';
    }).join('');
    ecoTrack.innerHTML = ecoHtml + ecoHtml; // two copies → -50% loop is seamless
    if (reduced) ecoTrack.style.animation = 'none';
  }

  /* ── scale section: rail of toolset names ──
     The domains the 61 toolsets cover, as a moving row rather than a list: the
     point is that the shelf is long, not that you should read every name. Same
     construction as the ecosystem rail — one array emitted twice, so the -50%
     keyframe cannot seam. Every fourth chip is marked on, purely so the row has
     a rhythm rather than a uniform grey; nothing reads state off it.
     Decorative, so the container carries aria-hidden. */
  /* Every name here is a real toolset in src/agent/tools/builtin. "Photos" and
     "Browser" came out: neither exists, and a rail is a claim about what the
     shelf holds. */
  var TOOLSETS = [
    "Mail", "Calendar", "Contacts", "Reminders", "Notes", "Documents", "Files",
    "Slack", "GitHub", "Jira", "Linear", "Notion", "Todoist", "Telegram",
    "WhatsApp", "Discord", "Dropbox", "Music", "Home devices", "Health",
    "Weather", "Maps", "Shell", "Search", "Translation", "Images", "QR codes",
    "n8n"
  ];

  var chipTrack = document.getElementById("chipTrack");
  if (chipTrack) {
    /* No .is-on chips here. The travelling rail is a texture, not a control, and
       every fourth pill going solid black read as a selected state the reader
       could not act on — the reference keeps the whole strip in greys. */
    var chipHtml = TOOLSETS.map(function (t) {
      return '<span class="tabchip">' + t + '</span>';
    }).join("");
    chipTrack.innerHTML = chipHtml + chipHtml;
    if (reduced) chipTrack.style.animation = "none";
  }

  /* ── hero cards: one continuous upward loop, independent of scroll ──
     Two copies of the deck make the -50% keyframe seamless. */
  var mTrack = document.getElementById("marqueeTrack");
  if (mTrack) {
    var cardHtml = MCARDS.map(function (c) {
      return '<div class="hfeat"><span class="hfeat__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' +
        c.i + '</svg></span><span class="hfeat__t">' + c.t + '</span></div>';
    }).join("");
    mTrack.innerHTML = cardHtml + cardHtml;
    if (reduced) mTrack.style.animation = "none";
  }

  /* ── hero phone: downward parallax scrubbed to scroll ──
     Linear, so the device always travels at exactly DRIFT of the scroll speed —
     it sinks relative to the page instead of animating in once. The hero's own
     overflow crops it, so it is never seen sliding in from anywhere. */
  (function () {
    var hero = document.querySelector(".hero");
    var device = document.querySelector(".device");
    if (!hero || !device || reduced) return;
    /* Measured on the reference: the phone's page-space top advances exactly
       40px per 200px of scroll (562→842 over 0→1400), linear, with no cap, and
       returns to the same values when scrolling back up — i.e. scroll-scrubbed
       at a ratio of 0.20. */
    var DRIFT = 0.20;
    onScrub(function () {
      var scrolled = -hero.getBoundingClientRect().top;
      var y = Math.max(0, scrolled * DRIFT);
      device.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
    });
  })();

  /* ── trust showcase: three tabs, one stage ──
     A real tablist: roving tabIndex, arrow keys, Home/End. The dwell lives in
     one constant here and is handed to CSS as --dwell, so the bar that fills
     and the timer that advances can never disagree.

     It idles until the section is on screen — an invisible carousel burning
     timers is just a background tax — and pauses whenever a pointer or the
     keyboard is inside it, because advancing out from under someone who is
     reading is the thing that makes these feel hostile. */
  (function () {
    var show = document.querySelector(".tshow");
    if (!show) return;
    var tabs = [].slice.call(show.querySelectorAll(".tab"));
    var shots = [].slice.call(show.querySelectorAll(".tshow__shot"));
    if (tabs.length < 2 || tabs.length !== shots.length) return;

    var DWELL = 5200;
    show.style.setProperty("--dwell", DWELL + "ms");

    var at = 0, timer = null, onScreen = false, held = false;

    function stop() { clearTimeout(timer); timer = null; }

    function queue() {
      stop();
      if (reduced || !onScreen || held) return;
      timer = setTimeout(function () { select((at + 1) % tabs.length); }, DWELL);
    }

    function select(n, focus) {
      at = n;
      tabs.forEach(function (t, k) {
        var on = k === n;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on) {
          /* Re-trigger the fill: removing the class alone will not restart a
             running animation, so drop it, force a reflow, put it back. */
          var fill = t.querySelector(".tab__fill");
          if (fill) { fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = ""; }
          if (focus) t.focus();
        }
      });
      shots.forEach(function (s, k) { s.classList.toggle("is-on", k === n); });
      queue();
    }

    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { select(k); });
    });

    show.querySelector(".tabs").addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (at + 1) % tabs.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (at - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(n, true);
    });

    function hold(v) { held = v; if (v) stop(); else queue(); }
    show.addEventListener("mouseenter", function () { hold(true); });
    show.addEventListener("mouseleave", function () { hold(false); });
    show.addEventListener("focusin", function () { hold(true); });
    show.addEventListener("focusout", function () {
      if (!show.contains(document.activeElement)) hold(false);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { onScreen = e.isIntersecting; if (onScreen) queue(); else stop(); });
      }, { threshold: .3 }).observe(show);
    } else {
      onScreen = true;
      queue();
    }
  })();

  /* ── connect: segmented control over swapping panes ──
     Click-only by design — the trust showcase above already advances on a
     timer, and two self-running carousels on one page is a tic.

     The indicator is measured from the live button box rather than computed as
     a fraction of the track, so it stays true whatever the labels say and
     however the clamped font size resolves. Re-measured on resize, and once
     more after webfonts settle: Switzer swaps in after first paint and the
     labels change width under it. */
  (function () {
    var seg = document.getElementById("connectSeg");
    var panes = [].slice.call(document.querySelectorAll("#connect .pane"));
    if (!seg || !panes.length) return;
    var btns = [].slice.call(seg.querySelectorAll(".seg__b"));
    if (btns.length !== panes.length) return;

    var at = 0;

    function place() {
      var b = btns[at];
      seg.style.setProperty("--segx", b.offsetLeft + "px");
      seg.style.setProperty("--segw", b.offsetWidth + "px");
    }

    function select(n, focus) {
      at = n;
      btns.forEach(function (b, k) {
        var on = k === n;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      panes.forEach(function (p, k) { p.classList.toggle("is-on", k === n); });
      place();
    }

    btns.forEach(function (b, k) {
      b.addEventListener("click", function () { select(k); });
    });

    seg.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (at + 1) % btns.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (at - 1 + btns.length) % btns.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = btns.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(n, true);
    });

    window.addEventListener("resize", place, { passive: true });
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  })();

  /* ── daily: accordion ──
     One row open at a time, like the reference. Clicking the open row closes
     it, so the list can be fully collapsed rather than trapping you in a state
     you cannot leave. All the animation lives in CSS (0fr→1fr); this only
     moves the class and keeps aria-expanded honest. */
  (function () {
    var acc = document.getElementById("dailyAcc");
    if (!acc) return;
    var items = [].slice.call(acc.querySelectorAll(".acc__i"));
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector(".acc__q");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var b = other.querySelector(".acc__q");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();

  /* ── scroll reveal ── */
  var revealables = document.querySelectorAll(".rv");
  function afterReveal(t) {
    if (t.querySelector(".route__fill")) fillRoutes();
    if (t.querySelector("[data-count]")) countUp(t);
  }
  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); afterReveal(el); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add("is-in"); io.unobserve(e.target); afterReveal(e.target); });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  }
  function fillRoutes() { document.querySelectorAll(".route__fill").forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; }); }
  function countUp(scope) {
    scope.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduced) { el.textContent = String(target) + suffix; return; }
      var start = performance.now();
      (function tick(now) { var p = Math.min((now - start) / 1000, 1); el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix; if (p < 1) requestAnimationFrame(tick); })(start);
    });
  }

  /* ── scroll-scrubbed paragraph reveal ──
     Measured on the reference: per-word, opacity 0.2 → 1, no transform and no
     colour change, with exactly ONE word part-way through the fade at any
     moment (sampled 4 scroll positions: 23/26/30/35 words at full opacity,
     always 1 partial). It reverses on scroll-up, so it is scrubbed. */
  (function () {
    var els = [].slice.call(document.querySelectorAll("[data-scrub-text]"));
    if (!els.length) return;
    var SOFT = 1;

    els.forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (w, i) {
        var span = document.createElement("span");
        span.className = "w";
        span.textContent = w;
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
      el.classList.add("tscrub");
      el._words = [].slice.call(el.children);
    });

    if (reduced) {
      els.forEach(function (el) { el._words.forEach(function (w) { w.style.opacity = "1"; }); });
      return;
    }

    onScrub(function () {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var start = vh * 0.86, end = vh * 0.34;       // begins low, finishes mid-screen
        var p = clamp01((start - r.top) / (start - end + r.height));
        var head = p * (el._words.length + SOFT);
        el._words.forEach(function (w, i) {
          w.style.opacity = (0.2 + 0.8 * clamp01((head - i) / SOFT)).toFixed(3);
        });
      });
    });
  })();

  /* ── accordions ── */
  function wireAcc(container, onOpen) {
    if (!container) return;
    var items = [].slice.call(container.querySelectorAll(".acc__item"));
    items.forEach(function (item, i) {
      var btn = item.querySelector(".acc__btn");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        items.forEach(function (o) { o.classList.remove("is-open"); var b = o.querySelector(".acc__btn"); if (b) b.setAttribute("aria-expanded", "false"); });
        if (willOpen) { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); if (onOpen) onOpen(i); }
      });
    });
  }

  /* ── accordion-driven phone screens ── */
  var SCREENS = [
    { title: "Ask", state: "ready", html:
      '<div class="bub bub--me">What did I promise Priya on Monday?</div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">search_memory</span><span class="tool__badge">auto</span></div></div>' +
      '<div class="bub bub--it">Two things: the revised pricing doc by Friday, and an intro to the Bengaluru team.</div>' +
      '<div class="bub bub--it">Neither is on your task list. Add both?</div>' },
    { title: "Tools", state: "3 calls", html:
      '<div class="bub bub--me">Send the pricing doc to Priya.</div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">gmail_search</span><span class="tool__badge">auto</span></div></div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">get_contact</span><span class="tool__badge">auto</span></div></div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">gmail_send</span><span class="tool__badge tool__badge--ask">asks</span></div>' +
      '<div class="tool__row"><span class="tool__btn">Deny</span><span class="tool__btn tool__btn--go">Allow</span></div></div>' },
    { title: "Memory", state: "+3 facts", html:
      '<div class="tool"><div class="tool__top"><span class="tool__name">save_memory</span><span class="tool__badge tool__badge--ask">asks</span></div>' +
      '<div class="mono" style="font-size:10.5px;color:var(--ink-2);line-height:1.7">priya · prefers Friday deadlines<br>pricing · v3 is current<br>bengaluru · intro still open</div></div>' +
      '<div class="bub bub--it">Noted. I compacted 40 older turns to keep room.</div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">autocompact</span><span class="tool__badge">auto</span></div>' +
      '<div class="mono" style="font-size:10.5px;color:var(--ink-2)">context 38% &rarr; 12%</div></div>' },
    { title: "Background", state: "3 running", html:
      '<div class="tool"><div class="tool__top"><span class="tool__name">agent · inbox-triage</span><span class="tool__badge">running</span></div><div class="mono" style="font-size:10.5px;color:var(--ink-2)">every 30 min · 24 sorted</div></div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">agent · repo-watch</span><span class="tool__badge">running</span></div><div class="mono" style="font-size:10.5px;color:var(--ink-2)">on push · 2 reviews queued</div></div>' +
      '<div class="tool"><div class="tool__top"><span class="tool__name">agent · digest</span><span class="tool__badge">running</span></div><div class="mono" style="font-size:10.5px;color:var(--ink-2)">daily 07:00 · next in 9h</div></div>' +
      '<div class="bub bub--it">I\'ll only interrupt if something needs you.</div>' }
  ];
  var scrBody = document.getElementById("scrBody"), scrTitle = document.getElementById("scrTitle"), scrState = document.getElementById("scrState");
  function paint(i) { var s = SCREENS[i]; if (!s || !scrBody) return; scrTitle.textContent = s.title; scrState.textContent = s.state; scrBody.innerHTML = s.html; }
  function swapTo(i) { if (!scrBody) return; if (reduced) { paint(i); return; } scrBody.classList.add("is-fading"); setTimeout(function () { paint(i); scrBody.classList.remove("is-fading"); }, 190); }
  paint(0);
  wireAcc(document.getElementById("acc"), swapTo);
  wireAcc(document.getElementById("faqAcc"), null);

  /* ── sequenced transcript reveal for the static phones (hero, permission) ──
     The accordion phone (#scrBody) keeps its own crossfade swap; sequencing it
     too would read as busy. .seq is only applied when motion is allowed, so
     reduced-motion users always get the full transcript at once. */
  if (!reduced && "IntersectionObserver" in window) {
    var seqBodies = [].slice.call(document.querySelectorAll(".phone__body")).filter(function (b) { return b.id !== "scrBody"; });
    seqBodies.forEach(function (body) {
      [].slice.call(body.children).forEach(function (k, i) { k.style.setProperty("--si", i); });
      body.classList.add("seq");
    });
    var seqIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seq-go"); seqIo.unobserve(e.target); } });
    }, { threshold: 0.3 });
    seqBodies.forEach(function (b) { seqIo.observe(b); });
  }

  /* ── architecture map — real subsystems, animated edges ── */
  var NODES = [
    { id:"01", t:"Query engine", p:"core/QueryEngine.ts", x:.5,  y:.5,  hub:true },
    { id:"02", t:"Permission gate", p:"permissions/canUseTool.ts", x:.5,  y:.14 },
    { id:"03", t:"Tool registry", p:"tools/ · toolsearch/", x:.83, y:.28 },
    { id:"04", t:"Memory manager", p:"memory/manager.ts", x:.87, y:.68 },
    { id:"05", t:"Compaction", p:"agent/compaction/", x:.62, y:.88 },
    { id:"06", t:"LLM router", p:"llm/router.ts", x:.34, y:.9 },
    { id:"07", t:"Scheduler", p:"scheduler/heartbeat.ts", x:.12, y:.66 },
    { id:"08", t:"Coordinator", p:"agent/coordinator/", x:.14, y:.28 },
    { id:"09", t:"MCP client", p:"agent/mcp/", x:.5,  y:.32 }
  ];
  var EDGES = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[3,4],[2,8]];
  var mapNodes = document.getElementById("mapNodes"), mapList = document.getElementById("mapList"), mapCv = document.getElementById("mapCv"), mapWrap = document.getElementById("map");
  if (mapNodes) {
    NODES.forEach(function (n) {
      var el = document.createElement("div");
      el.className = "mnode" + (n.hub ? " mnode--hub" : "");
      el.style.left = (n.x * 100) + "%"; el.style.top = (n.y * 100) + "%";
      el.innerHTML = '<span class="mnode__id">' + n.id + '</span><span class="mnode__t">' + n.t + '</span><span class="mnode__p">' + n.p + '</span>';
      mapNodes.appendChild(el);
      if (mapList) { var c = document.createElement("div"); c.className = "map__cell"; c.innerHTML = '<span class="mnode__id">' + n.id + '</span><span class="mnode__t">' + n.t + '</span><span class="mnode__p">' + n.p + '</span>'; mapList.appendChild(c); }
    });
  }
  if (mapCv && mapWrap) {
    var mctx = mapCv.getContext("2d"), mt0 = performance.now(), mraf = null, visible = false, hoverIdx = -1;
    var adj = NODES.map(function (_, i) { var s = {}; EDGES.forEach(function (e) { if (e[0] === i) s[e[1]] = 1; if (e[1] === i) s[e[0]] = 1; }); return s; });
    function msize() { var dpr = Math.min(window.devicePixelRatio || 1, 2); mapCv.width = mapWrap.clientWidth * dpr; mapCv.height = mapWrap.clientHeight * dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function mdraw(now) {
      var w = mapWrap.clientWidth, h = mapWrap.clientHeight, time = reduced ? 0 : (now - mt0) / 1000;
      mctx.clearRect(0, 0, w, h);
      var cs = getComputedStyle(root);
      var line = cs.getPropertyValue("--line-2").trim() || "#E2E2E4";
      var accent = cs.getPropertyValue("--accent").trim() || "#2E49E6";
      var someHover = hoverIdx >= 0;
      EDGES.forEach(function (e, idx) {
        var a = NODES[e[0]], b = NODES[e[1]];
        var x1 = a.x * w, y1 = a.y * h, x2 = b.x * w, y2 = b.y * h;
        var touches = someHover && (e[0] === hoverIdx || e[1] === hoverIdx);
        mctx.strokeStyle = touches ? accent : line;
        mctx.globalAlpha = someHover ? (touches ? 1 : 0.22) : 1;
        mctx.lineWidth = touches ? 1.6 : 1;
        mctx.beginPath(); mctx.moveTo(x1, y1); mctx.lineTo(x2, y2); mctx.stroke();
        mctx.globalAlpha = 1; mctx.lineWidth = 1;
        // pulses travel all edges normally; while hovering, only the touched ones
        if (!reduced && (!someHover || touches)) {
          var tt = ((time * 0.28 + idx * 0.13) % 1);
          var px = x1 + (x2 - x1) * tt, py = y1 + (y2 - y1) * tt;
          mctx.globalAlpha = Math.sin(tt * Math.PI); mctx.fillStyle = accent;
          mctx.beginPath(); mctx.arc(px, py, 2.4, 0, Math.PI * 2); mctx.fill(); mctx.globalAlpha = 1;
        }
      });
      if (!reduced && visible) mraf = requestAnimationFrame(mdraw);
    }
    window.__redrawMap = function () { msize(); mdraw(performance.now()); };

    // hover a node → highlight the connectors touching it, dim the rest
    var mnodeEls = [].slice.call(mapNodes.querySelectorAll(".mnode"));
    mnodeEls.forEach(function (el, i) {
      el.addEventListener("mouseenter", function () {
        hoverIdx = i;
        mnodeEls.forEach(function (o, j) { o.classList.toggle("is-dim", j !== i && !adj[i][j]); });
        if (reduced) mdraw(performance.now());
      });
      el.addEventListener("mouseleave", function () {
        hoverIdx = -1;
        mnodeEls.forEach(function (o) { o.classList.remove("is-dim"); });
        if (reduced) mdraw(performance.now());
      });
    });

    msize(); mdraw(performance.now());
    window.addEventListener("resize", function () { msize(); if (reduced) mdraw(performance.now()); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible = e.isIntersecting; if (visible && !reduced) { if (!mraf) mraf = requestAnimationFrame(mdraw); } else if (mraf) { cancelAnimationFrame(mraf); mraf = null; } });
    }, { threshold: 0 }).observe(mapWrap);
  }

  /* ── screens carousel: coverflow, self-advancing ──
     The reference is arrows-only. Ours keeps the arrows and adds a timer, so a
     reader who never touches it still sees every screen; the timer stops on
     hover, on keyboard focus, and whenever the section is off screen, so it is
     never animating against someone who is reading or out of view.

     Offset is measured the short way round the ring, so slide 0 sits next to
     slide n-1 rather than travelling the whole row back — that is what lets the
     carousel loop without a visible rewind. Only ±2 are drawn; anything further
     is parked at zero opacity behind the stack. */
  var pcar = document.getElementById("pcar");
  if (pcar) {
    var pslides = [].slice.call(pcar.querySelectorAll(".pslide"));
    var pn = pslides.length;
    if (pn) {
      var pi = 0, ptimer = null, pvis = true, phover = false, pfocus = false;
      /* 1.34 phone-widths apart. Percentages resolve against the slide's own
         unscaled width, and CSS applies scale before translate, so the gap stays
         even however the flanking phones are sized. */
      var PSTEP = 134;
      var PHOLD = 4200;

      function pdraw() {
        pslides.forEach(function (s, k) {
          var o = k - pi;
          if (o > pn / 2) o -= pn;
          if (o < -pn / 2) o += pn;
          var a = Math.abs(o);
          s.style.transform = "translate3d(" + (o * PSTEP) + "%,0,0) scale(" + (a ? 0.8 : 1) + ")";
          s.style.opacity = a === 0 ? "1" : a === 1 ? ".2" : a === 2 ? ".1" : "0";
          s.style.zIndex = String(10 - a);
          s.style.pointerEvents = a ? "none" : "auto";
          /* Only the phone in focus is readable, so the rest are hidden from
             assistive tech rather than read out as a wall of duplicate alts. */
          s.setAttribute("aria-hidden", a ? "true" : "false");
        });
      }

      function pgo(d) {
        pi = (pi + d + pn) % pn;
        pdraw();
      }

      function pstop() {
        if (ptimer) { clearInterval(ptimer); ptimer = null; }
      }

      function pstart() {
        pstop();
        if (reduced || !pvis || phover || pfocus) return;
        ptimer = setInterval(function () { pgo(1); }, PHOLD);
      }

      pcar.querySelectorAll(".pcar__b").forEach(function (b) {
        b.addEventListener("click", function () {
          pgo(parseInt(b.getAttribute("data-dir"), 10));
          /* Restart the clock on a manual move, so the next auto-advance is a
             full interval away rather than whatever was left on the old one. */
          pstart();
        });
      });

      pcar.addEventListener("mouseenter", function () { phover = true; pstop(); });
      pcar.addEventListener("mouseleave", function () { phover = false; pstart(); });

      /* Only a focus RING pauses, not focus itself. Clicking an arrow focuses it,
         and treating that as "someone is reading" left the carousel parked for
         good after a single click — the one interaction most likely to happen. */
      pcar.addEventListener("focusin", function (e) {
        pfocus = !!(e.target.matches && e.target.matches(":focus-visible"));
        pstart();
      });
      pcar.addEventListener("focusout", function () { pfocus = false; pstart(); });

      pdraw();
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { pvis = e.isIntersecting; if (pvis) pstart(); else pstop(); });
        }, { threshold: 0 }).observe(pcar);
      } else {
        pstart();
      }
    }
  }

  /* ── footer wordmark parallax — barely perceptible drift as it scrolls past ── */
  var ghost = document.getElementById("footGhost");
  if (ghost && !reduced) {
    onScrub(function () {
      var r = ghost.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var prog = (window.innerHeight - r.top) / (window.innerHeight + r.height); // 0..1
      var y = Math.max(-18, Math.min(18, (prog - 0.5) * 36));
      ghost.style.transform = "translateY(" + y.toFixed(1) + "px)";
    });
  }
})();
