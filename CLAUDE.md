# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is designed for Red Hat Demo Platform (RHDP) field content deployment using GitOps and ArgoCD. RHDP automatically creates an ArgoCD Application pointing to this repository and deploys the Helm chart found here.

Based on: https://github.com/rhpds/field-sourced-content-template

## How RHDP Deployment Works

1. User orders "Field Content CI" from RHDP catalog and provides this repository URL
2. RHDP automatically creates an ArgoCD Application that:
   - Points to this repository (root path)
   - Deploys the Helm chart found here
   - Injects cluster-specific values: `deployer.apiUrl`, `deployer.domain`
3. Your Helm chart can either:
   - Deploy Kubernetes resources directly
   - Create ArgoCD Applications (App of Apps pattern) to deploy multiple components

## Required Labels

All ArgoCD Applications created by your chart must include this label for RHDP health monitoring:

```yaml
metadata:
  labels:
    demo.redhat.com/application: "field-content"
```

## Testing Helm Charts Locally

```bash
# Validate the chart
helm lint .

# Render templates to see what gets deployed
helm template field-content . \
  --set deployer.apiUrl=https://api.example.com:6443 \
  --set deployer.domain=apps.example.com

# Test a specific component in isolation
helm template my-component components/my-component/
```

## Deployment Workflow

1. Make changes to Helm charts
2. Test locally with `helm template` and `helm lint`
3. Commit and push to Git
4. RHDP/ArgoCD automatically syncs and deploys changes

No manual `oc apply` or `helm install` needed - GitOps handles everything.

## Architecture Notes

- RHDP creates the initial ArgoCD Application automatically - you don't create it yourself
- Your chart lives at the repository root (Chart.yaml, values.yaml, templates/)
- If using App of Apps pattern, your chart's templates/ creates additional ArgoCD Applications
- Each Application points to a component chart, typically under components/ directory
