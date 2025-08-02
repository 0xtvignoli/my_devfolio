import { ArticlePage } from '@/components/ArticlePage';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/data/translations';
import { Code, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const HelmDeployArticle = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const content = (
    <div className="space-y-8">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Cos'è Helm?</h3>
            <p className="text-blue-800">
              Helm è il package manager per Kubernetes che semplifica il deployment e la gestione delle applicazioni. 
              Permette di definire, installare e aggiornare applicazioni Kubernetes complesse.
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2>1. Installazione e Setup</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre><code>{`# Installazione Helm su macOS
brew install helm

# Installazione Helm su Linux
curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/

# Verifica installazione
helm version

# Aggiungere repository ufficiali
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update`}</code></pre>
        </div>
      </section>

      <section>
        <h2>2. Creazione di un Chart Helm</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre><code>{`# Creare un nuovo chart
helm create my-app

# Struttura del chart creato
my-app/
├── Chart.yaml          # Metadati del chart
├── values.yaml         # Valori di default
├── charts/             # Dipendenze
├── templates/          # Template Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl
└── .helmignore`}</code></pre>
        </div>
      </section>

      <section>
        <h2>3. Deploy di un Chart</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Installare un chart
helm install my-release ./my-app

# Installare con valori personalizzati
helm install my-release ./my-app --values custom-values.yaml

# Installare da repository remoto
helm install nginx-ingress bitnami/nginx-ingress-controller

# Verificare lo stato del deployment
helm list
helm status my-release`}</code></pre>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Best Practice</h3>
                <p className="text-yellow-800">
                  Utilizza sempre il flag <code>--dry-run</code> prima di fare deploy in produzione per verificare 
                  i manifesti Kubernetes generati.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>4. Helm Cheat Sheet</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Comandi Base
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm version</code>
                <p className="text-gray-600 mt-1">Verifica versione Helm</p>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm repo list</code>
                <p className="text-gray-600 mt-1">Lista repository configurati</p>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm repo update</code>
                <p className="text-gray-600 mt-1">Aggiorna repository</p>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm search repo nginx</code>
                <p className="text-gray-600 mt-1">Cerca chart nei repository</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Gestione Release
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm list</code>
                <p className="text-gray-600 mt-1">Lista release installate</p>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm upgrade my-release ./my-app</code>
                <p className="text-gray-600 mt-1">Aggiorna una release</p>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm rollback my-release 1</code>
                <p className="text-gray-600 mt-1">Rollback alla versione 1</p>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">helm uninstall my-release</code>
                <p className="text-gray-600 mt-1">Disinstalla una release</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>5. Debug e Troubleshooting</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre><code>{`# Dry run per verificare i manifesti
helm install my-release ./my-app --dry-run --debug

# Verificare i valori che verranno applicati
helm get values my-release

# Visualizzare i manifesti generati
helm get manifest my-release

# Verificare lo stato dettagliato
helm status my-release

# Log di una release
helm get hooks my-release

# Test di un chart
helm test my-release`}</code></pre>
        </div>
      </section>

      <section>
        <h2>6. Values e Configurazione</h2>
        <div className="space-y-4">
          <p>
            I valori in Helm possono essere configurati in diversi modi. Ecco un esempio di <code>values.yaml</code>:
          </p>
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# values.yaml
replicaCount: 3

image:
  repository: nginx
  tag: "1.21"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: my-app.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi`}</code></pre>
          </div>
        </div>
      </section>

      <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Conclusione</h3>
            <p className="text-green-800">
              Helm semplifica notevolmente il deployment di applicazioni su Kubernetes. 
              Con questi comandi e best practices, sarai in grado di gestire efficacemente 
              i tuoi deployment in produzione.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ArticlePage
      title={t.helmDeployTitle}
      description={t.helmDeployDesc}
      content={content}
      publishDate="15 Gennaio 2025"
      readTime="8 min"
    />
  );
};

export default HelmDeployArticle; 