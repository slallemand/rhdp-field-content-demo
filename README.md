# RHDP Field Content Demo

Automatic deployment of OpenShift Pipelines and other components to Red Hat Demo Platform (RHDP) using GitOps.

## Quick Start

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/slallemand/rhdp-field-content-demo.git
   cd rhdp-field-content-demo
   ```

2. **Customize components** (optional)
   
   Edit `values.yaml` to enable/disable components or modify configuration:
   ```yaml
   components:
     openshift-pipelines:
       enabled: true
       subscription:
         channel: latest
   ```

3. **Deploy to RHDP**
   - Log into Red Hat Demo Platform
   - Order the **Field Content CI** catalog item
   - Provide your repository URL: `https://github.com/YOUR-USERNAME/rhdp-field-content-demo.git`
   - Wait for RHDP to provision the cluster and deploy via ArgoCD

4. **Verify deployment**
   ```bash
   # Check ArgoCD Applications
   kubectl get applications -n openshift-gitops
   
   # Check OpenShift Pipelines operator
   kubectl get csv -n openshift-operators | grep pipelines
   ```

## Architecture

This repository uses the **App of Apps** pattern:

```
RHDP deploys: argocd/ chart
    ↓
Creates: field-content-root Application  
    ↓
Deploys: Root chart with all components
    ↓
Creates: Individual component Applications
    ↓
Deploys: OpenShift Pipelines, etc.
```

### Directory Structure

- `argocd/` - Entry point chart deployed by RHDP
- `Chart.yaml` + `values.yaml` - Root "App of Apps" chart
- `templates/` - ArgoCD Application templates for components
- `components/` - Individual component Helm charts
  - `openshift-pipelines/` - OpenShift Pipelines operator deployment

## Adding Components

1. Create a new Helm chart under `components/my-component/`
2. Add configuration to `values.yaml`
3. Add ArgoCD Application template to `templates/applications.yaml`

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions.

## Available Components

- **openshift-pipelines** - OpenShift Pipelines (Tekton) operator via OLM

## Configuration

All component configuration is managed through the root `values.yaml`:

```yaml
components:
  openshift-pipelines:
    enabled: true
    namespace: openshift-operators
    subscription:
      channel: latest
      installPlanApproval: Automatic
      source: redhat-operators
```

## Testing Locally

```bash
# Validate all charts
helm lint argocd/
helm lint .
helm lint components/openshift-pipelines/

# Render templates to see generated YAML
helm template field-content argocd/
helm template field-content-demo .
```

## Resources

- [Field Sourced Content Template](https://github.com/rhpds/field-sourced-content-template) - Official RHDP template
- [CLAUDE.md](./CLAUDE.md) - Development guide for AI assistants
- [Red Hat Demo Platform](https://demo.redhat.com) - RHDP portal

## License

This is a demo repository for RHDP field content deployment.
