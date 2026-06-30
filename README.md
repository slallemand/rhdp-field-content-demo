# RHDP Field Content - Simple OLM Operators

Deploy OLM operators to RHDP clusters using GitOps.

## Quick Start

1. **Edit `values.yaml`** to enable operators:
   ```yaml
   operators:
     openshift-pipelines:
       enabled: true
   ```

2. **Deploy to RHDP**:
   - Order "Field Content CI" from RHDP catalog
   - Provide this repo URL
   - RHDP deploys automatically

## Add a New Operator

1. **Add to `values.yaml`**:
   ```yaml
   operators:
     my-operator:
       enabled: true
       name: my-operator-name
       channel: stable
       source: redhat-operators
       namespace: openshift-operators
   ```

2. **Create manifest directory**:
   ```bash
   mkdir -p manifests/my-operator
   ```

3. **Create `manifests/my-operator/subscription.yaml`**:
   ```yaml
   apiVersion: operators.coreos.com/v1alpha1
   kind: Subscription
   metadata:
     name: my-operator-name
     namespace: openshift-operators
   spec:
     channel: stable
     name: my-operator-name
     source: redhat-operators
     sourceNamespace: openshift-marketplace
     installPlanApproval: Automatic
   ```

4. **Commit and push** - ArgoCD deploys automatically

## Structure

```
.
├── Chart.yaml                        # Helm chart definition
├── values.yaml                       # Operator configuration
├── templates/
│   └── operators.yaml               # Creates ArgoCD Applications
└── manifests/
    └── openshift-pipelines/
        └── subscription.yaml        # OLM Subscription manifest
```

## Testing

```bash
# Validate chart
helm lint .

# See what gets deployed
helm template test .
```

That's it!
