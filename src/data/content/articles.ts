import type { Article, Locale } from "@/lib/types";

const articlesContent: Omit<Article, 'title' | 'description' | 'content'>[] = [
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

const translations: Record<string, Record<Locale, Pick<Article, 'title' | 'description' | 'content'>>> = {
  'x402-agent-native-api-monetization': {
    en: {
      title: 'Getting Paid by Machines: Monetizing APIs with x402 and Pay Per Crawl',
      description: 'HTTP 402 finally has a job. How Cloudflare\'s Pay Per Crawl and Monetization Gateway let agents and crawlers pay per request—and the pricing pitfalls nobody mentions.',
      content: [
        { type: 'paragraph', content: 'For three decades the web had exactly two answers for an automated client: serve it for free, or block it. HTTP 402 "Payment Required" sat reserved-but-unused in the spec the entire time. It finally has a job: letting AI crawlers and autonomous agents pay for what they fetch—per request, with no account and no contract. Cloudflare shipped two products on top of it, Pay Per Crawl and the Monetization Gateway, and together they redefine what a paying customer can be.' },
        { type: 'heading', level: 2, content: 'Two gateways, two economic models' },
        { type: 'paragraph', content: 'Pay Per Crawl targets AI crawlers specifically. A publisher sets one flat per-request price for the whole domain and marks each crawler allow, charge, or block. Cloudflare acts as Merchant of Record: it verifies the crawler, aggregates the charges, and pays the publisher in fiat. Zero crypto, almost no setup—but it only bills crawlers.' },
        { type: 'paragraph', content: 'The Monetization Gateway generalizes the idea to any caller and any resource: web pages, REST APIs, datasets, even MCP tools. It runs on x402, an open protocol where the buyer pays in stablecoin (USDC) and settlement lands peer-to-peer straight in the seller\'s wallet—sub-second, with fees down to fractions of a cent. This is the surface that matters if you sell APIs, not just articles.' },
        { type: 'heading', level: 2, content: 'The x402 handshake' },
        { type: 'paragraph', content: 'The flow is stateless and needs no prior relationship. The client requests a gated resource; the edge replies 402 with the price, the accepted asset, and a payment destination; the client pays and retries with proof; the edge verifies and returns 200. Because enforcement happens at Cloudflare\'s edge, your origin never sees unpaid traffic or the payment machinery.' },
        { type: 'code', language: 'http', code: `# Pay Per Crawl — discovery-first flow (documented headers)
GET /research/2026-forecast.html
< HTTP/1.1 402 Payment Required
< crawler-price: USD 0.01

# the crawler agrees to the price and retries
GET /research/2026-forecast.html
> crawler-exact-price: USD 0.01
< HTTP/1.1 200 OK
< crawler-charged: USD 0.01` },
        { type: 'paragraph', content: 'Crawlers are kept honest with Web Bot Auth: an Ed25519 key pair, a published JWK directory, and HTTP Message Signatures (RFC 9421) on every request, so a spoofed user agent cannot rack up charges in your name. The Monetization Gateway reuses the same identity layer optionally, to bill usage against a known account.' },
        { type: 'heading', level: 2, content: 'Price the way machines consume' },
        { type: 'paragraph', content: 'Human pricing is seats and monthly tiers; machine pricing is per call. The gateway lets you charge a fixed amount per verb and path ("$0.01 per GET /premium/*"), vary it by work done ("up to $2" for an image generation), or intercept a 401 and return 402 so an unauthenticated caller pays instead of bouncing. Subscriptions become one option among many, not the only one.' },
        { type: 'heading', level: 2, content: 'The subtlety nobody mentions: pre-payment vs metered billing' },
        { type: 'paragraph', content: 'x402 is pre-payment—you pay, then you get the response. But the most valuable machine resource, LLM inference, is billed after the fact, per output token, and you cannot know the exact token count before generating. There are three clean ways to reconcile the two.' },
        { type: 'paragraph', content: 'First, fixed tiers: price by model and a max_tokens cap so the charge is deterministic. Second, prepaid credits against a verified agent identity, settling real usage post-hoc. Third, a cache-aware price: when a semantic cache serves the answer, charge a fraction of the cold price—high margin, and a healthy incentive to cache.' },
        { type: 'heading', level: 2, content: 'Revenue per request becomes an observability signal' },
        { type: 'paragraph', content: 'Once every call carries a price, you can finally compute margin per endpoint: x402 revenue minus the infra cost of serving that request. For anyone doing FinOps this is the missing half of the ledger—until now we only ever measured cost. Feed settlement webhooks into the same dashboards that track cost-per-request and you get profit-per-request, live.' },
        { type: 'heading', level: 2, content: 'Position before the agents arrive' },
        { type: 'paragraph', content: 'Both products are still early: Pay Per Crawl is in private beta, the Monetization Gateway on a waitlist, and x402 settlement means holding a stablecoin wallet with the tax and compliance that implies. The buyer side—agents that carry their own wallets—is nascent in 2026. That is exactly the point: the cheapest moment to wire a keyless, pay-per-request path into your API is before the agents show up, not after.' },
      ],
    },
    it: {
      title: 'Farsi pagare dalle macchine: monetizzare le API con x402 e Pay Per Crawl',
      description: 'Lo status HTTP 402 ha finalmente un compito. Come Pay Per Crawl e il Monetization Gateway di Cloudflare fanno pagare agenti e crawler a richiesta—e le insidie di pricing che nessuno cita.',
      content: [
        { type: 'paragraph', content: 'Per trent\'anni il web ha avuto esattamente due risposte per un client automatico: servirlo gratis, oppure bloccarlo. Lo status HTTP 402 "Payment Required" è rimasto riservato-ma-inutilizzato nella specifica per tutto questo tempo. Ora ha finalmente un compito: far pagare crawler AI e agenti autonomi per ciò che scaricano—a richiesta, senza account e senza contratto. Cloudflare ha rilasciato due prodotti che ci si appoggiano, Pay Per Crawl e il Monetization Gateway, e insieme ridefiniscono cosa può essere un cliente pagante.' },
        { type: 'heading', level: 2, content: 'Due gateway, due modelli economici' },
        { type: 'paragraph', content: 'Pay Per Crawl si rivolge specificamente ai crawler AI. L\'editore imposta un unico prezzo flat per-richiesta su tutto il dominio e marca ogni crawler come allow, charge o block. Cloudflare fa da Merchant of Record: verifica il crawler, aggrega gli addebiti e paga l\'editore in valuta fiat. Zero crypto, quasi nessun setup—ma fattura solo i crawler.' },
        { type: 'paragraph', content: 'Il Monetization Gateway generalizza l\'idea a qualunque chiamante e qualunque risorsa: pagine web, API REST, dataset, perfino tool MCP. Gira su x402, un protocollo aperto in cui il compratore paga in stablecoin (USDC) e il settlement arriva peer-to-peer direttamente nel wallet del venditore—sub-secondo, con commissioni fino a frazioni di centesimo. È questa la superficie che conta se vendi API, non solo articoli.' },
        { type: 'heading', level: 2, content: 'L\'handshake x402' },
        { type: 'paragraph', content: 'Il flusso è stateless e non richiede alcuna relazione pregressa. Il client chiede una risorsa protetta; l\'edge risponde 402 con il prezzo, l\'asset accettato e una destinazione di pagamento; il client paga e riprova allegando la prova; l\'edge verifica e restituisce 200. Poiché l\'enforcement avviene all\'edge di Cloudflare, il tuo origin non vede mai né il traffico non pagato né la macchina dei pagamenti.' },
        { type: 'code', language: 'http', code: `# Pay Per Crawl — flusso discovery-first (header documentati)
GET /research/2026-forecast.html
< HTTP/1.1 402 Payment Required
< crawler-price: USD 0.01

# il crawler accetta il prezzo e riprova
GET /research/2026-forecast.html
> crawler-exact-price: USD 0.01
< HTTP/1.1 200 OK
< crawler-charged: USD 0.01` },
        { type: 'paragraph', content: 'I crawler restano onesti grazie a Web Bot Auth: una coppia di chiavi Ed25519, una directory JWK pubblicata e HTTP Message Signatures (RFC 9421) su ogni richiesta, così uno user agent contraffatto non può accumulare addebiti a tuo nome. Il Monetization Gateway riusa opzionalmente lo stesso layer di identità per fatturare l\'uso su un account noto.' },
        { type: 'heading', level: 2, content: 'Prezza come consumano le macchine' },
        { type: 'paragraph', content: 'Il pricing umano è a postazioni e piani mensili; quello delle macchine è a chiamata. Il gateway ti lascia addebitare un importo fisso per verbo e path ("$0.01 per ogni GET /premium/*"), variarlo in base al lavoro svolto ("fino a $2" per una generazione di immagini), oppure intercettare un 401 e restituire 402 così un chiamante non autenticato paga invece di rimbalzare. Gli abbonamenti diventano un\'opzione tra tante, non l\'unica.' },
        { type: 'heading', level: 2, content: 'La sottigliezza che nessuno cita: pre-pagamento vs billing a consumo' },
        { type: 'paragraph', content: 'x402 è pre-pagamento—paghi, poi ottieni la risposta. Ma la risorsa-macchina più preziosa, l\'inferenza LLM, si fattura a posteriori, per token generato, e non puoi conoscere il numero esatto di token prima di generarli. Ci sono tre modi puliti per conciliare le due cose.' },
        { type: 'paragraph', content: 'Primo, tier fissi: prezzo per modello e un cap di max_tokens, così l\'addebito è deterministico. Secondo, crediti prepagati contro un\'identità agente verificata, regolando l\'uso reale a posteriori. Terzo, un prezzo cache-aware: quando una cache semantica serve la risposta, addebiti una frazione del prezzo a freddo—margine alto e un sano incentivo a mettere in cache.' },
        { type: 'heading', level: 2, content: 'Il ricavo per richiesta diventa un segnale di osservabilità' },
        { type: 'paragraph', content: 'Quando ogni chiamata porta con sé un prezzo, puoi finalmente calcolare il margine per endpoint: ricavo x402 meno il costo infrastrutturale di servire quella richiesta. Per chi fa FinOps è la metà mancante del libro mastro—finora abbiamo sempre e solo misurato il costo. Manda i webhook di settlement nelle stesse dashboard che tracciano il costo-per-richiesta e ottieni il profitto-per-richiesta, in tempo reale.' },
        { type: 'heading', level: 2, content: 'Posizionati prima che arrivino gli agenti' },
        { type: 'paragraph', content: 'Entrambi i prodotti sono ancora acerbi: Pay Per Crawl è in private beta, il Monetization Gateway in waitlist, e il settlement x402 significa detenere un wallet stablecoin con le implicazioni fiscali e di compliance del caso. Il lato compratore—agenti che portano il proprio wallet—è nascente nel 2026. Ed è esattamente questo il punto: il momento più economico per cablare un percorso keyless e pay-per-request nella tua API è prima che gli agenti arrivino, non dopo.' },
      ],
    },
  },
  'aws-rag-etl-pipeline': {
    en: {
      title: 'Designing a Cost-Effective RAG ETL Flow on AWS',
      description: "Your RAG is only as smart as the vector store is fresh. A hardened, cost-predictable ETL on AWS — before a stale embedding quotes last year's price to a customer with total confidence.",
      content: [
        { type: 'paragraph', content: "A RAG system is only as good as its vector store is fresh — feed it stale embeddings and it will cheerfully quote last quarter's docs to your customers with total confidence. That confidence-without-correctness is exactly what a hardened ETL exists to prevent. 'Just run the script' pipelines don't survive contact with production: you need a flow that ingests, cleans, enriches, embeds, and leaves an audit trail behind it. After building RAG pipelines for banking, healthcare, and e-commerce clients chewing through millions of documents a month, here are the patterns that stay deterministic under chaotic load without torching the budget." },
        { type: 'heading', level: 2, content: 'Reference Architecture & Data Contracts' },
        { type: 'paragraph', content: 'We begin with Amazon EventBridge rules that respond to new objects landing in S3 or to webhook events from ticketing systems. Each event triggers a Lambda that validates the payload against a JSON schema stored in AWS Glue Data Catalog. Strict contracts prevent malformed documents from clogging the stream later. When the payload is valid, Step Functions orchestrates a multi-stage pipeline: extraction, enrichment, embeddings, and load.' },
        { type: 'paragraph', content: 'The validation layer is critical. I\'ve seen pipelines fail because a single malformed PDF corrupted the entire batch. Our validation Lambda checks document structure, file size limits (we cap at 50MB per document), MIME types, and required metadata fields. Invalid payloads are immediately routed to a dead-letter queue with detailed error context, allowing operations teams to triage without digging through CloudWatch logs.' },
        { type: 'code', language: 'python', code: `import json
import boto3
from jsonschema import validate, ValidationError
from typing import Dict, Any

s3 = boto3.client('s3')
glue = boto3.client('glue')

def validate_payload(event: Dict[str, Any]) -> Dict[str, Any]:
    """Validate incoming document payload against Glue schema."""
    schema = glue.get_schema(
        SchemaId={'SchemaName': 'rag-document-schema', 'RegistryName': 'rag-registry'}
    )
    
    try:
        validate(instance=event, schema=json.loads(schema['SchemaDefinition']))
        
        # Additional business rules
        if event['fileSize'] > 50 * 1024 * 1024:  # 50MB limit
            raise ValueError(f"File size {event['fileSize']} exceeds 50MB limit")
        
        if event['mimeType'] not in ['application/pdf', 'text/plain', 'text/markdown']:
            raise ValueError(f"Unsupported MIME type: {event['mimeType']}")
        
        return {'valid': True, 'payload': event}
    except ValidationError as e:
        return {'valid': False, 'error': str(e), 'payload': event}` },
        { type: 'code', language: 'json', code: `{
  "StartAt": "ValidatePayload",
  "States": {
    "ValidatePayload": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "rag-validate",
        "Payload": {
          "s3Key": "$.s3Key",
          "bucket": "$.bucket",
          "source": "$.source"
        }
      },
      "Retry": [{
        "ErrorEquals": ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
        "IntervalSeconds": 2,
        "MaxAttempts": 3,
        "BackoffRate": 2.0
      }],
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "SendToDLQ",
        "ResultPath": "$.error"
      }],
      "Next": "Extract"
    },
    "Extract": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "rag-extract" },
      "Next": "Enrich"
    },
    "Enrich": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "ExtractMetadata",
          "States": {
            "ExtractMetadata": {
              "Type": "Task",
              "Resource": "arn:aws:states:::glue:startJobRun",
              "Parameters": {
                "JobName": "rag-metadata-enrichment",
                "Arguments": {
                  "--input-path": "$.extractedPath",
                  "--output-path": "$.enrichedPath"
                }
              },
              "End": true
            }
          }
        },
        {
          "StartAt": "GenerateEmbeddings",
          "States": {
            "GenerateEmbeddings": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "rag-embed",
                "Payload": {
                  "text": "$.extractedText",
                  "model": "amazon.titan-embed-text-v1",
                  "dimensions": 1024
                }
              },
              "Retry": [{
                "ErrorEquals": ["Lambda.ThrottlingException"],
                "IntervalSeconds": 5,
                "MaxAttempts": 5,
                "BackoffRate": 2.0
              }],
              "End": true
            }
          }
        }
      ],
      "Next": "Load"
    },
    "Load": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "rag-opensearch-indexer",
        "Payload": {
          "embeddings": "$.embeddings",
          "metadata": "$.metadata",
          "documentId": "$.documentId"
        }
      },
      "End": true
    },
    "SendToDLQ": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sqs:sendMessage",
      "Parameters": {
        "QueueUrl": "\${DLQ_URL}",
        "MessageBody": "$"
      },
      "End": true
    }
  }
}` },
        { type: 'heading', level: 2, content: 'Document Processing & Embedding Strategy' },
        { type: 'paragraph', content: 'Content-heavy documents run through Textract (table extraction) and Bedrock Titan multimodal models for quick summarisation. Language normalisation happens in Amazon Comprehend. Embeddings rely on a SageMaker Serverless Endpoint with auto-scaling warm pools, avoiding cold-start spikes during business hours.' },
        { type: 'paragraph', content: 'The embedding strategy matters enormously for cost and quality. We use chunking with overlap (typically 200 tokens with 50-token overlap) to preserve context across boundaries. For structured documents like PDFs with tables, we extract tables separately and embed them as distinct chunks, preserving referential integrity through metadata links.' },
        { type: 'code', language: 'python', code: `import boto3
from typing import List, Dict
import tiktoken  # For token counting

bedrock = boto3.client('bedrock-runtime')
sagemaker = boto3.client('sagemaker-runtime')

class DocumentChunker:
    """Intelligent chunking with overlap and metadata preservation."""
    
    def __init__(self, chunk_size: int = 200, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def chunk_with_overlap(self, text: str, metadata: Dict) -> List[Dict]:
        """Split text into overlapping chunks preserving context."""
        tokens = self.encoding.encode(text)
        chunks = []
        
        for i in range(0, len(tokens), self.chunk_size - self.overlap):
            chunk_tokens = tokens[i:i + self.chunk_size]
            chunk_text = self.encoding.decode(chunk_tokens)
            
            chunks.append({
                'text': chunk_text,
                'chunk_index': len(chunks),
                'start_token': i,
                'end_token': min(i + self.chunk_size, len(tokens)),
                'metadata': {
                    **metadata,
                    'chunk_id': f"{metadata['document_id']}_chunk_{len(chunks)}"
                }
            })
        
        return chunks
    
    def extract_tables(self, pdf_path: str) -> List[Dict]:
        """Extract tables from PDF using Textract."""
        textract = boto3.client('textract')
        response = textract.analyze_document(
            Document={'S3Object': {'Bucket': 'rag-documents', 'Name': pdf_path}},
            FeatureTypes=['TABLES']
        )
        
        tables = []
        for block in response['Blocks']:
            if block['BlockType'] == 'TABLE':
                tables.append({
                    'table_id': block['Id'],
                    'cells': self._extract_table_cells(block, response['Blocks']),
                    'metadata': {'source': pdf_path, 'page': block.get('Page', 1)}
                })
        
        return tables
    
    def generate_embeddings_batch(self, chunks: List[Dict]) -> List[Dict]:
        """Batch embedding generation with retry logic."""
        embeddings = []
        
        for chunk in chunks:
            try:
                response = sagemaker.invoke_endpoint(
                    EndpointName='titan-embed-endpoint',
                    ContentType='application/json',
                    Body=json.dumps({
                        'inputText': chunk['text'],
                        'dimensions': 1024
                    })
                )
                
                embedding = json.loads(response['Body'].read())['embedding']
                
                embeddings.append({
                    **chunk,
                    'embedding': embedding,
                    'embedding_model': 'amazon.titan-embed-text-v1',
                    'embedding_dimensions': len(embedding)
                })
            except Exception as e:
                # Log and continue - failed chunks go to DLQ
                print(f"Failed to embed chunk {chunk['chunk_id']}: {e}")
                continue
        
        return embeddings` },
        { type: 'heading', level: 2, content: 'Real-world Use Cases & Production Lessons' },
        { type: 'paragraph', content: 'Case study #1: A European fintech aggregates 200k PDF disclosures daily across multiple regulatory jurisdictions. The challenge: data residency requirements meant documents from EU customers couldn\'t leave the EU, but we needed a unified search experience. Solution: We split the workload across three regions (eu-west-1, eu-central-1, eu-north-1) using regional S3 buckets, but centralized the OpenSearch Serverless collection in eu-west-1 using cross-region replication. Glue jobs write Parquet + Snappy artifacts to S3, and we keep 30-day rolling windows in hot storage while archiving older embeddings to Glacier Instant Retrieval. Result: 41% storage savings ($2,300/month reduction) and SLA-compliant search latency under 200ms p95.' },
        { type: 'paragraph', content: 'The key insight here was using Step Functions\' Map state to parallelize regional processing while maintaining a single source of truth. Each regional branch processes documents independently, but all write to the same OpenSearch collection through VPC endpoints, ensuring low latency while respecting compliance boundaries.' },
        { type: 'code', language: 'python', code: `import boto3
from datetime import datetime, timedelta

s3 = boto3.client('s3')
glue = boto3.client('glue')

def archive_old_embeddings():
    """Archive embeddings older than 30 days to Glacier Instant Retrieval."""
    bucket = 'rag-embeddings-prod'
    prefix = 'embeddings/'
    
    cutoff_date = datetime.now() - timedelta(days=30)
    
    paginator = s3.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get('Contents', []):
            if obj['LastModified'] < cutoff_date:
                # Copy to Glacier Instant Retrieval
                copy_source = {'Bucket': bucket, 'Key': obj['Key']}
                s3.copy_object(
                    CopySource=copy_source,
                    Bucket=bucket,
                    Key=obj['Key'].replace('embeddings/', 'archive/'),
                    StorageClass='GLACIER_IR',
                    Metadata={
                        'original-date': obj['LastModified'].isoformat(),
                        'archived-date': datetime.now().isoformat()
                    }
                )
                # Delete from hot storage
                s3.delete_object(Bucket=bucket, Key=obj['Key'])
                print(f"Archived {obj['Key']} to Glacier IR")` },
        { type: 'paragraph', content: 'Case study #2: An ITSM provider needs near-real-time ingestion of incident tickets from Jira, ServiceNow, and PagerDuty. The requirement: tickets must be searchable within 5 minutes of creation. Challenge: webhook storms during incidents could overwhelm the pipeline. Solution: EventBridge triggers the pipeline every five minutes with batching, and Step Functions isolates the embedding branch so that a failure there doesn\'t block metadata enrichment. Failed embeddings land on an SQS DLQ with exponential backoff, allowing replay without redeploying the whole stack. We also implemented Lambda reserved concurrency (50 concurrent executions) to prevent cascading failures.' },
        { type: 'paragraph', content: 'The critical pattern here is circuit breaker logic. When embedding failures exceed a threshold (we use 10% failure rate over 5 minutes), we automatically switch to a degraded mode: metadata is still enriched and indexed, but embeddings are queued for batch reprocessing during off-peak hours. This ensures the system remains operational even when Bedrock or SageMaker experience issues.' },
        { type: 'code', language: 'python', code: `import boto3
import json
from collections import deque
from datetime import datetime, timedelta

sqs = boto3.client('sqs')
cloudwatch = boto3.client('cloudwatch')

class CircuitBreaker:
    """Circuit breaker for embedding failures."""
    
    def __init__(self, failure_threshold: float = 0.1, window_minutes: int = 5):
        self.failure_threshold = failure_threshold
        self.window_minutes = window_minutes
        self.failure_history = deque(maxlen=100)
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    def record_failure(self):
        """Record a failure event."""
        self.failure_history.append({
            'timestamp': datetime.now(),
            'type': 'failure'
        })
        self._check_state()
    
    def record_success(self):
        """Record a success event."""
        self.failure_history.append({
            'timestamp': datetime.now(),
            'type': 'success'
        })
        self._check_state()
    
    def _check_state(self):
        """Check if circuit should open/close."""
        now = datetime.now()
        window_start = now - timedelta(minutes=self.window_minutes)
        
        recent_events = [
            e for e in self.failure_history
            if e['timestamp'] >= window_start
        ]
        
        if len(recent_events) < 10:
            return  # Not enough data
        
        failures = sum(1 for e in recent_events if e['type'] == 'failure')
        failure_rate = failures / len(recent_events)
        
        if failure_rate >= self.failure_threshold and self.state == 'CLOSED':
            self.state = 'OPEN'
            self._publish_metric('CircuitBreakerOpened', 1)
            print(f"Circuit breaker OPENED - failure rate: {failure_rate:.2%}")
        elif failure_rate < self.failure_threshold / 2 and self.state == 'OPEN':
            self.state = 'HALF_OPEN'
            print("Circuit breaker HALF_OPEN - testing recovery")
        elif self.state == 'HALF_OPEN' and len([e for e in recent_events[-10:] if e['type'] == 'success']) >= 8:
            self.state = 'CLOSED'
            self._publish_metric('CircuitBreakerClosed', 1)
            print("Circuit breaker CLOSED - system recovered")
    
    def should_allow_request(self) -> bool:
        """Check if request should be allowed."""
        return self.state != 'OPEN'
    
    def _publish_metric(self, metric_name: str, value: float):
        """Publish CloudWatch metric."""
        cloudwatch.put_metric_data(
            Namespace='RAG/ETL',
            MetricData=[{
                'MetricName': metric_name,
                'Value': value,
                'Timestamp': datetime.now()
            }]
        )

def replay_from_dlq(limit: int = 10, max_retries: int = 3):
    """Replay failed messages from DLQ with retry tracking."""
    sqs = boto3.client('sqs')
    
    messages = sqs.receive_message(
        QueueUrl=DLQ_URL,
        MaxNumberOfMessages=limit,
        AttributeNames=['ApproximateReceiveCount']
    )
    
    for msg in messages.get('Messages', []):
        retry_count = int(msg['Attributes'].get('ApproximateReceiveCount', 0))
        
        if retry_count >= max_retries:
            # Move to manual review queue
            sqs.send_message(
                QueueUrl=MANUAL_REVIEW_QUEUE,
                MessageBody=msg['Body'],
                MessageAttributes={
                    'OriginalDLQReceiptHandle': {'StringValue': msg['ReceiptHandle'], 'DataType': 'String'},
                    'RetryCount': {'StringValue': str(retry_count), 'DataType': 'Number'}
                }
            )
            sqs.delete_message(QueueUrl=DLQ_URL, ReceiptHandle=msg['ReceiptHandle'])
            continue
        
        # Replay to main queue with exponential backoff delay
        delay_seconds = min(2 ** retry_count, 900)  # Max 15 minutes
        
        sqs.send_message(
            QueueUrl=MAIN_QUEUE,
            MessageBody=msg['Body'],
            DelaySeconds=delay_seconds,
            MessageAttributes={
                'RetryCount': {'StringValue': str(retry_count + 1), 'DataType': 'Number'},
                'OriginalTimestamp': {'StringValue': msg['Attributes'].get('SentTimestamp', ''), 'DataType': 'String'}
            }
        )
        sqs.delete_message(QueueUrl=DLQ_URL, ReceiptHandle=msg['ReceiptHandle'])` },
        { type: 'heading', level: 2, content: 'Cost Controls, Scaling, and Observability' },
        { type: 'paragraph', content: 'Two rules keep bills predictable: micro-batching (max 5 minutes of payload per run) and aggressive tagging. Every resource carries `env`, `rag-etl`, `customer`, and `cost-center` tags so AWS Cost Explorer can pivot by feature. Lambda reserved concurrency protects against stampedes caused by third-party webhooks. For the vector store, start with OpenSearch Serverless (2 OCUs baseline) and move to Aurora PostgreSQL + pgvector when you need relational joins or tenant isolation.' },
        { type: 'paragraph', content: 'Cost optimization is an ongoing discipline. We use AWS Cost Anomaly Detection to alert when daily spend exceeds baseline by 20%. Every Lambda function has CloudWatch alarms for duration and memory usage, and we regularly right-size based on actual metrics. For high-volume workloads, consider provisioned concurrency for critical Lambda functions (at $0.015 per GB-second) to eliminate cold starts, but only after profiling shows cold starts are actually impacting SLA.' },
        { type: 'code', language: 'python', code: `import boto3
from datetime import datetime, timedelta

ce = boto3.client('ce')  # Cost Explorer
cloudwatch = boto3.client('cloudwatch')

def analyze_rag_costs(start_date: str, end_date: str):
    """Analyze RAG ETL costs by service and resource."""
    response = ce.get_cost_and_usage(
        TimePeriod={'Start': start_date, 'End': end_date},
        Granularity='DAILY',
        Metrics=['UnblendedCost'],
        GroupBy=[
            {'Type': 'DIMENSION', 'Key': 'SERVICE'},
            {'Type': 'TAG', 'Key': 'rag-etl'}
        ],
        Filter={
            'Tags': {
                'Key': 'rag-etl',
                'Values': ['true']
            }
        }
    )
    
    costs_by_service = {}
    for result in response['ResultsByTime']:
        for group in result['Groups']:
            service = group['Keys'][0]
            cost = float(group['Metrics']['UnblendedCost']['Amount'])
            costs_by_service[service] = costs_by_service.get(service, 0) + cost
    
    # Identify optimization opportunities
    total_cost = sum(costs_by_service.values())
    print(f"Total RAG ETL cost: \${total_cost:.2f}")
    
    for service, cost in sorted(costs_by_service.items(), key=lambda x: x[1], reverse=True):
        percentage = (cost / total_cost) * 100
        print(f"{service}: \${cost:.2f} ({percentage:.1f}%)")
        
        # Recommendations
        if service == 'Amazon SageMaker' and percentage > 30:
            print("  → Consider using Bedrock instead for embeddings (60% cost reduction)")
        elif service == 'AWS Lambda' and percentage > 25:
            print("  → Review memory allocation and consider ARM-based Graviton2 (20% cheaper)")
        elif service == 'Amazon OpenSearch Service' and percentage > 20:
            print("  → Evaluate moving to Aurora PostgreSQL + pgvector for cost savings")` },
        { type: 'paragraph', content: 'Instrument everything with CloudWatch Embedded Metric Format (EMF) so you can chart ingestion latency, embedding cost per document, and failure rate per datasource. Store provenance metadata (source URL, checksum, embedding model version, processing timestamp) inside OpenSearch fields so your RAG layer can trace answers back to origin—a must-have when auditors ask "why did the assistant mention X?" or when debugging hallucination issues.' },
        { type: 'code', language: 'python', code: `import json
from datetime import datetime
from typing import Dict, Any

class RAGMetrics:
    """CloudWatch EMF metrics for RAG ETL pipeline."""
    
    @staticmethod
    def emit_ingestion_metric(document_id: str, latency_ms: float, 
                             datasource: str, success: bool):
        """Emit ingestion latency metric."""
        metric = {
            '_aws': {
                'CloudWatchMetrics': [{
                    'Namespace': 'RAG/ETL',
                    'Metrics': [{
                        'MetricName': 'IngestionLatency',
                        'Unit': 'Milliseconds'
                    }],
                    'Dimensions': [['DocumentId', 'DataSource', 'Status']]
                }],
                'Timestamp': int(datetime.now().timestamp() * 1000)
            },
            'DocumentId': document_id,
            'DataSource': datasource,
            'Status': 'Success' if success else 'Failure',
            'IngestionLatency': latency_ms
        }
        print(json.dumps(metric))
    
    @staticmethod
    def emit_embedding_cost(document_id: str, cost_usd: float, 
                           model: str, dimensions: int):
        """Emit embedding cost metric."""
        metric = {
            '_aws': {
                'CloudWatchMetrics': [{
                    'Namespace': 'RAG/ETL',
                    'Metrics': [{
                        'MetricName': 'EmbeddingCost',
                        'Unit': 'None'
                    }],
                    'Dimensions': [['Model', 'Dimensions']]
                }],
                'Timestamp': int(datetime.now().timestamp() * 1000)
            },
            'DocumentId': document_id,
            'Model': model,
            'Dimensions': dimensions,
            'EmbeddingCost': cost_usd
        }
        print(json.dumps(metric))
    
    @staticmethod
    def store_provenance_metadata(document_id: str, metadata: Dict[str, Any]):
        """Store provenance metadata in OpenSearch."""
        provenance = {
            'document_id': document_id,
            'source_url': metadata.get('source_url'),
            'checksum': metadata.get('checksum'),
            'embedding_model': metadata.get('embedding_model'),
            'model_version': metadata.get('model_version'),
            'processing_timestamp': datetime.now().isoformat(),
            'processing_pipeline_version': metadata.get('pipeline_version', '1.0.0'),
            'datasource': metadata.get('datasource'),
            'extraction_method': metadata.get('extraction_method'),
            'chunk_count': metadata.get('chunk_count', 0)
        }
        
        # Index to OpenSearch with TTL for compliance
        # This allows tracing RAG responses back to source documents
        return provenance` },
        { type: 'heading', level: 2, content: 'Advanced Patterns: Multi-Tenancy & Security' },
        { type: 'paragraph', content: 'For SaaS providers serving multiple customers, tenant isolation is non-negotiable. We implement row-level security in OpenSearch using document-level access control (DLAC) or route each tenant to a separate index. The latter approach scales better but requires index management automation. For compliance-heavy industries (healthcare, finance), we add encryption at rest using KMS customer-managed keys and enable VPC endpoints to ensure traffic never leaves AWS\'s network.' },
        { type: 'paragraph', content: 'Security best practices include: (1) IAM roles with least-privilege access, (2) Secrets Manager for API keys and database credentials, (3) VPC endpoints for all AWS service calls to avoid internet egress, (4) CloudTrail logging for all API calls, and (5) regular security audits using AWS Security Hub. We also implement data loss prevention (DLP) scanning using Amazon Macie to detect sensitive data before indexing.' },
        { type: 'code', language: 'python', code: `import boto3
from typing import Dict, List

kms = boto3.client('kms')
secrets = boto3.client('secretsmanager')
macie = boto3.client('macie2')

class SecureRAGPipeline:
    """Security-hardened RAG pipeline with DLP and encryption."""
    
    def __init__(self, kms_key_id: str):
        self.kms_key_id = kms_key_id
    
    def scan_for_sensitive_data(self, s3_key: str, bucket: str) -> Dict:
        """Scan document for PII/PHI before processing."""
        # Use Macie to detect sensitive data
        response = macie.create_classification_job(
            jobType='ONE_TIME',
            s3JobDefinition={
                'bucketDefinitions': [{
                    'accountId': boto3.client('sts').get_caller_identity()['Account'],
                    'buckets': [bucket]
                }],
                'scoping': {
                    'includes': {
                        'and': [{
                            'simpleScopeTerm': {
                                'key': 'OBJECT_KEY',
                                'values': [s3_key]
                            }
                        }]
                    }
                }
            },
            name=f'dlp-scan-{s3_key.replace("/", "-")}'
        )
        
        return {
            'job_id': response['jobId'],
            'status': 'PENDING'
        }
    
    def encrypt_embedding(self, embedding: List[float], tenant_id: str) -> bytes:
        """Encrypt embedding using tenant-specific KMS key."""
        response = kms.encrypt(
            KeyId=f'alias/rag-tenant-{tenant_id}',
            Plaintext=json.dumps(embedding).encode('utf-8')
        )
        return response['CiphertextBlob']
    
    def get_tenant_credentials(self, tenant_id: str) -> Dict:
        """Retrieve tenant-specific credentials from Secrets Manager."""
        secret_name = f'rag/tenant/{tenant_id}/credentials'
        response = secrets.get_secret_value(SecretId=secret_name)
        return json.loads(response['SecretString'])` },
        { type: 'heading', level: 2, content: 'Performance Tuning & Monitoring' },
        { type: 'paragraph', content: 'Production RAG pipelines require careful performance tuning. Key metrics to monitor: (1) end-to-end latency (target: <5 minutes for 10MB document), (2) embedding generation rate (target: >100 documents/minute), (3) OpenSearch indexing throughput (target: >1000 docs/second), and (4) error rate (target: <0.1%). We use CloudWatch dashboards with automated alarms that trigger PagerDuty alerts when thresholds are breached.' },
        { type: 'paragraph', content: 'Common bottlenecks: (1) Textract processing for large PDFs (mitigate with async processing and S3 event notifications), (2) SageMaker endpoint cold starts (mitigate with provisioned concurrency or warm-up scripts), (3) OpenSearch indexing bottlenecks (mitigate with bulk API and proper sharding strategy), and (4) Lambda memory limits (right-size based on CloudWatch Insights queries showing actual memory usage).' },
      ],
    },
    it: {
      title: 'Progettare un flusso ETL RAG economico su AWS',
      description: "Il tuo RAG è intelligente quanto è fresco il vector store. Una pipeline ETL su AWS robusta e dal costo prevedibile—prima che un embedding stantìo citi al cliente i prezzi dell'anno scorso con assoluta sicurezza.",
      content: [
        { type: 'paragraph', content: "Un sistema RAG vale quanto è fresco il suo vector store: dagli embedding stantii e citerà con assoluta sicurezza la documentazione del trimestre scorso ai tuoi clienti. È proprio quella sicurezza-senza-correttezza che una pipeline ETL robusta esiste per evitare. I pipeline 'tanto lancio lo script' non sopravvivono all'impatto con la produzione: serve un flusso che ingerisce, pulisce, arricchisce, genera embedding e si lascia dietro un audit trail. Dopo aver costruito pipeline RAG per banche, sanità ed e-commerce che macinano milioni di documenti al mese, ecco i pattern che restano deterministici sotto carichi caotici senza incenerire il budget." },
        { type: 'heading', level: 2, content: 'Architettura di Riferimento & Contratti Dati' },
        { type: 'paragraph', content: 'Iniziamo con regole Amazon EventBridge che rispondono a nuovi oggetti in S3 o eventi webhook da sistemi di ticketing. Ogni evento attiva una Lambda che valida il payload contro uno schema JSON memorizzato in AWS Glue Data Catalog. Contratti rigorosi prevengono documenti malformati che intaserebbero lo stream. Quando il payload è valido, Step Functions orchestra una pipeline multi-stage: estrazione, arricchimento, embedding e caricamento.' },
        { type: 'paragraph', content: 'Il layer di validazione è critico. Ho visto pipeline fallire perché un singolo PDF malformato corrompeva l\'intero batch. La nostra Lambda di validazione controlla struttura del documento, limiti di dimensione file (capiamo a 50MB per documento), tipi MIME e campi metadati richiesti. Payload non validi vengono immediatamente instradati a una dead-letter queue con contesto di errore dettagliato, permettendo ai team operativi di fare triage senza scavare nei log CloudWatch.' },
        { type: 'code', language: 'python', code: `import json
import boto3
from jsonschema import validate, ValidationError
from typing import Dict, Any

s3 = boto3.client('s3')
glue = boto3.client('glue')

def validate_payload(event: Dict[str, Any]) -> Dict[str, Any]:
    """Valida il payload del documento contro lo schema Glue."""
    schema = glue.get_schema(
        SchemaId={'SchemaName': 'rag-document-schema', 'RegistryName': 'rag-registry'}
    )
    
    try:
        validate(instance=event, schema=json.loads(schema['SchemaDefinition']))
        
        # Regole di business aggiuntive
        if event['fileSize'] > 50 * 1024 * 1024:  # Limite 50MB
            raise ValueError(f"Dimensione file {event['fileSize']} supera il limite di 50MB")
        
        if event['mimeType'] not in ['application/pdf', 'text/plain', 'text/markdown']:
            raise ValueError(f"Tipo MIME non supportato: {event['mimeType']}")
        
        return {'valid': True, 'payload': event}
    except ValidationError as e:
        return {'valid': False, 'error': str(e), 'payload': event}` },
        { type: 'heading', level: 2, content: 'Strategia di Processing & Embedding' },
        { type: 'paragraph', content: 'Documenti ricchi di contenuto passano attraverso Textract (estrazione tabelle) e modelli multimodali Bedrock Titan per rapida summarizzazione. La normalizzazione linguistica avviene in Amazon Comprehend. Gli embedding si affidano a un SageMaker Serverless Endpoint con warm pool auto-scaling, evitando picchi di cold-start durante le ore lavorative.' },
        { type: 'paragraph', content: 'La strategia di embedding conta enormemente per costi e qualità. Usiamo chunking con overlap (tipicamente 200 token con overlap di 50 token) per preservare contesto tra i confini. Per documenti strutturati come PDF con tabelle, estraiamo le tabelle separatamente e le embediamo come chunk distinti, preservando integrità referenziale attraverso link nei metadati.' },
        { type: 'heading', level: 2, content: 'Casi d\'Uso Reali & Lezioni di Produzione' },
        { type: 'paragraph', content: 'Caso studio #1: Una fintech europea aggrega 200k PDF di disclosure giornalieri attraverso multiple giurisdizioni regolatorie. La sfida: requisiti di data residency significavano che documenti da clienti EU non potevano lasciare l\'EU, ma serviva un\'esperienza di ricerca unificata. Soluzione: Abbiamo diviso il carico di lavoro su tre regioni (eu-west-1, eu-central-1, eu-north-1) usando bucket S3 regionali, ma centralizzato la collezione OpenSearch Serverless in eu-west-1 usando replicazione cross-region. I job Glue scrivono artefatti Parquet + Snappy su S3, e manteniamo finestre rolling di 30 giorni in hot storage mentre archiviamo embedding più vecchi su Glacier Instant Retrieval. Risultato: 41% di risparmio storage ($2,300/mese di riduzione) e latenza di ricerca conforme SLA sotto 200ms p95.' },
        { type: 'paragraph', content: 'L\'insight chiave qui è stato usare lo stato Map di Step Functions per parallelizzare il processing regionale mantenendo una singola fonte di verità. Ogni branch regionale processa documenti indipendentemente, ma tutti scrivono nella stessa collezione OpenSearch attraverso VPC endpoints, garantendo bassa latenza rispettando i confini di compliance.' },
        { type: 'heading', level: 2, content: 'Controlli Costi, Scaling e Osservabilità' },
        { type: 'paragraph', content: 'Due regole mantengono le bollette prevedibili: micro-batching (max 5 minuti di payload per run) e tagging aggressivo. Ogni risorsa porta tag `env`, `rag-etl`, `customer` e `cost-center` così AWS Cost Explorer può fare pivot per feature. La reserved concurrency di Lambda protegge da stampede causate da webhook di terze parti. Per il vector store, iniziate con OpenSearch Serverless (2 OCU baseline) e migrate ad Aurora PostgreSQL + pgvector quando servono join relazionali o isolamento tenant.' },
        { type: 'paragraph', content: 'L\'ottimizzazione dei costi è una disciplina continua. Usiamo AWS Cost Anomaly Detection per alertare quando la spesa giornaliera supera il baseline del 20%. Ogni funzione Lambda ha alarm CloudWatch per durata e uso memoria, e regolarmente right-size basandoci su metriche reali. Per workload ad alto volume, considerate provisioned concurrency per funzioni Lambda critiche (a $0.015 per GB-secondo) per eliminare cold start, ma solo dopo che il profiling mostra che i cold start impattano effettivamente l\'SLA.' },
        { type: 'heading', level: 2, content: 'Pattern Avanzati: Multi-Tenancy & Sicurezza' },
        { type: 'paragraph', content: 'Per provider SaaS che servono multiple clienti, l\'isolamento tenant è non negoziabile. Implementiamo row-level security in OpenSearch usando document-level access control (DLAC) o instradiamo ogni tenant a un indice separato. L\'approccio latter scala meglio ma richiede automazione di gestione indici. Per industrie compliance-heavy (sanità, finanza), aggiungiamo encryption at rest usando KMS customer-managed keys e abilitiamo VPC endpoints per assicurare che il traffico non lasci mai la rete AWS.' },
        { type: 'paragraph', content: 'Best practice di sicurezza includono: (1) ruoli IAM con accesso least-privilege, (2) Secrets Manager per API keys e credenziali database, (3) VPC endpoints per tutte le chiamate servizio AWS per evitare egress internet, (4) logging CloudTrail per tutte le chiamate API, e (5) audit di sicurezza regolari usando AWS Security Hub. Implementiamo anche scanning data loss prevention (DLP) usando Amazon Macie per rilevare dati sensibili prima dell\'indicizzazione.' },
        { type: 'heading', level: 2, content: 'Performance Tuning & Monitoring' },
        { type: 'paragraph', content: 'Pipeline RAG di produzione richiedono tuning accurato delle performance. Metriche chiave da monitorare: (1) latenza end-to-end (target: <5 minuti per documento 10MB), (2) tasso generazione embedding (target: >100 documenti/minuto), (3) throughput indicizzazione OpenSearch (target: >1000 docs/secondo), e (4) tasso errore (target: <0.1%). Usiamo dashboard CloudWatch con alarm automatizzati che triggerano alert PagerDuty quando le soglie sono violate.' },
        { type: 'paragraph', content: 'Colli di bottiglia comuni: (1) processing Textract per PDF grandi (mitigare con processing async e notifiche eventi S3), (2) cold start endpoint SageMaker (mitigare con provisioned concurrency o script warm-up), (3) colli di bottiglia indicizzazione OpenSearch (mitigare con bulk API e strategia sharding appropriata), e (4) limiti memoria Lambda (right-size basandosi su query CloudWatch Insights che mostrano uso memoria effettivo).' },
      ],
    },
  },
  'infrastructure-as-code-guide': {
    en: {
      title: 'Infrastructure as Code in Practice: Benefits, Trade-offs, and Tooling',
      description: "IaC isn't 'clicks, but in a repo'. Fundamentals, war stories, and how Terraform, CloudFormation, and Pulumi actually fit different teams — plus why running `terraform apply` on a Friday is a personality test.",
      content: [
        { type: 'paragraph', content: "IaC is more than 'turning clicks into code' — it's the contract between platform teams and the developers who'd rather never open the cloud console. Done right, you get reproducible environments, automated compliance, and knowledge that lives in git instead of one engineer's memory. Done wrong, it's a 'quick weekend migration' that quietly haunts you for two years. I've watched IaC succeed when leaders treat it as a product and fail when they treat it as a chore. After running IaC transformations across fintech, healthcare, and e-commerce shops pushing thousands of infrastructure changes a month, here are the patterns that deliver reliability, security, and velocity at scale." },
        { type: 'heading', level: 2, content: 'Benefits, Risks, and Anti-Patterns' },
        { type: 'paragraph', content: 'Benefits: versioning, PR-based reviews, drift detection, ephemeral test environments, and the ability to bolt policy engines (OPA, Terraform Cloud, cf-guard) directly into CI/CD. Risks: state corruption, poorly scoped IAM policies, and "copy/paste modules" that become unmaintained snowflakes. Anti-patterns include letting every squad fork the same Terraform module, or granting CI runners admin roles without guardrails.' },
        { type: 'paragraph', content: 'The most critical benefit is auditability. When a production incident occurs, you can trace infrastructure changes through git history, identify the exact commit that introduced the issue, and rollback with confidence. I\'ve seen organizations reduce mean time to recovery (MTTR) from hours to minutes simply by having infrastructure changes versioned and reviewable. However, this requires discipline: every change must go through IaC, with zero manual console modifications.' },
        { type: 'code', language: 'hcl', code: `# Example: Terraform module with embedded policy checks
module "secure_s3_bucket" {
  source = "git::https://github.com/company/terraform-modules//s3-bucket?ref=v2.1.0"
  
  bucket_name = "prod-artifacts-\${var.environment}"
  versioning  = true
  encryption  = "aws:kms"
  
  # Policy checks enforced via Sentinel
  tags = {
    Environment = var.environment
    CostCenter   = var.cost_center
    ManagedBy    = "terraform"
  }
}

# Sentinel policy (enforced in Terraform Cloud)
# main = rule {
#   all s3_buckets as _, buckets {
#     all buckets as bucket {
#       bucket.versioning.enabled is true
#     }
#   }
# }` },
        { type: 'heading', level: 2, content: 'Tool Comparison: Terraform, CloudFormation, Pulumi' },
        { type: 'paragraph', content: 'Terraform remains the de facto multi-cloud option, with mature workflows (remote state, Sentinel, CDK for Terraform). CloudFormation integrates deepest with AWS features like ChangeSets, StackSets, and Drift Detection. Pulumi targets developer-first teams that prefer TypeScript/Python/Go and want to reuse existing libraries or apply imperative logic.' },
        { type: 'paragraph', content: 'Terraform\'s strength lies in its ecosystem: 3,000+ providers covering virtually every cloud and SaaS platform. The HCL language is declarative and readable, though it can feel verbose for complex logic. CloudFormation\'s native AWS integration means you get features like StackSets for multi-account deployments and ChangeSets for previewing changes before apply. Pulumi\'s programmatic approach shines when you need loops, conditionals, or integration with existing codebases.' },
        { type: 'code', language: 'ts', code: `// Pulumi: S3 bucket with encryption and lifecycle policies
import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("artifacts", {
  serverSideEncryptionConfiguration: {
    rule: {
      applyServerSideEncryptionByDefault: {
        sseAlgorithm: "aws:kms",
        kmsMasterKeyId: kmsKey.id,
      },
      bucketKeyEnabled: true,
    },
  },
  versioning: { enabled: true },
  lifecycleRules: [
    {
      enabled: true,
      expiration: { days: 30 },
      noncurrentVersionExpiration: { days: 7 },
      abortIncompleteMultipartUploadDays: 1,
    },
  ],
  publicAccessBlockConfiguration: {
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  },
});

// CloudFormation equivalent (YAML)
// Resources:
//   ArtifactsBucket:
//     Type: AWS::S3::Bucket
//     Properties:
//       VersioningConfiguration:
//         Status: Enabled
//       BucketEncryption:
//         ServerSideEncryptionConfiguration:
//           - ServerSideEncryptionByDefault:
//               SSEAlgorithm: aws:kms
//               KMSMasterKeyID: !Ref KMSKey` },
        { type: 'code', language: 'hcl', code: `# Terraform: Reusable module pattern
# modules/vpc/main.tf
variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "cidr_block" {
  type        = string
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "vpc-\${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Usage in root module
module "production_vpc" {
  source = "./modules/vpc"
  
  environment = "prod"
  cidr_block  = "10.1.0.0/16"
}` },
        { type: 'heading', level: 2, content: 'State Management: The Critical Foundation' },
        { type: 'paragraph', content: 'State management is where most IaC initiatives stumble. Local state files are fine for learning, but production requires remote backends with locking. Terraform Cloud, S3 + DynamoDB, or Pulumi ESC provide state locking, versioning, and encryption at rest. Without locking, concurrent applies can corrupt state, leading to hours of recovery work.' },
        { type: 'paragraph', content: 'Best practice: store state remotely from day one, enable versioning on the state bucket, and use DynamoDB for locking. Encrypt state at rest using KMS, and restrict access via IAM policies. For multi-account setups, use Terraform Cloud workspaces or AWS Organizations with separate state per account.' },
        { type: 'code', language: 'hcl', code: `# terraform.tf - Remote backend configuration
terraform {
  backend "s3" {
    bucket         = "company-terraform-state-prod"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:123456789012:key/abc123"
    dynamodb_table = "terraform-state-lock"
    
    # Prevent accidental overwrites
    versioning = true
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# State recovery runbook snippet
# 1. Check DynamoDB for stale locks: aws dynamodb scan --table-name terraform-state-lock
# 2. If lock is stale (>1 hour), delete: aws dynamodb delete-item --table-name terraform-state-lock --key '{"LockID":{"S":"..."}}'
# 3. Restore state from S3 versioning if corruption detected
# 4. Run terraform refresh to sync with actual infrastructure` },
        { type: 'heading', level: 2, content: 'Case Study: Terraform at Scale' },
        { type: 'paragraph', content: 'A travel company with 40 squads adopted Terraform using a platform-owned registry of opinionated modules. Each module had embedded policy checks and surfaced semantic versioning. Rollouts happened behind a single "infra-apply" GitHub Action workflow, ensuring state locking and drift detection were centralised. The result was a median provisioning time of 12 minutes versus 2+ hours previously with tickets.' },
        { type: 'paragraph', content: 'The key to their success was a centralized module registry with semantic versioning. Each module (VPC, ECS cluster, RDS instance) was versioned independently, allowing squads to adopt updates at their own pace. Policy-as-code via Sentinel prevented common mistakes: no public S3 buckets, required tags, encryption at rest. The platform team maintained a "golden path" module for each resource type, reducing variance across 200+ microservices.' },
        { type: 'code', language: 'yaml', code: `# GitHub Actions: Terraform apply workflow with policy checks
name: Infrastructure Apply
on:
  pull_request:
    paths:
      - 'infrastructure/**'
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  terraform-plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0
          terraform_wrapper: false
      
      - name: Terraform Init
        run: |
          cd infrastructure
          terraform init \
            -backend-config="bucket=\${{ secrets.TF_STATE_BUCKET }}" \
            -backend-config="key=\${{ github.ref_name }}/terraform.tfstate"
      
      - name: Terraform Validate
        run: |
          cd infrastructure
          terraform validate
          terraform fmt -check
      
      - name: Terraform Plan
        id: plan
        run: |
          cd infrastructure
          terraform plan -out=tfplan -no-color
        continue-on-error: true
      
      - uses: hashicorp/terraform-github-actions@master
        with:
          tf_actions_version: 1.6.0
          tf_actions_comment: true
      
      - name: Policy Check (Sentinel)
        if: github.event_name == 'pull_request'
        run: |
          # Run Sentinel policies via Terraform Cloud
          terraform plan -out=tfplan
          terraform show -json tfplan | sentinel apply policies/
      
  terraform-apply:
    needs: terraform-plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Apply
        run: |
          cd infrastructure
          terraform init
          terraform apply -auto-approve` },
        { type: 'heading', level: 2, content: 'Drift Detection and Remediation' },
        { type: 'paragraph', content: 'Infrastructure drift—when actual resources diverge from IaC definitions—is inevitable. Someone makes a manual change in the console, a script modifies resources directly, or a third-party tool updates configurations. Drift detection must be automated and run regularly, not just during deployments.' },
        { type: 'paragraph', content: 'Terraform Cloud and AWS Config both offer drift detection. The key is deciding how to handle drift: auto-remediate (risky), alert-only (safe but requires manual action), or selective remediation based on resource type. For production, I recommend alert-only with a weekly review process. Critical resources (IAM roles, security groups) should auto-remediate, while compute resources can be reviewed before remediation.' },
        { type: 'code', language: 'python', code: `# Python script: Automated drift detection and reporting
import boto3
import json
from datetime import datetime
from typing import List, Dict

cloudformation = boto3.client('cloudformation')
config = boto3.client('config')

def detect_drift(stack_name: str) -> Dict:
    """Detect CloudFormation stack drift."""
    response = cloudformation.detect_stack_drift(StackName=stack_name)
    drift_id = response['StackDriftDetectionId']
    
    # Wait for detection to complete
    while True:
        status = cloudformation.describe_stack_drift_detection_status(
            StackDriftDetectionId=drift_id
        )
        if status['DetectionStatus'] == 'DETECTION_COMPLETE':
            break
        time.sleep(2)
    
    # Get drift details
    drift_details = cloudformation.describe_stack_resource_drifts(
        StackName=stack_name
    )
    
    return {
        'stack_name': stack_name,
        'drift_status': status['StackDriftStatus'],
        'drifted_resources': [
            {
                'logical_id': drift['LogicalResourceId'],
                'resource_type': drift['ResourceType'],
                'drift_type': drift['StackResourceDriftStatus'],
                'property_differences': drift.get('PropertyDifferences', [])
            }
            for drift in drift_details['StackResourceDrifts']
            if drift['StackResourceDriftStatus'] != 'IN_SYNC'
        ]
    }

def remediate_drift(stack_name: str, resource_logical_id: str):
    """Remediate drift by updating stack from IaC."""
    # This would trigger a Terraform apply or CloudFormation update
    # Only run for non-critical resources after approval
    pass

# Scheduled Lambda: Run daily drift detection
def lambda_handler(event, context):
    stacks = cloudformation.list_stacks(
        StackStatusFilter=['CREATE_COMPLETE', 'UPDATE_COMPLETE']
    )
    
    drift_report = []
    for stack in stacks['StackSummaries']:
        drift = detect_drift(stack['StackName'])
        if drift['drift_status'] != 'IN_SYNC':
            drift_report.append(drift)
            # Send to SNS for alerting
            sns.publish(
                TopicArn=DRIFT_ALERT_TOPIC,
                Message=json.dumps(drift, indent=2),
                Subject=f"Drift detected in {stack['StackName']}"
            )
    
    return {'drifted_stacks': len(drift_report), 'details': drift_report}` },
        { type: 'heading', level: 2, content: 'Testing Infrastructure Code' },
        { type: 'paragraph', content: 'Testing IaC is non-negotiable for production workloads. Unit tests validate variable validation and module logic. Integration tests spin up real resources in ephemeral environments, validate they work correctly, then tear them down. Compliance tests ensure security policies are enforced.' },
        { type: 'paragraph', content: 'Tools like Terratest (Go), Kitchen-Terraform (Ruby), and Pytest with moto (Python) enable integration testing. The pattern: write tests that create infrastructure, validate it behaves correctly, then destroy it. Run these in CI/CD before merging to main. For compliance, use tools like Checkov, tfsec, or cfn-nag to scan for security misconfigurations.' },
        { type: 'code', language: 'go', code: `// Terratest example: Testing VPC module
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestVPCModule(t *testing.T) {
    terraformOptions := &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "environment": "test",
            "cidr_block":  "10.0.0.0/16",
        },
        NoColor: true,
    }
    
    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)
    
    // Validate VPC exists
    vpcId := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcId)
    
    // Validate DNS is enabled
    vpc := getVPC(t, vpcId)
    assert.True(t, *vpc.EnableDnsHostnames)
    assert.True(t, *vpc.EnableDnsSupport)
    
    // Validate subnets exist
    publicSubnets := terraform.OutputList(t, terraformOptions, "public_subnet_ids")
    assert.Len(t, publicSubnets, 2) // Expect 2 AZs
    
    // Validate security groups
    sgId := terraform.Output(t, terraformOptions, "default_security_group_id")
    assert.NotEmpty(t, sgId)
}` },
        { type: 'code', language: 'python', code: `# Pytest + moto: Testing CloudFormation templates
import boto3
import pytest
from moto import mock_cloudformation, mock_s3
from botocore.exceptions import ClientError

@mock_cloudformation
@mock_s3
def test_s3_bucket_template():
    """Test CloudFormation template creates S3 bucket correctly."""
    cf = boto3.client('cloudformation', region_name='us-east-1')
    s3 = boto3.client('s3', region_name='us-east-1')
    
    # Load template
    with open('templates/s3-bucket.yaml') as f:
        template_body = f.read()
    
    # Create stack
    stack_name = 'test-bucket-stack'
    cf.create_stack(
        StackName=stack_name,
        TemplateBody=template_body,
        Parameters=[
            {'ParameterKey': 'BucketName', 'ParameterValue': 'test-bucket'}
        ]
    )
    
    # Validate bucket exists
    buckets = s3.list_buckets()
    assert any(b['Name'] == 'test-bucket' for b in buckets['Buckets'])
    
    # Validate versioning enabled
    versioning = s3.get_bucket_versioning(Bucket='test-bucket')
    assert versioning['Status'] == 'Enabled'
    
    # Cleanup
    cf.delete_stack(StackName=stack_name)

# Checkov: Security scanning
# checkov -d infrastructure/ --framework terraform
# checkov -f template.yaml --framework cloudformation` },
        { type: 'heading', level: 2, content: 'Multi-Account and Multi-Region Patterns' },
        { type: 'paragraph', content: 'Enterprise organizations require multi-account strategies for isolation, billing, and compliance. Terraform workspaces, CloudFormation StackSets, and Pulumi stacks enable managing infrastructure across accounts. The key is a consistent module library and centralized state management.' },
        { type: 'paragraph', content: 'Pattern: Use AWS Organizations with separate accounts per environment (dev, staging, prod). Each account has its own Terraform state, but modules are shared via a private registry. Use assume-role authentication to deploy from a central CI/CD account. For multi-region, parameterize regions in modules and deploy the same stack to multiple regions.' },
        { type: 'code', language: 'hcl', code: `# Multi-account deployment pattern
# terraform.tfvars per account
# accounts/dev/terraform.tfvars
account_id    = "111111111111"
environment   = "dev"
region        = "us-east-1"
kms_key_alias = "alias/dev-terraform-state"

# accounts/prod/terraform.tfvars
account_id    = "999999999999"
environment   = "prod"
region        = "us-east-1"
kms_key_alias = "alias/prod-terraform-state"

# main.tf - Assume role for cross-account access
provider "aws" {
  region = var.region
  
  assume_role {
    role_arn = "arn:aws:iam::\${var.account_id}:role/TerraformDeploymentRole"
  }
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
      AccountId   = var.account_id
    }
  }
}

# GitHub Actions: Deploy to multiple accounts
# jobs:
#   deploy-dev:
#     environment: dev
#     steps:
#       - run: terraform apply -var-file=accounts/dev/terraform.tfvars
#   deploy-prod:
#     needs: deploy-dev
#     environment: production
#     steps:
#       - run: terraform apply -var-file=accounts/prod/terraform.tfvars` },
        { type: 'heading', level: 2, content: 'Adoption Strategy & Best Practices' },
        { type: 'paragraph', content: '1) Start with one platform team owning shared modules. 2) Enforce code reviews and automated plan checks. 3) Use remote backends with locking (S3 + DynamoDB, Terraform Cloud, or Pulumi ESC). 4) Document runbooks for state recovery and cross-account bootstrapping. 5) Provide developer enablement—brown bags, templates, and office hours do more than top-down mandates. 6) Track metrics like "time to environment" and "incidents due to drift" to justify further investments.' },
        { type: 'paragraph', content: 'The migration path matters. Don\'t try to convert everything at once. Start with net-new infrastructure, then gradually migrate existing resources using terraform import or CloudFormation drift detection. Create a "golden path" module for each resource type, then require all new infrastructure to use these modules. Over time, teams will naturally migrate to avoid maintaining custom code.' },
        { type: 'paragraph', content: 'Measure success with metrics: time to provision environments (target: <15 minutes), infrastructure change lead time (target: <1 day), and drift incidents (target: <1 per month). These metrics justify continued investment and help identify bottlenecks in the IaC workflow.' },
        { type: 'code', language: 'hcl', code: `# Example: Golden path module with sensible defaults
# modules/ecs-service/main.tf
variable "service_name" {
  type        = string
  description = "Name of the ECS service"
}

variable "cpu" {
  type        = number
  default     = 256
  description = "CPU units (256 = 0.25 vCPU)"
}

variable "memory" {
  type        = number
  default     = 512
  description = "Memory in MB"
}

variable "desired_count" {
  type        = number
  default     = 2
  description = "Desired number of tasks"
}

# Enforce best practices
resource "aws_ecs_service" "main" {
  name            = var.service_name
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_count
  
  # Always use Fargate (no EC2 management)
  launch_type = "FARGATE"
  
  # Health checks
  health_check_grace_period_seconds = 60
  
  # Auto-scaling (enforced)
  enable_execute_command = true # For debugging
  
  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false # Always private
  }
  
  # Load balancer (required)
  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.service_name
    container_port   = 8080
  }
  
  tags = {
    Name        = var.service_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Usage - teams just provide service name
module "api_service" {
  source = "git::https://github.com/company/modules//ecs-service?ref=v1.2.0"
  
  service_name = "user-api"
  cpu          = 512
  memory       = 1024
  # All other settings come from module defaults` },
      ],
    },
    it: {
      title: 'Infrastructure as Code: vantaggi, limiti e scelta degli strumenti',
      description: "L'IaC non è 'i click, ma dentro un repo'. Fondamentali, storie dal campo e come Terraform, CloudFormation e Pulumi si incastrano davvero nei team—più il motivo per cui lanciare `terraform apply` di venerdì è un test della personalità.",
      content: [
        { type: 'paragraph', content: "L'IaC è molto più che 'trasformare i click in codice': è il contratto tra i team di piattaforma e gli sviluppatori che preferirebbero non aprire mai la console cloud. Fatta bene, ottieni ambienti ripetibili, compliance automatica e conoscenza che vive in git invece che nella memoria di un solo ingegnere. Fatta male, è una 'migrazione veloce del weekend' che ti perseguita per due anni. Ho visto l'IaC avere successo quando i leader la trattano come un prodotto e fallire quando la trattano come una corvée. Dopo aver gestito trasformazioni IaC in fintech, sanità ed e-commerce che spingono migliaia di cambi infrastrutturali al mese, ecco i pattern che garantiscono affidabilità, sicurezza e velocità su larga scala." },
        { type: 'heading', level: 2, content: 'Pro, contro e errori comuni' },
        { type: 'paragraph', content: 'I pro: ambienti ripetibili, audit trail, drift detection, ambienti effimeri per test automatici. I contro: gestione dello stato, formazione del team, rischio di permessi eccessivi nelle CI. Errori tipici: lasciare i file di stato in locale, non definire policy di naming/tagging, mancare di una piattaforma centrale di moduli.' },
        { type: 'paragraph', content: "Il vantaggio più critico è l'auditabilità. Quando si verifica un incidente in produzione, potete tracciare i cambi infrastrutturali attraverso la storia git, identificare il commit esatto che ha introdotto il problema e fare rollback con sicurezza. Ho visto organizzazioni ridurre il mean time to recovery (MTTR) da ore a minuti semplicemente avendo i cambi infrastrutturali versionati e reviewabili. Tuttavia, questo richiede disciplina: ogni cambiamento deve passare attraverso IaC, con zero modifiche manuali dalla console." },
        { type: 'code', language: 'hcl', code: `# Esempio: Modulo Terraform con policy checks integrate
module "secure_s3_bucket" {
  source = "git::https://github.com/company/terraform-modules//s3-bucket?ref=v2.1.0"
  
  bucket_name = "prod-artifacts-\${var.environment}"
  versioning  = true
  encryption  = "aws:kms"
  
  # Policy checks applicate via Sentinel
  tags = {
    Environment = var.environment
    CostCenter   = var.cost_center
    ManagedBy    = "terraform"
  }
}

# Policy Sentinel (applicata in Terraform Cloud)
# main = rule {
#   all s3_buckets as _, buckets {
#     all buckets as bucket {
#       bucket.versioning.enabled is true
#     }
#   }
# }` },
        { type: 'heading', level: 2, content: 'Confronto strumenti' },
        { type: 'paragraph', content: 'Terraform è multi-cloud e dispone di centinaia di provider. CloudFormation integra nativamente servizi AWS (Drift Detection, StackSets, IAM condition-level). Pulumi consente di scrivere infrastruttura con linguaggi reali, utile quando gli sviluppatori app partecipano alla definizione della piattaforma.' },
        { type: 'paragraph', content: 'Il punto di forza di Terraform risiede nel suo ecosistema: oltre 3.000 provider che coprono praticamente ogni cloud e piattaforma SaaS. Il linguaggio HCL è dichiarativo e leggibile, anche se può risultare verboso per logiche complesse. L\'integrazione nativa di CloudFormation con AWS significa accesso a funzionalità come StackSets per deployment multi-account e ChangeSets per preview dei cambi prima dell\'apply. L\'approccio programmatico di Pulumi brilla quando servono loop, condizionali o integrazione con codebase esistenti.' },
        { type: 'code', language: 'hcl', code: `# Terraform: Pattern di modulo riutilizzabile
# modules/vpc/main.tf
variable "environment" {
  type        = string
  description = "Nome ambiente (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "L'ambiente deve essere dev, staging o prod."
  }
}

variable "cidr_block" {
  type        = string
  description = "Blocco CIDR per VPC"
  default     = "10.0.0.0/16"
}

resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "vpc-\${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Utilizzo nel modulo root
module "production_vpc" {
  source = "./modules/vpc"
  
  environment = "prod"
  cidr_block  = "10.1.0.0/16"
}` },
        { type: 'heading', level: 2, content: 'Gestione dello Stato: Fondamento Critico' },
        { type: 'paragraph', content: 'La gestione dello stato è dove la maggior parte delle iniziative IaC inciampano. I file di stato locali vanno bene per imparare, ma la produzione richiede backend remoti con locking. Terraform Cloud, S3 + DynamoDB, o Pulumi ESC forniscono locking dello stato, versioning e encryption at rest. Senza locking, apply concorrenti possono corrompere lo stato, portando a ore di lavoro di recovery.' },
        { type: 'paragraph', content: 'Best practice: memorizzare lo stato remotamente dal primo giorno, abilitare versioning sul bucket dello stato e usare DynamoDB per il locking. Crittografare lo stato at rest usando KMS e restringere l\'accesso via policy IAM. Per setup multi-account, usare workspace Terraform Cloud o AWS Organizations con stato separato per account.' },
        { type: 'code', language: 'hcl', code: `# terraform.tf - Configurazione backend remoto
terraform {
  backend "s3" {
    bucket         = "company-terraform-state-prod"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:123456789012:key/abc123"
    dynamodb_table = "terraform-state-lock"
    
    # Prevenire sovrascritture accidentali
    versioning = true
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Snippet runbook recovery stato
# 1. Controllare DynamoDB per lock obsoleti: aws dynamodb scan --table-name terraform-state-lock
# 2. Se il lock è obsoleto (>1 ora), eliminare: aws dynamodb delete-item --table-name terraform-state-lock --key '{"LockID":{"S":"..."}}'
# 3. Ripristinare stato da S3 versioning se rilevata corruzione
# 4. Eseguire terraform refresh per sincronizzare con infrastruttura reale` },
        { type: 'heading', level: 2, content: 'Caso Studio: Terraform su Larga Scala' },
        { type: 'paragraph', content: 'Un\'azienda di viaggi con 40 squadre ha adottato Terraform usando un registry di moduli opinionated gestito dalla piattaforma. Ogni modulo aveva policy checks integrate e versioning semantico esposto. I rollout avvenivano dietro un singolo workflow GitHub Action "infra-apply", assicurando che locking dello stato e drift detection fossero centralizzati. Il risultato è stato un tempo mediano di provisioning di 12 minuti contro 2+ ore precedentemente con ticket.' },
        { type: 'paragraph', content: 'La chiave del loro successo è stato un registry centralizzato di moduli con versioning semantico. Ogni modulo (VPC, cluster ECS, istanza RDS) era versionato indipendentemente, permettendo alle squadre di adottare aggiornamenti al proprio ritmo. Policy-as-code via Sentinel preveniva errori comuni: nessun bucket S3 pubblico, tag richiesti, encryption at rest. Il team piattaforma manteneva un modulo "golden path" per ogni tipo di risorsa, riducendo la varianza attraverso 200+ microservizi.' },
        { type: 'heading', level: 2, content: 'Drift Detection e Remediation' },
        { type: 'paragraph', content: 'Il drift infrastrutturale—quando le risorse reali divergono dalle definizioni IaC—è inevitabile. Qualcuno fa un cambiamento manuale nella console, uno script modifica risorse direttamente, o uno strumento di terze parti aggiorna configurazioni. La drift detection deve essere automatizzata ed eseguita regolarmente, non solo durante i deployment.' },
        { type: 'paragraph', content: 'Terraform Cloud e AWS Config offrono entrambi drift detection. La chiave è decidere come gestire il drift: auto-remediation (rischioso), alert-only (sicuro ma richiede azione manuale), o remediation selettiva basata sul tipo di risorsa. Per produzione, raccomando alert-only con un processo di review settimanale. Risorse critiche (ruoli IAM, security groups) dovrebbero auto-remediare, mentre risorse compute possono essere riviste prima della remediation.' },
        { type: 'heading', level: 2, content: 'Testing del Codice Infrastrutturale' },
        { type: 'paragraph', content: 'Testare l\'IaC è non negoziabile per workload di produzione. Test unitari validano validazione variabili e logica moduli. Test di integrazione avviano risorse reali in ambienti effimeri, validano che funzionino correttamente, poi le distruggono. Test di compliance assicurano che policy di sicurezza siano applicate.' },
        { type: 'paragraph', content: 'Strumenti come Terratest (Go), Kitchen-Terraform (Ruby), e Pytest con moto (Python) abilitano test di integrazione. Il pattern: scrivere test che creano infrastruttura, validano che si comporti correttamente, poi la distruggono. Eseguire questi in CI/CD prima del merge su main. Per compliance, usare strumenti come Checkov, tfsec, o cfn-nag per scansionare misconfigurazioni di sicurezza.' },
        { type: 'heading', level: 2, content: 'Pattern Multi-Account e Multi-Region' },
        { type: 'paragraph', content: 'Organizzazioni enterprise richiedono strategie multi-account per isolamento, billing e compliance. Workspace Terraform, CloudFormation StackSets, e stack Pulumi abilitano gestione infrastruttura attraverso account. La chiave è una libreria moduli consistente e gestione stato centralizzata.' },
        { type: 'paragraph', content: 'Pattern: Usare AWS Organizations con account separati per ambiente (dev, staging, prod). Ogni account ha il proprio stato Terraform, ma i moduli sono condivisi via registry privato. Usare autenticazione assume-role per deploy da un account CI/CD centrale. Per multi-region, parametrizzare regioni nei moduli e deployare lo stesso stack a multiple regioni.' },
        { type: 'heading', level: 2, content: 'Linee guida di adozione' },
        { type: 'paragraph', content: 'Stabilite un core team e definite naming/tagging globali. Usate backend condivisi con locking. Automatizzate linting e testing (terraform validate, cfn-nag, pulumi preview). Documentate come ripristinare uno stato corrotto e create checklist per onboarding dei nuovi team. La maturità IaC si misura dalla velocità con cui potete smontare e ricreare un ambiente completo senza aprire ticket.' },
        { type: 'paragraph', content: 'Il percorso di migrazione conta. Non cercate di convertire tutto in una volta. Iniziate con infrastruttura net-new, poi migrate gradualmente risorse esistenti usando terraform import o CloudFormation drift detection. Create un modulo "golden path" per ogni tipo di risorsa, poi richiedete che tutta la nuova infrastruttura usi questi moduli. Nel tempo, i team migreranno naturalmente per evitare di mantenere codice custom.' },
        { type: 'paragraph', content: 'Misurate il successo con metriche: tempo per provisionare ambienti (target: <15 minuti), lead time cambi infrastrutturali (target: <1 giorno), e incidenti drift (target: <1 al mese). Queste metriche giustificano investimenti continui e aiutano a identificare colli di bottiglia nel workflow IaC.' },
      ],
    },
  },
  'github-actions-vs-vercel-ci': {
    en: {
      title: 'CI/CD Face-off: GitHub Actions vs Vercel',
      description: "GitHub Actions vs Vercel, minus the tribalism. Capabilities, DX, pricing, and who actually wins each scenario — the answer is 'it depends', but not in the useless way.",
      content: [
        { type: 'paragraph', content: "Every GitHub Actions vs Vercel debate opens with price or one pet feature and closes in tribalism. The useful question is quieter: what workflow are you actually optimising for? I've run monorepos with dozens of microservices on Actions and shipped Next.js platforms that never left Vercel — both were the right call, for completely different reasons. After managing CI/CD for fintech, e-commerce, and SaaS teams pushing thousands of deploys a month, here are the patterns that deliver velocity, reliability, and cost efficiency without starting a holy war." },
        { type: 'heading', level: 2, content: 'Capabilities & Developer Experience' },
        { type: 'paragraph', content: 'GHA provides building blocks: reusable workflows, matrix builds, custom actions, self-hosted runners, OIDC federation with clouds, environment protection rules. Vercel focuses on zero-config DX: automatic preview URLs per PR, built-in image optimisation, Edge Functions, and env manager. If you need to run Terraform, build Docker images, and publish Helm charts, Actions is your friend. If you ship serverless frontends and want deploy-to-preview in seconds, Vercel is unbeatable.' },
        { type: 'paragraph', content: 'GitHub Actions excels at complex orchestration. You can define multi-stage pipelines with conditional logic, parallel jobs, and dependencies between steps. The YAML syntax is verbose but powerful—you can express virtually any CI/CD pattern. Vercel\'s strength is abstraction: it detects your framework (Next.js, Remix, Astro), configures build settings automatically, and generates preview URLs without configuration. This simplicity comes at the cost of flexibility: you can\'t easily customize build steps or run arbitrary scripts.' },
        { type: 'code', language: 'yaml', code: `# GitHub Actions: Complex multi-service pipeline
name: Full Stack CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '20.x'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api, worker, scheduler]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: \${{ matrix.service }}/package-lock.json
      
      - name: Install dependencies
        working-directory: \${{ matrix.service }}
        run: npm ci
      
      - name: Run linter
        working-directory: \${{ matrix.service }}
        run: npm run lint
      
      - name: Run tests
        working-directory: \${{ matrix.service }}
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: \${{ matrix.service }}/coverage/lcov.info

  build-containers:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            \${{ secrets.AWS_ECR_REGISTRY }}/api:\${{ github.sha }}
            \${{ secrets.AWS_ECR_REGISTRY }}/api:latest
          cache-from: type=registry,ref=\${{ secrets.AWS_ECR_REGISTRY }}/api:buildcache
          cache-to: type=registry,ref=\${{ secrets.AWS_ECR_REGISTRY }}/api:buildcache,mode=max

  deploy-infrastructure:
    needs: build-containers
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0
      
      - name: Terraform Plan
        working-directory: infrastructure
        run: terraform plan -out=tfplan
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        working-directory: infrastructure
        run: terraform apply -auto-approve tfplan

  deploy-services:
    needs: [build-containers, deploy-infrastructure]
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api, worker]
    steps:
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: \${{ matrix.service }}/task-definition.json
          service: \${{ matrix.service }}-service
          cluster: production-cluster
          wait-for-service-stability: true` },
        { type: 'code', language: 'yaml', code: `# Vercel: Zero-config Next.js deployment
# vercel.json (optional - Vercel auto-detects most settings)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "API_KEY": "@api-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}

# That's it. Every PR gets a preview URL automatically.
# No YAML, no configuration needed for standard Next.js apps.` },
        { type: 'heading', level: 2, content: 'Real-World Use Cases & Case Studies' },
        { type: 'paragraph', content: 'Case study #1: A fintech startup with a monorepo containing 15 microservices (Node.js APIs, Python data pipelines, Terraform infrastructure) chose GitHub Actions. They needed to run integration tests across services, build Docker images for each service, deploy to ECS, and run infrastructure updates. Actions\' matrix builds and job dependencies enabled parallel testing while maintaining service deployment order. Cost: ~$200/month for 2,000 build minutes. The same setup on Vercel would require custom build scripts and wouldn\'t support Docker builds natively.' },
        { type: 'paragraph', content: 'Case study #2: A marketing agency builds client websites using Next.js. They deploy 50+ sites monthly, each requiring instant preview URLs for client approval. Vercel\'s automatic preview generation and Edge Functions for A/B testing made it the clear choice. Build time: 2-3 minutes per site. Preview URLs are generated automatically on every PR. Cost: $20/month per team member plus usage. Migrating to Actions would require custom preview URL generation, S3/CloudFront setup, and significantly more configuration.' },
        { type: 'code', language: 'yaml', code: `# GitHub Actions: Self-hosted runners for cost optimization
name: Build with Self-Hosted Runner
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: self-hosted  # EC2 spot instance
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            \${{ runner.os }}-node-
      
      - name: Install and build
        run: |
          npm ci
          npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

# Cost optimization: Self-hosted runners on EC2 spot instances
# - GitHub Actions: $0.008/minute for Linux
# - EC2 t3.medium spot: ~$0.01/hour = $0.00017/minute
# Savings: ~95% for long-running builds` },
        { type: 'heading', level: 2, content: 'Integrations, Performance, and Cost' },
        { type: 'paragraph', content: 'Both integrate with GitHub repos. Actions can also run from GitLab/Bitbucket using webhooks. Actions billing is per runner-minute (with multipliers per OS). Optimisation trick: attach ephemeral EC2 spot instances as self-hosted runners for GPU or ARM workloads. Vercel bills build minutes plus runtime resources, and the hosting bill is tied to the same platform, simplifying procurement for frontend teams.' },
        { type: 'paragraph', content: 'GitHub Actions pricing: $0.008/minute for Linux, $0.016/minute for Windows, $0.08/minute for macOS. Free tier: 2,000 minutes/month for private repos. Self-hosted runners are free but require infrastructure management. Vercel pricing: Free tier includes 100GB bandwidth, then $20/user/month for Pro (unlimited bandwidth, team features). Enterprise pricing is custom. Build minutes are included in Pro plan; additional minutes cost $40 per 1,000 minutes.' },
        { type: 'paragraph', content: 'Performance comparison: GitHub Actions runners are ephemeral—each job starts fresh, which ensures consistency but adds startup overhead. Vercel\'s build cache is more aggressive, often resulting in faster incremental builds. For monorepos, Actions can parallelize jobs across services, while Vercel builds sequentially unless you configure build filters.' },
        { type: 'code', language: 'yaml', code: `# GitHub Actions: OIDC authentication for AWS (no long-lived credentials)
name: Deploy to AWS
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync ./dist s3://my-bucket --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id E1234567890 \
            --paths "/*"

# Security benefit: No AWS access keys stored in secrets
# Uses OIDC federation - credentials expire after job completion` },
        { type: 'code', language: 'javascript', code: `// Vercel: Edge Functions for A/B testing
// api/ab-test.js
export default async function handler(req, res) {
  const variant = req.cookies.variant || (Math.random() > 0.5 ? 'A' : 'B');
  
  // Set cookie for consistent experience
  res.setHeader('Set-Cookie', \`variant=\${variant}; Path=/; Max-Age=86400\`);
  
  // Return variant-specific content
  const content = {
    A: { headline: 'Welcome to Our Site', cta: 'Get Started' },
    B: { headline: 'Transform Your Business', cta: 'Start Free Trial' }
  };
  
  return res.json(content[variant]);
}

// Deployed automatically to Edge Network
// Zero configuration, runs at <50ms latency globally` },
        { type: 'heading', level: 2, content: 'Advanced Patterns & Optimizations' },
        { type: 'paragraph', content: 'GitHub Actions: Use matrix builds for testing across multiple Node.js versions, operating systems, or service combinations. Implement job dependencies to ensure services deploy in order. Use artifacts to pass build outputs between jobs. Leverage reusable workflows to avoid YAML duplication across repositories. For monorepos, use path filters to trigger jobs only when relevant files change.' },
        { type: 'paragraph', content: 'Vercel: Configure build filters to only rebuild changed packages in monorepos. Use Edge Middleware for request rewriting, authentication, and A/B testing. Leverage Incremental Static Regeneration (ISR) for dynamic content that doesn\'t need real-time updates. Use Vercel Analytics to track Core Web Vitals and identify performance bottlenecks.' },
        { type: 'code', language: 'yaml', code: `# GitHub Actions: Monorepo optimization with path filters
name: Monorepo CI
on:
  push:
    paths:
      - 'services/api/**'
      - 'services/shared/**'
      - '.github/workflows/**'

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      api: \${{ steps.filter.outputs.api }}
      worker: \${{ steps.filter.outputs.worker }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            api:
              - 'services/api/**'
              - 'services/shared/**'
            worker:
              - 'services/worker/**'
              - 'services/shared/**'

  test-api:
    needs: detect-changes
    if: needs.detect-changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd services/api && npm test

  test-worker:
    needs: detect-changes
    if: needs.detect-changes.outputs.worker == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd services/worker && npm test` },
        { type: 'code', language: 'typescript', code: `// Vercel: Edge Middleware for request handling
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // A/B testing
  const variant = request.cookies.get('variant')?.value || 
    (Math.random() > 0.5 ? 'A' : 'B');
  
  // Geo-based routing
  const country = request.geo?.country || 'US';
  if (country === 'GB') {
    return NextResponse.rewrite(new URL('/uk', request.url));
  }
  
  // Authentication check
  const token = request.cookies.get('auth-token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Add custom headers
  const response = NextResponse.next();
  response.headers.set('X-Country', country);
  response.headers.set('X-Variant', variant);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// Runs at Edge locations globally, <50ms latency` },
        { type: 'heading', level: 2, content: 'Hybrid Approaches: Best of Both Worlds' },
        { type: 'paragraph', content: 'Many organizations use both platforms: Actions for backend CI/CD and infrastructure deployments, Vercel for frontend previews and hosting. The pattern: run tests and build backend services in Actions, then trigger Vercel deployment via webhook after backend tests pass. This keeps ownership clear: platform team owns Actions workflows, frontend team owns Vercel configuration.' },
        { type: 'paragraph', content: 'Example workflow: Backend API changes trigger Actions workflow that runs tests, builds Docker images, and deploys to ECS. On success, Actions calls Vercel\'s deployment API to rebuild the frontend (which consumes the updated API). Frontend PRs trigger Vercel previews immediately, while backend changes require full Actions pipeline before frontend rebuild.' },
        { type: 'code', language: 'yaml', code: `# GitHub Actions: Trigger Vercel after backend deployment
name: Full Stack Deployment
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'frontend/**'

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Build and deploy backend
        run: |
          cd backend
          docker build -t api:latest .
          # Deploy to ECS...
      
      - name: Trigger Vercel deployment
        run: |
          curl -X POST https://api.vercel.com/v1/integrations/deploy/your-project-id \
            -H "Authorization: Bearer \${{ secrets.VERCEL_TOKEN }}" \
            -d '{"gitRef": "\${{ github.sha }}"}'

  deploy-frontend:
    if: contains(github.event.head_commit.message, '[deploy-frontend]')
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel
        run: |
          curl -X POST https://api.vercel.com/v1/integrations/deploy/your-project-id \
            -H "Authorization: Bearer \${{ secrets.VERCEL_TOKEN }}"` },
        { type: 'heading', level: 2, content: 'Choosing the Right Tool' },
        { type: 'paragraph', content: 'Pick Actions when you own backend APIs, Kafka pipelines, or IaC codebases. It shines with policy checks, approvals, and multi-cloud deployments. Choose Vercel when the scope is mostly frontend/serverless and you want instant previews for stakeholders. Many organisations run both: Actions for heavy CI, Vercel for DX-friendly deployments of the frontend. Use webhooks to chain the two (Actions notifies Vercel after backend tests pass), keeping ownership clear.' },
        { type: 'paragraph', content: 'Decision matrix: If you need Docker builds, multi-cloud deployments, or complex orchestration → GitHub Actions. If you\'re building Next.js/React sites and want zero-config previews → Vercel. If you have both backend and frontend → use both, with Actions for backend CI/CD and Vercel for frontend hosting. Cost consideration: Actions is cheaper for high-volume builds (especially with self-hosted runners), Vercel is more cost-effective when hosting is included in the same platform.' },
        { type: 'paragraph', content: 'Migration path: If starting with Vercel and needing more control, you can export build artifacts and deploy them via Actions to S3/CloudFront. If starting with Actions and wanting faster frontend previews, you can add Vercel as a secondary deployment target. The key is not forcing one tool to do everything—use each platform for what it does best.' },
      ],
    },
    it: {
      title: 'GitHub Actions vs Vercel: confronto CI/CD',
      description: "GitHub Actions vs Vercel, senza tribalismo. Funzionalità, DX, costi e chi vince davvero in ogni scenario—la risposta è 'dipende', ma non nel modo inutile.",
      content: [
        { type: 'paragraph', content: "Ogni dibattito GitHub Actions vs Vercel parte dal prezzo o da una feature del cuore e finisce in tribalismo. La domanda utile è più sommessa: quale workflow stai davvero ottimizzando? Ho gestito monorepo con decine di microservizi su Actions e messo in produzione piattaforme Next.js che non hanno mai lasciato Vercel—entrambe scelte giuste, per motivi completamente diversi. Dopo aver gestito CI/CD per team fintech, e-commerce e SaaS che spingono migliaia di deploy al mese, ecco i pattern che garantiscono velocità, affidabilità ed efficienza dei costi senza scatenare una guerra di religione." },
        { type: 'heading', level: 2, content: 'Funzionalità e DX' },
        { type: 'paragraph', content: 'Actions mette a disposizione workflow riutilizzabili, matrix build, runner self-hosted e integrazione OIDC con i cloud provider. Potete usare YAML per definire pipeline elaborate, includere Terraform, build Docker e deployment multi-cluster. Vercel privilegia semplicità e velocità: ogni push genera una preview, le Edge Function sono gestite e l\'hosting è incluso.' },
        { type: 'paragraph', content: 'GitHub Actions eccelle nell\'orchestrazione complessa. Potete definire pipeline multi-stage con logica condizionale, job paralleli e dipendenze tra step. La sintassi YAML è verbosa ma potente—potete esprimere praticamente qualsiasi pattern CI/CD. Il punto di forza di Vercel è l\'astrazione: rileva il vostro framework (Next.js, Remix, Astro), configura le impostazioni di build automaticamente e genera URL di preview senza configurazione. Questa semplicità ha un costo in flessibilità: non potete facilmente personalizzare step di build o eseguire script arbitrari.' },
        { type: 'heading', level: 2, content: 'Casi d\'Uso Reali e Case Study' },
        { type: 'paragraph', content: 'Caso studio #1: Una startup fintech con un monorepo contenente 15 microservizi (API Node.js, pipeline dati Python, infrastruttura Terraform) ha scelto GitHub Actions. Avevano bisogno di eseguire test di integrazione tra servizi, buildare immagini Docker per ogni servizio, deployare su ECS ed eseguire aggiornamenti infrastrutturali. I matrix build e le dipendenze job di Actions hanno abilitato test paralleli mantenendo l\'ordine di deployment dei servizi. Costo: ~$200/mese per 2.000 minuti di build. Lo stesso setup su Vercel richiederebbe script di build custom e non supporterebbe build Docker nativamente.' },
        { type: 'paragraph', content: 'Caso studio #2: Un\'agenzia di marketing costruisce siti web client usando Next.js. Deployano 50+ siti mensilmente, ognuno richiedendo URL di preview istantanei per approvazione client. La generazione automatica di preview di Vercel e le Edge Functions per A/B testing l\'hanno resa la scelta chiara. Tempo di build: 2-3 minuti per sito. URL di preview sono generati automaticamente su ogni PR. Costo: $20/mese per membro team più utilizzo. Migrare ad Actions richiederebbe generazione custom di URL preview, setup S3/CloudFront e significativamente più configurazione.' },
        { type: 'heading', level: 2, content: 'Performance e costi' },
        { type: 'paragraph', content: 'Actions fattura a minuti di runner. Per workload pesanti conviene usare runner dedicati su EC2 spot, mantenendo il controllo sui costi. Vercel fattura minuti di build più risorse runtime; per progetti puramente frontend il TCO resta basso perché CI e hosting sono nello stesso posto. Per backend CPU-intensive è più vantaggioso Actions + infrastruttura custom.' },
        { type: 'paragraph', content: 'Prezzi GitHub Actions: $0.008/minuto per Linux, $0.016/minuto per Windows, $0.08/minuto per macOS. Tier gratuito: 2.000 minuti/mese per repo privati. Runner self-hosted sono gratuiti ma richiedono gestione infrastruttura. Prezzi Vercel: Tier gratuito include 100GB bandwidth, poi $20/utente/mese per Pro (bandwidth illimitato, funzionalità team). Prezzi Enterprise sono custom. Minuti di build sono inclusi nel piano Pro; minuti aggiuntivi costano $40 per 1.000 minuti.' },
        { type: 'paragraph', content: 'Confronto performance: I runner GitHub Actions sono effimeri—ogni job parte da zero, il che garantisce consistenza ma aggiunge overhead di startup. La cache di build di Vercel è più aggressiva, spesso risultando in build incrementali più veloci. Per monorepo, Actions può parallelizzare job tra servizi, mentre Vercel builda sequenzialmente a meno che non configuriate filtri di build.' },
        { type: 'heading', level: 2, content: 'Pattern Avanzati e Ottimizzazioni' },
        { type: 'paragraph', content: 'GitHub Actions: Usate matrix build per testare attraverso multiple versioni Node.js, sistemi operativi o combinazioni servizi. Implementate dipendenze job per assicurare che i servizi deployino in ordine. Usate artifact per passare output di build tra job. Sfruttate workflow riutilizzabili per evitare duplicazione YAML tra repository. Per monorepo, usate path filter per triggerare job solo quando file rilevanti cambiano.' },
        { type: 'paragraph', content: 'Vercel: Configurate filtri di build per rebuildare solo package cambiati in monorepo. Usate Edge Middleware per rewriting richieste, autenticazione e A/B testing. Sfruttate Incremental Static Regeneration (ISR) per contenuto dinamico che non necessita aggiornamenti real-time. Usate Vercel Analytics per tracciare Core Web Vitals e identificare colli di bottiglia performance.' },
        { type: 'heading', level: 2, content: 'Approcci Ibridi: Il Meglio di Entrambi i Mondi' },
        { type: 'paragraph', content: 'Molte organizzazioni usano entrambe le piattaforme: Actions per CI/CD backend e deployment infrastruttura, Vercel per preview frontend e hosting. Il pattern: eseguite test e build servizi backend in Actions, poi triggerate deployment Vercel via webhook dopo che i test backend passano. Questo mantiene ownership chiara: team piattaforma possiede workflow Actions, team frontend possiede configurazione Vercel.' },
        { type: 'paragraph', content: 'Esempio workflow: Cambi API backend triggerano workflow Actions che esegue test, builda immagini Docker e deploya su ECS. Al successo, Actions chiama l\'API deployment di Vercel per rebuildare il frontend (che consuma l\'API aggiornata). PR frontend triggerano preview Vercel immediatamente, mentre cambi backend richiedono pipeline Actions completa prima del rebuild frontend.' },
        { type: 'heading', level: 2, content: 'Linee guida di scelta' },
        { type: 'paragraph', content: 'Scegliete Actions se dovete orchestrare backend, container e IaC, oppure se avete policy di approvazione e ambienti differenziati. Scegliete Vercel se vivete in Next.js e volete un\'unica piattaforma per build, deploy e hosting. Non è raro usare entrambi: Actions come "motore CI" e Vercel come layer di distribuzione per l\'interfaccia.' },
        { type: 'paragraph', content: 'Matrice decisionale: Se avete bisogno di build Docker, deployment multi-cloud o orchestrazione complessa → GitHub Actions. Se costruite siti Next.js/React e volete preview zero-config → Vercel. Se avete sia backend che frontend → usate entrambi, con Actions per CI/CD backend e Vercel per hosting frontend. Considerazione costi: Actions è più economico per build ad alto volume (specialmente con runner self-hosted), Vercel è più cost-effective quando l\'hosting è incluso nella stessa piattaforma.' },
        { type: 'paragraph', content: 'Percorso migrazione: Se iniziate con Vercel e avete bisogno di più controllo, potete esportare artifact di build e deployarli via Actions su S3/CloudFront. Se iniziate con Actions e volete preview frontend più veloci, potete aggiungere Vercel come target deployment secondario. La chiave è non forzare uno strumento a fare tutto—usate ogni piattaforma per quello che fa meglio.' },
      ],
    },
  },
  'kubernetes-autoscaling-hpa-keda': {
    en: {
      title: 'Kubernetes Autoscaling in Production: HPA, KEDA, and Cluster Autoscaler',
      description: 'How the three autoscaling layers fit together, which metrics actually matter, and the pitfalls that cause thrash, cold starts, and surprise bills.',
      content: [
        { type: 'paragraph', content: 'Autoscaling is where teams either save money or set it on fire. Kubernetes ships three independent controllers operating at different layers, and the common mistake is treating them as a single knob. After tuning autoscaling for platforms handling unpredictable traffic—from Black Friday spikes to bursty event-driven jobs—here is how the pieces fit and where they bite.' },
        { type: 'heading', level: 2, content: 'The three layers' },
        { type: 'paragraph', content: 'The Horizontal Pod Autoscaler (HPA) changes the replica count of a workload. The Vertical Pod Autoscaler (VPA) adjusts CPU/memory requests. The Cluster Autoscaler (or Karpenter) adds and removes nodes when pods cannot be scheduled. Compose them deliberately: run HPA and VPA on the same resource and they will fight over the same signal.' },
        { type: 'heading', level: 2, content: 'HPA beyond CPU' },
        { type: 'paragraph', content: 'CPU-based HPA is the default and almost never the right SLI. Latency-sensitive services should scale on requests-per-second or queue depth via custom/external metrics (Prometheus Adapter). Target a realistic utilization (60–70%) so there is headroom during the ramp, and always set sensible min/max replicas.' },
        { type: 'code', language: 'yaml', code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "50"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60` },
        { type: 'heading', level: 2, content: 'Event-driven scaling with KEDA' },
        { type: 'paragraph', content: 'For queue workers, Kafka consumers, or bursty jobs, KEDA scales on the actual backlog and can scale to zero when idle—something stock HPA cannot do. KEDA creates an HPA under the hood but feeds it external scalers (SQS, Kafka, Prometheus, cron).' },
        { type: 'code', language: 'yaml', code: `apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker
spec:
  scaleTargetRef:
    name: worker
  minReplicaCount: 0
  maxReplicaCount: 30
  cooldownPeriod: 120
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.eu-west-1.amazonaws.com/123456789/jobs
        queueLength: "20"
        awsRegion: eu-west-1` },
        { type: 'heading', level: 2, content: 'Cluster Autoscaler, Karpenter, and node pressure' },
        { type: 'paragraph', content: 'Replica scaling is useless if nodes cannot host the pods. Cluster Autoscaler scales fixed node groups; Karpenter provisions right-sized nodes just-in-time and consolidates underused ones. Pair this with PodDisruptionBudgets and topology spread constraints so scaling events never violate availability.' },
        { type: 'heading', level: 2, content: 'Avoiding thrash and cold starts' },
        { type: 'paragraph', content: 'Flapping (rapid scale up/down) burns money and hurts latency. Use HPA stabilization windows and scale-down policies, keep readiness probes honest so new pods do not receive traffic before they are warm, and pre-provision a small buffer for spiky workloads. Measure the cost of a cold start before optimizing for it—premature warm pools are their own waste.' },
      ],
    },
    it: {
      title: 'Autoscaling Kubernetes in produzione: HPA, KEDA e Cluster Autoscaler',
      description: 'Come si incastrano i tre livelli di autoscaling, quali metriche contano davvero e le trappole che causano thrash, cold start e bollette a sorpresa.',
      content: [
        { type: 'paragraph', content: 'L\'autoscaling è il punto in cui i team risparmiano o bruciano soldi. Kubernetes offre tre controller indipendenti che operano su livelli diversi, e l\'errore comune è trattarli come un\'unica manopola. Dopo aver messo a punto l\'autoscaling per piattaforme con traffico imprevedibile—dai picchi del Black Friday ai job event-driven a raffica—ecco come si incastrano i pezzi e dove mordono.' },
        { type: 'heading', level: 2, content: 'I tre livelli' },
        { type: 'paragraph', content: 'L\'Horizontal Pod Autoscaler (HPA) cambia il numero di repliche di un workload. Il Vertical Pod Autoscaler (VPA) regola le request di CPU/memoria. Il Cluster Autoscaler (o Karpenter) aggiunge e rimuove nodi quando i pod non possono essere schedulati. Vanno composti con criterio: se HPA e VPA agiscono sulla stessa risorsa, litigano sullo stesso segnale.' },
        { type: 'heading', level: 2, content: 'HPA oltre la CPU' },
        { type: 'paragraph', content: 'L\'HPA basato su CPU è il default e quasi mai la SLI giusta. I servizi sensibili alla latenza dovrebbero scalare su richieste-al-secondo o profondità della coda tramite metriche custom/esterne (Prometheus Adapter). Puntate a un\'utilizzazione realistica (60–70%) per avere margine durante la salita, e definite sempre min/max repliche sensati.' },
        { type: 'code', language: 'yaml', code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "50"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300` },
        { type: 'heading', level: 2, content: 'Scaling event-driven con KEDA' },
        { type: 'paragraph', content: 'Per worker di code, consumer Kafka o job a raffica, KEDA scala sul backlog reale e può scalare a zero quando è idle—cosa che l\'HPA standard non può fare. KEDA crea un HPA sotto il cofano ma lo alimenta con scaler esterni (SQS, Kafka, Prometheus, cron).' },
        { type: 'code', language: 'yaml', code: `apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker
spec:
  scaleTargetRef:
    name: worker
  minReplicaCount: 0
  maxReplicaCount: 30
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.eu-west-1.amazonaws.com/123456789/jobs
        queueLength: "20"
        awsRegion: eu-west-1` },
        { type: 'heading', level: 2, content: 'Cluster Autoscaler, Karpenter e pressione sui nodi' },
        { type: 'paragraph', content: 'Scalare le repliche è inutile se i nodi non possono ospitare i pod. Il Cluster Autoscaler scala node group fissi; Karpenter provisiona nodi della dimensione giusta just-in-time e consolida quelli sottoutilizzati. Abbinatelo a PodDisruptionBudget e topology spread constraint così gli eventi di scaling non violano mai la disponibilità.' },
        { type: 'heading', level: 2, content: 'Evitare thrash e cold start' },
        { type: 'paragraph', content: 'Il flapping (scale up/down rapidi) brucia soldi e peggiora la latenza. Usate le stabilization window dell\'HPA e le policy di scale-down, mantenete readiness probe oneste così i nuovi pod non ricevono traffico prima di essere caldi, e pre-provisionate un piccolo buffer per i workload a raffica. Misurate il costo di un cold start prima di ottimizzarlo—i warm pool prematuri sono a loro volta uno spreco.' },
      ],
    },
  },
  'llmops-serving-llms-in-production': {
    en: {
      title: 'LLMOps: Serving LLMs in Production Without Burning the Budget',
      description: 'Model serving patterns, GPU utilization, caching, and evals for LLM workloads—lessons from running inference where every millisecond and every token has a price.',
      content: [
        { type: 'paragraph', content: 'Getting an LLM to answer in a notebook is easy. Serving it to thousands of users with predictable latency and a bill your CFO tolerates is the hard part. LLMOps is DevOps with two new variables: GPUs are scarce and expensive, and quality is non-deterministic. Here are the patterns that kept both under control in production.' },
        { type: 'heading', level: 2, content: 'Self-host or call an API?' },
        { type: 'paragraph', content: 'Managed APIs (Bedrock, OpenAI, Anthropic) win on time-to-market and elasticity; self-hosting wins on unit cost at high, steady volume and on data residency. The break-even is usually higher than teams expect: unless you are saturating a GPU most of the day, an API is cheaper. Decide with a spreadsheet, not vibes.' },
        { type: 'heading', level: 2, content: 'Throughput: batching and the KV cache' },
        { type: 'paragraph', content: 'If you self-host, throughput is everything. Continuous batching (vLLM, TGI) and prefix/KV caching turn a GPU that served 3 requests/second into one that serves 30. Tune max sequence count and GPU memory utilization to your context length; long contexts eat VRAM fast.' },
        { type: 'code', language: 'bash', code: `python -m vllm.entrypoints.openai.api_server \\
  --model mistralai/Mistral-7B-Instruct-v0.3 \\
  --dtype bfloat16 \\
  --max-num-seqs 256 \\
  --gpu-memory-utilization 0.90 \\
  --enable-prefix-caching` },
        { type: 'heading', level: 2, content: 'Semantic caching cuts cost more than any GPU' },
        { type: 'paragraph', content: 'A large share of production traffic is near-duplicate. A semantic cache—embed the prompt, look up similar prior prompts, return the cached completion above a similarity threshold—routinely deflects 30–50% of calls. That is the single highest-ROI optimization in most LLM systems, and it also improves p95 latency.' },
        { type: 'heading', level: 2, content: 'Guardrails and continuous evals' },
        { type: 'paragraph', content: 'Non-deterministic output needs a test harness. Maintain a golden dataset and run automated evals (exact-match, LLM-as-judge, or task-specific metrics) on every prompt or model change in CI. Add input/output guardrails for PII, injection, and toxicity. Treat prompts and model versions as versioned artifacts—a prompt change is a deploy.' },
        { type: 'heading', level: 2, content: 'Observability and cost per token' },
        { type: 'paragraph', content: 'Log tokens-in, tokens-out, model, latency, and cache-hit per request, and chart cost-per-request by feature. Trace multi-step chains so you can see which tool call or retrieval is slow. Without token-level observability you cannot answer "why did this month cost double?"—and with LLMs, it always eventually does.' },
      ],
    },
    it: {
      title: 'LLMOps: servire LLM in produzione senza bruciare il budget',
      description: 'Pattern di serving, utilizzo GPU, caching ed eval per workload LLM—lezioni dal far girare inference dove ogni millisecondo e ogni token ha un prezzo.',
      content: [
        { type: 'paragraph', content: 'Far rispondere un LLM in un notebook è facile. Servirlo a migliaia di utenti con latenza prevedibile e una bolletta che il CFO tollera è la parte difficile. LLMOps è DevOps con due nuove variabili: le GPU sono scarse e costose, e la qualità è non deterministica. Ecco i pattern che hanno tenuto entrambe sotto controllo in produzione.' },
        { type: 'heading', level: 2, content: 'Self-host o chiamata API?' },
        { type: 'paragraph', content: 'Le API gestite (Bedrock, OpenAI, Anthropic) vincono su time-to-market ed elasticità; il self-hosting vince sul costo unitario ad alto volume costante e sulla data residency. Il break-even è di solito più alto di quanto i team pensino: se non saturate una GPU per gran parte della giornata, un\'API costa meno. Decidete con un foglio di calcolo, non a sensazione.' },
        { type: 'heading', level: 2, content: 'Throughput: batching e KV cache' },
        { type: 'paragraph', content: 'Se fate self-host, il throughput è tutto. Il continuous batching (vLLM, TGI) e il caching di prefix/KV trasformano una GPU che serviva 3 richieste/secondo in una che ne serve 30. Regolate il numero massimo di sequenze e l\'utilizzo di memoria GPU in base alla lunghezza di contesto; i contesti lunghi divorano VRAM.' },
        { type: 'code', language: 'bash', code: `python -m vllm.entrypoints.openai.api_server \\
  --model mistralai/Mistral-7B-Instruct-v0.3 \\
  --dtype bfloat16 \\
  --max-num-seqs 256 \\
  --gpu-memory-utilization 0.90 \\
  --enable-prefix-caching` },
        { type: 'heading', level: 2, content: 'La cache semantica taglia i costi più di qualsiasi GPU' },
        { type: 'paragraph', content: 'Buona parte del traffico in produzione è quasi-duplicato. Una cache semantica—embeddi il prompt, cerchi prompt simili precedenti, restituisci il completamento in cache sopra una soglia di similarità—devia regolarmente il 30–50% delle chiamate. È l\'ottimizzazione a più alto ROI nella maggior parte dei sistemi LLM, e migliora anche la latenza p95.' },
        { type: 'heading', level: 2, content: 'Guardrail ed eval continue' },
        { type: 'paragraph', content: 'L\'output non deterministico richiede un test harness. Mantenete un golden dataset ed eseguite eval automatiche (exact-match, LLM-as-judge o metriche task-specific) a ogni cambio di prompt o modello in CI. Aggiungete guardrail su input/output per PII, injection e tossicità. Trattate prompt e versioni di modello come artefatti versionati—un cambio di prompt è un deploy.' },
        { type: 'heading', level: 2, content: 'Osservabilità e costo per token' },
        { type: 'paragraph', content: 'Loggate token-in, token-out, modello, latenza e cache-hit per richiesta, e tracciate il costo-per-richiesta per feature. Tracciate le catene multi-step per vedere quale tool call o retrieval è lento. Senza osservabilità a livello di token non potete rispondere a "perché questo mese è costato il doppio?"—e con gli LLM, prima o poi succede sempre.' },
      ],
    },
  },
  'slo-driven-observability': {
    en: {
      title: 'SLO-Driven Observability: Error Budgets Over Vanity Dashboards',
      description: 'Trading 200 dashboards nobody reads for a handful of SLOs that drive decisions—with Prometheus recording rules and multi-window burn-rate alerts.',
      content: [
        { type: 'paragraph', content: 'Most "observability" is a wall of graphs that light up red at 3am and tell you nothing actionable. SLOs flip the model: define the reliability your users actually need, measure how much of that budget you are spending, and alert only when the budget is burning fast enough to matter. Fewer pages, better sleep, clearer decisions.' },
        { type: 'heading', level: 2, content: 'Pick SLIs your users feel' },
        { type: 'paragraph', content: 'A good SLI is a ratio of good events to total events, measured where the user experiences it. Availability = successful requests / total requests. Latency = requests faster than a threshold / total. Avoid infrastructure proxies (CPU, memory) as SLIs—they are causes, not symptoms. Start with two or three SLOs per critical service, not twenty.' },
        { type: 'heading', level: 2, content: 'Recording rules for SLOs' },
        { type: 'paragraph', content: 'Compute the error ratio once with recording rules so dashboards and alerts share the same source of truth and stay cheap to query at scale.' },
        { type: 'code', language: 'yaml', code: `groups:
  - name: slo-api-availability
    rules:
      - record: job:http_requests:rate5m
        expr: sum(rate(http_requests_total{job="api"}[5m]))
      - record: job:http_errors:rate5m
        expr: sum(rate(http_requests_total{job="api",code=~"5.."}[5m]))
      - record: job:slo_error_ratio:ratio5m
        expr: job:http_errors:rate5m / job:http_requests:rate5m` },
        { type: 'heading', level: 2, content: 'Multi-window, multi-burn-rate alerts' },
        { type: 'paragraph', content: 'The Google SRE pattern: page only when a short window AND a long window both show fast budget burn. This catches real incidents quickly while ignoring brief blips. For a 99.9% SLO, a 14.4x burn rate exhausts 2% of the monthly budget in one hour—page-worthy.' },
        { type: 'code', language: 'yaml', code: `- alert: ErrorBudgetBurnFast
  expr: |
    job:slo_error_ratio:ratio5m > (14.4 * 0.001)
    and
    job:slo_error_ratio:ratio1h > (14.4 * 0.001)
  for: 2m
  labels:
    severity: page
  annotations:
    summary: "API burning the 99.9% error budget fast (5m and 1h)"` },
        { type: 'heading', level: 2, content: 'The error budget policy' },
        { type: 'paragraph', content: 'The SLO is only useful if the budget has consequences. Agree in advance: while budget remains, ship features fast; when it is exhausted, freeze risky changes and prioritize reliability work. That written policy turns observability from a dashboard into an engineering decision framework.' },
      ],
    },
    it: {
      title: 'Osservabilità guidata dagli SLO: error budget invece di dashboard di vanità',
      description: 'Scambiare 200 dashboard che nessuno legge con pochi SLO che guidano le decisioni—con recording rule Prometheus e alert multi-window sul burn-rate.',
      content: [
        { type: 'paragraph', content: 'Gran parte dell\'"osservabilità" è un muro di grafici che diventano rossi alle 3 di notte senza dire nulla di azionabile. Gli SLO ribaltano il modello: definisci l\'affidabilità di cui gli utenti hanno davvero bisogno, misuri quanto budget stai consumando, e alerti solo quando il budget brucia abbastanza in fretta da contare. Meno page, sonno migliore, decisioni più chiare.' },
        { type: 'heading', level: 2, content: 'Scegli SLI che gli utenti sentono' },
        { type: 'paragraph', content: 'Una buona SLI è un rapporto tra eventi buoni ed eventi totali, misurato dove l\'utente lo vive. Disponibilità = richieste riuscite / richieste totali. Latenza = richieste sotto una soglia / totali. Evitate proxy infrastrutturali (CPU, memoria) come SLI—sono cause, non sintomi. Iniziate con due o tre SLO per servizio critico, non venti.' },
        { type: 'heading', level: 2, content: 'Recording rule per gli SLO' },
        { type: 'paragraph', content: 'Calcolate il rapporto di errore una volta con recording rule, così dashboard e alert condividono la stessa fonte di verità e restano economici da interrogare su larga scala.' },
        { type: 'code', language: 'yaml', code: `groups:
  - name: slo-api-availability
    rules:
      - record: job:http_requests:rate5m
        expr: sum(rate(http_requests_total{job="api"}[5m]))
      - record: job:http_errors:rate5m
        expr: sum(rate(http_requests_total{job="api",code=~"5.."}[5m]))
      - record: job:slo_error_ratio:ratio5m
        expr: job:http_errors:rate5m / job:http_requests:rate5m` },
        { type: 'heading', level: 2, content: 'Alert multi-window e multi-burn-rate' },
        { type: 'paragraph', content: 'Il pattern SRE di Google: fai page solo quando una finestra breve E una lunga mostrano entrambe un consumo rapido del budget. Così prendi in fretta gli incidenti reali ignorando i blip brevi. Per uno SLO del 99,9%, un burn rate di 14,4x esaurisce il 2% del budget mensile in un\'ora—degno di page.' },
        { type: 'code', language: 'yaml', code: `- alert: ErrorBudgetBurnFast
  expr: |
    job:slo_error_ratio:ratio5m > (14.4 * 0.001)
    and
    job:slo_error_ratio:ratio1h > (14.4 * 0.001)
  for: 2m
  labels:
    severity: page` },
        { type: 'heading', level: 2, content: 'La policy dell\'error budget' },
        { type: 'paragraph', content: 'Lo SLO è utile solo se il budget ha conseguenze. Concordate in anticipo: finché resta budget, si rilasciano feature velocemente; quando è esaurito, si congelano le modifiche rischiose e si dà priorità al lavoro di affidabilità. Quella policy scritta trasforma l\'osservabilità da dashboard a framework decisionale per l\'ingegneria.' },
      ],
    },
  },
  'devsecops-supply-chain-security': {
    en: {
      title: 'Securing the Software Supply Chain: SBOMs, Signing, and Policy-as-Code',
      description: 'A practical DevSecOps pipeline: shift-left scanning, SBOM generation, artifact signing with Sigstore, and admission policies that actually block bad deploys.',
      content: [
        { type: 'paragraph', content: 'After Log4Shell and SolarWinds, "trust your dependencies" stopped being a strategy. Modern DevSecOps assumes any artifact could be compromised and builds verifiable trust into the pipeline: know what is in your software, prove where it came from, and refuse to run anything unverified.' },
        { type: 'heading', level: 2, content: 'Shift left, but keep the gate' },
        { type: 'paragraph', content: 'Run SAST (Semgrep, CodeQL) and dependency scanning (Grype, Trivy, Dependabot) on every pull request, and fail the build on high/critical findings that have a fix. Shift-left without a blocking gate is just noise—developers learn to ignore warnings that never stop a merge.' },
        { type: 'heading', level: 2, content: 'SBOM and provenance' },
        { type: 'paragraph', content: 'A Software Bill of Materials lists every component in an artifact. Generate it at build time, attach it to the image as an attestation, and store it so you can answer "are we affected by CVE-XXXX?" in minutes instead of days.' },
        { type: 'code', language: 'bash', code: `# Generate an SBOM and scan it
syft packages ghcr.io/acme/api:1.4.2 -o spdx-json > sbom.spdx.json
grype sbom:sbom.spdx.json --fail-on high

# Sign the image and attach the SBOM as an attestation (keyless)
cosign sign ghcr.io/acme/api:1.4.2
cosign attest --predicate sbom.spdx.json --type spdxjson ghcr.io/acme/api:1.4.2` },
        { type: 'heading', level: 2, content: 'Sign and verify everything' },
        { type: 'paragraph', content: 'Sigstore/cosign keyless signing binds an artifact to the identity that built it (e.g. a GitHub Actions workflow) via short-lived certificates and a transparency log—no long-lived keys to leak. The signature is only useful if something verifies it, which is where admission control comes in.' },
        { type: 'heading', level: 2, content: 'Enforce at admission with policy-as-code' },
        { type: 'paragraph', content: 'Kyverno or OPA/Gatekeeper verify signatures and policies at the Kubernetes admission webhook, rejecting unsigned or non-compliant images before they ever run. This is the gate that makes the rest of the chain enforceable rather than advisory.' },
        { type: 'code', language: 'yaml', code: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-signed-images
spec:
  validationFailureAction: Enforce
  rules:
    - name: verify-signature
      match:
        any:
          - resources:
              kinds: ["Pod"]
      verifyImages:
        - imageReferences: ["ghcr.io/acme/*"]
          attestors:
            - entries:
                - keyless:
                    issuer: "https://token.actions.githubusercontent.com"
                    subject: "https://github.com/acme/*"` },
      ],
    },
    it: {
      title: 'Mettere in sicurezza la supply chain software: SBOM, firma e policy-as-code',
      description: 'Una pipeline DevSecOps pratica: scanning shift-left, generazione SBOM, firma degli artefatti con Sigstore e admission policy che bloccano davvero i deploy pericolosi.',
      content: [
        { type: 'paragraph', content: 'Dopo Log4Shell e SolarWinds, "fidati delle tue dipendenze" ha smesso di essere una strategia. Il DevSecOps moderno assume che qualsiasi artefatto possa essere compromesso e costruisce fiducia verificabile nella pipeline: sapere cosa c\'è nel software, provare da dove viene e rifiutarsi di eseguire qualcosa di non verificato.' },
        { type: 'heading', level: 2, content: 'Shift left, ma tieni il cancello' },
        { type: 'paragraph', content: 'Eseguite SAST (Semgrep, CodeQL) e scanning delle dipendenze (Grype, Trivy, Dependabot) su ogni pull request, e fate fallire la build sui finding high/critical che hanno un fix. Lo shift-left senza un gate bloccante è solo rumore—gli sviluppatori imparano a ignorare warning che non fermano mai un merge.' },
        { type: 'heading', level: 2, content: 'SBOM e provenance' },
        { type: 'paragraph', content: 'Un Software Bill of Materials elenca ogni componente di un artefatto. Generatelo al build, allegatelo all\'immagine come attestazione e archiviatelo per rispondere a "siamo colpiti dalla CVE-XXXX?" in minuti invece che in giorni.' },
        { type: 'code', language: 'bash', code: `# Genera un SBOM e scansionalo
syft packages ghcr.io/acme/api:1.4.2 -o spdx-json > sbom.spdx.json
grype sbom:sbom.spdx.json --fail-on high

# Firma l'immagine e allega l'SBOM come attestazione (keyless)
cosign sign ghcr.io/acme/api:1.4.2
cosign attest --predicate sbom.spdx.json --type spdxjson ghcr.io/acme/api:1.4.2` },
        { type: 'heading', level: 2, content: 'Firma e verifica tutto' },
        { type: 'paragraph', content: 'La firma keyless di Sigstore/cosign lega un artefatto all\'identità che l\'ha costruito (es. un workflow GitHub Actions) tramite certificati a vita breve e un transparency log—nessuna chiave a lunga vita da far trapelare. La firma è utile solo se qualcosa la verifica, ed è qui che entra l\'admission control.' },
        { type: 'heading', level: 2, content: 'Enforcement in admission con policy-as-code' },
        { type: 'paragraph', content: 'Kyverno o OPA/Gatekeeper verificano firme e policy al webhook di admission di Kubernetes, rifiutando immagini non firmate o non conformi prima che vengano eseguite. È il cancello che rende il resto della catena vincolante invece che consultivo.' },
        { type: 'code', language: 'yaml', code: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-signed-images
spec:
  validationFailureAction: Enforce
  rules:
    - name: verify-signature
      match:
        any:
          - resources:
              kinds: ["Pod"]
      verifyImages:
        - imageReferences: ["ghcr.io/acme/*"]
          attestors:
            - entries:
                - keyless:
                    issuer: "https://token.actions.githubusercontent.com"
                    subject: "https://github.com/acme/*"` },
      ],
    },
  },
  'platform-engineering-gitops-argocd': {
    en: {
      title: 'Platform Engineering with GitOps: Golden Paths on Argo CD',
      description: 'Building an internal developer platform where self-service templates and Argo CD reconciliation replace ticket-driven ops—without turning developers into cluster admins.',
      content: [
        { type: 'paragraph', content: 'Platform engineering is DevOps that scales past a handful of teams. Instead of every squad reinventing pipelines and YAML, a small platform team ships a "paved road": self-service, opinionated, and safe by default. GitOps is the delivery mechanism that makes it auditable and self-healing.' },
        { type: 'heading', level: 2, content: 'From tickets to a paved road' },
        { type: 'paragraph', content: 'The failure mode of central ops is the ticket queue: developers wait, ops context-switches, nobody is happy. The platform inverts it—developers describe intent in Git (a new service, a new environment), and automation provisions it. Ops moves from doing the work to owning the guardrails.' },
        { type: 'heading', level: 2, content: 'App-of-apps and ApplicationSets' },
        { type: 'paragraph', content: 'Argo CD ApplicationSets generate an Application per service or environment from a single template, so onboarding a new service is a folder in Git—not a copy-pasted manifest. Reconciliation with self-heal means drift is corrected automatically and the cluster always matches Git.' },
        { type: 'code', language: 'yaml', code: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: tenant-services
spec:
  generators:
    - git:
        repoURL: https://github.com/acme/platform
        revision: main
        directories:
          - path: "services/*"
  template:
    metadata:
      name: "{{path.basename}}"
    spec:
      project: tenants
      source:
        repoURL: https://github.com/acme/platform
        targetRevision: main
        path: "{{path}}"
      destination:
        server: https://kubernetes.default.svc
        namespace: "{{path.basename}}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true` },
        { type: 'heading', level: 2, content: 'Golden paths, not golden cages' },
        { type: 'paragraph', content: 'Scaffolding tools (Backstage, cookiecutter templates) generate a new service with CI, Dockerfile, Helm chart, SLOs, and dashboards already wired. The path is opinionated but not mandatory—teams with special needs can step off it. A platform that forbids escape hatches becomes shadow IT within a quarter.' },
        { type: 'heading', level: 2, content: 'Progressive delivery and guardrails' },
        { type: 'paragraph', content: 'Argo Rollouts adds canary and blue/green on top of GitOps, promoting on real metrics (error rate, latency) and rolling back automatically when an analysis run fails. Combined with policy-as-code and RBAC scoped per tenant, developers get speed and the platform keeps the blast radius small.' },
      ],
    },
    it: {
      title: 'Platform Engineering con GitOps: golden path su Argo CD',
      description: 'Costruire una piattaforma interna per sviluppatori dove template self-service e riconciliazione Argo CD sostituiscono le ops a colpi di ticket—senza trasformare gli sviluppatori in admin del cluster.',
      content: [
        { type: 'paragraph', content: 'La platform engineering è il DevOps che scala oltre una manciata di team. Invece che ogni squad reinventi pipeline e YAML, un piccolo team di piattaforma rilascia una "strada asfaltata": self-service, con opinioni e sicura di default. GitOps è il meccanismo di delivery che la rende auditabile e self-healing.' },
        { type: 'heading', level: 2, content: 'Dai ticket alla strada asfaltata' },
        { type: 'paragraph', content: 'Il fallimento delle ops centralizzate è la coda dei ticket: gli sviluppatori aspettano, le ops fanno context-switch, nessuno è contento. La piattaforma lo ribalta—gli sviluppatori descrivono l\'intento in Git (un nuovo servizio, un nuovo ambiente) e l\'automazione lo provisiona. Le ops passano dal fare il lavoro a possedere i guardrail.' },
        { type: 'heading', level: 2, content: 'App-of-apps e ApplicationSet' },
        { type: 'paragraph', content: 'Gli ApplicationSet di Argo CD generano una Application per servizio o ambiente da un singolo template, così onboardare un nuovo servizio è una cartella in Git—non un manifest copiato e incollato. La riconciliazione con self-heal significa che il drift viene corretto automaticamente e il cluster corrisponde sempre a Git.' },
        { type: 'code', language: 'yaml', code: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: tenant-services
spec:
  generators:
    - git:
        repoURL: https://github.com/acme/platform
        revision: main
        directories:
          - path: "services/*"
  template:
    metadata:
      name: "{{path.basename}}"
    spec:
      project: tenants
      source:
        repoURL: https://github.com/acme/platform
        targetRevision: main
        path: "{{path}}"
      destination:
        server: https://kubernetes.default.svc
        namespace: "{{path.basename}}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true` },
        { type: 'heading', level: 2, content: 'Golden path, non gabbie dorate' },
        { type: 'paragraph', content: 'Gli strumenti di scaffolding (Backstage, template cookiecutter) generano un nuovo servizio con CI, Dockerfile, Helm chart, SLO e dashboard già collegati. Il percorso ha opinioni ma non è obbligatorio—i team con necessità speciali possono uscirne. Una piattaforma che vieta le vie di fuga diventa shadow IT nel giro di un trimestre.' },
        { type: 'heading', level: 2, content: 'Progressive delivery e guardrail' },
        { type: 'paragraph', content: 'Argo Rollouts aggiunge canary e blue/green sopra il GitOps, promuovendo su metriche reali (error rate, latenza) e facendo rollback automatico quando un\'analisi fallisce. Combinato con policy-as-code e RBAC per tenant, gli sviluppatori ottengono velocità e la piattaforma mantiene piccolo il raggio d\'impatto.' },
      ],
    },
  },
  'finops-kubernetes-cost-optimization': {
    en: {
      title: 'FinOps for Kubernetes: Cutting Cloud Spend Without Cutting Reliability',
      description: 'Where Kubernetes money actually goes, how to rightsize with real data, and the spot + autoscaling patterns that cut 40–60% without hurting your SLOs.',
      content: [
        { type: 'paragraph', content: 'Kubernetes makes it trivially easy to waste money: over-generous requests, idle namespaces, and always-on nodes hide inside a bill nobody can attribute. FinOps brings the accountability back—make cost visible per team and feature, then optimize with data instead of guesswork.' },
        { type: 'heading', level: 2, content: 'You cannot cut what you cannot see' },
        { type: 'paragraph', content: 'Start with allocation. OpenCost or Kubecost break the cluster bill down by namespace, workload, and label, enabling showback (and eventually chargeback) per team. Enforce a tagging/labeling standard so every pod maps to an owner and a cost center—untagged spend is where budgets go to die.' },
        { type: 'heading', level: 2, content: 'Rightsizing with real data' },
        { type: 'paragraph', content: 'The biggest Kubernetes waste is the gap between requested and used resources. Set requests from observed p95 usage, not from a copied template. VPA in recommendation mode surfaces the right values without acting on them, so you can review before applying.' },
        { type: 'code', language: 'bash', code: `# Actual usage vs requests — the gap is wasted money
kubectl top pods -A --sum=true

# VPA recommendation (recommender mode, does not mutate)
kubectl get vpa api -o jsonpath="{.status.recommendation.containerRecommendations[0].target}"` },
        { type: 'heading', level: 2, content: 'Spot instances and Karpenter consolidation' },
        { type: 'paragraph', content: 'Fault-tolerant and stateless workloads belong on spot/preemptible nodes at 60–90% discount. Karpenter provisions the cheapest instance types that fit pending pods and consolidates underused nodes automatically. Protect availability with PodDisruptionBudgets and spread across capacity types so a spot reclaim never takes a whole service down.' },
        { type: 'heading', level: 2, content: 'Kill idle and zombie spend' },
        { type: 'paragraph', content: 'Scale non-production namespaces to zero outside working hours (KEDA cron or a simple controller). Delete orphaned PersistentVolumes, unattached load balancers, and old snapshots—storage and networking are the silent line items. A weekly automated waste report, sent to the owning team, keeps entropy in check far better than a one-off cleanup.' },
      ],
    },
    it: {
      title: 'FinOps per Kubernetes: tagliare la spesa cloud senza tagliare l\'affidabilità',
      description: 'Dove finiscono davvero i soldi su Kubernetes, come fare rightsizing con dati reali e i pattern spot + autoscaling che tagliano il 40–60% senza intaccare gli SLO.',
      content: [
        { type: 'paragraph', content: 'Kubernetes rende banalmente facile sprecare soldi: request troppo generose, namespace idle e nodi sempre accesi si nascondono dentro una bolletta che nessuno riesce ad attribuire. Il FinOps riporta la responsabilità—rendi il costo visibile per team e feature, poi ottimizza con i dati invece che a intuito.' },
        { type: 'heading', level: 2, content: 'Non puoi tagliare ciò che non vedi' },
        { type: 'paragraph', content: 'Si parte dall\'allocazione. OpenCost o Kubecost scompongono la bolletta del cluster per namespace, workload ed etichetta, abilitando lo showback (e poi il chargeback) per team. Imponete uno standard di tagging/labeling così ogni pod mappa a un owner e a un cost center—la spesa non taggata è dove muoiono i budget.' },
        { type: 'heading', level: 2, content: 'Rightsizing con dati reali' },
        { type: 'paragraph', content: 'Lo spreco più grande su Kubernetes è il divario tra risorse richieste e usate. Impostate le request dall\'uso p95 osservato, non da un template copiato. VPA in modalità recommendation mostra i valori giusti senza agire, così potete rivedere prima di applicare.' },
        { type: 'code', language: 'bash', code: `# Uso reale vs request — il divario sono soldi sprecati
kubectl top pods -A --sum=true

# Raccomandazione VPA (modalita recommender, non muta nulla)
kubectl get vpa api -o jsonpath="{.status.recommendation.containerRecommendations[0].target}"` },
        { type: 'heading', level: 2, content: 'Istanze spot e consolidamento con Karpenter' },
        { type: 'paragraph', content: 'I workload fault-tolerant e stateless stanno su nodi spot/preemptible con sconti del 60–90%. Karpenter provisiona i tipi di istanza più economici che ospitano i pod in attesa e consolida automaticamente i nodi sottoutilizzati. Proteggete la disponibilità con PodDisruptionBudget e distribuzione tra tipi di capacità, così un reclaim spot non abbatte mai un intero servizio.' },
        { type: 'heading', level: 2, content: 'Elimina spesa idle e zombie' },
        { type: 'paragraph', content: 'Scalate a zero i namespace non-produttivi fuori dall\'orario di lavoro (cron KEDA o un semplice controller). Cancellate PersistentVolume orfani, load balancer non collegati e vecchi snapshot—storage e networking sono le voci silenziose. Un report settimanale automatico degli sprechi, inviato al team owner, tiene a bada l\'entropia molto meglio di una pulizia una tantum.' },
      ],
    },
  },
};

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
export function getRelatedArticles(slug: string, locale: Locale, limit = 3): Article[] {
  const current = getArticle(slug, locale);
  if (!current) return [];
  const currentTags = new Set(current.tags);

  return getArticles(locale)
    .filter((candidate) => candidate.slug !== slug)
    .map((candidate) => ({
      article: candidate,
      shared: candidate.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || +new Date(b.article.date) - +new Date(a.article.date))
    .slice(0, limit)
    .map(({ article }) => article);
}
