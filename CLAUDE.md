# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository provides field-sourced content for Red Hat Demo Platform (RHDP) using the **App of Apps** GitOps pattern. It automatically deploys OpenShift Pipelines and other components to RHDP-provisioned OpenShift clusters via ArgoCD.

Based on: https://github.com/rhpds/field-sourced-content-template

## Repository Structure

```
.
├── argocd/                    # Entry point - deployed by RHDP Field Content CI
│   ├── Chart.yaml
│   ├── values.yaml           # RHDP injects deployer.* and gitops.* values here
│   └── templates/
│       └── root-application.yaml  # Creates the root ArgoCD Application
│
├── Chart.yaml                # Root Helm chart - App of Apps
├── values.yaml              # Component configuration
├── templates/
│   └── applications.yaml    # Generates ArgoCD Applications for each component
│
└── components/              # Individual component Helm charts
    └── openshift-pipelines/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
            └── subscription.yaml
```

## Architecture: App of Apps Pattern

This repository implements a **three-layer ArgoCD deployment**:

### Layer 1: RHDP Field Content CI
- User orders "Field Content CI" from RHDP catalog with this repository URL
- RHDP deploys the `argocd/` Helm chart
- RHDP injects cluster-specific values: `deployer.apiUrl`, `deployer.domain`, `gitops.*`

### Layer 2: Root Application
- `argocd/templates/root-application.yaml` creates an ArgoCD Application named `field-content-root`
- This Application deploys the root Helm chart (`.` path in repo)
- Labeled with `demo.redhat.com/application: "field-content"` for RHDP health monitoring

### Layer 3: Component Applications
- Root chart's `templates/applications.yaml` generates ArgoCD Applications per enabled component
- Each Application deploys a component chart from `components/`
- Components can be enabled/disabled via `values.yaml`

### Deployment Flow

```
RHDP Field Content CI
    ↓
argocd/ chart (entry point)
    ↓
Creates: field-content-root Application
    ↓
Deploys: Root chart (Chart.yaml + values.yaml)
    ↓
Creates: Component Applications (from templates/applications.yaml)
    ↓
Deploys: Individual components (from components/*)
```

## Working with This Repository

### Testing Helm Charts Locally

```bash
# Validate the entry point chart
helm lint argocd/

# Validate the root chart
helm lint .

# Validate a component chart
helm lint components/openshift-pipelines/

# Render the entry point to see what ArgoCD Application gets created
helm template field-content argocd/ \
  --set gitops.repoURL=https://github.com/slallemand/rhdp-field-content-demo.git \
  --set deployer.apiUrl=https://api.example.com:6443 \
  --set deployer.domain=apps.example.com

# Render the root chart to see what component Applications get created
helm template field-content-demo . \
  --set gitops.repoURL=https://github.com/slallemand/rhdp-field-content-demo.git

# Render a specific component
helm template openshift-pipelines components/openshift-pipelines/
```

### Adding a New Component

1. Create a new Helm chart under `components/`:
   ```bash
   mkdir -p components/my-component/templates
   ```

2. Create `components/my-component/Chart.yaml` and `values.yaml`

3. Add component configuration to root `values.yaml`:
   ```yaml
   components:
     my-component:
       enabled: true
       namespace: my-namespace
       # component-specific values
   ```

4. Add ArgoCD Application template to `templates/applications.yaml`:
   ```yaml
   {{- if .Values.components.my-component.enabled }}
   ---
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: {{ .Release.Name }}-my-component
     namespace: {{ .Values.argocd.namespace }}
     labels:
       demo.redhat.com/application: "field-content"
   # ... rest of Application spec
   {{- end }}
   ```

### Configuring Components

All component configuration is in the root `values.yaml`:

```yaml
components:
  openshift-pipelines:
    enabled: true              # Set to false to disable
    namespace: openshift-operators
    subscription:
      channel: latest          # Operator channel
      installPlanApproval: Automatic
      startingCSV: ""         # Pin to specific version if needed
```

### Required Labels for RHDP Integration

All ArgoCD Applications **must** include this label:

```yaml
metadata:
  labels:
    demo.redhat.com/application: "field-content"
```

This enables RHDP health monitoring and platform integration.

### Deploying to RHDP

1. Push changes to your GitHub repository
2. Order "Field Content CI" from RHDP catalog
3. Provide your repository URL: `https://github.com/slallemand/rhdp-field-content-demo.git`
4. RHDP will:
   - Deploy `argocd/` chart with injected cluster values
   - ArgoCD will auto-sync and deploy all enabled components

### Sync Policy

All ArgoCD Applications are configured with:
- **Automated sync**: Changes are auto-deployed
- **Prune**: Resources removed from Git are deleted from cluster  
- **SelfHeal**: Manual cluster changes are reverted to match Git

## Common Tasks

### Changing Operator Version

Edit `values.yaml`:
```yaml
components:
  openshift-pipelines:
    subscription:
      channel: stable          # Change from 'latest'
      startingCSV: "openshift-pipelines-operator.v1.14.0"  # Pin version
```

### Disabling a Component

Edit `values.yaml`:
```yaml
components:
  openshift-pipelines:
    enabled: false
```

### Verifying Deployment on RHDP Cluster

```bash
# Check the entry point Application (deployed by RHDP)
kubectl get application -n openshift-gitops field-content

# Check the root Application
kubectl get application -n openshift-gitops field-content-root

# Check component Applications
kubectl get application -n openshift-gitops -l demo.redhat.com/application=field-content

# Check deployed operator
kubectl get subscription -n openshift-operators openshift-pipelines-operator-rh
kubectl get csv -n openshift-operators | grep pipelines
```

## Development Workflow

1. **Local development**: Test charts with `helm template` and `helm lint`
2. **Push to Git**: Commit and push to GitHub
3. **RHDP deployment**: Order Field Content CI with your repo URL
4. **Verify**: Check ArgoCD Applications and component resources on cluster
5. **Iterate**: Make changes and push - ArgoCD auto-syncs

## LiteMaaS Integration (Optional)

This repository supports LiteMaaS (LLM-as-a-Service) integration. Configure in `argocd/values.yaml` or let RHDP inject:

```yaml
litemaas:
  enabled: true
  apiUrl: https://litemaas.example.com
  apiKey: "your-key"
  model: llama-scout-17b
```
