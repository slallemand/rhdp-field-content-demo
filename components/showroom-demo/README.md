# Showroom Demo Helm Chart

Deploys Showroom demo content "How to customise your own demo on RHDP" on OpenShift.

## Overview

This Helm chart deploys a Showroom instance that serves interactive demo content about creating custom RHDP demos using GitOps.

## Architecture

```
┌─────────────────────────────────────────┐
│         ArgoCD Application              │
│  (created by parent chart)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Helm Chart: showroom-demo          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  InitContainer: git-clone         │  │
│  │  - Clone repo                     │  │
│  │  - Checkout branch                │  │
│  │  - Copy showroom-content/         │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Container: showroom              │  │
│  │  - Serves Antora content          │  │
│  │  - Port 8080                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Resources:                             │
│  - Deployment                           │
│  - Service (ClusterIP)                  │
│  - Route (with TLS)                     │
│  - Secret (user credentials)            │
└─────────────────────────────────────────┘
```

## Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of Showroom pods | `1` |
| `image.repository` | Showroom container image | `quay.io/rhpds/showroom` |
| `image.tag` | Image tag | `0.1.9` |
| `content.gitUrl` | Git repository URL | `https://github.com/slallemand/rhdp-field-content-demo.git` |
| `content.gitRef` | Git branch/tag | `main` |
| `content.contentPath` | Path to showroom-content/ in repo | `showroom-content` |
| `deployer.apiUrl` | OpenShift API URL (RHDP injected) | `""` |
| `deployer.domain` | OpenShift ingress domain (RHDP injected) | `""` |
| `userInfo.user` | OpenShift username | `admin` |
| `userInfo.password` | OpenShift password (RHDP injected) | `""` |
| `route.enabled` | Create OpenShift Route | `true` |
| `route.tls.enabled` | Enable TLS on Route | `true` |
| `labels.demo.redhat.com/application` | Required RHDP label | `field-content` |

## Deployment

### Via RHDP Field Content CI (Recommended)

1. Order "Field Content CI" from RHDP catalog
2. Provide this repository URL
3. RHDP automatically creates ArgoCD Application
4. Showroom deploys automatically via the parent chart

### Manual deployment (testing)

```bash
# Set your cluster domain
DOMAIN="apps.cluster-abc123.example.com"

# Install the chart
helm install showroom-demo . \
  --create-namespace \
  --namespace field-content-demo \
  --set deployer.domain=$DOMAIN \
  --set deployer.apiUrl=https://api.cluster-abc123.example.com:6443
```

### Test locally before deploying

```bash
# Lint the chart
helm lint .

# Render templates to verify
helm template showroom-demo . \
  --set deployer.domain=apps.example.com \
  --set deployer.apiUrl=https://api.example.com:6443

# Validate against OpenShift
oc create --dry-run=client -f <(helm template showroom-demo . \
  --set deployer.domain=$(oc get ingresses.config cluster -o jsonpath='{.spec.domain}') \
  --set deployer.apiUrl=$(oc whoami --show-server))
```

## Access

Once deployed, access Showroom at:

```
https://showroom-demo-field-content-demo.apps.<CLUSTER_DOMAIN>
```

Or find the route:

```bash
oc get route showroom-demo -n field-content-demo
```

## Environment Variables

The Showroom container receives these environment variables:

- `OPENSHIFT_CONSOLE_URL`: Auto-generated from `deployer.domain`
- `OPENSHIFT_API_URL`: Passed from `deployer.apiUrl`
- `USER`: OpenShift username
- `PASSWORD`: OpenShift password (from Secret)
- `GUID`: User GUID for multi-user environments

These are used by the Showroom content for dynamic values.

## GitOps Flow

1. **Init Container** clones the Git repository at pod startup
2. Checks out the specified branch (`content.gitRef`)
3. Copies `showroom-content/` to `/content`
4. **Main Container** serves the Antora-generated content
5. ArgoCD monitors the Git repo for changes
6. On commit, ArgoCD recreates pods to pull latest content

## RHDP Label Requirement

All resources include the required label:

```yaml
metadata:
  labels:
    demo.redhat.com/application: "field-content"
```

This enables RHDP to:
- Monitor deployment health
- Track resource usage
- Manage lifecycle
- Report status back to the catalog

## Troubleshooting

### Pod stuck in Init:0/1

Check init container logs:

```bash
oc logs -n field-content-demo deployment/showroom-demo -c git-clone
```

Common issues:
- Git URL unreachable
- Branch doesn't exist
- Repository is private (requires auth)

### Route not accessible

Check route status:

```bash
oc get route showroom-demo -n field-content-demo -o yaml
```

Verify `deployer.domain` is correctly set:

```bash
helm get values showroom-demo -n field-content-demo
```

### Content not updating

ArgoCD auto-sync is enabled. Force sync:

```bash
# Via ArgoCD CLI
argocd app sync showroom-demo

# Via OpenShift console
# Navigate to: ArgoCD UI → Applications → showroom-demo → Sync
```

Or delete the pod to trigger re-clone:

```bash
oc delete pod -n field-content-demo -l app.kubernetes.io/name=showroom-demo
```

## Uninstall

```bash
helm uninstall showroom-demo -n field-content-demo
```

Or delete the ArgoCD Application (if using App of Apps):

```bash
oc delete application showroom-demo -n openshift-gitops
```

## License

Red Hat documentation standards and best practices.
