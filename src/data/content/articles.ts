import type { Article, Locale } from "@/lib/types";

const articlesContent: Omit<Article, 'title' | 'description' | 'content'>[] = [
  {
    slug: 'shirudo-signed-ebpf-lab',
    tags: ["Lab", "Security", "eBPF", "GitHub Actions"],
    date: '2026-11-26',
    author: 'Thomas Vignoli',
  },
  {
    slug: 'ipv6-firewall-locked-out-lan-case-study',
    tags: ["Case study", "IPv6", "nftables", "Homelab"],
    date: '2026-11-05',
    author: 'Thomas Vignoli',
  },
  {
    slug: 'defense-in-depth-behind-a-consumer-router',
    tags: ["Security", "Networking", "IPv6", "Homelab"],
    date: '2026-11-05',
    author: 'Thomas Vignoli',
  },
  {
    slug: 'silent-failures-alerting-that-notices',
    tags: ["Observability", "Alerting", "Reliability", "Homelab"],
    date: '2026-11-05',
    author: 'Thomas Vignoli',
  },
  {
    slug: 'react2shell-scan-case-study',
    tags: ['Case study', 'Next.js', 'WAF', 'Incident response'],
    date: '2026-11-05',
    author: 'Thomas Vignoli',
  },
  {
    slug: 'x402-agent-native-api-monetization',
    tags: ['x402', 'Monetization', 'Cloudflare', 'AI Agents'],
    date: '2026-07-08',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/x402.svg',
    imageHint: 'x402 http 402 agent micropayment flow',
  },
  {
    slug: 'finops-kubernetes-cost-optimization',
    tags: ['FinOps', 'Kubernetes', 'Cost'],
    date: '2025-06-05',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/finops.svg',
    imageHint: 'cloud cost optimization chart',
  },
  {
    slug: 'platform-engineering-gitops-argocd',
    tags: ['GitOps', 'Argo CD', 'Platform Engineering'],
    date: '2025-05-14',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/gitops.svg',
    imageHint: 'gitops reconciliation loop',
  },
  {
    slug: 'devsecops-supply-chain-security',
    tags: ['DevSecOps', 'Supply Chain', 'Sigstore'],
    date: '2025-04-08',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/security.svg',
    imageHint: 'software supply chain security shield',
  },
  {
    slug: 'slo-driven-observability',
    tags: ['Observability', 'SLO', 'Prometheus'],
    date: '2025-03-10',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/observability.svg',
    imageHint: 'observability metrics dashboard',
  },
  {
    slug: 'llmops-serving-llms-in-production',
    tags: ['LLMOps', 'AI', 'Cost'],
    date: '2025-02-18',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/ai.svg',
    imageHint: 'llm serving neural network',
  },
  {
    slug: 'kubernetes-autoscaling-hpa-keda',
    tags: ['Kubernetes', 'Autoscaling', 'KEDA'],
    date: '2025-01-20',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/kubernetes.svg',
    imageHint: 'kubernetes autoscaling pods',
  },
  {
    slug: 'aws-rag-etl-pipeline',
    tags: ['AWS', 'RAG', 'AI'],
    date: '2024-09-15',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/ai.svg',
    imageHint: 'rag etl pipeline diagram',
  },
  {
    slug: 'infrastructure-as-code-guide',
    tags: ['IaC', 'Terraform'],
    date: '2024-08-30',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/iac.svg',
    imageHint: 'infrastructure as code terraform',
  },
  {
    slug: 'github-actions-vs-vercel-ci',
    tags: ['CI/CD', 'GitHub Actions'],
    date: '2024-07-12',
    author: 'Thomas Vignoli',
    imageUrl: '/images/articles/cicd.svg',
    imageHint: 'ci cd pipeline stages',
  },
];

const translations: Record<string, Record<Locale, Pick<Article, 'title' | 'description' | 'content' | 'caseStudy'>>> = {
  'shirudo-signed-ebpf-lab': {
    en: {
      "title": "Signed eBPF: even root can't load it",
      "description": "A hands-on lab with shirudo: why signing eBPF is harder than it looks, how a TPM keeps a record root can't rewrite, and one public run that shows every step.",
      "content": [
        {
          "type": "heading",
          "level": 2,
          "content": "An attacker with root"
        },
        {
          "type": "paragraph",
          "content": "Picture an attacker who got root on a Linux server. Many of the defences on that server are eBPF programs: small programs that runtime security agents, network policy and auditing tools load into the running kernel. Whoever can load eBPF can load their own programs too, or detach yours. The guards take orders from root, and root is now the attacker."
        },
        {
          "type": "paragraph",
          "content": "Here is root on an ordinary Ubuntu kernel, a GitHub Actions runner, loading the smallest valid eBPF program with a raw `bpf()` system call. Two instructions, `r0 = 0; exit`, and no signature:"
        },
        {
          "type": "code",
          "language": "python",
          "filename": "unsigned-load.py (excerpt)",
          "code": "# r0 = 0; exit -- the smallest valid eBPF program, no signature\ninsns = struct.pack(\"<BBhiBBhi\", 0xb7, 0, 0, 0, 0x95, 0, 0, 0)\n# bpf_attr: prog_type=SOCKET_FILTER, insn_cnt=2, insns, license\nstruct.pack_into(\"<IIQQ\", attr, 0, 1, 2, addressof(insns), addressof(lic))\nfd = libc.syscall(NR_BPF, BPF_PROG_LOAD, attr, 128)"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "runner, stock kernel",
          "code": "runner$ sudo python3 unsigned-load.py\nkernel 7.0.0-1016-aws, uid 0\nbpf(BPF_PROG_LOAD, unsigned): loaded, fd 4"
        },
        {
          "type": "paragraph",
          "content": "Accepted, no questions asked: the kernel is a very polite host. The rest of this article is about a kernel where the same call fails, and about how someone outside the server can check that it does."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The map: three questions"
        },
        {
          "type": "paragraph",
          "content": "[shirudo](https://shirudo.dev/) is a pre-release open-source project that answers three separate questions. Keeping them apart makes everything else easier to follow."
        },
        {
          "type": "list",
          "items": [
            "What may the kernel load? Only programs signed with the operator's key. This is signing.",
            "What has been loaded? Every load is recorded in the TPM, a chip that can add to a record but never rewrite it. This is measurement.",
            "How does someone outside know? The TPM signs that record on request, and a remote verifier checks it. This is attestation."
          ],
          "ordered": true
        },
        {
          "type": "paragraph",
          "content": "Two roles appear throughout. The operator is the machine that holds the signing key and builds programs. The target is the server being protected. In this lab both live on one GitHub runner: the operator is the runner itself, the target is a QEMU virtual machine with a software TPM."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Concept 1: why you can't just sign the .o file"
        },
        {
          "type": "paragraph",
          "content": "The obvious idea is to compile the eBPF program, sign the object file and have the kernel check the signature. If that worked, this would be a much shorter article. It doesn't, because the bytes the kernel finally receives are not the bytes you compiled."
        },
        {
          "type": "paragraph",
          "content": "The loader library, libbpf, rewrites the program on the target machine. It patches in the file descriptors of the program's maps, which differ on every run, and adjusts structure offsets to the running kernel's layout (CO-RE, \"compile once, run everywhere\"). The [kernel documentation](https://docs.kernel.org/bpf/signing.html) says it plainly: there is no fixed byte string that is both signable at build time and what the kernel actually loads."
        },
        {
          "type": "paragraph",
          "content": "The fix is to sign something that doesn't change: a small loader program with the real programs packed into its data. The kernel checks one signature over the loader and its data, and the trusted loader then does the machine-specific rewriting from inside the kernel. Alexei Starovoitov, one of the BPF maintainers, [compares it](https://lwn.net/Articles/1042625/) to a signed self-extracting archive: you don't sign each file as it lands on disk, you sign the archive and trust what it unpacks."
        },
        {
          "type": "paragraph",
          "content": "shirudo adds a BPF LSM program. An LSM (Linux Security Module) hook is a point in the kernel that can say no, and this one refuses every load from userspace that isn't such a signed loader. shirudo calls a signed bundle like this an upatch."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Concept 2: a record root can't rewrite"
        },
        {
          "type": "paragraph",
          "content": "Refusing unsigned loads is half the story. An operator also wants to know what a server is running, and the server's own answer is worth little if root controls it: \"status: ok\" is exactly what an attacker would print, right before getting back to work."
        },
        {
          "type": "paragraph",
          "content": "A TPM register can't be set to a value, only extended: new value = SHA-256(old value + event). Think of a ledger where every page carries the fingerprint of the page before: you can tear a page out, but you can't hide the tear. The final value depends on every event and on their order, and no event can be taken out afterwards. shirudo keeps its own register in the TPM, starts it from zero at every boot and extends it after each load or unload. If the recording fails, the load is undone."
        },
        {
          "type": "paragraph",
          "content": "A hash doesn't say what was loaded, so beside the register shirudo keeps an event log in plain text. On its own the log proves nothing. It becomes trustworthy when replaying it from zero gives exactly the register's value."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Concept 3: a signed snapshot with a date on it"
        },
        {
          "type": "paragraph",
          "content": "To prove the register's value to someone else, the TPM produces a quote: the values signed with an attestation key that never leaves the chip. The verifier first sends a random nonce, and the TPM includes it in what it signs. A quote is a photo of the register with today's newspaper in the frame, the oldest trick in every kidnapping film, so an old photo can't be passed off as a new one."
        },
        {
          "type": "paragraph",
          "content": "The verifier checks the signature and the nonce, replays the event log, and compares the result with what it expects from the upatches it signed itself."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The lab, step by step"
        },
        {
          "type": "paragraph",
          "content": "Every output below comes from [one public GitHub Actions run](https://github.com/0xtvignoli/my_devfolio/actions/runs/45851839881). `operator$` commands run on the runner; `target#` commands run as root inside the shirudo VM."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Step 1: the same load, refused"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "shirudo target",
          "code": "target# python3 unsigned-load.py\nkernel 7.4-shirudo-ci-20261123, uid 0\nbpf(BPF_PROG_LOAD, unsigned): refused, EACCES (Permission denied)"
        },
        {
          "type": "paragraph",
          "content": "What just happened: same user, same two instructions, same system call. Only the kernel changed. On the target, shirudo's LSM refused the load because it wasn't a signed loader, and EACCES is that refusal."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Step 2: root can't touch shirudo either"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "shirudo target",
          "code": "target# shirudo status\nStatus:                ok\n  LsmAttached        OK      lsm/bpf link present and pinned\n  KeyringSealed      OK      bpf serial 183078568, dm-verity serial 287240165, pins match\n  ChainIntact        OK      live register equals the eventlog replay\n\ntarget# /usr/local/bin/shirudo status\nshirudo: image state: Permission denied\n\ntarget# cat /run/shirudo/bpffs/tamper\ncat: /run/shirudo/bpffs/tamper: Permission denied"
        },
        {
          "type": "paragraph",
          "content": "What just happened: the first command is the trusted shirudo binary, and it reports enforcement active, the signing keyring sealed and the register consistent with its log. The second is a byte-for-byte copy of the same binary, and it is refused. The third is root trying to read shirudo's own BPF maps, also refused."
        },
        {
          "type": "paragraph",
          "content": "Access to shirudo's state depends on where the binary was executed from (a read-only runtime image whose integrity the kernel checks), not on who runs it or what the file contains. Copying the binary doesn't copy the authority."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Step 3: a signed upatch loads and is recorded"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "operator and target",
          "code": "operator$ shirudo build testing/fixtures/basic.bpf.c --keys-dir \"$KEYS\" \\\n            --vmlinux vendor/linux/vmlinux.h -o basic.upatch\n\ntarget# shirudo upatch load basic.upatch\nupatch load: signed loader accepted, keyring 183078568, 124 instructions\nupatch load: loader ran, 0 maps and 1 programs\nupatch load: program 0 (fentry) pinned at /run/shirudo/bpffs/upatches/basic/link\nupatch load: basic loaded, 1 programs, keyring 183078568\nupatch load: basic measured, register 4a7faba4e8b562b761465799104beae6d40029eac7253616cb8248e3139287fb"
        },
        {
          "type": "paragraph",
          "content": "What just happened: the operator compiled a small program that runs at the entry of a kernel function, and signed it with its key. On the target the kernel checked the signature against a sealed keyring, the loader unpacked the program, and before reporting success shirudo extended the register. The last line is the register's new value."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Step 4: proving it from outside"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "operator and target (excerpt)",
          "code": "target#   shirudo attest --nonce=<nonce> --output=/mnt/shirudo-out/ev.json\noperator$ shirudo attest verify --evidence=\"$EV\" --nonce=\"$NONCE\" \\\n            --ak-name=\"$(jq -r .ak.name \"$EV\")\" --expect-chain=<register-after-events>\n  OK    nonce matches the request\n  OK    attestation key: restricted, fixed to this TPM\n  OK    quote: ECDSA signature by the attestation key\n  OK    quote: carries the nonce\n  OK    register: certified contents match the listed value\n  OK    eventlog: 2 records replay to the certified value\n  OK    state: register equals the expected value\n  NOTE  event after boot: upatch_load basic\nverdict: ok"
        },
        {
          "type": "paragraph",
          "content": "What just happened: the operator sent a fresh nonce, and the target's TPM returned a quote, a signed copy of the register and the event log. The verifier confirmed the key belongs to this TPM, checked signatures and nonce, replayed two log records (the boot and the upatch load) to the certified value, and found the register equal to what it predicted. If root had loaded anything else or edited the log, one of these lines would fail."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Run it yourself"
        },
        {
          "type": "paragraph",
          "content": "The [workflow](https://github.com/0xtvignoli/my_devfolio/blob/main/.github/workflows/shirudo-quickstart.yml) pins a shirudo commit, downloads shirudo's test kernel from its public release and verifies its checksum, prepares the host with shirudo's own CI scripts, and runs the quickstart by executing the command blocks from its documentation, so the docs and the proof can't drift apart. Transcript, environment and VM console are kept as artifacts. A cold run takes about 11 minutes."
        },
        {
          "type": "list",
          "items": [
            "GitHub Actions, `ubuntu-latest`: hosted Linux runners expose `/dev/kvm`. Public and free for public repositories. Used here.",
            "Oracle Cloud VMs: standard shapes, Ampere A1 included, don't offer nested virtualisation, so there is no QEMU target. Making the VM itself the target, with the test kernel and a vTPM, is a different and harder lab.",
            "Your own machine or WSL2: works if your user can open `/dev/kvm`. Fastest for experimenting, but the evidence stays local."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Limits"
        },
        {
          "type": "list",
          "items": [
            "The kernel is patched. The lab runs a bpf-next 7.4 kernel with shirudo's patches. Signed BPF loaders reached mainline in Linux 6.18, but LSM maintainers still dispute the design, and shirudo needs hooks mainline doesn't have.",
            "The TPM is simulated (swtpm), and QEMU boots the kernel directly instead of from a signed, measured kernel image. The attestation flow is real; the hardware root of trust is not.",
            "shirudo is pre-release, with no tagged version yet.",
            "The signing key becomes the boundary. Whoever holds it can load anything. The design moves trust from root on every server to one key that never needs to be on a server."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A note from the lab"
        },
        {
          "type": "paragraph",
          "content": "The first three runs never reached the quickstart. Building the target image runs `apt` inside a helper VM (libguestfs), and it couldn't resolve a single hostname. shirudo's own CI never sees this, because it restores that image from cache."
        },
        {
          "type": "paragraph",
          "content": "I guessed twice, first the runner's DNS stub and then the kernel, and each wrong guess cost a ten-minute run. What worked was measuring where the failure happened: a probe inside the real image, trying one resolver at a time. Through passt, the network backend libguestfs uses without root, [nothing answered](https://github.com/0xtvignoli/my_devfolio/actions/runs/45580976661). Through QEMU's built-in user networking, [everything did](https://github.com/0xtvignoli/my_devfolio/actions/runs/45582033906). The fix is a fake `passt` that makes libguestfs fall back, the same trick shirudo applies when it runs as root. Measure before you guess."
        }
      ]
    },
    it: {
      "title": "eBPF firmato: root non passa",
      "description": "Root su un server Linux, un programma eBPF di due istruzioni, nessuna firma: il kernel lo carica e ringrazia. Con shirudo la stessa chiamata prende EACCES, e un TPM tiene un registro che root non può riscrivere. Tutto provato su un run pubblico di GitHub Actions.",
      "content": [
        {
          "type": "heading",
          "level": 2,
          "content": "Root ce l'ha l'attaccante"
        },
        {
          "type": "paragraph",
          "content": "Un attaccante ha preso root su un server Linux. Bene, adesso guarda le difese. Molte sono programmi eBPF: piccoli programmi che agenti di sicurezza, policy di rete e strumenti di audit caricano nel kernel in esecuzione. Chi può caricare eBPF carica anche i suoi, o stacca i tuoi. Le guardie prendono ordini da root. E root, adesso, è lui."
        },
        {
          "type": "paragraph",
          "content": "Ecco root su un kernel Ubuntu qualunque, un runner GitHub Actions, che carica il più piccolo programma eBPF valido con una chiamata `bpf()` diretta. Due istruzioni, `r0 = 0; exit`. Zero firme:"
        },
        {
          "type": "code",
          "language": "python",
          "filename": "unsigned-load.py (estratto)",
          "code": "# r0 = 0; exit -- the smallest valid eBPF program, no signature\ninsns = struct.pack(\"<BBhiBBhi\", 0xb7, 0, 0, 0, 0x95, 0, 0, 0)\n# bpf_attr: prog_type=SOCKET_FILTER, insn_cnt=2, insns, license\nstruct.pack_into(\"<IIQQ\", attr, 0, 1, 2, addressof(insns), addressof(lic))\nfd = libc.syscall(NR_BPF, BPF_PROG_LOAD, attr, 128)"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "runner, kernel standard",
          "code": "runner$ sudo python3 unsigned-load.py\nkernel 7.0.0-1016-aws, uid 0\nbpf(BPF_PROG_LOAD, unsigned): loaded, fd 4"
        },
        {
          "type": "paragraph",
          "content": "Accettato. Nessuna domanda. Il kernel è un padrone di casa molto educato. Il resto dell'articolo parla di un kernel dove la stessa chiamata fallisce, e di come chi sta fuori dal server può verificarlo."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "La mappa: tre domande"
        },
        {
          "type": "paragraph",
          "content": "[shirudo](https://shirudo.dev/) è un progetto open source, ancora pre-release, che risponde a tre domande diverse. Tienile separate e il resto fila liscio."
        },
        {
          "type": "list",
          "items": [
            "Cosa può caricare il kernel? Solo programmi firmati con la chiave dell'operatore. È la firma.",
            "Cosa è stato caricato? Ogni caricamento finisce nel TPM, un chip che può aggiungere a un registro ma mai riscriverlo. È la misura.",
            "Come lo sa chi sta fuori? Il TPM firma quel registro su richiesta, e un verificatore remoto lo controlla. È l'attestazione."
          ],
          "ordered": true
        },
        {
          "type": "paragraph",
          "content": "Due ruoli ti accompagnano per tutto l'articolo. L'operatore è la macchina che tiene la chiave di firma e compila i programmi. Il target è il server da proteggere. In questo laboratorio stanno tutti e due su un runner GitHub: l'operatore è il runner stesso, il target è una VM QEMU con un TPM software."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Concetto 1: firmare il .o non basta"
        },
        {
          "type": "paragraph",
          "content": "L'idea ovvia: compili il programma eBPF, firmi il file oggetto, il kernel controlla la firma. Se funzionasse, questo articolo sarebbe lungo tre righe. Non funziona. I byte che arrivano al kernel non sono quelli che hai compilato."
        },
        {
          "type": "paragraph",
          "content": "libbpf, la libreria che carica il programma, lo riscrive sulla macchina target. Ci infila i descrittori delle mappe, diversi a ogni esecuzione, e adatta gli offset delle strutture al layout del kernel che gira (CO-RE, \"compile once, run everywhere\"). La [documentazione del kernel](https://docs.kernel.org/bpf/signing.html) è chiara: non esiste una sequenza di byte firmabile in compilazione che sia anche quella che il kernel carica davvero."
        },
        {
          "type": "paragraph",
          "content": "La soluzione: firma qualcosa che non cambia. Un piccolo loader con i programmi veri impacchettati nei suoi dati. Il kernel verifica la firma su loader e dati, poi il loader fidato fa le riscritture specifiche della macchina da dentro il kernel. Alexei Starovoitov, uno dei maintainer di BPF, lo [paragona](https://lwn.net/Articles/1042625/) a un archivio autoestraente firmato: non firmi ogni file che arriva sul disco, firmi l'archivio e ti fidi di quello che estrae."
        },
        {
          "type": "paragraph",
          "content": "shirudo ci aggiunge un programma BPF LSM. Un hook LSM (Linux Security Module) è un punto del kernel che può dire di no. Questo dice di no a ogni caricamento da userspace che non sia un loader firmato di questo tipo. shirudo chiama upatch un pacchetto firmato così."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Concetto 2: un registro che root non riscrive"
        },
        {
          "type": "paragraph",
          "content": "Rifiutare i caricamenti non firmati è metà del lavoro. L'operatore vuole anche sapere cosa gira su un server, e la parola del server vale poco se root lo controlla. \"status: ok\" è esattamente quello che stamperebbe un attaccante. Prima di tornare al lavoro."
        },
        {
          "type": "paragraph",
          "content": "Un registro del TPM non lo imposti a un valore. Lo puoi solo estendere: nuovo valore = SHA-256(vecchio valore + evento). Pensa a un libro mastro dove ogni pagina porta l'impronta della precedente: la pagina la strappi, lo strappo non lo nascondi. Il valore finale dipende da ogni evento e dal loro ordine, e nessun evento si toglie dopo. shirudo tiene un suo registro nel TPM, lo azzera a ogni avvio e lo estende dopo ogni caricamento o scaricamento. Se la registrazione fallisce, il caricamento salta."
        },
        {
          "type": "paragraph",
          "content": "Un hash non ti dice cosa è stato caricato. Per questo accanto al registro shirudo tiene un registro eventi in chiaro. Da solo non prova niente. Diventa affidabile quando, ripercorrendolo da zero, ottieni esattamente il valore del registro."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Concetto 3: la foto col giornale di oggi"
        },
        {
          "type": "paragraph",
          "content": "Per dimostrare il valore del registro a qualcun altro, il TPM produce un quote: i valori firmati con una chiave di attestazione che non esce mai dal chip. Il verificatore manda prima un nonce casuale, e il TPM lo mette dentro quello che firma. Un quote è una foto del registro con il giornale di oggi nell'inquadratura. Il trucco più vecchio di ogni film sui rapimenti. Una foto vecchia non passa per nuova."
        },
        {
          "type": "paragraph",
          "content": "Il verificatore controlla firma e nonce, ripercorre il registro eventi e confronta il risultato con quello che si aspetta dagli upatch che ha firmato lui."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Il laboratorio, passo per passo"
        },
        {
          "type": "paragraph",
          "content": "Ogni output qui sotto viene da [un unico run pubblico di GitHub Actions](https://github.com/0xtvignoli/my_devfolio/actions/runs/45851839881). I comandi `operator$` girano sul runner, i comandi `target#` girano da root dentro la VM con shirudo."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Passo 1: stesso caricamento, rifiutato"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "target shirudo",
          "code": "target# python3 unsigned-load.py\nkernel 7.4-shirudo-ci-20261123, uid 0\nbpf(BPF_PROG_LOAD, unsigned): refused, EACCES (Permission denied)"
        },
        {
          "type": "paragraph",
          "content": "Cosa è appena successo: stesso utente, stesse due istruzioni, stessa chiamata di sistema. È cambiato solo il kernel. Sul target l'LSM di shirudo ha rifiutato il caricamento perché non era un loader firmato. EACCES è quel no."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Passo 2: root non tocca nemmeno shirudo"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "target shirudo",
          "code": "target# shirudo status\nStatus:                ok\n  LsmAttached        OK      lsm/bpf link present and pinned\n  KeyringSealed      OK      bpf serial 183078568, dm-verity serial 287240165, pins match\n  ChainIntact        OK      live register equals the eventlog replay\n\ntarget# /usr/local/bin/shirudo status\nshirudo: image state: Permission denied\n\ntarget# cat /run/shirudo/bpffs/tamper\ncat: /run/shirudo/bpffs/tamper: Permission denied"
        },
        {
          "type": "paragraph",
          "content": "Cosa è appena successo: il primo comando è il binario fidato di shirudo, e riporta protezione attiva, keyring delle firme sigillato e registro coerente con il log. Il secondo è una copia identica byte per byte dello stesso binario. Rifiutata. Il terzo è root che prova a leggere le mappe BPF di shirudo. Rifiutato pure lui."
        },
        {
          "type": "paragraph",
          "content": "L'accesso allo stato di shirudo dipende da dove è stato eseguito il binario (un'immagine di runtime in sola lettura di cui il kernel verifica l'integrità), non da chi lo lancia né da cosa c'è nel file. Copi il binario, non copi l'autorità."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Passo 3: l'upatch firmato entra e finisce nel registro"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "operatore e target",
          "code": "operator$ shirudo build testing/fixtures/basic.bpf.c --keys-dir \"$KEYS\" \\\n            --vmlinux vendor/linux/vmlinux.h -o basic.upatch\n\ntarget# shirudo upatch load basic.upatch\nupatch load: signed loader accepted, keyring 183078568, 124 instructions\nupatch load: loader ran, 0 maps and 1 programs\nupatch load: program 0 (fentry) pinned at /run/shirudo/bpffs/upatches/basic/link\nupatch load: basic loaded, 1 programs, keyring 183078568\nupatch load: basic measured, register 4a7faba4e8b562b761465799104beae6d40029eac7253616cb8248e3139287fb"
        },
        {
          "type": "paragraph",
          "content": "Cosa è appena successo: l'operatore ha compilato un piccolo programma che gira all'ingresso di una funzione del kernel e l'ha firmato con la sua chiave. Sul target il kernel ha verificato la firma contro un keyring sigillato, il loader ha estratto il programma e, prima di dichiarare vittoria, shirudo ha esteso il registro. L'ultima riga è il nuovo valore."
        },
        {
          "type": "heading",
          "level": 3,
          "content": "Passo 4: dimostrarlo da fuori"
        },
        {
          "type": "code",
          "language": "console",
          "filename": "operatore e target (estratto)",
          "code": "target#   shirudo attest --nonce=<nonce> --output=/mnt/shirudo-out/ev.json\noperator$ shirudo attest verify --evidence=\"$EV\" --nonce=\"$NONCE\" \\\n            --ak-name=\"$(jq -r .ak.name \"$EV\")\" --expect-chain=<register-after-events>\n  OK    nonce matches the request\n  OK    attestation key: restricted, fixed to this TPM\n  OK    quote: ECDSA signature by the attestation key\n  OK    quote: carries the nonce\n  OK    register: certified contents match the listed value\n  OK    eventlog: 2 records replay to the certified value\n  OK    state: register equals the expected value\n  NOTE  event after boot: upatch_load basic\nverdict: ok"
        },
        {
          "type": "paragraph",
          "content": "Cosa è appena successo: l'operatore ha mandato un nonce nuovo, e il TPM del target ha risposto con un quote, una copia firmata del registro e il registro eventi. Il verificatore ha confermato che la chiave è di questo TPM, ha controllato firme e nonce, ha ripercorso due voci del log (l'avvio e il caricamento dell'upatch) fino al valore certificato, e ha trovato il registro uguale a quello previsto. Se root avesse caricato altro o ritoccato il log, una di queste righe salterebbe."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Rifallo tu"
        },
        {
          "type": "paragraph",
          "content": "Il [workflow](https://github.com/0xtvignoli/my_devfolio/blob/main/.github/workflows/shirudo-quickstart.yml) blocca un commit di shirudo, scarica il kernel di test dalla release pubblica di shirudo e ne verifica il checksum, prepara l'host con gli script CI di shirudo e lancia il quickstart eseguendo i blocchi di comandi della sua documentazione. Così documentazione e prova non possono divergere. Trascrizione, ambiente e console della VM restano come artifact. Un run da zero dura circa 11 minuti."
        },
        {
          "type": "list",
          "items": [
            "GitHub Actions, `ubuntu-latest`: i runner Linux ospitati espongono `/dev/kvm`. Pubblico e gratis per i repository pubblici. È quello usato qui.",
            "VM Oracle Cloud: le shape standard, Ampere A1 compresa, non danno la virtualizzazione annidata. Niente target QEMU. Usare la VM stessa come target, con il kernel di test e un vTPM, è un altro laboratorio. Più cattivo.",
            "La tua macchina o WSL2: va se il tuo utente può aprire `/dev/kvm`. È il modo più rapido per smanettare, ma le prove restano in locale."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "I limiti"
        },
        {
          "type": "list",
          "items": [
            "Il kernel è patchato. Il laboratorio usa un kernel bpf-next 7.4 con le patch di shirudo. I loader BPF firmati sono entrati nel kernel principale con Linux 6.18, ma i maintainer degli LSM ne contestano ancora il design, e shirudo ha bisogno di hook che il kernel principale non ha.",
            "Il TPM è simulato (swtpm), e QEMU avvia il kernel direttamente invece che da un'immagine firmata e misurata. Il flusso di attestazione è vero. La radice di fiducia hardware no.",
            "shirudo è pre-release. Nessuna versione taggata, per ora.",
            "Il confine diventa la chiave di firma. Chi ce l'ha carica quello che vuole. Il design sposta la fiducia da root su ogni server a una sola chiave che su un server non deve starci mai."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Una nota dal laboratorio"
        },
        {
          "type": "paragraph",
          "content": "I primi tre run il quickstart non l'hanno mai visto. La costruzione dell'immagine del target lancia `apt` dentro una VM di servizio (libguestfs), che non risolveva un nome che fosse uno. Il CI di shirudo non se ne accorge: quell'immagine la ripesca dalla cache."
        },
        {
          "type": "paragraph",
          "content": "Ho tirato a indovinare due volte, prima lo stub DNS del runner e poi il kernel. Ogni ipotesi sbagliata mi è costata un run da dieci minuti. Quello che ha funzionato è misurare dove si rompeva: una sonda dentro l'immagine vera, un resolver alla volta. Con passt, il backend di rete che libguestfs usa senza root, [non rispondeva nessuno](https://github.com/0xtvignoli/my_devfolio/actions/runs/45580976661). Con la rete user-mode integrata in QEMU, [rispondevano tutti](https://github.com/0xtvignoli/my_devfolio/actions/runs/45582033906). La fix è un finto `passt` che fa ripiegare libguestfs, lo stesso trucco che shirudo usa quando gira da root. Prima misuri, poi ipotizzi."
        }
      ]
    },
  },
  'ipv6-firewall-locked-out-lan-case-study': {
    en: {
      "title": "The IPv6 firewall that locked me out",
      "description": "A second line of defence for public IPv6 addresses, a parser that matched nothing, and why failing closed was the right way to be wrong.",
      "content": [
        {
          "type": "paragraph",
          "content": "On 5 November 2026 I rolled out a new firewall on the nodes of my homelab. Right after, SSH over IPv6 from my own LAN to those nodes timed out. The firewall was doing its job perfectly: it dropped everything it didn't recognise, and it didn't recognise my LAN."
        },
        {
          "type": "paragraph",
          "content": "This is the story of that lockout: why the nodes needed a second firewall at all, why it chose to lock me out instead of opening up, and the one-line parser bug behind it. Spoiler: for once it wasn't DNS. It was awk, and an assumption."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "With IPv6, every device has a door on the street"
        },
        {
          "type": "paragraph",
          "content": "In a typical IPv4 home, NAT hides everything. The router holds the one public address, and the devices behind it get private addresses the internet can't reach directly: a block of flats with a single front door and a concierge. IPv6 has enough addresses to drop that trick, so every device behind a modern consumer router gets public IPv6 addresses of its own. Every flat now has its own door on the street."
        },
        {
          "type": "paragraph",
          "content": "The only thing deciding what reaches those doors is the router's firewall. One wrong port-sharing rule and a whole node is on the internet. A single control that can fail on one click is exactly what defence in depth is for: stack independent controls, so that one mistake is not enough."
        },
        {
          "type": "paragraph",
          "content": "So each node got its own perimeter, built with nftables, the Linux kernel's packet-filtering framework and the successor to iptables. It is one table that accepts:"
        },
        {
          "type": "list",
          "items": [
            "established traffic, meaning replies to connections that are already open;",
            "ICMPv6, the control messages IPv6 needs to work at all;",
            "link-local addresses, which only work on the local segment and never cross a router;",
            "the on-link LAN prefixes (more on those next);",
            "the ports deliberately shared."
          ]
        },
        {
          "type": "paragraph",
          "content": "Everything else is dropped, with a rate-limited log line, so a port scan can't flood the journal."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Trust the prefix on the wire, not the whole delegation"
        },
        {
          "type": "paragraph",
          "content": "Where do the LAN prefixes come from? The ISP hands the router a block of IPv6 addresses, the delegated prefix, and the router carves it into smaller networks: one for the main LAN, one for the guest Wi-Fi. That is prefix delegation. The router then tells hosts about those networks in router advertisements (RA), small periodic messages that say \"this network exists, and here is how to reach it\"."
        },
        {
          "type": "paragraph",
          "content": "A prefix is on-link when it belongs to the segment the host is actually plugged into: the host reaches those addresses directly, without going through the router. The catch is that the router also announces its whole delegated prefix as reachable, and that prefix contains the guest network. Allowing the delegated prefix would have let guests in. Allowing only the on-link prefixes keeps them out, which is why the script reads them from the routing table instead of hard-coding them."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Right after the rollout, the LAN was locked out"
        },
        {
          "type": "paragraph",
          "content": "SSH over IPv6 from the LAN timed out. The table was there and correct in shape, but its allow list held only link-local. The script had found no LAN prefix at all, and applied the rules anyway."
        },
        {
          "type": "paragraph",
          "content": "That last part was on purpose."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Failing closed: lose a service, keep the perimeter"
        },
        {
          "type": "paragraph",
          "content": "A system fails closed when, unsure, it denies, and fails open when, unsure, it allows. A bank vault with a flat battery should stay shut; a fire exit with a flat battery should swing open. A firewall is a vault."
        },
        {
          "type": "paragraph",
          "content": "So if the prefixes are missing at boot, the script waits, then applies the table regardless. A firewall that opens up when it can't read its input is not a firewall. Failing closed cost an unreachable service on one protocol; failing open would have cost the perimeter."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Root cause: iproute2 doesn't print what you filtered on"
        },
        {
          "type": "paragraph",
          "content": "The prefixes come from `ip -6 route show dev <lan> proto ra`, which lists the routes on the LAN interface learned from router advertisements. The filter kept the lines carrying the `proto` field. But iproute2, the toolkit behind the `ip` command, omits from its output the fields you used as selectors: ask for `proto ra` and the lines no longer say `proto ra`. The filter matched nothing, every time."
        },
        {
          "type": "paragraph",
          "content": "In the snippet below, compare the two awk filters: the first hunts for a field that can never appear, the second keys on something that is always printed."
        },
        {
          "type": "code",
          "language": "bash",
          "filename": "perimetro6.sh",
          "code": "# Before: kept nothing. iproute2 omits the fields you select on,\n# so \"proto ra\" never appears in the output it is filtering.\nip -6 route show dev \"$LAN\" proto ra | awk '... $2 == \"proto\" ...'\n\n# After: on-link routes are the ones without a gateway.\nip -6 route show dev \"$LAN\" proto ra | awk '$2 != \"via\" && $1 ~ /\\// {print $1}'"
        },
        {
          "type": "paragraph",
          "content": "The fix selects on-link routes by what they lack: a gateway. A route with `via` goes through the router; a route without one is right there on the wire."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The mock agreed with me, and that was the bug"
        },
        {
          "type": "paragraph",
          "content": "I had tested the parser against a mock of the command's output, and the mock reproduced my assumption instead of the tool. A test that shares your misconception is just a second copy of it, and it will pass every time. The fix was checked against the real output of both nodes before going back out."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Lessons"
        },
        {
          "type": "list",
          "items": [
            "Test parsers against captured real output, never against what you believe the output looks like.",
            "Fail closed, but loudly: the empty allow list was in the journal from the first run.",
            "Keep a way back. The table only touches IPv6, so IPv4 access to every node was never at risk, and the fix was a pull and a rerun."
          ]
        }
      ],
      "caseStudy": {
        "facts": [
          {
            "label": "When",
            "value": "5 Nov 2026",
            "mono": true
          },
          {
            "label": "Change",
            "value": "nftables rollout · IPv6",
            "mono": true
          },
          {
            "label": "Impact",
            "value": "LAN clients lost IPv6 access to the nodes"
          },
          {
            "label": "Status",
            "value": "Fixed"
          }
        ],
        "timeline": [
          {
            "when": "rollout",
            "kind": "event",
            "title": "A second IPv6 firewall",
            "body": "Each node gets its own nftables table: accept the LAN prefixes learned from router advertisements, drop and log everything else."
          },
          {
            "when": "right after",
            "kind": "event",
            "title": "The LAN is locked out",
            "body": "SSH over IPv6 from the LAN times out. The table allows only link-local: no LAN prefix made it into the allow list."
          },
          {
            "when": "diagnosis",
            "kind": "decision",
            "title": "The parser matched nothing",
            "body": "iproute2 leaves out the fields you select on. The filter looked for a field the output never contains."
          },
          {
            "when": "fix",
            "kind": "event",
            "title": "Select on what is printed",
            "body": "On-link routes are the ones without a gateway. Checked against the real output of both nodes, then redeployed."
          }
        ]
      }
    },
    it: {
      "title": "Il firewall IPv6 che mi ha chiuso fuori",
      "description": "Un secondo firewall IPv6 sui nodi dell'homelab, un filtro awk che non trovava niente, e la LAN chiusa fuori. Perché fallire chiuso era il modo giusto di sbagliare.",
      "content": [
        {
          "type": "paragraph",
          "content": "5 novembre 2026. Metto in produzione un nuovo firewall sui nodi del mio homelab. Un attimo dopo, SSH in IPv6 dalla LAN verso quei nodi va in timeout. Il firewall faceva il suo lavoro alla perfezione: scartava tutto quello che non riconosceva. E non riconosceva la mia LAN."
        },
        {
          "type": "paragraph",
          "content": "Questa è la storia di quel blocco: perché i nodi avevano bisogno di un secondo firewall, perché ha preferito chiudermi fuori piuttosto che aprirsi, e il bug di una riga nel parser che c'era dietro. Spoiler: per una volta non era il DNS. Era awk. Più un'ipotesi sbagliata, la mia."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Con IPv6 ogni dispositivo ha la porta sulla strada"
        },
        {
          "type": "paragraph",
          "content": "In una casa IPv4 qualunque il NAT nasconde tutto. Il router ha l'unico indirizzo pubblico, i dispositivi dietro ricevono indirizzi privati che da internet non raggiungi: un condominio con un solo portone e il portiere. IPv6 di indirizzi ne ha abbastanza da fare a meno del trucco, quindi ogni dispositivo dietro un router consumer moderno si prende indirizzi IPv6 pubblici tutti suoi. Ogni appartamento ha la sua porta sulla strada."
        },
        {
          "type": "paragraph",
          "content": "A decidere cosa arriva a quelle porte c'è solo il firewall del router. Sbagli una condivisione di porte e un intero nodo finisce su internet. Un unico controllo che cede con un clic: è esattamente il caso per cui esiste la difesa in profondità. Impili controlli indipendenti, così un errore solo non basta."
        },
        {
          "type": "paragraph",
          "content": "Così ogni nodo si è preso il suo perimetro, fatto con nftables, il framework di filtraggio dei pacchetti del kernel Linux, erede di iptables. È una tabella che accetta:"
        },
        {
          "type": "list",
          "items": [
            "il traffico già stabilito, cioè le risposte a connessioni già aperte;",
            "ICMPv6, i messaggi di controllo senza cui IPv6 non sta in piedi;",
            "gli indirizzi link-local, validi solo sul segmento locale, che un router non lo attraversano mai;",
            "i prefissi on-link della LAN (ci arriviamo tra un attimo);",
            "le porte condivise apposta."
          ]
        },
        {
          "type": "paragraph",
          "content": "Tutto il resto finisce nel cestino, con una riga di log a frequenza limitata. Così un port scan non ti allaga il journal."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Fidati del prefisso sul filo, non della delega intera"
        },
        {
          "type": "paragraph",
          "content": "Da dove arrivano i prefissi della LAN? Il provider assegna al router un blocco di indirizzi IPv6, il prefisso delegato, e il router lo affetta in reti più piccole: una per la LAN principale, una per il Wi-Fi ospiti. Si chiama prefix delegation. Poi il router annuncia quelle reti agli host con i router advertisement (RA), piccoli messaggi periodici che dicono \"questa rete esiste, e ci arrivi così\"."
        },
        {
          "type": "paragraph",
          "content": "Un prefisso è on-link quando appartiene al segmento a cui l'host è attaccato col cavo: quegli indirizzi l'host li raggiunge diretto, senza passare dal router. Il problema: il router annuncia come raggiungibile anche l'intero prefisso delegato, e dentro c'è la rete ospiti. Ammetti il prefisso delegato e fai entrare gli ospiti. Ammetti solo gli on-link e restano fuori. Per questo lo script li legge dalla tabella di routing invece di scriverli a mano."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Rollout fatto, LAN chiusa fuori"
        },
        {
          "type": "paragraph",
          "content": "SSH in IPv6 dalla LAN va in timeout. La tabella c'è, ha la forma giusta, ma nella lista dei consentiti c'è solo il link-local. Lo script non aveva trovato nessun prefisso LAN. E aveva applicato le regole lo stesso."
        },
        {
          "type": "paragraph",
          "content": "Quest'ultima parte era voluta."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Fallire chiuso: perdi un servizio, tieni il perimetro"
        },
        {
          "type": "paragraph",
          "content": "Un sistema fallisce chiuso quando, nel dubbio, nega. Fallisce aperto quando, nel dubbio, lascia passare. Il caveau di una banca con la batteria scarica deve restare chiuso. L'uscita di sicurezza con la batteria scarica deve aprirsi. Un firewall è un caveau."
        },
        {
          "type": "paragraph",
          "content": "Quindi, se al boot i prefissi mancano, lo script aspetta e poi applica la tabella comunque. Un firewall che si spalanca quando non riesce a leggere i suoi input non è un firewall. È un tappeto. Fallire chiuso mi è costato un servizio irraggiungibile su un protocollo. Fallire aperto mi sarebbe costato il perimetro."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "La causa: iproute2 non stampa quello su cui filtri"
        },
        {
          "type": "paragraph",
          "content": "I prefissi arrivano da `ip -6 route show dev <lan> proto ra`, che elenca le rotte dell'interfaccia LAN imparate dai router advertisement. Il filtro teneva le righe con il campo `proto`. Ma iproute2, il pacchetto dietro il comando `ip`, toglie dall'output i campi che hai usato come selettori: chiedi `proto ra` e nelle righe `proto ra` non c'è più. Il filtro non trovava niente. Ogni volta."
        },
        {
          "type": "paragraph",
          "content": "Nel frammento qui sotto confronta i due filtri awk. Il primo cerca un campo che non può comparire mai. Il secondo si appoggia a qualcosa che viene stampato sempre."
        },
        {
          "type": "code",
          "language": "bash",
          "filename": "perimetro6.sh",
          "code": "# Before: kept nothing. iproute2 omits the fields you select on,\n# so \"proto ra\" never appears in the output it is filtering.\nip -6 route show dev \"$LAN\" proto ra | awk '... $2 == \"proto\" ...'\n\n# After: on-link routes are the ones without a gateway.\nip -6 route show dev \"$LAN\" proto ra | awk '$2 != \"via\" && $1 ~ /\\// {print $1}'"
        },
        {
          "type": "paragraph",
          "content": "Il fix riconosce le rotte on-link da quello che manca loro: un gateway. Una rotta con `via` passa dal router. Una senza è lì, direttamente sul filo."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "La simulazione mi dava ragione. Il bug era quello"
        },
        {
          "type": "paragraph",
          "content": "Avevo provato il parser su una simulazione dell'output del comando, e la simulazione riproduceva la mia ipotesi invece dello strumento. Un test che condivide il tuo equivoco è solo una seconda copia dell'equivoco. E passa sempre. Il fix l'ho verificato sull'output reale di entrambi i nodi prima di rimetterlo in servizio."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Cosa mi porto a casa"
        },
        {
          "type": "list",
          "items": [
            "Prova i parser su output reali catturati, mai su come ti immagini l'output.",
            "Fallisci chiuso, ma a voce alta: la lista vuota era nel journal dalla prima esecuzione.",
            "Tieniti una via di ritorno. La tabella tocca solo IPv6, quindi l'accesso IPv4 ai nodi non è mai stato a rischio, e il fix è stato un pull e un nuovo giro."
          ]
        }
      ],
      "caseStudy": {
        "facts": [
          {
            "label": "Quando",
            "value": "5 nov 2026",
            "mono": true
          },
          {
            "label": "Modifica",
            "value": "rollout nftables · IPv6",
            "mono": true
          },
          {
            "label": "Impatto",
            "value": "I client LAN perdono l'accesso IPv6 ai nodi"
          },
          {
            "label": "Stato",
            "value": "Risolto"
          }
        ],
        "timeline": [
          {
            "when": "rollout",
            "kind": "event",
            "title": "Un secondo firewall IPv6",
            "body": "Ogni nodo si prende la sua tabella nftables: accetta i prefissi LAN imparati dai router advertisement, scarta e logga tutto il resto."
          },
          {
            "when": "subito dopo",
            "kind": "event",
            "title": "La LAN resta fuori",
            "body": "SSH in IPv6 dalla LAN va in timeout. La tabella ammette solo il link-local: nella lista dei consentiti non è finito nessun prefisso LAN."
          },
          {
            "when": "diagnosi",
            "kind": "decision",
            "title": "Il parser non trovava niente",
            "body": "iproute2 toglie dall'output i campi usati come selettori. Il filtro cercava un campo che l'output non contiene mai."
          },
          {
            "when": "fix",
            "kind": "event",
            "title": "Filtra su quello che viene stampato",
            "body": "Le route on-link sono quelle senza gateway. Verificato sull'output reale di entrambi i nodi, poi ridistribuito."
          }
        ]
      }
    },
  },
  'defense-in-depth-behind-a-consumer-router': {
    en: {
      "title": "Homelab defence behind a consumer router",
      "description": "No VLANs, no DMZ and public IPv6 on every device: how a two-node homelab stays private when the router can't do most of the work.",
      "content": [
        {
          "type": "paragraph",
          "content": "A consumer router is a good router and a poor firewall appliance. Mine has no VLANs (virtual LANs that split one physical network into isolated ones), no DMZ (a separate zone for anything exposed to the internet), can't forward ports into its guest network, and hands every device public IPv6 addresses. One wrong click in its web interface and a server in my living room is on the internet."
        },
        {
          "type": "paragraph",
          "content": "So the design assumes any single control can be wrong, and puts a second one behind it. That idea has a name, defence in depth, and it is easiest to picture as slices of Swiss cheese: every layer has holes, but the holes rarely line up. This article walks through the slices of a two-node homelab:"
        },
        {
          "type": "list",
          "items": [
            "what is reachable at all, and from where;",
            "how each service is kept off the interfaces it shouldn't be on;",
            "a second firewall for IPv6, and a patching rule for containers;",
            "the holes that are still open."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "No public services, one declared exception"
        },
        {
          "type": "paragraph",
          "content": "Nothing is published to the internet. Remote access goes through WireGuard, the VPN built into the router, which gives each connected peer a LAN address. That keeps the reverse proxy (the single entry point that routes requests to each service) down to one rule: requests from outside the LAN range get a 403. VPN users pass it with no extra configuration, because to the proxy they look like they are at home."
        },
        {
          "type": "paragraph",
          "content": "There is exactly one inbound port, for a peer-to-peer service that needs incoming connections. It is written down as the exception, not discovered as one."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Bind to the LAN address, not to 0.0.0.0"
        },
        {
          "type": "paragraph",
          "content": "A service bound to 0.0.0.0 listens on every network interface the machine has, including ones you forgot about. With IPv6, that includes public addresses."
        },
        {
          "type": "paragraph",
          "content": "So every port in every Compose file is bound to the node's LAN address. That rule caught more than expected: the DNS filter's admin interface and a home-audio server were listening on all interfaces, including both public IPv6 addresses, with the router as the only thing in the way. Both now bind to the LAN address, and a daily host check fails if any of them grows an IPv6 listener again."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "No authentication means no published port"
        },
        {
          "type": "paragraph",
          "content": "Some services have no login at all. The rule for those: if it can't authenticate a caller, it must not be reachable by one."
        },
        {
          "type": "list",
          "items": [
            "The metrics and log backends have no authentication, so a firewall rule in Docker's own chain admits only the node that runs alerting.",
            "The local LLM router has no authentication and forwards to the GPU, so it lives on an internal Docker network and publishes no port. Its API key is a second line, not the perimeter.",
            "Secrets never enter git: each stack has an example file in the repo and the real one on the node."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A second firewall for IPv6"
        },
        {
          "type": "paragraph",
          "content": "The router's IPv6 firewall is the only filter between the internet and the nodes' public addresses. Each node now has its own nftables table (nftables is the Linux kernel's packet filter) that accepts the LAN's on-link prefixes, the address ranges of the network the node is plugged into, plus the deliberately shared ports, and drops the rest. If it can't read the prefixes, it fails closed: it blocks rather than opens. The first rollout locked out the LAN; that story has its own case study."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Patch automatically, but only what git already says"
        },
        {
          "type": "paragraph",
          "content": "The OS updates itself every night. Containers are trickier, because an image tag can mean two different things. A pinned tag names one exact version, while a moving tag like latest points at whatever was pushed most recently."
        },
        {
          "type": "paragraph",
          "content": "Containers follow one rule: apply automatically only what the tag in git already says. A pinned tag that changes upstream is almost always a rebuild for a CVE, a publicly catalogued vulnerability, which is exactly the update to take. Moving tags are flagged for review. Renovate, a bot that opens pull requests for new versions, raises the tags in git, and a daily Trivy scan of the images feeds a dashboard of known vulnerabilities."
        },
        {
          "type": "paragraph",
          "content": "Rebuilding three images, two of them on hardened base images, took them from 78, 84 and 39 known CVEs to none. Turns out most of those CVEs were just along for the ride."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "What is still open"
        },
        {
          "type": "paragraph",
          "content": "Defence in depth is also about knowing where the cheese is thin:"
        },
        {
          "type": "list",
          "items": [
            "TLS ends at the reverse proxy; traffic to the second node crosses the LAN in clear. Acceptable while every device on the LAN is trusted.",
            "Without VLANs there is no isolated segment, so anything deliberately exposed, a honeypot for instance, needs its own router in cascade first.",
            "Backups leave the disk they protect but not the house. Offsite is the next item."
          ]
        }
      ]
    },
    it: {
      "title": "Homelab blindato con un router da supermercato",
      "description": "Niente VLAN, niente DMZ, IPv6 pubblico su ogni dispositivo. Come tengo privato un homelab a due nodi quando il router non sa fare quasi niente: bind sulla LAN, nftables, WireGuard e container aggiornati solo da git.",
      "content": [
        {
          "type": "paragraph",
          "content": "Un router consumer è un buon router e un pessimo firewall. Il mio non ha VLAN (LAN virtuali che spezzano una rete fisica in reti isolate), non ha DMZ (una zona a parte per quello che è esposto a internet), non inoltra porte verso la rete ospiti e regala a ogni dispositivo indirizzi IPv6 pubblici. Un clic sbagliato nella sua interfaccia web e il server in salotto è su internet."
        },
        {
          "type": "paragraph",
          "content": "Per questo il design parte da un'idea: ogni controllo può sbagliare, quindi gliene metti un secondo dietro. Si chiama difesa in profondità, e te la immagini come fette di emmental: ogni strato ha i suoi buchi, ma i buchi si allineano di rado. Qui passiamo in rassegna le fette di un homelab a due nodi:"
        },
        {
          "type": "list",
          "items": [
            "cosa è raggiungibile, e da dove;",
            "come ogni servizio sta lontano dalle interfacce dove non deve stare;",
            "un secondo firewall per IPv6, e una regola per aggiornare i container;",
            "i buchi ancora aperti."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Zero servizi pubblici, un'eccezione dichiarata"
        },
        {
          "type": "paragraph",
          "content": "Su internet non è pubblicato niente. Da remoto entri con WireGuard, la VPN integrata nel router, che dà a ogni peer collegato un indirizzo della LAN. Così al reverse proxy (l'unico punto d'ingresso, quello che smista le richieste ai servizi) basta una regola: chi arriva da fuori della LAN si prende un 403. Chi è in VPN passa senza configurazioni in più. Per il proxy è come se fosse a casa."
        },
        {
          "type": "paragraph",
          "content": "C'è esattamente una porta in ingresso, per un servizio peer-to-peer che vuole connessioni entranti. È scritta come eccezione. Non scoperta come tale."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Bind sull'indirizzo LAN, non su 0.0.0.0"
        },
        {
          "type": "paragraph",
          "content": "Un servizio in ascolto su 0.0.0.0 ascolta su tutte le interfacce della macchina. Anche quelle che ti eri dimenticato. Con IPv6, dentro ci sono indirizzi pubblici."
        },
        {
          "type": "paragraph",
          "content": "Per questo ogni porta di ogni file Compose è legata all'indirizzo LAN del nodo. La regola ha pescato più del previsto: l'interfaccia admin del filtro DNS e un server audio di casa ascoltavano su tutte le interfacce, compresi i due indirizzi IPv6 pubblici, con il router come unico ostacolo. Bello, eh? Adesso tutti e due sono legati all'indirizzo LAN, e un controllo giornaliero dell'host fallisce se uno dei due torna ad ascoltare in IPv6."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Niente login, niente porta pubblicata"
        },
        {
          "type": "paragraph",
          "content": "Alcuni servizi un login non ce l'hanno proprio. La regola per loro: se non sa chi lo sta chiamando, non deve essere raggiungibile. Punto."
        },
        {
          "type": "list",
          "items": [
            "I backend di metriche e log non hanno autenticazione, quindi una regola nella catena firewall di Docker fa entrare solo il nodo che gestisce gli allarmi.",
            "Il router dell'LLM locale non ha autenticazione e inoltra alla GPU, quindi vive su una rete Docker interna e non pubblica porte. La sua API key è una seconda linea, non il perimetro.",
            "I segreti in git non ci entrano: per ogni stack nel repo c'è un file di esempio, quello vero sta sul nodo."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un secondo firewall per IPv6"
        },
        {
          "type": "paragraph",
          "content": "Tra internet e gli indirizzi pubblici dei nodi c'era un solo filtro: il firewall IPv6 del router. Adesso ogni nodo ha la sua tabella nftables (il filtro di pacchetti del kernel Linux) che accetta i prefissi on-link della LAN, cioè gli intervalli di indirizzi della rete a cui il nodo è attaccato, più le porte condivise apposta, e scarta il resto. Se non riesce a leggere i prefissi fallisce chiuso: blocca invece di aprire. Il primo rollout ha chiuso fuori la LAN. Quella storia ha un caso studio tutto suo."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Aggiornamenti automatici, ma solo quelli che git sa già"
        },
        {
          "type": "paragraph",
          "content": "Il sistema operativo si aggiorna da solo ogni notte. Coi container è più delicato, perché un tag d'immagine può voler dire due cose. Un tag fisso indica una versione precisa. Un tag mobile come latest punta all'ultima cosa pubblicata, qualunque sia."
        },
        {
          "type": "paragraph",
          "content": "Per i container la regola è una: in automatico si applica solo quello che il tag in git dichiara già. Un tag fisso che cambia a monte è quasi sempre una ricostruzione per una CVE, una vulnerabilità catalogata pubblicamente. Tradotto: proprio l'aggiornamento che vuoi. I tag mobili finiscono in revisione. Renovate, un bot che apre pull request per le nuove versioni, alza i tag in git, e una scansione Trivy giornaliera delle immagini alimenta una dashboard delle vulnerabilità note."
        },
        {
          "type": "paragraph",
          "content": "Ho ricostruito tre immagini, due su basi irrobustite. Da 78, 84 e 39 CVE note a zero. A quanto pare la maggior parte di quelle CVE viaggiava a scrocco."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Cosa resta aperto"
        },
        {
          "type": "paragraph",
          "content": "Difesa in profondità vuol dire anche sapere dove l'emmental è più sottile:"
        },
        {
          "type": "list",
          "items": [
            "TLS termina al reverse proxy. Il traffico verso il secondo nodo attraversa la LAN in chiaro. Va bene finché ogni dispositivo in LAN è fidato.",
            "Senza VLAN un segmento isolato non esiste: qualunque cosa esposta apposta, un honeypot per dire, ha bisogno prima di un suo router in cascata.",
            "I backup lasciano il disco che proteggono, ma non la casa. L'offsite è il prossimo punto della lista."
          ]
        }
      ]
    },
  },
  'silent-failures-alerting-that-notices': {
    en: {
      "title": "Silent failures: when alerting goes quiet",
      "description": "A backup that failed every night, a check that counted zero as success, alerting that lived on the node it watched. What a homelab taught me about the failures nobody hears.",
      "content": [
        {
          "type": "paragraph",
          "content": "The worst failures in my homelab were quiet. A backup pull that failed every night, and nobody knew. An archive check that counted zero entries as a success. A script killed by `set -o pipefail` without a word."
        },
        {
          "type": "paragraph",
          "content": "The common thread: the part that should have noticed was the part that failed, or nothing was looking at all. Monitoring is software too, and when it breaks it doesn't crash loudly. It goes silent, and silence looks exactly like everything being fine. Who watches the watchmen? In a homelab, nobody, unless you build it."
        },
        {
          "type": "paragraph",
          "content": "This piece covers three fixes: making the alerting system report on its own health, watching the jobs that fail quietly, and proving that backups actually restore."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Don't put the watcher in the house it watches"
        },
        {
          "type": "paragraph",
          "content": "Grafana evaluated the alert rules on the same node it was watching. When that node went down, so did the thing that would have said so: time to detection, unbounded. The smoke detector was wired to the circuit that caught fire."
        },
        {
          "type": "paragraph",
          "content": "Grafana and notifications moved to the low-power node that never reboots. Prometheus, the database that scrapes (pulls) metrics from each service, stayed next to the services it scrapes, because they are deliberately not published."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "If a rule can't be evaluated, that is an alert"
        },
        {
          "type": "paragraph",
          "content": "Every rule is set to alert when it can't be evaluated. If the metrics node disappears, all of them fire at once. That is noisy on purpose: a dashboard that goes quiet because its datasource is gone looks exactly like a healthy one. No data is not good news; it is no news."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A dead man's switch outside the house"
        },
        {
          "type": "paragraph",
          "content": "A dead man's switch is a control that has to be held active, so that when the operator stops, something happens. A train driver's pedal works this way: let go of it and the train brakes."
        },
        {
          "type": "paragraph",
          "content": "One alert rule is always firing. Its contact point pings an external heartbeat service every five minutes. If the pings stop, because the alerting node is down, Grafana is stuck or the internet is gone, the email comes from outside the homelab, which is the only place that can still send it."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Watch the jobs that fail, not just the ones that run"
        },
        {
          "type": "paragraph",
          "content": "Background jobs are where failures hide best. A one-shot job (a systemd unit that runs once and exits, like a backup) can fail at 3am and leave no trace you will look at. Four rules now cover that:"
        },
        {
          "type": "list",
          "items": [
            "A failed systemd unit now raises an alert in about two minutes instead of being found the next morning.",
            "Every one-shot job has a start timeout, checked in CI: a job that hangs forever never fails, so it never alerts.",
            "With `pipefail`, a shell pipeline fails if any command in it fails, not just the last one, which can end a script with no message. Pipelines under `pipefail` must say whether a failure should stop the script; a CI check refuses ones that don't.",
            "Archive verification fails on an empty archive. Zero entries is not a success."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Let the alert explain itself"
        },
        {
          "type": "paragraph",
          "content": "The alert payload also goes to a small service that adds the last 30 log lines of the affected container from Loki, the log store, and asks a local LLM for the likely cause and the first thing to check. The answer arrives as a second notification."
        },
        {
          "type": "paragraph",
          "content": "The first notification never depends on the model: if it is down, the alert still lands. An alerting path that needs an LLM to be up would just be one more silent failure waiting to happen."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A backup counts when it restores"
        },
        {
          "type": "paragraph",
          "content": "Archives are encrypted with age, a small file-encryption tool, and only the public key lives on the nodes: a node can write backups but not read them. Until the nightly pull moves a node's backup to the other node, it shares a failure domain with the data it protects, meaning one dead disk takes out both. The large datasets go to restic, a backup tool that keeps snapshots, with their own retention."
        },
        {
          "type": "paragraph",
          "content": "And the backup counted as done only after it had been restored. Until then it was a hopeful file."
        }
      ]
    },
    it: {
      "title": "Il backup mente, l'allarme tace",
      "description": "Un backup che falliva ogni notte, una verifica che contava zero come successo, gli allarmi sullo stesso nodo che dovevano sorvegliare. Dead man's switch, pipefail, systemd e restore veri: come un homelab impara a sentire i guasti che non fanno rumore.",
      "content": [
        {
          "type": "paragraph",
          "content": "I guasti peggiori del mio homelab sono stati quelli muti. Un pull del backup che falliva ogni notte, e nessuno lo sapeva. Una verifica dell'archivio che contava zero voci come successo. Uno script ucciso da `set -o pipefail` senza dire una parola."
        },
        {
          "type": "paragraph",
          "content": "Il filo comune: il pezzo che doveva accorgersene era proprio quello rotto, oppure non guardava nessuno. Anche il monitoraggio è software, e quando si rompe non fa rumore. Tace. E il silenzio è identico a un sistema in salute. Chi controlla i controllori? In un homelab nessuno, a meno che non lo costruisci tu."
        },
        {
          "type": "paragraph",
          "content": "Qui trovi tre correzioni: far dire al sistema di allarmi come sta lui, sorvegliare i job che falliscono in silenzio, e dimostrare che i backup si ripristinano davvero."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Il sorvegliante non abita nella casa che sorveglia"
        },
        {
          "type": "paragraph",
          "content": "Grafana valutava le regole di allarme sullo stesso nodo che sorvegliava. Cadeva il nodo, cadeva anche chi doveva dirtelo. Tempo di rilevamento: infinito. Il rilevatore di fumo era attaccato al circuito che prendeva fuoco."
        },
        {
          "type": "paragraph",
          "content": "Grafana e le notifiche li ho spostati sul nodo a basso consumo che non si riavvia mai. Prometheus, il database che va a raccogliere le metriche da ogni servizio, è rimasto accanto ai servizi che interroga, perché quelli apposta non sono pubblicati."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Regola che non si valuta? È un allarme"
        },
        {
          "type": "paragraph",
          "content": "Ogni regola scatta quando non riesce a essere valutata. Sparisce il nodo delle metriche e scattano tutte insieme. È rumoroso apposta: una dashboard che tace perché la sorgente dati non c'è più è identica a una sana. Nessun dato non è una buona notizia. È nessuna notizia."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un dead man's switch fuori casa"
        },
        {
          "type": "paragraph",
          "content": "Un dead man's switch è un comando che devi tenere premuto: quando l'operatore molla, succede qualcosa. Il pedale del macchinista funziona così. Lo lascia, il treno frena."
        },
        {
          "type": "paragraph",
          "content": "Una regola di allarme è sempre accesa. Il suo contact point manda un battito a un servizio esterno ogni cinque minuti. Se i battiti si fermano, perché è caduto il nodo degli allarmi, Grafana si è piantato o è saltato internet, la mail parte da fuori l'homelab. L'unico posto che può ancora mandarla."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Guarda i job che falliscono, non solo quelli che girano"
        },
        {
          "type": "paragraph",
          "content": "I job in background sono il nascondiglio preferito dei guasti. Un job one-shot (una unit systemd che gira una volta e finisce, tipo un backup) può fallire alle 3 di notte senza lasciare tracce che qualcuno guarderà mai. Adesso quattro regole coprono il caso:"
        },
        {
          "type": "list",
          "items": [
            "Una unit systemd fallita genera un allarme in circa due minuti, invece di saltar fuori la mattina dopo.",
            "Ogni job one-shot ha un timeout di avvio, verificato in CI: un job appeso per sempre non fallisce mai. Quindi non allarma mai.",
            "Con `pipefail` una pipeline di shell fallisce se fallisce uno qualunque dei suoi comandi, non solo l'ultimo, e questo può chiudere uno script senza un messaggio. Le pipeline sotto `pipefail` devono dichiarare se un errore deve fermare lo script. Un controllo in CI rifiuta quelle che non lo fanno.",
            "La verifica dell'archivio fallisce su un archivio vuoto. Zero voci non è un successo. Punto."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "L'allarme che si spiega da solo"
        },
        {
          "type": "paragraph",
          "content": "Il payload dell'allarme va anche a un piccolo servizio che ci attacca le ultime 30 righe di log del container coinvolto, prese da Loki, l'archivio dei log, e chiede a un LLM locale la causa probabile e il primo controllo da fare. La risposta arriva come seconda notifica."
        },
        {
          "type": "paragraph",
          "content": "La prima notifica dal modello non dipende mai: se l'LLM è giù, l'allarme arriva lo stesso. Una catena di allarmi che ha bisogno di un LLM acceso sarebbe solo un altro guasto silenzioso in attesa del suo turno."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un backup conta quando lo ripristini"
        },
        {
          "type": "paragraph",
          "content": "Gli archivi sono cifrati con age, un piccolo strumento di cifratura dei file, e sui nodi c'è solo la chiave pubblica: un nodo i backup li scrive ma non li legge. Finché il pull notturno non porta il backup di un nodo sull'altro, il backup condivide il failure domain dei dati che protegge. Tradotto: un disco morto si porta via tutti e due. I dataset grandi vanno in restic, uno strumento di backup a snapshot, con la loro retention."
        },
        {
          "type": "paragraph",
          "content": "E il backup l'ho considerato fatto solo dopo averlo ripristinato. Fino ad allora era un file pieno di speranza."
        }
      ]
    },
  },
  'react2shell-scan-case-study': {
    en: {
      "title": "React2Shell scan, dissected",
      "description": "Suspicious POST requests from cloud addresses and an unused Server Action. What the edge saw, what could not be verified, and the four changes that closed the door.",
      "content": [
        {
          "type": "paragraph",
          "content": "Between 23 and 29 October, the home page of this site started receiving `POST /en` requests. They came from addresses in Google Cloud ranges, in short bursts, mixed with probes for `.env` and other config files. Nobody fills in a form on a home page that has no form. Someone was knocking on a specific door to see if it was open."
        },
        {
          "type": "paragraph",
          "content": "This case study covers what that door was, why a site already patched for the famous bug still had reasons to worry, what the logs could and could not prove, and the four changes that closed it."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A POST to a static page means someone wants a Server Action"
        },
        {
          "type": "paragraph",
          "content": "A static page has no reason to receive a POST: browsers fetch it with GET. On a Next.js site, a POST to a page means one thing: someone is trying to invoke a Server Action."
        },
        {
          "type": "paragraph",
          "content": "A Server Action is a function that runs on the server but can be called from the browser, by sending a POST to the page with an identifier of the action to run. It is part of React Server Components, the React feature that renders components on the server and sends the result to the browser in its own serialised format. Convenient for developers, and also an entry point that takes input from anyone."
        },
        {
          "type": "paragraph",
          "content": "That entry point is where React2Shell (CVE-2025-55182) lived: a critical flaw in how React Server Components handled those requests, which let a crafted request run code on the server, hence the name. Critical React Server Components advisories followed it."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A 500 is an accident, not a defence"
        },
        {
          "type": "paragraph",
          "content": "Every one of those requests got a 500 from the origin, the server that actually runs the app. That is not a defence, just an exception: the payload did not match an action the app knew how to run. The door held because the key was cut for a different lock."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Patched for the headline bug, still exposed"
        },
        {
          "type": "list",
          "items": [
            "The site was already patched for React2Shell itself, but five newer advisories (three critical: React Server Components, the `use cache` directive and image optimisation of SVGs) were fixed only in later releases.",
            "The app still shipped a Server Action nobody called: a leftover locale switcher. An action that exists is an endpoint, whether or not the UI uses it.",
            "Every page accepted POST. The firewall had no opinion about write methods."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "What the logs could not prove"
        },
        {
          "type": "paragraph",
          "content": "The only record was Cloudflare's HTTP analytics: aggregated requests, with path, method, status and country, but no bodies. Enough to see the attempts; not enough to prove they failed. The honest verdict is: compromise unlikely, not ruled out."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Four changes that closed the door"
        },
        {
          "type": "paragraph",
          "content": "Two of the changes happen at the edge, Cloudflare's servers that sit in front of the origin and see every request first. There, a WAF (web application firewall) filters requests by what they say in HTTP, such as method, path and headers, rather than by IP address and port like a network firewall. The four changes:"
        },
        {
          "type": "list",
          "items": [
            "Full dependency upgrade: Next.js 16.4.5, React 19.2.9, sharp 0.35.5. `bun audit`, which checks dependencies against published advisories, went from 7 critical findings to none.",
            "The unused Server Action and its configuration were deleted. The site now has no action to invoke.",
            "A Cloudflare custom rule allows write methods only on the one route that needs them, the contact form. Everything else gets a 403 at the edge, before the app runs.",
            "`dangerouslyAllowSVG` was turned off. SVG files can carry scripts, which is why the image optimiser needs that flag to process them; every SVG on the site is served as a file, so the optimiser never needed it."
          ],
          "ordered": true
        },
        {
          "type": "paragraph",
          "content": "Here is the rule from the third change. Read it as: a write method, on any path that is not the contact form and not Cloudflare's own `/cdn-cgi/` endpoints, gets blocked."
        },
        {
          "type": "code",
          "language": "text",
          "code": "(http.request.method in {\"POST\" \"PUT\" \"PATCH\" \"DELETE\"}\n  and not http.request.uri.path in {\"/api/contact/send\"}\n  and not starts_with(http.request.uri.path, \"/cdn-cgi/\"))\n→ block"
        },
        {
          "type": "paragraph",
          "content": "After the deploy, the same request returns 403 from the edge; the contact form still works. The rule lives in the repository as a script, so it can be reviewed and re-applied instead of being a click in a dashboard."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Lessons"
        },
        {
          "type": "list",
          "items": [
            "Delete what you do not use. The cheapest patch for a Server Action vulnerability is not having a Server Action.",
            "Allow-list write methods at the edge. A content site needs POST in one or two places; say so in the firewall.",
            "Keep your own record. Aggregated edge data was the only trace of these requests; this Observatory now keeps a daily one."
          ]
        }
      ],
      "caseStudy": {
        "facts": [
          {
            "label": "Window",
            "value": "23 → 29 Oct 2026",
            "mono": true
          },
          {
            "label": "Vector",
            "value": "POST /en · Server Action",
            "mono": true
          },
          {
            "label": "Outcome",
            "value": "Compromise unlikely, not ruled out"
          },
          {
            "label": "Status",
            "value": "Mitigated"
          }
        ],
        "timeline": [
          {
            "when": "23 Oct",
            "kind": "event",
            "title": "First POST to a page",
            "body": "Suspicious POST /en requests from Google Cloud addresses, mixed with .env probes. Each one got a 500."
          },
          {
            "when": "5 Nov",
            "kind": "decision",
            "title": "Edge data is the only record",
            "body": "Cloudflare analytics show the attempts, not the request bodies: success cannot be ruled out."
          },
          {
            "when": "5 Nov",
            "kind": "event",
            "title": "Upgrade",
            "body": "Next.js 16.4.5 and React 19.2.9: seven critical audit findings down to zero."
          },
          {
            "when": "5 Nov",
            "kind": "event",
            "title": "Remove the surface",
            "body": "The unused Server Action is deleted; a WAF rule allows write methods on one route only."
          }
        ]
      }
    },
    it: {
      "title": "React2Shell bussa alla porta",
      "description": "POST sospette da range Google Cloud su una home senza form, e una Server Action che nessuno chiamava. Cosa ha visto l'edge di Cloudflare, cosa i log non potevano dimostrare, e le quattro modifiche che hanno chiuso la porta.",
      "content": [
        {
          "type": "paragraph",
          "content": "Tra il 23 e il 29 ottobre la home di questo sito comincia a ricevere richieste `POST /en`. Arrivano da range di Google Cloud, a raffiche brevi, insieme a scansioni di `.env` e altri file di configurazione. Nessuno compila un form su una home che di form non ne ha. Qualcuno stava bussando a una porta precisa, per vedere se era aperta."
        },
        {
          "type": "paragraph",
          "content": "Qui trovi qual era quella porta, perché un sito già patchato per il bug famoso aveva comunque di che preoccuparsi, cosa i log potevano dimostrare e cosa no, e le quattro modifiche che l'hanno chiusa."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Una POST su una pagina statica? Qualcuno cerca una Server Action"
        },
        {
          "type": "paragraph",
          "content": "Una pagina statica non ha motivo di ricevere una POST: il browser la scarica con una GET. Su un sito Next.js una POST su una pagina vuol dire una cosa sola. Qualcuno prova a invocare una Server Action."
        },
        {
          "type": "paragraph",
          "content": "Una Server Action è una funzione che gira sul server ma che chiami dal browser, mandando una POST alla pagina con l'identificativo dell'azione da eseguire. Fa parte dei React Server Components, la funzionalità di React che renderizza i componenti sul server e manda il risultato al browser in un suo formato serializzato. Comodo per chi sviluppa. E anche un punto d'ingresso che accetta input da chiunque."
        },
        {
          "type": "paragraph",
          "content": "È lì che stava React2Shell (CVE-2025-55182): una falla critica nel modo in cui i React Server Components gestivano quelle richieste. Una richiesta costruita ad arte eseguiva codice sul server. Da cui il nome. Dopo sono arrivati altri advisory critici sui React Server Components."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un 500 è un incidente, non una difesa"
        },
        {
          "type": "paragraph",
          "content": "Ognuna di quelle richieste si è presa un 500 dall'origin, il server che fa girare davvero l'app. Non è una difesa. È un'eccezione: il payload non corrispondeva a nessuna azione che l'app sapesse eseguire. La porta ha retto perché la chiave era tagliata per un'altra serratura. Fortuna, non design."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Patchato per il bug da prima pagina, esposto lo stesso"
        },
        {
          "type": "list",
          "items": [
            "Il sito era già aggiornato per React2Shell, ma cinque advisory più recenti (tre critici: React Server Components, la direttiva `use cache` e l'ottimizzazione immagini degli SVG) erano corretti solo in release successive.",
            "L'app si portava ancora dietro una Server Action che nessuno chiamava: un vecchio selettore di lingua. Un'azione che esiste è un endpoint, che l'interfaccia la usi o no.",
            "Ogni pagina accettava POST. Il firewall sui metodi di scrittura non aveva una regola che fosse una."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Cosa i log non potevano dimostrare"
        },
        {
          "type": "paragraph",
          "content": "L'unica traccia erano le analytics HTTP di Cloudflare: richieste aggregate, con path, metodo, status e paese. Niente body. Abbastanza per vedere i tentativi, non per dimostrare che siano falliti. Il verdetto onesto: compromissione improbabile, non esclusa."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Quattro modifiche, porta chiusa"
        },
        {
          "type": "paragraph",
          "content": "Due modifiche stanno all'edge, i server di Cloudflare che stanno davanti all'origin e vedono ogni richiesta per primi. Lì un WAF (web application firewall) filtra le richieste in base a quello che dicono in HTTP, come metodo, path e header, invece che per IP e porta come un firewall di rete. Le quattro modifiche:"
        },
        {
          "type": "list",
          "items": [
            "Aggiornamento completo delle dipendenze: Next.js 16.4.5, React 19.2.9, sharp 0.35.5. `bun audit`, che confronta le dipendenze con gli advisory pubblicati, è passato da 7 finding critici a zero.",
            "Via la Server Action inutilizzata, e via la sua configurazione. Il sito non ha più azioni da invocare.",
            "Una custom rule di Cloudflare lascia passare i metodi di scrittura solo sull'unica route che li usa, il form contatti. Tutto il resto si prende un 403 all'edge, prima che l'app giri.",
            "`dangerouslyAllowSVG` spento. Un SVG può contenere script, ed è per questo che l'ottimizzatore di immagini vuole quel flag per elaborarli. Ma ogni SVG del sito è servito come file, quindi all'ottimizzatore non serviva."
          ],
          "ordered": true
        },
        {
          "type": "paragraph",
          "content": "Ecco la regola della terza modifica. Tradotta: un metodo di scrittura, su qualunque path che non sia il form contatti né gli endpoint `/cdn-cgi/` di Cloudflare, viene bloccato."
        },
        {
          "type": "code",
          "language": "text",
          "code": "(http.request.method in {\"POST\" \"PUT\" \"PATCH\" \"DELETE\"}\n  and not http.request.uri.path in {\"/api/contact/send\"}\n  and not starts_with(http.request.uri.path, \"/cdn-cgi/\"))\n→ block"
        },
        {
          "type": "paragraph",
          "content": "Dopo il deploy la stessa richiesta si prende un 403 dall'edge, e il form contatti funziona. La regola vive nel repository come script: la rivedi e la riapplichi. Non è un clic dimenticato in una dashboard."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Cosa mi porto a casa"
        },
        {
          "type": "list",
          "items": [
            "Elimina quello che non usi. La patch più economica per una vulnerabilità delle Server Action è non avere Server Action.",
            "Metti in allow-list i metodi di scrittura all'edge. Un sito di contenuti ha bisogno di POST in uno o due punti: scrivilo nel firewall.",
            "Tieniti una traccia tua. I dati aggregati dell'edge erano l'unica traccia di queste richieste. Questo Osservatorio adesso ne conserva una ogni giorno."
          ]
        }
      ],
      "caseStudy": {
        "facts": [
          {
            "label": "Periodo",
            "value": "23 → 29 ott 2026",
            "mono": true
          },
          {
            "label": "Vettore",
            "value": "POST /en · Server Action",
            "mono": true
          },
          {
            "label": "Esito",
            "value": "Compromissione improbabile, non esclusa"
          },
          {
            "label": "Stato",
            "value": "Mitigato"
          }
        ],
        "timeline": [
          {
            "when": "23 ott",
            "kind": "event",
            "title": "La prima POST su una pagina",
            "body": "Richieste POST /en sospette da indirizzi Google Cloud, insieme a scansioni di .env. Ognuna si è presa un 500."
          },
          {
            "when": "5 nov",
            "kind": "decision",
            "title": "L'edge è l'unica traccia",
            "body": "Le analytics di Cloudflare mostrano i tentativi, non il contenuto delle richieste: il successo non lo puoi escludere."
          },
          {
            "when": "5 nov",
            "kind": "event",
            "title": "Aggiornamento",
            "body": "Next.js 16.4.5 e React 19.2.9: sette finding critici scesi a zero."
          },
          {
            "when": "5 nov",
            "kind": "event",
            "title": "Via la superficie",
            "body": "La Server Action inutilizzata non c'è più. Una regola WAF lascia passare i metodi di scrittura su una sola route."
          }
        ]
      }
    },
  },
  'x402-agent-native-api-monetization': {
    en: {
      "title": "x402: APIs that machines pay for",
      "description": "HTTP 402 finally has a job. How Cloudflare's Pay Per Crawl and Monetization Gateway let agents and crawlers pay per request, and the pricing pitfalls nobody mentions.",
      "content": [
        {
          "type": "paragraph",
          "content": "Picture an AI crawler working through every page you have published, or an agent calling your API on someone else's behalf. For three decades the web had exactly two answers for that kind of client: serve it for free, or block it. There was no way to say \"sure, that will be one cent\"."
        },
        {
          "type": "paragraph",
          "content": "HTTP 402 \"Payment Required\" sat reserved but unused in the spec the entire time, the protocol's longest-running \"coming soon\" sign. It finally has a job: letting AI crawlers and agents pay for what they fetch, per request, with no account and no contract. Cloudflare shipped two products on top of it, Pay Per Crawl and the Monetization Gateway, and together they redefine what a paying customer can be."
        },
        {
          "type": "paragraph",
          "content": "Below: the two products, the pay-and-retry handshake, pricing for machines, and the clash between pre-payment and metered LLM billing."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Two gateways, two economic models"
        },
        {
          "type": "paragraph",
          "content": "Pay Per Crawl targets AI crawlers specifically. A publisher sets one flat per-request price for the whole domain and marks each crawler allow, charge, or block. Cloudflare acts as Merchant of Record, the party that legally sells and collects on your behalf: it verifies the crawler, aggregates the charges, and pays the publisher in fiat, ordinary government currency. Zero crypto, almost no setup, but it only bills crawlers."
        },
        {
          "type": "paragraph",
          "content": "The Monetization Gateway generalises the idea to any caller and any resource: web pages, REST APIs, datasets, even MCP tools (functions an AI agent can call through the Model Context Protocol). It runs on x402, an open protocol where the buyer pays in a stablecoin, a cryptocurrency pegged to a regular currency, here USDC. Settlement, the moment money actually moves, lands peer-to-peer straight in the seller's wallet: sub-second, with fees down to fractions of a cent. This is the surface that matters if you sell APIs, not just articles."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The handshake: ask, get a price, pay, retry"
        },
        {
          "type": "paragraph",
          "content": "The flow is stateless and needs no prior relationship, like a vending machine: a price on the glass and a coin slot. The client requests a gated resource; the edge replies 402 with the price, the accepted asset and a payment destination; the client pays and retries with proof; the edge verifies and returns 200. Because enforcement happens at Cloudflare's edge, your origin never sees unpaid traffic or the payment machinery."
        },
        {
          "type": "paragraph",
          "content": "Pay Per Crawl does the same dance with its own headers; below, watch the price go from quoted to accepted to charged."
        },
        {
          "type": "code",
          "language": "http",
          "filename": "pay-per-crawl.http",
          "code": "# Pay Per Crawl — discovery-first flow (documented headers)\nGET /research/2026-forecast.html\n< HTTP/1.1 402 Payment Required\n< crawler-price: USD 0.01\n\n# the crawler agrees to the price and retries\nGET /research/2026-forecast.html\n> crawler-exact-price: USD 0.01\n< HTTP/1.1 200 OK\n< crawler-charged: USD 0.01"
        },
        {
          "type": "paragraph",
          "content": "The second request carries the crawler's agreement to that exact price, and the response says what was billed."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Proving the crawler is who it says it is"
        },
        {
          "type": "paragraph",
          "content": "Crawlers are kept honest with Web Bot Auth: the crawler holds an Ed25519 key pair (a modern, fast signature scheme), publishes its public keys in a JWK directory (a standard JSON format for keys), and signs every request with HTTP Message Signatures (RFC 9421). A spoofed user agent cannot rack up charges in your name. The Monetization Gateway optionally reuses the same identity layer to bill usage against a known account."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Price the way machines consume"
        },
        {
          "type": "paragraph",
          "content": "Human pricing is seats and monthly tiers; machine pricing is per call. The gateway lets you charge a fixed amount per verb and path (\"$0.01 per GET /premium/*\"), vary it by work done (\"up to $2\" for an image generation), or intercept a 401 and return 402 so an unauthenticated caller pays instead of bouncing. Subscriptions become one option among many, not the only one."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The subtlety nobody mentions: pre-payment vs metered billing"
        },
        {
          "type": "paragraph",
          "content": "x402 is pre-payment: you pay, then you get the response. But the most valuable machine resource, LLM inference, is billed after the fact, per output token, and you cannot know the exact token count before generating. It's a taxi that wants the fare before it knows the destination. There are three clean ways to reconcile the two:"
        },
        {
          "type": "list",
          "items": [
            "Fixed tiers: price by model and a max_tokens cap, the hard limit on output length, so the charge is deterministic.",
            "Prepaid credits against a verified agent identity, settling real usage post-hoc.",
            "A cache-aware price: when a semantic cache (matching questions by meaning, not exact text) serves the answer, charge a fraction of the cold price. High margin, and a healthy incentive to cache."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Revenue per request becomes an observability signal"
        },
        {
          "type": "paragraph",
          "content": "Once every call carries a price, you can finally compute margin per endpoint: x402 revenue minus the infra cost of serving that request. For anyone doing FinOps, the practice of managing cloud spend, this is the missing half of the ledger: until now we only ever measured cost. Feed settlement webhooks into the same dashboards that track cost-per-request and you get profit-per-request, live."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Early, and that is the point"
        },
        {
          "type": "paragraph",
          "content": "Both products are still early: Pay Per Crawl is in private beta, the Monetization Gateway on a waitlist, and x402 settlement means holding a stablecoin wallet with the tax and compliance that implies. The buyer side, agents that carry their own wallets, is nascent in 2026."
        },
        {
          "type": "paragraph",
          "content": "That is exactly the point: the cheapest moment to wire a keyless, pay-per-request path into your API is before the agents show up, not after."
        }
      ]
    },
    it: {
      "title": "x402: quando a pagare è il bot",
      "description": "Dopo trent'anni di panchina, lo status HTTP 402 ha un lavoro. Pay Per Crawl e il Monetization Gateway di Cloudflare fanno pagare agenti e crawler a richiesta, con x402 e USDC. Più le trappole di pricing che nessuno ti dice.",
      "content": [
        {
          "type": "paragraph",
          "content": "Immagina un crawler AI che si scarica ogni pagina che hai pubblicato. O un agente che chiama la tua API per conto di qualcun altro. Per trent'anni il web ha avuto due sole risposte per un client così: servirlo gratis, o bloccarlo. Mancava la terza: \"certo, fanno un centesimo\"."
        },
        {
          "type": "paragraph",
          "content": "Lo status HTTP 402 \"Payment Required\" è rimasto lì nella specifica per tutto questo tempo, riservato e inutilizzato. Il cartello \"prossimamente\" più longevo del protocollo. Adesso ha un lavoro: far pagare crawler AI e agenti per quello che scaricano, a richiesta, senza account e senza contratto. Cloudflare ci ha costruito sopra due prodotti, Pay Per Crawl e il Monetization Gateway. Insieme cambiano la definizione di cliente pagante."
        },
        {
          "type": "paragraph",
          "content": "Il giro: i due prodotti, l'handshake paga-e-riprova, i prezzi pensati per le macchine, e lo scontro tra pre-pagamento e billing a consumo degli LLM."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Due gateway, due modelli di business"
        },
        {
          "type": "paragraph",
          "content": "Pay Per Crawl parla solo ai crawler AI. L'editore fissa un prezzo flat per richiesta su tutto il dominio e marca ogni crawler come allow, charge o block. Cloudflare fa da Merchant of Record. Tradotto: è il soggetto che vende e incassa legalmente per conto tuo. Verifica il crawler, aggrega gli addebiti e paga l'editore in valuta fiat, moneta tradizionale. Zero crypto, setup quasi nullo. Ma fattura solo i crawler."
        },
        {
          "type": "paragraph",
          "content": "Il Monetization Gateway allarga l'idea a qualunque chiamante e qualunque risorsa: pagine web, API REST, dataset, perfino tool MCP (funzioni che un agente AI chiama tramite il Model Context Protocol). Gira su x402, un protocollo aperto dove il compratore paga in stablecoin, una crypto ancorata a una valuta tradizionale. Qui USDC. Il settlement, il momento in cui i soldi si muovono davvero, arriva peer-to-peer dritto nel wallet del venditore: sotto il secondo, con commissioni fino a frazioni di centesimo. Se vendi API, e non solo articoli, è questa la superficie che conta."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "L'handshake: chiedi, leggi il prezzo, paghi, riprovi"
        },
        {
          "type": "paragraph",
          "content": "Il flusso è stateless e non ti serve nessuna relazione pregressa. Come un distributore automatico: prezzo sul vetro, fessura per le monete. Il client chiede una risorsa protetta. L'edge risponde 402 con il prezzo, l'asset accettato e dove pagare. Il client paga e riprova con la prova allegata. L'edge verifica e restituisce 200. L'enforcement sta all'edge di Cloudflare, quindi il tuo origin non vede mai né il traffico non pagato né la macchina dei pagamenti."
        },
        {
          "type": "paragraph",
          "content": "Pay Per Crawl fa lo stesso balletto con header suoi. Qui sotto segui il prezzo: proposto, accettato, addebitato."
        },
        {
          "type": "code",
          "language": "http",
          "filename": "pay-per-crawl.http",
          "code": "# Pay Per Crawl — flusso discovery-first (header documentati)\nGET /research/2026-forecast.html\n< HTTP/1.1 402 Payment Required\n< crawler-price: USD 0.01\n\n# il crawler accetta il prezzo e riprova\nGET /research/2026-forecast.html\n> crawler-exact-price: USD 0.01\n< HTTP/1.1 200 OK\n< crawler-charged: USD 0.01"
        },
        {
          "type": "paragraph",
          "content": "La seconda richiesta porta l'ok del crawler su quel prezzo esatto, e la risposta ti dice quanto è stato fatturato."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Il crawler è chi dice di essere?"
        },
        {
          "type": "paragraph",
          "content": "I crawler li tiene onesti Web Bot Auth. Il crawler ha una coppia di chiavi Ed25519 (uno schema di firma moderno e veloce), pubblica le chiavi pubbliche in una directory JWK (un formato JSON standard per le chiavi) e firma ogni richiesta con HTTP Message Signatures (RFC 9421). Uno user agent taroccato non può accumulare addebiti a tuo nome. Il Monetization Gateway può riusare lo stesso layer di identità per fatturare l'uso su un account noto."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Prezzi a misura di macchina"
        },
        {
          "type": "paragraph",
          "content": "Gli umani pagano a postazione e a piano mensile. Le macchine, a chiamata. Il gateway ti fa addebitare un importo fisso per verbo e path (\"$0.01 per ogni GET /premium/*\"), farlo variare in base al lavoro svolto (\"fino a $2\" per una generazione di immagini), oppure intercettare un 401 e trasformarlo in 402: il chiamante non autenticato paga invece di rimbalzare. L'abbonamento diventa un'opzione tra tante. Non l'unica."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Il dettaglio che nessuno cita: pre-pagamento contro billing a consumo"
        },
        {
          "type": "paragraph",
          "content": "x402 è pre-pagamento: paghi, poi hai la risposta. Ma la risorsa-macchina più preziosa, l'inferenza LLM, si fattura dopo, a token generato. E il numero esatto di token non lo sai finché non li hai generati. È un taxi che vuole la tariffa prima di sapere la destinazione. Hai tre modi puliti per far quadrare le cose:"
        },
        {
          "type": "list",
          "items": [
            "Tier fissi: prezzo per modello più un cap di max_tokens, il tetto alla lunghezza della risposta. Così l'addebito è deterministico.",
            "Crediti prepagati legati a un'identità agente verificata, e l'uso reale lo regoli dopo.",
            "Un prezzo cache-aware: quando la risposta arriva da una cache semantica (che riconosce le domande per significato, non per testo), addebiti una frazione del prezzo a freddo. Margine alto, e un sano incentivo a cachare."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Il ricavo per richiesta diventa osservabilità"
        },
        {
          "type": "paragraph",
          "content": "Quando ogni chiamata si porta dietro un prezzo, il margine per endpoint lo calcoli finalmente: ricavo x402 meno il costo infrastrutturale per servire quella richiesta. Per chi fa FinOps, la disciplina che governa la spesa cloud, è la metà mancante del libro mastro. Finora abbiamo misurato solo il costo. Manda i webhook di settlement nelle stesse dashboard che tracciano il costo per richiesta, e hai il profitto per richiesta. In tempo reale."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "È presto. Ed è proprio questo il punto"
        },
        {
          "type": "paragraph",
          "content": "Tutti e due i prodotti sono ancora acerbi. Pay Per Crawl è in private beta, il Monetization Gateway in waitlist, e il settlement x402 vuol dire tenere un wallet stablecoin, con tutto il contorno fiscale e di compliance. Il lato compratore, agenti col proprio wallet, nel 2026 è appena nato."
        },
        {
          "type": "paragraph",
          "content": "Ed è proprio questo il punto. Il momento più economico per cablare nella tua API un percorso keyless e pay-per-request è prima che arrivino gli agenti. Non dopo."
        }
      ]
    },
  },
  'aws-rag-etl-pipeline': {
    en: {
      "title": "RAG ETL on AWS: fresh data, flat bill",
      "description": "A RAG assistant is only as good as its vector store is fresh. An ETL flow on AWS that keeps it clean, survives failures and keeps the bill predictable.",
      "content": [
        {
          "type": "paragraph",
          "content": "A customer asks your support assistant about pricing. It answers instantly, fluently, and with last quarter's numbers. Nothing crashed. The model just read from a stale shelf."
        },
        {
          "type": "paragraph",
          "content": "That is how RAG (retrieval-augmented generation) fails. The model answers from documents it looks up in a vector store, an index of embeddings: lists of numbers that capture what a passage means. Keeping that store fresh is an ETL job (extract, transform, load), and 'just run the script' won't survive production. I've built RAG pipelines for banking, healthcare and e-commerce clients processing millions of documents a month. Here are the patterns that stay deterministic under chaotic load without torching the budget:"
        },
        {
          "type": "list",
          "items": [
            "The shape: a contract at the door and a state machine in the middle.",
            "From document to vectors: extraction, chunking and embeddings.",
            "Two case studies: data residency, and webhook storms.",
            "Running it: cost, observability, tenant security and performance targets."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A contract at the door keeps bad documents out"
        },
        {
          "type": "paragraph",
          "content": "Documents arrive as new objects in S3 or as webhook events from ticketing systems. Amazon EventBridge rules catch both, and each event triggers a Lambda that validates the payload against a JSON schema stored in the AWS Glue Data Catalog. That schema is a data contract: the pipeline processes anything that matches it, and nothing else."
        },
        {
          "type": "paragraph",
          "content": "Why so strict, so early? I've seen one malformed PDF corrupt an entire batch. The validator checks structure, file size (capped at 50MB per document), MIME type and required metadata. Look at the two business rules after the schema check:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import json\nimport boto3\nfrom jsonschema import validate, ValidationError\nfrom typing import Dict, Any\n\ns3 = boto3.client('s3')\nglue = boto3.client('glue')\n\ndef validate_payload(event: Dict[str, Any]) -> Dict[str, Any]:\n    \"\"\"Validate incoming document payload against Glue schema.\"\"\"\n    schema = glue.get_schema(\n        SchemaId={'SchemaName': 'rag-document-schema', 'RegistryName': 'rag-registry'}\n    )\n    \n    try:\n        validate(instance=event, schema=json.loads(schema['SchemaDefinition']))\n        \n        # Additional business rules\n        if event['fileSize'] > 50 * 1024 * 1024:  # 50MB limit\n            raise ValueError(f\"File size {event['fileSize']} exceeds 50MB limit\")\n        \n        if event['mimeType'] not in ['application/pdf', 'text/plain', 'text/markdown']:\n            raise ValueError(f\"Unsupported MIME type: {event['mimeType']}\")\n        \n        return {'valid': True, 'payload': event}\n    except ValidationError as e:\n        return {'valid': False, 'error': str(e), 'payload': event}"
        },
        {
          "type": "paragraph",
          "content": "Anything that fails comes back as `valid: False` with the error attached and goes to a dead-letter queue (DLQ), a holding queue for messages that couldn't be processed. Operations triage it there, not in CloudWatch logs."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Step Functions runs the stages and catches what falls off"
        },
        {
          "type": "paragraph",
          "content": "Valid payloads go to AWS Step Functions, a managed state machine: you describe steps and transitions in JSON, and AWS runs, retries and records them. Look at the `Retry` and `Catch` blocks on the first state, and at `Enrich`, a `Parallel` state with two branches:"
        },
        {
          "type": "code",
          "language": "json",
          "code": "{\n  \"StartAt\": \"ValidatePayload\",\n  \"States\": {\n    \"ValidatePayload\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::lambda:invoke\",\n      \"Parameters\": {\n        \"FunctionName\": \"rag-validate\",\n        \"Payload\": {\n          \"s3Key\": \"$.s3Key\",\n          \"bucket\": \"$.bucket\",\n          \"source\": \"$.source\"\n        }\n      },\n      \"Retry\": [{\n        \"ErrorEquals\": [\"Lambda.ServiceException\", \"Lambda.AWSLambdaException\"],\n        \"IntervalSeconds\": 2,\n        \"MaxAttempts\": 3,\n        \"BackoffRate\": 2.0\n      }],\n      \"Catch\": [{\n        \"ErrorEquals\": [\"States.ALL\"],\n        \"Next\": \"SendToDLQ\",\n        \"ResultPath\": \"$.error\"\n      }],\n      \"Next\": \"Extract\"\n    },\n    \"Extract\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::lambda:invoke\",\n      \"Parameters\": { \"FunctionName\": \"rag-extract\" },\n      \"Next\": \"Enrich\"\n    },\n    \"Enrich\": {\n      \"Type\": \"Parallel\",\n      \"Branches\": [\n        {\n          \"StartAt\": \"ExtractMetadata\",\n          \"States\": {\n            \"ExtractMetadata\": {\n              \"Type\": \"Task\",\n              \"Resource\": \"arn:aws:states:::glue:startJobRun\",\n              \"Parameters\": {\n                \"JobName\": \"rag-metadata-enrichment\",\n                \"Arguments\": {\n                  \"--input-path\": \"$.extractedPath\",\n                  \"--output-path\": \"$.enrichedPath\"\n                }\n              },\n              \"End\": true\n            }\n          }\n        },\n        {\n          \"StartAt\": \"GenerateEmbeddings\",\n          \"States\": {\n            \"GenerateEmbeddings\": {\n              \"Type\": \"Task\",\n              \"Resource\": \"arn:aws:states:::lambda:invoke\",\n              \"Parameters\": {\n                \"FunctionName\": \"rag-embed\",\n                \"Payload\": {\n                  \"text\": \"$.extractedText\",\n                  \"model\": \"amazon.titan-embed-text-v1\",\n                  \"dimensions\": 1024\n                }\n              },\n              \"Retry\": [{\n                \"ErrorEquals\": [\"Lambda.ThrottlingException\"],\n                \"IntervalSeconds\": 5,\n                \"MaxAttempts\": 5,\n                \"BackoffRate\": 2.0\n              }],\n              \"End\": true\n            }\n          }\n        }\n      ],\n      \"Next\": \"Load\"\n    },\n    \"Load\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::lambda:invoke\",\n      \"Parameters\": {\n        \"FunctionName\": \"rag-opensearch-indexer\",\n        \"Payload\": {\n          \"embeddings\": \"$.embeddings\",\n          \"metadata\": \"$.metadata\",\n          \"documentId\": \"$.documentId\"\n        }\n      },\n      \"End\": true\n    },\n    \"SendToDLQ\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::sqs:sendMessage\",\n      \"Parameters\": {\n        \"QueueUrl\": \"${DLQ_URL}\",\n        \"MessageBody\": \"$\"\n      },\n      \"End\": true\n    }\n  }\n}"
        },
        {
          "type": "paragraph",
          "content": "Validation retries Lambda errors three times with backoff, and whatever still fails lands in `SendToDLQ`. Metadata enrichment (a Glue job) and embedding generation run side by side, and the embedding branch has its own retry policy for throttling."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "From document to vectors: extract, chunk, embed"
        },
        {
          "type": "paragraph",
          "content": "Textract pulls out tables, Bedrock Titan multimodal models write quick summaries, and Comprehend normalises the language. Embeddings come from a SageMaker Serverless Endpoint with auto-scaling warm pools, which avoids cold-start spikes during business hours."
        },
        {
          "type": "paragraph",
          "content": "Chunking matters most for cost and quality. An embedding model reads a limited window of text, so documents are cut into chunks, and a sentence cut in half loses its meaning in both halves. The fix is overlap, the trick behind panorama photos: each frame repeats a strip of the one before. We typically use 200-token chunks with a 50-token overlap, and embed tables as separate chunks linked to their source through metadata. Look at the loop step, `chunk_size - overlap`, and at what happens when an embedding call fails:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nimport json\nfrom typing import List, Dict\nimport tiktoken  # For token counting\n\nbedrock = boto3.client('bedrock-runtime')\nsagemaker = boto3.client('sagemaker-runtime')\n\nclass DocumentChunker:\n    \"\"\"Intelligent chunking with overlap and metadata preservation.\"\"\"\n    \n    def __init__(self, chunk_size: int = 200, overlap: int = 50):\n        self.chunk_size = chunk_size\n        self.overlap = overlap\n        self.encoding = tiktoken.get_encoding(\"cl100k_base\")\n    \n    def chunk_with_overlap(self, text: str, metadata: Dict) -> List[Dict]:\n        \"\"\"Split text into overlapping chunks preserving context.\"\"\"\n        tokens = self.encoding.encode(text)\n        chunks = []\n        \n        for i in range(0, len(tokens), self.chunk_size - self.overlap):\n            chunk_tokens = tokens[i:i + self.chunk_size]\n            chunk_text = self.encoding.decode(chunk_tokens)\n            \n            chunks.append({\n                'text': chunk_text,\n                'chunk_index': len(chunks),\n                'start_token': i,\n                'end_token': min(i + self.chunk_size, len(tokens)),\n                'metadata': {\n                    **metadata,\n                    'chunk_id': f\"{metadata['document_id']}_chunk_{len(chunks)}\"\n                }\n            })\n        \n        return chunks\n    \n    def extract_tables(self, pdf_path: str) -> List[Dict]:\n        \"\"\"Extract tables from PDF using Textract.\"\"\"\n        textract = boto3.client('textract')\n        response = textract.analyze_document(\n            Document={'S3Object': {'Bucket': 'rag-documents', 'Name': pdf_path}},\n            FeatureTypes=['TABLES']\n        )\n        \n        tables = []\n        for block in response['Blocks']:\n            if block['BlockType'] == 'TABLE':\n                tables.append({\n                    'table_id': block['Id'],\n                    'cells': self._extract_table_cells(block, response['Blocks']),\n                    'metadata': {'source': pdf_path, 'page': block.get('Page', 1)}\n                })\n        \n        return tables\n    \n    def generate_embeddings_batch(self, chunks: List[Dict]) -> List[Dict]:\n        \"\"\"Batch embedding generation with retry logic.\"\"\"\n        embeddings = []\n        \n        for chunk in chunks:\n            try:\n                response = sagemaker.invoke_endpoint(\n                    EndpointName='titan-embed-endpoint',\n                    ContentType='application/json',\n                    Body=json.dumps({\n                        'inputText': chunk['text'],\n                        'dimensions': 1024\n                    })\n                )\n                \n                embedding = json.loads(response['Body'].read())['embedding']\n                \n                embeddings.append({\n                    **chunk,\n                    'embedding': embedding,\n                    'embedding_model': 'amazon.titan-embed-text-v1',\n                    'embedding_dimensions': len(embedding)\n                })\n            except Exception as e:\n                # Log and continue - failed chunks go to DLQ\n                print(f\"Failed to embed chunk {chunk['chunk_id']}: {e}\")\n                continue\n        \n        return embeddings"
        },
        {
          "type": "paragraph",
          "content": "Each chunk carries its document ID, token range and model, for tracing answers later. A failed chunk is logged and skipped instead of failing the whole document, and goes to the DLQ."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Case study: 200k PDFs a day that can't leave the EU"
        },
        {
          "type": "paragraph",
          "content": "A European fintech aggregates 200k PDF disclosures daily across multiple regulatory jurisdictions. Documents from EU customers couldn't leave the EU, but users needed one unified search. We split the workload across three regions (eu-west-1, eu-central-1, eu-north-1) with regional S3 buckets, and centralised the OpenSearch Serverless collection in eu-west-1 with cross-region replication. A Step Functions `Map` state, which runs the same sub-workflow once per item, processed the regions in parallel, all writing to the same collection through VPC endpoints."
        },
        {
          "type": "paragraph",
          "content": "Storage was the other lever. Glue jobs write Parquet + Snappy artifacts to S3, the last 30 days stay hot, and older embeddings move to Glacier Instant Retrieval. Look at the `StorageClass` in the archiving job:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nfrom datetime import datetime, timedelta\n\ns3 = boto3.client('s3')\nglue = boto3.client('glue')\n\ndef archive_old_embeddings():\n    \"\"\"Archive embeddings older than 30 days to Glacier Instant Retrieval.\"\"\"\n    bucket = 'rag-embeddings-prod'\n    prefix = 'embeddings/'\n    \n    cutoff_date = datetime.now() - timedelta(days=30)\n    \n    paginator = s3.get_paginator('list_objects_v2')\n    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):\n        for obj in page.get('Contents', []):\n            if obj['LastModified'] < cutoff_date:\n                # Copy to Glacier Instant Retrieval\n                copy_source = {'Bucket': bucket, 'Key': obj['Key']}\n                s3.copy_object(\n                    CopySource=copy_source,\n                    Bucket=bucket,\n                    Key=obj['Key'].replace('embeddings/', 'archive/'),\n                    StorageClass='GLACIER_IR',\n                    Metadata={\n                        'original-date': obj['LastModified'].isoformat(),\n                        'archived-date': datetime.now().isoformat()\n                    }\n                )\n                # Delete from hot storage\n                s3.delete_object(Bucket=bucket, Key=obj['Key'])\n                print(f\"Archived {obj['Key']} to Glacier IR\")"
        },
        {
          "type": "paragraph",
          "content": "It copies each object older than the cutoff to `archive/` in `GLACIER_IR`, notes the original date, and deletes the hot copy. Result: 41% storage savings ($2,300/month less) and search under 200ms p95, within the SLA."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Case study: webhook storms and a circuit breaker"
        },
        {
          "type": "paragraph",
          "content": "An ITSM provider needed incident tickets from Jira, ServiceNow and PagerDuty searchable within 5 minutes. The catch: incidents are exactly when tickets spike, and a webhook storm could flatten the pipeline at the worst moment. So EventBridge triggers the pipeline every five minutes with batching. Step Functions isolates the embedding branch, so a failure there doesn't block metadata enrichment. Failed embeddings land on an SQS DLQ and are replayed with exponential backoff, without redeploying. Lambda reserved concurrency (50 concurrent executions) prevents cascading failures."
        },
        {
          "type": "paragraph",
          "content": "The key pattern is a circuit breaker, which works like the fuse box at home: it trips before the wiring burns. When embedding failures reach 10% over 5 minutes, the breaker opens and the pipeline degrades: metadata is still enriched and indexed, while embeddings queue for off-peak batch reprocessing. Search survives Bedrock or SageMaker having a bad day. Look at the three states in `_check_state`, and the `max_retries` check in `replay_from_dlq`:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nimport json\nfrom collections import deque\nfrom datetime import datetime, timedelta\n\nsqs = boto3.client('sqs')\ncloudwatch = boto3.client('cloudwatch')\n\nclass CircuitBreaker:\n    \"\"\"Circuit breaker for embedding failures.\"\"\"\n    \n    def __init__(self, failure_threshold: float = 0.1, window_minutes: int = 5):\n        self.failure_threshold = failure_threshold\n        self.window_minutes = window_minutes\n        self.failure_history = deque(maxlen=100)\n        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN\n    \n    def record_failure(self):\n        \"\"\"Record a failure event.\"\"\"\n        self.failure_history.append({\n            'timestamp': datetime.now(),\n            'type': 'failure'\n        })\n        self._check_state()\n    \n    def record_success(self):\n        \"\"\"Record a success event.\"\"\"\n        self.failure_history.append({\n            'timestamp': datetime.now(),\n            'type': 'success'\n        })\n        self._check_state()\n    \n    def _check_state(self):\n        \"\"\"Check if circuit should open/close.\"\"\"\n        now = datetime.now()\n        window_start = now - timedelta(minutes=self.window_minutes)\n        \n        recent_events = [\n            e for e in self.failure_history\n            if e['timestamp'] >= window_start\n        ]\n        \n        if len(recent_events) < 10:\n            return  # Not enough data\n        \n        failures = sum(1 for e in recent_events if e['type'] == 'failure')\n        failure_rate = failures / len(recent_events)\n        \n        if failure_rate >= self.failure_threshold and self.state == 'CLOSED':\n            self.state = 'OPEN'\n            self._publish_metric('CircuitBreakerOpened', 1)\n            print(f\"Circuit breaker OPENED - failure rate: {failure_rate:.2%}\")\n        elif failure_rate < self.failure_threshold / 2 and self.state == 'OPEN':\n            self.state = 'HALF_OPEN'\n            print(\"Circuit breaker HALF_OPEN - testing recovery\")\n        elif self.state == 'HALF_OPEN' and len([e for e in recent_events[-10:] if e['type'] == 'success']) >= 8:\n            self.state = 'CLOSED'\n            self._publish_metric('CircuitBreakerClosed', 1)\n            print(\"Circuit breaker CLOSED - system recovered\")\n    \n    def should_allow_request(self) -> bool:\n        \"\"\"Check if request should be allowed.\"\"\"\n        return self.state != 'OPEN'\n    \n    def _publish_metric(self, metric_name: str, value: float):\n        \"\"\"Publish CloudWatch metric.\"\"\"\n        cloudwatch.put_metric_data(\n            Namespace='RAG/ETL',\n            MetricData=[{\n                'MetricName': metric_name,\n                'Value': value,\n                'Timestamp': datetime.now()\n            }]\n        )\n\ndef replay_from_dlq(limit: int = 10, max_retries: int = 3):\n    \"\"\"Replay failed messages from DLQ with retry tracking.\"\"\"\n    sqs = boto3.client('sqs')\n    \n    messages = sqs.receive_message(\n        QueueUrl=DLQ_URL,\n        MaxNumberOfMessages=limit,\n        AttributeNames=['ApproximateReceiveCount']\n    )\n    \n    for msg in messages.get('Messages', []):\n        retry_count = int(msg['Attributes'].get('ApproximateReceiveCount', 0))\n        \n        if retry_count >= max_retries:\n            # Move to manual review queue\n            sqs.send_message(\n                QueueUrl=MANUAL_REVIEW_QUEUE,\n                MessageBody=msg['Body'],\n                MessageAttributes={\n                    'OriginalDLQReceiptHandle': {'StringValue': msg['ReceiptHandle'], 'DataType': 'String'},\n                    'RetryCount': {'StringValue': str(retry_count), 'DataType': 'Number'}\n                }\n            )\n            sqs.delete_message(QueueUrl=DLQ_URL, ReceiptHandle=msg['ReceiptHandle'])\n            continue\n        \n        # Replay to main queue with exponential backoff delay\n        delay_seconds = min(2 ** retry_count, 900)  # Max 15 minutes\n        \n        sqs.send_message(\n            QueueUrl=MAIN_QUEUE,\n            MessageBody=msg['Body'],\n            DelaySeconds=delay_seconds,\n            MessageAttributes={\n                'RetryCount': {'StringValue': str(retry_count + 1), 'DataType': 'Number'},\n                'OriginalTimestamp': {'StringValue': msg['Attributes'].get('SentTimestamp', ''), 'DataType': 'String'}\n            }\n        )\n        sqs.delete_message(QueueUrl=DLQ_URL, ReceiptHandle=msg['ReceiptHandle'])"
        },
        {
          "type": "paragraph",
          "content": "The breaker opens at the threshold, half-opens below half of it, and closes once 8 of the last 10 calls succeed. Replay re-sends DLQ messages with a delay that doubles each attempt, capped at 15 minutes, and parks repeat offenders in a manual review queue."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Two rules keep the bill predictable"
        },
        {
          "type": "paragraph",
          "content": "Micro-batching: each run processes at most 5 minutes of payload, so cost grows in steps, not in spikes you discover on the invoice. Aggressive tagging: every resource carries `env`, `rag-etl`, `customer` and `cost-center` tags, so AWS Cost Explorer can split spend by feature."
        },
        {
          "type": "paragraph",
          "content": "For the vector store, start with OpenSearch Serverless (2 OCUs baseline; an OCU is its unit of compute) and move to Aurora PostgreSQL + pgvector when you need relational joins or tenant isolation. Cost Anomaly Detection alerts when daily spend exceeds baseline by 20%, and CloudWatch alarms on each Lambda's duration and memory drive right-sizing. Provisioned concurrency (at $0.015 per GB-second) removes cold starts, but add it only after profiling shows they actually hurt the SLA. The tags pay off in scripts like this one; look at the `GroupBy`:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nfrom datetime import datetime, timedelta\n\nce = boto3.client('ce')  # Cost Explorer\ncloudwatch = boto3.client('cloudwatch')\n\ndef analyze_rag_costs(start_date: str, end_date: str):\n    \"\"\"Analyze RAG ETL costs by service and resource.\"\"\"\n    response = ce.get_cost_and_usage(\n        TimePeriod={'Start': start_date, 'End': end_date},\n        Granularity='DAILY',\n        Metrics=['UnblendedCost'],\n        GroupBy=[\n            {'Type': 'DIMENSION', 'Key': 'SERVICE'},\n            {'Type': 'TAG', 'Key': 'rag-etl'}\n        ],\n        Filter={\n            'Tags': {\n                'Key': 'rag-etl',\n                'Values': ['true']\n            }\n        }\n    )\n    \n    costs_by_service = {}\n    for result in response['ResultsByTime']:\n        for group in result['Groups']:\n            service = group['Keys'][0]\n            cost = float(group['Metrics']['UnblendedCost']['Amount'])\n            costs_by_service[service] = costs_by_service.get(service, 0) + cost\n    \n    # Identify optimization opportunities\n    total_cost = sum(costs_by_service.values())\n    print(f\"Total RAG ETL cost: ${total_cost:.2f}\")\n    \n    for service, cost in sorted(costs_by_service.items(), key=lambda x: x[1], reverse=True):\n        percentage = (cost / total_cost) * 100\n        print(f\"{service}: ${cost:.2f} ({percentage:.1f}%)\")\n        \n        # Recommendations\n        if service == 'Amazon SageMaker' and percentage > 30:\n            print(\"  → Consider using Bedrock instead for embeddings (60% cost reduction)\")\n        elif service == 'AWS Lambda' and percentage > 25:\n            print(\"  → Review memory allocation and consider ARM-based Graviton2 (20% cheaper)\")\n        elif service == 'Amazon OpenSearch Service' and percentage > 20:\n            print(\"  → Evaluate moving to Aurora PostgreSQL + pgvector for cost savings\")"
        },
        {
          "type": "paragraph",
          "content": "It sums cost per service, prints each share, and flags the services worth a second look."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Measure every document and record where each answer came from"
        },
        {
          "type": "paragraph",
          "content": "Instrument everything with CloudWatch Embedded Metric Format (EMF): you print a JSON log line with an `_aws` header and CloudWatch turns it into a metric. Chart ingestion latency, embedding cost per document and failure rate per data source. Then store provenance (source URL, checksum, embedding model version, processing timestamp) in OpenSearch next to each document. When an auditor asks \"why did the assistant mention X?\", or you're chasing a hallucination, the answer traces back to its source. Look at the `_aws` block and the provenance fields:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import json\nfrom datetime import datetime\nfrom typing import Dict, Any\n\nclass RAGMetrics:\n    \"\"\"CloudWatch EMF metrics for RAG ETL pipeline.\"\"\"\n    \n    @staticmethod\n    def emit_ingestion_metric(document_id: str, latency_ms: float, \n                             datasource: str, success: bool):\n        \"\"\"Emit ingestion latency metric.\"\"\"\n        metric = {\n            '_aws': {\n                'CloudWatchMetrics': [{\n                    'Namespace': 'RAG/ETL',\n                    'Metrics': [{\n                        'MetricName': 'IngestionLatency',\n                        'Unit': 'Milliseconds'\n                    }],\n                    'Dimensions': [['DocumentId', 'DataSource', 'Status']]\n                }],\n                'Timestamp': int(datetime.now().timestamp() * 1000)\n            },\n            'DocumentId': document_id,\n            'DataSource': datasource,\n            'Status': 'Success' if success else 'Failure',\n            'IngestionLatency': latency_ms\n        }\n        print(json.dumps(metric))\n    \n    @staticmethod\n    def emit_embedding_cost(document_id: str, cost_usd: float, \n                           model: str, dimensions: int):\n        \"\"\"Emit embedding cost metric.\"\"\"\n        metric = {\n            '_aws': {\n                'CloudWatchMetrics': [{\n                    'Namespace': 'RAG/ETL',\n                    'Metrics': [{\n                        'MetricName': 'EmbeddingCost',\n                        'Unit': 'None'\n                    }],\n                    'Dimensions': [['Model', 'Dimensions']]\n                }],\n                'Timestamp': int(datetime.now().timestamp() * 1000)\n            },\n            'DocumentId': document_id,\n            'Model': model,\n            'Dimensions': dimensions,\n            'EmbeddingCost': cost_usd\n        }\n        print(json.dumps(metric))\n    \n    @staticmethod\n    def store_provenance_metadata(document_id: str, metadata: Dict[str, Any]):\n        \"\"\"Store provenance metadata in OpenSearch.\"\"\"\n        provenance = {\n            'document_id': document_id,\n            'source_url': metadata.get('source_url'),\n            'checksum': metadata.get('checksum'),\n            'embedding_model': metadata.get('embedding_model'),\n            'model_version': metadata.get('model_version'),\n            'processing_timestamp': datetime.now().isoformat(),\n            'processing_pipeline_version': metadata.get('pipeline_version', '1.0.0'),\n            'datasource': metadata.get('datasource'),\n            'extraction_method': metadata.get('extraction_method'),\n            'chunk_count': metadata.get('chunk_count', 0)\n        }\n        \n        # Index to OpenSearch with TTL for compliance\n        # This allows tracing RAG responses back to source documents\n        return provenance"
        },
        {
          "type": "paragraph",
          "content": "The `emit_` methods print metrics that CloudWatch picks up from the logs; `store_provenance_metadata` builds the record indexed with the document."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "One tenant must never read another's documents"
        },
        {
          "type": "paragraph",
          "content": "For SaaS providers, tenant isolation is non-negotiable. In OpenSearch you either use document-level access control (DLAC), row-level security inside a shared index, or give each tenant its own index, which scales better but needs automated index management. Healthcare and finance also get encryption at rest with KMS customer-managed keys, and VPC endpoints so traffic never leaves AWS's network. The rest of the baseline: least-privilege IAM roles, Secrets Manager for API keys and database credentials, CloudTrail for every API call, regular AWS Security Hub audits, and Amazon Macie scanning for sensitive data (DLP, data loss prevention) before indexing. Look at the per-tenant key alias and secret path:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nimport json\nfrom typing import Dict, List\n\nkms = boto3.client('kms')\nsecrets = boto3.client('secretsmanager')\nmacie = boto3.client('macie2')\n\nclass SecureRAGPipeline:\n    \"\"\"Security-hardened RAG pipeline with DLP and encryption.\"\"\"\n    \n    def __init__(self, kms_key_id: str):\n        self.kms_key_id = kms_key_id\n    \n    def scan_for_sensitive_data(self, s3_key: str, bucket: str) -> Dict:\n        \"\"\"Scan document for PII/PHI before processing.\"\"\"\n        # Use Macie to detect sensitive data\n        response = macie.create_classification_job(\n            jobType='ONE_TIME',\n            s3JobDefinition={\n                'bucketDefinitions': [{\n                    'accountId': boto3.client('sts').get_caller_identity()['Account'],\n                    'buckets': [bucket]\n                }],\n                'scoping': {\n                    'includes': {\n                        'and': [{\n                            'simpleScopeTerm': {\n                                'key': 'OBJECT_KEY',\n                                'values': [s3_key]\n                            }\n                        }]\n                    }\n                }\n            },\n            name=f'dlp-scan-{s3_key.replace(\"/\", \"-\")}'\n        )\n        \n        return {\n            'job_id': response['jobId'],\n            'status': 'PENDING'\n        }\n    \n    def encrypt_embedding(self, embedding: List[float], tenant_id: str) -> bytes:\n        \"\"\"Encrypt embedding using tenant-specific KMS key.\"\"\"\n        response = kms.encrypt(\n            KeyId=f'alias/rag-tenant-{tenant_id}',\n            Plaintext=json.dumps(embedding).encode('utf-8')\n        )\n        return response['CiphertextBlob']\n    \n    def get_tenant_credentials(self, tenant_id: str) -> Dict:\n        \"\"\"Retrieve tenant-specific credentials from Secrets Manager.\"\"\"\n        secret_name = f'rag/tenant/{tenant_id}/credentials'\n        response = secrets.get_secret_value(SecretId=secret_name)\n        return json.loads(response['SecretString'])"
        },
        {
          "type": "paragraph",
          "content": "Macie scans for personal and health data before processing; each tenant gets its own KMS key and its own secret."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Targets, and where it usually gets slow"
        },
        {
          "type": "paragraph",
          "content": "Four numbers live on CloudWatch dashboards, with alarms that page through PagerDuty: end-to-end latency under 5 minutes for a 10MB document, over 100 documents embedded per minute, over 1000 docs per second indexed in OpenSearch, and an error rate under 0.1%. The usual bottlenecks:"
        },
        {
          "type": "list",
          "items": [
            "Textract on large PDFs: process asynchronously, driven by S3 event notifications.",
            "SageMaker endpoint cold starts: provisioned concurrency or warm-up scripts.",
            "OpenSearch indexing: the bulk API and a proper sharding strategy.",
            "Lambda memory limits: right-size from CloudWatch Insights queries of actual usage."
          ]
        },
        {
          "type": "paragraph",
          "content": "Build the contract and the DLQ first. Everything else is easier to add to a pipeline that already knows how to say no, and where to put what it refused."
        }
      ]
    },
    it: {
      "title": "RAG su AWS: dati freschi, bolletta ferma",
      "description": "Un assistente RAG è fresco quanto il suo vector store. Una pipeline ETL su AWS con EventBridge, Step Functions, Bedrock e OpenSearch che lo tiene pulito, regge i guasti e non ti fa sorprese in bolletta.",
      "content": [
        {
          "type": "paragraph",
          "content": "Un cliente chiede i prezzi al tuo assistente di supporto. Risponde al volo, sicurissimo. Con i numeri del trimestre scorso. Non è crollato niente: il modello ha solo pescato dallo scaffale sbagliato."
        },
        {
          "type": "paragraph",
          "content": "Un sistema RAG (retrieval-augmented generation) fallisce così. Il modello risponde partendo da documenti che cerca in un vector store, un indice di embedding: liste di numeri che catturano il significato di un passaggio. Tenerlo aggiornato è un lavoro di ETL (extract, transform, load), e il 'tanto lancio lo script' in produzione non sopravvive. Ho costruito pipeline RAG per banche, sanità ed e-commerce che macinano milioni di documenti al mese. Questi sono i pattern che restano deterministici sotto carichi caotici, senza incenerire il budget:"
        },
        {
          "type": "list",
          "items": [
            "La forma: un contratto all'ingresso, una macchina a stati nel mezzo.",
            "Dal documento ai vettori: estrazione, chunking, embedding.",
            "Due casi reali: residenza dei dati e tempeste di webhook.",
            "La gestione: costi, osservabilità, sicurezza tra tenant, obiettivi di performance."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un contratto all'ingresso, e i documenti rotti restano fuori"
        },
        {
          "type": "paragraph",
          "content": "I documenti arrivano come nuovi oggetti in S3 o come eventi webhook dai sistemi di ticketing. Le regole di Amazon EventBridge li intercettano tutti e due, e ogni evento avvia una Lambda che valida il payload contro uno schema JSON salvato nel Glue Data Catalog di AWS. Quello schema è un contratto sui dati: la pipeline processa tutto quello che lo rispetta. Il resto, no."
        },
        {
          "type": "paragraph",
          "content": "Perché tanto rigore, e così presto? Perché ho visto un singolo PDF malformato corrompere un batch intero. La validazione controlla struttura, dimensione (massimo 50MB per documento), tipo MIME e metadati obbligatori. Occhio alle due regole di business dopo il controllo dello schema:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import json\nimport boto3\nfrom jsonschema import validate, ValidationError\nfrom typing import Dict, Any\n\ns3 = boto3.client('s3')\nglue = boto3.client('glue')\n\ndef validate_payload(event: Dict[str, Any]) -> Dict[str, Any]:\n    \"\"\"Valida il payload del documento contro lo schema Glue.\"\"\"\n    schema = glue.get_schema(\n        SchemaId={'SchemaName': 'rag-document-schema', 'RegistryName': 'rag-registry'}\n    )\n    \n    try:\n        validate(instance=event, schema=json.loads(schema['SchemaDefinition']))\n        \n        # Regole di business aggiuntive\n        if event['fileSize'] > 50 * 1024 * 1024:  # Limite 50MB\n            raise ValueError(f\"Dimensione file {event['fileSize']} supera il limite di 50MB\")\n        \n        if event['mimeType'] not in ['application/pdf', 'text/plain', 'text/markdown']:\n            raise ValueError(f\"Tipo MIME non supportato: {event['mimeType']}\")\n        \n        return {'valid': True, 'payload': event}\n    except ValidationError as e:\n        return {'valid': False, 'error': str(e), 'payload': event}"
        },
        {
          "type": "paragraph",
          "content": "Quello che non passa torna come `valid: False`, con l'errore attaccato, e finisce in una dead-letter queue (DLQ). Tradotto: una coda di parcheggio per i messaggi che non si possono processare. Chi è di turno fa triage lì, non a scavare nei log di CloudWatch."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Step Functions tiene il volante e raccoglie i cocci"
        },
        {
          "type": "paragraph",
          "content": "I payload validi passano ad AWS Step Functions, una macchina a stati gestita: descrivi passi e transizioni in JSON, e AWS li esegue, li ritenta e li registra. Guarda i blocchi `Retry` e `Catch` sul primo stato, e `Enrich`, uno stato `Parallel` con due rami:"
        },
        {
          "type": "code",
          "language": "json",
          "code": "{\n  \"StartAt\": \"ValidatePayload\",\n  \"States\": {\n    \"ValidatePayload\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::lambda:invoke\",\n      \"Parameters\": {\n        \"FunctionName\": \"rag-validate\",\n        \"Payload\": {\n          \"s3Key\": \"$.s3Key\",\n          \"bucket\": \"$.bucket\",\n          \"source\": \"$.source\"\n        }\n      },\n      \"Retry\": [{\n        \"ErrorEquals\": [\"Lambda.ServiceException\", \"Lambda.AWSLambdaException\"],\n        \"IntervalSeconds\": 2,\n        \"MaxAttempts\": 3,\n        \"BackoffRate\": 2.0\n      }],\n      \"Catch\": [{\n        \"ErrorEquals\": [\"States.ALL\"],\n        \"Next\": \"SendToDLQ\",\n        \"ResultPath\": \"$.error\"\n      }],\n      \"Next\": \"Extract\"\n    },\n    \"Extract\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::lambda:invoke\",\n      \"Parameters\": { \"FunctionName\": \"rag-extract\" },\n      \"Next\": \"Enrich\"\n    },\n    \"Enrich\": {\n      \"Type\": \"Parallel\",\n      \"Branches\": [\n        {\n          \"StartAt\": \"ExtractMetadata\",\n          \"States\": {\n            \"ExtractMetadata\": {\n              \"Type\": \"Task\",\n              \"Resource\": \"arn:aws:states:::glue:startJobRun\",\n              \"Parameters\": {\n                \"JobName\": \"rag-metadata-enrichment\",\n                \"Arguments\": {\n                  \"--input-path\": \"$.extractedPath\",\n                  \"--output-path\": \"$.enrichedPath\"\n                }\n              },\n              \"End\": true\n            }\n          }\n        },\n        {\n          \"StartAt\": \"GenerateEmbeddings\",\n          \"States\": {\n            \"GenerateEmbeddings\": {\n              \"Type\": \"Task\",\n              \"Resource\": \"arn:aws:states:::lambda:invoke\",\n              \"Parameters\": {\n                \"FunctionName\": \"rag-embed\",\n                \"Payload\": {\n                  \"text\": \"$.extractedText\",\n                  \"model\": \"amazon.titan-embed-text-v1\",\n                  \"dimensions\": 1024\n                }\n              },\n              \"Retry\": [{\n                \"ErrorEquals\": [\"Lambda.ThrottlingException\"],\n                \"IntervalSeconds\": 5,\n                \"MaxAttempts\": 5,\n                \"BackoffRate\": 2.0\n              }],\n              \"End\": true\n            }\n          }\n        }\n      ],\n      \"Next\": \"Load\"\n    },\n    \"Load\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::lambda:invoke\",\n      \"Parameters\": {\n        \"FunctionName\": \"rag-opensearch-indexer\",\n        \"Payload\": {\n          \"embeddings\": \"$.embeddings\",\n          \"metadata\": \"$.metadata\",\n          \"documentId\": \"$.documentId\"\n        }\n      },\n      \"End\": true\n    },\n    \"SendToDLQ\": {\n      \"Type\": \"Task\",\n      \"Resource\": \"arn:aws:states:::sqs:sendMessage\",\n      \"Parameters\": {\n        \"QueueUrl\": \"${DLQ_URL}\",\n        \"MessageBody\": \"$\"\n      },\n      \"End\": true\n    }\n  }\n}"
        },
        {
          "type": "paragraph",
          "content": "La validazione ritenta tre volte gli errori di Lambda, con backoff. Se fallisce ancora, dritto in `SendToDLQ`. L'arricchimento dei metadati (un job Glue) e la generazione degli embedding girano in parallelo, e il ramo degli embedding ha la sua policy di retry per il throttling."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Dal documento ai vettori: estrai, spezza, incorpora"
        },
        {
          "type": "paragraph",
          "content": "Textract tira fuori le tabelle, i modelli multimodali Bedrock Titan scrivono riassunti rapidi e Comprehend normalizza la lingua. Gli embedding arrivano da un SageMaker Serverless Endpoint con warm pool in auto-scaling, così in orario d'ufficio niente picchi di cold start."
        },
        {
          "type": "paragraph",
          "content": "Il chunking è il passo che pesa di più su costi e qualità. Un modello di embedding legge una finestra di testo limitata, quindi i documenti li devi spezzare in chunk. E una frase tagliata a metà perde senso in tutte e due le metà. La soluzione è la sovrapposizione, il trucco delle foto panoramiche: ogni scatto ripete una striscia del precedente. Di solito usiamo chunk da 200 token con 50 token di sovrapposizione, e le tabelle diventano chunk a parte, collegati alla fonte via metadati. Guarda il passo del ciclo, `chunk_size - overlap`, e cosa succede quando una chiamata di embedding fallisce:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nimport json\nfrom typing import List, Dict\nimport tiktoken  # For token counting\n\nbedrock = boto3.client('bedrock-runtime')\nsagemaker = boto3.client('sagemaker-runtime')\n\nclass DocumentChunker:\n    \"\"\"Intelligent chunking with overlap and metadata preservation.\"\"\"\n    \n    def __init__(self, chunk_size: int = 200, overlap: int = 50):\n        self.chunk_size = chunk_size\n        self.overlap = overlap\n        self.encoding = tiktoken.get_encoding(\"cl100k_base\")\n    \n    def chunk_with_overlap(self, text: str, metadata: Dict) -> List[Dict]:\n        \"\"\"Split text into overlapping chunks preserving context.\"\"\"\n        tokens = self.encoding.encode(text)\n        chunks = []\n        \n        for i in range(0, len(tokens), self.chunk_size - self.overlap):\n            chunk_tokens = tokens[i:i + self.chunk_size]\n            chunk_text = self.encoding.decode(chunk_tokens)\n            \n            chunks.append({\n                'text': chunk_text,\n                'chunk_index': len(chunks),\n                'start_token': i,\n                'end_token': min(i + self.chunk_size, len(tokens)),\n                'metadata': {\n                    **metadata,\n                    'chunk_id': f\"{metadata['document_id']}_chunk_{len(chunks)}\"\n                }\n            })\n        \n        return chunks\n    \n    def extract_tables(self, pdf_path: str) -> List[Dict]:\n        \"\"\"Extract tables from PDF using Textract.\"\"\"\n        textract = boto3.client('textract')\n        response = textract.analyze_document(\n            Document={'S3Object': {'Bucket': 'rag-documents', 'Name': pdf_path}},\n            FeatureTypes=['TABLES']\n        )\n        \n        tables = []\n        for block in response['Blocks']:\n            if block['BlockType'] == 'TABLE':\n                tables.append({\n                    'table_id': block['Id'],\n                    'cells': self._extract_table_cells(block, response['Blocks']),\n                    'metadata': {'source': pdf_path, 'page': block.get('Page', 1)}\n                })\n        \n        return tables\n    \n    def generate_embeddings_batch(self, chunks: List[Dict]) -> List[Dict]:\n        \"\"\"Batch embedding generation with retry logic.\"\"\"\n        embeddings = []\n        \n        for chunk in chunks:\n            try:\n                response = sagemaker.invoke_endpoint(\n                    EndpointName='titan-embed-endpoint',\n                    ContentType='application/json',\n                    Body=json.dumps({\n                        'inputText': chunk['text'],\n                        'dimensions': 1024\n                    })\n                )\n                \n                embedding = json.loads(response['Body'].read())['embedding']\n                \n                embeddings.append({\n                    **chunk,\n                    'embedding': embedding,\n                    'embedding_model': 'amazon.titan-embed-text-v1',\n                    'embedding_dimensions': len(embedding)\n                })\n            except Exception as e:\n                # Log and continue - failed chunks go to DLQ\n                print(f\"Failed to embed chunk {chunk['chunk_id']}: {e}\")\n                continue\n        \n        return embeddings"
        },
        {
          "type": "paragraph",
          "content": "Ogni chunk si porta dietro l'ID del documento, l'intervallo di token e il modello, così poi risali all'origine delle risposte. Un chunk fallito viene loggato e saltato, invece di affondare tutto il documento, e finisce nella DLQ."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Caso reale: 200k PDF al giorno che non possono uscire dall'UE"
        },
        {
          "type": "paragraph",
          "content": "Una fintech europea aggrega ogni giorno 200k PDF di disclosure da più giurisdizioni regolatorie. I documenti dei clienti UE non potevano lasciare l'UE, ma agli utenti serviva una ricerca unica. Abbiamo diviso il carico su tre regioni (eu-west-1, eu-central-1, eu-north-1) con bucket S3 regionali, e centralizzato la collezione OpenSearch Serverless in eu-west-1 con la replica cross-region. Uno stato `Map` di Step Functions, che esegue lo stesso sotto-flusso per ogni elemento, ha macinato le regioni in parallelo, tutte a scrivere nella stessa collezione via VPC endpoint."
        },
        {
          "type": "paragraph",
          "content": "L'altra leva era lo storage. I job Glue scrivono su S3 artifact Parquet + Snappy, gli ultimi 30 giorni restano nello storage caldo e gli embedding più vecchi scendono in Glacier Instant Retrieval. Guarda la `StorageClass` nel job di archiviazione:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nfrom datetime import datetime, timedelta\n\ns3 = boto3.client('s3')\nglue = boto3.client('glue')\n\ndef archive_old_embeddings():\n    \"\"\"Archive embeddings older than 30 days to Glacier Instant Retrieval.\"\"\"\n    bucket = 'rag-embeddings-prod'\n    prefix = 'embeddings/'\n    \n    cutoff_date = datetime.now() - timedelta(days=30)\n    \n    paginator = s3.get_paginator('list_objects_v2')\n    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):\n        for obj in page.get('Contents', []):\n            if obj['LastModified'] < cutoff_date:\n                # Copy to Glacier Instant Retrieval\n                copy_source = {'Bucket': bucket, 'Key': obj['Key']}\n                s3.copy_object(\n                    CopySource=copy_source,\n                    Bucket=bucket,\n                    Key=obj['Key'].replace('embeddings/', 'archive/'),\n                    StorageClass='GLACIER_IR',\n                    Metadata={\n                        'original-date': obj['LastModified'].isoformat(),\n                        'archived-date': datetime.now().isoformat()\n                    }\n                )\n                # Delete from hot storage\n                s3.delete_object(Bucket=bucket, Key=obj['Key'])\n                print(f\"Archived {obj['Key']} to Glacier IR\")"
        },
        {
          "type": "paragraph",
          "content": "Copia ogni oggetto più vecchio della soglia sotto `archive/` in `GLACIER_IR`, si segna la data originale e cancella la copia calda. Risultato: 41% di risparmio sullo storage ($2,300/mese in meno) e ricerca sotto i 200ms al p95. Dentro lo SLA."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Caso reale: tempeste di webhook e un circuit breaker"
        },
        {
          "type": "paragraph",
          "content": "Un provider ITSM voleva i ticket di incidente da Jira, ServiceNow e PagerDuty ricercabili entro 5 minuti. Il problema: durante un incidente i ticket esplodono, e una tempesta di webhook poteva stendere la pipeline proprio nel momento peggiore. Quindi EventBridge avvia la pipeline ogni cinque minuti, a batch. Step Functions isola il ramo degli embedding, così se si rompe lì l'arricchimento dei metadati va avanti. Gli embedding falliti finiscono in una DLQ SQS e vengono rigiocati con backoff esponenziale, senza rifare il deploy. La reserved concurrency di Lambda (50 esecuzioni concorrenti) ferma i guasti a cascata."
        },
        {
          "type": "paragraph",
          "content": "Il pattern chiave è un circuit breaker. Funziona come il salvavita di casa: scatta prima che bruci l'impianto. Quando i fallimenti degli embedding arrivano al 10% in 5 minuti, il breaker si apre e la pipeline degrada con calma: i metadati vengono comunque arricchiti e indicizzati, gli embedding si mettono in coda per un giro a batch fuori dalle ore di punta. La ricerca sopravvive anche alla giornata storta di Bedrock o SageMaker. Guarda i tre stati in `_check_state` e il controllo su `max_retries` in `replay_from_dlq`:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nimport json\nfrom collections import deque\nfrom datetime import datetime, timedelta\n\nsqs = boto3.client('sqs')\ncloudwatch = boto3.client('cloudwatch')\n\nclass CircuitBreaker:\n    \"\"\"Circuit breaker for embedding failures.\"\"\"\n    \n    def __init__(self, failure_threshold: float = 0.1, window_minutes: int = 5):\n        self.failure_threshold = failure_threshold\n        self.window_minutes = window_minutes\n        self.failure_history = deque(maxlen=100)\n        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN\n    \n    def record_failure(self):\n        \"\"\"Record a failure event.\"\"\"\n        self.failure_history.append({\n            'timestamp': datetime.now(),\n            'type': 'failure'\n        })\n        self._check_state()\n    \n    def record_success(self):\n        \"\"\"Record a success event.\"\"\"\n        self.failure_history.append({\n            'timestamp': datetime.now(),\n            'type': 'success'\n        })\n        self._check_state()\n    \n    def _check_state(self):\n        \"\"\"Check if circuit should open/close.\"\"\"\n        now = datetime.now()\n        window_start = now - timedelta(minutes=self.window_minutes)\n        \n        recent_events = [\n            e for e in self.failure_history\n            if e['timestamp'] >= window_start\n        ]\n        \n        if len(recent_events) < 10:\n            return  # Not enough data\n        \n        failures = sum(1 for e in recent_events if e['type'] == 'failure')\n        failure_rate = failures / len(recent_events)\n        \n        if failure_rate >= self.failure_threshold and self.state == 'CLOSED':\n            self.state = 'OPEN'\n            self._publish_metric('CircuitBreakerOpened', 1)\n            print(f\"Circuit breaker OPENED - failure rate: {failure_rate:.2%}\")\n        elif failure_rate < self.failure_threshold / 2 and self.state == 'OPEN':\n            self.state = 'HALF_OPEN'\n            print(\"Circuit breaker HALF_OPEN - testing recovery\")\n        elif self.state == 'HALF_OPEN' and len([e for e in recent_events[-10:] if e['type'] == 'success']) >= 8:\n            self.state = 'CLOSED'\n            self._publish_metric('CircuitBreakerClosed', 1)\n            print(\"Circuit breaker CLOSED - system recovered\")\n    \n    def should_allow_request(self) -> bool:\n        \"\"\"Check if request should be allowed.\"\"\"\n        return self.state != 'OPEN'\n    \n    def _publish_metric(self, metric_name: str, value: float):\n        \"\"\"Publish CloudWatch metric.\"\"\"\n        cloudwatch.put_metric_data(\n            Namespace='RAG/ETL',\n            MetricData=[{\n                'MetricName': metric_name,\n                'Value': value,\n                'Timestamp': datetime.now()\n            }]\n        )\n\ndef replay_from_dlq(limit: int = 10, max_retries: int = 3):\n    \"\"\"Replay failed messages from DLQ with retry tracking.\"\"\"\n    sqs = boto3.client('sqs')\n    \n    messages = sqs.receive_message(\n        QueueUrl=DLQ_URL,\n        MaxNumberOfMessages=limit,\n        AttributeNames=['ApproximateReceiveCount']\n    )\n    \n    for msg in messages.get('Messages', []):\n        retry_count = int(msg['Attributes'].get('ApproximateReceiveCount', 0))\n        \n        if retry_count >= max_retries:\n            # Move to manual review queue\n            sqs.send_message(\n                QueueUrl=MANUAL_REVIEW_QUEUE,\n                MessageBody=msg['Body'],\n                MessageAttributes={\n                    'OriginalDLQReceiptHandle': {'StringValue': msg['ReceiptHandle'], 'DataType': 'String'},\n                    'RetryCount': {'StringValue': str(retry_count), 'DataType': 'Number'}\n                }\n            )\n            sqs.delete_message(QueueUrl=DLQ_URL, ReceiptHandle=msg['ReceiptHandle'])\n            continue\n        \n        # Replay to main queue with exponential backoff delay\n        delay_seconds = min(2 ** retry_count, 900)  # Max 15 minutes\n        \n        sqs.send_message(\n            QueueUrl=MAIN_QUEUE,\n            MessageBody=msg['Body'],\n            DelaySeconds=delay_seconds,\n            MessageAttributes={\n                'RetryCount': {'StringValue': str(retry_count + 1), 'DataType': 'Number'},\n                'OriginalTimestamp': {'StringValue': msg['Attributes'].get('SentTimestamp', ''), 'DataType': 'String'}\n            }\n        )\n        sqs.delete_message(QueueUrl=DLQ_URL, ReceiptHandle=msg['ReceiptHandle'])"
        },
        {
          "type": "paragraph",
          "content": "Il breaker si apre alla soglia, si semi-apre sotto la metà e si richiude quando 8 delle ultime 10 chiamate vanno a buon fine. Il replay rimanda i messaggi della DLQ con un ritardo che raddoppia a ogni tentativo, fino a 15 minuti. I recidivi finiscono in una coda di revisione a mano."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Due regole, e la bolletta smette di sorprenderti"
        },
        {
          "type": "paragraph",
          "content": "Micro-batching: ogni run processa al massimo 5 minuti di payload, così il costo cresce a gradini e non a picchi che scopri in fattura. Tagging aggressivo: ogni risorsa ha i tag `env`, `rag-etl`, `customer` e `cost-center`, così AWS Cost Explorer ti spacca la spesa per funzionalità."
        },
        {
          "type": "paragraph",
          "content": "Per il vector store parti da OpenSearch Serverless (2 OCU di base; un'OCU è la sua unità di calcolo) e passa ad Aurora PostgreSQL + pgvector quando ti servono join relazionali o isolamento tra tenant. Cost Anomaly Detection ti avvisa quando la spesa giornaliera sfora la baseline del 20%, e gli allarmi CloudWatch su durata e memoria di ogni Lambda guidano il dimensionamento. La provisioned concurrency (a $0.015 per GB-secondo) ammazza i cold start, ma aggiungila solo quando il profiling dimostra che pesano davvero sullo SLA. I tag si ripagano in script come questo. Guarda il `GroupBy`:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nfrom datetime import datetime, timedelta\n\nce = boto3.client('ce')  # Cost Explorer\ncloudwatch = boto3.client('cloudwatch')\n\ndef analyze_rag_costs(start_date: str, end_date: str):\n    \"\"\"Analyze RAG ETL costs by service and resource.\"\"\"\n    response = ce.get_cost_and_usage(\n        TimePeriod={'Start': start_date, 'End': end_date},\n        Granularity='DAILY',\n        Metrics=['UnblendedCost'],\n        GroupBy=[\n            {'Type': 'DIMENSION', 'Key': 'SERVICE'},\n            {'Type': 'TAG', 'Key': 'rag-etl'}\n        ],\n        Filter={\n            'Tags': {\n                'Key': 'rag-etl',\n                'Values': ['true']\n            }\n        }\n    )\n    \n    costs_by_service = {}\n    for result in response['ResultsByTime']:\n        for group in result['Groups']:\n            service = group['Keys'][0]\n            cost = float(group['Metrics']['UnblendedCost']['Amount'])\n            costs_by_service[service] = costs_by_service.get(service, 0) + cost\n    \n    # Identify optimization opportunities\n    total_cost = sum(costs_by_service.values())\n    print(f\"Total RAG ETL cost: ${total_cost:.2f}\")\n    \n    for service, cost in sorted(costs_by_service.items(), key=lambda x: x[1], reverse=True):\n        percentage = (cost / total_cost) * 100\n        print(f\"{service}: ${cost:.2f} ({percentage:.1f}%)\")\n        \n        # Recommendations\n        if service == 'Amazon SageMaker' and percentage > 30:\n            print(\"  → Consider using Bedrock instead for embeddings (60% cost reduction)\")\n        elif service == 'AWS Lambda' and percentage > 25:\n            print(\"  → Review memory allocation and consider ARM-based Graviton2 (20% cheaper)\")\n        elif service == 'Amazon OpenSearch Service' and percentage > 20:\n            print(\"  → Evaluate moving to Aurora PostgreSQL + pgvector for cost savings\")"
        },
        {
          "type": "paragraph",
          "content": "Somma il costo per servizio, stampa le quote e ti segnala i servizi da guardare meglio."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Misura ogni documento, traccia da dove viene ogni risposta"
        },
        {
          "type": "paragraph",
          "content": "Strumenta tutto con il CloudWatch Embedded Metric Format (EMF): stampi una riga di log JSON con un'intestazione `_aws` e CloudWatch la trasforma in metrica. Metti in grafico latenza di ingestione, costo degli embedding per documento e tasso di errore per sorgente. Poi salva la provenienza (URL della fonte, checksum, versione del modello di embedding, timestamp di elaborazione) in OpenSearch, accanto a ogni documento. Quando un auditor chiede \"perché l'assistente ha citato X?\", o stai inseguendo un'allucinazione, la risposta risale alla sua fonte. Guarda il blocco `_aws` e i campi di provenienza:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import json\nfrom datetime import datetime\nfrom typing import Dict, Any\n\nclass RAGMetrics:\n    \"\"\"CloudWatch EMF metrics for RAG ETL pipeline.\"\"\"\n    \n    @staticmethod\n    def emit_ingestion_metric(document_id: str, latency_ms: float, \n                             datasource: str, success: bool):\n        \"\"\"Emit ingestion latency metric.\"\"\"\n        metric = {\n            '_aws': {\n                'CloudWatchMetrics': [{\n                    'Namespace': 'RAG/ETL',\n                    'Metrics': [{\n                        'MetricName': 'IngestionLatency',\n                        'Unit': 'Milliseconds'\n                    }],\n                    'Dimensions': [['DocumentId', 'DataSource', 'Status']]\n                }],\n                'Timestamp': int(datetime.now().timestamp() * 1000)\n            },\n            'DocumentId': document_id,\n            'DataSource': datasource,\n            'Status': 'Success' if success else 'Failure',\n            'IngestionLatency': latency_ms\n        }\n        print(json.dumps(metric))\n    \n    @staticmethod\n    def emit_embedding_cost(document_id: str, cost_usd: float, \n                           model: str, dimensions: int):\n        \"\"\"Emit embedding cost metric.\"\"\"\n        metric = {\n            '_aws': {\n                'CloudWatchMetrics': [{\n                    'Namespace': 'RAG/ETL',\n                    'Metrics': [{\n                        'MetricName': 'EmbeddingCost',\n                        'Unit': 'None'\n                    }],\n                    'Dimensions': [['Model', 'Dimensions']]\n                }],\n                'Timestamp': int(datetime.now().timestamp() * 1000)\n            },\n            'DocumentId': document_id,\n            'Model': model,\n            'Dimensions': dimensions,\n            'EmbeddingCost': cost_usd\n        }\n        print(json.dumps(metric))\n    \n    @staticmethod\n    def store_provenance_metadata(document_id: str, metadata: Dict[str, Any]):\n        \"\"\"Store provenance metadata in OpenSearch.\"\"\"\n        provenance = {\n            'document_id': document_id,\n            'source_url': metadata.get('source_url'),\n            'checksum': metadata.get('checksum'),\n            'embedding_model': metadata.get('embedding_model'),\n            'model_version': metadata.get('model_version'),\n            'processing_timestamp': datetime.now().isoformat(),\n            'processing_pipeline_version': metadata.get('pipeline_version', '1.0.0'),\n            'datasource': metadata.get('datasource'),\n            'extraction_method': metadata.get('extraction_method'),\n            'chunk_count': metadata.get('chunk_count', 0)\n        }\n        \n        # Index to OpenSearch with TTL for compliance\n        # This allows tracing RAG responses back to source documents\n        return provenance"
        },
        {
          "type": "paragraph",
          "content": "I metodi `emit_` stampano metriche che CloudWatch raccoglie dai log. `store_provenance_metadata` costruisce il record che finisce indicizzato col documento."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un tenant non legge mai i documenti di un altro. Mai"
        },
        {
          "type": "paragraph",
          "content": "Per un provider SaaS l'isolamento tra tenant non si negozia. In OpenSearch hai due strade: il document-level access control (DLAC), una row-level security dentro un indice condiviso, oppure un indice per tenant, che scala meglio ma ti obbliga ad automatizzare la gestione degli indici. Sanità e finanza aggiungono la cifratura at rest con chiavi KMS gestite dal cliente, e VPC endpoint perché il traffico non esca mai dalla rete AWS. Il resto è la base: ruoli IAM least-privilege, Secrets Manager per API key e credenziali dei database, CloudTrail su ogni chiamata API, audit regolari con AWS Security Hub e scansione dei dati sensibili con Amazon Macie (DLP, data loss prevention) prima dell'indicizzazione. Guarda l'alias della chiave e il percorso del secret, tutti e due per tenant:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "import boto3\nimport json\nfrom typing import Dict, List\n\nkms = boto3.client('kms')\nsecrets = boto3.client('secretsmanager')\nmacie = boto3.client('macie2')\n\nclass SecureRAGPipeline:\n    \"\"\"Security-hardened RAG pipeline with DLP and encryption.\"\"\"\n    \n    def __init__(self, kms_key_id: str):\n        self.kms_key_id = kms_key_id\n    \n    def scan_for_sensitive_data(self, s3_key: str, bucket: str) -> Dict:\n        \"\"\"Scan document for PII/PHI before processing.\"\"\"\n        # Use Macie to detect sensitive data\n        response = macie.create_classification_job(\n            jobType='ONE_TIME',\n            s3JobDefinition={\n                'bucketDefinitions': [{\n                    'accountId': boto3.client('sts').get_caller_identity()['Account'],\n                    'buckets': [bucket]\n                }],\n                'scoping': {\n                    'includes': {\n                        'and': [{\n                            'simpleScopeTerm': {\n                                'key': 'OBJECT_KEY',\n                                'values': [s3_key]\n                            }\n                        }]\n                    }\n                }\n            },\n            name=f'dlp-scan-{s3_key.replace(\"/\", \"-\")}'\n        )\n        \n        return {\n            'job_id': response['jobId'],\n            'status': 'PENDING'\n        }\n    \n    def encrypt_embedding(self, embedding: List[float], tenant_id: str) -> bytes:\n        \"\"\"Encrypt embedding using tenant-specific KMS key.\"\"\"\n        response = kms.encrypt(\n            KeyId=f'alias/rag-tenant-{tenant_id}',\n            Plaintext=json.dumps(embedding).encode('utf-8')\n        )\n        return response['CiphertextBlob']\n    \n    def get_tenant_credentials(self, tenant_id: str) -> Dict:\n        \"\"\"Retrieve tenant-specific credentials from Secrets Manager.\"\"\"\n        secret_name = f'rag/tenant/{tenant_id}/credentials'\n        response = secrets.get_secret_value(SecretId=secret_name)\n        return json.loads(response['SecretString'])"
        },
        {
          "type": "paragraph",
          "content": "Macie cerca dati personali e sanitari prima dell'elaborazione. Ogni tenant ha la sua chiave KMS e il suo secret."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Gli obiettivi, e dove di solito si inchioda"
        },
        {
          "type": "paragraph",
          "content": "Quattro numeri vivono su dashboard CloudWatch, con allarmi che ti chiamano via PagerDuty: latenza end-to-end sotto i 5 minuti per un documento da 10MB, oltre 100 documenti al minuto trasformati in embedding, oltre 1000 documenti al secondo indicizzati in OpenSearch e tasso di errore sotto lo 0.1%. I colli di bottiglia tipici:"
        },
        {
          "type": "list",
          "items": [
            "Textract sui PDF grandi: elaborazione asincrona, pilotata dalle notifiche di eventi S3.",
            "Cold start degli endpoint SageMaker: provisioned concurrency o script di warm-up.",
            "Indicizzazione OpenSearch: bulk API e una strategia di sharding fatta bene.",
            "Limiti di memoria delle Lambda: dimensionale con query CloudWatch Insights sull'uso reale."
          ]
        },
        {
          "type": "paragraph",
          "content": "Costruisci per primi il contratto e la DLQ. Tutto il resto si aggiunge più facile a una pipeline che sa già dire di no. E sa dove mettere quello che ha rifiutato."
        }
      ]
    },
  },
  'infrastructure-as-code-guide': {
    en: {
      "title": "Infrastructure as Code: Terraform, CloudFormation, Pulumi",
      "description": "IaC isn't 'clicks, but in a repo'. What it buys you, where it goes wrong, and how Terraform, CloudFormation and Pulumi fit different teams, plus why running `terraform apply` on a Friday is a personality test.",
      "content": [
        {
          "type": "paragraph",
          "content": "Picture a production outage on a Friday afternoon. The last change to the network was made by hand in the cloud console, by someone now on holiday. Nobody knows what changed, so nobody knows how to undo it."
        },
        {
          "type": "paragraph",
          "content": "Infrastructure as Code (IaC) means describing servers, networks and permissions in files kept in git, and letting a tool make the cloud match them. It's the contract between platform teams and developers who'd rather never open the console. Done right, you get reproducible environments, automated compliance, and knowledge in git instead of one engineer's memory. Done wrong, it's a 'quick weekend migration' that haunts you for two years. I've seen IaC succeed when leaders treat it as a product and fail when they treat it as a chore. These patterns come from IaC transformations in fintech, healthcare and e-commerce shops pushing thousands of changes a month:"
        },
        {
          "type": "list",
          "items": [
            "what IaC buys you, and how it goes wrong;",
            "Terraform, CloudFormation and Pulumi side by side;",
            "the foundations: state, drift and tests;",
            "scaling it: a case study, many accounts, and an adoption plan."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Every change gets an author and a diff"
        },
        {
          "type": "paragraph",
          "content": "The benefits: versioning, PR-based reviews, drift detection, ephemeral test environments, and policy engines (OPA, Terraform Cloud, cf-guard) bolted straight into CI/CD. The most important is auditability. During an incident you trace infrastructure changes through git history, find the commit that caused it, and roll back with confidence. I've seen organisations cut mean time to recovery (MTTR) from hours to minutes just by making infrastructure changes versioned and reviewable. The price is discipline: every change goes through IaC, with zero manual console edits."
        },
        {
          "type": "paragraph",
          "content": "The risks: state corruption, poorly scoped IAM policies, and copy-pasted modules that turn into unmaintained snowflakes. The classic anti-patterns are letting every squad fork the same Terraform module, and giving CI runners admin roles without guardrails. Policy checks turn reviews into guardrails. Look at the tags and at the Sentinel rule in the comment:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Example: Terraform module with embedded policy checks\nmodule \"secure_s3_bucket\" {\n  source = \"git::https://github.com/company/terraform-modules//s3-bucket?ref=v2.1.0\"\n  \n  bucket_name = \"prod-artifacts-${var.environment}\"\n  versioning  = true\n  encryption  = \"aws:kms\"\n  \n  # Policy checks enforced via Sentinel\n  tags = {\n    Environment = var.environment\n    CostCenter   = var.cost_center\n    ManagedBy    = \"terraform\"\n  }\n}\n\n# Sentinel policy (enforced in Terraform Cloud)\n# main = rule {\n#   all s3_buckets as _, buckets {\n#     all buckets as bucket {\n#       bucket.versioning.enabled is true\n#     }\n#   }\n# }"
        },
        {
          "type": "paragraph",
          "content": "Teams consume a pinned module version (`?ref=v2.1.0`) with versioning and KMS encryption already on, and Sentinel, Terraform Cloud's policy-as-code engine, rejects any plan that creates a bucket without versioning."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Terraform, CloudFormation, Pulumi: same goal, different teams"
        },
        {
          "type": "paragraph",
          "content": "Terraform and CloudFormation are declarative: you describe the end state, like a floor plan, and the tool works out the steps. Terraform is the de facto multi-cloud option, with mature workflows (remote state, Sentinel, CDK for Terraform) and 3,000+ providers covering nearly every cloud and SaaS platform. Its HCL language is readable but verbose for complex logic. CloudFormation integrates deepest with AWS: ChangeSets preview a change before apply, StackSets deploy across accounts, Drift Detection is built in. Pulumi targets developer-first teams: you write the floor plan in TypeScript, Python or Go, so loops, conditionals and existing libraries come for free."
        },
        {
          "type": "paragraph",
          "content": "Here is an encrypted, versioned, private S3 bucket in Pulumi, with CloudFormation in the comment:"
        },
        {
          "type": "code",
          "language": "ts",
          "code": "// Pulumi: S3 bucket with encryption and lifecycle policies\nimport * as aws from \"@pulumi/aws\";\n\nconst bucket = new aws.s3.Bucket(\"artifacts\", {\n  serverSideEncryptionConfiguration: {\n    rule: {\n      applyServerSideEncryptionByDefault: {\n        sseAlgorithm: \"aws:kms\",\n        kmsMasterKeyId: kmsKey.id,\n      },\n      bucketKeyEnabled: true,\n    },\n  },\n  versioning: { enabled: true },\n  lifecycleRules: [\n    {\n      enabled: true,\n      expiration: { days: 30 },\n      noncurrentVersionExpiration: { days: 7 },\n      abortIncompleteMultipartUploadDays: 1,\n    },\n  ],\n  publicAccessBlockConfiguration: {\n    blockPublicAcls: true,\n    blockPublicPolicy: true,\n    ignorePublicAcls: true,\n    restrictPublicBuckets: true,\n  },\n});\n\n// CloudFormation equivalent (YAML)\n// Resources:\n//   ArtifactsBucket:\n//     Type: AWS::S3::Bucket\n//     Properties:\n//       VersioningConfiguration:\n//         Status: Enabled\n//       BucketEncryption:\n//         ServerSideEncryptionConfiguration:\n//           - ServerSideEncryptionByDefault:\n//               SSEAlgorithm: aws:kms\n//               KMSMasterKeyID: !Ref KMSKey"
        },
        {
          "type": "paragraph",
          "content": "Same KMS encryption and versioning in both; Pulumi also expires objects after 30 days and blocks public access. The language changes, not the bucket."
        },
        {
          "type": "paragraph",
          "content": "Terraform's unit of reuse is the module. Look at the `validation` block:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Terraform: Reusable module pattern\n# modules/vpc/main.tf\nvariable \"environment\" {\n  type        = string\n  description = \"Environment name (dev, staging, prod)\"\n  validation {\n    condition     = contains([\"dev\", \"staging\", \"prod\"], var.environment)\n    error_message = \"Environment must be dev, staging, or prod.\"\n  }\n}\n\nvariable \"cidr_block\" {\n  type        = string\n  description = \"CIDR block for VPC\"\n  default     = \"10.0.0.0/16\"\n}\n\nresource \"aws_vpc\" \"main\" {\n  cidr_block           = var.cidr_block\n  enable_dns_hostnames = true\n  enable_dns_support   = true\n  \n  tags = {\n    Name        = \"vpc-${var.environment}\"\n    Environment = var.environment\n    ManagedBy   = \"terraform\"\n  }\n}\n\n# Usage in root module\nmodule \"production_vpc\" {\n  source = \"./modules/vpc\"\n  \n  environment = \"prod\"\n  cidr_block  = \"10.1.0.0/16\"\n}"
        },
        {
          "type": "paragraph",
          "content": "The caller picks only environment and CIDR; a typo in the environment name fails at plan time, not in production."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "State is Terraform's memory, so lock it"
        },
        {
          "type": "paragraph",
          "content": "Terraform keeps a state file that maps each resource in the code to a real one in the cloud. Lose it and Terraform forgets what it built; let two applies write it at once and it remembers two different things. Most IaC initiatives stumble here. Production needs a remote backend with locking, versioning and encryption at rest: Terraform Cloud, S3 + DynamoDB, or Pulumi ESC. Without locking, concurrent applies corrupt state and cost hours of recovery."
        },
        {
          "type": "paragraph",
          "content": "Go remote from day one, restrict access with IAM, and keep separate state per account (Terraform Cloud workspaces or AWS Organizations). Look at `dynamodb_table` and at the recovery runbook in the comments:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# terraform.tf - Remote backend configuration\nterraform {\n  backend \"s3\" {\n    bucket         = \"company-terraform-state-prod\"\n    key            = \"infrastructure/terraform.tfstate\"\n    region         = \"us-east-1\"\n    encrypt        = true\n    kms_key_id     = \"arn:aws:kms:us-east-1:123456789012:key/abc123\"\n    dynamodb_table = \"terraform-state-lock\"\n    \n    # Prevent accidental overwrites\n    versioning = true\n  }\n  \n  required_providers {\n    aws = {\n      source  = \"hashicorp/aws\"\n      version = \"~> 5.0\"\n    }\n  }\n}\n\n# State recovery runbook snippet\n# 1. Check DynamoDB for stale locks: aws dynamodb scan --table-name terraform-state-lock\n# 2. If lock is stale (>1 hour), delete: aws dynamodb delete-item --table-name terraform-state-lock --key '{\"LockID\":{\"S\":\"...\"}}'\n# 3. Restore state from S3 versioning if corruption detected\n# 4. Run terraform refresh to sync with actual infrastructure"
        },
        {
          "type": "paragraph",
          "content": "Each run takes the lock first, so a second one waits instead of overwriting. The runbook covers stale locks: delete one older than an hour, restore state from S3 versioning, refresh."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Drift: when the cloud stops matching the code"
        },
        {
          "type": "paragraph",
          "content": "Drift is when real resources diverge from their IaC definitions: a manual console change, a script, a third-party tool. It's inevitable, so detect it automatically and regularly, not just at deploy time; Terraform Cloud and AWS Config both can. The real decision is the response: auto-remediate (risky), alert only (safe but manual), or decide per resource type. For production I recommend alert-only with a weekly review, except critical resources (IAM roles, security groups), which should auto-remediate. This scheduled Lambda handles alerting for CloudFormation; look at `lambda_handler`:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "# Python script: Automated drift detection and reporting\nimport time\nimport boto3\nimport json\nfrom datetime import datetime\nfrom typing import List, Dict\n\ncloudformation = boto3.client('cloudformation')\nconfig = boto3.client('config')\n\ndef detect_drift(stack_name: str) -> Dict:\n    \"\"\"Detect CloudFormation stack drift.\"\"\"\n    response = cloudformation.detect_stack_drift(StackName=stack_name)\n    drift_id = response['StackDriftDetectionId']\n    \n    # Wait for detection to complete\n    while True:\n        status = cloudformation.describe_stack_drift_detection_status(\n            StackDriftDetectionId=drift_id\n        )\n        if status['DetectionStatus'] == 'DETECTION_COMPLETE':\n            break\n        time.sleep(2)\n    \n    # Get drift details\n    drift_details = cloudformation.describe_stack_resource_drifts(\n        StackName=stack_name\n    )\n    \n    return {\n        'stack_name': stack_name,\n        'drift_status': status['StackDriftStatus'],\n        'drifted_resources': [\n            {\n                'logical_id': drift['LogicalResourceId'],\n                'resource_type': drift['ResourceType'],\n                'drift_type': drift['StackResourceDriftStatus'],\n                'property_differences': drift.get('PropertyDifferences', [])\n            }\n            for drift in drift_details['StackResourceDrifts']\n            if drift['StackResourceDriftStatus'] != 'IN_SYNC'\n        ]\n    }\n\ndef remediate_drift(stack_name: str, resource_logical_id: str):\n    \"\"\"Remediate drift by updating stack from IaC.\"\"\"\n    # This would trigger a Terraform apply or CloudFormation update\n    # Only run for non-critical resources after approval\n    pass\n\n# Scheduled Lambda: Run daily drift detection\ndef lambda_handler(event, context):\n    stacks = cloudformation.list_stacks(\n        StackStatusFilter=['CREATE_COMPLETE', 'UPDATE_COMPLETE']\n    )\n    \n    drift_report = []\n    for stack in stacks['StackSummaries']:\n        drift = detect_drift(stack['StackName'])\n        if drift['drift_status'] != 'IN_SYNC':\n            drift_report.append(drift)\n            # Send to SNS for alerting\n            sns.publish(\n                TopicArn=DRIFT_ALERT_TOPIC,\n                Message=json.dumps(drift, indent=2),\n                Subject=f\"Drift detected in {stack['StackName']}\"\n            )\n    \n    return {'drifted_stacks': len(drift_report), 'details': drift_report}"
        },
        {
          "type": "paragraph",
          "content": "Every day it checks each stack, collects resources that are no longer `IN_SYNC` with their property differences, and sends the report to SNS. `remediate_drift` is a stub: per its comment, it runs only for non-critical resources after approval."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Test infrastructure, because it is code"
        },
        {
          "type": "paragraph",
          "content": "Production IaC needs tests at three levels. Unit tests check variable validation and module logic. Integration tests create real resources in an ephemeral environment, check they behave, then destroy them; Terratest (Go), Kitchen-Terraform (Ruby) and Pytest with moto (Python) do this. Compliance tests with Checkov, tfsec or cfn-nag scan for security misconfigurations. All of it runs in CI before merging to main. Terratest uses real AWS, briefly; look at the `defer`:"
        },
        {
          "type": "code",
          "language": "go",
          "code": "// Terratest example: Testing VPC module\npackage test\n\nimport (\n    \"testing\"\n    \"github.com/gruntwork-io/terratest/modules/terraform\"\n    \"github.com/stretchr/testify/assert\"\n)\n\nfunc TestVPCModule(t *testing.T) {\n    terraformOptions := &terraform.Options{\n        TerraformDir: \"../modules/vpc\",\n        Vars: map[string]interface{}{\n            \"environment\": \"test\",\n            \"cidr_block\":  \"10.0.0.0/16\",\n        },\n        NoColor: true,\n    }\n    \n    defer terraform.Destroy(t, terraformOptions)\n    terraform.InitAndApply(t, terraformOptions)\n    \n    // Validate VPC exists\n    vpcId := terraform.Output(t, terraformOptions, \"vpc_id\")\n    assert.NotEmpty(t, vpcId)\n    \n    // Validate DNS is enabled\n    vpc := getVPC(t, vpcId)\n    assert.True(t, *vpc.EnableDnsHostnames)\n    assert.True(t, *vpc.EnableDnsSupport)\n    \n    // Validate subnets exist\n    publicSubnets := terraform.OutputList(t, terraformOptions, \"public_subnet_ids\")\n    assert.Len(t, publicSubnets, 2) // Expect 2 AZs\n    \n    // Validate security groups\n    sgId := terraform.Output(t, terraformOptions, \"default_security_group_id\")\n    assert.NotEmpty(t, sgId)\n}"
        },
        {
          "type": "paragraph",
          "content": "`defer terraform.Destroy` tears the VPC down even if an assertion fails; in between, the test checks DNS settings, two public subnets and a security group."
        },
        {
          "type": "paragraph",
          "content": "moto takes the opposite approach and fakes the AWS API in memory, so tests are fast and free. Look at the two decorators:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "# Pytest + moto: Testing CloudFormation templates\nimport boto3\nimport pytest\nfrom moto import mock_cloudformation, mock_s3\nfrom botocore.exceptions import ClientError\n\n@mock_cloudformation\n@mock_s3\ndef test_s3_bucket_template():\n    \"\"\"Test CloudFormation template creates S3 bucket correctly.\"\"\"\n    cf = boto3.client('cloudformation', region_name='us-east-1')\n    s3 = boto3.client('s3', region_name='us-east-1')\n    \n    # Load template\n    with open('templates/s3-bucket.yaml') as f:\n        template_body = f.read()\n    \n    # Create stack\n    stack_name = 'test-bucket-stack'\n    cf.create_stack(\n        StackName=stack_name,\n        TemplateBody=template_body,\n        Parameters=[\n            {'ParameterKey': 'BucketName', 'ParameterValue': 'test-bucket'}\n        ]\n    )\n    \n    # Validate bucket exists\n    buckets = s3.list_buckets()\n    assert any(b['Name'] == 'test-bucket' for b in buckets['Buckets'])\n    \n    # Validate versioning enabled\n    versioning = s3.get_bucket_versioning(Bucket='test-bucket')\n    assert versioning['Status'] == 'Enabled'\n    \n    # Cleanup\n    cf.delete_stack(StackName=stack_name)\n\n# Checkov: Security scanning\n# checkov -d infrastructure/ --framework terraform\n# checkov -f template.yaml --framework cloudformation"
        },
        {
          "type": "paragraph",
          "content": "It deploys the template to moto's fake AWS and checks the bucket is versioned. The Checkov commands at the bottom cover compliance."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Case study: 40 squads, one apply workflow"
        },
        {
          "type": "paragraph",
          "content": "A travel company with 40 squads adopted Terraform through a platform-owned registry of opinionated modules. Each module (VPC, ECS cluster, RDS instance) had embedded policy checks and was versioned independently with semantic versioning, so squads adopted updates at their own pace. Sentinel blocked the common mistakes: public S3 buckets, missing tags, no encryption at rest. A \"golden path\" module per resource type reduced variance across 200+ microservices. A single \"infra-apply\" GitHub Actions workflow ran every rollout, centralising locking and drift detection. Median provisioning time dropped to 12 minutes, from 2+ hours with tickets. Look at the split between the two jobs:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Terraform apply workflow with policy checks\nname: Infrastructure Apply\non:\n  pull_request:\n    paths:\n      - 'infrastructure/**'\n  push:\n    branches: [main]\n    paths:\n      - 'infrastructure/**'\n  workflow_dispatch:\n\npermissions:\n  id-token: write\n  contents: read\n  pull-requests: write\n\njobs:\n  terraform-plan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - uses: hashicorp/setup-terraform@v3\n        with:\n          terraform_version: 1.6.0\n          terraform_wrapper: false\n      \n      - name: Terraform Init\n        run: |\n          cd infrastructure\n          terraform init             -backend-config=\"bucket=${{ secrets.TF_STATE_BUCKET }}\"             -backend-config=\"key=${{ github.ref_name }}/terraform.tfstate\"\n      \n      - name: Terraform Validate\n        run: |\n          cd infrastructure\n          terraform validate\n          terraform fmt -check\n      \n      - name: Terraform Plan\n        id: plan\n        run: |\n          cd infrastructure\n          terraform plan -out=tfplan -no-color\n      \n      - name: Comment the plan on the PR\n        if: github.event_name == 'pull_request'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: |\n          cd infrastructure\n          terraform show -no-color tfplan > plan.txt\n          gh pr comment ${{ github.event.pull_request.number }} --body-file plan.txt\n      \n      - name: Policy Check (OPA via Conftest)\n        if: github.event_name == 'pull_request'\n        run: |\n          # Sentinel only runs inside Terraform Cloud/Enterprise. With state in S3,\n          # test the plan's JSON against the Rego policies in policies/ instead.\n          cd infrastructure\n          terraform show -json tfplan > tfplan.json\n          docker run --rm -v \"$PWD:/project\" openpolicyagent/conftest test tfplan.json -p policies/\n      \n  terraform-apply:\n    needs: terraform-plan\n    if: github.ref == 'refs/heads/main' && github.event_name == 'push'\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - uses: actions/checkout@v4\n      - uses: hashicorp/setup-terraform@v3\n      \n      - name: Terraform Apply\n        run: |\n          cd infrastructure\n          terraform init \\\n            -backend-config=\"bucket=${{ secrets.TF_STATE_BUCKET }}\" \\\n            -backend-config=\"key=${{ github.ref_name }}/terraform.tfstate\"\n          terraform apply -auto-approve"
        },
        {
          "type": "paragraph",
          "content": "Pull requests get init, validate, a format check, plan and a policy check; only a push to `main`, through the protected `production` environment, runs `apply`. The policy step is where this sample can't copy the case study: Sentinel runs only inside Terraform Cloud or Enterprise, and this workflow keeps its state in S3. So it renders the plan as JSON and tests it with Conftest against Rego policies, the open-source OPA route to the same rules (no public buckets, required tags, encryption at rest)."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Many accounts, one module library"
        },
        {
          "type": "paragraph",
          "content": "Enterprises split accounts for isolation, billing and compliance (Terraform workspaces, CloudFormation StackSets and Pulumi stacks all handle it). The pattern: AWS Organizations with one account per environment (dev, staging, prod), separate state per account, modules shared through a private registry, and deploys from a central CI/CD account via assume-role. For multi-region, parameterise the region and deploy the same stack to each. Look at the `assume_role` block:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Multi-account deployment pattern\n# terraform.tfvars per account\n# accounts/dev/terraform.tfvars\naccount_id    = \"111111111111\"\nenvironment   = \"dev\"\nregion        = \"us-east-1\"\nkms_key_alias = \"alias/dev-terraform-state\"\n\n# accounts/prod/terraform.tfvars\naccount_id    = \"999999999999\"\nenvironment   = \"prod\"\nregion        = \"us-east-1\"\nkms_key_alias = \"alias/prod-terraform-state\"\n\n# main.tf - Assume role for cross-account access\nprovider \"aws\" {\n  region = var.region\n  \n  assume_role {\n    role_arn = \"arn:aws:iam::${var.account_id}:role/TerraformDeploymentRole\"\n  }\n  \n  default_tags {\n    tags = {\n      Environment = var.environment\n      ManagedBy   = \"terraform\"\n      AccountId   = var.account_id\n    }\n  }\n}\n\n# GitHub Actions: Deploy to multiple accounts\n# jobs:\n#   deploy-dev:\n#     environment: dev\n#     steps:\n#       - run: terraform apply -var-file=accounts/dev/terraform.tfvars\n#   deploy-prod:\n#     needs: deploy-dev\n#     environment: production\n#     steps:\n#       - run: terraform apply -var-file=accounts/prod/terraform.tfvars"
        },
        {
          "type": "paragraph",
          "content": "The code is the same everywhere; only the `.tfvars` file changes per account. The pipeline applies dev first, and prod only after dev succeeds."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Adoption: make the right way the easy way"
        },
        {
          "type": "list",
          "items": [
            "Start with one platform team owning shared modules.",
            "Enforce code reviews and automated plan checks.",
            "Use remote backends with locking (S3 + DynamoDB, Terraform Cloud or Pulumi ESC).",
            "Document runbooks for state recovery and cross-account bootstrapping.",
            "Enable developers: brown bags, templates and office hours do more than top-down mandates.",
            "Track \"time to environment\" and \"incidents due to drift\" to justify further investment."
          ],
          "ordered": true
        },
        {
          "type": "paragraph",
          "content": "Don't convert everything at once. Start with net-new infrastructure, then migrate existing resources gradually with terraform import or CloudFormation drift detection. Targets worth measuring: environments provisioned in under 15 minutes, change lead time under 1 day, fewer than 1 drift incident a month. The lever is a golden path module per resource type that all new infrastructure must use. Look at how little the caller at the bottom has to say:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Example: Golden path module with sensible defaults\n# modules/ecs-service/main.tf\nvariable \"service_name\" {\n  type        = string\n  description = \"Name of the ECS service\"\n}\n\nvariable \"cpu\" {\n  type        = number\n  default     = 256\n  description = \"CPU units (256 = 0.25 vCPU)\"\n}\n\nvariable \"memory\" {\n  type        = number\n  default     = 512\n  description = \"Memory in MB\"\n}\n\nvariable \"desired_count\" {\n  type        = number\n  default     = 2\n  description = \"Desired number of tasks\"\n}\n\n# Enforce best practices\nresource \"aws_ecs_service\" \"main\" {\n  name            = var.service_name\n  cluster         = var.cluster_id\n  task_definition = aws_ecs_task_definition.main.arn\n  desired_count   = var.desired_count\n  \n  # Always use Fargate (no EC2 management)\n  launch_type = \"FARGATE\"\n  \n  # Health checks\n  health_check_grace_period_seconds = 60\n  \n  # Auto-scaling (enforced)\n  enable_execute_command = true # For debugging\n  \n  network_configuration {\n    subnets          = var.subnet_ids\n    security_groups  = [aws_security_group.ecs.id]\n    assign_public_ip = false # Always private\n  }\n  \n  # Load balancer (required)\n  load_balancer {\n    target_group_arn = aws_lb_target_group.main.arn\n    container_name   = var.service_name\n    container_port   = 8080\n  }\n  \n  tags = {\n    Name        = var.service_name\n    Environment = var.environment\n    ManagedBy   = \"terraform\"\n  }\n}\n\n# Usage - teams just provide service name\nmodule \"api_service\" {\n  source = \"git::https://github.com/company/modules//ecs-service?ref=v1.2.0\"\n  \n  service_name = \"user-api\"\n  cpu          = 512\n  memory       = 1024\n  # All other settings come from module defaults"
        },
        {
          "type": "paragraph",
          "content": "The module bakes in Fargate, private networking, a load balancer and health checks; a team supplies a service name and maybe CPU and memory. Over time teams migrate on their own, to stop maintaining custom code."
        }
      ]
    },
    it: {
      "title": "Infrastructure as Code: basta click in console",
      "description": "L'IaC non è 'i click, ma in un repo'. Terraform, CloudFormation e Pulumi a confronto, stato, drift e test, un caso reale con 40 squadre. E perché un `terraform apply` di venerdì è un test della personalità.",
      "content": [
        {
          "type": "paragraph",
          "content": "Disservizio in produzione, venerdì pomeriggio. L'ultima modifica alla rete l'ha fatta qualcuno a mano, dalla console cloud. Ed è in ferie. Nessuno sa cosa è cambiato, quindi nessuno sa come tornare indietro."
        },
        {
          "type": "paragraph",
          "content": "Infrastructure as Code (IaC) vuol dire descrivere server, reti e permessi in file tenuti in git, e lasciare che uno strumento allinei il cloud a quei file. È il contratto tra i team di piattaforma e gli sviluppatori che la console non vorrebbero aprirla mai. Fatta bene, ti dà ambienti riproducibili, compliance automatica e conoscenza in git invece che nella testa di un solo ingegnere. Fatta male, è la 'migrazione veloce del weekend' che ti perseguita per due anni. Ho visto l'IaC funzionare quando chi guida la tratta come un prodotto, e fallire quando la tratta come una corvée. Questi pattern vengono da trasformazioni IaC in fintech, sanità ed e-commerce, con migliaia di modifiche al mese:"
        },
        {
          "type": "list",
          "items": [
            "cosa ti dà l'IaC, e come va storta;",
            "Terraform, CloudFormation e Pulumi a confronto;",
            "le fondamenta: stato, drift e test;",
            "come scalarla: un caso reale, tanti account e un piano di adozione."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Ogni modifica ha un autore e un diff"
        },
        {
          "type": "paragraph",
          "content": "I vantaggi: versioning, review via PR, drift detection, ambienti di test effimeri e motori di policy (OPA, Terraform Cloud, cf-guard) agganciati dritti alla CI/CD. Il più importante è l'auditabilità. Durante un incidente ripercorri le modifiche infrastrutturali nella storia git, trovi il commit colpevole e fai rollback senza tremare. Ho visto organizzazioni portare il mean time to recovery (MTTR) da ore a minuti solo rendendo le modifiche infrastrutturali versionate e revisionabili. Il prezzo è la disciplina: ogni modifica passa dall'IaC. Zero ritocchi a mano in console."
        },
        {
          "type": "paragraph",
          "content": "I rischi: stato corrotto, policy IAM larghe come un portone e moduli copia-incollati che diventano fiocchi di neve senza manutenzione. Gli anti-pattern classici: ogni squadra si forka lo stesso modulo Terraform, e i runner della CI girano con ruoli admin senza paletti. I controlli di policy trasformano le review in paletti veri. Guarda i tag e la regola Sentinel nel commento:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Esempio: Modulo Terraform con policy checks integrate\nmodule \"secure_s3_bucket\" {\n  source = \"git::https://github.com/company/terraform-modules//s3-bucket?ref=v2.1.0\"\n  \n  bucket_name = \"prod-artifacts-${var.environment}\"\n  versioning  = true\n  encryption  = \"aws:kms\"\n  \n  # Policy checks applicate via Sentinel\n  tags = {\n    Environment = var.environment\n    CostCenter   = var.cost_center\n    ManagedBy    = \"terraform\"\n  }\n}\n\n# Policy Sentinel (applicata in Terraform Cloud)\n# main = rule {\n#   all s3_buckets as _, buckets {\n#     all buckets as bucket {\n#       bucket.versioning.enabled is true\n#     }\n#   }\n# }"
        },
        {
          "type": "paragraph",
          "content": "I team usano una versione fissata del modulo (`?ref=v2.1.0`) con versioning e cifratura KMS già accesi, e Sentinel, il motore di policy-as-code di Terraform Cloud, rifiuta ogni piano che crea un bucket senza versioning."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Terraform, CloudFormation, Pulumi: stesso obiettivo, team diversi"
        },
        {
          "type": "paragraph",
          "content": "Terraform e CloudFormation sono dichiarativi: descrivi lo stato finale, come una planimetria, e i passi se li ricava lo strumento. Terraform è lo standard di fatto per il multi-cloud, con workflow maturi (stato remoto, Sentinel, CDK for Terraform) e oltre 3.000 provider che coprono quasi ogni cloud e piattaforma SaaS. Il suo linguaggio, HCL, si legge bene ma diventa verboso con la logica complessa. CloudFormation è il più integrato con AWS: i ChangeSet ti mostrano la modifica prima dell'apply, gli StackSet distribuiscono su più account, la Drift Detection è inclusa. Pulumi è per i team che partono dal codice: la planimetria la scrivi in TypeScript, Python o Go, quindi cicli, condizioni e librerie che hai già vengono gratis."
        },
        {
          "type": "paragraph",
          "content": "Ecco un bucket S3 cifrato, versionato e privato in Pulumi, con la versione CloudFormation nel commento:"
        },
        {
          "type": "code",
          "language": "ts",
          "code": "// Pulumi: S3 bucket with encryption and lifecycle policies\nimport * as aws from \"@pulumi/aws\";\n\nconst bucket = new aws.s3.Bucket(\"artifacts\", {\n  serverSideEncryptionConfiguration: {\n    rule: {\n      applyServerSideEncryptionByDefault: {\n        sseAlgorithm: \"aws:kms\",\n        kmsMasterKeyId: kmsKey.id,\n      },\n      bucketKeyEnabled: true,\n    },\n  },\n  versioning: { enabled: true },\n  lifecycleRules: [\n    {\n      enabled: true,\n      expiration: { days: 30 },\n      noncurrentVersionExpiration: { days: 7 },\n      abortIncompleteMultipartUploadDays: 1,\n    },\n  ],\n  publicAccessBlockConfiguration: {\n    blockPublicAcls: true,\n    blockPublicPolicy: true,\n    ignorePublicAcls: true,\n    restrictPublicBuckets: true,\n  },\n});\n\n// CloudFormation equivalent (YAML)\n// Resources:\n//   ArtifactsBucket:\n//     Type: AWS::S3::Bucket\n//     Properties:\n//       VersioningConfiguration:\n//         Status: Enabled\n//       BucketEncryption:\n//         ServerSideEncryptionConfiguration:\n//           - ServerSideEncryptionByDefault:\n//               SSEAlgorithm: aws:kms\n//               KMSMasterKeyID: !Ref KMSKey"
        },
        {
          "type": "paragraph",
          "content": "Stessa cifratura KMS, stesso versioning. Pulumi in più fa scadere gli oggetti dopo 30 giorni e blocca l'accesso pubblico. Cambia il linguaggio, non il bucket."
        },
        {
          "type": "paragraph",
          "content": "In Terraform l'unità di riuso è il modulo. Guarda il blocco `validation`:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Terraform: Pattern di modulo riutilizzabile\n# modules/vpc/main.tf\nvariable \"environment\" {\n  type        = string\n  description = \"Nome ambiente (dev, staging, prod)\"\n  validation {\n    condition     = contains([\"dev\", \"staging\", \"prod\"], var.environment)\n    error_message = \"L'ambiente deve essere dev, staging o prod.\"\n  }\n}\n\nvariable \"cidr_block\" {\n  type        = string\n  description = \"Blocco CIDR per VPC\"\n  default     = \"10.0.0.0/16\"\n}\n\nresource \"aws_vpc\" \"main\" {\n  cidr_block           = var.cidr_block\n  enable_dns_hostnames = true\n  enable_dns_support   = true\n  \n  tags = {\n    Name        = \"vpc-${var.environment}\"\n    Environment = var.environment\n    ManagedBy   = \"terraform\"\n  }\n}\n\n# Utilizzo nel modulo root\nmodule \"production_vpc\" {\n  source = \"./modules/vpc\"\n  \n  environment = \"prod\"\n  cidr_block  = \"10.1.0.0/16\"\n}"
        },
        {
          "type": "paragraph",
          "content": "Chi lo usa sceglie solo ambiente e CIDR. Un refuso nel nome dell'ambiente esplode al plan, non in produzione."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Lo stato è la memoria di Terraform: chiudilo a chiave"
        },
        {
          "type": "paragraph",
          "content": "Terraform tiene un file di stato che collega ogni risorsa del codice a una risorsa vera nel cloud. Perdilo, e Terraform dimentica cosa ha creato. Lascia che due apply ci scrivano insieme, e ricorderà due cose diverse. È qui che inciampa la maggior parte dei progetti IaC. In produzione ti serve un backend remoto con locking, versioning e cifratura at rest: Terraform Cloud, S3 + DynamoDB o Pulumi ESC. Senza locking, due apply concorrenti corrompono lo stato e ti costano ore di recupero."
        },
        {
          "type": "paragraph",
          "content": "Vai in remoto dal primo giorno, limita l'accesso con IAM e tieni uno stato separato per account (workspace di Terraform Cloud o AWS Organizations). Guarda `dynamodb_table` e il runbook di recupero nei commenti:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# terraform.tf - Configurazione backend remoto\nterraform {\n  backend \"s3\" {\n    bucket         = \"company-terraform-state-prod\"\n    key            = \"infrastructure/terraform.tfstate\"\n    region         = \"us-east-1\"\n    encrypt        = true\n    kms_key_id     = \"arn:aws:kms:us-east-1:123456789012:key/abc123\"\n    dynamodb_table = \"terraform-state-lock\"\n    \n    # Prevenire sovrascritture accidentali\n    versioning = true\n  }\n  \n  required_providers {\n    aws = {\n      source  = \"hashicorp/aws\"\n      version = \"~> 5.0\"\n    }\n  }\n}\n\n# Snippet runbook recovery stato\n# 1. Controllare DynamoDB per lock obsoleti: aws dynamodb scan --table-name terraform-state-lock\n# 2. Se il lock è obsoleto (>1 ora), eliminare: aws dynamodb delete-item --table-name terraform-state-lock --key '{\"LockID\":{\"S\":\"...\"}}'\n# 3. Ripristinare stato da S3 versioning se rilevata corruzione\n# 4. Eseguire terraform refresh per sincronizzare con infrastruttura reale"
        },
        {
          "type": "paragraph",
          "content": "Ogni esecuzione prende prima il lock, così la seconda aspetta invece di sovrascrivere. Il runbook copre i lock appesi: cancelli quelli più vecchi di un'ora, ripristini lo stato dal versioning di S3, fai refresh."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Drift: quando il cloud smette di somigliare al codice"
        },
        {
          "type": "paragraph",
          "content": "Il drift è quando le risorse reali si allontanano dalla loro definizione IaC: una modifica a mano in console, uno script, un tool di terze parti. Succederà, punto. Quindi lo rilevi in automatico e con regolarità, non solo al deploy. Terraform Cloud e AWS Config lo sanno fare. La decisione vera è come rispondi: correzione automatica (rischiosa), solo alert (sicuro ma manuale), o una scelta per tipo di risorsa. In produzione ti consiglio solo alert con review settimanale, tranne le risorse critiche (ruoli IAM, security group): quelle si correggono in automatico. Questa Lambda schedulata gestisce gli alert per CloudFormation. Guarda `lambda_handler`:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "# Python script: Automated drift detection and reporting\nimport time\nimport boto3\nimport json\nfrom datetime import datetime\nfrom typing import List, Dict\n\ncloudformation = boto3.client('cloudformation')\nconfig = boto3.client('config')\n\ndef detect_drift(stack_name: str) -> Dict:\n    \"\"\"Detect CloudFormation stack drift.\"\"\"\n    response = cloudformation.detect_stack_drift(StackName=stack_name)\n    drift_id = response['StackDriftDetectionId']\n    \n    # Wait for detection to complete\n    while True:\n        status = cloudformation.describe_stack_drift_detection_status(\n            StackDriftDetectionId=drift_id\n        )\n        if status['DetectionStatus'] == 'DETECTION_COMPLETE':\n            break\n        time.sleep(2)\n    \n    # Get drift details\n    drift_details = cloudformation.describe_stack_resource_drifts(\n        StackName=stack_name\n    )\n    \n    return {\n        'stack_name': stack_name,\n        'drift_status': status['StackDriftStatus'],\n        'drifted_resources': [\n            {\n                'logical_id': drift['LogicalResourceId'],\n                'resource_type': drift['ResourceType'],\n                'drift_type': drift['StackResourceDriftStatus'],\n                'property_differences': drift.get('PropertyDifferences', [])\n            }\n            for drift in drift_details['StackResourceDrifts']\n            if drift['StackResourceDriftStatus'] != 'IN_SYNC'\n        ]\n    }\n\ndef remediate_drift(stack_name: str, resource_logical_id: str):\n    \"\"\"Remediate drift by updating stack from IaC.\"\"\"\n    # This would trigger a Terraform apply or CloudFormation update\n    # Only run for non-critical resources after approval\n    pass\n\n# Scheduled Lambda: Run daily drift detection\ndef lambda_handler(event, context):\n    stacks = cloudformation.list_stacks(\n        StackStatusFilter=['CREATE_COMPLETE', 'UPDATE_COMPLETE']\n    )\n    \n    drift_report = []\n    for stack in stacks['StackSummaries']:\n        drift = detect_drift(stack['StackName'])\n        if drift['drift_status'] != 'IN_SYNC':\n            drift_report.append(drift)\n            # Send to SNS for alerting\n            sns.publish(\n                TopicArn=DRIFT_ALERT_TOPIC,\n                Message=json.dumps(drift, indent=2),\n                Subject=f\"Drift detected in {stack['StackName']}\"\n            )\n    \n    return {'drifted_stacks': len(drift_report), 'details': drift_report}"
        },
        {
          "type": "paragraph",
          "content": "Ogni giorno passa tutti gli stack, raccoglie le risorse non più `IN_SYNC` con le differenze di proprietà e spara il report su SNS. `remediate_drift` è uno scheletro: come dice il commento, gira solo per risorse non critiche e dopo approvazione."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "L'infrastruttura è codice. Testala"
        },
        {
          "type": "paragraph",
          "content": "L'IaC di produzione si testa su tre livelli. I test unitari verificano la validazione delle variabili e la logica dei moduli. I test di integrazione creano risorse vere in un ambiente effimero, controllano che si comportino bene e poi le distruggono: lo fanno Terratest (Go), Kitchen-Terraform (Ruby) e Pytest con moto (Python). I test di compliance con Checkov, tfsec o cfn-nag cercano configurazioni insicure. Tutto gira in CI prima del merge su main. Terratest usa AWS vero, per poco. Guarda il `defer`:"
        },
        {
          "type": "code",
          "language": "go",
          "code": "// Terratest example: Testing VPC module\npackage test\n\nimport (\n    \"testing\"\n    \"github.com/gruntwork-io/terratest/modules/terraform\"\n    \"github.com/stretchr/testify/assert\"\n)\n\nfunc TestVPCModule(t *testing.T) {\n    terraformOptions := &terraform.Options{\n        TerraformDir: \"../modules/vpc\",\n        Vars: map[string]interface{}{\n            \"environment\": \"test\",\n            \"cidr_block\":  \"10.0.0.0/16\",\n        },\n        NoColor: true,\n    }\n    \n    defer terraform.Destroy(t, terraformOptions)\n    terraform.InitAndApply(t, terraformOptions)\n    \n    // Validate VPC exists\n    vpcId := terraform.Output(t, terraformOptions, \"vpc_id\")\n    assert.NotEmpty(t, vpcId)\n    \n    // Validate DNS is enabled\n    vpc := getVPC(t, vpcId)\n    assert.True(t, *vpc.EnableDnsHostnames)\n    assert.True(t, *vpc.EnableDnsSupport)\n    \n    // Validate subnets exist\n    publicSubnets := terraform.OutputList(t, terraformOptions, \"public_subnet_ids\")\n    assert.Len(t, publicSubnets, 2) // Expect 2 AZs\n    \n    // Validate security groups\n    sgId := terraform.Output(t, terraformOptions, \"default_security_group_id\")\n    assert.NotEmpty(t, sgId)\n}"
        },
        {
          "type": "paragraph",
          "content": "`defer terraform.Destroy` smonta la VPC anche se un'asserzione fallisce. Nel mezzo, il test verifica DNS, due subnet pubbliche e un security group."
        },
        {
          "type": "paragraph",
          "content": "moto fa il contrario: simula in memoria le API AWS, quindi i test sono veloci e gratis. Guarda i due decorator:"
        },
        {
          "type": "code",
          "language": "python",
          "code": "# Pytest + moto: Testing CloudFormation templates\nimport boto3\nimport pytest\nfrom moto import mock_cloudformation, mock_s3\nfrom botocore.exceptions import ClientError\n\n@mock_cloudformation\n@mock_s3\ndef test_s3_bucket_template():\n    \"\"\"Test CloudFormation template creates S3 bucket correctly.\"\"\"\n    cf = boto3.client('cloudformation', region_name='us-east-1')\n    s3 = boto3.client('s3', region_name='us-east-1')\n    \n    # Load template\n    with open('templates/s3-bucket.yaml') as f:\n        template_body = f.read()\n    \n    # Create stack\n    stack_name = 'test-bucket-stack'\n    cf.create_stack(\n        StackName=stack_name,\n        TemplateBody=template_body,\n        Parameters=[\n            {'ParameterKey': 'BucketName', 'ParameterValue': 'test-bucket'}\n        ]\n    )\n    \n    # Validate bucket exists\n    buckets = s3.list_buckets()\n    assert any(b['Name'] == 'test-bucket' for b in buckets['Buckets'])\n    \n    # Validate versioning enabled\n    versioning = s3.get_bucket_versioning(Bucket='test-bucket')\n    assert versioning['Status'] == 'Enabled'\n    \n    # Cleanup\n    cf.delete_stack(StackName=stack_name)\n\n# Checkov: Security scanning\n# checkov -d infrastructure/ --framework terraform\n# checkov -f template.yaml --framework cloudformation"
        },
        {
          "type": "paragraph",
          "content": "Deploya il template sull'AWS finto di moto e verifica che il bucket sia versionato. I comandi Checkov in fondo coprono la compliance."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Caso reale: 40 squadre, un solo workflow di apply"
        },
        {
          "type": "paragraph",
          "content": "Un'azienda di viaggi con 40 squadre ha adottato Terraform tramite un registry di moduli opinionated gestito dalla piattaforma. Ogni modulo (VPC, cluster ECS, istanza RDS) aveva i controlli di policy dentro ed era versionato per conto suo con il versioning semantico, così ogni squadra si prendeva gli aggiornamenti coi suoi tempi. Sentinel bloccava gli errori classici: bucket S3 pubblici, tag mancanti, niente cifratura at rest. Un modulo \"golden path\" per ogni tipo di risorsa riduceva la varianza su oltre 200 microservizi. Un unico workflow GitHub Actions, \"infra-apply\", faceva ogni rollout e centralizzava locking e drift detection. Il tempo mediano di provisioning è sceso a 12 minuti. Con i ticket erano 2+ ore. Guarda come sono divisi i due job:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Terraform apply workflow with policy checks\nname: Infrastructure Apply\non:\n  pull_request:\n    paths:\n      - 'infrastructure/**'\n  push:\n    branches: [main]\n    paths:\n      - 'infrastructure/**'\n  workflow_dispatch:\n\npermissions:\n  id-token: write\n  contents: read\n  pull-requests: write\n\njobs:\n  terraform-plan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - uses: hashicorp/setup-terraform@v3\n        with:\n          terraform_version: 1.6.0\n          terraform_wrapper: false\n      \n      - name: Terraform Init\n        run: |\n          cd infrastructure\n          terraform init             -backend-config=\"bucket=${{ secrets.TF_STATE_BUCKET }}\"             -backend-config=\"key=${{ github.ref_name }}/terraform.tfstate\"\n      \n      - name: Terraform Validate\n        run: |\n          cd infrastructure\n          terraform validate\n          terraform fmt -check\n      \n      - name: Terraform Plan\n        id: plan\n        run: |\n          cd infrastructure\n          terraform plan -out=tfplan -no-color\n      \n      - name: Comment the plan on the PR\n        if: github.event_name == 'pull_request'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: |\n          cd infrastructure\n          terraform show -no-color tfplan > plan.txt\n          gh pr comment ${{ github.event.pull_request.number }} --body-file plan.txt\n      \n      - name: Policy Check (OPA via Conftest)\n        if: github.event_name == 'pull_request'\n        run: |\n          # Sentinel only runs inside Terraform Cloud/Enterprise. With state in S3,\n          # test the plan's JSON against the Rego policies in policies/ instead.\n          cd infrastructure\n          terraform show -json tfplan > tfplan.json\n          docker run --rm -v \"$PWD:/project\" openpolicyagent/conftest test tfplan.json -p policies/\n      \n  terraform-apply:\n    needs: terraform-plan\n    if: github.ref == 'refs/heads/main' && github.event_name == 'push'\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - uses: actions/checkout@v4\n      - uses: hashicorp/setup-terraform@v3\n      \n      - name: Terraform Apply\n        run: |\n          cd infrastructure\n          terraform init \\\n            -backend-config=\"bucket=${{ secrets.TF_STATE_BUCKET }}\" \\\n            -backend-config=\"key=${{ github.ref_name }}/terraform.tfstate\"\n          terraform apply -auto-approve"
        },
        {
          "type": "paragraph",
          "content": "Le pull request si prendono init, validate, controllo del formato, plan e controllo delle policy. Solo un push su `main`, passando dall'ambiente protetto `production`, esegue `apply`. Il passo delle policy è l'unico dove l'esempio non può copiare il caso reale: Sentinel gira solo dentro Terraform Cloud o Enterprise, e questo workflow tiene lo stato su S3. Quindi trasforma il plan in JSON e lo verifica con Conftest contro policy Rego, la strada open source di OPA per le stesse regole (niente bucket pubblici, tag obbligatori, cifratura at rest)."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Tanti account, una sola libreria di moduli"
        },
        {
          "type": "paragraph",
          "content": "Le grandi aziende separano gli account per isolamento, fatturazione e compliance (workspace Terraform, StackSet CloudFormation e stack Pulumi lo gestiscono tutti). Il pattern: AWS Organizations con un account per ambiente (dev, staging, prod), stato separato per account, moduli condivisi da un registry privato e deploy da un account CI/CD centrale via assume-role. Per il multi-region, parametrizzi la regione e deployi lo stesso stack in ognuna. Guarda il blocco `assume_role`:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Multi-account deployment pattern\n# terraform.tfvars per account\n# accounts/dev/terraform.tfvars\naccount_id    = \"111111111111\"\nenvironment   = \"dev\"\nregion        = \"us-east-1\"\nkms_key_alias = \"alias/dev-terraform-state\"\n\n# accounts/prod/terraform.tfvars\naccount_id    = \"999999999999\"\nenvironment   = \"prod\"\nregion        = \"us-east-1\"\nkms_key_alias = \"alias/prod-terraform-state\"\n\n# main.tf - Assume role for cross-account access\nprovider \"aws\" {\n  region = var.region\n  \n  assume_role {\n    role_arn = \"arn:aws:iam::${var.account_id}:role/TerraformDeploymentRole\"\n  }\n  \n  default_tags {\n    tags = {\n      Environment = var.environment\n      ManagedBy   = \"terraform\"\n      AccountId   = var.account_id\n    }\n  }\n}\n\n# GitHub Actions: Deploy to multiple accounts\n# jobs:\n#   deploy-dev:\n#     environment: dev\n#     steps:\n#       - run: terraform apply -var-file=accounts/dev/terraform.tfvars\n#   deploy-prod:\n#     needs: deploy-dev\n#     environment: production\n#     steps:\n#       - run: terraform apply -var-file=accounts/prod/terraform.tfvars"
        },
        {
          "type": "paragraph",
          "content": "Il codice è lo stesso ovunque. Per ogni account cambia solo il file `.tfvars`. La pipeline applica prima dev, e prod solo se dev è andato liscio."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Adozione: rendi facile la strada giusta"
        },
        {
          "type": "list",
          "items": [
            "Parti da un solo team di piattaforma, padrone dei moduli condivisi.",
            "Imponi code review e controlli automatici sul plan.",
            "Backend remoti con locking, sempre (S3 + DynamoDB, Terraform Cloud o Pulumi ESC).",
            "Scrivi i runbook per il recupero dello stato e il bootstrap tra account.",
            "Abilita gli sviluppatori: brown bag, template e office hours valgono più degli ordini dall'alto.",
            "Misura \"tempo per avere un ambiente\" e \"incidenti da drift\", e con quei numeri giustifichi altri investimenti."
          ],
          "ordered": true
        },
        {
          "type": "paragraph",
          "content": "Non convertire tutto in un colpo. Parti dall'infrastruttura nuova, poi migri quella esistente un pezzo alla volta con terraform import o la drift detection di CloudFormation. Obiettivi da misurare: ambienti pronti in meno di 15 minuti, lead time delle modifiche sotto 1 giorno, meno di 1 incidente di drift al mese. La leva è un modulo golden path per ogni tipo di risorsa, obbligatorio per tutta l'infrastruttura nuova. Guarda in fondo quanto poco deve scrivere chi lo usa:"
        },
        {
          "type": "code",
          "language": "hcl",
          "code": "# Example: Golden path module with sensible defaults\n# modules/ecs-service/main.tf\nvariable \"service_name\" {\n  type        = string\n  description = \"Name of the ECS service\"\n}\n\nvariable \"cpu\" {\n  type        = number\n  default     = 256\n  description = \"CPU units (256 = 0.25 vCPU)\"\n}\n\nvariable \"memory\" {\n  type        = number\n  default     = 512\n  description = \"Memory in MB\"\n}\n\nvariable \"desired_count\" {\n  type        = number\n  default     = 2\n  description = \"Desired number of tasks\"\n}\n\n# Enforce best practices\nresource \"aws_ecs_service\" \"main\" {\n  name            = var.service_name\n  cluster         = var.cluster_id\n  task_definition = aws_ecs_task_definition.main.arn\n  desired_count   = var.desired_count\n  \n  # Always use Fargate (no EC2 management)\n  launch_type = \"FARGATE\"\n  \n  # Health checks\n  health_check_grace_period_seconds = 60\n  \n  # Auto-scaling (enforced)\n  enable_execute_command = true # For debugging\n  \n  network_configuration {\n    subnets          = var.subnet_ids\n    security_groups  = [aws_security_group.ecs.id]\n    assign_public_ip = false # Always private\n  }\n  \n  # Load balancer (required)\n  load_balancer {\n    target_group_arn = aws_lb_target_group.main.arn\n    container_name   = var.service_name\n    container_port   = 8080\n  }\n  \n  tags = {\n    Name        = var.service_name\n    Environment = var.environment\n    ManagedBy   = \"terraform\"\n  }\n}\n\n# Usage - teams just provide service name\nmodule \"api_service\" {\n  source = \"git::https://github.com/company/modules//ecs-service?ref=v1.2.0\"\n  \n  service_name = \"user-api\"\n  cpu          = 512\n  memory       = 1024\n  # All other settings come from module defaults"
        },
        {
          "type": "paragraph",
          "content": "Il modulo si porta dentro Fargate, rete privata, load balancer e health check. Il team ci mette il nome del servizio, e magari CPU e memoria. Col tempo le squadre migrano da sole, perché sono stufe di mantenere codice custom."
        }
      ]
    },
  },
  'github-actions-vs-vercel-ci': {
    en: {
      "title": "GitHub Actions vs Vercel: picking CI/CD",
      "description": "GitHub Actions and Vercel, minus the tribalism: what each is built for, what it costs, and which one wins each scenario. The answer is 'it depends', but not in the useless way.",
      "content": [
        {
          "type": "paragraph",
          "content": "Every GitHub Actions vs Vercel debate opens with price or one pet feature and ends in tribalism. The useful question is quieter: what workflow are you actually optimising for? I've run monorepos with dozens of microservices on Actions and shipped Next.js platforms that never left Vercel. Both were the right call, for completely different reasons."
        },
        {
          "type": "paragraph",
          "content": "The two aren't really the same kind of tool. GitHub Actions is a general automation engine: it runs any job you describe in YAML on a fresh machine. Vercel is a hosting platform with a build pipeline attached, tuned for frontend frameworks. Actions is a well-stocked workshop; Vercel is a production line built for one product. This comparison comes from running CI/CD for fintech, e-commerce and SaaS teams shipping thousands of deploys a month. It covers:"
        },
        {
          "type": "list",
          "items": [
            "what each one is good at, with a pipeline from each;",
            "two case studies with opposite answers;",
            "cost, speed and the advanced patterns;",
            "running both, and how to choose."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Actions gives you building blocks"
        },
        {
          "type": "paragraph",
          "content": "Actions offers reusable workflows, matrix builds, custom actions, self-hosted runners, OIDC federation with clouds and environment protection rules. It excels at complex orchestration: multi-stage pipelines with conditions, parallel jobs and dependencies between them. The YAML is verbose but can express almost any CI/CD pattern. If you need to run Terraform, build Docker images and publish Helm charts, Actions is your friend. Look at the `needs:` lines, which chain the jobs, and the `matrix`, which fans one job out per service:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Complex multi-service pipeline\nname: Full Stack CI/CD\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main]\n\nenv:\n  AWS_REGION: us-east-1\n  NODE_VERSION: '20.x'\n\njobs:\n  lint-and-test:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        service: [api, worker, scheduler]\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: ${{ env.NODE_VERSION }}\n          cache: 'npm'\n          cache-dependency-path: ${{ matrix.service }}/package-lock.json\n      \n      - name: Install dependencies\n        working-directory: ${{ matrix.service }}\n        run: npm ci\n      \n      - name: Run linter\n        working-directory: ${{ matrix.service }}\n        run: npm run lint\n      \n      - name: Run tests\n        working-directory: ${{ matrix.service }}\n        run: npm test -- --coverage\n      \n      - name: Upload coverage\n        uses: codecov/codecov-action@v3\n        with:\n          files: ${{ matrix.service }}/coverage/lcov.info\n\n  build-containers:\n    needs: lint-and-test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Set up Docker Buildx\n        uses: docker/setup-buildx-action@v3\n      \n      - name: Login to ECR\n        uses: aws-actions/amazon-ecr-login@v2\n      \n      - name: Build and push\n        uses: docker/build-push-action@v5\n        with:\n          context: .\n          push: true\n          tags: |\n            ${{ secrets.AWS_ECR_REGISTRY }}/api:${{ github.sha }}\n            ${{ secrets.AWS_ECR_REGISTRY }}/api:latest\n          cache-from: type=registry,ref=${{ secrets.AWS_ECR_REGISTRY }}/api:buildcache\n          cache-to: type=registry,ref=${{ secrets.AWS_ECR_REGISTRY }}/api:buildcache,mode=max\n\n  deploy-infrastructure:\n    needs: build-containers\n    runs-on: ubuntu-latest\n    permissions:\n      id-token: write\n      contents: read\n    steps:\n      - uses: actions/checkout@v4\n      \n      - uses: hashicorp/setup-terraform@v3\n        with:\n          terraform_version: 1.6.0\n      \n      - name: Terraform Plan\n        working-directory: infrastructure\n        run: terraform plan -out=tfplan\n      \n      - name: Terraform Apply\n        if: github.ref == 'refs/heads/main'\n        working-directory: infrastructure\n        run: terraform apply -auto-approve tfplan\n\n  deploy-services:\n    needs: [build-containers, deploy-infrastructure]\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        service: [api, worker]\n    steps:\n      - name: Deploy to ECS\n        uses: aws-actions/amazon-ecs-deploy-task-definition@v1\n        with:\n          task-definition: ${{ matrix.service }}/task-definition.json\n          service: ${{ matrix.service }}-service\n          cluster: production-cluster\n          wait-for-service-stability: true"
        },
        {
          "type": "paragraph",
          "content": "Lint and tests run in parallel for three services, containers build only if all pass, Terraform applies only on `main`, and services deploy only once the infrastructure is in place."
        },
        {
          "type": "paragraph",
          "content": "One building block deserves its own example: OIDC. Instead of storing an AWS access key as a secret, the job gets a short-lived signed token from GitHub saying which repo and workflow it is, and AWS exchanges it for temporary credentials. It's a visitor badge that expires when you leave, not a copy of the office key. Look at `id-token: write` and `role-to-assume`:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: OIDC authentication for AWS (no long-lived credentials)\nname: Deploy to AWS\non:\n  push:\n    branches: [main]\n\npermissions:\n  id-token: write\n  contents: read\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Configure AWS credentials\n        uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole\n          aws-region: us-east-1\n      \n      - name: Deploy to S3\n        run: |\n          aws s3 sync ./dist s3://my-bucket --delete\n      \n      - name: Invalidate CloudFront\n        run: |\n          aws cloudfront create-invalidation             --distribution-id E1234567890             --paths \"/*\"\n\n# Security benefit: No AWS access keys stored in secrets\n# Uses OIDC federation - credentials expire after job completion"
        },
        {
          "type": "paragraph",
          "content": "The job syncs a static site to S3 and invalidates CloudFront without a single stored AWS key, and the credentials expire when the job ends."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Vercel gives you defaults"
        },
        {
          "type": "paragraph",
          "content": "Vercel focuses on zero-config developer experience: a preview URL for every PR, built-in image optimisation, Edge Functions and an environment variable manager. It detects your framework (Next.js, Remix, Astro), configures the build and generates previews without being asked. The price is flexibility: customising build steps or running arbitrary scripts is hard. For serverless frontends with deploy-to-preview in seconds, it is unbeatable. For a standard Next.js app, this optional file is the whole pipeline:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# Vercel: Zero-config Next.js deployment\n# vercel.json (optional - Vercel auto-detects most settings)\n{\n  \"buildCommand\": \"npm run build\",\n  \"outputDirectory\": \".next\",\n  \"framework\": \"nextjs\",\n  \"regions\": [\"iad1\"],\n  \"env\": {\n    \"DATABASE_URL\": \"@database-url\",\n    \"API_KEY\": \"@api-key\"\n  },\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        {\n          \"key\": \"X-Content-Type-Options\",\n          \"value\": \"nosniff\"\n        }\n      ]\n    }\n  ]\n}\n\n# That's it. Every PR gets a preview URL automatically.\n# No YAML, no configuration needed for standard Next.js apps."
        },
        {
          "type": "paragraph",
          "content": "Vercel detects most of these settings by itself; the file pins the region, environment references and a security header."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Two case studies, two right answers"
        },
        {
          "type": "paragraph",
          "content": "A fintech startup had a monorepo with 15 microservices (Node.js APIs, Python data pipelines, Terraform infrastructure). It needed integration tests across services, a Docker image per service, deploys to ECS and infrastructure updates. Actions' matrix builds and job dependencies gave parallel tests while keeping the deploy order. Cost: ~$200/month for 2,000 build minutes. On Vercel the same setup would need custom build scripts, with no native Docker builds."
        },
        {
          "type": "paragraph",
          "content": "A marketing agency builds client websites in Next.js and deploys 50+ sites a month, each needing an instant preview URL for client approval. Automatic previews on every PR and Edge Functions for A/B testing made Vercel the clear choice. Builds take 2-3 minutes per site; cost is $20/month per team member plus usage. On Actions they would need custom preview URLs, an S3/CloudFront setup and much more configuration. An A/B test on an Edge Function looks like this; look at the cookie:"
        },
        {
          "type": "code",
          "language": "javascript",
          "code": "// Vercel: Edge Functions for A/B testing\n// api/ab-test.js\nexport default async function handler(req, res) {\n  const variant = req.cookies.variant || (Math.random() > 0.5 ? 'A' : 'B');\n  \n  // Set cookie for consistent experience\n  res.setHeader('Set-Cookie', `variant=${variant}; Path=/; Max-Age=86400`);\n  \n  // Return variant-specific content\n  const content = {\n    A: { headline: 'Welcome to Our Site', cta: 'Get Started' },\n    B: { headline: 'Transform Your Business', cta: 'Start Free Trial' }\n  };\n  \n  return res.json(content[variant]);\n}\n\n// Deployed automatically to Edge Network\n// Zero configuration, runs at <50ms latency globally"
        },
        {
          "type": "paragraph",
          "content": "The variant is picked once, kept for a day (`Max-Age=86400`) so each visitor sees a consistent page, and served from the edge with nothing to configure."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Cost and speed: minutes, runners and caches"
        },
        {
          "type": "paragraph",
          "content": "Prices change, so read these as a snapshot from when this was written (mid-2024). Actions billed per runner-minute, with a multiplier per OS: $0.008/minute on Linux, $0.016 on Windows, $0.08 on macOS, with 2,000 free minutes a month for private repos. Self-hosted runners are free but you manage them. Vercel bills build minutes plus runtime resources, and hosting sits on the same bill, which simplifies procurement for frontend teams. Its free tier includes 100GB of bandwidth; Pro is $20/user/month with unlimited bandwidth, team features and build minutes included, plus $40 per 1,000 extra minutes. Enterprise pricing is custom."
        },
        {
          "type": "paragraph",
          "content": "On speed, Actions runners are ephemeral: every job starts fresh, which is consistent but adds startup overhead. Vercel's build cache is more aggressive, so incremental builds are often faster. In a monorepo, Actions parallelises jobs across services, while Vercel builds sequentially unless you configure build filters. To cut Actions costs, attach ephemeral EC2 spot instances as self-hosted runners, which also covers GPU or ARM workloads. Look at `runs-on` and the arithmetic in the comments:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Self-hosted runners for cost optimization\nname: Build with Self-Hosted Runner\non:\n  push:\n    branches: [main]\n\njobs:\n  build:\n    runs-on: self-hosted  # EC2 spot instance\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: '20.x'\n      \n      - name: Cache dependencies\n        uses: actions/cache@v3\n        with:\n          path: ~/.npm\n          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}\n          restore-keys: |\n            ${{ runner.os }}-node-\n      \n      - name: Install and build\n        run: |\n          npm ci\n          npm run build\n      \n      - name: Upload artifacts\n        uses: actions/upload-artifact@v3\n        with:\n          name: dist\n          path: dist/\n\n# Cost optimization: Self-hosted runners on EC2 spot instances\n# - GitHub Actions: $0.008/minute for Linux\n# - EC2 t3.medium spot: ~$0.01/hour = $0.00017/minute\n# Savings: ~95% for long-running builds"
        },
        {
          "type": "paragraph",
          "content": "The workflow itself is ordinary; only the machine changes. By the comment's numbers that saves about 95% per minute on long builds, as long as someone maintains the runners."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Advanced patterns: path filters and the edge"
        },
        {
          "type": "paragraph",
          "content": "On Actions, use matrix builds across Node.js versions, operating systems or services; job dependencies to deploy in order; artifacts to pass build output between jobs; and reusable workflows to avoid duplicating YAML across repositories. In a monorepo the biggest win is path filters, which run jobs only when relevant files change. Look at `detect-changes` and the `if:` on each test job:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Monorepo optimization with path filters\nname: Monorepo CI\non:\n  push:\n    paths:\n      - 'services/api/**'\n      - 'services/shared/**'\n      - '.github/workflows/**'\n\njobs:\n  detect-changes:\n    runs-on: ubuntu-latest\n    outputs:\n      api: ${{ steps.filter.outputs.api }}\n      worker: ${{ steps.filter.outputs.worker }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: dorny/paths-filter@v2\n        id: filter\n        with:\n          filters: |\n            api:\n              - 'services/api/**'\n              - 'services/shared/**'\n            worker:\n              - 'services/worker/**'\n              - 'services/shared/**'\n\n  test-api:\n    needs: detect-changes\n    if: needs.detect-changes.outputs.api == 'true'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: cd services/api && npm test\n\n  test-worker:\n    needs: detect-changes\n    if: needs.detect-changes.outputs.worker == 'true'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: cd services/worker && npm test"
        },
        {
          "type": "paragraph",
          "content": "A change under `services/api` runs only the API tests; a change in `services/shared` runs both, because both depend on it."
        },
        {
          "type": "paragraph",
          "content": "On Vercel, configure build filters so a monorepo rebuilds only changed packages. Use Incremental Static Regeneration (ISR), which serves static pages and regenerates them in the background, for content that doesn't need real-time updates, and Vercel Analytics to track Core Web Vitals. Edge Middleware handles request rewriting, authentication and A/B testing before a request reaches your app. Look at the three decisions it makes, in order:"
        },
        {
          "type": "code",
          "language": "typescript",
          "code": "// Vercel: Edge Middleware for request handling\n// middleware.ts\nimport { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  // A/B testing\n  const variant = request.cookies.get('variant')?.value || \n    (Math.random() > 0.5 ? 'A' : 'B');\n  \n  // Geo-based routing\n  const country = request.geo?.country || 'US';\n  if (country === 'GB') {\n    return NextResponse.rewrite(new URL('/uk', request.url));\n  }\n  \n  // Authentication check\n  const token = request.cookies.get('auth-token');\n  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n  \n  // Add custom headers\n  const response = NextResponse.next();\n  response.headers.set('X-Country', country);\n  response.headers.set('X-Variant', variant);\n  \n  return response;\n}\n\nexport const config = {\n  matcher: [\n    '/((?!api|_next/static|_next/image|favicon.ico).*)',\n  ],\n};\n\n// Runs at Edge locations globally, <50ms latency"
        },
        {
          "type": "paragraph",
          "content": "UK visitors are rewritten to `/uk`, anonymous users are sent from `/dashboard` to login, and everyone else passes through with country and variant headers. The `matcher` keeps it off API routes and static assets."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Running both: Actions for the backend, Vercel for the frontend"
        },
        {
          "type": "paragraph",
          "content": "Many organisations use both. Backend changes go through Actions, which runs tests, builds Docker images and deploys to ECS; on success, it calls Vercel's deployment API to rebuild the frontend that consumes the updated API. Frontend PRs get Vercel previews immediately. Ownership stays clear: the platform team owns the Actions workflows, the frontend team owns the Vercel configuration. Look at the last step of `deploy-backend`:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Trigger Vercel after backend deployment\nname: Full Stack Deployment\non:\n  push:\n    branches: [main]\n    paths:\n      - 'backend/**'\n      - 'frontend/**'\n\njobs:\n  deploy-backend:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Run backend tests\n        run: cd backend && npm test\n      \n      - name: Build and deploy backend\n        run: |\n          cd backend\n          docker build -t api:latest .\n          # Deploy to ECS...\n      \n      - name: Trigger Vercel deployment\n        run: |\n          curl -X POST https://api.vercel.com/v1/integrations/deploy/your-project-id             -H \"Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}\"             -d '{\"gitRef\": \"${{ github.sha }}\"}'\n\n  deploy-frontend:\n    if: contains(github.event.head_commit.message, '[deploy-frontend]')\n    runs-on: ubuntu-latest\n    steps:\n      - name: Trigger Vercel\n        run: |\n          curl -X POST https://api.vercel.com/v1/integrations/deploy/your-project-id             -H \"Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}\""
        },
        {
          "type": "paragraph",
          "content": "The hand-off is one HTTP call at the same commit, made only after backend tests pass. A commit message containing `[deploy-frontend]` triggers the frontend on its own."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "How to choose"
        },
        {
          "type": "list",
          "items": [
            "Docker builds, multi-cloud deploys, policy checks, approvals, or complex orchestration of backend APIs, Kafka pipelines or IaC: GitHub Actions.",
            "Mostly frontend or serverless, Next.js/React, and instant zero-config previews for stakeholders: Vercel.",
            "Both backend and frontend: use both, Actions for backend CI/CD and Vercel for frontend hosting, chained by webhooks."
          ]
        },
        {
          "type": "paragraph",
          "content": "On cost, Actions is cheaper for high-volume builds, especially on self-hosted runners; Vercel is more cost-effective when hosting comes with the same platform. Neither choice is a trap. If you start on Vercel and need more control, export the build artifacts and deploy them to S3/CloudFront from Actions. If you start on Actions and want faster frontend previews, add Vercel as a second deployment target. Just don't force one tool to do everything."
        }
      ]
    },
    it: {
      "title": "GitHub Actions o Vercel? Dipende, davvero",
      "description": "GitHub Actions contro Vercel, senza tifo da stadio. Un'officina e una linea di montaggio: cosa sa fare ciascuno, quanto costa al minuto e chi vince in ogni scenario. La risposta è 'dipende', ma non quello inutile.",
      "content": [
        {
          "type": "paragraph",
          "content": "Ogni dibattito GitHub Actions contro Vercel parte dal prezzo o dalla feature del cuore e finisce in tifo da stadio. La domanda utile è più sottovoce: quale workflow stai davvero ottimizzando? Ho gestito monorepo con decine di microservizi su Actions e messo in produzione piattaforme Next.js che da Vercel non sono mai uscite. Scelte giuste tutte e due. Per motivi opposti."
        },
        {
          "type": "paragraph",
          "content": "Non sono nemmeno lo stesso tipo di strumento. GitHub Actions è un motore di automazione generico: esegue qualunque job scritto in YAML su una macchina pulita. Vercel è una piattaforma di hosting con una pipeline di build attaccata, pensata per i framework frontend. Actions è un'officina piena di attrezzi. Vercel è una linea di montaggio costruita per un prodotto solo. Questo confronto viene dalla CI/CD di team fintech, e-commerce e SaaS con migliaia di deploy al mese. Il giro:"
        },
        {
          "type": "list",
          "items": [
            "cosa sa fare ciascuno, con una pipeline per parte;",
            "due casi reali con risposte opposte;",
            "costi, velocità e pattern avanzati;",
            "usarli insieme, e come scegliere."
          ],
          "ordered": true
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Actions ti dà i mattoni"
        },
        {
          "type": "paragraph",
          "content": "Actions ti dà workflow riutilizzabili, matrix build, action custom, runner self-hosted, federazione OIDC con i cloud e regole di protezione degli ambienti. Dove spacca è l'orchestrazione complessa: pipeline multi-stage con condizioni, job paralleli e dipendenze tra loro. Lo YAML è verboso, ma ci scrivi quasi qualunque pattern CI/CD. Devi lanciare Terraform, buildare immagini Docker e pubblicare chart Helm? Actions è tuo amico. Guarda le righe `needs:`, che concatenano i job, e la `matrix`, che apre un job per ogni servizio:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Complex multi-service pipeline\nname: Full Stack CI/CD\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main]\n\nenv:\n  AWS_REGION: us-east-1\n  NODE_VERSION: '20.x'\n\njobs:\n  lint-and-test:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        service: [api, worker, scheduler]\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: ${{ env.NODE_VERSION }}\n          cache: 'npm'\n          cache-dependency-path: ${{ matrix.service }}/package-lock.json\n      \n      - name: Install dependencies\n        working-directory: ${{ matrix.service }}\n        run: npm ci\n      \n      - name: Run linter\n        working-directory: ${{ matrix.service }}\n        run: npm run lint\n      \n      - name: Run tests\n        working-directory: ${{ matrix.service }}\n        run: npm test -- --coverage\n      \n      - name: Upload coverage\n        uses: codecov/codecov-action@v3\n        with:\n          files: ${{ matrix.service }}/coverage/lcov.info\n\n  build-containers:\n    needs: lint-and-test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Set up Docker Buildx\n        uses: docker/setup-buildx-action@v3\n      \n      - name: Login to ECR\n        uses: aws-actions/amazon-ecr-login@v2\n      \n      - name: Build and push\n        uses: docker/build-push-action@v5\n        with:\n          context: .\n          push: true\n          tags: |\n            ${{ secrets.AWS_ECR_REGISTRY }}/api:${{ github.sha }}\n            ${{ secrets.AWS_ECR_REGISTRY }}/api:latest\n          cache-from: type=registry,ref=${{ secrets.AWS_ECR_REGISTRY }}/api:buildcache\n          cache-to: type=registry,ref=${{ secrets.AWS_ECR_REGISTRY }}/api:buildcache,mode=max\n\n  deploy-infrastructure:\n    needs: build-containers\n    runs-on: ubuntu-latest\n    permissions:\n      id-token: write\n      contents: read\n    steps:\n      - uses: actions/checkout@v4\n      \n      - uses: hashicorp/setup-terraform@v3\n        with:\n          terraform_version: 1.6.0\n      \n      - name: Terraform Plan\n        working-directory: infrastructure\n        run: terraform plan -out=tfplan\n      \n      - name: Terraform Apply\n        if: github.ref == 'refs/heads/main'\n        working-directory: infrastructure\n        run: terraform apply -auto-approve tfplan\n\n  deploy-services:\n    needs: [build-containers, deploy-infrastructure]\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        service: [api, worker]\n    steps:\n      - name: Deploy to ECS\n        uses: aws-actions/amazon-ecs-deploy-task-definition@v1\n        with:\n          task-definition: ${{ matrix.service }}/task-definition.json\n          service: ${{ matrix.service }}-service\n          cluster: production-cluster\n          wait-for-service-stability: true"
        },
        {
          "type": "paragraph",
          "content": "Lint e test girano in parallelo su tre servizi. I container si buildano solo se passa tutto, Terraform applica solo su `main`, e i servizi si deployano solo quando l'infrastruttura è pronta."
        },
        {
          "type": "paragraph",
          "content": "Un mattone si merita un esempio a parte: OIDC. Invece di salvare una access key AWS come secret, il job riceve da GitHub un token firmato, a vita breve, che dice quale repo e quale workflow è. AWS lo scambia con credenziali temporanee. È un badge da visitatore che scade quando esci, non una copia delle chiavi dell'ufficio. Guarda `id-token: write` e `role-to-assume`:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: OIDC authentication for AWS (no long-lived credentials)\nname: Deploy to AWS\non:\n  push:\n    branches: [main]\n\npermissions:\n  id-token: write\n  contents: read\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Configure AWS credentials\n        uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole\n          aws-region: us-east-1\n      \n      - name: Deploy to S3\n        run: |\n          aws s3 sync ./dist s3://my-bucket --delete\n      \n      - name: Invalidate CloudFront\n        run: |\n          aws cloudfront create-invalidation             --distribution-id E1234567890             --paths \"/*\"\n\n# Security benefit: No AWS access keys stored in secrets\n# Uses OIDC federation - credentials expire after job completion"
        },
        {
          "type": "paragraph",
          "content": "Il job sincronizza un sito statico su S3 e invalida CloudFront senza una sola chiave AWS salvata. E le credenziali muoiono a fine job."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Vercel ti dà i default"
        },
        {
          "type": "paragraph",
          "content": "Vercel punta tutto sull'esperienza di sviluppo a configurazione zero: un URL di preview per ogni PR, ottimizzazione delle immagini inclusa, Edge Function e un gestore delle variabili d'ambiente. Riconosce il framework (Next.js, Remix, Astro), configura la build e ti genera le preview senza che tu chieda niente. Il prezzo è la flessibilità: personalizzare gli step di build o lanciare script arbitrari è una sofferenza. Per frontend serverless con preview in pochi secondi, però, non ha rivali. Per un'app Next.js standard, questo file opzionale è tutta la pipeline:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# Vercel: Zero-config Next.js deployment\n# vercel.json (optional - Vercel auto-detects most settings)\n{\n  \"buildCommand\": \"npm run build\",\n  \"outputDirectory\": \".next\",\n  \"framework\": \"nextjs\",\n  \"regions\": [\"iad1\"],\n  \"env\": {\n    \"DATABASE_URL\": \"@database-url\",\n    \"API_KEY\": \"@api-key\"\n  },\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        {\n          \"key\": \"X-Content-Type-Options\",\n          \"value\": \"nosniff\"\n        }\n      ]\n    }\n  ]\n}\n\n# That's it. Every PR gets a preview URL automatically.\n# No YAML, no configuration needed for standard Next.js apps."
        },
        {
          "type": "paragraph",
          "content": "Quasi tutte queste impostazioni Vercel le rileva da solo. Il file fissa la regione, i riferimenti alle variabili d'ambiente e un header di sicurezza. Fine."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Due casi reali, due risposte giuste"
        },
        {
          "type": "paragraph",
          "content": "Una startup fintech aveva un monorepo con 15 microservizi (API Node.js, pipeline dati Python, infrastruttura Terraform). Servivano test di integrazione tra servizi, un'immagine Docker per servizio, deploy su ECS e aggiornamenti dell'infrastruttura. Matrix build e dipendenze tra job di Actions hanno dato test in parallelo senza perdere l'ordine di deploy. Costo: ~$200/mese per 2.000 minuti di build. Su Vercel lo stesso setup voleva script di build custom. E niente build Docker native."
        },
        {
          "type": "paragraph",
          "content": "Un'agenzia di marketing costruisce siti per i clienti in Next.js e ne mette online 50+ al mese, ognuno con un URL di preview immediato per l'ok del cliente. Preview automatiche su ogni PR ed Edge Function per l'A/B testing: Vercel era la scelta ovvia. Le build durano 2-3 minuti a sito, il costo è $20/mese per membro del team più l'uso. Su Actions ti servirebbero URL di preview custom, un setup S3/CloudFront e molta più configurazione. Un A/B test su una Edge Function è così. Guarda il cookie:"
        },
        {
          "type": "code",
          "language": "javascript",
          "code": "// Vercel: Edge Functions for A/B testing\n// api/ab-test.js\nexport default async function handler(req, res) {\n  const variant = req.cookies.variant || (Math.random() > 0.5 ? 'A' : 'B');\n  \n  // Set cookie for consistent experience\n  res.setHeader('Set-Cookie', `variant=${variant}; Path=/; Max-Age=86400`);\n  \n  // Return variant-specific content\n  const content = {\n    A: { headline: 'Welcome to Our Site', cta: 'Get Started' },\n    B: { headline: 'Transform Your Business', cta: 'Start Free Trial' }\n  };\n  \n  return res.json(content[variant]);\n}\n\n// Deployed automatically to Edge Network\n// Zero configuration, runs at <50ms latency globally"
        },
        {
          "type": "paragraph",
          "content": "La variante si sceglie una volta e resta per un giorno (`Max-Age=86400`), così ogni visitatore vede una pagina coerente. La serve l'edge, senza niente da configurare."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Costi e velocità: minuti, runner e cache"
        },
        {
          "type": "paragraph",
          "content": "I prezzi cambiano, quindi prendi questi come una foto del momento in cui ho scritto (metà 2024). Actions fatturava a minuto di runner, con un moltiplicatore per sistema operativo: $0.008/minuto su Linux, $0.016 su Windows, $0.08 su macOS, con 2.000 minuti gratis al mese per i repo privati. I runner self-hosted sono gratis, ma li gestisci tu. Vercel fattura i minuti di build più le risorse di runtime, e l'hosting sta sulla stessa fattura: per i team frontend gli acquisti si semplificano. Il piano gratuito include 100GB di banda. Pro costa $20/utente/mese con banda illimitata, funzioni per team e minuti di build inclusi, più $40 ogni 1.000 minuti extra. Enterprise, prezzi su misura."
        },
        {
          "type": "paragraph",
          "content": "Sulla velocità: i runner di Actions sono effimeri. Ogni job parte da zero, e questo ti garantisce coerenza ma aggiunge tempo di avvio. La cache di build di Vercel è più aggressiva, quindi le build incrementali spesso vanno più veloci. In un monorepo Actions parallelizza i job tra i servizi, Vercel invece builda in sequenza, a meno che non configuri i filtri di build. Per tagliare la bolletta di Actions, attacca istanze EC2 spot effimere come runner self-hosted. Servono anche per carichi GPU o ARM. Guarda `runs-on` e i conti nei commenti:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Self-hosted runners for cost optimization\nname: Build with Self-Hosted Runner\non:\n  push:\n    branches: [main]\n\njobs:\n  build:\n    runs-on: self-hosted  # EC2 spot instance\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: '20.x'\n      \n      - name: Cache dependencies\n        uses: actions/cache@v3\n        with:\n          path: ~/.npm\n          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}\n          restore-keys: |\n            ${{ runner.os }}-node-\n      \n      - name: Install and build\n        run: |\n          npm ci\n          npm run build\n      \n      - name: Upload artifacts\n        uses: actions/upload-artifact@v3\n        with:\n          name: dist\n          path: dist/\n\n# Cost optimization: Self-hosted runners on EC2 spot instances\n# - GitHub Actions: $0.008/minute for Linux\n# - EC2 t3.medium spot: ~$0.01/hour = $0.00017/minute\n# Savings: ~95% for long-running builds"
        },
        {
          "type": "paragraph",
          "content": "Il workflow in sé è normalissimo. Cambia solo la macchina. Stando ai numeri del commento risparmi circa il 95% al minuto sulle build lunghe, a patto che qualcuno i runner li mantenga."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Pattern avanzati: path filter ed edge"
        },
        {
          "type": "paragraph",
          "content": "Su Actions usa matrix build su versioni di Node.js, sistemi operativi o servizi; dipendenze tra job per deployare in ordine; artifact per passarti l'output di build tra job; workflow riutilizzabili per non copiare lo stesso YAML tra repository. In un monorepo il colpo grosso sono i path filter: lanciano i job solo quando cambiano i file che contano. Guarda `detect-changes` e l'`if:` su ogni job di test:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Monorepo optimization with path filters\nname: Monorepo CI\non:\n  push:\n    paths:\n      - 'services/api/**'\n      - 'services/shared/**'\n      - '.github/workflows/**'\n\njobs:\n  detect-changes:\n    runs-on: ubuntu-latest\n    outputs:\n      api: ${{ steps.filter.outputs.api }}\n      worker: ${{ steps.filter.outputs.worker }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: dorny/paths-filter@v2\n        id: filter\n        with:\n          filters: |\n            api:\n              - 'services/api/**'\n              - 'services/shared/**'\n            worker:\n              - 'services/worker/**'\n              - 'services/shared/**'\n\n  test-api:\n    needs: detect-changes\n    if: needs.detect-changes.outputs.api == 'true'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: cd services/api && npm test\n\n  test-worker:\n    needs: detect-changes\n    if: needs.detect-changes.outputs.worker == 'true'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: cd services/worker && npm test"
        },
        {
          "type": "paragraph",
          "content": "Tocchi `services/api`, e partono solo i test dell'API. Tocchi `services/shared`, e partono tutti e due, perché tutti e due ne dipendono."
        },
        {
          "type": "paragraph",
          "content": "Su Vercel configura i filtri di build, così un monorepo ricostruisce solo i pacchetti cambiati. Usa l'Incremental Static Regeneration (ISR), che serve pagine statiche e le rigenera in background, per i contenuti che non devono essere in tempo reale, e Vercel Analytics per seguire i Core Web Vitals. L'Edge Middleware gestisce riscritture, autenticazione e A/B testing prima che la richiesta arrivi all'app. Guarda le tre decisioni che prende, in ordine:"
        },
        {
          "type": "code",
          "language": "typescript",
          "code": "// Vercel: Edge Middleware for request handling\n// middleware.ts\nimport { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  // A/B testing\n  const variant = request.cookies.get('variant')?.value || \n    (Math.random() > 0.5 ? 'A' : 'B');\n  \n  // Geo-based routing\n  const country = request.geo?.country || 'US';\n  if (country === 'GB') {\n    return NextResponse.rewrite(new URL('/uk', request.url));\n  }\n  \n  // Authentication check\n  const token = request.cookies.get('auth-token');\n  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n  \n  // Add custom headers\n  const response = NextResponse.next();\n  response.headers.set('X-Country', country);\n  response.headers.set('X-Variant', variant);\n  \n  return response;\n}\n\nexport const config = {\n  matcher: [\n    '/((?!api|_next/static|_next/image|favicon.ico).*)',\n  ],\n};\n\n// Runs at Edge locations globally, <50ms latency"
        },
        {
          "type": "paragraph",
          "content": "Chi arriva dal Regno Unito viene riscritto su `/uk`, gli anonimi vengono rimbalzati da `/dashboard` al login, e tutti gli altri passano con gli header di paese e variante. Il `matcher` lo tiene lontano dalle route API e dagli asset statici."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Insieme: Actions per il backend, Vercel per il frontend"
        },
        {
          "type": "paragraph",
          "content": "Tante organizzazioni li usano tutti e due. Le modifiche al backend passano da Actions, che lancia i test, builda le immagini Docker e deploya su ECS. Se va tutto bene, chiama l'API di deploy di Vercel per ricostruire il frontend che consuma l'API aggiornata. Le PR del frontend hanno subito le preview di Vercel. Le responsabilità restano nette: il team di piattaforma possiede i workflow Actions, il team frontend la configurazione Vercel. Guarda l'ultimo step di `deploy-backend`:"
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "# GitHub Actions: Trigger Vercel after backend deployment\nname: Full Stack Deployment\non:\n  push:\n    branches: [main]\n    paths:\n      - 'backend/**'\n      - 'frontend/**'\n\njobs:\n  deploy-backend:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Run backend tests\n        run: cd backend && npm test\n      \n      - name: Build and deploy backend\n        run: |\n          cd backend\n          docker build -t api:latest .\n          # Deploy to ECS...\n      \n      - name: Trigger Vercel deployment\n        run: |\n          curl -X POST https://api.vercel.com/v1/integrations/deploy/your-project-id             -H \"Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}\"             -d '{\"gitRef\": \"${{ github.sha }}\"}'\n\n  deploy-frontend:\n    if: contains(github.event.head_commit.message, '[deploy-frontend]')\n    runs-on: ubuntu-latest\n    steps:\n      - name: Trigger Vercel\n        run: |\n          curl -X POST https://api.vercel.com/v1/integrations/deploy/your-project-id             -H \"Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}\""
        },
        {
          "type": "paragraph",
          "content": "Il passaggio di consegne è una sola chiamata HTTP sullo stesso commit, e parte solo dopo che i test del backend sono passati. Un messaggio di commit con `[deploy-frontend]` fa partire il frontend da solo."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Come scegli"
        },
        {
          "type": "list",
          "items": [
            "Build Docker, deploy multi-cloud, controlli di policy, approvazioni, o orchestrazione complessa di API backend, pipeline Kafka o IaC: GitHub Actions.",
            "Soprattutto frontend o serverless, Next.js/React e preview istantanee a configurazione zero per gli stakeholder: Vercel.",
            "Backend e frontend: tutti e due. Actions per la CI/CD del backend, Vercel per l'hosting del frontend, collegati da webhook."
          ]
        },
        {
          "type": "paragraph",
          "content": "Sui costi, Actions conviene per build ad alto volume, soprattutto con runner self-hosted. Vercel conviene quando l'hosting sta sulla stessa piattaforma. Nessuna delle due è una trappola. Parti da Vercel e ti serve più controllo? Esporta gli artifact di build e deployali su S3/CloudFront da Actions. Parti da Actions e vuoi preview frontend più rapide? Aggiungi Vercel come secondo target di deploy. Basta non costringere uno strumento a fare tutto."
        }
      ]
    },
  },
  'kubernetes-autoscaling-hpa-keda': {
    en: {
      "title": "Kubernetes autoscaling: HPA, KEDA, nodes",
      "description": "How the three autoscaling layers fit together, which metrics actually matter, and the pitfalls that cause thrash, cold starts, and surprise bills.",
      "content": [
        {
          "type": "paragraph",
          "content": "Traffic spikes. The autoscaler does its job and asks for more pods. The pods sit in `Pending`, because no node has room for them. New nodes arrive minutes later, by which time users have already met the timeouts. Then traffic drops, everything scales down, traffic comes back, and the cluster spends the afternoon as a yo-yo while the bill keeps counting."
        },
        {
          "type": "paragraph",
          "content": "Autoscaling is where teams either save money or set it on fire. Kubernetes ships three independent controllers operating at different layers, and the common mistake is treating them as a single knob. After tuning autoscaling for platforms handling unpredictable traffic, from Black Friday spikes to bursty event-driven jobs, here is how the pieces fit and where they bite."
        },
        {
          "type": "paragraph",
          "content": "The map: first the three layers, then the HPA and its metrics, then KEDA for queues, then nodes, and finally how to stop the system from flapping."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Three layers, three different questions"
        },
        {
          "type": "paragraph",
          "content": "Picture a supermarket at rush hour. You can open more checkout lanes, give each cashier a faster till, or rent a bigger building. Kubernetes has one controller for each:"
        },
        {
          "type": "list",
          "items": [
            "The Horizontal Pod Autoscaler (HPA) changes the replica count of a workload: more lanes.",
            "The Vertical Pod Autoscaler (VPA) adjusts each pod's CPU and memory requests: a faster till.",
            "The Cluster Autoscaler (or Karpenter) adds and removes nodes when pods cannot be scheduled: a bigger building."
          ]
        },
        {
          "type": "paragraph",
          "content": "They do not coordinate with each other, so compose them deliberately. Run HPA and VPA on the same resource, such as CPU, and they will fight over the same signal: VPA raises the request, utilization per pod drops, HPA removes replicas, and round it goes."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The HPA scales on a ratio, so pick the right metric"
        },
        {
          "type": "paragraph",
          "content": "The HPA's core logic is one line of arithmetic: desired replicas = current replicas × (current metric value / target value), rounded up. If 3 pods each see double the target, the HPA asks for 6. Everything depends on which metric you feed into that ratio."
        },
        {
          "type": "paragraph",
          "content": "CPU-based HPA is the default and almost never the right SLI. Many latency-sensitive services slow down long before CPU climbs, because they wait on I/O, connection pools or downstream calls. They should scale on requests per second or queue depth instead, exposed as custom or external metrics through Prometheus Adapter, which makes Prometheus data readable by the HPA. Target a realistic utilization (60–70%) so there is headroom during the ramp, and always set sensible min and max replicas."
        },
        {
          "type": "paragraph",
          "content": "In this HPA, look at two parts: the `metrics` block, which scales on requests per second instead of CPU, and the `behavior` block, which slows down scale-down."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: api\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: api\n  minReplicas: 3\n  maxReplicas: 20\n  metrics:\n    - type: Pods\n      pods:\n        metric:\n          name: http_requests_per_second\n        target:\n          type: AverageValue\n          averageValue: \"50\"\n  behavior:\n    scaleDown:\n      stabilizationWindowSeconds: 300\n      policies:\n        - type: Percent\n          value: 50\n          periodSeconds: 60"
        },
        {
          "type": "paragraph",
          "content": "The HPA keeps between 3 and 20 replicas, aiming for an average of 50 requests per second per pod. Before scaling down it looks back over a 300-second window, and it never removes more than half the pods in a single minute."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "KEDA scales on the backlog, all the way to zero"
        },
        {
          "type": "paragraph",
          "content": "Queue workers, Kafka consumers and bursty jobs have a better signal than CPU: how much work is waiting. KEDA (Kubernetes Event-Driven Autoscaling) scales on that actual backlog, and it can scale to zero when idle, something stock HPA cannot do. It is not a replacement for the HPA: KEDA creates an HPA under the hood and feeds it external scalers (SQS, Kafka, Prometheus, cron), while handling the jump from zero to one replica itself."
        },
        {
          "type": "paragraph",
          "content": "This ScaledObject watches an SQS queue. Look at `minReplicaCount` and `queueLength`."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: keda.sh/v1alpha1\nkind: ScaledObject\nmetadata:\n  name: worker\nspec:\n  scaleTargetRef:\n    name: worker\n  minReplicaCount: 0\n  maxReplicaCount: 30\n  cooldownPeriod: 120\n  triggers:\n    - type: aws-sqs-queue\n      metadata:\n        queueURL: https://sqs.eu-west-1.amazonaws.com/123456789/jobs\n        queueLength: \"20\"\n        awsRegion: eu-west-1"
        },
        {
          "type": "paragraph",
          "content": "With an empty queue the worker runs zero pods. As messages arrive, KEDA aims for about 20 messages per replica, up to 30 replicas, and waits 120 seconds after the queue goes quiet before scaling back to zero."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "More pods are useless without nodes to put them on"
        },
        {
          "type": "paragraph",
          "content": "Replica scaling is useless if nodes cannot host the pods. Both node autoscalers react to pods stuck in `Pending`. Cluster Autoscaler scales fixed node groups you defined in advance, each with one instance type. Karpenter provisions right-sized nodes just-in-time, choosing the instance type to fit the waiting pods, and consolidates underused ones."
        },
        {
          "type": "paragraph",
          "content": "Nodes come and go in both cases, so protect availability. A PodDisruptionBudget sets how many replicas must stay up while nodes are drained. Topology spread constraints spread replicas across nodes and zones, so one node leaving never takes a whole service with it."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Avoiding thrash and cold starts"
        },
        {
          "type": "paragraph",
          "content": "Flapping (rapid scale up and down) burns money and hurts latency. Every new pod pays a cold start: pull the image, start the process, warm caches. A few habits keep it in check:"
        },
        {
          "type": "list",
          "items": [
            "Use HPA stabilization windows and scale-down policies, as in the example above.",
            "Keep readiness probes honest, so new pods do not receive traffic before they are warm.",
            "Pre-provision a small buffer for spiky workloads, so the first part of a spike lands on capacity that already exists."
          ]
        },
        {
          "type": "paragraph",
          "content": "Measure the cost of a cold start before optimizing for it. Premature warm pools are their own waste. And if your traffic is flat, a fixed replica count is a perfectly respectable autoscaling strategy."
        }
      ]
    },
    it: {
      "title": "HPA e KEDA: il cluster che respira",
      "description": "HPA, VPA, Cluster Autoscaler, Karpenter e KEDA: tre livelli di autoscaling che non si parlano. Quali metriche contano davvero e come eviti thrash, cold start e bollette a sorpresa.",
      "content": [
        {
          "type": "paragraph",
          "content": "Arriva un picco di traffico. L'autoscaler fa il suo lavoro e chiede più pod. I pod restano in `Pending`: nessun nodo ha spazio. I nodi nuovi arrivano minuti dopo, quando gli utenti si sono già presi i timeout. Poi il traffico cala, tutto scala giù, il traffico torna, e il cluster passa il pomeriggio su e giù come un ascensore impazzito. La bolletta, intanto, conta."
        },
        {
          "type": "paragraph",
          "content": "L'autoscaling è il punto dove un team risparmia o brucia soldi. Kubernetes ti dà tre controller indipendenti, ognuno su un livello diverso, e l'errore classico è trattarli come un'unica manopola. Ho messo a punto l'autoscaling su piattaforme con traffico imprevedibile, dai picchi del Black Friday ai job event-driven a raffica. Ecco come si incastrano i pezzi. E dove mordono."
        },
        {
          "type": "paragraph",
          "content": "Il giro: prima i tre livelli, poi l'HPA e le sue metriche, poi KEDA per le code, poi i nodi. Alla fine, come eviti che il sistema oscilli."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Tre livelli, tre domande diverse"
        },
        {
          "type": "paragraph",
          "content": "Pensa a un supermercato all'ora di punta. Puoi aprire più casse, dare a ogni cassiere un registratore più veloce, o affittare un edificio più grande. Kubernetes ha un controller per ognuna:"
        },
        {
          "type": "list",
          "items": [
            "L'Horizontal Pod Autoscaler (HPA) cambia il numero di repliche di un workload. Più casse.",
            "Il Vertical Pod Autoscaler (VPA) regola le request di CPU e memoria di ogni pod. Un registratore più veloce.",
            "Il Cluster Autoscaler (o Karpenter) aggiunge e toglie nodi quando i pod non trovano posto. Un edificio più grande."
          ]
        },
        {
          "type": "paragraph",
          "content": "Non si coordinano tra loro, quindi componili con la testa. Metti HPA e VPA sulla stessa risorsa, per esempio la CPU, e litigano sullo stesso segnale: il VPA alza la request, l'utilizzo per pod scende, l'HPA toglie repliche, e il giro ricomincia. All'infinito."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "L'HPA ragiona per rapporti: scegli bene la metrica"
        },
        {
          "type": "paragraph",
          "content": "La logica di base dell'HPA è una riga di aritmetica: repliche desiderate = repliche attuali × (valore attuale della metrica / valore obiettivo), arrotondato per eccesso. Se 3 pod vedono ognuno il doppio dell'obiettivo, l'HPA ne chiede 6. Tutto sta in quale metrica ci metti dentro."
        },
        {
          "type": "paragraph",
          "content": "L'HPA sulla CPU è il default. E quasi mai è lo SLI giusto. Tanti servizi sensibili alla latenza rallentano molto prima che la CPU si muova, perché aspettano I/O, connection pool o chiamate a valle. Quelli vanno scalati sulle richieste al secondo o sulla profondità della coda, esposte come metriche custom o external tramite Prometheus Adapter. Tradotto: rende i dati di Prometheus leggibili all'HPA. Punta a un utilizzo realistico (60–70%), così hai margine durante la salita, e metti sempre min e max di repliche sensati."
        },
        {
          "type": "paragraph",
          "content": "In questo HPA guarda due pezzi: il blocco `metrics`, che scala sulle richieste al secondo invece che sulla CPU, e il blocco `behavior`, che frena lo scale-down."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: api\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: api\n  minReplicas: 3\n  maxReplicas: 20\n  metrics:\n    - type: Pods\n      pods:\n        metric:\n          name: http_requests_per_second\n        target:\n          type: AverageValue\n          averageValue: \"50\"\n  behavior:\n    scaleDown:\n      stabilizationWindowSeconds: 300"
        },
        {
          "type": "paragraph",
          "content": "L'HPA tiene tra 3 e 20 repliche, puntando a una media di 50 richieste al secondo per pod. Prima di scalare giù guarda indietro su una finestra di 300 secondi, e non toglie mai più di metà dei pod in un minuto."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "KEDA scala sul backlog. Anche a zero"
        },
        {
          "type": "paragraph",
          "content": "Worker di code, consumer Kafka e job a raffica hanno un segnale migliore della CPU: quanto lavoro c'è in attesa. KEDA (Kubernetes Event-Driven Autoscaling) scala su quel backlog vero, e quando non c'è niente da fare scende a zero. L'HPA standard non lo sa fare. Non lo sostituisce, però: KEDA crea un HPA sotto il cofano e lo alimenta con scaler esterni (SQS, Kafka, Prometheus, cron), e il salto da zero a una replica se lo gestisce da solo."
        },
        {
          "type": "paragraph",
          "content": "Questo ScaledObject osserva una coda SQS. Occhio a `minReplicaCount` e `queueLength`."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: keda.sh/v1alpha1\nkind: ScaledObject\nmetadata:\n  name: worker\nspec:\n  scaleTargetRef:\n    name: worker\n  minReplicaCount: 0\n  maxReplicaCount: 30\n  triggers:\n    - type: aws-sqs-queue\n      metadata:\n        queueURL: https://sqs.eu-west-1.amazonaws.com/123456789/jobs\n        queueLength: \"20\"\n        awsRegion: eu-west-1"
        },
        {
          "type": "paragraph",
          "content": "Coda vuota, zero pod. Arrivano messaggi, e KEDA punta a circa 20 messaggi per replica, fino a 30 repliche. Quando la coda si calma aspetta 120 secondi, poi torna a zero."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Più pod, zero nodi: non serve a niente"
        },
        {
          "type": "paragraph",
          "content": "Scalare le repliche non serve se i nodi non hanno posto per i pod. Tutti e due gli autoscaler di nodi reagiscono ai pod bloccati in `Pending`. Il Cluster Autoscaler scala node group fissi, definiti prima, ognuno con il suo tipo di istanza. Karpenter invece provisiona nodi della taglia giusta just-in-time: sceglie il tipo di istanza in base ai pod in attesa, e consolida quelli mezzi vuoti."
        },
        {
          "type": "paragraph",
          "content": "In tutti e due i casi i nodi vanno e vengono, quindi proteggi la disponibilità. Un PodDisruptionBudget stabilisce quante repliche devono restare su mentre i nodi vengono svuotati. Le topology spread constraint spalmano le repliche tra nodi e zone, così un nodo che se ne va non si porta dietro un servizio intero."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Niente thrash, niente cold start"
        },
        {
          "type": "paragraph",
          "content": "Il flapping, cioè scale up e down a raffica, brucia soldi e peggiora la latenza. Ogni pod nuovo paga un cold start: scaricare l'immagine, avviare il processo, scaldare le cache. Qualche abitudine lo tiene a bada:"
        },
        {
          "type": "list",
          "items": [
            "Usa le stabilization window dell'HPA e le policy di scale-down, come nell'esempio sopra.",
            "Tieni le readiness probe oneste, così un pod nuovo non riceve traffico prima di essere caldo.",
            "Pre-provisiona un piccolo buffer per i workload a raffica, così la prima ondata del picco atterra su capacità che c'è già."
          ]
        },
        {
          "type": "paragraph",
          "content": "Misura quanto ti costa un cold start prima di ottimizzarlo. Anche i warm pool messi su troppo presto sono spreco. E se il tuo traffico è piatto, un numero fisso di repliche è una strategia di autoscaling rispettabilissima. Punto."
        }
      ]
    },
  },
  'llmops-serving-llms-in-production': {
    en: {
      "title": "LLMOps: serving LLMs on a budget",
      "description": "Model serving patterns, GPU utilization, caching, and evals for LLM workloads: lessons from running inference where every millisecond and every token has a price.",
      "content": [
        {
          "type": "paragraph",
          "content": "The demo worked beautifully in a notebook. Then the feature launched. Now a GPU instance bills by the hour all night while nobody sends a single prompt, latency doubles every time a few users paste in long documents, and a small prompt tweak quietly made the answers worse. Nobody noticed until support tickets arrived."
        },
        {
          "type": "paragraph",
          "content": "Getting an LLM to answer in a notebook is easy. Serving it to thousands of users with predictable latency and a bill your CFO tolerates is the hard part. LLMOps is DevOps with two new variables: GPUs are scarce and expensive, and quality is non-deterministic. Here are the patterns that kept both under control in production, in five parts: whether to host at all, throughput on the GPU, semantic caching, evals and guardrails, and per-token observability."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Self-host or call an API? Let the spreadsheet decide"
        },
        {
          "type": "paragraph",
          "content": "With a managed API (Bedrock, OpenAI, Anthropic) you pay per token and someone else runs the GPUs. With self-hosting you rent the GPUs and pay for them whether they are busy or idle. APIs win on time-to-market and elasticity; self-hosting wins on unit cost at high, steady volume and on data residency."
        },
        {
          "type": "paragraph",
          "content": "The break-even is usually higher than teams expect. Unless you are saturating a GPU most of the day, an API is cheaper. Decide with a spreadsheet, not vibes."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Throughput: continuous batching and the KV cache"
        },
        {
          "type": "paragraph",
          "content": "If you self-host, throughput is everything, because the GPU costs the same whether it serves one request or many. Two techniques matter most."
        },
        {
          "type": "paragraph",
          "content": "Continuous batching. A GPU is most efficient when it processes many requests together in a batch. With static batching, the batch starts together and finishes together, so short answers wait for the longest one. Continuous batching works like a ski lift instead of a bus: as soon as one request finishes, a new one takes its seat, and the GPU never waits for the slowest passenger. vLLM and TGI both do this."
        },
        {
          "type": "paragraph",
          "content": "The KV cache. A model generates text one token at a time, and each new token looks back at all the tokens before it. Rather than recomputing that history every step, the server keeps intermediate results (the keys and values of the attention layers) in GPU memory. That memory grows with context length and with the number of concurrent requests, which is why long contexts eat VRAM fast. Prefix caching goes one step further: when many requests start with the same text, such as a long system prompt, their cached prefix is computed once and shared."
        },
        {
          "type": "paragraph",
          "content": "Together they turn a GPU that served 3 requests/second into one that serves 30. Here is a vLLM server with those knobs set; look at the last three flags."
        },
        {
          "type": "code",
          "language": "bash",
          "code": "python -m vllm.entrypoints.openai.api_server \\\n  --model mistralai/Mistral-7B-Instruct-v0.3 \\\n  --dtype bfloat16 \\\n  --max-num-seqs 256 \\\n  --gpu-memory-utilization 0.90 \\\n  --enable-prefix-caching"
        },
        {
          "type": "paragraph",
          "content": "This starts an OpenAI-compatible API. `--max-num-seqs` caps how many sequences share a batch, `--gpu-memory-utilization` sets the share of VRAM vLLM may claim for weights and KV cache, and `--enable-prefix-caching` turns on prefix reuse. Tune the first two to your context length."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Semantic caching cuts cost more than any GPU"
        },
        {
          "type": "paragraph",
          "content": "A large share of production traffic is near-duplicate: the same question asked in slightly different words. A normal cache only matches identical text, so it misses almost all of these. A semantic cache matches by meaning. It turns the prompt into an embedding (a vector where similar meanings sit close together), looks up similar prior prompts, and returns the cached completion when the similarity is above a threshold."
        },
        {
          "type": "paragraph",
          "content": "This routinely deflects 30–50% of calls. That makes it the single highest-ROI optimization in most LLM systems, and it improves p95 latency too, because the fastest inference is the one that never runs."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "A prompt change is a deploy: evals and guardrails"
        },
        {
          "type": "paragraph",
          "content": "Normal code gives the same output for the same input, so a unit test can check it. An LLM does not, so you need a different test harness. Keep a golden dataset of representative inputs with expected results, and run automated evals on every prompt or model change in CI. Exact-match works for structured answers, LLM-as-judge (a second model grading the first) for free text, and task-specific metrics for everything in between."
        },
        {
          "type": "paragraph",
          "content": "Add guardrails on input and output for PII, prompt injection and toxicity. Treat prompts and model versions as versioned artifacts, reviewed and rolled out like code. A prompt change is a deploy, even when it is only one adjective."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Observability down to the token"
        },
        {
          "type": "paragraph",
          "content": "With LLMs the cost lives in tokens, so that is where to measure. Log tokens-in, tokens-out, model, latency and cache-hit for every request, and chart cost per request by feature. Trace multi-step chains so you can see which tool call or retrieval step is slow. Without token-level observability you cannot answer \"why did this month cost double?\", and with LLMs that question always comes eventually."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Trade-offs to keep in mind"
        },
        {
          "type": "list",
          "items": [
            "A semantic cache can return a good answer to the wrong question if the threshold is too loose. It must also never share answers built from one user's private data with another user.",
            "Self-hosting brings GPU drivers, capacity planning and on-call along with the lower unit cost.",
            "LLM-as-judge is a model too, with its own biases. Check its grades against human review now and then."
          ]
        }
      ]
    },
    it: {
      "title": "LLMOps: la GPU brucia soldi",
      "description": "Nel notebook la demo vola. In produzione la GPU fattura tutta la notte a vuoto e un aggettivo nel prompt peggiora le risposte in silenzio. Self-host o API, continuous batching, KV cache, cache semantica, eval in CI e costi tracciati token per token.",
      "content": [
        {
          "type": "paragraph",
          "content": "Nel notebook la demo funzionava benissimo. Poi la feature è andata in produzione. Adesso un'istanza GPU fattura a ore tutta la notte mentre nessuno manda mezzo prompt. La latenza raddoppia ogni volta che un utente incolla un documento lungo. E una piccola modifica al prompt ha peggiorato le risposte in silenzio. Nessuno se n'è accorto finché non sono arrivati i ticket al supporto."
        },
        {
          "type": "paragraph",
          "content": "Far rispondere un LLM in un notebook è facile. Servirlo a migliaia di utenti con latenza prevedibile e una bolletta che il tuo CFO regge: quella è la parte difficile. L'LLMOps è DevOps con due variabili nuove. Le GPU sono poche e care. La qualità non è deterministica. Qui trovi i pattern che le hanno tenute tutte e due sotto controllo in produzione, in cinque parti: ospitare il modello o no, il throughput sulla GPU, la cache semantica, eval e guardrail, l'osservabilità per token."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Self-host o API? Decide il foglio di calcolo"
        },
        {
          "type": "paragraph",
          "content": "Con un'API gestita (Bedrock, OpenAI, Anthropic) paghi a token e le GPU le gestisce qualcun altro. Col self-hosting le GPU le affitti tu, e le paghi che lavorino o no. Le API vincono su time-to-market ed elasticità. Il self-hosting vince sul costo unitario a volumi alti e costanti, e sulla data residency."
        },
        {
          "type": "paragraph",
          "content": "Il punto di pareggio di solito è più alto di quanto ti aspetti. Se non saturi una GPU per gran parte della giornata, l'API costa meno. Decidi col foglio di calcolo, non a sensazione."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Throughput: continuous batching e KV cache"
        },
        {
          "type": "paragraph",
          "content": "Se fai self-hosting, il throughput è tutto: la GPU costa uguale che serva una richiesta o cento. Contano soprattutto due tecniche."
        },
        {
          "type": "paragraph",
          "content": "Continuous batching. Una GPU rende di più quando macina tante richieste insieme in un batch. Col batching statico il batch parte insieme e finisce insieme, quindi le risposte brevi aspettano la più lunga. Il continuous batching funziona come una seggiovia, non come un autobus: appena una richiesta finisce, una nuova prende il suo posto. La GPU non aspetta mai il passeggero più lento. vLLM e TGI lo fanno tutti e due."
        },
        {
          "type": "paragraph",
          "content": "La KV cache. Un modello genera testo un token alla volta, e ogni nuovo token guarda tutti quelli prima. Invece di ricalcolare quella storia a ogni passo, il server tiene in memoria GPU i risultati intermedi (le key e le value dei layer di attention). Quella memoria cresce con la lunghezza del contesto e col numero di richieste concorrenti. Ecco perché i contesti lunghi si mangiano la VRAM. Il prefix caching fa un passo in più: se tante richieste partono con lo stesso testo, tipo un lungo system prompt, il prefisso lo calcoli una volta e lo condividi."
        },
        {
          "type": "paragraph",
          "content": "Insieme trasformano una GPU che serviva 3 richieste al secondo in una che ne serve 30. Ecco un server vLLM con quelle manopole già girate. Guarda gli ultimi tre flag."
        },
        {
          "type": "code",
          "language": "bash",
          "code": "python -m vllm.entrypoints.openai.api_server \\\n  --model mistralai/Mistral-7B-Instruct-v0.3 \\\n  --dtype bfloat16 \\\n  --max-num-seqs 256 \\\n  --gpu-memory-utilization 0.90 \\\n  --enable-prefix-caching"
        },
        {
          "type": "paragraph",
          "content": "Questo tira su un'API compatibile con OpenAI. `--max-num-seqs` limita quante sequenze stanno nello stesso batch, `--gpu-memory-utilization` fissa la fetta di VRAM che vLLM può prendersi per pesi e KV cache, e `--enable-prefix-caching` accende il riuso dei prefissi. I primi due li tari sulla lunghezza dei tuoi contesti."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "La cache semantica taglia più di qualsiasi GPU"
        },
        {
          "type": "paragraph",
          "content": "Buona parte del traffico in produzione è quasi-duplicato: la stessa domanda, con parole un po' diverse. Una cache normale becca solo testo identico, quindi se le perde quasi tutte. Una cache semantica confronta il significato. Trasforma il prompt in un embedding (un vettore in cui significati simili stanno vicini), cerca prompt precedenti simili e ti restituisce il completamento in cache quando la similarità supera una soglia."
        },
        {
          "type": "paragraph",
          "content": "Così devii regolarmente il 30–50% delle chiamate. Nella maggior parte dei sistemi LLM è l'ottimizzazione col ROI più alto, e ti migliora pure la latenza p95. Perché l'inferenza più veloce è quella che non parte."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Un cambio di prompt è un deploy: eval e guardrail"
        },
        {
          "type": "paragraph",
          "content": "Il codice normale dà lo stesso output per lo stesso input, e un unit test lo verifica. Un LLM no. Ti serve un test harness diverso. Tieni un golden dataset di input rappresentativi con i risultati attesi, e lancia eval automatiche in CI a ogni cambio di prompt o di modello. Exact-match per le risposte strutturate, LLM-as-judge (un secondo modello che dà il voto al primo) per il testo libero, metriche su misura per tutto quello che sta in mezzo."
        },
        {
          "type": "paragraph",
          "content": "Metti guardrail su input e output per PII, prompt injection e tossicità. Tratta prompt e versioni del modello come artefatti: versionati, revisionati e rilasciati come il codice. Un cambio di prompt è un deploy. Anche quando cambi solo un aggettivo."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Osservabilità fino al token"
        },
        {
          "type": "paragraph",
          "content": "Con gli LLM il costo sta nei token, quindi misuri lì. Logga token-in, token-out, modello, latenza e cache-hit per ogni richiesta, e traccia il costo per richiesta per feature. Traccia le catene multi-step per vedere quale tool call o passo di retrieval si siede. Senza osservabilità a livello di token non rispondi a \"perché questo mese è costato il doppio?\". E con gli LLM quella domanda prima o poi arriva. Sempre."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Compromessi da tenere a mente"
        },
        {
          "type": "list",
          "items": [
            "Con una soglia troppo larga, la cache semantica ti dà una buona risposta alla domanda sbagliata. E non deve mai passare a un utente risposte costruite sui dati privati di un altro.",
            "Il self-hosting ti porta il costo unitario più basso. E insieme driver GPU, capacity planning e reperibilità.",
            "Anche l'LLM-as-judge è un modello, con i suoi bias. Ogni tanto confronta i suoi voti con una revisione umana."
          ]
        }
      ]
    },
  },
  'slo-driven-observability': {
    en: {
      "title": "SLOs and error budgets beat dashboards",
      "description": "Trading 200 dashboards nobody reads for a handful of SLOs that drive decisions, with Prometheus recording rules and multi-window burn-rate alerts.",
      "content": [
        {
          "type": "paragraph",
          "content": "It is 3am and the pager goes off: CPU is high on a node. You open your laptop, check the graphs, and find that users are fine. Nothing to do, go back to sleep. A week earlier, checkout returned errors for a long stretch of the afternoon, CPU stayed calm, and no alert fired at all. Customers noticed before you did."
        },
        {
          "type": "paragraph",
          "content": "Most \"observability\" is a wall of graphs that light up red at 3am and tell you nothing actionable. SLOs flip the model: define the reliability your users actually need, measure how much of that budget you are spending, and alert only when the budget is burning fast enough to matter. Fewer pages, better sleep, clearer decisions."
        },
        {
          "type": "paragraph",
          "content": "The article builds this in four steps: choosing what to measure (SLIs, SLOs and error budgets), computing it cheaply in Prometheus, alerting on burn rate, and agreeing what happens when the budget runs out."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "SLIs measure what users feel, SLOs set the target"
        },
        {
          "type": "paragraph",
          "content": "Three acronyms that sound alike. An SLI (service level indicator) is a measurement. An SLO (service level objective) is the target for that measurement over a time window. An SLA (service level agreement) is a contract with a customer, with penalties if you miss it. This article is about the first two; the SLA is for lawyers."
        },
        {
          "type": "paragraph",
          "content": "A good SLI is a ratio of good events to total events, measured where the user experiences it. Availability = successful requests / total requests. Latency = requests faster than a threshold / total. Avoid infrastructure proxies (CPU, memory) as SLIs: they are causes, not symptoms. High CPU might hurt users or might not. A failed checkout always does."
        },
        {
          "type": "paragraph",
          "content": "The error budget is what the SLO leaves you. With a 99.9% availability SLO, one request in a thousand is allowed to fail. Think of it as an allowance: you can spend it on risky deploys, experiments and the occasional bad day, but when it is gone, it is gone. Start with two or three SLOs per critical service, not twenty."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Recording rules: compute the ratio once"
        },
        {
          "type": "paragraph",
          "content": "A recording rule tells Prometheus to evaluate a query on a schedule and store the result as a new time series. The alternative is to put the full query in every dashboard panel and every alert, which repeats the same expensive work and lets small differences creep in between copies. Recording rules give dashboards and alerts the same source of truth and keep them cheap to query at scale."
        },
        {
          "type": "paragraph",
          "content": "Read the rules below from top to bottom: each one builds on the previous."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "groups:\n  - name: slo-api-availability\n    rules:\n      - record: job:http_requests:rate5m\n        expr: sum(rate(http_requests_total{job=\"api\"}[5m]))\n      - record: job:http_errors:rate5m\n        expr: sum(rate(http_requests_total{job=\"api\",code=~\"5..\"}[5m]))\n      - record: job:slo_error_ratio:ratio5m\n        expr: job:http_errors:rate5m / job:http_requests:rate5m\n      - record: job:slo_error_ratio:ratio1h\n        expr: |\n          sum(rate(http_requests_total{job=\"api\",code=~\"5..\"}[1h]))\n            /\n          sum(rate(http_requests_total{job=\"api\"}[1h]))"
        },
        {
          "type": "paragraph",
          "content": "The first rule counts all requests per second over five minutes, the second counts only 5xx responses, and the third divides one by the other. The result, `job:slo_error_ratio:ratio5m`, is the fraction of requests failing right now. The fourth computes the same ratio over one hour, which the alert below needs."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Burn rate: how fast you are spending the budget"
        },
        {
          "type": "paragraph",
          "content": "The naive alert is \"page when the error ratio goes above the SLO threshold\". It is too twitchy: a single bad minute pages you, even though it barely touched the budget. It is also too slow for the opposite reason, because a steady leak just above the line can drain the budget without ever looking dramatic."
        },
        {
          "type": "paragraph",
          "content": "Burn rate fixes this. It is the speed at which you spend the budget, compared with the speed that would use it up exactly at the end of the SLO window. A burn rate of one lands right on the target. For a 99.9% SLO, a 14.4x burn rate exhausts 2% of the monthly budget in one hour, which is worth waking someone for."
        },
        {
          "type": "paragraph",
          "content": "The Google SRE pattern adds a second window: page only when a short window and a long window both show fast burn. The long window proves the problem is big enough to matter; the short one proves it is still happening. In the alert below, look at the `and` between the two expressions."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "- alert: ErrorBudgetBurnFast\n  expr: |\n    job:slo_error_ratio:ratio5m > (14.4 * 0.001)\n    and\n    job:slo_error_ratio:ratio1h > (14.4 * 0.001)\n  for: 2m\n  labels:\n    severity: page\n  annotations:\n    summary: \"API burning the 99.9% error budget fast (5m and 1h)\""
        },
        {
          "type": "paragraph",
          "content": "The alert pages only if the error ratio is above 14.4 times the allowed 0.001 over both five minutes and one hour, for at least two minutes. Brief blips stay quiet; real incidents page quickly."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "The error budget policy gives the numbers teeth"
        },
        {
          "type": "paragraph",
          "content": "The SLO is only useful if the budget has consequences. Agree in advance, in writing: while budget remains, ship features fast; when it is exhausted, freeze risky changes and prioritize reliability work. Agreeing before the incident matters, because nobody negotiates calmly in the middle of one."
        },
        {
          "type": "paragraph",
          "content": "That written policy turns observability from a dashboard into an engineering decision framework."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Where SLOs need care"
        },
        {
          "type": "list",
          "items": [
            "Low-traffic services make ratios jumpy: with few requests, one failure moves the number a lot. Use longer windows or synthetic traffic.",
            "A perfect target, with zero failures allowed, leaves no budget, so every deploy becomes a risk to the SLO. Pick the reliability users need, not the most you can imagine.",
            "SLOs tell you that users hurt, not why. Keep detailed metrics, logs and traces for debugging; just stop paging on them."
          ]
        }
      ]
    },
    it: {
      "title": "Error budget: la dashboard non ti salva",
      "description": "200 dashboard che nessuno legge, un pager che suona per la CPU e tace sul checkout rotto. Butta via il muro di grafici: pochi SLO, recording rule Prometheus e alert multi-window sul burn rate.",
      "content": [
        {
          "type": "paragraph",
          "content": "Sono le 3 di notte e suona il pager: CPU alta su un nodo. Apri il portatile, guardi i grafici, scopri che gli utenti stanno benissimo. Niente da fare, torni a dormire. Una settimana prima il checkout ha sputato errori per mezzo pomeriggio, la CPU è rimasta tranquilla e non è scattato nessun alert. I clienti se ne sono accorti prima di te. Complimenti."
        },
        {
          "type": "paragraph",
          "content": "Gran parte della cosiddetta \"osservabilità\" è un muro di grafici che diventano rossi alle 3 di notte senza dirti niente su cui agire. Gli SLO ribaltano il modello: definisci l'affidabilità che serve davvero agli utenti, misuri quanto budget stai consumando, e mandi un alert solo quando il budget brucia abbastanza in fretta da contare. Meno page. Più sonno. Decisioni più chiare."
        },
        {
          "type": "paragraph",
          "content": "Il giro è in quattro passi: scegli cosa misurare (SLI, SLO ed error budget), calcolalo spendendo poco in Prometheus, manda alert sul burn rate, e metti per iscritto cosa succede quando il budget finisce."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "SLI: cosa sente l'utente. SLO: l'obiettivo"
        },
        {
          "type": "paragraph",
          "content": "Tre sigle che si somigliano. Uno SLI (service level indicator) è una misura. Uno SLO (service level objective) è l'obiettivo per quella misura su una finestra di tempo. Uno SLA (service level agreement) è un contratto con un cliente, con penali se lo manchi. Qui si parla dei primi due. Lo SLA è roba da avvocati."
        },
        {
          "type": "paragraph",
          "content": "Un buon SLI è un rapporto tra eventi buoni ed eventi totali, misurato dove l'utente lo vive. Disponibilità = richieste riuscite / richieste totali. Latenza = richieste sotto una soglia / totali. Lascia perdere i proxy infrastrutturali (CPU, memoria) come SLI: sono cause, non sintomi. Una CPU alta può far male agli utenti. Oppure no. Un checkout fallito fa male sempre."
        },
        {
          "type": "paragraph",
          "content": "L'error budget è quello che lo SLO ti lascia. Con uno SLO di disponibilità al 99.9%, una richiesta su mille può fallire. Pensalo come una paghetta: la spendi in deploy rischiosi, esperimenti e qualche giornata storta. Ma quando è finita, è finita. Parti con due o tre SLO per servizio critico. Non venti."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Recording rule: il rapporto lo calcoli una volta"
        },
        {
          "type": "paragraph",
          "content": "Una recording rule dice a Prometheus di valutare una query a intervalli regolari e salvare il risultato come nuova serie temporale. L'alternativa è incollare la query intera in ogni pannello e in ogni alert: stesso lavoro costoso ripetuto ovunque, e piccole differenze che si infilano tra le copie. Con le recording rule dashboard e alert pescano dalla stessa fonte di verità, e interrogarli su larga scala costa poco."
        },
        {
          "type": "paragraph",
          "content": "Leggi le regole qui sotto dall'alto in basso: ognuna si appoggia alla precedente."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "groups:\n  - name: slo-api-availability\n    rules:\n      - record: job:http_requests:rate5m\n        expr: sum(rate(http_requests_total{job=\"api\"}[5m]))\n      - record: job:http_errors:rate5m\n        expr: sum(rate(http_requests_total{job=\"api\",code=~\"5..\"}[5m]))\n      - record: job:slo_error_ratio:ratio5m\n        expr: job:http_errors:rate5m / job:http_requests:rate5m\n      - record: job:slo_error_ratio:ratio1h\n        expr: |\n          sum(rate(http_requests_total{job=\"api\",code=~\"5..\"}[1h]))\n            /\n          sum(rate(http_requests_total{job=\"api\"}[1h]))"
        },
        {
          "type": "paragraph",
          "content": "La prima regola conta tutte le richieste al secondo su cinque minuti, la seconda solo le risposte 5xx, la terza divide l'una per l'altra. Il risultato, `job:slo_error_ratio:ratio5m`, è la frazione di richieste che sta fallendo adesso. La quarta calcola lo stesso rapporto su un'ora, e ti serve per l'alert più sotto."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Burn rate: quanto in fretta bruci il budget"
        },
        {
          "type": "paragraph",
          "content": "L'alert ingenuo è \"manda un page quando il rapporto di errore supera la soglia dello SLO\". Troppo nervoso: un solo minuto storto ti sveglia, anche se il budget l'ha appena sfiorato. E pure troppo lento, per il motivo opposto: una perdita costante appena sopra la linea ti prosciuga il budget senza mai sembrare un dramma."
        },
        {
          "type": "paragraph",
          "content": "Il burn rate risolve. È la velocità con cui spendi il budget, confrontata con quella che lo esaurirebbe esattamente a fine finestra dello SLO. Burn rate uno: arrivi giusto sull'obiettivo. Per uno SLO al 99.9%, un burn rate di 14.4x si mangia il 2% del budget mensile in un'ora. Per questo vale la pena svegliare qualcuno."
        },
        {
          "type": "paragraph",
          "content": "Il pattern SRE di Google aggiunge una seconda finestra: page solo quando sia una finestra corta sia una lunga mostrano un consumo veloce. La lunga dimostra che il problema è abbastanza grosso da contare. La corta dimostra che sta ancora succedendo. Nell'alert qui sotto, guarda l'`and` tra le due espressioni."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "- alert: ErrorBudgetBurnFast\n  expr: |\n    job:slo_error_ratio:ratio5m > (14.4 * 0.001)\n    and\n    job:slo_error_ratio:ratio1h > (14.4 * 0.001)\n  for: 2m\n  labels:\n    severity: page"
        },
        {
          "type": "paragraph",
          "content": "L'alert manda un page solo se il rapporto di errore supera 14.4 volte lo 0.001 consentito sia su cinque minuti sia su un'ora, per almeno due minuti. I blip brevi stanno zitti. Gli incidenti veri suonano subito."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "La policy dell'error budget: i numeri con i denti"
        },
        {
          "type": "paragraph",
          "content": "Lo SLO serve solo se il budget ha conseguenze. Mettiti d'accordo col team prima, per iscritto: finché c'è budget, le feature escono veloci; quando è finito, congeli le modifiche rischiose e la priorità va all'affidabilità. Prima dell'incidente, non durante. Nel mezzo di un incidente nessuno negozia con calma."
        },
        {
          "type": "paragraph",
          "content": "Quella policy scritta trasforma l'osservabilità da muro di dashboard a strumento per decidere."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Dove gli SLO ti fregano"
        },
        {
          "type": "list",
          "items": [
            "I servizi con poco traffico hanno rapporti ballerini: con poche richieste, un errore solo sposta parecchio il numero. Usa finestre più lunghe o traffico sintetico.",
            "Un obiettivo perfetto, zero errori ammessi, non lascia budget: ogni deploy diventa un rischio per lo SLO. Scegli l'affidabilità che serve agli utenti, non la massima immaginabile.",
            "Gli SLO ti dicono che gli utenti soffrono, non perché. Tieniti metriche dettagliate, log e trace per il debugging. Smetti solo di mandarci sopra i page."
          ]
        }
      ]
    },
  },
  'devsecops-supply-chain-security': {
    en: {
      "title": "Supply chain security: SBOM, Sigstore, admission",
      "description": "A practical DevSecOps pipeline: shift-left scanning, SBOM generation, artifact signing with Sigstore, and admission policies that actually block bad deploys.",
      "content": [
        {
          "type": "paragraph",
          "content": "Most of the code you ship, you did not write. It came from open-source libraries, which came from other libraries, several layers deep. When Log4Shell hit, many teams spent their weekend trying to answer one question: do we use Log4j anywhere? Nobody had a list. With SolarWinds, the problem was worse: the vendor's own build system was compromised, so the malicious update came out signed and looked legitimate."
        },
        {
          "type": "paragraph",
          "content": "After those two, \"trust your dependencies\" stopped being a strategy. Modern DevSecOps assumes any artifact could be compromised and builds verifiable trust into the pipeline. The plan has four steps:"
        },
        {
          "type": "list",
          "items": [
            "Scan early, and let the scan block a merge.",
            "Know what is inside each artifact (SBOM).",
            "Prove where it came from (signing and provenance).",
            "Refuse to run anything that cannot prove both (admission control)."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Shift left, but keep a gate that can say no"
        },
        {
          "type": "paragraph",
          "content": "\"Shift left\" means finding problems earlier in the pipeline, at pull request time instead of in production. Two kinds of scanner do the work. SAST (static application security testing; Semgrep, CodeQL) reads your own code for dangerous patterns. Dependency scanning (Grype, Trivy, Dependabot) checks the libraries you pull in against databases of known vulnerabilities."
        },
        {
          "type": "paragraph",
          "content": "Run both on every pull request, and fail the build on high and critical findings that have a fix. The \"that have a fix\" part matters: blocking a merge for a vulnerability nobody can patch yet only teaches people to hate the scanner. Shift-left without a blocking gate is just noise, though. Developers learn to ignore warnings that never stop a merge, the same way everyone ignores the car alarm in the street."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "An SBOM is the ingredient list of your artifact"
        },
        {
          "type": "paragraph",
          "content": "A Software Bill of Materials (SBOM) lists every component in an artifact: each package, its version, and where it came from. Think of the ingredient label on food. You do not read it every day, but when a batch of something is recalled, it tells you in seconds whether it is in your fridge."
        },
        {
          "type": "paragraph",
          "content": "Generate the SBOM at build time, when you know exactly what went in. Attach it to the image as an attestation, which is a signed statement about an artifact, and store it. Then \"are we affected by CVE-XXXX?\" becomes a query that takes minutes instead of days. An SBOM says what is inside. Provenance is its neighbour: a record of how and where the artifact was built. The SLSA framework describes increasing levels of trust in that build record."
        },
        {
          "type": "paragraph",
          "content": "The commands below do the whole chain for one image. Follow the image tag through each line."
        },
        {
          "type": "code",
          "language": "bash",
          "code": "# Generate an SBOM and scan it\nsyft packages ghcr.io/acme/api:1.4.2 -o spdx-json > sbom.spdx.json\ngrype sbom:sbom.spdx.json --fail-on high\n\n# Sign the image and attach the SBOM as an attestation (keyless)\ncosign sign ghcr.io/acme/api:1.4.2\ncosign attest --predicate sbom.spdx.json --type spdxjson ghcr.io/acme/api:1.4.2"
        },
        {
          "type": "paragraph",
          "content": "Syft lists the packages in the image as SPDX JSON (a standard SBOM format), Grype scans that list and fails on anything high or worse, and cosign signs the image and attaches the SBOM to it as an attestation."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Keyless signing: no private key to leak"
        },
        {
          "type": "paragraph",
          "content": "The naive way to sign images is a long-lived key pair, with the private key stored as a CI secret. It works until the key leaks, and then an attacker can sign anything as you, for as long as the key lives. Rotating it is painful, so it rarely happens."
        },
        {
          "type": "paragraph",
          "content": "Sigstore and its CLI, cosign, offer keyless signing instead. The CI job proves its identity (for example \"this GitHub Actions workflow in this repository\") through OIDC, receives a short-lived certificate for that identity, signs, and records the signature in a public transparency log. The certificate expires within minutes, so there is no long-lived key to leak. The signature binds the artifact to the identity that built it."
        },
        {
          "type": "paragraph",
          "content": "A signature is only useful if something checks it. That is where admission control comes in."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Admission control: the bouncer at the cluster door"
        },
        {
          "type": "paragraph",
          "content": "An admission webhook is a hook in the Kubernetes API server: before an object such as a Pod is stored, the API server asks an external policy engine whether to accept it. Kyverno and OPA/Gatekeeper are the two common engines. Kyverno policies are written as Kubernetes YAML; Gatekeeper uses Rego, a dedicated policy language. Either can verify signatures and reject unsigned or non-compliant images before they ever run."
        },
        {
          "type": "paragraph",
          "content": "In the Kyverno policy below, look at three fields: `Enforce`, the image pattern, and the `keyless` issuer and subject."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: kyverno.io/v1\nkind: ClusterPolicy\nmetadata:\n  name: require-signed-images\nspec:\n  validationFailureAction: Enforce\n  rules:\n    - name: verify-signature\n      match:\n        any:\n          - resources:\n              kinds: [\"Pod\"]\n      verifyImages:\n        - imageReferences: [\"ghcr.io/acme/*\"]\n          attestors:\n            - entries:\n                - keyless:\n                    issuer: \"https://token.actions.githubusercontent.com\"\n                    subject: \"https://github.com/acme/*\""
        },
        {
          "type": "paragraph",
          "content": "Any Pod using an image from `ghcr.io/acme/` must carry a keyless signature issued through GitHub Actions for a repository under `github.com/acme/`. Anything else is rejected, not just logged. This is the gate that makes the rest of the chain enforceable rather than advisory."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "What this chain does not protect you from"
        },
        {
          "type": "list",
          "items": [
            "A valid signature proves who built an artifact, not that the code is safe. A compromised dependency built by your own CI gets signed too.",
            "Gates block emergencies as well. Define a break-glass path for urgent fixes, and audit every use of it.",
            "The admission webhook sits on the deploy path. Decide in advance what happens if the policy engine is down: fail closed and block deploys, or fail open and skip the checks.",
            "Scanners produce findings with no fix and false positives. Without an owner for triage, the gate erodes into a list of exceptions."
          ]
        },
        {
          "type": "paragraph",
          "content": "Each step on its own is easy to get around. Together they answer the questions that matter during the next Log4Shell: what are we running, who built it, and could anything else have got in?"
        }
      ]
    },
    it: {
      "title": "Supply chain: firma tutto, fidati di niente",
      "description": "Log4Shell e un weekend a chiedersi \"usiamo Log4j?\". SolarWinds e un update malevolo firmato. Scanning shift-left con gate bloccante, SBOM con Syft, firma keyless con Sigstore e Kyverno che alla porta del cluster dice di no.",
      "content": [
        {
          "type": "paragraph",
          "content": "Gran parte del codice che rilasci non l'hai scritto tu. Arriva da librerie open source, che arrivano da altre librerie, giù per diversi livelli. Quando è uscito Log4Shell, un sacco di team ha passato il weekend su una sola domanda: usiamo Log4j da qualche parte? Nessuno aveva una lista. Con SolarWinds è andata peggio: era compromesso il sistema di build del fornitore stesso. L'aggiornamento malevolo usciva firmato e sembrava legittimo."
        },
        {
          "type": "paragraph",
          "content": "Dopo quei due casi, \"fidati delle tue dipendenze\" non è più una strategia. Il DevSecOps moderno parte da un'idea: qualsiasi artefatto può essere compromesso. Quindi la fiducia la costruisci nella pipeline, e la rendi verificabile. Il piano è in quattro passi:"
        },
        {
          "type": "list",
          "items": [
            "Scansiona presto, e lascia che lo scan blocchi il merge.",
            "Sappi cosa c'è dentro ogni artefatto (SBOM).",
            "Dimostra da dove viene (firma e provenance).",
            "Non eseguire niente che non sappia dimostrare tutte e due le cose (admission control)."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Shift left, con un cancello che sa dire di no"
        },
        {
          "type": "paragraph",
          "content": "\"Shift left\" vuol dire trovare i problemi prima nella pipeline: alla pull request, non in produzione. Il lavoro lo fanno due tipi di scanner. Il SAST (static application security testing; Semgrep, CodeQL) legge il tuo codice a caccia di pattern pericolosi. Lo scanning delle dipendenze (Grype, Trivy, Dependabot) confronta le librerie che importi con i database di vulnerabilità note."
        },
        {
          "type": "paragraph",
          "content": "Falli girare tutti e due su ogni pull request, e fai fallire la build sui finding high e critical che hanno un fix. Quel \"che hanno un fix\" conta: bloccare un merge per una vulnerabilità che nessuno può ancora correggere insegna solo a odiare lo scanner. Ma lo shift-left senza gate bloccante è rumore. Punto. Gli sviluppatori imparano a ignorare i warning che non fermano mai un merge, come tutti ignorano l'antifurto che suona in strada."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "SBOM: la lista degli ingredienti"
        },
        {
          "type": "paragraph",
          "content": "Un Software Bill of Materials (SBOM) elenca ogni componente di un artefatto: ogni pacchetto, la sua versione, da dove arriva. Pensa all'etichetta degli ingredienti sul cibo. Non la leggi tutti i giorni. Ma quando richiamano un lotto, ti dice in pochi secondi se ce l'hai in frigo."
        },
        {
          "type": "paragraph",
          "content": "Genera lo SBOM in fase di build, quando sai esattamente cosa ci è entrato. Allegalo all'immagine come attestazione (una dichiarazione firmata su un artefatto) e archivialo. A quel punto \"siamo colpiti dalla CVE-XXXX?\" è una query da minuti, non da giorni. Lo SBOM dice cosa c'è dentro. La provenance è la sua vicina di casa: la registrazione di come e dove l'artefatto è stato costruito. Il framework SLSA descrive livelli crescenti di fiducia in quella registrazione."
        },
        {
          "type": "paragraph",
          "content": "I comandi qui sotto fanno tutta la catena per un'immagine. Segui il tag dell'immagine riga per riga."
        },
        {
          "type": "code",
          "language": "bash",
          "code": "# Genera un SBOM e scansionalo\nsyft packages ghcr.io/acme/api:1.4.2 -o spdx-json > sbom.spdx.json\ngrype sbom:sbom.spdx.json --fail-on high\n\n# Firma l'immagine e allega l'SBOM come attestazione (keyless)\ncosign sign ghcr.io/acme/api:1.4.2\ncosign attest --predicate sbom.spdx.json --type spdxjson ghcr.io/acme/api:1.4.2"
        },
        {
          "type": "paragraph",
          "content": "Syft elenca i pacchetti dell'immagine in SPDX JSON (un formato SBOM standard). Grype scansiona quella lista e fallisce su tutto ciò che è high o peggio. cosign firma l'immagine e ci attacca lo SBOM come attestazione."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Firma keyless: nessuna chiave privata da perdere"
        },
        {
          "type": "paragraph",
          "content": "Il modo ingenuo di firmare le immagini è una coppia di chiavi a lunga vita, con la privata salvata come secret della CI. Funziona finché la chiave non trapela. Da lì un attaccante firma qualsiasi cosa a nome tuo, per tutta la vita della chiave. Ruotarla è un dolore, quindi non lo fa nessuno."
        },
        {
          "type": "paragraph",
          "content": "Sigstore e la sua CLI, cosign, ti danno invece la firma keyless. Il job di CI dimostra chi è (tipo \"questo workflow GitHub Actions in questo repository\") via OIDC, riceve un certificato a vita breve per quell'identità, firma e registra la firma in un transparency log pubblico. Il certificato scade nel giro di minuti. Nessuna chiave a lunga vita, niente da far trapelare. La firma lega l'artefatto all'identità che l'ha costruito."
        },
        {
          "type": "paragraph",
          "content": "Una firma serve solo se qualcosa la verifica. Ed è qui che entra l'admission control."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Admission control: il buttafuori del cluster"
        },
        {
          "type": "paragraph",
          "content": "Un admission webhook è un aggancio nell'API server di Kubernetes: prima di salvare un oggetto come un Pod, l'API server chiede a un motore di policy esterno se farlo entrare. Kyverno e OPA/Gatekeeper sono i due più diffusi. Le policy di Kyverno le scrivi in YAML Kubernetes; Gatekeeper usa Rego, un linguaggio fatto apposta per le policy. Tutti e due verificano le firme e rimbalzano le immagini non firmate o non conformi prima che girino."
        },
        {
          "type": "paragraph",
          "content": "Nella policy Kyverno qui sotto guarda tre campi: `Enforce`, il pattern delle immagini, e issuer e subject di `keyless`."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: kyverno.io/v1\nkind: ClusterPolicy\nmetadata:\n  name: require-signed-images\nspec:\n  validationFailureAction: Enforce\n  rules:\n    - name: verify-signature\n      match:\n        any:\n          - resources:\n              kinds: [\"Pod\"]\n      verifyImages:\n        - imageReferences: [\"ghcr.io/acme/*\"]\n          attestors:\n            - entries:\n                - keyless:\n                    issuer: \"https://token.actions.githubusercontent.com\"\n                    subject: \"https://github.com/acme/*\""
        },
        {
          "type": "paragraph",
          "content": "Ogni Pod che usa un'immagine da `ghcr.io/acme/` deve avere una firma keyless emessa tramite GitHub Actions per un repository sotto `github.com/acme/`. Tutto il resto viene rifiutato. Non loggato: rifiutato. È il cancello che rende vincolante il resto della catena, invece che un consiglio."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Da cosa questa catena non ti salva"
        },
        {
          "type": "list",
          "items": [
            "Una firma valida dimostra chi ha costruito un artefatto, non che il codice sia sicuro. Anche una dipendenza compromessa buildata dalla tua CI esce firmata.",
            "I gate bloccano anche le emergenze. Definisci una procedura break-glass per i fix urgenti, e verifica ogni volta che qualcuno la usa.",
            "L'admission webhook sta sul percorso di deploy. Decidi prima cosa succede se il motore di policy è giù: fail closed e deploy bloccati, o fail open e controlli saltati.",
            "Gli scanner sfornano finding senza fix e falsi positivi. Senza qualcuno che fa il triage, il gate si sbriciola in una lista di eccezioni."
          ]
        },
        {
          "type": "paragraph",
          "content": "Ogni passo da solo lo aggiri facile. Insieme rispondono alle domande che contano al prossimo Log4Shell: cosa stiamo eseguendo, chi l'ha costruito, e poteva entrare altro?"
        }
      ]
    },
  },
  'platform-engineering-gitops-argocd': {
    en: {
      "title": "GitOps with Argo CD: golden paths",
      "description": "Building an internal developer platform where self-service templates and Argo CD reconciliation replace ticket-driven ops, without turning developers into cluster admins.",
      "content": [
        {
          "type": "paragraph",
          "content": "A developer needs a new service in staging. They open a ticket. The ops team is already buried in other tickets, so the new service waits. Meanwhile someone fixed production last night with a quick `kubectl edit`, and now nobody is sure whether the cluster still matches what is in the repository."
        },
        {
          "type": "paragraph",
          "content": "Platform engineering is DevOps that scales past a handful of teams. Instead of every squad reinventing pipelines and YAML, a small platform team ships a \"paved road\": self-service, opinionated, and safe by default. GitOps is the delivery mechanism that makes that road auditable and self-healing."
        },
        {
          "type": "paragraph",
          "content": "Here is the route: why tickets fail, what GitOps and Argo CD actually do, how ApplicationSets turn onboarding into a folder, why the golden path must have exits, and how progressive delivery keeps the speed safe."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "From a ticket queue to a paved road"
        },
        {
          "type": "paragraph",
          "content": "The failure mode of central ops is the ticket queue: developers wait, ops context-switches, nobody is happy. Adding more ops people only makes the queue a bit shorter."
        },
        {
          "type": "paragraph",
          "content": "The platform inverts the flow. Developers describe intent in Git (a new service, a new environment) and automation provisions it. Ops moves from doing the work to owning the guardrails: the templates, the policies and the limits that every request passes through. The platform becomes a product, and developers are its users."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "GitOps: Git says what should run, Argo CD makes it so"
        },
        {
          "type": "paragraph",
          "content": "GitOps means the desired state of the cluster lives in a Git repository, and an agent inside the cluster keeps pulling that state and applying it. The classic alternative is push-based deploys: a CI job runs `kubectl apply` once and walks away. If someone changes the cluster afterwards, nothing notices."
        },
        {
          "type": "paragraph",
          "content": "Argo CD is that agent. It works like a thermostat: you set the target in Git, it compares the room with the target, and it corrects the difference, again and again. That difference is called drift. With self-heal turned on, Argo CD reverts drift automatically, so the late-night `kubectl edit` from the intro gets undone and the cluster always matches Git. Every change is a commit, which also gives you an audit log for free."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "ApplicationSets turn onboarding into a folder"
        },
        {
          "type": "paragraph",
          "content": "In Argo CD, an Application is one unit of deployment: a source in Git and a destination in a cluster. With a few services you can write them by hand, or use the app-of-apps pattern, where one parent Application points at a folder full of child Application manifests. Past a few dozen services, both turn into copy-paste."
        },
        {
          "type": "paragraph",
          "content": "An ApplicationSet generates Applications from one template. A generator produces a list of items, and the template is filled in once per item. In the example below, look at the `git` generator and its `directories` path, then at how `{{path.basename}}` is reused in the template."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nmetadata:\n  name: tenant-services\nspec:\n  generators:\n    - git:\n        repoURL: https://github.com/acme/platform\n        revision: main\n        directories:\n          - path: \"services/*\"\n  template:\n    metadata:\n      name: \"{{path.basename}}\"\n    spec:\n      project: tenants\n      source:\n        repoURL: https://github.com/acme/platform\n        targetRevision: main\n        path: \"{{path}}\"\n      destination:\n        server: https://kubernetes.default.svc\n        namespace: \"{{path.basename}}\"\n      syncPolicy:\n        automated:\n          prune: true\n          selfHeal: true"
        },
        {
          "type": "paragraph",
          "content": "Every folder under `services/` becomes an Application named after the folder and deployed into a namespace with the same name. `prune` deletes what was removed from Git, `selfHeal` reverts drift. Onboarding a new service is now a folder in a pull request, not a copy-pasted manifest."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Golden paths, not golden cages"
        },
        {
          "type": "paragraph",
          "content": "A golden path is the recommended, pre-built way to do a common task, such as creating a new service. Scaffolding tools (Backstage, cookiecutter templates) generate the service with CI, Dockerfile, Helm chart, SLOs and dashboards already wired. The team writes business logic on day one instead of YAML."
        },
        {
          "type": "paragraph",
          "content": "The path is opinionated but not mandatory. Teams with special needs can step off it, and they take on the extra work when they do. A platform that forbids escape hatches becomes shadow IT within a quarter: people do not stop needing things, they just stop asking you."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Progressive delivery: ship to a few, then to everyone"
        },
        {
          "type": "paragraph",
          "content": "Self-service makes deploys frequent, so each one has to be safe. Argo Rollouts adds two strategies on top of GitOps. A canary sends a small slice of traffic to the new version first and grows it step by step. Blue/green runs the new version next to the old one and switches all traffic at once, with the old one kept ready to switch back."
        },
        {
          "type": "paragraph",
          "content": "Either way, promotion is decided by real metrics such as error rate and latency, not by someone staring at a graph. An analysis run checks those metrics during the rollout, and if it fails, Argo Rollouts rolls back automatically. Combined with policy-as-code (rules checked by machines before anything is admitted) and RBAC scoped per tenant, developers get speed and the platform keeps the blast radius small."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "When a platform is more than you need"
        },
        {
          "type": "list",
          "items": [
            "A platform is a product. It needs owners, a roadmap and user feedback. Without them it becomes one more internal tool people work around.",
            "With two or three teams, a shared repository of good examples may beat a full portal. Build the platform when the copy-paste starts to hurt.",
            "Self-heal is strict. During an incident, a manual hotfix will be reverted unless it goes through Git or auto-sync is paused, so write that procedure down before you need it at 3am.",
            "Secrets do not belong in Git in plain text, so GitOps needs an extra piece for them, such as encrypted secrets or an external secret store."
          ]
        }
      ]
    },
    it: {
      "title": "GitOps con Argo CD: comanda Git",
      "description": "Ticket in coda, `kubectl edit` notturni, cluster che non somiglia più a Git. Strada asfaltata self-service, ApplicationSet, self-heal di Argo CD e canary con rollback automatico, senza fare degli sviluppatori gli admin del cluster.",
      "content": [
        {
          "type": "paragraph",
          "content": "Uno sviluppatore ha bisogno di un nuovo servizio in staging. Apre un ticket. Le ops sono già sommerse da altri ticket, quindi il servizio aspetta. Intanto ieri notte qualcuno ha sistemato la produzione al volo con un `kubectl edit`. E adesso nessuno giura più che il cluster corrisponda a quello che c'è nel repository."
        },
        {
          "type": "paragraph",
          "content": "Il platform engineering è DevOps che regge oltre una manciata di team. Niente più pipeline e YAML reinventati da ogni squadra: un piccolo team di piattaforma ti consegna una \"strada asfaltata\". Self-service, con opinioni precise, sicura per default. Il GitOps è il meccanismo di delivery che la rende verificabile e capace di aggiustarsi da sola."
        },
        {
          "type": "paragraph",
          "content": "Il giro: perché i ticket non funzionano, cosa fanno davvero GitOps e Argo CD, come gli ApplicationSet riducono l'onboarding a una cartella, perché il golden path deve avere uscite, e come la progressive delivery ti fa andare veloce senza rompere tutto."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Dalla coda di ticket alla strada asfaltata"
        },
        {
          "type": "paragraph",
          "content": "Il tallone d'Achille delle ops centralizzate è la coda di ticket. Gli sviluppatori aspettano, le ops saltano da un contesto all'altro, nessuno è contento. Metti più persone nelle ops e la coda si accorcia. Di poco."
        },
        {
          "type": "paragraph",
          "content": "La piattaforma ribalta il flusso. Lo sviluppatore descrive l'intento in Git (un nuovo servizio, un nuovo ambiente) e l'automazione lo realizza. Le ops smettono di fare il lavoro e iniziano a possedere i guardrail: template, policy e limiti da cui passa ogni richiesta. La piattaforma è un prodotto. Gli sviluppatori sono i suoi utenti."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "GitOps: Git dice cosa gira, Argo CD lo rende vero"
        },
        {
          "type": "paragraph",
          "content": "GitOps vuol dire che lo stato desiderato del cluster vive in un repository Git, e un agente dentro il cluster continua a leggerlo e ad applicarlo. L'alternativa classica è il deploy push: un job di CI lancia `kubectl apply` una volta e se ne va. Se poi qualcuno mette le mani sul cluster, non se ne accorge nessuno."
        },
        {
          "type": "paragraph",
          "content": "Argo CD è quell'agente. Ragiona come un termostato: tu imposti l'obiettivo in Git, lui confronta la stanza con l'obiettivo e corregge la differenza. Ancora e ancora. Quella differenza si chiama drift. Con il self-heal attivo Argo CD il drift lo annulla da solo: il `kubectl edit` notturno dell'inizio sparisce e il cluster torna uguale a Git. Ogni modifica è un commit. E l'audit log te lo ritrovi gratis."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "ApplicationSet: l'onboarding diventa una cartella"
        },
        {
          "type": "paragraph",
          "content": "In Argo CD un'Application è un'unità di deploy: una sorgente in Git, una destinazione in un cluster. Con pochi servizi le scrivi a mano, oppure usi il pattern app-of-apps, dove un'Application padre punta a una cartella piena di manifest di Application figlie. Oltre qualche decina di servizi, tutte e due le strade diventano copia-incolla."
        },
        {
          "type": "paragraph",
          "content": "Un ApplicationSet genera Application da un unico template. Un generator sforna una lista di elementi, e il template viene compilato una volta per elemento. Nell'esempio qui sotto guarda il generator `git` con il suo path `directories`, poi come `{{path.basename}}` torna nel template."
        },
        {
          "type": "code",
          "language": "yaml",
          "code": "apiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nmetadata:\n  name: tenant-services\nspec:\n  generators:\n    - git:\n        repoURL: https://github.com/acme/platform\n        revision: main\n        directories:\n          - path: \"services/*\"\n  template:\n    metadata:\n      name: \"{{path.basename}}\"\n    spec:\n      project: tenants\n      source:\n        repoURL: https://github.com/acme/platform\n        targetRevision: main\n        path: \"{{path}}\"\n      destination:\n        server: https://kubernetes.default.svc\n        namespace: \"{{path.basename}}\"\n      syncPolicy:\n        automated:\n          prune: true\n          selfHeal: true"
        },
        {
          "type": "paragraph",
          "content": "Ogni cartella sotto `services/` diventa un'Application con il nome della cartella, deployata in un namespace omonimo. `prune` cancella quello che hai tolto da Git, `selfHeal` annulla il drift. Fare onboarding di un nuovo servizio adesso è una cartella in una pull request. Non un manifest copiato e incollato."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Golden path, non gabbie dorate"
        },
        {
          "type": "paragraph",
          "content": "Il golden path è il modo consigliato e già pronto di fare una cosa comune, tipo creare un nuovo servizio. Gli strumenti di scaffolding (Backstage, template cookiecutter) ti generano il servizio con CI, Dockerfile, Helm chart, SLO e dashboard già collegati. Il team scrive logica di business dal primo giorno, non YAML."
        },
        {
          "type": "paragraph",
          "content": "Il percorso ha opinioni, ma non è obbligatorio. Il team con esigenze strane può uscirne, e se ne esce si prende il lavoro in più. Una piattaforma senza vie di fuga diventa shadow IT nel giro di un trimestre. La gente non smette di avere bisogni. Smette solo di chiederli a te."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Progressive delivery: prima a pochi, poi a tutti"
        },
        {
          "type": "paragraph",
          "content": "Col self-service i deploy diventano frequenti, quindi ognuno deve essere sicuro. Argo Rollouts aggiunge due strategie sopra il GitOps. Il canary manda prima una fetta piccola di traffico alla nuova versione e la allarga passo dopo passo. Il blue/green fa girare la nuova versione accanto alla vecchia e sposta tutto il traffico in un colpo, con la vecchia pronta per il rollback."
        },
        {
          "type": "paragraph",
          "content": "In tutti e due i casi la promozione la decidono metriche vere, error rate e latenza. Non qualcuno che fissa un grafico. Un'analysis run le controlla durante il rollout, e se fallisce Argo Rollouts torna indietro da solo. Aggiungi policy-as-code (regole verificate dalle macchine prima che qualcosa entri) e RBAC per tenant: gli sviluppatori vanno veloci, la piattaforma tiene piccolo il raggio d'impatto."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Quando la piattaforma è troppa"
        },
        {
          "type": "list",
          "items": [
            "Una piattaforma è un prodotto. Le servono un owner, una roadmap e il feedback degli utenti. Senza, diventa l'ennesimo tool interno che la gente aggira.",
            "Con due o tre team, un repository condiviso di buoni esempi può battere un portale completo. Costruisci la piattaforma quando il copia-incolla inizia a fare male.",
            "Il self-heal non perdona. Durante un incidente il tuo hotfix a mano viene annullato, a meno che passi da Git o che l'auto-sync sia in pausa. Scrivi quella procedura prima che ti serva alle 3 di notte.",
            "I secret in chiaro in Git non ci vanno. Al GitOps serve un pezzo in più: secret cifrati o un secret store esterno."
          ]
        }
      ]
    },
  },
  'finops-kubernetes-cost-optimization': {
    en: {
      "title": "Kubernetes FinOps: cut the bill, keep the SLOs",
      "description": "Where Kubernetes money actually goes, how to rightsize with real data, and the spot + autoscaling patterns that cut spend without hurting your SLOs.",
      "content": [
        {
          "type": "paragraph",
          "content": "The cloud bill arrives, it is bigger than last month, and finance asks a simple question: which team spent it? Nobody can answer. The invoice says \"compute\", the cluster runs hundreds of pods from a dozen teams, and every team is sure the waste belongs to someone else."
        },
        {
          "type": "paragraph",
          "content": "Kubernetes makes it trivially easy to waste money. Over-generous requests, idle namespaces and always-on nodes all hide inside one bill that nobody can attribute. FinOps is the practice of bringing that accountability back: make cost visible per team and per feature, then optimize with data instead of guesswork."
        },
        {
          "type": "paragraph",
          "content": "This article walks through four steps, in the order that pays off:"
        },
        {
          "type": "list",
          "items": [
            "See the cost: attribute every euro to an owner.",
            "Rightsize: close the gap between what pods reserve and what they use.",
            "Buy cheaper capacity: spot nodes and Karpenter consolidation.",
            "Switch off what nobody uses: idle environments and zombie resources."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "You cannot cut what you cannot see"
        },
        {
          "type": "paragraph",
          "content": "Cost allocation means splitting the cluster bill into the parts each workload caused. The cloud provider bills you for nodes, but a node is shared by many pods, so somebody has to do the division. OpenCost and Kubecost do it: they break the bill down by namespace, workload and label."
        },
        {
          "type": "paragraph",
          "content": "Think of a group dinner with one receipt. Until you know who ordered what, everyone shrugs. Once the split exists, you can use it in two ways. Showback means showing each team its share, with no money moving. Chargeback means actually billing that share to the team's budget. Start with showback; chargeback comes later, once people trust the numbers."
        },
        {
          "type": "paragraph",
          "content": "Allocation only works if every pod says who it belongs to. Enforce a labeling standard so each pod maps to an owner and a cost center. Untagged spend is where budgets go to die: it ends up in a \"shared\" bucket that everyone sees and nobody owns."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Requests are what you pay for, not what you use"
        },
        {
          "type": "paragraph",
          "content": "Every container declares two numbers. A request is the CPU and memory the scheduler reserves for it on a node. A limit is the ceiling the container may not cross. The scheduler packs pods onto nodes by their requests, not by their real usage. So a pod that requests four cores and uses half of one still blocks four cores, and you still pay for the node that holds them."
        },
        {
          "type": "paragraph",
          "content": "That gap between requested and used is the biggest Kubernetes waste. The usual cause is a request copied from a template. The fix is to set requests from observed p95 usage: the value that usage stays under 95 times out of a hundred. It covers normal peaks without paying for the worst minute of the year."
        },
        {
          "type": "paragraph",
          "content": "Two commands show the gap. Look at the comments: the first compares, the second only recommends."
        },
        {
          "type": "code",
          "language": "bash",
          "code": "# Actual usage vs requests — the gap is wasted money\nkubectl top pods -A --sum=true\n\n# VPA recommendation (recommender mode, does not mutate)\nkubectl get vpa api -o jsonpath=\"{.status.recommendation.containerRecommendations[0].target}\""
        },
        {
          "type": "paragraph",
          "content": "`kubectl top` shows real consumption to set against your requests. The VPA (Vertical Pod Autoscaler) in recommendation mode watches usage and publishes a suggested request without changing anything, so a human can review it before applying."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Spot nodes are cheap because they can vanish"
        },
        {
          "type": "paragraph",
          "content": "Spot (or preemptible) instances are spare cloud capacity sold at a 60–90% discount, with a catch: the provider can take them back at short notice. On-demand instances cost full price and stay until you release them. Fault-tolerant and stateless workloads, the ones that can lose a replica and carry on, belong on spot."
        },
        {
          "type": "paragraph",
          "content": "Karpenter is a node provisioner. When pods are pending because no node fits them, it picks the cheapest instance type that does and launches it. It also consolidates: when several nodes are half empty, it moves their pods together and removes the nodes left over. A classic cluster autoscaler only grows and shrinks node groups you defined in advance."
        },
        {
          "type": "paragraph",
          "content": "Cheap capacity that disappears needs a safety net. A PodDisruptionBudget (PDB) tells Kubernetes how many replicas of a service must stay up during voluntary disruptions such as consolidation. Spread replicas across capacity types too, mixing spot and on-demand, so a single spot reclaim never takes a whole service down."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Zombie spend: the resources nobody remembers creating"
        },
        {
          "type": "paragraph",
          "content": "Some waste is not oversized, just forgotten. Staging environments run all night and all weekend with nobody using them. Scale non-production namespaces to zero outside working hours, with a KEDA cron trigger or a simple controller."
        },
        {
          "type": "paragraph",
          "content": "Then hunt the zombies: orphaned PersistentVolumes whose pods are long gone, load balancers attached to nothing, old snapshots. Storage and networking are the silent line items, because no dashboard of CPU graphs will ever show them. A volume called something like `tmp-do-not-delete` has usually earned its deletion."
        },
        {
          "type": "paragraph",
          "content": "A one-off cleanup feels great and decays within weeks. A weekly automated waste report, sent to the owning team, keeps entropy in check far better."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Where saving money starts to cost reliability"
        },
        {
          "type": "paragraph",
          "content": "Every lever here has a failure mode:"
        },
        {
          "type": "list",
          "items": [
            "Requests cut too close turn into CPU throttling and out-of-memory kills. Rightsize from data, then watch latency after the change.",
            "Spot is wrong for workloads that cannot lose a node gracefully: single-replica databases, long jobs without checkpoints.",
            "Consolidation moves pods. Without PDBs and honest readiness probes, saving money looks a lot like an outage.",
            "Chargeback before the numbers are trusted turns FinOps into an argument about the allocation model instead of about waste."
          ]
        },
        {
          "type": "paragraph",
          "content": "The order matters. Visibility first, because it tells you where the money is. Then rightsizing and spot, because they are the big levers. Then the weekly report, because waste always comes back."
        }
      ]
    },
    it: {
      "title": "FinOps su Kubernetes: la bolletta non mente",
      "description": "Request copiate da un template, staging acceso tutto il weekend, una bolletta che nessuno sa attribuire. Cost allocation, rightsizing al p95, spot con Karpenter e caccia agli zombie, senza bruciare gli SLO.",
      "content": [
        {
          "type": "paragraph",
          "content": "Arriva la bolletta cloud. È più alta del mese scorso. La finanza fa una domanda semplice: quale team l'ha spesa? Silenzio. La fattura dice \"compute\", il cluster fa girare centinaia di pod di una dozzina di team, e ogni team è convinto che lo spreco sia di qualcun altro."
        },
        {
          "type": "paragraph",
          "content": "Su Kubernetes sprecare soldi è banale. Request troppo generose, namespace idle, nodi sempre accesi: tutto finisce dentro una sola bolletta che nessuno riesce ad attribuire. Il FinOps serve a questo. Rendi il costo visibile per team e per feature, poi ottimizza con i dati. Non a naso."
        },
        {
          "type": "paragraph",
          "content": "Il giro è in quattro passi, nell'ordine in cui rendono:"
        },
        {
          "type": "list",
          "items": [
            "Vedi il costo: ogni euro ha un owner.",
            "Rightsizing: chiudi il buco tra quello che i pod riservano e quello che usano.",
            "Compra capacità che costa meno: nodi spot e consolidamento con Karpenter.",
            "Spegni quello che nessuno usa: ambienti idle e risorse zombie."
          ]
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Non tagli quello che non vedi"
        },
        {
          "type": "paragraph",
          "content": "Cost allocation vuol dire spaccare la bolletta del cluster nelle parti causate da ciascun workload. Il cloud provider ti fattura i nodi, ma un nodo lo dividono tanti pod, quindi qualcuno deve fare i conti. OpenCost e Kubecost fanno esattamente questo: scompongono la bolletta per namespace, workload e label."
        },
        {
          "type": "paragraph",
          "content": "Pensa a una cena di gruppo con un solo scontrino. Finché non sai chi ha ordinato cosa, tutti alzano le spalle. Fatta la divisione, la usi in due modi. Lo showback mostra a ogni team la sua quota, senza spostare un euro. Il chargeback quella quota la addebita davvero al budget del team. Parti dallo showback. Il chargeback arriva dopo, quando la gente si fida dei numeri."
        },
        {
          "type": "paragraph",
          "content": "L'allocazione funziona solo se ogni pod dichiara di chi è. Imponi uno standard di label, così ogni pod ha un owner e un centro di costo. La spesa senza tag è il cimitero dei budget: finisce in un calderone \"condiviso\" che tutti vedono e nessuno possiede."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Paghi le request, non l'uso"
        },
        {
          "type": "paragraph",
          "content": "Ogni container dichiara due numeri. La request è la CPU e la memoria che lo scheduler gli riserva su un nodo. Il limit è il tetto che non può superare. Lo scheduler impacchetta i pod sui nodi in base alle request, non all'uso reale. Tradotto: un pod che chiede quattro core e ne usa mezzo ne blocca comunque quattro. E il nodo che li ospita lo paghi tu."
        },
        {
          "type": "paragraph",
          "content": "Quel buco tra richiesto e usato è lo spreco numero uno su Kubernetes. Il colpevole tipico? Una request copiata da un template. La cura: imposta le request dall'uso p95 osservato, il valore sotto cui l'uso resta 95 volte su cento. Copri i picchi normali senza pagare il minuto peggiore dell'anno."
        },
        {
          "type": "paragraph",
          "content": "Due comandi e il buco salta fuori. Occhio ai commenti: il primo confronta, il secondo si limita a raccomandare."
        },
        {
          "type": "code",
          "language": "bash",
          "code": "# Uso reale vs request — il divario sono soldi sprecati\nkubectl top pods -A --sum=true\n\n# Raccomandazione VPA (modalita recommender, non muta nulla)\nkubectl get vpa api -o jsonpath=\"{.status.recommendation.containerRecommendations[0].target}\""
        },
        {
          "type": "paragraph",
          "content": "`kubectl top` ti dà il consumo reale da mettere accanto alle request. Il VPA (Vertical Pod Autoscaler) in modalità recommendation osserva l'uso e pubblica una request suggerita senza toccare niente. Una persona la rivede, poi la applica. Niente sorprese."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Lo spot costa poco perché può sparire"
        },
        {
          "type": "paragraph",
          "content": "Le istanze spot (o preemptible) sono capacità cloud avanzata, venduta con sconti del 60–90%. La fregatura: il provider se le riprende con poco preavviso. Le on-demand costano prezzo pieno e restano finché non le rilasci tu. I workload fault-tolerant e stateless, quelli che perdono una replica e tirano dritto, su spot stanno benissimo."
        },
        {
          "type": "paragraph",
          "content": "Karpenter è un provisioner di nodi. Vede pod in attesa perché nessun nodo li ospita, sceglie il tipo di istanza più economico che va bene e lo accende. E consolida: trova nodi mezzi vuoti, ne raggruppa i pod e butta via i nodi rimasti liberi. Un cluster autoscaler classico, invece, si limita ad allargare e stringere node group definiti in anticipo."
        },
        {
          "type": "paragraph",
          "content": "Capacità economica che sparisce vuol dire rete di sicurezza. Un PodDisruptionBudget (PDB) dice a Kubernetes quante repliche di un servizio devono restare su durante le interruzioni volontarie, tipo il consolidamento. Spargi le repliche anche tra tipi di capacità, spot e on-demand insieme. Così un singolo reclaim spot non ti tira giù un servizio intero."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Spesa zombie: roba che nessuno ricorda di aver creato"
        },
        {
          "type": "paragraph",
          "content": "Una parte dello spreco non è sovradimensionata. È solo dimenticata. Lo staging gira tutta la notte e tutto il weekend, e non lo usa nessuno. Scala a zero i namespace non produttivi fuori orario, con un trigger cron di KEDA o un controller da due soldi."
        },
        {
          "type": "paragraph",
          "content": "Poi vai a caccia di zombie: PersistentVolume orfani di pod che non esistono più, load balancer collegati al nulla, vecchi snapshot. Storage e networking sono le voci silenziose, nessuna dashboard di grafici CPU te le mostrerà mai. Un volume che si chiama tipo `tmp-non-cancellare`? Di solito la cancellazione se l'è guadagnata."
        },
        {
          "type": "paragraph",
          "content": "La pulizia una tantum dà soddisfazione. Dura poche settimane. Un report settimanale automatico degli sprechi, spedito al team owner, tiene a bada l'entropia molto meglio."
        },
        {
          "type": "heading",
          "level": 2,
          "content": "Dove il risparmio inizia a costare affidabilità"
        },
        {
          "type": "paragraph",
          "content": "Ogni leva ha il suo modo di rompere tutto:"
        },
        {
          "type": "list",
          "items": [
            "Request tagliate troppo strette diventano CPU throttling e kill per out-of-memory. Fai rightsizing sui dati, poi guarda la latenza dopo il cambio.",
            "Lo spot è sbagliato per i workload che non sanno perdere un nodo con grazia: database a replica singola, job lunghi senza checkpoint.",
            "Il consolidamento sposta i pod. Senza PDB e readiness probe oneste, il tuo risparmio somiglia parecchio a un disservizio.",
            "Il chargeback prima che i numeri siano credibili trasforma il FinOps in una lite sul modello di allocazione. Degli sprechi non parla più nessuno."
          ]
        },
        {
          "type": "paragraph",
          "content": "L'ordine conta. Prima la visibilità: ti dice dove sono i soldi. Poi rightsizing e spot: sono le leve grosse. Poi il report settimanale. Perché lo spreco torna. Sempre."
        }
      ]
    },
  },
};

/** Articles with this tag are listed as case studies on /lab. */
export const CASE_STUDY_TAG = 'Case study';

export function getArticles(locale: Locale): Article[] {
  return articlesContent.map(article => ({
    ...article,
    ...translations[article.slug][locale],
  }));
}

export function getArticle(slug: string, locale: Locale): Article | undefined {
  const articleMeta = articlesContent.find(a => a.slug === slug);
  if (!articleMeta) return undefined;
  
  return {
    ...articleMeta,
    ...translations[slug][locale],
  };
}

export function getArticleSlugs(): string[] {
  return articlesContent.map((article) => article.slug);
}

/**
 * Articles sharing the most tags with `slug`, newest first on a tie.
 * Returns fewer than `limit` (or none) rather than padding with unrelated posts —
 * a "related" link that isn't related is worse than no link.
 */
/** The homelab series, in reading order. */
export const HOMELAB_SERIES = [
  'silent-failures-alerting-that-notices',
  'defense-in-depth-behind-a-consumer-router',
  'ipv6-firewall-locked-out-lan-case-study',
];

export function getRelatedArticles(slug: string, locale: Locale, limit = 3): Article[] {
  const current = getArticle(slug, locale);
  if (!current) return [];
  const currentTags = new Set(current.tags);
  // A series article already lists its siblings in the series box.
  const skip = new Set(HOMELAB_SERIES.includes(slug) ? HOMELAB_SERIES : [slug]);

  return getArticles(locale)
    .filter((candidate) => !skip.has(candidate.slug))
    .map((candidate) => ({
      article: candidate,
      shared: candidate.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || +new Date(b.article.date) - +new Date(a.article.date))
    .slice(0, limit)
    .map(({ article }) => article);
}
