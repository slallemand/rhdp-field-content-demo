# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains GitOps configurations for deploying OpenShift Pipelines Operator using ArgoCD and Helm. It follows a declarative approach where ArgoCD monitors the repository and automatically syncs changes to the cluster.

## Repository Structure

- `argocd/` - ArgoCD Application definitions that reference Helm charts
- `helm/openshift-pipelines/` - Helm chart for deploying the OpenShift Pipelines Operator via OLM Subscription

## Architecture

### GitOps Workflow

1. ArgoCD Application (`argocd/openshift-pipelines-application.yaml`) points to the Helm chart in this repository
2. The Helm chart creates an OLM Subscription resource
3. OLM installs and manages the OpenShift Pipelines Operator
4. ArgoCD continuously monitors and auto-syncs changes (prune and selfHeal enabled)

### Deployment Target

- **Namespace**: `openshift-operators` (OLM-managed operators namespace)
- **ArgoCD Namespace**: `openshift-gitops`
- **Repository URL**: `https://github.com/slallemand/rhdh-field-content-demo.git`

## Working with This Repository

### Testing Helm Chart Locally

```bash
# Validate Helm chart syntax
helm lint helm/openshift-pipelines

# Render templates to see generated YAML
helm template openshift-pipelines helm/openshift-pipelines

# Render with custom values
helm template openshift-pipelines helm/openshift-pipelines --values custom-values.yaml
```

### Modifying Operator Configuration

All operator configuration is managed through `helm/openshift-pipelines/values.yaml`:

- `subscription.channel` - Operator channel (e.g., "latest", "stable")
- `subscription.installPlanApproval` - "Automatic" or "Manual"
- `subscription.startingCSV` - Optionally pin to specific operator version
- `subscription.source` - Catalog source (default: "redhat-operators")

### ArgoCD Application Sync Policy

The ArgoCD application is configured with:
- **Automated sync**: Changes are auto-deployed
- **Prune**: Resources removed from Git are deleted from cluster
- **SelfHeal**: Cluster changes are reverted to match Git

To temporarily disable auto-sync, edit the syncPolicy in `argocd/openshift-pipelines-application.yaml`.

## Common Tasks

### Adding a New Operator

1. Create a new directory under `helm/` for the operator
2. Create `Chart.yaml`, `values.yaml`, and `templates/subscription.yaml`
3. Create corresponding ArgoCD Application in `argocd/`
4. Use the OpenShift Pipelines structure as a template

### Changing Operator Version

Edit `helm/openshift-pipelines/values.yaml` and set `subscription.startingCSV` to the desired version, or change the `channel` value.

### Verifying Deployment

```bash
# Check ArgoCD application status
kubectl get application -n openshift-gitops openshift-pipelines

# Check subscription status
kubectl get subscription -n openshift-operators openshift-pipelines-operator-rh

# Check installed operator
kubectl get csv -n openshift-operators | grep pipelines
```
