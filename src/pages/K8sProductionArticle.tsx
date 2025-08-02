import { ArticlePage } from '@/components/ArticlePage';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/data/translations';
import { Shield, Monitor, AlertTriangle, CheckCircle, Settings, Database } from 'lucide-react';

const K8sProductionArticle = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const content = (
    <div className="space-y-8">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <Shield className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Gestione Cluster in Produzione</h3>
            <p className="text-blue-800">
              La gestione di cluster Kubernetes in produzione richiede un approccio sistematico che include 
              monitoraggio, sicurezza, backup, scaling e disaster recovery. Ecco le best practices essenziali.
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2>1. Architettura di Produzione</h2>
        <div className="space-y-4">
          <p>
            Un cluster di produzione dovrebbe seguire un'architettura multi-node con alta disponibilità:
          </p>
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Architettura raccomandata per produzione
├── Control Plane (3+ nodi)
│   ├── API Server
│   ├── etcd (3+ repliche)
│   ├── Controller Manager
│   └── Scheduler
├── Worker Nodes (3+ nodi)
│   ├── Kubelet
│   ├── Container Runtime
│   └── Kube-proxy
├── Load Balancer
├── Ingress Controller
└── Storage Class`}</code></pre>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Requisiti Minimi
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• 3+ nodi master per HA</li>
                <li>• 3+ nodi worker</li>
                <li>• Load balancer per API server</li>
                <li>• Storage persistente</li>
                <li>• Backup strategy</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Considerazioni Sicurezza
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• RBAC configurato</li>
                <li>• Network policies</li>
                <li>• Pod security policies</li>
                <li>• Secrets management</li>
                <li>• Audit logging</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>2. Monitoraggio e Observability</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Stack di monitoraggio raccomandato
├── Prometheus (metrics collection)
├── Grafana (visualization)
├── AlertManager (alerting)
├── Jaeger (distributed tracing)
├── Fluentd/Fluent Bit (log aggregation)
└── Elasticsearch + Kibana (log storage)

# Metriche essenziali da monitorare
- CPU e Memory usage per nodo
- Disk I/O e network
- Pod restart count
- API server latency
- etcd performance
- Node availability`}</code></pre>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <Monitor className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Alerting Strategy</h3>
                <p className="text-yellow-800">
                  Configura alert per: nodi down, pod crash, resource exhaustion, API server errors, 
                  e metriche di business critiche. Usa escalation policies per notifiche urgenti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>3. Backup e Disaster Recovery</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Backup etcd (critico per il cluster)
ETCDCTL_API=3 etcdctl snapshot save backup.db \\
  --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key

# Backup delle risorse Kubernetes
kubectl get all --all-namespaces -o yaml > cluster-backup.yaml

# Backup dei Persistent Volumes
# Utilizzare snapshot del storage provider

# Script di backup automatizzato
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/kubernetes/$DATE"
mkdir -p $BACKUP_DIR

# Backup etcd
etcdctl snapshot save $BACKUP_DIR/etcd-snapshot.db

# Backup risorse
kubectl get all --all-namespaces -o yaml > $BACKUP_DIR/resources.yaml

# Backup secrets
kubectl get secrets --all-namespaces -o yaml > $BACKUP_DIR/secrets.yaml`}</code></pre>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Backup Strategy</h3>
              <ul className="space-y-2 text-sm">
                <li>• Backup etcd ogni 6 ore</li>
                <li>• Backup risorse ogni giorno</li>
                <li>• Retention policy: 30 giorni</li>
                <li>• Test di restore mensile</li>
                <li>• Backup off-site</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Disaster Recovery</h3>
              <ul className="space-y-2 text-sm">
                <li>• RTO: 4 ore</li>
                <li>• RPO: 6 ore</li>
                <li>• Cluster standby</li>
                <li>• DNS failover</li>
                <li>• Documentazione procedure</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>4. Scaling e Performance</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

# Cluster Autoscaler
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.21.0
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/my-cluster`}</code></pre>
          </div>
        </div>
      </section>

      <section>
        <h2>5. Sicurezza in Produzione</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

# Pod Security Policy
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true`}</code></pre>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Security Checklist</h3>
              <ul className="space-y-2 text-sm">
                <li>• RBAC configurato e testato</li>
                <li>• Network policies applicate</li>
                <li>• Pod security policies</li>
                <li>• Secrets encryption at rest</li>
                <li>• Audit logging abilitato</li>
                <li>• Vulnerability scanning</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li>• GDPR compliance</li>
                <li>• SOC 2 Type II</li>
                <li>• ISO 27001</li>
                <li>• Regular security audits</li>
                <li>• Penetration testing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>6. Operazioni Day-to-Day</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Comandi utili per le operazioni quotidiane

# Verifica stato del cluster
kubectl get nodes
kubectl get pods --all-namespaces
kubectl top nodes
kubectl top pods --all-namespaces

# Log e debugging
kubectl logs -f deployment/my-app
kubectl describe pod <pod-name>
kubectl exec -it <pod-name> -- /bin/bash

# Scaling
kubectl scale deployment my-app --replicas=5
kubectl autoscale deployment my-app --min=2 --max=10 --cpu-percent=80

# Updates e rollbacks
kubectl set image deployment/my-app my-app=nginx:1.21
kubectl rollout status deployment/my-app
kubectl rollout undo deployment/my-app

# Resource management
kubectl get events --sort-by='.lastTimestamp'
kubectl get events --field-selector involvedObject.kind=Pod`}</code></pre>
          </div>
        </div>
      </section>

      <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Best Practices Summary</h3>
            <ul className="text-green-800 space-y-1">
              <li>• Implementa monitoraggio completo con alerting</li>
              <li>• Configura backup automatizzati con test di restore</li>
              <li>• Applica security policies rigorose</li>
              <li>• Usa autoscaling per gestire il carico</li>
              <li>• Documenta tutte le procedure operative</li>
              <li>• Esegui regolarmente test di disaster recovery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ArticlePage
      title={t.k8sProductionTitle}
      description={t.k8sProductionDesc}
      content={content}
      publishDate="20 Gennaio 2025"
      readTime="12 min"
    />
  );
};

export default K8sProductionArticle; 