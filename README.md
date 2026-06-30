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
```

Commit, push - done! No need to create manifest files.

## Structure

```
.
├── Chart.yaml                      # Root chart
├── values.yaml                     # Operator configuration
├── templates/
│   └── applications.yaml          # Creates ArgoCD Applications (loop)
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

## Testing

```bash
# See what ArgoCD Applications get created
helm template test .

# Test the generic subscription chart
helm template test operator-subscription/ \
  --set name=my-operator \
  --set channel=stable
```
