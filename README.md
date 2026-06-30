# RHDP Field Content - OLM Operators (App of Apps)

Deploy OLM operators to RHDP clusters using GitOps and ArgoCD App of Apps pattern.

## Architecture

```
RHDP → Deploys root Helm chart
  ↓
Creates ArgoCD Applications (one per operator)
  ↓
Each Application uses the generic operator-subscription chart
  ↓
Subscriptions created with values from values.yaml
```

## Quick Start

1. **Edit `values.yaml`** to enable operators:
   ```yaml
   operators:
     openshift-pipelines:
       enabled: true
       name: openshift-pipelines-operator-rh
       channel: latest
   ```

2. **Deploy to RHDP**:
   - Order "Field Content CI" from RHDP catalog
   - Provide this repo URL
   - RHDP deploys automatically

## Add a New Operator

Just edit `values.yaml`:

```yaml
operators:
  serverless:
    enabled: true
    name: serverless-operator
    channel: stable
    source: redhat-operators
    namespace: openshift-serverless
    wave: 2  # Deploy order (0 = first)
```

Commit, push - done! No need to create manifest files.

## Structure

```
.
├── Chart.yaml                      # Root chart
├── values.yaml                     # Operator configuration
├── templates/
│   ├── applications.yaml          # Creates ArgoCD Apps for operators (loop)
│   └── helm-charts.yaml           # Creates ArgoCD Apps for Helm charts (loop)
└── operator-subscription/          # Generic chart for OLM subscriptions
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
        └── subscription.yaml
```

## How It Works

1. Root chart loops through `values.yaml` operators
2. For each enabled operator, creates an ArgoCD Application
3. All Applications point to the same `operator-subscription/` chart
4. Each Application passes different Helm parameters (name, channel, etc.)
5. Generic chart renders the OLM Subscription with those parameters

**Result**: One generic chart, reused for all operators!

## Sync Waves

Control deployment order with `wave`:

```yaml
operators:
  gitops:
    wave: 0  # Deploy first
  
  pipelines:
    wave: 1  # Deploy after GitOps is ready
  
  serverless:
    wave: 2  # Deploy last
```

ArgoCD deploys in order: wave 0 → wave 1 → wave 2

## Deploy Helm Charts

You can also deploy any Helm chart:

### From a Git repository (in this repo or external)

```yaml
helmCharts:
  my-app:
    enabled: true
    namespace: demo
    wave: 10
    source:
      repoURL: https://github.com/slallemand/rhdp-field-content-demo.git
      targetRevision: HEAD
      path: charts/my-app
    values:  # Optional
      replicas: 3
      image: my-image:latest
```

### From a Helm repository

```yaml
helmCharts:
  prometheus:
    enabled: true
    namespace: monitoring
    wave: 20
    source:
      repoURL: https://prometheus-community.github.io/helm-charts
      chart: prometheus
      targetRevision: 15.0.0
    values:
      server:
        retention: "30d"
```

Commit, push - ArgoCD deploys automatically!

## Testing

```bash
# See what ArgoCD Applications get created
helm template test .

# Test the generic subscription chart
helm template test operator-subscription/ \
  --set name=my-operator \
  --set channel=stable
```
